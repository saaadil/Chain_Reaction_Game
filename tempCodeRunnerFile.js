
function resetGame()
{
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

    document.getElementById('turn-indicator').className="";
    document.getElementById('turn-indicator').innerHTML="Red's turn";

    startMasterClock();
    startTurnTimer();
}