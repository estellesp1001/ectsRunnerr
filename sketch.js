/**
 * SKETCH.JS - Main Game File
 * 
 * This is the core file that controls the entire game:
 * - Game states and transitions (intro, menu, level select, gameplay, pause, end)
 * - Video intro playback and automatic transition
 * - World generation and rendering
 * - Player physics and collision handling
 * - Level progression and semester unlocking
 * - Audio management (music, sound effects, volume control)
 * - UI rendering and cursor management
 * - Game over and graduation sequences
 */

// =====================================
// GAME PHYSICS AND CORE VARIABLES
// =====================================

let gravity = 0.8;              // Gravity force applied each frame
let jumpPower = -22;            // Initial upward velocity when jumping
let worldOffset = 0;            // Camera scrolling offset
let ects = 0;                   // Current ECTS score (0-100 to complete semester)
let lives = 3;                  // Player lives (max 10)
let maxLives = 10;              // Maximum possible lives
let level = 1;                  // Current semester (1-8)
let invincible = 0;             // Invincibility frames after taking damage
let groundY;                    // Y-coordinate of the ground level
let gameStarted = false;        // Whether gameplay has started
let levelComplete = false;      // Whether current semester is completed
let jumpsLeft = 2;              // Remaining jumps (double jump mechanic)
let shake = 0;                  // Camera shake intensity
let enemiesKilled = 0;          // Counter for enemy kills (every 2 = +1 life)

// =====================================
// GAME STATE MANAGEMENT
// =====================================
// Possible states: 'intro', 'menu', 'levelSelect', 'game', 'pauseMenu', 'rules', 'end'
let gameState = "intro";

// Intro video element
let introVideo;

// Level unlocking system (only first semester unlocked initially)
let unlockedLevels = [true, false, false, false, false, false, false, false];

// =====================================
// PAUSE MENU
// =====================================
let pauseMenuActive = false;        // Whether pause menu is active
let pauseSelectedOption = 0;        // Currently selected menu option (0,1,2)
let pauseOptions = ["▶ RESUME", "🔄 RESTART", "🏠 GO TO MENU"];  // Menu options

// =====================================
// VISUAL EFFECTS
// =====================================
let fadeAlpha = 0;                  // Fade transition opacity (0-255)
let fadeTransition = false;         // Whether fade transition is active
let fadeCallback = null;            // Callback function after fade completes

let rulesYOffset = 0;               // Y-offset for rules panel animation
let rulesAnimDir = 1;               // Animation direction (1 = down, -1 = up)

let titleAngle = 0;                 // Angle for title wobble animation
let titleWobble = 0;                // Current wobble offset

// =====================================
// TYPING EFFECT (MENU TEXT ANIMATION)
// =====================================
let fullTitle = "ECTS RUNNER";
let typedTitle = "";
let titleIndex = 0;
let typingActive = true;

let subtitle = "Survive in the University & Get Your Degree!";
let typedSubtitle = "";
let subtitleIndex = 0;

// =====================================
// END SCREEN (GRADUATION)
// =====================================
let yoohooSound;                    // Celebration sound effect
let endScreenTimer = 0;             // Timer for auto-return to menu
let endScreenActive = false;        // Whether end screen is active

// =====================================
// WORLD OBJECTS ARRAYS
// =====================================
let platforms = [];                 // Static platforms (book-shaped)
let movingPlatforms = [];           // Horizontally moving platforms
let enemies = [];                   // Enemy objects
let coins = [];                     // Collectible paper items
let lavaPools = [];                 // Hazardous lava pools
let checkpoints = [];               // Respawn points
let particles = [];                 // Visual particle effects
let rain = [];                      // Weather effect particles
let generatedUntil = 0;             // World generation progress

let collectedCoins = [];            // IDs of collected coins(exam papers) (prevents re-collection)
let nextCoinId = 0;                 // Unique ID generator for coins (exam papers)

// =====================================
// AUDIO VARIABLES
// =====================================
let bgMusic = {};                   // Background music tracks (one per semester)
let currentSound;                   // Currently playing music
let soundEnabled = true;            // Master sound toggle
let soundVol = 0.5;                 // Master volume (0-1)

let coinSound;                      // Exam paper collection sound
let enemyCrashSound;                // Player hit sound
let enemyKillSound;                 // Enemy defeat sound
let gameOverSound;                  // Game over sound

// =====================================
// IMAGE ASSETS
// =====================================
let bgImages = {};                  // Background images (screen, level backgrounds)
let playerImg;                      // Normal player sprite
let playerJumpImg;                  // Jumping player sprite
let playerClaimImg;                 // Exam paper collection celebration sprite
let playerCrushImg;                 // Hit/damage sprite

/**
 * IMAGE DIMENSIONS FOR PROPER SCALING
 * square: 512x512 images that need centering
 * wide: 1536x1024 images that can fill screen
 */
let imageDimensions = {
  spring: { w: 512, h: 512, type: "square" },
  summer: { w: 512, h: 512, type: "square" },
  sunset: { w: 512, h: 512, type: "square" },
  winter: { w: 512, h: 512, type: "square" },
  night: { w: 512, h: 512, type: "square" },
  rain: { w: 512, h: 512, type: "square" },
  finalpush: { w: 1536, h: 1024, type: "wide" },
  congrats: { w: 1536, h: 1024, type: "wide" }
};

/**
 * SEMESTER THEMES
 * Each semester has unique:
 * - Name and background image key
 * - Soundtrack key
 * - Sky, ground, and grass colors
 */
