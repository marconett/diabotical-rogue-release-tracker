new MenuScreen({
    game_id: GAME.ids.ROGUE,
    name: "achievements",
    screen_element: _id("achievements_screen"),
    button_element: null,
    fullscreen: false,
    init: () => {
        achievements_page.init()
    },
    open_handler: params => {
        set_blur(true);
        historyPushState({
            page: "achievements"
        });
        achievements_page.on_open()
    },
    close_handler: () => {
        set_blur(false)
    }
});
const achievements_page = new function() {
    let html = {
        root: null,
        scroll: null,
        list: null,
        screen_actions: null
    };
    let achievement_ids = [];
    let achievements = {};
    let achievements_ts = null;
    let achievements_requested = false;
    this.init = () => {
        html.root = _id("achievements_screen");
        html.scroll = _id("achievements_scroll_cont");
        html.list = _id("achievements_screen_list");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        bind_event("achievement_progressed", (() => {
            achievements_ts = null
        }));
        bind_event("achievements_json", (json => {
            try {
                let data = JSON.parse(json);
                achievements = {};
                achievements_ts = Date.now();
                prepare_data(data.achievements)
            } catch (e) {
                console.error("Error parsing achievements json from engine", e.message, json)
            }
        }));
        global_ms.addPermanentResponseHandler("post-match-updates", (data => {
            achievements_ts = null
        }))
    };
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], html.screen_actions);
        get_achievements()
    };

    function get_achievements() {
        if (achievements_ts !== null) {
            if (Date.now() - achievements_ts < 30 * 60 * 1e3) {
                render_achievements();
                return
            }
        }
        achievements_requested = true;
        api_request("GET", "/users/" + global_self.user_id + "/achievements", null, (data => {
            achievement_ids.length = 0;
            achievements = {};
            achievements_ts = Date.now();
            achievements_requested = false;
            if (data.achievements && data.achievements.length) {
                prepare_data(data.achievements);
                render_achievements()
            }
        }))
    }

    function prepare_data(data) {
        for (let a of data) {
            if (!(a.achievement_id in achievements)) {
                achievements[a.achievement_id] = [];
                achievement_ids.push(a.achievement_id)
            }
            achievements[a.achievement_id].push(a)
        }
    }

    function render_achievements() {
        _empty(html.list);
        let fragment = new DocumentFragment;
        let any_rewards = false;
        for (let achievement_id of achievement_ids) {
            let max_goal_val = 0;
            let goal_val = 0;
            let progress_val = 0;
            let progress_perc = 0;
            let last_ach_idx = 0;
            let next_ach_idx = 0;
            let finished = true;
            for (let ach of achievements[achievement_id]) {
                if (ach.goal > max_goal_val) max_goal_val = ach.goal;
                if (ach.achieved_ts == null) {
                    finished = false;
                    goal_val = ach.goal;
                    if (ach.progress != null) progress_val = ach.progress;
                    if (goal_val > 0) progress_perc = progress_val / goal_val * 100;
                    break
                } else {
                    last_ach_idx = next_ach_idx
                }
                next_ach_idx++
            }
            progress_perc = _clamp(progress_perc, 0, 100);
            if (achievement_id === "g2_kills_with_weesuit") {
                progress_val = 60;
                progress_perc = 60
            } else if (achievement_id === "g2_play_wipeout") {
                progress_val = 1;
                progress_perc = 100;
                finished = true
            }
            let el = _createElement("div", "achievement");
            if (finished) {
                next_ach_idx = last_ach_idx;
                goal_val = max_goal_val;
                progress_val = goal_val;
                progress_perc = 100;
                el.classList.add("finished")
            }
            let icon = _createElement("div", "icon");
            let image = _createElement("div", "image");
            image.style.backgroundImage = "url(/html/images/achievements/" + achievement_id + (finished ? "" : "_locked") + ".png.dds)";
            icon.appendChild(image);
            el.appendChild(icon);
            let info = _createElement("div", "info");
            el.appendChild(info);
            let title = _createElement("div", "title", localize("achievement_" + achievement_id));
            info.appendChild(title);
            let desc = _createElement("div", "desc", localize("achievement_desc_" + next_ach_idx + "_" + achievement_id));
            info.appendChild(desc);
            let progress = _createElement("div", "progress");
            let bar = _createElement("div", "bar");
            bar.style.width = progress_perc + "%";
            progress.appendChild(bar);
            progress.appendChild(_createElement("div", "value", _format_number(progress_val) + " / " + _format_number(goal_val)));
            info.appendChild(progress);
            let rewards = _createElement("div", "rewards");
            el.appendChild(rewards);
            for (let ach of achievements[achievement_id]) {
                if (!ach.goal) continue;
                if (!ach.customization_id) continue;
                any_rewards = true;
                let reward = _createElement("div", "reward");
                let item = _createElement("div", "item");
                if (ach.customization_id) {
                    item.appendChild(renderCustomizationInner("achievements", ach.customization_type, ach.customization_id, ach.amount, false))
                }
                reward.appendChild(item);
                let goal = _createElement("div", "goal", _format_number(ach.goal));
                if (progress_val >= ach.goal) {
                    goal.classList.add("finished")
                }
                reward.appendChild(goal);
                if (ach.achieved_ts != null) {
                    reward.classList.add("achieved")
                }
                rewards.appendChild(reward)
            }
            fragment.appendChild(el)
        }
        if (any_rewards) {
            html.list.classList.add("with_rewards")
        } else {
            html.list.classList.remove("with_rewards")
        }
        html.list.appendChild(fragment);
        html.list.lastElementChild.classList.add("last");
        refreshScrollbar(html.scroll)
    }
};