new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "game_selection",
    screen_element: _id("game_selection_screen"),
    button_element: null,
    fullscreen: true,
    init: () => {
        page_game_selection.init()
    },
    open_handler: () => {
        page_game_selection.show_game_select();
        set_modal_engine_call(true, true)
    },
    close_handler: () => {
        page_game_selection.pause_active_video();
        set_modal_engine_call(false);
        if (page_game_selection.data.news_open) {
            page_game_selection.close_news()
        }
        page_game_selection.reset()
    }
});
const page_game_selection = {
    data: {
        transition_active: false,
        active_game_id: GAME.ids.ROGUE,
        game_ids: [GAME.ids.ROGUE],
        selectable_game_ids: [GAME.ids.ROGUE],
        news_open: false,
        transitionListenerAdded: false,
        initial_video_loaded: false,
        on_initial_video_loaded: []
    },
    html: {
        page: null,
        video_outer: null,
        video_inner: null,
        inner: null,
        overlay_title: null,
        overlay_desc: null,
        overlay_right: null,
        overlay_games: null,
        overlay_options: null,
        overlay_play: null,
        game_info_title: null,
        game_info_type: null,
        game_info_text: null
    },
    init: function() {
        this.html.page = _id("game_selection_screen");
        this.html.video_outer = this.html.page.querySelector(".video_outer");
        this.html.video_inner = this.html.page.querySelector(".video_inner");
        this.html.inner = this.html.page.querySelector(".inner");
        this.html.overlay_title = this.html.page.querySelector(".overlay .title");
        this.html.overlay_desc = this.html.page.querySelector(".overlay .desc");
        this.html.overlay_right = this.html.page.querySelector(".overlay .right");
        this.html.overlay_games = this.html.page.querySelector(".overlay .right .games");
        this.html.overlay_options = this.html.page.querySelector(".overlay .options");
        this.html.overlay_play = this.html.overlay_options.querySelector(".main_button.play");
        this.html.game_info_title = this.html.page.querySelector(".game_info .title");
        this.html.game_info_type = this.html.page.querySelector(".game_info .type");
        this.html.game_info_text = this.html.page.querySelector(".game_info .text");
        let tree = this.html.overlay_right.querySelector(".tree");
        tree.style.setProperty("--game_count", "" + this.data.game_ids.length);
        this.create_game_selection();
        this.set_active_game_info(this.data.active_game_id);
        this.html.video_inner.appendChild(this.create_background_video(this.data.active_game_id));
        on_press_esc_handlers.push((() => {
            if (global_menu_page !== "game_selection") return;
            if (this.data.news_open) {
                this.close_news()
            } else if (!is_modal_open) {
                open_modal_screen("quit_dialog_modal_screen")
            }
        }));
        bind_event("set_masterserver_connection_state", ((connected, game_id) => {
            this.ms_connection_state(connected, game_id)
        }))
    },
    switch_selected_game(game_id, ui_only) {
        if (this.data.transition_active) return;
        if (this.data.active_game_id === game_id) return;
        if (!this.data.game_ids.includes(game_id)) return;
        this.data.active_game_id = game_id;
        this.set_active_game_info(game_id);
        if (!ui_only) {
            console.log("switch_game", this.data.active_game_id, ui_only);
            engine.call("select_game", this.data.active_game_id)
        }
    },
    set_active_game_info(game_id) {
        let prev_indicator = this.html.overlay_games.querySelector(".indicator.active");
        if (prev_indicator) prev_indicator.classList.remove("active");
        let new_indicator = this.html.overlay_games.querySelector(".game_cont.game_" + game_id + " .indicator");
        if (new_indicator) new_indicator.classList.add("active");
        let prev_image_cont = this.html.overlay_games.querySelector(".image_cont.active");
        if (prev_image_cont) prev_image_cont.classList.remove("active");
        let new_image_cont = this.html.overlay_games.querySelector(".game_cont.game_" + game_id + " .image_cont");
        if (new_image_cont) new_image_cont.classList.add("active");
        let prev_image = this.html.overlay_games.querySelector(".image.active");
        if (prev_image) prev_image.classList.remove("active");
        let new_image = this.html.overlay_games.querySelector(".game_cont.game_" + game_id + " .image");
        if (new_image) new_image.classList.add("active");
        let prev_logo = this.html.overlay_games.querySelector(".logo.active");
        if (prev_logo) prev_logo.classList.remove("active");
        let new_logo = this.html.overlay_games.querySelector(".game_cont.game_" + game_id + " .logo");
        if (new_logo) new_logo.classList.add("active");
        let game_logo = GAME.get_game_data(game_id, "GAME_LOGO");
        let game_name = GAME.get_game_data(game_id, "GAME_NAME");
        let game_desc = "";
        let game_name_full = GAME.get_game_data(game_id, "GAME_NAME_FULL");
        let game_type_desc = "";
        _empty(this.html.overlay_title);
        _empty(this.html.game_info_title);
        if (game_logo) {
            let dbt_logo = _createElement("div", "dbt_logo");
            this.html.overlay_title.appendChild(dbt_logo);
            let logo = _createElement("div", "logo");
            logo.style.backgroundImage = "url(" + game_logo + ")";
            this.html.overlay_title.appendChild(logo);
            this.html.game_info_title.appendChild(logo.cloneNode())
        } else {
            if (game_name) {
                this.html.overlay_title.textContent = game_name;
                this.html.game_info_title.textContent = game_name
            }
        }
        if (game_desc) {
            this.html.overlay_desc.textContent = game_desc;
            this.html.overlay_desc.style.display = "block"
        } else {
            this.html.overlay_desc.textContent = " ";
            this.html.overlay_desc.style.display = "none"
        }
        if (game_type_desc) this.html.game_info_type.textContent = game_type_desc;
        else this.html.game_info_type.textContent = " "
    },
    get_transition_direction(game_id) {
        for (let tmp_id of this.data.game_ids) {
            if (tmp_id === game_id) return "right";
            if (tmp_id === this.data.active_game_id) return "left"
        }
        return "right"
    },
    create_background_video(game_id) {
        let videos = GAME.get_game_data(game_id, "game_selection_videos");
        let el = _createElement("div", ["video", "game_" + game_id]);
        let waiting_for_video = false;
        if (videos) {
            let has_start = false;
            if ("start" in videos) {
                has_start = true
            }
            let map = {
                start: null,
                loop: null
            };
            if ("loop" in videos) {
                let video = _createElement("video", ["scenario_video", "loop"]);
                video.src = videos.loop;
                video.preload = "auto";
                video.loop = true;
                video.currentTime = 0;
                if (!has_start) {
                    video.autoplay = true;
                    if (!this.data.initial_video_loaded) {
                        let interval = setInterval((() => {
                            if (video.currentTime > 0) {
                                clearInterval(interval);
                                this.data.initial_video_loaded = true;
                                for (let cb of this.data.on_initial_video_loaded) {
                                    if (typeof cb === "function") cb()
                                }
                            }
                        }), 16);
                        waiting_for_video = true
                    }
                }
                el.appendChild(video);
                map.loop = video
            }
            if ("start" in videos) {
                let video = _createElement("video", ["scenario_video", "start"]);
                video.src = videos.start;
                video.preload = "auto";
                video.loop = false;
                video.currentTime = 0;
                video.autoplay = true;
                video.addEventListener("ended", (() => {
                    _remove_node(video);
                    if (map.loop) {
                        map.loop.play()
                    }
                }));
                if (!this.data.initial_video_loaded) {
                    let interval = setInterval((() => {
                        if (video.currentTime > 0) {
                            clearInterval(interval);
                            this.data.initial_video_loaded = true;
                            for (let cb of this.data.on_initial_video_loaded) {
                                if (typeof cb === "function") cb()
                            }
                        }
                    }), 16);
                    waiting_for_video = true
                }
                el.appendChild(video)
            }
            let overlay = _createElement("div", "video_overlay");
            el.appendChild(overlay)
        }
        if (!waiting_for_video) {
            this.data.initial_video_loaded = true;
            for (let cb of this.data.on_initial_video_loaded) {
                if (typeof cb === "function") cb()
            }
        }
        return el
    },
    create_game_selection() {
        if (this.data.game_ids.length < 2) {
            _empty(this.html.overlay_games);
            this.html.overlay_right.style.display = "none";
            return
        }
        this.html.overlay_right.style.display = "flex";
        for (let game_id of this.data.game_ids) {
            let game_logo = GAME.get_game_data(game_id, "GAME_LOGO");
            let game_cont = _createElement("div", ["game_cont", "game_" + game_id]);
            game_cont.dataset.gameId = game_id;
            let tree_line = _createElement("div", "tree_line");
            let image_cont = _createElement("div", "image_cont");
            let image = _createElement("div", "image");
            image_cont.appendChild(image);
            if (game_logo) {
                let gradient = _createElement("div", "gradient");
                let logo = _createElement("div", "logo");
                logo.style.backgroundImage = "url(" + game_logo + ")";
                image_cont.appendChild(gradient);
                image_cont.appendChild(logo)
            }
            let indicator = _createElement("div", "indicator");
            game_cont.appendChild(tree_line);
            game_cont.appendChild(image_cont);
            game_cont.appendChild(indicator);
            this.html.overlay_games.appendChild(game_cont);
            image_cont.addEventListener("click", (() => {
                if (this.data.active_game_id === game_id) return;
                if (this.data.transition_active) return;
                _play_click1();
                this.switch_selected_game(game_id)
            }));
            image_cont.addEventListener("mouseenter", (() => {
                if (this.data.active_game_id === game_id) return;
                _play_mouseover4()
            }))
        }
    },
    play_active_video() {
        let start = this.html.video_inner.querySelector(".video.game_" + this.data.active_game_id + " video.start");
        let loop = this.html.video_inner.querySelector(".video.game_" + this.data.active_game_id + " video.loop");
        if (start) {
            start.play()
        } else if (loop) {
            loop.play()
        }
    },
    pause_active_video() {
        let start = this.html.video_inner.querySelector(".video.game_" + this.data.active_game_id + " video.start");
        let loop = this.html.video_inner.querySelector(".video.game_" + this.data.active_game_id + " video.loop");
        if (start) start.pause();
        if (loop) loop.pause()
    },
    open_news() {
        if (this.data.news_open) return;
        this.data.news_open = true;
        this.html.video_outer.classList.add("show_news");
        this.html.inner.classList.add("show_news")
    },
    close_news() {
        if (!this.data.news_open) return;
        this.data.news_open = false;
        this.html.video_outer.classList.remove("show_news");
        this.html.video_outer.classList.add("hide_news");
        this.html.inner.classList.remove("show_news");
        this.html.inner.classList.add("hide_news")
    },
    reset() {
        this.html.video_outer.classList.remove("hide_news");
        this.html.inner.classList.remove("hide_news")
    },
    open_game() {
        if (!this.data.selectable_game_ids.includes(this.data.active_game_id)) return;
        this.html.overlay_right.classList.add("hidden");
        this.html.overlay_options.classList.add("hidden");
        engine.call("launch_game", false)
    },
    show_game_select() {
        page_game_selection.play_active_video();
        this.html.overlay_right.classList.remove("hidden");
        this.html.overlay_options.classList.remove("hidden")
    },
    ms_connection_state: function(connected, game_id) {
        if (!global_ui_started) return;
        if (typeof game_id !== "undefined" && game_id !== null && game_id != GAME.active) {
            GAME.set_active(game_id)
        }
    },
    open_menu(without_connecting) {
        engine.call("launch_game", without_connecting)
    },
    open_social(social) {
        if (social === "twitter") {
            engine.call("open_browser", "https://twitter.com/Diabotical")
        } else if (social === "reddit") {
            engine.call("open_browser", "https://www.reddit.com/r/DiaboticalRogue")
        } else if (social === "discord") {
            engine.call("open_browser", "https://discord.gg/diabotical")
        }
    }
};