# 🐠 Interactive Aquarium

A browser-based interactive aquarium with hand tracking. Move your hand in front of your webcam to scare the fish, or click anywhere to drop food pellets.

## Features

- 45 fish across 10 species, each with unique colours and markings
- Real-time hand tracking via MediaPipe — fish scatter when your hand gets close
- Click to drop food pellets that fish swim toward and eat
- Animated seaweed, rising bubbles, caustic light effects, and depth-based rendering
- Fish have idle swimming, fear responses, and depth-sorted layering

## Project Structure

```
aquarium/
├── index.html
├── styles.css  
└── js/
    ├── main.js           # Entry point — canvas, render loop, scene setup
    ├── fish.js           # Fish class and species definitions
    ├── bubble.js         # Bubble class
    ├── food.js           # FoodPellet class
    ├── handTracking.js   # MediaPipe camera and hand detection
    └── utils.js          # Colour helpers and coordinate mapping
```

## Controls

| Action | Effect |
|---|---|
| Move hand in front of webcam | Fish scatter away from your hand |
| Click anywhere | Drop food pellets |

## Dependencies

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) — loaded from CDN, no install needed

## Browser Requirements

- Camera access (HTTPS or localhost)
- A browser that supports ES modules and the Canvas API (any modern browser)
