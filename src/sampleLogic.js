document.addEventListener('DOMContentLoaded', onDOMloaded, false);
var globalNodeCount = 0;
let imageWidth = 75;  
let imageHeight = 75;
let stopFlag = false;
let submitFlag = false; 

function onDOMloaded() {
    console.log("entered onDOMloaded");
    var pixelDimension = 25;
    var globalIndividualCount = [0, 0, 0]; // 0)aggregate count 1) resistor 2) voltageSource
    
    var imageDivs = document.querySelectorAll(".component");
    imageDivs.forEach((eachDiv) => {
        onMouseDown(eachDiv, globalIndividualCount);
    });
    wireButtons();
}

function wireButtons() {
    wireWire();
    wireDelete();
    wireSubmit();
    
    function wireDelete(){ 
        let deleteButton = document.getElementById("deleteButton");
        deleteButton.addEventListener('click', deleteToggle)
        
    }
    
    function deleteToggle(){
        let toggleState = deleteButton.getAttribute("data-toggle-state");
        let wireButton = document.getElementById("wireButton");
        let wireToggleState = wireButton.getAttribute("data-toggle-state");
        if(toggleState == "false"){
            if(wireToggleState == "true"){ // if click when delete untoggled then wire should become untoggled (delete becomes toggled) 
                wireToggle();
            }
            toggleState = "true";
            deleteButton.style.backgroundColor = "white";
            deleteButton.setAttribute("data-toggle-state", toggleState);
        } else {
            toggleState = "false";
            deleteButton.style.backgroundColor = "lightgreen";
            deleteButton.setAttribute("data-toggle-state", toggleState);
        }
    }

    function wireWire() { 
        var wireButton = document.querySelector("#wireButton");
        wireButton.addEventListener("click", wireToggle);

    }

    function wireToggle() { 
        let deleteButton = document.getElementById("deleteButton");
        let deleteToggleState = deleteButton.getAttribute("data-toggle-state");
        console.log("entered wireToggle");
        let toggleState = wireButton.getAttribute("data-toggle-state");
        if (toggleState == "false") {
            if (deleteToggleState == "true"){
                deleteToggle();
            }
            toggleState = "true";
            wireButton.style.backgroundColor = "white";
            wireButton.setAttribute("data-toggle-state", toggleState);
        } else {
            toggleState = "false"; // advice is not to cast?
            wireButton.style.backgroundColor = "lightgreen";
            wireButton.setAttribute("data-toggle-state", toggleState);
        }
    }


    function wireSubmit() {
        var submitButton = document.querySelector('#submitButton');
        
        submitButton.addEventListener('click', submitData);

    }

}

