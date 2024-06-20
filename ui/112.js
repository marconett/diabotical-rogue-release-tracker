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
    let SNIPER_ZOOM_INDEX = [];
    let crosshair_section_tab_map = {
        current_tab: "crosshair_screen_tab_normal",
        current_scroll: "settings_screen_crosshair_scroll",
        anim: false,
        crosshair_screen_tab_normal: {
            content: "crosshair_screen_normal",
            scroll: "settings_screen_crosshair_scroll",
            cb: () => {
                this.select_weapon(0)
            }
        },
        crosshair_screen_tab_zoom: {
            content: "crosshair_screen_zoom",
            scroll: "settings_screen_crosshair_scroll_zoom",
            cb: () => {
                this.select_weapon(0)
            }
        },
        crosshair_screen_tab_zoom_sniper: {
            content: "crosshair_screen_zoom",
            scroll: "settings_screen_crosshair_scroll_zoom",
            cb: () => {
                this.select_weapon(SNIPER_ZOOM_INDEX[0])
            }
        }
    };
    this.init = () => {
        html.root = _id("crosshair_screen");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        html.override = html.root.querySelector(".override");
        html.container = html.root.querySelector(".crosshair_editor_container");
        GAME.add_activate_callback((game_id => {
            let sniper_zoom_indexes = GAME.get_data("sniper_zoom_indexes");
            if (sniper_zoom_indexes) {
                SNIPER_ZOOM_INDEX = sniper_zoom_indexes
            } else {
                SNIPER_ZOOM_INDEX = []
            }
        }));
        let settings_crosshair = _id("settings-crosshair-preview");
        global_crosshair_creators[GAME.ids.ROGUE] = {};
        global_crosshair_creators[GAME.ids.ROGUE]["normal"] = new CrosshairCreator(GAME.ids.ROGUE, _id("crosshair_screen_normal"), settings_crosshair);
        global_crosshair_creators[GAME.ids.ROGUE]["zoom"] = new CrosshairCreator(GAME.ids.ROGUE, _id("crosshair_screen_zoom"));
        this.select_weapon(current_id)
    };
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], html.screen_actions)
    };
    this.set_tab = button => {
        set_tab(crosshair_section_tab_map, button)
    };
    this.select_weapon = id => {
        current_id = id;
        engine.call("initialize_custom_component_value", "hud_crosshair_definition:" + id);
        engine.call("initialize_custom_component_value", "hud_zoom_crosshair_definition:" + id)
    }
};