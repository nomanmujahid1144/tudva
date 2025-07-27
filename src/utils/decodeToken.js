export const decodeJWT = (token) => {
    try {
        const base64Payload = token.split('.')[1]; // Extract the payload part of the token
        const payload = JSON.parse(atob(base64Payload)); // Decode and parse the payload
        return payload; // Return the decoded payload
    } catch (error) {
        console.error('Invalid token:', error);
        return null; // Handle invalid or malformed token
    }
};
