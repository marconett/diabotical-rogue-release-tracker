let global_scrollbar_mousemove_listeners = [];
document.addEventListener("mousemove", (e => {
    for (let scrollbar of global_scrollbar_mousemove_listeners) {
        scrollbar(e)
    }
}));
class Scrollbar {
    constructor(outer, idx, hide_empty, options) {
        let _this = this;
        this.options = options;
        this.outer = outer;
        this.outer.dataset.scrollIdx = idx;
        this.inner = _get_first_with_class_in_parent(this.outer, "scroll-inner");
        this.bar = _get_first_with_class_in_parent(this.outer, "scroll-bar");
        this.thumb = _get_first_with_class_in_parent(this.bar, "scroll-thumb");
        this.content = _get_first_with_class_in_parent(this.inner, "scroll-content");
        this.rect_inner = this.inner.getBoundingClientRect();
        this.rect_content = null;
        if (this.content) this.rect_content = this.content.getBoundingClientRect();
        this.max_scroll = this.inner.scrollHeight - this.rect_inner.height;
        this.scrollIsActive = false;
        this.scrollDistanceTop = 0;
        this.hide_empty = false;
        if (hide_empty) this.hide_empty = true;
        this.has_scrolled = false;
        this.scroll_origin = 0;
        this.barIsHovered = false;
        this.thumb_height = 0;
        if (this.options && this.options.outside) {
            this.bar.classList.add("outside")
        }
        this.updateThumbSize();
        let inner_style = window.getComputedStyle(this.inner);
        this.inner_padding = inner_style.getPropertyValue("padding-right");
        this.inner.addEventListener("scroll", (() => {
            this.rect_inner = this.inner.getBoundingClientRect();
            this.updateThumbSize();
            this.updateThumbPositionFromScroll();
            this.close_selects()
        }));
        this.bar.addEventListener("mousedown", (e => {
            this.updateThumbSize();
            this.max_scroll = this.inner.scrollHeight - this.rect_inner.height;
            let rect_thumb = this.thumb.getBoundingClientRect();
            this.scrollDistanceTop = e.clientY - rect_thumb.y;
            this.updateThumbPosition(e);
            this.scrollIsActive = true;
            this.has_scrolled = false;
            this.scroll_origin = e.clientY;
            e.stopPropagation()
        }));
        document.addEventListener("mouseup", (() => {
            if (this.scrollIsActive) {
                this.scrollIsActive = false;
                if (this.has_scrolled) req_anim_frame((() => {
                    this.has_scrolled = false
                }))
            }
            this.mouseUp()
        }));
        let mousemove = function(e) {
            if (!_this.scrollIsActive) return;
            if (Math.abs(_this.scroll_origin - e.clientY) > 10) {
                _this.has_scrolled = true
            }
            _this.updateThumbPosition(e)
        };
        global_scrollbar_mousemove_listeners.push(mousemove);
        this.thumb.addEventListener("click", (e => {
            e.stopPropagation()
        }));
        this.bar.addEventListener("click", (e => {
            if (this.has_scrolled) return;
            e.stopPropagation();
            let rect_thumb = this.thumb.getBoundingClientRect();
            let scroll_distance = window.innerHeight / 100 * 30;
            if (e.clientY > rect_thumb.y) {
                this.inner.scrollTop = this.inner.scrollTop + scroll_distance
            } else {
                this.inner.scrollTop = this.inner.scrollTop - scroll_distance
            }
            this.updateThumbPositionFromScroll();
            this.inner.dispatchEvent(new CustomEvent("scroll"))
        }));
        this.bar.addEventListener("mouseenter", (() => {
            this.barIsHovered = true;
            this.updateScrollbarActiveVisual(true);
            this.thumb.classList.add("hover")
        }));
        this.bar.addEventListener("mouseleave", (() => {
            this.barIsHovered = false;
            if (!this.scrollIsActive) {
                this.updateScrollbarActiveVisual(false);
                this.thumb.classList.remove("hover")
            }
        }))
    }
    mouseUp() {
        if (this.scrollIsActive) {
            this.scrollIsActive = false
        }
        if (!this.barIsHovered) {
            this.updateScrollbarActiveVisual(false);
            this.thumb.classList.remove("hover")
        }
    }
    updateThumbPositionFromScroll() {
        this.max_scroll = this.inner.scrollHeight - this.rect_inner.height;
        let scroll_perc = this.inner.scrollTop / this.max_scroll;
        if (this.inner.scrollTop > this.max_scroll) {
            scroll_perc = 1
        }
        let rect_bar = this.bar.getBoundingClientRect();
        this.thumb.style.top = (rect_bar.height - this.thumb_height) * scroll_perc + "px"
    }
    updateThumbPosition(e) {
        let rect_thumb = this.thumb.getBoundingClientRect();
        let rect_bar = this.bar.getBoundingClientRect();
        let pos = e.clientY - rect_bar.y - this.scrollDistanceTop;
        let max_pos = rect_bar.height - rect_thumb.height;
        let perc = pos / max_pos;
        let scroll_perc = 0;
        if (perc <= 0) {
            scroll_perc = 0;
            this.thumb.style.top = 0
        } else if (perc >= 1) {
            scroll_perc = 1;
            this.thumb.style.top = max_pos + "px"
        } else {
            scroll_perc = perc;
            this.thumb.style.top = pos + "px"
        }
        this.inner.scrollTop = this.max_scroll * scroll_perc;
        this.inner.dispatchEvent(new CustomEvent("scroll"))
    }
    resetScrollPosition(e) {
        req_anim_frame((() => {
            this.inner.scrollTop = 0;
            this.thumb.style.top = 0
        }))
    }
    bottomScrollPosition(e) {
        this.rect_inner = this.inner.getBoundingClientRect();
        this.max_scroll = this.inner.scrollHeight - this.rect_inner.height;
        this.inner.scrollTop = this.max_scroll;
        this.updateThumbSize((() => {
            this.inner.scrollTop = this.max_scroll;
            this.updateThumbPositionFromScroll()
        }))
    }
    updateThumbSize(cb, no_delay) {
        let update_size = () => {
            this.rect_inner = this.inner.getBoundingClientRect();
            if (Math.ceil(this.rect_inner.height) >= this.inner.scrollHeight) {
                this.thumb.style.height = 0;
                if (this.hide_empty) {
                    this.bar.classList.add("scroll-bar-hidden");
                    this.inner.style.paddingRight = 0;
                    let trackEl = _get_first_with_class_in_parent(this.bar, "scroll-bar-track");
                    if (trackEl) {
                        trackEl.style.display = "none"
                    }
                    this.resetScrollPosition()
                }
            } else {
                if (this.hide_empty) {
                    this.bar.classList.remove("scroll-bar-hidden");
                    if (this.options && this.options.outside) {
                        this.inner.style.paddingRight = 0
                    } else {
                        this.inner.style.paddingRight = this.inner_padding
                    }
                    let trackEl = _get_first_with_class_in_parent(this.bar, "scroll-bar-track");
                    if (trackEl) {
                        trackEl.style.display = "flex"
                    }
                }
                let perc = Math.floor(this.rect_inner.height) / this.inner.scrollHeight;
                if (perc < .15) perc = .15;
                this.thumb_height = perc * this.rect_inner.height;
                this.thumb.style.height = this.thumb_height + "px";
                this.updateThumbPositionFromScroll()
            }
            if (cb) cb()
        };
        if (no_delay) {
            update_size()
        } else {
            req_anim_frame(update_size)
        }
    }
    updateScrollbarActiveVisual(active) {
        let thumbEl = _get_first_with_class_in_parent(this.thumb, "scroll-thumb-inner");
        if (thumbEl) {
            if (active) {
                thumbEl.classList.add("active")
            } else {
                thumbEl.classList.remove("active")
            }
        }
        let trackEl = _get_first_with_class_in_parent(this.bar, "scroll-bar-track");
        if (trackEl) {
            if (active) {
                trackEl.classList.add("active")
            } else {
                trackEl.classList.remove("active")
            }
        }
    }
    close_selects() {
        if (typeof _living_select_lists_ids !== "undefined") {
            for (let id in _living_select_lists_ids) {
                if (id === this.outer.id) continue;
                _close_select_by_id(id)
            }
        }
    }
    scrollToElement(element) {
        if (!this.inner.contains(element)) return;
        this.rect_inner = this.inner.getBoundingClientRect();
        let rect_element = element.getBoundingClientRect();
        let element_offset_top = 0;
        let element_offset_bottom = 0;
        if (this.content) {
            this.rect_content = this.content.getBoundingClientRect();
            element_offset_top = rect_element.y - this.rect_content.y;
            element_offset_bottom = element_offset_top + rect_element.height
        } else {
            element_offset_top = element.offsetTop;
            element_offset_bottom = element_offset_top + rect_element.height
        }
        if (element_offset_bottom > this.inner.scrollTop + this.rect_inner.height) {
            let scrollTop = element_offset_bottom - this.rect_inner.height;
            this.inner.scrollTop = scrollTop
        } else if (this.inner.scrollTop > element_offset_top) {
            this.inner.scrollTop = element_offset_top
        }
        this.updateThumbPositionFromScroll()
    }
}
let global_scrollbarTracker = [];
let global_scrollbarTrackerId = 0;

