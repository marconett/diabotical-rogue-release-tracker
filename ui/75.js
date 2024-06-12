let global_on_tournament_match_update = [];

function tournament_matches_updated() {
    for (let cb of global_on_tournament_match_update) {
        if (typeof cb === "function") cb()
    }
}
let global_tournament_status = {};

function tournament_set_state(tournaments) {
    for (let t of tournaments) {
        if (t.own_state === "out") {
            delete global_tournament_status[t.tourney_division];
            continue
        }
        global_tournament_status[t.tourney_division] = t
    }
    tournament_matches_updated()
}
let global_tournament_matches = {};

function tournament_match_set_state(matches) {
    if (!matches) return;
    for (let match of matches) {
        global_tournament_matches[match.tourney_division] = match;
        reload_tournament_page(match.tourney_id)
    }
    tournament_matches_updated()
}
let global_on_tournament_match_removed = [];

function remove_tournament_match(tourney_division, tourney_match_idx) {
    if (tourney_division in global_tournament_matches && global_tournament_matches[tourney_division].tourney_match_idx === tourney_match_idx) {
        reload_tournament_page(global_tournament_matches[tourney_division].tourney_id);
        delete global_tournament_matches[tourney_division];
        tournament_matches_updated();
        for (let cb of global_on_tournament_match_removed) {
            if (typeof cb === "function") cb(tourney_division, tourney_match_idx)
        }
    }
}

function clear_tournament_matches() {
    global_tournament_matches = {};
    tournament_matches_updated()
}

function update_tournament_matches() {
    for (let tourney_division in global_tournament_matches) {
        let tm = global_tournament_matches[tourney_division];
        if (tm.party_hash !== global_party.party_hash) {
            delete global_tournament_matches[tourney_division]
        }
    }
    tournament_matches_updated()
}

function reload_tournament_page(tourney_id) {
    if (global_menu_page === "tournament" && tournament_page && tournament_page.state.data && tournament_page.state.data.tourney_id === tourney_id) {
        tournament_page.load_tourney(tourney_id, true)
    }
}

function handle_tournament_match_starting(tourney_division, tourney_match_idx) {
    if (global_tournament_matches.hasOwnProperty(tourney_division)) {
        if (global_tournament_matches[tourney_division].tourney_match_idx === tourney_match_idx) {
            delete global_tournament_matches[tourney_division];
            tournament_matches_updated()
        }
    }
}

function join_tournament(id) {
    if (id.trim().length == 0) return;
    send_string(CLIENT_COMMAND_SIGNUP_TOURNAMENT, id)
}

function on_tournament_deleted(tourney_id) {
    if (global_menu_page === "tournament" && tournament_page && tournament_page.state.data.tourney_id === tourney_id) {
        open_screen("tournament_list")
    }
}
const TournamentCommon = {
    format_bracket_match_party: function(party, parties, match_state, has_winner) {
        let match_party = _createElement("div", "bracket-match-party");
        let names = _createElement("div", "names");
        let score_value = 0;
        if (party) {
            if (party.party_hash in parties) {
                render_tournament_party(parties[party.party_hash], names, false)
            } else if (party.party_hash === "BYE") {
                names.appendChild(_createElement("div", "bye", "BYE"))
            }
            if (party.score) score_value = party.score;
            if (party.winner) match_party.classList.add("winner")
        }
        let score = _createElement("div", "score", score_value);
        match_party.appendChild(names);
        match_party.appendChild(score);
        if (match_state === 3 && !party.winner && party.party_hash !== "BYE") {
            names.appendChild(_createElement("div", "name-strike-through"))
        }
        return match_party
    },
    get_rounds_per_bracket: function(format, bracket, bracket_size) {
        let count = 0;
        if (bracket === "wb") {
            for (let i = bracket_size; i > 1; i = i / 2) count++;
            if (format === "de") count++
        } else if (bracket === "lb") {
            let odd = true;
            for (let i = bracket_size / 2; i > 1; i) {
                count++;
                if (odd) {
                    odd = false
                } else {
                    i = i / 2;
                    odd = true
                }
            }
            if (format === "se") count = 0
        }
        return count
    },
    generate_bracket_placements: function(format, bracket_size) {
        const se_list = [
            [1, null, 1],
            [2, null, 1],
            [3, 4, 2],
            [5, 8, 4],
            [9, 16, 8],
            [17, 32, 16],
            [33, 64, 32],
            [65, 128, 64],
            [129, 256, 128],
            [257, 512, 256],
            [513, 1024, 512],
            [1025, 2048, 1024],
            [2049, 4096, 2048]
        ];
        const de_list = [
            [1, null, 1],
            [2, null, 1],
            [3, null, 1],
            [4, null, 1],
            [5, 6, 2],
            [7, 8, 2],
            [9, 12, 4],
            [13, 16, 4],
            [17, 24, 8],
            [25, 32, 8],
            [33, 48, 16],
            [49, 64, 16],
            [65, 96, 32],
            [97, 128, 32],
            [129, 192, 64],
            [193, 256, 64],
            [257, 384, 128],
            [385, 512, 128],
            [513, 768, 256],
            [769, 1024, 256],
            [1025, 1536, 512],
            [1537, 2048, 512]
        ];
        let list = se_list;
        if (format === "de") list = de_list;
        let placements = [];
        for (let i = 0;; i++) {
            if (i > list.length - 1) break;
            placements.push(list[i]);
            if (list[i][1] === null) {
                if (list[i][0] >= bracket_size) break
            } else {
                if (list[i][1] >= bracket_size) break
            }
        }
        return placements
    },
    render_placement_text: function(cont, placement_from, placement_to, long_text) {
        if (!placement_from) {
            cont.textContent = localize("forfeit");
            return
        }
        let text = placement_from + ".";
        if (placement_to) text = placement_from + "-" + placement_to + ".";
        if (long_text && placement_from <= 3 && !placement_to) {
            text = localize("tournament_placement_" + placement_from)
        }
        if (!long_text && placement_from <= 3 && !placement_to) {
            cont.appendChild(_createElement("div", ["tournament_result_icon", "place_" + placement_from]))
        } else {
            cont.textContent = text
        }
    }
};