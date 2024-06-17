const GAME = new function() {
    this.ids = {
        COMMON: 9999,
        DIABOTICAL: 0,
        INVASION: 1,
        ROGUE: 2
    };
    this.data = {};
    const handlers = {};
    const activate_callbacks = [];
    const deactivate_callbacks = [];
    this.active = null;
    this.set_active = game_id => {
        if (game_id === -1) return;
        console.log("GAME.set_active", game_id);
        let prev_active = this.active;
        this.active = parseInt(game_id);
        if (prev_active) {
            if (prev_active in handlers) handlers[prev_active].set_inactive();
            for (let cb of deactivate_callbacks) {
                if (typeof cb === "function") cb(prev_active)
            }
        }
        if (game_id in handlers) handlers[game_id].set_active();
        for (let cb of activate_callbacks) {
            if (typeof cb === "function") cb(this.active)
        }
        apiHandler().updateUrl(API_URL + this.get_data("API_PATH"))
    };
    this.set_inactive = () => {
        if (this.active in handlers) {
            handlers[this.active].set_inactive()
        }
        for (let cb of deactivate_callbacks) {
            if (typeof cb === "function") cb(this.active)
        }
        this.active = null;
        engine.call("reset_game")
    };
    this.set_all_inactive = () => {
        for (let game_id in handlers) {
            handlers[game_id].set_inactive()
        }
    };
    this.add_activate_callback = cb => {
        if (typeof cb === "function") activate_callbacks.push(cb);
        if (this.active !== null) cb(this.active)
    };
    this.add_deactivate_callback = cb => {
        if (typeof cb === "function") deactivate_callbacks.push(cb)
    };
    handlers[this.ids.ROGUE] = {
        set_active: () => {
            let menu = _id("main_menu");
            if (menu) {
                menu.classList.add("game_" + this.ids.ROGUE)
            }
            _for_each_in_class("show_game_" + this.ids.ROGUE, (el => {
                el.classList.add("game_visible");
                el.classList.remove("disabled")
            }))
        },
        set_inactive: () => {
            let menu = _id("main_menu");
            if (menu) {
                menu.classList.remove("game_" + this.ids.ROGUE)
            }
            _for_each_in_class("show_game_" + this.ids.ROGUE, (el => {
                el.classList.remove("game_visible");
                el.classList.add("disabled")
            }))
        }
    };
    handlers[this.ids.INVASION] = {
        set_active: () => {
            let menu = _id("main_menu");
            if (menu) {
                menu.classList.add("game_" + this.ids.INVASION)
            }
            _for_each_in_class("show_game_" + this.ids.INVASION, (el => {
                el.classList.add("game_visible");
                el.classList.remove("disabled")
            }))
        },
        set_inactive: () => {
            let menu = _id("main_menu");
            if (menu) {
                menu.classList.remove("game_" + this.ids.INVASION)
            }
            _for_each_in_class("show_game_" + this.ids.INVASION, (el => {
                el.classList.remove("game_visible");
                el.classList.add("disabled")
            }))
        }
    };
    this.get_data = (name, key) => this.get_game_data(this.active, name, key);
    this.set_data = (name, data) => {
        this.set_game_data(this.active, name, data)
    };
    this.get_game_data = (game_id, name, key) => {
        if (!name) return null;
        if (!(game_id in this.data)) return null;
        if (!(name in this.data[game_id])) return null;
        if (typeof key !== "undefined" || key === null) {
            if (key === null) return null;
            if (typeof this.data[game_id][name] !== "object") return null;
            if (!(key in this.data[game_id][name])) return null;
            return this.data[game_id][name][key]
        } else {
            return this.data[game_id][name]
        }
    };
    this.set_game_data = (game_id, name, data) => {
        if (!(game_id in this.data)) {
            this.data[game_id] = {}
        }
        this.data[game_id][name] = data
    };
    this.set_game_key_data = (game_id, name, key, data) => {
        if (!(game_id in this.data)) {
            this.data[game_id] = {}
        }
        if (!(name in this.data[game_id])) {
            this.data[game_id][name] = {}
        }
        this.data[game_id][name][key] = data
    };
    this.set_initial_data = (game_id, data) => {
        if (game_id in this.data) {
            console.error("WARNING - Overwriting existing game data! This might not be intended behaviour!")
        }
        this.data[game_id] = data
    }
};