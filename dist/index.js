export const desktopDragScroll = (element, options) => {
    let mouseDragStartX = 0;
    let mouseDragScrollStart = 0;
    let mouseDragIsDown = false;
    let mouseDragIsScrolling = false;
    clearUpSliderStyles(); //  Begin with default slider styles.
    disableChildrenDrag(); //  Begin with disabled drag on anchors and images.
    onScrollDetectCurrentIndex(); //  Begin with detecting current index.
    function disableChildrenPointerEvents() {
        for (const child of Array.from(element.children)) {
            child.style.pointerEvents = 'none';
        }
    }
    function enableChildrenPointerEvents() {
        for (const child of Array.from(element.children)) {
            child.style.pointerEvents = '';
        }
    }
    function disableChildrenDrag() {
        element.querySelectorAll('a, img').forEach(itemEl => {
            itemEl.draggable = false;
        });
    }
    async function scrollToPromise(element, posX) {
        return new Promise(resolve => {
            let intervalId;
            let timeoutId;
            //  Detect impossible scroll positions.
            const minX = 0;
            const maxX = element.scrollWidth - element.clientWidth;
            if (posX < minX) {
                posX = 0;
            }
            if (posX > maxX) {
                posX = maxX;
            }
            //  Main logic.
            element.scrollTo({
                left: posX,
                behavior: 'smooth'
            });
            intervalId = Number(setInterval(function () {
                if (Math.abs(element.scrollLeft - posX) <= 10) {
                    clearTimeout(timeoutId);
                    clearInterval(intervalId);
                    resolve();
                }
            }, 25));
            //  Watch-dog.
            timeoutId = Number(setTimeout(() => {
                clearInterval(intervalId);
                resolve();
            }, 2000));
        });
    }
    async function smoothScrollToNearestChild(lastMousePosX = 0) {
        var _a, _b;
        const childWidth = (_b = (_a = element.children[0]) === null || _a === void 0 ? void 0 : _a.clientWidth) !== null && _b !== void 0 ? _b : 0;
        const delta = Math.abs(mouseDragStartX - lastMousePosX);
        if (delta < childWidth) {
            if (mouseDragStartX >= lastMousePosX) {
                return scrollToPromise(element, mouseDragScrollStart + childWidth);
            }
            else {
                return scrollToPromise(element, mouseDragScrollStart - childWidth);
            }
        }
        else {
            let requestedScroll = mouseDragScrollStart + (mouseDragStartX - lastMousePosX);
            let closestChild = element.children[0];
            let closestDistance = Infinity;
            Array.from(element.children).forEach(child => {
                const distance = Math.abs(child.offsetLeft - requestedScroll);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestChild = child;
                }
            });
            requestedScroll = closestChild.offsetLeft;
            return scrollToPromise(element, requestedScroll);
        }
    }
    function clearUpSliderStyles() {
        element.style.cursor = 'grab';
        element.style.scrollSnapType = '';
        element.style.scrollBehavior = '';
        if (!['relative', 'absolute'].includes(window.getComputedStyle(element).position)) {
            element.style.position = 'relative';
        }
    }
    function onDragMouseDown(event) {
        if (!mouseDragIsScrolling) {
            mouseDragStartX = event.clientX;
            mouseDragIsDown = true;
            mouseDragScrollStart = element.scrollLeft;
        }
    }
    function onDragMouseUp(event) {
        if (mouseDragIsDown && mouseDragIsScrolling) {
            event.preventDefault();
            enableChildrenPointerEvents();
            smoothScrollToNearestChild(event.clientX).finally(() => {
                clearUpSliderStyles();
                mouseDragIsScrolling = false;
            }).catch(() => { });
        }
        mouseDragIsDown = false;
    }
    function onDragMouseLeave(event) {
        if (mouseDragIsDown) {
            event.preventDefault();
            enableChildrenPointerEvents();
            smoothScrollToNearestChild(event.clientX).finally(() => {
                clearUpSliderStyles();
            }).catch(() => { });
        }
        mouseDragIsDown = false;
        mouseDragIsScrolling = false;
    }
    function onDragMouseMove(event) {
        const delta = Math.abs(mouseDragStartX - event.clientX);
        if (mouseDragIsDown && delta > 10) {
            mouseDragIsScrolling = true;
        }
        if (mouseDragIsDown && mouseDragIsScrolling) {
            disableChildrenPointerEvents();
            element.scrollLeft = mouseDragScrollStart + mouseDragStartX - event.clientX;
            element.style.cursor = 'grabbing';
            element.style.scrollSnapType = 'none';
            element.style.scrollBehavior = 'auto';
        }
        else {
            element.style.cursor = 'grab';
        }
    }
    function onDragMouseClick(event) {
        if (mouseDragIsScrolling) {
            event.preventDefault();
            enableChildrenPointerEvents();
        }
    }
    function onScrollDetectCurrentIndex() {
        var _a, _b;
        const singleChildWidth = (_b = (_a = element.children[0]) === null || _a === void 0 ? void 0 : _a.clientWidth) !== null && _b !== void 0 ? _b : 0;
        const index = Math.round(element.scrollLeft / singleChildWidth);
        element.setAttribute('data-active-index', '' + (index + 1));
    }
    element.addEventListener('mousedown', onDragMouseDown);
    element.addEventListener('mouseup', onDragMouseUp);
    element.addEventListener('mousemove', onDragMouseMove);
    element.addEventListener('mouseleave', onDragMouseLeave);
    element.addEventListener('click', onDragMouseClick);
    element.addEventListener('scroll', onScrollDetectCurrentIndex);
    return () => {
        element.removeEventListener('mousedown', onDragMouseDown);
        element.removeEventListener('mouseup', onDragMouseUp);
        element.removeEventListener('mousemove', onDragMouseMove);
        element.removeEventListener('mouseleave', onDragMouseLeave);
        element.removeEventListener('click', onDragMouseClick);
        element.removeEventListener('scroll', onScrollDetectCurrentIndex);
    };
};
