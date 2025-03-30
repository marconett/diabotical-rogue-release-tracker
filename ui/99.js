global_components["map_selection_modal"] = new MenuComponent("map_selection_modal", _id("map_choice_modal_screen"), (function() {
    map_selection_modal.init()
}));
const map_selection_modal = {
    state: {
        open: false,
        type: null,
        mode: null,
        categories: ["official", "community"],
        active_category: "official",
        official: [],
        community: [],
        selected: null,
        selected_el: null,
        order_by: undefined,
        last_api_options: {},
        infiniteScroll: {
            community_page: 0,
            requesting: false,
            last_page_reached: false
        },
        confirm_cb: null,
        last_map_idx_clicked: null,
        MAX_NUMBER_SELECTIONS: 9
    },
    el: {
        modal: null,
        generic_modal_dialog: null,
        available: null,
        selected: null,
        available_scroll_outer: null,
        selected_scroll_outer: null,
        available_list: null,
        selected_list: null,
        category: null,
        buttons: null,
        create_vote_button: null,
        confirm_button: null,
        map_choice_mode_select: null,
        map_choice_filter_input: null,
        map_choice_sort: null
    },
    resetInfiniteScroll: function() {
        this.state.infiniteScroll.last_page_reached = false;
        this.state.infiniteScroll.requesting = false;
        this.state.infiniteScroll.community_page = 0
    },
    init: function() {
        this.el.modal = _id("map_choice_modal_screen");
        this.el.generic_modal_dialog = this.el.modal.querySelector(".generic_modal_dialog");
        this.el.available = _id("map_selection_modal_available");
        this.el.selected = _id("map_selection_modal_selected");
        this.el.available_scroll_outer = this.el.available.querySelector(".scroll-outer.content");
        this.el.selected_scroll_outer = this.el.selected.querySelector(".scroll-outer.content");
        this.el.available_list = this.el.available.querySelector(".scroll-inner.list");
        this.el.selected_list = this.el.selected.querySelector(".scroll-inner.list");
        this.el.category = this.el.available.querySelector(".menu .center");
        this.el.buttons = _id("map_select_buttons");
        this.el.create_vote_button = _id("map_select_create_button");
        this.el.confirm_button = _id("map_select_confirm_button");
        this.el.map_choice_mode_select = _id("maps_choice_mode_select");
        this.el.map_choice_filter_input = _id("map_choice_filter_input");
        this.el.map_choice_sort = _id("map_choice_sort");
        ui_setup_select(this.el.map_choice_sort, ((opt, field) => {
            this.el.map_choice_filter_input.value = "";
            this.update_map_choices({
                category: this.state.active_category,
                order: field.dataset.value
            })
        }));
        global_input_debouncers["map_choice_filter_input"] = new InputDebouncer((() => {
            this.update_map_choices({
                category: this.state.active_category,
                search: this.el.map_choice_filter_input.value.trim(),
                order: this.el.map_choice_sort.dataset.value
            })
        }));
        this.render_category();
        Navigation.generate_nav({
            name: "map_selection_modal",
            nav_root: this.el.category,
            nav_class: "indicator",
            selection_required: true,
            hover_sound: "",
            action_sound: "",
            mouse_hover: "none",
            mouse_click: "none",
            action_cb_type: null,
            action_cb: null,
            select_cb: el => {
                this.set_category(el)
            }
        });
        let nav_back = this.el.available.querySelector(".menu .nav_info.back.kbm_element");
        let nav_forward = this.el.available.querySelector(".menu .nav_info.forward.kbm_element");
        nav_back.addEventListener("click", (() => {
            Navigation.prev("map_selection_modal")
        }));
        nav_forward.addEventListener("click", (() => {
            Navigation.next("map_selection_modal")
        }));
        this.el.available_list.addEventListener("scroll", (event => {
            if (this.state.active_category !== "community") return;
            const threshold = 150;
            const containerHeight = event.target.getBoundingClientRect().height;
            const windowBottom = event.target.scrollTop + containerHeight;
            if (!this.state.infiniteScroll.requesting && !this.state.infiniteScroll.last_page_reached && windowBottom > event.target.scrollHeight - threshold) {
                this.state.infiniteScroll.community_page++;
                this.update_map_choices_page(this.state.type, this.state.mode)
            }
        }));
        on_close_modal_screen.push((modal_id => {
            if (modal_id === "map_choice_modal_screen" && this.state.open) {
                this.close()
            }
        }))
    },
    _create_game_mode_select: function() {
        let modes = [];
        const game_mode_map = GAME.get_data("game_mode_map");
        if (game_mode_map) {
            for (let mode in game_mode_map) {
                modes.push(game_mode_map[mode])
            }
        }
        modes.sort((function(a, b) {
            return a.name.localeCompare(b.name)
        }));
        _empty(this.el.map_choice_mode_select);
        let found_active_mode = false;
        for (let mode of modes) {
            if (!mode.enabled) continue;
            let opt = _createElement("div", "i18n");
            opt.dataset.i18n = mode.i18n;
            opt.dataset.value = mode.mode;
            opt.textContent = localize(mode.i18n);
            this.el.map_choice_mode_select.appendChild(opt);
            if (mode.mode === this.state.mode) found_active_mode = true
        }
        if (!found_active_mode) {
            let opt = _createElement("div", "i18n", localize("selected_mode"));
            opt.dataset.value = this.state.mode;
            opt.dataset.i18n = "selected_mode";
            this.el.map_choice_mode_select.appendChild(opt)
        } {
            let opt = _createElement("div", "i18n", localize("all_modes"));
            opt.dataset.value = "all";
            opt.dataset.i18n = "all_modes";
            this.el.map_choice_mode_select.appendChild(opt)
        }
        ui_setup_select(this.el.map_choice_mode_select, ((opt, field) => {
            this.on_mode_select_changed(field.dataset.value)
        }))
    },
    _reset_state: function() {
        this.state.type = null;
        this.state.mode = null;
        this.state.official.length = 0;
        this.state.community.length = 0;
        this.state.selected = null;
        this.state.selected_el = null;
        this.state.order_by = undefined;
        this.state.last_api_options = {};
        this.state.confirm_cb = null;
        _empty(this.el.selected_list);
        this.el.create_vote_button.classList.add("disabled")
    },
    on_mode_select_changed: function(mode) {
        this.state.mode = mode;
        this.update_map_choices({
            category: this.state.active_category,
            order: this.el.map_choice_sort.dataset.value
        })
    },
    open: function(type, mode, selected, cb) {
        if (!["vote", "single_select", "multi_select"].includes(type)) return;
        this.state.open = true;
        this.state.last_map_idx_clicked = null;
        this._reset_state();
        this.state.type = type;
        this.state.mode = mode;
        if (typeof cb === "function") this.state.confirm_cb = cb;
        this._create_game_mode_select();
        this.el.map_choice_mode_select.dataset.value = mode;
        update_select(this.el.map_choice_mode_select);
        if (type === "vote") {
            this.el.selected_scroll_outer.classList.remove("multi_select");
            this.el.selected_list.classList.add("single");
            this.el.buttons.style.display = "flex";
            this.el.create_vote_button.style.display = "flex";
            this.el.confirm_button.style.display = "none";
            this.state.selected = null
        } else if (type === "single_select") {
            this.el.selected_scroll_outer.classList.remove("multi_select");
            this.el.selected_list.classList.add("single");
            this.el.buttons.style.display = "none";
            this.state.selected = null
        } else if (type === "multi_select") {
            this.el.selected_scroll_outer.classList.add("multi_select");
            this.el.selected_list.classList.remove("single");
            this.el.buttons.style.display = "flex";
            this.el.create_vote_button.style.display = "none";
            this.el.confirm_button.style.display = "flex";
            this.state.selected = []
        }
        if (selected) {
            if (typeof selected === "string") {
                this.state.selected = selected
            } else if (typeof selected === "object" && type === "multi_select") {
                this.state.selected.length = 0;
                for (let m of selected) {
                    this.state.selected.push(m)
                }
            }
            this.render_map_selection()
        }
        if (this.el.map_choice_filter_input.value) this.el.map_choice_filter_input.value = "";
        this.update_map_choices({
            category: this.state.active_category,
            order: this.el.map_choice_sort.dataset.value
        });
        Navigation.set_override_active("modal", {
            lb_rb: "map_selection_modal"
        });
        open_modal_screen("map_choice_modal_screen")
    },
    close: function() {
        if (this.state.type === "multi_select" && typeof this.state.confirm_cb === "function") {
            this.state.confirm_cb(this.state.selected)
        }
        if (this.state.type === "single_select" && typeof this.state.confirm_cb === "function" && this.state.selected !== null) {
            this.state.confirm_cb(this.state.selected)
        }
        if (this.state.type === "vote" && typeof this.state.confirm_cb === "function") {
            this.state.confirm_cb(this.state.selected)
        }
        this.close_modal()
    },
    close_modal: function() {
        this.state.open = false;
        Navigation.set_override_inactive("modal");
        close_modal_screen_by_selector("map_choice_modal_screen");
        if (!global_menu_page) {
            close_menu(true, false)
        }
    },
    confirm_selection: function() {
        if (this.state.type === "vote" && (this.state.selected === null || this.el.create_vote_button.classList.contains("disabled"))) return;
        this.close();
        _play_click1()
    },
    render_category: function() {
        _empty(this.el.category);
        let name_el = _createElement("div", "category_name", this.get_category_name());
        let indicators_el = _createElement("div", "category_indicators");
        for (let i = 0; i < this.state.categories.length; i++) {
            let indicator_el = _createElement("div", "indicator");
            indicator_el.dataset.category = this.state.categories[i];
            indicators_el.appendChild(indicator_el)
        }
        this.el.category.appendChild(name_el);
        this.el.category.appendChild(indicators_el)
    },
    set_category: function(el) {
        if (this.state.categories.indexOf(el.dataset.category) === -1) return;
        this.state.active_category = el.dataset.category;
        let name = this.el.category.querySelector(".category_name");
        if (name) name.textContent = this.get_category_name();
        if (this.state.active_category === "official") {
            this.el.map_choice_filter_input.parentElement.style.display = "none";
            this.el.map_choice_sort.parentElement.style.display = "none"
        } else {
            this.el.map_choice_filter_input.parentElement.style.display = "flex";
            this.el.map_choice_sort.parentElement.style.display = "flex"
        }
        this.resetInfiniteScroll();
        this.update_map_choices({
            category: this.state.active_category,
            order: this.el.map_choice_sort.dataset.value
        })
    },
    get_category_name: function() {
        if (this.state.active_category === "community") return "Community Maps";
        return "Official Maps"
    },
    render_map_choices: function(category) {
        let maps = this.state[category];
        let fragment = new DocumentFragment;
        for (let m of maps) {
            if (!m.author && typeof MAP_AUTHORS === "object" && m.map in MAP_AUTHORS) {
                m.author = MAP_AUTHORS[m.map]
            }
            const is_community = category === "community" ? 1 : 0;
            let map = _createElement("div", "map");
            if (is_community && !m.reviewed) {
                map.appendChild(_createElement("span", ["map_under_review"], localize("map_under_review")))
            }
            map.style.backgroundImage = `url("map-thumbnail://${m.map}")`;
            const MAX_7_DAYS = 8 * 24 * 60 * 60 * 1e3;
            if (m.updated_at != undefined && Date.now() - m.updated_at.getTime() < MAX_7_DAYS) {
                const $updated_at = _createElement("div", "update_at");
                $updated_at.textContent = `${moment(m.updated_at).fromNow()} (v${m.revision})`;
                map.appendChild($updated_at)
            }
            map_info = _createElement("div", "map_info");
            map_info.appendChild(_createElement("div", "name", m.name));
            let extra_info = _createElement("div", "extra");
            if (m.rate != undefined) {
                const rating = _createElement("div", ["map_rating"]);
                for (let i = 0; i < MAX_MAP_RATE; i++) {
                    let star = _createElement("div", ["star"]);
                    if (i < m.rate) {
                        star.classList.add("active")
                    }
                    rating.appendChild(star)
                }
                extra_info.appendChild(rating)
            }
            if (m.author) {
                const map_author = _createElement("div", "author", m.author);
                map_author.dataset.userId = m.user_id;
                extra_info.appendChild(map_author)
            }
            map_info.appendChild(extra_info);
            map.appendChild(map_info);
            map.addEventListener("click", (() => {
                this.state.last_map_idx_clicked = null;
                if (this.state.type === "multi_select") {
                    const selection = [m.map, m.name, is_community];
                    let existing_index = -1;
                    for (let i = 0; i < this.state.selected.length; i++) {
                        if (this.state.selected[i][0] === m.map) {
                            existing_index = i;
                            break
                        }
                    }
                    if (existing_index >= 0) {
                        this.state.selected.splice(existing_index, 1);
                        this.state.selected.unshift(selection);
                        this.render_map_selection()
                    } else if (this.state.selected.length < this.state.MAX_NUMBER_SELECTIONS) {
                        this.state.selected.push(selection);
                        this.render_map_selection()
                    }
                } else if (this.state.type === "single_select") {
                    this.state.selected = [m.map, m.name, is_community];
                    this.close()
                } else if (this.state.type === "vote") {
                    _play_cb_check();
                    this.state.selected = [m.map, m.name, is_community];
                    this.render_map_selection();
                    this.el.create_vote_button.classList.remove("disabled")
                }
            }));
            fragment.appendChild(map)
        }
        _empty(this.el.available_list);
        this.el.available_list.appendChild(fragment);
        resetScrollbar(this.el.available_scroll_outer);
        refreshScrollbar(this.el.available_scroll_outer)
    },
    update_map_choices: function(options) {
        const MIN_INITIAL_MAPS = 35;
        const category = options.category || "official";
        if (category === "community") {
            const community_maps_enabled = GAME.get_data("COMMUNITY_MAPS");
            if (!community_maps_enabled) return;
            _empty(this.el.available_list);
            this.el.available_list.appendChild(_createSpinner());
            options = {...this.state.last_api_options, ...options, mode: this.state.mode
            };
            this.resetInfiniteScroll();
            this.state.last_api_options = options;
            const order = options && options.order && options.order.length ? `&order=${options.order}` : ``;
            const search = options && options.search && options.search.length ? `&search=${encodeURI(options.search)}` : ``;
            const page = `&page=${this.state.infiniteScroll.community_page}`;
            this.state.infiniteScroll.requesting = true;
            api_request("GET", `/content/maps?mode=${this.state.mode}${order}${search}${page}`, {}, (maps => {
                if (this.state.active_category !== "community") return;
                _empty(this.el.available_list);
                if (maps) {
                    this.state[category] = maps.map((map => ({
                        map: map.map_id,
                        name: map.reviewed ? map.name : map.random_name.replace("_", " "),
                        author: map.author,
                        user_id: map.user_id,
                        reviewed: map.reviewed,
                        rate: map.rate,
                        votes: map.votes,
                        revision: map.revision,
                        updated_at: new Date(map.update_ts),
                        has_thumbnail: map.has_thumbnail
                    })))
                } else {
                    this.state[category] = []
                }
                this.render_map_choices("community");
                if (this.state[category].length < MIN_INITIAL_MAPS && maps && maps.length !== 0) {
                    this.state.infiniteScroll.community_page++;
                    this.update_map_choices_page()
                }
                this.state.infiniteScroll.requesting = false
            }))
        } else if (category === "official") {
            this.state.official.length = 0;
            if (global_game_mode_map_lists.hasOwnProperty(this.state.mode)) {
                if (global_game_mode_map_lists[this.state.mode].length) {
                    for (let m of global_game_mode_map_lists[this.state.mode]) {
                        this.state.official.push(m)
                    }
                }
                this.render_map_choices("official")
            } else {
                api_request("GET", `/mode_maps?mode_name=${this.state.mode}`, {}, (mode => {
                    if (mode) {
                        set_global_map_list_from_api(mode.mode_id, mode.maps);
                        if (this.state.mode === mode.mode_id) {
                            this.update_map_choices({
                                category: this.state.active_category,
                                order: this.el.map_choice_sort.dataset.value
                            })
                        }
                    }
                }))
            }
        }
    },
    update_map_choices_page: function() {
        const community_maps_enabled = GAME.get_data("COMMUNITY_MAPS");
        if (!community_maps_enabled) return;
        const options = {...this.state.last_api_options
        };
        const category = "community";
        const order = options && options.order && options.order.length ? `&order=${options.order}` : ``;
        const search = options && options.search && options.search.length ? `&search=${encodeURI(options.search)}` : ``;
        const page = `&page=${this.state.infiniteScroll.community_page}`;
        this.state.infiniteScroll.requesting = true;
        api_request("GET", `/content/maps?mode=${this.state.mode}${order}${search}${page}`, {}, (maps => {
            if (this.state.active_category !== "community") return;
            const newMaps = maps.map((map => ({
                map: map.map_id,
                name: map.reviewed ? map.name : map.random_name.replace("_", " "),
                author: map.author,
                user_id: map.user_id,
                reviewed: map.reviewed,
                rate: map.rate,
                votes: map.votes,
                revision: map.revision,
                updated_at: new Date(map.update_ts),
                has_thumbnail: map.has_thumbnail
            })));
            this.state.infiniteScroll.last_page_reached = newMaps.length === 0;
            this.state[category].push(...newMaps);
            this.render_map_choices("community");
            refreshScrollbar(this.el.available_scroll_outer);
            this.state.infiniteScroll.requesting = false
        }))
    },
    render_map_selection: function() {
        _empty(this.el.selected_list);
        if (!this.state.selected) return;
        let maps = [];
        if (this.state.type === "multi_select") {
            if (this.state.selected.length === 0) this.state.last_map_idx_clicked = null;
            maps = this.state.selected
        } else {
            maps = [this.state.selected]
        }
        let idx = 0;
        for (const map of maps) {
            const [map_id, map_name, is_community] = map;
            const map_idx = idx;
            let $map = _createElement("div", "map");
            $map.style.backgroundImage = `url("map-thumbnail://${map_id}")`;
            if (map_idx === 0) $map.classList.add("big");
            $map_info = _createElement("div", "map_info");
            $map_info.appendChild(_createElement("div", "name", _format_map_name(map_id, map_name)));
            let $map_actions = _createElement("div", "map_actions");
            let $map_action_pushtotop = _createElement("div", ["action", "push"]);
            let $map_action_remove = _createElement("div", ["action", "remove"]);
            if (map_idx > 0) $map_actions.appendChild($map_action_pushtotop);
            else $map_action_remove.classList.add("wide");
            $map_actions.appendChild($map_action_remove);
            $map.appendChild($map_info);
            $map.appendChild($map_actions);
            if (this.state.last_map_idx_clicked !== null && this.state.last_map_idx_clicked === map_idx) {
                $map_actions.style.display = "flex"
            }
            $map_action_pushtotop.addEventListener("click", (() => {
                this.state.last_map_idx_clicked = map_idx;
                if (map_idx >= 0) {
                    this.state.selected.splice(map_idx, 1);
                    this.state.selected.unshift(map)
                }
                this.render_map_selection()
            }));
            $map_action_remove.addEventListener("click", (() => {
                this.state.last_map_idx_clicked = map_idx;
                if (this.state.type === "multi_select") {
                    this.state.selected = this.state.selected.filter((([s_id]) => s_id !== map_id))
                } else {
                    this.state.selected = null;
                    this.el.create_vote_button.classList.add("disabled")
                }
                this.render_map_selection()
            }));
            $map.addEventListener("mouseenter", (() => {
                $map_actions.style.display = "flex"
            }));
            $map.addEventListener("mouseleave", (() => {
                $map_actions.style.display = "none";
                this.state.last_map_idx_clicked = null
            }));
            this.el.selected_list.appendChild($map);
            idx++
        }
        resetScrollbar(this.el.selected_scroll_outer);
        refreshScrollbar(this.el.selected_scroll_outer)
    }
};