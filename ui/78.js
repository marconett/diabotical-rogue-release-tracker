window.refFocalScale = 50;
window.film_fov_focal_length = "";
window.film_fov_zoom_focal_length = "";
window.film_fov_preview_zoom = false;
window.last_converted_hipfov = 90;
window.last_converted_adsfov = 90;
let current_advanced_settings = null;
class AdvancedSettings {
    yaw_pitch_presets = {
        db: {
            text: "Diabotical",
            unit: "arcmin",
            value: "1"
        },
        cs: {
            text: "Quake/Source",
            unit: "deg",
            value: "0.022"
        },
        ow: {
            text: "Overwatch",
            unit: "deg",
            value: "0.0066"
        },
        fn: {
            text: "Fortnite",
            unit: "deg",
            value: "0.005555"
        },
        reflex: {
            text: "Reflex",
            unit: "mrad",
            value: "0.1"
        },
        qcde: {
            text: "QCDE",
            unit: "division",
            value: "8192"
        }
    };
    constructor(game_id, advanced_mouse_container, accel_container, scale_container, fov_container) {
        this.game_id = game_id;
        this.advanced_mouse_container = advanced_mouse_container;
        this.accel_container = accel_container;
        this.scale_container = scale_container;
        this.fov_container = fov_container;
        this.fov_modal = _id("field_of_view_conversion_screen");
        ui_setup_select(this.accel_container.querySelector(".setting_mouse_accel_type"), ((opt, field) => {
            engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
            this.update_accel_options()
        }));
        ui_setup_select(this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_pitch_preset"), ((opt, field) => {
            engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
            this.on_yaw_pitch_preset_select()
        }));
        ui_setup_select(this.advanced_mouse_container.querySelector(".setting_imperial"), ((opt, field) => {
            engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
            this.update_physical_sens("setting_imperial", false)
        }));
        ui_setup_select(this.fov_modal.querySelector(".film_fov_measurement"), ((opt, field) => {
            engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
            this.update_fov_conversion_options("film_fov_measurement")
        }));
        ui_setup_select(this.fov_modal.querySelector(".film_fov_notation_type"), ((opt, field) => {
            engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
            this.update_fov_conversion_options("film_fov_notation_type")
        }));
        this.advanced_mouse_container.querySelector(".setting_kovaak_apply_preset_button").addEventListener("click", (() => {
            this.apply_preset_yaw_and_pitch()
        }));
        this.advanced_mouse_container.querySelector(".setting_kovaak_apply_yaw_button").addEventListener("click", (() => {
            this.apply_preset_yaw_and_pitch("yaw")
        }));
        this.advanced_mouse_container.querySelector(".setting_kovaak_apply_pitch_button").addEventListener("click", (() => {
            this.apply_preset_yaw_and_pitch("pitch")
        }));
        this.accel_container.querySelector(".ultra_advanced_accel_toggle").addEventListener("click", (() => {
            this.toggle_ultra_advanced_accel()
        }));
        this.accel_container.querySelector(".reset_ultra_advanced_accel").addEventListener("click", (() => {
            this.reset_ultra_advanced_accel_settings()
        }));
        bind_event("set_range", ((variable, value) => {
            if (GAME.active !== this.game_id) return;
            if (global_ignore_variable_update) return;
            if (variable.includes("post_scale")) {
                this.update_physical_sens(variable, true)
            }
            if (variable.startsWith("game_fov") || variable.startsWith("game_zoom_fov")) {
                this.update_fov_preview()
            }
            if (variable.startsWith("mouse_accel_")) {
                this.update_accel_chart()
            }
        }));
        bind_event("set_select", ((variable, value) => {
            if (GAME.active !== this.game_id) return;
            if (global_ignore_variable_update) return;
            if (variable.startsWith("mouse_accel_type")) {
                this.update_accel_options()
            }
        }))
    }
    apply_preset_yaw_and_pitch(axis) {
        var weap_index = window.current_selected_setting_weapon_number;
        if (typeof weap_index === "undefined") return;
        if (axis == "yaw") {
            var yaw = convert_to_arcmin(this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_num").dataset.value, this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_unit").dataset.value);
            if (!isFinite(yaw)) return;
            engine.call("set_real_variable", "mouse_accel_post_scale_x:" + weap_index, yaw)
        } else if (axis == "pitch") {
            var pitch = convert_to_arcmin(this.advanced_mouse_container.querySelector(".setting_kovaak_pitch_num").dataset.value, this.advanced_mouse_container.querySelector(".setting_kovaak_pitch_unit").dataset.value);
            if (!isFinite(pitch)) return;
            engine.call("set_real_variable", "mouse_accel_post_scale_y:" + weap_index, pitch)
        } else {
            var preset_str = this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_pitch_preset").dataset.value;
            var preset_obj = this.yaw_pitch_presets[preset_str];
            if (!preset_obj) return;
            var preset_arcmin = convert_to_arcmin(preset_obj.value, preset_obj.unit);
            if (!preset_arcmin) return;
            engine.call("set_real_variable", "mouse_accel_post_scale_x:" + weap_index, preset_arcmin);
            engine.call("set_real_variable", "mouse_accel_post_scale_y:" + weap_index, preset_arcmin)
        }
        this.update_physical_sens("initialize", false)
    }
    on_yaw_pitch_preset_select() {
        var preset = this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_pitch_preset").dataset.value;
        var yaw = Number(this.scale_container.querySelector(".setting_mouse_accel_post_scale_x").dataset.value);
        var pitch = Number(this.scale_container.querySelector(".setting_mouse_accel_post_scale_y").dataset.value);
        if (preset == "custom") {
            this.advanced_mouse_container.querySelector(".setting_kovaak_custom_yaw").style.display = "flex";
            this.advanced_mouse_container.querySelector(".setting_kovaak_custom_pitch").style.display = "flex";
            this.advanced_mouse_container.querySelector(".setting_kovaak_apply_preset_button").style.display = "none";
            global_range_slider_map["setting_kovaak_yaw_num"].setValue(yaw);
            global_range_slider_map["setting_kovaak_pitch_num"].setValue(pitch);
            this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_unit").dataset.value = "arcmin";
            this.advanced_mouse_container.querySelector(".setting_kovaak_pitch_unit").dataset.value = "arcmin";
            update_select(this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_unit"));
            update_select(this.advanced_mouse_container.querySelector(".setting_kovaak_pitch_unit"))
        } else {
            this.advanced_mouse_container.querySelector(".setting_kovaak_custom_yaw").style.display = "none";
            this.advanced_mouse_container.querySelector(".setting_kovaak_custom_pitch").style.display = "none";
            this.advanced_mouse_container.querySelector(".setting_kovaak_apply_preset_button").style.display = "flex"
        }
    }
    detect_preset_yaw_pitch() {
        var yaw = Number(this.scale_container.querySelector(".setting_mouse_accel_post_scale_x").dataset.value);
        var pitch = Number(this.scale_container.querySelector(".setting_mouse_accel_post_scale_y").dataset.value);
        var preset = "custom";
        for (let key in this.yaw_pitch_presets) {
            let val = convert_to_arcmin(this.yaw_pitch_presets[key].value, this.yaw_pitch_presets[key].unit).toPrecision(6);
            if (yaw == val && pitch == val) {
                preset = key;
                break
            }
        }
        this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_pitch_preset").dataset.value = preset;
        update_select(this.advanced_mouse_container.querySelector(".setting_kovaak_yaw_pitch_preset"));
        this.on_yaw_pitch_preset_select()
    }
    reset_ultra_advanced() {
        this.accel_container.querySelector(".ultra_advanced_accel_settings").style.display = "none";
        this.accel_container.querySelector(".ultra_advanced_accel_toggle").classList.remove("selected")
    }
    toggle_ultra_advanced_accel() {
        if (this.accel_container.querySelector(".ultra_advanced_accel_toggle").classList.contains("selected")) {
            this.ultra_advanced_accel_visible(false)
        } else {
            this.ultra_advanced_accel_visible(true)
        }
    }
    ultra_advanced_accel_visible(bool) {
        let toggle = this.accel_container.querySelector(".ultra_advanced_accel_toggle");
        let ultra_accel = this.accel_container.querySelector(".ultra_advanced_accel_settings");
        let accel_chart = this.accel_container.querySelector(".accel_chart_cont");
        if (bool) {
            toggle.classList.add("selected");
            accel_chart.style.display = "none";
            ultra_accel.style.display = "flex"
        } else {
            toggle.classList.remove("selected");
            accel_chart.style.display = "flex";
            ultra_accel.style.display = "none";
            req_anim_frame((() => {
                this.update_accel_chart()
            }))
        }
    }
    reset_ultra_advanced_accel_settings() {
        engine.call("set_real_variable", "mouse_accel_norm", 2);
        engine.call("set_real_variable", "mouse_accel_stigma_x", 1);
        engine.call("set_real_variable", "mouse_accel_stigma_y", 1);
        engine.call("set_real_variable", "mouse_accel_bias_x", 1);
        engine.call("set_real_variable", "mouse_accel_bias_y", 1);
        _play_click1()
    }
    update_zoom_sensitivity_tick(span) {
        var weap_index = window.current_selected_setting_weapon_number;
        if (!span) {
            if ("game_fov:" + weap_index in global_variable_value_store && "game_zoom_fov:" + weap_index in global_variable_value_store) {
                var fovHip = Number(global_variable_value_store["game_fov:" + weap_index]);
                var fovZoom = Number(global_variable_value_store["game_zoom_fov:" + weap_index]);
                if (!(fovHip > 0 && fovZoom > 0 && fovHip < 180 && fovZoom < 180)) {
                    return
                }
                span = FOV_To_Focal_Length(fovHip) / FOV_To_Focal_Length(fovZoom)
            }
        }
        if (span) {
            if ("mouse_sensitivity:" + weap_index in global_variable_value_store && "mouse_zoom_sensitivity:" + weap_index in global_variable_value_store) {
                global_range_slider_map["mouse_zoom_sensitivity:" + weap_index].setDataset("def", Number(global_variable_value_store["mouse_sensitivity:" + weap_index]) * span);
                global_range_slider_map["mouse_zoom_sensitivity:" + weap_index].setValue(Number(global_variable_value_store["mouse_zoom_sensitivity:" + weap_index]))
            }
        }
    }
    update_physical_sens(id_str, from_engine) {
        var zoom = id_str.includes("zoom");
        var weap_index = window.current_selected_setting_weapon_number;
        var update = false;
        var yaw = Number(this.scale_container.querySelector(".setting_mouse_accel_post_scale_x").dataset.value);
        var pitch = Number(this.scale_container.querySelector(".setting_mouse_accel_post_scale_y").dataset.value);
        this.update_sensitivity_slider_range(yaw, pitch);
        var imp_unit = this.advanced_mouse_container.querySelector(".setting_imperial").dataset.value == "1" ? true : false;
        var cpi_mouse = Number(this.advanced_mouse_container.querySelector(".setting_mouse_cpi").dataset.value);
        var hip_incre = Number(this.advanced_mouse_container.querySelector(".incre_field").dataset.value);
        var hip_curvat = Number(this.advanced_mouse_container.querySelector(".curvat_field").dataset.value);
        var hip_circum = Number(this.advanced_mouse_container.querySelector(".circum_field").dataset.value);
        var ads_incre = Number(this.advanced_mouse_container.querySelector(".incre_zoom_field").dataset.value);
        var ads_curvat = Number(this.advanced_mouse_container.querySelector(".curvat_zoom_field").dataset.value);
        var ads_circum = Number(this.advanced_mouse_container.querySelector(".circum_zoom_field").dataset.value);
        if (id_str == "initialize") {
            if ("mouse_sensitivity:" + weap_index in global_variable_value_store && "mouse_zoom_sensitivity:" + weap_index in global_variable_value_store) {
                hip_incre = Number(global_variable_value_store["mouse_sensitivity:" + weap_index]) * yaw;
                ads_incre = Number(global_variable_value_store["mouse_zoom_sensitivity:" + weap_index]) * yaw;
                global_range_slider_map["incre_field"].setValue(hip_incre);
                global_range_slider_map["incre_zoom_field"].setValue(ads_incre)
            }
        }
        if (id_str == "setting_imperial" || id_str == "setting_mouse_cpi" || id_str == "initialize" || id_str == "setting_mouse_accel_post_scale_x") {
            hip_curvat = hip_incre * cpi_mouse / (imp_unit ? 1 : 1524);
            ads_curvat = ads_incre * cpi_mouse / (imp_unit ? 1 : 1524);
            hip_circum = (imp_unit ? 1 : 2.54) * 21600 / hip_incre / cpi_mouse;
            ads_circum = (imp_unit ? 1 : 2.54) * 21600 / ads_incre / cpi_mouse;
            global_range_slider_map["curvat_field"].setValue(hip_curvat);
            global_range_slider_map["circum_field"].setValue(hip_circum);
            global_range_slider_map["curvat_zoom_field"].setValue(ads_curvat);
            global_range_slider_map["circum_zoom_field"].setValue(ads_circum)
        } else if (id_str.includes("incre")) {
            if (zoom) {
                ads_curvat = ads_incre * cpi_mouse / (imp_unit ? 1 : 1524);
                ads_circum = (imp_unit ? 1 : 2.54) * 21600 / ads_incre / cpi_mouse;
                global_range_slider_map["curvat_zoom_field"].setValue(ads_curvat);
                global_range_slider_map["circum_zoom_field"].setValue(ads_circum)
            } else {
                hip_curvat = hip_incre * cpi_mouse / (imp_unit ? 1 : 1524);
                hip_circum = (imp_unit ? 1 : 2.54) * 21600 / hip_incre / cpi_mouse;
                global_range_slider_map["curvat_field"].setValue(hip_curvat);
                global_range_slider_map["circum_field"].setValue(hip_circum)
            }
            update = true
        } else if (id_str.includes("circum")) {
            if (zoom) {
                ads_curvat = (imp_unit ? 21600 : 36) / ads_circum;
                ads_incre = (imp_unit ? 1 : 2.54) * 21600 / ads_circum / cpi_mouse;
                global_range_slider_map["curvat_zoom_field"].setValue(ads_curvat);
                global_range_slider_map["incre_zoom_field"].setValue(ads_incre)
            } else {
                hip_curvat = (imp_unit ? 21600 : 36) / hip_circum;
                hip_incre = (imp_unit ? 1 : 2.54) * 21600 / hip_circum / cpi_mouse;
                global_range_slider_map["curvat_field"].setValue(hip_curvat);
                global_range_slider_map["incre_field"].setValue(hip_incre)
            }
            update = true
        } else if (id_str.includes("curvat")) {
            if (zoom) {
                ads_circum = (imp_unit ? 21600 : 36) / ads_curvat;
                ads_incre = (imp_unit ? 1 : 1524) * ads_curvat / cpi_mouse;
                global_range_slider_map["incre_zoom_field"].setValue(ads_incre);
                global_range_slider_map["circum_zoom_field"].setValue(ads_circum)
            } else {
                hip_circum = (imp_unit ? 21600 : 36) / hip_curvat;
                hip_incre = (imp_unit ? 1 : 1524) * hip_curvat / cpi_mouse;
                global_range_slider_map["incre_field"].setValue(hip_incre);
                global_range_slider_map["circum_field"].setValue(hip_circum)
            }
            update = true
        }
        this.advanced_mouse_container.querySelector(".imperial_circumference_unit").style.display = imp_unit ? "flex" : "none";
        this.advanced_mouse_container.querySelector(".metric_circumference_unit").style.display = imp_unit ? "none" : "flex";
        this.advanced_mouse_container.querySelector(".imperial_curvature_unit").style.display = imp_unit ? "flex" : "none";
        this.advanced_mouse_container.querySelector(".metric_curvature_unit").style.display = imp_unit ? "none" : "flex";
        if (!from_engine && update) {
            if (zoom) {
                engine.call("set_real_variable", "mouse_zoom_sensitivity:" + weap_index, ads_incre / yaw)
            } else {
                engine.call("set_real_variable", "mouse_sensitivity:" + weap_index, hip_incre / yaw)
            }
            this.update_zoom_sensitivity_tick(0);
            _play_mouseover1()
        }
    }
    update_accel_options() {
        let element = this.accel_container.querySelector(".setting_mouse_accel_type");
        let val = Number(element.dataset.value);
        if (val == 0) {
            this.accel_container.querySelector(".linear_accel_only_settings").style.display = "none";
            this.accel_container.querySelector(".gamma_accel_only_settings").style.display = "none";
            this.accel_container.querySelector(".exp_accel_only_settings").style.display = "none"
        } else if (val == 1) {
            this.accel_container.querySelector(".linear_accel_only_settings").style.display = "block";
            this.accel_container.querySelector(".gamma_accel_only_settings").style.display = "none";
            this.accel_container.querySelector(".exp_accel_only_settings").style.display = "none"
        } else if (val == 2) {
            this.accel_container.querySelector(".linear_accel_only_settings").style.display = "none";
            this.accel_container.querySelector(".gamma_accel_only_settings").style.display = "block";
            this.accel_container.querySelector(".exp_accel_only_settings").style.display = "none"
        } else if (val == 3) {
            this.accel_container.querySelector(".linear_accel_only_settings").style.display = "none";
            this.accel_container.querySelector(".gamma_accel_only_settings").style.display = "none";
            this.accel_container.querySelector(".exp_accel_only_settings").style.display = "block"
        }
        this.ultra_advanced_accel_visible(false);
        if (val == 0) {
            if (window.myScatter) window.myScatter.destroy();
            _for_each_with_class_in_parent(this.accel_container, "extra_acceleration_settings", (function(el) {
                el.style.display = "none";
                el.style.opacity = 0
            }))
        } else {
            setTimeout((() => {
                this.update_accel_chart()
            }));
            _for_each_with_class_in_parent(this.accel_container, "extra_acceleration_settings", (function(el) {
                el.style.display = "flex";
                el.style.opacity = 1
            }))
        }
    }
    update_sensitivity_slider_range(yaw, pitch) {
        if (!isFinite(yaw) && !isFinite(pitch)) return;
        let weap_index = window.current_selected_setting_weapon_number;
        let max = Math.min(Math.ceil(6 / Math.min(yaw, pitch)), 100);
        if ("mouse_sensitivity:" + weap_index in global_variable_value_store && "mouse_zoom_sensitivity:" + weap_index in global_variable_value_store) {
            global_range_slider_map["mouse_sensitivity:" + weap_index].setDataset("max", max);
            global_range_slider_map["mouse_zoom_sensitivity:" + weap_index].setDataset("max", max);
            global_range_slider_map["mouse_sensitivity:" + weap_index].setValue(Number(global_variable_value_store["mouse_sensitivity:" + weap_index]));
            global_range_slider_map["mouse_zoom_sensitivity:" + weap_index].setValue(Number(global_variable_value_store["mouse_zoom_sensitivity:" + weap_index]))
        }
    }
    update_accel_chart() {
        var accel_settings = {
            offset: this.accel_container.querySelector(".setting_mouse_accel_offset").dataset.value,
            type: this.accel_container.querySelector(".setting_mouse_accel_type").dataset.value,
            cap: this.accel_container.querySelector(".setting_mouse_accel_cap").dataset.value,
            toe: this.accel_container.querySelector(".setting_mouse_accel_toe").dataset.value,
            ramp: this.accel_container.querySelector(".setting_mouse_accel_ramp").dataset.value,
            gamma: this.accel_container.querySelector(".setting_mouse_accel_gamma").dataset.value,
            domain: this.accel_container.querySelector(".setting_mouse_accel_domain").dataset.value,
            post_scale_x: this.scale_container.querySelector(".setting_mouse_accel_post_scale_x").dataset.value,
            post_scale_y: this.scale_container.querySelector(".setting_mouse_accel_post_scale_y").dataset.value,
            stigma_x: this.accel_container.querySelector(".setting_mouse_accel_stigma_x").dataset.value,
            stigma_y: this.accel_container.querySelector(".setting_mouse_accel_stigma_y").dataset.value,
            bias_x: this.accel_container.querySelector(".setting_mouse_accel_bias_x").dataset.value,
            bias_y: this.accel_container.querySelector(".setting_mouse_accel_bias_y").dataset.value,
            norm: this.accel_container.querySelector(".setting_mouse_accel_norm").dataset.value
        };
        if (accel_settings.type == 0) {
            return
        }
        var max_value = 0;
        var data = [];
        var dt_ms = 1;
        var mid = .1;
        var end = 128;
        if (accel_settings.offset > 0) {
            mid = accel_settings.offset;
            if (end < mid * 2) {
                end = mid * 2
            }
        }
        if (!(accel_settings.cap <= 1 && accel_settings.type == 1)) {
            var nominal_slope = 0;
            if (accel_settings.type == 1) {
                nominal_slope = accel_settings.ramp
            } else if (accel_settings.type == 2) {
                nominal_slope = (accel_settings.cap - 1) / accel_settings.domain
            } else if (accel_settings.type == 3) {
                nominal_slope = (accel_settings.cap - 1) * accel_settings.toe
            }
            if (nominal_slope != 0) {
                end = 2 * ((accel_settings.cap - 1) / nominal_slope);
                if (end < mid * 2) {
                    end = mid * 2
                }
            }
        }
        var incr = end / 128;
        for (i = 0; i < end; i += incr) {
            var x = i;
            var data_point = apply_accel(x, 0, dt_ms, accel_settings);
            var val = data_point.x / x;
            data.push({
                x: x,
                y: val
            });
            if (Number.isFinite(val)) {
                max_value = Math.max(val, max_value)
            }
        }
        for (var max_rate = 1; max_rate < end; max_rate *= 2) {}
        Chart.defaults.global.animation.duration = 0;
        Chart.defaults.global.defaultFontColor = "#eee";
        Chart.defaults.global.defaultFontSize = 12 * window.innerHeight / 1080;
        var ctx = this.accel_container.querySelector(".accel_chart").getContext("2d");
        var scatterChartData = {
            datasets: [{
                label: "multiplier_vs_cpms",
                xAxisID: "cpms",
                yAxisID: "multiplier",
                borderColor: "#4f7a9e",
                borderWidth: 0,
                backgroundColor: "#4f7a9e",
                showLine: true,
                fill: false,
                data: data
            }]
        };
        if (this.accel_chart_reference) this.accel_chart_reference.destroy();
        this.accel_chart_reference = new Chart(ctx, {
            type: "scatter",
            data: scatterChartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                hover: {
                    mode: false
                },
                scales: {
                    xAxes: [{
                        id: "cpms",
                        position: "bottom",
                        scaleLabel: {
                            display: true,
                            padding: {
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0
                            },
                            labelString: "Counts per millisecond (cpms)"
                        },
                        gridLines: {
                            drawTicks: false,
                            zeroLineColor: "#eee",
                            color: "rgba(255,255,255,0.05)"
                        },
                        ticks: {
                            beginAtZero: true,
                            max: max_rate,
                            stepSize: max_rate / 8
                        }
                    }],
                    yAxes: [{
                        id: "multiplier",
                        position: "left",
                        display: true,
                        scaleLabel: {
                            display: true,
                            padding: {
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0
                            },
                            labelString: "x100%"
                        },
                        gridLines: {
                            tickMarkLength: 2,
                            zeroLineColor: "#eee",
                            color: "rgba(255,255,255,0.05)"
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                }
            }
        })
    }
    update_fov_preview() {
        if (!this.fov_container) return;
        let canvas = this.fov_container.querySelector(".fov_preview");
        if (!canvas) return;
        let ctx = canvas.getContext("2d");
        let fovHip = 0;
        let fovZoom = 0;
        var weap_index = window.current_selected_setting_weapon_number;
        if ("game_fov:" + weap_index in global_variable_value_store && "game_zoom_fov:" + weap_index in global_variable_value_store) {
            fovHip = global_variable_value_store["game_fov:" + weap_index];
            fovZoom = global_variable_value_store["game_zoom_fov:" + weap_index]
        } else {
            return
        }
        if (!(fovHip > 0 && fovZoom > 0 && fovHip < 180 && fovZoom < 180)) {
            return
        }
        var res_hor = window.innerWidth;
        var res_vert = window.innerHeight;
        var canvasheight = canvas.height ? canvas.height : 150;
        var canvaswidth = canvas.width ? canvas.width : 300;
        var res_aspect = res_hor / res_vert;
        if (res_aspect < canvaswidth / canvasheight) {
            var aperture_height = canvasheight;
            var aperture_width = canvasheight * res_aspect
        } else {
            var aperture_width = canvaswidth;
            var aperture_height = canvaswidth / res_aspect
        }
        var query_image = match_fov_preview_image(fovHip, "vML", fov_preview_background_series);
        var image = new Image;
        image.src = query_image.src;
        var imagewidth = query_image.width;
        var imageheight = query_image.height;
        var imagefilm = process_formated_film_string(query_image.fov_type);
        var imagefl = FOV_To_Focal_Length(query_image.fov, imagefilm[1], imagefilm[0], imagefilm[2], imagewidth, imageheight);
        var imagefov = Focal_Length_To_FOV(imagefl, "vML", 1, 1, 1, 1);
        var hipspan = Math.tan(fovHip * Math.PI / 360) / Math.tan(imagefov * Math.PI / 360);
        var zoomspan = Math.tan(fovZoom * Math.PI / 360) / Math.tan(fovHip * Math.PI / 360);
        if (!isFinite(hipspan) || !isFinite(zoomspan)) {
            return
        }
        this.update_zoom_sensitivity_tick(zoomspan);
        var rectSpanY = aperture_height * zoomspan;
        var rectSpanX = aperture_width * zoomspan;
        var rectStartY = (canvasheight - rectSpanY) / 2;
        var rectStartX = (canvaswidth - rectSpanX) / 2;
        var cropSpanY = imageheight * hipspan;
        var cropSpanX = cropSpanY * res_aspect;
        var cropStartY = (imageheight - cropSpanY) / 2;
        var cropStartX = (imagewidth - cropSpanX) / 2;
        var crop_height = aperture_height;
        var crop_width = aperture_width;
        if (cropStartY < 0) {
            crop_height = aperture_height * Math.tan(imagefov * Math.PI / 360) / Math.tan(fovHip * Math.PI / 360);
            cropStartY = 0;
            cropSpanY = imageheight
        }
        if (cropStartX < 0) {
            crop_width = aperture_width * (Math.tan(imagefov * Math.PI / 360) * (imagewidth / imageheight)) / (Math.tan(fovHip * Math.PI / 360) * res_hor / res_vert);
            cropStartX = 0;
            cropSpanX = imagewidth
        }
        var zoomfovhor = Math.atan(Math.tan(fovZoom * Math.PI / 360) * res_aspect) * 360 / Math.PI;
        var fovhor = Math.atan(Math.tan(fovHip * Math.PI / 360) * res_aspect) * 360 / Math.PI;

        function RoundFovToString(fov, dec, clp) {
            var clippedfov = _clean_float(fov, clp);
            var roundedfov = _clean_float(fov, dec);
            var text = String(roundedfov);
            if (clippedfov - roundedfov) {
                if (roundedfov == Math.round(fov)) {
                    text += "."
                }
                for (var i = dec; i > 0; i--) {
                    if (roundedfov * Math.pow(10, i - 1) == Math.round(roundedfov * Math.pow(10, i - 1))) text += "0"
                }
                text += "..."
            }
            return text + "°"
        }
        var verHipStr = fovHip == 110 ? "Minecraft Pro" : RoundFovToString(fovHip, 2, 4);
        var verAdsStr = RoundFovToString(fovZoom, 2, 4);
        var horHipStr = RoundFovToString(fovhor, 2, 3);
        var horAdsStr = RoundFovToString(zoomfovhor, 2, 3);
        image.onload = function() {
            ctx.clearRect(0, 0, canvaswidth, canvasheight);
            ctx.fillStyle = "#000000";
            ctx.fillRect((canvaswidth - aperture_width) / 2, (canvasheight - aperture_height) / 2, aperture_width, aperture_height);
            ctx.drawImage(image, cropStartX, cropStartY, cropSpanX, cropSpanY, (canvaswidth - crop_width) / 2, (canvasheight - crop_height) / 2, crop_width, crop_height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#00ffff";
            ctx.strokeRect(rectStartX, rectStartY, rectSpanX, rectSpanY);
            ctx.strokeStyle = "#ffffff";
            ctx.strokeRect((canvaswidth - aperture_width) / 2, (canvasheight - aperture_height) / 2, aperture_width, aperture_height);
            ctx.textBaseline = "hanging";
            ctx.textAlign = "center";
            ctx.fillStyle = "#00ffff";
            ctx.fillText(horAdsStr, canvaswidth / 2, (canvasheight + rectSpanY) / 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(horHipStr, canvaswidth / 2, (canvasheight - aperture_height) / 2);
            ctx.translate(canvaswidth / 2, canvasheight / 2);
            ctx.rotate(-90 * Math.PI / 180);
            ctx.translate(-canvaswidth / 2, -canvasheight / 2);
            ctx.fillStyle = "#00ffff";
            ctx.fillText(verAdsStr, canvaswidth / 2, (canvasheight + rectSpanX) / 2);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(verHipStr, canvaswidth / 2, (canvasheight - aperture_width) / 2);
            ctx.translate(canvaswidth / 2, canvasheight / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.translate(-canvaswidth / 2, -canvasheight / 2)
        }
    }
    load_field_of_view_conversion() {
        let fovHip = 0;
        let fovZoom = 0;
        var weap_index = window.current_selected_setting_weapon_number;
        if ("game_fov:" + weap_index in global_variable_value_store && "game_zoom_fov:" + weap_index in global_variable_value_store) {
            fovHip = global_variable_value_store["game_fov:" + weap_index];
            fovZoom = global_variable_value_store["game_zoom_fov:" + weap_index]
        } else {
            return
        }
        window.film_fov_focal_length = FOV_To_Focal_Length(fovHip, "vML", 1, 1, 1, 1);
        window.film_fov_zoom_focal_length = FOV_To_Focal_Length(fovZoom, "vML", 1, 1, 1, 1);
        this.update_fov_conversion_options("film_fov_measurement");
        open_modal_screen("field_of_view_conversion_screen")
    }
    update_fov_conversion_options(id_str) {
        var measure_string = this.fov_modal.querySelector(".film_fov_measurement").dataset.value;
        var prefix_element = this.fov_modal.querySelector(".film_fov_notation_prefix");
        var suffix_element = this.fov_modal.querySelector(".film_fov_notation_suffix");
        var prefix_element_locked = this.fov_modal.querySelector(".film_fov_notation_prefix_locked");
        var suffix_element_locked = this.fov_modal.querySelector(".film_fov_notation_suffix_locked");
        var notype_element = this.fov_modal.querySelector(".film_fov_notation_type");
        var r_h = window.innerWidth;
        var r_v = window.innerHeight;
        var t_p = notype_element.dataset.value;
        var p_f = 1;
        var s_f = 1;
        if (measure_string == "custom") {
            p_f = Number(prefix_element.dataset.value);
            s_f = Number(suffix_element.dataset.value)
        } else {
            p_f = Number(prefix_element_locked.dataset.value);
            s_f = Number(suffix_element_locked.dataset.value)
        }
        if (id_str == "film_fov_measurement" || id_str == "film_fov_notation_type") {
            if (measure_string == "custom") {
                prefix_element.style.display = "flex";
                suffix_element.style.display = "flex";
                prefix_element_locked.style.display = "none";
                suffix_element_locked.style.display = "none";
                notype_element.classList.remove("disabled");
                p_f = Number(prefix_element.dataset.value);
                s_f = Number(suffix_element.dataset.value)
            } else {
                prefix_element.style.display = "none";
                suffix_element.style.display = "none";
                prefix_element_locked.style.display = "flex";
                suffix_element_locked.style.display = "flex";
                if (measure_string.includes("vML") || measure_string.includes("hML")) {
                    prefix_element_locked.style.display = "none";
                    suffix_element_locked.style.display = "none";
                    _html(prefix_element_locked, 1);
                    _html(suffix_element_locked, 1);
                    prefix_element_locked.dataset.value = 1;
                    suffix_element_locked.dataset.value = 1;
                    notype_element.dataset.value = measure_string.includes("vML") ? "vML" : "hML"
                } else {
                    let val = measure_string.split("|");
                    _html(prefix_element_locked, val[0]);
                    _html(suffix_element_locked, val[2]);
                    prefix_element_locked.dataset.value = val[0];
                    suffix_element_locked.dataset.value = val[2];
                    p_f = Number(val[0]);
                    s_f = Number(val[2]);
                    notype_element.dataset.value = val[1]
                }
                notype_element.classList.add("disabled")
            }
            update_select(notype_element);
            if (notype_element.dataset.value == "vML" || notype_element.dataset.value == "hML") {
                prefix_element.style.display = "none";
                suffix_element.style.display = "none";
                prefix_element_locked.style.display = "none";
                suffix_element_locked.style.display = "none"
            }
        } else {
            let weap_index = window.current_selected_setting_weapon_number;
            if (id_str == "film_fov_converted") {
                let nominal_fov = Number(this.fov_modal.querySelector(".film_fov_converted").dataset.value);
                if (nominal_fov != window.last_converted_hipfov && nominal_fov > 0 && nominal_fov < 180) {
                    window.last_converted_hipfov = nominal_fov;
                    window.film_fov_focal_length = FOV_To_Focal_Length(nominal_fov, t_p, p_f, s_f, r_h, r_v);
                    engine.call("set_real_variable", "game_fov:" + weap_index, Focal_Length_To_FOV(window.film_fov_focal_length, "vML", 1, 1, 1, 1));
                    update_fov_converter_preview(t_p, p_f, s_f, r_h, r_v)
                }
                return
            } else if (id_str == "film_fov_zoom_converted") {
                let nominal_fov = Number(this.fov_modal.querySelector(".film_fov_zoom_converted").dataset.value);
                if (nominal_fov != window.last_converted_adsfov && nominal_fov > 0 && nominal_fov < 180) {
                    window.last_converted_adsfov = nominal_fov;
                    window.film_fov_zoom_focal_length = FOV_To_Focal_Length(nominal_fov, t_p, p_f, s_f, r_h, r_v);
                    engine.call("set_real_variable", "game_zoom_fov:" + weap_index, Focal_Length_To_FOV(window.film_fov_zoom_focal_length, "vML", 1, 1, 1, 1));
                    update_fov_converter_preview(t_p, p_f, s_f, r_h, r_v)
                }
                return
            }
        }
        t_p = notype_element.dataset.value;
        let verthipfov = Focal_Length_To_FOV(window.film_fov_focal_length, t_p, p_f, s_f, r_h, r_v);
        let vertadsfov = Focal_Length_To_FOV(window.film_fov_zoom_focal_length, t_p, p_f, s_f, r_h, r_v);
        global_range_slider_map["film_fov_converted"].setValue(verthipfov);
        global_range_slider_map["film_fov_zoom_converted"].setValue(vertadsfov);
        global_range_slider_map["film_fov_notation_prefix"].setValue(p_f);
        global_range_slider_map["film_fov_notation_suffix"].setValue(s_f);
        update_fov_converter_preview(t_p, p_f, s_f, r_h, r_v);
        write_misc_hud_preference("film", measure_string + "?" + p_f + "?" + t_p + "?" + s_f, true);
        window.last_converted_hipfov = Number(verthipfov.toPrecision(6));
        window.last_converted_adsfov = Number(vertadsfov.toPrecision(6))
    }
}

function swap_zoom_and_hip_fields(el, mode) {
    let container = el.parentElement.parentElement;
    if (mode) {
        container.querySelector(".hipButton").classList.add("selected");
        container.querySelector(".adsButton").classList.remove("selected")
    } else {
        container.querySelector(".hipButton").classList.remove("selected");
        container.querySelector(".adsButton").classList.add("selected")
    }
    container.querySelector(".hip_curvature").style.display = mode ? "flex" : "none";
    container.querySelector(".zoom_curvature").style.display = mode ? "none" : "flex";
    container.querySelector(".hip_circumference").style.display = mode ? "flex" : "none";
    container.querySelector(".zoom_circumference").style.display = mode ? "none" : "flex";
    container.querySelector(".setting_incre_container").style.display = mode ? "flex" : "none";
    container.querySelector(".setting_incre_zoom_container").style.display = mode ? "none" : "flex"
}

function convert_to_arcmin(value, unit) {
    if (unit == "arcmin") {
        var preset_arcmin = Number(value)
    } else if (unit == "deg") {
        var preset_arcmin = value * 60
    } else if (unit == "mrad") {
        var preset_arcmin = value * 10.8 / Math.PI
    } else if (unit == "division") {
        var preset_arcmin = 21600 / value
    } else {
        return
    }
    return preset_arcmin
}
window.current_selected_setting_weapon_number = 0;

function apply_accel(x, y, dt, settings) {
    if (!dt) {
        return {
            x: 0,
            y: 0
        }
    }
    var dx = x;
    var dy = y;
    if (settings.type && dt) {
        var offset = settings.offset;
        var domain = settings.domain;
        var gamma = settings.gamma;
        var norm = settings.norm;
        var type = settings.type;
        var ramp = settings.ramp;
        var cap = settings.cap;
        var toe = settings.toe;
        var rx = Math.pow(dx * settings.stigma_x, norm);
        var ry = Math.pow(dy * settings.stigma_y, norm);
        var rate = Math.pow(rx + ry, 1 / norm) / dt;
        if (rate > offset) {
            var gain = 0;
            if (type == 1) {
                gain = ramp * (rate - offset);
                if (cap > 0 && gain > cap - 1) {
                    gain = cap - 1
                }
            } else if (type == 2) {
                gain = cap - 1;
                rate -= offset;
                if (rate < domain) {
                    gain *= Math.pow(rate / domain, gamma)
                }
            } else if (type == 3) {
                cap = cap - 1;
                gain = cap * (1 - Math.exp((offset - rate) * toe / Math.abs(cap)))
            }
            dx *= gain * settings.bias_x + 1;
            dy *= gain * settings.bias_y + 1
        }
    }
    return {
        x: dx,
        y: dy
    }
}

function match_fov_preview_image(desired_fov, desired_fov_type, series) {
    var desfilm = process_formated_film_string(desired_fov_type);
    var desfl = FOV_To_Focal_Length(desired_fov, desfilm[1], desfilm[0], desfilm[2], window.innerWidth, window.innerHeight);
    var array = global_fov_preview_images[series ? series : "temple_quarry"];
    var lastfl = 0;
    var lastindex = null;
    var minfl = null;
    var minindex = null;
    for (index = 0; index < array.length; index++) {
        let imgfilm = process_formated_film_string(array[index]["fov_type"]);
        let imgfl = FOV_To_Focal_Length(array[index]["fov"], imgfilm[1], imgfilm[0], imgfilm[2], array[index]["width"], array[index]["height"]);
        if (lastfl < imgfl && imgfl <= desfl) {
            lastfl = imgfl;
            lastindex = index
        }
        if (!minfl || imgfl < minfl) {
            minfl = imgfl;
            minindex = index
        }
    }
    if (!lastfl) return array[minindex];
    return array[lastindex]
}

function process_formated_film_string(str) {
    var arr = [1, "vML", 1];
    if (str.includes("vML") || str.includes("hML")) {
        arr[1] = str.includes("vML") ? "vML" : "hML"
    } else {
        var val = str.split("|");
        arr[0] = Number(val[0]);
        arr[1] = val[1];
        arr[2] = Number(val[2])
    }
    return arr
}

function FOV_To_Focal_Length(fov, type, prefix, suffix, res_hor, res_vert) {
    var nom_width = prefix;
    var nom_height = suffix;
    var aspect_factor = 1;
    if (type == "vML") {
        aspect_factor = 1
    } else if (type == "hML") {
        aspect_factor = res_vert / res_hor
    } else if (type == "ML") {
        aspect_factor = nom_height / nom_width
    } else if (type == "LM") {
        aspect_factor = res_vert * nom_width / nom_height / res_hor
    } else if (type == "MI") {
        aspect_factor = res_hor / res_vert > nom_width / nom_height ? nom_height / nom_width : res_vert / res_hor
    } else if (type == "MF") {
        aspect_factor = res_hor / res_vert < nom_width / nom_height ? nom_height / nom_width : res_vert / res_hor
    } else if (type == "IM") {
        aspect_factor = res_hor / res_vert > nom_width / nom_height ? 1 : res_vert * nom_width / nom_height / res_hor
    } else if (type == "FM") {
        aspect_factor = res_hor / res_vert < nom_width / nom_height ? 1 : res_vert * nom_width / nom_height / res_hor
    }
    var focal_length = window.refFocalScale / (Math.tan(fov * Math.PI / 360) * aspect_factor);
    return focal_length
}

function Focal_Length_To_FOV(focal_length, type, prefix, suffix, res_hor, res_vert) {
    var nom_width = prefix;
    var nom_height = suffix;
    var aspect_factor = 1;
    if (type == "vML") {
        aspect_factor = 1
    } else if (type == "hML") {
        aspect_factor = res_vert / res_hor
    } else if (type == "ML") {
        aspect_factor = nom_height / nom_width
    } else if (type == "LM") {
        aspect_factor = res_vert * nom_width / nom_height / res_hor
    } else if (type == "MI") {
        aspect_factor = res_hor / res_vert > nom_width / nom_height ? nom_height / nom_width : res_vert / res_hor
    } else if (type == "MF") {
        aspect_factor = res_hor / res_vert < nom_width / nom_height ? nom_height / nom_width : res_vert / res_hor
    } else if (type == "IM") {
        aspect_factor = res_hor / res_vert > nom_width / nom_height ? 1 : res_vert * nom_width / nom_height / res_hor
    } else if (type == "FM") {
        aspect_factor = res_hor / res_vert < nom_width / nom_height ? 1 : res_vert * nom_width / nom_height / res_hor
    }
    var fov = 360 * Math.atan(window.refFocalScale / (aspect_factor * focal_length)) / Math.PI;
    var vfov = Number((360 * Math.atan(window.refFocalScale / focal_length) / Math.PI).toPrecision(6));
    var check = Number((360 * Math.atan(Math.tan(Math.round(fov) * Math.PI / 360) * aspect_factor) / Math.PI).toPrecision(6));
    if (vfov == check) {
        fov = Math.round(fov)
    }
    return fov
}

function swap_zoom_and_hip_fov_converter_fields(mode) {
    if (mode) {
        _id("hipButtonFOV").classList.add("selected");
        _id("adsButtonFOV").classList.remove("selected");
        window.film_fov_preview_zoom = false
    } else {
        _id("hipButtonFOV").classList.remove("selected");
        _id("adsButtonFOV").classList.add("selected");
        window.film_fov_preview_zoom = true
    }
    if (current_advanced_settings) current_advanced_settings.update_fov_conversion_options()
}
let fov_preview_background_series = "depot";

function cycle_fov_preview_background() {
    let arr = Object.keys(global_fov_preview_images);
    let key = fov_preview_background_series;
    for (i = 0; i < arr.length; i++) {
        if (key == arr[i]) {
            key = arr[(i + 1) % arr.length];
            fov_preview_background_series = key;
            write_misc_hud_preference("fovbkg", key);
            if (current_advanced_settings) {
                current_advanced_settings.update_fov_conversion_options();
                current_advanced_settings.update_fov_preview()
            }
            return
        }
    }
}
async
function update_fov_converter_preview(t_p, p_f, s_f, r_h, r_v) {
    await new Promise((resolve => setTimeout(resolve, 0)));
    if (!(p_f && s_f) && !(t_p == "vML" || t_p == "hML")) return;
    var zoom = window.film_fov_preview_zoom;
    var focal_length = zoom ? window.film_fov_zoom_focal_length : window.film_fov_focal_length;
    var measured_fov = Focal_Length_To_FOV(focal_length, t_p, p_f, s_f, r_h, r_v);
    var aperture_span_ver = window.refFocalScale / focal_length;
    var aperture_span_hor = aperture_span_ver * r_h / r_v;
    var img = match_fov_preview_image(measured_fov, p_f + "|" + t_p + "|" + s_f, fov_preview_background_series);
    var image_width = img.width;
    var image_height = img.height;
    var image_film = process_formated_film_string(img.fov_type);
    var image_focal_length = FOV_To_Focal_Length(img.fov, image_film[1], image_film[0], image_film[2], image_width, image_height);
    _id("fov_converter_preview").style.height = 100 * focal_length / image_focal_length + "%";
    _id("fov_converter_preview").style.backgroundImage = 'url("/html/' + img.src + '")';
    const yourFunction = async() => {
        await new Promise((resolve => setTimeout(resolve, 0)));
        var aperture_width = _id("fov_converter_preview").getBoundingClientRect().width;
        var aperture_height = _id("fov_converter_preview").getBoundingClientRect().height;
        _id("fov_converter_preview").style.backgroundSize = aperture_width / aperture_height > image_width / image_height ? "contain" : "cover"
    };
    yourFunction();
    _id("fov_converter_preview_ver_boundary").style.borderTop = t_p.includes("I") || t_p == "LM" ? "none" : "2px solid white";
    _id("fov_converter_preview_hor_boundary").style.borderLeft = t_p.includes("I") || t_p == "ML" ? "none" : "2px solid white";
    _id("fov_converter_preview_hor_boundary").style.borderRight = t_p.includes("I") || t_p == "ML" ? "none" : "2px solid white";
    _id("fov_converter_preview_ver_boundary").style.borderBottom = t_p.includes("I") || t_p == "LM" ? "none" : "2px solid white";
    if (t_p == "vML" || t_p == "hML") {
        var boundary_span_ver = aperture_span_ver;
        var boundary_span_hor = aperture_span_hor;
        _id("fov_converter_preview_ver_boundary_text").textContent = measured_fov.toPrecision(5).replace(/\.?0+$/, "") + "°";
        _id("fov_converter_preview_hor_boundary_text").textContent = measured_fov.toPrecision(5).replace(/\.?0+$/, "") + "°";
        _id("fov_converter_preview_ver_boundary_text").style.fontSize = "1.25em";
        _id("fov_converter_preview_hor_boundary_text").style.fontSize = "1.25em"
    } else if (t_p == "MI" || t_p == "ML" || t_p == "MF") {
        var boundary_span_hor = Math.tan(measured_fov * Math.PI / 360);
        var boundary_span_ver = boundary_span_hor * s_f / p_f;
        _id("fov_converter_preview_hor_boundary_text").textContent = measured_fov.toPrecision(5).replace(/\.?0+$/, "") + "°";
        _id("fov_converter_preview_ver_boundary_text").textContent = (360 * Math.atan(boundary_span_ver) / Math.PI).toPrecision(5).replace(/\.?0+$/, "") + "°";
        _id("fov_converter_preview_hor_boundary_text").style.fontSize = "1.25em";
        _id("fov_converter_preview_ver_boundary_text").style.fontSize = "0.8em";
        _id("fov_converter_preview_hor_boundary").style.zIndex = 999;
        _id("fov_converter_preview_ver_boundary").style.zIndex = 998
    } else {
        var boundary_span_ver = Math.tan(measured_fov * Math.PI / 360);
        var boundary_span_hor = boundary_span_ver * p_f / s_f;
        _id("fov_converter_preview_ver_boundary_text").textContent = measured_fov.toPrecision(5).replace(/\.?0+$/, "") + "°";
        _id("fov_converter_preview_hor_boundary_text").textContent = (360 * Math.atan(boundary_span_hor) / Math.PI).toPrecision(5).replace(/\.?0+$/, "") + "°";
        _id("fov_converter_preview_ver_boundary_text").style.fontSize = "1.25em";
        _id("fov_converter_preview_hor_boundary_text").style.fontSize = "0.8em";
        _id("fov_converter_preview_hor_boundary").style.zIndex = 998;
        _id("fov_converter_preview_ver_boundary").style.zIndex = 999
    }
    var frame_width = Math.max(aperture_span_hor, boundary_span_hor);
    var frame_height = Math.max(aperture_span_ver, boundary_span_ver);
    var frame_aspect = frame_width / frame_height;
    var container_width = _id("fov_converter_preview_container").getBoundingClientRect().width;
    var container_height = window.outerHeight / 100 * 25;
    var container_aspect = container_width / container_height;
    var preview_focal_scale = frame_aspect < container_aspect ? frame_height : frame_width;
    var preview_pixel_scale = frame_aspect < container_aspect ? container_height : container_width;
    _id("fov_converter_preview_aperture").style.height = aperture_span_ver * preview_pixel_scale / preview_focal_scale + "px";
    _id("fov_converter_preview_aperture").style.width = aperture_span_hor * preview_pixel_scale / preview_focal_scale + "px";
    _id("fov_converter_preview_hor_boundary").style.height = boundary_span_ver * preview_pixel_scale / preview_focal_scale + 2 + "px";
    _id("fov_converter_preview_hor_boundary").style.width = boundary_span_hor * preview_pixel_scale / preview_focal_scale + "px";
    _id("fov_converter_preview_hor_boundary").style.display = t_p == "vML" ? "none" : "flex";
    _id("fov_converter_preview_hor_boundary").style.boxShadow = t_p == "vML" || t_p == "hML" ? "none" : "inset 0 0 5vh 0 white";
    _id("fov_converter_preview_ver_boundary").style.height = boundary_span_ver * preview_pixel_scale / preview_focal_scale + 2 + "px";
    _id("fov_converter_preview_ver_boundary").style.width = boundary_span_hor * preview_pixel_scale / preview_focal_scale + "px";
    _id("fov_converter_preview_ver_boundary").style.display = t_p == "hML" ? "none" : "flex";
    if (measured_fov == 110 && t_p == "vML") _id("fov_converter_preview_ver_boundary_text").textContent = "Minecraft Pro"
}