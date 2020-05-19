'use strict';
import {default as Canvas} from './canvas_module.js';
import {default as exportData} from './utility.js';

//Get the DOM objects by DOM selectors on the html-element id
const validate        = document.getElementById('validate');
const buttonNext      = document.getElementById('nextDrawing');
const counterElem     = document.getElementById('counter');
const canvasElem      = document.getElementById('drawCanvas');
const clearElem       = document.getElementById('buttonClear');
const canvas          = new Canvas(canvasElem, clearElem);

let data = [];
let counter = 0;
let numCorrect = 5;
let done = 2*numCorrect;
counterElem.innerHTML=`${counter}/${done}`;

//ToDo: Handle succes and fail cases for response
// Ask Cleth about L21 'e'
buttonNext.addEventListener('click', e => {
  let drawing = canvas.currDrawing;

  /* Check if drawing consist of enough raw-data/data points to be represented by 100 values
     and ready data for export and copy into data array */
  if (drawing === null || drawing.xArray.length < 100) {
    alert("Too few datapoints! Draw more!");
  } else if (counter < done) {  
    drawing.correctDrawing = counter < numCorrect ? true : false;
    exportData(drawing);
    data.push(JSON.parse(JSON.stringify(drawing)));
    counterElem.innerHTML=`${counter = counter < done ? counter+1 : done}/${done}`;
    drawing.clear(canvas);
  }

  if (counter === done) {
    buttonNext.disabled = true;

    let drawingData = JSON.stringify({username: validate.value, drawings: data});

    // Setup url and parameters (method & body) for fetch call
    const url = "/createaccount/";
    const parameters = {
      method: "POST",
      body: drawingData
    }


    fetch(url, parameters)
      .then(
        function(response) {
          if (response.status > 399) { 
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
          } else if (response.status <= 399) {
            alert("SUCCES!");
          }
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :', err);
      })
  }
})

// TODO: Client-side: Handle response
// Ask Cleth about L68 'e'
validate.addEventListener('change', e => {
  const url = "/checkusername/";

  const parameters = {
    method: "POST",
    body: validate.value
  }

  fetch(url, parameters)
    .then(
      function(response) {
        if (response.status > 399) {
          console.log('Looks like there was a problem. Status Code: ' + response.status);
        }
        else if (response.body === 'taken') {
          //ToDo: Update display for user to indicate invalid username (mainly css changes)
        }
        else if (response.body === 'not taken') {
          //ToDo: Update display for user to indicate valid username (mainly css changes)
        }
      }
    )
    .catch(function(err) {
      console.log('Fetch Error: ', err);
    })
})


