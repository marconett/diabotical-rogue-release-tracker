var IN_HUB = true;
var IN_EDITING = false;
let global_ingame_menu = null;
let global_ingame_fallback = null;
let global_ingame_blur = false;
let on_close_ingame_screen_handlers = [];

function open_ingame_screen(id, instant, blur) {
    console.log("open_ingame_screen", id);
    let el = _id(id);
    if (!el) return;
    if (global_ingame_menu) {
        let el = _id(global_ingame_menu);
        if (instant) {
            el.style.display = "none"
        } else {
            anim_hide(el, 100)
        }
        for (let cb of on_close_ingame_screen_handlers) {
            if (typeof cb === "function") {
                cb(global_ingame_menu)
            }
        }
    }
    if (instant) {
        el.style.display = "flex"
    } else {
        anim_show(el, 100, "flex")
    }
    console.log("show_ingame_menu", true);
    engine.call("show_ingame_menu", true);
    set_blur(blur);
    global_ingame_blur = blur;
    global_ingame_menu = id
}

function close_ingame_screen(instant, screen_id) {
    if (!global_ingame_menu) return;
    if (global_ingame_menu === global_ingame_fallback) return;
    if (screen_id && global_ingame_menu != screen_id) return;
    let el = _id(global_ingame_menu);
    if (!el) return;
    if (instant) {
        el.style.display = "none";
        close_ingame_screen_cb()
    } else {
        anim_hide(el, 100, (() => {
            close_ingame_screen_cb()
        }))
    }
}

function close_ingame_screen_cb() {
    if (global_ingame_menu) {
        for (let cb of on_close_ingame_screen_handlers) {
            if (typeof cb === "function") {
                cb(global_ingame_menu)
            }
        }
    }
    global_ingame_menu = null;
    let fallback_el = null;
    if (global_ingame_fallback) {
        fallback_el = _id(global_ingame_fallback)
    }
    if (fallback_el) {
        open_ingame_screen(global_ingame_fallback)
    } else {
        console.log("show_ingame_menu", false);
        engine.call("show_ingame_menu", false);
        global_ingame_blur = false;
        set_blur(false)
    }
}
let global_client_in_game = false;

function button_game_over_quit(user_call) {
    let leave = false;
    if (user_call) {
        leave = true
    } else {
        if (global_active_view === "menu") {
            if (global_client_in_game) {
                leave = true
            }
        } else {
            leave = true
        }
    }
    if (leave) {
        engine.call("game_over_quit")
    }
}
class Match {
    constructor() {
        this.match_id = -1;
        this.map = "";
        this.map_name = "";
        this.match_type = null;
        this.mode = "";
        this.mm_mode = "";
        this.community_map = 0;
        this.clients = {};
        this.map_list = [];
        this.tourney_division = null;
        this.tourney_match_idx = null;
        this.allow_map_voting = 0;
        this.create_ts = Date.now()
    }
    setManifest(m) {
        this.match_id = m.match_id;
        this.map = m.map;
        this.map_name = m.map_name;
        this.match_type = m.match_type;
        this.mode = m.mode;
        this.mm_mode = m.mm_mode;
        this.community_map = m.community_map;
        this.map_list = m.map_list;
        this.tourney_division = m.tourney_division ? m.tourney_division : null;
        this.tourney_match_idx = m.tourney_match_idx ? m.tourney_match_idx : null;
        this.team_switching = m.team_switching ? m.team_switching : 0;
        this.allow_map_voting = m.allow_map_voting ? m.allow_map_voting : 0
    }
}
var current_match = new Match;
var global_show_rank_change = false;
var bool_am_i_leader = true;
const on_match_manifest_handlers = [];
const on_in_game_handlers = [];
let global_current_match_manifest = {};

