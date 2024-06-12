var global_self = {
    user_id: "",
    lan_ip: "",
    data: undefined,
    friend_requests: null,
    private: {
        coins: 0,
        challenge_reroll_ts: null
    },
    mmr: {}
};
let twitch_drops_checked = false;
GAME.add_deactivate_callback((() => {
    twitch_drops_checked = false
}));
let request_user_info = true;
const on_load_user_info_handlers = [];

function load_user_info() {
    if (!request_user_info) return;
    api_request("GET", "/user", {}, (function(data) {
        let user_info = data && data.user ? data : undefined;
        if (user_info) {
            global_self.user_id = user_info.user.user_id;
            global_self.private.permissions = user_info.user.permissions;
            global_self.private.challenge_reroll_ts = user_info.user.challenge_reroll_ts == null ? null : new Date(user_info.user.challenge_reroll_ts);
            update_wallet(user_info.user.coins);
            if (global_ms_connected && global_ms_connected_count <= 1) {
                if (global_menu_page === "create") content_creation_page.update_maps_list(true)
            }
            for (let cb of on_load_user_info_handlers) {
                if (typeof cb === "function") cb(user_info)
            }
            if (user_info.hasOwnProperty("social_profiles")) {
                twitch_profile = user_info.social_profiles.find((c => c.type === "twitch"));
                if (twitch_profile && !twitch_drops_checked) {
                    twitch_drops_checked = true;
                    api_request("GET", "/twitch/drops", {}, (function(data) {
                        if (data && "notif" in data) {
                            if (n.items && n.items.length) {
                                add_user_customizations(n.items)
                            }
                            global_notifs.addNotification(data.notif)
                        }
                    }))
                }
            }
            request_user_info = false
        }
    }))
}
const on_own_data_changed = [];

function update_own_data(key, data) {
    global_self[key] = data;
    for (let cb of on_own_data_changed) {
        if (typeof cb === "function") cb()
    }
}

function replaceChallenge(challenge_id, new_challenge) {
    for (let i = 0; i < global_user_battlepass.challenges.length; i++) {
        if (global_user_battlepass.challenges[i].challenge_id == challenge_id) {
            global_user_battlepass.challenges[i] = new_challenge;
            break
        }
    }
}
const on_challenges_update_handlers = [];

function updateChallenges() {
    for (let cb of on_challenges_update_handlers) {
        if (typeof cb === "function") {
            if (global_user_battlepass && global_user_battlepass.challenges) {
                cb(global_user_battlepass.challenges)
            } else {
                cb(null)
            }
        }
    }
}
let on_update_wallet = [];

function update_wallet(coins) {
    global_self.private.coins = coins;
    for (let cb of on_update_wallet) {
        if (typeof cb === "function") cb()
    }
}