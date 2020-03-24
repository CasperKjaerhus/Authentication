'use strict';

// When true, moving the mouse draws on the canvas
let isDrawing = false;
let hasStarted = false;
let x = 0;
let y = 0;
let curStroke;


function copyStroke(oldStroke){
  let newStroke = new Stroke();

  for(let i=0; i < oldStroke.x.length; i++){
    newStroke.x.push(oldStroke.x[i]);
    newStroke.y.push(oldStroke.y[i]);
    newStroke.timeStamps.push(oldStroke.timeStamps[i])
  }

}

class Stroke{
  constructor(){
    this.x = [];
    this.y = [];
    this.timeStamps = [];
  }

  push(newX, newY, timeStamp) {
    this.x.push(newX);
    this.y.push(newY);
    this.timeStamps.push(timeStamp);
  }

  get strokeTime() {
    return this.timeStamps[this.timeStamps.length];
  }
}


function drawingDuration(AllStrokes) {
  return AllStrokes.reduce((total, curr) => total + curr);
}

const drawCanvas = document.getElementById('drawCanvas');
const context = drawCanvas.getContext('2d');

// The x and y offset of the canvas from the edge of the page
const rect = drawCanvas.getBoundingClientRect();

// Add the event listeners for mousedown, mousemove, and mouseup
drawCanvas.addEventListener('mousedown', e => {
  
  if (e.button === 0) {    
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    isDrawing = true;
    
  }
});

drawCanvas.addEventListener('mousemove', e => {
  /*TODO: Out of bounds mouse movements should stop current stroke*/
  if (isDrawing === true && e.button === 0) {
    drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    // TODO: feature extract x, y, and time for stroke
  }
});


window.addEventListener('mouseup', e => {
  /*TODO: The latest stroke should be pushed to the stroke array*/
  if (isDrawing === true && e.button === 0) {
    drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});


function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}