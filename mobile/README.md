# 📱 Postly Mobile Application

<p align="center">
  <img src="assets/images/icon.png" width="100" height="100" alt="Postly Mobile App" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>Native iOS & Android Multi-Platform Social Broadcasting Application built with React Native and Expo.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Expo_Router-v5-4630EB?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Router" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Gifted_Charts-1.4-FFA500?style=for-the-badge" alt="Gifted Charts" />
  <img src="https://img.shields.io/badge/Zustand-5.x-443E38?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/Zod-Runtime_Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</p>

---

## 📖 Overview

The **Postly Mobile App** provides an ultra-clean, high-performance command center for composing, scheduling, broadcasting, and analyzing posts across **Telegram channels** and **LinkedIn profiles**.

Built with **React Native** and **Expo SDK 57**, the mobile client features an **Option A (Apple/Stripe Light Theme)** design system, tactile haptic feedback, real-time interactive charts, 2-column grid post cards, live preview mockups, and optimistic updates.

---

## ✨ Screen & Tab Architecture

Postly organizes core workflows into a streamlined **4-tab layout** powered by a custom **Floating Capsule Tab Bar**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  [ Dashboard ]      [ Posters ]      [ Channels ]      [ Settings ]    │
│  Analytics Hub      2-Col Grid Feed  Telegram Sync     Account & OAuth │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. 📊 Tab 1: Dashboard (`/index`)
- **Creator Header**: Greeting with avatar, dynamic initials fallback, and unread notification bell badge.
- **KPI Metrics (2x2 Grid)**:
  - Total Broadcasts
  - Target Channel Reach
  - Scheduled Queue Count
  - Delivery Reliability Rate (%)
- **Timeframe Selector**: Toggle metrics instantly between **7D**, **30D**, and **All**.
- **Interactive Gifted Charts (`components/analytics/`)**:
  - `PostsChart`: Stacked bar chart showing delivered, scheduled, and failed broadcasts over time.
  - `PlatformChart`: Donut pie chart breaking down distribution between Telegram and LinkedIn.
  - `EngagementChart`: Curved area line chart tracking volume trajectory and reliability scoring.

### 2. 🗂️ Tab 2: Posters (`/posts`)
- **Top Search Bar**: Live filtering across post text, channel titles, and tags.
- **Filter Tabs**: Instant filtering by `All`, `Scheduled`, `Telegram`, `LinkedIn`, `Published`, and `Failed`.
- **2-Column Grid Layout (`numColumns={2}`)**:
  - Compact cards (`PostCard.tsx`) with 85px media thumbnail previews and multi-photo counter badges.
  - Vertical metadata badges (Status, media count, pinned indicators).
  - 3-dot context menu for immediate actions: **View Details**, **Publish Now**, **Cancel Schedule**, and **Delete**.
- **Simultaneous Remote Deletion**: Deletes the post from Postly while triggering parallel cleanup on Telegram channels and LinkedIn feeds with optimistic UI removal.

### 3. 📡 Tab 3: Channels (`/channels`)
- **MTProto Channel Discovery**: Discovers owned broadcast channels and supergroups where the user is an admin with post privileges.
- **One-Tap Synchronize**: Trigger real-time sync with Telegram cloud.
- **Channel Filters & Search**: Filter by "Can Post Only", "Selected Only", or search by channel name.
- **Channel Detail Modal**: Review subscriber counts, total messages dispatched, and delivery health.

### 4. ⚙️ Tab 4: Settings (`/settings`)
- **Telegram Account**: View connected phone number, username, and active session status.
- **LinkedIn Integration**: Connect and disconnect LinkedIn profile with OAuth 2.0.
- **Session Revocation & Logout**: Securely wipe stored Knox bearer tokens from device hardware keystore.

### 5. ✍️ Fullscreen Composer Modal (`/compose`)
- **Multi-Format Text**: Switch between **HTML**, **Markdown**, and **Plain Text**.
- **Formatting Toolbar**: Dedicated quick pills for bold, italic, code, strikethrough, spoiler, and links.
- **Media Attachments**: Attach up to 10 photos/videos with Cloudinary upload progress.
- **Cross-Platform Target Selector**: Pick individual Telegram channels and toggle LinkedIn cross-posting.
- **Interactive Live Preview**: Preview the broadcast in an authentic Telegram chat bubble mockup.
- **Schedule Time Picker**: Set date and time for future Celery automated broadcasting.

---

## 📂 Project Structure

