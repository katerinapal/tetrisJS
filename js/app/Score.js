/**
 * 
 */

define(
        [ "lodash", "dom" ],
        function( _, dom ) {
            function Score( game ) {
                this.value = dom.create("string", 0);
                this.dom   = dom.create("div", { style : "overflow : auto;"}, 
                        dom.create("div", { style : "float : left;"}, "Score : "),
                        dom.create("div", { style : "float : right; text-align : right ;    " },
                                this.value)
                );
            }

            var thisP = Score.prototype;

            thisP.set = function ( val ) {
                this.value.nodeValue = val;
            };

            return Score;
        }
        
        
);