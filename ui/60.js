function _id(id) {
    return document.getElementById(id)
}

function _get_first_with_class_in_parent(parent, childClass) {
    let elements = parent.getElementsByClassName(childClass);
    if (elements.length) return elements[0];
    return null
}

function _for_each_in_class(classname, callback) {
    var elements = document.getElementsByClassName(classname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i)
    }
}

function _for_each_with_class_in_parent(parent, classname, callback) {
    if (!parent) return;
    var elements = parent.getElementsByClassName(classname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i)
    }
}

function _for_first_with_class_in_parent(parent, classname, callback) {
    if (!parent) return;
    var elements = parent.getElementsByClassName(classname);
    if (elements.length > 0) {
        callback(elements[0])
    }
}

function _for_each_with_selector_in_parent(parent, selector, callback) {
    if (!parent) return;
    var elements = parent.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i)
    }
}

function _for_each_with_class_in_parents_arr(parents_arr, classname, callback) {
    if (!parents_arr) return;
    for (var p = 0; p < parents_arr.length; p++) {
        var elements = parents_arr[p].getElementsByClassName(classname);
        for (var i = 0; i < elements.length; i++) {
            callback(elements.item(i), i)
        }
    }
}

function _for_each_child_of_element(element, callback) {
    if (!element) return;
    if (!element.hasChildNodes()) return;
    for (var i = 0; i < elements.childNodes.length; i++) {
        callback(elements.childNodes[i], i)
    }
}

function _for_each_in_tag(tagname, callback) {
    var elements = document.getElementsByTagName(tagname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i)
    }
}

function _for_each_with_tag_in_parent(parent, tagname, callback) {
    if (!parent) return;
    var elements = parent.getElementsByTagName(tagname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i)
    }
}

function bind_event(event_name, callback) {
    const DEBUG_EVENTS = false;
    if (DEBUG_EVENTS) {
        engine.on(event_name, (function() {
            reset_timer();
            callback.apply(this, arguments);
            log_timer_if_not_zero(event_name + " duration")
        }))
    } else {
        engine.on(event_name, callback)
    }
}

function req_anim_frame(cb, wait_frames) {
    requestAnimationFrame((() => {
        req_anim_frame_internal(cb, wait_frames)
    }))
}

function req_anim_frame_internal(cb, wait_frames) {
    let _wait_frames = 1;
    if (typeof wait_frames === "number" && wait_frames >= 0) _wait_frames = wait_frames;
    if (_wait_frames > 1) {
        _wait_frames--;
        requestAnimationFrame((function() {
            req_anim_frame(cb, _wait_frames)
        }))
    } else {
        requestAnimationFrame((function() {
            cb()
        }))
    }
}

function play_anim(element_id, anim_class) {
    let el = _id(element_id);
    el.classList.remove(anim_class);
    void el.offsetWidth;
    el.classList.add(anim_class)
}

function _for_each_child(element, callback) {
    for (var child = element.firstChild; child !== null; child = child.nextSibling) {
        callback(child)
    }
}

function _check_nested(obj, level, ...rest) {
    if (obj === undefined) return false;
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true;
    return _check_nested(obj[level], ...rest)
}

function _walk(node, fn) {
    fn(node);
    node = node.firstChild;
    while (node) {
        _walk(node, fn);
        node = node.nextSibling
    }
}

function _clean_float(value, decimal) {
    if (!isFinite(decimal)) {
        decimal = 3
    }
    return Math.round(Math.pow(10, decimal) * parseFloat(value)) / Math.pow(10, decimal)
}

function _escape_html(str) {
    return str.replace(/[&<>"']/g, (function(c) {
        switch (c) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            default:
                return "&#039;"
        }
    }))
}
String.prototype.isEmpty = function() {
    return this.length === 0 || !this.trim()
};

function echo(str) {
    engine.call("echo", "" + str)
}

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num
}

function _clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num
}

function beep() {
    engine.call("ui_sound", "ui_mouseover2")
}

function _round(num, decimal_count) {
    let bleh = decimal_count * 10;
    return Math.round(num * bleh) / bleh
}

function _format_number(number, type, options) {
    if (type === "currency") {
        const amount = number * (options && options.areCents ? .01 : 1);
        const formatted = numeral(amount).format("0.00");
        switch (options.currency_code.toUpperCase()) {
            case "EUR":
                return `€${formatted}`;
            case "GBP":
                return `£${formatted}`;
            case "USD":
                return `$${formatted}`;
            default:
                return `${formatted} ${options.currency_code}`
        }
    } else if (type === "custom") {
        let tmp = numeral(number);
        if (options.format) {
            return tmp.format(options.format)
        }
        return tmp.format()
    } else {
        let tmp = numeral(number);
        return tmp.format()
    }
}

function _shorten_large_number(number) {
    if (number >= 0 && number < 9999 || number < 0 && number > -9999) return number;
    number = number / 1e3;
    return numeral(number).format("0.0") + "k"
}

function polarToCartesian(centerX, centerY, radius, angle) {
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
    }
}

