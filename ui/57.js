class MS {
    constructor() {
        this.messages = {}
    }
    addPermanentResponseHandler(expected_message, callback) {
        if (!(expected_message in this.messages)) {
            this.messages[expected_message] = []
        }
        this.messages[expected_message].push({
            ts: Date.now(),
            cb: callback,
            sticky: true
        })
    }
    addResponseHandler(expected_message, callback) {
        if (!(expected_message in this.messages)) {
            this.messages[expected_message] = []
        }
        this.messages[expected_message].push({
            ts: Date.now(),
            cb: callback,
            sticky: false
        })
    }
    handleResponse(type, data) {
        let now = Date.now();
        if (type in this.messages) {
            for (let i = this.messages[type].length - 1; i >= 0; i--) {
                if (this.messages[type][i].sticky) {
                    if (typeof this.messages[type][i].cb === "function") this.messages[type][i].cb(data)
                } else {
                    if (now - this.messages[type][i].ts <= 5e3) {
                        if (typeof this.messages[type][i].cb === "function") this.messages[type][i].cb(data)
                    }
                    this.messages[type].splice(i, 1)
                }
            }
        }
    }
}
var global_ms_connected = false;
var global_ms_connected_count = 0;
var global_ms = new MS;

function masterserver_message_handler(type, priority, action, data) {
    if (typeof action === "undefined") return;
    if (type === "j") {
        var json_data = "";
        try {
            json_data = JSON.parse(data)
        } catch (e) {
            console.log("Error parsing server JSON for action:", action, "err=" + e)
        }
        let switch_action = action;
        if (action.startsWith("mm-")) switch_action = "mm-";
        if (action.startsWith("lobby-")) switch_action = "lobby-";
        if (action.startsWith("party-")) switch_action = "party-";
        switch (switch_action) {
            case "mm-":
                handle_mm_match_event(json_data);
                break;
            case "lobby-":
                Lobby.event(json_data);
                break;
            case "party-":
                handle_party_event(json_data);
                break;
            case "vote-counts":
                break;
            case "match-disconnect":
                button_game_over_quit(false);
                break;
            case "queues":
                parse_modes(json_data);
                break;
            case "competitive-season":
                update_competitive_season(json_data.data);
                break;
            case "get-ranked-mmrs":
                global_self.mmr = json_data.data;
                mmr_updated();
                break;
            case "get-combined-list":
                global_updating_match_list = false;
                global_custom_list_data_ts = Date.now();
                global_custom_list_data = json_data.data.customs;
                global_pickup_list_data = json_data.data.pickups ? json_data.data.pickups : [];
                global_tourney_list_data = json_data.data.tourneys ? json_data.data.tourneys : [];
                global_party.pickup_ids = json_data.data.pickup_ids;
                if (global_active_view === "menu") {
                    if (global_menu_page == "play") {
                        render_play_screen_combined_list();
                        render_play_screen_tourney_list()
                    }
                }
                break;
            case "warmup-join-error":
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize(json_data.msg)
                });
                break;
            case "post-match-updates":
                if ("progression_updates" in json_data.data) {
                    if ("battlepass_rewards" in json_data.data.progression_updates) {
                        add_user_customizations(json_data.data.progression_updates.battlepass_rewards)
                    }
                    if ("global_points_update" in json_data.data.progression_updates) {}
                    if ("achievements" in json_data.data.progression_updates) {}
                    if ("achievement_rewards" in json_data.data.progression_updates) {
                        let rewards = [];
                        for (let r of json_data.data.progression_updates.achievement_rewards) rewards.push(r.reward);
                        add_user_customizations(rewards)
                    }
                    if ("coins" in json_data.data.progression_updates) {
                        update_wallet(json_data.data.progression_updates.coins)
                    }
                }
                handlePostMatchUpdates(json_data.data);
                break;
            case "achievement-rewards":
                let rewards = [];
                for (let r of json_data.rewards) rewards.push(r.reward);
                add_user_customizations(rewards);
                break;
            case "rerolled-challenge":
                replaceChallenge(json_data.replaced_challenge_id, json_data.challenge);
                updateChallenges();
                break;
                break;
            case "update-session-data":
                break;
            case "update-char-preset":
                customization_update_preset(json_data.data);
                break;
            case "own-data":
                update_own_data("friend_requests", json_data.data.friend_requests);
                break;
            case "friends-list":
                Friends.master_update(json_data.users);
                Friends.master_update_blocked(json_data.blocked);
                break;
            case "friend-request":
                Friends.add_request(json_data.data);
                break;
            case "friend-update":
                Friends.master_update_partial(json_data.data);
                break;
            case "friend-removed":
                Friends.remove_master_friend(json_data.user_id);
                break;
            case "friend-accepted":
                Friends.request_accepted(json_data.data);
                break;
            case "friend-gamestate":
                Friends.gamestate_update(json_data.user_id, json_data.gamestate);
                break;
            case "online-friends-data":
                Friends.update_ingame_store_friends_data(json_data.data);
                break;
            case "invite-list":
                Friends.update_invites(json_data.list);
                break;
            case "invite-add":
                Friends.add_invite(json_data);
                break;
            case "invite-removed":
                Friends.remove_invite(json_data);
                break;
            case "map-user-id":
                Friends.map_user_id(json_data.client_user_id, json_data.user_id);
                break;
            case "friend-requests-disabled":
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize_ext("friends_list_text_add_friend_disabled", {
                        name: json_data.name
                    })
                });
                break;
            case "pickup-update":
                update_pickup_data(json_data.data);
                break;
            case "get-notifications":
                if (json_data.notifs.length) {
                    for (let n of json_data.notifs) {
                        if (n.notif_id) global_notifs.addNotification(n)
                    }
                }
                break;
            case "next-match-starting":
                break;
            case "rematch-status":
                break;
            case "tournament-state":
                break;
            case "tournament-match-state":
                break;
            case "tournament-match-removed":
                break;
            case "tournament-finished":
                break;
            case "queue-stats":
                process_queue_stats(json_data);
                break
        }
        global_ms.handleResponse(action, json_data)
    }
    if (type === "s") {
        let switch_action = action;
        if (action.startsWith("lobby-")) switch_action = "lobby-";
        switch (switch_action) {
            case "apitoken":
                on_get_api_token(data);
                break;
            case "lobby-":
                Lobby.event({
                    action: action
                });
                break;
            case "mm-match-cancelled":
                handle_mm_match_cancelled();
                break;
            case "no-servers-available":
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize("message_no_servers_avail")
                });
                Lobby.match_error();
                break;
            case "party-locations":
                Servers.set_location_selection(data);
                break;
            case "party-regions":
                Servers.set_region_selection(data);
                break;
            case "party-expand-search":
                Servers.set_expand_search(data, false);
                break;
            case "party-queue-penalty-self":
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize_ext("party_penalty_msg_self", {
                        time_left: _seconds_to_string(Number(data))
                    })
                });
                break;
            case "party-queue-penalty":
                queue_dialog_msg({
                    title: localize("title_info"),
                    msg: localize("party_penalty_msg")
                });
                break;
            case "load-char-preset-success":
                clear_profile_data_cache_id(global_self.user_id);
                customize_preset_deselect();
                break;
            case "pickup-leave":
                leave_pickup(data);
                break;
            case "tournament-signup-success":
                if (global_menu_page !== "tourney" && data.length) {
                    open_screen("tournament", {
                        tourney_id: data
                    })
                } else {
                    if (tournament_page) {
                        tournament_page.tourney_signup_success(data)
                    }
                }
                break;
            case "tournament-signoff-success":
                if (tournament_page) {
                    tournament_page.tourney_signoff_success(data)
                }
                break;
            case "tournament-deleted":
                on_tournament_deleted(data);
                break;
            case "offline-friend":
                Friends.update_ingame_store_friend_offline(data);
                break
        }
        global_ms.handleResponse(action, data)
    }
}
let global_on_ms_connected = [];
let global_on_ms_disconnected = [];

