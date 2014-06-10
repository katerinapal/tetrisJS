define(["lodash", "dom"], function(_, dom) {
    var self = {};
    
    self.construct = function ( width, height ) {
        self.table = dom.create("tbody");
        document.body.appendChild(self.table);
        for ( var x=0; x<width; x++ ) {
            var row = dom.create("TR");
            self.table.appendChild(row);
            for ( var y=0; y<height; y++ ) {
                var cell = dom.create('td', null, dom.create("string", "X"));
                row.appendChild(cell);
            }
        }
    };
    return self;    
}

