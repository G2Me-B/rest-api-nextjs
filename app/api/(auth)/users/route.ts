import User from '@/lib/models/user'
import connect from '@/lib/db';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const ObjectId = require("mongoose").Types.ObjectId;

export const GET = async () => {
    try {
        await connect();
        const users = await User.find({});
        return new NextResponse(JSON.stringify(users), { status: 200 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        return new NextResponse("Error in fetching users: " + msg, { status: 500 });
    }

}

export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        await connect();
        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
            return new NextResponse("User already exists", { status: 422 });
        }
        const newUser = new User(body);
        await newUser.save();
        return new NextResponse(JSON.stringify({ message: "User created successfully", user: newUser }), { status: 201 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        return new NextResponse("Error in creating user: " + msg, { status: 500 });

    }
}

export const PATCH = async (request: Request) => {
    try {
        const body = await request.json();
        const { userId, newUsername } = body;
        await connect();
        if (!userId || !newUsername) {
            return new NextResponse(
                JSON.stringify({ message: "userId and newUsername are required" }),
                { status: 400 }
            );
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "userId and newUsername are required" }),
                { status: 400 }
            );
        }
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { username: newUsername },
            { new: true }
        )
        if (!updatedUser) {
            return new NextResponse(
                JSON.stringify({ message: "User not found in the database" }),
                { status: 400 }
            )

        }

        return new NextResponse(JSON.stringify({ message: "User updated successfully", user: updatedUser }), { status: 200 });

    } catch (error: unknown) {
        return new NextResponse("Error in updating user: " + (error instanceof Error ? error.message : String(error)), { status: 500 });
    }
}


export const DELETE = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "userId " }),
                { status: 400 }
            );
        }
        if(!userId){
            return new NextResponse(
                JSON.stringify({ message: "userId not found" }),
                { status: 400 }
            );
        }
        if(!Types.ObjectId.isValid(userId)){
            return new NextResponse(
                JSON.stringify({ message: "Invalid userId" }),
                { status: 400 }
            );
        }
        
        await connect();

        const deletedUser = await User.findOneAndDelete(new Types.ObjectId(userId));
        if(!deletedUser){
            return new NextResponse(
                JSON.stringify({ message: "User not found in the database" }),
                { status: 400 }
            )
        }
        return new NextResponse(JSON.stringify({ message: "User deleted successfully", user: deletedUser }), { status: 200 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        return new NextResponse("Error in deleting user: " + msg, { status: 500 });
    }
}