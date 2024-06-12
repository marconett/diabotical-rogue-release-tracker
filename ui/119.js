new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "friends_blocked_panel",
    screen_element: _id("friends_blocked_panel"),
    sound_open: "ui_panel_right_in",
    init: () => {
        friends_blocked_panel.init()
    },
    open_handler: () => {
        historyPushState({
            page: "friends_blocked_panel"
        });
        set_blur(false);
        friends_blocked_panel.on_open()
    },
    post_open_handler: () => {},
    close_handler: () => {
        friends_blocked_panel.on_close();
        Navigation.reset_active()
    },
    post_close_handler: () => {}
});
const friends_blocked_panel = new function() {
    let html = {
        root: null,
        list: null,
        page_menu: null,
        page_menu_text: null,
        action_menu: null,
        screen_actions: null,
        active_element_list: []
    };
    let blocked_list = [];
    let current_page = 1;
    const MAX_ITEMS_PER_PAGE = 10;
    let list_fragment = new DocumentFragment;
    let action_menu_open = false;
    this.init = () => {
        html.root = _id("friends_blocked_panel");
        html.list = _id("friends_blocked_content");
        html.page_menu = html.root.querySelector(".page_menu");
        html.page_menu_text = html.page_menu.querySelector(".text");
        html.action_menu = html.root.querySelector(".action_menu");
        html.screen_actions = html.root.querySelector(".screen_actions");
        let prev = html.page_menu.querySelector(".prev");
        let next = html.page_menu.querySelector(".next");
        Navigation.listen("friends_blocked_panel", "lt", prev_page);
        Navigation.listen("friends_blocked_panel", "rt", next_page);
        prev.addEventListener("click", prev_page);
        next.addEventListener("click", next_page);
        prev.addEventListener("mouseenter", (() => {
            engine.call("ui_sound", "ui_hover2")
        }));
        next.addEventListener("mouseenter", (() => {
            engine.call("ui_sound", "ui_hover2")
        }));

        function prev_page() {
            close_action_menu();
            current_page--;
            if (current_page < 1) current_page = 1;
            render_list()
        }

        function next_page() {
            close_action_menu();
            current_page++;
            render_list()
        }
        html.root.addEventListener("click", (e => {
            e.stopPropagation()
        }));
        on_press_esc_handlers.push((() => {
            if (action_menu_open) {
                close_action_menu();
                return false
            }
        }));
        global_on_ms_disconnected.push((() => {
            if (GAME.active !== GAME.ids.ROGUE) return;
            if (global_menu_page === "friends_panel") {
                historyBack()
            }
        }));
        Friends.add_update_blocked_listener((() => {
            blocked_list.length = 0;
            for (let user_id in Friends.state.master_blocked) {
                blocked_list.push({
                    user_id: user_id,
                    name: Friends.state.master_blocked[user_id]
                })
            }
            blocked_list.sort(((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1
                }
                return 0
            }));
            if (global_menu_page === "friends_blocked_panel") {
                render_list()
            }
        }))
    };
    this.on_open = () => {
        current_page = 1;
        _id("main_menu").addEventListener("click", outside_click);
        render_list()
    };
    this.on_close = () => {
        close_action_menu();
        _id("main_menu").removeEventListener("click", outside_click)
    };

    function outside_click() {
        close_action_menu()
    }

    function render_list() {
        html.active_element_list.length = 0;
        let start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE;
        while (start_index >= blocked_list.length && current_page > 1) {
            current_page--;
            start_index = (current_page - 1) * MAX_ITEMS_PER_PAGE
        }
        for (let i = start_index; i < start_index + MAX_ITEMS_PER_PAGE; i++) {
            if (i >= blocked_list.length) break;
            let friend_element = create_blocked_el(blocked_list[i]);
            list_fragment.appendChild(friend_element);
            html.active_element_list.push(friend_element);
            console.log("add blocked friend")
        }
        let max_page = Math.ceil(blocked_list.length / MAX_ITEMS_PER_PAGE);
        _empty(html.list);
        html.list.appendChild(list_fragment);
        console.log("render blocked list", blocked_list, current_page, start_index);
        render_page_menu(current_page, max_page);
        Navigation.generate_nav({
            name: "friends_blocked_panel",
            nav_root: _id("friends_blocked_content"),
            nav_class: "friend",
            mouse_click: "instant-action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: friend_action
        });
        Navigation.set_active({
            lb_rb: null,
            up_down: "friends_blocked_panel",
            left_right: null
        });
        Navigation.render_actions([global_action_buttons.back], html.screen_actions)
    }

    function create_blocked_el(f) {
        let friend = _createElement("div", "friend");
        friend.dataset.user_id = f.user_id;
        let icon_cont = _createElement("div", "icon_cont");
        set_store_avatar(false, icon_cont, "", "" + CLIENT_SOURCE_NAME.GDS);
        friend.appendChild(icon_cont);
        let desc = _createElement("div", "desc");
        desc.appendChild(_createElement("div", "name", f.name));
        friend.appendChild(desc);
        return friend
    }

    function render_page_menu(page, max_page) {
        html.page_menu_text.textContent = localize_ext("page_x_of_n", {
            x: page,
            n: max_page
        });
        if (max_page <= 1) {
            html.page_menu.classList.add("hidden")
        } else {
            html.page_menu.classList.remove("hidden")
        }
    }

    function friend_action(el) {
        if (el.classList.contains("open")) {
            close_action_menu()
        } else {
            close_action_menu();
            create_action_menu(el)
        }
    }

    function close_action_menu() {
        console.log("close action menu");
        if (action_menu_open) {
            action_menu_open = false;
            _empty(html.action_menu);
            html.action_menu.classList.remove("active");
            for (let el of html.active_element_list) {
                if (el.classList.contains("open")) {
                    el.classList.remove("open")
                }
            }
            Navigation.set_active({
                up_down: "friends_blocked_panel"
            });
            Navigation.unlock_nav("friends_blocked_panel")
        }
    }

    function create_action_menu(el) {
        console.log("create action menu");
        el.classList.add("open");
        action_menu_open = true;
        _empty(html.action_menu);
        let rect = el.getBoundingClientRect();
        html.action_menu.style.top = rect.top + "px";
        let options = [];
        let user_id = el.dataset.user_id;
        user_id = Friends.get_mapped_user_id(user_id);
        console.log("create_action_menu", user_id);
        console.log(user_id, user_id in Friends.state.master_blocked);
        if (user_id in Friends.state.master_blocked) {
            let option_ub = _createElement("div", "option");
            option_ub.appendChild(_createElement("div", ["accent", "positive"]));
            option_ub.appendChild(_createElement("div", "label", localize("friends_list_action_unblock")));
            option_ub.dataset.name = "unblock-friend";
            option_ub.dataset.user_id = user_id;
            html.action_menu.appendChild(option_ub);
            options.push(option_ub)
        }
        if (!options.length) {
            return
        }
        html.action_menu.classList.add("active");
        html.action_menu.style.visibility = "hidden";
        req_anim_frame((() => {
            let rect = html.action_menu.getBoundingClientRect();
            html.action_menu.style.visibility = "visible"
        }));
        Navigation.generate_nav({
            name: "friends_blocked_panel_action_menu",
            nav_root: html.action_menu,
            nav_class: "option",
            mouse_click: "action",
            hover_sound: "ui_hover2",
            action_sound: "ui_click1",
            action_cb_type: "input",
            action_cb: action_menu_cb
        });
        Navigation.set_active({
            up_down: "friends_blocked_panel_action_menu"
        });
        Navigation.lock_nav("friends_blocked_panel", "hover")
    }

    function action_menu_cb(el) {
        if (el.dataset.name === "unblock-friend") {
            send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, el.dataset.user_id + ":ub");
            Friends.master_remove_blocked(el.dataset.user_id);
            close_action_menu()
        }
    }
};