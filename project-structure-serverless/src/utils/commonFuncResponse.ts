interface ErrorResponse {
  success: false;
  status_code: number;
  message: string;
}

interface SuccessResponse<T = unknown> {
  success: true;
  status_code: number;
  message: string;
  total?: number;
  data: T;
}

interface CatchResponse {
  success: false;
  status_code: number;
  message: string;
  error: unknown;
}

const errorRes = (msg: string): ErrorResponse => {
  return {
    success: false,
    status_code: 500,
    message: msg,
  };
};

const successRes = <T = unknown>(
  msg: string,
  data: T,
): SuccessResponse<T> => {
  return {
    success: true,
    status_code: 200,
    message: msg,
    data,
  };
};

const catchRes = (msg: string, error: unknown): CatchResponse => {
  return {
    success: false,
    status_code: 500,
    message: msg,
    error: error,
  };
};

const createRes = (code: number, msg: string): ErrorResponse => {
  return {
    success: false,
    status_code: code,
    message: msg,
  };
};


export { errorRes, successRes, catchRes, createRes };