let themes = [
  { name: "Spring", bgKey: "spring", soundKey: "semester1_spring", sky: [135, 206, 235], ground: [101, 67, 33], grass: [34, 139, 34] },
  { name: "Summer", bgKey: "summer", soundKey: "semester2_summer", sky: [255, 200, 100], ground: [180, 120, 40], grass: [255, 180, 0] },
  { name: "Sunset", bgKey: "sunset", soundKey: "semester3_sunset", sky: [255, 94, 77], ground: [139, 69, 19], grass: [255, 140, 0] },
  { name: "Winter", bgKey: "winter", soundKey: "semester4_winter", sky: [176, 224, 255], ground: [169, 169, 169], grass: [200, 200, 255] },
  { name: "Night", bgKey: "night", soundKey: "semester5_night", sky: [25, 25, 50], ground: [47, 47, 47], grass: [105, 105, 105] },
  { name: "Rain", bgKey: "rain", soundKey: "semester6_rain", sky: [100, 100, 120], ground: [70, 70, 90], grass: [80, 100, 120] },
  { name: "Final Push", bgKey: "finalpush", soundKey: "semester7_finalpush", sky: [255, 215, 0], ground: [218, 165, 32], grass: [255, 215, 0] },
  { name: "Congrats", bgKey: "congrats", soundKey: "semester8_congrats", sky: [139, 0, 0], ground: [139, 0, 0], grass: [220, 20, 60] }
];

// =====================================
// PRELOAD - LOAD ALL ASSETS
// =====================================
/**
 * Loads all game assets before starting:
 * - Intro video
 * - Background images (screen, semester backgrounds, mid-levels, end screen)
 * - Player sprites (normal, jump, claim, crush)
 * - Sound effects and background music tracks
 */
function preload() {
  introVideo = createVideo("assets/videos/intro.mp4");
  introVideo.hide();
  introVideo.volume(0.7);
  
  bgImages.screen = loadImage("assets/images/screen.png");
  bgImages.spring = loadImage("assets/images/spring.png");
  bgImages.summer = loadImage("assets/images/summer.png");
  bgImages.sunset = loadImage("assets/images/sunset.png");
  bgImages.winter = loadImage("assets/images/winter.png");
  bgImages.night = loadImage("assets/images/night.png");
  bgImages.rain = loadImage("assets/images/rain.png");
  bgImages.finalpush = loadImage("assets/images/finalpush.png");
  bgImages.congrats = loadImage("assets/images/congrats.png");
  bgImages.midLevels = loadImage("assets/images/mid-levels.png");
  bgImages.end = loadImage("assets/images/end.png");
  
  playerImg = loadImage("assets/images/player.png");
  playerJumpImg = loadImage("assets/images/player_jump.png");
  playerClaimImg = loadImage("assets/images/claim.png");
  playerCrushImg = loadImage("assets/images/crush.png");
  
  yoohooSound = loadSound("assets/sounds/yoohoo.mp3");
  
  bgMusic.semester1_spring = loadSound("assets/sounds/semester1_spring.mp3");
  bgMusic.semester2_summer = loadSound("assets/sounds/semester2_summer.mp3");
  bgMusic.semester3_sunset = loadSound("assets/sounds/semester3_sunset.mp3");
  bgMusic.semester4_winter = loadSound("assets/sounds/semester4_winter.mp3");
  bgMusic.semester5_night = loadSound("assets/sounds/semester5_night.mp3");
  bgMusic.semester6_rain = loadSound("assets/sounds/semester6_rain.mp3");
  bgMusic.semester7_finalpush = loadSound("assets/sounds/semester7_finalpush.mp3");
  bgMusic.semester8_congrats = loadSound("assets/sounds/semester8_congrats.mp3");
  
  coinSound = loadSound("assets/sounds/coin.wav");
  enemyCrashSound = loadSound("assets/sounds/enemycrash.wav");
  enemyKillSound = loadSound("assets/sounds/enemykill.wav");
  gameOverSound = loadSound("assets/sounds/gameover.wav");
}

/**
 * PARTICLE SYSTEM CLASS
 * Creates visual effects for:
 * - Exam paper collection (gold particles)
 * - Enemy defeat (pink particles)
 * - Dust clouds (brown particles)
 * - Lava bubbles (orange particles)
 */
class Particle {
  constructor(x, y, c, size = 6, life = 60) {
    this.x = x;
    this.y = y;
    this.dx = random(-3, 3);
    this.dy = random(-3, 3) - 2;  // Initial upward bias
    this.life = life;
    this.maxLife = life;
    this.colorVal = c;
    this.size = size;
  }
  
  update() { 
    this.x += this.dx; 
    this.y += this.dy; 
    this.life--; 
    this.dy += 0.2;  // Gravity effect on particles
  }
  
  draw() { 
    let alpha = map(this.life, 0, this.maxLife, 0, 200);
    fill(red(this.colorVal), green(this.colorVal), blue(this.colorVal), alpha);
    noStroke(); 
    ellipse(this.x, this.y, this.size); 
  }
}

/**
 * Creates dust particles when player lands on ground
 * @param {number} x - X position for dust effect
 * @param {number} y - Y position for dust effect
 */
function createDust(x, y) {
  for (let i = 0; i < 12; i++) {
    let dustColor = color(150, 120, 80);
    particles.push(new Particle(x + random(-20, 20), y + random(-5, 15), dustColor, random(4, 10), 40));
  }
}

