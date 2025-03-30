new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "settings_panel",
    screen_element: _id("settings_panel"),
    sound_open: "ui_panel_right_in",
    init: () => {
        settings_panel.init()
    },
    open_handler: () => {
        historyPushState({
            page: "settings_panel"
        });
        set_blur(false);
        settings_panel.on_open()
    },
    post_open_handler: () => {},
    close_handler: () => {
        settings_panel.on_close();
        Navigation.reset_active()
    },
    post_close_handler: () => {}
});
const settings_panel = new function() {
    let html = {
        root: null,
        breadcrumbs: null,
        explanation: null,
        scroll: null,
        screen_actions: null,
        active_bind_element: null,
        twitch_name: null,
        twitch_link: null,
        twitch_unlink: null
    };
    this.init = () => {
        html.root = _id("settings_panel");
        html.breadcrumbs = _id("settings_breadcrumbs");
        html.explanation = _id("settings_panel_explanation");
        html.scroll = _id("settings_panel_scroll");
        html.screen_actions = html.root.querySelector(".screen_actions");
        html.twitch_name = html.root.querySelector(".twitch_name");
        html.twitch_link = html.root.querySelector(".settings_connections_twitch_link");
        html.twitch_unlink = html.root.querySelector(".settings_connections_twitch_unlink");
        on_load_user_info_handlers.push((user => {
            let twitch_profile = null;
            if (user.hasOwnProperty("social_profiles")) {
                twitch_profile = user.social_profiles.find((c => c.type === "twitch"))
            }
            if (twitch_profile) {
                html.twitch_name.textContent = twitch_profile.display_name;
                html.twitch_link.style.display = "none";
                html.twitch_unlink.style.display = "flex"
            } else {
                html.twitch_name.textContent = "";
                html.twitch_link.style.display = "flex";
                html.twitch_unlink.style.display = "none"
            }
        }));
        GAME.add_activate_callback((game_id => {
            _for_each_with_class_in_parent(html.root, "range-slider", (function(el) {
                let variable = el.dataset.variable ? el.dataset.variable : null;
                if (variable != null) {
                    global_range_slider_map[variable] = new rangeSlider(el, true)
                }
            }));
            _for_each_with_class_in_parent(html.root, "range-slider", (function(el) {
                var variable = el.dataset.variable;
                if (variable) {
                    engine.call("initialize_range_value", variable)
                }
            }));
            _for_each_with_class_in_parent(html.root, "color-picker-new", (function(el) {
                var current_variable = el.dataset.variable;
                if (current_variable && current_variable.length) {
                    engine.call("initialize_color_value", current_variable)
                }
            }))
        }));
        _for_each_with_class_in_parent(html.root, "toggle", (function(toggle) {
            let current_value = false;
            if ("value" in toggle.dataset) current_value = toggle.dataset.value === "1" ? true : false;
            setup_toggle(toggle, current_value, ((toggle, bool) => {
                update_variable("bool", toggle.dataset.variable, bool);
                updateSettingsExplanation(toggle.closest(".setting_row"), html.explanation)
            }));
            if (toggle.dataset.variable) {
                initialize_variable("checkbox", toggle.dataset.variable)
            }
        }));
        let controls_root_element = _id("settings_panel_tab_content_controls");
        bind_event("set_binding_list", (function(mode, command, code, game_id) {
            if (typeof game_id === "undefined") return;
            game_id = parseInt(game_id);
            if (game_id !== GAME.ids.INVASION && game_id !== GAME.ids.ROGUE && game_id !== GAME.ids.GEARSTORM) return;
            set_binding_list(game_id, controls_root_element, mode, command, code)
        }));
        bind_event("set_display_mode_options", (function(json_string) {
            let modes = [];
            try {
                modes = JSON.parse(json_string)
            } catch (e) {
                console.log("ERROR parsing display mode json list", e.message);
                return
            }
            let select = html.root.querySelector(".video_mode_select");
            if (select) {
                for (let mode of modes) {
                    let option = _createElement("div", "", localize("display_mode_" + mode.name));
                    option.dataset.value = mode.id;
                    select.appendChild(option)
                }
                ui_setup_select(select, (function(opt, field) {
                    engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
                    updateSettingsExplanation(select.closest(".setting_row"), html.explanation)
                }))
            }
        }));
        let auto_detect_video_mode_option_added = false;
        let setup_video_resolution_timeout = null;
        bind_event("add_video_mode", (function(video_mode, video_mode_caption, selected) {
            let element = html.root.querySelector(".video_resolution_select");
            if (element) {
                if (!auto_detect_video_mode_option_added) {
                    auto_detect_video_mode_option_added = true;
                    element.appendChild(auto_detect_video_mode_option())
                }
                let option = _createElement("div", "", video_mode_caption);
                option.dataset.value = video_mode;
                if (selected) option.dataset.selected = 1;
                element.appendChild(option);
                if (setup_video_resolution_timeout !== null) clearTimeout(setup_video_resolution_timeout);
                setup_video_resolution_timeout = setTimeout((() => {
                    ui_setup_select(element, (function(opt, field) {
                        engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
                        updateSettingsExplanation(element.closest(".setting_row"), html.explanation)
                    }));
                    setup_video_resolution_timeout = null
                }))
            }
        }));
        bind_event("set_screen_aspect_ratio", (function(numerator, denominator) {
            let element = html.root.querySelector(".aspect_ratio_info");
            if (element) {
                let fragment = new DocumentFragment;
                fragment.appendChild(_createElement("span", "info"));
                fragment.appendChild(_createElement("span", "text", localize_ext("settings_video_screen_aspect_ratio", {
                    ratio: numerator + ":" + denominator
                })));
                _empty(element);
                element.appendChild(fragment)
            }
        }));
        on_video_mode_change.push(((display_mode, using_video_resolution) => {
            _for_each_with_class_in_parent(html.root, "setting_video_resolution", (el => {
                if (using_video_resolution) {
                    el.style.display = "flex";
                    el.classList.remove("disabled")
                } else {
                    el.style.display = "none";
                    el.classList.add("disabled")
                }
            }));
            refreshScrollbar(_id(tab_map.current_scroll))
        }));
        bind_event("set_audio_device_options", (function(json_string) {
            let devices = [];
            try {
                devices = JSON.parse(json_string)
            } catch (e) {
                console.log("ERROR parsing audio device json list", e.message)
            }
            let select = html.root.querySelector(".sound_device_select");
            if (select) {
                let option = _createElement("div", "", localize("default"));
                option.dataset.value = "";
                select.appendChild(option);
                for (let device of devices) {
                    let option = _createElement("div", "", device.name);
                    option.dataset.value = device.id;
                    select.appendChild(option)
                }
                ui_setup_select(select, (function(opt, field) {
                    engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
                    updateSettingsExplanation(select.closest(".setting_row"), html.explanation)
                }))
            }
        }));
        _for_each_with_class_in_parent(html.root, "select-field", (function(select_field) {
            ui_setup_select(select_field, (function(opt, field) {
                engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
                updateSettingsExplanation(select_field.closest(".setting_row"), html.explanation)
            }))
        }));
        bind_event("set_team_colors", (json => {
            let colors = null;
            try {
                colors = JSON.parse(json)
            } catch (e) {
                console.error("Error parsing team colors json", e)
            }
            set_team_colors(colors)
        }));
        let color_lists = html.root.querySelectorAll(".color_list");
        let own_colors = null;
        let enemy_colors = null;
        for (let color_list of color_lists) {
            let variable = color_list.dataset.variable;
            if (!variable) continue;
            if (variable === "game_team1_color_override") own_colors = color_list;
            if (variable === "game_team2_color_override") enemy_colors = color_list
        }
        global_variable.addPermanentResponseHandler("color", "game_team1_color_override", (value => {
            if (!own_colors) return;
            let colors = own_colors.querySelectorAll(".color");
            for (let color of colors) {
                if (color.dataset.color === value) {
                    color.classList.add("selected")
                } else {
                    color.classList.remove("selected")
                }
            }
        }));
        global_variable.addPermanentResponseHandler("color", "game_team2_color_override", (value => {
            if (!enemy_colors) return;
            let colors = enemy_colors.querySelectorAll(".color");
            for (let color of colors) {
                if (color.dataset.color === value) {
                    color.classList.add("selected")
                } else {
                    color.classList.remove("selected")
                }
            }
        }));
        engine.call("initialize_color_value", "game_team1_color_override");
        engine.call("initialize_color_value", "game_team2_color_override");
        Navigation.generate_nav({
            name: "settings_panel_tabs",
            nav_root: _id("settings_panel").querySelector(".tabs"),
            nav_class: "tab",
            mouse_hover: "none",
            mouse_click: "action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            selection_required: true,
            action_cb_type: "immediate",
            action_cb: (element, action) => {
                settings_panel.open_tab(element)
            }
        });
        Navigation.generate_nav({
            name: "settings_panel_main",
            nav_root: _id("settings_panel_tab_content_main"),
            nav_class: "setting_row",
            nav_scroll: html.scroll,
            hover_sound: "ui_hover2",
            action_cb_type: "input",
            action_cb: setting_action,
            select_cb: select_action,
            deselect_cb: deselect_action
        });
        Navigation.generate_nav({
            name: "settings_panel_controls",
            nav_root: _id("settings_panel_tab_content_controls"),
            nav_class: "controls_row",
            nav_scroll: html.scroll,
            mouse_click: "action",
            hover_sound: "ui_hover2",
            action_cb_type: "input",
            action_cb: setting_action,
            select_cb: select_action,
            deselect_cb: deselect_action
        });
        Navigation.generate_nav({
            name: "settings_panel_video",
            nav_root: _id("settings_panel_tab_content_video"),
            nav_class: "setting_row",
            nav_scroll: html.scroll,
            hover_sound: "ui_hover2",
            action_cb_type: "input",
            action_cb: setting_action,
            select_cb: select_action,
            deselect_cb: deselect_action
        });
        Navigation.generate_nav({
            name: "settings_panel_audio",
            nav_root: _id("settings_panel_tab_content_audio"),
            nav_class: "setting_row",
            nav_scroll: html.scroll,
            hover_sound: "ui_hover2",
            action_cb_type: "input",
            action_cb: setting_action,
            select_cb: select_action,
            deselect_cb: deselect_action
        });
        let max_fps_toggle = html.root.querySelector(".video_max_fps_toggle");
        let lobby_max_fps_toggle = html.root.querySelector(".video_lobby_max_fps_toggle");
        ui_setup_select(max_fps_toggle, ((opt, field) => {
            if (Number(opt.dataset.value)) {
                update_variable("real", "video_max_fps", 250)
            } else {
                update_variable("real", "video_max_fps", 0)
            }
        }));
        ui_setup_select(lobby_max_fps_toggle, ((opt, field) => {
            if (Number(opt.dataset.value)) {
                update_variable("real", "video_lobby_max_fps", 250)
            } else {
                update_variable("real", "video_lobby_max_fps", 0)
            }
        }));
        global_variable.addPermanentResponseHandler("range", "video_max_fps", (value => {
            max_fps_toggle.dataset.value = value === 0 ? 0 : 1;
            update_select(max_fps_toggle);
            if (value) {
                html.root.querySelector(".setting_row.video_max_fps").classList.remove("disabled")
            } else {
                html.root.querySelector(".setting_row.video_max_fps").classList.add("disabled")
            }
        }));
        global_variable.addPermanentResponseHandler("range", "video_lobby_max_fps", (value => {
            lobby_max_fps_toggle.dataset.value = value === 0 ? 0 : 1;
            update_select(lobby_max_fps_toggle);
            if (value) {
                html.root.querySelector(".setting_row.video_lobby_max_fps").classList.remove("disabled")
            } else {
                html.root.querySelector(".setting_row.video_lobby_max_fps").classList.add("disabled")
            }
        }));
        engine.call("initialize_range_value", "video_max_fps");
        engine.call("initialize_range_value", "video_lobby_max_fps");
        on_capture_bind_finished.push((() => {
            Navigation.unlock_nav("settings_panel_controls");
            if (html.active_bind_element) {
                html.active_bind_element.classList.remove("active")
            }
        }))
    };
    const reset_action = {
        text: "Reset all",
        kbm_bind: "",
        controller_bind: "X",
        callback: () => {
            settings_reset("controls")
        }
    };
    let tab_map = {
        current_tab: "settings_panel_tab_main",
        current_scroll: "settings_panel_scroll",
        cb: function(el, tab, previous_el, previous_tab, optional_params) {
            html.breadcrumbs.textContent = localize("settings") + " / " + localize(this[tab.id].breadcrumb);
            _for_each_with_class_in_parent(_id("settings_panel"), "sliding", (function(el) {
                options_carousel_set_text_position(el)
            }))
        },
        settings_panel_tab_main: {
            content: "settings_panel_tab_content_main",
            scroll: "settings_panel_scroll",
            nav: "settings_panel_main",
            breadcrumb: "settings_general",
            cb: () => {
                Navigation.render_actions([global_action_buttons.back], html.screen_actions);
                Navigation.set_active({
                    up_down: "settings_panel_main"
                })
            }
        },
        settings_panel_tab_controls: {
            content: "settings_panel_tab_content_controls",
            scroll: "settings_panel_scroll",
            nav: "settings_panel_controls",
            breadcrumb: "settings_tab_controls",
            cb: () => {
                Navigation.render_actions([reset_action, global_action_buttons.back], html.screen_actions);
                Navigation.set_active({
                    up_down: "settings_panel_controls"
                })
            }
        },
        settings_panel_tab_video: {
            content: "settings_panel_tab_content_video",
            scroll: "settings_panel_scroll",
            nav: "settings_panel_video",
            breadcrumb: "settings_tab_video",
            cb: () => {
                Navigation.render_actions([global_action_buttons.back], html.screen_actions);
                Navigation.set_active({
                    up_down: "settings_panel_video"
                })
            }
        },
        settings_panel_tab_audio: {
            content: "settings_panel_tab_content_audio",
            scroll: "settings_panel_scroll",
            nav: "settings_panel_audio",
            breadcrumb: "settings_tab_audio",
            cb: () => {
                Navigation.render_actions([global_action_buttons.back], html.screen_actions);
                Navigation.set_active({
                    up_down: "settings_panel_audio"
                })
            }
        }
    };
    this.on_open = () => {
        Navigation.set_active({
            lb_rb: "settings_panel_tabs",
            up_down: tab_map[tab_map.current_tab].nav,
            left_right: null
        });
        Navigation.reset("lb_rb");
        refreshScrollbar(_id(tab_map.current_scroll));
        _for_each_with_class_in_parent(_id("settings_panel"), "sliding", (function(el) {
            options_carousel_set_text_position(el)
        }))
    };
    this.on_close = () => {
        _for_each_with_class_in_parent(_id("settings_panel"), "scrolling_animation", (function(el) {
            el.classList.remove("scrolling_animation")
        }));
        html.explanation.style.display = "none"
    };
    this.open_tab = pressed_tab => {
        set_tab(tab_map, pressed_tab)
    };

    function select_action(element) {
        if (updateSettingsExplanation(element, html.explanation)) {
            html.explanation.style.display = "flex"
        } else {
            html.explanation.style.display = "none"
        }
        let action_buttons = [global_action_buttons.back];
        if (tab_map.current_tab === "settings_panel_tab_controls") {
            action_buttons.unshift(reset_action)
        }
        if (element.classList.contains("controls_row")) {
            action_buttons.unshift({
                text: "Delete",
                controller_bind: "Y",
                kbm_bind: "DEL",
                callback: () => {
                    setting_action(element, "delete")
                }
            })
        }
        Navigation.render_actions(action_buttons, html.screen_actions)
    }

    function deselect_action(element) {
        html.explanation.style.display = "none";
        let action_buttons = [global_action_buttons.back];
        if (tab_map.current_tab === "settings_panel_tab_controls") {
            action_buttons.unshift(reset_action)
        }
        Navigation.render_actions(action_buttons, html.screen_actions)
    }

    function setting_action(element, action) {
        if (element.classList.contains("controls_row")) {
            let value_element = element.querySelector(".controls_value");
            if (!value_element) return;
            let bind_element = value_element.firstElementChild;
            let command = value_element.dataset["dbBinding"];
            let mode = value_element.dataset["dbBindingMode"];
            if (action === "enter") {
                capture_bind(value_element, command, mode);
                if (bind_element) {
                    html.active_bind_element = bind_element;
                    html.active_bind_element.classList.add("active")
                }
                Navigation.lock_nav("settings_panel_controls")
            } else if (action === "delete") {
                delete_bindings(command, mode)
            }
        } else if (element.classList.contains("setting_row")) {
            let ctrl = element.querySelector(".ctrl");
            if (ctrl && ctrl.firstElementChild) {
                let setting = ctrl.firstElementChild;
                if (setting.classList.contains("range-slider")) {
                    if (setting.dataset.variable in global_range_slider_map) {
                        if (action === "next") {
                            global_range_slider_map[setting.dataset.variable].increase()
                        } else if (action === "prev") {
                            global_range_slider_map[setting.dataset.variable].decrease()
                        } else if (action === "enter") {
                            global_range_slider_map[setting.dataset.variable].show_input()
                        }
                    }
                } else if (setting.classList.contains("checkbox_component")) {
                    toggle_checkbox(setting)
                } else if (setting.classList.contains("setting_select")) {
                    if (setting.firstElementChild && setting.firstElementChild.classList.contains("select-field")) {
                        if (setting.firstElementChild.classList.contains("dropdown")) {
                            setting.firstElementChild.dispatchEvent(new Event("click"))
                        } else {
                            select_change_value(setting.firstElementChild, action);
                            updateSettingsExplanation(element, html.explanation)
                        }
                    }
                } else if (setting.classList.contains("setting-btn")) {
                    if (typeof setting.onclick === "function") {
                        setting.onclick.apply(setting)
                    } else if (typeof setting.callback === "function") {
                        setting.callback()
                    }
                } else if (setting.classList.contains("color_list")) {
                    let colors = setting.querySelectorAll(".color");
                    let selected = null;
                    for (let i = 0; i < colors.length; i++) {
                        if (colors[i].classList.contains("selected")) {
                            selected = i;
                            break
                        }
                    }
                    if (selected === null) {
                        colors[0].dispatchEvent(new Event("click"));
                        return
                    }
                    if (action === "next") {
                        if (selected === colors.length - 1) return;
                        colors[selected + 1].dispatchEvent(new Event("click"))
                    } else if (action === "prev") {
                        if (selected === 0) return;
                        colors[selected - 1].dispatchEvent(new Event("click"))
                    } else if (action === "enter") {
                        if (selected === colors.length - 1) return;
                        colors[selected + 1].dispatchEvent(new Event("click"))
                    }
                }
            }
        }
    }

    function set_team_colors(colors) {
        if (!Array.isArray(colors)) return;
        let color_lists = html.root.querySelectorAll(".color_list");
        for (let list of color_lists) {
            let variable = list.dataset.variable;
            let selected = "";
            if (variable in global_variable_value_store) selected = global_variable_value_store[variable];
            _empty(list);
            for (let c of colors) {
                let color = _createElement("div", "color");
                color.dataset.color = c;
                color.style.backgroundColor = c;
                if (c === selected) {
                    color.classList.add("selected")
                }
                color.addEventListener("click", (() => {
                    update_variable("string", variable, color.dataset.color)
                }));
                list.appendChild(color)
            }
        }
    }
};