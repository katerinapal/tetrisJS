requirejs( [ 'common' ], function() {
    requirejs( [ 'lodash', 'jquery', 'dom', 'events', 'app/TetrisGame' ],

        function( _, $, dom, ev, TetrisGame ) {
            var game = new TetrisGame();
            window.game = game;
            document.body.appendChild( game.dom );
        }
    );
});
