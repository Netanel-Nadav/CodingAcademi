'use strict'


function countNegs(cellI, cellJ, mat) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            // if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) negsCount++;
            if (mat[i][j]) negsCount++;
        }
    }
    return negsCount;
}



function cellClicked(elCell, i, j) {
    if (gNums[i][j] === gCounter) {
        elCell.style.backgroundColor = 'green';
        if (!winCheck()) {
            document.querySelector('.counter').innerHTML = 'Number: ' + (gCounter + 1);
            gCounter++;
        }
    }
}


function startTimer() {
    var startTime = Date.now();
    gTimerInterval = setInterval(showTimer, 100, startTime);
}

function showTimer(startTime) {
    var timeGap = Date.now() - startTime;
    document.querySelector('.timer').innerHTML = (timeGap / 1000).toFixed(3);
}

function stopClock() {
    clearInterval(gTimerInterval);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
