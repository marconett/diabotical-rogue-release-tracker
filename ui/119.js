{
    new MenuScreen({
        game_id: GAME.ids.COMMON,
        name: "ingame_panel",
        screen_element: _id("ingame_panel"),
        sound_open: "ui_panel_right_in",
        init: () => {
            ingame_panel.init()
        },
        open_handler: () => {
            set_blur(false);
            Navigation.set_active({
                lb_rb: null,
                up_down: "ingame_panel",
                left_right: null
            });
            ingame_panel.set_fully_open(false);
            ingame_panel.on_open()
        },
        post_open_handler: () => {
            ingame_panel.set_fully_open(true)
        },
        close_handler: () => {
            ingame_panel.set_fully_open(false);
            Navigation.reset_active()
        },
        post_close_handler: () => {
            ingame_panel.set_fully_open(false)
        }
    })
}
const ingame_panel = new function() {
    let is_fully_open = false;
    this.set_fully_open = bool => {
        is_fully_open = bool
    };
    let html = {
        root: null,
        screen_actions: null,
        vote: null
    };
    this.init = () => {
        html.root = _id("ingame_panel");
        html.screen_actions = html.root.querySelector(".screen_actions");
        html.vote = html.root.querySelector(".main_button.vote");
        Navigation.generate_nav({
            name: "ingame_panel",
            nav_root: html.root,
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
        html.root.addEventListener("click", (e => {
            e.stopPropagation()
        }));
        _id("main_menu").addEventListener("click", (e => {
            if (global_menu_page === "ingame_panel" && is_fully_open) {
                let root_rect = html.root.getBoundingClientRect();
                if (e.clientX < root_rect.x) {
                    historyBack()
                }
            }
        }));
        on_match_manifest_handlers.push((() => {
            update_vote()
        }));
        on_in_game_handlers.push(((in_game, map_name, game_mode) => {
            update_vote()
        }))
    };
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], html.screen_actions)
    };

    function update_vote() {
        let show_vote_button = false;
        if (!IN_HUB) {
            if (current_match.allow_map_voting) {
                show_vote_button = true
            }
        }
        if (html.vote) {
            if (show_vote_button) {
                html.vote.classList.remove("disabled");
                html.vote.classList.remove("inactive")
            } else {
                html.vote.classList.add("disabled");
                html.vote.classList.add("inactive")
            }
        }
    }

    function button_pressed(button) {
        if (button === "main_panel") {
            if (GAME.active === GAME.ids.ROGUE) {
                open_screen("main_panel_rogue")
            } else if (GAME.active === GAME.ids.GEARSTORM) {
                open_screen("main_panel_gearstorm")
            } else {
                open_screen("main_panel")
            }
        } else if (button === "settings") {
            open_screen("settings_panel")
        } else if (button === "vote") {
            create_map_vote()
        } else if (button === "join") {
            ingame_menu_join_match()
        } else if (button === "join_spec") {
            ingame_menu_spectate()
        } else if (button === "join_team_0") {
            ingame_menu_join_team(0)
        } else if (button === "join_team_1") {
            ingame_menu_join_team(1)
        }
    }

    function ingame_menu_spectate() {
        engine.call("join_team", SPECTATING_TEAM);
        close_menu()
    }

    function ingame_menu_join_team(team_id) {
        let player_count = undefined;
        team_id = Number(team_id);
        if (menu_game_data.own_team_id == team_id) {
            close_menu();
            return
        }
        if (team_id != SPECTATING_TEAM) {
            for (let i = 0; i < menu_game_data.teams.length; i++) {
                if (menu_game_data.teams[i].team_id == team_id) {
                    if ("players" in menu_game_data.teams[i]) {
                        player_count = menu_game_data.teams[i].players.length
                    } else {
                        player_count = 0
                    }
                    break
                }
            }
            if (player_count != undefined && player_count >= menu_game_data.team_size) {
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize("message_team_already_full")
                });
                return
            }
        }
        if (menu_game_data.spectator) {
            let allowed_team_ids = [];
            let lowest_player_count = 100;
            for (let i = 0; i < menu_game_data.teams.length; i++) {
                if (menu_game_data.teams[i].players) {
                    if (menu_game_data.teams[i].players.length < lowest_player_count) lowest_player_count = menu_game_data.teams[i].players.length
                } else {
                    lowest_player_count = 0;
                    break
                }
            }
            for (let i = 0; i < menu_game_data.teams.length; i++) {
                if (!menu_game_data.teams[i].players || menu_game_data.teams[i].players.length == lowest_player_count) {
                    allowed_team_ids.push(menu_game_data.teams[i].team_id)
                }
            }
            if (!allowed_team_ids.includes(team_id)) {
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize("message_team_join_uneven")
                });
                return
            }
        } else {
            let prev_team_count = menu_game_data.own_team.players.length;
            let next_team_count = player_count;
            let diff_before = Math.abs(next_team_count - prev_team_count);
            prev_team_count--;
            next_team_count++;
            let diff_after = Math.abs(next_team_count - prev_team_count);
            if (diff_after > diff_before) {
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize("message_team_join_uneven")
                });
                return
            }
        }
        engine.call("join_team", team_id);
        close_menu()
    }

    function ingame_menu_join_match() {
        let team_id = get_fairest_team_id(menu_game_data);
        if (team_id === SPECTATING_TEAM) {
            queue_dialog_msg({
                title: localize("title_info"),
                msg: localize("message_team_already_full")
            });
            return
        }
        engine.call("join_team", team_id);
        close_menu()
    }

    function create_map_vote() {
        const mode = current_match.mode ? current_match.mode : "";
        map_selection_modal.open("vote", mode, null, start_map_vote)
    }

    function start_map_vote(selected) {
        let map_json = JSON.stringify({
            map: selected[0],
            name: selected[1],
            community_map: selected[2]
        });
        send_string(CLIENT_COMMAND_START_MAP_VOTE, map_json)
    }
};