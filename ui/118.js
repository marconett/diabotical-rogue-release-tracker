{
    const button_timeouts = [];
    new MenuScreen({
        game_id: GAME.ids.GEARSTORM,
        name: "main_panel_gearstorm",
        screen_element: _id("main_panel_gearstorm"),
        sound_open: "ui_panel_right_in",
        init: () => {
            main_panel_gearstorm.init()
        },
        open_handler: () => {
            set_blur(false);
            Navigation.set_active({
                lb_rb: null,
                up_down: "main_panel_gearstorm",
                left_right: null
            });
            main_panel_gearstorm.set_fully_open(false);
            main_panel_gearstorm.on_open();
            if (!historyFirstEntry("main_panel_gearstorm")) {
                historyPushState({
                    page: "main_panel_gearstorm"
                })
            }
        },
        post_open_handler: () => {
            let delay = 0;
            let elements = _id("main_panel_gearstorm").querySelectorAll(".main_button");
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].classList.contains("inactive")) continue;
                button_timeouts.push(setTimeout((() => {
                    elements[i].classList.remove("hidden");
                    engine.call("ui_sound", "ui_locker_item_counter")
                }), delay));
                delay += 40
            }
            main_panel_gearstorm.set_fully_open(true)
        },
        close_handler: () => {
            for (let timeout of button_timeouts) {
                clearTimeout(timeout)
            }
            button_timeouts.length = 0;
            let elements = _id("main_panel_gearstorm").querySelectorAll(".main_button");
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add("hidden")
            }
            main_panel_gearstorm.set_fully_open(false);
            Navigation.reset_active()
        },
        post_close_handler: () => {
            main_panel_gearstorm.set_fully_open(false)
        }
    })
}
const main_panel_gearstorm = new function() {
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
    let menu_party_list = null;
    let rejoin_data = null;
    this.init = () => {
        root = _id("main_panel_gearstorm");
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
        menu_party_list = root.querySelector(".menu_party_list");
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
            name: "main_panel_gearstorm",
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
            if (global_menu_page === "main_panel_gearstorm" && is_fully_open) {
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
                create_button.classList.remove("disabled")
            } else {
                play_button.classList.add("disabled");
                social_button.classList.add("disabled");
                create_button.classList.add("disabled")
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
        }));
        global_on_ms_connected.push((() => {
            if (!global_ms_connected) {
                _empty(menu_party_list)
            }
        }));
        party_status_handlers.push((function(party_changed, party, removed) {
            update_menu_party_list(global_self.user_id, party)
        }));
        bind_event("update_gs_ping", (ping => {
            let ping_el = root.querySelector(".connection_status .ping");
            if (ping_el) {
                ping_el.textContent = _format_ping(Number(ping)) + "ms"
            }
        }))
    };

    function update_locker_count() {
        if (!locker_new_count) return;
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
            if (!Lobby.in_lobby()) {
                if (bool_am_i_leader) {
                    Lobby.create()
                }
            } else {
                open_screen("custom")
            }
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
        } else if (button === "datacenter") {
            open_modal_screen("region_select_modal_screen")
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

    function update_menu_party_list(own_user_id, party) {
        _empty(menu_party_list);
        let count = 4;
        if (party.size > count) count = party.size;
        if (global_self && global_self.data && global_self.user_id in party.members) {
            let member = _createElement("div", "member");
            let avatar = _createElement("div", "avatar");
            set_store_avatar(true, avatar, party.members[global_self.user_id].client_user_id, party.members[global_self.user_id].client_source);
            member.appendChild(avatar);
            if (party.member_ids.length > 1 && global_self.user_id == party.leader_id) {
                member.appendChild(_createElement("div", "leader"))
            }
            menu_party_list.appendChild(member);
            member.addEventListener("click", (() => {
                open_screen("friends_panel", {
                    tab: "friends_panel_tab_party"
                })
            }));
            _addButtonSounds(member, 4)
        }
        for (let i = 0; i < count; i++) {
            let member_user_id = null;
            if (i <= party.member_ids.length) {
                member_user_id = party.member_ids[i]
            }
            if (member_user_id && member_user_id === own_user_id) continue;
            let member = _createElement("div", "member");
            let avatar = _createElement("div", "avatar");
            if (member_user_id && member_user_id in party.members) {
                set_store_avatar(false, avatar, party.members[member_user_id].client_user_id, party.members[member_user_id].client_source)
            } else {
                avatar.appendChild(_createElement("div", "plus"))
            }
            member.appendChild(avatar);
            if (member_user_id && member_user_id == party.leader_id) {
                member.appendChild(_createElement("div", "leader"))
            }
            menu_party_list.appendChild(member);
            member.addEventListener("click", (() => {
                if (member_user_id && member_user_id in party.members) {
                    open_screen("friends_panel", {
                        tab: "friends_panel_tab_party"
                    })
                } else {
                    open_screen("friends_panel")
                }
            }));
            _addButtonSounds(member, 4)
        }
    }
};