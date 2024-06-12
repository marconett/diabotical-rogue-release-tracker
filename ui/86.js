var _select_id_counter = 1;
var _living_select_lists_ids = {};

function setup_select(el, cb, data) {
    if (el.classList.contains("options_carousel")) {
        setup_options_carousel(el, cb, data)
    } else {
        setup_dropdown(el, cb, data)
    }
}

function update_select(el) {
    if (el.classList.contains("options_carousel")) {
        update_options_carousel(el)
    } else {
        update_dropdown(el)
    }
}

function setup_dropdown(el, cb, data) {
    if (!el) return;
    el.classList.add("dropdown");
    var caption = "";
    var i18n = "";
    if (!data) {
        data = [];
        for (var i = 0; i < el.children.length; i++) {
            if (el.children[i].dataset.selectinternal == "1") {
                el.removeChild(el.children[i]);
                i--
            } else {
                if (el.children[i].classList.contains("select-category")) {
                    var newNode = {};
                    newNode.text_content = el.children[i].textContent;
                    newNode.is_category = true;
                    data.push(newNode)
                } else if (el.children[i].classList.contains("select-divider")) {
                    var newNode = {};
                    newNode.text_content = "";
                    newNode.is_divider = true;
                    data.push(newNode)
                } else {
                    var newNode = {};
                    for (var dataset_key in el.children[i].dataset) {
                        newNode[dataset_key] = el.children[i].dataset[dataset_key]
                    }
                    newNode.selected = false;
                    if (el.children[i].dataset.selected == "1") {
                        el.dataset.value = el.children[i].dataset.value;
                        caption = el.children[i].textContent;
                        if ("i18n" in el.children[i].dataset && el.children[i].classList.contains("i18n")) {
                            i18n = el.children[i].dataset.i18n
                        }
                        newNode.selected = true
                    }
                    newNode.text_content = el.children[i].textContent;
                    data.push(newNode)
                }
                el.children[i].style.display = "none"
            }
        }
        if ((el.dataset.value === undefined || el.dataset.value === "") && el.children.length) {
            el.dataset.value = el.children[0].dataset.value;
            caption = el.children[0].textContent
        }
    }
    if (cb) {
        el.callback = cb
    }
    if (data && data.length) {
        for (var i = 0; i < el.children.length; i++) {
            if (el.children[i].dataset.selectinternal == "1") {
                el.removeChild(el.children[i]);
                i--
            }
        }
        for (let opt of data) {
            if (opt.selected) {
                el.dataset.value = opt.value;
                caption = opt.text_content;
                break
            }
        }
    }
    el.classList.add("mouseover-sound4");
    var button_element = _createElement("div", "select-button", caption);
    button_element.dataset.selectinternal = "1";
    if (i18n.length) {
        button_element.classList.add("i18n");
        button_element.dataset.i18n = i18n
    }
    el.appendChild(button_element);
    var list_element = _createElement("div", ["select-list", "scroll-outer"]);
    list_element.style.display = "none";
    list_element.dataset.selectinternal = "1";
    var id = _select_id_counter++;
    list_element.id = "select_list_" + id;
    var scrollbar = _createElement("div", "scroll-bar");
    scrollbar.appendChild(_createElement("div", "scroll-bar-track"));
    scrollbar.appendChild(_createElement("div", "scroll-thumb"));
    list_element.appendChild(scrollbar);
    scrollbar.addEventListener("click", (e => {
        e.stopPropagation()
    }));
    var list_cont = _createElement("div", "scroll-inner");
    var list_cont_inner = _createElement("div", "select-list-inner");
    let initial_option = null;
    for (var i = 0; i < data.length; i++) {
        var node = data[i];
        let field_element = document.createElement("div");
        field_element.classList.add("select-option");
        field_element.textContent = node.text_content;
        for (var dataset_key in node) {
            field_element.dataset[dataset_key] = node[dataset_key];
            if (dataset_key == "i18n") {
                field_element.classList.add("i18n")
            }
        }
        field_element.dataset.selectinternal = "1";
        field_element.dataset.value = node.value;
        field_element.id = "select_option_" + id + "_" + i;
        if (field_element.dataset.value === el.dataset.value) {
            initial_option = field_element
        }
        if ("selected" in node && node.selected) {
            field_element.classList.add("selected")
        }
        if (node.is_category) {
            field_element.classList.add("select-category")
        }
        if (node.is_divider) {
            field_element.classList.add("select-divider")
        }
        list_cont_inner.appendChild(field_element)
    }
    list_cont.appendChild(list_cont_inner);
    list_element.appendChild(list_cont);
    el.appendChild(list_element);
    el.dataset.list_element_id = list_element.id;
    el.addEventListener("click", dropdown_select_click_handler);
    if (el.hasAttribute("data-theme")) {
        el.classList.add("theme_" + el.dataset.theme);
        list_element.classList.add("theme_" + el.dataset.theme)
    }
    if (initial_option) {
        dropdown_select_set_current(el, initial_option)
    }
}

