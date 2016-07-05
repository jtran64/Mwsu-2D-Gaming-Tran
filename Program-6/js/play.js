
//====================================================================
var playState = {
    /** 
    * Establish eureca client and setup some globals
    */
    init: function(){
        //Add the server client for multiplayer
        this.client = new Eureca.Client();
        
        game.global.playerReady = false;

        game.global.dude = false;

    },
    /**
    * Calls the dude's update method
    */
    update: function() {
    	if (!game.global.dude) 
    	    return;
    	    
        
        game.global.dude.update();


    },
    /**
    * Initialize the multiPlayer methods
    * and bind some keys to variables
    */
    create: function(){
        this.initMultiPlayer(game,game.global);
        
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    },
    
    /**
    * Handles communication with the server
    */
    initMultiPlayer: function(game,globals){
        
        // Reference to our eureca so we can call functions back on the server
        var eurecaProxy;
        
		this.client.ready(function (serverProxy) {
             // Local reference to the server proxy to be 
             // used in other methods within this module.
             eurecaProxy = serverProxy;

        });
        /**
        * Fires on initial connection
        */
        this.client.onConnect(function (connection) {
            console.log('Incoming connection', connection);
            
        });
        /**
        * When the connection is established and ready
        * we will set a local variable to the "serverProxy" 
        * sent back by the server side.
        */
        /*this.client.ready(function (serverProxy) {
             // Local reference to the server proxy to be 
             // used in other methods within this module.
             eurecaProxy = serverProxy;

        });*/
        
        /**
        * This sets the players id that we get from the server
        * It creates the instance of the player, and communicates
        * it's state information to the server.
        */
        this.client.exports.setId = function(id){
            console.log("Setting Id:" + id);

            // Assign my new connection Id
            globals.myId = id;
            
            // Create new "dude"
            globals.dude = new player(id, game,eurecaProxy);
            
            // Put instance of "dude" into list
            globals.playerList[id] = globals.dude;//.state;
            
            //Send state to server
            eurecaProxy.initPlayer(id,globals.dude.state);
            
            // debugging
            console.log(globals.playerList);

            // Were ready to go
            globals.playerReady = true;
            
            // Send a handshake to say hello to other players.
            eurecaProxy.handshake(); 
        }
        /**
        * Called from server when another player "disconnects"
        */
        this.client.exports.kill = function(id){	
            if (globals.playerList[id]) {
                globals.playerList[id].kill();
                console.log('killing ', id, globals.playerList[id]);
            }
        }	
        /**
        * This is called from the server to spawn enemy's in the local game
        * instance.
        */
        this.client.exports.spawnEnemy = function(id, enemy_state){
            
            if (id == globals.myId){
				console.log("This is me");
                return; //this is me
            }
            
            //if the id doesn't exist in your local table
            // then spawn the enemy
			if(!globals.playerList[id]){
				var enemy = new player(id, game,eurecaProxy);
				enemy.state = enemy_state;
				enemy.sprite.x = enemy_state.x;
				enemy.sprite.y = enemy_state.y;
				enemy.sprite.tint = enemy_state.tint;
				globals.playerList[id] = enemy;
			}
			
			console.log('Spawning New Player');
				
			console.log(enemy_state);
		
			//globals.playerList[id] = enemy_state;
				
			console.log(globals.playerList);
			
        }

        /**
        * This is called from the server to update a particular players
        * state. 
        */       
        this.client.exports.updateState = function(id,player_state){
            //console.log(id,player_state);
            
            // Don't do anything if its me
            if(globals.myId == id){
                return;
            }
            
            // If player exists, update that players state. 
            if (globals.playerList[id])  {
                globals.playerList[id].state = player_state;
				globals.playerList[id].updateState(id, player_state);
            }
            
            //now how do we update everyone??
			
         }
         
        
    },
    /**
    * Not used
    */
    render: function(){
       
    },
    /**
    * Not used, but could be called to go back to the menu.
    */
    startMenu: function() {
        game.state.start('menu');
    },
};
/*
var player = function (index, game,proxyServer) {
    
    var x;                      // x coord
    var y;                      // y coord
    
    var player_id;
    
    var alive;                  // player alive or dead
    var state;                  // state info about player
    var proxy;                  // reference to proxy server
    
    var tint;                   // player tint

    var upKey;                  //references to movement keys
    var downKey;
    var leftKey;
    var rightKey;

    var health;                 // player health 
    var startTime;              // starting game time     
 
	
    function init(index, game,proxyServer){
    
        player_id = index;
    
        proxy = proxyServer;
    
        sprite = game.add.sprite(x, y, 'dude');
    
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        health = 30;
	    
        state = {};
        x = 0;
        y = 0;
        alive = true;
        tint = Math.random() * 0xffffff;
        sprite.tint = tint;
        sprite.id = index;
        state.alive = true;
        startTime = game.time.time;
        
    };
    
    // Part of your assignment 
    // you need to 
    function updateState (enemy_id,state){
        if(game.time.time - startTime > 2000){
            console.log(game.time.time);
            for(s in state){
                console.log(state[s]);
            }
            startTime = game.time.time;
        }
    };

    function update() {
        state.tint = tint;
        state.x = sprite.x;
        state.y = sprite.y;
        state.alive = alive;
        state.health = health;
    
        // Send your own state to server on your update and let
        // it do whatever with it. 
        proxy.handleState(player_id,state);

        if (upKey.isDown)
        {
            sprite.y-=3;
        }
        else if (downKey.isDown)
        {
            sprite.y+=3;
        }

        if (leftKey.isDown)
        {
            sprite.x-=3;
        }
        else if (rightKey.isDown)
        {
            sprite.x+=3;
        } 
    
        old_x = sprite.x;
        old_y = sprite.y;
    };
    
    function render() {
        game.debug.text( "This is debug text", 100, 380 );
    };

    function kill() {
        alive = false;
        sprite.kill();
    };
    
    init(index, game,proxyServer);
    
    return {
        render : render,
        updateState : updateState,
        update : update,
        kill : kill
    };
};*/

