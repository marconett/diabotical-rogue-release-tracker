var current_tos_version = 1;
var tos_accept_version = -1;

function displayTOS() {
    console.log("tos_accept_version: " + tos_accept_version + " current_tos_version: " + current_tos_version);
    engine.call("lock_console");
    _id("main_menu").classList.add("disabled");
    _id("tos-accept-container").style.display = "flex";
    refreshScrollbar(_id("tos-accept-container").querySelector(".scroll-outer"))
}

function acceptedTOS() {
    update_variable("real", "lobby_accepted_tos", current_tos_version);
    console.log("tos_accept_version: " + tos_accept_version + " current_tos_version: " + current_tos_version);
    hideTOS();
    engine.call("unlock_console")
}

function hideTOS() {
    _id("main_menu").classList.remove("disabled");
    _id("tos-accept-container").style.display = "none"
}