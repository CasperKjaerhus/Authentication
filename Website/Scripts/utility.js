'use strict';

import {Drawing as Drawing, smallestX as minX, smallestY as minY} from './canvas_module.js';

// Shrinks the object for export to server to desired inputsize
export default function exportStuff(drawing){

  //Init number of groups and subArraySize for each group
  const groups = 100;
  const ceilGroups = drawing.xArray.length % groups;
  const ceilArraySize = Math.ceil(drawing.xArray.length/groups);
  const floorArraySize = Math.floor(drawing.xArray.length/groups);

  //Correction of drawing position
  drawing.xArray.forEach(x => x - minX);
  drawing.yArray.forEach(y => y - minY);

  for (let property in drawing) { 

    if (property !== 'startedDrawing' && property !== 'correctDrawing') {

      for (let i = 0; i < groups; i++) {
        
        if (i < ceilGroups) {
          averageReduce(drawing[property], i, ceilArraySize);
        } else {
          averageReduce(drawing[property], i, floorArraySize);
        }
      }
    }
  }
  console.log(`done:  arrayLength = ${drawing.xArray.length}\n ${drawing.correctDrawing}`)
}

function averageReduce(array, i, subArraySize) {
  const averageSubArray = array.slice(i, i + subArraySize);
  const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;

  array.splice(i, subArraySize, averageCalc);
}


export function cleanUp(drawing, canvas) {
  drawing.startedDrawing = false;
  drawing.clear(canvas);
}













// Slettes når det er vettet og checket :D 



/* Det som blev sat ind

let subArraySize = Math.ceil(copyTestArray.length/groups);
let subArraySize2 = Math.floor(copyTestArray.length/groups);
let ceilGroups = testArray.length % groups;

for (let i = 0; i < groups; i++) {

  if (i < ceilGroups) {
    averageReduce(testArray, i, subArraySize);
  } else {
    averageReduce(testArray, i, subArraySize2);
  }
}
*/


/* Gamle 

for (let property in drawing) { 

  if (property !== 'startedDrawing') {

    for (let i = 0; i < groups; i++) {
    
      // If should catch the event in which: a) we are not yet done, b) the current index/group (i) + the size of this group should not reduce the array below a length of 100
      if (((i + subArraySize) <= drawing[property].length) && ((drawing[property].length - subArraySize) > groups)) {
                  
        averageReduce(drawing[property], i, subArraySize);
      // Else handle event where either of the above if-conditions are false.
      } else {

        //Set size for remaining groups, elements and size of each group
        const remaindingElem = drawing[property].length - i;
        const remaindingGroups = groups-i; 
        const size  = Math.ceil(remaindingElem/remaindingGroups);

        averageReduce(drawing[property], i, size);
      }
      
    }
  }
}

*/

