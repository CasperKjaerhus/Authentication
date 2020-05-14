'use strict';

import {default as Canvas} from './canvas_module.js';
import {default as exportStuff} from './utility.js';

const userElem        = document.getElementById('username');
const canvasElem      = document.getElementById('drawCanvas');
const clearElem       = document.getElementById('buttonClear');
const submitElem      = document.getElementById('buttonSubmit');
const canvas          = new Canvas(canvasElem, clearElem);

//Button for submitting draw data
submitElem.addEventListener('click', e =>  {
  let drawing = canvas.currDrawing;

  //Final packing of drawing data into json object
  if (drawing === null || drawing.xArray.length < 100) {
    alert("Too few datapoints! Draw more!");
  } else {  
    exportStuff(drawing);
    let drawingData = JSON.stringify({username: userElem.value, drawing: drawing});

    const url = "/submit";
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
          } else if (response.status === 200) {
            alert("Autenticated!");
          }
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
      })

    //Clear canvas
    drawing.clear(canvas);
  }
})

