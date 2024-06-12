var global_party = {
    id: -1,
    party_hash: null,
    size: 0,
    leader_id: 0,
    privacy: false,
    members: {},
    member_ids: [],
    modes: [],
    roles: {},
    "role-reqs": {},
    "valid-modes": [],
    pickup_ids: [],
    fill: false,
    ready: {}
};
var bool_am_i_leader = false;
let queue_mode_update_id = 0;
var queue_mode_confirmed_update_id = 0;
let global_queue_selection = {};
let party_status_handlers = [];
let party_mode_update_handlers = [];

function handle_party_event(data) {
    if (data.action == "party-status") {
        let init = false;
        if (global_party.id == -1) init = true;
        let party_changed = false;
        if (global_party.id != data["party-id"]) party_changed = true;
        global_self.user_id = data["user-id"];
        global_party.id = data["party-id"];
        global_party.party_hash = data.data["party-hash"];
        global_party.leader_id = data.data["leader-id"];
        global_party.privacy = data["privacy"];
        global_party.size = Object.keys(data.data.members).length;
        global_party["valid-modes"] = data["valid-modes"];
        global_party["members"] = {};
        global_party["member_ids"] = [];
        if ("fill" in data.data) global_party.fill = data.data.fill;
        if ("ready" in data.data) global_party.ready = data.data.ready;
        Friends.state.user_ids_in_party.length = 0;
        for (let m of data.data.members) {
            global_party["members"][m["user_id"]] = m;
            global_party["member_ids"].push(m["user_id"]);
            if (m.user_id == data["user-id"]) {
                global_self.data = m
            } else {
                Friends.map_user_id(m.client_user_id, m.user_id);
                Friends.state.user_ids_in_party.push(m.user_id);
                if (Friends.state.all.hasOwnProperty(m.user_id)) {
                    Friends.state.all[m.user_id].inparty = true;
                    Friends.state.all[m.user_id].gamestate = m.gamestate
                }
            }
        }
        let removed_users = [];
        for (let user_id in Friends.state.all) {
            if (Friends.state.all[user_id].inparty) {
                if (!Friends.state.user_ids_in_party.includes(user_id)) {
                    Friends.state.all[user_id].inparty = false;
                    removed_users.push(user_id)
                }
            }
        }
        update_party_leader_status(data["leader"]);
        if ((init || data.init == true) && bool_am_i_leader) {
            global_party.pickup_ids = [];
            if (global_menu_page == "play") render_play_screen_combined_list()
        }
        if ("locations" in data) {
            Servers.set_location_selection(data.locations)
        }
        if ("regions" in data) {
            Servers.set_region_selection(data.regions)
        }
        if ("expand_search" in data) {
            Servers.set_expand_search(data.expand_search, false)
        }
        if (data.init == true) {
            process_queue_msg("stop")
        }
        let update_modes = true;
        if (bool_am_i_leader && queue_mode_confirmed_update_id < queue_mode_update_id) update_modes = false;
        if (update_modes) {
            global_party["modes"] = data.data["modes"];
            if (!init) {
                for (let cb of party_mode_update_handlers) {
                    if (typeof cb === "function") cb(global_party)
                }
            }
        }
        if (Lobby.state.id != data["lobby-id"]) {
            send_json_data({
                action: "lobby-status"
            })
        }
        for (let cb of party_status_handlers) {
            if (typeof cb === "function") cb(party_changed, global_party, removed_users)
        }
        if (party_changed) {
            queue_mode_update_id = 0;
            queue_mode_confirmed_update_id = 0
        }
        return
    } else if (data.action == "party-update-modes") {
        if (bool_am_i_leader && data.update_id && data.update_id !== -1) {
            if (queue_mode_confirmed_update_id < data.update_id) queue_mode_confirmed_update_id = data.update_id;
            if (data.update_id < queue_mode_update_id) return
        }
        global_party["modes"] = data.data["modes"];
        global_party["roles"] = data.data["roles"];
        global_party["role-reqs"] = data.data["role-reqs"];
        for (let cb of party_mode_update_handlers) {
            if (typeof cb === "function") cb(global_party)
        }
        return
    } else if (data.action == "party-queue-action") {
        process_queue_msg(data.msg);
        return
    }
}
let party_leader_update_handlers = [];

function update_party_leader_status(leader) {
    let leader_status_changed = false;
    if (bool_am_i_leader != leader) {
        leader_status_changed = true;
        bool_am_i_leader = leader
    }
    for (let cb of party_leader_update_handlers) {
        if (typeof cb === "function") cb(leader_status_changed, bool_am_i_leader)
    }
}

function party_context_select(cmd, user_id) {
    if (cmd == "remove") {
        send_json_data({
            action: "party-remove",
            "user-id": user_id
        })
    }
    if (cmd == "leave") {
        send_json_data({
            action: "party-leave"
        })
    }
    if (cmd == "promote") {
        send_json_data({
            action: "party-promote",
            "user-id": user_id
        })
    }
}