function init_ingame() {
    console.log("LOAD INGAME");
    bind_event("set_in_game", (function(bool, map_name, game_mode) {
        console.log("set_in_game", bool, map_name, game_mode);
        global_client_in_game = bool;
        close_menu(true, true);
        if (game_mode === GAME.get_data("HUB_MODE")) {
            IN_HUB = true;
            IN_EDITING = false
        } else if (game_mode === GAME.get_data("EDIT_MODE")) {
            IN_HUB = false;
            IN_EDITING = true
        } else {
            IN_HUB = false;
            IN_EDITING = false
        }
        for (let cb of on_in_game_handlers) {
            if (typeof cb === "function") cb(bool, map_name, game_mode)
        }
    }));
    GAME.add_activate_callback((game_id => {
        IN_HUB = true
    }));
    bind_event("map_unloaded", (function() {
        engine.call("ui_stop_sounds");
        current_match.match_id = ""
    }));
    bind_event("on_connected", (function() {
        console.log("on_connected");
        global_game_report_active = false;
        _id("play_of_the_game").style.display = "none";
        _id("game_intro_screen").style.display = "none";
        _id("game_over_screen").style.display = "none";
        current_match = new Match
    }));
    bind_event("on_map_loaded", (function(map_name) {
        console.log("on_map_loaded", map_name)
    }));
    bind_event("game_manifest", (function(json_manifest) {
        global_show_rank_change = false;
        if (json_manifest) {
            let manifest = JSON.parse(json_manifest);
            current_match.setManifest(manifest);
            if (manifest.match_type === MATCH_TYPE_TOURNAMENT && manifest.hasOwnProperty("tourney_division")) {
                handle_tournament_match_starting(manifest.tourney_division, manifest.tourney_match_idx)
            }
            for (let cb of on_match_manifest_handlers) {
                if (typeof cb === "function") cb(manifest)
            }
        }
    }));
    bind_event("show_game_over", show_game_over);
    bind_event("reset_shop", (function() {}));
    bind_event("show_ingame_hud", (function(visible) {
        console.log("show_ingame_hud " + visible);
        if (visible) {
            _id("game_intro_screen").style.display = "none"
        }
    }));
    bind_event("show_play_of_the_game", (function(show, player_name) {
        return;
        if (show) {
            _id("play_of_the_game_player").textContent = player_name;
            _id("play_of_the_game").style.transform = "translateX(-50vh)";
            anim_show(_id("play_of_the_game"), 100, "flex");
            anim_start({
                element: _id("play_of_the_game"),
                translateX: [-50, 30, "vh"],
                duration: 300,
                easing: easing_functions.easeOutQuad
            })
        } else {
            anim_hide(_id("play_of_the_game"))
        }
    }));
    bind_event("set_game_report", ((json_game_status, json_snafu_data) => {
        trigger_set_game_report(current_match, json_game_status, json_snafu_data)
    }));
    bind_event("show_game_report", (visible => {
        trigger_show_game_report(visible)
    }));
    bind_event("test_game_report", test_game_report);
    init_debug_listeners();
    console.log("LOAD INGAME DONE")
}
const on_set_game_report = [];

function trigger_set_game_report(manifest, json_game_status, json_snafu_data) {
    for (let cb of on_set_game_report) {
        if (typeof cb === "function") cb(manifest, json_game_status, json_snafu_data)
    }
}
const on_show_game_report = [];

function trigger_show_game_report(visible) {
    for (let cb of on_show_game_report) {
        if (typeof cb === "function") cb(visible)
    }
}
const on_render_rank_screen = [];

function trigger_render_rank_screen(mmr_updates) {
    for (let cb of on_render_rank_screen) {
        if (typeof cb === "function") cb(mmr_updates)
    }
}
const on_show_rank_screen = [];

function trigger_show_rank_screen(cb, initial) {
    for (let cb of on_show_rank_screen) {
        if (typeof cb === "function") cb(cb, initial)
    }
}

