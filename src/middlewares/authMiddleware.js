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
    // Check for token in Authorization header
    const authHeader = request.headers.get('Authorization');

    let token = null;
    
    // Try to get from Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // If no token in header, try cookie
    if (!token) {
      try {
        const cookieStore = cookies(); // ✅ This is already async in the function context
        const cookieToken = cookieStore.get('auth_token');
        
        if (cookieToken?.value) {
          token = cookieToken.value;
        } else {
          console.log('❌ [Auth] No token in cookie');
        }
      } catch (cookieError) {
        console.error('❌ [Auth] Cookie read error:', cookieError.message);
      }
    }
    
    // Final check
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log(decoded, 'decoded')

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