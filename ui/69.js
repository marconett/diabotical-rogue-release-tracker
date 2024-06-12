const PartySession = new function() {
    const SESSION_TYPE = Object.freeze({
        offline: 0,
        online: 1
    });
    this.SESSION_TYPE = SESSION_TYPE;
    this.party_session_type = SESSION_TYPE.offline;
    this.party_session_id = null;
    this.party_session_data = {};
    this.init = () => {
        party_mode_update_handlers.push((party => {
            if (GAME.active !== GAME.ids.INVASION) return;
            console.log("==== party mode update handler party_session:", _dump(party.party_session))
        }))
    };
    this.new_session = type => {
        this.party_session_type = type;
        this.party_session_id = null;
        this.party_session_data = {};
        if (type === SESSION_TYPE.online) {
            queue_mode_update_id++;
            send_json_data({
                action: "party-new-party-session",
                update_id: queue_mode_update_id
            })
        } else if (type === SESSION_TYPE.offline) {
            engine.call("start_offline_party_session")
        }
    };
    this.load_session = (type, session_id, session_data) => {
        this.party_session_type = type;
        this.party_session_id = session_id;
        this.party_session_data = session_data;
        if (type === SESSION_TYPE.online) {
            send_json_data({
                action: "party-load-party-session",
                party_session_id: session_id
            })
        } else if (type === SESSION_TYPE.offline) {
            engine.call("continue_offline_party_session")
        }
    }
};