```
mobile/
├── src/
│   ├── app/                                # Expo Router file-based routes
│   │   ├── (auth)/                         # Authentication route group
│   │   │   ├── login.tsx                   # Phone number entry screen
│   │   │   ├── verify-otp.tsx              # 5-digit verification code screen
│   │   │   └── verify-password.tsx         # Telegram 2FA cloud password screen
│   │   ├── (tabs)/                         # Bottom-tab screens
│   │   │   ├── index.tsx                   # Tab 1: Dashboard (KPIs & Gifted Charts)
│   │   │   ├── posts.tsx                   # Tab 2: Posters (2-col grid & search bar)
│   │   │   ├── channels.tsx                # Tab 3: Channels (Telegram discovery & sync)
│   │   │   ├── settings.tsx                # Tab 4: Settings (Sessions, LinkedIn OAuth)
│   │   │   └── _layout.tsx                 # Tab navigation config
│   │   ├── compose.tsx                     # Rich post composer fullscreen modal
│   │   └── _layout.tsx                     # App root layout with QueryClient & ErrorBoundary
│   │
│   ├── components/                         # Modular component library
│   │   ├── analytics/                      # MetricCard, PostsChart, PlatformChart, EngagementChart
│   │   ├── channels/                       # ChannelCard, ChannelFilterBar, ChannelStatsModal
│   │   ├── common/                         # ErrorBoundary, ToastContainer
│   │   ├── composer/                       # FormattingToolbar, ChannelSelectorPills, PostPreviewModal
│   │   ├── dashboard/                      # DashboardHeader
│   │   ├── navigation/                     # FloatingTabBar (Capsule dock)
│   │   ├── notifications/                  # NotificationBellButton, NotificationCenterModal
│   │   ├── posts/                          # PostCard (2-col grid card), PostFilterBar, PostDetailModal
│   │   └── ui/                             # Button, Card, Input, OtpInput
│   │
│   ├── hooks/                              # Custom TanStack Query hooks
│   │   ├── useAnalytics.ts                 # Pre-aggregated KPI metrics & chart data
│   │   ├── useChannels.ts                  # Channel discovery, sync & selection toggles
│   │   ├── useLinkedIn.ts                  # LinkedIn connection status & OAuth
│   │   ├── useNotifications.ts             # In-app delivery activity logs
│   │   └── usePosts.ts                     # Optimistic post operations (Delete, Publish Now, Cancel)
│   │
│   ├── services/                           # Infrastructure & API layer
│   │   ├── analytics/                      # Analytics API service
│   │   ├── api/                            # Axios client with auto-detected LAN IP & Knox interceptor
│   │   ├── auth/                           # AuthService & SecureStore token storage
│   │   ├── channels/                       # ChannelService
│   │   ├── integrations/                   # LinkedInService
│   │   ├── notifications/                  # NotificationService
│   │   └── posts/                          # PostService & Cloudinary MediaService
│   │
│   ├── store/                              # Zustand global stores
│   │   ├── useAuthStore.ts                 # User authentication state
│   │   └── useToastStore.ts                # Floating alert notifications
│   │
│   └── theme/                              # Design system tokens
│       ├── colors.ts                       # Option A Light Theme palette
│       ├── typography.ts                   # Presets, weights, and scale
│       ├── spacing.ts                      # Spacing, radius, and soft shadows
│       └── index.ts                        # Unified theme export
│
├── assets/                                 # App icons, splash screens, and images
├── app.json                                # Expo application manifest
└── package.json                            # Scripts & dependencies
```

---

## 🎨 Design System (Option A: Premium Light Theme)

Postly utilizes a refined Apple/Stripe light theme with a high-contrast floating capsule:

| Token Category | Token | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas** | `background.base` | `#F6F8FB` | Soft off-white app canvas (eliminates eye glare) |
| **Surfaces** | `background.surface` | `#FFFFFF` | Cards, modals, action sheets, gifted chart containers |
| **Inputs/Chips** | `background.highlight` | `#F1F5F9` | Search bars, filter pill backgrounds, badges |
| **Text** | `text.primary` | `#0F172A` | Primary titles and high-emphasis numbers (Slate 900) |
| **Text** | `text.secondary` | `#475569` | Body text, subtitles, and labels (Slate 600) |
| **Text** | `text.muted` | `#94A3B8` | Timestamps, captions, and placeholders (Slate 400) |
| **Borders** | `border.subtle` | `#E2E8F0` | Fine card borders and divider rules (Slate 200) |
| **Brand Accent** | `primary.DEFAULT` | `#2AABEE` | Telegram Blue for primary buttons and active pills |
| **Capsule Dock** | Capsule / Compose | `#12151B` / `#FFB765` | Floating capsule bar with golden peach compose button |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: 18+ or 20+
- **pnpm**: `npm install -g pnpm`
- **Expo Go App**: Installed on your iOS or Android phone.

---

### 2. Installation & Running

```bash
# 1. Navigate to the mobile directory
cd mobile

# 2. Install dependencies
pnpm install

# 3. Start Expo development server
pnpm start
```

---

### 3. Connecting to the Backend Server

The mobile API client (`mobile/src/services/api/client.ts`) **automatically detects your computer's local Wi-Fi IP** (`Constants.expoConfig?.hostUri`) so requests route seamlessly to your Django backend without hardcoding.

#### 💡 Troubleshooting Expo Go Connection Issues:
If Expo Go spins and says *"Something went wrong"* when scanning the QR code:
1. **Use Tunnel Mode (Recommended)**:
   If your Wi-Fi router has **AP/Client Isolation** enabled (blocking devices from talking to each other) or if your phone is on cellular data:
   ```bash
   pnpm start -- --tunnel
   ```
2. **Same Wi-Fi Network**: Ensure phone and computer are on the same Wi-Fi band.
3. **Windows Firewall**: Make sure Windows Firewall is not blocking incoming connections on port `8081` and `8000`.

---

## 🧪 Type Checking & Scripts

```bash
# Verify strict TypeScript compiler alignment (0 errors)
pnpm tsc --noEmit

# Clear Metro cache and restart
pnpm start --clear

# Run in tunnel mode
pnpm start -- --tunnel
```

---

## 📱 Supported Platforms
- **Android**: 8.0+ (API 26+)
- **iOS**: 15.0+
- **Expo Go**: Compatible with Expo SDK 57
