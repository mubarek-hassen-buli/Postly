# 🚀 Postly — Telegram Channel Management & Broadcasting Platform

<p align="center">
  <img src="mobile/assets/images/icon.png" width="100" height="100" alt="Postly Logo" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>Direct MTProto Telegram channel broadcasting, scheduling, and management platform for content creators and community admins.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo_SDK_53-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Django-5.x_REST_Framework-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/Telethon-MTProto_API-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
  <img src="https://img.shields.io/badge/Celery-Distributed_Tasks-37814A?style=for-the-badge&logo=celery&logoColor=white" alt="Celery" />
  <img src="https://img.shields.io/badge/Redis-Cache_&_Broker-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## 📖 Overview

**Postly** is a cross-platform mobile and backend application that empowers Telegram community leaders, businesses, and channel administrators to manage and publish content across multiple Telegram channels simultaneously.

Unlike traditional Telegram tools that require creating and adding bot bots to channels, Postly interfaces directly with **Telegram's Native MTProto Client API** via **Telethon**. Users log in directly with their Telegram account, automatically discovering their owned channels and supergroups, and broadcast rich media posts, scheduled campaigns, and pinned announcements from a single, unified interface.

---

## ✨ Key Features

### 🔐 Direct MTProto Telegram Authentication
- **Native User Session Login**: Sign in using your Telegram phone number with official SMS / Telegram login codes and Two-Step Verification (2FA Cloud Password) support.
- **Enterprise-Grade Security**: Telegram MTProto session strings are encrypted at rest using **AES-256 Fernet** cryptography. Raw keys and credentials never touch client storage.
- **Token-Based Mobile Auth**: Secure, short-lived Knox bearer tokens stored in device **iOS Keychain / Android Keystore** via `expo-secure-store`.

### 📡 Automated Channel Discovery & Management
- **Automatic Permission Discovery**: Discovers all broadcast channels and supergroups where the user has creator or posting administrative rights.
- **Channel Health & Stats**: Track subscriber counts, post delivery statuses, message IDs, and broadcast statistics.
- **One-Touch Channel Toggle**: Multi-channel selection pills with instant "Select All / Deselect All" helpers.

### ✍️ Rich Post Composer
- **Multi-Format Rich Text**: Switch seamlessly between **HTML**, **Markdown**, and **Plain Text** formats.
- **Formatting Toolbar**: Dedicated quick-action pills for **Bold**, *Italic*, `Inline Code`, <s>Strikethrough</s>, ||Spoiler||, and Hyperlinks.
- **Interactive Live Preview**: Preview your post in a pixel-perfect Telegram chat bubble mockup with pinned headers and timestamp indicators before broadcasting.
- **Multi-Media Albums**: Attach up to 10 photos and videos with Cloudinary-backed direct uploads.

### ⏱️ Resilient Scheduling & Automation
- **Scheduled Broadcasting**: Set precise execution times for future broadcasts.
- **Celery + Redis Task Queue**: Scheduled posts execute via Celery workers with optimistic locking, preventing race conditions or duplicate deliveries.
- **Beat Reconciliation**: Background beat task reconciles any overdue posts due to server restarts or network interruptions.

### 🔔 Activity Center & Polished UX
- **In-App Notification Center**: Track real-time broadcast successes, delivery failures, and system alerts.
- **Refined Dark Design System**: Curated dark palette (`#0F172A`, `#1E293B`, `#38BDF8`), smooth haptic feedback, custom error boundaries, and toast notifications.

---

## 🏗️ Architecture & System Design

```mermaid
flowchart TD
    subgraph MobileApp ["Mobile Client (React Native / Expo SDK 53)"]
        UI["UI Screens & Composer"]
        State["Zustand + TanStack Query"]
        Secure["Expo SecureStore (Tokens)"]
        UI --> State
        State --> Secure
    end

    subgraph BackendAPI ["Backend Service (Django REST Framework)"]
        Gateway["DRF API Gateway & Auth Guards"]
        Crypto["Fernet AES-256 Engine"]
        ChannelSvc["Channel Sync & Perm Service"]
        PostSvc["Publishing & Composer Service"]
        Gateway --> Crypto
        Gateway --> ChannelSvc
        Gateway --> PostSvc
    end

    subgraph AsyncWorker ["Background Tasks & Scheduling"]
        CeleryWorker["Celery Worker Queue"]
        CeleryBeat["Celery Beat Scheduler"]
        RedisBroker["Redis Broker & Cache"]
        CeleryBeat --> RedisBroker
        RedisBroker --> CeleryWorker
    end

    subgraph TelegramCore ["Telegram Cloud (MTProto)"]
        MTProto["Telethon MTProto Client"]
        TGChannels["Telegram Channels & Groups"]
        MTProto --> TGChannels
    end

    MobileApp <-->|REST API + Bearer Token| BackendAPI
    PostSvc --> RedisBroker
    CeleryWorker --> MTProto
    PostSvc --> MTProto
    ChannelSvc --> MTProto
```

