/**
 * Lazy Realtime Subscriptions Manager
 * 
 * Prevents automatic Supabase realtime subscriptions on mobile initial load
 * Subscriptions are only initialized when user interacts with features that need them
 */

import { useDeviceProfile } from '@/hooks/use-device-profile';
import { useEffect, useRef } from 'react';

export interface RealtimeSubscriptionManager {
  initializeActivity(): void;
  initializeNotifications(): void;
  initializeMessages(): void;
  initializeFeed(): void;
}

// Global registry to track which subscriptions have been initialized
const subscriptionState = {
  activity: false,
  notifications: false,
  messages: false,
  feed: false,
};

/**
 * Hook to get lazy subscription manager
 * On mobile: subscriptions are disabled until needed
 * On desktop: subscriptions work normally (parent context still initializes them)
 */
export function useLazyRealtimeSubscriptions(): RealtimeSubscriptionManager {
  const { profile } = useDeviceProfile();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // On mobile, prevent automatic subscription initialization
    if (profile === 'premium-lite' && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Subscriptions remain lazy until triggered by user interaction
    }
  }, [profile]);

  return {
    initializeActivity: () => {
      if (!subscriptionState.activity) {
        subscriptionState.activity = true;
        // Trigger activity subscription initialization
        window.dispatchEvent(new CustomEvent('treytv:init-activity-subscription'));
      }
    },
    initializeNotifications: () => {
      if (!subscriptionState.notifications) {
        subscriptionState.notifications = true;
        window.dispatchEvent(new CustomEvent('treytv:init-notifications-subscription'));
      }
    },
    initializeMessages: () => {
      if (!subscriptionState.messages) {
        subscriptionState.messages = true;
        window.dispatchEvent(new CustomEvent('treytv:init-messages-subscription'));
      }
    },
    initializeFeed: () => {
      if (!subscriptionState.feed) {
        subscriptionState.feed = true;
        window.dispatchEvent(new CustomEvent('treytv:init-feed-subscription'));
      }
    },
  };
}

/**
 * Utility to disable realtime polling on logged-out pages
 * Prevents unnecessary auth state checks on public/guest pages
 */
export function shouldInitializeRealtimeSubscriptions(isGuest: boolean, profile: string): boolean {
  // Don't initialize if guest (not authenticated)
  if (isGuest) {
    return false;
  }
  
  // Don't initialize on mobile (premium-lite) unless explicitly triggered
  if (profile === 'premium-lite') {
    return false;
  }

  // Desktop/full-premium users: initialize normally
  return true;
}
