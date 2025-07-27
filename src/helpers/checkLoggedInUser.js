import authService from '@/services/authService';

export const checkIsLoggedInUser = async () => {
    try {
        // Get current user from auth service
        const user = await authService.getCurrentUser();

        if (user) {
            return {
                user,
                token: `Bearer ${authService.getToken()}`,
                isAuthenticated: true
            };
        }

        // If no user is found, redirect to login
        console.log('No authenticated user found');
        return {
            user: null,
            token: null,
            isAuthenticated: false,
            error: 'Not authenticated'
        };
    } catch (error) {
        console.error('Error checking logged in user:', error);
        return {
            user: null,
            token: null,
            isAuthenticated: false,
            error: error.message || 'Authentication error'
        };
    }
};
