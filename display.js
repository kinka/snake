window.requestAnimationFrame = (function() {
	return 	window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback, element) {
				window.setTimeout(callback, 1000/60);
			};
})();
window.cancelRequestAnimationFrame = (function() {
	return 	window.cancelRequestAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.clearTimeout
})();
display = (function() {
	var bodies = snake.bodies,
		food = snake.food,
		eaten = snake.eaten,
		eating = [],
		game = snake.game,
		canvas,
		ctx,
		fCanvas,
		fCtx,
		rows = settings.rows,
		cols = settings.cols,
		size = settings.size,
		typesize = settings.typesize,
		animations = [],
		images = [],
		previousCycle,
		weight,
		prevLength,
		bumping = false,
		timer = true;

	function setup() {
		var ground = $('#ground');

			weight = $('#weight');
		var canvas = document.createElement("canvas"),
			fCanvas = document.createElement("canvas");

		canvas.width = canvas.height = cols*size;
		fCanvas.width = fCanvas.height = cols*size;
		ctx = canvas.getContext("2d");
		fCtx = fCanvas.getContext("2d");

		fCtx.scale(size, size);

		ground.append(createBackground());
		ground.append(fCanvas);
		ground.append(canvas);

		prevLength = bodies.length;

		previousCycle = Date.now();
		requestAnimationFrame(cycle);
		
		for(var i=0; i<typesize; i++) {
			var image = new Image();
			image.src = "images/" + i + ".png";
			images.push(image);
		}
/*		addAnimation(10000, {
			before: function(pos) {

			},
			render: function(pos, delta) {
				drawFood(pos, delta);
			},
			done: function(pos) {

			}
		});*/
	}

	function cycle(time) {
		drawSnake(time);
		drawFood(time);
		renderAnimations(time, previousCycle);
		previousCycle = time;
		if(timer)
			requestAnimationFrame(cycle);
	}

	function stop() {
		timer = false;
		console.log("Stopped!");
	}

	function addAnimation(runTime, fncs) {
		var anim = {
			runTime: runTime,
			startTime: Date.now(),
			pos: 0,
			fncs: fncs
		};
		animations.push(anim);
	}

	function renderAnimations(time, lastTime) {
		var anims = animations.slice(0), // copy list
			n = anims.length,
			animTime,
			anim,
			i;
		// call before() function
		for(i=0; i<n; i++) {
			anim = anims[i];	// reference
			if(anim.fncs.before) {
				anim.fncs.before(anim.pos);
				anim.fncs.before = null;
			}
			anim.lastPos = anim.pos;
			animTime = (lastTime - anim.startTime);
			anim.pos = animTime / anim.runTime;
			anim.pos = Math.max(0, Math.min(1, anim.pos));
		}
		animations = []; // rest animation list
		for(i=0; i<n; i++) {
			anim = anims[i];
			anim.fncs.render(anim.pos, anim.pos-anim.lastPos);
			if(anim.pos == 1) {
			if(anim.fncs.done)
				anim.fncs.done();
			} else {
				animations.push(anim);
			}
		}
	}

	function drawSnake(time) {
		if(game.state == settings.OVER) {
			if(!bumping) {
				bump();
				bumping = true;
			}

			return;
		}

		var body;
		ctx.clearRect(0, 0, cols*size, rows*size);

		ctx.fillStyle = "rgba(124, 252, 0, 0.8)";
		ctx.beginPath();

		for(var i=0, len=bodies.length; i<len; i++) {
			body = bodies[i];
			ctx.arc(body.x+(size>>1), body.y+(size>>1), size>>1, 0, Math.PI*2);
		}
		if(prevLength < len) {
			prevLength = len;
			tailAdded();
		}

		ctx.shadowColor = "rgba(0, 102, 204, 0.8)";
		ctx.shadowBlur = 10*(Math.sin(Math.PI*time/1000) + 2);
		ctx.fill();
		
		var head = bodies[0];
		ctx.beginPath();
		ctx.arc(head.x+(size>>1), head.y+(size>>1), size>>1, 0, Math.PI*2);
		ctx.fill();
	}

	function drawFood(time) {
		fCtx.fillStyle = "rgba(0, 102, 204, 0.8)";
		fCtx.beginPath();
		for(var i=0, len=food.length; i<len; i++) {
			var f = food[i];
			fCtx.save();
			fCtx.globalCompositeOperation = "lighter";
			fCtx.globalAlpha = 0.8;
			fCtx.clearRect(f.x, f.y, 1, 1 );
			fCtx.translate(f.x+0.5, f.y+0.5);
			var s = Math.abs(Math.sin(Math.sin(Math.PI*time/2000)));
			s = s*0.2+0.8;
			fCtx.scale(s, s);
			// fCtx.fillRect(-0.5, -0.5, 1, 1);
			fCtx.drawImage(images[f.t], -0.5, -0.5, 1, 1);
			fCtx.restore();
		}

		if(eaten.length>0) {
			weight.text(Math.round(game.weight*100)/100);
			// weight.addClass('zoomfade');
			if(game.state==settings.SUCCEED) {
				$('#success').addClass('zoomfade');
			}

			eating.push(eaten.shift());
			addAnimation(2000, {
				before: function(pos) {
					for(var i=0, len=eating.length; i<len; i++) {
						var f = eating[i];
						fCtx.save();
						fCtx.clearRect(f.x, f.y, 1, 1);
						// fCtx.translate(f.x+0.5, f.y+0.5);
						// fCtx.clearRect(-0.5, -0.5, 1, 1);
						fCtx.restore();
					}
				},
				render: function(pos, delta) {
					for(var i=0, len=eating.length; i<len; i++) {
						var f = eating[i];	
						fCtx.save();
						fCtx.globalCompositeOperation = "lighter";
						fCtx.globalAlpha = (1-pos);
						// fCtx.fillStyle = "rgba(0, 102, 204, " + (1-pos) + ")";
						fCtx.translate(f.x+0.5, f.y+0.5);
						fCtx.scale(pos*2, pos*2);
						fCtx.clearRect(-0.5, -0.5, 1, 1);
						// fCtx.fillRect(-0.5, -0.5, 1, 1);
						fCtx.drawImage(images[f.t], -0.5, -0.5, 1, 1);
						fCtx.restore();
					}
				},
				done: function(pos) {
					// weight.removeClass('zoomfade');
					var f = eating.shift();
					fCtx.save();
					fCtx.translate(f.x+0.5, f.y+0.5);
					fCtx.clearRect(-1, -1, 2, 2);
					fCtx.restore();
				}
			});
		}
	}

	function bump() {
		addAnimation(4000, {
				before: function(pos) {
					ctx.scale(size, size);
					ctx.fillStyle = "rgba(255, 215, 0, 1)";
					ctx.clearRect(0, 0, cols, rows);
					var body;
					for(var i=0, len=bodies.length; i<len; i++) {
						body = bodies[i];
						body.x /= size;
						body.y /= size;
						body.x += 0.5;
						body.y += 0.5;
						body.vel = {
							x: (Math.random()-0.5)*40,
							y: -Math.random()*40
						};

					}
				},
				render: function(pos, delta) {
					var body;
					ctx.save();
					ctx.clearRect(0, 0, cols, rows);
					ctx.beginPath();
					for(var i=0, len=bodies.length; i<len; i++) {
						body = bodies[i];
						body.vel.y += 50*delta;
						body.x += body.vel.x*delta;
						body.y += body.vel.y*delta;
						ctx.arc(body.x+0.5, body.y+0.5, 0.5, 0, Math.PI*2);
					}
					ctx.shadowBlur = 20*Math.sin(Math.PI*pos*2);
					ctx.fill();
					ctx.restore();
				},
				done: function(pos) {
					console.log('over!');
					stop();
				}
			});
	}

	function tailAdded() {
		addAnimation(2000, {
				before: function(pos) {
				},
				render: function(pos, delta) {
					var tail = bodies[bodies.length-1];
					ctx.save();
					ctx.shadowBlur = 20*Math.sin(Math.PI*pos*2);
					ctx.shadowColor = "rgba(255, 215, 0, 1)";
					ctx.arc(tail.x+(size>>1), tail.y+(size>>1), size>>1, 0, Math.PI*2);
					ctx.fill();
					ctx.fill();
					ctx.restore();
				},
				done: function(pos) {

				}
			});
	}

	function createBackground() {
		var bgCanvas = document.createElement("canvas"),
			gctx = bgCanvas.getContext("2d");
		bgCanvas.className = 'ground-bg';
		bgCanvas.width = bgCanvas.height = cols * size;
		gctx.fillStyle = "rgba(255, 239, 213, 1)";
		for(var x=0; x<cols; x++) {
			for(var y=0; y<rows; y++) {
				if((x+y)%2)
					gctx.fillRect(x*size, y*size, size, size);
			}
		}

		return bgCanvas;
	}

	return {
		setup: setup,
		bodies: bodies
	};
})();