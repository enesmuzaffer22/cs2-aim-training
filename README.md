# 🎯 CS2 Aim Training

[🇺🇸 English](#english) | [🇹🇷 Türkçe](#türkçe)

---

## English

Modern and advanced Counter-Strike 2 aim training application. Improve your aim with real CS2 sensitivity settings, track your performance, and break your records!

### ✨ Features

#### 🎮 Game Modes

- **🎯 Circle Target**: Hit randomly appearing circles (60 seconds)
- **⚡ Reaction Time**: Test your reflexes (2-6 seconds interval)

#### 🔧 CS2 Integration

- **Real CS2 Sensitivity**: Use your in-game sensitivity settings
- **DPI Calculation**: Effective DPI calculation
- **Mouse Movement**: Real CS2 mouse movement system

#### 📊 Statistics System

- **Detailed Charts**: Performance graphs with Recharts
- **Score Tracking**: Cloud-based score storage with Firestore
- **Progress Analysis**: View improvement over time
- **Best Scores**: Track personal records

#### 🔐 User System

- **Firebase Auth**: Secure login/register system
- **User Profile**: Personal information and logout
- **Protected Routes**: Secure page access

### 🚀 Installation

#### Requirements

- Node.js 20.16.0+
- npm 10.8.2+

#### Project Setup

```bash
# Clone the project
git clone [repo-url]
cd cs2-aim-training

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file with Firebase config details

# Start development server
npm run dev
```

#### Firebase Setup

1. Create new project on [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Add web app and get config details
5. Fill `.env` file with Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 🎯 Usage

#### Getting Started

1. Open the app: `http://localhost:5173`
2. Create account or login
3. Set your CS2 sensitivity settings in main menu
4. Adjust DPI value

#### Playing Games

1. **Circle Target**: Hit random circles in fullscreen mode
2. **Reaction Time**: Click immediately when you see blue screen
3. **Statistics**: Track your performance with graphs

#### Sensitivity Settings

- Enter your CS2 `sensitivity` value
- Specify your mouse DPI
- Effective DPI calculated automatically
- Settings saved automatically

### 📱 Technologies

#### Frontend

- **React 18**: Modern UI framework
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Recharts**: Data visualization

#### Backend

- **Firebase Auth**: User authentication
- **Firestore**: NoSQL database
- **Real-time**: Live data synchronization

#### Game Engine

- **Pointer Lock API**: Fullscreen mouse control
- **CS2 Sensitivity**: Real game sensitivity
- **Performance Optimized**: GPU accelerated movements

### 📊 Scoring System

#### Circle Target

- **Score**: Number of targets hit
- **Accuracy**: Hit percentage (hit/total shots)
- **Duration**: 60 seconds
- **Storage**: Saved in Firestore

#### Reaction Time

- **Time**: In milliseconds
- **Categories**:
  - 🚀 Super Fast (< 200ms)
  - ⚡ Very Good (200-300ms)
  - 👍 Good (300-400ms)
  - 🐌 Slow (> 400ms)

### 🛠️ Development

#### Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

#### Project Structure

```
src/
├── components/          # React components
│   ├── Auth.jsx        # Login/Register
│   ├── MainMenu.jsx    # Main menu
│   ├── CircleTargetGame.jsx
│   ├── ReactionTimeGame.jsx
│   └── Statistics.jsx  # Statistics page
├── hooks/              # Custom hooks
│   └── useAuth.js      # Authentication hook
├── services/           # API services
│   └── scoreService.js # Score management
├── firebase/           # Firebase config
├── utils/              # Helper functions
└── assets/             # Static files
```

### 🎮 CS2 Sensitivity Calculation

```javascript
// Effective DPI = CS2 Sensitivity × Mouse DPI
const effectiveDPI = sensitivity * dpi;

// CS2 YAW value: 0.022 (constant)
const yaw = 0.022;

// Mouse movement calculation
const rotationX = movementX * sensitivity * yaw;
const rotationY = movementY * sensitivity * yaw;
```

### 🐛 Known Issues

- Firestore composite index requirement (solved with simple queries)
- Pointer Lock API may not be fully supported in some browsers
- Limited support on mobile devices

### 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

### 📄 License

This project is licensed under the MIT License.

### 🎯 Future Features

- [ ] More game modes
- [ ] Multiplayer support
- [ ] Leaderboard system
- [ ] Crosshair customization
- [ ] Sound effects
- [ ] Mobile responsive design
- [ ] Steam integration

---

**🎮 Good luck!** Improve your aim, break your records! 🎯
