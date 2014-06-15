var defaultCell = {
        dom     : null,
        color   : "none",
        canHold : true,
        hasItem : false
};

var padTop    = 2;
var padBottom = 1;
var padLeft   = 1;
var padRight  = 1;

var grid = [];
for ( var r = 0; r < topPad; r++ ) {
    grid[r] = [];
    var offset = 0;
    for ( var c = 0; c < padLeft; c++ ) {
        grid[r][c+offset] = _.extend(_.clone(defaultCell, { hasItem : true, canHold : false }));
    }
    offset = padLeft;
    for ( var c = 0; c < width; c++ ) {
        grid[r][c+offset] = _.extend(_.clone(defaultCell, { canHold : false }));
    }
    offset = padLeft + width;
    for ( var c = 0; c < padRight; c++ ) {
        grid[r][c+offset] = _.extend(_.clone(defaultCell, { hasItem : true, canHold : false }));
    }
}

var grid = [];
for ( var r = 0; r < topPad; r++ ) {
    grid[r] = [];
    for ( var c = 0; c < padLeft; c++ ) {
        grid[r].push(_.extend(_.clone(defaultCell, { hasItem : true, canHold : false })));
    }
    for ( var c = 0; c < width; c++ ) {
        grid[r].push(_.extend(_.clone(defaultCell, { canHold : false })));
    }
    for ( var c = 0; c < padRight; c++ ) {
        grid[r].push(_.extend(_.clone(defaultCell, { hasItem : true, canHold : false })));
    }
}

var grid = [];
for ( var r = 0; r < topPad; r++ ) {
    grid.push([].concat(
            _.range(padLeft).map( function () {
                _.extend(_.clone(defaultCell), { hasItem : true, canHold : false });
            }),
            _.range(width).map( function () {
                _.extend(_.clone(defaultCell), { canHold : false } );
            }),
            _.range(padRight).map( function () {
                _.extend(_.clone(defaultCell), { hasItem : true, canHold : false });
            })
    ));
}
