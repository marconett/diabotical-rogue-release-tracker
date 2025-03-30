let API_URL = "https://api.diabotical.com";
const HUD_PLAYING = 0;
const HUD_SPECTATING = 1;
const CLIENT_COMMAND_JSON_DATA = 60;
const CLIENT_COMMAND_GET_INVITE_LIST = 61;
const CLIENT_COMMAND_PARTY = 62;
const CLIENT_COMMAND_LOBBY_UPDATE_PASSWORD = 63;
const CLIENT_COMMAND_JOIN_USERID_PARTY = 64;
const CLIENT_COMMAND_GET_USERID_FROM_NAME = 65;
const CLIENT_COMMAND_GET_ONLINE_FRIENDS_DATA = 66;
const CLIENT_COMMAND_SET_PARTY_LOCATIONS = 67;
const CLIENT_COMMAND_SET_PARTY_PRIVACY = 68;
const CLIENT_COMMAND_SET_PARTY_EXPAND_SEARCH = 69;
const CLIENT_COMMAND_PARTY_JOIN_SESSION = 70;
const CLIENT_COMMAND_PARTY_JOIN_LOBBY_KEY = 71;
const CLIENT_COMMAND_GET_API_TOKEN = 72;
const CLIENT_COMMAND_COMMEND = 73;
const CLIENT_COMMAND_SET_PARTY_REGIONS = 74;
const CLIENT_COMMAND_REROLL_CHALLENGE = 75;
const CLIENT_COMMAND_ABANDON = 76;
const CLIENT_COMMAND_GET_COMP_SEASON = 77;
const CLIENT_COMMAND_SET_CUSTOMIZATION = 78;
const CLIENT_COMMAND_MESSAGE_PARTY = 79;
const CLIENT_COMMAND_MESSAGE_LOBBY = 80;
const CLIENT_COMMAND_DISCONNECTED = 81;
const CLIENT_COMMAND_GET_COMBINED_LIST = 82;
const CLIENT_COMMAND_DISMISS_RECONNECT = 83;
const CLIENT_COMMAND_SELECT_MAP = 84;
const CLIENT_COMMAND_GET_RANKED_MMRS = 85;
const CLIENT_COMMAND_SET_CUSTOMIZATIONS = 86;
const CLIENT_COMMAND_REQUEUE = 87;
const CLIENT_COMMAND_SET_COLOR = 88;
const CLIENT_COMMAND_GET_NOTIFICATIONS = 89;
const CLIENT_COMMAND_DEL_NOTIFICATION = 90;
const CLIENT_COMMAND_GET_CLIENT_INFO = 91;
const CLIENT_COMMAND_GET_QUEUES = 92;
const CLIENT_COMMAND_GET_RECONNECTS = 93;
const CLIENT_COMMAND_RECONNECT = 94;
const CLIENT_COMMAND_REQUEST_REMATCH = 95;
const CLIENT_COMMAND_JOIN_WARMUP = 96;
const CLIENT_COMMAND_SELECT_MODE = 97;
const CLIENT_COMMAND_LOBBY_MAKE_ADMIN = 98;
const CLIENT_COMMAND_LOBBY_REVOKE_ADMIN = 99;
const CLIENT_COMMAND_PARTY_JOIN_LOBBY_SESSION = 100;
const CLIENT_COMMAND_SAVE_CHAR_PRESET = 101;
const CLIENT_COMMAND_DEL_CHAR_PRESET = 102;
const CLIENT_COMMAND_LOAD_CHAR_PRESET = 103;
const CLIENT_COMMAND_SET_ALLOW_FRIEND_REQUESTS = 104;
const CLIENT_COMMAND_OWN_DATA = 105;
const CLIENT_COMMAND_SEND_FRIEND_REQUEST = 106;
const CLIENT_COMMAND_HANDLE_FRIEND_REQUEST = 107;
const CLIENT_COMMAND_GET_FRIENDS_LIST = 108;
const CLIENT_COMMAND_REMOVE_FRIEND = 109;
const CLIENT_COMMAND_MESSAGE_USER = 110;
const CLIENT_COMMAND_CREATE_PICKUP = 111;
const CLIENT_COMMAND_LEAVE_PICKUP = 112;
const CLIENT_COMMAND_JOIN_PICKUP = 113;
const CLIENT_COMMAND_INSTANT_JOIN = 114;
const CLIENT_COMMAND_GET_CUSTOM_LIST = 115;
const CLIENT_COMMAND_SET_ACTIVE_BATTLEPASS = 116;
const CLIENT_COMMAND_RELOAD_CLIENT_DATA = 117;
const CLIENT_COMMAND_START_MAP_VOTE = 118;
const CLIENT_COMMAND_VOTE = 119;
const CLIENT_COMMAND_PINGS = 120;
const CLIENT_COMMAND_MAP_USERID = 121;
const CLIENT_COMMAND_SIGNUP_TOURNAMENT = 122;
const CLIENT_COMMAND_SIGNOFF_TOURNAMENT = 123;
const CLIENT_COMMAND_CONFIRM_TOURNAMENT_MATCH = 124;
const CLIENT_COMMAND_GET_TOURNAMENT_MATCHES = 125;
const CLIENT_COMMAND_DELETE_TOURNAMENT = 126;
const CLIENT_COMMAND_FORFEIT_TOURNAMENT_MATCH = 127;
const CLIENT_COMMAND_TOURNAMENT_MAP_PICK = 129;
const CLIENT_COMMAND_JOIN_TEAM = 130;
const CLIENT_COMMAND_GET_INIT_DATA = 131;
const CLIENT_COMMAND_GET_VERIFICATION_TOKEN = 132;
const CLIENT_COMMAND_SET_FRIEND_STATUS = 134;
const CLIENT_COMMAND_GET_QUEUE_STATS = 138;
const CLIENT_COMMAND_GET_PICKUP_LIST = 140;
const MATCH_TYPE_LOCAL = -1;
const MATCH_TYPE_CUSTOM = 0;
const MATCH_TYPE_TOURNAMENT = 1;
const MATCH_TYPE_PICKUP = 2;
const MATCH_TYPE_QUEUE = 3;
const MATCH_TYPE_WARMUP = 4;
const MATCH_TYPE_INSTANT = 5;
const SPECTATING_TEAM = 255;
const USER_PERMISSIONS = {
    create_ext_tournaments: 1,
    edit_other_tournaments: 2,
    create_public_tournaments: 4,
    create_unlimited_tournaments: 8,
    list_private_tournaments: 16
};
const CLIENT_SOURCE = {
    0: "GD Studio",
    1: "Epic Games Launcher",
    2: "Steam",
    3: "Xbox Live",
    4: "PSN"
};
const CLIENT_SOURCE_NAME = {
    GDS: 0,
    EGS: 1,
    STEAM: 2,
    XBOX: 3,
    PSN: 4
};
const MATCH_TYPE = {
    "-1": {
        i18n: "match_type_local"
    },
    0: {
        i18n: "match_type_custom"
    },
    1: {
        i18n: "match_type_tournament"
    },
    2: {
        i18n: "match_type_pickup"
    },
    3: {
        i18n: "match_type_queue"
    },
    4: {
        i18n: "match_type_warmup"
    },
    5: {
        i18n: "match_type_quickplay"
    }
};
const TOURNEY_STATE = {
    0: "upcoming",
    1: "live",
    2: "ended",
    3: "cancelled"
};
const TOURNAMENT_SIGNUP_TIME = 36e5;
const SHOP_ITEM_TYPE = {
    CUSTOMIZATION: "c",
    PACK: "p",
    BATTLEPASS_BASIC: "b",
    BATTLEPASS_BUNDLE: "B"
};
const NOTIFICATION_TYPE = {
    0: "battlepass",
    1: "battlepass_items",
    2: "gift_battlepass",
    3: "gift_item",
    4: "twitch_drop",
    5: "tournament_reward",
    6: "tournament_result",
    7: "login_reward"
};
const VIDEO_NOTIFICATION_TYPES = [0, 2, 6];
let global_report_reasons = [{
    id: 2,
    i18n: "report_reason_offensive_speech"
}, {
    id: 4,
    i18n: "report_reason_griefing"
}, {
    id: 3,
    i18n: "report_reason_bug_exploit"
}, {
    id: 1,
    i18n: "report_reason_cheating"
}];
var global_ping_colors = {
    green: "#41e447",
    yellow: "#ece453",
    orange: "#ea9a31",
    red: "#ff2828"
};
let global_mode_definitions = {};
let global_active_queues = [];
let global_queues = {};
let global_instant_modes = [];
var global_general_card_data = {
    practice: {
        i18n: "game_mode_practice_range",
        desc_i18n: ""
    },
    licensecenter: {
        i18n: "game_mode_license_center",
        desc_i18n: ""
    }
};
const global_weapon_definitions = {};
const global_weapon_tag_map = {};
const global_skill_definitions = {};

