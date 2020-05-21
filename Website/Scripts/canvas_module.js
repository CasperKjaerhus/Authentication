'use strict';
//Export and init of drawing-correction variables
export let smallestX = Infinity;
export let smallestY = Infinity;

//Init of drawing-specific variables used in feature extraction
let isDrawing = false;
let x = 0;
let y = 0;
let grad = 0;
let velocity = 0;

//Init of time-specific variables used for velocity calc
let timerStart = Date.now();
let prevTime = 0;
let currTime = 0;

export class Drawing {
  constructor(x, y, velocity, gradient) {
    this.startedDrawing = false;
    this.correctDrawing = null;
    this.xArray         = [x];
    this.yArray         = [y];
    this.velocities     = [velocity];
    this.gradients      = [gradient];
  }

  push(x, y, velocity, gradient) {
    this.xArray.push(x);
    this.yArray.push(y);
    this.velocities.push(velocity);
    this.gradients.push(gradient);
  }

  gradient(x1, y1, x2, y2) {
    if (x1 !== x2) {
      return (y2-y1)/(x2-x1);
    }
    else {
      return (y2-y1);
    }
  }

  velocity(currTime, prevTime, x1, x2, y1, y2) {
    const distance = euclideanDist(x1, x2, y1, y2);
    return distance/(currTime - prevTime + 0.0001);
  }

  // Clears the canvas and object arrays, reset the timerStart
  clear(canvas) {
    for (let property in this) {
      if (property !== 'startedDrawing' && property !== 'correctDrawing') {
        this[property].length = 0;
      }
    }
    canvas.context.clearRect(0, 0, canvas.element.width, canvas.element.height);
    timerStart = Date.now();
    this.startedDrawing = false;
  }
}

export default class Canvas {
  constructor(DOMelem, clearElem) {
    this.element     = DOMelem;
    this.currDrawing = null;
    this.context     = this.element.getContext('2d');
    this.rect        = this.element.getBoundingClientRect();  // The x and y offset of the canvas from the edge of the page
    this.clearButton = clearElem;
    this.element.addEventListener('mousedown', mousedown(this.rect, this));
    this.element.addEventListener('mousemove', mousemove(this.rect, this));
    window.addEventListener('mouseup', mouseup(this.rect, this));
    this.clearButton.addEventListener('click', clearEventListener(this));
  }

  drawLine(x1, y1, x2, y2) {
    this.context.beginPath();
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 1;
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
    this.context.closePath();
  }
}

//Eventlistener for mousedown event
function mousedown(rect, canvas) {
  return e => {
    e.preventDefault();
    if (e.button === 0) {  

      x = e.clientX - rect.left;
      y = e.clientY - rect.top;

      currTime = Date.now() - timerStart;
      
      if (canvas.currDrawing === null || canvas.currDrawing.startedDrawing === false) {
        e.preventDefault();
        
        grad = 0;
        velocity = 0;
        /* Initialize main object */
        canvas.currDrawing = new Drawing(x, y, velocity, grad);
        canvas.currDrawing.startedDrawing = true;
      }
      isDrawing = true;
    }
  }
}

//Eventlistener for mousedown event
function mousemove(rect, canvas) {
  return e => {
    e.preventDefault();
    if (isDrawing === true && e.button === 0) {
      canvas.drawLine(x, y, e.clientX - rect.left, e.clientY - rect.top);
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;

      prevTime = currTime;
      currTime = Date.now() - timerStart;

      grad = canvas.currDrawing.gradient(canvas.currDrawing.xArray[canvas.currDrawing.xArray.length-1], canvas.currDrawing.yArray[canvas.currDrawing.yArray.length-1], x, y);
      velocity = canvas.currDrawing.velocity(currTime, prevTime, canvas.currDrawing.xArray[canvas.currDrawing.xArray.length-1], canvas.currDrawing.yArray[canvas.currDrawing.yArray.length-1], x, y);
      
      //Update the smallestX and Y accordingly after every mousemove-event
      smallestX = smallestX > x ? x : smallestX;
      smallestY = smallestY > y ? y : smallestY;

      canvas.currDrawing.push(x, y, velocity, grad);
    }
  }
}

//Stop drawing lines, whenever the mouseup is registered
function mouseup(rect, canvas) {
  return e => {
    if (isDrawing === true && e.button === 0) {

        canvas.drawLine(x, y, e.clientX - rect.left, e.clientY - rect.top);
        
        isDrawing = false;
    }
  }
}

//Clear canvas
function clearEventListener(canvas) {
  return () => canvas.currDrawing.clear(canvas);
}

//Calculate the euclidean distance between 2 datapoints
export function euclideanDist(x1, x2, y1, y2){
  return Math.sqrt(Math.pow((x1-x2), 2)+Math.pow((y1-y2), 2))
}