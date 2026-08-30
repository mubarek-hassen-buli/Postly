# 📱 Postly Mobile Application

<p align="center">
  <img src="assets/images/icon.png" width="100" height="100" alt="Postly Mobile App" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>Native iOS & Android Telegram Channel Management & Broadcasting Application built with React Native and Expo.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.79-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-SDK_53-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Expo_Router-v5-4630EB?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Router" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Zustand-5.x-443E38?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/Zod-Runtime_Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</p>

---

## 📖 Overview

The **Postly Mobile App** provides an intuitive, high-performance, dark-mode-first interface for managing, composing, scheduling, and broadcasting messages to Telegram channels and supergroups.

Built with **React Native** and **Expo SDK 53**, the application delivers a smooth 60fps native feel with haptic feedback, live Telegram preview bubbles, rich text formatting, and resilient offline-friendly server state management.

---

## ✨ Features & User Flows

### 🔐 1. MTProto Authentication & 2FA Flow
- **Phone Number Login**: International phone number validation with formatting helpers.
- **5-Digit OTP Verification**: Smooth auto-focusing numeric input with resend countdown timer.
- **Two-Step Verification (2FA)**: Seamless automatic redirection to cloud password entry for accounts with Telegram Two-Step Verification enabled.
- **Keychain / Keystore Security**: Bearer tokens are stored securely in hardware-backed device storage using `expo-secure-store`.

### 📡 2. Channel Management Hub (`/channels`)
- **Automated Sync**: Pull-to-refresh and on-demand "Sync from Telegram" action.
- **Smart Filtering**: Filter channels by "Can Post Only", "Selected Only", or search by title/username.
- **Channel Detail & Analytics Modal**: Inspect subscriber counts, total posts dispatched, delivery success rates, and member growth.
- **Multi-Channel Target Selection**: Checkbox and multi-pill selectors with instant "Select All" helpers.

### ✍️ 3. Rich Post Composer Modal (`/compose`)
- **Multi-Format Rich Text**: Toggle between **HTML**, **Markdown**, and **Plain Text** modes with live formatting preservation.
- **Formatting Toolbar**: Dedicated action pills for **Bold (`<b>`)**, *Italic (`<i>`)*, `Inline Code (<code>)`, <s>Strikethrough (`<s>`)</s>, ||Spoiler (`<tg-spoiler>`)||, and Hyperlinks (`<a href="...">`).
- **Media Gallery Picker**: Select up to 10 photos or videos from camera roll with direct Cloudinary upload progress.
- **Interactive Live Telegram Preview**: Visualizes your message in an authentic Telegram message bubble mockup with pinned headers and timestamp indicators.
- **Schedule Time Picker**: Set exact execution dates and times for automated broadcast.

### 📜 4. Broadcasts Feed & Post Details (`/`)
- **Status Filter Tabs**: Filter between **All**, **Scheduled**, **Published**, and **Failed** broadcasts.
- **Per-Channel Delivery Pills**: Color-coded badges indicating delivery status per destination channel (`SUCCESS`, `FAILED`, `PENDING`).
- **Quick Actions**: "Publish Now" for immediate broadcasting, "Cancel Schedule" to revert to draft, and "Delete Post".
- **Post Detail Inspector**: Deep inspect raw text, attached media galleries, and Telegram message IDs.

### 🔔 5. Activity Center & UI Feedback
- **Notification Center Modal**: Live log of broadcast deliveries and system alerts with "Mark all as read".
- **Toast Notifications**: Lightweight floating alert banners for error and success events.
- **Crash-Proof Error Boundary**: Graceful error boundary fallback screen with "Reload Screen" recovery.

---

## 📂 Project Structure

