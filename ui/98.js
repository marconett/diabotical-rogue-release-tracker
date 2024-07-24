global_components["mode_selection_modal"] = new MenuComponent("mode_selection_modal", _id("mode_selection_modal_screen"), (function() {
    mode_selection_modal.init()
}));
const mode_selection_modal = {
    state: {
        open: false,
        type: null,
        mode: null,
        categories: ["official"],
        active_category: "official",
        official: [],
        community: [],
        selected: null,
        selected_el: null,
        order_by: undefined,
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
        category: null,
        mode_choice_filter_input: null,
        mode_choice_sort: null
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
        this.el.category = this.el.available.querySelector(".menu .center");
        this.el.mode_choice_filter_input = _id("mode_choice_filter_input");
        this.el.mode_choice_sort = _id("mode_choice_sort");
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
        _empty(this.el.selected_mode)
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
    confirm_selection: function() {
        if (this.state.selected === null) return;
        this.close();
        _play_click1();
        if (this.state.confirm_cb !== null) this.state.confirm_cb(this.state.selected)
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
        this.resetInfiniteScroll();
        this.update_mode_choices({
            category: this.state.active_category,
            order: this.el.mode_choice_sort.dataset.value
        })
    },
    get_category_name: function() {
        return "Official Modes"
    },
    render_mode_choices: function(category) {
        let modes = this.state[category];
        let fragment = new DocumentFragment;
        for (let m of modes) {
            let mode = _createElement("div", "mode");
            let name = m.name;
            if (category === "official") {
                let game_mode_map = GAME.get_data("game_mode_map");
                if (game_mode_map && m.mode_name in game_mode_map) {
                    name = localize(game_mode_map[m.mode_name].i18n)
                }
            }
            let name_el = _createElement("div", "name");
            mode.appendChild(name_el);
            name_el.appendChild(_createElement("div", "mode_name_readable", name));
            name_el.appendChild(_createElement("div", "mode_name", "(" + m.mode_name + ")"));
            const mode_author = _createElement("div", "author", "");
            mode.appendChild(mode_author);
            if (m.user_name) {
                mode_author.textContent = m.user_name;
                mode_author.dataset.userId = m.user_id
            }
            const MAX_7_DAYS = 8 * 24 * 60 * 60 * 1e3;
            let update_ts = new Date(m.update_ts);
            if (m.update_ts != undefined && Date.now() - update_ts.getTime() < MAX_7_DAYS) {
                const $updated_at = _createElement("div", "update_at");
                $updated_at.textContent = `${moment(update_ts).fromNow()}`;
                mode.appendChild($updated_at)
            }
            mode.addEventListener("click", (() => {
                this.state.last_mode_idx_clicked = null;
                _play_cb_check();
                this.state.selected = [m.mode_name, name];
                this.render_mode_selection()
            }));
            fragment.appendChild(mode)
        }
        _empty(this.el.available_list);
        this.el.available_list.appendChild(fragment);
        resetScrollbar(this.el.available_scroll_outer);
        refreshScrollbar(this.el.available_scroll_outer)
    },
    update_mode_choices: function(options) {
        if (!options.category) {
            options.category = "official"
        }
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
        api_request("GET", `/modes?category=${options.category}${order}${search}${page}${limit_own}`, {}, (modes => {
            if (this.state.active_category !== options.category) return;
            _empty(this.el.available_list);
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
            let mode_data = this.state.mode_data[this.state.selected[0]];
            let name = mode_data.name;
            let game_mode_map = GAME.get_data("game_mode_map");
            if (game_mode_map && mode_data.mode_name in game_mode_map) {
                name = localize(game_mode_map[mode_data.mode_name].i18n)
            }
            let name_el = _createElement("div", "name");
            name_el.appendChild(_createElement("div", "mode_name_readable", name));
            name_el.appendChild(_createElement("div", "mode_name", "(" + mode_data.mode_name + ")"));
            this.el.selected_mode.appendChild(name_el);
            let desc_el = _createElement("div", "desc");
            this.el.selected_mode.appendChild(desc_el);
            let desc = "";
            if (mode_data.description) {
                desc = mode_data.description
            } else if (mode_data.official && game_mode_map && mode_data.mode_name in game_mode_map) {
                desc = localize(game_mode_map[mode_data.mode_name].desc_i18n);
                if (desc === game_mode_map[mode_data.mode_name].desc_i18n) desc = ""
            }
            if (desc) {
                desc_el.textContent = desc
            } else {
                desc_el.textContent = "No description available"
            }
            if (mode_data.data && typeof mode_data.data === "object" && Object.keys(mode_data.data).length) {
                let data_el = _createElement("div", "data");
                data_el.textContent = JSON.stringify(mode_data.data, null, "\t");
                this.el.selected_mode.appendChild(data_el)
            }
        } else {
            api_request("GET", `/mode?mode_name=${this.state.selected[0]}`, {}, (mode => {
                if (this.state.selected[0] !== mode.mode_name) return;
                set_global_map_list_from_api(mode.mode_name, mode.maps);
                this.state.mode_data[mode.mode_name] = mode;
                this.render_mode_selection()
            }))
        }
    }
};