global_components["mode_selection_modal"] = new MenuComponent("mode_selection_modal", _id("mode_selection_modal_screen"), (function() {
    mode_selection_modal.init()
}));
const mode_selection_modal = {
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
        limit_own: false,
        last_api_options: {},
        infiniteScroll: {
            page: 0,
            requesting: false,
            last_page_reached: false
        },
        mode_data: {},
        confirm_cb: null,
        last_mode_idx_clicked: null,
        MAX_NUMBER_SELECTIONS: 1
    },
    el: {
        modal: null,
        generic_modal_dialog: null,
        available: null,
        selected: null,
        available_scroll_outer: null,
        available_list: null,
        selected_mode: null,
        ai_mode_panel: null,
        ai_game_mode_toggle: null,
        ai_game_mode_description: null,
        ai_game_mode_description_container: null,
        category: null,
        mode_choice_filter_input: null,
        mode_choice_sort: null,
        mode_choice_filter_own: null
    },
    resetInfiniteScroll: function() {
        this.state.infiniteScroll.last_page_reached = false;
        this.state.infiniteScroll.requesting = false;
        this.state.infiniteScroll.page = 0
    },
    init: function() {
        this.el.modal = _id("mode_choice_modal_screen");
        this.el.generic_modal_dialog = this.el.modal.querySelector(".generic_modal_dialog");
        this.el.available = _id("mode_selection_modal_available");
        this.el.selected = _id("mode_selection_modal_selected");
        this.el.available_scroll_outer = this.el.available.querySelector(".scroll-outer.content");
        this.el.available_list = this.el.available.querySelector(".scroll-inner.list");
        this.el.selected_mode = this.el.selected.querySelector(".selected_mode");
        this.el.ai_mode_panel = _id("ai_game_mode_panel");
        this.el.ai_game_mode_toggle = _id("ai_game_mode_toggle");
        this.el.ai_game_mode_description = _id("ai_game_mode_description");
        this.el.ai_game_mode_description_container = _id("ai_game_mode_description_container");
        this.el.category = this.el.available.querySelector(".menu .center");
        this.el.mode_choice_filter_input = _id("mode_choice_filter_input");
        this.el.mode_choice_sort = _id("mode_choice_sort");
        this.el.mode_choice_filter_own = _id("mode_choice_filter_own");
        ui_setup_select(this.el.mode_choice_sort, ((opt, field) => {
            this.el.mode_choice_filter_input.value = "";
            this.update_mode_choices({
                category: this.state.active_category,
                order: field.dataset.value
            })
        }));
        global_input_debouncers["mode_choice_filter_input"] = new InputDebouncer((() => {
            this.update_mode_choices({
                category: this.state.active_category,
                search: this.el.mode_choice_filter_input.value.trim(),
                order: this.el.mode_choice_sort.dataset.value
            })
        }));
        setup_toggle(this.el.mode_choice_filter_own, false, ((toggle, bool) => {
            this.state.limit_own = bool;
            this.update_mode_choices({
                category: this.state.active_category,
                limit_own: this.state.limit_own
            })
        }));
        this.render_category();
        Navigation.generate_nav({
            name: "mode_selection_modal",
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
            Navigation.prev("mode_selection_modal")
        }));
        nav_forward.addEventListener("click", (() => {
            Navigation.next("mode_selection_modal")
        }));
        this.el.available_list.addEventListener("scroll", (event => {
            if (this.state.active_category !== "community") return;
            const threshold = 150;
            const containerHeight = event.target.getBoundingClientRect().height;
            const windowBottom = event.target.scrollTop + containerHeight;
            if (!this.state.infiniteScroll.requesting && !this.state.infiniteScroll.last_page_reached && windowBottom > event.target.scrollHeight - threshold) {
                this.state.infiniteScroll.page++;
                this.update_mode_choices_page()
            }
        }));
        on_close_modal_screen.push((modal_id => {
            if (modal_id === "mode_choice_modal_screen" && this.state.open) {
                this.close()
            }
        }));
        _for_each_with_class_in_parent(this.el.ai_mode_panel, "toggle", (toggle => {
            let current_value = false;
            if ("value" in toggle.dataset) current_value = toggle.dataset.value === "1" ? true : false;
            setup_toggle(toggle, current_value, ((toggle, value) => {
                this.reset_ai_game_mode_panel();
                this.el.ai_game_mode_description_container.style.display = value ? "block" : "none"
            }))
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
        this.state.limit_own = false;
        set_toggle(this.el.mode_choice_filter_own, false, true);
        _empty(this.el.selected_mode);
        this.reset_ai_game_mode_panel()
    },
    open: function(selected, cb) {
        this.state.open = true;
        this.state.last_mode_idx_clicked = null;
        this._reset_state();
        if (typeof cb === "function") this.state.confirm_cb = cb;
        if (selected) {
            this.state.selected = [selected, ""];
            this.render_mode_selection()
        }
        if (this.el.mode_choice_filter_input.value) this.el.mode_choice_filter_input.value = "";
        Navigation.set_override_active("modal", {
            lb_rb: "mode_selection_modal"
        });
        open_modal_screen("mode_choice_modal_screen")
    },
    close: function() {
        this.state.open = false;
        Navigation.set_override_inactive("modal");
        close_modal_screen_by_selector("mode_choice_modal_screen")
    },
    confirm_selection: async
    function() {
        if (this.state.selected === null) return;
        _play_click1();
        let ai_mode_prompt = undefined;
        if (this.el.ai_game_mode_toggle ? .dataset.value === "1") {
            ai_mode_prompt = this.el.ai_game_mode_description.value
        }
        if (this.state.confirm_cb !== null) {
            const retval = await this.state.confirm_cb(this.state.selected, ai_mode_prompt);
            if (retval) {
                this.close()
            }
        } else {
            this.close()
        }
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
        if (this.state.active_category === "community") {
            this.el.mode_choice_filter_own.parentElement.style.display = "flex"
        } else {
            this.el.mode_choice_filter_own.parentElement.style.display = "none"
        }
        this.resetInfiniteScroll();
        this.update_mode_choices({
            category: this.state.active_category,
            order: this.el.mode_choice_sort.dataset.value
        })
    },
    get_category_name: function() {
        if (this.state.active_category === "community") return "Community Modes";
        return "Official Modes"
    },
    render_mode_choices: function(category) {
        let modes = this.state[category];
        let fragment = new DocumentFragment;
        for (let m of modes) {
            let mode = _createElement("div", "mode");
            if (this.state.selected && this.state.selected[0] === m.mode_id) {
                mode.classList.add("selected")
            }
            let mode_row_1 = _createElement("div", "row");
            mode.appendChild(mode_row_1);
            let name = m.name;
            if (m.review_status !== 1 && m.random_name) name = m.random_name;
            if (category === "official") {
                let game_mode_map = GAME.get_data("game_mode_map");
                if (game_mode_map && m.mode_id in game_mode_map) {
                    name = localize(game_mode_map[m.mode_id].i18n)
                }
            }
            if (name.trim().length === 0) name = localize("unnamed_mode");
            let name_el = _createElement("div", "name");
            mode_row_1.appendChild(name_el);
            name_el.appendChild(_createElement("div", "mode_name_readable", name));
            name_el.appendChild(_createElement("div", "mode_name", "(" + m.mode_id + ")"));
            if (m.review_status === 0) {
                name_el.appendChild(_createElement("span", ["mode_under_review"], localize("map_under_review")))
            }
            const mode_author = _createElement("div", "author", "");
            mode_row_1.appendChild(mode_author);
            if (m.user_name) {
                mode_author.textContent = m.user_name;
                mode_author.dataset.userId = m.user_id
            }
            const state = _createElement("div", "state");
            if (m.state === 0) {
                if (global_self.user_id === m.user_id) {
                    state.textContent = localize("public")
                }
            } else if (m.state === 1) {
                state.textContent = localize("hidden")
            } else if (m.state === 2) {
                state.textContent = localize("developer_only")
            } else if (m.state === 3) {
                state.textContent = localize("hidden_blocked")
            }
            mode_row_1.appendChild(state);
            const MAX_7_DAYS = 8 * 24 * 60 * 60 * 1e3;
            let update_ts = new Date(m.update_ts);
            const $updated_at = _createElement("div", "updated_at");
            if (m.update_ts != undefined && Date.now() - update_ts.getTime() < MAX_7_DAYS) {
                $updated_at.textContent = `${moment(update_ts).fromNow()}`
            }
            mode_row_1.appendChild($updated_at);
            mode.addEventListener("click", (() => {
                this.state.last_mode_idx_clicked = null;
                _play_cb_check();
                this.state.selected = [m.mode_id, name];
                this.reset_ai_game_mode_panel();
                this.render_mode_selection();
                let prev_selected = this.el.available_list.querySelector(".mode.selected");
                if (prev_selected) prev_selected.classList.remove("selected");
                mode.classList.add("selected")
            }));
            fragment.appendChild(mode)
        }
        _empty(this.el.available_list);
        this.el.available_list.appendChild(fragment);
        resetScrollbar(this.el.available_scroll_outer);
        refreshScrollbar(this.el.available_scroll_outer)
    },
    reset_ai_game_mode_panel: function(value) {
        if (this.el.ai_game_mode_toggle) {
            if (value) {
                set_toggle(this.el.ai_game_mode_toggle, true, true);
                this.el.ai_game_mode_description.value = value;
                this.el.ai_game_mode_description_container.style.display = "block"
            } else {
                set_toggle(this.el.ai_game_mode_toggle, false, true);
                this.el.ai_game_mode_description.value = "";
                this.el.ai_game_mode_description_container.style.display = "none"
            }
        }
    },
    update_mode_choices: function(options) {
        if (!options) options = {};
        if (!options.category) {
            options.category = "official"
        }
        const community_modes_enabled = GAME.get_data("COMMUNITY_MODES");
        if (options.category === "community" && !community_modes_enabled) return;
        _empty(this.el.available_list);
        this.el.available_list.appendChild(_createSpinner());
        options = {...this.state.last_api_options, ...options
        };
        this.resetInfiniteScroll();
        this.state.last_api_options = options;
        const order = options && options.order && options.order.length ? `&order=${options.order}` : ``;
        const search = options && options.search && options.search.length ? `&search=${encodeURI(options.search)}` : ``;
        const limit_own = options && options.limit_own ? `&limit_own=true` : ``;
        const page = `&page=${this.state.infiniteScroll.page}`;
        this.state.infiniteScroll.requesting = true;
        console.log(`/modes?category=${options.category}${order}${search}${page}${limit_own}`);
        api_request("GET", `/modes?category=${options.category}${order}${search}${page}${limit_own}`, {}, (modes => {
            _empty(this.el.available_list);
            if (this.state.active_category !== options.category) return;
            if (modes) {
                this.state[options.category] = modes
            } else {
                this.state[options.category] = []
            }
            this.render_mode_choices(options.category);
            this.state.infiniteScroll.requesting = false
        }))
    },
    update_mode_choices_page: function() {
        const community_modes_enabled = GAME.get_data("COMMUNITY_MODES");
        if (options.category === "community" && !community_modes_enabled) return;
        const options = {...this.state.last_api_options
        };
        const order = options && options.order && options.order.length ? `&order=${options.order}` : ``;
        const search = options && options.search && options.search.length ? `&search=${encodeURI(options.search)}` : ``;
        const limit_own = options && options.limit_own ? `&limit_own=true` : ``;
        const page = `&page=${this.state.infiniteScroll.page}`;
        this.state.infiniteScroll.requesting = true;
        api_request("GET", `/modes?category=${options.category}${order}${search}${page}${limit_own}`, {}, (modes => {
            if (this.state.active_category !== options.category) return;
            this.state.infiniteScroll.last_page_reached = modes.length === 0;
            this.state[options.category].push(...modes);
            this.render_mode_choices(options.category);
            refreshScrollbar(this.el.available_scroll_outer);
            this.state.infiniteScroll.requesting = false
        }))
    },
    render_mode_selection: function() {
        if (!this.state.selected) {
            _empty(this.el.selected_mode);
            return
        }
        if (this.state.selected[0] in this.state.mode_data) {
            _empty(this.el.selected_mode);
            let ai_mode_error_el = _id("ai_mode_error");
            if (ai_mode_error_el) ai_mode_error_el.style.display = "none";
            let mode_data = this.state.mode_data[this.state.selected[0]];
            let name = mode_data.name;
            if (mode_data.review_status !== 1 && mode_data.random_name) name = mode_data.random_name;
            let game_mode_map = GAME.get_data("game_mode_map");
            if (game_mode_map && mode_data.mode_id in game_mode_map) {
                name = localize(game_mode_map[mode_data.mode_id].i18n)
            }
            this.state.selected[1] = name;
            if (name.trim().length === 0) name = localize("unnamed_mode");
            let name_el = _createElement("div", "name");
            name_el.appendChild(_createElement("div", "mode_name_readable", name));
            name_el.appendChild(_createElement("div", "mode_name", "(" + mode_data.mode_id + ")"));
            this.el.selected_mode.appendChild(name_el);
            let desc_el = _createElement("div", "desc");
            this.el.selected_mode.appendChild(desc_el);
            let desc = "";
            if (mode_data.description) {
                desc = mode_data.description
            } else if (mode_data.official && game_mode_map && mode_data.mode_id in game_mode_map) {
                desc = localize(game_mode_map[mode_data.mode_id].desc_i18n);
                if (desc === game_mode_map[mode_data.mode_id].desc_i18n) desc = ""
            }
            if (!mode_data.official && mode_data.review_status !== 1) {
                if (mode_data.review_status === 0) {
                    desc = localize("pending_review")
                } else {
                    desc = " "
                }
            }
            if (desc) {
                desc_el.textContent = desc
            } else {
                desc_el.textContent = "No description available"
            }
            if (this.el.ai_model_panel) {
                if (mode_data.official) {
                    this.el.ai_mode_panel.style.display = "block"
                } else {
                    this.el.ai_mode_panel.style.display = "none"
                }
            }
        } else {
            api_request("GET", `/mode?mode_id=${this.state.selected[0]}`, {}, (mode => {
                if (!mode) return;
                if (this.state.selected[0] !== mode.mode_id) return;
                set_global_map_list_from_api(mode.mode_id, mode.maps);
                this.state.mode_data[mode.mode_id] = mode;
                this.render_mode_selection()
            }))
        }
    }
};