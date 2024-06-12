let global_user_battlepass = {};
let global_battlepass_list = [];
let global_battlepass_map = {};
let global_latest_battlepass = null;
let global_battlepass_rewards_cache = {};
let global_initial_bp_data_loaded = false;
const on_load_active_battlepass = [];

function load_active_battlepass_data(cb) {
    api_request("GET", "/user/battlepass", {}, (function(data) {
        global_user_battlepass = data;
        global_battlepass_map[data.battlepass_id] = data;
        for (let cb of on_load_active_battlepass) {
            if (typeof cb === "function") cb(data, !global_initial_bp_data_loaded)
        }
        if (typeof cb === "function") cb(data);
        global_initial_bp_data_loaded = true
    }))
}

function load_battlepass_rewards_data(battlepass_id, cb) {
    api_request("GET", "/user/battlepass/" + battlepass_id + "/rewards", {}, (function(data) {
        global_battlepass_rewards_cache[battlepass_id] = format_battlepass_rewards(data.rewards);
        if (typeof cb === "function") cb(global_battlepass_rewards_cache[battlepass_id])
    }))
}

function format_battlepass_rewards(reward_array) {
    let level_rewards = {};
    for (let r of reward_array) {
        if (!(r.battlepass_reward_level in level_rewards)) level_rewards[r.battlepass_reward_level] = [];
        level_rewards[r.battlepass_reward_level].push(r)
    }
    let rewards = {};
    let levels = Object.keys(level_rewards).map((function(x) {
        return parseInt(x)
    })).sort((function(a, b) {
        return a - b
    }));
    for (let level of levels) {
        rewards[level] = level_rewards[level]
    }
    return rewards
}

function load_battlepass_list(cb) {
    if (!global_battlepass_list.length) {
        api_request("GET", "/user/battlepass/list", {}, (function(data) {
            handle_battlepass_list_update(data.battlepass_list);
            if (typeof cb === "function") cb()
        }))
    } else {
        if (typeof cb === "function") cb()
    }
}
let on_load_battlepass_list = [];

function handle_battlepass_list_update(data) {
    global_battlepass_list = data;
    global_latest_battlepass = null;
    for (let bp of global_battlepass_list) {
        global_battlepass_map[bp.battlepass_id] = bp;
        if (bp.battlepass.current_bp) global_latest_battlepass = bp
    }
    for (let cb of on_load_battlepass_list) {
        if (typeof cb === "function") cb()
    }
}

function battlepass_set_active(battlepass_id, cb) {
    send_string(CLIENT_COMMAND_SET_ACTIVE_BATTLEPASS, battlepass_id, "battlepass-activated", (function() {
        global_battlepass_list.length = 0;
        load_active_battlepass_data((() => {
            load_battlepass_rewards_data(battlepass_id, (() => {
                if (typeof cb === "function") cb()
            }))
        }))
    }))
}

function battlepass_update_progress(progress) {
    if (!("to" in progress)) return;
    global_user_battlepass.battlepass.xp = Number(progress.to.xp);
    global_user_battlepass.battlepass.level = Number(progress.to.level);
    global_user_battlepass.progression.xp = Number(progress.to.xp);
    global_user_battlepass.progression.level = Number(progress.to.level);
    global_user_battlepass.progression.cur_level_req = Number(progress.to.cur_level_req);
    global_user_battlepass.progression.next_level_req = Number(progress.to.next_level_req);
    if (progress.battlepass_id in global_battlepass_map) {
        global_battlepass_map[progress.battlepass_id].battlepass.xp = Number(progress.to.xp);
        global_battlepass_map[progress.battlepass_id].battlepass.level = Number(progress.to.level);
        global_battlepass_map[progress.battlepass_id].progression.xp = Number(progress.to.xp);
        global_battlepass_map[progress.battlepass_id].progression.level = Number(progress.to.level);
        global_battlepass_map[progress.battlepass_id].progression.cur_level_req = Number(progress.to.cur_level_req);
        global_battlepass_map[progress.battlepass_id].progression.next_level_req = Number(progress.to.next_level_req)
    }
}

function purchase_battlepass(type, battlepass_id, cb) {
    api_request("POST", `/shop/battlepass/${type}/purchase`, {
        battlepass_id: battlepass_id
    }, (data => {
        if (data.success == true) {
            update_wallet(data.coins);
            if (data.battlepass_id in global_battlepass_map) {
                global_battlepass_map[data.battlepass_id].battlepass.owned = true;
                global_battlepass_map[data.battlepass_id].battlepass.level = data.level;
                global_battlepass_map[data.battlepass_id].battlepass.xp = data.xp;
                global_battlepass_map[data.battlepass_id].battlepass.seen = true;
                global_battlepass_map[data.battlepass_id].progression = data.progression
            }
            if (data.battlepass_id === global_user_battlepass.battlepass_id) {
                global_user_battlepass.battlepass.owned = true;
                global_user_battlepass.battlepass.level = data.level;
                global_user_battlepass.battlepass.xp = data.xp;
                global_user_battlepass.battlepass.seen = true;
                global_user_battlepass.progression = data.progression
            }
            if (data.battlepass_id === global_latest_battlepass.battlepass_id) {
                global_latest_battlepass = global_battlepass_map[data.battlepass_id]
            }
            send_string(CLIENT_COMMAND_RELOAD_CLIENT_DATA);
            if (data.notifs.length) {
                for (let n of data.notifs) {
                    if (n.items && n.items.length) {
                        add_user_customizations(n.items)
                    }
                    global_notifs.addNotification(n)
                }
            }
        }
        if (typeof cb === "function") cb(data)
    }))
}

function purchase_battlepass_levels(levels, cb) {
    api_request("POST", "/shop/battlepass/tier/purchase", {
        levels: levels
    }, (data => {
        if (data.success == true) {
            update_wallet(data.coins);
            global_user_battlepass.battlepass.level = data.level;
            global_user_battlepass.battlepass.xp = data.xp;
            global_user_battlepass.progression = data.progression;
            if (global_user_battlepass.battlepass_id in global_battlepass_map) {
                global_battlepass_map[global_user_battlepass.battlepass_id].battlepass.level = data.level;
                global_battlepass_map[global_user_battlepass.battlepass_id].battlepass.xp = data.xp;
                global_battlepass_map[global_user_battlepass.battlepass_id].progression = data.progression
            }
            if (data.notifs.length) {
                for (let n of data.notifs) {
                    if (n.items && n.items.length) {
                        add_user_customizations(n.items)
                    }
                    global_notifs.addNotification(n)
                }
            }
        }
        if (typeof cb === "function") cb(data)
    }))
}
const on_battlepass_update_handlers = [];

function trigger_battlepass_update_handlers() {
    for (let cb of on_battlepass_update_handlers) {
        if (typeof cb === "function") {
            cb()
        }
    }
}