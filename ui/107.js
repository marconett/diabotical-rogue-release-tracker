let global_coin_shop_offers_loaded = false;
let global_coin_shop_offers = {};
let global_coin_shop_is_rendered = false;
let global_steam_shop_loading = false;
let global_steam_shop = null;
new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "coin_shop",
    screen_element: _id("coin_shop_screen"),
    button_element: null,
    fullscreen: false,
    init: () => {
        add_on_get_api_token_handler(false, (() => {
            if (global_store_id === CLIENT_SOURCE_NAME.STEAM) {
                load_steam_shop(render_coin_shop)
            }
        }))
    },
    open_handler: params => {
        set_blur(true);
        historyPushState({
            page: "coin_shop"
        });
        load_coin_shop()
    }
});
const global_coin_packs = {
    "9fd5168913d04eb2b9afdd722cfe7929": {
        extra: 0,
        image: "/html/images/coins/coin_option_1.png.dds"
    },
    "9bccc75b097e47c5b49e3fb8bd78652b": {
        extra: 13,
        image: "/html/images/coins/coin_option_2.png.dds"
    },
    "480a137bf2214faeb233be6aefa92599": {
        extra: 25,
        image: "/html/images/coins/coin_option_3.png.dds"
    },
    "9bfa21b7b6994da59f74e8a816fcd026": {
        extra: 35,
        image: "/html/images/coins/coin_option_4.png.dds"
    },
    1: {
        extra: 0,
        image: "/html/images/coins/coin_option_1.png.dds"
    },
    2: {
        extra: 13,
        image: "/html/images/coins/coin_option_2.png.dds"
    },
    3: {
        extra: 25,
        image: "/html/images/coins/coin_option_3.png.dds"
    },
    4: {
        extra: 35,
        image: "/html/images/coins/coin_option_4.png.dds"
    }
};
const global_coin_pack_map = {
    "9fd5168913d04eb2b9afdd722cfe7929": "ab206b19926347b1b2b4daeb301d23f5",
    "9bccc75b097e47c5b49e3fb8bd78652b": "299df8725b6a47518493bf0325f402e7",
    "480a137bf2214faeb233be6aefa92599": "9cbd99d29eda471a83cf4654a69f2468",
    "9bfa21b7b6994da59f74e8a816fcd026": "f13ea94a77d0401f93b5569eea33c32f"
};
const global_coin_item_packs = ["ab206b19926347b1b2b4daeb301d23f5", "299df8725b6a47518493bf0325f402e7", "9cbd99d29eda471a83cf4654a69f2468", "f13ea94a77d0401f93b5569eea33c32f"];

function handle_coin_offers_update(offers) {
    global_coin_shop_offers = offers;
    global_coin_shop_offers_loaded = true
}

function load_coin_shop() {
    if (global_store_id === CLIENT_SOURCE_NAME.EGS) {
        let fetch_shop = false;
        if (global_shop_raw_data === null) {
            fetch_shop = true
        }
        if (global_shop_is_loading) {
            setTimeout(load_coin_shop, 100);
            return
        }
        if (fetch_shop) {
            load_shop_data(load_coin_shop)
        } else {
            if (!global_coin_shop_is_rendered && global_coin_shop_offers_loaded) {
                render_coin_shop()
            }
        }
    } else if (global_store_id === CLIENT_SOURCE_NAME.STEAM) {
        let fetch_shop = false;
        if (global_steam_shop === null) {
            fetch_shop = true
        }
        if (global_steam_shop_loading) {
            setTimeout(load_coin_shop, 100);
            return
        }
        if (fetch_shop) {
            load_steam_shop(render_coin_shop)
        } else {
            if (!global_coin_shop_is_rendered) {
                render_coin_shop()
            }
        }
    }
}

function load_steam_shop(cb) {
    global_steam_shop_loading = true;
    api_request("GET", "/shop/steam", {}, (function(data) {
        global_steam_shop = data;
        global_steam_shop_loading = false;
        if (typeof cb === "function") {
            cb()
        }
    }))
}
let coin_shop_item_pack_lookup = {};

