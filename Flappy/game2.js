const cvs = document.getElementById( "bird" );
const ctx = cvs.getContext("2d");

//load sprite image
const bgImg = new Image();
bgImg.src = "assets/sprites/background-day.png";
const fgImg = new Image();
fgImg.src = "assets/sprites/base.png";

const bImg1 = new Image();
bImg1.src = "assets/sprites/bluebird-upflap.png";
const bImg2 = new Image();
bImg2.src = "assets/sprites/bluebird-midflap.png";
const bImg3 = new Image();
bImg3.src = "assets/sprites/bluebird-downflap.png";

const getReadyImg = new Image();
getReadyImg.src = "assets/sprites/message.png";
const getOverImg = new Image();
getOverImg.src = "assets/sprites/gameover.png";
const boardImg = new Image();
boardImg.src = "assets/board.png";


const pipeImgTop = new Image();
pipeImgTop.src = "assets/sprites/pipe-green2.jpg";
const pipeImgbott = new Image();
pipeImgbott.src = "assets/sprites/pipe-green.png";



let frame = 0;
const DEGREE = Math.PI/180;


//load sounds
const swoosh = new Audio();
swoosh.src = "assets/audio/swoosh.wav"
const point = new Audio();
point.src = "assets/audio/point.wav"
const hit = new Audio();
hit.src = "assets/audio/hit.wav"
const die = new Audio();
die.src = "assets/audio/die.wav"

// game state
const state = {
	current : 0,
	getReady : 0,
	game : 1,
	over : 2
}

//start button 
const startBtn = {
	x : 120,
	y : 263,
	w : 83,
	h : 29
}

//control the game
cvs.addEventListener("click" , function(evt) {
	switch(state.current) {
		case state.getReady:
			state.current = state.game;
			break;

		case state.game:
			bird.flap();
			swoosh.play();
			break;

		case state.over:
			let rect = cvs.getBoundingClientRect();
			
			let clickX = evt.clientX - rect.left;
			let clickY = evt.clientY - rect.top;

			//check if we click on the start button
			if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w 
				&& clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
					
					bird.speedReset();
					pipes.reset();
					score.reset();
					state.current = state.getReady;
				}	
			break;
	
	}
	
});

 
const bg = {

	draw : function() {
		ctx.drawImage(bgImg, 0,0, 320, 480);
		
	}	
}
const fg = {
	w : 224,
	h : 112,
	x : 0,
	y : cvs.height - 112, //캔버스에서 h값 빼기
	
	dx : 2,
	//0,0 335,110
	draw : function() {
		ctx.drawImage(fgImg, 0, 0, this.w, this.h, this.x,          this.y, this.w, this.h);
		ctx.drawImage(fgImg, 0, 0, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
	},
	
	update : function() { //move fg
		if(state.current == state.game) {
			this.x = (this.x - this.dx) % (this.w / 2);
		}	
	}
}

const bird = {
	animation : [
	bImg1, 
	bImg2, 
	bImg3, 
	bImg2
	],	
	x : 50, 
	Y : 150, 
	w : 34, 
	h : 26,

	radius: 12,

	frame : 0,
	
	gravity: 0.25,
	jump : 4.6, 
	speed : 0,
	rotation : 0,

	draw : function() {
		let bird = this.animation[this.frame];
		
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);

		ctx.drawImage(bird, 0, 0, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h);

		ctx.restore();
	},

	flap : function() {	
		this.speed = - this.jump;
	},

	update : function() {
		// if the game stste is get ready state, the bird must flap slowly
		this.period = state.current == state.getReady ? 10 : 5 //10일때 5보다 느리게 파닥 
		//we increment the frame by 1, each period
		this.frame += frames % this.period == 0 ? 1:0;
		// frame goes from 0 to 4, then again to 0
		this.frame = this.frame % this.animation.length;

		
		if(state.current == state.getReady) {
			//restart position of the bird after game over
			this.y = 150; 
			this.rotation = 0 * DEGREE;

		}else{ 
			this.speed += this.gravity;
			this.y += this.speed;
	
			if(0 >= this.y - this.h/2){
				this.y = 50;
			} else {
				if(this.y + this.h/2 >= cvs.height - fg.h){
					this.y = cvs.height - fg.h - this.h/2;

					if(state.current == state.game) { 
						state.current = state.over;
						die.play();
					}
				}
			}
		}
		
	}, //end of update f()
	speedReset : function() {
		this.speed = 0;
	}

} 