function dropdown_select_set_current(el, field_element) {
    _for_each_with_class_in_parent(el, "select-button", (subel => {
        subel.textContent = field_element.textContent
    }));
    el.dataset.value = field_element.dataset.value;
    var list_element = _id(el.dataset.list_element_id);
    if (list_element) {
        list_element.style.display = "none"
    }
    _for_each_with_class_in_parent(el, "select-option", (function(el) {
        if (field_element.dataset.value == el.dataset.value) {
            el.classList.add("selected")
        } else {
            el.classList.remove("selected")
        }
    }))
}

function update_dropdown(el) {
    for (var i = 0; i < el.children.length; i++) {
        if ("value" in el.children[i].dataset) {
            if (el.children[i].dataset.value.trim() == el.dataset.value.trim()) {
                _for_each_with_class_in_parent(el, "select-button", (subel => {
                    subel.textContent = el.children[i].textContent;
                    if ("i18n" in el.children[i].dataset && el.children[i].classList.contains("i18n")) {
                        subel.classList.add("i18n");
                        subel.dataset.i18n = el.children[i].dataset.i18n
                    } else {
                        subel.classList.remove("i18n");
                        delete subel.dataset.i18n
                    }
                }));
                _for_each_with_class_in_parent(el, "select-option", (function(option) {
                    if (el.dataset.value == option.dataset.value) {
                        option.classList.add("selected")
                    } else {
                        option.classList.remove("selected")
                    }
                }));
                break
            }
        }
    }
}

function dropdown_select_click_handler(event) {
    var list_element = _id(event.target.dataset.list_element_id);
    if (list_element) {
        var select_field = list_element.closest(".select-field");
        if (!list_element.parentElement.classList.contains("disabled")) {
            let main_menu = _id("main_menu");
            let clone_id = list_element.id + "_open";
            if (_living_select_lists_ids.hasOwnProperty(clone_id)) {
                main_menu.removeChild(_id(clone_id));
                delete _living_select_lists_ids[clone_id]
            } else {
                let rect = event.target.getBoundingClientRect();
                let clone = list_element.cloneNode(true);
                clone.style.top = 0;
                clone.style.left = 0;
                clone.style.opacity = 0;
                clone.style.pointerEvents = "none";
                clone.style.width = rect.width + "px";
                clone.style.display = "flex";
                clone.id = clone.id + "_open";
                main_menu.appendChild(clone);
                req_anim_frame((() => {
                    let list_rect = clone.getBoundingClientRect();
                    let client_bottom_pos = rect.y + rect.height + list_rect.height;
                    if (client_bottom_pos > window.innerHeight) {
                        clone.style.top = rect.y - list_rect.height + "px"
                    } else {
                        clone.style.top = Math.floor(rect.y) + rect.height + 3 + "px"
                    }
                    clone.style.left = Math.ceil(rect.x) + "px";
                    clone.style.pointerEvents = "auto";
                    let selected_element = null;
                    _click_outside_select_handler();
                    _living_select_lists_ids[clone.id] = true;
                    for (let i = 0; i < clone.children[1].children[0].children.length; i++) {
                        if (clone.children[1].children[0].children[i].classList.contains("selected")) {
                            selected_element = clone.children[1].children[0].children[i]
                        }
                    }
                    if (clone.children[1].children[0].children.length > 9) {
                        let sb = new Scrollbar(clone, 999);
                        global_scrollbarTracker[999] = sb;
                        clone.style.opacity = 1
                    } else {
                        clone.children[0].style.display = "none";
                        clone.children[1].style.paddingRight = 0;
                        clone.style.opacity = 1
                    }
                    Navigation.generate_nav({
                        name: "select_list_dropdown",
                        nav_root: clone,
                        nav_class: "select-option",
                        nav_scroll: clone,
                        selection_required: false,
                        hover_sound: "ui_hover2",
                        action_sound: "",
                        mouse_hover: "select",
                        mouse_click: "instant-action",
                        action_cb_type: "input",
                        action_cb: el => {
                            if (el.classList.contains("selected")) return;
                            dropdown_select_set_current(select_field, el);
                            if (typeof select_field.callback === "function") {
                                select_field.callback(el, select_field)
                            }
                            _click_outside_select_handler()
                        }
                    });
                    Navigation.set_override_active("modal", {
                        up_down: "select_list_dropdown"
                    });
                    if (selected_element) {
                        Navigation.select_element("select_list_dropdown", selected_element)
                    }
                }))
            }
        }
    }
    event.stopPropagation()
}

