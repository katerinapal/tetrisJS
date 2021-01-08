import _ from "..\\utils\\lodash.js";
import { addHandler as events_addHandler } from "..\\utils\\events.js";
import { create as dom_create } from "..\\utils\\dom.js";
import { PAUSED } from ".\\TetrisGame.js";
import { PLAYING } from ".\\TetrisGame.js";
function Menu ( game ) {

    var nameBox = dom_create("INPUT", { type : "text" });
    var nameSub = dom_create("BUTTON", null, "Submit");
    var start   = dom_create("BUTTON", null, "Start Game");
    var ghost   = dom_create("INPUT", { type : "checkbox", checked : true });
    game.useGhost = ghost.checked;
    var preDiv  = dom_create("div", {style : " display : block "},
            dom_create("div", null,
                    "Name",
                    nameBox,
                    nameSub

            ),
            start,
            dom_create("div", null,
                    dom_create("string", "Add ghost shape"),
                    ghost
            )
    );
    
    var pause  = dom_create("BUTTON", null, "Pause");
    
    var durDiv = dom_create("div", {style : " display : none "}, pause);
    
    this.dom   = dom_create("div", null, preDiv, durDiv);

    events_addHandler(start, "click", function () {
        preDiv.style.display = "none";
        durDiv.style.display = "block";
        game.start();
    });

    events_addHandler(pause, "click", function () {
        if ( game.state === PLAYING ) {
            game.togglePause();
            pause.firstChild.nodeValue = "UnPause";
        }
        else if ( game.state === PAUSED ) {
            game.togglePause();
            pause.firstChild.nodeValue = "Pause";
        }
    });
    
    events_addHandler(ghost, "click", function () {
            game.useGhost = ghost.checked;
        }
    );
        
    this.gameOver = function () { 
        preDiv.style.display = "block";
        durDiv.style.display = "none";
    };            
}

var mod_Menu = Menu;
export { mod_Menu as Menu };