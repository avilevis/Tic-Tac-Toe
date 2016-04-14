/********************************************
 * module
 * a tik tak tok module game
 *
 * params:
 *  p1 : player1 name
 *  p2 : player2 name
 *
 *  return:
 *      player:
 *          p1: player1 name,
 *          p2: player2 name,
 *          active_p: the name of the player that his turn
 *      
 *      timer: Timer (second) present the time of the current turn player
 *
 *      inerval: A pointer to game interval (execute every second)
 *
 *      game_arr: A two dimension array, presents the game board
 * 
 *      functions:
 *          ch: Cecks if the given position have three same player in a row
 *              parameters:
 *                  x: Column position in game array
 *                  y: Row position in game array
 *                  ax: The column direction for checks 
 *                  ay: The row direction for checks
 *
 *              return: true | false
 *
 *           new_move: Adding the new player move to game array, check if this move
 *                    make the player win, or if this ove is the last one.
 *
 *                    parameters:
 *                      p: player name
 *                      x: Column position in game array
 *                      y: Row position in game array 
 *
 *                     return: null | sting of the end game
 *
 *            build_board: Build the game board in html page
 *
 *            init: Init a new game, set clicks for the game board and runs the timer
 *
 *            set_timer: Sets the 1 sec timer for the game
 *
 *            fin: Finishs the game by removs the interactions and inform about the winner
 *
 *
 *
 */
var xo = function(parent, p1,p2){
    this.parent = parent;
    this.player = {p1: p1, p2: p2, active_p: null};
    this.timer = 0;
    this.inerval = null;
    this.game_arr = [["null","null","null"],["null","null","null"],["null","null","null"]];
}
xo.prototype.ch = function(x,y,ax,ay) {
    if (ax==3||ay==3) {
        return true;
    }
    if(this.game_arr[x+ax] && this.game_arr[x] && this.game_arr[x+ax][y+ay]==this.game_arr[x][y]) {
        return this.ch(x,y,ax==0? 0: ax+1,ay==0? 0 : (ay<0 ? ay-1 : ay+1));
    }
    return false;
}

xo.prototype.new_move = function(p,x,y) {
    this.game_arr[x][y] = p;
    if(this.ch(x,0,0,1)|| this.ch(0,y,1,0) || this.ch(x-y,0,1,1) || this.ch(0,y+x,1,-1))
        return true;
    else if (String(this.game_arr).indexOf("null") == -1) {
        this.player.active_p = "no winner"
        return true;
    }
    else return false;
}
        
xo.prototype.build_board = function(){
    var self = this,
        template = $('#board').html();
    $('#game_container').html(Mustache.render(template,{}));
    $('#next_game').click(function(){
        self.parent.init_game();
    })
}
        
xo.prototype.init = function(){
    var self = this;
    this.player.active_p = this.player.p1;
    $('#player').html(this.player.active_p);
    $('#ox_board td').click(function(e){
        $(this).addClass((self.player.active_p == self.player.p1)? "p1" : "p2");
        $(this).unbind("click");
        var winner = self.new_move(self.player.active_p, $(this).parent().index(), $(this).index());
        if(self.new_move(self.player.active_p, $(this).parent().index(), $(this).index()))
            return self.fin();
        self.timer = 0;
        $('#timer').html(self.timer);
        self.player.active_p = (self.player.active_p == self.player.p1)? self.player.p2 : self.player.p1;
        $('#player').html(self.player.active_p);
    });
    this.set_timer();
}

xo.prototype.set_timer = function(){
    var self = this;
    this.inerval = setInterval(function(){
        if (self.timer==5)
            return self.fin(self.player.active_p+" loss");
        self.timer += 1;
        $('#timer').html(self.timer);
    },1000)
}
        
xo.prototype.fin = function(){
    clearInterval(this.inerval);
    $('#ox_board td').unbind("click");
    if (this.player.active_p=="no winner") {
        $('#msg').html("No winner for this game");
    }
    else {
        $('#msg').html(this.player.active_p+" is the winner for this game");
    }
    this.parent.game_fin(this.player.active_p);
}

/********************************************
 * module
 * a tik tak tok tournament module
 *
 * 
 *  tour: Array of game winners (in case of no winner the cell will fill with "no winner")
 *  tour_games: Number of games in tournament
 *  xo1: game object
 *  players:
 *      p1: player1 name
 *      p2: player2 name
 *
 *  functions:
 *      start_game: Init the tournament
 *
 *      init_game: Creates new game object and starts the game
 *
 *       game_fin: Updates the winner in tour array and checks if the tournament is finished
 *          parameters:
 *              p: The winner of the last game
 *
 *          return:
 *
 *        done_tour: Checks the tournament winner
 */
var tournament = function(){
    this.tour= [];
    this.tour_games = 3;
    this.xo1 = null;
    this.players = {p1: null,p2:null};
}
    
tournament.prototype.start_game = function() {
    this.players.p1=$("#p1_name").val();
    this.players.p2=$("#p2_name").val();
        
    if(this.players.p1 == "" || this.players.p2 == "") return alert ("please fill names");
    $('input').attr('disabled','disabled');
    this.init_game()
}
    
tournament.prototype.init_game = function(){
    $("#next_game").addClass("disabled");
    this.xo1 = new xo(this,this.players.p1,this.players.p2);
    this.xo1.build_board();
    this.xo1.init();
}

tournament.prototype.game_fin = function(p){
    this.tour.push(p);
    if (this.tour.length == this.tour_games) {
        return this.done_tour();
    }
    $("#next_game").removeClass("disabled");
}

tournament.prototype.done_tour = function() {
    var self = this,
        p1_count = this.tour.reduce(function(p, c, i, arr){
                return (self.players.p1==c? p+1 : p);
            },0),
        p2_count = this.tour.reduce(function(p, c, i, arr){
                return (self.players.p2==c? p+1 : p);
            },0),
        text;
        
    if (p1_count>p2_count) {
        text=this.xo1.player.p1 +" win this match";
    }
    else if (p1_count<p2_count) {
        text=this.xo1.player.p2 +" win this match";
    }
    else text = "no winner for this tournament";
    $("#tour_msg").html(text);
    $("#tour_stats").html(this.xo1.player.p1+ " wins "+ p1_count+" times,"+this.xo1.player.p2+ " wins "+ p2_count+" times.");
    $("#tour_container").removeClass("disabled")
}


function start_game(){
    var tournament_ = new tournament;
    tournament_.start_game();
}