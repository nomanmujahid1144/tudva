// src/app/api/matrix/test-connection/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://chat.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

export async function POST(request) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const { userId } = await request.json();

    // Test Matrix server connectivity
    const testResponse = await axios.get(`${MATRIX_HOME_SERVER}/_matrix/client/versions`);
    
    if (testResponse.status !== 200) {
      throw new Error('Matrix server not reachable');
    }

    return NextResponse.json({
      success: true,
      data: {
        serverReachable: true,
        userId: userId,
        homeServer: MATRIX_HOME_SERVER
      }
    });

  } catch (error) {
    console.error('Matrix connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Matrix server connection failed'
    }, { status: 500 });
  }
}