function stackTrace() {
    var err = new Error;
    return err.stack
}

function _remove_node(node) {
    if (node === undefined || node === null) return;
    while (node.hasChildNodes()) {
        _remove_node(node.lastChild)
    }
    if (node.parentNode) node.parentNode.removeChild(node)
}

function _empty(node) {
    if (node === undefined || node === null) return;
    while (node.hasChildNodes()) {
        _remove_node(node.lastChild)
    }
}

function _html(node, html) {
    if (!node) return;
    _empty(node);
    node.innerHTML = html
}

function _insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

function _replaceNode(oldNode, newNode) {
    if (!oldNode.parentNode) return;
    oldNode.parentNode.replaceChild(newNode, oldNode)
}

function _dump(obj) {
    return JSON.stringify(obj, null, "\t")
}

function _isValidJSON(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

function _loadImage(cont, url) {
    var img = document.createElement("img");
    img.onload = function() {
        if (img.parentElement == cont) cont.removeChild(img)
    };
    img.src = url;
    cont.appendChild(img)
}

function _addButtonSounds(el, sound_idx) {
    if (sound_idx == 1) {
        el.addEventListener("mouseenter", _play_mouseover4);
        el.addEventListener("click", _play_click1)
    }
    if (sound_idx == 2) {
        el.addEventListener("mouseenter", _play_mouseover4);
        el.addEventListener("click", _play_click_back)
    }
    if (sound_idx == 3) {
        el.addEventListener("mouseenter", _play_hover1);
        el.addEventListener("click", _play_click1)
    }
    if (sound_idx == 4) {
        el.addEventListener("mouseenter", _play_hover2);
        el.addEventListener("click", _play_click1)
    }
}
let ui_sound_buffer = performance.now();

function _play_buffered_ui_sound(type) {
    if (performance.now() - ui_sound_buffer < 50) return;
    ui_sound_buffer = performance.now();
    engine.call("ui_sound", type)
}

function _play_mouseover1() {
    _play_buffered_ui_sound("ui_hover2")
}

function _play_mouseover2() {
    _play_buffered_ui_sound("ui_hover2")
}

function _play_mouseover3() {
    _play_buffered_ui_sound("ui_hover1")
}

function _play_mouseover4() {
    _play_buffered_ui_sound("ui_hover1")
}

function _play_hover1() {
    _play_buffered_ui_sound("ui_hover1")
}

function _play_hover2() {
    _play_buffered_ui_sound("ui_hover2")
}

function _play_whisper() {
    _play_buffered_ui_sound("ui_dm_notification")
}

function _play_party_inv() {
    engine.call("ui_sound", "ui_party_invite")
}

function _play_friend_online() {
    engine.call("ui_sound", "ui_friend_online")
}

function _play_click1() {
    engine.call("ui_sound", "ui_click1")
}

function _play_click_back() {
    engine.call("ui_sound", "ui_back1")
}

function _play_cb_check() {
    engine.call("ui_sound", "ui_check_box")
}

function _play_cb_uncheck() {
    engine.call("ui_sound", "ui_uncheck_box")
}

function _createElement(type, classes, textContent) {
    let el = document.createElement(type);
    if (typeof classes == "string") {
        el.classList.add(classes)
    }
    if (typeof classes == "object" && Array.isArray(classes)) {
        for (let css_class of classes) {
            el.classList.add(css_class)
        }
    }
    if (typeof textContent != "undefined") {
        if (typeof textContent == "string" && textContent.length) {
            el.textContent = textContent
        } else {
            typeof textContent == "number"
        } {
            el.textContent = "" + textContent
        }
    }
    return el
}

function _createCheckbox() {
    let checkbox = _createElement("div", ["checkbox", "checkbox_component"]);
    checkbox.appendChild(_createElement("div"));
    return checkbox
}

function _checkCheckbox(checkbox) {
    checkbox.classList.add("checkbox_enabled");
    if (checkbox.firstElementChild) checkbox.firstElementChild.classList.add("inner_checkbox_enabled");
    checkbox.dataset.enabled = true
}

function _uncheckCheckbox(checkbox) {
    checkbox.classList.remove("checkbox_enabled");
    if (checkbox.firstElementChild) checkbox.firstElementChild.classList.remove("inner_checkbox_enabled");
    checkbox.dataset.enabled = false
}

function _checkboxSetup(checkbox) {
    checkbox.addEventListener("click", (function() {
        if (checkbox.dataset.enabled === "true") {
            _uncheckCheckbox(checkbox);
            _play_cb_uncheck()
        } else {
            _checkCheckbox(checkbox);
            _play_cb_check()
        }
    }));
    checkbox.addEventListener("mouseenter", _play_mouseover4)
}

function _toggle_checkbox_from_parent(cb, dataIsNumber) {
    let variable = cb.dataset.variable;
    if (dataIsNumber) {
        if (cb.dataset.enabled == 1) {
            cb.dataset.enabled = 0;
            cb.classList.remove("checkbox_enabled");
            cb.firstElementChild.classList.remove("inner_checkbox_enabled");
            engine.call("ui_sound", "ui_uncheck_box")
        } else {
            cb.dataset.enabled = 1;
            cb.classList.add("checkbox_enabled");
            cb.firstElementChild.classList.add("inner_checkbox_enabled");
            engine.call("ui_sound", "ui_check_box")
        }
    } else {
        if (cb.dataset.enabled === "true") {
            _uncheckCheckbox(cb);
            engine.call("set_bool_variable", variable, false);
            engine.call("ui_sound", "ui_uncheck_box")
        } else {
            _checkCheckbox(cb);
            engine.call("set_bool_variable", variable, true);
            engine.call("ui_sound", "ui_check_box")
        }
    }
}

function _createButton(initialState, loadingState, classes) {
    let $button = _createElement("div", ["db-btn", ...classes], initialState);
    $button.setLoading = function() {
        this.classList.add("disabled2");
        this.textContent = loadingState;
        this.animationSteps = 0;
        this.animationTimer = setInterval((() => {
            this.animationSteps = this.animationSteps > 2 ? 0 : this.animationSteps + 1;
            this.textContent = loadingState + ".".repeat(this.animationSteps)
        }), 250)
    };
    $button.setInitial = function() {
        this.animationSteps = 0;
        clearInterval(this.animationTimer);
        this.classList.remove("disabled2");
        this.textContent = initialState
    };
    return $button
}

function html(strings, ...values) {
    let newStr = "";
    for (let i = 0; i < strings.length; i++) {
        if (i > 0) {
            newStr += values[i - 1]
        }
        newStr += strings[i]
    }
    return newStr
}

function _createSpinner() {
    let outer_cont = _createElement("div", "spinner");
    let cont = _createElement("div", "spinner-cont");
    outer_cont.appendChild(cont);
    let spinner = _createElement("div", ["spinner-icon", "running"]);
    cont.appendChild(spinner);
    return outer_cont
}

function _avatarUrl(avatar) {
    if (avatar) return global_customization_type_map[global_customization_type_id_map["avatar"]].img_path + avatar + ".png.dds";
    return "/html/customization/avatar/av_no_avatar.png.dds"
}

function _flagUrl(country) {
    if (country) return global_customization_type_map[global_customization_type_id_map["country"]].img_path + country + ".png.dds";
    return "/html/customization/flag/no_flag.png.dds"
}

function _mapUrl(map) {
    if (map) return "map-thumbnail://" + map;
    return ""
}

function _stickerUrl(sticker) {
    if (sticker) return "/resources/asset_thumbnails/textures_customization_" + sticker + ".png.dds";
    return ""
}

function _sprayUrl(spray) {
    if (spray) return "/resources/asset_thumbnails/textures_customization_" + spray + ".png.dds";
    return ""
}

function _musicImageUrl(id) {
    if (id) return "/html/customization/music/" + id + ".png.dds";
    return ""
}

function _format_color(color) {
    if (color.length > 0 && color.charAt(0) == "#") {
        return color
    } else {
        return "#" + color
    }
}

function _format_color_for_css(color) {
    var ret;
    if (color.length > 0 && color.charAt(0) == "#") {
        ret = color
    } else {
        ret = "#" + color
    }
    if (ret.length == 9) {
        ret = "#" + ret.substring(3) + ret.substring(1, 3)
    }
    return ret
}

function _format_color_for_url(color) {
    return encodeURIComponent(_format_color_for_css(color))
}

function _format_map_name(map_id, override) {
    if (override && override.length) return override;
    let map_name = GAME.get_data("map_names", map_id);
    if (map_name) return map_name;
    if (!map_id || map_id.trim().length == 0) return localize("unknown");
    let parts = map_id.split("_");
    if (parts.length === 1) return capitalize(map_id);
    parts.splice(0, 1);
    for (let i = 0; i < parts.length; i++) parts[i] = capitalize(parts[i]);
    return parts.join(" ")
}

function _format_game_mode(mode) {
    const mode_data = GAME.get_data("game_mode_map", mode);
    if (mode_data) return localize(mode_data.i18n);
    return localize("unknown")
}

function _format_timelimit(seconds) {
    if (seconds == 0) return localize("time_unlimited");
    return _seconds_to_digital(seconds)
}

function _format_scorelimit(score) {
    if (score == 0) return localize("score_unlimited");
    return score
}

function _format_team_switching(val) {
    if (val == 0) return localize("disabled");
    if (val == 1) return localize("teamswitching_enabled_nospec");
    if (val == 2) return localize("teamswitching_enabled");
    return ""
}

function _format_replay_recording(val) {
    if (val) return localize("enabled");
    else return localize("disabled")
}

function _format_physics(id) {
    const physics_data = GAME.get_data("physics_map", id);
    if (physics_data) return localize(physics_data.i18n);
    return localize("unknown")
}

function _format_instagib(int) {
    if (int == 0) return localize("disabled");
    if (int == 1) return localize("enabled");
    return ""
}

function _format_continuous(val) {
    if (val == 0) return localize("custom_settings_one_match");
    return localize("custom_settings_continuous_matches")
}

function _format_datacenter(loc) {
    if (loc in global_datacenter_map) return localize(global_datacenter_map[loc].i18n);
    return localize("unknown")
}

function _format_ping(ping) {
    if (ping == -1) return 999;
    if (ping > 1) return 999;
    return Math.floor(Number(ping) * 1e3)
}
const capitalize = s => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1)
};
const INPUT_DEBOUNCER_INPUT_DELAY_MS = 200;
const INPUT_DEBOUNCER_ACTION_DELAY_MS = 400;
class InputDebouncer {
    constructor(callback, custom_delay) {
        this.last_action_time = null;
        this.callback = callback;
        this.timeout = null;
        this.input_delay = INPUT_DEBOUNCER_INPUT_DELAY_MS;
        this.action_delay = INPUT_DEBOUNCER_ACTION_DELAY_MS;
        if (custom_delay) {
            this.input_delay = custom_delay;
            this.action_delay = custom_delay + 200
        }
    }
    execute(callback) {
        var this_time = performance.now();
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
        if (this.last_action_time !== null && this_time - this.last_action_time < this.action_delay) {
            this.timeout = setTimeout(this.callback, Math.max(this.action_delay - (this_time - this.last_action_time), this.input_delay))
        } else {
            this.timeout = setTimeout(this.callback, this.input_delay)
        }
        this.last_action_time = this_time
    }
}

