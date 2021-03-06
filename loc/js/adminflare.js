/*!
 * iScroll Lite base on iScroll v4.1.6 ~ Copyright (c) 2011 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function() {
    var s = Math, d = function(m) {
        return m >> 0;
    }, w = /webkit/i.test(navigator.appVersion) ? "webkit" : /firefox/i.test(navigator.userAgent) ? "Moz" : "opera" in window ? "O" : "", z = /android/gi.test(navigator.appVersion), j = /iphone|ipad/gi.test(navigator.appVersion), c = /playbook/gi.test(navigator.appVersion), o = /hp-tablet/gi.test(navigator.appVersion), l = "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix(), v = "ontouchstart" in window && !o, f = w + "Transform" in document.documentElement.style, g = j || c, p = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(m) {
            return setTimeout(m, 17);
        };
    }(), n = function() {
        return window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;
    }(), h = "onorientationchange" in window ? "orientationchange" : "resize", b = v ? "touchstart" : "mousedown", r = v ? "touchmove" : "mousemove", e = v ? "touchend" : "mouseup", u = v ? "touchcancel" : "mouseup", a = "translate" + (l ? "3d(" : "("), k = l ? ",0)" : ")", t = function(B, m) {
        var C = this, D = document, A;
        C.wrapper = typeof B == "object" ? B : D.getElementById(B);
        C.wrapper.style.overflow = "hidden";
        C.scroller = C.wrapper.children[0];
        C.options = {
            hScroll: true,
            vScroll: true,
            x: 0,
            y: 0,
            bounce: true,
            bounceLock: false,
            momentum: true,
            lockDirection: true,
            useTransform: true,
            useTransition: false,
            onRefresh: null,
            onBeforeScrollStart: function(E) {
                E.preventDefault();
            },
            onScrollStart: null,
            onBeforeScrollMove: null,
            onScrollMove: null,
            onBeforeScrollEnd: null,
            onScrollEnd: null,
            onTouchEnd: null,
            onDestroy: null
        };
        for (A in m) {
            C.options[A] = m[A];
        }
        C.x = C.options.x;
        C.y = C.options.y;
        C.options.useTransform = f ? C.options.useTransform : false;
        C.options.hScrollbar = C.options.hScroll && C.options.hScrollbar;
        C.options.vScrollbar = C.options.vScroll && C.options.vScrollbar;
        C.options.useTransition = g && C.options.useTransition;
        C.scroller.style[w + "TransitionProperty"] = C.options.useTransform ? "-" + w.toLowerCase() + "-transform" : "top left";
        C.scroller.style[w + "TransitionDuration"] = "0";
        C.scroller.style[w + "TransformOrigin"] = "0 0";
        if (C.options.useTransition) {
            C.scroller.style[w + "TransitionTimingFunction"] = "cubic-bezier(0.33,0.66,0.66,1)";
        }
        if (C.options.useTransform) {
            C.scroller.style[w + "Transform"] = a + C.x + "px," + C.y + "px" + k;
        } else {
            C.scroller.style.cssText += ";position:absolute;top:" + C.y + "px;left:" + C.x + "px";
        }
        C.refresh();
        C._bind(h, window);
        C._bind(b);
        if (!v) {
            C._bind("mouseout", C.wrapper);
        }
    };
    t.prototype = {
        enabled: true,
        x: 0,
        y: 0,
        steps: [],
        scale: 1,
        handleEvent: function(A) {
            var m = this;
            switch (A.type) {
              case b:
                if (!v && A.button !== 0) {
                    return;
                }
                m._start(A);
                break;

              case r:
                m._move(A);
                break;

              case e:
              case u:
                m._end(A);
                break;

              case h:
                m._resize();
                break;

              case "mouseout":
                m._mouseout(A);
                break;

              case "webkitTransitionEnd":
                m._transitionEnd(A);
                break;
            }
        },
        _resize: function() {
            this.refresh();
        },
        _pos: function(m, A) {
            m = this.hScroll ? m : 0;
            A = this.vScroll ? A : 0;
            if (this.options.useTransform) {
                this.scroller.style[w + "Transform"] = a + m + "px," + A + "px" + k + " scale(" + this.scale + ")";
            } else {
                m = d(m);
                A = d(A);
                this.scroller.style.left = m + "px";
                this.scroller.style.top = A + "px";
            }
            this.x = m;
            this.y = A;
        },
        _start: function(D) {
            var C = this, A = v ? D.touches[0] : D, B, m, E;
            if (!C.enabled) {
                return;
            }
            if (C.options.onBeforeScrollStart) {
                C.options.onBeforeScrollStart.call(C, D);
            }
            if (C.options.useTransition) {
                C._transitionTime(0);
            }
            C.moved = false;
            C.animating = false;
            C.zoomed = false;
            C.distX = 0;
            C.distY = 0;
            C.absDistX = 0;
            C.absDistY = 0;
            C.dirX = 0;
            C.dirY = 0;
            if (C.options.momentum) {
                if (C.options.useTransform) {
                    B = getComputedStyle(C.scroller, null)[w + "Transform"].replace(/[^0-9-.,]/g, "").split(",");
                    m = B[4] * 1;
                    E = B[5] * 1;
                } else {
                    m = getComputedStyle(C.scroller, null).left.replace(/[^0-9-]/g, "") * 1;
                    E = getComputedStyle(C.scroller, null).top.replace(/[^0-9-]/g, "") * 1;
                }
                if (m != C.x || E != C.y) {
                    if (C.options.useTransition) {
                        C._unbind("webkitTransitionEnd");
                    } else {
                        n(C.aniTime);
                    }
                    C.steps = [];
                    C._pos(m, E);
                }
            }
            C.startX = C.x;
            C.startY = C.y;
            C.pointX = A.pageX;
            C.pointY = A.pageY;
            C.startTime = D.timeStamp || Date.now();
            if (C.options.onScrollStart) {
                C.options.onScrollStart.call(C, D);
            }
            C._bind(r);
            C._bind(e);
            C._bind(u);
        },
        _move: function(F) {
            var C = this, A = v ? F.touches[0] : F, B = A.pageX - C.pointX, m = A.pageY - C.pointY, G = C.x + B, E = C.y + m, D = F.timeStamp || Date.now();
            if (C.options.onBeforeScrollMove) {
                C.options.onBeforeScrollMove.call(C, F);
            }
            C.pointX = A.pageX;
            C.pointY = A.pageY;
            if (G > 0 || G < C.maxScrollX) {
                G = C.options.bounce ? C.x + B / 2 : G >= 0 || C.maxScrollX >= 0 ? 0 : C.maxScrollX;
            }
            if (E > 0 || E < C.maxScrollY) {
                E = C.options.bounce ? C.y + m / 2 : E >= 0 || C.maxScrollY >= 0 ? 0 : C.maxScrollY;
            }
            C.distX += B;
            C.distY += m;
            C.absDistX = s.abs(C.distX);
            C.absDistY = s.abs(C.distY);
            if (C.absDistX < 6 && C.absDistY < 6) {
                return;
            }
            if (C.options.lockDirection) {
                if (C.absDistX > C.absDistY + 5) {
                    E = C.y;
                    m = 0;
                } else {
                    if (C.absDistY > C.absDistX + 5) {
                        G = C.x;
                        B = 0;
                    }
                }
            }
            C.moved = true;
            C._pos(G, E);
            C.dirX = B > 0 ? -1 : B < 0 ? 1 : 0;
            C.dirY = m > 0 ? -1 : m < 0 ? 1 : 0;
            if (D - C.startTime > 300) {
                C.startTime = D;
                C.startX = C.x;
                C.startY = C.y;
            }
            if (C.options.onScrollMove) {
                C.options.onScrollMove.call(C, F);
            }
        },
        _end: function(F) {
            if (v && F.touches.length != 0) {
                return;
            }
            var D = this, J = v ? F.changedTouches[0] : F, G, I, B = {
                dist: 0,
                time: 0
            }, m = {
                dist: 0,
                time: 0
            }, C = (F.timeStamp || Date.now()) - D.startTime, H = D.x, E = D.y, A;
            D._unbind(r);
            D._unbind(e);
            D._unbind(u);
            if (D.options.onBeforeScrollEnd) {
                D.options.onBeforeScrollEnd.call(D, F);
            }
            if (!D.moved) {
                if (v) {
                    G = J.target;
                    while (G.nodeType != 1) {
                        G = G.parentNode;
                    }
                    if (G.tagName != "SELECT" && G.tagName != "INPUT" && G.tagName != "TEXTAREA") {
                        I = document.createEvent("MouseEvents");
                        I.initMouseEvent("click", true, true, F.view, 1, J.screenX, J.screenY, J.clientX, J.clientY, F.ctrlKey, F.altKey, F.shiftKey, F.metaKey, 0, null);
                        I._fake = true;
                        G.dispatchEvent(I);
                    }
                }
                D._resetPos(200);
                if (D.options.onTouchEnd) {
                    D.options.onTouchEnd.call(D, F);
                }
                return;
            }
            if (C < 300 && D.options.momentum) {
                B = H ? D._momentum(H - D.startX, C, -D.x, D.scrollerW - D.wrapperW + D.x, D.options.bounce ? D.wrapperW : 0) : B;
                m = E ? D._momentum(E - D.startY, C, -D.y, D.maxScrollY < 0 ? D.scrollerH - D.wrapperH + D.y : 0, D.options.bounce ? D.wrapperH : 0) : m;
                H = D.x + B.dist;
                E = D.y + m.dist;
                if (D.x > 0 && H > 0 || D.x < D.maxScrollX && H < D.maxScrollX) {
                    B = {
                        dist: 0,
                        time: 0
                    };
                }
                if (D.y > 0 && E > 0 || D.y < D.maxScrollY && E < D.maxScrollY) {
                    m = {
                        dist: 0,
                        time: 0
                    };
                }
            }
            if (B.dist || m.dist) {
                A = s.max(s.max(B.time, m.time), 10);
                D.scrollTo(d(H), d(E), A);
                if (D.options.onTouchEnd) {
                    D.options.onTouchEnd.call(D, F);
                }
                return;
            }
            D._resetPos(200);
            if (D.options.onTouchEnd) {
                D.options.onTouchEnd.call(D, F);
            }
        },
        _resetPos: function(B) {
            var m = this, C = m.x >= 0 ? 0 : m.x < m.maxScrollX ? m.maxScrollX : m.x, A = m.y >= 0 || m.maxScrollY > 0 ? 0 : m.y < m.maxScrollY ? m.maxScrollY : m.y;
            if (C == m.x && A == m.y) {
                if (m.moved) {
                    if (m.options.onScrollEnd) {
                        m.options.onScrollEnd.call(m);
                    }
                    m.moved = false;
                }
                return;
            }
            m.scrollTo(C, A, B || 0);
        },
        _mouseout: function(A) {
            var m = A.relatedTarget;
            if (!m) {
                this._end(A);
                return;
            }
            while (m = m.parentNode) {
                if (m == this.wrapper) {
                    return;
                }
            }
            this._end(A);
        },
        _transitionEnd: function(A) {
            var m = this;
            if (A.target != m.scroller) {
                return;
            }
            m._unbind("webkitTransitionEnd");
            m._startAni();
        },
        _startAni: function() {
            var F = this, A = F.x, m = F.y, D = Date.now(), E, C, B;
            if (F.animating) {
                return;
            }
            if (!F.steps.length) {
                F._resetPos(400);
                return;
            }
            E = F.steps.shift();
            if (E.x == A && E.y == m) {
                E.time = 0;
            }
            F.animating = true;
            F.moved = true;
            if (F.options.useTransition) {
                F._transitionTime(E.time);
                F._pos(E.x, E.y);
                F.animating = false;
                if (E.time) {
                    F._bind("webkitTransitionEnd");
                } else {
                    F._resetPos(0);
                }
                return;
            }
            B = function() {
                var G = Date.now(), I, H;
                if (G >= D + E.time) {
                    F._pos(E.x, E.y);
                    F.animating = false;
                    if (F.options.onAnimationEnd) {
                        F.options.onAnimationEnd.call(F);
                    }
                    F._startAni();
                    return;
                }
                G = (G - D) / E.time - 1;
                C = s.sqrt(1 - G * G);
                I = (E.x - A) * C + A;
                H = (E.y - m) * C + m;
                F._pos(I, H);
                if (F.animating) {
                    F.aniTime = p(B);
                }
            };
            B();
        },
        _transitionTime: function(m) {
            this.scroller.style[w + "TransitionDuration"] = m + "ms";
        },
        _momentum: function(G, A, E, m, I) {
            var F = 6e-4, B = s.abs(G) / A, C = B * B / (2 * F), H = 0, D = 0;
            if (G > 0 && C > E) {
                D = I / (6 / (C / B * F));
                E = E + D;
                B = B * E / C;
                C = E;
            } else {
                if (G < 0 && C > m) {
                    D = I / (6 / (C / B * F));
                    m = m + D;
                    B = B * m / C;
                    C = m;
                }
            }
            C = C * (G < 0 ? -1 : 1);
            H = B / F;
            return {
                dist: C,
                time: d(H)
            };
        },
        _offset: function(m) {
            var B = -m.offsetLeft, A = -m.offsetTop;
            while (m = m.offsetParent) {
                B -= m.offsetLeft;
                A -= m.offsetTop;
            }
            return {
                left: B,
                top: A
            };
        },
        _bind: function(B, A, m) {
            (A || this.scroller).addEventListener(B, this, !!m);
        },
        _unbind: function(B, A, m) {
            (A || this.scroller).removeEventListener(B, this, !!m);
        },
        destroy: function() {
            var m = this;
            m.scroller.style[w + "Transform"] = "";
            m._unbind(h, window);
            m._unbind(b);
            m._unbind(r);
            m._unbind(e);
            m._unbind(u);
            m._unbind("mouseout", m.wrapper);
            if (m.options.useTransition) {
                m._unbind("webkitTransitionEnd");
            }
            if (m.options.onDestroy) {
                m.options.onDestroy.call(m);
            }
        },
        refresh: function() {
            var m = this, A;
            m.wrapperW = m.wrapper.clientWidth;
            m.wrapperH = m.wrapper.clientHeight;
            m.scrollerW = m.scroller.offsetWidth;
            m.scrollerH = m.scroller.offsetHeight;
            m.maxScrollX = m.wrapperW - m.scrollerW;
            m.maxScrollY = m.wrapperH - m.scrollerH;
            m.dirX = 0;
            m.dirY = 0;
            m.hScroll = m.options.hScroll && m.maxScrollX < 0;
            m.vScroll = m.options.vScroll && (!m.options.bounceLock && !m.hScroll || m.scrollerH > m.wrapperH);
            A = m._offset(m.wrapper);
            m.wrapperOffsetLeft = -A.left;
            m.wrapperOffsetTop = -A.top;
            m.scroller.style[w + "TransitionDuration"] = "0";
            m._resetPos(200);
        },
        scrollTo: function(m, G, F, E) {
            var D = this, C = m, B, A;
            D.stop();
            if (!C.length) {
                C = [ {
                    x: m,
                    y: G,
                    time: F,
                    relative: E
                } ];
            }
            for (B = 0, A = C.length; B < A; B++) {
                if (C[B].relative) {
                    C[B].x = D.x - C[B].x;
                    C[B].y = D.y - C[B].y;
                }
                D.steps.push({
                    x: C[B].x,
                    y: C[B].y,
                    time: C[B].time || 0
                });
            }
            D._startAni();
        },
        scrollToElement: function(m, B) {
            var A = this, C;
            m = m.nodeType ? m : A.scroller.querySelector(m);
            if (!m) {
                return;
            }
            C = A._offset(m);
            C.left += A.wrapperOffsetLeft;
            C.top += A.wrapperOffsetTop;
            C.left = C.left > 0 ? 0 : C.left < A.maxScrollX ? A.maxScrollX : C.left;
            C.top = C.top > 0 ? 0 : C.top < A.maxScrollY ? A.maxScrollY : C.top;
            B = B === undefined ? s.max(s.abs(C.left) * 2, s.abs(C.top) * 2) : B;
            A.scrollTo(C.left, C.top, B);
        },
        disable: function() {
            this.stop();
            this._resetPos(0);
            this.enabled = false;
            this._unbind(r);
            this._unbind(e);
            this._unbind(u);
        },
        enable: function() {
            this.enabled = true;
        },
        stop: function() {
            n(this.aniTime);
            this.steps = [];
            this.moved = false;
            this.animating = false;
        }
    };
    if (typeof exports !== "undefined") {
        exports.iScroll = t;
    } else {
        window.iScroll = t;
    }
})();

!function(c) {
    var d = function(e) {
        this.value = {
            h: 1,
            s: 1,
            b: 1,
            a: 1
        };
        this.setColor(e);
    };
    d.prototype = {
        constructor: d,
        setColor: function(f) {
            f = f.toLowerCase();
            var e = this;
            c.each(b.stringParsers, function(j, l) {
                var h = l.re.exec(f), g = h && l.parse(h), k = l.space || "rgba";
                if (g) {
                    if (k === "hsla") {
                        e.value = b.RGBtoHSB.apply(null, b.HSLtoRGB.apply(null, g));
                    } else {
                        e.value = b.RGBtoHSB.apply(null, g);
                    }
                    return false;
                }
            });
        },
        setHue: function(e) {
            this.value.h = 1 - e;
        },
        setSaturation: function(e) {
            this.value.s = e;
        },
        setLightness: function(e) {
            this.value.b = 1 - e;
        },
        setAlpha: function(e) {
            this.value.a = parseInt((1 - e) * 100, 10) / 100;
        },
        toRGB: function(k, o, l, m) {
            if (!k) {
                k = this.value.h;
                o = this.value.s;
                l = this.value.b;
            }
            k *= 360;
            var j, n, f, g, e;
            k = k % 360 / 60;
            e = l * o;
            g = e * (1 - Math.abs(k % 2 - 1));
            j = n = f = l - e;
            k = ~~k;
            j += [ e, g, 0, 0, g, e ][k];
            n += [ g, e, e, g, 0, 0 ][k];
            f += [ 0, 0, g, e, e, g ][k];
            return {
                r: Math.round(j * 255),
                g: Math.round(n * 255),
                b: Math.round(f * 255),
                a: m || this.value.a
            };
        },
        toHex: function(k, j, e, f) {
            var g = this.toRGB(k, j, e, f);
            return "#" + (1 << 24 | parseInt(g.r) << 16 | parseInt(g.g) << 8 | parseInt(g.b)).toString(16).substr(1);
        },
        toHSL: function(m, l, f, g) {
            if (!m) {
                m = this.value.h;
                l = this.value.s;
                f = this.value.b;
            }
            var k = m, e = (2 - l) * f, j = l * f;
            if (e > 0 && e <= 1) {
                j /= e;
            } else {
                j /= 2 - e;
            }
            e /= 2;
            if (j > 1) {
                j = 1;
            }
            return {
                h: k,
                s: j,
                l: e,
                a: g || this.value.a
            };
        }
    };
    var a = function(f, e) {
        this.element = c(f);
        var g = e.format || this.element.data("color-format") || "hex";
        this.format = b.translateFormats[g];
        this.isInput = this.element.is("input");
        this.component = this.element.is(".color") ? this.element.find(".add-on") : false;
        this.picker = c(b.template).appendTo("body").on("mousedown", c.proxy(this.mousedown, this));
        if (this.isInput) {
            this.element.on({
                focus: c.proxy(this.show, this),
                keyup: c.proxy(this.update, this)
            });
        } else {
            if (this.component) {
                this.component.on({
                    click: c.proxy(this.show, this)
                });
            } else {
                this.element.on({
                    click: c.proxy(this.show, this)
                });
            }
        }
        if (g === "rgba" || g === "hsla") {
            this.picker.addClass("alpha");
            this.alpha = this.picker.find(".colorpicker-alpha")[0].style;
        }
        if (this.component) {
            this.picker.find(".colorpicker-color").hide();
            this.preview = this.element.find("i")[0].style;
        } else {
            this.preview = this.picker.find("div:last")[0].style;
        }
        this.base = this.picker.find("div:first")[0].style;
        this.update();
    };
    a.prototype = {
        constructor: a,
        show: function(f) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.place();
            c(window).on("resize", c.proxy(this.place, this));
            if (!this.isInput) {
                if (f) {
                    f.stopPropagation();
                    f.preventDefault();
                }
            }
            c(document).on({
                mousedown: c.proxy(this.hide, this)
            });
            this.element.trigger({
                type: "show",
                color: this.color
            });
        },
        update: function() {
            this.color = new d(this.isInput ? this.element.prop("value") : this.element.data("color"));
            this.picker.find("i").eq(0).css({
                left: this.color.value.s * 100,
                top: 100 - this.color.value.b * 100
            }).end().eq(1).css("top", 100 * (1 - this.color.value.h)).end().eq(2).css("top", 100 * (1 - this.color.value.a));
            this.previewColor();
        },
        setValue: function(e) {
            this.color = new d(e);
            this.picker.find("i").eq(0).css({
                left: this.color.value.s * 100,
                top: 100 - this.color.value.b * 100
            }).end().eq(1).css("top", 100 * (1 - this.color.value.h)).end().eq(2).css("top", 100 * (1 - this.color.value.a));
            this.previewColor();
            this.element.trigger({
                type: "changeColor",
                color: this.color
            });
        },
        hide: function() {
            this.picker.hide();
            c(window).off("resize", this.place);
            if (!this.isInput) {
                c(document).off({
                    mousedown: this.hide
                });
                if (this.component) {
                    this.element.find("input").prop("value", this.format.call(this));
                }
                this.element.data("color", this.format.call(this));
            } else {
                this.element.prop("value", this.format.call(this));
            }
            this.element.trigger({
                type: "hide",
                color: this.color
            });
        },
        place: function() {
            var e = this.component ? this.component.offset() : this.element.offset();
            this.picker.css({
                top: e.top + this.height,
                left: e.left
            });
        },
        previewColor: function() {
            try {
                this.preview.backgroundColor = this.format.call(this);
            } catch (f) {
                this.preview.backgroundColor = this.color.toHex();
            }
            this.base.backgroundColor = this.color.toHex(this.color.value.h, 1, 1, 1);
            if (this.alpha) {
                this.alpha.backgroundColor = this.color.toHex();
            }
        },
        pointer: null,
        slider: null,
        mousedown: function(h) {
            h.stopPropagation();
            h.preventDefault();
            var g = c(h.target);
            var f = g.closest("div");
            if (!f.is(".colorpicker")) {
                if (f.is(".colorpicker-saturation")) {
                    this.slider = c.extend({}, b.sliders.saturation);
                } else {
                    if (f.is(".colorpicker-hue")) {
                        this.slider = c.extend({}, b.sliders.hue);
                    } else {
                        if (f.is(".colorpicker-alpha")) {
                            this.slider = c.extend({}, b.sliders.alpha);
                        } else {
                            return false;
                        }
                    }
                }
                var j = f.offset();
                this.slider.knob = f.find("i")[0].style;
                this.slider.left = h.pageX - j.left;
                this.slider.top = h.pageY - j.top;
                this.pointer = {
                    left: h.pageX,
                    top: h.pageY
                };
                c(document).on({
                    mousemove: c.proxy(this.mousemove, this),
                    mouseup: c.proxy(this.mouseup, this)
                }).trigger("mousemove");
            }
            return false;
        },
        mousemove: function(h) {
            h.stopPropagation();
            h.preventDefault();
            var g = Math.max(0, Math.min(this.slider.maxLeft, this.slider.left + ((h.pageX || this.pointer.left) - this.pointer.left)));
            var f = Math.max(0, Math.min(this.slider.maxTop, this.slider.top + ((h.pageY || this.pointer.top) - this.pointer.top)));
            this.slider.knob.left = g + "px";
            this.slider.knob.top = f + "px";
            if (this.slider.callLeft) {
                this.color[this.slider.callLeft].call(this.color, g / 100);
            }
            if (this.slider.callTop) {
                this.color[this.slider.callTop].call(this.color, f / 100);
            }
            this.previewColor();
            this.element.trigger({
                type: "changeColor",
                color: this.color
            });
            return false;
        },
        mouseup: function(f) {
            f.stopPropagation();
            f.preventDefault();
            c(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            });
            return false;
        }
    };
    c.fn.colorpicker = function(e) {
        return this.each(function() {
            var h = c(this), g = h.data("colorpicker"), f = typeof e === "object" && e;
            if (!g) {
                h.data("colorpicker", g = new a(this, c.extend({}, c.fn.colorpicker.defaults, f)));
            }
            if (typeof e === "string") {
                g[e]();
            }
        });
    };
    c.fn.colorpicker.defaults = {};
    c.fn.colorpicker.Constructor = a;
    var b = {
        translateFormats: {
            rgb: function() {
                var e = this.color.toRGB();
                return "rgb(" + e.r + "," + e.g + "," + e.b + ")";
            },
            rgba: function() {
                var e = this.color.toRGB();
                return "rgba(" + e.r + "," + e.g + "," + e.b + "," + e.a + ")";
            },
            hsl: function() {
                var e = this.color.toHSL();
                return "hsl(" + Math.round(e.h * 360) + "," + Math.round(e.s * 100) + "%," + Math.round(e.l * 100) + "%)";
            },
            hsla: function() {
                var e = this.color.toHSL();
                return "hsla(" + Math.round(e.h * 360) + "," + Math.round(e.s * 100) + "%," + Math.round(e.l * 100) + "%," + e.a + ")";
            },
            hex: function() {
                return this.color.toHex();
            }
        },
        sliders: {
            saturation: {
                maxLeft: 100,
                maxTop: 100,
                callLeft: "setSaturation",
                callTop: "setLightness"
            },
            hue: {
                maxLeft: 0,
                maxTop: 100,
                callLeft: false,
                callTop: "setHue"
            },
            alpha: {
                maxLeft: 0,
                maxTop: 100,
                callLeft: false,
                callTop: "setAlpha"
            }
        },
        RGBtoHSB: function(m, l, e, h) {
            m /= 255;
            l /= 255;
            e /= 255;
            var k, j, f, n;
            f = Math.max(m, l, e);
            n = f - Math.min(m, l, e);
            k = n === 0 ? null : f == m ? (l - e) / n : f == l ? (e - m) / n + 2 : (m - l) / n + 4;
            k = (k + 360) % 6 * 60 / 360;
            j = n === 0 ? 0 : n / f;
            return {
                h: k || 1,
                s: j,
                b: f,
                a: h || 1
            };
        },
        HueToRGB: function(g, f, e) {
            if (e < 0) {
                e += 1;
            } else {
                if (e > 1) {
                    e -= 1;
                }
            }
            if (e * 6 < 1) {
                return g + (f - g) * e * 6;
            } else {
                if (e * 2 < 1) {
                    return f;
                } else {
                    if (e * 3 < 2) {
                        return g + (f - g) * (2 / 3 - e) * 6;
                    } else {
                        return g;
                    }
                }
            }
        },
        HSLtoRGB: function(o, z, m, w) {
            if (z < 0) {
                z = 0;
            }
            var f;
            if (m <= .5) {
                f = m * (1 + z);
            } else {
                f = m + z - m * z;
            }
            var j = 2 * m - f;
            var u = o + 1 / 3;
            var k = o;
            var n = o - 1 / 3;
            var e = Math.round(b.HueToRGB(j, f, u) * 255);
            var t = Math.round(b.HueToRGB(j, f, k) * 255);
            var v = Math.round(b.HueToRGB(j, f, n) * 255);
            return [ e, t, v, w || 1 ];
        },
        stringParsers: [ {
            re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
            parse: function(e) {
                return [ e[1], e[2], e[3], e[4] ];
            }
        }, {
            re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
            parse: function(e) {
                return [ 2.55 * e[1], 2.55 * e[2], 2.55 * e[3], e[4] ];
            }
        }, {
            re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
            parse: function(e) {
                return [ parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16) ];
            }
        }, {
            re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
            parse: function(e) {
                return [ parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16) ];
            }
        }, {
            re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
            space: "hsla",
            parse: function(e) {
                return [ e[1] / 360, e[2] / 100, e[3] / 100, e[4] ];
            }
        } ],
        template: '<div class="colorpicker dropdown-menu"><div class="colorpicker-saturation"><i><b></b></i></div><div class="colorpicker-hue"><i></i></div><div class="colorpicker-alpha"><i></i></div><div class="colorpicker-color"><div /></div></div>'
    };
}(window.jQuery);

!function(c) {
    var a = function(e, d) {
        this.element = c(e);
        this.format = b.parseFormat(d.format || this.element.data("date-format") || "mm/dd/yyyy");
        this.picker = c(b.template).appendTo("body").on({
            click: c.proxy(this.click, this),
            mousedown: c.proxy(this.mousedown, this)
        });
        this.isInput = this.element.is("input");
        this.component = this.element.is(".date") ? this.element.find(".add-on") : false;
        if (this.isInput) {
            this.element.on({
                focus: c.proxy(this.show, this),
                blur: c.proxy(this.hide, this),
                keyup: c.proxy(this.update, this)
            });
        } else {
            if (this.component) {
                this.component.on("click", c.proxy(this.show, this));
            } else {
                this.element.on("click", c.proxy(this.show, this));
            }
        }
        this.minViewMode = d.minViewMode || this.element.data("date-minviewmode") || 0;
        if (typeof this.minViewMode === "string") {
            switch (this.minViewMode) {
              case "months":
                this.minViewMode = 1;
                break;

              case "years":
                this.minViewMode = 2;
                break;

              default:
                this.minViewMode = 0;
                break;
            }
        }
        this.viewMode = d.viewMode || this.element.data("date-viewmode") || 0;
        if (typeof this.viewMode === "string") {
            switch (this.viewMode) {
              case "months":
                this.viewMode = 1;
                break;

              case "years":
                this.viewMode = 2;
                break;

              default:
                this.viewMode = 0;
                break;
            }
        }
        this.startViewMode = this.viewMode;
        this.weekStart = d.weekStart || this.element.data("date-weekstart") || 0;
        this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
        this.fillDow();
        this.fillMonths();
        this.update();
        this.showMode();
    };
    a.prototype = {
        constructor: a,
        show: function(d) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.place();
            c(window).on("resize", c.proxy(this.place, this));
            if (d) {
                d.stopPropagation();
                d.preventDefault();
            }
            if (!this.isInput) {
                c(document).on("mousedown", c.proxy(this.hide, this));
            }
            this.element.trigger({
                type: "show",
                date: this.date
            });
        },
        hide: function() {
            this.picker.hide();
            c(window).off("resize", this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                c(document).off("mousedown", this.hide);
            }
            this.set();
            this.element.trigger({
                type: "hide",
                date: this.date
            });
        },
        set: function() {
            var d = b.formatDate(this.date, this.format);
            if (!this.isInput) {
                if (this.component) {
                    this.element.find("input").prop("value", d);
                }
                this.element.data("date", d);
            } else {
                this.element.prop("value", d);
            }
        },
        setValue: function(d) {
            if (typeof d === "string") {
                this.date = b.parseDate(d, this.format);
            } else {
                this.date = new Date(d);
            }
            this.set();
            this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
            this.fill();
        },
        place: function() {
            var d = this.component ? this.component.offset() : this.element.offset();
            this.picker.css({
                top: d.top + this.height,
                left: d.left
            });
        },
        update: function(d) {
            this.date = b.parseDate(typeof d === "string" ? d : this.isInput ? this.element.prop("value") : this.element.data("date"), this.format);
            this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
            this.fill();
        },
        fillDow: function() {
            var d = this.weekStart;
            var e = "<tr>";
            while (d < this.weekStart + 7) {
                e += '<th class="dow">' + b.dates.daysMin[d++ % 7] + "</th>";
            }
            e += "</tr>";
            this.picker.find(".datepicker-days thead").append(e);
        },
        fillMonths: function() {
            var e = "";
            var d = 0;
            while (d < 12) {
                e += '<span class="month">' + b.dates.monthsShort[d++] + "</span>";
            }
            this.picker.find(".datepicker-months td").append(e);
        },
        fill: function() {
            var o = new Date(this.viewDate), p = o.getFullYear(), n = o.getMonth(), f = this.date.valueOf();
            this.picker.find(".datepicker-days th:eq(1)").text(b.dates.months[n] + " " + p);
            var j = new Date(p, n - 1, 28, 0, 0, 0, 0), r = b.getDaysInMonth(j.getFullYear(), j.getMonth());
            j.setDate(r);
            j.setDate(r - (j.getDay() - this.weekStart + 7) % 7);
            var l = new Date(j);
            l.setDate(l.getDate() + 42);
            l = l.valueOf();
            html = [];
            var h;
            while (j.valueOf() < l) {
                if (j.getDay() === this.weekStart) {
                    html.push("<tr>");
                }
                h = "";
                if (j.getMonth() < n) {
                    h += " old";
                } else {
                    if (j.getMonth() > n) {
                        h += " new";
                    }
                }
                if (j.valueOf() === f) {
                    h += " active";
                }
                html.push('<td class="day' + h + '">' + j.getDate() + "</td>");
                if (j.getDay() === this.weekEnd) {
                    html.push("</tr>");
                }
                j.setDate(j.getDate() + 1);
            }
            this.picker.find(".datepicker-days tbody").empty().append(html.join(""));
            var m = this.date.getFullYear();
            var e = this.picker.find(".datepicker-months").find("th:eq(1)").text(p).end().find("span").removeClass("active");
            if (m === p) {
                e.eq(this.date.getMonth()).addClass("active");
            }
            html = "";
            p = parseInt(p / 10, 10) * 10;
            var g = this.picker.find(".datepicker-years").find("th:eq(1)").text(p + "-" + (p + 9)).end().find("td");
            p -= 1;
            for (var k = -1; k < 11; k++) {
                html += '<span class="year' + (k === -1 || k === 10 ? " old" : "") + (m === p ? " active" : "") + '">' + p + "</span>";
                p += 1;
            }
            g.html(html);
        },
        click: function(j) {
            j.stopPropagation();
            j.preventDefault();
            var h = c(j.target).closest("span, td, th");
            if (h.length === 1) {
                switch (h[0].nodeName.toLowerCase()) {
                  case "th":
                    switch (h[0].className) {
                      case "switch":
                        this.showMode(1);
                        break;

                      case "prev":
                      case "next":
                        this.viewDate["set" + b.modes[this.viewMode].navFnc].call(this.viewDate, this.viewDate["get" + b.modes[this.viewMode].navFnc].call(this.viewDate) + b.modes[this.viewMode].navStep * (h[0].className === "prev" ? -1 : 1));
                        this.fill();
                        this.set();
                        break;
                    }
                    break;

                  case "span":
                    if (h.is(".month")) {
                        var g = h.parent().find("span").index(h);
                        this.viewDate.setMonth(g);
                    } else {
                        var f = parseInt(h.text(), 10) || 0;
                        this.viewDate.setFullYear(f);
                    }
                    if (this.viewMode !== 0) {
                        this.date = new Date(this.viewDate);
                        this.element.trigger({
                            type: "changeDate",
                            date: this.date,
                            viewMode: b.modes[this.viewMode].clsName
                        });
                    }
                    this.showMode(-1);
                    this.fill();
                    this.set();
                    break;

                  case "td":
                    if (h.is(".day")) {
                        var d = parseInt(h.text(), 10) || 1;
                        var g = this.viewDate.getMonth();
                        if (h.is(".old")) {
                            g -= 1;
                        } else {
                            if (h.is(".new")) {
                                g += 1;
                            }
                        }
                        var f = this.viewDate.getFullYear();
                        this.date = new Date(f, g, d, 0, 0, 0, 0);
                        this.viewDate = new Date(f, g, Math.min(28, d), 0, 0, 0, 0);
                        this.fill();
                        this.set();
                        this.element.trigger({
                            type: "changeDate",
                            date: this.date,
                            viewMode: b.modes[this.viewMode].clsName
                        });
                    }
                    break;
                }
            }
        },
        mousedown: function(d) {
            d.stopPropagation();
            d.preventDefault();
        },
        showMode: function(d) {
            if (d) {
                this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + d));
            }
            this.picker.find(">div").hide().filter(".datepicker-" + b.modes[this.viewMode].clsName).show();
        }
    };
    c.fn.datepicker = function(d, e) {
        return this.each(function() {
            var h = c(this), g = h.data("datepicker"), f = typeof d === "object" && d;
            if (!g) {
                h.data("datepicker", g = new a(this, c.extend({}, c.fn.datepicker.defaults, f)));
            }
            if (typeof d === "string") {
                g[d](e);
            }
        });
    };
    c.fn.datepicker.defaults = {};
    c.fn.datepicker.Constructor = a;
    var b = {
        modes: [ {
            clsName: "days",
            navFnc: "Month",
            navStep: 1
        }, {
            clsName: "months",
            navFnc: "FullYear",
            navStep: 1
        }, {
            clsName: "years",
            navFnc: "FullYear",
            navStep: 10
        } ],
        dates: {
            days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
            daysShort: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ],
            daysMin: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su" ],
            months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            monthsShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
        },
        isLeapYear: function(d) {
            return d % 4 === 0 && d % 100 !== 0 || d % 400 === 0;
        },
        getDaysInMonth: function(d, e) {
            return [ 31, b.isLeapYear(d) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ][e];
        },
        parseFormat: function(f) {
            var e = f.match(/[.\/\-\s].*?/), d = f.split(/\W+/);
            if (!e || !d || d.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {
                separator: e,
                parts: d
            };
        },
        parseDate: function(d, h) {
            var g = d.split(h.separator), d = new Date(), j;
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            if (g.length === h.parts.length) {
                for (var f = 0, e = h.parts.length; f < e; f++) {
                    j = parseInt(g[f], 10) || 1;
                    switch (h.parts[f]) {
                      case "dd":
                      case "d":
                        d.setDate(j);
                        break;

                      case "mm":
                      case "m":
                        d.setMonth(j - 1);
                        break;

                      case "yy":
                        d.setFullYear(2e3 + j);
                        break;

                      case "yyyy":
                        d.setFullYear(j);
                        break;
                    }
                }
            }
            return d;
        },
        formatDate: function(d, g) {
            var h = {
                d: d.getDate(),
                m: d.getMonth() + 1,
                yy: d.getFullYear().toString().substring(2),
                yyyy: d.getFullYear()
            };
            h.dd = (h.d < 10 ? "0" : "") + h.d;
            h.mm = (h.m < 10 ? "0" : "") + h.m;
            var d = [];
            for (var f = 0, e = g.parts.length; f < e; f++) {
                d.push(h[g.parts[f]]);
            }
            return d.join(g.separator);
        },
        headTemplate: '<thead><tr><th class="prev">&lsaquo;</th><th colspan="5" class="switch"></th><th class="next">&rsaquo;</th></tr></thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
    };
    b.template = '<div class="datepicker dropdown-menu"><div class="datepicker-days"><table class=" table-condensed">' + b.headTemplate + '<tbody></tbody></table></div><div class="datepicker-months"><table class="table-condensed">' + b.headTemplate + b.contTemplate + '</table></div><div class="datepicker-years"><table class="table-condensed">' + b.headTemplate + b.contTemplate + "</table></div></div>";
}(window.jQuery);

!function(b) {
    var a = function(d, c) {
        this.$element = b(d);
        this.options = b.extend({}, b.fn.timepicker.defaults, c, this.$element.data());
        this.minuteStep = this.options.minuteStep || this.minuteStep;
        this.secondStep = this.options.secondStep || this.secondStep;
        this.showMeridian = this.options.showMeridian || this.showMeridian;
        this.showSeconds = this.options.showSeconds || this.showSeconds;
        this.showInputs = this.options.showInputs || this.showInputs;
        this.disableFocus = this.options.disableFocus || this.disableFocus;
        this.template = this.options.template || this.template;
        this.modalBackdrop = this.options.modalBackdrop || this.modalBackdrop;
        this.defaultTime = this.options.defaultTime || this.defaultTime;
        this.open = false;
        this.init();
    };
    a.prototype = {
        constructor: a,
        init: function() {
            if (this.$element.parent().hasClass("input-append")) {
                this.$element.parent(".input-append").find(".add-on").on("click", b.proxy(this.showWidget, this));
                this.$element.on({
                    focus: b.proxy(this.highlightUnit, this),
                    click: b.proxy(this.highlightUnit, this),
                    keypress: b.proxy(this.elementKeypress, this),
                    blur: b.proxy(this.blurElement, this)
                });
            } else {
                if (this.template) {
                    this.$element.on({
                        focus: b.proxy(this.showWidget, this),
                        click: b.proxy(this.showWidget, this),
                        blur: b.proxy(this.blurElement, this)
                    });
                } else {
                    this.$element.on({
                        focus: b.proxy(this.highlightUnit, this),
                        click: b.proxy(this.highlightUnit, this),
                        keypress: b.proxy(this.elementKeypress, this),
                        blur: b.proxy(this.blurElement, this)
                    });
                }
            }
            this.$widget = b(this.getTemplate()).appendTo("body");
            this.$widget.on("click", b.proxy(this.widgetClick, this));
            if (this.showInputs) {
                this.$widget.find("input").on({
                    click: function() {
                        this.select();
                    },
                    keypress: b.proxy(this.widgetKeypress, this),
                    change: b.proxy(this.updateFromWidgetInputs, this)
                });
            }
            this.setDefaultTime(this.defaultTime);
        },
        showWidget: function(c) {
            c.stopPropagation();
            c.preventDefault();
            if (this.open) {
                return;
            }
            this.$element.trigger("show");
            if (this.disableFocus) {
                this.$element.blur();
            }
            var d = b.extend({}, this.$element.offset(), {
                height: this.$element[0].offsetHeight
            });
            this.updateFromElementVal();
            b("html").trigger("click.timepicker.data-api").one("click.timepicker.data-api", b.proxy(this.hideWidget, this));
            if (this.template === "modal") {
                this.$widget.modal("show").on("hidden", b.proxy(this.hideWidget, this));
            } else {
                this.$widget.css({
                    top: d.top + d.height,
                    left: d.left
                });
                if (!this.open) {
                    this.$widget.addClass("open");
                }
            }
            this.open = true;
            this.$element.trigger("shown");
        },
        hideWidget: function() {
            this.$element.trigger("hide");
            if (this.template === "modal") {
                this.$widget.modal("hide");
            } else {
                this.$widget.removeClass("open");
            }
            this.open = false;
            this.$element.trigger("hidden");
        },
        widgetClick: function(d) {
            d.stopPropagation();
            d.preventDefault();
            var c = b(d.target).closest("a").data("action");
            if (c) {
                this[c]();
                this.update();
            }
        },
        widgetKeypress: function(d) {
            var c = b(d.target).closest("input").attr("name");
            switch (d.keyCode) {
              case 9:
                if (this.showMeridian) {
                    if (c == "meridian") {
                        this.hideWidget();
                    }
                } else {
                    if (this.showSeconds) {
                        if (c == "second") {
                            this.hideWidget();
                        }
                    } else {
                        if (c == "minute") {
                            this.hideWidget();
                        }
                    }
                }
                break;

              case 27:
                this.hideWidget();
                break;

              case 38:
                switch (c) {
                  case "hour":
                    this.incrementHour();
                    break;

                  case "minute":
                    this.incrementMinute();
                    break;

                  case "second":
                    this.incrementSecond();
                    break;

                  case "meridian":
                    this.toggleMeridian();
                    break;
                }
                this.update();
                break;

              case 40:
                switch (c) {
                  case "hour":
                    this.decrementHour();
                    break;

                  case "minute":
                    this.decrementMinute();
                    break;

                  case "second":
                    this.decrementSecond();
                    break;

                  case "meridian":
                    this.toggleMeridian();
                    break;
                }
                this.update();
                break;
            }
        },
        elementKeypress: function(d) {
            var c = this.$element.get(0);
            switch (d.keyCode) {
              case 0:
                break;

              case 9:
                this.updateFromElementVal();
                if (this.showMeridian) {
                    if (this.highlightedUnit != "meridian") {
                        d.preventDefault();
                        this.highlightNextUnit();
                    }
                } else {
                    if (this.showSeconds) {
                        if (this.highlightedUnit != "second") {
                            d.preventDefault();
                            this.highlightNextUnit();
                        }
                    } else {
                        if (this.highlightedUnit != "minute") {
                            d.preventDefault();
                            this.highlightNextUnit();
                        }
                    }
                }
                break;

              case 27:
                this.updateFromElementVal();
                break;

              case 37:
                this.updateFromElementVal();
                this.highlightPrevUnit();
                break;

              case 38:
                switch (this.highlightedUnit) {
                  case "hour":
                    this.incrementHour();
                    break;

                  case "minute":
                    this.incrementMinute();
                    break;

                  case "second":
                    this.incrementSecond();
                    break;

                  case "meridian":
                    this.toggleMeridian();
                    break;
                }
                this.updateElement();
                break;

              case 39:
                this.updateFromElementVal();
                this.highlightNextUnit();
                break;

              case 40:
                switch (this.highlightedUnit) {
                  case "hour":
                    this.decrementHour();
                    break;

                  case "minute":
                    this.decrementMinute();
                    break;

                  case "second":
                    this.decrementSecond();
                    break;

                  case "meridian":
                    this.toggleMeridian();
                    break;
                }
                this.updateElement();
                break;
            }
            if (d.keyCode !== 0 && d.keyCode !== 8 && d.keyCode !== 9 && d.keyCode !== 46) {
                d.preventDefault();
            }
        },
        setValues: function(e) {
            if (this.showMeridian) {
                var c = e.split(" ");
                var d = c[0].split(":");
                this.meridian = c[1];
            } else {
                var d = e.split(":");
            }
            this.hour = parseInt(d[0], 10);
            this.minute = parseInt(d[1], 10);
            this.second = parseInt(d[2], 10);
            if (isNaN(this.hour)) {
                this.hour = 0;
            }
            if (isNaN(this.minute)) {
                this.minute = 0;
            }
            if (this.showMeridian) {
                if (this.hour > 12) {
                    this.hour = 12;
                } else {
                    if (this.hour < 1) {
                        this.hour = 1;
                    }
                }
                if (this.meridian == "am" || this.meridian == "a") {
                    this.meridian = "AM";
                } else {
                    if (this.meridian == "pm" || this.meridian == "p") {
                        this.meridian = "PM";
                    }
                }
                if (this.meridian != "AM" && this.meridian != "PM") {
                    this.meridian = "AM";
                }
            } else {
                if (this.hour >= 24) {
                    this.hour = 23;
                } else {
                    if (this.hour < 0) {
                        this.hour = 0;
                    }
                }
            }
            if (this.minute < 0) {
                this.minute = 0;
            } else {
                if (this.minute >= 60) {
                    this.minute = 59;
                }
            }
            if (this.showSeconds) {
                if (isNaN(this.second)) {
                    this.second = 0;
                } else {
                    if (this.second < 0) {
                        this.second = 0;
                    } else {
                        if (this.second >= 60) {
                            this.second = 59;
                        }
                    }
                }
            }
            if (this.$element.val() != "") {
                this.updateElement();
            }
            this.updateWidget();
        },
        setMeridian: function(c) {
            if (c == "a" || c == "am" || c == "AM") {
                this.meridian = "AM";
            } else {
                if (c == "p" || c == "pm" || c == "PM") {
                    this.meridian = "PM";
                } else {
                    this.updateWidget();
                }
            }
            this.updateElement();
        },
        setDefaultTime: function(e) {
            if (e) {
                if (e === "current") {
                    var c = new Date();
                    var d = c.getHours();
                    var g = Math.floor(c.getMinutes() / this.minuteStep) * this.minuteStep;
                    var h = Math.floor(c.getSeconds() / this.secondStep) * this.secondStep;
                    var f = "AM";
                    if (this.showMeridian) {
                        if (d === 0) {
                            d = 12;
                        } else {
                            if (d >= 12) {
                                if (d > 12) {
                                    d = d - 12;
                                }
                                f = "PM";
                            } else {
                                f = "AM";
                            }
                        }
                    }
                    this.hour = d;
                    this.minute = g;
                    this.second = h;
                    this.meridian = f;
                } else {
                    if (e === "value") {
                        this.setValues(this.$element.val());
                    } else {
                        this.setValues(e);
                    }
                }
                if (this.$element.val() != "") {
                    this.updateElement();
                }
                this.updateWidget();
            } else {
                this.hour = 0;
                this.minute = 0;
                this.second = 0;
            }
        },
        formatTime: function(c, f, d, e) {
            c = c < 10 ? "0" + c : c;
            f = f < 10 ? "0" + f : f;
            d = d < 10 ? "0" + d : d;
            return c + ":" + f + (this.showSeconds ? ":" + d : "") + (this.showMeridian ? " " + e : "");
        },
        getTime: function() {
            return this.formatTime(this.hour, this.minute, this.second, this.meridian);
        },
        setTime: function(c) {
            this.setValues(c);
            this.update();
        },
        update: function() {
            this.updateElement();
            this.updateWidget();
        },
        blurElement: function() {
            this.highlightedUnit = undefined;
            this.updateFromElementVal();
        },
        updateElement: function() {
            var c = this.getTime();
            this.$element.val(c).change();
            switch (this.highlightedUnit) {
              case "hour":
                this.highlightHour();
                break;

              case "minute":
                this.highlightMinute();
                break;

              case "second":
                this.highlightSecond();
                break;

              case "meridian":
                this.highlightMeridian();
                break;
            }
        },
        updateWidget: function() {
            if (this.showInputs) {
                this.$widget.find("input.bootstrap-timepicker-hour").val(this.hour < 10 ? "0" + this.hour : this.hour);
                this.$widget.find("input.bootstrap-timepicker-minute").val(this.minute < 10 ? "0" + this.minute : this.minute);
                if (this.showSeconds) {
                    this.$widget.find("input.bootstrap-timepicker-second").val(this.second < 10 ? "0" + this.second : this.second);
                }
                if (this.showMeridian) {
                    this.$widget.find("input.bootstrap-timepicker-meridian").val(this.meridian);
                }
            } else {
                this.$widget.find("span.bootstrap-timepicker-hour").text(this.hour);
                this.$widget.find("span.bootstrap-timepicker-minute").text(this.minute < 10 ? "0" + this.minute : this.minute);
                if (this.showSeconds) {
                    this.$widget.find("span.bootstrap-timepicker-second").text(this.second < 10 ? "0" + this.second : this.second);
                }
                if (this.showMeridian) {
                    this.$widget.find("span.bootstrap-timepicker-meridian").text(this.meridian);
                }
            }
        },
        updateFromElementVal: function(d) {
            var c = this.$element.val();
            if (c) {
                this.setValues(c);
                this.updateWidget();
            }
        },
        updateFromWidgetInputs: function() {
            var c = b("input.bootstrap-timepicker-hour", this.$widget).val() + ":" + b("input.bootstrap-timepicker-minute", this.$widget).val() + (this.showSeconds ? ":" + b("input.bootstrap-timepicker-second", this.$widget).val() : "") + (this.showMeridian ? " " + b("input.bootstrap-timepicker-meridian", this.$widget).val() : "");
            this.setValues(c);
        },
        getCursorPosition: function() {
            var d = this.$element.get(0);
            if ("selectionStart" in d) {
                return d.selectionStart;
            } else {
                if (document.selection) {
                    d.focus();
                    var e = document.selection.createRange();
                    var c = document.selection.createRange().text.length;
                    e.moveStart("character", -d.value.length);
                    return e.text.length - c;
                }
            }
        },
        highlightUnit: function() {
            var c = this.$element.get(0);
            this.position = this.getCursorPosition();
            if (this.position >= 0 && this.position <= 2) {
                this.highlightHour();
            } else {
                if (this.position >= 3 && this.position <= 5) {
                    this.highlightMinute();
                } else {
                    if (this.position >= 6 && this.position <= 8) {
                        if (this.showSeconds) {
                            this.highlightSecond();
                        } else {
                            this.highlightMeridian();
                        }
                    } else {
                        if (this.position >= 9 && this.position <= 11) {
                            this.highlightMeridian();
                        }
                    }
                }
            }
        },
        highlightNextUnit: function() {
            switch (this.highlightedUnit) {
              case "hour":
                this.highlightMinute();
                break;

              case "minute":
                if (this.showSeconds) {
                    this.highlightSecond();
                } else {
                    this.highlightMeridian();
                }
                break;

              case "second":
                this.highlightMeridian();
                break;

              case "meridian":
                this.highlightHour();
                break;
            }
        },
        highlightPrevUnit: function() {
            switch (this.highlightedUnit) {
              case "hour":
                this.highlightMeridian();
                break;

              case "minute":
                this.highlightHour();
                break;

              case "second":
                this.highlightMinute();
                break;

              case "meridian":
                if (this.showSeconds) {
                    this.highlightSecond();
                } else {
                    this.highlightMinute();
                }
                break;
            }
        },
        highlightHour: function() {
            this.highlightedUnit = "hour";
            this.$element.get(0).setSelectionRange(0, 2);
        },
        highlightMinute: function() {
            this.highlightedUnit = "minute";
            this.$element.get(0).setSelectionRange(3, 5);
        },
        highlightSecond: function() {
            this.highlightedUnit = "second";
            this.$element.get(0).setSelectionRange(6, 8);
        },
        highlightMeridian: function() {
            this.highlightedUnit = "meridian";
            if (this.showSeconds) {
                this.$element.get(0).setSelectionRange(9, 11);
            } else {
                this.$element.get(0).setSelectionRange(6, 8);
            }
        },
        incrementHour: function() {
            if (this.showMeridian) {
                if (this.hour === 11) {
                    this.toggleMeridian();
                } else {
                    if (this.hour === 12) {
                        return this.hour = 1;
                    }
                }
            }
            if (this.hour === 23) {
                return this.hour = 0;
            }
            this.hour = this.hour + 1;
        },
        decrementHour: function() {
            if (this.showMeridian) {
                if (this.hour === 1) {
                    return this.hour = 12;
                } else {
                    if (this.hour === 12) {
                        this.toggleMeridian();
                    }
                }
            }
            if (this.hour === 0) {
                return this.hour = 23;
            }
            this.hour = this.hour - 1;
        },
        incrementMinute: function() {
            var c = this.minute + this.minuteStep - this.minute % this.minuteStep;
            if (c > 59) {
                this.incrementHour();
                this.minute = c - 60;
            } else {
                this.minute = c;
            }
        },
        decrementMinute: function() {
            var c = this.minute - this.minuteStep;
            if (c < 0) {
                this.decrementHour();
                this.minute = c + 60;
            } else {
                this.minute = c;
            }
        },
        incrementSecond: function() {
            var c = this.second + this.secondStep - this.second % this.secondStep;
            if (c > 59) {
                this.incrementMinute();
                this.second = c - 60;
            } else {
                this.second = c;
            }
        },
        decrementSecond: function() {
            var c = this.second - this.secondStep;
            if (c < 0) {
                this.decrementMinute();
                this.second = c + 60;
            } else {
                this.second = c;
            }
        },
        toggleMeridian: function() {
            this.meridian = this.meridian === "AM" ? "PM" : "AM";
            this.update();
        },
        getTemplate: function() {
            if (this.options.templates[this.options.template]) {
                return this.options.templates[this.options.template];
            }
            if (this.showInputs) {
                var g = '<input type="text" name="hour" class="bootstrap-timepicker-hour" maxlength="2"/>';
                var d = '<input type="text" name="minute" class="bootstrap-timepicker-minute" maxlength="2"/>';
                var c = '<input type="text" name="second" class="bootstrap-timepicker-second" maxlength="2"/>';
                var f = '<input type="text" name="meridian" class="bootstrap-timepicker-meridian" maxlength="2"/>';
            } else {
                var g = '<span class="bootstrap-timepicker-hour"></span>';
                var d = '<span class="bootstrap-timepicker-minute"></span>';
                var c = '<span class="bootstrap-timepicker-second"></span>';
                var f = '<span class="bootstrap-timepicker-meridian"></span>';
            }
            var h = '<table class="' + (this.showSeconds ? "show-seconds" : "") + " " + (this.showMeridian ? "show-meridian" : "") + '"><tr><td><a href="#" data-action="incrementHour"><i class="icon-chevron-up"></i></a></td><td class="separator">&nbsp;</td><td><a href="#" data-action="incrementMinute"><i class="icon-chevron-up"></i></a></td>' + (this.showSeconds ? '<td class="separator">&nbsp;</td><td><a href="#" data-action="incrementSecond"><i class="icon-chevron-up"></i></a></td>' : "") + (this.showMeridian ? '<td class="separator">&nbsp;</td><td class="meridian-column"><a href="#" data-action="toggleMeridian"><i class="icon-chevron-up"></i></a></td>' : "") + "</tr><tr><td>" + g + '</td> <td class="separator">:</td><td>' + d + "</td> " + (this.showSeconds ? '<td class="separator">:</td><td>' + c + "</td>" : "") + (this.showMeridian ? '<td class="separator">&nbsp;</td><td>' + f + "</td>" : "") + '</tr><tr><td><a href="#" data-action="decrementHour"><i class="icon-chevron-down"></i></a></td><td class="separator"></td><td><a href="#" data-action="decrementMinute"><i class="icon-chevron-down"></i></a></td>' + (this.showSeconds ? '<td class="separator">&nbsp;</td><td><a href="#" data-action="decrementSecond"><i class="icon-chevron-down"></i></a></td>' : "") + (this.showMeridian ? '<td class="separator">&nbsp;</td><td><a href="#" data-action="toggleMeridian"><i class="icon-chevron-down"></i></a></td>' : "") + "</tr></table>";
            var e;
            switch (this.options.template) {
              case "modal":
                e = '<div class="bootstrap-timepicker modal hide fade in" style="top: 30%; margin-top: 0; width: 200px; margin-left: -100px;" data-backdrop="' + (this.modalBackdrop ? "true" : "false") + '"><div class="modal-header"><a href="#" class="close" data-dismiss="modal">×</a><h3>Pick a Time</h3></div><div class="modal-content">' + h + '</div><div class="modal-footer"><a href="#" class="btn btn-primary" data-dismiss="modal">Ok</a></div></div>';
                break;

              case "dropdown":
                e = '<div class="bootstrap-timepicker dropdown-menu">' + h + "</div>";
                break;
            }
            return e;
        }
    };
    b.fn.timepicker = function(c) {
        return this.each(function() {
            var f = b(this), e = f.data("timepicker"), d = typeof c == "object" && c;
            if (!e) {
                f.data("timepicker", e = new a(this, d));
            }
            if (typeof c == "string") {
                e[c]();
            }
        });
    };
    b.fn.timepicker.defaults = {
        minuteStep: 15,
        secondStep: 15,
        disableFocus: false,
        defaultTime: "current",
        showSeconds: false,
        showInputs: true,
        showMeridian: true,
        template: "dropdown",
        modalBackdrop: false,
        templates: {}
    };
    b.fn.timepicker.Constructor = a;
}(window.jQuery);

(function(a) {
    var b = function(d, c) {
        this.$element = a(d);
        this.$note = a('<div class="alert"></div>');
        this.options = a.extend(true, a.fn.notify.defaults, c, this.$element.data());
        if (this.options.transition) {
            if (this.options.transition == "fade") {
                this.$note.addClass("in").addClass(this.options.transition);
            } else {
                this.$note.addClass(this.options.transition);
            }
        } else {
            this.$note.addClass("fade").addClass("in");
        }
        if (this.options.type) {
            this.$note.addClass("alert-" + this.options.type);
        } else {
            this.$note.addClass("alert-success");
        }
        if (this.options.message) {
            if (typeof this.options.message === "string") {
                this.$note.html(this.options.message);
            } else {
                if (typeof this.options.message === "object") {
                    if (this.options.message.html) {
                        this.$note.html(this.options.message.html);
                    } else {
                        if (this.options.message.text) {
                            this.$note.text(this.options.message.text);
                        }
                    }
                }
            }
        }
        if (this.options.closable) {
            var e = a('<a class="close pull-right">&times;</a>');
        }
        a(e).on("click", a.proxy(onClose, this));
        this.$note.prepend(e);
        return this;
    };
    onClose = function() {
        this.options.onClose();
        a(this.$note).remove();
        this.options.onClosed();
    };
    b.prototype.show = function() {
        if (this.options.fadeOut.enabled) {
            this.$note.delay(this.options.fadeOut.delay || 3e3).fadeOut("slow", a.proxy(onClose, this));
        }
        this.$element.append(this.$note);
        this.$note.alert();
    };
    b.prototype.hide = function() {
        if (this.options.fadeOut.enabled) {
            this.$note.delay(this.options.fadeOut.delay || 3e3).fadeOut("slow", a.proxy(onClose, this));
        } else {
            onClose.call(this);
        }
    };
    a.fn.notify = function(c) {
        return new b(this, c);
    };
    a.fn.notify.defaults = {
        type: "success",
        closable: true,
        transition: "fade",
        fadeOut: {
            enabled: true,
            delay: 3e3
        },
        message: null,
        onClose: function() {},
        onClosed: function() {}
    };
})(window.jQuery);

(function(a) {
    a.fn.toggles = function(c) {
        c = c || {};
        var g = a.extend({
            dragable: true,
            clickable: true,
            ontext: "ON",
            offtext: "OFF",
            on: true,
            animtime: 300
        }, c);
        var f = "margin-left " + g.animtime / 1e3 + "s ease-in-out";
        var e = {
            "-webkit-transition": f,
            "-moz-transition": f,
            transition: f
        };
        var d = {
            "-webkit-transition": "",
            "-moz-transition": "",
            transition: ""
        };
        var b = function(j, k, m) {
            var l = j.find(".inner");
            l.css(e);
            var n = j.toggleClass("active").hasClass("active");
            l.css({
                marginLeft: n ? 0 : -k + m
            });
            if (g.checkbox) {
                a(g.checkbox).attr("checked", n);
            }
            setTimeout(function() {
                l.css({
                    marginLeft: n ? 0 : -k + m
                });
                l.css(d);
            }, g.animtime);
        };
        return this.each(function() {
            var t = a(this);
            g.click = c.click || t;
            var m = t.height(), s = t.width();
            if (m === 0 || s === 0) {
                t.height(m = 20);
                t.width(s = 50);
            }
            var n = a('<div class="slide" />'), u = a('<div class="inner" />'), o = a('<div class="on" />'), k = a('<div class="off" />'), j = a('<div class="blob" />');
            o.css({
                height: m,
                width: s - m / 2,
                textAlign: "center",
                textIndent: -m / 2,
                lineHeight: m + "px"
            }).text(g.ontext);
            k.css({
                height: m,
                width: s - m / 2,
                marginLeft: -m / 2,
                textAlign: "center",
                textIndent: m / 2,
                lineHeight: m + "px"
            }).text(g.offtext);
            j.css({
                height: m,
                width: m,
                marginLeft: -m / 2
            });
            u.css({
                width: s * 2 - m,
                marginLeft: g.on ? 0 : -s + m
            });
            if (g.on) {
                n.addClass("active");
                if (g.checkbox) {
                    a(g.checkbox).attr("checked", true);
                }
            }
            t.html("");
            t.append(n.append(u.append(o, j, k)));
            var r = 0, l;
            t.on("toggle", function() {
                b(n, s, m);
            });
            if (g.clickable) {
                g.click.click(function(h) {
                    if (h.target != j[0] || !g.dragable) {
                        t.trigger("toggle");
                    }
                });
            }
            function p(h) {
                t.off("mousemove");
                n.off("mouseleave");
                j.off("mouseup");
                if (r !== 0) {
                    if (n.hasClass("active")) {
                        if (r < (-s + m) / 4) {
                            t.trigger("toggle");
                        } else {
                            u.animate({
                                marginLeft: 0
                            }, g.animtime / 2);
                        }
                    } else {
                        if (r > (s - m) / 4) {
                            t.trigger("toggle");
                        } else {
                            u.animate({
                                marginLeft: -s + m
                            }, g.animtime / 2);
                        }
                    }
                } else {
                    if (g.clickable && h.type != "mouseleave") {
                        t.trigger("toggle");
                    }
                }
            }
            if (g.dragable) {
                j.on("mousedown", function(h) {
                    r = 0;
                    j.off("mouseup");
                    n.off("mouseleave");
                    var v = h.pageX;
                    t.on("mousemove", j, function(w) {
                        r = w.pageX - v;
                        if (n.hasClass("active")) {
                            u.css({
                                marginLeft: r < 0 ? r < -s + m ? -s + m : r : 0
                            });
                        } else {
                            u.css({
                                marginLeft: r > 0 ? r > s - m ? 0 : r - s + m : -s + m
                            });
                        }
                    });
                    j.on("mouseup", p);
                    n.on("mouseleave", p);
                });
            }
        });
    };
})(jQuery);

var bootbox = window.bootbox || function(m, j) {
    var g = "en", h = "en", a = true, k = "static", d = "javascript:;", f = "", n = {}, c = {}, l = {};
    l.setLocale = function(o) {
        for (var p in b) {
            if (p == o) {
                g = o;
                return;
            }
        }
        throw new Error("Invalid locale: " + o);
    };
    l.addLocale = function(o, p) {
        if (typeof b[o] === "undefined") {
            b[o] = {};
        }
        for (var r in p) {
            b[o][r] = p[r];
        }
    };
    l.setIcons = function(o) {
        c = o;
        if (typeof c !== "object" || c === null) {
            c = {};
        }
    };
    l.setBtnClasses = function(o) {
        n = o;
        if (typeof n !== "object" || n === null) {
            n = {};
        }
    };
    l.alert = function() {
        var r = "", p = e("OK"), o = null;
        switch (arguments.length) {
          case 1:
            r = arguments[0];
            break;

          case 2:
            r = arguments[0];
            if (typeof arguments[1] == "function") {
                o = arguments[1];
            } else {
                p = arguments[1];
            }
            break;

          case 3:
            r = arguments[0];
            p = arguments[1];
            o = arguments[2];
            break;

          default:
            throw new Error("Incorrect number of arguments: expected 1-3");
        }
        return l.dialog(r, {
            label: p,
            icon: c.OK,
            class: n.OK,
            callback: o
        }, {
            onEscape: o || true
        });
    };
    l.confirm = function() {
        var t = "", s = e("CANCEL"), r = e("CONFIRM"), o = null;
        switch (arguments.length) {
          case 1:
            t = arguments[0];
            break;

          case 2:
            t = arguments[0];
            if (typeof arguments[1] == "function") {
                o = arguments[1];
            } else {
                s = arguments[1];
            }
            break;

          case 3:
            t = arguments[0];
            s = arguments[1];
            if (typeof arguments[2] == "function") {
                o = arguments[2];
            } else {
                r = arguments[2];
            }
            break;

          case 4:
            t = arguments[0];
            s = arguments[1];
            r = arguments[2];
            o = arguments[3];
            break;

          default:
            throw new Error("Incorrect number of arguments: expected 1-4");
        }
        var p = function() {
            if (typeof o === "function") {
                return o(false);
            }
        };
        var u = function() {
            if (typeof o === "function") {
                return o(true);
            }
        };
        return l.dialog(t, [ {
            label: s,
            icon: c.CANCEL,
            class: n.CANCEL,
            callback: p
        }, {
            label: r,
            icon: c.CONFIRM,
            class: n.CONFIRM,
            callback: u
        } ], {
            onEscape: p
        });
    };
    l.prompt = function() {
        var w = "", s = e("CANCEL"), z = e("CONFIRM"), r = null, u = "";
        switch (arguments.length) {
          case 1:
            w = arguments[0];
            break;

          case 2:
            w = arguments[0];
            if (typeof arguments[1] == "function") {
                r = arguments[1];
            } else {
                s = arguments[1];
            }
            break;

          case 3:
            w = arguments[0];
            s = arguments[1];
            if (typeof arguments[2] == "function") {
                r = arguments[2];
            } else {
                z = arguments[2];
            }
            break;

          case 4:
            w = arguments[0];
            s = arguments[1];
            z = arguments[2];
            r = arguments[3];
            break;

          case 5:
            w = arguments[0];
            s = arguments[1];
            z = arguments[2];
            r = arguments[3];
            u = arguments[4];
            break;

          default:
            throw new Error("Incorrect number of arguments: expected 1-5");
        }
        var t = w;
        var p = j("<form></form>");
        p.append("<input autocomplete=off type=text value='" + u + "' />");
        var A = function() {
            if (typeof r === "function") {
                return r(null);
            }
        };
        var v = function() {
            if (typeof r === "function") {
                return r(p.find("input[type=text]").val());
            }
        };
        var o = l.dialog(p, [ {
            label: s,
            icon: c.CANCEL,
            class: n.CANCEL,
            callback: A
        }, {
            label: z,
            icon: c.CONFIRM,
            class: n.CONFIRM,
            callback: v
        } ], {
            header: t,
            show: false,
            onEscape: A
        });
        o.on("shown", function() {
            p.find("input[type=text]").focus();
            p.on("submit", function(B) {
                B.preventDefault();
                o.find(".btn-primary").click();
            });
        });
        o.modal("show");
        return o;
    };
    l.dialog = function(D, C, s) {
        var H = "", K = [];
        if (!s) {
            s = {};
        }
        if (typeof C === "undefined") {
            C = [];
        } else {
            if (typeof C.length == "undefined") {
                C = [ C ];
            }
        }
        var F = C.length;
        while (F--) {
            var w = null, G = null, p = null, I = "", t = null;
            if (typeof C[F]["label"] == "undefined" && typeof C[F]["class"] == "undefined" && typeof C[F]["callback"] == "undefined") {
                var J = 0, u = null;
                for (var E in C[F]) {
                    u = E;
                    if (++J > 1) {
                        break;
                    }
                }
                if (J == 1 && typeof C[F][E] == "function") {
                    C[F]["label"] = u;
                    C[F]["callback"] = C[F][E];
                }
            }
            if (typeof C[F]["callback"] == "function") {
                t = C[F]["callback"];
            }
            if (C[F]["class"]) {
                p = C[F]["class"];
            } else {
                if (F == C.length - 1 && C.length <= 2) {
                    p = "btn-primary";
                }
            }
            if (C[F]["label"]) {
                w = C[F]["label"];
            } else {
                w = "Option " + (F + 1);
            }
            if (C[F]["icon"]) {
                I = "<i class='" + C[F]["icon"] + "'></i> ";
            }
            if (C[F]["href"]) {
                G = C[F]["href"];
            } else {
                G = d;
            }
            H = "<a data-handler='" + F + "' class='btn " + p + "' href='" + G + "'>" + I + "" + w + "</a>" + H;
            K[F] = t;
        }
        var B = [ "<div class='bootbox modal' tabindex='-1' style='overflow:hidden;'>" ];
        if (s.header) {
            var o = "";
            if (typeof s.headerCloseButton == "undefined" || s.headerCloseButton) {
                o = "<a href='" + d + "' class='close'>&times;</a>";
            }
            B.push("<div class='modal-header'>" + o + "<h3>" + s.header + "</h3></div>");
        }
        B.push("<div class='modal-body'></div>");
        if (H) {
            B.push("<div class='modal-footer'>" + H + "</div>");
        }
        B.push("</div>");
        var A = j(B.join("\n"));
        var v = typeof s.animate === "undefined" ? a : s.animate;
        if (v) {
            A.addClass("fade");
        }
        var r = typeof s.classes === "undefined" ? f : s.classes;
        if (r) {
            A.addClass(r);
        }
        A.find(".modal-body").html(D);
        function z(L) {
            var M = null;
            if (typeof s.onEscape === "function") {
                M = s.onEscape();
            }
            if (M !== false) {
                A.modal("hide");
            }
        }
        A.on("keyup.dismiss.modal", function(L) {
            if (L.which === 27 && s.onEscape) {
                z("escape");
            }
        });
        A.on("click", "a.close", function(L) {
            L.preventDefault();
            z("close");
        });
        A.on("shown", function() {
            A.find("a.btn-primary:first").focus();
        });
        A.on("hidden", function() {
            A.remove();
        });
        A.on("click", ".modal-footer a", function(O) {
            var M = j(this).data("handler"), L = K[M], N = null;
            if (typeof M !== "undefined" && typeof C[M]["href"] !== "undefined") {
                return;
            }
            O.preventDefault();
            if (typeof L === "function") {
                N = L();
            }
            if (N !== false) {
                A.modal("hide");
            }
        });
        j("body").append(A);
        A.modal({
            backdrop: typeof s.backdrop === "undefined" ? k : s.backdrop,
            keyboard: false,
            show: false
        });
        A.on("show", function(L) {
            j(m).off("focusin.modal");
        });
        if (typeof s.show === "undefined" || s.show === true) {
            A.modal("show");
        }
        return A;
    };
    l.modal = function() {
        var s;
        var r;
        var p;
        var o = {
            onEscape: null,
            keyboard: true,
            backdrop: k
        };
        switch (arguments.length) {
          case 1:
            s = arguments[0];
            break;

          case 2:
            s = arguments[0];
            if (typeof arguments[1] == "object") {
                p = arguments[1];
            } else {
                r = arguments[1];
            }
            break;

          case 3:
            s = arguments[0];
            r = arguments[1];
            p = arguments[2];
            break;

          default:
            throw new Error("Incorrect number of arguments: expected 1-3");
        }
        o.header = r;
        if (typeof p == "object") {
            p = j.extend(o, p);
        } else {
            p = o;
        }
        return l.dialog(s, [], p);
    };
    l.hideAll = function() {
        j(".bootbox").modal("hide");
    };
    l.animate = function(o) {
        a = o;
    };
    l.backdrop = function(o) {
        k = o;
    };
    l.classes = function(o) {
        f = o;
    };
    var b = {
        br: {
            OK: "OK",
            CANCEL: "Cancelar",
            CONFIRM: "Sim"
        },
        da: {
            OK: "OK",
            CANCEL: "Annuller",
            CONFIRM: "Accepter"
        },
        de: {
            OK: "OK",
            CANCEL: "Abbrechen",
            CONFIRM: "Akzeptieren"
        },
        en: {
            OK: "OK",
            CANCEL: "Cancel",
            CONFIRM: "OK"
        },
        es: {
            OK: "OK",
            CANCEL: "Cancelar",
            CONFIRM: "Aceptar"
        },
        fr: {
            OK: "OK",
            CANCEL: "Annuler",
            CONFIRM: "D'accord"
        },
        it: {
            OK: "OK",
            CANCEL: "Annulla",
            CONFIRM: "Conferma"
        },
        nl: {
            OK: "OK",
            CANCEL: "Annuleren",
            CONFIRM: "Accepteren"
        },
        pl: {
            OK: "OK",
            CANCEL: "Anuluj",
            CONFIRM: "Potwierdź"
        },
        ru: {
            OK: "OK",
            CANCEL: "Отмена",
            CONFIRM: "Применить"
        }
    };
    function e(p, o) {
        if (typeof o === "undefined") {
            o = g;
        }
        if (typeof b[o][p] === "string") {
            return b[o][p];
        }
        if (o != h) {
            return e(p, h);
        }
        return p;
    }
    return l;
}(document, window.jQuery);

window.bootbox = bootbox;

!function(b) {
    var a = function(d, c) {
        this.cinit("clickover", d, c);
    };
    a.prototype = b.extend({}, b.fn.popover.Constructor.prototype, {
        constructor: a,
        cinit: function(e, d, c) {
            this.attr = {};
            this.attr.me = (Math.random() * 10 + "").replace(/\D/g, "");
            this.attr.click_event_ns = "click." + this.attr.me + " touchstart." + this.attr.me;
            if (!c) {
                c = {};
            }
            c.trigger = "manual";
            this.init(e, d, c);
            this.$element.on("click", this.options.selector, b.proxy(this.clickery, this));
        },
        clickery: function(d) {
            if (d) {
                d.preventDefault();
                d.stopPropagation();
            }
            this.options.width && this.tip().find(".popover-inner").width(this.options.width);
            this.options.height && this.tip().find(".popover-inner").height(this.options.height);
            this.options.tip_id && this.tip().attr("id", this.options.tip_id);
            this.options.class_name && this.tip().addClass(this.options.class_name);
            this[this.isShown() ? "hide" : "show"]();
            if (this.isShown()) {
                var c = this;
                this.options.global_close && b("body").on(this.attr.click_event_ns, function(f) {
                    if (!c.tip().has(f.target).length) {
                        c.clickery();
                    }
                });
                this.options.esc_close && b(document).bind("keyup.clickery", function(f) {
                    if (f.keyCode == 27) {
                        c.clickery();
                    }
                    return;
                });
                !this.options.allow_multiple && b("[data-clickover-open=1]").each(function() {
                    b(this).data("clickover") && b(this).data("clickover").clickery();
                });
                this.$element.attr("data-clickover-open", 1);
                this.tip().on("click", '[data-dismiss="clickover"]', b.proxy(this.clickery, this));
                if (this.options.auto_close && this.options.auto_close > 0) {
                    this.attr.tid = setTimeout(b.proxy(this.clickery, this), this.options.auto_close);
                }
                typeof this.options.onShown == "function" && this.options.onShown.call(this);
                this.$element.trigger("shown");
            } else {
                this.$element.removeAttr("data-clickover-open");
                this.options.esc_close && b(document).unbind("keyup.clickery");
                b("body").off(this.attr.click_event_ns);
                if (typeof this.attr.tid == "number") {
                    clearTimeout(this.attr.tid);
                    delete this.attr.tid;
                }
                typeof this.options.onHidden == "function" && this.options.onHidden.call(this);
                this.$element.trigger("hidden");
            }
        },
        isShown: function() {
            return this.tip().hasClass("in");
        },
        resetPosition: function() {
            var g, c, j, e, h, d, f;
            if (this.hasContent() && this.enabled) {
                g = this.tip();
                d = typeof this.options.placement == "function" ? this.options.placement.call(this, g[0], this.$element[0]) : this.options.placement;
                c = /in/.test(d);
                j = this.getPosition(c);
                e = g[0].offsetWidth;
                h = g[0].offsetHeight;
                switch (c ? d.split(" ")[1] : d) {
                  case "bottom":
                    f = {
                        top: j.top + j.height,
                        left: j.left + j.width / 2 - e / 2
                    };
                    break;

                  case "top":
                    f = {
                        top: j.top - h,
                        left: j.left + j.width / 2 - e / 2
                    };
                    break;

                  case "left":
                    f = {
                        top: j.top + j.height / 2 - h / 2,
                        left: j.left - e
                    };
                    break;

                  case "right":
                    f = {
                        top: j.top + j.height / 2 - h / 2,
                        left: j.left + j.width
                    };
                    break;
                }
                g.css(f);
            }
        },
        debughide: function() {
            var c = new Date().toString();
            console.log(c + ": clickover hide");
            this.hide();
        }
    });
    b.fn.clickover = function(c) {
        return this.each(function() {
            var f = b(this), e = f.data("clickover"), d = typeof c == "object" && c;
            if (!e) {
                f.data("clickover", e = new a(this, d));
            }
            if (typeof c == "string") {
                e[c]();
            }
        });
    };
    b.fn.clickover.Constructor = a;
    b.fn.clickover.defaults = b.extend({}, b.fn.popover.defaults, {
        trigger: "manual",
        auto_close: 0,
        global_close: 1,
        esc_close: 1,
        onShown: null,
        onHidden: null,
        width: null,
        height: null,
        tip_id: null,
        class_name: "clickover",
        allow_multiple: 0
    });
}(window.jQuery);

/*!
	jQuery Autosize v1.16.7
	(c) 2013 Jack Moore - jacklmoore.com
	updated: 2013-03-20
	license: http://www.opensource.org/licenses/mit-license.php
*/
/*!
	jQuery Autosize v1.16.7
	(c) 2013 Jack Moore - jacklmoore.com
	updated: 2013-03-20
	license: http://www.opensource.org/licenses/mit-license.php
*/
(function(d) {
    var c = {
        className: "autosizejs",
        append: "",
        callback: false
    }, f = "hidden", b = "border-box", m = "lineHeight", h, a = '<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden;"/>', g = [ "fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing", "textTransform", "wordSpacing", "textIndent" ], k = "oninput", e = "onpropertychange", l, j = d(a).data("autosize", true)[0];
    j.style.lineHeight = "99px";
    if (d(j).css(m) === "99px") {
        g.push(m);
    }
    j.style.lineHeight = "";
    d.fn.autosize = function(n) {
        n = d.extend({}, c, n || {});
        if (j.parentNode !== document.body) {
            d(document.body).append(j);
            j.value = "\n\n\n";
            j.scrollTop = 9e4;
            h = j.scrollHeight === j.scrollTop + j.clientHeight;
        }
        return this.each(function() {
            var t = this, r = d(t), z, s, p, o = 0, w = d.isFunction(n.callback);
            if (r.data("autosize")) {
                return;
            }
            if (r.css("box-sizing") === b || r.css("-moz-box-sizing") === b || r.css("-webkit-box-sizing") === b) {
                o = r.outerHeight() - r.height();
            }
            z = Math.max(parseInt(r.css("minHeight"), 10) - o, r.height());
            p = r.css("resize") === "none" || r.css("resize") === "vertical" ? "none" : "horizontal";
            r.css({
                overflow: f,
                overflowY: f,
                wordWrap: "break-word",
                resize: p
            }).data("autosize", true);
            function v() {
                l = t;
                j.className = n.className;
                d.each(g, function(A, B) {
                    j.style[B] = r.css(B);
                });
            }
            function u() {
                var A, D, B;
                if (l !== t) {
                    v();
                }
                if (!s) {
                    s = true;
                    j.value = t.value + n.append;
                    j.style.overflowY = t.style.overflowY;
                    B = parseInt(t.style.height, 10);
                    j.style.width = Math.max(r.width(), 0) + "px";
                    if (h) {
                        A = j.scrollHeight;
                    } else {
                        j.scrollTop = 0;
                        j.scrollTop = 9e4;
                        A = j.scrollTop;
                    }
                    var C = parseInt(r.css("maxHeight"), 10);
                    C = C && C > 0 ? C : 9e4;
                    if (A > C) {
                        A = C;
                        D = "scroll";
                    } else {
                        if (A < z) {
                            A = z;
                        }
                    }
                    A += o;
                    t.style.overflowY = D || f;
                    if (B !== A) {
                        t.style.height = A + "px";
                        if (w) {
                            n.callback.call(t);
                        }
                    }
                    setTimeout(function() {
                        s = false;
                    }, 1);
                }
            }
            if (e in t) {
                if (k in t) {
                    t[k] = t.onkeyup = u;
                } else {
                    t[e] = u;
                }
            } else {
                t[k] = u;
            }
            d(window).on("resize", function() {
                s = false;
                u();
            });
            r.on("autosize", function() {
                s = false;
                u();
            });
            u();
        });
    };
})(window.jQuery || window.Zepto);

(function(e) {
    var a = [];
    var f = {
        options: {
            prependExistingHelpBlock: false,
            sniffHtml: true,
            preventSubmit: true,
            submitError: false,
            submitSuccess: false,
            semanticallyStrict: false,
            autoAdd: {
                helpBlocks: true
            },
            filter: function() {
                return true;
            }
        },
        methods: {
            init: function(j) {
                var k = e.extend(true, {}, f);
                k.options = e.extend(true, k.options, j);
                var l = this;
                var h = e.unique(l.map(function() {
                    return e(this).parents("form")[0];
                }).toArray());
                e(h).bind("submit", function(o) {
                    var m = e(this);
                    var p = 0;
                    var n = m.find("input,textarea,select").not("[type=submit],[type=image]").filter(k.options.filter);
                    n.trigger("submit.validation").trigger("validationLostFocus.validation");
                    n.each(function(r, s) {
                        var t = e(s), u = t.parents(".control-group").first();
                        if (u.hasClass("warning")) {
                            u.removeClass("warning").addClass("error");
                            p++;
                        }
                    });
                    n.trigger("validationLostFocus.validation");
                    if (p) {
                        if (k.options.preventSubmit) {
                            o.preventDefault();
                        }
                        m.addClass("error");
                        if (e.isFunction(k.options.submitError)) {
                            k.options.submitError(m, o, n.jqBootstrapValidation("collectErrors", true));
                        }
                    } else {
                        m.removeClass("error");
                        if (e.isFunction(k.options.submitSuccess)) {
                            k.options.submitSuccess(m, o);
                        }
                    }
                });
                return this.each(function() {
                    var s = e(this), r = s.parents(".control-group").first(), v = r.find(".help-block").first(), z = s.parents("form").first(), m = [];
                    if (!v.length && k.options.autoAdd && k.options.autoAdd.helpBlocks) {
                        v = e('<div class="help-block" />');
                        r.find(".controls").append(v);
                        a.push(v[0]);
                    }
                    if (k.options.sniffHtml) {
                        var w = "";
                        if (s.attr("pattern") !== undefined) {
                            w = "Not in the expected format\x3c!-- data-validation-pattern-message to override --\x3e";
                            if (s.data("validationPatternMessage")) {
                                w = s.data("validationPatternMessage");
                            }
                            s.data("validationPatternMessage", w);
                            s.data("validationPatternRegex", s.attr("pattern"));
                        }
                        if (s.attr("max") !== undefined || s.attr("aria-valuemax") !== undefined) {
                            var u = s.attr("max") !== undefined ? s.attr("max") : s.attr("aria-valuemax");
                            w = "Too high: Maximum of '" + u + "'\x3c!-- data-validation-max-message to override --\x3e";
                            if (s.data("validationMaxMessage")) {
                                w = s.data("validationMaxMessage");
                            }
                            s.data("validationMaxMessage", w);
                            s.data("validationMaxMax", u);
                        }
                        if (s.attr("min") !== undefined || s.attr("aria-valuemin") !== undefined) {
                            var o = s.attr("min") !== undefined ? s.attr("min") : s.attr("aria-valuemin");
                            w = "Too low: Minimum of '" + o + "'\x3c!-- data-validation-min-message to override --\x3e";
                            if (s.data("validationMinMessage")) {
                                w = s.data("validationMinMessage");
                            }
                            s.data("validationMinMessage", w);
                            s.data("validationMinMin", o);
                        }
                        if (s.attr("maxlength") !== undefined) {
                            w = "Too long: Maximum of '" + s.attr("maxlength") + "' characters\x3c!-- data-validation-maxlength-message to override --\x3e";
                            if (s.data("validationMaxlengthMessage")) {
                                w = s.data("validationMaxlengthMessage");
                            }
                            s.data("validationMaxlengthMessage", w);
                            s.data("validationMaxlengthMaxlength", s.attr("maxlength"));
                        }
                        if (s.attr("minlength") !== undefined) {
                            w = "Too short: Minimum of '" + s.attr("minlength") + "' characters\x3c!-- data-validation-minlength-message to override --\x3e";
                            if (s.data("validationMinlengthMessage")) {
                                w = s.data("validationMinlengthMessage");
                            }
                            s.data("validationMinlengthMessage", w);
                            s.data("validationMinlengthMinlength", s.attr("minlength"));
                        }
                        if (s.attr("required") !== undefined || s.attr("aria-required") !== undefined) {
                            w = k.builtInValidators.required.message;
                            if (s.data("validationRequiredMessage")) {
                                w = s.data("validationRequiredMessage");
                            }
                            s.data("validationRequiredMessage", w);
                        }
                        if (s.attr("type") !== undefined && s.attr("type").toLowerCase() === "number") {
                            w = k.builtInValidators.number.message;
                            if (s.data("validationNumberMessage")) {
                                w = s.data("validationNumberMessage");
                            }
                            s.data("validationNumberMessage", w);
                        }
                        if (s.attr("type") !== undefined && s.attr("type").toLowerCase() === "email") {
                            w = "Not a valid email address\x3c!-- data-validator-validemail-message to override --\x3e";
                            if (s.data("validationValidemailMessage")) {
                                w = s.data("validationValidemailMessage");
                            } else {
                                if (s.data("validationEmailMessage")) {
                                    w = s.data("validationEmailMessage");
                                }
                            }
                            s.data("validationValidemailMessage", w);
                        }
                        if (s.attr("minchecked") !== undefined) {
                            w = "Not enough options checked; Minimum of '" + s.attr("minchecked") + "' required\x3c!-- data-validation-minchecked-message to override --\x3e";
                            if (s.data("validationMincheckedMessage")) {
                                w = s.data("validationMincheckedMessage");
                            }
                            s.data("validationMincheckedMessage", w);
                            s.data("validationMincheckedMinchecked", s.attr("minchecked"));
                        }
                        if (s.attr("maxchecked") !== undefined) {
                            w = "Too many options checked; Maximum of '" + s.attr("maxchecked") + "' required\x3c!-- data-validation-maxchecked-message to override --\x3e";
                            if (s.data("validationMaxcheckedMessage")) {
                                w = s.data("validationMaxcheckedMessage");
                            }
                            s.data("validationMaxcheckedMessage", w);
                            s.data("validationMaxcheckedMaxchecked", s.attr("maxchecked"));
                        }
                    }
                    if (s.data("validation") !== undefined) {
                        m = s.data("validation").split(",");
                    }
                    e.each(s.data(), function(A, B) {
                        var C = A.replace(/([A-Z])/g, ",$1").split(",");
                        if (C[0] === "validation" && C[1]) {
                            m.push(C[1]);
                        }
                    });
                    var p = m;
                    var t = [];
                    do {
                        e.each(m, function(A, B) {
                            m[A] = d(B);
                        });
                        m = e.unique(m);
                        t = [];
                        e.each(p, function(B, C) {
                            if (s.data("validation" + C + "Shortcut") !== undefined) {
                                e.each(s.data("validation" + C + "Shortcut").split(","), function(E, D) {
                                    t.push(D);
                                });
                            } else {
                                if (k.builtInValidators[C.toLowerCase()]) {
                                    var A = k.builtInValidators[C.toLowerCase()];
                                    if (A.type.toLowerCase() === "shortcut") {
                                        e.each(A.shortcut.split(","), function(D, E) {
                                            E = d(E);
                                            t.push(E);
                                            m.push(E);
                                        });
                                    }
                                }
                            }
                        });
                        p = t;
                    } while (p.length > 0);
                    var n = {};
                    e.each(m, function(B, D) {
                        var E = s.data("validation" + D + "Message");
                        var G = E !== undefined;
                        var C = false;
                        E = E ? E : "'" + D + "' validation failed \x3c!-- Add attribute 'data-validation-" + D.toLowerCase() + "-message' to input to change this message --\x3e";
                        e.each(k.validatorTypes, function(H, I) {
                            if (n[H] === undefined) {
                                n[H] = [];
                            }
                            if (!C && s.data("validation" + D + d(I.name)) !== undefined) {
                                n[H].push(e.extend(true, {
                                    name: d(I.name),
                                    message: E
                                }, I.init(s, D)));
                                C = true;
                            }
                        });
                        if (!C && k.builtInValidators[D.toLowerCase()]) {
                            var A = e.extend(true, {}, k.builtInValidators[D.toLowerCase()]);
                            if (G) {
                                A.message = E;
                            }
                            var F = A.type.toLowerCase();
                            if (F === "shortcut") {
                                C = true;
                            } else {
                                e.each(k.validatorTypes, function(H, I) {
                                    if (n[H] === undefined) {
                                        n[H] = [];
                                    }
                                    if (!C && F === H.toLowerCase()) {
                                        s.data("validation" + D + d(I.name), A[I.name.toLowerCase()]);
                                        n[F].push(e.extend(A, I.init(s, D)));
                                        C = true;
                                    }
                                });
                            }
                        }
                        if (!C) {
                            e.error("Cannot find validation info for '" + D + "'");
                        }
                    });
                    v.data("original-contents", v.data("original-contents") ? v.data("original-contents") : v.html());
                    v.data("original-role", v.data("original-role") ? v.data("original-role") : v.attr("role"));
                    r.data("original-classes", r.data("original-clases") ? r.data("original-classes") : r.attr("class"));
                    s.data("original-aria-invalid", s.data("original-aria-invalid") ? s.data("original-aria-invalid") : s.attr("aria-invalid"));
                    s.bind("validation.validation", function(B, D) {
                        var C = c(s);
                        var A = [];
                        e.each(n, function(E, F) {
                            if (C || C.length || D && D.includeEmpty || !!k.validatorTypes[E].blockSubmit && D && !!D.submitting) {
                                e.each(F, function(H, G) {
                                    if (k.validatorTypes[E].validate(s, C, G)) {
                                        A.push(G.message);
                                    }
                                });
                            }
                        });
                        return A;
                    });
                    s.bind("getValidators.validation", function() {
                        return n;
                    });
                    s.bind("submit.validation", function() {
                        return s.triggerHandler("change.validation", {
                            submitting: true
                        });
                    });
                    s.bind([ "keyup", "focus", "blur", "click", "keydown", "keypress", "change" ].join(".validation ") + ".validation", function(C, D) {
                        var B = c(s);
                        var A = [];
                        r.find("input,textarea,select").each(function(G, H) {
                            var E = A.length;
                            e.each(e(H).triggerHandler("validation.validation", D), function(I, J) {
                                A.push(J);
                            });
                            if (A.length > E) {
                                e(H).attr("aria-invalid", "true");
                            } else {
                                var F = s.data("original-aria-invalid");
                                e(H).attr("aria-invalid", F !== undefined ? F : false);
                            }
                        });
                        z.find("input,select,textarea").not(s).not('[name="' + s.attr("name") + '"]').trigger("validationLostFocus.validation");
                        A = e.unique(A.sort());
                        if (A.length) {
                            r.removeClass("success error").addClass("warning");
                            if (k.options.semanticallyStrict && A.length === 1) {
                                v.html(A[0] + (k.options.prependExistingHelpBlock ? v.data("original-contents") : ""));
                            } else {
                                v.html('<ul role="alert"><li>' + A.join("</li><li>") + "</li></ul>" + (k.options.prependExistingHelpBlock ? v.data("original-contents") : ""));
                            }
                        } else {
                            r.removeClass("warning error success");
                            if (B.length > 0) {
                                r.addClass("success");
                            }
                            v.html(v.data("original-contents"));
                        }
                        if (C.type === "blur") {
                            r.removeClass("success");
                        }
                    });
                    s.bind("validationLostFocus.validation", function() {
                        r.removeClass("success");
                    });
                });
            },
            destroy: function() {
                return this.each(function() {
                    var h = e(this), k = h.parents(".control-group").first(), j = k.find(".help-block").first();
                    h.unbind(".validation");
                    j.html(j.data("original-contents"));
                    k.attr("class", k.data("original-classes"));
                    h.attr("aria-invalid", h.data("original-aria-invalid"));
                    j.attr("role", h.data("original-role"));
                    if (a.indexOf(j[0]) > -1) {
                        j.remove();
                    }
                });
            },
            collectErrors: function(h) {
                var j = {};
                this.each(function(m, n) {
                    var l = e(n);
                    var k = l.attr("name");
                    var o = l.triggerHandler("validation.validation", {
                        includeEmpty: true
                    });
                    j[k] = e.extend(true, o, j[k]);
                });
                e.each(j, function(k, l) {
                    if (l.length === 0) {
                        delete j[k];
                    }
                });
                return j;
            },
            hasErrors: function() {
                var h = [];
                this.each(function(j, k) {
                    h = h.concat(e(k).triggerHandler("getValidators.validation") ? e(k).triggerHandler("validation.validation", {
                        submitting: true
                    }) : []);
                });
                return h.length > 0;
            },
            override: function(h) {
                f = e.extend(true, f, h);
            }
        },
        validatorTypes: {
            callback: {
                name: "callback",
                init: function(j, h) {
                    return {
                        validatorName: h,
                        callback: j.data("validation" + h + "Callback"),
                        lastValue: j.val(),
                        lastValid: true,
                        lastFinished: true
                    };
                },
                validate: function(l, k, j) {
                    if (j.lastValue === k && j.lastFinished) {
                        return !j.lastValid;
                    }
                    if (j.lastFinished === true) {
                        j.lastValue = k;
                        j.lastValid = true;
                        j.lastFinished = false;
                        var m = j;
                        var h = l;
                        b(j.callback, window, l, k, function(n) {
                            if (m.lastValue === n.value) {
                                m.lastValid = n.valid;
                                if (n.message) {
                                    m.message = n.message;
                                }
                                m.lastFinished = true;
                                h.data("validation" + m.validatorName + "Message", m.message);
                                setTimeout(function() {
                                    h.trigger("change.validation");
                                }, 1);
                            }
                        });
                    }
                    return false;
                }
            },
            ajax: {
                name: "ajax",
                init: function(j, h) {
                    return {
                        validatorName: h,
                        url: j.data("validation" + h + "Ajax"),
                        lastValue: j.val(),
                        lastValid: true,
                        lastFinished: true
                    };
                },
                validate: function(k, j, h) {
                    if ("" + h.lastValue === "" + j && h.lastFinished === true) {
                        return h.lastValid === false;
                    }
                    if (h.lastFinished === true) {
                        h.lastValue = j;
                        h.lastValid = true;
                        h.lastFinished = false;
                        e.ajax({
                            url: h.url,
                            data: "value=" + j + "&field=" + k.attr("name"),
                            dataType: "json",
                            success: function(l) {
                                if ("" + h.lastValue === "" + l.value) {
                                    h.lastValid = !!l.valid;
                                    if (l.message) {
                                        h.message = l.message;
                                    }
                                    h.lastFinished = true;
                                    k.data("validation" + h.validatorName + "Message", h.message);
                                    setTimeout(function() {
                                        k.trigger("change.validation");
                                    }, 1);
                                }
                            },
                            failure: function() {
                                h.lastValid = true;
                                h.message = "ajax call failed";
                                h.lastFinished = true;
                                k.data("validation" + h.validatorName + "Message", h.message);
                                setTimeout(function() {
                                    k.trigger("change.validation");
                                }, 1);
                            }
                        });
                    }
                    return false;
                }
            },
            regex: {
                name: "regex",
                init: function(j, h) {
                    return {
                        regex: g(j.data("validation" + h + "Regex"))
                    };
                },
                validate: function(k, j, h) {
                    return !h.regex.test(j) && !h.negative || h.regex.test(j) && h.negative;
                }
            },
            required: {
                name: "required",
                init: function(j, h) {
                    return {};
                },
                validate: function(k, j, h) {
                    return !!(j.length === 0 && !h.negative) || !!(j.length > 0 && h.negative);
                },
                blockSubmit: true
            },
            match: {
                name: "match",
                init: function(k, h) {
                    var j = k.parents("form").first().find('[name="' + k.data("validation" + h + "Match") + '"]').first();
                    j.bind("validation.validation", function() {
                        k.trigger("change.validation", {
                            submitting: true
                        });
                    });
                    return {
                        element: j
                    };
                },
                validate: function(k, j, h) {
                    return j !== h.element.val() && !h.negative || j === h.element.val() && h.negative;
                },
                blockSubmit: true
            },
            max: {
                name: "max",
                init: function(j, h) {
                    return {
                        max: j.data("validation" + h + "Max")
                    };
                },
                validate: function(k, j, h) {
                    return parseFloat(j, 10) > parseFloat(h.max, 10) && !h.negative || parseFloat(j, 10) <= parseFloat(h.max, 10) && h.negative;
                }
            },
            min: {
                name: "min",
                init: function(j, h) {
                    return {
                        min: j.data("validation" + h + "Min")
                    };
                },
                validate: function(k, j, h) {
                    return parseFloat(j) < parseFloat(h.min) && !h.negative || parseFloat(j) >= parseFloat(h.min) && h.negative;
                }
            },
            maxlength: {
                name: "maxlength",
                init: function(j, h) {
                    return {
                        maxlength: j.data("validation" + h + "Maxlength")
                    };
                },
                validate: function(k, j, h) {
                    return j.length > h.maxlength && !h.negative || j.length <= h.maxlength && h.negative;
                }
            },
            minlength: {
                name: "minlength",
                init: function(j, h) {
                    return {
                        minlength: j.data("validation" + h + "Minlength")
                    };
                },
                validate: function(k, j, h) {
                    return j.length < h.minlength && !h.negative || j.length >= h.minlength && h.negative;
                }
            },
            maxchecked: {
                name: "maxchecked",
                init: function(k, h) {
                    var j = k.parents("form").first().find('[name="' + k.attr("name") + '"]');
                    j.bind("click.validation", function() {
                        k.trigger("change.validation", {
                            includeEmpty: true
                        });
                    });
                    return {
                        maxchecked: k.data("validation" + h + "Maxchecked"),
                        elements: j
                    };
                },
                validate: function(k, j, h) {
                    return h.elements.filter(":checked").length > h.maxchecked && !h.negative || h.elements.filter(":checked").length <= h.maxchecked && h.negative;
                },
                blockSubmit: true
            },
            minchecked: {
                name: "minchecked",
                init: function(k, h) {
                    var j = k.parents("form").first().find('[name="' + k.attr("name") + '"]');
                    j.bind("click.validation", function() {
                        k.trigger("change.validation", {
                            includeEmpty: true
                        });
                    });
                    return {
                        minchecked: k.data("validation" + h + "Minchecked"),
                        elements: j
                    };
                },
                validate: function(k, j, h) {
                    return h.elements.filter(":checked").length < h.minchecked && !h.negative || h.elements.filter(":checked").length >= h.minchecked && h.negative;
                },
                blockSubmit: true
            }
        },
        builtInValidators: {
            email: {
                name: "Email",
                type: "shortcut",
                shortcut: "validemail"
            },
            validemail: {
                name: "Validemail",
                type: "regex",
                regex: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}",
                message: "Not a valid email address\x3c!-- data-validator-validemail-message to override --\x3e"
            },
            passwordagain: {
                name: "Passwordagain",
                type: "match",
                match: "password",
                message: "Does not match the given password\x3c!-- data-validator-paswordagain-message to override --\x3e"
            },
            positive: {
                name: "Positive",
                type: "shortcut",
                shortcut: "number,positivenumber"
            },
            negative: {
                name: "Negative",
                type: "shortcut",
                shortcut: "number,negativenumber"
            },
            number: {
                name: "Number",
                type: "regex",
                regex: "([+-]?\\d+(\\.\\d*)?([eE][+-]?[0-9]+)?)?",
                message: "Must be a number\x3c!-- data-validator-number-message to override --\x3e"
            },
            integer: {
                name: "Integer",
                type: "regex",
                regex: "[+-]?\\d+",
                message: "No decimal places allowed\x3c!-- data-validator-integer-message to override --\x3e"
            },
            positivenumber: {
                name: "Positivenumber",
                type: "min",
                min: 0,
                message: "Must be a positive number\x3c!-- data-validator-positivenumber-message to override --\x3e"
            },
            negativenumber: {
                name: "Negativenumber",
                type: "max",
                max: 0,
                message: "Must be a negative number\x3c!-- data-validator-negativenumber-message to override --\x3e"
            },
            required: {
                name: "Required",
                type: "required",
                message: "This is required\x3c!-- data-validator-required-message to override --\x3e"
            },
            checkone: {
                name: "Checkone",
                type: "minchecked",
                minchecked: 1,
                message: "Check at least one option\x3c!-- data-validation-checkone-message to override --\x3e"
            }
        }
    };
    var d = function(h) {
        return h.toLowerCase().replace(/(^|\s)([a-z])/g, function(j, l, k) {
            return l + k.toUpperCase();
        });
    };
    var c = function(k) {
        var j = k.val();
        var h = k.attr("type");
        if (h === "checkbox") {
            j = k.is(":checked") ? j : "";
        }
        if (h === "radio") {
            j = e('input[name="' + k.attr("name") + '"]:checked').length > 0 ? j : "";
        }
        return j;
    };
    function g(h) {
        return new RegExp("^" + h + "$");
    }
    function b(n, k) {
        var h = Array.prototype.slice.call(arguments).splice(2);
        var m = n.split(".");
        var l = m.pop();
        for (var j = 0; j < m.length; j++) {
            k = k[m[j]];
        }
        return k[l].apply(this, h);
    }
    e.fn.jqBootstrapValidation = function(h) {
        if (f.methods[h]) {
            return f.methods[h].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            if (typeof h === "object" || !h) {
                return f.methods.init.apply(this, arguments);
            } else {
                e.error("Method " + h + " does not exist on jQuery.jqBootstrapValidation");
                return null;
            }
        }
    };
    e.jqBootstrapValidation = function(h) {
        e(":input").not("[type=image],[type=submit]").jqBootstrapValidation.apply(this, arguments);
    };
})(jQuery);

(function() {
    (function(a) {
        a.easyPieChart = function(c, l) {
            var e, f, h, j, k, d, b, g = this;
            this.el = c;
            this.$el = a(c);
            this.$el.data("easyPieChart", this);
            this.init = function() {
                var m;
                g.options = a.extend({}, a.easyPieChart.defaultOptions, l);
                m = parseInt(g.$el.data("percent"), 10);
                g.percentage = 0;
                g.canvas = a("<canvas width='" + g.options.size + "' height='" + g.options.size + "'></canvas>").get(0);
                g.$el.append(g.canvas);
                if (typeof G_vmlCanvasManager !== "undefined" && G_vmlCanvasManager !== null) {
                    G_vmlCanvasManager.initElement(g.canvas);
                }
                g.ctx = g.canvas.getContext("2d");
                g.ctx.translate(g.options.size / 2, g.options.size / 2);
                g.$el.addClass("easyPieChart");
                g.$el.css({
                    width: g.options.size,
                    height: g.options.size,
                    lineHeight: "" + g.options.size + "px"
                });
                g.update(m);
                return g;
            };
            this.update = function(m) {
                if (g.options.animate === false) {
                    return h(m);
                } else {
                    return f(g.percentage, m);
                }
            };
            d = function() {
                var n, o, m;
                g.ctx.fillStyle = g.options.scaleColor;
                g.ctx.lineWidth = 1;
                m = [];
                for (n = o = 0; o <= 24; n = ++o) {
                    m.push(e(n));
                }
                return m;
            };
            e = function(m) {
                var n;
                n = m % 6 === 0 ? 0 : g.options.size * .017;
                g.ctx.save();
                g.ctx.rotate(m * Math.PI / 12);
                g.ctx.fillRect(g.options.size / 2 - n, 0, -g.options.size * .05 + n, 1);
                return g.ctx.restore();
            };
            b = function() {
                var m;
                m = g.options.size / 2 - g.options.lineWidth / 2;
                if (g.options.scaleColor !== false) {
                    m -= g.options.size * .08;
                }
                g.ctx.beginPath();
                g.ctx.arc(0, 0, m, 0, Math.PI * 2, true);
                g.ctx.closePath();
                g.ctx.strokeStyle = g.options.trackColor;
                g.ctx.lineWidth = g.options.lineWidth;
                return g.ctx.stroke();
            };
            k = function() {
                if (g.options.scaleColor !== false) {
                    d();
                }
                if (g.options.trackColor !== false) {
                    return b();
                }
            };
            h = function(m) {
                var n;
                k();
                g.ctx.strokeStyle = a.isFunction(g.options.barColor) ? g.options.barColor(m) : g.options.barColor;
                g.ctx.lineCap = g.options.lineCap;
                n = g.options.size / 2 - g.options.lineWidth / 2;
                if (g.options.scaleColor !== false) {
                    n -= g.options.size * .08;
                }
                g.ctx.save();
                g.ctx.rotate(-Math.PI / 2);
                g.ctx.beginPath();
                g.ctx.arc(0, 0, n, 0, Math.PI * 2 * m / 100, false);
                g.ctx.stroke();
                return g.ctx.restore();
            };
            f = function(r, p) {
                var n, o, m;
                o = 30;
                m = o * g.options.animate / 1e3;
                n = 0;
                g.options.onStart.call(g);
                g.percentage = p;
                if (g.animation) {
                    clearInterval(g.animation);
                    g.animation = false;
                }
                return g.animation = setInterval(function() {
                    g.ctx.clearRect(-g.options.size / 2, -g.options.size / 2, g.options.size, g.options.size);
                    k.call(g);
                    h.call(g, [ j(n, r, p - r, m) ]);
                    n++;
                    if (n / m > 1) {
                        clearInterval(g.animation);
                        g.animation = false;
                        return g.options.onStop.call(g);
                    }
                }, 1e3 / o);
            };
            j = function(n, m, p, o) {
                n /= o / 2;
                if (n < 1) {
                    return p / 2 * n * n + m;
                } else {
                    return -p / 2 * (--n * (n - 2) - 1) + m;
                }
            };
            return this.init();
        };
        a.easyPieChart.defaultOptions = {
            barColor: "#ef1e25",
            trackColor: "#f2f2f2",
            scaleColor: "#dfe0e0",
            lineCap: "round",
            size: 110,
            lineWidth: 3,
            animate: false,
            onStart: a.noop,
            onStop: a.noop
        };
        a.fn.easyPieChart = function(b) {
            return a.each(this, function(d, e) {
                var c;
                c = a(e);
                if (!c.data("easyPieChart")) {
                    return c.data("easyPieChart", new a.easyPieChart(e, b));
                }
            });
        };
        return void 0;
    })(jQuery);
}).call(this);

(function(a) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], a);
    } else {
        a(jQuery);
    }
})(function(j) {
    var r = {}, n, I, t, F, u, l, J, K, w, c, d, L, B, m, s, H, D, g, p, E, e, a, G, v, o, M, b, A, k, C, z, h, f = 0;
    n = function() {
        return {
            common: {
                type: "line",
                lineColor: "#00f",
                fillColor: "#cdf",
                defaultPixelsPerValue: 3,
                width: "auto",
                height: "auto",
                composite: false,
                tagValuesAttribute: "values",
                tagOptionsPrefix: "spark",
                enableTagOptions: false,
                enableHighlight: true,
                highlightLighten: 1.4,
                tooltipSkipNull: true,
                tooltipPrefix: "",
                tooltipSuffix: "",
                disableHiddenCheck: false,
                numberFormatter: false,
                numberDigitGroupCount: 3,
                numberDigitGroupSep: ",",
                numberDecimalMark: ".",
                disableTooltips: false,
                disableInteraction: false
            },
            line: {
                spotColor: "#f80",
                highlightSpotColor: "#5f5",
                highlightLineColor: "#f22",
                spotRadius: 1.5,
                minSpotColor: "#f80",
                maxSpotColor: "#f80",
                lineWidth: 1,
                normalRangeMin: undefined,
                normalRangeMax: undefined,
                normalRangeColor: "#ccc",
                drawNormalOnTop: false,
                chartRangeMin: undefined,
                chartRangeMax: undefined,
                chartRangeMinX: undefined,
                chartRangeMaxX: undefined,
                tooltipFormat: new t('<span style="color: {{color}}">&#9679;</span> {{prefix}}{{y}}{{suffix}}')
            },
            bar: {
                barColor: "#3366cc",
                negBarColor: "#f44",
                stackedBarColor: [ "#3366cc", "#dc3912", "#ff9900", "#109618", "#66aa00", "#dd4477", "#0099c6", "#990099" ],
                zeroColor: undefined,
                nullColor: undefined,
                zeroAxis: true,
                barWidth: 4,
                barSpacing: 1,
                chartRangeMax: undefined,
                chartRangeMin: undefined,
                chartRangeClip: false,
                colorMap: undefined,
                tooltipFormat: new t('<span style="color: {{color}}">&#9679;</span> {{prefix}}{{value}}{{suffix}}')
            },
            tristate: {
                barWidth: 4,
                barSpacing: 1,
                posBarColor: "#6f6",
                negBarColor: "#f44",
                zeroBarColor: "#999",
                colorMap: {},
                tooltipFormat: new t('<span style="color: {{color}}">&#9679;</span> {{value:map}}'),
                tooltipValueLookups: {
                    map: {
                        "-1": "Loss",
                        0: "Draw",
                        1: "Win"
                    }
                }
            },
            discrete: {
                lineHeight: "auto",
                thresholdColor: undefined,
                thresholdValue: 0,
                chartRangeMax: undefined,
                chartRangeMin: undefined,
                chartRangeClip: false,
                tooltipFormat: new t("{{prefix}}{{value}}{{suffix}}")
            },
            bullet: {
                targetColor: "#f33",
                targetWidth: 3,
                performanceColor: "#33f",
                rangeColors: [ "#d3dafe", "#a8b6ff", "#7f94ff" ],
                base: undefined,
                tooltipFormat: new t("{{fieldkey:fields}} - {{value}}"),
                tooltipValueLookups: {
                    fields: {
                        r: "Range",
                        p: "Performance",
                        t: "Target"
                    }
                }
            },
            pie: {
                offset: 0,
                sliceColors: [ "#3366cc", "#dc3912", "#ff9900", "#109618", "#66aa00", "#dd4477", "#0099c6", "#990099" ],
                borderWidth: 0,
                borderColor: "#000",
                tooltipFormat: new t('<span style="color: {{color}}">&#9679;</span> {{value}} ({{percent.1}}%)')
            },
            box: {
                raw: false,
                boxLineColor: "#000",
                boxFillColor: "#cdf",
                whiskerColor: "#000",
                outlierLineColor: "#333",
                outlierFillColor: "#fff",
                medianColor: "#f00",
                showOutliers: true,
                outlierIQR: 1.5,
                spotRadius: 1.5,
                target: undefined,
                targetColor: "#4a2",
                chartRangeMax: undefined,
                chartRangeMin: undefined,
                tooltipFormat: new t("{{field:fields}}: {{value}}"),
                tooltipFormatFieldlistKey: "field",
                tooltipValueLookups: {
                    fields: {
                        lq: "Lower Quartile",
                        med: "Median",
                        uq: "Upper Quartile",
                        lo: "Left Outlier",
                        ro: "Right Outlier",
                        lw: "Left Whisker",
                        rw: "Right Whisker"
                    }
                }
            }
        };
    };
    M = '.jqstooltip { position: absolute;left: 0px;top: 0px;visibility: hidden;background: rgb(0, 0, 0) transparent;background-color: rgba(0,0,0,0.6);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000);-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000)";color: white;font: 10px arial, san serif;text-align: left;white-space: nowrap;padding: 5px;border: 1px solid white;z-index: 10000;}.jqsfield { color: white;font: 10px arial, san serif;text-align: left;}';
    I = function() {
        var N, O;
        N = function() {
            this.init.apply(this, arguments);
        };
        if (arguments.length > 1) {
            if (arguments[0]) {
                N.prototype = j.extend(new arguments[0](), arguments[arguments.length - 1]);
                N._super = arguments[0].prototype;
            } else {
                N.prototype = arguments[arguments.length - 1];
            }
            if (arguments.length > 2) {
                O = Array.prototype.slice.call(arguments, 1, -1);
                O.unshift(N.prototype);
                j.extend.apply(j, O);
            }
        } else {
            N.prototype = arguments[0];
        }
        N.prototype.cls = N;
        return N;
    };
    j.SPFormatClass = t = I({
        fre: /\{\{([\w.]+?)(:(.+?))?\}\}/g,
        precre: /(\w+)\.(\d+)/,
        init: function(O, N) {
            this.format = O;
            this.fclass = N;
        },
        render: function(V, T, W) {
            var U = this, S = V, R, O, P, Q, N;
            return this.format.replace(this.fre, function() {
                var X;
                O = arguments[1];
                P = arguments[3];
                R = U.precre.exec(O);
                if (R) {
                    N = R[2];
                    O = R[1];
                } else {
                    N = false;
                }
                Q = S[O];
                if (Q === undefined) {
                    return "";
                }
                if (P && T && T[P]) {
                    X = T[P];
                    if (X.get) {
                        return T[P].get(Q) || Q;
                    } else {
                        return T[P][Q] || Q;
                    }
                }
                if (w(Q)) {
                    if (W.get("numberFormatter")) {
                        Q = W.get("numberFormatter")(Q);
                    } else {
                        Q = m(Q, N, W.get("numberDigitGroupCount"), W.get("numberDigitGroupSep"), W.get("numberDecimalMark"));
                    }
                }
                return Q;
            });
        }
    });
    j.spformat = function(O, N) {
        return new t(O, N);
    };
    F = function(P, O, N) {
        if (P < O) {
            return O;
        }
        if (P > N) {
            return N;
        }
        return P;
    };
    u = function(N, P) {
        var O;
        if (P === 2) {
            O = Math.floor(N.length / 2);
            return N.length % 2 ? N[O] : (N[O - 1] + N[O]) / 2;
        } else {
            if (N.length % 2) {
                O = (N.length * P + P) / 4;
                return O % 1 ? (N[Math.floor(O)] + N[Math.floor(O) - 1]) / 2 : N[O - 1];
            } else {
                O = (N.length * P + 2) / 4;
                return O % 1 ? (N[Math.floor(O)] + N[Math.floor(O) - 1]) / 2 : N[O - 1];
            }
        }
    };
    l = function(O) {
        var N;
        switch (O) {
          case "undefined":
            O = undefined;
            break;

          case "null":
            O = null;
            break;

          case "true":
            O = true;
            break;

          case "false":
            O = false;
            break;

          default:
            N = parseFloat(O);
            if (O == N) {
                O = N;
            }
        }
        return O;
    };
    J = function(P) {
        var O, N = [];
        for (O = P.length; O--; ) {
            N[O] = l(P[O]);
        }
        return N;
    };
    K = function(R, P) {
        var O, Q, N = [];
        for (O = 0, Q = R.length; O < Q; O++) {
            if (R[O] !== P) {
                N.push(R[O]);
            }
        }
        return N;
    };
    w = function(N) {
        return !isNaN(parseFloat(N)) && isFinite(N);
    };
    m = function(P, O, N, S, R) {
        var T, Q;
        P = (O === false ? parseFloat(P).toString() : P.toFixed(O)).split("");
        T = (T = j.inArray(".", P)) < 0 ? P.length : T;
        if (T < P.length) {
            P[T] = R;
        }
        for (Q = T - N; Q > 0; Q -= N) {
            P.splice(Q, 0, S);
        }
        return P.join("");
    };
    c = function(Q, O, N) {
        var P;
        for (P = O.length; P--; ) {
            if (N && O[P] === null) {
                continue;
            }
            if (O[P] !== Q) {
                return false;
            }
        }
        return true;
    };
    d = function(P) {
        var O = 0, N;
        for (N = P.length; N--; ) {
            O += typeof P[N] === "number" ? P[N] : 0;
        }
        return O;
    };
    B = function(N) {
        return j.isArray(N) ? N : [ N ];
    };
    L = function(O) {
        var N;
        if (document.createStyleSheet) {
            document.createStyleSheet().cssText = O;
        } else {
            N = document.createElement("style");
            N.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(N);
            N[typeof document.body.style.WebkitAppearance == "string" ? "innerText" : "innerHTML"] = O;
        }
    };
    j.fn.simpledraw = function(Q, N, O, P) {
        var S, R;
        if (O && (S = this.data("_jqs_vcanvas"))) {
            return S;
        }
        if (Q === undefined) {
            Q = j(this).innerWidth();
        }
        if (N === undefined) {
            N = j(this).innerHeight();
        }
        if (j.fn.sparkline.hasCanvas) {
            S = new C(Q, N, this, P);
        } else {
            if (j.fn.sparkline.hasVML) {
                S = new z(Q, N, this);
            } else {
                return false;
            }
        }
        R = j(this).data("_jqs_mhandler");
        if (R) {
            R.registerCanvas(S);
        }
        return S;
    };
    j.fn.cleardraw = function() {
        var N = this.data("_jqs_vcanvas");
        if (N) {
            N.reset();
        }
    };
    j.RangeMapClass = s = I({
        init: function(Q) {
            var P, N, O = [];
            for (P in Q) {
                if (Q.hasOwnProperty(P) && typeof P === "string" && P.indexOf(":") > -1) {
                    N = P.split(":");
                    N[0] = N[0].length === 0 ? -Infinity : parseFloat(N[0]);
                    N[1] = N[1].length === 0 ? Infinity : parseFloat(N[1]);
                    N[2] = Q[P];
                    O.push(N);
                }
            }
            this.map = Q;
            this.rangelist = O || false;
        },
        get: function(R) {
            var Q = this.rangelist, P, O, N;
            if ((N = this.map[R]) !== undefined) {
                return N;
            }
            if (Q) {
                for (P = Q.length; P--; ) {
                    O = Q[P];
                    if (O[0] <= R && O[1] >= R) {
                        return O[2];
                    }
                }
            }
            return undefined;
        }
    });
    j.range_map = function(N) {
        return new s(N);
    };
    H = I({
        init: function(P, N) {
            var O = j(P);
            this.$el = O;
            this.options = N;
            this.currentPageX = 0;
            this.currentPageY = 0;
            this.el = P;
            this.splist = [];
            this.tooltip = null;
            this.over = false;
            this.displayTooltips = !N.get("disableTooltips");
            this.highlightEnabled = !N.get("disableHighlight");
        },
        registerSparkline: function(N) {
            this.splist.push(N);
            if (this.over) {
                this.updateDisplay();
            }
        },
        registerCanvas: function(N) {
            var O = j(N.canvas);
            this.canvas = N;
            this.$canvas = O;
            O.mouseenter(j.proxy(this.mouseenter, this));
            O.mouseleave(j.proxy(this.mouseleave, this));
            O.click(j.proxy(this.mouseclick, this));
        },
        reset: function(N) {
            this.splist = [];
            if (this.tooltip && N) {
                this.tooltip.remove();
                this.tooltip = undefined;
            }
        },
        mouseclick: function(O) {
            var N = j.Event("sparklineClick");
            N.originalEvent = O;
            N.sparklines = this.splist;
            this.$el.trigger(N);
        },
        mouseenter: function(N) {
            j(document.body).unbind("mousemove.jqs");
            j(document.body).bind("mousemove.jqs", j.proxy(this.mousemove, this));
            this.over = true;
            this.currentPageX = N.pageX;
            this.currentPageY = N.pageY;
            this.currentEl = N.target;
            if (!this.tooltip && this.displayTooltips) {
                this.tooltip = new D(this.options);
                this.tooltip.updatePosition(N.pageX, N.pageY);
            }
            this.updateDisplay();
        },
        mouseleave: function() {
            j(document.body).unbind("mousemove.jqs");
            var Q = this.splist, N = Q.length, P = false, R, O;
            this.over = false;
            this.currentEl = null;
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
            for (O = 0; O < N; O++) {
                R = Q[O];
                if (R.clearRegionHighlight()) {
                    P = true;
                }
            }
            if (P) {
                this.canvas.render();
            }
        },
        mousemove: function(N) {
            this.currentPageX = N.pageX;
            this.currentPageY = N.pageY;
            this.currentEl = N.target;
            if (this.tooltip) {
                this.tooltip.updatePosition(N.pageX, N.pageY);
            }
            this.updateDisplay();
        },
        updateDisplay: function() {
            var O = this.splist, U = O.length, S = false, R = this.$canvas.offset(), Q = this.currentPageX - R.left, P = this.currentPageY - R.top, V, N, T, X, W;
            if (!this.over) {
                return;
            }
            for (T = 0; T < U; T++) {
                N = O[T];
                X = N.setRegionHighlight(this.currentEl, Q, P);
                if (X) {
                    S = true;
                }
            }
            if (S) {
                W = j.Event("sparklineRegionChange");
                W.sparklines = this.splist;
                this.$el.trigger(W);
                if (this.tooltip) {
                    V = "";
                    for (T = 0; T < U; T++) {
                        N = O[T];
                        V += N.getCurrentRegionTooltip();
                    }
                    this.tooltip.setContent(V);
                }
                if (!this.disableHighlight) {
                    this.canvas.render();
                }
            }
            if (X === null) {
                this.mouseleave();
            }
        }
    });
    D = I({
        sizeStyle: "position: static !important;display: block !important;visibility: hidden !important;float: left !important;",
        init: function(N) {
            var Q = N.get("tooltipClassname", "jqstooltip"), O = this.sizeStyle, P;
            this.container = N.get("tooltipContainer") || document.body;
            this.tooltipOffsetX = N.get("tooltipOffsetX", 10);
            this.tooltipOffsetY = N.get("tooltipOffsetY", 12);
            j("#jqssizetip").remove();
            j("#jqstooltip").remove();
            this.sizetip = j("<div/>", {
                id: "jqssizetip",
                style: O,
                class: Q
            });
            this.tooltip = j("<div/>", {
                id: "jqstooltip",
                class: Q
            }).appendTo(this.container);
            P = this.tooltip.offset();
            this.offsetLeft = P.left;
            this.offsetTop = P.top;
            this.hidden = true;
            j(window).unbind("resize.jqs scroll.jqs");
            j(window).bind("resize.jqs scroll.jqs", j.proxy(this.updateWindowDims, this));
            this.updateWindowDims();
        },
        updateWindowDims: function() {
            this.scrollTop = j(window).scrollTop();
            this.scrollLeft = j(window).scrollLeft();
            this.scrollRight = this.scrollLeft + j(window).width();
            this.updatePosition();
        },
        getSize: function(N) {
            this.sizetip.html(N).appendTo(this.container);
            this.width = this.sizetip.width() + 1;
            this.height = this.sizetip.height();
            this.sizetip.remove();
        },
        setContent: function(N) {
            if (!N) {
                this.tooltip.css("visibility", "hidden");
                this.hidden = true;
                return;
            }
            this.getSize(N);
            this.tooltip.html(N).css({
                width: this.width,
                height: this.height,
                visibility: "visible"
            });
            if (this.hidden) {
                this.hidden = false;
                this.updatePosition();
            }
        },
        updatePosition: function(N, O) {
            if (N === undefined) {
                if (this.mousex === undefined) {
                    return;
                }
                N = this.mousex - this.offsetLeft;
                O = this.mousey - this.offsetTop;
            } else {
                this.mousex = N = N - this.offsetLeft;
                this.mousey = O = O - this.offsetTop;
            }
            if (!this.height || !this.width || this.hidden) {
                return;
            }
            O -= this.height + this.tooltipOffsetY;
            N += this.tooltipOffsetX;
            if (O < this.scrollTop) {
                O = this.scrollTop;
            }
            if (N < this.scrollLeft) {
                N = this.scrollLeft;
            } else {
                if (N + this.width > this.scrollRight) {
                    N = this.scrollRight - this.width;
                }
            }
            this.tooltip.css({
                left: N,
                top: O
            });
        },
        remove: function() {
            this.tooltip.remove();
            this.sizetip.remove();
            this.sizetip = this.tooltip = undefined;
            j(window).unbind("resize.jqs scroll.jqs");
        }
    });
    b = function() {
        L(M);
    };
    j(b);
    h = [];
    j.fn.sparkline = function(N, O) {
        return this.each(function() {
            var P = new j.fn.sparkline.options(this, O), S = j(this), R, Q;
            R = function() {
                var U, W, T, V, Z, Y, X;
                if (N === "html" || N === undefined) {
                    X = this.getAttribute(P.get("tagValuesAttribute"));
                    if (X === undefined || X === null) {
                        X = S.html();
                    }
                    U = X.replace(/(^\s*<!--)|(-->\s*$)|\s+/g, "").split(",");
                } else {
                    U = N;
                }
                W = P.get("width") === "auto" ? U.length * P.get("defaultPixelsPerValue") : P.get("width");
                if (P.get("height") === "auto") {
                    if (!P.get("composite") || !j.data(this, "_jqs_vcanvas")) {
                        V = document.createElement("span");
                        V.innerHTML = "a";
                        S.html(V);
                        T = j(V).innerHeight() || j(V).height();
                        j(V).remove();
                        V = null;
                    }
                } else {
                    T = P.get("height");
                }
                if (!P.get("disableInteraction")) {
                    Z = j.data(this, "_jqs_mhandler");
                    if (!Z) {
                        Z = new H(this, P);
                        j.data(this, "_jqs_mhandler", Z);
                    } else {
                        if (!P.get("composite")) {
                            Z.reset();
                        }
                    }
                } else {
                    Z = false;
                }
                if (P.get("composite") && !j.data(this, "_jqs_vcanvas")) {
                    if (!j.data(this, "_jqs_errnotify")) {
                        alert("Attempted to attach a composite sparkline to an element with no existing sparkline");
                        j.data(this, "_jqs_errnotify", true);
                    }
                    return;
                }
                Y = new (j.fn.sparkline[P.get("type")])(this, U, P, W, T);
                Y.render();
                if (Z) {
                    Z.registerSparkline(Y);
                }
            };
            if (j(this).html() && !P.get("disableHiddenCheck") && j(this).is(":hidden") || j.fn.jquery < "1.3.0" && j(this).parents().is(":hidden") || !j(this).parents("body").length) {
                if (!P.get("composite") && j.data(this, "_jqs_pending")) {
                    for (Q = h.length; Q; Q--) {
                        if (h[Q - 1][0] == this) {
                            h.splice(Q - 1, 1);
                        }
                    }
                }
                h.push([ this, R ]);
                j.data(this, "_jqs_pending", true);
            } else {
                R.call(this);
            }
        });
    };
    j.fn.sparkline.defaults = n();
    j.sparkline_display_visible = function() {
        var Q, O, P;
        var N = [];
        for (O = 0, P = h.length; O < P; O++) {
            Q = h[O][0];
            if (j(Q).is(":visible") && !j(Q).parents().is(":hidden")) {
                h[O][1].call(Q);
                j.data(h[O][0], "_jqs_pending", false);
                N.push(O);
            } else {
                if (!j(Q).closest("html").length && !j.data(Q, "_jqs_pending")) {
                    j.data(h[O][0], "_jqs_pending", false);
                    N.push(O);
                }
            }
        }
        for (O = N.length; O; O--) {
            h.splice(N[O - 1], 1);
        }
    };
    j.fn.sparkline.options = I({
        init: function(N, S) {
            var R, Q, P, O;
            this.userOptions = S = S || {};
            this.tag = N;
            this.tagValCache = {};
            Q = j.fn.sparkline.defaults;
            P = Q.common;
            this.tagOptionsPrefix = S.enableTagOptions && (S.tagOptionsPrefix || P.tagOptionsPrefix);
            O = this.getTagSetting("type");
            if (O === r) {
                R = Q[S.type || P.type];
            } else {
                R = Q[O];
            }
            this.mergedOptions = j.extend({}, P, R, S);
        },
        getTagSetting: function(P) {
            var R = this.tagOptionsPrefix, S, O, Q, N;
            if (R === false || R === undefined) {
                return r;
            }
            if (this.tagValCache.hasOwnProperty(P)) {
                S = this.tagValCache.key;
            } else {
                S = this.tag.getAttribute(R + P);
                if (S === undefined || S === null) {
                    S = r;
                } else {
                    if (S.substr(0, 1) === "[") {
                        S = S.substr(1, S.length - 2).split(",");
                        for (O = S.length; O--; ) {
                            S[O] = l(S[O].replace(/(^\s*)|(\s*$)/g, ""));
                        }
                    } else {
                        if (S.substr(0, 1) === "{") {
                            Q = S.substr(1, S.length - 2).split(",");
                            S = {};
                            for (O = Q.length; O--; ) {
                                N = Q[O].split(":", 2);
                                S[N[0].replace(/(^\s*)|(\s*$)/g, "")] = l(N[1].replace(/(^\s*)|(\s*$)/g, ""));
                            }
                        } else {
                            S = l(S);
                        }
                    }
                }
                this.tagValCache.key = S;
            }
            return S;
        },
        get: function(Q, P) {
            var O = this.getTagSetting(Q), N;
            if (O !== r) {
                return O;
            }
            return (N = this.mergedOptions[Q]) === undefined ? P : N;
        }
    });
    j.fn.sparkline._base = I({
        disabled: false,
        init: function(R, O, P, Q, N) {
            this.el = R;
            this.$el = j(R);
            this.values = O;
            this.options = P;
            this.width = Q;
            this.height = N;
            this.currentRegion = undefined;
        },
        initTarget: function() {
            var N = !this.options.get("disableInteraction");
            if (!(this.target = this.$el.simpledraw(this.width, this.height, this.options.get("composite"), N))) {
                this.disabled = true;
            } else {
                this.canvasWidth = this.target.pixelWidth;
                this.canvasHeight = this.target.pixelHeight;
            }
        },
        render: function() {
            if (this.disabled) {
                this.el.innerHTML = "";
                return false;
            }
            return true;
        },
        getRegion: function(N, O) {},
        setRegionHighlight: function(P, N, S) {
            var Q = this.currentRegion, O = !this.options.get("disableHighlight"), R;
            if (N > this.canvasWidth || S > this.canvasHeight || N < 0 || S < 0) {
                return null;
            }
            R = this.getRegion(P, N, S);
            if (Q !== R) {
                if (Q !== undefined && O) {
                    this.removeHighlight();
                }
                this.currentRegion = R;
                if (R !== undefined && O) {
                    this.renderHighlight();
                }
                return true;
            }
            return false;
        },
        clearRegionHighlight: function() {
            if (this.currentRegion !== undefined) {
                this.removeHighlight();
                this.currentRegion = undefined;
                return true;
            }
            return false;
        },
        renderHighlight: function() {
            this.changeHighlight(true);
        },
        removeHighlight: function() {
            this.changeHighlight(false);
        },
        changeHighlight: function(N) {},
        getCurrentRegionTooltip: function() {
            var ad = this.options, S = "", T = [], U, Z, N, W, ac, R, V, Q, X, P, ab, aa, Y, O;
            if (this.currentRegion === undefined) {
                return "";
            }
            U = this.getCurrentRegionFields();
            ab = ad.get("tooltipFormatter");
            if (ab) {
                return ab(this, ad, U);
            }
            if (ad.get("tooltipChartTitle")) {
                S += '<div class="jqs jqstitle">' + ad.get("tooltipChartTitle") + "</div>\n";
            }
            Z = this.options.get("tooltipFormat");
            if (!Z) {
                return "";
            }
            if (!j.isArray(Z)) {
                Z = [ Z ];
            }
            if (!j.isArray(U)) {
                U = [ U ];
            }
            V = this.options.get("tooltipFormatFieldlist");
            Q = this.options.get("tooltipFormatFieldlistKey");
            if (V && Q) {
                X = [];
                for (R = U.length; R--; ) {
                    P = U[R][Q];
                    if ((O = j.inArray(P, V)) != -1) {
                        X[O] = U[R];
                    }
                }
                U = X;
            }
            N = Z.length;
            Y = U.length;
            for (R = 0; R < N; R++) {
                aa = Z[R];
                if (typeof aa === "string") {
                    aa = new t(aa);
                }
                W = aa.fclass || "jqsfield";
                for (O = 0; O < Y; O++) {
                    if (!U[O].isNull || !ad.get("tooltipSkipNull")) {
                        j.extend(U[O], {
                            prefix: ad.get("tooltipPrefix"),
                            suffix: ad.get("tooltipSuffix")
                        });
                        ac = aa.render(U[O], ad.get("tooltipValueLookups"), ad);
                        T.push('<div class="' + W + '">' + ac + "</div>");
                    }
                }
            }
            if (T.length) {
                return S + T.join("\n");
            }
            return "";
        },
        getCurrentRegionFields: function() {},
        calcHighlightColor: function(N, O) {
            var U = O.get("highlightColor"), Q = O.get("highlightLighten"), T, S, R, P;
            if (U) {
                return U;
            }
            if (Q) {
                T = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(N) || /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(N);
                if (T) {
                    R = [];
                    S = N.length === 4 ? 16 : 1;
                    for (P = 0; P < 3; P++) {
                        R[P] = F(Math.round(parseInt(T[P + 1], 16) * S * Q), 0, 255);
                    }
                    return "rgb(" + R.join(",") + ")";
                }
            }
            return N;
        }
    });
    g = {
        changeHighlight: function(P) {
            var R = this.currentRegion, Q = this.target, N = this.regionShapes[R], O;
            if (N) {
                O = this.renderRegion(R, P);
                if (j.isArray(O) || j.isArray(N)) {
                    Q.replaceWithShapes(N, O);
                    this.regionShapes[R] = j.map(O, function(S) {
                        return S.id;
                    });
                } else {
                    Q.replaceWithShape(N, O);
                    this.regionShapes[R] = O.id;
                }
            }
        },
        render: function() {
            var O = this.values, S = this.target, T = this.regionShapes, N, R, Q, P;
            if (!this.cls._super.render.call(this)) {
                return;
            }
            for (Q = O.length; Q--; ) {
                N = this.renderRegion(Q);
                if (N) {
                    if (j.isArray(N)) {
                        R = [];
                        for (P = N.length; P--; ) {
                            N[P].append();
                            R.push(N[P].id);
                        }
                        T[Q] = R;
                    } else {
                        N.append();
                        T[Q] = N.id;
                    }
                } else {
                    T[Q] = null;
                }
            }
            S.render();
        }
    };
    j.fn.sparkline.line = p = I(j.fn.sparkline._base, {
        type: "line",
        init: function(R, O, P, Q, N) {
            p._super.init.call(this, R, O, P, Q, N);
            this.vertices = [];
            this.regionMap = [];
            this.xvalues = [];
            this.yvalues = [];
            this.yminmax = [];
            this.hightlightSpotId = null;
            this.lastShapeId = null;
            this.initTarget();
        },
        getRegion: function(P, N, R) {
            var O, Q = this.regionMap;
            for (O = Q.length; O--; ) {
                if (Q[O] !== null && N >= Q[O][0] && N <= Q[O][1]) {
                    return Q[O][2];
                }
            }
            return undefined;
        },
        getCurrentRegionFields: function() {
            var N = this.currentRegion;
            return {
                isNull: this.yvalues[N] === null,
                x: this.xvalues[N],
                y: this.yvalues[N],
                color: this.options.get("lineColor"),
                fillColor: this.options.get("fillColor"),
                offset: N
            };
        },
        renderHighlight: function() {
            var N = this.currentRegion, U = this.target, R = this.vertices[N], V = this.options, Q = V.get("spotRadius"), P = V.get("highlightSpotColor"), S = V.get("highlightLineColor"), O, T;
            if (!R) {
                return;
            }
            if (Q && P) {
                O = U.drawCircle(R[0], R[1], Q, undefined, P);
                this.highlightSpotId = O.id;
                U.insertAfterShape(this.lastShapeId, O);
            }
            if (S) {
                T = U.drawLine(R[0], this.canvasTop, R[0], this.canvasTop + this.canvasHeight, S);
                this.highlightLineId = T.id;
                U.insertAfterShape(this.lastShapeId, T);
            }
        },
        removeHighlight: function() {
            var N = this.target;
            if (this.highlightSpotId) {
                N.removeShapeId(this.highlightSpotId);
                this.highlightSpotId = null;
            }
            if (this.highlightLineId) {
                N.removeShapeId(this.highlightLineId);
                this.highlightLineId = null;
            }
        },
        scanValues: function() {
            var V = this.values, P = V.length, N = this.xvalues, T = this.yvalues, W = this.yminmax, R, Q, U, S, O;
            for (R = 0; R < P; R++) {
                Q = V[R];
                U = typeof V[R] === "string";
                S = typeof V[R] === "object" && V[R] instanceof Array;
                O = U && V[R].split(":");
                if (U && O.length === 2) {
                    N.push(Number(O[0]));
                    T.push(Number(O[1]));
                    W.push(Number(O[1]));
                } else {
                    if (S) {
                        N.push(Q[0]);
                        T.push(Q[1]);
                        W.push(Q[1]);
                    } else {
                        N.push(R);
                        if (V[R] === null || V[R] === "null") {
                            T.push(null);
                        } else {
                            T.push(Number(Q));
                            W.push(Number(Q));
                        }
                    }
                }
            }
            if (this.options.get("xvalues")) {
                N = this.options.get("xvalues");
            }
            this.maxy = this.maxyorg = Math.max.apply(Math, W);
            this.miny = this.minyorg = Math.min.apply(Math, W);
            this.maxx = Math.max.apply(Math, N);
            this.minx = Math.min.apply(Math, N);
            this.xvalues = N;
            this.yvalues = T;
            this.yminmax = W;
        },
        processRangeOptions: function() {
            var O = this.options, N = O.get("normalRangeMin"), P = O.get("normalRangeMax");
            if (N !== undefined) {
                if (N < this.miny) {
                    this.miny = N;
                }
                if (P > this.maxy) {
                    this.maxy = P;
                }
            }
            if (O.get("chartRangeMin") !== undefined && (O.get("chartRangeClip") || O.get("chartRangeMin") < this.miny)) {
                this.miny = O.get("chartRangeMin");
            }
            if (O.get("chartRangeMax") !== undefined && (O.get("chartRangeClip") || O.get("chartRangeMax") > this.maxy)) {
                this.maxy = O.get("chartRangeMax");
            }
            if (O.get("chartRangeMinX") !== undefined && (O.get("chartRangeClipX") || O.get("chartRangeMinX") < this.minx)) {
                this.minx = O.get("chartRangeMinX");
            }
            if (O.get("chartRangeMaxX") !== undefined && (O.get("chartRangeClipX") || O.get("chartRangeMaxX") > this.maxx)) {
                this.maxx = O.get("chartRangeMaxX");
            }
        },
        drawNormalRange: function(P, T, S, Q, U) {
            var N = this.options.get("normalRangeMin"), R = this.options.get("normalRangeMax"), O = T + Math.round(S - S * ((R - this.miny) / U)), V = Math.round(S * (R - N) / U);
            this.target.drawRect(P, O, Q, V, undefined, this.options.get("normalRangeColor")).append();
        },
        render: function() {
            var T = this.options, ar = this.target, ao = this.canvasWidth, Q = this.canvasHeight, W = this.vertices, at = T.get("spotRadius"), ad = this.regionMap, P, O, ai, am, ak, an, ae, ah, ab, aa, ag, R, ap, Z, af, aq, S, U, ac, N, X, aj, Y, V, al;
            if (!p._super.render.call(this)) {
                return;
            }
            this.scanValues();
            this.processRangeOptions();
            Y = this.xvalues;
            V = this.yvalues;
            if (!this.yminmax.length || this.yvalues.length < 2) {
                return;
            }
            am = ak = 0;
            P = this.maxx - this.minx === 0 ? 1 : this.maxx - this.minx;
            O = this.maxy - this.miny === 0 ? 1 : this.maxy - this.miny;
            ai = this.yvalues.length - 1;
            if (at && (ao < at * 4 || Q < at * 4)) {
                at = 0;
            }
            if (at) {
                X = T.get("highlightSpotColor") && !T.get("disableInteraction");
                if (X || T.get("minSpotColor") || T.get("spotColor") && V[ai] === this.miny) {
                    Q -= Math.ceil(at);
                }
                if (X || T.get("maxSpotColor") || T.get("spotColor") && V[ai] === this.maxy) {
                    Q -= Math.ceil(at);
                    am += Math.ceil(at);
                }
                if (X || (T.get("minSpotColor") || T.get("maxSpotColor")) && (V[0] === this.miny || V[0] === this.maxy)) {
                    ak += Math.ceil(at);
                    ao -= Math.ceil(at);
                }
                if (X || T.get("spotColor") || (T.get("minSpotColor") || T.get("maxSpotColor") && (V[ai] === this.miny || V[ai] === this.maxy))) {
                    ao -= Math.ceil(at);
                }
            }
            Q--;
            if (T.get("normalRangeMin") !== undefined && !T.get("drawNormalOnTop")) {
                this.drawNormalRange(ak, am, Q, ao, O);
            }
            ae = [];
            ah = [ ae ];
            Z = af = null;
            aq = V.length;
            for (al = 0; al < aq; al++) {
                ab = Y[al];
                ag = Y[al + 1];
                aa = V[al];
                R = ak + Math.round((ab - this.minx) * (ao / P));
                ap = al < aq - 1 ? ak + Math.round((ag - this.minx) * (ao / P)) : ao;
                af = R + (ap - R) / 2;
                ad[al] = [ Z || 0, af, al ];
                Z = af;
                if (aa === null) {
                    if (al) {
                        if (V[al - 1] !== null) {
                            ae = [];
                            ah.push(ae);
                        }
                        W.push(null);
                    }
                } else {
                    if (aa < this.miny) {
                        aa = this.miny;
                    }
                    if (aa > this.maxy) {
                        aa = this.maxy;
                    }
                    if (!ae.length) {
                        ae.push([ R, am + Q ]);
                    }
                    an = [ R, am + Math.round(Q - Q * ((aa - this.miny) / O)) ];
                    ae.push(an);
                    W.push(an);
                }
            }
            S = [];
            U = [];
            ac = ah.length;
            for (al = 0; al < ac; al++) {
                ae = ah[al];
                if (ae.length) {
                    if (T.get("fillColor")) {
                        ae.push([ ae[ae.length - 1][0], am + Q ]);
                        U.push(ae.slice(0));
                        ae.pop();
                    }
                    if (ae.length > 2) {
                        ae[0] = [ ae[0][0], ae[1][1] ];
                    }
                    S.push(ae);
                }
            }
            ac = U.length;
            for (al = 0; al < ac; al++) {
                ar.drawShape(U[al], T.get("fillColor"), T.get("fillColor")).append();
            }
            if (T.get("normalRangeMin") !== undefined && T.get("drawNormalOnTop")) {
                this.drawNormalRange(ak, am, Q, ao, O);
            }
            ac = S.length;
            for (al = 0; al < ac; al++) {
                ar.drawShape(S[al], T.get("lineColor"), undefined, T.get("lineWidth")).append();
            }
            if (at && T.get("valueSpots")) {
                N = T.get("valueSpots");
                if (N.get === undefined) {
                    N = new s(N);
                }
                for (al = 0; al < aq; al++) {
                    aj = N.get(V[al]);
                    if (aj) {
                        ar.drawCircle(ak + Math.round((Y[al] - this.minx) * (ao / P)), am + Math.round(Q - Q * ((V[al] - this.miny) / O)), at, undefined, aj).append();
                    }
                }
            }
            if (at && T.get("spotColor") && V[ai] !== null) {
                ar.drawCircle(ak + Math.round((Y[Y.length - 1] - this.minx) * (ao / P)), am + Math.round(Q - Q * ((V[ai] - this.miny) / O)), at, undefined, T.get("spotColor")).append();
            }
            if (this.maxy !== this.minyorg) {
                if (at && T.get("minSpotColor")) {
                    ab = Y[j.inArray(this.minyorg, V)];
                    ar.drawCircle(ak + Math.round((ab - this.minx) * (ao / P)), am + Math.round(Q - Q * ((this.minyorg - this.miny) / O)), at, undefined, T.get("minSpotColor")).append();
                }
                if (at && T.get("maxSpotColor")) {
                    ab = Y[j.inArray(this.maxyorg, V)];
                    ar.drawCircle(ak + Math.round((ab - this.minx) * (ao / P)), am + Math.round(Q - Q * ((this.maxyorg - this.miny) / O)), at, undefined, T.get("maxSpotColor")).append();
                }
            }
            this.lastShapeId = ar.getLastShapeId();
            this.canvasTop = am;
            ar.render();
        }
    });
    j.fn.sparkline.bar = E = I(j.fn.sparkline._base, g, {
        type: "bar",
        init: function(av, ax, ab, N, O) {
            var ad = parseInt(ab.get("barWidth"), 10), af = parseInt(ab.get("barSpacing"), 10), T = ab.get("chartRangeMin"), ak = ab.get("chartRangeMax"), Q = ab.get("chartRangeClip"), ao = Infinity, X = -Infinity, ay, U, am, ac, al, au, an, S, ah, Z, aw, aa, at, Y, ap, R, ar, ai, V, ae, P, aq, aj;
            E._super.init.call(this, av, ax, ab, N, O);
            for (au = 0, an = ax.length; au < an; au++) {
                ae = ax[au];
                ay = typeof ae === "string" && ae.indexOf(":") > -1;
                if (ay || j.isArray(ae)) {
                    ap = true;
                    if (ay) {
                        ae = ax[au] = J(ae.split(":"));
                    }
                    ae = K(ae, null);
                    U = Math.min.apply(Math, ae);
                    am = Math.max.apply(Math, ae);
                    if (U < ao) {
                        ao = U;
                    }
                    if (am > X) {
                        X = am;
                    }
                }
            }
            this.stacked = ap;
            this.regionShapes = {};
            this.barWidth = ad;
            this.barSpacing = af;
            this.totalBarWidth = ad + af;
            this.width = N = ax.length * ad + (ax.length - 1) * af;
            this.initTarget();
            if (Q) {
                at = T === undefined ? -Infinity : T;
                Y = ak === undefined ? Infinity : ak;
            }
            al = [];
            ac = ap ? [] : al;
            var ag = [];
            var W = [];
            for (au = 0, an = ax.length; au < an; au++) {
                if (ap) {
                    R = ax[au];
                    ax[au] = V = [];
                    ag[au] = 0;
                    ac[au] = W[au] = 0;
                    for (ar = 0, ai = R.length; ar < ai; ar++) {
                        ae = V[ar] = Q ? F(R[ar], at, Y) : R[ar];
                        if (ae !== null) {
                            if (ae > 0) {
                                ag[au] += ae;
                            }
                            if (ao < 0 && X > 0) {
                                if (ae < 0) {
                                    W[au] += Math.abs(ae);
                                } else {
                                    ac[au] += ae;
                                }
                            } else {
                                ac[au] += Math.abs(ae - (ae < 0 ? X : ao));
                            }
                            al.push(ae);
                        }
                    }
                } else {
                    ae = Q ? F(ax[au], at, Y) : ax[au];
                    ae = ax[au] = l(ae);
                    if (ae !== null) {
                        al.push(ae);
                    }
                }
            }
            this.max = aa = Math.max.apply(Math, al);
            this.min = aw = Math.min.apply(Math, al);
            this.stackMax = X = ap ? Math.max.apply(Math, ag) : aa;
            this.stackMin = ao = ap ? Math.min.apply(Math, al) : aw;
            if (ab.get("chartRangeMin") !== undefined && (ab.get("chartRangeClip") || ab.get("chartRangeMin") < aw)) {
                aw = ab.get("chartRangeMin");
            }
            if (ab.get("chartRangeMax") !== undefined && (ab.get("chartRangeClip") || ab.get("chartRangeMax") > aa)) {
                aa = ab.get("chartRangeMax");
            }
            this.zeroAxis = ah = ab.get("zeroAxis", true);
            if (aw <= 0 && aa >= 0 && ah) {
                Z = 0;
            } else {
                if (ah == false) {
                    Z = aw;
                } else {
                    if (aw > 0) {
                        Z = aw;
                    } else {
                        Z = aa;
                    }
                }
            }
            this.xaxisOffset = Z;
            S = ap ? Math.max.apply(Math, ac) + Math.max.apply(Math, W) : aa - aw;
            this.canvasHeightEf = ah && aw < 0 ? this.canvasHeight - 2 : this.canvasHeight - 1;
            if (aw < Z) {
                aq = ap && aa >= 0 ? X : aa;
                P = (aq - Z) / S * this.canvasHeight;
                if (P !== Math.ceil(P)) {
                    this.canvasHeightEf -= 2;
                    P = Math.ceil(P);
                }
            } else {
                P = this.canvasHeight;
            }
            this.yoffset = P;
            if (j.isArray(ab.get("colorMap"))) {
                this.colorMapByIndex = ab.get("colorMap");
                this.colorMapByValue = null;
            } else {
                this.colorMapByIndex = null;
                this.colorMapByValue = ab.get("colorMap");
                if (this.colorMapByValue && this.colorMapByValue.get === undefined) {
                    this.colorMapByValue = new s(this.colorMapByValue);
                }
            }
            this.range = S;
        },
        getRegion: function(P, O, Q) {
            var N = Math.floor(O / this.totalBarWidth);
            return N < 0 || N >= this.values.length ? undefined : N;
        },
        getCurrentRegionFields: function() {
            var R = this.currentRegion, O = B(this.values[R]), N = [], Q, P;
            for (P = O.length; P--; ) {
                Q = O[P];
                N.push({
                    isNull: Q === null,
                    value: Q,
                    color: this.calcColor(P, Q, R),
                    offset: R
                });
            }
            return N;
        },
        calcColor: function(R, S, T) {
            var U = this.colorMapByIndex, Q = this.colorMapByValue, P = this.options, N, O;
            if (this.stacked) {
                N = P.get("stackedBarColor");
            } else {
                N = S < 0 ? P.get("negBarColor") : P.get("barColor");
            }
            if (S === 0 && P.get("zeroColor") !== undefined) {
                N = P.get("zeroColor");
            }
            if (Q && (O = Q.get(S))) {
                N = O;
            } else {
                if (U && U.length > T) {
                    N = U[T];
                }
            }
            return j.isArray(N) ? N[R % N.length] : N;
        },
        renderRegion: function(X, R) {
            var Z = this.values[X], P = this.options, N = this.xaxisOffset, V = [], aa = this.range, ag = this.stacked, ah = this.target, U = X * this.totalBarWidth, O = this.canvasHeightEf, W = this.yoffset, T, ab, ad, ac, S, ae, Q, ai, af, Y;
            Z = j.isArray(Z) ? Z : [ Z ];
            Q = Z.length;
            ai = Z[0];
            ac = c(null, Z);
            Y = c(N, Z, true);
            if (ac) {
                if (P.get("nullColor")) {
                    ad = R ? P.get("nullColor") : this.calcHighlightColor(P.get("nullColor"), P);
                    T = W > 0 ? W - 1 : W;
                    return ah.drawRect(U, T, this.barWidth - 1, 0, ad, ad);
                } else {
                    return undefined;
                }
            }
            S = W;
            for (ae = 0; ae < Q; ae++) {
                ai = Z[ae];
                if (ag && ai === N) {
                    if (!Y || af) {
                        continue;
                    }
                    af = true;
                }
                if (aa > 0) {
                    ab = Math.floor(O * (Math.abs(ai - N) / aa)) + 1;
                } else {
                    ab = 1;
                }
                if (ai < N || ai === N && W === 0) {
                    T = S;
                    S += ab;
                } else {
                    T = W - ab;
                    W -= ab;
                }
                ad = this.calcColor(ae, ai, X);
                if (R) {
                    ad = this.calcHighlightColor(ad, P);
                }
                V.push(ah.drawRect(U, T, this.barWidth - 1, ab - 1, ad, ad));
            }
            if (V.length === 1) {
                return V[0];
            }
            return V;
        }
    });
    j.fn.sparkline.tristate = e = I(j.fn.sparkline._base, g, {
        type: "tristate",
        init: function(S, O, P, R, N) {
            var Q = parseInt(P.get("barWidth"), 10), T = parseInt(P.get("barSpacing"), 10);
            e._super.init.call(this, S, O, P, R, N);
            this.regionShapes = {};
            this.barWidth = Q;
            this.barSpacing = T;
            this.totalBarWidth = Q + T;
            this.values = j.map(O, Number);
            this.width = R = O.length * Q + (O.length - 1) * T;
            if (j.isArray(P.get("colorMap"))) {
                this.colorMapByIndex = P.get("colorMap");
                this.colorMapByValue = null;
            } else {
                this.colorMapByIndex = null;
                this.colorMapByValue = P.get("colorMap");
                if (this.colorMapByValue && this.colorMapByValue.get === undefined) {
                    this.colorMapByValue = new s(this.colorMapByValue);
                }
            }
            this.initTarget();
        },
        getRegion: function(O, N, P) {
            return Math.floor(N / this.totalBarWidth);
        },
        getCurrentRegionFields: function() {
            var N = this.currentRegion;
            return {
                isNull: this.values[N] === undefined,
                value: this.values[N],
                color: this.calcColor(this.values[N], N),
                offset: N
            };
        },
        calcColor: function(S, T) {
            var O = this.values, R = this.options, U = this.colorMapByIndex, Q = this.colorMapByValue, N, P;
            if (Q && (P = Q.get(S))) {
                N = P;
            } else {
                if (U && U.length > T) {
                    N = U[T];
                } else {
                    if (O[T] < 0) {
                        N = R.get("negBarColor");
                    } else {
                        if (O[T] > 0) {
                            N = R.get("posBarColor");
                        } else {
                            N = R.get("zeroBarColor");
                        }
                    }
                }
            }
            return N;
        },
        renderRegion: function(Q, N) {
            var V = this.values, X = this.options, R = this.target, P, W, S, U, T, O;
            P = R.pixelHeight;
            S = Math.round(P / 2);
            U = Q * this.totalBarWidth;
            if (V[Q] < 0) {
                T = S;
                W = S - 1;
            } else {
                if (V[Q] > 0) {
                    T = 0;
                    W = S - 1;
                } else {
                    T = S - 1;
                    W = 2;
                }
            }
            O = this.calcColor(V[Q], Q);
            if (O === null) {
                return;
            }
            if (N) {
                O = this.calcHighlightColor(O, X);
            }
            return R.drawRect(U, T, this.barWidth - 1, W - 1, O, O);
        }
    });
    j.fn.sparkline.discrete = a = I(j.fn.sparkline._base, g, {
        type: "discrete",
        init: function(R, O, P, Q, N) {
            a._super.init.call(this, R, O, P, Q, N);
            this.regionShapes = {};
            this.values = O = j.map(O, Number);
            this.min = Math.min.apply(Math, O);
            this.max = Math.max.apply(Math, O);
            this.range = this.max - this.min;
            this.width = Q = P.get("width") === "auto" ? O.length * 2 : this.width;
            this.interval = Math.floor(Q / O.length);
            this.itemWidth = Q / O.length;
            if (P.get("chartRangeMin") !== undefined && (P.get("chartRangeClip") || P.get("chartRangeMin") < this.min)) {
                this.min = P.get("chartRangeMin");
            }
            if (P.get("chartRangeMax") !== undefined && (P.get("chartRangeClip") || P.get("chartRangeMax") > this.max)) {
                this.max = P.get("chartRangeMax");
            }
            this.initTarget();
            if (this.target) {
                this.lineHeight = P.get("lineHeight") === "auto" ? Math.round(this.canvasHeight * .3) : P.get("lineHeight");
            }
        },
        getRegion: function(O, N, P) {
            return Math.floor(N / this.itemWidth);
        },
        getCurrentRegionFields: function() {
            var N = this.currentRegion;
            return {
                isNull: this.values[N] === undefined,
                value: this.values[N],
                offset: N
            };
        },
        renderRegion: function(V, Q) {
            var ab = this.values, ac = this.options, S = this.min, Y = this.max, U = this.range, O = this.interval, X = this.target, T = this.canvasHeight, aa = this.lineHeight, W = T - aa, N, P, R, Z;
            P = F(ab[V], S, Y);
            Z = V * O;
            N = Math.round(W - W * ((P - S) / U));
            R = ac.get("thresholdColor") && P < ac.get("thresholdValue") ? ac.get("thresholdColor") : ac.get("lineColor");
            if (Q) {
                R = this.calcHighlightColor(R, ac);
            }
            return X.drawLine(Z, N, Z, N + aa, R);
        }
    });
    j.fn.sparkline.bullet = G = I(j.fn.sparkline._base, {
        type: "bullet",
        init: function(T, P, Q, S, O) {
            var R, N, U;
            G._super.init.call(this, T, P, Q, S, O);
            this.values = P = J(P);
            U = P.slice();
            U[0] = U[0] === null ? U[2] : U[0];
            U[1] = P[1] === null ? U[2] : U[1];
            R = Math.min.apply(Math, P);
            N = Math.max.apply(Math, P);
            if (Q.get("base") === undefined) {
                R = R < 0 ? R : 0;
            } else {
                R = Q.get("base");
            }
            this.min = R;
            this.max = N;
            this.range = N - R;
            this.shapes = {};
            this.valueShapes = {};
            this.regiondata = {};
            this.width = S = Q.get("width") === "auto" ? "4.0em" : S;
            this.target = this.$el.simpledraw(S, O, Q.get("composite"));
            if (!P.length) {
                this.disabled = true;
            }
            this.initTarget();
        },
        getRegion: function(O, N, Q) {
            var P = this.target.getShapeAt(O, N, Q);
            return P !== undefined && this.shapes[P] !== undefined ? this.shapes[P] : undefined;
        },
        getCurrentRegionFields: function() {
            var N = this.currentRegion;
            return {
                fieldkey: N.substr(0, 1),
                value: this.values[N.substr(1)],
                region: N
            };
        },
        changeHighlight: function(O) {
            var Q = this.currentRegion, P = this.valueShapes[Q], N;
            delete this.shapes[P];
            switch (Q.substr(0, 1)) {
              case "r":
                N = this.renderRange(Q.substr(1), O);
                break;

              case "p":
                N = this.renderPerformance(O);
                break;

              case "t":
                N = this.renderTarget(O);
                break;
            }
            this.valueShapes[Q] = N.id;
            this.shapes[N.id] = Q;
            this.target.replaceWithShape(P, N);
        },
        renderRange: function(Q, O) {
            var R = this.values[Q], P = Math.round(this.canvasWidth * ((R - this.min) / this.range)), N = this.options.get("rangeColors")[Q - 2];
            if (O) {
                N = this.calcHighlightColor(N, this.options);
            }
            return this.target.drawRect(0, 0, P - 1, this.canvasHeight - 1, N, N);
        },
        renderPerformance: function(O) {
            var Q = this.values[1], P = Math.round(this.canvasWidth * ((Q - this.min) / this.range)), N = this.options.get("performanceColor");
            if (O) {
                N = this.calcHighlightColor(N, this.options);
            }
            return this.target.drawRect(0, Math.round(this.canvasHeight * .3), P - 1, Math.round(this.canvasHeight * .4) - 1, N, N);
        },
        renderTarget: function(P) {
            var S = this.values[0], N = Math.round(this.canvasWidth * ((S - this.min) / this.range) - this.options.get("targetWidth") / 2), R = Math.round(this.canvasHeight * .1), Q = this.canvasHeight - R * 2, O = this.options.get("targetColor");
            if (P) {
                O = this.calcHighlightColor(O, this.options);
            }
            return this.target.drawRect(N, R, this.options.get("targetWidth") - 1, Q - 1, O, O);
        },
        render: function() {
            var Q = this.values.length, P = this.target, O, N;
            if (!G._super.render.call(this)) {
                return;
            }
            for (O = 2; O < Q; O++) {
                N = this.renderRange(O).append();
                this.shapes[N.id] = "r" + O;
                this.valueShapes["r" + O] = N.id;
            }
            if (this.values[1] !== null) {
                N = this.renderPerformance().append();
                this.shapes[N.id] = "p1";
                this.valueShapes.p1 = N.id;
            }
            if (this.values[0] !== null) {
                N = this.renderTarget().append();
                this.shapes[N.id] = "t0";
                this.valueShapes.t0 = N.id;
            }
            P.render();
        }
    });
    j.fn.sparkline.pie = v = I(j.fn.sparkline._base, {
        type: "pie",
        init: function(S, O, P, R, N) {
            var T = 0, Q;
            v._super.init.call(this, S, O, P, R, N);
            this.shapes = {};
            this.valueShapes = {};
            this.values = O = j.map(O, Number);
            if (P.get("width") === "auto") {
                this.width = this.height;
            }
            if (O.length > 0) {
                for (Q = O.length; Q--; ) {
                    T += O[Q];
                }
            }
            this.total = T;
            this.initTarget();
            this.radius = Math.floor(Math.min(this.canvasWidth, this.canvasHeight) / 2);
        },
        getRegion: function(O, N, Q) {
            var P = this.target.getShapeAt(O, N, Q);
            return P !== undefined && this.shapes[P] !== undefined ? this.shapes[P] : undefined;
        },
        getCurrentRegionFields: function() {
            var N = this.currentRegion;
            return {
                isNull: this.values[N] === undefined,
                value: this.values[N],
                percent: this.values[N] / this.total * 100,
                color: this.options.get("sliceColors")[N % this.options.get("sliceColors").length],
                offset: N
            };
        },
        changeHighlight: function(N) {
            var Q = this.currentRegion, O = this.renderSlice(Q, N), P = this.valueShapes[Q];
            delete this.shapes[P];
            this.target.replaceWithShape(P, O);
            this.valueShapes[Q] = O.id;
            this.shapes[O.id] = Q;
        },
        renderSlice: function(W, Q) {
            var Y = this.target, ac = this.options, X = this.radius, N = ac.get("borderWidth"), T = ac.get("offset"), O = 2 * Math.PI, ab = this.values, Z = this.total, V = T ? 2 * Math.PI * (T / 360) : 0, P, S, U, aa, R;
            aa = ab.length;
            for (U = 0; U < aa; U++) {
                P = V;
                S = V;
                if (Z > 0) {
                    S = V + O * (ab[U] / Z);
                }
                if (W === U) {
                    R = ac.get("sliceColors")[U % ac.get("sliceColors").length];
                    if (Q) {
                        R = this.calcHighlightColor(R, ac);
                    }
                    return Y.drawPieSlice(X, X, X - N, P, S, undefined, R);
                }
                V = S;
            }
        },
        render: function() {
            var T = this.target, Q = this.values, R = this.options, N = this.radius, P = R.get("borderWidth"), O, S;
            if (!v._super.render.call(this)) {
                return;
            }
            if (P) {
                T.drawCircle(N, N, Math.floor(N - P / 2), R.get("borderColor"), undefined, P).append();
            }
            for (S = Q.length; S--; ) {
                if (Q[S]) {
                    O = this.renderSlice(S).append();
                    this.valueShapes[S] = O.id;
                    this.shapes[O.id] = S;
                }
            }
            T.render();
        }
    });
    j.fn.sparkline.box = o = I(j.fn.sparkline._base, {
        type: "box",
        init: function(R, O, P, Q, N) {
            o._super.init.call(this, R, O, P, Q, N);
            this.values = j.map(O, Number);
            this.width = P.get("width") === "auto" ? "4.0em" : Q;
            this.initTarget();
            if (!this.values.length) {
                this.disabled = 1;
            }
        },
        getRegion: function() {
            return 1;
        },
        getCurrentRegionFields: function() {
            var N = [ {
                field: "lq",
                value: this.quartiles[0]
            }, {
                field: "med",
                value: this.quartiles[1]
            }, {
                field: "uq",
                value: this.quartiles[2]
            } ];
            if (this.loutlier !== undefined) {
                N.push({
                    field: "lo",
                    value: this.loutlier
                });
            }
            if (this.routlier !== undefined) {
                N.push({
                    field: "ro",
                    value: this.routlier
                });
            }
            if (this.lwhisker !== undefined) {
                N.push({
                    field: "lw",
                    value: this.lwhisker
                });
            }
            if (this.rwhisker !== undefined) {
                N.push({
                    field: "rw",
                    value: this.rwhisker
                });
            }
            return N;
        },
        render: function() {
            var ag = this.target, Q = this.values, U = Q.length, S = this.options, af = this.canvasWidth, O = this.canvasHeight, Z = S.get("chartRangeMin") === undefined ? Math.min.apply(Math, Q) : S.get("chartRangeMin"), ae = S.get("chartRangeMax") === undefined ? Math.max.apply(Math, Q) : S.get("chartRangeMax"), ab = 0, Y, ad, R, X, W, V, N, T, ac, aa, P;
            if (!o._super.render.call(this)) {
                return;
            }
            if (S.get("raw")) {
                if (S.get("showOutliers") && Q.length > 5) {
                    ad = Q[0];
                    Y = Q[1];
                    X = Q[2];
                    W = Q[3];
                    V = Q[4];
                    N = Q[5];
                    T = Q[6];
                } else {
                    Y = Q[0];
                    X = Q[1];
                    W = Q[2];
                    V = Q[3];
                    N = Q[4];
                }
            } else {
                Q.sort(function(ai, ah) {
                    return ai - ah;
                });
                X = u(Q, 1);
                W = u(Q, 2);
                V = u(Q, 3);
                R = V - X;
                if (S.get("showOutliers")) {
                    Y = N = undefined;
                    for (ac = 0; ac < U; ac++) {
                        if (Y === undefined && Q[ac] > X - R * S.get("outlierIQR")) {
                            Y = Q[ac];
                        }
                        if (Q[ac] < V + R * S.get("outlierIQR")) {
                            N = Q[ac];
                        }
                    }
                    ad = Q[0];
                    T = Q[U - 1];
                } else {
                    Y = Q[0];
                    N = Q[U - 1];
                }
            }
            this.quartiles = [ X, W, V ];
            this.lwhisker = Y;
            this.rwhisker = N;
            this.loutlier = ad;
            this.routlier = T;
            P = af / (ae - Z + 1);
            if (S.get("showOutliers")) {
                ab = Math.ceil(S.get("spotRadius"));
                af -= 2 * Math.ceil(S.get("spotRadius"));
                P = af / (ae - Z + 1);
                if (ad < Y) {
                    ag.drawCircle((ad - Z) * P + ab, O / 2, S.get("spotRadius"), S.get("outlierLineColor"), S.get("outlierFillColor")).append();
                }
                if (T > N) {
                    ag.drawCircle((T - Z) * P + ab, O / 2, S.get("spotRadius"), S.get("outlierLineColor"), S.get("outlierFillColor")).append();
                }
            }
            ag.drawRect(Math.round((X - Z) * P + ab), Math.round(O * .1), Math.round((V - X) * P), Math.round(O * .8), S.get("boxLineColor"), S.get("boxFillColor")).append();
            ag.drawLine(Math.round((Y - Z) * P + ab), Math.round(O / 2), Math.round((X - Z) * P + ab), Math.round(O / 2), S.get("lineColor")).append();
            ag.drawLine(Math.round((Y - Z) * P + ab), Math.round(O / 4), Math.round((Y - Z) * P + ab), Math.round(O - O / 4), S.get("whiskerColor")).append();
            ag.drawLine(Math.round((N - Z) * P + ab), Math.round(O / 2), Math.round((V - Z) * P + ab), Math.round(O / 2), S.get("lineColor")).append();
            ag.drawLine(Math.round((N - Z) * P + ab), Math.round(O / 4), Math.round((N - Z) * P + ab), Math.round(O - O / 4), S.get("whiskerColor")).append();
            ag.drawLine(Math.round((W - Z) * P + ab), Math.round(O * .1), Math.round((W - Z) * P + ab), Math.round(O * .9), S.get("medianColor")).append();
            if (S.get("target")) {
                aa = Math.ceil(S.get("spotRadius"));
                ag.drawLine(Math.round((S.get("target") - Z) * P + ab), Math.round(O / 2 - aa), Math.round((S.get("target") - Z) * P + ab), Math.round(O / 2 + aa), S.get("targetColor")).append();
                ag.drawLine(Math.round((S.get("target") - Z) * P + ab - aa), Math.round(O / 2), Math.round((S.get("target") - Z) * P + ab + aa), Math.round(O / 2), S.get("targetColor")).append();
            }
            ag.render();
        }
    });
    (function() {
        if (document.namespaces && !document.namespaces.v) {
            j.fn.sparkline.hasVML = true;
            document.namespaces.add("v", "urn:schemas-microsoft-com:vml", "#default#VML");
        } else {
            j.fn.sparkline.hasVML = false;
        }
        var N = document.createElement("canvas");
        j.fn.sparkline.hasCanvas = !!(N.getContext && N.getContext("2d"));
    })();
    A = I({
        init: function(P, Q, O, N) {
            this.target = P;
            this.id = Q;
            this.type = O;
            this.args = N;
        },
        append: function() {
            this.target.appendShape(this);
            return this;
        }
    });
    k = I({
        _pxregex: /(\d+)(px)?\s*$/i,
        init: function(O, N, P) {
            if (!O) {
                return;
            }
            this.width = O;
            this.height = N;
            this.target = P;
            this.lastShapeId = null;
            if (P[0]) {
                P = P[0];
            }
            j.data(P, "_jqs_vcanvas", this);
        },
        drawLine: function(P, R, O, Q, S, N) {
            return this.drawShape([ [ P, R ], [ O, Q ] ], S, N);
        },
        drawShape: function(P, O, Q, N) {
            return this._genShape("Shape", [ P, O, Q, N ]);
        },
        drawCircle: function(P, S, O, Q, R, N) {
            return this._genShape("Circle", [ P, S, O, Q, R, N ]);
        },
        drawPieSlice: function(O, T, N, Q, P, R, S) {
            return this._genShape("PieSlice", [ O, T, N, Q, P, R, S ]);
        },
        drawRect: function(O, S, P, N, Q, R) {
            return this._genShape("Rect", [ O, S, P, N, Q, R ]);
        },
        getElement: function() {
            return this.canvas;
        },
        getLastShapeId: function() {
            return this.lastShapeId;
        },
        reset: function() {
            alert("reset not implemented");
        },
        _insert: function(N, O) {
            j(O).html(N);
        },
        _calculatePixelDims: function(Q, N, P) {
            var O;
            O = this._pxregex.exec(N);
            if (O) {
                this.pixelHeight = O[1];
            } else {
                this.pixelHeight = j(P).height();
            }
            O = this._pxregex.exec(Q);
            if (O) {
                this.pixelWidth = O[1];
            } else {
                this.pixelWidth = j(P).width();
            }
        },
        _genShape: function(O, N) {
            var P = f++;
            N.unshift(P);
            return new A(this, P, O, N);
        },
        appendShape: function(N) {
            alert("appendShape not implemented");
        },
        replaceWithShape: function(O, N) {
            alert("replaceWithShape not implemented");
        },
        insertAfterShape: function(O, N) {
            alert("insertAfterShape not implemented");
        },
        removeShapeId: function(N) {
            alert("removeShapeId not implemented");
        },
        getShapeAt: function(O, N, P) {
            alert("getShapeAt not implemented");
        },
        render: function() {
            alert("render not implemented");
        }
    });
    C = I(k, {
        init: function(P, N, Q, O) {
            C._super.init.call(this, P, N, Q);
            this.canvas = document.createElement("canvas");
            if (Q[0]) {
                Q = Q[0];
            }
            j.data(Q, "_jqs_vcanvas", this);
            j(this.canvas).css({
                display: "inline-block",
                width: P,
                height: N,
                verticalAlign: "top"
            });
            this._insert(this.canvas, Q);
            this._calculatePixelDims(P, N, this.canvas);
            this.canvas.width = this.pixelWidth;
            this.canvas.height = this.pixelHeight;
            this.interact = O;
            this.shapes = {};
            this.shapeseq = [];
            this.currentTargetShapeId = undefined;
            j(this.canvas).css({
                width: this.pixelWidth,
                height: this.pixelHeight
            });
        },
        _getContext: function(P, Q, N) {
            var O = this.canvas.getContext("2d");
            if (P !== undefined) {
                O.strokeStyle = P;
            }
            O.lineWidth = N === undefined ? 1 : N;
            if (Q !== undefined) {
                O.fillStyle = Q;
            }
            return O;
        },
        reset: function() {
            var N = this._getContext();
            N.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
            this.shapes = {};
            this.shapeseq = [];
            this.currentTargetShapeId = undefined;
        },
        _drawShape: function(T, S, R, U, N) {
            var P = this._getContext(R, U, N), O, Q;
            P.beginPath();
            P.moveTo(S[0][0] + .5, S[0][1] + .5);
            for (O = 1, Q = S.length; O < Q; O++) {
                P.lineTo(S[O][0] + .5, S[O][1] + .5);
            }
            if (R !== undefined) {
                P.stroke();
            }
            if (U !== undefined) {
                P.fill();
            }
            if (this.targetX !== undefined && this.targetY !== undefined && P.isPointInPath(this.targetX, this.targetY)) {
                this.currentTargetShapeId = T;
            }
        },
        _drawCircle: function(S, P, U, O, R, T, N) {
            var Q = this._getContext(R, T, N);
            Q.beginPath();
            Q.arc(P, U, O, 0, 2 * Math.PI, false);
            if (this.targetX !== undefined && this.targetY !== undefined && Q.isPointInPath(this.targetX, this.targetY)) {
                this.currentTargetShapeId = S;
            }
            if (R !== undefined) {
                Q.stroke();
            }
            if (T !== undefined) {
                Q.fill();
            }
        },
        _drawPieSlice: function(R, V, T, Q, S, P, U, O) {
            var N = this._getContext(U, O);
            N.beginPath();
            N.moveTo(V, T);
            N.arc(V, T, Q, S, P, false);
            N.lineTo(V, T);
            N.closePath();
            if (U !== undefined) {
                N.stroke();
            }
            if (O) {
                N.fill();
            }
            if (this.targetX !== undefined && this.targetY !== undefined && N.isPointInPath(this.targetX, this.targetY)) {
                this.currentTargetShapeId = R;
            }
        },
        _drawRect: function(R, O, T, P, N, Q, S) {
            return this._drawShape(R, [ [ O, T ], [ O + P, T ], [ O + P, T + N ], [ O, T + N ], [ O, T ] ], Q, S);
        },
        appendShape: function(N) {
            this.shapes[N.id] = N;
            this.shapeseq.push(N.id);
            this.lastShapeId = N.id;
            return N.id;
        },
        replaceWithShape: function(P, N) {
            var Q = this.shapeseq, O;
            this.shapes[N.id] = N;
            for (O = Q.length; O--; ) {
                if (Q[O] == P) {
                    Q[O] = N.id;
                }
            }
            delete this.shapes[P];
        },
        replaceWithShapes: function(P, O) {
            var T = this.shapeseq, R = {}, N, Q, S;
            for (Q = P.length; Q--; ) {
                R[P[Q]] = true;
            }
            for (Q = T.length; Q--; ) {
                N = T[Q];
                if (R[N]) {
                    T.splice(Q, 1);
                    delete this.shapes[N];
                    S = Q;
                }
            }
            for (Q = O.length; Q--; ) {
                T.splice(S, 0, O[Q].id);
                this.shapes[O[Q].id] = O[Q];
            }
        },
        insertAfterShape: function(P, N) {
            var Q = this.shapeseq, O;
            for (O = Q.length; O--; ) {
                if (Q[O] === P) {
                    Q.splice(O + 1, 0, N.id);
                    this.shapes[N.id] = N;
                    return;
                }
            }
        },
        removeShapeId: function(O) {
            var P = this.shapeseq, N;
            for (N = P.length; N--; ) {
                if (P[N] === O) {
                    P.splice(N, 1);
                    break;
                }
            }
            delete this.shapes[O];
        },
        getShapeAt: function(O, N, P) {
            this.targetX = N;
            this.targetY = P;
            this.render();
            return this.currentTargetShapeId;
        },
        render: function() {
            var T = this.shapeseq, N = this.shapes, R = T.length, Q = this._getContext(), S, O, P;
            Q.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
            for (P = 0; P < R; P++) {
                S = T[P];
                O = N[S];
                this["_draw" + O.type].apply(this, O.args);
            }
            if (!this.interact) {
                this.shapes = {};
                this.shapeseq = [];
            }
        }
    });
    z = I(k, {
        init: function(O, N, Q) {
            var P;
            z._super.init.call(this, O, N, Q);
            if (Q[0]) {
                Q = Q[0];
            }
            j.data(Q, "_jqs_vcanvas", this);
            this.canvas = document.createElement("span");
            j(this.canvas).css({
                display: "inline-block",
                position: "relative",
                overflow: "hidden",
                width: O,
                height: N,
                margin: "0px",
                padding: "0px",
                verticalAlign: "top"
            });
            this._insert(this.canvas, Q);
            this._calculatePixelDims(O, N, this.canvas);
            this.canvas.width = this.pixelWidth;
            this.canvas.height = this.pixelHeight;
            P = '<v:group coordorigin="0 0" coordsize="' + this.pixelWidth + " " + this.pixelHeight + '" style="position:absolute;top:0;left:0;width:' + this.pixelWidth + "px;height=" + this.pixelHeight + 'px;"></v:group>';
            this.canvas.insertAdjacentHTML("beforeEnd", P);
            this.group = j(this.canvas).children()[0];
            this.rendered = false;
            this.prerender = "";
        },
        _drawShape: function(S, Z, U, N, Q) {
            var V = [], T, Y, X, R, W, O, P;
            for (P = 0, O = Z.length; P < O; P++) {
                V[P] = "" + Z[P][0] + "," + Z[P][1];
            }
            T = V.splice(0, 1);
            Q = Q === undefined ? 1 : Q;
            Y = U === undefined ? ' stroked="false" ' : ' strokeWeight="' + Q + 'px" strokeColor="' + U + '" ';
            X = N === undefined ? ' filled="false"' : ' fillColor="' + N + '" filled="true" ';
            R = V[0] === V[V.length - 1] ? "x " : "";
            W = '<v:shape coordorigin="0 0" coordsize="' + this.pixelWidth + " " + this.pixelHeight + '"  id="jqsshape' + S + '" ' + Y + X + ' style="position:absolute;left:0px;top:0px;height:' + this.pixelHeight + "px;width:" + this.pixelWidth + 'px;padding:0px;margin:0px;"  path="m ' + T + " l " + V.join(", ") + " " + R + 'e"> </v:shape>';
            return W;
        },
        _drawCircle: function(Q, T, R, P, S, N, O) {
            var W, V, U;
            T -= P;
            R -= P;
            W = S === undefined ? ' stroked="false" ' : ' strokeWeight="' + O + 'px" strokeColor="' + S + '" ';
            V = N === undefined ? ' filled="false"' : ' fillColor="' + N + '" filled="true" ';
            U = '<v:oval  id="jqsshape' + Q + '" ' + W + V + ' style="position:absolute;top:' + R + "px; left:" + T + "px; width:" + P * 2 + "px; height:" + P * 2 + 'px"></v:oval>';
            return U;
        },
        _drawPieSlice: function(U, Z, X, T, V, Q, Y, P) {
            var W, O, N, S, R, ac, ab, aa;
            if (V === Q) {
                return "";
            }
            if (Q - V === 2 * Math.PI) {
                V = 0;
                Q = 2 * Math.PI;
            }
            O = Z + Math.round(Math.cos(V) * T);
            N = X + Math.round(Math.sin(V) * T);
            S = Z + Math.round(Math.cos(Q) * T);
            R = X + Math.round(Math.sin(Q) * T);
            if (O === S && N === R) {
                if (Q - V < Math.PI) {
                    return "";
                }
                O = S = Z + T;
                N = R = X;
            }
            if (O === S && N === R && Q - V < Math.PI) {
                return "";
            }
            W = [ Z - T, X - T, Z + T, X + T, O, N, S, R ];
            ac = Y === undefined ? ' stroked="false" ' : ' strokeWeight="1px" strokeColor="' + Y + '" ';
            ab = P === undefined ? ' filled="false"' : ' fillColor="' + P + '" filled="true" ';
            aa = '<v:shape coordorigin="0 0" coordsize="' + this.pixelWidth + " " + this.pixelHeight + '"  id="jqsshape' + U + '" ' + ac + ab + ' style="position:absolute;left:0px;top:0px;height:' + this.pixelHeight + "px;width:" + this.pixelWidth + 'px;padding:0px;margin:0px;"  path="m ' + Z + "," + X + " wa " + W.join(", ") + ' x e"> </v:shape>';
            return aa;
        },
        _drawRect: function(R, O, T, P, N, Q, S) {
            return this._drawShape(R, [ [ O, T ], [ O, T + N ], [ O + P, T + N ], [ O + P, T ], [ O, T ] ], Q, S);
        },
        reset: function() {
            this.group.innerHTML = "";
        },
        appendShape: function(N) {
            var O = this["_draw" + N.type].apply(this, N.args);
            if (this.rendered) {
                this.group.insertAdjacentHTML("beforeEnd", O);
            } else {
                this.prerender += O;
            }
            this.lastShapeId = N.id;
            return N.id;
        },
        replaceWithShape: function(Q, N) {
            var P = j("#jqsshape" + Q), O = this["_draw" + N.type].apply(this, N.args);
            P[0].outerHTML = O;
        },
        replaceWithShapes: function(O, N) {
            var R = j("#jqsshape" + O[0]), Q = "", S = N.length, P;
            for (P = 0; P < S; P++) {
                Q += this["_draw" + N[P].type].apply(this, N[P].args);
            }
            R[0].outerHTML = Q;
            for (P = 1; P < O.length; P++) {
                j("#jqsshape" + O[P]).remove();
            }
        },
        insertAfterShape: function(Q, N) {
            var P = j("#jqsshape" + Q), O = this["_draw" + N.type].apply(this, N.args);
            P[0].insertAdjacentHTML("afterEnd", O);
        },
        removeShapeId: function(O) {
            var N = j("#jqsshape" + O);
            this.group.removeChild(N[0]);
        },
        getShapeAt: function(O, N, Q) {
            var P = O.id.substr(8);
            return P;
        },
        render: function() {
            if (!this.rendered) {
                this.group.innerHTML = this.prerender;
                this.rendered = true;
            }
        }
    });
});

var q = null;

window.PR_SHOULD_USE_CONTINUATION = !0;

(function() {
    function d(G) {
        function w(K) {
            var L = K.charCodeAt(0);
            if (L !== 92) {
                return L;
            }
            var J = K.charAt(1);
            return (L = k[J]) ? L : "0" <= J && J <= "7" ? parseInt(K.substring(1), 8) : J === "u" || J === "x" ? parseInt(K.substring(2), 16) : K.charCodeAt(1);
        }
        function D(J) {
            if (J < 32) {
                return (J < 16 ? "\\x0" : "\\x") + J.toString(16);
            }
            J = String.fromCharCode(J);
            if (J === "\\" || J === "-" || J === "[" || J === "]") {
                J = "\\" + J;
            }
            return J;
        }
        function B(K) {
            for (var N = K.substring(1, K.length - 1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g), K = [], J = [], R = N[0] === "^", S = R ? 1 : 0, M = N.length; S < M; ++S) {
                var L = N[S];
                if (/\\[bdsw]/i.test(L)) {
                    K.push(L);
                } else {
                    var L = w(L), O;
                    S + 2 < M && "-" === N[S + 1] ? (O = w(N[S + 2]), S += 2) : O = L;
                    J.push([ L, O ]);
                    O < 65 || L > 122 || (O < 65 || L > 90 || J.push([ Math.max(65, L) | 32, Math.min(O, 90) | 32 ]), 
                    O < 97 || L > 122 || J.push([ Math.max(97, L) & -33, Math.min(O, 122) & -33 ]));
                }
            }
            J.sort(function(T, U) {
                return T[0] - U[0] || U[1] - T[1];
            });
            N = [];
            L = [ NaN, NaN ];
            for (S = 0; S < J.length; ++S) {
                M = J[S], M[0] <= L[1] + 1 ? L[1] = Math.max(L[1], M[1]) : N.push(L = M);
            }
            J = [ "[" ];
            R && J.push("^");
            J.push.apply(J, K);
            for (S = 0; S < N.length; ++S) {
                M = N[S], J.push(D(M[0])), M[1] > M[0] && (M[1] + 1 > M[0] && J.push("-"), J.push(D(M[1])));
            }
            J.push("]");
            return J.join("");
        }
        function F(K) {
            for (var N = K.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g), J = N.length, O = [], R = 0, M = 0; R < J; ++R) {
                var L = N[R];
                L === "(" ? ++M : "\\" === L.charAt(0) && (L = +L.substring(1)) && L <= M && (O[L] = -1);
            }
            for (R = 1; R < O.length; ++R) {
                -1 === O[R] && (O[R] = ++H);
            }
            for (M = R = 0; R < J; ++R) {
                L = N[R], L === "(" ? (++M, O[M] === void 0 && (N[R] = "(?:")) : "\\" === L.charAt(0) && (L = +L.substring(1)) && L <= M && (N[R] = "\\" + O[M]);
            }
            for (M = R = 0; R < J; ++R) {
                "^" === N[R] && "^" !== N[R + 1] && (N[R] = "");
            }
            if (K.ignoreCase && I) {
                for (R = 0; R < J; ++R) {
                    L = N[R], K = L.charAt(0), L.length >= 2 && K === "[" ? N[R] = B(L) : K !== "\\" && (N[R] = L.replace(/[A-Za-z]/g, function(S) {
                        S = S.charCodeAt(0);
                        return "[" + String.fromCharCode(S & -33, S | 32) + "]";
                    }));
                }
            }
            return N.join("");
        }
        for (var H = 0, I = !1, A = !1, u = 0, E = G.length; u < E; ++u) {
            var C = G[u];
            if (C.ignoreCase) {
                A = !0;
            } else {
                if (/[a-z]/i.test(C.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi, ""))) {
                    I = !0;
                    A = !1;
                    break;
                }
            }
        }
        for (var k = {
            b: 8,
            t: 9,
            n: 10,
            v: 11,
            f: 12,
            r: 13
        }, v = [], u = 0, E = G.length; u < E; ++u) {
            C = G[u];
            if (C.global || C.multiline) {
                throw Error("" + C);
            }
            v.push("(?:" + F(C) + ")");
        }
        return RegExp(v.join("|"), A ? "gi" : "g");
    }
    function c(C) {
        function u(F) {
            switch (F.nodeType) {
              case 1:
                if (A.test(F.className)) {
                    break;
                }
                for (var G = F.firstChild; G; G = G.nextSibling) {
                    u(G);
                }
                G = F.nodeName;
                if ("BR" === G || "LI" === G) {
                    w[E] = "\n", D[E << 1] = B++, D[E++ << 1 | 1] = F;
                }
                break;

              case 3:
              case 4:
                G = F.nodeValue, G.length && (G = k ? G.replace(/\r\n?/g, "\n") : G.replace(/[\t\n\r ]+/g, " "), 
                w[E] = G, D[E << 1] = B, B += G.length, D[E++ << 1 | 1] = F);
            }
        }
        var A = /(?:^|\s)nocode(?:\s|$)/, w = [], B = 0, D = [], E = 0, v;
        C.currentStyle ? v = C.currentStyle.whiteSpace : window.getComputedStyle && (v = document.defaultView.getComputedStyle(C, q).getPropertyValue("white-space"));
        var k = v && "pre" === v.substring(0, 3);
        u(C);
        return {
            a: w.join("").replace(/\n$/, ""),
            c: D
        };
    }
    function z(u, k, w, v) {
        k && (u = {
            a: k,
            d: u
        }, w(u), v.push.apply(v, u.e));
    }
    function h(u, k) {
        function A(S) {
            for (var G = S.d, D = [ G, "pln" ], M = 0, K = S.a.match(B) || [], C = {}, F = 0, O = K.length; F < O; ++F) {
                var L = K[F], R = C[L], E = void 0, N;
                if (typeof R === "string") {
                    N = !1;
                } else {
                    var J = w[L.charAt(0)];
                    if (J) {
                        E = L.match(J[1]), R = J[0];
                    } else {
                        for (N = 0; N < v; ++N) {
                            if (J = k[N], E = L.match(J[1])) {
                                R = J[0];
                                break;
                            }
                        }
                        E || (R = "pln");
                    }
                    if ((N = R.length >= 5 && "lang-" === R.substring(0, 5)) && !(E && typeof E[1] === "string")) {
                        N = !1, R = "src";
                    }
                    N || (C[L] = R);
                }
                J = M;
                M += L.length;
                if (N) {
                    N = E[1];
                    var I = L.indexOf(N), H = I + N.length;
                    E[2] && (H = L.length - E[2].length, I = H - N.length);
                    R = R.substring(5);
                    z(G + J, L.substring(0, I), A, D);
                    z(G + J + I, N, t(R, N), D);
                    z(G + J + H, L.substring(H), A, D);
                } else {
                    D.push(G + J, R);
                }
            }
            S.e = D;
        }
        var w = {}, B;
        (function() {
            for (var H = u.concat(k), C = [], G = {}, I = 0, F = H.length; I < F; ++I) {
                var E = H[I], J = E[3];
                if (J) {
                    for (var D = J.length; --D >= 0; ) {
                        w[J.charAt(D)] = E;
                    }
                }
                E = E[1];
                J = "" + E;
                G.hasOwnProperty(J) || (C.push(E), G[J] = q);
            }
            C.push(/[\S\s]/);
            B = d(C);
        })();
        var v = k.length;
        return A;
    }
    function p(u) {
        var k = [], w = [];
        u.tripleQuotedStrings ? k.push([ "str", /^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/, q, "'\"" ]) : u.multiLineStrings ? k.push([ "str", /^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/, q, "'\"`" ]) : k.push([ "str", /^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/, q, "\"'" ]);
        u.verbatimStrings && w.push([ "str", /^@"(?:[^"]|"")*(?:"|$)/, q ]);
        var v = u.hashComments;
        v && (u.cStyleComments ? (v > 1 ? k.push([ "com", /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, q, "#" ]) : k.push([ "com", /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\n\r]*)/, q, "#" ]), 
        w.push([ "str", /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/, q ])) : k.push([ "com", /^#[^\n\r]*/, q, "#" ]));
        u.cStyleComments && (w.push([ "com", /^\/\/[^\n\r]*/, q ]), w.push([ "com", /^\/\*[\S\s]*?(?:\*\/|$)/, q ]));
        u.regexLiterals && w.push([ "lang-regex", /^(?:^^\.?|[!+-]|!=|!==|#|%|%=|&|&&|&&=|&=|\(|\*|\*=|\+=|,|-=|->|\/|\/=|:|::|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|[?@[^]|\^=|\^\^|\^\^=|{|\||\|=|\|\||\|\|=|~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\s*(\/(?=[^*/])(?:[^/[\\]|\\[\S\s]|\[(?:[^\\\]]|\\[\S\s])*(?:]|$))+\/)/ ]);
        (v = u.types) && w.push([ "typ", v ]);
        u = ("" + u.keywords).replace(/^ | $/g, "");
        u.length && w.push([ "kwd", RegExp("^(?:" + u.replace(/[\s,]+/g, "|") + ")\\b"), q ]);
        k.push([ "pln", /^\s+/, q, " \r\n\t " ]);
        w.push([ "lit", /^@[$_a-z][\w$@]*/i, q ], [ "typ", /^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/, q ], [ "pln", /^[$_a-z][\w$@]*/i, q ], [ "lit", /^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i, q, "0123456789" ], [ "pln", /^\\[\S\s]?/, q ], [ "pun", /^.[^\s\w"-$'./@\\`]*/, q ]);
        return h(k, w);
    }
    function s(I, A) {
        function F(L) {
            switch (L.nodeType) {
              case 1:
                if (C.test(L.className)) {
                    break;
                }
                if ("BR" === L.nodeName) {
                    D(L), L.parentNode && L.parentNode.removeChild(L);
                } else {
                    for (L = L.firstChild; L; L = L.nextSibling) {
                        F(L);
                    }
                }
                break;

              case 3:
              case 4:
                if (v) {
                    var k = L.nodeValue, M = k.match(J);
                    if (M) {
                        var N = k.substring(0, M.index);
                        L.nodeValue = N;
                        (k = k.substring(M.index + M[0].length)) && L.parentNode.insertBefore(K.createTextNode(k), L.nextSibling);
                        D(L);
                        N || L.parentNode.removeChild(L);
                    }
                }
            }
        }
        function D(L) {
            function k(N, U) {
                var T = U ? N.cloneNode(!1) : N, S = N.parentNode;
                if (S) {
                    var S = k(S, 1), R = N.nextSibling;
                    S.appendChild(T);
                    for (var O = R; O; O = R) {
                        R = O.nextSibling, S.appendChild(O);
                    }
                }
                return T;
            }
            for (;!L.nextSibling; ) {
                if (L = L.parentNode, !L) {
                    return;
                }
            }
            for (var L = k(L.nextSibling, 0), M; (M = L.parentNode) && M.nodeType === 1; ) {
                L = M;
            }
            G.push(L);
        }
        var C = /(?:^|\s)nocode(?:\s|$)/, J = /\r\n?|\n/, K = I.ownerDocument, B;
        I.currentStyle ? B = I.currentStyle.whiteSpace : window.getComputedStyle && (B = K.defaultView.getComputedStyle(I, q).getPropertyValue("white-space"));
        var v = B && "pre" === B.substring(0, 3);
        for (B = K.createElement("LI"); I.firstChild; ) {
            B.appendChild(I.firstChild);
        }
        for (var G = [ B ], E = 0; E < G.length; ++E) {
            F(G[E]);
        }
        A === (A | 0) && G[0].setAttribute("value", A);
        var u = K.createElement("OL");
        u.className = "linenums";
        for (var w = Math.max(0, A - 1 | 0) || 0, E = 0, H = G.length; E < H; ++E) {
            B = G[E], B.className = "L" + (E + w) % 10, B.firstChild || B.appendChild(K.createTextNode(" ")), 
            u.appendChild(B);
        }
        I.appendChild(u);
    }
    function Q(u, k) {
        for (var w = k.length; --w >= 0; ) {
            var v = k[w];
            P.hasOwnProperty(v) ? window.console && console.warn("cannot override language handler %s", v) : P[v] = u;
        }
    }
    function t(u, k) {
        if (!u || !P.hasOwnProperty(u)) {
            u = /^\s*</.test(k) ? "default-markup" : "default-code";
        }
        return P[u];
    }
    function r(Z) {
        var L = Z.g;
        try {
            var V = c(Z.h), S = V.a;
            Z.a = S;
            Z.c = V.c;
            Z.d = 0;
            t(L, S)(Z);
            var N = /\bMSIE\b/.test(navigator.userAgent), L = /\n/g, F = Z.a, G = F.length, V = 0, M = Z.c, I = M.length, S = 0, W = Z.e, T = W.length, Z = 0;
            W[T] = G;
            var H, K;
            for (K = H = 0; K < T; ) {
                W[K] !== W[K + 2] ? (W[H++] = W[K++], W[H++] = W[K++]) : K += 2;
            }
            T = H;
            for (K = H = 0; K < T; ) {
                for (var A = W[K], U = W[K + 1], Y = K + 2; Y + 2 <= T && W[Y + 1] === U; ) {
                    Y += 2;
                }
                W[H++] = A;
                W[H++] = U;
                K = Y;
            }
            for (W.length = H; S < I; ) {
                var J = M[S + 2] || G, X = W[Z + 2] || G, Y = Math.min(J, X), R = M[S + 1], O;
                if (R.nodeType !== 1 && (O = F.substring(V, Y))) {
                    N && (O = O.replace(L, "\r"));
                    R.nodeValue = O;
                    var E = R.ownerDocument, D = E.createElement("SPAN");
                    D.className = W[Z + 1];
                    var B = R.parentNode;
                    B.replaceChild(D, R);
                    D.appendChild(R);
                    V < J && (M[S + 1] = R = E.createTextNode(F.substring(Y, J)), B.insertBefore(R, D.nextSibling));
                }
                V = Y;
                V >= J && (S += 2);
                V >= X && (Z += 2);
            }
        } catch (C) {
            "console" in window && console.log(C && C.stack ? C.stack : C);
        }
    }
    var n = [ "break,continue,do,else,for,if,return,while" ], l = [ [ n, "auto,case,char,const,default,double,enum,extern,float,goto,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile" ], "catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof" ], o = [ l, "alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,dynamic_cast,explicit,export,friend,inline,late_check,mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where" ], m = [ l, "abstract,boolean,byte,extends,final,finally,implements,import,instanceof,null,native,package,strictfp,super,synchronized,throws,transient" ], j = [ m, "as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,interface,internal,into,is,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var" ], l = [ l, "debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN" ], g = [ n, "and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None" ], f = [ n, "alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END" ], n = [ n, "case,done,elif,esac,eval,fi,function,in,local,set,then,until" ], e = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/, b = /\S/, a = p({
        keywords: [ o, j, l, "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END" + g, f, n ],
        hashComments: !0,
        cStyleComments: !0,
        multiLineStrings: !0,
        regexLiterals: !0
    }), P = {};
    Q(a, [ "default-code" ]);
    Q(h([], [ [ "pln", /^[^<?]+/ ], [ "dec", /^<!\w[^>]*(?:>|$)/ ], [ "com", /^<\!--[\S\s]*?(?:--\>|$)/ ], [ "lang-", /^<\?([\S\s]+?)(?:\?>|$)/ ], [ "lang-", /^<%([\S\s]+?)(?:%>|$)/ ], [ "pun", /^(?:<[%?]|[%?]>)/ ], [ "lang-", /^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i ], [ "lang-js", /^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i ], [ "lang-css", /^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i ], [ "lang-in.tag", /^(<\/?[a-z][^<>]*>)/i ] ]), [ "default-markup", "htm", "html", "mxml", "xhtml", "xml", "xsl" ]);
    Q(h([ [ "pln", /^\s+/, q, " \t\r\n" ], [ "atv", /^(?:"[^"]*"?|'[^']*'?)/, q, "\"'" ] ], [ [ "tag", /^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i ], [ "atn", /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i ], [ "lang-uq.val", /^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/ ], [ "pun", /^[/<->]+/ ], [ "lang-js", /^on\w+\s*=\s*"([^"]+)"/i ], [ "lang-js", /^on\w+\s*=\s*'([^']+)'/i ], [ "lang-js", /^on\w+\s*=\s*([^\s"'>]+)/i ], [ "lang-css", /^style\s*=\s*"([^"]+)"/i ], [ "lang-css", /^style\s*=\s*'([^']+)'/i ], [ "lang-css", /^style\s*=\s*([^\s"'>]+)/i ] ]), [ "in.tag" ]);
    Q(h([], [ [ "atv", /^[\S\s]+/ ] ]), [ "uq.val" ]);
    Q(p({
        keywords: o,
        hashComments: !0,
        cStyleComments: !0,
        types: e
    }), [ "c", "cc", "cpp", "cxx", "cyc", "m" ]);
    Q(p({
        keywords: "null,true,false"
    }), [ "json" ]);
    Q(p({
        keywords: j,
        hashComments: !0,
        cStyleComments: !0,
        verbatimStrings: !0,
        types: e
    }), [ "cs" ]);
    Q(p({
        keywords: m,
        cStyleComments: !0
    }), [ "java" ]);
    Q(p({
        keywords: n,
        hashComments: !0,
        multiLineStrings: !0
    }), [ "bsh", "csh", "sh" ]);
    Q(p({
        keywords: g,
        hashComments: !0,
        multiLineStrings: !0,
        tripleQuotedStrings: !0
    }), [ "cv", "py" ]);
    Q(p({
        keywords: "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",
        hashComments: !0,
        multiLineStrings: !0,
        regexLiterals: !0
    }), [ "perl", "pl", "pm" ]);
    Q(p({
        keywords: f,
        hashComments: !0,
        multiLineStrings: !0,
        regexLiterals: !0
    }), [ "rb" ]);
    Q(p({
        keywords: l,
        cStyleComments: !0,
        regexLiterals: !0
    }), [ "js" ]);
    Q(p({
        keywords: "all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,true,try,unless,until,when,while,yes",
        hashComments: 3,
        cStyleComments: !0,
        multilineStrings: !0,
        tripleQuotedStrings: !0,
        regexLiterals: !0
    }), [ "coffee" ]);
    Q(h([], [ [ "str", /^[\S\s]+/ ] ]), [ "regex" ]);
    window.prettyPrintOne = function(u, k, w) {
        var v = document.createElement("PRE");
        v.innerHTML = u;
        w && s(v, w);
        r({
            g: k,
            i: w,
            h: v
        });
        return v.innerHTML;
    };
    window.prettyPrint = function(F) {
        function v() {
            for (var M = window.PR_SHOULD_USE_CONTINUATION ? w.now() + 250 : Infinity; u < B.length && w.now() < M; u++) {
                var R = B[u], J = R.className;
                if (J.indexOf("prettyprint") >= 0) {
                    var J = J.match(C), L, I;
                    if (I = !J) {
                        I = R;
                        for (var N = void 0, O = I.firstChild; O; O = O.nextSibling) {
                            var K = O.nodeType, N = K === 1 ? N ? I : O : K === 3 ? b.test(O.nodeValue) ? I : N : N;
                        }
                        I = (L = N === I ? void 0 : N) && "CODE" === L.tagName;
                    }
                    I && (J = L.className.match(C));
                    J && (J = J[1]);
                    I = !1;
                    for (N = R.parentNode; N; N = N.parentNode) {
                        if ((N.tagName === "pre" || N.tagName === "code" || N.tagName === "xmp") && N.className && N.className.indexOf("prettyprint") >= 0) {
                            I = !0;
                            break;
                        }
                    }
                    I || ((I = (I = R.className.match(/\blinenums\b(?::(\d+))?/)) ? I[1] && I[1].length ? +I[1] : !0 : !1) && s(R, I), 
                    E = {
                        g: J,
                        h: R,
                        i: I
                    }, r(E));
                }
            }
            u < B.length ? setTimeout(v, 250) : F && F();
        }
        for (var D = [ document.getElementsByTagName("pre"), document.getElementsByTagName("code"), document.getElementsByTagName("xmp") ], B = [], A = 0; A < D.length; ++A) {
            for (var G = 0, H = D[A].length; G < H; ++G) {
                B.push(D[A][G]);
            }
        }
        var D = q, w = Date;
        w.now || (w = {
            now: function() {
                return +new Date();
            }
        });
        var u = 0, E, C = /\blang(?:uage)?-([\w.]+)(?!\S)/;
        v();
    };
    window.PR = {
        createSimpleLexer: h,
        registerLangHandler: Q,
        sourceDecorator: p,
        PR_ATTRIB_NAME: "atn",
        PR_ATTRIB_VALUE: "atv",
        PR_COMMENT: "com",
        PR_DECLARATION: "dec",
        PR_KEYWORD: "kwd",
        PR_LITERAL: "lit",
        PR_NOCODE: "nocode",
        PR_PLAIN: "pln",
        PR_PUNCTUATION: "pun",
        PR_SOURCE: "src",
        PR_STRING: "str",
        PR_TAG: "tag",
        PR_TYPE: "typ"
    };
})();

var wysihtml5 = {
    version: "0.3.0",
    commands: {},
    dom: {},
    quirks: {},
    toolbar: {},
    lang: {},
    selection: {},
    views: {},
    INVISIBLE_SPACE: "\ufeff",
    EMPTY_FUNCTION: function() {},
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    BACKSPACE_KEY: 8,
    ENTER_KEY: 13,
    ESCAPE_KEY: 27,
    SPACE_KEY: 32,
    DELETE_KEY: 46
};

window.rangy = function() {
    var k = "object", g = "function", D = "undefined";
    var l = [ "startContainer", "startOffset", "endContainer", "endOffset", "collapsed", "commonAncestorContainer", "START_TO_START", "START_TO_END", "END_TO_START", "END_TO_END" ];
    var c = [ "setStart", "setStartBefore", "setStartAfter", "setEnd", "setEndBefore", "setEndAfter", "collapse", "selectNode", "selectNodeContents", "compareBoundaryPoints", "deleteContents", "extractContents", "cloneContents", "insertNode", "surroundContents", "cloneRange", "toString", "detach" ];
    var t = [ "boundingHeight", "boundingLeft", "boundingTop", "boundingWidth", "htmlText", "text" ];
    var p = [ "collapse", "compareEndPoints", "duplicate", "getBookmark", "moveToBookmark", "moveToElementText", "parentElement", "pasteHTML", "select", "setEndPoint", "getBoundingClientRect" ];
    function j(G, F) {
        var E = typeof G[F];
        return E == g || !!(E == k && G[F]) || E == "unknown";
    }
    function d(F, E) {
        return !!(typeof F[E] == k && F[E]);
    }
    function r(F, E) {
        return typeof F[E] != D;
    }
    function m(E) {
        return function(H, G) {
            var F = G.length;
            while (F--) {
                if (!E(H, G[F])) {
                    return false;
                }
            }
            return true;
        };
    }
    var o = m(j);
    var s = m(d);
    var C = m(r);
    function w(E) {
        return E && o(E, p) && C(E, t);
    }
    var n = {
        version: "1.2.2",
        initialized: false,
        supported: true,
        util: {
            isHostMethod: j,
            isHostObject: d,
            isHostProperty: r,
            areHostMethods: o,
            areHostObjects: s,
            areHostProperties: C,
            isTextRange: w
        },
        features: {},
        modules: {},
        config: {
            alertOnWarn: false,
            preferTextRange: false
        }
    };
    function f(E) {
        window.alert("Rangy not supported in your browser. Reason: " + E);
        n.initialized = true;
        n.supported = false;
    }
    n.fail = f;
    function v(F) {
        var E = "Rangy warning: " + F;
        if (n.config.alertOnWarn) {
            window.alert(E);
        } else {
            if (typeof window.console != D && typeof window.console.log != D) {
                window.console.log(E);
            }
        }
    }
    n.warn = v;
    if ({}.hasOwnProperty) {
        n.util.extend = function(G, F) {
            for (var E in F) {
                if (F.hasOwnProperty(E)) {
                    G[E] = F[E];
                }
            }
        };
    } else {
        f("hasOwnProperty not supported");
    }
    var z = [];
    var a = [];
    function u() {
        if (n.initialized) {
            return;
        }
        var G;
        var K = false, L = false;
        if (j(document, "createRange")) {
            G = document.createRange();
            if (o(G, c) && C(G, l)) {
                K = true;
            }
            G.detach();
        }
        var F = d(document, "body") ? document.body : document.getElementsByTagName("body")[0];
        if (F && j(F, "createTextRange")) {
            G = F.createTextRange();
            if (w(G)) {
                L = true;
            }
        }
        if (!K && !L) {
            f("Neither Range nor TextRange are implemented");
        }
        n.initialized = true;
        n.features = {
            implementsDomRange: K,
            implementsTextRange: L
        };
        var J = a.concat(z);
        for (var I = 0, E = J.length; I < E; ++I) {
            try {
                J[I](n);
            } catch (H) {
                if (d(window, "console") && j(window.console, "log")) {
                    window.console.log("Init listener threw an exception. Continuing.", H);
                }
            }
        }
    }
    n.init = u;
    n.addInitListener = function(E) {
        if (n.initialized) {
            E(n);
        } else {
            z.push(E);
        }
    };
    var A = [];
    n.addCreateMissingNativeApiListener = function(E) {
        A.push(E);
    };
    function e(G) {
        G = G || window;
        u();
        for (var F = 0, E = A.length; F < E; ++F) {
            A[F](G);
        }
    }
    n.createMissingNativeApi = e;
    function B(E) {
        this.name = E;
        this.initialized = false;
        this.supported = false;
    }
    B.prototype.fail = function(E) {
        this.initialized = true;
        this.supported = false;
        throw new Error("Module '" + this.name + "' failed to load: " + E);
    };
    B.prototype.warn = function(E) {
        n.warn("Module " + this.name + ": " + E);
    };
    B.prototype.createError = function(E) {
        return new Error("Error in Rangy " + this.name + " module: " + E);
    };
    n.createModule = function(E, G) {
        var F = new B(E);
        n.modules[E] = F;
        a.push(function(H) {
            G(H, F);
            F.initialized = true;
            F.supported = true;
        });
    };
    n.requireModules = function(G) {
        for (var I = 0, E = G.length, H, F; I < E; ++I) {
            F = G[I];
            H = n.modules[F];
            if (!H || !(H instanceof B)) {
                throw new Error("Module '" + F + "' not found");
            }
            if (!H.supported) {
                throw new Error("Module '" + F + "' not supported");
            }
        }
    };
    var b = false;
    var h = function(E) {
        if (!b) {
            b = true;
            if (!n.initialized) {
                u();
            }
        }
    };
    if (typeof window == D) {
        f("No window found");
        return;
    }
    if (typeof document == D) {
        f("No document found");
        return;
    }
    if (j(document, "addEventListener")) {
        document.addEventListener("DOMContentLoaded", h, false);
    }
    if (j(window, "addEventListener")) {
        window.addEventListener("load", h, false);
    } else {
        if (j(window, "attachEvent")) {
            window.attachEvent("onload", h);
        } else {
            f("Window does not have required addEventListener or attachEvent method");
        }
    }
    return n;
}();

rangy.createModule("DomUtil", function(r, d) {
    var v = "undefined";
    var b = r.util;
    if (!b.areHostMethods(document, [ "createDocumentFragment", "createElement", "createTextNode" ])) {
        d.fail("document missing a Node creation method");
    }
    if (!b.isHostMethod(document, "getElementsByTagName")) {
        d.fail("document missing getElementsByTagName method");
    }
    var e = document.createElement("div");
    if (!b.areHostMethods(e, [ "insertBefore", "appendChild", "cloneNode" ] || !b.areHostObjects(e, [ "previousSibling", "nextSibling", "childNodes", "parentNode" ]))) {
        d.fail("Incomplete Element implementation");
    }
    if (!b.isHostProperty(e, "innerHTML")) {
        d.fail("Element is missing innerHTML property");
    }
    var u = document.createTextNode("test");
    if (!b.areHostMethods(u, [ "splitText", "deleteData", "insertData", "appendData", "cloneNode" ] || !b.areHostObjects(e, [ "previousSibling", "nextSibling", "childNodes", "parentNode" ]) || !b.areHostProperties(u, [ "data" ]))) {
        d.fail("Incomplete Text Node implementation");
    }
    var C = function(I, K) {
        var J = I.length;
        while (J--) {
            if (I[J] === K) {
                return true;
            }
        }
        return false;
    };
    function j(J) {
        var I;
        return typeof J.namespaceURI == v || ((I = J.namespaceURI) === null || I == "http://www.w3.org/1999/xhtml");
    }
    function k(J) {
        var I = J.parentNode;
        return I.nodeType == 1 ? I : null;
    }
    function a(J) {
        var I = 0;
        while (J = J.previousSibling) {
            I++;
        }
        return I;
    }
    function g(I) {
        var J;
        return n(I) ? I.length : (J = I.childNodes) ? J.length : 0;
    }
    function B(J, I) {
        var K = [], L;
        for (L = J; L; L = L.parentNode) {
            K.push(L);
        }
        for (L = I; L; L = L.parentNode) {
            if (C(K, L)) {
                return L;
            }
        }
        return null;
    }
    function G(I, J, L) {
        var K = L ? J : J.parentNode;
        while (K) {
            if (K === I) {
                return true;
            } else {
                K = K.parentNode;
            }
        }
        return false;
    }
    function D(J, I, M) {
        var K, L = M ? J : J.parentNode;
        while (L) {
            K = L.parentNode;
            if (K === I) {
                return L;
            }
            L = K;
        }
        return null;
    }
    function n(J) {
        var I = J.nodeType;
        return I == 3 || I == 4 || I == 8;
    }
    function z(L, J) {
        var I = J.nextSibling, K = J.parentNode;
        if (I) {
            K.insertBefore(L, I);
        } else {
            K.appendChild(L);
        }
        return L;
    }
    function A(K, I) {
        var J = K.cloneNode(false);
        J.deleteData(0, I);
        K.deleteData(I, K.length - I);
        z(J, K);
        return J;
    }
    function s(I) {
        if (I.nodeType == 9) {
            return I;
        } else {
            if (typeof I.ownerDocument != v) {
                return I.ownerDocument;
            } else {
                if (typeof I.document != v) {
                    return I.document;
                } else {
                    if (I.parentNode) {
                        return s(I.parentNode);
                    } else {
                        throw new Error("getDocument: no document found for node");
                    }
                }
            }
        }
    }
    function m(I) {
        var J = s(I);
        if (typeof J.defaultView != v) {
            return J.defaultView;
        } else {
            if (typeof J.parentWindow != v) {
                return J.parentWindow;
            } else {
                throw new Error("Cannot get a window object for node");
            }
        }
    }
    function F(I) {
        if (typeof I.contentDocument != v) {
            return I.contentDocument;
        } else {
            if (typeof I.contentWindow != v) {
                return I.contentWindow.document;
            } else {
                throw new Error("getIframeWindow: No Document object found for iframe element");
            }
        }
    }
    function f(I) {
        if (typeof I.contentWindow != v) {
            return I.contentWindow;
        } else {
            if (typeof I.contentDocument != v) {
                return I.contentDocument.defaultView;
            } else {
                throw new Error("getIframeWindow: No Window object found for iframe element");
            }
        }
    }
    function H(I) {
        return b.isHostObject(I, "body") ? I.body : I.getElementsByTagName("body")[0];
    }
    function c(J) {
        var I;
        while (I = J.parentNode) {
            J = I;
        }
        return J;
    }
    function t(L, N, K, M) {
        var I, O, Q, P, J;
        if (L == K) {
            return N === M ? 0 : N < M ? -1 : 1;
        } else {
            if (I = D(K, L, true)) {
                return N <= a(I) ? -1 : 1;
            } else {
                if (I = D(L, K, true)) {
                    return a(I) < M ? -1 : 1;
                } else {
                    O = B(L, K);
                    Q = L === O ? O : D(L, O, true);
                    P = K === O ? O : D(K, O, true);
                    if (Q === P) {
                        throw new Error("comparePoints got to case 4 and childA and childB are the same!");
                    } else {
                        J = O.firstChild;
                        while (J) {
                            if (J === Q) {
                                return -1;
                            } else {
                                if (J === P) {
                                    return 1;
                                }
                            }
                            J = J.nextSibling;
                        }
                        throw new Error("Should not be here!");
                    }
                }
            }
        }
    }
    function E(J) {
        var I = s(J).createDocumentFragment(), K;
        while (K = J.firstChild) {
            I.appendChild(K);
        }
        return I;
    }
    function p(I) {
        if (!I) {
            return "[No node]";
        }
        if (n(I)) {
            return '"' + I.data + '"';
        } else {
            if (I.nodeType == 1) {
                var J = I.id ? ' id="' + I.id + '"' : "";
                return "<" + I.nodeName + J + ">[" + I.childNodes.length + "]";
            } else {
                return I.nodeName;
            }
        }
    }
    function o(I) {
        this.root = I;
        this._next = I;
    }
    o.prototype = {
        _current: null,
        hasNext: function() {
            return !!this._next;
        },
        next: function() {
            var K = this._current = this._next;
            var J, I;
            if (this._current) {
                J = K.firstChild;
                if (J) {
                    this._next = J;
                } else {
                    I = null;
                    while (K !== this.root && !(I = K.nextSibling)) {
                        K = K.parentNode;
                    }
                    this._next = I;
                }
            }
            return this._current;
        },
        detach: function() {
            this._current = this._next = this.root = null;
        }
    };
    function h(I) {
        return new o(I);
    }
    function l(I, J) {
        this.node = I;
        this.offset = J;
    }
    l.prototype = {
        equals: function(I) {
            return this.node === I.node & this.offset == I.offset;
        },
        inspect: function() {
            return "[DomPosition(" + p(this.node) + ":" + this.offset + ")]";
        }
    };
    function w(I) {
        this.code = this[I];
        this.codeName = I;
        this.message = "DOMException: " + this.codeName;
    }
    w.prototype = {
        INDEX_SIZE_ERR: 1,
        HIERARCHY_REQUEST_ERR: 3,
        WRONG_DOCUMENT_ERR: 4,
        NO_MODIFICATION_ALLOWED_ERR: 7,
        NOT_FOUND_ERR: 8,
        NOT_SUPPORTED_ERR: 9,
        INVALID_STATE_ERR: 11
    };
    w.prototype.toString = function() {
        return this.message;
    };
    r.dom = {
        arrayContains: C,
        isHtmlNamespace: j,
        parentElement: k,
        getNodeIndex: a,
        getNodeLength: g,
        getCommonAncestor: B,
        isAncestorOf: G,
        getClosestAncestorIn: D,
        isCharacterDataNode: n,
        insertAfter: z,
        splitDataNode: A,
        getDocument: s,
        getWindow: m,
        getIframeWindow: f,
        getIframeDocument: F,
        getBody: H,
        getRootContainer: c,
        comparePoints: t,
        inspectNode: p,
        fragmentFromNodeChildren: E,
        createIterator: h,
        DomPosition: l
    };
    r.DOMException = w;
});

rangy.createModule("DomRange", function(j, f) {
    j.requireModules([ "DomUtil" ]);
    var b = j.dom;
    var I = b.DomPosition;
    var X = j.DOMException;
    function B(ap, e) {
        return ap.nodeType != 3 && (b.isAncestorOf(ap, e.startContainer, true) || b.isAncestorOf(ap, e.endContainer, true));
    }
    function n(e) {
        return b.getDocument(e.startContainer);
    }
    function w(ap, au, aq) {
        var at = ap._listeners[au];
        if (at) {
            for (var ar = 0, e = at.length; ar < e; ++ar) {
                at[ar].call(ap, {
                    target: ap,
                    args: aq
                });
            }
        }
    }
    function E(e) {
        return new I(e.parentNode, b.getNodeIndex(e));
    }
    function aa(e) {
        return new I(e.parentNode, b.getNodeIndex(e) + 1);
    }
    function k(ap, ar, aq) {
        var e = ap.nodeType == 11 ? ap.firstChild : ap;
        if (b.isCharacterDataNode(ar)) {
            if (aq == ar.length) {
                b.insertAfter(ap, ar);
            } else {
                ar.parentNode.insertBefore(ap, aq == 0 ? ar : b.splitDataNode(ar, aq));
            }
        } else {
            if (aq >= ar.childNodes.length) {
                ar.appendChild(ap);
            } else {
                ar.insertBefore(ap, ar.childNodes[aq]);
            }
        }
        return e;
    }
    function L(aq) {
        var ap;
        for (var ar, at = n(aq.range).createDocumentFragment(), e; ar = aq.next(); ) {
            ap = aq.isPartiallySelectedSubtree();
            ar = ar.cloneNode(!ap);
            if (ap) {
                e = aq.getSubtreeIterator();
                ar.appendChild(L(e));
                e.detach(true);
            }
            if (ar.nodeType == 10) {
                throw new X("HIERARCHY_REQUEST_ERR");
            }
            at.appendChild(ar);
        }
        return at;
    }
    function Z(ap, at, e) {
        var aq, av;
        e = e || {
            stop: false
        };
        for (var ar, au; ar = ap.next(); ) {
            if (ap.isPartiallySelectedSubtree()) {
                if (at(ar) === false) {
                    e.stop = true;
                    return;
                } else {
                    au = ap.getSubtreeIterator();
                    Z(au, at, e);
                    au.detach(true);
                    if (e.stop) {
                        return;
                    }
                }
            } else {
                aq = b.createIterator(ar);
                while (av = aq.next()) {
                    if (at(av) === false) {
                        e.stop = true;
                        return;
                    }
                }
            }
        }
    }
    function o(ap) {
        var e;
        while (ap.next()) {
            if (ap.isPartiallySelectedSubtree()) {
                e = ap.getSubtreeIterator();
                o(e);
                e.detach(true);
            } else {
                ap.remove();
            }
        }
    }
    function U(ap) {
        for (var aq, ar = n(ap.range).createDocumentFragment(), e; aq = ap.next(); ) {
            if (ap.isPartiallySelectedSubtree()) {
                aq = aq.cloneNode(false);
                e = ap.getSubtreeIterator();
                aq.appendChild(U(e));
                e.detach(true);
            } else {
                ap.remove();
            }
            if (aq.nodeType == 10) {
                throw new X("HIERARCHY_REQUEST_ERR");
            }
            ar.appendChild(aq);
        }
        return ar;
    }
    function r(aq, e, ar) {
        var au = !!(e && e.length), at;
        var av = !!ar;
        if (au) {
            at = new RegExp("^(" + e.join("|") + ")$");
        }
        var ap = [];
        Z(new g(aq, false), function(aw) {
            if ((!au || at.test(aw.nodeType)) && (!av || ar(aw))) {
                ap.push(aw);
            }
        });
        return ap;
    }
    function D(e) {
        var ap = typeof e.getName == "undefined" ? "Range" : e.getName();
        return "[" + ap + "(" + b.inspectNode(e.startContainer) + ":" + e.startOffset + ", " + b.inspectNode(e.endContainer) + ":" + e.endOffset + ")]";
    }
    function g(aq, ap) {
        this.range = aq;
        this.clonePartiallySelectedTextNodes = ap;
        if (!aq.collapsed) {
            this.sc = aq.startContainer;
            this.so = aq.startOffset;
            this.ec = aq.endContainer;
            this.eo = aq.endOffset;
            var e = aq.commonAncestorContainer;
            if (this.sc === this.ec && b.isCharacterDataNode(this.sc)) {
                this.isSingleCharacterDataNode = true;
                this._first = this._last = this._next = this.sc;
            } else {
                this._first = this._next = this.sc === e && !b.isCharacterDataNode(this.sc) ? this.sc.childNodes[this.so] : b.getClosestAncestorIn(this.sc, e, true);
                this._last = this.ec === e && !b.isCharacterDataNode(this.ec) ? this.ec.childNodes[this.eo - 1] : b.getClosestAncestorIn(this.ec, e, true);
            }
        }
    }
    g.prototype = {
        _current: null,
        _next: null,
        _first: null,
        _last: null,
        isSingleCharacterDataNode: false,
        reset: function() {
            this._current = null;
            this._next = this._first;
        },
        hasNext: function() {
            return !!this._next;
        },
        next: function() {
            var e = this._current = this._next;
            if (e) {
                this._next = e !== this._last ? e.nextSibling : null;
                if (b.isCharacterDataNode(e) && this.clonePartiallySelectedTextNodes) {
                    if (e === this.ec) {
                        (e = e.cloneNode(true)).deleteData(this.eo, e.length - this.eo);
                    }
                    if (this._current === this.sc) {
                        (e = e.cloneNode(true)).deleteData(0, this.so);
                    }
                }
            }
            return e;
        },
        remove: function() {
            var ap = this._current, aq, e;
            if (b.isCharacterDataNode(ap) && (ap === this.sc || ap === this.ec)) {
                aq = ap === this.sc ? this.so : 0;
                e = ap === this.ec ? this.eo : ap.length;
                if (aq != e) {
                    ap.deleteData(aq, e - aq);
                }
            } else {
                if (ap.parentNode) {
                    ap.parentNode.removeChild(ap);
                } else {}
            }
        },
        isPartiallySelectedSubtree: function() {
            var e = this._current;
            return B(e, this.range);
        },
        getSubtreeIterator: function() {
            var ap;
            if (this.isSingleCharacterDataNode) {
                ap = this.range.cloneRange();
                ap.collapse();
            } else {
                ap = new an(n(this.range));
                var au = this._current;
                var ar = au, e = 0, at = au, aq = b.getNodeLength(au);
                if (b.isAncestorOf(au, this.sc, true)) {
                    ar = this.sc;
                    e = this.so;
                }
                if (b.isAncestorOf(au, this.ec, true)) {
                    at = this.ec;
                    aq = this.eo;
                }
                H(ap, ar, e, at, aq);
            }
            return new g(ap, this.clonePartiallySelectedTextNodes);
        },
        detach: function(e) {
            if (e) {
                this.range.detach();
            }
            this.range = this._current = this._next = this._first = this._last = this.sc = this.so = this.ec = this.eo = null;
        }
    };
    function S(e) {
        this.code = this[e];
        this.codeName = e;
        this.message = "RangeException: " + this.codeName;
    }
    S.prototype = {
        BAD_BOUNDARYPOINTS_ERR: 1,
        INVALID_NODE_TYPE_ERR: 2
    };
    S.prototype.toString = function() {
        return this.message;
    };
    function A(ap, e, aq) {
        this.nodes = r(ap, e, aq);
        this._next = this.nodes[0];
        this._position = 0;
    }
    A.prototype = {
        _current: null,
        hasNext: function() {
            return !!this._next;
        },
        next: function() {
            this._current = this._next;
            this._next = this.nodes[++this._position];
            return this._current;
        },
        detach: function() {
            this._current = this._next = this.nodes = null;
        }
    };
    var ai = [ 1, 3, 4, 5, 7, 8, 10 ];
    var ag = [ 2, 9, 11 ];
    var F = [ 5, 6, 10, 12 ];
    var Q = [ 1, 3, 4, 5, 7, 8, 10, 11 ];
    var J = [ 1, 3, 4, 5, 7, 8 ];
    function ac(e) {
        return function(aq, at) {
            var ap, ar = at ? aq : aq.parentNode;
            while (ar) {
                ap = ar.nodeType;
                if (b.arrayContains(e, ap)) {
                    return ar;
                }
                ar = ar.parentNode;
            }
            return null;
        };
    }
    var v = b.getRootContainer;
    var M = ac([ 9, 11 ]);
    var O = ac(F);
    var c = ac([ 6, 10, 12 ]);
    function t(ap, e) {
        if (c(ap, e)) {
            throw new S("INVALID_NODE_TYPE_ERR");
        }
    }
    function G(e) {
        if (!e.startContainer) {
            throw new X("INVALID_STATE_ERR");
        }
    }
    function Y(e, ap) {
        if (!b.arrayContains(ap, e.nodeType)) {
            throw new S("INVALID_NODE_TYPE_ERR");
        }
    }
    function ah(e, ap) {
        if (ap < 0 || ap > (b.isCharacterDataNode(e) ? e.length : e.childNodes.length)) {
            throw new X("INDEX_SIZE_ERR");
        }
    }
    function d(ap, e) {
        if (M(ap, true) !== M(e, true)) {
            throw new X("WRONG_DOCUMENT_ERR");
        }
    }
    function ae(e) {
        if (O(e, true)) {
            throw new X("NO_MODIFICATION_ALLOWED_ERR");
        }
    }
    function al(ap, e) {
        if (!ap) {
            throw new X(e);
        }
    }
    function p(e) {
        return !b.arrayContains(ag, e.nodeType) && !M(e, true);
    }
    function ao(e, ap) {
        return ap <= (b.isCharacterDataNode(e) ? e.length : e.childNodes.length);
    }
    function h(e) {
        G(e);
        if (p(e.startContainer) || p(e.endContainer) || !ao(e.startContainer, e.startOffset) || !ao(e.endContainer, e.endOffset)) {
            throw new Error("Range error: Range is no longer valid after DOM mutation (" + e.inspect() + ")");
        }
    }
    var a = document.createElement("style");
    var T = false;
    try {
        a.innerHTML = "<b>x</b>";
        T = a.firstChild.nodeType == 3;
    } catch (ak) {}
    j.features.htmlParsingConforms = T;
    var V = T ? function(aq) {
        var ap = this.startContainer;
        var ar = b.getDocument(ap);
        if (!ap) {
            throw new X("INVALID_STATE_ERR");
        }
        var e = null;
        if (ap.nodeType == 1) {
            e = ap;
        } else {
            if (b.isCharacterDataNode(ap)) {
                e = b.parentElement(ap);
            }
        }
        if (e === null || e.nodeName == "HTML" && b.isHtmlNamespace(b.getDocument(e).documentElement) && b.isHtmlNamespace(e)) {
            e = ar.createElement("body");
        } else {
            e = e.cloneNode(false);
        }
        e.innerHTML = aq;
        return b.fragmentFromNodeChildren(e);
    } : function(ap) {
        G(this);
        var aq = n(this);
        var e = aq.createElement("body");
        e.innerHTML = ap;
        return b.fragmentFromNodeChildren(e);
    };
    var P = [ "startContainer", "startOffset", "endContainer", "endOffset", "collapsed", "commonAncestorContainer" ];
    var m = 0, C = 1, aj = 2, ad = 3;
    var u = 0, z = 1, N = 2, l = 3;
    function af() {}
    af.prototype = {
        attachListener: function(e, ap) {
            this._listeners[e].push(ap);
        },
        compareBoundaryPoints: function(au, aq) {
            h(this);
            d(this.startContainer, aq.startContainer);
            var aw, ap, av, e;
            var at = au == ad || au == m ? "start" : "end";
            var ar = au == C || au == m ? "start" : "end";
            aw = this[at + "Container"];
            ap = this[at + "Offset"];
            av = aq[ar + "Container"];
            e = aq[ar + "Offset"];
            return b.comparePoints(aw, ap, av, e);
        },
        insertNode: function(ap) {
            h(this);
            Y(ap, Q);
            ae(this.startContainer);
            if (b.isAncestorOf(ap, this.startContainer, true)) {
                throw new X("HIERARCHY_REQUEST_ERR");
            }
            var e = k(ap, this.startContainer, this.startOffset);
            this.setStartBefore(e);
        },
        cloneContents: function() {
            h(this);
            var aq, ap;
            if (this.collapsed) {
                return n(this).createDocumentFragment();
            } else {
                if (this.startContainer === this.endContainer && b.isCharacterDataNode(this.startContainer)) {
                    aq = this.startContainer.cloneNode(true);
                    aq.data = aq.data.slice(this.startOffset, this.endOffset);
                    ap = n(this).createDocumentFragment();
                    ap.appendChild(aq);
                    return ap;
                } else {
                    var e = new g(this, true);
                    aq = L(e);
                    e.detach();
                }
                return aq;
            }
        },
        canSurroundContents: function() {
            h(this);
            ae(this.startContainer);
            ae(this.endContainer);
            var e = new g(this, true);
            var ap = e._first && B(e._first, this) || e._last && B(e._last, this);
            e.detach();
            return !ap;
        },
        surroundContents: function(ap) {
            Y(ap, J);
            if (!this.canSurroundContents()) {
                throw new S("BAD_BOUNDARYPOINTS_ERR");
            }
            var e = this.extractContents();
            if (ap.hasChildNodes()) {
                while (ap.lastChild) {
                    ap.removeChild(ap.lastChild);
                }
            }
            k(ap, this.startContainer, this.startOffset);
            ap.appendChild(e);
            this.selectNode(ap);
        },
        cloneRange: function() {
            h(this);
            var e = new an(n(this));
            var ap = P.length, aq;
            while (ap--) {
                aq = P[ap];
                e[aq] = this[aq];
            }
            return e;
        },
        toString: function() {
            h(this);
            var ap = this.startContainer;
            if (ap === this.endContainer && b.isCharacterDataNode(ap)) {
                return ap.nodeType == 3 || ap.nodeType == 4 ? ap.data.slice(this.startOffset, this.endOffset) : "";
            } else {
                var aq = [], e = new g(this, true);
                Z(e, function(ar) {
                    if (ar.nodeType == 3 || ar.nodeType == 4) {
                        aq.push(ar.data);
                    }
                });
                e.detach();
                return aq.join("");
            }
        },
        compareNode: function(aq) {
            h(this);
            var ap = aq.parentNode;
            var at = b.getNodeIndex(aq);
            if (!ap) {
                throw new X("NOT_FOUND_ERR");
            }
            var ar = this.comparePoint(ap, at), e = this.comparePoint(ap, at + 1);
            if (ar < 0) {
                return e > 0 ? N : u;
            } else {
                return e > 0 ? z : l;
            }
        },
        comparePoint: function(e, ap) {
            h(this);
            al(e, "HIERARCHY_REQUEST_ERR");
            d(e, this.startContainer);
            if (b.comparePoints(e, ap, this.startContainer, this.startOffset) < 0) {
                return -1;
            } else {
                if (b.comparePoints(e, ap, this.endContainer, this.endOffset) > 0) {
                    return 1;
                }
            }
            return 0;
        },
        createContextualFragment: V,
        toHtml: function() {
            h(this);
            var e = n(this).createElement("div");
            e.appendChild(this.cloneContents());
            return e.innerHTML;
        },
        intersectsNode: function(ar, e) {
            h(this);
            al(ar, "NOT_FOUND_ERR");
            if (b.getDocument(ar) !== n(this)) {
                return false;
            }
            var aq = ar.parentNode, au = b.getNodeIndex(ar);
            al(aq, "NOT_FOUND_ERR");
            var at = b.comparePoints(aq, au, this.endContainer, this.endOffset), ap = b.comparePoints(aq, au + 1, this.startContainer, this.startOffset);
            return e ? at <= 0 && ap >= 0 : at < 0 && ap > 0;
        },
        isPointInRange: function(e, ap) {
            h(this);
            al(e, "HIERARCHY_REQUEST_ERR");
            d(e, this.startContainer);
            return b.comparePoints(e, ap, this.startContainer, this.startOffset) >= 0 && b.comparePoints(e, ap, this.endContainer, this.endOffset) <= 0;
        },
        intersectsRange: function(ap, e) {
            h(this);
            if (n(ap) != n(this)) {
                throw new X("WRONG_DOCUMENT_ERR");
            }
            var ar = b.comparePoints(this.startContainer, this.startOffset, ap.endContainer, ap.endOffset), aq = b.comparePoints(this.endContainer, this.endOffset, ap.startContainer, ap.startOffset);
            return e ? ar <= 0 && aq >= 0 : ar < 0 && aq > 0;
        },
        intersection: function(e) {
            if (this.intersectsRange(e)) {
                var ar = b.comparePoints(this.startContainer, this.startOffset, e.startContainer, e.startOffset), ap = b.comparePoints(this.endContainer, this.endOffset, e.endContainer, e.endOffset);
                var aq = this.cloneRange();
                if (ar == -1) {
                    aq.setStart(e.startContainer, e.startOffset);
                }
                if (ap == 1) {
                    aq.setEnd(e.endContainer, e.endOffset);
                }
                return aq;
            }
            return null;
        },
        union: function(e) {
            if (this.intersectsRange(e, true)) {
                var ap = this.cloneRange();
                if (b.comparePoints(e.startContainer, e.startOffset, this.startContainer, this.startOffset) == -1) {
                    ap.setStart(e.startContainer, e.startOffset);
                }
                if (b.comparePoints(e.endContainer, e.endOffset, this.endContainer, this.endOffset) == 1) {
                    ap.setEnd(e.endContainer, e.endOffset);
                }
                return ap;
            } else {
                throw new S("Ranges do not intersect");
            }
        },
        containsNode: function(ap, e) {
            if (e) {
                return this.intersectsNode(ap, false);
            } else {
                return this.compareNode(ap) == l;
            }
        },
        containsNodeContents: function(e) {
            return this.comparePoint(e, 0) >= 0 && this.comparePoint(e, b.getNodeLength(e)) <= 0;
        },
        containsRange: function(e) {
            return this.intersection(e).equals(e);
        },
        containsNodeText: function(ar) {
            var at = this.cloneRange();
            at.selectNode(ar);
            var aq = at.getNodes([ 3 ]);
            if (aq.length > 0) {
                at.setStart(aq[0], 0);
                var e = aq.pop();
                at.setEnd(e, e.length);
                var ap = this.containsRange(at);
                at.detach();
                return ap;
            } else {
                return this.containsNodeContents(ar);
            }
        },
        createNodeIterator: function(e, ap) {
            h(this);
            return new A(this, e, ap);
        },
        getNodes: function(e, ap) {
            h(this);
            return r(this, e, ap);
        },
        getDocument: function() {
            return n(this);
        },
        collapseBefore: function(e) {
            G(this);
            this.setEndBefore(e);
            this.collapse(false);
        },
        collapseAfter: function(e) {
            G(this);
            this.setStartAfter(e);
            this.collapse(true);
        },
        getName: function() {
            return "DomRange";
        },
        equals: function(e) {
            return an.rangesEqual(this, e);
        },
        inspect: function() {
            return D(this);
        }
    };
    function W(e) {
        e.START_TO_START = m;
        e.START_TO_END = C;
        e.END_TO_END = aj;
        e.END_TO_START = ad;
        e.NODE_BEFORE = u;
        e.NODE_AFTER = z;
        e.NODE_BEFORE_AND_AFTER = N;
        e.NODE_INSIDE = l;
    }
    function K(e) {
        W(e);
        W(e.prototype);
    }
    function s(e, ap) {
        return function() {
            h(this);
            var aw = this.startContainer, av = this.startOffset, aq = this.commonAncestorContainer;
            var at = new g(this, true);
            var au, ax;
            if (aw !== aq) {
                au = b.getClosestAncestorIn(aw, aq, true);
                ax = aa(au);
                aw = ax.node;
                av = ax.offset;
            }
            Z(at, ae);
            at.reset();
            var ar = e(at);
            at.detach();
            ap(this, aw, av, aw, av);
            return ar;
        };
    }
    function ab(ar, av, e) {
        function au(ax, aw) {
            return function(ay) {
                G(this);
                Y(ay, ai);
                Y(v(ay), ag);
                var az = (ax ? E : aa)(ay);
                (aw ? aq : at)(this, az.node, az.offset);
            };
        }
        function aq(ax, az, aA) {
            var ay = ax.endContainer, aw = ax.endOffset;
            if (az !== ax.startContainer || aA !== ax.startOffset) {
                if (v(az) != v(ay) || b.comparePoints(az, aA, ay, aw) == 1) {
                    ay = az;
                    aw = aA;
                }
                av(ax, az, aA, ay, aw);
            }
        }
        function at(aw, ax, aA) {
            var az = aw.startContainer, ay = aw.startOffset;
            if (ax !== aw.endContainer || aA !== aw.endOffset) {
                if (v(ax) != v(az) || b.comparePoints(ax, aA, az, ay) == -1) {
                    az = ax;
                    ay = aA;
                }
                av(aw, az, ay, ax, aA);
            }
        }
        function ap(aw, ax, ay) {
            if (ax !== aw.startContainer || ay !== aw.startOffset || ax !== aw.endContainer || ay !== aw.endOffset) {
                av(aw, ax, ay, ax, ay);
            }
        }
        ar.prototype = new af();
        j.util.extend(ar.prototype, {
            setStart: function(aw, ax) {
                G(this);
                t(aw, true);
                ah(aw, ax);
                aq(this, aw, ax);
            },
            setEnd: function(aw, ax) {
                G(this);
                t(aw, true);
                ah(aw, ax);
                at(this, aw, ax);
            },
            setStartBefore: au(true, true),
            setStartAfter: au(false, true),
            setEndBefore: au(true, false),
            setEndAfter: au(false, false),
            collapse: function(aw) {
                h(this);
                if (aw) {
                    av(this, this.startContainer, this.startOffset, this.startContainer, this.startOffset);
                } else {
                    av(this, this.endContainer, this.endOffset, this.endContainer, this.endOffset);
                }
            },
            selectNodeContents: function(aw) {
                G(this);
                t(aw, true);
                av(this, aw, 0, aw, b.getNodeLength(aw));
            },
            selectNode: function(ax) {
                G(this);
                t(ax, false);
                Y(ax, ai);
                var ay = E(ax), aw = aa(ax);
                av(this, ay.node, ay.offset, aw.node, aw.offset);
            },
            extractContents: s(U, av),
            deleteContents: s(o, av),
            canSurroundContents: function() {
                h(this);
                ae(this.startContainer);
                ae(this.endContainer);
                var aw = new g(this, true);
                var ax = aw._first && B(aw._first, this) || aw._last && B(aw._last, this);
                aw.detach();
                return !ax;
            },
            detach: function() {
                e(this);
            },
            splitBoundaries: function() {
                h(this);
                var aA = this.startContainer, az = this.startOffset, ax = this.endContainer, aw = this.endOffset;
                var ay = aA === ax;
                if (b.isCharacterDataNode(ax) && aw > 0 && aw < ax.length) {
                    b.splitDataNode(ax, aw);
                }
                if (b.isCharacterDataNode(aA) && az > 0 && az < aA.length) {
                    aA = b.splitDataNode(aA, az);
                    if (ay) {
                        aw -= az;
                        ax = aA;
                    } else {
                        if (ax == aA.parentNode && aw >= b.getNodeIndex(aA)) {
                            aw++;
                        }
                    }
                    az = 0;
                }
                av(this, aA, az, ax, aw);
            },
            normalizeBoundaries: function() {
                h(this);
                var aD = this.startContainer, ay = this.startOffset, aC = this.endContainer, aw = this.endOffset;
                var az = function(aG) {
                    var aF = aG.nextSibling;
                    if (aF && aF.nodeType == aG.nodeType) {
                        aC = aG;
                        aw = aG.length;
                        aG.appendData(aF.data);
                        aF.parentNode.removeChild(aF);
                    }
                };
                var aE = function(aH) {
                    var aG = aH.previousSibling;
                    if (aG && aG.nodeType == aH.nodeType) {
                        aD = aH;
                        var aF = aH.length;
                        ay = aG.length;
                        aH.insertData(0, aG.data);
                        aG.parentNode.removeChild(aG);
                        if (aD == aC) {
                            aw += ay;
                            aC = aD;
                        } else {
                            if (aC == aH.parentNode) {
                                var aI = b.getNodeIndex(aH);
                                if (aw == aI) {
                                    aC = aH;
                                    aw = aF;
                                } else {
                                    if (aw > aI) {
                                        aw--;
                                    }
                                }
                            }
                        }
                    }
                };
                var aB = true;
                if (b.isCharacterDataNode(aC)) {
                    if (aC.length == aw) {
                        az(aC);
                    }
                } else {
                    if (aw > 0) {
                        var aA = aC.childNodes[aw - 1];
                        if (aA && b.isCharacterDataNode(aA)) {
                            az(aA);
                        }
                    }
                    aB = !this.collapsed;
                }
                if (aB) {
                    if (b.isCharacterDataNode(aD)) {
                        if (ay == 0) {
                            aE(aD);
                        }
                    } else {
                        if (ay < aD.childNodes.length) {
                            var ax = aD.childNodes[ay];
                            if (ax && b.isCharacterDataNode(ax)) {
                                aE(ax);
                            }
                        }
                    }
                } else {
                    aD = aC;
                    ay = aw;
                }
                av(this, aD, ay, aC, aw);
            },
            collapseToPoint: function(aw, ax) {
                G(this);
                t(aw, true);
                ah(aw, ax);
                ap(this, aw, ax);
            }
        });
        K(ar);
    }
    function R(e) {
        e.collapsed = e.startContainer === e.endContainer && e.startOffset === e.endOffset;
        e.commonAncestorContainer = e.collapsed ? e.startContainer : b.getCommonAncestor(e.startContainer, e.endContainer);
    }
    function H(aq, at, ap, au, ar) {
        var e = aq.startContainer !== at || aq.startOffset !== ap;
        var av = aq.endContainer !== au || aq.endOffset !== ar;
        aq.startContainer = at;
        aq.startOffset = ap;
        aq.endContainer = au;
        aq.endOffset = ar;
        R(aq);
        w(aq, "boundarychange", {
            startMoved: e,
            endMoved: av
        });
    }
    function am(e) {
        G(e);
        e.startContainer = e.startOffset = e.endContainer = e.endOffset = null;
        e.collapsed = e.commonAncestorContainer = null;
        w(e, "detach", null);
        e._listeners = null;
    }
    function an(e) {
        this.startContainer = e;
        this.startOffset = 0;
        this.endContainer = e;
        this.endOffset = 0;
        this._listeners = {
            boundarychange: [],
            detach: []
        };
        R(this);
    }
    ab(an, H, am);
    j.rangePrototype = af.prototype;
    an.rangeProperties = P;
    an.RangeIterator = g;
    an.copyComparisonConstants = K;
    an.createPrototypeRange = ab;
    an.inspect = D;
    an.getRangeDocument = n;
    an.rangesEqual = function(ap, e) {
        return ap.startContainer === e.startContainer && ap.startOffset === e.startOffset && ap.endContainer === e.endContainer && ap.endOffset === e.endOffset;
    };
    j.DomRange = an;
    j.RangeException = S;
});

rangy.createModule("WrappedRange", function(j, d) {
    j.requireModules([ "DomUtil", "DomRange" ]);
    var a;
    var h = j.dom;
    var b = h.DomPosition;
    var k = j.DomRange;
    function e(s) {
        var p = s.parentElement();
        var n = s.duplicate();
        n.collapse(true);
        var r = n.parentElement();
        n = s.duplicate();
        n.collapse(false);
        var o = n.parentElement();
        var m = r == o ? r : h.getCommonAncestor(r, o);
        return m == p ? m : h.getCommonAncestor(p, m);
    }
    function c(m) {
        return m.compareEndPoints("StartToEnd", m) == 0;
    }
    function f(D, A, o, u) {
        var E = D.duplicate();
        E.collapse(o);
        var C = E.parentElement();
        if (!h.isAncestorOf(A, C, true)) {
            C = A;
        }
        if (!C.canHaveHTML) {
            return new b(C.parentNode, h.getNodeIndex(C));
        }
        var n = h.getDocument(C).createElement("span");
        var B, w = o ? "StartToStart" : "StartToEnd";
        var z, s, m, p;
        do {
            C.insertBefore(n, n.previousSibling);
            E.moveToElementText(n);
        } while ((B = E.compareEndPoints(w, D)) > 0 && n.previousSibling);
        p = n.nextSibling;
        if (B == -1 && p && h.isCharacterDataNode(p)) {
            E.setEndPoint(o ? "EndToStart" : "EndToEnd", D);
            var t;
            if (/[\r\n]/.test(p.data)) {
                var v = E.duplicate();
                var r = v.text.replace(/\r\n/g, "\r").length;
                t = v.moveStart("character", r);
                while ((B = v.compareEndPoints("StartToEnd", v)) == -1) {
                    t++;
                    v.moveStart("character", 1);
                }
            } else {
                t = E.text.length;
            }
            m = new b(p, t);
        } else {
            z = (u || !o) && n.previousSibling;
            s = (u || o) && n.nextSibling;
            if (s && h.isCharacterDataNode(s)) {
                m = new b(s, 0);
            } else {
                if (z && h.isCharacterDataNode(z)) {
                    m = new b(z, z.length);
                } else {
                    m = new b(C, h.getNodeIndex(n));
                }
            }
        }
        n.parentNode.removeChild(n);
        return m;
    }
    function l(m, o) {
        var p, t, r = m.offset;
        var u = h.getDocument(m.node);
        var n, v, w = u.body.createTextRange();
        var s = h.isCharacterDataNode(m.node);
        if (s) {
            p = m.node;
            t = p.parentNode;
        } else {
            v = m.node.childNodes;
            p = r < v.length ? v[r] : null;
            t = m.node;
        }
        n = u.createElement("span");
        n.innerHTML = "&#feff;";
        if (p) {
            t.insertBefore(n, p);
        } else {
            t.appendChild(n);
        }
        w.moveToElementText(n);
        w.collapse(!o);
        t.removeChild(n);
        if (s) {
            w[o ? "moveStart" : "moveEnd"]("character", r);
        }
        return w;
    }
    if (j.features.implementsDomRange && (!j.features.implementsTextRange || !j.config.preferTextRange)) {
        (function() {
            var o;
            var u = k.rangeProperties;
            var z;
            function m(A) {
                var B = u.length, C;
                while (B--) {
                    C = u[B];
                    A[C] = A.nativeRange[C];
                }
            }
            function p(C, E, B, F, D) {
                var A = C.startContainer !== E || C.startOffset != B;
                var G = C.endContainer !== F || C.endOffset != D;
                if (A || G) {
                    C.setEnd(F, D);
                    C.setStart(E, B);
                }
            }
            function v(A) {
                A.nativeRange.detach();
                A.detached = true;
                var B = u.length, C;
                while (B--) {
                    C = u[B];
                    A[C] = null;
                }
            }
            var n;
            a = function(A) {
                if (!A) {
                    throw new Error("Range must be specified");
                }
                this.nativeRange = A;
                m(this);
            };
            k.createPrototypeRange(a, p, v);
            o = a.prototype;
            o.selectNode = function(A) {
                this.nativeRange.selectNode(A);
                m(this);
            };
            o.deleteContents = function() {
                this.nativeRange.deleteContents();
                m(this);
            };
            o.extractContents = function() {
                var A = this.nativeRange.extractContents();
                m(this);
                return A;
            };
            o.cloneContents = function() {
                return this.nativeRange.cloneContents();
            };
            o.surroundContents = function(A) {
                this.nativeRange.surroundContents(A);
                m(this);
            };
            o.collapse = function(A) {
                this.nativeRange.collapse(A);
                m(this);
            };
            o.cloneRange = function() {
                return new a(this.nativeRange.cloneRange());
            };
            o.refresh = function() {
                m(this);
            };
            o.toString = function() {
                return this.nativeRange.toString();
            };
            var t = document.createTextNode("test");
            h.getBody(document).appendChild(t);
            var r = document.createRange();
            r.setStart(t, 0);
            r.setEnd(t, 0);
            try {
                r.setStart(t, 1);
                z = true;
                o.setStart = function(A, B) {
                    this.nativeRange.setStart(A, B);
                    m(this);
                };
                o.setEnd = function(A, B) {
                    this.nativeRange.setEnd(A, B);
                    m(this);
                };
                n = function(A) {
                    return function(B) {
                        this.nativeRange[A](B);
                        m(this);
                    };
                };
            } catch (s) {
                z = false;
                o.setStart = function(B, C) {
                    try {
                        this.nativeRange.setStart(B, C);
                    } catch (A) {
                        this.nativeRange.setEnd(B, C);
                        this.nativeRange.setStart(B, C);
                    }
                    m(this);
                };
                o.setEnd = function(B, C) {
                    try {
                        this.nativeRange.setEnd(B, C);
                    } catch (A) {
                        this.nativeRange.setStart(B, C);
                        this.nativeRange.setEnd(B, C);
                    }
                    m(this);
                };
                n = function(A, B) {
                    return function(D) {
                        try {
                            this.nativeRange[A](D);
                        } catch (C) {
                            this.nativeRange[B](D);
                            this.nativeRange[A](D);
                        }
                        m(this);
                    };
                };
            }
            o.setStartBefore = n("setStartBefore", "setEndBefore");
            o.setStartAfter = n("setStartAfter", "setEndAfter");
            o.setEndBefore = n("setEndBefore", "setStartBefore");
            o.setEndAfter = n("setEndAfter", "setStartAfter");
            r.selectNodeContents(t);
            if (r.startContainer == t && r.endContainer == t && r.startOffset == 0 && r.endOffset == t.length) {
                o.selectNodeContents = function(A) {
                    this.nativeRange.selectNodeContents(A);
                    m(this);
                };
            } else {
                o.selectNodeContents = function(A) {
                    this.setStart(A, 0);
                    this.setEnd(A, k.getEndOffset(A));
                };
            }
            r.selectNodeContents(t);
            r.setEnd(t, 3);
            var w = document.createRange();
            w.selectNodeContents(t);
            w.setEnd(t, 4);
            w.setStart(t, 2);
            if (r.compareBoundaryPoints(r.START_TO_END, w) == -1 & r.compareBoundaryPoints(r.END_TO_START, w) == 1) {
                o.compareBoundaryPoints = function(B, A) {
                    A = A.nativeRange || A;
                    if (B == A.START_TO_END) {
                        B = A.END_TO_START;
                    } else {
                        if (B == A.END_TO_START) {
                            B = A.START_TO_END;
                        }
                    }
                    return this.nativeRange.compareBoundaryPoints(B, A);
                };
            } else {
                o.compareBoundaryPoints = function(B, A) {
                    return this.nativeRange.compareBoundaryPoints(B, A.nativeRange || A);
                };
            }
            if (j.util.isHostMethod(r, "createContextualFragment")) {
                o.createContextualFragment = function(A) {
                    return this.nativeRange.createContextualFragment(A);
                };
            }
            h.getBody(document).removeChild(t);
            r.detach();
            w.detach();
        })();
        j.createNativeRange = function(m) {
            m = m || document;
            return m.createRange();
        };
    } else {
        if (j.features.implementsTextRange) {
            a = function(m) {
                this.textRange = m;
                this.refresh();
            };
            a.prototype = new k(document);
            a.prototype.refresh = function() {
                var o, m;
                var n = e(this.textRange);
                if (c(this.textRange)) {
                    m = o = f(this.textRange, n, true, true);
                } else {
                    o = f(this.textRange, n, true, false);
                    m = f(this.textRange, n, false, false);
                }
                this.setStart(o.node, o.offset);
                this.setEnd(m.node, m.offset);
            };
            k.copyComparisonConstants(a);
            var g = function() {
                return this;
            }();
            if (typeof g.Range == "undefined") {
                g.Range = a;
            }
            j.createNativeRange = function(m) {
                m = m || document;
                return m.body.createTextRange();
            };
        }
    }
    if (j.features.implementsTextRange) {
        a.rangeToTextRange = function(m) {
            if (m.collapsed) {
                var p = l(new b(m.startContainer, m.startOffset), true);
                return p;
            } else {
                var r = l(new b(m.startContainer, m.startOffset), true);
                var o = l(new b(m.endContainer, m.endOffset), false);
                var n = h.getDocument(m.startContainer).body.createTextRange();
                n.setEndPoint("StartToStart", r);
                n.setEndPoint("EndToEnd", o);
                return n;
            }
        };
    }
    a.prototype.getName = function() {
        return "WrappedRange";
    };
    j.WrappedRange = a;
    j.createRange = function(m) {
        m = m || document;
        return new a(j.createNativeRange(m));
    };
    j.createRangyRange = function(m) {
        m = m || document;
        return new k(m);
    };
    j.createIframeRange = function(m) {
        return j.createRange(h.getIframeDocument(m));
    };
    j.createIframeRangyRange = function(m) {
        return j.createRangyRange(h.getIframeDocument(m));
    };
    j.addCreateMissingNativeApiListener(function(n) {
        var m = n.document;
        if (typeof m.createRange == "undefined") {
            m.createRange = function() {
                return j.createRange(this);
            };
        }
        m = n = null;
    });
});

rangy.createModule("WrappedSelection", function(g, d) {
    g.requireModules([ "DomUtil", "DomRange", "WrappedRange" ]);
    g.config.checkSelectionRanges = true;
    var H = "boolean", X = "_rangySelection", c = g.dom, m = g.util, U = g.DomRange, e = g.WrappedRange, R = g.DOMException, C = c.DomPosition, A, o, Y = "Control";
    function n(aa) {
        return (aa || window).getSelection();
    }
    function s(aa) {
        return (aa || window).document.selection;
    }
    var W = g.util.isHostMethod(window, "getSelection"), Q = g.util.isHostObject(document, "selection");
    var w = Q && (!W || g.config.preferTextRange);
    if (w) {
        A = s;
        g.isSelectionValid = function(ab) {
            var ac = (ab || window).document, aa = ac.selection;
            return aa.type != "None" || c.getDocument(aa.createRange().parentElement()) == ac;
        };
    } else {
        if (W) {
            A = n;
            g.isSelectionValid = function() {
                return true;
            };
        } else {
            d.fail("Neither document.selection or window.getSelection() detected.");
        }
    }
    g.getNativeSelection = A;
    var P = A();
    var F = g.createNativeRange(document);
    var G = c.getBody(document);
    var N = m.areHostObjects(P, [ "anchorNode", "focusNode" ] && m.areHostProperties(P, [ "anchorOffset", "focusOffset" ]));
    g.features.selectionHasAnchorAndFocus = N;
    var r = m.isHostMethod(P, "extend");
    g.features.selectionHasExtend = r;
    var Z = typeof P.rangeCount == "number";
    g.features.selectionHasRangeCount = Z;
    var T = false;
    var S = true;
    if (m.areHostMethods(P, [ "addRange", "getRangeAt", "removeAllRanges" ]) && typeof P.rangeCount == "number" && g.features.implementsDomRange) {
        (function() {
            var ac = document.createElement("iframe");
            G.appendChild(ac);
            var ag = c.getIframeDocument(ac);
            ag.open();
            ag.write("<html><head></head><body>12</body></html>");
            ag.close();
            var ae = c.getIframeWindow(ac).getSelection();
            var ah = ag.documentElement;
            var ad = ah.lastChild, af = ad.firstChild;
            var ab = ag.createRange();
            ab.setStart(af, 1);
            ab.collapse(true);
            ae.addRange(ab);
            S = ae.rangeCount == 1;
            ae.removeAllRanges();
            var aa = ab.cloneRange();
            ab.setStart(af, 0);
            aa.setEnd(af, 2);
            ae.addRange(ab);
            ae.addRange(aa);
            T = ae.rangeCount == 2;
            ab.detach();
            aa.detach();
            G.removeChild(ac);
        })();
    }
    g.features.selectionSupportsMultipleRanges = T;
    g.features.collapsedNonEditableSelectionsSupported = S;
    var f = false, k;
    if (G && m.isHostMethod(G, "createControlRange")) {
        k = G.createControlRange();
        if (m.areHostProperties(k, [ "item", "add" ])) {
            f = true;
        }
    }
    g.features.implementsControlRange = f;
    if (N) {
        o = function(aa) {
            return aa.anchorNode === aa.focusNode && aa.anchorOffset === aa.focusOffset;
        };
    } else {
        o = function(aa) {
            return aa.rangeCount ? aa.getRangeAt(aa.rangeCount - 1).collapsed : false;
        };
    }
    function b(ad, ab, aa) {
        var ac = aa ? "end" : "start", ae = aa ? "start" : "end";
        ad.anchorNode = ab[ac + "Container"];
        ad.anchorOffset = ab[ac + "Offset"];
        ad.focusNode = ab[ae + "Container"];
        ad.focusOffset = ab[ae + "Offset"];
    }
    function z(ab) {
        var aa = ab.nativeSelection;
        ab.anchorNode = aa.anchorNode;
        ab.anchorOffset = aa.anchorOffset;
        ab.focusNode = aa.focusNode;
        ab.focusOffset = aa.focusOffset;
    }
    function K(aa) {
        aa.anchorNode = aa.focusNode = null;
        aa.anchorOffset = aa.focusOffset = 0;
        aa.rangeCount = 0;
        aa.isCollapsed = true;
        aa._ranges.length = 0;
    }
    function M(aa) {
        var ab;
        if (aa instanceof U) {
            ab = aa._selectionNativeRange;
            if (!ab) {
                ab = g.createNativeRange(c.getDocument(aa.startContainer));
                ab.setEnd(aa.endContainer, aa.endOffset);
                ab.setStart(aa.startContainer, aa.startOffset);
                aa._selectionNativeRange = ab;
                aa.attachListener("detach", function() {
                    this._selectionNativeRange = null;
                });
            }
        } else {
            if (aa instanceof e) {
                ab = aa.nativeRange;
            } else {
                if (g.features.implementsDomRange && aa instanceof c.getWindow(aa.startContainer).Range) {
                    ab = aa;
                }
            }
        }
        return ab;
    }
    function l(ac) {
        if (!ac.length || ac[0].nodeType != 1) {
            return false;
        }
        for (var ab = 1, aa = ac.length; ab < aa; ++ab) {
            if (!c.isAncestorOf(ac[0], ac[ab])) {
                return false;
            }
        }
        return true;
    }
    function O(ab) {
        var aa = ab.getNodes();
        if (!l(aa)) {
            throw new Error("getSingleElementFromRange: range " + ab.inspect() + " did not consist of a single element");
        }
        return aa[0];
    }
    function J(aa) {
        return !!aa && typeof aa.text != "undefined";
    }
    function L(ac, ab) {
        var aa = new e(ab);
        ac._ranges = [ aa ];
        b(ac, aa, false);
        ac.rangeCount = 1;
        ac.isCollapsed = aa.collapsed;
    }
    function v(ad) {
        ad._ranges.length = 0;
        if (ad.docSelection.type == "None") {
            K(ad);
        } else {
            var ac = ad.docSelection.createRange();
            if (J(ac)) {
                L(ad, ac);
            } else {
                ad.rangeCount = ac.length;
                var aa, ae = c.getDocument(ac.item(0));
                for (var ab = 0; ab < ad.rangeCount; ++ab) {
                    aa = g.createRange(ae);
                    aa.selectNode(ac.item(ab));
                    ad._ranges.push(aa);
                }
                ad.isCollapsed = ad.rangeCount == 1 && ad._ranges[0].collapsed;
                b(ad, ad._ranges[ad.rangeCount - 1], false);
            }
        }
    }
    function B(ab, ae) {
        var ac = ab.docSelection.createRange();
        var aa = O(ae);
        var ai = c.getDocument(ac.item(0));
        var af = c.getBody(ai).createControlRange();
        for (var ad = 0, ag = ac.length; ad < ag; ++ad) {
            af.add(ac.item(ad));
        }
        try {
            af.add(aa);
        } catch (ah) {
            throw new Error("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");
        }
        af.select();
        v(ab);
    }
    var p;
    if (m.isHostMethod(P, "getRangeAt")) {
        p = function(ac, aa) {
            try {
                return ac.getRangeAt(aa);
            } catch (ab) {
                return null;
            }
        };
    } else {
        if (N) {
            p = function(ab) {
                var ac = c.getDocument(ab.anchorNode);
                var aa = g.createRange(ac);
                aa.setStart(ab.anchorNode, ab.anchorOffset);
                aa.setEnd(ab.focusNode, ab.focusOffset);
                if (aa.collapsed !== this.isCollapsed) {
                    aa.setStart(ab.focusNode, ab.focusOffset);
                    aa.setEnd(ab.anchorNode, ab.anchorOffset);
                }
                return aa;
            };
        }
    }
    function E(aa, ac, ab) {
        this.nativeSelection = aa;
        this.docSelection = ac;
        this._ranges = [];
        this.win = ab;
        this.refresh();
    }
    g.getSelection = function(ac) {
        ac = ac || window;
        var ab = ac[X];
        var aa = A(ac), ad = Q ? s(ac) : null;
        if (ab) {
            ab.nativeSelection = aa;
            ab.docSelection = ad;
            ab.refresh(ac);
        } else {
            ab = new E(aa, ad, ac);
            ac[X] = ab;
        }
        return ab;
    };
    g.getIframeSelection = function(aa) {
        return g.getSelection(c.getIframeWindow(aa));
    };
    var a = E.prototype;
    function j(af, aa) {
        var ag = c.getDocument(aa[0].startContainer);
        var ad = c.getBody(ag).createControlRange();
        for (var ac = 0, ae; ac < rangeCount; ++ac) {
            ae = O(aa[ac]);
            try {
                ad.add(ae);
            } catch (ab) {
                throw new Error("setRanges(): Element within the one of the specified Ranges could not be added to control selection (does it have layout?)");
            }
        }
        ad.select();
        v(af);
    }
    if (!w && N && m.areHostMethods(P, [ "removeAllRanges", "addRange" ])) {
        a.removeAllRanges = function() {
            this.nativeSelection.removeAllRanges();
            K(this);
        };
        var h = function(ac, aa) {
            var ad = U.getRangeDocument(aa);
            var ab = g.createRange(ad);
            ab.collapseToPoint(aa.endContainer, aa.endOffset);
            ac.nativeSelection.addRange(M(ab));
            ac.nativeSelection.extend(aa.startContainer, aa.startOffset);
            ac.refresh();
        };
        if (Z) {
            a.addRange = function(ab, aa) {
                if (f && Q && this.docSelection.type == Y) {
                    B(this, ab);
                } else {
                    if (aa && r) {
                        h(this, ab);
                    } else {
                        var ac;
                        if (T) {
                            ac = this.rangeCount;
                        } else {
                            this.removeAllRanges();
                            ac = 0;
                        }
                        this.nativeSelection.addRange(M(ab));
                        this.rangeCount = this.nativeSelection.rangeCount;
                        if (this.rangeCount == ac + 1) {
                            if (g.config.checkSelectionRanges) {
                                var ad = p(this.nativeSelection, this.rangeCount - 1);
                                if (ad && !U.rangesEqual(ad, ab)) {
                                    ab = new e(ad);
                                }
                            }
                            this._ranges[this.rangeCount - 1] = ab;
                            b(this, ab, t(this.nativeSelection));
                            this.isCollapsed = o(this);
                        } else {
                            this.refresh();
                        }
                    }
                }
            };
        } else {
            a.addRange = function(ab, aa) {
                if (aa && r) {
                    h(this, ab);
                } else {
                    this.nativeSelection.addRange(M(ab));
                    this.refresh();
                }
            };
        }
        a.setRanges = function(ab) {
            if (f && ab.length > 1) {
                j(this, ab);
            } else {
                this.removeAllRanges();
                for (var ac = 0, aa = ab.length; ac < aa; ++ac) {
                    this.addRange(ab[ac]);
                }
            }
        };
    } else {
        if (m.isHostMethod(P, "empty") && m.isHostMethod(F, "select") && f && w) {
            a.removeAllRanges = function() {
                try {
                    this.docSelection.empty();
                    if (this.docSelection.type != "None") {
                        var ad;
                        if (this.anchorNode) {
                            ad = c.getDocument(this.anchorNode);
                        } else {
                            if (this.docSelection.type == Y) {
                                var ab = this.docSelection.createRange();
                                if (ab.length) {
                                    ad = c.getDocument(ab.item(0)).body.createTextRange();
                                }
                            }
                        }
                        if (ad) {
                            var ac = ad.body.createTextRange();
                            ac.select();
                            this.docSelection.empty();
                        }
                    }
                } catch (aa) {}
                K(this);
            };
            a.addRange = function(aa) {
                if (this.docSelection.type == Y) {
                    B(this, aa);
                } else {
                    e.rangeToTextRange(aa).select();
                    this._ranges[0] = aa;
                    this.rangeCount = 1;
                    this.isCollapsed = this._ranges[0].collapsed;
                    b(this, aa, false);
                }
            };
            a.setRanges = function(aa) {
                this.removeAllRanges();
                var ab = aa.length;
                if (ab > 1) {
                    j(this, aa);
                } else {
                    if (ab) {
                        this.addRange(aa[0]);
                    }
                }
            };
        } else {
            d.fail("No means of selecting a Range or TextRange was found");
            return false;
        }
    }
    a.getRangeAt = function(aa) {
        if (aa < 0 || aa >= this.rangeCount) {
            throw new R("INDEX_SIZE_ERR");
        } else {
            return this._ranges[aa];
        }
    };
    var I;
    if (w) {
        I = function(ab) {
            var aa;
            if (g.isSelectionValid(ab.win)) {
                aa = ab.docSelection.createRange();
            } else {
                aa = c.getBody(ab.win.document).createTextRange();
                aa.collapse(true);
            }
            if (ab.docSelection.type == Y) {
                v(ab);
            } else {
                if (J(aa)) {
                    L(ab, aa);
                } else {
                    K(ab);
                }
            }
        };
    } else {
        if (m.isHostMethod(P, "getRangeAt") && typeof P.rangeCount == "number") {
            I = function(ac) {
                if (f && Q && ac.docSelection.type == Y) {
                    v(ac);
                } else {
                    ac._ranges.length = ac.rangeCount = ac.nativeSelection.rangeCount;
                    if (ac.rangeCount) {
                        for (var ab = 0, aa = ac.rangeCount; ab < aa; ++ab) {
                            ac._ranges[ab] = new g.WrappedRange(ac.nativeSelection.getRangeAt(ab));
                        }
                        b(ac, ac._ranges[ac.rangeCount - 1], t(ac.nativeSelection));
                        ac.isCollapsed = o(ac);
                    } else {
                        K(ac);
                    }
                }
            };
        } else {
            if (N && typeof P.isCollapsed == H && typeof F.collapsed == H && g.features.implementsDomRange) {
                I = function(ac) {
                    var aa, ab = ac.nativeSelection;
                    if (ab.anchorNode) {
                        aa = p(ab, 0);
                        ac._ranges = [ aa ];
                        ac.rangeCount = 1;
                        z(ac);
                        ac.isCollapsed = o(ac);
                    } else {
                        K(ac);
                    }
                };
            } else {
                d.fail("No means of obtaining a Range or TextRange from the user's selection was found");
                return false;
            }
        }
    }
    a.refresh = function(ab) {
        var aa = ab ? this._ranges.slice(0) : null;
        I(this);
        if (ab) {
            var ac = aa.length;
            if (ac != this._ranges.length) {
                return false;
            }
            while (ac--) {
                if (!U.rangesEqual(aa[ac], this._ranges[ac])) {
                    return false;
                }
            }
            return true;
        }
    };
    var D = function(ae, ac) {
        var ab = ae.getAllRanges(), af = false;
        ae.removeAllRanges();
        for (var ad = 0, aa = ab.length; ad < aa; ++ad) {
            if (af || ac !== ab[ad]) {
                ae.addRange(ab[ad]);
            } else {
                af = true;
            }
        }
        if (!ae.rangeCount) {
            K(ae);
        }
    };
    if (f) {
        a.removeRange = function(ae) {
            if (this.docSelection.type == Y) {
                var ac = this.docSelection.createRange();
                var aa = O(ae);
                var ai = c.getDocument(ac.item(0));
                var ag = c.getBody(ai).createControlRange();
                var ab, ah = false;
                for (var ad = 0, af = ac.length; ad < af; ++ad) {
                    ab = ac.item(ad);
                    if (ab !== aa || ah) {
                        ag.add(ac.item(ad));
                    } else {
                        ah = true;
                    }
                }
                ag.select();
                v(this);
            } else {
                D(this, ae);
            }
        };
    } else {
        a.removeRange = function(aa) {
            D(this, aa);
        };
    }
    var t;
    if (!w && N && g.features.implementsDomRange) {
        t = function(ab) {
            var aa = false;
            if (ab.anchorNode) {
                aa = c.comparePoints(ab.anchorNode, ab.anchorOffset, ab.focusNode, ab.focusOffset) == 1;
            }
            return aa;
        };
        a.isBackwards = function() {
            return t(this);
        };
    } else {
        t = a.isBackwards = function() {
            return false;
        };
    }
    a.toString = function() {
        var ac = [];
        for (var ab = 0, aa = this.rangeCount; ab < aa; ++ab) {
            ac[ab] = "" + this._ranges[ab];
        }
        return ac.join("");
    };
    function V(ab, aa) {
        if (ab.anchorNode && c.getDocument(ab.anchorNode) !== c.getDocument(aa)) {
            throw new R("WRONG_DOCUMENT_ERR");
        }
    }
    a.collapse = function(ab, ac) {
        V(this, ab);
        var aa = g.createRange(c.getDocument(ab));
        aa.collapseToPoint(ab, ac);
        this.removeAllRanges();
        this.addRange(aa);
        this.isCollapsed = true;
    };
    a.collapseToStart = function() {
        if (this.rangeCount) {
            var aa = this._ranges[0];
            this.collapse(aa.startContainer, aa.startOffset);
        } else {
            throw new R("INVALID_STATE_ERR");
        }
    };
    a.collapseToEnd = function() {
        if (this.rangeCount) {
            var aa = this._ranges[this.rangeCount - 1];
            this.collapse(aa.endContainer, aa.endOffset);
        } else {
            throw new R("INVALID_STATE_ERR");
        }
    };
    a.selectAllChildren = function(ab) {
        V(this, ab);
        var aa = g.createRange(c.getDocument(ab));
        aa.selectNodeContents(ab);
        this.removeAllRanges();
        this.addRange(aa);
    };
    a.deleteFromDocument = function() {
        if (f && Q && this.docSelection.type == Y) {
            var ae = this.docSelection.createRange();
            var ad;
            while (ae.length) {
                ad = ae.item(0);
                ae.remove(ad);
                ad.parentNode.removeChild(ad);
            }
            this.refresh();
        } else {
            if (this.rangeCount) {
                var ab = this.getAllRanges();
                this.removeAllRanges();
                for (var ac = 0, aa = ab.length; ac < aa; ++ac) {
                    ab[ac].deleteContents();
                }
                this.addRange(ab[aa - 1]);
            }
        }
    };
    a.getAllRanges = function() {
        return this._ranges.slice(0);
    };
    a.setSingleRange = function(aa) {
        this.setRanges([ aa ]);
    };
    a.containsNode = function(ad, ab) {
        for (var ac = 0, aa = this._ranges.length; ac < aa; ++ac) {
            if (this._ranges[ac].containsNode(ad, ab)) {
                return true;
            }
        }
        return false;
    };
    a.toHtml = function() {
        var ad = "";
        if (this.rangeCount) {
            var ab = U.getRangeDocument(this._ranges[0]).createElement("div");
            for (var ac = 0, aa = this._ranges.length; ac < aa; ++ac) {
                ab.appendChild(this._ranges[ac].cloneContents());
            }
            ad = ab.innerHTML;
        }
        return ad;
    };
    function u(ag) {
        var af = [];
        var ad = new C(ag.anchorNode, ag.anchorOffset);
        var ab = new C(ag.focusNode, ag.focusOffset);
        var ac = typeof ag.getName == "function" ? ag.getName() : "Selection";
        if (typeof ag.rangeCount != "undefined") {
            for (var ae = 0, aa = ag.rangeCount; ae < aa; ++ae) {
                af[ae] = U.inspect(ag.getRangeAt(ae));
            }
        }
        return "[" + ac + "(Ranges: " + af.join(", ") + ")(anchor: " + ad.inspect() + ", focus: " + ab.inspect() + "]";
    }
    a.getName = function() {
        return "WrappedSelection";
    };
    a.inspect = function() {
        return u(this);
    };
    a.detach = function() {
        this.win[X] = null;
        this.win = this.anchorNode = this.focusNode = null;
    };
    E.inspect = u;
    g.Selection = E;
    g.selectionPrototype = a;
    g.addCreateMissingNativeApiListener(function(aa) {
        if (typeof aa.getSelection == "undefined") {
            aa.getSelection = function() {
                return g.getSelection(this);
            };
        }
        aa = null;
    });
});

var Base = function() {};

Base.extend = function(b, e) {
    var f = Base.prototype.extend;
    Base._prototyping = true;
    var d = new this();
    f.call(d, b);
    d.base = function() {};
    delete Base._prototyping;
    var c = d.constructor;
    var a = d.constructor = function() {
        if (!Base._prototyping) {
            if (this._constructing || this.constructor == a) {
                this._constructing = true;
                c.apply(this, arguments);
                delete this._constructing;
            } else {
                if (arguments[0] != null) {
                    return (arguments[0].extend || f).call(arguments[0], d);
                }
            }
        }
    };
    a.ancestor = this;
    a.extend = this.extend;
    a.forEach = this.forEach;
    a.implement = this.implement;
    a.prototype = d;
    a.toString = this.toString;
    a.valueOf = function(g) {
        return g == "object" ? a : c.valueOf();
    };
    f.call(a, e);
    if (typeof a.init == "function") {
        a.init();
    }
    return a;
};

Base.prototype = {
    extend: function(b, h) {
        if (arguments.length > 1) {
            var e = this[b];
            if (e && typeof h == "function" && (!e.valueOf || e.valueOf() != h.valueOf()) && /\bbase\b/.test(h)) {
                var a = h.valueOf();
                h = function() {
                    var l = this.base || Base.prototype.base;
                    this.base = e;
                    var k = a.apply(this, arguments);
                    this.base = l;
                    return k;
                };
                h.valueOf = function(k) {
                    return k == "object" ? h : a;
                };
                h.toString = Base.toString;
            }
            this[b] = h;
        } else {
            if (b) {
                var g = Base.prototype.extend;
                if (!Base._prototyping && typeof this != "function") {
                    g = this.extend || g;
                }
                var d = {
                    toSource: null
                };
                var f = [ "constructor", "toString", "valueOf" ];
                var c = Base._prototyping ? 0 : 1;
                while (j = f[c++]) {
                    if (b[j] != d[j]) {
                        g.call(this, j, b[j]);
                    }
                }
                for (var j in b) {
                    if (!d[j]) {
                        g.call(this, j, b[j]);
                    }
                }
            }
        }
        return this;
    }
};

Base = Base.extend({
    constructor: function() {
        this.extend(arguments[0]);
    }
}, {
    ancestor: Object,
    version: "1.1",
    forEach: function(a, d, c) {
        for (var b in a) {
            if (this.prototype[b] === undefined) {
                d.call(c, a[b], b, a);
            }
        }
    },
    implement: function() {
        for (var a = 0; a < arguments.length; a++) {
            if (typeof arguments[a] == "function") {
                arguments[a](this.prototype);
            } else {
                this.prototype.extend(arguments[a]);
            }
        }
        return this;
    },
    toString: function() {
        return String(this.valueOf());
    }
});

wysihtml5.browser = function() {
    var f = navigator.userAgent, e = document.createElement("div"), c = f.indexOf("MSIE") !== -1 && f.indexOf("Opera") === -1, a = f.indexOf("Gecko") !== -1 && f.indexOf("KHTML") === -1, d = f.indexOf("AppleWebKit/") !== -1, g = f.indexOf("Chrome/") !== -1, b = f.indexOf("Opera/") !== -1;
    function h(j) {
        return (/ipad|iphone|ipod/.test(j) && j.match(/ os (\d+).+? like mac os x/) || [ , 0 ])[1];
    }
    return {
        USER_AGENT: f,
        supported: function() {
            var l = this.USER_AGENT.toLowerCase(), n = "contentEditable" in e, j = document.execCommand && document.queryCommandSupported && document.queryCommandState, k = document.querySelector && document.querySelectorAll, m = this.isIos() && h(l) < 5 || l.indexOf("opera mobi") !== -1 || l.indexOf("hpwos/") !== -1;
            return n && j && k && !m;
        },
        isTouchDevice: function() {
            return this.supportsEvent("touchmove");
        },
        isIos: function() {
            var j = this.USER_AGENT.toLowerCase();
            return j.indexOf("webkit") !== -1 && j.indexOf("mobile") !== -1;
        },
        supportsSandboxedIframes: function() {
            return c;
        },
        throwsMixedContentWarningWhenIframeSrcIsEmpty: function() {
            return !("querySelector" in document);
        },
        displaysCaretInEmptyContentEditableCorrectly: function() {
            return !a;
        },
        hasCurrentStyleProperty: function() {
            return "currentStyle" in e;
        },
        insertsLineBreaksOnReturn: function() {
            return a;
        },
        supportsPlaceholderAttributeOn: function(j) {
            return "placeholder" in j;
        },
        supportsEvent: function(j) {
            return "on" + j in e || function() {
                e.setAttribute("on" + j, "return;");
                return typeof e["on" + j] === "function";
            }();
        },
        supportsEventsInIframeCorrectly: function() {
            return !b;
        },
        firesOnDropOnlyWhenOnDragOverIsCancelled: function() {
            return d || a;
        },
        supportsDataTransfer: function() {
            try {
                return d && (window.Clipboard || window.DataTransfer).prototype.getData;
            } catch (j) {
                return false;
            }
        },
        supportsHTML5Tags: function(l) {
            var k = l.createElement("div"), j = "<article>foo</article>";
            k.innerHTML = j;
            return k.innerHTML.toLowerCase() === j;
        },
        supportsCommand: function() {
            var k = {
                formatBlock: c,
                insertUnorderedList: c || b || d,
                insertOrderedList: c || b || d
            };
            var j = {
                insertHTML: a
            };
            return function(m, o) {
                var p = k[o];
                if (!p) {
                    try {
                        return m.queryCommandSupported(o);
                    } catch (n) {}
                    try {
                        return m.queryCommandEnabled(o);
                    } catch (l) {
                        return !!j[o];
                    }
                }
                return false;
            };
        }(),
        doesAutoLinkingInContentEditable: function() {
            return c;
        },
        canDisableAutoLinking: function() {
            return this.supportsCommand(document, "AutoUrlDetect");
        },
        clearsContentEditableCorrectly: function() {
            return a || b || d;
        },
        supportsGetAttributeCorrectly: function() {
            var j = document.createElement("td");
            return j.getAttribute("rowspan") != "1";
        },
        canSelectImagesInContentEditable: function() {
            return a || c || b;
        },
        clearsListsInContentEditableCorrectly: function() {
            return a || c || d;
        },
        autoScrollsToCaret: function() {
            return !d;
        },
        autoClosesUnclosedTags: function() {
            var l = e.cloneNode(false), j, k;
            l.innerHTML = "<p><div></div>";
            k = l.innerHTML.toLowerCase();
            j = k === "<p></p><div></div>" || k === "<p><div></div></p>";
            this.autoClosesUnclosedTags = function() {
                return j;
            };
            return j;
        },
        supportsNativeGetElementsByClassName: function() {
            return String(document.getElementsByClassName).indexOf("[native code]") !== -1;
        },
        supportsSelectionModify: function() {
            return "getSelection" in window && "modify" in window.getSelection();
        },
        supportsClassList: function() {
            return "classList" in e;
        },
        needsSpaceAfterLineBreak: function() {
            return b;
        },
        supportsSpeechApiOn: function(j) {
            var k = f.match(/Chrome\/(\d+)/) || [ , 0 ];
            return k[1] >= 11 && ("onwebkitspeechchange" in j || "speech" in j);
        },
        crashesWhenDefineProperty: function(j) {
            return c && (j === "XMLHttpRequest" || j === "XDomainRequest");
        },
        doesAsyncFocus: function() {
            return c;
        },
        hasProblemsSettingCaretAfterImg: function() {
            return c;
        },
        hasUndoInContextMenu: function() {
            return a || g || b;
        }
    };
}();

wysihtml5.lang.array = function(a) {
    return {
        contains: function(d) {
            if (a.indexOf) {
                return a.indexOf(d) !== -1;
            } else {
                for (var b = 0, c = a.length; b < c; b++) {
                    if (a[b] === d) {
                        return true;
                    }
                }
                return false;
            }
        },
        without: function(b) {
            b = wysihtml5.lang.array(b);
            var d = [], c = 0, e = a.length;
            for (;c < e; c++) {
                if (!b.contains(a[c])) {
                    d.push(a[c]);
                }
            }
            return d;
        },
        get: function() {
            var c = 0, d = a.length, b = [];
            for (;c < d; c++) {
                b.push(a[c]);
            }
            return b;
        }
    };
};

wysihtml5.lang.Dispatcher = Base.extend({
    observe: function(a, b) {
        this.events = this.events || {};
        this.events[a] = this.events[a] || [];
        this.events[a].push(b);
        return this;
    },
    on: function() {
        return this.observe.apply(this, wysihtml5.lang.array(arguments).get());
    },
    fire: function(b, d) {
        this.events = this.events || {};
        var a = this.events[b] || [], c = 0;
        for (;c < a.length; c++) {
            a[c].call(this, d);
        }
        return this;
    },
    stopObserving: function(b, d) {
        this.events = this.events || {};
        var c = 0, a, e;
        if (b) {
            a = this.events[b] || [], e = [];
            for (;c < a.length; c++) {
                if (a[c] !== d && d) {
                    e.push(a[c]);
                }
            }
            this.events[b] = e;
        } else {
            this.events = {};
        }
        return this;
    }
});

wysihtml5.lang.object = function(a) {
    return {
        merge: function(b) {
            for (var c in b) {
                a[c] = b[c];
            }
            return this;
        },
        get: function() {
            return a;
        },
        clone: function() {
            var b = {}, c;
            for (c in a) {
                b[c] = a[c];
            }
            return b;
        },
        isArray: function() {
            return Object.prototype.toString.call(a) === "[object Array]";
        }
    };
};

(function() {
    var b = /^\s+/, a = /\s+$/;
    wysihtml5.lang.string = function(c) {
        c = String(c);
        return {
            trim: function() {
                return c.replace(b, "").replace(a, "");
            },
            interpolate: function(e) {
                for (var d in e) {
                    c = this.replace("#{" + d + "}").by(e[d]);
                }
                return c;
            },
            replace: function(d) {
                return {
                    by: function(e) {
                        return c.split(d).join(e);
                    }
                };
            }
        };
    };
})();

(function(m) {
    var k = m.lang.array([ "CODE", "PRE", "A", "SCRIPT", "HEAD", "TITLE", "STYLE" ]), l = /((https?:\/\/|www\.)[^\s<]{3,})/gi, e = /([^\w\/\-](,?))$/i, c = 100, f = {
        ")": "(",
        "]": "[",
        "}": "{"
    };
    function b(n) {
        if (j(n)) {
            return n;
        }
        if (n === n.ownerDocument.documentElement) {
            n = n.ownerDocument.body;
        }
        return a(n);
    }
    function g(n) {
        return n.replace(l, function(r, p) {
            var t = (p.match(e) || [])[1] || "", o = f[t];
            p = p.replace(e, "");
            if (p.split(o).length > p.split(t).length) {
                p = p + t;
                t = "";
            }
            var s = p, u = p;
            if (p.length > c) {
                u = u.substr(0, c) + "...";
            }
            if (s.substr(0, 4) === "www.") {
                s = "http://" + s;
            }
            return '<a href="' + s + '">' + u + "</a>" + t;
        });
    }
    function d(o) {
        var n = o._wysihtml5_tempElement;
        if (!n) {
            n = o._wysihtml5_tempElement = o.createElement("div");
        }
        return n;
    }
    function h(p) {
        var o = p.parentNode, n = d(o.ownerDocument);
        n.innerHTML = "<span></span>" + g(p.data);
        n.removeChild(n.firstChild);
        while (n.firstChild) {
            o.insertBefore(n.firstChild, p);
        }
        o.removeChild(p);
    }
    function j(n) {
        var o;
        while (n.parentNode) {
            n = n.parentNode;
            o = n.nodeName;
            if (k.contains(o)) {
                return true;
            } else {
                if (o === "body") {
                    return false;
                }
            }
        }
        return false;
    }
    function a(o) {
        if (k.contains(o.nodeName)) {
            return;
        }
        if (o.nodeType === m.TEXT_NODE && o.data.match(l)) {
            h(o);
            return;
        }
        var r = m.lang.array(o.childNodes).get(), p = r.length, n = 0;
        for (;n < p; n++) {
            a(r[n]);
        }
        return o;
    }
    m.dom.autoLink = b;
    m.dom.autoLink.URL_REG_EXP = l;
})(wysihtml5);

(function(c) {
    var b = c.browser.supportsClassList(), a = c.dom;
    a.addClass = function(d, e) {
        if (b) {
            return d.classList.add(e);
        }
        if (a.hasClass(d, e)) {
            return;
        }
        d.className += " " + e;
    };
    a.removeClass = function(d, e) {
        if (b) {
            return d.classList.remove(e);
        }
        d.className = d.className.replace(new RegExp("(^|\\s+)" + e + "(\\s+|$)"), " ");
    };
    a.hasClass = function(d, e) {
        if (b) {
            return d.classList.contains(e);
        }
        var f = d.className;
        return f.length > 0 && (f == e || new RegExp("(^|\\s)" + e + "(\\s|$)").test(f));
    };
})(wysihtml5);

wysihtml5.dom.contains = function() {
    var a = document.documentElement;
    if (a.contains) {
        return function(b, c) {
            if (c.nodeType !== wysihtml5.ELEMENT_NODE) {
                c = c.parentNode;
            }
            return b !== c && b.contains(c);
        };
    } else {
        if (a.compareDocumentPosition) {
            return function(b, c) {
                return !!(b.compareDocumentPosition(c) & 16);
            };
        }
    }
}();

wysihtml5.dom.convertToList = function() {
    function b(f, e) {
        var d = f.createElement("li");
        e.appendChild(d);
        return d;
    }
    function c(e, d) {
        return e.createElement(d);
    }
    function a(f, n) {
        if (f.nodeName === "UL" || f.nodeName === "OL" || f.nodeName === "MENU") {
            return f;
        }
        var p = f.ownerDocument, k = c(p, n), l = f.querySelectorAll("br"), j = l.length, s, r, d, m, h, t, g, o, e;
        for (e = 0; e < j; e++) {
            m = l[e];
            while ((h = m.parentNode) && h !== f && h.lastChild === m) {
                if (wysihtml5.dom.getStyle("display").from(h) === "block") {
                    h.removeChild(m);
                    break;
                }
                wysihtml5.dom.insert(m).after(m.parentNode);
            }
        }
        s = wysihtml5.lang.array(f.childNodes).get();
        r = s.length;
        for (e = 0; e < r; e++) {
            o = o || b(p, k);
            d = s[e];
            t = wysihtml5.dom.getStyle("display").from(d) === "block";
            g = d.nodeName === "BR";
            if (t) {
                o = o.firstChild ? b(p, k) : o;
                o.appendChild(d);
                o = null;
                continue;
            }
            if (g) {
                o = o.firstChild ? null : o;
                continue;
            }
            o.appendChild(d);
        }
        f.parentNode.replaceChild(k, f);
        return k;
    }
    return a;
}();

wysihtml5.dom.copyAttributes = function(a) {
    return {
        from: function(b) {
            return {
                to: function(c) {
                    var f, d = 0, e = a.length;
                    for (;d < e; d++) {
                        f = a[d];
                        if (typeof b[f] !== "undefined" && b[f] !== "") {
                            c[f] = b[f];
                        }
                    }
                    return {
                        andTo: arguments.callee
                    };
                }
            };
        }
    };
};

(function(b) {
    var d = [ "-webkit-box-sizing", "-moz-box-sizing", "-ms-box-sizing", "box-sizing" ];
    var c = function(e) {
        if (a(e)) {
            return parseInt(b.getStyle("width").from(e), 10) < e.offsetWidth;
        }
        return false;
    };
    var a = function(f) {
        var e = 0, g = d.length;
        for (;e < g; e++) {
            if (b.getStyle(d[e]).from(f) === "border-box") {
                return d[e];
            }
        }
    };
    b.copyStyles = function(e) {
        return {
            from: function(g) {
                if (c(g)) {
                    e = wysihtml5.lang.array(e).without(d);
                }
                var h = "", j = e.length, f = 0, k;
                for (;f < j; f++) {
                    k = e[f];
                    h += k + ":" + b.getStyle(k).from(g) + ";";
                }
                return {
                    to: function(l) {
                        b.setStyles(h).on(l);
                        return {
                            andTo: arguments.callee
                        };
                    }
                };
            }
        };
    };
})(wysihtml5.dom);

(function(a) {
    a.dom.delegate = function(c, b, d, e) {
        return a.dom.observe(c, d, function(g) {
            var h = g.target, f = a.lang.array(c.querySelectorAll(b));
            while (h && h !== c) {
                if (f.contains(h)) {
                    e.call(h, g);
                    break;
                }
                h = h.parentNode;
            }
        });
    };
})(wysihtml5);

wysihtml5.dom.getAsDom = function() {
    var a = function(g, f) {
        var d = f.createElement("div");
        d.style.display = "none";
        f.body.appendChild(d);
        try {
            d.innerHTML = g;
        } catch (h) {}
        f.body.removeChild(d);
        return d;
    };
    var c = function(e) {
        if (e._wysihtml5_supportsHTML5Tags) {
            return;
        }
        for (var d = 0, f = b.length; d < f; d++) {
            e.createElement(b[d]);
        }
        e._wysihtml5_supportsHTML5Tags = true;
    };
    var b = [ "abbr", "article", "aside", "audio", "bdi", "canvas", "command", "datalist", "details", "figcaption", "figure", "footer", "header", "hgroup", "keygen", "mark", "meter", "nav", "output", "progress", "rp", "rt", "ruby", "svg", "section", "source", "summary", "time", "track", "video", "wbr" ];
    return function(f, e) {
        e = e || document;
        var d;
        if (typeof f === "object" && f.nodeType) {
            d = e.createElement("div");
            d.appendChild(f);
        } else {
            if (wysihtml5.browser.supportsHTML5Tags(e)) {
                d = e.createElement("div");
                d.innerHTML = f;
            } else {
                c(e);
                d = a(f, e);
            }
        }
        return d;
    };
}();

wysihtml5.dom.getParentElement = function() {
    function a(g, f) {
        if (!f || !f.length) {
            return true;
        }
        if (typeof f === "string") {
            return g === f;
        } else {
            return wysihtml5.lang.array(f).contains(g);
        }
    }
    function c(f) {
        return f.nodeType === wysihtml5.ELEMENT_NODE;
    }
    function b(f, g, h) {
        var j = (f.className || "").match(h) || [];
        if (!g) {
            return !!j.length;
        }
        return j[j.length - 1] === g;
    }
    function e(f, h, g) {
        while (g-- && f && f.nodeName !== "BODY") {
            if (a(f.nodeName, h)) {
                return f;
            }
            f = f.parentNode;
        }
        return null;
    }
    function d(g, k, f, j, h) {
        while (h-- && g && g.nodeName !== "BODY") {
            if (c(g) && a(g.nodeName, k) && b(g, f, j)) {
                return g;
            }
            g = g.parentNode;
        }
        return null;
    }
    return function(g, f, h) {
        h = h || 50;
        if (f.className || f.classRegExp) {
            return d(g, f.nodeName, f.className, f.classRegExp, h);
        } else {
            return e(g, f.nodeName, h);
        }
    };
}();

wysihtml5.dom.getStyle = function() {
    var b = {
        float: "styleFloat" in document.createElement("div").style ? "styleFloat" : "cssFloat"
    }, c = /\-[a-z]/g;
    function a(d) {
        return d.replace(c, function(e) {
            return e.charAt(1).toUpperCase();
        });
    }
    return function(d) {
        return {
            from: function(k) {
                if (k.nodeType !== wysihtml5.ELEMENT_NODE) {
                    return;
                }
                var p = k.ownerDocument, l = b[d] || a(d), g = k.style, h = k.currentStyle, r = g[l];
                if (r) {
                    return r;
                }
                if (h) {
                    try {
                        return h[l];
                    } catch (n) {}
                }
                var m = p.defaultView || p.parentWindow, o = (d === "height" || d === "width") && k.nodeName === "TEXTAREA", j, f;
                if (m.getComputedStyle) {
                    if (o) {
                        j = g.overflow;
                        g.overflow = "hidden";
                    }
                    f = m.getComputedStyle(k, null).getPropertyValue(d);
                    if (o) {
                        g.overflow = j || "";
                    }
                    return f;
                }
            }
        };
    };
}();

wysihtml5.dom.hasElementWithTagName = function() {
    var c = {}, b = 1;
    function a(d) {
        return d._wysihtml5_identifier || (d._wysihtml5_identifier = b++);
    }
    return function(f, e) {
        var d = a(f) + ":" + e, g = c[d];
        if (!g) {
            g = c[d] = f.getElementsByTagName(e);
        }
        return g.length > 0;
    };
}();

(function(d) {
    var c = {}, b = 1;
    function a(e) {
        return e._wysihtml5_identifier || (e._wysihtml5_identifier = b++);
    }
    d.dom.hasElementWithClassName = function(g, f) {
        if (!d.browser.supportsNativeGetElementsByClassName()) {
            return !!g.querySelector("." + f);
        }
        var e = a(g) + ":" + f, h = c[e];
        if (!h) {
            h = c[e] = g.getElementsByClassName(f);
        }
        return h.length > 0;
    };
})(wysihtml5);

wysihtml5.dom.insert = function(a) {
    return {
        after: function(b) {
            b.parentNode.insertBefore(a, b.nextSibling);
        },
        before: function(b) {
            b.parentNode.insertBefore(a, b);
        },
        into: function(b) {
            b.appendChild(a);
        }
    };
};

wysihtml5.dom.insertCSS = function(a) {
    a = a.join("\n");
    return {
        into: function(d) {
            var c = d.head || d.getElementsByTagName("head")[0], b = d.createElement("style");
            b.type = "text/css";
            if (b.styleSheet) {
                b.styleSheet.cssText = a;
            } else {
                b.appendChild(d.createTextNode(a));
            }
            if (c) {
                c.appendChild(b);
            }
        }
    };
};

wysihtml5.dom.observe = function(c, g, d) {
    g = typeof g === "string" ? [ g ] : g;
    var f, a, b = 0, e = g.length;
    for (;b < e; b++) {
        a = g[b];
        if (c.addEventListener) {
            c.addEventListener(a, d, false);
        } else {
            f = function(h) {
                if (!("target" in h)) {
                    h.target = h.srcElement;
                }
                h.preventDefault = h.preventDefault || function() {
                    this.returnValue = false;
                };
                h.stopPropagation = h.stopPropagation || function() {
                    this.cancelBubble = true;
                };
                d.call(c, h);
            };
            c.attachEvent("on" + a, f);
        }
    }
    return {
        stop: function() {
            var h, j = 0, k = g.length;
            for (;j < k; j++) {
                h = g[j];
                if (c.removeEventListener) {
                    c.removeEventListener(h, d, false);
                } else {
                    c.detachEvent("on" + h, f);
                }
            }
        }
    };
};

wysihtml5.dom.parse = function() {
    var a = {
        1: e,
        3: m
    }, p = "span", g = /\s+/, k = {
        tags: {},
        classes: {}
    }, o = {};
    function d(w, B, r, t) {
        wysihtml5.lang.object(o).merge(k).merge(B).get();
        r = r || w.ownerDocument || document;
        var v = r.createDocumentFragment(), s = typeof w === "string", u, A, z;
        if (s) {
            u = wysihtml5.dom.getAsDom(w, r);
        } else {
            u = w;
        }
        while (u.firstChild) {
            z = u.firstChild;
            u.removeChild(z);
            A = f(z, t);
            if (A) {
                v.appendChild(A);
            }
        }
        u.innerHTML = "";
        u.appendChild(v);
        return s ? wysihtml5.quirks.getCorrectInnerHTML(u) : u;
    }
    function f(z, w) {
        var v = z.nodeType, u = z.childNodes, t = u.length, s, A = a[v], r = 0;
        s = A && A(z);
        if (!s) {
            return null;
        }
        for (r = 0; r < t; r++) {
            newChild = f(u[r], w);
            if (newChild) {
                s.appendChild(newChild);
            }
        }
        if (w && s.childNodes.length <= 1 && s.nodeName.toLowerCase() === p && !s.attributes.length) {
            return s.firstChild;
        }
        return s;
    }
    function e(w) {
        var v, u, t, s = o.tags, z = w.nodeName.toLowerCase(), r = w.scopeName;
        if (w._wysihtml5) {
            return null;
        }
        w._wysihtml5 = 1;
        if (w.className === "wysihtml5-temp") {
            return null;
        }
        if (r && r != "HTML") {
            z = r + ":" + z;
        }
        if ("outerHTML" in w) {
            if (!wysihtml5.browser.autoClosesUnclosedTags() && w.nodeName === "P" && w.outerHTML.slice(-4).toLowerCase() !== "</p>") {
                z = "div";
            }
        }
        if (z in s) {
            v = s[z];
            if (!v || v.remove) {
                return null;
            }
            v = typeof v === "string" ? {
                rename_tag: v
            } : v;
        } else {
            if (w.firstChild) {
                v = {
                    rename_tag: p
                };
            } else {
                return null;
            }
        }
        u = w.ownerDocument.createElement(v.rename_tag || z);
        b(w, u, v);
        w = null;
        return u;
    }
    function b(G, r, z) {
        var C = {}, N = z.set_class, E = z.add_class, J = z.set_attributes, w = z.check_attributes, v = o.classes, I = 0, L = [], O = [], u = [], H = [], A, D, t, B, F, M, s;
        if (J) {
            C = wysihtml5.lang.object(J).clone();
        }
        if (w) {
            for (F in w) {
                s = h[w[F]];
                if (!s) {
                    continue;
                }
                M = s(j(G, F));
                if (typeof M === "string") {
                    C[F] = M;
                }
            }
        }
        if (N) {
            L.push(N);
        }
        if (E) {
            for (F in E) {
                s = l[E[F]];
                if (!s) {
                    continue;
                }
                B = s(j(G, F));
                if (typeof B === "string") {
                    L.push(B);
                }
            }
        }
        v["_wysihtml5-temp-placeholder"] = 1;
        H = G.getAttribute("class");
        if (H) {
            L = L.concat(H.split(g));
        }
        A = L.length;
        for (;I < A; I++) {
            t = L[I];
            if (v[t]) {
                O.push(t);
            }
        }
        D = O.length;
        while (D--) {
            t = O[D];
            if (!wysihtml5.lang.array(u).contains(t)) {
                u.unshift(t);
            }
        }
        if (u.length) {
            C["class"] = u.join(" ");
        }
        for (F in C) {
            try {
                r.setAttribute(F, C[F]);
            } catch (K) {}
        }
        if (C.src) {
            if (typeof C.width !== "undefined") {
                r.setAttribute("width", C.width);
            }
            if (typeof C.height !== "undefined") {
                r.setAttribute("height", C.height);
            }
        }
    }
    var n = !wysihtml5.browser.supportsGetAttributeCorrectly();
    function j(t, s) {
        s = s.toLowerCase();
        var v = t.nodeName;
        if (v == "IMG" && s == "src" && c(t) === true) {
            return t.src;
        } else {
            if (n && "outerHTML" in t) {
                var u = t.outerHTML.toLowerCase(), r = u.indexOf(" " + s + "=") != -1;
                return r ? t.getAttribute(s) : null;
            } else {
                return t.getAttribute(s);
            }
        }
    }
    function c(r) {
        try {
            return r.complete && !r.mozMatchesSelector(":-moz-broken");
        } catch (s) {
            if (r.complete && r.readyState === "complete") {
                return true;
            }
        }
    }
    function m(r) {
        return r.ownerDocument.createTextNode(r.data);
    }
    var h = {
        url: function() {
            var r = /^https?:\/\//i;
            return function(s) {
                if (!s || !s.match(r)) {
                    return null;
                }
                return s.replace(r, function(t) {
                    return t.toLowerCase();
                });
            };
        }(),
        alt: function() {
            var r = /[^ a-z0-9_\-]/gi;
            return function(s) {
                if (!s) {
                    return "";
                }
                return s.replace(r, "");
            };
        }(),
        numbers: function() {
            var r = /\D/g;
            return function(s) {
                s = (s || "").replace(r, "");
                return s || null;
            };
        }()
    };
    var l = {
        align_img: function() {
            var r = {
                left: "wysiwyg-float-left",
                right: "wysiwyg-float-right"
            };
            return function(s) {
                return r[String(s).toLowerCase()];
            };
        }(),
        align_text: function() {
            var r = {
                left: "wysiwyg-text-align-left",
                right: "wysiwyg-text-align-right",
                center: "wysiwyg-text-align-center",
                justify: "wysiwyg-text-align-justify"
            };
            return function(s) {
                return r[String(s).toLowerCase()];
            };
        }(),
        clear_br: function() {
            var r = {
                left: "wysiwyg-clear-left",
                right: "wysiwyg-clear-right",
                both: "wysiwyg-clear-both",
                all: "wysiwyg-clear-both"
            };
            return function(s) {
                return r[String(s).toLowerCase()];
            };
        }(),
        size_font: function() {
            var r = {
                1: "wysiwyg-font-size-xx-small",
                2: "wysiwyg-font-size-small",
                3: "wysiwyg-font-size-medium",
                4: "wysiwyg-font-size-large",
                5: "wysiwyg-font-size-x-large",
                6: "wysiwyg-font-size-xx-large",
                7: "wysiwyg-font-size-xx-large",
                "-": "wysiwyg-font-size-smaller",
                "+": "wysiwyg-font-size-larger"
            };
            return function(s) {
                return r[String(s).charAt(0)];
            };
        }()
    };
    return d;
}();

wysihtml5.dom.removeEmptyTextNodes = function(c) {
    var b, e = wysihtml5.lang.array(c.childNodes).get(), d = e.length, a = 0;
    for (;a < d; a++) {
        b = e[a];
        if (b.nodeType === wysihtml5.TEXT_NODE && b.data === "") {
            b.parentNode.removeChild(b);
        }
    }
};

wysihtml5.dom.renameElement = function(a, b) {
    var d = a.ownerDocument.createElement(b), c;
    while (c = a.firstChild) {
        d.appendChild(c);
    }
    wysihtml5.dom.copyAttributes([ "align", "className" ]).from(a).to(d);
    a.parentNode.replaceChild(d, a);
    return d;
};

wysihtml5.dom.replaceWithChildNodes = function(b) {
    if (!b.parentNode) {
        return;
    }
    if (!b.firstChild) {
        b.parentNode.removeChild(b);
        return;
    }
    var a = b.ownerDocument.createDocumentFragment();
    while (b.firstChild) {
        a.appendChild(b.firstChild);
    }
    b.parentNode.replaceChild(a, b);
    b = a = null;
};

(function(e) {
    function c(f) {
        return e.getStyle("display").from(f) === "block";
    }
    function d(f) {
        return f.nodeName === "BR";
    }
    function b(g) {
        var f = g.ownerDocument.createElement("br");
        g.appendChild(f);
    }
    function a(l) {
        if (l.nodeName !== "MENU" && l.nodeName !== "UL" && l.nodeName !== "OL") {
            return;
        }
        var o = l.ownerDocument, m = o.createDocumentFragment(), g = l.previousElementSibling || l.previousSibling, n, h, j, k, f;
        if (g && !c(g)) {
            b(m);
        }
        while (f = l.firstChild) {
            h = f.lastChild;
            while (n = f.firstChild) {
                j = n === h;
                k = j && !c(n) && !d(n);
                m.appendChild(n);
                if (k) {
                    b(m);
                }
            }
            f.parentNode.removeChild(f);
        }
        l.parentNode.replaceChild(m, l);
    }
    e.resolveList = a;
})(wysihtml5.dom);

(function(e) {
    var d = document, c = [ "parent", "top", "opener", "frameElement", "frames", "localStorage", "globalStorage", "sessionStorage", "indexedDB" ], b = [ "open", "close", "openDialog", "showModalDialog", "alert", "confirm", "prompt", "openDatabase", "postMessage", "XMLHttpRequest", "XDomainRequest" ], a = [ "referrer", "write", "open", "close" ];
    e.dom.Sandbox = Base.extend({
        constructor: function(g, f) {
            this.callback = g || e.EMPTY_FUNCTION;
            this.config = e.lang.object({}).merge(f).get();
            this.iframe = this._createIframe();
        },
        insertInto: function(f) {
            if (typeof f === "string") {
                f = d.getElementById(f);
            }
            f.appendChild(this.iframe);
        },
        getIframe: function() {
            return this.iframe;
        },
        getWindow: function() {
            this._readyError();
        },
        getDocument: function() {
            this._readyError();
        },
        destroy: function() {
            var f = this.getIframe();
            f.parentNode.removeChild(f);
        },
        _readyError: function() {
            throw new Error("wysihtml5.Sandbox: Sandbox iframe isn't loaded yet");
        },
        _createIframe: function() {
            var g = this, f = d.createElement("iframe");
            f.className = "wysihtml5-sandbox";
            e.dom.setAttributes({
                security: "restricted",
                allowtransparency: "true",
                frameborder: 0,
                width: 0,
                height: 0,
                marginwidth: 0,
                marginheight: 0
            }).on(f);
            if (e.browser.throwsMixedContentWarningWhenIframeSrcIsEmpty()) {
                f.src = "javascript:'<html></html>'";
            }
            f.onload = function() {
                f.onreadystatechange = f.onload = null;
                g._onLoadIframe(f);
            };
            f.onreadystatechange = function() {
                if (/loaded|complete/.test(f.readyState)) {
                    f.onreadystatechange = f.onload = null;
                    g._onLoadIframe(f);
                }
            };
            return f;
        },
        _onLoadIframe: function(h) {
            if (!e.dom.contains(d.documentElement, h)) {
                return;
            }
            var l = this, f = h.contentWindow, m = h.contentWindow.document, n = d.characterSet || d.charset || "utf-8", k = this._getHtml({
                charset: n,
                stylesheets: this.config.stylesheets
            });
            m.open("text/html", "replace");
            m.write(k);
            m.close();
            this.getWindow = function() {
                return h.contentWindow;
            };
            this.getDocument = function() {
                return h.contentWindow.document;
            };
            f.onerror = function(p, r, o) {
                throw new Error("wysihtml5.Sandbox: " + p, r, o);
            };
            if (!e.browser.supportsSandboxedIframes()) {
                var g, j;
                for (g = 0, j = c.length; g < j; g++) {
                    this._unset(f, c[g]);
                }
                for (g = 0, j = b.length; g < j; g++) {
                    this._unset(f, b[g], e.EMPTY_FUNCTION);
                }
                for (g = 0, j = a.length; g < j; g++) {
                    this._unset(m, a[g]);
                }
                this._unset(m, "cookie", "", true);
            }
            this.loaded = true;
            setTimeout(function() {
                l.callback(l);
            }, 0);
        },
        _getHtml: function(j) {
            var k = j.stylesheets, g = "", f = 0, h;
            k = typeof k === "string" ? [ k ] : k;
            if (k) {
                h = k.length;
                for (;f < h; f++) {
                    g += '<link rel="stylesheet" href="' + k[f] + '">';
                }
            }
            j.stylesheets = g;
            return e.lang.string('<!DOCTYPE html><html><head><meta charset="#{charset}">#{stylesheets}</head><body></body></html>').interpolate(j);
        },
        _unset: function(g, j, h, l) {
            try {
                g[j] = h;
            } catch (k) {}
            try {
                g.__defineGetter__(j, function() {
                    return h;
                });
            } catch (k) {}
            if (l) {
                try {
                    g.__defineSetter__(j, function() {});
                } catch (k) {}
            }
            if (!e.browser.crashesWhenDefineProperty(j)) {
                try {
                    var f = {
                        get: function() {
                            return h;
                        }
                    };
                    if (l) {
                        f.set = function() {};
                    }
                    Object.defineProperty(g, j, f);
                } catch (k) {}
            }
        }
    });
})(wysihtml5);

(function() {
    var a = {
        className: "class"
    };
    wysihtml5.dom.setAttributes = function(b) {
        return {
            on: function(d) {
                for (var c in b) {
                    d.setAttribute(a[c] || c, b[c]);
                }
            }
        };
    };
})();

wysihtml5.dom.setStyles = function(a) {
    return {
        on: function(c) {
            var d = c.style;
            if (typeof a === "string") {
                d.cssText += ";" + a;
                return;
            }
            for (var b in a) {
                if (b === "float") {
                    d.cssFloat = a[b];
                    d.styleFloat = a[b];
                } else {
                    d[b] = a[b];
                }
            }
        }
    };
};

(function(a) {
    a.simulatePlaceholder = function(d, b, c) {
        var e = "placeholder", f = function() {
            if (b.hasPlaceholderSet()) {
                b.clear();
            }
            a.removeClass(b.element, e);
        }, g = function() {
            if (b.isEmpty()) {
                b.setValue(c);
                a.addClass(b.element, e);
            }
        };
        d.observe("set_placeholder", g).observe("unset_placeholder", f).observe("focus:composer", f).observe("paste:composer", f).observe("blur:composer", g);
        g();
    };
})(wysihtml5.dom);

(function(b) {
    var a = document.documentElement;
    if ("textContent" in a) {
        b.setTextContent = function(c, d) {
            c.textContent = d;
        };
        b.getTextContent = function(c) {
            return c.textContent;
        };
    } else {
        if ("innerText" in a) {
            b.setTextContent = function(c, d) {
                c.innerText = d;
            };
            b.getTextContent = function(c) {
                return c.innerText;
            };
        } else {
            b.setTextContent = function(c, d) {
                c.nodeValue = d;
            };
            b.getTextContent = function(c) {
                return c.nodeValue;
            };
        }
    }
})(wysihtml5.dom);

wysihtml5.quirks.cleanPastedHTML = function() {
    var a = {
        "a u": wysihtml5.dom.replaceWithChildNodes
    };
    function b(l, m, d) {
        m = m || a;
        d = d || l.ownerDocument || document;
        var h, e = typeof l === "string", c, k, n, g, f = 0;
        if (e) {
            h = wysihtml5.dom.getAsDom(l, d);
        } else {
            h = l;
        }
        for (g in m) {
            k = h.querySelectorAll(g);
            c = m[g];
            n = k.length;
            for (;f < n; f++) {
                c(k[f]);
            }
        }
        k = l = m = null;
        return e ? h.innerHTML : h;
    }
    return b;
}();

(function(b) {
    var a = b.dom;
    b.quirks.ensureProperClearing = function() {
        var c = function(e) {
            var d = this;
            setTimeout(function() {
                var f = d.innerHTML.toLowerCase();
                if (f == "<p>&nbsp;</p>" || f == "<p>&nbsp;</p><p>&nbsp;</p>") {
                    d.innerHTML = "";
                }
            }, 0);
        };
        return function(d) {
            a.observe(d.element, [ "cut", "keydown" ], c);
        };
    }();
    b.quirks.ensureProperClearingOfLists = function() {
        var d = [ "OL", "UL", "MENU" ];
        var c = function(g, e) {
            if (!e.firstChild || !b.lang.array(d).contains(e.firstChild.nodeName)) {
                return;
            }
            var j = a.getParentElement(g, {
                nodeName: d
            });
            if (!j) {
                return;
            }
            var h = j == e.firstChild;
            if (!h) {
                return;
            }
            var k = j.childNodes.length <= 1;
            if (!k) {
                return;
            }
            var f = j.firstChild ? j.firstChild.innerHTML === "" : true;
            if (!f) {
                return;
            }
            j.parentNode.removeChild(j);
        };
        return function(e) {
            a.observe(e.element, "keydown", function(g) {
                if (g.keyCode !== b.BACKSPACE_KEY) {
                    return;
                }
                var f = e.selection.getSelectedNode();
                c(f, e.element);
            });
        };
    }();
})(wysihtml5);

(function(b) {
    var a = "%7E";
    b.quirks.getCorrectInnerHTML = function(e) {
        var j = e.innerHTML;
        if (j.indexOf(a) === -1) {
            return j;
        }
        var g = e.querySelectorAll("[href*='~'], [src*='~']"), c, h, f, d;
        for (d = 0, f = g.length; d < f; d++) {
            c = g[d].href || g[d].src;
            h = b.lang.string(c).replace("~").by(a);
            j = b.lang.string(j).replace(h).by(c);
        }
        return j;
    };
})(wysihtml5);

(function(d) {
    var c = d.dom, b = [ "LI", "P", "H1", "H2", "H3", "H4", "H5", "H6" ], a = [ "UL", "OL", "MENU" ];
    d.quirks.insertLineBreakOnReturn = function(g) {
        function e(k) {
            var h = c.getParentElement(k, {
                nodeName: [ "P", "DIV" ]
            }, 2);
            if (!h) {
                return;
            }
            var j = document.createTextNode(d.INVISIBLE_SPACE);
            c.insert(j).before(h);
            c.replaceWithChildNodes(h);
            g.selection.selectNode(j);
        }
        function f(j) {
            var l = j.keyCode;
            if (j.shiftKey || l !== d.ENTER_KEY && l !== d.BACKSPACE_KEY) {
                return;
            }
            var h = j.target, k = g.selection.getSelectedNode(), m = c.getParentElement(k, {
                nodeName: b
            }, 4);
            if (m) {
                if (m.nodeName === "LI" && (l === d.ENTER_KEY || l === d.BACKSPACE_KEY)) {
                    setTimeout(function() {
                        var o = g.selection.getSelectedNode(), n, p;
                        if (!o) {
                            return;
                        }
                        n = c.getParentElement(o, {
                            nodeName: a
                        }, 2);
                        if (n) {
                            return;
                        }
                        e(o);
                    }, 0);
                } else {
                    if (m.nodeName.match(/H[1-6]/) && l === d.ENTER_KEY) {
                        setTimeout(function() {
                            e(g.selection.getSelectedNode());
                        }, 0);
                    }
                }
                return;
            }
            if (l === d.ENTER_KEY && !d.browser.insertsLineBreaksOnReturn()) {
                g.commands.exec("insertLineBreak");
                j.preventDefault();
            }
        }
        c.observe(g.element.ownerDocument, "keydown", f);
    };
})(wysihtml5);

(function(b) {
    var a = "wysihtml5-quirks-redraw";
    b.quirks.redraw = function(c) {
        b.dom.addClass(c, a);
        b.dom.removeClass(c, a);
        try {
            var f = c.ownerDocument;
            f.execCommand("italic", false, null);
            f.execCommand("italic", false, null);
        } catch (d) {}
    };
})(wysihtml5);

(function(c) {
    var b = c.dom;
    function a(d) {
        var e = 0;
        if (d.parentNode) {
            do {
                e += d.offsetTop || 0;
                d = d.offsetParent;
            } while (d);
        }
        return e;
    }
    c.Selection = Base.extend({
        constructor: function(d) {
            window.rangy.init();
            this.editor = d;
            this.composer = d.composer;
            this.doc = this.composer.doc;
        },
        getBookmark: function() {
            var d = this.getRange();
            return d && d.cloneRange();
        },
        setBookmark: function(d) {
            if (!d) {
                return;
            }
            this.setSelection(d);
        },
        setBefore: function(e) {
            var d = rangy.createRange(this.doc);
            d.setStartBefore(e);
            d.setEndBefore(e);
            return this.setSelection(d);
        },
        setAfter: function(e) {
            var d = rangy.createRange(this.doc);
            d.setStartAfter(e);
            d.setEndAfter(e);
            return this.setSelection(d);
        },
        selectNode: function(d) {
            var g = rangy.createRange(this.doc), k = d.nodeType === c.ELEMENT_NODE, m = "canHaveHTML" in d ? d.canHaveHTML : d.nodeName !== "IMG", j = k ? d.innerHTML : d.data, f = j === "" || j === c.INVISIBLE_SPACE, l = b.getStyle("display").from(d), n = l === "block" || l === "list-item";
            if (f && k && m) {
                try {
                    d.innerHTML = c.INVISIBLE_SPACE;
                } catch (h) {}
            }
            if (m) {
                g.selectNodeContents(d);
            } else {
                g.selectNode(d);
            }
            if (m && f && k) {
                g.collapse(n);
            } else {
                if (m && f) {
                    g.setStartAfter(d);
                    g.setEndAfter(d);
                }
            }
            this.setSelection(g);
        },
        getSelectedNode: function(e) {
            var f, d;
            if (e && this.doc.selection && this.doc.selection.type === "Control") {
                d = this.doc.selection.createRange();
                if (d && d.length) {
                    return d.item(0);
                }
            }
            f = this.getSelection(this.doc);
            if (f.focusNode === f.anchorNode) {
                return f.focusNode;
            } else {
                d = this.getRange(this.doc);
                return d ? d.commonAncestorContainer : this.doc.body;
            }
        },
        executeAndRestore: function(d, o) {
            var h = this.doc.body, f = o && h.scrollTop, j = o && h.scrollLeft, m = "_wysihtml5-temp-placeholder", p = '<span class="' + m + '">' + c.INVISIBLE_SPACE + "</span>", g = this.getRange(this.doc), n;
            if (!g) {
                d(h, h);
                return;
            }
            var e = g.createContextualFragment(p);
            g.insertNode(e);
            try {
                d(g.startContainer, g.endContainer);
            } catch (l) {
                setTimeout(function() {
                    throw l;
                }, 0);
            }
            caretPlaceholder = this.doc.querySelector("." + m);
            if (caretPlaceholder) {
                n = rangy.createRange(this.doc);
                n.selectNode(caretPlaceholder);
                n.deleteContents();
                this.setSelection(n);
            } else {
                h.focus();
            }
            if (o) {
                h.scrollTop = f;
                h.scrollLeft = j;
            }
            try {
                caretPlaceholder.parentNode.removeChild(caretPlaceholder);
            } catch (k) {}
        },
        executeAndRestoreSimple: function(d) {
            var h = this.getRange(), j = this.doc.body, r, f, g, m, k;
            if (!h) {
                d(j, j);
                return;
            }
            m = h.getNodes([ 3 ]);
            f = m[0] || h.startContainer;
            g = m[m.length - 1] || h.endContainer;
            k = {
                collapsed: h.collapsed,
                startContainer: f,
                startOffset: f === h.startContainer ? h.startOffset : 0,
                endContainer: g,
                endOffset: g === h.endContainer ? h.endOffset : g.length
            };
            try {
                d(h.startContainer, h.endContainer);
            } catch (l) {
                setTimeout(function() {
                    throw l;
                }, 0);
            }
            r = rangy.createRange(this.doc);
            try {
                r.setStart(k.startContainer, k.startOffset);
            } catch (p) {}
            try {
                r.setEnd(k.endContainer, k.endOffset);
            } catch (o) {}
            try {
                this.setSelection(r);
            } catch (n) {}
        },
        insertHTML: function(e) {
            var d = rangy.createRange(this.doc), g = d.createContextualFragment(e), f = g.lastChild;
            this.insertNode(g);
            if (f) {
                this.setAfter(f);
            }
        },
        insertNode: function(e) {
            var d = this.getRange();
            if (d) {
                d.insertNode(e);
            }
        },
        surround: function(f) {
            var d = this.getRange();
            if (!d) {
                return;
            }
            try {
                d.surroundContents(f);
                this.selectNode(f);
            } catch (g) {
                f.appendChild(d.extractContents());
                d.insertNode(f);
            }
        },
        scrollIntoView: function() {
            var g = this.doc, f = g.documentElement.scrollHeight > g.documentElement.offsetHeight, d = g._wysihtml5ScrollIntoViewElement = g._wysihtml5ScrollIntoViewElement || function() {
                var h = g.createElement("span");
                h.innerHTML = c.INVISIBLE_SPACE;
                return h;
            }(), e;
            if (f) {
                this.insertNode(d);
                e = a(d);
                d.parentNode.removeChild(d);
                if (e > g.body.scrollTop) {
                    g.body.scrollTop = e;
                }
            }
        },
        selectLine: function() {
            if (c.browser.supportsSelectionModify()) {
                this._selectLine_W3C();
            } else {
                if (this.doc.selection) {
                    this._selectLine_MSIE();
                }
            }
        },
        _selectLine_W3C: function() {
            var e = this.doc.defaultView, d = e.getSelection();
            d.modify("extend", "left", "lineboundary");
            d.modify("extend", "right", "lineboundary");
        },
        _selectLine_MSIE: function() {
            var l = this.doc.selection.createRange(), h = l.boundingTop, p = l.boundingHeight, k = this.doc.body.scrollWidth, e, d, m, g, f;
            if (!l.moveToPoint) {
                return;
            }
            if (h === 0) {
                m = this.doc.createElement("span");
                this.insertNode(m);
                h = m.offsetTop;
                m.parentNode.removeChild(m);
            }
            h += 1;
            for (g = -10; g < k; g += 2) {
                try {
                    l.moveToPoint(g, h);
                    break;
                } catch (o) {}
            }
            e = h;
            d = this.doc.selection.createRange();
            for (f = k; f >= 0; f--) {
                try {
                    d.moveToPoint(f, e);
                    break;
                } catch (n) {}
            }
            l.setEndPoint("EndToEnd", d);
            l.select();
        },
        getText: function() {
            var d = this.getSelection();
            return d ? d.toString() : "";
        },
        getNodes: function(d, f) {
            var e = this.getRange();
            if (e) {
                return e.getNodes([ d ], f);
            } else {
                return [];
            }
        },
        getRange: function() {
            var d = this.getSelection();
            return d && d.rangeCount && d.getRangeAt(0);
        },
        getSelection: function() {
            return rangy.getSelection(this.doc.defaultView || this.doc.parentWindow);
        },
        setSelection: function(d) {
            var f = this.doc.defaultView || this.doc.parentWindow, e = rangy.getSelection(f);
            return e.setSingleRange(d);
        }
    });
})(wysihtml5);

(function(o, k) {
    var h = "span";
    var f = /\s+/g;
    function d(s, p, r) {
        if (!s.className) {
            return false;
        }
        var t = s.className.match(r) || [];
        return t[t.length - 1] === p;
    }
    function j(s, p, r) {
        if (s.className) {
            m(s, r);
            s.className += " " + p;
        } else {
            s.className = p;
        }
    }
    function m(r, p) {
        if (r.className) {
            r.className = r.className.replace(p, "");
        }
    }
    function n(r, p) {
        return r.className.replace(f, " ") == p.className.replace(f, " ");
    }
    function a(r) {
        var p = r.parentNode;
        while (r.firstChild) {
            p.insertBefore(r.firstChild, r);
        }
        p.removeChild(r);
    }
    function e(w, u) {
        if (w.attributes.length != u.attributes.length) {
            return false;
        }
        for (var v = 0, p = w.attributes.length, t, r, s; v < p; ++v) {
            t = w.attributes[v];
            s = t.name;
            if (s != "class") {
                r = u.attributes.getNamedItem(s);
                if (t.specified != r.specified) {
                    return false;
                }
                if (t.specified && t.nodeValue !== r.nodeValue) {
                    return false;
                }
            }
        }
        return true;
    }
    function c(p, r) {
        if (k.dom.isCharacterDataNode(p)) {
            if (r == 0) {
                return !!p.previousSibling;
            } else {
                if (r == p.length) {
                    return !!p.nextSibling;
                } else {
                    return true;
                }
            }
        }
        return r > 0 && r < p.childNodes.length;
    }
    function b(t, r, s) {
        var p;
        if (k.dom.isCharacterDataNode(r)) {
            if (s == 0) {
                s = k.dom.getNodeIndex(r);
                r = r.parentNode;
            } else {
                if (s == r.length) {
                    s = k.dom.getNodeIndex(r) + 1;
                    r = r.parentNode;
                } else {
                    p = k.dom.splitDataNode(r, s);
                }
            }
        }
        if (!p) {
            p = r.cloneNode(false);
            if (p.id) {
                p.removeAttribute("id");
            }
            var u;
            while (u = r.childNodes[s]) {
                p.appendChild(u);
            }
            k.dom.insertAfter(p, r);
        }
        return r == t ? p : b(t, p.parentNode, k.dom.getNodeIndex(p));
    }
    function g(p) {
        this.isElementMerge = p.nodeType == o.ELEMENT_NODE;
        this.firstTextNode = this.isElementMerge ? p.lastChild : p;
        this.textNodes = [ this.firstTextNode ];
    }
    g.prototype = {
        doMerge: function() {
            var v = [], u, s, t;
            for (var r = 0, p = this.textNodes.length; r < p; ++r) {
                u = this.textNodes[r];
                s = u.parentNode;
                v[r] = u.data;
                if (r) {
                    s.removeChild(u);
                    if (!s.hasChildNodes()) {
                        s.parentNode.removeChild(s);
                    }
                }
            }
            this.firstTextNode.data = t = v.join("");
            return t;
        },
        getLength: function() {
            var r = this.textNodes.length, p = 0;
            while (r--) {
                p += this.textNodes[r].length;
            }
            return p;
        },
        toString: function() {
            var s = [];
            for (var r = 0, p = this.textNodes.length; r < p; ++r) {
                s[r] = "'" + this.textNodes[r].data + "'";
            }
            return "[Merge(" + s.join(",") + ")]";
        }
    };
    function l(p, s, r, t) {
        this.tagNames = p || [ h ];
        this.cssClass = s || "";
        this.similarClassRegExp = r;
        this.normalize = t;
        this.applyToAnyTagName = false;
    }
    l.prototype = {
        getAncestorWithClass: function(r) {
            var p;
            while (r) {
                p = this.cssClass ? d(r, this.cssClass, this.similarClassRegExp) : true;
                if (r.nodeType == o.ELEMENT_NODE && k.dom.arrayContains(this.tagNames, r.tagName.toLowerCase()) && p) {
                    return r;
                }
                r = r.parentNode;
            }
            return false;
        },
        postApply: function(E, A) {
            var p = E[0], r = E[E.length - 1];
            var t = [], F;
            var v = p, s = r;
            var C = 0, G = r.length;
            var u, z;
            for (var w = 0, B = E.length; w < B; ++w) {
                u = E[w];
                z = this.getAdjacentMergeableTextNode(u.parentNode, false);
                if (z) {
                    if (!F) {
                        F = new g(z);
                        t.push(F);
                    }
                    F.textNodes.push(u);
                    if (u === p) {
                        v = F.firstTextNode;
                        C = v.length;
                    }
                    if (u === r) {
                        s = F.firstTextNode;
                        G = F.getLength();
                    }
                } else {
                    F = null;
                }
            }
            var D = this.getAdjacentMergeableTextNode(r.parentNode, true);
            if (D) {
                if (!F) {
                    F = new g(r);
                    t.push(F);
                }
                F.textNodes.push(D);
            }
            if (t.length) {
                for (w = 0, B = t.length; w < B; ++w) {
                    t[w].doMerge();
                }
                A.setStart(v, C);
                A.setEnd(s, G);
            }
        },
        getAdjacentMergeableTextNode: function(s, p) {
            var u = s.nodeType == o.TEXT_NODE;
            var r = u ? s.parentNode : s;
            var v;
            var t = p ? "nextSibling" : "previousSibling";
            if (u) {
                v = s[t];
                if (v && v.nodeType == o.TEXT_NODE) {
                    return v;
                }
            } else {
                v = r[t];
                if (v && this.areElementsMergeable(s, v)) {
                    return v[p ? "firstChild" : "lastChild"];
                }
            }
            return null;
        },
        areElementsMergeable: function(r, p) {
            return k.dom.arrayContains(this.tagNames, (r.tagName || "").toLowerCase()) && k.dom.arrayContains(this.tagNames, (p.tagName || "").toLowerCase()) && n(r, p) && e(r, p);
        },
        createContainer: function(r) {
            var p = r.createElement(this.tagNames[0]);
            if (this.cssClass) {
                p.className = this.cssClass;
            }
            return p;
        },
        applyToTextNode: function(s) {
            var r = s.parentNode;
            if (r.childNodes.length == 1 && k.dom.arrayContains(this.tagNames, r.tagName.toLowerCase())) {
                if (this.cssClass) {
                    j(r, this.cssClass, this.similarClassRegExp);
                }
            } else {
                var p = this.createContainer(k.dom.getDocument(s));
                s.parentNode.insertBefore(p, s);
                p.appendChild(s);
            }
        },
        isRemovable: function(p) {
            return k.dom.arrayContains(this.tagNames, p.tagName.toLowerCase()) && o.lang.string(p.className).trim() == this.cssClass;
        },
        undoToTextNode: function(t, r, s) {
            if (!r.containsNode(s)) {
                var p = r.cloneRange();
                p.selectNode(s);
                if (p.isPointInRange(r.endContainer, r.endOffset) && c(r.endContainer, r.endOffset)) {
                    b(s, r.endContainer, r.endOffset);
                    r.setEndAfter(s);
                }
                if (p.isPointInRange(r.startContainer, r.startOffset) && c(r.startContainer, r.startOffset)) {
                    s = b(s, r.startContainer, r.startOffset);
                }
            }
            if (this.similarClassRegExp) {
                m(s, this.similarClassRegExp);
            }
            if (this.isRemovable(s)) {
                a(s);
            }
        },
        applyToRange: function(r) {
            var u = r.getNodes([ o.TEXT_NODE ]);
            if (!u.length) {
                try {
                    var t = this.createContainer(r.endContainer.ownerDocument);
                    r.surroundContents(t);
                    this.selectNode(r, t);
                    return;
                } catch (v) {}
            }
            r.splitBoundaries();
            u = r.getNodes([ o.TEXT_NODE ]);
            if (u.length) {
                var w;
                for (var s = 0, p = u.length; s < p; ++s) {
                    w = u[s];
                    if (!this.getAncestorWithClass(w)) {
                        this.applyToTextNode(w);
                    }
                }
                r.setStart(u[0], 0);
                w = u[u.length - 1];
                r.setEnd(w, w.length);
                if (this.normalize) {
                    this.postApply(u, r);
                }
            }
        },
        undoToRange: function(r) {
            var u = r.getNodes([ o.TEXT_NODE ]), z, v;
            if (u.length) {
                r.splitBoundaries();
                u = r.getNodes([ o.TEXT_NODE ]);
            } else {
                var w = r.endContainer.ownerDocument, t = w.createTextNode(o.INVISIBLE_SPACE);
                r.insertNode(t);
                r.selectNode(t);
                u = [ t ];
            }
            for (var s = 0, p = u.length; s < p; ++s) {
                z = u[s];
                v = this.getAncestorWithClass(z);
                if (v) {
                    this.undoToTextNode(z, r, v);
                }
            }
            if (p == 1) {
                this.selectNode(r, u[0]);
            } else {
                r.setStart(u[0], 0);
                z = u[u.length - 1];
                r.setEnd(z, z.length);
                if (this.normalize) {
                    this.postApply(u, r);
                }
            }
        },
        selectNode: function(r, u) {
            var t = u.nodeType === o.ELEMENT_NODE, p = "canHaveHTML" in u ? u.canHaveHTML : true, s = t ? u.innerHTML : u.data, w = s === "" || s === o.INVISIBLE_SPACE;
            if (w && t && p) {
                try {
                    u.innerHTML = o.INVISIBLE_SPACE;
                } catch (v) {}
            }
            r.selectNodeContents(u);
            if (w && t) {
                r.collapse(false);
            } else {
                if (w) {
                    r.setStartAfter(u);
                    r.setEndAfter(u);
                }
            }
        },
        getTextSelectedByRange: function(u, p) {
            var r = p.cloneRange();
            r.selectNodeContents(u);
            var s = r.intersection(p);
            var t = s ? s.toString() : "";
            r.detach();
            return t;
        },
        isAppliedToRange: function(r) {
            var u = [], t, v = r.getNodes([ o.TEXT_NODE ]);
            if (!v.length) {
                t = this.getAncestorWithClass(r.startContainer);
                return t ? [ t ] : false;
            }
            for (var s = 0, p = v.length, w; s < p; ++s) {
                w = this.getTextSelectedByRange(v[s], r);
                t = this.getAncestorWithClass(v[s]);
                if (w != "" && !t) {
                    return false;
                } else {
                    u.push(t);
                }
            }
            return u;
        },
        toggleRange: function(p) {
            if (this.isAppliedToRange(p)) {
                this.undoToRange(p);
            } else {
                this.applyToRange(p);
            }
        }
    };
    o.selection.HTMLApplier = l;
})(wysihtml5, rangy);

wysihtml5.Commands = Base.extend({
    constructor: function(a) {
        this.editor = a;
        this.composer = a.composer;
        this.doc = this.composer.doc;
    },
    support: function(a) {
        return wysihtml5.browser.supportsCommand(this.doc, a);
    },
    exec: function(g, c) {
        var f = wysihtml5.commands[g], b = wysihtml5.lang.array(arguments).get(), h = f && f.exec, a = null;
        this.editor.fire("beforecommand:composer");
        if (h) {
            b.unshift(this.composer);
            a = h.apply(f, b);
        } else {
            try {
                a = this.doc.execCommand(g, false, c);
            } catch (d) {}
        }
        this.editor.fire("aftercommand:composer");
        return a;
    },
    state: function(f, a) {
        var d = wysihtml5.commands[f], b = wysihtml5.lang.array(arguments).get(), g = d && d.state;
        if (g) {
            b.unshift(this.composer);
            return g.apply(d, b);
        } else {
            try {
                return this.doc.queryCommandState(f);
            } catch (c) {
                return false;
            }
        }
    },
    value: function(c) {
        var b = wysihtml5.commands[c], d = b && b.value;
        if (d) {
            return d.call(b, this.composer, c);
        } else {
            try {
                return this.doc.queryCommandValue(c);
            } catch (a) {
                return null;
            }
        }
    }
});

(function(b) {
    var a;
    b.commands.bold = {
        exec: function(c, d) {
            return b.commands.formatInline.exec(c, d, "b");
        },
        state: function(d, e, c) {
            return b.commands.formatInline.state(d, e, "b");
        },
        value: function() {
            return a;
        }
    };
})(wysihtml5);

(function(f) {
    var d, c = "A", e = f.dom;
    function a(h, n) {
        var m = n.length, j = 0, g, l, k;
        for (;j < m; j++) {
            g = n[j];
            l = e.getParentElement(g, {
                nodeName: "code"
            });
            k = e.getTextContent(g);
            if (k.match(e.autoLink.URL_REG_EXP) && !l) {
                l = e.renameElement(g, "code");
            } else {
                e.replaceWithChildNodes(g);
            }
        }
    }
    function b(g, m) {
        var v = g.doc, s = "_wysihtml5-temp-" + +new Date(), z = /non-matching-class/g, r = 0, k, h, p, u, o, n, t, w, l;
        f.commands.formatInline.exec(g, d, c, s, z);
        h = v.querySelectorAll(c + "." + s);
        k = h.length;
        for (;r < k; r++) {
            p = h[r];
            p.removeAttribute("class");
            for (l in m) {
                p.setAttribute(l, m[l]);
            }
        }
        n = p;
        if (k === 1) {
            t = e.getTextContent(p);
            u = !!p.querySelector("*");
            o = t === "" || t === f.INVISIBLE_SPACE;
            if (!u && o) {
                e.setTextContent(p, m.text || p.href);
                w = v.createTextNode(" ");
                g.selection.setAfter(p);
                g.selection.insertNode(w);
                n = w;
            }
        }
        g.selection.setAfter(n);
    }
    f.commands.createLink = {
        exec: function(g, k, j) {
            var h = this.state(g, k);
            if (h) {
                g.selection.executeAndRestore(function() {
                    a(g, h);
                });
            } else {
                j = typeof j === "object" ? j : {
                    href: j
                };
                b(g, j);
            }
        },
        state: function(g, h) {
            return f.commands.formatInline.state(g, h, "A");
        },
        value: function() {
            return d;
        }
    };
})(wysihtml5);

(function(c) {
    var b, a = /wysiwyg-font-size-[a-z\-]+/g;
    c.commands.fontSize = {
        exec: function(d, f, e) {
            return c.commands.formatInline.exec(d, f, "span", "wysiwyg-font-size-" + e, a);
        },
        state: function(d, f, e) {
            return c.commands.formatInline.state(d, f, "span", "wysiwyg-font-size-" + e, a);
        },
        value: function() {
            return b;
        }
    };
})(wysihtml5);

(function(c) {
    var b, a = /wysiwyg-color-[a-z]+/g;
    c.commands.foreColor = {
        exec: function(e, f, d) {
            return c.commands.formatInline.exec(e, f, "span", "wysiwyg-color-" + d, a);
        },
        state: function(e, f, d) {
            return c.commands.formatInline.state(e, f, "span", "wysiwyg-color-" + d, a);
        },
        value: function() {
            return b;
        }
    };
})(wysihtml5);

(function(h) {
    var b, p = h.dom, a = "DIV", r = [ "H1", "H2", "H3", "H4", "H5", "H6", "P", "BLOCKQUOTE", a ];
    function n(u, v, w) {
        if (u.className) {
            g(u, w);
            u.className += " " + v;
        } else {
            u.className = v;
        }
    }
    function g(u, v) {
        u.className = u.className.replace(v, "");
    }
    function j(u) {
        return u.nodeType === h.TEXT_NODE && !h.lang.string(u.data).trim();
    }
    function k(v) {
        var u = v.previousSibling;
        while (u && j(u)) {
            u = u.previousSibling;
        }
        return u;
    }
    function l(u) {
        var v = u.nextSibling;
        while (v && j(v)) {
            v = v.nextSibling;
        }
        return v;
    }
    function f(v) {
        var z = v.ownerDocument, w = l(v), u = k(v);
        if (w && !e(w)) {
            v.parentNode.insertBefore(z.createElement("br"), w);
        }
        if (u && !e(u)) {
            v.parentNode.insertBefore(z.createElement("br"), v);
        }
    }
    function c(v) {
        var w = l(v), u = k(v);
        if (w && m(w)) {
            w.parentNode.removeChild(w);
        }
        if (u && m(u)) {
            u.parentNode.removeChild(u);
        }
    }
    function o(v) {
        var u = v.lastChild;
        if (u && m(u)) {
            u.parentNode.removeChild(u);
        }
    }
    function m(u) {
        return u.nodeName === "BR";
    }
    function e(u) {
        if (m(u)) {
            return true;
        }
        if (p.getStyle("display").from(u) === "block") {
            return true;
        }
        return false;
    }
    function d(w, z, A, v) {
        if (v) {
            var u = p.observe(w, "DOMNodeInserted", function(C) {
                var D = C.target, B;
                if (D.nodeType !== h.ELEMENT_NODE) {
                    return;
                }
                B = p.getStyle("display").from(D);
                if (B.substr(0, 6) !== "inline") {
                    D.className += " " + v;
                }
            });
        }
        w.execCommand(z, false, A);
        if (u) {
            u.stop();
        }
    }
    function s(u, v) {
        u.selection.selectLine();
        u.selection.surround(v);
        c(v);
        o(v);
        u.selection.selectNode(v);
    }
    function t(u) {
        return !!h.lang.string(u.className).trim();
    }
    h.commands.formatBlock = {
        exec: function(u, C, D, v, z) {
            var A = u.doc, B = this.state(u, C, D, v, z), w;
            D = typeof D === "string" ? D.toUpperCase() : D;
            if (B) {
                u.selection.executeAndRestoreSimple(function() {
                    if (z) {
                        g(B, z);
                    }
                    var E = t(B);
                    if (!E && B.nodeName === (D || a)) {
                        f(B);
                        p.replaceWithChildNodes(B);
                    } else {
                        if (E) {
                            p.renameElement(B, a);
                        }
                    }
                });
                return;
            }
            if (D === null || h.lang.array(r).contains(D)) {
                w = u.selection.getSelectedNode();
                B = p.getParentElement(w, {
                    nodeName: r
                });
                if (B) {
                    u.selection.executeAndRestoreSimple(function() {
                        if (D) {
                            B = p.renameElement(B, D);
                        }
                        if (v) {
                            n(B, v, z);
                        }
                    });
                    return;
                }
            }
            if (u.commands.support(C)) {
                d(A, C, D || a, v);
                return;
            }
            B = A.createElement(D || a);
            if (v) {
                B.className = v;
            }
            s(u, B);
        },
        state: function(u, A, B, v, z) {
            B = typeof B === "string" ? B.toUpperCase() : B;
            var w = u.selection.getSelectedNode();
            return p.getParentElement(w, {
                nodeName: B,
                className: v,
                classRegExp: z
            });
        },
        value: function() {
            return b;
        }
    };
})(wysihtml5);

(function(f) {
    var c, d = {
        strong: "b",
        em: "i",
        b: "strong",
        i: "em"
    }, e = {};
    function b(h) {
        var g = d[h];
        return g ? [ h.toLowerCase(), g.toLowerCase() ] : [ h.toLowerCase() ];
    }
    function a(h, j, k) {
        var g = h + ":" + j;
        if (!e[g]) {
            e[g] = new f.selection.HTMLApplier(b(h), j, k, true);
        }
        return e[g];
    }
    f.commands.formatInline = {
        exec: function(h, m, j, k, l) {
            var g = h.selection.getRange();
            if (!g) {
                return false;
            }
            a(j, k, l).toggleRange(g);
            h.selection.setSelection(g);
        },
        state: function(h, n, j, k, l) {
            var m = h.doc, o = d[j] || j, g;
            if (!f.dom.hasElementWithTagName(m, j) && !f.dom.hasElementWithTagName(m, o)) {
                return false;
            }
            if (k && !f.dom.hasElementWithClassName(m, k)) {
                return false;
            }
            g = h.selection.getRange();
            if (!g) {
                return false;
            }
            return a(j, k, l).isAppliedToRange(g);
        },
        value: function() {
            return c;
        }
    };
})(wysihtml5);

(function(b) {
    var a;
    b.commands.insertHTML = {
        exec: function(c, e, d) {
            if (c.commands.support(e)) {
                c.doc.execCommand(e, false, d);
            } else {
                c.selection.insertHTML(d);
            }
        },
        state: function() {
            return false;
        },
        value: function() {
            return a;
        }
    };
})(wysihtml5);

(function(b) {
    var a = "IMG";
    b.commands.insertImage = {
        exec: function(c, k, f) {
            f = typeof f === "object" ? f : {
                src: f
            };
            var h = c.doc, g = this.state(c), j, d, e;
            if (g) {
                c.selection.setBefore(g);
                e = g.parentNode;
                e.removeChild(g);
                b.dom.removeEmptyTextNodes(e);
                if (e.nodeName === "A" && !e.firstChild) {
                    c.selection.setAfter(e);
                    e.parentNode.removeChild(e);
                }
                b.quirks.redraw(c.element);
                return;
            }
            g = h.createElement(a);
            for (d in f) {
                g[d] = f[d];
            }
            c.selection.insertNode(g);
            if (b.browser.hasProblemsSettingCaretAfterImg()) {
                j = h.createTextNode(b.INVISIBLE_SPACE);
                c.selection.insertNode(j);
                c.selection.setAfter(j);
            } else {
                c.selection.setAfter(g);
            }
        },
        state: function(d) {
            var f = d.doc, e, g, c;
            if (!b.dom.hasElementWithTagName(f, a)) {
                return false;
            }
            e = d.selection.getSelectedNode();
            if (!e) {
                return false;
            }
            if (e.nodeName === a) {
                return e;
            }
            if (e.nodeType !== b.ELEMENT_NODE) {
                return false;
            }
            g = d.selection.getText();
            g = b.lang.string(g).trim();
            if (g) {
                return false;
            }
            c = d.selection.getNodes(b.ELEMENT_NODE, function(h) {
                return h.nodeName === "IMG";
            });
            if (c.length !== 1) {
                return false;
            }
            return c[0];
        },
        value: function(c) {
            var d = this.state(c);
            return d && d.src;
        }
    };
})(wysihtml5);

(function(c) {
    var b, a = "<br>" + (c.browser.needsSpaceAfterLineBreak() ? " " : "");
    c.commands.insertLineBreak = {
        exec: function(d, e) {
            if (d.commands.support(e)) {
                d.doc.execCommand(e, false, null);
                if (!c.browser.autoScrollsToCaret()) {
                    d.selection.scrollIntoView();
                }
            } else {
                d.commands.exec("insertHTML", a);
            }
        },
        state: function() {
            return false;
        },
        value: function() {
            return b;
        }
    };
})(wysihtml5);

(function(b) {
    var a;
    b.commands.insertOrderedList = {
        exec: function(c, f) {
            var l = c.doc, h = c.selection.getSelectedNode(), j = b.dom.getParentElement(h, {
                nodeName: "OL"
            }), k = b.dom.getParentElement(h, {
                nodeName: "UL"
            }), e = "_wysihtml5-temp-" + new Date().getTime(), g, d;
            if (c.commands.support(f)) {
                l.execCommand(f, false, null);
                return;
            }
            if (j) {
                c.selection.executeAndRestoreSimple(function() {
                    b.dom.resolveList(j);
                });
            } else {
                if (k) {
                    c.selection.executeAndRestoreSimple(function() {
                        b.dom.renameElement(k, "ol");
                    });
                } else {
                    c.commands.exec("formatBlock", "div", e);
                    d = l.querySelector("." + e);
                    g = d.innerHTML === "" || d.innerHTML === b.INVISIBLE_SPACE;
                    c.selection.executeAndRestoreSimple(function() {
                        j = b.dom.convertToList(d, "ol");
                    });
                    if (g) {
                        c.selection.selectNode(j.querySelector("li"));
                    }
                }
            }
        },
        state: function(c) {
            var d = c.selection.getSelectedNode();
            return b.dom.getParentElement(d, {
                nodeName: "OL"
            });
        },
        value: function() {
            return a;
        }
    };
})(wysihtml5);

(function(b) {
    var a;
    b.commands.insertUnorderedList = {
        exec: function(c, f) {
            var l = c.doc, h = c.selection.getSelectedNode(), j = b.dom.getParentElement(h, {
                nodeName: "UL"
            }), k = b.dom.getParentElement(h, {
                nodeName: "OL"
            }), e = "_wysihtml5-temp-" + new Date().getTime(), g, d;
            if (c.commands.support(f)) {
                l.execCommand(f, false, null);
                return;
            }
            if (j) {
                c.selection.executeAndRestoreSimple(function() {
                    b.dom.resolveList(j);
                });
            } else {
                if (k) {
                    c.selection.executeAndRestoreSimple(function() {
                        b.dom.renameElement(k, "ul");
                    });
                } else {
                    c.commands.exec("formatBlock", "div", e);
                    d = l.querySelector("." + e);
                    g = d.innerHTML === "" || d.innerHTML === b.INVISIBLE_SPACE;
                    c.selection.executeAndRestoreSimple(function() {
                        j = b.dom.convertToList(d, "ul");
                    });
                    if (g) {
                        c.selection.selectNode(j.querySelector("li"));
                    }
                }
            }
        },
        state: function(c) {
            var d = c.selection.getSelectedNode();
            return b.dom.getParentElement(d, {
                nodeName: "UL"
            });
        },
        value: function() {
            return a;
        }
    };
})(wysihtml5);

(function(b) {
    var a;
    b.commands.italic = {
        exec: function(c, d) {
            return b.commands.formatInline.exec(c, d, "i");
        },
        state: function(d, e, c) {
            return b.commands.formatInline.state(d, e, "i");
        },
        value: function() {
            return a;
        }
    };
})(wysihtml5);

(function(d) {
    var b, c = "wysiwyg-text-align-center", a = /wysiwyg-text-align-[a-z]+/g;
    d.commands.justifyCenter = {
        exec: function(e, f) {
            return d.commands.formatBlock.exec(e, "formatBlock", null, c, a);
        },
        state: function(e, f) {
            return d.commands.formatBlock.state(e, "formatBlock", null, c, a);
        },
        value: function() {
            return b;
        }
    };
})(wysihtml5);

(function(d) {
    var b, c = "wysiwyg-text-align-left", a = /wysiwyg-text-align-[a-z]+/g;
    d.commands.justifyLeft = {
        exec: function(e, f) {
            return d.commands.formatBlock.exec(e, "formatBlock", null, c, a);
        },
        state: function(e, f) {
            return d.commands.formatBlock.state(e, "formatBlock", null, c, a);
        },
        value: function() {
            return b;
        }
    };
})(wysihtml5);

(function(d) {
    var b, c = "wysiwyg-text-align-right", a = /wysiwyg-text-align-[a-z]+/g;
    d.commands.justifyRight = {
        exec: function(e, f) {
            return d.commands.formatBlock.exec(e, "formatBlock", null, c, a);
        },
        state: function(e, f) {
            return d.commands.formatBlock.state(e, "formatBlock", null, c, a);
        },
        value: function() {
            return b;
        }
    };
})(wysihtml5);

(function(b) {
    var a;
    b.commands.underline = {
        exec: function(c, d) {
            return b.commands.formatInline.exec(c, d, "u");
        },
        state: function(c, d) {
            return b.commands.formatInline.state(c, d, "u");
        },
        value: function() {
            return a;
        }
    };
})(wysihtml5);

(function(k) {
    var f = 90, h = 89, j = 8, b = 46, a = 40, g = '<span id="_wysihtml5-undo" class="_wysihtml5-temp">' + k.INVISIBLE_SPACE + "</span>", e = '<span id="_wysihtml5-redo" class="_wysihtml5-temp">' + k.INVISIBLE_SPACE + "</span>", d = k.dom;
    function c(m) {
        var l;
        while (l = m.querySelector("._wysihtml5-temp")) {
            l.parentNode.removeChild(l);
        }
    }
    k.UndoManager = k.lang.Dispatcher.extend({
        constructor: function(l) {
            this.editor = l;
            this.composer = l.composer;
            this.element = this.composer.element;
            this.history = [ this.composer.getValue() ];
            this.position = 1;
            if (this.composer.commands.support("insertHTML")) {
                this._observe();
            }
        },
        _observe: function() {
            var o = this, r = this.composer.sandbox.getDocument(), l;
            d.observe(this.element, "keydown", function(u) {
                if (u.altKey || !u.ctrlKey && !u.metaKey) {
                    return;
                }
                var v = u.keyCode, s = v === f && !u.shiftKey, t = v === f && u.shiftKey || v === h;
                if (s) {
                    o.undo();
                    u.preventDefault();
                } else {
                    if (t) {
                        o.redo();
                        u.preventDefault();
                    }
                }
            });
            d.observe(this.element, "keydown", function(s) {
                var t = s.keyCode;
                if (t === l) {
                    return;
                }
                l = t;
                if (t === j || t === b) {
                    o.transact();
                }
            });
            if (k.browser.hasUndoInContextMenu()) {
                var m, n, p = function() {
                    c(r);
                    clearInterval(m);
                };
                d.observe(this.element, "contextmenu", function() {
                    p();
                    o.composer.selection.executeAndRestoreSimple(function() {
                        if (o.element.lastChild) {
                            o.composer.selection.setAfter(o.element.lastChild);
                        }
                        r.execCommand("insertHTML", false, g);
                        r.execCommand("insertHTML", false, e);
                        r.execCommand("undo", false, null);
                    });
                    m = setInterval(function() {
                        if (r.getElementById("_wysihtml5-redo")) {
                            p();
                            o.redo();
                        } else {
                            if (!r.getElementById("_wysihtml5-undo")) {
                                p();
                                o.undo();
                            }
                        }
                    }, 400);
                    if (!n) {
                        n = true;
                        d.observe(document, "mousedown", p);
                        d.observe(r, [ "mousedown", "paste", "cut", "copy" ], p);
                    }
                });
            }
            this.editor.observe("newword:composer", function() {
                o.transact();
            }).observe("beforecommand:composer", function() {
                o.transact();
            });
        },
        transact: function() {
            var n = this.history[this.position - 1], l = this.composer.getValue();
            if (l == n) {
                return;
            }
            var m = this.history.length = this.position;
            if (m > a) {
                this.history.shift();
                this.position--;
            }
            this.position++;
            this.history.push(l);
        },
        undo: function() {
            this.transact();
            if (this.position <= 1) {
                return;
            }
            this.set(this.history[--this.position - 1]);
            this.editor.fire("undo:composer");
        },
        redo: function() {
            if (this.position >= this.history.length) {
                return;
            }
            this.set(this.history[++this.position - 1]);
            this.editor.fire("redo:composer");
        },
        set: function(l) {
            this.composer.setValue(l);
            this.editor.focus(true);
        }
    });
})(wysihtml5);

wysihtml5.views.View = Base.extend({
    constructor: function(b, c, a) {
        this.parent = b;
        this.element = c;
        this.config = a;
        this._observeViewChange();
    },
    _observeViewChange: function() {
        var a = this;
        this.parent.observe("beforeload", function() {
            a.parent.observe("change_view", function(b) {
                if (b === a.name) {
                    a.parent.currentView = a;
                    a.show();
                    setTimeout(function() {
                        a.focus();
                    }, 0);
                } else {
                    a.hide();
                }
            });
        });
    },
    focus: function() {
        if (this.element.ownerDocument.querySelector(":focus") === this.element) {
            return;
        }
        try {
            this.element.focus();
        } catch (a) {}
    },
    hide: function() {
        this.element.style.display = "none";
    },
    show: function() {
        this.element.style.display = "";
    },
    disable: function() {
        this.element.setAttribute("disabled", "disabled");
    },
    enable: function() {
        this.element.removeAttribute("disabled");
    }
});

(function(c) {
    var b = c.dom, a = c.browser;
    c.views.Composer = c.views.View.extend({
        name: "composer",
        CARET_HACK: "<br>",
        constructor: function(e, f, d) {
            this.base(e, f, d);
            this.textarea = this.parent.textarea;
            this._initSandbox();
        },
        clear: function() {
            this.element.innerHTML = a.displaysCaretInEmptyContentEditableCorrectly() ? "" : this.CARET_HACK;
        },
        getValue: function(e) {
            var d = this.isEmpty() ? "" : c.quirks.getCorrectInnerHTML(this.element);
            if (e) {
                d = this.parent.parse(d);
            }
            d = c.lang.string(d).replace(c.INVISIBLE_SPACE).by("");
            return d;
        },
        setValue: function(d, e) {
            if (e) {
                d = this.parent.parse(d);
            }
            this.element.innerHTML = d;
        },
        show: function() {
            this.iframe.style.display = this._displayStyle || "";
            this.disable();
            this.enable();
        },
        hide: function() {
            this._displayStyle = b.getStyle("display").from(this.iframe);
            if (this._displayStyle === "none") {
                this._displayStyle = null;
            }
            this.iframe.style.display = "none";
        },
        disable: function() {
            this.element.removeAttribute("contentEditable");
            this.base();
        },
        enable: function() {
            this.element.setAttribute("contentEditable", "true");
            this.base();
        },
        focus: function(e) {
            if (c.browser.doesAsyncFocus() && this.hasPlaceholderSet()) {
                this.clear();
            }
            this.base();
            var d = this.element.lastChild;
            if (e && d) {
                if (d.nodeName === "BR") {
                    this.selection.setBefore(this.element.lastChild);
                } else {
                    this.selection.setAfter(this.element.lastChild);
                }
            }
        },
        getTextContent: function() {
            return b.getTextContent(this.element);
        },
        hasPlaceholderSet: function() {
            return this.getTextContent() == this.textarea.element.getAttribute("placeholder");
        },
        isEmpty: function() {
            var e = this.element.innerHTML, d = "blockquote, ul, ol, img, embed, object, table, iframe, svg, video, audio, button, input, select, textarea";
            return e === "" || e === this.CARET_HACK || this.hasPlaceholderSet() || this.getTextContent() === "" && !this.element.querySelector(d);
        },
        _initSandbox: function() {
            var e = this;
            this.sandbox = new b.Sandbox(function() {
                e._create();
            }, {
                stylesheets: this.config.stylesheets
            });
            this.iframe = this.sandbox.getIframe();
            var d = document.createElement("input");
            d.type = "hidden";
            d.name = "_wysihtml5_mode";
            d.value = 1;
            var f = this.textarea.element;
            b.insert(this.iframe).after(f);
            b.insert(d).after(f);
        },
        _create: function() {
            var f = this;
            this.doc = this.sandbox.getDocument();
            this.element = this.doc.body;
            this.textarea = this.parent.textarea;
            this.element.innerHTML = this.textarea.getValue(true);
            this.enable();
            this.selection = new c.Selection(this.parent);
            this.commands = new c.Commands(this.parent);
            b.copyAttributes([ "className", "spellcheck", "title", "lang", "dir", "accessKey" ]).from(this.textarea.element).to(this.element);
            b.addClass(this.element, this.config.composerClassName);
            if (this.config.style) {
                this.style();
            }
            this.observe();
            var e = this.config.name;
            if (e) {
                b.addClass(this.element, e);
                b.addClass(this.iframe, e);
            }
            var d = typeof this.config.placeholder === "string" ? this.config.placeholder : this.textarea.element.getAttribute("placeholder");
            if (d) {
                b.simulatePlaceholder(this.parent, this, d);
            }
            this.commands.exec("styleWithCSS", false);
            this._initAutoLinking();
            this._initObjectResizing();
            this._initUndoManager();
            if (this.textarea.element.hasAttribute("autofocus") || document.querySelector(":focus") == this.textarea.element) {
                setTimeout(function() {
                    f.focus();
                }, 100);
            }
            c.quirks.insertLineBreakOnReturn(this);
            if (!a.clearsContentEditableCorrectly()) {
                c.quirks.ensureProperClearing(this);
            }
            if (!a.clearsListsInContentEditableCorrectly()) {
                c.quirks.ensureProperClearingOfLists(this);
            }
            if (this.initSync && this.config.sync) {
                this.initSync();
            }
            this.textarea.hide();
            this.parent.fire("beforeload").fire("load");
        },
        _initAutoLinking: function() {
            var h = this, e = a.canDisableAutoLinking(), f = a.doesAutoLinkingInContentEditable();
            if (e) {
                this.commands.exec("autoUrlDetect", false);
            }
            if (!this.config.autoLink) {
                return;
            }
            if (!f || f && e) {
                this.parent.observe("newword:composer", function() {
                    h.selection.executeAndRestore(function(k, l) {
                        b.autoLink(l.parentNode);
                    });
                });
            }
            var d = this.sandbox.getDocument().getElementsByTagName("a"), j = b.autoLink.URL_REG_EXP, g = function(k) {
                var l = c.lang.string(b.getTextContent(k)).trim();
                if (l.substr(0, 4) === "www.") {
                    l = "http://" + l;
                }
                return l;
            };
            b.observe(this.element, "keydown", function(m) {
                if (!d.length) {
                    return;
                }
                var n = h.selection.getSelectedNode(m.target.ownerDocument), l = b.getParentElement(n, {
                    nodeName: "A"
                }, 4), k;
                if (!l) {
                    return;
                }
                k = g(l);
                setTimeout(function() {
                    var o = g(l);
                    if (o === k) {
                        return;
                    }
                    if (o.match(j)) {
                        l.setAttribute("href", o);
                    }
                }, 0);
            });
        },
        _initObjectResizing: function() {
            var f = [ "width", "height" ], e = f.length, d = this.element;
            this.commands.exec("enableObjectResizing", this.config.allowObjectResizing);
            if (this.config.allowObjectResizing) {
                if (a.supportsEvent("resizeend")) {
                    b.observe(d, "resizeend", function(j) {
                        var l = j.target || j.srcElement, h = l.style, g = 0, k;
                        for (;g < e; g++) {
                            k = f[g];
                            if (h[k]) {
                                l.setAttribute(k, parseInt(h[k], 10));
                                h[k] = "";
                            }
                        }
                        c.quirks.redraw(d);
                    });
                }
            } else {
                if (a.supportsEvent("resizestart")) {
                    b.observe(d, "resizestart", function(g) {
                        g.preventDefault();
                    });
                }
            }
        },
        _initUndoManager: function() {
            new c.UndoManager(this.parent);
        }
    });
})(wysihtml5);

(function(k) {
    var a = k.dom, g = document, d = window, e = g.createElement("div"), b = [ "background-color", "color", "cursor", "font-family", "font-size", "font-style", "font-variant", "font-weight", "line-height", "letter-spacing", "text-align", "text-decoration", "text-indent", "text-rendering", "word-break", "word-wrap", "word-spacing" ], h = [ "background-color", "border-collapse", "border-bottom-color", "border-bottom-style", "border-bottom-width", "border-left-color", "border-left-style", "border-left-width", "border-right-color", "border-right-style", "border-right-width", "border-top-color", "border-top-style", "border-top-width", "clear", "display", "float", "margin-bottom", "margin-left", "margin-right", "margin-top", "outline-color", "outline-offset", "outline-width", "outline-style", "padding-left", "padding-right", "padding-top", "padding-bottom", "position", "top", "left", "right", "bottom", "z-index", "vertical-align", "text-align", "-webkit-box-sizing", "-moz-box-sizing", "-ms-box-sizing", "box-sizing", "-webkit-box-shadow", "-moz-box-shadow", "-ms-box-shadow", "box-shadow", "-webkit-border-top-right-radius", "-moz-border-radius-topright", "border-top-right-radius", "-webkit-border-bottom-right-radius", "-moz-border-radius-bottomright", "border-bottom-right-radius", "-webkit-border-bottom-left-radius", "-moz-border-radius-bottomleft", "border-bottom-left-radius", "-webkit-border-top-left-radius", "-moz-border-radius-topleft", "border-top-left-radius", "width", "height" ], c = [ "width", "height", "top", "left", "right", "bottom" ], f = [ "html             { height: 100%; }", "body             { min-height: 100%; padding: 0; margin: 0; margin-top: -1px; padding-top: 1px; }", "._wysihtml5-temp { display: none; }", k.browser.isGecko ? "body.placeholder { color: graytext !important; }" : "body.placeholder { color: #a9a9a9 !important; }", "body[disabled]   { background-color: #eee !important; color: #999 !important; cursor: default !important; }", "img:-moz-broken  { -moz-force-broken-image-icon: 1; height: 24px; width: 24px; }" ];
    var j = function(n) {
        if (n.setActive) {
            try {
                n.setActive();
            } catch (p) {}
        } else {
            var o = n.style, r = g.documentElement.scrollTop || g.body.scrollTop, m = g.documentElement.scrollLeft || g.body.scrollLeft, l = {
                position: o.position,
                top: o.top,
                left: o.left,
                WebkitUserSelect: o.WebkitUserSelect
            };
            a.setStyles({
                position: "absolute",
                top: "-99999px",
                left: "-99999px",
                WebkitUserSelect: "none"
            }).on(n);
            n.focus();
            a.setStyles(l).on(n);
            if (d.scrollTo) {
                d.scrollTo(m, r);
            }
        }
    };
    k.views.Composer.prototype.style = function() {
        var p = this, o = g.querySelector(":focus"), s = this.textarea.element, l = s.hasAttribute("placeholder"), r = l && s.getAttribute("placeholder");
        this.focusStylesHost = this.focusStylesHost || e.cloneNode(false);
        this.blurStylesHost = this.blurStylesHost || e.cloneNode(false);
        if (l) {
            s.removeAttribute("placeholder");
        }
        if (s === o) {
            s.blur();
        }
        a.copyStyles(h).from(s).to(this.iframe).andTo(this.blurStylesHost);
        a.copyStyles(b).from(s).to(this.element).andTo(this.blurStylesHost);
        a.insertCSS(f).into(this.element.ownerDocument);
        j(s);
        a.copyStyles(h).from(s).to(this.focusStylesHost);
        a.copyStyles(b).from(s).to(this.focusStylesHost);
        var n = k.lang.array(h).without([ "display" ]);
        if (o) {
            o.focus();
        } else {
            s.blur();
        }
        if (l) {
            s.setAttribute("placeholder", r);
        }
        if (!k.browser.hasCurrentStyleProperty()) {
            var m = a.observe(d, "resize", function() {
                if (!a.contains(document.documentElement, p.iframe)) {
                    m.stop();
                    return;
                }
                var u = a.getStyle("display").from(s), t = a.getStyle("display").from(p.iframe);
                s.style.display = "";
                p.iframe.style.display = "none";
                a.copyStyles(c).from(s).to(p.iframe).andTo(p.focusStylesHost).andTo(p.blurStylesHost);
                p.iframe.style.display = t;
                s.style.display = u;
            });
        }
        this.parent.observe("focus:composer", function() {
            a.copyStyles(n).from(p.focusStylesHost).to(p.iframe);
            a.copyStyles(b).from(p.focusStylesHost).to(p.element);
        });
        this.parent.observe("blur:composer", function() {
            a.copyStyles(n).from(p.blurStylesHost).to(p.iframe);
            a.copyStyles(b).from(p.blurStylesHost).to(p.element);
        });
        return this;
    };
})(wysihtml5);

(function(d) {
    var c = d.dom, b = d.browser, a = {
        66: "bold",
        73: "italic",
        85: "underline"
    };
    d.views.Composer.prototype.observe = function() {
        var j = this, l = this.getValue(), h = this.sandbox.getIframe(), g = this.element, f = b.supportsEventsInIframeCorrectly() ? g : this.sandbox.getWindow(), e = b.supportsEvent("drop") ? [ "drop", "paste" ] : [ "dragdrop", "paste" ];
        c.observe(h, "DOMNodeRemoved", function() {
            clearInterval(k);
            j.parent.fire("destroy:composer");
        });
        var k = setInterval(function() {
            if (!c.contains(document.documentElement, h)) {
                clearInterval(k);
                j.parent.fire("destroy:composer");
            }
        }, 250);
        c.observe(f, "focus", function() {
            j.parent.fire("focus").fire("focus:composer");
            setTimeout(function() {
                l = j.getValue();
            }, 0);
        });
        c.observe(f, "blur", function() {
            if (l !== j.getValue()) {
                j.parent.fire("change").fire("change:composer");
            }
            j.parent.fire("blur").fire("blur:composer");
        });
        if (d.browser.isIos()) {
            c.observe(g, "blur", function() {
                var o = g.ownerDocument.createElement("input"), r = document.documentElement.scrollTop || document.body.scrollTop, n = document.documentElement.scrollLeft || document.body.scrollLeft;
                try {
                    j.selection.insertNode(o);
                } catch (p) {
                    g.appendChild(o);
                }
                o.focus();
                o.parentNode.removeChild(o);
                window.scrollTo(n, r);
            });
        }
        c.observe(g, "dragenter", function() {
            j.parent.fire("unset_placeholder");
        });
        if (b.firesOnDropOnlyWhenOnDragOverIsCancelled()) {
            c.observe(g, [ "dragover", "dragenter" ], function(n) {
                n.preventDefault();
            });
        }
        c.observe(g, e, function(n) {
            var p = n.dataTransfer, o;
            console.log("PASTED", n);
            if (p && b.supportsDataTransfer()) {
                o = p.getData("text/html") || p.getData("text/plain");
            }
            if (o) {
                g.focus();
                j.commands.exec("insertHTML", o);
                j.parent.fire("paste").fire("paste:composer");
                n.stopPropagation();
                n.preventDefault();
            } else {
                setTimeout(function() {
                    j.parent.fire("paste").fire("paste:composer");
                }, 0);
            }
        });
        c.observe(g, "keyup", function(n) {
            var o = n.keyCode;
            if (o === d.SPACE_KEY || o === d.ENTER_KEY) {
                j.parent.fire("newword:composer");
            }
        });
        this.parent.observe("paste:composer", function() {
            setTimeout(function() {
                j.parent.fire("newword:composer");
            }, 0);
        });
        if (!b.canSelectImagesInContentEditable()) {
            c.observe(g, "mousedown", function(n) {
                var o = n.target;
                if (o.nodeName === "IMG") {
                    j.selection.selectNode(o);
                    n.preventDefault();
                }
            });
        }
        c.observe(g, "keydown", function(n) {
            var o = n.keyCode, p = a[o];
            if ((n.ctrlKey || n.metaKey) && !n.altKey && p) {
                j.commands.exec(p);
                n.preventDefault();
            }
        });
        c.observe(g, "keydown", function(o) {
            var r = j.selection.getSelectedNode(true), p = o.keyCode, n;
            if (r && r.nodeName === "IMG" && (p === d.BACKSPACE_KEY || p === d.DELETE_KEY)) {
                n = r.parentNode;
                n.removeChild(r);
                if (n.nodeName === "A" && !n.firstChild) {
                    n.parentNode.removeChild(n);
                }
                setTimeout(function() {
                    d.quirks.redraw(g);
                }, 0);
                o.preventDefault();
            }
        });
        var m = {
            IMG: "Image: ",
            A: "Link: "
        };
        c.observe(g, "mouseover", function(o) {
            var p = o.target, s = p.nodeName, r;
            if (s !== "A" && s !== "IMG") {
                return;
            }
            var n = p.hasAttribute("title");
            if (!n) {
                r = m[s] + (p.getAttribute("href") || p.getAttribute("src"));
                p.setAttribute("title", r);
            }
        });
    };
})(wysihtml5);

(function(b) {
    var a = 400;
    b.views.Synchronizer = Base.extend({
        constructor: function(e, c, d) {
            this.editor = e;
            this.textarea = c;
            this.composer = d;
            this._observe();
        },
        fromComposerToTextarea: function(c) {
            this.textarea.setValue(b.lang.string(this.composer.getValue()).trim(), c);
        },
        fromTextareaToComposer: function(d) {
            var c = this.textarea.getValue();
            if (c) {
                this.composer.setValue(c, d);
            } else {
                this.composer.clear();
                this.editor.fire("set_placeholder");
            }
        },
        sync: function(c) {
            if (this.editor.currentView.name === "textarea") {
                this.fromTextareaToComposer(c);
            } else {
                this.fromComposerToTextarea(c);
            }
        },
        _observe: function() {
            var c, e = this, d = this.textarea.element.form, g = function() {
                c = setInterval(function() {
                    e.fromComposerToTextarea();
                }, a);
            }, f = function() {
                clearInterval(c);
                c = null;
            };
            g();
            if (d) {
                b.dom.observe(d, "submit", function() {
                    e.sync(true);
                });
                b.dom.observe(d, "reset", function() {
                    setTimeout(function() {
                        e.fromTextareaToComposer();
                    }, 0);
                });
            }
            this.editor.observe("change_view", function(h) {
                if (h === "composer" && !c) {
                    e.fromTextareaToComposer(true);
                    g();
                } else {
                    if (h === "textarea") {
                        e.fromComposerToTextarea(true);
                        f();
                    }
                }
            });
            this.editor.observe("destroy:composer", f);
        }
    });
})(wysihtml5);

wysihtml5.views.Textarea = wysihtml5.views.View.extend({
    name: "textarea",
    constructor: function(b, c, a) {
        this.base(b, c, a);
        this._observe();
    },
    clear: function() {
        this.element.value = "";
    },
    getValue: function(b) {
        var a = this.isEmpty() ? "" : this.element.value;
        if (b) {
            a = this.parent.parse(a);
        }
        return a;
    },
    setValue: function(a, b) {
        if (b) {
            a = this.parent.parse(a);
        }
        this.element.value = a;
    },
    hasPlaceholderSet: function() {
        var d = wysihtml5.browser.supportsPlaceholderAttributeOn(this.element), a = this.element.getAttribute("placeholder") || null, b = this.element.value, c = !b;
        return d && c || b === a;
    },
    isEmpty: function() {
        return !wysihtml5.lang.string(this.element.value).trim() || this.hasPlaceholderSet();
    },
    _observe: function() {
        var c = this.element, d = this.parent, a = {
            focusin: "focus",
            focusout: "blur"
        }, b = wysihtml5.browser.supportsEvent("focusin") ? [ "focusin", "focusout", "change" ] : [ "focus", "blur", "change" ];
        d.observe("beforeload", function() {
            wysihtml5.dom.observe(c, b, function(f) {
                var e = a[f.type] || f.type;
                d.fire(e).fire(e + ":textarea");
            });
            wysihtml5.dom.observe(c, [ "paste", "drop" ], function() {
                setTimeout(function() {
                    d.fire("paste").fire("paste:textarea");
                }, 0);
            });
        });
    }
});

(function(f) {
    var e = f.dom, a = "wysihtml5-command-dialog-opened", d = "input, select, textarea", b = "[data-wysihtml5-dialog-field]", c = "data-wysihtml5-dialog-field";
    f.toolbar.Dialog = f.lang.Dispatcher.extend({
        constructor: function(h, g) {
            this.link = h;
            this.container = g;
        },
        _observe: function() {
            if (this._observed) {
                return;
            }
            var k = this, l = function(o) {
                var n = k._serialize();
                if (n == k.elementToChange) {
                    k.fire("edit", n);
                } else {
                    k.fire("save", n);
                }
                k.hide();
                o.preventDefault();
                o.stopPropagation();
            };
            e.observe(k.link, "click", function(n) {
                if (e.hasClass(k.link, a)) {
                    setTimeout(function() {
                        k.hide();
                    }, 0);
                }
            });
            e.observe(this.container, "keydown", function(n) {
                var o = n.keyCode;
                if (o === f.ENTER_KEY) {
                    l(n);
                }
                if (o === f.ESCAPE_KEY) {
                    k.hide();
                }
            });
            e.delegate(this.container, "[data-wysihtml5-dialog-action=save]", "click", l);
            e.delegate(this.container, "[data-wysihtml5-dialog-action=cancel]", "click", function(n) {
                k.fire("cancel");
                k.hide();
                n.preventDefault();
                n.stopPropagation();
            });
            var h = this.container.querySelectorAll(d), g = 0, j = h.length, m = function() {
                clearInterval(k.interval);
            };
            for (;g < j; g++) {
                e.observe(h[g], "change", m);
            }
            this._observed = true;
        },
        _serialize: function() {
            var k = this.elementToChange || {}, g = this.container.querySelectorAll(b), j = g.length, h = 0;
            for (;h < j; h++) {
                k[g[h].getAttribute(c)] = g[h].value;
            }
            return k;
        },
        _interpolate: function(m) {
            var l, o, k, n = document.querySelector(":focus"), g = this.container.querySelectorAll(b), j = g.length, h = 0;
            for (;h < j; h++) {
                l = g[h];
                if (l === n) {
                    continue;
                }
                if (m && l.type === "hidden") {
                    continue;
                }
                o = l.getAttribute(c);
                k = this.elementToChange ? this.elementToChange[o] || "" : l.defaultValue;
                l.value = k;
            }
        },
        show: function(k) {
            var h = this, g = this.container.querySelector(d);
            this.elementToChange = k;
            this._observe();
            this._interpolate();
            if (k) {
                this.interval = setInterval(function() {
                    h._interpolate(true);
                }, 500);
            }
            e.addClass(this.link, a);
            this.container.style.display = "";
            this.fire("show");
            if (g && !k) {
                try {
                    g.focus();
                } catch (j) {}
            }
        },
        hide: function() {
            clearInterval(this.interval);
            this.elementToChange = null;
            e.removeClass(this.link, a);
            this.container.style.display = "none";
            this.fire("hide");
        }
    });
})(wysihtml5);

(function(f) {
    var e = f.dom;
    var d = {
        position: "relative"
    };
    var c = {
        left: 0,
        margin: 0,
        opacity: 0,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 0,
        zIndex: 1
    };
    var b = {
        cursor: "inherit",
        fontSize: "50px",
        height: "50px",
        marginTop: "-25px",
        outline: 0,
        padding: 0,
        position: "absolute",
        right: "-4px",
        top: "50%"
    };
    var a = {
        "x-webkit-speech": "",
        speech: ""
    };
    f.toolbar.Speech = function(j, k) {
        var h = document.createElement("input");
        if (!f.browser.supportsSpeechApiOn(h)) {
            k.style.display = "none";
            return;
        }
        var l = document.createElement("div");
        f.lang.object(c).merge({
            width: k.offsetWidth + "px",
            height: k.offsetHeight + "px"
        });
        e.insert(h).into(l);
        e.insert(l).into(k);
        e.setStyles(b).on(h);
        e.setAttributes(a).on(h);
        e.setStyles(c).on(l);
        e.setStyles(d).on(k);
        var g = "onwebkitspeechchange" in h ? "webkitspeechchange" : "speechchange";
        e.observe(h, g, function() {
            j.execCommand("insertText", h.value);
            h.value = "";
        });
        e.observe(h, "click", function(m) {
            if (e.hasClass(k, "wysihtml5-command-disabled")) {
                m.preventDefault();
            }
            m.stopPropagation();
        });
    };
})(wysihtml5);

(function(f) {
    var a = "wysihtml5-command-disabled", b = "wysihtml5-commands-disabled", c = "wysihtml5-command-active", d = "wysihtml5-action-active", e = f.dom;
    f.toolbar.Toolbar = Base.extend({
        constructor: function(k, g) {
            this.editor = k;
            this.container = typeof g === "string" ? document.getElementById(g) : g;
            this.composer = k.composer;
            this._getLinks("command");
            this._getLinks("action");
            this._observe();
            this.show();
            var h = this.container.querySelectorAll("[data-wysihtml5-command=insertSpeech]"), l = h.length, j = 0;
            for (;j < l; j++) {
                new f.toolbar.Speech(this, h[j]);
            }
        },
        _getLinks: function(m) {
            var r = this[m + "Links"] = f.lang.array(this.container.querySelectorAll("[data-wysihtml5-" + m + "]")).get(), j = r.length, k = 0, g = this[m + "Mapping"] = {}, n, p, h, o, l;
            for (;k < j; k++) {
                n = r[k];
                h = n.getAttribute("data-wysihtml5-" + m);
                o = n.getAttribute("data-wysihtml5-" + m + "-value");
                p = this.container.querySelector("[data-wysihtml5-" + m + "-group='" + h + "']");
                l = this._getDialog(n, h);
                g[h + ":" + o] = {
                    link: n,
                    group: p,
                    name: h,
                    value: o,
                    dialog: l,
                    state: false
                };
            }
        },
        _getDialog: function(l, m) {
            var k = this, j = this.container.querySelector("[data-wysihtml5-dialog='" + m + "']"), h, g;
            if (j) {
                h = new f.toolbar.Dialog(l, j);
                h.observe("show", function() {
                    g = k.composer.selection.getBookmark();
                    k.editor.fire("show:dialog", {
                        command: m,
                        dialogContainer: j,
                        commandLink: l
                    });
                });
                h.observe("save", function(n) {
                    if (g) {
                        k.composer.selection.setBookmark(g);
                    }
                    k._execCommand(m, n);
                    k.editor.fire("save:dialog", {
                        command: m,
                        dialogContainer: j,
                        commandLink: l
                    });
                });
                h.observe("cancel", function() {
                    k.editor.focus(false);
                    k.editor.fire("cancel:dialog", {
                        command: m,
                        dialogContainer: j,
                        commandLink: l
                    });
                });
            }
            return h;
        },
        execCommand: function(j, g) {
            if (this.commandsDisabled) {
                return;
            }
            var h = this.commandMapping[j + ":" + g];
            if (h && h.dialog && !h.state) {
                h.dialog.show();
            } else {
                this._execCommand(j, g);
            }
        },
        _execCommand: function(h, g) {
            this.editor.focus(false);
            this.composer.commands.exec(h, g);
            this._updateLinkStates();
        },
        execAction: function(h) {
            var g = this.editor;
            switch (h) {
              case "change_view":
                if (g.currentView === g.textarea) {
                    g.fire("change_view", "composer");
                } else {
                    g.fire("change_view", "textarea");
                }
                break;
            }
        },
        _observe: function() {
            var m = this, k = this.editor, g = this.container, h = this.commandLinks.concat(this.actionLinks), l = h.length, j = 0;
            for (;j < l; j++) {
                e.setAttributes({
                    href: "javascript:;",
                    unselectable: "on"
                }).on(h[j]);
            }
            e.delegate(g, "[data-wysihtml5-command]", "mousedown", function(n) {
                n.preventDefault();
            });
            e.delegate(g, "[data-wysihtml5-command]", "click", function(p) {
                var o = this, r = o.getAttribute("data-wysihtml5-command"), n = o.getAttribute("data-wysihtml5-command-value");
                m.execCommand(r, n);
                p.preventDefault();
            });
            e.delegate(g, "[data-wysihtml5-action]", "click", function(n) {
                var o = this.getAttribute("data-wysihtml5-action");
                m.execAction(o);
                n.preventDefault();
            });
            k.observe("focus:composer", function() {
                m.bookmark = null;
                clearInterval(m.interval);
                m.interval = setInterval(function() {
                    m._updateLinkStates();
                }, 500);
            });
            k.observe("blur:composer", function() {
                clearInterval(m.interval);
            });
            k.observe("destroy:composer", function() {
                clearInterval(m.interval);
            });
            k.observe("change_view", function(n) {
                setTimeout(function() {
                    m.commandsDisabled = n !== "composer";
                    m._updateLinkStates();
                    if (m.commandsDisabled) {
                        e.addClass(g, b);
                    } else {
                        e.removeClass(g, b);
                    }
                }, 0);
            });
        },
        _updateLinkStates: function() {
            var j = this.composer.element, h = this.commandMapping, m = this.actionMapping, g, l, k, n;
            for (g in h) {
                n = h[g];
                if (this.commandsDisabled) {
                    l = false;
                    e.removeClass(n.link, c);
                    if (n.group) {
                        e.removeClass(n.group, c);
                    }
                    if (n.dialog) {
                        n.dialog.hide();
                    }
                } else {
                    l = this.composer.commands.state(n.name, n.value);
                    if (f.lang.object(l).isArray()) {
                        l = l.length === 1 ? l[0] : true;
                    }
                    e.removeClass(n.link, a);
                    if (n.group) {
                        e.removeClass(n.group, a);
                    }
                }
                if (n.state === l) {
                    continue;
                }
                n.state = l;
                if (l) {
                    e.addClass(n.link, c);
                    if (n.group) {
                        e.addClass(n.group, c);
                    }
                    if (n.dialog) {
                        if (typeof l === "object") {
                            n.dialog.show(l);
                        } else {
                            n.dialog.hide();
                        }
                    }
                } else {
                    e.removeClass(n.link, c);
                    if (n.group) {
                        e.removeClass(n.group, c);
                    }
                    if (n.dialog) {
                        n.dialog.hide();
                    }
                }
            }
            for (g in m) {
                k = m[g];
                if (k.name === "change_view") {
                    k.state = this.editor.currentView === this.editor.textarea;
                    if (k.state) {
                        e.addClass(k.link, d);
                    } else {
                        e.removeClass(k.link, d);
                    }
                }
            }
        },
        show: function() {
            this.container.style.display = "";
        },
        hide: function() {
            this.container.style.display = "none";
        }
    });
})(wysihtml5);

(function(c) {
    var b;
    var a = {
        name: b,
        style: true,
        toolbar: b,
        autoLink: true,
        parserRules: {
            tags: {
                br: {},
                span: {},
                div: {},
                p: {}
            },
            classes: {}
        },
        parser: c.dom.parse,
        composerClassName: "wysihtml5-editor",
        bodyClassName: "wysihtml5-supported",
        stylesheets: [],
        placeholderText: b,
        allowObjectResizing: true,
        supportTouchDevices: true
    };
    c.Editor = c.lang.Dispatcher.extend({
        constructor: function(h, d) {
            this.textareaElement = typeof h === "string" ? document.getElementById(h) : h;
            this.config = c.lang.object({}).merge(a).merge(d).get();
            this.textarea = new c.views.Textarea(this, this.textareaElement, this.config);
            this.currentView = this.textarea;
            this._isCompatible = c.browser.supported();
            if (!this._isCompatible || !this.config.supportTouchDevices && c.browser.isTouchDevice()) {
                var f = this;
                setTimeout(function() {
                    f.fire("beforeload").fire("load");
                }, 0);
                return;
            }
            c.dom.addClass(document.body, this.config.bodyClassName);
            this.composer = new c.views.Composer(this, this.textareaElement, this.config);
            this.currentView = this.composer;
            if (typeof this.config.parser === "function") {
                this._initParser();
            }
            this.observe("beforeload", function() {
                this.synchronizer = new c.views.Synchronizer(this, this.textarea, this.composer);
                if (this.config.toolbar) {
                    this.toolbar = new c.toolbar.Toolbar(this, this.config.toolbar);
                }
            });
            try {
                console.log("Heya! This page is using wysihtml5 for rich text editing. Check out https://github.com/xing/wysihtml5");
            } catch (g) {}
        },
        isCompatible: function() {
            return this._isCompatible;
        },
        clear: function() {
            this.currentView.clear();
            return this;
        },
        getValue: function(d) {
            return this.currentView.getValue(d);
        },
        setValue: function(d, e) {
            if (!d) {
                return this.clear();
            }
            this.currentView.setValue(d, e);
            return this;
        },
        focus: function(d) {
            this.currentView.focus(d);
            return this;
        },
        disable: function() {
            this.currentView.disable();
            return this;
        },
        enable: function() {
            this.currentView.enable();
            return this;
        },
        isEmpty: function() {
            return this.currentView.isEmpty();
        },
        hasPlaceholderSet: function() {
            return this.currentView.hasPlaceholderSet();
        },
        parse: function(d) {
            var e = this.config.parser(d, this.config.parserRules, this.composer.sandbox.getDocument(), true);
            if (typeof d === "object") {
                c.quirks.redraw(d);
            }
            return e;
        },
        _initParser: function() {
            this.observe("paste:composer", function() {
                var d = true, e = this;
                e.composer.selection.executeAndRestore(function() {
                    c.quirks.cleanPastedHTML(e.composer.element);
                    e.parse(e.composer.element);
                }, d);
            });
            this.observe("paste:textarea", function() {
                var d = this.textarea.getValue(), e;
                e = this.parse(d);
                this.textarea.setValue(e);
            });
        }
    });
})(wysihtml5);

!function(f, h) {
    var d = {
        "font-styles": function(j, k) {
            var l = k && k.size ? " btn-" + k.size : "";
            return "<li class='dropdown'><a class='btn dropdown-toggle" + l + "' data-toggle='dropdown' href='#'><i class='icon-font'></i>&nbsp;<span class='current-font'>" + j.font_styles.normal + "</span>&nbsp;<b class='caret'></b></a><ul class='dropdown-menu'><li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='div'>" + j.font_styles.normal + "</a></li><li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h1'>" + j.font_styles.h1 + "</a></li><li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h2'>" + j.font_styles.h2 + "</a></li><li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h3'>" + j.font_styles.h3 + "</a></li></ul></li>";
        },
        emphasis: function(j, k) {
            var l = k && k.size ? " btn-" + k.size : "";
            return "<li><div class='btn-group'><a class='btn" + l + "' data-wysihtml5-command='bold' title='CTRL+B'>" + j.emphasis.bold + "</a><a class='btn" + l + "' data-wysihtml5-command='italic' title='CTRL+I'>" + j.emphasis.italic + "</a><a class='btn" + l + "' data-wysihtml5-command='underline' title='CTRL+U'>" + j.emphasis.underline + "</a></div></li>";
        },
        lists: function(j, k) {
            var l = k && k.size ? " btn-" + k.size : "";
            return "<li><div class='btn-group'><a class='btn" + l + "' data-wysihtml5-command='insertUnorderedList' title='" + j.lists.unordered + "'><i class='icon-list'></i></a><a class='btn" + l + "' data-wysihtml5-command='insertOrderedList' title='" + j.lists.ordered + "'><i class='icon-th-list'></i></a><a class='btn" + l + "' data-wysihtml5-command='Outdent' title='" + j.lists.outdent + "'><i class='icon-indent-right'></i></a><a class='btn" + l + "' data-wysihtml5-command='Indent' title='" + j.lists.indent + "'><i class='icon-indent-left'></i></a></div></li>";
        },
        link: function(j, k) {
            var l = k && k.size ? " btn-" + k.size : "";
            return "<li><div class='bootstrap-wysihtml5-insert-link-modal modal hide fade'><div class='modal-header'><a class='close' data-dismiss='modal'>&times;</a><h3>" + j.link.insert + "</h3></div><div class='modal-body'><input value='http://' class='bootstrap-wysihtml5-insert-link-url input-xlarge'></div><div class='modal-footer'><a href='#' class='btn' data-dismiss='modal'>" + j.link.cancel + "</a><a href='#' class='btn btn-primary' data-dismiss='modal'>" + j.link.insert + "</a></div></div><a class='btn" + l + "' data-wysihtml5-command='createLink' title='" + j.link.insert + "'><i class='icon-share'></i></a></li>";
        },
        image: function(j, k) {
            var l = k && k.size ? " btn-" + k.size : "";
            return "<li><div class='bootstrap-wysihtml5-insert-image-modal modal hide fade'><div class='modal-header'><a class='close' data-dismiss='modal'>&times;</a><h3>" + j.image.insert + "</h3></div><div class='modal-body'><input value='http://' class='bootstrap-wysihtml5-insert-image-url input-xlarge'></div><div class='modal-footer'><a href='#' class='btn' data-dismiss='modal'>" + j.image.cancel + "</a><a href='#' class='btn btn-primary' data-dismiss='modal'>" + j.image.insert + "</a></div></div><a class='btn" + l + "' data-wysihtml5-command='insertImage' title='" + j.image.insert + "'><i class='icon-picture'></i></a></li>";
        },
        html: function(j, k) {
            var l = k && k.size ? " btn-" + k.size : "";
            return "<li><div class='btn-group'><a class='btn" + l + "' data-wysihtml5-action='change_view' title='" + j.html.edit + "'><i class='icon-pencil'></i></a></div></li>";
        },
        color: function(j, k) {
            var l = k && k.size ? " btn-" + k.size : "";
            return "<li class='dropdown'><a class='btn dropdown-toggle" + l + "' data-toggle='dropdown' href='#'><span class='current-color'>" + j.colours.black + "</span>&nbsp;<b class='caret'></b></a><ul class='dropdown-menu'><li><div class='wysihtml5-colors' data-wysihtml5-command-value='black'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='black'>" + j.colours.black + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='silver'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='silver'>" + j.colours.silver + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='gray'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='gray'>" + j.colours.gray + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='maroon'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='maroon'>" + j.colours.maroon + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='red'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='red'>" + j.colours.red + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='purple'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='purple'>" + j.colours.purple + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='green'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='green'>" + j.colours.green + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='olive'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='olive'>" + j.colours.olive + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='navy'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='navy'>" + j.colours.navy + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='blue'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='blue'>" + j.colours.blue + "</a></li><li><div class='wysihtml5-colors' data-wysihtml5-command-value='orange'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='orange'>" + j.colours.orange + "</a></li></ul></li>";
        }
    };
    var e = function(l, j, k) {
        return d[l](j, k);
    };
    var g = function(l, j) {
        this.el = l;
        var m = j || b;
        for (var k in m.customTemplates) {
            d[k] = m.customTemplates[k];
        }
        this.toolbar = this.createToolbar(l, m);
        this.editor = this.createEditor(j);
        window.editor = this.editor;
        f("iframe.wysihtml5-sandbox").each(function(n, o) {
            f(o.contentWindow).off("focus.wysihtml5").on({
                "focus.wysihtml5": function() {
                    f("li.dropdown").removeClass("open");
                }
            });
        });
    };
    g.prototype = {
        constructor: g,
        createEditor: function(k) {
            k = k || {};
            k.toolbar = this.toolbar[0];
            var l = new h.Editor(this.el[0], k);
            if (k && k.events) {
                for (var j in k.events) {
                    l.on(j, k.events[j]);
                }
            }
            return l;
        },
        createToolbar: function(n, l) {
            var k = this;
            var o = f("<ul/>", {
                class: "wysihtml5-toolbar",
                style: "display:none"
            });
            var j = l.locale || b.locale || "en";
            for (var m in b) {
                var p = false;
                if (l[m] !== undefined) {
                    if (l[m] === true) {
                        p = true;
                    }
                } else {
                    p = b[m];
                }
                if (p === true) {
                    o.append(e(m, a[j], l));
                    if (m === "html") {
                        this.initHtml(o);
                    }
                    if (m === "link") {
                        this.initInsertLink(o);
                    }
                    if (m === "image") {
                        this.initInsertImage(o);
                    }
                }
            }
            if (l.toolbar) {
                for (m in l.toolbar) {
                    o.append(l.toolbar[m]);
                }
            }
            o.find("a[data-wysihtml5-command='formatBlock']").click(function(t) {
                var s = t.target || t.srcElement;
                var r = f(s);
                k.toolbar.find(".current-font").text(r.html());
            });
            o.find("a[data-wysihtml5-command='foreColor']").click(function(t) {
                var s = t.target || t.srcElement;
                var r = f(s);
                k.toolbar.find(".current-color").text(r.html());
            });
            this.el.before(o);
            return o;
        },
        initHtml: function(j) {
            var k = "a[data-wysihtml5-action='change_view']";
            j.find(k).click(function(l) {
                j.find("a.btn").not(k).toggleClass("disabled");
            });
        },
        initInsertImage: function(r) {
            var l = this;
            var p = r.find(".bootstrap-wysihtml5-insert-image-modal");
            var n = p.find(".bootstrap-wysihtml5-insert-image-url");
            var k = p.find("a.btn-primary");
            var j = n.val();
            var m;
            var o = function() {
                var s = n.val();
                n.val(j);
                l.editor.currentView.element.focus();
                if (m) {
                    l.editor.composer.selection.setBookmark(m);
                    m = null;
                }
                l.editor.composer.commands.exec("insertImage", s);
            };
            n.keypress(function(s) {
                if (s.which == 13) {
                    o();
                    p.modal("hide");
                }
            });
            k.click(o);
            p.on("shown", function() {
                n.focus();
            });
            p.on("hide", function() {
                l.editor.currentView.element.focus();
            });
            r.find("a[data-wysihtml5-command=insertImage]").click(function() {
                var s = f(this).hasClass("wysihtml5-command-active");
                if (!s) {
                    l.editor.currentView.element.focus(false);
                    m = l.editor.composer.selection.getBookmark();
                    p.modal("show");
                    p.on("click.dismiss.modal", '[data-dismiss="modal"]', function(t) {
                        t.stopPropagation();
                    });
                    return false;
                } else {
                    return true;
                }
            });
        },
        initInsertLink: function(o) {
            var s = this;
            var k = o.find(".bootstrap-wysihtml5-insert-link-modal");
            var m = k.find(".bootstrap-wysihtml5-insert-link-url");
            var l = k.find("a.btn-primary");
            var r = m.val();
            var j;
            var p = function() {
                var t = m.val();
                m.val(r);
                s.editor.currentView.element.focus();
                if (j) {
                    s.editor.composer.selection.setBookmark(j);
                    j = null;
                }
                s.editor.composer.commands.exec("createLink", {
                    href: t,
                    target: "_blank",
                    rel: "nofollow"
                });
            };
            var n = false;
            m.keypress(function(t) {
                if (t.which == 13) {
                    p();
                    k.modal("hide");
                }
            });
            l.click(p);
            k.on("shown", function() {
                m.focus();
            });
            k.on("hide", function() {
                s.editor.currentView.element.focus();
            });
            o.find("a[data-wysihtml5-command=createLink]").click(function() {
                var t = f(this).hasClass("wysihtml5-command-active");
                if (!t) {
                    s.editor.currentView.element.focus(false);
                    j = s.editor.composer.selection.getBookmark();
                    k.appendTo("body").modal("show");
                    k.on("click.dismiss.modal", '[data-dismiss="modal"]', function(u) {
                        u.stopPropagation();
                    });
                    return false;
                } else {
                    return true;
                }
            });
        }
    };
    var c = {
        resetDefaults: function() {
            f.fn.wysihtml5.defaultOptions = f.extend(true, {}, f.fn.wysihtml5.defaultOptionsCache);
        },
        bypassDefaults: function(j) {
            return this.each(function() {
                var k = f(this);
                k.data("wysihtml5", new g(k, j));
            });
        },
        shallowExtend: function(j) {
            var k = f.extend({}, f.fn.wysihtml5.defaultOptions, j || {});
            var l = this;
            return c.bypassDefaults.apply(l, [ k ]);
        },
        deepExtend: function(j) {
            var k = f.extend(true, {}, f.fn.wysihtml5.defaultOptions, j || {});
            var l = this;
            return c.bypassDefaults.apply(l, [ k ]);
        },
        init: function(j) {
            var k = this;
            return c.shallowExtend.apply(k, [ j ]);
        }
    };
    f.fn.wysihtml5 = function(j) {
        if (c[j]) {
            return c[j].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            if (typeof j === "object" || !j) {
                return c.init.apply(this, arguments);
            } else {
                f.error("Method " + j + " does not exist on jQuery.wysihtml5");
            }
        }
    };
    f.fn.wysihtml5.Constructor = g;
    var b = f.fn.wysihtml5.defaultOptions = {
        "font-styles": true,
        color: false,
        emphasis: true,
        lists: true,
        html: false,
        link: true,
        image: true,
        events: {},
        parserRules: {
            classes: {
                "wysiwyg-color-silver": 1,
                "wysiwyg-color-gray": 1,
                "wysiwyg-color-white": 1,
                "wysiwyg-color-maroon": 1,
                "wysiwyg-color-red": 1,
                "wysiwyg-color-purple": 1,
                "wysiwyg-color-fuchsia": 1,
                "wysiwyg-color-green": 1,
                "wysiwyg-color-lime": 1,
                "wysiwyg-color-olive": 1,
                "wysiwyg-color-yellow": 1,
                "wysiwyg-color-navy": 1,
                "wysiwyg-color-blue": 1,
                "wysiwyg-color-teal": 1,
                "wysiwyg-color-aqua": 1,
                "wysiwyg-color-orange": 1
            },
            tags: {
                b: {},
                i: {},
                br: {},
                ol: {},
                ul: {},
                li: {},
                h1: {},
                h2: {},
                h3: {},
                blockquote: {},
                u: 1,
                img: {
                    check_attributes: {
                        width: "numbers",
                        alt: "alt",
                        src: "url",
                        height: "numbers"
                    }
                },
                a: {
                    set_attributes: {
                        target: "_blank",
                        rel: "nofollow"
                    },
                    check_attributes: {
                        href: "url"
                    }
                },
                span: 1,
                div: 1
            }
        },
        stylesheets: [ "./lib/css/wysiwyg-color.css" ],
        locale: "en"
    };
    if (typeof f.fn.wysihtml5.defaultOptionsCache === "undefined") {
        f.fn.wysihtml5.defaultOptionsCache = f.extend(true, {}, f.fn.wysihtml5.defaultOptions);
    }
    var a = f.fn.wysihtml5.locale = {
        en: {
            font_styles: {
                normal: "Normal text",
                h1: "Heading 1",
                h2: "Heading 2",
                h3: "Heading 3"
            },
            emphasis: {
                bold: "Bold",
                italic: "Italic",
                underline: "Underline"
            },
            lists: {
                unordered: "Unordered list",
                ordered: "Ordered list",
                outdent: "Outdent",
                indent: "Indent"
            },
            link: {
                insert: "Insert link",
                cancel: "Cancel"
            },
            image: {
                insert: "Insert image",
                cancel: "Cancel"
            },
            html: {
                edit: "Edit HTML"
            },
            colours: {
                black: "Black",
                silver: "Silver",
                gray: "Grey",
                maroon: "Maroon",
                red: "Red",
                purple: "Purple",
                green: "Green",
                olive: "Olive",
                navy: "Navy",
                blue: "Blue",
                orange: "Orange"
            }
        }
    };
}(window.jQuery, window.wysihtml5);

/*! X-editable - v1.4.3 
* In-place editing with Twitter Bootstrap, jQuery UI or pure jQuery
* http://github.com/vitalets/x-editable
* Copyright (c) 2013 Vitaliy Potapov; Licensed MIT */
/*! X-editable - v1.4.3 
* In-place editing with Twitter Bootstrap, jQuery UI or pure jQuery
* http://github.com/vitalets/x-editable
* Copyright (c) 2013 Vitaliy Potapov; Licensed MIT */
(function(b) {
    var a = function(d, c) {
        this.options = b.extend({}, b.fn.editableform.defaults, c);
        this.$div = b(d);
        if (!this.options.scope) {
            this.options.scope = this;
        }
    };
    a.prototype = {
        constructor: a,
        initInput: function() {
            this.input = this.options.input;
            this.value = this.input.str2value(this.options.value);
        },
        initTemplate: function() {
            this.$form = b(b.fn.editableform.template);
        },
        initButtons: function() {
            this.$form.find(".editable-buttons").append(b.fn.editableform.buttons);
        },
        render: function() {
            this.$loading = b(b.fn.editableform.loading);
            this.$div.empty().append(this.$loading);
            this.initTemplate();
            if (this.options.showbuttons) {
                this.initButtons();
            } else {
                this.$form.find(".editable-buttons").remove();
            }
            this.showLoading();
            this.$div.triggerHandler("rendering");
            this.initInput();
            this.input.prerender();
            this.$form.find("div.editable-input").append(this.input.$tpl);
            this.$div.append(this.$form);
            b.when(this.input.render()).then(b.proxy(function() {
                if (!this.options.showbuttons) {
                    this.input.autosubmit();
                }
                this.$form.find(".editable-cancel").click(b.proxy(this.cancel, this));
                if (this.input.error) {
                    this.error(this.input.error);
                    this.$form.find(".editable-submit").attr("disabled", true);
                    this.input.$input.attr("disabled", true);
                    this.$form.submit(function(c) {
                        c.preventDefault();
                    });
                } else {
                    this.error(false);
                    this.input.$input.removeAttr("disabled");
                    this.$form.find(".editable-submit").removeAttr("disabled");
                    this.input.value2input(this.value);
                    this.$form.submit(b.proxy(this.submit, this));
                }
                this.$div.triggerHandler("rendered");
                this.showForm();
                if (this.input.postrender) {
                    this.input.postrender();
                }
            }, this));
        },
        cancel: function() {
            this.$div.triggerHandler("cancel");
        },
        showLoading: function() {
            var c, d;
            if (this.$form) {
                c = this.$form.outerWidth();
                d = this.$form.outerHeight();
                if (c) {
                    this.$loading.width(c);
                }
                if (d) {
                    this.$loading.height(d);
                }
                this.$form.hide();
            } else {
                c = this.$loading.parent().width();
                if (c) {
                    this.$loading.width(c);
                }
            }
            this.$loading.show();
        },
        showForm: function(c) {
            this.$loading.hide();
            this.$form.show();
            if (c !== false) {
                this.input.activate();
            }
            this.$div.triggerHandler("show");
        },
        error: function(g) {
            var e = this.$form.find(".control-group"), f = this.$form.find(".editable-error-block"), c;
            if (g === false) {
                e.removeClass(b.fn.editableform.errorGroupClass);
                f.removeClass(b.fn.editableform.errorBlockClass).empty().hide();
            } else {
                if (g) {
                    c = g.split("\n");
                    for (var d = 0; d < c.length; d++) {
                        c[d] = b("<div>").text(c[d]).html();
                    }
                    g = c.join("<br>");
                }
                e.addClass(b.fn.editableform.errorGroupClass);
                f.addClass(b.fn.editableform.errorBlockClass).html(g).show();
            }
        },
        submit: function(f) {
            f.stopPropagation();
            f.preventDefault();
            var c, d = this.input.input2value();
            if (c = this.validate(d)) {
                this.error(c);
                this.showForm();
                return;
            }
            if (!this.options.savenochange && this.input.value2str(d) == this.input.value2str(this.value)) {
                this.$div.triggerHandler("nochange");
                return;
            }
            b.when(this.save(d)).done(b.proxy(function(e) {
                var g = typeof this.options.success === "function" ? this.options.success.call(this.options.scope, e, d) : null;
                if (g === false) {
                    this.error(false);
                    this.showForm(false);
                    return;
                }
                if (typeof g === "string") {
                    this.error(g);
                    this.showForm();
                    return;
                }
                if (g && typeof g === "object" && g.hasOwnProperty("newValue")) {
                    d = g.newValue;
                }
                this.error(false);
                this.value = d;
                this.$div.triggerHandler("save", {
                    newValue: d,
                    response: e
                });
            }, this)).fail(b.proxy(function(e) {
                this.error(typeof e === "string" ? e : e.responseText || e.statusText || "Unknown error!");
                this.showForm();
            }, this));
        },
        save: function(f) {
            var d = this.input.value2submit(f);
            this.options.pk = b.fn.editableutils.tryParseJson(this.options.pk, true);
            var c = typeof this.options.pk === "function" ? this.options.pk.call(this.options.scope) : this.options.pk, e = !!(typeof this.options.url === "function" || this.options.url && (this.options.send === "always" || this.options.send === "auto" && c)), g;
            if (e) {
                this.showLoading();
                g = {
                    name: this.options.name || "",
                    value: d,
                    pk: c
                };
                if (typeof this.options.params === "function") {
                    g = this.options.params.call(this.options.scope, g);
                } else {
                    this.options.params = b.fn.editableutils.tryParseJson(this.options.params, true);
                    b.extend(g, this.options.params);
                }
                if (typeof this.options.url === "function") {
                    return this.options.url.call(this.options.scope, g);
                } else {
                    return b.ajax(b.extend({
                        url: this.options.url,
                        data: g,
                        type: "POST"
                    }, this.options.ajaxOptions));
                }
            }
        },
        validate: function(c) {
            if (c === undefined) {
                c = this.value;
            }
            if (typeof this.options.validate === "function") {
                return this.options.validate.call(this.options.scope, c);
            }
        },
        option: function(c, d) {
            if (c in this.options) {
                this.options[c] = d;
            }
            if (c === "value") {
                this.setValue(d);
            }
        },
        setValue: function(c, d) {
            if (d) {
                this.value = this.input.str2value(c);
            } else {
                this.value = c;
            }
            if (this.$form && this.$form.is(":visible")) {
                this.input.value2input(this.value);
            }
        }
    };
    b.fn.editableform = function(d) {
        var c = arguments;
        return this.each(function() {
            var g = b(this), f = g.data("editableform"), e = typeof d === "object" && d;
            if (!f) {
                g.data("editableform", f = new a(this, e));
            }
            if (typeof d === "string") {
                f[d].apply(f, Array.prototype.slice.call(c, 1));
            }
        });
    };
    b.fn.editableform.Constructor = a;
    b.fn.editableform.defaults = {
        type: "text",
        url: null,
        params: null,
        name: null,
        pk: null,
        value: null,
        send: "auto",
        validate: null,
        success: null,
        ajaxOptions: null,
        showbuttons: true,
        scope: null,
        savenochange: false
    };
    b.fn.editableform.template = '<form class="form-inline editableform"><div class="control-group"><div><div class="editable-input"></div><div class="editable-buttons"></div></div><div class="editable-error-block"></div></div></form>';
    b.fn.editableform.loading = '<div class="editableform-loading"></div>';
    b.fn.editableform.buttons = '<button type="submit" class="editable-submit">ok</button><button type="button" class="editable-cancel">cancel</button>';
    b.fn.editableform.errorGroupClass = null;
    b.fn.editableform.errorBlockClass = "editable-error";
})(window.jQuery);

(function(a) {
    a.fn.editableutils = {
        inherit: function(c, b) {
            var d = function() {};
            d.prototype = b.prototype;
            c.prototype = new d();
            c.prototype.constructor = c;
            c.superclass = b.prototype;
        },
        setCursorPosition: function(c, d) {
            if (c.setSelectionRange) {
                c.setSelectionRange(d, d);
            } else {
                if (c.createTextRange) {
                    var b = c.createTextRange();
                    b.collapse(true);
                    b.moveEnd("character", d);
                    b.moveStart("character", d);
                    b.select();
                }
            }
        },
        tryParseJson: function(b, c) {
            if (typeof b === "string" && b.length && b.match(/^[\{\[].*[\}\]]$/)) {
                if (c) {
                    try {
                        b = new Function("return " + b)();
                    } catch (d) {} finally {
                        return b;
                    }
                } else {
                    b = new Function("return " + b)();
                }
            }
            return b;
        },
        sliceObj: function(h, g, b) {
            var f, e, c = {};
            if (!a.isArray(g) || !g.length) {
                return c;
            }
            for (var d = 0; d < g.length; d++) {
                f = g[d];
                if (h.hasOwnProperty(f)) {
                    c[f] = h[f];
                }
                if (b === true) {
                    continue;
                }
                e = f.toLowerCase();
                if (h.hasOwnProperty(e)) {
                    c[f] = h[e];
                }
            }
            return c;
        },
        getConfigData: function(b) {
            var c = {};
            a.each(b.data(), function(e, d) {
                if (typeof d !== "object" || d && typeof d === "object" && (d.constructor === Object || d.constructor === Array)) {
                    c[e] = d;
                }
            });
            return c;
        },
        objectKeys: function(d) {
            if (Object.keys) {
                return Object.keys(d);
            } else {
                if (d !== Object(d)) {
                    throw new TypeError("Object.keys called on a non-object");
                }
                var b = [], c;
                for (c in d) {
                    if (Object.prototype.hasOwnProperty.call(d, c)) {
                        b.push(c);
                    }
                }
                return b;
            }
        },
        escape: function(b) {
            return a("<div>").text(b).html();
        },
        itemsByValue: function(g, f, d) {
            if (!f || g === null) {
                return [];
            }
            d = d || "value";
            var c = a.isArray(g), b = [], e = this;
            a.each(f, function(h, j) {
                if (j.children) {
                    b = b.concat(e.itemsByValue(g, j.children, d));
                } else {
                    if (c) {
                        if (a.grep(g, function(k) {
                            return k == (j && typeof j === "object" ? j[d] : j);
                        }).length) {
                            b.push(j);
                        }
                    } else {
                        if (g == (j && typeof j === "object" ? j[d] : j)) {
                            b.push(j);
                        }
                    }
                }
            });
            return b;
        },
        createInput: function(c) {
            var e, f, b, d = c.type;
            if (d === "date") {
                if (c.mode === "inline") {
                    if (a.fn.editabletypes.datefield) {
                        d = "datefield";
                    } else {
                        if (a.fn.editabletypes.dateuifield) {
                            d = "dateuifield";
                        }
                    }
                } else {
                    if (a.fn.editabletypes.date) {
                        d = "date";
                    } else {
                        if (a.fn.editabletypes.dateui) {
                            d = "dateui";
                        }
                    }
                }
                if (d === "date" && !a.fn.editabletypes.date) {
                    d = "combodate";
                }
            }
            if (d === "wysihtml5" && !a.fn.editabletypes[d]) {
                d = "textarea";
            }
            if (typeof a.fn.editabletypes[d] === "function") {
                e = a.fn.editabletypes[d];
                f = this.sliceObj(c, this.objectKeys(e.defaults));
                b = new e(f);
                return b;
            } else {
                a.error("Unknown type: " + d);
                return false;
            }
        }
    };
})(window.jQuery);

(function(c) {
    var b = function(e, d) {
        this.init(e, d);
    };
    var a = function(e, d) {
        this.init(e, d);
    };
    b.prototype = {
        containerName: null,
        innerCss: null,
        init: function(e, d) {
            this.$element = c(e);
            this.options = c.extend({}, c.fn.editableContainer.defaults, d);
            this.splitOptions();
            this.formOptions.scope = this.$element[0];
            this.initContainer();
            this.$element.on("destroyed", c.proxy(function() {
                this.destroy();
            }, this));
            if (!c(document).data("editable-handlers-attached")) {
                c(document).on("keyup.editable", function(f) {
                    if (f.which === 27) {
                        c(".editable-open").editableContainer("hide");
                    }
                });
                c(document).on("click.editable", function(j) {
                    var f = c(j.target), g, h = [ ".editable-container", ".ui-datepicker-header", ".modal-backdrop", ".bootstrap-wysihtml5-insert-image-modal", ".bootstrap-wysihtml5-insert-link-modal" ];
                    for (g = 0; g < h.length; g++) {
                        if (f.is(h[g]) || f.parents(h[g]).length) {
                            return;
                        }
                    }
                    b.prototype.closeOthers(j.target);
                });
                c(document).data("editable-handlers-attached", true);
            }
        },
        splitOptions: function() {
            this.containerOptions = {};
            this.formOptions = {};
            var e = c.fn[this.containerName].defaults;
            for (var d in this.options) {
                if (d in e) {
                    this.containerOptions[d] = this.options[d];
                } else {
                    this.formOptions[d] = this.options[d];
                }
            }
        },
        tip: function() {
            return this.container() ? this.container().$tip : null;
        },
        container: function() {
            return this.$element.data(this.containerDataName || this.containerName);
        },
        call: function() {
            this.$element[this.containerName].apply(this.$element, arguments);
        },
        initContainer: function() {
            this.call(this.containerOptions);
        },
        renderForm: function() {
            this.$form.editableform(this.formOptions).on({
                save: c.proxy(this.save, this),
                nochange: c.proxy(function() {
                    this.hide("nochange");
                }, this),
                cancel: c.proxy(function() {
                    this.hide("cancel");
                }, this),
                show: c.proxy(this.setPosition, this),
                rendering: c.proxy(this.setPosition, this),
                resize: c.proxy(this.setPosition, this),
                rendered: c.proxy(function() {
                    this.$element.triggerHandler("shown");
                }, this)
            }).editableform("render");
        },
        show: function(d) {
            this.$element.addClass("editable-open");
            if (d !== false) {
                this.closeOthers(this.$element[0]);
            }
            this.innerShow();
            this.tip().addClass("editable-container");
            if (this.$form) {}
            this.$form = c("<div>");
            if (this.tip().is(this.innerCss)) {
                this.tip().append(this.$form);
            } else {
                this.tip().find(this.innerCss).append(this.$form);
            }
            this.renderForm();
        },
        hide: function(d) {
            if (!this.tip() || !this.tip().is(":visible") || !this.$element.hasClass("editable-open")) {
                return;
            }
            this.$element.removeClass("editable-open");
            this.innerHide();
            this.$element.triggerHandler("hidden", d);
        },
        innerShow: function() {},
        innerHide: function() {},
        toggle: function(d) {
            if (this.container() && this.tip() && this.tip().is(":visible")) {
                this.hide();
            } else {
                this.show(d);
            }
        },
        setPosition: function() {},
        save: function(d, f) {
            this.$element.triggerHandler("save", f);
            this.hide("save");
        },
        option: function(d, e) {
            this.options[d] = e;
            if (d in this.containerOptions) {
                this.containerOptions[d] = e;
                this.setContainerOption(d, e);
            } else {
                this.formOptions[d] = e;
                if (this.$form) {
                    this.$form.editableform("option", d, e);
                }
            }
        },
        setContainerOption: function(d, e) {
            this.call("option", d, e);
        },
        destroy: function() {
            this.hide();
            this.innerDestroy();
            this.$element.off("destroyed");
            this.$element.removeData("editableContainer");
        },
        innerDestroy: function() {},
        closeOthers: function(d) {
            c(".editable-open").each(function(g, h) {
                if (h === d || c(h).find(d).length) {
                    return;
                }
                var f = c(h), e = f.data("editableContainer");
                if (!e) {
                    return;
                }
                if (e.options.onblur === "cancel") {
                    f.data("editableContainer").hide("onblur");
                } else {
                    if (e.options.onblur === "submit") {
                        f.data("editableContainer").tip().find("form").submit();
                    }
                }
            });
        },
        activate: function() {
            if (this.tip && this.tip().is(":visible") && this.$form) {
                this.$form.data("editableform").input.activate();
            }
        }
    };
    c.fn.editableContainer = function(e) {
        var d = arguments;
        return this.each(function() {
            var h = c(this), k = "editableContainer", g = h.data(k), f = typeof e === "object" && e, j = f.mode === "inline" ? a : b;
            if (!g) {
                h.data(k, g = new j(this, f));
            }
            if (typeof e === "string") {
                g[e].apply(g, Array.prototype.slice.call(d, 1));
            }
        });
    };
    c.fn.editableContainer.Popup = b;
    c.fn.editableContainer.Inline = a;
    c.fn.editableContainer.defaults = {
        value: null,
        placement: "top",
        autohide: true,
        onblur: "cancel",
        anim: false,
        mode: "popup"
    };
    jQuery.event.special.destroyed = {
        remove: function(d) {
            if (d.handler) {
                d.handler();
            }
        }
    };
})(window.jQuery);

(function(a) {
    a.extend(a.fn.editableContainer.Inline.prototype, a.fn.editableContainer.Popup.prototype, {
        containerName: "editableform",
        innerCss: ".editable-inline",
        initContainer: function() {
            this.$tip = a("<span></span>").addClass("editable-inline");
            if (!this.options.anim) {
                this.options.anim = 0;
            }
        },
        splitOptions: function() {
            this.containerOptions = {};
            this.formOptions = this.options;
        },
        tip: function() {
            return this.$tip;
        },
        innerShow: function() {
            this.$element.hide();
            this.tip().insertAfter(this.$element).show();
        },
        innerHide: function() {
            this.$tip.hide(this.options.anim, a.proxy(function() {
                this.$element.show();
                this.innerDestroy();
            }, this));
        },
        innerDestroy: function() {
            if (this.tip()) {
                this.tip().empty().remove();
            }
        }
    });
})(window.jQuery);

(function(b) {
    var a = function(d, c) {
        this.$element = b(d);
        this.options = b.extend({}, b.fn.editable.defaults, c, b.fn.editableutils.getConfigData(this.$element));
        if (this.options.selector) {
            this.initLive();
        } else {
            this.init();
        }
    };
    a.prototype = {
        constructor: a,
        init: function() {
            var c = false, d, e;
            this.options.name = this.options.name || this.$element.attr("id");
            this.options.scope = this.$element[0];
            this.input = b.fn.editableutils.createInput(this.options);
            if (!this.input) {
                return;
            }
            if (this.options.value === undefined || this.options.value === null) {
                this.value = this.input.html2value(b.trim(this.$element.html()));
                c = true;
            } else {
                this.options.value = b.fn.editableutils.tryParseJson(this.options.value, true);
                if (typeof this.options.value === "string") {
                    this.value = this.input.str2value(this.options.value);
                } else {
                    this.value = this.options.value;
                }
            }
            this.$element.addClass("editable");
            if (this.options.toggle !== "manual") {
                this.$element.addClass("editable-click");
                this.$element.on(this.options.toggle + ".editable", b.proxy(function(g) {
                    g.preventDefault();
                    if (this.options.toggle === "mouseenter") {
                        this.show();
                    } else {
                        var f = this.options.toggle !== "click";
                        this.toggle(f);
                    }
                }, this));
            } else {
                this.$element.attr("tabindex", -1);
            }
            switch (this.options.autotext) {
              case "always":
                d = true;
                break;

              case "auto":
                d = !b.trim(this.$element.text()).length && this.value !== null && this.value !== undefined && !c;
                break;

              default:
                d = false;
            }
            b.when(d ? this.render() : true).then(b.proxy(function() {
                if (this.options.disabled) {
                    this.disable();
                } else {
                    this.enable();
                }
                this.$element.triggerHandler("init", this);
            }, this));
        },
        initLive: function() {
            var c = this.options.selector;
            this.options.selector = false;
            this.options.autotext = "never";
            this.$element.on(this.options.toggle + ".editable", c, b.proxy(function(f) {
                var d = b(f.target);
                if (!d.data("editable")) {
                    if (d.hasClass(this.options.emptyclass)) {
                        d.empty();
                    }
                    d.editable(this.options).trigger(f);
                }
            }, this));
        },
        render: function(c) {
            if (this.options.display === false) {
                return;
            }
            if (this.input.value2htmlFinal) {
                return this.input.value2html(this.value, this.$element[0], this.options.display, c);
            } else {
                if (typeof this.options.display === "function") {
                    return this.options.display.call(this.$element[0], this.value, c);
                } else {
                    return this.input.value2html(this.value, this.$element[0]);
                }
            }
        },
        enable: function() {
            this.options.disabled = false;
            this.$element.removeClass("editable-disabled");
            this.handleEmpty(this.isEmpty);
            if (this.options.toggle !== "manual") {
                if (this.$element.attr("tabindex") === "-1") {
                    this.$element.removeAttr("tabindex");
                }
            }
        },
        disable: function() {
            this.options.disabled = true;
            this.hide();
            this.$element.addClass("editable-disabled");
            this.handleEmpty(this.isEmpty);
            this.$element.attr("tabindex", -1);
        },
        toggleDisabled: function() {
            if (this.options.disabled) {
                this.enable();
            } else {
                this.disable();
            }
        },
        option: function(c, d) {
            if (c && typeof c === "object") {
                b.each(c, b.proxy(function(f, e) {
                    this.option(b.trim(f), e);
                }, this));
                return;
            }
            this.options[c] = d;
            if (c === "disabled") {
                return d ? this.disable() : this.enable();
            }
            if (c === "value") {
                this.setValue(d);
            }
            if (this.container) {
                this.container.option(c, d);
            }
            if (this.input.option) {
                this.input.option(c, d);
            }
        },
        handleEmpty: function(c) {
            if (this.options.display === false) {
                return;
            }
            this.isEmpty = c !== undefined ? c : b.trim(this.$element.text()) === "";
            if (!this.options.disabled) {
                if (this.isEmpty) {
                    this.$element.text(this.options.emptytext);
                    if (this.options.emptyclass) {
                        this.$element.addClass(this.options.emptyclass);
                    }
                } else {
                    if (this.options.emptyclass) {
                        this.$element.removeClass(this.options.emptyclass);
                    }
                }
            } else {
                if (this.isEmpty) {
                    this.$element.empty();
                    if (this.options.emptyclass) {
                        this.$element.removeClass(this.options.emptyclass);
                    }
                }
            }
        },
        show: function(c) {
            if (this.options.disabled) {
                return;
            }
            if (!this.container) {
                var d = b.extend({}, this.options, {
                    value: this.value,
                    input: this.input
                });
                this.$element.editableContainer(d);
                this.$element.on("save.internal", b.proxy(this.save, this));
                this.container = this.$element.data("editableContainer");
            } else {
                if (this.container.tip().is(":visible")) {
                    return;
                }
            }
            this.container.show(c);
        },
        hide: function() {
            if (this.container) {
                this.container.hide();
            }
        },
        toggle: function(c) {
            if (this.container && this.container.tip().is(":visible")) {
                this.hide();
            } else {
                this.show(c);
            }
        },
        save: function(d, f) {
            if (this.options.unsavedclass) {
                var c = false;
                c = c || typeof this.options.url === "function";
                c = c || this.options.display === false;
                c = c || f.response !== undefined;
                c = c || this.options.savenochange && this.input.value2str(this.value) !== this.input.value2str(f.newValue);
                if (c) {
                    this.$element.removeClass(this.options.unsavedclass);
                } else {
                    this.$element.addClass(this.options.unsavedclass);
                }
            }
            this.setValue(f.newValue, false, f.response);
        },
        validate: function() {
            if (typeof this.options.validate === "function") {
                return this.options.validate.call(this, this.value);
            }
        },
        setValue: function(d, e, c) {
            if (e) {
                this.value = this.input.str2value(d);
            } else {
                this.value = d;
            }
            if (this.container) {
                this.container.option("value", this.value);
            }
            b.when(this.render(c)).then(b.proxy(function() {
                this.handleEmpty();
            }, this));
        },
        activate: function() {
            if (this.container) {
                this.container.activate();
            }
        },
        destroy: function() {
            if (this.container) {
                this.container.destroy();
            }
            if (this.options.toggle !== "manual") {
                this.$element.removeClass("editable-click");
                this.$element.off(this.options.toggle + ".editable");
            }
            this.$element.off("save.internal");
            this.$element.removeClass("editable");
            this.$element.removeClass("editable-open");
            this.$element.removeData("editable");
        }
    };
    b.fn.editable = function(h) {
        var c = {}, g = arguments, e = "editable";
        switch (h) {
          case "validate":
            this.each(function() {
                var n = b(this), m = n.data(e), l;
                if (m && (l = m.validate())) {
                    c[m.options.name] = l;
                }
            });
            return c;

          case "getValue":
            this.each(function() {
                var m = b(this), l = m.data(e);
                if (l && l.value !== undefined && l.value !== null) {
                    c[l.options.name] = l.input.value2submit(l.value);
                }
            });
            return c;

          case "submit":
            var f = arguments[1] || {}, k = this, j = this.editable("validate"), d;
            if (b.isEmptyObject(j)) {
                d = this.editable("getValue");
                if (f.data) {
                    b.extend(d, f.data);
                }
                b.ajax(b.extend({
                    url: f.url,
                    data: d,
                    type: "POST"
                }, f.ajaxOptions)).success(function(l) {
                    if (typeof f.success === "function") {
                        f.success.call(k, l, f);
                    }
                }).error(function() {
                    if (typeof f.error === "function") {
                        f.error.apply(k, arguments);
                    }
                });
            } else {
                if (typeof f.error === "function") {
                    f.error.call(k, j);
                }
            }
            return this;
        }
        return this.each(function() {
            var n = b(this), m = n.data(e), l = typeof h === "object" && h;
            if (!m) {
                n.data(e, m = new a(this, l));
            }
            if (typeof h === "string") {
                m[h].apply(m, Array.prototype.slice.call(g, 1));
            }
        });
    };
    b.fn.editable.defaults = {
        type: "text",
        disabled: false,
        toggle: "click",
        emptytext: "Empty",
        autotext: "auto",
        value: null,
        display: null,
        emptyclass: "editable-empty",
        unsavedclass: "editable-unsaved",
        selector: null
    };
})(window.jQuery);

(function(b) {
    b.fn.editabletypes = {};
    var a = function() {};
    a.prototype = {
        init: function(d, c, e) {
            this.type = d;
            this.options = b.extend({}, e, c);
        },
        prerender: function() {
            this.$tpl = b(this.options.tpl);
            this.$input = this.$tpl;
            this.$clear = null;
            this.error = null;
        },
        render: function() {},
        value2html: function(d, c) {
            b(c).text(d);
        },
        html2value: function(c) {
            return b("<div>").html(c).text();
        },
        value2str: function(c) {
            return c;
        },
        str2value: function(c) {
            return c;
        },
        value2submit: function(c) {
            return c;
        },
        value2input: function(c) {
            this.$input.val(c);
        },
        input2value: function() {
            return this.$input.val();
        },
        activate: function() {
            if (this.$input.is(":visible")) {
                this.$input.focus();
            }
        },
        clear: function() {
            this.$input.val(null);
        },
        escape: function(c) {
            return b("<div>").text(c).html();
        },
        autosubmit: function() {},
        setClass: function() {
            if (this.options.inputclass) {
                this.$input.addClass(this.options.inputclass);
            }
        },
        setAttr: function(c) {
            if (this.options[c] !== undefined && this.options[c] !== null) {
                this.$input.attr(c, this.options[c]);
            }
        },
        option: function(c, d) {
            this.options[c] = d;
        }
    };
    a.defaults = {
        tpl: "",
        inputclass: "input-medium",
        scope: null
    };
    b.extend(b.fn.editabletypes, {
        abstractinput: a
    });
})(window.jQuery);

(function(b) {
    var a = function(c) {};
    b.fn.editableutils.inherit(a, b.fn.editabletypes.abstractinput);
    b.extend(a.prototype, {
        render: function() {
            var c = b.Deferred();
            this.error = null;
            this.onSourceReady(function() {
                this.renderList();
                c.resolve();
            }, function() {
                this.error = this.options.sourceError;
                c.resolve();
            });
            return c.promise();
        },
        html2value: function(c) {
            return null;
        },
        value2html: function(f, e, g, d) {
            var c = b.Deferred(), h = function() {
                if (typeof g === "function") {
                    g.call(e, f, this.sourceData, d);
                } else {
                    this.value2htmlFinal(f, e);
                }
                c.resolve();
            };
            if (f === null) {
                h.call(this);
            } else {
                this.onSourceReady(h, function() {
                    c.resolve();
                });
            }
            return c.promise();
        },
        onSourceReady: function(j, d) {
            if (b.isArray(this.sourceData)) {
                j.call(this);
                return;
            }
            try {
                this.options.source = b.fn.editableutils.tryParseJson(this.options.source, false);
            } catch (h) {
                d.call(this);
                return;
            }
            var f = this.options.source;
            if (b.isFunction(f)) {
                f = f.call(this.options.scope);
            }
            if (typeof f === "string") {
                if (this.options.sourceCache) {
                    var g = f, c;
                    if (!b(document).data(g)) {
                        b(document).data(g, {});
                    }
                    c = b(document).data(g);
                    if (c.loading === false && c.sourceData) {
                        this.sourceData = c.sourceData;
                        this.doPrepend();
                        j.call(this);
                        return;
                    } else {
                        if (c.loading === true) {
                            c.callbacks.push(b.proxy(function() {
                                this.sourceData = c.sourceData;
                                this.doPrepend();
                                j.call(this);
                            }, this));
                            c.err_callbacks.push(b.proxy(d, this));
                            return;
                        } else {
                            c.loading = true;
                            c.callbacks = [];
                            c.err_callbacks = [];
                        }
                    }
                }
                b.ajax({
                    url: f,
                    type: "get",
                    cache: false,
                    dataType: "json",
                    success: b.proxy(function(e) {
                        if (c) {
                            c.loading = false;
                        }
                        this.sourceData = this.makeArray(e);
                        if (b.isArray(this.sourceData)) {
                            if (c) {
                                c.sourceData = this.sourceData;
                                b.each(c.callbacks, function() {
                                    this.call();
                                });
                            }
                            this.doPrepend();
                            j.call(this);
                        } else {
                            d.call(this);
                            if (c) {
                                b.each(c.err_callbacks, function() {
                                    this.call();
                                });
                            }
                        }
                    }, this),
                    error: b.proxy(function() {
                        d.call(this);
                        if (c) {
                            c.loading = false;
                            b.each(c.err_callbacks, function() {
                                this.call();
                            });
                        }
                    }, this)
                });
            } else {
                this.sourceData = this.makeArray(f);
                if (b.isArray(this.sourceData)) {
                    this.doPrepend();
                    j.call(this);
                } else {
                    d.call(this);
                }
            }
        },
        doPrepend: function() {
            if (this.options.prepend === null || this.options.prepend === undefined) {
                return;
            }
            if (!b.isArray(this.prependData)) {
                if (b.isFunction(this.options.prepend)) {
                    this.options.prepend = this.options.prepend.call(this.options.scope);
                }
                this.options.prepend = b.fn.editableutils.tryParseJson(this.options.prepend, true);
                if (typeof this.options.prepend === "string") {
                    this.options.prepend = {
                        "": this.options.prepend
                    };
                }
                this.prependData = this.makeArray(this.options.prepend);
            }
            if (b.isArray(this.prependData) && b.isArray(this.sourceData)) {
                this.sourceData = this.prependData.concat(this.sourceData);
            }
        },
        renderList: function() {},
        value2htmlFinal: function(d, c) {},
        makeArray: function(h) {
            var g, j, c = [], f, d;
            if (!h || typeof h === "string") {
                return null;
            }
            if (b.isArray(h)) {
                d = function(m, l) {
                    j = {
                        value: m,
                        text: l
                    };
                    if (g++ >= 2) {
                        return false;
                    }
                };
                for (var e = 0; e < h.length; e++) {
                    f = h[e];
                    if (typeof f === "object") {
                        g = 0;
                        b.each(f, d);
                        if (g === 1) {
                            c.push(j);
                        } else {
                            if (g > 1) {
                                if (f.children) {
                                    f.children = this.makeArray(f.children);
                                }
                                c.push(f);
                            }
                        }
                    } else {
                        c.push({
                            value: f,
                            text: f
                        });
                    }
                }
            } else {
                b.each(h, function(m, l) {
                    c.push({
                        value: m,
                        text: l
                    });
                });
            }
            return c;
        },
        option: function(c, d) {
            this.options[c] = d;
            if (c === "source") {
                this.sourceData = null;
            }
            if (c === "prepend") {
                this.prependData = null;
            }
        }
    });
    a.defaults = b.extend({}, b.fn.editabletypes.abstractinput.defaults, {
        source: null,
        prepend: false,
        sourceError: "Error when loading list",
        sourceCache: true
    });
    b.fn.editabletypes.list = a;
})(window.jQuery);

(function(b) {
    var a = function(c) {
        this.init("text", c, a.defaults);
    };
    b.fn.editableutils.inherit(a, b.fn.editabletypes.abstractinput);
    b.extend(a.prototype, {
        render: function() {
            this.renderClear();
            this.setClass();
            this.setAttr("placeholder");
        },
        activate: function() {
            if (this.$input.is(":visible")) {
                this.$input.focus();
                b.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                if (this.toggleClear) {
                    this.toggleClear();
                }
            }
        },
        renderClear: function() {
            if (this.options.clear) {
                this.$clear = b('<span class="editable-clear-x"></span>');
                this.$input.after(this.$clear).css("padding-right", 24).keyup(b.proxy(function(d) {
                    if (~b.inArray(d.keyCode, [ 40, 38, 9, 13, 27 ])) {
                        return;
                    }
                    clearTimeout(this.t);
                    var c = this;
                    this.t = setTimeout(function() {
                        c.toggleClear(d);
                    }, 100);
                }, this)).parent().css("position", "relative");
                this.$clear.click(b.proxy(this.clear, this));
            }
        },
        postrender: function() {
            if (this.$clear) {
                var c = this.$input.outerHeight() || 20, d = (c - this.$clear.height()) / 2;
                if (d < 3) {
                    d = 3;
                }
                this.$clear.css({
                    bottom: d,
                    right: d
                });
            }
        },
        toggleClear: function(d) {
            if (!this.$clear) {
                return;
            }
            var c = this.$input.val().length, f = this.$clear.is(":visible");
            if (c && !f) {
                this.$clear.show();
            }
            if (!c && f) {
                this.$clear.hide();
            }
        },
        clear: function() {
            this.$clear.hide();
            this.$input.val("").focus();
        }
    });
    a.defaults = b.extend({}, b.fn.editabletypes.abstractinput.defaults, {
        tpl: '<input type="text">',
        placeholder: null,
        clear: true
    });
    b.fn.editabletypes.text = a;
})(window.jQuery);

(function(b) {
    var a = function(c) {
        this.init("textarea", c, a.defaults);
    };
    b.fn.editableutils.inherit(a, b.fn.editabletypes.abstractinput);
    b.extend(a.prototype, {
        render: function() {
            this.setClass();
            this.setAttr("placeholder");
            this.setAttr("rows");
            this.$input.keydown(function(c) {
                if (c.ctrlKey && c.which === 13) {
                    b(this).closest("form").submit();
                }
            });
        },
        value2html: function(g, f) {
            var e = "", c;
            if (g) {
                c = g.split("\n");
                for (var d = 0; d < c.length; d++) {
                    c[d] = b("<div>").text(c[d]).html();
                }
                e = c.join("<br>");
            }
            b(f).html(e);
        },
        html2value: function(e) {
            if (!e) {
                return "";
            }
            var f = new RegExp(String.fromCharCode(10), "g");
            var c = e.split(/<br\s*\/?>/i);
            for (var d = 0; d < c.length; d++) {
                var g = b("<div>").html(c[d]).text();
                g = g.replace(f, "");
                c[d] = g;
            }
            return c.join("\n");
        },
        activate: function() {
            b.fn.editabletypes.text.prototype.activate.call(this);
        }
    });
    a.defaults = b.extend({}, b.fn.editabletypes.abstractinput.defaults, {
        tpl: "<textarea></textarea>",
        inputclass: "input-large",
        placeholder: null,
        rows: 7
    });
    b.fn.editabletypes.textarea = a;
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("select", c, b.defaults);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.list);
    a.extend(b.prototype, {
        renderList: function() {
            this.$input.empty();
            var c = function(e, f) {
                if (a.isArray(f)) {
                    for (var d = 0; d < f.length; d++) {
                        if (f[d].children) {
                            e.append(c(a("<optgroup>", {
                                label: f[d].text
                            }), f[d].children));
                        } else {
                            e.append(a("<option>", {
                                value: f[d].value
                            }).text(f[d].text));
                        }
                    }
                }
                return e;
            };
            c(this.$input, this.sourceData);
            this.setClass();
            this.$input.on("keydown.editable", function(d) {
                if (d.which === 13) {
                    a(this).closest("form").submit();
                }
            });
        },
        value2htmlFinal: function(e, d) {
            var f = "", c = a.fn.editableutils.itemsByValue(e, this.sourceData);
            if (c.length) {
                f = c[0].text;
            }
            a(d).text(f);
        },
        autosubmit: function() {
            this.$input.off("keydown.editable").on("change.editable", function() {
                a(this).closest("form").submit();
            });
        }
    });
    b.defaults = a.extend({}, a.fn.editabletypes.list.defaults, {
        tpl: "<select></select>"
    });
    a.fn.editabletypes.select = b;
})(window.jQuery);

(function(b) {
    var a = function(c) {
        this.init("checklist", c, a.defaults);
    };
    b.fn.editableutils.inherit(a, b.fn.editabletypes.list);
    b.extend(a.prototype, {
        renderList: function() {
            var c, d;
            this.$tpl.empty();
            if (!b.isArray(this.sourceData)) {
                return;
            }
            for (var e = 0; e < this.sourceData.length; e++) {
                c = b("<label>").append(b("<input>", {
                    type: "checkbox",
                    value: this.sourceData[e].value
                })).append(b("<span>").text(" " + this.sourceData[e].text));
                b("<div>").append(c).appendTo(this.$tpl);
            }
            this.$input = this.$tpl.find('input[type="checkbox"]');
            this.setClass();
        },
        value2str: function(c) {
            return b.isArray(c) ? c.sort().join(b.trim(this.options.separator)) : "";
        },
        str2value: function(e) {
            var c, d = null;
            if (typeof e === "string" && e.length) {
                c = new RegExp("\\s*" + b.trim(this.options.separator) + "\\s*");
                d = e.split(c);
            } else {
                if (b.isArray(e)) {
                    d = e;
                }
            }
            return d;
        },
        value2input: function(c) {
            this.$input.prop("checked", false);
            if (b.isArray(c) && c.length) {
                this.$input.each(function(e, f) {
                    var d = b(f);
                    b.each(c, function(g, h) {
                        if (d.val() == h) {
                            d.prop("checked", true);
                        }
                    });
                });
            }
        },
        input2value: function() {
            var c = [];
            this.$input.filter(":checked").each(function(d, e) {
                c.push(b(e).val());
            });
            return c;
        },
        value2htmlFinal: function(f, d) {
            var c = [], e = b.fn.editableutils.itemsByValue(f, this.sourceData);
            if (e.length) {
                b.each(e, function(h, g) {
                    c.push(b.fn.editableutils.escape(g.text));
                });
                b(d).html(c.join("<br>"));
            } else {
                b(d).empty();
            }
        },
        activate: function() {
            this.$input.first().focus();
        },
        autosubmit: function() {
            this.$input.on("keydown", function(c) {
                if (c.which === 13) {
                    b(this).closest("form").submit();
                }
            });
        }
    });
    a.defaults = b.extend({}, b.fn.editabletypes.list.defaults, {
        tpl: '<div class="editable-checklist"></div>',
        inputclass: null,
        separator: ","
    });
    b.fn.editabletypes.checklist = a;
})(window.jQuery);

(function(b) {
    var a = function(c) {
        this.init("password", c, a.defaults);
    };
    b.fn.editableutils.inherit(a, b.fn.editabletypes.text);
    b.extend(a.prototype, {
        value2html: function(d, c) {
            if (d) {
                b(c).text("[hidden]");
            } else {
                b(c).empty();
            }
        },
        html2value: function(c) {
            return null;
        }
    });
    a.defaults = b.extend({}, b.fn.editabletypes.text.defaults, {
        tpl: '<input type="password">'
    });
    b.fn.editabletypes.password = a;
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("email", c, b.defaults);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.text);
    b.defaults = a.extend({}, a.fn.editabletypes.text.defaults, {
        tpl: '<input type="email">'
    });
    a.fn.editabletypes.email = b;
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("url", c, b.defaults);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.text);
    b.defaults = a.extend({}, a.fn.editabletypes.text.defaults, {
        tpl: '<input type="url">'
    });
    a.fn.editabletypes.url = b;
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("tel", c, b.defaults);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.text);
    b.defaults = a.extend({}, a.fn.editabletypes.text.defaults, {
        tpl: '<input type="tel">'
    });
    a.fn.editabletypes.tel = b;
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("number", c, b.defaults);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.text);
    a.extend(b.prototype, {
        render: function() {
            b.superclass.render.call(this);
            this.setAttr("min");
            this.setAttr("max");
            this.setAttr("step");
        }
    });
    b.defaults = a.extend({}, a.fn.editabletypes.text.defaults, {
        tpl: '<input type="number">',
        inputclass: "input-mini",
        min: null,
        max: null,
        step: null
    });
    a.fn.editabletypes.number = b;
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("range", c, b.defaults);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.number);
    a.extend(b.prototype, {
        render: function() {
            this.$input = this.$tpl.filter("input");
            this.setClass();
            this.setAttr("min");
            this.setAttr("max");
            this.setAttr("step");
            this.$input.on("input", function() {
                a(this).siblings("output").text(a(this).val());
            });
        },
        activate: function() {
            this.$input.focus();
        }
    });
    b.defaults = a.extend({}, a.fn.editabletypes.number.defaults, {
        tpl: '<input type="range"><output style="width: 30px; display: inline-block"></output>',
        inputclass: "input-medium"
    });
    a.fn.editabletypes.range = b;
})(window.jQuery);

(function(a) {
    var b = function(d) {
        this.init("select2", d, b.defaults);
        d.select2 = d.select2 || {};
        var e = this, c = {
            placeholder: d.placeholder
        };
        this.isMultiple = d.select2.tags || d.select2.multiple;
        if (!d.select2.tags) {
            if (d.source) {
                c.data = d.source;
            }
            c.initSelection = function(f, j) {
                var h = e.str2value(f.val()), g = a.fn.editableutils.itemsByValue(h, c.data, "id");
                if (a.isArray(g) && g.length && !e.isMultiple) {
                    g = g[0];
                }
                j(g);
            };
        }
        this.options.select2 = a.extend({}, b.defaults.select2, c, d.select2);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.abstractinput);
    a.extend(b.prototype, {
        render: function() {
            this.setClass();
            this.$input.select2(this.options.select2);
            if ("ajax" in this.options.select2) {}
            if (this.isMultiple) {
                this.$input.on("change", function() {
                    a(this).closest("form").parent().triggerHandler("resize");
                });
            }
        },
        value2html: function(e, c) {
            var f = "", d;
            if (this.$input) {
                d = this.$input.select2("data");
            } else {
                if (this.options.select2.tags) {
                    d = e;
                } else {
                    if (this.options.select2.data) {
                        d = a.fn.editableutils.itemsByValue(e, this.options.select2.data, "id");
                    } else {}
                }
            }
            if (a.isArray(d)) {
                f = [];
                a.each(d, function(h, g) {
                    f.push(g && typeof g === "object" ? g.text : g);
                });
            } else {
                if (d) {
                    f = d.text;
                }
            }
            f = a.isArray(f) ? f.join(this.options.viewseparator) : f;
            a(c).text(f);
        },
        html2value: function(c) {
            return this.options.select2.tags ? this.str2value(c, this.options.viewseparator) : null;
        },
        value2input: function(c) {
            this.$input.val(c).trigger("change", true);
        },
        input2value: function() {
            return this.$input.select2("val");
        },
        str2value: function(g, e) {
            if (typeof g !== "string" || !this.isMultiple) {
                return g;
            }
            e = e || this.options.select2.separator || a.fn.select2.defaults.separator;
            var f, d, c;
            if (g === null || g.length < 1) {
                return null;
            }
            f = g.split(e);
            for (d = 0, c = f.length; d < c; d = d + 1) {
                f[d] = a.trim(f[d]);
            }
            return f;
        },
        autosubmit: function() {
            this.$input.on("change", function(d, c) {
                if (!c) {
                    a(this).closest("form").submit();
                }
            });
        }
    });
    b.defaults = a.extend({}, a.fn.editabletypes.abstractinput.defaults, {
        tpl: '<input type="hidden">',
        select2: null,
        placeholder: null,
        source: null,
        viewseparator: ", "
    });
    a.fn.editabletypes.select2 = b;
})(window.jQuery);

(function(b) {
    var a = function(d, c) {
        this.$element = b(d);
        if (!this.$element.is("input")) {
            b.error("Combodate should be applied to INPUT element");
            return;
        }
        this.options = b.extend({}, b.fn.combodate.defaults, c, this.$element.data());
        this.init();
    };
    a.prototype = {
        constructor: a,
        init: function() {
            this.map = {
                day: [ "D", "date" ],
                month: [ "M", "month" ],
                year: [ "Y", "year" ],
                hour: [ "[Hh]", "hours" ],
                minute: [ "m", "minutes" ],
                second: [ "s", "seconds" ],
                ampm: [ "[Aa]", "" ]
            };
            this.$widget = b('<span class="combodate"></span>').html(this.getTemplate());
            this.initCombos();
            this.$widget.on("change", "select", b.proxy(function() {
                this.$element.val(this.getValue());
            }, this));
            this.$widget.find("select").css("width", "auto");
            this.$element.hide().after(this.$widget);
            this.setValue(this.$element.val() || this.options.value);
        },
        getTemplate: function() {
            var c = this.options.template;
            b.each(this.map, function(e, d) {
                d = d[0];
                var g = new RegExp(d + "+"), f = d.length > 1 ? d.substring(1, 2) : d;
                c = c.replace(g, "{" + f + "}");
            });
            c = c.replace(/ /g, "&nbsp;");
            b.each(this.map, function(e, d) {
                d = d[0];
                var f = d.length > 1 ? d.substring(1, 2) : d;
                c = c.replace("{" + f + "}", '<select class="' + e + '"></select>');
            });
            return c;
        },
        initCombos: function() {
            var c = this;
            b.each(this.map, function(g, e) {
                var h = c.$widget.find("." + g), j, d;
                if (h.length) {
                    c["$" + g] = h;
                    j = "fill" + g.charAt(0).toUpperCase() + g.slice(1);
                    d = c[j]();
                    c["$" + g].html(c.renderItems(d));
                }
            });
        },
        initItems: function(d) {
            var c = [], e;
            if (this.options.firstItem === "name") {
                e = moment.relativeTime || moment.langData()._relativeTime;
                var f = typeof e[d] === "function" ? e[d](1, true, d, false) : e[d];
                f = f.split(" ").reverse()[0];
                c.push([ "", f ]);
            } else {
                if (this.options.firstItem === "empty") {
                    c.push([ "", "" ]);
                }
            }
            return c;
        },
        renderItems: function(c) {
            var e = [];
            for (var d = 0; d < c.length; d++) {
                e.push('<option value="' + c[d][0] + '">' + c[d][1] + "</option>");
            }
            return e.join("\n");
        },
        fillDay: function() {
            var d = this.initItems("d"), e, f, c = this.options.template.indexOf("DD") !== -1;
            for (f = 1; f <= 31; f++) {
                e = c ? this.leadZero(f) : f;
                d.push([ f, e ]);
            }
            return d;
        },
        fillMonth: function() {
            var d = this.initItems("M"), e, f, h = this.options.template.indexOf("MMMM") !== -1, g = this.options.template.indexOf("MMM") !== -1, c = this.options.template.indexOf("MM") !== -1;
            for (f = 0; f <= 11; f++) {
                if (h) {
                    e = moment().month(f).format("MMMM");
                } else {
                    if (g) {
                        e = moment().month(f).format("MMM");
                    } else {
                        if (c) {
                            e = this.leadZero(f + 1);
                        } else {
                            e = f + 1;
                        }
                    }
                }
                d.push([ f, e ]);
            }
            return d;
        },
        fillYear: function() {
            var c = this.initItems("y"), d, e, f = this.options.template.indexOf("YYYY") !== -1;
            for (e = this.options.maxYear; e >= this.options.minYear; e--) {
                d = f ? e : (e + "").substring(2);
                c.push([ e, d ]);
            }
            return c;
        },
        fillHour: function() {
            var e = this.initItems("h"), f, g, j = this.options.template.indexOf("h") !== -1, h = this.options.template.indexOf("H") !== -1, d = this.options.template.toLowerCase().indexOf("hh") !== -1, c = j ? 12 : 23;
            for (g = 0; g <= c; g++) {
                f = d ? this.leadZero(g) : g;
                e.push([ g, f ]);
            }
            return e;
        },
        fillMinute: function() {
            var d = this.initItems("m"), e, f, c = this.options.template.indexOf("mm") !== -1;
            for (f = 0; f <= 59; f += this.options.minuteStep) {
                e = c ? this.leadZero(f) : f;
                d.push([ f, e ]);
            }
            return d;
        },
        fillSecond: function() {
            var d = this.initItems("s"), e, f, c = this.options.template.indexOf("ss") !== -1;
            for (f = 0; f <= 59; f += this.options.secondStep) {
                e = c ? this.leadZero(f) : f;
                d.push([ f, e ]);
            }
            return d;
        },
        fillAmpm: function() {
            var d = this.options.template.indexOf("a") !== -1, e = this.options.template.indexOf("A") !== -1, c = [ [ "am", d ? "am" : "AM" ], [ "pm", d ? "pm" : "PM" ] ];
            return c;
        },
        getValue: function(f) {
            var e, c = {}, d = this, g = false;
            b.each(this.map, function(j, h) {
                if (j === "ampm") {
                    return;
                }
                var l = j === "day" ? 1 : 0;
                c[j] = d["$" + j] ? parseInt(d["$" + j].val(), 10) : l;
                if (isNaN(c[j])) {
                    g = true;
                    return false;
                }
            });
            if (g) {
                return "";
            }
            if (this.$ampm) {
                c.hour = this.$ampm.val() === "am" ? c.hour : c.hour + 12;
                if (c.hour === 24) {
                    c.hour = 0;
                }
            }
            e = moment([ c.year, c.month, c.day, c.hour, c.minute, c.second ]);
            this.highlight(e);
            f = f === undefined ? this.options.format : f;
            if (f === null) {
                return e.isValid() ? e : null;
            } else {
                return e.isValid() ? e.format(f) : "";
            }
        },
        setValue: function(f) {
            if (!f) {
                return;
            }
            var e = typeof f === "string" ? moment(f, this.options.format) : moment(f), d = this, c = {};
            if (e.isValid()) {
                b.each(this.map, function(h, g) {
                    if (h === "ampm") {
                        return;
                    }
                    c[h] = e[g[1]]();
                });
                if (this.$ampm) {
                    if (c.hour > 12) {
                        c.hour -= 12;
                        c.ampm = "pm";
                    } else {
                        c.ampm = "am";
                    }
                }
                b.each(c, function(h, g) {
                    if (d["$" + h]) {
                        d["$" + h].val(g);
                    }
                });
                this.$element.val(e.format(this.options.format));
            }
        },
        highlight: function(c) {
            if (!c.isValid()) {
                if (this.options.errorClass) {
                    this.$widget.addClass(this.options.errorClass);
                } else {
                    if (!this.borderColor) {
                        this.borderColor = this.$widget.find("select").css("border-color");
                    }
                    this.$widget.find("select").css("border-color", "red");
                }
            } else {
                if (this.options.errorClass) {
                    this.$widget.removeClass(this.options.errorClass);
                } else {
                    this.$widget.find("select").css("border-color", this.borderColor);
                }
            }
        },
        leadZero: function(c) {
            return c <= 9 ? "0" + c : c;
        },
        destroy: function() {
            this.$widget.remove();
            this.$element.removeData("combodate").show();
        }
    };
    b.fn.combodate = function(e) {
        var f, c = Array.apply(null, arguments);
        c.shift();
        if (e === "getValue" && this.length && (f = this.eq(0).data("combodate"))) {
            return f.getValue.apply(f, c);
        }
        return this.each(function() {
            var h = b(this), g = h.data("combodate"), d = typeof e == "object" && e;
            if (!g) {
                h.data("combodate", g = new a(this, d));
            }
            if (typeof e == "string" && typeof g[e] == "function") {
                g[e].apply(g, c);
            }
        });
    };
    b.fn.combodate.defaults = {
        format: "DD-MM-YYYY HH:mm",
        template: "D / MMM / YYYY   H : mm",
        value: null,
        minYear: 1970,
        maxYear: 2015,
        minuteStep: 5,
        secondStep: 1,
        firstItem: "empty",
        errorClass: null
    };
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("combodate", c, b.defaults);
        if (!this.options.viewformat) {
            this.options.viewformat = this.options.format;
        }
        c.combodate = a.fn.editableutils.tryParseJson(c.combodate, true);
        this.options.combodate = a.extend({}, b.defaults.combodate, c.combodate, {
            format: this.options.format,
            template: this.options.template
        });
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.abstractinput);
    a.extend(b.prototype, {
        render: function() {
            this.$input.combodate(this.options.combodate);
        },
        value2html: function(d, c) {
            var e = d ? d.format(this.options.viewformat) : "";
            a(c).text(e);
        },
        html2value: function(c) {
            return c ? moment(c, this.options.viewformat) : null;
        },
        value2str: function(c) {
            return c ? c.format(this.options.format) : "";
        },
        str2value: function(c) {
            return c ? moment(c, this.options.format) : null;
        },
        value2submit: function(c) {
            return this.value2str(c);
        },
        value2input: function(c) {
            this.$input.combodate("setValue", c);
        },
        input2value: function() {
            return this.$input.combodate("getValue", null);
        },
        activate: function() {
            this.$input.siblings(".combodate").find("select").eq(0).focus();
        },
        autosubmit: function() {}
    });
    b.defaults = a.extend({}, a.fn.editabletypes.abstractinput.defaults, {
        tpl: '<input type="text">',
        inputclass: null,
        format: "YYYY-MM-DD",
        viewformat: null,
        template: "D / MMM / YYYY",
        combodate: null
    });
    a.fn.editabletypes.combodate = b;
})(window.jQuery);

(function(a) {
    a.extend(a.fn.editableform.Constructor.prototype, {
        initTemplate: function() {
            this.$form = a(a.fn.editableform.template);
            this.$form.find(".editable-error-block").addClass("help-block");
        }
    });
    a.fn.editableform.buttons = '<button type="submit" class="btn btn-primary editable-submit"><i class="icon-ok icon-white"></i></button><button type="button" class="btn editable-cancel"><i class="icon-remove"></i></button>';
    a.fn.editableform.errorGroupClass = "error";
    a.fn.editableform.errorBlockClass = null;
})(window.jQuery);

(function(a) {
    a.extend(a.fn.editableContainer.Popup.prototype, {
        containerName: "popover",
        innerCss: a(a.fn.popover.defaults.template).find("p").length ? ".popover-content p" : ".popover-content",
        initContainer: function() {
            a.extend(this.containerOptions, {
                trigger: "manual",
                selector: false,
                content: " ",
                template: a.fn.popover.defaults.template
            });
            var b;
            if (this.$element.data("template")) {
                b = this.$element.data("template");
                this.$element.removeData("template");
            }
            this.call(this.containerOptions);
            if (b) {
                this.$element.data("template", b);
            }
        },
        innerShow: function() {
            this.call("show");
        },
        innerHide: function() {
            this.call("hide");
        },
        innerDestroy: function() {
            this.call("destroy");
        },
        setContainerOption: function(b, c) {
            this.container().options[b] = c;
        },
        setPosition: function() {
            (function() {
                var f = this.tip(), b, h, d, g, c, e;
                c = typeof this.options.placement === "function" ? this.options.placement.call(this, f[0], this.$element[0]) : this.options.placement;
                b = /in/.test(c);
                f.removeClass("top right bottom left").css({
                    top: 0,
                    left: 0,
                    display: "block"
                });
                h = this.getPosition(b);
                d = f[0].offsetWidth;
                g = f[0].offsetHeight;
                switch (b ? c.split(" ")[1] : c) {
                  case "bottom":
                    e = {
                        top: h.top + h.height,
                        left: h.left + h.width / 2 - d / 2
                    };
                    break;

                  case "top":
                    e = {
                        top: h.top - g,
                        left: h.left + h.width / 2 - d / 2
                    };
                    break;

                  case "left":
                    e = {
                        top: h.top + h.height / 2 - g / 2,
                        left: h.left - d
                    };
                    break;

                  case "right":
                    e = {
                        top: h.top + h.height / 2 - g / 2,
                        left: h.left + h.width
                    };
                    break;
                }
                f.offset(e).addClass(c).addClass("in");
            }).call(this.container());
        }
    });
})(window.jQuery);

(function(b) {
    var a = function(c) {
        this.init("date", c, a.defaults);
        this.initPicker(c, a.defaults);
    };
    b.fn.editableutils.inherit(a, b.fn.editabletypes.abstractinput);
    b.extend(a.prototype, {
        initPicker: function(c, d) {
            if (!this.options.viewformat) {
                this.options.viewformat = this.options.format;
            }
            this.options.datepicker = b.extend({}, d.datepicker, c.datepicker, {
                format: this.options.viewformat
            });
            this.options.datepicker.language = this.options.datepicker.language || "en";
            this.dpg = b.fn.datepicker.DPGlobal;
            this.parsedFormat = this.dpg.parseFormat(this.options.format);
            this.parsedViewFormat = this.dpg.parseFormat(this.options.viewformat);
        },
        render: function() {
            this.$input.datepicker(this.options.datepicker);
            if (this.options.clear) {
                this.$clear = b('<a href="#"></a>').html(this.options.clear).click(b.proxy(function(c) {
                    c.preventDefault();
                    c.stopPropagation();
                    this.clear();
                }, this));
                this.$tpl.parent().append(b('<div class="editable-clear">').append(this.$clear));
            }
        },
        value2html: function(d, c) {
            var e = d ? this.dpg.formatDate(d, this.parsedViewFormat, this.options.datepicker.language) : "";
            a.superclass.value2html(e, c);
        },
        html2value: function(c) {
            return c ? this.dpg.parseDate(c, this.parsedViewFormat, this.options.datepicker.language) : null;
        },
        value2str: function(c) {
            return c ? this.dpg.formatDate(c, this.parsedFormat, this.options.datepicker.language) : "";
        },
        str2value: function(c) {
            return c ? this.dpg.parseDate(c, this.parsedFormat, this.options.datepicker.language) : null;
        },
        value2submit: function(c) {
            return this.value2str(c);
        },
        value2input: function(c) {
            this.$input.datepicker("update", c);
        },
        input2value: function() {
            return this.$input.data("datepicker").date;
        },
        activate: function() {},
        clear: function() {
            this.$input.data("datepicker").date = null;
            this.$input.find(".active").removeClass("active");
        },
        autosubmit: function() {
            this.$input.on("mouseup", ".day", function(d) {
                if (b(d.currentTarget).is(".old") || b(d.currentTarget).is(".new")) {
                    return;
                }
                var c = b(this).closest("form");
                setTimeout(function() {
                    c.submit();
                }, 200);
            });
        }
    });
    a.defaults = b.extend({}, b.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-date well"></div>',
        inputclass: null,
        format: "yyyy-mm-dd",
        viewformat: null,
        datepicker: {
            weekStart: 0,
            startView: 0,
            minViewMode: 0,
            autoclose: false
        },
        clear: "&times; clear"
    });
    b.fn.editabletypes.date = a;
})(window.jQuery);

(function(b) {
    var a = function(c) {
        this.init("datefield", c, a.defaults);
        this.initPicker(c, a.defaults);
    };
    b.fn.editableutils.inherit(a, b.fn.editabletypes.date);
    b.extend(a.prototype, {
        render: function() {
            this.$input = this.$tpl.find("input");
            this.setClass();
            this.setAttr("placeholder");
            this.$tpl.datepicker(this.options.datepicker);
            this.$input.off("focus keydown");
            this.$input.keyup(b.proxy(function() {
                this.$tpl.removeData("date");
                this.$tpl.datepicker("update");
            }, this));
        },
        value2input: function(c) {
            this.$input.val(c ? this.dpg.formatDate(c, this.parsedViewFormat, this.options.datepicker.language) : "");
            this.$tpl.datepicker("update");
        },
        input2value: function() {
            return this.html2value(this.$input.val());
        },
        activate: function() {
            b.fn.editabletypes.text.prototype.activate.call(this);
        },
        autosubmit: function() {}
    });
    a.defaults = b.extend({}, b.fn.editabletypes.date.defaults, {
        tpl: '<div class="input-append date"><input type="text"/><span class="add-on"><i class="icon-th"></i></span></div>',
        inputclass: "input-small",
        datepicker: {
            weekStart: 0,
            startView: 0,
            minViewMode: 0,
            autoclose: true
        }
    });
    b.fn.editabletypes.datefield = a;
})(window.jQuery);

!function(d) {
    function f() {
        return new Date(Date.UTC.apply(Date, arguments));
    }
    function b() {
        var g = new Date();
        return f(g.getUTCFullYear(), g.getUTCMonth(), g.getUTCDate());
    }
    var a = function(h, g) {
        var j = this;
        this.element = d(h);
        this.language = g.language || this.element.data("date-language") || "en";
        this.language = this.language in e ? this.language : this.language.split("-")[0];
        this.language = this.language in e ? this.language : "en";
        this.isRTL = e[this.language].rtl || false;
        this.format = c.parseFormat(g.format || this.element.data("date-format") || e[this.language].format || "mm/dd/yyyy");
        this.isInline = false;
        this.isInput = this.element.is("input");
        this.component = this.element.is(".date") ? this.element.find(".add-on") : false;
        this.hasInput = this.component && this.element.find("input").length;
        if (this.component && this.component.length === 0) {
            this.component = false;
        }
        this._attachEvents();
        this.forceParse = true;
        if ("forceParse" in g) {
            this.forceParse = g.forceParse;
        } else {
            if ("dateForceParse" in this.element.data()) {
                this.forceParse = this.element.data("date-force-parse");
            }
        }
        this.picker = d(c.template).appendTo(this.isInline ? this.element : "body").on({
            click: d.proxy(this.click, this),
            mousedown: d.proxy(this.mousedown, this)
        });
        if (this.isInline) {
            this.picker.addClass("datepicker-inline");
        } else {
            this.picker.addClass("datepicker-dropdown dropdown-menu");
        }
        if (this.isRTL) {
            this.picker.addClass("datepicker-rtl");
            this.picker.find(".prev i, .next i").toggleClass("icon-arrow-left icon-arrow-right");
        }
        d(document).on("mousedown", function(k) {
            if (d(k.target).closest(".datepicker.datepicker-inline, .datepicker.datepicker-dropdown").length === 0) {
                j.hide();
            }
        });
        this.autoclose = false;
        if ("autoclose" in g) {
            this.autoclose = g.autoclose;
        } else {
            if ("dateAutoclose" in this.element.data()) {
                this.autoclose = this.element.data("date-autoclose");
            }
        }
        this.keyboardNavigation = true;
        if ("keyboardNavigation" in g) {
            this.keyboardNavigation = g.keyboardNavigation;
        } else {
            if ("dateKeyboardNavigation" in this.element.data()) {
                this.keyboardNavigation = this.element.data("date-keyboard-navigation");
            }
        }
        this.viewMode = this.startViewMode = 0;
        switch (g.startView || this.element.data("date-start-view")) {
          case 2:
          case "decade":
            this.viewMode = this.startViewMode = 2;
            break;

          case 1:
          case "year":
            this.viewMode = this.startViewMode = 1;
            break;
        }
        this.minViewMode = g.minViewMode || this.element.data("date-min-view-mode") || 0;
        if (typeof this.minViewMode === "string") {
            switch (this.minViewMode) {
              case "months":
                this.minViewMode = 1;
                break;

              case "years":
                this.minViewMode = 2;
                break;

              default:
                this.minViewMode = 0;
                break;
            }
        }
        this.viewMode = this.startViewMode = Math.max(this.startViewMode, this.minViewMode);
        this.todayBtn = g.todayBtn || this.element.data("date-today-btn") || false;
        this.todayHighlight = g.todayHighlight || this.element.data("date-today-highlight") || false;
        this.calendarWeeks = false;
        if ("calendarWeeks" in g) {
            this.calendarWeeks = g.calendarWeeks;
        } else {
            if ("dateCalendarWeeks" in this.element.data()) {
                this.calendarWeeks = this.element.data("date-calendar-weeks");
            }
        }
        if (this.calendarWeeks) {
            this.picker.find("tfoot th.today").attr("colspan", function(k, l) {
                return parseInt(l) + 1;
            });
        }
        this.weekStart = (g.weekStart || this.element.data("date-weekstart") || e[this.language].weekStart || 0) % 7;
        this.weekEnd = (this.weekStart + 6) % 7;
        this.startDate = -Infinity;
        this.endDate = Infinity;
        this.daysOfWeekDisabled = [];
        this.setStartDate(g.startDate || this.element.data("date-startdate"));
        this.setEndDate(g.endDate || this.element.data("date-enddate"));
        this.setDaysOfWeekDisabled(g.daysOfWeekDisabled || this.element.data("date-days-of-week-disabled"));
        this.fillDow();
        this.fillMonths();
        this.update();
        this.showMode();
        if (this.isInline) {
            this.show();
        }
    };
    a.prototype = {
        constructor: a,
        _events: [],
        _attachEvents: function() {
            this._detachEvents();
            if (this.isInput) {
                this._events = [ [ this.element, {
                    focus: d.proxy(this.show, this),
                    keyup: d.proxy(this.update, this),
                    keydown: d.proxy(this.keydown, this)
                } ] ];
            } else {
                if (this.component && this.hasInput) {
                    this._events = [ [ this.element.find("input"), {
                        focus: d.proxy(this.show, this),
                        keyup: d.proxy(this.update, this),
                        keydown: d.proxy(this.keydown, this)
                    } ], [ this.component, {
                        click: d.proxy(this.show, this)
                    } ] ];
                } else {
                    if (this.element.is("div")) {
                        this.isInline = true;
                    } else {
                        this._events = [ [ this.element, {
                            click: d.proxy(this.show, this)
                        } ] ];
                    }
                }
            }
            for (var g = 0, h, j; g < this._events.length; g++) {
                h = this._events[g][0];
                j = this._events[g][1];
                h.on(j);
            }
        },
        _detachEvents: function() {
            for (var g = 0, h, j; g < this._events.length; g++) {
                h = this._events[g][0];
                j = this._events[g][1];
                h.off(j);
            }
            this._events = [];
        },
        show: function(g) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.update();
            this.place();
            d(window).on("resize", d.proxy(this.place, this));
            if (g) {
                g.stopPropagation();
                g.preventDefault();
            }
            this.element.trigger({
                type: "show",
                date: this.date
            });
        },
        hide: function(g) {
            if (this.isInline) {
                return;
            }
            if (!this.picker.is(":visible")) {
                return;
            }
            this.picker.hide();
            d(window).off("resize", this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                d(document).off("mousedown", this.hide);
            }
            if (this.forceParse && (this.isInput && this.element.val() || this.hasInput && this.element.find("input").val())) {
                this.setValue();
            }
            this.element.trigger({
                type: "hide",
                date: this.date
            });
        },
        remove: function() {
            this._detachEvents();
            this.picker.remove();
            delete this.element.data().datepicker;
        },
        getDate: function() {
            var g = this.getUTCDate();
            return new Date(g.getTime() + g.getTimezoneOffset() * 6e4);
        },
        getUTCDate: function() {
            return this.date;
        },
        setDate: function(g) {
            this.setUTCDate(new Date(g.getTime() - g.getTimezoneOffset() * 6e4));
        },
        setUTCDate: function(g) {
            this.date = g;
            this.setValue();
        },
        setValue: function() {
            var g = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find("input").val(g);
                }
                this.element.data("date", g);
            } else {
                this.element.val(g);
            }
        },
        getFormattedDate: function(g) {
            if (g === undefined) {
                g = this.format;
            }
            return c.formatDate(this.date, g, this.language);
        },
        setStartDate: function(g) {
            this.startDate = g || -Infinity;
            if (this.startDate !== -Infinity) {
                this.startDate = c.parseDate(this.startDate, this.format, this.language);
            }
            this.update();
            this.updateNavArrows();
        },
        setEndDate: function(g) {
            this.endDate = g || Infinity;
            if (this.endDate !== Infinity) {
                this.endDate = c.parseDate(this.endDate, this.format, this.language);
            }
            this.update();
            this.updateNavArrows();
        },
        setDaysOfWeekDisabled: function(g) {
            this.daysOfWeekDisabled = g || [];
            if (!d.isArray(this.daysOfWeekDisabled)) {
                this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
            }
            this.daysOfWeekDisabled = d.map(this.daysOfWeekDisabled, function(h) {
                return parseInt(h, 10);
            });
            this.update();
            this.updateNavArrows();
        },
        place: function() {
            if (this.isInline) {
                return;
            }
            var j = parseInt(this.element.parents().filter(function() {
                return d(this).css("z-index") != "auto";
            }).first().css("z-index")) + 10;
            var h = this.component ? this.component.offset() : this.element.offset();
            var g = this.component ? this.component.outerHeight(true) : this.element.outerHeight(true);
            this.picker.css({
                top: h.top + g,
                left: h.left,
                zIndex: j
            });
        },
        update: function() {
            var g, h = false;
            if (arguments && arguments.length && (typeof arguments[0] === "string" || arguments[0] instanceof Date)) {
                g = arguments[0];
                h = true;
            } else {
                g = this.isInput ? this.element.val() : this.element.data("date") || this.element.find("input").val();
            }
            this.date = c.parseDate(g, this.format, this.language);
            if (h) {
                this.setValue();
            }
            if (this.date < this.startDate) {
                this.viewDate = new Date(this.startDate);
            } else {
                if (this.date > this.endDate) {
                    this.viewDate = new Date(this.endDate);
                } else {
                    this.viewDate = new Date(this.date);
                }
            }
            this.fill();
        },
        fillDow: function() {
            var h = this.weekStart, j = "<tr>";
            if (this.calendarWeeks) {
                var g = '<th class="cw">&nbsp;</th>';
                j += g;
                this.picker.find(".datepicker-days thead tr:first-child").prepend(g);
            }
            while (h < this.weekStart + 7) {
                j += '<th class="dow">' + e[this.language].daysMin[h++ % 7] + "</th>";
            }
            j += "</tr>";
            this.picker.find(".datepicker-days thead").append(j);
        },
        fillMonths: function() {
            var h = "", g = 0;
            while (g < 12) {
                h += '<span class="month">' + e[this.language].monthsShort[g++] + "</span>";
            }
            this.picker.find(".datepicker-months td").html(h);
        },
        fill: function() {
            var B = new Date(this.viewDate), p = B.getUTCFullYear(), C = B.getUTCMonth(), t = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity, z = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity, m = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity, u = this.endDate !== Infinity ? this.endDate.getUTCMonth() : Infinity, n = this.date && this.date.valueOf(), A = new Date();
            this.picker.find(".datepicker-days thead th.switch").text(e[this.language].months[C] + " " + p);
            this.picker.find("tfoot th.today").text(e[this.language].today).toggle(this.todayBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            var E = f(p, C - 1, 28, 0, 0, 0, 0), w = c.getDaysInMonth(E.getUTCFullYear(), E.getUTCMonth());
            E.setUTCDate(w);
            E.setUTCDate(w - (E.getUTCDay() - this.weekStart + 7) % 7);
            var g = new Date(E);
            g.setUTCDate(g.getUTCDate() + 42);
            g = g.valueOf();
            var o = [];
            var s;
            while (E.valueOf() < g) {
                if (E.getUTCDay() == this.weekStart) {
                    o.push("<tr>");
                    if (this.calendarWeeks) {
                        var h = new Date(+E + (this.weekStart - E.getUTCDay() - 7) % 7 * 864e5), k = new Date(+h + (7 + 4 - h.getUTCDay()) % 7 * 864e5), j = new Date(+(j = f(k.getUTCFullYear(), 0, 1)) + (7 + 4 - j.getUTCDay()) % 7 * 864e5), r = (k - j) / 864e5 / 7 + 1;
                        o.push('<td class="cw">' + r + "</td>");
                    }
                }
                s = "";
                if (E.getUTCFullYear() < p || E.getUTCFullYear() == p && E.getUTCMonth() < C) {
                    s += " old";
                } else {
                    if (E.getUTCFullYear() > p || E.getUTCFullYear() == p && E.getUTCMonth() > C) {
                        s += " new";
                    }
                }
                if (this.todayHighlight && E.getUTCFullYear() == A.getFullYear() && E.getUTCMonth() == A.getMonth() && E.getUTCDate() == A.getDate()) {
                    s += " today";
                }
                if (n && E.valueOf() == n) {
                    s += " active";
                }
                if (E.valueOf() < this.startDate || E.valueOf() > this.endDate || d.inArray(E.getUTCDay(), this.daysOfWeekDisabled) !== -1) {
                    s += " disabled";
                }
                o.push('<td class="day' + s + '">' + E.getUTCDate() + "</td>");
                if (E.getUTCDay() == this.weekEnd) {
                    o.push("</tr>");
                }
                E.setUTCDate(E.getUTCDate() + 1);
            }
            this.picker.find(".datepicker-days tbody").empty().append(o.join(""));
            var F = this.date && this.date.getUTCFullYear();
            var l = this.picker.find(".datepicker-months").find("th:eq(1)").text(p).end().find("span").removeClass("active");
            if (F && F == p) {
                l.eq(this.date.getUTCMonth()).addClass("active");
            }
            if (p < t || p > m) {
                l.addClass("disabled");
            }
            if (p == t) {
                l.slice(0, z).addClass("disabled");
            }
            if (p == m) {
                l.slice(u + 1).addClass("disabled");
            }
            o = "";
            p = parseInt(p / 10, 10) * 10;
            var D = this.picker.find(".datepicker-years").find("th:eq(1)").text(p + "-" + (p + 9)).end().find("td");
            p -= 1;
            for (var v = -1; v < 11; v++) {
                o += '<span class="year' + (v == -1 || v == 10 ? " old" : "") + (F == p ? " active" : "") + (p < t || p > m ? " disabled" : "") + '">' + p + "</span>";
                p += 1;
            }
            D.html(o);
        },
        updateNavArrows: function() {
            var j = new Date(this.viewDate), g = j.getUTCFullYear(), h = j.getUTCMonth();
            switch (this.viewMode) {
              case 0:
                if (this.startDate !== -Infinity && g <= this.startDate.getUTCFullYear() && h <= this.startDate.getUTCMonth()) {
                    this.picker.find(".prev").css({
                        visibility: "hidden"
                    });
                } else {
                    this.picker.find(".prev").css({
                        visibility: "visible"
                    });
                }
                if (this.endDate !== Infinity && g >= this.endDate.getUTCFullYear() && h >= this.endDate.getUTCMonth()) {
                    this.picker.find(".next").css({
                        visibility: "hidden"
                    });
                } else {
                    this.picker.find(".next").css({
                        visibility: "visible"
                    });
                }
                break;

              case 1:
              case 2:
                if (this.startDate !== -Infinity && g <= this.startDate.getUTCFullYear()) {
                    this.picker.find(".prev").css({
                        visibility: "hidden"
                    });
                } else {
                    this.picker.find(".prev").css({
                        visibility: "visible"
                    });
                }
                if (this.endDate !== Infinity && g >= this.endDate.getUTCFullYear()) {
                    this.picker.find(".next").css({
                        visibility: "hidden"
                    });
                } else {
                    this.picker.find(".next").css({
                        visibility: "visible"
                    });
                }
                break;
            }
        },
        click: function(n) {
            n.stopPropagation();
            n.preventDefault();
            var m = d(n.target).closest("span, td, th");
            if (m.length == 1) {
                switch (m[0].nodeName.toLowerCase()) {
                  case "th":
                    switch (m[0].className) {
                      case "switch":
                        this.showMode(1);
                        break;

                      case "prev":
                      case "next":
                        var j = c.modes[this.viewMode].navStep * (m[0].className == "prev" ? -1 : 1);
                        switch (this.viewMode) {
                          case 0:
                            this.viewDate = this.moveMonth(this.viewDate, j);
                            break;

                          case 1:
                          case 2:
                            this.viewDate = this.moveYear(this.viewDate, j);
                            break;
                        }
                        this.fill();
                        break;

                      case "today":
                        var h = new Date();
                        h = f(h.getFullYear(), h.getMonth(), h.getDate(), 0, 0, 0);
                        this.showMode(-2);
                        var o = this.todayBtn == "linked" ? null : "view";
                        this._setDate(h, o);
                        break;
                    }
                    break;

                  case "span":
                    if (!m.is(".disabled")) {
                        this.viewDate.setUTCDate(1);
                        if (m.is(".month")) {
                            var g = 1;
                            var l = m.parent().find("span").index(m);
                            var k = this.viewDate.getUTCFullYear();
                            this.viewDate.setUTCMonth(l);
                            this.element.trigger({
                                type: "changeMonth",
                                date: this.viewDate
                            });
                            if (this.minViewMode == 1) {
                                this._setDate(f(k, l, g, 0, 0, 0, 0));
                            }
                        } else {
                            var k = parseInt(m.text(), 10) || 0;
                            var g = 1;
                            var l = 0;
                            this.viewDate.setUTCFullYear(k);
                            this.element.trigger({
                                type: "changeYear",
                                date: this.viewDate
                            });
                            if (this.minViewMode == 2) {
                                this._setDate(f(k, l, g, 0, 0, 0, 0));
                            }
                        }
                        this.showMode(-1);
                        this.fill();
                    }
                    break;

                  case "td":
                    if (m.is(".day") && !m.is(".disabled")) {
                        var g = parseInt(m.text(), 10) || 1;
                        var k = this.viewDate.getUTCFullYear(), l = this.viewDate.getUTCMonth();
                        if (m.is(".old")) {
                            if (l === 0) {
                                l = 11;
                                k -= 1;
                            } else {
                                l -= 1;
                            }
                        } else {
                            if (m.is(".new")) {
                                if (l == 11) {
                                    l = 0;
                                    k += 1;
                                } else {
                                    l += 1;
                                }
                            }
                        }
                        this._setDate(f(k, l, g, 0, 0, 0, 0));
                    }
                    break;
                }
            }
        },
        _setDate: function(g, j) {
            if (!j || j == "date") {
                this.date = g;
            }
            if (!j || j == "view") {
                this.viewDate = g;
            }
            this.fill();
            this.setValue();
            this.element.trigger({
                type: "changeDate",
                date: this.date
            });
            var h;
            if (this.isInput) {
                h = this.element;
            } else {
                if (this.component) {
                    h = this.element.find("input");
                }
            }
            if (h) {
                h.change();
                if (this.autoclose && (!j || j == "date")) {
                    this.hide();
                }
            }
        },
        moveMonth: function(g, h) {
            if (!h) {
                return g;
            }
            var l = new Date(g.valueOf()), p = l.getUTCDate(), m = l.getUTCMonth(), k = Math.abs(h), o, n;
            h = h > 0 ? 1 : -1;
            if (k == 1) {
                n = h == -1 ? function() {
                    return l.getUTCMonth() == m;
                } : function() {
                    return l.getUTCMonth() != o;
                };
                o = m + h;
                l.setUTCMonth(o);
                if (o < 0 || o > 11) {
                    o = (o + 12) % 12;
                }
            } else {
                for (var j = 0; j < k; j++) {
                    l = this.moveMonth(l, h);
                }
                o = l.getUTCMonth();
                l.setUTCDate(p);
                n = function() {
                    return o != l.getUTCMonth();
                };
            }
            while (n()) {
                l.setUTCDate(--p);
                l.setUTCMonth(o);
            }
            return l;
        },
        moveYear: function(h, g) {
            return this.moveMonth(h, g * 12);
        },
        dateWithinRange: function(g) {
            return g >= this.startDate && g <= this.endDate;
        },
        keydown: function(o) {
            if (this.picker.is(":not(:visible)")) {
                if (o.keyCode == 27) {
                    this.show();
                }
                return;
            }
            var k = false, j, h, n, g, m;
            switch (o.keyCode) {
              case 27:
                this.hide();
                o.preventDefault();
                break;

              case 37:
              case 39:
                if (!this.keyboardNavigation) {
                    break;
                }
                j = o.keyCode == 37 ? -1 : 1;
                if (o.ctrlKey) {
                    g = this.moveYear(this.date, j);
                    m = this.moveYear(this.viewDate, j);
                } else {
                    if (o.shiftKey) {
                        g = this.moveMonth(this.date, j);
                        m = this.moveMonth(this.viewDate, j);
                    } else {
                        g = new Date(this.date);
                        g.setUTCDate(this.date.getUTCDate() + j);
                        m = new Date(this.viewDate);
                        m.setUTCDate(this.viewDate.getUTCDate() + j);
                    }
                }
                if (this.dateWithinRange(g)) {
                    this.date = g;
                    this.viewDate = m;
                    this.setValue();
                    this.update();
                    o.preventDefault();
                    k = true;
                }
                break;

              case 38:
              case 40:
                if (!this.keyboardNavigation) {
                    break;
                }
                j = o.keyCode == 38 ? -1 : 1;
                if (o.ctrlKey) {
                    g = this.moveYear(this.date, j);
                    m = this.moveYear(this.viewDate, j);
                } else {
                    if (o.shiftKey) {
                        g = this.moveMonth(this.date, j);
                        m = this.moveMonth(this.viewDate, j);
                    } else {
                        g = new Date(this.date);
                        g.setUTCDate(this.date.getUTCDate() + j * 7);
                        m = new Date(this.viewDate);
                        m.setUTCDate(this.viewDate.getUTCDate() + j * 7);
                    }
                }
                if (this.dateWithinRange(g)) {
                    this.date = g;
                    this.viewDate = m;
                    this.setValue();
                    this.update();
                    o.preventDefault();
                    k = true;
                }
                break;

              case 13:
                this.hide();
                o.preventDefault();
                break;

              case 9:
                this.hide();
                break;
            }
            if (k) {
                this.element.trigger({
                    type: "changeDate",
                    date: this.date
                });
                var l;
                if (this.isInput) {
                    l = this.element;
                } else {
                    if (this.component) {
                        l = this.element.find("input");
                    }
                }
                if (l) {
                    l.change();
                }
            }
        },
        showMode: function(g) {
            if (g) {
                this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + g));
            }
            this.picker.find(">div").hide().filter(".datepicker-" + c.modes[this.viewMode].clsName).css("display", "block");
            this.updateNavArrows();
        }
    };
    d.fn.datepicker = function(h) {
        var g = Array.apply(null, arguments);
        g.shift();
        return this.each(function() {
            var l = d(this), k = l.data("datepicker"), j = typeof h == "object" && h;
            if (!k) {
                l.data("datepicker", k = new a(this, d.extend({}, d.fn.datepicker.defaults, j)));
            }
            if (typeof h == "string" && typeof k[h] == "function") {
                k[h].apply(k, g);
            }
        });
    };
    d.fn.datepicker.defaults = {};
    d.fn.datepicker.Constructor = a;
    var e = d.fn.datepicker.dates = {
        en: {
            days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
            daysShort: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ],
            daysMin: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su" ],
            months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            monthsShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
            today: "Today"
        }
    };
    var c = {
        modes: [ {
            clsName: "days",
            navFnc: "Month",
            navStep: 1
        }, {
            clsName: "months",
            navFnc: "FullYear",
            navStep: 1
        }, {
            clsName: "years",
            navFnc: "FullYear",
            navStep: 10
        } ],
        isLeapYear: function(g) {
            return g % 4 === 0 && g % 100 !== 0 || g % 400 === 0;
        },
        getDaysInMonth: function(g, h) {
            return [ 31, c.isLeapYear(g) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ][h];
        },
        validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
        parseFormat: function(j) {
            var g = j.replace(this.validParts, "\0").split("\0"), h = j.match(this.validParts);
            if (!g || !g.length || !h || h.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {
                separators: g,
                parts: h
            };
        },
        parseDate: function(k, v, n) {
            if (k instanceof Date) {
                return k;
            }
            if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(k)) {
                var z = /([\-+]\d+)([dmwy])/, m = k.match(/([\-+]\d+)([dmwy])/g), g, l;
                k = new Date();
                for (var o = 0; o < m.length; o++) {
                    g = z.exec(m[o]);
                    l = parseInt(g[1]);
                    switch (g[2]) {
                      case "d":
                        k.setUTCDate(k.getUTCDate() + l);
                        break;

                      case "m":
                        k = a.prototype.moveMonth.call(a.prototype, k, l);
                        break;

                      case "w":
                        k.setUTCDate(k.getUTCDate() + l * 7);
                        break;

                      case "y":
                        k = a.prototype.moveYear.call(a.prototype, k, l);
                        break;
                    }
                }
                return f(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate(), 0, 0, 0);
            }
            var m = k && k.match(this.nonpunctuation) || [], k = new Date(), t = {}, u = [ "yyyy", "yy", "M", "MM", "m", "mm", "d", "dd" ], w = {
                yyyy: function(B, s) {
                    return B.setUTCFullYear(s);
                },
                yy: function(B, s) {
                    return B.setUTCFullYear(2e3 + s);
                },
                m: function(B, s) {
                    s -= 1;
                    while (s < 0) {
                        s += 12;
                    }
                    s %= 12;
                    B.setUTCMonth(s);
                    while (B.getUTCMonth() != s) {
                        B.setUTCDate(B.getUTCDate() - 1);
                    }
                    return B;
                },
                d: function(B, s) {
                    return B.setUTCDate(s);
                }
            }, j, p, g;
            w.M = w.MM = w.mm = w.m;
            w.dd = w.d;
            k = f(k.getFullYear(), k.getMonth(), k.getDate(), 0, 0, 0);
            var r = v.parts.slice();
            if (m.length != r.length) {
                r = d(r).filter(function(s, B) {
                    return d.inArray(B, u) !== -1;
                }).toArray();
            }
            if (m.length == r.length) {
                for (var o = 0, h = r.length; o < h; o++) {
                    j = parseInt(m[o], 10);
                    g = r[o];
                    if (isNaN(j)) {
                        switch (g) {
                          case "MM":
                            p = d(e[n].months).filter(function() {
                                var s = this.slice(0, m[o].length), B = m[o].slice(0, s.length);
                                return s == B;
                            });
                            j = d.inArray(p[0], e[n].months) + 1;
                            break;

                          case "M":
                            p = d(e[n].monthsShort).filter(function() {
                                var s = this.slice(0, m[o].length), B = m[o].slice(0, s.length);
                                return s == B;
                            });
                            j = d.inArray(p[0], e[n].monthsShort) + 1;
                            break;
                        }
                    }
                    t[g] = j;
                }
                for (var o = 0, A; o < u.length; o++) {
                    A = u[o];
                    if (A in t && !isNaN(t[A])) {
                        w[A](k, t[A]);
                    }
                }
            }
            return k;
        },
        formatDate: function(g, l, n) {
            var m = {
                d: g.getUTCDate(),
                D: e[n].daysShort[g.getUTCDay()],
                DD: e[n].days[g.getUTCDay()],
                m: g.getUTCMonth() + 1,
                M: e[n].monthsShort[g.getUTCMonth()],
                MM: e[n].months[g.getUTCMonth()],
                yy: g.getUTCFullYear().toString().substring(2),
                yyyy: g.getUTCFullYear()
            };
            m.dd = (m.d < 10 ? "0" : "") + m.d;
            m.mm = (m.m < 10 ? "0" : "") + m.m;
            var g = [], k = d.extend([], l.separators);
            for (var j = 0, h = l.parts.length; j < h; j++) {
                if (k.length) {
                    g.push(k.shift());
                }
                g.push(m[l.parts[j]]);
            }
            return g.join("");
        },
        headTemplate: '<thead><tr><th class="prev"><i class="icon-arrow-left"/></th><th colspan="5" class="switch"></th><th class="next"><i class="icon-arrow-right"/></th></tr></thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr></tfoot>'
    };
    c.template = '<div class="datepicker"><div class="datepicker-days"><table class=" table-condensed">' + c.headTemplate + "<tbody></tbody>" + c.footTemplate + '</table></div><div class="datepicker-months"><table class="table-condensed">' + c.headTemplate + c.contTemplate + c.footTemplate + '</table></div><div class="datepicker-years"><table class="table-condensed">' + c.headTemplate + c.contTemplate + c.footTemplate + "</table></div></div>";
    d.fn.datepicker.DPGlobal = c;
}(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("typeahead", c, b.defaults);
        this.options.typeahead = a.extend({}, b.defaults.typeahead, {
            matcher: this.matcher,
            sorter: this.sorter,
            highlighter: this.highlighter,
            updater: this.updater
        }, c.typeahead);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.list);
    a.extend(b.prototype, {
        renderList: function() {
            this.$input = this.$tpl.is("input") ? this.$tpl : this.$tpl.find('input[type="text"]');
            this.options.typeahead.source = this.sourceData;
            this.$input.typeahead(this.options.typeahead);
            var c = this.$input.data("typeahead");
            c.render = a.proxy(this.typeaheadRender, c);
            c.select = a.proxy(this.typeaheadSelect, c);
            c.move = a.proxy(this.typeaheadMove, c);
            this.renderClear();
            this.setClass();
            this.setAttr("placeholder");
        },
        value2htmlFinal: function(e, d) {
            if (this.getIsObjects()) {
                var c = a.fn.editableutils.itemsByValue(e, this.sourceData);
                a(d).text(c.length ? c[0].text : "");
            } else {
                a(d).text(e);
            }
        },
        html2value: function(c) {
            return c ? c : null;
        },
        value2input: function(d) {
            if (this.getIsObjects()) {
                var c = a.fn.editableutils.itemsByValue(d, this.sourceData);
                this.$input.data("value", d).val(c.length ? c[0].text : "");
            } else {
                this.$input.val(d);
            }
        },
        input2value: function() {
            if (this.getIsObjects()) {
                var d = this.$input.data("value"), c = a.fn.editableutils.itemsByValue(d, this.sourceData);
                if (c.length && c[0].text.toLowerCase() === this.$input.val().toLowerCase()) {
                    return d;
                } else {
                    return null;
                }
            } else {
                return this.$input.val();
            }
        },
        getIsObjects: function() {
            if (this.isObjects === undefined) {
                this.isObjects = false;
                for (var c = 0; c < this.sourceData.length; c++) {
                    if (this.sourceData[c].value !== this.sourceData[c].text) {
                        this.isObjects = true;
                        break;
                    }
                }
            }
            return this.isObjects;
        },
        activate: a.fn.editabletypes.text.prototype.activate,
        renderClear: a.fn.editabletypes.text.prototype.renderClear,
        postrender: a.fn.editabletypes.text.prototype.postrender,
        toggleClear: a.fn.editabletypes.text.prototype.toggleClear,
        clear: function() {
            a.fn.editabletypes.text.prototype.clear.call(this);
            this.$input.data("value", "");
        },
        matcher: function(c) {
            return a.fn.typeahead.Constructor.prototype.matcher.call(this, c.text);
        },
        sorter: function(e) {
            var f = [], d = [], c = [], g, h;
            while (g = e.shift()) {
                h = g.text;
                if (!h.toLowerCase().indexOf(this.query.toLowerCase())) {
                    f.push(g);
                } else {
                    if (~h.indexOf(this.query)) {
                        d.push(g);
                    } else {
                        c.push(g);
                    }
                }
            }
            return f.concat(d, c);
        },
        highlighter: function(c) {
            return a.fn.typeahead.Constructor.prototype.highlighter.call(this, c.text);
        },
        updater: function(c) {
            this.$element.data("value", c.value);
            return c.text;
        },
        typeaheadRender: function(c) {
            var d = this;
            c = a(c).map(function(e, f) {
                e = a(d.options.item).data("item", f);
                e.find("a").html(d.highlighter(f));
                return e[0];
            });
            if (this.options.autoSelect) {
                c.first().addClass("active");
            }
            this.$menu.html(c);
            return this;
        },
        typeaheadSelect: function() {
            var c = this.$menu.find(".active").data("item");
            if (this.options.autoSelect || c) {
                this.$element.val(this.updater(c)).change();
            }
            return this.hide();
        },
        typeaheadMove: function(c) {
            if (!this.shown) {
                return;
            }
            switch (c.keyCode) {
              case 9:
              case 13:
              case 27:
                if (!this.$menu.find(".active").length) {
                    return;
                }
                c.preventDefault();
                break;

              case 38:
                c.preventDefault();
                this.prev();
                break;

              case 40:
                c.preventDefault();
                this.next();
                break;
            }
            c.stopPropagation();
        }
    });
    b.defaults = a.extend({}, a.fn.editabletypes.list.defaults, {
        tpl: '<input type="text">',
        typeahead: null,
        clear: true
    });
    a.fn.editabletypes.typeahead = b;
})(window.jQuery);

(function(a) {
    var b = function(c) {
        this.init("address", c, b.defaults);
    };
    a.fn.editableutils.inherit(b, a.fn.editabletypes.abstractinput);
    a.extend(b.prototype, {
        render: function() {
            this.$input = this.$tpl.find("input");
        },
        value2html: function(e, d) {
            if (!e) {
                a(d).empty();
                return;
            }
            var c = a("<div>").text(e.city).html() + ", " + a("<div>").text(e.street).html() + " st., bld. " + a("<div>").text(e.building).html();
            a(d).html(c);
        },
        html2value: function(c) {
            return null;
        },
        value2str: function(d) {
            var e = "";
            if (d) {
                for (var c in d) {
                    e = e + c + ":" + d[c] + ";";
                }
            }
            return e;
        },
        str2value: function(c) {
            return c;
        },
        value2input: function(c) {
            if (!c) {
                return;
            }
            this.$input.filter('[name="city"]').val(c.city);
            this.$input.filter('[name="street"]').val(c.street);
            this.$input.filter('[name="building"]').val(c.building);
        },
        input2value: function() {
            return {
                city: this.$input.filter('[name="city"]').val(),
                street: this.$input.filter('[name="street"]').val(),
                building: this.$input.filter('[name="building"]').val()
            };
        },
        activate: function() {
            this.$input.filter('[name="city"]').focus();
        },
        autosubmit: function() {
            this.$input.keydown(function(c) {
                if (c.which === 13) {
                    a(this).closest("form").submit();
                }
            });
        }
    });
    b.defaults = a.extend({}, a.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-address"><label><span>City: </span><input type="text" name="city" class="input-small"></label></div><div class="editable-address"><label><span>Street: </span><input type="text" name="street" class="input-small"></label></div><div class="editable-address"><label><span>Building: </span><input type="text" name="building" class="input-mini"></label></div>',
        inputclass: ""
    });
    a.fn.editabletypes.address = b;
})(window.jQuery);

/*! Javascript plotting library for jQuery, v. 0.7.
 *
 * Released under the MIT license by IOLA, December 2007.
 *
 */
/*! Javascript plotting library for jQuery, v. 0.7.
 *
 * Released under the MIT license by IOLA, December 2007.
 *
 */
(function(b) {
    b.color = {};
    b.color.make = function(d, e, g, f) {
        var c = {};
        c.r = d || 0;
        c.g = e || 0;
        c.b = g || 0;
        c.a = f != null ? f : 1;
        c.add = function(h, j) {
            for (var k = 0; k < h.length; ++k) {
                c[h.charAt(k)] += j;
            }
            return c.normalize();
        };
        c.scale = function(h, j) {
            for (var k = 0; k < h.length; ++k) {
                c[h.charAt(k)] *= j;
            }
            return c.normalize();
        };
        c.toString = function() {
            if (c.a >= 1) {
                return "rgb(" + [ c.r, c.g, c.b ].join(",") + ")";
            } else {
                return "rgba(" + [ c.r, c.g, c.b, c.a ].join(",") + ")";
            }
        };
        c.normalize = function() {
            function h(k, j, l) {
                return j < k ? k : j > l ? l : j;
            }
            c.r = h(0, parseInt(c.r), 255);
            c.g = h(0, parseInt(c.g), 255);
            c.b = h(0, parseInt(c.b), 255);
            c.a = h(0, c.a, 1);
            return c;
        };
        c.clone = function() {
            return b.color.make(c.r, c.b, c.g, c.a);
        };
        return c.normalize();
    };
    b.color.extract = function(d, e) {
        var c;
        do {
            c = d.css(e).toLowerCase();
            if (c != "" && c != "transparent") {
                break;
            }
            d = d.parent();
        } while (!b.nodeName(d.get(0), "body"));
        if (c == "rgba(0, 0, 0, 0)") {
            c = "transparent";
        }
        return b.color.parse(c);
    };
    b.color.parse = function(c) {
        var d, f = b.color.make;
        if (d = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c)) {
            return f(parseInt(d[1], 10), parseInt(d[2], 10), parseInt(d[3], 10));
        }
        if (d = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(c)) {
            return f(parseInt(d[1], 10), parseInt(d[2], 10), parseInt(d[3], 10), parseFloat(d[4]));
        }
        if (d = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c)) {
            return f(parseFloat(d[1]) * 2.55, parseFloat(d[2]) * 2.55, parseFloat(d[3]) * 2.55);
        }
        if (d = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(c)) {
            return f(parseFloat(d[1]) * 2.55, parseFloat(d[2]) * 2.55, parseFloat(d[3]) * 2.55, parseFloat(d[4]));
        }
        if (d = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c)) {
            return f(parseInt(d[1], 16), parseInt(d[2], 16), parseInt(d[3], 16));
        }
        if (d = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c)) {
            return f(parseInt(d[1] + d[1], 16), parseInt(d[2] + d[2], 16), parseInt(d[3] + d[3], 16));
        }
        var e = b.trim(c).toLowerCase();
        if (e == "transparent") {
            return f(255, 255, 255, 0);
        } else {
            d = a[e] || [ 0, 0, 0 ];
            return f(d[0], d[1], d[2]);
        }
    };
    var a = {
        aqua: [ 0, 255, 255 ],
        azure: [ 240, 255, 255 ],
        beige: [ 245, 245, 220 ],
        black: [ 0, 0, 0 ],
        blue: [ 0, 0, 255 ],
        brown: [ 165, 42, 42 ],
        cyan: [ 0, 255, 255 ],
        darkblue: [ 0, 0, 139 ],
        darkcyan: [ 0, 139, 139 ],
        darkgrey: [ 169, 169, 169 ],
        darkgreen: [ 0, 100, 0 ],
        darkkhaki: [ 189, 183, 107 ],
        darkmagenta: [ 139, 0, 139 ],
        darkolivegreen: [ 85, 107, 47 ],
        darkorange: [ 255, 140, 0 ],
        darkorchid: [ 153, 50, 204 ],
        darkred: [ 139, 0, 0 ],
        darksalmon: [ 233, 150, 122 ],
        darkviolet: [ 148, 0, 211 ],
        fuchsia: [ 255, 0, 255 ],
        gold: [ 255, 215, 0 ],
        green: [ 0, 128, 0 ],
        indigo: [ 75, 0, 130 ],
        khaki: [ 240, 230, 140 ],
        lightblue: [ 173, 216, 230 ],
        lightcyan: [ 224, 255, 255 ],
        lightgreen: [ 144, 238, 144 ],
        lightgrey: [ 211, 211, 211 ],
        lightpink: [ 255, 182, 193 ],
        lightyellow: [ 255, 255, 224 ],
        lime: [ 0, 255, 0 ],
        magenta: [ 255, 0, 255 ],
        maroon: [ 128, 0, 0 ],
        navy: [ 0, 0, 128 ],
        olive: [ 128, 128, 0 ],
        orange: [ 255, 165, 0 ],
        pink: [ 255, 192, 203 ],
        purple: [ 128, 0, 128 ],
        violet: [ 128, 0, 128 ],
        red: [ 255, 0, 0 ],
        silver: [ 192, 192, 192 ],
        white: [ 255, 255, 255 ],
        yellow: [ 255, 255, 0 ]
    };
})(jQuery);

(function(c) {
    function b(ay, al, M, ai) {
        var T = [], R = {
            colors: [ "#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed" ],
            legend: {
                show: true,
                noColumns: 1,
                labelFormatter: null,
                labelBoxBorderColor: "#ccc",
                container: null,
                position: "ne",
                margin: 5,
                backgroundColor: null,
                backgroundOpacity: .85
            },
            xaxis: {
                show: null,
                position: "bottom",
                mode: null,
                color: null,
                tickColor: null,
                transform: null,
                inverseTransform: null,
                min: null,
                max: null,
                autoscaleMargin: null,
                ticks: null,
                tickFormatter: null,
                labelWidth: null,
                labelHeight: null,
                reserveSpace: null,
                tickLength: null,
                alignTicksWithAxis: null,
                tickDecimals: null,
                tickSize: null,
                minTickSize: null,
                monthNames: null,
                timeformat: null,
                twelveHourClock: false
            },
            yaxis: {
                autoscaleMargin: .02,
                position: "left"
            },
            xaxes: [],
            yaxes: [],
            series: {
                points: {
                    show: false,
                    radius: 3,
                    lineWidth: 2,
                    fill: true,
                    fillColor: "#ffffff",
                    symbol: "circle"
                },
                lines: {
                    lineWidth: 2,
                    fill: false,
                    fillColor: null,
                    steps: false
                },
                bars: {
                    show: false,
                    lineWidth: 2,
                    barWidth: 1,
                    fill: true,
                    fillColor: null,
                    align: "left",
                    horizontal: false
                },
                shadowSize: 3
            },
            grid: {
                show: true,
                aboveData: false,
                color: "#545454",
                backgroundColor: null,
                borderColor: null,
                tickColor: null,
                labelMargin: 5,
                axisMargin: 8,
                borderWidth: 2,
                minBorderMargin: null,
                markings: null,
                markingsColor: "#f4f4f4",
                markingsLineWidth: 2,
                clickable: false,
                hoverable: false,
                autoHighlight: true,
                mouseActiveRadius: 10
            },
            hooks: {}
        }, aC = null, ag = null, B = null, K = null, D = null, p = [], az = [], r = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }, J = 0, L = 0, h = 0, z = 0, an = {
            processOptions: [],
            processRawData: [],
            processDatapoints: [],
            drawSeries: [],
            draw: [],
            bindEvents: [],
            drawOverlay: [],
            shutdown: []
        }, au = this;
        au.setData = am;
        au.setupGrid = u;
        au.draw = Z;
        au.getPlaceholder = function() {
            return ay;
        };
        au.getCanvas = function() {
            return aC;
        };
        au.getPlotOffset = function() {
            return r;
        };
        au.width = function() {
            return h;
        };
        au.height = function() {
            return z;
        };
        au.offset = function() {
            var aE = B.offset();
            aE.left += r.left;
            aE.top += r.top;
            return aE;
        };
        au.getData = function() {
            return T;
        };
        au.getAxes = function() {
            var aF = {}, aE;
            c.each(p.concat(az), function(aG, aH) {
                if (aH) {
                    aF[aH.direction + (aH.n != 1 ? aH.n : "") + "axis"] = aH;
                }
            });
            return aF;
        };
        au.getXAxes = function() {
            return p;
        };
        au.getYAxes = function() {
            return az;
        };
        au.c2p = F;
        au.p2c = av;
        au.getOptions = function() {
            return R;
        };
        au.highlight = A;
        au.unhighlight = W;
        au.triggerRedrawOverlay = f;
        au.pointOffset = function(aE) {
            return {
                left: parseInt(p[aD(aE, "x") - 1].p2c(+aE.x) + r.left),
                top: parseInt(az[aD(aE, "y") - 1].p2c(+aE.y) + r.top)
            };
        };
        au.shutdown = aj;
        au.resize = function() {
            E();
            g(aC);
            g(ag);
        };
        au.hooks = an;
        I(au);
        ac(M);
        aa();
        am(al);
        u();
        Z();
        ak();
        function aq(aG, aE) {
            aE = [ au ].concat(aE);
            for (var aF = 0; aF < aG.length; ++aF) {
                aG[aF].apply(this, aE);
            }
        }
        function I() {
            for (var aE = 0; aE < ai.length; ++aE) {
                var aF = ai[aE];
                aF.init(au);
                if (aF.options) {
                    c.extend(true, R, aF.options);
                }
            }
        }
        function ac(aF) {
            var aE;
            c.extend(true, R, aF);
            if (R.xaxis.color == null) {
                R.xaxis.color = R.grid.color;
            }
            if (R.yaxis.color == null) {
                R.yaxis.color = R.grid.color;
            }
            if (R.xaxis.tickColor == null) {
                R.xaxis.tickColor = R.grid.tickColor;
            }
            if (R.yaxis.tickColor == null) {
                R.yaxis.tickColor = R.grid.tickColor;
            }
            if (R.grid.borderColor == null) {
                R.grid.borderColor = R.grid.color;
            }
            if (R.grid.tickColor == null) {
                R.grid.tickColor = c.color.parse(R.grid.color).scale("a", .22).toString();
            }
            for (aE = 0; aE < Math.max(1, R.xaxes.length); ++aE) {
                R.xaxes[aE] = c.extend(true, {}, R.xaxis, R.xaxes[aE]);
            }
            for (aE = 0; aE < Math.max(1, R.yaxes.length); ++aE) {
                R.yaxes[aE] = c.extend(true, {}, R.yaxis, R.yaxes[aE]);
            }
            if (R.xaxis.noTicks && R.xaxis.ticks == null) {
                R.xaxis.ticks = R.xaxis.noTicks;
            }
            if (R.yaxis.noTicks && R.yaxis.ticks == null) {
                R.yaxis.ticks = R.yaxis.noTicks;
            }
            if (R.x2axis) {
                R.xaxes[1] = c.extend(true, {}, R.xaxis, R.x2axis);
                R.xaxes[1].position = "top";
            }
            if (R.y2axis) {
                R.yaxes[1] = c.extend(true, {}, R.yaxis, R.y2axis);
                R.yaxes[1].position = "right";
            }
            if (R.grid.coloredAreas) {
                R.grid.markings = R.grid.coloredAreas;
            }
            if (R.grid.coloredAreasColor) {
                R.grid.markingsColor = R.grid.coloredAreasColor;
            }
            if (R.lines) {
                c.extend(true, R.series.lines, R.lines);
            }
            if (R.points) {
                c.extend(true, R.series.points, R.points);
            }
            if (R.bars) {
                c.extend(true, R.series.bars, R.bars);
            }
            if (R.shadowSize != null) {
                R.series.shadowSize = R.shadowSize;
            }
            for (aE = 0; aE < R.xaxes.length; ++aE) {
                Y(p, aE + 1).options = R.xaxes[aE];
            }
            for (aE = 0; aE < R.yaxes.length; ++aE) {
                Y(az, aE + 1).options = R.yaxes[aE];
            }
            for (var aG in an) {
                if (R.hooks[aG] && R.hooks[aG].length) {
                    an[aG] = an[aG].concat(R.hooks[aG]);
                }
            }
            aq(an.processOptions, [ R ]);
        }
        function am(aE) {
            T = ab(aE);
            aA();
            C();
        }
        function ab(aH) {
            var aF = [];
            for (var aE = 0; aE < aH.length; ++aE) {
                var aG = c.extend(true, {}, R.series);
                if (aH[aE].data != null) {
                    aG.data = aH[aE].data;
                    delete aH[aE].data;
                    c.extend(true, aG, aH[aE]);
                    aH[aE].data = aG.data;
                } else {
                    aG.data = aH[aE];
                }
                aF.push(aG);
            }
            return aF;
        }
        function aD(aF, aG) {
            var aE = aF[aG + "axis"];
            if (typeof aE == "object") {
                aE = aE.n;
            }
            if (typeof aE != "number") {
                aE = 1;
            }
            return aE;
        }
        function m() {
            return c.grep(p.concat(az), function(aE) {
                return aE;
            });
        }
        function F(aH) {
            var aF = {}, aE, aG;
            for (aE = 0; aE < p.length; ++aE) {
                aG = p[aE];
                if (aG && aG.used) {
                    aF["x" + aG.n] = aG.c2p(aH.left);
                }
            }
            for (aE = 0; aE < az.length; ++aE) {
                aG = az[aE];
                if (aG && aG.used) {
                    aF["y" + aG.n] = aG.c2p(aH.top);
                }
            }
            if (aF.x1 !== undefined) {
                aF.x = aF.x1;
            }
            if (aF.y1 !== undefined) {
                aF.y = aF.y1;
            }
            return aF;
        }
        function av(aI) {
            var aG = {}, aF, aH, aE;
            for (aF = 0; aF < p.length; ++aF) {
                aH = p[aF];
                if (aH && aH.used) {
                    aE = "x" + aH.n;
                    if (aI[aE] == null && aH.n == 1) {
                        aE = "x";
                    }
                    if (aI[aE] != null) {
                        aG.left = aH.p2c(aI[aE]);
                        break;
                    }
                }
            }
            for (aF = 0; aF < az.length; ++aF) {
                aH = az[aF];
                if (aH && aH.used) {
                    aE = "y" + aH.n;
                    if (aI[aE] == null && aH.n == 1) {
                        aE = "y";
                    }
                    if (aI[aE] != null) {
                        aG.top = aH.p2c(aI[aE]);
                        break;
                    }
                }
            }
            return aG;
        }
        function Y(aF, aE) {
            if (!aF[aE - 1]) {
                aF[aE - 1] = {
                    n: aE,
                    direction: aF == p ? "x" : "y",
                    options: c.extend(true, {}, aF == p ? R.xaxis : R.yaxis)
                };
            }
            return aF[aE - 1];
        }
        function aA() {
            var aJ;
            var aP = T.length, aE = [], aH = [];
            for (aJ = 0; aJ < T.length; ++aJ) {
                var aM = T[aJ].color;
                if (aM != null) {
                    --aP;
                    if (typeof aM == "number") {
                        aH.push(aM);
                    } else {
                        aE.push(c.color.parse(T[aJ].color));
                    }
                }
            }
            for (aJ = 0; aJ < aH.length; ++aJ) {
                aP = Math.max(aP, aH[aJ] + 1);
            }
            var aF = [], aI = 0;
            aJ = 0;
            while (aF.length < aP) {
                var aL;
                if (R.colors.length == aJ) {
                    aL = c.color.make(100, 100, 100);
                } else {
                    aL = c.color.parse(R.colors[aJ]);
                }
                var aG = aI % 2 == 1 ? -1 : 1;
                aL.scale("rgb", 1 + aG * Math.ceil(aI / 2) * .2);
                aF.push(aL);
                ++aJ;
                if (aJ >= R.colors.length) {
                    aJ = 0;
                    ++aI;
                }
            }
            var aK = 0, aQ;
            for (aJ = 0; aJ < T.length; ++aJ) {
                aQ = T[aJ];
                if (aQ.color == null) {
                    aQ.color = aF[aK].toString();
                    ++aK;
                } else {
                    if (typeof aQ.color == "number") {
                        aQ.color = aF[aQ.color].toString();
                    }
                }
                if (aQ.lines.show == null) {
                    var aO, aN = true;
                    for (aO in aQ) {
                        if (aQ[aO] && aQ[aO].show) {
                            aN = false;
                            break;
                        }
                    }
                    if (aN) {
                        aQ.lines.show = true;
                    }
                }
                aQ.xaxis = Y(p, aD(aQ, "x"));
                aQ.yaxis = Y(az, aD(aQ, "y"));
            }
        }
        function C() {
            var aR = Number.POSITIVE_INFINITY, aL = Number.NEGATIVE_INFINITY, aE = Number.MAX_VALUE, aX, aV, aU, aQ, aG, aM, aW, aS, aK, aJ, aF, a3, a0, aO;
            function aI(a6, a5, a4) {
                if (a5 < a6.datamin && a5 != -aE) {
                    a6.datamin = a5;
                }
                if (a4 > a6.datamax && a4 != aE) {
                    a6.datamax = a4;
                }
            }
            c.each(m(), function(a4, a5) {
                a5.datamin = aR;
                a5.datamax = aL;
                a5.used = false;
            });
            for (aX = 0; aX < T.length; ++aX) {
                aM = T[aX];
                aM.datapoints = {
                    points: []
                };
                aq(an.processRawData, [ aM, aM.data, aM.datapoints ]);
            }
            for (aX = 0; aX < T.length; ++aX) {
                aM = T[aX];
                var a2 = aM.data, aZ = aM.datapoints.format;
                if (!aZ) {
                    aZ = [];
                    aZ.push({
                        x: true,
                        number: true,
                        required: true
                    });
                    aZ.push({
                        y: true,
                        number: true,
                        required: true
                    });
                    if (aM.bars.show || aM.lines.show && aM.lines.fill) {
                        aZ.push({
                            y: true,
                            number: true,
                            required: false,
                            defaultValue: 0
                        });
                        if (aM.bars.horizontal) {
                            delete aZ[aZ.length - 1].y;
                            aZ[aZ.length - 1].x = true;
                        }
                    }
                    aM.datapoints.format = aZ;
                }
                if (aM.datapoints.pointsize != null) {
                    continue;
                }
                aM.datapoints.pointsize = aZ.length;
                aS = aM.datapoints.pointsize;
                aW = aM.datapoints.points;
                insertSteps = aM.lines.show && aM.lines.steps;
                aM.xaxis.used = aM.yaxis.used = true;
                for (aV = aU = 0; aV < a2.length; ++aV, aU += aS) {
                    aO = a2[aV];
                    var aH = aO == null;
                    if (!aH) {
                        for (aQ = 0; aQ < aS; ++aQ) {
                            a3 = aO[aQ];
                            a0 = aZ[aQ];
                            if (a0) {
                                if (a0.number && a3 != null) {
                                    a3 = +a3;
                                    if (isNaN(a3)) {
                                        a3 = null;
                                    } else {
                                        if (a3 == Infinity) {
                                            a3 = aE;
                                        } else {
                                            if (a3 == -Infinity) {
                                                a3 = -aE;
                                            }
                                        }
                                    }
                                }
                                if (a3 == null) {
                                    if (a0.required) {
                                        aH = true;
                                    }
                                    if (a0.defaultValue != null) {
                                        a3 = a0.defaultValue;
                                    }
                                }
                            }
                            aW[aU + aQ] = a3;
                        }
                    }
                    if (aH) {
                        for (aQ = 0; aQ < aS; ++aQ) {
                            a3 = aW[aU + aQ];
                            if (a3 != null) {
                                a0 = aZ[aQ];
                                if (a0.x) {
                                    aI(aM.xaxis, a3, a3);
                                }
                                if (a0.y) {
                                    aI(aM.yaxis, a3, a3);
                                }
                            }
                            aW[aU + aQ] = null;
                        }
                    } else {
                        if (insertSteps && aU > 0 && aW[aU - aS] != null && aW[aU - aS] != aW[aU] && aW[aU - aS + 1] != aW[aU + 1]) {
                            for (aQ = 0; aQ < aS; ++aQ) {
                                aW[aU + aS + aQ] = aW[aU + aQ];
                            }
                            aW[aU + 1] = aW[aU - aS + 1];
                            aU += aS;
                        }
                    }
                }
            }
            for (aX = 0; aX < T.length; ++aX) {
                aM = T[aX];
                aq(an.processDatapoints, [ aM, aM.datapoints ]);
            }
            for (aX = 0; aX < T.length; ++aX) {
                aM = T[aX];
                aW = aM.datapoints.points, aS = aM.datapoints.pointsize;
                var aN = aR, aT = aR, aP = aL, aY = aL;
                for (aV = 0; aV < aW.length; aV += aS) {
                    if (aW[aV] == null) {
                        continue;
                    }
                    for (aQ = 0; aQ < aS; ++aQ) {
                        a3 = aW[aV + aQ];
                        a0 = aZ[aQ];
                        if (!a0 || a3 == aE || a3 == -aE) {
                            continue;
                        }
                        if (a0.x) {
                            if (a3 < aN) {
                                aN = a3;
                            }
                            if (a3 > aP) {
                                aP = a3;
                            }
                        }
                        if (a0.y) {
                            if (a3 < aT) {
                                aT = a3;
                            }
                            if (a3 > aY) {
                                aY = a3;
                            }
                        }
                    }
                }
                if (aM.bars.show) {
                    var a1 = aM.bars.align == "left" ? 0 : -aM.bars.barWidth / 2;
                    if (aM.bars.horizontal) {
                        aT += a1;
                        aY += a1 + aM.bars.barWidth;
                    } else {
                        aN += a1;
                        aP += a1 + aM.bars.barWidth;
                    }
                }
                aI(aM.xaxis, aN, aP);
                aI(aM.yaxis, aT, aY);
            }
            c.each(m(), function(a4, a5) {
                if (a5.datamin == aR) {
                    a5.datamin = null;
                }
                if (a5.datamax == aL) {
                    a5.datamax = null;
                }
            });
        }
        function j(aE, aF) {
            var aG = document.createElement("canvas");
            aG.className = aF;
            aG.width = J;
            aG.height = L;
            if (!aE) {
                c(aG).css({
                    position: "absolute",
                    left: 0,
                    top: 0
                });
            }
            c(aG).appendTo(ay);
            if (!aG.getContext) {
                aG = window.G_vmlCanvasManager.initElement(aG);
            }
            aG.getContext("2d").save();
            return aG;
        }
        function E() {
            J = ay.width();
            L = ay.height();
            if (J <= 0 || L <= 0) {
                throw "Invalid dimensions for plot, width = " + J + ", height = " + L;
            }
        }
        function g(aF) {
            if (aF.width != J) {
                aF.width = J;
            }
            if (aF.height != L) {
                aF.height = L;
            }
            var aE = aF.getContext("2d");
            aE.restore();
            aE.save();
        }
        function aa() {
            var aF, aE = ay.children("canvas.base"), aG = ay.children("canvas.overlay");
            if (aE.length == 0 || aG == 0) {
                ay.html("");
                ay.css({
                    padding: 0
                });
                if (ay.css("position") == "static") {
                    ay.css("position", "relative");
                }
                E();
                aC = j(true, "base");
                ag = j(false, "overlay");
                aF = false;
            } else {
                aC = aE.get(0);
                ag = aG.get(0);
                aF = true;
            }
            K = aC.getContext("2d");
            D = ag.getContext("2d");
            B = c([ ag, aC ]);
            if (aF) {
                ay.data("plot").shutdown();
                au.resize();
                D.clearRect(0, 0, J, L);
                B.unbind();
                ay.children().not([ aC, ag ]).remove();
            }
            ay.data("plot", au);
        }
        function ak() {
            if (R.grid.hoverable) {
                B.mousemove(ad);
                B.mouseleave(l);
            }
            if (R.grid.clickable) {
                B.click(U);
            }
            aq(an.bindEvents, [ B ]);
        }
        function aj() {
            if (P) {
                clearTimeout(P);
            }
            B.unbind("mousemove", ad);
            B.unbind("mouseleave", l);
            B.unbind("click", U);
            aq(an.shutdown, [ B ]);
        }
        function s(aJ) {
            function aF(aK) {
                return aK;
            }
            var aI, aE, aG = aJ.options.transform || aF, aH = aJ.options.inverseTransform;
            if (aJ.direction == "x") {
                aI = aJ.scale = h / Math.abs(aG(aJ.max) - aG(aJ.min));
                aE = Math.min(aG(aJ.max), aG(aJ.min));
            } else {
                aI = aJ.scale = z / Math.abs(aG(aJ.max) - aG(aJ.min));
                aI = -aI;
                aE = Math.max(aG(aJ.max), aG(aJ.min));
            }
            if (aG == aF) {
                aJ.p2c = function(aK) {
                    return (aK - aE) * aI;
                };
            } else {
                aJ.p2c = function(aK) {
                    return (aG(aK) - aE) * aI;
                };
            }
            if (!aH) {
                aJ.c2p = function(aK) {
                    return aE + aK / aI;
                };
            } else {
                aJ.c2p = function(aK) {
                    return aH(aE + aK / aI);
                };
            }
        }
        function O(aG) {
            var aE = aG.options, aI, aM = aG.ticks || [], aL = [], aH, aN = aE.labelWidth, aJ = aE.labelHeight, aF;
            function aK(aP, aO) {
                return c('<div style="position:absolute;top:-10000px;' + aO + 'font-size:smaller"><div class="' + aG.direction + "Axis " + aG.direction + aG.n + 'Axis">' + aP.join("") + "</div></div>").appendTo(ay);
            }
            if (aG.direction == "x") {
                if (aN == null) {
                    aN = Math.floor(J / (aM.length > 0 ? aM.length : 1));
                }
                if (aJ == null) {
                    aL = [];
                    for (aI = 0; aI < aM.length; ++aI) {
                        aH = aM[aI].label;
                        if (aH) {
                            aL.push('<div class="tickLabel" style="float:left;width:' + aN + 'px">' + aH + "</div>");
                        }
                    }
                    if (aL.length > 0) {
                        aL.push('<div style="clear:left"></div>');
                        aF = aK(aL, "width:10000px;");
                        aJ = aF.height();
                        aF.remove();
                    }
                }
            } else {
                if (aN == null || aJ == null) {
                    for (aI = 0; aI < aM.length; ++aI) {
                        aH = aM[aI].label;
                        if (aH) {
                            aL.push('<div class="tickLabel">' + aH + "</div>");
                        }
                    }
                    if (aL.length > 0) {
                        aF = aK(aL, "");
                        if (aN == null) {
                            aN = aF.children().width();
                        }
                        if (aJ == null) {
                            aJ = aF.find("div.tickLabel").height();
                        }
                        aF.remove();
                    }
                }
            }
            if (aN == null) {
                aN = 0;
            }
            if (aJ == null) {
                aJ = 0;
            }
            aG.labelWidth = aN;
            aG.labelHeight = aJ;
        }
        function ax(aG) {
            var aF = aG.labelWidth, aO = aG.labelHeight, aK = aG.options.position, aI = aG.options.tickLength, aJ = R.grid.axisMargin, aM = R.grid.labelMargin, aN = aG.direction == "x" ? p : az, aH;
            var aE = c.grep(aN, function(aQ) {
                return aQ && aQ.options.position == aK && aQ.reserveSpace;
            });
            if (c.inArray(aG, aE) == aE.length - 1) {
                aJ = 0;
            }
            if (aI == null) {
                aI = "full";
            }
            var aL = c.grep(aN, function(aQ) {
                return aQ && aQ.reserveSpace;
            });
            var aP = c.inArray(aG, aL) == 0;
            if (!aP && aI == "full") {
                aI = 5;
            }
            if (!isNaN(+aI)) {
                aM += +aI;
            }
            if (aG.direction == "x") {
                aO += aM;
                if (aK == "bottom") {
                    r.bottom += aO + aJ;
                    aG.box = {
                        top: L - r.bottom,
                        height: aO
                    };
                } else {
                    aG.box = {
                        top: r.top + aJ,
                        height: aO
                    };
                    r.top += aO + aJ;
                }
            } else {
                aF += aM;
                if (aK == "left") {
                    aG.box = {
                        left: r.left + aJ,
                        width: aF
                    };
                    r.left += aF + aJ;
                } else {
                    r.right += aF + aJ;
                    aG.box = {
                        left: J - r.right,
                        width: aF
                    };
                }
            }
            aG.position = aK;
            aG.tickLength = aI;
            aG.box.padding = aM;
            aG.innermost = aP;
        }
        function X(aE) {
            if (aE.direction == "x") {
                aE.box.left = r.left;
                aE.box.width = h;
            } else {
                aE.box.top = r.top;
                aE.box.height = z;
            }
        }
        function u() {
            var aF, aH = m();
            c.each(aH, function(aI, aJ) {
                aJ.show = aJ.options.show;
                if (aJ.show == null) {
                    aJ.show = aJ.used;
                }
                aJ.reserveSpace = aJ.show || aJ.options.reserveSpace;
                n(aJ);
            });
            allocatedAxes = c.grep(aH, function(aI) {
                return aI.reserveSpace;
            });
            r.left = r.right = r.top = r.bottom = 0;
            if (R.grid.show) {
                c.each(allocatedAxes, function(aI, aJ) {
                    V(aJ);
                    S(aJ);
                    at(aJ, aJ.ticks);
                    O(aJ);
                });
                for (aF = allocatedAxes.length - 1; aF >= 0; --aF) {
                    ax(allocatedAxes[aF]);
                }
                var aG = R.grid.minBorderMargin;
                if (aG == null) {
                    aG = 0;
                    for (aF = 0; aF < T.length; ++aF) {
                        aG = Math.max(aG, T[aF].points.radius + T[aF].points.lineWidth / 2);
                    }
                }
                for (var aE in r) {
                    r[aE] += R.grid.borderWidth;
                    r[aE] = Math.max(aG, r[aE]);
                }
            }
            h = J - r.left - r.right;
            z = L - r.bottom - r.top;
            c.each(aH, function(aI, aJ) {
                s(aJ);
            });
            if (R.grid.show) {
                c.each(allocatedAxes, function(aI, aJ) {
                    X(aJ);
                });
                k();
            }
            o();
        }
        function n(aH) {
            var aI = aH.options, aG = +(aI.min != null ? aI.min : aH.datamin), aE = +(aI.max != null ? aI.max : aH.datamax), aK = aE - aG;
            if (aK == 0) {
                var aF = aE == 0 ? 1 : .01;
                if (aI.min == null) {
                    aG -= aF;
                }
                if (aI.max == null || aI.min != null) {
                    aE += aF;
                }
            } else {
                var aJ = aI.autoscaleMargin;
                if (aJ != null) {
                    if (aI.min == null) {
                        aG -= aK * aJ;
                        if (aG < 0 && aH.datamin != null && aH.datamin >= 0) {
                            aG = 0;
                        }
                    }
                    if (aI.max == null) {
                        aE += aK * aJ;
                        if (aE > 0 && aH.datamax != null && aH.datamax <= 0) {
                            aE = 0;
                        }
                    }
                }
            }
            aH.min = aG;
            aH.max = aE;
        }
        function V(aJ) {
            var aP = aJ.options;
            var aK;
            if (typeof aP.ticks == "number" && aP.ticks > 0) {
                aK = aP.ticks;
            } else {
                aK = .3 * Math.sqrt(aJ.direction == "x" ? J : L);
            }
            var aW = (aJ.max - aJ.min) / aK, aR, aE, aQ, aU, aV, aT, aL;
            if (aP.mode == "time") {
                var aM = {
                    second: 1e3,
                    minute: 60 * 1e3,
                    hour: 60 * 60 * 1e3,
                    day: 24 * 60 * 60 * 1e3,
                    month: 30 * 24 * 60 * 60 * 1e3,
                    year: 365.2425 * 24 * 60 * 60 * 1e3
                };
                var aN = [ [ 1, "second" ], [ 2, "second" ], [ 5, "second" ], [ 10, "second" ], [ 30, "second" ], [ 1, "minute" ], [ 2, "minute" ], [ 5, "minute" ], [ 10, "minute" ], [ 30, "minute" ], [ 1, "hour" ], [ 2, "hour" ], [ 4, "hour" ], [ 8, "hour" ], [ 12, "hour" ], [ 1, "day" ], [ 2, "day" ], [ 3, "day" ], [ .25, "month" ], [ .5, "month" ], [ 1, "month" ], [ 2, "month" ], [ 3, "month" ], [ 6, "month" ], [ 1, "year" ] ];
                var aF = 0;
                if (aP.minTickSize != null) {
                    if (typeof aP.tickSize == "number") {
                        aF = aP.tickSize;
                    } else {
                        aF = aP.minTickSize[0] * aM[aP.minTickSize[1]];
                    }
                }
                for (var aV = 0; aV < aN.length - 1; ++aV) {
                    if (aW < (aN[aV][0] * aM[aN[aV][1]] + aN[aV + 1][0] * aM[aN[aV + 1][1]]) / 2 && aN[aV][0] * aM[aN[aV][1]] >= aF) {
                        break;
                    }
                }
                aR = aN[aV][0];
                aQ = aN[aV][1];
                if (aQ == "year") {
                    aT = Math.pow(10, Math.floor(Math.log(aW / aM.year) / Math.LN10));
                    aL = aW / aM.year / aT;
                    if (aL < 1.5) {
                        aR = 1;
                    } else {
                        if (aL < 3) {
                            aR = 2;
                        } else {
                            if (aL < 7.5) {
                                aR = 5;
                            } else {
                                aR = 10;
                            }
                        }
                    }
                    aR *= aT;
                }
                aJ.tickSize = aP.tickSize || [ aR, aQ ];
                aE = function(a0) {
                    var a5 = [], a3 = a0.tickSize[0], a6 = a0.tickSize[1], a4 = new Date(a0.min);
                    var aZ = a3 * aM[a6];
                    if (a6 == "second") {
                        a4.setUTCSeconds(a(a4.getUTCSeconds(), a3));
                    }
                    if (a6 == "minute") {
                        a4.setUTCMinutes(a(a4.getUTCMinutes(), a3));
                    }
                    if (a6 == "hour") {
                        a4.setUTCHours(a(a4.getUTCHours(), a3));
                    }
                    if (a6 == "month") {
                        a4.setUTCMonth(a(a4.getUTCMonth(), a3));
                    }
                    if (a6 == "year") {
                        a4.setUTCFullYear(a(a4.getUTCFullYear(), a3));
                    }
                    a4.setUTCMilliseconds(0);
                    if (aZ >= aM.minute) {
                        a4.setUTCSeconds(0);
                    }
                    if (aZ >= aM.hour) {
                        a4.setUTCMinutes(0);
                    }
                    if (aZ >= aM.day) {
                        a4.setUTCHours(0);
                    }
                    if (aZ >= aM.day * 4) {
                        a4.setUTCDate(1);
                    }
                    if (aZ >= aM.year) {
                        a4.setUTCMonth(0);
                    }
                    var a8 = 0, a7 = Number.NaN, a1;
                    do {
                        a1 = a7;
                        a7 = a4.getTime();
                        a5.push(a7);
                        if (a6 == "month") {
                            if (a3 < 1) {
                                a4.setUTCDate(1);
                                var aY = a4.getTime();
                                a4.setUTCMonth(a4.getUTCMonth() + 1);
                                var a2 = a4.getTime();
                                a4.setTime(a7 + a8 * aM.hour + (a2 - aY) * a3);
                                a8 = a4.getUTCHours();
                                a4.setUTCHours(0);
                            } else {
                                a4.setUTCMonth(a4.getUTCMonth() + a3);
                            }
                        } else {
                            if (a6 == "year") {
                                a4.setUTCFullYear(a4.getUTCFullYear() + a3);
                            } else {
                                a4.setTime(a7 + aZ);
                            }
                        }
                    } while (a7 < a0.max && a7 != a1);
                    return a5;
                };
                aU = function(aY, a1) {
                    var a3 = new Date(aY);
                    if (aP.timeformat != null) {
                        return c.plot.formatDate(a3, aP.timeformat, aP.monthNames);
                    }
                    var aZ = a1.tickSize[0] * aM[a1.tickSize[1]];
                    var a0 = a1.max - a1.min;
                    var a2 = aP.twelveHourClock ? " %p" : "";
                    if (aZ < aM.minute) {
                        fmt = "%h:%M:%S" + a2;
                    } else {
                        if (aZ < aM.day) {
                            if (a0 < 2 * aM.day) {
                                fmt = "%h:%M" + a2;
                            } else {
                                fmt = "%b %d %h:%M" + a2;
                            }
                        } else {
                            if (aZ < aM.month) {
                                fmt = "%b %d";
                            } else {
                                if (aZ < aM.year) {
                                    if (a0 < aM.year) {
                                        fmt = "%b";
                                    } else {
                                        fmt = "%b %y";
                                    }
                                } else {
                                    fmt = "%y";
                                }
                            }
                        }
                    }
                    return c.plot.formatDate(a3, fmt, aP.monthNames);
                };
            } else {
                var aX = aP.tickDecimals;
                var aS = -Math.floor(Math.log(aW) / Math.LN10);
                if (aX != null && aS > aX) {
                    aS = aX;
                }
                aT = Math.pow(10, -aS);
                aL = aW / aT;
                if (aL < 1.5) {
                    aR = 1;
                } else {
                    if (aL < 3) {
                        aR = 2;
                        if (aL > 2.25 && (aX == null || aS + 1 <= aX)) {
                            aR = 2.5;
                            ++aS;
                        }
                    } else {
                        if (aL < 7.5) {
                            aR = 5;
                        } else {
                            aR = 10;
                        }
                    }
                }
                aR *= aT;
                if (aP.minTickSize != null && aR < aP.minTickSize) {
                    aR = aP.minTickSize;
                }
                aJ.tickDecimals = Math.max(0, aX != null ? aX : aS);
                aJ.tickSize = aP.tickSize || aR;
                aE = function(a0) {
                    var a2 = [];
                    var a3 = a(a0.min, a0.tickSize), aZ = 0, aY = Number.NaN, a1;
                    do {
                        a1 = aY;
                        aY = a3 + aZ * a0.tickSize;
                        a2.push(aY);
                        ++aZ;
                    } while (aY < a0.max && aY != a1);
                    return a2;
                };
                aU = function(aY, aZ) {
                    return aY.toFixed(aZ.tickDecimals);
                };
            }
            if (aP.alignTicksWithAxis != null) {
                var aI = (aJ.direction == "x" ? p : az)[aP.alignTicksWithAxis - 1];
                if (aI && aI.used && aI != aJ) {
                    var aO = aE(aJ);
                    if (aO.length > 0) {
                        if (aP.min == null) {
                            aJ.min = Math.min(aJ.min, aO[0]);
                        }
                        if (aP.max == null && aO.length > 1) {
                            aJ.max = Math.max(aJ.max, aO[aO.length - 1]);
                        }
                    }
                    aE = function(a0) {
                        var a1 = [], aY, aZ;
                        for (aZ = 0; aZ < aI.ticks.length; ++aZ) {
                            aY = (aI.ticks[aZ].v - aI.min) / (aI.max - aI.min);
                            aY = a0.min + aY * (a0.max - a0.min);
                            a1.push(aY);
                        }
                        return a1;
                    };
                    if (aJ.mode != "time" && aP.tickDecimals == null) {
                        var aH = Math.max(0, -Math.floor(Math.log(aW) / Math.LN10) + 1), aG = aE(aJ);
                        if (!(aG.length > 1 && /\..*0$/.test((aG[1] - aG[0]).toFixed(aH)))) {
                            aJ.tickDecimals = aH;
                        }
                    }
                }
            }
            aJ.tickGenerator = aE;
            if (c.isFunction(aP.tickFormatter)) {
                aJ.tickFormatter = function(aY, aZ) {
                    return "" + aP.tickFormatter(aY, aZ);
                };
            } else {
                aJ.tickFormatter = aU;
            }
        }
        function S(aI) {
            var aK = aI.options.ticks, aJ = [];
            if (aK == null || typeof aK == "number" && aK > 0) {
                aJ = aI.tickGenerator(aI);
            } else {
                if (aK) {
                    if (c.isFunction(aK)) {
                        aJ = aK({
                            min: aI.min,
                            max: aI.max
                        });
                    } else {
                        aJ = aK;
                    }
                }
            }
            var aH, aE;
            aI.ticks = [];
            for (aH = 0; aH < aJ.length; ++aH) {
                var aF = null;
                var aG = aJ[aH];
                if (typeof aG == "object") {
                    aE = +aG[0];
                    if (aG.length > 1) {
                        aF = aG[1];
                    }
                } else {
                    aE = +aG;
                }
                if (aF == null) {
                    aF = aI.tickFormatter(aE, aI);
                }
                if (!isNaN(aE)) {
                    aI.ticks.push({
                        v: aE,
                        label: aF
                    });
                }
            }
        }
        function at(aE, aF) {
            if (aE.options.autoscaleMargin && aF.length > 0) {
                if (aE.options.min == null) {
                    aE.min = Math.min(aE.min, aF[0].v);
                }
                if (aE.options.max == null && aF.length > 1) {
                    aE.max = Math.max(aE.max, aF[aF.length - 1].v);
                }
            }
        }
        function Z() {
            K.clearRect(0, 0, J, L);
            var aF = R.grid;
            if (aF.show && aF.backgroundColor) {
                Q();
            }
            if (aF.show && !aF.aboveData) {
                af();
            }
            for (var aE = 0; aE < T.length; ++aE) {
                aq(an.drawSeries, [ K, T[aE] ]);
                d(T[aE]);
            }
            aq(an.draw, [ K ]);
            if (aF.show && aF.aboveData) {
                af();
            }
        }
        function G(aE, aL) {
            var aH, aK, aJ, aG, aI = m();
            for (i = 0; i < aI.length; ++i) {
                aH = aI[i];
                if (aH.direction == aL) {
                    aG = aL + aH.n + "axis";
                    if (!aE[aG] && aH.n == 1) {
                        aG = aL + "axis";
                    }
                    if (aE[aG]) {
                        aK = aE[aG].from;
                        aJ = aE[aG].to;
                        break;
                    }
                }
            }
            if (!aE[aG]) {
                aH = aL == "x" ? p[0] : az[0];
                aK = aE[aL + "1"];
                aJ = aE[aL + "2"];
            }
            if (aK != null && aJ != null && aK > aJ) {
                var aF = aK;
                aK = aJ;
                aJ = aF;
            }
            return {
                from: aK,
                to: aJ,
                axis: aH
            };
        }
        function Q() {
            K.save();
            K.translate(r.left, r.top);
            K.fillStyle = ap(R.grid.backgroundColor, z, 0, "rgba(255, 255, 255, 0)");
            K.fillRect(0, 0, h, z);
            K.restore();
        }
        function af() {
            var aI;
            K.save();
            K.translate(r.left, r.top);
            var aK = R.grid.markings;
            if (aK) {
                if (c.isFunction(aK)) {
                    var aN = au.getAxes();
                    aN.xmin = aN.xaxis.min;
                    aN.xmax = aN.xaxis.max;
                    aN.ymin = aN.yaxis.min;
                    aN.ymax = aN.yaxis.max;
                    aK = aK(aN);
                }
                for (aI = 0; aI < aK.length; ++aI) {
                    var aG = aK[aI], aF = G(aG, "x"), aL = G(aG, "y");
                    if (aF.from == null) {
                        aF.from = aF.axis.min;
                    }
                    if (aF.to == null) {
                        aF.to = aF.axis.max;
                    }
                    if (aL.from == null) {
                        aL.from = aL.axis.min;
                    }
                    if (aL.to == null) {
                        aL.to = aL.axis.max;
                    }
                    if (aF.to < aF.axis.min || aF.from > aF.axis.max || aL.to < aL.axis.min || aL.from > aL.axis.max) {
                        continue;
                    }
                    aF.from = Math.max(aF.from, aF.axis.min);
                    aF.to = Math.min(aF.to, aF.axis.max);
                    aL.from = Math.max(aL.from, aL.axis.min);
                    aL.to = Math.min(aL.to, aL.axis.max);
                    if (aF.from == aF.to && aL.from == aL.to) {
                        continue;
                    }
                    aF.from = aF.axis.p2c(aF.from);
                    aF.to = aF.axis.p2c(aF.to);
                    aL.from = aL.axis.p2c(aL.from);
                    aL.to = aL.axis.p2c(aL.to);
                    if (aF.from == aF.to || aL.from == aL.to) {
                        K.beginPath();
                        K.strokeStyle = aG.color || R.grid.markingsColor;
                        K.lineWidth = aG.lineWidth || R.grid.markingsLineWidth;
                        K.moveTo(aF.from, aL.from);
                        K.lineTo(aF.to, aL.to);
                        K.stroke();
                    } else {
                        K.fillStyle = aG.color || R.grid.markingsColor;
                        K.fillRect(aF.from, aL.to, aF.to - aF.from, aL.from - aL.to);
                    }
                }
            }
            var aN = m(), aP = R.grid.borderWidth;
            for (var aH = 0; aH < aN.length; ++aH) {
                var aE = aN[aH], aJ = aE.box, aT = aE.tickLength, aQ, aO, aS, aM;
                if (!aE.show || aE.ticks.length == 0) {
                    continue;
                }
                K.strokeStyle = aE.options.tickColor || c.color.parse(aE.options.color).scale("a", .22).toString();
                K.lineWidth = 1;
                if (aE.direction == "x") {
                    aQ = 0;
                    if (aT == "full") {
                        aO = aE.position == "top" ? 0 : z;
                    } else {
                        aO = aJ.top - r.top + (aE.position == "top" ? aJ.height : 0);
                    }
                } else {
                    aO = 0;
                    if (aT == "full") {
                        aQ = aE.position == "left" ? 0 : h;
                    } else {
                        aQ = aJ.left - r.left + (aE.position == "left" ? aJ.width : 0);
                    }
                }
                if (!aE.innermost) {
                    K.beginPath();
                    aS = aM = 0;
                    if (aE.direction == "x") {
                        aS = h;
                    } else {
                        aM = z;
                    }
                    if (K.lineWidth == 1) {
                        aQ = Math.floor(aQ) + .5;
                        aO = Math.floor(aO) + .5;
                    }
                    K.moveTo(aQ, aO);
                    K.lineTo(aQ + aS, aO + aM);
                    K.stroke();
                }
                K.beginPath();
                for (aI = 0; aI < aE.ticks.length; ++aI) {
                    var aR = aE.ticks[aI].v;
                    aS = aM = 0;
                    if (aR < aE.min || aR > aE.max || aT == "full" && aP > 0 && (aR == aE.min || aR == aE.max)) {
                        continue;
                    }
                    if (aE.direction == "x") {
                        aQ = aE.p2c(aR);
                        aM = aT == "full" ? -z : aT;
                        if (aE.position == "top") {
                            aM = -aM;
                        }
                    } else {
                        aO = aE.p2c(aR);
                        aS = aT == "full" ? -h : aT;
                        if (aE.position == "left") {
                            aS = -aS;
                        }
                    }
                    if (K.lineWidth == 1) {
                        if (aE.direction == "x") {
                            aQ = Math.floor(aQ) + .5;
                        } else {
                            aO = Math.floor(aO) + .5;
                        }
                    }
                    K.moveTo(aQ, aO);
                    K.lineTo(aQ + aS, aO + aM);
                }
                K.stroke();
            }
            if (aP) {
                K.lineWidth = aP;
                K.strokeStyle = R.grid.borderColor;
                K.strokeRect(-aP / 2, -aP / 2, h + aP, z + aP);
            }
            K.restore();
        }
        function k() {
            ay.find(".tickLabels").remove();
            var aJ = [ '<div class="tickLabels" style="font-size:smaller">' ];
            var aM = m();
            for (var aG = 0; aG < aM.length; ++aG) {
                var aF = aM[aG], aI = aF.box;
                if (!aF.show) {
                    continue;
                }
                aJ.push('<div class="' + aF.direction + "Axis " + aF.direction + aF.n + 'Axis" style="color:' + aF.options.color + '">');
                for (var aH = 0; aH < aF.ticks.length; ++aH) {
                    var aK = aF.ticks[aH];
                    if (!aK.label || aK.v < aF.min || aK.v > aF.max) {
                        continue;
                    }
                    var aN = {}, aL;
                    if (aF.direction == "x") {
                        aL = "center";
                        aN.left = Math.round(r.left + aF.p2c(aK.v) - aF.labelWidth / 2);
                        if (aF.position == "bottom") {
                            aN.top = aI.top + aI.padding;
                        } else {
                            aN.bottom = L - (aI.top + aI.height - aI.padding);
                        }
                    } else {
                        aN.top = Math.round(r.top + aF.p2c(aK.v) - aF.labelHeight / 2);
                        if (aF.position == "left") {
                            aN.right = J - (aI.left + aI.width - aI.padding);
                            aL = "right";
                        } else {
                            aN.left = aI.left + aI.padding;
                            aL = "left";
                        }
                    }
                    aN.width = aF.labelWidth;
                    var aE = [ "position:absolute", "text-align:" + aL ];
                    for (var aO in aN) {
                        aE.push(aO + ":" + aN[aO] + "px");
                    }
                    aJ.push('<div class="tickLabel" style="' + aE.join(";") + '">' + aK.label + "</div>");
                }
                aJ.push("</div>");
            }
            aJ.push("</div>");
            ay.append(aJ.join(""));
        }
        function d(aE) {
            if (aE.lines.show) {
                aw(aE);
            }
            if (aE.bars.show) {
                e(aE);
            }
            if (aE.points.show) {
                ar(aE);
            }
        }
        function aw(aH) {
            function aG(aS, aT, aL, aX, aW) {
                var aY = aS.points, aM = aS.pointsize, aQ = null, aP = null;
                K.beginPath();
                for (var aR = aM; aR < aY.length; aR += aM) {
                    var aO = aY[aR - aM], aV = aY[aR - aM + 1], aN = aY[aR], aU = aY[aR + 1];
                    if (aO == null || aN == null) {
                        continue;
                    }
                    if (aV <= aU && aV < aW.min) {
                        if (aU < aW.min) {
                            continue;
                        }
                        aO = (aW.min - aV) / (aU - aV) * (aN - aO) + aO;
                        aV = aW.min;
                    } else {
                        if (aU <= aV && aU < aW.min) {
                            if (aV < aW.min) {
                                continue;
                            }
                            aN = (aW.min - aV) / (aU - aV) * (aN - aO) + aO;
                            aU = aW.min;
                        }
                    }
                    if (aV >= aU && aV > aW.max) {
                        if (aU > aW.max) {
                            continue;
                        }
                        aO = (aW.max - aV) / (aU - aV) * (aN - aO) + aO;
                        aV = aW.max;
                    } else {
                        if (aU >= aV && aU > aW.max) {
                            if (aV > aW.max) {
                                continue;
                            }
                            aN = (aW.max - aV) / (aU - aV) * (aN - aO) + aO;
                            aU = aW.max;
                        }
                    }
                    if (aO <= aN && aO < aX.min) {
                        if (aN < aX.min) {
                            continue;
                        }
                        aV = (aX.min - aO) / (aN - aO) * (aU - aV) + aV;
                        aO = aX.min;
                    } else {
                        if (aN <= aO && aN < aX.min) {
                            if (aO < aX.min) {
                                continue;
                            }
                            aU = (aX.min - aO) / (aN - aO) * (aU - aV) + aV;
                            aN = aX.min;
                        }
                    }
                    if (aO >= aN && aO > aX.max) {
                        if (aN > aX.max) {
                            continue;
                        }
                        aV = (aX.max - aO) / (aN - aO) * (aU - aV) + aV;
                        aO = aX.max;
                    } else {
                        if (aN >= aO && aN > aX.max) {
                            if (aO > aX.max) {
                                continue;
                            }
                            aU = (aX.max - aO) / (aN - aO) * (aU - aV) + aV;
                            aN = aX.max;
                        }
                    }
                    if (aO != aQ || aV != aP) {
                        K.moveTo(aX.p2c(aO) + aT, aW.p2c(aV) + aL);
                    }
                    aQ = aN;
                    aP = aU;
                    K.lineTo(aX.p2c(aN) + aT, aW.p2c(aU) + aL);
                }
                K.stroke();
            }
            function aI(aL, aT, aS) {
                var aZ = aL.points, aY = aL.pointsize, aQ = Math.min(Math.max(0, aS.min), aS.max), a0 = 0, aX, aW = false, aP = 1, aO = 0, aU = 0;
                while (true) {
                    if (aY > 0 && a0 > aZ.length + aY) {
                        break;
                    }
                    a0 += aY;
                    var a2 = aZ[a0 - aY], aN = aZ[a0 - aY + aP], a1 = aZ[a0], aM = aZ[a0 + aP];
                    if (aW) {
                        if (aY > 0 && a2 != null && a1 == null) {
                            aU = a0;
                            aY = -aY;
                            aP = 2;
                            continue;
                        }
                        if (aY < 0 && a0 == aO + aY) {
                            K.fill();
                            aW = false;
                            aY = -aY;
                            aP = 1;
                            a0 = aO = aU + aY;
                            continue;
                        }
                    }
                    if (a2 == null || a1 == null) {
                        continue;
                    }
                    if (a2 <= a1 && a2 < aT.min) {
                        if (a1 < aT.min) {
                            continue;
                        }
                        aN = (aT.min - a2) / (a1 - a2) * (aM - aN) + aN;
                        a2 = aT.min;
                    } else {
                        if (a1 <= a2 && a1 < aT.min) {
                            if (a2 < aT.min) {
                                continue;
                            }
                            aM = (aT.min - a2) / (a1 - a2) * (aM - aN) + aN;
                            a1 = aT.min;
                        }
                    }
                    if (a2 >= a1 && a2 > aT.max) {
                        if (a1 > aT.max) {
                            continue;
                        }
                        aN = (aT.max - a2) / (a1 - a2) * (aM - aN) + aN;
                        a2 = aT.max;
                    } else {
                        if (a1 >= a2 && a1 > aT.max) {
                            if (a2 > aT.max) {
                                continue;
                            }
                            aM = (aT.max - a2) / (a1 - a2) * (aM - aN) + aN;
                            a1 = aT.max;
                        }
                    }
                    if (!aW) {
                        K.beginPath();
                        K.moveTo(aT.p2c(a2), aS.p2c(aQ));
                        aW = true;
                    }
                    if (aN >= aS.max && aM >= aS.max) {
                        K.lineTo(aT.p2c(a2), aS.p2c(aS.max));
                        K.lineTo(aT.p2c(a1), aS.p2c(aS.max));
                        continue;
                    } else {
                        if (aN <= aS.min && aM <= aS.min) {
                            K.lineTo(aT.p2c(a2), aS.p2c(aS.min));
                            K.lineTo(aT.p2c(a1), aS.p2c(aS.min));
                            continue;
                        }
                    }
                    var aR = a2, aV = a1;
                    if (aN <= aM && aN < aS.min && aM >= aS.min) {
                        a2 = (aS.min - aN) / (aM - aN) * (a1 - a2) + a2;
                        aN = aS.min;
                    } else {
                        if (aM <= aN && aM < aS.min && aN >= aS.min) {
                            a1 = (aS.min - aN) / (aM - aN) * (a1 - a2) + a2;
                            aM = aS.min;
                        }
                    }
                    if (aN >= aM && aN > aS.max && aM <= aS.max) {
                        a2 = (aS.max - aN) / (aM - aN) * (a1 - a2) + a2;
                        aN = aS.max;
                    } else {
                        if (aM >= aN && aM > aS.max && aN <= aS.max) {
                            a1 = (aS.max - aN) / (aM - aN) * (a1 - a2) + a2;
                            aM = aS.max;
                        }
                    }
                    if (a2 != aR) {
                        K.lineTo(aT.p2c(aR), aS.p2c(aN));
                    }
                    K.lineTo(aT.p2c(a2), aS.p2c(aN));
                    K.lineTo(aT.p2c(a1), aS.p2c(aM));
                    if (a1 != aV) {
                        K.lineTo(aT.p2c(a1), aS.p2c(aM));
                        K.lineTo(aT.p2c(aV), aS.p2c(aM));
                    }
                }
            }
            K.save();
            K.translate(r.left, r.top);
            K.lineJoin = "round";
            var aJ = aH.lines.lineWidth, aE = aH.shadowSize;
            if (aJ > 0 && aE > 0) {
                K.lineWidth = aE;
                K.strokeStyle = "rgba(0,0,0,0.1)";
                var aK = Math.PI / 18;
                aG(aH.datapoints, Math.sin(aK) * (aJ / 2 + aE / 2), Math.cos(aK) * (aJ / 2 + aE / 2), aH.xaxis, aH.yaxis);
                K.lineWidth = aE / 2;
                aG(aH.datapoints, Math.sin(aK) * (aJ / 2 + aE / 4), Math.cos(aK) * (aJ / 2 + aE / 4), aH.xaxis, aH.yaxis);
            }
            K.lineWidth = aJ;
            K.strokeStyle = aH.color;
            var aF = ah(aH.lines, aH.color, 0, z);
            if (aF) {
                K.fillStyle = aF;
                aI(aH.datapoints, aH.xaxis, aH.yaxis);
            }
            if (aJ > 0) {
                aG(aH.datapoints, 0, 0, aH.xaxis, aH.yaxis);
            }
            K.restore();
        }
        function ar(aH) {
            function aK(aQ, aP, aX, aN, aV, aW, aT, aM) {
                var aU = aQ.points, aL = aQ.pointsize;
                for (var aO = 0; aO < aU.length; aO += aL) {
                    var aS = aU[aO], aR = aU[aO + 1];
                    if (aS == null || aS < aW.min || aS > aW.max || aR < aT.min || aR > aT.max) {
                        continue;
                    }
                    K.beginPath();
                    aS = aW.p2c(aS);
                    aR = aT.p2c(aR) + aN;
                    if (aM == "circle") {
                        K.arc(aS, aR, aP, 0, aV ? Math.PI : Math.PI * 2, false);
                    } else {
                        aM(K, aS, aR, aP, aV);
                    }
                    K.closePath();
                    if (aX) {
                        K.fillStyle = aX;
                        K.fill();
                    }
                    K.stroke();
                }
            }
            K.save();
            K.translate(r.left, r.top);
            var aJ = aH.points.lineWidth, aF = aH.shadowSize, aE = aH.points.radius, aI = aH.points.symbol;
            if (aJ > 0 && aF > 0) {
                var aG = aF / 2;
                K.lineWidth = aG;
                K.strokeStyle = "rgba(0,0,0,0.1)";
                aK(aH.datapoints, aE, null, aG + aG / 2, true, aH.xaxis, aH.yaxis, aI);
                K.strokeStyle = "rgba(0,0,0,0.2)";
                aK(aH.datapoints, aE, null, aG / 2, true, aH.xaxis, aH.yaxis, aI);
            }
            K.lineWidth = aJ;
            K.strokeStyle = aH.color;
            aK(aH.datapoints, aE, ah(aH.points, aH.color), 0, false, aH.xaxis, aH.yaxis, aI);
            K.restore();
        }
        function H(aQ, aP, aY, aL, aT, aI, aG, aO, aN, aX, aU, aF) {
            var aH, aW, aM, aS, aJ, aE, aR, aK, aV;
            if (aU) {
                aK = aE = aR = true;
                aJ = false;
                aH = aY;
                aW = aQ;
                aS = aP + aL;
                aM = aP + aT;
                if (aW < aH) {
                    aV = aW;
                    aW = aH;
                    aH = aV;
                    aJ = true;
                    aE = false;
                }
            } else {
                aJ = aE = aR = true;
                aK = false;
                aH = aQ + aL;
                aW = aQ + aT;
                aM = aY;
                aS = aP;
                if (aS < aM) {
                    aV = aS;
                    aS = aM;
                    aM = aV;
                    aK = true;
                    aR = false;
                }
            }
            if (aW < aO.min || aH > aO.max || aS < aN.min || aM > aN.max) {
                return;
            }
            if (aH < aO.min) {
                aH = aO.min;
                aJ = false;
            }
            if (aW > aO.max) {
                aW = aO.max;
                aE = false;
            }
            if (aM < aN.min) {
                aM = aN.min;
                aK = false;
            }
            if (aS > aN.max) {
                aS = aN.max;
                aR = false;
            }
            aH = aO.p2c(aH);
            aM = aN.p2c(aM);
            aW = aO.p2c(aW);
            aS = aN.p2c(aS);
            if (aG) {
                aX.beginPath();
                aX.moveTo(aH, aM);
                aX.lineTo(aH, aS);
                aX.lineTo(aW, aS);
                aX.lineTo(aW, aM);
                aX.fillStyle = aG(aM, aS);
                aX.fill();
            }
            if (aF > 0 && (aJ || aE || aR || aK)) {
                aX.beginPath();
                aX.moveTo(aH, aM + aI);
                if (aJ) {
                    aX.lineTo(aH, aS + aI);
                } else {
                    aX.moveTo(aH, aS + aI);
                }
                if (aR) {
                    aX.lineTo(aW, aS + aI);
                } else {
                    aX.moveTo(aW, aS + aI);
                }
                if (aE) {
                    aX.lineTo(aW, aM + aI);
                } else {
                    aX.moveTo(aW, aM + aI);
                }
                if (aK) {
                    aX.lineTo(aH, aM + aI);
                } else {
                    aX.moveTo(aH, aM + aI);
                }
                aX.stroke();
            }
        }
        function e(aG) {
            function aF(aM, aL, aO, aJ, aN, aQ, aP) {
                var aR = aM.points, aI = aM.pointsize;
                for (var aK = 0; aK < aR.length; aK += aI) {
                    if (aR[aK] == null) {
                        continue;
                    }
                    H(aR[aK], aR[aK + 1], aR[aK + 2], aL, aO, aJ, aN, aQ, aP, K, aG.bars.horizontal, aG.bars.lineWidth);
                }
            }
            K.save();
            K.translate(r.left, r.top);
            K.lineWidth = aG.bars.lineWidth;
            K.strokeStyle = aG.color;
            var aE = aG.bars.align == "left" ? 0 : -aG.bars.barWidth / 2;
            var aH = aG.bars.fill ? function(aI, aJ) {
                return ah(aG.bars, aG.color, aI, aJ);
            } : null;
            aF(aG.datapoints, aE, aE + aG.bars.barWidth, 0, aH, aG.xaxis, aG.yaxis);
            K.restore();
        }
        function ah(aG, aE, aF, aI) {
            var aH = aG.fill;
            if (!aH) {
                return null;
            }
            if (aG.fillColor) {
                return ap(aG.fillColor, aF, aI, aE);
            }
            var aJ = c.color.parse(aE);
            aJ.a = typeof aH == "number" ? aH : .4;
            aJ.normalize();
            return aJ.toString();
        }
        function o() {
            ay.find(".legend").remove();
            if (!R.legend.show) {
                return;
            }
            var aK = [], aI = false, aQ = R.legend.labelFormatter, aP, aM;
            for (var aH = 0; aH < T.length; ++aH) {
                aP = T[aH];
                aM = aP.label;
                if (!aM) {
                    continue;
                }
                if (aH % R.legend.noColumns == 0) {
                    if (aI) {
                        aK.push("</tr>");
                    }
                    aK.push("<tr>");
                    aI = true;
                }
                if (aQ) {
                    aM = aQ(aM, aP);
                }
                aK.push('<td class="legendColorBox"><div style="border:1px solid ' + R.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + aP.color + ';overflow:hidden"></div></div></td><td class="legendLabel">' + aM + "</td>");
            }
            if (aI) {
                aK.push("</tr>");
            }
            if (aK.length == 0) {
                return;
            }
            var aO = '<table style="font-size:smaller;color:' + R.grid.color + '">' + aK.join("") + "</table>";
            if (R.legend.container != null) {
                c(R.legend.container).html(aO);
            } else {
                var aL = "", aF = R.legend.position, aG = R.legend.margin;
                if (aG[0] == null) {
                    aG = [ aG, aG ];
                }
                if (aF.charAt(0) == "n") {
                    aL += "top:" + (aG[1] + r.top) + "px;";
                } else {
                    if (aF.charAt(0) == "s") {
                        aL += "bottom:" + (aG[1] + r.bottom) + "px;";
                    }
                }
                if (aF.charAt(1) == "e") {
                    aL += "right:" + (aG[0] + r.right) + "px;";
                } else {
                    if (aF.charAt(1) == "w") {
                        aL += "left:" + (aG[0] + r.left) + "px;";
                    }
                }
                var aN = c('<div class="legend">' + aO.replace('style="', 'style="position:absolute;' + aL + ";") + "</div>").appendTo(ay);
                if (R.legend.backgroundOpacity != 0) {
                    var aJ = R.legend.backgroundColor;
                    if (aJ == null) {
                        aJ = R.grid.backgroundColor;
                        if (aJ && typeof aJ == "string") {
                            aJ = c.color.parse(aJ);
                        } else {
                            aJ = c.color.extract(aN, "background-color");
                        }
                        aJ.a = 1;
                        aJ = aJ.toString();
                    }
                    var aE = aN.children();
                    c('<div style="position:absolute;width:' + aE.width() + "px;height:" + aE.height() + "px;" + aL + "background-color:" + aJ + ';"> </div>').prependTo(aN).css("opacity", R.legend.backgroundOpacity);
                }
            }
        }
        var ae = [], P = null;
        function N(aL, aJ, aG) {
            var aR = R.grid.mouseActiveRadius, a3 = aR * aR + 1, a1 = null, aU = false, aZ, aX;
            for (aZ = T.length - 1; aZ >= 0; --aZ) {
                if (!aG(T[aZ])) {
                    continue;
                }
                var aS = T[aZ], aK = aS.xaxis, aI = aS.yaxis, aY = aS.datapoints.points, aW = aS.datapoints.pointsize, aT = aK.c2p(aL), aQ = aI.c2p(aJ), aF = aR / aK.scale, aE = aR / aI.scale;
                if (aK.options.inverseTransform) {
                    aF = Number.MAX_VALUE;
                }
                if (aI.options.inverseTransform) {
                    aE = Number.MAX_VALUE;
                }
                if (aS.lines.show || aS.points.show) {
                    for (aX = 0; aX < aY.length; aX += aW) {
                        var aN = aY[aX], aM = aY[aX + 1];
                        if (aN == null) {
                            continue;
                        }
                        if (aN - aT > aF || aN - aT < -aF || aM - aQ > aE || aM - aQ < -aE) {
                            continue;
                        }
                        var aP = Math.abs(aK.p2c(aN) - aL), aO = Math.abs(aI.p2c(aM) - aJ), aV = aP * aP + aO * aO;
                        if (aV < a3) {
                            a3 = aV;
                            a1 = [ aZ, aX / aW ];
                        }
                    }
                }
                if (aS.bars.show && !a1) {
                    var aH = aS.bars.align == "left" ? 0 : -aS.bars.barWidth / 2, a0 = aH + aS.bars.barWidth;
                    for (aX = 0; aX < aY.length; aX += aW) {
                        var aN = aY[aX], aM = aY[aX + 1], a2 = aY[aX + 2];
                        if (aN == null) {
                            continue;
                        }
                        if (T[aZ].bars.horizontal ? aT <= Math.max(a2, aN) && aT >= Math.min(a2, aN) && aQ >= aM + aH && aQ <= aM + a0 : aT >= aN + aH && aT <= aN + a0 && aQ >= Math.min(a2, aM) && aQ <= Math.max(a2, aM)) {
                            a1 = [ aZ, aX / aW ];
                        }
                    }
                }
            }
            if (a1) {
                aZ = a1[0];
                aX = a1[1];
                aW = T[aZ].datapoints.pointsize;
                return {
                    datapoint: T[aZ].datapoints.points.slice(aX * aW, (aX + 1) * aW),
                    dataIndex: aX,
                    series: T[aZ],
                    seriesIndex: aZ
                };
            }
            return null;
        }
        function ad(aE) {
            if (R.grid.hoverable) {
                v("plothover", aE, function(aF) {
                    return aF.hoverable != false;
                });
            }
        }
        function l(aE) {
            if (R.grid.hoverable) {
                v("plothover", aE, function(aF) {
                    return false;
                });
            }
        }
        function U(aE) {
            v("plotclick", aE, function(aF) {
                return aF.clickable != false;
            });
        }
        function v(aF, aE, aG) {
            var aH = B.offset(), aK = aE.pageX - aH.left - r.left, aI = aE.pageY - aH.top - r.top, aM = F({
                left: aK,
                top: aI
            });
            aM.pageX = aE.pageX;
            aM.pageY = aE.pageY;
            var aN = N(aK, aI, aG);
            if (aN) {
                aN.pageX = parseInt(aN.series.xaxis.p2c(aN.datapoint[0]) + aH.left + r.left);
                aN.pageY = parseInt(aN.series.yaxis.p2c(aN.datapoint[1]) + aH.top + r.top);
            }
            if (R.grid.autoHighlight) {
                for (var aJ = 0; aJ < ae.length; ++aJ) {
                    var aL = ae[aJ];
                    if (aL.auto == aF && !(aN && aL.series == aN.series && aL.point[0] == aN.datapoint[0] && aL.point[1] == aN.datapoint[1])) {
                        W(aL.series, aL.point);
                    }
                }
                if (aN) {
                    A(aN.series, aN.datapoint, aF);
                }
            }
            ay.trigger(aF, [ aM, aN ]);
        }
        function f() {
            if (!P) {
                P = setTimeout(t, 30);
            }
        }
        function t() {
            P = null;
            D.save();
            D.clearRect(0, 0, J, L);
            D.translate(r.left, r.top);
            var aF, aE;
            for (aF = 0; aF < ae.length; ++aF) {
                aE = ae[aF];
                if (aE.series.bars.show) {
                    w(aE.series, aE.point);
                } else {
                    aB(aE.series, aE.point);
                }
            }
            D.restore();
            aq(an.drawOverlay, [ D ]);
        }
        function A(aG, aE, aI) {
            if (typeof aG == "number") {
                aG = T[aG];
            }
            if (typeof aE == "number") {
                var aH = aG.datapoints.pointsize;
                aE = aG.datapoints.points.slice(aH * aE, aH * (aE + 1));
            }
            var aF = ao(aG, aE);
            if (aF == -1) {
                ae.push({
                    series: aG,
                    point: aE,
                    auto: aI
                });
                f();
            } else {
                if (!aI) {
                    ae[aF].auto = false;
                }
            }
        }
        function W(aG, aE) {
            if (aG == null && aE == null) {
                ae = [];
                f();
            }
            if (typeof aG == "number") {
                aG = T[aG];
            }
            if (typeof aE == "number") {
                aE = aG.data[aE];
            }
            var aF = ao(aG, aE);
            if (aF != -1) {
                ae.splice(aF, 1);
                f();
            }
        }
        function ao(aG, aH) {
            for (var aE = 0; aE < ae.length; ++aE) {
                var aF = ae[aE];
                if (aF.series == aG && aF.point[0] == aH[0] && aF.point[1] == aH[1]) {
                    return aE;
                }
            }
            return -1;
        }
        function aB(aH, aG) {
            var aF = aG[0], aL = aG[1], aK = aH.xaxis, aJ = aH.yaxis;
            if (aF < aK.min || aF > aK.max || aL < aJ.min || aL > aJ.max) {
                return;
            }
            var aI = aH.points.radius + aH.points.lineWidth / 2;
            D.lineWidth = aI;
            D.strokeStyle = c.color.parse(aH.color).scale("a", .5).toString();
            var aE = 1.5 * aI, aF = aK.p2c(aF), aL = aJ.p2c(aL);
            D.beginPath();
            if (aH.points.symbol == "circle") {
                D.arc(aF, aL, aE, 0, 2 * Math.PI, false);
            } else {
                aH.points.symbol(D, aF, aL, aE, false);
            }
            D.closePath();
            D.stroke();
        }
        function w(aH, aE) {
            D.lineWidth = aH.bars.lineWidth;
            D.strokeStyle = c.color.parse(aH.color).scale("a", .5).toString();
            var aG = c.color.parse(aH.color).scale("a", .5).toString();
            var aF = aH.bars.align == "left" ? 0 : -aH.bars.barWidth / 2;
            H(aE[0], aE[1], aE[2] || 0, aF, aF + aH.bars.barWidth, 0, function() {
                return aG;
            }, aH.xaxis, aH.yaxis, D, aH.bars.horizontal, aH.bars.lineWidth);
        }
        function ap(aM, aE, aK, aF) {
            if (typeof aM == "string") {
                return aM;
            } else {
                var aL = K.createLinearGradient(0, aK, 0, aE);
                for (var aH = 0, aG = aM.colors.length; aH < aG; ++aH) {
                    var aI = aM.colors[aH];
                    if (typeof aI != "string") {
                        var aJ = c.color.parse(aF);
                        if (aI.brightness != null) {
                            aJ = aJ.scale("rgb", aI.brightness);
                        }
                        if (aI.opacity != null) {
                            aJ.a *= aI.opacity;
                        }
                        aI = aJ.toString();
                    }
                    aL.addColorStop(aH / (aG - 1), aI);
                }
                return aL;
            }
        }
    }
    c.plot = function(g, e, d) {
        var f = new b(c(g), e, d, c.plot.plugins);
        return f;
    };
    c.plot.version = "0.7";
    c.plot.plugins = [];
    c.plot.formatDate = function(l, f, h) {
        var o = function(d) {
            d = "" + d;
            return d.length == 1 ? "0" + d : d;
        };
        var e = [];
        var p = false, j = false;
        var n = l.getUTCHours();
        var k = n < 12;
        if (h == null) {
            h = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        }
        if (f.search(/%p|%P/) != -1) {
            if (n > 12) {
                n = n - 12;
            } else {
                if (n == 0) {
                    n = 12;
                }
            }
        }
        for (var g = 0; g < f.length; ++g) {
            var m = f.charAt(g);
            if (p) {
                switch (m) {
                  case "h":
                    m = "" + n;
                    break;

                  case "H":
                    m = o(n);
                    break;

                  case "M":
                    m = o(l.getUTCMinutes());
                    break;

                  case "S":
                    m = o(l.getUTCSeconds());
                    break;

                  case "d":
                    m = "" + l.getUTCDate();
                    break;

                  case "m":
                    m = "" + (l.getUTCMonth() + 1);
                    break;

                  case "y":
                    m = "" + l.getUTCFullYear();
                    break;

                  case "b":
                    m = "" + h[l.getUTCMonth()];
                    break;

                  case "p":
                    m = k ? "am" : "pm";
                    break;

                  case "P":
                    m = k ? "AM" : "PM";
                    break;

                  case "0":
                    m = "";
                    j = true;
                    break;
                }
                if (m && j) {
                    m = o(m);
                    j = false;
                }
                e.push(m);
                if (!j) {
                    p = false;
                }
            } else {
                if (m == "%") {
                    p = true;
                } else {
                    e.push(m);
                }
            }
        }
        return e.join("");
    };
    function a(e, d) {
        return d * Math.floor(e / d);
    }
})(jQuery);

(function(b) {
    function c(E) {
        var h = null;
        var M = null;
        var n = null;
        var C = null;
        var p = null;
        var N = 0;
        var G = true;
        var o = 10;
        var z = .95;
        var B = 0;
        var d = false;
        var A = false;
        var j = [];
        E.hooks.processOptions.push(g);
        E.hooks.bindEvents.push(e);
        function g(P, O) {
            if (O.series.pie.show) {
                O.grid.show = false;
                if (O.series.pie.label.show == "auto") {
                    if (O.legend.show) {
                        O.series.pie.label.show = false;
                    } else {
                        O.series.pie.label.show = true;
                    }
                }
                if (O.series.pie.radius == "auto") {
                    if (O.series.pie.label.show) {
                        O.series.pie.radius = 3 / 4;
                    } else {
                        O.series.pie.radius = 1;
                    }
                }
                if (O.series.pie.tilt > 1) {
                    O.series.pie.tilt = 1;
                }
                if (O.series.pie.tilt < 0) {
                    O.series.pie.tilt = 0;
                }
                P.hooks.processDatapoints.push(F);
                P.hooks.drawOverlay.push(I);
                P.hooks.draw.push(s);
            }
        }
        function e(Q, O) {
            var P = Q.getOptions();
            if (P.series.pie.show && P.grid.hoverable) {
                O.unbind("mousemove").mousemove(u);
            }
            if (P.series.pie.show && P.grid.clickable) {
                O.unbind("click").click(l);
            }
        }
        function H(P) {
            var Q = "";
            function O(T, U) {
                if (!U) {
                    U = 0;
                }
                for (var S = 0; S < T.length; ++S) {
                    for (var R = 0; R < U; R++) {
                        Q += "\t";
                    }
                    if (typeof T[S] == "object") {
                        Q += "" + S + ":\n";
                        O(T[S], U + 1);
                    } else {
                        Q += "" + S + ": " + T[S] + "\n";
                    }
                }
            }
            O(P);
            alert(Q);
        }
        function r(Q) {
            for (var O = 0; O < Q.length; ++O) {
                var P = parseFloat(Q[O].data[0][1]);
                if (P) {
                    N += P;
                }
            }
        }
        function F(R, O, P, Q) {
            if (!d) {
                d = true;
                h = R.getCanvas();
                M = b(h).parent();
                a = R.getOptions();
                R.setData(L(R.getData()));
            }
        }
        function J() {
            B = M.children().filter(".legend").children().width();
            n = Math.min(h.width, h.height / a.series.pie.tilt) / 2;
            p = h.height / 2 + a.series.pie.offset.top;
            C = h.width / 2;
            if (a.series.pie.offset.left == "auto") {
                if (a.legend.position.match("w")) {
                    C += B / 2;
                } else {
                    C -= B / 2;
                }
            } else {
                C += a.series.pie.offset.left;
            }
            if (C < n) {
                C = n;
            } else {
                if (C > h.width - n) {
                    C = h.width - n;
                }
            }
        }
        function w(P) {
            for (var O = 0; O < P.length; ++O) {
                if (typeof P[O].data == "number") {
                    P[O].data = [ [ 1, P[O].data ] ];
                } else {
                    if (typeof P[O].data == "undefined" || typeof P[O].data[0] == "undefined") {
                        if (typeof P[O].data != "undefined" && typeof P[O].data.label != "undefined") {
                            P[O].label = P[O].data.label;
                        }
                        P[O].data = [ [ 1, 0 ] ];
                    }
                }
            }
            return P;
        }
        function L(R) {
            R = w(R);
            r(R);
            var Q = 0;
            var T = 0;
            var O = a.series.pie.combine.color;
            var S = [];
            for (var P = 0; P < R.length; ++P) {
                R[P].data[0][1] = parseFloat(R[P].data[0][1]);
                if (!R[P].data[0][1]) {
                    R[P].data[0][1] = 0;
                }
                if (R[P].data[0][1] / N <= a.series.pie.combine.threshold) {
                    Q += R[P].data[0][1];
                    T++;
                    if (!O) {
                        O = R[P].color;
                    }
                } else {
                    S.push({
                        data: [ [ 1, R[P].data[0][1] ] ],
                        color: R[P].color,
                        label: R[P].label,
                        angle: R[P].data[0][1] * (Math.PI * 2) / N,
                        percent: R[P].data[0][1] / N * 100
                    });
                }
            }
            if (T > 0) {
                S.push({
                    data: [ [ 1, Q ] ],
                    color: O,
                    label: a.series.pie.combine.label,
                    angle: Q * (Math.PI * 2) / N,
                    percent: Q / N * 100
                });
            }
            return S;
        }
        function s(T, R) {
            if (!M) {
                return;
            }
            ctx = R;
            J();
            var U = T.getData();
            var Q = 0;
            G = true;
            while (G && Q < o) {
                G = false;
                if (Q > 0) {
                    n *= z;
                }
                Q += 1;
                O();
                if (a.series.pie.tilt <= .8) {
                    P();
                }
                S();
            }
            if (Q >= o) {
                O();
                M.prepend('<div class="error">Could not draw pie with labels contained inside canvas</div>');
            }
            if (T.setSeries && T.insertLegend) {
                T.setSeries(U);
                T.insertLegend();
            }
            function O() {
                ctx.clearRect(0, 0, h.width, h.height);
                M.children().filter(".pieLabel, .pieLabelBackground").remove();
            }
            function P() {
                var aa = 5;
                var Z = 15;
                var X = 10;
                var Y = .02;
                if (a.series.pie.radius > 1) {
                    var V = a.series.pie.radius;
                } else {
                    var V = n * a.series.pie.radius;
                }
                if (V >= h.width / 2 - aa || V * a.series.pie.tilt >= h.height / 2 - Z || V <= X) {
                    return;
                }
                ctx.save();
                ctx.translate(aa, Z);
                ctx.globalAlpha = Y;
                ctx.fillStyle = "#000";
                ctx.translate(C, p);
                ctx.scale(1, a.series.pie.tilt);
                for (var W = 1; W <= X; W++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, V, 0, Math.PI * 2, false);
                    ctx.fill();
                    V -= W;
                }
                ctx.restore();
            }
            function S() {
                startAngle = Math.PI * a.series.pie.startAngle;
                if (a.series.pie.radius > 1) {
                    var V = a.series.pie.radius;
                } else {
                    var V = n * a.series.pie.radius;
                }
                ctx.save();
                ctx.translate(C, p);
                ctx.scale(1, a.series.pie.tilt);
                ctx.save();
                var Z = startAngle;
                for (var X = 0; X < U.length; ++X) {
                    U[X].startAngle = Z;
                    Y(U[X].angle, U[X].color, true);
                }
                ctx.restore();
                ctx.save();
                ctx.lineWidth = a.series.pie.stroke.width;
                Z = startAngle;
                for (var X = 0; X < U.length; ++X) {
                    Y(U[X].angle, a.series.pie.stroke.color, false);
                }
                ctx.restore();
                K(ctx);
                if (a.series.pie.label.show) {
                    W();
                }
                ctx.restore();
                function Y(ac, aa, ab) {
                    if (ac <= 0) {
                        return;
                    }
                    if (ab) {
                        ctx.fillStyle = aa;
                    } else {
                        ctx.strokeStyle = aa;
                        ctx.lineJoin = "round";
                    }
                    ctx.beginPath();
                    if (Math.abs(ac - Math.PI * 2) > 1e-9) {
                        ctx.moveTo(0, 0);
                    } else {
                        if (b.browser.msie) {
                            ac -= 1e-4;
                        }
                    }
                    ctx.arc(0, 0, V, Z, Z + ac, false);
                    ctx.closePath();
                    Z += ac;
                    if (ab) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                }
                function W() {
                    var ad = startAngle;
                    if (a.series.pie.label.radius > 1) {
                        var aa = a.series.pie.label.radius;
                    } else {
                        var aa = n * a.series.pie.label.radius;
                    }
                    for (var ac = 0; ac < U.length; ++ac) {
                        if (U[ac].percent >= a.series.pie.label.threshold * 100) {
                            ab(U[ac], ad, ac);
                        }
                        ad += U[ac].angle;
                    }
                    function ab(aq, aj, ah) {
                        if (aq.data[0][1] == 0) {
                            return;
                        }
                        var at = a.legend.labelFormatter, ar, af = a.series.pie.label.formatter;
                        if (at) {
                            ar = at(aq.label, aq);
                        } else {
                            ar = aq.label;
                        }
                        if (af) {
                            ar = af(ar, aq);
                        }
                        var ak = (aj + aq.angle + aj) / 2;
                        var ap = C + Math.round(Math.cos(ak) * aa);
                        var an = p + Math.round(Math.sin(ak) * aa) * a.series.pie.tilt;
                        var ag = '<span class="pieLabel" id="pieLabel' + ah + '" style="position:absolute;top:' + an + "px;left:" + ap + 'px;">' + ar + "</span>";
                        M.append(ag);
                        var ao = M.children("#pieLabel" + ah);
                        var ae = an - ao.height() / 2;
                        var ai = ap - ao.width() / 2;
                        ao.css("top", ae);
                        ao.css("left", ai);
                        if (0 - ae > 0 || 0 - ai > 0 || h.height - (ae + ao.height()) < 0 || h.width - (ai + ao.width()) < 0) {
                            G = true;
                        }
                        if (a.series.pie.label.background.opacity != 0) {
                            var al = a.series.pie.label.background.color;
                            if (al == null) {
                                al = aq.color;
                            }
                            var am = "top:" + ae + "px;left:" + ai + "px;";
                            b('<div class="pieLabelBackground" style="position:absolute;width:' + ao.width() + "px;height:" + ao.height() + "px;" + am + "background-color:" + al + ';"> </div>').insertBefore(ao).css("opacity", a.series.pie.label.background.opacity);
                        }
                    }
                }
            }
        }
        function K(O) {
            if (a.series.pie.innerRadius > 0) {
                O.save();
                innerRadius = a.series.pie.innerRadius > 1 ? a.series.pie.innerRadius : n * a.series.pie.innerRadius;
                O.globalCompositeOperation = "destination-out";
                O.beginPath();
                O.fillStyle = a.series.pie.stroke.color;
                O.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
                O.fill();
                O.closePath();
                O.restore();
                O.save();
                O.beginPath();
                O.strokeStyle = a.series.pie.stroke.color;
                O.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
                O.stroke();
                O.closePath();
                O.restore();
            }
        }
        function t(R, S) {
            for (var T = false, Q = -1, O = R.length, P = O - 1; ++Q < O; P = Q) {
                (R[Q][1] <= S[1] && S[1] < R[P][1] || R[P][1] <= S[1] && S[1] < R[Q][1]) && S[0] < (R[P][0] - R[Q][0]) * (S[1] - R[Q][1]) / (R[P][1] - R[Q][1]) + R[Q][0] && (T = !T);
            }
            return T;
        }
        function v(S, Q) {
            var U = E.getData(), P = E.getOptions(), O = P.series.pie.radius > 1 ? P.series.pie.radius : n * P.series.pie.radius;
            for (var R = 0; R < U.length; ++R) {
                var T = U[R];
                if (T.pie.show) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, O, T.startAngle, T.startAngle + T.angle, false);
                    ctx.closePath();
                    x = S - C;
                    y = Q - p;
                    if (ctx.isPointInPath) {
                        if (ctx.isPointInPath(S - C, Q - p)) {
                            ctx.restore();
                            return {
                                datapoint: [ T.percent, T.data ],
                                dataIndex: 0,
                                series: T,
                                seriesIndex: R
                            };
                        }
                    } else {
                        p1X = O * Math.cos(T.startAngle);
                        p1Y = O * Math.sin(T.startAngle);
                        p2X = O * Math.cos(T.startAngle + T.angle / 4);
                        p2Y = O * Math.sin(T.startAngle + T.angle / 4);
                        p3X = O * Math.cos(T.startAngle + T.angle / 2);
                        p3Y = O * Math.sin(T.startAngle + T.angle / 2);
                        p4X = O * Math.cos(T.startAngle + T.angle / 1.5);
                        p4Y = O * Math.sin(T.startAngle + T.angle / 1.5);
                        p5X = O * Math.cos(T.startAngle + T.angle);
                        p5Y = O * Math.sin(T.startAngle + T.angle);
                        arrPoly = [ [ 0, 0 ], [ p1X, p1Y ], [ p2X, p2Y ], [ p3X, p3Y ], [ p4X, p4Y ], [ p5X, p5Y ] ];
                        arrPoint = [ x, y ];
                        if (t(arrPoly, arrPoint)) {
                            ctx.restore();
                            return {
                                datapoint: [ T.percent, T.data ],
                                dataIndex: 0,
                                series: T,
                                seriesIndex: R
                            };
                        }
                    }
                    ctx.restore();
                }
            }
            return null;
        }
        function u(O) {
            m("plothover", O);
        }
        function l(O) {
            m("plotclick", O);
        }
        function m(O, U) {
            var P = E.offset(), S = parseInt(U.pageX - P.left), Q = parseInt(U.pageY - P.top), W = v(S, Q);
            if (a.grid.autoHighlight) {
                for (var R = 0; R < j.length; ++R) {
                    var T = j[R];
                    if (T.auto == O && !(W && T.series == W.series)) {
                        f(T.series);
                    }
                }
            }
            if (W) {
                k(W.series, O);
            }
            var V = {
                pageX: U.pageX,
                pageY: U.pageY
            };
            M.trigger(O, [ V, W ]);
        }
        function k(P, Q) {
            if (typeof P == "number") {
                P = series[P];
            }
            var O = D(P);
            if (O == -1) {
                j.push({
                    series: P,
                    auto: Q
                });
                E.triggerRedrawOverlay();
            } else {
                if (!Q) {
                    j[O].auto = false;
                }
            }
        }
        function f(P) {
            if (P == null) {
                j = [];
                E.triggerRedrawOverlay();
            }
            if (typeof P == "number") {
                P = series[P];
            }
            var O = D(P);
            if (O != -1) {
                j.splice(O, 1);
                E.triggerRedrawOverlay();
            }
        }
        function D(Q) {
            for (var O = 0; O < j.length; ++O) {
                var P = j[O];
                if (P.series == Q) {
                    return O;
                }
            }
            return -1;
        }
        function I(R, S) {
            var Q = R.getOptions();
            var O = Q.series.pie.radius > 1 ? Q.series.pie.radius : n * Q.series.pie.radius;
            S.save();
            S.translate(C, p);
            S.scale(1, Q.series.pie.tilt);
            for (i = 0; i < j.length; ++i) {
                P(j[i].series);
            }
            K(S);
            S.restore();
            function P(T) {
                if (T.angle < 0) {
                    return;
                }
                S.fillStyle = "rgba(255, 255, 255, " + Q.series.pie.highlight.opacity + ")";
                S.beginPath();
                if (Math.abs(T.angle - Math.PI * 2) > 1e-9) {
                    S.moveTo(0, 0);
                }
                S.arc(0, 0, O, T.startAngle, T.startAngle + T.angle, false);
                S.closePath();
                S.fill();
            }
        }
    }
    var a = {
        series: {
            pie: {
                show: false,
                radius: "auto",
                innerRadius: 0,
                startAngle: 3 / 2,
                tilt: 1,
                offset: {
                    top: 0,
                    left: "auto"
                },
                stroke: {
                    color: "#FFF",
                    width: 1
                },
                label: {
                    show: "auto",
                    formatter: function(d, e) {
                        return '<div style="font-size:x-small;text-align:center;padding:2px;color:' + e.color + ';">' + d + "<br/>" + Math.round(e.percent) + "%</div>";
                    },
                    radius: 1,
                    background: {
                        color: null,
                        opacity: 0
                    },
                    threshold: 0
                },
                combine: {
                    threshold: -1,
                    color: null,
                    label: "Other"
                },
                highlight: {
                    opacity: .5
                }
            }
        }
    };
    b.plot.plugins.push({
        init: c,
        options: a,
        name: "pie",
        version: "1.0"
    });
})(jQuery);

function fuelTextExactCI(a, b) {
    return (a.textContent || a.innerText || $(a).text() || "").toLowerCase() === (b || "").toLowerCase();
}

$.expr[":"].fuelTextExactCI = $.expr.createPseudo ? $.expr.createPseudo(function(a) {
    return function(b) {
        return fuelTextExactCI(b, a);
    };
}) : function(c, b, a) {
    return fuelTextExactCI(c, a[3]);
};

var Checkbox = function(b, a) {
    this.$element = $(b);
    this.options = $.extend({}, $.fn.checkbox.defaults, a);
    this.$label = this.$element.parent();
    this.$icon = this.$label.find("i");
    this.$chk = this.$label.find("input[type=checkbox]");
    this.setState(this.$chk);
    this.$chk.on("change", $.proxy(this.itemchecked, this));
};

Checkbox.prototype = {
    constructor: Checkbox,
    setState: function(a) {
        var c = a.is(":checked");
        var b = a.is(":disabled");
        this.$icon.removeClass("checked").removeClass("disabled");
        if (c === true) {
            this.$icon.addClass("checked");
        }
        if (b === true) {
            this.$icon.addClass("disabled");
        }
    },
    enable: function() {
        this.$chk.attr("disabled", false);
        this.$icon.removeClass("disabled");
    },
    disable: function() {
        this.$chk.attr("disabled", true);
        this.$icon.addClass("disabled");
    },
    toggle: function() {
        this.$chk.click();
    },
    itemchecked: function(b) {
        var a = $(b.target);
        this.setState(a);
    }
};

$.fn.checkbox = function(b, d) {
    var c;
    var a = this.each(function() {
        var g = $(this);
        var f = g.data("checkbox");
        var e = typeof b === "object" && b;
        if (!f) {
            g.data("checkbox", f = new Checkbox(this, e));
        }
        if (typeof b === "string") {
            c = f[b](d);
        }
    });
    return c === undefined ? a : c;
};

$.fn.checkbox.defaults = {};

$.fn.checkbox.Constructor = Checkbox;

$(function() {
    $(window).on("load", function() {
        $(".checkbox-custom > input[type=checkbox]").each(function() {
            var a = $(this);
            if (a.data("checkbox")) {
                return;
            }
            a.checkbox(a.data());
        });
    });
});

var Combobox = function(b, a) {
    this.$element = $(b);
    this.options = $.extend({}, $.fn.combobox.defaults, a);
    this.$element.on("click", "a", $.proxy(this.itemclicked, this));
    this.$element.on("change", "input", $.proxy(this.inputchanged, this));
    this.$input = this.$element.find("input");
    this.$button = this.$element.find(".btn");
    this.setDefaultSelection();
};

Combobox.prototype = {
    constructor: Combobox,
    selectedItem: function() {
        var b = this.$selectedItem;
        var c = {};
        if (b) {
            var a = this.$selectedItem.text();
            c = $.extend({
                text: a
            }, this.$selectedItem.data());
        } else {
            c = {
                text: this.$input.val()
            };
        }
        return c;
    },
    selectByText: function(b) {
        var a = "li:fuelTextExactCI(" + b + ")";
        this.selectBySelector(a);
    },
    selectByValue: function(b) {
        var a = 'li[data-value="' + b + '"]';
        this.selectBySelector(a);
    },
    selectByIndex: function(b) {
        var a = "li:eq(" + b + ")";
        this.selectBySelector(a);
    },
    selectBySelector: function(a) {
        var b = this.$element.find(a);
        if (typeof b[0] !== "undefined") {
            this.$selectedItem = b;
            this.$input.val(this.$selectedItem.text());
        } else {
            this.$selectedItem = null;
        }
    },
    setDefaultSelection: function() {
        var a = "li[data-selected=true]:first";
        var b = this.$element.find(a);
        if (b.length > 0) {
            this.selectBySelector(a);
            b.removeData("selected");
            b.removeAttr("data-selected");
        }
    },
    enable: function() {
        this.$input.removeAttr("disabled");
        this.$button.removeClass("disabled");
    },
    disable: function() {
        this.$input.attr("disabled", true);
        this.$button.addClass("disabled");
    },
    itemclicked: function(b) {
        this.$selectedItem = $(b.target).parent();
        this.$input.val(this.$selectedItem.text()).trigger("change", {
            synthetic: true
        });
        var a = this.selectedItem();
        this.$element.trigger("changed", a);
        b.preventDefault();
    },
    inputchanged: function(c, a) {
        if (a && a.synthetic) {
            return;
        }
        var d = $(c.target).val();
        this.selectByText(d);
        var b = this.selectedItem();
        if (b.text.length === 0) {
            b = {
                text: d
            };
        }
        this.$element.trigger("changed", b);
    }
};

$.fn.combobox = function(b, d) {
    var c;
    var a = this.each(function() {
        var g = $(this);
        var f = g.data("combobox");
        var e = typeof b === "object" && b;
        if (!f) {
            g.data("combobox", f = new Combobox(this, e));
        }
        if (typeof b === "string") {
            c = f[b](d);
        }
    });
    return c === undefined ? a : c;
};

$.fn.combobox.defaults = {};

$.fn.combobox.Constructor = Combobox;

$(function() {
    $(window).on("load", function() {
        $(".combobox").each(function() {
            var a = $(this);
            if (a.data("combobox")) {
                return;
            }
            a.combobox(a.data());
        });
    });
    $("body").on("mousedown.combobox.data-api", ".combobox", function(b) {
        var a = $(this);
        if (a.data("combobox")) {
            return;
        }
        a.combobox(a.data());
    });
});

var Radio = function(b, a) {
    this.$element = $(b);
    this.options = $.extend({}, $.fn.radio.defaults, a);
    this.$label = this.$element.parent();
    this.$icon = this.$label.find("i");
    this.$radio = this.$label.find("input[type=radio]");
    this.groupName = this.$radio.attr("name");
    this.setState(this.$radio);
    this.$radio.on("change", $.proxy(this.itemchecked, this));
};

Radio.prototype = {
    constructor: Radio,
    setState: function(a, b) {
        var d = a.is(":checked");
        var c = a.is(":disabled");
        if (d === true) {
            this.$icon.addClass("checked");
        }
        if (c === true) {
            this.$icon.addClass("disabled");
        }
    },
    resetGroup: function() {
        $("input[name=" + this.groupName + "]").next().removeClass("checked");
    },
    enable: function() {
        this.$radio.attr("disabled", false);
        this.$icon.removeClass("disabled");
    },
    disable: function() {
        this.$radio.attr("disabled", true);
        this.$icon.addClass("disabled");
    },
    itemchecked: function(b) {
        var a = $(b.target);
        this.resetGroup();
        this.setState(a);
    }
};

$.fn.radio = function(b, d) {
    var c;
    var a = this.each(function() {
        var g = $(this);
        var f = g.data("radio");
        var e = typeof b === "object" && b;
        if (!f) {
            g.data("radio", f = new Radio(this, e));
        }
        if (typeof b === "string") {
            c = f[b](d);
        }
    });
    return c === undefined ? a : c;
};

$.fn.radio.defaults = {};

$.fn.radio.Constructor = Radio;

$(function() {
    $(window).on("load", function() {
        $(".radio-custom > input[type=radio]").each(function() {
            var a = $(this);
            if (a.data("radio")) {
                return;
            }
            a.radio(a.data());
        });
    });
});

var Select = function(b, a) {
    this.$element = $(b);
    this.options = $.extend({}, $.fn.select.defaults, a);
    this.$element.on("click", "a", $.proxy(this.itemclicked, this));
    this.$button = this.$element.find(".btn");
    this.$label = this.$element.find(".dropdown-label");
    this.setDefaultSelection();
    if (a.resize === "auto") {
        this.resize();
    }
};

Select.prototype = {
    constructor: Select,
    itemclicked: function(b) {
        this.$selectedItem = $(b.target).parent();
        this.$label.text(this.$selectedItem.text());
        var a = this.selectedItem();
        this.$element.trigger("changed", a);
        b.preventDefault();
    },
    resize: function() {
        var b = $("#selectTextSize")[0];
        if (!b) {
            $("<div/>").attr({
                id: "selectTextSize"
            }).appendTo("body");
        }
        var a = 0;
        var c = 0;
        this.$element.find("a").each(function() {
            var f = $(this);
            var d = f.text();
            var e = $("#selectTextSize");
            e.text(d);
            c = e.outerWidth();
            if (c > a) {
                a = c;
            }
        });
        this.$label.width(a);
    },
    selectedItem: function() {
        var a = this.$selectedItem.text();
        return $.extend({
            text: a
        }, this.$selectedItem.data());
    },
    selectByText: function(b) {
        var a = "li a:fuelTextExactCI(" + b + ")";
        this.selectBySelector(a);
    },
    selectByValue: function(b) {
        var a = 'li[data-value="' + b + '"]';
        this.selectBySelector(a);
    },
    selectByIndex: function(b) {
        var a = "li:eq(" + b + ")";
        this.selectBySelector(a);
    },
    selectBySelector: function(a) {
        var b = this.$element.find(a);
        this.$selectedItem = b;
        this.$label.text(this.$selectedItem.text());
    },
    setDefaultSelection: function() {
        var a = "li[data-selected=true]:first";
        var b = this.$element.find(a);
        if (b.length === 0) {
            this.selectByIndex(0);
        } else {
            this.selectBySelector(a);
            b.removeData("selected");
            b.removeAttr("data-selected");
        }
    },
    enable: function() {
        this.$button.removeClass("disabled");
    },
    disable: function() {
        this.$button.addClass("disabled");
    }
};

$.fn.select = function(b, d) {
    var c;
    var a = this.each(function() {
        var g = $(this);
        var f = g.data("select");
        var e = typeof b === "object" && b;
        if (!f) {
            g.data("select", f = new Select(this, e));
        }
        if (typeof b === "string") {
            c = f[b](d);
        }
    });
    return c === undefined ? a : c;
};

$.fn.select.defaults = {};

$.fn.select.Constructor = Select;

$(function() {
    $(window).on("load", function() {
        $(".select").each(function() {
            var a = $(this);
            if (a.data("select")) {
                return;
            }
            a.select(a.data());
        });
    });
    $("body").on("mousedown.select.data-api", ".select", function(b) {
        var a = $(this);
        if (a.data("select")) {
            return;
        }
        a.select(a.data());
    });
});

var Spinner = function(b, a) {
    this.$element = $(b);
    this.options = $.extend({}, $.fn.spinner.defaults, a);
    this.$input = this.$element.find(".spinner-input");
    this.$element.on("keyup", this.$input, $.proxy(this.change, this));
    if (this.options.hold) {
        this.$element.on("mousedown", ".spinner-up", $.proxy(function() {
            this.startSpin(true);
        }, this));
        this.$element.on("mouseup", ".spinner-up, .spinner-down", $.proxy(this.stopSpin, this));
        this.$element.on("mouseout", ".spinner-up, .spinner-down", $.proxy(this.stopSpin, this));
        this.$element.on("mousedown", ".spinner-down", $.proxy(function() {
            this.startSpin(false);
        }, this));
    } else {
        this.$element.on("click", ".spinner-up", $.proxy(function() {
            this.step(true);
        }, this));
        this.$element.on("click", ".spinner-down", $.proxy(function() {
            this.step(false);
        }, this));
    }
    this.switches = {
        count: 1,
        enabled: true
    };
    if (this.options.speed === "medium") {
        this.switches.speed = 300;
    } else {
        if (this.options.speed === "fast") {
            this.switches.speed = 100;
        } else {
            this.switches.speed = 500;
        }
    }
    this.lastValue = null;
    this.render();
    if (this.options.disabled) {
        this.disable();
    }
};

Spinner.prototype = {
    constructor: Spinner,
    render: function() {
        this.$input.val(this.options.value);
        this.$input.attr("maxlength", (this.options.max + "").split("").length);
    },
    change: function() {
        var a = this.$input.val();
        if (a / 1) {
            this.options.value = a / 1;
        } else {
            a = a.replace(/[^0-9]/g, "");
            this.$input.val(a);
            this.options.value = a / 1;
        }
        this.triggerChangedEvent();
    },
    stopSpin: function() {
        clearTimeout(this.switches.timeout);
        this.switches.count = 1;
        this.triggerChangedEvent();
    },
    triggerChangedEvent: function() {
        var a = this.value();
        if (a === this.lastValue) {
            return;
        }
        this.lastValue = a;
        this.$element.trigger("changed", a);
        this.$element.trigger("change");
    },
    startSpin: function(a) {
        if (!this.options.disabled) {
            var b = this.switches.count;
            if (b === 1) {
                this.step(a);
                b = 1;
            } else {
                if (b < 3) {
                    b = 1.5;
                } else {
                    if (b < 8) {
                        b = 2.5;
                    } else {
                        b = 4;
                    }
                }
            }
            this.switches.timeout = setTimeout($.proxy(function() {
                this.iterator(a);
            }, this), this.switches.speed / b);
            this.switches.count++;
        }
    },
    iterator: function(a) {
        this.step(a);
        this.startSpin(a);
    },
    step: function(b) {
        var d = this.options.value;
        var c = b ? this.options.max : this.options.min;
        if (b ? d < c : d > c) {
            var a = d + (b ? 1 : -1) * this.options.step;
            if (b ? a > c : a < c) {
                this.value(c);
            } else {
                this.value(a);
            }
        }
    },
    value: function(a) {
        if (!isNaN(parseFloat(a)) && isFinite(a)) {
            a = parseFloat(a);
            this.options.value = a;
            this.$input.val(a);
            return this;
        } else {
            return this.options.value;
        }
    },
    disable: function() {
        this.options.disabled = true;
        this.$input.attr("disabled", "");
        this.$element.find("button").addClass("disabled");
    },
    enable: function() {
        this.options.disabled = false;
        this.$input.removeAttr("disabled");
        this.$element.find("button").removeClass("disabled");
    }
};

$.fn.spinner = function(b, d) {
    var c;
    var a = this.each(function() {
        var g = $(this);
        var f = g.data("spinner");
        var e = typeof b === "object" && b;
        if (!f) {
            g.data("spinner", f = new Spinner(this, e));
        }
        if (typeof b === "string") {
            c = f[b](d);
        }
    });
    return c === undefined ? a : c;
};

$.fn.spinner.defaults = {
    value: 1,
    min: 1,
    max: 999,
    step: 1,
    hold: true,
    speed: "medium",
    disabled: false
};

$.fn.spinner.Constructor = Spinner;

$(function() {
    $("body").on("mousedown.spinner.data-api", ".spinner", function(b) {
        var a = $(this);
        if (a.data("spinner")) {
            return;
        }
        a.spinner(a.data());
    });
});

var Search = function(b, a) {
    this.$element = $(b);
    this.options = $.extend({}, $.fn.search.defaults, a);
    this.$button = this.$element.find("button").on("click", $.proxy(this.buttonclicked, this));
    this.$input = this.$element.find("input").on("keydown", $.proxy(this.keypress, this)).on("keyup", $.proxy(this.keypressed, this));
    this.$icon = this.$element.find("i");
    this.activeSearch = "";
};

Search.prototype = {
    constructor: Search,
    search: function(a) {
        this.$icon.attr("class", "icon-remove");
        this.activeSearch = a;
        this.$element.trigger("searched", a);
    },
    clear: function() {
        this.$icon.attr("class", "icon-search");
        this.activeSearch = "";
        this.$input.val("");
        this.$element.trigger("cleared");
    },
    action: function() {
        var b = this.$input.val();
        var a = b === "" || b === this.activeSearch;
        if (this.activeSearch && a) {
            this.clear();
        } else {
            if (b) {
                this.search(b);
            }
        }
    },
    buttonclicked: function(a) {
        a.preventDefault();
        if ($(a.currentTarget).is(".disabled, :disabled")) {
            return;
        }
        this.action();
    },
    keypress: function(a) {
        if (a.which === 13) {
            a.preventDefault();
        }
    },
    keypressed: function(b) {
        var c, a;
        if (b.which === 13) {
            b.preventDefault();
            this.action();
        } else {
            c = this.$input.val();
            a = c && c === this.activeSearch;
            this.$icon.attr("class", a ? "icon-remove" : "icon-search");
        }
    },
    disable: function() {
        this.$input.attr("disabled", "disabled");
        this.$button.addClass("disabled");
    },
    enable: function() {
        this.$input.removeAttr("disabled");
        this.$button.removeClass("disabled");
    }
};

$.fn.search = function(a) {
    return this.each(function() {
        var d = $(this);
        var c = d.data("search");
        var b = typeof a === "object" && a;
        if (!c) {
            d.data("search", c = new Search(this, b));
        }
        if (typeof a === "string") {
            c[a]();
        }
    });
};

$.fn.search.defaults = {};

$.fn.search.Constructor = Search;

$(function() {
    $("body").on("mousedown.search.data-api", ".search", function() {
        var a = $(this);
        if (a.data("search")) {
            return;
        }
        a.search(a.data());
    });
});

var Datagrid = function(b, a) {
    this.$element = $(b);
    this.$thead = this.$element.find("thead");
    this.$tfoot = this.$element.find("tfoot");
    this.$footer = this.$element.find("tfoot th");
    this.$footerchildren = this.$footer.children().show().css("visibility", "hidden");
    this.$topheader = this.$element.find("thead th");
    this.$searchcontrol = this.$element.find(".datagrid-search");
    this.$filtercontrol = this.$element.find(".filter");
    this.$pagesize = this.$element.find(".grid-pagesize");
    this.$pageinput = this.$element.find(".grid-pager input");
    this.$pagedropdown = this.$element.find(".grid-pager .dropdown-menu");
    this.$prevpagebtn = this.$element.find(".grid-prevpage");
    this.$nextpagebtn = this.$element.find(".grid-nextpage");
    this.$pageslabel = this.$element.find(".grid-pages");
    this.$countlabel = this.$element.find(".grid-count");
    this.$startlabel = this.$element.find(".grid-start");
    this.$endlabel = this.$element.find(".grid-end");
    this.$tbody = $("<tbody>").insertAfter(this.$thead);
    this.$colheader = $("<tr>").appendTo(this.$thead);
    this.options = $.extend(true, {}, $.fn.datagrid.defaults, a);
    if (this.$pagesize.hasClass("select")) {
        this.options.dataOptions.pageSize = parseInt(this.$pagesize.select("selectedItem").value, 10);
    } else {
        this.options.dataOptions.pageSize = parseInt(this.$pagesize.val(), 10);
    }
    if (this.$searchcontrol.length <= 0) {
        this.$searchcontrol = this.$element.find(".search");
    }
    this.columns = this.options.dataSource.columns();
    this.$nextpagebtn.on("click", $.proxy(this.next, this));
    this.$prevpagebtn.on("click", $.proxy(this.previous, this));
    this.$searchcontrol.on("searched cleared", $.proxy(this.searchChanged, this));
    this.$filtercontrol.on("changed", $.proxy(this.filterChanged, this));
    this.$colheader.on("click", "th", $.proxy(this.headerClicked, this));
    if (this.$pagesize.hasClass("select")) {
        this.$pagesize.on("changed", $.proxy(this.pagesizeChanged, this));
    } else {
        this.$pagesize.on("change", $.proxy(this.pagesizeChanged, this));
    }
    this.$pageinput.on("change", $.proxy(this.pageChanged, this));
    this.renderColumns();
    if (this.options.stretchHeight) {
        this.initStretchHeight();
    }
    this.renderData();
};

Datagrid.prototype = {
    constructor: Datagrid,
    renderColumns: function() {
        var a = this;
        this.$footer.attr("colspan", this.columns.length);
        this.$topheader.attr("colspan", this.columns.length);
        var b = "";
        $.each(this.columns, function(c, d) {
            b += '<th data-property="' + d.property + '"';
            if (d.sortable) {
                b += ' class="sortable"';
            }
            b += ">" + d.label + "</th>";
        });
        a.$colheader.append(b);
    },
    updateColumns: function(a, c) {
        var b = c === "asc" ? "icon-chevron-up" : "icon-chevron-down";
        this.$colheader.find("i").remove();
        this.$colheader.find("th").removeClass("sorted");
        $("<i>").addClass(b).appendTo(a);
        a.addClass("sorted");
    },
    updatePageDropdown: function(b) {
        var c = "";
        for (var a = 1; a <= b.pages; a++) {
            c += "<li><a>" + a + "</a></li>";
        }
        this.$pagedropdown.html(c);
    },
    updatePageButtons: function(a) {
        if (a.page === 1) {
            this.$prevpagebtn.attr("disabled", "disabled");
        } else {
            this.$prevpagebtn.removeAttr("disabled");
        }
        if (a.page === a.pages) {
            this.$nextpagebtn.attr("disabled", "disabled");
        } else {
            this.$nextpagebtn.removeAttr("disabled");
        }
    },
    renderData: function() {
        var a = this;
        this.$tbody.html(this.placeholderRowHTML(this.options.loadingHTML));
        this.options.dataSource.data(this.options.dataOptions, function(d) {
            var c = d.count === 1 ? a.options.itemText : a.options.itemsText;
            var b = "";
            a.$footerchildren.css("visibility", function() {
                return d.count > 0 ? "visible" : "hidden";
            });
            a.$pageinput.val(d.page);
            a.$pageslabel.text(d.pages);
            a.$countlabel.text(d.count + " " + c);
            a.$startlabel.text(d.start);
            a.$endlabel.text(d.end);
            a.updatePageDropdown(d);
            a.updatePageButtons(d);
            $.each(d.data, function(e, f) {
                b += "<tr>";
                $.each(a.columns, function(g, h) {
                    b += "<td>" + f[h.property] + "</td>";
                });
                b += "</tr>";
            });
            if (!b) {
                b = a.placeholderRowHTML("0 " + a.options.itemsText);
            }
            a.$tbody.html(b);
            a.stretchHeight();
            a.$element.trigger("loaded");
        });
    },
    placeholderRowHTML: function(a) {
        return '<tr><td style="text-align:center;padding:20px;border-bottom:none;" colspan="' + this.columns.length + '">' + a + "</td></tr>";
    },
    headerClicked: function(f) {
        var a = $(f.target);
        if (!a.hasClass("sortable")) {
            return;
        }
        var d = this.options.dataOptions.sortDirection;
        var b = this.options.dataOptions.sortProperty;
        var c = a.data("property");
        if (b === c) {
            this.options.dataOptions.sortDirection = d === "asc" ? "desc" : "asc";
        } else {
            this.options.dataOptions.sortDirection = "asc";
            this.options.dataOptions.sortProperty = c;
        }
        this.options.dataOptions.pageIndex = 0;
        this.updateColumns(a, this.options.dataOptions.sortDirection);
        this.renderData();
    },
    pagesizeChanged: function(b, a) {
        if (a) {
            this.options.dataOptions.pageSize = parseInt(a.value, 10);
        } else {
            this.options.dataOptions.pageSize = parseInt($(b.target).val(), 10);
        }
        this.options.dataOptions.pageIndex = 0;
        this.renderData();
    },
    pageChanged: function(c) {
        var b = parseInt($(c.target).val(), 10);
        b = isNaN(b) ? 1 : b;
        var a = this.$pageslabel.text();
        this.options.dataOptions.pageIndex = b > a ? a - 1 : b - 1;
        this.renderData();
    },
    searchChanged: function(b, a) {
        this.options.dataOptions.search = a;
        this.options.dataOptions.pageIndex = 0;
        this.renderData();
    },
    filterChanged: function(b, a) {
        this.options.dataOptions.filter = a;
        this.renderData();
    },
    previous: function() {
        this.options.dataOptions.pageIndex--;
        this.renderData();
    },
    next: function() {
        this.options.dataOptions.pageIndex++;
        this.renderData();
    },
    reload: function() {
        this.options.dataOptions.pageIndex = 0;
        this.renderData();
    },
    initStretchHeight: function() {
        this.$gridContainer = this.$element.parent();
        this.$element.wrap('<div class="datagrid-stretch-wrapper">');
        this.$stretchWrapper = this.$element.parent();
        this.$headerTable = $("<table>").attr("class", this.$element.attr("class"));
        this.$footerTable = this.$headerTable.clone();
        this.$headerTable.prependTo(this.$gridContainer).addClass("datagrid-stretch-header");
        this.$thead.detach().appendTo(this.$headerTable);
        this.$sizingHeader = this.$thead.clone();
        this.$sizingHeader.find("tr:first").remove();
        this.$footerTable.appendTo(this.$gridContainer).addClass("datagrid-stretch-footer");
        this.$tfoot.detach().appendTo(this.$footerTable);
    },
    stretchHeight: function() {
        if (!this.$gridContainer) {
            return;
        }
        this.setColumnWidths();
        var a = this.$gridContainer.height();
        var c = this.$headerTable.outerHeight();
        var d = this.$footerTable.outerHeight();
        var b = c + d;
        this.$stretchWrapper.height(a - b);
    },
    setColumnWidths: function() {
        if (!this.$sizingHeader) {
            return;
        }
        this.$element.prepend(this.$sizingHeader);
        var b = this.$sizingHeader.find("th");
        var a = b.length;
        function c(d, e) {
            if (d === a - 1) {
                return;
            }
            $(e).width(b.eq(d).width());
        }
        this.$colheader.find("th").each(c);
        this.$tbody.find("tr:first > td").each(c);
        this.$sizingHeader.detach();
    }
};

$.fn.datagrid = function(a) {
    return this.each(function() {
        var d = $(this);
        var c = d.data("datagrid");
        var b = typeof a === "object" && a;
        if (!c) {
            d.data("datagrid", c = new Datagrid(this, b));
        }
        if (typeof a === "string") {
            c[a]();
        }
    });
};

$.fn.datagrid.defaults = {
    dataOptions: {
        pageIndex: 0,
        pageSize: 10
    },
    loadingHTML: '<div class="progress progress-striped active" style="width:50%;margin:auto;"><div class="bar" style="width:100%;"></div></div>',
    itemsText: "items",
    itemText: "item"
};

$.fn.datagrid.Constructor = Datagrid;

var Wizard = function(c, b) {
    var a;
    this.$element = $(c);
    this.options = $.extend({}, $.fn.wizard.defaults, b);
    this.currentStep = 1;
    this.numSteps = this.$element.find("li").length;
    this.$prevBtn = this.$element.find("button.btn-prev");
    this.$nextBtn = this.$element.find("button.btn-next");
    a = this.$nextBtn.children().detach();
    this.nextText = $.trim(this.$nextBtn.text());
    this.$nextBtn.append(a);
    this.$prevBtn.on("click", $.proxy(this.previous, this));
    this.$nextBtn.on("click", $.proxy(this.next, this));
    this.$element.on("click", "li.complete", $.proxy(this.stepclicked, this));
};

Wizard.prototype = {
    constructor: Wizard,
    setState: function() {
        var l = this.currentStep > 1;
        var m = this.currentStep === 1;
        var a = this.currentStep === this.numSteps;
        this.$prevBtn.attr("disabled", m === true || l === false);
        var e = this.$nextBtn.data();
        if (e && e.last) {
            this.lastText = e.last;
            if (typeof this.lastText !== "undefined") {
                var j = a !== true ? this.nextText : this.lastText;
                var c = this.$nextBtn.children().detach();
                this.$nextBtn.text(j).append(c);
            }
        }
        var g = this.$element.find("li");
        g.removeClass("active").removeClass("complete");
        g.find("span.badge").removeClass("badge-info").removeClass("badge-success");
        var k = "li:lt(" + (this.currentStep - 1) + ")";
        var d = this.$element.find(k);
        d.addClass("complete");
        d.find("span.badge").addClass("badge-success");
        var b = "li:eq(" + (this.currentStep - 1) + ")";
        var h = this.$element.find(b);
        h.addClass("active");
        h.find("span.badge").addClass("badge-info");
        var f = h.data().target;
        $(".step-pane").removeClass("active");
        $(f).addClass("active");
        this.$element.trigger("changed");
    },
    stepclicked: function(d) {
        var a = $(d.currentTarget);
        var c = $(".steps li").index(a);
        var b = $.Event("stepclick");
        this.$element.trigger(b, {
            step: c + 1
        });
        if (b.isDefaultPrevented()) {
            return;
        }
        this.currentStep = c + 1;
        this.setState();
    },
    previous: function() {
        var a = this.currentStep > 1;
        if (a) {
            var b = $.Event("change");
            this.$element.trigger(b, {
                step: this.currentStep,
                direction: "previous"
            });
            if (b.isDefaultPrevented()) {
                return;
            }
            this.currentStep -= 1;
            this.setState();
        }
    },
    next: function() {
        var c = this.currentStep + 1 <= this.numSteps;
        var a = this.currentStep === this.numSteps;
        if (c) {
            var b = $.Event("change");
            this.$element.trigger(b, {
                step: this.currentStep,
                direction: "next"
            });
            if (b.isDefaultPrevented()) {
                return;
            }
            this.currentStep += 1;
            this.setState();
        } else {
            if (a) {
                this.$element.trigger("finished");
            }
        }
    },
    selectedItem: function(a) {
        return {
            step: this.currentStep
        };
    }
};

$.fn.wizard = function(b, d) {
    var c;
    var a = this.each(function() {
        var g = $(this);
        var f = g.data("wizard");
        var e = typeof b === "object" && b;
        if (!f) {
            g.data("wizard", f = new Wizard(this, e));
        }
        if (typeof b === "string") {
            c = f[b](d);
        }
    });
    return c === undefined ? a : c;
};

$.fn.wizard.defaults = {};

$.fn.wizard.Constructor = Wizard;

$(function() {
    $("body").on("mousedown.wizard.data-api", ".wizard", function() {
        var a = $(this);
        if (a.data("wizard")) {
            return;
        }
        a.wizard(a.data());
    });
});

$(document).ready(function() {
    $("#on-top-link").click(function() {
        $("body,html").animate({
            scrollTop: 0
        }, 800);
        return false;
    });
    $(".box-header").each(function() {
        var a = $(this).next();
        if (a.hasClass("box") && !a.hasClass("non-collapsible")) {
            $(this).append('<a href="#" class="box-collapse pull-right">hide&nbsp;&nbsp;<i class="icon-caret-up"></i></a>').append('<a href="#" class="box-expand pull-right" style="display: none">show&nbsp;&nbsp;<i class="icon-caret-down"></i></a>');
        }
    });
    $(document).on("click", "a.box-collapse", function() {
        var a = $(this).hide(100, "linear");
        a.parent(".box-header").next(".box").slideUp(400, function() {
            $(".box-expand", a.parent(".box-header")).show(100, "linear");
        });
        return false;
    }).on("click", "a.box-expand", function() {
        var a = $(this).hide(100, "linear");
        a.parent(".box-header").next(".box").slideDown(400, function() {
            $(".box-collapse", a.parent(".box-header")).show(100, "linear");
        });
        return false;
    });
});

function timeAgo(e) {
    switch (typeof e) {
      case "number":
        break;

      case "string":
        e = +new Date(e);
        break;

      case "object":
        if (e.constructor === Date) {
            e = e.getTime();
        }
        break;

      default:
        e = +new Date();
    }
    var d = [ [ 60, "seconds", 1 ], [ 120, "1 minute ago", "1 minute from now" ], [ 3600, "minutes", 60 ], [ 7200, "1 hour ago", "1 hour from now" ], [ 86400, "hours", 3600 ], [ 172800, "Yesterday", "Tomorrow" ], [ 604800, "days", 86400 ], [ 1209600, "Last week", "Next week" ], [ 2419200, "weeks", 604800 ], [ 4838400, "Last month", "Next month" ], [ 29030400, "months", 2419200 ], [ 58060800, "Last year", "Next year" ], [ 290304e4, "years", 29030400 ], [ 580608e4, "Last century", "Next century" ], [ 580608e5, "centuries", 290304e4 ] ];
    var g = (+new Date() - e) / 1e3, b = "ago", f = 1;
    if (Math.floor(g) === 0) {
        return "Just now";
    }
    if (g < 0) {
        g = Math.abs(g);
        b = "from now";
        f = 2;
    }
    var a = 0, c;
    while (c = d[a++]) {
        if (g < c[0]) {
            if (typeof c[2] == "string") {
                return c[f];
            } else {
                return Math.floor(g / c[2]) + " " + c[1] + " " + b;
            }
        }
    }
    return e;
}

$(document).on("click.collapse.data-api", "[data-toggle=collapse]", function(a) {
    self = $(".nav-button");
    if (self.hasClass("collapsed")) {
        self.removeClass("active");
    } else {
        self.addClass("active");
    }
});

(function() {
    var a = {
        _object: null,
        _left_panel: null,
        _scrolling: false,
        _dropdowns: {},
        _opened_dropdown: null,
        destroyScroll: function() {
            if (a._currScroll === "v" && a._object !== null) {
                a._object.destroy();
                a._object = null;
            } else {
                if (a._currScroll === "h") {
                    $("#left-panel .active").unbind("click");
                    $("#left-panel").removeClass("open");
                }
            }
        },
        _setup: function(c) {
            a.destroyScroll();
            var b = $("#left-panel");
            if (c === "v") {
                b.css({
                    height: "100%",
                    position: "fixed",
                    top: 0,
                    left: 0
                });
                if (!a._object) {
                    $("#left-panel a").click(function() {
                        if (a._scrolling) {
                            return false;
                        }
                    });
                }
                a._setupDropdowns();
                a._object = new iScroll("left-panel-content", {
                    hScroll: false,
                    vScroll: true,
                    onScrollMove: function() {
                        a._scrolling = true;
                        a._hideOpenedDropdowns();
                    },
                    onScrollEnd: function() {
                        a._scrolling = false;
                    }
                });
            } else {
                b.css({
                    height: "36px",
                    position: "relative",
                    top: 0,
                    left: 0
                });
                a._setupHorizontalMenu();
            }
            a._currScroll = c;
        },
        _update: function() {
            if (String(a._left_panel.css("z-index")) !== "1020" && a._currScroll !== "v") {
                a._setup("v");
            } else {
                if (String(a._left_panel.css("z-index")) === "1020" && a._currScroll !== "h") {
                    a._setup("h");
                }
            }
            if (a._currScroll === "v" && a._opened_dropdown !== null) {
                a._setDropdownTopPosition(a._opened_dropdown);
            }
        },
        _initDropdowns: function() {
            $(".lp-dropdown-toggle").each(function() {
                var b = $(this), c = b.attr("id");
                a._dropdowns[c] = {
                    toggler: b,
                    menu: $(".lp-dropdown-menu[data-dropdown-owner=" + c + "]")
                };
                a._dropdowns[c]["width"] = a._calculateDropdownWidth(c);
                a._dropdowns[c].wrapper = $('<div class="lp-dropdown-wrapper" data-dropdown-owner="' + c + '" />').appendTo($("body"));
                a._dropdowns[c].wrapper.append($('<div class="arrow" />'));
                if (a._dropdowns[c].menu.hasClass("simple")) {
                    a._dropdowns[c].wrapper.addClass("simple");
                }
            });
            $("html").on("click.dropdown.data-api", function() {
                a._hideOpenedDropdowns();
            });
            $("html").on("click", ".lp-dropdown-wrapper", function(b) {
                b.stopPropagation();
            });
            $(".lp-dropdown-toggle").click(function() {
                a._hideOpenedDropdowns();
                a._setDropdownTopPosition($(this).attr("id"));
                a._opened_dropdown = $(this).attr("id");
                $(this).addClass("open");
                $(".lp-dropdown-wrapper[data-dropdown-owner=" + $(this).attr("id") + "]").addClass("open");
                return false;
            });
        },
        _setupDropdowns: function() {
            $("#lp-active").unbind("click").remove();
            var c;
            for (var b in a._dropdowns) {
                c = a._dropdowns[b];
                c.wrapper.append(c.menu);
                c.wrapper.css({
                    left: $("#left-panel li").width() + 10
                });
                $("a", c.menu).each(function() {
                    $(this).html(jQuery.data(this, "link_html"));
                });
                c.menu.css({
                    width: c.width
                });
                $(".active", c.menu).css({
                    display: "block"
                });
                c.wrapper.css({
                    width: c.width
                });
                if (c.menu.hasClass("simple")) {
                    $("li, li a", c.menu).css({
                        display: "block",
                        width: "100%"
                    });
                }
            }
        },
        _setupHorizontalMenu: function() {
            var c = $("#left-panel");
            var d;
            for (var b in a._dropdowns) {
                d = a._dropdowns[b];
                d.toggler.parent().append(d.menu);
                d.toggler.removeClass("open");
                d.wrapper.removeClass("open");
                d.menu.css({
                    width: "100%"
                });
                d.wrapper.css({
                    width: "100%"
                });
                $(".active", d.menu).css({
                    display: "none"
                });
                $("a", d.menu).each(function() {
                    var e = $(this);
                    jQuery.data(this, "link_html", e.html());
                    e.text(d.toggler.text() + " / " + e.text());
                });
            }
            $('<a href="#" id="lp-active" />').prependTo(c).bind("click", function() {
                if (c.hasClass("open")) {
                    c.css({
                        height: 37
                    });
                } else {
                    c.css({
                        height: $("#left-panel-content ul").innerHeight() + 37
                    });
                }
                c.toggleClass("open");
                return false;
            }).text($($(".active", c).length == 1 ? ".active" : ".active .active", c).text());
        },
        _hideOpenedDropdowns: function() {
            $(".lp-dropdown-wrapper.open").removeClass("open");
            $(".lp-dropdown-toggle.open").removeClass("open");
            a._opened_dropdown = null;
        },
        _calculateDropdownWidth: function(e) {
            var c = 0;
            if (a._dropdowns[e].menu.hasClass("simple")) {
                var b = a._dropdowns[e].menu.parent(), d = $('<div id="calculateDropdownWidth" />').css({
                    position: "absolute",
                    width: 3e3,
                    left: -1e4
                }).appendTo("body").append(a._dropdowns[e].menu);
                $("li a", a._dropdowns[e].menu).each(function() {
                    if (c < $(this).width()) {
                        c = $(this).width();
                    }
                });
                c += 50;
                b.append(a._dropdowns[e].menu);
                d.remove();
            } else {
                $("li", a._dropdowns[e].menu).each(function() {
                    c += $(this).width();
                });
            }
            return c;
        },
        _setDropdownTopPosition: function(b) {
            var h = a._dropdowns[b];
            if (h.menu.hasClass("simple")) {
                var l = h.toggler.parents("li"), k = l.offset().top, f = l.height(), g = h.wrapper.height(), m = $(window).height(), j = $(document).scrollTop();
                var c, e;
                if (g > f) {
                    if (m > k + g - j) {
                        c = k;
                        e = f / 2 - 6;
                    } else {
                        c = m - g + j;
                        if (c + g < f + k) {
                            c = f + k - g;
                        }
                        e = k - c + f / 2 - 6;
                    }
                } else {
                    c = k + f / 2 - g / 2;
                    e = g / 2 - 6;
                }
                h.wrapper.css({
                    top: c - j
                });
                $(".arrow", h.wrapper).css({
                    "margin-top": e
                });
            } else {
                h.wrapper.css({
                    top: h.toggler.offset().top - $(document).scrollTop()
                });
            }
        }
    };
    $(document).ready(function() {
        a._initDropdowns();
        a._left_panel = $("#left-panel");
        a._update();
    });
    $(window).resize(a._update);
})();

(function($) {
    $.fn.simplePlot = function(graph_data, plot_options, options) {
        var settings = $.extend(true, {}, {
            pointsRadius: 4,
            height: null,
            heightRatio: .5,
            tooltipText: "x - y"
        }, options || {});
        var plot_settings = $.extend(true, {}, {
            series: {
                shadowSize: 0
            },
            grid: {
                color: "#646464",
                borderColor: "transparent",
                borderWidth: 20,
                hoverable: true
            },
            xaxis: {
                tickColor: "transparent"
            },
            legend: {
                show: false
            }
        }, plot_options || {});
        var data = [], wrapper = null, graph_container = null, current_width = null, plot_obj = null, timer = null, available_colors = [ "#71c73e", "#77b7c5", "#d54848", "#6c42e5", "#e8e64e", "#dd56e6", "#ecad3f", "#618b9d", "#b68b68", "#36a766", "#3156be", "#00b3ff", "#646464", "#a946e8", "#9d9d9d" ];
        for (var i = 0; i < graph_data.length; i++) {
            data.push($.extend({}, graph_data[i]));
        }
        return this.each(function() {
            $(this).wrap('<div class="graph-wrapper" />').wrap('<div class="graph-container" />');
            graph_container = $(this).parent(".graph-container");
            wrapper = graph_container.parent(".graph-wrapper");
            wrapper.prepend('<div class="graph-info" />');
            var graph_info = $(".graph-info", wrapper);
            var updateContainerSize = function() {
                var width = wrapper.innerWidth();
                if (width == current_width) {
                    return;
                }
                var height = settings.height === null ? Math.ceil(width * settings.heightRatio) : settings.height;
                graph_container.css({
                    width: width,
                    height: height
                });
                current_width = width;
                if (plot_obj) {
                    plot_obj.getPlaceholder().css({
                        width: width,
                        height: height
                    });
                    plot_obj.resize();
                    plot_obj.setupGrid();
                    plot_obj.draw();
                }
            };
            updateContainerSize();
            if (!data.length) {
                return;
            }
            for (var i = 0, dataItem = data[0]; i < data.length; dataItem = data[++i]) {
                if (dataItem.color === undefined) {
                    dataItem.color = available_colors.shift();
                }
                if (dataItem.filledPoints === true) {
                    $.extend(true, dataItem, {
                        points: {
                            radius: settings.pointsRadius,
                            fillColor: dataItem.color
                        }
                    });
                    delete dataItem.filledPoints;
                }
                graph_info.append($('<span><i style="background: ' + dataItem.color + '"></i>' + dataItem.label + "</span>"));
            }
            plot_obj = $.plot($(this), data, plot_settings);
            if (plot_settings.series.pie === undefined) {
                var previousPoint = null;
                $(this).bind("plothover", function(event, pos, item) {
                    if (item) {
                        if (previousPoint != item.dataIndex) {
                            previousPoint = item.dataIndex;
                            $("#tooltip").remove();
                            var x = item.datapoint[0], y = item.datapoint[1];
                            showTooltip(item.pageX, item.pageY, eval(settings.tooltipText));
                        }
                    } else {
                        $("#tooltip").remove();
                        previousPoint = null;
                    }
                });
            }
            $(window).resize(function() {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    timer = null;
                    updateContainerSize();
                }, 300);
            });
        });
        function showTooltip(x, y, contents) {
            var tooltip = $('<div id="tooltip">' + contents + "</div>").appendTo("body");
            if (x + 20 + tooltip.width() > wrapper.offset().left + wrapper.width()) {
                x -= 40 + tooltip.width();
            } else {
                x += 20;
            }
            tooltip.css({
                top: y - 16,
                left: x
            }).fadeIn();
        }
    };
})(jQuery);

(function(a) {
    a.fn.extend({
        afTasks: function(b) {
            if (!b || b && typeof b !== "string") {
                b = a.extend({}, a.afTasks._callbacks, b || {});
            }
            this.each(function() {
                var c = null;
                if (b && typeof b === "string") {
                    c = a.data(this, "afTasks");
                    if (b === "clearCompletedTasks") {
                        c.clearCompletedTasks(this);
                    }
                    return;
                }
                a.data(this, "afTasks", new a.afTasks(this, b));
            });
            return;
        }
    });
    a.afTasks = function(d, b) {
        var c = this;
        this.callbacks = b;
        this.clearCompletedTasks = function(e) {
            a(".completed", a(e)).hide(200, function() {
                a(this).remove();
            });
            this.callbacks.clearCallback(e);
        };
        a(".widget-tasks").on("click", ".task input[type=checkbox]", function(f) {
            a(this).parents(".task").toggleClass("completed");
            if (a(this).parents(".task").hasClass("completed")) {
                c.callbacks.completeCallback(d, f);
            } else {
                c.callbacks.cancelCallback(d, f);
            }
        });
        a(".widget-tasks").on("click", ".task a", function() {
            a("input", a(this).prev("div")).click();
            return false;
        });
    };
    a.afTasks._callbacks = {
        completeCallback: function(c, b) {},
        cancelCallback: function(c, b) {},
        clearCallback: function(b) {}
    };
})(jQuery);

(function(a) {
    a.fn.extend({
        afStarsRating: function(c, b) {
            if (!c || c && typeof c !== "string") {
                c = a.extend({}, a.afStarsRating.options, c || {});
            }
            this.each(function() {
                var d = null;
                if (c && typeof c === "string") {
                    d = a.data(this, "afStarsRating");
                    if (c === "setCurrentRating") {
                        d.setCurrentRating(b);
                    }
                    return;
                }
                a.data(this, "afStarsRating", new a.afStarsRating(a(this), c));
            });
            return;
        }
    });
    a.afStarsRating = function(e, b) {
        this.options = b;
        var c = this, f = a('<ul class="widget-stars-rating" />');
        for (var d = 0; d < this.options.stars_count; d++) {
            f.append('<li><a href="#" title="" class="icon-star"></a></li>');
        }
        e.append(f);
        a(".widget-stars-rating a", e).on("mouseenter", function() {
            a(".widget-stars-rating li", e).removeClass(c.options.class_active);
            a(this).parent().addClass(c.options.class_active).prevAll("li").addClass(c.options.class_active);
        }).on("mouseleave", function() {
            c.setCurrentRating(c.options.current_rating);
        }).on("click", function() {
            c.options.onSetRating(this, a(this).parent().prevAll("li").length + 1);
            return false;
        });
        this.setCurrentRating = function(g) {
            c.options.current_rating = g;
            if (g - Math.floor(g) > c.options.lower_limit) {
                g = Math.ceil(g);
            } else {
                g = Math.floor(g);
            }
            a(".widget-stars-rating li", e).removeClass(c.options.class_active).slice(0, g).addClass(c.options.class_active);
        };
        this.setCurrentRating(this.options.current_rating);
    };
    a.afStarsRating.options = {
        stars_count: 5,
        current_rating: 0,
        class_active: "active",
        lower_limit: .35,
        onSetRating: function(b, c) {}
    };
})(jQuery);

(function(a) {
    a.fn.extend({
        afStream: function(c, b) {
            if (!c || c && typeof c !== "string") {
                c = a.extend({}, a.afStream.options, c || {});
            }
            this.each(function() {
                var d = null;
                if (c && typeof c === "string") {
                    d = a.data(this, "afStream");
                    switch (c) {
                      case "addEvent":
                        d.addEvent(b);
                        break;

                      case "updateTime":
                        d.updateTime(true);
                        break;

                      case "showEvents":
                        d.showEvents(b);
                        break;

                      case "hideEvents":
                        d.hideEvents(b);
                        break;

                      case "showAllEvents":
                        d.showAllEvents();
                        break;

                      case "hideAllEvents":
                        d.hideAllEvents();
                        break;

                      case "clearAllEvents":
                        d.clearAllEvents();
                        break;

                      case "setUpdateInterval":
                        d.setUpdateInterval(b);
                        break;

                      case "setShowLimit":
                        d.setShowLimit(b);
                        break;
                    }
                    return;
                }
                a.data(this, "afStream", new a.afStream(a(this), c));
            });
            return;
        }
    });
    a.afStream = function(e, b) {
        this.options = b;
        this._update_timer = null;
        var d = this;
        this.options._available_events = [];
        for (var h in this.options.event_types) {
            this.options._available_events.push(h);
        }
        if (typeof this.options.show_only !== "array") {
            this.options.show_only = a.merge([], this.options._available_events);
        }
        e.append('<div class="stream-empty">No events</div>');
        if (this.options.height) {
            e.css({
                height: this.options.height,
                overflow: "hidden"
            });
        }
        this.addEvent = function(k) {
            if (!k.type || !k.message || d.options._available_events.indexOf(k.type) === -1) {
                return;
            }
            var j = a(k.icon ? k.icon : d.options.event_types[k.type].icon ? d.options.event_types[k.type].icon : "<div />").addClass("stream-icon"), l = a(d.options.template.replace(/\#\{\{type\}\}/gi, k.type).replace(/\#\{\{time\}\}/gi, timeAgo(k.time = !k.time ? new Date() : k.time)).replace(/\#\{\{caption\}\}/gi, k.caption ? k.caption : d.options.event_types[k.type].caption).replace(/\#\{\{message\}\}/gi, k.message)).prepend(j);
            a(".stream-empty", e).hide();
            d.updateTime(true);
            if (d.options.show_only.indexOf(k.type) === -1) {
                l.css({
                    display: "none"
                });
                e.prepend(l);
            } else {
                e.prepend(l);
                l.animate({
                    opacity: 1
                }, {
                    duration: 1e3
                });
            }
            l.each(function() {
                a.data(this, "stream-time", k.time);
            });
            f();
            if (d._update_timer) {
                clearTimeout(d._update_timer);
                d._update_timer = null;
            }
            if (d.options.update_interval) {
                d._update_timer = setTimeout(g, d.options.update_interval * 1e3);
            }
            d.options.onEventAdd(e);
        };
        var c = function(j) {
            if (typeof j === "string") {
                j = j.replace(/\s+?/gi, "").split(",");
            } else {
                if (typeof j !== "array") {
                    j = [];
                }
            }
            for (var k = 0; k < j.length; k++) {
                if (d.options._available_events.indexOf(j[k]) === -1) {
                    j.splice(k, 1);
                }
            }
            return j;
        };
        this.showEvents = function(j) {
            var l = c(j);
            for (var k = 0; k < l.length; k++) {
                if (d.options.show_only.indexOf(l[k]) === -1) {
                    d.options.show_only.push(l[k]);
                    a(".stream-event-" + l[k], e).css({
                        display: "block"
                    }).animate({
                        opacity: 1
                    }, {
                        duration: 500
                    });
                }
            }
            f();
        };
        this.hideEvents = function(j) {
            var l = c(j);
            for (var k = 0; k < l.length; k++) {
                if (d.options.show_only.indexOf(l[k]) !== -1) {
                    d.options.show_only.splice(d.options.show_only.indexOf(l[k]), 1);
                    a(".stream-event-" + l[k], e).animate({
                        opacity: 0
                    }, {
                        duration: 500,
                        complete: function() {
                            a(this).css({
                                display: "none"
                            });
                        }
                    });
                }
            }
            f();
        };
        this.showAllEvents = function() {
            d.showEvents(d.options._available_events);
        };
        this.hideAllEvents = function() {
            d.hideEvents(d.options._available_events);
        };
        this.clearAllEvents = function() {
            a(".stream-event", e).remove();
            a(".stream-empty", e).show();
        };
        this.setUpdateInterval = function(j) {
            d.options.update_interval = parseInt(j, 10);
            if (d._update_timer) {
                clearTimeout(d._update_timer);
                d._update_timer = null;
            }
            if (d.options.update_interval) {
                d._update_timer = setTimeout(g, d.options.update_interval * 1e3);
            }
        };
        this.setShowLimit = function(j) {
            d.options.show_limit = parseInt(j, 10);
            f();
        };
        this.updateTime = function(j) {
            j = typeof j !== "undefined" ? j : false;
            a(".stream-event", e).each(function() {
                a(".stream-time", a(this)).text(timeAgo(a.data(this, "stream-time")));
            });
            d.options.onTimeUpdate(e);
            if (!j && d.options.time_update_interval) {
                setTimeout(d.updateTime, d.options.time_update_interval * 1e3);
            }
        };
        if (this.options.time_update_interval) {
            setTimeout(this.updateTime, this.options.time_update_interval * 1e3);
        }
        var g = function() {
            d.options.onUpdate(e);
            if (d._update_timer) {
                clearTimeout(d._update_timer);
                d._update_timer = null;
            }
            if (d.options.update_interval) {
                d._update_timer = setTimeout(g, d.options.update_interval * 1e3);
            }
        };
        if (this.options.update_interval) {
            this._update_timer = setTimeout(g, this.options.update_interval * 1e3);
        }
        var f = function() {
            var l = a(".stream-event", e).filter(":visible");
            if (l.length === 0) {
                return;
            }
            if (d.options.show_limit && l.length > d.options.show_limit) {
                l.slice(d.options.show_limit).remove();
            }
            if (d.options.height) {
                var j, k = e.offset().top + d.options.height;
                while ((j = l.last()).offset().top > k) {
                    j.remove();
                }
            }
        };
    };
    a.afStream.options = {
        update_interval: 0,
        time_update_interval: 10,
        height: 0,
        show_limit: 0,
        template: '<div class="stream-event stream-event-#{{type}}"><div class="stream-time">#{{time}}</div><div class="stream-caption">#{{caption}}</div><div class="stream-message">#{{message}}</div></div>',
        event_types: {},
        show_only: "all",
        _available_events: [],
        onUpdate: function(b) {},
        onEventAdd: function(b) {},
        onTimeUpdate: function(b) {}
    };
})(jQuery);