// =====================================
// PLAYER.JS (ΜΕ DELAY 1 ΔΕΥΤΕΡΟΛΕΠΤΟ)
// =====================================

let claimEffectTimer = 0;
let crushEffectTimer = 0;

function initPlayer() {
  player = {
    x: 150,
    y: 500,
    w: 70,
    h: 90,
    dy: 0,
    speed: 5,
    onGround: true
  };
}

function updatePlayer() {
  if (keyIsDown(RIGHT_ARROW)) {
    if (player.x < width / 2) {
      player.x += player.speed;
    } else {
      worldOffset -= player.speed;
    }
  }
  
  if (keyIsDown(LEFT_ARROW)) {
    if (player.x > 80) {
      player.x -= player.speed;
    } else if (worldOffset < 0) {
      worldOffset += player.speed;
    }
  }
  
  player.dy += gravity;
  player.y += player.dy;
  player.onGround = false;
  
  if (claimEffectTimer > 0) claimEffectTimer--;
  if (crushEffectTimer > 0) crushEffectTimer--;
}

function drawPlayer() {
  push();
  
  // Invincibility flash (αναβοσβήσιμο όταν είναι άτρωτος)
  if (invincible > 0 && (frameCount % 6 < 3)) {
    tint(255, 255, 100);
  } else {
    noTint();
  }
  
  // Επιλογή εικόνας ανάλογα με την κατάσταση
  let currentImg;
  if (crushEffectTimer > 0) {
    currentImg = playerCrushImg;      // εικόνα όταν χτυπάει (1 δευτερόλεπτο)
  } else if (claimEffectTimer > 0) {
    currentImg = playerClaimImg;      // εικόνα όταν παίρνει νόμισμα (1 δευτερόλεπτο)
  } else if (!player.onGround) {
    currentImg = playerJumpImg;       // εικόνα άλματος
  } else {
    currentImg = playerImg;           // κανονική εικόνα
  }
  
  if (currentImg && currentImg.width > 0) {
    image(currentImg, player.x, player.y, player.w, player.h);
  } else {
    // Fallback σχήμα (αν δεν υπάρχουν εικόνες)
    fill(50, 120, 255);
    rect(player.x, player.y, player.w, player.h, 16);
    fill(255);
    ellipse(player.x + 20, player.y + 30, 12);
    ellipse(player.x + 50, player.y + 30, 12);
    fill(0);
    ellipse(player.x + 18, player.y + 28, 5);
    ellipse(player.x + 48, player.y + 28, 5);
  }
  
  noTint();
  pop();
}

// Συνάρτηση για ενεργοποίηση εφέ claim (μαζεύει νόμισμα)
function triggerClaimEffect() {
  claimEffectTimer = 50;  // 50 frames 
}

// Συνάρτηση για ενεργοποίηση εφέ crush (χτυπάει σε εχθρό)
function triggerCrushEffect() {
  crushEffectTimer = 50;  // 50 frames 
}