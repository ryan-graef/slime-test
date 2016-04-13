MainState = function(){ }

MainState.prototype = {
    preload: function(){
        console.log('preload main state');
    },

    create: function(){
        //remove this line if not using lighting effects
        game.plugins.add(Phaser.Plugin.PhaserIlluminated);

    },

    update: function(){

    },

    render: function(){

    }
}