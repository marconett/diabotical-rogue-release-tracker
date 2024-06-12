const NAV_CALLBACK_TYPES = ["immediate", "input"];
class Nav {
    name = "";
    is_active = false;
    is_locked = false;
    is_locked_hover = false;
    nav_root = null;
    nav_class = "";
    nav_scroll = null;
    mouse_hover = "select";
    mouse_click = "none";
    hover_sound = "";
    action_sound = "";
    selection_required = false;
    grid = false;
    elements = [];
    index = null;
    mouse_index = null;
    last_index = null;
    action_cb_type = null;
    action_cb = null;
    select_cb = null;
    deselect_cb = null;
    past_first_cb = null;
    past_last_cb = null;
    constructor(name, options) {
        this.name = name;
        if (options.nav_root) this.nav_root = options.nav_root;
        if (options.nav_class) this.nav_class = options.nav_class;
        if (options.nav_scroll) this.nav_scroll = options.nav_scroll;
        if (options.mouse_hover) this.mouse_hover = options.mouse_hover;
        if (options.mouse_click) this.mouse_click = options.mouse_click;
        if (options.selection_required) this.selection_required = options.selection_required;
        if (options.grid) this.grid = options.grid ? true : false;
        if (options.hover_sound) this.hover_sound = options.hover_sound;
        if (options.action_sound) this.action_sound = options.action_sound;
        if (this.nav_root && this.nav_class.length) {
            this.parse_elements()
        }
        this.index = null;
        if (NAV_CALLBACK_TYPES.includes(options.action_cb_type)) this.action_cb_type = options.action_cb_type;
        if (typeof options.action_cb === "function") this.action_cb = options.action_cb;
        if (typeof options.select_cb === "function") this.select_cb = options.select_cb;
        if (typeof options.deselect_cb === "function") this.deselect_cb = options.deselect_cb;
        if (typeof options.past_first_cb === "function") this.past_first_cb = options.past_first_cb;
        if (typeof options.past_last_cb === "function") this.past_last_cb = options.past_last_cb;
        if (this.selection_required) {
            this.reset_to_first()
        }
    }
    parse_elements() {
        this.elements.length = 0;
        let idx = 0;
        _for_each_with_class_in_parent(this.nav_root, this.nav_class, (element => {
            this.elements.push(element);
            element.addEventListener("mouseenter", (() => {
                if (this.is_locked) return;
                if (this.is_locked_hover) return;
                if (element.classList.contains("disabled")) return;
                if (this.hover_sound) {
                    _play_buffered_ui_sound(this.hover_sound)
                }
                if (this.mouse_hover !== "none") {
                    let index = this.get_element_index(element);
                    this.select_index(index, "hover");
                    this.mouse_index = index
                }
            }));
            if (this.mouse_hover === "select") {
                element.addEventListener("mouseleave", (() => {
                    if (this.is_locked) return;
                    if (this.is_locked_hover) return;
                    if (element.classList.contains("disabled")) return;
                    this.reset_selection();
                    this.mouse_index = null
                }))
            }
            if (this.mouse_click !== "none") {
                element.addEventListener("click", (e => {
                    if (this.is_locked) return;
                    if (element.classList.contains("disabled")) return;
                    if (this.mouse_click === "select") {
                        this.select_element(element)
                    } else if (this.mouse_click === "action") {
                        if (element.classList.contains("active_selection")) {
                            this.action("enter")
                        } else {
                            this.select_element(element)
                        }
                    } else if (this.mouse_click === "instant-action") {
                        if (!element.classList.contains("active_selection")) {
                            this.select_element(element)
                        }
                        this.action("enter")
                    }
                }))
            }
            if (this.is_active && this.index && this.index === idx) {
                element.classList.add("active_selection");
                if (this.select_cb && typeof this.select_cb === "function") {
                    this.select_cb(element)
                }
            }
            idx++
        }))
    }
    set_active(bool) {
        this.is_active = bool;
        if (this.is_active) {
            if (global_current_input_method === "controller" && this.index === null) {
                this.reset_to_first()
            } else if (this.select_cb && typeof this.select_cb === "function") {
                if (this.index in this.elements) {
                    this.select_cb(this.elements[this.index]);
                    if (this.nav_scroll instanceof HTMLElement) {
                        if (this.index === 0) {
                            resetScrollbar(this.nav_scroll)
                        } else {
                            req_anim_frame((() => {
                                scrollbarScrollToElement(this.nav_scroll, this.elements[this.index])
                            }))
                        }
                    }
                }
            }
        } else {}
    }
    reset_to_first() {
        let found_first = false;
        let index = 0;
        for (index; index < this.elements.length; index++) {
            if (this.elements[index].classList.contains("disabled")) continue;
            found_first = true;
            break
        }
        if (found_first) {
            this.select_index(index, "next")
        } else {
            if (this.deselect_cb && typeof this.deselect_cb === "function") {
                this.deselect_cb()
            }
            this.index = null
        }
    }
    reset_to_last() {
        let found_last = false;
        let index = this.elements.length - 1;
        for (index; index >= 0; index--) {
            if (this.elements[index].classList.contains("disabled")) continue;
            found_last = true;
            break
        }
        if (found_last) {
            this.select_index(index, "next")
        } else {
            if (this.deselect_cb && typeof this.deselect_cb === "function") {
                this.deselect_cb()
            }
            this.index = null
        }
    }
    reset_selection() {
        if (this.index !== null && this.index in this.elements) {
            this.elements[this.index].classList.remove("active_selection");
            if (this.deselect_cb && typeof this.deselect_cb === "function") {
                this.deselect_cb(this.elements[this.index])
            }
            this.index = null
        }
        if (this.selection_required) {
            this.reset_to_first()
        }
    }
    get_element_index(element) {
        for (let i = 0; i < this.elements.length; i++) {
            if (element === this.elements[i]) {
                return i
            }
        }
        return null
    }
    select_element(element) {
        for (let i = 0; i < this.elements.length; i++) {
            if (element === this.elements[i]) {
                this.select_index(i, "next");
                break
            }
        }
    }
    select_index(new_index, action) {
        if (this.is_locked) return;
        if (new_index < 0) return;
        if (!(new_index in this.elements)) return;
        if (this.index in this.elements) {
            this.elements[this.index].classList.remove("active_selection");
            if (this.deselect_cb && typeof this.deselect_cb === "function") {
                this.deselect_cb(this.elements[this.index])
            }
        }
        this.last_index = new_index;
        this.index = new_index;
        this.elements[this.index].classList.add("active_selection");
        if (this.select_cb && typeof this.select_cb === "function") {
            this.select_cb(this.elements[this.index])
        }
        if (this.action_cb_type === "immediate" && typeof this.action_cb === "function") {
            if (this.action_sound) {
                _play_buffered_ui_sound(this.action_sound)
            }
            this.action_cb(this.elements[this.index], action)
        } else {
            if (this.hover_sound) {
                _play_buffered_ui_sound(this.hover_sound)
            }
        }
        if (this.nav_scroll instanceof HTMLElement && action !== "hover") {
            if (this.index === 0) {
                resetScrollbar(this.nav_scroll)
            } else {
                scrollbarScrollToElement(this.nav_scroll, this.elements[this.index])
            }
        }
    }
    prev() {
        let first_prev_index = 0;
        if (this.index !== null) first_prev_index = this.index - 1;
        for (let i = first_prev_index; i >= 0; i--) {
            if (this.elements[i].classList.contains("disabled")) continue;
            this.select_index(i, "prev");
            break
        }
        let first_valid_index = 0;
        for (first_valid_index; first_valid_index < this.elements.length; first_valid_index++) {
            if (this.elements[first_valid_index].classList.contains("disabled")) continue;
            break
        }
        if (first_prev_index < first_valid_index && typeof this.past_first_cb === "function") {
            this.past_first_cb()
        }
    }
    next() {
        let first_next_index = 0;
        if (this.index !== null) first_next_index = this.index + 1;
        for (let i = first_next_index; i < this.elements.length; i++) {
            if (this.elements[i].classList.contains("disabled")) continue;
            this.select_index(i, "next");
            break
        }
        let last_valid_index = this.elements.length - 1;
        for (last_valid_index; last_valid_index >= 0; last_valid_index--) {
            if (this.elements[last_valid_index].classList.contains("disabled")) continue;
            break
        }
        if (first_next_index > last_valid_index && typeof this.past_last_cb === "function") {
            this.past_last_cb()
        }
    }
    up() {
        if (this.grid && this.index !== null) {
            let current_row = this.row_info(this.index);
            let prev_row = this.row_info(current_row.prev_row_index);
            if (prev_row.length < current_row.active_row_index + 1) {
                return
            }
            let up_index = this.index - prev_row.length;
            if (up_index < 0) return;
            if (this.elements[up_index].classList.contains("disabled")) return;
            this.select_index(up_index, "up")
        } else {
            this.prev()
        }
    }
    down() {
        if (this.grid && this.index !== null) {
            let current_row = this.row_info(this.index);
            let next_row = this.row_info(current_row.next_row_index);
            if (next_row.length < current_row.active_row_index + 1) {
                return
            }
            let down_index = this.index + current_row.length;
            if (down_index > this.elements.length - 1) return;
            if (this.elements[down_index].classList.contains("disabled")) return;
            this.select_index(down_index, "down")
        } else {
            this.next()
        }
    }
    action(action) {
        if (this.action_cb_type !== "input") return;
        if (typeof this.action_cb === "function") {
            if (this.index in this.elements) {
                if (this.action_sound) {
                    engine.call("ui_sound", this.action_sound)
                }
                this.action_cb(this.elements[this.index], action)
            }
        }
    }
    lock(type) {
        if (type) {
            if (type === "hover") {
                this.is_locked_hover = true
            }
        } else {
            this.is_locked = true
        }
    }
    unlock() {
        this.is_locked = false;
        this.is_locked_hover = false
    }
    row_info(index) {
        let active_row_index = null;
        let prev_row_index = null;
        let next_row_index = null;
        let row_elements = null;
        if (index in this.elements) {
            row_elements = this.elements[index].parentElement.getElementsByClassName(this.nav_class);
            for (var i = 0; i < row_elements.length; i++) {
                if (this.elements[index] === row_elements[i]) {
                    active_row_index = i;
                    prev_row_index = index - i - 1;
                    next_row_index = index + (row_elements.length - i)
                }
            }
        }
        return {
            length: row_elements ? row_elements.length : 0,
            active_row_index: active_row_index,
            next_row_index: next_row_index,
            prev_row_index: prev_row_index
        }
    }
}
const Navigation = new function() {
    this.current_element = null;
    let active_lb_rb = null;
    let active_lt_rt = null;
    let active_up_down = null;
    let active_left_right = null;
    let active_action_nav = null;
    let hud_override_active = false;
    let active_hud_lb_rb = null;
    let active_hud_lt_rt = null;
    let active_hud_up_down = null;
    let active_hud_left_right = null;
    let active_hud_action_nav = null;
    let modal_override_active = false;
    let active_modal_lb_rb = null;
    let active_modal_lt_rt = null;
    let active_modal_up_down = null;
    let active_modal_left_right = null;
    let active_modal_action_nav = null;
    let listeners = {};
    let nav_cache = {};
    this.generate_nav = options => {
        if (options.name) {
            if (options.name in nav_cache) {
                if (active_lt_rt && active_lt_rt.name === options.name) {
                    active_lt_rt.set_active(false);
                    active_lt_rt = null
                }
                if (active_lb_rb && active_lb_rb.name === options.name) {
                    active_lb_rb.set_active(false);
                    active_lb_rb = null
                }
                if (active_up_down && active_up_down.name === options.name) {
                    active_up_down.set_active(false);
                    active_up_down = null
                }
                if (active_left_right && active_left_right.name === options.name) {
                    active_left_right.set_active(false);
                    active_left_right = null
                }
            }
            nav_cache[options.name] = new Nav(options.name, options)
        } else {
            console.error("Missing nav name!", _dump(options))
        }
    };
    this.refresh_elements = name => {
        if (name in nav_cache) {
            nav_cache[name].parse_elements()
        }
    };

    function get_active_ref(type) {
        if (type === "lb_rb") {
            if (modal_override_active) return active_modal_lb_rb;
            else if (hud_override_active && global_active_view === "hud") return active_hud_lb_rb;
            return active_lb_rb
        } else if (type === "lt_rt") {
            if (modal_override_active) return active_modal_lt_rt;
            else if (hud_override_active && global_active_view === "hud") return active_hud_lt_rt;
            return active_lt_rt
        } else if (type === "up_down") {
            if (modal_override_active) return active_modal_up_down;
            else if (hud_override_active && global_active_view === "hud") return active_hud_up_down;
            return active_up_down
        } else if (type === "left_right") {
            if (modal_override_active) return active_modal_left_right;
            else if (hud_override_active && global_active_view === "hud") return active_hud_left_right;
            return active_left_right
        } else if (type === "action") {
            if (modal_override_active) return active_modal_action_nav;
            else if (hud_override_active && global_active_view === "hud") return active_hud_action_nav;
            return active_action_nav
        }
    }
    this.init = () => {
        document.addEventListener("keydown", (e => {
            if (chat_is_open) return;
            let lb_rb = get_active_ref("lb_rb");
            let lt_rt = get_active_ref("lt_rt");
            let up_down = get_active_ref("up_down");
            let left_right = get_active_ref("left_right");
            let action = get_active_ref("action");
            if (e.which === 38) {
                if (up_down) up_down.up()
            } else if (e.which === 40) {
                if (up_down) up_down.down()
            } else if (e.which === 33) {
                if (lb_rb) lb_rb.prev()
            } else if (e.which === 34) {
                if (lb_rb) lb_rb.next()
            } else if (e.which === 36) {
                if (lt_rt) lt_rt.prev();
                else if (!modal_override_active && "lt" in listeners && global_menu_page in listeners["lt"]) listeners["lt"][global_menu_page]("lt")
            } else if (e.which === 35) {
                if (lt_rt) lt_rt.next();
                else if (!modal_override_active && "rt" in listeners && global_menu_page in listeners["rt"]) listeners["rt"][global_menu_page]("rt")
            } else if (e.which === 37) {
                if (left_right) left_right.prev();
                else if (action) action.action("prev")
            } else if (e.which === 39) {
                if (left_right) left_right.next();
                else if (action) action.action("next")
            } else if (e.which === 46) {
                if (action) action.action("delete")
            } else {
                if (!modal_override_active && e.key in listeners && global_menu_page in listeners[e.key]) {
                    listeners[e.key][global_menu_page](e.key)
                }
            }
        }));
        on_input_method_change.push((input_method => {
            let lb_rb = get_active_ref("lb_rb");
            let lt_rt = get_active_ref("lt_rt");
            let up_down = get_active_ref("up_down");
            let left_right = get_active_ref("left_right");
            if (input_method === "kbm") {
                if (lb_rb && lb_rb.mouse_hover !== "none") {
                    lb_rb.reset_selection();
                    if (lb_rb.mouse_index !== null) lb_rb.select_index(lb_rb.mouse_index, "next")
                }
                if (lt_rt && lt_rt.mouse_hover !== "none") {
                    lt_rt.reset_selection();
                    if (lt_rt.mouse_index !== null) lt_rt.select_index(lt_rt.mouse_index, "next")
                }
                if (up_down && up_down.mouse_hover !== "none") {
                    up_down.reset_selection();
                    if (up_down.mouse_index !== null) up_down.select_index(up_down.mouse_index, "next")
                }
                if (left_right && left_right.mouse_hover !== "none") {
                    left_right.reset_selection();
                    if (left_right.mouse_index !== null) left_right.select_index(left_right.mouse_index, "next")
                }
            } else if (input_method === "controller") {
                if (lb_rb && !lb_rb.selection_required && lb_rb.last_index !== null) {
                    lb_rb.reset_selection();
                    lb_rb.select_index(lb_rb.last_index, "next")
                }
                if (lt_rt && !lt_rt.selection_required && lt_rt.last_index !== null) {
                    lt_rt.reset_selection();
                    lt_rt.select_index(lt_rt.last_index, "next")
                }
                if (up_down && !up_down.selection_required && up_down.last_index !== null) {
                    up_down.reset_selection();
                    up_down.select_index(up_down.last_index, "next")
                }
                if (left_right && !left_right.selection_required && left_right.last_index !== null) {
                    left_right.reset_selection();
                    left_right.select_index(left_right.last_index, "next")
                }
            }
            this.refresh_actions()
        }))
    };
    this.listen = (menu_screen, key, cb) => {
        if (typeof cb !== "function") return;
        if (!(key in listeners)) listeners[key] = {};
        listeners[key][menu_screen] = cb
    };
    this.log_active = () => {
        console.log("active_lb_rb:", get_active_ref("lb_rb") ? get_active_ref("lb_rb").name : "-");
        console.log("active_lt_rt:", get_active_ref("lt_rt") ? get_active_ref("lt_rt").name : "-");
        console.log("active_up_down:", get_active_ref("up_down") ? get_active_ref("up_down").name : "-");
        console.log("active_left_right:", get_active_ref("left_right") ? get_active_ref("left_right").name : "-")
    };
    this.reset_active = () => {
        if (active_lb_rb) {
            active_lb_rb.set_active(false);
            active_lb_rb = null
        }
        if (active_lt_rt) {
            active_lt_rt.set_active(false);
            active_lt_rt = null
        }
        if (active_up_down) {
            active_up_down.set_active(false);
            active_up_down = null
        }
        if (active_left_right) {
            active_left_right.set_active(false);
            active_left_right = null
        }
        if (active_action_nav) {
            active_action_nav.set_active(false);
            active_action_nav = null
        }
    };
    this.get_active = type => {
        if (type === "lt_rt") {
            if (active_lt_rt) return active_lt_rt.name
        } else if (type === "lb_rb") {
            if (active_lb_rb) return active_lb_rb.name
        } else if (type === "up_down") {
            if (active_up_down) return active_up_down.name
        } else if (type === "left_right") {
            if (active_left_right) return active_left_right.name
        }
        return null
    };
    this.set_active = options => {
        if ("lt_rt" in options) {
            if (active_lt_rt) active_lt_rt.set_active(false);
            if (options.lt_rt in nav_cache) {
                active_lt_rt = nav_cache[options.lt_rt];
                active_lt_rt.set_active(true);
                if (active_lt_rt.action_cb_type === "input") {
                    active_action_nav = active_lt_rt;
                    console.log("set action nav to: lt_rt", active_action_nav.name)
                }
            } else {
                active_lt_rt = null
            }
        }
        if ("lb_rb" in options) {
            if (active_lb_rb) active_lb_rb.set_active(false);
            if (options.lb_rb in nav_cache) {
                active_lb_rb = nav_cache[options.lb_rb];
                active_lb_rb.set_active(true);
                if (active_lb_rb.action_cb_type === "input") {
                    active_action_nav = active_lb_rb;
                    console.log("set action nav to: lb_rb", active_action_nav.name)
                }
            } else {
                active_lb_rb = null
            }
        }
        if ("up_down" in options) {
            if (active_up_down) active_up_down.set_active(false);
            if (options.up_down in nav_cache) {
                active_up_down = nav_cache[options.up_down];
                active_up_down.set_active(true);
                if (active_up_down.action_cb_type === "input") {
                    active_action_nav = active_up_down;
                    console.log("set action nav to: up_down", active_action_nav.name)
                }
            } else {
                active_up_down = null
            }
        }
        if ("left_right" in options) {
            if (active_left_right) active_left_right.set_active(false);
            if (options.left_right in nav_cache) {
                active_left_right = nav_cache[options.left_right];
                active_left_right.set_active(true);
                if (active_left_right.action_cb_type === "input") {
                    active_action_nav = active_left_right;
                    console.log("set action nav to: left_right", active_action_nav.name)
                }
            } else {
                active_left_right = null
            }
        }
    };
    this.reset = options => {
        if (typeof options === "string") {
            options = [options]
        } else if (!Array.isArray(options)) {
            console.error("Navigation.reset() wrong param type", typeof options);
            return
        }
        if ((options.includes("reset_all") || options.includes("left_right")) && active_left_right) {
            active_left_right.reset_to_first()
        }
        if ((options.includes("reset_all") || options.includes("up_down")) && active_up_down) {
            active_up_down.reset_to_first()
        }
        if ((options.includes("reset_all") || options.includes("lb_rb")) && active_lb_rb) {
            active_lb_rb.reset_to_first()
        }
        if ((options.includes("reset_all") || options.includes("lt_rt")) && active_lt_rt) {
            active_lt_rt.reset_to_first()
        }
    };
    this.set_override_inactive = type => {
        if (type === "hud") {
            hud_override_active = false;
            if (active_hud_lb_rb) active_hud_lb_rb.set_active(false);
            if (active_hud_lt_rt) active_hud_lt_rt.set_active(false);
            if (active_hud_up_down) active_hud_up_down.set_active(false);
            if (active_hud_left_right) active_hud_left_right.set_active(false);
            if (active_hud_action_nav) active_hud_action_nav.set_active(false);
            active_hud_lb_rb = null;
            active_hud_lt_rt = null;
            active_hud_up_down = null;
            active_hud_left_right = null;
            active_hud_action_nav = null
        } else if (type === "modal") {
            modal_override_active = false;
            if (active_modal_lb_rb) active_modal_lb_rb.set_active(false);
            if (active_modal_lt_rt) active_modal_lt_rt.set_active(false);
            if (active_modal_up_down) active_modal_up_down.set_active(false);
            if (active_modal_left_right) active_modal_left_right.set_active(false);
            if (active_modal_action_nav) active_modal_action_nav.set_active(false);
            active_modal_lb_rb = null;
            active_modal_lt_rt = null;
            active_modal_up_down = null;
            active_modal_left_right = null;
            active_modal_action_nav = null
        }
    };
    this.set_override_active = (type, options) => {
        if (type === "hud") {
            hud_override_active = true;
            if ("lt_rt" in options) {
                if (active_hud_lt_rt) active_hud_lt_rt.set_active(false);
                if (options.lt_rt in nav_cache) {
                    active_hud_lt_rt = nav_cache[options.lt_rt];
                    active_hud_lt_rt.set_active(true);
                    if (active_hud_lt_rt.action_cb_type === "input") {
                        active_hud_action_nav = active_hud_lt_rt;
                        console.log("set hud override action nav to: lt_rt", active_hud_action_nav.name)
                    }
                } else {
                    active_hud_lt_rt = null
                }
            } else if ("lb_rb" in options) {
                if (active_hud_lb_rb) active_hud_lb_rb.set_active(false);
                if (options.lb_rb in nav_cache) {
                    active_hud_lb_rb = nav_cache[options.lb_rb];
                    active_hud_lb_rb.set_active(true);
                    if (active_hud_lb_rb.action_cb_type === "input") {
                        active_hud_action_nav = active_hud_lb_rb;
                        console.log("set hud override action nav to: lb_rb", active_hud_action_nav.name)
                    }
                } else {
                    active_hud_lb_rb = null
                }
            } else if ("up_down" in options) {
                if (active_hud_up_down) active_hud_up_down.set_active(false);
                if (options.up_down in nav_cache) {
                    active_hud_up_down = nav_cache[options.up_down];
                    active_hud_up_down.set_active(true);
                    if (active_hud_up_down.action_cb_type === "input") {
                        active_hud_action_nav = active_hud_up_down;
                        console.log("set hud override action nav to: up_down", active_hud_action_nav.name)
                    }
                } else {
                    active_hud_up_down = null
                }
            } else if ("left_right" in options) {
                if (active_hud_left_right) active_hud_left_right.set_active(false);
                if (options.left_right in nav_cache) {
                    active_hud_left_right = nav_cache[options.left_right];
                    active_hud_left_right.set_active(true);
                    if (active_hud_left_right.action_cb_type === "input") {
                        active_hud_action_nav = active_hud_left_right;
                        console.log("set hud override action nav to: left_right", active_hud_action_nav.name)
                    }
                } else {
                    active_hud_left_right = null
                }
            }
        } else if (type === "modal") {
            modal_override_active = true;
            if ("lt_rt" in options) {
                if (active_modal_lt_rt) active_modal_lt_rt.set_active(false);
                if (options.lt_rt in nav_cache) {
                    active_modal_lt_rt = nav_cache[options.lt_rt];
                    active_modal_lt_rt.set_active(true);
                    if (active_modal_lt_rt.action_cb_type === "input") {
                        active_modal_action_nav = active_modal_lt_rt;
                        console.log("set modal override action nav to: lt_rt", active_modal_action_nav.name)
                    }
                } else {
                    active_modal_lt_rt = null
                }
            } else if ("lb_rb" in options) {
                if (active_modal_lb_rb) active_modal_lb_rb.set_active(false);
                if (options.lb_rb in nav_cache) {
                    active_modal_lb_rb = nav_cache[options.lb_rb];
                    active_modal_lb_rb.set_active(true);
                    if (active_modal_lb_rb.action_cb_type === "input") {
                        active_modal_action_nav = active_modal_lb_rb;
                        console.log("set modal override action nav to: lb_rb", active_modal_action_nav.name)
                    }
                } else {
                    active_modal_lb_rb = null
                }
            } else if ("up_down" in options) {
                if (active_modal_up_down) active_modal_up_down.set_active(false);
                if (options.up_down in nav_cache) {
                    active_modal_up_down = nav_cache[options.up_down];
                    active_modal_up_down.set_active(true);
                    if (active_modal_up_down.action_cb_type === "input") {
                        active_modal_action_nav = active_modal_up_down;
                        console.log("set modal override action nav to: up_down", active_modal_action_nav.name)
                    }
                } else {
                    active_modal_up_down = null
                }
            } else if ("left_right" in options) {
                if (active_modal_left_right) active_modal_left_right.set_active(false);
                if (options.left_right in nav_cache) {
                    active_modal_left_right = nav_cache[options.left_right];
                    active_modal_left_right.set_active(true);
                    if (active_modal_left_right.action_cb_type === "input") {
                        active_modal_action_nav = active_modal_left_right;
                        console.log("set modal override action nav to: left_right", active_modal_action_nav.name)
                    }
                } else {
                    active_modal_left_right = null
                }
            }
        }
    };
    this.prev = name => {
        if (name in nav_cache) {
            nav_cache[name].prev()
        }
    };
    this.next = name => {
        if (name in nav_cache) {
            nav_cache[name].next()
        }
    };
    this.reset_selection = name => {
        if (!(name in nav_cache)) return;
        nav_cache[name].reset_selection()
    };
    this.reset_to_last = name => {
        if (!(name in nav_cache)) return;
        nav_cache[name].reset_to_last()
    };
    this.select_element = (name, element) => {
        if (!(name in nav_cache)) return;
        nav_cache[name].select_element(element)
    };
    this.lock_nav = (name, type) => {
        if (!(name in nav_cache)) return;
        nav_cache[name].lock(type)
    };
    this.unlock_nav = name => {
        if (!(name in nav_cache)) return;
        nav_cache[name].unlock()
    };
    let actions_list = [];
    let actions_container = null;
    this.render_actions = (actions, container) => {
        actions_container = container;
        actions_list = actions;
        if (!container) return;
        _empty(container);
        for (let action of actions) {
            if (global_current_input_method === "kbm" && action.controller_only) {
                continue
            }
            if (global_current_input_method === "controller" && action.kbm_only) {
                continue
            }
            let btn = _createElement("div", "btn");
            let bind = _createElement("div", "bind");
            if (global_current_input_method === "kbm") {
                if (action.kbm_bind) {
                    bind.textContent = action.kbm_bind;
                    bind.style.display = "flex"
                } else {
                    bind.style.display = "none"
                }
            } else if (global_current_input_method === "controller") {
                if (action.controller_bind) {
                    bind.textContent = action.controller_bind;
                    bind.style.display = "flex"
                } else {
                    bind.style.display = "none"
                }
            }
            let label = "";
            if (action.i18n) label = localize(action.i18n);
            else if (action.text) label = action.text;
            let text = _createElement("div", "action", label);
            if (action.i18n) {
                text.classList.add("i18n");
                text.dataset.i18n = action.i18n
            }
            btn.appendChild(bind);
            btn.appendChild(text);
            container.appendChild(btn);
            btn.addEventListener("mouseenter", (e => {
                _play_buffered_ui_sound("ui_hover2");
                btn.classList.add("hover");
                bind.classList.add("hover")
            }));
            btn.addEventListener("mouseleave", (e => {
                btn.classList.remove("hover");
                bind.classList.remove("hover")
            }));
            btn.addEventListener("click", (e => {
                if (typeof action.callback === "function") {
                    _play_buffered_ui_sound("ui_click1");
                    action.callback()
                }
            }))
        }
    };
    this.refresh_actions = () => {
        this.render_actions(actions_list, actions_container)
    };
    this.on_screen_action_input = key => {
        for (let a of actions_list) {
            if (!a.kbm_bind.trim()) continue;
            if (key === a.kbm_bind.toLowerCase() && typeof a.callback === "function") {
                a.callback()
            }
        }
    }
};
const global_action_buttons = {
    back: {
        text: "Back",
        i18n: "menu_button_back",
        kbm_bind: "ESC",
        controller_bind: "B",
        callback: () => {
            historyBack()
        }
    }
};
const on_input_method_change = [];
let global_current_input_method = "";

function set_input_method(input_method) {
    if (input_method !== "kbm" && input_method !== "controller") return;
    if (input_method !== global_current_input_method) {
        console.log("set_input_method:", input_method);
        global_current_input_method = input_method;
        for (let cb of on_input_method_change) {
            if (typeof cb === "function") {
                cb(input_method)
            }
        }
        refresh_navigation_elements()
    }
}

function refresh_navigation_elements(root) {
    if (!root || !root.nodeType) {
        root = document.body
    }
    if (global_current_input_method === "controller") {
        _for_each_with_class_in_parent(root, "controller_element", (el => {
            el.style.display = "flex"
        }));
        _for_each_with_class_in_parent(root, "kbm_element", (el => {
            el.style.display = "none"
        }))
    } else if (global_current_input_method === "kbm") {
        _for_each_with_class_in_parent(root, "controller_element", (el => {
            el.style.display = "none"
        }));
        _for_each_with_class_in_parent(root, "kbm_element", (el => {
            el.style.display = "flex"
        }))
    }
}