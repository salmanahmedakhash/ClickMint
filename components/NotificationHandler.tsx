// FIX: Import React to resolve "Cannot find namespace 'React'" error.
import React, { useEffect, useContext } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { UserContext } from '../App';
import { arrayRemove, arrayUnion } from 'firebase/firestore';
import { messaging } from '../firebaseConfig';


// In a real app, this key would be stored securely, e.g., in environment variables.
// This is your VAPID key from Firebase Project Settings > Cloud Messaging > Web configuration.
const VAPID_KEY = 'BPCY7L_oQ7Z7m-R5B5f_gK9d_eZ-xJ5y_fFz4Q9Yj8YgJk8t6pP_cR3j_kY5l3W_aG1a_N_zJ_yX9s';

interface NotificationHandlerProps {
    showToast: (title: string, body: string) => void;
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ showToast }) => {
    const context = useContext(UserContext);

    useEffect(() => {
        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received.', payload);
            if (payload.notification) {
                showToast(payload.notification.title || 'New Message', payload.notification.body || '');
            }
        });

        return () => unsubscribe();
    }, [showToast]);

    useEffect(() => {
        const setupNotifications = async () => {
            if (!context?.currentUser || !context.updateUser) return;
            const { currentUser, updateUser } = context;

            try {
                if (currentUser.notificationsEnabled && Notification.permission === 'default') {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        // User denied permission, update their preference in the app
                        await updateUser(currentUser.id, { notificationsEnabled: false });
                        return;
                    }
                }

                if (currentUser.notificationsEnabled && Notification.permission === 'granted') {
                    // Get token
                    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
                    if (currentToken) {
                        // Check if token already exists in user's profile
                        if (!currentUser.fcmTokens?.includes(currentToken)) {
                            // Add new token to the user's document
                            await updateUser(currentUser.id, {
                                fcmTokens: arrayUnion(currentToken)
                            });
                        }
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                } else if (!currentUser.notificationsEnabled && Notification.permission === 'granted') {
                     // User disabled notifications in the app, but browser permission is still granted
                     // We should remove the token to stop sending notifications
                    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
                    if (currentToken && currentUser.fcmTokens?.includes(currentToken)) {
                        await updateUser(currentUser.id, {
                            fcmTokens: arrayRemove(currentToken)
                        });
                    }
                }
            } catch (err) {
                console.error('An error occurred while setting up notifications. ', err);
                if (err instanceof Error && (err.message.includes('permission') || err.message.includes('denied'))) {
                    // If any error related to permissions occurs, sync the app state
                    await updateUser(currentUser.id, { notificationsEnabled: false });
                }
            }
        };

        setupNotifications();
    }, [context?.currentUser?.notificationsEnabled, context?.currentUser?.id, context?.updateUser]);


    return null; // This is a non-visual component
};

export default NotificationHandler;