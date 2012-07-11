settings = {
	size: 40,
	baseLen: 6,
	rows: 16,
	cols: 16,
	step: 4,
	OVER: 1,
	START: 2,
	SUCCEED: 3,
	baseWeight: 80, 
	typesize: 5 // food type
};

/*
	body: {
		x: x, y: y, dir: direction, t: twist
	}
		^
	<- 		->
		
*/
snake = (function() {
	var bodies = [],
		food = [],
		eaten = [],
		step = settings.step,
		baseLen = settings.baseLen,
		size = settings.size,
		rows = settings.rows,
		cols = settings.cols,
		typesize = settings.typesize,
		game = {state: settings.START, weight: settings.baseWeight, level: 1},
		timer = -1,
		dir = {
			UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4 
		};

	function born() {
		buildBody();
		genFood();

		timer = setInterval(move, 20);
	}

	function buildBody() {
		var mid = rows/2;

		for(var i=baseLen-1; i>=0; i--) {
			bodies.push({
				x: i*size, y: mid*size, dir: dir.RIGHT, t: []
			});
		}
	}

	function addBody() {
		var oldTail = bodies[bodies.length-1],
			tail = {};
		for(var o in oldTail)
			tail[o] = oldTail[o];
		
		tail.t = oldTail.t.slice(0); // reference! copy it!
		switch(oldTail.dir) {
			case dir.UP:
				tail.y += size;
				break;
			case dir.DOWN:
				tail.y -= size;
				break;
			case dir.LEFT:
				tail.x += size;
				break;
			case dir.RIGHT:
				tail.x -= size;
				break;
		}
		bodies.push(tail);
	}

	function stepBy(body) {
		if(body.t.length>0) {
			var tt = body.t[0];
			var x = body.x, y = body.y;
			// console.log(tt.x, x, tt.y, y);
			var dx = Math.abs(tt.x-x),
				dy = Math.abs(tt.y-y);

			if(	dx===0 && dy===0 ) { // time to twist
				body.dir = tt.d;
				body.t.shift();
			}
		}
		switch(body.dir) {
			case dir.UP:
				body.y -= step;
				if(body.y+size <= 0)
					body.y = rows*size;
				break;
			case dir.DOWN:
				body.y += step;
				if(body.y >= rows*size)
					body.y = -size;
				break;
			case dir.LEFT:
				body.x -= step;
				if(body.x+size <= 0)
					body.x = cols*size;
				break;
			case dir.RIGHT:
				body.x += step;
				if(body.x >= cols*size)
					body.x = -size;
				break;
		}
	}

	function twist(d) { // d: direction
		var head = bodies[0];
		var x = head.x, y = head.y;
	
		if(d == head.dir) {
			move();
			return; // or speed up!
		}

		// wait for the next grid: bug!!!
/*		switch(head.dir) {
			case dir.UP:
				y = Math.floor(y/size)*size;
				if(y==-40)
					y=rows*size;
				break;
			case dir.DOWN:
				y = Math.ceil(y/size)*size;
				if(y==rows*size)
					y=-size;
				break;
			case dir.LEFT:
				x = Math.floor(x/size)*size;
				if(x==-40)
					x=cols*size;
				break;
			case dir.RIGHT:
				x = Math.ceil(x/size)*size;
				if(x==cols*size)
					x=-size;
				break;
		}*/
		// console.log(head.x, x, head.y, y);
		var i=0;
		// var str = "";
		for(var len=bodies.length; i<len; i++) {
			bodies[i].t.push({x:x, y:y, d:d});	
			// str += i + ":" + bodies[i].t.length + "(" + x + "," + y + ")";
		}
		// if(x==-size || x==cols*size)
		// 	console.log(str);
		move();
	}

	function move() {
		for(var i=0, len=bodies.length; i<len; i++) {
			stepBy(bodies[i]);
		}
		canEat();
		willBump();
	}

	function left() {
		twist(dir.LEFT);
	}

	function right() {
		twist(dir.RIGHT);
	}

	function up() {
		twist(dir.UP);
	}

	function down() {
		twist(dir.DOWN);
	}

	function genFood() {
		while(food.length < typesize) {
			var f = {};
			f.x = random(cols);
			f.y = random(rows);
			f.t = random(typesize);
			food.push(f);
		}
	}

	function random(n) {
		return Math.round(Math.random()*10000)%n;
	}

	function canEat() {
		var dx, dy, head=bodies[0];
		for(var i=0; i<food.length; i++) {
			var f = food[i];
			dx = Math.abs(f.x-head.x/size);
			dy = Math.abs(f.y-head.y/size);
			if(dx+dy < 1) {
				eaten.push(f);
				food.splice(i, 1);
				genFood();
				
				// get weight
				game.weight += Math.pow(1.5, game.level)/9;
				if(game.weight - settings.baseWeight > game.level) {
					game.level++;
					if(game.weight >= 90) {
						game.state = settings.SUCCEED;
						console.log("Weighted 90!");
					} else {
						addBody();
					}
				}
			}
		}
	}

	function willBump() {
		var head = bodies[0];
		for(var i=1, len=bodies.length; i<len; i++) {
			var dx = Math.abs(head.x-bodies[i].x),
				dy = Math.abs(head.y-bodies[i].y);
			// console.log(dx, dy);
			if(dx+dy<=size-step) {
				gameOver();
			}
		}
	}

	function gameOver() {
		game.state = settings.OVER;
		clearInterval(timer);
	}

	return {
		bodies: bodies,
		food: food,
		eaten: eaten,
		game: game,
		born: born,
		addBody: addBody,
		move: move,
		twist: twist,
		left: left,
		right: right,
		up: up,
		down: down
	};
})();

/*
todo:
maybe, sound effects~
*/
