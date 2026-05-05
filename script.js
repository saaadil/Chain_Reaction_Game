const config={
    MAX_GAME_TIME: 300,
    TURN_TIME: 15,
    ANIM_DELAY: 250,
    ROWS: 12,
    COLS: 6
};

const sound = {
    click: new Audio('click.mp3'),   
    pop: new Audio('pop.mp3'),       
    error: new Audio('error.mp3')    
};

const rows=config.ROWS;
const cols=config.COLS;
let redScore=0;
let blueScore=0;
let turnCount=0;
let turnTime=config.TURN_TIME;
let turnTimerInterval=null;
let masterClockInterval=null;
let isOver=false;
let isPaused=false;
let isAnimating=false;
let totalTime=config.MAX_GAME_TIME;
let explosionQueue=[];
let currentPlayer='Red';

const boardContainer=document.getElementById('board-container');
const pauseButton=document.getElementById('pause-button');

boardContainer.style.gridTemplateColumns = `repeat(${config.COLS}, 1fr)`;
boardContainer.style.gridTemplateRows = `repeat(${config.ROWS}, 1fr)`;

let gameState = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => ({ orbs: 0, owner: null })));

for (let i=0; i<rows*cols; i++)
{
    const newCell=document.createElement('div');
    newCell.classList.add('cell');

    let r=Math.floor(i/cols);
    let c=i%cols;

    newCell.dataset.row=r;
    newCell.dataset.col=c;

    newCell.id = "cell-" + r + "-" + c;

    newCell.addEventListener('click', function(event) {
        let clickedRow = parseInt(event.currentTarget.dataset.row);
        let clickedCol = parseInt(event.currentTarget.dataset.col);
        let targetCell = gameState[clickedRow][clickedCol];

        if (isOver || isPaused || isAnimating) {
            return;
        }
        if (targetCell.owner!==null && targetCell.owner!==currentPlayer) {
            playSound(sound.error);
            return;
        }
        playSound(sound.click);

        let pointsEarned=0;
        let wasEmpty = (targetCell.owner === null);

        if (turnCount < 2) {
            let grantedOrbs = getCriticalMass(clickedRow, clickedCol) - 1;
            targetCell.orbs = grantedOrbs;
            pointsEarned = grantedOrbs; 
        } 
        else {
            targetCell.orbs += 1;
            pointsEarned = 1; 
        }
        if (currentPlayer==='Red') {
            redScore+=pointsEarned;
            document.getElementById('red-score').innerText=redScore;
        } 
        else {
            blueScore+=pointsEarned;
            document.getElementById('blue-score').innerText=blueScore;
        }

        targetCell.owner=currentPlayer;

        if (targetCell.orbs >= getCriticalMass(clickedRow, clickedCol)) {
            isAnimating = true;
            explosionQueue.push({r:clickedRow, c:clickedCol});
            processExplosionQueue();
        }
        else{
            currentPlayer = (currentPlayer === 'Red') ? 'Blue' : 'Red';
            updateTurnUI();
            updateBoardUI();
            turnCount++;
            checkWinCondition(); 
            startTurnTimer();
        }   
    });

    boardContainer.appendChild(newCell);
}

function getCriticalMass(r,c)
{
    if ((r===0 && c===0) || (r===0 && c===cols-1) || (r===rows-1 && c===0) || (r===rows-1 && c===cols-1))
    {
        return 2;
    }
    else if ((r===0) || (c==0) || (r===rows-1) || (c===cols-1))
    {
        return 3;
    }
    else
    {
        return 4;
    }
}

function updateBoardUI()
{
    let cells=document.querySelectorAll('.cell');
    for (let i=0; i<cells.length; i++){
        let cellRow=parseInt(cells[i].dataset.row);
        let cellCol=parseInt(cells[i].dataset.col);
        let currentCellState=gameState[cellRow][cellCol];

        cells[i].innerHTML = ""; 

        for (let j=0; j<currentCellState.orbs; j++) {
            
            let newOrb=document.createElement('div');
            
            newOrb.classList.add('orb');
            
            if (currentCellState.owner === 'Red') {
                newOrb.classList.add('red-orb');
            } 
            else if (currentCellState.owner === 'Blue') {
                newOrb.classList.add('blue-orb');
            }
            cells[i].appendChild(newOrb);
        }
    }
}

function checkWinCondition()
{
    if (turnCount<=1){
        return;
    }

    let redCount=0;
    let blueCount=0;

    for (let r=0; r<rows; r++){
        for (let c=0; c<cols; c++){
            if (gameState[r][c].owner==='Red'){
                redCount+=1;
            }
            else if (gameState[r][c].owner==='Blue'){
                blueCount+=1;
            }
        }
    }
    if (redCount>0 && blueCount===0){
        gameOver('Red');
    }
    else if (blueCount>0 && redCount===0){
        gameOver('Blue');
    }
}

function startTurnTimer()
{
    clearInterval(turnTimerInterval);
    let turnTime=config.TURN_TIME;
    document.getElementById('turn-time').innerText=turnTime;

    turnTimerInterval=setInterval(() => {
        if (!isPaused && !isOver && !isAnimating){
            turnTime--;
            document.getElementById('turn-time').innerText=turnTime;
          
            if (turnTime<=0){
                clearInterval(turnTimerInterval);
                let failingPlayer = currentPlayer; 
                currentPlayer = (currentPlayer === 'Red') ? 'Blue' : 'Red';
                updateTurnUI();
                alert(failingPlayer + " ran out of time! Turn skipped.");
                startTurnTimer();
            }
        }
    },1000);
}

