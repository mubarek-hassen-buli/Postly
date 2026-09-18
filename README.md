# 🚀 Postly — Multi-Platform Social Broadcasting & Analytics Platform

<p align="center">
  <img src="mobile/assets/images/icon.png" width="100" height="100" alt="Postly Logo" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>Unified cross-platform broadcasting, scheduling, and performance analytics for Telegram Channels and LinkedIn feeds.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo_SDK_57-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Django-5.x_REST_Framework-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/Telethon-MTProto_API-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
  <img src="https://img.shields.io/badge/LinkedIn-REST_API_v2-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  <img src="https://img.shields.io/badge/Celery-Distributed_Tasks-37814A?style=for-the-badge&logo=celery&logoColor=white" alt="Celery" />
  <img src="https://img.shields.io/badge/Redis-Cache_&_Broker-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## 📖 Overview

**Postly** is a high-performance cross-platform mobile and backend application built for community managers, content creators, and agencies to orchestrate, schedule, and analyze content across **Telegram channels** and **LinkedIn profiles** from a single, unified command center.

Unlike conventional bot-based tools, Postly connects directly to **Telegram's Native MTProto Client API** (via Telethon) without requiring bot creation or bot administrator additions. In addition, Postly integrates natively with **LinkedIn's OAuth 2.0 and REST API v2**, allowing seamless cross-broadcasting, simultaneous remote post deletion, and real-time visual analytics powered by `react-native-gifted-charts`.

---

## ✨ Key Features

### 🌐 1. Multi-Platform Cross-Broadcasting (Telegram & LinkedIn)
- **Direct Telegram MTProto Engine**: Log in directly with your Telegram phone number and 2FA password. Automatically discovers all broadcast channels and supergroups where you have posting administrative rights.
- **LinkedIn OAuth 2.0 Integration**: Connect your LinkedIn personal profile or company page with one tap. Cross-post to Telegram, LinkedIn, or both simultaneously.
- **Simultaneous Remote Deletion**: Deleting a broadcast in Postly removes the post from Postly and dispatches parallel asynchronous deletion requests to **Telegram channels** (via MTProto `DeleteMessagesRequest`) and **LinkedIn feeds** (via REST `DELETE /v2/ugcPosts/{urn}`).

### 📊 2. Creator Analytics Dashboard
- **Decoupled Analytics Architecture**:
  ```text
  Django Backend (apps.analytics) ➔ TanStack Query ➔ Pre-calculated Analytics State ➔ Gifted Charts
  ```
- **2x2 KPI Metric Cards**: Real-time tracking of Total Broadcasts, Channel Reach, Scheduled Queue, and Delivery Reliability Score.
- **Timeframe Filtering**: Toggle metrics seamlessly across **7 Days (7D)**, **30 Days (30D)**, and **All Time**.
- **Interactive Gifted Charts**:
  - **Broadcast Activity (`PostsChart`)**: Stacked bar chart visualizing delivered, scheduled, and failed broadcasts over time.
  - **Platform Distribution (`PlatformChart`)**: Donut pie chart breaking down broadcast share across Telegram and LinkedIn.
  - **Delivery Trajectory (`EngagementChart`)**: Curved area line chart tracking volume momentum and reliability score.

### 🗂️ 3. Restructured 4-Tab Navigation & 2-Column Grid Posters
- **Tab 1 — Dashboard (`index.tsx`)**: Dedicated analytics hub featuring creator greeting, avatar, unread alert bell, KPI metrics, and charts.
- **Tab 2 — Posters (`posts.tsx`)**: Dedicated broadcast feed with a top search bar, status/platform filter pills (`All`, `Scheduled`, `Telegram`, `LinkedIn`, `Published`, `Failed`), and a responsive **2-column grid layout (`numColumns={2}`)**.
- **Tab 3 — Channels (`channels.tsx`)**: Channel discovery manager displaying subscriber counts, posting permissions, and one-tap MTProto sync.
- **Tab 4 — Settings (`settings.tsx`)**: Account management, active Telegram session details, LinkedIn connection status, and security options.
- **Floating Pill Capsule Bar**: Floating dock design (`#12151B` capsule with `#FFB765` golden peach compose button) that hovers seamlessly over content.

