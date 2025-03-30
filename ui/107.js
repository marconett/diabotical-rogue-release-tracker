global_components["notification"] = new MenuComponent("notification", _id("notification_screen"), (function() {
    notification_page.init()
}));
const notification_page = new function() {
    let html = {
        root: null
    };
    let notifications_visible = false;
    let current_notif = null;
    let delayed_anim = null;
    this.init = () => {
        html.root = _id("notification_screen");
        global_notifs.addNotificationHandler((() => {
            load_notifications()
        }));
        on_close_ingame_screen_handlers.push((screen_id => {
            if (screen_id === html.root.id) {
                set_modal_engine_call(false, false, true);
                notifications_visible = false
            }
        }));
        on_in_game_handlers.push((() => {
            load_notifications()
        }));
        on_press_esc_handlers.push((() => {
            if (!notifications_visible) return;
            confirm_done();
            return false
        }));
        GAME.add_deactivate_callback((() => {
            notifications_visible = false
        }))
    };

    function confirm_done() {
        if (delayed_anim !== null) clearTimeout(delayed_anim);
        engine.call("on_show_customization_screen", false);
        send_string(CLIENT_COMMAND_DEL_NOTIFICATION, current_notif.notif_id);
        global_notifs.confirmNotification(current_notif);
        if (global_notifs.getNotificationCount() > 0) {
            load_notifications(true)
        } else {
            set_modal_engine_call(false, false, true);
            notifications_visible = false;
            close_ingame_screen(false)
        }
    }

    function load_notifications(loading_next_notif) {
        if (!IN_HUB) {
            notifications_visible = false;
            close_ingame_screen(true, html.root.id);
            return
        }
        if (!loading_next_notif && notifications_visible) return;
        let notif = global_notifs.getNotification();
        if (!notif) return;
        current_notif = notif;
        notifications_visible = true;
        set_modal_engine_call(true, true, true);
        if (global_ingame_menu !== html.root.id) {
            open_ingame_screen(html.root.id, false, true)
        }
        let content = _createElement("div", "notif_content");
        let title = "";
        if (notif.notif_type in NOTIFICATION_TYPE) {
            title = localize("notification_title_" + NOTIFICATION_TYPE[notif.notif_type])
        }
        let title_div = _createElement("div", "notif_title", title);
        content.appendChild(title_div);
        if (notif.notif_type in NOTIFICATION_TYPE) {
            if (NOTIFICATION_TYPE[notif.notif_type] === "twitch_drop") {
                let message = _createElement("div", "notif_message", localize("notification_msg_twitch_drop"));
                content.appendChild(message)
            }
        }
        let item_preview = _createElement("div", "item_preview");
        content.appendChild(item_preview);
        let notif_video = null;
        let item_desc = _createElement("div", "item_desc");
        content.appendChild(item_desc);
        const all_bp_data = GAME.get_data("battlepass_data");
        if (notif.notif_type in NOTIFICATION_TYPE) {
            if (notif.items) render_item(notif.items.shift())
        }
        let buttons = _createElement("div", "buttons");
        let btn_confirm = _createElement("div", ["btn-style-2", "plain"], localize("menu_button_confirm"));
        buttons.appendChild(btn_confirm);
        _addButtonSounds(btn_confirm, 1);
        let btn_confirm_all = undefined;
        if (notif.items && notif.items.length > 0) {
            btn_confirm_all = _createElement("div", ["btn-style-2", "plain"], localize("menu_button_confirm_all"));
            buttons.appendChild(btn_confirm_all);
            _addButtonSounds(btn_confirm_all, 1);
            btn_confirm.addEventListener("click", confirm_next);
            btn_confirm_all.addEventListener("click", confirm_done)
        } else {
            btn_confirm.addEventListener("click", confirm_done)
        }
        content.appendChild(buttons);
        let count = _createElement("div", "count");
        if (notif.items && notif.items.length > 0) {
            let item_count = _createElement("div", "item_count");
            item_count.appendChild(_createElement("div", "remaining", localize("items_remaining")));
            item_count.appendChild(count);
            count.textContent = notif.items.length;
            content.appendChild(item_count)
        }
        delayed_anim = null;

        function render_item(item) {
            if (!item) return;
            _pause_music_preview();
            _empty(item_preview);
            let ctype = new CustomizationType(global_customization_type_map[item.customization_type].name, item.customization_sub_type);
            show_customization_preview_scene("notification", ctype, item.customization_id, item, item_preview);
            _empty(item_desc);
            item_desc.style.setProperty("--rarity", "var(--rarity_" + item.rarity + ")");
            item_desc.classList.add("item");
            item_desc.appendChild(createCustomizationInfo(item))
        }

        function confirm_next() {
            if (delayed_anim !== null) clearTimeout(delayed_anim);
            engine.call("on_show_customization_screen", false);
            if (notif.items && notif.items.length) {
                render_item(notif.items.shift());
                if (notif.items.length > 0) {
                    count.textContent = notif.items.length
                } else {
                    count.parentElement.style.opacity = 0;
                    if (btn_confirm_all) btn_confirm_all.style.display = "none"
                }
            } else {
                confirm_done()
            }
        }
        _empty(html.root);
        html.root.appendChild(content)
    }
};