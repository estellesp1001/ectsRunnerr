/**
 * UI.JS - User Interface Module
 * 
 * This file handles all on-screen user interface elements including:
 * - ECTS score display (3D text effect with shadow)
 * - Lives counter (graduation cap icons instead of hearts)
 * - Current semester name display
 * - Enemy kill counter (shows how many more enemies needed for +1 life)
 * - Control instructions
 * - Menu access hint (ESC key)
 */

/**
 * DRAWS THE ENTIRE USER INTERFACE
 * Called every frame during gameplay
 * Creates a semi-transparent black bar at the top of the screen
 * Displays all game information in a clean, organized layout
 */
function drawUI() {
  // Get the current semester theme (Spring, Summer, etc.)
  let theme = getCurrentTheme();
  
  // ----- UI BACKGROUND BAR -----
  // Semi-transparent black rectangle at the top of the screen 
  fill(0, 0, 0, 200);
  rect(0, 0, width, 85);
  
  // ----- ECTS SCORE DISPLAY (3D TEXT EFFECT) -----
  // Creates a 3D shadow effect by layering the same text multiple times
  textSize(24);
  textAlign(LEFT);
  
  // Layer 1: Dark shadow (bottom-right)
  fill(0, 0, 0, 200);
  text("🎓 ECTS: " + floor(ects) + "/100", 18, 48);
  
  // Layer 2: Black text (slightly offset)
  fill(0, 0, 0);
  text("🎓 ECTS: " + floor(ects) + "/100", 15, 45);
  
  // Layer 3: White text (top layer - main text)
  fill(255, 255, 255);
  text("🎓 ECTS: " + floor(ects) + "/100", 14, 44);
  
  // ----- LIVES COUNTER (GRADUATION CAPS) -----
  // Displays lives as graduation cap emojis instead of traditional hearts
  // Golden caps = active lives, dim caps = empty slots
  let hatsX = 280;   // Starting X position for the first cap
  textSize(28);
  
  // Draw active lives (filled graduation caps)
  for (let i = 0; i < lives; i++) {
    let x = hatsX + i * 38;   // Space each cap 38 pixels apart
    
    // Shadow layer
    fill(0, 0, 0, 200);
    text("🎓", x + 3, 48);
    
    // Dark base layer
    fill(0, 0, 0);
    text("🎓", x, 45);
    
    // Golden top layer (active life)
    fill(255, 215, 0);
    text("🎓", x - 1, 44);
  }
  
  // Draw empty life slots (dim/transparent graduation caps)
  for (let i = lives; i < maxLives; i++) {
    let x = hatsX + i * 38;
    fill(0, 0, 0, 80);    // Semi-transparent dark
    text("🎓", x, 45);
  }
  
  // ----- SEMESTER NAME (RIGHT SIDE, TOP) -----
  // Displays the name of the current semester (e.g., "Spring", "Summer")
  textSize(18);
  fill(255, 220, 100);
  textAlign(RIGHT);
  text(theme.name, width - 30, 35);
  
  // ----- MENU ACCESS HINT (RIGHT SIDE, BELOW SEMESTER NAME) -----
  // Informs player how to open the pause/menu screen
  textSize(11);
  fill(180, 180, 220);
  textAlign(RIGHT);
  text("Press ESC for menu", width - 30, 55);
  
  // ----- ENEMY COUNTER (LEFT SIDE, BOTTOM) -----
  // Shows how many more enemies needed to gain an extra life
  // Every 2 enemies killed = +1 life
  let enemiesNeeded = 2 - (enemiesKilled % 2);
  if (enemiesNeeded === 0) enemiesNeeded = 2;   // Reset to 2 if divisible
  
  textSize(12);
  fill(255, 200, 200);
  textAlign(LEFT);
  text("⚔️ " + enemiesNeeded + " enemies for +1 life", 15, 65);
  
  // ----- CONTROL INSTRUCTIONS (RIGHT SIDE, BOTTOM) -----
  // Shows basic controls for the player
  textSize(10);
  fill(180, 180, 220);
  textAlign(RIGHT);
  text("←→ Move | SPACE Jump | SHIFT Dash | M Sound", width - 15, 65);
  
  // Reset text alignment to default (left)
  textAlign(LEFT);
}