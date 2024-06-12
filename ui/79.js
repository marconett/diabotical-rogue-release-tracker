const USE_TESTSERVER_ONLY = false;
const global_region_map = {
    eu: {
        id: "eu",
        i18n: "region_eu",
        name: "Europe",
        parent_region_id: null
    },
    ru: {
        id: "ru",
        i18n: "region_ru",
        name: "Russia",
        parent_region_id: null
    },
    na: {
        id: "na",
        i18n: "region_na",
        name: "North America",
        parent_region_id: null
    },
    sa: {
        id: "sa",
        i18n: "region_sa",
        name: "South America",
        parent_region_id: null
    },
    as: {
        id: "as",
        i18n: "region_as",
        name: "Asia",
        parent_region_id: null
    },
    me: {
        id: "me",
        i18n: "region_me",
        name: "Middle East",
        parent_region_id: null
    },
    af: {
        id: "af",
        i18n: "region_af",
        name: "Africa",
        parent_region_id: null
    },
    oc: {
        id: "oc",
        i18n: "region_oc",
        name: "Oceania",
        parent_region_id: null
    },
    "eu-west": {
        id: "eu-west",
        i18n: "region_eu_west",
        name: "EU-West",
        parent_region_id: "eu"
    },
    "eu-east": {
        id: "eu-east",
        i18n: "region_eu_east",
        name: "EU-East",
        parent_region_id: "eu"
    },
    "eu-russia": {
        id: "eu-russia",
        i18n: "region_eu_russia",
        name: "EU-Russia",
        parent_region_id: "ru"
    },
    "na-west": {
        id: "na-west",
        i18n: "region_na_west",
        name: "NA-West",
        parent_region_id: "na"
    },
    "na-east": {
        id: "na-east",
        i18n: "region_na_east",
        name: "NA-East",
        parent_region_id: "na"
    },
    "na-central": {
        id: "na-central",
        i18n: "region_na_central",
        name: "NA-Central",
        parent_region_id: "na"
    },
    test: {
        id: "test",
        i18n: "datacenter_tes",
        name: "Test",
        parent_region_id: null
    }
};
const global_datacenter_map = {
    direct: {
        type: 2,
        flag: "",
        i18n: "datacenter_direct",
        provider: "",
        name: "Direct Connection"
    },
    online: {
        type: 2,
        flag: "",
        i18n: "datacenter_direct_online",
        provider: "",
        name: "Direct Connection - ONLINE"
    },
    lan: {
        type: 2,
        flag: "",
        i18n: "datacenter_direct_lan",
        provider: "",
        name: "Direct Connection - LAN"
    },
    tes: {
        type: 3,
        flag: "nl",
        i18n: "datacenter_tes",
        provider: "i3D.net",
        name: "Test Location"
    },
    ash: {
        type: 1,
        flag: "us",
        i18n: "datacenter_ash",
        provider: "i3D.net",
        name: "Ashburn"
    },
    bue: {
        type: 1,
        flag: "ar",
        i18n: "datacenter_bue",
        provider: "i3D.net",
        name: "Buenos Aires"
    },
    chi: {
        type: 1,
        flag: "us",
        i18n: "datacenter_chi",
        provider: "i3D.net",
        name: "Chicago"
    },
    cla: {
        type: 1,
        flag: "us",
        i18n: "datacenter_cla",
        provider: "i3D.net",
        name: "Santa Clara"
    },
    dal: {
        type: 1,
        flag: "us",
        i18n: "datacenter_dal",
        provider: "i3D.net",
        name: "Dallas"
    },
    dub: {
        type: 1,
        flag: "ae",
        i18n: "datacenter_dub",
        provider: "i3D.net",
        name: "Dubai"
    },
    fra: {
        type: 1,
        flag: "de",
        i18n: "datacenter_fra",
        provider: "i3D.net",
        name: "Frankfurt"
    },
    hon: {
        type: 1,
        flag: "hk",
        i18n: "datacenter_hon",
        provider: "i3D.net",
        name: "Hong Kong"
    },
    ist: {
        type: 1,
        flag: "tr",
        i18n: "datacenter_ist",
        provider: "i3D.net",
        name: "Istanbul"
    },
    joh: {
        type: 1,
        flag: "za",
        i18n: "datacenter_joh",
        provider: "i3D.net",
        name: "Johannesburg"
    },
    lon: {
        type: 1,
        flag: "gb",
        i18n: "datacenter_lon",
        provider: "Nitrado Enterprise",
        name: "London"
    },
    los: {
        type: 1,
        flag: "us",
        i18n: "datacenter_los",
        provider: "i3D.net",
        name: "Los Angeles"
    },
    mad: {
        type: 1,
        flag: "es",
        i18n: "datacenter_mad",
        provider: "i3D.net",
        name: "Madrid"
    },
    mia: {
        type: 1,
        flag: "us",
        i18n: "datacenter_mia",
        provider: "Nitrado Enterprise",
        name: "Miami"
    },
    mos: {
        type: 1,
        flag: "ru",
        i18n: "datacenter_mos",
        provider: "i3D.net",
        name: "Moscow"
    },
    mum: {
        type: 1,
        flag: "in",
        i18n: "datacenter_mum",
        provider: "i3D.net",
        name: "Mumbai"
    },
    par: {
        type: 1,
        flag: "fr",
        i18n: "datacenter_par",
        provider: "i3D.net",
        name: "Paris"
    },
    rot: {
        type: 1,
        flag: "nl",
        i18n: "datacenter_rot",
        provider: "i3D.net",
        name: "Rotterdam"
    },
    san: {
        type: 1,
        flag: "cl",
        i18n: "datacenter_san",
        provider: "EdgeUno",
        name: "Santiago"
    },
    sao: {
        type: 1,
        flag: "br",
        i18n: "datacenter_sao",
        provider: "i3D.net",
        name: "São Paulo"
    },
    sea: {
        type: 1,
        flag: "us",
        i18n: "datacenter_sea",
        provider: "i3D.net",
        name: "Seattle"
    },
    sin: {
        type: 1,
        flag: "sg",
        i18n: "datacenter_sin",
        provider: "i3D.net",
        name: "Singapore"
    },
    syd: {
        type: 1,
        flag: "au",
        i18n: "datacenter_syd",
        provider: "i3D.net",
        name: "Sydney"
    },
    tok: {
        type: 1,
        flag: "jp",
        i18n: "datacenter_tok",
        provider: "i3D.net",
        name: "Tokyo"
    },
    war: {
        type: 1,
        flag: "pl",
        i18n: "datacenter_war",
        provider: "i3D.net",
        name: "Warsaw"
    },
    yek: {
        type: 1,
        flag: "ru",
        i18n: "datacenter_yek",
        provider: "G-Core Labs",
        name: "Yekaterinburg"
    }
};
const Servers = new function() {
    this.locations = {};
    this.regions = {};
    this.server_locations_initialized = false;
    this.selected_locations = new Set;
    this.selected_regions = new Set;
    this.expand_search = true;
    this.on_expand_search_update_handlers = [];
    this.known_server_locations = [];
    this.on_locations_init_handlers = [];
    this.on_location_ping_update_handlers = [];
    this.on_location_ping_update_state_handlers = [];
    this.on_set_locations_handlers = [];
    this.on_set_regions_handlers = [];
    let ping_update_in_progress = false;
    this.init = json_loc_data => {
        try {
            data = JSON.parse(json_loc_data)
        } catch (e) {
            console.log("Error parsing location JSON. err=" + e)
        }
        if (!this.server_locations_initialized) {
            this.regions = {};
            this.locations = {};
            for (let ds of data) {
                if (ds.location.length == 0 && ds.region.length == 0) continue;
                if (USE_TESTSERVER_ONLY && ds.code !== "tes") continue;
                let region_id = ds.region.toLowerCase();
                if (region_id in global_region_map && global_region_map[region_id].parent_region_id) {
                    if (!(global_region_map[region_id].parent_region_id in this.regions)) {
                        this.regions[global_region_map[region_id].parent_region_id] = []
                    }
                    this.regions[global_region_map[region_id].parent_region_id].push(ds.code)
                }
                if (!(region_id in this.regions)) {
                    this.regions[region_id] = []
                }
                this.regions[region_id].push(ds.code);
                this.locations[ds.code] = {
                    name: ds.location,
                    ping: ds.ping,
                    region: region_id
                }
            }
            this.server_locations_initialized = true;
            for (let cb of this.on_locations_init_handlers) {
                if (typeof cb === "function") cb(this.regions, this.locations)
            }
            this.ping_locations()
        } else {
            this.update_pings(data)
        }
    };
    let update_ping_timeout = null;
    this.update_pings = data => {
        if (update_ping_timeout !== null) clearTimeout(update_ping_timeout);
        update_ping_timeout = setTimeout((() => {
            update_ping_timeout = null;
            ping_update_in_progress = false;
            for (let cb of this.on_location_ping_update_state_handlers) {
                if (typeof cb === "function") cb(false)
            }
            engine.call("initialize_select_value", "lobby_custom_datacenter")
        }), 500);
        for (let loc of data) {
            if (loc.location.length == 0 && loc.region.length == 0) continue;
            if (loc.code in this.locations) {
                this.locations[loc.code].ping = parseFloat(loc.ping)
            } else {
                this.locations[loc.code] = {
                    name: loc.location,
                    ping: parseFloat(loc.ping),
                    region: loc.region
                }
            }
        }
        for (let cb of this.on_location_ping_update_handlers) {
            if (typeof cb === "function") cb()
        }
    };
    this.set_location_selection = locations_string => {
        let locations = locations_string.split(":");
        let added_server_to_selection = false;
        for (let loc in this.locations) {
            if (!this.known_server_locations.includes(loc)) {
                if (Number(this.locations[loc].ping) < 0) continue;
                if (!locations.includes(loc) && Number(this.locations[loc].ping) <= .065) {
                    locations.push(loc);
                    added_server_to_selection = true
                }
                this.known_server_locations.push(loc)
            }
        }
        update_variable("string", "lobby_regions_known", this.known_server_locations.join(":"));
        this.selected_locations.clear();
        for (let loc of locations) {
            if (loc.length) {
                this.selected_locations.add(loc)
            }
        }
        for (let cb of this.on_set_locations_handlers) {
            if (typeof cb === "function") cb(this.selected_locations)
        }
        if (added_server_to_selection) {
            send_selection_to_ms("locations")
        }
    };
    this.set_region_selection = regions_string => {
        let regions = regions_string.split(":");
        let missing_regions = false;
        this.selected_regions.clear();
        for (let region_id of regions) {
            if (region_id.length) {
                if (region_id in this.regions) {
                    this.selected_regions.add(region_id)
                } else {
                    missing_regions = true
                }
            }
        }
        if (missing_regions && bool_am_i_leader) {
            queue_send_selection_to_ms("regions")
        }
        for (let cb of this.on_set_regions_handlers) {
            if (typeof cb === "function") cb(this.selected_regions)
        }
    };
    this.ping_locations = () => {
        if (ping_update_in_progress) return;
        ping_update_in_progress = true;
        for (let cb of this.on_location_ping_update_state_handlers) {
            if (typeof cb === "function") cb(true)
        }
        engine.call("request_locations_ping")
    };
    this.get_best_locations_by_ping = () => {
        let get_best_server_locations_under_ping = (max_ping_ms, out_array) => {
            for (let location in this.locations) {
                if (USE_TESTSERVER_ONLY && location !== "tes") continue;
                if (this.locations[location].ping == -1 || this.locations[location].ping == "-1") continue;
                if (!USE_TESTSERVER_ONLY && location in global_datacenter_map && global_datacenter_map[location].type !== 1) continue;
                if (Number(this.locations[location].ping) >= 0 && Number(this.locations[location].ping) <= max_ping_ms / 1e3) {
                    out_array.push(location)
                }
            }
        };
        let best_locations = [];
        get_best_server_locations_under_ping(65, best_locations);
        if (best_locations.length < 2) {
            get_best_server_locations_under_ping(90, best_locations)
        }
        if (best_locations.length == 0) {
            get_best_server_locations_under_ping(120, best_locations)
        }
        best_locations.sort(((a, b) => {
            if (this.locations[a].ping > this.locations[b].ping) return 1;
            return -1
        }));
        return best_locations
    };
    this.get_best_region_by_ping = () => {
        let tmp = [];
        for (let location in this.locations) {
            if (USE_TESTSERVER_ONLY && location !== "tes") continue;
            if (this.locations[location].ping == -1 || this.locations[location].ping == "-1") continue;
            if (!USE_TESTSERVER_ONLY && location in global_datacenter_map && global_datacenter_map[location].type !== 1) continue;
            tmp.push(this.locations[location])
        }
        tmp.sort(((a, b) => {
            if (a.ping > b.ping) return 1;
            return -1
        }));
        if (tmp.length) {
            return tmp[0].region
        }
        return ""
    };
    this.add_to_location_selection = location => {
        this.selected_locations.add(location);
        queue_send_selection_to_ms("locations")
    };
    this.remove_from_location_selection = location => {
        this.selected_locations.delete(location);
        queue_send_selection_to_ms("locations")
    };
    this.add_to_region_selection = region => {
        this.selected_regions.add(region);
        queue_send_selection_to_ms("regions")
    };
    this.remove_from_region_selection = region => {
        this.selected_regions.delete(region);
        queue_send_selection_to_ms("regions")
    };
    let queued_send_selection = null;
    let queue_send_selection_to_ms = type => {
        if (queued_send_selection !== null) {
            clearTimeout(queued_send_selection)
        }
        queued_send_selection = setTimeout((() => {
            send_selection_to_ms(type)
        }))
    };
    let send_selection_to_ms = type => {
        if (bool_am_i_leader) {
            if (type === "locations") {
                send_string(CLIENT_COMMAND_SET_PARTY_LOCATIONS, Array.from(this.selected_locations).join(":"))
            } else if (type === "regions") {
                send_string(CLIENT_COMMAND_SET_PARTY_REGIONS, Array.from(this.selected_regions).join(":"))
            }
        }
    };
    this.set_expand_search = (bool, inform_master) => {
        if (typeof bool == "string") {
            this.expand_search = bool == "true" ? true : false
        } else if (typeof bool == "boolean") {
            this.expand_search = bool
        } else {
            this.expand_search = true
        }
        for (let cb of this.on_expand_search_update_handlers) {
            if (typeof cb === "function") cb(this.expand_search)
        }
        if (inform_master) {
            send_string(CLIENT_COMMAND_SET_PARTY_EXPAND_SEARCH, "" + this.expand_search)
        }
    };
    this.reset = () => {
        this.server_locations_initialized = false
    }
};

