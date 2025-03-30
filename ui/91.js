function setup_toggle(el, bool_default, cb) {
    let circle = el.querySelector(".circle");
    let animation_in_progress = false;
    if (bool_default) {
        el.dataset.value = "1";
        circle.classList.add("on")
    } else {
        el.dataset.value = "0"
    }
    el.addEventListener("click", (() => {
        if (el.classList.contains("locked")) return;
        if (animation_in_progress) return;
        if (el.dataset.value === "1") {
            circle.classList.remove("anim_on");
            circle.classList.add("anim_off");
            if (typeof cb === "function") cb(el, false)
        } else {
            circle.classList.remove("anim_off");
            circle.classList.add("anim_on");
            if (typeof cb === "function") cb(el, true)
        }
    }));
    circle.addEventListener("animationstart", (event => {
        animation_in_progress = true
    }));
    circle.addEventListener("animationend", (event => {
        if (event.animationName === "toggle_on") {
            el.dataset.value = "1";
            circle.classList.add("on");
            circle.classList.remove("anim_on")
        }
        if (event.animationName === "toggle_off") {
            el.dataset.value = "0";
            circle.classList.remove("on");
            circle.classList.remove("anim_off")
        }
        animation_in_progress = false
    }))
}

function set_toggle(el, bool, instant) {
    if (bool && el.dataset.value && el.dataset.value === "1") return;
    if (!bool && el.dataset.value && el.dataset.value === "0") return;
    let circle = el.querySelector(".circle");
    if (instant) {
        if (bool) {
            el.dataset.value = "1";
            circle.classList.add("on")
        } else {
            el.dataset.value = "0";
            circle.classList.remove("on")
        }
    } else {
        if (bool) {
            el.dataset.value = "1";
            circle.classList.remove("anim_off");
            circle.classList.add("anim_on")
        } else {
            el.dataset.value = "0";
            circle.classList.remove("anim_on");
            circle.classList.add("anim_off")
        }
    }
}