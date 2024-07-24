new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "custom",
    screen_element: _id("custom_screen"),
    button_element: null,
    fullscreen: false,
    init: () => {
        page_custom.init()
    },
    open_handler: () => {
        historyPushState({
            page: "custom"
        });
        set_blur(true);
        page_custom.on_open()
    },
    close_handler: () => {
        set_blur(false);
        Navigation.reset_active()
    }
});
const page_custom = new function() {
    let state = {
        class: "",
        join_key: "",
        datacenter_list: [],
        player_slots: [],
        spec_slots: [],
        record_replay_avail: false,
        ui_max_teams: 2,
        ui_min_players_per_team: 6,
        ui_render_team_player_slots: 6,
        ui_small_size_after_team_size: 8,
        ui_extra_small_size_after_team_size: 12,
        quick_info_settings: ["private", "mode", "datacenter"]
    };
    this.preset = {
        loaded: false,
        id: null,
        list: {},
        slots: 10
    };
    let elements = {};
    let html = {
        root: null,
        lobby: null,
        settings: null,
        sub_screen_menu: null,
        team_0: null,
        team_1: null,
        team_players: [],
        spectators: null,
        spectators_scroll: null,
        settings_scroll: null,
        screen_actions: null,
        join_button: null,
        current_mode_selection: null,
        team_head: {},
        team_counts: {},
        descriptions: null,
        commands: null
    };
    let el_containers = {};
    let bool_to_int = ["private"];
    let tab_map = {
        current_tab: "custom_screen_lobby_tab",
        current_scroll: null,
        cb: function(el, tab, previous_el, previous_tab, optional_params) {},
        custom_screen_lobby_tab: {
            content: "custom_screen_lobby",
            scroll: null,
            nav: null,
            cb: () => {
                refreshScrollbar(html.spectators_scroll)
            }
        },
        custom_screen_settings_tab: {
            content: "custom_screen_settings",
            scroll: null,
            nav: null,
            cb: () => {
                refreshScrollbar(html.settings_scroll)
            }
        }
    };

    function tab_selected(element, action) {
        set_tab(tab_map, element)
    }
    this.init = () => {
        html.root = _id("custom_screen");
        html.lobby = _id("custom_screen_lobby");
        html.settings = _id("custom_screen_settings");
        html.sub_screen_menu = html.root.querySelector(".sub_screen_menu");
        html.team_0 = html.root.querySelector(".team.team_0");
        html.team_1 = html.root.querySelector(".team.team_1");
        html.spectators = html.root.querySelector(".team.spectators .list");
        html.spectators_scroll = html.lobby.querySelector(".scroll-outer");
        html.settings_scroll = html.settings.querySelector(".scroll-outer");
        html.quick_info_settings = html.lobby.querySelector(".settings");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        html.join_button = _id("custom_game_button_join");
        html.current_mode_selection = html.root.querySelector(".mode_selection .current_selection");
        html.team_players[0] = html.team_0.querySelector(".list");
        html.team_players[1] = html.team_1.querySelector(".list");
        html.team_head[0] = html.team_0.querySelector(".head .name");
        html.team_head[1] = html.team_1.querySelector(".head .name");
        html.team_counts[0] = html.team_0.querySelector(".head .status");
        html.team_counts[1] = html.team_1.querySelector(".head .status");
        html.team_counts[SPECTATING_TEAM] = html.lobby.querySelector(".team.spectators .status");
        html.descriptions = _id("custom_screen_settings").querySelector(".settings .descriptions");
        html.commands = _id("custom_setting_commands");
        this.set_lobby_colors();
        global_variable.addPermanentResponseHandler("color", "game_team1_color_override", (value => {
            this.set_lobby_colors()
        }));
        global_variable.addPermanentResponseHandler("color", "game_team2_color_override", (value => {
            this.set_lobby_colors()
        }));
        global_on_ms_disconnected.push((() => {
            if (global_menu_page === "custom") {
                historyBack()
            }
        }));
        html.lobby.style.setProperty("--ui_max_players_per_team", "" + state.ui_min_players_per_team);
        let first_sub_menu_option = html.root.querySelector(".sub_screen_menu_option");
        Navigation.generate_nav({
            name: "custom_screen_menu",
            nav_root: html.sub_screen_menu,
            nav_class: "sub_screen_menu_option",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            mouse_hover: "none",
            mouse_click: "action",
            action_cb_type: "immediate",
            selection_required: true,
            action_cb: tab_selected
        });
        Navigation.select_element("custom_screen_menu", first_sub_menu_option);
        elements.map = html.root.querySelectorAll(".custom_game_setting_map");
        elements.map_list = _id("custom_game_setting_map_list");
        elements.private = _id("custom_game_setting_visibility");
        elements.name = _id("custom_game_setting_name");
        elements.datacenter = _id("custom_game_setting_location");
        elements.time_limit = _id("custom_game_setting_time_limit");
        elements.score_limit = _id("custom_game_setting_score_limit");
        elements.team_count = _id("custom_game_setting_team_count");
        elements.team_size = _id("custom_game_setting_team_size");
        elements.continuous = _id("custom_game_setting_continuous");
        elements.auto_balance = _id("custom_game_setting_auto_balance");
        elements.team_switching = _id("custom_game_setting_team_switching");
        elements.ready_percentage = _id("custom_game_setting_ready_percentage");
        elements.warmup_time = _id("custom_game_setting_warmup_time");
        elements.min_players = _id("custom_game_setting_min_players");
        elements.max_clients = _id("custom_game_setting_max_clients");
        elements.commands = _id("custom_game_setting_commands");
        elements.allow_map_voting = _id("custom_game_setting_allow_map_voting");
        elements.record_replay = _id("custom_game_setting_record_replay");
        el_containers.name = _id("custom_setting_name");
        el_containers.password = _id("custom_setting_password");
        el_containers.team_count = _id("custom_setting_team_count");
        el_containers.team_size = _id("custom_setting_team_size");
        el_containers.time_limit = _id("custom_setting_time_limit");
        el_containers.score_limit = _id("custom_setting_score_limit");
        elements.commands.addEventListener("focus", (() => {
            elements.commands.classList.add("focused")
        }));
        elements.commands.addEventListener("blur", (() => {
            elements.commands.classList.remove("focused");
            this.user_update("commands", elements.commands.value)
        }));
        setup_select(elements.private, ((opt, field) => {
            this.user_update("private", opt.dataset.value)
        }));
        setup_select(elements.team_count, ((opt, field) => {
            this.user_update("team_count", opt.dataset.value)
        }));
        setup_select(elements.team_size, ((opt, field) => {
            this.user_update("team_size", opt.dataset.value)
        }));
        setup_select(elements.time_limit, ((opt, field) => {
            this.user_update("time_limit", opt.dataset.value)
        }));
        setup_select(elements.score_limit, ((opt, field) => {
            this.user_update("score_limit", opt.dataset.value)
        }));
        setup_select(elements.continuous, ((opt, field) => {
            this.user_update("continuous", opt.dataset.value)
        }));
        setup_select(elements.allow_map_voting, ((opt, field) => {
            this.user_update("allow_map_voting", opt.dataset.value)
        }));
        setup_select(elements.auto_balance, ((opt, field) => {
            this.user_update("auto_balance", opt.dataset.value)
        }));
        setup_select(elements.team_switching, ((opt, field) => {
            this.user_update("team_switching", opt.dataset.value)
        }));
        setup_select(elements.ready_percentage, ((opt, field) => {
            this.user_update("ready_percentage", opt.dataset.value)
        }));
        setup_select(elements.warmup_time, ((opt, field) => {
            this.user_update("warmup_time", opt.dataset.value)
        }));
        setup_select(elements.min_players, ((opt, field) => {
            this.user_update("min_players", opt.dataset.value)
        }));
        setup_select(elements.max_clients, ((opt, field) => {
            this.user_update("max_clients", opt.dataset.value)
        }));
        setup_select(elements.record_replay, ((opt, field) => {
            this.user_update("record_replay", opt.dataset.value)
        }));
        Lobby.add_setting_updated_listener(((setting, value) => {
            if (bool_to_int.includes(setting)) value = value ? 1 : 0;
            if (setting === "datacenter") {
                if (value.startsWith("ip_") && !Lobby.state.host) {
                    value = "direct"
                }
            }
            if (setting === "commands") {
                if (typeof value !== "object" || value.length === 0) {
                    elements.commands.value = ""
                } else {
                    let commands_str = "";
                    for (let c of value) commands_str += update_custom_command(c.key, c.value);
                    elements.commands.value = commands_str
                }
            } else if (setting === "name") {
                elements.name.value = value
            } else if (setting === "join_key") {
                state.join_key = value
            } else if (setting === "record_replay_avail") {
                if (value === 1) {
                    this.remove_lock(elements.record_replay, "record_replay_avail")
                } else {
                    this.add_lock(elements.record_replay, "record_replay_avail")
                }
            } else if (setting in elements) {
                elements[setting].dataset.value = value;
                update_select(elements[setting])
            }
            this.on_setting_changed(setting, value)
        }));
        Lobby.add_teams_updated_listener((teams => {
            this.initialize_lobby_slots(Lobby.get_setting("team_size"), Lobby.get_setting("team_count"));
            this.render_teams(teams);
            this.set_lobby_colors();
            this.set_team_player_counts()
        }));
        Lobby.add_join_listener((() => {
            if (GAME.active === GAME.ids.INVASION && menu_game_data.in_match) return;
            if (global_active_view === "menu") {
                open_screen("custom");
                global_history.remove_page("play_rogue")
            } else {
                engine.call("show_menu_screen", "custom")
            }
        }));
        Lobby.add_leave_listener((() => {
            if (global_menu_page == "custom") this.leave_action();
            this.hide_loading_overlay();
            this.update_if_state_change(true);
            this.reset_locks()
        }));
        Lobby.add_update_listener((changed => {
            this.update_if_state_change(changed)
        }));
        Lobby.add_match_requested_listener((() => {
            let btn = _id("custom_game_button_start");
            btn.classList.add("locked");
            let overlay = btn.querySelector(".overlay");
            overlay.classList.add("visible")
        }));
        Lobby.add_match_confirmed_listener((() => {
            this.hide_loading_overlay()
        }));
        Lobby.add_match_error_listener((() => {
            this.hide_loading_overlay()
        }));
        Lobby.add_start_error_listener((data => {
            queue_dialog_msg({
                title: localize("title_info"),
                msg: localize(data.msg) + (data.blocking_users ? " " + data.blocking_users.join(", ") : "")
            })
        }));
        Lobby.add_host_change_listener(((became_host, lost_host) => {
            if (became_host) {
                _id("custom_game_button_start").style.display = "flex";
                _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting .select-field", (el => {
                    this.remove_lock(el, "host")
                }));
                _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting input", (el => {
                    this.remove_lock(el, "host")
                }));
                this.remove_lock(elements.commands, "host");
                _id("custom_game_password_set").querySelector(".edit_password").style.display = "block";
                if (this.preset.loaded) this.lock_preset_settings();
                this.update_datacenters(state.datacenter_list, false)
            }
            if (lost_host) {
                _id("custom_game_button_start").style.display = "none";
                _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting .select-field", (el => {
                    this.add_lock(el, "host")
                }));
                _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting input", (el => {
                    this.add_lock(el, "host")
                }));
                this.add_lock(elements.commands, "host");
                _id("custom_game_password_set").querySelector(".edit_password").style.display = "none";
                let locs = [];
                for (let dc of state.datacenter_list) {
                    if (dc.official) locs.push(dc)
                }
                locs.push({
                    server: "direct",
                    region: "",
                    location: "",
                    public: false,
                    official: false,
                    detected: false
                });
                this.update_datacenters(locs, false)
            }
        }));
        Lobby.add_preset_listener(((id, title) => {
            if (id) {
                this.set_preset_active(id, title)
            } else {
                this.set_preset_inactive()
            }
        }));
        Lobby.add_match_changed_listener((match_avail => {
            if (match_avail) {
                html.join_button.classList.remove("hidden")
            } else {
                html.join_button.classList.add("hidden")
            }
        }));
        GAME.add_activate_callback((game_id => {
            this.init_modes();
            let max_team_count = 28;
            let max_team_size = 20;
            if (game_id === GAME.ids.ROGUE) {
                elements.private.closest(".custom_game_setting").classList.remove("hidden");
                elements.continuous.closest(".custom_game_setting").classList.remove("hidden");
                elements.auto_balance.closest(".custom_game_setting").classList.remove("hidden");
                elements.max_clients.closest(".custom_game_setting").classList.remove("hidden");
                elements.allow_map_voting.closest(".custom_game_setting").classList.remove("hidden");
                el_containers.name.classList.remove("hidden");
                el_containers.password.classList.remove("hidden")
            } else {
                elements.private.closest(".custom_game_setting").classList.add("hidden");
                elements.name.closest(".custom_game_setting").classList.add("hidden");
                elements.continuous.closest(".custom_game_setting").classList.add("hidden");
                elements.auto_balance.closest(".custom_game_setting").classList.add("hidden");
                elements.max_clients.closest(".custom_game_setting").classList.add("hidden");
                elements.allow_map_voting.closest(".custom_game_setting").classList.add("hidden");
                el_containers.name.classList.add("hidden");
                el_containers.password.classList.add("hidden");
                max_team_count = 32;
                max_team_size = 4
            }
            setSelectNumberOptions(elements.team_count, max_team_count, (() => {
                setup_select(elements.team_count, ((opt, field) => {
                    this.user_update("team_count", opt.dataset.value)
                }))
            }));
            setSelectNumberOptions(elements.team_size, max_team_size, (() => {
                setup_select(elements.team_size, ((opt, field) => {
                    this.user_update("team_size", opt.dataset.value)
                }))
            }))
        }));

        function setSelectNumberOptions(el, max_value, cb) {
            let fragment = new DocumentFragment;
            for (let i = 1; i <= max_value; i++) {
                let opt = _createElement("div");
                opt.dataset.value = i;
                opt.textContent = i;
                fragment.appendChild(opt)
            }
            _empty(el);
            el.appendChild(fragment);
            if (typeof cb === "function") {
                cb()
            }
        }
        on_game_modes_changed_handlers.push((() => {
            this.init_modes()
        }));
        bind_event("set_server_menu_content", (json_data => {
            try {
                state.datacenter_list = JSON.parse(json_data);
                this.update_datacenters(state.datacenter_list, true)
            } catch (e) {
                console.log("Error parsing server menue json_data", e.message)
            }
        }));
        dropElement(html.spectators, ((ev, clone) => {
            engine.call("ui_sound", "ui_drop1");
            let from = {};
            if (parseInt(clone.dataset.type) === SPECTATING_TEAM) {
                from = {
                    team: SPECTATING_TEAM,
                    slot: parseInt(clone.dataset.slot)
                }
            } else {
                from = this.idx_to_team_slot(parseInt(clone.dataset.slot), Lobby.get_setting("team_size"))
            }
            Lobby.swap_player_slot(from, {
                team: SPECTATING_TEAM,
                slot: 0
            })
        }));
        on_press_esc_handlers.push((() => {
            if (global_menu_page === "custom" && tab_map.current_tab === "custom_screen_settings_tab" && !is_modal_open) {
                let first_sub_menu_option = html.root.querySelector(".sub_screen_menu_option");
                Navigation.select_element("custom_screen_menu", first_sub_menu_option);
                return false
            }
        }));
        let settings = _id("custom_lobby_settings").querySelectorAll(".custom_game_setting");
        for (let el of settings) {
            el.addEventListener("mouseenter", (() => {
                if (updateSettingsExplanation(el, html.descriptions, "setting_title")) {
                    html.descriptions.style.display = "block"
                } else {
                    html.descriptions.style.display = "none"
                }
            }));
            el.addEventListener("mouseleave", (() => {
                html.descriptions.style.display = "none"
            }))
        }
        global_variable.addPermanentResponseHandler("custom_component", "lobby_show_commands", (value => {
            if (parseInt(value)) {
                html.commands.style.display = "flex"
            } else {
                html.commands.style.display = "none"
            }
        }));
        initialize_variable("custom", "lobby_show_commands")
    }, this.set_lobby_colors = () => {
        let team_size = Lobby.get_setting("team_size");
        let team_count = Lobby.get_setting("team_count");
        if (team_size === 1 && team_count > 2 || team_count === 1) {
            html.team_0.style.setProperty("--team_color", "#" + get_own_colors().color);
            html.team_1.style.setProperty("--team_color", "#" + get_own_colors().color)
        } else {
            if (Lobby.state.own_team === 0 || Lobby.state.own_team === 255) {
                html.team_0.style.setProperty("--team_color", "#" + get_own_colors().color);
                html.team_1.style.setProperty("--team_color", "#" + get_enemy_colors().color)
            } else {
                html.team_0.style.setProperty("--team_color", "#" + get_enemy_colors().color);
                html.team_1.style.setProperty("--team_color", "#" + get_own_colors().color)
            }
        }
    };
    this.set_team_player_counts = () => {
        for (let team_idx in html.team_counts) {
            let string = "";
            if (team_idx in Lobby.state.teams) {
                let count = 0;
                for (let c of Lobby.state.teams[team_idx]) {
                    if (c) count++
                }
                string += count
            } else {
                string += "0"
            }
            if (parseInt(team_idx) !== SPECTATING_TEAM) {
                string += "/" + Lobby.get_setting("team_size")
            }
            html.team_counts[team_idx].textContent = "(" + string + ")"
        }
    };
    this.on_open = () => {
        Navigation.set_active({
            lb_rb: "custom_screen_menu"
        });
        Navigation.reset("lb_rb");
        let actions = [];
        actions.push({
            text: localize("custom_game_settings_copy_key"),
            kbm_bind: "C",
            controller_bind: "A",
            callback: () => {
                this.copy_join_key()
            }
        });
        if (page_game_report) {
            let last_match = page_game_report.get_last_match();
            if (last_match) {
                actions.push({
                    text: "Last Match",
                    kbm_bind: "M",
                    controller_bind: "X",
                    callback: () => {
                        if (!page_game_report.is_active()) {
                            page_game_report.load_last_match()
                        }
                        trigger_show_game_report(true);
                        close_menu()
                    }
                })
            }
        }
        actions.push({
            i18n: "menu_button_back",
            kbm_bind: "ESC",
            controller_bind: "B",
            callback: () => {
                if (tab_map.current_tab === "custom_screen_settings_tab") {
                    let first_sub_menu_option = html.root.querySelector(".sub_screen_menu_option");
                    Navigation.select_element("custom_screen_menu", first_sub_menu_option)
                } else {
                    historyBack()
                }
            }
        });
        Navigation.render_actions(actions, html.screen_actions)
    };
    this.user_update = (setting, value) => {
        Lobby.user_update(setting, value);
        this.on_setting_changed(setting, Lobby.get_setting(setting));
        if (setting === "team_size" || setting === "team_count") {
            this.initialize_lobby_slots(Lobby.get_setting("team_size"), Lobby.get_setting("team_count"))
        }
    };
    this.on_setting_changed = (setting, value) => {
        if (setting === "map_list") {
            _empty(elements.map_list);
            elements.map_list.style.display = "none";
            if (typeof value !== "object" || value.length === 0) {
                this.render_map_list(["", "", 0], 0)
            } else {
                value.forEach(((map, idx) => this.render_map_list(map, idx)))
            }
        }
        if (setting === "mode") {
            html.current_mode_selection.textContent = Lobby.get_setting("mode_name");
            const multi_team_modes = GAME.get_data("CUSTOM_MULTI_TEAM_MODES");
            const solo_modes = GAME.get_data("CUSTOM_SOLO_MODES");
            const round_modes = GAME.get_data("CUSTOM_ROUND_BASED_MODES");
            const tl_modes = GAME.get_data("CUSTOM_TIMELIMIT_ONLY_MODES");
            const br_modes = GAME.get_data("CUSTOM_BR_MODES");
            if (multi_team_modes && multi_team_modes.includes(value)) {
                el_containers.team_count.style.display = "flex"
            } else {
                el_containers.team_count.style.display = "none"
            }
            if (solo_modes && solo_modes.includes(value)) {
                el_containers.team_size.style.display = "none"
            } else {
                el_containers.team_size.style.display = "flex"
            }
            if (br_modes && br_modes.includes(value)) {
                el_containers.score_limit.style.display = "none";
                el_containers.time_limit.style.display = "none";
                this.user_update("score_limit", 1);
                this.user_update("time_limit", 0)
            } else {
                el_containers.score_limit.style.display = "flex";
                el_containers.time_limit.style.display = "flex";
                const round_limits = GAME.get_data("CUSTOM_ROUND_LIMITS");
                const capture_limits = GAME.get_data("CUSTOM_CAPTURE_LIMITS");
                if (round_modes && round_modes.includes(value) && round_limits) {
                    el_containers.time_limit.style.display = "none";
                    el_containers.score_limit.querySelector(".setting_title").textContent = localize("custom_game_settings_round_limit");
                    this.update_score_limit_options(round_limits)
                } else {
                    el_containers.time_limit.style.display = "flex";
                    if (value === "ctf" && capture_limits) {
                        el_containers.score_limit.querySelector(".setting_title").textContent = localize("custom_game_settings_capture_limit");
                        this.update_score_limit_options(capture_limits)
                    } else {
                        el_containers.score_limit.querySelector(".setting_title").textContent = localize("custom_game_settings_score_limit");
                        this.update_score_limit_options(CUSTOM_DEFAULT_SCORE_LIMITS)
                    }
                }
            }
            if (GAME.active === GAME.ids.ROGUE) {
                if (tl_modes && tl_modes.includes(value)) {
                    el_containers.score_limit.style.display = "none"
                } else {
                    el_containers.score_limit.style.display = "flex"
                }
            }
            const coop_modes = GAME.get_data("CUSTOM_SPECIAL_COOP_MODES");
            if (coop_modes && coop_modes.includes(value)) {
                el_containers.team_count.style.display = "none";
                el_containers.time_limit.style.display = "none";
                el_containers.score_limit.style.display = "none"
            }
        } else if (GAME.active === GAME.ids.ROGUE && setting === "private") {
            if (typeof value === "string") value = value === "true" ? true : false;
            else if (typeof value === "number") value = value ? true : false;
            if (value) {
                el_containers.name.classList.add("hidden");
                el_containers.password.classList.add("hidden");
                this.remove_lock(elements.continuous, "private");
                this.remove_lock(elements.team_switching, "private")
            } else {
                el_containers.name.classList.remove("hidden");
                el_containers.password.classList.remove("hidden");
                this.add_lock(elements.continuous, "private");
                this.add_lock(elements.team_switching, "private")
            }
        } else if (GAME.active === GAME.ids.ROGUE && setting === "continuous") {
            if (Number(value)) {
                this.remove_lock(elements.auto_balance, "continuous")
            } else {
                this.add_lock(elements.auto_balance, "continuous")
            }
        } else if (GAME.active === GAME.ids.ROGUE && setting === "password") {
            if (value) {
                _id("custom_game_password_set").querySelector(".password_icon").classList.add("locked")
            } else {
                _id("custom_game_password_set").querySelector(".password_icon").classList.remove("locked")
            }
        }
        if (state.quick_info_settings.includes(setting)) {
            this.render_quick_info_settings()
        }
    };
    this.render_quick_info_settings = () => {
        _empty(html.quick_info_settings);
        for (let setting of state.quick_info_settings) {
            let value = "";
            if (setting === "private") {
                if (Lobby.get_setting(setting)) {
                    value = localize("game_visibility_private")
                } else {
                    value = localize("game_visibility_public")
                }
            } else if (setting === "mode") {
                const mode_data = GAME.get_data("game_mode_map", Lobby.get_setting(setting));
                if (mode_data) {
                    value = localize(mode_data.i18n)
                }
            } else if (setting === "datacenter") {
                if (GAME.get_data("lobby_location_selection_type") > 1) {
                    value = Lobby.get_setting(setting)
                } else {
                    value = locations_to_string([Lobby.get_setting(setting)])
                }
            }
            let div = _createElement("div", "setting");
            let icon = _createElement("div", ["icon", setting]);
            let label = _createElement("div", "label", value);
            div.appendChild(icon);
            div.appendChild(label);
            html.quick_info_settings.appendChild(div)
        }
    };
    this.render_map_list = (map, idx) => {
        const [map_id, map_name, is_community] = map;
        if (idx === 0) {
            this.render_big_map_preview(map_id, map_name);
            return
        }
        if (GAME.active === GAME.ids.ROGUE) {
            const $map = _createElement("div", "map");
            let background = _createElement("div", ["map_preview_background"]);
            if (is_community) background.textContent = localize("map_community_preview");
            let background_image = _createElement("div", ["map_preview_background_image"]);
            background_image.style.backgroundImage = "url('map-thumbnail://" + map_id + "')";
            background.appendChild(background_image);
            $map.appendChild(background);
            $map.appendChild(_createElement("div", "name", _format_map_name(map_id, map_name)));
            elements.map_list.appendChild($map);
            elements.map_list.style.display = "flex"
        }
        refreshScrollbar(html.settings_scroll)
    };
    this.render_big_map_preview = (map_id, map_name) => {
        for (let i = 0; i < elements.map.length; i++) {
            let el = elements.map[i];
            _empty(el);
            let background = _createElement("div", ["map_preview_background"]);
            let background_image = _createElement("div", ["map_preview_background_image"]);
            background_image.style.backgroundImage = "url('map-thumbnail://" + map_id + "')";
            background.appendChild(background_image);
            el.appendChild(background);
            if (map_id) el.appendChild(_createElement("div", "name", _format_map_name(map_id, map_name)));
            else el.appendChild(_createElement("div", "name", localize("lobby_no_map_selected")))
        }
        refreshScrollbar(html.settings_scroll)
    };
    this.render_teams = teams => {
        for (let slot of state.spec_slots) {
            if (slot && slot.parentNode) {
                slot.parentNode.removeChild(slot);
                slot.dataset.inDOM = "0"
            }
        }
        let is_it_me = false;
        for (let t = 0; t < state.ui_max_teams; t++) {
            for (let i = 0; i < state.ui_render_team_player_slots; i++) {
                if (!teams.hasOwnProperty(t) || teams[t][i] == undefined) {
                    this.set_slot_empty(t, i)
                } else {
                    is_it_me = false;
                    if (global_self.user_id === teams[t][i].user_id) is_it_me = true;
                    this.set_slot_player(t, i, is_it_me, teams[t][i])
                }
            }
        }
        if (teams.hasOwnProperty(SPECTATING_TEAM)) {
            let length = teams[SPECTATING_TEAM].length;
            if (length < state.ui_render_team_player_slots) {
                length = state.ui_render_team_player_slots
            }
            for (let i = 0; i < length; i++) {
                if (teams[SPECTATING_TEAM][i] == undefined) {
                    this.set_slot_empty(SPECTATING_TEAM, i)
                } else {
                    is_it_me = false;
                    if (global_self.user_id === teams[SPECTATING_TEAM][i].user_id) {
                        is_it_me = true
                    }
                    this.set_slot_player(SPECTATING_TEAM, i, is_it_me, teams[SPECTATING_TEAM][i])
                }
            }
        }
        if (html.spectators_scroll) refreshScrollbar(html.spectators_scroll)
    };
    this.update_score_limit_options = options => {
        _empty(elements.score_limit);
        let current_value = Lobby.get_setting("score_limit");
        let score_limit_changed = false;
        if (!options.includes(Number(current_value))) {
            elements.score_limit.dataset.value = options[0];
            score_limit_changed = true
        }
        for (let limit of options) {
            let opt = _createElement("div");
            opt.dataset.value = limit;
            if (limit == 0) {
                opt.textContent = localize("score_unlimited")
            } else {
                opt.textContent = limit
            }
            if (limit == current_value) {
                opt.dataset.selected = 1
            }
            elements.score_limit.appendChild(opt)
        }
        setup_select(elements.score_limit, ((opt, field) => {
            this.user_update("score_limit", opt.dataset.value)
        }));
        if (score_limit_changed) {
            update_select(elements.score_limit);
            this.user_update("score_limit", elements.score_limit.dataset.value)
        }
    };
    this.set_slot_empty = (team, slot) => {
        let slot_elem = undefined;
        if (team === SPECTATING_TEAM) {
            slot_elem = this.get_spec_slot(slot);
            slot_elem.classList.add("empty_slot");
            _for_first_with_class_in_parent(slot_elem, "slot_content", (function(sc) {
                _empty(sc);
                let icon = _createElement("div", ["slot_avatar", "empty"]);
                let label = _createElement("div", "slot_name", localize("empty_slot"));
                sc.appendChild(icon);
                sc.appendChild(label)
            }))
        } else if (team >= 0) {
            let slot_idx = this.team_slot_to_idx(team, slot, Lobby.get_setting("team_size"), Lobby.get_setting("team_count"));
            slot_elem = this.get_player_slot(slot_idx);
            _for_first_with_class_in_parent(slot_elem, "slot_content", (function(sc) {
                _empty(sc);
                let icon = _createElement("div", ["slot_avatar", "empty"]);
                let label = _createElement("div", "slot_name", localize("empty_slot"));
                sc.appendChild(icon);
                sc.appendChild(label)
            }));
            slot_elem.classList.add("empty_slot")
        }
        if (slot_elem == undefined) return;
        slot_elem.classList.remove("player_slot");
        dragElementRemove(slot_elem);
        slot_elem.removeEventListener("mousedown", customPlayerContextMenu);
        slot_elem.contextOptions = [];
        slot_elem.classList.remove("action");
        slot_elem.contextOptions.push({
            type: "stored",
            text: localize("invite_lobby"),
            callback: () => {
                open_screen("friends_panel")
            }
        });
        slot_elem.classList.add("action");
        slot_elem.addEventListener("mousedown", customPlayerContextMenu)
    };
    this.set_slot_player = (team, slot, is_it_me, user) => {
        let slot_elem = undefined;
        if (team >= 0) {
            let slot_idx = this.team_slot_to_idx(team, slot, Lobby.get_setting("team_size"), Lobby.get_setting("team_count"));
            if (team == SPECTATING_TEAM) {
                slot_elem = this.get_spec_slot(slot_idx)
            } else {
                slot_elem = this.get_player_slot(slot_idx)
            }
            _for_first_with_class_in_parent(slot_elem, "slot_content", (function(sc) {
                _empty(sc);
                let avatar = _createElement("div", "slot_avatar");
                set_store_avatar(user.user_id === global_self.user_id, avatar, user.client_user_id, user.client_source);
                let name = _createElement("div", "slot_name", user.name);
                sc.appendChild(avatar);
                sc.appendChild(name);
                if (user.host) {
                    sc.appendChild(_createElement("span", ["slot_avatar_privilege", "host"]))
                }
                if (Lobby.state.admins.includes(user.user_id)) {
                    sc.appendChild(_createElement("span", ["slot_avatar_privilege", "admin"], localize("lobby_admin")))
                }
            }));
            slot_elem.classList.add("player_slot");
            slot_elem.classList.remove("empty_slot")
        }
        if (slot_elem == undefined) return;
        dragElementRemove(slot_elem);
        slot_elem.removeEventListener("mousedown", customPlayerContextMenu);
        slot_elem.contextOptions = [];
        slot_elem.classList.remove("action");
        slot_elem.contextOptions.push({
            type: "friend",
            user_id: user.user_id
        });
        if (Lobby.state.host) {
            dragElement(slot_elem, null, onMouseDown = () => {
                if (currentlyDraggedElement) {
                    currentlyDraggedElement.classList.add("drag");
                    let check_value = Lobby.get_setting("team_size");
                    let extra_small_after = state.ui_extra_small_size_after_team_size;
                    let small_after = state.ui_small_size_after_team_size;
                    if (Lobby.get_setting("team_count") === 1) {
                        check_value = Lobby.get_setting("team_size");
                        extra_small_after = state.ui_extra_small_size_after_team_size * 2;
                        small_after = state.ui_small_size_after_team_size * 2
                    } else if (Lobby.get_setting("team_size") === 1 && Lobby.get_setting("team_count") > 2) {
                        check_value = Lobby.get_setting("team_count");
                        extra_small_after = state.ui_extra_small_size_after_team_size * 2;
                        small_after = state.ui_small_size_after_team_size * 2
                    }
                    if (check_value > extra_small_after) {
                        currentlyDraggedElement.classList.add("extra_small")
                    } else if (check_value > small_after) {
                        currentlyDraggedElement.classList.add("small")
                    }
                }
            });
            if (!is_it_me) {
                slot_elem.user_id = user.user_id;
                slot_elem.contextOptions.push({
                    type: "stored",
                    text: localize("custom_game_make_host"),
                    callback: () => {
                        Lobby.make_player_host(user.user_id)
                    }
                });
                if (Lobby.state.admins.includes(user.user_id)) {
                    slot_elem.contextOptions.push({
                        type: "stored",
                        text: localize("custom_game_revoke_admin"),
                        callback: () => {
                            Lobby.revoke_admin(user.user_id)
                        }
                    })
                } else {
                    slot_elem.contextOptions.push({
                        type: "stored",
                        text: localize("custom_game_make_admin"),
                        callback: () => {
                            Lobby.make_player_admin(user.user_id)
                        }
                    })
                }
                slot_elem.contextOptions.push({
                    type: "stored",
                    text: localize("custom_game_remove_player"),
                    callback: () => {
                        Lobby.remove_player(user.user_id)
                    }
                })
            }
        }
        slot_elem.classList.add("action");
        slot_elem.addEventListener("mousedown", customPlayerContextMenu)
    };
    this.get_spec_slot = i => {
        if (!state.spec_slots[i]) {
            state.spec_slots[i] = _createElement("div", "slot");
            state.spec_slots[i].dataset.slot = i;
            state.spec_slots[i].dataset.type = SPECTATING_TEAM;
            state.spec_slots[i].dataset.inDOM = "1";
            state.spec_slots[i].appendChild(_createElement("div", "slot_content"));
            html.spectators.appendChild(state.spec_slots[i])
        } else {
            if (state.spec_slots[i].dataset.inDOM === "0") {
                html.spectators.appendChild(state.spec_slots[i])
            }
        }
        return state.spec_slots[i]
    };
    this.get_locked_slot = () => {
        let locked_slot = _createElement("div", ["slot", "locked_slot"]);
        let slot_content = _createElement("div", "slot_content");
        let icon = _createElement("div", ["slot_avatar", "locked"]);
        let label = _createElement("div", "slot_name", localize("locked_slot"));
        slot_content.appendChild(icon);
        slot_content.appendChild(label);
        locked_slot.appendChild(slot_content);
        return locked_slot
    };
    this.get_player_slot = i => {
        if (!state.player_slots[i]) {
            state.player_slots[i] = _createElement("div", ["slot"]);
            state.player_slots[i].dataset.slot = i;
            state.player_slots[i].dataset.type = 0;
            state.player_slots[i].appendChild(_createElement("div", "slot_content"));
            dropElement(state.player_slots[i], ((ev, clone) => {
                engine.call("ui_sound", "ui_drop1");
                let max_slots = parseInt(Lobby.get_setting("team_size"));
                let from = {};
                let to = this.idx_to_team_slot(i, max_slots);
                if (parseInt(clone.dataset.type) === SPECTATING_TEAM) {
                    from = {
                        team: SPECTATING_TEAM,
                        slot: parseInt(clone.dataset.slot)
                    }
                } else if (parseInt(clone.dataset.type) === 0) {
                    from = this.idx_to_team_slot(parseInt(clone.dataset.slot), max_slots)
                }
                Lobby.swap_player_slot(from, to)
            }))
        }
        return state.player_slots[i]
    };
    this.idx_to_team_slot = (slot_idx, max_slots) => {
        let team_idx = Math.floor(slot_idx / max_slots);
        let team_slot_idx = slot_idx - team_idx * max_slots;
        return {
            team: team_idx,
            slot: team_slot_idx
        }
    };
    this.team_slot_to_idx = (team, slot, team_size, team_count) => {
        if (team == SPECTATING_TEAM) return slot;
        if (team_count === 1) {
            return team * state.ui_render_team_player_slots + slot
        }
        return team * team_size + slot
    };
    this.init_modes = () => {};
    this.leave_action = () => {
        if (global_menu_page === "custom") {
            if (GAME.active === GAME.ids.ROGUE) {
                open_screen("play_rogue");
                global_history.remove_page("custom")
            } else {
                historyBack()
            }
        }
    };
    this.open_map_selection = () => {
        if (!Lobby.state.host) return;
        if (GAME.active === GAME.ids.ROGUE) {
            map_selection_modal.open("multi_select", Lobby.get_setting("mode"), Lobby.get_setting("map_list"), (map_list => {
                this.user_update("map_list", map_list)
            }))
        } else if (GAME.active === GAME.ids.INVASION) {
            map_selection_modal.open("single_select", Lobby.get_setting("mode"), null, (map => {
                this.user_update("map_list", [map])
            }))
        }
    };
    this.open_mode_selection = () => {
        if (!Lobby.state.host) return;
        mode_selection_modal.open(Lobby.get_setting("mode"), (mode => {
            if (mode) {
                this.user_update("mode_name", mode[1]);
                this.user_update("mode", mode[0])
            } else {
                this.user_update("mode_name", "");
                this.user_update("mode", "")
            }
        }))
    };
    this.hide_loading_overlay = () => {
        let btn = _id("custom_game_button_start");
        let overlay = btn.querySelector(".overlay");
        setTimeout((function() {
            btn.classList.remove("locked");
            overlay.classList.remove("visible")
        }), 1e3)
    };
    this.copy_join_key = () => {
        engine.call("copy_text", state.join_key)
    };
    this.password_edit = () => {
        if (!Lobby.state.host) return;
        let input = _id("custom_game_setting_password");
        input.value = "";
        input.style.display = "flex";
        input.focus();
        _id("custom_game_password_set").style.display = "none"
    };
    this.password_on_blur = e => {
        e.preventDefault();
        if (!Lobby.state.host) return;
        Lobby.set_password(e.currentTarget.value);
        _id("custom_game_setting_password").style.display = "none";
        _id("custom_game_password_set").style.display = "flex"
    };
    this.password_keydown = e => {
        if (e.keyCode == 13) {
            e.currentTarget.blur()
        }
    };
    this.update_if_state_change = lobby_changed => {};
    this.update_datacenters = (list, init) => {
        let current_value = Lobby.get_setting("datacenter");
        let set_value = null;
        let fragment = new DocumentFragment;
        if (GAME.get_data("lobby_location_selection_type") > 1) {
            list.sort((function(a, b) {
                if (!a.official) return 1;
                if (!b.official) return -1;
                return a.region == b.region ? a.official == b.official ? 1 : -1 : a.region > b.region ? 1 : -1
            }));
            let regions = new Set;
            for (let dc of list) {
                let name = "";
                let value = "";
                if (dc.official) {
                    if (regions.has(dc.region)) continue;
                    regions.add(dc.region);
                    name = dc.region;
                    if (dc.region.toLowerCase() in global_region_map) {
                        name = localize(global_region_map[dc.region.toLowerCase()].i18n)
                    }
                    value = dc.region.toLowerCase()
                } else {
                    if (dc.server != "direct") {
                        name = "Direct/" + (dc["public"] ? "Public IP" : _partial_anonymize(dc.server)) + " (UDP 32123)";
                        value = "ip_" + dc.server
                    } else {
                        name = "Direct";
                        value = "direct"
                    }
                }
                let opt = _createElement("div", "", name);
                opt.dataset.value = value.toLowerCase();
                if (current_value === value) set_value = value;
                fragment.appendChild(opt)
            }
        } else {
            list.sort((function(a, b) {
                if (!a.official) return 1;
                if (!b.official) return -1;
                return a.region == b.region ? a.location == b.location ? a.server == b.server ? 1 : -1 : -1 : a.region > b.region ? 1 : -1
            }));
            for (let dc of list) {
                if (dc.official && dc.region.length == 0 && dc.location.length == 0) continue;
                let name = "";
                let value = "";
                if (dc.official) {
                    let region = dc.region;
                    if (dc.region.toLowerCase() in global_region_map) {
                        region = localize(global_region_map[dc.region.toLowerCase()].i18n)
                    }
                    name = region + "/" + localize("datacenter_" + dc.server);
                    value = dc.server
                } else {
                    if (dc.server != "direct") {
                        name = "Direct/" + (dc["public"] ? "Public IP" : _partial_anonymize(dc.server)) + " (UDP 32123)";
                        value = "ip_" + dc.server
                    } else {
                        name = "Direct";
                        value = "direct"
                    }
                }
                if (current_value === value) set_value = value;
                let opt = _createElement("div", "", name);
                opt.dataset.value = value;
                fragment.appendChild(opt)
            }
        }
        if (!set_value) {
            let opt = _createElement("div", "none", "No Datacenter selected");
            opt.dataset.value = "";
            fragment.insertBefore(opt, fragment.firstChild)
        }
        _empty(elements.datacenter);
        elements.datacenter.appendChild(fragment);
        setup_select(elements.datacenter, ((opt, field) => {
            this.user_update("datacenter", opt.dataset.value)
        }));
        if (set_value) {
            elements.datacenter.dataset.value = set_value;
            update_select(elements.datacenter)
        }
    };
    this.start_game = btn => {
        if (btn.classList.contains("locked")) return;
        Lobby.start_game()
    };
    this.join_game = btn => {
        if (btn.classList.contains("locked")) return;
        btn.classList.add("locked");
        let overlay = btn.querySelector(".overlay");
        overlay.classList.add("visible");
        Lobby.join_game();
        setTimeout((() => {
            btn.classList.remove("locked");
            overlay.classList.remove("visible")
        }), 3e3)
    };
    this.leave_lobby = () => {
        if (bool_am_i_leader) {
            send_json_data({
                action: "lobby-leave"
            })
        } else {
            genericModal(localize("modal_leave_lobby_and_party_title"), localize("modal_leave_lobby_and_party_text"), localize("menu_button_cancel"), undefined, localize("menu_button_confirm"), (function() {
                send_json_data({
                    action: "lobby-leave"
                })
            }))
        }
    };
    this.lock_preset_settings = () => {};
    this.unlock_preset_settings = () => {};
    this.set_preset_active = (id, title) => {};
    this.set_preset_inactive = () => {};
    this.add_lock = (el, name) => {
        if (!el.hasOwnProperty("locks")) el.locks = [];
        if (!el.locks.includes(name)) el.locks.push(name);
        if (el.locks.length) {
            if (el.classList.contains("select-field")) el.classList.add("disabled");
            else if (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") _disableInput(el)
        }
    };
    this.remove_lock = (el, name) => {
        if (!el.hasOwnProperty("locks")) el.locks = [];
        let idx = el.locks.indexOf(name);
        if (idx >= 0) el.locks.splice(idx, 1);
        if (el.locks.length) {
            if (el.classList.contains("select-field")) el.classList.add("disabled");
            else if (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") _disableInput(el)
        } else {
            if (el.classList.contains("select-field")) el.classList.remove("disabled");
            else if (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") _enableInput(el)
        }
    };
    this.remove_locks = el => {
        if (el.hasOwnProperty("locks") && el.locks.length) {
            el.locks.length = 0;
            if (el.classList.contains("select-field")) el.classList.remove("disabled");
            else if (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") _enableInput(el)
        }
    };
    this.reset_locks = () => {
        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting .select-field", (el => {
            this.remove_locks(el)
        }));
        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting input", (el => {
            this.remove_locks(el)
        }));
        this.remove_locks(elements.commands)
    };
    this.select_class = () => {
        open_screen("class_select", {
            selected_class: state.class,
            select_callback: new_class => {
                send_json_data({
                    action: "lobby-set-user-data",
                    class: new_class
                })
            }
        })
    };
    this.initialize_lobby_slots = (team_size, team_count) => {
        for (let idx in html.team_players) {
            while (html.team_players[idx].hasChildNodes()) {
                html.team_players[idx].removeChild(html.team_players[idx].lastChild)
            }
        }
        let check_value = team_size;
        let extra_small_after = state.ui_extra_small_size_after_team_size;
        let small_after = state.ui_small_size_after_team_size;
        if (team_count === 1) {
            check_value = team_size;
            extra_small_after = state.ui_extra_small_size_after_team_size * 2;
            small_after = state.ui_small_size_after_team_size * 2
        } else if (team_size === 1 && team_count > 2) {
            check_value = team_count;
            extra_small_after = state.ui_extra_small_size_after_team_size * 2;
            small_after = state.ui_small_size_after_team_size * 2
        }
        if (check_value > extra_small_after) {
            html.lobby.classList.add("extra_small");
            html.lobby.classList.remove("small")
        } else if (check_value > small_after) {
            html.lobby.classList.add("small");
            html.lobby.classList.remove("extra_small")
        } else {
            html.lobby.classList.remove("small");
            html.lobby.classList.remove("extra_small")
        }
        state.ui_render_team_player_slots = state.ui_min_players_per_team;
        let total_player_slots = team_size * team_count;
        if (team_count === 1 || team_count > 2 && team_size === 1) {
            state.ui_render_team_player_slots = Math.ceil(total_player_slots / state.ui_max_teams);
            if (state.ui_render_team_player_slots < 6) state.ui_render_team_player_slots = 6;
            let slot_idx = 0;
            for (let team_idx = 0; team_idx < state.ui_max_teams; team_idx++) {
                for (let team_slot_idx = 0; team_slot_idx < state.ui_render_team_player_slots; team_slot_idx++) {
                    if (slot_idx < total_player_slots) {
                        html.team_players[team_idx].appendChild(this.get_player_slot(slot_idx));
                        slot_idx++
                    } else {
                        html.team_players[team_idx].appendChild(this.get_locked_slot())
                    }
                }
            }
            for (let team_idx in html.team_head) {
                html.team_head[team_idx].textContent = "Players"
            }
            for (let team_idx in html.team_counts) {
                html.team_counts[team_idx].style.display = "none"
            }
        } else if (team_count === 2) {
            if (team_size > state.ui_render_team_player_slots) state.ui_render_team_player_slots = team_size;
            let slot_idx = 0;
            for (let team_idx = 0; team_idx < state.ui_max_teams; team_idx++) {
                for (let team_slot_idx = 0; team_slot_idx < state.ui_render_team_player_slots; team_slot_idx++) {
                    if (team_slot_idx < team_size) {
                        html.team_players[team_idx].appendChild(this.get_player_slot(slot_idx));
                        slot_idx++
                    } else {
                        html.team_players[team_idx].appendChild(this.get_locked_slot())
                    }
                }
            }
            for (let team_idx in html.team_head) {
                if (team_size === 1) {
                    html.team_head[team_idx].textContent = localize_ext("player_with_idx", {
                        value: parseInt(team_idx) + 1
                    })
                } else {
                    html.team_head[team_idx].textContent = localize_ext("team_with_idx", {
                        value: parseInt(team_idx) + 1
                    })
                }
            }
            for (let team_idx in html.team_counts) {
                html.team_counts[team_idx].style.display = "flex"
            }
        } else {}
        html.lobby.style.setProperty("--ui_max_players_per_team", "" + state.ui_render_team_player_slots)
    }
};

