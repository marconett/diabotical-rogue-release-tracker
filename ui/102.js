global_components["replay_controls"] = new MenuComponent("replay_controls", _id("replay_controls"), (function() {
    replay_controls.init()
}));
const replay_controls = {
    state: {
        selected: null,
        playback_controls_visible: true,
        total_time: 0,
        current_time: 0
    },
    $el: _id("replay_controls"),
    $seekBar: _id("replay_controls_seek_bar"),
    $seekBarTracker: _id("replay_controls_seek_bar_tracker"),
    $seekBarBegin: _id("replay_controls_seek_bar_begin_time"),
    $seekBarEnd: _id("replay_controls_seek_bar_end_time"),
    init: function() {
        bind_event("enable_replay_controls", (enable => {
            this.state.playback_controls_visible = enable;
            if (enable) {
                engine.call("hud_mouse_control_override", true, "replays")
            } else {
                engine.call("hud_mouse_control_override", false, "replays")
            }
            this.update_controls();
            this.$el.style.display = enable ? "flex" : "none"
        }));
        bind_event("play_replay", (total_game_time => {
            this.state.selected = "play";
            this.state.total_time = parseFloat(total_game_time);
            this.state.current_time = 0;
            engine.call("hud_mouse_control_override", true, "replays");
            this.update_seek_bar();
            this.update_controls()
        }));
        bind_event("set_replay_time", (current_time => {
            this.state.current_time = parseFloat(current_time);
            this.update_seek_bar()
        }));
        bind_event("resume_replay", (() => {
            this.state.selected = "play";
            this.update_controls()
        }));
        bind_event("pause_replay", (() => {
            this.state.selected = "pause";
            this.update_controls()
        }));
        bind_event("forward_replay", (() => {
            this.state.selected = "forward";
            this.update_controls();
            setTimeout((() => {
                this.state.selected = "play";
                this.update_controls();
                engine.call("resume_replay")
            }), 250)
        }));
        bind_event("rewind_replay", (() => {
            this.state.selected = "rewind";
            this.update_controls();
            setTimeout((() => {
                this.state.selected = "play";
                this.update_controls();
                engine.call("resume_replay")
            }), 250)
        }));
        bind_event("toggle_playback_controls", (() => {
            this.state.playback_controls_visible = !this.state.playback_controls_visible;
            this.$el.style.display = this.state.playback_controls_visible ? "flex" : "none";
            engine.call("hud_mouse_control_override", this.state.playback_controls_visible, "replays")
        }));
        this.$seekBar.addEventListener("click", (event => {
            const seek_rect = this.$seekBar.getBoundingClientRect();
            const seek_time = this.state.total_time * (event.clientX - seek_rect.x) / seek_rect.width;
            engine.call("seek_replay", seek_time)
        }));
        _id("playback_control_rewind").addEventListener("click", (() => {
            engine.call("rewind_replay")
        }));
        _id("playback_control_play").addEventListener("click", (() => {
            engine.call("resume_replay")
        }));
        _id("playback_control_pause").addEventListener("click", (() => {
            engine.call("pause_replay")
        }));
        _id("playback_control_forward").addEventListener("click", (() => {
            engine.call("ffwd_replay")
        }))
    },
    _format_seek_time: function(t) {
        const elapsed_seconds = Math.floor(t);
        const elapsed_minutes = Math.floor(elapsed_seconds / 60);
        const last_elapsed_seconds = elapsed_seconds - elapsed_minutes * 60;
        const elapsed_minutes_str = `${elapsed_minutes<10?"0":""}${elapsed_minutes}`;
        const last_elapsed_seconds_str = `${last_elapsed_seconds<10?"0":""}${last_elapsed_seconds}`;
        return `${elapsed_minutes_str}:${last_elapsed_seconds_str}`
    },
    update_seek_bar: function() {
        this.$seekBarBegin.textContent = this._format_seek_time(this.state.current_time);
        this.$seekBarEnd.textContent = this._format_seek_time(this.state.total_time);
        const tracker_pos = Math.round(this.$seekBar.getBoundingClientRect().width * (this.state.current_time / this.state.total_time));
        this.$seekBarTracker.style.left = `${tracker_pos}px`
    },
    update_controls: function() {
        Array.from(this.$el.querySelectorAll(".control")).forEach(($control => {
            $control.classList.remove("selected");
            switch (this.state.selected) {
                case "play":
                    $control.classList.contains("play") && $control.classList.add("selected");
                    break;
                case "pause":
                    $control.classList.contains("pause") && $control.classList.add("selected");
                    break;
                case "forward":
                    $control.classList.contains("forward") && $control.classList.add("selected");
                    break;
                case "rewind":
                    $control.classList.contains("rewind") && $control.classList.add("selected");
                    break;
                default:
            }
        }))
    }
};