// =====================================
// ECTS RUNNER - SKETCH.JS (LEVEL SELECT ΜΕ NEON ΚΕΙΜΕΝΑ ΚΑΙ 3D ΠΛΑΙΣΙΑ)
// =====================================

let gravity = 0.8;
let jumpPower = -22;
let worldOffset = 0;
let ects = 0;
let lives = 3;
let maxLives = 10;
let level = 1;
let invincible = 0;
let groundY;
let gameStarted = false;
let levelComplete = false;
let jumpsLeft = 2;
let shake = 0;
let enemiesKilled = 0;

// States: 'menu', 'levelSelect', 'game', 'pauseMenu'
let gameState = "menu";

// In-game menu
let pauseMenuActive = false;
let pauseSelectedOption = 0;
let pauseOptions = ["▶ RESUME", "🔄 RESTART", "🏠 GO TO MENU"];

// Εφέ μετάβασης (FADE)
let fadeAlpha = 0;
let fadeTransition = false;

// Typing effect
let menuTexts = [
  "Survive in the University & Get Your Degree!",
  "Collect 100 ECTS per semester",
  "🔵🟢🟡 coloured balls → +5 ECTS",
  "⚔️ Every 2 enemies 🔴 → +1 life  | 😈 unkilled enemy",
  "← → : Move | SPACE : Jump (x2) | SHIFT : Dash | M : Sound"
];
let typedTexts = ["", "", "", "", ""];
let textIndexes = [0, 0, 0, 0, 0];

let platforms = [];
let movingPlatforms = [];
let enemies = [];
let coins = [];
let lavaPools = [];
let checkpoints = [];
let particles = [];
let rain = [];
let generatedUntil = 0;

let collectedCoins = [];
let nextCoinId = 0;

let bgMusic = {};
let currentSound;
let soundEnabled = true;
let soundVol = 0.5;

let coinSound;
let enemyCrashSound;
let enemyKillSound;
let gameOverSound;

let bgImages = {};
let playerImg;

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