pauseButton.addEventListener('click', function(){
    isPaused=!isPaused;
    if (isPaused){
        pauseButton.innerText='Resume';
    } 
    else{
        pauseButton.innerText='Pause';
    }    
});

function startMasterClock()
{
    masterClockInterval=setInterval(() => {
        if (!isPaused){
            totalTime--;
            if (totalTime <= 0) {
                isOver = true;
                clearInterval(masterClockInterval);
                clearInterval(turnTimerInterval);

                let uiIndicator = document.getElementById('turn-indicator');
                
                if (redScore > blueScore) {
                    uiIndicator.className = "red-text";
                    uiIndicator.innerHTML = "TIME UP: RED WINS ON POINTS!";
                } else if (blueScore > redScore) {
                    uiIndicator.className = "blue-text";
                    uiIndicator.innerHTML = "TIME UP: BLUE WINS ON POINTS!";
                } else {
                    // Handle the draw
                    uiIndicator.className = "";
                    uiIndicator.style.color = "white"; 
                    uiIndicator.innerHTML = "TIME UP: DRAW!";
                }
                
                return; 
            }
            document.getElementById('total-time').innerText=totalTime;
        }
    },1000);
}

function updateTurnUI()
{
    let indicator=document.getElementById('turn-indicator');
    indicator.innerText=currentPlayer+"'s turn"
    indicator.classList.remove('red-text');
    indicator.classList.remove('blue-text');
    
    if (currentPlayer === 'Red') {
        indicator.classList.add('red-text');
    }
    else {
        indicator.classList.add('blue-text');
    }
}

updateTurnUI();

startMasterClock();

startTurnTimer();

function processExplosionQueue()
{
    if (explosionQueue.length === 0){
        isAnimating = false;

        let previousPlayer = currentPlayer;
        currentPlayer = (currentPlayer === 'Red') ? 'Blue' : 'Red';

        updateTurnUI();
        turnCount++;
        checkWinCondition(); 
        startTurnTimer(); 
        
        return; 
    }

    let currentExplosion = explosionQueue.shift(); 
    let r = currentExplosion.r;
    let c = currentExplosion.c;

    if (gameState[r][c].orbs >= getCriticalMass(r, c)) {
        
        gameState[r][c].orbs -= getCriticalMass(r, c);

        playSound(sound.pop);

        let neighbours = [[r-1, c], [r+1, c], [r, c-1], [r, c+1]];
        for (let i = 0; i < neighbours.length; i++) {
            let nr = neighbours[i][0];
            let nc = neighbours[i][1];
            
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                let previousOwner = gameState[nr][nc].owner;
                let previousOrbs = gameState[nr][nc].orbs; 
                let pointsEarned = 0;

                if (previousOwner === null) {
                    pointsEarned = 1;
                } 
                else if (previousOwner !== currentPlayer) {
                    pointsEarned = previousOrbs; 
                }
                else {
                    pointsEarned = 0; 
                }

                if (currentPlayer === 'Red') {
                    redScore += pointsEarned;
                    document.getElementById('red-score').innerText = redScore;
                } 
                else {
                    blueScore += pointsEarned;
                    document.getElementById('blue-score').innerText = blueScore;
                }
                
                gameState[nr][nc].orbs += 1;
                gameState[nr][nc].owner = currentPlayer;

                if (gameState[nr][nc].orbs >= getCriticalMass(nr, nc)) {
                    let alreadyInQueue = explosionQueue.some(e => e.r === nr && e.c === nc);
                    if (!alreadyInQueue) {
                        explosionQueue.push({r: nr, c: nc});
                    }
                }
            }
        }
    }
    updateBoardUI();

    setTimeout(processExplosionQueue, config.ANIM_DELAY);
}

function gameOver(winner)
{
    isOver=true;
    if (winner==='Blue'){
        document.getElementById('turn-indicator').innerText="Blue Wins!";
        document.getElementById('turn-indicator').className="blue-text";
    }
    else{
        document.getElementById('turn-indicator').innerText="Red Wins!";
        document.getElementById('turn-indicator').className="red-text";
    }
    clearInterval(turnTimerInterval);
    clearInterval(masterClockInterval);
}

function resetGame()
{
    if (isAnimating){
        return;
    }

    for (let r1=0; r1<rows; r1++){
        for (let c1=0; c1<cols; c1++){
            gameState[r1][c1].orbs=0;
            gameState[r1][c1].owner=null;
            let currentCell=document.getElementById("cell-"+r1+"-"+c1);
            currentCell.className="cell";
            currentCell.innerHTML="";
        }
    }
    isOver=false;
    isAnimating=false;
    currentPlayer='Red';
    turnCount=0;

    document.getElementById('turn-indicator').className="red-text";
    document.getElementById('turn-indicator').innerHTML="Red's turn";

    clearInterval(masterClockInterval)
    totalTime=config.MAX_GAME_TIME;
    document.getElementById('total-time').innerText=totalTime;
    startMasterClock();
    startTurnTimer();
    
    redScore = 0;
    blueScore = 0;
    document.getElementById('red-score').innerText = redScore;
    document.getElementById('blue-score').innerText = blueScore;
}

function playSound(audioNode) {
    if (!audioNode) return;
    let clone = audioNode.cloneNode(true);
    clone.volume = 0.6; 
    clone.play().catch(e => {
    });
}

document.getElementById('restart-button').addEventListener('click', resetGame);