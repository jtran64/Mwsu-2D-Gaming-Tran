var bootState = {
    preload: function () {
        // Load the image
        game.load.image('progressBar', 'assets/progressBar.png');
    },
    create: function() {
        // Set some game settings
        game.stage.backgroundColor = '#3498db';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.renderer.renderSession.roundPixels = true;
        if (!game.device.desktop) {
            // Set the type of scaling to 'show all'
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            // Set the min and max width/height of the game
            game.scale.setMinMax(game.width/2, game.height/2,
            game.width*2, game.height*2);

            // Center the game on the screen
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;

            // Add a blue color to the page to hide potential white borders
            document.body.style.backgroundColor = '#3498db';
        }
        // Start the load state
        game.state.start('load');
    }
};