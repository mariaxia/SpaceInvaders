(function(){

	// Game module initiates game and animation
	var Game = function(canvasId){
		var c = document.getElementById(canvasId);
		var canvas = c.getContext('2d');
		this.canvas = canvas;
		this.height = 400;
		this.width = 600;
		this.audio = new Audio('http://www.freesound.org/data/previews/146/146725_2437358-lq.mp3');

		// initiate entities
		var self = this;
		this.hero = new Hero(this);
		this.missiles = [];
		this.invaders = new Array(36);
		for (var i = 0; i < this.invaders.length; i++){
			this.invaders[i] = new Invader(self, i);
		};

		// update entities
		var animate = function(){
			canvas.clearRect(0,0,600,400);
			// update entities
			self.hero.update(self);
			self.missiles.forEach(function(missile){
				missile.update(self);
			});
			self.invaders.forEach(function(invader){
				invader.update(self);
			});
			requestAnimationFrame(animate);
		}
		animate();

		// reference: http://unixpapa.com/js/key.html
		window.addEventListener('keydown', keydownHandler);
		window.addEventListener('keyup', keyupHandler);
	
		function keydownHandler(ev){
			var key = ev.code;
			// handle event
			if (key == 'ArrowLeft')
				self.hero.move = "left";
			if (key == 'ArrowRight')
				self.hero.move = "right";
			if (key == 'Space')
				self.hero.shoot(self);
		}
		
		// TODO Make transition between right and left seamless
		function keyupHandler(ev){
			var key = ev.code;
			if (key != 'Space')
				self.hero.move = null;
		}
	
	};
	
	Game.prototype = {
		// cycles through colors for the hero
		randomColor: function(color){
			var colors = ["CadetBlue", 
							"DarkSalmon", 
							"White", 
							"SeaGreen", 
							"DarkSlateGrey", 
							"GoldenRod"];
			var num = colors.indexOf(color);
			return colors[num + 1 % colors.length];
		}
	}

	// Hero module
	var Hero = function(game){
		this.direction = '';
		this.height = 20;
		this.width = 50;
		this.center = {x: game.width/2, y: game.height - this.height};
		this.move = null;
		this.color = "CadetBlue";
	};

	Hero.prototype = {
		update: function(game){
			if (this.move == "left" && this.center.x - this.width > 0)
				this.center.x -= 3;
			if (this.move == "right" && this.center.x + this.width < game.width)
				this.center.x += 3;

			game.canvas.fillStyle = this.color;
			game.canvas.fillRect(this.center.x - 15, this.center.y, this.width, this.height - 5);
		},
		
		// pushes a missile into a "missile" array bound to the game
		shoot: function(game){
			game.missiles.push(new Missile({x: this.center.x, y: this.center.y - this.height/2}, 9));
			game.audio.play();
		}
	};

	// Invader module
	var Invader = function(game, id){
		this.id = id;
		this.size = 20;
		this.center = {x: (id % 9) * this.size * 2, y: (id % 4) * this.size * 2 + 40};
		this.relative = 0;
		this.velocity = -1.5;
		
		game.canvas.fillStyle = "IndianRed";
		game.canvas.fillRect(this.center.x, this.center.y, this.size, this.size);
	};

	Invader.prototype = {
		// invaders move back and forth and shoot at random
		update: function(game){
			if (this.relative >= 260 || this.relative <= 0)
				this.velocity = -this.velocity;

			this.center.x += this.velocity;
			this.relative += this.velocity;
	
			game.canvas.fillStyle = "IndianRed";
			game.canvas.fillRect(this.center.x, this.center.y, 20, 20);
			
			this.shoot(game);
		},
		shoot: function(game){
			var shoot = Math.random();
			if (shoot < 0.001)
				game.missiles.push(new Missile(this.center, -2));
		}
	};

	// Missile module - handles missile behavior and collision detection
	var Missile = function(center, velocity){
		this.center = {x: center.x, y: center.y};
		this.velocity = velocity;
	}
	
	Missile.prototype = {
		// paints the missile as it travels, and detects for collision
		update: function(game){
			this.center.y -= this.velocity;
			game.canvas.fillStyle = "Black";
			game.canvas.fillRect(this.center.x, this.center.y, 5, 5);
			this.detectCollision(game);
		},
		detectCollision: function(game){
			game.missiles = game.missiles.filter(function(missile){
				// check if missiles are still on the screen
				if (missile.center.y < 20 || missile.center.y >= 400)
					return false;
					
				// detect collision with hero
				if (missile.center.y > game.height - 25
					&& missile.center.x > game.hero.center.x - game.hero.width/2
					&& missile.center.x < game.hero.center.x + game.hero.width/2){
					game.hero.color = game.randomColor(game.hero.color);
					return false;
				}
					
				// detect collision with invaders
				let hit = false;
				game.invaders = game.invaders.filter(function(invader){
					if (missile.center.x >= invader.center.x - invader.size/2 
						&& missile.center.x <= invader.center.x + invader.size/2 
						&& invader.center.y > missile.center.y 
						&& invader.center.y - missile.center.y < missile.velocity){
						hit = true;
						return false;
					}
					else
						return true;
				});
				if (hit)
					return false;
				return true;					
			});	
		}
	};

	// Start the game when everything's loaded!
	window.addEventListener('load', function() {
		new Game("screen");
	});
})();
