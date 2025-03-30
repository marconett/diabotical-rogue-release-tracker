global_components["game_intro"] = new MenuComponent("game_intro", (function() {
    on_match_manifest_handlers.push((manifest => {
        _empty(_id("game_intro_mode"));
        _empty(_id("game_intro_map"));
        _empty(_id("game_intro_map_author"));
        const mode_data = GAME.get_data("game_mode_map", manifest.mode);
        if (mode_data) _id("game_intro_mode").textContent = localize(mode_data.i18n);
        _id("game_intro_map").textContent = _format_map_name(manifest.map, manifest.map_name);
        let map_author = "";
        if (typeof MAP_AUTHORS === "object" && manifest.map in MAP_AUTHORS) map_author = MAP_AUTHORS[manifest.map];
        else if (manifest.map_author && manifest.map_author.length) map_author = manifest.map_author;
        if (map_author.length) _id("game_intro_map_author").textContent = localize_ext("map_by_author", {
            name: map_author
        });
        let server = "";
        if (manifest.location in global_datacenter_map) {
            server += localize(global_datacenter_map[manifest.location].i18n);
            if (global_datacenter_map[manifest.location].provider.length) server += " - " + global_datacenter_map[manifest.location].provider
        }
        _id("game_intro_server").textContent = server;
        _id("game_intro_screen").style.display = "flex"
    }))
}));