/*
const getFullWidth = (elem) => Math.max(elem.offsetWidth, elem.scrollWidth);
const getFullHeight = (elem) => Math.max(elem.offsetHeight, elem.scrollHeight);
*/
const textNodeFromPoint = (element, x, y) => {
    const nodes = element.childNodes;
    const range = document.createRange();
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType !== 3) {
            continue;
        }
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        if (x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom) {
            return node;
        }
    }
    return false;
};

const clearTextSelection = () => {
    const selection = window.getSelection ? window.getSelection() : document.selection;
    if (!selection) {
        return;
    }
    if (selection.removeAllRanges) {
        selection.removeAllRanges();
    } else if (selection.empty) {
        selection.empty();
    }
};

const CLICK_EVENT_THRESHOLD_PX = 5;

class ScrollBooster {
    /**
     * Create ScrollBooster instance
     * @param {Object} options - options object
     * @param {Element} options.viewport - container element
     * @param {Element} options.content - scrollable content element
     * @param {String} options.direction - scroll direction
     * @param {String} options.pointerMode - mouse or touch support
     * @param {String} options.scrollMode - predefined scrolling technique
     * @param {Boolean} options.bounce - bounce effect
     * @param {Number} options.bounceForce - bounce effect factor
     * @param {Number} options.friction - scroll friction factor
     * @param {Boolean} options.textSelection - enables text selection
     * @param {Boolean} options.inputsFocus - enables focus on input elements
     * @param {Boolean} options.emulateScroll - enables mousewheel emulation
     * @param {Function} options.onClick - click handler
     * @param {Function} options.onUpdate - state update handler
     * @param {Function} options.shouldScroll - predicate to allow or disable scroll
     */
    constructor(options = {}) {
        const defaults = {
            content: options.viewport.children[0],
            direction: 'all', // 'vertical', 'horizontal'
            pointerMode: 'all', // 'touch', 'mouse'
            scrollMode: undefined, // 'transform', 'native'
            bounce: true,
            bounceForce: 0.1,
            friction: 0.05,
            textSelection: false,
            inputsFocus: true,
            emulateScroll: false,
            pointerDownPreventDefault: true,
            scrollEnabled: true,
            onClick() {},
            onUpdate() {},
            onScrollBegin() {},
            onScrollEnd() {},
            onScroll() {},
            shouldScroll() {
                return this.scrollEnabled;
            },
        };

        this.props = {...defaults, ...options
        };

        this.max_x = 0;
        this.max_y = 0;
        this.perc_x = 0;
        this.perc_y = 0;

        if (!this.props.viewport || !(this.props.viewport instanceof Element)) {
            console.error(`ScrollBooster init error: "viewport" config property must be present and must be Element`);
            return;
        }

        if (!this.props.content) {
            console.error(`ScrollBooster init error: Viewport does not have any content`);
            return;
        }

        this.isDragging = false;
        this.isTargetScroll = false;
        this.isScrolling = false;
        this.isRunning = false;

        const START_COORDINATES = {
            x: 0,
            y: 0
        };

        this.position = {...START_COORDINATES
        };
        this.velocity = {...START_COORDINATES
        };
        this.dragStartPosition = {...START_COORDINATES
        };
        this.dragOffset = {...START_COORDINATES
        };
        this.dragPosition = {...START_COORDINATES
        };
        this.targetPosition = {...START_COORDINATES
        };
        this.scrollOffset = {...START_COORDINATES
        };

        this.rafID = null;
        this.events = {};

        this.updateMetrics();
        this.handleEvents();
    }

    /**
     * Update options object with new given values
     */
    updateOptions(options = {}) {
        this.props = {...this.props, ...options
        };
        this.props.onUpdate(this.getState());
        this.startAnimationLoop();
    }

