# QuizWhiz 🧠⚡

A real-time interactive quiz platform built with Next.js, featuring AI-powered quiz generation and live multiplayer gameplay.

## 🌟 Features

- **Interactive Quiz Creation**: Build custom quizzes with multiple question types
- **AI-Powered Assistance**: Generate quiz categories and content suggestions using AI
- **Real-time Multiplayer**: Live quiz sessions with WebSocket connectivity
- **Modern UI**: Responsive design with dark/light mode support
- **Game Hosting**: Host live quiz sessions with PIN-based player joining
- **Live Leaderboards**: Real-time score tracking and rankings
- **Media Support**: Upload and display images in quiz questions

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Real-time**: WebSocket integration
- **AI Integration**: Custom AI service for content generation (experimental)
- **Deployment**: Render (ready for production)

## 📁 Project Structure

```
quiz-whiz/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── dashboard/          # Quiz management dashboard
│   │   ├── game/              # Game hosting and player interfaces
│   │   ├── quiz/              # Quiz creation and editing
│   │   └── globals.css        # Global styles and theme variables
│   ├── components/            # Reusable React components
│   │   ├── ui/               # Shadcn/ui base components
│   │   ├── CreateQuizForm.tsx # Quiz creation interface
│   │   ├── GameHost.tsx      # Host game controls
│   │   └── PlayerInterface.tsx # Player game interface
│   ├── hooks/                # Custom React hooks
│   │   ├── use-socket.ts     # WebSocket connection management
│   │   └── use-toast.ts      # Toast notification system
│   ├── lib/                  # Utility libraries
│   │   ├── api.ts           # API client configuration
│   │   └── utils.ts         # Helper functions
│   └── ai/                   # AI integration services
├── docs/                     # Project documentation
│   ├── backend.md           # Backend requirements
│   └── backend_documentation.md # API documentation
├── components.json          # Shadcn/ui configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Leac1m/quiz-whiz.git
   cd quiz-whiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Creating a Quiz
1. Navigate to the Dashboard
2. Click "Create New Quiz"
3. Add your questions and configure settings
4. Use AI suggestions for categories and content
5. Save and publish your quiz

### Hosting a Game
1. Select a quiz from your dashboard
2. Click "Host Game" to start a session
3. Share the generated PIN with players
4. Start the game when all players have joined
5. Monitor live results and leaderboards

### Joining a Game
1. Go to the Join Game page
2. Enter the 6-digit PIN provided by the host
3. Enter your player name
4. Wait for the host to start the game
5. Answer questions in real-time

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Key Components

- **Dashboard**: Quiz management and game hosting interface
- **CreateQuizForm**: Interactive quiz creation with AI assistance
- **GameHost**: Real-time game control panel for hosts
- **PlayerInterface**: Clean, responsive player experience
- **WebSocket Integration**: Real-time communication via custom hooks

## 📡 API Documentation

The backend API supports:
- Quiz CRUD operations
- Real-time game sessions
- Player management
- AI content generation
- File uploads for media

For detailed API documentation, see [`docs/backend_documentation.md`](docs/backend_documentation.md).

## 🚀 Deployment

### Production Deployment (Render)

1. **Frontend Deployment**
   - Connect your GitHub repository to Render
   - Set build command: `npm run build`
   - Set start command: `npm run start`
   - Configure environment variables

2. **Backend Deployment**
   - Deploy backend as a separate service
   - Update `NEXT_PUBLIC_API_URL` to your backend URL
   - Configure CORS for your frontend domain

### Environment Variables

```env
# Frontend
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com

# Database (Production)
DATABASE_URL=your_database_connection_string
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful component library


## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Join our community discussions

---

Made with ❤️ in the [`socssfutminna`](https://x.com/socscfutminna) core team