function hslToRgbString(h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p
        };
        var q = l < .5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3)
    }
    return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")"
}

function _backgroundFontColor(hexcolor) {
    if (hexcolor.slice(0, 1) === "#") {
        hexcolor = hexcolor.slice(1)
    }
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split("").map((function(hex) {
            return hex + hex
        })).join("")
    }
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = (r * 299 + g * 587 + b * 114) / 1e3;
    return yiq >= 140 ? "#1c1c1c" : "#fff"
}

function hexToRGBA(hexcolor, alpha) {
    if (hexcolor.slice(0, 1) === "#") {
        hexcolor = hexcolor.slice(1)
    }
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split("").map((function(hex) {
            return hex + hex
        })).join("")
    }
    let r = parseInt(hexcolor.slice(0, 2), 16);
    let g = parseInt(hexcolor.slice(2, 4), 16);
    let b = parseInt(hexcolor.slice(4, 6), 16);
    if (alpha) {
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")"
    } else {
        return "rgb(" + r + "," + g + "," + b + ")"
    }
}
window.perf_timer = 0;

function benchmark(cb, times) {
    if (!times) times = 1e4;
    reset_timer();
    for (var i = 0; i < times; i++) {
        cb()
    }
    print_timer(times + " iterations")
}

function reset_timer() {
    window.perf_timer = performance.now()
}