function render_coin_shop() {
    global_coin_shop_is_rendered = true;
    let cont = _id("coin_shop_options");
    _empty(cont);
    if (global_store_id === CLIENT_SOURCE_NAME.EGS) {
        if (global_shop_raw_data.hasOwnProperty("packs")) {
            for (let pack of global_shop_raw_data.packs) {
                if (pack.eos_offer_id in global_coin_shop_offers) {
                    coin_shop_item_pack_lookup[pack.eos_offer_id] = pack
                }
            }
        }
        const sortedKeyOffers = Object.keys(global_coin_shop_offers).sort(((i, j) => global_coin_shop_offers[i].current_price - global_coin_shop_offers[j].current_price));
        let shop_group = _createElement("div", "shop_group");
        let container = _createElement("div", "container");
        shop_group.appendChild(container);
        cont.appendChild(shop_group);
        for (let offerKey of sortedKeyOffers) {
            const offer = global_coin_shop_offers[offerKey];
            if (offer.purchase_limit === 1) continue;
            let item_pack = false;
            if (offerKey in global_coin_pack_map) {
                if (global_coin_pack_map[offerKey] in coin_shop_item_pack_lookup) {
                    if (!is_shop_item_owned(coin_shop_item_pack_lookup[global_coin_pack_map[offerKey]])) {
                        item_pack = coin_shop_item_pack_lookup[global_coin_pack_map[offerKey]]
                    }
                }
            }
            if (item_pack !== false) {
                container.appendChild(new ShopGroup([item_pack], "coin_shop").container)
            } else {
                container.appendChild(render_epic_coin_offer(offerKey, offer))
            }
        }
    } else if (global_store_id === CLIENT_SOURCE_NAME.STEAM) {
        let shop_group = _createElement("div", "shop_group");
        let container = _createElement("div", "container");
        shop_group.appendChild(container);
        cont.appendChild(shop_group);
        if (global_steam_shop) {
            global_steam_shop.sort(((a, b) => a.usd_price - b.usd_price));
            for (let i of global_steam_shop) {
                container.appendChild(render_steam_shop_item(i))
            }
        }
    }
}

function render_epic_coin_offer(offerKey, offer) {
    let fragment = new DocumentFragment;
    let option = _createElement("div", "option");
    _addButtonSounds(option, 1);
    let bg = _createElement("div", "bg");
    bg.appendChild(_createElement("div", "inner_bg"));
    option.appendChild(bg);
    let top = _createElement("div", ["top", "category_" + offer.title]);
    let image = null;
    if (offerKey in global_coin_packs && global_coin_packs[offerKey].image.length) {
        image = _createElement("div", "image");
        image.style.backgroundImage = "url(" + global_coin_packs[offerKey].image + ")";
        top.appendChild(image)
    }
    let amount_cont = _createElement("div", "amount_cont");
    amount_cont.appendChild(_createElement("div", "label", offer.title));
    top.appendChild(amount_cont);
    option.appendChild(top);
    let bottom = _createElement("div", "bottom");
    bottom.appendChild(_createElement("div", "price", _format_number(offer.current_price, "currency", {
        currency_code: offer.currency_code,
        areCents: true
    })));
    option.appendChild(bottom);
    if (offerKey in global_coin_packs) {
        if (global_coin_packs[offerKey].extra > 0) {
            option.appendChild(_createElement("div", "tag", localize_ext("shop_coins_extra", {
                count: global_coin_packs[offerKey].extra
            })))
        }
    }
    option.addEventListener("mouseenter", (function() {
        if (image !== null) image.classList.add("hover")
    }));
    option.addEventListener("mouseleave", (function() {
        if (image !== null) image.classList.remove("hover")
    }));
    option.addEventListener("click", (function() {
        engine.call("eos_checkout", offerKey)
    }));
    fragment.appendChild(option);
    return fragment
}

function render_steam_shop_item(i) {
    let price = _format_number(i.usd_price, "currency", {
        currency_code: "USD",
        areCents: true
    });
    if (i.local_currency && i.local_price) {
        price = _format_number(i.local_price, "currency", {
            currency_code: i.local_currency,
            areCents: true
        })
    }
    let fragment = new DocumentFragment;
    let label = "";
    if (i.action && i.action.actions) {
        for (let a of i.action.actions) {
            if (a.action === "grant_coins" && a.amount) {
                label = localize_ext("shop_pack_coins", {
                    count: a.amount
                });
                break
            }
        }
    }
    let option = _createElement("div", "option");
    _addButtonSounds(option, 3);
    let top = _createElement("div", ["top"]);
    let image = null;
    if (i.steam_shop_item_id in global_coin_packs && global_coin_packs[i.steam_shop_item_id].image.length) {
        image = _createElement("div", "image");
        image.style.backgroundImage = "url(" + global_coin_packs[i.steam_shop_item_id].image + ")";
        top.appendChild(image)
    }
    let amount_cont = _createElement("div", "amount_cont");
    amount_cont.appendChild(_createElement("div", "label", label));
    top.appendChild(amount_cont);
    option.appendChild(top);
    let bottom = _createElement("div", "bottom");
    bottom.appendChild(_createElement("div", "price", price));
    option.appendChild(bottom);
    if (i.steam_shop_item_id in global_coin_packs) {
        if (global_coin_packs[i.steam_shop_item_id].extra > 0) {
            option.appendChild(_createElement("div", "tag", localize_ext("shop_coins_extra", {
                count: global_coin_packs[i.steam_shop_item_id].extra
            })))
        }
    }
    option.addEventListener("mouseenter", (function() {
        if (image !== null) image.classList.add("hover")
    }));
    option.addEventListener("mouseleave", (function() {
        if (image !== null) image.classList.remove("hover")
    }));
    option.addEventListener("click", (function() {
        api_request("POST", "/shop/steam/purchase", {
            item_id: i.steam_shop_item_id,
            item_desc: label,
            lang: global_language_steam
        }, (function(data) {
            console.log("purchase result:", data)
        }))
    }));
    fragment.appendChild(option);
    return fragment
}