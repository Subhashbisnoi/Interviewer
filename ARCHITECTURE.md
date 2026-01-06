# AI Interviewer - Architecture & Flow Documentation

## Overview

AI Interviewer is a full-stack application that provides AI-powered mock interviews with personalized feedback. The system uses LangGraph for state management, OpenAI for question generation and evaluation, and supports multiple authentication methods.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router, Vercel Analytics |
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **AI/ML** | LangGraph, OpenAI GPT, LangChain |
| **Database** | PostgreSQL (Production), SQLite (Dev) |
| **Authentication** | JWT, OAuth 2.0 (Google, GitHub) |
| **Payments** | Razorpay |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React)"]
        UI[User Interface]
        AuthCtx[AuthContext]
        ThemeCtx[ThemeContext]
        ToastCtx[ToastContext]
        APIClient[API Client]
    end
    
    subgraph Backend["Backend (FastAPI)"]
        Main[main.py]
        AuthAPI[Auth API]
        InterviewAPI[Interview API]
        PaymentAPI[Payment API]
        TTSAPI[TTS API]
        VoiceAPI[Voice API]
    end
    
    subgraph Core["Core Services"]
        StateManager[LangGraph State Manager]
        Generator[Question Generator]
        Feedback[Feedback Engine]
        Roadmap[Roadmap Generator]
    end
    
    subgraph External["External Services"]
        OpenAI[OpenAI API]
        Google[Google OAuth]
        GitHub[GitHub OAuth]
        Razorpay[Razorpay]
    end
    
    subgraph Storage["Data Layer"]
        DB[(PostgreSQL)]
        Cache[In-Memory Cache]
    end
    
    UI --> APIClient
    APIClient --> Main
    AuthCtx --> APIClient
    
    Main --> AuthAPI
    Main --> InterviewAPI
    Main --> PaymentAPI
    Main --> TTSAPI
    Main --> VoiceAPI
    
    InterviewAPI --> StateManager
    StateManager --> Generator
    StateManager --> Feedback
    StateManager --> Roadmap
    
    Generator --> OpenAI
    Feedback --> OpenAI
    Roadmap --> OpenAI
    
    AuthAPI --> Google
    AuthAPI --> GitHub
    PaymentAPI --> Razorpay
    
    AuthAPI --> DB
    InterviewAPI --> DB
    PaymentAPI --> DB
    StateManager --> Cache