function print_timer(label) {
    var perf = performance.now() - window.perf_timer;
    engine.call("echo", "JSPERF: " + (label ? label : "") + " " + perf + " ms")
}

function log_timer(label) {
    var perf = performance.now() - window.perf_timer;
    console.log("JSPERF: " + (label ? label : "") + " " + perf + " ms")
}

function log_timer_if_not_zero(label) {
    var perf = performance.now() - window.perf_timer;
    if (perf) console.log("JSPERF: " + (label ? label : "") + " " + perf + " ms")
}

function _preventInputFunction(e) {
    e.preventDefault();
    e.stopPropagation();
    return false
}

function _preventInputFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    return false
}

function _disableInput(input) {
    input.addEventListener("input", _preventInputFunction);
    input.addEventListener("keydown", _preventInputFunction);
    input.addEventListener("keyup", _preventInputFunction);
    input.addEventListener("keypress", _preventInputFunction);
    input.addEventListener("focus", _preventInputFocus);
    input.dataset.disabled = true;
    input.classList.add("input_disabled")
}

function _enableInput(input) {
    input.removeEventListener("input", _preventInputFunction);
    input.removeEventListener("keydown", _preventInputFunction);
    input.removeEventListener("keyup", _preventInputFunction);
    input.removeEventListener("keypress", _preventInputFunction);
    input.removeEventListener("focus", _preventInputFocus);
    input.dataset.disabled = false;
    input.classList.remove("input_disabled")
}

function _numberInput(input) {
    input.addEventListener("keypress", (function(e) {
        if (![8, 9, 13, 44, 45, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57].includes(e.keyCode)) {
            e.preventDefault();
            return false
        }
    }))
}

function _timeUntilMidnight() {
    let now = new Date;
    let then = new Date(now);
    then.setUTCHours(24, 0, 0, 0);
    let total_mins = (then - now) / 6e4;
    let hours = Math.floor(total_mins / 60);
    let minutes = Math.ceil(total_mins % 60);
    if (minutes === 60) {
        hours++;
        minutes = 0
    }
    if (minutes < 10) minutes = "0" + minutes;
    return hours + "h " + minutes + "m"
}

