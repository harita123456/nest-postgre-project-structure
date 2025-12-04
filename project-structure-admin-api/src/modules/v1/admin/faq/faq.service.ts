import { Injectable } from '@nestjs/common';
import {
    AddFaqDto,
    EditFaqDto,
    DeleteFaqDto,
    ListFaqDto,
    ActiveDeactiveFaqDto,
} from './dto/faq.dto';
import { eq, and, ne, or, ilike, desc, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '../../../../database/connection';
import { faqs, Faq } from 'project-structure-database';
import { escapeRegex } from '../../../../common/regex.common';
import {
    ServiceResponse,
    serviceSuccessPagination,
} from '../../../../common/service-response';
import { logError } from '../../../../utils/logger';
import {
    serviceError,
    serviceSuccess,
    servicecatch,
} from '../../../../common/service-response';

@Injectable()
export class FaqService {
    constructor() {}
    async addFaq(data: AddFaqDto): Promise<ServiceResponse<Faq | null>> {
        try {
            const { question, answer } = data;

            const [find_faq] = await db
                .select()
                .from(faqs)
                .where(
                    and(eq(faqs.question, question), eq(faqs.is_deleted, false))
                )
                .limit(1);

            if (find_faq) {
                return serviceError('FAQ_ALREADY_EXISTS');
            }
            const [insert_faq] = await db
                .insert(faqs)
                .values({ question: question, answer: answer })
                .returning();
            return serviceSuccess('FAQ_ADDED', insert_faq);
        } catch (error) {
            logError('addFaq', error);
            return servicecatch('addFaq', error);
        }
    }

    async editFaq(data: EditFaqDto): Promise<ServiceResponse<Faq | null>> {
        try {
            const { faq_id, question, answer } = data;

            const [find_faq] = await db
                .select()
                .from(faqs)
                .where(and(eq(faqs.id, faq_id), eq(faqs.is_deleted, false)))
                .limit(1);

            if (!find_faq) {
                return serviceError('FAQ_NOT_FOUND');
            }

            const [find_exists_faq] = await db
                .select()
                .from(faqs)
                .where(
                    and(
                        ne(faqs.id, faq_id),
                        eq(faqs.question, question),
                        eq(faqs.is_deleted, false)
                    )
                )
                .limit(1);

            if (find_exists_faq) {
                return serviceError('FAQ_ALREADY_EXISTS');
            }
            const [insert_faq] = await db
                .update(faqs)
                .set({ question: question, answer: answer })
                .where(eq(faqs.id, faq_id))
                .returning();
            return serviceSuccess('FAQ_EDITED', insert_faq);
        } catch (error) {
            logError('editFaq', error);
            return servicecatch('editFaq', error);
        }
    }

    async deleteFaq(data: DeleteFaqDto): Promise<ServiceResponse<Faq | null>> {
        try {
            const { faq_id } = data;

            const [find_faq] = await db
                .select()
                .from(faqs)
                .where(and(eq(faqs.id, faq_id), eq(faqs.is_deleted, false)))
                .limit(1);
            if (!find_faq) {
                return serviceError('FAQ_NOT_FOUND');
            }

            const [delete_faq] = await db
                .update(faqs)
                .set({ is_deleted: true })
                .where(eq(faqs.id, faq_id))
                .returning();
            return serviceSuccess('FAQ_DELETED', delete_faq);
        } catch (error) {
            logError('deleteFaq', error);
            return servicecatch('deleteFaq', error);
        }
    }

    async listFaq(data: ListFaqDto): Promise<ServiceResponse<Faq[]>> {
        try {
            const { search = '', page = 1, limit = 10 } = data;

            const offset = (page - 1) * limit;

            const conditions = [eq(faqs.is_deleted, false)];

            const escapedSearch = search ? escapeRegex(search) : null;

            if (escapedSearch) {
                const searchCondition = or(
                    ilike(faqs.question, `%${escapedSearch}%`),
                    ilike(faqs.answer, `%${escapedSearch}%`)
                );
                if (searchCondition) {
                    conditions.push(searchCondition);
                }
            }

            const whereClause = and(...conditions) as SQL<unknown>;

            const faqsList = await db
                .select()
                .from(faqs)
                .where(whereClause)
                .orderBy(desc(faqs.created_at))
                .limit(limit)
                .offset(offset);

            const [countRow] = await db
                .select({ total: sql<number>`count(*)` })
                .from(faqs)
                .where(whereClause);

            const total = Number(countRow?.total ?? 0);

            return serviceSuccessPagination('FAQ_LIST', faqsList, total);
        } catch (error) {
            logError('listFaq', error);
            return servicecatch('listFaq', error);
        }
    }

    async activeDeactiveFaq(
        data: ActiveDeactiveFaqDto
    ): Promise<ServiceResponse<Faq>> {
        try {
            const { faq_id, is_active } = data;

            const [find_faq] = await db
                .select()
                .from(faqs)
                .where(and(eq(faqs.id, faq_id), eq(faqs.is_deleted, false)))
                .limit(1);

            if (!find_faq) {
                return serviceError('FAQ_NOT_FOUND');
            }

            if (find_faq.is_active === is_active) {
                if (is_active) {
                    return serviceError('FAQ_ALREADY_ACTIVATED');
                }
                return serviceError('FAQ_ALREADY_DEACTIVATED');
            }

            await db.update(faqs).set({ is_active }).where(eq(faqs.id, faq_id));

            if (is_active) {
                return serviceSuccess('FAQ_ACTIVATED', find_faq);
            }

            return serviceSuccess('FAQ_DEACTIVATED', find_faq);
        } catch (error) {
            logError('activeDeactiveFaq', error);
            return servicecatch('activeDeactiveFaq', error);
        }
    }
}