function submitData() {
    console.log("entered submitData");
    if(submitFlag === true){
        alert("Sorry, only one submit is supported for this version. Please refresh the page.");
        return false; 
    }

    let allComponentsOnCanvas = findAllComponentsOnCanvas();
    console.log(allComponentsOnCanvas);
    if(validComponentConnections(allComponentsOnCanvas)){
        let wirePixels = findWirePixels();
        if(allComponentsOnCanvas[1][0] != null){
        } 
    
        if (wirePixels.length > 0) { preparePixels(wirePixels) };
    
    } else {
        alert("Invalid connections; exactly 2 connections per component is required");
        return false;
    }

    function validComponentConnections(allComponentsOnCanvas){
        console.log(allComponentsOnCanvas); // element[0] = resistors [1] = voltageSource 
        //There will only be one voltage source (Enforced ) so I wont iterate through allcomps 
        //resistors
        let resistorsOnCanvas = allComponentsOnCanvas[0];
        let voltageSourceOnCanvas = allComponentsOnCanvas[1];
        let wirePixelCollection = document.getElementsByClassName("wirePixel");
        let [validPixels, invalidPixels, loneComponents] = checkSurroundingWirePixels(resistorsOnCanvas, voltageSourceOnCanvas);
        //handle validPixels
        validPixels.forEach((validIndex)=>{
            let pixel = wirePixelCollection[validIndex];
            pixel.style.fill = "#66ff33";
        });
        //handle invalidPixels
        invalidPixels.forEach((invalidIndex)=>{
            let pixel = wirePixelCollection[invalidIndex];
            pixel.style.fill = "red";
        });
        //handle loneComponents
        loneComponents.forEach((component)=>{
            component.style.opacity = "0.6";
        });
        //return conditions
        if(invalidPixels.length == 0 && loneComponents.length == 0 && validPixels.length > 1){ //minimally 2 for validPixels  
            return true;
        } else {
            return false;
        }
        



        function checkSurroundingWirePixels(resistorsOnCanvas, voltageSourceOnCanvas){
            let invalidPixels = []; // if == 1 or >2 connections store all and then process to change color = red
            let validPixels = []; // if == 2 then process all to change color green
            let loneComponents = []; // if == 0 then need to transform 
            resistorsOnCanvas.forEach((resistor)=>{
                checkComponentValid(resistor, validPixels, invalidPixels, loneComponents);  //arrays are mutated
            });
            
            checkComponentValid(voltageSourceOnCanvas[0], validPixels, invalidPixels, loneComponents);
            return [validPixels, invalidPixels, loneComponents];

            function checkComponentValid(resistor, validPixels, invalidPixels, loneComponents){
                let mainCanvasCoords = document.getElementById('mainCanvas_svg').getBoundingClientRect();
                let resistorCoords = resistor.getBoundingClientRect(); 
                let gridX = Math.round(resistorCoords.left - mainCanvasCoords.left); // of top left
                let gridY = Math.round(resistorCoords.top - mainCanvasCoords.top);
                checkValidPixels(gridX, gridY); 
                function checkValidPixels(gridX, gridY){
                    
                    let gridHeight = mainCanvasCoords.top - mainCanvasCoords.bottom; //top is 0 0 
                    let gridWidth = mainCanvasCoords.right - mainCanvasCoords.left;
                    let flagLeft, flagRight, flagTop, flagBottom = false; 
                    let hold = []; // all matching adjacent pixels, regardless of valid invalid etc
                    
                    //check bounds
                    //left side
                    flagLeft = (gridX == 0);
                    flagRight = (gridX == (gridWidth - imageWidth));
                    flagTop = (gridY == 0);
                    flagBottom = (gridY == (gridHeight - imageHeight));
                    console.log("flags: " + flagLeft + " " + flagRight + " " + flagBottom + " " + flagTop);

                    //set of wirepixels
                    //traverse left side
                    
                    for(let i = 0; i < wirePixelCollection.length; ++i){ // index for wire comparisons
                        //only check sides if within bounds (ie flag is false)
                        //split for loops into sides of the element
                        if(flagLeft === false){
                            for(let pixelCount = 0; pixelCount < imageHeight; pixelCount += pixelDimension){
                                if((wirePixelCollection[i].getAttribute("x") == (gridX-pixelDimension)) && (wirePixelCollection[i].getAttribute("y") == (gridY + pixelCount))){
                                    hold.push(i); //store index of pixel in hold
                                }
                            }
                        }

                        if(flagBottom === false){
                            for(let pixelCount = 0; pixelCount < imageWidth; pixelCount += pixelDimension){
                                if((wirePixelCollection[i].getAttribute("x") == (gridX + pixelCount)) && (wirePixelCollection[i].getAttribute("y") == (gridY + 3*pixelDimension))){
                                    hold.push(i); //store index of pixel in hold
                                }
                            }
                        }

                        if(flagRight === false){
                            for(let pixelCount = 0; pixelCount < imageHeight; pixelCount += pixelDimension){
                                if((wirePixelCollection[i].getAttribute("x") == (gridX + 3*pixelDimension)) && (wirePixelCollection[i].getAttribute("y") == (gridY + pixelCount))){
                                    hold.push(i); //store index of pixel in hold
                                }
                            }
                        }

                        if(flagTop === false){
                            for(let pixelCount = 0; pixelCount < imageHeight; pixelCount += pixelDimension){
                                if((wirePixelCollection[i].getAttribute("x") == (gridX+pixelCount)) && (wirePixelCollection[i].getAttribute("y") == (gridY - pixelDimension))){
                                    hold.push(i); //store index of pixel in hold
                                }
                            }
                        }
   
                    }
                        
                    
                    if(hold.length == 0){ //  (lone component)
                        loneComponents.push(resistor);
                    } else if (hold.length == 1) {
                        invalidPixels.push(hold[0]);
                    }else { // hold is like [ 1, 2, 3, 4]
                        //either length 2 or greater
                        for (let index = 0; index < hold.length; ++index){
                            if (index <= 1){
                                validPixels.push(hold[index]);
                            } else {
                                invalidPixels.push(hold[index]);
                            }
                        }
                    }

                }
                

            }
        }
    }



    function findWirePixels() {
        let allPixels = document.querySelectorAll(".wirePixel");
        let arrayVersion = [];
        for (let i = 0; i < allPixels.length; ++i) {
            arrayVersion[i] = allPixels[i];
        }
        return arrayVersion;
    }
    function preparePixels(pixelArray) {
        console.log("entered preparePixels");
        sortByXThenY(pixelArray);
        //block by x (alphas)
        let [blockBoundsX, blockBoundsY] = blockBy("x", pixelArray, true);
        let store = blockByY(blockBoundsY);  // blockByY changes in place, returns deep copy of rects
        let newStore = correction(blockBoundsY, store);
        setAdjacent(newStore, blockBoundsY);
        if(stopFlag == "true"){
            return; 
        }
        let [nodeStore, openEndStore, singleStore] = groupNonNodes(pixelArray);
        addComponents(nodeStore, openEndStore, singleStore); // adds in place
        openEndStore = openEndStore.filter((element) => {
            return (element.length != 0);
        })
        singleStore.forEach((element) => {
            openEndStore.push(element);
        });
        let segmentStore = combineSegment(nodeStore, openEndStore, singleStore);
        let nodeSorted = sortNodeSegments(segmentStore);
        //visualization step, apply arrows for directions
        showCurrentDirections(nodeSorted);
        solveCircuit(nodeSorted);
        addTooltipsOnHover(allComponentsOnCanvas); // each component has its properties filled out
        submitFlag = true; 

        function addTooltipsOnHover(allComponentsOnCanvas){
            //resistors
            allComponentsOnCanvas[0].forEach((resistor)=>{
                let current = resistor.getAttribute("data-current");
                let resistance = resistor.getAttribute("data-resistance");
                let voltage = resistor.getAttribute("data-voltage");
                let circuitDiv = document.getElementById("circuitDivId");
                let circuitDivCoords = circuitDiv.getBoundingClientRect();
                let resistorCoords = resistor.getBoundingClientRect();
                let left = resistorCoords.left - circuitDivCoords.left;
                let top = resistorCoords.top - circuitDivCoords.top;
                makeTooltip(current, resistance, voltage, left, top);
            });

            //voltage source
            allComponentsOnCanvas[1].forEach((voltageSource)=>{/////////////////////
                let voltage = voltageSource.getAttribute("data-voltage");
                let circuitDiv = document.getElementById("circuitDivId");
                let circuitDivCoords = circuitDiv.getBoundingClientRect();
                let voltageSourceCoords = voltageSource.getBoundingClientRect();
                let left = voltageSourceCoords.left - circuitDivCoords.left;
                let top = voltageSourceCoords.top - circuitDivCoords.top;
                makeTooltip(null, null, voltage, left, top);
            });

            function makeTooltip(current, resistance, voltage, left, top){

                let parentDiv = document.querySelector("#tooltipHolder");
                let div = document.createElement('div');
                
                div.className = 'tooltip';
                div.style.left = String(left) + "px";
                div.style.top = String(top) + "px"; 
                parentDiv.appendChild(div);
                let span = document.createElement('span');
                
                if((resistance === null) || (current === null)){
                    span.innerHTML = "Voltage: " + Number(voltage).toFixed(2) + " V";

                }else{
                    span.innerHTML = "Current: " + Number(current).toFixed(2) + " A" + "<br />"+ "Resistance: "+ Number(resistance).toFixed(2) + " Ohms" + "<br />" + "Voltage: " + Number(voltage).toFixed(2) + " V";

                }
                span.className = 'tooltiptext';
                span.style.zIndex = 10002;
                div.appendChild(span);
            }
            
            
        }


        function showCurrentDirections(nodeSorted){
            ///single loop edge case:
            if(nodeSorted.length == 1){//single loop
                applyArrows(nodeSorted[0]);
            } else {
                console.log(nodeSorted);
                debugger;
                //has node cases:
                nodeSorted.forEach((nodeNumber)=>{
                    nodeNumber.forEach((nodeSegment)=>{
                        applyArrows(nodeSegment);
                    });
                });
    
            }

            function applyArrows(nodeSegment){
                let parcel; 
                for(let i = 0; i < nodeSegment.length; ++i){
                    let element = nodeSegment[i];
                    //first checks 
                    let elementClass = element.getAttribute("class");
                    if(elementClass != "componentImage_img" && elementClass != "component"){ // not possible by algorithm but just in case
                        if (i === 1){ // 0 is a node with multiple adjacent counts
                            let node = nodeSegment[0];
                            //if xoffset is negative (node - 1) then node is more left than 1 (lower x value)
                            //if yoffset is negative (node - 1) then node is higher up than 1 (lower y value)
                            let xOffset = Math.round(Number(node.getAttribute("x")) - Number(element.getAttribute('x')));
                            let yOffset = Math.round(Number(node.getAttribute("y")) - Number(element.getAttribute('y')));
                            //we assume they must be adjacent so one of x or y is constant
                            if (xOffset < 0) {
                                parcel = "left";
                            } else if (xOffset > 0) {
                                parcel = "right";
                            } else if (yOffset < 0) {
                                parcel = "top";
                
                            } else if (yOffset > 0){
                                parcel = "bottom";
                            }

                        }

                        if(i !== 0){
                            if(element.getAttribute("data-left") == "true" && parcel != "left"){//adj is not incoming
                                parcel = "right"; // for next element
                                //make image point left
                                makeCurrentArrow("left");

                            } else if(element.getAttribute("data-right") == "true" && parcel != "right"){//adj is not incoming
                                parcel = "left"; // for next element
                                //make image point right
                                makeCurrentArrow("right");
                            } else if(element.getAttribute("data-top") == "true" && parcel != "top"){//adj is not incoming
                                parcel = "bottom"; // for next element
                                //make image point top
                                makeCurrentArrow("top");
                            } else if(element.getAttribute("data-bottom") == "true" && parcel != "bottom"){//adj is not incoming
                                parcel = "top"; // for next element
                                //make image point bottom
                                makeCurrentArrow("bottom");
                            }
                        }
                        

                        function makeCurrentArrow(pointingDirection){

                            let rotateAngle;

                            if(pointingDirection == "left"){
                                rotateAngle = 180;
                            } else if(pointingDirection == "right"){
                                rotateAngle = 0;
                            } else if(pointingDirection == "top"){
                                rotateAngle = 270;
                            } else if(pointingDirection == "bottom"){
                                rotateAngle = 90;
                            } 


                            let img = document.createElement("img");
                            let mainCanvasCoords = document.getElementById("mainCanvas_svg").getBoundingClientRect();
                            let circuitDivCoords = document.getElementById("circuitDivId").getBoundingClientRect();
                            
                            let mainCanvasOffsetLeft = mainCanvasCoords.left - circuitDivCoords.left;
                            let mainCanvasOffsetTop = mainCanvasCoords.top - circuitDivCoords.top;
                            img.src = "images/arrowLeftToRight.png";
                            img.setAttribute("class", "currentImage_img");
                            img.setAttribute("style", "transform: rotate(" + rotateAngle + "deg)");

                            img.style.left = String(Number(element.getAttribute("x")) + Number(mainCanvasOffsetLeft)) + "px";
                            img.style.top = String(Number(element.getAttribute("y")) + Number(mainCanvasOffsetTop)) + "px";
                            img.style.zIndex = 10001;
                            img.style.opacity = "0.3";
                            document.getElementById("currentDirection").prepend(img);

                        }
                    }
                }
            }

            

        }
        

        function solveCircuit(nodeSorted){

            if (nodeSorted.length < 2){
                if (nodeSorted.length === 0){ // no valid loops
                    alert("no valid loops");
                    return null;
                } else { // just a single loop
                    solveSingleLoop(nodeSorted);
                    return true;
                }
            } else { //most cases with nodes
                let [nodeIndex, currentNumber] = setCurrentNumber(nodeSorted); // returns node number of node closest to VS
                let [permutationStore, loopStore] = getLoops(nodeSorted, nodeIndex);
    
                applyKirchov(loopStore, nodeSorted, currentNumber);
            }
            
            

            function solveSingleLoop(nodeSorted){
                //node sorted is [[elements in a loop]]
                //end to end node is voltage source (repeated)
                //just add all resistances and divide by the voltage
                //just directly assign current then call allocateVoltage
                let allResistors = allComponentsOnCanvas[0];
                let sumResistance = 0.0;
                let voltageValue = allComponentsOnCanvas[1][0].getAttribute("data-voltage");
                if (allResistors[0] != null){
                    allResistors.forEach((resistor) => { // for initial calculation of current
                        sumResistance += Number(resistor.getAttribute("data-resistance"));
                        
                    });
                    
                    let currentValue = voltageValue/sumResistance;
                    allResistors.forEach((resistor)=>{//for the assignment of currents to resistor (all the same if one loop)
                        resistor.setAttribute("data-current", currentValue);
                    });

                    allocateVoltages(allComponentsOnCanvas);
                }

            }
            ////currently wrong because it takes all components on canvas not just the ones in a loop 
            function allocateCurrents(allComponentsOnCanvas, currentResult){
                let allResistors = allComponentsOnCanvas[0]; // recall it is [0][1]
                if(allResistors[0] != null){
                    //i mean it cant really be null at this stage..
                    allResistors.forEach((resistor, index)=>{
                        let currIndex = parseInt(resistor.getAttribute("data-current-number"));
                        let correspondingCurrentValue = currentResult[currIndex];
                        resistor.setAttribute("data-current", correspondingCurrentValue);
                        //console.log("resistor number " + index + " has current of: " + resistor.getAttribute("data-current"));
                    });
                }
            }

            function allocateVoltages(allComponentsOnCanvas){
                let allResistors = allComponentsOnCanvas[0];
                if(allResistors[0] != null){
                    allResistors.forEach((resistor, index)=>{
                        let resistorCurrent = resistor.getAttribute("data-current");
                        let resistorResistance = resistor.getAttribute("data-resistance");
                        let resistorVoltage = Number(Number(resistorCurrent)*Number(resistorResistance));
                        resistor.setAttribute("data-voltage", resistorVoltage);
                       // console.log("resistor number " + index + " has voltage of: " + resistor.getAttribute("data-voltage"));
                    });
                }
            }

            function applyKirchov(loopStore, nodeSorted, numberCurrent){
                //note currentNumber is +1 to the largest index, but is 
                //equal to the length and number of current variants
                let equationStoreLHS = []; // i0 to 
                let equationStoreRHS = []; // constants
                initializeStores(loopStore.length, numberCurrent, equationStoreLHS, equationStoreRHS);
                applyKVL(loopStore, equationStoreLHS, equationStoreRHS);
                
                applyKCL(nodeSorted, numberCurrent, equationStoreLHS, equationStoreRHS);
                
                let currentResult;
                if(isShortCircuited(equationStoreLHS)){
                    alert("this configuration is short circuited!!");
                } else {
                    currentResult = solveForCurrent(equationStoreLHS, equationStoreRHS);
                }
                
                allocateCurrents(allComponentsOnCanvas, currentResult);
                allocateVoltages(allComponentsOnCanvas);
                
                

                function solveForCurrent(equationStoreLHS, equationStoreRHS){
                    let inverseLHS;
                    let result;
                    //if there are more rows than columns, just take note that could solve extra
                    //then just take last row off // over defined
                    let numberRows = equationStoreLHS.length;
                    let numberColumns = equationStoreLHS[0].length; // since column number same
                   // console.log("numberRows: " + numberRows);
                   // console.log("numberColumns: " + numberColumns);
                    let finalMatrixLHS = [];
                    let finalMatrixRHS = [];
                    if(numberRows > numberColumns){
                        //copy into finalMatrix except for last....? no calculate
                        let difference = numberRows - numberColumns;
                        let finalIndex = (numberRows - difference); //starts from 0
                        for(let rowIndex = 0; rowIndex < finalIndex; ++rowIndex){
                            finalMatrixLHS.push(equationStoreLHS[rowIndex]);
                            finalMatrixRHS.push(equationStoreRHS[rowIndex]);
                        }

                    } else if (numberRows == numberColumns){
                        finalMatrixLHS = equationStoreLHS;
                        finalMatrixRHS = equationStoreRHS;
                    }
                    
                    try{
                        inverseLHS = math.inv(finalMatrixLHS);
                        result = math.multiply(inverseLHS, finalMatrixRHS);
                    } catch (e){
                        alert("Failed to find inverse and solve: " + e.message);
                    }
                    //console.log("result: ");
                   // console.log(result);// result is by current number order
                    return result;
                }

                function isShortCircuited(equationStoreLHS){
                    let state = false;
                    for (let equationSet = 0; equationSet < equationStoreLHS.length; ++equationSet){
                        if (equationStoreLHS[equationSet].every((coefficient)=>{
                            return (coefficient == 0);
                        })) {
                            state = true;
                            break;
                        }
                    }
                    return state;
                }

                function applyKCL(nodeSorted, numberCurrent, equationStoreLHS, equationStoreRHS){
                    //recall nodeSorted is [[node1], [node2]]// and [[[L], [R]], [[L]]]
                    //just take first of first for each section (each node)
                    let dependentCheck = [];
                    nodeSorted.forEach((nodeNumber)=>{
                        console.log("nodeNumber: ");
                        console.log(nodeNumber);
                        console.log("nodeNumber[0][0]");
                        console.log(nodeNumber[0][0]);
                        console.log("nodeNumber datacurrentKCL: ");
                        console.log(nodeNumber[0][0].getAttribute("data-current-KCL"));
                        let intermediateLinks = nodeNumber[0][0].getAttribute("data-current-KCL");
                        console.log(intermediateLinks);
                        console.log(typeof(intermediateLinks));
                        console.log(intermediateLinks.split("_"));
                        let numbersLinks = String(intermediateLinks).split("_");
                        console.log(numbersLinks);//should be 3 numbers but might be 0, -0, -3 etc
                        let interimStore = [];
                        for(let index = 0; index < numberCurrent; ++index){
                            interimStore.push(0);
                        } // just initializing the store
                        
                        numbersLinks.forEach((currentNumber)=>{
                            console.log("CurrentNumber: " + currentNumber);
                            let indexInterim = parseInt(currentNumber);
                            if(indexInterim < 0){
                                indexInterim *= -1; 
                            }
                            console.log("indexInterim: " + indexInterim);
                            if(currentNumber.includes("-")){
                                console.log("includes a -");
                                interimStore[indexInterim] = -1;
                            } else {
                                console.log("no - ");
                                interimStore[indexInterim] = 1;
                            }
                        });
                        
                        //check if is a dependent equation

                        let [isDependentEquation, dependentIndexStore] = checkDependency(dependentCheck, interimStore);

                        if(!isDependentEquation){
                            equationStoreLHS.push(interimStore);
                            equationStoreRHS.push(0);
                        }
                        interimStore = []; 

                        
                    });
                    
                    function checkDependency(dependentCheck, interimStore){
                        console.log("interimStore: ");
                        console.log(interimStore);
                        console.log("dependentCheck: ");
                        console.log(dependentCheck);

                        if(dependentCheck.length == 0){
                            dependentCheck.push(interimStore);
                            return [false, null];
                        }
                        //dependentCheck is  [[1,1,1], [1,1,1],...] etc
                        
                        let isDependent; 
                        let isDependentStoreIndex = [];
                        dependentCheck.forEach((equationSet, setIndex)=>{
                            isDependent = true;
                            let firstReference = equationSet[0]/interimStore[0];
                            equationSet.forEach((coefficient, index)=>{
                                let interimCoefficient = interimStore[index];
                                let reference;
                                if((coefficient != 0) && (interimCoefficient != 0)){
                                    reference = coefficient/interimCoefficient;
                                    if(reference != firstReference){
                                        //console.log("reference != firstReference");
                                        //console.log("reference: " + reference + " firstReference: " + firstReference);
                                        isDependent = false; 
                                    }
                                } else if ((coefficient == 0) && (interimCoefficient == 0)){
                                    //if both are zero.... continue
                                } else if (((coefficient == 0) && (interimCoefficient != 0))
                                    || ((coefficient != 0) && (interimCoefficient == 0))){
                                     //if one is zero and the other is not zero
                                     //console.log("one is zero the other is not zero");
                                     isDependent = false;    
                                }
                                
                            });

                            if(isDependent){
                                //console.log("is dependent, push to index store");
                                isDependentStoreIndex.push(setIndex);
                            }
                        });
                        console.log(isDependentStoreIndex);
                        if(isDependentStoreIndex.length != 0){
                            //console.log("interimStore is dependent with archive");
                            return [true, isDependentStoreIndex]; 
                        } else {
                            //console.log("interimStore independent with archive");
                            dependentCheck.push(interimStore);
                            return [false, null];
                        }
                        
                    }

                }

                function applyKVL(loopStore, equationStoreLHS, equationStoreRHS){
                    for (let loopBranchIndex = 0; loopBranchIndex < loopStore.length; ++loopBranchIndex){
                        console.log(loopStore[loopBranchIndex].length);
                        for (let branchElementIndex = 0; branchElementIndex < loopStore[loopBranchIndex].length; ++branchElementIndex){
                            let currentElement = loopStore[loopBranchIndex][branchElementIndex];
                            let currentElementClass = currentElement.getAttribute("class");
                            if(currentElementClass == "componentImage_img"){
                                let currentComponentName = currentElement.getAttribute("data-component-name");
                                let currentNumber = Number(currentElement.getAttribute("data-current-number"));
                                if(currentComponentName == "voltageSource"){
                                    //store to RHS
                                    let voltage = Number(currentElement.getAttribute("data-voltage"));
                                    equationStoreRHS[loopBranchIndex] = voltage; // rhs but negative on lhs
                                } else if (currentComponentName == "resistor"){
                                    //store to LHS
                                    let resistance = Number(currentElement.getAttribute("data-resistance"));
                                    if(equationStoreLHS[loopBranchIndex][currentNumber] == 0){
                                        console.log("slot==0")
                                        equationStoreLHS[loopBranchIndex][currentNumber] = resistance;
                                    }else{
                                        equationStoreLHS[loopBranchIndex][currentNumber] += resistance;
                                    }
                                }
                            }
                        }

                    }
                }

                function initializeStores(numberLoops, numberCurrent, equationStoreLHS, equationStoreRHS){
                    //LHS store as store[current][loop]
                    //RHS is just one column downwards ie store[loop]
                    //we could store as 1-d but no lets go 2-d
                    let currentHold = [];
                    for (let loopIndex = 0; loopIndex < numberLoops; ++loopIndex){
                        for (let currentIndex = 0; currentIndex < numberCurrent; ++currentIndex){
                            currentHold.push(0);
                        }
                        equationStoreLHS.push(currentHold);
                        equationStoreRHS.push(0);
                        currentHold = [];
                    }
                }
            }

            function setCurrentNumber(nodeSorted){
                let branchWithVS = null; 
                let currentNumber = 0;
                nodeSorted.forEach((nodeNumber)=>{
                    nodeNumber.forEach((nodeBranch)=>{
                        
                        nodeBranch.forEach((element, index)=>{
                            if(element.getAttribute("class") == "componentImage_img"){
                                if(element.getAttribute("data-component-name") == "voltageSource"){
                                    branchWithVS = nodeBranch; // remember this is a pointer
                                }
                            } else if (element.getAttribute("class") == "node"){
                                let currentTemp = currentNumber; // apparently not a pointer since single value?
                                if(index == 0){ // need to make into string because of 0! -0?
                                    currentTemp = "-" + currentTemp; // if start of branch means its outgoing
                                }//define ingoing (ie last of branch) as positiv
                                if(element.getAttribute("data-current-KCL") == "null"){
                                    element.setAttribute("data-current-KCL", currentTemp);
                                } else {
                                    let existingCurrentNumbers = element.getAttribute("data-current-KCL");
                                    existingCurrentNumbers = existingCurrentNumbers + "_" + currentTemp;
                                    element.setAttribute("data-current-KCL", existingCurrentNumbers); 
                                }
                            } 
                            element.setAttribute("data-current-number", currentNumber);
                        });
                   
                    ++currentNumber; 
                    });
                });

                let nodeIndex;
                if(branchWithVS != null){
                    nodeIndex = findClosestNodeToVS(branchWithVS);
                    return [nodeIndex, currentNumber];
                } else {
                    return [null, null]; // ie no voltage source
                }

            
                function findClosestNodeToVS(branchWithVS){
                    let nodeIndex;
                    let fromStartCount = 0;
                    let toEndCount = 0;
                    let state = false; 

                    for(let index = 0; index < branchWithVS.length; ++index){
                        let currentElement = branchWithVS[index];
                        if(currentElement.getAttribute("class") == "componentImage_img"){
                            if(currentElement.getAttribute("data-component-name") == "voltageSource"){
                                state = true;
                                continue; // dont count the VS, so for 5 can end 2 2 
                            }
                        }

                        if(state){
                            //if state is true then activate toEndCount;
                            ++toEndCount;
                        } else {
                            ++fromStartCount;
                        }
                    }
                   
                    index = getCloserNode(fromStartCount, toEndCount);
                    
                    nodeIndex = branchWithVS[index].getAttribute("data-node-number");
                    return nodeIndex;


                    function getCloserNode(fromStartCount, toEndCount){
                        let nodeIndex;
                        if(fromStartCount == toEndCount){
                            //just choose either first or last
                            //wtv
                            nodeIndex = 0;
                        }else if (fromStartCount < toEndCount){
                            nodeIndex = 0;

                        }else if (fromStartCount > toEndCount){
                            nodeIndex = (fromStartCount + toEndCount); // minus 1 right
                            //equals the end of the array
                        }
                        return nodeIndex;
                    }

                }

            }
            


            

        }
        function sortNodeSegments(segmentStore){
            if(segmentStore.length < 2){
                //console.log("full loop"); 
                return segmentStore;
            } else {
                //node-to-nodes [node# (parent, first node) 0 1 2 3....]
                //sort by node count array [[child1, child2], [child1, child2]....]
                let nodeSorted = [];
                let remainingSegments = [];
                //initialize nodeSorted
                for (let nodeIndex = 0; nodeIndex < (globalNodeCount); ++nodeIndex){
                    nodeSorted.push([]);
                }
               

                for(let segmentIndex = 0; segmentIndex < segmentStore.length; ++segmentIndex){
                    let currentBranch = segmentStore[segmentIndex];
                    
                    let currentParentNodeNumber = currentBranch[0].getAttribute("data-node-number");
                    if(nodeSorted[currentParentNodeNumber]){
                        if(nodeSorted[currentParentNodeNumber].length == 2){
                            currentBranch.reverse();
                            remainingSegments.push(currentBranch);
                            continue;
                        }else {
                            nodeSorted[currentParentNodeNumber].push(currentBranch);
                        }
                    }
                    else{
                        nodeSorted[currentParentNodeNumber].push(currentBranch);
                    }
                }
                
                
                if(remainingSegments.length > 0){
                    console.log('resorting reversed segments');
                    
                    let segmentLimit = remainingSegments.length; 
                    for (let segmentIndex = 0; segmentIndex < remainingSegments.length; ++segmentIndex){
                        let currentBranch = remainingSegments[segmentIndex];
                        let currentParentNodeNumber = currentBranch[0].getAttribute("data-node-number");
                        if(nodeSorted[currentParentNodeNumber].length == 2){//for 3node
                            //both reverse and non are blocked
                           
                            let firstBranch = nodeSorted[currentParentNodeNumber].shift();
                            firstBranch.reverse();
                            remainingSegments.push(firstBranch);
                            nodeSorted[currentParentNodeNumber].push(currentBranch);
                            
                            segmentLimit = remainingSegments.length; // accommodate for increased branch

                        }else{
                            nodeSorted[currentParentNodeNumber].push(currentBranch);
                        }
                    }
                }
                //now the problem is that there are all that are all childs no parents
                //find the nodeSorted with [] ie length == 0
                //look at ends of each nodeSorted, get number
                //check that array is length ==2 (if ==1 move to next)
                //reverse and move that one into the empty array
                //n

                
                let emptyNumbers = [];
                nodeSorted.forEach((element, index)=>{
                    if(element.length == 0){
                        emptyNumbers.push(index);
                    }
                });

                if(emptyNumbers.length != 0){
                    //emptyNumbers is an array of the nodeSorted index with []
                    console.log("emptyNumbers.length != 0");
                    for (let emptyIndex = 0; emptyIndex < emptyNumbers.length; ++emptyIndex){
                        let indexNumber = emptyNumbers[emptyIndex];
                        for(let nodeIndex = 0; nodeIndex < nodeSorted.length; ++nodeIndex){
                            if((nodeSorted[nodeIndex].length == 2)){
                                let breakState = false;
                                for(let branchIndex = 0; branchIndex < nodeSorted[nodeIndex].length; ++branchIndex){
                                    let currentBranch = nodeSorted[nodeIndex][branchIndex];
                                    let child = currentBranch[currentBranch.length-1];
                                    let childNodeIndex = child.getAttribute("data-node-number");
                                    if(childNodeIndex == indexNumber){
                                        //we have a length == 2 node parent and amatching child node
                                        currentBranch.reverse();//currentbranch is just a pointer remember
                                        let removedBranch = nodeSorted[nodeIndex].splice(branchIndex,1);
                                        //removedBranch is the actual branch in nodeStore
                                        
                                        nodeSorted[Number(emptyNumbers[emptyIndex])].push(removedBranch[0]);
                                        
                                        breakState = true;
                                        break; // breaks to node index loop... 
                                    }
                                }
                             
                                if(breakState){
                                    break; // breaks to empty index... 
                                }
                            }
                        }
                    }
                }

                return nodeSorted;
            }  

        }
        

        function getLoops(nodeSorted, startingNodeIndex){
            let permutationStore = [];
            let branchStore = [];
            if(nodeSorted.length >= 2){
                enterNode(startingNodeIndex, null, null,permutationStore, branchStore);
            } else {
                return null;
            }
            
            return [permutationStore, branchStore];

            function enterNode(nodeIndex, history, historyBranch, permutationStore, branchStore){
                if(history == null){
                    history = [nodeIndex];
                }
                if(historyBranch == null){
                    historyBranch = [];
                }
                let [leftBranchIndex, leftBranch] = findLeft();
                let [rightBranchIndex, rightBranch] = findRight();
    
                let [leftHistory, leftHistoryBranch] = makeLeftHistory();
                let [rightHistory, rightHistoryBranch] = makeRightHistory();
                
                if(checkLeftState()){
                    
                    permutationStore.push(leftHistory);
                    branchStore.push(leftHistoryBranch);
                    leftBranchIndex = null;
                }
    
                if(checkRightState()){
                   
                    permutationStore.push(rightHistory);
                    branchStore.push(rightHistoryBranch);
                    rightBranchIndex = null;
                }
                
            
    
                if(leftBranchIndex != null){
                    enterNode(leftBranchIndex, leftHistory, leftHistoryBranch, permutationStore, branchStore);
                }
    
                if(rightBranchIndex != null){
                    enterNode(rightBranchIndex, rightHistory, rightHistoryBranch, permutationStore, branchStore);
                }
    
    
                function checkRightState(){
                    //there is a more efficient way but wtv
                    let rightBreak = false;
    
                    if(rightHistory != null){
                        let newest = rightHistory[rightHistory.length-1];
                        
                        rightBreak = rightHistory.some((element, index)=>{
                            if (index != (rightHistory.length-1)){
                                
                                return (element == newest);
                            }
                        });
                        return rightBreak; 
                    }
                    return rightBreak;
                }
    
                function checkLeftState(){
                    //there is a more efficient way but wtv
                    let leftBreak = false;
    
                    if(leftHistory != null){
                        let newest = leftHistory[leftHistory.length-1];
    
                        leftBreak = leftHistory.some((element,index)=>{
                            if (index != (leftHistory.length-1)){
                                
                                return (element == newest);
                            }
                        });
                        return leftBreak; 
                    }
                    return leftBreak;
                }
    
                function makeRightHistory(){
                    let rightHistory = []; // need new array because need a copy
                    let rightHistoryBranch = [];
                    if(history != null){ // should be caught by first if
                       if(rightBranchIndex != null){
                        history.forEach((element)=>{
                            rightHistory.push(element);
                        });
                        rightHistory.push(rightBranchIndex);
                        
                        historyBranch.forEach((element)=>{
                            rightHistoryBranch.push(element);
                        });

                        rightBranch.forEach((element)=>{
                            rightHistoryBranch.push(element);
                        });

                       }  
                    }else{
                        rightHistory = null;
                        rightHistoryBranch = null;
                    }
    
                    return [rightHistory, rightHistoryBranch];
                }
    
                function makeLeftHistory(){
                    let leftHistory = []; // need new array because need a copy
                    let leftHistoryBranch = [];
                    if(history != null){ // should be caught by first if
                        history.forEach((element)=>{
                            leftHistory.push(element);
                        });
                        leftHistory.push(leftBranchIndex);

                        historyBranch.forEach((element)=>{
                            leftHistoryBranch.push(element);
                        });

                        leftBranch.forEach((element)=>{
                            leftHistoryBranch.push(element);
                        });

                    } else {
                        leftHistory = null;
                        leftHistoryBranch = null;
                    }
    
                    return [leftHistory, leftHistoryBranch];
                }
                
                function findRight(){
                    if(nodeSorted[nodeIndex].length == 2){
                        let currentBranch = nodeSorted[nodeIndex][1];
                        return [Number(currentBranch[currentBranch.length-1]
                            .getAttribute("data-node-number")), currentBranch];
                    } else if (nodeSorted[nodeIndex].length <= 1){
                        return [null,null]; 
                    }
                }
                
                function findLeft(){
                    if(nodeSorted[nodeIndex].length >= 1){
                        let currentBranch = nodeSorted[nodeIndex][0];
                        return [Number(currentBranch[currentBranch.length-1]
                            .getAttribute("data-node-number")), currentBranch];
                    } else {
                        return [null,null];
                    }
                }
    
    
            }
        }
        
    }

    function combineSegment(nodeStore, openEndStore, singleStore) {
        
        let segmentStore = []; // this stores all node to node , if length =0 at end, means no nodes
       
        let intermediateMap = {};
        

        if((nodeStore.length >= 1) && ((openEndStore.length >= 1) || (singleStore.length >= 1))){
           
            let valueArrayPrev = [];
            let valueArrayCurr = openEndStore;
            count = 0;
            while ((valueArrayCurr.length != valueArrayPrev.length) && (count < 22)) {
                valueArrayPrev = valueArrayCurr;
                valueArrayCurr = combineToSingleLoop(valueArrayPrev); // new array already has reveresed bits inside 
               
                ++count;
            } 

            valueArrayPrev = valueArrayCurr;
            valueArrayCurr = combineToSingleLoop(valueArrayPrev);

            //so now valueArrayCurr is all the middlebits
            let middleBits = valueArrayCurr;
            
            let firstMap = {};
            let buildArray = [];
            let [remainingNodes, combinedBits] = mappingTopId(firstMap, buildArray, nodeStore, middleBits, true);
            
            let secondMap = {};
            let secondBuildArray = [];
            let [remainingNodes2, combinedBits2] = mappingTopId(secondMap, secondBuildArray, remainingNodes, combinedBits, false);
            
            segmentStore = combinedBits2; 


            function mappingTopId(map, buildArray, nodeStore, middleBits, isFirst){
                console.log("mappingTopId");
                middleBits.map((element)=>{
                    buildArray.push(element);
                });
                if(isFirst){
                    nodeStore.map((element)=>{
                        element.map((subElement)=>{
                            buildArray.push(subElement);
                        })
                    });
                } else {
                    nodeStore.map((element)=>{
                        buildArray.push(element);
                    });
                }
               
               
                let remainingNodes = [];
                let combinedBits =  [];
                for (let buildIndex = 0; buildIndex < buildArray.length; ++buildIndex){
                    let currentBranch = buildArray[buildIndex];
                    let firstCurrentBranch = currentBranch[0];
                    let lastCurrentBranch = currentBranch[currentBranch.length-1];
                   
                    //if not a component --> node to node;
                    if((firstCurrentBranch.getAttribute("class") == "node")
                    &&(lastCurrentBranch.getAttribute("class") == "node")){
                        //push straight to combined bits, no need for map
                        combinedBits.push(currentBranch);
                        continue;
                    }

                    let key1 = lastCurrentBranch.id;
                    if(key1 in map){
                        //console.log("key1 is in map");
                        let existing = map[key1];
                        currentBranch.pop();
                        currentBranch.reverse();
                        let newAppended = existing;
                        currentBranch.map((element) => {
                            newAppended.push(element);
                        });
                        map[key1] = newAppended; // same key

                    }else{
                        //console.log("key1 is not in map");
                        //not yet in map then add middleBit....
                        if ((firstCurrentBranch.getAttribute("class")=="componentImage_img")
                         && (isFirst)){ //check if it is a double component or a node component
                            //only for first, cause if not first then first of input is a node
                            console.log("assigning key1 to new entry in map");
                            map[key1] = currentBranch;//if it is the first run and is a double comp
                            //but not stored then store as new entry (should be double comp)
                            
                         }else if (isFirst && (firstCurrentBranch.getAttribute("class") == "node") ){
                            //This is if it is the first run, key1 not in map
                            // and first element is a node (ie node - component)
                            //so need to store into returned array
                            remainingNodes.push(currentBranch);
                            continue; // after store just move to next branch

                         } else if (!isFirst && (firstCurrentBranch.getAttribute("class") == "node")) {
                             //this is if key1 not in map and in second run and first is node
                             //ie this is a flipped half complete node-node
                             //need to just put into map with key as last element component id
                             console.log("assigning key1 to new entry in map");
                             map[key1] = currentBranch; 
                         } 
                    }
                    

                }
                
                
                for (key in map) {
                    if (map[key] != null) {
                        combinedBits.push(map[key].reverse()); // flip return for use 
                    }
                }
                return [remainingNodes, combinedBits];
            
            }
        


        } else if ((nodeStore.length >= 1) && (openEndStore.length < 1) && (singleStore.length < 1)) {
            for (let nodeIndex = 0; nodeIndex < nodeStore.length; ++nodeIndex) {
                for (let nodeBranch = 0; nodeBranch < nodeStore[nodeIndex].length; ++nodeBranch) {
                    //now this layer is per branch, 
                    let currentBranch = nodeStore[nodeIndex][nodeBranch];
                    let currentBranchEnd = currentBranch[currentBranch.length - 1];
                    if (currentBranchEnd.getAttribute("class") == "componentImage_img") {
                        
                        let newKey = currentBranchEnd.id;
                        if (newKey in intermediateMap) {
                            //now merge...
                            let existingBranch = intermediateMap[newKey];
                            currentBranch.pop(); // get rid of duplicate comp
                            currentBranch.reverse().map(element => {
                                existingBranch.push(element);
                            }); // push element not array
                            segmentStore.push(existingBranch);
                            //also delete since only possible for 2
                            delete intermediateMap[newKey];
                            //repeated branch never stored

                        } else {
                            console.log("newKey not in intermediateMap, adding");
                            intermediateMap[newKey] = currentBranch;
                           
                        }

                    } else if (currentBranchEnd.getAttribute("class") == "node") {
                        //if it is a node-node branch just push it immediately to final store and continue
                        segmentStore.push(currentBranch);
                        continue;
                    } else {
                        //if it is a node to nothing/wirePixel ie invalid
                        console.log("invalid branch");
                    }

                }
            }
        } else if (nodeStore.length == 0) {
            //is a single loop..., search between open ends and singles only
            console.log('no nodes, single loop');
            

            let valueArrayPrev = [];
            let valueArrayCurr = openEndStore;
            count = 0;
            while ((valueArrayCurr.length != valueArrayPrev.length) && (count < 10)) {
                valueArrayPrev = valueArrayCurr;
                valueArrayCurr = combineToSingleLoop(valueArrayPrev);
                
                ++count;
            }

            //results in array([top][bottom]) // ie length 2
            let singleLoop;
            singleLoop = valueArrayCurr[0];
            if (valueArrayCurr.length > 1) {
                let intermediateLoop = valueArrayCurr[1].reverse();
                intermediateLoop.shift();
                intermediateLoop.map((element) => {
                    singleLoop.push(element);
                });
            }


            segmentStore = [singleLoop];

        }

        return segmentStore;


        function combineToSingleLoop(valueArray) {
            let mapTop = {};
            let mapBottom = {};
    
            for (let accessIndex = 0; accessIndex < valueArray.length; ++accessIndex) {
                let currentString = valueArray[accessIndex]; // this means node with comp sides
                let currentFirst = valueArray[accessIndex][0];
                let currentLast = valueArray[accessIndex][valueArray[accessIndex].length - 1];
                
               
                let key1 = currentFirst.id;
                let key2 = currentLast.id;
                
                if (key1 in mapTop) {
                    console.log('so currentFirst matches existingFirst');
    
                    let existing = mapTop[key1]
                    currentString.shift(); // get rid of first component
                    let newPrepended = existing;
                    currentString.map((element) => {
                        newPrepended.unshift(element);
                    });
                    mapTop[key2] = newPrepended; // make new
                    delete mapTop[key1]; // delete old 
    
                } else if (key1 in mapBottom) {
                    console.log('so currentFirst matches  existingLast');
                    if (mapBottom[key1] == null) {
                        console.log("current match is null");
                        mapBottom[key2] = currentString;
                        delete mapBottom[key1];
                    } else {
                        console.log("current match not null");
                        
                        let existing = mapBottom[key1];
                        currentString.shift(); // remove first  of current
                        let newAppended = existing;
                        currentString.map((element) => {
                            newAppended.push(element);
                        });
                        mapBottom[key2] = newAppended;
                        delete mapBottom[key1];
                    }  
    
                } else if (key2 in mapTop) {
                    console.log('so currentLast matches existingFirst');
                    let existing = mapTop[key2];
                    currentString.pop();
                    currentString.reverse();
                    let newPrepended = existing;
                    currentString.map((element) => {
                        newPrepended.unshift(element);
                    });
                    mapTop[key1] = newPrepended;
                    delete mapTop[key2];
    
                } else if (key2 in mapBottom) {
                    console.log('so currentLast matches existingLast');
                    if (mapBottom[key2] == null) {
                        mapBottom[key1] = currentString.reverse();
                        delete mapBottom[key2];
                    } else {
                        //something exists
                        console.log("current match not null");
                        let existing = mapBottom[key2];
                        currentString.pop();
                        currentString.reverse();
                        let newAppended = existing;
                        currentString.map((element) => {
                            newAppended.push(element);
                        });
                        mapBottom[key1] = newAppended;
                        delete mapBottom[key2];
                    }
    
                } else {
                    //both components not present yet
                    console.log("newkey and value set");
                    mapTop[key1] = currentString;
                    mapBottom[key2] = null;
    
                }
    
            }
    
            let mapArray = [];
            for (key in mapTop) {
                if (mapTop[key] != null) {
                    mapArray.push(mapTop[key].reverse());
                }
            }
            for (key in mapBottom) {
                if (mapBottom[key] != null) {
                    mapArray.push(mapBottom[key]); // flip bottom or top....
                }
            }
    
            return mapArray;
        }


    }

    

    function addComponents(nodeStore, openEndStore, singleStore) {
        
        for (let openIndex = 0; openIndex < openEndStore.length; ++openIndex) {
            if (openEndStore[openIndex] != "") {
                //get first element 
                let adjCompFirst = findComponentAdj(openEndStore[openIndex][0], allComponentsOnCanvas, false);
                if (adjCompFirst != null) {
                   
                    openEndStore[openIndex].unshift(adjCompFirst);
                }
                //get last element
                let adjCompLast = findComponentAdj(openEndStore[openIndex][(openEndStore[openIndex].length - 1)], allComponentsOnCanvas, false);
                if (adjCompLast != null) {
                    
                    openEndStore[openIndex].push(adjCompLast);
                }

            } else {
                console.log("empty openEnd array");
            }

        }
        //singles
        for (let singleIndex = 0; singleIndex < singleStore.length; ++singleIndex) {
            let adjArray = findComponentAdj(singleStore[singleIndex][0], allComponentsOnCanvas, true);
           
            if (adjArray.length != 2) {
                console.log("invalid single");
            } else {
                singleStore[singleIndex].unshift(adjArray[0]);
                singleStore[singleIndex].push(adjArray[1]);
            }

        }
        //nodes
        for (let nodeSelect = 0; nodeSelect < nodeStore.length; ++nodeSelect) {
            for (let nodeBranch = 0; nodeBranch < nodeStore[nodeSelect].length; ++nodeBranch) {
                let thisBranch = nodeStore[nodeSelect][nodeBranch];
                if ((thisBranch[0].getAttribute("class") == "node")
                    && (thisBranch[thisBranch.length - 1].getAttribute("class") == "node")) {
                    //if both ends are nodes
                    continue; //move to next branch
                } else {
                    //first element always the node
                    let adjNodeComp = findComponentAdj(thisBranch[thisBranch.length - 1], allComponentsOnCanvas, false);
                    if (adjNodeComp != null) {
                        thisBranch.push(adjNodeComp);
                    } else {
                        console.log("no component to end of node pixel...");
                        console.log(thisBranch[thisBranch.length - 1]);
                    }
                }
            }
        }

        function findComponentAdj(pixel, componentList, storeMultiple) {
            
            console.log("entered checkComponentAdj");
            //cycle through all components on canvas
            let pixelX = Number(pixel.getAttribute("data-grid-X"));
            let pixelY = Number(pixel.getAttribute("data-grid-Y"));
            let multipleImageStore = [];
            for (let componentIndex = 0; componentIndex < componentList.length; ++componentIndex) {
                for (let elementIndex = 0; elementIndex < componentList[componentIndex].length; ++elementIndex) {
                    let currentElement = componentList[componentIndex][elementIndex];
                   
                    let imageX = Number(currentElement.getAttribute("data-canvas-x")) / (pixelDimension);
                    let imageY = Number(currentElement.getAttribute("data-canvas-top")) / (pixelDimension);
                    

                    let xInBounds, yInBounds, isCorner;
                    xInBounds = checkInBounds(currentElement, pixelX, imageX);
                    yInBounds = checkInBounds(currentElement, pixelY, imageY);
                    
                    isCorner = checkCorners(currentElement, pixelX, pixelY, imageX, imageY);
                    if (xInBounds && yInBounds && !isCorner) {
                        if (storeMultiple) {
                            multipleImageStore.push(currentElement);
                        } else {
                            return currentElement;
                        }

                    }
                }
            }
            if (storeMultiple) {
                if (multipleImageStore.length == 2) {
                    return multipleImageStore;
                }
            } else {
                console.log("pixel not adj to any image")
                return null;
            }

            function checkCorners(image, pixelX, pixelY, imageX, imageY) {
                let imageWidth = image.width;
                let upperAdd = Math.round(Number(imageWidth) / pixelDimension);
                let topLeftX = imageX - 1;
                let topLeftY = imageY - 1;

                let topRightX = (imageX + upperAdd);
                let topRightY = (imageY - 1);

                let bottomLeftX = (imageX - 1);
                let bottomLeftY = (imageY + upperAdd);

                let bottomRightX = (imageX + upperAdd);
                let bottomRightY = (imageY + upperAdd);

                let isCorner;
                if ((pixelX == topLeftX) && (pixelY == topLeftY)) {
                    isCorner = true;
                } else if ((pixelX == topRightX) && (pixelY == topRightY)) {
                    isCorner = true;
                } else if ((pixelX == bottomLeftX) && (pixelY == bottomLeftY)) {
                    isCorner = true;
                } else if ((pixelX == bottomRightX) && (pixelY == bottomRightY)) {
                    isCorner = true;
                } else {
                    isCorner = false;
                }

                return isCorner;

            }



            function checkInBounds(image, pixelVar, imageVar) {
                console.log("entered checkInBounds");
                let imageWidth = image.width;
                console.log(imageWidth);
                let upperAdd = Math.round(Number(imageWidth) / pixelDimension);
                if (pixelVar >= (imageVar - 1) && (pixelVar <= (imageVar + upperAdd))) {
                    console.log("checkInBounds: returned true");
                    return true;
                } else {
                    return false;
                }
            }

        }
    }

    function groupNonNodes(pixelArray) {

        let nodeStore = [];
        let openEndStore = [];
        let singleStore = [];
        // do nodes first
        if (document.querySelectorAll(".node").length > 0) {
            console.log("nodelist.length > 0");
            

            let allNodes = document.querySelectorAll(".node");
            // store objects in nodeStore, follows same 
            //node sequence as allNodes. 
            let elementStore = []; // [[top], [bottom], [left], [right]]
            let currentStore = []; //for top bottom etc. 
            for (let nodeIndex = 0; nodeIndex < allNodes.length; ++nodeIndex) {
                let current = allNodes[nodeIndex]; // first node later for loop
                directions = ["top", "bottom", "left", "right"];
                for (let index = 0; index < directions.length; ++index) {
                    currentStore.push(current); // first element is always the main node
                    let tempString = "data-" + directions[index];
                    let direction = current.getAttribute(tempString);
                    //returns true or false in one of the directions
                    //direction is valid, check and start progression
                    if ((direction == "true")) {
                        
                        //get next element in direction
                        let [nextElement, inDirection] = findCorrespondingElement(current, directions[index], false);
                        if (nextElement.getAttribute("data-stored") == "true") {
                            console.log('entered already stored');
                            // if element in that direction already stored
                            // move on to next available 
                            if (currentStore.length > 1) { elementStore.push(currentStore) }; // not true, size will just be 1 ie only node
                            currentStore = [];
                            continue;
                        } else {
                            console.log("entered not stored before");
                            // if not stored before then keep storing until returns null
                            // returns null when hits adj count != 2 ie 1 or >2
                            let count = 0;
                            while (true) {
                                if (count == 0) {
                                    nextElement.setAttribute("data-stored", true);
                                }
                                if (nextElement != null) {
                                    currentStore.push(nextElement);
                                }
                                ///storing elements....
                                if (nextElement == null || count > 30) {
                                    console.log("breaking from while loop");
                                    if (currentStore.length > 1) { elementStore.push(currentStore) };
                                    currentStore = [];
                                    break;
                                }
                                //the current element is one from the node by definition
                                currentElement = nextElement;
                               
                                [nextElement, inDirection] = getNext(currentElement, inDirection)
                                //so above actually new inDirection
                                ++count;
                            }
                        }
                    } else {
                        if (currentStore.length > 1) { elementStore.push(currentStore) }; // not true, size will just be 1 ie only node
                        currentStore = [];
                    }
                }
                nodeStore.push(elementStore); // size will just be nodeIndex
                elementStore = [];
            }
            //make first from node attribute nod-stored  = true;
        }

        let openEnds = document.querySelectorAll('[data-adjacent-count="1"][data-stored="false"]');
        //then do open ends, could make code into function...., abstract away storing
        let currentEndStore = []; // in order of openEnds
        //if everything already stored (other end) just store first pixel
        if (openEnds.length > 0) { // i dont see how there can be a valid circuit with no open ends
            for (let openIndex = 0; openIndex < openEnds.length; ++openIndex) {
                let current = openEnds[openIndex];
                directions = ["top", "bottom", "left", "right"];
                for (let index = 0; index < directions.length; ++index) {
                    let tempString = "data-" + directions[index];
                    let direction = current.getAttribute(tempString);
                    //returns true or false in one of the directions
                    //direction is valid, check and start progression
                    if ((direction == "true")) {
                        //get next element in direction
                        //currentEndStore.push(current); // always have end in question
                        let [nextElement, inDirection] = findCorrespondingElement(current, directions[index], false);
                        if (nextElement.getAttribute("data-stored") == "true") {
                            console.log('entered already stored');
                            // if element in that direction already stored
                            // move on to next available 
                            continue;
                        } else {
                            console.log("entered not stored before");
                            // if not stored before then keep storing until returns null
                            // returns null when hits adj count != 2 ie 1 or >2
                            let count = 0;
                            while (true) {
                                if (count == 0) {
                                    nextElement.setAttribute("data-stored", true);
                                    current.setAttribute("data-stored", true);
                                    currentEndStore.push(current);
                                }
                                if (nextElement != null) {
                                    currentEndStore.push(nextElement);
                                }
                                ///storing elements....
                                if (nextElement == null || count > 30) {
                                    console.log("breaking from while loop");
                                    break;
                                }
                                //the current element is one from the node by definition
                                currentElement = nextElement;
                                //inDirection changes depending on the place the function is called
                                //if called directly itll just return its input as per norm
                                //if called from getNext the inDirection will be the new inDirection
                                [nextElement, inDirection] = getNext(currentElement, inDirection)
                                //so above actually new inDirection
                                ++count;
                            }
                        }
                    }
                }

                openEndStore.push(currentEndStore);
                currentEndStore = [];
            }



            //use first element and append prepend etc
        }
        //now for all single pixels
        let singles = document.querySelectorAll('[data-adjacent-count="0"]');
        if (singles.length > 0) {
            for (let singleIndex = 0; singleIndex < singles.length; ++singleIndex) {
                singleStore.push([singles[singleIndex]]);
            }
        }


        return [nodeStore, openEndStore, singleStore];
       

        function findCorrespondingElement(current, direction, shouldStore) {
            let currentID = current.getAttribute("id");
            let values = currentID.split('_');

            let x = values[0], y = values[1];
            let newX = +x, newY = +y;
            //console.log("before id: " + newX + "_" + newY);
            switch (direction) {
                case "top":
                    newY = Number(y) - Number(1);
                    break;
                case "bottom":
                    console.log("entered bottom");
                    newY = Number(y) + Number(1);
                    break;
                case "right":
                    newX = Number(x) + Number(1);
                    break;
                case "left":
                    newX = Number(x) - Number(1);
                    break;
            }
            //console.log("new id: " + newX + "_" + newY);

            let newString = newX + "_" + newY;
            let nextElement = document.getElementById(newString);
            if (shouldStore) {
                    //nextElement.getAttribute("data-stored"));
                nextElement.setAttributeNS(null, "data-stored", true);
            }
            return [nextElement, direction];
        }

        function getNext(current, inDirection) {
            //console.log("entered find next: " + current.id + " inDirection: " + inDirection);
            //console.log(Number(current.getAttribute("data-adjacent-count")));
            if (Number(current.getAttribute("data-adjacent-count")) != 2) {
                if (current.getAttribute("data-adjacent-count") == 1) {
                    
                    current.setAttribute("data-stored", true);
                }
                return [null, null];
            } else {
                return findNextDirectionElement(inDirection);
            }




            function findNextDirectionElement(inDirection) {
                console.log("entered findNextDirectionElement");

                let blockedDirection;
                if (inDirection == "top") {
                    blockedDirection = "bottom";
                } else if (inDirection == "bottom") {
                    blockedDirection = "top";
                } else if (inDirection == "left") {
                    blockedDirection = "right";
                } else if (inDirection == "right") {
                    blockedDirection = "left";
                }


                let directions = ["top", "bottom", "left", "right"];
                for (let index = 0; index < directions.length; ++index) {
                    let tempString = "data-" + directions[index];
                    let direction = current.getAttribute(tempString);
                    if ((direction != "false")
                        && (directions[index] != blockedDirection)) {
                        
                        let [nextElement, inDirection] = findCorrespondingElement(current, directions[index], true);
                        
                        return [nextElement, inDirection];
                        //remember the adj count is 2 here
                        //so only one can be valid
                    }
                }


            }
        }

    }


    function removeNodes(store) {

        let globalStore = [];
        let rowStore = [];
        let rightStore = [];
        let currentRightStore = [];
        let currentStore = [];

        let rightStorePrev = [];
        let rowStorePrev = [];

        for (let alphai = 0; alphai < store.length; ++alphai) {
            for (let rowi = 0; rowi < store[alphai].length; ++rowi) {

                for (let populate = 0; populate < store[alphai][rowi].length; ++populate) {
                    // rowStore.push([]); // just to initialize same number of betas
                    // rightStore.push([]);    
                } //the use of rowStore is to store each beta segment

                for (let betai = 0; betai < store[alphai][rowi].length; ++betai) {


                    //console.log(rowStore);
                    //console.log(store[alphai][rowi].length);
                    for (let elementi = 0; elementi < store[alphai][rowi][betai].length; ++elementi) {
                        let current = store[alphai][rowi][betai][elementi];
                        console.log(store[alphai][rowi][betai][elementi]);
                        let classIsNode = (current.getAttribute("class") == "node");
                        let hasRight = (current.getAttribute("data-right") == "true");
                        let hasLeft = (current.getAttribute("data-left") == "true");

                        if (hasRight) {
                            if (classIsNode) {
                                currentRightStore.push(0);
                            } else {
                                currentRightStore.push(1);
                            }

                        }
                        if (hasLeft) {

                        } else {

                        }

                        if (classIsNode) {

                            rowStore.push(currentStore);
                            currentStore = [];
                            continue;

                        } else if (!classIsNode) {
                            currentStore.push(current);
                            continue;
                        }



                        //end of element loop per beta
                    }
                    rightStore.push(currentRightStore);
                    currentRightStore = [];
                    console.log(rightStore);
                    rowStore.push(currentStore);
                    currentStore = [];
                    console.log(rowStore);
                    //end of beta loop
                }
                rowStore = [];
            }
        }
    }


    function goThroughEveryPixel(store) {
        //for testing
        for (let alphai = 0; alphai < store.length; ++alphai) {
            for (let rowi = 0; rowi < store[alphai].length; ++rowi) {
                for (let betai = 0; betai < store[alphai][rowi].length; ++betai) {
                    for (let elementi = 0; elementi < store[alphai][rowi][betai].length; ++elementi) {
                        console.log(store[alphai][rowi][betai][elementi]);
                    }
                }
            }
        }
    }

    function setAdjacent(store, blockBoundsY) {
        console.log("entered setAdjacent");

        for (let alphai = 0; alphai < store.length; ++alphai) {
            //accesses alpha blocks for each row
            for (let rowi = 0; rowi < store[alphai].length; ++rowi) {
                //accesses each row for betas
                //beta
                for (let betai = 0;
                    betai < store[alphai][rowi].length; ++betai) {
                    //accesses each beta for either bounds or rects
                    //add internal adds here (rowi=0 is at end only)
                    addAdjacentCountBeta(store[alphai][rowi], betai);

                    if (rowi != 0) {
                        for (let betaPrev = 0; betaPrev < store[alphai][rowi - 1].length; ++betaPrev) {

                            let overlapping = hasOverlap(blockBoundsY[alphai][rowi - 1][betaPrev], blockBoundsY[alphai][rowi][betai]);
                            if (overlapping) {
                                console.log("is overlapping");
                                let [skewIndexCurrent, skewIndexPrev] = skewerIndex(store[alphai][rowi][betai][0], store[alphai][rowi - 1][betaPrev][0]);
                                for (let elementCurrent = skewIndexCurrent, elementPrev = skewIndexPrev;
                                    elementCurrent < store[alphai][rowi][betai].length &&
                                    elementPrev < store[alphai][rowi - 1][betaPrev].length;
                                    ++elementCurrent, ++elementPrev) {
                                    let current = store[alphai][rowi][betai][elementCurrent];
                                    let previous = store[alphai][rowi - 1][betaPrev][elementPrev];
                                    
                                    current.setAttributeNS(null, "data-adjacent-count", Number(current.getAttributeNS(null, "data-adjacent-count")) + 1);
                                    current.setAttributeNS(null, "data-left", true);
                                    previous.setAttributeNS(null, "data-adjacent-count", Number(previous.getAttributeNS(null, "data-adjacent-count")) + 1);
                                    previous.setAttributeNS(null, "data-right", true);

                                    setToNode(current);
                                    if(stopFlag == "true"){
                                        return;
                                    }
                                    setToNode(previous);
                                    if(stopFlag == "true"){
                                        return;
                                    }

                                    //console.log("logging rects");
                                    //console.log(current);
                                    //console.log(current.getAttribute("data-adjacent-count"));
                                }
                            }
                        }
                    } else {
                        // rowi == 0
                        continue;
                    }
                }
            }
        }

        function addAdjacentCountBeta(betaArray, betaIndex) {
            console.log("entered addadjacentbeta");
            for (let elementIndex = 0; elementIndex < betaArray[betaIndex].length; ++elementIndex) {
                if(stopFlag == "true"){
                    return;
                }

                let current = betaArray[betaIndex][elementIndex];

                console.log("element Index: " + elementIndex);
                console.log("length:" + betaArray[betaIndex].length);

                if (betaArray[betaIndex].length == 1) {
                    //if only one
                    continue;
                }

                if ((elementIndex != 0) && (elementIndex != betaArray[betaIndex].length - 1)) {
                    //if in middle of betas
                    current.setAttribute("data-adjacent-count",
                        Number(current.getAttribute("data-adjacent-count")) + 2);
                    current.setAttribute("data-top", true);
                    current.setAttribute("data-bottom", true);
                }

                if (elementIndex == 0) {
                    //if top in beta
                    current.setAttribute("data-adjacent-count",
                        Number(current.getAttribute("data-adjacent-count")) + 1);
                    current.setAttribute("data-bottom", true);

                }

                if (elementIndex == betaArray[betaIndex].length - 1) {
                    //if bottom in beta
                    current.setAttribute("data-adjacent-count",
                        Number(current.getAttribute("data-adjacent-count")) + 1);
                    current.setAttribute("data-top", true);
                }

                setToNode(current);

            }
        }

        function setToNode(element) {
            if (Number(element.getAttribute("data-adjacent-count")) > 2) {
                if(Number(element.getAttribute("data-adjacent-count")) == 4) {
                    alert("Only 3 way nodes are permitted; 4 way nodes are easily reproducible using 3 way nodes");//////////////////////////////////////////////////
                    resetNodeStats(store);
                    stopFlag = true; 
                    return;
                }
                element.setAttribute("class", "node");
                element.setAttribute("data-node-number", globalNodeCount);
                ++globalNodeCount;
                element.setAttribute("data-current-KCL", "null");
            }
        }

        function resetNodeStats(store){
            store.forEach((alpha)=>{
                alpha.forEach((row)=>{
                    row.forEach((beta)=>{
                        beta.forEach((element)=>{
                            element.setAttribute("data-adjacent-count", 0);
                            element.setAttribute("data-top", false);
                            element.setAttribute("data-bottom", false);
                            element.setAttribute("data-left", false);
                            element.setAttribute("data-right", false);
                            element.setAttribute("class", "wirePixel");
                            element.setAttribute("data-node-number", 0);

                        });
                    });
                });
            });

            globalNodeCount = 0; 

        }

 

        function skewerIndex(firstElemCurrent, firstElemPrev) {
            let skewIndexCurrent = 0, skewIndexPrev = 0;
            let currentPX = firstElemCurrent.getAttribute("y");
            let prevPX = firstElemPrev.getAttribute("y");

            if (currentPX != prevPX) {
                let diff = prevPX - currentPX;
                let increaseIncr = Math.abs(Math.floor(diff / pixelDimension));
                if (diff < 0) {
                    //ie current is ahead of prev, attack prev
                    skewIndexPrev += increaseIncr;
                } else {
                    skewIndexCurrent += increaseIncr;
                }
            }

            return [skewIndexCurrent, skewIndexPrev];
        }

        function hasOverlap(betaPrev, betaCurrent) {
            //takes in blockbounds beta element
            // so looking at 0 or 1

            if (((betaCurrent[0] - betaPrev[1]) >= pixelDimension) ||
                ((betaCurrent[1] - betaPrev[0]) <= -1 * pixelDimension)) {
                return false;
            } else {
                return true;
            }
        }
    }

    function correction(blockBoundsY, store) {
        console.log("entered correction");
        let newStore = [];
        let newAlpha = [];
        let newRow = [];
        let newBeta = [];
        for (let alphai = 0; alphai < store.length; ++alphai) {
            //accesses alpha blocks
            for (let rowi = 0; rowi < store[alphai].length; ++rowi) {
                //accesses row elements (this is common)
                for (let storeElementi = 0, yBlockBetai = 0;
                    (yBlockBetai < blockBoundsY[alphai][rowi].length) && (storeElementi < store[alphai][rowi].length);
                    ++storeElementi, ++yBlockBetai) {
                    let benchUpper = blockBoundsY[alphai][rowi][yBlockBetai][1];
                    let currentElement = store[alphai][rowi][storeElementi];
                    let currentY = currentElement.getAttribute("y");
                    if (currentY <= benchUpper) {
                        newBeta.push(currentElement);
                        --yBlockBetai; // prevents upper from changing
                        //but allows rect to be iterated through
                    } else {
                        //if currentY exceeds upper
                        newRow.push(newBeta);
                        newBeta = [];
                        //dont -- yblockbetai , let it increment or die out
                        --storeElementi; // next cycle new yblockbetai but same storeelementi
                    }

                }
                //end of row and betas then push
                newRow.push(newBeta);
                newAlpha.push(newRow);
                newRow = [];
                newBeta = [];
            }
            newStore.push(newAlpha);
            newAlpha = [];
            newRow = [];
            newBeta = [];
        }
        return newStore;
    }

    function blockByY(store) {
        //need to extract per column (x) since y are not sorted contiguously
        console.log("entered blockByY");
        let objectCopy = [];
        let conCopy = [];
        for (let conIndex = 0; conIndex < store.length; ++conIndex) {
            //this is between contiguous blocks 
            if (conIndex != 0) {
                objectCopy.push(conCopy);
                conCopy = [];
            }
            for (let rowIndex = 0; rowIndex < store[conIndex].length; ++rowIndex) {
                //this is for each row
                conCopy.push(store[conIndex][rowIndex]);
                store[conIndex][rowIndex] = blockBy("y", store[conIndex][rowIndex], false)[0];
            }
        }
        objectCopy.push(conCopy);
        return objectCopy;
    }

    function blockBy(variable, pixelArray, shouldStore, getRects) {
        console.log("entered blockBy" + variable);
        //the pixelArray is sorted by x then y
        let blockBounds = [];
        let old = Number(pixelArray[0].getAttribute(variable)); // initialize
        let indexBlock = 0;
        //console.log(blockBounds[indexBlock][0]);
        let lowerBound = old;
        let upperBound = old;
        blockBounds.push([lowerBound, upperBound]);
        let forYArrayRects = [];
        //now store each element per x row (3-d). 
        let store = [];
        let rowStore = [];
        let conStore = [];
        if (shouldStore) {
            rowStore.push(pixelArray[0]);
        }

        for (let i = 1; i < pixelArray.length; ++i) {
            console.log("in loop: " + i);
            let newVariable = Number(pixelArray[i].getAttribute(variable));
           
            if (newVariable == (old + pixelDimension)) {
                console.log("contiguous, new = old + pd");
                //this fires whenever its a new x row but is contiguous
                upperBound = newVariable;
                forYArrayRects.push(pixelArray[i]);
                if (shouldStore) {
                    conStore.push(rowStore);
                    rowStore = [];
                    rowStore.push(pixelArray[i])
                }
            } else if (newVariable == old) {
                console.log("contiguous, new = old");
                //this fires whenever its the same x but different y
                //never fires for y (unless duplicate squares)
                upperBound = newVariable;

                if (shouldStore) {
                    rowStore.push(pixelArray[i]);
                }
            } else { // not contiguous
                console.log("not contiguous");
                indexBlock += 1;
                lowerBound = newVariable;
                upperBound = newVariable;
                blockBounds.push([lowerBound, upperBound]);

                if (shouldStore) {
                    //++conIndex;
                    conStore.push(rowStore);
                    store.push(conStore);
                    conStore = [];
                    rowStore = [];
                    rowStore.push(pixelArray[i]);
                }
            }
            old = newVariable;
            blockBounds[indexBlock][0] = lowerBound;
            blockBounds[indexBlock][1] = upperBound;
        }

        if (shouldStore) {
            conStore.push(rowStore);
            store.push(conStore);
        }
        //can refactor all shouldstore to separate callback function
        return [blockBounds, store];
    }

    function sortByXThenY(arrayWithXY) {
       
        console.log("entered sortByXthenY");
        //sort by x then y
        arrayWithXY.sort((a, b) => {
            let ax = a.getAttribute("x");
            let bx = b.getAttribute("x");
            if (ax != bx) {
                return ax - bx;
            } else {
                return a.getAttribute("y") - b.getAttribute("y");
            }
        });
    }

    function findAllComponentsOnCanvas() {
        let allComponents = document.querySelectorAll(".component");
        
        let allComponentsOnCanvas = [];
        for (let i = 0; i < allComponents.length; ++i) {
            allComponentsOnCanvas[i] = findComponentsOnCanvas(allComponents[i]);
        }
        return allComponentsOnCanvas;

        function findComponentsOnCanvas(component) {
            console.log("entered findcomponentsoncanvas");
            
            let children = component.children;
            //let i;
            let truncated = [null];
            for (let i = 0; i < children.length; ++i) {
                if (children.length == 1 ) {
                    break;
                }

                if (i != 0) {
                    truncated[i - 1] = children[i];
                }
            }
            return truncated;
        }
    }



}



function onMouseDown(nodeVar, globalIndividualCount) {
    console.log("entered MouseDownCheck");
    nodeVar.addEventListener("mousedown", findClosestImage);

    function findClosestImage(event) {
        console.log("entered mousedown from mouseDownCheck");
        console.log("initial event target: " + event.target.id);
       
        let canvasCoords = mainCanvas.getBoundingClientRect();
        dragImage(event, canvasCoords, nodeVar, globalIndividualCount);
    }
}