function _seconds_to_string(seconds) {
    let numyears = Math.floor(seconds / 31536e3);
    let numdays = Math.floor(seconds % 31536e3 / 86400);
    let numhours = Math.floor(seconds % 31536e3 % 86400 / 3600);
    let numminutes = Math.floor(seconds % 31536e3 % 86400 % 3600 / 60);
    if (seconds > 9e4) return (numyears > 0 ? numyears + "y " : "") + (numdays > 0 ? numdays + "d " : "") + (numhours > 0 ? numhours + "h" : "");
    return (numyears > 0 ? numyears + "y " : "") + (numdays > 0 ? numdays + "d " : "") + (numhours > 0 ? numhours + "h " : "") + (numminutes > 0 ? numminutes + "m" : "0m")
}

function _time_until(seconds) {
    if (seconds < 3600) return _seconds_to_minutes(seconds);
    if (seconds < 172800) return _seconds_to_hours(seconds);
    return _seconds_to_days(seconds)
}

function _seconds_to_minutes(seconds) {
    let numminutes = Math.floor(seconds / 60);
    if (numminutes < 0) numminutes = 0;
    return localize_ext("count_minute", {
        count: numminutes
    })
}

function _seconds_to_hours(seconds) {
    let numhours = Math.floor(seconds / 60 / 60);
    if (numhours < 0) numhours = 0;
    return localize_ext("count_hour", {
        count: numhours
    })
}

function _seconds_to_days(seconds) {
    let numdays = Math.floor(seconds / (3600 * 24));
    return localize_ext("count_day", {
        count: numdays
    })
}

function _seconds_to_digital(seconds) {
    let numhours = Math.floor(seconds / 3600);
    let numminutes = Math.floor(seconds % 31536e3 % 86400 % 3600 / 60);
    let numseconds = Math.floor(seconds % 31536e3 % 86400 % 3600 % 60);
    let strminutes = numminutes;
    let strseconds = numseconds;
    if (numminutes < 10) {
        strminutes = "0" + numminutes
    }
    if (numseconds < 10) {
        strseconds = "0" + numseconds
    }
    if (numhours > 0) return numhours + ":" + strminutes + ":" + strseconds;
    if (numminutes > 0) return strminutes + ":" + strseconds;
    return "00:" + strseconds
}

function _ms_to_race_timestamp(total_ms) {
    if (typeof total_ms !== "number" || total_ms === 0) return localize("stats_did_not_finish");

    function pad(n, z) {
        z = z || 2;
        return ("00" + n).slice(-z)
    }
    let ms = total_ms % 1e3;
    let s = (total_ms - ms) / 1e3;
    let secs = s % 60;
    let mins = (s - secs) / 60;
    if (mins > 0) return mins + ":" + pad(secs) + "." + pad(ms, 3);
    return secs + "." + pad(ms, 3)
}

function _to_readable_timestamp(string, show_sec) {
    if (string instanceof Date) {
        var date = string
    } else {
        var date = new Date(string)
    }
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;
    if (show_sec) {
        return date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec
    }
    return date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + min
}

function _current_hour_minute(ts) {
    if (typeof ts !== "undefined") {
        var date = new Date(ts)
    } else {
        var date = new Date
    }
    let hour = date.getHours();
    let min = date.getMinutes();
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    return hour + ":" + min
}

function _sort_objects_by_key(array, key, direction) {
    return array.sort((function(a, b) {
        var x = a[key];
        var y = b[key];
        if (direction && direction == "desc") return y < x ? -1 : y > x ? 1 : 0;
        return x < y ? -1 : x > y ? 1 : 0
    }))
}

function _bp_icon(battlepass_id, owned) {
    const bp_data = GAME.get_data("battlepass_data", battlepass_id);
    if (bp_data) {
        if (owned) return bp_data["bp-icon-paid"];
        else return bp_data["bp-icon"]
    }
    return ""
}

function _sort_customization_items(items) {
    let out = [];
    let temp = {};
    for (let id of customization_item_order) {
        for (let item of items) {
            if (item.customization_type == id) {
                if (!(item.customization_type in temp)) temp[item.customization_type] = [];
                temp[item.customization_type].push(item)
            }
        }
    }
    for (let id of customization_item_order) {
        if (id in temp && temp[id].length) {
            temp[id].sort((function(a, b) {
                return b.rarity - a.rarity
            }));
            out = out.concat(temp[id])
        }
    }
    return out
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomElementsFromArray(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len) return arr;
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len
    }
    return result
}

function getRankVideoUrl(rank, position) {
    let url = "";
    if (position && position > 0) {
        if (position == 1) url = "top_4" in global_ranks ? "/html/ranks/animated/" + global_ranks["top_4"].anim : "";
        else if (position <= 50) url = "top_3" in global_ranks ? "/html/ranks/animated/" + global_ranks["top_3"].anim : "";
        else if (position <= 100) url = "top_2" in global_ranks ? "/html/ranks/animated/" + global_ranks["top_2"].anim : "";
        else url = "top_1" in global_ranks ? "/html/ranks/animated/" + global_ranks["top_1"].anim : ""
    } else {
        if (rank in global_ranks) url = "/html/ranks/animated/" + global_ranks[rank].anim
    }
    return url
}

