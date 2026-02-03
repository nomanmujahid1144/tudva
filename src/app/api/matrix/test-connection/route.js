// ================================================================
// src/app/api/matrix/test-connection/route.js
// UPDATED FOR NEW MATRIX SERVER (matrix.151.hu)

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// ✅ UPDATED: New Matrix server configuration
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
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
    const testResponse = await axios.get(
      `${MATRIX_HOME_SERVER}/_matrix/client/versions` // ✅ This endpoint doesn't need version in path
    );
    
    if (testResponse.status !== 200) {
      throw new Error('Matrix server not reachable');
    }

    console.log('✅ Matrix server connection successful');
    console.log('📡 Server:', MATRIX_HOME_SERVER);
    console.log('🔌 Supported versions:', testResponse.data.versions);

    return NextResponse.json({
      success: true,
      data: {
        serverReachable: true,
        userId: userId,
        homeServer: MATRIX_HOME_SERVER,
        supportedVersions: testResponse.data.versions
      }
    });

  } catch (error) {
    console.error('❌ Matrix connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Matrix server connection failed',
      details: error.message
    }, { status: 500 });
  }
}