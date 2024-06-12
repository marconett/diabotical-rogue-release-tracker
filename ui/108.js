new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "locker",
    screen_element: _id("locker_screen"),
    button_element: null,
    fullscreen: true,
    sound_open: "ui_locker_transition1",
    init: () => {
        page_locker.init()
    },
    open_handler: params => {
        set_blur(true);
        if (params && params.category && params.type) {
            page_locker.load_category(params.category, params.type)
        } else {
            page_locker.open_view("overview");
            if (!(params && params.onPopState)) {
                historyPushState({
                    page: "locker"
                })
            }
        }
    },
    close_handler: () => {
        page_locker.cancel_animations();
        set_blur(false)
    }
});
const page_locker = new function() {
    let data = {
        active_category: null,
        active_ctype: null,
        prev_active_type: null,
        active_view: "overview",
        array_type: false,
        modal_enabled: false,
        items_per_row: 4,
        rows: 4,
        item_page: 1,
        item_page_count: 1,
        content_data: [],
        show_default_item: false
    };
    let html = {
        root: null,
        menu_overview: null,
        menu_category: null,
        category_sub_menu: null,
        preview_area: null,
        list_title: null,
        list: null,
        page: null,
        screen_actions: null
    };
    let new_counts = {};
    let current_selection = null;
    let current_active_array = [];
    let equip_avail = false;
    this.init = () => {
        html.root = _id("locker_screen");
        html.menu_overview = _get_first_with_class_in_parent(html.root, "customize_menu_overview");
        html.menu_category = _get_first_with_class_in_parent(html.root, "customize_category_menu");
        html.group_container = _get_first_with_class_in_parent(html.menu_overview, "item_container");
        html.category_sub_menu = _get_first_with_class_in_parent(html.root, "sub_screen_menu_list");
        html.preview_area = _id("customize_option_preview");
        html.list = _get_first_with_class_in_parent(html.root, "customize_option_list");
        html.page = _get_first_with_class_in_parent(html.root, "page");
        html.page_prev = html.page.previousElementSibling;
        html.page_next = html.page.nextElementSibling;
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions");
        GAME.add_activate_callback((game_id => {
            init_groups()
        }));
        global_customization_seen_handlers.push((() => {
            update_new_counts()
        }));
        global_customization_update_handlers.push((() => {
            init_groups()
        }));
        Navigation.listen("locker", "lt", prev_page);
        Navigation.listen("locker", "rt", next_page);
        html.page_prev.addEventListener("click", prev_page);
        html.page_next.addEventListener("click", next_page);
        html.page_prev.addEventListener("mouseenter", (() => {
            engine.call("ui_sound", "ui_hover2")
        }));
        html.page_next.addEventListener("mouseenter", (() => {
            engine.call("ui_sound", "ui_hover2")
        }))
    };

    function init_groups() {
        create_customization_groups();
        update_new_counts();
        Navigation.generate_nav({
            name: "locker_main",
            nav_root: html.menu_overview,
            nav_class: "item",
            hover_sound: "ui_hover1",
            action_sound: "ui_click1",
            mouse_click: "action",
            action_cb_type: "input",
            grid: true,
            action_cb: category_action_cb,
            select_cb: item_select_cb,
            deselect_cb: item_deselect_cb
        })
    }

    function prev_page() {
        data.item_page--;
        if (data.item_page < 1) data.item_page = 1;
        engine.call("ui_sound", "ui_click1");
        render_customization_list(data.active_ctype)
    }

    function next_page() {
        data.item_page++;
        if (data.item_page > data.item_page_count) data.item_page = data.item_page_count;
        engine.call("ui_sound", "ui_click1");
        render_customization_list(data.active_ctype)
    }
    let category_action_cb = (element, action) => {
        if (element.dataset.category) {
            this.load_category(element.dataset.category)
        }
    };
    let item_action_cb = (element, action) => {
        this.equip_selection()
    };

    function item_select_cb(element) {
        if ("id" in element.dataset) {
            on_select(element)
        }
        _for_each_with_class_in_parent(element, "item_image", (el => {
            el.classList.add("active_selection")
        }))
    }

    function item_deselect_cb(element) {
        _for_each_with_class_in_parent(element, "item_image", (el => {
            el.classList.remove("active_selection")
        }))
    }
    this.open_view = view => {
        this.cancel_animations();
        if (view === "overview") {
            engine.call("on_show_customization_screen", false);
            html.menu_overview.classList.remove("hidden");
            html.menu_category.classList.add("hidden");
            data.active_category = null;
            Navigation.set_active({
                lb_rb: null,
                lt_rt: null,
                left_right: "locker_main",
                up_down: "locker_main"
            });
            let elements = html.menu_overview.querySelectorAll(".item");
            for (let el of elements) {
                if ("type" in el.dataset && el.dataset.type === "weapon" && "colorId" in el.dataset) {
                    if (el.dataset.type === "weapon" && el.dataset.colorId in global_weapon_definitions) {
                        el.style.setProperty("--color", "" + global_weapon_definitions[el.dataset.colorId].color)
                    }
                }
            }
            open_overview_animation()
        } else if (view === "category") {
            html.menu_overview.classList.add("hidden");
            html.menu_category.classList.remove("hidden");
            engine.call("ui_sound", "ui_locker_transition2")
        }
        data.active_view = view;
        render_screen_actions()
    };
    this.get_view = () => data.active_view;

    function create_customization_groups() {
        let group_map = GAME.get_data("customization_group_map");
        _empty(html.group_container);
        new_counts = {};
        let fragment = new DocumentFragment;
        for (let group_id in group_map) {
            let group_title = _createElement("div", ["item_category_title", "show_anim"], localize(group_map[group_id].i18n));
            group_title.classList.add("i18n");
            group_title.dataset.i18n = group_map[group_id].i18n;
            fragment.appendChild(group_title);
            let count = 0;
            let row = null;
            for (let c of group_map[group_id].categories) {
                if (count === 0) {
                    row = _createElement("div", "item_row")
                }
                let item = null;
                if (c.type && c.type === "header") {
                    item = _createElement("div", ["header", "show_anim", c.id])
                } else {
                    item = _createElement("div", ["item", "show_anim", c.id]);
                    if (c.type && c.type === "weapon" && c.color_id) {
                        item.dataset.type = "weapon";
                        item.dataset.colorId = c.color_id
                    }
                }
                item.dataset.category = c.id;
                let item_image = _createElement("div", "item_image");
                let image = _createElement("div", "image");
                let category_data = GAME.get_data("customization_category_map", c.id);
                if (category_data && category_data.length) {
                    current_customization_id = get_current_customization(category_data[0]);
                    if (current_customization_id) {
                        image.style.backgroundImage = "url(" + getCustomizationImagePath(current_customization_id, category_data[0].type_id) + ")"
                    } else if (category_data[0].type === "weapon") {
                        image.style.backgroundImage = "url(" + getCustomizationImagePath("we_" + category_data[0].sub_type, category_data[0].type_id) + ")"
                    }
                }
                item_image.appendChild(image);
                let new_count = _createElement("div", "new_count");
                item.appendChild(item_image);
                let title = _createElement("div", "item_title", localize(c.i18n));
                title.classList.add("i18n");
                title.dataset.i18n = c.i18n;
                item.appendChild(title);
                item.appendChild(new_count);
                new_counts[c.id] = {
                    category_count_div: new_count,
                    page_count_divs: {}
                };
                row.appendChild(item);
                count++;
                if (count === 5) {
                    count = 0;
                    fragment.appendChild(row);
                    row = null
                }
            }
            if (row !== null) {
                fragment.appendChild(row)
            }
        }
        html.group_container.appendChild(fragment)
    }
    const animation_timeouts = [];

    function open_overview_animation() {
        let elements = html.menu_overview.querySelectorAll(".show_anim");
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.add("hidden")
        }
        let delay = 100;
        for (let i = 0; i < elements.length; i++) {
            animation_timeouts.push(setTimeout((() => {
                elements[i].classList.remove("hidden");
                engine.call("ui_sound", "ui_locker_item_counter")
            }), delay));
            delay += 40
        }
    }
    this.cancel_animations = () => {
        for (let timeout of animation_timeouts) {
            clearTimeout(timeout)
        }
        animation_timeouts.length = 0
    };
    this.load_category = (category, selected_ctype) => {
        let category_data = GAME.get_data("customization_category_map", category);
        if (!category_data) return;
        let ctypes = category_data;
        if (selected_ctype) {
            data.active_ctype = selected_ctype
        } else if (ctypes.length) {
            data.active_ctype = ctypes[0]
        }
        _empty(html.category_sub_menu);
        let active_element = null;
        for (let ctype of ctypes) {
            let type_name = localize(ctype.type_i18n);
            if (ctype.type === "weapon") {
                let weap_data = get_weapon_by_tag(ctype.sub_type);
                if (weap_data) type_name = localize(weap_data.i18n);
                else type_name = ctype.sub_type
            }
            let el = _createElement("div", "sub_screen_menu_option");
            let name = _createElement("div", "name", type_name);
            el.appendChild(name);
            let new_count = customization_get_new_count(ctype);
            let new_div = _createElement("div", "new_count", new_count);
            el.appendChild(new_div);
            if (new_count == 0) new_div.style.display = "none";
            if (!category in new_counts) {
                new_counts[category] = {
                    category_count_div: undefined,
                    page_count_divs: {}
                }
            }
            new_counts[category]["page_count_divs"][ctype.page_id] = new_div;
            el.ctype = ctype;
            el.category = category;
            if (data.active_ctype.equals(ctype)) {
                active_element = el
            }
            html.category_sub_menu.appendChild(el)
        }
        Navigation.generate_nav({
            name: "locker_sub_categories",
            nav_root: html.category_sub_menu,
            nav_class: "sub_screen_menu_option",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            mouse_hover: "none",
            mouse_click: "action",
            action_cb_type: "immediate",
            selection_required: true,
            action_cb: sub_category_selected
        });
        Navigation.set_active({
            lb_rb: "locker_sub_categories"
        });
        Navigation.select_element("locker_sub_categories", active_element)
    };

    function sub_category_selected(element, action) {
        data.active_ctype = element.ctype;
        show_sub_category(element.category, element.ctype)
    }
    let show_sub_category = (category, ctype) => {
        current_selection = null;
        current_active_array = [];
        data.array_type = false;
        const array_types = GAME.get_data("customization_array_types");
        if (array_types && ctype.type in array_types) data.array_type = true;
        engine.call("reset_locker_agent_rotation");
        if (data.active_category !== category) {
            data.active_category = category
        }
        if (data.active_view !== "category") this.open_view("category");
        let current_history_obj = global_history.current();
        if (current_history_obj.page === "locker" && current_history_obj.category) {
            global_history.replace_current({
                page: "locker",
                category: category,
                type: ctype
            })
        } else {
            historyPushState({
                page: "locker",
                category: category,
                type: ctype
            })
        }
        html.preview_area.style.opacity = 1;
        let current_customization_id = get_current_customization(ctype);
        let current_customization = {};
        if (data.active_ctype.type == "country") {
            current_customization = {
                customization_id: current_customization_id,
                customization_type: 10,
                customization_sub_type: null,
                rarity: 0
            }
        } else {
            if (data.array_type) {
                if (Array.isArray(current_customization_id) && current_customization_id.length) {
                    if (current_customization_id[0] in global_customization_data_map) current_customization = global_customization_data_map[current_customization_id[0]];
                    for (let customization_id of current_customization_id) {
                        current_active_array.push(customization_id)
                    }
                }
            } else {
                if (current_customization_id in global_customization_data_map) current_customization = global_customization_data_map[current_customization_id]
            }
        }
        if (category.startsWith("c_")) {
            this.reset_character_to_equipped()
        } else {
            show_customization_preview_scene("locker", ctype, current_customization_id, current_customization, html.preview_area, create_customization_preview_info)
        }
        data.show_default_item = false;
        if (ctype.type == "country") {
            data.content_data = GLOBAL_AVAILABLE_COUNTRY_FLAGS
        } else {
            data.content_data = get_customization_category_content_data(ctype)
        }
        if (ctype.type in global_customization_disable_types && global_customization_disable_types[ctype.type]) {
            data.show_default_item = true
        }
        if (data.array_type) {
            data.show_default_item = false
        }
        let total_item_count = data.content_data.length;
        if (data.show_default_item) {
            total_item_count = total_item_count + 1
        }
        let items_per_page = data.rows * data.items_per_row;
        data.item_page_count = Math.ceil(total_item_count / items_per_page);
        if (data.item_page_count < 1) data.item_page_count = 1;
        if (current_customization.customization_id) {
            let i = 0;
            for (; i < data.content_data.length; i++) {
                if (ctype.type === "country") {
                    if (data.content_data[i] === current_customization.customization_id) {
                        if (data.show_default_item) i++;
                        break
                    }
                } else {
                    if (data.content_data[i].customization_id === current_customization.customization_id) {
                        if (data.show_default_item) i++;
                        break
                    }
                }
            }
            data.item_page = Math.ceil(i / items_per_page);
            if (data.item_page < 1) data.item_page = 1
        } else {
            data.item_page = 1
        }
        render_customization_list(ctype);
        update_equip_btn_state(ctype)
    };
    let render_customization_list = ctype => {
        let page_first_index = 0;
        if (data.item_page > 1) {
            page_first_index = data.items_per_row * data.rows * (data.item_page - 1);
            if (data.show_default_item) {
                page_first_index = page_first_index - 1
            }
        }
        html.page.textContent = localize_ext("page_x_of_n", {
            x: data.item_page,
            n: data.item_page_count
        });
        if (data.item_page <= 1) html.page_prev.classList.add("hidden");
        else html.page_prev.classList.remove("hidden");
        if (data.item_page_count === data.item_page) html.page_next.classList.add("hidden");
        else html.page_next.classList.remove("hidden");
        let current_customization = get_current_customization(ctype);
        let current_selection_element = null;
        let current_active_element = null;
        let item_count = 0;
        let item_index = page_first_index;
        let current_page_items = [];
        let fragment = new DocumentFragment;
        for (let i = 0; i < data.rows; i++) {
            let row = _createElement("div", "item_row");
            let remaining_items_for_row = data.items_per_row;
            if (data.show_default_item && data.item_page === 1 && i === 0) {
                let default_item = create_list_item(ctype);
                row.appendChild(default_item);
                current_page_items.push(default_item);
                item_count++;
                remaining_items_for_row--;
                if (current_selection === "") {
                    current_selection_element = default_item
                }
                if (is_customization_empty(current_customization)) {
                    set_active(default_item);
                    current_active_element = default_item
                }
            }
            if (data.content_data && data.content_data.length) {
                for (let y = 0; y < remaining_items_for_row; y++) {
                    if (item_index >= data.content_data.length) break;
                    let c = data.content_data[item_index];
                    let item = create_list_item(ctype, c);
                    row.appendChild(item);
                    current_page_items.push(item);
                    if (Array.isArray(current_customization) && c) {
                        if (current_customization.includes(c.customization_id)) {
                            set_active(item);
                            current_active_element = item
                        }
                    } else if (typeof current_customization === "string") {
                        if (ctype.type == "country") {
                            if (current_customization === c) {
                                set_active(item);
                                current_active_element = item
                            }
                        } else {
                            if (current_customization === c.customization_id) {
                                set_active(item);
                                current_active_element = item
                            }
                        }
                    }
                    if (current_selection) {
                        if (data.array_type) {
                            if (Array.isArray(current_selection) && current_selection.includes(c.customization_id)) {
                                current_selection_element = item
                            }
                        } else {
                            if (current_selection === c.customization_id) {
                                current_selection_element = item
                            }
                        }
                    }
                    item_count++;
                    item_index++
                }
            }
            if (!item_count) break;
            fragment.appendChild(row)
        }
        if (current_selection === null && current_active_element) {
            current_selection_element = current_active_element
        }
        if (item_count == 0) {
            let no_options = _createElement("div", "no_options", localize("customization_no_options_avail"));
            fragment.appendChild(no_options)
        }
        _empty(html.list);
        html.list.appendChild(fragment);
        Navigation.generate_nav({
            name: "locker_customizations",
            nav_root: html.list,
            nav_class: "item",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            mouse_hover: "none",
            mouse_click: "action",
            action_cb_type: "input",
            grid: true,
            action_cb: item_action_cb,
            select_cb: item_select_cb,
            deselect_cb: item_deselect_cb
        });
        Navigation.set_active({
            left_right: "locker_customizations",
            up_down: "locker_customizations"
        });
        Navigation.select_element("locker_customizations", current_selection_element);
        this.cancel_animations();
        for (let el of current_page_items) {
            el.classList.add("hidden")
        }
        let delay = 40;
        for (let el of current_page_items) {
            animation_timeouts.push(setTimeout((() => {
                el.classList.remove("hidden");
                engine.call("ui_sound", "ui_locker_item_counter")
            }), delay));
            delay += 40
        }
    };

    function create_list_item(ctype, c) {
        let item = _createElement("div", "item");
        if (!c) item.classList.add("default");
        let item_image = _createElement("div", "item_image");
        item.appendChild(item_image);
        if (ctype.type == "country") {
            let flag_image = _createElement("div", "country_flag");
            flag_image.style.backgroundImage = "url(" + _flagUrl(c) + ")";
            item_image.appendChild(flag_image)
        } else if (c) {
            let image = _createElement("div", "image");
            image.style.backgroundImage = "url(" + getCustomizationImagePath(c.customization_id, c.customization_type) + ")";
            item_image.appendChild(image)
        } else if (ctype.type === "weapon") {
            let image = _createElement("div", "image");
            image.style.backgroundImage = "url(" + getCustomizationImagePath("we_" + ctype.sub_type, ctype.type_id) + ")";
            item_image.appendChild(image)
        } else if (ctype.type === "suit") {
            let image = _createElement("div", "image");
            image.style.backgroundImage = "url(" + getCustomizationImagePath("su_" + ctype.sub_type, ctype.type_id) + ")";
            item_image.appendChild(image)
        }
        let title = _createElement("div", "item_title");
        item.appendChild(title);
        let options = _createElement("div", "options");
        item.appendChild(options);
        item.dataset.new = 0;
        if (c) {
            if (ctype.type == "country") {
                item.dataset.id = c;
                title.textContent = localize_country(c)
            } else {
                item.classList.add("show_rarity");
                item.style.setProperty("--rarity", "var(--rarity_dark_" + c.rarity + ")");
                item.dataset.id = c.customization_id;
                item.dataset.type = c.customization_type;
                title.textContent = localize("customization_" + c.customization_id);
                if (!("seen" in c) || c.seen == false) {
                    let new_div = _createElement("div", "new_count", "!");
                    item.appendChild(new_div);
                    item.dataset.new = 1
                }
            }
            if ("locked" in c) {
                item.appendChild(_createElement("div", "locked_icon"));
                item.dataset.locked = 1;
                item.classList.add("locked")
            }
        } else {
            item.classList.add("show_rarity");
            item.style.setProperty("--rarity", "var(--rarity_dark_0)");
            item.dataset.id = "";
            title.textContent = localize("default")
        }
        return item
    }

    function set_inactive(el) {
        if (!el) return;
        _for_each_with_class_in_parent(el, "item_image", (img => {
            img.classList.remove("active_item")
        }));
        el.classList.remove("active_item")
    }

    function set_active(el) {
        if (!el) return;
        _for_each_with_class_in_parent(el, "item_image", (img => {
            img.classList.add("active_item")
        }));
        el.classList.add("active_item")
    }
    this.reset_character_to_equipped = () => {
        let category_data = GAME.get_data("customization_category_map", data.active_category);
        if (!category_data) return;
        for (ctype of category_data) {
            const sub_types = GAME.get_data("customization_sub_types");
            if (!ctype.sub_type && sub_types && ctype.type_id in sub_types && sub_types[ctype.type_id].length) {
                for (let sub_type of sub_types[ctype.type_id]) {
                    let current = get_current_customization(new CustomizationType(ctype.type, sub_type));
                    engine.call("set_preview_" + ctype.type, sub_type, current);
                    if (ctype.page_id === data.active_ctype.page_id) {
                        let current_customization = {};
                        if (current in global_customization_data_map) current_customization = global_customization_data_map[current];
                        show_customization_preview_scene("locker", ctype, current, current_customization, html.preview_area, create_customization_preview_info)
                    }
                }
            } else {
                let current = get_current_customization(ctype);
                engine.call("set_preview_" + ctype.type, current);
                if (ctype.page_id === data.active_ctype.page_id) {
                    let current_customization = {};
                    if (current in global_customization_data_map) current_customization = global_customization_data_map[current];
                    show_customization_preview_scene("locker", ctype, current, current_customization, html.preview_area, create_customization_preview_info)
                }
            }
        }
        equip_avail = false;
        render_screen_actions()
    };

    function on_select(item_element) {
        let current_customization = {};
        if (data.active_ctype.type === "country") {
            current_customization = {
                customization_id: item_element.dataset.id,
                customization_type: 10,
                customization_sub_type: null,
                rarity: 0
            }
        } else {
            if (item_element.dataset.id in global_customization_data_map) current_customization = global_customization_data_map[item_element.dataset.id]
        }
        show_customization_preview_scene("locker", data.active_ctype, item_element.dataset.id, current_customization, html.preview_area, create_customization_preview_info);
        current_selection = item_element.dataset.id;
        update_equip_btn_state(data.active_ctype);
        if ("new" in item_element.dataset && item_element.dataset.new == "1") {
            set_customization_seen(item_element.dataset.id);
            let new_div = item_element.querySelector(".new_count");
            if (new_div) _remove_node(new_div);
            update_new_counts()
        }
    }
    this.equip_selection = () => {
        if (!data.active_ctype) return;
        if (!equip_avail) return;
        if (data.array_type) {
            let multi_item = [{
                id: [],
                type: data.active_ctype.type_id,
                sub_type: data.active_ctype.sub_type
            }];
            let add_element = true;
            let new_active_array = [];
            for (let customization_id of current_active_array) {
                if (current_selection && customization_id === current_selection) {
                    add_element = false;
                    continue
                }
                new_active_array.push(customization_id)
            }
            if (add_element && current_selection) {
                new_active_array.push(current_selection)
            }
            current_active_array = new_active_array;
            multi_item[0].id = new_active_array;
            console.log("SET:", _dump(multi_item[0]));
            send_string(CLIENT_COMMAND_SET_CUSTOMIZATIONS, JSON.stringify(multi_item));
            update_active(current_active_array)
        } else {
            let item = {
                id: current_selection,
                type: data.active_ctype.type_id,
                sub_type: data.active_ctype.sub_type
            };
            if (data.active_ctype.sub_type_extra.length) {
                item.sub_type_extra = data.active_ctype.sub_type_extra
            }
            console.log("SET:", _dump(item));
            send_string(CLIENT_COMMAND_SET_CUSTOMIZATIONS, JSON.stringify([item]));
            update_active(current_selection)
        }
        if (!data.array_type) {
            equip_avail = false;
            render_screen_actions()
        }
    };

    function update_active(active_id_or_ids) {
        if (Array.isArray(active_id_or_ids)) {
            _for_each_with_class_in_parent(html.list, "item", (item => {
                if (active_id_or_ids.includes(item.dataset.id)) {
                    set_active(item)
                } else {
                    set_inactive(item)
                }
            }))
        } else {
            _for_each_with_class_in_parent(html.list, "item", (item => {
                if (item.dataset.id === active_id_or_ids) {
                    set_active(item)
                } else {
                    set_inactive(item)
                }
            }))
        }
    }

    function update_equip_btn_state(ctype) {
        equip_avail = false;
        if (current_selection === null) {
            render_screen_actions();
            return
        }
        if (get_owned_customization(current_selection) === false && current_selection !== "") {
            equip_avail = false;
            render_screen_actions();
            return
        }
        if (data.array_type) {
            const array_types = GAME.get_data("customization_array_types");
            if (current_active_array.includes(current_selection)) {
                equip_avail = true;
                render_screen_actions();
                return
            }
            if (current_active_array.length + 1 > array_types[data.active_ctype.type]) {
                equip_avail = false;
                render_screen_actions();
                return
            }
        }
        let current = get_current_customization(ctype);
        if (current_selection === current) {
            equip_avail = false
        } else {
            equip_avail = true
        }
        render_screen_actions()
    }

    function update_new_counts() {
        let category_map = GAME.get_data("customization_category_map");
        for (let category in new_counts) {
            if (new_counts[category].category_count_div) {
                let new_count = 0;
                if (category in category_map) {
                    for (let ctype of category_map[category]) {
                        new_count += customization_get_new_count(ctype)
                    }
                }
                new_counts[category].category_count_div.textContent = new_count;
                if (new_count === 0) new_counts[category].category_count_div.style.display = "none";
                else new_counts[category].category_count_div.style.display = "flex"
            }
        }
        if (data.active_category in category_map) {
            for (let ctype of category_map[data.active_category]) {
                if (!new_counts.hasOwnProperty(data.active_category)) continue;
                if (!new_counts[data.active_category].page_count_divs.hasOwnProperty(ctype.page_id)) continue;
                let new_count = customization_get_new_count(ctype);
                let div = new_counts[data.active_category].page_count_divs[ctype.page_id];
                div.textContent = new_count;
                if (new_count == 0) div.style.display = "none";
                else div.style.display = "flex"
            }
        }
        let item_new_counts = html.list.querySelectorAll(".new_count");
        for (let new_div of item_new_counts) {
            if (new_div.parentElement && new_div.parentElement.dataset.id in global_customization_data_map && global_customization_data_map[new_div.parentElement.dataset.id].seen) {
                _remove_node(new_div)
            }
        }
        render_screen_actions()
    }

    function create_customization_preview_info(preview_container, customization) {
        let desc_cont = _id("customize_info");
        _empty(desc_cont);
        desc_cont.style.setProperty("--item_rarity_color", "var(--rarity_" + customization.rarity + ")");
        desc_cont.appendChild(createCustomizationInfo(customization))
    }
    let render_screen_actions = () => {
        let actions = [global_action_buttons.back];
        if (data.active_view === "overview") {
            if (customization_get_new_count_category()) {
                actions.unshift({
                    text: "Mark all as seen",
                    i18n: "mark_all_as_seen",
                    kbm_bind: "S",
                    controller_bind: null,
                    callback: () => {
                        set_all_customizations_seen()
                    }
                })
            }
        } else if (data.active_view === "category") {
            if (customization_get_new_count(data.active_ctype)) {
                actions.unshift({
                    text: "Mark all as seen",
                    i18n: "mark_all_as_seen",
                    kbm_bind: "S",
                    controller_bind: null,
                    callback: () => {
                        set_ctype_customizations_seen(data.active_ctype)
                    }
                })
            }
            if (equip_avail) {
                actions.unshift({
                    text: "Equip",
                    i18n: "menu_button_equip",
                    kbm_bind: "e",
                    controller_bind: "A",
                    callback: () => {
                        this.equip_selection()
                    }
                })
            }
        }
        Navigation.render_actions(actions, html.screen_actions)
    }
};