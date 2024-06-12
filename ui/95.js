GAME.set_initial_data(GAME.ids.ROGUE, {
    GAME_NAME: "Rogue",
    GAME_LOGO: "/html/images/game_selection/game_logo_rogue.png",
    GAME_NAME_FULL: "Diabotical Rogue",
    GAME_TYPE_DESC: "Multi Player Rogue-like FPS",
    API_PATH: "/api/v0/2/",
    HUB_MODE: "rogue_hub",
    HUB_MAP: "a_hub",
    EDIT_MODE: "rogue_edit",
    location_selection_type: 3,
    lobby_location_selection_type: 1,
    online_screens: ["achievements", "coin_shop", "create", "custom", "friends_blocked_panel", "friends_panel", "locker", "play_rogue", "shop_item", "shop_screen"],
    item_name_map: {},
    item_pickups_in_scoreboard: ["hpt3", "armort4", "armort3", "armort2", "doubledamage", "tripledamage", "vanguard", "survival", "haste"],
    weapons_priority_default: ["rl", "shaft", "ss", "bl", "pncr", "vc", "cb", "mac", "melee"],
    weapon_sound_packs: {
        0: [],
        1: [],
        2: []
    },
    CUSTOM_FFA_MODES: ["ffa"],
    CUSTOM_MULTI_TEAM_MODES: [],
    CUSTOM_SOLO_MODES: ["duel", "ffa"],
    CUSTOM_ROUND_BASED_MODES: ["rogue_wipeout", "rogue_attack_defense"],
    CUSTOM_TIMELIMIT_ONLY_MODES: ["duel", "race"],
    CUSTOM_RACE_MODES: ["race"],
    CUSTOM_SPECIAL_COOP_MODES: [],
    CUSTOM_TUTORIAL_MODES: ["tutorial"],
    CUSTOM_ROUND_LIMITS: [1, 2, 3, 4, 5, 6, 7, 8],
    CUSTOM_CAPTURE_LIMITS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 0],
    CUSTOM_MODE_DEFAULTS: {
        rogue_teamdeathmatch: {
            time_limit: 720,
            score_limit: 200
        },
        rogue_wipeout: {
            score_limit: 4
        }
    },
    game_mode_map: {
        rogue_wipeout: {
            mode: "rogue_wipeout",
            name: "Wipeout",
            i18n: "game_mode_wipeout",
            desc_i18n: "game_mode_2_desc_wipeout",
            announce: "announcer_common_gamemode_wipeout",
            enabled: true,
            image: "/html/images/gamemodes/wipeout_big.jpg",
            icon: "",
            variable_team_size: false,
            rules: ["game_mode_2_rules_wipeout_1", "game_mode_2_rules_wipeout_2", "game_mode_2_rules_wipeout_3", "game_mode_2_rules_wipeout_4"]
        },
        rogue_siege: {
            mode: "rogue_siege",
            name: "Siege",
            i18n: "game_mode_siege",
            desc_i18n: "game_mode_2_desc_siege",
            announce: "announcer_common_gamemode_siege",
            enabled: false,
            image: "/html/images/gamemodes/siege.png",
            icon: "",
            variable_team_size: false
        },
        rogue_teamdeathmatch: {
            mode: "rogue_teamdeathmatch",
            name: "Team Death Match",
            i18n: "game_mode_tdm",
            desc_i18n: "game_mode_desc_tdm",
            announce: "announcer_common_gamemode_domination",
            enabled: false,
            image: "/html/images/gamemodes/tdm.png",
            icon: "",
            variable_team_size: true
        },
        rogue_domination: {
            mode: "rogue_domination",
            name: "Domination",
            i18n: "game_mode_domination",
            desc_i18n: "game_mode_2_desc_domination",
            announce: "announcer_common_gamemode_domination",
            enabled: false,
            image: "/html/images/gamemodes/domination.png",
            icon: "",
            variable_team_size: true
        },
        rogue_attack_defense: {
            mode: "rogue_attack_defense",
            name: "Attack Defense",
            i18n: "game_mode_attack_defense",
            desc_i18n: "game_mode_2_desc_attack_defense",
            announce: "announcer_common_gamemode_attack_defense",
            enabled: false,
            image: "/html/images/gamemodes/attack_defense.png",
            icon: "",
            variable_team_size: false
        },
        warmup: {
            mode: "warmup",
            name: "Warmup",
            i18n: "game_mode_warmup",
            desc_i18n: "game_mode_desc_warmup",
            announce: "announcer_common_gamemode_warmup",
            enabled: false,
            image: "/html/images/gamemodes/warmup.png",
            icon: ""
        }
    },
    CUSTOM_MODE_DEFINITIONS: {},
    physics_map: {
        0: {
            i18n: "custom_settings_physics_diabotical"
        },
        1: {
            i18n: "custom_settings_physics_race"
        },
        2: {
            i18n: "custom_settings_physics_vintage"
        }
    },
    battlepass_data: {},
    competitive_data: {},
    customization_sub_types: {
        0: [],
        1: [],
        2: [],
        3: ["pu"],
        4: [],
        5: [],
        6: ["melee", "mac", "bl", "ss", "rl", "shaft", "cb", "pncr", "gl", "w9", "mg", "vc"],
        7: ["melee", "mac", "bl", "ss", "rl", "shaft", "cb", "pncr", "gl", "w9", "mg", "vc"],
        8: [],
        9: ["l", "r"],
        10: [],
        11: [],
        12: [],
        13: [],
        14: [],
        15: [],
        16: [],
        21: [],
        22: []
    },
    customization_multi_sub_types: [7, 9],
    customization_array_types: {},
    default_customizations: {
        3: {
            pu: "mu_pu_devilish"
        },
        5: "sp_play_nice"
    },
    LOBBY_INIT_MODE: "rogue_wipeout",
    LOBBY_SETTINGS_LIST: {
        private: ["bool", true, true],
        name: ["string", "", ""],
        mode: ["string", "", ""],
        datacenter: ["string", "", ""],
        map_list: ["custom", [],
            []
        ],
        time_limit: ["int", 0, 0],
        score_limit: ["int", 0, 0],
        team_count: ["int", 2, 2],
        team_size: ["int", 3, 3],
        allow_map_voting: ["int", 1, 1],
        continuous: ["int", 0, 0],
        auto_balance: ["int", 0, 0],
        team_switching: ["int", 0, 0],
        warmup_time: ["int", -1, -1],
        min_players: ["int", 1, 1],
        max_clients: ["int", 100, 100],
        ready_percentage: ["float", 1, 1],
        commands: ["custom", [],
            []
        ]
    },
    LOBBY_CLIENT_VAR_MAP: {
        lobby_visibility: {
            name: "private",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_map: {
            name: "map_list",
            cb_type: "custom",
            type: "json"
        },
        lobby_custom_mode: {
            name: "mode",
            cb_type: "select",
            type: "string"
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
        lobby_custom_continuous: {
            name: "continuous",
            cb_type: "select",
            type: "real"
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
        lobby_custom_allow_map_voting: {
            name: "allow_map_voting",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_commands: {
            name: "commands",
            cb_type: "custom",
            type: "json"
        }
    },
    COMMUNITY_MAPS: true,
    customization_group_map: {
        suits: {
            i18n: "customize_group_suit",
            categories: [{
                id: "c_eggbot",
                type: "suit",
                i18n: "class_rogue_eggbot"
            }, {
                id: "c_weesuit",
                type: "suit",
                i18n: "class_rogue_scout"
            }, {
                id: "c_chunk",
                type: "suit",
                i18n: "class_rogue_chunk"
            }]
        },
        weapons_eggbot: {
            i18n: "customize_group_weapons_eggbot",
            categories: [{
                id: "w_mac_eggbot",
                type: "weapon",
                color_id: "1",
                i18n: "weapon_machinegun"
            }, {
                id: "w_smg_eggbot",
                type: "weapon",
                color_id: "100",
                i18n: "weapon_submachinegun"
            }, {
                id: "w_egun_eggbot",
                type: "weapon",
                color_id: "105",
                i18n: "weapon_egun"
            }, {
                id: "w_cb_eggbot",
                type: "weapon",
                color_id: "6",
                i18n: "weapon_crossbow"
            }]
        },
        weapons_scout: {
            i18n: "customize_group_weapons_scout",
            categories: [{
                id: "w_mac_scout",
                type: "weapon",
                color_id: "1",
                i18n: "weapon_machinegun"
            }, {
                id: "w_ss_scout",
                type: "weapon",
                color_id: "3",
                i18n: "weapon_supershotgun"
            }, {
                id: "w_rev_scout",
                type: "weapon",
                color_id: "107",
                i18n: "weapon_revolver"
            }, {
                id: "w_hsniper_scout",
                type: "weapon",
                color_id: "62",
                i18n: "weapon_heavysniper"
            }]
        },
        weapons_chunk: {
            i18n: "customize_group_weapons_chunk",
            categories: [{
                id: "w_hmg_chunk",
                type: "weapon",
                color_id: "106",
                i18n: "weapon_heavymachinegun"
            }, {
                id: "w_bl_chunk",
                type: "weapon",
                color_id: "2",
                i18n: "weapon_blaster"
            }, {
                id: "w_shaft_chunk",
                type: "weapon",
                color_id: "5",
                i18n: "weapon_shaft"
            }, {
                id: "w_rl_chunk",
                type: "weapon",
                color_id: "4",
                i18n: "weapon_rocketlauncher"
            }]
        }
    },
    customization_category_map: {
        c_eggbot: [new CustomizationType("suit", "7")],
        c_weesuit: [new CustomizationType("suit", "6")],
        c_chunk: [new CustomizationType("suit", "8")],
        w_cb_eggbot: [new CustomizationType("weapon", "cb", "7")],
        w_smg_eggbot: [new CustomizationType("weapon", "smg", "7")],
        w_mac_eggbot: [new CustomizationType("weapon", "mac", "7")],
        w_egun_eggbot: [new CustomizationType("weapon", "egun", "7")],
        w_mac_scout: [new CustomizationType("weapon", "mac", "6")],
        w_hsniper_scout: [new CustomizationType("weapon", "hsniper", "6")],
        w_ss_scout: [new CustomizationType("weapon", "ss", "6")],
        w_rev_scout: [new CustomizationType("weapon", "rev", "6")],
        w_hmg_chunk: [new CustomizationType("weapon", "hmg", "8")],
        w_shaft_chunk: [new CustomizationType("weapon", "shaft", "8")],
        w_bl_chunk: [new CustomizationType("weapon", "bl", "8")],
        w_rl_chunk: [new CustomizationType("weapon", "rl", "8")]
    },
    flat_bg_scene_screens: ["coin_shop", "notification", "battlepass", "shop", "shop_item", "player_profile", "locker"],
    map_names: {
        wellspring: "Wellspring",
        furnace: "Furnace",
        toya: "Toya",
        titan: "Titan",
        cassini: "Cassini",
        arcol: "Arcol",
        sentinel: "Sentinel",
        relay: "Relay"
    },
    default_weapon_skin_images: {
        cb: "/html/images/weapon_icons/wp_card_crossbow_nobg.png.dds",
        smg: "/html/images/weapon_icons/wp_card_submachinegun_nobg.png.dds",
        mac: "/html/images/weapon_icons/wp_card_machinegun_nobg.png.dds",
        egun: "/html/images/weapon_icons/wp_card_egun_nobg.png.dds",
        hsniper: "/html/images/weapon_icons/wp_card_heavysniper_nobg.png.dds",
        ss: "/html/images/weapon_icons/wp_card_shotgun_nobg.png.dds",
        rev: "/html/images/weapon_icons/wp_card_revolver_nobg.png.dds",
        hmg: "/html/images/weapon_icons/wp_card_heavymachinegun_nobg.png.dds",
        shaft: "/html/images/weapon_icons/wp_card_shaft_nobg.png.dds",
        bl: "/html/images/weapon_icons/wp_card_blaster_nobg.png.dds",
        rl: "/html/images/weapon_icons/wp_card_rocketlauncher_nobg.png.dds"
    },
    locker_preview_scale: {
        suit: {
            7: .9
        },
        weapon: {
            mac: .85,
            smg: .85,
            egun: .7,
            rev: .85
        }
    },
    customizations: {
        6: {
            bl: [{
                customization_id: "rog_we_bl_excavator",
                customization_type: 6,
                customization_sub_type: "bl",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_bl_juno",
                customization_type: 6,
                customization_sub_type: "bl",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_bl_stinger",
                customization_type: 6,
                customization_sub_type: "bl",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_bl_vintage",
                customization_type: 6,
                customization_sub_type: "bl",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            cb: [{
                customization_id: "rog_we_cb_excavator",
                customization_type: 6,
                customization_sub_type: "cb",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_cb_juno",
                customization_type: 6,
                customization_sub_type: "cb",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_cb_stinger",
                customization_type: 6,
                customization_sub_type: "cb",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_cb_vintage",
                customization_type: 6,
                customization_sub_type: "cb",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            egun: [{
                customization_id: "rog_we_egun_excavator",
                customization_type: 6,
                customization_sub_type: "egun",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_egun_juno",
                customization_type: 6,
                customization_sub_type: "egun",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_egun_stinger",
                customization_type: 6,
                customization_sub_type: "egun",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_egun_vaporwave",
                customization_type: 6,
                customization_sub_type: "egun",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_egun_vintage",
                customization_type: 6,
                customization_sub_type: "egun",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            hmg: [{
                customization_id: "rog_we_hmg_excavator",
                customization_type: 6,
                customization_sub_type: "hmg",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hmg_juno",
                customization_type: 6,
                customization_sub_type: "hmg",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hmg_marine",
                customization_type: 6,
                customization_sub_type: "hmg",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hmg_stinger",
                customization_type: 6,
                customization_sub_type: "hmg",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hmg_vaporwave",
                customization_type: 6,
                customization_sub_type: "hmg",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hmg_vintage",
                customization_type: 6,
                customization_sub_type: "hmg",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            hsniper: [{
                customization_id: "rog_we_hsniper_excavator",
                customization_type: 6,
                customization_sub_type: "hsniper",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hsniper_juno",
                customization_type: 6,
                customization_sub_type: "hsniper",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hsniper_stinger",
                customization_type: 6,
                customization_sub_type: "hsniper",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_hsniper_vintage",
                customization_type: 6,
                customization_sub_type: "hsniper",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            mac: [{
                customization_id: "rog_we_mac_excavator",
                customization_type: 6,
                customization_sub_type: "mac",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_mac_juno",
                customization_type: 6,
                customization_sub_type: "mac",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_mac_marine",
                customization_type: 6,
                customization_sub_type: "mac",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_mac_stinger",
                customization_type: 6,
                customization_sub_type: "mac",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_mac_vaporwave",
                customization_type: 6,
                customization_sub_type: "mac",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_mac_vintage",
                customization_type: 6,
                customization_sub_type: "mac",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            rev: [{
                customization_id: "rog_we_rev_aes",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_excavator",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_gullwing",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_juno",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_marine",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_penthouse",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_stinger",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_vaporwave",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rev_vintage",
                customization_type: 6,
                customization_sub_type: "rev",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            rl: [{
                customization_id: "rog_we_rl_excavator",
                customization_type: 6,
                customization_sub_type: "rl",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rl_juno",
                customization_type: 6,
                customization_sub_type: "rl",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rl_stinger",
                customization_type: 6,
                customization_sub_type: "rl",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_rl_vintage",
                customization_type: 6,
                customization_sub_type: "rl",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            shaft: [{
                customization_id: "rog_we_shaft_excavator",
                customization_type: 6,
                customization_sub_type: "shaft",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_shaft_juno",
                customization_type: 6,
                customization_sub_type: "shaft",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_shaft_stinger",
                customization_type: 6,
                customization_sub_type: "shaft",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_shaft_vintage",
                customization_type: 6,
                customization_sub_type: "shaft",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            smg: [{
                customization_id: "rog_we_smg_excavator",
                customization_type: 6,
                customization_sub_type: "smg",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_smg_juno",
                customization_type: 6,
                customization_sub_type: "smg",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_smg_stinger",
                customization_type: 6,
                customization_sub_type: "smg",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_smg_vintage",
                customization_type: 6,
                customization_sub_type: "smg",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }],
            ss: [{
                customization_id: "rog_we_ss_excavator",
                customization_type: 6,
                customization_sub_type: "ss",
                customization_set_id: null,
                rarity: 0,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_ss_juno",
                customization_type: 6,
                customization_sub_type: "ss",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_ss_stinger",
                customization_type: 6,
                customization_sub_type: "ss",
                customization_set_id: null,
                rarity: 2,
                seen: true,
                amount: 1
            }, {
                customization_id: "rog_we_ss_vintage",
                customization_type: 6,
                customization_sub_type: "ss",
                customization_set_id: null,
                rarity: 3,
                seen: true,
                amount: 1
            }]
        }
    }
});