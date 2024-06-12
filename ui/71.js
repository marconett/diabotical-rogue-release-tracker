var global_mm_time = 0;
var global_mm_searching = false;
var global_mm_start_ts = null;
var queue_stats_ts = 0;
var queue_stats = null;
const QUEUE_STATS_TIMEOUT_MS = 30 * 1e3;

function init_matchmaking() {
    anim_misc_second_handlers.push((() => {
        if (global_mm_searching) queue_timer_update()
    }));
    bind_event("test_draft", test_draft)
}
let mm_on_queue_timer_update = [];

function queue_timer_update() {
    if (!global_mm_searching) return;
    let now = Date.now();
    let time = Math.floor((now - global_mm_start_ts) / 1e3);
    if (time != global_mm_time) {
        global_mm_time = time;
        for (let cb of mm_on_queue_timer_update) {
            if (typeof cb === "function") cb(global_mm_time)
        }
    }
}

function mm_toggle_queue() {
    if (global_mm_searching) {
        cancel_search()
    } else {
        send_string(CLIENT_COMMAND_PARTY, "party-queue")
    }
}

function mm_ready_up() {
    send_string(CLIENT_COMMAND_PARTY, "party-ready")
}

function mm_unready() {
    send_string(CLIENT_COMMAND_PARTY, "party-unready")
}
let mm_queue_event_handlers = [];

function cancel_search() {
    global_mm_searching = false;
    send_json_data({
        action: "party-cancel-queue"
    });
    for (let cb of mm_queue_event_handlers) {
        if (typeof cb === "function") cb("stop")
    }
}

function process_queue_msg(msg) {
    if (msg == "start") {
        global_mm_searching = true;
        global_mm_start_ts = Date.now();
        queue_timer_update()
    } else if (msg == "stop") {
        global_mm_searching = false
    } else if (msg == "resume") {
        global_mm_searching = true
    } else if (msg == "found") {
        engine.call("flash_taskbar");
        engine.call("reset_inactivity_timer");
        global_mm_searching = false
    }
    for (let cb of mm_queue_event_handlers) {
        if (typeof cb === "function") cb(msg)
    }
}
let mm_event_handlers = [];

function handle_mm_match_event(data) {
    if (data.action == "mm-match-found" || data.action == "mm-join-match-found") {
        process_queue_msg("found")
    }
    for (let cb of mm_event_handlers) {
        if (typeof cb === "function") cb(data)
    }
}
let mm_match_cancelled_handlers = [];

function handle_mm_match_cancelled() {
    for (let cb of mm_match_cancelled_handlers) {
        if (typeof cb === "function") cb()
    }
}
let mmr_update_handlers = [];

function mmr_updated() {
    for (let cb of mmr_update_handlers) {
        if (typeof cb === "function") cb(global_self.mmr)
    }
}

function test_draft() {
    let data = {
        action: "mm-match-found",
        type: "queue",
        cancel_time: 3,
        mode: "rogue_wipeout",
        mm_mode: "a_md_duel",
        location: "tes",
        team_size: 1,
        team_count: 2,
        vote: "map",
        vote_options: ["toya", "wellspring", "sentinel"],
        vote_option_details: {
            toya: {
                name: "Toya",
                community_map: 0,
                team_size_max: 6
            },
            wellspring: {
                name: "Wellspring",
                community_map: 0
            },
            sentinel: {
                name: "Sentinel",
                community_map: 0,
                team_size_max: 25
            }
        }
    };
    for (let cb of mm_event_handlers) {
        if (typeof cb === "function") cb(data)
    }
}
const on_queue_stats_update = [];

function process_queue_stats(data) {
    queue_stats = data;
    for (let cb of on_queue_stats_update) {
        if (typeof cb === "function") cb(queue_stats)
    }
}

function request_queue_stats() {
    if (Date.now() - queue_stats_ts > QUEUE_STATS_TIMEOUT_MS) {
        send_string(CLIENT_COMMAND_GET_QUEUE_STATS);
        queue_stats_ts = Date.now()
    }
}