'use strict';

// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;
let timerStart = 0;
let startedDrawing = false;
let Strokes = undefined;

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

  get gradient(x1, y1, x2, y2) {
    return (y2-y1)/(x2-x1);
  }

  set clear() {
 
    for (property in this) {
      this.property.length = 0;
    }
  }

  set exportStuff() {
  
    groups = 100;
    subArraySize = Strokes.xArray.length/groups

  
    // Probably works, co-signed Dino og Neshørm
    for (property in this) {
      for (i = 0; i < groups; i++) {
        this.property.splice(i, subArraySize, 
                       this.property.slice(i, i + subArraySize)
                              .reduce((a, b) => a+b)/subArraySize);
      }
    }







    averageStrokes = new Stroke(0, 0, 0, 0);
    xArray = [];
    yArray = [];
    timeStamps = [];
    gradArray = [];

    //måske anvend for loop fra linje 32?
    for (property in this){
      for (i = 0; i < this.property.length; i += subArraySize) {
        tempArray.property = this.property.slice(i, i + subArraySize);
        averageStrokes.property.push(tempArray.property.reduce((a, b) => a+b, 0)/subArraySize);

        // Reduce er forudsættet at det kan summere og dividere
        // Kan tage et stykke af det øvre array, og average den til en enkelt værdi, uden huller i array. Så formattet er [%########] Hvor % er average værdier, og # er array værdier.
        // Kan bruge slice, men skal slette værdi'er svarende til den nye average, og push average værdien til starten. Splice funktion til array


        for (i = 0; i < property.length; i++) {
          Strokes.property..insert[i].reduce().slice(i, i + chunk);
        }

       //[%%%###########################################]

      }
    }      
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

    if (!startedDrawing) {
      
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
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
    grad = Strokes.gradient(Strokes.xArray[xArray.length-1], Strokes.yArray[yArray.length-1], x, y);
    
    Strokes.push(x, y, Date.now() - timerStart, grad);
  }
});

/* Stop drawing */
window.addEventListener('mouseup', e => {
  
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

/* Add event listener for clear button. Remember to clear AllStrokes array. */
buttonClear.addEventListener('click', e =>  {
  context.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  Strokes.clear();
});

/* Button for submitting draw data */
buttonSubmit.addEventListener('click', e =>  {
  
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
