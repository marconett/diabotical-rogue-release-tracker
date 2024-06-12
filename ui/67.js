window.fade_time = 70;
let global_logged_out = false;

function set_logged_out_screen(visible, reason, code, msg) {
    if (reason) {
        if (reason == "disabled") {
            let reason = null;
            let until = null;
            let until_seconds = null;
            if (code && code.length) {
                let data = code.split(":");
                if (data[0].length) reason = data[0];
                if (data[1].length) {
                    until = new Date(parseInt(data[1]) * 1e3);
                    until_seconds = (until.getTime() - Date.now()) / 1e3;
                    if (until_seconds < 0) until_seconds = 0
                }
            }
            let info = _createElement("div");
            info.appendChild(_createElement("div", "ban_msg", localize("message_disabled")));
            if (reason && reason.toLowerCase() !== "other") {
                let reason_str = localize("message_ban_reason_" + reason);
                if (reason_str.trim().length) {
                    info.appendChild(_createElement("div", "ban_reason", localize_ext("message_ban_reason", {
                        reason: reason_str
                    })))
                }
            }
            if (until) {
                let ts_str = _to_readable_timestamp(until, false);
                if (until_seconds) ts_str += " (" + _time_until(until_seconds) + ")";
                info.appendChild(_createElement("div", "ban_until", localize_ext("message_ban_until", {
                    ts: ts_str
                })))
            }
            _empty(_id("logout_reason"));
            _id("logout_reason").appendChild(info)
        }
        if (reason == "anticheat") {
            let cont = _id("logout_reason");
            _empty(cont);
            cont.appendChild(_createElement("div", "null", localize_ext("message_anticheat", {
                code: code
            })));
            if (msg && msg.length) {
                let div = _createElement("div", null);
                div.innerHTML = msg;
                div.style.marginTop = "1vh";
                cont.appendChild(div)
            } else {
                console.error("Missing an anticheat logout reason.")
            }
        }
    }
    if (visible) {
        _id("main_menu").style.visibility = "hidden";
        _id("main_logged_out").style.display = "flex";
        if (reason && reason == "disabled" || reason == "anticheat") engine.call("lock_console");
        global_logged_out = true;
        engine.call("show_menu_screen", "")
    }
}
let global_fullscreen_spinner_state = false;

function setFullscreenSpinner(enable) {
    let spinner = _id("fullscreen_spinner");
    if (global_fullscreen_spinner_state == false) {
        if (enable) {
            spinner.querySelector(".spinner-icon").classList.add("running");
            anim_show(spinner);
            global_fullscreen_spinner_state = true
        }
    } else {
        if (!enable) {
            anim_hide(spinner, 200, (() => {
                spinner.querySelector(".spinner-icon").classList.add("running")
            }));
            global_fullscreen_spinner_state = false
        }
    }
}