new MenuScreen({
    game_id: GAME.ids.ROGUE,
    name: "crosshair",
    screen_element: _id("crosshair_screen"),
    button_element: null,
    fullscreen: true,
    init: () => {
        page_crosshair.init()
    },
    open_handler: params => {
        historyPushState({
            page: "crosshair"
        });
        page_crosshair.on_open()
    },
    close_handler: () => {}
});
const page_crosshair = new function() {
    let current_id = 0;
    const html = {
        root: null,
        screen_actions: null,
        weapons: [],
        override: null,
        container: null
    };
    this.init = () => {
        html.root = _id("crosshair_screen");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        html.override = html.root.querySelector(".override");
        html.container = html.root.querySelector(".crosshair_editor_container");
        global_crosshair_creators[GAME.ids.ROGUE] = {};
        global_crosshair_creators[GAME.ids.ROGUE]["normal"] = new CrosshairCreator(GAME.ids.ROGUE, _id("crosshair_screen_normal"));
        global_crosshair_creators[GAME.ids.ROGUE]["zoom"] = new CrosshairCreator(GAME.ids.ROGUE, _id("crosshair_screen_zoom"));
        html.weapons = html.root.querySelectorAll(".weapon_selection .weapon");
        for (let i = 0; i < html.weapons.length; i++) {
            html.weapons[i].addEventListener("click", (() => {
                this.select_weapon(parseInt(html.weapons[i].dataset.idx))
            }))
        }
        this.select_weapon(current_id)
    };
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], html.screen_actions)
    };
    this.select_weapon = id => {
        current_id = id;
        for (let i = 0; i < html.weapons.length; i++) {
            if (parseInt(html.weapons[i].dataset.idx) === id) {
                html.weapons[i].classList.add("selected")
            } else {
                html.weapons[i].classList.remove("selected")
            }
        }
        if (id == 0) {
            html.override.classList.add("hidden")
        } else {
            html.override.classList.remove("hidden")
        }
        set_tab(crosshair_section_tab_map, _id("crosshair_screen_tab_normal"));
        initialize_variable("checkbox", "game_custom_weapon_crosshair:" + id);
        initialize_variable("checkbox", "game_custom_weapon_zoom_crosshair:" + id);
        let enabled = this.update_locked();
        let select = _id("use_crosshair_override");
        select.dataset.value = enabled ? 1 : 0;
        ui_setup_select(select, ((opt, field) => {
            update_variable("bool", "game_custom_weapon_crosshair:" + id, parseInt(opt.dataset.value) ? true : false);
            this.update_locked()
        }));
        update_select(select);
        engine.call("initialize_custom_component_value", "hud_crosshair_definition:" + id);
        engine.call("initialize_custom_component_value", "hud_zoom_crosshair_definition:" + id)
    };
    this.update_locked = () => {
        let enabled = false;
        if ("game_custom_weapon_crosshair:" + current_id in global_variable_value_store) {
            enabled = global_variable_value_store["game_custom_weapon_crosshair:" + current_id]
        }
        if (enabled || current_id == 0) {
            html.container.classList.remove("locked")
        } else {
            html.container.classList.add("locked")
        }
        return enabled
    }
};
var crosshair_section_tab_map = {
    current_tab: "crosshair_screen_tab_normal",
    current_scroll: "settings_screen_crosshair_scroll",
    anim: false,
    crosshair_screen_tab_normal: {
        content: "crosshair_screen_normal",
        scroll: "settings_screen_crosshair_scroll"
    },
    crosshair_screen_tab_zoom: {
        content: "crosshair_screen_zoom",
        scroll: "settings_screen_crosshair_scroll_zoom"
    }
};