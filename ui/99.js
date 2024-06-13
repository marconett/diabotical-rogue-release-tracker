global_components["game_report"] = new MenuComponent("game_report", _id("game_report"), (function() {
    page_game_report.init()
}));
const page_game_report = new function() {
    let report_active = false;
    let countdown_time = 0;
    let countdown_interval = null;
    let rematch_requested = false;
    let rematch_enabled = false;
    let show_maps_animation = true;
    let showing_last_match = false;
    let last_match = null;
    let last_matches = [];
    let disconnected_clients = {};
    let html = {
        root: null,
        sub_screen_menu: null,
        countdown: null,
        countdown_text: null,
        countdown_value: null,
        btn_requeue: null,
        btn_rematch: null,
        btn_leave: null,
        btn_close: null,
        match_info: null,
        scoreboard: null,
        stats: null,
        maps: null
    };
    let tab_map = {
        current_tab: "game_report_scoreboard_tab",
        current_scroll: null,
        cb: function(el, tab, previous_el, previous_tab, optional_params) {},
        game_report_map_vote_tab: {
            content: "game_report_map_vote",
            scroll: null,
            nav: null,
            cb: () => {
                if (show_maps_animation) {
                    let delay = 0;
                    let elements = html.maps.querySelectorAll(".vote_option_cont");
                    for (let i = 0; i < elements.length; i++) {
                        setTimeout((() => {
                            elements[i].classList.remove("hidden");
                            elements[i].firstElementChild.classList.add("rotate_in")
                        }), delay);
                        delay += 80
                    }
                    show_maps_animation = false
                }
            }
        },
        game_report_scoreboard_tab: {
            content: "game_report_scoreboard",
            scroll: null,
            nav: null,
            cb: () => {}
        },
        game_report_stats_tab: {
            content: "game_report_stats",
            scroll: null,
            nav: null,
            cb: () => {}
        }
    };

    function tab_selected(element, action) {
        set_tab(tab_map, element)
    }
    this.init = () => {
        html.root = _id("game_report");
        html.sub_screen_menu = html.root.querySelector(".sub_screen_menu");
        html.countdown = html.root.querySelector(".report_controls .countdown");
        html.countdown_text = html.root.querySelector(".report_controls .countdown .text");
        html.countdown_value = html.root.querySelector(".report_controls .countdown .value");
        html.btn_requeue = html.root.querySelector(".report_controls .buttons .requeue");
        html.btn_rematch = html.root.querySelector(".report_controls .buttons .rematch");
        html.btn_leave = html.root.querySelector(".report_controls .buttons .leave");
        html.btn_close = html.root.querySelector(".report_controls .buttons .close");
        html.match_info = html.root.querySelector(".report_match_info");
        html.scoreboard = _id("game_report_scoreboard");
        html.stats = _id("game_report_stats");
        html.maps = _id("game_report_map_vote");
        bind_event("last_match_json", (json => {
            if (!json) return;
            try {
                let data = JSON.parse(json);
                last_matches.length = 0;
                last_matches.unshift(data)
            } catch (e) {
                console.error("Error parsing last match json", e.message, json)
            }
        }));
        on_press_esc_handlers.push((() => {
            if (!report_active) return;
            if (!showing_last_match) return;
            if (is_modal_open) return;
            this.close();
            return false
        }));
        on_set_game_report.push(((manifest, json_game_status, json_snafu_data) => {
            set_game_report(manifest, json_game_status, json_snafu_data)
        }));
        on_show_game_report.push((visible => {
            show_game_report(visible, false)
        }));
        on_in_game_handlers.push((() => {
            if (IN_HUB) {
                show_game_report(false, true)
            }
        }));
        on_match_manifest_handlers.push((manifest => {
            if (countdown_interval) clearInterval(countdown_interval);
            if ("lingering_time" in manifest) countdown_time = Number(manifest.lingering_time)
        }));
        global_ms.addPermanentResponseHandler("rematch-status", (data => {
            rematch_update(data)
        }));
        global_ms.addPermanentResponseHandler("next-match-starting", (() => {
            if (countdown_interval) clearInterval(countdown_interval);
            html.countdown_text.textContent = localize("report_next_match_is_starting");
            html.countdown_value.style.display = "none";
            html.countdown_value.textContent = ""
        }));
        global_ms.addPermanentResponseHandler("vote-counts", (data => {
            if (!report_active) return;
            if (data.type !== "map") return;
            _for_each_with_class_in_parent(html.maps, "vote_option", (function(opt_el) {
                let vote_cont = _get_first_with_class_in_parent(opt_el, "count");
                if (!vote_cont) return;
                vote_cont.textContent = 0;
                if (opt_el.dataset.option in data.votes && data.votes[opt_el.dataset.option] > 0) {
                    vote_cont.textContent = data.votes[opt_el.dataset.option]
                }
            }))
        }));
        bind_event("map_unloaded", (function() {
            console.log("game_report map_unloaded");
            show_game_report(false, true)
        }));
        on_post_match_updates.push((data => {
            console.log("past_match_updates", data);
            if ("rematch_enabled" in data) {
                rematch_enabled = data.rematch_enabled
            } else {
                rematch_enabled = false
            }
            rematch_reset_option();
            if ("progression_updates" in data && "global_points_update" in data.progression_updates) {
                if (last_match && last_match.manifest && last_match.manifest.match_id === data.match_id) {
                    last_match.master_data.points_earned = data.progression_updates.global_points_update.points_earned;
                    if (data.progression_updates.global_points_update.points_earned_bonus_weekly) {
                        last_match.master_data.points_earned += data.progression_updates.global_points_update.points_earned_bonus_weekly
                    }
                    if (data.progression_updates.global_points_update.points_earned_bonus_daily) {
                        last_match.master_data.points_earned += data.progression_updates.global_points_update.points_earned_bonus_daily
                    }
                    render_match_info()
                }
            }
            if ("disconnected_clients" in data) {
                if (last_match && last_match.manifest && last_match.manifest.match_id === data.match_id) {
                    last_match.master_data.disconnected_clients = data.disconnected_clients
                }
                disconnected_clients[data.match_id] = data.disconnected_clients
            }
            if (last_matches.length && last_matches[0].manifest && last_matches[0].manifest.match_id === data.match_id) {
                engine.call("set_last_match_json", JSON.stringify(last_match))
            }
        }));
        Navigation.generate_nav({
            name: "game_report_menu",
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
        Navigation.select_element("game_report_menu", _id("game_report_scoreboard_tab"))
    };

    function set_game_report(manifest, json_game_status, json_snafu_data) {
        if (!json_game_status) return;
        try {
            last_match = {
                manifest: manifest,
                game_status: JSON.parse(json_game_status),
                snafu_data: JSON.parse(json_snafu_data),
                master_data: {
                    disconnected_clients: [],
                    points_earned: null
                }
            }
        } catch (e) {
            console.log("game_report json parse error", e.message)
        }
        const date = new Date;
        last_match.game_status.date = _to_readable_timestamp(date, false);
        if (last_match.manifest && last_match.manifest.match_id in disconnected_clients) {
            last_match.master_data.disconnected_clients = disconnected_clients[last_match.manifest.match_id]
        }
        if (last_match.snafu_data["game_data.location"] == "direct") {
            last_match.snafu_data["game_data.continuous"] = 0
        }
        show_maps_animation = true;
        if (last_match.snafu_data["game_data.is_replaying"] === "false") {
            if (last_match.snafu_data["game_data.continuous"] == 1) {
                html.countdown_text.textContent = localize("report_next_map_in");
                html.btn_requeue.style.display = "none"
            } else {
                html.countdown_text.textContent = localize("report_leaving_game_in");
                if (last_match.game_status.match_type == MATCH_TYPE_QUEUE) {
                    if (bool_am_i_leader) html.btn_requeue.style.display = "flex";
                    else html.btn_requeue.style.display = "none"
                } else {
                    html.btn_requeue.style.display = "none"
                }
            }
            if (last_match.game_status.match_type == MATCH_TYPE_TOURNAMENT) {
                _empty(html.countdown_text)
            }
            rematch_reset_option();
            if (countdown_interval) clearInterval(countdown_interval);
            html.countdown_value.style.display = "flex";
            html.countdown_value.textContent = countdown_time;
            countdown_interval = setInterval((function() {
                countdown_time = countdown_time - 1;
                if (countdown_time < 0) {
                    countdown_time = 0;
                    clearInterval(countdown_interval)
                }
                html.countdown_value.textContent = countdown_time
            }), 1e3)
        } else {
            html.btn_requeue.style.display = "none";
            html.btn_rematch.style.display = "none"
        }
        html.countdown.style.display = "flex";
        html.btn_close.style.display = "none";
        html.btn_leave.style.display = "flex";
        last_match.game_status.clients.sort(sortPlayersByStats);
        for (var i = 0; i < last_match.game_status.clients.length; i++) {
            var teamId = last_match.game_status.clients[i].team;
            if (teamId >= 0 && teamId < 200) {
                if (!last_match.game_status.teams[teamId]) {
                    last_match.game_status.teams[teamId] = {
                        score: 0,
                        placement: 999,
                        name: localize_ext("team_with_idx", {
                            value: teamId + 1
                        }),
                        color: "#ffffff"
                    }
                }
                if (last_match.game_status.teams[teamId].players === undefined) {
                    last_match.game_status.teams[teamId].players = []
                }
                last_match.game_status.teams[teamId].players.push(last_match.game_status.clients[i]);
                for (let team of last_match.snafu_data.teams) {
                    if (teamId == team.team_id) {
                        last_match.game_status.teams[teamId].color = team.color;
                        last_match.game_status.teams[teamId].color_dark = team.color_dark;
                        last_match.game_status.teams[teamId].color_darker = team.color_darker;
                        break
                    }
                }
            }
        }
        if (!(last_match.snafu_data["game_data.own_team.team_id"] in last_match.game_status.teams)) {
            last_match.game_status.teams[last_match.snafu_data["game_data.own_team.team_id"]] = {
                score: 0
            }
        }
        if (!(last_match.snafu_data["game_data.enemy_team.team_id"] in last_match.game_status.teams)) {
            last_match.game_status.teams[last_match.snafu_data["game_data.enemy_team.team_id"]] = {
                score: 0
            }
        }
        engine.call("set_last_match_json", JSON.stringify(last_match));
        last_matches.unshift(last_match);
        create_game_report(true)
    }
    this.load_last_match = () => {
        last_match = this.get_last_match();
        if (!last_match) return;
        html.countdown.style.display = "none";
        html.btn_close.style.display = "flex";
        html.btn_leave.style.display = "none";
        html.btn_requeue.style.display = "none";
        html.btn_rematch.style.display = "none";
        create_game_report(false)
    };

    function classImageUrl(class_name) {
        if (class_name === "rogue_chunk") {
            return "/html/images/rogue_avatars/small_square_chunk.png.dds"
        } else if (class_name === "rogue_eggbot") {
            return "/html/images/rogue_avatars/small_square_eggbot.png.dds"
        } else if (class_name === "rogue_scout") {
            return "/html/images/rogue_avatars/small_square_weesuit.png.dds"
        }
        return ""
    }

    function render_match_info() {
        let victory = false;
        if (last_match.game_status.teams[last_match.snafu_data["game_data.own_team.team_id"]].placement == 0) victory = true;
        _empty(html.match_info);
        const mode_data = GAME.get_data("game_mode_map", last_match.game_status.mode);
        let fragment = new DocumentFragment;
        fragment.appendChild(_createElement("div", "result", victory ? localize("ingame_victory") : localize("ingame_defeat")));
        let row_date = _createElement("div", "row");
        row_date.appendChild(_createElement("div", "label", localize("match_date") + ":"));
        row_date.appendChild(_createElement("div", "value", last_match.game_status.date));
        let row_mode = _createElement("div", "row");
        row_mode.appendChild(_createElement("div", "label", localize("match_mode") + ":"));
        row_mode.appendChild(_createElement("div", "value", mode_data ? localize(mode_data.i18n) : "?"));
        let row_map = _createElement("div", "row");
        row_map.appendChild(_createElement("div", "label", localize("match_map") + ":"));
        row_map.appendChild(_createElement("div", "value", _format_map_name(last_match.game_status.map, last_match.game_status.map_name)));
        let row_length = _createElement("div", "row");
        row_length.appendChild(_createElement("div", "label", localize("match_length") + ":"));
        row_length.appendChild(_createElement("div", "value", _seconds_to_digital(last_match.game_status.match_time)));
        fragment.appendChild(row_mode);
        fragment.appendChild(row_date);
        fragment.appendChild(row_map);
        fragment.appendChild(row_length);
        if (last_match.master_data && last_match.master_data.points_earned) {
            let row_points = _createElement("div", "row");
            row_points.appendChild(_createElement("div", ["image", "points"]));
            row_points.appendChild(_createElement("div", "value", "+" + last_match.master_data.points_earned));
            fragment.appendChild(row_points)
        }
        html.match_info.appendChild(fragment)
    }

    function create_game_report(on_match_finish) {
        if (!last_match.game_status || !last_match.snafu_data) return;
        showing_last_match = !on_match_finish;
        if (showing_last_match) {
            set_modal_engine_call(true, true, true)
        }
        let team_size = Number(last_match.snafu_data["game_data.team_size"]);
        let team_count = Number(last_match.snafu_data["game_data.team_count"]);
        let player_lookup = {};
        let placement_lookup = {};
        let team_stats = {};
        let team_id_self = null;
        let player_self = null;
        let player_first = null;
        let max_team_size = 0;
        let min_ability_count = 2;
        let min_weapon_count = 2;
        for (let t of last_match.snafu_data.teams) {
            if (parseInt(t.team_id) === SPECTATING_TEAM || t.team_id === undefined) continue;
            t.players = [];
            if (!(t.team_id in team_stats)) {
                team_stats[t.team_id] = {};
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_FRAGS] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DEATHS] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_ASSISTS] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_SCORE] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_TEAM_HEALING] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_OWN_HEALING] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS] = 0;
                team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS] = 0
            }
            for (let c of last_match.game_status.clients) {
                if (t.team_id == c.team) {
                    t.players.push(c);
                    if (c.stats) {
                        if (GLOBAL_ABBR.STATS_KEY_FRAGS in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_FRAGS] += c.stats[GLOBAL_ABBR.STATS_KEY_FRAGS];
                        if (GLOBAL_ABBR.STATS_KEY_DEATHS in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DEATHS] += c.stats[GLOBAL_ABBR.STATS_KEY_DEATHS];
                        if (GLOBAL_ABBR.STATS_KEY_ASSISTS in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_ASSISTS] += c.stats[GLOBAL_ABBR.STATS_KEY_ASSISTS];
                        if (GLOBAL_ABBR.STATS_KEY_SCORE in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_SCORE] += c.stats[GLOBAL_ABBR.STATS_KEY_SCORE];
                        if (GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] += c.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED];
                        if (GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] += c.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN];
                        if (GLOBAL_ABBR.STATS_KEY_TEAM_HEALING in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_TEAM_HEALING] += c.stats[GLOBAL_ABBR.STATS_KEY_TEAM_HEALING];
                        if (GLOBAL_ABBR.STATS_KEY_OWN_HEALING in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_OWN_HEALING] += c.stats[GLOBAL_ABBR.STATS_KEY_OWN_HEALING];
                        if (GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS] += c.stats[GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS];
                        if (GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS in c.stats) team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS] += c.stats[GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS]
                    }
                    if (c.user_id === global_self.user_id) {
                        team_id_self = t.team_id;
                        player_self = c
                    }
                    if (!player_first) player_first = c
                }
            }
            if (t.team_id in last_match.game_status.teams) {
                last_match.game_status.teams[t.team_id].team_id = t.team_id;
                placement_lookup[last_match.game_status.teams[t.team_id].placement] = t
            }
            if (t.players.length > max_team_size) {
                max_team_size = t.players.length
            }
        }
        for (let p of last_match.snafu_data.players) {
            player_lookup[p.user_id] = p
        }
        var teams = Object.keys(last_match.game_status.teams).reduce((function(result, key) {
            if (parseInt(key) !== SPECTATING_TEAM) {
                result.push(last_match.game_status.teams[key])
            }
            return result
        }), []);
        teams.sort(((a, b) => {
            if (team_count > 2) {
                if (a.placement == -1 || a.placement == 255) return -1;
                return a.placement > b.placement ? 1 : -1
            } else {
                if (parseInt(team_id_self) === SPECTATING_TEAM) {
                    if (a.team_id == "0") return -1;
                    return 1
                } else {
                    if (a.team_id == team_id_self) return -1;
                    return 1
                }
            }
        }));
        if (max_team_size > 12) {
            html.root.classList.add("small")
        } else {
            html.root.classList.remove("small")
        } {
            render_match_info()
        } {
            _empty(html.scoreboard);
            let ffa_mode = false;
            let head_rendered = false;
            let scoreboard = _createElement("div", "scoreboard");
            let current_page = 1;
            let show_loadout = true;
            let pages = {
                1: [],
                2: [],
                3: []
            };
            let page_idx = {
                loadout: 1,
                damage: 2,
                healing: 3
            };
            if (last_match.game_status.mode === "rogue_wipeout") {
                show_loadout = false;
                pages = {
                    1: [],
                    2: [],
                    3: []
                };
                page_idx["damage"] = 1;
                page_idx["healing"] = 2;
                page_idx["pickups"] = 3
            }
            for (let t of teams) {
                if (parseInt(t.team_id) === SPECTATING_TEAM || t.team_id === undefined) continue;
                let team = _createElement("div", "team");
                let team_score_value = 0;
                let team_name = t.name;
                let colors = get_enemy_colors();
                if (!player_self) {
                    if (t.team_id == "0") {
                        colors = get_own_colors()
                    }
                } else {
                    if (t.team_id == team_id_self) {
                        colors = get_own_colors()
                    }
                }
                team.style.setProperty("--team_color", "#" + colors.color);
                team.style.setProperty("--team_color2", "#" + colors.color_dark);
                team.style.setProperty("--team_color3", "#" + colors.color_darker);
                if (t.team_id in last_match.game_status.teams) {
                    team_score_value = last_match.game_status.teams[t.team_id].score;
                    team_name = last_match.game_status.teams[t.team_id].name
                }
                if (!ffa_mode || !head_rendered) {
                    head_rendered = true;
                    let head = _createElement("div", "head");
                    let team_score = _createElement("div", "team_score");
                    if (!ffa_mode) {
                        team_score.appendChild(_createElement("div", null, team_score_value))
                    }
                    head.appendChild(team_score);
                    head.appendChild(_createElement("div", ["name"], ffa_mode ? "" : team_name)); {
                        let double = _createElement("div", ["double", "kills"]);
                        double.appendChild(_createElement("div", "label", localize("stats_kills_short")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_FRAGS]))
                        }
                        head.appendChild(double)
                    } {
                        let double = _createElement("div", ["double", "deaths"]);
                        double.appendChild(_createElement("div", "label", localize("stats_deaths_short")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DEATHS]))
                        }
                        head.appendChild(double)
                    } {
                        let double = _createElement("div", ["double", "assists"]);
                        double.appendChild(_createElement("div", "label", localize("stats_assists_short")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_ASSISTS]))
                        }
                        head.appendChild(double)
                    }
                    if (show_loadout) {
                        let double = _createElement("div", ["double", "abilities"]);
                        double.appendChild(_createElement("div", ["label", "icon"]));
                        head.appendChild(double);
                        pages[page_idx["loadout"]].push(double)
                    }
                    if (show_loadout) {
                        let double = _createElement("div", ["double", "weapons"]);
                        double.appendChild(_createElement("div", ["label", "icon"]));
                        head.appendChild(double);
                        pages[page_idx["loadout"]].push(double)
                    } {
                        let double = _createElement("div", ["double", "score"]);
                        double.appendChild(_createElement("div", "label", localize("stats_score")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", _shorten_large_number(team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_SCORE])))
                        }
                        head.appendChild(double);
                        pages[page_idx["damage"]].push(double)
                    } {
                        let double = _createElement("div", ["double", "team_healing"]);
                        double.appendChild(_createElement("div", "label", localize("stats_team_healing")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", _shorten_large_number(team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_TEAM_HEALING])))
                        }
                        head.appendChild(double);
                        pages[page_idx["healing"]].push(double)
                    } {
                        let double = _createElement("div", ["double", "own_healing"]);
                        double.appendChild(_createElement("div", "label", localize("stats_own_healing")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", _shorten_large_number(team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_OWN_HEALING])))
                        }
                        head.appendChild(double);
                        pages[page_idx["healing"]].push(double)
                    } {
                        let double = _createElement("div", ["double", "dmg"]);
                        double.appendChild(_createElement("div", "label", localize("stats_dmg_done")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", _shorten_large_number(team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED])))
                        }
                        head.appendChild(double);
                        pages[page_idx["damage"]].push(double)
                    } {
                        let double = _createElement("div", ["double", "dmg_taken"]);
                        double.appendChild(_createElement("div", "label", localize("stats_dmg_taken")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", _shorten_large_number(team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN])))
                        }
                        head.appendChild(double);
                        pages[page_idx["damage"]].push(double)
                    } {
                        let double = _createElement("div", ["double", "minor_pickups"]);
                        double.appendChild(_createElement("div", "label", localize("stats_minor_pickups")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", _shorten_large_number(team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS])))
                        }
                        head.appendChild(double);
                        pages[page_idx["pickups"]].push(double)
                    } {
                        let double = _createElement("div", ["double", "major_pickups"]);
                        double.appendChild(_createElement("div", "label", localize("stats_major_pickups")));
                        if (!ffa_mode && t.team_id in team_stats) {
                            double.appendChild(_createElement("div", "value", _shorten_large_number(team_stats[t.team_id][GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS])))
                        }
                        head.appendChild(double);
                        pages[page_idx["pickups"]].push(double)
                    }
                    if (on_match_finish) {
                        head.appendChild(_createElement("div", ["label", "commend"], localize("commend")))
                    }
                    team.appendChild(head)
                }
                let count = 0;
                if ("players" in t && t.players.length) {
                    for (let p of t.players) {
                        if (!p.stats) {
                            console.log("missing player stats", p.user_id, _dump(p));
                            continue
                        }
                        let is_self = false;
                        if (global_self.user_id === p.user_id) is_self = true;
                        let player = _createElement("div", ["player", "real"]);
                        if (is_self) player.classList.add("self");
                        let class_div = _createElement("div", "avatar");
                        let class_image = _createElement("div", "image");
                        if (GLOBAL_ABBR.STATS_KEY_SELECTED_CLASS in p.stats) {
                            class_image.style.backgroundImage = "url(" + classImageUrl(p.stats[GLOBAL_ABBR.STATS_KEY_SELECTED_CLASS]) + ")"
                        }
                        class_div.appendChild(class_image);
                        player.appendChild(class_div);
                        player.appendChild(_createElement("div", "name", p.name));
                        player.appendChild(_createElement("div", ["value", "kills"], p.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]));
                        player.appendChild(_createElement("div", ["value", "deaths"], p.stats[GLOBAL_ABBR.STATS_KEY_DEATHS]));
                        player.appendChild(_createElement("div", ["value", "assists"], p.stats[GLOBAL_ABBR.STATS_KEY_ASSISTS]));
                        if (show_loadout) {
                            let el = _createElement("div", ["value", "abilities"]);
                            let count = 0;
                            if (GLOBAL_ABBR.STATS_KEY_SELECTED_ABILITIES in p.stats) {
                                for (let idx of p.stats[GLOBAL_ABBR.STATS_KEY_SELECTED_ABILITIES]) {
                                    let s_data = get_skill_by_id(idx);
                                    if (!s_data) continue;
                                    let icon = _createElement("div", "icon");
                                    icon.style.backgroundImage = "url(" + s_data.icon_path + ")";
                                    el.appendChild(icon);
                                    count++
                                }
                            }
                            for (let i = count; i < min_ability_count; i++) {
                                el.appendChild(_createElement("div", "icon"))
                            }
                            player.appendChild(el);
                            pages[page_idx["loadout"]].push(el)
                        }
                        if (show_loadout) {
                            let el = _createElement("div", ["value", "weapons"]);
                            let count = 0;
                            if (GLOBAL_ABBR.STATS_KEY_SELECTED_WEAPONS in p.stats) {
                                for (let idx of p.stats[GLOBAL_ABBR.STATS_KEY_SELECTED_WEAPONS]) {
                                    let w_data = get_weapon_by_idx(idx);
                                    if (!w_data) continue;
                                    let icon = _createElement("div", "icon");
                                    icon.style.backgroundImage = "url(" + w_data.icon_path2 + ")";
                                    el.appendChild(icon);
                                    count++
                                }
                            }
                            for (let i = count; i < min_weapon_count; i++) {
                                el.appendChild(_createElement("div", "icon"))
                            }
                            player.appendChild(el);
                            pages[page_idx["loadout"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "score"], p.stats[GLOBAL_ABBR.STATS_KEY_SCORE]);
                            player.appendChild(el);
                            pages[page_idx["damage"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "dmg"], p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]);
                            player.appendChild(el);
                            pages[page_idx["damage"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "dmg_taken"], p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN]);
                            player.appendChild(el);
                            pages[page_idx["damage"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "team_healing"]);
                            if (GLOBAL_ABBR.STATS_KEY_TEAM_HEALING in p.stats) {
                                el.textContent = p.stats[GLOBAL_ABBR.STATS_KEY_TEAM_HEALING]
                            } else {
                                el.textContent = "0"
                            }
                            player.appendChild(el);
                            pages[page_idx["healing"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "own_healing"]);
                            if (GLOBAL_ABBR.STATS_KEY_OWN_HEALING in p.stats) {
                                el.textContent = p.stats[GLOBAL_ABBR.STATS_KEY_OWN_HEALING]
                            } else {
                                el.textContent = "0"
                            }
                            player.appendChild(el);
                            pages[page_idx["healing"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "minor_pickups"]);
                            if (GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS in p.stats) {
                                el.textContent = p.stats[GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS]
                            } else {
                                el.textContent = "0"
                            }
                            player.appendChild(el);
                            pages[page_idx["pickups"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "major_pickups"]);
                            if (GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS in p.stats) {
                                el.textContent = p.stats[GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS]
                            } else {
                                el.textContent = "0"
                            }
                            player.appendChild(el);
                            pages[page_idx["pickups"]].push(el)
                        }
                        if (on_match_finish) {
                            let el = _createElement("div", ["value", "commend"]);
                            if (!is_self && p.user_id in player_lookup && global_self.user_id in player_lookup && player_lookup[p.user_id].party != player_lookup[global_self.user_id].party) {
                                let commend = _createElement("div", "commend_action");
                                commend.addEventListener("click", (function(e) {
                                    e.stopPropagation();
                                    if (commend.classList.contains("commended")) return;
                                    _play_click1();
                                    commend.classList.add("commended");
                                    send_string(CLIENT_COMMAND_COMMEND, p.user_id)
                                }));
                                el.appendChild(commend)
                            }
                            player.appendChild(el)
                        }
                        player.addEventListener("click", (() => {
                            create_player_stats(p, true)
                        }));
                        team.appendChild(player);
                        count++
                    }
                }
                if (count < max_team_size) {
                    for (let i = count; i < max_team_size; i++) {
                        let player = _createElement("div", ["player", "empty"]);
                        let class_div = _createElement("div", "avatar");
                        class_div.appendChild(_createElement("div", "image"));
                        player.appendChild(class_div);
                        player.appendChild(_createElement("div", "name", localize("empty_slot")));
                        player.appendChild(_createElement("div", ["value", "kills"]));
                        player.appendChild(_createElement("div", ["value", "deaths"]));
                        player.appendChild(_createElement("div", ["value", "assists"]));
                        if (show_loadout) {
                            let el = _createElement("div", ["value", "abilities"]);
                            for (let i = 0; i < min_ability_count; i++) {
                                el.appendChild(_createElement("div", "icon"))
                            }
                            player.appendChild(el);
                            pages[page_idx["loadout"]].push(el)
                        }
                        if (show_loadout) {
                            let el = _createElement("div", ["value", "weapons"]);
                            for (let i = 0; i < min_weapon_count; i++) {
                                el.appendChild(_createElement("div", "icon"))
                            }
                            player.appendChild(el);
                            pages[page_idx["loadout"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "score"]);
                            player.appendChild(el);
                            pages[page_idx["damage"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "dmg"]);
                            player.appendChild(el);
                            pages[page_idx["damage"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "dmg_taken"]);
                            player.appendChild(el);
                            pages[page_idx["damage"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "team_healing"]);
                            player.appendChild(el);
                            pages[page_idx["healing"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "own_healing"]);
                            player.appendChild(el);
                            pages[page_idx["healing"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "minor_pickups"]);
                            player.appendChild(el);
                            pages[page_idx["pickups"]].push(el)
                        } {
                            let el = _createElement("div", ["value", "major_pickups"]);
                            player.appendChild(el);
                            pages[page_idx["pickups"]].push(el)
                        }
                        if (on_match_finish) {
                            player.appendChild(_createElement("div", ["value", "commend"]))
                        }
                        team.appendChild(player)
                    }
                }
                scoreboard.appendChild(team)
            }
            html.scoreboard.appendChild(scoreboard);
            let buttons = _createElement("div", "buttons");
            let left_controller = _createElement("div", ["nav_info", "back", "controller_element"], "LT");
            let left_kbm = _createElement("div", ["nav_info", "back", "kbm_element"], "");
            let right_controller = _createElement("div", ["nav_info", "forward", "controller_element"], "RT");
            let right_kbm = _createElement("div", ["nav_info", "forward", "kbm_element"], "");
            let page = _createElement("div", "page", "1 / " + Object.keys(pages).length);
            buttons.appendChild(left_controller);
            buttons.appendChild(left_kbm);
            buttons.appendChild(page);
            buttons.appendChild(right_kbm);
            buttons.appendChild(right_controller);
            html.scoreboard.appendChild(buttons);
            refresh_navigation_elements(buttons);
            for (let page in pages) {
                if (parseInt(page) === current_page) continue;
                for (let el of pages[page]) {
                    el.style.display = "none"
                }
            }

            function change_page() {
                page.textContent = current_page + " / " + Object.keys(pages).length;
                for (let page in pages) {
                    page = parseInt(page);
                    for (let el of pages[page]) {
                        if (page === current_page) {
                            el.style.display = "flex"
                        } else {
                            el.style.display = "none"
                        }
                    }
                }
            }
            left_kbm.addEventListener("click", (() => {
                if (current_page === 1) return;
                current_page--;
                change_page()
            }));
            right_kbm.addEventListener("click", (() => {
                if (current_page === Object.keys(pages).length) return;
                current_page++;
                change_page()
            }));
            _addButtonSounds(left_kbm, 4);
            _addButtonSounds(right_kbm, 4)
        }
        if (player_self) create_player_stats(player_self, false);
        else if (player_first) create_player_stats(player_first, false);
        create_map_vote(on_match_finish);
        Navigation.select_element("game_report_menu", _id("game_report_scoreboard_tab"))
    }

    function create_player_stats(player, show) {
        _empty(html.stats);
        let stats = _createElement("div", "stats");
        stats.appendChild(_createElement("div", "player_name", player.name));
        let weapon_table = _createElement("div", "weapons");
        let weapon_stat_columns = ["frags", "deaths", "dmg_done", "hit", "fired", "accuracy"]; {
            let head = _createElement("div", ["row", "head"]);
            head.appendChild(_createElement("div", "name", localize("settings_tab_weapons")));
            head.appendChild(_createElement("div", "weapon"));
            for (let stat_name of weapon_stat_columns) {
                head.appendChild(_createElement("div", "stat", localize("stats_" + stat_name)))
            }
            weapon_table.appendChild(head)
        }
        if (player.stats && GLOBAL_ABBR.STATS_KEY_WEAPONS in player.stats) {
            for (let s of player.stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {
                let w_data = get_weapon_by_idx(s[GLOBAL_ABBR.STATS_KEY_ITEM_IDX]);
                if (!w_data) continue;
                if (!w_data.selectable) continue;
                let s_frags = s[GLOBAL_ABBR.STATS_KEY_FRAGS] !== undefined ? s[GLOBAL_ABBR.STATS_KEY_FRAGS] : "--";
                let s_deaths = s[GLOBAL_ABBR.STATS_KEY_DEATHS_FROM] !== undefined ? s[GLOBAL_ABBR.STATS_KEY_DEATHS_FROM] : "--";
                let s_dmg_i = s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] !== undefined ? s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] : "--";
                let s_dmg_t = s[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] !== undefined ? s[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] : "--";
                let s_shots_h = s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined ? s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] : "--";
                let s_shots_f = s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined ? s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] : "--";
                let s_acc = "--";
                if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined && s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) {
                    if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] > 0) {
                        s_acc = Math.round(s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] / s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] * 100)
                    } else {
                        s_acc = 0
                    }
                }
                if (!s[GLOBAL_ABBR.STATS_KEY_FRAGS] && !s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] && !s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] && !s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED]) {
                    continue
                }
                let row = _createElement("div", "row");
                row.appendChild(_createElement("div", "name", localize(w_data.i18n)));
                let weapon = _createElement("div", "weapon");
                let icon = _createElement("div", "icon");
                icon.style.backgroundImage = "url(" + w_data.icon_path2 + ")";
                weapon.appendChild(icon);
                row.appendChild(weapon);
                for (let stat_name of weapon_stat_columns) {
                    let stat = _createElement("div", "stat");
                    if (stat_name === "frags") stat.textContent = s_frags;
                    if (stat_name === "deaths") stat.textContent = s_deaths;
                    if (stat_name === "dmg_done") stat.textContent = s_dmg_i;
                    if (stat_name === "dmg_taken") stat.textContent = s_dmg_t;
                    if (stat_name === "hit") stat.textContent = s_shots_h;
                    if (stat_name === "fired") stat.textContent = s_shots_f;
                    if (stat_name === "accuracy") stat.textContent = s_acc + "%";
                    row.appendChild(stat)
                }
                weapon_table.appendChild(row)
            }
        }
        stats.appendChild(weapon_table);
        html.stats.appendChild(stats); {
            let count = 0;
            let other_cont = _createElement("div", "stats_cont");
            other_cont.appendChild(_createElement("div", "title", localize("stats")));
            let other_stats = [GLOBAL_ABBR.STATS_KEY_TEAM_HEALING, GLOBAL_ABBR.STATS_KEY_OWN_HEALING, GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED, GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN, GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS, GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS];
            for (let stat of other_stats) {
                let other_stat = _createElement("div", "single_stat");
                let label = _createElement("div", "label");
                other_stat.appendChild(label);
                if (stat == GLOBAL_ABBR.STATS_KEY_TEAM_HEALING) label.textContent = localize("stats_team_healing");
                else if (stat == GLOBAL_ABBR.STATS_KEY_OWN_HEALING) label.textContent = localize("stats_own_healing");
                else if (stat == GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED) label.textContent = localize("stats_dmg_done");
                else if (stat == GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN) label.textContent = localize("stats_dmg_taken");
                else if (stat == GLOBAL_ABBR.STATS_KEY_COLLECTED_ORBS) label.textContent = localize("stats_minor_pickups");
                else if (stat == GLOBAL_ABBR.STATS_KEY_COLLECTED_MAJOR_ORBS) label.textContent = localize("stats_major_pickups");
                let value = _createElement("div", "count");
                other_stat.appendChild(value);
                if (player.stats.hasOwnProperty(stat)) {
                    value.textContent = player.stats[stat]
                } else {
                    value.textContent = 0
                }
                other_cont.appendChild(other_stat);
                count++
            }
            if (count) {
                stats.appendChild(other_cont)
            }
        }
        if (show) Navigation.select_element("game_report_menu", _id("game_report_stats_tab"))
    }

    function create_map_vote(on_match_finish) {
        _empty(html.maps);
        let map_vote_tab = _id("game_report_map_vote_tab");
        if (last_match.snafu_data["game_data.continuous"] == 1 && on_match_finish) {
            map_vote_tab.style.display = "flex";
            map_vote_tab.classList.remove("disabled")
        } else {
            map_vote_tab.style.display = "none";
            map_vote_tab.classList.add("disabled")
        }
        let maps = [];
        if (last_match.manifest.map_list && last_match.manifest.map_list.length) maps = last_match.manifest.map_list;
        let valid_maps = [];
        for (let m of maps) {
            if (m[0] == last_match.snafu_data["game_data.map"]) {
                valid_maps.push(m);
                break
            }
        }
        for (let m of maps) {
            if (m[0] == last_match.snafu_data["game_data.map"]) continue;
            valid_maps.push(m)
        }
        html.maps.appendChild(create_map_list(valid_maps, "vote"))
    }

    function create_map_list(valid_maps, type) {
        let map_list = _createElement("div", "map_list");
        if (valid_maps.length <= 3) {
            map_list.style.setProperty("--map_row_count", "" + 3)
        } else if (valid_maps.length == 4) {
            map_list.style.setProperty("--map_row_count", "" + 2)
        } else if (valid_maps.length > 4) {
            map_list.style.setProperty("--map_row_count", "" + 3)
        }
        for (let map of valid_maps) {
            let map_cont = _createElement("div", ["vote_option_cont", "hidden"]);
            let map_div = _createElement("div", ["map", "vote_option", "rotate_in"]);
            map_div.dataset.option = map[0];
            let image_div = _createElement("div", "image");
            image_div.style.backgroundImage = 'url("map-thumbnail://' + map[0] + '")';
            map_div.appendChild(image_div);
            let info_div = _createElement("div", "info");
            if (type === "vote") {
                let vote_count_div = _createElement("div", "vote_count");
                vote_count_div.appendChild(_createElement("div", "checkmark"));
                vote_count_div.appendChild(_createElement("div", "count", 0));
                info_div.appendChild(vote_count_div)
            }
            info_div.appendChild(_createElement("div", "name", _format_map_name(map[0], map[1])));
            let selection = _createElement("div", "selection");
            let circle = _createElement("div", "circle");
            selection.appendChild(circle);
            info_div.appendChild(selection);
            map_div.appendChild(info_div);
            if (type === "vote") {
                map_div.classList.add("enabled");
                map_div.addEventListener("click", (function() {
                    _play_click1();
                    let prev = map_list.querySelector(".selected");
                    if (prev) prev.classList.remove("selected");
                    circle.classList.add("selected");
                    send_string(CLIENT_COMMAND_SELECT_MAP, map[0])
                }));
                map_div.addEventListener("mouseenter", (() => {
                    _play_hover2()
                }));
                map_div.addEventListener("animationend", (e => {
                    if (e.animationName === "vote_option_rotate_in") {
                        map_div.classList.remove("rotate_in")
                    }
                }))
            }
            map_cont.appendChild(map_div);
            map_list.appendChild(map_cont)
        }
        return map_list
    }

    function rematch_reset_option() {
        rematch_requested = false;
        if (!rematch_enabled) {
            html.btn_rematch.style.display = "none"
        } else {
            html.btn_rematch.classList.remove("requested");
            html.btn_rematch.classList.remove("accepted");
            let checkmark = html.btn_rematch.querySelector(".checkmark");
            if (checkmark) checkmark.classList.remove("requested");
            let total_players = Number(last_match.snafu_data["game_data.team_count"]) * Number(last_match.snafu_data["game_data.team_size"]);
            rematch_set_state(total_players, 0);
            html.btn_rematch.style.display = "flex"
        }
    }

    function rematch_update(data) {
        rematch_set_state(data.required_requests, data.requests);
        let checkmark = html.btn_rematch.querySelector(".status .checkmark");
        if (data.accepted) {
            html.btn_rematch.classList.add("accepted");
            html.countdown_text.textContent = localize("report_next_map_in")
        } else {
            html.btn_rematch.classList.remove("accepted");
            html.countdown_text.textContent = localize("report_leaving_game_in");
            if (data.self_requested) {
                checkmark.classList.add("requested")
            } else {
                checkmark.classList.remove("requested")
            }
        }
    }

    function rematch_set_state(total, accepted) {
        let rematch_state = html.btn_rematch.querySelector(".status .count");
        rematch_state.textContent = accepted + "/" + total;
        for (let i = 0; i < total; i++) {
            if (i < accepted) {
                html.btn_rematch.classList.add("accepted")
            } else {
                html.btn_rematch.classList.remove("accepted")
            }
        }
    }
    this.rematch = () => {
        if (!rematch_requested) {
            rematch_requested = true;
            let checkmark = html.btn_rematch.querySelector(".checkmark");
            if (checkmark) checkmark.classList.add("requested");
            let map_vote_tab = _id("game_report_map_vote_tab");
            map_vote_tab.style.display = "flex";
            Navigation.select_element("game_report_menu", map_vote_tab);
            send_string(CLIENT_COMMAND_REQUEST_REMATCH)
        }
    };
    this.requeue = () => {
        engine.call("requeue")
    };

    function show_game_report(visible, instant) {
        if (visible) console.log("show_game_report", visible);
        report_active = visible;
        if (visible) {
            open_ingame_screen("game_report", instant, true);
            Navigation.set_override_active("hud", {
                lb_rb: "game_report_menu"
            })
        } else {
            set_modal_engine_call(false, false, true);
            close_ingame_screen(instant, html.root.id);
            Navigation.set_override_inactive("hud")
        }
    }
    this.is_active = () => report_active;
    this.close = () => {
        show_game_report(false, false)
    };
    this.get_last_match = () => {
        if (last_matches.length) {
            return last_matches[0]
        }
        return null
    };
    this.report_user = () => {
        let match_id = last_match.game_status.match_id;
        if (!match_id) return;
        let unique_clients = {};
        for (let c of last_match.snafu_data.players) {
            unique_clients[c.user_id] = c.name
        }
        for (let c of last_match.master_data.disconnected_clients) {
            unique_clients[c.user_id] = c.name
        }
        let clients = [];
        for (let user_id in unique_clients) {
            clients.push(user_id)
        }
        clients.sort(((a, b) => {
            if (unique_clients[a] > unique_clients[b]) return -1;
            else return 1
        }));
        let report_cont = _createElement("div", "report_cont");
        let select_user = _createElement("div", "select-field");
        select_user.dataset.theme = "rogue_custom";
        let default_selected = false;
        for (let user_id of clients) {
            if (global_self.user_id === user_id) continue;
            let opt = _createElement("div");
            opt.dataset.value = user_id;
            opt.textContent = unique_clients[user_id];
            if (!default_selected) {
                opt.dataset.selected = 1;
                default_selected = true
            }
            select_user.appendChild(opt)
        }
        setup_select(select_user);
        let select_reason = _createElement("div", "select-field");
        select_reason.dataset.theme = "rogue_custom";
        for (let reason of global_report_reasons) {
            let opt = _createElement("div");
            opt.dataset.value = reason.id;
            opt.textContent = localize(reason.i18n);
            if (reason.id == 0) opt.dataset.selected = 1;
            select_reason.appendChild(opt)
        }
        setup_select(select_reason);
        let title = _createElement("div", "", localize("report_title"));
        let table = _createElement("div", "table");
        let left_column = _createElement("div", ["column", "left"]);
        left_column.appendChild(_createElement("div", ["row", "label", "odd"], localize("report_label_player_name")));
        left_column.appendChild(_createElement("div", ["row", "label"], localize("report_label_reason")));
        left_column.appendChild(_createElement("div", ["row", "label", "odd"], localize("report_label_additional_info")));
        let right_column = _createElement("div", ["column", "right"]);
        let name_row = _createElement("div", ["row", "data", "odd"]);
        name_row.appendChild(select_user);
        right_column.appendChild(name_row);
        let reason_row = _createElement("div", ["row", "data"]);
        reason_row.appendChild(select_reason);
        right_column.appendChild(reason_row);
        right_column.appendChild(_createElement("div", ["row", "data", "odd"]));
        table.appendChild(left_column);
        table.appendChild(right_column);
        report_cont.appendChild(table);
        let info_text = _createElement("textarea", "info_text");
        info_text.maxLength = 160;
        report_cont.appendChild(info_text);
        let btn_cont = _createElement("div", "generic_modal_dialog_action");
        let btn_send = _createElement("div", "dialog_button", localize("menu_button_send"));
        let btn_cancel = _createElement("div", "dialog_button", localize("menu_button_cancel"));
        _addButtonSounds(btn_send, 1);
        _addButtonSounds(btn_cancel, 1);
        btn_send.addEventListener("click", (function() {
            _empty(report_cont);
            _empty(btn_cont);
            title.textContent = localize("report_thank_you");
            btn_close = _createElement("div", "dialog_button", localize("modal_close"));
            btn_close.addEventListener("click", closeBasicModal);
            _addButtonSounds(btn_close, 1);
            btn_cont.appendChild(btn_close);
            send_json_data({
                action: "report-user",
                match_id: match_id,
                reported_user_id: select_user.dataset.value,
                reason_id: select_reason.dataset.value,
                reason_text: info_text.value
            })
        }));
        btn_cancel.addEventListener("click", closeBasicModal);
        btn_cont.appendChild(btn_send);
        btn_cont.appendChild(btn_cancel);
        openBasicModal(basicGenericModal(title, report_cont, btn_cont), (() => {
            close_menu()
        }));
        engine.call("show_menu_screen", "basic_modal")
    }
};