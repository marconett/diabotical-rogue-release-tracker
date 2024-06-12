const TEAM_COLORS = {
    own: "000000",
    own_dark: "000000",
    own_darker: "000000",
    enemy: "000000",
    enemy_dark: "000000",
    enemy_darker: "000000"
};

function set_team_color(team, color) {
    if (team === 0) {
        TEAM_COLORS["own"] = color.replace("#", "");
        TEAM_COLORS["own_dark"] = rgbToHex(multiplyRGB(hexToRGB(color), .75));
        TEAM_COLORS["own_darker"] = rgbToHex(multiplyRGB(hexToRGB(color), .33))
    }
    if (team === 1) {
        TEAM_COLORS["enemy"] = color.replace("#", "");
        TEAM_COLORS["enemy_dark"] = rgbToHex(multiplyRGB(hexToRGB(color), .75));
        TEAM_COLORS["enemy_darker"] = rgbToHex(multiplyRGB(hexToRGB(color), .33))
    }
}

function get_own_colors() {
    return {
        color: TEAM_COLORS["own"],
        color_dark: TEAM_COLORS["own_dark"],
        color_darker: TEAM_COLORS["own_darker"]
    }
}

function get_enemy_colors() {
    return {
        color: TEAM_COLORS["enemy"],
        color_dark: TEAM_COLORS["enemy_dark"],
        color_darker: TEAM_COLORS["enemy_darker"]
    }
}

function hexToRGB(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (function(m, r, g, b) {
        return r + r + g + g + b + b
    }));
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

function multiplyRGB(rgb, multiply) {
    if (!rgb) return null;
    if (!("r" in rgb)) return null;
    if (!("g" in rgb)) return null;
    if (!("b" in rgb)) return null;
    rgb.r = parseInt(rgb.r * multiply);
    rgb.g = parseInt(rgb.g * multiply);
    rgb.b = parseInt(rgb.b * multiply);
    return rgb
}

function rgbToHex(rgb) {
    let hex = rgb.r << 16 | rgb.g << 8 | rgb.b << 0;
    return (16777216 + hex).toString(16).slice(1)
}