{
    const button_timeouts = [];
    new MenuScreen({
        game_id: GAME.ids.INVASION,
        name: "main_panel",
        screen_element: _id("main_panel"),
        sound_open: "ui_panel_right_in",
        init: () => {
            main_panel.init()
        },
        open_handler: () => {
            set_blur(false);
            Navigation.set_active({
                lb_rb: null,
                up_down: "main_panel",
                left_right: null
            });
            main_panel.set_fully_open(false);
            main_panel.on_open();
            if (!historyFirstEntry("main_panel")) {
                historyPushState({
                    page: "main_panel"
                })
            }
        },
        post_open_handler: () => {
            let delay = 0;
            let elements = _id("main_panel").querySelectorAll(".main_button");
            for (let i = 0; i < elements.length; i++) {
                button_timeouts.push(setTimeout((() => {
                    elements[i].classList.remove("hidden");
                    engine.call("ui_sound", "ui_locker_item_counter")
                }), delay));
                delay += 40
            }
            main_panel.set_fully_open(true)
        },
        close_handler: () => {
            for (let timeout of button_timeouts) {
                clearTimeout(timeout)
            }
            button_timeouts.length = 0;
            let elements = _id("main_panel").querySelectorAll(".main_button");
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add("hidden")
            }
            main_panel.set_fully_open(false);
            Navigation.reset_active()
        },
        post_close_handler: () => {
            main_panel.set_fully_open(false)
        }
    })
}
const main_panel = new function() {
    let is_fully_open = false;
    this.set_fully_open = bool => {
        is_fully_open = bool
    };
    let root = null;
    let friends_new_count = null;
    let screen_actions = null;
    let social_button = null;
    this.init = () => {
        root = _id("main_panel");
        friends_new_count = root.querySelector(".new_c.friends");
        screen_actions = root.querySelector(".screen_actions");
        social_button = root.querySelector(".main_button.social");
        Navigation.generate_nav({
            name: "main_panel",
            nav_root: root,
            nav_class: "main_button",
            mouse_click: "action",
            hover_sound: "ui_hover1",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: (element, action) => {
                if (element.dataset.button) {
                    button_pressed(element.dataset.button)
                }
            }
        });
        Friends.add_update_friend_requests_listener((function(list) {
            update_friends_invite_count()
        }));
        Friends.add_friend_request_listener((function(friend_update) {
            update_friends_invite_count()
        }));
        Friends.add_remove_friend_request_listener((function(user_id) {
            update_friends_invite_count()
        }));
        Friends.add_update_invites_listener((function(list) {
            update_friends_invite_count()
        }));
        Friends.add_remove_invite_listener((function(invite) {
            update_friends_invite_count()
        }));
        Friends.add_invite_listener((function(invite) {
            update_friends_invite_count()
        }));

        function update_friends_invite_count() {
            let count = Friends.state.invites.length + Friends.state.requests.length;
            friends_new_count.textContent = count;
            if (count) {
                friends_new_count.classList.add("visible")
            } else {
                friends_new_count.classList.remove("visible")
            }
        }
        root.addEventListener("click", (e => {
            e.stopPropagation()
        }));
        _id("main_menu").addEventListener("click", (e => {
            if (global_menu_page === "main_panel" && is_fully_open) {
                let root_rect = root.getBoundingClientRect();
                if (e.clientX < root_rect.x) {
                    historyBack()
                }
            }
        }));
        bind_event("set_connection_status", ((position, status, offline_reason) => {
            if (update_connection_status_indicator(root, position, status, offline_reason)) {
                social_button.classList.remove("disabled")
            } else {
                social_button.classList.add("disabled")
            }
        }))
    };
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], screen_actions)
    };

    function button_pressed(button) {
        if (button === "settings") {
            open_screen("settings_panel")
        } else if (button === "social") {
            open_screen("friends_panel")
        } else if (button === "quit") {
            let text = "";
            modal_panel.open("Leave Game", text, [{
                title: "Game Launcher",
                callback: () => {
                    GAME.set_inactive()
                }
            }, {
                title: "Quit to Desktop",
                callback: () => {
                    engine.call("quit")
                }
            }])
        } else if (button === "locker") {
            open_screen("locker")
        } else if (button === "lobby") {
            if (!Lobby.in_lobby()) {
                Lobby.create()
            } else {
                open_screen("custom")
            }
        } else if (button === "ingame") {
            open_screen("ingame")
        } else if (button === "resume") {
            close_menu()
        }
    }
};