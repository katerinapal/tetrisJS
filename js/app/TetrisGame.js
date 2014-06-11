/**
 * The wrapper for the whole game
 */

define(
		["lodash", "dom", "events", "app/Board", "app/Tetromino"],
		function (_, dom, ev, Board, Tetromino) {
	function TetrisGame ( args ) {
		this.dom = dom.create("div", null, "hello");
		var board = new Board();

    	this.dom.appendChild(board.table);
    	this.keyEventHandler = null;

    	var names = ["T", "O", "S", "Z", "L", "J", "I"];
    	var idx   = Math.floor(Math.random()*names.length);
    	//idx = 6;

    	this.shape = new Tetromino({name:names[idx], board:board });
    	this.shape.x = 5;
    	this.shape.y = 5;
    	this.start();
    	this.shape.clear();
    	this.shape.draw();
	}

	function moveShapeHandler (shape, event) {
		if ( event.keyCode == "38" ) {
			shape.clear();
			shape.rotateLeft();
			shape.draw();
		}
		else if ( event.keyCode == "37" ) {
			shape.clear();
			shape.x--;
			var lerr = shape.offTheLeft();
			if ( lerr > 0 ) {
				shape.x += lerr;
			}
			shape.draw();
		}
		else if ( event.keyCode == "39" ) {
			shape.clear();
			shape.x++;
			var lerr = shape.offTheRight();
			if ( lerr > 0 ) {
				shape.x -= lerr;
			}
			shape.draw();
		}
	}

	var thisP = TetrisGame.prototype;
	thisP.start = function () {
		if ( this.keyEventHandler === null ) {
			var shape = this.shape;
			this.keyEventHandler = ev.addHandler(document, "keydown",
					function (event) { moveShapeHandler(shape, event); });
		}
	};
	thisP.stop = function () {
		if ( this.keyEventHandler !== null ) {
			ev.removeHandler(this.keyEventHandler);
		}
	};
	return TetrisGame;
});
