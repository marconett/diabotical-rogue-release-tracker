class MenuComponent {
    constructor(component_name, root, init_handler, active_screens) {
        this.name = component_name;
        this.root = root;
        this.init = init_handler;
        this.active_screens = active_screens;
        if (active_screens && Array.isArray(active_screens)) {
            for (let screen_name of active_screens) {
                if (!(screen_name in global_components_screen_map)) {
                    global_components_screen_map[screen_name] = []
                }
                global_components_screen_map[screen_name].push(this)
            }
        }
    }
}
var global_components = {};
var global_components_screen_map = {};
class MenuScreen {
    game_id = 0;
    name = "";
    screen_element = null;
    button_element = null;
    fullscreen = false;
    init = () => {};
    open_handler = null;
    close_handler = null;
    post_open_handler = null;
    post_close_handler = null;
    sound_open = null;
    sound_close = null;
    opening = false;
    opacity_filter_regex = /opacity\((\d)/;
    on_open_animation_end_handlers = [];
    on_close_animation_end_handlers = [];
    right_side_panel = false;
    constructor(options) {
        if ("game_id" in options) {
            this.game_id = options.game_id
        }
        if ("name" in options) {
            this.name = options.name.toLowerCase()
        }
        if ("screen_element" in options) {
            this.screen_element = options.screen_element
        }
        if ("button_element" in options) {
            this.button_element = options.button_element
        }
        if ("fullscreen" in options) {
            this.fullscreen = options.fullscreen
        }
        if ("sound_open" in options) {
            this.sound_open = options.sound_open
        }
        if ("sound_close" in options) {
            this.sound_close = options.sound_close
        }
        if ("init" in options && typeof options.init === "function") {
            this.init = options.init
        }
        if ("open_handler" in options && typeof options.open_handler === "function") {
            this.open_handler = options.open_handler
        }
        if ("close_handler" in options && typeof options.close_handler === "function") {
            this.close_handler = options.close_handler
        }
        if ("post_open_handler" in options && typeof options.post_open_handler === "function") {
            this.post_open_handler = options.post_open_handler
        }
        if ("post_close_handler" in options && typeof options.post_open_handler === "function") {
            this.post_close_handler = options.post_close_handler
        }
        if (this.screen_element && this.screen_element.classList.contains("right_side_panel")) {
            this.right_side_panel = true;
            this.screen_element.addEventListener("animationend", (event => {
                if (event.animationName.startsWith("right_side_panel_hide")) {
                    while (this.on_close_animation_end_handlers.length) {
                        let cb = this.on_close_animation_end_handlers.shift();
                        if (typeof cb === "function") cb()
                    }
                    if (typeof this.post_close_handler === "function") this.post_close_handler();
                    this.screen_element.style.display = "none"
                } else if (event.animationName.startsWith("right_side_panel_show_w")) {
                    while (this.on_open_animation_end_handlers.length) {
                        let cb = this.on_open_animation_end_handlers.shift();
                        if (typeof cb === "function") cb()
                    }
                    if (typeof this.post_open_handler === "function") this.post_open_handler()
                }
            }))
        }
        global_screens[this.game_id + "_" + this.name] = this
    }
    open(params) {
        this.opening = true;
        if (typeof this.open_handler === "function") {
            this.open_handler(params)
        }
        if (!this.opening) return;
        anim_remove(this.screen_element);
        this.on_open_animation_end_handlers.length = 0;
        this.on_close_animation_end_handlers.length = 0;
        if (this.button_element) {
            if (this.button_element instanceof HTMLElement) {
                this.button_element.classList.add("hl_button");
                if (this.button_element.firstChild && this.button_element.firstChild.classList.contains("button_dot")) {
                    this.button_element.firstChild.classList.add("active_dot")
                }
            } else if (Array.isArray(this.button_element)) {
                for (let btn of this.button_element) {
                    if (!btn || !btn instanceof HTMLElement) continue;
                    btn.classList.add("hl_button");
                    if (btn.firstChild && btn.firstChild.classList.contains("button_dot")) {
                        btn.firstChild.classList.add("active_dot")
                    }
                }
            }
        }
        let transition_sound = "ui_transition1";
        if (this.sound_open) {
            transition_sound = this.sound_open
        }
        if (params) {
            if (params.transition_sound) transition_sound = params.transition_sound;
            if (params.silent) transition_sound = ""
        }
        if (this.right_side_panel) {
            engine.call("set_menu_fullscreen", false);
            this.screen_element.classList.remove("hidden");
            this.screen_element.classList.add("visible");
            this.screen_element.style.display = "flex";
            if (params && params.anim_end_cb) {
                this.on_open_animation_end_handlers.push(params.anim_end_cb)
            }
            let hud = _id("hud");
            if (hud) anim_show(hud, 200)
        } else {
            engine.call("set_menu_fullscreen", true);
            let computed_styles = getComputedStyle(this.screen_element);
            let computed_filter = this.opacity_filter_regex.exec(computed_styles.filter);
            let computed_opacity = computed_filter ? computed_filter[1] : 0;
            let display_set = this.screen_element.style.display;
            if (display_set == undefined || display_set == "none" || computed_styles.display == "none" || computed_opacity != 1) {
                anim_show(this.screen_element, 200, "flex", (() => {
                    if (typeof this.post_open_handler === "function") {
                        this.post_open_handler()
                    }
                }))
            } else {
                transition_sound = ""
            }
            let hud = _id("hud");
            if (hud) anim_hide(hud, 200)
        }
        if (transition_sound.length) engine.call("ui_sound", transition_sound)
    }
    close(params) {
        this.opening = false;
        anim_remove(this.screen_element);
        this.on_open_animation_end_handlers.length = 0;
        this.on_close_animation_end_handlers.length = 0;
        if (this.button_element) {
            if (this.button_element instanceof HTMLElement) {
                this.button_element.classList.remove("hl_button");
                if (this.button_element.firstChild) {
                    this.button_element.firstChild.classList.remove("active_dot")
                }
            } else if (Array.isArray(this.button_element)) {
                for (let btn of this.button_element) {
                    if (!btn || !btn instanceof HTMLElement) continue;
                    btn.classList.remove("hl_button");
                    if (btn.firstChild) {
                        btn.firstChild.classList.remove("active_dot")
                    }
                }
            }
        }
        let transition_sound = "";
        if (this.sound_close) {
            transition_sound = this.sound_close
        }
        if (params) {
            if (params.transition_sound) transition_sound = params.transition_sound;
            if (params.silent) transition_sound = ""
        }
        if (this.right_side_panel) {
            this.screen_element.classList.remove("visible");
            this.screen_element.classList.add("hidden");
            if (params) {
                if (params.instant) {
                    this.screen_element.style.display = "none";
                    if (typeof this.post_close_handler === "function") this.post_close_handler()
                } else if (params.anim_end_cb) {
                    this.on_close_animation_end_handlers.push(params.anim_end_cb)
                }
            }
        } else {
            let display_computed = getComputedStyle(this.screen_element).display;
            let display_set = this.screen_element.style.display;
            if (display_set != undefined && display_set != "none" || display_computed != "none") {
                if (params && params.instant) {
                    this.screen_element.style.display = "none";
                    if (typeof this.post_close_handler === "function") this.post_close_handler()
                } else {
                    if (params && params.anim_end_cb) {
                        this.on_close_animation_end_handlers.push(params.anim_end_cb)
                    }
                    anim_hide(this.screen_element, 200, (() => {
                        while (this.on_close_animation_end_handlers.length) {
                            let cb = this.on_close_animation_end_handlers.shift();
                            if (typeof cb === "function") cb()
                        }
                        if (typeof this.post_close_handler === "function") this.post_close_handler()
                    }))
                }
            } else {
                transition_sound = ""
            }
        }
        if (transition_sound.length) engine.call("ui_sound", transition_sound);
        if (typeof this.close_handler === "function") {
            this.close_handler(params)
        }
    }
}
var global_screens = {};
var global_active_screen = null;
var global_menu_page = "home";
var global_screen_change_handlers = [];

function open_screen(screen_name, params) {
    console.log("open_screen", screen_name);
    if (!screen_name) return;
    screen_name = screen_name.toLowerCase();
    let screen_id = GAME.active + "_" + screen_name;
    if (!(screen_id in global_screens)) {
        console.log("open_screen - no screen found for screen_id: " + screen_id);
        if (GAME.active !== GAME.ids.COMMON) {
            screen_id = GAME.ids.COMMON + "_" + screen_name;
            if (!(screen_id in global_screens)) {
                console.log("open_screen - no fallback screen found for screen_id: " + screen_id);
                return
            }
        }
    }
    let screen_changed = false;
    if (global_active_screen) {
        if (screen_name != global_active_screen.name) {
            global_active_screen.close();
            if (global_active_screen.name in global_components_screen_map) {
                for (let component of global_components_screen_map[global_active_screen.name]) {
                    anim_remove(component.root);
                    anim_hide(component.root)
                }
            }
            screen_changed = true
        }
    } else {
        screen_changed = true
    }
    if (screen_changed) {
        let menu = _id("lobby_container");
        anim_remove(menu);
        let menu_display_computed = getComputedStyle(menu).display;
        let menu_display_set = menu.style.display;
        if (global_screens[screen_id].fullscreen) {
            if (menu_display_set != undefined && menu_display_set != "none" || menu_display_computed != "none") {
                anim_hide(menu, 100)
            } else {
                menu.style.opacity = 0
            }
        } else {
            if (menu_display_set == undefined && menu_display_set == "none" || menu_display_computed == "none") {
                anim_show(menu, 100)
            } else {
                menu.style.opacity = 1
            }
        }
        for (let cb of global_screen_change_handlers) {
            let prev = null;
            if (global_active_screen) prev = global_active_screen.name;
            if (typeof cb === "function") cb(prev, screen_name)
        }
        global_active_screen = global_screens[screen_id];
        global_menu_page = screen_name;
        global_screens[screen_id].open(params);
        if (screen_name in global_components_screen_map) {
            for (let component of global_components_screen_map[screen_name]) {
                anim_remove(component.root);
                anim_show(component.root)
            }
        }
    } else {
        global_screens[screen_id].open(params)
    }
}

function close_screen(params) {
    if (global_active_screen) {
        global_active_screen.close(params);
        if (global_active_screen.name in global_components_screen_map) {
            for (let component of global_components_screen_map[global_active_screen.name]) {
                anim_hide(component.root)
            }
        }
    }
    global_active_screen = null;
    global_menu_page = null
}

function set_tab(tab_map, tab, optional_params) {
    if (tab_map.current_tab) {
        var previous_tab = tab_map.current_tab;
        var previous_el = _id(tab_map[tab_map.current_tab].content)
    }
    if (tab_map[tab.id].hasOwnProperty("content")) {
        var el = _id(tab_map[tab.id].content)
    }
    if (el) {
        if (el.id != tab_map[tab_map.current_tab].content) {
            let previous_scrollbar = tab_map.current_scroll;
            if (previous_scrollbar && tab_map[tab.id].scroll && previous_scrollbar == tab_map[tab.id].scroll) {
                previous_el.style.display = "none";
                el.style.display = "flex";
                refreshScrollbar(_id(tab_map[tab.id].scroll));
                resetScrollbar(_id(tab_map[tab.id].scroll))
            } else {
                if (tab_map.anim && tab_map.fade_out > 0) {
                    anim_hide(previous_el, tab_map.fade_out, (function() {
                        if (previous_scrollbar) {
                            resetScrollbar(_id(previous_scrollbar))
                        }
                    }))
                } else {
                    _id(tab_map[tab_map.current_tab].content).style.display = "none"
                }
                if (tab_map.anim && tab_map.fade_in > 0) {
                    anim_show(el, tab_map.fade_in)
                } else {
                    el.style.display = "flex";
                    if (previous_scrollbar) {
                        resetScrollbar(_id(previous_scrollbar))
                    }
                }
                if (tab_map[tab.id].scroll) {
                    refreshScrollbar(_id(tab_map[tab.id].scroll));
                    tab_map.current_scroll = tab_map[tab.id].scroll
                } else {
                    tab_map.current_scroll = null
                }
            }
        }
    }
    if (tab) {
        if (tab.id != tab_map.current_tab) {
            tab.classList.add("active_tab");
            _id(tab_map.current_tab).classList.remove("active_tab");
            tab_map.current_tab = tab.id
        }
    }
    if (tab_map.cb) {
        tab_map.cb(el, tab, previous_el, previous_tab, optional_params)
    }
    if (tab_map[tab.id].cb) {
        tab_map[tab.id].cb(el, tab, previous_el, previous_tab, optional_params)
    }
    cleanup_floating_containers()
}
global_screen_change_handlers.push((function(previous_screen, new_screen) {
    _pause_music_preview();
    cleanup_floating_containers();
    engine.call("on_show_customization_screen", false)
}));
let menu_is_closing = false;

function close_menu(silent, instant) {
    if (menu_is_closing) return;
    if (global_active_view === "menu") {
        if (global_active_screen) {
            if (global_active_screen.right_side_panel) {
                if (!silent) {
                    engine.call("ui_sound", "ui_panel_right_out")
                }
                if (instant) {
                    close_screen({
                        instant: true,
                        silent: silent ? true : false
                    });
                    menu_is_closing = false;
                    set_modal_engine_call(false);
                    engine.call("set_menu_view", false)
                } else {
                    menu_is_closing = true;
                    close_screen({
                        anim_end_cb: () => {
                            menu_is_closing = false;
                            set_modal_engine_call(false);
                            engine.call("set_menu_view", false)
                        },
                        silent: silent ? true : false
                    })
                }
            } else {
                if (instant) {
                    close_screen({
                        instant: true,
                        silent: silent ? true : false
                    });
                    menu_is_closing = false;
                    set_modal_engine_call(false);
                    engine.call("set_menu_view", false)
                } else {
                    menu_is_closing = true;
                    close_screen({
                        anim_end_cb: () => {
                            menu_is_closing = false;
                            set_modal_engine_call(false);
                            engine.call("set_menu_view", false)
                        },
                        silent: silent ? true : false
                    })
                }
            }
        } else {
            menu_is_closing = false;
            set_modal_engine_call(false);
            engine.call("set_menu_view", false)
        }
        let hud = _id("hud");
        if (hud) anim_show(hud, 200);
        set_blur(false)
    }
    engine.call("on_show_customization_screen", false)
}

function reset_menu() {
    close_screen();
    set_modal_engine_call(false);
    menu_is_closing = false
}

function set_blur(blur) {
    if (typeof blur !== "boolean") {
        console.log("set_blur called without bool", typeof blur, blur);
        return
    }
    if (global_ingame_blur) {
        return
    }
    engine.call("set_blur", blur)
}