let player, projectiles, enemies, particles;
let animationId;
let score = 0;

const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const startGameButton = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const finalScoreEl = document.querySelector("#finalScoreEl");

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

function init() {
  player = new Player(x, y, 15, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  finalScoreEl.innerHTML = score;
}

const spawnEnemies = () => {
  setInterval(() => {
    let enemyX, enemyY;
    const radius = Math.random() * (30 - 4) + 4;

    if (Math.random() < 0.5) {
      enemyX = Math.random() < 0.5 ? 0 - radius : radius + canvas.width;
      enemyY = Math.random() * canvas.height;
    } else {
      enemyX = Math.random() * canvas.width;
      enemyY = Math.random() < 0.5 ? 0 - radius : radius + canvas.height;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(y - enemyY, x - enemyX);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity));
  }, 1000);
};

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, particleIndex) => {
    particle.update();
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();

    // remove from the edges of the screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x + -projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y + projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    const playerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (playerDist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      modalEl.style.display = "flex";
      finalScoreEl.innerHTML = score;
    }
    projectiles.forEach((projectile, projectileIndex) => {
      const projectileDist = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      // when projectiles thouch the enemy
      if (projectileDist - enemy.radius - projectile.radius < 1) {
        // create explosions effect
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }
        if (enemy.radius > 20) {
          // increase score
          score += 100;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
        } else {
          score += 250;
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
          }, 0);
        }
        scoreEl.innerHTML = score;
        setTimeout(() => {
          projectiles.splice(projectileIndex, 1);
        });
      }
    });
  });
}

addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - y, event.clientX - x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(new Projectile(x, y, 5, "white", velocity));
});

startGameButton.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();

  modalEl.style.display = "none";
});
