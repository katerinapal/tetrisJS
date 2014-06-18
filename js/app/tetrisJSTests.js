requirejs(
        [ 'common' ],
        function() {
            requirejs(
                    [ 'lodash', 'jquery', 'dom', 'events', 'app/Board',
                            'app/Tetromino', 'app/shapeTemplates',
                            'app/testTemplates' ],
                    function( _, $, dom, ev, Board, Tetromino, shapeTemplates,
                            allTests ) {

                        spinAll( document.body );

                        var testsDiv = dom.create( "div", {
                            style : 'overflow : auto;'
                        } );
                        document.body.appendChild( testsDiv );

                        allTests
                                .map( function( group ) {
                                    var grDiv = dom
                                            .create(
                                                    "div",
                                                    {
                                                        style : "overflow : auto;  border : 1px solid black; text-align : left;"
                                                    }, dom.create( "p", null,
                                                            group.shift() ) );
                                    testsDiv.appendChild( grDiv );
                                    group.map( function( test ) {
                                        prepATest( grDiv, test );
                                    } );
                                } );

                        // add some padding to the bottom so that the msgDiv can
                        // be seem for the last row
                        testsDiv.appendChild( dom.create( "div", {
                            style : " height : 500px; placement : absolute "
                        } ) );

                        function prepATest( pDom, test ) {

                            test.status = dom.create( "string", "Waiting" );
                            test.passFail = dom.create( "div", null,
                                    test.status );
                            test.msgDiv = dom
                                    .create(
                                            "div",
                                            {
                                                style : "display : none; position : absolute; opacity : 1; background-color : white ; border : 1px solid blue ; padding : 5px "
                                            } );
                            // pop up the failure messages when hovering over
                            // the text.
                            ev.addHandler( test.passFail, "mouseenter",
                                    function() {
                                        test.msgDiv.style.display = "block";
                                    } );
                            ev.addHandler( test.passFail, "mouseleave",
                                    function() {
                                        test.msgDiv.style.display = "none";
                                    } );

                            var board = new Board( test.board );
                            var runit = dom.create( "BUTTON", null, "Run" );
                            var div = dom.create( "div", {
                                style : 'float : left; margin-left : 10px;'
                            }, dom.create( "p", null, test.title ), runit,
                                    board.table, test.passFail, test.msgDiv );
                            pDom.appendChild( div );

                            // make the shape, make sure to place it on the
                            // board.
                            board.shape = new Tetromino( test.shape );
                            board.shape.board = board;
                            var start = board.shape.getPlacement();

                            // run the test once without pressing the button
                            // but don't want to delay rendering other tests.
                            setTimeout( function() {
                                runATest( div, test, board );
                            }, 0 );

                            ev.addHandler( runit, "click", function() {
                                // clear the shape and move it back to the start
                                // point.
                                board.shape.clear();
                                _.extend( board.shape, start );
                                board.shape.draw();
                                setTimeout( runATest, 200, div, test, board );
                            } );

                            return board;
                        }

                        function runATest( div, test, board ) {

                            test.status.nodeValue = "Running";

                            while ( test.msgDiv.firstChild ) {
                                test.msgDiv
                                        .removeChild( test.msgDiv.firstChild );
                            }

                            var allpass = true;
                            var testIdx = 0;
                            var looper = setInterval(
                                    function() {

                                        if ( !doAction( test.title + "."
                                                + testIdx, board,
                                                test.actions[testIdx],
                                                test.msgDiv ) ) {
                                            allpass = false;
                                        }

                                        testIdx++;

                                        // If all the actions have been done,
                                        // exit the loop.
                                        if ( testIdx == test.actions.length ) {
                                            clearInterval( looper );
                                            if ( allpass ) {
                                                test.status.nodeValue = "Passed";
                                                test.status.parentNode.style.cssText = "color : black; font-weight:bold;";
                                            }
                                            else {
                                                test.status.nodeValue = "Failed";
                                                test.status.parentNode.style.cssText = "color : red; font-weight:bold;";
                                            }
                                            return;
                                        }

                                    }, test.interval ? test.interval : 100 );
                        }

                        /*
                         * Applies the action of a test. Then checks the
                         * resulting coordinates and orientation against the
                         * expected
                         */
                        function doAction( id, board, test, msgdiv ) {
                            board.shape[test.action].call( board.shape );
                            if ( board.shape.version === test.version
                                    && board.shape.x === test.x
                                    && board.shape.y === test.y ) {
                                msgdiv.appendChild( dom.create( "p", null,
                                        "Test " + id + " : passed " ) );
                                return true;
                            }
                            msgdiv.appendChild( dom.create( "p", null, "Test "
                                    + id + " : failed " + ": version - "
                                    + board.shape.version + " expected "
                                    + test.version + ": coord - "
                                    + board.shape.x + "," + board.shape.y
                                    + " expected " + test.x + "," + test.y ) );
                            return false;
                        }

                        function spinAll( pDiv ) {
                            var wrapDiv = dom
                                    .create(
                                            "div",
                                            {
                                                style : 'overflow : auto; border : 1px solid black;  text-align : left;'
                                            }, dom.create( "p", null,
                                                    "Spin All" ) );
                            pDiv.appendChild( wrapDiv );

                            var shapes = _.keys( shapeTemplates );

                            var intervals = [];
                            for ( var i = 0; i < shapes.length; i++ ) {
                                var board = new Board( {
                                    height : 6,
                                    width : 6,
                                    topPad : 0,
                                    squareSize : '7px',
                                } );

                                var div = dom.create( "div", {
                                    style : 'float : left; margin-left : 10px;'
                                }, board.table );
                                wrapDiv.appendChild( div );

                                var shape = new Tetromino( {
                                    name : shapes[i],
                                    board : board
                                } );

                                shape.x = 1;
                                shape.y = 1;
                                shape.draw();
                                intervals.push( setInterval( function( obj ) {
                                    obj.rotateLeft();
                                    obj.draw();
                                }, 500, shape ) );
                            }
                            return intervals;
                        }
                    } );
        } );
