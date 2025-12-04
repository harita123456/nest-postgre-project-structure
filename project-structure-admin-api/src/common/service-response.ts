export type ServiceResponse<T> =
    | {
          success: true;
          message: string;
          data: T | null;
          total?: number;
      }
    | {
          success: false;
          message: string;
          error?: unknown;
      };

export type multiServiceResponse<T> = {
    success: true;
    message: string;
    data: T[];
    total?: number;
};

export function serviceSuccess<T>(
    message: string,
    data?: T | null
): ServiceResponse<T> {
    return {
        success: true,
        message,
        data: data ?? null,
    };
}

export function serviceSuccessPagination<T>(
    message: string,
    data: T[],
    total?: number
): ServiceResponse<T[]> {
    return {
        success: true,
        message,
        data,
        total,
    };
}

export function serviceError(
    message: string,
    error?: unknown
): ServiceResponse<never> {
    return {
        success: false,
        message,
        error,
    };
}

export function servicecatch(
    msg: string,
    error: unknown
): ServiceResponse<never> {
    return {
        success: false,
        message: msg,
        error: error,
    };
}
