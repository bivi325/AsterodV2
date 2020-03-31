if (/Mobi/.test(navigator.userAgent)) {
  console.log('Mobile')
}

export default class Game {
  constructor() {
    this.container = document.getElementById("content");
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.prevUpdateTime = 0;
    this.height = 0;
    this.width = 0;

    this.state = 0;

    this.fontSize = 0;
    this.textPosX = 0;
    this.textPosY = 0;

    this.smallFontSize = 30;
    this.scorePosX = 0;
    this.scorePosY = 0;

    this.livesPosX = 0;
    this.livesPosY = 0;

    this.lives = 3;
    this.score = 0;
    this.SpaceShip = {};
    this.bullets = [];
    this.asteroids = [];
    this.bulletSize = 2;
    this.bulletSpeed = 5;
    this.asteroidLimit = 10;
    this.numberOfAsteroidClasses = 2;
    this.smallAsteroidSpeed = 1;
    this.mediumAsteroidSpeed = 0.5;

    this.commands = {};

    this.text = {
      newGameText: "New Game",
      lives: `Lives: ${this.lives}`,
      endGameText: "Try Again"
    };

    this.init();
  }

  init() {
    window.addEventListener("resize", x => this.onResize());
    this.canvas.addEventListener("click", x => this.clickHandler(x));
    document.addEventListener("keyup", x => this.keyUpHandler(x));
    document.addEventListener("keydown", x => this.keyDownHandler(x));

    this.onResize();
    this.SpaceShip = new SpaceShip(canvas, 3);

    requestAnimationFrame(time => this.update(time));
  }

  clickHandler(e) {
    if (this.state == 0) {
      const x = e.clientX;
      const y = e.clientY;
      if (
        x > this.textPosX &&
        x <
          (this.width + (this.fontSize * this.text.newGameText.length) / 2) / 2
      ) {
        if (y > (this.height - this.fontSize) / 2 && y < this.textPosY) {
          canvas.style.cursor = "none";
          this.state = 1;
        }
      }
    } else if (this.state == 1) {
      const spaceship = this.SpaceShip;
      this.bullets.push(
        new Bullet(
          this.bulletSize,
          spaceship.posX,
          spaceship.posY,
          spaceship.angle,
          this.bulletSpeed
        )
      );
    } else if (this.state == 2) {
      const x = e.clientX;
      const y = e.clientY;
      if (
        x > this.textPosX &&
        x <
          (this.width + (this.fontSize * this.text.newGameText.length) / 2) / 2
      ) {
        if (y > (this.height - this.fontSize) / 2 && y < this.textPosY) {
          location.reload()
        }
      }
    }
  }

  keyUpHandler(e) {
    this.commands[e.key] = false;
  }

