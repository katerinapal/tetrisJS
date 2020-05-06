import _ from "..\\utils\\lodash.js";
import { events_obj as ev } from "..\\utils\\events.js";
import { self as dom } from "..\\utils\\dom.js";
import { PAUSED } from ".\\TetrisGame.js";
import { PLAYING } from ".\\TetrisGame.js";
function Menu ( game ) {

    var nameBox = dom.create("INPUT", { type : "text" });
    var nameSub = dom.create("BUTTON", null, "Submit");
    var start   = dom.create("BUTTON", null, "Start Game");
    var ghost   = dom.create("INPUT", { type : "checkbox", checked : true });
    game.useGhost = ghost.checked;
    var preDiv  = dom.create("div", {style : " display : block "},
            dom.create("div", null,
                    "Name",
                    nameBox,
                    nameSub

            ),
            start,
            dom.create("div", null,
                    dom.create("string", "Add ghost shape"),
                    ghost
            )
    );
    
    var pause  = dom.create("BUTTON", null, "Pause");
    
    var durDiv = dom.create("div", {style : " display : none "}, pause);
    
    this.dom   = dom.create("div", null, preDiv, durDiv);

    ev.addHandler(start, "click", function () {
        preDiv.style.display = "none";
        durDiv.style.display = "block";
        game.start();
    });

    ev.addHandler(pause, "click", function () {
        if ( game.state === PLAYING ) {
            game.togglePause();
            pause.firstChild.nodeValue = "UnPause";
        }
        else if ( game.state === PAUSED ) {
            game.togglePause();
            pause.firstChild.nodeValue = "Pause";
        }
    });
    
    ev.addHandler(ghost, "click", function () {
            game.useGhost = ghost.checked;
        }
    );
        
    this.gameOver = function () { 
        preDiv.style.display = "block";
        durDiv.style.display = "none";
    };            
}

var exported_Menu = Menu;
export { exported_Menu as Menu };