---

## 📂 Project Structure

```
Postly/
├── backend/                        # Django REST API & Celery Engine
│   ├── apps/
│   │   ├── accounts/               # User models, Telegram auth & session storage
│   │   ├── channels/               # Channel sync, discovery, and statistics
│   │   ├── common/                 # Standardized pagination, middleware, exceptions
│   │   ├── notifications/          # In-app activity logs & notification center
│   │   ├── posts/                  # Post composition, scheduling, and publishing
│   │   └── telegram_engine/        # Telethon client wrapper, crypto & session management
│   ├── postly_core/                # Django settings, ASGI/WSGI, and Celery app
│   ├── manage.py                   # Django management CLI
│   └── requirements.txt            # Python dependencies
│
├── mobile/                         # React Native / Expo Mobile Application
│   ├── src/
│   │   ├── app/                    # Expo Router file-based screens
│   │   │   ├── (auth)/             # Login, OTP verification, 2FA password screens
│   │   │   ├── (tabs)/             # Broadcasts feed, Channels manager, Settings
│   │   │   └── compose.tsx         # Rich post composer modal
│   │   ├── components/             # Reusable atomic UI components & modals
│   │   ├── hooks/                  # TanStack Query custom data hooks
│   │   ├── schemas/                # Zod runtime validation contracts
│   │   ├── services/               # Axios API clients & SecureStore storage
│   │   ├── store/                  # Zustand global application state
│   │   └── theme/                  # Color tokens, typography, and spacing system
│   ├── app.json                    # Expo configuration
│   └── package.json                # Mobile dependencies & scripts
│
├── .gitignore                      # Git exclusion rules
└── README.md                       # Documentation
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
- **Redis**: Running locally or via Docker
- **Telegram API Credentials**: From [my.telegram.org](https://my.telegram.org)

---

### 2. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Run test suite to verify setup
python manage.py test

# 6. Start Django development server
python manage.py runserver 0.0.0.0:8000
```

*(In a separate terminal, start the Celery worker for scheduling)*:
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

> **Tip for Physical Device Testing:** When scanning the QR code in Expo Go from a physical phone on the same Wi-Fi network, the mobile API client automatically connects to your computer's LAN IP address.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/telegram/send-code/` | Send Telegram SMS / in-app verification code | ❌ |
| `POST` | `/api/v1/auth/telegram/verify-code/` | Verify 5-digit OTP code & authenticate | ❌ |
| `POST` | `/api/v1/auth/telegram/verify-password/` | Verify Telegram 2FA cloud password | ❌ |
| `GET` | `/api/v1/auth/me/` | Fetch authenticated user profile & session | ✅ |
| `POST` | `/api/v1/auth/logout/` | Invalidate token and terminate session | ✅ |
| `GET` | `/api/v1/channels/` | List all discovered channels with filters | ✅ |
| `POST` | `/api/v1/channels/sync/` | Trigger real-time MTProto channel synchronization | ✅ |
| `PATCH`| `/api/v1/channels/<id>/toggle-selection/` | Toggle channel selection for broadcasts | ✅ |
| `GET` | `/api/v1/channels/<id>/stats/` | Fetch delivery statistics for a channel | ✅ |
| `GET` | `/api/v1/posts/` | List broadcast feed (filtered by status/channel) | ✅ |
| `POST` | `/api/v1/posts/` | Compose a new post (draft, scheduled, or instant) | ✅ |
| `GET` | `/api/v1/posts/<id>/` | Fetch full details and delivery status of a post | ✅ |
| `DELETE`| `/api/v1/posts/<id>/` | Delete a post from history | ✅ |
| `POST` | `/api/v1/posts/<id>/publish-now/` | Broadcast a draft or scheduled post immediately | ✅ |
| `POST` | `/api/v1/posts/<id>/cancel-schedule/`| Cancel a scheduled post broadcast | ✅ |
| `GET` | `/api/v1/notifications/` | Fetch user activity & delivery logs | ✅ |
| `POST` | `/api/v1/notifications/mark-read/` | Mark in-app activity notifications as read | ✅ |

---

## 🧪 Testing & Code Quality

### Backend Automated Test Suite
```bash
cd backend
python manage.py test
```
*Executes all 42 unit, integration, and security tests across authentication, channel discovery, post lifecycle, and error isolation.*

### Mobile Type Verification & Linting
```bash
cd mobile
pnpm tsc --noEmit
```

---

## 🔒 Security & Privacy

- **Session Security**: MTProto sessions are never exposed to the client and remain securely encrypted in the database.
- **Authentication Barriers**: All business API endpoints require cryptographic token verification (`IsAuthenticated`).
- **Input Sanitization & Validation**: All payloads undergo strict schema validation via DRF Serializers on backend and Zod on mobile.
- **Atomic Concurrency**: Database mutations are isolated within strict database transactions with optimistic concurrency control (`OCC`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
