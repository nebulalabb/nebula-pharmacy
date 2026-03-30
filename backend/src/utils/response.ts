import { Response } from 'express';

/**
 * Standard Success Response
 */
export const successResponse = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard Error Response
 */
export const errorResponse = (res: Response, message: string = 'Error', statusCode: number = 400, errors: any = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
