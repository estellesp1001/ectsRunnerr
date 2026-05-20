// =====================================
// UI.JS (ΜΕ ΓΡΑΜΜΑΤΑ ΜΕΣΑ ΣΤΟ ΠΛΑΙΣΙΟ, ΧΩΡΙΣ ΜΙΚΡΟΓΡΑΦΙΑ)
// =====================================

function drawUI() {
  let theme = getCurrentTheme();
  
  fill(0, 0, 0, 200);
  rect(0, 0, width, 85);
  
  // ========== ECTS (ΜΑΥΡΟ, ΤΡΙΣΔΙΑΣΤΑΤΟ) ==========
  textSize(24);
  textAlign(LEFT);
  
  fill(0, 0, 0, 200);
  text("🎓 ECTS: " + floor(ects) + "/100", 18, 48);
  
  fill(0, 0, 0);
  text("🎓 ECTS: " + floor(ects) + "/100", 15, 45);
  
  fill(255, 255, 255);
  text("🎓 ECTS: " + floor(ects) + "/100", 14, 44);
  
  // ========== ΖΩΕΣ (ΚΑΠΕΛΑ ΠΤΥΧΙΟΥ) ==========
  let hatsX = 280;
  textSize(28);
  
  for (let i = 0; i < lives; i++) {
    let x = hatsX + i * 38;
    
    fill(0, 0, 0, 200);
    text("🎓", x + 3, 48);
    
    fill(0, 0, 0);
    text("🎓", x, 45);
    
    fill(255, 215, 0);
    text("🎓", x - 1, 44);
  }
  
  // Άδειες θέσεις
  for (let i = lives; i < maxLives; i++) {
    let x = hatsX + i * 38;
    fill(0, 0, 0, 80);
    text("🎓", x, 45);
  }
  
  // ========== ΟΝΟΜΑ ΕΞΑΜΗΝΟΥ (ΔΕΞΙΑ, ΜΕΣΑ ΣΤΟ ΠΛΑΙΣΙΟ) ==========
  textSize(18);
  fill(255, 220, 100);
  textAlign(RIGHT);
  text(theme.name, width - 30, 35);
  
  // ========== ΜΗΝΥΜΑ MENU (ΔΕΞΙΑ, ΚΑΤΩ ΑΠΟ ΤΟ ΟΝΟΜΑ) ==========
  textSize(11);
  fill(180, 180, 220);
  textAlign(RIGHT);
  text("Press ESC for menu", width - 30, 55);
  
  // ========== ΜΕΤΡΗΤΗΣ ΕΧΘΡΩΝ (ΑΡΙΣΤΕΡΑ ΚΑΤΩ) ==========
  let enemiesNeeded = 2 - (enemiesKilled % 2);
  if (enemiesNeeded === 0) enemiesNeeded = 2;
  
  textSize(12);
  fill(255, 200, 200);
  textAlign(LEFT);
  text("⚔️ " + enemiesNeeded + " enemies for +1 life", 15, 65);
  
  // ========== ΟΔΗΓΙΕΣ (ΔΕΞΙΑ ΚΑΤΩ) ==========
  textSize(10);
  fill(180, 180, 220);
  textAlign(RIGHT);
  text("←→ Move | SPACE Jump | SHIFT Dash | M Sound", width - 15, 65);
  
  textAlign(LEFT);
}