import * as dotenv from "dotenv";
dotenv.config();
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import express, { Request, Response } from "express";
import appVersionsServices from "./service/get_api_url.service";
import { errorRes, successRes, createRes } from "./utils/commonFuncResponse";
import { verifyAuth } from "./middleware/auth";
import { initializeSecrets, areSecretsInitialized } from "./utils/secrets";
import { api_urls } from "./interfaces/api_urls.interface";

let secretsInitializationPromise: Promise<void> | null = null;

const ensureSecretsInitialized = async (): Promise<void> => {
  if (!areSecretsInitialized()) {
    if (!secretsInitializationPromise) {
      secretsInitializationPromise = initializeSecrets();
    }
    await secretsInitializationPromise;
  }
};

const handleRequest = async (
  params: { environment?: string | null; type?: string | null },
  headers: Record<string, string | undefined>
) => {
  await ensureSecretsInitialized();

  const { status, code, message } = await verifyAuth(headers);
  if (!status) {
    return { statusCode: code, body: createRes(code, message) };
  }

  console.log({ params });

  const { environment } = params;

  if (!environment) {
    return {
      statusCode: 400,
      body: successRes("Missing required parameter: environment", null),
    };
  }

  const resultApiUrl = await appVersionsServices.getApiUrlService({ environment, type: "api" });
  if (!resultApiUrl.success || !resultApiUrl.data) {
    return { statusCode: 400, body: errorRes(resultApiUrl.message) };
  }

  const resultSocketUrl = await appVersionsServices.getApiUrlService({ environment, type: "socket" });
  if (!resultSocketUrl.success || !resultSocketUrl.data) {
    return { statusCode: 400, body: errorRes(resultSocketUrl.message) };
  }

  return { statusCode: 200, body: successRes("API URLs retrieved successfully", { environment, api_url: (resultApiUrl.data as api_urls).url as string, socket_url: (resultSocketUrl.data as api_urls).url as string }) };
};  

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const response = await handleRequest(event.queryStringParameters || {}, event.headers as Record<string, string | undefined>);
    console.log("Response");

    return {
      statusCode: response.statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.body),
    };
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(successRes("Internal server error", null)),
    };
  }
};

const isRunningInLambda = process.env.IS_LAMBDA === "true";
if (!isRunningInLambda) {
  (async () => {
    try {
      await ensureSecretsInitialized();
      const app = express();

      app.get("/", async (req: Request, res: Response) => {
        try {
          console.log({ req: req.query });

          const { environment, type } = req.query as { environment?: string; type?: string };
          console.log({ environment, type });
          const resp = await handleRequest({ environment: environment ?? null, type: type ?? null }, req.headers as Record<string, string | undefined>);
          res.status(resp.statusCode).json(resp.body);
        } catch (e) {
          console.error("Request error:", e);
          res.status(500).json(successRes("Internal server error", null));
        }
      });

      const port = Number(process.env.PORT || 3000);
      app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
      });
    } catch (e) {
      console.error("Failed to start server:", e);
      process.exitCode = 1;
    }
  })();
}