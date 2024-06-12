_last_anim_update = performance.now();

function anim_update(timestamp) {
    let dt = timestamp - _last_anim_update;
    _last_anim_update = timestamp;
    for (var i = 0; i < _animations.length; i++) {
        let anim = _animations[i];
        let delete_this = false;
        anim.age += dt;
        let t = clamp((anim.age - anim.delay) / anim.duration, 0, 1);
        if (anim.alternate) {
            t *= 2;
            if (t > 1) {
                t = 2 - t
            }
        }
        if (anim.easing) {
            t = anim.easing(t)
        }
        if (anim.number) {
            let val = Math.floor(lerp(anim.number[0], anim.number[1], t));
            if (typeof anim.number[2] == "function") {
                anim.number[2](val)
            }
            anim.element.textContent = val
        }
        if (anim.scale) {
            let val = lerp(anim.scale[0], anim.scale[1], t);
            anim.element.style.transform = "scale(" + val + ")"
        }
        if (anim.opacity) {
            let val = lerp(anim.opacity[0], anim.opacity[1], t);
            anim.element.style.opacity = val
        }
        if (anim.translateX) {
            let val = lerp(anim.translateX[0], anim.translateX[1], t);
            anim.element.style.transform = "translateX(" + val + anim.translateX[2] + ")"
        }
        if (anim.translateY) {
            let val = lerp(anim.translateY[0], anim.translateY[1], t);
            anim.element.style.transform = "translateY(" + val + anim.translateY[2] + ")"
        }
        if (anim.height) {
            let val = lerp(anim.height[0], anim.height[1], t);
            anim.element.style.height = val + "%"
        }
        if (anim.width) {
            let val = lerp(anim.width[0], anim.width[1], t);
            anim.element.style.width = val + anim.width[2]
        }
        if (anim.age >= anim.duration + anim.delay) {
            if (anim.hide) {
                anim.element.style.display = "none"
            }
            if (anim.remove) {
                let parent = anim.element.parentNode;
                if (parent) {
                    parent.removeChild(anim.element)
                }
            }
            if (anim.completion && typeof anim.completion === "function") {
                anim.completion(true)
            }
            _animations.splice(i, 1);
            i--
        }
    }
    window.requestAnimationFrame(anim_update)
}
var _animations = [];

function anim_start(options) {
    if (!options.element) return;
    if (!options.duration) options.duration = 1e3;
    if (!options.delay) options.delay = 0;
    if (options.show) {
        if (options.displayType) options.element.style.display = options.displayType;
        else options.element.style.display = "flex";
        if (options.opacity) {
            options.element.style.opacity = options.opacity[0]
        }
        for (var i = 0; i < _animations.length; i++) {
            if (_animations[i].element == options.element) {
                _animations[i].hide = false
            }
        }
    }
    options.creation_time = _last_anim_update;
    options.age = 0;
    _animations.push(options)
}

