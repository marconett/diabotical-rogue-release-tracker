const Lobby = {
    state: {
        init: false,
        id: "",
        host: false,
        admins: [],
        teams: {},
        own_team: null,
        password: false,
        match: false,
        host_change_listeners: [],
        join_listeners: [],
        leave_listeners: [],
        updated_listeners: [],
        setting_updated_listeners: [],
        teams_updated: [],
        match_requested_listeners: [],
        match_confirmed_listeners: [],
        match_changed_listeners: [],
        match_error_listeners: [],
        start_error_listeners: [],
        preset_listeners: [],
        send_timeout: null
    },
    preset: {
        loaded: false,
        id: null
    },
    settings: {},
    client_var_map: {},
    client_var_reverse_map: {},
    add_host_change_listener: function(listener) {
        this.state.host_change_listeners.push(listener)
    },
    add_join_listener: function(listener) {
        this.state.join_listeners.push(listener)
    },
    add_leave_listener: function(listener) {
        this.state.leave_listeners.push(listener)
    },
    add_update_listener: function(listener) {
        this.state.updated_listeners.push(listener)
    },
    add_setting_updated_listener: function(listener) {
        this.state.setting_updated_listeners.push(listener)
    },
    add_teams_updated_listener: function(listener) {
        this.state.teams_updated.push(listener)
    },
    add_match_requested_listener: function(listener) {
        this.state.match_requested_listeners.push(listener)
    },
    add_match_confirmed_listener: function(listener) {
        this.state.match_confirmed_listeners.push(listener)
    },
    add_match_changed_listener: function(listener) {
        this.state.match_changed_listeners.push(listener)
    },
    add_match_error_listener: function(listener) {
        this.state.match_error_listeners.push(listener)
    },
    add_start_error_listener: function(listener) {
        this.state.start_error_listeners.push(listener)
    },
    add_preset_listener: function(listener) {
        this.state.preset_listeners.push(listener)
    },
    _exec_on_host_change: function(became_host, lost_host) {
        this._exec_listeners(this.state.host_change_listeners, [became_host, lost_host])
    },
    _exec_on_join: function() {
        this._exec_listeners(this.state.join_listeners, [])
    },
    _exec_on_leave: function() {
        this._exec_listeners(this.state.leave_listeners, [])
    },
    _exec_on_master_update: function(changed) {
        this._exec_listeners(this.state.updated_listeners, [changed])
    },
    _exec_on_setting_updated: function(setting, value) {
        this._exec_listeners(this.state.setting_updated_listeners, [setting, value])
    },
    _exec_on_teams_updated: function(teams) {
        this._exec_listeners(this.state.teams_updated, [teams])
    },
    _exec_on_match_requested: function() {
        this._exec_listeners(this.state.match_requested_listeners, [])
    },
    _exec_on_match_confirmed: function() {
        this._exec_listeners(this.state.match_confirmed_listeners, [])
    },
    _exec_on_match_changed: function(match_avail) {
        this._exec_listeners(this.state.match_changed_listeners, [match_avail])
    },
    _exec_on_match_error: function() {
        this._exec_listeners(this.state.match_error_listeners, [])
    },
    _exec_on_start_error: function(data) {
        this._exec_listeners(this.state.start_error_listeners, [data])
    },
    _exec_on_preset: function(id, title) {
        this._exec_listeners(this.state.preset_listeners, [id, title])
    },
    _exec_listeners: function(listeners, params) {
        for (let listener of listeners) {
            if (typeof listener !== "function") continue;
            listener(...params)
        }
    },
    init: function() {
        GAME.add_activate_callback((game_id => {
            const default_settings = GAME.get_data("LOBBY_SETTINGS_LIST");
            if (default_settings) {
                Lobby.settings = default_settings
            }
            const client_var_map = GAME.get_data("LOBBY_CLIENT_VAR_MAP");
            if (client_var_map) {
                Lobby.client_var_map = client_var_map
            }
            for (let variable in client_var_map) {
                Lobby.client_var_reverse_map[client_var_map[variable].name] = variable
            }
            this.reset_settings()
        }));
        Servers.on_locations_init_handlers.push((() => {
            this.refresh_datacenter(global_variable_value_store["lobby_custom_datacenter"])
        }));
        bind_event("set_masterserver_connection_state", ((connected, game_id) => {
            if (!connected) {
                if (this.in_lobby()) {
                    this.state.id = "";
                    this._exec_on_master_update(true)
                }
            }
        }))
    },
    event: function(data) {
        if (data.action == "lobby-status") this.master_update(data);
        else if (data.action == "lobby-gone") this.on_gone();
        else if (data.action == "lobby-leave") this.on_leave();
        else if (data.action == "lobby-match-requested") this.match_requested();
        else if (data.action == "lobby-match-confirmed") this.match_confirmed();
        else if (data.action == "lobby-match-error") this.match_error();
        else if (data.action == "lobby-start-error") this.start_error(data)
    },
    get_settings: function() {
        let s = {};
        for (let setting in this.settings) {
            s[setting] = this.settings[setting][1]
        }
        return s
    },
    get_setting: function(setting) {
        if (setting in this.settings) {
            return this.settings[setting][1]
        }
        return false
    },
    create: function() {
        if (!this.in_lobby() && bool_am_i_leader) {
            send_json_data({
                action: "lobby-create",
                settings: this.get_settings()
            })
        }
    },
    on_gone: function() {
        if (this.in_lobby()) {
            this.state.id = "";
            this.state.host = false;
            this._exec_on_leave();
            setTimeout((() => {
                this.reset_settings()
            }), 250)
        }
    },
    on_leave: function() {
        if (this.in_lobby()) {
            this.state.id = "";
            this.state.host = false;
            this._exec_on_leave();
            setTimeout((() => {
                this.reset_settings()
            }), 250)
        }
    },
    match_requested: function() {
        this._exec_on_match_requested()
    },
    match_confirmed: function() {
        engine.call("reset_inactivity_timer");
        this._exec_on_match_confirmed()
    },
    match_error: function() {
        this._exec_on_match_error();
        handle_mm_match_cancelled()
    },
    start_error: function(data) {
        this._exec_on_start_error(data)
    },
    user_update: function(setting, value) {
        if (!this.am_host()) return;
        if (!this.in_lobby()) return;
        if (!(setting in this.settings)) return;
        let changed_settings = [];
        let changed_team_count = false;
        if (setting === "mode") {
            let mode_changed_settings = this.check_mode_settings(setting, value);
            for (let s of mode_changed_settings) {
                changed_settings.push(s);
                if (s === "team_count") changed_team_count = true
            }
        }
        if (setting === "private") {
            if ("team_names" in this.settings) {
                this.reset_team_names();
                changed_settings.push("team_names")
            }
        }
        if (setting === "physics" && GAME.active === GAME.ids.ROGUE) {
            if (Number(value) === 0) this.settings["instaswitch"][1] = 0;
            else if (Number(value) === 1) this.settings["instaswitch"][1] = 1;
            else if (Number(value) === 2) this.settings["instaswitch"][1] = 1;
            changed_settings.push("instaswitch")
        }
        if (this.settings[setting][0] === "bool") {
            if (typeof value === "boolean") this.settings[setting][1] = value ? true : false;
            else if (typeof value === "number") this.settings[setting][1] = value > 0 ? true : false;
            else if (typeof value === "string" && isNaN(value)) this.settings[setting][1] = value === "true" ? true : false;
            else this.settings[setting][1] = Number(value) ? true : false
        } else if (this.settings[setting][0] === "string") {
            this.settings[setting][1] = "" + value
        } else if (this.settings[setting][0] === "custom") {
            if (setting === "commands") {
                this.settings[setting][1] = this.parse_commands_string(value)
            } else {
                this.settings[setting][1] = value
            }
            if (setting === "map_list") {
                if (value === null) value = [];
                for (let i = value.length - 1; i >= 0; i--) {
                    if (value[i] === null) value.splice(i, 1)
                }
            }
        } else if (this.settings[setting][0] === "int") {
            this.settings[setting][1] = parseInt(value)
        } else if (this.settings[setting][0] === "float") {
            this.settings[setting][1] = Number(value)
        }
        if (setting === "team_count" || setting === "team_size") {
            changed_team_count = true
        }
        if (changed_team_count) {
            this.refresh_team_names()
        }
        if (setting in this.client_var_reverse_map) {
            if (setting === "mode") {
                this.store_setting(this.client_var_reverse_map[setting], [this.settings["mode"][1], this.settings["mode_name"][1]], "json", true)
            } else {
                this.store_setting(this.client_var_reverse_map[setting], this.settings[setting][1], this.client_var_map[this.client_var_reverse_map[setting]].type, true)
            }
        }
        for (let other_setting of changed_settings) {
            if (other_setting in this.client_var_reverse_map) {
                this.store_setting(this.client_var_reverse_map[other_setting], this.settings[other_setting][1], this.client_var_map[this.client_var_reverse_map[other_setting]].type, true)
            }
            this._exec_on_setting_updated(other_setting, this.settings[other_setting][1])
        }
        this.send_update();
        if (!this.state.init && setting === "mode") {
            this.set_map_to_mode_default()
        }
    },
    master_update: function(data) {
        let changed_team_count = false;
        let changed_mode = false;
        let became_host = false;
        let lost_host = false;
        if (!this.state.host && data.host) became_host = true;
        else if (this.state.host && !data.host) lost_host = true;
        this.state.host = typeof data.host === "boolean" && data.host ? true : false;
        this.state.admins.length = 0;
        if (data.data.admins && data.data.admins.length) {
            this.state.admins = data.data.admins
        }
        let init = false;
        if (data["lobby-action"] === "join") {
            init = true;
            if (this.state.host) became_host = true;
            else lost_host = true;
            this.state.init = true
        }
        let lobby_changed = false;
        if (this.state.id != data["lobby-id"]) {
            lobby_changed = true;
            if (this.state.host) became_host = true;
            else lost_host = true
        }
        this.state.id = data["lobby-id"];
        if ("match" in data && data.match != this.state.match) {
            this.state.match = data.match ? true : false;
            this._exec_on_match_changed(this.state.match)
        }
        for (let team_id in data.data.teams) {
            for (let user of data.data.teams[team_id]) {
                if (user === null) continue;
                Friends.map_user_id(user.client_user_id, user.user_id)
            }
        }
        for (let setting in data.data.settings) {
            if (!(setting in this.settings)) continue;
            let changed = false;
            if (init || lobby_changed) {
                changed = true
            } else if (this.settings[setting][0] === "custom") {
                if (this.settings[setting][1].length !== data.data.settings[setting].length) {
                    changed = true
                } else if (setting === "team_names" && "team_names" in this.settings) {
                    for (let i = 0; i < this.settings[setting][1].length; i++) {
                        if (this.settings[setting][1][i] !== data.data.settings[setting][i]) {
                            changed = true;
                            break
                        }
                    }
                } else if (setting === "map_list") {
                    for (let i = 0; i < this.settings[setting][1].length; i++) {
                        if (this.settings[setting][1][i][0] !== data.data.settings[setting][i][0]) {
                            changed = true;
                            break
                        }
                    }
                } else if (setting === "commands") {
                    for (let i = 0; i < this.settings[setting][1].length; i++) {
                        if (this.settings[setting][1][i].key !== data.data.settings[setting][i].key) {
                            changed = true;
                            break
                        }
                    }
                }
            } else if (this.settings[setting][1] != data.data.settings[setting]) {
                changed = true
            }
            if (changed) {
                this.settings[setting][1] = data.data.settings[setting];
                if (setting === "team_count") changed_team_count = true;
                if (setting === "mode") changed_mode = true;
                this._exec_on_setting_updated(setting, data.data.settings[setting]);
                if (this.state.host) {
                    if (setting in this.client_var_reverse_map) {
                        if (setting === "mode") {
                            this.store_setting(this.client_var_reverse_map[setting], [this.settings["mode"][1], this.settings["mode_name"][1]], "json", true)
                        } else {
                            this.store_setting(this.client_var_reverse_map[setting], this.settings[setting][1], this.client_var_map[this.client_var_reverse_map[setting]].type, true)
                        }
                    }
                }
            }
        }
        if (data.data.settings.options) {
            for (let setting in data.data.settings.options) {
                if (!(setting in this.settings)) continue;
                if (this.settings[setting][1] != data.data.settings.options[setting] || init || lobby_changed) {
                    this.settings[setting][1] = data.data.settings.options[setting];
                    this._exec_on_setting_updated(setting, data.data.settings.options[setting])
                }
            }
        }
        if (changed_mode) {
            let mode_changed_settings = this.check_mode_settings("mode", this.settings["mode"][1]);
            for (let setting of mode_changed_settings) {
                this._exec_on_setting_updated(setting, this.settings[setting][1])
            }
        }
        if ("password" in data.data.settings) {
            if (data.data.settings.password !== this.state.password) {
                this.state.password = data.data.settings.password;
                this._exec_on_setting_updated("password", this.state.password)
            }
        }
        if (init || lobby_changed) {
            if ("join_key" in data.data.settings) {
                this._exec_on_setting_updated("join_key", data.data.settings.join_key)
            }
        }
        if (became_host || lost_host) {
            if ("record_replay_avail" in data.data.settings) {
                this._exec_on_setting_updated("record_replay_avail", data.data.settings.record_replay_avail)
            }
        }
        if (!this.preset.loaded && data.data.settings.options && data.data.settings.options.hasOwnProperty("settings_id") && data.data.settings.options.settings_id) {
            if (this.am_host()) this.store_settings();
            this.preset.loaded = true;
            this.preset.id = data.data.settings.options.settings_id;
            this._exec_on_preset(data.data.settings.options.settings_id, data.data.settings.options.settings_title)
        }
        if (this.preset.loaded && data.data.settings.options && data.data.settings.options.hasOwnProperty("settings_id") && data.data.settings.options.settings_id !== this.preset.id) {
            if (this.am_host()) this.store_settings();
            this.preset.loaded = true;
            this.preset.id = data.data.settings.options.settings_id;
            this._exec_on_preset(data.data.settings.options.settings_id, data.data.settings.options.settings_title)
        }
        if (this.preset.loaded && (!data.data.settings.options || !data.data.settings.options.hasOwnProperty("settings_id"))) {
            this.preset.loaded = false;
            this.preset.id = null;
            this._exec_on_preset(null, null)
        }
        this.state.teams = data.data.teams;
        for (let team_id in this.state.teams) {
            if (!Array.isArray(this.state.teams[team_id])) continue;
            for (let c of this.state.teams[team_id]) {
                if (!c) continue;
                if (c.user_id === global_self.user_id) {
                    this.state.own_team = parseInt(team_id);
                    break
                }
            }
        }
        this._exec_on_teams_updated(this.state.teams);
        if (changed_team_count) {
            this.refresh_team_names()
        }
        if (init) {
            if (this.am_host()) {
                this.refresh_datacenter()
            }
            this._exec_on_join();
            this.state.init = false
        } else if (lobby_changed) {
            this._exec_on_join()
        }
        this._exec_on_host_change(became_host, lost_host);
        this._exec_on_master_update(lobby_changed)
    },
    client_var_update: function(variable, value) {
        function convert_value(source_type, to_type, value, default_value) {
            if (source_type === "string" || source_type === "real") {
                if (to_type === "bool") {
                    if (typeof value === "boolean") return value;
                    else if (typeof value === "number") return value ? true : false;
                    else if (typeof value === "string" && isNaN(value)) return value === "true" ? true : false;
                    else return Number(value) ? true : false
                } else if (to_type === "int" || to_type === "float") {
                    if (typeof value === "number") return value;
                    else if (typeof value === "string") return Number(value)
                }
            } else if (source_type === "json") {
                try {
                    return JSON.parse(value)
                } catch (e) {
                    return default_value
                }
            }
            return value
        }
        if (!(variable in this.client_var_map)) return;
        if (variable === "lobby_custom_datacenter") {
            this.refresh_datacenter(value)
        }
        let mode_changed = false;
        if (this.client_var_map[variable].cb_type === "select" && this.client_var_map[variable].name in this.settings) {
            let new_value = convert_value(this.client_var_map[variable].type, this.settings[this.client_var_map[variable].name][0], value, this.settings[this.client_var_map[variable].name][2]);
            this.settings[this.client_var_map[variable].name][1] = new_value
        } else if (this.client_var_map[variable].cb_type === "custom") {
            if (variable === "lobby_custom_map") this.set_maps(value);
            if (variable === "lobby_custom_commands") this.set_commands(value);
            if (variable === "lobby_custom_mode") {
                let mode_obj = convert_value("json", null, value, "");
                if (Array.isArray(mode_obj) && mode_obj.length >= 2) {
                    if (this.settings["mode"][1] !== mode_obj[0]) mode_changed = true;
                    this.settings["mode"][1] = mode_obj[0];
                    this.settings["mode_name"][1] = mode_obj[1]
                } else if (this.settings["mode"][1] != "") {
                    mode_changed = true;
                    this.settings["mode"][1] = "";
                    this.settings["mode_name"][1] = ""
                }
            }
        }
        if (["mode", "team_count", "team_size", "score_limit", "time_limit"].includes(this.client_var_map[variable].name)) {
            let mode_changed_settings = [];
            if (this.client_var_map[variable].name === "mode") {
                if (mode_changed) mode_changed_settings = this.check_mode_settings("mode", this.settings["mode"][1])
            } else {
                mode_changed_settings = this.check_mode_settings(this.client_var_map[variable].name, this.settings["mode"][1])
            }
            for (let setting of mode_changed_settings) {
                this._exec_on_setting_updated(setting, this.settings[setting][1])
            }
        }
        this._exec_on_setting_updated(this.client_var_map[variable].name, this.settings[this.client_var_map[variable].name][1]);
        this.send_update()
    },
    check_mode_settings: function(updated_setting, mode) {
        let changed_settings = [];
        const coop_modes = GAME.get_data("CUSTOM_SPECIAL_COOP_MODES");
        const multi_team_modes = GAME.get_data("CUSTOM_MULTI_TEAM_MODES");
        const solo_modes = GAME.get_data("CUSTOM_SOLO_MODES");
        const mode_defaults = GAME.get_data("CUSTOM_MODE_DEFAULTS");
        if (coop_modes && coop_modes.includes(mode)) {
            this.settings["team_count"][1] = 1;
            this.settings["time_limit"][1] = 0;
            this.settings["score_limit"][1] = 0;
            if (mode in mode_defaults) {
                if ("time_limit" in mode_defaults[mode]) this.settings["time_limit"][1] = mode_defaults[mode]["time_limit"];
                if ("score_limit" in mode_defaults[mode]) this.settings["score_limit"][1] = mode_defaults[mode]["score_limit"]
            }
            changed_settings.push("team_count");
            changed_settings.push("time_limit");
            changed_settings.push("score_limit");
            changed_team_count = true
        } else if ((!multi_team_modes || !multi_team_modes.includes(mode)) && this.settings["team_count"][1] !== 2) {
            this.settings["team_count"][1] = 2;
            changed_settings.push("team_count");
            changed_team_count = true
        }
        if (solo_modes && solo_modes.includes(mode)) {
            this.settings["team_size"][1] = 1;
            changed_settings.push("team_size")
        }
        if (updated_setting === "mode" && !this.state.init) {}
        return changed_settings
    },
    set_map_to_mode_default: function() {
        if (this.settings.mode[1] in global_game_mode_map_lists) {
            let map_changed = false;
            let new_map = null;
            if (!this.settings.map_list[1].length) {
                if (global_game_mode_map_lists[this.settings.mode[1]].length) {
                    new_map = [global_game_mode_map_lists[this.settings.mode[1]][0].map, global_game_mode_map_lists[this.settings.mode[1]][0].name, global_game_mode_map_lists[this.settings.mode[1]][0].official];
                    map_changed = true
                }
            } else {
                let found = false;
                for (let map of global_game_mode_map_lists[this.settings.mode[1]]) {
                    if (!new_map) {
                        new_map = [map.map, map.name, map.official]
                    }
                    if (map.map === this.settings.map_list[1][0][0]) {
                        found = true;
                        break
                    }
                }
                if (!found && new_map) map_changed = true
            }
            if (map_changed) {
                this.set_maps([new_map]);
                if (this.am_host()) {
                    this.store_setting(this.client_var_reverse_map["map_list"], this.settings.map_list[1], this.client_var_map[this.client_var_reverse_map["map_list"]].type, true)
                }
            }
        } else if (this.settings.mode[1]) {
            api_request("GET", `/mode?mode_name=${this.settings.mode[1]}`, {}, (mode => {
                if (this.settings.mode[1] !== mode.mode_name) return;
                set_global_map_list_from_api(mode.mode_name, mode.maps);
                this.set_map_to_mode_default()
            }))
        }
    },
    store_settings: function() {
        for (let variable in this.client_var_map) {
            if (this.client_var_map[variable].name in this.settings) {
                if (variable === "lobby_custom_mode") {
                    this.store_setting(variable, [this.settings["mode"][1], this.settings["mode_name"][1]], "json", true)
                } else {
                    this.store_setting(variable, this.settings[this.client_var_map[variable].name][1], this.client_var_map[variable].type, true)
                }
            }
        }
    },
    store_setting: function(variable, value, type, skip_cb) {
        if (type === "json") {
            update_variable("string", variable, JSON.stringify(value), skip_cb)
        } else if (type === "real") {
            update_variable("real", variable, Number(value), skip_cb)
        } else if (type === "string") {
            update_variable("string", variable, value, skip_cb)
        }
    },
    reset_settings: function(init) {
        this.state.init = true;
        const skip_settings = ["colors", "team_names"];
        for (let setting in this.settings) {
            if (skip_settings.includes(setting)) continue;
            this.settings[setting][1] = this.settings[setting][2];
            this._exec_on_setting_updated(setting, this.settings[setting][1])
        }
        for (let variable in this.client_var_map) {
            if (skip_settings.includes(this.client_var_map[variable].name)) continue;
            if (this.client_var_map[variable].cb_type === "select") {
                engine.call("initialize_select_value", variable)
            } else if (this.client_var_map[variable].cb_type === "custom") {
                engine.call("initialize_custom_component_value", variable)
            }
        }
        this.reset_team_names();
        this.state.init = false
    },
    reset_settings_default: function() {
        if (!this.am_host()) return;
        const reset_settings = ["instagib", "hook", "instaswitch", "lifesteal", "allow_queue", "allow_map_voting", "record_replay", "continuous", "auto_balance", "team_switching", "physics", "warmup_time", "min_players", "max_clients", "netcode", "max_ping", "ready_percentage", "commands", "mode_editing"];
        for (let setting of reset_settings) {
            if (!(setting in this.settings)) continue;
            this.settings[setting][1] = this.settings[setting][2];
            if (setting in this.client_var_reverse_map) {
                this.store_setting(this.client_var_reverse_map[setting], this.settings[setting][1], this.client_var_map[this.client_var_reverse_map[setting]].type, true)
            }
            this._exec_on_setting_updated(setting, this.settings[setting][1])
        }
        this.send_update()
    },
    reset_team_names: function() {
        if (!("team_names" in this.settings)) return;
        this.settings["team_names"][1] = new Array(this.get_setting("team_count"));
        for (let i = 0; i < this.get_setting("team_count"); i++) {
            this.settings["team_names"][1][i] = "Team " + (i + 1)
        }
        this._exec_on_setting_updated("team_names", this.settings["team_names"][1])
    },
    refresh_team_names: function() {
        if (!("team_names" in this.settings)) return;
        let prev_names = this.settings["team_names"][1];
        this.settings["team_names"][1] = new Array(this.get_setting("team_count"));
        for (let i = 0; i < this.get_setting("team_count"); i++) {
            if (i < prev_names.length) {
                this.settings["team_names"][1][i] = prev_names[i]
            } else {
                this.settings["team_names"][1][i] = "Team " + (i + 1)
            }
        }
    },
    get_team_name: function(i) {
        if ("team_names" in this.settings && i < this.settings["team_names"][1].length) {
            return this.settings["team_names"][1][i]
        } else {
            return "Team " + (i + 1)
        }
    },
    set_team_name: function(i, name) {
        if (!this.am_host()) return;
        if (!("team_names" in this.settings)) return;
        if (this.settings["team_names"][1][i] !== name.trim()) {
            this.settings["team_names"][1][i] = name.trim();
            this.send_update()
        }
    },
    refresh_datacenter: function(stored_value) {
        if (!Servers.server_locations_initialized) {
            return
        }
        if (this.in_lobby() && !this.am_host()) return;
        if (this.settings.datacenter[1].trim().length == 0 || this.settings.datacenter[1].trim() == '""' || this.settings.datacenter[1].trim() == "''") {
            if (GAME.get_data("lobby_location_selection_type") > 1) {
                if (stored_value && stored_value in Servers.regions) {
                    this.settings.datacenter[1] = stored_value
                } else {
                    let best_region = Servers.get_best_region_by_ping();
                    if (best_region) {
                        this.settings.datacenter[1] = best_region
                    } else {
                        this.settings.datacenter[1] = ""
                    }
                }
            } else {
                if (stored_value && stored_value in Servers.locations) {
                    this.settings.datacenter[1] = stored_value
                } else {
                    let best_locations = Servers.get_best_locations_by_ping();
                    if (best_locations.length) {
                        this.settings.datacenter[1] = best_locations[0]
                    } else {
                        this.settings.datacenter[1] = ""
                    }
                }
            }
            update_variable("string", "lobby_custom_datacenter", this.settings.datacenter[1], true);
            this._exec_on_setting_updated("datacenter", this.settings.datacenter[1]);
            this.send_update()
        }
    },
    set_maps: function(data) {
        let values = undefined;
        try {
            if (typeof data === "string" && data.startsWith("[")) {
                values = JSON.parse(data)
            } else if (typeof data === "string" && data.length) {
                values = [
                    [data, _format_map_name(data), 0]
                ]
            } else if (Array.isArray(data)) {
                values = data
            }
            if (!Array.isArray(values)) {
                values = []
            }
        } catch (error) {
            values = [
                [data, _format_map_name(data), 0]
            ]
        }
        let changed = false;
        if (values.length !== this.settings.map_list[1].length) {
            changed = true
        } else {
            for (let i = 0; i < this.settings.map_list[1].length; i++) {
                if (this.settings.map_list[1][i][0] !== values[i][0]) {
                    changed = true;
                    break
                }
            }
        }
        this.settings.map_list[1] = values;
        if (changed) {
            this.send_update()
        }
        this._exec_on_setting_updated("map_list", this.settings.map_list[1])
    },
    set_commands: function(data) {
        let values = [];
        try {
            if (typeof data === "string" && data.startsWith("[")) {
                values = JSON.parse(data)
            } else {
                values = this.parse_commands_string(data)
            }
        } catch (error) {
            values = this.parse_commands_string(data)
        }
        this.settings.commands[1] = values;
        this._exec_on_setting_updated("commands", this.settings.commands[1])
    },
    parse_commands_string: function(string) {
        let values = [];
        let commands_list = string.replace(/ +/g, " ").replace(/[\n\r]+/g, "").trim().split(";");
        for (let c of commands_list) {
            if (!c.trim().length) continue;
            let pair = rightward_greedy_two_way_split(c, ":");
            if (pair.length != 2) continue;
            values.push({
                key: pair[0].trim(),
                value: pair[1].trim()
            })
        }
        return values
    },
    set_password(password) {
        if (!this.am_host()) return;
        if (!this.in_lobby()) return;
        send_string(CLIENT_COMMAND_LOBBY_UPDATE_PASSWORD, password)
    },
    send_update() {
        if (!this.am_host()) return;
        if (!this.in_lobby()) return;
        if (this.state.send_timeout !== null) {
            clearTimeout(this.state.send_timeout);
            this.state.send_timeout = null
        }
        this.state.send_timeout = setTimeout((() => {
            send_json_data({
                action: "lobby-settings",
                settings: this.get_settings()
            });
            this.state.send_timeout = null
        }), 1)
    },
    remove_player: function(user_id) {
        if (!this.am_host()) return;
        send_json_data({
            action: "lobby-remove",
            "user-id": user_id
        })
    },
    make_player_host: function(user_id) {
        if (!this.am_host()) return;
        send_json_data({
            action: "lobby-makehost",
            "user-id": user_id
        })
    },
    make_player_admin: function(user_id) {
        send_string(CLIENT_COMMAND_LOBBY_MAKE_ADMIN, user_id)
    },
    revoke_admin: function(user_id) {
        send_string(CLIENT_COMMAND_LOBBY_REVOKE_ADMIN, user_id)
    },
    swap_player_slot: function(from, to) {
        if (!this.am_host()) return;
        send_json_data({
            action: "lobby-swap",
            from: from,
            to: to
        })
    },
    start_game: function() {
        if (!this.am_host()) return;
        send_json_data({
            action: "lobby-start"
        })
    },
    join_lobby: function(key) {
        if (!bool_am_i_leader) return;
        if (key.trim().length == 0) return;
        send_string(CLIENT_COMMAND_PARTY_JOIN_LOBBY_KEY, key)
    },
    join_game: function() {
        send_string(CLIENT_COMMAND_PARTY_JOIN_LOBBY_SESSION)
    },
    in_lobby: function() {
        if (this.state.id === "") return false;
        return true
    },
    am_host: function() {
        return this.state.host
    }
};

function update_custom_command(key, value) {
    let commands_str = "";
    commands_str += key + ": " + value + ";\n";
    return commands_str
}