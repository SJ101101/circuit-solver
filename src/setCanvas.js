let resistorButton = document.getElementById("resistanceSetButton");
resistorButton.addEventListener('click', generateImage);
let voltageButton  = document.getElementById("voltageSetButton");
voltageButton.addEventListener('click', generateImage);

function generateImage(event){
    console.log("entered generateImage from resistor set");
    if(event.target.getAttribute("id") === "resistanceSetButton"){
        let resistanceValue = document.getElementById("resistanceInput").value;
        const resistorCanvas = document.getElementById("resistorCanvas");
        const resistorCtx = resistorCanvas.getContext('2d');
        resistorCtx.font = '30px serif';
        resistorCtx.clearRect(0, 0, resistorCanvas.width, resistorCanvas.height);
        resistorCtx.fillStyle = 'lightGreen';
        resistorCtx.fillRect(0, 0, resistorCanvas.width, resistorCanvas.height);
        resistorCtx.fillStyle = 'black';
        resistorCtx.fillText(String(resistanceValue) + " ohm", 5,50, 65);
        let newImageSrc = resistorCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let topImageChild = document.getElementById('component1').firstElementChild;
        topImageChild.src = newImageSrc;
        topImageChild.setAttribute("data-resistance", Number(resistanceValue));
    
    } else if (event.target.getAttribute("id") === "voltageSetButton"){
        let voltageValue = document.getElementById("voltageInput").value;
        const voltageCanvas = document.getElementById("voltageCanvas");
        const voltageCtx = voltageCanvas.getContext('2d');
        voltageCtx.font = '30px serif';
        voltageCtx.clearRect(0, 0, voltageCanvas.width, voltageCanvas.height);
        voltageCtx.fillStyle = 'lightBlue';
        voltageCtx.fillRect(0, 0, voltageCanvas.width, voltageCanvas.height);
        voltageCtx.fillStyle = 'black';
        voltageCtx.fillText(String(voltageValue) + " V", 5,50, 65);
        let newImageSrc = voltageCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let topImageChild = document.getElementById('component2').firstElementChild;
        topImageChild.src = newImageSrc;
        topImageChild.setAttribute("data-voltage", Number(voltageValue));
    
    }
}
//grids
var canvasRect = document.querySelector("#mainCanvas_svg");
var wireBackground = document.querySelector("#wireBackground");
var wireSVG = document.querySelector('#wireSVG');
canvasRect.addEventListener("mousedown", onWireMouseDown); // need to check that when delete active on wire is off
canvasRect.addEventListener("mousedown", onDeleteMouseDown);
let pixelDimension = 25;
let canvasWidth = canvasRect.getAttribute("width");
let canvasHeight = canvasRect.getAttribute("height");
let strokeWidthSet = "3";
var wireButton = document.querySelector("#wireButton");
let deleteButton = document.getElementById("deleteButton");
//for vertical gridlines
for (var x = 0; x <= canvasWidth; x = x + pixelDimension){
    let x1 = x + "px";
    let x2 = x + "px";
    for(var y = 0; y <= canvasHeight - pixelDimension; y = y + pixelDimension){
        let y1 = y + "px";
        let y2 = y + pixelDimension + "px";
        makeSVGGridLines(x1,y1,x2,y2);
    }
}
//for horizontal gridlines
for (var y = 0; y <= canvasHeight; y = y + pixelDimension){
    let y1 = y + "px";
    let y2 = y + "px";
    for(var x = 0; x <= canvasWidth - pixelDimension; x = x + pixelDimension){
        let x1 = x + "px";
        let x2 = x + pixelDimension + "px";
        makeSVGGridLines(x1,y1,x2,y2);
    }
}

function makeSVGGridLines(x1,y1,x2,y2){
    var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
    newLine.setAttribute('x1',x1);
    newLine.setAttribute('y1',y1);
    newLine.setAttribute('x2',x2);
    newLine.setAttribute('y2',y2);
    newLine.setAttribute("stroke", "black");
    newLine.setAttribute("z-index", "13");
    newLine.setAttribute("stroke-width",strokeWidthSet);
    newLine.setAttribute("stroke-opacity",0.4)
    //relative to svg canvas 
    newLine.setAttribute("data-start-x",x1.replace(x1.slice(-2),""));
    newLine.setAttribute("data-end-x",x2.replace(x2.slice(-2),""));
    newLine.setAttribute("data-start-y",y1.replace(y1.slice(-2),""));
    newLine.setAttribute("data-end-y",y2.replace(y2.slice(-2),""));
    newLine.setAttribute("data-deletable", "false");
    
    canvasRect.append(newLine);

}

