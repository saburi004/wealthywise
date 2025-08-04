// Utility functions for token handling

export function decodeToken(token) {
  try {
    if (!token) return null;
    
    // Split the token and get the payload part
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

export function isTokenExpired(token) {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function getUserIdFromToken(token) {
  try {
    const payload = decodeToken(token);
    return payload?.userId || null;
  } catch (error) {
    return null;
  }
} 