

//Compare function. Asserting if failed or passed.
function assert(testVal, expectedVal, iteration, failures){
  const verdict = testVal === expectedVal ? true : false;
  if (verdict === true) {
    return failures;
  } else {
    //console.log(testVal, expectedVal, iteration);
    return ++failures;
  }
}

//Init function for a random array of length 0-1*magnitude, as well as filling the array with 0-1*magnitude elements
// ie. magnitude = 1000, will generate an array of length 0-1000, with elements ranging from 0-1000.
function initRandomArray(magnitude) {
  const initVal = 100;
  const randomVal = Math.ceil(Math.random()*magnitude) + initVal;
  const array = [];
  array.length = randomVal;
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.ceil(Math.random()*magnitude);
  }
  return array;
}

//Reduction function for slice/splice of an array, fixing in place.
function averageReduce(array, i, subArraySize) {
  const averageSubArray = array.slice(i, i + subArraySize);
  const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;

  array.splice(i, subArraySize, averageCalc);
}


// Vores funktion som skal testes


//Test function for validating that averageReduce() produces an array of an expected length
//Confirmed working last on 05/05-2020 at 14:20 by ANeshe (OBS!!! '+1' in line 77 is IMPORTANT due to .slice()).
function testAverageReduce(testIterations, groups) {
  const testName = 'Average Reduce';

  let failed = 0;
  
  for (let iteration = 1; iteration <= testIterations; iteration++) {
    failed = 0;
    const testArray = initRandomArray(1000);
    let subArraySize = Math.ceil(testArray.length/groups);

    for (let i = 0; i < groups; i++) {
      const remaindingElem = testArray.length - 1 - i;
      if (remaindingElem >= subArraySize) {
                  
        averageReduce(testArray, i, subArraySize);
      } else {
        const remaindingElem = testArray.length - 1 - i;

        averageReduce(testArray, i, remaindingElem + 1);
      }
    }
    failed = assert(testArray.length, groups, iteration, failed);  
    consoleLogTestResult(testName, iteration, failed);
  }
}


// Kørsel og sammenligning af vores vs. den manuelle

// Sammenligner averageReduceOfTestArray og expectedArrayReduce
function testIntegrityOfReduce(testIterations, groups, magnitude) {
  const testName = 'Integrity of Reduce';

  let accuFail = 0;
  for (let iteration = 1; iteration <= testIterations; iteration++) {
    let failed = 0;
    let j = 1;

    const testArray = initRandomArray(magnitude);
    const expectedArray = [];
    const copyTestArray = Array.from(testArray);

    let subArraySize = Math.ceil(copyTestArray.length/groups);
    let subArraySize2 = Math.floor(copyTestArray.length/groups);
    let ceilGroups = testArray.length % groups;

    for (let i = 0; i < groups; i++) {

      if (i < ceilGroups) {

        expectedArray[i] = expectedArrayReduce(copyTestArray, subArraySize, i, j);
        averageReduce(testArray, i, subArraySize);
        ++j;
      } else {
        
        expectedArray[i] = expectedArrayReduce(copyTestArray, subArraySize2, i, j); // trouble
        averageReduce(testArray, i, subArraySize2);
        console.log(i, ceilGroups, testArray[i], expectedArray[i]);
      }
      failed = assert(testArray[i], expectedArray[i], iteration, failed);
    }

    console.log(testArray.length, expectedArray.length);
    
    accuFail += failed;
  }
  consoleLogTestResult(testName, testIterations, accuFail);
}


// Den manuelle metode
function expectedArrayReduce(inputArray, subArraySize, i, j) {
  let subArray = [];
  let sum = null;
  let avg = null;


  

  // index = i < j ? subArraySize * i : i + j * subArraySize;
  // index = 9 < 10  = 9*3       = 27
  // index = 10 < 10 = 10 + 10*2 = 30
  // index = 11 < 10 = 11 + 10*2 = 31
  // index = 12 < 10 = 12 + 10*2 = 

  let index = i < j ? i * subArraySize : i + j * (subArraySize);


  subArray = inputArray.slice(index, index + subArraySize);
  console.log(i, j, subArray, subArray.length);
 
  for (let k = 0; k < subArray.length; k++) {
    sum += subArray[k];
  }

  avg = sum/subArray.length;
  return avg;
}




function consoleLogTestResult(testName, TotalIterations, failed) {
  const verdict = failed !== 0 ? 'Failed' : 'Passed';
  console.log(`-----------------------------------------------------------------------------`);
  console.log(`Test Result for ${testName}:\n${verdict}\nPass: ${TotalIterations - failed}\nFail: ${failed}`);
  console.log(`-----------------------------------------------------------------------------`);
}


//testAverageReduce(100, 100);

testIntegrityOfReduce(1, 100, 100);































































































