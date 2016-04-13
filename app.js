var WIDTH = 960;
var HEIGHT = 640;
var game;

document.addEventListener("DOMContentLoaded", function(event){
	//create a new game and run it
	game = new Phaser.Game(WIDTH, HEIGHT, Phaser.OPENGL, 'game');

	//add the game states
	game.state.add('StartupState', new StartupState());
	game.state.add('LoadState', new LoadState());
	game.state.add('MainState', new MainState());

	//kickoff the starting state, logo if not on localhost, mainstate otherwise
    if(isDev()){
        game.state.start('MainState');
    }else{
        game.state.start('LoadState');
    }
});

window.isDev = function(){
    return (window.location.href.indexOf('localhost') > -1);
}
