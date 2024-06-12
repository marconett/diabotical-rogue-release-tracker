global_components["region_select"] = new MenuComponent("region_select", _id("region_select_modal_screen"), (function() {
    region_select_modal.init()
}));
const region_select_modal = new function() {
    let region_ids = [];
    let html = {
        root: null,
        list: null,
        count: null,
        refresh: null
    };
    this.init = () => {
        html.root = _id("region_select_modal_screen");
        html.list = html.root.querySelector(".list");
        Servers.on_location_ping_update_state_handlers.push((active => {
            if (active) {
                html.refresh.classList.add("active")
            } else {
                html.refresh.classList.remove("active")
            }
        }));
        Servers.on_locations_init_handlers.push((() => {
            render_server_locations()
        }));
        Servers.on_location_ping_update_handlers.push((() => {
            update_pings()
        }));
        Servers.on_set_locations_handlers.push((() => {
            update_checkboxes()
        }));
        Servers.on_set_regions_handlers.push((() => {
            update_checkboxes()
        }));
        Servers.on_expand_search_update_handlers.push((bool => {}))
    };

    function render_server_locations() {
        _empty(html.list);
        let selection_type = GAME.get_data("location_selection_type");
        let count_row = _createElement("div", "row");
        let count_row_count = _createElement("div", "count");
        let refresh = _createElement("div", "refresh");
        count_row.appendChild(count_row_count);
        count_row.appendChild(refresh);
        html.list.appendChild(count_row);
        refresh.addEventListener("click", (() => {
            Servers.ping_locations()
        }));
        html.count = count_row_count;
        html.refresh = refresh;
        region_ids = [];
        if (selection_type === 2) {
            for (let region_id in global_region_map) {
                if (global_region_map[region_id].parent_region_id) continue;
                if (!(region_id in Servers.regions)) continue;
                region_ids.push(region_id)
            }
        } else {
            let regions_with_children = {};
            for (let region_id in global_region_map) {
                if (global_region_map[region_id].parent_region_id) {
                    regions_with_children[global_region_map[region_id].parent_region_id] = true
                }
            }
            for (let region_id in global_region_map) {
                if (region_id in regions_with_children) continue;
                if (!(region_id in Servers.regions)) continue;
                region_ids.push(region_id)
            }
        }
        region_ids.sort();
        if (selection_type === 2 || selection_type === 3) {
            for (let region_id of region_ids) {
                let region = _createElement("div", "row");
                region.dataset.id = global_region_map[region_id].id;
                let checkbox = _createElement("div", "checkbox");
                region.appendChild(checkbox);
                region.appendChild(_createElement("div", "name", global_region_map[region_id].i18n ? localize(global_region_map[region_id].i18n) : global_region_map[region_id].name));
                region.appendChild(_createElement("div", "icon"));
                region.appendChild(_createElement("div", "ping", 999));
                html.list.appendChild(region);
                region.addEventListener("click", (() => {
                    if (!bool_am_i_leader) return;
                    if (checkbox.classList.contains("checkbox_enabled")) {
                        _play_cb_uncheck();
                        Servers.remove_from_region_selection(global_region_map[region_id].id)
                    } else {
                        _play_cb_check();
                        Servers.add_to_region_selection(global_region_map[region_id].id)
                    }
                    update_checkboxes()
                }));
                region.addEventListener("mouseenter", (() => {
                    checkbox.classList.add("hover")
                }));
                region.addEventListener("mouseleave", (() => {
                    checkbox.classList.remove("hover")
                }))
            }
        } else if (selection_type === 1) {
            for (let region_id of region_ids) {
                for (let ds of Servers.regions[region_id]) {
                    let ds_data = null;
                    if (ds in global_datacenter_map) ds_data = global_datacenter_map[ds];
                    let option_name = (global_region_map[region_id].i18n ? localize(global_region_map[region_id].i18n) : global_region_map[region_id].name) + "/" + (ds_data ? localize(ds_data.i18n) : localize("datacenter_" + ds));
                    let datacenter = _createElement("div", "row");
                    datacenter.dataset.id = location_id;
                    let checkbox = _createElement("div", "checkbox");
                    region.appendChild(checkbox);
                    region.appendChild(_createElement("div", "name", option_name));
                    region.appendChild(_createElement("div", "icon"));
                    region.appendChild(_createElement("div", "ping", 999));
                    html.list.appendChild(datacenter);
                    datacenter.addEventListener("click", (() => {
                        if (!bool_am_i_leader) return;
                        if (checkbox.classList.contains("checkbox_enabled")) {
                            _play_cb_uncheck();
                            Servers.remove_from_location_selection(location_id)
                        } else {
                            _play_cb_check();
                            Servers.add_to_location_selection(location_id)
                        }
                        update_checkboxes()
                    }));
                    datacenter.addEventListener("mouseenter", (() => {
                        checkbox.classList.add("hover")
                    }));
                    datacenter.addEventListener("mouseleave", (() => {
                        checkbox.classList.remove("hover")
                    }))
                }
            }
        }
        update_checkboxes()
    }

    function update_checkboxes() {
        let selection_type = GAME.get_data("location_selection_type");
        let checked = 0;
        let total = 0;
        if (selection_type === 1) {
            _for_each_with_selector_in_parent(html.root, ".row", (function(row) {
                let cb = row.querySelector(".checkbox");
                if (!cb) return;
                if (Servers.selected_locations.has(row.dataset.id)) {
                    cb.classList.add("checkbox_enabled");
                    checked++
                } else {
                    cb.classList.remove("checkbox_enabled")
                }
                total++
            }))
        } else {
            _for_each_with_selector_in_parent(html.root, ".row", (function(row) {
                let cb = row.querySelector(".checkbox");
                if (!cb) return;
                if (Servers.selected_regions.has(row.dataset.id)) {
                    cb.classList.add("checkbox_enabled");
                    checked++
                } else {
                    cb.classList.remove("checkbox_enabled")
                }
                total++
            }))
        }
        if (html.count) {
            html.count.textContent = "(" + checked + "/" + total + ")"
        }
    }

    function update_pings() {
        let region_pings = {};
        for (let region_id of region_ids) {
            if (!(region_id in global_region_map)) continue;
            let max = null;
            let min = null;
            for (let location_id of Servers.regions[region_id]) {
                if (location_id in Servers.locations && Servers.locations[location_id].ping !== -1) {
                    if (max === null || Servers.locations[location_id].ping > max) max = Servers.locations[location_id].ping;
                    if (min === null || Servers.locations[location_id].ping < min) min = Servers.locations[location_id].ping
                }
            }
            region_pings[global_region_map[region_id].id] = {};
            if (max !== null) region_pings[global_region_map[region_id].id].max = Math.floor(max * 1e3);
            if (min !== null) region_pings[global_region_map[region_id].id].min = Math.floor(min * 1e3)
        }
        _for_each_with_selector_in_parent(html.root, ".row", (function(el) {
            let ping_val = -1;
            let ping = "N/A";
            if (el.dataset.id in Servers.locations) {
                ping_val = Number(Servers.locations[el.dataset.id].ping);
                if (ping_val == -1) {
                    ping = "N/A"
                } else {
                    ping_val = Math.floor(ping_val * 1e3);
                    ping = ping_val
                }
            } else if (el.dataset.id in region_pings && "min" in region_pings[el.dataset.id]) {
                ping_val = region_pings[el.dataset.id].min;
                ping = ping_val
            }
            let ping_el = el.querySelector(".ping");
            if (ping_el) {
                ping_el.textContent = ping
            }
            let icon_el = el.querySelector(".icon");
            if (icon_el) {
                if (ping_val == -1) {
                    icon_el.classList.add("red")
                } else if (ping_val < 45) {
                    icon_el.classList.add("green")
                } else if (ping_val < 90) {
                    icon_el.classList.add("yellow")
                } else if (ping_val < 130) {
                    icon_el.classList.add("orange")
                } else {
                    icon_el.classList.add("red")
                }
            }
        }))
    }
    this.close = () => {
        close_modal_screen(null, html.root.id)
    }
};