// =====================================
// SETUP - INITIALIZE GAME
// =====================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  groundY = height - 100;
  initPlayer();
  
  // Initialize rain particles
  for (let i = 0; i < 200; i++) {
    rain.push({ x: random(width), y: random(height) });
  }
  
  generateChunk(0);
  
  introVideo.volume(0.0);
  introVideo.loop();
  
  
  // Typing effect intervals
  setInterval(() => {
    if (typingActive && titleIndex < fullTitle.length) {
      typedTitle += fullTitle[titleIndex];
      titleIndex++;
    }
  }, 100);
  
  setInterval(() => {
    if (typingActive && subtitleIndex < subtitle.length) {
      typedSubtitle += subtitle[subtitleIndex];
      subtitleIndex++;
    }
  }, 50);
  
  // Rules panel bobbing animation
  setInterval(() => {
    rulesYOffset += 2 * rulesAnimDir;
    if (rulesYOffset > 8 || rulesYOffset < -8) rulesAnimDir *= -1;
  }, 100);
  
  // Title wobble animation
  setInterval(() => {
    titleAngle += 0.05;
    titleWobble = sin(titleAngle) * 3;
  }, 50);
}

/**
 * Enables audio context (required by browsers for autoplay)
 * Called on first user interaction (key press)
 */
function enableAudio() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume().then(() => {
      console.log("🔊 Audio enabled");
    });
  }
}

/**
 * FADE TRANSITION EFFECT
 * @param {string} mode - "out" (fade to black) or "in" (fade from black)
 * @param {function} callback - Function to execute after fade completes
 */
function startFade(mode, callback) {
  if (fadeTransition) return;
  fadeTransition = true;
  fadeCallback = callback;
  
  let step = 5;
  let intervalTime = 10;
  
  if (mode === "out") {
    fadeAlpha = 0;
    let fadeInterval = setInterval(() => {
      fadeAlpha += step;
      if (fadeAlpha >= 255) {
        clearInterval(fadeInterval);
        fadeTransition = false;
        if (fadeCallback) fadeCallback();
        fadeCallback = null;
      }
    }, intervalTime);
  } else {
    fadeAlpha = 255;
    let fadeInterval = setInterval(() => {
      fadeAlpha -= step;
      if (fadeAlpha <= 0) {
        clearInterval(fadeInterval);
        fadeTransition = false;
        if (fadeCallback) fadeCallback();
        fadeCallback = null;
      }
    }, intervalTime);
  }
}

/**
 * PLAYS BACKGROUND MUSIC FOR CURRENT SEMESTER
 * Stops previous music and starts new track
 */
function playLevelMusic() {
  let theme = getCurrentTheme();
  let newSound = bgMusic[theme.soundKey];
  if (!soundEnabled || !newSound) return;
  if (currentSound === newSound && newSound.isPlaying()) return;
  if (currentSound && currentSound.isPlaying()) currentSound.stop();
  currentSound = newSound;
  newSound.setVolume(soundVol);
  newSound.loop();
}

function stopMusic() { 
  if (currentSound && currentSound.isPlaying()) {
    currentSound.stop();
    currentSound = null;
  }
}

function setSoundVolume(vol) { 
  soundVol = constrain(vol, 0, 1); 
  if (currentSound) currentSound.setVolume(soundVol); 
}

// Sound effect triggers
function playCoinSound() { if (soundEnabled && coinSound) coinSound.play(); }
function playEnemyCrashSound() { if (soundEnabled && enemyCrashSound) enemyCrashSound.play(); }
function playEnemyKillSound() { if (soundEnabled && enemyKillSound) enemyKillSound.play(); }
function playGameOverSound() { if (soundEnabled && gameOverSound) gameOverSound.play(); }

/**
 * DRAWS BACKGROUND WITH PARALLAX SCROLLING
 * @param {Object} theme - Current semester theme
 * @param {p5.Image} bgImg - Background image to draw
 */
function drawBackground(theme, bgImg) {
  if (bgImg && bgImg.width > 0) {
    let dims = imageDimensions[theme.bgKey];
    let bgOffset = worldOffset * 0.25;  // Parallax speed (slower than player)
    
    if (dims.type === "wide") {
      // Wide images (1536x1024) - scroll horizontally
      let maxOffset = max(0, dims.w - width);
      bgOffset = constrain(bgOffset, 0, maxOffset);
      image(bgImg, -bgOffset, 0, dims.w, dims.h);
    } else {
      // Square images (512x512) - scale to fit width
      let scale = max(width / bgImg.width, groundY / bgImg.height);
      let scaledW = bgImg.width * scale;
      let scaledH = bgImg.height * scale;
      let xOffset = (scaledW - width) / 2;
      let yOffset = (scaledH - groundY) / 2;
      let parallax = bgOffset * (scaledW / bgImg.width) * 0.4;
      let finalX = -xOffset - parallax;
      image(bgImg, constrain(finalX, -(scaledW - width), 0), -max(0, yOffset), scaledW, scaledH);
    }
  } else {
    background(theme.sky[0], theme.sky[1], theme.sky[2]);
  }
}

/**
 * DRAWS MENU BACKGROUND (screen.png)
 * Used for main menu, level select, and rules screens
 */
