import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Blog from "@/lib/models/blog";
import { Types } from "mongoose";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId" }),
                { status: 400 }
            );
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing categoryId" }),
                { status: 400 }
            );
        }

        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found in the database" }),
                { status: 404 }
            );
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "Category not found in the database" }),
                { status: 404 }
            );
        }

        const filter = { user: new Types.ObjectId(userId), category: new Types.ObjectId(categoryId) };
        //TODO
        const blogs = await Blog.find(filter);

        return new NextResponse(JSON.stringify({ blogs }), { status: 200 });


    } catch (error: unknown) {
        return new NextResponse("Error in fetching blogs " + (error instanceof Error ? error.message : "Error in fetching blogs"), { status: 500 });
    }
}

export const POST = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');

        const { title, description } = await request.json();
        await connect();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found in the database" }),
                { status: 404 }
            );
        }
        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "Category not found for this user" }),
                { status: 404 }
            );
        }


        const newBlog = new Blog({
            title,
            description,
            user: user._id,
            category: category._id,
        });

        await newBlog.save();

        return new NextResponse(JSON.stringify({ message: "Blog created successfully", blog: newBlog }), { status: 201 });
        
    } catch (error: unknown) {
        return new NextResponse("Error in creating blog " + (error instanceof Error ? error.message : "Error in creating blog"), { status: 500 });
    }
}