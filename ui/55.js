class CustomizationType {
    constructor(type, sub_type, sub_type_extra) {
        this.type = type;
        this.sub_type = sub_type;
        this.sub_type_extra = sub_type_extra ? sub_type_extra : "";
        this.page_id = type + "_" + sub_type;
        if (this.type in global_customization_type_id_map) {
            this.type_id = global_customization_type_id_map[this.type];
            this.type_i18n = global_customization_type_map[global_customization_type_id_map[this.type]].i18n
        } else {
            this.type_id = "";
            this.type_i18n = "unknown"
        }
    }
    equals(ctype) {
        if (this.type !== ctype.type) return false;
        if (this.sub_type !== ctype.sub_type) return false;
        return true
    }
}