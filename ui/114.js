{
    const button_timeouts = [];
    new MenuScreen({
        game_id: GAME.ids.ROGUE,
        name: "main_panel_rogue",
        screen_element: _id("main_panel_rogue"),
        sound_open: "ui_panel_right_in",
        init: () => {
            main_panel_rogue.init()
        },
        open_handler: () => {
            set_blur(false);
            Navigation.set_active({
                lb_rb: null,
                up_down: "main_panel_rogue",
                left_right: null
            });
            main_panel_rogue.set_fully_open(false);
            main_panel_rogue.on_open();
            if (!historyFirstEntry("main_panel_rogue")) {
                historyPushState({
                    page: "main_panel_rogue"
                })
            }
        },
        post_open_handler: () => {
            let delay = 0;
            let elements = _id("main_panel_rogue").querySelectorAll(".main_button");
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].classList.contains("inactive")) continue;
                button_timeouts.push(setTimeout((() => {
                    elements[i].classList.remove("hidden");
                    engine.call("ui_sound", "ui_locker_item_counter")
                }), delay));
                delay += 40
            }
            main_panel_rogue.set_fully_open(true)
        },
        close_handler: () => {
            for (let timeout of button_timeouts) {
                clearTimeout(timeout)
            }
            button_timeouts.length = 0;
            let elements = _id("main_panel_rogue").querySelectorAll(".main_button");
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add("hidden")
            }
            main_panel_rogue.set_fully_open(false);
            Navigation.reset_active()
        },
        post_close_handler: () => {
            main_panel_rogue.set_fully_open(false)
        }
    })
}
const main_panel_rogue = new function() {
    let is_fully_open = false;
    this.set_fully_open = bool => {
        is_fully_open = bool
    };
    let root = null;
    let friends_new_count = null;
    let locker_new_count = null;
    let screen_actions = null;
    let rejoin_button = null;
    let play_button = null;
    let lobby_button = null;
    let social_button = null;
    let create_button = null;
    let locker_button = null;
    let progression_button = null;
    let rejoin_data = null;
    this.init = () => {
        root = _id("main_panel_rogue");
        friends_new_count = root.querySelector(".new_c.friends");
        locker_new_count = root.querySelector(".new_c.locker");
        screen_actions = root.querySelector(".screen_actions");
        rejoin_button = root.querySelector(".main_button.rejoin");
        play_button = root.querySelector(".main_button.play");
        lobby_button = root.querySelector(".main_button.lobby");
        social_button = root.querySelector(".main_button.social");
        create_button = root.querySelector(".main_button.create");
        locker_button = root.querySelector(".main_button.locker");
        progression_button = root.querySelector(".main_button.progression");
        Lobby.add_join_listener((() => {
            lobby_button.classList.remove("inactive");
            lobby_button.classList.remove("disabled");
            play_button.classList.add("inactive");
            play_button.classList.add("disabled")
        }));
        Lobby.add_leave_listener((() => {
            lobby_button.classList.add("inactive");
            lobby_button.classList.add("disabled");
            play_button.classList.remove("inactive");
            if (global_ms_connected) {
                play_button.classList.remove("disabled")
            }
        }));
        Navigation.generate_nav({
            name: "main_panel_rogue",
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
        GAME.add_activate_callback((game_id => {
            update_locker_count()
        }));
        global_customization_seen_handlers.push((() => {
            update_locker_count()
        }));
        root.addEventListener("click", (e => {
            e.stopPropagation()
        }));
        _id("main_menu").addEventListener("click", (e => {
            if (global_menu_page === "main_panel_rogue" && is_fully_open) {
                let root_rect = root.getBoundingClientRect();
                if (e.clientX < root_rect.x) {
                    historyBack()
                }
            }
        }));
        bind_event("set_connection_status", ((position, status, offline_reason) => {
            if (update_connection_status_indicator(root, position, status, offline_reason)) {
                play_button.classList.remove("disabled");
                social_button.classList.remove("disabled");
                create_button.classList.remove("disabled");
                progression_button.classList.remove("disabled");
                locker_button.classList.remove("disabled")
            } else {
                play_button.classList.add("disabled");
                social_button.classList.add("disabled");
                create_button.classList.add("disabled");
                progression_button.classList.add("disabled");
                locker_button.classList.add("disabled")
            }
        }));
        global_ms.addPermanentResponseHandler("match-reconnect", (data => {
            rejoin_button.classList.remove("inactive");
            rejoin_button.classList.remove("disabled");
            rejoin_data = data;
            queue_dialog_msg({
                title: localize("title_reconnect"),
                msg: localize("message_reconnect_available")
            })
        }));
        global_ms.addPermanentResponseHandler("match-reconnect-removed", (() => {
            rejoin_button.classList.add("inactive");
            rejoin_button.classList.add("disabled");
            rejoin_data = null
        }))
    };

    function update_locker_count() {
        let count = customization_get_new_count_category();
        locker_new_count.textContent = count;
        if (count) {
            locker_new_count.classList.add("visible")
        } else {
            locker_new_count.classList.remove("visible")
        }
    }
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], screen_actions)
    };

    function button_pressed(button) {
        if (button === "play") {
            open_screen("play_rogue")
        } else if (button === "lobby") {
            open_screen("custom")
        } else if (button === "settings") {
            open_screen("settings_panel")
        } else if (button === "social") {
            open_screen("friends_panel")
        } else if (button === "quit") {
            let options = [{
                title: localize("game_launcher"),
                callback: () => {
                    GAME.set_inactive()
                }
            }, {
                title: localize("quit_to_desktop"),
                callback: () => {
                    engine.call("quit")
                }
            }];
            if (!IN_HUB) {
                options.unshift({
                    title: localize("back_to_hub"),
                    callback: () => {
                        close_menu(true, true);
                        engine.call("game_over_quit")
                    }
                })
            }
            modal_panel.open(localize("leave_game"), "", options)
        } else if (button === "locker") {
            open_screen("locker")
        } else if (button === "resume") {
            close_menu()
        } else if (button === "achievements") {
            open_screen("achievements")
        } else if (button === "progression") {
            open_screen("progression")
        } else if (button === "credits") {
            open_screen("credits")
        } else if (button === "create") {
            open_screen("create")
        } else if (button === "rejoin") {
            if (!rejoin_data) return;
            const mode_data = GAME.get_data("game_mode_map", rejoin_data.match_mode);
            let msg = "";
            let button_positive = localize("menu_button_join");
            let button_positive_cb = () => {
                send_string(CLIENT_COMMAND_RECONNECT)
            };
            let button_negative = null;
            let button_negative_cb = null;
            if (rejoin_data.penalty == true) {
                msg = localize_ext("message_reconnect_abandon", {
                    type: localize(MATCH_TYPE[rejoin_data.match_type].i18n),
                    mode: mode_data ? localize(mode_data.i18n) : ""
                });
                button_negative = localize("menu_button_abandon");
                button_negative_cb = () => {
                    send_string(CLIENT_COMMAND_ABANDON)
                }
            } else {
                msg = localize_ext("message_reconnect", {
                    type: localize(MATCH_TYPE[rejoin_data.match_type].i18n),
                    mode: mode_data ? localize(mode_data.i18n) : ""
                });
                button_negative = localize("menu_button_dismiss");
                button_negative_cb = () => {
                    send_string(CLIENT_COMMAND_DISMISS_RECONNECT)
                }
            }
            genericModal(localize("title_reconnect"), msg, button_negative, button_negative_cb, button_positive, button_positive_cb)
        }
    }
};