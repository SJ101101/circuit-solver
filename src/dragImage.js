function dragImage(downEvent, canvasCoords, parentCaller, globalIndividualCount) {
    let image = downEvent.target;
    let posXAnchor = 0, posYAnchor = 0, posXDiff = 0, posYDiff = 0;
    let initialClickLeft = image.style.left , initialClickTop = image.style.top; 
    console.log("initialcllickleft: " + initialClickLeft);
    let parentLeft = parentCaller.style.left;
    let parentTop = parentCaller.style.top; 
    let pixelDimension = 25;

    dragMouseDown(downEvent);

 
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        console.log("entered dragMouseDown");
        
        if((e.target.getAttribute("data-component-name") === "resistor") && (e.target.getAttribute("data-resistance") === null)){
            alert("Please set a resistance");
        } else if ((e.target.getAttribute("data-component-name") === "voltageSource") && (e.target.getAttribute("data-voltage") === null)){
            alert("Please set a voltage");
        } else if ((e.target.getAttribute("data-component-name") === "voltageSource") && 
            (document.querySelectorAll(".component")[1].children.length >= 2) && 
            (e.target === document.querySelectorAll(".component")[1].children[0])) {
                //cond 1 == voltage source
                //cond 2 == more than one voltage source (ie two copies, one panel one on wirepage)
                //cond 3 == if target voltage source is the one in the panel (always top of html DOM)
            alert("Only one voltage source on canvas");
        } else {
            posXAnchor = e.clientX;
            posYAnchor = e.clientY;
            e.target.style.zIndex = 10001;
            image.addEventListener("mouseup" , noMovement);
            console.log("beforedragImage");
            image.addEventListener("mousemove", dragImage);
        }

    }

    function dragImage(e) {
        e = e || window.event;
        e.preventDefault();
        posXDiff = posXAnchor - e.clientX;
        posYDiff = posYAnchor - e.clientY;
        posXAnchor = e.clientX;
        posYAnchor = e.clientY;
        image.style.top = (image.offsetTop - posYDiff) + "px";
        image.style.left = (image.offsetLeft - posXDiff) + "px";

    }

    function noMovement(e) {
        console.log("entered noMovement");
        e.target.style.zIndex = 10000;
        //one less than when dragging
        image.removeEventListener("mouseup" , noMovement);
        image.removeEventListener("mousemove" , dragImage);
        
        if(isOutsideCanvas(e)){
            //if mouseup is outside canvas
            console.log("any up outside");
            snapback(downEvent);
        }

        if(isOutsideCanvas(downEvent) && !isOutsideCanvas(e)) { // mouseup inside canvas, but only clone if first successful drag into canvas
            //ie mousedown from parentcaller to mouseup to canvas && condition 
            setToClosestIntersection(image);
            componentActor(image, "addCount");
            
            setCanvasRelativeYX(image);
            cloneTo(image, parentCaller);
        } else if (!isOutsideCanvas(downEvent) && !isOutsideCanvas(e)){
            console.log("down inside and up inside");
            setToClosestIntersection(image);
            setCanvasRelativeYX(image);
        }

        function componentActor(image, functionToAct){ // callback function
            console.log("entered ComponentActor");

            switch(image.dataset.componentName){
                case "resistor":
                    var num = 1;
                    break;
                case "voltageSource":
                    var num = 2
                    break;
            }

            var executeFunction;
            if(functionToAct == "addCount"){ //not deep equals, just name
                console.log("entered addCount");
                executeFunction = (image, numForCount) => {
                    console.log("entered addCountFunctiontoAct");
                    ++globalIndividualCount[numForCount];
                    ++globalIndividualCount[0];
                }
               
            } else {
                executeFunction = functionToAct;
            }
            executeFunction(image, num); 
        }

        function cloneTo(imageSource, parentTarget){
                var imageClone = imageSource.cloneNode(false);
                componentActor(imageClone, setIndividualCount);
                imageClone.id = imageClone.dataset.componentName+"_"+imageClone.dataset.componentCount+"_"+globalIndividualCount[0]; // dont want multiple same ids 
                // id is (componentName)_(componentCountFromZero)_(globalCount)
                imageClone.style.top = (parentTop);
                imageClone.style.left = (parentLeft);
                parentTarget.prepend(imageClone);
            

            


            function setResistance(imageSource){
               let answer;
                do {
                
                answer = parseFloat(prompt("Please enter the resistance (in ohms): "));
                
               } while (isNaN(answer));
                
               imageSource.setAttribute("data-resistance", answer);
            }
        } 

        function setCanvasRelativeYX(image){
            console.log("entered setcanvasrelative");
            let relativeLeft = Math.round(image.getBoundingClientRect().left - document.querySelector("#mainCanvas").getBoundingClientRect().left);
            let relativeTop = Math.round(image.getBoundingClientRect().top - document.querySelector("#mainCanvas").getBoundingClientRect().top);
            //if use getboundclient subtraction for canvas relative, need to round
            image.setAttribute("data-canvas-x", relativeLeft);
            image.setAttribute("data-canvas-top", relativeTop);
        }

        function setIndividualCount(imageHere, num){
            console.log("entered setIndividualCount");
            imageHere.dataset.componentCount = globalIndividualCount[num];
            imageHere.dataset.globalCount = globalIndividualCount[0];
        }

        function isOutsideCanvas(e){
            //event could be mouseup or mousedown
            return ((e.clientX <= canvasCoords.left) || (e.clientX >= canvasCoords.right) || (e.clientY <= canvasCoords.top) || (e.clientY >= canvasCoords.bottom));
        }

        function snapback(e){
            console.log("entered snapback")
            //pass in downEvent
            // if initial client mousedown in canvas and mouseup outside canvas, should snap back into canvas
            // if client mousedown from parentcaller, and mouseup outside canvas, should snap back to parentcaller
            //called when mouseup outside so just look for mousedown
            if(!isOutsideCanvas(e)){
                console.log("snapback down inside");
            
                image.style.top = initialClickTop;
                image.style.left = initialClickLeft; 

            } else {
                console.log("snapback down outside");
                image.style.top = parentCaller.style.top;
                image.style.left = parentCaller.style.left;
       
            }
        }

        

        function setToClosestIntersection(image){
            console.log("entered get CLosest");
            topLeftCorner = getAbsTopLeftCorner(image);
            let x = topLeftCorner[0] - canvasCoords.left;
            let y = topLeftCorner[1] - canvasCoords.top;

            let xBounds = getBounds(x);
            let yBounds = getBounds(y);

            let newXDiff = returnMinAbsDiff(xBounds, x);
            let newYDiff = returnMinAbsDiff(yBounds, y);
    
            let tempx = Number((image.style.left).replace((image.style.left).slice(-2),"")) + Number(newXDiff);
            let tempy = Number((image.style.top).replace((image.style.top).slice(-2),"")) + Number(newYDiff);

            image.style.left = tempx + "px";
            image.style.top = tempy + "px";

            function getAbsTopLeftCorner(image){
                console.log("Entered findTopLeftCorner");
                //relative to canvas placement
                let imageCoords = image.getBoundingClientRect();
                let leftCornerX = imageCoords.left;
                let leftCornerY = imageCoords.top;
                return [leftCornerX, leftCornerY];
            }

            function returnMinAbsDiff(array, refVal) {
                console.log("entered return minabs diff");
                let a = array[0];
                let b = array[1];
        
                if (Math.abs(a - refVal) < Math.abs(b - refVal)) {
                    return (a-refVal);
                } else {
                    return (b-refVal);
                }
            }

            function getBounds(variable) {
                console.log("entered getBounds");
                let lowerBoundX = Math.floor(variable/pixelDimension)*pixelDimension;
                let upperBoundX = lowerBoundX + pixelDimension;
                return [lowerBoundX, upperBoundX];
            }

        }

    }
}

