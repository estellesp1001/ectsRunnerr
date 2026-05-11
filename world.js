// =====================================
// WORLD.JS (ΧΩΡΙΣ CHECKPOINTS, ΜΕ ΜΩΒ ΔΙΑΒΟΛΑΚΙ 4.9, 50% ΝΟΜΙΣΜΑΤΑ)
// =====================================

function generateChunk(startX) {
  let difficulty = floor(generatedUntil / 3800);
  let levelBonus = level - 1;
  
  for (let i = 0; i < 10; i++) {
    let x = startX + i * 500;
    let py = random(340, 520);
    
    platforms.push({
      x: x, y: py, w: random(150 - difficulty * 3, 300 - difficulty * 4), h: 28
    });
    
    if (random() < 0.18 + difficulty * 0.025) {
      movingPlatforms.push({
        x: x + 220, y: py - 110, w: 130, h: 22,
        minX: x, maxX: x + 280, dir: 1, speed: 2.2 + difficulty * 0.25
      });
    }
    
    if (random() < 0.04) {
      platforms.push({ x: x + 140, y: 180, w: 220, h: 22 });
      let coinValue = floor(random(5, 11));
      coins.push({ x: x + 200, y: 130, taken: false, id: nextCoinId++, value: coinValue });
      coins.push({ x: x + 260, y: 130, taken: false, id: nextCoinId++, value: coinValue });
    }
    
    if (random() < 0.75) {
      let coinValue = floor(random(5, 11));
      coins.push({ x: x + 120, y: py - 45, taken: false, id: nextCoinId++, value: coinValue });
    }
    
    let enemyChance = 0.18 + difficulty * 0.03 + levelBonus * 0.04;
    
    if (random() < enemyChance) {
      let enemyNumber = floor(random(0, 5));
      enemies.push({
        x: x + 80, y: py - 75, w: 60, h: 60,
        minX: x, maxX: x + 190, dir: random([-1, 1]),
        speed: random(2 + difficulty * 0.3, 3.5 + difficulty * 0.5),
        type: "walker",
        number: enemyNumber
      });
    }
    
    if (random() < enemyChance - 0.05) {
      let enemyNumber = floor(random(0, 5));
      enemies.push({
        x: x + 250, y: py - 170, baseY: py - 170, w: 60, h: 60,
        minX: x, maxX: x + 280, dir: random([-1, 1]),
        speed: random(2 + difficulty * 0.3, 4 + difficulty * 0.5),
        type: "flying", fly: 0, flySpeed: 0.06,
        number: enemyNumber
      });
    }
    
    let devilChance = 0;
    if (level === 2) devilChance = 0.12;
    else if (level === 3 || level === 4) devilChance = 0.2;
    else if (level === 5 || level === 6) devilChance = 0.28;
    else if (level === 7) devilChance = 0.35;
    else devilChance = 0;
    
    if (random() < devilChance && i % 2 === 0) {
      enemies.push({
        x: x + 180, y: py - 100, w: 80, h: 80,
        minX: x + 50, maxX: x + 300,
        dir: random([-1, 1]),
        speed: 1.5 + difficulty * 0.2,
        type: "devil",
        number: "4.9",
        invincible: true
      });
    }
    
    if (level >= 3 && random() < 0.12 + difficulty * 0.03) {
      lavaPools.push({ x: x + 260, w: random(140, 200) });
    }
  }
  generatedUntil += 5000;
}

function updateWorld() {
  for (let mp of movingPlatforms) {
    mp.x += mp.dir * mp.speed;
    if (mp.x > mp.maxX || mp.x < mp.minX) mp.dir *= -1;
  }
  
  for (let e of enemies) {
    if (e.type === "walker") {
      e.x += e.dir * e.speed;
      if (e.x > e.maxX || e.x < e.minX) e.dir *= -1;
    }
    if (e.type === "flying") {
      e.fly = (e.fly || 0) + (e.flySpeed || 0.07);
      e.y = e.baseY + sin(e.fly) * 45;
      e.x += e.dir * e.speed;
      if (e.x > e.maxX || e.x < e.minX) e.dir *= -1;
    }
    if (e.type === "devil") {
      e.x += e.dir * e.speed;
      if (e.x > e.maxX || e.x < e.minX) e.dir *= -1;
    }
  }
}