function onDeleteMouseDown(downEvent){
    if (deleteButton.getAttribute("data-toggle-state") == "true"){
        deleteAction(downEvent);
    } else {
        return;
    }


    function deleteMoveSelect(downEvent){
        deleteAction(downEvent);       
    }

    function deleteAction(downEvent){


        if(downEvent.target.getAttribute("id") !== "wireBackground" && 
        (downEvent.target.getAttribute("data-deletable") != "false")){ // for delete the function only added to wireBackground and extras are layered on top
            
            let targetClass = downEvent.target.getAttribute("class");
            let allComponents = document.querySelectorAll(".component");
            if (targetClass == "wirePixel" || targetClass == "currentImage_img" || (targetClass == "componentImage_img"  &&
             (downEvent.target !== allComponents[0].children[0] && downEvent.target !== allComponents[1].children[0]) )){
                console.log("deleteTarget: " + downEvent.target.getAttribute("id"));
                downEvent.target.remove();    
            }
            
        }

        document.addEventListener("mouseup", removeDeleteEvent);
        document.addEventListener("mousemove", deleteMoveSelect);

        function removeDeleteEvent(downEvent){
            console.log("entered removeDeleteEvent");
            document.removeEventListener("mouseup", removeDeleteEvent);
            document.removeEventListener("mousemove", deleteMoveSelect);
        }

        
    }
}

////wiring
function onWireMouseDown(downEvent){
    console.log("entered onWireMouseDown");
    if (wireButton.getAttribute("data-toggle-state") == "true"){
        wireSelect(downEvent);
        
    } else {
        return;
    }
    function wireMoveSelect(downEvent){
        console.log("entered wireMoveSelect");
        wireSelect(downEvent); // atm when move on existing pixel takes event.target.getBoundclient as pixel
        //later
    }

    function wireSelect(event){
        console.log("entered wireselect");
       
        let svgNS = "http://www.w3.org/2000/svg";
        if(event.target.getAttribute("id") === "wireBackground"){
            let canvasCoords = event.target.getBoundingClientRect();
            let absTopX = event.clientX - canvasCoords.left;
            let absTopY = event.clientY - canvasCoords.top;
            let topX = getLowerBound(absTopX);
            let topY = getLowerBound(absTopY); // these are for downevent
            makeWirePixel(topX,topY);
        }
        

        document.addEventListener("mouseup", removeWireEvent);
        document.addEventListener("mousemove", wireMoveSelect);

        function removeWireEvent(event){
            console.log("entered removeWireEvent");
            document.removeEventListener("mouseup", removeWireEvent);
            document.removeEventListener("mousemove", wireMoveSelect);
        }



        function getLowerBound(variable) {
            //add for extreme cases later
            console.log("entered getLowerBoundDiff");
            let lowerBound = Math.floor(variable/pixelDimension)*pixelDimension;
            return (lowerBound);
        }

        function makeWirePixel(topXDiff, topYDiff){
            console.log("entered makeWirePixel");
            var wirePixel = document.createElementNS(svgNS,'rect');
            wirePixel.setAttribute("class", "wirePixel");
            wirePixel.setAttributeNS(null, "width", pixelDimension);
            wirePixel.setAttributeNS(null, "height", pixelDimension);

            let tempx = (Number((wirePixel.style.left).replace((wirePixel.style.left).slice(-2),"")) + Number(topXDiff) ) ;
            let tempy = (Number((wirePixel.style.top).replace((wirePixel.style.top).slice(-2),"")) + Number(topYDiff) )  ;
            let gridNumberX = tempx/pixelDimension;
            let gridNumberY = tempy/pixelDimension; // starts from 0 
            wirePixel.setAttributeNS(null, 'x', tempx);
            wirePixel.setAttributeNS(null, 'y', tempy);
            wirePixel.setAttributeNS(null, "fill","black");
            wirePixel.setAttributeNS(null, "data-adjacent-count", 0);
            wirePixel.setAttributeNS(null, "data-left", false);
            wirePixel.setAttributeNS(null, "data-top", false);
            wirePixel.setAttributeNS(null, "data-bottom", false);
            wirePixel.setAttributeNS(null, "data-right", false);
            wirePixel.setAttributeNS(null, "data-grid-X", gridNumberX);
            wirePixel.setAttributeNS(null, "data-grid-Y",gridNumberY);
            let idString = String(gridNumberX) + "_" + String(gridNumberY);
            wirePixel.setAttributeNS(null, 'id', idString);
            wirePixel.setAttributeNS(null,"data-stored", false);
            wireSVG.append(wirePixel);
        }

    }
}