  keyDownHandler(e) {
    this.commands[e.key] = true;
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.fontSize = Math.floor(this.width / 10);
    this.textPosX =
      (this.width - (this.fontSize * this.text.newGameText.length) / 2 - 20) /
      2;
    this.textPosY = (this.height + this.fontSize) / 2;

    this.scorePosX = 10;
    this.scorePosY = this.smallFontSize;

    this.livesPosX =
      this.width - (this.text.lives.length * this.smallFontSize) / 2;
    this.livesPosY = this.smallFontSize;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  update(time) {
    const dt = time - this.prevUpdateTime;
    this.prevUpdateTime = time;

    if (this.lives > 0) {
      this.draw();
      this.gameLoop();
    } else {
      this.draw();
    }

    requestAnimationFrame(time => this.update(time));
  }

  gameLoop() {
    const spaceship = this.SpaceShip;
    if (this.commands["w"] == true || this.commands["ArrowUp"] == true) {
      spaceship.posX =
        spaceship.posX + spaceship.speed * Math.cos(spaceship.angle);
      spaceship.posY =
        spaceship.posY + spaceship.speed * Math.sin(spaceship.angle);
    }
    if (this.commands["s"] == true || this.commands["ArrowDown"] == true) {
      spaceship.posX =
        spaceship.posX + spaceship.speed * Math.cos(-spaceship.angle);
      spaceship.posY =
        spaceship.posY + spaceship.speed * Math.sin(-spaceship.angle);
    }
    if (this.commands["a"] == true || this.commands["ArrowLeft"] == true) {
      spaceship.angle -= spaceship.degToRad(5);
    }
    if (this.commands["d"] == true || this.commands["ArrowRight"] == true) {
      spaceship.angle += spaceship.degToRad(5);
    }

    if (this.asteroids.length < this.asteroidLimit) {
      let whatWillItBe = Math.floor(
        Math.random() * this.numberOfAsteroidClasses * 4
      );
      let asteroid;
      if (whatWillItBe > 4) {
        asteroid = new MediumAsteroid(this.canvas, this.smallAsteroidSpeed);
      } else {
        asteroid = new SmallAsteroid(this.canvas, this.mediumAsteroidSpeed);
      }
      this.asteroids.push(asteroid);
    }

    this.checkBounds(spaceship);

    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].posX =
        this.asteroids[i].posX +
        this.asteroids[i].speed * Math.cos(this.asteroids[i].angle);
      this.asteroids[i].posY =
        this.asteroids[i].posY +
        this.asteroids[i].speed * Math.sin(this.asteroids[i].angle);
      this.checkBounds(this.asteroids[i]);
    }

    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].posX =
        this.bullets[i].posX +
        this.bullets[i].speed * Math.cos(this.bullets[i].angle);
      this.bullets[i].posY =
        this.bullets[i].posY +
        this.bullets[i].speed * Math.sin(this.bullets[i].angle);
      if (
        this.bullets[i].posX > this.width ||
        this.bullets[i].posX < 0 ||
        this.bullets[i].posY < 0 ||
        this.bullets.posY > this.height
      ) {
        this.bullets.splice(i, 1);
      }
    }
    this.checkCollision();
  }

  checkBounds(obj) {
    if (obj.posX > canvas.width) {
      obj.posX = 1;
    }
    if (obj.posX < 0) {
      obj.posX = canvas.width - 1;
    }
    if (obj.posY < 0) {
      obj.posY = canvas.height - 1;
    }
    if (obj.posY > canvas.height) {
      obj.posY = 1;
    }
  }

  checkCollision() {
    const asteroids = this.asteroids;
    const spaceship = this.SpaceShip;
    const bullets = this.bullets;
    for (let i = 0; i < asteroids.length; i++) {
      let dx = asteroids[i].posX - spaceship.posX;
      let dy = asteroids[i].posY - spaceship.posY;

      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < asteroids[i].size + spaceship.size) {
        this.lives--;
        this.text.lives = `Lives: ${this.lives}`;
        if(this.lives == 0){this.state = 2}
        spaceship.posX = canvas.width / 2;
        spaceship.posY = canvas.height / 2;
      }
    }
    for (let i = 0; i < asteroids.length; i++) {
      for (let j = 0; j < bullets.length; j++) {
        let dx = asteroids[i].posX - bullets[j].posX;
        let dy = asteroids[i].posY - bullets[j].posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < asteroids[i].size + bullets[j].size) {
          bullets.splice(j, 1);
          this.score += asteroids[i].price;
          if (asteroids[i].name == "medium") {
            const asteroid_1 = new SmallAsteroid(
              this.canvas,
              this.smallAsteroidSpeed
            );
            asteroid_1.posX =
              asteroids[i].posX +
              asteroids[i].size * Math.cos(asteroids[i].angle);
            asteroid_1.posY =
              asteroids[i].posY +
              asteroids[i].size * Math.sin(asteroids[i].angle);
            asteroid_1.angle = asteroids[i].angle;
            const asteroid_2 = new SmallAsteroid(
              this.canvas,
              this.smallAsteroidSpeed
            );
            asteroid_2.posX =
              asteroids[i].posX +
              asteroids[i].size * Math.cos(asteroids[i].angle);
            asteroid_2.posY =
              asteroids[i].posY +
              asteroids[i].size * Math.sin(asteroids[i].angle);
            asteroid_2.angle = -asteroids[i].angle;
            asteroids.push(asteroid_1);
            asteroids.push(asteroid_2);
          }
          asteroids.splice(i, 1);
          return;
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (this.state) {
      case 0:
        this.drawText("New Game", this.textPosX, this.textPosY, this.fontSize);
        break;
      case 1:
        this.drawText(
          this.score,
          this.scorePosX,
          this.scorePosY,
          this.smallFontSize
        );
        this.drawText(
          this.text.lives,
          this.livesPosX,
          this.livesPosY,
          this.smallFontSize
        );
        this.drawSpaceShip();
        this.drawBullets();
        this.drawAsteroids();
        break;
      case 2:
        this.canvas.style.cursor = "auto";
        this.drawText(
          `Your score is ${this.score}`,
          this.textPosX - canvas.width / 8,
          this.textPosY - this.fontSize,
          this.fontSize
        );
        this.drawText(
          this.text.endGameText,
          this.textPosX,
          this.textPosY,
          this.fontSize
        );
        break;
    }
  }

  drawText(text, posX, posY, fontSize) {
    this.ctx.font = `${fontSize}px Aria`;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(text, posX, posY);
  }

  drawSpaceShip() {
    let x, y;
    let i = 0;
    const spaceship = this.SpaceShip;

    this.ctx.beginPath();

    x =
      spaceship.rotX(
        spaceship.shape[i].x,
        spaceship.shape[i].y,
        spaceship.angle
      ) + spaceship.posX;
    y =
      spaceship.rotY(
        spaceship.shape[i].x,
        spaceship.shape[i].y,
        spaceship.angle
      ) + spaceship.posY;
    this.ctx.moveTo(x, y);

    for (i = 1; i < spaceship.shape.length; i++) {
      x =
        spaceship.rotX(
          spaceship.shape[i].x,
          spaceship.shape[i].y,
          spaceship.angle
        ) + spaceship.posX;
      y =
        spaceship.rotY(
          spaceship.shape[i].x,
          spaceship.shape[i].y,
          spaceship.angle
        ) + spaceship.posY;
      this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fillStyle = spaceship.color;
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

  drawBullets() {
    const bullets = this.bullets;
    for (let i = 0; i < bullets.length; i++) {
      this.ctx.beginPath();
      this.ctx.arc(
        bullets[i].posX,
        bullets[i].posY,
        bullets[i].size,
        0,
        Math.PI * 2
      );
      this.ctx.fillStyle = bullets[i].color;
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  drawAsteroids() {
    const asteroids = this.asteroids;
    for (let i = 0; i < asteroids.length; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(
        asteroids[i].posX + asteroids[i].size * Math.cos(0),
        asteroids[i].posY + asteroids[i].size * Math.sin(0)
      );
      for (let j = 1; j <= asteroids[i].numberOfSides; j += 1) {
        this.ctx.lineTo(
          asteroids[i].posX +
            asteroids[i].size *
              Math.cos((j * 2 * Math.PI) / asteroids[i].numberOfSides),
          asteroids[i].posY +
            asteroids[i].size *
              Math.sin((j * 2 * Math.PI) / asteroids[i].numberOfSides)
        );
      }
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
}

class GameObj {
  constructor(size, posX, posY, angle, speed) {
    this.size = size;
    this.posX = posX;
    this.posY = posY;
    this.angle =
      angle == 0
        ? Math.floor(Math.random() * Math.floor(this.degToRad(360)))
        : angle;
    this.speed = speed;
  }
  degToRad(angle) {
    return (3.1415926 * angle) / 180;
  }
}

class SpaceShip extends GameObj {
  constructor(canvas, speed) {
    super(canvas.height / 60, canvas.width / 2, canvas.height / 2, 0, speed);
    this.color = "White";
    this.shape = [
      { x: canvas.height / 60, y: 0 },
      { x: -canvas.height / 60, y: -canvas.height / 80 },
      { x: -canvas.height / 80, y: 0 },
      { x: -canvas.height / 60, y: canvas.height / 80 }
    ];
  }

  rotX(x, y, angle) {
    return x * Math.cos(angle) - y * Math.sin(angle);
  }

  rotY(x, y, angle) {
    return x * Math.sin(angle) + y * Math.cos(angle);
  }
}

class Bullet extends GameObj {
  constructor(size = 2, posX, posY, angle, speed = 5) {
    super(size, posX, posY, angle, speed);
    this.color = "Red";
  }
}

class SmallAsteroid extends GameObj {
  constructor(canvas, speed) {
    super(
      canvas.width / 80,
      Math.floor(Math.random() * Math.floor(canvas.width / 3)),
      Math.floor(Math.random() * Math.floor(canvas.height / 3)),
      0,
      speed
    );
    this.numberOfSides = 6;
    this.name = "small";
    this.price = 100;
  }
}

class MediumAsteroid extends GameObj {
  constructor(canvas, speed) {
    super(
      canvas.width / 40,
      Math.floor(Math.random() * Math.floor(canvas.width / 3)),
      Math.floor(Math.random() * Math.floor(canvas.height / 3)),
      0,
      speed
    );
    this.numberOfSides = 8;
    this.name = "medium";
    this.price = 400;
  }
}

new Game();