function drawWorld() {
  let theme = themes[(level - 1) % themes.length];
  
  for (let mp of movingPlatforms) {
    let mx = mp.x + worldOffset;
    
    fill(180, 150, 110);
    rect(mx, mp.y, mp.w, mp.h, 3);
    
    fill(250, 245, 235);
    for (let s = 0; s < 3; s++) {
      rect(mx + 5 + s*3, mp.y - 10 + s*2, mp.w - 10, 8, 2);
    }
    
    fill(140, 110, 70);
    rect(mx + mp.w/2 - 4, mp.y - 12, 8, mp.h + 8, 2);
    
    fill(200, 170, 100);
    rect(mx + mp.w/2 - 2, mp.y - 8, 4, 4, 1);
    rect(mx + mp.w/2 - 2, mp.y + mp.h - 8, 4, 4, 1);
    
    fill(100, 70, 40);
    for (let i = 0; i < 3; i++) {
      rect(mx + 15 + i * 20, mp.y - 3, 12, 3, 1);
      rect(mx + mp.w - 50 + i * 20, mp.y - 3, 12, 3, 1);
    }
    
    if (player.x + player.w > mx && player.x < mx + mp.w &&
        player.y + player.h >= mp.y && player.y + player.h <= mp.y + 40 && player.dy >= 0) {
      player.y = mp.y - player.h;
      player.dy = 0;
      player.onGround = true;
      jumpsLeft = 2;
      player.x += mp.dir * mp.speed;
    }
  }
  
  for (let p of platforms) {
    let px = p.x + worldOffset;
    
    fill(180, 150, 110);
    rect(px, p.y, p.w, p.h, 3);
    
    fill(250, 245, 235);
    for (let s = 0; s < 3; s++) {
      rect(px + 5 + s*3, p.y - 10 + s*2, p.w - 10, 8, 2);
    }
    
    fill(140, 110, 70);
    rect(px + p.w/2 - 4, p.y - 12, 8, p.h + 8, 2);
    
    fill(200, 170, 100);
    rect(px + p.w/2 - 2, p.y - 8, 4, 4, 1);
    rect(px + p.w/2 - 2, p.y + p.h - 8, 4, 4, 1);
    
    fill(100, 70, 40);
    rect(px + 12, p.y - 3, 10, 3, 1);
    rect(px + 28, p.y - 3, 10, 3, 1);
    rect(px + p.w - 40, p.y - 3, 10, 3, 1);
    rect(px + p.w - 25, p.y - 3, 10, 3, 1);
    
    if (player.x + player.w > px && player.x < px + p.w &&
        player.y + player.h >= p.y && player.y + player.h <= p.y + 35 && player.dy >= 0) {
      player.y = p.y - player.h;
      player.dy = 0;
      player.onGround = true;
      jumpsLeft = 2;
    }
  }
  
  for (let lava of lavaPools) {
    let lx = lava.x + worldOffset;
    fill(255, 60, 0, 220);
    rect(lx, groundY - 22, lava.w, 28);
    fill(255, 180, 0);
    for (let i = 0; i < lava.w; i += 25) {
      ellipse(lx + i + 8, groundY - 8, 15, 10);
    }
    if (frameCount % 8 === 0) {
      particles.push(new Particle(lx + random(lava.w), groundY - 20, "orange"));
    }
    if (player.x + player.w > lx && player.x < lx + lava.w && player.y + player.h > groundY - 30) {
      loseLife();
    }
  }
  
  for (let i = 0; i < coins.length; i++) {
    let c = coins[i];
    let alreadyCollected = collectedCoins.includes(c.id);
    
    if (!alreadyCollected && !c.taken) {
      let cx = c.x + worldOffset;
      let displayValue = c.value;
      
      if (displayValue >= 5 && displayValue <= 6) {
        fill(255, 215, 0);
      } else if (displayValue >= 7 && displayValue <= 8) {
        fill(0, 100, 255);
      } else {
        fill(0, 200, 0);
      }
      ellipse(cx, c.y, 28, 28);
      
      fill(255);
      textSize(18);
      textAlign(CENTER, CENTER);
      text(displayValue, cx, c.y);
      
      if (player.x < cx + 15 && player.x + player.w > cx - 15 &&
          player.y < c.y + 15 && player.y + player.h > c.y - 15) {
        c.taken = true;
        collectedCoins.push(c.id);
        ects = ects + 5;
        playCoinSound();
        
        for (let j = 0; j < 12; j++) {
          particles.push(new Particle(cx, c.y, "gold"));
        }
      }
    }
  }
  
  for (let e of enemies) {
    let ex = e.x + worldOffset;
    
    if (e.type === "devil") {
      fill(150, 50, 200);
      ellipse(ex + e.w/2, e.y + e.h/2, e.w-10, e.h-10);
      
      fill(100, 30, 150);
      triangle(ex + e.w*0.25, e.y - 10, ex + e.w*0.4, e.y + 10, ex + e.w*0.1, e.y + 10);
      triangle(ex + e.w*0.75, e.y - 10, ex + e.w*0.9, e.y + 10, ex + e.w*0.6, e.y + 10);
      
      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);
      text("4.9", ex + e.w/2, e.y + e.h/2);
      
      fill(255, 0, 0);
      ellipse(ex + e.w*0.3, e.y + e.h*0.35, 12, 12);
      ellipse(ex + e.w*0.7, e.y + e.h*0.35, 12, 12);
      fill(0);
      ellipse(ex + e.w*0.28, e.y + e.h*0.33, 6, 6);
      ellipse(ex + e.w*0.68, e.y + e.h*0.33, 6, 6);
      
      if (player.x < ex + e.w && player.x + player.w > ex &&
          player.y < e.y + e.h && player.y + player.h > e.y) {
        if (invincible === 0) loseLife();
      }
      
    } else {
      let number = e.number;
      
      fill(200, 50, 50);
      ellipse(ex + e.w/2, e.y + e.h/2, e.w-10, e.h-10);
      
      fill(255);
      textSize(28);
      textAlign(CENTER, CENTER);
      text(number, ex + e.w/2, e.y + e.h/2);
      
      fill(255);
      ellipse(ex + e.w*0.3, e.y + e.h*0.35, 8, 8);
      ellipse(ex + e.w*0.7, e.y + e.h*0.35, 8, 8);
      fill(0);
      ellipse(ex + e.w*0.28, e.y + e.h*0.33, 4, 4);
      ellipse(ex + e.w*0.68, e.y + e.h*0.33, 4, 4);
      
      if (player.x < ex + e.w && player.x + player.w > ex &&
          player.y < e.y + e.h && player.y + player.h > e.y) {
        
        if (player.dy > 0 && player.y + player.h < e.y + 25) {
          e.dead = true;
          player.dy = -14;
          enemiesKilled++;
          playEnemyKillSound();
          
          if (enemiesKilled % 2 === 0) {
            addLife();
          }
          
          for (let i = 0; i < 18; i++) {
            particles.push(new Particle(ex + e.w/2, e.y + e.h/2, "pink"));
          }
        } else {
          if (invincible === 0) loseLife();
        }
      }
    }
  }
  enemies = enemies.filter(e => !e.dead);
}