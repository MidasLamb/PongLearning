var FPS = 60;
var animate = function(callback) { window.setTimeout(callback, 1000/FPS) };

var canvas = document.createElement('canvas');
var width = 800;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var Neuvol;

var Game = function(){
	this.players = [];
	this.ctx = context;
	this.width = canvas.width;
	this.height = canvas.height;
	this.gen = [];
	this.alives = 0;
	this.generation = 0;
        this.score = 0;
}

Game.prototype.start = function(){
	this.players = [];
        this.score = 0;
	this.gen = Neuvol.nextGeneration();
	for(var i in this.gen){
		var p = new Player(this.ctx);
		this.players.push(p)
	}
	this.generation++;
	this.alives = this.players.length;
}

Game.prototype.step = function(){
    this.render();
    this.update();
    animate(step);
}

Game.prototype.render = function(){
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, width, height);
    for (var i in this.players){
        if (this.players[i].isAlive()){
            this.players[i].render(this.ctx);
        }
    }
}

Game.prototype.update = function(){
    this.score++;
    
    for (var i in this.players){
        if (this.players[i].isAlive()){
            this.players[i].update(this.gen, i);
            if (!this.players[i].isAlive()){
                this.alives--;
                Neuvol.networkScore(this.gen[i], this.score);
                if(this.isItEnd()){
                        this.start();
                }
            }
        
            
        }
    }
    
    this.updateText();
}

Game.prototype.isItEnd = function(){
    return this.alives == 0;
}

Game.prototype.updateText = function(){
    document.getElementById("score").innerHTML = this.score;
    document.getElementById("generation").innerHTML = this.generation;
    document.getElementById("alive").innerHTML = this.alives;
}

var Player = function(ctx){
    this.color = getRandomColor();
    this.randY = Math.floor(Math.random()*(height - 110)) + 10;
    this.paddle = new Paddle(this, this.color, this.randY);
    this.ball = new Ball(this, this.color, this.randY);
    this.ctx = ctx;
    this.alive = true;
}

Player.prototype.isAlive = function(){
    return this.alive;
}

Player.prototype.update = function(gen, i){
    var inputs = [this.ball.getX(),this.ball.getY(), this.ball.getDirection(),this.paddle.getX(), this.paddle.getY()];
    var res = gen[i].compute(inputs);
    if (res > 0.5){
        this.paddle.moveUp();
    } else {
        this.paddle.moveDown();
    }
    
    this.paddle.update();
    this.ball.update();
}

Player.prototype.render = function (){
    this.paddle.render(this.ctx);
    this.ball.render(this.ctx);
}

Player.prototype.die = function(){
    this.alive = false;
}

Player.prototype.getPaddle = function(){
    return this.paddle;
}

var Paddle = function(player, color,y){
    this.x = 10;
    this.y = y;
    this.width = 10;
    this.height = 100;
    this.velocity = 1;
    this.speed = -1;
    this.player = player;
    this.color = color
}

Paddle.prototype.render = function(ctx){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
}

Paddle.prototype.setY = function(y){
    if (y <= 0 || y >= (height-this.height)){
    } else {
        this.y = y;
    }
}

Paddle.prototype.update = function(){
    this.setY(this.y + this.speed);
}

Paddle.prototype.moveUp = function(){
    this.speed = -this.velocity;
}

Paddle.prototype.moveDown = function(){
    this.speed = this.velocity;
}

Paddle.prototype.getX = function(){
    return this.x;
}

Paddle.prototype.getY = function(){
    return this.y;
}

Paddle.prototype.getWidth = function(){
    return this.width;
}

Paddle.prototype.getHeight = function(){
    return this.height;
}

var Ball = function(player, color,y) {
    this.x = width/2;
    this.y = y;
    this.radius = 5;
    this.x_speed = 1;
    this.y_speed = Math.random() < 0.5 ? -1 : 1;;
    this.player = player;
    this.color = color;
}

Ball.prototype.getX = function(){
    return this.x;
}

Ball.prototype.getY = function(){
    return this.y;
}

Ball.prototype.render = function(ctx){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
}

Ball.prototype.update = function() {
    
    
    
    var top_x = this.x - this.radius;
    var top_y = this.y - this.radius;
    var bottom_x = this.x + this.radius;
    var bottom_y = this.y + this.radius;
    
    if (bottom_x > width){
        this.x_speed = -1 * this.x_speed;
    }
    
    if (top_y < 0 || bottom_y >= height){
        this.y_speed = -1 * this.y_speed;
    }
    
    
    this.y += this.y_speed;
    
    if (this.x <= 0){ //Ball out of bounds
        this.player.die();
    }
    
    paddle = this.player.getPaddle();
    if((this.x - this.radius) == (paddle.x + paddle.width) && this.y < (paddle.y+paddle.height) && this.y > paddle.y) {
        this.x_speed = -1 * this.x_speed;
    }
    
    this.x += this.x_speed;
    
}

Ball.prototype.getDirection = function(){
    if (this.y_speed > 0){
        return 1;
    } else {
        return -1;
    }
}

var game = new Game();

var step = function() {
  game.step();
};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var setFPS = function(){
    FPS = document.getElementById("fps").value;
}


window.onload = function() {
    document.getElementById("canvas").appendChild(canvas);
    Neuvol = new Neuroevolution({
			population:50,
			network:[5, [5], 1],
		});
    game = new Game();
    game.start();
    animate(step);
};