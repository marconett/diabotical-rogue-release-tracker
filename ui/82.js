let onevw_float = window.outerWidth / 100;
let onevh_float = window.outerHeight / 100;
let onevw = Math.floor(onevw_float);
let onevh = Math.floor(onevh_float);
document.documentElement.style.setProperty("--onevw", "" + Math.round(window.outerWidth / 100));
document.documentElement.style.setProperty("--onevh", "" + Math.round(window.outerHeight / 100));
document.documentElement.style.setProperty("--zero-onevw", "" + onevw / 10);
document.documentElement.style.setProperty("--zero-onevh", "" + onevh / 10);
document.documentElement.style.setProperty("--zero-onevw-rounded", "" + (onevw / 10 < 1 ? 1 : Math.floor(onevw / 10)));
document.documentElement.style.setProperty("--zero-onevh-rounded", "" + (onevh / 10 < 1 ? 1 : Math.floor(onevh / 10)));
let global_arguments = [];
let global_mask_preview_containers = {};
const MAX_HUD_DEFINITION_LENGTH = 16384;
let global_ready_key = undefined;
class i18nHandler {
    init(element, value) {
        this.handler(element, value)
    }
    deinit(element) {}
    update(element, value) {
        this.handler(element, value)
    }
    handler(element, value) {
        if (!value) return;
        if (value.indexOf(":") > -1) {
            let res = value.split(":");
            if (res.length >= 3) {
                element.textContent = localize_ext(res[0], {
                    value: res[1],
                    value2: res[2]
                })
            } else if (res.length === 2) {
                element.textContent = localize_ext(res[0], {
                    value: res[1]
                })
            } else {
                element.textContent = localize(value)
            }
        } else {
            element.textContent = localize(value)
        }
    }
}
class DatasetHandler {
    init(element, value) {
        let data = value.split(":");
        if (data.length == 2) {
            element.dataset[data[0]] = data[1]
        }
        if (element.hasAttribute("data-scrollbar")) {
            refreshScrollbar(_id(element.getAttribute("data-scrollbar")))
        }
    }
    deinit(element) {
        if (element.hasAttribute("data-scrollbar")) {
            refreshScrollbar(_id(element.getAttribute("data-scrollbar")))
        }
    }
    update(element, value) {
        let data = value.split(":");
        if (data.length == 2) {
            element.dataset[data[0]] = data[1]
        }
    }
}
bind_event("Ready", (function() {
    engine.registerBindingAttribute("i18n", i18nHandler);
    engine.registerBindingAttribute("dataset", DatasetHandler)
}));

function init_shared() {
    bind_event("set_arguments", (function(json) {
        try {
            global_arguments = JSON.parse(json)
        } catch (e) {
            console.log("Error parsing arguments JSON. err=" + e)
        }
    }))
}

function getCustomizationImagePath(customization_id, type_id) {
    if (customization_id && type_id in global_customization_type_map) {
        if (global_customization_type_map[type_id].name == "sticker") return _stickerUrl(customization_id);
        if (global_customization_type_map[type_id].name == "spray") return _sprayUrl(customization_id);
        if (global_customization_type_map[type_id].name == "music") return _musicImageUrl(customization_id);
        if (global_customization_type_map[type_id].name == "currency") return "/html/images/icons/reborn_coin.png.dds";
        if (global_customization_type_map[type_id].name == "weapon") {
            return global_customization_type_map[type_id].img_path + customization_id + ".dds"
        } else {
            return global_customization_type_map[type_id].img_path + customization_id + ".png.dds"
        }
    } else {
        return "/html/customization/no_img.png.dds"
    }
}

function renderCustomizationInner(screen, type_id, id, amount, lazy) {
    let type_name = "";
    if (type_id in global_customization_type_map) {
        type_name = global_customization_type_map[type_id].name
    }
    let img_path = getCustomizationImagePath(id, type_id);
    let inner = _createElement("div", ["customization_preview", type_name]);
    let backdrop = _createElement("div", "backdrop");
    inner.appendChild(backdrop);
    let image = _createElement("div", "image");
    inner.appendChild(image);
    if (lazy) {
        _add_lazy_load(image, "bg", img_path)
    } else {
        image.style.backgroundImage = "url(" + img_path + ")"
    }
    if (screen == "customize") {
        if (type_name == "music") {
            let title = _createElement("div", "music_title", localize("customization_" + id));
            inner.appendChild(title)
        }
    }
    if (screen !== "shop") {
        if (amount > 1) {
            if (type_name == "weapon_attachment") amount = amount + "x";
            inner.appendChild(_createElement("div", "amount", amount))
        }
    }
    return inner
}