function locations_to_string(locations) {
    if (locations === null || !locations) {
        return ""
    }
    if (locations.length === 1 && locations[0] in Servers.locations) {
        return localize("datacenter_" + locations[0])
    }
    let regions = {};
    let wide_regions = {};
    for (let l of locations) {
        if (!(l in Servers.locations)) continue;
        let region = Servers.locations[l].region;
        if (!(region in regions)) regions[region] = 0;
        regions[region] ++;
        let wide_region = "";
        if (region.toLowerCase() === "africa") wide_region = "Africa";
        else if (region.toLowerCase() === "asia") wide_region = "Asia";
        else if (region.toLowerCase() === "middle east") wide_region = "Middle East";
        else if (region.toLowerCase() === "oceania") wide_region = "Oceania";
        else if (region.toLowerCase() === "sa") wide_region = "South America";
        else if (region.startsWith("NA-")) wide_region = "North America";
        else if (region.startsWith("EU-")) wide_region = "Europe";
        if (!(wide_region in wide_regions)) wide_regions[wide_region] = 0;
        wide_regions[wide_region] ++
    }
    if (Object.keys(regions).length === 1) {
        for (let region in regions) {
            return region
        }
    }
    if (Object.keys(wide_regions).length === 1) {
        for (let wide_region in wide_regions) {
            return wide_region
        }
    } else if (Object.keys(wide_regions).length > 2) {
        return "Intercontinental"
    } else {
        let list = [];
        for (let wide_region in wide_regions) {
            list.push(wide_region)
        }
        return list.join("/")
    }
}