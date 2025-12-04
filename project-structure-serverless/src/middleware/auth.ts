import { APIGatewayProxyEvent } from "aws-lambda";
import jwt from "jsonwebtoken";
import { getSecret } from "../utils/secrets";
import console from "console";

interface VerificationResult {
  status: boolean;
  code: number;
  message: string;
}

export const verifyAuth = async (
  headers: Record<string, string | undefined>
): Promise<VerificationResult> => {
  try {
    const bearerHeader: string | undefined = headers["authorization"] || headers["Authorization"];

    if (!bearerHeader || bearerHeader === undefined) {
      console.log("No token provided");
      return {
        status: false,
        code: 401,
        message: "A token is required for authentication."
      };
    }

    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    if (!bearerToken) {
      console.log("No token provided");
      return {
        status: false,
        code: 401,
        message: "A token is required for authentication."
      };
    }

    const tokenKey = await getSecret('TOKEN_KEY');

    console.log({tokenKey });
    

    const decoded = jwt.verify(
      bearerToken,
      tokenKey,
    ) as {
      is_valid?: boolean;
    };

    console.log("Decoded Token", decoded);

    if (!decoded.is_valid) {
      return {
        status: false,
        code: 401,
        message: "Wrong Auth Token"
      };
    }

    return {
      status: true,
      code: 200,
      message: "Authentication successful"
    };
  } catch (error: unknown) {
    console.log("auth error", error);
    return {
      status: false,
      code: 401,
      message: "Authentication failed"
    };
  }
};

export const auth = async (
  event: APIGatewayProxyEvent
): Promise<VerificationResult> => {
  return verifyAuth(event.headers as Record<string, string | undefined>);
};
