/*! JsRender v1.0.2: http://jsviews.com/#jsrender */
/*! **VERSION FOR WEB** (For NODE.JS see http://jsviews.com/download/jsrender-node.js) */
! function(e, t) {
    var n = t.jQuery;
    "object" == typeof exports ? module.exports = n ? e(t, n) : function(n) {
        if (n && !n.fn) throw "Provide jQuery or null";
        return e(t, n)
    } : "function" == typeof define && define.amd ? define(function() {
        return e(t)
    }) : e(t, !1)
}(function(e, t) {
    "use strict";

    function n(e, t) {
        return function() {
            var n, r = this,
                i = r.base;
            return r.base = e, n = t.apply(r, arguments), r.base = i, n
        }
    }

    function r(e, t) {
        return ae(t) && (t = n(e ? e._d ? e : n(s, e) : s, t), t._d = (e && e._d || 0) + 1), t
    }

    function i(e, t) {
        var n, i = t.props;
        for (n in i) !Me.test(n) || e[n] && e[n].fix || (e[n] = "convert" !== n ? r(e.constructor.prototype[n], i[n]) : i[n])
    }

    function o(e) {
        return e
    }

    function s() {
        return ""
    }

    function a(e) {
        try {
            throw console.log("JsRender dbg breakpoint: " + e), "dbg breakpoint"
        } catch (t) {}
        return this.base ? this.baseApply(arguments) : e
    }

    function d(e) {
        this.name = (t.link ? "JsViews" : "JsRender") + " Error", this.message = e || this.name
    }

    function l(e, t) {
        if (e) {
            for (var n in t) e[n] = t[n];
            return e
        }
    }

    function p(e, t, n) {
        return e ? de(e) ? p.apply(oe, e) : (we = n ? n[0] : we, /^(\W|_){5}$/.test(e + t + we) || S("Invalid delimiters"), he = e[0], _e = e[1], be = t[0], xe = t[1], ge.delimiters = [he + _e, be + xe, we], e = "\\" + he + "(\\" + we + ")?\\" + _e, t = "\\" + be + "\\" + xe, re = "(?:(\\w+(?=[\\/\\s\\" + be + "]))|(\\w+)?(:)|(>)|(\\*))\\s*((?:[^\\" + be + "]|\\" + be + "(?!\\" + xe + "))*?)", fe.rTag = "(?:" + re + ")", re = new RegExp("(?:" + e + re + "(\\/)?|\\" + he + "(\\" + we + ")?\\" + _e + "(?:(?:\\/(\\w+))\\s*|!--[\\s\\S]*?--))" + t, "g"), fe.rTmpl = new RegExp("^\\s|\\s$|<.*>|([^\\\\]|^)[{}]|" + e + ".*" + t), me) : ge.delimiters
    }

    function u(e, t) {
        t || e === !0 || (t = e, e = void 0);
        var n, r, i, o, s = this,
            a = "root" === t;
        if (e) {
            if (o = t && s.type === t && s, !o)
                if (n = s.views, s._.useKey) {
                    for (r in n)
                        if (o = t ? n[r].get(e, t) : n[r]) break
                } else
                    for (r = 0, i = n.length; !o && r < i; r++) o = t ? n[r].get(e, t) : n[r]
        } else if (a) o = s.root;
        else if (t)
            for (; s && !o;) o = s.type === t ? s : void 0, s = s.parent;
        else o = s.parent;
        return o || void 0
    }

    function c() {
        var e = this.get("item");
        return e ? e.index : void 0
    }

    function f() {
        return this.index
    }

    function g(e, t, n, r) {
        var i, o, a, d = 0;
        if (1 === n && (r = 1, n = void 0), t)
            for (o = t.split("."), a = o.length; e && d < a; d++) i = e, e = o[d] ? e[o[d]] : e;
        return n && (n.lt = n.lt || d < a), void 0 === e ? r ? s : "" : r ? function() {
            return e.apply(i, arguments)
        } : e
    }

    function v(n, r, i) {
        var o, s, a, d, p, u, c, f = this,
            g = !ke && arguments.length > 1,
            v = f.ctx;
        if (n) {
            if (f._ || (p = f.index, f = f.tag), u = f, v && v.hasOwnProperty(n) || (v = ue).hasOwnProperty(n)) {
                if (a = v[n], "tag" === n || "tagCtx" === n || "root" === n || "parentTags" === n || f._.it === n) return a
            } else v = void 0;
            if ((!ke && f.tagCtx || f.linked) && (a && a._cxp || (f = f.tagCtx || ae(a) ? f : (f = f.scope || f, !f.isTop && f.ctx.tag || f), void 0 !== a && f.tagCtx && (f = f.tagCtx.view.scope), v = f._ocps, a = v && v.hasOwnProperty(n) && v[n] || a, a && a._cxp || !i && !g || ((v || (f._ocps = f._ocps || {}))[n] = a = [{
                    _ocp: a,
                    _vw: u,
                    _key: n
                }], a._cxp = {
                    path: Te,
                    ind: 0,
                    updateValue: function(e, n) {
                        return t.observable(a[0]).setProperty(Te, e), this
                    }
                })), d = a && a._cxp)) {
                if (arguments.length > 2) return s = a[1] ? fe._ceo(a[1].deps) : [Te], s.unshift(a[0]), s._cxp = d, s;
                if (p = d.tagElse, c = a[1] ? d.tag && d.tag.cvtArgs ? d.tag.cvtArgs(p, 1)[d.ind] : a[1](a[0].data, a[0], fe) : a[0]._ocp, g) return a && c !== r && fe._ucp(n, r, f, d), f;
                a = c
            }
            return a && ae(a) && (o = function() {
                return a.apply(this && this !== e ? this : u, arguments)
            }, l(o, a)), o || a
        }
    }

    function m(e) {
        return e && (e.fn ? e : this.getRsc("templates", e) || le(e))
    }

    function h(e, t, n, r) {
        var o, s, a, d, p, u = "number" == typeof n && t.tmpl.bnds[n - 1];
        if (void 0 === r && u && u._lr && (r = ""), void 0 !== r ? n = r = {
                props: {},
                args: [r]
            } : u && (n = u(t.data, t, fe)), u = u._bd && u, e || u) {
            if (s = t._lc, o = s && s.tag, n.view = t, !o) {
                if (o = l(new fe._tg, {
                        _: {
                            bnd: u,
                            unlinked: !0,
                            lt: n.lt
                        },
                        inline: !s,
                        tagName: ":",
                        convert: e,
                        flow: !0,
                        tagCtx: n,
                        tagCtxs: [n],
                        _is: "tag"
                    }), d = n.args.length, d > 1)
                    for (p = o.bindTo = []; d--;) p.unshift(d);
                s && (s.tag = o, o.linkCtx = s), n.ctx = Q(n.ctx, (s ? s.view : t).ctx), i(o, n)
            }
            o._er = r && a, o.ctx = n.ctx || o.ctx || {}, n.ctx = void 0, a = o.cvtArgs()[0], o._er = r && a
        } else a = n.args[0];
        return a = u && t._.onRender ? t._.onRender(a, t, o) : a, void 0 != a ? a : ""
    }

    function _(e, t) {
        var n, r, i, o, s, a, d, l = this;
        if (l.tagName) {
            if (a = l, l = (a.tagCtxs || [l])[e || 0], !l) return
        } else a = l.tag;
        if (s = a.bindFrom, o = l.args, (d = a.convert) && "" + d === d && (d = "true" === d ? void 0 : l.view.getRsc("converters", d) || S("Unknown converter: '" + d + "'")), d && !t && (o = o.slice()), s) {
            for (i = [], n = s.length; n--;) r = s[n], i.unshift(b(l, r));
            t && (o = i)
        }
        if (d) {
            if (d = d.apply(a, i || o), void 0 === d) return o;
            if (s = s || [0], n = s.length, de(d) && d.length === n || (d = [d], s = [0], n = 1), t) o = d;
            else
                for (; n--;) r = s[n], +r === r && (o[r] = d[n])
        }
        return o
    }

    function b(e, t) {
        return e = e[+t === t ? "args" : "props"], e && e[t]
    }

    function x(e) {
        return this.cvtArgs(e, 1)
    }

    function w(e, t) {
        var n, r, i = this;
        if ("" + t === t) {
            for (; void 0 === n && i;) r = i.tmpl && i.tmpl[e], n = r && r[t], i = i.parent;
            return n || oe[e][t]
        }
    }

    function y(e, t, n, r, o, s) {
        function a(e) {
            var t = d[e];
            if (void 0 !== t)
                for (t = de(t) ? t : [t], m = t.length; m--;) J = t[m], isNaN(parseInt(J)) || (t[m] = parseInt(J));
            return t || [0]
        }
        t = t || ie;
        var d, l, p, u, c, f, g, m, h, w, y, k, C, T, j, A, N, P, R, F, V, $, M, I, D, J, U, q, K, L, B = 0,
            H = "",
            W = t._lc || !1,
            Z = t.ctx,
            z = n || t.tmpl,
            G = "number" == typeof r && t.tmpl.bnds[r - 1];
        for ("tag" === e._is ? (d = e, e = d.tagName, r = d.tagCtxs, p = d.template) : (l = t.getRsc("tags", e) || S("Unknown tag: {{" + e + "}} "), p = l.template), void 0 === s && G && (G._lr = l.lateRender && G._lr !== !1 || G._lr) && (s = ""), void 0 !== s ? (H += s, r = s = [{
                props: {},
                args: [],
                params: {
                    props: {}
                }
            }]) : G && (r = G(t.data, t, fe)), g = r.length; B < g; B++) y = r[B], N = y.tmpl, (!W || !W.tag || B && !W.tag.inline || d._er || N && +N === N) && (N && z.tmpls && (y.tmpl = y.content = z.tmpls[N - 1]), y.index = B, y.ctxPrm = v, y.render = E, y.cvtArgs = _, y.bndArgs = x, y.view = t, y.ctx = Q(Q(y.ctx, l && l.ctx), Z)), (n = y.props.tmpl) && (y.tmpl = t._getTmpl(n), y.content = y.content || y.tmpl), d ? W && W.fn._lr && (P = !!d.init) : (d = new l._ctr, P = !!d.init, d.parent = f = Z && Z.tag, d.tagCtxs = r, W && (d.inline = !1, W.tag = d), d.linkCtx = W, (d._.bnd = G || W.fn) ? (d._.ths = y.params.props["this"], d._.lt = r.lt, d._.arrVws = {}) : d.dataBoundOnly && S(e + " must be data-bound:\n{^{" + e + "}}")), I = d.dataMap, y.tag = d, I && r && (y.map = r[B].map), d.flow || (k = y.ctx = y.ctx || {}, u = d.parents = k.parentTags = Z && Q(k.parentTags, Z.parentTags) || {}, f && (u[f.tagName] = f), u[d.tagName] = k.tag = d, k.tagCtx = y);
        if (!(d._er = s)) {
            for (i(d, r[0]), d.rendering = {
                    rndr: d.rendering
                }, B = 0; B < g; B++) {
                if (y = d.tagCtx = r[B], M = y.props, d.ctx = y.ctx, !B) {
                    if (P && (d.init(y, W, d.ctx), P = void 0), y.args.length || y.argDefault === !1 || d.argDefault === !1 || (y.args = V = [y.view.data], y.params.args = ["#data"]), T = a("bindTo"), void 0 !== d.bindTo && (d.bindTo = T), void 0 !== d.bindFrom ? d.bindFrom = a("bindFrom") : d.bindTo && (d.bindFrom = d.bindTo = T), j = d.bindFrom || T, q = T.length, U = j.length, d._.bnd && (K = d.linkedElement) && (d.linkedElement = K = de(K) ? K : [K], q !== K.length && S("linkedElement not same length as bindTo")), (K = d.linkedCtxParam) && (d.linkedCtxParam = K = de(K) ? K : [K], U !== K.length && S("linkedCtxParam not same length as bindFrom/bindTo")), j)
                        for (d._.fromIndex = {}, d._.toIndex = {}, h = U; h--;)
                            for (J = j[h], m = q; m--;) J === T[m] && (d._.fromIndex[m] = h, d._.toIndex[h] = m);
                    W && (W.attr = d.attr = W.attr || d.attr || W._dfAt), c = d.attr, d._.noVws = c && c !== Ke
                }
                if (V = d.cvtArgs(B), d.linkedCtxParam)
                    for ($ = d.cvtArgs(B, 1), m = U, L = d.constructor.prototype.ctx; m--;)(C = d.linkedCtxParam[m]) && (J = j[m], A = $[m], y.ctx[C] = fe._cp(L && void 0 === A ? L[C] : A, void 0 !== A && b(y.params, J), y.view, d._.bnd && {
                        tag: d,
                        cvt: d.convert,
                        ind: m,
                        tagElse: B
                    }));
                (R = M.dataMap || I) && (V.length || M.dataMap) && (F = y.map, F && F.src === V[0] && !o || (F && F.src && F.unmap(), R.map(V[0], y, F, !d._.bnd), F = y.map), V = [F.tgt]), w = void 0, d.render && (w = d.render.apply(d, V), t.linked && w && !Ee.test(w) && (n = {
                    links: []
                }, n.render = n.fn = function() {
                    return w
                }, w = O(n, t.data, void 0, !0, t, void 0, void 0, d))), V.length || (V = [t]), void 0 === w && (D = V[0], d.contentCtx && (D = d.contentCtx === !0 ? t : d.contentCtx(D)), w = y.render(D, !0) || (o ? void 0 : "")), H = H ? H + (w || "") : void 0 !== w ? "" + w : void 0
            }
            d.rendering = d.rendering.rndr
        }
        return d.tagCtx = r[0], d.ctx = d.tagCtx.ctx, d._.noVws && d.inline && (H = "text" === c ? pe.html(H) : ""), G && t._.onRender ? t._.onRender(H, t, d) : H
    }

    function k(e, t, n, r, i, o, s, a) {
        var d, l, p, u = this,
            f = "array" === t;
        u.content = a, u.views = f ? [] : {}, u.data = r, u.tmpl = i, p = u._ = {
            key: 0,
            useKey: f ? 0 : 1,
            id: "" + Je++,
            onRender: s,
            bnds: {}
        }, u.linked = !!s, u.type = t || "top", (u.parent = n) ? (u.root = n.root || u, d = n.views, l = n._, u.isTop = l.scp, u.scope = (!e.tag || e.tag === n.ctx.tag) && !u.isTop && n.scope || u, l.useKey ? (d[p.key = "_" + l.useKey++] = u, u.index = He, u.getIndex = c) : d.length === (p.key = u.index = o) ? d.push(u) : d.splice(o, 0, u), u.ctx = e || n.ctx) : u.ctx = e || {}
    }

    function C(e) {
        var t, n, r;
        for (t in Ge) n = t + "s", e[n] && (r = e[n], e[n] = {}, oe[n](r, e))
    }

    function T(e, t, n) {
        function i() {
            var t = this;
            t._ = {
                unlinked: !0
            }, t.inline = !0, t.tagName = e
        }
        var o, s, a, d = new fe._tg;
        if (ae(t) ? t = {
                depends: t.depends,
                render: t
            } : "" + t === t && (t = {
                template: t
            }), s = t.baseTag) {
            t.flow = !!t.flow, s = "" + s === s ? n && n.tags[s] || ce[s] : s, s || S('baseTag: "' + t.baseTag + '" not found'), d = l(d, s);
            for (a in t) d[a] = r(s[a], t[a])
        } else d = l(d, t);
        return void 0 !== (o = d.template) && (d.template = "" + o === o ? le[o] || le(o) : o), (i.prototype = d).constructor = d._ctr = i, n && (d._parentTmpl = n), d
    }

    function j(e) {
        return this.base.apply(this, e)
    }

    function A(e, n, r, i) {
        function o(n) {
            var o, a;
            if ("" + n === n || n.nodeType > 0 && (s = n)) {
                if (!s)
                    if (/^\.\/[^\\:*?"<>]*$/.test(n))(a = le[e = e || n]) ? n = a : s = document.getElementById(n);
                    else if (t.fn && !fe.rTmpl.test(n)) try {
                    s = t(n, document)[0]
                } catch (d) {}
                s && ("SCRIPT" !== s.tagName && S(n + ": Use script block, not " + s.tagName), i ? n = s.innerHTML : (o = s.getAttribute(Be), o && (o !== Qe ? (n = le[o], delete le[o]) : t.fn && (n = t.data(s)[Qe])), o && n || (e = e || (t.fn ? Qe : n), n = A(e, s.innerHTML, r, i)), n.tmplName = e = e || o, e !== Qe && (le[e] = n), s.setAttribute(Be, e), t.fn && t.data(s, Qe, n))), s = void 0
            } else n.fn || (n = void 0);
            return n
        }
        var s, a, d = n = n || "";
        if (fe._html = pe.html, 0 === i && (i = void 0, d = o(d)), i = i || (n.markup ? n.bnds ? l({}, n) : n : {}), i.tmplName = i.tmplName || e || "unnamed", r && (i._parentTmpl = r), !d && n.markup && (d = o(n.markup)) && d.fn && (d = d.markup), void 0 !== d) return d.render || n.render ? d.tmpls && (a = d) : (n = F(d, i), J(d.replace(Ne, "\\$&"), n)), a || (a = l(function() {
            return a.render.apply(a, arguments)
        }, n), C(a)), a
    }

    function N(e, t) {
        return ae(e) ? e.call(t) : e
    }

    function P(e) {
        for (var t = [], n = 0, r = e.length; n < r; n++) t.push(e[n].unmap());
        return t
    }

    function R(e, n) {
        function r(e) {
            p.apply(this, e)
        }

        function i() {
            return new r(arguments)
        }

        function o(e, t) {
            for (var n, r, i, o, s = 0; s < _; s++) i = c[s], n = void 0, i + "" !== i && (n = i, i = n.getter), void 0 === (o = e[i]) && n && void 0 !== (r = n.defaultVal) && (o = N(r, e)), t(o, n && u[n.type], i)
        }

        function s(t) {
            t = t + "" === t ? JSON.parse(t) : t;
            var n, r, i = 0,
                s = t,
                l = [];
            if (de(t)) {
                for (t = t || [], n = t.length; i < n; i++) l.push(this.map(t[i]));
                return l._is = e, l.unmap = d, l.merge = a, l
            }
            if (t) {
                o(t, function(e, t) {
                    t && (e = t.map(e)), l.push(e)
                }), s = this.apply(this, l);
                for (r in t) r === se || x[r] || (s[r] = t[r])
            }
            return s
        }

        function a(e) {
            e = e + "" === e ? JSON.parse(e) : e;
            var t, n, r, s, a, d, l, p, u, c = 0,
                f = this;
            if (de(f)) {
                for (l = {}, u = [], n = e.length, r = f.length; c < n; c++) {
                    for (p = e[c], d = !1, t = 0; t < r && !d; t++) l[t] || (a = f[t], g && (l[t] = d = g + "" === g ? p[g] && (x[g] ? a[g]() : a[g]) === p[g] : g(a, p)));
                    d ? (a.merge(p), u.push(a)) : u.push(i.map(p))
                }
                return void(b ? b(f).refresh(u, !0) : f.splice.apply(f, [0, f.length].concat(u)))
            }
            o(e, function(e, t, n) {
                t ? f[n]().merge(e) : f[n](e)
            });
            for (s in e) s === se || x[s] || (f[s] = e[s])
        }

        function d() {
            var e, t, n, r, i = 0,
                o = this;
            if (de(o)) return P(o);
            for (e = {}; i < _; i++) t = c[i], n = void 0, t + "" !== t && (n = t, t = n.getter), r = o[t](), e[t] = n && r && u[n.type] ? de(r) ? P(r) : r.unmap() : r;
            for (t in o) "_is" === t || x[t] || t === se || "_" === t.charAt(0) && x[t.slice(1)] || ae(o[t]) || (e[t] = o[t]);
            return e
        }
        var l, p, u = this,
            c = n.getters,
            f = n.extend,
            g = n.id,
            v = t.extend({
                _is: e || "unnamed",
                unmap: d,
                merge: a
            }, f),
            m = "",
            h = "",
            _ = c ? c.length : 0,
            b = t.observable,
            x = {};
        for (r.prototype = v, l = 0; l < _; l++) ! function(e) {
            e = e.getter || e, x[e] = l + 1;
            var t = "_" + e;
            m += (m ? "," : "") + e, h += "this." + t + " = " + e + ";\n", v[e] = v[e] || function(n) {
                return arguments.length ? void(b ? b(this).setProperty(e, n) : this[t] = n) : this[t]
            }, b && (v[e].set = v[e].set || function(e) {
                this[t] = e
            })
        }(c[l]);
        return p = new Function(m, h.slice(0, -1)), p.prototype = v, v.constructor = p, i.map = s, i.getters = c, i.extend = f, i.id = g, i
    }

    function F(e, n) {
        var r, i = ve._wm || {},
            o = {
                tmpls: [],
                links: {},
                bnds: [],
                _is: "template",
                render: E
            };
        return n && (o = l(o, n)), o.markup = e, o.htmlTag || (r = Fe.exec(e), o.htmlTag = r ? r[1].toLowerCase() : ""), r = i[o.htmlTag], r && r !== i.div && (o.markup = t.trim(o.markup)), o
    }

    function V(e, t) {
        function n(i, o, s) {
            var a, d, l, p = fe.onStore[e];
            if (i && typeof i === Le && !i.nodeType && !i.markup && !i.getTgt && !("viewModel" === e && i.getters || i.extend)) {
                for (d in i) n(d, i[d], o);
                return o || oe
            }
            return i && "" + i !== i && (s = o, o = i, i = void 0), l = s ? "viewModel" === e ? s : s[r] = s[r] || {} : n, a = t.compile, void 0 === o && (o = a ? i : l[i], i = void 0), null === o ? i && delete l[i] : (a && (o = a.call(l, i, o, s, 0) || {}, o._is = e), i && (l[i] = o)), p && p(i, o, s, a), o
        }
        var r = e + "s";
        oe[r] = n
    }

    function $(e) {
        me[e] = function(t) {
            return arguments.length ? (ge[e] = t, me) : ge[e]
        }
    }

    function M(e) {
        function t(t, n) {
            this.tgt = e.getTgt(t, n), n.map = this
        }
        return ae(e) && (e = {
            getTgt: e
        }), e.baseMap && (e = l(l({}, e.baseMap), e)), e.map = function(e, n) {
            return new t(e, n)
        }, e
    }

    function E(e, t, n, r, i, o) {
        var s, a, d, l, p, u, c, f, g = r,
            v = "";
        if (t === !0 ? (n = t, t = void 0) : typeof t !== Le && (t = void 0), (d = this.tag) ? (p = this, g = g || p.view, l = g._getTmpl(d.template || p.tmpl), arguments.length || (e = d.contentCtx && ae(d.contentCtx) ? e = d.contentCtx(e) : g)) : l = this, l) {
            if (!r && e && "view" === e._is && (g = e), g && e === g && (e = g.data), u = !g, ke = ke || u, g || ((t = t || {}).root = e), !ke || ve.useViews || l.useViews || g && g !== ie) v = O(l, e, t, n, g, i, o, d);
            else {
                if (g ? (c = g.data, f = g.index, g.index = He) : (g = ie, c = g.data, g.data = e, g.ctx = t), de(e) && !n)
                    for (s = 0, a = e.length; s < a; s++) g.index = s, g.data = e[s], v += l.fn(e[s], g, fe);
                else g.data = e, v += l.fn(e, g, fe);
                g.data = c, g.index = f
            }
            u && (ke = void 0)
        }
        return v
    }

    function O(e, t, n, r, i, o, s, a) {
        function d(e) {
            x = l({}, n), x[b] = e
        }
        var p, u, c, f, g, v, m, h, _, b, x, w, y, C = "";
        if (a && (_ = a.tagName, w = a.tagCtx, n = n ? Q(n, a.ctx) : a.ctx, e === i.content ? m = e !== i.ctx._wrp ? i.ctx._wrp : void 0 : e !== w.content ? e === a.template ? (m = w.tmpl, n._wrp = w.content) : m = w.content || i.content : m = i.content, w.props.link === !1 && (n = n || {}, n.link = !1), (b = w.props.itemVar) && ("~" !== b[0] && D("Use itemVar='~myItem'"), b = b.slice(1))), i && (s = s || i._.onRender, y = n && n.link === !1, y && i._.nl && (s = void 0), n = Q(n, i.ctx)), o === !0 && (v = !0, o = 0), s && a && a._.noVws && (s = void 0), h = s, s === !0 && (h = void 0, s = i._.onRender), n = e.helpers ? Q(e.helpers, n) : n, x = n, de(t) && !r)
            for (c = v ? i : void 0 !== o && i || new k(n, "array", i, t, e, o, s, m), c._.nl = y, i && i._.useKey && (c._.bnd = !a || a._.bnd && a, c.tag = a), p = 0, u = t.length; p < u; p++) b && d(t[p]), f = new k(x, "item", c, t[p], e, (o || 0) + p, s, c.content), f._.it = b, g = e.fn(t[p], f, fe), C += c._.onRender ? c._.onRender(g, f) : g;
        else b && d(t), c = v ? i : new k(x, _ || "data", i, t, e, o, s, m), c._.it = b, c.tag = a, c._.nl = y, C += e.fn(t, c, fe);
        return a && (c.tagElse = w.index, w.contentView = c), h ? h(C, c) : C
    }

    function I(e, t, n) {
        var r = void 0 !== n ? ae(n) ? n.call(t.data, e, t) : n || "" : "{Error: " + (e.message || e) + "}";
        return ge.onError && void 0 !== (n = ge.onError.call(t.data, e, n && r, t)) && (r = n), t && !t._lc ? pe.html(r) : r
    }

    function S(e) {
        throw new fe.Err(e)
    }

    function D(e) {
        S("Syntax error\n" + e)
    }

    function J(e, t, n, r, i) {
        function o(t) {
            t -= v, t && h.push(e.substr(v, t).replace(je, "\\n"))
        }

        function s(t, n) {
            t && (t += "}}", D((n ? "{{" + n + "}} block has {{/" + t + " without {{" + t : "Unmatched or missing {{/" + t) + ", in template:\n" + e))
        }

        function a(a, d, l, c, g, b, x, w, y, k, C, T) {
            (x && d || y && !l || w && ":" === w.slice(-1) || k) && D(a), b && (g = ":", c = Ke), y = y || n && !i;
            var j, A, N, P = (d || n) && [
                    []
                ],
                R = "",
                F = "",
                V = "",
                $ = "",
                M = "",
                E = "",
                O = "",
                I = "",
                S = !y && !g;
            l = l || (w = w || "#data", g), o(T), v = T + a.length, x ? f && h.push(["*", "\n" + w.replace(/^:/, "ret+= ").replace(Ae, "$1") + ";\n"]) : l ? ("else" === l && (Re.test(w) && D('For "{{else if expr}}" use "{{else expr}}"'), P = _[9] && [
                []
            ], _[10] = e.substring(_[10], T), A = _[11] || _[0] || D("Mismatched: " + a), _ = m.pop(), h = _[2], S = !0), w && L(w.replace(je, " "), P, t, n).replace(Pe, function(e, t, n, r, i, o, s, a) {
                return "this:" === r && (o = "undefined"), a && (N = N || "@" === a[0]), r = "'" + i + "':", s ? (F += n + o + ",", $ += "'" + a + "',") : n ? (V += r + "j._cp(" + o + ',"' + a + '",view),', E += r + "'" + a + "',") : t ? O += o : ("trigger" === i && (I += o), "lateRender" === i && (j = "false" !== a), R += r + o + ",", M += r + "'" + a + "',", u = u || Me.test(i)), ""
            }).slice(0, -1), P && P[0] && P.pop(), p = [l, c || !!r || u || "", S && [], q($ || (":" === l ? "'#data'," : ""), M, E), q(F || (":" === l ? "data," : ""), R, V), O, I, j, N, P || 0], h.push(p), S && (m.push(_), _ = p, _[10] = v, _[11] = A)) : C && (s(C !== _[0] && C !== _[11] && C, _[0]), _[10] = e.substring(_[10], T), _ = m.pop()), s(!_ && C), h = _[2]
        }
        var d, l, p, u, c, f = ge.allowCode || t && t.allowCode || me.allowCode === !0,
            g = [],
            v = 0,
            m = [],
            h = g,
            _ = [, , g];
        if (f && t._is && (t.allowCode = f), n && (void 0 !== r && (e = e.slice(0, -r.length - 2) + be), e = he + e + xe), s(m[0] && m[0][2].pop()[0]), e.replace(re, a), o(e.length), (v = g[g.length - 1]) && s("" + v !== v && +v[10] === v[10] && v[0]), n) {
            for (l = B(g, e, n), c = [], d = g.length; d--;) c.unshift(g[d][9]);
            U(l, c)
        } else l = B(g, t);
        return l
    }

    function U(e, t) {
        var n, r, i = 0,
            o = t.length;
        for (e.deps = [], e.paths = []; i < o; i++) {
            e.paths.push(r = t[i]);
            for (n in r) "_jsvto" !== n && r.hasOwnProperty(n) && r[n].length && !r[n].skp && (e.deps = e.deps.concat(r[n]))
        }
    }

    function q(e, t, n) {
        return [e.slice(0, -1), t.slice(0, -1), n.slice(0, -1)]
    }

    function K(e, t) {
        return "\n\t" + (t ? t + ":{" : "") + "args:[" + e[0] + "],\n\tprops:{" + e[1] + "}" + (e[2] ? ",\n\tctx:{" + e[2] + "}" : "")
    }

    function L(e, t, n, r) {
        function i(i, p, b, x, w, y, k, C, T, j, A, N, P, R, F, V, $, M, E, O, I) {
            function S(e, n, i, a, d, l, p, f) {
                var g = "." === i;
                if (i && (w = w.slice(n.length), /^\.?constructor$/.test(f || w) && D(e), g || (e = (j ? (r ? "" : "(ltOb.lt=ltOb.lt||") + "(ob=" : "") + (a ? 'view.ctxPrm("' + a + '")' : d ? "view" : "data") + (j ? ")===undefined" + (r ? "" : ")") + '?"":view._getOb(ob,"' : "") + (f ? (l ? "." + l : a ? "" : d ? "" : "." + i) + (p || "") : (f = a ? "" : d ? l || "" : i, "")), e += f ? "." + f : "", e = n + ("view.data" === e.slice(0, 9) ? e.slice(5) : e) + (j ? (r ? '"' : '",ltOb') + (A ? ",1)" : ")") : "")), u)) {
                    if (K = "_linkTo" === o ? s = t._jsvto = t._jsvto || [] : c.bd, L = g && K[K.length - 1]) {
                        if (L._cpfn) {
                            for (; L.sb;) L = L.sb;
                            L.bnd && (w = "^" + w.slice(1)), L.sb = w, L.bnd = L.bnd || "^" === w[0]
                        }
                    } else K.push(w);
                    _[m] = O + (g ? 1 : 0)
                }
                return e
            }
            x && !C && (w = x + w), y = y || "", b = b || p || P, w = w || T, j && (j = !/\)|]/.test(I[O - 1])) && (w = w.slice(1).split(".").join("^")), A = A || M || "";
            var U, q, K, L, B, Q = ")";
            if ("[" === A && (A = "[j._sq(", Q = ")]"), !k || l || d) {
                if (u && $ && !l && !d && m && (U = _[m - 1], I.length - 1 > O - (U || 0))) {
                    if (U = I.slice(U, O + i.length), q !== !0)
                        if (K = s || f[m - 1].bd, L = K[K.length - 1], L && L.prm) {
                            for (; L.sb && L.sb.prm;) L = L.sb;
                            B = L.sb = {
                                path: L.sb,
                                bnd: L.bnd
                            }
                        } else K.push(B = {
                            path: K.pop()
                        });
                    $ = _e + ":" + U + " onerror=''" + be, q = v[$], q || (v[$] = !0, v[$] = q = J($, n, !0)), q !== !0 && B && (B._cpfn = q, B.prm = c.bd, B.bnd = B.bnd || B.path && B.path.indexOf("^") >= 0)
                }
                return l ? (l = !R, l ? i : P + '"') : d ? (d = !F, d ? i : P + '"') : (b ? (_[m] = O++, c = f[++m] = {
                    bd: []
                }, b) : "") + (E ? m ? "" : (g = I.slice(g, O), (o ? (o = a = s = !1, "\b") : "\b,") + g + (g = O + i.length, u && t.push(c.bd = []), "\b")) : C ? (m && D(e), u && t.pop(), o = "_" + w, a = x, g = O + i.length, u && (u = c.bd = t[o] = [], u.skp = !x), w + ":") : w ? w.split("^").join(".").replace(fe.rPath, S) + (A ? (c = f[++m] = {
                    bd: []
                }, h[m] = Q, A) : y) : y ? y : V ? (V = h[m] || V, h[m] = !1, c = f[--m], V + (A ? (c = f[++m], h[m] = Q, A) : "")) : N ? (h[m] || D(e), ",") : p ? "" : (l = R, d = F, '"'))
            }
            D(e)
        }
        var o, s, a, d, l, p, u = t && t[0],
            c = {
                bd: u
            },
            f = {
                0: c
            },
            g = 0,
            v = (n ? n.links : u && (u.links = u.links || {})) || ie.tmpl.links,
            m = 0,
            h = {},
            _ = {};
        return "@" === e[0] && (e = e.replace(De, ".")), p = (e + (n ? " " : "")).replace(fe.rPrm, i), !m && p || D(e)
    }

    function B(e, t, n) {
        var r, i, o, s, a, d, l, p, u, c, f, g, v, m, h, _, b, x, w, y, k, C, T, j, A, N, P, R, V, $, M, E, O, I = 0,
            S = ve.useViews || t.useViews || t.tags || t.templates || t.helpers || t.converters,
            J = "",
            q = {},
            L = e.length;
        for ("" + t === t ? (x = n ? 'data-link="' + t.replace(je, " ").slice(1, -1) + '"' : t, t = 0) : (x = t.tmplName || "unnamed", t.allowCode && (q.allowCode = !0), t.debug && (q.debug = !0), f = t.bnds, b = t.tmpls), r = 0; r < L; r++)
            if (i = e[r], "" + i === i) J += '\n+"' + i + '"';
            else if (o = i[0], "*" === o) J += ";\n" + i[1] + "\nret=ret";
        else {
            if (s = i[1], k = !n && i[2], a = K(i[3], "params") + "}," + K(v = i[4]), $ = i[6], M = i[7], i[8] ? (E = "\nvar ob,ltOb={},ctxs=", O = ";\nctxs.lt=ltOb.lt;\nreturn ctxs;") : (E = "\nreturn ", O = ""), C = i[10] && i[10].replace(Ae, "$1"), (A = "else" === o) ? g && g.push(i[9]) : (R = i[5] || ge.debugMode !== !1 && "undefined", f && (g = i[9]) && (g = [g], I = f.push(1))), S = S || v[1] || v[2] || g || /view.(?!index)/.test(v[0]), (N = ":" === o) ? s && (o = s === Ke ? ">" : s + o) : (k && (w = F(C, q), w.tmplName = x + "/" + o, w.useViews = w.useViews || S, B(k, w), S = w.useViews, b.push(w)), A || (y = o, S = S || o && (!ce[o] || !ce[o].flow), j = J, J = ""), T = e[r + 1], T = T && "else" === T[0]), V = R ? ";\ntry{\nret+=" : "\n+", m = "", h = "", N && (g || $ || s && s !== Ke || M)) {
                if (P = new Function("data,view,j,u", "// " + x + " " + ++I + " " + o + E + "{" + a + "};" + O), P._er = R, P._tag = o, P._bd = !!g, P._lr = M, n) return P;
                U(P, g), _ = 'c("' + s + '",view,', c = !0, m = _ + I + ",", h = ")"
            }
            if (J += N ? (n ? (R ? "try{\n" : "") + "return " : V) + (c ? (c = void 0, S = u = !0, _ + (P ? (f[I - 1] = P, I) : "{" + a + "}") + ")") : ">" === o ? (l = !0, "h(" + v[0] + ")") : (p = !0, "((v=" + v[0] + ")!=null?v:" + (n ? "null)" : '"")'))) : (d = !0, "\n{view:view,content:false,tmpl:" + (k ? b.length : "false") + "," + a + "},"), y && !T) {
                if (J = "[" + J.slice(0, -1) + "]", _ = 't("' + y + '",view,this,', n || g) {
                    if (J = new Function("data,view,j,u", " // " + x + " " + I + " " + y + E + J + O), J._er = R, J._tag = y, g && U(f[I - 1] = J, g), J._lr = M, n) return J;
                    m = _ + I + ",undefined,", h = ")"
                }
                J = j + V + _ + (g && I || J) + ")", g = 0, y = 0
            }
            R && !T && (S = !0, J += ";\n}catch(e){ret" + (n ? "urn " : "+=") + m + "j._err(e,view," + R + ")" + h + ";}" + (n ? "" : "ret=ret"))
        }
        J = "// " + x + (q.debug ? "\ndebugger;" : "") + "\nvar v" + (d ? ",t=j._tag" : "") + (u ? ",c=j._cnvt" : "") + (l ? ",h=j._html" : "") + (n ? (i[8] ? ", ob" : "") + ";\n" : ',ret=""') + J + (n ? "\n" : ";\nreturn ret;");
        try {
            J = new Function("data,view,j,u", J)
        } catch (Q) {
            D("Compiled template code:\n\n" + J + '\n: "' + (Q.message || Q) + '"')
        }
        return t && (t.fn = J, t.useViews = !!S), J
    }

    function Q(e, t) {
        return e && e !== t ? t ? l(l({}, t), e) : e : t && l({}, t)
    }

    function H(e, n) {
        var r, i, o = n.map,
            s = o && o.propsArr;
        if (!s) {
            if (s = [], typeof e === Le || ae(e))
                for (r in e) i = e[r], r === se || !e.hasOwnProperty(r) || n.props.noFunctions && t.isFunction(i) || s.push({
                    key: r,
                    prop: i
                });
            o && (o.propsArr = o.options && s)
        }
        return W(s, n)
    }

    function W(e, n) {
        var r, i, o, s = n.tag,
            a = n.props,
            d = n.params.props,
            l = a.filter,
            p = a.sort,
            u = p === !0,
            c = parseInt(a.step),
            f = a.reverse ? -1 : 1;
        if (!de(e)) return e;
        if (u || p && "" + p === p ? (r = e.map(function(e, t) {
                return e = u ? e : g(e, p), {
                    i: t,
                    v: "" + e === e ? e.toLowerCase() : e
                }
            }), r.sort(function(e, t) {
                return e.v > t.v ? f : e.v < t.v ? -f : 0
            }), e = r.map(function(t) {
                return e[t.i]
            })) : (p || f < 0) && !s.dataMap && (e = e.slice()), ae(p) && (e = e.sort(function() {
                return p.apply(n, arguments)
            })), f < 0 && (!p || ae(p)) && (e = e.reverse()), e.filter && l && (e = e.filter(l, n), n.tag.onFilter && n.tag.onFilter(n)), d.sorted && (r = p || f < 0 ? e : e.slice(), s.sorted ? t.observable(s.sorted).refresh(r) : n.map.sorted = r), i = a.start, o = a.end, (d.start && void 0 === i || d.end && void 0 === o) && (i = o = 0), isNaN(i) && isNaN(o) || (i = +i || 0, o = void 0 === o || o > e.length ? e.length : +o, e = e.slice(i, o)), c > 1) {
            for (i = 0, o = e.length, r = []; i < o; i += c) r.push(e[i]);
            e = r
        }
        return d.paged && s.paged && $observable(s.paged).refresh(e), e
    }

    function Z(e, n, r) {
        var i = this.jquery && (this[0] || S("Unknown template")),
            o = i.getAttribute(Be);
        return E.call(o && t.data(i)[Qe] || le(i), e, n, r)
    }

    function z(e) {
        return Ue[e] || (Ue[e] = "&#" + e.charCodeAt(0) + ";")
    }

    function G(e, t) {
        return qe[t] || ""
    }

    function X(e) {
        return void 0 != e ? $e.test(e) && ("" + e).replace(Oe, z) || e : ""
    }

    function Y(e) {
        return "" + e === e ? e.replace(Ie, z) : e
    }

    function ee(e) {
        return "" + e === e ? e.replace(Se, G) : e
    }
    var te = t === !1;
    t = t && t.fn ? t : e.jQuery;
    var ne, re, ie, oe, se, ae, de, le, pe, ue, ce, fe, ge, ve, me, he, _e, be, xe, we, ye, ke, Ce = "v1.0.2",
        Te = "_ocp",
        je = /[ \t]*(\r\n|\n|\r)/g,
        Ae = /\\(['"])/g,
        Ne = /['"\\]/g,
        Pe = /(?:\x08|^)(onerror:)?(?:(~?)(([\w$.]+):)?([^\x08]+))\x08(,)?([^\x08]+)/gi,
        Re = /^if\s/,
        Fe = /<(\w+)[>\s]/,
        Ve = /[\x00`><"'&=]/g,
        $e = /[\x00`><\"'&=]/,
        Me = /^on[A-Z]|^convert(Back)?$/,
        Ee = /^\#\d+_`[\s\S]*\/\d+_`$/,
        Oe = Ve,
        Ie = /[&<>]/g,
        Se = /&(amp|gt|lt);/g,
        De = /\[['"]?|['"]?\]/g,
        Je = 0,
        Ue = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\0": "&#0;",
            "'": "&#39;",
            '"': "&#34;",
            "`": "&#96;",
            "=": "&#61;"
        },
        qe = {
            amp: "&",
            gt: ">",
            lt: "<"
        },
        Ke = "html",
        Le = "object",
        Be = "data-jsv-tmpl",
        Qe = "jsvTmpl",
        He = "For #index in nested block use #getIndex().",
        We = {},
        Ze = e.jsrender,
        ze = Ze && t && !t.render,
        Ge = {
            template: {
                compile: A
            },
            tag: {
                compile: T
            },
            viewModel: {
                compile: R
            },
            helper: {},
            converter: {}
        };
    if (oe = {
            jsviews: Ce,
            sub: {
                rPath: /^(!*?)(?:null|true|false|\d[\d.]*|([\w$]+|\.|~([\w$]+)|#(view|([\w$]+))?)([\w$.^]*?)(?:[.[^]([\w$]+)\]?)?)$/g,
                rPrm: /(\()(?=\s*\()|(?:([([])\s*)?(?:(\^?)(~?[\w$.^]+)?\s*((\+\+|--)|\+|-|~(?![\w$])|&&|\|\||===|!==|==|!=|<=|>=|[<>%*:?\/]|(=))\s*|(!*?(@)?[#~]?[\w$.^]+)([([])?)|(,\s*)|(\(?)\\?(?:(')|("))|(?:\s*(([)\]])(?=[.^]|\s*$|[^([])|[)\]])([([]?))|(\s+)/g,
                View: k,
                Err: d,
                tmplFn: J,
                parse: L,
                extend: l,
                extendCtx: Q,
                syntaxErr: D,
                onStore: {
                    template: function(e, t) {
                        null === t ? delete We[e] : e && (We[e] = t)
                    }
                },
                addSetting: $,
                settings: {
                    allowCode: !1
                },
                advSet: s,
                _thp: i,
                _gm: r,
                _tg: function() {},
                _cnvt: h,
                _tag: y,
                _er: S,
                _err: I,
                _cp: o,
                _sq: function(e) {
                    return "constructor" === e && D(""), e
                }
            },
            settings: {
                delimiters: p,
                advanced: function(e) {
                    return e ? (l(ve, e), fe.advSet(), me) : ve
                }
            },
            map: M
        }, (d.prototype = new Error).constructor = d, c.depends = function() {
            return [this.get("item"), "index"]
        }, f.depends = "index", k.prototype = {get: u,
            getIndex: f,
            ctxPrm: v,
            getRsc: w,
            _getTmpl: m,
            _getOb: g,
            _is: "view"
        }, fe = oe.sub, me = oe.settings, !(Ze || t && t.render)) {
        for (ne in Ge) V(ne, Ge[ne]);
        if (pe = oe.converters, ue = oe.helpers, ce = oe.tags, fe._tg.prototype = {
                baseApply: j,
                cvtArgs: _,
                bndArgs: x,
                ctxPrm: v
            }, ie = fe.topView = new k, t) {
            if (t.fn.render = Z, se = t.expando, t.observable) {
                if (Ce !== (Ce = t.views.jsviews)) throw "JsObservable requires JsRender " + Ce;
                l(fe, t.views.sub), oe.map = t.views.map
            }
        } else t = {}, te && (e.jsrender = t), t.renderFile = t.__express = t.compile = function() {
            throw "Node.js: use npm jsrender, or jsrender-node.js"
        }, t.isFunction = function(e) {
            return "function" == typeof e
        }, t.isArray = Array.isArray || function(e) {
            return "[object Array]" === {}.toString.call(e)
        }, fe._jq = function(e) {
            e !== t && (l(e, t), t = e, t.fn.render = Z, delete t.jsrender, se = t.expando)
        }, t.jsrender = Ce;
        ge = fe.settings, ge.allowCode = !1, ae = t.isFunction, t.render = We, t.views = oe, t.templates = le = oe.templates;
        for (ye in ge) $(ye);
        (me.debugMode = function(e) {
            return void 0 === e ? ge.debugMode : (ge.debugMode = e, ge.onError = e + "" === e ? function() {
                return e
            } : ae(e) ? e : void 0, me)
        })(!1), ve = ge.advanced = {
            useViews: !1,
            _jsv: !1
        }, ce({
            "if": {
                render: function(e) {
                    var t = this,
                        n = t.tagCtx,
                        r = t.rendering.done || !e && (n.args.length || !n.index) ? "" : (t.rendering.done = !0, void(t.selected = n.index));
                    return r
                },
                contentCtx: !0,
                flow: !0
            },
            "for": {
                sortDataMap: M(W),
                init: function(e, t) {
                    var n, r, i, o = this,
                        s = o.tagCtxs;
                    for (n = s.length; n--;) r = s[n], i = r.params.props, r.argDefault = void 0 === r.props.end || r.args.length > 0, r.argDefault !== !1 && de(r.args[0]) && (void 0 !== i.sort || i.start || i.end || i.step || i.filter || i.reverse) && (r.props.dataMap = o.sortDataMap)
                },
                render: function(e) {
                    var t, n, r, i, o, s = this,
                        a = s.tagCtx,
                        d = a.argDefault === !1,
                        l = a.props,
                        p = d || a.args.length,
                        u = "",
                        c = 0;
                    if (!s.rendering.done) {
                        if (t = p ? e : a.view.data, d)
                            for (d = l.reverse ? "unshift" : "push", i = +l.end, o = +l.step || 1, t = [], r = +l.start || 0;
                                (i - r) * o > 0; r += o) t[d](r);
                        void 0 !== t && (n = de(t), u += a.render(t, !p || l.noIteration), c += n ? t.length : 1), (s.rendering.done = c) && (s.selected = a.index)
                    }
                    return u
                },
                flow: !0
            },
            props: {
                baseTag: "for",
                dataMap: M(H),
                init: s,
                flow: !0
            },
            include: {
                flow: !0
            },
            "*": {
                render: o,
                flow: !0
            },
            ":*": {
                render: o,
                flow: !0
            },
            dbg: ue.dbg = pe.dbg = a
        }), pe({
            html: X,
            attr: X,
            encode: Y,
            unencode: ee,
            url: function(e) {
                return void 0 != e ? encodeURI("" + e) : null === e ? e : ""
            }
        })
    }
    return ge = fe.settings, de = (t || Ze).isArray, me.delimiters("{{", "}}", "^"), ze && Ze.views.sub._jq(t), t || Ze
}, window);