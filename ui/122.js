new MenuScreen({
    game_id: GAME.ids.ROGUE,
    name: "progression",
    screen_element: _id("progression_screen"),
    button_element: null,
    fullscreen: false,
    init: () => {
        progression_page.init()
    },
    open_handler: params => {
        set_blur(true);
        historyPushState({
            page: "progression"
        });
        progression_page.on_open()
    },
    close_handler: () => {
        set_blur(false);
        progression_page.on_close()
    }
});
const progression_page = new function() {
    let html = {
        root: null,
        screen_actions: null
    };
    this.init = () => {
        html.root = _id("progression_screen");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        GAME.add_activate_callback((game_id => {
            let arr = [];
            let customizations = GAME.get_data("customizations");
            if (customizations) {
                for (let type_id in customizations) {
                    for (let sub_type in customizations[type_id]) {
                        for (let c of customizations[type_id][sub_type]) {
                            arr.push(c)
                        }
                    }
                }
            }
            engine.call("set_game_customizations", JSON.stringify(arr))
        }))
    };
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], html.screen_actions);
        engine.call("set_progression_tree_visible", true);
        engine.call("passthrough_input", true)
    };
    this.on_close = () => {
        engine.call("set_progression_tree_visible", false);
        engine.call("passthrough_input", false)
    }
};