function lobby_join_with_key() {
    let cont = _createElement("div", "custom_password_prompt");
    let input = _createElement("input", "custom_password_prompt_input");
    input.setAttribute("type", "password");
    cont.appendChild(input);
    setTimeout((() => {
        input.focus()
    }));
    let toggle = _createElement("div", "toggle_visibility");
    cont.appendChild(toggle);
    toggle.addEventListener("click", (() => {
        if (input.type === "password") {
            input.type = "text"
        } else {
            input.type = "password"
        }
    }));
    input.addEventListener("keydown", (function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            Lobby.join_lobby(input.value.trim());
            close_modal_screen_by_selector("generic_modal")
        }
    }));
    genericModal(localize("customlist_join_with_key"), cont, localize("menu_button_cancel"), null, localize("menu_button_join"), (function() {
        Lobby.join_lobby(input.value)
    }))
}

function customPlayerContextMenu(e) {
    if (e.button != 2) return;
    e.preventDefault();
    let options = [];
    for (let o of this.contextOptions) {
        if (o.type == "stored") {
            options.push(o)
        } else if (o.type == "friend") {
            if (Friends.state.all.hasOwnProperty(o.user_id) && Friends.state.all[o.user_id].friendship_state == 0) {
                options.push({
                    text: localize("friends_list_action_message"),
                    callback: () => {
                        main_chat_message_user(o.user_id, Friends.state.all[o.user_id].name)
                    }
                })
            } else {
                if (global_self.user_id !== o.user_id) {
                    options.push({
                        text: localize("friends_list_action_friend_request"),
                        callback: () => {
                            send_string(CLIENT_COMMAND_SEND_FRIEND_REQUEST, o.user_id)
                        }
                    })
                }
            }
        }
    }
    if (options.length) {
        context_menu(e, options)
    }
}

