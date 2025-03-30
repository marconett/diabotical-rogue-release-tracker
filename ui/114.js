const page_session_select = new function() {
    let online_sessions_enabled = true;
    let online_connection_state = 0;
    let online_connection_failed = false;
    let online_sessions = [];
    let offline_sessions = [];
    let offline_session_available = false;
    let html = {
        main: null,
        offline_list: null,
        online_list: null,
        connection_state: null
    };
    this.init = () => {
        html.main = _id("session_select");
        html.offline_list = html.main.querySelector(".offline_sessions .list");
        html.online_list = html.main.querySelector(".online_sessions .list");
        html.connection_state = html.main.querySelector(".online_sessions .connection_state");
        html.online_list.classList.remove("visible");
        html.connection_state.classList.add("visible");
        bind_event("set_masterserver_connection_state", ((connected, game_id) => {
            ms_connection_state(connected, game_id)
        }));
        bind_event("masterserver_connection_initiated", (() => {
            online_connection_state = 0;
            online_connection_failed = false;
            html.connection_state.textContent = "Connecting...";
            html.online_list.classList.remove("visible");
            html.connection_state.classList.add("visible")
        }));
        bind_event("masterserver_connection_failed", (() => {
            console.log("masterserver_connection_failed");
            html.connection_state.textContent = "Connection failed.";
            online_connection_failed = true
        }));
        bind_event("set_queue_position", (position => {
            set_queue_position(position)
        }));
        bind_event("set_offline_party_session", (available => {
            offline_session_available = available ? true : false;
            render_sessions(PartySession.SESSION_TYPE.offline)
        }));
        global_ms.addPermanentResponseHandler("party-session-gone", (data => {
            for (let i = online_sessions.length - 1; i >= 0; i--) {
                if (online_sessions[i].party_session_id === data.party_session_id) {
                    online_sessions.splice(i, 1)
                }
            }
            render_sessions(PartySession.SESSION_TYPE.online, online_sessions)
        }))
    };

    function close_session_select() {
        close_menu()
    }
    this.close = () => {
        close_session_select()
    };

    function render_sessions(type, sessions) {
        let container = null;
        let new_btn_text = "";
        if (type === PartySession.SESSION_TYPE.online) {
            container = html.online_list;
            new_btn_text = "Start new online run"
        } else if (type === PartySession.SESSION_TYPE.offline) {
            container = html.offline_list;
            new_btn_text = "Start new offline run"
        }
        if (!sessions) sessions = [];
        _empty(container);
        let new_session_el = _createElement("div", "new_session");
        let new_session_btn = _createElement("div", ["db-btn", "startnew"], new_btn_text);
        new_session_el.appendChild(new_session_btn);
        container.appendChild(new_session_el);
        if (!online_sessions_enabled && type === PartySession.SESSION_TYPE.online) {
            new_session_btn.classList.add("disabled")
        } else {
            new_session_btn.addEventListener("click", (() => {
                PartySession.new_session(type);
                close_session_select()
            }))
        }
        if (type === PartySession.SESSION_TYPE.offline && offline_session_available) {
            let load_session_el = _createElement("div", "load_session");
            let load_session_btn = _createElement("div", ["db-btn", "loadoffline"], "Continue offline run");
            load_session_el.appendChild(load_session_btn);
            container.appendChild(load_session_el);
            load_session_btn.addEventListener("click", (() => {
                PartySession.load_session(type, "offline", {});
                close_session_select()
            }))
        }
        for (let s of sessions) {
            let session_el = _createElement("div", "session");
            let title = _createElement("div", "title", "Session: " + s.party_session_id);
            session_el.appendChild(title);
            let abandon_button = _createElement("div", "db-btn", "Abandon");
            session_el.appendChild(abandon_button);
            abandon_button.addEventListener("click", (e => {
                e.stopPropagation();
                genericModal(localize("abandon_run"), localize("abandon_run_text"), localize("cancel"), null, localize("menu_button_confirm"), (() => {
                    send_json_data({
                        action: "party-abandon-session",
                        party_session_id: s.party_session_id
                    })
                }))
            }));
            let load_button = _createElement("div", "db-btn", "Load");
            session_el.appendChild(load_button);
            load_button.addEventListener("click", (e => {
                e.stopPropagation();
                console.log("session data click", _dump(s));
                PartySession.load_session(type, s.party_session_id, s);
                close_session_select()
            }));
            container.appendChild(session_el)
        }
        if (type === PartySession.SESSION_TYPE.online) {
            html.online_list.classList.add("visible");
            html.connection_state.classList.remove("visible")
        }
    }

    function load_online_sessions() {
        api_request("GET", "/party_sessions", {
            active: true
        }, (data => {
            console.log("=== load sessions data:", _dump(data));
            if (data && data.party_sessions) {
                online_sessions = data.party_sessions
            } else {
                online_sessions = [];
                console.log("ERROR loading party sessions", _dump(data))
            }
            render_sessions(PartySession.SESSION_TYPE.online, online_sessions)
        }))
    }
    this.load_offline_sessions = () => {
        render_sessions(PartySession.SESSION_TYPE.offline, offline_sessions)
    };

    function ms_connection_state(connected, game_id) {
        if (connected && game_id === GAME.active) {
            if (online_connection_state === 0) {
                html.connection_state.textContent = "Retrieving list of runs...";
                online_connection_state = 1;
                add_on_get_api_token_handler(false, (() => {
                    load_online_sessions()
                }))
            }
        } else {
            online_connection_state = 0
        }
    }

    function set_queue_position(position) {
        if (online_connection_state !== 0) return;
        html.connection_state.textContent = "Connecting... position in queue: " + position
    }
};