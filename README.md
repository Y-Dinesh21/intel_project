# AI_LearnHub

## Overview
AI_LearnHub is a modern, AI-powered educational web application that helps students learn more effectively. It provides personalized study materials, interactive quizzes, and an AI tutor, all within a beautiful and responsive interface.

---

## Features
- **AI Study Material Generator:** Create summaries, notes, flashcards, and outlines for any topic and subject.
- **AI Tutor:** Chat with an AI-powered tutor for instant help and explanations.
- **AI Quiz System:** Generate and take custom quizzes, with instant feedback and explanations.
- **Learning Path & Progress Dashboard:** Visualize your learning journey and track your progress, XP, and streaks.
- **Authentication:** Simple login with demo account support.
- **Analytics:** Track your study sessions, quiz scores, and AI feature usage.
- **Modern UI:** Built with React, Tailwind CSS, and shadcn/ui for a responsive, accessible experience.

---

## Project Structure
```text
AI_LearnHub/
  ├── public/                # Static assets
  ├── src/
  │   ├── App.tsx            # Main app component
  │   ├── main.tsx           # Entry point
  │   ├── index.css          # Global styles (Tailwind)
  │   ├── components/
  │   │   ├── auth/          # Login page
  │   │   ├── learning/      # AI Tutor, Quiz, Study Material, etc.
  │   │   └── ui/            # Reusable UI components
  │   ├── hooks/             # Custom React hooks
  │   ├── lib/               # Utility functions
  │   └── pages/             # Top-level pages (Index, NotFound)
  ├── package.json           # Project metadata and scripts
  ├── tailwind.config.ts     # Tailwind CSS config
  └── vite.config.ts         # Vite config
```

---

## Setup & Installation

### Prerequisites
- Node.js (v16+ recommended)
- npm (comes with Node.js) or bun

### Steps
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd AI_LearnHub
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root directory:
     ```env
     VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
     ```
   - Replace all instances of `YOUR_OPENROUTER_API_KEY_HERE` in the code with `import.meta.env.VITE_OPENROUTER_API_KEY` for security.

4. **Run the app in development mode:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

---

## Usage
- **Login:** Use a demo account or your credentials.
- **Generate Study Materials:** Enter a subject and topic, select type and difficulty, and generate content.
- **Chat with AI Tutor:** Ask questions and get instant explanations.
- **Take AI Quizzes:** Generate and answer quizzes on any topic.
- **Track Progress:** View your XP, streaks, and completed lessons on the dashboard.

---

## Security Notes
- **Never commit real API keys to your repository.**
- Always use environment variables for sensitive data.
- Add `.env` to your `.gitignore`.

---

## License
[MIT](LICENSE)