function drawBackgroundScreen() {
  if (bgImages.screen && bgImages.screen.width > 0) {
    let scale = max(width / bgImages.screen.width, height / bgImages.screen.height);
    let scaledW = bgImages.screen.width * scale;
    let scaledH = bgImages.screen.height * scale;
    let x = (width - scaledW) / 2;
    let y = (height - scaledH) / 2;
    image(bgImages.screen, x, y, scaledW, scaledH);
  } else {
    background(140, 40, 40);
  }
}

function getCurrentTheme() { return themes[(level - 1) % themes.length]; }

// =====================================
// INTRO VIDEO SCREEN
// =====================================
/**
 * Plays intro video with story text overlay
 * Automatically transitions to menu when video ends
 * Press any key to skip
 */
function drawIntro() {
  background(0);
  
  if (introVideo.width > 0) {
    let videoRatio = introVideo.width / introVideo.height;
    let canvasRatio = width / height;
    
    let videoW, videoH;
    if (videoRatio > canvasRatio) {
      videoH = height;
      videoW = videoH * videoRatio;
    } else {
      videoW = width;
      videoH = videoW / videoRatio;
    }
    
    let videoX = (width - videoW) / 2;
    let videoY = (height - videoH) / 2 - 350;
    
    image(introVideo, videoX, videoY, videoW, videoH);
  }
  
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  textAlign(CENTER);
  
  // Title
  textSize(32);
  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = "rgba(255, 215, 0, 0.8)";
  fill(255, 215, 0);
  text("THE STORY BEGINS...", width/2, 80);
  
  drawingContext.shadowBlur = 8;
  drawingContext.shadowColor = "rgba(0,0,0,0.5)";
  
  // Story text
  textSize(20);
  fill(255, 255, 220);
  
  let storyText = "Odysseas, Olga, and Stella spend a day at the Athens University of Economics and Business";
  let storyText2 = "and get the idea to earn a degree. Outside in the courtyard, they devise a plan";
  let storyText3 = "for hunting ECTS credits with the goal of obtaining the degree while avoiding";
  let storyText4 = "low grades in exam periods, by collecting high grades and ECTS credits";
  let storyText5 = "between semesters.";
  
  text(storyText, width/2, 180);
  text(storyText2, width/2, 220);
  text(storyText3, width/2, 260);
  text(storyText4, width/2, 300);
  text(storyText5, width/2, 340);
  
  stroke(255, 215, 0);
  strokeWeight(2);
  line(width/2 - 200, 370, width/2 + 200, 370);
  noStroke();
  
  textSize(18);
  fill(200, 200, 200, 200);
  text("Press any key to continue", width/2, height - 60);
  
  drawingContext.shadowBlur = 0;
  
  // Auto-transition when video ends
  if (introVideo.time() >= introVideo.duration() - 0.1 && introVideo.duration() > 0) {
    introVideo.stop();
    gameState = "menu";
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

// =====================================
// PAUSE MENU
// =====================================
/**
 * Draws the in-game pause menu overlay
 * Options: Resume, Restart, Go to Menu
 * Navigation: Arrow keys, Selection: Enter
 */
function drawPauseMenu() {
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  let menuW = 400;
  let menuH = 350;
  let menuX = width/2 - menuW/2;
  let menuY = height/2 - menuH/2;
  
  fill(100, 25, 25, 240);
  rect(menuX, menuY, menuW, menuH, 20);
  
  fill(200, 160, 120);
  rect(menuX + 5, menuY + 5, menuW - 10, menuH - 10, 15);
  
  fill(255, 220, 150);
  textSize(36);
  textAlign(CENTER);
  text("⏸ GAME PAUSED", width/2, menuY + 60);
  
  textSize(20);
  fill(80, 60, 40);
  text("Press 1 or ESC to resume", width/2, menuY + 100);
  
  for (let i = 0; i < pauseOptions.length; i++) {
    let optionY = menuY + 160 + i * 55;
    
    if (i === pauseSelectedOption) {
      fill(200, 100, 50);
      textSize(28);
    } else {
      fill(100, 70, 50);
      textSize(24);
    }
    text(pauseOptions[i], width/2, optionY);
  }
  
  textSize(14);
  fill(100, 80, 60);
  text("↑ ↓ : Navigate | ENTER : Select", width/2, menuY + menuH - 40);
}

// =====================================
// RULES SCREEN
// =====================================
/**
 * Displays game rules with bobbing animation
 * Shows instructions for gameplay mechanics
 */
function drawRulesScreen() {
  drawBackgroundScreen();
  
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  let rulesW = 650;
  let rulesH = 520;
  let rulesX = width/2 - rulesW/2;
  let rulesY = height/2 - rulesH/2 + rulesYOffset;
  
  fill(100, 25, 25, 240);
  rect(rulesX, rulesY, rulesW, rulesH, 20);
  
  fill(220, 180, 140, 230);
  rect(rulesX + 5, rulesY + 5, rulesW - 10, rulesH - 10, 15);
  
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(200, 100, 50, 0.5)";
  
  fill(150, 60, 40);
  textSize(40);
  textAlign(CENTER);
  text("GAME RULES", width/2, rulesY + 55);
  
  drawingContext.shadowBlur = 0;
  
  textSize(20);
  textAlign(LEFT);
  
  fill(50, 30, 20);
  textStyle(BOLD);
  text("🎓 Collect 100 ECTS per semester to graduate!", rulesX + 30, rulesY + 110);
  text("📝 Exam papers with high grades → +5 ECTS each", rulesX + 30, rulesY + 160);
  text("⚔️ Every 2 enemies defeated → +1 life", rulesX + 30, rulesY + 210);
  text("😈 Purple devil (4.9) → UNKILLABLE! Avoid it!", rulesX + 30, rulesY + 260);
  text("🌋 Lava pools → instant life loss", rulesX + 30, rulesY + 310);
  text("🚀 SHIFT = Dash (speed boost)", rulesX + 30, rulesY + 360);
  text("🦘 SPACE = Double jump", rulesX + 30, rulesY + 410);
  text("🎮 Press ESC for in-game menu", rulesX + 30, rulesY + 460);
  textStyle(NORMAL);
  
  let backX = width/2 - 80;
  let backY = rulesY + rulesH - 50;
  fill(110, 50, 40);
  rect(backX, backY, 160, 45, 10);
  fill(255, 220, 180);
  textSize(22);
  textAlign(CENTER);
  text("← BACK", width/2, backY + 32);
  
  if (mouseX > backX && mouseX < backX + 160 && mouseY > backY && mouseY < backY + 45 && mouseIsPressed) {
    startFade("out", () => {
      gameState = "menu";
      startFade("in");
    });
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

// =====================================
// LEVEL SELECT SCREEN
// =====================================
/**
 * Displays 8 semester buttons (4x2 grid)
 * Locked semesters appear darker
 * Click to start selected semester
 */
function drawLevelSelect() {
  drawBackgroundScreen();
  
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  // Star particle effect
  for (let i = 0; i < 100; i++) {
    fill(255, 255, 200, random(30, 100));
    noStroke();
    ellipse(random(width), random(height), random(1, 3));
  }
  
  textAlign(CENTER);
  
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(255, 200, 100, 0.8)";
  fill(255, 220, 150);
  textSize(52);
  text("SELECT YOUR SEMESTER", width/2, 80);
  drawingContext.shadowBlur = 0;
  
  textSize(20);
  fill(255, 240, 200);
  text("Click on a level to start your journey", width/2, 130);
  
  let buttonWidth = 200;
  let buttonHeight = 140;
  let spacingX = 50;
  let spacingY = 40;
  let startX = (width - (buttonWidth * 4 + spacingX * 3)) / 2;
  let startY = 180;
  
  for (let i = 0; i < 8; i++) {
    let row = floor(i / 4);
    let col = i % 4;
    let x = startX + col * (buttonWidth + spacingX);
    let y = startY + row * (buttonHeight + spacingY);
    
    let isUnlocked = unlockedLevels[i];
    
    fill(0, 0, 0, 100);
    rect(x + 5, y + 5, buttonWidth, buttonHeight, 12);
    
    if (!isUnlocked) {
      // Locked semester - darkened appearance
      fill(70, 50, 50);
      rect(x, y, buttonWidth, buttonHeight, 12);
      
      stroke(100, 80, 70);
      strokeWeight(2);
      noFill();
      rect(x + 3, y + 3, buttonWidth - 6, buttonHeight - 6, 10);
      stroke(120, 100, 90);
      strokeWeight(1);
      rect(x + 1, y + 1, buttonWidth - 2, buttonHeight - 2, 12);
      noStroke();
      
      fill(120, 90, 80);
      rect(x + 10, y - 5, buttonWidth - 20, 10, 5);
      
      let previewImg = bgImages[themes[i].bgKey];
      if (previewImg && previewImg.width > 0) {
        tint(100, 100, 100, 200);
        image(previewImg, x + 15, y + 15, buttonWidth - 30, buttonHeight - 30);
        noTint();
      } else {
        fill(100, 70, 60);
        ellipse(x + buttonWidth/2, y + buttonHeight/2, 80, 80);
      }
      
      textSize(18);
      fill(160, 140, 120);
      drawingContext.shadowBlur = 8;
      drawingContext.shadowColor = "rgba(0,0,0,0.5)";
      text(`Semester ${i+1} - ${themes[i].name}`, x + buttonWidth/2, y - 10);
      drawingContext.shadowBlur = 0;
    } else {
      // Unlocked semester - normal appearance
      fill(120, 70, 50);
      rect(x, y, buttonWidth, buttonHeight, 12);
      
      stroke(180, 130, 80);
      strokeWeight(2);
      noFill();
      rect(x + 3, y + 3, buttonWidth - 6, buttonHeight - 6, 10);
      stroke(255, 220, 150);
      strokeWeight(1);
      rect(x + 1, y + 1, buttonWidth - 2, buttonHeight - 2, 12);
      noStroke();
      
      fill(160, 110, 70);
      rect(x + 10, y - 5, buttonWidth - 20, 10, 5);
      
      let previewImg = bgImages[themes[i].bgKey];
      if (previewImg && previewImg.width > 0) {
        image(previewImg, x + 15, y + 15, buttonWidth - 30, buttonHeight - 30);
      } else {
        fill(130, 80, 60);
        ellipse(x + buttonWidth/2, y + buttonHeight/2, 80, 80);
      }
      
      textSize(18);
      fill(255, 240, 180);
      drawingContext.shadowBlur = 8;
      drawingContext.shadowColor = "rgba(0,0,0,0.5)";
      text(`Semester ${i+1} - ${themes[i].name}`, x + buttonWidth/2, y - 10);
      drawingContext.shadowBlur = 0;
      
      // Hover effect
      let mouseOver = (mouseX > x && mouseX < x + buttonWidth && mouseY > y && mouseY < y + buttonHeight);
      if (mouseOver) {
        stroke(255, 220, 100);
        strokeWeight(4);
        noFill();
        rect(x - 2, y - 2, buttonWidth + 4, buttonHeight + 4, 14);
        noStroke();
        
        if (mouseIsPressed) {
          level = i + 1;
          startFade("out", () => {
            gameState = "game";
            initLevel();
            startFade("in");
          });
        }
      }
    }
  }
  
  // Back button
  let backX = width/2 - 100;
  let backY = height - 80;
  
  fill(0, 0, 0, 100);
  rect(backX + 5, backY + 5, 200, 50, 10);
  fill(100, 60, 45);
  rect(backX, backY, 200, 50, 10);
  
  fill(255, 220, 180);
  textSize(22);
  text("← BACK TO MENU", width/2, backY + 33);
  
  if (mouseX > backX && mouseX < backX + 200 && mouseY > backY && mouseY < backY + 50 && mouseIsPressed) {
    startFade("out", () => {
      gameState = "menu";
      stopMusic();
      startFade("in");
    });
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

// =====================================
// MAIN MENU
// =====================================
/**
 * Main menu screen with wobbling title
 * Options: Select Semester, Rules
 */
function drawStartMenu() {
  drawBackgroundScreen();
  
  textAlign(CENTER);
  
  push();
  translate(width/2, 180);
  rotate(radians(titleWobble));
  
  textSize(78);
  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = "rgba(0,0,0,0.5)";
  
  fill(80, 40, 30, 200);
  text(typedTitle, 4, 4);
  
  fill(200, 150, 100);
  text(typedTitle, 0, 0);
  
  fill(255, 220, 150);
  text(typedTitle, -2, -2);
  
  drawingContext.shadowBlur = 0;
  pop();
  
  textSize(28);
  fill(255, 240, 200);
  text(typedSubtitle, width/2, 300);
  
  // Select Semester button
  let btnW = 380;
  let btnH = 65;
  let btnX = width/2 - btnW/2;
  let btnY = 400;
  
  fill(50, 20, 20, 200);
  rect(btnX + 6, btnY + 6, btnW, btnH, 25);
  fill(140, 90, 60);
  rect(btnX, btnY, btnW, btnH, 25);
  
  let glowAlpha = 150 + sin(frameCount * 0.05) * 105;
  fill(255, 220, 100, glowAlpha);
  textSize(28);
  text("🎮 SELECT SEMESTER 🎮", width/2, btnY + 45);
  fill(255, 240, 200);
  text("🎮 SELECT SEMESTER 🎮", width/2, btnY + 43);
  
  if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH && mouseIsPressed) {
    startFade("out", () => {
      gameState = "levelSelect";
      startFade("in");
    });
  }
  
  // Rules button
  let rulesBtnW = 200;
  let rulesBtnH = 50;
  let rulesBtnX = width/2 - rulesBtnW/2;
  let rulesBtnY = 490;
  
  fill(50, 20, 20, 200);
  rect(rulesBtnX + 5, rulesBtnY + 5, rulesBtnW, rulesBtnH, 20);
  fill(110, 70, 50);
  rect(rulesBtnX, rulesBtnY, rulesBtnW, rulesBtnH, 20);
  
  let rulesGlow = 150 + sin(frameCount * 0.08) * 105;
  fill(255, 220, 150, rulesGlow);
  textSize(24);
  text("📜 RULES 📜", width/2, rulesBtnY + 35);
  fill(255, 240, 200);
  text("📜 RULES 📜", width/2, rulesBtnY + 33);
  
  if (mouseX > rulesBtnX && mouseX < rulesBtnX + rulesBtnW && mouseY > rulesBtnY && mouseY < rulesBtnY + rulesBtnH && mouseIsPressed) {
    startFade("out", () => {
      gameState = "rules";
      startFade("in");
    });
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

// =====================================
// GAME OVER SCREEN
// =====================================
function drawGameOverScreen() {
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  fill(255, 50, 50);
  textSize(80);
  textAlign(CENTER);
  text("GAME OVER", width/2, height/2 - 50);
  textSize(30);
  fill(255);
  text("Press R to restart or ESC for menu", width/2, height/2 + 50);
  
  if (keyIsDown(27)) {
    startFade("out", () => {
      gameState = "levelSelect";
      stopMusic();
      startFade("in");
    });
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

// =====================================
// LEVEL COMPLETE SCREEN
// =====================================
/**
 * Shows between semesters with mid-levels.png background
 * Press ENTER to proceed to next semester
 * Press ESC to return to level select
 */
function drawLevelCompleteScreen() {
  if (bgImages.midLevels && bgImages.midLevels.width > 0) {
    let scaleW = width / bgImages.midLevels.width;
    let scaleH = height / bgImages.midLevels.height;
    let scale = max(scaleW, scaleH);
    let scaledW = bgImages.midLevels.width * scale;
    let scaledH = bgImages.midLevels.height * scale;
    let x = (width - scaledW) / 2;
    let y = (height - scaledH) / 2;
    image(bgImages.midLevels, x, y, scaledW, scaledH);
  } else {
    background(0, 0, 0, 200);
  }
  
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  let theme = getCurrentTheme();
  fill(255, 215, 0);
  textSize(55);
  textAlign(CENTER);
  text("🎉 Semester " + level + " - " + theme.name + " COMPLETE! 🎉", width/2, height/2 - 40);
  textSize(32);
  fill(255);
  text("Press ENTER for next semester", width/2, height/2 + 50);
  textSize(24);
  fill(255, 200, 100);
  text("Press ESC for level select", width/2, height/2 + 100);
  textSize(20);
  fill(255, 200, 100);
  text("ECTS: " + ects + " / 100", width/2, height/2 + 150);
  
  if (keyIsDown(27)) {
    startFade("out", () => {
      gameState = "levelSelect";
      levelComplete = false;
      stopMusic();
      startFade("in");
    });
  }
}

// =====================================
// END SCREEN (GRADUATION)
// =====================================
/**
 * Shows when all 8 semesters are completed
 * Plays yoohoo sound and shows end.png
 * Automatically returns to menu after sound duration
 */
function showEndScreen() {
  if (!endScreenActive) {
    endScreenActive = true;
    if (yoohooSound && !yoohooSound.isPlaying()) {
      yoohooSound.play();
    }
    endScreenTimer = ceil(yoohooSound.duration() * 60) + 30;
  }
  
  if (bgImages.end && bgImages.end.width > 0) {
    let scaleW = width / bgImages.end.width;
    let scaleH = height / bgImages.end.height;
    let scale = max(scaleW, scaleH);
    let scaledW = bgImages.end.width * scale;
    let scaledH = bgImages.end.height * scale;
    let x = (width - scaledW) / 2;
    let y = (height - scaledH) / 2;
    image(bgImages.end, x, y, scaledW, scaledH);
  } else {
    background(0, 0, 0);
  }
  
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  textAlign(CENTER);
  fill(255, 215, 0);
  textSize(60);
  text("🎉 CONGRATULATIONS! 🎉", width/2, height/2 - 80);
  textSize(40);
  fill(255);
  text("YOU GRADUATED!", width/2, height/2);
  textSize(24);
  fill(255, 200, 100);
  text("Returning to menu in " + ceil(endScreenTimer / 60) + " seconds...", width/2, height/2 + 100);
  
  if (endScreenTimer > 0) {
    endScreenTimer--;
  } else {
    endScreenActive = false;
    gameState = "menu";
    level = 1;
    unlockedLevels = [true, false, false, false, false, false, false, false];
    startFade("out", () => {
      startFade("in");
    });
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

// =====================================
// CURSOR MANAGEMENT
// =====================================
function hideCursor() { cursor(HIDDEN); }
function showCursor() { cursor(ARROW); }

// =====================================
// MAIN DRAW LOOP
// =====================================
/**
 * Main game loop - called every frame
 * Routes to appropriate screen based on gameState
 */
function draw() {
  if (gameState === "intro") {
    drawIntro();
    return;
  }
  
  if (gameState === "menu") {
    drawStartMenu();
    return;
  }
  
  if (gameState === "rules") {
    drawRulesScreen();
    return;
  }
  
  if (gameState === "levelSelect") {
    drawLevelSelect();
    return;
  }
  
  if (gameState === "end") {
    showEndScreen();
    return;
  }
  
  if (gameState === "game") {
    if (pauseMenuActive) {
      drawPauseMenu();
      return;
    }
    
    if (lives <= 0) {
      drawGameOverScreen();
      if (keyIsDown(82)) {
        startFade("out", () => {
          initLevel();
          startFade("in");
        });
      }
      return;
    }
    
    // Check for level completion
    if (ects >= 100 && !levelComplete && gameStarted) {
      levelComplete = true;
      stopMusic();
      
      // Unlock next semester
      if (level < 8 && !unlockedLevels[level]) {
        unlockedLevels[level] = true;
        console.log("🔓 Unlocked Semester " + (level + 1));
      }
    }
    
    if (levelComplete) {
      drawLevelCompleteScreen();
      if (keyIsDown(ENTER) || keyIsDown(13)) {
        startFade("out", () => {
          nextLevel();
          startFade("in");
        });
      }
      return;
    }
    
    // GAMEPLAY RENDERING
    push();
    translate(random(-shake, shake), random(-shake, shake));
    shake *= 0.92;
    
    let theme = getCurrentTheme();
    drawBackground(theme, bgImages[theme.bgKey]);
    
    // Weather effects
    if (theme.bgKey === "rain") {
      stroke(180, 200, 255, 150);
      for (let r of rain) {
        line(r.x, r.y, r.x - 4, r.y + 8);
        r.y += 9;
        if (r.y > height) {
          r.y = 0;
          r.x = random(width);
        }
      }
      noStroke();
    }
    
    // Dynamic world generation
    if (player.x - worldOffset > generatedUntil - 3000) {
      generateChunk(generatedUntil);
    }
    
    updateWorld();
    updatePlayer();
    
    // Draw ground
    fill(theme.ground[0], theme.ground[1], theme.ground[2]);
    rect(0, groundY, width, height - groundY + 10);
    fill(theme.grass[0], theme.grass[1], theme.grass[2]);
    rect(0, groundY - 12, width, 14);
    
    let wasOnGround = player.onGround;
    if (player.y + player.h >= groundY) {
      player.y = groundY - player.h;
      player.dy = 0;
      if (!wasOnGround && player.onGround === false) {
        createDust(player.x + player.w/2, player.y + player.h);
      }
      player.onGround = true;
      jumpsLeft = 2;
    }
    
    drawWorld();
    
    // Particle effects
    for (let p of particles) {
      p.update();
      p.draw();
    }
    particles = particles.filter(p => p.life > 0);
    
    if (invincible > 0) invincible--;
    
    drawPlayer();
    drawUI();
    
    pop();
    
    if (fadeTransition || fadeAlpha > 0) {
      fill(0, 0, 0, fadeAlpha);
      rect(0, 0, width, height);
    }
  }
}

// =====================================
// LEVEL INITIALIZATION
// =====================================
/**
 * Resets all game variables for a new semester
 * Called when starting a level or restarting
 */
function initLevel() {
  console.log("📚 Starting SEMESTER " + level + ": " + getCurrentTheme().name);
  gameStarted = true;
  pauseMenuActive = false;
  ects = 0;
  lives = 3;
  enemiesKilled = 0;
  invincible = 0;
  levelComplete = false;
  shake = 0;
  jumpsLeft = 2;
  collectedCoins = [];
  nextCoinId = 0;
  worldOffset = 0;
  player.x = 150;
  player.y = groundY - 110;
  player.dy = 0;
  platforms = [];
  movingPlatforms = [];
  enemies = [];
  coins = [];
  lavaPools = [];
  checkpoints = [];
  particles = [];
  generatedUntil = 0;
  player.speed = 5 + (level - 1) * 0.25;
  gravity = 0.8 + (level - 1) * 0.03;
  generateChunk(0);
  playLevelMusic();
}

/**
 * Advances to next semester or triggers graduation
 */
function nextLevel() {
  level++;
  if (level > 8) {
    gameState = "end";
    stopMusic();
    return;
  }
  initLevel();
}

/**
 * Handles player death/respawn
 */
function loseLife() {
  lives--;
  shake = 18;
  playEnemyCrashSound();
  
  player.x = 150;
  worldOffset = 0;
  player.y = groundY - 110;
  player.dy = -8;
  
  createDust(player.x + player.w/2, player.y + player.h);
  
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(player.x + 40, player.y + 50, color(255, 0, 0), 8, 50));
  }
  if (lives <= 0) {
    playGameOverSound();
    stopMusic();
  }
}

function addLife() {
  if (lives < maxLives) lives++;
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(player.x + 40, player.y + 50, color(255, 100, 200), 8, 50));
  }
}

// =====================================
// INPUT HANDLING
// =====================================
/**
 * Handles all keyboard input:
 * - ENTER: Start game / Next level
 * - 1 or ESC: Pause menu toggle
 * - Arrow keys: Navigate pause menu
 * - Space: Jump (double jump)
 * - Shift: Dash (speed boost)
 * - M: Toggle sound
 * - Arrow Up/Down: Volume control
 * - R: Restart (on game over)
 */
function keyPressed() {
  enableAudio();
  
  if (gameState === "intro") {
    introVideo.stop();
    gameState = "menu";
    return;
  }
  
  if (gameState === "menu" && (keyCode === ENTER || keyCode === 13)) {
    startFade("out", () => {
      gameState = "levelSelect";
      startFade("in");
    });
    return;
  }
  
  if (gameState === "levelSelect") {
    return;
  }
  
  if (gameState === "game" && !levelComplete && lives > 0) {
    if (key === '1' || keyCode === 27) {
      if (!pauseMenuActive) {
        pauseMenuActive = true;
        pauseSelectedOption = 0;
      } else {
        pauseMenuActive = false;
      }
      return;
    }
    
    if (pauseMenuActive) {
      if (keyCode === UP_ARROW) {
        pauseSelectedOption = (pauseSelectedOption - 1 + pauseOptions.length) % pauseOptions.length;
        return;
      }
      if (keyCode === DOWN_ARROW) {
        pauseSelectedOption = (pauseSelectedOption + 1) % pauseOptions.length;
        return;
      }
      if (keyCode === ENTER || keyCode === 13) {
        if (pauseSelectedOption === 0) {
          pauseMenuActive = false;
        } else if (pauseSelectedOption === 1) {
          pauseMenuActive = false;
          startFade("out", () => {
            initLevel();
            startFade("in");
          });
        } else if (pauseSelectedOption === 2) {
          pauseMenuActive = false;
          startFade("out", () => {
            gameState = "levelSelect";
            stopMusic();
            startFade("in");
          });
        }
        return;
      }
      return;
    }
  }
  
  if (levelComplete && (keyCode === ENTER || keyCode === 13)) {
    startFade("out", () => {
      nextLevel();
      startFade("in");
    });
    return;
  }
  
  if (key === ' ' && jumpsLeft > 0 && !levelComplete && lives > 0 && gameStarted && gameState === "game" && !pauseMenuActive) {
    player.dy = jumpPower;
    jumpsLeft--;
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle(player.x + 30, player.y + player.h, color(255, 255, 255), 5, 40));
    }
  }
  
  if (keyCode === SHIFT && !levelComplete && lives > 0 && gameStarted && gameState === "game" && !pauseMenuActive) {
    player.speed = 14;
    setTimeout(() => {
      if (player) player.speed = 5 + (level - 1) * 0.25;
    }, 280);
    for (let i = 0; i < 12; i++) {
      particles.push(new Particle(player.x + 40, player.y + 60, color(0, 255, 255), 6, 30));
    }
  }
  
  if (key === 'm' || key === 'M') {
    soundEnabled = !soundEnabled;
    if (soundEnabled && gameState === "game") playLevelMusic();
    else if (!soundEnabled) stopMusic();
  }
  if (keyCode === UP_ARROW) {
    soundVol = min(soundVol + 0.1, 1);
    setSoundVolume(soundVol);
  }
  if (keyCode === DOWN_ARROW) {
    soundVol = max(soundVol - 0.1, 0);
    setSoundVolume(soundVol);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  groundY = height - 100;
}