function custom_lobby_load_settings_list() {
    api_request("GET", "/user/lobby_settings", {}, (function(data) {
        page_custom.preset.list = {};
        if (data === null) return;
        if ("settings" in data) {
            for (let setting of data.settings) {
                page_custom.preset.list[setting.settings_index] = setting
            }
        }
    }))
}

function custom_lobby_save_settings_dialog() {
    let selected_index = null;
    let slots = [];
    let cont = _createElement("div", "hud_dialog");
    cont.appendChild(_createElement("div", "generic_modal_dialog_header", localize("lobby_save_settings")));
    let settings_list = _createElement("div", "hud_list");
    settings_list.appendChild(_createElement("div", "title", localize("lobby_select_slot")));
    let action_cont = _createElement("div", "generic_modal_dialog_action");
    let save_btn = _createElement("div", ["dialog_button", "positive", "locked"], localize("menu_button_save"));
    let close_btn = _createElement("div", ["dialog_button", "negative"], localize("menu_button_cancel"));
    action_cont.appendChild(save_btn);
    action_cont.appendChild(close_btn);
    close_btn.addEventListener("click", (function() {
        closeBasicModal()
    }));
    save_btn.addEventListener("click", (function() {
        if (selected_index == null) return;
        let title = slots[selected_index].input.value;
        if (!title.length) title = "Settings-" + (selected_index + 1);
        send_json_data({
            action: "lobby-save-settings",
            settings_index: selected_index,
            settings_title: title
        }, "lobby-settings-saved", (() => {
            custom_lobby_load_settings_list();
            closeBasicModal()
        }))
    }));
    for (let i = 0; i < page_custom.preset.slots; i++) {
        let title = localize("lobby_settings_slot_empty");
        let mode = "";
        let unused = true;
        if (i in page_custom.preset.list) {
            title = page_custom.preset.list[i].settings_title;
            const mode_data = GAME.get_data("game_mode_map", page_custom.preset.list[i].settings_mode);
            if (mode_data) {
                mode = localize(mode_data.i18n)
            }
            unused = false
        }
        if (title == null) title = "";
        let settings_slot = _createElement("div", "hud_slot");
        let settings_index = _createElement("div", "hud_index", i + 1);
        let settings_title = _createElement("div", "hud_title", title);
        let settings_title_input = _createElement("input", ["hud_title", "hud_title_input"]);
        settings_title_input.maxLength = 255;
        settings_title_input.type = "text";
        settings_title_input.value = title;
        let settings_mode = null;
        if (!unused) settings_mode = _createElement("div", "hud_desc", mode);
        let settings_id = _createElement("div", "hud_id");
        if (i in page_custom.preset.list) {
            settings_id.classList.add("has_id");
            settings_id.dataset.id = page_custom.preset.list[i].settings_id;
            settings_id.dataset.msgId = "lobby_copy_settings_id";
            add_tooltip2_listeners(settings_id)
        }
        settings_slot.appendChild(settings_index);
        settings_slot.appendChild(settings_title);
        settings_slot.appendChild(settings_title_input);
        if (settings_mode !== null) settings_slot.appendChild(settings_mode);
        settings_slot.appendChild(settings_id);
        settings_list.appendChild(settings_slot);
        settings_slot.addEventListener("click", (function() {
            if (settings_index.classList.contains("selected")) return;
            for (let slot of slots) {
                if (slot.index.classList.contains("selected")) slot.index.classList.remove("selected");
                slot.title.style.display = "block";
                slot.input.style.display = "none"
            }
            settings_title.style.display = "none";
            settings_index.classList.add("selected");
            if (unused) settings_title_input.value = "";
            else settings_title_input.value = title;
            settings_title_input.style.display = "block";
            settings_title_input.focus();
            settings_title_input.selectionStart = settings_title_input.selectionEnd = settings_title_input.value.length;
            selected_index = i;
            save_btn.classList.remove("locked")
        }));
        settings_id.addEventListener("click", (function(e) {
            e.stopPropagation();
            _play_click1();
            engine.call("copy_text", settings_id.dataset.id)
        }));
        slots.push({
            slot: settings_slot,
            index: settings_index,
            title: settings_title,
            input: settings_title_input
        })
    }
    cont.appendChild(settings_list);
    cont.appendChild(action_cont);
    openBasicModal(cont)
}

