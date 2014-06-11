requirejs(['common'], function () {
	requirejs(
			['lodash', 'dom', 'events', 'app/Board', 'app/Tetromino'], 
			function ( _, dom, ev, Board, Tetromino ) {

		    	var shapes = Tetromino.prototype.standardShapeNames;

		    	/*
		    	 * Applies the action of a test.
		    	 * Then checks the resulting coordinates and orientation against the expected 
		    	 */
		    	function doTest ( id, board, test ) {
		    		board.shape[test.action].call(board.shape);
		    		if ( board.shape.version === test.version &&
		    				board.shape.x    === test.x &&
		    				board.shape.y    === test.y
		    				) {
		    			msg("Test "+id+" : passed");
		    			return true;
		    		}
		    		msg("Test "+id+" : failed "+
		    				": version - "+board.shape.version+" expected "+test.version+
		    				": coord - "+board.shape.x+","+board.shape.y+" expected "+this.x+","+this.y
		    				);
		    		return false;
		    	}
		    	
		    	/*
		    	var test1Div = dom.create("div", { style : 'overflow : auto;'});
	    		document.body.appendChild(test1Div);

		    	for (var i=0; i<shapes.length; i++) {
		    		var board = new Board(
		    				{
								height : 6,
								width  : 6,
								topPad : 0,
								squareSize : '7px',
							}
		    		);

		    		var div = dom.create("div", { style : 'float : left; margin-left : 20px;' }, board.table);
		    		test1Div.appendChild(div);
		    		
			    	var shape  = new Tetromino({name:shapes[i], board:board });

			    	shape.x = 1;
			    	shape.y = 1;
			    	shape.draw();
			    	setInterval(function( obj ) {
			    		obj.clear();
			    		obj.rotateLeft();
			    		obj.draw();
			    		}, 500, shape);
			    	
		    	}
		    	 */
		    	
		    	// create an array of strings 
		    	function makePattern ( rows, cols, char ) {
		    		return Array.apply(null, Array(rows)).map(function () { return char.repeat(cols) });
		    	}
		    	function replaceChar ( instr, col, newstr ) {
		    		return instr.substr(0, col) + newstr + this.substr(col+1);
		    	}
		    	
		    	var test2 = {
			    			title : "Test2",
			    			board : makePattern(10, 10, " "),
			    			tests : [ //        action         expected result
			    			          { action : "rotateLeft", version : 1, x : 1, y : 1 },
			    			          { action : "rotateLeft", version : 2, x : 1, y : 1 },
			    			          { action : "rotateLeft", version : 3, x : 1, y : 1 },
			    			          { action : "rotateLeft", version : 4, x : 1, y : 1 },
			    			          { action : "rotateLeft", version : 1, x : 1, y : 1 },
			    			          ]
		    	};
		    	test2.board[1] = " I        ";

		    	document.body.appendChild(dom.create("br"));

		    	var test2Div = dom.create("div", {style : 'overflow : auto;'},
		    			dom.create("p", null, test2.title));
		    	document.body.appendChild(test2Div);

		    	board2 = new Board( { pattern : test2.board });
		    	test2Div.appendChild(board2.table);

		    	var allpass = true;
		    	for ( var i=0; i<test2.tests.length; i++ ) {
			    	if ( !doTest(test2.title+"."+i, board2, test2.tests[i]) ) {
			    		allpass = false;
			    	}
		    	}
		    	if ( !allpass ) {
		    		alert("Some part of "+test2.title+" failed");
		    	}
			}
	);
});	
