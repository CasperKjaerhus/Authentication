'use strict';
let timerStart = Date.now();
let isDrawing = false;
let x = 0;
let y = 0;
let grad = 0;
let velocity = 0;
export let smallestX = Infinity;
export let smallestY = Infinity;
let prevTime = 0;
let currTime = 0;

export class Drawing {
  constructor(x, y, velocity, gradient) {
    this.startedDrawing = false;
    this.xArray = [x];
    this.yArray = [y];
    this.velocities = [velocity];
    this.gradients = [gradient];
  }

  push(newX, newY, velocity, gradient) {
    this.xArray.push(newX);
    this.yArray.push(newY);
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
    return distance/(currTime-prevTime);
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
        
        grad = 0;
        velocity = 0;
        /* Initialize main object */
        canvas.currDrawing = new Drawing(x, y, velocity, grad);
        canvas.currDrawing.startedDrawing = true;
      }
      isDrawing = true;
    }
  }
};

function mousemove(rect, canvas) {
  /*TODO: Out of bounds mouse movements should stop current stroke*/
  return e => {
    if (isDrawing === true && e.button === 0) {
      canvas.drawLine(x, y, e.clientX - rect.left, e.clientY - rect.top);
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;

      prevTime = currTime;
      currTime = Date.now() - timerStart;

      grad = canvas.currDrawing.gradient(canvas.currDrawing.xArray.length-1, canvas.currDrawing.yArray.length-1, x, y);
      velocity = canvas.currDrawing.velocity(currTime, prevTime, canvas.currDrawing.xArray.length-1, canvas.currDrawing.yArray.length-1, x, y);
      //Below is the code for correcting the position of the drawing
      smallestX = smallestX > x ? x : smallestX;
      smallestY = smallestY > y ? y : smallestY;

      canvas.currDrawing.push(x, y, velocity, grad);
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

function euclideanDist(x1, x2, y1, y2){
  return Math.sqrt((x1^2+x2^2+y1^2+y2^2));
}