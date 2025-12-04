import { Response, Request } from 'express';

export interface ApiResponse<T> {
    success: boolean;
    statuscode: number;
    message: string;
    data?: T | [] | null;
    token?: string;
    total_number_of_data?: number;
    total_amount?: number;
    page_no_count?: number;
}

function buildResponse<T>(
    res: Response,
    payload: ApiResponse<T>,
    httpStatus = res.statusCode
): ApiResponse<T> {
    const response = payload as unknown as ApiResponse<T>;
    res.status(httpStatus).json(response);
    return response;
}

export const successRes = <T>(
    res: Response,
    msg: string,
    data: T | [] | null
) =>
    buildResponse(res, {
        success: true,
        statuscode: 1,
        message: msg,
        data: data,
    });

export const warningRes = (res: Response, msg: string) =>
    buildResponse(res, {
        success: false,
        statuscode: 2,
        message: msg,
    });

export const multiSuccessRes = <T>(
    res: Response,
    msg: string,
    total_count: number,
    data: T | [] | null
) =>
    buildResponse(res, {
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        data: data,
    });

export const countMultiSuccessRes = <T>(
    res: Response,
    msg: string,
    total_count: number,
    total_amount: number,
    data: T | [] | null
) =>
    buildResponse(res, {
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        total_amount: total_amount,
        data: data,
    });

export const tokenSuccessRes = <T>(
    res: Response,
    msg: string,
    token: string,
    data: T | [] | null
) =>
    buildResponse(res, {
        success: true,
        statuscode: 1,
        message: msg,
        token: token,
        data: data,
    });

export const manyMultiSuccessRes = <T>(
    res: Response,
    msg: string,
    total_count: number,
    page_count: number,
    data: T | [] | null
) =>
    buildResponse(res, {
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        page_no_count: page_count,
        data: data,
    });

export const errorRes = (res: Response, msg: string) =>
    buildResponse(res, {
        success: false,
        statuscode: 0,
        message: msg,
        data: null,
    });

export const authFailRes = (res: Response, msg: string) =>
    buildResponse(
        res,
        {
            success: false,
            statuscode: 101,
            message: msg,
            data: null,
        },
        401
    );

export const maintenanceMode = (res: Response, msg: string) =>
    buildResponse(
        res,
        {
            success: false,
            statuscode: 503,
            message: msg,
            data: null,
        },
        503
    );

export const webAuthFailRes = (res: Response, msg: string) =>
    buildResponse(res, {
        success: false,
        statuscode: 101,
        message: msg,
        data: null,
    });

///////////////////////////////// Socket responses ////////////////////////////////
export const socketSuccessRes = <T>(msg: string, data: T | [] | null) => ({
    success: true,
    statuscode: 1,
    message: msg,
    data: data,
});

export const socketMultiSuccessRes = <T>(
    msg: string,
    total_count: number,
    data: T | [] | null
) => ({
    success: true,
    statuscode: 1,
    message: msg,
    total_number_of_data: total_count,
    data: data,
});

export const socketErrorRes = <T>(msg: string, data?: T | [] | null) => ({
    success: false,
    statuscode: 0,
    message: msg,
    data: data,
});

export const internalErrorRes = <T>(msg: string, data?: T | [] | null) => ({
    success: false,
    statuscode: 0,
    message: msg,
    error: data,
});

export { Response, Request };
