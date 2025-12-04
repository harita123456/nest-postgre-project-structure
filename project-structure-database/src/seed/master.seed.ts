import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { sql, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { apiUrls } from '../schema/api_urls.schema';
import { appVersions } from '../schema/app_versions.schema';
import { appContents } from '../schema/app_contents.schema';
import type { NewApiUrl } from '../schema/api_urls.schema';
import type { NewAppVersion } from '../schema/app_versions.schema';
import type { NewAppContent } from '../schema/app_contents.schema';

function findDataDir(): string {
    // Try dist/seed/data when compiled
    const dist = path.resolve(__dirname, 'data');
    if (existsSync(dist)) return dist;
    // Fallback to src/seed/data when running from source in workspace
    const src = path.resolve(__dirname, '../../src/seed/data');
    if (existsSync(src)) return src;
    // Last resort: package root src/seed/data
    const pkgSrc = path.resolve(
        process.cwd(),
        'node_modules/project-structure-database/src/seed/data'
    );
    return pkgSrc;
}

function loadJson<T>(fileName: string): T {
    const base = findDataDir();
    const filePath = path.join(base, fileName);
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
}

export async function seedMasterData(db: NodePgDatabase): Promise<void> {
    // api_urls
    const apiUrlsData = loadJson<Partial<NewApiUrl>[]>('api_urls.json');
    if (apiUrlsData?.length) {
        const rows = apiUrlsData.map((d) => ({
            environment: String(d.environment ?? '').trim(),
            type: d.type ?? 'api',
            url: String(d.url ?? '').trim(),
            is_deleted: Boolean(d.is_deleted ?? false),
        }));
        await db
            .insert(apiUrls)
            .values(rows)
            .onConflictDoUpdate({
                target: [apiUrls.environment, apiUrls.type],
                set: {
                    url: sql`excluded.url`,
                    is_deleted: sql`excluded.is_deleted`,
                    updated_at: sql`now()`,
                },
            });
    }

    // app_versions
    const appVersionsData =
        loadJson<Partial<NewAppVersion>[]>('app_versions.json');
    if (appVersionsData?.length) {
        const rows = appVersionsData.map((d) => ({
            app_version: String(d.app_version ?? '').trim(),
            is_maintenance: Boolean(d.is_maintenance ?? false),
            app_update_status: d.app_update_status,
            app_platform: d.app_platform as NewAppVersion['app_platform'],
            app_url: String(d.app_url ?? '').trim(),
            api_base_url: String(d.api_base_url ?? '').trim(),
            is_live: Boolean(d.is_live ?? true),
            is_deleted: Boolean(d.is_deleted ?? false),
        }));
        await db
            .insert(appVersions)
            .values(rows)
            .onConflictDoUpdate({
                target: [appVersions.app_platform, appVersions.app_version],
                set: {
                    is_maintenance: sql`excluded.is_maintenance`,
                    app_update_status: sql`excluded.app_update_status`,
                    app_url: sql`excluded.app_url`,
                    api_base_url: sql`excluded.api_base_url`,
                    is_live: sql`excluded.is_live`,
                    is_deleted: sql`excluded.is_deleted`,
                    updated_at: sql`now()`,
                },
            });
    }
    const appContentsData =
        loadJson<Partial<NewAppContent>[]>('app_contents.json');
    if (appContentsData?.length) {
        const allowed = [
            'terms_and_condition',
            'privacy_policy',
            'about',
        ] as NewAppContent['content_type'][];
        const rows = appContentsData
            .map((d) => ({
                content_type: d.content_type as NewAppContent['content_type'],
                content: String(d.content ?? '').trim(),
                is_deleted: Boolean(d.is_deleted ?? false),
            }))
            .filter((r) => allowed.includes(r.content_type));
        for (const r of rows) {
            const updated = await db
                .update(appContents)
                .set({
                    content: r.content,
                    is_deleted: r.is_deleted,
                    updated_at: sql`now()`,
                })
                .where(eq(appContents.content_type, r.content_type))
                .returning({ id: appContents.id });
            if (updated.length === 0) {
                await db.insert(appContents).values(r);
            }
        }
    }
}
