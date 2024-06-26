! function(t, e) {
    "object" == typeof exports && "object" == typeof module ? module.exports = e(require("cross-fetch/polyfill")) : "function" == typeof define && define.amd ? define("PrismicJS", ["cross-fetch/polyfill"], e) : "object" == typeof exports ? exports.PrismicJS = e(require("cross-fetch/polyfill")) : t.PrismicJS = e(t["cross-fetch/polyfill"])
}("undefined" != typeof self ? self : this, function(t) {
    return function(t) {
        var e = {};

        function n(r) {
            if (e[r]) return e[r].exports;
            var o = e[r] = {
                i: r,
                l: !1,
                exports: {}
            };
            return t[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
        }
        return n.m = t, n.c = e, n.d = function(t, e, r) {
            n.o(t, e) || Object.defineProperty(t, e, {
                enumerable: !0,
                get: r
            })
        }, n.r = function(t) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            }), Object.defineProperty(t, "__esModule", {
                value: !0
            })
        }, n.t = function(t, e) {
            if (1 & e && (t = n(t)), 8 & e) return t;
            if (4 & e && "object" == typeof t && t && t.__esModule) return t;
            var r = Object.create(null);
            if (n.r(r), Object.defineProperty(r, "default", {
                    enumerable: !0,
                    value: t
                }), 2 & e && "string" != typeof t)
                for (var o in t) n.d(r, o, function(e) {
                    return t[e]
                }.bind(null, o));
            return r
        }, n.n = function(t) {
            var e = t && t.__esModule ? function() {
                return t.default
            } : function() {
                return t
            };
            return n.d(e, "a", e), e
        }, n.o = function(t, e) {
            return Object.prototype.hasOwnProperty.call(t, e)
        }, n.p = "", n(n.s = 19)
    }([function(t, e, n) {
        "use strict";
        e.a = function(t) {
            var e = this.constructor;
            return this.then(function(n) {
                return e.resolve(t()).then(function() {
                    return n
                })
            }, function(n) {
                return e.resolve(t()).then(function() {
                    return e.reject(n)
                })
            })
        }
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = n(4),
            o = n(3),
            i = n(5),
            u = n(11);
        e.PREVIEW_COOKIE = "io.prismic.preview", e.EXPERIMENT_COOKIE = "io.prismic.experiment";
        var a = function() {
            function t(t, e, n) {
                this.data = t, this.masterRef = t.refs.filter(function(t) {
                    return t.isMasterRef
                })[0], this.experiments = new r.Experiments(t.experiments), this.bookmarks = t.bookmarks, this.httpClient = e, this.options = n, this.refs = t.refs, this.tags = t.tags, this.types = t.types
            }
            return t.prototype.form = function(t) {
                var e = this.data.forms[t];
                return e ? new o.SearchForm(e, this.httpClient) : null
            }, t.prototype.everything = function() {
                var t = this.form("everything");
                if (!t) throw new Error("Missing everything form");
                return t
            }, t.prototype.master = function() {
                return this.masterRef.ref
            }, t.prototype.ref = function(t) {
                var e = this.data.refs.filter(function(e) {
                    return e.label === t
                })[0];
                return e ? e.ref : null
            }, t.prototype.currentExperiment = function() {
                return this.experiments.current()
            }, t.prototype.query = function(t, n, r) {
                void 0 === r && (r = function() {});
                var o = "function" == typeof n ? {
                        options: {},
                        callback: n
                    } : {
                        options: n || {},
                        callback: r
                    },
                    i = o.options,
                    a = o.callback,
                    s = this.everything();
                for (var f in i) s = s.set(f, i[f]);
                if (!i.ref) {
                    var c = "";
                    this.options.req ? c = this.options.req.headers.cookie || "" : "undefined" != typeof window && window.document && (c = window.document.cookie || "");
                    var l = u.default.parse(c),
                        h = l[e.PREVIEW_COOKIE],
                        p = this.experiments.refFromCookie(l[e.EXPERIMENT_COOKIE]);
                    s = s.ref(h || p || this.masterRef.ref)
                }
                return t && s.query(t), s.submit(a)
            }, t.prototype.queryFirst = function(t, e, n) {
                var r = "function" == typeof e ? {
                        options: {},
                        callback: e
                    } : {
                        options: e || {},
                        callback: n || function() {}
                    },
                    o = r.options,
                    i = r.callback;
                return o.page = 1, o.pageSize = 1, this.query(t, o).then(function(t) {
                    var e = t && t.results && t.results[0];
                    return i(null, e), e
                }).catch(function(t) {
                    throw i(t), t
                })
            }, t.prototype.getByID = function(t, e, n) {
                var r = e || {};
                return r.lang || (r.lang = "*"), this.queryFirst(i.default.at("document.id", t), r, n)
            }, t.prototype.getByIDs = function(t, e, n) {
                var r = e || {};
                return r.lang || (r.lang = "*"), this.query(i.default.in("document.id", t), r, n)
            }, t.prototype.getByUID = function(t, e, n, r) {
                var o = n || {};
                if ("*" === o.lang) throw new Error("FORDIDDEN. You can't use getByUID with *, use the predicates instead.");
                return o.page || (o.page = 1), this.queryFirst(i.default.at("my." + t + ".uid", e), o, r)
            }, t.prototype.getSingle = function(t, e, n) {
                var r = e || {};
                return this.queryFirst(i.default.at("document.type", t), r, n)
            }, t.prototype.getBookmark = function(t, e, n) {
                var r = this.data.bookmarks[t];
                return r ? this.getByID(r, e, n) : Promise.reject("Error retrieving bookmarked id")
            }, t.prototype.previewSession = function(t, e, n, r) {
                var o = this;
                return new Promise(function(i, u) {
                    o.httpClient.request(t, function(a, s) {
                        if (a) r && r(a), u(a);
                        else if (s) {
                            if (s.mainDocument) return o.getByID(s.mainDocument, {
                                ref: t
                            }).then(function(t) {
                                if (t) {
                                    var o = e(t);
                                    r && r(null, o), i(o)
                                } else r && r(null, n), i(n)
                            }).catch(u);
                            r && r(null, n), i(n)
                        }
                    })
                })
            }, t
        }();
        e.default = a
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = n(1),
            o = n(10);

        function i(t) {
            return t.indexOf("?") > -1 ? "&" : "?"
        }
        var u = function() {
            function t(t, e) {
                if (this.options = e || {}, this.url = t, this.options.accessToken) {
                    var n = "access_token=" + this.options.accessToken;
                    this.url += i(t) + n
                }
                this.options.routes && (this.url += i(t) + "routes=" + JSON.stringify(this.options.routes)), this.apiDataTTL = this.options.apiDataTTL || 5, this.httpClient = new o.default(this.options.requestHandler, this.options.apiCache, this.options.proxyAgent)
            }
            return t.prototype.get = function(t) {
                var e = this;
                return this.httpClient.cachedRequest(this.url, {
                    ttl: this.apiDataTTL
                }).then(function(n) {
                    var o = new r.default(n, e.httpClient, e.options);
                    return t && t(null, o), o
                }).catch(function(e) {
                    throw t && t(e), e
                })
            }, t
        }();
        e.default = u
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = function() {
            function t(t, e) {
                this.id = t, this.api = e, this.fields = {}
            }
            return t.prototype.set = function(t, e) {
                return this.fields[t] = e, this
            }, t.prototype.ref = function(t) {
                return this.set("ref", t)
            }, t.prototype.query = function(t) {
                return this.set("q", t)
            }, t.prototype.pageSize = function(t) {
                return this.set("pageSize", t)
            }, t.prototype.fetch = function(t) {
                return console.warn("Warning: Using Fetch is deprecated. Use the property `graphQuery` instead."), this.set("fetch", t)
            }, t.prototype.fetchLinks = function(t) {
                return console.warn("Warning: Using FetchLinks is deprecated. Use the property `graphQuery` instead."), this.set("fetchLinks", t)
            }, t.prototype.graphQuery = function(t) {
                return this.set("graphQuery", t)
            }, t.prototype.lang = function(t) {
                return this.set("lang", t)
            }, t.prototype.page = function(t) {
                return this.set("page", t)
            }, t.prototype.after = function(t) {
                return this.set("after", t)
            }, t.prototype.orderings = function(t) {
                return this.set("orderings", t)
            }, t.prototype.url = function() {
                var e = this;
                return this.api.get().then(function(n) {
                    return t.toSearchForm(e, n).url()
                })
            }, t.prototype.submit = function(e) {
                var n = this;
                return this.api.get().then(function(r) {
                    return t.toSearchForm(n, r).submit(e)
                })
            }, t.toSearchForm = function(t, e) {
                var n = e.form(t.id);
                if (n) return Object.keys(t.fields).reduce(function(e, n) {
                    var r = t.fields[n];
                    return "q" === n ? e.query(r) : "pageSize" === n ? e.pageSize(r) : "fetch" === n ? e.fetch(r) : "fetchLinks" === n ? e.fetchLinks(r) : "graphQuery" === n ? e.graphQuery(r) : "lang" === n ? e.lang(r) : "page" === n ? e.page(r) : "after" === n ? e.after(r) : "orderings" === n ? e.orderings(r) : e.set(n, r)
                }, n);
                throw new Error("Unable to access to form " + t.id)
            }, t
        }();
        e.LazySearchForm = r;
        var o = function() {
            function t(t, e) {
                for (var n in this.httpClient = e, this.form = t, this.data = {}, t.fields) t.fields[n].default && (this.data[n] = [t.fields[n].default])
            }
            return t.prototype.set = function(t, e) {
                var n = this.form.fields[t];
                if (!n) throw new Error("Unknown field " + t);
                var r = "" === e || void 0 === e ? null : e,
                    o = this.data[t] || [];
                return o = n.multiple ? r ? o.concat([r]) : o : r ? [r] : o, this.data[t] = o, this
            }, t.prototype.ref = function(t) {
                return this.set("ref", t)
            }, t.prototype.query = function(t) {
                if ("string" == typeof t) return this.query([t]);
                if (Array.isArray(t)) return this.set("q", "[" + t.join("") + "]");
                throw new Error("Invalid query : " + t)
            }, t.prototype.pageSize = function(t) {
                return this.set("pageSize", t)
            }, t.prototype.fetch = function(t) {
                console.warn("Warning: Using Fetch is deprecated. Use the property `graphQuery` instead.");
                var e = Array.isArray(t) ? t.join(",") : t;
                return this.set("fetch", e)
            }, t.prototype.fetchLinks = function(t) {
                console.warn("Warning: Using FetchLinks is deprecated. Use the property `graphQuery` instead.");
                var e = Array.isArray(t) ? t.join(",") : t;
                return this.set("fetchLinks", e)
            }, t.prototype.graphQuery = function(t) {
                return this.set("graphQuery", t)
            }, t.prototype.lang = function(t) {
                return this.set("lang", t)
            }, t.prototype.page = function(t) {
                return this.set("page", t)
            }, t.prototype.after = function(t) {
                return this.set("after", t)
            }, t.prototype.orderings = function(t) {
                return t ? this.set("orderings", "[" + t.join(",") + "]") : this
            }, t.prototype.url = function() {
                var t = this.form.action;
                if (this.data) {
                    var e = t.indexOf("?") > -1 ? "&" : "?";
                    for (var n in this.data)
                        if (this.data.hasOwnProperty(n)) {
                            var r = this.data[n];
                            if (r)
                                for (var o = 0; o < r.length; o++) t += e + n + "=" + encodeURIComponent(r[o]), e = "&"
                        }
                }
                return t
            }, t.prototype.submit = function(t) {
                return this.httpClient.cachedRequest(this.url()).then(function(e) {
                    return t && t(null, e), e
                }).catch(function(e) {
                    throw t && t(e), e
                })
            }, t
        }();
        e.SearchForm = o
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = function() {
            function t(t) {
                this.data = {}, this.data = t
            }
            return t.prototype.id = function() {
                return this.data.id
            }, t.prototype.ref = function() {
                return this.data.ref
            }, t.prototype.label = function() {
                return this.data.label
            }, t
        }();
        e.Variation = r;
        var o = function() {
            function t(t) {
                this.data = {}, this.data = t, this.variations = (t.variations || []).map(function(t) {
                    return new r(t)
                })
            }
            return t.prototype.id = function() {
                return this.data.id
            }, t.prototype.googleId = function() {
                return this.data.googleId
            }, t.prototype.name = function() {
                return this.data.name
            }, t
        }();
        e.Experiment = o;
        var i = function() {
            function t(t) {
                t && (this.drafts = (t.drafts || []).map(function(t) {
                    return new o(t)
                }), this.running = (t.running || []).map(function(t) {
                    return new o(t)
                }))
            }
            return t.prototype.current = function() {
                return this.running.length > 0 ? this.running[0] : null
            }, t.prototype.refFromCookie = function(t) {
                if (!t || "" === t.trim()) return null;
                var e = t.trim().split(" ");
                if (e.length < 2) return null;
                var n = e[0],
                    r = parseInt(e[1], 10),
                    o = this.running.filter(function(t) {
                        return t.googleId() === n && t.variations.length > r
                    })[0];
                return o ? o.variations[r].ref() : null
            }, t
        }();
        e.Experiments = i
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = "at",
            o = "not",
            i = "missing",
            u = "has",
            a = "any",
            s = "in",
            f = "fulltext",
            c = "similar",
            l = "number.gt",
            h = "number.lt",
            p = "number.inRange",
            d = "date.before",
            y = "date.after",
            m = "date.between",
            g = "date.day-of-month",
            v = "date.day-of-month-after",
            w = "date.day-of-month-before",
            b = "date.day-of-week",
            _ = "date.day-of-week-after",
            k = "date.day-of-week-before",
            T = "date.month",
            I = "date.month-before",
            E = "date.month-after",
            O = "date.year",
            A = "date.hour",
            x = "date.hour-before",
            M = "date.hour-after",
            q = "geopoint.near";

        function j(t) {
            if ("string" == typeof t) return '"' + t + '"';
            if ("number" == typeof t) return t.toString();
            if (t instanceof Date) return t.getTime().toString();
            if (Array.isArray(t)) return "[" + t.map(function(t) {
                return j(t)
            }).join(",") + "]";
            throw new Error("Unable to encode " + t + " of type " + typeof t)
        }
        var S = {
                near: function(t, e, n, r) {
                    return "[" + q + "(" + t + ", " + e + ", " + n + ", " + r + ")]"
                }
            },
            C = {
                before: function(t, e) {
                    return "[" + d + "(" + t + ", " + j(e) + ")]"
                },
                after: function(t, e) {
                    return "[" + y + "(" + t + ", " + j(e) + ")]"
                },
                between: function(t, e, n) {
                    return "[" + m + "(" + t + ", " + j(e) + ", " + j(n) + ")]"
                },
                dayOfMonth: function(t, e) {
                    return "[" + g + "(" + t + ", " + e + ")]"
                },
                dayOfMonthAfter: function(t, e) {
                    return "[" + v + "(" + t + ", " + e + ")]"
                },
                dayOfMonthBefore: function(t, e) {
                    return "[" + w + "(" + t + ", " + e + ")]"
                },
                dayOfWeek: function(t, e) {
                    return "[" + b + "(" + t + ", " + j(e) + ")]"
                },
                dayOfWeekAfter: function(t, e) {
                    return "[" + _ + "(" + t + ", " + j(e) + ")]"
                },
                dayOfWeekBefore: function(t, e) {
                    return "[" + k + "(" + t + ", " + j(e) + ")]"
                },
                month: function(t, e) {
                    return "[" + T + "(" + t + ", " + j(e) + ")]"
                },
                monthBefore: function(t, e) {
                    return "[" + I + "(" + t + ", " + j(e) + ")]"
                },
                monthAfter: function(t, e) {
                    return "[" + E + "(" + t + ", " + j(e) + ")]"
                },
                year: function(t, e) {
                    return "[" + O + "(" + t + ", " + e + ")]"
                },
                hour: function(t, e) {
                    return "[" + A + "(" + t + ", " + e + ")]"
                },
                hourBefore: function(t, e) {
                    return "[" + x + "(" + t + ", " + e + ")]"
                },
                hourAfter: function(t, e) {
                    return "[" + M + "(" + t + ", " + e + ")]"
                }
            },
            F = {
                gt: function(t, e) {
                    return "[" + l + "(" + t + ", " + e + ")]"
                },
                lt: function(t, e) {
                    return "[" + h + "(" + t + ", " + e + ")]"
                },
                inRange: function(t, e, n) {
                    return "[" + p + "(" + t + ", " + e + ", " + n + ")]"
                }
            };
        e.default = {
            at: function(t, e) {
                return "[" + r + "(" + t + ", " + j(e) + ")]"
            },
            not: function(t, e) {
                return "[" + o + "(" + t + ", " + j(e) + ")]"
            },
            missing: function(t) {
                return "[" + i + "(" + t + ")]"
            },
            has: function(t) {
                return "[" + u + "(" + t + ")]"
            },
            any: function(t, e) {
                return "[" + a + "(" + t + ", " + j(e) + ")]"
            },
            in : function(t, e) {
                return "[" + s + "(" + t + ", " + j(e) + ")]"
            },
            fulltext: function(t, e) {
                return "[" + f + "(" + t + ", " + j(e) + ")]"
            },
            similar: function(t, e) {
                return "[" + c + '("' + t + '", ' + e + ")]"
            },
            date: C,
            dateBefore: C.before,
            dateAfter: C.after,
            dateBetween: C.between,
            dayOfMonth: C.dayOfMonth,
            dayOfMonthAfter: C.dayOfMonthAfter,
            dayOfMonthBefore: C.dayOfMonthBefore,
            dayOfWeek: C.dayOfWeek,
            dayOfWeekAfter: C.dayOfWeekAfter,
            dayOfWeekBefore: C.dayOfWeekBefore,
            month: C.month,
            monthBefore: C.monthBefore,
            monthAfter: C.monthAfter,
            year: C.year,
            hour: C.hour,
            hourBefore: C.hourBefore,
            hourAfter: C.hourAfter,
            number: F,
            gt: F.gt,
            lt: F.lt,
            inRange: F.inRange,
            near: S.near,
            geopoint: S
        }
    }, function(t, e, n) {
        "use strict";
        (function(t) {
            var r = n(0),
                o = setTimeout;

            function i() {}

            function u(t) {
                if (!(this instanceof u)) throw new TypeError("Promises must be constructed via new");
                if ("function" != typeof t) throw new TypeError("not a function");
                this._state = 0, this._handled = !1, this._value = void 0, this._deferreds = [], l(t, this)
            }

            function a(t, e) {
                for (; 3 === t._state;) t = t._value;
                0 !== t._state ? (t._handled = !0, u._immediateFn(function() {
                    var n = 1 === t._state ? e.onFulfilled : e.onRejected;
                    if (null !== n) {
                        var r;
                        try {
                            r = n(t._value)
                        } catch (t) {
                            return void f(e.promise, t)
                        }
                        s(e.promise, r)
                    } else(1 === t._state ? s : f)(e.promise, t._value)
                })) : t._deferreds.push(e)
            }

            function s(t, e) {
                try {
                    if (e === t) throw new TypeError("A promise cannot be resolved with itself.");
                    if (e && ("object" == typeof e || "function" == typeof e)) {
                        var n = e.then;
                        if (e instanceof u) return t._state = 3, t._value = e, void c(t);
                        if ("function" == typeof n) return void l(function(t, e) {
                            return function() {
                                t.apply(e, arguments)
                            }
                        }(n, e), t)
                    }
                    t._state = 1, t._value = e, c(t)
                } catch (e) {
                    f(t, e)
                }
            }

            function f(t, e) {
                t._state = 2, t._value = e, c(t)
            }

            function c(t) {
                2 === t._state && 0 === t._deferreds.length && u._immediateFn(function() {
                    t._handled || u._unhandledRejectionFn(t._value)
                });
                for (var e = 0, n = t._deferreds.length; e < n; e++) a(t, t._deferreds[e]);
                t._deferreds = null
            }

            function l(t, e) {
                var n = !1;
                try {
                    t(function(t) {
                        n || (n = !0, s(e, t))
                    }, function(t) {
                        n || (n = !0, f(e, t))
                    })
                } catch (t) {
                    if (n) return;
                    n = !0, f(e, t)
                }
            }
            u.prototype.catch = function(t) {
                return this.then(null, t)
            }, u.prototype.then = function(t, e) {
                var n = new this.constructor(i);
                return a(this, new function(t, e, n) {
                    this.onFulfilled = "function" == typeof t ? t : null, this.onRejected = "function" == typeof e ? e : null, this.promise = n
                }(t, e, n)), n
            }, u.prototype.finally = r.a, u.all = function(t) {
                return new u(function(e, n) {
                    if (!t || void 0 === t.length) throw new TypeError("Promise.all accepts an array");
                    var r = Array.prototype.slice.call(t);
                    if (0 === r.length) return e([]);
                    var o = r.length;

                    function i(t, u) {
                        try {
                            if (u && ("object" == typeof u || "function" == typeof u)) {
                                var a = u.then;
                                if ("function" == typeof a) return void a.call(u, function(e) {
                                    i(t, e)
                                }, n)
                            }
                            r[t] = u, 0 == --o && e(r)
                        } catch (t) {
                            n(t)
                        }
                    }
                    for (var u = 0; u < r.length; u++) i(u, r[u])
                })
            }, u.resolve = function(t) {
                return t && "object" == typeof t && t.constructor === u ? t : new u(function(e) {
                    e(t)
                })
            }, u.reject = function(t) {
                return new u(function(e, n) {
                    n(t)
                })
            }, u.race = function(t) {
                return new u(function(e, n) {
                    for (var r = 0, o = t.length; r < o; r++) t[r].then(e, n)
                })
            }, u._immediateFn = "function" == typeof t && function(e) {
                t(e)
            } || function(t) {
                o(t, 0)
            }, u._unhandledRejectionFn = function(t) {
                "undefined" != typeof console && console && console.warn("Possible Unhandled Promise Rejection:", t)
            }, e.a = u
        }).call(this, n(17).setImmediate)
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = function() {
            function t(t) {
                this.options = t || {}
            }
            return t.prototype.request = function(t, e) {
                ! function(t, e, n) {
                    var r = {
                        headers: {
                            Accept: "application/json"
                        }
                    };
                    e && e.proxyAgent && (r.agent = e.proxyAgent), fetch(t, r).then(function(e) {
                        return ~~(e.status / 100 != 2) ? e.text().then(function() {
                            var n = new Error("Unexpected status code [" + e.status + "] on URL " + t);
                            throw n.status = e.status, n
                        }) : e.json().then(function(t) {
                            var r = e.headers.get("cache-control"),
                                o = r ? /max-age=(\d+)/.exec(r) : null,
                                i = o ? parseInt(o[1], 10) : void 0;
                            n(null, t, e, i)
                        })
                    }).catch(n)
                }(t, this.options, e)
            }, t
        }();
        e.DefaultRequestHandler = r
    }, function(t, e, n) {
        "use strict";

        function r(t) {
            this.size = 0, this.limit = t, this._keymap = {}
        }
        e.__esModule = !0, e.MakeLRUCache = function(t) {
            return new r(t)
        }, r.prototype.put = function(t, e) {
            var n = {
                key: t,
                value: e
            };
            if (this._keymap[t] = n, this.tail ? (this.tail.newer = n, n.older = this.tail) : this.head = n, this.tail = n, this.size === this.limit) return this.shift();
            this.size++
        }, r.prototype.shift = function() {
            var t = this.head;
            return t && (this.head.newer ? (this.head = this.head.newer, this.head.older = void 0) : this.head = void 0, t.newer = t.older = void 0, delete this._keymap[t.key]), console.log("purging ", t.key), t
        }, r.prototype.get = function(t, e) {
            var n = this._keymap[t];
            if (void 0 !== n) return n === this.tail ? e ? n : n.value : (n.newer && (n === this.head && (this.head = n.newer), n.newer.older = n.older), n.older && (n.older.newer = n.newer), n.newer = void 0, n.older = this.tail, this.tail && (this.tail.newer = n), this.tail = n, e ? n : n.value)
        }, r.prototype.find = function(t) {
            return this._keymap[t]
        }, r.prototype.set = function(t, e) {
            var n, r = this.get(t, !0);
            return r ? (n = r.value, r.value = e) : (n = this.put(t, e)) && (n = n.value), n
        }, r.prototype.remove = function(t) {
            var e = this._keymap[t];
            if (e) return delete this._keymap[e.key], e.newer && e.older ? (e.older.newer = e.newer, e.newer.older = e.older) : e.newer ? (e.newer.older = void 0, this.head = e.newer) : e.older ? (e.older.newer = void 0, this.tail = e.older) : this.head = this.tail = void 0, this.size--, e.value
        }, r.prototype.removeAll = function() {
            this.head = this.tail = void 0, this.size = 0, this._keymap = {}
        }, "function" == typeof Object.keys ? r.prototype.keys = function() {
            return Object.keys(this._keymap)
        } : r.prototype.keys = function() {
            var t = [];
            for (var e in this._keymap) t.push(e);
            return t
        }, r.prototype.forEach = function(t, e, n) {
            var r;
            if (!0 === e ? (n = !0, e = void 0) : "object" != typeof e && (e = this), n)
                for (r = this.tail; r;) t.call(e, r.key, r.value, this), r = r.older;
            else
                for (r = this.head; r;) t.call(e, r.key, r.value, this), r = r.newer
        }, r.prototype.toString = function() {
            for (var t = "", e = this.head; e;) t += String(e.key) + ":" + e.value, (e = e.newer) && (t += " < ");
            return t
        }
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = n(8),
            o = function() {
                function t(t) {
                    void 0 === t && (t = 1e3), this.lru = r.MakeLRUCache(t)
                }
                return t.prototype.isExpired = function(t) {
                    var e = this.lru.get(t, !1);
                    return !!e && (0 !== e.expiredIn && e.expiredIn < Date.now())
                }, t.prototype.get = function(t, e) {
                    var n = this.lru.get(t, !1);
                    n && !this.isExpired(t) ? e(null, n.data) : e && e(null)
                }, t.prototype.set = function(t, e, n, r) {
                    this.lru.remove(t), this.lru.put(t, {
                        data: e,
                        expiredIn: n ? Date.now() + 1e3 * n : 0
                    }), r && r(null)
                }, t.prototype.remove = function(t, e) {
                    this.lru.remove(t), e && e(null)
                }, t.prototype.clear = function(t) {
                    this.lru.removeAll(), t && t(null)
                }, t
            }();
        e.DefaultApiCache = o
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = n(9),
            o = n(7),
            i = function() {
                function t(t, e, n) {
                    this.requestHandler = t || new o.DefaultRequestHandler({
                        proxyAgent: n
                    }), this.cache = e || new r.DefaultApiCache
                }
                return t.prototype.request = function(t, e) {
                    this.requestHandler.request(t, function(t, n, r, o) {
                        t ? e && e(t, null, r, o) : n && e && e(null, n, r, o)
                    })
                }, t.prototype.cachedRequest = function(t, e) {
                    var n = this,
                        r = e || {};
                    return new Promise(function(e, o) {
                        ! function(e) {
                            var o = r.cacheKey || t;
                            n.cache.get(o, function(i, u) {
                                i || u ? e(i, u) : n.request(t, function(t, i, u, a) {
                                    if (t) e(t, null);
                                    else {
                                        var s = a || r.ttl;
                                        s && n.cache.set(o, i, s, e), e(null, i)
                                    }
                                })
                            })
                        }(function(t, n) {
                            t && o(t), n && e(n)
                        })
                    })
                }, t
            }();
        e.default = i
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = decodeURIComponent;
        e.default = {
            parse: function(t, e) {
                if ("string" != typeof t) throw new TypeError("argument str must be a string");
                var n = {},
                    o = e || {},
                    i = t.split(/; */),
                    u = o.decode || r;
                return i.forEach(function(t) {
                    var e = t.indexOf("=");
                    if (!(e < 0)) {
                        var r = t.substr(0, e).trim(),
                            o = t.substr(++e, t.length).trim();
                        '"' == o[0] && (o = o.slice(1, -1)), void 0 == n[r] && (n[r] = function(t, e) {
                            try {
                                return e(t)
                            } catch (e) {
                                return t
                            }
                        }(o, u))
                    }
                }), n
            }
        }
    }, function(t, e, n) {
        "use strict";
        e.__esModule = !0;
        var r = n(3),
            o = n(2),
            i = function() {
                function t(t, e) {
                    this.api = new o.default(t, e)
                }
                return t.prototype.getApi = function() {
                    return this.api.get()
                }, t.prototype.everything = function() {
                    return this.form("everything")
                }, t.prototype.form = function(t) {
                    return new r.LazySearchForm(t, this.api)
                }, t.prototype.query = function(t, e, n) {
                    return this.getApi().then(function(r) {
                        return r.query(t, e, n)
                    })
                }, t.prototype.queryFirst = function(t, e, n) {
                    return this.getApi().then(function(r) {
                        return r.queryFirst(t, e, n)
                    })
                }, t.prototype.getByID = function(t, e, n) {
                    return this.getApi().then(function(r) {
                        return r.getByID(t, e, n)
                    })
                }, t.prototype.getByIDs = function(t, e, n) {
                    return this.getApi().then(function(r) {
                        return r.getByIDs(t, e, n)
                    })
                }, t.prototype.getByUID = function(t, e, n, r) {
                    return this.getApi().then(function(o) {
                        return o.getByUID(t, e, n, r)
                    })
                }, t.prototype.getSingle = function(t, e, n) {
                    return this.getApi().then(function(r) {
                        return r.getSingle(t, e, n)
                    })
                }, t.prototype.getBookmark = function(t, e, n) {
                    return this.getApi().then(function(r) {
                        return r.getBookmark(t, e, n)
                    })
                }, t.prototype.previewSession = function(t, e, n, r) {
                    return this.getApi().then(function(o) {
                        return o.previewSession(t, e, n, r)
                    })
                }, t.getApi = function(t, e) {
                    return new o.default(t, e).get()
                }, t
            }();
        e.DefaultClient = i
    }, function(t, e, n) {
        "use strict";
        var r, o = n(5),
            i = n(4),
            u = n(12),
            a = n(2),
            s = n(1);
        ! function(t) {
            function e(t, e) {
                return u.DefaultClient.getApi(t, e)
            }
            t.experimentCookie = s.EXPERIMENT_COOKIE, t.previewCookie = s.PREVIEW_COOKIE, t.Predicates = o.default, t.Experiments = i.Experiments, t.Api = a.default, t.client = function(t, e) {
                return new u.DefaultClient(t, e)
            }, t.getApi = e, t.api = function(t, n) {
                return e(t, n)
            }
        }(r || (r = {})), t.exports = r
    }, function(e, n) {
        e.exports = t
    }, function(t, e) {
        var n, r, o = t.exports = {};

        function i() {
            throw new Error("setTimeout has not been defined")
        }

        function u() {
            throw new Error("clearTimeout has not been defined")
        }

        function a(t) {
            if (n === setTimeout) return setTimeout(t, 0);
            if ((n === i || !n) && setTimeout) return n = setTimeout, setTimeout(t, 0);
            try {
                return n(t, 0)
            } catch (e) {
                try {
                    return n.call(null, t, 0)
                } catch (e) {
                    return n.call(this, t, 0)
                }
            }
        }! function() {
            try {
                n = "function" == typeof setTimeout ? setTimeout : i
            } catch (t) {
                n = i
            }
            try {
                r = "function" == typeof clearTimeout ? clearTimeout : u
            } catch (t) {
                r = u
            }
        }();
        var s, f = [],
            c = !1,
            l = -1;

        function h() {
            c && s && (c = !1, s.length ? f = s.concat(f) : l = -1, f.length && p())
        }

        function p() {
            if (!c) {
                var t = a(h);
                c = !0;
                for (var e = f.length; e;) {
                    for (s = f, f = []; ++l < e;) s && s[l].run();
                    l = -1, e = f.length
                }
                s = null, c = !1,
                    function(t) {
                        if (r === clearTimeout) return clearTimeout(t);
                        if ((r === u || !r) && clearTimeout) return r = clearTimeout, clearTimeout(t);
                        try {
                            r(t)
                        } catch (e) {
                            try {
                                return r.call(null, t)
                            } catch (e) {
                                return r.call(this, t)
                            }
                        }
                    }(t)
            }
        }

        function d(t, e) {
            this.fun = t, this.array = e
        }

        function y() {}
        o.nextTick = function(t) {
            var e = new Array(arguments.length - 1);
            if (arguments.length > 1)
                for (var n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
            f.push(new d(t, e)), 1 !== f.length || c || a(p)
        }, d.prototype.run = function() {
            this.fun.apply(null, this.array)
        }, o.title = "browser", o.browser = !0, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = y, o.addListener = y, o.once = y, o.off = y, o.removeListener = y, o.removeAllListeners = y, o.emit = y, o.prependListener = y, o.prependOnceListener = y, o.listeners = function(t) {
            return []
        }, o.binding = function(t) {
            throw new Error("process.binding is not supported")
        }, o.cwd = function() {
            return "/"
        }, o.chdir = function(t) {
            throw new Error("process.chdir is not supported")
        }, o.umask = function() {
            return 0
        }
    }, function(t, e, n) {
        (function(t) {
            ! function(e, n) {
                "use strict";
                if (!e.setImmediate) {
                    var r, o = 1,
                        i = {},
                        u = !1,
                        a = e.document,
                        s = Object.getPrototypeOf && Object.getPrototypeOf(e);
                    s = s && s.setTimeout ? s : e, "[object process]" === {}.toString.call(e.process) ? r = function(e) {
                        t.nextTick(function() {
                            c(e)
                        })
                    } : function() {
                        if (e.postMessage && !e.importScripts) {
                            var t = !0,
                                n = e.onmessage;
                            return e.onmessage = function() {
                                t = !1
                            }, e.postMessage("", "*"), e.onmessage = n, t
                        }
                    }() ? function() {
                        var t = "setImmediate$" + Math.random() + "$",
                            n = function(n) {
                                n.source === e && "string" == typeof n.data && 0 === n.data.indexOf(t) && c(+n.data.slice(t.length))
                            };
                        e.addEventListener ? e.addEventListener("message", n, !1) : e.attachEvent("onmessage", n), r = function(n) {
                            e.postMessage(t + n, "*")
                        }
                    }() : e.MessageChannel ? function() {
                        var t = new MessageChannel;
                        t.port1.onmessage = function(t) {
                            c(t.data)
                        }, r = function(e) {
                            t.port2.postMessage(e)
                        }
                    }() : a && "onreadystatechange" in a.createElement("script") ? function() {
                        var t = a.documentElement;
                        r = function(e) {
                            var n = a.createElement("script");
                            n.onreadystatechange = function() {
                                c(e), n.onreadystatechange = null, t.removeChild(n), n = null
                            }, t.appendChild(n)
                        }
                    }() : r = function(t) {
                        setTimeout(c, 0, t)
                    }, s.setImmediate = function(t) {
                        "function" != typeof t && (t = new Function("" + t));
                        for (var e = new Array(arguments.length - 1), n = 0; n < e.length; n++) e[n] = arguments[n + 1];
                        var u = {
                            callback: t,
                            args: e
                        };
                        return i[o] = u, r(o), o++
                    }, s.clearImmediate = f
                }

                function f(t) {
                    delete i[t]
                }

                function c(t) {
                    if (u) setTimeout(c, 0, t);
                    else {
                        var e = i[t];
                        if (e) {
                            u = !0;
                            try {
                                ! function(t) {
                                    var e = t.callback,
                                        r = t.args;
                                    switch (r.length) {
                                        case 0:
                                            e();
                                            break;
                                        case 1:
                                            e(r[0]);
                                            break;
                                        case 2:
                                            e(r[0], r[1]);
                                            break;
                                        case 3:
                                            e(r[0], r[1], r[2]);
                                            break;
                                        default:
                                            e.apply(n, r)
                                    }
                                }(e)
                            } finally {
                                f(t), u = !1
                            }
                        }
                    }
                }
            }("undefined" == typeof self ? "undefined" == typeof global ? this : global : self)
        }).call(this, n(15))
    }, function(t, e, n) {
        var r = "undefined" != typeof global && global || "undefined" != typeof self && self || window,
            o = Function.prototype.apply;

        function i(t, e) {
            this._id = t, this._clearFn = e
        }
        e.setTimeout = function() {
            return new i(o.call(setTimeout, r, arguments), clearTimeout)
        }, e.setInterval = function() {
            return new i(o.call(setInterval, r, arguments), clearInterval)
        }, e.clearTimeout = e.clearInterval = function(t) {
            t && t.close()
        }, i.prototype.unref = i.prototype.ref = function() {}, i.prototype.close = function() {
            this._clearFn.call(r, this._id)
        }, e.enroll = function(t, e) {
            clearTimeout(t._idleTimeoutId), t._idleTimeout = e
        }, e.unenroll = function(t) {
            clearTimeout(t._idleTimeoutId), t._idleTimeout = -1
        }, e._unrefActive = e.active = function(t) {
            clearTimeout(t._idleTimeoutId);
            var e = t._idleTimeout;
            e >= 0 && (t._idleTimeoutId = setTimeout(function() {
                t._onTimeout && t._onTimeout()
            }, e))
        }, n(16), e.setImmediate = "undefined" != typeof self && self.setImmediate || "undefined" != typeof global && global.setImmediate || this && this.setImmediate, e.clearImmediate = "undefined" != typeof self && self.clearImmediate || "undefined" != typeof global && global.clearImmediate || this && this.clearImmediate
    }, function(t, e, n) {
        "use strict";
        n.r(e);
        var r = n(6),
            o = n(0),
            i = function() {
                if ("undefined" != typeof self) return self;
                if ("undefined" != typeof window) return window;
                if ("undefined" != typeof global) return global;
                throw new Error("unable to locate global object")
            }();
        i.Promise ? i.Promise.prototype.finally || (i.Promise.prototype.finally = o.a) : i.Promise = r.a
    }, function(t, e, n) {
        n(18), n(14), t.exports = n(13)
    }])
});