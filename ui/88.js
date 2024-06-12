function initialize_tooltip_hovers() {
    _for_each_in_class("tooltip", (function(el) {
        el.addEventListener("mouseenter", (function() {
            _for_each_with_class_in_parent(el, "tip_inner", (function(tip) {
                tip.classList.add("active")
            }))
        }));
        el.addEventListener("mouseleave", (function() {
            _for_each_with_class_in_parent(el, "tip_inner", (function(tip) {
                tip.classList.remove("active")
            }))
        }))
    }))
}

function initialize_element_tooltip_hover(el) {
    if (!el.classList.contains("tooltip")) return;
    el.addEventListener("mouseenter", (function() {
        _for_each_with_class_in_parent(el, "tip_inner", (function(tip) {
            tip.classList.add("active")
        }))
    }));
    el.addEventListener("mouseleave", (function() {
        _for_each_with_class_in_parent(el, "tip_inner", (function(tip) {
            tip.classList.remove("active")
        }))
    }))
}

function initialize_tooltip_type2() {
    _for_each_in_class("tooltip2", (function(el) {
        add_tooltip2_listeners(el)
    }))
}
var global_tooltip2_active = false;
var global_tooltip2_last_update = undefined;

function add_tooltip2_listeners(el) {
    let tt2 = _id("tooltip2");
    let menu = _id("main_menu");
    let menu_rect = menu.getBoundingClientRect();
    let posY = "bottom";
    let posX = "right";
    let timeout = undefined;
    let last_pos_x = undefined;
    let last_pos_y = undefined;
    el.addEventListener("mouseenter", (function(e) {
        e.stopPropagation();
        last_pos_x = e.clientX;
        last_pos_y = e.clientY;
        menu_rect = menu.getBoundingClientRect();
        timeout = setTimeout((function() {
            if ("msgId" in el.dataset) {
                _html(tt2, localize(el.dataset.msgId))
            } else if ("msg" in el.dataset) {
                _html(tt2, el.dataset.msg)
            } else if ("msgHtmlId" in el.dataset) {
                _empty(tt2);
                tt2.appendChild(generate_tt_content(el))
            }
            tt2.style.opacity = 0;
            tt2.style.display = "flex";
            setTimeout((function() {
                tt2_rect = tt2.getBoundingClientRect();
                tt2.style.display = "none";
                if (last_pos_y + tt2_rect.height > menu_rect.height) {
                    posY = "top";
                    tt2.style.bottom = menu_rect.height - last_pos_y + 10 + "px";
                    tt2.style.top = "auto"
                } else {
                    tt2.style.bottom = "auto";
                    tt2.style.top = last_pos_y + 20 + "px"
                }
                if (last_pos_x + tt2_rect.width > menu_rect.width) {
                    posX = "left";
                    tt2.style.left = "auto";
                    tt2.style.right = menu_rect.width - last_pos_x + 10 + "px"
                } else {
                    tt2.style.left = last_pos_x + 25 + "px";
                    tt2.style.right = "auto"
                }
                anim_show(tt2);
                global_tooltip2_last_update = Date.now();
                global_tooltip2_active = true
            }))
        }), 300)
    }));
    el.addEventListener("mouseleave", (function(e) {
        if (timeout != undefined) {
            clearTimeout(timeout)
        }
        tt2.style.display = "none";
        global_tooltip2_last_update = undefined;
        global_tooltip2_active = false
    }));
    el.addEventListener("mousemove", (function(e) {
        global_tooltip2_last_update = Date.now();
        last_pos_x = e.clientX;
        last_pos_y = e.clientY;
        if (!global_tooltip2_active) return;
        if (posY == "top") {
            tt2.style.bottom = menu_rect.height - e.clientY + 10 + "px";
            tt2.style.top = "auto"
        } else {
            tt2.style.bottom = "auto";
            tt2.style.top = e.clientY + 20 + "px"
        }
        if (posX == "left") {
            tt2.style.left = "auto";
            tt2.style.right = menu_rect.width - e.clientX + 10 + "px"
        } else {
            tt2.style.left = e.clientX + 25 + "px";
            tt2.style.right = "auto"
        }
    }))
}

function initialize_tooltip2_cleanup_listener() {
    document.addEventListener("mousemove", (function() {
        if (!global_tooltip2_active) return;
        if (global_tooltip2_last_update) {
            if (Date.now() - global_tooltip2_last_update > 1) {
                global_tooltip2_active = false;
                global_tooltip2_last_update = undefined;
                cleanup_floating_containers()
            }
        }
    }))
}

function cleanup_floating_containers() {
    _id("tooltip2").style.display = "none"
}

function generate_tt_content(el) {
    let msg_id = el.dataset.msgHtmlId;
    if (msg_id == "daily_challenges") {
        return generate_tooltip_daily_challenges()
    }
    if (msg_id == "queue_info") {
        return generate_tooltip_queue_info()
    }
    if (msg_id == "customization_item") {
        let sub_type = "subType" in el.dataset ? el.dataset.subType : null;
        return generate_customization_item_info(el.dataset.id, el.dataset.type, sub_type, el.dataset.rarity)
    }
    return _createElement("div", "")
}

function generate_tooltip_daily_challenges() {
    let list = _createElement("div", "challenge_list");
    render_daily_challenges(list, global_user_battlepass.challenges);
    return list
}

function generate_tooltip_queue_info() {
    let list = _createElement("div", "queue_mode_list");
    let mode_names = [];
    for (let cb of global_queue_mode_checkboxes) {
        if (cb.parentElement == null) continue;
        if (!global_queues.hasOwnProperty(cb.dataset.mode_key)) continue;
        if (cb.dataset.enabled == "true") mode_names.push(global_queues[cb.dataset.mode_key].queue_name + " - " + global_queues[cb.dataset.mode_key].vs)
    }
    for (let mode of mode_names) {
        let row = _createElement("div", "row", mode);
        list.appendChild(row)
    }
    return list
}

function generate_customization_item_info(id, type, sub_type, rarity) {
    let customization_info = createCustomizationInfo({
        customization_id: id,
        customization_type: type,
        customization_sub_type: sub_type,
        rarity: rarity
    }, true);
    customization_info.style.maxWidth = "30vh";
    return customization_info
}