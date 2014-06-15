/*
 * The base class for the whole game
 */
define(
        [ "lodash", "dom", "app/Tetromino", "app/shapeTemplates" ],
        function( _, dom, Tetromino, shapeTemplates ) {
            var ID = 0;
            function Board( args ) {

                this.ID = ++ID;

                this.shape = null;

                // set the default values
                args = _.extend( {
                    game       : null,
                    color      : "black",
                    height     : 20,
                    width      : 10,
                    // extra lines on the top that aren't displayed
                    padTop     : 2,
                    padBottom  : 1,
                    padLeft    : 1,
                    padRight   : 1,
                    cellSize   : '10px',
                    // ms - the amount of time before a lock is committed
                    lockDelay  : 100,
                    // ms - the amount of time between finding full rows and removing them.
                    shiftDelay :  50,
                    gravity    : 1,
                }, args );

                // most arguments simply get copied onto the object.
                // grid is the excpetion, store it separately and delete from
                // args.
                var inpatt = args.pattern;
                delete args.pattern;

                _.extend( this, args );

                // make the grid, either from by munging args.grid or making one
                // from
                // the height, width and topPad.
                inpatt ? this._parsePattern( inpatt ) : this._makeGrid();
                this.dom.style.cssText = "border-collapse: collapse; border-spacing: 0; ";
            }

            var thisP = Board.prototype;

            var defaultCell = {
                dom     : null,
                color   : "none",
                canHold : true,
                hasItem : false
            // has a locked cell, not in the current shape.
            };

            thisP._makeDefaultTD = function() {
                var cell = dom.create( "TD" );
                cell.style.borderCollapse = "collapse";
                cell.style.cellPadding = 0;
                cell.style.cellSpacing = 0;
                cell.style.border = 0;
                cell.style.width = this.cellSize;
                cell.style.height = this.cellSize;
                cell.style.backgroundColor = this.color;
                return cell;
            };

            /*
             * This takes a grid that is just an array of arrays of strings " " -
             * blank "-" - grid that isn't in the DOM table "+" - is a filled
             * cell, use white anyother string, assume that it's a color and set
             * that to the background
             */
            thisP._parsePattern = function( inpatt ) {

                // set the defaultCells color to be that of the board.
                defaultCell.color = this.color;

                var tbody   = dom.create( "TBODY" );
                this.dom    = dom.create( "TABLE", null, tbody );
                this.height = inpatt.length;
                this.width  = inpatt[0].length; // hopefully all lines are the
                // same length.
                this.grid = [];

                for ( var r = 0; r < inpatt.length; r++ ) {
                    this.grid[r] = [];

                    var trow = dom.create( "TR" );

                    for ( var c = 0; c < inpatt[r].length; c++ ) {

                        this.grid[r][c] = _.clone( defaultCell );
                        this.grid[r][c].color = this.color;

                        // a "-" means that this cell can't get a cell frozen in
                        // it
                        // these don't need a TD.
                        if ( inpatt[r].charAt( c ) === "-" ) {
                            this.grid[r][c].canHold = false;
                            this.topPad = r + 1;
                            continue;
                        }

                        var cell = this._makeDefaultTD();
                        this.grid[r][c].dom = cell;
                        trow.appendChild( cell );

                        // a " " means that this is an empty cell
                        if ( inpatt[r].charAt( c ) === " " ) {
                            continue;
                        }

                        // a "#" means that this is a filled cell
                        // use white/black as the color (not the table BG)
                        if ( inpatt[r].charAt( c ) === "#" ) {
                            this.grid[r][c].hasItem = true;
                            cell.style.backgroundColor = this.color === "white" ? "black"
                                    : "white";
                            continue;
                        }

                        // if it's a single character and that is a valid
                        // Tetromino name.
                        // place that shape at that coordinate.
                        this.shape = new Tetromino( {
                            name : inpatt[r].charAt( c ),
                            board : this,
                            x : c,
                            y : r
                        } );
                    }

                    // if there are cells in the row, add the row to the table.
                    if ( trow.childNodes.length ) {
                        tbody.appendChild( trow );
                    }

                }

                // if there was a shape added, draw it.
                if ( this.shape ) {
                    this.shape.draw();
                }
            };

            // make an empty grid.
            thisP._makeGrid = function() {

                // set the defaultCells color to be that of the board.
                defaultCell.color = this.color;

                var tbody = dom.create( "TBODY" );
                this.dom  = dom.create( "TABLE", null, tbody );
                this.grid = [];

                // the topPad is the part of the board that isn't visible.
                for ( var r = 0; r < this.topPad; r++ ) {
                    var row = [];
                    this.grid.push(row);
                    for ( var c = 0; c < this.padLeft; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { canHold : false, hasItem : true })));
                    }
                    for ( var c = 0; c < this.width; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { canHold : false })));
                    }
                    for ( var c = 0; c < this.padRight; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { canHold : false, hasItem : true })));
                    }
                }
                                
                // then the main part of the board
                for ( var r = 0; r < this.height; r++ ) {
                    var row = [];
                    this.grid.push(row);
                    for ( var c = 0; c < this.padLeft; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { hasItem : true })));
                    }
                    for ( var c = 0; c < this.width; c++ ) {
                        row.push(_.clone(defaultCell));
                    }
                    for ( var c = 0; c < this.padRight; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { hasItem : true })));
                    }
                }
                
                // generally this is th bottom of the board.
                // Faking locked things there to make locking simpler.
                for ( var r = 0; r < this.topPad; r++ ) {
                    var row = [];
                    this.grid.push(row);
                    for ( var c = 0; c < this.padLeft; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { canHold : false, hasItem : true })));
                    }
                    for ( var c = 0; c < this.width; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { canHold : false })));
                    }
                    for ( var c = 0; c < this.padRight; c++ ) {
                        row.push(_.extend(_.clone(defaultCell, { canHold : false, hasItem : true })));
                    }
                }

            };

            /*
             * This locks a shape to the board.
             * This means board cells are colored and marked as having an item.
             * Then we pick the next shape.
             * Then we check to see if the game is over.
             * in the reserved area.
             * Then the board is checked for full rows.
             *   Full rows are cleared and anything above is shifted down.
             */
            thisP.lockShape = function() {
                this._lockShape();
                this.pickNewShape();
                
                var fullRows = this._findFullRows();
                if ( fullRows.length === 0 ) {
                    return;
                }

                wait(this.shiftDelay);
                this._shiftDown(fullRows);
                this._updateScore(fullRows.length);

                if ( this._checkGameOver() ) {
                    this.endGame();
                }
                else {
                    this.shape.draw();
                }
            };

            // the actual work to lock the shape to the board.
            thisP._lockShape = function() {

                var grid = this.shape.getGrid();

                for ( var r = 0; r < grid.length; r++ ) {
                    var y = r + this.shape.y;
                    for ( var c = 0; c < grid[r].length; c++ ) {
                        var x = c + this.shape.x;

                        if ( grid[r][c] ) {
                            _copyCell(this.grid[y][x], { hasItem:true, color:this.shape.color });
                        }
                    }
                }
                
                
            };

            // Eventually pull off of the 'upcoming' list.
            // for now pick one at random.
            // place the new shape on the top row, centered.
            thisP.pickNewShape = function () {
                var shapes   = _.keys(shapeTemplates);
                var idx      = Math.floor( Math.random() * shapes.length );
                this.shape   = new Teromino( { name: shapes[idx], y:0, board:this });
                this.shape.x = Math.floor( (board.width - this.shape.width ) /2 );
            };
            
            // look at all rows, color any full rows gold
            // return a list of indexes for full rows.
            thisP._findFullRows = function () {
                var fullRows = [];
                for (var r=0; r<this.topPad+1; r++) {
                    var full = true;
                    for (var c=0; c<this.grid[r].length; c++) {
                        if ( !this.grid[r][c].hasItem ) {
                            full = false;
                            break;
                        }
                    }

                    if ( !full ) {
                        continue;
                    }
                    
                    fullRows.push(r);
                    for ( var c=0; c<this.grid[r].length; c++ ) {
                        if ( this.grid[y][x].dom ) {
                            this.grid[y][x].dom.style.backgroundColor = "gold";
                        }
                    }
                }
                return fullRows;
            };

            //
            thisP._shiftDown = function ( fullRows ) {

                var shiftBy = this._calcShiftBy( fullRows );

                for (var r=this.grid.length; r>=0; r-- ) {

                    // don't do anything if this row is shifted down by 0.
                    if ( !shiftBy[r] ) {
                        continue;
                    }

                    for ( var c=0; c<this.grid[r].length; c++) {
                        _copyCell(this.grid[r][c], this.grid[r][c+shiftBy[r]]);
                    }
                }

                // the top N rows won't be shifted into, put default values in those.
                // set the defaultCells color to be that of the board.
                defaultCell.color = this.color;
                for (var r=0; r<fullRows.length; r++) {
                    for ( var c=0; c<this.grid[r].length; c++) {
                        _copyCell(this.grid[r][c], defaultCell);
                    }
                }

            };
            
            // figure out by how much each row needs to shift down.
            thisP._calcShiftBy = function ( fullRows ) {
                var shiftBy = new Array(this.grid.length);
                for ( var r=0; r<this.grid.length; r++ ) {
                    shiftBy[r] = 0;
                }
                _.each(fullRows.reverse(), function ( row ) {
                    for ( var r=0; r<row; r++ ) {
                        shiftBy[r]++;
                    }
                    shiftBy[row] = 0;
                });
                return shiftBy;
            };
            
            /*
             * Copy cell contents from one to the next.
             * if the to cell has a dom, set the color.
             */
            function _copyCell (from, to) {

                to.hasItem = from.hasItem;
                to.color   = from.color;

                if ( to.dom ) {
                    to.dom.style.backgroundColor = to.color;
                }
            }

            /*
             * The game is over if:
             *   The new piece initial placement conflicts with the board.
             *   There are locked pieces in the padding or the top row of the board.
             */
            thisP._checkGameOver = function () {
                if ( this.shape.conflictsWithBoard() ) {
                    return true;
                }
                for (var r=0; r<this.topPad+1; r++) {
                    for (var c=0; c<this.grid[r].length; c++) {
                        if ( this.grid[r][c].hasItem ) {
                            return true;
                        }
                    }
                }
                return false;
            };
            
            /*
             * toString simply shows the grid.
             */
            thisP.toString = function( args ) {
                args = _.extend( {
                    indent : ''
                }, args );
                var str = '';
                for ( var i = 0; i < this.grid.length; i++ ) {
                    str += args.indent;
                    for ( var j = 0; j < this.grid[i].length; j++ ) {
                        str += this.grid[i][j] === null ? "-" : this.grid[i][j];
                    }
                    str += "\n";
                }
                return str;
            };

            return Board;
        } );
