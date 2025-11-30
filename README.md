```markdown
# Intska 🧠

**A fast-paced brain training game**

Intska (Purépecha: "Wisdom" or "Intelligence") is a progressive difficulty brain game that tests your math, logic, memory, and puzzle-solving skills. Built as a mobile-first Progressive Web App (PWA) with pure vanilla JavaScript - no frameworks, no dependencies.

---

## 🎮 Features

- **20 Unique Challenge Types** across 4 categories:
  - 🔢 **Math**: Arithmetic, Division, Fractions, Word Problems
  - 🧩 **Logic**: Sequences, Patterns, Spatial Reasoning, Odd One Out
  - 💭 **Memory**: Color Sequences, Grid Patterns, Pattern Matching
  - 🎯 **Puzzles**: Sorting, Tile Shuffle, Cup Shuffle, Word Unscramble, and more

- **Lives System**: Start with 5 hearts, lose one per wrong answer, gain one back every 3 correct answers
- **Progressive Difficulty**: Challenges get harder as you advance
- **Time Pressure**: Beat the clock on every challenge
- **Stats Tracking**: High scores, accuracy, rank progression, game history
- **Rank System**: Progress from Beginner → Novice → Skilled → Expert → Master → Legend
- **PWA Support**: Install to home screen, works offline, feels like a native app
- **Mobile-First Design**: Optimized for portrait mode on phones
- **Clean UI**: Green & white theme, smooth animations, no clutter

---

## 🚀 Quick Start

### Play Now
1. Clone the repository
```bash
git clone https://github.com/yourusername/intska.git
cd intska
```

2. Serve with any static server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using VS Code Live Server
# Just open index.html with Live Server extension
```

3. Open `http://localhost:8000` in your browser
4. Press "Start Playing" and begin!

### Install as PWA
- **Android/Chrome**: Tap menu → "Add to Home Screen"
- **iOS/Safari**: Tap share → "Add to Home Screen"

---

## 📁 Project Structure

```
intska/
├── index.html              # Landing page
├── game.html               # Game page
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline support
│
├── css/
│   ├── global.css          # Variables, reset, base styles
│   ├── landing.css         # Landing page styles
│   ├── game.css            # Game UI styles
│   └── challenges.css      # Challenge-specific styles
│
├── js/
│   ├── app.js              # Main application controller
│   ├── storage.js          # localStorage wrapper
│   │
│   ├── core/
│   │   ├── engine.js       # Game loop & state management
│   │   ├── ui.js           # DOM manipulation & rendering
│   │   ├── timer.js        # Visual countdown timer
│   │   └── difficulty.js   # Difficulty scaling system
│   │
│   ├── challenges/
│   │   ├── registry.js     # Challenge registration system
│   │   ├── math.js         # 4 math challenges
│   │   ├── logic.js        # 5 logic challenges
│   │   ├── memory.js       # 3 memory challenges
│   │   ├── puzzles.js      # 8 puzzle challenges
│   │   └── _template.js    # Template for new challenges
│   │
│   └── utils/
│       ├── random.js       # Randomization utilities
│       ├── validators.js   # Answer validation
│       └── animations.js   # CSS animation helpers
│
└── icons/
    └── placeholder.txt     # PWA icons (to be added)
```

---

## 🎯 Game Mechanics

### Lives System
- Start with **5 hearts** ❤️❤️❤️❤️❤️
- Lose 1 heart for wrong answers or timeouts
- Earn 1 heart back every **3 correct answers** (max 5)
- Game over when hearts reach 0

### Difficulty Progression
- Starts at **Level 1**
- Increases by 1 for each correct answer
- Affects:
  - Number ranges in math
  - Pattern complexity in logic
  - Sequence length in memory
  - Grid size in puzzles
  - Timer duration (gets shorter)

### Scoring & Ranks
- **Score**: +1 per correct answer
- **Ranks** based on high score:
  - Beginner: 0+
  - Novice: 10+
  - Skilled: 25+
  - Expert: 50+
  - Master: 100+
  - Legend: 200+

---

## 🛠️ Technology Stack

