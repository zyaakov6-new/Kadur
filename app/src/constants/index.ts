export * from './theme';

// App-wide constants
export const APP_NAME = 'קדור';
export const APP_SLUG = 'kadur';

// Default location (Petah Tikva, Israel)
export const DEFAULT_LOCATION = {
  latitude: 32.0853,
  longitude: 34.8878,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Search radius in km
export const DEFAULT_SEARCH_RADIUS = 10;
export const MAX_SEARCH_RADIUS = 50;

// Pagination
export const GAMES_PER_PAGE = 20;
export const MESSAGES_PER_PAGE = 50;

// Time constants
export const REFRESH_INTERVAL = 30000; // 30 seconds
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Map constants
export const MAP_STYLE = {
  light: [],
  dark: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#1d2c4d' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8ec3b9' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1a3646' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
  ],
};

// Analytics event names
export const AnalyticsEvents = {
  // Screen views
  SCREEN_VIEW: 'screen_viewed',

  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',

  // Games
  GAME_CREATED: 'game_created',
  GAME_JOINED: 'game_joined',
  GAME_LEFT: 'game_left',
  GAME_CANCELLED: 'game_cancelled',
  GAME_VIEWED: 'game_viewed',

  // Chat
  MESSAGE_SENT: 'message_sent',

  // Profile
  PROFILE_UPDATED: 'profile_updated',

  // Search/Filter
  FILTER_APPLIED: 'filter_applied',
  LOCATION_CHANGED: 'location_changed',
} as const;

// Error messages (Hebrew)
export const ErrorMessages = {
  GENERIC: 'משהו השתבש, נסה שוב מאוחר יותר',
  NETWORK: 'בעיית חיבור לאינטרנט',
  AUTH_REQUIRED: 'יש להתחבר כדי לבצע פעולה זו',
  LOCATION_PERMISSION: 'יש לאשר הרשאות מיקום כדי להציג משחקים בקרבתך',
  GAME_FULL: 'המשחק מלא',
  ALREADY_JOINED: 'כבר הצטרפת למשחק הזה',
  NOT_PARTICIPANT: 'אינך משתתף במשחק הזה',
  ORGANIZER_ONLY: 'רק מארגן המשחק יכול לבצע פעולה זו',
} as const;

// Success messages (Hebrew)
export const SuccessMessages = {
  GAME_CREATED: 'המשחק נוצר בהצלחה!',
  GAME_JOINED: 'הצטרפת למשחק בהצלחה!',
  GAME_LEFT: 'עזבת את המשחק',
  REQUEST_SENT: 'בקשת ההצטרפות נשלחה',
  PROFILE_UPDATED: 'הפרופיל עודכן בהצלחה',
} as const;
