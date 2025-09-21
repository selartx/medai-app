# 🩺 MedAI - AI-Powered Medical Learning Assistant

**A Next.js web application that revolutionizes medical education through AI-powered image analysis and personalized learning assistance.**

---

## 🚀 Live Demo

**Try it now:** [MedAI App](https://medai-app.vercel.app) *(or your deployed URL)*

### Demo Credentials
```
Email: demo@medai.com
Password: demo123
```
*Note: Use any valid email format for testing - Firebase auth is configured for demo purposes*

---

## ✨ Key Features

### 🔬 **Medical Image Analysis**
- Upload medical images (X-rays, MRIs, CT scans, skin conditions)
- AI-powered analysis using **Google Gemini 2.5 Flash**
- Detailed diagnostic insights and educational explanations
- Support for multiple image formats

### 💬 **Interactive Chat Interface**
- Real-time medical Q&A with AI assistant
- Context-aware conversations about medical topics
- Persistent chat history and conversation management
- Mobile-optimized chat experience

### 🔐 **Secure Authentication**
- Firebase Authentication integration
- Secure user registration and login
- Protected routes and user session management
- Password reset functionality

### 📱 **Mobile-First Design**
- Fully responsive design optimized for all devices
- Touch-friendly interface with proper tap targets
- Dynamic viewport handling for mobile browsers
- PWA-ready with offline capabilities

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.5.3, React 18, TypeScript
- **Styling:** Tailwind CSS, Responsive Design
- **AI/ML:** Google Gemini 2.5 Flash API
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Deployment:** Vercel (or your platform)
- **Code Quality:** ESLint 9.35.0, TypeScript strict mode

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Firebase project with Auth, Firestore, and Storage enabled
- Google AI Studio API key (Gemini)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/selartx/medai-app.git
   cd medai-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create `.env.local` file in root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google AI (Gemini) Configuration
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000`

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 🎯 Usage Guide

### Getting Started
1. **Sign Up/Login:** Create an account or use demo credentials
2. **Navigate to Chat:** Click "Start Learning" to access the main interface
3. **Upload Images:** Use the image upload button to analyze medical images
4. **Ask Questions:** Type medical questions or request explanations
5. **View History:** Access previous conversations and analyses

### Supported Medical Image Types
- **Radiology:** X-rays, CT scans, MRIs
- **Dermatology:** Skin lesions, rashes, moles
- **Pathology:** Histology slides, cell samples
- **General:** Any medical imaging or clinical photos

### AI Capabilities
- Detailed image analysis and findings identification
- Educational explanations of medical conditions
- Differential diagnosis suggestions
- Medical terminology clarification
- Study guidance and learning recommendations

---

## 🏗️ Project Structure

```
medai-app/
├── src/
│   ├── components/           # Reusable UI components
│   │   └── Header.tsx       # Navigation header
│   ├── pages/               # Next.js pages
│   │   ├── api/            # API routes
│   │   │   └── ai.ts       # Gemini AI integration
│   │   ├── _app.tsx        # App configuration
│   │   ├── _document.tsx   # Document structure
│   │   ├── index.tsx       # Landing page
│   │   ├── start.tsx       # Main chat interface
│   │   ├── login.tsx       # Authentication
│   │   └── signup.tsx      # User registration
│   ├── styles/             # Global styles
│   │   ├── globals.css     # Base styles
│   │   └── tailwind.css    # Tailwind imports
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # Shared types
│   └── utils/              # Utility functions
│       └── aiHelper.ts     # AI integration helpers
├── public/                 # Static assets
├── .env.local             # Environment variables
└── package.json           # Dependencies & scripts
```

---

## 🔧 Development

### Code Quality
- **ESLint:** Modern configuration with Next.js rules
- **TypeScript:** Strict mode enabled for type safety
- **Prettier:** Code formatting (configure as needed)

### Testing
```bash
# Run linting
npm run lint

# Type checking
npm run build
```

### Performance Optimizations
- Next.js automatic code splitting
- Image optimization with proper loading states
- Firebase security rules for data protection
- Responsive images and mobile optimization

---

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify:** Configure build command: `npm run build && npm run export`
- **Firebase Hosting:** Use `firebase deploy` after setup
- **Railway/Render:** Standard Node.js deployment

---

## 🔒 Security & Privacy

- **Data Protection:** All user data encrypted and stored securely in Firebase
- **Authentication:** Secure JWT-based authentication with Firebase Auth
- **API Security:** Rate limiting and input validation on all endpoints
- **Privacy:** Images and conversations are user-specific and private
- **Compliance:** Built with healthcare data privacy considerations

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Hackathon Team

**Built for [Hackathon Name] - September 2025**

- Medical AI integration specialist
- Full-stack development
- UI/UX design and mobile optimization
- Firebase backend architecture

---

## 🎉 Acknowledgments

- **Google Gemini 2.5 Flash** for powerful AI capabilities
- **Firebase** for backend infrastructure
- **Next.js** for the robust React framework
- **Tailwind CSS** for rapid UI development
- Medical community for inspiration and feedback

---

*Built with ❤️ for medical students worldwide*
