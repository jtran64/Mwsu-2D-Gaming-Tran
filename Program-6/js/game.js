var game = new Phaser.Game(400, 400, Phaser.AUTO, 'gameDiv');

game.global = {
    score: 0,
    freeze: 0,
    myId: 0,
    playerList:{},
    playerReady:false,
    dude:null
};

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

game.state.start('boot');