{
    const button_timeouts = [];
    new MenuScreen({
        game_id: GAME.ids.COMMON,
        name: "modal_panel",
        screen_element: _id("modal_panel"),
        sound_open: "ui_panel_right_in",
        init: () => {
            modal_panel.init()
        },
        open_handler: () => {
            historyPushState({
                page: "modal_panel"
            });
            set_blur(false);
            Navigation.set_active({
                lb_rb: null,
                up_down: "modal_panel",
                left_right: null
            })
        },
        post_open_handler: () => {
            let delay = 0;
            let elements = _id("modal_panel").querySelectorAll(".main_button");
            for (let i = 0; i < elements.length; i++) {
                button_timeouts.push(setTimeout((() => {
                    elements[i].classList.remove("hidden");
                    engine.call("ui_sound", "ui_locker_item_counter")
                }), delay));
                delay += 40
            }
        },
        close_handler: () => {
            for (let timeout of button_timeouts) {
                clearTimeout(timeout)
            }
            button_timeouts.length = 0;
            Navigation.reset_active()
        },
        post_close_handler: () => {}
    })
}
const modal_panel = new function() {
    let html = {
        root: null,
        title: null,
        text: null,
        options: null,
        screen_actions: null
    };
    this.init = () => {
        html.root = _id("modal_panel");
        html.title = html.root.querySelector(".modal_title");
        html.text = html.root.querySelector(".modal_text");
        html.options = html.root.querySelector(".nav");
        html.screen_actions = html.root.querySelector(".screen_actions")
    };
    this.open = (title, text, options) => {
        if (!title || !title.length) return;
        if (!options || !Array.isArray(options) || !options.length) return;
        html.title.textContent = title;
        _empty(html.text);
        if (text && text.length) {
            html.text.textContent = text;
            html.text.classList.remove("hidden")
        } else {
            html.text.classList.add("hidden")
        }
        _empty(html.options);
        for (let opt of options) {
            let button = _createElement("div", ["main_button", "hidden"]);
            if (opt.callback && typeof opt.callback === "function") {
                button.callback = opt.callback
            }
            if (opt.disabled) {
                button.classList.add("disabled")
            }
            let title = _createElement("div", "title", opt.title);
            button.appendChild(title);
            let arrow = _createElement("div", "arrow");
            button.appendChild(arrow);
            html.options.appendChild(button)
        }
        Navigation.generate_nav({
            name: "modal_panel",
            nav_root: html.root,
            nav_class: "main_button",
            mouse_click: "action",
            hover_sound: "ui_hover1",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: (element, action) => {
                if (typeof element.callback === "function") {
                    element.callback()
                }
            }
        });
        Navigation.render_actions([global_action_buttons.back], html.screen_actions);
        open_screen("modal_panel")
    }
};