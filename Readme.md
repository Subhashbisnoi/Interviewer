# 🎯 AI Interviewer - InterviewForge

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![React](https://img.shields.io/badge/react-18.0+-61DAFB.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

**The #1 Free AI Interview Practice Platform.**

InterviewForge is an advanced **AI-powered interview preparation platform** that helps you ace your job interviews. Practice **coding**, **system design**, and **behavioral interviews** with our intelligent AI agent. Get **instant feedback**, personalized **learning roadmaps**, and master your technical skills to land your dream job.

Practice unlimited mock interviews online for free or upgrade for advanced analytics.

## ✨ Features

### 🤖 AI-Powered Interview Experience
- **Smart Question Generation**: Get personalized interview questions based on your resume and target role
- **Interactive Interview Interface**: Modern, intuitive interface with real-time responses
- **Instant AI Feedback**: Receive detailed feedback and scoring for each answer
- **Personalized Learning Roadmap**: Get customized improvement plans based on your performance

### 💼 Professional Tools
- **Resume Analysis**: Upload PDF resumes for AI-powered analysis and question generation
- **Company Research**: AI extracts company-specific information for targeted interviews
- **Session Management**: Track your interview sessions, progress, and improvement over time
- **Interview History**: Access all your past interviews and feedback

### 🔐 Authentication & Security
- **Multi-Authentication**: Email/password, Google OAuth, and GitHub OAuth support
- **Secure Sessions**: JWT-based authentication with 24-hour token lifetime
- **User Profiles**: Personalized dashboards and settings

### 💳 Subscription System
- **Free Tier**: 5 interviews per month with basic feedback
- **Premium Tier**: Unlimited interviews with advanced features for ₹49/month or ₹499/year
- **Secure Payments**: Razorpay integration supporting cards, UPI, net banking, and wallets
- **Live Payment Gateway**: Real-time subscription management and billing

## Architecture

The application is built with a modern backend/frontend architecture:

### Backend Stack
- **FastAPI**: High-performance Python web framework with async support
- **PostgreSQL**: Production-ready database with Neon cloud hosting
- **LangChain & LangGraph**: AI/LLM integration for question generation and workflow orchestration
- **Razorpay SDK**: Payment gateway integration for subscriptions
- **JWT Authentication**: Secure token-based authentication system
- **PDF Processing**: Advanced resume text extraction using pdfplumber and PyPDF2
- **SQLAlchemy**: ORM with Alembic migrations for database management

### Frontend Stack
- **React 18**: Modern JavaScript framework with hooks and context
- **Tailwind CSS**: Utility-first CSS framework with dark/light mode
- **React Router DOM v6**: Advanced client-side routing with protected routes
- **Razorpay Checkout**: Integrated payment interface
- **Lucide React**: Beautiful, customizable icons
- **Context API**: State management for authentication, themes, and notifications

## Project Structure

```
interviewer/
├── backend/                 # FastAPI backend
│   ├── api/                # API routes
│   ├── venv/               # Python virtual environment
│   ├── *.py                # Core application files
│   ├── requirements.txt    # Python dependencies
│   └── start.sh           # Backend startup script
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── public/             # Static files
│   ├── package.json        # Node.js dependencies
│   ├── tailwind.config.js  # Tailwind configuration
│   └── start.sh           # Frontend startup script
└── README.md              # This file
```

## 🚀 Live Demo

- **Live Site**: [https://interviewforge.live](https://interviewforge.live)
- **Frontend**: [https://interviewer-frontend.vercel.app](https://interviewer-frontend.vercel.app) (Development)
- **Backend API**: [https://ai-interviewer-backend.onrender.com](https://ai-interviewer-backend.onrender.com)
- **API Documentation**: [https://ai-interviewer-backend.onrender.com/docs](https://ai-interviewer-backend.onrender.com/docs)

## 💰 Pricing Plans

| Feature | Free | Premium |
|---------|------|---------|
| Monthly Interviews | 5 | Unlimited |
| Interview Feedback | Basic | Detailed with scores |
| Learning Roadmap | Limited | Comprehensive |
| Interview History | Last 5 | Full history |
| Priority Support | ❌ | ✅ |
| Advanced Analytics | ❌ | ✅ |
| **Price** | Free | ₹49/month or ₹499/year |

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn
- OpenAI API key (or compatible API)
- Razorpay account (for payments)
- PostgreSQL database (local or cloud)

## ⚡ Quick Start

Get up and running in minutes:

1. **Clone the repo**:
   ```bash
   git clone https://github.com/Subhashbisnoi/Interviewer.git
   cd Interviewer
   ```

2. **Install & Run Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ./start.sh
   ```

3. **Install & Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Setup Instructions

### 1. Environment Setup

Create environment files in both directories:

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Database
DATABASE_URL=sqlite:///./interviewer.db

# JWT Configuration
SECRET_KEY=your-super-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id-here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://openrouter.ai/api/v1  # Optional: for OpenRouter

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Environment
ENVIRONMENT=development
DEBUG=True
```

#### Frontend Environment
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` with your configuration:

```env
REACT_APP_API_URL=http://localhost:8000

# Google OAuth (Optional - for Google Sign-In)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here

# GitHub OAuth (Optional - for GitHub Sign-In)
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id-here

# Razorpay Configuration (for payments)
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

#### Google OAuth Setup (Optional)
If you want to enable Google Sign-In, follow the detailed instructions in `GOOGLE_OAUTH_SETUP.md`.

### 2. Backend Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
./start.sh
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
./start.sh
```

The frontend will run on `http://localhost:3000`

## 📖 Usage Guide

### Getting Started
1. **Sign Up/Login**: Create an account using email/password, Google, or GitHub OAuth
2. **Choose Your Plan**: Start with free tier (5 interviews/month) or upgrade to premium
3. **Upload Resume**: Upload your PDF resume for AI analysis
4. **Set Interview Target**: Specify your target role, company, and experience level

### Interview Process
5. **Start Interview**: AI generates personalized questions based on your profile
6. **Answer Questions**: Provide detailed answers in the interactive interface
7. **Real-time Feedback**: Get instant AI feedback and scoring for each response
8. **Complete Session**: Finish the interview and view comprehensive results

### Post-Interview
9. **Review Feedback**: Analyze detailed feedback and improvement suggestions
10. **Learning Roadmap**: Access your personalized skill development plan
11. **Track Progress**: Monitor improvement across multiple interview sessions
12. **Upgrade Anytime**: Access premium features for unlimited practice

### Premium Features
- **Upgrade from Profile**: Click your profile picture → Select monthly/yearly plan → Pay securely
- **Unlimited Interviews**: Practice as much as you need without limits
- **Advanced Analytics**: Track progress with detailed insights and metrics

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account with email/password
- `POST /auth/login` - User login with credentials
- `POST /auth/google` - Google OAuth authentication
- `POST /auth/github` - GitHub OAuth authentication
- `GET /auth/me` - Get current user profile and subscription status

### Interview Management
- `POST /interview/upload-resume` - Upload resume PDF for analysis
- `POST /interview/start` - Start new interview session
- `POST /interview/submit-answers` - Submit interview answers for feedback
- `GET /interview/session/{session_id}` - Get detailed session information
- `GET /interview/sessions` - List all user interview sessions
- `GET /interview/history` - Get paginated interview history

### Payment & Subscriptions
- `GET /payment/plans` - Get available subscription plans
- `POST /payment/create-order` - Create Razorpay payment order
- `POST /payment/verify` - Verify payment and activate subscription
- `GET /payment/subscription` - Get current subscription status
- `POST /payment/cancel` - Cancel subscription

### Health & Monitoring
- `GET /health` - API health status and system information

## 🛠 Development

### Backend Development
- **FastAPI Framework**: Auto-generated API docs at `/docs` and `/redoc`
- **Database Management**: SQLAlchemy ORM with Alembic migrations
- **Workflow Engine**: LangGraph orchestrates the AI interview process
- **Payment Integration**: Razorpay SDK for subscription management
- **Authentication**: JWT with 24-hour expiration and secure routes

### Frontend Development
- **React 18**: Modern hooks-based architecture with context management
- **Tailwind CSS**: Utility-first styling with custom components
- **Responsive Design**: Mobile-first approach with dark/light mode support
- **State Management**: React Context for auth, themes, and notifications
- **Protected Routes**: Authentication-based access control

### Local Development Setup

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head  # Setup database
python main.py

# Frontend
cd frontend
npm install
npm start
```

## 🚀 Deployment

### Production Environment
- **Frontend**: Deployed on Vercel with automatic GitHub deployments
- **Backend**: Hosted on Render with Docker containerization
- **Database**: Neon PostgreSQL with connection pooling
- **Payments**: Live Razorpay integration with webhook support

### Environment Configuration
- **Development**: Local setup with SQLite/PostgreSQL
- **Staging**: Test environment with Razorpay test keys
- **Production**: Live environment with secure configurations

## Workflow

The interview process follows this workflow:

1. **Resume Upload** → PDF processing and text extraction
2. **Question Generation** → AI generates role-specific questions
3. **Answer Collection** → User provides answers to each question
4. **Feedback Generation** → AI evaluates answers and provides feedback
5. **Roadmap Creation** → Personalized learning plan generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.

## 🎯 Current Features (Completed)

- ✅ **Full Authentication System**: Email/password, Google OAuth, GitHub OAuth
- ✅ **Premium Subscription System**: Razorpay integration with live payments
- ✅ **AI Interview Engine**: LangGraph-powered workflow with personalized questions
- ✅ **Resume Analysis**: Advanced PDF processing with company research
- ✅ **Real-time Feedback**: Instant AI scoring and improvement suggestions
- ✅ **Learning Roadmaps**: Personalized skill development plans
- ✅ **Session Management**: Complete interview history and progress tracking
- ✅ **Responsive UI**: Mobile-friendly interface with dark/light modes
- ✅ **Production Deployment**: Vercel (frontend) + Render (backend) + Neon (database)

## 🚀 Future Enhancements

- 📹 **Video Interview Support**: Practice with AI-powered video interviews
- 🎤 **Voice Recognition**: Answer questions using speech-to-text
- 📊 **Advanced Analytics**: Detailed performance metrics and industry benchmarks
- 🏢 **Company-Specific Prep**: Tailored questions for specific companies
- 👥 **Group Interviews**: Practice panel and group interview scenarios
- 🎓 **Learning Integration**: Connect with Coursera, Udemy, and other platforms
- 📱 **Mobile App**: Native iOS and Android applications
- 🌍 **Multi-language Support**: Interview practice in multiple languages
