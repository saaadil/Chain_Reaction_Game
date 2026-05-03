const rows=12;
const cols=6;
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

    newCell.addEventListener('click',function(event){
        let clickedRow=parseInt(event.target.dataset.row);
        let clickedCol=parseInt(event.target.dataset.col);
        let targetCell=gameState[clickedRow][clickedCol];

        if (targetCell.owner!==null && targetCell.owner!==currentPlayer){
            return;
        }
        targetCell.orbs+=1;
        targetCell.owner=currentPlayer;

        event.target.innerText=targetCell.orbs
        event.target.style.color=targetCell.owner

        currentPlayer=(currentPlayer ==='Red') ? 'Blue' : 'Red';
    })

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

            if (gameState[nr][nc].orbs>=getCriticalMass(nr,nc)){
                explode(nr,nc);
            }
        }
    }
}

function updateBoardUI()
{
    
}