;(function(){

	// Game module initiates game and animation
	var Game = function(canvasId){
		var c = document.getElementById(canvasId);
		var screen = c.getContext('2d');

		// initiate entities
		var snake = new Snake();
		var food = new Food();
		food.placeRandom(screen, snake);

		var animate = function(){
			snake.move(screen, snake, food); // Snake module handles snake motion
			setTimeout(function() {			
				requestAnimationFrame(animate);
			}, 60);
		}
		animate();

		// reference: http://unixpapa.com/js/key.html
		window.addEventListener('keydown', eventHandler);
	
		function eventHandler(ev){
			var key = ev.code;
			// handle keypress AND make sure snake isn't able to go directly backwards
			if (key == 'ArrowLeft' && snake.segments[0].facing != "w")
				snake.direction = 'e';
			if (key == 'ArrowRight' && snake.segments[0].facing != "e")
				snake.direction = 'w';
			if (key == 'ArrowDown' && snake.segments[0].facing != "n")
				snake.direction = 's';
			if (key == 'ArrowUp' && snake.segments[0].facing != "s")
				snake.direction = 'n';
		}
	
	};

	// Snake module handles all snake behavior:
	// Moving, eating, collision detection, and resetting
	var Snake = function(){
		this.direction = '';
		this.head = {x: 300, y: 200, facing: ''};
		this.segments = [{facing: ''}];
	};

	Snake.prototype = {
		// handles snake behavior (gets called on every animation frame)
		move: function(screen, snake, food){

			screen.fillStyle = 'IndianRed';			
			
			// Our snake is endlessly discarding and giving birth to itself. With each animation frame, the snake:
			// 0. adds its current head to its body...
			this.segments.unshift({x: this.head.x, y: this.head.y, facing: this.direction});
			
			// 1. then pushes out a new head...
			if (this.direction == "e")
				this.head.x -= 10;
			if (this.direction == "w")
				this.head.x += 10;
			if (this.direction == "n")
				this.head.y -= 10;
			if (this.direction == "s")
				this.head.y += 10;
			screen.fillRect(this.head.x, this.head.y, 10, 10);
			
			// 2. and then erases from the tail
			if (this.direction !== ''){
				screen.clearRect(this.segments[this.segments.length-1].x, this.segments[this.segments.length -1].y, 10, 10);
			
			// 3. then checks if it's colliding with something. 
			// SIDENOTE: this next part requires a decision. Should it die as soon as its head meets its tail, even if the tail is right about to get out of the way? (Should we detectCollision before we pop the tail off the end of the array?) This depends on why the snake dies upon meeting itself, and the answer to that is either axiomatic or spiritual.
			this.detectCollision(screen, food);
			}
			
			// 4. discards tail from the end of the array.
			this.segments.pop();
		},
	
		eat: function(){
			// upon eating, snake grows by 3 segments. These segments can be empty because they quickly get swept up by the move function and acquire information.
			this.segments.push({}, {}, {});
		
			// bonus feature for the title of the game
			document.getElementById("repeatA").innerHTML += "a";
		},
	
		reset: function(screen){
			this.segments.forEach(function(segment){
				screen.clearRect(segment.x, segment.y, 10, 10);
			});
			this.direction = '';
			this.head = {x: 300, y: 200};
			this.segments = [{facing: ''}, {}];
			
			// bonus feature (continued) for title of game
			document.getElementById("repeatA").innerHTML = "a";
		},
		
		detectCollision: function(screen, food){
			// detect wall collision
			if (this.head.x < 0 || this.head.x > 600 || 
				this.head.y < 0 || this.head.y > 400)
				this.reset(screen);
			// detect food collision
			if (this.head.x == food.center.x && this.head.y == food.center.y){
				this.eat();
				food.reset(screen);
			}
			// detect if body is colliding with self, or the rare instance that food appears in an area taken up by the body
			var self = this;
			this.segments.forEach(function(segment){
				if (segment.x == food.center.x && segment.y == food.center.y)
					food.placeRandom(screen, self);
				if (this.head.x == segment.x && this.head.y == segment.y)
					this.reset(screen);
			}, this);
		}
	};

	// Food module handles food placement
	var Food = function(){
		this.center = {x: 300, y: 300};
	};

	Food.prototype = {
		// randomly places itself somewhere
		placeRandom: function(screen, snake){
			this.center.x = Math.floor(Math.random() * 60) * 10;
			this.center.y = Math.floor(Math.random() * 40) * 10;
			screen.fillStyle = 'OliveDrab';
			screen.fillRect(this.center.x, this.center.y, 10, 10);			
		},

		reset: function(screen){
			this.placeRandom(screen);
		}
	};

	// Start the game when everything's loaded!
	window.addEventListener('load', function() {
		new Game("screen");
	});
})();
