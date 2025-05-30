import { z } from 'zod';
import { Document, Types } from "mongoose";

// Base Zod schema for validation (used for input/creation)
export const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string(),
    role: z.enum(['user', 'admin']).default('user'),
    googleId: z.string().optional(),
    facebookId: z.string().optional(),
});

// MongoDB document Zod schema (includes MongoDB specific fields)
export const userDocumentSchema = userSchema.extend({
    _id: z.instanceof(Types.ObjectId),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Base user type (for creation/input)
export type IUser = z.infer<typeof userSchema>;

// Mongoose document type (includes MongoDB specific fields)
export type IUserDocument = z.infer<typeof userDocumentSchema> & Document;

// Response schemas (excluding sensitive data)
export const userResponseSchema = userSchema
    .omit({ password: true })
    .extend({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    });

export const usersResponseSchema = z.array(userResponseSchema);

// Response types
export type IUserResponse = z.infer<typeof userResponseSchema>;
export type IUsersResponse = z.infer<typeof usersResponseSchema>;