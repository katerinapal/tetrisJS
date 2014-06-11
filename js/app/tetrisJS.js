requirejs(['common'], function () {
	requirejs(
			['lodash', 'dom', 'events', 'app/TetrisGame'], 
			function ( _, dom, ev, Game ) {
				var game = new Game();
				document.body.appendChild(game.dom);
			}
	);
});	