function _click_outside_select_handler() {
    Navigation.set_override_inactive("modal");
    close_all_selects()
}

function close_all_selects() {
    for (var id in _living_select_lists_ids) {
        _close_select_by_id(id)
    }
}

function _close_select_by_id(id) {
    let el = _id(id);
    if (el) {
        _id("main_menu").removeChild(el);
        delete _living_select_lists_ids[id]
    } else {
        delete _living_select_lists_ids[id]
    }
}

function initialize_dropdown_select(container) {
    container.removeEventListener("click", _click_outside_select_handler);
    container.addEventListener("click", _click_outside_select_handler)
}

function setup_options_carousel(el, cb, data) {
    if (!el) return;
    var caption = "";
    var i18n = "";
    if (!data) {
        data = [];
        for (var i = 0; i < el.children.length; i++) {
            if (el.children[i].dataset.selectinternal == "1") {
                el.removeChild(el.children[i]);
                i--
            } else if (!el.children[i].classList.contains("select-category") && !el.children[i].classList.contains("select-divider")) {
                let newNode = {};
                for (var dataset_key in el.children[i].dataset) {
                    newNode[dataset_key] = el.children[i].dataset[dataset_key]
                }
                newNode.selected = false;
                if (el.children[i].dataset.selected == "1") {
                    el.dataset.value = el.children[i].dataset.value;
                    caption = el.children[i].textContent;
                    if ("i18n" in el.children[i].dataset && el.children[i].classList.contains("i18n")) {
                        i18n = el.children[i].dataset.i18n
                    }
                    newNode.selected = true
                }
                newNode.text_content = el.children[i].textContent;
                data.push(newNode);
                el.children[i].style.display = "none"
            }
        }
        if ((el.dataset.value === undefined || el.dataset.value === "") && el.children.length) {
            el.dataset.value = el.children[0].dataset.value;
            caption = el.children[0].textContent
        }
    }
    var back_button = _createElement("div", "options_carousel_back");
    var forward_button = _createElement("div", "options_carousel_forward");
    var text_cont = _createElement("div", "options_carousel_text_cont");
    var options_list = _createElement("div", "options_carousel_list");
    back_button.dataset.selectinternal = "1";
    forward_button.dataset.selectinternal = "1";
    text_cont.dataset.selectinternal = "1";
    options_list.dataset.selectinternal = "1";
    el.appendChild(back_button);
    el.appendChild(text_cont);
    el.appendChild(forward_button);
    el.appendChild(options_list);
    let initial_option = null;
    for (var i = 0; i < data.length; i++) {
        var node = data[i];
        let option = _createElement("div", "select-option", node.text_content);
        for (var dataset_key in node) {
            option.dataset[dataset_key] = node[dataset_key];
            if (dataset_key == "i18n") {
                option.classList.add("i18n")
            }
        }
        option.dataset.selectinternal = "1";
        option.dataset.value = node.value;
        if (option.dataset.value === el.dataset.value) {
            initial_option = option
        }
        var text = _createElement("div", "options_carousel_text", option.textContent);
        if ("i18n" in option.dataset && option.classList.contains("i18n")) {
            text.classList.add("i18n");
            text.dataset.i18n = el.children[i].dataset.i18n
        }
        text.dataset.selectinternal = "1";
        text_cont.appendChild(text);
        if (i == 0) {
            option.dataset.first = true
        }
        if (i == data.length - 1) {
            option.dataset.last = true
        }
        if ("selected" in node && node.selected) {
            option.classList.add("selected");
            if (i == 0) {
                back_button.classList.add("disabled")
            }
            if (i == data.length - 1) {
                forward_button.classList.add("disabled")
            }
            text.style.visibility = "visible"
        }
        options_list.appendChild(option)
    }
    if (cb) {
        el.callback = cb
    }
    back_button.addEventListener("click", (function() {
        if (!back_button.classList.contains("disabled") && !el.classList.contains("disabled")) {
            let currentOption = _get_first_with_class_in_parent(el, "selected");
            if (currentOption) {
                options_carousel_set_current(el, currentOption.previousSibling);
                if (cb) {
                    cb(currentOption.previousSibling, el)
                }
                _for_each_with_class_in_parent(el, "options_carousel_text", (text_div => {
                    if (text_div.textContent == currentOption.textContent) {
                        text_div.classList.remove("scrolling_animation")
                    }
                }))
            }
        }
    }));
    forward_button.addEventListener("click", (function() {
        if (!forward_button.classList.contains("disabled") && !el.classList.contains("disabled")) {
            let currentOption = _get_first_with_class_in_parent(el, "selected");
            if (currentOption) {
                options_carousel_set_current(el, currentOption.nextSibling);
                if (cb) {
                    cb(currentOption.nextSibling, el)
                }
                _for_each_with_class_in_parent(el, "options_carousel_text", (text_div => {
                    if (text_div.textContent == currentOption.textContent) {
                        text_div.classList.remove("scrolling_animation")
                    }
                }))
            }
        }
    }));
    back_button.addEventListener("mouseenter", (function() {
        if (!el.classList.contains("disabled")) back_button.classList.add("hovered")
    }));
    back_button.addEventListener("mouseleave", (function() {
        back_button.classList.remove("hovered")
    }));
    forward_button.addEventListener("mouseenter", (function() {
        if (!el.classList.contains("disabled")) forward_button.classList.add("hovered")
    }));
    forward_button.addEventListener("mouseleave", (function() {
        forward_button.classList.remove("hovered")
    }));
    if (initial_option) {
        options_carousel_set_current(el, initial_option)
    }
}