function get_weapon_by_idx(idx) {
    if (idx in global_weapon_definitions) {
        return global_weapon_definitions[idx]
    }
    return null
}

function get_weapon_by_tag(tag) {
    if (tag in global_weapon_tag_map) {
        if (global_weapon_tag_map[tag] in global_weapon_definitions) {
            return global_weapon_definitions[global_weapon_tag_map[tag]]
        }
    }
    return null
}

function get_weapon_reload_time(idx) {
    let w_data = get_weapon_by_idx(idx);
    if (!w_data) return 0;
    if (w_data.shots_per_round) {
        return w_data.rate / w_data.shots_per_round
    }
    return w_data.rate
}

function get_skill_by_id(id) {
    if (id in global_skill_definitions) {
        return global_skill_definitions[id]
    }
    return null
}
var global_customization_type_map = {
    0: {
        name: "currency",
        prefix: "cu",
        group: "",
        img_path: "/html/customization/currency/",
        i18n: "customization_type_currency"
    },
    1: {
        name: "sticker",
        prefix: "st",
        group: "sticker",
        img_path: "/resources/asset_thumbnails/",
        i18n: "customization_type_sticker"
    },
    2: {
        name: "avatar",
        prefix: "av",
        group: "profile",
        img_path: "/html/customization/avatar/",
        i18n: "customization_type_avatar"
    },
    3: {
        name: "music",
        prefix: "mu",
        group: "music",
        img_path: "/html/customization/music/",
        i18n: "customization_type_music"
    },
    4: {
        name: "emote",
        prefix: "em",
        group: "emote",
        img_path: "/html/customization/emote/",
        i18n: "customization_type_emote"
    },
    5: {
        name: "spray",
        prefix: "sp",
        group: "spray",
        img_path: "/html/customization/spray/",
        i18n: "customization_type_spray"
    },
    6: {
        name: "weapon",
        prefix: "we",
        group: "weapon",
        img_path: "/html/customization/weapon/",
        i18n: "customization_type_weapon"
    },
    7: {
        name: "weapon_attachment",
        prefix: "wa",
        group: "weapon_attachment",
        img_path: "/html/customization/weapon_attachment/",
        i18n: "customization_type_weapon_attachment"
    },
    8: {
        name: "announcer",
        prefix: "an",
        group: "",
        img_path: "/html/customization/announcer/",
        i18n: "customization_type_announcer"
    },
    9: {
        name: "shoes",
        prefix: "sh",
        group: "character",
        img_path: "/html/customization/shoes/",
        i18n: "customization_type_shoes"
    },
    10: {
        name: "country",
        prefix: "co",
        group: "profile",
        img_path: "/html/customization/flag/",
        i18n: "customization_type_flag"
    },
    11: {
        name: "shell",
        prefix: "se",
        group: "character",
        img_path: "/html/customization/shell/",
        i18n: "customization_type_shell"
    },
    12: {
        name: "shield",
        prefix: "si",
        group: "character",
        img_path: "/html/customization/shield/",
        i18n: "customization_type_shield"
    },
    13: {
        name: "eye",
        prefix: "ey",
        group: "",
        img_path: "/html/customization/eye/",
        i18n: "customization_type_eye"
    },
    14: {
        name: "head",
        prefix: "he",
        group: "",
        img_path: "/html/customization/head/",
        i18n: "customization_type_head"
    },
    15: {
        name: "suit",
        prefix: "su",
        group: "",
        img_path: "/html/customization/suit/",
        i18n: "customization_type_suit"
    },
    16: {
        name: "back",
        prefix: "ba",
        group: "",
        img_path: "/html/customization/back/",
        i18n: "customization_type_back"
    },
    21: {
        name: "team",
        prefix: "te",
        group: "",
        img_path: "",
        i18n: "customization_type_team"
    },
    22: {
        name: "perk",
        prefix: "pe",
        group: "",
        img_path: "",
        i18n: "customization_type_perk"
    },
    23: {
        name: "gameplay_item",
        prefix: "gi",
        group: "",
        img_path: "",
        i18n: "customization_type_gameplay_item"
    }
};
var global_customization_type_id_map = {
    currency: 0,
    sticker: 1,
    avatar: 2,
    music: 3,
    emote: 4,
    spray: 5,
    weapon: 6,
    weapon_attachment: 7,
    announcer: 8,
    shoes: 9,
    country: 10,
    shell: 11,
    shield: 12,
    eye: 13,
    head: 14,
    suit: 15,
    back: 16,
    team: 21,
    perk: 22,
    gameplay_item: 23
};
const customization_item_order = [0, 11, 12, 6, 7, 14, 13, 17, 18, 15, 16, 19, 20, 9, 4, 3, 5, 8, 2, 1, 10, 21, 22];
var global_rarity_map = {
    0: {
        i18n: "rarity_common"
    },
    1: {
        i18n: "rarity_uncommon"
    },
    2: {
        i18n: "rarity_rare"
    },
    3: {
        i18n: "rarity_epic"
    },
    4: {
        i18n: "rarity_legendary"
    }
};
var GLOBAL_AVAILABLE_COUNTRY_FLAGS = ["af", "ax", "al", "dz", "as", "ad", "ao", "ai", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "br", "io", "bn", "bg", "bf", "bi", "cv", "kh", "cm", "ca", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cw", "cz", "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "sz", "et", "fk", "fj", "fi", "fo", "fr", "pf", "ga", "gm", "ge", "de", "gh", "gi", "gr", "gl", "gd", "gu", "gt", "gg", "gn", "gw", "gy", "ht", "va", "hn", "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "im", "il", "it", "jm", "jp", "je", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "mx", "fm", "md", "mc", "mn", "me", "ms", "ma", "mz", "mm", "na", "nr", "np", "nl", "nz", "ni", "ne", "ng", "nu", "nf", "mk", "no", "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pl", "pt", "pr", "qa", "ro", "ru", "rw", "kn", "lc", "vc", "ws", "sm", "st", "sa", "sn", "rs", "sc", "sl", "sg", "sx", "sk", "si", "sb", "so", "za", "ss", "es", "lk", "sd", "sr", "se", "ch", "sy", "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "gb", "us", "uy", "uz", "vu", "ve", "vn", "vg", "vi", "eh", "ye", "zm", "zw"];
const GLOBAL_ABBR = {
    STATS_KEY_DAMAGE_TAKEN: "dt",
    STATS_KEY_DAMAGE_INFLICTED: "di",
    STATS_KEY_DAMAGE_SELF: "ds",
    STATS_KEY_SCORE: "s",
    STATS_KEY_FRAGS: "f",
    STATS_KEY_DEATHS: "d",
    STATS_KEY_DEATHS_FROM: "df",
    STATS_KEY_DEATHS_WHILE_HELD: "dh",
    STATS_KEY_ITEM_IDX: "i",
    STATS_KEY_SHOTS_FIRED: "sf",
    STATS_KEY_SHOTS_HIT: "sh",
    STATS_KEY_WEAPONS: "w",
    STATS_KEY_ROUNDS: "r",
    STATS_KEY_BASE: "b",
    STATS_KEY_ASSISTS: "a",
    STATS_KEY_PING: "p",
    STATS_KEY_ITEMS: "it",
    STATS_KEY_COUNT: "c",
    STATS_KEY_TEAM_HEALING: "th",
    STATS_KEY_OWN_HEALING: "oh",
    STATS_KEY_ARMOR_TAKEN: "at",
    STATS_KEY_SELECTED_WEAPONS: "sw",
    STATS_KEY_SELECTED_ABILITIES: "sa",
    STATS_KEY_SELECTED_CLASS: "cl",
    STATS_KEY_KILL_CHUNK: "kch",
    STATS_KEY_KILL_SCOUT: "ksc",
    STATS_KEY_KILL_EGGBOT: "keg",
    STATS_KEY_KILLS_WITH_CHUNK: "kwch",
    STATS_KEY_KILLS_WITH_SCOUT: "kwsc",
    STATS_KEY_KILLS_WITH_EGGBOT: "kweg",
    STATS_KEY_COLLECTED_ORBS: "co",
    STATS_KEY_COLLECTED_MAJOR_ORBS: "cmo"
};
var GLOBAL_DEFAULT_CUSTOMIZATION_OPTIONS = {
    avatar: [],
    sticker: []
};
const MAX_MAP_RATE = 5;
var global_fov_preview_images = {
    temple_quarry: [{
        fov: 7.1907,
        fov_type: "vML",
        width: 1920,
        height: 1080,
        src: "images/fov_preview/fov_preview_7,1907.png"
    }, {
        fov: 50,
        fov_type: "vML",
        width: 1920,
        height: 1080,
        src: "images/fov_preview/fov_preview_50.png"
    }, {
        fov: 140,
        fov_type: "vML",
        width: 1920,
        height: 1080,
        src: "images/fov_preview/fov_preview_140.png"
    }],
    depot: [{
        fov: 1,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_1.png"
    }, {
        fov: 5,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_5.png"
    }, {
        fov: 10,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_10.png"
    }, {
        fov: 20,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_20.png"
    }, {
        fov: 30,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_30.png"
    }, {
        fov: 40,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_40.png"
    }, {
        fov: 50,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_50.png"
    }, {
        fov: 60,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_60.png"
    }, {
        fov: 70,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_70.png"
    }, {
        fov: 80,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_80.png"
    }, {
        fov: 90,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_90.png"
    }, {
        fov: 100,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_100.png"
    }, {
        fov: 110,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_110.png"
    }, {
        fov: 120,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_120.png"
    }, {
        fov: 130,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_130.png"
    }, {
        fov: 140,
        fov_type: "vML",
        pitch: .0329947,
        yaw: -13.8751,
        pos: [-834.296, -333.662, -201.524],
        width: 1920,
        height: 810,
        src: "images/fov_preview/depot_fov_140.png"
    }],
    crystal_cove: [{
        fov: 1,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_1.png"
    }, {
        fov: 2,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_2.png"
    }, {
        fov: 3,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_3.png"
    }, {
        fov: 5,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_5.png"
    }, {
        fov: 10,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_10.png"
    }, {
        fov: 20,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_20.png"
    }, {
        fov: 40,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_40.png"
    }, {
        fov: 70,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_70.png"
    }, {
        fov: 110,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_110.png"
    }, {
        fov: 140,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/crystal_cove_fov_140.png"
    }],
    wellspring: [{
        fov: 1,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_1.png"
    }, {
        fov: 2,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_2.png"
    }, {
        fov: 3,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_3.png"
    }, {
        fov: 5,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_5.png"
    }, {
        fov: 10,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_10.png"
    }, {
        fov: 20,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_20.png"
    }, {
        fov: 40,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_40.png"
    }, {
        fov: 70,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_70.png"
    }, {
        fov: 110,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_110.png"
    }, {
        fov: 140,
        fov_type: "vML",
        width: 1920,
        height: 810,
        src: "images/fov_preview/wellspring_fov_140.png"
    }]
};
var global_ranks = {
    1: {
        anim: "01_paintjob.webm"
    },
    2: {
        anim: "02_paintjob.webm"
    },
    3: {
        anim: "03_paintjob.webm"
    },
    4: {
        anim: "04_paintjob.webm"
    },
    5: {
        anim: "05_paintjob.webm"
    },
    6: {
        anim: "06_stone.webm"
    },
    7: {
        anim: "07_stone.webm"
    },
    8: {
        anim: "08_stone.webm"
    },
    9: {
        anim: "09_stone.webm"
    },
    10: {
        anim: "10_stone.webm"
    },
    11: {
        anim: "11_wood.webm"
    },
    12: {
        anim: "12_wood.webm"
    },
    13: {
        anim: "13_wood.webm"
    },
    14: {
        anim: "14_wood.webm"
    },
    15: {
        anim: "15_wood.webm"
    },
    16: {
        anim: "16_iron.webm"
    },
    17: {
        anim: "17_iron.webm"
    },
    18: {
        anim: "18_iron.webm"
    },
    19: {
        anim: "19_iron.webm"
    },
    20: {
        anim: "20_iron.webm"
    },
    21: {
        anim: "21_copper.webm"
    },
    22: {
        anim: "22_copper.webm"
    },
    23: {
        anim: "23_copper.webm"
    },
    24: {
        anim: "24_copper.webm"
    },
    25: {
        anim: "25_copper.webm"
    },
    26: {
        anim: "26_silver.webm"
    },
    27: {
        anim: "27_silver.webm"
    },
    28: {
        anim: "28_silver.webm"
    },
    29: {
        anim: "29_silver.webm"
    },
    30: {
        anim: "30_silver.webm"
    },
    31: {
        anim: "31_gold.webm"
    },
    32: {
        anim: "32_gold.webm"
    },
    33: {
        anim: "33_gold.webm"
    },
    34: {
        anim: "34_gold.webm"
    },
    35: {
        anim: "35_gold.webm"
    },
    36: {
        anim: "36_crystal.webm"
    },
    37: {
        anim: "37_crystal.webm"
    },
    38: {
        anim: "38_crystal.webm"
    },
    39: {
        anim: "39_crystal.webm"
    },
    40: {
        anim: "40_crystal.webm"
    },
    top_1: {
        anim: "41_special04.webm"
    },
    top_2: {
        anim: "42_special03.webm"
    },
    top_3: {
        anim: "43_special02.webm"
    },
    top_4: {
        anim: "44_legend.webm"
    }
};
const MAP_AUTHORS = {
    duela_pavilion_x: "pav",
    duela_restless: "febreeze",
    duela_sanctum: "egzot1k",
    duel_raya: "febreeze",
    duel_frostrush: "pav",
    duel_viki: "Grum1x",
    duel_overgrowth: "Speccy",
    duel_amberfall: "cityy, C_Justin",
    duel_monolith: "Napalm3D, stickflip",
    tt_oasis: "ben_afps",
    tt_roosh: "JoshuaDolman",
    tt_boost: "Sharqosity, lolograde, Koala",
    tt_toxic: "DeliosAxis",
    tt_cave_run: "quBit",
    tdm_frozen_decay: "armaku, Nounoustar",
    b_frozen_decay: "armaku, Nounoustar",
    tdm_huracan: "sav",
    b_huracan: "sav",
    ft_hurt_locker: "flikswich",
    b_hurt_locker: "flikswich",
    ft_starport: "Nounoustar",
    ctf_seismic_fault: "Nounoustar",
    tt_ctf_seismic_fault: "Nounoustar",
    woa_arcol: "febreeze",
    woa_habibi: "sgepard",
    woa_morpheus: "sav",
    woa_prod: "sgepard",
    duela_cathedra: "febreeze",
    duela_machine: "Humour",
    duela_darkness: "pav, Grum1x",
    duela_axiom: "COFFIN FILLER, egzot1k",
    woa_caliburn: "sgepard",
    woa_rekiem: "sav",
    ba_rekiem: "sav",
    woa_gloria: "Grum1x, pav",
    woa_dynamo: "bl1ndlight",
    woa_coyote: "sgepard",
    tta_arctis: "DeliosAxis",
    tta_error_fields: "pav",
    tta_arqa: "Dhcold",
    tta_lickety_split: "Piotski",
    tta_brut: "narkos",
    ba_hangar: "bl1ndlight",
    tta_hven: "narkos",
    tta_lava: "k0",
    mga_mediterranean_market: "Piotski",
    tdma_myshell: "Grum1x",
    tta_mystic_br: "Mysticaly",
    duela_prism: "Fortiss",
    sua_star_station: "JoJTheRat",
    "tta_three_headed Monkey": "Piotski",
    tta_villa: "ArchRhythm",
    tta_windy_cave: "DeliosAxis",
    tdma_wreckage: "Tensolin",
    woa_neon_soul: "sgepard",
    woa_forty_two: "sgepard",
    woa_melting_point: "sgepard",
    woa_insanatorium: "sgepard"
};
const CUSTOM_DEFAULT_SCORE_LIMITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1e3, 0];