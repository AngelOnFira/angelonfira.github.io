(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
}());

// var rStart = 206;
// var gStart = 15;
// var bStart = 105;

var rStart = 175;
var gStart = 39;
var bStart = 47;

var rEnd = 0;
var gEnd = 0;
var bEnd = 0;
// 34, 34, 34
// var rEnd = 255;
// var gEnd = 255;
// var bEnd = 255;

var squareSize = 20; //Doesn't matter
var baseSquareSize = 6;
var addedSquareSize = 4;
var borderColor = 8;

var clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var minDim = Math.min(clientWidth, clientHeight);

if(window.requestAnimationFrame)
    minDim = minDim * 1.25;

// console.log("THE CLIENT WIDTH IS: " + clientWidth);
// console.log("THE CLIENT HEIGHT IS: " + clientHeight);

var canvasLarge, contextLarge;

var startTime, endTime;

var renderPoints, renderData;
var splotches = false;
var pixelDissolve = false;
var chunkDissolve = true;


// Canvas variables
var isInit = false;

function setup() {
    if(!window.requestAnimationFrame){
        splotches = true;
        pixelDissolve = true;
        chunkDissolve = false;
    } else {
        splotches = false;
        pixelDissolve = false;
        chunkDissolve = true;
    }

    noCanvas();
    startTime = new Date().getTime();

    if(!isInit){
        isInit = true;
        var sketch = function(p) {
            p.setup = function() {
                var cH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                p.createCanvas(windowWidth, cH);
            }
        };
        canvasLarge = new p5(sketch, 'canvasContainer');
    }

    renderCanvas();
}

function renderCanvas(){
    // Reset canvas and variables
    try {
        canvasLarge.clear();
    } catch(err){
        console.log("No clear option");
    }
    renderPoints = [];
    renderData = [];
    clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    minDim = Math.min(clientWidth, clientHeight);

    // Reset chunk variables
    chunkRenderData = {};
    chunkRenderStep = Math.floor(minDim / 34);

    canvasLarge.canvas.width = clientWidth * 2;
    canvasLarge.canvas.height = clientHeight * 2;

    canvasLarge.resizeCanvas(clientWidth, clientHeight);


    var xSize = clientWidth;
    var ySize = clientHeight;

    var generators = [];

    var minColor = Math.min(rStart, gStart, bStart);

    var ratio = 1.5;
    var totalRange = (minColor / ratio);
    var rangeDiff = (minColor / (ratio * 2));

    for (var i = 0; i < minDim; i++) {
        var pos = [parseInt(Math.random() * xSize), parseInt(Math.random() * ySize)];

        var randDiff = Math.random() * totalRange - rangeDiff;

        // -1(x-0.5)^2 + 0.25
        var color = [
            parseInt(getColor(rStart, rEnd, randDiff, pos[1], ySize)),
            parseInt(getColor(gStart, gEnd, randDiff, pos[1], ySize)),
            parseInt(getColor(bStart, bEnd, randDiff, pos[1], ySize))
        ];

        var comb = [pos, color];
        generators.push(comb);

        // Initialize the pixel array for the polygon point 
        var genKey = comb[0];
        genKey = genKey[0] + "," + genKey[1];
        chunkRenderData[genKey] = [];
    }

    renderPolygons(xSize, ySize, generators);
}

function renderPolygons(xSize, ySize, generators) {
    var pixelCount = 0;

    renderRow(xSize, ySize, generators, 0, onRenderFinish);

    // console.log("TOTAL PIXELS: " + pixelCount);
}

