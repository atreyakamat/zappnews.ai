# ZappNews Mobile App

## 🎯 Overview
Native mobile app for ZappNews.ai with gamification and personalized AI news feeds.

## 🏗️ Architecture

```
ZappNews Mobile
├── React Native (Cross-platform)
├── SQLite Local Storage
├── API Integration (Backend at localhost:3000)
└── Gamification Engine
```

## ✨ Features to Implement

### Phase 1: Core Features
- [ ] **News Feed**: Beautiful card-based feed with swipe gestures
- [ ] **Telegram Integration**: View digests directly in app
- [ ] **Offline Mode**: Save articles for offline reading
- [ ] **Push Notifications**: Get notified for important updates

### Phase 2: Gamification
- [ ] **Reading Streaks**: Daily reading streak counter
- [ ] **Achievement Badges**: 
  - "Early Bird" - Read before 7am
  - "Night Owl" - Read after 10pm
  - "Curious Mind" - Read 50+ articles
  - "AI Expert" - Complete 10 saved items
- [ ] **Points System**: 
  - +10 pts for reading an article
  - +25 pts for "trying it out" (clicking CTA)
  - +50 pts for completing a saved item
  - +100 pts for weekly streak
- [ ] **Leaderboard**: (Future: for team/friends)
- [ ] **Progress Dashboard**: Visual stats and achievements

### Phase 3: Personalization
- [ ] **Source Preferences**: Toggle which sources you want
- [ ] **Topic Tags**: Filter by AI categories (LLM, Computer Vision, etc.)
- [ ] **Reading Time**: Estimate time to read
- [ ] **Bookmark Collections**: Organize saved items into folders

### Phase 4: Social & Sharing
- [ ] **Share to Social**: Quick share to Twitter, LinkedIn, etc.
- [ ] **Discussion**: Comment on articles (stored locally)
- [ ] **Highlights**: Save favorite quotes from articles

## 🎨 UI/UX Design Principles

### Design Language
- **Glassmorphism**: Consistent with web dashboard
- **Dark Theme**: OLED-friendly true black
- **60fps Animations**: Smooth transitions and micro-interactions
- **Gesture-Based**: Swipe to save, long-press for options

### Key Screens
1. **Home Feed**: Infinite scroll with pull-to-refresh
2. **Article Reader**: Distraction-free reading mode
3. **Saved Library**: Grid/list view with filters
4. **Profile/Stats**: Gamification dashboard
5. **Settings**: Source management, notifications, schedule

## 🔧 Technical Stack

### Frontend
- **Framework**: React Native (Expo for easier deployment)
- **UI Library**: React Native Paper or NativeBase
- **Navigation**: React Navigation
- **State**: Zustand or Redux Toolkit
- **Animations**: Reanimated 2 + Lottie

### Backend Integration
- **API**: REST API to localhost:3000
- **Local DB**: SQLite (react-native-sqlite-storage)
- **Caching**: React Query for smart caching
- **Notifications**: Firebase Cloud Messaging

### Gamification
- **Local Storage**: SQLite for points, badges, streaks
- **Analytics**: Track reading patterns
- **Rewards**: Unlock themes/features with points

## 📱 App Structure

```
mobile/
├── src/
│   ├── screens/          # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── ArticleScreen.tsx
│   │   ├── SavedScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/       # Reusable components
│   │   ├── NewsCard.tsx
│   │   ├── BadgeIcon.tsx
│   │   ├── StreakCounter.tsx
│   │   └── ProgressRing.tsx
│   ├── services/         # API & database
│   │   ├── api.ts
│   │   ├── database.ts
│   │   └── gamification.ts
│   ├── store/            # State management
│   ├── navigation/       # Navigation config
│   └── utils/            # Helpers
├── assets/               # Images, fonts, animations
├── app.json             # Expo config
└── package.json
```

## 🎮 Gamification System Design

### Points Calculation
```typescript
const POINTS = {
  READ_ARTICLE: 10,
  CLICK_CTA: 25,
  COMPLETE_SAVED: 50,
  DAILY_STREAK: 100,
  WEEKLY_STREAK: 500,
  SHARE_ARTICLE: 15
};
```

### Badge Levels
- 🥉 **Bronze**: 0-1000 pts
- 🥈 **Silver**: 1000-5000 pts
- 🥇 **Gold**: 5000-10000 pts
- 💎 **Diamond**: 10000+ pts

### Streak Mechanics
- Resets if you miss a day
- Grace period: 6 hours past midnight
- Streak freeze: Use 100 points to save your streak once

## 📊 Data Sync Strategy

### Online Mode
- Fetch latest from backend API every 3 hours
- Real-time sync for saved items
- Push new summaries immediately

### Offline Mode
- Cache last 100 articles locally
- Queue actions (save, complete, etc.)
- Sync when back online

## 🚀 Next Steps

1. **Get Wireframes**: You mentioned you'll provide UI wireframes
2. **Choose Tech Stack**: Decide React Native vs Flutter
3. **Setup Project**: Initialize mobile project structure
4. **Build MVP**: Core feed + reading functionality
5. **Add Gamification**: Points, badges, streaks
6. **Beta Test**: Test with real usage
7. **Polish & Launch**: App store deployment

## 📝 Notes

- Backend is already running at `localhost:3000`
- API endpoint `/api/items` serves all news summaries
- SQLite database has all the data we need
- Telegram bot sends digests every 3 hours (1am, 4am, 7am, 10am, 1pm, 4pm, 7pm, 10pm)
- GitHub trending feeds are now included!

---

**Ready to build!** Send me the wireframes and I'll start implementing the app structure! 🎉
