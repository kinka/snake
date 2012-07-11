KEYS = {
	38: snake.up,
	40: snake.down,
	37: snake.left,
	39: snake.right
};
$(document.body).live('keydown', function(e) {
	// console.log(e.keyCode);
	if(KEYS[e.keyCode]) {
		// console.log(e.keyCode);
		KEYS[e.keyCode]();

		return false;
	}
	
});