```

---

## Database Schema

```mermaid
erDiagram
    User ||--o{ InterviewSession : has
    User ||--o{ OTP : has
    User ||--o{ Payment : has
    InterviewSession ||--o{ ChatMessage : contains
    
    User {
        int id PK
        string email UK
        string full_name
        string hashed_password
        boolean is_premium
        datetime premium_expiry
        string subscription_tier
        int interviews_remaining
        datetime last_interview_reset
        datetime created_at
    }
    
    OTP {
        int id PK
        int user_id FK
        string email
        string otp_code
        string purpose
        boolean is_used
        datetime expires_at
        datetime created_at
    }
    
    InterviewSession {
        int id PK
        int user_id FK
        string thread_id UK
        string role
        string company
        string resume_text
        string status
        float total_score
        float average_score
        boolean is_pinned
        datetime created_at
        datetime completed_at
    }
    
    ChatMessage {
        int id PK
        int session_id FK
        string thread_id
        string message_type
        text content
        int question_number
        int marks
        json metadata
        datetime created_at
    }
    
    Payment {
        int id PK
        int user_id FK
        string razorpay_order_id UK
        string razorpay_payment_id
        int amount
        string currency
        string status
        string plan_type
        datetime created_at
    }
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as Google/GitHub
    participant DB as Database
    
    alt Email/Password Login
        U->>F: Enter credentials
        F->>B: POST /auth/login
        B->>DB: Verify user
        B->>B: Validate password
        B->>F: Return JWT token
        F->>F: Store token in localStorage
    end
    
    alt Google OAuth
        U->>F: Click Google Login
        F->>G: Redirect to Google
        G->>F: Return credential
        F->>B: POST /auth/google
        B->>G: Verify token
        B->>DB: Find/Create user
        B->>F: Return JWT token
    end
    
    alt GitHub OAuth
        U->>F: Click GitHub Login
        F->>G: Redirect to GitHub
        G->>F: Return auth code
        F->>B: POST /auth/github
        B->>G: Exchange code for token
        B->>G: Get user info
        B->>DB: Find/Create user
        B->>F: Return JWT token
    end
    
    alt Password Reset
        U->>F: Request reset
        F->>B: POST /auth/forgot-password
        B->>B: Generate OTP
        B->>DB: Store OTP
        B->>U: Send email with OTP
        U->>F: Enter OTP
        F->>B: POST /auth/verify-otp
        B->>DB: Validate OTP
        U->>F: Enter new password
        F->>B: POST /auth/reset-password
        B->>DB: Update password
    end
```

---

## Interview Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant SM as State Manager
    participant AI as OpenAI
    participant DB as Database
    
    U->>F: Upload Resume
    F->>B: POST /interview/upload
    B->>B: Extract text from PDF
    B->>F: Return resume text
    
    U->>F: Select Role & Company
    F->>B: POST /interview/start
    B->>SM: Create session
    SM->>AI: Generate 3 questions
    AI->>SM: Return questions
    SM->>DB: Save session & questions
    SM->>F: Return session with questions
    
    loop For each question (1-3)
        F->>U: Display question
        U->>F: Record/type answer
        F->>F: Store answer locally
    end
    
    U->>F: Submit all answers
    F->>B: POST /interview/submit
    B->>SM: Process answers
    SM->>AI: Evaluate each answer
    AI->>SM: Return feedback & marks
    SM->>AI: Generate learning roadmap
    AI->>SM: Return roadmap
    SM->>DB: Save results
    SM->>F: Return complete results
    
    F->>U: Display results & roadmap
```

---

## LangGraph State Machine

```mermaid
stateDiagram-v2
    [*] --> StartInterview
    
    StartInterview --> GenerateQuestions: Initialize session
    GenerateQuestions --> WaitingForAnswers: Questions generated
    
    WaitingForAnswers --> ProcessAnswer: Answer submitted
    ProcessAnswer --> WaitingForAnswers: More questions
    ProcessAnswer --> GenerateFeedback: All answers received
    
    GenerateFeedback --> GenerateRoadmap: Feedback complete
    GenerateRoadmap --> Completed: Roadmap generated
    
    Completed --> [*]
    
    note right of StartInterview
        Creates thread_id
        Stores role, company, resume
    end note
    
    note right of GenerateFeedback
        AI evaluates each answer
        Assigns marks (0-10)
        Calculates total/average
    end note
    
    note right of GenerateRoadmap
        Personalized learning path
        Based on weak areas
    end note
```

---

## Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant R as Razorpay
    participant DB as Database
    
    U->>F: Select subscription plan
    F->>B: POST /payment/create-order
    B->>R: Create order
    R->>B: Return order_id
    B->>DB: Store pending payment
    B->>F: Return order details
    
    F->>R: Open Razorpay checkout
    U->>R: Complete payment
    R->>F: Return payment details
    
    F->>B: POST /payment/verify
    B->>R: Verify signature
    R->>B: Confirm valid
    B->>DB: Update user to premium
    B->>DB: Mark payment complete
    B->>F: Return success
    
    F->>U: Show success & updated status
```

---

## Frontend Routing

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | Home | No | Landing page with interview start form |
| `/interview` | Interview | Yes | Active interview session |
| `/results` | Result | Yes | Interview results & feedback |
| `/dashboard` | Dashboard | Yes | User analytics & stats |
| `/history` | ChatHistory | Yes | Past interview sessions |
| `/pinned` | PinnedResults | Yes | Saved interviews |
| `/leaderboard` | Leaderboard | No | Top performers |
| `/pricing` | Pricing | No | Subscription plans |
| `/settings` | Settings | Yes | User settings |
| `/about` | About | No | About page |
| `/help` | Help | No | FAQ & guides |
| `/contact` | ContactUs | No | Contact form |

---

## API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create new account |
| POST | `/login` | Email/password login |
| POST | `/google` | Google OAuth |
| POST | `/github` | GitHub OAuth |
| GET | `/me` | Get current user |
| POST | `/forgot-password` | Request OTP |
| POST | `/verify-otp` | Verify OTP |
| POST | `/reset-password` | Set new password |

### Interview (`/interview`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload resume PDF |
| POST | `/start` | Start new interview |
| POST | `/submit` | Submit all answers |
| GET | `/sessions` | List user's sessions |
| GET | `/session/{id}` | Get session details |
| GET | `/session/{id}/history` | Get chat history |
| DELETE | `/session/{id}` | Delete session |
| POST | `/session/{id}/pin` | Pin session |
| DELETE | `/session/{id}/pin` | Unpin session |
| GET | `/analytics` | User analytics |
| GET | `/leaderboard` | Top performers |

### Payment (`/payment`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Get pricing plans |
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify` | Verify payment |
| GET | `/status` | Subscription status |
| POST | `/cancel` | Cancel subscription |
| GET | `/history` | Payment history |

---

## Key Components

### Backend Services

| Service | File | Purpose |
|---------|------|---------|
| State Manager | `state_manager.py` | LangGraph workflow for interviews |
| Generator | `generator.py` | Question generation using OpenAI |
| Feedback | `feedback.py` | Answer evaluation and scoring |
| Roadmap | `roadmap.py` | Learning path generation |
| Cache | `cache.py` | In-memory caching |
| Email | `email_utils.py` | OTP email sending |

### Frontend Contexts

| Context | Purpose |
|---------|---------|
| `AuthContext` | User authentication state & methods |
| `ThemeContext` | Dark/light mode toggle |
| `ToastContext` | Notification system |

---

## Subscription Tiers

| Feature | Free | Premium |
|---------|------|---------|
| Interviews/month | 3 | Unlimited |
| Question types | Basic | Advanced |
| Detailed feedback | ❌ | ✅ |
| Learning roadmap | ❌ | ✅ |
| Analytics dashboard | Limited | Full |
| Priority support | ❌ | ✅ |

---

## Environment Variables

### Backend
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

### Frontend
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_GOOGLE_CLIENT_ID=...
REACT_APP_GITHUB_CLIENT_ID=...
REACT_APP_RAZORPAY_KEY_ID=...
```

---

## Deployment Architecture

```mermaid
graph LR
    subgraph Vercel
        FE[React Frontend]
    end
    
    subgraph Render
        BE[FastAPI Backend]
        PG[(PostgreSQL)]
    end
    
    subgraph External
        OAI[OpenAI API]
        RP[Razorpay]
        SMTP[Email SMTP]
    end
    
    User --> FE
    FE --> BE
    BE --> PG
    BE --> OAI
    BE --> RP
    BE --> SMTP
```

---

## File Structure

```
Interviewer/
├── backend/
│   ├── api/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── interview.py     # Interview CRUD operations
│   │   ├── interview_v2.py  # Enhanced interview API
│   │   ├── payment.py       # Razorpay integration
│   │   ├── tts.py           # Text-to-speech
│   │   └── voice.py         # Voice processing
│   ├── migrations/          # Alembic migrations
│   ├── schemas/             # Pydantic schemas
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── database.py          # Database connection
│   ├── state_manager.py     # LangGraph workflow
│   ├── generator.py         # Question generation
│   ├── feedback.py          # Answer evaluation
│   ├── roadmap.py           # Learning roadmap
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client services
│   │   ├── hooks/           # Custom hooks
│   │   └── App.js           # Main app component
│   ├── public/              # Static assets
│   └── package.json         # Node dependencies
│
├── ARCHITECTURE.md          # This file
├── README.md                # Getting started guide
└── render.yaml              # Render deployment config
```

---

## Security Features

1. **JWT Authentication** - Stateless token-based auth with 24-hour expiry
2. **Password Hashing** - bcrypt with automatic salt
3. **CORS Configuration** - Whitelist of allowed origins
4. **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
5. **OAuth 2.0** - Secure third-party authentication
6. **OTP Verification** - Time-limited codes for password reset
7. **Protected Routes** - Frontend route guards for authenticated pages

---

*Last updated: January 2026*
