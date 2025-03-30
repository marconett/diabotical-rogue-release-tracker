global_components["draft"] = new MenuComponent("draft", _id("draft_screen"), (function() {
    draft_page.init()
}));
const draft_page = new function() {
    let state = {
        is_visible: false,
        cancel_timeout: null,
        queued: null,
        countdown_interval: null,
        show_backbutton_timeout: null,
        data: null
    };
    let countdown_time_start = 10;
    let countdown = countdown_time_start;
    let html = {
        root: null,
        maps: null,
        mode_icon: null,
        mode_name: null,
        backbtn: null,
        countdown: null
    };
    this.init = () => {
        html.root = _id("draft_screen");
        html.maps = html.root.querySelector(".map_list_container");
        html.mode_icon = html.root.querySelector(".mode_info .icon");
        html.mode_name = html.root.querySelector(".mode_info .mode_name");
        html.backbtn = html.root.querySelector(".buttons .close");
        html.countdown = html.root.querySelector(".countdown_cont .value");
        bind_event("starting_game", (() => {
            setTimeout((() => {
                state.data = null;
                if (state.is_visible) {
                    this.close(false)
                }
            }), 1e3)
        }));
        bind_event("show_draft", (() => {
            if (state.data) {
                open(state.data);
                show_draft(true, false)
            }
        }));
        mm_event_handlers.push((data => {
            state.data = data;
            setup(data)
        }));
        mm_match_cancelled_handlers.push((() => {
            clear_timers();
            this.close(false)
        }));
        global_ms.addPermanentResponseHandler("no-servers-available", (() => {
            this.close(false)
        }));
        global_ms.addPermanentResponseHandler("vote-counts", (json_data => {
            if (state.is_visible) {
                update_vote_counts(json_data)
            }
        }));
        bind_event("messagebox", (function(msg_key) {
            if (msg_key == "message_no_servers_avail") {
                this.close(false)
            }
        }))
    };

    function setup(data) {
        html.mode_icon.style.display = "none";
        html.mode_name.style.display = "none";
        const mode_data = GAME.get_data("game_mode_map", data.mode);
        _empty(html.maps);
        if (data.vote == "map" && data.vote_options && data.vote_options.length) {
            html.maps.appendChild(create_map_list(data.vote_options, data.vote_option_details))
        }
        if (data.vote === "map") {
            let icon = "";
            let title = "";
            if (mode_data) {
                icon = "url(" + mode_data.icon + "?s=6)";
                if (data.team_count > 2 && data.team_size == 1) title = localize(mode_data.i18n);
                else title = localize(mode_data.i18n) + " " + getVS(data.team_count, data.team_size)
            } else if (data.mode_name) {
                title = data.mode_name + " " + getVS(data.team_count, data.team_size)
            }
            html.mode_name.textContent = title;
            html.mode_icon.style.display = "flex";
            html.mode_name.style.display = "flex"
        }
        set_countdown(countdown_time_start)
    }

    function create_map_list(valid_maps, map_details) {
        let map_list = _createElement("div", "map_list");
        if (valid_maps.length <= 3) {
            map_list.style.setProperty("--map_row_count", "" + 3)
        } else if (valid_maps.length == 4) {
            map_list.style.setProperty("--map_row_count", "" + 2)
        } else if (valid_maps.length > 4) {
            map_list.style.setProperty("--map_row_count", "" + 3)
        }
        for (let map of valid_maps) {
            let map_name = _format_map_name(map);
            let team_size_max = 0;
            if (map_details && map_details.hasOwnProperty(map)) {
                if (map_details[map].hasOwnProperty("name") && map_details[map].name) {
                    map_name = map_details[map].name
                }
                if (map_details[map].hasOwnProperty("team_size_max") && map_details[map].team_size_max > 0) {
                    team_size_max = map_details[map].team_size_max
                }
            }
            let map_cont = _createElement("div", ["vote_option_cont", "hidden"]);
            let map_div = _createElement("div", ["map", "vote_option"]);
            map_div.dataset.option = map;
            let image_div = _createElement("div", "image");
            image_div.style.backgroundImage = 'url("map-thumbnail://' + map + '")';
            map_div.appendChild(image_div);
            let info_div = _createElement("div", "info");
            let vote_count_div = _createElement("div", "vote_count");
            vote_count_div.appendChild(_createElement("div", "checkmark"));
            vote_count_div.appendChild(_createElement("div", "count", 0));
            info_div.appendChild(vote_count_div);
            info_div.appendChild(_createElement("div", "name", map_name));
            if (team_size_max) {
                let vs_div = _createElement("div", "vs", getVS(2, team_size_max));
                info_div.appendChild(vs_div)
            }
            let selection = _createElement("div", "selection");
            let circle = _createElement("div", "circle");
            selection.appendChild(circle);
            info_div.appendChild(selection);
            map_div.appendChild(info_div);
            map_div.classList.add("enabled");
            map_div.addEventListener("click", (function() {
                _play_click1();
                let prev = map_list.querySelector(".selected");
                if (prev) prev.classList.remove("selected");
                circle.classList.add("selected");
                send_string(CLIENT_COMMAND_SELECT_MAP, map)
            }));
            map_div.addEventListener("mouseenter", (() => {
                _play_hover2()
            }));
            map_div.addEventListener("animationend", (e => {
                if (e.animationName === "vote_option_rotate_in") {
                    map_div.classList.remove("rotate_in")
                }
            }));
            map_cont.appendChild(map_div);
            map_list.appendChild(map_cont)
        }
        return map_list
    }

    function update_vote_counts(data) {
        if (!state.is_visible) return;
        _for_each_with_class_in_parent(html.maps, "vote_option", (opt_el => {
            let vote_cont = _get_first_with_class_in_parent(opt_el, "count");
            if (!vote_cont) return;
            vote_cont.textContent = 0;
            if (opt_el.dataset.option in data.votes && data.votes[opt_el.dataset.option] > 0) {
                vote_cont.textContent = data.votes[opt_el.dataset.option]
            }
        }))
    }

    function clear_timers() {
        if (state.cancel_timeout != null) {
            clearTimeout(state.cancel_timeout);
            state.cancel_timeout = null
        }
        if (state.queued !== null) {
            clearTimeout(state.queued);
            state.queued = null
        }
        if (state.countdown_interval !== null) {
            clearInterval(state.countdown_interval);
            state.countdown_interval = null
        }
    }
    this.close = instant => {
        console.log("close draft screen");
        state.is_visible = false;
        html.backbtn.style.display = "none";
        clear_timers();
        show_draft(false, instant)
    };

    function open(data) {
        state.is_visible = true;
        if (state.show_backbutton_timeout !== null) {
            clearTimeout(state.show_backbutton_timeout);
            state.show_backbutton_timeout = null
        }
        if (state.countdown_interval !== null) {
            clearInterval(state.countdown_interval);
            state.countdown_interval = null
        }
        html.backbtn.style.display = "none";
        engine.call("ui_sound", "ui_transition_mapvote");
        let delay = 0;
        let elements = html.maps.querySelectorAll(".vote_option_cont");
        for (let i = 0; i < elements.length; i++) {
            setTimeout((() => {
                elements[i].classList.remove("hidden");
                elements[i].firstElementChild.classList.add("rotate_in")
            }), delay);
            delay += 80
        }
        if (state.queued !== null) clearTimeout(state.queued);
        const mode_data = GAME.get_data("game_mode_map", data.mode);
        countdown = countdown_time_start;
        state.queued = setTimeout((() => {
            if (data.vote == "map") {
                if (mode_data && mode_data.announce.length) {
                    engine.call("ui_sound_queue", mode_data.announce)
                }
                engine.call("ui_sound_queue", "announcer_common_menu_mapvote")
            }
            set_countdown(countdown);
            countdown--;
            state.countdown_interval = setInterval((() => {
                if (countdown < 0) {
                    clearInterval(state.countdown_interval);
                    state.show_backbutton_timeout = setTimeout((() => {
                        anim_show(html.backbtn);
                        state.show_backbutton_timeout = null
                    }), 5e3);
                    return
                }
                engine.call("ui_sound", "ui_match_found_tick");
                set_countdown(countdown);
                countdown--
            }), 1e3)
        }), 200);
        global_ingame_fallback = "draft_screen"
    }

    function set_countdown(countdown) {
        html.countdown.textContent = _format_number(countdown, "custom", {
            format: "00"
        });
        html.countdown.classList.remove("anim");
        if (state.countdown_interval) {
            window.requestAnimationFrame((() => {
                html.countdown.classList.add("anim")
            }))
        }
    }

    function show_draft(visible, instant) {
        console.log("show_draft", visible);
        if (visible) {
            close_menu();
            open_ingame_screen(html.root.id, instant, true)
        } else {
            if (global_ingame_fallback === "draft_screen") {
                global_ingame_fallback = null
            }
            close_ingame_screen(instant, html.root.id)
        }
    }
};