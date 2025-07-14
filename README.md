# Flux - Get Instant Mentorship

> Flux is an expert consultation platform that helps students and freelancers get affordable, fast, and personalized advice from industry experts, all through a simple pay-per-minute model.


[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [License](#license)

## Features

- **Video Conferencing** - High-quality video calls powered by Stream.io
- **Real-time Chat** - WebSocket-based messaging with file sharing
- **Mentor Discovery** - Advanced search and filtering system
- **Payment Integration** - Secure wallet system with Razorpay
- **Email Notifications** - Automated communication system
- **OAuth Authentication** - Google OAuth 2.0 integration

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (Google OAuth)
- **Payments**: Razorpay
- **File Storage**: Cloudinary
- **Real-time**: WebSockets (ws)
- **Video/Chat**: Stream.io SDK
- **Email**: Nodemailer with Handlebars

### Frontend
- **Framework**: React.js + Vite
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Installation

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
```

## Usage

1. **Start the backend server**:
   ```bash
   cd backend && npm run dev
   ```

2. **Start the frontend development server**:
   ```bash
   cd frontend && npm run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/google` | Initiate Google OAuth |
| `GET` | `/api/auth/google/callback` | Handle Google OAuth callback |
| `GET` | `/api/auth/current-user` | Get authenticated user info |
| `GET` | `/api/auth/logout` | Logout user |

### User Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/user/` | Get all users | Admin |
| `PUT` | `/api/user/profile` | Update user profile | User |
| `DELETE` | `/api/user/:userId` | Delete user | Admin |

### Mentor Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/mentor/mentordata` | Get mentors with filters | Public |
| `GET` | `/api/mentor/profile/:mentorId` | Get mentor profile | Public |
| `POST` | `/api/mentor/onboard` | Submit mentor application | User |
| `GET` | `/api/mentor/applications/pending` | Get pending applications | Admin |
| `PUT` | `/api/mentor/application/:mentorId` | Approve/reject mentor | Admin |
| `PUT` | `/api/mentor/profile` | Update mentor profile | Mentor |
| `GET` | `/api/mentor/availability` | Get mentor availability | Mentor |
| `PUT` | `/api/mentor/availability` | Update mentor availability | Mentor |
| `PUT` | `/api/mentor/online-status` | Update online status | Mentor |

#### Query Parameters for `/api/mentor/mentordata`
- `area` - Filter by mentoring area
- `maxRate` - Maximum rate per minute
- `experience` - Minimum years of experience
- `search` - Search in name, headline, bio
- `page` - Page number for pagination
- `limit` - Items per page

### Session Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/session/book` | Book a session with mentor | User |
| `POST` | `/api/session/:sessionId/start` | Start session | Mentor |
| `POST` | `/api/session/:sessionId/end` | End session | User/Mentor |
| `GET` | `/api/session/:sessionId` | Get session details | User/Mentor |
| `GET` | `/api/session/my-sessions` | Get user's sessions | User |
| `PUT` | `/api/session/:sessionId/status` | Update session status | User/Mentor |
| `POST` | `/api/session/:sessionId/feedback` | Add session feedback/rating | Student |

### Payment & Wallet

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/payment/wallet-balance` | Get wallet balance | User |
| `GET` | `/api/payment/transactions` | Get transaction history | User |
| `POST` | `/api/payment/create-order` | Create Razorpay order | User |
| `POST` | `/api/payment/verify` | Verify payment | User |
| `POST` | `/api/payment/deduct` | Deduct from wallet | User |

#### Query Parameters for `/api/payment/transactions`
- `page` - Page number for pagination
- `limit` - Items per page

### Streaming & Communication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/stream/tokens/:sessionId` | Get Stream tokens for session | User/Mentor |
| `POST` | `/api/stream/init/:sessionId` | Initialize session channels | User/Mentor |
| `POST` | `/api/stream/chat/message/:sessionId` | Store chat message | User/Mentor |

### File Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/upload/:sessionId/upload` | Upload file to session | User/Mentor |

## Project Structure

```
flux/
├── backend/                    # Node.js/Express API Server
│   ├── config/                 # Configuration files
│   ├── middleware/             # Custom middleware
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic services
│   ├── utils/                  # Utility functions
│   └── views/                  # Email templates
└── frontend/                   # React.js Client
    ├── src/
    │   ├── components/         # Reusable components
    │   ├── pages/              # Page components
    │   ├── hooks/              # Custom hooks
    │   ├── store/              # State management
    │   └── lib/                # Utilities
    └── public/                 # Static assets
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for the mentorship community</p> 