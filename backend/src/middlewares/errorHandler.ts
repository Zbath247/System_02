import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('Unhandled server error:', err);

  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input parameters.',
      messageKh: 'ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ។',
      errors: errorDetails,
    });
    return;
  }

  // Generic 500 error without exposing stack traces to clients
  res.status(err.status || 500).json({
    success: false,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.',
    messageKh: 'មានបញ្ហាមិនរំពឹងទុកបានកើតឡើងនៅលើម៉ាស៊ីនបម្រើ។',
  });
}