function onRenderFinish(xSize, ySize, generators) {
    var endTime = (new Date().getTime() - startTime);
    console.log("CALLBACK TIME: " + endTime + "ms");

    if (splotches && !chunkDissolve) {
        var generatorStart = generators[0][0][0];
        var generatorEnd = generators[0][0][1];
        var genLen = generators.length;

        // [0] = starting y of row
        // [1] = squareSize of row
        

        var y, rowSquareSize, totalSquares, renderProgress, xWidth;
        var renderLen = renderPoints.length;
        for (var i = 0; i < renderLen; i++) {
            y = renderPoints[i][0];
            rowSquareSize = renderPoints[i][1];
            totalSquares = Math.ceil(xSize / rowSquareSize);

            renderProgress = (y / ySize); //At 50% height this will be = 1, at 100% this will be = 2
            currBorder = getBorder(renderProgress);
            

            xWidth = totalSquares * rowSquareSize;
            var dist_min, dist_curr, targetGen0, targetGen1, iter;
            for(var x = 0; x < xWidth; x += rowSquareSize){
                var min = 0;
                dist_min = distance(x, generatorStart, y, generatorEnd);

                for (iter = 0; iter < genLen; iter++) {
                    targetGen0 = generators[iter][0][0];
                    targetGen1 = generators[iter][0][1];

                    dist_curr = distance(x, targetGen0, y, targetGen1);
                    if (dist_curr < dist_min) {
                        min = iter;
                        dist_min = dist_curr;
                    }
                }


                var targetGen = generators[min][1];
                renderData.push([x, y, rowSquareSize, (y / ySize), targetGen, currBorder, true]);
                // drawChunk(x, y, rowSquareSize, (y / ySize), targetGen, currBorder, true);
            }
        }
    }    

    if(chunkDissolve){
        var keys = Object.keys(chunkRenderData);
        keys = shuffleArray(keys);
        totalChunks = keys.length;
        chunkRenderStep = totalChunks / 7;

        var pixelArray, secondHalfArray, outputArray, maxLen, pixelInd, key;
        for(var a = 0; a < keys.length; a++){
            key = keys[a];
            outputArray = [];
            pixelArray = chunkRenderData[key];
            secondHalfArray = pixelArray.splice(pixelArray.length / 2);
            maxLen = Math.max(pixelArray.length, secondHalfArray.length);

            for(var b = 0; b < maxLen; b++){
                pixelInd = pixelArray.length - (b + 1);
                if(pixelInd >= 0)
                    outputArray.push(pixelArray[pixelInd]);

                pixelInd = b;
                if(pixelInd <= secondHalfArray.length - 1)
                    outputArray.push(secondHalfArray[pixelInd]);
            }
            chunkRenderData[key] = outputArray;
        }

        renderChunkData(chunkRenderData, keys, onChunkRenderFinish);    
    } else {
        renderData = shuffleArray(renderData);
        pixelRenderStep = renderData.length / 10;
        renderVoronoiData(renderData, onVoronoiDissolve);
    }
}

var chunkRenderData = {};
var chunkRenderStep = Math.floor(minDim / 34);
var totalChunks, chunkRenderIndex, chunkDataLen, chunkRenderLen, chunkRenderKey, chunkPixelIndex, chunkPixelEnd, cD;
function renderChunkData(polygonChunkObject, keys, callback){
    if(keys.length === 0)
        return callback();

    pixelDataStart = 0;
    chunkDataLen = keys.length;

    chunkRenderLen = chunkRenderStep;
    if(chunkRenderStep > chunkDataLen)
        chunkRenderLen = chunkDataLen;
    
    for(chunkRenderIndex = 0; chunkRenderIndex < chunkRenderLen; chunkRenderIndex++){
        chunkRenderKey = keys[chunkRenderIndex];
        chunkRenderPixels = polygonChunkObject[chunkRenderKey];
        chunkPixelEnd = chunkRenderPixels.length;
        
        if (!window.requestAnimationFrame)
            setTimeout(renderChunk.bind(null, chunkRenderPixels, 0));
        else
            window.requestAnimationFrame(renderChunk.bind(null, chunkRenderPixels, 0));
    }
    if (!window.requestAnimationFrame)
        setTimeout(renderChunkData.bind(null, polygonChunkObject, keys.splice(chunkRenderLen), callback));
    else {
        setTimeout(function(pCO, k, c){
            window.requestAnimationFrame(renderChunkData.bind(null, pCO, k, c))
        }.bind(null, polygonChunkObject, keys.splice(chunkRenderLen), callback), -30 * Math.pow((1 - (chunkDataLen / totalChunks)), 2) + 60);
    }
}
var chunkPixel;
var chunkPixelsPerFrame = 2;
function renderChunk(chunkData, index){
    if(index === chunkData.length || chunkData.length === 0)
        return;

    for(var i = 0; index < chunkData.length; i++){
        if(i === chunkPixelsPerFrame || index + i >= chunkData.length){
            index += i - 1;
            break;
        }
        chunkPixel = chunkData[index + i];
        drawChunk(chunkPixel[0], chunkPixel[1], chunkPixel[2], chunkPixel[3], chunkPixel[4], chunkPixel[5], chunkPixel[6]);
    }

    if (!window.requestAnimationFrame)
        setTimeout(renderChunk.bind(null, chunkData, index + 1));
    else
        window.requestAnimationFrame(renderChunk.bind(null, chunkData, index + 1));
}

function onChunkRenderFinish(){
    var endTime = (new Date().getTime() - startTime);
    console.log("COMPLETION TIME: " + endTime + "ms");
    console.log("FINISHED");
}

var pixelDataStart, pixelDataEnd, pixelDataLen, pixelRenderLen;
var pixelRenderStart, pD;
var pixelRenderStep = minDim * 2;
function renderVoronoiData(pixelData, callback){
    if(pixelData.length === 0)
        return callback();

    pixelDataStart = 0;
    pixelDataLen = pixelData.length;

    pixelRenderLen = pixelRenderStep;
    if(pixelRenderStep > pixelDataLen)
        pixelRenderLen = pixelDataLen;

    for(pixelRenderStart = 0; pixelRenderStart < pixelRenderLen; pixelRenderStart++){
        pD = pixelData[pixelDataStart + pixelRenderStart];
        drawChunk(pD[0], pD[1], pD[2], pD[3], pD[4], pD[5], pD[6]);
    }

    if (!window.requestAnimationFrame)
        setTimeout(renderVoronoiData.bind(null, pixelData.splice(pixelRenderLen), callback), 10);
    else
        window.requestAnimationFrame(renderVoronoiData.bind(null, pixelData.splice(pixelRenderLen), callback));
    
    // break;
}

