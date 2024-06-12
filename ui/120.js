new MenuScreen({
    game_id: GAME.ids.ROGUE,
    name: "play_rogue",
    screen_element: _id("play_screen_rogue"),
    button_element: null,
    fullscreen: false,
    init: () => {
        page_play_rogue.init()
    },
    open_handler: params => {
        historyPushState({
            page: "play_rogue"
        });
        set_blur(true);
        page_play_rogue.on_open(params)
    },
    close_handler: () => {
        set_blur(false)
    }
});
const page_play_rogue = new function() {
    let html = {
        root: null,
        sub_screen_menu: null,
        screen_actions: null,
        matchmaking: null,
        custom_games: null,
        cards: null,
        search_btn: null,
        queue_circles: {},
        custom_scroll: null,
        custom_list: null,
        custom_match: null
    };
    let custom = {
        list: [],
        list_ts: 0,
        list_requesting: false,
        list_requesting_page: 0,
        list_requesting_ts: 0,
        list_page: 0,
        list_max_reached: false,
        list_updating: false,
        selected_el: null,
        selected: null
    };
    let selected_mode_count = 0;
    let expired_sessions = {};
    let tab_map = {
        current_tab: "play_screen_rogue_matchmaking_tab",
        current_scroll: null,
        cb: function(el, tab, previous_el, previous_tab, optional_params) {},
        play_screen_rogue_matchmaking_tab: {
            content: "play_screen_rogue_matchmaking",
            short: "matchmaking",
            scroll: null,
            nav: null,
            cb: () => {
                render_screen_actions("matchmaking");
                request_queue_stats();
                update_queue_stats()
            }
        },
        play_screen_rogue_custom_games_tab: {
            content: "play_screen_rogue_custom_games",
            short: "custom",
            scroll: null,
            nav: null,
            cb: () => {
                if (custom.list_ts < Date.now() - 5e3 && !(custom.list_requesting && custom.list_requesting_page === 0)) {
                    refresh_custom_list()
                } else {
                    render_custom_list()
                }
                render_screen_actions("custom")
            }
        }
    };

    function tab_selected(element, action) {
        set_tab(tab_map, element)
    }
    this.init = () => {
        html.root = _id("play_screen_rogue");
        html.sub_screen_menu = html.root.querySelector(".sub_screen_menu");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        html.matchmaking = _id("play_screen_rogue_matchmaking");
        html.custom_games = _id("play_screen_rogue_custom_games");
        html.cards = _get_first_with_class_in_parent(html.matchmaking, "cards");
        html.search_btn = html.matchmaking.querySelector(".controls .start");
        html.custom_scroll = html.custom_games.querySelector(".matchlist .scroll-outer");
        html.custom_list = html.custom_games.querySelector(".matchlist .scroll-inner");
        html.custom_match = html.custom_games.querySelector(".match");
        let first_sub_menu_option = html.root.querySelector(".sub_screen_menu_option");
        Navigation.generate_nav({
            name: "play_screen_rogue_menu",
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
        Navigation.select_element("play_screen_rogue_menu", first_sub_menu_option);
        mode_update_handlers.push(((modes, queues) => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            this.render_cards();
            this.update_mm_search_btn()
        }));
        global_on_ms_disconnected.push((() => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            if (global_menu_page === "play_rogue") {
                historyBack()
            }
        }));
        party_status_handlers.push(((party_changed, party, removed) => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            this.update_valid_mm_modes();
            this.update_selected_mm_modes()
        }));
        party_mode_update_handlers.push((party => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            this.update_valid_mm_modes();
            this.update_selected_mm_modes()
        }));
        mm_queue_event_handlers.push((msg => {
            if (GAME.active !== GAME.ids.ROGUE) return
        }));
        mm_queue_event_handlers.push((() => {
            this.update_mm_search_btn()
        }));
        mm_event_handlers.push((data => {}));
        party_leader_update_handlers.push(((leader_status_changed, bool_am_i_leader) => {
            if (bool_am_i_leader) {
                if (html.search_btn) html.search_btn.classList.remove("hidden")
            } else {
                if (html.search_btn) html.search_btn.classList.add("hidden")
            }
        }));
        global_ms.addPermanentResponseHandler("custom-list", (data => {
            if (custom.list_requesting_page === 0 && data.page !== 0) return;
            custom.list_requesting = false;
            custom.list_ts = Date.now();
            custom.list_updating = true;
            let list = unflattenData(data.list);
            if (data.page === 0) {
                custom.list = list
            } else {
                custom.list.push(...list)
            }
            if (!data.list.length) {
                custom.list_max_reached = true;
                return
            }
            if (data.page !== 0) {
                render_custom_list_page(list)
            } else {
                render_custom_list()
            }
            setTimeout((() => {
                custom.list_updating = false
            }), 250)
        }));
        global_ms.addPermanentResponseHandler("info-msg", (data => {
            if (custom.selected && (data === "custom_session_expired" || data === "custom_match_expired")) {
                for (let session_id in expired_sessions) {
                    if (Date.now() - expired_sessions[session_id] > 120 * 1e3) {
                        delete expired_sessions[session_id]
                    }
                }
                expired_sessions[custom.selected.session_id] = Date.now();
                if (custom.selected_el && custom.selected_el.parentNode) {
                    custom.selected_el.parentNode.removeChild(custom.selected_el);
                    custom.selected_el = null
                }
                unselect_custom_match()
            }
        }));
        on_queue_stats_update.push((stats => {
            update_queue_stats()
        }));
        html.custom_list.addEventListener("scroll", (event => {
            const threshold = 150;
            const containerHeight = event.target.getBoundingClientRect().height;
            const windowBottom = event.target.scrollTop + containerHeight;
            if (!custom.list_requesting && !custom.list_max_reached && !custom.list_updating && windowBottom > event.target.scrollHeight - threshold) {
                get_next_custom_list_page()
            }
        }))
    };
    this.on_open = params => {
        unselect_custom_match();
        if (params && "page" in params) {
            if (params.page === "matchmaking") {
                Navigation.select_element("play_screen_rogue_menu", _id("play_screen_rogue_matchmaking_tab"))
            } else if (params.page === "custom") {
                Navigation.select_element("play_screen_rogue_menu", _id("play_screen_rogue_custom_games_tab"))
            }
        }
        Navigation.set_active({
            lb_rb: "play_screen_rogue_menu"
        });
        let selection_type = GAME.get_data("location_selection_type");
        if (selection_type === 1 && Servers.selected_locations.size === 0 || selection_type > 1 && Servers.selected_regions.size === 0) {
            open_modal_screen("region_select_modal_screen", null, 1e3)
        }
        if (tab_map.current_tab === "play_screen_rogue_custom_games_tab") {
            if (custom.list_ts < Date.now() - 5e3 && !custom.list_requesting) {
                refresh_custom_list()
            } else {
                render_custom_list()
            }
        }
        render_screen_actions(tab_map[tab_map.current_tab].short)
    };

    function update_queue_stats() {
        let counts = html.cards.querySelectorAll(".card .count .value");
        for (let c of counts) {
            let total_playing = 0;
            if (queue_stats && c.dataset.mode_key && c.dataset.mode_key in queue_stats) {
                for (let region in queue_stats[c.dataset.mode_key]) {
                    if (region === "total") {
                        total_playing = 0;
                        if ("s" in queue_stats[c.dataset.mode_key]["total"]) total_playing += queue_stats[c.dataset.mode_key]["total"].s;
                        if ("p" in queue_stats[c.dataset.mode_key]["total"]) total_playing += queue_stats[c.dataset.mode_key]["total"].p;
                        break
                    }
                    if (Servers.selected_regions.has(region)) {
                        let region_total = 0;
                        if ("s" in queue_stats[c.dataset.mode_key][region]) region_total += queue_stats[c.dataset.mode_key][region].s;
                        if ("p" in queue_stats[c.dataset.mode_key][region]) region_total += queue_stats[c.dataset.mode_key][region].p;
                        if (region_total > total_playing) total_playing = region_total
                    }
                }
            }
            c.textContent = total_playing;
            if (total_playing) {
                c.parentElement.classList.add("visible")
            } else {
                c.parentElement.classList.remove("visible")
            }
        }
    }

    function render_screen_actions(tab) {
        let actions = [global_action_buttons.back];
        if (tab === "matchmaking") {
            actions.unshift({
                i18n: "datacenters",
                kbm_bind: "D",
                controller_bind: "B",
                callback: () => {
                    open_modal_screen("region_select_modal_screen")
                }
            })
        }
        if (page_game_report) {
            let last_match = page_game_report.get_last_match();
            if (last_match) {
                actions.unshift({
                    i18n: "last_match",
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
        if (tab === "custom") {
            actions.unshift({
                i18n: "menu_button_refresh",
                kbm_bind: "R",
                controller_bind: "",
                callback: () => {
                    refresh_custom_list()
                }
            });
            actions.unshift({
                i18n: "customlist_create_lobby",
                kbm_bind: "C",
                controller_bind: "Y",
                callback: () => {
                    if (!Lobby.in_lobby()) {
                        Lobby.create()
                    } else {
                        open_screen("custom")
                    }
                }
            });
            actions.unshift({
                i18n: "customlist_join_with_key",
                kbm_bind: "J",
                controller_bind: "",
                callback: () => {
                    lobby_join_with_key()
                }
            })
        }
        Navigation.render_actions(actions, html.screen_actions)
    }
    this.render_cards = () => {
        html.queue_circles = {};
        _empty(html.cards);
        let mode_map = GAME.get_data("game_mode_map");
        let card_modes = [];
        for (let queue of global_active_queues) {
            if (!(queue.mode_key in global_mode_definitions)) continue;
            let md = global_mode_definitions[queue.mode_key];
            if (!(md.mode_name in mode_map)) continue;
            let enabled = true;
            if (!md.enabled) enabled = false;
            if (!mode_map[md.mode_name].enabled) enabled = false;
            card_modes.push({
                type: "queue",
                mode_key: md.mode_key,
                enabled: enabled,
                i18n: mode_map[md.mode_name].i18n,
                desc_i18n: mode_map[md.mode_name].desc_i18n,
                vs: getVS(md.team_count, md.team_size),
                mode_name: md.mode_name
            })
        }
        if ("warmup" in mode_map) {
            card_modes.push({
                type: "warmup",
                mode_key: "",
                enabled: true,
                i18n: mode_map["warmup"].i18n,
                desc_i18n: mode_map["warmup"].desc_i18n,
                vs: getVS(2, 16),
                mode_name: "warmup"
            })
        }
        let idx = 0;
        for (let card_mode of card_modes) {
            let locked = false;
            if (!card_mode.enabled) locked = true;
            let card = _createElement("div", ["card"]);
            if (card_modes.length <= 2) {
                card.classList.add("big")
            } else if (idx === 0) {
                card.classList.add("big")
            }
            card.dataset.mode_key = card_mode.mode_key;
            let image = _createElement("div", "image");
            card.appendChild(image);
            let info = _createElement("div", "info");
            let title = _createElement("div", "title");
            if (locked) {
                title.appendChild(_createElement("div", "mode", localize("locked")))
            } else {
                title.appendChild(_createElement("div", "mode", localize(card_mode.i18n)))
            }
            let desc = _createElement("div", "desc", localize(card_mode.desc_i18n));
            info.appendChild(title);
            info.appendChild(desc);
            if (card_mode.type === "warmup" || card_mode.mode_key in global_mode_definitions && global_mode_definitions[card_mode.mode_key].mode_name === "rogue_wipeout") {
                let vs = _createElement("div", "vs");
                vs.appendChild(_createElement("div", "icon"));
                vs.appendChild(_createElement("div", "text", card_mode.vs));
                info.appendChild(vs)
            }
            if (card_mode.mode_name in mode_map && mode_map[card_mode.mode_name].rules && mode_map[card_mode.mode_name].rules.length) {
                let rules_button = _createElement("div", "rules_button");
                rules_button.appendChild(_createElement("div", "icon"));
                rules_button.appendChild(_createElement("div", "text", localize("rules")));
                info.appendChild(rules_button);
                rules_button.addEventListener("click", (e => {
                    e.stopPropagation();
                    let mode_name = localize(card_mode.i18n);
                    if (card_mode.mode_name in mode_map) mode_name = localize(mode_map[card_mode.mode_name].i18n);
                    let rules_title = localize_ext("mode_rules", {
                        mode_name: mode_name
                    });
                    let rules_div = _createElement("div", "mode_rules");
                    for (let i = 0; i < mode_map[card_mode.mode_name].rules.length; i++) {
                        let row = _createElement("div", "row");
                        row.appendChild(_createElement("div", "icon", i + 1));
                        row.appendChild(_createElement("div", "text", localize(mode_map[card_mode.mode_name].rules[i])));
                        rules_div.appendChild(row);
                        if (i === mode_map[card_mode.mode_name].rules.length - 1) {
                            row.classList.add("last")
                        }
                    }
                    updateBasicModalContent(basicGenericModal(rules_title, rules_div, localize("modal_close")));
                    open_modal_screen("basic_modal")
                }))
            }
            card.appendChild(info);
            let count = _createElement("div", "count");
            count.appendChild(_createElement("div", "icon"));
            let value = _createElement("div", "value");
            value.dataset.mode_key = card_mode.mode_key;
            count.appendChild(value);
            card.appendChild(count);
            if (card_mode.type === "queue") {
                let selection = _createElement("div", "selection");
                let circle = _createElement("div", "circle");
                card.classList.add("queue");
                if (locked) circle.classList.add("locked");
                else card.classList.add("enabled");
                if (global_party.modes.includes(card_mode.mode_key)) {
                    circle.classList.add("selected")
                }
                selection.appendChild(circle);
                info.appendChild(selection);
                if (card_mode.mode_key in global_mode_definitions && global_mode_definitions[card_mode.mode_key].mode_name in mode_map) {
                    if (mode_map[global_mode_definitions[card_mode.mode_key].mode_name].image.length) {
                        image.style.backgroundImage = "url(" + mode_map[global_mode_definitions[card_mode.mode_key].mode_name].image + ")"
                    }
                }
                html.queue_circles[card_mode.mode_key] = circle;
                card.addEventListener("click", (() => {
                    if (global_mm_searching) return;
                    if (!card.classList.contains("enabled")) return;
                    if (!bool_am_i_leader) return;
                    if (circle.classList.contains("selected")) {
                        circle.classList.remove("selected")
                    } else {
                        circle.classList.add("selected")
                    }
                    this.send_selected_mm_modes()
                }))
            } else if (card_mode.type === "warmup") {
                let overlay = _createElement("div", "overlay");
                let text = _createElement("div", "text", "You can join the warm-up even while queuing for other modes");
                let btn = _createElement("div", "btn-style-2", localize("menu_warmup"));
                overlay.appendChild(text);
                overlay.appendChild(btn);
                card.appendChild(overlay);
                if ("warmup" in mode_map) {
                    if (mode_map["warmup"].image.length) {
                        image.style.backgroundImage = "url(" + mode_map["warmup"].image + ")"
                    }
                }
                card.addEventListener("mouseenter", (() => {
                    overlay.classList.add("visible")
                }));
                card.addEventListener("mouseleave", (() => {
                    overlay.classList.remove("visible")
                }));
                btn.addEventListener("click", (() => {
                    this.join_warmup()
                }))
            }
            card.addEventListener("mouseenter", (() => {
                if (!card.classList.contains("enabled")) return;
                _play_hover2()
            }));
            card.addEventListener("click", (() => {
                if (!card.classList.contains("enabled")) return;
                _play_click1()
            }));
            html.cards.appendChild(card);
            idx++
        }
        this.send_selected_mm_modes()
    };
    this.update_valid_mm_modes = () => {
        let mode_map = GAME.get_data("game_mode_map");
        for (let mode_key in html.queue_circles) {
            let enabled = true;
            if (!(mode_key in global_mode_definitions) || !global_mode_definitions[mode_key].enabled || !(global_mode_definitions[mode_key].mode_name in mode_map) || !mode_map[global_mode_definitions[mode_key].mode_name].enabled) {
                enabled = false
            }
            if (!global_party["valid-modes"].includes(mode_key)) enabled = false;
            let card = html.queue_circles[mode_key].closest(".card");
            if (enabled) {
                card.classList.add("enabled");
                html.queue_circles[mode_key].classList.remove("locked")
            } else {
                card.classList.remove("enabled");
                html.queue_circles[mode_key].classList.add("locked")
            }
        }
    };
    this.update_selected_mm_modes = () => {
        let count = 0;
        for (let mode_key in html.queue_circles) {
            if (global_party.modes.includes(mode_key)) {
                html.queue_circles[mode_key].classList.add("selected");
                count++
            } else {
                html.queue_circles[mode_key].classList.remove("selected")
            }
        }
        selected_mode_count = count;
        this.update_mm_search_btn()
    };
    this.update_mm_search_btn = () => {
        if (html.search_btn) {
            let label = html.search_btn.querySelector(".label");
            if (global_mm_searching) {
                html.search_btn.classList.remove("disabled");
                label.textContent = localize("menu_cancel_search")
            } else {
                if (selected_mode_count == 0) {
                    html.search_btn.classList.add("disabled");
                    label.textContent = localize("menu_select_mode")
                } else {
                    html.search_btn.classList.remove("disabled");
                    label.textContent = localize("menu_find_match")
                }
            }
        }
    };
    this.send_selected_mm_modes = () => {
        let modes = [];
        for (let mode_key in html.queue_circles) {
            if (html.queue_circles[mode_key].classList.contains("selected")) {
                modes.push(mode_key)
            }
        }
        queue_mode_update_id++;
        send_json_data({
            action: "party-set-modes",
            modes: modes,
            update_id: queue_mode_update_id
        })
    };
    this.join_warmup = () => {
        engine.call("reset_inactivity_timer");
        send_string(CLIENT_COMMAND_JOIN_WARMUP, "s")
    };
    this.toggle_search = () => {
        if (!bool_am_i_leader) return;
        mm_toggle_queue()
    };

    function render_custom_list_match(fragment, m) {
        let ping_str = "N/A";
        if (global_datacenter_map.hasOwnProperty(m.location) && Servers.locations.hasOwnProperty(m.location)) {
            if (Servers.locations[m.location].ping !== -1) {
                ping_str = Math.floor(Number(Servers.locations[m.location].ping) * 1e3)
            }
        }
        let mode_name = "";
        const mode_data = GAME.get_data("game_mode_map", m.mode);
        if (mode_data) mode_name = localize(mode_data.i18n);
        else mode_name = m.mode;
        if (m.team_count === 2) {
            mode_name += " " + m.team_size + "v" + m.team_size
        }
        let match = _createElement("div", "custom_match");
        match.appendChild(_createElement("div", "name", m.name));
        match.appendChild(_createElement("div", "mode", mode_name));
        match.appendChild(_createElement("div", "map", _format_map_name(m.map, m.map_name)));
        match.appendChild(_createElement("div", "players", m.client_count + "/" + m.max_clients));
        match.appendChild(_createElement("div", "ping", ping_str));
        fragment.appendChild(match);
        match.addEventListener("click", (() => {
            if (match.classList.contains("selected")) {
                unselect_custom_match()
            } else {
                select_custom_match(match, m)
            }
        }));
        if (custom.selected && custom.selected.session_id === m.session_id) {
            select_custom_match(match, m)
        }
    }

    function render_custom_list() {
        _empty(html.custom_list);
        let fragment = new DocumentFragment;
        for (let m of custom.list) {
            if (m.session_id in expired_sessions) continue;
            render_custom_list_match(fragment, m)
        }
        html.custom_list.appendChild(fragment);
        refreshScrollbar(html.custom_scroll);
        resetScrollbar(html.custom_scroll)
    }

    function render_custom_list_page(list) {
        let fragment = new DocumentFragment;
        for (let m of list) {
            if (m.session_id in expired_sessions) continue;
            render_custom_list_match(fragment, m)
        }
        html.custom_list.appendChild(fragment);
        refreshScrollbar(html.custom_scroll)
    }

    function refresh_custom_list() {
        if (custom.list_requesting && Date.now() - custom.list_requesting_ts < 5e3) {
            return
        }
        lock_custom_list();
        custom.list_page = 0;
        custom.list_requesting = true;
        custom.list_requesting_page = custom.list_page;
        custom.list_requesting_ts = Date.now();
        custom.list_max_reached = false;
        send_string(CLIENT_COMMAND_GET_CUSTOM_LIST, custom.list_page)
    }

    function get_next_custom_list_page() {
        custom.list_page++;
        custom.list_requesting = true;
        custom.list_requesting_page = custom.list_page;
        custom.list_requesting_ts = Date.now();
        send_string(CLIENT_COMMAND_GET_CUSTOM_LIST, custom.list_page)
    }

    function select_custom_match(list_element, m) {
        if (custom.selected_el) {
            custom.selected_el.classList.remove("selected")
        }
        custom.selected_el = list_element;
        custom.selected_el.classList.add("selected");
        custom.selected = m;
        let fragment = new DocumentFragment;
        let image = _createElement("div", "image");
        image.style.backgroundImage = `url("map-thumbnail://${m.map}")`;
        fragment.appendChild(image);
        let icon = _createElement("div", "icon");
        icon.appendChild(_createElement("div", "inner"));
        image.appendChild(icon); {
            let region_i18n = "";
            if (m.location in Servers.locations && Servers.locations[m.location].region in global_region_map) {
                region_i18n = global_region_map[Servers.locations[m.location].region].i18n
            }
            let datarow = _createElement("div", "data_row");
            let data_left = _createElement("div", ["data", "left"]);
            data_left.appendChild(_createElement("div", "name", localize("customlist_table_head_name")));
            data_left.appendChild(_createElement("div", "value", m.name));
            datarow.appendChild(data_left);
            let data_right = _createElement("div", ["data", "right"]);
            data_right.appendChild(_createElement("div", "name", localize("customlist_table_head_region")));
            data_right.appendChild(_createElement("div", "value", localize(region_i18n)));
            datarow.appendChild(data_right);
            fragment.appendChild(datarow)
        } {
            let state = "";
            if (m.state == 0 || m.state == 1) {
                state = localize("game_state_warmup")
            } else if (m.state == 2 || m.state == 3 || m.state == 4) {
                let match_time = _seconds_to_digital(m.match_time);
                if (m.start_ts) {
                    match_time = _seconds_to_digital(Math.floor((Date.now() - m.start_ts) / 1e3))
                }
                state = localize("game_state_live") + " - " + match_time
            }
            let datarow = _createElement("div", "data_row");
            let data_left = _createElement("div", ["data", "left"]);
            data_left.appendChild(_createElement("div", "name", localize("game_state")));
            data_left.appendChild(_createElement("div", "value", state));
            datarow.appendChild(data_left);
            let data_right = _createElement("div", ["data", "right"]);
            data_right.appendChild(_createElement("div", "name", localize("customlist_table_head_players")));
            data_right.appendChild(_createElement("div", "value", m.client_count + "/" + m.max_clients));
            datarow.appendChild(data_right);
            fragment.appendChild(datarow)
        }
        let players_scroll = _createElement("div", ["scroll-outer", "theme_rogue_white"]);
        players_scroll.dataset.sbHideEmpty = true;
        players_scroll.dataset.sbOutside = true;
        let players_scroll_bar = _createElement("div", "scroll-bar");
        players_scroll_bar.appendChild(_createElement("div", "scroll-bar-track"));
        players_scroll_bar.appendChild(_createElement("div", "scroll-thumb"));
        players_scroll.appendChild(players_scroll_bar);
        let players_scroll_inner = _createElement("div", "scroll-inner");
        players_scroll.appendChild(players_scroll_inner);
        fragment.appendChild(players_scroll);
        initialize_scrollbar(players_scroll);
        if (m.team_count === 2) {
            let teams = _createElement("div", "teams");
            let team_left = _createElement("div", ["team", "left"]);
            let team_right = _createElement("div", ["team", "right"]);
            team_left.appendChild(_createElement("div", "name", localize_ext("team_with_idx", {
                value: 1
            })));
            team_right.appendChild(_createElement("div", "name", localize_ext("team_with_idx", {
                value: 2
            })));
            for (let c of m.clients) {
                if (c[1] !== 0) continue;
                team_left.appendChild(_createElement("div", "player", c[0]))
            }
            for (let c of m.clients) {
                if (c[1] !== 1) continue;
                team_right.appendChild(_createElement("div", "player", c[0]))
            }
            teams.appendChild(team_left);
            teams.appendChild(team_right);
            players_scroll_inner.appendChild(teams)
        } else {}
        let buttons = _createElement("div", "buttons");
        fragment.appendChild(buttons);
        if (bool_am_i_leader) {
            let join_btn = _createElement("div", ["btn-style-2", "gold", "join"], localize("join"));
            buttons.appendChild(join_btn);
            join_btn.addEventListener("click", (() => {
                let require_pw = false;
                if ("password" in m && m.password) require_pw = true;
                if (require_pw) {
                    let cont = _createElement("div", "custom_password_prompt");
                    let input = _createElement("input", "custom_password_prompt_input");
                    input.setAttribute("type", "password");
                    cont.appendChild(input);
                    input.focus();
                    input.addEventListener("keydown", (function(e) {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            join_custom_session(m.session_id, input.value);
                            close_modal_screen_by_selector("generic_modal")
                        }
                    }));
                    genericModal(localize("custom_game_settings_password"), cont, localize("menu_button_cancel"), null, localize("menu_button_join"), (function() {
                        join_custom_session(m.session_id, input.value)
                    }))
                } else {
                    join_custom_session(m.session_id, null)
                }
            }))
        }
        _empty(html.custom_match);
        html.custom_match.appendChild(fragment);
        html.custom_match.classList.add("active")
    }

    function unselect_custom_match() {
        if (custom.selected_el) {
            custom.selected_el.classList.remove("selected")
        }
        custom.selected_el = null;
        custom.selected = null;
        _empty(html.custom_match);
        html.custom_match.classList.remove("active")
    }

    function lock_custom_list() {
        for (let match = html.custom_list.firstElementChild; match; match = match.nextElementSibling) {
            match.classList.add("locked")
        }
    }

    function join_custom_session(session_id, password) {
        if (!bool_am_i_leader) return;
        if (!session_id || session_id == -1) return;
        send_string(CLIENT_COMMAND_PARTY_JOIN_SESSION, session_id + " " + password)
    }
};