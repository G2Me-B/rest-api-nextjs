import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Blog from "@/lib/models/blog";
import { Types } from "mongoose";
import User from "@/lib/models/user";
import Category from "@/lib/models/category";

export const GET = async (request: Request, { params }: { params: Promise<{ blog: string }> }) => {
    const blogId = (await params).blog;
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

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing blogId" }),
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

        const blog = await Blog.findOne({ _id: blogId, user: userId, category: categoryId });
        if (!blog) {
            return new NextResponse(
                JSON.stringify({ message: "Blog not found in the database" }),
                { status: 404 }
            );
        }

        return new NextResponse(JSON.stringify({ blog }), { status: 200 });
    } catch (error: unknown) {
        return new NextResponse("Error in fetching the blog " + (error instanceof Error ? error.message : "Error in fetching the blog"), { status: 500 });
    }
}