let test = null;
let on_press_esc_handlers = [];
const global_range_slider_map = {};
let game_launched = false;

function reveal_ui(initial) {
    if (!i18n_initialized || !game_selection_video_loaded) return;
    document.body.style.display = "flex";
    console.log("show game selection screen", performance.now());
    _id("game_selection_screen").style.display = "flex";
    global_screens["9999_game_selection"].open();
    global_menu_page = "game_selection";
    engine.call("set_menu_fullscreen", true);
    if (initial) {
        window.requestAnimationFrame((() => {
            engine.call("start_view_loaded");
            engine.call("initialize_custom_component_value", "lobby_accepted_tos");
            if (tos_accept_version != current_tos_version) {
                displayTOS()
            } else {
                engine.call("unlock_console")
            }
        }))
    }
}
let i18n_initialized = false;
let game_selection_video_loaded = false;
window.addEventListener("load", (function() {
    console.log("PERF #1 begin load", performance.now());
    init_i18n();
    on_i18n_initialized_handlers.push((() => {
        i18n_initialized = true;
        reveal_ui(true)
    }));
    bind_event("game_selected", (game_id => {
        console.log("game_selected", game_id);
        page_game_selection.switch_selected_game(game_id, true)
    }));
    bind_event("game_launched", (game_id => {
        if (game_launched) return;
        console.log("game_launched", game_id);
        document.body.style.display = "none";
        page_game_selection.switch_selected_game(game_id, true);
        page_game_selection.pause_active_video();
        global_screens["9999_game_selection"].close({
            silent: true
        });
        game_launched = true
    }));
    bind_event("game_reset", (() => {
        game_launched = false;
        reveal_ui(false);
        page_game_selection.play_active_video()
    }));
    bind_event("set_custom_component", (function(variable, value) {
        if (variable == "lobby_accepted_tos") {
            tos_accept_version = value;
            if (tos_accept_version) {
                hideTOS()
            }
        }
    }));
    bind_event("set_range", (function(variable, value) {
        if (global_range_slider_map.hasOwnProperty(variable)) {
            global_range_slider_map[variable].setValue(value)
        }
    }));
    bind_event("inactivity_logout", (function() {
        open_modal_screen("inactivity_logout_modal_screen")
    }));
    document.addEventListener("keydown", (function(e) {
        if (e.which !== 27) return;
        for (let cb of on_press_esc_handlers) {
            if (typeof cb === "function") {
                let ret = cb();
                if (ret === false) {
                    return
                }
            }
        }
    }));
    for (let screen_name in global_screens) {
        if (typeof global_screens[screen_name].init === "function") {
            console.log("init:", screen_name);
            global_screens[screen_name].init()
        }
    }
    _for_each_in_class("click-sound", (function(el) {
        el.addEventListener("mousedown", _play_click1)
    }));
    _for_each_in_class("mouseover-sound2", (function(el) {
        el.addEventListener("mouseenter", _play_mouseover2)
    }));
    _for_each_in_class("mouseover-sound5", (function(el) {
        el.addEventListener("mouseenter", _play_hover2)
    }));
    initialize_scrollbars();
    _for_each_in_class("range-slider", (function(el) {
        let variable = el.dataset.variable ? el.dataset.variable : null;
        if (variable != null) {
            global_range_slider_map[variable] = new rangeSlider(el, true)
        }
    }));
    _for_each_in_class("range-slider", (function(el) {
        var variable = el.dataset.variable;
        if (variable) {
            engine.call("initialize_range_value", variable)
        }
    }));
    let volume = _id("volume");
    let volume_icon = volume.querySelector(".icon");
    let range_slider = volume.querySelector(".range-slider");
    volume_icon.addEventListener("click", (() => {
        if (volume.classList.contains("open")) {
            volume.classList.remove("open");
            range_slider.classList.remove("open")
        } else {
            volume.classList.add("open")
        }
    }));
    volume.addEventListener("animationend", (event => {
        if (event.animationName.startsWith("start_volume_open")) {
            range_slider.classList.add("open")
        }
    }));
    volume_icon.addEventListener("mouseenter", (() => {
        volume.classList.add("hover");
        volume_icon.classList.add("hover")
    }));
    volume_icon.addEventListener("mouseleave", (() => {
        volume.classList.remove("hover");
        volume_icon.classList.remove("hover")
    }));
    window.requestAnimationFrame(anim_update);
    console.log("PERF #2 end load", performance.now());
    if (page_game_selection.data.initial_video_loaded) {
        console.log("PERF #3-1 reveal_ui", performance.now());
        game_selection_video_loaded = true;
        reveal_ui(true)
    } else {
        page_game_selection.data.on_initial_video_loaded.push((() => {
            console.log("PERF #3-2 reveal_ui", performance.now());
            game_selection_video_loaded = true;
            reveal_ui(true)
        }))
    }
    engine.call("start_view_initialized")
}));
GAME.set_initial_data(GAME.ids.GEARSTORM, {
    GAME_NAME: "Storm",
    GAME_LOGO: "/html/images/game_selection/game_logo_storm.png",
    GAME_NAME_FULL: "Diabotical Storm",
    API_PATH: "/api/v0/3/",
    game_selection_videos: {
        start: "/html/images/game_selection/game_2_start.webm",
        loop: "/html/images/game_selection/game_2_loop.webm"
    }
});
GAME.set_initial_data(GAME.ids.ROGUE, {
    GAME_NAME: "Rogue",
    GAME_LOGO: "/html/images/game_selection/game_logo_rogue.png",
    GAME_NAME_FULL: "Diabotical Rogue",
    API_PATH: "/api/v0/2/",
    game_selection_videos: {
        start: "/html/images/game_selection/game_2_start.webm",
        loop: "/html/images/game_selection/game_2_loop.webm"
    }
});
GAME.set_initial_data(GAME.ids.INVASION, {
    GAME_NAME: "Invasion",
    GAME_LOGO: "/html/images/game_selection/game_logo_invasion.png",
    GAME_NAME_FULL: "Diabotical Invasion",
    API_PATH: "/api/v0/1/",
    game_selection_videos: {}
});