global_components["rank_screen"] = new MenuComponent("rank_screen", _id("rank_screen"), (function() {
    on_render_rank_screen.push((mmr_updates => {
        renderRankScreen(mmr_updates)
    }));
    on_show_rank_screen.push(((cb, initial) => {
        showRankScreen(cb, initial)
    }));
    on_post_match_updates.push((data => {
        if ("mmr_updates" in data && "mmr_key" in data.mmr_updates) {
            trigger_render_rank_screen(data.mmr_updates);
            updateGameReportRank(data.mmr_updates.mode, data.mmr_updates.mmr_key)
        }
    }))
}));
let global_rank_screen_queue = [];

function renderRankScreen(data) {
    _id("rank_screen").querySelector(".placement_progression").style.display = "none";
    _id("rank_screen").querySelector(".rank_progression").style.display = "none";
    global_rank_screen_queue = [];
    global_show_rank_change = false;
    if ("placement_match" in data && Number(data.placement_match) == 1 && data.to.placement_matches && data.to.placement_matches.length) {
        if (data.to.placement_matches.length == Number(data.placement_matches)) {
            renderPlacementRank(data);
            let sound = "ui_ranked_rank_up";
            if (data.to.rank_position !== null && data.to.rank_position !== undefined) {
                if (data.to.rank_position == 1) sound = "ui_ranked_rank_up_legend";
                else if (data.to.rank_position <= 50) sound = "ui_ranked_rank_up_high_warlord";
                else if (data.to.rank_position <= 100) sound = "ui_ranked_rank_up_grandmaster";
                else sound = "ui_ranked_rank_up_elite"
            }
            global_rank_screen_queue.push({
                type: "placement-rank",
                time: 6.3,
                match_type: data.match_type,
                sound: sound
            });
            global_show_rank_change = true
        }
    } else {
        renderRankUpdate(data);
        let type = "";
        let time = 0;
        let sound = "";
        if (data.from.rank_tier != null) {
            if (data.from.rank_tier < data.to.rank_tier) {
                type = "rank-up";
                time = 6;
                sound = "ui_ranked_rank_up"
            }
            if (data.from.rank_position != null && data.to.rank_position != null) {
                if (data.from.rank_position > data.to.rank_position) {
                    type = "rank-up";
                    time = 6;
                    sound = "ui_ranked_rank_up"
                }
            }
        } else {
            if (data.to.rank_tier != null) {
                type = "rank-up";
                time = 6;
                sound = "ui_ranked_rank_up"
            }
        }
        if (type == "rank-up" && data.to.rank_position !== null && data.to.rank_position !== undefined) {
            if (data.to.rank_position == 1) sound = "ui_ranked_rank_up_legend";
            else if (data.to.rank_position <= 50) sound = "ui_ranked_rank_up_high_warlord";
            else if (data.to.rank_position <= 100) sound = "ui_ranked_rank_up_grandmaster";
            else sound = "ui_ranked_rank_up_elite"
        }
        if (type.length) {
            global_rank_screen_queue.push({
                type: type,
                time: time,
                match_type: data.match_type,
                sound: sound
            });
            global_show_rank_change = true
        }
    }
}

function renderPlacementRank(data) {
    let cont = _id("rank_screen").querySelector(".placement_rank");
    _empty(cont);
    let title = _createElement("div", "title", localize("placement_matches_completed"));
    cont.appendChild(title);
    let rank_icon_cont = _createElement("div", "rank_icon_cont");
    let team_size = 1;
    if (data.mode in global_queues) team_size = global_queues[data.mode].team_size;
    let type = "image";
    let rank = renderRankIcon(data.to.rank_tier, data.to.rank_position, team_size, "big");
    rank_icon_cont.appendChild(rank);
    let video_url = getRankVideoUrl(data.to.rank_tier, data.to.rank_position);
    if (video_url.length) {
        type = "video";
        let rank_video = _createElement("video", "rank_video");
        rank_video.classList.add("next");
        rank_video.src = video_url;
        rank_icon_cont.appendChild(rank_video);
        if (data.to.rank_position && data.to.rank_position > 1) {
            let rank_video_position = _createElement("div", "rank_video_position", data.to.rank_position);
            rank_icon_cont.appendChild(rank_video_position)
        }
    }
    cont.appendChild(rank_icon_cont);
    let rank_name_cont = _createElement("div", "rank_name_cont");
    let rank_name = _createElement("div", "rank_name");
    rank_name.appendChild(getRankName(data.to.rank_tier, data.to.rank_position));
    rank_name_cont.appendChild(rank_name);
    cont.appendChild(rank_name_cont);
    cont.dataset.to_type = type
}

