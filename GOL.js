var GOL ={
	
	//this version requires you to hit play for every generation. 

preload: function(){
		this.game.load.image('on', 'on.png');
		this.game.load.image('off', 'off.png');
		this.game.load.image('go', 'gobtn.png');
		this.game.load.image('reset', 'reset.png');
		this.game.load.image('random', 'random.png');
	},
	
init: function(){
	//input number of rows and cols desired
	this.rows = 48;
	this.cols = 24;	
},
 
create: function(){
	this.game.stage.backgroundColor = "#FFFFFF";
	
	//store values of tiles  in original grid array
	this.grid = []; 
	//nextGeneration of tiles array is calculated when we apply the rules. 
	this.nextGen = [];

	//calls addTile function on each item in grid array
	for(var i = 0; i < this.rows; i++){
		//push empty array row
		this.grid.push([]);
		this.nextGen.push([]);
		for(var j = 0; j < this.cols; j++){
			//initial value of grid.[i][j] = 0
			this.grid[i].push(0);
			this.nextGen[i].push(0);
			//add the tile 
			this.addTile(i, j);
		}
	}	
	
		//timer
	this.timer = this.game.time.create(false);

	//buttons

	//go
	this.goBtn = game.add.image(20, 555, 'go');
	this.goBtn.scale.setTo(0.25);
	this.goBtn.inputEnabled = true;
	this.goBtn.events.onInputDown.add(this.runGame, this);
		
	//clear
	this.resetBtn = game.add.image(100, 555, 'reset');
	this.resetBtn.scale.setTo(0.25);
	this.resetBtn.inputEnabled = true;
	this.resetBtn.events.onInputDown.add(this.resetGame, this);
	
		//random
	this.randomBtn = game.add.image(160, 550, 'random');
	this.randomBtn.scale.setTo(0.15);
	this.randomBtn.inputEnabled = true;
	this.randomBtn.events.onInputDown.add(this.random, this);
	
},
	
//creates the tiles initially
addTile: function(i, j){
	//position according to tile size: the column number x tilesize(scaled here from 45 to 22.5) plus half the width of the tile
		var tileXPos = (i * 22.5) + 11.5;
		var tileYPos = (j * 22.5) + 11.5;
	
	//add tile "on" for on tiles, or "off" for off tiles
	if(this.grid[i][j] == 0){
				this.tile = this.game.add.image(tileXPos, tileYPos, "off");
				this.tile.anchor.set(0.5);
				this.tile.scale.setTo(0.5);
				this.tile.inputEnabled = true;
				this.tile.events.onInputDown.add(this.pickMe, this);
	}
	else{
		this.tile = this.game.add.image(tileXPos, tileYPos, "on");
				this.tile.anchor.set(0.5);
				this.tile.scale.setTo(0.5);
				this.tile.inputEnabled = true;
				this.tile.events.onInputDown.add(this.pickMe, this);
	}

},
	
//click handler sets on/off on grid	
pickMe: function(cell){
//divide x/y position of object selected (cell) by width of tile (45 which we scaled in half so 22.5) to get position in array
		var pickedCol = Math.floor(cell.x / 22.5);
		var pickedRow = Math.floor(cell.y / 22.5);
	
		if(this.grid[pickedRow][pickedCol] == 0){
			cell.loadTexture("on");
			this.grid[pickedRow][pickedCol] = 1;
		}
		else{
			cell.loadTexture("off");
			this.grid[pickedRow][pickedCol] = 0;
		}	
},
	
//go button runs the calculation 
runGame: function(){
	//start a timer to repeat the computation of the next generation.

	//repeat after 1 second in loop
	this.timer.loop(1000, this.computeNextGen, this);
	this.timer.start();
	
	//if you don't want it on a timer, just call function
	//this.computeNextGen();
	
},	

computeNextGen: function(){
	// for each cell in the current Grid, apply the rules of game and save that to the nextGen information.	
	for (var i = 0; i < this.rows; i++){
		for(var j = 0; j < this.cols; j++){
			this.applyRules(i, j);
		}
	}
	//update the visuals
	this.updateGrid(i, j);
	//then copy and reset the grid	for the next round.
	this.copyAndResetGrid();
},
	
applyRules: function(row, col){
	//get count of live neighbours by calling countNeighbours function
	this.numNeighbours = this.countNeighbours(row, col);

	//cell is alive: count neighbours and set to next gen.
	if(this.grid[row][col] == 1){
	// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
		if(this.numNeighbours < 2) {
		//save new result to nextGen grid array
		this.nextGen[row][col] = 0;
		}
	// Any live cell with two or three live neighbours lives on to the next generation.			
		else if(this.numNeighbours == 2 || this.numNeighbours == 3){
			//save new result to nextGen grid array	
				this.nextGen[row][col] = 1;
			
			}
	// Any live cell with more than three live neighbours dies, as if by overcrowding.		
		else if (this.numNeighbours > 3){
		//save new result to nextGen grid array
			this.nextGen[row][col] = 0;
	
			}
		} 

	// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	else if(this.grid[row][col] == 0){
		if(this.numNeighbours == 3){
			this.nextGen[row][col] = 1;
			}
		else{
			this.nextGen[row][col] = 0;
			
		}
	}					
},
	