function initialize_scrollbars(options) {
    let scrollbars = document.getElementsByClassName("scroll-outer");
    for (global_scrollbarTrackerId = 0; global_scrollbarTrackerId < scrollbars.length; global_scrollbarTrackerId++) {
        let hide_empty = false;
        if ("sbHideEmpty" in scrollbars[global_scrollbarTrackerId].dataset && scrollbars[global_scrollbarTrackerId].dataset.sbHideEmpty == "true") {
            hide_empty = true
        }
        if ("sbOutside" in scrollbars[global_scrollbarTrackerId].dataset && scrollbars[global_scrollbarTrackerId].dataset.sbOutside == "true") {
            if (!options) options = {};
            options.outside = true
        }
        global_scrollbarTracker[global_scrollbarTrackerId] = new Scrollbar(scrollbars[global_scrollbarTrackerId], global_scrollbarTrackerId, hide_empty, options)
    }
}

function initialize_scrollbar(el, options) {
    let sb_id = global_scrollbarTrackerId++;
    let hide_empty = false;
    if ("sbHideEmpty" in el.dataset && el.dataset.sbHideEmpty == "true") hide_empty = true;
    if ("sbOutside" in el.dataset && el.dataset.sbOutside == "true") {
        if (!options) options = {};
        options.outside = true
    }
    global_scrollbarTracker[sb_id] = new Scrollbar(el, sb_id, hide_empty, options)
}