function renderRankUpdate(data) {
    let cont = _id("rank_screen").querySelector(".rank_progression");
    _empty(cont);
    let rank_icon_cont = _createElement("div", "rank_icon_cont");
    let team_size = 1;
    if (data.mode in global_queues) team_size = global_queues[data.mode].team_size;
    let prev_rank = renderRankIcon(data.from.rank_tier, data.from.rank_position, team_size, "big");
    prev_rank.classList.add("prev");
    rank_icon_cont.appendChild(prev_rank);
    let next_rank = renderRankIcon(data.to.rank_tier, data.to.rank_position, team_size, "big");
    next_rank.classList.add("next");
    rank_icon_cont.appendChild(next_rank);
    let video_url = getRankVideoUrl(data.to.rank_tier, data.to.rank_position);
    if (video_url.length) {
        let rank_video = _createElement("video", "rank_video");
        rank_video.classList.add("next");
        rank_video.src = video_url;
        rank_icon_cont.appendChild(rank_video);
        if (data.to.rank_position && data.to.rank_position > 1) {
            let rank_video_position = _createElement("div", "rank_video_position", data.to.rank_position);
            rank_icon_cont.appendChild(rank_video_position)
        }
    }
    cont.appendChild(rank_icon_cont);
    let rank_name_cont = _createElement("div", "rank_name_cont");
    let prev_rank_name = _createElement("div", "rank_name");
    prev_rank_name.appendChild(getRankName(data.from.rank_tier, data.from.rank_position));
    prev_rank_name.classList.add("prev");
    rank_name_cont.appendChild(prev_rank_name);
    let next_rank_name = _createElement("div", "rank_name");
    next_rank_name.appendChild(getRankName(data.to.rank_tier, data.to.rank_position));
    next_rank_name.classList.add("next");
    rank_name_cont.appendChild(next_rank_name);
    cont.appendChild(rank_name_cont);
    let type = "image";
    if (data.from.rating > data.to.rating) {
        type = "image"
    } else {
        if (video_url.length) type = "video"
    }
    cont.dataset.to_type = type
}

function showRankScreen(cb, initial) {
    if (global_active_view !== "hud") {
        if (typeof cb == "function") cb();
        return
    }
    let cont = _id("rank_screen");
    let placement_screen = cont.querySelector(".placement_progression");
    let rank_screen = cont.querySelector(".rank_progression");
    let placement_rank_screen = cont.querySelector(".placement_rank");
    if (initial && initial == true) {
        anim_hide(placement_screen);
        anim_hide(rank_screen);
        anim_hide(placement_rank_screen)
    }
    if (!global_rank_screen_queue.length) {
        if (typeof cb == "function") cb();
        return
    }
    anim_show(cont, 500);
    let first = global_rank_screen_queue.shift();
    let current = undefined;
    if (first.type == "rank-up") {
        current = rank_screen;
        anim_show(rank_screen, 500, "flex", (function() {
            setTimeout((function() {
                let type = rank_screen.dataset.to_type;
                let prev = rank_screen.querySelector(".rank_icon.prev");
                let next = "";
                let next_pos = false;
                if (type == "image") next = rank_screen.querySelector(".rank_icon.next");
                if (type == "video") {
                    next = rank_screen.querySelector(".rank_video.next");
                    next_pos = rank_screen.querySelector(".rank_video_position")
                }
                let prev_name = rank_screen.querySelector(".rank_name.prev");
                let next_name = rank_screen.querySelector(".rank_name.next");
                anim_hide(prev, 900);
                anim_hide(prev_name, 900);
                setTimeout((function() {
                    if (type == "image") anim_show(next, 900);
                    if (type == "video") {
                        if (global_active_view === "hud") next.play();
                        if (next_pos) setTimeout((function() {
                            anim_show(next_pos, 500)
                        }), 1500)
                    }
                    anim_show(next_name, 900);
                    play_tracked_sound(first.sound)
                }), 200)
            }), 500)
        }))
    }
    if (first.type == "placement-rank") {
        current = placement_rank_screen;
        anim_show(placement_rank_screen, 500, "flex", (function() {
            let type = placement_rank_screen.dataset.to_type;
            let video_pos = placement_rank_screen.querySelector(".rank_video_position");
            setTimeout((function() {
                if (type == "image") _for_each_with_class_in_parent(placement_rank_screen, "rank_icon", (function(el) {
                    el.classList.add("visible")
                }));
                if (type == "video") {
                    if (global_active_view === "hud") _for_each_with_class_in_parent(placement_rank_screen, "rank_video", (function(el) {
                        el.play()
                    }));
                    if (video_pos) setTimeout((function() {
                        anim_show(video_pos, 500)
                    }), 1500)
                }
                _for_each_with_class_in_parent(placement_rank_screen, "rank_name", (function(el) {
                    el.classList.add("visible")
                }));
                play_tracked_sound(first.sound)
            }), 700)
        }))
    }
    if (current) {
        setTimeout((function() {
            anim_hide(current, 500, (function() {
                if (global_rank_screen_queue.length) {
                    showRankScreen(cb)
                } else {
                    anim_hide(cont, 500);
                    if (typeof cb == "function") cb()
                }
            }))
        }), first.time * 1e3)
    } else {
        if (typeof cb == "function") cb()
    }
}