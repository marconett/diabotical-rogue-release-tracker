class MenuHistory {
    current_index = 0;
    constructor() {
        this.history = [{
            page: "home"
        }]
    }
    push(obj) {
        if (!("page" in obj)) return;
        if (this.current_index != this.history.length - 1) {
            this.history.length = this.current_index + 1
        }
        this.history.push(obj);
        this.current_index = this.history.length - 1
    }
    back() {
        if (this.current_index == 0) return null;
        this.current_index--;
        return this.history[this.current_index]
    }
    forward() {
        if (this.current_index == this.history.length - 1) return null;
        this.current_index++;
        return this.history[this.current_index]
    }
    current() {
        return this.history[this.current_index]
    }
    current_idx() {
        return this.current_index
    }
    reset(current_page) {
        this.history.length = 0;
        this.history.push({
            page: current_page
        });
        this.current_index = 0
    }
    replace_current(obj) {
        if (!("page" in obj)) return;
        this.history[this.current_index] = obj
    }
    remove_page(page) {
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i].page === page) {
                if (this.current_index === i) continue;
                this.history.splice(i, 1);
                if (this.current_index > i) {
                    this.current_index--
                }
            }
        }
    }
}
var global_history = new MenuHistory;
var global_popstate = false;
var global_on_history_pop_state = [];

function historyPushState(obj) {
    if (global_popstate) {
        global_popstate = false
    } else {
        let current = global_history.current();
        if (current) {
            if (current.page === obj.page) {
                if (!obj.hasOwnProperty("category") && !current.hasOwnProperty("category")) {
                    return
                } else if (obj.hasOwnProperty("category") && current.hasOwnProperty("category") && obj.category === current.category) {
                    return
                }
            }
        }
        global_history.push(obj)
    }
}

function historyBack() {
    let obj = global_history.back();
    if (obj == null) {
        if (global_menu_page === "progression") {
            close_menu(false, true)
        } else {
            close_menu()
        }
        return
    }
    if (Object.keys(_living_select_lists_ids).length) {
        close_all_selects()
    }
    historyOnPopState(obj)
}

function historyForward() {
    let obj = global_history.forward();
    if (obj == null) return;
    if (Object.keys(_living_select_lists_ids).length) {
        close_all_selects()
    }
    historyOnPopState(obj)
}

function historyOnPopState(obj, silent) {
    if (obj == null) return;
    if (!("page" in obj)) return;
    global_popstate = true;
    if (silent) obj.silent = true;
    obj.onPopState = true;
    open_screen(obj.page, obj);
    global_popstate = false;
    for (let cb of global_on_history_pop_state) {
        if (typeof cb === "function") cb(obj)
    }
}

function historyFirstEntry(page) {
    let current = global_history.current();
    if (global_history.current_idx() === 0 && current && current.page === page) {
        return true
    }
    return false
}