function anim_remove(element) {
    for (var i = 0; i < _animations.length; i++) {
        if (_animations[i].element == element) {
            if (_animations[i].completion && typeof _animations[i].completion === "function") {
                _animations[i].completion(false)
            }
            _animations.splice(i, 1);
            i--
        }
    }
}
var easing_functions = {
    linear: function(t) {
        return t
    },
    ease: function(t) {
        return .3 * Math.pow(1 - t, 2) * t + 3 * (1 - t) * Math.pow(t, 2) + Math.pow(t, 3)
    },
    easeInQuad: function(t) {
        return t * t
    },
    easeOutQuad: function(t) {
        return -1 * t * (t - 2)
    },
    easeInOutQuad: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t
        }
        return -1 / 2 * (--t * (t - 2) - 1)
    },
    easeInCubic: function(t) {
        return t * t * t
    },
    easeOutCubic: function(t) {
        return (t = t / 1 - 1) * t * t + 1
    },
    easeInOutCubic: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t * t
        }
        return 1 / 2 * ((t -= 2) * t * t + 2)
    },
    easeInQuart: function(t) {
        return t * t * t * t
    },
    easeOutQuart: function(t) {
        return -1 * ((t = t / 1 - 1) * t * t * t - 1)
    },
    easeInOutQuart: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t * t * t
        }
        return -1 / 2 * ((t -= 2) * t * t * t - 2)
    },
    easeInQuint: function(t) {
        return (t /= 1) * t * t * t * t
    },
    easeOutQuint: function(t) {
        return (t = t / 1 - 1) * t * t * t * t + 1
    },
    easeInOutQuint: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t * t * t * t
        }
        return 1 / 2 * ((t -= 2) * t * t * t * t + 2)
    },
    easeInSine: function(t) {
        return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1
    },
    easeOutSine: function(t) {
        return Math.sin(t / 1 * (Math.PI / 2))
    },
    easeInOutSine: function(t) {
        return -1 / 2 * (Math.cos(Math.PI * t) - 1)
    },
    easeInExpo: function(t) {
        return t === 0 ? 1 : Math.pow(2, 10 * (t / 1 - 1))
    },
    easeOutExpo: function(t) {
        return t === 1 ? 1 : -Math.pow(2, -10 * t) + 1
    },
    easeInOutExpo: function(t) {
        if (t === 0) {
            return 0
        }
        if (t === 1) {
            return 1
        }
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * Math.pow(2, 10 * (t - 1))
        }
        return 1 / 2 * (-Math.pow(2, -10 * --t) + 2)
    },
    easeInCirc: function(t) {
        if (t >= 1) {
            return t
        }
        return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1)
    },
    easeOutCirc: function(t) {
        return Math.sqrt(1 - (t = t / 1 - 1) * t)
    },
    easeInOutCirc: function(t) {
        if ((t /= 1 / 2) < 1) {
            return -1 / 2 * (Math.sqrt(1 - t * t) - 1)
        }
        return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1)
    },
    easeInElastic: function(t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) {
            return 0
        }
        if ((t /= 1) === 1) {
            return 1
        }
        if (!p) {
            p = .3
        }
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a)
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p))
    },
    easeOutElastic: function(t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) {
            return 0
        }
        if ((t /= 1) === 1) {
            return 1
        }
        if (!p) {
            p = .3
        }
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a)
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1
    },
    easeInOutElastic: function(t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) {
            return 0
        }
        if ((t /= 1 / 2) === 2) {
            return 1
        }
        if (!p) {
            p = .3 * 1.5
        }
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a)
        }
        if (t < 1) {
            return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p))
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * .5 + 1
    },
    easeInBack: function(t) {
        var s = 1.70158;
        return (t /= 1) * t * ((s + 1) * t - s)
    },
    easeOutBack: function(t) {
        var s = 1.70158;
        return (t = t / 1 - 1) * t * ((s + 1) * t + s) + 1
    },
    easeInOutBack: function(t) {
        var s = 1.70158;
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * (t * t * (((s *= 1.525) + 1) * t - s))
        }
        return 1 / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2)
    },
    easeInBounce: function(t) {
        return 1 - easingEffects.easeOutBounce(1 - t)
    },
    easeOutBounce: function(t) {
        if ((t /= 1) < 1 / 2.75) {
            return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + .75
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + .9375
        }
        return 7.5625 * (t -= 2.625 / 2.75) * t + .984375
    },
    easeInOutBounce: function(t) {
        if (t < 1 / 2) {
            return easingEffects.easeInBounce(t * 2) * .5
        }
        return easingEffects.easeOutBounce(t * 2 - 1) * .5 + .5
    }
};

function anim_show(element, duration = 200, displayType = "flex", cb) {
    if (element.style.opacity >= 1 && element.style.display == displayType) return;
    anim_start({
        element: element,
        opacity: [0, 1],
        duration: duration,
        easing: easing_functions.easeOutQuad,
        show: true,
        displayType: displayType,
        completion: cb
    })
}

function anim_hide(element, duration = 200, cb) {
    anim_start({
        element: element,
        opacity: [1, 0],
        duration: duration,
        easing: easing_functions.easeOutQuad,
        hide: true,
        completion: cb
    })
}

function game_over_animation(win) {
    let y = 0;
    if (!win) y = 4;
    var anim = {
        animation_counter: 0,
        animation_last_time: performance.now(),
        elem: _id("game_over_effect"),
        anim_x: 0,
        anim_y: y,
        framerate: 30,
        framecount: 10,
        callback: function() {
            var now = performance.now();
            var dt = now - this.animation_last_time;
            var frame = Math.floor(this.animation_counter * this.framerate * .001);
            if (frame <= this.framecount) {
                var off_x = Math.floor(frame % 4) + this.anim_x;
                var off_y = Math.floor(frame / 4) + this.anim_y;
                this.elem.style.backgroundPosition = ("background-position", "-" + 100 * off_x + "% -" + off_y * 100 + "%");
                this.animation_counter += dt;
                this.animation_last_time = now;
                window.requestAnimationFrame((function() {
                    anim.callback()
                }))
            }
        }
    };
    anim.callback()
}