function player(index, game, proxyServer) {
	this.player_id = index;
    
    this.proxy = proxyServer;
    
    this.sprite = game.add.sprite(this.x, this.y, 'dude');
    
    this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    this.health = 30;
	    
    this.state = {}//= {alive:true,tint_val:this.tint_val,x:this.x,y:this.y};
    this.x = 0;
    this.y = 0;
    this.alive = true;
    this.tint = Math.random() * 0xffffff;
    this.sprite.tint = this.tint;
    this.sprite.id = index;
    this.state.alive = true;
    this.startTime = game.time.time;
};

player.prototype.update = function() {
		this.state.tint = this.tint;
		//this.sprite.tint = this.tint;
        this.state.x = this.sprite.x;
        this.state.y = this.sprite.y;
		//console.log(this.state.x, this.state.y);
        this.state.alive = this.alive;
        this.state.health = this.health;
    
        // Send your own state to server on your update and let
        // it do whatever with it. 
			this.proxy.handleState(this.player_id,this.state);

        if (this.upKey.isDown)
        {
            this.sprite.y-=3;
        }
        else if (this.downKey.isDown)
        {
            this.sprite.y+=3;
        }

        if (this.leftKey.isDown)
        {
            this.sprite.x-=3;
        }
        else if (this.rightKey.isDown)
        {
            this.sprite.x+=3;
        } 
    
        old_x = this.sprite.x;
        old_y = this.sprite.y;
};

player.prototype.kill = function() {
	this.alive = false;
    this.sprite.kill();
};

player.prototype.render = function() {
	game.debug.text( "This is debug text", 100, 380 );
};

player.prototype.updateState = function(enemy_id,state) {
	//if(game.time.time - this.startTime > 2000){
            console.log(game.time.time);
            for(s in state){
                console.log(state[s]);
				this.state[s] = state[s];
				this.sprite.x = this.state.x;
				this.sprite.y = this.state.y;
				this.sprite.tint = this.state.tint;
            }
			
            this.startTime = game.time.time;
        //}	
};

player.prototype.init = function(index, game,proxyServer, state) {
	    this.player_id = state.index;
    
        this.proxy = proxyServer;
    
        this.sprite = game.add.sprite(state.x, state.y, 'dude');

        this.health = state.health;
	    
        this.state = state;
		this.x = state.x;
        this.y = state.y;
        this.alive = true;
        this.tint = state.tint;
        this.sprite.tint = state.tint;
        this.sprite.id = index;
        this.state.alive = true;
        this.startTime = game.time.time;
        
};