//get ready message
const getReady = {
	w : 184,
	h : 267,
	x : cvs.width/2 - 184/2,
	y : 80,
	
	draw : function() {
		if(state.current == state.getReady){
			ctx.drawImage(getReadyImg, 0, this.y, 320, this.h);
		}
	}	
}


// game over message
const gameOver = {
	w : 190,
	h : 40,
	x : cvs.width/2 - 190/2,
	y : 80,

	w2 : 230,
	h2 : 155,
	x2 : cvs.width/2 - 230/2,
	y2 : 132,

	draw : function() {
		if(state.current == state.over) {
			ctx.drawImage(getOverImg, this.x, this.y, this.w, this.h);
			ctx.drawImage(boardImg, this.x2, this.y2, this.w2, this.h2);
		}
	}
}

//pipes
const pipes = {
	position : [],
	
	bottom : {},
	top : {},
		
 	w : 53,
	h : 315,
	gap : 85,
	maxYPos : -150,
	
	dx : 2,
	
	draw : function(){
		for (let i =0; i < this.position.length; i++ ) {
			let p = this.position[i];

			let topYPos = p.y;
			let bottomYPos = p.y + this.h + this.gap;
			
			// top pipe
			ctx.drawImage(pipeImgTop, 0, 0, this.w, this.h, p.x, topYPos, this.w, this.h);

			// bottom pipe
			ctx.drawImage(pipeImgbott, 0, 0, this.w, this.h, p.x, bottomYPos, this.w, this.h);
		}
	},

	update : function() {
		if(state.current !== state.game) return;

		if(frames % 100 == 0) {
			this.position.push({
				x : cvs.width,
				y : this.maxYPos * (Math.random() + 1)
			});
		}
		for(let i = 0; i < this.position.length; i++) {
			let p = this.position[i];

			
			let bottomPipeYPos = p.y + this.h + this.gap;

			//===== collision detection =====
			// top pipe
			if(bird.x +bird.radius > p.x && bird.x-bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
				state.current = state.over;
				hit.play();
			}
			// bottom pipe
			if(bird.x +bird.radius > p.x && bird.x-bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
				state.current = state.over;
				hit.play();
			}
			
			// move the pipes to the left
			p.x -= this.dx;

			
			//if the pipes go beyond canvas, delet them from the array
			if(p.x + this.w <= 0) {
				this.position.shift();
				score.value += 1;
				point.play();
	

				score.best = Math.max(score.value, score.best);
				localStorage.setItem("best", score.best);
			}
		}


		

	},
	reset : function(){
		this.position = [];
	}
}

const score = {
	best : parseInt(localStorage.getItem("best")) || 0,
	value : 0,
	
	draw : function(){
		ctx.fillStyle = "#fff";
		ctx.strokeStyle = "#000";

		if(state.current == state.game){
			ctx.lineWidth = 2;
			ctx.font = "35px Teko";
			ctx.fillText(this.value, cvs.width/2, 50);
			ctx.strokeText(this.value, cvs.width/2, 50);

		}else if(state.current == state.over){
			ctx.font = "25px Teko";
			ctx.fillText(this.value, 225, 186);
			ctx.strokeText(this.value, 225, 186);
			//best score
			ctx.fillText(this.best, 225, 228);
			ctx.strokeText(this.best, 225, 228);
		}
	},
	reset : function(){
		this.value = 0;
	}
}

function draw() {
	ctx.fillStyle = "#70c5ce";
	ctx.fillRect( 0, 0, cvs.width, cvs.height );

	bg.draw();
	pipes.draw();
	fg.draw();
	bird.draw();
	getReady.draw();
	gameOver.draw();
	score.draw();

}



function update() {
	bird.update();
	fg.update();
	pipes.update();
}

function loop() {

	update();
	draw();
	frames++;

	requestAnimationFrame(loop);
}
frames = 0;
loop();

