/**
 * 
 */

define(
        [ "lodash", "dom", "events" ],
        function( _, dom, ev ) {
            function Menu( game ) {

                this.dom   = dom.create("div");
                var start = dom.create("BUTTON", {style : " display : block "}, "Start Game");
                this.dom.appendChild(start);
                var pause = dom.create("BUTTON", {style : " display : none "}, "Pause");
                this.dom.appendChild(pause);

                ev.addHandler(start, "click", function () {
                    start.style.display = "none";
                    pause.style.display = "block";
                    game.start();
                });

                ev.addHandler(pause, "click", function () {
                    game.pause();
                });
            }
            return Menu;
        }
);