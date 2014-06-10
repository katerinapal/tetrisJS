requirejs.config({
    enforceDefine: true,
    baseUrl: 'js/utils',
    paths: {
        app: '../app',
    }
});

function print () { console.log(Array.prototype.join.call(arguments, "")); }
function wait ( secs ) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + secs);
}

define(
        ['lodash', 'dom', 'app/Tetromino'], 
        function (_, dom, Tetromino) {
        	var I = new Tetromino( { name:"S" });
        	print(I.toString({indent:"r1> "}));
        	I.rotateRight();
        	print(I.toString({indent:"r2> "}));
        	I.rotateRight();
        	print(I.toString({indent:"r3> "}));
        	I.rotateRight();
        	print(I.toString({indent:"r4> "}));
        	I.rotateLeft();
        	print(I.toString({indent:"l1> "}));
        	I.rotateLeft();
        	print(I.toString({indent:"l2> "}));
        	I.rotateLeft();
        	print(I.toString({indent:"l3> "}));
        	I.rotateLeft();
        	print(I.toString({indent:"l4> "}));
        }
);	