function renderShopBattlePassInner(id) {
    let inner = _createElement("div", "battlepass_preview");
    const bp_data = GAME.get_data("battlepass_data", id);
    if (bp_data) {
        inner.style.backgroundImage = "url(" + bp_data["shop-image"] + ")"
    }
    return inner
}

function renderCustomizationPackInner(id) {
    let inner = _createElement("div", ["customization_preview", "pack"]);
    inner.style.backgroundImage = "url(/html/customization_pack/" + id + ".png)";
    return inner
}

function setupMenuSoundListeners() {
    _for_each_in_class("click-sound", (function(el) {
        el.addEventListener("mousedown", _play_click1)
    }));
    _for_each_in_class("click-sound2", (function(el) {
        el.addEventListener("mousedown", _play_click1)
    }));
    _for_each_in_class("button", (function(el) {
        el.addEventListener("mousedown", _play_click1)
    }));
    _for_each_in_class("click-back1", (function(el) {
        el.addEventListener("mousedown", _play_click_back)
    }));
    _for_each_in_class("click-sound2", (function(el) {
        el.addEventListener("mouseenter", _play_mouseover3)
    }));
    _for_each_in_class("checkbox_component", (function(el) {
        el.addEventListener("mouseenter", _play_mouseover4)
    }));
    _for_each_in_class("mouseover-sound1", (function(el) {
        el.addEventListener("mouseenter", _play_mouseover1)
    }));
    _for_each_in_class("mouseover-sound2", (function(el) {
        el.addEventListener("mouseenter", _play_mouseover2)
    }));
    _for_each_in_class("mouseover-sound3", (function(el) {
        el.addEventListener("mouseenter", _play_mouseover3)
    }));
    _for_each_in_class("mouseover-sound4", (function(el) {
        el.addEventListener("mouseenter", (function() {
            if (el.classList.contains("disabled")) return;
            _play_mouseover4()
        }))
    }))
}

function get_fairest_team_id(data) {
    let team_id = SPECTATING_TEAM;
    if (data.teams && data.teams.length) {
        let least_players = 100;
        for (let i = 0; i < data.teams.length; i++) {
            if (data.teams[i].players.length >= data.team_size) continue;
            if (data.teams[i].players.length < least_players) least_players = data.teams[i].players.length
        }
        let teams_least_players = [];
        for (let i = 0; i < data.teams.length; i++) {
            if (data.teams[i].players.length == least_players) teams_least_players.push(data.teams[i])
        }
        if (teams_least_players.length > 1) teams_least_players.sort(((a, b) => a.team_id - b.team_id));
        if (teams_least_players.length) {
            team_id = teams_least_players[0].team_id
        }
    }
    return team_id
}

function sort_game_data_teams(teams, order) {
    let new_teams = [];
    for (let i = 0; i < teams.length; i++) {
        new_teams.push(teams[i])
    }
    if (order == "id") {
        new_teams.sort((function(a, b) {
            return a.team_id <= b.team_id ? -1 : 1
        }))
    }
    if (order == "score") {
        new_teams.sort((function(a, b) {
            if (a.team_score > b.team_score) return -1;
            else if (a.team_score < b.team_score) return 1;
            else {
                if (game_data.round_mode) {
                    if (a.game_score > b.game_score) return -1;
                    else if (a.game_score < b.game_score) return 1;
                    else return a.team_id <= b.team_id ? -1 : 1
                } else {
                    return a.team_id <= b.team_id ? -1 : 1
                }
            }
        }))
    }
    return new_teams
}

function sort_game_data_players(players, order) {
    let new_players = [];
    for (let i = 0; i < players.length; i++) {
        new_players.push(players[i])
    }
    if (order == "id") {
        new_players.sort((function(a, b) {
            return a.player_id <= b.player_id ? -1 : 1
        }))
    }
    if (order == "score") {
        new_players.sort((function(a, b) {
            if (a.score > b.score) return -1;
            if (a.score < b.score) return 1;
            if (a.score == b.score) {
                return a.player_id <= b.player_id ? -1 : 1
            }
        }))
    }
    return new_players
}

function count_to_empty_array(count) {
    return new Array(count)
}
let global_hud_version = 2.1;
let global_hud_version_min = 2.1;