function set_masterserver_connection_state(connected, game_id, initial) {
    console.log("=== SET MASTERSERVER CONNECTION STATE", "connected:" + connected, "game_id:" + game_id, "initial:" + initial);
    global_ms_connected = connected;
    if (connected) {
        console.log("POSTMSAUTH000");
        global_ms_connected_count++;
        send_string(CLIENT_COMMAND_GET_INIT_DATA);
        if (game_id === GAME.ids.DIABOTICAL && global_ms_connected_count === 1) {
            initialize_variable("select", "game_decals", true)
        }
        console.log("POSTMSAUTH100");
        for (let cb of global_on_ms_connected) {
            if (typeof cb === "function") cb()
        }
    } else {
        global_party.id = -1;
        Lobby.event({
            action: "lobby-gone"
        });
        apiHandler().resetToken();
        if (!initial) {}
        process_queue_msg("stop");
        for (let cb of global_on_ms_disconnected) {
            if (typeof cb === "function") cb()
        }
        global_tournament_status = {};
        global_tournament_matches = {}
    }
}

function send_json_data(data, returnaction, cb) {
    if (returnaction != undefined && cb != undefined) {
        global_ms.addResponseHandler(returnaction, cb)
    }
    engine.call("send_json", CLIENT_COMMAND_JSON_DATA, JSON.stringify(data))
}

function send_string(command, string, returnaction, cb) {
    if (returnaction != undefined && cb != undefined) {
        global_ms.addResponseHandler(returnaction, cb)
    }
    if (string === undefined) string = "";
    if (typeof string != "string") string = string + "";
    engine.call("send_json", command, string)
}