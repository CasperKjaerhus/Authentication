'use strict';

let isDrawing = false;
let timerStart = 0;
let grad = 0;
let x = 0;
let y = 0;
let smallestX = 0;
let smallestY = 0;

export class Drawing {
  constructor(x, y, timeStamp, grad) {
    this.startedDrawing = false;
    this.xArray = [x];
    this.yArray = [y];
    this.timeStamps = [timeStamp];
    this.gradArray = [grad];
  }

  push(newX, newY, timeStamp, grad) {
    this.xArray.push(newX);
    this.yArray.push(newY);
    this.timeStamps.push(timeStamp);
    this.gradArray.push(grad);
  }

  gradient(x1, y1, x2, y2) {  
    
    if (x1 !== x2) {
      return (y2-y1)/(x2-x1);
    }
    else {
      return (y2-y1);
    }
  }

  // Clears the object arrays
  clear(canvas) {
    canvas.context.clearRect(0, 0, canvas.element.width, canvas.element.height);

    for (let property in this) {
      if(property !== 'startedDrawing') {
        this[property].length = 0;
      }
    }
  }


}

export default class Canvas {
  constructor(DOMelem, clearElem) {
    this.element = DOMelem;
    this.currDrawing = null;
    this.context = this.element.getContext('2d');
    this.rect    = this.element.getBoundingClientRect();  // The x and y offset of the canvas from the edge of the page
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


function mousedown(rect, canvas) {
  return e => {
    if (e.button === 0) {  

      x = e.clientX - rect.left;
      y = e.clientY - rect.top;

      if (canvas.currDrawing === null || canvas.currDrawing.startedDrawing === false) {
        e.preventDefault();
        
        timerStart = Date.now();
        grad = 0;
        
        /* Initialize main object */
        canvas.currDrawing = new Drawing(x, y, Date.now() - timerStart, grad);
        canvas.currDrawing.startedDrawing = true;
      }
      isDrawing = true;
    }
  }
};


// Add the event listeners for mousedown, mousemove, and mouseup



function mousemove(rect, canvas) {
  /*TODO: Out of bounds mouse movements should stop current stroke*/
  return e => {
    if (isDrawing === true && e.button === 0) {
      canvas.drawLine(x, y, e.clientX - rect.left, e.clientY - rect.top);
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      grad = canvas.currDrawing.gradient(canvas.currDrawing.xArray.length-1, canvas.currDrawing.yArray.length-1, x, y);
      
      /*
      Below is the code for correcting the position of the drawing
      smallestX = smallestX > x ? x : smallestX;
      smallestY = smallestY > y ? y : smallestY;
      */
      canvas.currDrawing.push(x, y, Date.now() - timerStart, grad);
    }
  }
};


/* Stop drawing */
function mouseup(rect, canvas) {
  return e => {
    if (isDrawing === true && e.button === 0) {

        canvas.drawLine(x, y, e.clientX - rect.left, e.clientY - rect.top);
        
        isDrawing = false;
    }
  }
};

/*  */
function clearEventListener(canvas) {
  return () => canvas.currDrawing.clear(canvas);
};


