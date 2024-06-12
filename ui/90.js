function context_menu(e, options) {
    e.preventDefault();
    let mainmenu = _id("main_menu");
    let menu = document.createElement("div");
    menu.id = "context_menu";
    menu.addEventListener("mousedown", (function(e) {
        e.stopPropagation()
    }));
    for (let i = 0; i < options.length; i++) {
        let option = document.createElement("div");
        option.classList.add("context_option");
        option.innerHTML = options[i].text;
        option.addEventListener("mouseup", (function(e) {
            if (e.button == 0) {
                options[i].callback();
                context_menu_outside_click()
            }
        }));
        menu.appendChild(option);
        if (i < options.length - 1) {
            let hr = document.createElement("div");
            hr.classList.add("hr");
            menu.appendChild(hr)
        }
    }
    menu.style.top = e.clientY + "px";
    menu.style.left = 5 + e.clientX + "px";
    menu.style.visibility = "hidden";
    mainmenu.appendChild(menu);
    setTimeout((function() {
        let menu_rect = menu.getBoundingClientRect();
        let mainmenu_rect = menu.getBoundingClientRect();
        if (e.clientY + menu_rect.height + 50 > mainmenu_rect.height) {
            menu.style.top = e.clientY - menu_rect.height - 5 + "px";
            menu.style.visibility = "visible"
        } else {
            menu.style.visibility = "visible"
        }
        mainmenu.addEventListener("mousedown", context_menu_outside_click)
    }), 0)
}

function context_menu_outside_click() {
    _remove_node(_id("context_menu"));
    _id("main_menu").removeEventListener("mousedown", context_menu_outside_click)
}