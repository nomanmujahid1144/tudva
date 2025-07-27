import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Try to get token from HTTP-only cookie first
        const httpOnlyToken = request.cookies.get('token');

        // Then try client-accessible cookie
        const clientToken = request.cookies.get('auth_token');

        // Use whichever token is available
        const token = httpOnlyToken?.value || clientToken?.value || '';

        if (!token) {
            console.log('No token found in cookies');
            return NextResponse.json({
                success: false,
                message: "No token found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            token: token
        });

    } catch (error) {
        console.error("Error in get-token route:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to get token"
        }, { status: 500 })
    }
}