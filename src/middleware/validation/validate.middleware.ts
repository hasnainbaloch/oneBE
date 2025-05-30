import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import createError from 'http-errors';

export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod validation errors
                const errors = error.errors.reduce((acc: Record<string, string>, curr) => {
                    // Remove the 'body.' prefix from the path
                    const path = curr.path.join('.').replace('body.', '');
                    acc[path] = curr.message;
                    return acc;
                }, {});

                return next(createError(400, 'Validation Error', {
                    code: 'VALIDATION_ERROR',
                    errors
                }));
            }
            return next(error);
        }
    };
}; 