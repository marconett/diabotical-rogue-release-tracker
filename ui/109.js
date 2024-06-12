new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "create",
    screen_element: _id("create_screen"),
    button_element: null,
    fullscreen: false,
    init: () => {
        content_creation_page.init()
    },
    open_handler: params => {
        set_blur(true);
        historyPushState({
            page: "create"
        });
        refreshScrollbar(_id("create_scroll_cont"));
        if (global_ms_connected && global_ms_connected_count <= 1) content_creation_page.update_maps_list(true);
        content_creation_page.on_open()
    }
});
const content_creation_page = {
    state: {
        new_map: {
            selected_modes: null,
            selected_map: null
        },
        update_map: {
            selected_modes: null,
            selected_map: null
        },
        selected_map: null,
        available_maps: []
    },
    map_users: [],
    $el: _id("create_screen"),
    html: {
        root: null,
        scroll_cont: null,
        screen_actions: null
    },
    init: function() {
        let _120vh = window.outerHeight / 100 * 120;
        let _90vw = window.outerWidth / 100 * 90;
        let smallerval = _120vh < _90vw ? _120vh : _90vw;
        let map_preview_height = (smallerval - window.outerHeight / 100 * 6) / 3 * (9 / 16);
        _id("create_screen_list").style.setProperty("--customlist_height", "" + map_preview_height + "px");
        this.html.root = _id("create_screen");
        this.html.scroll_cont = _id("create_scroll_cont");
        this.html.screen_actions = this.html.root.querySelector(".screen_actions");
        GAME.add_activate_callback((game_id => {
            this._create_mode_checkboxes(_id("map_create_modes"));
            this._create_mode_checkboxes(_id("map_update_modes"))
        }));
        global_input_debouncers["map_add_user_search_filter"] = new InputDebouncer((() => {
            this._render_friends_list(_id("map_add_user_search_filter").value)
        }));
        engine.on("saved_map", (() => {
            this.update_maps_list()
        }))
    },
    on_open() {
        Navigation.render_actions([global_action_buttons.back], this.html.screen_actions)
    },
    open_map_folder: function() {
        engine.call("open_map_folder")
    },
    _on_map_select: function($el) {
        _for_each_in_class("create_map_preview", ($el => $el.classList.remove("selected")));
        $el.classList.add("selected");
        _for_each_in_class("map_preview_background", ($el => $el.classList.remove("selected")));
        _for_each_with_class_in_parent($el, "map_preview_background", ($el => $el.classList.add("selected")));
        this.state.selected_map = this.state.available_maps.find((m => m.id === $el.dataset.map_id));
        if (this.state.selected_map.local_edit_at === null || this.state.selected_map.can_publish === false) _id("create_screen_button_publish").style.display = "none";
        else _id("create_screen_button_publish").style.display = "flex";
        if (this.state.selected_map.can_update === false) _id("create_screen_button_update").style.display = "none";
        else _id("create_screen_button_update").style.display = "flex";
        if (this.state.selected_map.can_delete === false) _id("create_screen_button_delete").style.display = "none";
        else _id("create_screen_button_delete").style.display = "flex";
        if (this.state.selected_map.can_update_users === false) _id("create_screen_button_users").style.display = "none";
        else _id("create_screen_button_users").style.display = "flex";
        if (this.state.selected_map.user_id === global_self.user_id) _id("create_screen_button_remove").style.display = "none";
        else _id("create_screen_button_remove").style.display = "flex";
        if (_id("create_screen_selection_options").style.display !== "flex") _id("create_screen_selection_options").style.display = "flex"
    },
    _unselect_map: function() {
        this.map_users.length = 0;
        this.state.selected_map = null;
        Array.from(this.$el.querySelectorAll(".create_map_preview")).forEach((p => p.classList.remove("selected")));
        _id("create_screen_selection_options").style.display = "none"
    },
    _create_mode_checkboxes: function($el) {
        _empty($el);
        let enabled_modes = [];
        const mode_map = GAME.get_data("game_mode_map");
        if (mode_map) {
            enabled_modes = Object.keys(mode_map).filter((m => mode_map[m].enabled))
        }
        enabled_modes.forEach((mode => {
            const $mode = _createElement("div", ["grid-col-6", "margin-bottom-xl"]);
            const $leftCol = _createElement("div", ["grid-col-5", "grid-offset-2", "i18n"], localize(mode_map[mode].i18n));
            $leftCol.dataset.i18n = mode_map[mode].i18n;
            const $checkbox = _createElement("div", ["checkbox", "checkbox_component"]);
            $checkbox.appendChild(_createElement("div"));
            $checkbox.dataset.value = mode;
            $checkbox.addEventListener("click", (event => {
                const $target = event.target;
                if ($target.classList.contains("checkbox_enabled")) {
                    $target.classList.remove("checkbox_enabled");
                    $target.firstChild.classList.remove("inner_checkbox_enabled")
                } else {
                    $target.classList.add("checkbox_enabled");
                    $target.firstChild.classList.add("inner_checkbox_enabled")
                }
            }));
            const $rightCol = _createElement("div", ["grid-col-5", "grid-end"]);
            $rightCol.appendChild($checkbox);
            $mode.appendChild($leftCol);
            $mode.appendChild($rightCol);
            $el.appendChild($mode)
        }))
    },
    _reset_mode_chekboxes: function($el) {
        const $checkboxes = Array.from($el.querySelectorAll(".checkbox_enabled"));
        $checkboxes.forEach(($checkbox => {
            $checkbox.classList.remove("checkbox_enabled");
            $checkbox.firstChild.classList.remove("inner_checkbox_enabled")
        }))
    },
    _check_input_validations: function(id, modes, name, $errorNode) {
        const MAX_NAME_LENGTH = 20;
        _empty($errorNode);
        if (!modes || modes.length === 0) {
            $errorNode.textContent = localize("map_error_no_mode");
            return false
        }
        if (id.match(/^[a-z0-9_]+$/) == null) {
            $errorNode.textContent = localize("map_error_id_invalid");
            return false
        } else {
            let normalized_id = id.trim().toLowerCase();
            for (let mode in global_game_mode_map_lists) {
                for (let map of global_game_mode_map_lists[mode]) {
                    if (normalized_id === map.map) {
                        $errorNode.textContent = localize("map_error_id_taken");
                        return false
                    }
                }
            }
        }
        if (name.length === 0) {
            $errorNode.textContent = localize("map_error_name_empty");
            return false
        }
        if (name.length > MAX_NAME_LENGTH) {
            $errorNode.textContent = localize("map_error_name_too_large");
            return false
        }
        return true
    },
    confirm_create_map: function() {
        const id = _id("map_create_id").value;
        const name = _id("map_create_name").value;
        const modes = Array.from(document.querySelectorAll("#map_create_modes .checkbox_enabled")).map((f => f.dataset.value));
        if (!this._check_input_validations(id, modes, name, _id("map_create_modal_error"))) {
            return
        }
        RemoteResources.create_remote_map(id, name, modes, (ret => {
            if (ret && ret.success) {
                this.update_maps_list();
                queue_dialog_msg({
                    title: localize("toast_create_map_title"),
                    msg: localize("toast_create_map_success")
                })
            } else {
                _id("map_create_modal_error").textContent = localize("map_error_id_taken");
                if (ret && ret.reason) queue_dialog_msg({
                    title: localize("toast_map_error_title"),
                    msg: localize(ret.reason)
                });
                else queue_dialog_msg({
                    title: localize("toast_map_error_title"),
                    msg: localize("toast_map_error_body")
                })
            }
            close_modal_screen_by_selector("map_create_modal_screen")
        }))
    },
    confirm_update_map: function() {
        const new_name = _id("map_update_name").value;
        const new_modes = Array.from(document.querySelectorAll("#map_update_modes .checkbox_enabled")).map((f => f.dataset.value));
        if (!this._check_input_validations(this.state.selected_map.id, new_modes, new_name, _id("map_update_modal_error"))) {
            return
        }
        close_modal_screen_by_selector("map_update_modal_screen");
        setFullscreenSpinner(true);
        RemoteResources.update_remote_map(this.state.selected_map.id, new_name, new_modes, (() => {
            setFullscreenSpinner(false);
            this.update_maps_list()
        }))
    },
    confirm_delete_map: function() {
        close_modal_screen_by_selector("map_delete_modal_screen");
        setFullscreenSpinner(true);
        RemoteResources.delete_remote_map(this.state.selected_map.id, (() => {
            setFullscreenSpinner(false);
            this.update_maps_list()
        }))
    },
    open_publish_modal: function() {
        if (this.state.selected_map.local_revision !== null && this.state.selected_map.revision !== null && this.state.selected_map.local_revision < this.state.selected_map.revision) {
            _id("map_publish_confirm_warning").style.display = "flex"
        } else {
            _id("map_publish_confirm_warning").style.display = "none"
        }
        open_modal_screen("map_publish_modal_screen")
    },
    confirm_publish_map: function() {
        close_modal_screen_by_selector("map_publish_modal_screen");
        setFullscreenSpinner(true);
        RemoteResources.upload_remote_map(this.state.selected_map.id, (() => {
            setFullscreenSpinner(false);
            queue_dialog_msg({
                title: localize("toast_publish_map_title"),
                msg: localize("toast_publish_map_success")
            });
            this.update_maps_list()
        }), (key => {
            setFullscreenSpinner(false);
            queue_dialog_msg({
                title: localize("toast_publish_map_title"),
                msg: localize_ext("toast_publish_map_error", {
                    name: key
                })
            })
        }))
    },
    update_maps_list: function(disable_spinner) {
        if (!disable_spinner) setFullscreenSpinner(true);
        engine.call("list_local_maps").then((data => {
            const local_maps = JSON.parse(data);
            if (!disable_spinner) setFullscreenSpinner(false);
            RemoteResources.list_player_remote_maps_paginated(0, (data => {
                if (!data) return;
                let selected_map = null;
                if (this.state.selected_map) selected_map = this.state.selected_map;
                this._unselect_map();
                this.state.available_maps = data.map((map => {
                    const local_map = local_maps.find((m => m.filename === map.map_id + ".rbe"));
                    return {
                        id: map.map_id,
                        name: map.name,
                        random_name: map.random_name,
                        modes: map.modes,
                        image: "mg_test.png",
                        author: map.author,
                        user_id: map.user_id,
                        rate: map.rate,
                        votes: map.votes,
                        can_update: map.can_update,
                        can_publish: map.can_publish,
                        can_delete: map.can_delete,
                        can_update_users: map.can_update_users,
                        revision: "revision" in map && map.revision !== null ? map.revision : null,
                        local_revision: local_map && "revision" in local_map ? local_map.revision : null,
                        published: map.published,
                        created_at: new Date(map.create_ts),
                        updated_at: new Date(map.update_ts),
                        local_edit_at: local_map && "updated_at" in local_map ? new Date(local_map.updated_at * 1e3) : null
                    }
                }));
                this._render_maps_list(selected_map)
            }))
        }))
    },
    _render_maps_list: function(selected_map) {
        const maps = this.state.available_maps;
        const mode_map = GAME.get_data("game_mode_map");
        let list = _id("create_screen_list");
        _empty(list);
        let fragment = new DocumentFragment;
        for (let map of maps) {
            let map_el = _createElement("div", "create_map_preview");
            map_el.dataset.map_name = map.name;
            map_el.dataset.map_id = map.id;
            let background_image = _createElement("div", ["map_preview_background"]);
            background_image.style.backgroundImage = `url("appdata://Maps/${map.id}-t.png")`;
            map_el.appendChild(background_image);
            const MAX_MODE_LINES = 4;
            const $modes = _createElement("div", ["gamemodes"]);
            if (map.modes) {
                for (let [idx, mode] of map.modes) {
                    if (idx > MAX_MODE_LINES) break
                }
                map.modes.some(((mode, idx) => {
                    if (idx + 1 > MAX_MODE_LINES) return false;
                    let $mode = _createElement("div", ["gamemode", "i18n"]);
                    if (mode_map && mode in mode_map) {
                        $mode.dataset.i18n = mode_map[mode].i18n;
                        $mode.textContent = mode_map[mode].name
                    }
                    $modes.appendChild($mode)
                }));
                if (map.modes.length > MAX_MODE_LINES) {
                    if (map.modes[MAX_MODE_LINES] in mode_map) {
                        const last_mode = mode_map[map.modes[MAX_MODE_LINES]].i18n;
                        $modes.appendChild(_createElement("div", "", `${localize(last_mode).slice(0,3)}...`))
                    }
                }
                map_el.appendChild($modes)
            } else {
                console.warn("Ignoring map modes because you are using an old API version")
            }
            let bottom = _createElement("div", "bottom");
            let mode_icon = _createElement("div", "mode_icon");
            let mode_icon_inner = _createElement("div", "icon");
            mode_icon_inner.style.backgroundImage = "url(/html/images/rogue_menu/custom_icon_mode.png)";
            mode_icon.appendChild(mode_icon_inner);
            bottom.appendChild(mode_icon);
            let details = _createElement("div", "details");
            if (map.user_id === global_self.user_id || !map.random_name) {
                let name = _createElement("div", "name");
                name.textContent = map.name;
                details.appendChild(name)
            }
            if (map.random_name) {
                let temp_name = _createElement("div", "temp_name");
                temp_name.appendChild(_createElement("div", null, "Temporarily named"));
                temp_name.appendChild(_createElement("i", null, map.random_name.replace("_", " ").toUpperCase()));
                details.appendChild(temp_name)
            }
            let author = _createElement("div", "author");
            author.textContent = map.author;
            details.appendChild(author);
            bottom.appendChild(details);
            let edit_info = _createElement("div", "edit_info");
            if (map.updated_at.getTime() !== map.created_at.getTime()) {
                let last_publish_title = _createElement("div", "text_info");
                last_publish_title.textContent = localize("map_last_publish");
                edit_info.appendChild(last_publish_title);
                let last_publish_time = _createElement("div");
                last_publish_time.textContent = moment(map.updated_at).fromNow();
                edit_info.appendChild(last_publish_time)
            }
            if (map.local_edit_at) {
                let last_edit_title = _createElement("div", "text_info");
                last_edit_title.textContent = localize("map_last_edit");
                edit_info.appendChild(last_edit_title);
                let last_edit_text = _createElement("div");
                last_edit_text.textContent = moment(map.local_edit_at).fromNow();
                edit_info.appendChild(last_edit_text)
            }
            if (map.rate) {
                let rating = _createElement("div", "map_rating_creation");
                for (let s = 0; s < map.rate; s++) {
                    rating.appendChild(_createElement("div", "star"))
                }
                edit_info.appendChild(rating)
            }
            bottom.appendChild(edit_info);
            map_el.appendChild(bottom);
            let publish_msg_key = "";
            if (map.local_revision === null && map.revision === null) {
                if (map.local_edit_at === null) {
                    publish_msg_key = "map_never_edited"
                } else {
                    publish_msg_key = "map_pending_publication"
                }
            } else if (map.local_revision === null && map.revision !== null) {
                if (map.local_edit_at !== null && map.local_edit_at > map.updated_at) {
                    publish_msg_key = "map_changes_pending_publication"
                }
            } else if (map.local_revision !== null && map.revision !== null) {
                if (map.local_revision === map.revision && map.local_edit_at > map.updated_at) {
                    publish_msg_key = "map_changes_pending_publication"
                } else if (map.local_revision < map.revision) {
                    publish_msg_key = "map_outdated"
                }
            }
            if (publish_msg_key.length) {
                let pending_publish_warn = _createElement("div", "pending_publish");
                pending_publish_warn.textContent = localize(publish_msg_key);
                if (publish_msg_key === "map_outdated") pending_publish_warn.classList.add("outdated");
                map_el.appendChild(pending_publish_warn)
            }
            fragment.appendChild(map_el);
            map_el.addEventListener("click", (() => {
                if (this.state.selected_map && this.state.selected_map.id === map.id) {
                    this._unselect_map()
                } else {
                    this._on_map_select(map_el)
                }
            }));
            if (selected_map && selected_map.id === map.id) {
                this._on_map_select(map_el)
            }
        }
        list.appendChild(fragment);
        if (maps.length) {
            this.html.scroll_cont.classList.remove("empty")
        } else {
            this.html.scroll_cont.classList.add("empty")
        }
        refreshScrollbar(this.html.scroll_cont)
    },
    _render_user_list(users) {
        _empty(_id("map_update_user_rights"));
        if (!users) return;
        let self = {};
        let all = [];
        for (let user of users) {
            if (user.user_id === global_self.user_id) self = user;
            else all.push(user)
        }
        all.unshift(self);
        this.map_users.length = 0;
        let fragment = new DocumentFragment;
        for (let user of all) {
            let row = _createElement("div", "grid-row");
            row.dataset.user_id = user.user_id;
            row.appendChild(_createElement("div", ["grid-col-2-1", "grid-middle", "name"], user.name));
            let cb_col_publish = _createElement("div", ["grid-col-2-1", "grid-center", "grid-middle"]);
            let cb_col_update = _createElement("div", ["grid-col-2-1", "grid-center", "grid-middle"]);
            let cb_col_delete = _createElement("div", ["grid-col-2-1", "grid-center", "grid-middle"]);
            let cb_publish = _createCheckbox();
            let cb_update = _createCheckbox();
            let cb_delete = _createCheckbox();
            cb_publish.dataset.type = "publish";
            cb_update.dataset.type = "update";
            cb_delete.dataset.type = "delete";
            if (user.can_publish) _checkCheckbox(cb_publish);
            if (user.can_update) _checkCheckbox(cb_update);
            if (user.can_delete) _checkCheckbox(cb_delete);
            cb_col_publish.appendChild(cb_publish);
            cb_col_update.appendChild(cb_update);
            cb_col_delete.appendChild(cb_delete);
            row.appendChild(cb_col_publish);
            row.appendChild(cb_col_update);
            row.appendChild(cb_col_delete);
            _checkboxSetup(cb_publish);
            _checkboxSetup(cb_update);
            _checkboxSetup(cb_delete);
            let col_remove = _createElement("div", ["grid-col-2-1", "grid-end"]);
            let removeButton = _createElement("div", ["dialog_button", "negative"], localize("map_user_remove"));
            col_remove.appendChild(removeButton);
            row.appendChild(col_remove);
            removeButton.addEventListener("click", (() => {
                RemoteResources.del_map_user(this.state.selected_map.id, user.user_id, (() => {
                    RemoteResources.list_map_users(this.state.selected_map.id, (res => {
                        this._render_user_list(res)
                    }))
                }))
            }));
            this.map_users.push({
                user_id: user.user_id,
                cb_publish: cb_publish,
                cb_update: cb_update,
                cb_delete: cb_delete
            });
            fragment.appendChild(row)
        }
        _id("map_update_user_rights").appendChild(fragment)
    },
    _render_friends_list(search) {
        _empty(_id("map_add_user_scroll_list"));
        let users_already_added = [];
        for (let user of this.map_users) {
            users_already_added.push(user.user_id)
        }
        let filter = false;
        if (search && search.length) {
            filter = true;
            search = search.toLowerCase()
        }
        let friends = [];
        for (let user_id in Friends.state.all) {
            if (users_already_added.includes(user_id)) continue;
            if (filter && !Friends.state.all[user_id].name.toLowerCase().includes(search)) continue;
            friends.push(Friends.state.all[user_id])
        }
        friends.sort(((a, b) => {
            let compA = a.name.toLowerCase();
            let compB = b.name.toLowerCase();
            return compA < compB ? -1 : compA > compB ? 1 : 0
        }));
        let fragment = new DocumentFragment;
        for (let friend of friends) {
            let row = _createElement("div", "friend_row");
            row.appendChild(_createElement("div", "name", friend.name));
            let add_button = _createElement("div", "dialog_button", localize("map_user_add_action"));
            add_button.dataset.user_id = friend.user_id;
            row.appendChild(add_button);
            add_button.addEventListener("click", (() => {
                Friends.exec_mapped_user_id(friend.user_id, (mapped_user_id => {
                    RemoteResources.add_map_user(this.state.selected_map.id, mapped_user_id, (success => {
                        if (!success) {
                            queue_dialog_msg({
                                title: localize("title_info"),
                                msg: localize("map_user_add_limit")
                            })
                        }
                        close_modal_screen_by_selector("map_add_user_modal_screen");
                        this.show_users()
                    }))
                }))
            }));
            fragment.appendChild(row)
        }
        _id("map_add_user_scroll_list").appendChild(fragment);
        refreshScrollbar(_id("map_add_user_scroll"));
        resetScrollbar(_id("map_add_user_scroll"))
    },
    show_new: function() {
        this._reset_mode_chekboxes(_id("map_create_modal_screen"));
        open_modal_screen("map_create_modal_screen", (function() {
            _empty(_id("map_create_modal_error"))
        }))
    },
    show_edit: function() {
        setFullscreenSpinner(true);
        RemoteResources.load_remote_map(this.state.selected_map.id, (success => {
            setFullscreenSpinner(false);
            engine.call("edit_community_map", this.state.selected_map.id)
        }), (() => {
            setFullscreenSpinner(false);
            queue_dialog_msg({
                title: localize("toast_publish_map_title"),
                msg: localize_ext("toast_publish_map_error", {
                    name: key
                })
            })
        }))
    },
    show_update: function() {
        const $modal = _id("map_update_modal_screen");
        const $name = _id("map_update_name");
        $name.value = this.state.selected_map.name;
        this._reset_mode_chekboxes($modal);
        this.state.selected_map.modes.forEach((mode => {
            const $checkbox = $modal.querySelector(`.checkbox[data-value=${mode}]`);
            $checkbox.classList.add("checkbox_enabled");
            $checkbox.firstChild.classList.add("inner_checkbox_enabled")
        }));
        open_modal_screen("map_update_modal_screen", (function() {
            _empty(_id("map_update_modal_error"))
        }))
    },
    show_users: function() {
        RemoteResources.list_map_users(this.state.selected_map.id, (res => {
            this._render_user_list(res);
            open_modal_screen("map_users_modal_screen")
        }))
    },
    show_add_user: function() {
        this._render_friends_list();
        close_modal_screen_by_selector("map_users_modal_screen");
        open_modal_screen("map_add_user_modal_screen")
    },
    cancel_add_user: function() {
        close_modal_screen_by_selector("map_add_user_modal_screen");
        open_modal_screen("map_users_modal_screen")
    },
    confirm_update_users: function() {
        let params = {
            users: []
        };
        for (let user of this.map_users) {
            params.users.push({
                user_id: user.user_id,
                can_publish: user.cb_publish.dataset.enabled === "true",
                can_update: user.cb_update.dataset.enabled === "true",
                can_delete: user.cb_delete.dataset.enabled === "true"
            })
        }
        RemoteResources.update_map_users(this.state.selected_map.id, params, (() => {
            close_modal_screen_by_selector("map_users_modal_screen");
            this.update_maps_list()
        }))
    },
    open_remove_self: function() {
        open_modal_screen("map_remove_user_modal")
    },
    confirm_remove_self: function() {
        RemoteResources.del_map_user(this.state.selected_map.id, global_self.user_id, (() => {
            close_modal_screen_by_selector("map_remove_user_modal");
            this.update_maps_list()
        }))
    }
};