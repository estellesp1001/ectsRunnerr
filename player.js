/**
 * PLAYER.JS - Player Character Module
 * 
 * This file handles all player-related functionality including:
 * - Player movement (left/right, gravity, jumping)
 * - Visual effects (coin collection flash, hit flash, invincibility)
 * - Player sprite rendering with different animations
 */

/**
 * TIMER VARIABLES FOR VISUAL EFFECTS
 * These timers control temporary visual changes to the player sprite
 * - claimEffectTimer: Active when player collects a coin (turns yellow)
 * - crushEffectTimer: Active when player hits an enemy (turns red)
 * Each timer lasts approximately 50 frames (~0.8-1 second at 60fps)
 */
let claimEffectTimer = 0;
let crushEffectTimer = 0;

/**
 * INITIALIZES THE PLAYER OBJECT
 * Sets starting position, dimensions, movement speed, and physics properties
 * Called once when the game starts or when a level is reset
 */
function initPlayer() {
  player = {
    x: 150,           // Starting X position (pixels from left edge)
    y: 500,           // Starting Y position (pixels from top)
    w: 70,            // Player width in pixels
    h: 90,            // Player height in pixels
    dy: 0,            // Vertical velocity (positive = falling, negative = jumping)
    speed: 5,         // Horizontal movement speed (pixels per frame)
    onGround: true    // Boolean flag: true if player is touching the ground/platform
  };
}

/**
 * UPDATES PLAYER POSITION AND PHYSICS
 * Called every frame during gameplay
 * Handles keyboard input, gravity, and visual effect timers
 */
function updatePlayer() {
  // ----- HORIZONTAL MOVEMENT (RIGHT ARROW) -----
  if (keyIsDown(RIGHT_ARROW)) {
    if (player.x < width / 2) {
      // Move player within the screen boundaries
      player.x += player.speed;
    } else {
      // When player reaches center of screen, scroll the world instead
      worldOffset -= player.speed;
    }
  }
  
  // ----- HORIZONTAL MOVEMENT (LEFT ARROW) -----
  if (keyIsDown(LEFT_ARROW)) {
    if (player.x > 80) {
      // Move player left within screen boundaries
      player.x -= player.speed;
    } else if (worldOffset < 0) {
      // When player hits left edge, scroll world back
      worldOffset += player.speed;
    }
  }
  
  // ----- GRAVITY AND VERTICAL MOVEMENT -----
  player.dy += gravity;   // Apply gravity (increases downward velocity)
  player.y += player.dy;  // Update vertical position
  player.onGround = false; // Reset ground flag (will be set true by collision detection)
  
  // ----- VISUAL EFFECT TIMERS -----
  // Decrement effect timers each frame (they count down to zero)
  if (claimEffectTimer > 0) claimEffectTimer--;
  if (crushEffectTimer > 0) crushEffectTimer--;
}

/**
 * RENDERS THE PLAYER ON SCREEN
 * Called every frame
 * Selects the appropriate sprite based on player state:
 * - Crush effect (hit by enemy) → crush.png
 * - Claim effect (collected coin) → claim.png
 * - In mid-air → jump.png
 * - Standing on ground → normal player.png
 * Also handles invincibility flashing effect
 */
function drawPlayer() {
  push();  // Save current drawing style settings
  
  // ----- INVINCIBILITY FLASH EFFECT -----
  // When player is invincible (after taking damage), sprite flashes
  if (invincible > 0 && (frameCount % 6 < 3)) {
    tint(255, 255, 100);  // Yellow tint during invincibility frames
  } else {
    noTint();              // Normal color
  }
  
  // ----- SPRITE SELECTION BASED ON STATE -----
  let currentImg;
  if (crushEffectTimer > 0) {
    // Player was hit by enemy - show hurt sprite
    currentImg = playerCrushImg;
  } else if (claimEffectTimer > 0) {
    // Player collected an exam paper - show collection celebration sprite
    currentImg = playerClaimImg;
  } else if (!player.onGround) {
    // Player is in the air (jumping or falling) - show jump sprite
    currentImg = playerJumpImg;
  } else {
    // Normal standing/idle state
    currentImg = playerImg;
  }
  
  // ----- DRAW THE SELECTED SPRITE -----
  if (currentImg && currentImg.width > 0) {
    // Draw the loaded image at player's position with correct dimensions
    image(currentImg, player.x, player.y, player.w, player.h);
  } else {
    // FALLBACK: Draw a simple rectangle shape if images are not loaded
    fill(50, 120, 255);                    // Blue body
    rect(player.x, player.y, player.w, player.h, 16);  // Rounded rectangle
    
    fill(255);                             // White for eyes
    ellipse(player.x + 20, player.y + 30, 12);  // Left eye
    ellipse(player.x + 50, player.y + 30, 12);  // Right eye
    
    fill(0);                               // Black pupils
    ellipse(player.x + 18, player.y + 28, 5);
    ellipse(player.x + 48, player.y + 28, 5);
  }
  
  noTint();   // Disable any active tint
  pop();      // Restore previous drawing style settings
}

/**
 * TRIGGERS THE EXAM PAPER COLLECTION VISUAL EFFECT
 * Called from world.js when player collects an exam paper
 * Sets the claim effect timer to 50 frames (~0.8-1 second)
 * During this time, player sprite changes to claim.png
 */
function triggerClaimEffect() {
  claimEffectTimer = 50;
}

/**
 * TRIGGERS THE HIT/DAMAGE VISUAL EFFECT
 * Called from world.js when player collides with an enemy
 * Sets the crush effect timer to 50 frames (~0.8-1 second)
 * During this time, player sprite changes to crush.png
 */
function triggerCrushEffect() {
  crushEffectTimer = 50;
}