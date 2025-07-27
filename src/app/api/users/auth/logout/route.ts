import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {

        const response = NextResponse.json({
            message: "Logout Successfully",
            success: true
        });

        response.cookies.set('token', '', {
            httpOnly: true,
            expires: new Date(0)
        })

        return response;

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to logout"
        }, { status: 500 })
    }
}