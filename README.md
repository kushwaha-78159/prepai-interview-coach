# PrepAI - AI-Powered Interview & Resume Coach

A premium, dark-themed web application that helps professionals prepare for job interviews through AI-powered resume analysis and dynamic mock interviews with real-time feedback.

## Features

- **Resume Analysis**: Upload your resume (PDF/DOCX) and get AI-powered feedback on strengths, weaknesses, keywords, and improvement suggestions
- **Dynamic Mock Interviews**: Practice with AI-generated interview questions tailored to your target role and resume
- **Real-time Feedback**: Get instant scoring and detailed feedback on each answer
- **Analytics Dashboard**: View comprehensive reports with category breakdowns (communication, technical, confidence)
- **Interview History**: Track all your past interviews and review detailed reports
- **Dark Theme**: Premium, elegant dark-themed UI with smooth animations
- **Manus OAuth**: Secure authentication via Manus OAuth

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Wouter (routing)
- **Backend**: Node.js, Express, tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI/LLM**: Manus built-in LLM API (Claude, GPT, Gemini)
- **File Storage**: AWS S3 (via Manus storage proxy)
- **Charts**: Recharts
- **Testing**: Vitest

## Project Structure

```
prepai/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities (tRPC client)
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── App.tsx           # Main app with routing
│   │   └── index.css         # Global styles with dark theme
│   └── public/               # Static files
├── server/                    # Node.js backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── storage.ts            # S3 storage helpers
│   ├── routers.test.ts       # Vitest tests
│   └── _core/                # Framework plumbing
├── drizzle/                   # Database schema & migrations
│   ├── schema.ts             # Table definitions
│   └── migrations/           # Generated SQL migrations
├── shared/                    # Shared types and constants
└── package.json              # Dependencies and scripts
```

## Database Schema

### Tables

- **users**: User accounts with OAuth integration
- **resumes**: Uploaded resumes with parsed text and AI analysis
- **interviews**: Interview sessions with scores
- **interview_questions**: AI-generated questions for each interview
- **interview_answers**: User answers with AI feedback and scores

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database
- Manus account with OAuth and LLM API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd prepai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The following environment variables are automatically injected by Manus:
   - `DATABASE_URL`: MySQL connection string
   - `JWT_SECRET`: Session signing secret
   - `VITE_APP_ID`: Manus OAuth application ID
   - `OAUTH_SERVER_URL`: Manus OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL`: Manus login portal URL
   - `BUILT_IN_FORGE_API_URL`: Manus API URL
   - `BUILT_IN_FORGE_API_KEY`: Manus API key (server-side)
   - `VITE_FRONTEND_FORGE_API_KEY`: Manus API key (frontend)

4. **Initialize the database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Development

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm check
```

### Building for Production

```bash
pnpm build
pnpm start
```

## API Routes

All API routes are under `/api/trpc` and use tRPC for type-safe RPC calls.

### Resume Procedures

- `resume.upload`: Upload and analyze a resume
- `resume.list`: Get user's resumes
- `resume.get`: Get specific resume with analysis

### Interview Procedures

- `interview.start`: Start a new interview session
- `interview.get`: Get interview details with questions and answers
- `interview.list`: Get user's interview history
- `interview.submitAnswer`: Submit an answer and get AI feedback
- `interview.complete`: Complete interview and calculate scores

### Auth Procedures

- `auth.me`: Get current user
- `auth.logout`: Logout current user

## Key Features Implementation

### Resume Analysis

1. User uploads PDF/DOCX resume
2. File is stored in S3
3. Text is extracted and sent to LLM
4. LLM analyzes and returns:
   - Strengths (3-5 items)
   - Weaknesses (3-5 items)
   - Keywords (5-10 items)
   - Suggestions (3-5 items)
   - Overall score (1-10)

### Interview Flow

1. User selects resume and target job role
2. Optional: Provide job description
3. AI generates 5 role-specific questions
4. User answers each question
5. AI evaluates each answer with:
   - Score (1-10)
   - Feedback
   - Ideal answer example
   - Improvement tips
6. Interview completes with overall scores by category

### Analytics

- Overall score (average of all answers)
- Communication score (average of communication questions)
- Technical score (average of technical questions)
- Confidence score (average of confidence questions)
- Per-question performance chart
- Detailed feedback for each question

## Dark Theme

The application uses a premium dark theme with:
- Dark background: `oklch(0.141 0.005 285.823)`
- Light foreground: `oklch(0.85 0.005 65)`
- Blue accent: `#3b82f6`
- Smooth transitions and hover effects

All colors are defined in `client/src/index.css` using CSS variables for consistency.

## Performance Considerations

- Lazy loading of pages via Wouter
- Optimized database queries with Drizzle ORM
- S3 storage for file handling
- Streaming LLM responses
- Memoized React components where needed

## Security

- Manus OAuth for authentication
- Protected routes via `protectedProcedure`
- JWT session cookies
- Server-side LLM API calls (keys not exposed to frontend)
- S3 presigned URLs for file access

## Troubleshooting

### Database Connection Issues

Ensure `DATABASE_URL` is correctly set and the database is running.

### LLM API Errors

Check that `BUILT_IN_FORGE_API_KEY` and `BUILT_IN_FORGE_API_URL` are correctly configured.

### File Upload Issues

Verify S3 storage is accessible and file size is under 10MB.

### Authentication Issues

Clear cookies and restart the dev server. Ensure `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct.

## Future Enhancements

- Real PDF/DOCX text extraction
- Voice-based interview practice
- Interview recording and playback
- Peer comparison and benchmarking
- Export reports as PDF
- Email notifications
- Mobile app (React Native)
- Advanced analytics and progress tracking

## Testing

The project includes comprehensive vitest tests covering:
- Authentication flow
- Protected procedures
- Input validation
- Error handling

Run tests with:
```bash
pnpm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Run `pnpm check` and `pnpm test`
5. Submit a pull request

## License

MIT

## Support

For issues or questions, please contact the development team or open an issue on GitHub.

---

**Built with ❤️ using Manus**