### ✍️ 4. Rich Post Composer
- **Multi-Format Formatting**: Switch between **HTML**, **Markdown**, and **Plain Text** formatting modes.
- **Formatting Toolbar**: Quick pills for **Bold**, *Italic*, `Code`, <s>Strikethrough</s>, ||Spoiler||, and Hyperlinks.
- **Live Interactive Preview**: Pixel-perfect Telegram chat bubble mockup displaying formatted text, attachments, and pinned header previews.
- **Multi-Media Attachments**: Direct uploads of up to 10 photos and videos with Cloudinary backend storage.
- **Target Selection**: Flexible multi-channel pill selector with instant Select All / Deselect All helpers.

### ⚡ 5. Optimistic UI Updates & Fault Tolerance
- **Zero-Wait Optimistic Mutations**: Immediate local UI updates for post deletions, immediate publishing (`Publish Now`), and schedule cancellations with instant rollback on network failures.
- **Celery + Redis Worker Queue**: Resilient asynchronous task queue for scheduled posts with beat reconciliation to prevent missed posts after server restarts.

### 🎨 6. Premium Light Theme Design System
- **Option A (Apple/Stripe Light Palette)**: Cool off-white canvas (`#F6F8FB`), crisp white cards (`#FFFFFF`), dark slate typography (`#0F172A` / `#475569`), fine borders (`#E2E8F0`), and soft Apple-grade shadows.

---

## 🏗️ Architecture & System Design

```mermaid
flowchart TD
    subgraph MobileApp ["Mobile Client (React Native / Expo SDK 57)"]
        UI["UI Screens (Dashboard, Posters 2x2, Channels, Settings)"]
        Composer["Rich Post Composer & Preview Modal"]
        State["Zustand + TanStack Query (Optimistic Updates)"]
        Charts["Gifted Charts (Posts, Platform, Engagement)"]
        Secure["Expo SecureStore (Tokens)"]
        
        UI --> State
        Composer --> State
        State --> Charts
        State --> Secure
    end

    subgraph BackendAPI ["Backend Service (Django REST Framework)"]
        Gateway["DRF API Gateway & Knox Auth Guards"]
        Crypto["Fernet AES-256 Crypto Engine"]
        ChannelSvc["Channel Discovery & Permissions"]
        PostSvc["Publishing & Deletion Orchestrator"]
        AnalyticsSvc["Analytics Aggregation Engine"]
        LinkedInSvc["LinkedIn OAuth & REST Integration"]
        
        Gateway --> Crypto
        Gateway --> ChannelSvc
        Gateway --> PostSvc
        Gateway --> AnalyticsSvc
        Gateway --> LinkedInSvc
    end

    subgraph AsyncWorker ["Background Tasks & Scheduling"]
        CeleryWorker["Celery Worker Queue"]
        CeleryBeat["Celery Beat Scheduler"]
        RedisBroker["Redis Broker & Cache"]
        CeleryBeat --> RedisBroker
        RedisBroker --> CeleryWorker
    end

    subgraph ExternalServices ["External Cloud Services"]
        MTProto["Telegram MTProto Client (Telethon)"]
        LinkedInAPI["LinkedIn REST API v2"]
        Cloudinary["Cloudinary Media CDN"]
    end

    MobileApp <-->|REST API + Bearer Token| BackendAPI
    PostSvc --> RedisBroker
    CeleryWorker --> MTProto
    CeleryWorker --> LinkedInAPI
    PostSvc --> MTProto
    PostSvc --> LinkedInAPI
    ChannelSvc --> MTProto
    Composer --> Cloudinary
```

---

## 📂 Project Structure

