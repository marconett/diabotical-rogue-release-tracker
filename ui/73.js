const global_notifs = new function() {
    let queue = [];
    let notif_ids = {};
    let handlers = [];
    this.addNotification = notif => {
        if (notif.notif_id in notif_ids) {
            return
        }
        queue.push(notif);
        notif_ids[notif.notif_id] = true;
        for (let cb of handlers) {
            if (typeof cb === "function") cb()
        }
    };
    this.getNotification = () => {
        if (queue.length) return JSON.parse(JSON.stringify(queue[0]));
        return undefined
    };
    this.confirmNotification = notif => {
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].notif_id === notif.notif_id) {
                queue.splice(i, 1);
                break
            }
        }
        delete notif_ids[notif.notif_id]
    };
    this.getNotificationCount = () => queue.length;
    this.clearNotifications = () => {
        queue = [];
        notif_ids = {}
    };
    this.addNotificationHandler = cb => {
        if (typeof cb === "function") {
            handlers.push(cb)
        } else {
            console.error("addNotificationHandler not a function!")
        }
    }
};

function init_notifications() {
    GAME.add_deactivate_callback((() => {
        global_notifs.clearNotifications()
    }));
    bind_event("test_battlepass_upgrade_notif", (function() {
        global_notifs.addNotification({
            notif_id: 181,
            notif_type: 0,
            from_user_id: null,
            message: null,
            items: []
        })
    }));
    bind_event("test_item_unlock_notif", (function() {
        console.log("test_item_unlock_notif");
        global_notifs.addNotification({
            notif_id: randomInt(100, 500),
            notif_type: 4,
            from_user_id: null,
            message: null,
            items: [{
                customization_id: "",
                customization_type: 6,
                customization_sub_type: "rl",
                customization_set_id: null,
                rarity: 3,
                amount: 1,
                seen: false
            }]
        })
    }));
    bind_event("test_tournament_result", (function() {
        global_notifs.addNotification({
            notif_id: 48,
            notif_type: 6,
            user_id: "78edd912cdc84ba899a6bbc60616e97c",
            from_user_id: null,
            message: '{"placement":1,"placement_to":null,"tourney_id":"e21aa64c-c686-415b-8027-c1cf61e8bd33","tourney_name":"small test tourney"}',
            items: []
        });
        global_notifs.addNotification({
            notif_id: 49,
            notif_type: 5,
            user_id: "78edd912cdc84ba899a6bbc60616e97c",
            from_user_id: null,
            message: null,
            items: [{
                customization_id: "se_vic",
                customization_type: 11,
                customization_sub_type: "",
                customization_set_id: null,
                rarity: 3,
                amount: 1,
                seen: false
            }, {
                customization_id: "av_smileyblue",
                customization_type: 2,
                customization_sub_type: "",
                customization_set_id: null,
                rarity: 0,
                amount: 1
            }]
        });
        global_notifs.addNotification({
            notif_id: 50,
            notif_type: 6,
            user_id: "78edd912cdc84ba899a6bbc60616e97c",
            from_user_id: null,
            message: '{"placement":2,"placement_to":null,"tourney_id":"e21aa64c-c686-415b-8027-c1cf61e8bd33","tourney_name":"small test tourney"}',
            items: []
        });
        global_notifs.addNotification({
            notif_id: 51,
            notif_type: 6,
            user_id: "78edd912cdc84ba899a6bbc60616e97c",
            from_user_id: null,
            message: '{"placement":3,"placement_to":null,"tourney_id":"e21aa64c-c686-415b-8027-c1cf61e8bd33","tourney_name":"small test tourney"}',
            items: []
        })
    }))
}