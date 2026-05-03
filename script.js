const rows=12;
const cols=6;
let turnCount=0;
const boardContainer=document.getElementById('board-container');
let currentPlayer='Red';

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