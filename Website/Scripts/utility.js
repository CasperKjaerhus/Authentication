'use strict';

import {smallestX as minX, smallestY as minY} from './canvas_module.js';

// Shrinks the object for export to server to desired inputsize
export default function exportData(drawing) {

  //Init number of groups and subArraySize for each group
  const inputSizeNN = 100;
  const ceilGroups = drawing.xArray.length % inputSizeNN;
  const ceilArraySize = Math.ceil(drawing.xArray.length/inputSizeNN);
  const floorArraySize = Math.floor(drawing.xArray.length/inputSizeNN);

  //Correction of drawing to starting position
  drawing.xArray.forEach(x => x - minX);
  drawing.yArray.forEach(y => y - minY);

  for (let property in drawing) { 

    if (property !== 'startedDrawing' && property !== 'correctDrawing') {

      for (let i = 0; i < inputSizeNN; i++) {
        
        if (i < ceilGroups) {
          averageReduce(drawing[property], i, ceilArraySize);
        } else {
          averageReduce(drawing[property], i, floorArraySize);
        }
      }
    }
  }
}

function averageReduce(array, i, subArraySize) {
  const averageSubArray = array.slice(i, i + subArraySize);
  const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;

  array.splice(i, subArraySize, averageCalc);
}