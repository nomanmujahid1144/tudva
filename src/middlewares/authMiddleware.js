// src/middlewares/authMiddleware.js
// FIXED: Proper async cookie handling for Next.js 14+

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * Middleware to authenticate API requests using JWT
 * @param {Request} request - The incoming request object
 * @returns {Object} Authentication result with user info if successful
 */
export const authenticateRequest = async (request) => {
  try {
    console.log('🔐 [Auth] Starting authentication...');
    
    // Check for token in Authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('📋 [Auth] Authorization header:', authHeader ? 'Present' : 'Missing');

    let token = null;
    
    // Try to get from Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('✅ [Auth] Token found in header:', token.substring(0, 20) + '...');
    }
    
    // If no token in header, try cookie
    if (!token) {
      console.log('🔍 [Auth] No token in header, checking cookies...');
      try {
        const cookieStore = cookies(); // ✅ This is already async in the function context
        const cookieToken = cookieStore.get('auth_token');
        
        if (cookieToken?.value) {
          token = cookieToken.value;
          console.log('✅ [Auth] Token found in cookie:', token.substring(0, 20) + '...');
        } else {
          console.log('❌ [Auth] No token in cookie');
        }
      } catch (cookieError) {
        console.error('❌ [Auth] Cookie read error:', cookieError.message);
      }
    }
    
    // Final check
    if (!token) {
      console.log('❌ [Auth] No token found in header or cookie');
      return { success: false, error: 'Authentication required' };
    }

    // Log token details for debugging
    console.log('🔍 [Auth] Token length:', token.length);
    console.log('🔍 [Auth] Token starts with:', token.substring(0, 10));
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ [Auth] Token verified successfully');
      console.log('👤 [Auth] User ID:', decoded.userId);
      console.log('📧 [Auth] User email:', decoded.email);
      
      return { 
        success: true, 
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          fullName: decoded.fullName || null
        }
      };
    } catch (jwtError) {
      console.error('❌ [Auth] JWT verification failed:', jwtError.message);
      
      if (jwtError.name === 'JsonWebTokenError') {
        return { success: false, error: 'Invalid token format' };
      } else if (jwtError.name === 'TokenExpiredError') {
        return { success: false, error: 'Token has expired' };
      } else {
        return { success: false, error: 'Token verification failed' };
      }
    }
    
  } catch (error) {
    console.error('❌ [Auth] Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

export default {
  authenticateRequest
};