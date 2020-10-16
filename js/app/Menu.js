import _ from "..\\utils\\lodash.js";
import { addHandler as utilseventsjs_addHandler } from "..\\utils\\events.js";
import { create as utilsdomjs_create } from "..\\utils\\dom.js";
import { PAUSED } from ".\\TetrisGame.js";
import { PLAYING } from ".\\TetrisGame.js";
function Menu ( game ) {

    var nameBox = utilsdomjs_create("INPUT", { type : "text" });
    var nameSub = utilsdomjs_create("BUTTON", null, "Submit");
    var start   = utilsdomjs_create("BUTTON", null, "Start Game");
    var ghost   = utilsdomjs_create("INPUT", { type : "checkbox", checked : true });
    game.useGhost = ghost.checked;
    var preDiv  = utilsdomjs_create("div", {style : " display : block "},
            utilsdomjs_create("div", null,
                    "Name",
                    nameBox,
                    nameSub

            ),
            start,
            utilsdomjs_create("div", null,
                    utilsdomjs_create("string", "Add ghost shape"),
                    ghost
            )
    );
    
    var pause  = utilsdomjs_create("BUTTON", null, "Pause");
    
    var durDiv = utilsdomjs_create("div", {style : " display : none "}, pause);
    
    this.dom   = utilsdomjs_create("div", null, preDiv, durDiv);

    utilseventsjs_addHandler(start, "click", function () {
        preDiv.style.display = "none";
        durDiv.style.display = "block";
        game.start();
    });

    utilseventsjs_addHandler(pause, "click", function () {
        if ( game.state === PLAYING ) {
            game.togglePause();
            pause.firstChild.nodeValue = "UnPause";
        }
        else if ( game.state === PAUSED ) {
            game.togglePause();
            pause.firstChild.nodeValue = "Pause";
        }
    });
    
    utilseventsjs_addHandler(ghost, "click", function () {
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