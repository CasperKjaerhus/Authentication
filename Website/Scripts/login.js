'use strict';

import Canvas from './canvas_module.js';

const formElem        = document.getElementById('loginForm');
const canvasElem      = document.getElementById('drawCanvas');
const clearElem       = document.getElementById('buttonClear');
const submitElem      = document.getElementById('buttonSubmit');
const canvas          = new Canvas(canvasElem, clearElem);

let drawing = canvas.currDrawing;

/* Button for submitting draw data */
submitElem.addEventListener('click', e =>  {
  drawing.exportStuff();

  const url = "/submit/";

  let data = new FormData(formElem);
  data.append(JSON.stringify(drawing));
  
  drawing.clear(canvas);

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