function renderRankIcon(rank, position, team_size, size) {
    let div = _createElement("div", "rank_icon");
    if (position && position > 0) {
        if (position == 1) div.classList.add("top_4");
        else if (position <= 50) div.classList.add("top_3");
        else if (position <= 100) div.classList.add("top_2");
        else div.classList.add("top_1");
        if (position > 1) div.appendChild(_createElement("div", "position", position))
    } else {
        if (rank === null || rank === undefined || rank == 0) {
            if (team_size && team_size >= 1) {
                if (team_size <= 4) {
                    div.classList.add("unranked_" + team_size)
                } else {
                    div.classList.add("unranked_4")
                }
            } else {
                div.classList.add("unranked_1")
            }
        } else {
            div.classList.add("rank_" + rank)
        }
    }
    if (size == "small") div.classList.add("small");
    if (size == "big") div.classList.add("big");
    return div
}
let global_rank_tier_lookup = [
    [0, 0],
    [1, 5],
    [6, 10],
    [11, 15],
    [16, 20],
    [21, 25],
    [26, 30],
    [31, 35],
    [36, 40]
];

function getRankName(rank, position) {
    let fragment = _createElement("div");
    if (position && position > 0) {
        if (position == 1) fragment.appendChild(_createElement("div", "name", localize("rank_tier_top1")));
        else if (position <= 50) fragment.appendChild(_createElement("div", "name", localize("rank_tier_top50")));
        else if (position <= 100) fragment.appendChild(_createElement("div", "name", localize("rank_tier_top100")));
        else return fragment.appendChild(_createElement("div", "name", localize("rank_tier_top1000")))
    } else {
        if (rank === null || rank === undefined || rank == 0) {
            fragment.appendChild(_createElement("div", "name", localize("rank_unranked")))
        } else {
            let tier = 1;
            for (tier; tier < global_rank_tier_lookup.length; tier++) {
                if (Number(rank) >= global_rank_tier_lookup[tier][0] && Number(rank) <= global_rank_tier_lookup[tier][1]) {
                    break
                }
            }
            try {
                let tier_sub_rank = 5 - (global_rank_tier_lookup[tier][1] - Number(rank));
                let tier_sub_rank_text = "";
                if (tier_sub_rank == 1) tier_sub_rank_text = "I";
                else if (tier_sub_rank == 2) tier_sub_rank_text = "II";
                else if (tier_sub_rank == 3) tier_sub_rank_text = "III";
                else if (tier_sub_rank == 4) tier_sub_rank_text = "IV";
                else if (tier_sub_rank == 5) tier_sub_rank_text = "V";
                fragment.appendChild(_createElement("div", "name", localize("rank_tier_" + tier)));
                fragment.appendChild(_createElement("div", "name-post", tier_sub_rank_text))
            } catch (e) {}
        }
    }
    return fragment
}

function sortPlayersByStats(a, b) {
    if (a.stats[GLOBAL_ABBR.STATS_KEY_SCORE] == b.stats[GLOBAL_ABBR.STATS_KEY_SCORE]) {
        if (a.stats[GLOBAL_ABBR.STATS_KEY_FRAGS] == b.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]) {
            if (a.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] == b.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]) {
                return 0
            } else {
                return b.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] - a.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]
            }
        } else {
            return b.stats[GLOBAL_ABBR.STATS_KEY_FRAGS] - a.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]
        }
    } else {
        return b.stats[GLOBAL_ABBR.STATS_KEY_SCORE] - a.stats[GLOBAL_ABBR.STATS_KEY_SCORE]
    }
}

function sortPlayersByRaceTime(a, b) {
    if (!a.hasOwnProperty("stats") || !a.stats.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_SCORE) || a.stats[GLOBAL_ABBR.STATS_KEY_SCORE] == 0) return 1;
    if (!b.hasOwnProperty("stats") || !b.stats.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_SCORE) || b.stats[GLOBAL_ABBR.STATS_KEY_SCORE] == 0) return -1;
    if (a.stats[GLOBAL_ABBR.STATS_KEY_SCORE] == b.stats[GLOBAL_ABBR.STATS_KEY_SCORE]) {
        return 0
    } else {
        return a.stats[GLOBAL_ABBR.STATS_KEY_SCORE] - b.stats[GLOBAL_ABBR.STATS_KEY_SCORE]
    }
}

function getPlayersBestWeapon(stats) {
    let weapon_index = -1;
    let max_dmg = 0;
    let acc = 0;
    if (GLOBAL_ABBR.STATS_KEY_WEAPONS in stats) {
        for (let s of stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {
            let w_data = get_weapon_by_idx(s[GLOBAL_ABBR.STATS_KEY_ITEM_IDX]);
            if (!w_data || !w_data.selectable) continue;
            if (s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] !== undefined && s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] > max_dmg) {
                weapon_index = s[GLOBAL_ABBR.STATS_KEY_ITEM_IDX];
                max_dmg = s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED];
                if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined && s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) {
                    if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] > 0) {
                        acc = Math.round(s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] / s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] * 100)
                    }
                }
            }
        }
    }
    return {
        idx: weapon_index,
        acc: acc
    }
}

