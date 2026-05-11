// =====================================
// PLAYER.JS
// =====================================

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
  // =====================================
// PLAYER.JS (ΜΕ ΠΑΡΑΚΟΛΟΥΘΗΣΗ ΠΡΟΣΓΕΙΩΣΗΣ ΓΙΑ ΚΑΠΝΟ)
// =====================================

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
  // Αποθήκευση προηγούμενης κατάστασης για έλεγχο προσγείωσης
  let wasOnGround = player.onGround;
  
  // Κίνηση δεξιά
  if (keyIsDown(RIGHT_ARROW)) {
    if (player.x < width / 2) {
      player.x += player.speed;
    } else {
      worldOffset -= player.speed;
    }
  }
  
  // Κίνηση αριστερά
  if (keyIsDown(LEFT_ARROW)) {
    if (player.x > 80) {
      player.x -= player.speed;
    } else if (worldOffset < 0) {
      worldOffset += player.speed;
    }
  }
  
  // Βαρύτητα
  player.dy += gravity;
  player.y += player.dy;
  
  // Μηδενισμός onGround - θα οριστεί true από το ground collision
  player.onGround = false;
}

function drawPlayer() {
  push();
  
  // Invincibility flash (αναβοσβήνει όταν είναι άτρωτος)
  if (invincible > 0 && (frameCount % 6 < 3)) {
    tint(255, 255, 100);
  } else {
    noTint();
  }
  
  // Σχεδίαση παίκτη (αν υπάρχει εικόνα, αλλιώς fallback)
  if (playerImg && playerImg.width > 0) {
    image(playerImg, player.x, player.y, player.w, player.h);
  } else {
    // Fallback σχήμα
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
  player.dy += gravity;
  player.y += player.dy;
  player.onGround = false;
}

function drawPlayer() {
  push();
  
  if (invincible > 0 && (frameCount % 6 < 3)) {
    tint(255, 255, 100);
  } else {
    noTint();
  }
  
  if (playerImg && playerImg.width > 0) {
    image(playerImg, player.x, player.y, player.w, player.h);
  } else {
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