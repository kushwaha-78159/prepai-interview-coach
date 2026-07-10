# PrepAI - Deployment & Setup Guide

## Overview

PrepAI is an AI-powered interview preparation platform built with Next.js, TypeScript, Tailwind CSS, and powered by Google Gemini API. This guide covers setup, configuration, and deployment.

## Prerequisites

- Node.js 18+ and pnpm
- Google Gemini API key (free tier available at https://aistudio.google.com/app/apikey)
- Manus OAuth credentials (provided by Manus platform)
- MySQL/TiDB database connection

## Environment Variables

The following environment variables are automatically configured by Manus:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing secret |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `OWNER_OPEN_ID` | Owner's Manus OAuth ID |
| `OWNER_NAME` | Owner's name |
| `BUILT_IN_FORGE_API_URL` | Manus built-in APIs URL |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in APIs key |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend access to Manus APIs |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Manus APIs URL |
| `GEMINI_API_KEY` | Google Gemini API key (must be configured) |

## Setup Instructions

### 1. Configure Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key
4. In the Manus Management UI, go to Settings → Secrets
5. Add `GEMINI_API_KEY` with your copied key

### 2. Database Setup

The database schema is automatically created on first deployment. Tables include:

- **users**: User authentication and profile data
- **resumes**: Uploaded resume files with S3 references
- **interviewSessions**: Mock interview session records
- **interviewQA**: Question and answer pairs with scores and feedback

### 3. Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm check

# Build for production
pnpm build
```

## Architecture Overview

### Frontend (React + TypeScript)

- **Landing Page**: Hero section with features overview and CTAs
- **Dashboard**: User statistics and quick actions
- **Resume Management**: Upload, analyze, and manage resumes
- **Interview Setup**: Select job role and configure interview parameters
- **Interview Session**: Real-time Q&A with chat interface and timer
- **Interview Report**: Performance analytics with charts and feedback

### Backend (Express + tRPC)

- **Resume Router**: Upload, analyze, and manage resumes
- **Interview Router**: Session management, question generation, answer evaluation
- **LLM Service**: Gemini API integration for analysis and question generation
- **Resume Parser**: Extract text from PDF and text files
- **Database Helpers**: Query helpers for all database operations

### Database Schema

```
users
├── id (PK)
├── openId (unique, from Manus OAuth)
├── name, email
├── role (user/admin)
└── timestamps

resumes
├── id (PK)
├── userId (FK)
├── fileName, fileKey, fileUrl (S3)
├── mimeType, fileSize
├── parsedContent (extracted text)
├── analysis (JSON: strengths, weaknesses, suggestions)
└── timestamps

interviewSessions
├── id (PK)
├── userId (FK)
├── resumeId (FK, optional)
├── jobRole, jobDescription
├── status (in_progress/completed/abandoned)
├── totalQuestions, questionsAnswered
├── overallScore, durationSeconds
└── timestamps

interviewQA
├── id (PK)
├── sessionId (FK)
├── questionNumber
├── question, userAnswer
├── feedback, score
├── improvementTips (JSON array)
└── timestamps
```

## Features

### Resume Analysis
- Upload PDF or text resumes
- AI-powered analysis identifying strengths, weaknesses, and improvements
- Cached analysis results for quick retrieval

### Mock Interviews
- 10+ job role options (Frontend, Backend, Data Science, etc.)
- AI-generated role-specific questions
- Optional job description input for customized questions
- 6 questions per session (~15-20 minutes)

### Interview Session
- Real-time Q&A chat interface
- Text or voice input (voice recording with transcription)
- Interview timer
- Dynamic feedback after each answer
- Automatic score calculation

### Performance Reports
- Overall score (0-10)
- Per-question breakdown with scores
- Detailed feedback for each answer
- Improvement tips and suggestions
- Visual analytics with charts (bar, radar, line)
- Interview history tracking

## API Endpoints

### Resume Routes
- `POST /api/trpc/resume.upload` - Upload resume
- `GET /api/trpc/resume.list` - Get user's resumes
- `GET /api/trpc/resume.get` - Get specific resume
- `POST /api/trpc/resume.analyze` - Analyze resume with AI
- `POST /api/trpc/resume.delete` - Delete resume

### Interview Routes
- `POST /api/trpc/interview.startSession` - Start new interview
- `GET /api/trpc/interview.listSessions` - Get user's sessions
- `GET /api/trpc/interview.getSession` - Get session with Q&A
- `POST /api/trpc/interview.getNextQuestion` - Generate next question
- `POST /api/trpc/interview.submitAnswer` - Submit and evaluate answer
- `POST /api/trpc/interview.completeSession` - Complete interview

## Deployment

### Manus Platform Deployment

1. Create a checkpoint in the Management UI
2. Click the "Publish" button
3. Configure custom domain (optional)
4. Select hosting mode (Autoscale or Reserved)
5. Deploy

### Manual Deployment

For external hosting (Railway, Render, Vercel):

```bash
# Build production bundle
pnpm build

# Start production server
npm run start
```

**Note**: Manus provides built-in hosting with automatic scaling. External hosting may require additional configuration for database connections and environment variables.

## Performance Considerations

### Frontend
- Code-split large chunks using dynamic imports
- Lazy load chart components
- Optimize image assets
- Cache API responses with React Query

### Backend
- Cache resume analysis results
- Batch database queries where possible
- Use connection pooling for database
- Implement rate limiting for LLM API calls

## Security

- All authentication via Manus OAuth
- Protected routes require authentication
- Database credentials in environment variables
- API keys never exposed to frontend
- CORS configured for trusted domains
- Input validation on all endpoints

## Troubleshooting

### Gemini API Key Not Working
- Verify key is valid at https://aistudio.google.com/app/apikey
- Check that key is properly set in environment variables
- Ensure API is enabled in Google Cloud Console

### Database Connection Issues
- Verify DATABASE_URL format
- Check database credentials
- Ensure database is accessible from deployment environment
- For TiDB: enable SSL connection if required

### Resume Upload Failures
- Check file size (max 10MB)
- Verify file format (PDF or text)
- Ensure S3 storage is configured
- Check file permissions

### Interview Session Errors
- Verify Gemini API key is valid
- Check database connectivity
- Ensure resume content is properly parsed
- Review server logs for detailed errors

## Monitoring

Monitor the following metrics in production:

- API response times (target: <2s)
- Database query performance
- Gemini API rate limits
- Error rates and logs
- User authentication success rate
- Resume upload success rate
- Interview completion rate

## Support

For issues or questions:
1. Check `.manus-logs/devserver.log` for local development issues
2. Review server logs in production dashboard
3. Verify all environment variables are set correctly
4. Test API endpoints with curl or Postman

## Future Enhancements

- Real Whisper API integration for voice transcription
- S3 file storage integration
- PDF parsing with pdf-parse library
- Interview history filtering and sorting
- Export reports as PDF
- Email notifications
- Mobile app version
- Collaborative interview practice
- Leaderboards and achievements
