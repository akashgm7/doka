import axios from 'axios';

export interface UserNotification {
    _id: string;
    title: string;
    message: string;
    target: string;
    sentAt: string;
    type: string;
}

// Direct axios instance pointing to the CAKE2 admin server (port 5002)
// which holds the shared doka_cake_app database and the notifications collection.
// We call the public endpoint — no auth token required.
const adminApi = axios.create({
    baseURL: `http://${window.location.hostname}:5002`,
});

// Fetch public notifications — messages targeted at customers or all users.
// The /public endpoint on the server already filters to only 'All Users' and 'Customers' targets.
export const fetchUserNotifications = async (): Promise<UserNotification[]> => {
    const { data } = await adminApi.get('/api/notifications/public');
    return data as UserNotification[];
};
