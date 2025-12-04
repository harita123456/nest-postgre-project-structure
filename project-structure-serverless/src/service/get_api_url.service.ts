import { api_urls } from "../interfaces/api_urls.interface";
import { successRes, catchRes } from "../utils/commonFuncResponse";
import { db } from "../database/connection";
interface ServiceResponse<T> {
    success: boolean;
    message: string;
    data?: T | null | [];
    error?: unknown;
}

interface IApiUrl {
    environment: string;
    type?: string;
}

const appVersionsServices = {
    getApiUrlService: async (
        data: IApiUrl,
    ): Promise<ServiceResponse<api_urls>> => {
        try {
            const { environment, type } = data;

            const sql = `
                SELECT environment,url,type
                FROM api_urls
                WHERE is_deleted = FALSE
                    AND environment = $1
                    AND type = $2
                LIMIT 1;
                `;

            const { rows } = await db.query(sql, [environment, type]);

            const apiUrl: api_urls | null = (rows[0] as api_urls) || null;

            if (!apiUrl) {
                return catchRes("API URL not found", null);
            }

            return successRes("API URLs retrieved successfully", apiUrl);
        } catch (error) {
            console.error(
                "❌ Failed to retrive api url",
                error,
            );
            return catchRes("Failed to retrieve API URL", error);
        }
    },
};

export default appVersionsServices;
