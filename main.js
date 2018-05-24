var game = new Phaser.Game(1104, 630, Phaser.CANVAS, "game");

///GLOBAL VARS


window.onload = function () {
    
    game.state.add('GOL', GOL);
	
    game.state.start("GOL");
    
}




