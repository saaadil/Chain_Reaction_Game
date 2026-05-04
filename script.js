const rows=12;
const cols=6;
let turnCount=0;
let turnTime=15;
let turnTimerInterval=null;
let masterClockInterval=null;
let isPaused=false;
let isAnimating=false;
let totalTime=300;
let explosionQueue=[];
const boardContainer=document.getElementById('board-container');
let currentPlayer='Red';
const pauseButton=document.getElementById('pause-button');


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

    newCell.addEventListener('click', function(event) {
        let clickedRow = parseInt(event.target.dataset.row);
        let clickedCol = parseInt(event.target.dataset.col);
        let targetCell = gameState[clickedRow][clickedCol];

        if (isPaused){
            return;
        }
        if (isAnimating){
            return;
        }
        if (targetCell.owner !== null && targetCell.owner !== currentPlayer) {
            return;
        }

        targetCell.orbs += 1;
        targetCell.owner = currentPlayer;

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
    if ((r === 0 && c === 0) || (r === 0 && c === cols - 1) || (r === rows - 1 && c === 0) || (r === rows - 1 && c === cols - 1))
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
        alert("Red Wins!");
    }
    else if (blueCount>0 && redCount===0){
        alert("Blue Wins!");
    }
}

function startTurnTimer()
{
    clearInterval(turnTimerInterval);
    turnTime=15;
    document.getElementById('turn-time').innerText=turnTime;

    turnTimerInterval=setInterval(() => {
        if (!isPaused){
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
            document.getElementById('total-time').innerText=totalTime;

            if (totalTime<=0){
                clearInterval(masterClockInterval);
                isPaused=true;
                alert("Time is up!");

                checkWinCondition();
            }
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
    if (explosionQueue.length===0){
        isAnimating=false;

        let previousPlayer=currentPlayer;
        currentPlayer=(currentPlayer==='Red') ? 'Blue':'Red';

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
        if (gameState[r][c].orbs === 0) {
            gameState[r][c].owner = null;
        }

        let neighbours = [[r-1, c], [r+1, c], [r, c-1], [r, c+1]];
        for (let i = 0; i < neighbours.length; i++) {
            let nr = neighbours[i][0];
            let nc = neighbours[i][1];
            
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                gameState[nr][nc].orbs += 1;
                gameState[nr][nc].owner = currentPlayer;

                if (gameState[nr][nc].orbs >= getCriticalMass(nr, nc)) {
                    explosionQueue.push({ r: nr, c: nc });
                }
            }
        }
    }
    updateBoardUI();

    setTimeout(processExplosionQueue, 250);
}