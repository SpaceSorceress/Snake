const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = 500);
const height = (canvas.height = 500);
const blockSize = 10; //size of a 'block' will be 10x10
const widthInBloks = width / blockSize; //how many "blocks" will fit in width
const heightInBlocks = height / blockSize; //same in height

let score = 0;

function Field() {
  this.drawBorders = function () {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
    ctx.fillRect(0 + blockSize, height - blockSize, width, blockSize);
  };
}

Field.prototype.drawScore = function (score, x, y) {
  score = `Score: ${score} `;
  //ctx.textBaseline='top'; //align vertically
  //ctx.textBaseline='bottom';
  //ctx.textAlign='left'/'center'/'right'; align horizontally
  ctx.textBaseline = "middle";
  ctx.fillStyle = "Black";
  ctx.font = "20px Courier";
  ctx.fillText(score, x, y);
};
Field.prototype.gameOver = function () {
  playing = false;
  ctx.font = "60px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game Over", width / 2, height / 2);
};

function Block(col, row) {
  (this.col = col), (this.row = row);
}

Block.prototype.drawSquare = function (color) {
  let x = this.col * blockSize;
  let y = this.row * blockSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, blockSize, blockSize);
};
Block.prototype.drawCircle = function (color) {
  let centerX = this.col * blockSize + blockSize / 2;
  let centerY = this.row * blockSize + blockSize / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(centerX, centerY, blockSize / 2, 0, Math.PI * 2, false);
  ctx.fill();
};
Block.prototype.isOnTheSameSpot = function (otherBlock) {
  return this.col === otherBlock.col && this.row === otherBlock.row;
}; //this f-n checks if 2 blocks on the same square of gameField. If yes, returns true (x and y should be exactly the same).

function Snake() {
  this.segments = [
    new Block(7, 5), //head
    new Block(6, 5),
    new Block(5, 5), //tail
  ];
  this.direction = "right";
  this.nextDirection = "right";
}
Snake.prototype.draw = function () {
  for (let i = 0; i < this.segments.length; i++) {
    if (i === 0) {
      this.segments[i].drawSquare("YellowGreen");
    } else if (i > 0 && i % 2 === 0) {
      this.segments[i].drawSquare("Navy");
    } else {
      this.segments[i].drawSquare("Orange");
    }
  }
};

Snake.prototype.move = function () {
  let head = this.segments[0];
  let newHead;

  this.direction = this.nextDirection;

  if (this.direction === "right") {
    newHead = new Block(head.col + 1, head.row);
  } else if (this.direction === "down") {
    newHead = new Block(head.col, head.row + 1);
  } else if (this.direction === "up") {
    newHead = new Block(head.col, head.row - 1);
  } else if (this.direction === "left") {
    newHead = new Block(head.col - 1, head.row);
  }

  if (this.checkCollision(newHead)) {
    gameField.gameOver();

    return;
  }

  this.segments.unshift(newHead);

  if (newHead.isOnTheSameSpot(apple.position)) {
    score++;
    apple.move();
    animationTime--;
  } else {
    this.segments.pop();
  }
};

Snake.prototype.checkCollision = function (head) {
  let leftCollision = head.col === 0;
  let rightCollision = head.col === widthInBloks - 1;
  let topCollision = head.row === 0;
  let bottomCollision = head.row === heightInBlocks - 1;

  let wallColission =
    leftCollision || rightCollision || bottomCollision || topCollision;

  let selfCollision = false;

  for (let i = 0; i < this.segments.length; i++) {
    if (head.isOnTheSameSpot(this.segments[i])) {
      selfCollision = true;
    }
  }
  return selfCollision || wallColission;
};

const directions = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
};
$("body").keydown(function (event) {
  let newDirection = directions[event.keyCode];
  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  }
});

Snake.prototype.setDirection = function (newDirection) {
  if (this.direction === "right" && newDirection === "left") {
    return;
  } else if (this.direction === "left" && newDirection === "right") {
    return;
  } else if (this.direction === "up" && newDirection === "down") {
    return;
  } else if (this.direction === "down" && newDirection === "up") {
    return;
  }
  this.nextDirection = newDirection;
};

function Apple() {
  this.position = new Block(10, 10);
}
Apple.prototype.draw = function () {
  this.position.drawCircle("YellowGreen ");
};
Apple.prototype.move = function () {
  let randomCol = Math.floor(Math.random() * (widthInBloks - 2)) + 1;
  let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
  let tryPosition = new Block(randomCol, randomRow);
  for (let i = 0; i < snake.segments.length; i++) {
    if (!tryPosition.isOnTheSameSpot(snake.segments[i])) {
      this.position = tryPosition;
    } else {
      tryPosition = new Block(randomCol, randomRow);
    }
  }
};

let apple = new Apple();
let snake = new Snake();
let gameField = new Field();

let playing = true;
let animationTime = 100;
let gameLoop = function () {
  ctx.clearRect(0, 0, width, height);
  gameField.drawBorders();
  gameField.drawScore(score, blockSize, blockSize * 2);
  snake.move();
  snake.draw();
  apple.draw();
  if (playing) {
    setTimeout(gameLoop, animationTime);
  }
};

gameLoop();
