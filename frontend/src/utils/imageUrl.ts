/**
 * Resolves a raw image path from the database to a full URL.
 * If the path starts with /uploads, it points to the admin backend (port 5002).
 */
export const resolveImageUrl = (path: string | undefined): string => {
    if (!path) return 'https://via.placeholder.com/600';

    // If it's already an absolute URL (e.g. Unsplash), return as is
    if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:')) {
        return path;
    }

    // If it's a relative path from the upload folder, point to the admin backend
    if (path.startsWith('/uploads')) {
        return `http://${window.location.hostname}:5002${path}`;
    }

    // Fallback or relative to current origin if needed
    return path;
};
