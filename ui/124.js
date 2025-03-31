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
        page_play_rogue.on_open(params)
    },
    close_handler: () => {
        page_play_rogue.on_close()
    }
});
const page_play_rogue = new function() {
    let html = {
        root: null,
        box_screen_menu: null,
        screen_actions: null,
        matchmaking: null,
        mm_scroll: null,
        mm_list: null,
        mm_item_details: null,
        mm_item_details_content: null,
        mm_btn_search: null,
        mm_btn_search_label: null,
        mm_filter_input: null,
        pickups: null,
        pickup_count: null,
        pickup_scroll: null,
        pickup_list: null,
        pickup_item_details_container: null,
        pickup_item_details: null,
        pickup_item_details_content: null,
        pickup_btn_join: null,
        pickup_btn_leave: null,
        pickup_btn_create: null,
        create_pickup: null,
        custom_games: null,
        custom_scroll: null,
        custom_list: null,
        custom_item_details_container: null,
        custom_item_details: null,
        custom_item_details_content: null,
        custom_btn_join: null,
        custom_btn_create: null
    };
    let selected_mode_count = 0;
    const MAX_MM_MODES_SELECTED = 7;
    let matchmaking = {
        search: "",
        selected: {},
        official_modes: [],
        community_modes: [],
        list_requesting: false,
        list_requesting_page: 0,
        list_requesting_ts: 0,
        list_page: 1,
        list_max_reached: false,
        list_updating: false,
        list_page_max: 15,
        selected_mode_el: null,
        selected_mode: null,
        selected_modes_recieved: false,
        official_modes_recieved: false,
        user_modes_recieved: false
    };
    let pickups = {
        total: 0,
        joined: {},
        list: [],
        list_ts: 0,
        list_requesting: false,
        list_requesting_page: 0,
        list_requesting_ts: 0,
        list_page: 0,
        list_max_reached: false,
        list_updating: false,
        selected_el: null,
        selected: null,
        refresh_interval: null
    };
    let custom = {
        total: 0,
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
    this.print_debug = () => {
        console.log("PLAY: matchmaking", _dump(matchmaking));
        console.log("PLAY: pickups", _dump(pickups));
        console.log("PLAY: custom", _dump(custom))
    };
    let expired_sessions = {};
    let expired_pickups = {};
    let tab_map = {
        current_tab: "play_screen_rogue_matchmaking_tab",
        current_scroll: "play_screen_rogue_mm_list_scroll",
        cb: function(el, tab, previous_el, previous_tab, optional_params) {},
        play_screen_rogue_matchmaking_tab: {
            content: "play_screen_rogue_matchmaking",
            short: "matchmaking",
            scroll: "play_screen_rogue_mm_list_scroll",
            nav: null,
            cb: () => {
                close_create_pickup(false);
                render_screen_actions("matchmaking");
                request_queue_stats();
                update_queue_stats()
            }
        },
        play_screen_rogue_pickups_tab: {
            content: "play_screen_rogue_pickups",
            short: "pickups",
            scroll: "play_screen_rogue_pickup_list_scroll",
            nav: null,
            cb: () => {
                close_create_pickup(false);
                if (pickups.list_ts < Date.now() - 5e3 && !(pickups.list_requesting && pickups.list_requesting_page === 0)) {
                    refresh_pickups_list()
                } else {
                    render_pickups_list()
                }
                render_screen_actions("pickups")
            }
        },
        play_screen_rogue_custom_games_tab: {
            content: "play_screen_rogue_custom_games",
            short: "custom",
            scroll: "play_screen_rogue_custom_list_scroll",
            nav: null,
            cb: () => {
                close_create_pickup(false);
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
        html.box_screen_menu = html.root.querySelector(".box_screen_menu");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        html.matchmaking = _id("play_screen_rogue_matchmaking");
        html.pickups = _id("play_screen_rogue_pickups");
        html.create_pickup = _id("play_screen_rogue_create_pickup");
        html.custom_games = _id("play_screen_rogue_custom_games");
        html.mm_scroll = html.matchmaking.querySelector(".table .scroll-outer");
        html.mm_list = html.matchmaking.querySelector(".table .scroll-inner");
        html.mm_item_details = html.matchmaking.querySelector(".details");
        html.mm_item_details_content = html.matchmaking.querySelector(".details_content");
        html.mm_btn_search = html.matchmaking.querySelector(".controls .start");
        html.mm_btn_search_label = html.mm_btn_search.querySelector(".label");
        html.mm_filter_input = html.matchmaking.querySelector(".filter input");
        html.pickup_count = html.root.querySelector("#play_screen_rogue_pickups_tab .count");
        html.pickup_scroll = html.pickups.querySelector(".table .scroll-outer");
        html.pickup_list = html.pickups.querySelector(".table .scroll-inner");
        html.pickup_item_details_container = html.pickups.querySelector(".list_item_details");
        html.pickup_item_details = html.pickups.querySelector(".details");
        html.pickup_item_details_content = html.pickups.querySelector(".details_content");
        html.pickup_btn_join = html.pickups.querySelector(".join");
        html.pickup_btn_leave = html.pickups.querySelector(".leave");
        html.pickup_btn_create = html.pickups.querySelector(".create");
        html.custom_scroll = html.custom_games.querySelector(".table .scroll-outer");
        html.custom_list = html.custom_games.querySelector(".table .scroll-inner");
        html.custom_item_details_container = html.custom_games.querySelector(".list_item_details");
        html.custom_item_details = html.custom_games.querySelector(".details");
        html.custom_item_details_content = html.custom_games.querySelector(".details_content");
        html.custom_btn_join = html.custom_games.querySelector(".join");
        html.custom_btn_create = html.custom_games.querySelector(".create");
        Navigation.generate_nav({
            name: "play_screen_rogue_menu",
            nav_root: html.box_screen_menu,
            nav_class: "box_screen_menu_option",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            mouse_hover: "none",
            mouse_click: "action",
            action_cb_type: "immediate",
            selection_required: true,
            action_cb: tab_selected
        });
        add_on_get_api_token_handler(true, (() => {
            this.refresh_user_modes()
        }));
        mode_update_handlers.push(((modes, queues) => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            matchmaking.official_modes.length = 0;
            for (let mode_key in queues) {
                matchmaking.official_modes.push(queues[mode_key])
            }
            matchmaking.official_modes.push({
                i18n: "game_mode_warmup",
                i18n_desc: "game_mode_desc_warmup",
                match_type: MATCH_TYPE_WARMUP,
                ranked: 0,
                team_size: 6,
                team_count: 2,
                mode_id: "warmup",
                mode_key: "warmup",
                locked: false,
                official: true
            });
            matchmaking.official_modes_recieved = true;
            mm_check_missing_modes();
            this.update_mm_btn_search()
        }));
        global_on_ms_disconnected.push((() => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            if (global_menu_page === "play_rogue") {
                historyBack()
            }
        }));
        party_status_handlers.push(((party_changed, party, removed) => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            matchmaking.selected_modes_recieved = true;
            selected_mode_count = global_party.modes.length;
            mm_check_missing_modes();
            this.update_valid_mm_modes();
            this.update_mm_btn_search()
        }));
        party_mode_update_handlers.push((party => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            matchmaking.selected_modes_recieved = true;
            selected_mode_count = global_party.modes.length;
            mm_check_missing_modes();
            this.update_valid_mm_modes();
            this.update_mm_btn_search()
        }));
        mm_queue_event_handlers.push((msg => {
            if (GAME.active !== GAME.ids.ROGUE) return
        }));
        mm_queue_event_handlers.push((() => {
            this.update_mm_btn_search()
        }));
        mm_event_handlers.push((data => {}));
        party_leader_update_handlers.push(((leader_status_changed, bool_am_i_leader) => {
            if (bool_am_i_leader) {
                if (html.mm_btn_search) html.mm_btn_search.classList.remove("hidden");
                if (html.custom_btn_join) html.custom_btn_join.classList.remove("hidden");
                if (html.custom_btn_create) html.custom_btn_create.classList.remove("hidden")
            } else {
                if (html.mm_btn_search) html.mm_btn_search.classList.add("hidden");
                if (html.custom_btn_join) html.custom_btn_join.classList.add("hidden");
                if (html.custom_btn_create) html.custom_btn_create.classList.add("hidden")
            }
            show_pickup_buttons();
            show_custom_buttons();
            if (global_menu_page === "play_rogue" && tab_map.current_tab === "play_screen_rogue_pickups_tab") {
                render_pickups_list()
            }
        }));
        global_ms.addPermanentResponseHandler("custom-list", (data => {
            if (custom.list_requesting_page === 0 && data.page !== 0) return;
            custom.total = data.total;
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
            if (global_menu_page === "play_rogue" && tab_map.current_tab === "play_screen_rogue_custom_games_tab") {
                if (data.page !== 0) {
                    render_custom_list_page(list)
                } else {
                    render_custom_list()
                }
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
            if (pickups.selected && (data === "pickup_join_error" || data === "pickup_join_error_not_exists")) {
                for (let pickup_id in expired_pickups) {
                    if (Date.now() - expired_pickups[pickup_id] > 120 * 1e3) {
                        delete expired_pickups[pickup_id]
                    }
                }
                expired_pickups[pickups.selected.pickup_id] = Date.now();
                if (pickups.selected_el && pickups.selected_el.parentNode) {
                    pickups.selected_el.parentNode.removeChild(pickups.selected_el);
                    pickups.selected_el = null
                }
                unselect_pickup()
            }
        }));
        global_ms.addPermanentResponseHandler("pickup-update", (data => {
            if ("data" in data) {
                let found = false;
                for (let i = 0; i < pickups.list.length; i++) {
                    if (pickups.list[i].pickup_id === data.data.pickup_id) {
                        found = true;
                        pickups.list[i] = data.data;
                        break
                    }
                }
                if (!found) {
                    pickups.list.push(data.data);
                    pickups.total++;
                    update_pickups_count()
                }
                if (data.data.pickup_id in pickups.joined) {
                    let pickup_elements = html.pickup_list.querySelectorAll(".list_item");
                    let found = false;
                    for (let el of pickup_elements) {
                        if (el.dataset.id === data.data.pickup_id) {
                            found = true;
                            let new_el = render_pickup_list_item(data.data);
                            if (pickups.selected_el === el) {
                                pickups.selected_el = new_el
                            }
                            _replaceNode(el, new_el);
                            break
                        }
                    }
                    if (!found && global_menu_page === "play_rogue" && tab_map.current_tab === "play_screen_rogue_pickups_tab") {
                        render_pickups_list()
                    }
                } else {
                    pickups.joined[data.data.pickup_id] = true;
                    if (global_menu_page === "play_rogue" && tab_map.current_tab === "play_screen_rogue_pickups_tab") {
                        render_pickups_list()
                    }
                }
            }
        }));
        global_ms.addPermanentResponseHandler("pickup-leave", (pickup_id => {
            delete pickups.joined[pickup_id];
            if (pickups.selected && pickups.selected.pickup_id === pickup_id) {
                unselect_pickup()
            }
            if (global_menu_page === "play_rogue" && tab_map.current_tab === "play_screen_rogue_pickups_tab") {
                refresh_pickups_list()
            }
        }));
        global_ms.addPermanentResponseHandler("pickup-list", (data => {
            if (pickups.list_requesting_page === 0 && data.page !== 0) return;
            pickups.total = data.total;
            pickups.list_requesting = false;
            pickups.list_ts = Date.now();
            pickups.list_updating = true;
            let list = unflattenData(data.list);
            if (data.page === 0) {
                pickups.list.length = 0
            }
            for (let p of list) {
                pickups.list.push(p);
                party: for (let u of p.users) {
                    if (u.user_id === global_self.user_id) {
                        pickups.joined[p.pickup_id] = true;
                        break party
                    }
                }
            }
            if (!list.length) {
                pickups.list_max_reached = true
            }
            update_pickups_count();
            if (global_menu_page === "play_rogue" && tab_map.current_tab === "play_screen_rogue_pickups_tab") {
                if (data.page !== 0) {
                    render_pickups_list_page(list)
                } else {
                    render_pickups_list()
                }
            }
            setTimeout((() => {
                pickups.list_updating = false
            }), 250)
        }));
        on_queue_stats_update.push((stats => {
            update_queue_stats()
        }));
        html.mm_list.addEventListener("scroll", (event => {
            const threshold = 150;
            const containerHeight = event.target.getBoundingClientRect().height;
            const windowBottom = event.target.scrollTop + containerHeight;
            if (!matchmaking.list_requesting && !matchmaking.list_max_reached && !matchmaking.list_updating && windowBottom > event.target.scrollHeight - threshold) {
                get_next_mm_list_page()
            }
        }));
        html.pickup_list.addEventListener("scroll", (event => {
            const threshold = 150;
            const containerHeight = event.target.getBoundingClientRect().height;
            const windowBottom = event.target.scrollTop + containerHeight;
            if (!pickups.list_requesting && !pickups.list_max_reached && !pickups.list_updating && windowBottom > event.target.scrollHeight - threshold) {
                get_next_pickup_list_page()
            }
        }));
        html.custom_list.addEventListener("scroll", (event => {
            const threshold = 150;
            const containerHeight = event.target.getBoundingClientRect().height;
            const windowBottom = event.target.scrollTop + containerHeight;
            if (!custom.list_requesting && !custom.list_max_reached && !custom.list_updating && windowBottom > event.target.scrollHeight - threshold) {
                get_next_custom_list_page()
            }
        }));
        html.custom_btn_join.addEventListener("click", (() => {
            if (!bool_am_i_leader) return;
            if (!custom.selected) return;
            let require_pw = false;
            if ("password" in custom.selected && custom.selected.password) require_pw = true;
            if (require_pw) {
                let cont = _createElement("div", "custom_password_prompt");
                let input = _createElement("input", "custom_password_prompt_input");
                input.setAttribute("type", "password");
                cont.appendChild(input);
                input.focus();
                input.addEventListener("keydown", (function(e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        join_custom_session(custom.selected.session_id, input.value);
                        close_modal_screen_by_selector("generic_modal")
                    }
                }));
                genericModal(localize("custom_game_settings_password"), cont, localize("menu_button_cancel"), null, localize("menu_button_join"), (function() {
                    join_custom_session(custom.selected.session_id, input.value)
                }))
            } else {
                join_custom_session(custom.selected.session_id, null)
            }
        }));
        html.custom_btn_create.addEventListener("click", (() => {
            if (!bool_am_i_leader) return;
            if (!Lobby.in_lobby()) {
                Lobby.create()
            } else {
                open_screen("custom")
            }
        }));
        html.pickup_btn_join.addEventListener("click", (() => {
            if (pickups.selected && !(pickups.selected.pickup_id in pickups.joined)) {
                send_string(CLIENT_COMMAND_JOIN_PICKUP, pickups.selected.pickup_id)
            }
        }));
        html.pickup_btn_leave.addEventListener("click", (() => {
            if (pickups.selected && pickups.selected.pickup_id in pickups.joined) {
                send_string(CLIENT_COMMAND_LEAVE_PICKUP, pickups.selected.pickup_id);
                unselect_pickup()
            }
        }));
        html.pickup_btn_create.addEventListener("click", (() => {
            open_create_pickup()
        }));
        global_input_debouncers["play_screen_rogue_mode_filter"] = new InputDebouncer((() => {
            matchmaking.search = html.mm_filter_input.value.trim();
            this.refresh_user_modes()
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
        } else if (tab_map.current_tab === "play_screen_rogue_pickups_tab") {
            if (pickups.list_ts < Date.now() - 5e3 && !pickups.list_requesting) {
                refresh_pickups_list()
            } else {
                render_pickups_list()
            }
        } else {
            if (pickups.list_ts < Date.now() - 3e4 && !pickups.list_requesting) {
                refresh_pickups_list();
                if (pickups.refresh_interval) clearInterval(pickups.refresh_interval);
                pickups.refresh_interval = setInterval((() => {
                    refresh_pickups_list()
                }), 3e4)
            }
        }
        if (tab_map.current_scroll) {
            refreshScrollbar(_id(tab_map.current_scroll))
        }
        render_screen_actions(tab_map[tab_map.current_tab].short);
        request_queue_stats()
    };
    this.on_close = () => {
        if (pickups.refresh_interval) {
            clearInterval(pickups.refresh_interval);
            pickups.refresh_interval = null
        }
    };

    function render_screen_actions(tab) {
        let actions = [global_action_buttons.back];
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
        if (tab === "pickups") {}
        if (tab === "custom") {
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
    this.refresh_user_modes = () => {
        if (matchmaking.list_requesting && Date.now() - matchmaking.list_requesting_ts < 5e3) {
            return
        }
        matchmaking.list_page = 1;
        matchmaking.list_requesting = true;
        matchmaking.list_requesting_page = matchmaking.list_page;
        matchmaking.list_requesting_ts = Date.now();
        matchmaking.list_max_reached = false;
        let params = {
            category: "community",
            limit_public: true,
            order: "stats",
            page: 1
        };
        if (matchmaking.search) params.search = matchmaking.search;
        api_request("GET", `/modes`, params, (modes => {
            matchmaking.list_requesting = false;
            matchmaking.community_modes.length = 0;
            if (Array.isArray(modes) && modes.length) {
                for (let m of modes) {
                    matchmaking.community_modes.push(m)
                }
                if (modes.length < matchmaking.list_page_max) {
                    matchmaking.list_max_reached = true
                }
            } else {
                matchmaking.list_max_reached = true
            }
            matchmaking.user_modes_recieved = true;
            mm_check_missing_modes()
        }))
    };

    function mm_check_missing_modes() {
        if (!matchmaking.selected_modes_recieved) return;
        if (!matchmaking.official_modes_recieved) return;
        if (!matchmaking.user_modes_recieved) return;
        let missing_data_modes = [];
        let selected = {};
        modes: for (let mode of global_party.modes) {
            if (mode in matchmaking.selected) {
                selected[mode] = matchmaking.selected[mode];
                continue modes
            }
            for (let m of matchmaking.official_modes) {
                if (mode === m.mode_key) {
                    selected[mode] = m;
                    continue modes
                }
            }
            for (let m of matchmaking.community_modes) {
                if (mode === m.mode_id) {
                    selected[mode] = m;
                    continue modes
                }
            }
            missing_data_modes.push(mode.trim())
        }
        matchmaking.selected = selected;
        if (missing_data_modes.length) {
            const params = {
                category: "community",
                limit_public: true,
                mode_list: missing_data_modes.join(",")
            };
            api_request("GET", "/modes", params, (modes => {
                if (!modes) return;
                if (Array.isArray(modes) && modes.length) {
                    for (let m of modes) {
                        if (global_party.modes.includes(m.mode_id)) {
                            matchmaking.selected[m.mode_id] = m
                        }
                    }
                }
                render_mm_list()
            }))
        } else {
            render_mm_list()
        }
    }

    function get_next_mm_list_page() {
        matchmaking.list_page++;
        matchmaking.list_requesting = true;
        matchmaking.list_requesting_page = matchmaking.list_page;
        matchmaking.list_requesting_ts = Date.now();
        let params = {
            category: "community",
            limit_public: true,
            order: "stats",
            page: matchmaking.list_page
        };
        if (matchmaking.search) params.search = matchmaking.search;
        api_request("GET", `/modes`, params, (modes => {
            matchmaking.list_requesting = false;
            if (Array.isArray(modes) && modes.length) {
                for (let m of modes) {
                    matchmaking.community_modes.push(m)
                }
                if (modes.length < matchmaking.list_page_max) {
                    matchmaking.list_max_reached = true
                }
            } else {
                matchmaking.list_max_reached = true
            }
            render_mm_list_page(modes)
        }))
    }
    this.mm_refresh = () => {
        request_queue_stats();
        update_queue_stats();
        this.refresh_user_modes()
    };

    function update_queue_stats() {
        let mode_row = html.mm_list.querySelectorAll(".list_item");
        for (let mr of mode_row) {
            let count_el = _get_first_with_class_in_parent(mr, "count");
            let mode_id = mr.dataset.id;
            if (queue_stats && mode_id in queue_stats) {
                let count = 0;
                if ("total" in queue_stats[mode_id]) {
                    if ("s" in queue_stats[mode_id].total) count += queue_stats[mode_id].total.s;
                    if ("p" in queue_stats[mode_id].total) count += queue_stats[mode_id].total.p
                }
                count_el.textContent = count
            } else {
                count_el.textContent = ""
            }
        }
    }

    function render_mm_list() {
        let fragment = new DocumentFragment;
        let first_official = null;
        let first_selected = null;
        let selected_found = null;
        for (let m of matchmaking.official_modes) {
            let list_item = _createElement("div", "list_item");
            list_item.dataset.id = m.mode_key;
            list_item.dataset.team_size = m.team_size;
            if (!first_selected) {
                if (global_party.modes.length) {
                    if (global_party.modes.includes(m.mode_key)) {
                        first_selected = list_item
                    }
                } else {
                    if (!first_official) {
                        first_official = list_item;
                        first_selected = list_item
                    }
                }
            }
            if (matchmaking.selected_mode && matchmaking.selected_mode === m.mode_key) {
                selected_found = list_item
            }
            let name = localize(m.i18n);
            if (matchmaking.search && !(m.mode_key in matchmaking.selected)) {
                if (!name.toLowerCase().includes(matchmaking.search.toLowerCase())) {
                    continue
                }
            }
            let count = 0;
            if (queue_stats && m.mode_key in queue_stats) {
                if ("total" in queue_stats[m.mode_key]) {
                    if ("s" in queue_stats[m.mode_key].total) count += queue_stats[m.mode_key].total.s;
                    if ("p" in queue_stats[m.mode_key].total) count += queue_stats[m.mode_key].total.p
                }
            }
            list_item.appendChild(_createElement("div", "name", name));
            list_item.appendChild(_createElement("div", "mode", "The GD Studio"));
            list_item.appendChild(_createElement("div", "players", getVS(m.team_count, m.team_size)));
            list_item.appendChild(_createElement("div", "count", count ? count : ""));
            let button_cont = _createElement("div", "ping");
            list_item.appendChild(button_cont);
            if (m.match_type === MATCH_TYPE_WARMUP) {
                let btn = _createElement("div", "btn", localize("play"));
                button_cont.appendChild(btn);
                btn.addEventListener("click", (e => {
                    join_warmup()
                }));
                btn.addEventListener("mouseenter", (e => {
                    _play_buffered_ui_sound("ui_hover2")
                }))
            } else {
                if (bool_am_i_leader) {
                    let btn = _createElement("div", "btn", localize("matchmaking_add"));
                    button_cont.appendChild(btn);
                    if (m.mode_key in matchmaking.selected) {
                        if (!matchmaking.selected[m.mode_key]) {
                            matchmaking.selected[m.mode_key] = m
                        }
                        btn.textContent = localize("matchmaking_added");
                        btn.classList.add("added")
                    } else if (selected_mode_count >= MAX_MM_MODES_SELECTED || m.locked) {
                        btn.classList.add("locked")
                    }
                    if (global_party.size > m.team_size) {
                        btn.classList.add("locked")
                    }
                    btn.addEventListener("click", (e => {
                        mm_add_button_cb(btn, m.mode_key, m)
                    }));
                    btn.addEventListener("mouseenter", (e => {
                        if (!bool_am_i_leader) return;
                        _play_buffered_ui_sound("ui_hover2")
                    }))
                } else {
                    if (m.mode_key in matchmaking.selected) {
                        button_cont.textContent = localize("matchmaking_added")
                    }
                }
            }
            list_item.addEventListener("click", (() => {
                select_mm_mode(list_item)
            }));
            fragment.appendChild(list_item)
        }
        for (let mode_id in matchmaking.selected) {
            if (mode_id in global_queues) continue;
            let m = matchmaking.selected[mode_id];
            if (!m) continue;
            let list_item = _createElement("div", "list_item");
            list_item.dataset.id = m.mode_id;
            list_item.dataset.team_size = m.team_size;
            if (!first_selected) {
                first_selected = list_item
            }
            if (matchmaking.selected_mode && matchmaking.selected_mode === m.mode_id) {
                selected_found = list_item
            }
            let lookup_id = m.mode_id;
            if (m.official) lookup_id = m.mode_key;
            let count = 0;
            if (queue_stats && lookup_id in queue_stats) {
                if ("total" in queue_stats[lookup_id]) {
                    if ("s" in queue_stats[lookup_id].total) count += queue_stats[lookup_id].total.s;
                    if ("p" in queue_stats[lookup_id].total) count += queue_stats[lookup_id].total.p
                }
            }
            list_item.appendChild(_createElement("div", "name", m.random_name ? m.random_name : m.name));
            list_item.appendChild(_createElement("div", "mode", m.user_name));
            list_item.appendChild(_createElement("div", "players", getVS(m.team_count, m.team_size)));
            list_item.appendChild(_createElement("div", "count", count ? count : ""));
            let button_cont = _createElement("div", "ping");
            list_item.appendChild(button_cont);
            if (bool_am_i_leader) {
                let btn = _createElement("div", "btn", localize("matchmaking_add"));
                button_cont.appendChild(btn);
                btn.textContent = localize("matchmaking_added");
                btn.classList.add("added");
                btn.addEventListener("click", (e => {
                    mm_add_button_cb(btn, m.mode_id, m)
                }));
                btn.addEventListener("mouseenter", (e => {
                    if (!bool_am_i_leader) return;
                    _play_buffered_ui_sound("ui_hover2")
                }))
            } else {
                button_cont.textContent = localize("matchmaking_added")
            }
            list_item.addEventListener("click", (() => {
                select_mm_mode(list_item)
            }));
            fragment.appendChild(list_item)
        }
        for (let m of matchmaking.community_modes) {
            if (m.mode_id in matchmaking.selected) continue;
            let list_item = _createElement("div", "list_item");
            list_item.dataset.id = m.mode_id;
            list_item.dataset.team_size = m.team_size;
            if (matchmaking.selected_mode && matchmaking.selected_mode === m.mode_id) {
                selected_found = list_item
            }
            let count = 0;
            if (queue_stats && m.mode_id in queue_stats) {
                if ("total" in queue_stats[m.mode_id]) {
                    if ("s" in queue_stats[m.mode_id].total) count += queue_stats[m.mode_id].total.s;
                    if ("p" in queue_stats[m.mode_id].total) count += queue_stats[m.mode_id].total.p
                }
            }
            list_item.appendChild(_createElement("div", "name", m.random_name ? m.random_name : m.name));
            list_item.appendChild(_createElement("div", "mode", m.user_name));
            list_item.appendChild(_createElement("div", "players", getVS(m.team_count, m.team_size)));
            list_item.appendChild(_createElement("div", "count", count ? count : ""));
            let button_cont = _createElement("div", "ping");
            list_item.appendChild(button_cont);
            if (bool_am_i_leader) {
                let btn = _createElement("div", "btn", localize("matchmaking_add"));
                button_cont.appendChild(btn);
                if (m.mode_id in matchmaking.selected) {
                    if (!matchmaking.selected[m.mode_id]) {
                        matchmaking.selected[m.mode_id] = m
                    }
                    btn.textContent = localize("matchmaking_added");
                    btn.classList.add("added")
                } else if (selected_mode_count >= MAX_MM_MODES_SELECTED) {
                    btn.classList.add("locked")
                }
                if (global_party.size > m.team_size) {
                    btn.classList.add("locked")
                }
                btn.addEventListener("click", (e => {
                    mm_add_button_cb(btn, m.mode_id, m)
                }));
                btn.addEventListener("mouseenter", (e => {
                    if (!bool_am_i_leader) return;
                    _play_buffered_ui_sound("ui_hover2")
                }))
            }
            list_item.addEventListener("click", (() => {
                select_mm_mode(list_item)
            }));
            fragment.appendChild(list_item)
        }
        _empty(html.mm_list);
        html.mm_list.appendChild(fragment);
        if (selected_found) {
            select_mm_mode(selected_found)
        } else if (first_selected) {
            select_mm_mode(first_selected)
        } else if (first_official) {
            select_mm_mode(first_official)
        }
        refreshScrollbar(html.mm_scroll);
        resetScrollbar(html.mm_scroll)
    }

    function render_mm_list_page(new_modes) {
        let fragment = new DocumentFragment;
        for (let m of new_modes) {
            if (m.mode_id in matchmaking.selected) continue;
            let list_item = _createElement("div", "list_item");
            list_item.dataset.id = m.mode_id;
            list_item.dataset.team_size = m.team_size;
            let count = 0;
            if (queue_stats && m.mode_id in queue_stats) {
                if ("total" in queue_stats[m.mode_id]) {
                    if ("s" in queue_stats[m.mode_id].total) count += queue_stats[m.mode_id].total.s;
                    if ("p" in queue_stats[m.mode_id].total) count += queue_stats[m.mode_id].total.p
                }
            }
            list_item.appendChild(_createElement("div", "name", m.random_name ? m.random_name : m.name));
            list_item.appendChild(_createElement("div", "mode", m.user_name));
            list_item.appendChild(_createElement("div", "players", getVS(m.team_count, m.team_size)));
            list_item.appendChild(_createElement("div", "count", count ? count : ""));
            let button_cont = _createElement("div", "ping");
            list_item.appendChild(button_cont);
            if (bool_am_i_leader) {
                let btn = _createElement("div", "btn", localize("matchmaking_add"));
                button_cont.appendChild(btn);
                if (selected_mode_count >= MAX_MM_MODES_SELECTED) {
                    btn.classList.add("locked")
                }
                if (global_party.size > m.team_size) {
                    btn.classList.add("locked")
                }
                btn.addEventListener("click", (e => {
                    mm_add_button_cb(btn, m.mode_id, m)
                }))
            }
            list_item.addEventListener("click", (() => {
                select_mm_mode(list_item)
            }));
            fragment.appendChild(list_item)
        }
        html.mm_list.appendChild(fragment)
    }

    function mm_add_button_cb(btn, mode_id, mode) {
        if (!bool_am_i_leader) return;
        if (btn.classList.contains("added")) {
            btn.classList.remove("added");
            btn.textContent = localize("matchmaking_add");
            delete matchmaking.selected[mode_id]
        } else {
            btn.classList.add("added");
            btn.textContent = localize("matchmaking_added");
            matchmaking.selected[mode_id] = mode
        }
        _play_click1();
        send_selected_mm_modes();
        mm_check_missing_modes()
    }

    function select_mm_mode(list_item) {
        if (matchmaking.selected_mode_el) {
            matchmaking.selected_mode_el.classList.remove("selected")
        }
        matchmaking.selected_mode_el = list_item;
        matchmaking.selected_mode_el.classList.add("selected");
        matchmaking.selected_mode = list_item.dataset.id;
        let title_text = "";
        let description_text = "";
        let mode_data = null;
        for (let m of matchmaking.official_modes) {
            if (m.mode_key === matchmaking.selected_mode) {
                mode_data = GAME.get_data("game_mode_map", m.mode_id);
                title_text = localize(mode_data.i18n);
                description_text = localize(mode_data.desc_i18n);
                break
            }
        }
        if (!mode_data) {
            if (matchmaking.selected_mode in matchmaking.selected) {
                mode_data = matchmaking.selected[matchmaking.selected_mode]
            } else {
                for (let m of matchmaking.community_modes) {
                    if (m.mode_id === matchmaking.selected_mode) {
                        mode_data = m;
                        break
                    }
                }
            }
            if (mode_data) {
                title_text = mode_data.random_name ? mode_data.random_name : mode_data.name;
                description_text = mode_data.description
            }
        }
        if (!mode_data) {
            _empty(html.mm_item_details_content);
            return
        }
        let fragment = new DocumentFragment;
        let image = _createElement("div", "image");
        if (mode_data && "image" in mode_data) {
            image.style.backgroundImage = "url(" + mode_data.image + ")"
        } else {
            image.style.backgroundColor = "rgba(255,255,255,0.2)"
        }
        fragment.appendChild(image);
        let title = _createElement("div", "title", title_text);
        fragment.appendChild(title);
        let description = _createElement("div", "description", description_text);
        fragment.appendChild(description);
        if ("rules" in mode_data && Array.isArray(mode_data.rules) && mode_data.rules.length) {
            let rules_title = _createElement("div", "title", localize("rules"));
            let rules_div = _createElement("div", "mode_rules");
            for (let i = 0; i < mode_data.rules.length; i++) {
                let row = _createElement("div", "row");
                row.appendChild(_createElement("div", "icon", i + 1));
                row.appendChild(_createElement("div", "text", localize(mode_data.rules[i])));
                rules_div.appendChild(row);
                if (i === mode_data.rules.length - 1) {
                    row.classList.add("last")
                }
            }
            fragment.appendChild(rules_title);
            fragment.appendChild(rules_div)
        }
        _empty(html.mm_item_details_content);
        html.mm_item_details_content.appendChild(fragment);
        refreshScrollbar(html.mm_item_details);
        resetScrollbar(html.mm_item_details)
    }
    this.update_valid_mm_modes = () => {
        return;
        for (let mode_key in html.queue_circles) {
            let card = html.queue_circles[mode_key].closest(".card");
            if (this.mode_can_be_selected(mode_key)) {
                card.classList.add("enabled");
                html.queue_circles[mode_key].classList.remove("locked")
            } else {
                card.classList.remove("enabled");
                html.queue_circles[mode_key].classList.add("locked")
            }
        }
    };
    this.mode_can_be_selected = mode_key => {
        let mode_map = GAME.get_data("game_mode_map");
        if (!(mode_key in global_mode_definitions) || !global_mode_definitions[mode_key].enabled || !(global_mode_definitions[mode_key].mode_name in mode_map) || !mode_map[global_mode_definitions[mode_key].mode_name].enabled) {
            return false
        }
        if (mode_key in global_mode_definitions) {
            if (global_party.size > global_mode_definitions[mode_key].party_size_max) {
                return false
            }
        }
        return true
    };
    this.update_mm_btn_search = () => {
        if (html.mm_btn_search) {
            let label = html.mm_btn_search.querySelector(".label");
            if (global_mm_searching) {
                html.mm_btn_search.classList.remove("disabled");
                label.textContent = localize("menu_cancel_search")
            } else {
                if (selected_mode_count == 0) {
                    html.mm_btn_search.classList.add("disabled");
                    label.textContent = localize("menu_select_mode")
                } else {
                    html.mm_btn_search.classList.remove("disabled");
                    label.textContent = localize_ext("menu_find_match_x_modes", {
                        count: selected_mode_count
                    })
                }
            }
        }
    };

    function send_selected_mm_modes() {
        let modes = [];
        for (let mode_key in matchmaking.selected) {
            modes.push(mode_key)
        }
        queue_mode_update_id++;
        send_json_data({
            action: "party-set-modes",
            modes: modes,
            update_id: queue_mode_update_id
        })
    }
    join_warmup = () => {
        engine.call("reset_inactivity_timer");
        send_string(CLIENT_COMMAND_JOIN_WARMUP, "s")
    };
    this.toggle_search = () => {
        if (!bool_am_i_leader) return;
        mm_toggle_queue()
    };

    function update_pickups_count() {
        if (pickups.total) {
            html.pickup_count.textContent = pickups.total;
            html.pickup_count.style.display = "flex"
        } else {
            html.pickup_count.style.display = "none"
        }
    }

    function render_pickup_list_item(p) {
        let mode_name = p.mode;
        const mode_data = GAME.get_data("game_mode_map", p.mode);
        if (mode_data) mode_name = localize(mode_data.i18n);
        else if ("mode_name" in p && p.mode_name.length) mode_name = p.mode_name;
        let region = p.datacenter;
        if (p.datacenter in global_region_map) region = localize(global_region_map[p.datacenter].i18n);
        let pickup = _createElement("div", "list_item");
        pickup.appendChild(_createElement("div", "name", mode_name));
        pickup.appendChild(_createElement("div", "mode", getVS(p.team_count, p.team_size)));
        pickup.appendChild(_createElement("div", "players", p.user_count + "/" + p.team_count * p.team_size));
        pickup.appendChild(_createElement("div", "ping", region));
        let button_cont = _createElement("div", "ping");
        pickup.appendChild(button_cont);
        if (bool_am_i_leader) {
            let btn = _createElement("div", "btn");
            button_cont.appendChild(btn);
            if (p.pickup_id in pickups.joined) {
                btn.textContent = localize("leave");
                btn.classList.add("added")
            } else {
                btn.textContent = localize("join")
            }
            btn.addEventListener("click", (e => {
                if (p.pickup_id in pickups.joined) {
                    send_string(CLIENT_COMMAND_LEAVE_PICKUP, p.pickup_id);
                    if (pickups.selected && pickups.selected.pickup_id === p.pickup_id) {
                        unselect_pickup()
                    }
                } else {
                    if (pickups.selected && pickups.selected.pickup_id === p.pickup_id) {
                        e.stopPropagation()
                    }
                    send_string(CLIENT_COMMAND_JOIN_PICKUP, p.pickup_id)
                }
            }))
        } else {
            if (p.pickup_id in pickups.joined) {
                button_cont.textContent = "Joined"
            }
        }
        pickup.addEventListener("click", (() => {
            if (pickup.classList.contains("selected")) {
                unselect_pickup()
            } else {
                select_pickup(pickup, p)
            }
        }));
        if (pickups.selected && pickups.selected.pickup_id === p.pickup_id) {
            select_pickup(pickup, p)
        }
        return pickup
    }

    function render_pickups_list() {
        _empty(html.pickup_list);
        let fragment = new DocumentFragment;
        for (let p of pickups.list) {
            if (p.pickup_id in pickups.joined) {
                fragment.appendChild(render_pickup_list_item(p))
            }
        }
        for (let p of pickups.list) {
            if (p.pickup_id in pickups.joined) continue;
            if (p.pickup_id in expired_pickups) continue;
            fragment.appendChild(render_pickup_list_item(p))
        }
        html.pickup_list.appendChild(fragment);
        refreshScrollbar(html.pickup_scroll);
        resetScrollbar(html.pickup_scroll)
    }

    function render_pickups_list_page(list) {
        let fragment = new DocumentFragment;
        for (let p of list) {
            if (p.pickup_id in expired_pickups) continue;
            fragment.appendChild(render_pickup_list_item(p))
        }
        html.pickup_list.appendChild(fragment);
        refreshScrollbar(html.pickup_scroll)
    }

    function refresh_pickups_list() {
        if (pickups.list_requesting && Date.now() - pickups.list_requesting_ts < 5e3) {
            return
        }
        lock_pickup_list();
        pickups.list_page = 0;
        pickups.list_requesting = true;
        pickups.list_requesting_page = pickups.list_page;
        pickups.list_requesting_ts = Date.now();
        pickups.list_max_reached = false;
        send_string(CLIENT_COMMAND_GET_PICKUP_LIST, pickups.list_page)
    }

    function get_next_pickup_list_page() {
        pickups.list_page++;
        pickups.list_requesting = true;
        pickups.list_requesting_page = pickups.list_page;
        pickups.list_requesting_ts = Date.now();
        send_string(CLIENT_COMMAND_GET_PICKUP_LIST, pickups.list_page)
    }

    function select_pickup(list_element, p) {
        if (pickups.selected_el) {
            pickups.selected_el.classList.remove("selected")
        }
        pickups.selected_el = list_element;
        pickups.selected_el.classList.add("selected");
        pickups.selected = p;
        let mode_name = "";
        const mode_data = GAME.get_data("game_mode_map", p.mode);
        if (mode_data) mode_name = localize(mode_data.i18n);
        else if ("mode_name" in p && p.mode_name.length) mode_name = p.mode_name;
        else mode_name = p.mode;
        let mode_creator_name = "";
        if ("mode_creator_name" in p && p.mode_creator_name.length) mode_creator_name = p.mode_creator_name;
        let fragment = new DocumentFragment; {
            let image = _createElement("div", "image");
            if (mode_data && "image" in mode_data) {
                image.style.backgroundImage = "url(" + mode_data.image + ")"
            } else {
                image.style.backgroundColor = "rgba(255,255,255,0.2)"
            }
            fragment.appendChild(image)
        }
        fragment.appendChild(_createElement("div", "title", mode_name));
        if (mode_creator_name.trim().length) {
            fragment.appendChild(_createElement("div", "mode_creator", mode_creator_name))
        } {
            let total = p.team_count * p.team_size;
            let missing = total - p.users.length;
            fragment.appendChild(_createElement("div", "description", localize_ext("pickup_desc", {
                count: missing
            })))
        } {
            let detail_row = _createElement("div", "detail_row");
            detail_row.appendChild(_createElement("div", "name", localize("pickup_max_party_size")));
            detail_row.appendChild(_createElement("div", "value", p.max_party_size));
            fragment.appendChild(detail_row)
        } {
            let parties = {};
            let party_ids = [];
            for (let u of p.users) {
                if (!(u.party in parties)) {
                    parties[u.party] = [];
                    party_ids.push(u.party)
                }
                parties[u.party].push(u)
            }
            party_ids.sort();
            fragment.appendChild(_createElement("div", "head", localize("customlist_table_head_players")));
            for (let party_id of party_ids) {
                if (!(party_id in parties)) continue;
                let party = _createElement("div", "party");
                if (parties[party_id].length > 1) {
                    party.classList.add("multi")
                }
                for (let u of parties[party_id]) {
                    party.appendChild(_createElement("div", "player", u.name))
                }
                fragment.appendChild(party)
            }
        }
        _empty(html.pickup_item_details_content);
        html.pickup_item_details_content.appendChild(fragment);
        refreshScrollbar(html.pickup_item_details);
        resetScrollbar(html.pickup_item_details);
        show_pickup_buttons()
    }

    function unselect_pickup() {
        if (pickups.selected_el) {
            pickups.selected_el.classList.remove("selected")
        }
        pickups.selected_el = null;
        pickups.selected = null;
        _empty(html.pickup_item_details_content);
        show_pickup_buttons()
    }

    function show_pickup_buttons() {
        if (bool_am_i_leader) {
            html.pickup_btn_create.style.display = "flex"
        } else {
            html.pickup_btn_join.style.display = "none";
            html.pickup_btn_create.style.display = "none";
            html.pickup_btn_leave.style.display = "none";
            return
        }
        if (pickups.selected) {
            if (pickups.selected.pickup_id in pickups.joined) {
                html.pickup_btn_join.style.display = "none";
                html.pickup_btn_leave.style.display = "flex"
            } else {
                html.pickup_btn_join.style.display = "flex";
                html.pickup_btn_leave.style.display = "none"
            }
        } else {
            html.pickup_btn_join.style.display = "none";
            html.pickup_btn_leave.style.display = "none"
        }
    }

    function lock_pickup_list() {
        for (let pickup = html.pickup_list.firstElementChild; pickup; pickup = pickup.nextElementSibling) {
            pickup.classList.add("locked")
        }
    }
    this.pickup_refresh = () => {
        if (pickups.list_ts < Date.now() - 3e3 && !pickups.list_requesting) {
            refresh_pickups_list()
        }
    };

    function open_create_pickup() {
        html.pickups.style.display = "none";
        html.create_pickup.style.display = "flex";
        render_create_pickup()
    }

    function close_create_pickup(open_list) {
        if (open_list) {
            html.pickups.style.display = "flex"
        }
        html.create_pickup.style.display = "none"
    }
    let pickup_selected_pickup_mode = ["", ""];
    let pickup_selected_team_size = 4;
    let pickup_selected_max_party_size = 4;
    let pickup_selected_region = "";

    function render_create_pickup() {
        let create_content = _createElement("div", "create_content");
        create_content.appendChild(_createElement("div", "head", "Create Pickup"));
        let list = _createElement("div", ["table", "create"]);
        create_content.appendChild(list);
        let mode_selection = _createElement("div", "selected_mode", pickup_selected_pickup_mode[1]); {
            let list_item = _createElement("div", "list_item");
            let setting = _createElement("div", "setting");
            setting.appendChild(mode_selection);
            let mode_select_btn = _createElement("div", ["btn-style-4", "gold"], "Select Mode");
            mode_select_btn.addEventListener("click", (() => {
                mode_selection_modal.open(pickup_selected_pickup_mode[0], update_pickup_mode)
            }));
            setting.appendChild(mode_select_btn);
            list_item.appendChild(_createElement("div", "label", localize("custom_game_settings_mode")));
            list_item.appendChild(setting);
            list.appendChild(list_item)
        } {
            let list_item = _createElement("div", "list_item");
            let setting = _createElement("div", "setting");
            let team_size_select = _createElement("div", "select-field");
            team_size_select.dataset.theme = "modern";
            setting.appendChild(team_size_select);
            for (let i = 1; i <= 6; i++) {
                let opt = _createElement("div", null, i);
                opt.dataset.value = i;
                if (pickup_selected_team_size === i) {
                    opt.dataset.selected = 1
                }
                team_size_select.appendChild(opt)
            }
            setup_select(team_size_select, update_team_size);
            list_item.appendChild(_createElement("div", "label", localize("custom_game_settings_team_size")));
            list_item.appendChild(setting);
            list.appendChild(list_item)
        }
        let party_size_select = _createElement("div", "select-field"); {
            let list_item = _createElement("div", "list_item");
            let setting = _createElement("div", "setting");
            party_size_select.dataset.theme = "modern";
            setting.appendChild(party_size_select);
            for (let i = 1; i <= 4; i++) {
                let opt = _createElement("div", null, i);
                opt.dataset.value = i;
                if (pickup_selected_max_party_size === i) {
                    opt.dataset.selected = 1
                }
                party_size_select.appendChild(opt)
            }
            setup_select(party_size_select, update_party_size);
            list_item.appendChild(_createElement("div", "label", localize("pickup_max_party_size")));
            list_item.appendChild(setting);
            list.appendChild(list_item)
        } {
            let list_item = _createElement("div", "list_item");
            let setting = _createElement("div", "setting");
            let region_select = _createElement("div", "select-field");
            region_select.dataset.theme = "modern";
            setting.appendChild(region_select);
            let default_region = "";
            if (pickup_selected_region.length) default_region = pickup_selected_region;
            region_ids = [];
            let regions_with_children = {};
            for (let region_id in global_region_map) {
                if (global_region_map[region_id].parent_region_id) {
                    regions_with_children[global_region_map[region_id].parent_region_id] = true
                }
            }
            for (let region_id in global_region_map) {
                if (region_id in regions_with_children) continue;
                if (!(region_id in Servers.regions)) continue;
                region_ids.push(region_id)
            }
            region_ids.sort();
            let opts = [];
            let default_selected = false;
            for (let region_id of region_ids) {
                let opt = _createElement("div", null, localize(global_region_map[region_id].i18n));
                opt.dataset.value = region_id;
                region_select.appendChild(opt);
                opts.push(opt);
                if (default_region == region_id) {
                    opt.dataset.selected = 1;
                    default_selected = true
                }
            }
            if (!default_selected && opts.length) {
                opts[0].dataset.selected = 1;
                pickup_selected_region = opts[0].dataset.value
            }
            setup_select(region_select, ((field_element, el) => {
                pickup_selected_region = field_element.dataset.value
            }));
            list_item.appendChild(_createElement("div", "label", localize("custom_game_settings_datacenter")));
            list_item.appendChild(setting);
            list.appendChild(list_item)
        }
        let ctrl_row = _createElement("div", "ctrl_row");
        list.appendChild(ctrl_row);
        let btn_create = _createElement("div", ["btn-style-play"], localize("create"));
        if (!pickup_selected_pickup_mode[0].length) {
            btn_create.classList.add("disabled")
        }
        _addButtonSounds(btn_create, 1);
        ctrl_row.appendChild(btn_create);
        btn_create.addEventListener("click", (function() {
            if (pickup_selected_pickup_mode[0].length === 0) return;
            let pickup_settings = {
                mode: pickup_selected_pickup_mode[0],
                team_size: parseInt(pickup_selected_team_size),
                party_size: parseInt(pickup_selected_max_party_size),
                region: pickup_selected_region
            };
            send_string(CLIENT_COMMAND_CREATE_PICKUP, JSON.stringify(pickup_settings));
            close_create_pickup(true)
        }));
        let btn_cancel = _createElement("div", ["btn-style-play", "plain"], localize("cancel"));
        _addButtonSounds(btn_cancel, 1);
        ctrl_row.appendChild(btn_cancel);
        btn_cancel.addEventListener("click", (function() {
            close_create_pickup(true)
        }));
        _empty(html.create_pickup);
        html.create_pickup.appendChild(create_content);
        let update_pickup_mode = async mode => {
            if (!Array.isArray(mode)) return;
            pickup_selected_pickup_mode = mode;
            mode_selection.textContent = mode[1];
            if (pickup_selected_pickup_mode[0] == "") {
                btn_create.classList.add("disabled")
            } else {
                btn_create.classList.remove("disabled")
            }
            return true
        };

        function update_team_size(field_element, el) {
            pickup_selected_team_size = parseInt(field_element.dataset.value);
            if (pickup_selected_max_party_size > pickup_selected_team_size) pickup_selected_max_party_size = pickup_selected_team_size;
            _empty(party_size_select);
            for (let i = global_party.size; i <= pickup_selected_team_size; i++) {
                let opt_size = _createElement("div", null, i);
                opt_size.dataset.value = i;
                if (i == pickup_selected_max_party_size) opt_size.dataset.selected = 1;
                party_size_select.appendChild(opt_size)
            }
            setup_select(party_size_select, update_party_size)
        }

        function update_party_size(field_element, el) {
            pickup_selected_max_party_size = parseInt(field_element.dataset.value)
        }
    }

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
        else if ("mode_name" in m && m.mode_name.length) mode_name = m.mode_name;
        else mode_name = m.mode;
        if (m.team_count === 2) {
            mode_name += " " + m.team_size + "v" + m.team_size
        }
        let match = _createElement("div", "list_item");
        match.appendChild(_createElement("div", "name", m.name));
        match.appendChild(_createElement("div", "mode", mode_name));
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
        fragment.appendChild(image); {
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
            fragment.appendChild(teams)
        } else {}
        _empty(html.custom_item_details_content);
        html.custom_item_details_content.appendChild(fragment);
        refreshScrollbar(html.custom_item_details);
        resetScrollbar(html.custom_item_details);
        show_custom_buttons()
    }

    function unselect_custom_match() {
        if (custom.selected_el) {
            custom.selected_el.classList.remove("selected")
        }
        custom.selected_el = null;
        custom.selected = null;
        _empty(html.custom_item_details_content);
        show_custom_buttons()
    }

    function show_custom_buttons() {
        if (bool_am_i_leader) {
            html.custom_btn_create.style.display = "flex"
        } else {
            html.custom_btn_join.style.display = "none";
            html.custom_btn_create.style.display = "none";
            return
        }
        if (custom.selected) {
            html.custom_btn_join.style.display = "flex"
        } else {
            html.custom_btn_join.style.display = "none"
        }
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
    this.custom_refresh = () => {
        if (custom.list_ts < Date.now() - 3e3 && !custom.list_requesting) {
            refresh_custom_list()
        }
    }
};