```
mobile/
├── src/
│   ├── app/                                # Expo Router file-based screens
│   │   ├── (auth)/                         # Authentication route group
│   │   │   ├── login.tsx                   # Phone number input screen
│   │   │   ├── verify-otp.tsx              # 5-digit code verification screen
│   │   │   └── verify-password.tsx         # 2FA Cloud password screen
│   │   ├── (tabs)/                         # Main bottom-tab layout
│   │   │   ├── index.tsx                   # Broadcasts feed & post management
│   │   │   ├── channels.tsx                # Telegram channel manager & sync
│   │   │   ├── compose-tab.tsx             # Quick composer trigger stub
│   │   │   ├── settings.tsx                # User profile, account info, and logout
│   │   │   └── _layout.tsx                 # Custom floating tab bar navigation
│   │   ├── compose.tsx                     # Fullscreen rich post composer modal
│   │   ├── index.tsx                       # Initial route redirector
│   │   └── _layout.tsx                     # Root layout with QueryProvider & ErrorBoundary
│   │
│   ├── components/                         # Modular UI component library
│   │   ├── channels/                       # ChannelCard, FilterBar, ChannelStatsModal
│   │   ├── common/                         # ErrorBoundary, ToastContainer
│   │   ├── composer/                       # FormattingToolbar, ChannelSelectorPills,
│   │   │                                   # MediaPickerSection, SchedulePickerModal,
│   │   │                                   # PostPreviewModal (Telegram Chat Mockup)
│   │   ├── notifications/                  # NotificationBellButton, NotificationCenterModal
│   │   ├── posts/                          # PostCard, PostFilterBar, PostDetailModal
│   │   └── ui/                             # Button, Card, Input, OtpInput, Header
│   │
│   ├── hooks/                              # TanStack Query custom hooks
│   │   ├── useChannels.ts                  # Channel queries, sync mutations, selection toggles
│   │   ├── usePosts.ts                     # Post feed queries, create, publish-now mutations
│   │   └── useNotifications.ts             # Notification center queries & mark-read
│   │
│   ├── schemas/                            # Zod schemas for runtime form validation
│   │   ├── authSchemas.ts                  # Phone & OTP validation
│   │   └── postSchemas.ts                  # Post composer validation
│   │
│   ├── services/                           # Network & device infrastructure
│   │   ├── api/                            # Axios client with LAN IP detection & token interceptor
│   │   ├── auth/                           # AuthService & Expo SecureStore token storage
│   │   ├── channels/                       # ChannelService & API types
│   │   ├── notifications/                  # NotificationService
│   │   └── posts/                          # PostService & MediaService (Cloudinary uploads)
│   │
│   ├── store/                              # Zustand global state stores
│   │   ├── useAuthStore.ts                 # Auth session & user state
│   │   └── useToastStore.ts                # App-wide toast notifications
│   │
│   └── theme/                              # Design system tokens
│       ├── colors.ts                       # Curated dark color palette
│       ├── typography.ts                   # Font sizes, line heights, and weights
│       ├── spacing.ts                      # Spacing, border radius, and shadow tokens
│       └── index.ts                        # Unified theme export
│
├── assets/                                 # App icons, splash screens, and images
├── app.json                                # Expo configuration (scheme, orientations, icons)
├── package.json                            # Dependencies & npm scripts
└── tsconfig.json                           # TypeScript strict configuration
```

---

## 🎨 Design System

Postly uses a tailored **Slate Dark Palette** designed for focus and readability:

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `primary.DEFAULT` | `#38BDF8` | Brand accent, active tabs, buttons |
| `primary.dark` | `#0284C7` | Button pressed states |
| `background.DEFAULT`| `#0F172A` | Primary screen background (Slate 900) |
| `background.card` | `#1E293B` | Card surfaces & modal backgrounds |
| `background.input`| `#334155` | Form fields and formatting pills |
| `text.primary` | `#F8FAFC` | Primary headings and text |
| `text.secondary` | `#94A3B8` | Secondary labels and metadata |
| `status.success` | `#10B981` | Delivered posts & creator badges |
| `status.error` | `#EF4444` | Broadcast failures & destructive actions |
| `status.warning` | `#F59E0B` | Scheduled indicators & warnings |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: 18+ or 20+
- **pnpm**: (Recommended) `npm install -g pnpm`
- **Expo Go App**: Installed on your physical Android or iOS device (available on App Store / Google Play).

---

### 2. Installation & Running

```bash
# 1. Navigate to the mobile directory
cd mobile

# 2. Install dependencies
pnpm install

# 3. Start the Expo development server
pnpm start
```

### 3. Connecting to the Backend Server

When running locally:
1. Ensure your computer and physical phone are connected to the **same Wi-Fi network**.
2. Make sure the backend Django server is running on `0.0.0.0:8000`:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
3. The mobile app's API client (`mobile/src/services/api/client.ts`) **automatically detects your computer's local Wi-Fi IP** (`Constants.expoConfig?.hostUri`) so API requests from your phone connect seamlessly without hardcoding IP addresses!
4. Scan the QR code displayed in your terminal using **Expo Go** (Android) or the **Camera app** (iOS).

---

## 🧪 Type Checking & Scripts

```bash
# Run TypeScript type check with strict compiler rules
pnpm tsc --noEmit

# Clear Expo Metro cache and restart
pnpm start --clear

# Reset project or reinstall dependencies
pnpm install --force
```

---

## 📱 Supported Platforms
- **Android**: 8.0+ (API 26+)
- **iOS**: 15.0+
- **Expo Go**: Fully compatible with Expo SDK 53
