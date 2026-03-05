import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {

        const response = NextResponse.json({
            message: "Logout Successfully",
            success: true
        });

        response.cookies.set('auth_token', '', {
            httpOnly: true,
            path: '/',
            expires: new Date(0),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        return response;

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to logout"
        }, { status: 500 })
    }
}