function init_debug_listeners() {
    bind_event("test_rank", (function(id) {
        let mmr_updates = null;
        let timeout = 0;
        if (id == "0") {
            mmr_updates = {
                from: {
                    cur_tier_req: 0,
                    next_tier_req: 0,
                    placement_matches: "0111",
                    rank_position: null,
                    rank_tier: null
                },
                to: {
                    cur_tier_req: 1650,
                    next_tier_req: 1690,
                    placement_matches: "01111",
                    rank_position: null,
                    rank_tier: 26,
                    rating: 1647.3734941080734
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_matches: 5,
                placement_match: 1
            };
            timeout = 1e4
        }
        if (id == "1") {
            mmr_updates = {
                from: {
                    rating: 1648.1891687632,
                    rank_tier: 26,
                    rank_position: null,
                    cur_tier_req: 1650,
                    next_tier_req: 1690
                },
                to: {
                    rating: 1663.2612642377014,
                    rank_tier: 27,
                    rank_position: null,
                    cur_tier_req: 1690,
                    next_tier_req: 1730
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_match: 0
            };
            timeout = 1e4
        }
        if (id == "2") {
            mmr_updates = {
                from: {
                    rating: 1547.7387406072,
                    rank_tier: 32,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                to: {
                    rating: 1500.6258831622672,
                    rank_tier: 31,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_matches: 5,
                placement_match: 0
            };
            timeout = 1e4
        }
        if (id == "3") {
            mmr_updates = {
                from: {
                    rank_tier: null,
                    rank_position: null,
                    cur_tier_req: 0,
                    next_tier_req: 0,
                    placement_matches: "1010"
                },
                to: {
                    rating: 1693,
                    rank_tier: 31,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650,
                    placement_matches: "10101"
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_matches: 5,
                placement_match: 1
            };
            timeout = 1e4
        }
        if (id == "4") {
            mmr_updates = {
                from: {
                    rating: 1457.4097274535,
                    rank_tier: 22,
                    rank_position: null,
                    cur_tier_req: 1490,
                    next_tier_req: 1530
                },
                to: {
                    rating: 1442.0972441233573,
                    rank_tier: 22,
                    rank_position: null,
                    cur_tier_req: 1490,
                    next_tier_req: 1530
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_match: 0
            };
            timeout = 18e3
        }
        if (id == "5") {
            mmr_updates = {
                from: {
                    rating: 1500,
                    rank_tier: 25,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                to: {
                    rating: 1520,
                    rank_tier: 25,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_matches: 5,
                placement_match: 0
            };
            timeout = 1e4
        }
        if (id == "6") {
            mmr_updates = {
                from: {
                    rating: 1547.7387406072,
                    rank_tier: 25,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                to: {
                    rating: 1573.6258831622672,
                    rank_tier: 26,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_matches: 5,
                placement_match: 0
            };
            timeout = 1e4
        }
        if (id == "7") {
            mmr_updates = {
                from: {
                    rating: 1547.7387406072,
                    rank_tier: 34,
                    rank_position: 115,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                to: {
                    rating: 1600.6258831622672,
                    rank_tier: 33,
                    rank_position: 50,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_matches: 5,
                placement_match: 0
            };
            timeout = 13e3
        }
        if (id == "8") {
            mmr_updates = {
                from: {
                    rating: null,
                    rank_tier: 0,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                to: {
                    rating: 370,
                    rank_tier: 2,
                    rank_position: null,
                    cur_tier_req: 1610,
                    next_tier_req: 1650
                },
                mode: "md_duel",
                mmr_key: "sr_duel",
                placement_matches: 5,
                placement_match: 0
            };
            timeout = 1e4
        }
        if (mmr_updates) {
            trigger_render_rank_screen(mmr_updates);
            anim_show(_id("game_report"), 500, "flex");
            if (global_show_rank_change) {
                trigger_show_rank_screen(null, true)
            }
            anim_show(_id("game_report_cont"), 500, "flex");
            global_show_rank_change = false;
            setTimeout((function() {
                anim_hide(_id("game_report"));
                anim_hide(_id("game_report_cont"))
            }), timeout)
        }
    }))
}

function play_tracked_sound(sound_key) {
    if (global_active_view !== "hud") return;
    engine.call("ui_sound_tracked", sound_key)
}

function show_game_over(show, placement, team_count, last_round) {
    if (show && current_match.mode === "rogue_wipeout") return;
    _id("game_over_screen").style.display = show ? "block" : "none";
    let el_victory = _id("game_over_victory");
    let el_defeat = _id("game_over_defeat");
    let el_placement = _id("game_over_placement");
    el_placement.classList.remove("small");
    let sound = "";
    let music = "";
    let anim = "";
    if (show) {
        anim = "v";
        if (team_count == 1) {
            anim = "go";
            sound = "";
            music = "music_victory";
            if (last_round) {
                el_placement.textContent = localize_ext("ingame_game_over_round", {
                    round: last_round
                });
                el_placement.classList.add("small")
            } else {
                el_placement.textContent = localize("ingame_game_over")
            }
        } else if (team_count == 2) {
            if (placement == 0) {
                anim = "v";
                sound = "announcer_common_game_win";
                music = "music_victory"
            } else {
                anim = "d";
                sound = "announcer_common_game_loss";
                music = "music_defeat"
            }
        } else {
            if (placement == 0) {
                anim = "v";
                sound = "announcer_common_game_win";
                music = "music_victory"
            } else {
                if (placement == 1) {
                    el_placement.textContent = localize("ingame_placement_2");
                    sound = "announcer_common_place_02"
                } else if (placement == 2) {
                    el_placement.textContent = localize("ingame_placement_3");
                    sound = "announcer_common_place_03"
                } else if (placement == 3) {
                    el_placement.textContent = localize("ingame_placement_4");
                    sound = "announcer_common_place_04"
                } else if (placement == 4) {
                    el_placement.textContent = localize("ingame_placement_5");
                    sound = "announcer_common_place_05"
                } else if (placement == 5) {
                    el_placement.textContent = localize("ingame_placement_6");
                    sound = "announcer_common_place_06"
                } else if (placement == 6) {
                    el_placement.textContent = localize("ingame_placement_7");
                    sound = "announcer_common_place_07"
                } else if (placement == 7) {
                    el_placement.textContent = localize("ingame_placement_8");
                    sound = "announcer_common_place_08"
                } else if (placement == 8) {
                    el_placement.textContent = localize("ingame_placement_9");
                    sound = "announcer_common_place_09"
                } else if (placement == 9) {
                    el_placement.textContent = localize("ingame_placement_10");
                    sound = "announcer_common_place_10"
                } else if (placement == 10) {
                    el_placement.textContent = localize("ingame_placement_11");
                    sound = "announcer_common_place_11"
                } else if (placement == 11) {
                    el_placement.textContent = localize("ingame_placement_12");
                    sound = "announcer_common_place_12"
                } else if (placement == 12) {
                    el_placement.textContent = localize("ingame_placement_13");
                    sound = "announcer_common_game_loss"
                } else if (placement == 13) {
                    el_placement.textContent = localize("ingame_placement_14");
                    sound = "announcer_common_game_loss"
                } else if (placement == 14) {
                    el_placement.textContent = localize("ingame_placement_15");
                    sound = "announcer_common_game_loss"
                } else if (placement == 15) {
                    el_placement.textContent = localize("ingame_placement_16");
                    sound = "announcer_common_game_loss"
                } else if (placement == 16) {
                    el_placement.textContent = localize("ingame_placement_17");
                    sound = "announcer_common_game_loss"
                } else if (placement == 17) {
                    el_placement.textContent = localize("ingame_placement_18");
                    sound = "announcer_common_game_loss"
                } else if (placement == 18) {
                    el_placement.textContent = localize("ingame_placement_19");
                    sound = "announcer_common_game_loss"
                } else if (placement == 19) {
                    el_placement.textContent = localize("ingame_placement_20");
                    sound = "announcer_common_game_loss"
                }
                anim = "p";
                music = "music_defeat"
            }
        }
        if (anim.length) {
            if (anim == "v") {
                el_victory.style.display = "flex";
                el_defeat.style.display = "none";
                el_placement.style.display = "none";
                play_anim("game_over_victory", "game_over_anim")
            } else if (anim == "d") {
                el_victory.style.display = "none";
                el_defeat.style.display = "flex";
                el_placement.style.display = "none";
                play_anim("game_over_defeat", "game_over_anim")
            } else if (anim == "p") {
                el_victory.style.display = "none";
                el_defeat.style.display = "none";
                el_placement.style.display = "flex";
                play_anim("game_over_placement", "game_over_anim")
            } else if (anim == "go") {
                el_victory.style.display = "none";
                el_defeat.style.display = "none";
                el_placement.style.display = "flex";
                play_anim("game_over_placement", "game_over_anim")
            }
            setTimeout((function() {
                if (anim == "v" || anim == "go") game_over_animation(true);
                else if (anim == "d" || anim == "p") game_over_animation(false)
            }), 400)
        }
    } else {
        el_victory.style.display = "none";
        el_defeat.style.display = "none";
        el_placement.style.display = "none"
    }
}
const on_post_match_updates = [];

function handlePostMatchUpdates(data) {
    console.log("post-match-updates", _dump(data));
    if (current_match.match_id == data.match_id) {
        if ("mmr_updates" in data && "mmr_key" in data.mmr_updates && "to" in data.mmr_updates) {
            let mmr_data = data.mmr_updates;
            if (mmr_data.mmr_key in global_self.mmr) {
                if (mmr_data.to.hasOwnProperty("rating")) global_self.mmr[mmr_data.mmr_key].rating = mmr_data.to.rating;
                if (mmr_data.to.hasOwnProperty("rank_tier")) global_self.mmr[mmr_data.mmr_key].rank_tier = mmr_data.to.rank_tier;
                if (mmr_data.to.hasOwnProperty("rank_position")) global_self.mmr[mmr_data.mmr_key].rank_position = mmr_data.to.rank_position
            } else {
                global_self.mmr[mmr_data.mmr_key] = {
                    rating: mmr_data.to.rating,
                    rank_tier: mmr_data.to.rank_tier,
                    rank_position: mmr_data.to.rank_position
                }
            }
        }
        for (let cb of on_post_match_updates) {
            if (typeof cb === "function") {
                cb(data)
            }
        }
    }
}

function validateHudDefinition() {
    for (let HUD_TYPE of[HUD_PLAYING, HUD_SPECTATING]) {
        engine.call("get_hud_json", HUD_TYPE).then((function(jsonStr) {
            try {
                editing_hud_data = JSON.parse(jsonStr)
            } catch (err) {
                console.log("Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
                engine.call("echo_error", "PARSE_PLAY_HUD_ERROR")
            }
            hud_version_check(editing_hud_data, HUD_TYPE);
            let json = JSON.stringify(editing_hud_data);
            if (json.length <= MAX_HUD_DEFINITION_LENGTH) {
                engine.call("set_hud_json", HUD_TYPE, json)
            } else {
                echo("ERROR - Hud definition exceeds size limit")
            }
        }))
    }
}

function test_game_report() {
    let game_status = '{"final":1,"match_id":"ca54136b-c868-43fd-8769-2dfc52dcdb2c","match_type":2,"mode":"rogue_wipeout","map":"a_bazaar","state":4,"debug":" p 4 a 4","match_time":207,"clients":[{"team":1,"user_id":"78edd912cdc84ba899a6bbc60616e97c","uuid":"6d7cfe18-b064-43d5-b6bd-cce30111bca8","name":"Guy with a long name","join_time":0,"time_played":186,"stats":{"dt":600,"di":3600,"h":0,"th":415,"oh":900,"at":3672,"sw":[2,106,7],"sa":[0,0],"w":[{"i":0,"sf":7,"sh":4,"di":200,"dt":0,"ds":0,"f":1,"df":0,"dh":0},{"i":1,"sf":26,"sh":21,"di":105,"dt":0,"ds":0,"f":1,"df":0,"dh":2},{"i":2,"sf":36,"sh":25,"di":500,"dt":0,"ds":0,"f":1,"df":0,"dh":0},{"i":3,"sf":140,"sh":106,"di":530,"dt":140,"ds":0,"f":1,"df":0,"dh":0},{"i":4,"sf":42,"sh":19,"di":1802,"dt":320,"ds":649,"f":5,"df":1,"dh":0},{"i":5,"sf":78,"sh":56,"di":336,"dt":162,"ds":0,"f":2,"df":1,"dh":0},{"i":8,"sf":54,"sh":4,"di":360,"dt":0,"ds":0,"f":1,"df":0,"dh":0}],"it":[{"i":"ammorl","c":3},{"i":"armort1","c":4},{"i":"armort2","c":7},{"i":"armort4","c":4},{"i":"hpt0","c":10},{"i":"hpt1","c":1},{"i":"hpt3","c":4},{"i":"survival","c":1},{"i":"weaponpncr","c":3},{"i":"weaponrl","c":4}],"s":12,"f":12,"d":2,"a":0}},{"team":0,"user_id":"1","uuid":"35ff1c63-2e40-4edc-8e5a-b9f70d20531d","name":"Notsolong","join_time":0,"time_played":186,"stats":{"dt":2400,"di":825,"h":0,"w":[{"i":0,"sf":0,"sh":0,"di":0,"dt":150,"ds":0,"f":0,"df":1,"dh":0},{"i":1,"sf":0,"sh":0,"di":0,"dt":0,"ds":0,"f":0,"df":0,"dh":8},{"i":2,"sf":8,"sh":8,"di":145,"dt":723,"ds":0,"f":0,"df":2,"dh":0},{"i":3,"sf":60,"sh":28,"di":140,"dt":340,"ds":0,"f":0,"df":1,"dh":0},{"i":4,"sf":7,"sh":7,"di":354,"dt":578,"ds":0,"f":2,"df":1,"dh":0},{"i":5,"sf":3,"sh":0,"di":0,"dt":210,"ds":0,"f":0,"df":2,"dh":0},{"i":7,"sf":4,"sh":3,"di":225,"dt":310,"ds":0,"f":0,"df":1,"dh":0},{"i":8,"sf":0,"sh":0,"di":0,"dt":160,"ds":0,"f":0,"df":0,"dh":0}],"s":2,"f":2,"d":8,"a":1}},{"team":0,"user_id":"2","uuid":"a8faa85a-f1e5-40cb-9b00-f4fa43a4b9d1","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":2400,"di":375,"h":0,"w":[{"i":0,"sf":0,"sh":0,"di":0,"dt":50,"ds":0,"f":0,"df":0,"dh":0},{"i":1,"sf":1,"sh":0,"di":0,"dt":105,"ds":0,"f":0,"df":1,"dh":8},{"i":2,"sf":0,"sh":0,"di":0,"dt":141,"ds":0,"f":0,"df":0,"dh":0},{"i":3,"sf":80,"sh":17,"di":85,"dt":210,"ds":0,"f":1,"df":0,"dh":0},{"i":4,"sf":2,"sh":2,"di":141,"dt":1394,"ds":0,"f":0,"df":4,"dh":0},{"i":5,"sf":54,"sh":27,"di":162,"dt":180,"ds":0,"f":1,"df":1,"dh":0},{"i":7,"sf":0,"sh":0,"di":0,"dt":385,"ds":0,"f":0,"df":1,"dh":0},{"i":8,"sf":0,"sh":0,"di":0,"dt":200,"ds":0,"f":0,"df":1,"dh":0}],"s":2,"f":2,"d":8,"a":0}},{"team":1,"user_id":"3","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a7","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":3920,"h":0,"w":[{"i":1,"sf":0,"sh":0,"di":0,"dt":0,"ds":0,"f":0,"df":0,"dh":2},{"i":2,"sf":37,"sh":20,"di":364,"dt":145,"ds":0,"f":1,"df":0,"dh":0},{"i":3,"sf":20,"sh":4,"di":20,"dt":85,"ds":0,"f":0,"df":1,"dh":0},{"i":4,"sf":2,"sh":2,"di":170,"dt":175,"ds":0,"f":0,"df":1,"dh":0},{"i":5,"sf":29,"sh":9,"di":54,"dt":0,"ds":0,"f":1,"df":0,"dh":0},{"i":7,"sf":8,"sh":8,"di":695,"dt":225,"ds":0,"f":2,"df":0,"dh":0}],"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"gd614e2474df265bb76eea","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a2","name":"noctan","join_time":0,"time_played":186,"stats":{"dt":600,"di":2210,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"6","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a3","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":3830,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":0,"user_id":"7","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a4","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":5290,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0,"cl":"chunk"}},{"team":0,"user_id":"9","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon b","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0,"cl":"weesuit"}},{"team":0,"user_id":"10","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon c","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0,"cl":"eggbot"}},{"team":0,"user_id":"11","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon d","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":0,"user_id":"12","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon e","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":0,"user_id":"13","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon f","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"14","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon g","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"15","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon h","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0,"cl":"chunk"}},{"team":1,"user_id":"16","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon i","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"17","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a8","name":"Anon j","join_time":0,"time_played":186,"stats":{"dt":2590,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}}],"teams":{"0":{"score":1,"placement":1,"name":"Team 1","color":"#7dd82b","stats":{"r":{"0":{"s":0,"b":0},"1":{"s":4,"b":1},"2":{"s":0,"b":0},"3":{"s":0,"b":1},"4":{"s":0,"b":0}}}},"1":{"score":4,"placement":0,"name":"Team 2","color":"#f8d309","stats":{"r":{"0":{"s":4,"b":1},"1":{"s":0,"b":0},"2":{"s":4,"b":1},"3":{"s":4,"b":0},"4":{"s":4,"b":1}}}}}}';
    let snafu_data = '{"game_data.pov_team.color":"#18c7ff","game_data.own_team.team_score":"4","game_data.total_player_count":"4","game_data.show_scoreboard":"false","current_weapon_data.color":"#cc791d","game_data.pov_team.color_dark":"#1295bf","spectators.count":"0","game_data.pov_team.color_darker":"#074154","game_data.own_team.color":"#18c7ff","game_data.own_team.color_dark":"#1295bf","game_data.time":"44","game_data.enemy_team.color":"#23c841","game_data.physics":"0","game_data.own_team.color_darker":"#074154","game_data.enemy_team.team_id":"0","game_data.own_team.game_score":"4","game_data.own_team.team_flag_state":"0","game_data.game_stage":"4","game_data.solo_mode":"false","game_data.own_team.team_has_macguffin":"false","game_data.own_team.team_name":"Team 2","current_weapon_data.key":"6","game_data.own_team.alive_count":"2","game_data.enemy_team.color_darker":"#0b4215","game_data.own_team.team_id":"1","teams.count":"2","game_data.enemy_team.color_dark":"#1a9630","game_data.enemy_team.team_score":"0","battle_data.item_image":"","game_data.enemy_team.game_score":"1","game_data.enemy_team.team_flag_state":"0","game_data.enemy_team.team_has_macguffin":"false","frame_data.hit_marker_opacity":"0.666398","game_data.enemy_team.alive_count":"0","game_data.enemy_team.team_name":"Team 1","game_data.overtime_seconds":"0","game_data.hint_team_color":"#FFFFFF","frame_data.slide_time_max":"0","own_team_players.count":"2","enemy_team_players.count":"2","game_data.players_per_team":"2","players.count":"4","battle_data.is_item_countable":"false","common_game_data.spectating":"false","game_data.team_count":"2","misc_data.fps":"60","misc_data.pickup_color":"","misc_data.pickup_image":"","misc_data.pickup_name":"","misc_data.pickup_owner":"","game_data.show_respawn_timers":"false","game_data.game_mode":"ca","game_data.round_mode":"true","game_data.race_mode":"false","game_data.spectator":"false","game_data.location":"mos","game_data.ranked":"1","game_data.continuous":"1","game_data.team_switching":"0","game_data.in_overtime_frag_mode":"false","game_data.score_limit":"4","game_data.time_limit":"0","game_data.team_size":"4","game_data.instagib":"0","game_data.spawn_logic":"0","game_data.is_golden_frag":"false","game_data.map":"a_bazaar","game_data.hint":"","game_data.hint_image":"","game_data.map_list":"a_barrows_gate:a_bazaar:a_heikam:a_junktion:b_ancient:b_alchemy:b_icefall","game_data.warmup":"false","game_data.round":"0","game_data.tide_time_offset":"0","game_data.dynamic_overtime_frag_limit":"0","game_mode.game_life_count":"0","game_mode.game_bounty_limit":"0","frame_data.speed":"0","frame_data.item_cooldown":"0","battle_data.self.ready":"true","frame_data.item_cooldown_total":"0","frame_data.bolt_recharging_progress":"0","frame_data.bolt_cooldown_recovery":"false","frame_data.powerup_countdown":"0","frame_data.slide_time_left":"0","frame_data.steal_progress":"0","frame_data.finish_progress":"0","common_game_data.self_alive":"true","battle_data.self.name":"Anon","battle_data.self.coins":"0","battle_data.self.hp":"200","battle_data.self.armor":"100","battle_data.self.hp_percentage":"100","battle_data.self.armor_percentage":"100","battle_data.ready_key":"F3","battle_data.have_powerup":"false","battle_data.powerup_image":"","battle_data.powerup_color":"","battle_data.have_item":"false","battle_data.item_name":"","battle_data.item_color":"","battle_data.item_keybind":"","battle_data.item_charge":"0","battle_data.is_editor_loaded":"false","current_weapon_data.tag":"mac","current_weapon_data.icon_url":"images/weapon_icons/weapon_mac.svg","current_weapon_data.ammo":"74","current_weapon_data.max_ammo":"200","current_weapon_data.accuracy":"0","current_weapon_data.current":"true","current_weapon_data.unlimited_ammo":"false","weapons_list.count":"8","enemy_team_players":[{"alive":"false","armor_percentage":"100","avatar":"av_AT1_1","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"false","life_count":"0","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0"},{"alive":"false","armor_percentage":"100","avatar":"av_AT1_15","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"false","life_count":"0","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0"}],"own_team_players":[{"alive":"true","armor_percentage":"100","avatar":"","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"false","life_count":"2","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0","voip_muted":"false","voip_talking":"false"},{"alive":"true","armor_percentage":"100","avatar":"av_AT1_20","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"true","life_count":"2","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0","voip_muted":"false","voip_talking":"false"}],"players":[{"assists":"0","avatar":"","best_time":"","country":"","damage_inflicted":"1200","deaths":"2","is_self":"false","kills":"4","name":"Anon","ping":"0.001","rank_position":"-1","rank_tier":"24","ready":"true","score":"4","user_id":"3"},{"assists":"0","avatar":"av_AT1_20","best_time":"","country":"at","damage_inflicted":"3600","deaths":"2","is_self":"true","kills":"12","name":"Anon","ping":"0.001","rank_position":"-1","rank_tier":"24","ready":"true","score":"12","user_id":"0"},{"assists":"0","avatar":"av_AT1_1","best_time":"","country":"ad","damage_inflicted":"375","deaths":"8","is_self":"false","kills":"2","name":"Anon","ping":"0.001","rank_position":"-1","rank_tier":"24","ready":"true","score":"2","user_id":"2"},{"assists":"1","avatar":"av_AT1_15","best_time":"","country":"dk","damage_inflicted":"825","deaths":"8","is_self":"false","kills":"2","name":"Anon","ping":"0","rank_position":"-1","rank_tier":"26","ready":"true","score":"2","user_id":"1"}],"spectators":[],"teams":[{"color":"#18c7ff","color_dark":"#1295bf","color_darker":"#074154","game_score":"4","players_count":"2","team_id":"1","team_name":"Team 2","team_score":"4"},{"color":"#23c841","color_dark":"#1a9630","color_darker":"#0b4215","game_score":"1","players_count":"2","team_id":"0","team_name":"Team 1","team_score":"0"}],"weapons_list":[{"accuracy":"57","ammo":"997","color":"#888888","current":"false","icon_url":"images/weapon_icons/weapon_melee.svg","key":"Z","max_ammo":"100","tag":"melee","unlimited_ammo":"true"},{"accuracy":"78","ammo":"74","color":"#cc791d","current":"true","icon_url":"images/weapon_icons/weapon_mac.svg","key":"6","max_ammo":"200","tag":"mac","unlimited_ammo":"false"},{"accuracy":"69","ammo":"230","color":"#7c62d1","current":"false","icon_url":"images/weapon_icons/weapon_bl.svg","key":"1","max_ammo":"150","tag":"bl","unlimited_ammo":"false"},{"accuracy":"75","ammo":"46","color":"#9bc44d","current":"false","icon_url":"images/weapon_icons/weapon_ss.svg","key":"2","max_ammo":"40","tag":"ss","unlimited_ammo":"false"},{"accuracy":"45","ammo":"40","color":"#df1f2d","current":"false","icon_url":"images/weapon_icons/weapon_rl.svg","key":"Q","max_ammo":"25","tag":"rl","unlimited_ammo":"false"},{"accuracy":"71","ammo":"250","color":"#cdb200","current":"false","icon_url":"images/weapon_icons/weapon_shaft.svg","key":"F","max_ammo":"150","tag":"shaft","unlimited_ammo":"false"},{"accuracy":"0","ammo":"50","color":"#1fa8b6","current":"false","icon_url":"images/weapon_icons/weapon_pncr.svg","key":"E","max_ammo":"25","tag":"pncr","unlimited_ammo":"false"},{"accuracy":"7","ammo":"4","color":"#9d3329","current":"false","icon_url":"images/weapon_icons/weapon_gl.svg","key":"7","max_ammo":"25","tag":"gl","unlimited_ammo":"false"}]}';
    current_match = new Match;
    current_match.setManifest({
        match_id: "ca54136b-c868-43fd-8769-2dfc52dcdb2c",
        clients: [],
        map_list: [
            ["wellspring", "wellspring", 0],
            ["furnace", "furnace", 0],
            ["toya_fortress", "toya_fortress", 0],
            ["titan", "titan", 0],
            ["b_ancient", "b_ancient", 0],
            ["b_alchemy", "b_alchemy", 0]
        ]
    });
    trigger_set_game_report(true, current_match, game_status, snafu_data);
    handlePostMatchUpdates({
        match_id: "ca54136b-c868-43fd-8769-2dfc52dcdb2c",
        progression_updates: {
            achievement_rewards: [{
                achievement_id: "frags_shaft",
                goal: 10,
                reward: {
                    customization_id: "av_smileygreen",
                    customization_type: 2,
                    customization_sub_type: "",
                    customization_set_id: null,
                    rarity: 0,
                    amount: 1,
                    free: true,
                    coverage: null
                }
            }],
            challenges: [{
                user_id: "0",
                challenge_id: "elim_rl_10",
                progress: 10,
                achieved: true,
                achieved_date: "2020-08-13T22:00:00.000Z",
                create_ts: "2020-08-11T19:28:46.000Z",
                current_date: "2020-08-13T22:00:00.000Z",
                unlocked: true,
                xp: 1e3,
                goal: 10,
                type: 0
            }, {
                user_id: "0",
                challenge_id: "play_5_qp_matches",
                progress: 0,
                achieved: false,
                achieved_date: null,
                create_ts: "2020-07-26T21:25:36.000Z",
                current_date: "2020-08-13T22:00:00.000Z",
                unlocked: true,
                xp: 1e3,
                goal: 5,
                type: 0
            }, {
                user_id: "0",
                challenge_id: "elim_pncr_10",
                progress: 10,
                achieved: true,
                achieved_date: "2020-08-13T22:00:00.000Z",
                create_ts: "2020-07-26T01:56:49.000Z",
                current_date: "2020-08-13T22:00:00.000Z",
                unlocked: true,
                xp: 1e3,
                goal: 10,
                type: 0
            }],
            battlepass_update: {
                from: {
                    xp: 70712,
                    level: 13,
                    cur_level_req: 65e3,
                    next_level_req: 75e3
                },
                to: {
                    xp: 91241,
                    level: 15,
                    cur_level_req: 85e3,
                    next_level_req: 95e3
                },
                owned: false,
                battlepass_id: "bp_season_1"
            },
            battlepass_rewards: [{
                customization_id: "av_smileyred",
                customization_type: 2,
                customization_sub_type: "",
                customization_set_id: null,
                rarity: 0,
                amount: 1,
                battlepass_reward_level: 8,
                free: false
            }, {
                customization_id: "we_pncr_deathray",
                customization_type: 6,
                customization_sub_type: "pncr",
                customization_set_id: null,
                rarity: 2,
                amount: 1,
                battlepass_reward_level: 9,
                free: false
            }, {
                customization_id: "sp_fired",
                customization_type: 5,
                customization_sub_type: "",
                customization_set_id: null,
                rarity: 1,
                amount: 1,
                battlepass_reward_level: 10,
                free: false
            }]
        },
        rematch_enabled: true
    });
    trigger_show_game_report(true)
}