function createCustomizationName(item) {
    let name = _createElement("div", "name");
    if (global_customization_type_map[item.customization_type].name == "currency") {
        name.textContent = localize_ext("count_coin", {
            count: item.amount
        })
    } else if (global_customization_type_map[item.customization_type].name == "country") {
        if (!item || item.customization_id.trim().length == 0) name.textContent = localize("customization_default");
        else name.textContent = localize_country(item.customization_id)
    } else if (item.customization_id.trim().length == 0) {
        name.textContent = localize("customization_default")
    } else {
        name.textContent = localize("customization_" + item.customization_id)
    }
    return name
}

function createCustomizationInfo(item, show_name, prefix) {
    if (!prefix) prefix = "";
    let customization_info = _createElement("div", prefix + "customization_info");
    if (show_name === undefined || show_name === true) {
        customization_info.appendChild(createCustomizationName(item))
    }
    if (item.customization_type) {
        let div_type = _createElement("div", "type");
        let border = _createElement("div", "border");
        border.style.backgroundColor = "var(--rarity_" + item.rarity + ")";
        div_type.appendChild(border);
        div_type.appendChild(_createElement("div", "", localize(global_rarity_map[item.rarity].i18n + "_" + global_customization_type_map[item.customization_type].name)));
        customization_info.appendChild(div_type)
    }
    return customization_info
}

function createCustomizationPreview(item) {
    let preview_image = _createElement("div", "customization_preview_image");
    if (global_customization_type_map[item.customization_type].name == "avatar") {
        if (item.customization_id == "default") return preview_image;
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url(" + _avatarUrl(item.customization_id) + ")"
    } else if (global_customization_type_map[item.customization_type].name == "country") {
        if (item.customization_id == "default") return preview_image;
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url(/html/customization/flag/" + item.customization_id + ".png.dds)"
    } else if (global_customization_type_map[item.customization_type].name == "currency") {
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url(/html/images/icons/reborn_coin.png.dds)"
    } else if (global_customization_type_map[item.customization_type].name == "music") {
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url(" + _musicImageUrl(item.customization_id) + ")";
        let music_controls = _createElement("div", "music_controls");
        preview_image.appendChild(music_controls);
        let play_button = _createElement("div", ["db-btn", "plain", "music_play_button"]);
        music_controls.appendChild(play_button);
        let pause_button = _createElement("div", ["db-btn", "plain", "music_pause_button"]);
        music_controls.appendChild(pause_button);
        _addButtonSounds(play_button, 1);
        _addButtonSounds(pause_button, 1);
        play_button.addEventListener("click", (() => _play_music_preview(item.customization_id)));
        pause_button.addEventListener("click", _pause_music_preview)
    } else if (global_customization_type_map[item.customization_type].name == "spray") {
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.appendChild(_createElement("div", "backdrop"));
        let image = _createElement("div", "image");
        image.style.backgroundImage = "url(" + _sprayUrl(item.customization_id) + ")";
        preview_image.appendChild(image)
    } else if (global_customization_type_map[item.customization_type].name == "sticker") {
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url(" + _stickerUrl(item.customization_id) + ")"
    }
    return preview_image
}
let customization_audio_playing = "";

function _play_music_preview(id) {
    _pause_music_preview();
    customization_audio_playing = id;
    engine.call("ui_sound_tracked", customization_audio_playing);
    engine.call("set_music_post_volume", 0)
}

function _pause_music_preview() {
    if (customization_audio_playing.length) engine.call("ui_stop_sound", customization_audio_playing);
    engine.call("set_music_post_volume", 1);
    customization_audio_playing = ""
}

function _load_lazy_all(parent) {
    let count = 0;
    let timeout = 0;
    _for_each_with_class_in_parent(parent, "lazy_load", (function(el) {
        setTimeout((() => {
            _load_lazy(el)
        }), timeout);
        count++;
        if (count % 10) timeout++
    }))
}

function _load_lazy(el) {
    if (!el.classList.contains("lazy_load")) return;
    if (!("lazyUrl" in el.dataset)) return;
    el.appendChild(_createElement("div", "lazy_spinner"));
    var img = new Image;
    img.onload = function() {
        for (let i = 0; i < el.children.length; i++) {
            if (el.children[i] && el.children[i].classList.contains("lazy_spinner")) el.removeChild(el.children[i])
        }
        el.classList.remove("lazy_load");
        if (el.dataset.lazyType == "bg") {
            el.style.backgroundImage = "url(" + img.src + ")"
        }
        if (el.dataset.lazyType == "src") {
            el.src = img.src
        }
        delete el.dataset.lazyType;
        delete el.dataset.lazyUrl;
        img = null
    };
    img.onerror = function() {
        for (let i = 0; i < el.children.length; i++) {
            if (el.children[i] && el.children[i].classList.contains("lazy_spinner")) el.removeChild(el.children[i])
        }
        el.classList.remove("lazy_load");
        delete el.dataset.lazyType;
        delete el.dataset.lazyUrl
    };
    img.src = el.dataset.lazyUrl
}