```
Postly/
├── backend/                        # Django REST API & Asynchronous Engine
│   ├── apps/
│   │   ├── accounts/               # User models, Telegram Knox authentication & session storage
│   │   ├── analytics/              # Pre-aggregated KPI metrics, time-series, and platform charts
│   │   ├── channels/               # Telegram channel sync, discovery, and member statistics
│   │   ├── common/                 # Standardized pagination, middleware, exceptions
│   │   ├── integrations/           # Third-party platform integrations (LinkedIn OAuth2 & REST)
│   │   │   └── linkedin/           # LinkedIn OAuth callback, status, publisher & remote deletion
│   │   ├── media/                  # Cloudinary upload signatures and attachment handling
│   │   ├── notifications/          # In-app activity logs & notification center
│   │   ├── posts/                  # Post composition, Celery scheduling, and deletion orchestration
│   │   └── telegram_engine/        # Telethon MTProto wrapper, AES-256 session encryption
│   ├── postly_core/                # Django settings, Celery app, ASGI/WSGI
│   ├── manage.py                   # Django CLI
│   └── requirements.txt            # Python dependencies
│
├── mobile/                         # React Native / Expo Mobile Application
│   ├── src/
│   │   ├── app/                    # Expo Router file-based screens
│   │   │   ├── (auth)/             # Login, OTP verification, 2FA password screens
│   │   │   ├── (tabs)/             # Main bottom tabs
│   │   │   │   ├── index.tsx       # Tab 1: Dashboard (KPI metrics & visual Gifted Charts)
│   │   │   │   ├── posts.tsx       # Tab 2: Posters (2-column grid feed, search, filter tabs)
│   │   │   │   ├── channels.tsx    # Tab 3: Channels (Telegram channel manager & sync)
│   │   │   │   ├── settings.tsx    # Tab 4: Settings (Sessions, LinkedIn connect/disconnect)
│   │   │   │   └── _layout.tsx     # Tab bar registration with FloatingTabBar
│   │   │   ├── compose.tsx         # Fullscreen rich post composer modal
│   │   │   └── _layout.tsx         # Root layout with QueryProvider & ErrorBoundary
│   │   ├── components/             # Reusable UI component library
│   │   │   ├── analytics/          # MetricCard, PostsChart, PlatformChart, EngagementChart
│   │   │   ├── channels/           # ChannelCard, ChannelFilterBar, ChannelStatsModal
│   │   │   ├── composer/           # FormattingToolbar, PostPreviewModal, ChannelSelectorPills
│   │   │   ├── dashboard/          # DashboardHeader, ActivityChart
│   │   │   ├── navigation/         # FloatingTabBar (Capsule dock)
│   │   │   ├── notifications/      # NotificationBellButton, NotificationCenterModal
│   │   │   ├── posts/              # PostCard (2-col grid card), PostFilterBar, PostDetailModal
│   │   │   └── ui/                 # Button, Card, Input, OtpInput
│   │   ├── hooks/                  # TanStack Query custom data hooks (useAnalytics, usePosts, etc.)
│   │   ├── services/               # Axios API clients & SecureStore storage
│   │   ├── store/                  # Zustand global state stores (Auth, Toast)
│   │   └── theme/                  # Option A Light Theme tokens (colors, typography, spacing)
│   ├── app.json                    # Expo configuration
│   └── package.json                # Mobile dependencies & scripts
│
├── .gitignore                      # Git exclusion rules
└── README.md                       # Main project documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside `backend/` based on `backend/.env.example`:

```ini
# Django Settings
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,10.0.2.2

# Database (PostgreSQL / SQLite fallback)
DATABASE_URL=postgres://user:password@localhost:5432/postly_db

# Telegram MTProto API Credentials (Obtain from https://my.telegram.org)
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=your_telegram_api_hash_here

# AES-256 Encryption Key for Sessions (Generate with: cryptography.fernet.Fernet.generate_key())
FERNET_SECRET_KEY=your_base64_32byte_fernet_key_here

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# LinkedIn Integration (Developer App from https://www.linkedin.com/developers)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/integrations/linkedin/callback/

