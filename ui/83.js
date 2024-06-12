var currentlyDraggedElement;
var currentlyDroppableElement;
var draggableStartOffset;
var haveMoved = false;

function dropElement(element, dropSuccess) {
    var onDropSuccess = dropSuccess;
    element.addEventListener("mouseup", (function(e) {
        element.classList.remove("droppable_border");
        if (currentlyDraggedElement && haveMoved) {
            onDropSuccess(e, currentlyDraggedElement, draggableStartOffset)
        }
    }));
    element.addEventListener("mousemove", (function(e) {
        if (currentlyDraggedElement && haveMoved) {
            element.classList.add("droppable_border");
            currentlyDroppableElement = element
        }
    }));
    element.addEventListener("mouseout", (function(e) {
        if (currentlyDraggedElement) {
            element.classList.remove("droppable_border");
            currentlyDroppableElement = null
        }
    }))
}

function dragElementRemove(el) {
    el.onmousedown = undefined
}

function dragElement(elmnt, mouseUpEvent = null, onMouseDown = null, onUnSuccesfullDrop = null, targetClass = "dragging-clone", cloneElmnt) {
    var offsetX = 0;
    offsetY = 0;
    var onMouseUp = mouseUpEvent;
    haveMoved = false;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown
    } else {
        elmnt.onmousedown = dragMouseDown
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        if (e.button != 0) return;
        document.addEventListener("mouseup", closeDragElement);
        document.addEventListener("mousemove", elementDrag);
        if (currentlyDraggedElement && currentlyDraggedElement.parentNode) currentlyDraggedElement.parentNode.removeChild(currentlyDraggedElement);
        let targetEl = elmnt;
        if (typeof cloneElmnt !== "undefined") {
            targetEl = cloneElmnt
        }
        currentlyDraggedElement = targetEl.cloneNode(true);
        currentlyDraggedElement.classList.add(targetClass);
        Object.assign(currentlyDraggedElement.dataset, targetEl.dataset);
        currentlyDraggedElement.dataset.sourceId = targetEl.id;
        var rect = targetEl.getBoundingClientRect();
        offsetX = rect.left - e.clientX;
        offsetY = rect.top - e.clientY;
        draggableStartOffset = {
            x: offsetX,
            y: offsetY
        };
        draggableStartOffsetX = offsetX;
        draggableStartOffsetY = offsetY;
        currentlyDraggedElement.style.width = rect.width + "px";
        currentlyDraggedElement.style.height = rect.height + "px";
        currentlyDraggedElement.style.top = e.clientY + offsetY + "px";
        currentlyDraggedElement.style.left = e.clientX + offsetX + "px";
        _id("draggable-container").appendChild(currentlyDraggedElement);
        if (onMouseDown) onMouseDown(e)
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        if (currentlyDraggedElement) {
            haveMoved = true;
            currentlyDraggedElement.style.top = e.clientY + offsetY + "px";
            currentlyDraggedElement.style.left = e.clientX + offsetX + "px"
        }
    }

    function closeDragElement() {
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
        if (haveMoved) {
            if (currentlyDroppableElement == null && onUnSuccesfullDrop) {
                onUnSuccesfullDrop(currentlyDraggedElement)
            }
            if (onMouseUp) onMouseUp()
        }
        if (currentlyDraggedElement !== undefined && currentlyDraggedElement.parentNode) {
            currentlyDraggedElement.parentNode.removeChild(currentlyDraggedElement);
            currentlyDraggedElement = null
        }
        currentlyDroppableElement = null
    }
}