function preload() {
  bgImages.first = loadImage("assets/images/first.png");
  bgImages.spring = loadImage("assets/images/spring.png");
  bgImages.summer = loadImage("assets/images/summer.png");
  bgImages.sunset = loadImage("assets/images/sunset.png");
  bgImages.winter = loadImage("assets/images/winter.png");
  bgImages.night = loadImage("assets/images/night.png");
  bgImages.rain = loadImage("assets/images/rain.png");
  bgImages.finalpush = loadImage("assets/images/finalpush.png");
  bgImages.congrats = loadImage("assets/images/congrats.png");
  playerImg = loadImage("assets/images/player.png");
  
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

class Particle {
  constructor(x, y, c, size = 6, life = 60) {
    this.x = x; this.y = y;
    this.dx = random(-3, 3); this.dy = random(-3, 3) - 2;
    this.life = life;
    this.maxLife = life;
    this.colorVal = c;
    this.size = size;
  }
  update() { 
    this.x += this.dx; 
    this.y += this.dy; 
    this.life--; 
    this.dy += 0.2;
  }
  draw() { 
    let alpha = map(this.life, 0, this.maxLife, 0, 200);
    fill(red(this.colorVal), green(this.colorVal), blue(this.colorVal), alpha);
    noStroke(); 
    ellipse(this.x, this.y, this.size); 
  }
}

function createDust(x, y) {
  for (let i = 0; i < 12; i++) {
    let dustColor = color(150, 120, 80);
    particles.push(new Particle(x + random(-20, 20), y + random(-5, 15), dustColor, random(4, 10), 40));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  groundY = height - 100;
  initPlayer();
  for (let i = 0; i < 200; i++) rain.push({ x: random(width), y: random(height) });
  generateChunk(0);
  
  setTimeout(typeNextLetter, 50);
}

function typeNextLetter() {
  let anyLeft = false;
  for (let i = 0; i < menuTexts.length; i++) {
    if (textIndexes[i] < menuTexts[i].length) {
      typedTexts[i] += menuTexts[i][textIndexes[i]];
      textIndexes[i]++;
      anyLeft = true;
      setTimeout(typeNextLetter, 30);
      break;
    }
  }
}

function fadeOut(callback) {
  fadeTransition = true;
  fadeAlpha = 0;
  let fadeInterval = setInterval(() => {
    fadeAlpha += 15;
    if (fadeAlpha >= 255) {
      clearInterval(fadeInterval);
      fadeTransition = false;
      if (callback) callback();
    }
  }, 16);
}

function fadeIn(callback) {
  fadeTransition = true;
  fadeAlpha = 255;
  let fadeInterval = setInterval(() => {
    fadeAlpha -= 15;
    if (fadeAlpha <= 0) {
      clearInterval(fadeInterval);
      fadeTransition = false;
      if (callback) callback();
    }
  }, 16);
}

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

function stopMusic() { if (currentSound && currentSound.isPlaying()) currentSound.stop(); }
function setSoundVolume(vol) { soundVol = constrain(vol, 0, 1); if (currentSound) currentSound.setVolume(soundVol); }
function playCoinSound() { if (soundEnabled && coinSound) coinSound.play(); }
function playEnemyCrashSound() { if (soundEnabled && enemyCrashSound) enemyCrashSound.play(); }
function playEnemyKillSound() { if (soundEnabled && enemyKillSound) enemyKillSound.play(); }
function playGameOverSound() { if (soundEnabled && gameOverSound) gameOverSound.play(); }

function drawBackground(theme, bgImg) {
  if (bgImg && bgImg.width > 0) {
    let dims = imageDimensions[theme.bgKey];
    let bgOffset = worldOffset * 0.25;
    if (dims.type === "wide") {
      let maxOffset = max(0, dims.w - width);
      bgOffset = constrain(bgOffset, 0, maxOffset);
      image(bgImg, -bgOffset, 0, dims.w, dims.h);
    } else {
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

function getCurrentTheme() { return themes[(level - 1) % themes.length]; }

// ========== IN-GAME PAUSE MENU ==========
function drawPauseMenu() {
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  let menuW = 400;
  let menuH = 350;
  let menuX = width/2 - menuW/2;
  let menuY = height/2 - menuH/2;
  
  fill(30, 30, 50, 240);
  rect(menuX, menuY, menuW, menuH, 20);
  
  fill(255, 220, 100);
  textSize(36);
  textAlign(CENTER);
  text("⏸ GAME PAUSED", width/2, menuY + 60);
  
  textSize(20);
  fill(200, 200, 200);
  text("Press 1 or ESC to resume", width/2, menuY + 100);
  
  for (let i = 0; i < pauseOptions.length; i++) {
    let optionY = menuY + 160 + i * 55;
    
    if (i === pauseSelectedOption) {
      fill(255, 220, 100);
      textSize(28);
    } else {
      fill(180, 180, 220);
      textSize(24);
    }
    text(pauseOptions[i], width/2, optionY);
  }
  
  textSize(14);
  fill(150, 150, 180);
  text("↑ ↓ : Navigate | ENTER : Select", width/2, menuY + menuH - 40);
}

// ========== LEVEL SELECT MENU (NEON + 3D ΠΛΑΙΣΙΑ) ==========
function drawLevelSelect() {
  background(20, 25, 45);
  
  // Διακοσμητικά αστέρια
  for (let i = 0; i < 100; i++) {
    fill(255, 255, 255, random(50, 150));
    noStroke();
    ellipse(random(width), random(height), random(1, 3));
  }
  
  textAlign(CENTER);
  
  // Τίτλος με glow effect
  textSize(52);
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(0, 255, 255, 0.8)";
  fill(0, 255, 255);
  text("📚 SELECT YOUR SEMESTER 📚", width/2, 80);
  drawingContext.shadowBlur = 0;
  
  textSize(20);
  fill(200, 200, 200);
  text("Click on a level to start your journey", width/2, 130);
  
  // Μεγαλύτερα κουμπιά - 4x2 grid
  let buttonWidth = 260;
  let buttonHeight = 130;
  let startX = (width - (buttonWidth + 30) * 4) / 2;
  let startY = 170;
  
  for (let i = 0; i < 8; i++) {
    let row = floor(i / 4);
    let col = i % 4;
    let x = startX + col * (buttonWidth + 30);
    let y = startY + row * (buttonHeight + 35);
    
    // ========== NEON ΚΕΙΜΕΝΟ ΠΑΝΩ ΑΠΟ ΤΟ ΠΛΑΙΣΙΟ ==========
    let neonColor;
    if (i % 3 === 0) neonColor = color(0, 255, 255);  // Cyan
    else if (i % 3 === 1) neonColor = color(255, 0, 255);  // Magenta
    else neonColor = color(0, 255, 0);  // Green
    
    textSize(18);
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = `rgba(${red(neonColor)}, ${green(neonColor)}, ${blue(neonColor)}, 0.8)`;
    fill(neonColor);
    text(`Semester ${i+1} - ${themes[i].name}`, x + buttonWidth/2, y - 12);
    drawingContext.shadowBlur = 0;
    
    // ========== ΤΡΙΣΔΙΑΣΤΑΤΟ ΠΛΑΙΣΙΟ ==========
    // Σκιά
    fill(0, 0, 0, 120);
    rect(x + 6, y + 6, buttonWidth, buttonHeight, 12);
    
    // Κύρια βάση
    fill(45, 45, 65);
    rect(x, y, buttonWidth, buttonHeight, 12);
    
    // Εσωτερικό φωτεινό περίγραμμα (3D εφέ)
    stroke(100, 100, 150);
    strokeWeight(2);
    noFill();
    rect(x + 3, y + 3, buttonWidth - 6, buttonHeight - 6, 10);
    stroke(200, 200, 255);
    strokeWeight(1);
    rect(x + 1, y + 1, buttonWidth - 2, buttonHeight - 2, 12);
    noStroke();
    
    // Εικόνα preview (μεγέθυνση)
    let previewImg = bgImages[themes[i].bgKey];
    if (previewImg && previewImg.width > 0) {
      image(previewImg, x + 15, y + 15, 100, 100);
    } else {
      fill(100, 100, 150);
      ellipse(x + 65, y + 65, 80, 80);
    }
    
    // Neon αριθμός εξαμήνου
    textSize(36);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = `rgba(${red(neonColor)}, ${green(neonColor)}, ${blue(neonColor)}, 0.8)`;
    fill(neonColor);
    text(i + 1, x + buttonWidth - 40, y + 80);
    drawingContext.shadowBlur = 0;
    
    // Όνομα εξαμήνου (λευκό)
    fill(255, 255, 255);
    textSize(18);
    text(themes[i].name, x + 140, y + 60);
    
    // Μικρή περιγραφή
    fill(180, 180, 200);
    textSize(13);
    text("▶ Click to play", x + 140, y + 90);
    
    // Glow effect στο hover
    let mouseOver = (mouseX > x && mouseX < x + buttonWidth && mouseY > y && mouseY < y + buttonHeight);
    if (mouseOver) {
      // Φωτεινό περίγραμμα
      stroke(neonColor);
      strokeWeight(3);
      noFill();
      rect(x - 2, y - 2, buttonWidth + 4, buttonHeight + 4, 14);
      noStroke();
      
      if (mouseIsPressed) {
        level = i + 1;
        fadeOut(() => {
          gameState = "game";
          initLevel();
          fadeIn();
        });
      }
    }
  }
  
  // Back button (3D)
  let backX = width/2 - 120;
  let backY = height - 70;
  
  fill(0, 0, 0, 100);
  rect(backX + 5, backY + 5, 240, 50, 10);
  fill(80, 50, 70);
  rect(backX, backY, 240, 50, 10);
  
  fill(200, 170, 150);
  textSize(24);
  text("← BACK TO MENU", width/2, backY + 33);
  
  if (mouseX > backX && mouseX < backX + 240 && mouseY > backY && mouseY < backY + 50 && mouseIsPressed) {
    gameState = "menu";
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

function drawStartMenu() {
  if (bgImages.first && bgImages.first.width > 0) {
    let scaleW = width / bgImages.first.width;
    let scaleH = height / bgImages.first.height;
    let scale = min(scaleW, scaleH);
    
    let scaledW = bgImages.first.width * scale;
    let scaledH = bgImages.first.height * scale;
    let x = (width - scaledW) / 2;
    let y = (height - scaledH) / 2;
    
    image(bgImages.first, x, y, scaledW, scaledH);
    
    fill(255, 255, 255, 80);
    rect(0, 0, width, height);
    
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
  } else {
    background(20, 25, 45);
  }
  
  textAlign(CENTER);
  
  textSize(78);
  fill(0, 0, 0, 150);
  text("🎓 ECTS RUNNER 🎓", width/2 + 6, 156);
  fill(0, 0, 0, 100);
  text("🎓 ECTS RUNNER 🎓", width/2 - 4, 152);
  fill(255, 220, 100);
  text("🎓 ECTS RUNNER 🎓", width/2, 150);
  
  textSize(24);
  fill(255, 255, 200);
  text(typedTexts[0], width/2, 250);
  
  textSize(20);
  fill(220, 220, 220);
  text(typedTexts[1], width/2, 310);
  text(typedTexts[2], width/2, 360);
  text(typedTexts[3], width/2, 400);
  text(typedTexts[4], width/2, 440);
  
  let btnX = width/2 - 120;
  let btnY = 510;
  fill(50, 80, 120);
  rect(btnX, btnY, 240, 55, 15);
  fill(255, 220, 100);
  textSize(26);
  text("🎮 SELECT SEMESTER 🎮", width/2, btnY + 38);
  
  if (mouseX > btnX && mouseX < btnX + 240 && mouseY > btnY && mouseY < btnY + 55 && mouseIsPressed) {
    gameState = "levelSelect";
  }
  
  textSize(20);
  fill(255, 220, 100);
  text("⚠️ PRESS ENTER ⚠️", width/2, 590);
  
  drawingContext.shadowBlur = 0;
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

function drawGameOverScreen() {
  fill(0, 0, 0, 200); rect(0, 0, width, height);
  fill(255, 50, 50);
  textSize(80); textAlign(CENTER); text("GAME OVER", width/2, height/2 - 50);
  textSize(30); fill(255); text("Press R to restart or ESC for menu", width/2, height/2 + 50);
  
  if (keyIsDown(27)) {
    gameState = "levelSelect";
    restartGame();
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

function drawLevelCompleteScreen() {
  fill(0, 0, 0, 200); rect(0, 0, width, height);
  let theme = getCurrentTheme();
  fill(255, 215, 0);
  textSize(55); textAlign(CENTER); text("🎉 " + "Semester " + level + " - " + theme.name + " COMPLETE! 🎉", width/2, height/2 - 40);
  textSize(32); fill(255); text("Press ENTER for next semester", width/2, height/2 + 50);
  textSize(24); fill(255, 200, 100); text("Press ESC for level select", width/2, height/2 + 100);
  textSize(20); fill(255, 200, 100); text("ECTS: " + ects + " / 100", width/2, height/2 + 150);
  
  if (keyIsDown(27)) {
    gameState = "levelSelect";
    levelComplete = false;
  }
  
  if (fadeTransition || fadeAlpha > 0) {
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

function draw() {
  if (gameState === "menu") {
    drawStartMenu();
    if (keyIsDown(ENTER) || keyIsDown(13)) { 
      fadeOut(() => {
        gameState = "game";
        level = 1;
        initLevel();
        fadeIn();
      });
    }
    return;
  }
  
  if (gameState === "levelSelect") {
    drawLevelSelect();
    return;
  }
  
  if (gameState === "game") {
    if (pauseMenuActive) {
      drawPauseMenu();
      return;
    }
    
    if (lives <= 0) {
      drawGameOverScreen();
      return;
    }
    
    if (ects >= 100 && !levelComplete && gameStarted) { 
      levelComplete = true; 
      stopMusic();
    }
    
    if (levelComplete) { 
      drawLevelCompleteScreen(); 
      if (keyIsDown(ENTER) || keyIsDown(13)) {
        fadeOut(() => {
          nextLevel();
          fadeIn();
        });
      }
      return; 
    }
    
    push();
    translate(random(-shake, shake), random(-shake, shake));
    shake *= 0.92;
    
    let theme = getCurrentTheme();
    drawBackground(theme, bgImages[theme.bgKey]);
    
    if (theme.bgKey === "rain") {
      stroke(180, 200, 255, 150);
      for (let r of rain) { line(r.x, r.y, r.x - 4, r.y + 8); r.y += 9; if (r.y > height) { r.y = 0; r.x = random(width); } }
      noStroke();
    }
    
    if (player.x - worldOffset > generatedUntil - 3000) generateChunk(generatedUntil);
    
    updateWorld();
    updatePlayer();
    
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
    
    for (let p of particles) { p.update(); p.draw(); }
    particles = particles.filter(p => p.life > 0);
    
    if (invincible > 0) invincible--;
    
    drawPlayer();
    drawUI();
    
    fill(255, 255, 255, 100);
    textSize(14);
    textAlign(RIGHT);
    text("Press 1 or ESC for menu", width - 20, 90);
    
    pop();
    
    if (fadeTransition || fadeAlpha > 0) {
      fill(0, 0, 0, fadeAlpha);
      rect(0, 0, width, height);
    }
  }
}

function initLevel() {
  console.log("📚 SEMESTER " + level + ": " + getCurrentTheme().name);
  gameStarted = true;
  pauseMenuActive = false;
  ects = 0; lives = 3; enemiesKilled = 0; invincible = 0;
  levelComplete = false; shake = 0; jumpsLeft = 2;
  collectedCoins = []; nextCoinId = 0;
  worldOffset = 0; player.x = 150; player.y = groundY - 110; player.dy = 0;
  platforms = []; movingPlatforms = []; enemies = []; coins = []; lavaPools = [];
  checkpoints = []; particles = []; generatedUntil = 0;
  player.speed = 5 + (level - 1) * 0.25; gravity = 0.8 + (level - 1) * 0.03;
  generateChunk(0); playLevelMusic();
}

function nextLevel() { 
  level++; 
  if (level > 8) { 
    level = 1;
    gameState = "levelSelect";
    stopMusic(); 
    alert("🎉 CONGRATULATIONS! YOU GRADUATED! 🎉"); 
    restartGame(); 
    return; 
  } 
  initLevel(); 
}

function loseLife() {
  if (invincible > 0) return;
  lives--; invincible = 70; shake = 18; playEnemyCrashSound();
  
  player.x = 150;
  worldOffset = 0;
  player.y = groundY - 110;
  player.dy = -8;
  
  createDust(player.x + player.w/2, player.y + player.h);
  
  for (let i = 0; i < 15; i++) particles.push(new Particle(player.x + 40, player.y + 50, color(255, 0, 0), 8, 50));
  if (lives <= 0) { playGameOverSound(); stopMusic(); }
}

function addLife() { 
  if (lives < maxLives) lives++; 
  for (let i = 0; i < 15; i++) particles.push(new Particle(player.x + 40, player.y + 50, color(255, 100, 200), 8, 50)); 
}

function restartGame() {
  gameStarted = true; 
  pauseMenuActive = false;
  level = 1; 
  ects = 0; 
  lives = 3; 
  enemiesKilled = 0; 
  worldOffset = 0;
  player.x = 150; 
  player.y = groundY - 110; 
  player.dy = 0; 
  invincible = 0; 
  levelComplete = false;
  platforms = []; 
  movingPlatforms = []; 
  enemies = []; 
  coins = [];
  lavaPools = []; 
  checkpoints = []; 
  particles = []; 
  generatedUntil = 0; 
  collectedCoins = []; 
  nextCoinId = 0;
  player.speed = 5; 
  gravity = 0.8; 
  generateChunk(0); 
  playLevelMusic(); 
  fadeAlpha = 0;
}

function keyPressed() {
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
          fadeOut(() => {
            initLevel();
            fadeIn();
          });
        } else if (pauseSelectedOption === 2) {
          pauseMenuActive = false;
          fadeOut(() => {
            gameState = "levelSelect";
            fadeIn();
          });
        }
        return;
      }
      return;
    }
  }
  
  if (gameState === "menu" && (keyCode === ENTER || keyCode === 13)) { 
    fadeOut(() => {
      gameState = "game";
      level = 1;
      initLevel();
      fadeIn();
    });
    return; 
  }
  
  if (gameState === "levelSelect") {
    return;
  }
  
  if (levelComplete && (keyCode === ENTER || keyCode === 13)) { 
    fadeOut(() => {
      nextLevel();
      fadeIn();
    });
    return; 
  }
  
  if (keyCode === 82 && (lives <= 0)) { 
    fadeOut(() => {
      restartGame();
      fadeIn();
    });
    return; 
  }
  
  if (key === ' ' && jumpsLeft > 0 && !levelComplete && lives > 0 && gameStarted && gameState === "game" && !pauseMenuActive) {
    player.dy = jumpPower; jumpsLeft--;
    for (let i = 0; i < 8; i++) particles.push(new Particle(player.x + 30, player.y + player.h, color(255, 255, 255), 5, 40));
  }
  
  if (keyCode === SHIFT && !levelComplete && lives > 0 && gameStarted && gameState === "game" && !pauseMenuActive) {
    player.speed = 14;
    setTimeout(() => { if (player) player.speed = 5 + (level - 1) * 0.25; }, 280);
    for (let i = 0; i < 12; i++) particles.push(new Particle(player.x + 40, player.y + 60, color(0, 255, 255), 6, 30));
  }
  
  if (key === 'm' || key === 'M') { soundEnabled = !soundEnabled; if (soundEnabled) playLevelMusic(); else stopMusic(); }
  if (keyCode === UP_ARROW) { soundVol = min(soundVol + 0.1, 1); setSoundVolume(soundVol); }
  if (keyCode === DOWN_ARROW) { soundVol = max(soundVol - 0.1, 0); setSoundVolume(soundVol); }
}

function mousePressed() {
  return false;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); groundY = height - 100; }