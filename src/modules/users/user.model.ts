import mongoose from "mongoose";
import { IUserDocument } from '../../interfaces/user.interface';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Google and Facebook auth fields
    googleId: { type: String },
    facebookId: { type: String }
}, {
    timestamps: true
});

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
