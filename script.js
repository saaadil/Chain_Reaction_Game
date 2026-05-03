const rows=12;
const cols=6;
let turnCount=0;
let turnTime=15;
let turnTimerInterval=null;
let masterClockInterval=null;
let isPaused=false;
let totalTime=300;
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
        if (targetCell.owner !== null && targetCell.owner !== currentPlayer) {
            return;
        }

        targetCell.orbs += 1;
        targetCell.owner = currentPlayer;

        if (targetCell.orbs >= getCriticalMass(clickedRow, clickedCol)) {
            explode(clickedRow, clickedCol);
        }

        currentPlayer = (currentPlayer === 'Red') ? 'Blue' : 'Red';

        updateBoardUI();

        turnCount++;

        checkWinCondition(); 

        startTurnTimer();
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

function explode(r,c)
{
    gameState[r][c].orbs-=getCriticalMass(r,c);

    if (gameState[r][c].orbs===0){
        gameState[r][c].owner=null;
    }
    
    let neighbours=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]];

    for (let i=0; i<neighbours.length; i++){
        let nr=neighbours[i][0];
        let nc=neighbours[i][1];
        
        if (nr>=0 && nr<rows && nc>=0 && nc<cols){
            gameState[nr][nc].orbs+=1;
            gameState[nr][nc].owner=currentPlayer;

            if (gameState[nr][nc].orbs >= getCriticalMass(nr, nc)) {
            explode(nr, nc);
            }
        }
    }
}

function updateBoardUI()
{
    let cells=document.querySelectorAll('.cell');
    for (let i=0; i<cells.length; i++){
        let cellRow=parseInt(cells[i].dataset.row);
        let cellCol=parseInt(cells[i].dataset.col);

        if (gameState[cellRow][cellCol].orbs===0){
            cells[i].innerText="";
        } else{
            cells[i].innerText=gameState[cellRow][cellCol].orbs;
        }

        if (gameState[cellRow][cellCol].owner===null){
            cells[i].style.color="white";
        } else{
            cells[i].style.color=gameState[cellRow][cellCol].owner;
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
                alert(currentPlayer+" ran out of time! Turn skipped.");
                currentPlayer=(currentPlayer==='Red') ? 'Blue':'Red';
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