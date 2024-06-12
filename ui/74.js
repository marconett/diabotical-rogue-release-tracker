const Friends = {
    state: {
        source: null,
        all: {},
        master_connected: false,
        master_blocked: {},
        store_user_ids: [],
        store_id_map: {},
        user_ids_in_party: [],
        requests: [],
        invites: [],
        update_listeners: [],
        update_friend_listeners: [],
        remove_friend_listeners: [],
        update_friend_gamestate_listeners: [],
        friend_request_listeners: [],
        remove_friend_request_listeners: [],
        update_friend_requests_listeners: [],
        invite_listeners: [],
        remove_invite_listeners: [],
        update_invites_listeners: [],
        update_blocked_listeners: [],
        initial_store_friend_data_requested: false,
        master_friend_data_received: false
    },
    init: function() {
        bind_event("set_masterserver_connection_state", (connected => {
            this.state.master_connected = connected;
            if (connected) {
                this._get_ingame_store_friends_data()
            }
        }));
        bind_event("set_friends_data", ((source, data) => {
            let json_data = {};
            try {
                json_data = JSON.parse(data)
            } catch (e) {
                console.log("set_friends_data: Error parsing JSON. err=" + e.message);
                return
            }
            if ("friends" in json_data) this._store_update_full(source, json_data.friends)
        }));
        bind_event("set_friend_data", ((source, data) => {
            let json_data = {};
            try {
                json_data = JSON.parse(data)
            } catch (e) {
                console.log("set_friend_data: Error parsing JSON. err=" + e.message);
                return
            }
            if ("friend" in json_data) this._store_update_partial(source, json_data.friend)
        }))
    },
    add_update_listener: function(listener) {
        this.state.update_listeners.push(listener)
    },
    add_update_friend_listener: function(listener) {
        this.state.update_friend_listeners.push(listener)
    },
    add_remove_friend_listener: function(listener) {
        this.state.remove_friend_listeners.push(listener)
    },
    add_update_friend_gamestate_listener: function(listener) {
        this.state.update_friend_gamestate_listeners.push(listener)
    },
    add_friend_request_listener: function(listener) {
        this.state.friend_request_listeners.push(listener)
    },
    add_remove_friend_request_listener: function(listener) {
        this.state.remove_friend_request_listeners.push(listener)
    },
    add_update_friend_requests_listener: function(listener) {
        this.state.update_friend_requests_listeners.push(listener)
    },
    add_invite_listener: function(listener) {
        this.state.invite_listeners.push(listener)
    },
    add_remove_invite_listener: function(listener) {
        this.state.remove_invite_listeners.push(listener)
    },
    add_update_invites_listener: function(listener) {
        this.state.update_invites_listeners.push(listener)
    },
    add_update_blocked_listener: function(listener) {
        this.state.update_blocked_listeners.push(listener)
    },
    _exec_on_update: function() {
        this._exec_listeners(this.state.update_listeners, [])
    },
    _exec_on_update_friend: function(friend) {
        this._exec_listeners(this.state.update_friend_listeners, [friend])
    },
    _exec_on_remove_friend: function(friend) {
        this._exec_listeners(this.state.remove_friend_listeners, [friend])
    },
    _exec_on_update_friend_gamestate: function(friend) {
        this._exec_listeners(this.state.update_friend_gamestate_listeners, [friend])
    },
    _exec_on_friend_request: function(request) {
        this._exec_listeners(this.state.friend_request_listeners, [request])
    },
    _exec_on_remove_friend_request: function(request) {
        this._exec_listeners(this.state.remove_friend_request_listeners, [request])
    },
    _exec_on_update_friend_requests: function(request) {
        this._exec_listeners(this.state.update_friend_requests_listeners, [request])
    },
    _exec_on_invite: function(invite) {
        this._exec_listeners(this.state.invite_listeners, [invite])
    },
    _exec_on_remove_invite: function(invite) {
        this._exec_listeners(this.state.remove_invite_listeners, [invite])
    },
    _exec_on_update_invites: function(list) {
        this._exec_listeners(this.state.update_invites_listeners, [list])
    },
    _exec_on_update_blocked: function(blocked) {
        this._exec_listeners(this.state.update_blocked_listeners, [blocked])
    },
    _exec_listeners: function(listeners, params) {
        for (let listener of listeners) {
            if (typeof listener !== "function") continue;
            listener(...params)
        }
    },
    _friend_update: function(data) {
        return {
            user_id: data[0],
            name: data[1],
            avatar: data[2],
            online: data[3],
            gamestate: data[4],
            party_privacy: data[5],
            game_id: data[6] === null ? null : parseInt(data[6]),
            friendship_id: typeof data[7] !== "undefined" ? data[7] : null,
            friendship_state: typeof data[8] !== "undefined" ? data[8] : null,
            client_user_id: typeof data[9] !== "undefined" ? data[9] : "",
            friend_token: typeof data[10] !== "undefined" ? data[10] : ""
        }
    },
    _friend_request: function(friend_update) {
        let req = {
            user_id: friend_update.user_id,
            name: friend_update.name,
            avatar: friend_update.avatar
        };
        return req
    },
    _friend_invite: function(data) {
        let req = {
            user_id: data["from-user-id"],
            name: data["from-name"],
            type: data["type"],
            "type-id": data["type-id"]
        };
        return req
    },
    exec_mapped_user_id: function(user_id, cb) {
        if (user_id in this.state.all && this.state.all[user_id].user_id_source === 0) {
            cb(user_id);
            return
        }
        send_string(CLIENT_COMMAND_MAP_USERID, user_id, "map-user-id", (function(data) {
            if (data !== null && typeof data === "object" && "user_id" in data && data.user_id !== null) {
                cb(data.user_id)
            } else {
                cb(user_id)
            }
        }))
    },
    map_user_id: function(client_id, master_id) {
        if (!(client_id in Friends.state.all)) return;
        if (master_id === null || typeof master_id === "undefined") {
            if (client_id in this.state.all) {
                this.state.all[client_id].user_id_source = 0;
                this._exec_on_update_friend(this.state.all[client_id]);
                return
            }
        }
        if (client_id in this.state.store_id_map) return;
        if (client_id in this.state.all) {
            this.state.store_id_map[client_id] = master_id;
            if (client_id !== master_id) {
                this.state.all[master_id] = this.state.all[client_id];
                delete this.state.all[client_id];
                let idx = this.state.store_user_ids.indexOf(client_id);
                if (idx >= 0) this.state.store_user_ids.splice(idx, 1);
                this.state.store_user_ids.push(master_id)
            }
            this.state.all[master_id].user_id_source = 0;
            this.state.all[master_id].user_id = master_id;
            console.log("Mapped client_user_id", client_id, "to user_id", master_id)
        }
        this._exec_on_update()
    },
    get_mapped_user_id: function(client_id) {
        if (client_id in this.state.store_id_map) {
            return this.state.store_id_map[client_id]
        }
        return client_id
    },
    is_friend: function(client_id) {
        if (this.get_mapped_user_id(client_id) in this.state.all) {
            return true
        }
        return false
    },
    _store_update_full: function(source, store_friends) {
        if (!store_friends.length) return;
        this.state.source = parseInt(source);
        let user_ids = {};
        let user_ids_list = [];
        let new_user_ids = [];
        let any_changes = false;
        for (let f of store_friends) {
            if (f.user_id in this.state.store_id_map) f.user_id = this.state.store_id_map[f.user_id];
            user_ids[f.user_id] = true;
            user_ids_list.push(f.user_id);
            if (this.state.initial_store_friend_data_requested && f.in_this_application && f.user_id in this.state.all && !this.state.all[f.user_id].masterfriend && !this.state.all[f.user_id].store_ingame) {
                new_user_ids.push(f.user_id)
            }
            let changed = this._update_store_friend(f, false);
            if (changed) any_changes = true
        }
        for (let user_id of this.state.store_user_ids) {
            if (user_id in user_ids) continue;
            this._remove_store_friend(user_id);
            any_changes = true
        }
        this.state.store_user_ids = user_ids_list;
        if (any_changes) this._exec_on_update();
        if (this.state.master_connected) {
            if (!this.state.initial_store_friend_data_requested) this._get_ingame_store_friends_data();
            else if (new_user_ids.length) this._get_ingame_store_friends_data(new_user_ids)
        }
    },
    _store_update_partial: function(source, store_friend) {
        if (this.state.source !== parseInt(source)) return;
        if (store_friend.user_id in this.state.store_id_map) store_friend.user_id = this.state.store_id_map[store_friend.user_id];
        if (!this.state.all.hasOwnProperty(store_friend.user_id)) {
            this._create_store_friend(store_friend, true);
            return
        }
        let has_come_online = false;
        if (!this.state.all[store_friend.user_id].store_ingame && store_friend.in_this_application) has_come_online = true;
        this.state.all[store_friend.user_id].name = store_friend.name;
        this.state.all[store_friend.user_id].storefriend = true;
        this.state.all[store_friend.user_id].online = store_friend.presence_status == "offline" ? false : true;
        this.state.all[store_friend.user_id].store_ingame = store_friend.in_this_application ? true : false;
        this.state.all[store_friend.user_id].category = this._get_friend_category(this.state.all[store_friend.user_id]);
        this._exec_on_update_friend(this.state.all[store_friend.user_id]);
        if (has_come_online) {
            this._get_ingame_store_friends_data([store_friend.client_user_id])
        }
    },
    _update_store_friend: function(data, exec_update) {
        if (!this.state.all.hasOwnProperty(data.user_id)) {
            this._create_store_friend(data, exec_update);
            return true
        }
        if (data.account_status !== "friends") {
            this._remove_store_friend(data.user_id);
            return true
        }
        let friend = this.state.all[data.user_id];
        let changed = false;
        if (friend.name !== data.name) changed = true;
        if (friend.storefriend === false) changed = true;
        if (friend.online !== (data.presence_status == "offline" ? false : true)) changed = true;
        if (friend.store_ingame !== (data.in_this_application ? true : false)) changed = true;
        let prev_category = friend.category;
        friend.name = data.name;
        friend.storefriend = true;
        friend.online = data.presence_status == "offline" ? false : true;
        friend.store_ingame = data.in_this_application ? true : false;
        friend.category = this._get_friend_category(friend);
        if (friend.ingame && !data.in_this_application) {
            friend.ingame = false;
            changed = true
        }
        if (friend.category !== prev_category) changed = true;
        if (exec_update) this._exec_on_update_friend(friend);
        return changed
    },
    _create_store_friend: function(data, exec_update) {
        if (data.account_status !== "friends") return;
        this.state.all[data.user_id] = {
            user_id_source: this.state.source,
            user_id: data.user_id,
            client_user_id: data.user_id,
            name: data.name,
            avatar: "",
            game_id: null,
            storefriend: true,
            masterfriend: false,
            online: data.presence_status == "offline" ? false : true,
            ingame: false,
            store_ingame: data.in_this_application ? true : false,
            inparty: this.state.user_ids_in_party.includes(data.user_id) ? true : false,
            gamestate: "",
            party_privacy: true,
            friendship_id: null,
            friendship_state: -1,
            category: "",
            friend_token: ""
        };
        this.state.all[data.user_id].category = this._get_friend_category(this.state.all[data.user_id]);
        if (exec_update) this._exec_on_update_friend(this.state.all[data.user_id])
    },
    _remove_store_friend: function(user_id) {
        if (!this.state.all.hasOwnProperty(user_id)) return;
        delete this.state.store_id_map[user_id];
        let idx = this.state.store_user_ids.indexOf(user_id);
        if (idx >= 0) this.state.store_user_ids.splice(idx, 1);
        if (this.state.all[user_id].masterfriend) {
            this.state.all[user_id].storefriend = false;
            this.state.all[user_id].online = false;
            this.state.all[user_id].category = this._get_friend_category(this.state.all[user_id]);
            this._exec_on_update_friend(this.state.all[user_id])
        } else {
            let former_friend = this.state.all[user_id];
            delete this.state.all[user_id];
            this._exec_on_remove_friend(former_friend)
        }
    },
    master_update: function(master_friends) {
        this.state.requests.length = 0;
        for (let friend_data of master_friends) {
            let friend_update = this._friend_update(friend_data);
            if (friend_update.friendship_state == 1) {
                this.state.requests.push(this._friend_request(friend_update))
            } else {
                this._update_master_friend(friend_update, false)
            }
        }
        this._exec_on_update_friend_requests(this.state.requests);
        this._exec_on_update();
        this.state.master_friend_data_received = true
    },
    master_update_partial: function(data) {
        let friend_update = this._friend_update(data);
        this.map_user_id(friend_update.client_user_id, friend_update.user_id);
        if (!this.state.all.hasOwnProperty(friend_update.user_id)) {
            this._create_master_friend(friend_update, true);
            return
        }
        this.state.all[friend_update.user_id].name = friend_update.name;
        this.state.all[friend_update.user_id].avatar = friend_update.avatar;
        this.state.all[friend_update.user_id].ingame = friend_update.online;
        this.state.all[friend_update.user_id].gamestate = friend_update.gamestate;
        this.state.all[friend_update.user_id].party_privacy = friend_update.party_privacy;
        this.state.all[friend_update.user_id].game_id = friend_update.game_id;
        this.state.all[friend_update.user_id].category = this._get_friend_category(this.state.all[friend_update.user_id]);
        this.state.all[friend_update.user_id].friend_token = friend_update.friend_token;
        this._exec_on_update_friend(this.state.all[friend_update.user_id])
    },
    _update_master_friend(friend_update, exec_update) {
        this.map_user_id(friend_update.client_user_id, friend_update.user_id);
        if (!this.state.all.hasOwnProperty(friend_update.user_id)) {
            this._create_master_friend(friend_update, exec_update);
            return
        }
        let friend = this.state.all[friend_update.user_id];
        friend.masterfriend = true;
        friend.name = friend_update.name;
        friend.ingame = friend_update.online;
        friend.gamestate = friend_update.gamestate;
        friend.party_privacy = friend_update.party_privacy;
        friend.game_id = friend_update.game_id;
        friend.friendship_state = friend_update.friendship_state;
        friend.category = this._get_friend_category(friend);
        friend.friend_token = friend_update.friend_token;
        if (exec_update) this._exec_on_update_friend(friend)
    },
    _create_master_friend: function(friend_update, exec_update) {
        this.state.all[friend_update.user_id] = {
            user_id_source: 0,
            user_id: friend_update.user_id,
            client_user_id: "",
            name: friend_update.name,
            avatar: friend_update.avatar,
            game_id: friend_update.game_id,
            storefriend: false,
            masterfriend: true,
            online: false,
            ingame: friend_update.online,
            store_ingame: false,
            inparty: this.state.user_ids_in_party.includes(friend_update.user_id) ? true : false,
            gamestate: friend_update.gamestate,
            party_privacy: friend_update.party_privacy,
            friendship_id: friend_update.friendship_id,
            friendship_state: friend_update.friendship_state,
            category: "",
            friend_token: friend_update.friend_token
        };
        this.state.all[friend_update.user_id].category = this._get_friend_category(this.state.all[friend_update.user_id]);
        if (exec_update) this._exec_on_update_friend(this.state.all[friend_update.user_id])
    },
    remove_master_friend(user_id) {
        if (!this.state.all.hasOwnProperty(user_id)) return;
        if (this.state.all[user_id].storefriend) {
            this.state.all[user_id].masterfriend = false;
            this.state.all[user_id].friendship_id = null;
            this.state.all[user_id].friendship_state = -1;
            this._exec_on_update_friend(this.state.all[user_id])
        } else {
            let former_friend = this.state.all[user_id];
            delete this.state.all[user_id];
            this._exec_on_remove_friend(former_friend)
        }
    },
    master_update_blocked(data) {
        this.state.master_blocked = data;
        this._exec_on_update_blocked(this.state.master_blocked)
    },
    master_add_blocked(user_id, name) {
        this.state.master_blocked[user_id] = name;
        this.remove_request(user_id);
        this.remove_invite({
            user_id: user_id,
            type: "all",
            direction: "all"
        });
        this._exec_on_update_blocked(this.state.master_blocked)
    },
    master_remove_blocked(user_id) {
        delete this.state.master_blocked[user_id];
        this._exec_on_update_blocked(this.state.master_blocked)
    },
    add_request: function(data) {
        let friend_update = this._friend_update(data);
        for (let req of this.state.requests) {
            if (friend_update.user_id === req.user_id) return
        }
        this.state.requests.push(this._friend_request(friend_update));
        this._exec_on_friend_request(friend_update)
    },
    request_accepted: function(data) {
        let friend_update = this._friend_update(data);
        this.remove_request(friend_update.user_id);
        this._update_master_friend(friend_update, true)
    },
    remove_request: function(user_id) {
        for (let i = this.state.requests.length - 1; i >= 0; i--) {
            if (this.state.requests[i].user_id == user_id) {
                this.state.requests.splice(i, 1);
                this._exec_on_remove_friend_request(user_id);
                break
            }
        }
    },
    update_invites: function(list) {
        this.state.invites.length = 0;
        for (let i of list) {
            if ("from-client-user-id" in i) {
                if (!this.state.all.hasOwnProperty(i["from-user-id"]) && !this.state.all.hasOwnProperty(i["from-client-user-id"])) return;
                this.map_user_id(i["from-client-user-id"], i["from-user-id"])
            } else {
                if (!this.state.all.hasOwnProperty(i["from-user-id"])) return
            }
            this.state.invites.push(this._friend_invite(i))
        }
        this._exec_on_update_invites(this.state.invites)
    },
    add_invite: function(data) {
        if ("from-client-user-id" in data) {
            if (!this.state.all.hasOwnProperty(data["from-user-id"]) && !this.state.all.hasOwnProperty(data["from-client-user-id"])) return;
            this.map_user_id(data["from-client-user-id"], data["from-user-id"])
        } else {
            if (!this.state.all.hasOwnProperty(data["from-user-id"])) return
        }
        this._exec_on_invite(this._friend_invite(data))
    },
    remove_invite: function(data) {
        let removed = false;
        for (let i = 0; i < this.state.invites.length; i++) {
            if (this.state.invites[i].user_id === data.user_id) {
                if (data.type === "all" || this.state.invites[i].type === data.type) {
                    this.state.invites.splice(i, 1);
                    removed = true
                }
            }
        }
        if (removed) {
            this._exec_on_remove_invite(data)
        }
    },
    gamestate_update: function(user_id, gamestate) {
        if (this.state.all.hasOwnProperty(user_id)) {
            this.state.all[user_id].gamestate = gamestate;
            this._exec_on_update_friend_gamestate(this.state.all[user_id])
        }
    },
    _get_ingame_store_friends_data: function(new_user_ids) {
        let user_ids = [];
        if (typeof new_user_ids !== "undefined" && Array.isArray(new_user_ids)) {
            if (new_user_ids.length === 0) return;
            user_ids = new_user_ids
        } else {
            for (let user_id in this.state.all) {
                if (this.state.all[user_id].storefriend && !this.state.all[user_id].masterfriend && this.state.all[user_id].store_ingame) {
                    user_ids.push(user_id)
                }
            }
        }
        if (user_ids.length) {
            initial_store_friend_data_requested = true;
            send_string(CLIENT_COMMAND_GET_ONLINE_FRIENDS_DATA, user_ids.join(":"))
        }
    },
    update_ingame_store_friends_data: function(data) {
        for (let f of data) {
            this.map_user_id(f[4], f[0]);
            if (this.state.all.hasOwnProperty(f[0])) {
                this.state.all[f[0]].ingame = true;
                this.state.all[f[0]].party_privacy = f[1];
                this.state.all[f[0]].avatar = f[2];
                this.state.all[f[0]].gamestate = f[3];
                this.state.all[f[0]].friend_token = f[5];
                let game_id = f[3].split(":")[0];
                this.state.all[f[0]].game_id = game_id ? parseInt(game_id) : null;
                this.state.all[f[0]].category = this._get_friend_category(this.state.all[f[0]]);
                if (data.length === 1) this._exec_on_update_friend(this.state.all[f[0]])
            }
        }
        if (data.length > 1) this._exec_on_update()
    },
    update_ingame_store_friend_offline: function(data) {
        if (!data || !data.length) return;
        let split = data.split(":");
        if (split.length < 2) return;
        let user_id = split[0];
        let client_user_id = split[1];
        this.map_user_id(client_user_id, user_id);
        if (user_id in this.state.all && !this.state.all[user_id].masterfriend) {
            this.state.all[user_id].ingame = false;
            this.state.all[user_id].inparty = false;
            this.state.all[user_id].gamestate = "";
            this.state.all[user_id].category = "";
            this.state.all[user_id].friend_token = "";
            this._exec_on_update_friend(this.state.all[user_id])
        }
    },
    _get_friend_category: function(friend) {
        let category = "";
        if (friend.ingame) {
            if (friend.game_id === GAME.active) {
                category = "ingame"
            } else {
                category = "othergame"
            }
        } else {
            if (friend.online) {
                category = "online"
            } else {
                category = "offline"
            }
        }
        return category
    },
    get_friend_request: function(user_id) {
        for (let req of this.state.requests) {
            if (req.user_id === user_id) {
                return req
            }
        }
        return null
    },
    send_invite_decline: function(type, type_id) {
        send_json_data({
            action: "invite-decline",
            type: type,
            "type-id": type_id
        })
    },
    send_invite_accept: function(type, type_id) {
        if (type == "lobby") {
            send_json_data({
                action: "lobby-join",
                "lobby-id": type_id
            })
        }
        if (type == "party") {
            send_json_data({
                action: "party-join",
                "party-id": type_id
            })
        }
    },
    send_invite_add: function(type, user_id) {
        let type_id = null;
        if (type === "party") {
            type_id = global_party.id
        } else if (type === "lobby") {
            type_id = Lobby.state.id
        }
        if (type_id) {
            engine.call("send_invite", type, type_id, user_id)
        }
    }
};