import { useCallback } from 'react';
import { AnalyticsEvents } from '@/constants';

// Analytics interface - can be swapped with any provider (Amplitude, GA, etc.)
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

// Placeholder analytics implementation
// Replace with actual analytics SDK (Amplitude, GA, etc.)
class Analytics {
  private static instance: Analytics;
  private userId: string | null = null;
  private isEnabled: boolean = true;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  logEvent(name: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      },
    };

    // Log to console in development
    if (__DEV__) {
      console.log('[Analytics]', event);
    }

    // TODO: Send to actual analytics service
    // Amplitude.logEvent(name, properties);
    // or
    // analytics().logEvent(name, properties);
  }

  logScreenView(screenName: string, properties?: Record<string, any>): void {
    this.logEvent(AnalyticsEvents.SCREEN_VIEW, {
      screen: screenName,
      ...properties,
    });
  }
}

export const analytics = Analytics.getInstance();

// React hook for analytics
export function useAnalytics() {
  const logEvent = useCallback(
    (name: string, properties?: Record<string, any>) => {
      analytics.logEvent(name, properties);
    },
    []
  );

  const logScreenView = useCallback(
    (screenName: string, properties?: Record<string, any>) => {
      analytics.logScreenView(screenName, properties);
    },
    []
  );

  const setUserId = useCallback((userId: string | null) => {
    analytics.setUserId(userId);
  }, []);

  // Pre-defined event loggers
  const logGameCreated = useCallback(
    (gameId: string, format: string, city: string) => {
      logEvent(AnalyticsEvents.GAME_CREATED, { gameId, format, city });
    },
    [logEvent]
  );

  const logGameJoined = useCallback(
    (gameId: string, isPublic: boolean) => {
      logEvent(AnalyticsEvents.GAME_JOINED, { gameId, isPublic });
    },
    [logEvent]
  );

  const logGameLeft = useCallback(
    (gameId: string) => {
      logEvent(AnalyticsEvents.GAME_LEFT, { gameId });
    },
    [logEvent]
  );

  const logGameViewed = useCallback(
    (gameId: string) => {
      logEvent(AnalyticsEvents.GAME_VIEWED, { gameId });
    },
    [logEvent]
  );

  const logFilterApplied = useCallback(
    (filters: Record<string, any>) => {
      logEvent(AnalyticsEvents.FILTER_APPLIED, filters);
    },
    [logEvent]
  );

  const logMessageSent = useCallback(
    (gameId: string) => {
      logEvent(AnalyticsEvents.MESSAGE_SENT, { gameId });
    },
    [logEvent]
  );

  return {
    logEvent,
    logScreenView,
    setUserId,
    logGameCreated,
    logGameJoined,
    logGameLeft,
    logGameViewed,
    logFilterApplied,
    logMessageSent,
  };
}