function options_carousel_set_current(el, option) {
    if (!option) {
        return
    }
    _for_each_with_class_in_parent(el, "options_carousel_text", (text_div => {
        if (text_div.textContent == option.textContent) {
            text_div.style.visibility = "visible";
            if (text_div.classList.contains("overflowing") && !text_div.classList.contains("scrolling_animation")) {
                start_options_carousel_text_scrolling_anim(text_div, _get_first_with_class_in_parent(el, "options_carousel_text_cont"))
            }
        } else {
            text_div.style.visibility = "hidden"
        }
    }));
    el.dataset.value = option.dataset.value;
    _for_each_with_class_in_parent(el, "select-option", (function(el) {
        if (option.dataset.value == el.dataset.value) {
            el.classList.add("selected")
        } else {
            el.classList.remove("selected")
        }
    }));
    let back_button = _get_first_with_class_in_parent(el, "options_carousel_back");
    let forward_button = _get_first_with_class_in_parent(el, "options_carousel_forward");
    if (option.dataset.first) {
        back_button.classList.add("disabled")
    } else {
        back_button.classList.remove("disabled")
    }
    if (option.dataset.last) {
        forward_button.classList.add("disabled")
    } else {
        forward_button.classList.remove("disabled")
    }
}

function update_options_carousel(select) {
    let list = select.querySelector(".options_carousel_list");
    if (!list) return;
    for (var i = 0; i < list.children.length; i++) {
        if ("value" in list.children[i].dataset) {
            if (list.children[i].dataset.value.trim() == select.dataset.value.trim()) {
                _for_each_with_class_in_parent(select, "options_carousel_text", (subel => {
                    if (subel.textContent == list.children[i].textContent) {
                        subel.style.visibility = "visible";
                        if (subel.classList.contains("overflowing") && !subel.classList.contains("scrolling_animation")) {
                            start_options_carousel_text_scrolling_anim(subel, _get_first_with_class_in_parent(select, "options_carousel_text_cont"))
                        }
                    } else {
                        subel.style.visibility = "hidden"
                    }
                }));
                _for_each_with_class_in_parent(list, "select-option", (function(option) {
                    if (select.dataset.value == option.dataset.value) {
                        option.classList.add("selected");
                        let back_button = _get_first_with_class_in_parent(select, "options_carousel_back");
                        let forward_button = _get_first_with_class_in_parent(select, "options_carousel_forward");
                        if (option.dataset.first) {
                            back_button.classList.add("disabled");
                            back_button.classList.remove("hovered")
                        } else {
                            back_button.classList.remove("disabled")
                        }
                        if (option.dataset.last) {
                            forward_button.classList.add("disabled");
                            forward_button.classList.remove("hovered")
                        } else {
                            forward_button.classList.remove("disabled")
                        }
                    } else {
                        option.classList.remove("selected")
                    }
                }));
                break
            }
        }
    }
}

