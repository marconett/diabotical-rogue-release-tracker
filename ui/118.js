new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "friends_panel",
    screen_element: _id("friends_panel"),
    sound_open: "ui_panel_right_in",
    init: () => {
        friends_panel.init()
    },
    open_handler: params => {
        historyPushState({
            page: "friends_panel"
        });
        set_blur(false);
        friends_panel.on_open(params)
    },
    post_open_handler: () => {},
    close_handler: () => {
        friends_panel.on_close();
        Navigation.reset_active()
    },
    post_close_handler: () => {}
});
const friends_panel = new function() {
    let html = {
        root: null,
        breadcrumbs: null,
        list: null,
        party: null,
        incoming: null,
        recent: null,
        settings_list: null,
        settings_party: null,
        settings_incoming: null,
        settings_incoming_input: null,
        allow_friend_requests: null,
        party_privacy: null,
        party_leave: null,
        friend_copy_id: null,
        friend_send_request: null,
        page_menu: null,
        page_menu_text: null,
        action_menu: null,
        screen_actions: null,
        invite_count: null,
        active_element_list: []
    };
    let recent_players_total = 0;
    let recent_players = [];
    let current_page = 1;
    const MAX_ITEMS_PER_PAGE = 9;
    const MAX_ITEMS_PER_PAGE_INCOMING = 8;
    let list_fragment = new DocumentFragment;
    let list_filter = "";
    let action_menu_open = false;
    this.init = () => {
        html.root = _id("friends_panel");
        html.breadcrumbs = _id("friends_breadcrumbs");
        html.list = _id("friends_panel_tab_content_list");
        html.party = _id("friends_panel_tab_content_party");
        html.incoming = _id("friends_panel_tab_content_incoming");
        html.recent = _id("friends_panel_tab_content_recent");
        html.settings_list = html.root.querySelector(".settings .settings_list");
        html.settings_party = html.root.querySelector(".settings .settings_party");
        html.settings_incoming = html.root.querySelector(".settings .settings_incoming");
        html.settings_incoming_input = html.settings_incoming.querySelector("input");
        html.allow_friend_requests = html.root.querySelector(".settings .allow_friend_requests");
        html.party_privacy = html.root.querySelector(".settings .party_privacy");
        html.party_leave = html.root.querySelector(".settings .party_leave");
        html.friend_copy_id = html.settings_incoming.querySelector(".settings .friend_copy_id");
        html.friend_send_request = html.settings_incoming.querySelector(".settings .friend_send_request");
        html.page_menu = html.root.querySelector(".page_menu");
        html.page_menu_text = html.page_menu.querySelector(".text");
        html.action_menu = html.root.querySelector(".action_menu");
        html.screen_actions = html.root.querySelector(".screen_actions");
        html.incoming_count = html.root.querySelector("#friends_panel_tab_incoming .new_c");
        Navigation.generate_nav({
            name: "friends_panel_tabs",
            nav_root: html.root.querySelector(".tabs"),
            nav_class: "tab",
            mouse_hover: "none",
            mouse_click: "action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            selection_required: true,
            action_cb_type: "immediate",
            action_cb: (element, action) => {
                friends_panel.open_tab(element)
            }
        });
        Navigation.generate_nav({
            name: "friends_panel_settings",
            nav_root: html.root.querySelector(".settings"),
            nav_class: "setting_row",
            hover_sound: "ui_hover2",
            action_cb_type: "input",
            action_cb: setting_action,
            past_last_cb: past_last_select
        });
        let prev = html.page_menu.querySelector(".prev");
        let next = html.page_menu.querySelector(".next");
        Navigation.listen("friends_panel", "lt", prev_page);
        Navigation.listen("friends_panel", "rt", next_page);
        prev.addEventListener("click", prev_page);
        next.addEventListener("click", next_page);
        prev.addEventListener("mouseenter", (() => {
            engine.call("ui_sound", "ui_hover2")
        }));
        next.addEventListener("mouseenter", (() => {
            engine.call("ui_sound", "ui_hover2")
        }));
        [html.list, html.party, html.incoming, html.recent].forEach((function(el) {
            el.addEventListener("wheel", (function(e) {
                if (e.deltaY < 0) {
                    prev_page()
                } else if (e.deltaY > 0) {
                    next_page()
                }
            }))
        }));

        function prev_page() {
            close_action_menu();
            current_page--;
            if (current_page < 1) current_page = 1;
            update_list()
        }

        function next_page() {
            close_action_menu();
            current_page++;
            update_list()
        }
        html.root.addEventListener("click", (e => {
            e.stopPropagation()
        }));
        Friends.add_update_listener((function() {
            if (global_menu_page !== "friends_panel") return;
            if (tab_map.current_tab === "friends_panel_tab_list") {
                render_friends_list();
                Navigation.refresh_elements("friends_panel_list")
            }
        }));
        Friends.add_update_friend_listener((function(friend) {
            update_friend(friend)
        }));
        Friends.add_remove_friend_listener((function(friend) {
            update_list("friends")
        }));
        Friends.add_update_friend_gamestate_listener((function(friend) {
            update_friend(friend)
        }));
        Friends.add_update_friend_requests_listener((function(list) {
            update_list("incoming");
            update_incoming_count()
        }));
        Friends.add_friend_request_listener((function(friend_update) {
            update_list("incoming");
            update_incoming_count()
        }));
        Friends.add_remove_friend_request_listener((function(user_id) {
            update_list("incoming");
            update_incoming_count()
        }));
        Friends.add_update_invites_listener((function(invites) {
            update_list("incoming");
            update_incoming_count()
        }));
        Friends.add_remove_invite_listener((function(invite) {
            update_list("incoming");
            update_incoming_count()
        }));
        Friends.add_invite_listener((function(invite) {
            update_list("incoming");
            update_incoming_count()
        }));
        bind_event("recent_players", (json => {
            try {
                data = JSON.parse(json);
                recent_players_total = data.total;
                recent_players = data.players
            } catch (e) {
                console.error("Failed to parse recent players json", e.message, json)
            }
        }));
        party_status_handlers.push((function(party_changed, party, removed) {
            update_list("party");
            let privacy_setting = html.party_privacy.querySelector(".select-field");
            privacy_setting.dataset.value = global_party.privacy ? "1" : "0";
            update_select(privacy_setting);
            update_settings_visibility()
        }));
        on_own_data_changed.push((() => {
            let setting = html.allow_friend_requests.querySelector(".select-field");
            setting.dataset.value = global_self.friend_requests ? "1" : "0";
            update_select(setting)
        }));
        on_press_esc_handlers.push((() => {
            if (action_menu_open) {
                close_action_menu();
                return false
            }
        }));
        global_on_ms_disconnected.push((() => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            if (global_menu_page === "friends_panel") {
                historyBack()
            }
        })); {
            let setting = html.allow_friend_requests.querySelector(".select-field");
            setting.dataset.value = global_self.friend_requests ? "1" : "0";
            setup_select(setting, (function(opt, field) {
                if (parseInt(opt.dataset.value) === 1) {
                    send_string(CLIENT_COMMAND_SET_ALLOW_FRIEND_REQUESTS, true)
                } else {
                    send_string(CLIENT_COMMAND_SET_ALLOW_FRIEND_REQUESTS, false)
                }
            }))
        } {
            let setting = html.party_privacy.querySelector(".select-field");
            setting.dataset.value = 0;
            setup_select(setting, (function(opt, field) {
                if (parseInt(opt.dataset.value) === 1) {
                    send_string(CLIENT_COMMAND_SET_PARTY_PRIVACY, true)
                } else {
                    send_string(CLIENT_COMMAND_SET_PARTY_PRIVACY, false)
                }
            }))
        }
        if (html.settings_incoming_input) {
            let placeholder = html.settings_incoming_input.parentElement.querySelector(".placeholder");
            html.settings_incoming_input.parentElement.addEventListener("click", (() => {
                html.settings_incoming_input.focus()
            }));
            html.settings_incoming_input.addEventListener("focus", (() => {
                if (placeholder) placeholder.style.display = "none"
            }));
            html.settings_incoming_input.addEventListener("blur", (() => {
                if (placeholder) {
                    if (html.settings_incoming_input.value.length) {
                        placeholder.style.display = "none"
                    } else {
                        placeholder.style.display = "flex"
                    }
                }
            }))
        }
    };

    function setting_action(element, action) {
        if (!element.classList.contains("setting_row")) return;
        let ctrl = element.querySelector(".ctrl");
        if (ctrl && ctrl.firstElementChild) {
            let setting = ctrl.firstElementChild;
            if (setting.classList.contains("setting_select")) {
                if (setting.firstElementChild && setting.firstElementChild.classList.contains("select-field")) {
                    select_change_value(setting.firstElementChild, action);
                    updateSettingsExplanation(element, html.explanation)
                }
            } else if (setting.classList.contains("setting-btn")) {
                if (typeof setting.onclick === "function") {
                    setting.onclick.apply(setting)
                } else if (typeof setting.callback === "function") {
                    setting.callback()
                }
            }
        }
    }
    this.leave_party = () => {
        send_json_data({
            action: "party-leave"
        })
    };
    this.copy_user_id = () => {
        engine.call("copy_text", global_self.user_id)
    };
    this.send_friend_request = () => {
        if (html.settings_incoming_input) {
            send_string(CLIENT_COMMAND_SEND_FRIEND_REQUEST, html.settings_incoming_input.value);
            html.settings_incoming_input.value = "";
            html.settings_incoming_input.dispatchEvent(new Event("blur"))
        }
    };

    function update_settings_visibility() {
        if (tab_map.current_tab === "friends_panel_tab_party") {
            if (bool_am_i_leader) {
                html.party_privacy.style.display = "flex";
                html.party_privacy.classList.remove("disabled")
            } else {
                html.party_privacy.style.display = "none";
                html.party_privacy.classList.add("disabled")
            }
            if (global_party.size > 1) {
                html.party_leave.style.display = "flex";
                html.party_leave.classList.remove("disabled")
            } else {
                html.party_leave.style.display = "none";
                html.party_leave.classList.add("disabled")
            }
        } else {
            html.party_privacy.style.display = "none";
            html.party_privacy.classList.add("disabled");
            html.party_leave.style.display = "none";
            html.party_leave.classList.add("disabled")
        }
        if (tab_map.current_tab === "friends_panel_tab_list") {
            html.allow_friend_requests.style.display = "flex";
            html.allow_friend_requests.classList.remove("disabled")
        } else {
            html.allow_friend_requests.style.display = "none";
            html.allow_friend_requests.classList.add("disabled")
        }
        if (tab_map.current_tab === "friends_panel_tab_incoming") {
            html.friend_copy_id.style.display = "flex";
            html.friend_copy_id.classList.remove("disabled");
            html.friend_send_request.style.display = "flex";
            html.friend_send_request.classList.remove("disabled")
        } else {
            html.friend_copy_id.style.display = "none";
            html.friend_copy_id.classList.add("disabled");
            html.friend_send_request.style.display = "none";
            html.friend_send_request.classList.add("disabled")
        }
    }
    let tab_map = {
        current_tab: "friends_panel_tab_list",
        current_scroll: null,
        cb: function(el, tab, previous_el, previous_tab, optional_params) {
            html.breadcrumbs.textContent = localize("friends") + " / " + localize(this[tab.id].breadcrumb);
            update_settings_visibility();
            close_action_menu();
            let actions = [global_action_buttons.back];
            if (Object.keys(Friends.state.master_blocked).length) {
                actions.unshift({
                    text: "Blocked List",
                    i18n: "friends_blocked",
                    kbm_bind: null,
                    controller_bind: null,
                    callback: () => {
                        open_screen("friends_blocked_panel")
                    }
                })
            }
            Navigation.render_actions(actions, html.screen_actions)
        },
        friends_panel_tab_list: {
            content: "friends_panel_tab_content_list",
            nav: "friends_panel_list",
            breadcrumb: "friends_list",
            cb: () => {
                html.page_menu.classList.remove("hidden");
                current_page = 1;
                render_friends_list();
                update_friend_list_nav();
                set_list_nav_active()
            }
        },
        friends_panel_tab_party: {
            content: "friends_panel_tab_content_party",
            nav: "friends_panel_party",
            breadcrumb: "friends_party",
            cb: () => {
                html.page_menu.classList.remove("hidden");
                current_page = 1;
                render_party_list();
                update_party_list_nav();
                set_list_nav_active()
            }
        },
        friends_panel_tab_incoming: {
            content: "friends_panel_tab_content_incoming",
            nav: "friends_panel_incoming",
            breadcrumb: "friends_incoming",
            cb: () => {
                html.page_menu.classList.remove("hidden");
                current_page = 1;
                render_incoming_list();
                update_incoming_list_nav();
                set_list_nav_active()
            }
        },
        friends_panel_tab_recent: {
            content: "friends_panel_tab_content_recent",
            nav: "friends_panel_recent",
            breadcrumb: "friends_recent_players",
            cb: () => {
                html.page_menu.classList.remove("hidden");
                current_page = 1;
                render_recent_list();
                update_recent_list_nav();
                set_list_nav_active()
            }
        }
    };
    this.on_open = params => {
        Navigation.set_active({
            lb_rb: "friends_panel_tabs",
            up_down: null,
            left_right: null
        });
        if (params && params.tab && params.tab in tab_map) {
            Navigation.select_element("friends_panel_tabs", _id(params.tab))
        } else {
            Navigation.reset("lb_rb")
        }
        set_tab(tab_map, _id(tab_map.current_tab));
        _id("main_menu").addEventListener("click", outside_click)
    };
    this.on_close = () => {
        close_action_menu();
        _id("main_menu").removeEventListener("click", outside_click)
    };
    this.open_tab = pressed_tab => {
        set_tab(tab_map, pressed_tab)
    };

    function outside_click() {
        close_action_menu();
        reset_active_selection()
    }

    function friend_action(el) {
        if (el.classList.contains("open")) {
            close_action_menu()
        } else {
            close_action_menu();
            create_action_menu(el)
        }
    }

    function friend_select_action(el) {
        if (el) {
            let status_icon = el.querySelector(".status_icon");
            if (status_icon) status_icon.classList.add("selected")
        }
    }

    function friend_deselect_action(el) {
        if (el) {
            let status_icon = el.querySelector(".status_icon");
            if (status_icon) status_icon.classList.remove("selected")
        }
    }

    function update_list(list) {
        if (global_menu_page !== "friends_panel") return;
        if ((!list || list === "friends") && tab_map.current_tab === "friends_panel_tab_list") {
            render_friends_list();
            update_friend_list_nav();
            set_list_nav_active()
        } else if ((!list || list === "party") && tab_map.current_tab === "friends_panel_tab_party") {
            let re_enable_party_nav = false;
            if (Navigation.get_active("up_down") === "friends_panel_party") {
                re_enable_party_nav = true
            }
            render_party_list();
            update_party_list_nav();
            if (re_enable_party_nav) {
                set_list_nav_active()
            }
        } else if ((!list || list === "incoming") && tab_map.current_tab === "friends_panel_tab_incoming") {
            render_incoming_list();
            update_incoming_list_nav();
            set_list_nav_active()
        } else if ((!list || list === "recent") && tab_map.current_tab === "friends_panel_tab_recent") {
            render_recent_list();
            update_recent_list_nav();
            set_list_nav_active()
        }
    }

    function set_list_nav_active() {
        if (global_menu_page !== "friends_panel") return;
        if (tab_map.current_tab === "friends_panel_tab_list") {
            Navigation.reset_selection("friends_panel_settings");
            Navigation.set_active({
                up_down: "friends_panel_list"
            })
        } else if (tab_map.current_tab === "friends_panel_tab_party") {
            Navigation.reset_selection("friends_panel_settings");
            Navigation.set_active({
                up_down: "friends_panel_party"
            })
        } else if (tab_map.current_tab === "friends_panel_tab_incoming") {
            Navigation.reset_selection("friends_panel_settings");
            Navigation.set_active({
                up_down: "friends_panel_incoming"
            })
        } else if (tab_map.current_tab === "friends_panel_tab_recent") {
            Navigation.set_active({
                up_down: "friends_panel_recent"
            })
        }
    }

    function lock_active_list() {
        if (tab_map.current_tab === "friends_panel_tab_list") {
            Navigation.lock_nav("friends_panel_list", "hover")
        } else if (tab_map.current_tab === "friends_panel_tab_party") {
            Navigation.lock_nav("friends_panel_party", "hover")
        } else if (tab_map.current_tab === "friends_panel_tab_incoming") {
            Navigation.lock_nav("friends_panel_incoming", "hover")
        } else if (tab_map.current_tab === "friends_panel_tab_recent") {
            Navigation.lock_nav("friends_panel_recent", "hover")
        }
    }

    function unlock_active_list() {
        if (tab_map.current_tab === "friends_panel_tab_list") {
            Navigation.unlock_nav("friends_panel_list")
        } else if (tab_map.current_tab === "friends_panel_tab_party") {
            Navigation.unlock_nav("friends_panel_party")
        } else if (tab_map.current_tab === "friends_panel_tab_incoming") {
            Navigation.unlock_nav("friends_panel_incoming")
        } else if (tab_map.current_tab === "friends_panel_tab_recent") {
            Navigation.unlock_nav("friends_panel_recent")
        }
    }

    function reset_active_selection() {
        if (tab_map.current_tab === "friends_panel_tab_list") {
            Navigation.reset_selection("friends_panel_list")
        } else if (tab_map.current_tab === "friends_panel_tab_party") {
            Navigation.reset_selection("friends_panel_party")
        } else if (tab_map.current_tab === "friends_panel_tab_incoming") {
            Navigation.reset_selection("friends_panel_incoming")
        } else if (tab_map.current_tab === "friends_panel_tab_recent") {
            Navigation.reset_selection("friends_panel_recent")
        }
    }

    function update_incoming_count() {
        let total = Friends.state.invites.length + Friends.state.requests.length;
        html.incoming_count.textContent = total;
        if (total) {
            html.incoming_count.classList.add("visible")
        } else {
            html.incoming_count.classList.remove("visible")
        }
    }

    function render_page_menu(page, max_page) {
        html.page_menu_text.textContent = localize_ext("page_x_of_n", {
            x: page,
            n: max_page
        });
        if (max_page <= 1) {
            html.page_menu.classList.add("hidden")
        } else {
            html.page_menu.classList.remove("hidden")
        }
    }

    function update_friend(f) {
        if (tab_map.current_tab === "friends_panel_tab_list") {
            for (let el of html.active_element_list) {
                if (el.dataset.user_id === f.user_id) {
                    update_friend_state(el, f, "friend")
                }
            }
        } else if (tab_map.current_tab === "friends_panel_tab_party") {
            for (let el of html.active_element_list) {
                if (el.dataset.user_id === f.user_id) {
                    update_friend_state(el, f, "party")
                }
            }
        }
    }

    function update_friend_state(el, f, type) {
        let prev_icon_cont = el.querySelector(".icon_cont");
        let new_icon_cont = create_friend_icon(type, f);
        el.replaceChild(new_icon_cont, prev_icon_cont);
        let state_el = el.querySelector(".desc .status");
        set_friend_state(el, f, state_el, new_icon_cont)
    }

    function render_friends_list() {
        html.active_element_list.length = 0;
        let playing = 0;
        let friends = [];
        for (let user_id in Friends.state.all) {
            if (!Friends.state.all[user_id].storefriend && !(Friends.state.all[user_id].masterfriend && Friends.state.all[user_id].friendship_state === 0)) {
                continue
            }
            if (Friends.state.all[user_id].category === "ingame") playing++;
            friends.push(Friends.state.all[user_id])
        }
        friends.sort(((a, b) => {
            if (a.category === b.category) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1
                }
                return 0
            } else {
                if (a.category === "ingame") return -1;
                else if (b.category === "ingame") return 1;
                else if (a.category === "othergame") return -1;
                else if (b.category === "othergame") return 1;
                else if (a.category === "online") return -1;
                else if (b.category === "online") return 1;
                return 0
            }
        }));
        if (list_filter) {
            friends = friends.filter((function(e) {
                return e.name.toLowerCase().includes(list_filter.toLowerCase())
            }))
        }
        let start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE;
        while (start_index >= friends.length && current_page > 1) {
            current_page--;
            start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE
        }
        for (let i = start_index; i < start_index + MAX_ITEMS_PER_PAGE; i++) {
            if (i >= friends.length) break;
            let friend_element = create_friend_el(friends[i]);
            list_fragment.appendChild(friend_element);
            html.active_element_list.push(friend_element)
        }
        let max_page = Math.ceil(friends.length / MAX_ITEMS_PER_PAGE);
        _empty(html.list);
        html.list.appendChild(list_fragment);
        render_page_menu(current_page, max_page)
    }

    function update_friend_list_nav() {
        Navigation.generate_nav({
            name: "friends_panel_list",
            nav_root: _id("friends_panel_tab_content_list"),
            nav_class: "friend",
            mouse_click: "instant-action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: friend_action,
            select_cb: friend_select_action,
            deselect_cb: friend_deselect_action,
            past_first_cb: past_first_select
        })
    }

    function update_party_list_nav() {
        Navigation.generate_nav({
            name: "friends_panel_party",
            nav_root: _id("friends_panel_tab_content_party"),
            nav_class: "friend",
            mouse_click: "instant-action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: friend_action,
            past_first_cb: past_first_select
        })
    }

    function update_incoming_list_nav() {
        Navigation.generate_nav({
            name: "friends_panel_incoming",
            nav_root: _id("friends_panel_tab_content_incoming"),
            nav_class: "friend",
            mouse_click: "instant-action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: friend_action,
            past_first_cb: past_first_select
        })
    }

    function update_recent_list_nav() {
        Navigation.generate_nav({
            name: "friends_panel_recent",
            nav_root: _id("friends_panel_tab_content_recent"),
            nav_class: "friend",
            mouse_click: "instant-action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: friend_action
        })
    }

    function past_first_select() {
        Navigation.set_active({
            up_down: "friends_panel_settings"
        });
        Navigation.reset_to_last("friends_panel_settings");
        if (tab_map.current_tab === "friends_panel_tab_list") {
            Navigation.reset_selection("friends_panel_list")
        } else if (tab_map.current_tab === "friends_panel_tab_party") {
            Navigation.reset_selection("friends_panel_party")
        } else if (tab_map.current_tab === "friends_panel_tab_incoming") {
            Navigation.reset_selection("friends_panel_incoming")
        }
    }

    function past_last_select() {
        if (tab_map.current_tab === "friends_panel_tab_list") {
            Navigation.set_active({
                up_down: "friends_panel_list"
            });
            Navigation.reset_selection("friends_panel_settings");
            Navigation.reset_to_first("friends_panel_list")
        } else if (tab_map.current_tab === "friends_panel_tab_party") {
            Navigation.set_active({
                up_down: "friends_panel_party"
            });
            Navigation.reset_selection("friends_panel_settings");
            Navigation.reset_to_first("friends_panel_party")
        } else if (tab_map.current_tab === "friends_panel_tab_incoming") {
            Navigation.set_active({
                up_down: "friends_panel_incoming"
            });
            Navigation.reset_selection("friends_panel_settings");
            Navigation.reset_to_first("friends_panel_incoming")
        }
    }

    function render_party_list() {
        html.active_element_list.length = 0;
        let party = [];
        for (let user_id in global_party.members) {
            party.push(global_party.members[user_id])
        }
        party.sort(((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1
            }
            return 0
        }));
        if (list_filter) {
            party = party.filter((function(e) {
                return e.name.toLowerCase().includes(list_filter.toLowerCase())
            }))
        }
        let start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE;
        while (start_index >= party.length && current_page > 1) {
            current_page--;
            start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE
        }
        let party_head = _createElement("div", "party_head");
        party_head.textContent = localize("party") + " ( " + party.length + " / 4 )";
        list_fragment.appendChild(party_head);
        for (let i = start_index; i < start_index + MAX_ITEMS_PER_PAGE; i++) {
            if (i >= party.length) break;
            let friend_element = create_party_el(party[i]);
            list_fragment.appendChild(friend_element);
            html.active_element_list.push(friend_element)
        }
        let max_page = Math.ceil(party.length / MAX_ITEMS_PER_PAGE);
        _empty(html.party);
        html.party.appendChild(list_fragment);
        render_page_menu(current_page, max_page)
    }

    function render_incoming_list() {
        html.active_element_list.length = 0;
        let incoming = [];
        for (let invite of Friends.state.invites) {
            incoming.push({
                type: "invite",
                obj: invite
            })
        }
        for (let request of Friends.state.requests) {
            incoming.push({
                type: "request",
                obj: request
            })
        }
        incoming.sort(((a, b) => {
            if (a.obj.name.toLowerCase() < b.obj.name.toLowerCase()) {
                return -1
            }
            if (a.obj.name.toLowerCase() > b.obj.name.toLowerCase()) {
                return 1
            }
            return 0
        }));
        if (list_filter) {
            incoming = incoming.filter((function(e) {
                return e.obj.name.toLowerCase().includes(list_filter.toLowerCase())
            }))
        }
        let start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE_INCOMING;
        while (start_index >= incoming.length && current_page > 1) {
            current_page--;
            start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE_INCOMING
        }
        for (let i = start_index; i < start_index + MAX_ITEMS_PER_PAGE_INCOMING; i++) {
            if (i >= incoming.length) break;
            if (incoming[i].type === "invite") {
                let friend_element = create_invite_el(incoming[i].obj);
                list_fragment.appendChild(friend_element);
                html.active_element_list.push(friend_element)
            } else if (incoming[i].type === "request") {
                let friend_element = create_request_el(incoming[i].obj);
                list_fragment.appendChild(friend_element);
                html.active_element_list.push(friend_element)
            }
        }
        let max_page = Math.ceil(incoming.length / MAX_ITEMS_PER_PAGE_INCOMING);
        _empty(html.incoming);
        html.incoming.appendChild(list_fragment);
        render_page_menu(current_page, max_page)
    }

    function render_recent_list() {
        let max_page = 1;
        if (recent_players_total === 0) {
            current_page = 1
        } else {
            max_page = Math.ceil(recent_players_total / MAX_ITEMS_PER_PAGE);
            while (max_page < current_page) {
                if (current_page === 1) {
                    break
                }
                current_page--
            }
        }
        engine.call("get_recent_players", current_page, MAX_ITEMS_PER_PAGE);
        max_page = Math.ceil(recent_players_total / MAX_ITEMS_PER_PAGE);
        html.active_element_list.length = 0;
        for (let p of recent_players) {
            let player_element = create_recent_el(p);
            list_fragment.appendChild(player_element);
            html.active_element_list.push(player_element)
        }
        _empty(html.recent);
        html.recent.appendChild(list_fragment);
        render_page_menu(current_page, max_page)
    }

    function create_recent_el(f) {
        let friend = _createElement("div", "friend");
        friend.dataset.type = "recent";
        friend.dataset.user_id = f.user_id;
        friend.dataset.party_privacy = true;
        let icon_cont = create_friend_icon("recent", f);
        friend.appendChild(icon_cont);
        let desc = _createElement("div", "desc");
        desc.appendChild(_createElement("div", "name", f.name));
        friend.appendChild(desc);
        return friend
    }

    function create_friend_el(f) {
        let friend = _createElement("div", "friend");
        friend.dataset.type = "friend";
        friend.dataset.user_id = f.user_id;
        friend.dataset.user_name = f.name;
        friend.dataset.party_privacy = true;
        let icon_cont = create_friend_icon("friend", f);
        friend.appendChild(icon_cont);
        let desc = _createElement("div", "desc");
        desc.appendChild(_createElement("div", "name", f.name));
        let state_el = _createElement("div", "status");
        set_friend_state(friend, f, state_el, icon_cont);
        desc.appendChild(state_el);
        friend.appendChild(desc);
        return friend
    }

    function create_party_el(f) {
        let friend = _createElement("div", "friend");
        friend.dataset.type = "friend";
        friend.dataset.user_id = f.user_id;
        friend.dataset.user_name = f.name;
        friend.dataset.party_privacy = true;
        friend.appendChild(create_friend_icon("party", f));
        let desc = _createElement("div", "desc");
        desc.appendChild(_createElement("div", "name", f.name));
        desc.appendChild(_createElement("div", "status", gamestate_to_string(f.gamestate)));
        friend.appendChild(desc);
        return friend
    }

    function create_invite_el(f) {
        let friend = _createElement("div", "friend");
        friend.dataset.user_id = f.user_id;
        friend.dataset.user_name = f.name;
        friend.dataset.type = "invite";
        friend.dataset.inviteType = f["type"];
        friend.dataset.typeId = f["type-id"];
        if (f.user_id in Friends.state.all) {
            friend.appendChild(create_friend_icon("invite", Friends.state.all[f.user_id]))
        } else {
            friend.appendChild(create_friend_icon("invite", {}))
        }
        let info = "";
        if (f.type == "party") {
            info = localize("friends_list_title_party_invite")
        } else if (f.type == "lobby") {
            info = localize("friends_list_title_lobby_invite")
        } else if (f.type == "match") {
            info = localize("friends_list_title_match_invite")
        }
        let desc = _createElement("div", "desc");
        desc.appendChild(_createElement("div", "name", f.name));
        desc.appendChild(_createElement("div", "status", info));
        friend.appendChild(desc);
        return friend
    }

    function create_request_el(f) {
        let friend = _createElement("div", "friend");
        friend.dataset.user_id = f.user_id;
        friend.dataset.user_name = f.name;
        friend.dataset.type = "request";
        friend.appendChild(create_friend_icon("request", f));
        let desc = _createElement("div", "desc");
        desc.appendChild(_createElement("div", "name", f.name));
        desc.appendChild(_createElement("div", "status", localize("friends_list_title_friend_request")));
        friend.appendChild(desc);
        return friend
    }

    function create_friend_icon(type, f) {
        let icon_cont = _createElement("div", "icon_cont");
        if (type === "friend" || type === "invite") {
            if (f.category) {
                if (f.category === "othergame" || f.category === "online" || f.category === "offline" || f.category === "ingame") {
                    if (f.storefriend) {
                        set_store_avatar(false, icon_cont, f.client_user_id)
                    } else {
                        icon_cont.appendChild(_createElement("div", ["avatar_icon", "master"]))
                    }
                }
                if (f.category === "ingame" || f.inparty) {
                    icon_cont.classList.add("ingame")
                }
            } else {
                icon_cont.appendChild(_createElement("div", "avatar_icon"))
            }
        } else if (type === "party") {
            icon_cont.classList.add("ingame");
            set_store_avatar(f.user_id === global_self.user_id, icon_cont, f.client_user_id, f.client_source)
        } else if (type === "recent" || type === "request") {
            set_store_avatar(f.user_id === global_self.user_id, icon_cont, "", "" + CLIENT_SOURCE_NAME.GDS)
        }
        if (type === "friend") {
            icon_cont.appendChild(_createElement("div", "status_icon"))
        }
        return icon_cont
    }

    function set_friend_state(friend, f, state_el, icon_cont) {
        let status_icon = icon_cont.querySelector(".status_icon");
        if (f.ingame) {
            state_el.textContent = gamestate_to_string(f.gamestate);
            if (status_icon) status_icon.classList.add("ingame")
        } else if (f.online) {
            state_el.textContent = localize("friends_list_state_online");
            if (status_icon) status_icon.classList.add("online")
        } else {
            state_el.textContent = localize("friends_list_state_offline");
            if (status_icon) status_icon.classList.add("offline")
        }
        if (friend.classList.contains("active_selection") && status_icon) {
            status_icon.classList.add("selected")
        }
    }

    function gamestate_to_string(gamestate) {
        if (gamestate.length === 0) return "";
        let data = gamestate.split(":");
        if (parseInt(data[0]) !== GAME.active) {
            let game_name = localize("game_name_" + data[0]);
            if (game_name !== "game_name_" + data[0]) return "In " + game_name;
            return localize("friends_list_state_in_other_game")
        }
        if (data[1] === "o") return "";
        else if (data[1] === "m") return localize("friends_list_state_idle");
        else if (data[1] === "p") {
            return localize("friends_list_state_in_match")
        }
        return ""
    }

    function create_action_menu(el) {
        el.classList.add("open");
        action_menu_open = true;
        _empty(html.action_menu);
        let rect = el.getBoundingClientRect();
        html.action_menu.style.top = rect.top + "px";
        let options = [];
        let user_id = el.dataset.user_id;
        let user_name = el.dataset.user_name;
        let type = el.dataset.type;
        user_id = Friends.get_mapped_user_id(user_id);
        let is_self = false;
        if (global_self.user_id === user_id) is_self = true;
        console.log("create_action_menu", is_self, user_id, type);
        if (is_self) {
            if (global_party.size > 1) {
                let option = _createElement("div", "option");
                option.appendChild(_createElement("div", ["accent", "negative"]));
                option.appendChild(_createElement("div", "label", localize("friends_list_action_party_leave")));
                option.dataset.name = "leave-party";
                html.action_menu.appendChild(option);
                options.push(option)
            }
        } else {
            if (type == "friend") {
                if (Friends.state.all.hasOwnProperty(user_id)) {
                    if ((Friends.state.all[user_id].friendship_state == 0 || Friends.state.all[user_id].storefriend) && Friends.state.all[user_id].ingame) {
                        let option_msg = _createElement("div", "option");
                        option_msg.appendChild(_createElement("div", ["accent", "positive"]));
                        option_msg.appendChild(_createElement("div", "label", localize("friends_list_action_message")));
                        option_msg.dataset.name = "message-user";
                        option_msg.dataset.user_id = user_id;
                        html.action_menu.appendChild(option_msg);
                        options.push(option_msg)
                    }
                    if (Friends.state.source === CLIENT_SOURCE_NAME.STEAM && Friends.state.all[user_id].storefriend && Friends.state.all[user_id].client_user_id) {
                        let option_msg = _createElement("div", "option");
                        option_msg.appendChild(_createElement("div", ["accent", "positive"]));
                        option_msg.appendChild(_createElement("div", "label", localize("open_steam_profile")));
                        option_msg.dataset.name = "open-steam-profile";
                        option_msg.dataset.user_id = user_id;
                        html.action_menu.appendChild(option_msg);
                        options.push(option_msg)
                    }
                    if (Friends.state.all[user_id].game_id === GAME.active) {
                        if ((Friends.state.all[user_id].friendship_state == 0 || Friends.state.all[user_id].storefriend) && Friends.state.all[user_id].ingame) {
                            if (Friends.state.all[user_id].party_privacy == false && !(user_id in global_party.members)) {
                                let option_join = _createElement("div", "option");
                                option_join.appendChild(_createElement("div", ["accent", "positive"]));
                                option_join.appendChild(_createElement("div", "label", localize("friends_list_action_party_join")));
                                option_join.dataset.name = "join-party";
                                option_join.dataset.user_id = user_id;
                                html.action_menu.appendChild(option_join);
                                options.push(option_join)
                            }
                        }
                    }
                }
                if (user_id in global_party.members && bool_am_i_leader) {
                    let option = _createElement("div", "option");
                    option.appendChild(_createElement("div", ["accent", "positive"]));
                    option.appendChild(_createElement("div", "label", localize("friends_list_action_party_promote")));
                    option.dataset.name = "promote";
                    option.dataset.user_id = user_id;
                    html.action_menu.appendChild(option);
                    options.push(option)
                }
                if (user_id in global_party.members && bool_am_i_leader) {
                    let option = _createElement("div", "option");
                    option.appendChild(_createElement("div", ["accent", "negative"]));
                    option.appendChild(_createElement("div", "label", localize("friends_list_action_party_remove")));
                    option.dataset.name = "party-remove";
                    option.dataset.user_id = user_id;
                    html.action_menu.appendChild(option);
                    options.push(option)
                }
            }
            if ((type === "friend" || type === "recent") && !(user_id in Friends.state.master_blocked)) {
                if (Friends.state.all.hasOwnProperty(user_id) && !Friends.state.all[user_id].masterfriend || !Friends.state.all.hasOwnProperty(user_id)) {
                    let option = _createElement("div", "option");
                    option.appendChild(_createElement("div", ["accent", "positive"]));
                    option.appendChild(_createElement("div", "label", localize("friends_list_action_friend_request")));
                    option.dataset.name = "friend-request";
                    option.dataset.user_id = user_id;
                    html.action_menu.appendChild(option);
                    options.push(option)
                }
                if (Lobby.in_lobby() && (type === "friend" && Friends.state.all.hasOwnProperty(user_id) && (Friends.state.all[user_id].friendship_state == 0 || Friends.state.all[user_id].storefriend) || type === "recent")) {
                    let option = _createElement("div", "option");
                    option.appendChild(_createElement("div", ["accent", "positive"]));
                    option.appendChild(_createElement("div", "label", localize("friends_list_action_invite_lobby")));
                    option.dataset.name = "invite-lobby";
                    option.dataset.user_id = user_id;
                    html.action_menu.appendChild(option);
                    options.push(option)
                }
                if (!(user_id in global_party.members) && (type === "friend" && Friends.state.all.hasOwnProperty(user_id) && (Friends.state.all[user_id].friendship_state == 0 || Friends.state.all[user_id].storefriend) || type === "recent")) {
                    let option = _createElement("div", "option");
                    option.appendChild(_createElement("div", ["accent", "positive"]));
                    option.appendChild(_createElement("div", "label", localize("friends_list_action_invite_party")));
                    option.dataset.name = "invite-party";
                    option.dataset.user_id = user_id;
                    html.action_menu.appendChild(option);
                    options.push(option)
                }
            }
            if (type === "friend") {
                if (Friends.state.all.hasOwnProperty(user_id) && Friends.state.all[user_id].friendship_state == 0 && Friends.state.all[user_id].masterfriend) {
                    html.action_menu.appendChild(_createElement("div", "separator"));
                    let option = _createElement("div", "option");
                    option.appendChild(_createElement("div", ["accent", "negative"]));
                    option.appendChild(_createElement("div", "label", localize("friends_list_action_remove_friend")));
                    option.dataset.name = "remove-friend";
                    option.dataset.user_id = user_id;
                    html.action_menu.appendChild(option);
                    options.push(option)
                }
            }
            if (type == "invite") {
                let option_a = _createElement("div", "option");
                option_a.appendChild(_createElement("div", ["accent", "positive"]));
                option_a.appendChild(_createElement("div", "label", localize("friends_list_action_accept")));
                option_a.dataset.name = "accept-invite";
                option_a.dataset.inviteType = el.dataset.inviteType;
                option_a.dataset.typeId = el.dataset.typeId;
                html.action_menu.appendChild(option_a);
                options.push(option_a);
                let option_d = _createElement("div", "option");
                option_d.appendChild(_createElement("div", ["accent", "negative"]));
                option_d.appendChild(_createElement("div", "label", localize("friends_list_action_decline")));
                option_d.dataset.name = "decline-invite";
                option_d.dataset.inviteType = el.dataset.inviteType;
                option_d.dataset.typeId = el.dataset.typeId;
                html.action_menu.appendChild(option_d);
                options.push(option_d)
            }
            if (type == "request") {
                let option_a = _createElement("div", "option");
                option_a.appendChild(_createElement("div", ["accent", "positive"]));
                option_a.appendChild(_createElement("div", "label", localize("friends_list_action_accept")));
                option_a.dataset.name = "accept-friend";
                option_a.dataset.user_id = user_id;
                html.action_menu.appendChild(option_a);
                options.push(option_a);
                let option_d = _createElement("div", "option");
                option_d.appendChild(_createElement("div", ["accent", "negative"]));
                option_d.appendChild(_createElement("div", "label", localize("friends_list_action_decline")));
                option_d.dataset.name = "decline-friend";
                option_d.dataset.user_id = user_id;
                html.action_menu.appendChild(option_d);
                options.push(option_d)
            }
            if (type === "invite" || type === "request") {
                html.action_menu.appendChild(_createElement("div", "separator"));
                let option_b = _createElement("div", "option");
                option_b.appendChild(_createElement("div", ["accent", "negative"]));
                option_b.appendChild(_createElement("div", "label", localize("friends_list_action_decline_block")));
                option_b.dataset.name = "block-friend";
                option_b.dataset.user_id = user_id;
                option_b.dataset.user_name = user_name;
                html.action_menu.appendChild(option_b);
                options.push(option_b)
            }
            if (type == "blocked" || type === "recent" && user_id in Friends.state.master_blocked) {
                let option_ub = _createElement("div", "option");
                option_ub.appendChild(_createElement("div", ["accent", "positive"]));
                option_ub.appendChild(_createElement("div", "label", localize("friends_list_action_unblock")));
                option_ub.dataset.name = "unblock-friend";
                option_ub.dataset.user_id = user_id;
                html.action_menu.appendChild(option_ub);
                options.push(option_ub)
            }
        }
        if (!options.length) {
            return
        }
        html.action_menu.classList.add("active");
        html.action_menu.style.visibility = "hidden";
        req_anim_frame((() => {
            let rect = html.action_menu.getBoundingClientRect();
            html.action_menu.style.visibility = "visible"
        }));
        Navigation.generate_nav({
            name: "friends_panel_action_menu",
            nav_root: html.action_menu,
            nav_class: "option",
            mouse_click: "action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: action_menu_cb
        });
        Navigation.set_active({
            up_down: "friends_panel_action_menu"
        });
        lock_active_list()
    }

    function action_menu_cb(el) {
        if (el.dataset.name === "leave-party") {
            send_json_data({
                action: "party-leave"
            });
            close_action_menu()
        } else if (el.dataset.name === "message-user") {
            Friends.exec_mapped_user_id(el.dataset.user_id, (function(mapped_user_id) {
                engine.call("message_user", mapped_user_id)
            }));
            close_action_menu()
        } else if (el.dataset.name === "open-steam-profile") {
            if (el.dataset.user_id in Friends.state.all && Friends.state.all[el.dataset.user_id].client_user_id) {
                engine.call("open_browser", "https://steamcommunity.com/profiles/" + Friends.state.all[el.dataset.user_id].client_user_id)
            }
            close_action_menu()
        } else if (el.dataset.name === "join-party") {
            Friends.exec_mapped_user_id(el.dataset.user_id, (function(mapped_user_id) {
                if (mapped_user_id in Friends.state.all) {
                    send_string(CLIENT_COMMAND_JOIN_USERID_PARTY, mapped_user_id + ":" + Friends.state.all[mapped_user_id].friend_token)
                }
            }));
            close_action_menu()
        } else if (el.dataset.name === "invite-lobby") {
            Friends.exec_mapped_user_id(el.dataset.user_id, (function(mapped_user_id) {
                Friends.send_invite_add("lobby", mapped_user_id)
            }));
            close_action_menu()
        } else if (el.dataset.name === "invite-party") {
            Friends.exec_mapped_user_id(el.dataset.user_id, (function(mapped_user_id) {
                Friends.send_invite_add("party", mapped_user_id)
            }));
            close_action_menu()
        } else if (el.dataset.name === "friend-request") {
            Friends.exec_mapped_user_id(el.dataset.user_id, (function(mapped_user_id) {
                send_string(CLIENT_COMMAND_SEND_FRIEND_REQUEST, mapped_user_id)
            }));
            close_action_menu()
        } else if (el.dataset.name === "promote") {
            Friends.exec_mapped_user_id(el.dataset.user_id, (function(mapped_user_id) {
                send_json_data({
                    action: "party-promote",
                    "user-id": mapped_user_id
                })
            }));
            close_action_menu()
        } else if (el.dataset.name === "party-remove") {
            Friends.exec_mapped_user_id(el.dataset.user_id, (function(mapped_user_id) {
                send_json_data({
                    action: "party-remove",
                    "user-id": mapped_user_id
                })
            }));
            close_action_menu()
        } else if (el.dataset.name === "remove-friend") {
            let text = "Are you sure you want to remove " + Friends.state.all[el.dataset.user_id].name + " from your friends?";
            modal_panel.open("Remove Friend", text, [{
                title: localize("menu_button_confirm"),
                callback: () => {
                    send_string(CLIENT_COMMAND_REMOVE_FRIEND, el.dataset.user_id);
                    Friends.remove_master_friend(el.dataset.user_id);
                    historyBack()
                }
            }, {
                title: localize("menu_button_cancel"),
                callback: () => {
                    historyBack()
                }
            }])
        } else if (el.dataset.name === "accept-invite") {
            Friends.send_invite_accept(el.dataset.inviteType, el.dataset.typeId);
            close_action_menu()
        } else if (el.dataset.name === "decline-invite") {
            Friends.send_invite_decline(el.dataset.inviteType, el.dataset.typeId);
            close_action_menu()
        } else if (el.dataset.name === "accept-friend") {
            send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, el.dataset.user_id + ":a");
            Friends.remove_request(el.dataset.user_id);
            close_action_menu()
        } else if (el.dataset.name === "decline-friend") {
            send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, el.dataset.user_id + ":d");
            Friends.remove_request(el.dataset.user_id);
            close_action_menu()
        } else if (el.dataset.name === "block-friend") {
            send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, el.dataset.user_id + ":b");
            Friends.master_add_blocked(el.dataset.user_id, el.dataset.user_name);
            close_action_menu()
        } else if (el.dataset.name === "unblock-friend") {
            send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, el.dataset.user_id + ":ub");
            Friends.master_remove_blocked(el.dataset.user_id);
            close_action_menu()
        }
    }

    function close_action_menu() {
        console.log("close_action_menu");
        if (action_menu_open) {
            action_menu_open = false;
            _empty(html.action_menu);
            html.action_menu.classList.remove("active");
            for (let el of html.active_element_list) {
                if (el.classList.contains("open")) {
                    el.classList.remove("open")
                }
            }
            set_list_nav_active();
            unlock_active_list()
        }
    }
};