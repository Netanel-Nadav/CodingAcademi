'use strict'
const MINE = '💣';
const FLAG = '🚩';
const EMPTY = '';


var gTimerInterval;
var gBoard;
var gIsFirstClick = false;
var hintsCounter = 3;

var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIFE: 2
};

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPass: 0
}

function initGame() {
    gGame.isOn = true;
    gBoard = buildBoard();
    showLife()
    console.table(gBoard);
    renderBoard(gBoard);
    // countNegsAround(gBoard);
    gGame.shownCount = 0
    gGame.markedCount = 0
    console.log('MINES', gLevel.MINES);

}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board;
}
console.log('MINES', gLevel.MINES);

function getRandomMineLocation(board, cellI, cellJ) {
    var bombCounter = 0;
    while (bombCounter !== gLevel.MINES) {
        var i = getRandomIntInclusive(0, board.length - 1);
        var j = getRandomIntInclusive(0, board.length - 1);
        if (i === cellI && j === cellJ) continue;
        if (!board[i][j].isMine) {
            board[i][j].isMine = true;
            bombCounter++
        }
    }
    return board
}


function renderBoard(board) {
    var strHTML = '';
    var className;
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine) {
                className = 'cells bomb-' + i + '-' + j;
            } else {
                className = 'cells cell-' + i + '-' + j;
            }
            strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i},${j})"></td>`;
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


function countNegsAround(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            if (!currCell.isMine) {
                currCell.minesAroundCount = setMinesNegsCount(i, j, board)
                if (!setMinesNegsCount(i, j, board)) {
                    currCell.minesAroundCount = EMPTY;
                }
            }
        }
    }
}

function setMinesNegsCount(cellI, cellJ, board) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (!gGame.shownCount) {
        startTimer();
        getRandomMineLocation(gBoard, i, j);
        countNegsAround(gBoard)
    }
    var cell = gBoard[i][j];
    if (cell.isShown) return
    if (cell.isMarked) return
    elCell.innerText = (gBoard[i][j].isMine) ? MINE : gBoard[i][j].minesAroundCount;
    elCell.classList.add('clicked-cell');
    if (cell.isMine) {
        gLevel.LIFE--;
        cell.isShown = true;
        elCell.classList.remove('clicked-cell');
        // gGame.markedCount ++;
        elCell.style.backgroundColor = 'red';
        elCell.innerText = MINE;
        elCell.style.color = 'white'

        if (gLevel.LIFE === 0) {
            checkGameOver(elCell);
            showAllBombs(gBoard);
            stopClock();
            document.querySelector('.life1').style.visibility = 'hidden'
        } else if (gLevel.LIFE === 1) {
            document.querySelector('.life2').style.visibility = 'hidden'
        } else if (gLevel.LIFE === 2) {
            document.querySelector('.life3').style.visibility = 'hidden'
        }
    } else {
        gGame.shownCount++
        cell.isShown = true;
        console.log(gGame.shownCount);
        winCheck();
        if (cell.minesAroundCount === '') expandShown(gBoard, elCell, i, j)
    }
}


function cellMarked(elCell, i, j) {
    const noPopup = document.getElementById('table')
    noPopup.addEventListener("contextmenu", e => e.preventDefault());
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++
        console.log(gGame.markedCount);
        winCheck();
    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        console.log('gGame.markedCount', gGame.markedCount);
    }
    elCell.innerText = (gBoard[i][j].isMarked) ? FLAG : '';

}

function checkGameOver(elCell) {
    elCell.style.backgroundColor = 'red';
    document.querySelector('.smilie').innerText = '😭';
    document.querySelector('.popup').style.display = 'block';
    document.querySelector('.popup h2').innerText = 'Game Over';
    document.querySelector('.popup p').innerText = 'Lets Try again'
    var elTimer = document.querySelector('.timer');
    stopClock();
    openPopup()
    gGame.isOn = false;
}


function winCheck() {
    if (gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES) {
        gGame.isOn = false;
        console.log('Checking win');
        document.querySelector('.smilie').innerText = '😎';
        document.querySelector('.popup').style.display = 'block';
        document.querySelector('.popup h2').innerText = 'Victory!';
        document.querySelector('.popup p').innerText = 'Try Next Level'
        var elTimer = document.querySelector('.timer');
        document.querySelector('.timer2').innerText = elTimer.innerText;
        stopClock();
        return true;
    }
    return false;
}


function showAllBombs(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine) {
                var elBombs = document.querySelector(`.cell-${i}-${j}`);
                console.log('elBombs', elBombs);
                elBombs.innerText = MINE;
                elBombs.style.backgroundColor = 'red';
                elBombs.style.color = 'white';
            }
        }
    }
    return board
}


function startGame(elBtn) {
    stopClock();
    // startTimer();
    document.querySelector('.smilie').innerText = '🤩';
    gLevel.LIFE = 2;
    showLife()
    initGame();
    closePopup()
}


function showLife() {
    if (gLevel.SIZE === 4) {
        document.querySelector('.life1').style.visibility = 'visible'
        document.querySelector('.life2').style.visibility = 'visible'
        document.querySelector('.life3').style.visibility = 'hidden'
    } else {
        document.querySelector('.life1').style.visibility = 'visible'
        document.querySelector('.life2').style.visibility = 'visible'
        document.querySelector('.life3').style.visibility = 'visible'
    }
}


function openPopup() {
    var elTimer = document.querySelector('.timer');
    document.querySelector('.timer2').innerText = elTimer.innerText;
    document.querySelector('.popup').style.display = 'block'
}

function closePopup() {
    document.querySelector('.popup').style.display = 'none'
}


function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isShown) continue;
            var currCell = board[i][j];
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`);
            if (currCell.isMarked === false && !currCell.isMine) {
                currCell.isShown = true;
                elCurrCell.style.backgroundColor = 'darkblue'
                elCurrCell.style.color = 'white'
                elCurrCell.innerText = currCell.minesAroundCount;
                gGame.shownCount++
                console.log('ShownCount in recursia', gGame.shownCount);
            }
            if (currCell.minesAroundCount === '') expandShown(board, elCurrCell, i, j)
        }
    }
}
// currCell.minesAroundCount === 0 &&
// && currCell.isMine === false


function setGameSize(elBtn) {
    if (elBtn.innerText === 'Easy') {
        stopClock();
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gLevel.LIFE = 2;
        showLife();
    } else if (elBtn.innerText === 'Medium') {
        stopClock();
        gLevel.SIZE = 8;
        gLevel.MINES = 10;
        gLevel.LIFE = 3;
        showLife();
    } else {
        stopClock();
        gLevel.SIZE = 12;
        gLevel.MINES = 24;
        gLevel.LIFE = 3;
        showLife();
    }
    initGame()
}



function safeClick(gBoard) {
    var randI = getRandomIntInclusive(0, gBoard.length - 1);
    var randJ = getRandomIntInclusive(0, gBoard.length) - 1;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell[i][j] !== currCell.isMine) {
                // this is where my mind takes me to but,
                //  i dont know how to continue 
            }
        }
    }
}