function _add_lazy_load(el, type, url) {
    el.classList.add("lazy_load");
    el.dataset.lazyType = type;
    el.dataset.lazyUrl = url
}

function rightward_greedy_two_way_split(str, separator) {
    var ret = [];
    var tok_start = str.indexOf(separator);
    if (tok_start != -1) {
        ret[0] = str.substring(0, tok_start);
        ret[1] = str.substring(tok_start + separator.length)
    }
    return ret
}

function linkClicked(url) {
    engine.call("open_browser", url)
}

function filter_commands(commands, physics) {
    let ret = {
        highlighted: [],
        filtered: []
    };
    let insta_switch = 0;
    for (let c of commands) {
        if (c.key == "game_equip_time_ms" && c.value == 0) insta_switch++;
        if (c.key == "game_switch_time_ms" && c.value == 0) insta_switch++
    }
    for (let c of commands) {
        if (c.key == "game_equip_time_ms" && insta_switch == 2) {
            continue
        } else if (c.key == "game_switch_time_ms" && insta_switch == 2) {
            continue
        } else if (c.key == "game_lifesteal") {
            ret.highlighted.push({
                label: localize("custom_settings_lifesteal"),
                value: Math.floor(c.value * 100) + "%"
            })
        } else if (c.key == "phy_hook") {
            ret.highlighted.push({
                label: localize("custom_settings_hook"),
                value: c.value ? localize("enabled") : localize("disabled")
            })
        } else {
            ret.filtered.push(c)
        }
    }
    if (insta_switch == 2 || physics > 0) {
        ret.highlighted.push({
            label: localize("custom_settings_instaswitch"),
            value: insta_switch == 2 ? localize("enabled") : localize("disabled")
        })
    }
    return ret
}

function _partial_anonymize(ip) {
    return ip.substring(0, ip.lastIndexOf(".")) + ".*"
}

function unflattenData(data) {
    if (!data || data.length <= 1) return [];
    let ret_data = [];
    let i = 0;
    let y = 0;
    let properties = data[0].length;
    for (i = 1; i < data.length; i++) {
        let tmp = {};
        for (y = 0; y < properties; y++) {
            tmp[data[0][y]] = data[i][y]
        }
        ret_data.push(tmp)
    }
    return ret_data
}

function set_store_avatar(is_self, icon_cont, client_user_id, client_source) {
    let source_id = "" + Friends.state.source;
    if (typeof client_source !== "undefined" && client_source in CLIENT_SOURCE) {
        source_id = client_source
    }
    if (source_id === "1") {
        icon_cont.appendChild(_createElement("div", ["avatar_icon", "epic"]))
    } else if (source_id === "2") {
        let icon = _createElement("div", ["avatar_icon", "steam"]);
        if (is_self || Friends.is_friend(client_user_id)) {
            icon.style.backgroundImage = "url(steam-avatar://" + client_user_id + ")";
            icon.classList.add("user")
        }
        icon_cont.appendChild(icon)
    } else if (source_id === "3") {
        icon_cont.appendChild(_createElement("div", ["avatar_icon", "xbox"]))
    } else {
        icon_cont.appendChild(_createElement("div", ["avatar_icon", "master"]))
    }
}

function update_connection_status_indicator(root, position, status, offline_reason) {
    if (!root) return false;
    let status_el = root.querySelector(".connection_status .status");
    if (status_el) {
        _empty(status_el);
        let main = _createElement("div", "main");
        let hyphen = _createElement("div", "hyphen", "-");
        let extra = _createElement("div", "extra");
        if (status === "connected") {
            main.textContent = localize("online")
        } else if (status === "queue") {
            main.textContent = localize("connecting");
            let text = "in Queue";
            if (position > 0) {
                text += " (" + position + ")"
            }
            extra.textContent = text;
            extra.classList.add("connecting")
        } else if (status === "connecting") {
            main.textContent = localize("connecting")
        } else if (status === "offline") {
            main.textContent = localize("offline");
            if (offline_reason) {
                extra.classList.add("error");
                if (offline_reason === "banned") {
                    extra.textContent = localize("banned")
                } else if (offline_reason === "ghosted") {
                    extra.textContent = localize("shared_login_detected")
                } else if (offline_reason === "outdated_version") {
                    extra.textContent = localize("update_required")
                } else if (offline_reason === "auth_failed") {
                    extra.textContent = localize("auth_error")
                } else if (offline_reason === "service_down") {
                    extra.textContent = localize("service_offline")
                }
            }
        }
        status_el.appendChild(main);
        if (extra.textContent) {
            status_el.appendChild(hyphen);
            status_el.appendChild(extra)
        }
    }
    if (status === "connected") {
        return true
    }
    return false
}