const startGameBtn = document.querySelector(".start-game");
const restartGameBtn = document.querySelector(".restart-game");
const levelUpBtn = document.querySelector(".level-up");

const start = document.querySelector(".start");
const result = document.querySelector(".result");
const winning = result.querySelector(".winning");
const gameOver = result.querySelector(".game-over");

const canvas = document.querySelector(".canvas");

canvas.width = 500;
canvas.height = 500;

const context = canvas.getContext("2d");
const GameSpeed = 7;

class Paddle{
    constructor() {
        this.width = 100;
        this.height = 10;
        this.speed = GameSpeed;

        this.position = {
            x: canvas.width/2 - this.width/2,
            y: canvas.height - this.height - 20,
        }
        this.velocity = {
            x: 0,
            y: 0,
        }
    }

    draw() {
        context.beginPath();
        context.globalAlpha = this.opacity;
        context.fillStyle = "white";
        context.fillRect(this.position.x , this.position.y , this.width , this.height);
        context.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        // this.position.y += this.velocity.y;
    }
}

class Ball{
    constructor(position) {
        this.radius = 10;
        this.position = position;
        this.speed = GameSpeed;
        this.velocity = {
            x: this.speed * (Math.random() * 2 - 1),
            y: -this.speed,
        }
    }

    draw() {
        context.beginPath();
        context.globalAlpha = 1;
        context.fillStyle = "yellow";
        context.arc(this.position.x, this.position.y - this.radius - 5, this.radius, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Brike{
    constructor(width , height , position , color) {
        this.width = width;
        this.height = height;
        this.position = position;
        this.color = color;
        this.opacity = 1;
    }

    draw() {
        context.beginPath();
        context.globalAlpha = this.opacity;
        context.fillStyle = this.color;
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.closePath();
    }
}

class GridBricks{
    constructor(map) {
        this.map = map;
        this.grid = [];
        this.brikeWidth = 80;
        this.brikeHeight = 20;
        
        let startPoint = 20;

        for (let i = 0; i < this.map.length; i++){
            const randColor = Math.floor(Math.random() * 360);
            const color = `hsl(${randColor} , 100% , 50%)`;
            this.grid[i] = [];
            for (let j = 0; j < this.map[i].length; j++){
                if (this.map[i][j] === '-') { /// Brick
                    this.grid[i][j] = new Brike(
                        this.brikeWidth,
                        this.brikeHeight,
                        {
                            x: startPoint + 10 * (j + 1) + this.brikeWidth * j,
                            y: 40 + 10 * (i + 1) + this.brikeHeight * i,
                        },
                        color
                    );
                } else if (this.map[i][j] === ' ') {
                    this.grid[i][j] = new Brike(
                        this.brikeWidth,
                        this.brikeHeight,
                        {
                            x: startPoint + 10 * (j + 1) + this.brikeWidth * j,
                            y: 40 + 10 * (i + 1) + this.brikeHeight * i,
                        },
                        "black"
                    );
                } else {
                    continue;
                }
            }
        }
    }

    draw() {
        for (let i = 0; i < this.map.length; i++){
            for (let j = 0; j < this.map[i].length; j++){
                if (this.map[i][j] === ' ') {
                    this.grid[i][j].opacity = 0;
                }
                this.grid[i][j].draw();
            }
        }
    }

    update() {
        this.draw();
    }
}

let paddle;
let ball;
let bricks;

let score;
let life;

const keys = {
    left: {
        pressed: false,
    },
    right: {
        pressed: false,
    },
    space: {
        pressed: false,
    }
}

const scoreImage = createImage("img/score.png");
const lifeImage = createImage("img/life.png");

function initGame() {
    paddle = new Paddle();
    ball = new Ball({ x: paddle.position.x + paddle.width / 2, y: paddle.position.y });

    bricks = new GridBricks([
        ["-" , "-" , "-" , "-" , "-"],
        ["-" , "-" , "-" , "-" , "-"],
        ["-" , "-" , "-" , "-" , "-"],
        ["-" , "-" , "-" , "-" , "-"],
    ]);

    score = 0;
    life = 3;

    animate();
}

function upLevel(s) {
    paddle = new Paddle();
    ball = new Ball({ x: paddle.position.x + paddle.width / 2, y: paddle.position.y });

    bricks = new GridBricks([
        ["-" , "-" , "-" , "-" , "-"],
        [" " , "-" , "-" , "-" , " "],
        [" " , " " , "-" , " " , " "],
        [" " , " " , "-" , " " , " "],
        [" " , " " , "-" , " " , " "],
        [" " , "-" , "-" , "-" , " "],
        ["-" , "-" , "-" , "-" , "-"],

    ]);

    score = s;
    life++;

    animate();
}

let animateID;

function animate() {
    context.fillStyle = "rgba(0,0,0,0.3)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // context.clearRect(0, 0, canvas.width, canvas.height);
    animateID = requestAnimationFrame(animate);
    bricks.update();
    ball.update();
    paddle.update();

    /// Collision Detection Between Ball and Wall
    if (ball.position.x + ball.radius >= canvas.width
        || ball.position.x - ball.radius <= 0) {
        ball.velocity.x = -ball.velocity.x;
    }else if (ball.position.y - ball.radius <= 0) {
        ball.velocity.y = -ball.velocity.y;
    }else if (ball.position.y + ball.radius >= canvas.height) {
        life--;
        /// Game Over
        if (life === 0) {
            canvas.style.display = "none";
            result.style.display = "flex";
            gameOver.style.display = "block";
            cancelAnimationFrame(animateID);
        } else {
            ball = new Ball({ x: paddle.position.x + paddle.width / 2, y: paddle.position.y });
        }
    }
    /// Collision Detection Between Ball and Paddle
    if (ball.position.y >= paddle.position.y
        && ball.position.y <= paddle.position.y + paddle.height
        && ball.position.x >= paddle.position.x
        && ball.position.x <= paddle.position.x + paddle.width) {
        
        let collidePoint = ball.position.x - (paddle.position.x + paddle.width / 2);
        collidePoint = collidePoint / (paddle.width / 2);
        let angle = collidePoint * (Math.PI / 3);
        ball.velocity.x = Math.sin(angle) * ball.speed;
        ball.velocity.y = -Math.cos(angle) * ball.speed;
    }

    /// Collision Detection Between Ball and Bricks
    for (let i = 0; i < bricks.map.length; i++){
        for (let j = 0; j < bricks.map[i].length; j++){
            const brick = bricks.grid[i][j];
            if (bricks.map[i][j] == '-'
                && ball.position.y >= brick.position.y
                && ball.position.y <= brick.position.y + brick.height
                && ((ball.position.x + ball.radius >= brick.position.x &&
                    ball.position.x + ball.radius <= brick.position.x + brick.width)
                || (ball.position.x - ball.radius >= brick.position.x
                && ball.position.x - ball.radius <= brick.position.x + brick.width))) {
                
                bricks.map[i][j] = " ";
                ball.velocity.y = -ball.velocity.y;
                
                /// Score
                score += 10;
            }
        }
    }

    /// Game Stats
    gameStats(score, { x: 10, y: 10 }, scoreImage);
    gameStats(life, { x: canvas.width - 70, y: 10 }, lifeImage);

    if (checkWinning()) {
        canvas.style.display = "none";
        result.style.display = "flex";
        winning.style.display = "block";
        cancelAnimationFrame(animateID);
    }

    if (keys.left.pressed && paddle.position.x > 0) {
        paddle.velocity.x = -paddle.speed;
    } else if (keys.right.pressed && paddle.position.x + paddle.width < canvas.width) {
        paddle.velocity.x = paddle.speed;
    } else {
        paddle.velocity.x = 0;
    }
}

function createImage(path) {
    const img = new Image();
    img.src = path;
    return img;
}

function gameStats(text , position , image) {
    context.beginPath();
    context.drawImage(image, position.x, position.y, 30, 30);
    context.font = "20px Arial";
    context.fillText(text, position.x + 40, position.y + 23);
    context.closePath();
}

function checkWinning() {
    for (let i = 0; i < bricks.map.length; i++){
        for (let j = 0; j < bricks.map[i].length; j++){
            if (bricks.map[i][j] == "-")
                return false;
        }
    }
    return true;
}


addEventListener("keydown", (event) => {
    // console.log(event.key);
    switch (event.key) {
        case "ArrowLeft":
        case "a":
            keys.left.pressed = true;
            break;
        case "ArrowRight":
        case "d":
            keys.right.pressed = true;
            break;
        case " ":
            keys.space.pressed = true;
            break;
    }
});

addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowLeft":
        case "a":
            keys.left.pressed = false;
            break;
        case "ArrowRight":
        case "d":
            keys.right.pressed = false;
            break;
        case " ":
            keys.space.pressed = false;
            break;
    }
});

document.onreadystatechange = () => {
    start.style.display = "flex";
    canvas.style.display = "none";
    result.style.display = "none";
    winning.style.display = "none";
    gameOver.style.display = "none";
}

startGameBtn.addEventListener("click", () => {
    start.style.display = "none";
    canvas.style.display = "block";
    initGame();
});

restartGameBtn.addEventListener("click", () => {
    result.style.display = "none";
    gameOver.style.display = "none";
    canvas.style.display = "block";
    initGame();
});

levelUpBtn.addEventListener("click", () => {
    result.style.display = "none";
    winning.style.display = "none";
    canvas.style.display = "block";
    upLevel(score);
});