function options_carousel_set_text_position(el) {
    req_anim_frame((() => {
        let text_cont = _get_first_with_class_in_parent(el, "options_carousel_text_cont");
        _for_each_with_class_in_parent(text_cont, "options_carousel_text", (text => {
            if (text_cont.offsetWidth < text.offsetWidth) {
                text.classList.add("overflowing");
                if (text.style.visibility == "visible" && !text.classList.contains("scrolling_animation")) {
                    start_options_carousel_text_scrolling_anim(text, text_cont)
                }
            } else {
                text.classList.remove("overflowing")
            }
        }))
    }))
}

function start_options_carousel_text_scrolling_anim(el, text_cont) {
    let animOptions = {
        element: el,
        distance: el.offsetWidth - text_cont.offsetWidth,
        speed: .05,
        slide_delay: 1e3,
        fade_delay: 1e3,
        direction: "left",
        fadetime: 500
    };
    req_anim_frame((() => {
        scrolling_div_animation(animOptions)
    }))
}

function initialize_select_fields() {
    _for_each_in_class("select-field", (el => {
        ui_setup_select(el)
    }));
    console.log("Select fields initialization done.")
}

function ui_setup_select(el, cb) {
    if (cb) {
        setup_select(el, cb)
    } else {
        setup_select(el, (function(opt, field) {
            engine.call("set_string_variable", field.dataset.variable, opt.dataset.value)
        }))
    }
    if (el.dataset.variable) {
        engine.call("initialize_select_value", el.dataset.variable)
    }
}

function select_change_value(el, action) {
    if (el.classList.contains("options_carousel")) {
        if (action === "next") {
            let forward_button = el.querySelector(".options_carousel_forward");
            if (!forward_button.classList.contains("disabled") && !el.classList.contains("disabled")) {
                let currentOption = _get_first_with_class_in_parent(el, "selected");
                if (currentOption) {
                    options_carousel_set_current(el, currentOption.nextSibling);
                    if (el.callback && typeof el.callback === "function") {
                        el.callback(currentOption.nextSibling, el)
                    }
                    _for_each_with_class_in_parent(el, "options_carousel_text", (text_div => {
                        if (text_div.textContent == currentOption.textContent) {
                            text_div.classList.remove("scrolling_animation")
                        }
                    }))
                }
            }
        } else if (action === "prev") {
            let back_button = el.querySelector(".options_carousel_back");
            if (!back_button.classList.contains("disabled") && !el.classList.contains("disabled")) {
                let currentOption = _get_first_with_class_in_parent(el, "selected");
                if (currentOption) {
                    options_carousel_set_current(el, currentOption.previousSibling);
                    if (el.callback && typeof el.callback === "function") {
                        el.callback(currentOption.previousSibling, el)
                    }
                    _for_each_with_class_in_parent(el, "options_carousel_text", (text_div => {
                        if (text_div.textContent == currentOption.textContent) {
                            text_div.classList.remove("scrolling_animation")
                        }
                    }))
                }
            }
        }
    } else if (el.classList.contains("dropdown")) {
        let currentOption = _get_first_with_class_in_parent(el, "selected");
        if (currentOption) {
            if (action === "next") {
                let nextOption = currentOption.nextSibling;
                if (nextOption) {
                    el.dataset.value = nextOption.dataset.value;
                    update_select(el);
                    if (el.callback && typeof el.callback === "function") {
                        el.callback(nextOption, el)
                    }
                }
            } else if (action === "prev") {
                let prevOption = currentOption.previousSibling;
                if (prevOption) {
                    el.dataset.value = prevOption.dataset.value;
                    update_select(el);
                    if (el.callback && typeof el.callback === "function") {
                        el.callback(prevOption, el)
                    }
                }
            }
        }
    }
}

function create_game_mode_select(parent_node, change_cb, on_init) {
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
    if (on_init) on_init(modes);
    _empty(parent_node);
    for (let mode of modes) {
        if (!mode.enabled) continue;
        let opt = _createElement("div", "i18n");
        opt.dataset.i18n = mode.i18n;
        opt.dataset.value = mode.mode;
        opt.textContent = localize(mode.i18n);
        parent_node.appendChild(opt)
    }
    ui_setup_select(parent_node, change_cb)
}