//returns count of live neighbours for each cell that we are applying rules to
countNeighbours: function(row, col){
		//count is returned for each cell.  initialized to 0
		var count = 0;
		//check that a neighbour exists first:
		
	//check if there is a row above:
	//if it is an edge case, then keep it to same setting
		if (row - 1 >= 0) {	
			if (this.grid[row -1][col] == 1) {
				count++;
			}
		}
		//check neighbour to upper left corner (row and column -1 so not first row or column)
		if (row -1 >= 0 && col -1 >= 0) {
			if (this.grid[row -1][col -1] == 1) {
				count++;
			}
		}
		//check upper right corner
		if (row -1 >= 0 && col +1 < this.cols) {
			if (this.grid[row -1][col +1] == 1) {
				count++;
			}
		}
		//check if there is a column to the left
		if (col-1 >= 0) {
			if (this.grid[row][col -1] == 1) {
				count++;
			}
		}
		//check if there is a column to the right
		if (col +1 < this.cols) {
			if (this.grid[row][col +1] == 1) {
				count++;
			}
		}
		//check below the row
		if (row+1 < this.rows) {
			if (this.grid[row +1][col] == 1) {
				count++;
			}
		}
		//check lower left
		if (row +1 < this.rows && col -1 >= 0) {
			if (this.grid[row +1][col -1] == 1) {
				count++;
			}
		}
		//check lower right
		if (row+1 < this.rows && col+1 < this.cols) {
			if (this.grid[row+1][col+1] == 1) {
				count++;
			}
		}

		//return total count of live neighbours
			return count;
	
		},
		
// take next Gen and copies it back into current gen Grid for next round
copyAndResetGrid: function(){
		for(var i = 0; i < this.rows; i++){
			for(var j = 0; j < this.cols; j++){
				this.grid[i][j] = this.nextGen[i][j];
			}
		}
	},

//update the visual of the grid
updateGrid: function(){
//for each item in nextGen, change the grid to reflect on/off state of nextGen.
		for(var i = 0; i < this.rows; i++){
			for(var j = 0; j < this.cols; j++){
				this.addNewTile(i, j);
			}
		}
},	

//this is the same as addTile but uses the nextGen array
addNewTile: function(i, j){

	var tileXPos = (i * 22.5) + 11.5;
	var tileYPos = (j * 22.5) + 11.5;
	
	if(this.nextGen[i][j] == 0){
				this.tile = this.game.add.image(tileXPos, tileYPos, "off");
				this.tile.anchor.set(0.5);
				this.tile.scale.setTo(0.5);
				this.tile.inputEnabled = true;
				this.tile.events.onInputDown.add(this.pickMe, this);
	}
	else{
				this.tile = this.game.add.image(tileXPos, tileYPos, "on");
				this.tile.anchor.set(0.5);
				this.tile.scale.setTo(0.5);
				this.tile.inputEnabled = true;
				this.tile.events.onInputDown.add(this.pickMe, this);
	}
	
	
},

	
//random button: fill array with random grid
random: function(){

	this.ranGrid = [];
	
 //create array of random #s
	for(var i = 0; i < this.rows; i++){
		this.ranGrid.push([]);
		for(var j = 0; j < this.cols; j++){
			//get random 1 or 0
			var num = game.rnd.integerInRange(0,1);
			this.ranGrid[i].push(num);		
		}
	}
	
	//copy random grid to nextGen
	for(var i = 0; i < this.rows; i++){
		for(var j = 0; j < this.cols; j++){
			this.nextGen[i][j] = this.ranGrid[i][j];
		}
	}

	//update the grid
	this.updateGrid(i, j);
	this.copyAndResetGrid();
},	
	


//reset game stage 
resetGame: function(){
	//resets game back to start
		game.state.start(game.state.current);
},
	
	
update: function(){}


};

