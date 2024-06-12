GAME.set_initial_data(GAME.ids.DIABOTICAL, {
    GAME_NAME: "Arena",
    GAME_LOGO: "/html/images/game_selection/game_logo_arena.png",
    GAME_NAME_FULL: "Diabotical Arena",
    GAME_TYPE_DESC: "Multi Player Arena FPS",
    API_PATH: "/api/v0/0/",
    HUB_MODE: "",
    HUB_MAP: "",
    EDIT_MODE: "edit",
    location_selection_type: 1,
    lobby_location_selection_type: 1,
    online_screens: [],
    item_name_map: {
        coin: ["#ffffff", "item_coin", "images/item_coin.svg", "mode_pickup"],
        ghost: ["#ffffff", "item_coin", "images/item_coin.svg", "mode_pickup"],
        score_pickup_short: ["#ffdfa4", "item_coin", "images/item_coin.svg", "mode_pickup"],
        score_pickup: ["#ffdfa4", "item_score_pickup", "images/item_coin.svg", "mode_pickup"],
        score_deny: ["#dbdbdb", "item_score_deny", "images/item_coin.svg", "mode_pickup"],
        flag: ["#ffffff", "item_flag", "images/item_flag.svg", "mode_pickup"],
        macguffin: ["#f8d206", "item_macguffin", "images/item_macguffin.svg", "mode_pickup"],
        doubledamage: ["#ffff0d", "item_diabotical", "images/powerup_diabotical.svg", "powerup"],
        tripledamage: ["#891e94", "item_tripledamage", "images/powerup_tripledamage.svg", "powerup"],
        survival: ["#42fc42", "item_siphonator", "images/powerup_siphonator.svg", "powerup"],
        haste: ["#ff5c42", "item_haste", "images/powerup_surge.svg", "powerup"],
        vanguard: ["#0dffff", "item_vanguard", "images/powerup_vanguard.svg", "powerup"],
        armort1: ["#27b1cf", "item_armort1", "images/item_armort1.svg", "armor"],
        armort2: ["#27b1cf", "item_armort2", "images/item_armort2.svg", "armor"],
        armort3: ["#ddb625", "item_armort3", "images/item_armort3.svg", "armor"],
        armort4: ["#e51d1d", "item_armort4", "images/item_armort4.svg", "armor"],
        hpt0: ["#3dbc75", "item_hpt0", "images/item_hpt0.svg", "health"],
        hpt1: ["#3dbc75", "item_hpt1", "images/item_hpt1.svg", "health"],
        hpt2: ["#3dbc75", "item_hpt2", "images/item_hpt2.svg", "health"],
        hpt3: ["#3dbc75", "item_hpt3", "images/item_hpt3.svg", "health"],
        ammobl: ["#7c62d1", "ammo_blaster", "images/weapon_icons/weapon_bl.svg", "ammo"],
        ammoshaft: ["#cdb200", "ammo_shaft", "images/weapon_icons/weapon_shaft.svg", "ammo"],
        ammorl: ["#df1f2d", "ammo_rockets", "images/weapon_icons/weapon_rl.svg", "ammo"],
        ammoss: ["#9bc44d", "ammo_shotgun", "images/weapon_icons/weapon_ss.svg", "ammo"],
        ammopncr: ["#1fa8b6", "ammo_pncr", "images/weapon_icons/weapon_pncr.svg", "ammo"],
        ammomac: ["#cc791d", "ammo_machinegun", "images/weapon_icons/weapon_mac.svg", "ammo"],
        ammogl: ["#9d3329", "ammo_grenades", "images/weapon_icons/weapon_gl.svg", "ammo"],
        ammovc: ["#ff99aa", "ammo_void_cannon", "images/weapon_icons/weapon_vc.svg", "ammo"],
        editpad: ["#555555", "tool_editpad", "images/weapon_editpad.svg", "special"]
    },
    item_pickups_in_scoreboard: ["hpt3", "armort4", "armort3", "armort2", "doubledamage", "tripledamage", "vanguard", "survival", "haste"],
    weapons_priority_default: ["rl", "shaft", "ss", "bl", "pncr", "vc", "cb", "mac", "melee"],
    weapon_sound_packs: {
        0: [],
        1: [],
        2: [],
        3: [1],
        4: [1],
        5: [1],
        6: [1],
        7: [1, 2],
        8: [1],
        9: [1, 2],
        10: [1],
        11: [],
        12: [],
        13: [],
        14: [],
        15: [],
        16: [],
        17: [],
        18: [],
        19: [],
        20: [],
        21: []
    },
    CUSTOM_FFA_MODES: ["ffa"],
    CUSTOM_MULTI_TEAM_MODES: ["brawl", "instagib", "ghosthunt", "ffa", "race", "modified"],
    CUSTOM_SOLO_MODES: ["duel", "ffa"],
    CUSTOM_ROUND_BASED_MODES: ["ca", "shaft_arena", "rocket_arena", "wipeout", "macguffin", "extinction", "bounty"],
    CUSTOM_TIMELIMIT_ONLY_MODES: ["duel", "race"],
    CUSTOM_RACE_MODES: ["race"],
    CUSTOM_SPECIAL_COOP_MODES: ["survival"],
    CUSTOM_TUTORIAL_MODES: ["tutorial"],
    CUSTOM_ROUND_LIMITS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20],
    CUSTOM_CAPTURE_LIMITS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 0],
    CUSTOM_MODE_DEFAULTS: {
        duel: {
            time_limit: 720
        },
        wipeout: {
            score_limit: 4
        },
        tdm: {
            score_limit: 0,
            time_limit: 900
        },
        ca: {
            score_limit: 4
        },
        ctf: {
            score_limit: 0,
            time_limit: 960
        },
        macguffin: {
            score_limit: 2,
            time_limit: 0
        }
    },
    game_mode_map: {
        brawl: {
            mode: "brawl",
            name: "Brawl",
            i18n: "game_mode_brawl",
            desc_i18n: "game_mode_desc_brawl",
            announce: "announcer_common_gamemode_brawl",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/brawl.png.dds"
        },
        modified: {
            mode: "modified",
            name: "Modified",
            i18n: "game_mode_modified",
            desc_i18n: "game_mode_desc_modified",
            announce: "announcer_common_gamemode_modified",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/brawl.png.dds"
        },
        duel: {
            mode: "duel",
            name: "Duel",
            i18n: "game_mode_duel",
            desc_i18n: "game_mode_desc_duel",
            announce: "announcer_common_gamemode_duel",
            enabled: true,
            image: "duel_loop.jpg",
            icon: "/html/images/gamemodes/duel.png.dds"
        },
        duelc: {
            mode: "duelc",
            name: "Duel Classic",
            i18n: "game_mode_duelc",
            desc_i18n: "game_mode_desc_duelc",
            announce: "announcer_common_gamemode_duel",
            enabled: true,
            image: "duel_loop.jpg",
            icon: "/html/images/gamemodes/duel.png.dds"
        },
        ca: {
            mode: "ca",
            name: "Aim Arena",
            i18n: "game_mode_arena",
            desc_i18n: "game_mode_desc_arena",
            announce: "announcer_common_gamemode_arena",
            enabled: true,
            image: "arena_loop.jpg",
            icon: "/html/images/gamemodes/arena.png.dds"
        },
        cac: {
            mode: "cac",
            name: "Aim Arena Classic",
            i18n: "game_mode_cac",
            desc_i18n: "game_mode_desc_cac",
            announce: "announcer_common_gamemode_cac",
            enabled: true,
            image: "arena_loop.jpg",
            icon: "/html/images/gamemodes/arena.png.dds"
        },
        rocket_arena: {
            mode: "rocket_arena",
            name: "Rocket Arena",
            i18n: "game_mode_rocket_arena",
            desc_i18n: "game_mode_desc_rocket_arena",
            announce: "announcer_common_gamemode_rocket_arena",
            enabled: true,
            image: "arena_loop.jpg",
            icon: "/html/images/gamemodes/arena.png.dds"
        },
        shaft_arena: {
            mode: "shaft_arena",
            name: "Shaft Arena",
            i18n: "game_mode_shaft_arena",
            desc_i18n: "game_mode_desc_shaft_arena",
            announce: "announcer_common_gamemode_shaft_arena",
            enabled: true,
            image: "arena_loop.jpg",
            icon: "/html/images/gamemodes/arena.png.dds"
        },
        wipeout: {
            mode: "wipeout",
            name: "Wipeout",
            i18n: "game_mode_wipeout",
            desc_i18n: "game_mode_desc_wipeout",
            announce: "announcer_common_gamemode_wipeout",
            enabled: true,
            image: "wipeout_loop.jpg",
            icon: "/html/images/gamemodes/wipeout.png.dds"
        },
        ctf: {
            mode: "ctf",
            name: "CTF",
            i18n: "game_mode_ctf",
            desc_i18n: "game_mode_desc_ctf",
            announce: "announcer_common_gamemode_ctf",
            enabled: true,
            image: "ctf_loop.jpg",
            icon: "/html/images/gamemodes/ctf.png.dds"
        },
        flagrun: {
            mode: "flagrun",
            name: "Wee-bow Flag Run",
            i18n: "game_mode_flagrun",
            desc_i18n: "game_mode_desc_flagrun",
            announce: "announcer_common_gamemode_flagrun",
            enabled: false,
            image: "arcade_loop.jpg",
            icon: "/html/images/gamemodes/instagib.png.dds"
        },
        coinrun: {
            mode: "coinrun",
            name: "Wee-bow Gold Rush",
            i18n: "game_mode_coinrun",
            desc_i18n: "game_mode_desc_coinrun",
            announce: "announcer_common_gamemode_coinrun",
            enabled: true,
            image: "arcade_loop.jpg",
            icon: "/html/images/gamemodes/instagib.png.dds"
        },
        macguffin: {
            mode: "macguffin",
            name: "MacGuffin",
            i18n: "game_mode_macguffin",
            desc_i18n: "game_mode_desc_macguffin",
            announce: "announcer_common_gamemode_macguffin",
            enabled: true,
            image: "macguffin_loop.jpg",
            icon: "/html/images/gamemodes/macguffin.png.dds"
        },
        ghosthunt: {
            mode: "ghosthunt",
            name: "Wee-bow Instagib",
            i18n: "game_mode_instagib",
            desc_i18n: "game_mode_desc_instagib",
            announce: "announcer_common_gamemode_wee-bow_instagib",
            enabled: true,
            image: "arcade_loop.jpg",
            icon: "/html/images/gamemodes/instagib.png.dds"
        },
        instagib_duel: {
            mode: "instagib_duel",
            name: "Instagib Duel",
            i18n: "game_mode_instagib_duel",
            desc_i18n: "game_mode_desc_instagib_duel",
            announce: "announcer_common_gamemode_instagib_duel",
            enabled: true,
            image: "arcade_loop.jpg",
            icon: "/html/images/gamemodes/instagib.png.dds"
        },
        race: {
            mode: "race",
            name: "Time Trials",
            i18n: "game_mode_race",
            desc_i18n: "game_mode_desc_race",
            announce: "announcer_common_gamemode_time_trials",
            enabled: true,
            image: "arcade_loop.jpg",
            icon: "/html/images/gamemodes/race.png.dds"
        },
        tdm: {
            mode: "tdm",
            name: "TDM",
            i18n: "game_mode_tdm",
            desc_i18n: "game_mode_desc_tdm",
            announce: "announcer_common_gamemode_tdm",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        tdmc: {
            mode: "tdmc",
            name: "TDM Classic",
            i18n: "game_mode_tdmc",
            desc_i18n: "game_mode_desc_tdm_classic",
            announce: "announcer_common_gamemode_tdm",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        tw: {
            mode: "tw",
            name: "Team Wars",
            i18n: "game_mode_tw",
            desc_i18n: "game_mode_desc_tw",
            announce: "",
            enabled: false,
            image: "brawl_loop.jpg",
            icon: ""
        },
        warmup: {
            mode: "warmup",
            name: "Warmup",
            i18n: "game_mode_warmup",
            desc_i18n: "game_mode_desc_warmup",
            announce: "announcer_common_gamemode_warmup",
            enabled: false,
            image: "practice_loop.jpg",
            icon: ""
        },
        extinction: {
            mode: "extinction",
            name: "Extinction",
            i18n: "game_mode_extinction",
            desc_i18n: "game_mode_desc_extinction",
            announce: "announcer_common_gamemode_extinction",
            enabled: true,
            image: "arcade_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        bounty: {
            mode: "bounty",
            name: "Bounty",
            i18n: "game_mode_bounty",
            desc_i18n: "game_mode_desc_bounty",
            announce: "announcer_common_gamemode_bounty",
            enabled: false,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        ft: {
            mode: "ft",
            name: "Freeze Tag",
            i18n: "game_mode_ft",
            desc_i18n: "game_mode_desc_ft",
            announce: "announcer_common_gamemode_ft",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        ftc: {
            mode: "ftc",
            name: "Freeze Tag Classic",
            i18n: "game_mode_ftc",
            desc_i18n: "game_mode_desc_ftc",
            announce: "announcer_common_gamemode_ftc",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        survival: {
            mode: "survival",
            name: "Survival",
            i18n: "game_mode_survival",
            desc_i18n: "game_mode_desc_survival",
            announce: "announcer_common_gamemode_survival",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        tutorial: {
            mode: "tutorial",
            name: "tutorial",
            i18n: "game_mode_tutorial",
            desc_i18n: "game_mode_desc_tutorial",
            announce: "announcer_common_gamemode_tutorial",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/tdm.png.dds"
        },
        ffa: {
            mode: "ffa",
            name: "FFA",
            i18n: "game_mode_ffa",
            desc_i18n: "game_mode_desc_ffa",
            desc_instagib_i18n: "game_mode_desc_ffa_instagib",
            announce: "announcer_common_gamemode_ffa",
            enabled: true,
            image: "brawl_loop.jpg",
            icon: "/html/images/gamemodes/brawl.png.dds"
        }
    },
    CUSTOM_MODE_DEFINITIONS: {
        md_miniguffin: {
            i18n: "game_mode_custom_miniguffin",
            desc_i18n: "game_mode_custom_desc_miniguffin"
        }
    },
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
    battlepass_data: {
        test_bp: {
            season_nr: "0",
            "shop-image": "",
            "fullscreen-image": "",
            "bp-icon": "",
            "bp-icon-paid": "",
            "bp-icon-anim": "",
            "bp-color": "",
            title: "test_bp",
            price_basic: 1e3,
            price_bundle: 2800,
            price_level: 100
        },
        bp_season_1: {
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
        },
        bp_season_2: {
            season_nr: "2",
            "shop-image": "/html/customization_pack/battlepass_season_2.png",
            "fullscreen-image": "/html/images/backgrounds/battlepass_season_2.png",
            "bp-icon": "/html/images/icons/battlepass_free_season_2.png.dds",
            "bp-icon-paid": "/html/images/icons/battlepass_paid_season_2.png.dds",
            "bp-icon-anim": "/html/animations/battlepass_upgrade_season_2.webm",
            "bp-color": "#3688b5",
            title: "battlepass_2_title",
            price_basic: 1e3,
            price_bundle: 2800,
            price_level: 100
        },
        bp_season_3: {
            season_nr: "3",
            "shop-image": "/html/customization_pack/battlepass_season_3.png",
            "fullscreen-image": "/html/images/backgrounds/battlepass_season_3.png",
            "bp-icon": "/html/images/icons/battlepass_free_season_3.png.dds",
            "bp-icon-paid": "/html/images/icons/battlepass_paid_season_3.png.dds",
            "bp-icon-anim": "/html/animations/battlepass_upgrade_season_3.webm",
            "bp-icon-anim-sound": "ui_battlepass_upgrade_s3",
            "bp-color": "#38aaca",
            title: "battlepass_3_title",
            price_basic: 1e3,
            price_bundle: 2800,
            price_level: 100
        },
        bp_season_4: {
            season_nr: "4",
            "shop-image": "/html/customization_pack/battlepass_season_4.png",
            "fullscreen-image": "/html/images/backgrounds/battlepass_season_4.png",
            "bp-icon": "/html/images/icons/battlepass_free_season_4.png.dds",
            "bp-icon-paid": "/html/images/icons/battlepass_paid_season_4.png.dds",
            "bp-icon-anim": "/html/animations/battlepass_upgrade_season_4.webm",
            "bp-icon-anim-sound": "ui_battlepass_upgrade_s4",
            "bp-color": "#5bb9d4",
            title: "battlepass_4_title",
            price_basic: 1e3,
            price_bundle: 2800,
            price_level: 100
        },
        bp_season_5: {
            season_nr: "5",
            "shop-image": "/html/customization_pack/battlepass_season_5.png",
            "fullscreen-image": "/html/images/backgrounds/battlepass_season_5.png",
            "bp-icon": "/html/images/icons/battlepass_free_season_5.png.dds",
            "bp-icon-paid": "/html/images/icons/battlepass_paid_season_5.png.dds",
            "bp-icon-anim": "/html/animations/battlepass_upgrade_season_5.webm",
            "bp-icon-anim-sound": "ui_battlepass_upgrade_s4",
            "bp-color": "#5bb9d4",
            title: "battlepass_5_title",
            price_basic: 1e3,
            price_bundle: 2800,
            price_level: 100
        }
    },
    competitive_data: {
        season_1: {
            id: 94,
            season_nr: "1",
            enabled: true
        },
        season_2: {
            id: 95,
            season_nr: "2",
            enabled: true
        },
        season_3: {
            id: 97,
            season_nr: "3",
            enabled: true
        },
        season_4: {
            id: 98,
            season_nr: "4",
            enabled: true
        },
        season_5: {
            id: 99,
            season_nr: "5",
            enabled: true
        }
    },
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
    LOBBY_INIT_MODE: "ca",
    LOBBY_SETTINGS_LIST: {
        private: ["bool", true, true],
        name: ["string", "", ""],
        mode: ["string", "", ""],
        datacenter: ["string", "", ""],
        map_list: ["custom", [],
            []
        ],
        colors: ["custom", [],
            []
        ],
        team_names: ["custom", [],
            []
        ],
        time_limit: ["int", 0, 0],
        score_limit: ["int", 0, 0],
        team_count: ["int", 2, 2],
        team_size: ["int", 1, 1],
        instagib: ["int", 0, 0],
        hook: ["int", 0, 0],
        instaswitch: ["int", 0, 0],
        lifesteal: ["int", 0, 0],
        allow_queue: ["int", 1, 1],
        allow_map_voting: ["int", 1, 1],
        record_replay: ["int", 0, 0],
        continuous: ["int", 0, 0],
        auto_balance: ["int", 0, 0],
        intro: ["int", 0, 0],
        team_switching: ["int", 0, 0],
        physics: ["int", 0, 0],
        warmup_time: ["int", -1, -1],
        min_players: ["int", 1, 1],
        max_clients: ["int", 100, 100],
        model: ["int", 0, 0],
        netcode: ["int", 2, 2],
        max_ping: ["int", 0, 0],
        spawn_farthest_threshold: ["int", 3, 3],
        spawn_farthest_chance: ["float", 0, 0],
        spawn_farthest_foe_chance: ["float", 1, 1],
        spawn_random_chance: ["float", 0, 0],
        spawn_safety_radius: ["float", 0, 0],
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
        lobby_custom_intro: {
            name: "intro",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_physics: {
            name: "physics",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_insta_switch: {
            name: "instaswitch",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_lifesteal: {
            name: "lifesteal",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_instagib: {
            name: "instagib",
            cb_type: "select",
            type: "real"
        },
        lobby_custom_hook: {
            name: "hook",
            cb_type: "select",
            type: "real"
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
        lobby_custom_allow_queue: {
            name: "allow_queue",
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
    customization_group_map: {},
    customization_category_map: {
        profile: [new CustomizationType("avatar", ""), new CustomizationType("country", "")],
        character: [new CustomizationType("shell", ""), new CustomizationType("shoes", "l"), new CustomizationType("shoes", "r"), new CustomizationType("shield", "")],
        sticker: [new CustomizationType("sticker", "eyes"), new CustomizationType("sticker", "mouths"), new CustomizationType("sticker", "acces"), new CustomizationType("sticker", "misc"), new CustomizationType("sticker", "logos")],
        music: [new CustomizationType("music", "pu")],
        emote: [new CustomizationType("emote", "greeting"), new CustomizationType("emote", "taunt")],
        spray: [new CustomizationType("spray", "")],
        weapon: [new CustomizationType("weapon", "melee"), new CustomizationType("weapon", "mac"), new CustomizationType("weapon", "bl"), new CustomizationType("weapon", "ss"), new CustomizationType("weapon", "rl"), new CustomizationType("weapon", "shaft"), new CustomizationType("weapon", "cb"), new CustomizationType("weapon", "pncr"), new CustomizationType("weapon", "gl"), new CustomizationType("weapon", "vc")],
        weapon_attachment: [new CustomizationType("weapon_attachment", "melee"), new CustomizationType("weapon_attachment", "mac"), new CustomizationType("weapon_attachment", "bl"), new CustomizationType("weapon_attachment", "ss"), new CustomizationType("weapon_attachment", "rl"), new CustomizationType("weapon_attachment", "shaft"), new CustomizationType("weapon_attachment", "cb"), new CustomizationType("weapon_attachment", "pncr"), new CustomizationType("weapon_attachment", "gl"), new CustomizationType("weapon_attachment", "vc")]
    },
    flat_bg_scene_screens: ["coin_shop", "notification", "battlepass", "shop", "shop_item", "player_profile", "locker"],
    map_names: {},
    sniper_zoom_indexes: []
});