function onVoronoiDissolve(){
    var endTime = (new Date().getTime() - startTime);
    console.log("COMPLETION TIME: " + endTime + "ms");
    console.log("FINISHED");
}
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

var timeout = ms => new Promise(res => setTimeout(res, ms));

function renderRow(xSize, ySize, generators, index, callback) {
    if (index < ySize) {
        squareSize = baseSquareSize + (1 - (index / ySize)) * addedSquareSize;


        if (!splotches || chunkDissolve) {
            var generatorStart = generators[0][0][0];
            var generatorEnd = generators[0][0][1];
            renderCol(xSize, ySize, index, generatorStart, generatorEnd, generators);


            renderRow(xSize, ySize, generators, index + squareSize, callback);
            // setTimeout(renderRow.bind(null, xSize, ySize, generators, index + squareSize, callback), 0);
        } else {
            renderPoints.push([index, squareSize]);

            renderRow(xSize, ySize, generators, index + squareSize, callback);
            // setTimeout(renderRow.bind(null, xSize, ySize, generators, index + squareSize, callback), 0);
        }
    } else {
        if (callback)
            callback(xSize, ySize, generators);
    }
}

function renderCol(xSize, ySize, y, generatorStart, generatorEnd, generators) {
    var genLen = generators.length;

    var renderProgress = (y / ySize); //At 50% height this will be = 1, at 100% this will be = 2
    currBorder = getBorder(renderProgress);

    var dist_min, dist_curr, targetGen0, targetGen1, iter;
    for (var x = 0; x < xSize; x += squareSize) {
        var min = 0;
        dist_min = distance(x, generatorStart, y, generatorEnd);

        for (iter = 0; iter < genLen; iter++) {
            targetGen0 = generators[iter][0][0];
            targetGen1 = generators[iter][0][1];

            dist_curr = distance(x, targetGen0, y, targetGen1);
            if (dist_curr < dist_min) {
                min = iter;
                dist_min = dist_curr;
            }
        }


        var targetGen = generators[min][1];

        if(chunkDissolve){
            var genKey = generators[min][0];
            genKey = genKey[0] + "," + genKey[1];
            chunkRenderData[genKey].push([x, y, squareSize, (y / ySize), targetGen, currBorder, true]);
        } else
            drawChunk(x, y, squareSize, (y / ySize), targetGen, currBorder, true);
    }
}

function drawChunk(x, y, squareSize, renderProgress, targetGen, currBorder, updateStyle) {
    if(updateStyle){
        canvasLarge.stroke(targetGen[0] + currBorder, targetGen[1] + currBorder, targetGen[2] + currBorder);
        canvasLarge.fill(targetGen[0] - renderProgress, targetGen[1] - renderProgress, targetGen[2] - renderProgress);
    }
    canvasLarge.rect(x, y, squareSize, squareSize);
}

function distance(x1, x2, y1, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}

function getBorder(renderProgress) {
    renderProgress = Math.min(-5 * Math.pow(renderProgress - 0.49, 2) + 1.1, 1);
    return borderColor * renderProgress;
}

function getColor(start, end, constRandom, y, ySize) {
    var heightCalc = (y / ySize);
    // console.log("Height calc: " + heightCalc);
    var colorPartial = 0;

    var renderProgress;
    if (heightCalc >= 0.98) {
        return end;
    } else if (heightCalc >= 0.953) {
        return Math.max(end + constRandom * 0.025, 0);
    } else
        renderProgress = 1.1 * Math.pow(heightCalc - 0.953, 2); //At 50% height this will be = 1, at 100% this will be = 2

    // This is all good
    // Render progress will be between 1 and 0

    if (start - end > 0) // For black
        return Math.min(Math.max((end + ((start - end) * renderProgress)) + constRandom * 0.05, 0), 255);
    // For white
    return Math.min(Math.max((start + ((end - start) * (1 - renderProgress))) + constRandom * 0.05, 0), 255);

    // start - end < 0
    // 179 - 255 = -76


    // 255 - 179 = 76

    // 179 + (76 * 0.5) + 4 = 221

    // -4.5(x-0.471)^2 + 1
    // if (heightCalc > 0.9) colorPartial = 0;
    // else colorPartial = start + (end - start) * heightCalc;
    // var returnCalc = Math.max(colorPartial + constRandom * 0.05, 0);
    // return returnCalc;
}