function refreshScrollbar(el) {
    if (el.classList.contains("scroll-outer")) {
        let scrollbar = global_scrollbarTracker[Number(el.dataset.scrollIdx)];
        let tmp = _createElement("div", "forceRedraw");
        tmp.style.height = "1px";
        tmp.style.width = "1px";
        tmp.style.visibility = "hidden";
        scrollbar.inner.appendChild(tmp);
        scrollbar.updateThumbSize();
        scrollbar.inner.removeChild(tmp);
        scrollbar.mouseUp()
    }
}

function refreshScrollbars(el) {
    _for_each_with_class_in_parent(el, "scroll-outer", (function(el) {
        refreshScrollbar(el)
    }))
}

function resetScrollbar(el) {
    if (el.classList.contains("scroll-outer")) {
        global_scrollbarTracker[Number(el.dataset.scrollIdx)].resetScrollPosition()
    }
}

function reloadScrollbarSize(el) {
    if (el.classList.contains("scroll-outer")) {
        global_scrollbarTracker[Number(el.dataset.scrollIdx)].updateThumbSize()
    }
}

function scrollbarScrollBottom(el) {
    if (el.classList.contains("scroll-outer")) {
        let scrollbar = global_scrollbarTracker[Number(el.dataset.scrollIdx)];
        let tmp = _createElement("div", "forceRedraw");
        tmp.style.height = "1px";
        tmp.style.width = "1px";
        tmp.style.visibility = "hidden";
        scrollbar.inner.appendChild(tmp);
        scrollbar.bottomScrollPosition();
        scrollbar.inner.removeChild(tmp)
    }
}