function hud_version_check(hud, hud_type) {
    return;
    if (!("version" in hud)) hud.version = 0;
    let add_elements = [];
    let modify_elements = [];
    let version = Number(hud.version);
    if (version < global_hud_version) {}
    let default_hud = false;
    if (hud.hasOwnProperty("default_hud") && hud.default_hud == true) default_hud = true;
    if (hud.hasOwnProperty("default") && hud.default == false) default_hud = false;
    if (version < global_hud_version_min || default_hud == true && version < global_hud_version) {
        if (global_active_view === "menu") {
            reset_hud()
        } else {
            engine.call("reset_hud", hud_type)
        }
        return
    }
    for (let add_el of add_elements) {
        let found = false;
        for (let el of hud.elements) {
            if (el.t == add_el) {
                found = true;
                break
            }
        }
        if (!found) {}
    }
    for (let modif_el of modify_elements) {
        for (let el of hud.elements) {
            if (el.t == modif_el) {
                break
            }
        }
    }
    hud.version = global_hud_version
}

function update_hud_version(hud) {
    let version = Number(hud.version);
    if (version < global_hud_version) {
        hud.version = global_hud_version
    }
}

function getModeName(mode_key, mode_name, instagib) {
    let name_parts = [];
    let mode_map = GAME.get_data("game_mode_map");
    if (mode_name in mode_map) {
        name_parts.push(localize(mode_map[mode_name].i18n))
    }
    return name_parts.join(" ")
}

function getVSType(team_count, team_size) {
    if (team_size == 1) {
        if (team_count > 2) {
            return localize("game_modes_ffa")
        } else {
            return localize("game_modes_solo")
        }
    } else {
        return localize("game_modes_team")
    }
}

function getVS(team_count, team_size) {
    let vs = "";
    if (team_count == 1) {
        vs += localize_ext("game_mode_type_players", {
            count: team_size
        })
    } else if (team_count == 2) {
        vs += team_size + localize("game_mode_type_vs_short") + team_size
    } else if (team_count > 2) {
        if (team_size == 1) vs += localize("game_mode_type_ffa");
        else vs += Array(team_count).fill(team_size).join(localize("game_mode_type_vs_short"))
    }
    return vs
}

function isFFAMode(team_count, team_size) {
    if (team_count > 2 && team_size == 1) return true;
    return false
}
let mode_update_handlers = [];

function parse_modes(data) {
    global_queues = {};
    global_instant_modes.length = 0;
    global_mode_definitions = data.mode_definitions;
    global_active_queues = data.active_queues;
    for (let m in global_mode_definitions) {
        let mode = global_mode_definitions[m];
        mode.name = getModeName(mode.mode_key, mode.mode_name, mode.instagib);
        mode.vs = getVSType(mode.team_count, mode.team_size);
        if (mode.instant) global_instant_modes.push(m);
        const custom_mode = GAME.get_data("CUSTOM_MODE_DEFINITIONS", m);
        if (custom_mode) {
            mode["custom_name"] = localize(custom_mode.i18n);
            mode["custom_desc"] = localize(custom_mode.desc_i18n)
        }
    }
    let mode_map = GAME.get_data("game_mode_map");
    for (let m of data.active_queues) {
        if (!global_mode_definitions.hasOwnProperty(m.mode_key)) return;
        let mode = global_mode_definitions[m.mode_key];
        let i18n = "game_mode_" + mode.mode_name;
        let desc_i18n = "game_mode_desc_" + mode.mode_name;
        if (mode.mode_name in mode_map) {
            i18n = mode_map[mode.mode_name].i18n;
            desc_i18n = mode_map[mode.mode_name].desc_i18n
        }
        global_queues[m.mode_key] = {
            i18n: i18n,
            desc_i18n: desc_i18n,
            match_type: MATCH_TYPE_QUEUE,
            ranked: mode.ranked,
            team_size: mode.team_size,
            team_count: mode.team_count,
            mode_id: mode.mode_name,
            mode_key: m.mode_key,
            locked: mode.enabled ? false : true
        };
        const custom_mode = GAME.get_data("CUSTOM_MODE_DEFINITIONS", m.mode_key);
        if (custom_mode) {
            global_queues[m.mode_key]["custom_name"] = localize(custom_mode.i18n);
            global_queues[m.mode_key]["custom_desc"] = localize(custom_mode.desc_i18n)
        }
    }
    for (let cb of mode_update_handlers) {
        if (typeof cb === "function") cb(global_mode_definitions, global_queues)
    }
}
let competitive_season_update_handlers = [];

function update_competitive_season(data) {
    if (data) {
        global_competitive_season = data
    } else {
        global_competitive_season = {
            comp_season_id: null,
            comp_season_key: null,
            comp_season_type: null,
            begin_ts: null,
            end_ts: null
        }
    }
    for (let cb of competitive_season_update_handlers) {
        if (typeof cb === "function") cb(global_competitive_season)
    }
}