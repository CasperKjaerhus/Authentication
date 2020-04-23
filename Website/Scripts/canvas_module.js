'use strict';

let startedDrawing = false;
let Strokes = undefined;
let isDrawing = false;
let timerStart = 0;
let grad = 0;
let x = 0;
let y = 0;
let smallestX = 0;
let smallestY = 0;
const drawing = undefined;

class Drawing {
  constructor(x, y, timeStamp, grad) {
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
    canvas.context.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

    for (let property in this) {
      this[property].length = 0;
    }
  }

  // Shrinks the object for export to server to desired inputsize
  exportStuff() {
  
    let groups = 100;
    let subArraySize = Math.ceil(this.xArray.length/groups);

    for (let property in this) { 

      for (let i = 0; i < groups; i++) {
        
        // If catches event where less than 
        if (i + subArraySize < groups ) {
          const averageSubArray = this[property].slice(i, i + subArraySize);
          const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;

          this[property].splice(i, subArraySize, averageCalc);
        }
        else {
          const averageSubArray = this[property].slice(i, this[property].length - 1);
          const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / ((this[property].length - 1)  - i);

          this[property].splice(i, (this[property].length - 1) - i, averageCalc);
          break;
        }
      }
    }
  }
}

class Canvas {
  constructor(id) {
    this.element = document.getElementById(`${id}`);
    this.context = this.element.getContext('2d');
    this.rect = this.element.getBoundingClientRect();  // The x and y offset of the canvas from the edge of the page
    this.clearButton = document.getElementById('buttonClear')
  }

  addEventListener(handler) {
    if (handler !== 'clearEventListener') {
      this.element.addEventListener(handler);
    }
    else {
      this.clearButton.addEventListener(handler);
    }
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

const canvas = new Canvas(drawCanvas);

canvas.addEventListener(mousedown);
canvas.addEventListener(mousemove);
window.addEventListener(mouseup);
canvas.clearCanvas(clearEventListener);

function mousedown('mousedown', e) {
  if (e.button === 0) {  

    x = e.clientX - rect.left;
    y = e.clientY - rect.top;

    if (startedDrawing === false) {
      e.preventDefault();
      
      timerStart = Date.now();
      grad = 0;
      
      /* Initialize main object */
      drawing = new Drawing(x, y, Date.now() - timerStart, grad);
      startedDrawing = true;
    }
    isDrawing = true;
  }
});


// Add the event listeners for mousedown, mousemove, and mouseup
const buttonSubmit = document.getElementById('buttonSubmit');



function mousemove('mousemove', e) {
  /*TODO: Out of bounds mouse movements should stop current stroke*/

  if (isDrawing === true && e.button === 0) {
    drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    grad = drawing.gradient(drawing.xArray.length-1, drawing.yArray.length-1, x, y);
    
    /*
    smallestX = smallestX > x ? x : smallestX;
    smallestY = smallestY > y ? y : smallestY;
    */
    drawing.push(x, y, Date.now() - timerStart, grad);
  }
});


/* Stop drawing */
function mouseup('mouseup', e) {
  
  if (isDrawing === true && e.button === 0) {

    drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
    
    isDrawing = false;
  }
});

/*  */
function clearEventListener('click', drawingObj, canvas) {
  drawingObj.clear(canvas);
});


/* Button for submitting draw data */
buttonSubmit.addEventListener('click', e =>  {
 
  drawing.exportStuff();

  const url = "/submit/";
  const data = JSON.stringify(drawing);

  drawing.clear();

  const parameters = {
    method: "POST",
    body: data
  };

  fetch(url, parameters)
    .then(
      function(response) {
        if (response.status > 399) { 
          console.log('Looks like there was a problem. Status Code: ' + response.status);
          return;
        }
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
});
