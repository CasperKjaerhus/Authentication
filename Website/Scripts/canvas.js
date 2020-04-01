'use strict';

let startedDrawing = false;
let Strokes = undefined;
let isDrawing = false;
let timerStart = 0;
let grad = 0;
let x = 0;
let y = 0;

class Stroke {
  constructor() {
    this.xArray = [];
    this.yArray = [];
    this.timeStamps = [];
    this.gradArray = [];
  }

  push(newX, newY, timeStamp, grad) {
    this.xArray.push(newX);
    this.yArray.push(newY);
    this.timeStamps.push(timeStamp);
    this.gradArray.push(grad);
  }

  gradient(x1, y1, x2, y2) {
    return (y2-y1)/(x2-x1);
  }

  clear() {
    // Error i test. "Assignement to undeclared variable property" (attempted fix med let)
    for (let property in this) {
      this[property].length = 0;
    }
  }

  exportStuff() {
  
    let groups = 100;
    let subArraySize = Math.ceil(this.xArray.length/groups);

    // Under construction
    for (let property in this) { 
      
      for (let i = 0; i < groups; i++) {
         
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
    
    /*  
    // Mega klønket 8=D, men burde fungere.
      for (let i = 0; i < groups; i++) {
        this.xArray.splice(i, subArraySize, 
                           this.xArray.slice(i, i + subArraySize)
                               .reduce((a, b) => a+b)/subArraySize);

        this.yArray.splice(i, subArraySize, 
                           this.yArray.slice(i, i + subArraySize)
                               .reduce((a, b) => a+b)/subArraySize);

        this.timeStamps.splice(i, subArraySize, 
                           this.timeStamps.slice(i, i + subArraySize)
                               .reduce((a, b) => a+b)/subArraySize);

        this.gradArray.splice(i, subArraySize, 
                           this.gradArray.slice(i, i + subArraySize)
                               .reduce((a, b) => a+b)/subArraySize);
      }*/
  } 
}


const buttonSubmit = document.getElementById('buttonSubmit');
const buttonClear = document.getElementById('buttonClear');
const drawCanvas = document.getElementById('drawCanvas');
const context = drawCanvas.getContext('2d');

// The x and y offset of the canvas from the edge of the page
const rect = drawCanvas.getBoundingClientRect();

// Add the event listeners for mousedown, mousemove, and mouseup
drawCanvas.addEventListener('mousedown', e => {

  if (e.button === 0) {  

    x = e.clientX - rect.left;
    y = e.clientY - rect.top;

    if (!startedDrawing) {
      
      timerStart = Date.now();
      grad = 0;
      
      /* Initialize main object */
      Strokes = new Stroke(x, y, Date.now() - timerStart, grad);
      startedDrawing = true;
    }
    isDrawing = true;
  }
});


drawCanvas.addEventListener('mousemove', e => {
  /*TODO: Out of bounds mouse movements should stop current stroke*/

  if (isDrawing === true && e.button === 0) {
    drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    grad = Strokes.gradient(Strokes.xArray[Strokes.xArray.length-1], Strokes.yArray[Strokes.yArray.length-1], x, y);
    
    Strokes.push(x, y, Date.now() - timerStart, grad);
  }
});


/* Stop drawing */
window.addEventListener('mouseup', e => {
  
  if (isDrawing === true && e.button === 0) {

    drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
    
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


/* Add event listener for clear button. Remember to clear AllStrokes array. */
buttonClear.addEventListener('click', e =>  {
  context.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  Strokes.clear();
});


/* Button for submitting draw data */
buttonSubmit.addEventListener('click', e =>  {
  
  Strokes.exportStuff();
  
  const url = "/submit/database.data";
  const data = JSON.stringify(Strokes);

  const parameters = { 
    
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: data
  };

  fetch(url, parameters)
  .then(
    response => response.json() // if the response is a JSON object
  ).then(
    success => console.log(success) // Handle the success response object
  ).catch(
    error => console.log(error) // Handle the error response object
  );
});