function custom_lobby_load_settings_dialog() {
    let selected_settings_id = null;
    let slots = [];
    let cont = _createElement("div", "hud_dialog");
    cont.appendChild(_createElement("div", "generic_modal_dialog_header", localize("lobby_load_settings")));
    let settings_list = _createElement("div", "hud_list");
    settings_list.appendChild(_createElement("div", "title", localize("lobby_settings_select")));
    let action_cont = _createElement("div", "generic_modal_dialog_action");
    let load_btn = _createElement("div", ["dialog_button", "positive", "locked"], localize("menu_button_load"));
    let close_btn = _createElement("div", ["dialog_button", "negative"], localize("menu_button_cancel"));
    action_cont.appendChild(load_btn);
    action_cont.appendChild(close_btn);
    let load_key_cont = _createElement("div", "load_key_cont");
    load_key_cont.appendChild(_createElement("div", "load_key_title", localize("lobby_load_settings_id_title")));
    let load_key_input = _createElement("input", "load_key_input");
    load_key_input.addEventListener("focus", (function() {
        for (let slot of slots) {
            if (slot.index.classList.contains("selected")) slot.index.classList.remove("selected")
        }
        selected_settings_id = null;
        load_btn.classList.add("locked")
    }));
    load_key_input.addEventListener("keyup", (function() {
        let val = load_key_input.value.trim();
        if (val.length) {
            load_btn.classList.remove("locked");
            selected_settings_id = val
        } else {
            load_btn.classList.add("locked");
            selected_settings_id = null
        }
    }));
    load_key_cont.appendChild(load_key_input);
    close_btn.addEventListener("click", (function() {
        closeBasicModal()
    }));
    load_btn.addEventListener("click", (function() {
        if (selected_settings_id == null) return;
        send_json_data({
            action: "lobby-load-settings",
            settings_id: selected_settings_id
        });
        closeBasicModal()
    }));
    let settings_count = 0;
    for (let i = 0; i < page_custom.preset.slots; i++) {
        let title = localize("lobby_settings_slot_empty");
        let mode = "";
        if (i in page_custom.preset.list) {
            title = page_custom.preset.list[i].settings_title;
            const mode_data = GAME.get_data("game_mode_map", page_custom.preset.list[i].settings_mode);
            if (mode_data) {
                mode = localize(mode_data.i18n)
            }
        } else {
            continue
        }
        settings_count++;
        if (title == null) title = "";
        let settings_slot = _createElement("div", "hud_slot");
        let settings_index = _createElement("div", "hud_index", i + 1);
        let settings_title = _createElement("div", "hud_title", title);
        settings_slot.appendChild(settings_index);
        settings_slot.appendChild(settings_title);
        settings_slot.appendChild(_createElement("div", "hud_desc", mode));
        let settings_id = _createElement("div", "hud_id");
        if (i in page_custom.preset.list) {
            settings_id.classList.add("has_id");
            settings_id.dataset.id = page_custom.preset.list[i].settings_id;
            settings_id.dataset.msgId = "lobby_copy_settings_id";
            add_tooltip2_listeners(settings_id)
        }
        settings_slot.appendChild(settings_id);
        settings_list.appendChild(settings_slot);
        settings_slot.addEventListener("click", (function() {
            if (settings_index.classList.contains("selected")) return;
            for (let slot of slots) {
                if (slot.index.classList.contains("selected")) slot.index.classList.remove("selected")
            }
            settings_index.classList.add("selected");
            selected_settings_id = page_custom.preset.list[i].settings_id;
            load_key_input.value = "";
            load_btn.classList.remove("locked")
        }));
        settings_id.addEventListener("click", (function(e) {
            e.stopPropagation();
            _play_click1();
            engine.call("copy_text", settings_id.dataset.id)
        }));
        slots.push({
            index: settings_index
        })
    }
    if (settings_count == 0) {
        settings_list.appendChild(_createElement("div", "no_huds", localize("lobby_no_settings_found")))
    }
    cont.appendChild(settings_list);
    cont.appendChild(load_key_cont);
    cont.appendChild(action_cont);
    openBasicModal(cont)
}

function custom_lobby_unlock_settings() {
    send_json_data({
        action: "lobby-unlock-settings"
    })
}