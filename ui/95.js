GAME.set_initial_data(GAME.ids.INVASION, {
    GAME_NAME: "Invasion",
    GAME_LOGO: "/html/images/game_selection/game_logo_invasion.png",
    GAME_NAME_FULL: "Diabotical Invasion",
    GAME_TYPE_DESC: "Single Player CO-OP",
    API_PATH: "/api/v0/1/",
    HUB_MODE: "",
    HUB_MAP: "",
    EDIT_MODE: "edit",
    location_selection_type: 1,
    lobby_location_selection_type: 1,
    online_screens: ["achievements", "coin_shop", "create", "custom", "friends_blocked_panel", "friends_panel", "locker", "play", "shop_item", "shop_screen"],
    item_name_map: {},
    item_pickups_in_scoreboard: [],
    weapons_priority_default: [],
    weapon_sound_packs: {
        0: [],
        1: [],
        2: [],
        3: [],
        4: []
    },
    CUSTOM_FFA_MODES: ["ffa"],
    CUSTOM_MULTI_TEAM_MODES: ["ffa", "testmode2", "testmode3", "pod"],
    CUSTOM_SOLO_MODES: ["ffa"],
    CUSTOM_ROUND_BASED_MODES: [],
    CUSTOM_BR_MODES: ["testmode2"],
    CUSTOM_TIMELIMIT_ONLY_MODES: [],
    CUSTOM_SPECIAL_COOP_MODES: [],
    CUSTOM_TUTORIAL_MODES: [],
    CUSTOM_ROUND_LIMITS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20],
    CUSTOM_CAPTURE_LIMITS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 0],
    CUSTOM_MODE_DEFAULTS: {},
    game_mode_map: {
        testmode2: {
            mode: "testmode2",
            name: "testmode2",
            i18n: "testmode2",
            desc_i18n: "testmode2",
            desc_instagib_i18n: "testmode2",
            announce: "",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/brawl.png.dds"
        }
    },
    CUSTOM_MODE_DEFINITIONS: {
        r_md_solos: {
            i18n: "game_mode_rogue_solos",
            desc_i18n: "game_mode_rogue_desc_solos"
        },
        r_md_duos: {
            i18n: "game_mode_rogue_duos",
            desc_i18n: "game_mode_rogue_desc_duos"
        }
    },
    physics_map: {
        0: {
            i18n: "custom_settings_physics_diabotical"
        }
    },
    battlepass_data: {
        eg_bp_season_1: {
            season_nr: "1",
            "shop-image": "/html/customization_pack/battlepass_season_1.png",
            "fullscreen-image": "/html/images/backgrounds/battlepass_season_1.png",
            "bp-icon": "/html/images/icons/battlepass_free.png.dds",
            "bp-icon-paid": "/html/images/icons/battlepass_paid.png.dds",
            "bp-icon-anim": "/html/animations/battlepass_upgrade.webm",
            "bp-color": "#3688b5",
            title: "battlepass_1_title",
            price_basic: 1e3,
            price_bundle: 2800,
            price_level: 100
        }
    },
    competitive_data: {},
    customization_sub_types: {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: ["melee", "mag", "rev", "sni", "sho", "smg", "bow", "sap", "dbsho", "hmg", "egun", "tgun", "hsniper", "rpncr"],
        7: ["melee", "mag", "rev", "sni", "sho", "smg", "bow", "sap", "dbsho", "hmg", "egun", "tgun", "hsniper", "rpncr"],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [],
        13: ["invasion_weesuit", "invasion_weeble", "invasion_eggbot", "invasion_bigbot"],
        14: ["invasion_weesuit", "invasion_weeble", "invasion_eggbot", "invasion_bigbot"],
        15: ["invasion_weesuit", "invasion_weeble", "invasion_eggbot", "invasion_bigbot"],
        16: ["invasion_weesuit", "invasion_weeble", "invasion_eggbot", "invasion_bigbot"],
        21: [],
        22: ["invasion_weesuit", "invasion_weeble", "invasion_eggbot", "invasion_bigbot"]
    },
    customization_multi_sub_types: [13, 14, 22],
    customization_array_types: {
        perk: 3
    },
    default_customizations: {
        5: "sp_play_nice"
    },
    player_classes: {
        invasion_weesuit: {
            i18n: "class_invasion_weesuit"
        },
        invasion_weeble: {
            i18n: "class_invasion_weeble"
        },
        invasion_eggbot: {
            i18n: "class_invasion_eggbot"
        },
        invasion_bigbot: {
            i18n: "class_invasion_bigbot"
        }
    },
    DEFAULT_CLASS: "weesuit",
    LOBBY_INIT_MODE: "rogue_survival",
    LOBBY_SETTINGS_LIST: {
        private: ["bool", true, true],
        mode: ["string", "", ""],
        mode_name: ["string", "", ""],
        mode_editing: ["int", 0, 0],
        ai_mode_prompt: ["string", "", ""],
        datacenter: ["string", "", ""],
        map_list: ["custom", [],
            []
        ],
        time_limit: ["int", 0, 0],
        score_limit: ["int", 0, 0],
        team_count: ["int", 12, 12],
        team_size: ["int", 2, 2],
        team_switching: ["int", 0, 0],
        warmup_time: ["int", -1, -1],
        min_players: ["int", 1, 1],
        max_clients: ["int", 100, 100],
        ready_percentage: ["float", 1, 1],
        commands: ["custom", [],
            []
        ]
    },
    LOBBY_SETTINGS_OPTION_LIST: ["allow_map_voting", "mode_editing", "ai_mode_prompt"],
    LOBBY_CLIENT_VAR_MAP: {
        lobby_custom_map: {
            name: "map_list",
            cb_type: "custom",
            type: "json"
        },
        lobby_custom_mode: {
            name: "mode",
            cb_type: "custom",
            type: "json"
        },
        lobby_custom_teams: {
            name: "team_count",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_team_size: {
            name: "team_size",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_duration: {
            name: "time_limit",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_score_limit: {
            name: "score_limit",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_datacenter: {
            name: "datacenter",
            cb_type: "select",
            type: "string"
        },
        lobby_custom_warmup_time: {
            name: "warmup_time",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_team_switching: {
            name: "team_switching",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_min_players: {
            name: "min_players",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_max_clients: {
            name: "max_clients",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_ready_percentage: {
            name: "ready_percentage",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_commands: {
            name: "commands",
            cb_type: "custom",
            type: "json"
        }
    },
    COMMUNITY_MAPS: false,
    COMMUNITY_MODES: false,
    customization_group_map: {
        suits: {
            i18n: "customize_group_suit",
            categories: [{
                id: "c_weesuit",
                i18n: "class_invasion_weesuit"
            }, {
                id: "c_weeble",
                i18n: "class_invasion_weeble"
            }, {
                id: "c_eggbot",
                i18n: "class_invasion_eggbot"
            }, {
                id: "c_bigbot",
                i18n: "class_invasion_bigbot"
            }]
        },
        weapons: {
            i18n: "customize_group_weapon",
            categories: [{
                id: "w_melee",
                i18n: "customize_group_weapon_melee"
            }, {
                id: "w_pistol",
                i18n: "customize_group_weapon_pistols"
            }, {
                id: "w_smg",
                i18n: "customize_group_weapon_smg"
            }, {
                id: "w_ar",
                i18n: "customize_group_weapon_ar"
            }, {
                id: "w_sg",
                i18n: "customize_group_weapon_shotguns"
            }, {
                id: "w_sniper",
                i18n: "customize_group_weapon_snipers"
            }, {
                id: "w_bow",
                i18n: "customize_group_weapon_bow"
            }]
        },
        profile: {
            i18n: "customize_group_profile",
            categories: [{
                id: "profile",
                i18n: "customize_group_profile"
            }, {
                id: "spray",
                i18n: "customize_group_spray"
            }, {
                id: "emote",
                i18n: "customize_group_emote"
            }]
        }
    },
    customization_category_map: {
        c_weesuit: [new CustomizationType("suit", "0"), new CustomizationType("head", "0"), new CustomizationType("eye", "0"), new CustomizationType("perk", "0")],
        c_weeble: [new CustomizationType("suit", "4"), new CustomizationType("head", "4"), new CustomizationType("eye", "4"), new CustomizationType("perk", "4")],
        c_eggbot: [new CustomizationType("suit", "2"), new CustomizationType("head", "2"), new CustomizationType("eye", "2"), new CustomizationType("perk", "2")],
        c_bigbot: [new CustomizationType("suit", "3"), new CustomizationType("head", "3"), new CustomizationType("eye", "3"), new CustomizationType("perk", "3")],
        profile: [new CustomizationType("avatar", ""), new CustomizationType("country", "")],
        spray: [new CustomizationType("spray", "")],
        emote: [new CustomizationType("emote", "")],
        w_melee: [new CustomizationType("weapon", "melee")],
        w_ar: [new CustomizationType("weapon", "mag"), new CustomizationType("weapon", "hmg")],
        w_smg: [new CustomizationType("weapon", "smg"), new CustomizationType("weapon", "tgun")],
        w_sg: [new CustomizationType("weapon", "dbsho"), new CustomizationType("weapon", "sho")],
        w_sniper: [new CustomizationType("weapon", "rpncr"), new CustomizationType("weapon", "sni"), new CustomizationType("weapon", "hsniper")],
        w_pistol: [new CustomizationType("weapon", "rev"), new CustomizationType("weapon", "sap"), new CustomizationType("weapon", "egun")],
        w_bow: [new CustomizationType("weapon", "bow")]
    },
    flat_bg_scene_screens: ["coin_shop", "notification", "battlepass", "shop", "shop_item", "player_profile", "locker", "custom"],
    map_names: {},
    sniper_zoom_indexes: [64]
});