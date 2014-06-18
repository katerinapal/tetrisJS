/**
 * 
 */
// Tetromino names : I O T Z S J L
define(function () {
	var defBoard = { height : 10, width : 10 , topPad : 0 };
	return [
	        [
	         "Moving I - assume all work...",
	         {
	        	 title   : "Left",
	        	 "board" : defBoard,
	        	 shape   : { name : "I", version:0, x:2, y:1 },
	        	 actions : [
	        	            { action : "moveLeft", version : 0, x : 1, y : 1 },
	        	            { action : "moveLeft", version : 0, x : 0, y : 1 },
	        	            { action : "moveLeft", version : 0, x : 0, y : 1 },
	        	            ]
	         },
	         {
	        	 title   : "Right",
	        	 "board" : defBoard,
	        	 shape   : { name : "I", version:0, x:4, y:1 },
	        	 actions : [
	        	            { action : "moveRight", version : 0, x : 5, y : 1 },
	        	            { action : "moveRight", version : 0, x : 6, y : 1 },
	        	            { action : "moveRight", version : 0, x : 6, y : 1 },
	        	            ]
	         },
	         ],
	         [
	          "Rotate on left edge",
	          {
	        	  title   : "Looking at I (1)",
	        	  "board" : defBoard,
	        	  shape   : { name : "I", version:1, x:-1, y:1 },
	        	  actions : [ { action : "rotateLeft", version : 2, x : 0, y : 1 } ]
	          },
	          {
	        	  title   : "Looking at I (2)",
	        	  "board" : defBoard,
	        	  shape   : { name : "I", version:3, x:-2, y:1 },
	        	  actions : [ { action : "rotateLeft", version : 0, x : 0, y : 1 } ]
	          },
	          {
	        	  title   : "Looking at T",
	        	  "board" : defBoard,
	        	  shape   : { name : "T", version:3, x:-1, y:1 },
	        	  actions : [ { action : "rotateLeft", version : 0, x : 0, y : 1 } ]
	          },
	          ],
	          ];
});