- **Frontend**: Pure Vanilla JavaScript (ES6 modules)
- **Styling**: CSS3 (CSS Grid, Flexbox, Custom Properties)
- **Architecture**: Modular, event-driven
- **Storage**: localStorage for persistence
- **PWA**: Service Worker, Web Manifest
- **No Dependencies**: Zero npm packages, no frameworks

---

## 🧩 Challenge Categories

### Math (4 challenges)
1. **Simple Arithmetic** - Addition, subtraction, multiplication, division
2. **Division** - Whole number division only
3. **Fraction Comparison** - Compare fractions with <, >, =
4. **Word Problems** - Real-world math scenarios

### Logic (5 challenges)
5. **Sequence Prediction** - Find the next number in sequence
6. **Odd One Out** - Identify the different shape/color
7. **True/False Logic** - Syllogism-based reasoning
8. **Spatial Reasoning** - Pyramid perspective views
9. **Number Grid Patterns** - Find missing numbers in grids

### Memory (3 challenges)
10. **Color Sequence** - Memorize and repeat color patterns
11. **Shape Grid Memory** - Reproduce highlighted grid cells
12. **Pattern Matching** - Find matching items in a set

### Puzzles (8 challenges)
13. **Drag-Drop Sorting** - Sort items by category (even/odd, big/small)
14. **Tile Shuffle** - Classic sliding tile puzzle
15. **Cup Shuffle** - Track the ball under shuffling cups
16. **Water Levels** - Sort containers by fill level
17. **Shape Rotation** - Rotate shapes to match silhouettes
18. **Word Unscramble** - Rearrange letters to form words
19. **Cube Counting** - Count visible and hidden cubes
20. **Same Game** - Click largest connected color group

---

## 🔧 Adding New Challenges

1. **Use the template** in `/js/challenges/_template.js`
2. **Implement required methods**:
   - `render(contentContainer, answerContainer)` - Build UI
   - `check(answer)` - Validate player answer
   - `cleanup()` - Remove event listeners
3. **Register the challenge**:
```javascript
import { registerChallenge } from './registry.js';

registerChallenge('my-challenge-id', 'category', myFactory, {
  name: 'My Challenge',
  description: 'Description here',
  minDifficulty: 1
});
```

See `_template.js` for full examples of input, multiple choice, and interactive challenges.

---

## 📊 Data Persistence

All game data is stored in `localStorage`:
- High score
- Total games played
- Accuracy percentage
- Current streak
- Rank progression
- Category-specific stats
- Last 10 game history

**Reset stats**: Click "Reset Stats" on landing page

---

## 🎨 Customization

### Theme Colors
Edit CSS variables in `/css/global.css`:
```css
:root {
  --color-primary: #4CAF50;
  --color-accent: #2196F3;
  --color-warning: #FF9800;
  --color-danger: #F44336;
}
```

### Difficulty Tuning
Adjust scaling in `/js/core/difficulty.js`:
```javascript
function getMathDifficulty(level) {
  return {
    maxNumber: 10 + (level * 5),
    timeLimit: Math.max(8, 15 - Math.floor(level / 3))
  };
}
```

---

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

**Requires**: ES6 modules, CSS Grid, localStorage

---

## 📱 PWA Features

- **Offline play** via Service Worker
- **Add to home screen** on mobile
- **Standalone mode** (no browser UI)
- **Portrait orientation** locked
- **Theme color** integration

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-challenge`)
3. Commit changes (`git commit -m 'Add cube rotation challenge'`)
4. Push to branch (`git push origin feature/new-challenge`)
5. Open a Pull Request

**Ideas for contributions**:
- New challenge types
- Difficulty balancing
- UI/UX improvements
- Additional language support
- Sound effects (optional toggle)
- Haptic feedback
- Leaderboards

---

## 📝 License

MIT License - feel free to use, modify, and distribute.

---

## 🙏 Credits

**Name**: Intska - Purépecha word meaning "Wisdom" or "Intelligence"

**Developer**: Edgar Robledo

---

## 🐛 Known Issues

- PWA icons not yet generated (placeholders in place)
- Some challenges may need difficulty balancing
- Service worker cache needs version management

---

## 📮 Contact

- **Email**: edgar@codedevhub.com
- **Phone**: 803-209-7750 (text first)

---

## ⭐ Star History

If you enjoy this game, please give it a star! ⭐
