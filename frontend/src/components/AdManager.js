import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * AdManager - Conditionally loads ads for non-premium users only
 * - Loads Monetag script for free users
 * - Unregisters service worker for premium users
 */
const AdManager = () => {
    const { user } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [checkedSubscription, setCheckedSubscription] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!user) {
                // Not logged in - show ads
                setIsPremium(false);
                setCheckedSubscription(true);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/payment/subscription`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const premium = data.subscription?.tier === 'premium';
                    setIsPremium(premium);

                    // If premium, unregister the ad service worker
                    if (premium && 'serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(registrations => {
                            for (const registration of registrations) {
                                // Only unregister the Monetag service worker
                                if (registration.active?.scriptURL?.includes('sw.js')) {
                                    registration.unregister();
                                    console.log('Ad service worker unregistered for premium user');
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking subscription for ads:', error);
                // On error, default to showing ads (free user behavior)
                setIsPremium(false);
            }

            setCheckedSubscription(true);
        };

        checkSubscription();
    }, [user]);

    useEffect(() => {
        // Only load ads after we've checked subscription status
        if (!checkedSubscription) return;

        // Don't load ads for premium users
        if (isPremium) {
            // Remove any existing ad scripts
            const existingScript = document.querySelector('script[data-monetag]');
            if (existingScript) {
                existingScript.remove();
            }
            return;
        }

        // Load Monetag ad script for free users
        const loadAdScript = () => {
            // Check if script already exists
            if (document.querySelector('script[data-monetag]')) return;

            const script = document.createElement('script');
            script.dataset.monetag = 'true';
            script.dataset.zone = '10425622';
            script.src = 'https://nap5k.com/tag.min.js';
            document.body.appendChild(script);

            // Also register service worker for push ads
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.log('Service worker registration failed:', err);
                });
            }
        };

        loadAdScript();

        return () => {
            // Cleanup on unmount
            const adScript = document.querySelector('script[data-monetag]');
            if (adScript) {
                adScript.remove();
            }
        };
    }, [isPremium, checkedSubscription]);

    // This component doesn't render anything
    return null;
};

export default AdManager;
