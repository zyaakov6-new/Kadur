# קדור (Kadur) ⚽

**The Future of Playing Together** - A mobile app for organizing pickup football games in Israel.

## Overview

Kadur is a Hebrew-first mobile application that allows players in Israeli cities to organize and join pickup football games. The app features real-time chat, map integration, and a polished Apple-like UI with dark mode support.

## Features

- 🗺️ **Map View** - See nearby games on an interactive map
- 📋 **Game Feed** - Browse games with filters (city, format, date)
- ➕ **Create Games** - Organize your own pickup games
- 💬 **Real-time Chat** - Communicate with other players
- 👤 **User Profiles** - Track games played, set positions, and more
- 🔔 **Push Notifications** - Get notified about nearby games and updates
- 🌙 **Dark Mode** - Beautiful dark theme with system default support
- 🔐 **Social Auth** - Sign in with Google or Apple

## Tech Stack

### Mobile App (Expo/React Native)
- **Framework**: React Native with Expo (SDK 51)
- **Navigation**: Expo Router (file-based routing)
- **State**: Zustand
- **Styling**: NativeWind (TailwindCSS)
- **Maps**: react-native-maps with Google Maps
- **Location**: Expo Location
- **Auth**: Supabase Auth with social login

### Backend (Supabase)
- **Database**: PostgreSQL
- **Auth**: Supabase Auth (Google, Apple, Email)
- **Realtime**: Supabase Realtime for chat and live updates
- **Storage**: Supabase Storage for profile photos

### Admin Panel (Next.js)
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Auth**: Supabase Auth (admin role check)

## Project Structure

```
Kadur/
├── app/                    # Expo mobile app
│   ├── app/               # Expo Router screens
│   │   ├── (tabs)/        # Tab navigation screens
│   │   ├── (auth)/        # Auth screens
│   │   ├── game/          # Game detail & create screens
│   │   └── chat/          # Chat screen
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # Supabase client & utilities
│   │   ├── types/         # TypeScript types
│   │   └── constants/     # Theme, colors, etc.
│   ├── package.json
│   └── app.json
├── admin/                  # Next.js admin panel
│   ├── app/               # App Router pages
│   ├── lib/               # Supabase client
│   └── package.json
├── supabase/              # Database schema
│   ├── schema.sql         # Tables, RLS, functions
│   └── seed.sql           # Test data
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- Google Maps API key (for maps)

### 1. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the schema SQL in `supabase/schema.sql`
3. (Optional) Run seed data in `supabase/seed.sql`
4. Copy your project URL and anon key

### 2. Configure the Mobile App

```bash
cd app
npm install

# Create .env file
cp .env.example .env
# Fill in your Supabase credentials and Google Maps API key
```

### 3. Run the Mobile App

```bash
# Development
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

### 4. Configure the Admin Panel

```bash
cd admin
npm install

# Create .env.local file
cp .env.example .env.local
# Fill in your Supabase credentials (including service role key)
```

### 5. Run the Admin Panel

```bash
npm run dev
# Open http://localhost:3000
```

## Environment Variables

### Mobile App (.env)

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Admin Panel (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Building for Production

### Mobile App (EAS Build)

```bash
cd app

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure your project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Admin Panel

```bash
cd admin

# Build
npm run build

# Deploy to Vercel
npx vercel
```

## Database Schema

### Tables

- `users` - User profiles
- `games` - Game listings
- `game_participants` - Join records
- `game_messages` - Chat messages
- `admin_users` - Admin access control
- `notifications` - Push notification records

### Key Features

- Row Level Security (RLS) for all tables
- Real-time subscriptions for games, participants, and messages
- Distance-based game search via PostGIS functions
- Automatic player count updates via triggers

## Target Cities (MVP)

- פתח תקווה (Petah Tikva)
- גוש דן (Gush Dan area)
- ירושלים (Jerusalem)

## Contributing

This is an MVP focused on Israeli pickup football. Future enhancements:

- [ ] Multiple sports support
- [ ] Recurring games
- [ ] Payment integration
- [ ] Team management
- [ ] Statistics and rankings

## License

Private - All rights reserved.

---

Built with ❤️ for Israeli football players