# Cloudinary Media Storage (Optional for photo/video uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: 3.11+ or 3.12+
- **Node.js**: 18+ or 20+ (with `pnpm`)
- **Redis**: Running locally or via Docker (`docker run -d -p 6379:6379 redis:alpine`)
- **Telegram API Credentials**: From [my.telegram.org](https://my.telegram.org)

---

### 2. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Run test suite to verify setup (all 67 tests pass)
python manage.py test

# 6. Start Django development server
python manage.py runserver 0.0.0.0:8000
```

*(In a separate terminal, start Celery for scheduled broadcasts)*:
```bash
celery -A postly_core worker --loglevel=info
```

---

### 3. Mobile App Setup

```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Install dependencies
pnpm install

# 3. Start Expo development server
pnpm start
```

> **Tip for Expo Go on Physical Devices:**
> - If your phone and PC are on the same Wi-Fi, scan the QR code directly.
> - If your router has **AP/Client Isolation** enabled or if you are on cellular data, launch with **Tunnel mode**:
>   ```bash
>   pnpm start -- --tunnel
>   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/telegram/send-code/` | Send Telegram login verification code | ❌ |
| `POST` | `/api/v1/auth/telegram/verify-code/` | Verify 5-digit OTP code & authenticate | ❌ |
| `POST` | `/api/v1/auth/telegram/verify-password/` | Verify Telegram 2FA cloud password | ❌ |
| `GET` | `/api/v1/auth/me/` | Fetch authenticated user profile & session | ✅ |
| `POST` | `/api/v1/auth/logout/` | Invalidate token and terminate session | ✅ |
| `GET` | `/api/v1/analytics/dashboard/` | Fetch pre-aggregated KPI metrics & chart data (`?period=7d\|30d\|all`) | ✅ |
| `GET` | `/api/v1/channels/` | List all discovered channels with filters | ✅ |
| `POST` | `/api/v1/channels/sync/` | Trigger real-time MTProto channel synchronization | ✅ |
| `PATCH`| `/api/v1/channels/<id>/toggle-selection/` | Toggle channel selection for broadcasts | ✅ |
| `GET` | `/api/v1/channels/<id>/stats/` | Fetch delivery statistics for a channel | ✅ |
| `GET` | `/api/v1/posts/` | List broadcast feed (filter by status/search) | ✅ |
| `POST` | `/api/v1/posts/` | Compose post (draft, scheduled, or instant to Telegram & LinkedIn) | ✅ |
| `GET` | `/api/v1/posts/<id>/` | Fetch details, media attachments, and delivery targets | ✅ |
| `DELETE`| `/api/v1/posts/<id>/` | Delete post & simultaneously remove from Telegram channels & LinkedIn | ✅ |
| `POST` | `/api/v1/posts/<id>/publish-now/` | Broadcast scheduled post immediately to all platforms | ✅ |
| `POST` | `/api/v1/posts/<id>/cancel-schedule/`| Cancel scheduled post and revert to draft | ✅ |
| `GET` | `/api/v1/notifications/` | Fetch user activity & delivery logs | ✅ |
| `POST` | `/api/v1/notifications/mark-read/` | Mark in-app activity notifications as read | ✅ |
| `GET` | `/api/integrations/linkedin/authorize/` | Generate LinkedIn OAuth 2.0 authorization URL | ✅ |
| `GET` | `/api/integrations/linkedin/callback/` | Handle OAuth 2.0 callback and exchange tokens | ❌ |
| `GET` | `/api/integrations/linkedin/status/` | Check LinkedIn connection status and profile | ✅ |
| `POST` | `/api/integrations/linkedin/disconnect/`| Disconnect LinkedIn account | ✅ |
| `POST` | `/api/integrations/linkedin/publish/` | Publish a post directly to LinkedIn feed | ✅ |

---

## 🧪 Testing & Code Quality

### Backend Automated Test Suite
```bash
cd backend
python manage.py test
```
*Executes all **67 unit and integration tests** covering Telegram MTProto session encryption, Knox authentication, channel discovery, multi-platform publishing, simultaneous remote deletion, and analytics aggregation.*

### Mobile Type Verification & Linting
```bash
cd mobile
pnpm tsc --noEmit
```
*Verifies 100% strict TypeScript alignment across all screens, components, and hooks with **0 errors**.*

---

## 🔒 Security & Privacy

- **Encrypted Sessions**: Telegram MTProto session strings are encrypted at rest using **AES-256 Fernet** cryptography. Raw keys never touch client storage.
- **Client Token Security**: Tokens stored in device hardware keystore (**iOS Keychain / Android Keystore**) via `expo-secure-store`.
- **Cross-Platform Deletion Safeguards**: Deletions execute parallel asynchronous tasks with graceful error handling so partial platform failures do not block database cleanup.
- **Strict Validation**: Every API payload is strictly validated via Django REST Framework serializers on the backend and Zod schemas on mobile.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
