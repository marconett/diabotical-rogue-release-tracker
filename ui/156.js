! function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.i18nextICU = e()
}(this, function() {
    "use strict";

    function t(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }

    function e(t, e) {
        for (var r = 0; r < e.length; r++) {
            var n = e[r];
            n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
        }
    }

    function r(t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t
    }

    function n(t, e, r) {
        return e in t ? Object.defineProperty(t, e, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : t[e] = r, t
    }

    function o(t, e) {
        var r = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(t);
            e && (n = n.filter(function(e) {
                return Object.getOwnPropertyDescriptor(t, e).enumerable
            })), r.push.apply(r, n)
        }
        return r
    }

    function i(t) {
        for (var e = 1; e < arguments.length; e++) {
            var r = null != arguments[e] ? arguments[e] : {};
            e % 2 ? o(Object(r), !0).forEach(function(e) {
                n(t, e, r[e])
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : o(Object(r)).forEach(function(e) {
                Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(r, e))
            })
        }
        return t
    }

    function a(t, e, r) {
        function n(t) {
            return t && t.indexOf("###") > -1 ? t.replace(/###/g, ".") : t
        }

        function o() {
            return !t || "string" == typeof t
        }
        for (var i = "string" != typeof e ? [].concat(e) : e.split("."); i.length > 1;) {
            if (o()) return {};
            var a = n(i.shift());
            !t[a] && r && (t[a] = new r), t = t[a]
        }
        return o() ? {} : {
            obj: t,
            k: n(i.shift())
        }
    }

    function u(t, e, r) {
        var n = a(t, e, Object);
        n.obj[n.k] = r
    }

    function l(t, e) {
        var r = a(t, e),
            n = r.obj,
            o = r.k;
        if (n) return n[o]
    }

    function s(t) {
        return b.call(F.call(arguments, 1), function(e) {
            if (e)
                for (var r in e) void 0 === t[r] && (t[r] = e[r])
        }), t
    }

    function c(t) {
        var e, r, n, o, i = Array.prototype.slice.call(arguments, 1);
        for (e = 0, r = i.length; e < r; e += 1)
            if (n = i[e])
                for (o in n) w.call(n, o) && (t[o] = n[o]);
        return t
    }

    function f(t, e, r) {
        this.locales = t, this.formats = e, this.pluralFn = r
    }

    function p(t) {
        this.id = t
    }

    function h(t, e, r, n, o) {
        this.id = t, this.useOrdinal = e, this.offset = r, this.options = n, this.pluralFn = o
    }

    function m(t, e, r, n) {
        this.id = t, this.offset = e, this.numberFormat = r, this.string = n
    }

    function d(t, e) {
        this.id = t, this.options = e
    }

    function y(t, e, r) {
        var n = "string" == typeof t ? y.__parse(t) : t;
        if (!n || "messageFormatPattern" !== n.type) throw new TypeError("A message must be provided as a String or AST.");
        r = this._mergeFormats(y.formats, r), A(this, "_locale", {
            value: this._resolveLocale(e)
        });
        var o = this._findPluralRuleFunction(this._locale),
            i = this._compilePattern(n, e, r, o),
            a = this;
        this.format = function(e) {
            try {
                return a._format(i, e)
            } catch (e) {
                throw e.variableId ? new Error("The intl string context variable '" + e.variableId + "' was not provided to the string '" + t + "'") : e
            }
        }
    }

    function v() {
        return {
            memoize: !0,
            memoizeFallback: !1,
            bindI18n: "",
            bindI18nStore: ""
        }
    }
    var g = [],
        b = g.forEach,
        F = g.slice,
        w = Object.prototype.hasOwnProperty,
        _ = function() {
            try {
                return !!Object.defineProperty({}, "a", {})
            } catch (t) {
                return !1
            }
        }(),
        A = _ ? Object.defineProperty : function(t, e, r) {
            "get" in r && t.__defineGetter__ ? t.__defineGetter__(e, r.get) : (!w.call(t, e) || "value" in r) && (t[e] = r.value)
        },
        O = Object.create || function(t, e) {
            function r() {}
            var n, o;
            r.prototype = t, n = new r;
            for (o in e) w.call(e, o) && A(n, o, e[o]);
            return n
        };
    f.prototype.compile = function(t) {
        return this.pluralStack = [], this.currentPlural = null, this.pluralNumberFormat = null, this.compileMessage(t)
    }, f.prototype.compileMessage = function(t) {
        if (!t || "messageFormatPattern" !== t.type) throw new Error('Message AST is not of type: "messageFormatPattern"');
        var e, r, n, o = t.elements,
            i = [];
        for (e = 0, r = o.length; e < r; e += 1) switch (n = o[e], n.type) {
            case "messageTextElement":
                i.push(this.compileMessageText(n));
                break;
            case "argumentElement":
                i.push(this.compileArgument(n));
                break;
            default:
                throw new Error("Message element does not have a valid type")
        }
        return i
    }, f.prototype.compileMessageText = function(t) {
        return this.currentPlural && /(^|[^\\])#/g.test(t.value) ? (this.pluralNumberFormat || (this.pluralNumberFormat = new Intl.NumberFormat(this.locales)), new m(this.currentPlural.id, this.currentPlural.format.offset, this.pluralNumberFormat, t.value)) : t.value.replace(/\\#/g, "#")
    }, f.prototype.compileArgument = function(t) {
        var e = t.format;
        if (!e) return new p(t.id);
        var r, n = this.formats,
            o = this.locales,
            i = this.pluralFn;
        switch (e.type) {
            case "numberFormat":
                return r = n.number[e.style], {
                    id: t.id,
                    format: new Intl.NumberFormat(o, r).format
                };
            case "dateFormat":
                return r = n.date[e.style], {
                    id: t.id,
                    format: new Intl.DateTimeFormat(o, r).format
                };
            case "timeFormat":
                return r = n.time[e.style], {
                    id: t.id,
                    format: new Intl.DateTimeFormat(o, r).format
                };
            case "pluralFormat":
                return r = this.compileOptions(t), new h(t.id, e.ordinal, e.offset, r, i);
            case "selectFormat":
                return r = this.compileOptions(t), new d(t.id, r);
            default:
                throw new Error("Message element does not have a valid format type")
        }
    }, f.prototype.compileOptions = function(t) {
        var e = t.format,
            r = e.options,
            n = {};
        this.pluralStack.push(this.currentPlural), this.currentPlural = "pluralFormat" === e.type ? t : null;
        var o, i, a;
        for (o = 0, i = r.length; o < i; o += 1) a = r[o], n[a.selector] = this.compileMessage(a.value);
        return this.currentPlural = this.pluralStack.pop(), n
    }, p.prototype.format = function(t) {
        return t || "number" == typeof t ? "string" == typeof t ? t : String(t) : ""
    }, h.prototype.getOption = function(t) {
        var e = this.options;
        return e["=" + t] || e[this.pluralFn(t - this.offset, this.useOrdinal)] || e.other
    }, m.prototype.format = function(t) {
        var e = this.numberFormat.format(t - this.offset);
        return this.string.replace(/(^|[^\\])#/g, "$1" + e).replace(/\\#/g, "#")
    }, d.prototype.getOption = function(t) {
        var e = this.options;
        return e[t] || e.other
    };
    var C = function() {
        function t(e, r, n, o) {
            this.message = e, this.expected = r, this.found = n, this.location = o, this.name = "SyntaxError", "function" == typeof Error.captureStackTrace && Error.captureStackTrace(this, t)
        }

        function e(e) {
            function r() {
                return o(qt, $t)
            }

            function n(t) {
                var r, n, o = Ht[t];
                if (o) return o;
                for (r = t - 1; !Ht[r];) r--;
                for (o = Ht[r], o = {
                        line: o.line,
                        column: o.column,
                        seenCR: o.seenCR
                    }; r < t;) n = e.charAt(r), "\n" === n ? (o.seenCR || o.line++, o.column = 1, o.seenCR = !1) : "\r" === n || "\u2028" === n || "\u2029" === n ? (o.line++, o.column = 1, o.seenCR = !0) : (o.column++, o.seenCR = !1), r++;
                return Ht[t] = o, o
            }

            function o(t, e) {
                var r = n(t),
                    o = n(e);
                return {
                    start: {
                        offset: t,
                        line: r.line,
                        column: r.column
                    },
                    end: {
                        offset: e,
                        line: o.line,
                        column: o.column
                    }
                }
            }

            function i(t) {
                $t < Jt || ($t > Jt && (Jt = $t, Qt = []), Qt.push(t))
            }

            function a() {
                return u()
            }

            function u() {
                var t, e, r;
                for (t = $t, e = [], r = l(); r !== D;) e.push(r), r = l();
                return e !== D && (qt = t, e = I(e)), t = e
            }

            function l() {
                var t;
                return t = c(), t === D && (t = p()), t
            }

            function s() {
                var t, r, n, o, i, a;
                if (t = $t, r = [], n = $t, o = A(), o !== D ? (i = P(), i !== D ? (a = A(), a !== D ? (o = [o, i, a], n = o) : ($t = n, n = D)) : ($t = n, n = D)) : ($t = n, n = D), n !== D)
                    for (; n !== D;) r.push(n), n = $t, o = A(), o !== D ? (i = P(), i !== D ? (a = A(), a !== D ? (o = [o, i, a], n = o) : ($t = n, n = D)) : ($t = n, n = D)) : ($t = n, n = D);
                else r = D;
                return r !== D && (qt = t, r = R(r)), t = r, t === D && (t = $t, r = _(), t = r !== D ? e.substring(t, $t) : r), t
            }

            function c() {
                var t, e;
                return t = $t, e = s(), e !== D && (qt = t, e = T(e)), t = e
            }

            function f() {
                var t, r, n;
                if ((t = j()) === D) {
                    if (t = $t, r = [], M.test(e.charAt($t)) ? (n = e.charAt($t), $t++) : (n = D, 0 === Vt && i(N)), n !== D)
                        for (; n !== D;) r.push(n), M.test(e.charAt($t)) ? (n = e.charAt($t), $t++) : (n = D, 0 === Vt && i(N));
                    else r = D;
                    t = r !== D ? e.substring(t, $t) : r
                }
                return t
            }

            function p() {
                var t, r, n, o, a, u, l, s, c;
                return t = $t, 123 === e.charCodeAt($t) ? (r = z, $t++) : (r = D, 0 === Vt && i(U)), r !== D ? (n = A(), n !== D ? (o = f(), o !== D ? (a = A(), a !== D ? (u = $t, 44 === e.charCodeAt($t) ? (l = G, $t++) : (l = D, 0 === Vt && i(Z)), l !== D ? (s = A(), s !== D ? (c = h(), c !== D ? (l = [l, s, c], u = l) : ($t = u, u = D)) : ($t = u, u = D)) : ($t = u, u = D), u === D && (u = null), u !== D ? (l = A(), l !== D ? (125 === e.charCodeAt($t) ? (s = B, $t++) : (s = D, 0 === Vt && i(K)), s !== D ? (qt = t, r = W(o, u), t = r) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D), t
            }

            function h() {
                var t;
                return t = m(), t === D && (t = d()) === D && (t = y()) === D && (t = v()), t
            }

            function m() {
                var t, r, n, o, a, u, l;
                return t = $t, e.substr($t, 6) === $ ? (r = $, $t += 6) : (r = D, 0 === Vt && i(q)), r === D && (e.substr($t, 4) === H ? (r = H, $t += 4) : (r = D, 0 === Vt && i(J)), r === D && (e.substr($t, 4) === Q ? (r = Q, $t += 4) : (r = D, 0 === Vt && i(V)))), r !== D ? (n = A(), n !== D ? (o = $t, 44 === e.charCodeAt($t) ? (a = G, $t++) : (a = D, 0 === Vt && i(Z)), a !== D ? (u = A(), u !== D ? (l = P(), l !== D ? (a = [a, u, l], o = a) : ($t = o, o = D)) : ($t = o, o = D)) : ($t = o, o = D), o === D && (o = null), o !== D ? (qt = t, r = X(r, o), t = r) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D), t
            }

            function d() {
                var t, r, n, o, a, u;
                return t = $t, e.substr($t, 6) === Y ? (r = Y, $t += 6) : (r = D, 0 === Vt && i(tt)), r !== D ? (n = A(), n !== D ? (44 === e.charCodeAt($t) ? (o = G, $t++) : (o = D, 0 === Vt && i(Z)), o !== D ? (a = A(), a !== D ? (u = w(), u !== D ? (qt = t, r = et(u), t = r) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D), t
            }

            function y() {
                var t, r, n, o, a, u;
                return t = $t, e.substr($t, 13) === rt ? (r = rt, $t += 13) : (r = D, 0 === Vt && i(nt)), r !== D ? (n = A(), n !== D ? (44 === e.charCodeAt($t) ? (o = G, $t++) : (o = D, 0 === Vt && i(Z)), o !== D ? (a = A(), a !== D ? (u = w(), u !== D ? (qt = t, r = ot(u), t = r) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D), t
            }

            function v() {
                var t, r, n, o, a;
                if (t = $t, e.substr($t, 6) === it ? (r = it, $t += 6) : (r = D, 0 === Vt && i(at)), r !== D)
                    if (A() !== D)
                        if (44 === e.charCodeAt($t) ? (n = G, $t++) : (n = D, 0 === Vt && i(Z)), n !== D)
                            if (A() !== D) {
                                if (o = [], (a = b()) !== D)
                                    for (; a !== D;) o.push(a), a = b();
                                else o = D;
                                o !== D ? (qt = t, r = ut(o), t = r) : ($t = t, t = D)
                            } else $t = t, t = D;
                else $t = t, t = D;
                else $t = t, t = D;
                else $t = t, t = D;
                return t
            }

            function g() {
                var t, r, n, o;
                return t = $t, r = $t, 61 === e.charCodeAt($t) ? (n = lt, $t++) : (n = D, 0 === Vt && i(st)), n !== D ? (o = j(), o !== D ? (n = [n, o], r = n) : ($t = r, r = D)) : ($t = r, r = D), t = r !== D ? e.substring(t, $t) : r, t === D && (t = P()), t
            }

            function b() {
                var t, r, n, o, a, l, s, c, f;
                return t = $t, r = A(), r !== D ? (n = g(), n !== D ? (o = A(), o !== D ? (123 === e.charCodeAt($t) ? (a = z, $t++) : (a = D, 0 === Vt && i(U)), a !== D ? (l = A(), l !== D ? (s = u(), s !== D ? (c = A(), c !== D ? (125 === e.charCodeAt($t) ? (f = B, $t++) : (f = D, 0 === Vt && i(K)), f !== D ? (qt = t, r = ct(n, s), t = r) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D), t
            }

            function F() {
                var t, r, n, o;
                return t = $t, e.substr($t, 7) === ft ? (r = ft, $t += 7) : (r = D, 0 === Vt && i(pt)), r !== D ? (n = A(), n !== D ? (o = j(), o !== D ? (qt = t, r = ht(o), t = r) : ($t = t, t = D)) : ($t = t, t = D)) : ($t = t, t = D), t
            }

            function w() {
                var t, e, r, n;
                if (t = $t, e = F(), e === D && (e = null), e !== D)
                    if (A() !== D) {
                        if (r = [], (n = b()) !== D)
                            for (; n !== D;) r.push(n), n = b();
                        else r = D;
                        r !== D ? (qt = t, e = mt(e, r), t = e) : ($t = t, t = D)
                    } else $t = t, t = D;
                else $t = t, t = D;
                return t
            }

            function _() {
                var t, r;
                if (Vt++, t = [], yt.test(e.charAt($t)) ? (r = e.charAt($t), $t++) : (r = D, 0 === Vt && i(vt)), r !== D)
                    for (; r !== D;) t.push(r), yt.test(e.charAt($t)) ? (r = e.charAt($t), $t++) : (r = D, 0 === Vt && i(vt));
                else t = D;
                return Vt--, t === D && (r = D, 0 === Vt && i(dt)), t
            }

            function A() {
                var t, r, n;
                for (Vt++, t = $t, r = [], n = _(); n !== D;) r.push(n), n = _();
                return t = r !== D ? e.substring(t, $t) : r, Vt--, t === D && (r = D, 0 === Vt && i(gt)), t
            }

            function O() {
                var t;
                return bt.test(e.charAt($t)) ? (t = e.charAt($t), $t++) : (t = D, 0 === Vt && i(Ft)), t
            }

            function C() {
                var t;
                return wt.test(e.charAt($t)) ? (t = e.charAt($t), $t++) : (t = D, 0 === Vt && i(_t)), t
            }

            function j() {
                var t, r, n, o, a, u;
                if (t = $t, 48 === e.charCodeAt($t) ? (r = At, $t++) : (r = D, 0 === Vt && i(Ot)), r === D) {
                    if (r = $t, n = $t, Ct.test(e.charAt($t)) ? (o = e.charAt($t), $t++) : (o = D, 0 === Vt && i(jt)), o !== D) {
                        for (a = [], u = O(); u !== D;) a.push(u), u = O();
                        a !== D ? (o = [o, a], n = o) : ($t = n, n = D)
                    } else $t = n, n = D;
                    r = n !== D ? e.substring(r, $t) : n
                }
                return r !== D && (qt = t, r = xt(r)), t = r
            }

            function x() {
                var t, r, n, o, a, u, l, s;
                return Pt.test(e.charAt($t)) ? (t = e.charAt($t), $t++) : (t = D, 0 === Vt && i(Et)), t === D && (t = $t, e.substr($t, 2) === kt ? (r = kt, $t += 2) : (r = D, 0 === Vt && i(Dt)), r !== D && (qt = t, r = Lt()), (t = r) === D && (t = $t, e.substr($t, 2) === St ? (r = St, $t += 2) : (r = D, 0 === Vt && i(It)), r !== D && (qt = t, r = Rt()), (t = r) === D && (t = $t, e.substr($t, 2) === Tt ? (r = Tt, $t += 2) : (r = D, 0 === Vt && i(Mt)), r !== D && (qt = t, r = Nt()), (t = r) === D && (t = $t, e.substr($t, 2) === zt ? (r = zt, $t += 2) : (r = D, 0 === Vt && i(Ut)), r !== D && (qt = t, r = Gt()), (t = r) === D && (t = $t, e.substr($t, 2) === Zt ? (r = Zt, $t += 2) : (r = D, 0 === Vt && i(Bt)), r !== D ? (n = $t, o = $t, a = C(), a !== D ? (u = C(), u !== D ? (l = C(), l !== D ? (s = C(), s !== D ? (a = [a, u, l, s], o = a) : ($t = o, o = D)) : ($t = o, o = D)) : ($t = o, o = D)) : ($t = o, o = D), n = o !== D ? e.substring(n, $t) : o, n !== D ? (qt = t, r = Kt(n), t = r) : ($t = t, t = D)) : ($t = t, t = D)))))), t
            }

            function P() {
                var t, e, r;
                if (t = $t, e = [], (r = x()) !== D)
                    for (; r !== D;) e.push(r), r = x();
                else e = D;
                return e !== D && (qt = t, e = Wt(e)), t = e
            }
            var E, k = arguments.length > 1 ? arguments[1] : {},
                D = {},
                L = {
                    start: a
                },
                S = a,
                I = function(t) {
                    return {
                        type: "messageFormatPattern",
                        elements: t,
                        location: r()
                    }
                },
                R = function(t) {
                    var e, r, n, o, i, a = "";
                    for (e = 0, n = t.length; e < n; e += 1)
                        for (o = t[e], r = 0, i = o.length; r < i; r += 1) a += o[r];
                    return a
                },
                T = function(t) {
                    return {
                        type: "messageTextElement",
                        value: t,
                        location: r()
                    }
                },
                M = /^[^ \t\n\r,.+={}#]/,
                N = {
                    type: "class",
                    value: "[^ \\t\\n\\r,.+={}#]",
                    description: "[^ \\t\\n\\r,.+={}#]"
                },
                z = "{",
                U = {
                    type: "literal",
                    value: "{",
                    description: '"{"'
                },
                G = ",",
                Z = {
                    type: "literal",
                    value: ",",
                    description: '","'
                },
                B = "}",
                K = {
                    type: "literal",
                    value: "}",
                    description: '"}"'
                },
                W = function(t, e) {
                    return {
                        type: "argumentElement",
                        id: t,
                        format: e && e[2],
                        location: r()
                    }
                },
                $ = "number",
                q = {
                    type: "literal",
                    value: "number",
                    description: '"number"'
                },
                H = "date",
                J = {
                    type: "literal",
                    value: "date",
                    description: '"date"'
                },
                Q = "time",
                V = {
                    type: "literal",
                    value: "time",
                    description: '"time"'
                },
                X = function(t, e) {
                    return {
                        type: t + "Format",
                        style: e && e[2],
                        location: r()
                    }
                },
                Y = "plural",
                tt = {
                    type: "literal",
                    value: "plural",
                    description: '"plural"'
                },
                et = function(t) {
                    return {
                        type: t.type,
                        ordinal: !1,
                        offset: t.offset || 0,
                        options: t.options,
                        location: r()
                    }
                },
                rt = "selectordinal",
                nt = {
                    type: "literal",
                    value: "selectordinal",
                    description: '"selectordinal"'
                },
                ot = function(t) {
                    return {
                        type: t.type,
                        ordinal: !0,
                        offset: t.offset || 0,
                        options: t.options,
                        location: r()
                    }
                },
                it = "select",
                at = {
                    type: "literal",
                    value: "select",
                    description: '"select"'
                },
                ut = function(t) {
                    return {
                        type: "selectFormat",
                        options: t,
                        location: r()
                    }
                },
                lt = "=",
                st = {
                    type: "literal",
                    value: "=",
                    description: '"="'
                },
                ct = function(t, e) {
                    return {
                        type: "optionalFormatPattern",
                        selector: t,
                        value: e,
                        location: r()
                    }
                },
                ft = "offset:",
                pt = {
                    type: "literal",
                    value: "offset:",
                    description: '"offset:"'
                },
                ht = function(t) {
                    return t
                },
                mt = function(t, e) {
                    return {
                        type: "pluralFormat",
                        offset: t,
                        options: e,
                        location: r()
                    }
                },
                dt = {
                    type: "other",
                    description: "whitespace"
                },
                yt = /^[ \t\n\r]/,
                vt = {
                    type: "class",
                    value: "[ \\t\\n\\r]",
                    description: "[ \\t\\n\\r]"
                },
                gt = {
                    type: "other",
                    description: "optionalWhitespace"
                },
                bt = /^[0-9]/,
                Ft = {
                    type: "class",
                    value: "[0-9]",
                    description: "[0-9]"
                },
                wt = /^[0-9a-f]/i,
                _t = {
                    type: "class",
                    value: "[0-9a-f]i",
                    description: "[0-9a-f]i"
                },
                At = "0",
                Ot = {
                    type: "literal",
                    value: "0",
                    description: '"0"'
                },
                Ct = /^[1-9]/,
                jt = {
                    type: "class",
                    value: "[1-9]",
                    description: "[1-9]"
                },
                xt = function(t) {
                    return parseInt(t, 10)
                },
                Pt = /^[^{}\\\0-\x1F \t\n\r]/,
                Et = {
                    type: "class",
                    value: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]",
                    description: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]"
                },
                kt = "\\\\",
                Dt = {
                    type: "literal",
                    value: "\\\\",
                    description: '"\\\\\\\\"'
                },
                Lt = function() {
                    return "\\"
                },
                St = "\\#",
                It = {
                    type: "literal",
                    value: "\\#",
                    description: '"\\\\#"'
                },
                Rt = function() {
                    return "\\#"
                },
                Tt = "\\{",
                Mt = {
                    type: "literal",
                    value: "\\{",
                    description: '"\\\\{"'
                },
                Nt = function() {
                    return "{"
                },
                zt = "\\}",
                Ut = {
                    type: "literal",
                    value: "\\}",
                    description: '"\\\\}"'
                },
                Gt = function() {
                    return "}"
                },
                Zt = "\\u",
                Bt = {
                    type: "literal",
                    value: "\\u",
                    description: '"\\\\u"'
                },
                Kt = function(t) {
                    return String.fromCharCode(parseInt(t, 16))
                },
                Wt = function(t) {
                    return t.join("")
                },
                $t = 0,
                qt = 0,
                Ht = [{
                    line: 1,
                    column: 1,
                    seenCR: !1
                }],
                Jt = 0,
                Qt = [],
                Vt = 0;
            if ("startRule" in k) {
                if (!(k.startRule in L)) throw new Error("Can't start parsing from rule \"" + k.startRule + '".');
                S = L[k.startRule]
            }
            if ((E = S()) !== D && $t === e.length) return E;
            throw E !== D && $t < e.length && i({
                    type: "end",
                    description: "end of input"
                }),
                function(e, r, n, o) {
                    return null !== r && function(t) {
                        var e = 1;
                        for (t.sort(function(t, e) {
                                return t.description < e.description ? -1 : t.description > e.description ? 1 : 0
                            }); e < t.length;) t[e - 1] === t[e] ? t.splice(e, 1) : e++
                    }(r), new t(null !== e ? e : function(t, e) {
                        var r, n, o, i = new Array(t.length);
                        for (o = 0; o < t.length; o++) i[o] = t[o].description;
                        return r = t.length > 1 ? i.slice(0, -1).join(", ") + " or " + i[t.length - 1] : i[0], n = e ? '"' + function(t) {
                            function e(t) {
                                return t.charCodeAt(0).toString(16).toUpperCase()
                            }
                            return t.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(t) {
                                return "\\x0" + e(t)
                            }).replace(/[\x10-\x1F\x80-\xFF]/g, function(t) {
                                return "\\x" + e(t)
                            }).replace(/[\u0100-\u0FFF]/g, function(t) {
                                return "\\u0" + e(t)
                            }).replace(/[\u1000-\uFFFF]/g, function(t) {
                                return "\\u" + e(t)
                            })
                        }(e) + '"' : "end of input", "Expected " + r + " but " + n + " found."
                    }(r, n), r, n, o)
                }(null, Qt, Jt < e.length ? e.charAt(Jt) : null, Jt < e.length ? o(Jt, Jt + 1) : o(Jt, Jt))
        }
        return function(t, e) {
            function r() {
                this.constructor = t
            }
            r.prototype = e.prototype, t.prototype = new r
        }(t, Error), {
            SyntaxError: t,
            parse: e
        }
    }();
    A(y, "formats", {
        enumerable: !0,
        value: {
            number: {
                currency: {
                    style: "currency"
                },
                percent: {
                    style: "percent"
                }
            },
            date: {
                short: {
                    month: "numeric",
                    day: "numeric",
                    year: "2-digit"
                },
                medium: {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                },
                long: {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                },
                full: {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            },
            time: {
                short: {
                    hour: "numeric",
                    minute: "numeric"
                },
                medium: {
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric"
                },
                long: {
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    timeZoneName: "short"
                },
                full: {
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    timeZoneName: "short"
                }
            }
        }
    }), A(y, "__localeData__", {
        value: O(null)
    }), A(y, "__addLocaleData", {
        value: function(t) {
            if (!t || !t.locale) throw new Error("Locale data provided to IntlMessageFormat is missing a `locale` property");
            y.__localeData__[t.locale.toLowerCase()] = t
        }
    }), A(y, "__parse", {
        value: C.parse
    }), A(y, "defaultLocale", {
        enumerable: !0,
        writable: !0,
        value: void 0
    }), y.prototype.resolvedOptions = function() {
        return {
            locale: this._locale
        }
    }, y.prototype._compilePattern = function(t, e, r, n) {
        return new f(e, r, n).compile(t)
    }, y.prototype._findPluralRuleFunction = function(t) {
        for (var e = y.__localeData__, r = e[t.toLowerCase()]; r;) {
            if (r.pluralRuleFunction) return r.pluralRuleFunction;
            r = r.parentLocale && e[r.parentLocale.toLowerCase()]
        }
        throw new Error("Locale data added to IntlMessageFormat is missing a `pluralRuleFunction` for :" + t)
    }, y.prototype._format = function(t, e) {
        var r, n, o, i, a, u, l = "";
        for (r = 0, n = t.length; r < n; r += 1)
            if ("string" != typeof(o = t[r])) {
                if (i = o.id, !e || !w.call(e, i)) throw u = new Error("A value must be provided for: " + i), u.variableId = i, u;
                a = e[i], o.options ? l += this._format(o.getOption(a), e) : l += o.format(a)
            } else l += o;
        return l
    }, y.prototype._mergeFormats = function(t, e) {
        var r, n, o = {};
        for (r in t) w.call(t, r) && (o[r] = n = O(t[r]), e && w.call(e, r) && c(n, e[r]));
        return o
    }, y.prototype._resolveLocale = function(t) {
        "string" == typeof t && (t = [t]), t = (t || []).concat(y.defaultLocale);
        var e, r, n, o, i = y.__localeData__;
        for (e = 0, r = t.length; e < r; e += 1)
            for (n = t[e].toLowerCase().split("-"); n.length;) {
                if (o = i[n.join("-")]) return o.locale;
                n.pop()
            }
        var a = t.pop();
        throw new Error("No locale data has been added to IntlMessageFormat for: " + t.join(", ") + ", or the default locale: " + a)
    };
    var j = {
        locale: "en",
        pluralRuleFunction: function(t, e) {
            var r = String(t).split("."),
                n = !r[1],
                o = Number(r[0]) == t,
                i = o && r[0].slice(-1),
                a = o && r[0].slice(-2);
            return e ? 1 == i && 11 != a ? "one" : 2 == i && 12 != a ? "two" : 3 == i && 13 != a ? "few" : "other" : 1 == t && n ? "one" : "other"
        }
    };
    y.__addLocaleData(j), y.defaultLocale = "en";
    var x = function() {
        function e(r) {
            t(this, e), this.type = "i18nFormat", this.mem = {}, this.init(null, r)
        }
        return r(e, [{
            key: "init",
            value: function(t, e) {
                var r = this,
                    n = t && t.options && t.options.i18nFormat || {};
                if (this.options = s(n, e, this.options || {}, v()), this.formats = this.options.formats, t) {
                    var o = this.options,
                        i = o.bindI18n,
                        a = o.bindI18nStore,
                        u = o.memoize;
                    t.IntlMessageFormat = y, t.ICU = this, u && (i && t.on(i, function() {
                        return r.clearCache()
                    }), a && t.store.on(a, function() {
                        return r.clearCache()
                    }))
                }
                this.options.localeData && ("[object Array]" === Object.prototype.toString.apply(this.options.localeData) ? this.options.localeData.forEach(function(t) {
                    return r.addLocaleData(t)
                }) : this.addLocaleData(this.options.localeData))
            }
        }, {
            key: "addLocaleData",
            value: function(t) {
                ("[object Array]" === Object.prototype.toString.apply(t) ? t : [t]).forEach(function(t) {
                    t && t.locale && y.__addLocaleData(t)
                })
            }
        }, {
            key: "addUserDefinedFormats",
            value: function(t) {
                this.formats = this.formats ? i({}, this.formats, {}, t) : t
            }
        }, {
            key: "parse",
            value: function(t, e, r, n, o, i) {
                var a, s = i && i.resolved && i.resolved.res,
                    c = this.options.memoize && "".concat(r, ".").concat(n, ".").concat(o.replace(/\./g, "###"));
                return this.options.memoize && (a = l(this.mem, c)), a || (a = new y(t, r, this.formats), this.options.memoize && (this.options.memoizeFallback || !i || s) && u(this.mem, c, a)), a.format(e)
            }
        }, {
            key: "addLookupKeys",
            value: function(t, e, r, n, o) {
                return t
            }
        }, {
            key: "clearCache",
            value: function() {
                this.mem = {}
            }
        }]), e
    }();
    return x.type = "i18nFormat", x
});