function scrolling_div_animation(options) {
    if (!options.element) return;
    if (!options.distance) options.distance = options.element.offsetWidth;
    if (!options.speed && !options.duration) options.duration = 1500;
    if (!options.slide_delay) options.slide_delay = 0;
    if (!options.fade_delay) options.fade_delay = 0;
    if (!options.direction) options.direction = left;
    if (!options.fadetime) options.fadetime = 500;
    if (!options.speed) {
        options.speed = el.offsetWidth / options.duration
    }
    options.element.classList.add("scrolling_animation");
    switch (options.direction) {
        case "up":
            translateOption = ["translateY", -1];
            break;
        case "down":
            translateOption = ["translateY", 1];
            break;
        case "left":
            translateOption = ["translateX", -1];
            break;
        default:
            translateOption = ["translateX", 1]
    }
    let initialTransformString = "";
    let initialTransformArray = [...getComputedStyle(options.element).getPropertyValue("transform").matchAll(/(\w+)\(([^)]*)\)/g)];
    let transformDirectionStartingVal = 0;
    for (let i = 0; i < initialTransformArray.length; i++) {
        if (initialTransformArray[i][1] == translateOption[0]) {
            let splitVal = initialTransformArray[i][2].match(/^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/);
            if (splitVal[2] == "%") {
                if (initialTransformArray[i][1] == "translateX") {
                    splitVal[1] = splitVal[1] * options.element.offsetWidth / 100
                } else if (initialTransformArray[i][1] == "translateY") {
                    splitVal[1] = splitVal[1] * options.element.offsetHeight / 100
                }
            } else if (splitVal[2] == "vh") {
                splitVal[1] = splitVal[1] * window.innerHeight / 100
            } else if (splitVal[2] == "vw") {
                splitVal[1] = splitVal[1] * window.innerWidth / 100
            }
            initialTransformArray[i][2] = splitVal[1] + "px";
            transformDirectionStartingVal = parseFloat(splitVal[1])
        }
        initialTransformString += initialTransformArray[i][1] + "(" + initialTransformArray[i][2] + ") "
    }
    var anim = {
        speed: options.speed,
        fadetime: options.fadetime,
        current_distance: 0,
        current_opacity: 1,
        slide_delay_animation_counter: 0,
        fade_delay_animation_counter: 0,
        animation_last_time: performance.now(),
        elem: options.element,
        callback: function() {
            var now = performance.now();
            var dt = now - this.animation_last_time;
            this.animation_last_time = now;
            if (this.slide_delay_animation_counter < options.slide_delay) {
                this.slide_delay_animation_counter += dt
            } else if (this.current_distance < options.distance) {
                this.current_distance += this.speed * dt;
                let transformString = "";
                for (let match of initialTransformArray) {
                    if (match[1] == translateOption[0]) {
                        let val = transformDirectionStartingVal + translateOption[1] * this.current_distance;
                        transformString += match[1] + "(" + val + "px) "
                    } else {
                        transformString += match[1] + "(" + match[2] + ") "
                    }
                }
                this.elem.style.transform = transformString
            } else if (this.fade_delay_animation_counter < options.fade_delay) {
                this.fade_delay_animation_counter += dt
            } else if (this.current_opacity > 0) {
                this.current_opacity = Math.max(0, this.current_opacity - dt / this.fadetime);
                anim.elem.style.filter = "opacity(" + this.current_opacity.toString() + ")"
            } else {
                this.elem.style.transform = initialTransformString;
                this.elem.style.filter = "opacity(1)";
                this.current_distance = 0;
                this.current_opacity = 1;
                this.slide_delay_animation_counter = 0;
                this.fade_delay_animation_counter = 0
            }
            if (this.elem.classList.contains("scrolling_animation")) {
                window.requestAnimationFrame((function() {
                    anim.callback()
                }))
            } else {
                this.elem.style.transform = initialTransformString;
                this.elem.style.filter = "opacity(1)"
            }
        }
    };
    anim.callback()
}