    /**
     * Update DOM container elements metrics (width and height)
     */
    updateMetrics() {
        let viewport_rect = this.props.viewport.getBoundingClientRect();
        this.viewport = {
            width: viewport_rect.width,
            height: viewport_rect.height,
        };
        let content_rect = this.props.content.getBoundingClientRect();
        this.content = {
            width: content_rect.width,
            height: content_rect.height,
        };
        this.edgeX = {
            from: Math.min(-this.content.width + this.viewport.width, 0),
            to: 0,
        };
        this.edgeY = {
            from: Math.min(-this.content.height + this.viewport.height, 0),
            to: 0,
        };

        this.max_x = this.content.width - this.viewport.width;
        this.max_y = this.content.height - this.viewport.height;
        if (this.max_x <= 0) this.max_x = 0;
        if (this.max_y <= 0) this.max_y = 0;

        if (this.viewport.width >= this.content.width) {
            this.props.scrollEnabled = false;
        } else {
            this.props.scrollEnabled = true;
        }

        this.props.onUpdate(this.getState());
        this.startAnimationLoop();
    }

    /**
     * Run animation loop
     */
    startAnimationLoop() {
        this.isRunning = true;
        cancelAnimationFrame(this.rafID);
        this.rafID = requestAnimationFrame(() => this.animate());
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) {
            return;
        }
        this.updateScrollPosition();
        // stop animation loop if nothing moves
        if (!this.isMoving()) {
            this.isRunning = false;
            this.isTargetScroll = false;
        }
        const state = this.getState();
        this.setContentPosition(state);
        this.props.onUpdate(state);
        this.rafID = requestAnimationFrame(() => this.animate());
    }

    /**
     * Calculate and set new scroll position
     */
    updateScrollPosition() {
        this.applyEdgeForce();
        this.applyDragForce();
        this.applyScrollForce();
        this.applyTargetForce();

        const inverseFriction = 1 - this.props.friction;
        this.velocity.x *= inverseFriction;
        this.velocity.y *= inverseFriction;

        if (this.props.direction !== 'vertical') {
            this.position.x += this.velocity.x;
        }
        if (this.props.direction !== 'horizontal') {
            this.position.y += this.velocity.y;
        }

        // disable bounce effect
        if ((!this.props.bounce || this.isScrolling) && !this.isTargetScroll) {
            this.position.x = Math.max(Math.min(this.position.x, this.edgeX.to), this.edgeX.from);
            this.position.y = Math.max(Math.min(this.position.y, this.edgeY.to), this.edgeY.from);
        }
    }

    /**
     * Increase general scroll velocity by given force amount
     */
    applyForce(force) {
        this.velocity.x += force.x;
        this.velocity.y += force.y;
    }

    /**
     * Apply force for bounce effect
     */
    applyEdgeForce() {
        if (!this.props.bounce || this.isDragging) {
            return;
        }

        // scrolled past viewport edges
        const beyondXFrom = this.position.x < this.edgeX.from;
        const beyondXTo = this.position.x > this.edgeX.to;
        const beyondYFrom = this.position.y < this.edgeY.from;
        const beyondYTo = this.position.y > this.edgeY.to;
        const beyondX = beyondXFrom || beyondXTo;
        const beyondY = beyondYFrom || beyondYTo;

        if (!beyondX && !beyondY) {
            return;
        }

        const edge = {
            x: beyondXFrom ? this.edgeX.from : this.edgeX.to,
            y: beyondYFrom ? this.edgeY.from : this.edgeY.to,
        };

        const distanceToEdge = {
            x: edge.x - this.position.x,
            y: edge.y - this.position.y,
        };

        const force = {
            x: distanceToEdge.x * this.props.bounceForce,
            y: distanceToEdge.y * this.props.bounceForce,
        };

        const restPosition = {
            x: this.position.x + (this.velocity.x + force.x) / this.props.friction,
            y: this.position.y + (this.velocity.y + force.y) / this.props.friction,
        };

        if ((beyondXFrom && restPosition.x >= this.edgeX.from) || (beyondXTo && restPosition.x <= this.edgeX.to)) {
            force.x = distanceToEdge.x * this.props.bounceForce - this.velocity.x;
        }

        if ((beyondYFrom && restPosition.y >= this.edgeY.from) || (beyondYTo && restPosition.y <= this.edgeY.to)) {
            force.y = distanceToEdge.y * this.props.bounceForce - this.velocity.y;
        }

        this.applyForce({
            x: beyondX ? force.x : 0,
            y: beyondY ? force.y : 0,
        });
    }

    /**
     * Apply force to move content while dragging with mouse/touch
     */
    applyDragForce() {
        if (!this.isDragging) {
            return;
        }

        const dragVelocity = {
            x: this.dragPosition.x - this.position.x,
            y: this.dragPosition.y - this.position.y,
        };

        this.applyForce({
            x: dragVelocity.x - this.velocity.x,
            y: dragVelocity.y - this.velocity.y,
        });
    }

    /**
     * Apply force to emulate mouse wheel or trackpad
     */
    applyScrollForce() {
        if (!this.isScrolling) {
            return;
        }

        this.applyForce({
            x: this.scrollOffset.x - this.velocity.x,
            y: this.scrollOffset.y - this.velocity.y,
        });

        this.scrollOffset.x = 0;
        this.scrollOffset.y = 0;
    }

    /**
     * Apply force to scroll to given target coordinate
     */
    applyTargetForce() {
        if (!this.isTargetScroll) {
            return;
        }

        this.applyForce({
            x: (this.targetPosition.x - this.position.x) * 0.08 - this.velocity.x,
            y: (this.targetPosition.y - this.position.y) * 0.08 - this.velocity.y,
        });
    }

    /**
     * Check if scrolling happening
     */
    isMoving() {
        return (
            this.isDragging ||
            this.isScrolling ||
            Math.abs(this.velocity.x) >= 0.01 ||
            Math.abs(this.velocity.y) >= 0.01
        );
    }

    /**
     * Scroll forward / backwards by vh value
     */
    scrollToArrow(direction, vh) {
        let state = this.getState();
        let onevh_float = window.outerHeight / 100;

        if (direction < 0) {
            let new_pos = state.position.x - (onevh_float * vh);
            if (new_pos < 0) new_pos = 0;

            this.scrollTo({
                x: new_pos,
                y: 0,
            });
        }

        if (direction > 0) {

            let new_pos = state.position.x + (onevh_float * vh);
            if (new_pos > state.edge.x) new_pos = state.edge.x;

            this.scrollTo({
                x: new_pos,
                y: 0,
            });
        }
    }

    /**
     * Set scroll target coordinate for smooth scroll
     */
    scrollTo(position = {}) {
        this.isTargetScroll = true;
        this.targetPosition.x = -position.x || 0;
        this.targetPosition.y = -position.y || 0;
        this.startAnimationLoop();
    }

    /**
     * Scroll to the end
     */
    scrollToEnd() {
        this.isTargetScroll = true;
        this.targetPosition.x = -this.max_x || 0;
        this.targetPosition.y = -this.max_y || 0;
        this.startAnimationLoop();
    }

    /**
     * Manual position setting
     */
    setPosition(position = {}) {
        this.isTargetScroll = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.position.x = -position.x || 0;
        this.position.y = -position.y || 0;
        this.startAnimationLoop();
    }

    /**
     * Set the position to the end
     */
    setPositionEnd() {
        this.isTargetScroll = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.position.x = -this.max_x || 0;
        this.position.y = -this.max_y || 0;
        this.startAnimationLoop();
    }

    /**
     * Get latest metrics and coordinates
     */
    getState() {
        return {
            isMoving: this.isMoving(),
            isDragging: !!(this.dragOffset.x || this.dragOffset.y),
            position: {
                x: -this.position.x,
                y: -this.position.y
            },
            dragOffset: this.dragOffset,
            edge: {
                x: -this.edgeX.from,
                y: -this.edgeY.from
            },
            borderCollision: {
                left: this.position.x >= this.edgeX.to,
                right: this.position.x <= this.edgeX.from,
                top: this.position.y >= this.edgeY.to,
                bottom: this.position.y <= this.edgeY.from,
            },
        };
    }

    /**
     * Update DOM container elements metrics (width and height)
     */
    setContentPosition(state) {
        this.max_x = this.content.width - this.viewport.width;
        this.max_y = this.content.height - this.viewport.height;
        if (this.max_x <= 0) {
            this.max_x = 0;
            this.perc_x = 0;
        } else {
            this.perc_x = state.position.x / this.max_x;
        }
        if (this.max_y <= 0) {
            this.max_y = 0;
            this.perc_y = 0;
        } else {
            this.perc_y = state.position.y / this.max_y;
        }

        if (this.perc_x > 1) this.perc_x = 1;
        if (this.perc_y > 1) this.perc_y = 1;
        if (this.perc_x < 0) this.perc_x = 0;
        if (this.perc_y < 0) this.perc_y = 0;

        if (this.props.scrollMode === 'transform') {
            this.props.content.style.transform = `translate(${-state.position.x}px, ${-state.position.y}px)`;
        }
        if (this.props.scrollMode === 'native') {
            this.props.viewport.scrollTop = state.position.y;
            x
            this.props.viewport.scrollLeft = state.position.x;
        }

        if (typeof this.props.onScroll === "function") this.props.onScroll(this.perc_x, this.perc_y, this.viewport, this.content);
    }

    /**
     * Register all DOM events
     */
    handleEvents() {
        const dragOrigin = {
            x: 0,
            y: 0
        };
        let wheelTimer = null;
        let isTouch = false;

        const setDragPosition = (event) => {
            if (!this.isDragging) {
                return;
            }

            const pageX = isTouch ? event.touches[0].pageX : event.clientX;
            const pageY = isTouch ? event.touches[0].pageY : event.clientY;

            //console.log("setDragPosition", isTouch, pageX, pageY);

            this.dragOffset.x = pageX - dragOrigin.x;
            this.dragOffset.y = pageY - dragOrigin.y;

            this.dragPosition.x = this.dragStartPosition.x + this.dragOffset.x;
            this.dragPosition.y = this.dragStartPosition.y + this.dragOffset.y;
        };

        this.events.pointerdown = (event) => {
            isTouch = !!(event.touches && event.touches[0]);

            const eventData = isTouch ? event.touches[0] : event;
            const {
                clientX, clientY
            } = eventData;

            const {
                viewport
            } = this.props;
            const rect = viewport.getBoundingClientRect();

            // click on vertical scrollbar
            if (clientX - rect.left >= viewport.clientLeft + viewport.clientWidth) {
                return;
            }

            // click on horizontal scrollbar
            if (clientY - rect.top >= viewport.clientTop + viewport.clientHeight) {
                return;
            }

            // interaction disabled by user
            if (!this.props.shouldScroll(this.getState(), event)) {
                return;
            }

            // disable right mouse button scroll
            if (event.button !== 2) {
                return;
            }

            // disable on mobile
            if (this.props.pointerMode === 'mouse' && isTouch) {
                return;
            }

            // disable on desktop
            if (this.props.pointerMode === 'touch' && !isTouch) {
                return;
            }

            // focus on form input elements
            const formNodes = ['input', 'textarea', 'button', 'select', 'label'];
            if (this.props.inputsFocus && formNodes.indexOf(event.target.nodeName.toLowerCase()) > -1) {
                return;
            }

            // handle text selection
            if (this.props.textSelection) {
                const textNode = textNodeFromPoint(event.target, clientX, clientY);
                if (textNode) {
                    return;
                }
                clearTextSelection();
            }

            this.isTargetScroll = false;
            this.isDragging = true;

            this.props.onScrollBegin();

            dragOrigin.x = clientX;
            dragOrigin.y = clientY;
            this.dragStartPosition.x = this.position.x;
            this.dragStartPosition.y = this.position.y;

            setDragPosition(event);
            this.startAnimationLoop();
            if (this.props.pointerDownPreventDefault) {
                event.preventDefault();
            }
        };

        this.events.pointermove = (event) => {
            setDragPosition(event);
        };

        this.events.pointerup = () => {
            if (this.isDragging) this.props.onScrollEnd();
            this.isDragging = false;
        };

        this.events.wheel = (event) => {
            if (!this.props.emulateScroll) {
                return;
            }
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.isScrolling = true;

            // Use vertical delta for everything so we don't need to press shift to scroll in horizontal setups
            // double the delta to make it faster
            let delta = event.deltaY * 2;

            this.scrollOffset.x = -delta;
            this.scrollOffset.y = -delta;

            this.isTargetScroll = false;

            this.startAnimationLoop();

            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => (this.isScrolling = false), 80);
            event.preventDefault();
        };

        this.events.scroll = () => {
            const {
                scrollLeft, scrollTop
            } = this.props.viewport;
            if (Math.abs(this.position.x + scrollLeft) > 3) {
                this.position.x = -scrollLeft;
                this.velocity.x = 0;
            }
            if (Math.abs(this.position.y + scrollTop) > 3) {
                this.position.y = -scrollTop;
                this.velocity.y = 0;
            }
        };

        this.events.click = (event) => {
            const state = this.getState();
            const dragOffsetX = this.props.direction !== 'vertical' ? state.dragOffset.x : 0;
            const dragOffsetY = this.props.direction !== 'horizontal' ? state.dragOffset.y : 0;
            if (Math.max(Math.abs(dragOffsetX), Math.abs(dragOffsetY)) > CLICK_EVENT_THRESHOLD_PX) {
                event.preventDefault();
                event.stopPropagation();
            }
            this.props.onClick(state, event);
        };

        this.events.contentLoad = () => this.updateMetrics();
        this.events.resize = () => this.updateMetrics();

        this.props.viewport.addEventListener('mousedown', this.events.pointerdown);
        this.props.viewport.addEventListener('touchstart', this.events.pointerdown);
        this.props.viewport.addEventListener('click', this.events.click);
        this.props.viewport.addEventListener('wheel', this.events.wheel);
        this.props.viewport.addEventListener('scroll', this.events.scroll);
        this.props.content.addEventListener('load', this.events.contentLoad, true);
        window.addEventListener('mousemove', this.events.pointermove);
        window.addEventListener('touchmove', this.events.pointermove);
        window.addEventListener('mouseup', this.events.pointerup);
        window.addEventListener('touchend', this.events.pointerup);
        window.addEventListener('resize', this.events.resize);
    }

    /**
     * Unregister all DOM events
     */
    destroy() {
        this.props.viewport.removeEventListener('mousedown', this.events.pointerdown);
        this.props.viewport.removeEventListener('touchstart', this.events.pointerdown);
        this.props.viewport.removeEventListener('click', this.events.click);
        this.props.viewport.removeEventListener('wheel', this.events.wheel);
        this.props.viewport.removeEventListener('scroll', this.events.scroll);
        this.props.content.removeEventListener('load', this.events.contentLoad);
        window.removeEventListener('mousemove', this.events.pointermove);
        window.removeEventListener('touchmove', this.events.pointermove);
        window.removeEventListener('mouseup', this.events.pointerup);
        window.removeEventListener('touchend', this.events.pointerup);
        window.removeEventListener('resize', this.events.resize);
        this.isRunning = false;
        this.isTargetScroll = false;
        this.props.onScroll = function() {};
    }
}