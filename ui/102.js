global_components["party_list"] = new MenuComponent("party_list", _id("party_list"), (function() {
    party_list.init();
    party_status_handlers.push((function(party_changed, party, removed) {
        party_list.update(global_self.user_id, party)
    }))
}), ["play_rogue", "custom", "locker", "achievements", "create", "coin_shop", "credits"]);
const party_list = new function() {
    let html = {
        root: null,
        list: null,
        self: null
    };
    this.init = () => {
        html.root = _id("party_list");
        html.list = html.root.querySelector(".list");
        html.self = html.root.querySelector(".self")
    };
    this.update = (own_user_id, party) => {
        _empty(html.list);
        for (let member_user_id of party.member_ids) {
            if (member_user_id === own_user_id) continue;
            let member = _createElement("div", "member");
            let avatar = _createElement("div", "avatar");
            set_store_avatar(false, avatar, party.members[member_user_id].client_user_id, party.members[member_user_id].client_source);
            member.appendChild(avatar);
            if (member_user_id == party.leader_id) {
                member.appendChild(_createElement("div", "leader"))
            }
            html.list.appendChild(member)
        }
        if (global_self && global_self.data && global_self.user_id in party.members) {
            _empty(html.self);
            let avatar = _createElement("div", "avatar");
            set_store_avatar(true, avatar, party.members[global_self.user_id].client_user_id, party.members[global_self.user_id].client_source);
            let name = _createElement("div", "name", global_self.data.name);
            html.self.appendChild(avatar);
            html.self.appendChild(name);
            if (party.member_ids.length > 1 && global_self.user_id == party.leader_id) {
                html.self.appendChild(_createElement("div", "leader"))
            }
        }
    }
};