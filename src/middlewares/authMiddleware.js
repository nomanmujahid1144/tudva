// src/lib/authMiddleware.js
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
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // If no token in header, try cookie
    if (!token) {
      token = cookies().get('auth_token')?.value;
    }
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return { 
      success: true, 
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Invalid or expired token' };
  }
};

export default {
  authenticateRequest
};