function scrollbarScrollToElement(el, target) {
    if (el.classList.contains("scroll-outer")) {
        global_scrollbarTracker[Number(el.dataset.scrollIdx)].scrollToElement(target)
    }
}

function createScrollBar(el) {
    let scroll_outer = _createElement("div", "scroll-outer");
    scroll_outer.setAttribute("data-sb-hide-empty", true);
    let sb = _createElement("div", ["scroll-bar", "scroll-bar-hidden"]);
    sb.appendChild(_createElement("div", "scroll-thumb"));
    scroll_outer.appendChild(sb);
    let sb_inner = _createElement("div", "scroll-inner");
    scroll_outer.appendChild(sb_inner);
    el.appendChild(scroll_outer);
    new Scrollbar(el, global_scrollbarTrackerId++, true);
    return sb_inner
}
var global_scrollboosters = {};
var global_scrollbooster_bars = {};
class ScrollBoosterBar {
    constructor(element) {
        this.cont = element;
        this.viewport = {
            width: 0,
            height: 0
        };
        this.content = {
            width: 0,
            height: 0
        };
        this.thumb_width_perc = 0;
        this.initBar();
        this.onScroll = undefined
    }
    initBar() {
        this.bar = _createElement("div", "scrollboost-bar");
        this.thumb = _createElement("div", "thumb");
        this.bar.appendChild(this.thumb);
        this.cont.appendChild(this.bar);
        this.bar.addEventListener("mousedown", (e => {
            let rect_thumb = this.thumb.getBoundingClientRect();
            this.scrollDistance = e.clientX - rect_thumb.x;
            this.updateThumbPosition(e);
            this.scrollIsActive = true;
            e.stopPropagation()
        }));
        document.addEventListener("mouseup", (() => {
            if (this.scrollIsActive) {
                this.scrollIsActive = false
            }
        }));
        document.addEventListener("mousemove", (e => {
            if (!this.scrollIsActive) return;
            this.updateThumbPosition(e)
        }))
    }
    updateThumbPosition(e) {
        let rect_thumb = this.thumb.getBoundingClientRect();
        let rect_bar = this.bar.getBoundingClientRect();
        let pos = e.clientX - rect_bar.x - this.scrollDistance;
        let max_pos = rect_bar.width - rect_thumb.width;
        let perc = pos / max_pos;
        let scroll_perc = 0;
        if (perc <= 0) {
            scroll_perc = 0
        } else if (perc >= 1) {
            scroll_perc = 1
        } else {
            scroll_perc = perc
        }
        this.thumb.style.left = (100 - this.thumb_width_perc) * scroll_perc + "%";
        let position = (this.content.width - this.viewport.width) * scroll_perc;
        if (typeof this.onScroll === "function") this.onScroll(position, 0)
    }
    updateThumb(perc_x, perc_y, viewport, content) {
        this.viewport = viewport;
        this.content = content;
        this.thumb_width_perc = viewport.width / content.width * 100;
        if (this.thumb_width_perc > 100) this.thumb_width_perc = 100;
        if (this.thumb_width_perc < 0) this.thumb_width_perc = 0;
        this.thumb.style.width = this.thumb_width_perc + "%";
        this.thumb.style.left = (100 - this.thumb_width_perc) * perc_x + "%";
        if (this.viewport.width >= this.content.width) {
            this.bar.style.display = "none"
        } else {
            this.bar.style.display = "block"
        }
    }
    destroy() {
        this.onScroll = undefined
    }
}