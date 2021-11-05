const DIRECTION = {
    NORTH: {x:0,y:-1},
    EAST: {x:1,y:0},
    SOUTH: {x:0,y:1},
    WEST: {x:-1,y:0}
};

const GAMESPEED = 50;
const GAMEHEIGHT = 32;
const GAMEWIDTH = 32;
const SNAKECOLOUR = "black";
const FOODCOLOUR = "red";

const STARTDIRECTION = DIRECTION.EAST;



class SnakeGameView{
    constructor(snakeGame, ctx){
        this._snakeGame = snakeGame;
        this._ctx = ctx;
    }

    drawTile(x,y,colour){
        let canvasWidth = this._ctx.canvas.clientWidth;
        let canvasHeight = this._ctx.canvas.clientHeight;

        let gameWidth = this._snakeGame.width
        let gameHeight = this._snakeGame.height;

        let tileWidth = (canvasWidth / gameWidth);
        var tileHeight = (canvasHeight / gameHeight);

        let tileLeftX = (tileWidth * (x));
        let cellTopY = (tileHeight * (y));

        this._ctx.fillStyle = colour;
        this._ctx.fillRect(tileLeftX + 2, cellTopY + 2, tileWidth - 2, tileHeight - 2);
        
        this._ctx.stroke();
    }

    drawFood(){
        let food = this._snakeGame.food;
        this.drawTile(food.x, food.y, FOODCOLOUR);
    }

    drawSnake(){
        let snake = this._snakeGame.snake;

        snake.segmentList.forEach(element => {
            this.drawTile(element.x,element.y,SNAKECOLOUR);
        }); 

    }

    render(){
        this._ctx.clearRect(0, 0, this._ctx.canvas.clientWidth, this._ctx.canvas.clientHeight);
        this.drawSnake();
        this.drawFood();
        window.requestAnimationFrame(() => this.render());
    }
}

class SnakeGame{
    constructor(width, height){
        this._score = 0;
        this._isGameOver = false;
        this._isRunning = false;
        this._width = width;
        this._height = height;
        this._direction = STARTDIRECTION;

        this.createStartSnake();
        this.spawnFood();
    }

    get width(){
        return this._width;
    }

    get height(){
        return this._height;
    }

    get snake(){
        return this._snake;
    }

    get food(){
        return this._food;
    }

    get score(){
        return this._score;
    }

    addPoint(){
        this._score += 1;
        this.updateScore();
    }

    updateScore(){
        let text = "score: " + this.score;
        document.getElementById("snakeScore").innerHTML = text;
    }

    gameOver(){
        this.stopGame();
        this._isGameOver = true;
        let text = "Score: " + this.score;
        document.getElementById("endScore").innerHTML = text;
        document.getElementById("snakeEndDisplay").classList.remove("hidden");
        
    }

    
    set direction(newDirection){
        this._direction = newDirection;
    }

    resetGame(){
        this._direction = STARTDIRECTION;
        this.createStartSnake();
        this.spawnFood();
        this._isGameOver = false;
        this._score = 0;
        this.updateScore();
        document.getElementById("snakeEndDisplay").classList.add("hidden")
    }

    move(){
        let tail = this.snake.move(this._direction);
        let snakeHead = this.snake.getHead()
        //Collision food
        if(this.food.x == snakeHead.x && this.food.y == snakeHead.y ){
            this.snake.grow(tail.x, tail.y);
            this.spawnFood();
            this.addPoint();
        }
        
        // Collision edge map
        if(snakeHead.x < 0 || 
            snakeHead.x >= this.width || 
            snakeHead.y < 0 || 
            snakeHead.y >= this.height){
            this.gameOver();
        }

        //Collision snake
        this.snake.segmentList.forEach((element,index) => {
            if((snakeHead.x == element.x && snakeHead.y == element.y)
             && index != (this.snake.segmentList.length - 1)){
                this.gameOver();
            }
        }); 


        if(this._isRunning == true){
            setTimeout(() => this.move(), GAMESPEED);
        }
    }

    stopGame(){
        this._isRunning = false;
    }

    startGame(){
        if(this._isGameOver){ 
            this.resetGame();
        }

        if(!this._isRunning){
            this._isRunning = true;
            this.move();
        }
    }

    spawnFood(){
        let possibleFoodLocations = [];

        // Find all empty locations
        for (let row = 0; row < this._height; row++) {
            for (let column = 0; column < this._width; column++) {
                let isLocationValid = this.snake.segmentList.every(segment => {
                    return row !== segment.y || column !== segment.x;
                });
        
                if (isLocationValid) {
                    possibleFoodLocations.push({ x: column, y: row });
                }
            }
        }

        // Pick a random empty location to place food
        let i = Math.floor(Math.random() * possibleFoodLocations.length);
        this._food = new Food(possibleFoodLocations[i].x, possibleFoodLocations[i].y);
    }

    createStartSnake(){
        let segmentList = new Array({x:Math.floor(this.width/2) - 1,y: Math.floor(this.height/2)}, 
                                    {x:Math.floor(this.width/2),y: Math.floor(this.height/2)});
        this._snake = new Snake(segmentList);
    }

}

class Food{
    constructor(x,y){
        this.x = x
        this.y = y
    }
}


class Snake{
    constructor(segmentList){
        this._segmentList = segmentList;
        this._length = segmentList.length;
    }

    get segmentList(){
        return this._segmentList;
    }

    move(direction){
        let head = this._segmentList[this._segmentList.length - 1]
        let tail = this._segmentList.shift();
        this._segmentList.push({x: (head.x + direction.x), 
            y:(head.y + direction.y)}); 
        return tail;  
    }

    grow(x, y){
        this._segmentList.unshift({x:x,y:y})    
    }

    getHead(){
        return this._segmentList[this._segmentList.length - 1]
    }

}


function gameControl(event, game){
    const keyCode = event.keyCode;

    switch(keyCode){
        case 38:
            event.preventDefault();
            game.direction = DIRECTION.NORTH;
            break;
        case 37:
            event.preventDefault();
            game.direction = DIRECTION.WEST;
            break;
        case 40:
            event.preventDefault();
            game.direction = DIRECTION.SOUTH;
            break;
        case 39:
            event.preventDefault();
            game.direction = DIRECTION.EAST;
            break; 
    }
}


function init(){
    const canvas = document.getElementById('mySnakeCanvas');
    const ctx = canvas.getContext('2d');
    let game = new SnakeGame(GAMEWIDTH, GAMEHEIGHT);
    let gameView = new SnakeGameView(game, ctx);
    gameView.render();
    //game.start()

    document.addEventListener('keydown', (e) => {gameControl(e, game)});
    document.getElementById("startSnake").addEventListener("click", (e) => game.startGame());
    document.getElementById("stopSnake").addEventListener("click", (e) => game.stopGame()); 

}

document.addEventListener("DOMContentLoaded", init);