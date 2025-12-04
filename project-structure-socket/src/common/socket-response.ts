export interface SocketResponse<T> {
    success: boolean;
    statuscode: number;
    message: string;
    data?: T | [] | null;
    total_number_of_data?: number;
    total_amount?: number;
    page_no_count?: number;
}

export const socketSuccess = <T>(
    message: string,
    data?: T | [] | null
): SocketResponse<T> => ({
    success: true,
    statuscode: 1,
    message,
    data: data ?? null,
});

export const socketListSuccess = <T>(
    message: string,
    totalCount: number,
    data: T | []
): SocketResponse<T> => ({
    success: true,
    statuscode: 1,
    message,
    total_number_of_data: totalCount,
    data,
});

export const socketError = <T>(
    message: string,
    data?: T | [] | null
): SocketResponse<T> => ({
    success: false,
    statuscode: 0,
    message,
    data: data ?? null,
});

export const socketInternalError = <T>(
    message: string,
    error?: T | [] | null
) => ({
    success: false,
    statuscode: 0,
    message,
    error,
});

export type { Socket } from 'socket.io';
