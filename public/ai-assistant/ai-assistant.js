var Tc = { exports: {} }, zl = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ym;
function Cg() {
  if (ym) return zl;
  ym = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.fragment");
  function u(r, o, h) {
    var d = null;
    if (h !== void 0 && (d = "" + h), o.key !== void 0 && (d = "" + o.key), "key" in o) {
      h = {};
      for (var v in o)
        v !== "key" && (h[v] = o[v]);
    } else h = o;
    return o = h.ref, {
      $$typeof: n,
      type: r,
      key: d,
      ref: o !== void 0 ? o : null,
      props: h
    };
  }
  return zl.Fragment = i, zl.jsx = u, zl.jsxs = u, zl;
}
var gm;
function Mg() {
  return gm || (gm = 1, Tc.exports = Cg()), Tc.exports;
}
var m = Mg(), Ac = { exports: {} }, wl = {}, Oc = { exports: {} }, Nc = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var bm;
function Dg() {
  return bm || (bm = 1, (function(n) {
    function i(R, Y) {
      var ie = R.length;
      R.push(Y);
      e: for (; 0 < ie; ) {
        var ye = ie - 1 >>> 1, Se = R[ye];
        if (0 < o(Se, Y))
          R[ye] = Y, R[ie] = Se, ie = ye;
        else break e;
      }
    }
    function u(R) {
      return R.length === 0 ? null : R[0];
    }
    function r(R) {
      if (R.length === 0) return null;
      var Y = R[0], ie = R.pop();
      if (ie !== Y) {
        R[0] = ie;
        e: for (var ye = 0, Se = R.length, w = Se >>> 1; ye < w; ) {
          var Q = 2 * (ye + 1) - 1, K = R[Q], X = Q + 1, ue = R[X];
          if (0 > o(K, ie))
            X < Se && 0 > o(ue, K) ? (R[ye] = ue, R[X] = ie, ye = X) : (R[ye] = K, R[Q] = ie, ye = Q);
          else if (X < Se && 0 > o(ue, ie))
            R[ye] = ue, R[X] = ie, ye = X;
          else break e;
        }
      }
      return Y;
    }
    function o(R, Y) {
      var ie = R.sortIndex - Y.sortIndex;
      return ie !== 0 ? ie : R.id - Y.id;
    }
    if (n.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var h = performance;
      n.unstable_now = function() {
        return h.now();
      };
    } else {
      var d = Date, v = d.now();
      n.unstable_now = function() {
        return d.now() - v;
      };
    }
    var y = [], g = [], _ = 1, j = null, S = 3, A = !1, C = !1, M = !1, G = !1, U = typeof setTimeout == "function" ? setTimeout : null, I = typeof clearTimeout == "function" ? clearTimeout : null, ee = typeof setImmediate < "u" ? setImmediate : null;
    function L(R) {
      for (var Y = u(g); Y !== null; ) {
        if (Y.callback === null) r(g);
        else if (Y.startTime <= R)
          r(g), Y.sortIndex = Y.expirationTime, i(y, Y);
        else break;
        Y = u(g);
      }
    }
    function B(R) {
      if (M = !1, L(R), !C)
        if (u(y) !== null)
          C = !0, ae || (ae = !0, Be());
        else {
          var Y = u(g);
          Y !== null && wt(B, Y.startTime - R);
        }
    }
    var ae = !1, F = -1, te = 5, pe = -1;
    function Qe() {
      return G ? !0 : !(n.unstable_now() - pe < te);
    }
    function Le() {
      if (G = !1, ae) {
        var R = n.unstable_now();
        pe = R;
        var Y = !0;
        try {
          e: {
            C = !1, M && (M = !1, I(F), F = -1), A = !0;
            var ie = S;
            try {
              t: {
                for (L(R), j = u(y); j !== null && !(j.expirationTime > R && Qe()); ) {
                  var ye = j.callback;
                  if (typeof ye == "function") {
                    j.callback = null, S = j.priorityLevel;
                    var Se = ye(
                      j.expirationTime <= R
                    );
                    if (R = n.unstable_now(), typeof Se == "function") {
                      j.callback = Se, L(R), Y = !0;
                      break t;
                    }
                    j === u(y) && r(y), L(R);
                  } else r(y);
                  j = u(y);
                }
                if (j !== null) Y = !0;
                else {
                  var w = u(g);
                  w !== null && wt(
                    B,
                    w.startTime - R
                  ), Y = !1;
                }
              }
              break e;
            } finally {
              j = null, S = ie, A = !1;
            }
            Y = void 0;
          }
        } finally {
          Y ? Be() : ae = !1;
        }
      }
    }
    var Be;
    if (typeof ee == "function")
      Be = function() {
        ee(Le);
      };
    else if (typeof MessageChannel < "u") {
      var zt = new MessageChannel(), Jt = zt.port2;
      zt.port1.onmessage = Le, Be = function() {
        Jt.postMessage(null);
      };
    } else
      Be = function() {
        U(Le, 0);
      };
    function wt(R, Y) {
      F = U(function() {
        R(n.unstable_now());
      }, Y);
    }
    n.unstable_IdlePriority = 5, n.unstable_ImmediatePriority = 1, n.unstable_LowPriority = 4, n.unstable_NormalPriority = 3, n.unstable_Profiling = null, n.unstable_UserBlockingPriority = 2, n.unstable_cancelCallback = function(R) {
      R.callback = null;
    }, n.unstable_forceFrameRate = function(R) {
      0 > R || 125 < R ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : te = 0 < R ? Math.floor(1e3 / R) : 5;
    }, n.unstable_getCurrentPriorityLevel = function() {
      return S;
    }, n.unstable_next = function(R) {
      switch (S) {
        case 1:
        case 2:
        case 3:
          var Y = 3;
          break;
        default:
          Y = S;
      }
      var ie = S;
      S = Y;
      try {
        return R();
      } finally {
        S = ie;
      }
    }, n.unstable_requestPaint = function() {
      G = !0;
    }, n.unstable_runWithPriority = function(R, Y) {
      switch (R) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          R = 3;
      }
      var ie = S;
      S = R;
      try {
        return Y();
      } finally {
        S = ie;
      }
    }, n.unstable_scheduleCallback = function(R, Y, ie) {
      var ye = n.unstable_now();
      switch (typeof ie == "object" && ie !== null ? (ie = ie.delay, ie = typeof ie == "number" && 0 < ie ? ye + ie : ye) : ie = ye, R) {
        case 1:
          var Se = -1;
          break;
        case 2:
          Se = 250;
          break;
        case 5:
          Se = 1073741823;
          break;
        case 4:
          Se = 1e4;
          break;
        default:
          Se = 5e3;
      }
      return Se = ie + Se, R = {
        id: _++,
        callback: Y,
        priorityLevel: R,
        startTime: ie,
        expirationTime: Se,
        sortIndex: -1
      }, ie > ye ? (R.sortIndex = ie, i(g, R), u(y) === null && R === u(g) && (M ? (I(F), F = -1) : M = !0, wt(B, ie - ye))) : (R.sortIndex = Se, i(y, R), C || A || (C = !0, ae || (ae = !0, Be()))), R;
    }, n.unstable_shouldYield = Qe, n.unstable_wrapCallback = function(R) {
      var Y = S;
      return function() {
        var ie = S;
        S = Y;
        try {
          return R.apply(this, arguments);
        } finally {
          S = ie;
        }
      };
    };
  })(Nc)), Nc;
}
var _m;
function Rg() {
  return _m || (_m = 1, Oc.exports = Dg()), Oc.exports;
}
var Cc = { exports: {} }, se = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Sm;
function qg() {
  if (Sm) return se;
  Sm = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.portal"), u = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), o = Symbol.for("react.profiler"), h = Symbol.for("react.consumer"), d = Symbol.for("react.context"), v = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), _ = Symbol.for("react.lazy"), j = Symbol.for("react.activity"), S = Symbol.iterator;
  function A(w) {
    return w === null || typeof w != "object" ? null : (w = S && w[S] || w["@@iterator"], typeof w == "function" ? w : null);
  }
  var C = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, M = Object.assign, G = {};
  function U(w, Q, K) {
    this.props = w, this.context = Q, this.refs = G, this.updater = K || C;
  }
  U.prototype.isReactComponent = {}, U.prototype.setState = function(w, Q) {
    if (typeof w != "object" && typeof w != "function" && w != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, w, Q, "setState");
  }, U.prototype.forceUpdate = function(w) {
    this.updater.enqueueForceUpdate(this, w, "forceUpdate");
  };
  function I() {
  }
  I.prototype = U.prototype;
  function ee(w, Q, K) {
    this.props = w, this.context = Q, this.refs = G, this.updater = K || C;
  }
  var L = ee.prototype = new I();
  L.constructor = ee, M(L, U.prototype), L.isPureReactComponent = !0;
  var B = Array.isArray;
  function ae() {
  }
  var F = { H: null, A: null, T: null, S: null }, te = Object.prototype.hasOwnProperty;
  function pe(w, Q, K) {
    var X = K.ref;
    return {
      $$typeof: n,
      type: w,
      key: Q,
      ref: X !== void 0 ? X : null,
      props: K
    };
  }
  function Qe(w, Q) {
    return pe(w.type, Q, w.props);
  }
  function Le(w) {
    return typeof w == "object" && w !== null && w.$$typeof === n;
  }
  function Be(w) {
    var Q = { "=": "=0", ":": "=2" };
    return "$" + w.replace(/[=:]/g, function(K) {
      return Q[K];
    });
  }
  var zt = /\/+/g;
  function Jt(w, Q) {
    return typeof w == "object" && w !== null && w.key != null ? Be("" + w.key) : Q.toString(36);
  }
  function wt(w) {
    switch (w.status) {
      case "fulfilled":
        return w.value;
      case "rejected":
        throw w.reason;
      default:
        switch (typeof w.status == "string" ? w.then(ae, ae) : (w.status = "pending", w.then(
          function(Q) {
            w.status === "pending" && (w.status = "fulfilled", w.value = Q);
          },
          function(Q) {
            w.status === "pending" && (w.status = "rejected", w.reason = Q);
          }
        )), w.status) {
          case "fulfilled":
            return w.value;
          case "rejected":
            throw w.reason;
        }
    }
    throw w;
  }
  function R(w, Q, K, X, ue) {
    var oe = typeof w;
    (oe === "undefined" || oe === "boolean") && (w = null);
    var ge = !1;
    if (w === null) ge = !0;
    else
      switch (oe) {
        case "bigint":
        case "string":
        case "number":
          ge = !0;
          break;
        case "object":
          switch (w.$$typeof) {
            case n:
            case i:
              ge = !0;
              break;
            case _:
              return ge = w._init, R(
                ge(w._payload),
                Q,
                K,
                X,
                ue
              );
          }
      }
    if (ge)
      return ue = ue(w), ge = X === "" ? "." + Jt(w, 0) : X, B(ue) ? (K = "", ge != null && (K = ge.replace(zt, "$&/") + "/"), R(ue, Q, K, "", function(Mn) {
        return Mn;
      })) : ue != null && (Le(ue) && (ue = Qe(
        ue,
        K + (ue.key == null || w && w.key === ue.key ? "" : ("" + ue.key).replace(
          zt,
          "$&/"
        ) + "/") + ge
      )), Q.push(ue)), 1;
    ge = 0;
    var at = X === "" ? "." : X + ":";
    if (B(w))
      for (var De = 0; De < w.length; De++)
        X = w[De], oe = at + Jt(X, De), ge += R(
          X,
          Q,
          K,
          oe,
          ue
        );
    else if (De = A(w), typeof De == "function")
      for (w = De.call(w), De = 0; !(X = w.next()).done; )
        X = X.value, oe = at + Jt(X, De++), ge += R(
          X,
          Q,
          K,
          oe,
          ue
        );
    else if (oe === "object") {
      if (typeof w.then == "function")
        return R(
          wt(w),
          Q,
          K,
          X,
          ue
        );
      throw Q = String(w), Error(
        "Objects are not valid as a React child (found: " + (Q === "[object Object]" ? "object with keys {" + Object.keys(w).join(", ") + "}" : Q) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return ge;
  }
  function Y(w, Q, K) {
    if (w == null) return w;
    var X = [], ue = 0;
    return R(w, X, "", "", function(oe) {
      return Q.call(K, oe, ue++);
    }), X;
  }
  function ie(w) {
    if (w._status === -1) {
      var Q = w._result;
      Q = Q(), Q.then(
        function(K) {
          (w._status === 0 || w._status === -1) && (w._status = 1, w._result = K);
        },
        function(K) {
          (w._status === 0 || w._status === -1) && (w._status = 2, w._result = K);
        }
      ), w._status === -1 && (w._status = 0, w._result = Q);
    }
    if (w._status === 1) return w._result.default;
    throw w._result;
  }
  var ye = typeof reportError == "function" ? reportError : function(w) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var Q = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof w == "object" && w !== null && typeof w.message == "string" ? String(w.message) : String(w),
        error: w
      });
      if (!window.dispatchEvent(Q)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", w);
      return;
    }
    console.error(w);
  }, Se = {
    map: Y,
    forEach: function(w, Q, K) {
      Y(
        w,
        function() {
          Q.apply(this, arguments);
        },
        K
      );
    },
    count: function(w) {
      var Q = 0;
      return Y(w, function() {
        Q++;
      }), Q;
    },
    toArray: function(w) {
      return Y(w, function(Q) {
        return Q;
      }) || [];
    },
    only: function(w) {
      if (!Le(w))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return w;
    }
  };
  return se.Activity = j, se.Children = Se, se.Component = U, se.Fragment = u, se.Profiler = o, se.PureComponent = ee, se.StrictMode = r, se.Suspense = y, se.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = F, se.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(w) {
      return F.H.useMemoCache(w);
    }
  }, se.cache = function(w) {
    return function() {
      return w.apply(null, arguments);
    };
  }, se.cacheSignal = function() {
    return null;
  }, se.cloneElement = function(w, Q, K) {
    if (w == null)
      throw Error(
        "The argument must be a React element, but you passed " + w + "."
      );
    var X = M({}, w.props), ue = w.key;
    if (Q != null)
      for (oe in Q.key !== void 0 && (ue = "" + Q.key), Q)
        !te.call(Q, oe) || oe === "key" || oe === "__self" || oe === "__source" || oe === "ref" && Q.ref === void 0 || (X[oe] = Q[oe]);
    var oe = arguments.length - 2;
    if (oe === 1) X.children = K;
    else if (1 < oe) {
      for (var ge = Array(oe), at = 0; at < oe; at++)
        ge[at] = arguments[at + 2];
      X.children = ge;
    }
    return pe(w.type, ue, X);
  }, se.createContext = function(w) {
    return w = {
      $$typeof: d,
      _currentValue: w,
      _currentValue2: w,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, w.Provider = w, w.Consumer = {
      $$typeof: h,
      _context: w
    }, w;
  }, se.createElement = function(w, Q, K) {
    var X, ue = {}, oe = null;
    if (Q != null)
      for (X in Q.key !== void 0 && (oe = "" + Q.key), Q)
        te.call(Q, X) && X !== "key" && X !== "__self" && X !== "__source" && (ue[X] = Q[X]);
    var ge = arguments.length - 2;
    if (ge === 1) ue.children = K;
    else if (1 < ge) {
      for (var at = Array(ge), De = 0; De < ge; De++)
        at[De] = arguments[De + 2];
      ue.children = at;
    }
    if (w && w.defaultProps)
      for (X in ge = w.defaultProps, ge)
        ue[X] === void 0 && (ue[X] = ge[X]);
    return pe(w, oe, ue);
  }, se.createRef = function() {
    return { current: null };
  }, se.forwardRef = function(w) {
    return { $$typeof: v, render: w };
  }, se.isValidElement = Le, se.lazy = function(w) {
    return {
      $$typeof: _,
      _payload: { _status: -1, _result: w },
      _init: ie
    };
  }, se.memo = function(w, Q) {
    return {
      $$typeof: g,
      type: w,
      compare: Q === void 0 ? null : Q
    };
  }, se.startTransition = function(w) {
    var Q = F.T, K = {};
    F.T = K;
    try {
      var X = w(), ue = F.S;
      ue !== null && ue(K, X), typeof X == "object" && X !== null && typeof X.then == "function" && X.then(ae, ye);
    } catch (oe) {
      ye(oe);
    } finally {
      Q !== null && K.types !== null && (Q.types = K.types), F.T = Q;
    }
  }, se.unstable_useCacheRefresh = function() {
    return F.H.useCacheRefresh();
  }, se.use = function(w) {
    return F.H.use(w);
  }, se.useActionState = function(w, Q, K) {
    return F.H.useActionState(w, Q, K);
  }, se.useCallback = function(w, Q) {
    return F.H.useCallback(w, Q);
  }, se.useContext = function(w) {
    return F.H.useContext(w);
  }, se.useDebugValue = function() {
  }, se.useDeferredValue = function(w, Q) {
    return F.H.useDeferredValue(w, Q);
  }, se.useEffect = function(w, Q) {
    return F.H.useEffect(w, Q);
  }, se.useEffectEvent = function(w) {
    return F.H.useEffectEvent(w);
  }, se.useId = function() {
    return F.H.useId();
  }, se.useImperativeHandle = function(w, Q, K) {
    return F.H.useImperativeHandle(w, Q, K);
  }, se.useInsertionEffect = function(w, Q) {
    return F.H.useInsertionEffect(w, Q);
  }, se.useLayoutEffect = function(w, Q) {
    return F.H.useLayoutEffect(w, Q);
  }, se.useMemo = function(w, Q) {
    return F.H.useMemo(w, Q);
  }, se.useOptimistic = function(w, Q) {
    return F.H.useOptimistic(w, Q);
  }, se.useReducer = function(w, Q, K) {
    return F.H.useReducer(w, Q, K);
  }, se.useRef = function(w) {
    return F.H.useRef(w);
  }, se.useState = function(w) {
    return F.H.useState(w);
  }, se.useSyncExternalStore = function(w, Q, K) {
    return F.H.useSyncExternalStore(
      w,
      Q,
      K
    );
  }, se.useTransition = function() {
    return F.H.useTransition();
  }, se.version = "19.2.7", se;
}
var zm;
function Ic() {
  return zm || (zm = 1, Cc.exports = qg()), Cc.exports;
}
var Mc = { exports: {} }, ot = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var wm;
function Ug() {
  if (wm) return ot;
  wm = 1;
  var n = Ic();
  function i(y) {
    var g = "https://react.dev/errors/" + y;
    if (1 < arguments.length) {
      g += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var _ = 2; _ < arguments.length; _++)
        g += "&args[]=" + encodeURIComponent(arguments[_]);
    }
    return "Minified React error #" + y + "; visit " + g + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function u() {
  }
  var r = {
    d: {
      f: u,
      r: function() {
        throw Error(i(522));
      },
      D: u,
      C: u,
      L: u,
      m: u,
      X: u,
      S: u,
      M: u
    },
    p: 0,
    findDOMNode: null
  }, o = Symbol.for("react.portal");
  function h(y, g, _) {
    var j = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: o,
      key: j == null ? null : "" + j,
      children: y,
      containerInfo: g,
      implementation: _
    };
  }
  var d = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function v(y, g) {
    if (y === "font") return "";
    if (typeof g == "string")
      return g === "use-credentials" ? g : "";
  }
  return ot.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r, ot.createPortal = function(y, g) {
    var _ = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(i(299));
    return h(y, g, null, _);
  }, ot.flushSync = function(y) {
    var g = d.T, _ = r.p;
    try {
      if (d.T = null, r.p = 2, y) return y();
    } finally {
      d.T = g, r.p = _, r.d.f();
    }
  }, ot.preconnect = function(y, g) {
    typeof y == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, r.d.C(y, g));
  }, ot.prefetchDNS = function(y) {
    typeof y == "string" && r.d.D(y);
  }, ot.preinit = function(y, g) {
    if (typeof y == "string" && g && typeof g.as == "string") {
      var _ = g.as, j = v(_, g.crossOrigin), S = typeof g.integrity == "string" ? g.integrity : void 0, A = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      _ === "style" ? r.d.S(
        y,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: j,
          integrity: S,
          fetchPriority: A
        }
      ) : _ === "script" && r.d.X(y, {
        crossOrigin: j,
        integrity: S,
        fetchPriority: A,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, ot.preinitModule = function(y, g) {
    if (typeof y == "string")
      if (typeof g == "object" && g !== null) {
        if (g.as == null || g.as === "script") {
          var _ = v(
            g.as,
            g.crossOrigin
          );
          r.d.M(y, {
            crossOrigin: _,
            integrity: typeof g.integrity == "string" ? g.integrity : void 0,
            nonce: typeof g.nonce == "string" ? g.nonce : void 0
          });
        }
      } else g == null && r.d.M(y);
  }, ot.preload = function(y, g) {
    if (typeof y == "string" && typeof g == "object" && g !== null && typeof g.as == "string") {
      var _ = g.as, j = v(_, g.crossOrigin);
      r.d.L(y, _, {
        crossOrigin: j,
        integrity: typeof g.integrity == "string" ? g.integrity : void 0,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0,
        type: typeof g.type == "string" ? g.type : void 0,
        fetchPriority: typeof g.fetchPriority == "string" ? g.fetchPriority : void 0,
        referrerPolicy: typeof g.referrerPolicy == "string" ? g.referrerPolicy : void 0,
        imageSrcSet: typeof g.imageSrcSet == "string" ? g.imageSrcSet : void 0,
        imageSizes: typeof g.imageSizes == "string" ? g.imageSizes : void 0,
        media: typeof g.media == "string" ? g.media : void 0
      });
    }
  }, ot.preloadModule = function(y, g) {
    if (typeof y == "string")
      if (g) {
        var _ = v(g.as, g.crossOrigin);
        r.d.m(y, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: _,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else r.d.m(y);
  }, ot.requestFormReset = function(y) {
    r.d.r(y);
  }, ot.unstable_batchedUpdates = function(y, g) {
    return y(g);
  }, ot.useFormState = function(y, g, _) {
    return d.H.useFormState(y, g, _);
  }, ot.useFormStatus = function() {
    return d.H.useHostTransitionStatus();
  }, ot.version = "19.2.7", ot;
}
var jm;
function Zg() {
  if (jm) return Mc.exports;
  jm = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Mc.exports = Ug(), Mc.exports;
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var xm;
function Qg() {
  if (xm) return wl;
  xm = 1;
  var n = Rg(), i = Ic(), u = Zg();
  function r(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var a = 2; a < arguments.length; a++)
        t += "&args[]=" + encodeURIComponent(arguments[a]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function o(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function h(e) {
    var t = e, a = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do
        t = e, (t.flags & 4098) !== 0 && (a = t.return), e = t.return;
      while (e);
    }
    return t.tag === 3 ? a : null;
  }
  function d(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function v(e) {
    if (e.tag === 31) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function y(e) {
    if (h(e) !== e)
      throw Error(r(188));
  }
  function g(e) {
    var t = e.alternate;
    if (!t) {
      if (t = h(e), t === null) throw Error(r(188));
      return t !== e ? null : e;
    }
    for (var a = e, l = t; ; ) {
      var s = a.return;
      if (s === null) break;
      var c = s.alternate;
      if (c === null) {
        if (l = s.return, l !== null) {
          a = l;
          continue;
        }
        break;
      }
      if (s.child === c.child) {
        for (c = s.child; c; ) {
          if (c === a) return y(s), e;
          if (c === l) return y(s), t;
          c = c.sibling;
        }
        throw Error(r(188));
      }
      if (a.return !== l.return) a = s, l = c;
      else {
        for (var f = !1, p = s.child; p; ) {
          if (p === a) {
            f = !0, a = s, l = c;
            break;
          }
          if (p === l) {
            f = !0, l = s, a = c;
            break;
          }
          p = p.sibling;
        }
        if (!f) {
          for (p = c.child; p; ) {
            if (p === a) {
              f = !0, a = c, l = s;
              break;
            }
            if (p === l) {
              f = !0, l = c, a = s;
              break;
            }
            p = p.sibling;
          }
          if (!f) throw Error(r(189));
        }
      }
      if (a.alternate !== l) throw Error(r(190));
    }
    if (a.tag !== 3) throw Error(r(188));
    return a.stateNode.current === a ? e : t;
  }
  function _(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e;
    for (e = e.child; e !== null; ) {
      if (t = _(e), t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var j = Object.assign, S = Symbol.for("react.element"), A = Symbol.for("react.transitional.element"), C = Symbol.for("react.portal"), M = Symbol.for("react.fragment"), G = Symbol.for("react.strict_mode"), U = Symbol.for("react.profiler"), I = Symbol.for("react.consumer"), ee = Symbol.for("react.context"), L = Symbol.for("react.forward_ref"), B = Symbol.for("react.suspense"), ae = Symbol.for("react.suspense_list"), F = Symbol.for("react.memo"), te = Symbol.for("react.lazy"), pe = Symbol.for("react.activity"), Qe = Symbol.for("react.memo_cache_sentinel"), Le = Symbol.iterator;
  function Be(e) {
    return e === null || typeof e != "object" ? null : (e = Le && e[Le] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var zt = Symbol.for("react.client.reference");
  function Jt(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === zt ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case M:
        return "Fragment";
      case U:
        return "Profiler";
      case G:
        return "StrictMode";
      case B:
        return "Suspense";
      case ae:
        return "SuspenseList";
      case pe:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case C:
          return "Portal";
        case ee:
          return e.displayName || "Context";
        case I:
          return (e._context.displayName || "Context") + ".Consumer";
        case L:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case F:
          return t = e.displayName || null, t !== null ? t : Jt(e.type) || "Memo";
        case te:
          t = e._payload, e = e._init;
          try {
            return Jt(e(t));
          } catch {
          }
      }
    return null;
  }
  var wt = Array.isArray, R = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Y = u.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ie = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, ye = [], Se = -1;
  function w(e) {
    return { current: e };
  }
  function Q(e) {
    0 > Se || (e.current = ye[Se], ye[Se] = null, Se--);
  }
  function K(e, t) {
    Se++, ye[Se] = e.current, e.current = t;
  }
  var X = w(null), ue = w(null), oe = w(null), ge = w(null);
  function at(e, t) {
    switch (K(oe, t), K(ue, e), K(X, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Bh(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Bh(t), e = $h(t, e);
        else
          switch (e) {
            case "svg":
              e = 1;
              break;
            case "math":
              e = 2;
              break;
            default:
              e = 0;
          }
    }
    Q(X), K(X, e);
  }
  function De() {
    Q(X), Q(ue), Q(oe);
  }
  function Mn(e) {
    e.memoizedState !== null && K(ge, e);
    var t = X.current, a = $h(t, e.type);
    t !== a && (K(ue, e), K(X, a));
  }
  function ca(e) {
    ue.current === e && (Q(X), Q(ue)), ge.current === e && (Q(ge), gl._currentValue = ie);
  }
  var tn, Ti;
  function rn(e) {
    if (tn === void 0)
      try {
        throw Error();
      } catch (a) {
        var t = a.stack.trim().match(/\n( *(at )?)/);
        tn = t && t[1] || "", Ti = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + tn + e + Ti;
  }
  var Ai = !1;
  function $(e, t) {
    if (!e || Ai) return "";
    Ai = !0;
    var a = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var l = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var H = function() {
                throw Error();
              };
              if (Object.defineProperty(H.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(H, []);
                } catch (N) {
                  var O = N;
                }
                Reflect.construct(e, [], H);
              } else {
                try {
                  H.call();
                } catch (N) {
                  O = N;
                }
                e.call(H.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (N) {
                O = N;
              }
              (H = e()) && typeof H.catch == "function" && H.catch(function() {
              });
            }
          } catch (N) {
            if (N && O && typeof N.stack == "string")
              return [N.stack, O.stack];
          }
          return [null, null];
        }
      };
      l.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var s = Object.getOwnPropertyDescriptor(
        l.DetermineComponentFrameRoot,
        "name"
      );
      s && s.configurable && Object.defineProperty(
        l.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var c = l.DetermineComponentFrameRoot(), f = c[0], p = c[1];
      if (f && p) {
        var b = f.split(`
`), T = p.split(`
`);
        for (s = l = 0; l < b.length && !b[l].includes("DetermineComponentFrameRoot"); )
          l++;
        for (; s < T.length && !T[s].includes(
          "DetermineComponentFrameRoot"
        ); )
          s++;
        if (l === b.length || s === T.length)
          for (l = b.length - 1, s = T.length - 1; 1 <= l && 0 <= s && b[l] !== T[s]; )
            s--;
        for (; 1 <= l && 0 <= s; l--, s--)
          if (b[l] !== T[s]) {
            if (l !== 1 || s !== 1)
              do
                if (l--, s--, 0 > s || b[l] !== T[s]) {
                  var D = `
` + b[l].replace(" at new ", " at ");
                  return e.displayName && D.includes("<anonymous>") && (D = D.replace("<anonymous>", e.displayName)), D;
                }
              while (1 <= l && 0 <= s);
            break;
          }
      }
    } finally {
      Ai = !1, Error.prepareStackTrace = a;
    }
    return (a = e ? e.displayName || e.name : "") ? rn(a) : "";
  }
  function we(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return rn(e.type);
      case 16:
        return rn("Lazy");
      case 13:
        return e.child !== t && t !== null ? rn("Suspense Fallback") : rn("Suspense");
      case 19:
        return rn("SuspenseList");
      case 0:
      case 15:
        return $(e.type, !1);
      case 11:
        return $(e.type.render, !1);
      case 1:
        return $(e.type, !0);
      case 31:
        return rn("Activity");
      default:
        return "";
    }
  }
  function Ke(e) {
    try {
      var t = "", a = null;
      do
        t += we(e, a), a = e, e = e.return;
      while (e);
      return t;
    } catch (l) {
      return `
Error generating stack: ` + l.message + `
` + l.stack;
    }
  }
  var Oi = Object.prototype.hasOwnProperty, hs = n.unstable_scheduleCallback, ms = n.unstable_cancelCallback, cv = n.unstable_shouldYield, ov = n.unstable_requestPaint, jt = n.unstable_now, fv = n.unstable_getCurrentPriorityLevel, yo = n.unstable_ImmediatePriority, go = n.unstable_UserBlockingPriority, Ol = n.unstable_NormalPriority, dv = n.unstable_LowPriority, bo = n.unstable_IdlePriority, hv = n.log, mv = n.unstable_setDisableYieldValue, Ni = null, xt = null;
  function Dn(e) {
    if (typeof hv == "function" && mv(e), xt && typeof xt.setStrictMode == "function")
      try {
        xt.setStrictMode(Ni, e);
      } catch {
      }
  }
  var Et = Math.clz32 ? Math.clz32 : yv, pv = Math.log, vv = Math.LN2;
  function yv(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (pv(e) / vv | 0) | 0;
  }
  var Nl = 256, Cl = 262144, Ml = 4194304;
  function oa(e) {
    var t = e & 42;
    if (t !== 0) return t;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function Dl(e, t, a) {
    var l = e.pendingLanes;
    if (l === 0) return 0;
    var s = 0, c = e.suspendedLanes, f = e.pingedLanes;
    e = e.warmLanes;
    var p = l & 134217727;
    return p !== 0 ? (l = p & ~c, l !== 0 ? s = oa(l) : (f &= p, f !== 0 ? s = oa(f) : a || (a = p & ~e, a !== 0 && (s = oa(a))))) : (p = l & ~c, p !== 0 ? s = oa(p) : f !== 0 ? s = oa(f) : a || (a = l & ~e, a !== 0 && (s = oa(a)))), s === 0 ? 0 : t !== 0 && t !== s && (t & c) === 0 && (c = s & -s, a = t & -t, c >= a || c === 32 && (a & 4194048) !== 0) ? t : s;
  }
  function Ci(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function gv(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function _o() {
    var e = Ml;
    return Ml <<= 1, (Ml & 62914560) === 0 && (Ml = 4194304), e;
  }
  function ps(e) {
    for (var t = [], a = 0; 31 > a; a++) t.push(e);
    return t;
  }
  function Mi(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function bv(e, t, a, l, s, c) {
    var f = e.pendingLanes;
    e.pendingLanes = a, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= a, e.entangledLanes &= a, e.errorRecoveryDisabledLanes &= a, e.shellSuspendCounter = 0;
    var p = e.entanglements, b = e.expirationTimes, T = e.hiddenUpdates;
    for (a = f & ~a; 0 < a; ) {
      var D = 31 - Et(a), H = 1 << D;
      p[D] = 0, b[D] = -1;
      var O = T[D];
      if (O !== null)
        for (T[D] = null, D = 0; D < O.length; D++) {
          var N = O[D];
          N !== null && (N.lane &= -536870913);
        }
      a &= ~H;
    }
    l !== 0 && So(e, l, 0), c !== 0 && s === 0 && e.tag !== 0 && (e.suspendedLanes |= c & ~(f & ~t));
  }
  function So(e, t, a) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var l = 31 - Et(t);
    e.entangledLanes |= t, e.entanglements[l] = e.entanglements[l] | 1073741824 | a & 261930;
  }
  function zo(e, t) {
    var a = e.entangledLanes |= t;
    for (e = e.entanglements; a; ) {
      var l = 31 - Et(a), s = 1 << l;
      s & t | e[l] & t && (e[l] |= t), a &= ~s;
    }
  }
  function wo(e, t) {
    var a = t & -t;
    return a = (a & 42) !== 0 ? 1 : vs(a), (a & (e.suspendedLanes | t)) !== 0 ? 0 : a;
  }
  function vs(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function ys(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function jo() {
    var e = Y.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : om(e.type));
  }
  function xo(e, t) {
    var a = Y.p;
    try {
      return Y.p = e, t();
    } finally {
      Y.p = a;
    }
  }
  var Rn = Math.random().toString(36).slice(2), it = "__reactFiber$" + Rn, mt = "__reactProps$" + Rn, Ra = "__reactContainer$" + Rn, gs = "__reactEvents$" + Rn, _v = "__reactListeners$" + Rn, Sv = "__reactHandles$" + Rn, Eo = "__reactResources$" + Rn, Di = "__reactMarker$" + Rn;
  function bs(e) {
    delete e[it], delete e[mt], delete e[gs], delete e[_v], delete e[Sv];
  }
  function qa(e) {
    var t = e[it];
    if (t) return t;
    for (var a = e.parentNode; a; ) {
      if (t = a[Ra] || a[it]) {
        if (a = t.alternate, t.child !== null || a !== null && a.child !== null)
          for (e = Vh(e); e !== null; ) {
            if (a = e[it]) return a;
            e = Vh(e);
          }
        return t;
      }
      e = a, a = e.parentNode;
    }
    return null;
  }
  function Ua(e) {
    if (e = e[it] || e[Ra]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function Ri(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(r(33));
  }
  function Za(e) {
    var t = e[Eo];
    return t || (t = e[Eo] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function tt(e) {
    e[Di] = !0;
  }
  var To = /* @__PURE__ */ new Set(), Ao = {};
  function fa(e, t) {
    Qa(e, t), Qa(e + "Capture", t);
  }
  function Qa(e, t) {
    for (Ao[e] = t, e = 0; e < t.length; e++)
      To.add(t[e]);
  }
  var zv = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Oo = {}, No = {};
  function wv(e) {
    return Oi.call(No, e) ? !0 : Oi.call(Oo, e) ? !1 : zv.test(e) ? No[e] = !0 : (Oo[e] = !0, !1);
  }
  function Rl(e, t, a) {
    if (wv(t))
      if (a === null) e.removeAttribute(t);
      else {
        switch (typeof a) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(t);
            return;
          case "boolean":
            var l = t.toLowerCase().slice(0, 5);
            if (l !== "data-" && l !== "aria-") {
              e.removeAttribute(t);
              return;
            }
        }
        e.setAttribute(t, "" + a);
      }
  }
  function ql(e, t, a) {
    if (a === null) e.removeAttribute(t);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(t);
          return;
      }
      e.setAttribute(t, "" + a);
    }
  }
  function cn(e, t, a, l) {
    if (l === null) e.removeAttribute(a);
    else {
      switch (typeof l) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(a);
          return;
      }
      e.setAttributeNS(t, a, "" + l);
    }
  }
  function qt(e) {
    switch (typeof e) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Co(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function jv(e, t, a) {
    var l = Object.getOwnPropertyDescriptor(
      e.constructor.prototype,
      t
    );
    if (!e.hasOwnProperty(t) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
      var s = l.get, c = l.set;
      return Object.defineProperty(e, t, {
        configurable: !0,
        get: function() {
          return s.call(this);
        },
        set: function(f) {
          a = "" + f, c.call(this, f);
        }
      }), Object.defineProperty(e, t, {
        enumerable: l.enumerable
      }), {
        getValue: function() {
          return a;
        },
        setValue: function(f) {
          a = "" + f;
        },
        stopTracking: function() {
          e._valueTracker = null, delete e[t];
        }
      };
    }
  }
  function _s(e) {
    if (!e._valueTracker) {
      var t = Co(e) ? "checked" : "value";
      e._valueTracker = jv(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function Mo(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var a = t.getValue(), l = "";
    return e && (l = Co(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== a ? (t.setValue(e), !0) : !1;
  }
  function Ul(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var xv = /[\n"\\]/g;
  function Ut(e) {
    return e.replace(
      xv,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function Ss(e, t, a, l, s, c, f, p) {
    e.name = "", f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? e.type = f : e.removeAttribute("type"), t != null ? f === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + qt(t)) : e.value !== "" + qt(t) && (e.value = "" + qt(t)) : f !== "submit" && f !== "reset" || e.removeAttribute("value"), t != null ? zs(e, f, qt(t)) : a != null ? zs(e, f, qt(a)) : l != null && e.removeAttribute("value"), s == null && c != null && (e.defaultChecked = !!c), s != null && (e.checked = s && typeof s != "function" && typeof s != "symbol"), p != null && typeof p != "function" && typeof p != "symbol" && typeof p != "boolean" ? e.name = "" + qt(p) : e.removeAttribute("name");
  }
  function Do(e, t, a, l, s, c, f, p) {
    if (c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (e.type = c), t != null || a != null) {
      if (!(c !== "submit" && c !== "reset" || t != null)) {
        _s(e);
        return;
      }
      a = a != null ? "" + qt(a) : "", t = t != null ? "" + qt(t) : a, p || t === e.value || (e.value = t), e.defaultValue = t;
    }
    l = l ?? s, l = typeof l != "function" && typeof l != "symbol" && !!l, e.checked = p ? e.checked : !!l, e.defaultChecked = !!l, f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" && (e.name = f), _s(e);
  }
  function zs(e, t, a) {
    t === "number" && Ul(e.ownerDocument) === e || e.defaultValue === "" + a || (e.defaultValue = "" + a);
  }
  function Ha(e, t, a, l) {
    if (e = e.options, t) {
      t = {};
      for (var s = 0; s < a.length; s++)
        t["$" + a[s]] = !0;
      for (a = 0; a < e.length; a++)
        s = t.hasOwnProperty("$" + e[a].value), e[a].selected !== s && (e[a].selected = s), s && l && (e[a].defaultSelected = !0);
    } else {
      for (a = "" + qt(a), t = null, s = 0; s < e.length; s++) {
        if (e[s].value === a) {
          e[s].selected = !0, l && (e[s].defaultSelected = !0);
          return;
        }
        t !== null || e[s].disabled || (t = e[s]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Ro(e, t, a) {
    if (t != null && (t = "" + qt(t), t !== e.value && (e.value = t), a == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = a != null ? "" + qt(a) : "";
  }
  function qo(e, t, a, l) {
    if (t == null) {
      if (l != null) {
        if (a != null) throw Error(r(92));
        if (wt(l)) {
          if (1 < l.length) throw Error(r(93));
          l = l[0];
        }
        a = l;
      }
      a == null && (a = ""), t = a;
    }
    a = qt(t), e.defaultValue = a, l = e.textContent, l === a && l !== "" && l !== null && (e.value = l), _s(e);
  }
  function Ba(e, t) {
    if (t) {
      var a = e.firstChild;
      if (a && a === e.lastChild && a.nodeType === 3) {
        a.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Ev = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function Uo(e, t, a) {
    var l = t.indexOf("--") === 0;
    a == null || typeof a == "boolean" || a === "" ? l ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : l ? e.setProperty(t, a) : typeof a != "number" || a === 0 || Ev.has(t) ? t === "float" ? e.cssFloat = a : e[t] = ("" + a).trim() : e[t] = a + "px";
  }
  function Zo(e, t, a) {
    if (t != null && typeof t != "object")
      throw Error(r(62));
    if (e = e.style, a != null) {
      for (var l in a)
        !a.hasOwnProperty(l) || t != null && t.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
      for (var s in t)
        l = t[s], t.hasOwnProperty(s) && a[s] !== l && Uo(e, s, l);
    } else
      for (var c in t)
        t.hasOwnProperty(c) && Uo(e, c, t[c]);
  }
  function ws(e) {
    if (e.indexOf("-") === -1) return !1;
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Tv = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), Av = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Zl(e) {
    return Av.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function on() {
  }
  var js = null;
  function xs(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var $a = null, ka = null;
  function Qo(e) {
    var t = Ua(e);
    if (t && (e = t.stateNode)) {
      var a = e[mt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (Ss(
            e,
            a.value,
            a.defaultValue,
            a.defaultValue,
            a.checked,
            a.defaultChecked,
            a.type,
            a.name
          ), t = a.name, a.type === "radio" && t != null) {
            for (a = e; a.parentNode; ) a = a.parentNode;
            for (a = a.querySelectorAll(
              'input[name="' + Ut(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < a.length; t++) {
              var l = a[t];
              if (l !== e && l.form === e.form) {
                var s = l[mt] || null;
                if (!s) throw Error(r(90));
                Ss(
                  l,
                  s.value,
                  s.defaultValue,
                  s.defaultValue,
                  s.checked,
                  s.defaultChecked,
                  s.type,
                  s.name
                );
              }
            }
            for (t = 0; t < a.length; t++)
              l = a[t], l.form === e.form && Mo(l);
          }
          break e;
        case "textarea":
          Ro(e, a.value, a.defaultValue);
          break e;
        case "select":
          t = a.value, t != null && Ha(e, !!a.multiple, t, !1);
      }
    }
  }
  var Es = !1;
  function Ho(e, t, a) {
    if (Es) return e(t, a);
    Es = !0;
    try {
      var l = e(t);
      return l;
    } finally {
      if (Es = !1, ($a !== null || ka !== null) && (ju(), $a && (t = $a, e = ka, ka = $a = null, Qo(t), e)))
        for (t = 0; t < e.length; t++) Qo(e[t]);
    }
  }
  function qi(e, t) {
    var a = e.stateNode;
    if (a === null) return null;
    var l = a[mt] || null;
    if (l === null) return null;
    a = l[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (l = !l.disabled) || (e = e.type, l = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !l;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (a && typeof a != "function")
      throw Error(
        r(231, t, typeof a)
      );
    return a;
  }
  var fn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Ts = !1;
  if (fn)
    try {
      var Ui = {};
      Object.defineProperty(Ui, "passive", {
        get: function() {
          Ts = !0;
        }
      }), window.addEventListener("test", Ui, Ui), window.removeEventListener("test", Ui, Ui);
    } catch {
      Ts = !1;
    }
  var qn = null, As = null, Ql = null;
  function Bo() {
    if (Ql) return Ql;
    var e, t = As, a = t.length, l, s = "value" in qn ? qn.value : qn.textContent, c = s.length;
    for (e = 0; e < a && t[e] === s[e]; e++) ;
    var f = a - e;
    for (l = 1; l <= f && t[a - l] === s[c - l]; l++) ;
    return Ql = s.slice(e, 1 < l ? 1 - l : void 0);
  }
  function Hl(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Bl() {
    return !0;
  }
  function $o() {
    return !1;
  }
  function pt(e) {
    function t(a, l, s, c, f) {
      this._reactName = a, this._targetInst = s, this.type = l, this.nativeEvent = c, this.target = f, this.currentTarget = null;
      for (var p in e)
        e.hasOwnProperty(p) && (a = e[p], this[p] = a ? a(c) : c[p]);
      return this.isDefaultPrevented = (c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1) ? Bl : $o, this.isPropagationStopped = $o, this;
    }
    return j(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var a = this.nativeEvent;
        a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = Bl);
      },
      stopPropagation: function() {
        var a = this.nativeEvent;
        a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = Bl);
      },
      persist: function() {
      },
      isPersistent: Bl
    }), t;
  }
  var da = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, $l = pt(da), Zi = j({}, da, { view: 0, detail: 0 }), Ov = pt(Zi), Os, Ns, Qi, kl = j({}, Zi, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Ms,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== Qi && (Qi && e.type === "mousemove" ? (Os = e.screenX - Qi.screenX, Ns = e.screenY - Qi.screenY) : Ns = Os = 0, Qi = e), Os);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : Ns;
    }
  }), ko = pt(kl), Nv = j({}, kl, { dataTransfer: 0 }), Cv = pt(Nv), Mv = j({}, Zi, { relatedTarget: 0 }), Cs = pt(Mv), Dv = j({}, da, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Rv = pt(Dv), qv = j({}, da, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Uv = pt(qv), Zv = j({}, da, { data: 0 }), Lo = pt(Zv), Qv = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, Hv = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Bv = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function $v(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = Bv[e]) ? !!t[e] : !1;
  }
  function Ms() {
    return $v;
  }
  var kv = j({}, Zi, {
    key: function(e) {
      if (e.key) {
        var t = Qv[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = Hl(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Hv[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Ms,
    charCode: function(e) {
      return e.type === "keypress" ? Hl(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? Hl(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), Lv = pt(kv), Gv = j({}, kl, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), Go = pt(Gv), Yv = j({}, Zi, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Ms
  }), Kv = pt(Yv), Xv = j({}, da, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Vv = pt(Xv), Jv = j({}, kl, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Fv = pt(Jv), Iv = j({}, da, {
    newState: 0,
    oldState: 0
  }), Wv = pt(Iv), Pv = [9, 13, 27, 32], Ds = fn && "CompositionEvent" in window, Hi = null;
  fn && "documentMode" in document && (Hi = document.documentMode);
  var ey = fn && "TextEvent" in window && !Hi, Yo = fn && (!Ds || Hi && 8 < Hi && 11 >= Hi), Ko = " ", Xo = !1;
  function Vo(e, t) {
    switch (e) {
      case "keyup":
        return Pv.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Jo(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var La = !1;
  function ty(e, t) {
    switch (e) {
      case "compositionend":
        return Jo(t);
      case "keypress":
        return t.which !== 32 ? null : (Xo = !0, Ko);
      case "textInput":
        return e = t.data, e === Ko && Xo ? null : e;
      default:
        return null;
    }
  }
  function ny(e, t) {
    if (La)
      return e === "compositionend" || !Ds && Vo(e, t) ? (e = Bo(), Ql = As = qn = null, La = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length)
            return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return Yo && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var ay = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function Fo(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!ay[e.type] : t === "textarea";
  }
  function Io(e, t, a, l) {
    $a ? ka ? ka.push(l) : ka = [l] : $a = l, t = Cu(t, "onChange"), 0 < t.length && (a = new $l(
      "onChange",
      "change",
      null,
      a,
      l
    ), e.push({ event: a, listeners: t }));
  }
  var Bi = null, $i = null;
  function iy(e) {
    Rh(e, 0);
  }
  function Ll(e) {
    var t = Ri(e);
    if (Mo(t)) return e;
  }
  function Wo(e, t) {
    if (e === "change") return t;
  }
  var Po = !1;
  if (fn) {
    var Rs;
    if (fn) {
      var qs = "oninput" in document;
      if (!qs) {
        var ef = document.createElement("div");
        ef.setAttribute("oninput", "return;"), qs = typeof ef.oninput == "function";
      }
      Rs = qs;
    } else Rs = !1;
    Po = Rs && (!document.documentMode || 9 < document.documentMode);
  }
  function tf() {
    Bi && (Bi.detachEvent("onpropertychange", nf), $i = Bi = null);
  }
  function nf(e) {
    if (e.propertyName === "value" && Ll($i)) {
      var t = [];
      Io(
        t,
        $i,
        e,
        xs(e)
      ), Ho(iy, t);
    }
  }
  function ly(e, t, a) {
    e === "focusin" ? (tf(), Bi = t, $i = a, Bi.attachEvent("onpropertychange", nf)) : e === "focusout" && tf();
  }
  function uy(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Ll($i);
  }
  function sy(e, t) {
    if (e === "click") return Ll(t);
  }
  function ry(e, t) {
    if (e === "input" || e === "change")
      return Ll(t);
  }
  function cy(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Tt = typeof Object.is == "function" ? Object.is : cy;
  function ki(e, t) {
    if (Tt(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var a = Object.keys(e), l = Object.keys(t);
    if (a.length !== l.length) return !1;
    for (l = 0; l < a.length; l++) {
      var s = a[l];
      if (!Oi.call(t, s) || !Tt(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  function af(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function lf(e, t) {
    var a = af(e);
    e = 0;
    for (var l; a; ) {
      if (a.nodeType === 3) {
        if (l = e + a.textContent.length, e <= t && l >= t)
          return { node: a, offset: t - e };
        e = l;
      }
      e: {
        for (; a; ) {
          if (a.nextSibling) {
            a = a.nextSibling;
            break e;
          }
          a = a.parentNode;
        }
        a = void 0;
      }
      a = af(a);
    }
  }
  function uf(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? uf(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function sf(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = Ul(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var a = typeof t.contentWindow.location.href == "string";
      } catch {
        a = !1;
      }
      if (a) e = t.contentWindow;
      else break;
      t = Ul(e.document);
    }
    return t;
  }
  function Us(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var oy = fn && "documentMode" in document && 11 >= document.documentMode, Ga = null, Zs = null, Li = null, Qs = !1;
  function rf(e, t, a) {
    var l = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
    Qs || Ga == null || Ga !== Ul(l) || (l = Ga, "selectionStart" in l && Us(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = {
      anchorNode: l.anchorNode,
      anchorOffset: l.anchorOffset,
      focusNode: l.focusNode,
      focusOffset: l.focusOffset
    }), Li && ki(Li, l) || (Li = l, l = Cu(Zs, "onSelect"), 0 < l.length && (t = new $l(
      "onSelect",
      "select",
      null,
      t,
      a
    ), e.push({ event: t, listeners: l }), t.target = Ga)));
  }
  function ha(e, t) {
    var a = {};
    return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
  }
  var Ya = {
    animationend: ha("Animation", "AnimationEnd"),
    animationiteration: ha("Animation", "AnimationIteration"),
    animationstart: ha("Animation", "AnimationStart"),
    transitionrun: ha("Transition", "TransitionRun"),
    transitionstart: ha("Transition", "TransitionStart"),
    transitioncancel: ha("Transition", "TransitionCancel"),
    transitionend: ha("Transition", "TransitionEnd")
  }, Hs = {}, cf = {};
  fn && (cf = document.createElement("div").style, "AnimationEvent" in window || (delete Ya.animationend.animation, delete Ya.animationiteration.animation, delete Ya.animationstart.animation), "TransitionEvent" in window || delete Ya.transitionend.transition);
  function ma(e) {
    if (Hs[e]) return Hs[e];
    if (!Ya[e]) return e;
    var t = Ya[e], a;
    for (a in t)
      if (t.hasOwnProperty(a) && a in cf)
        return Hs[e] = t[a];
    return e;
  }
  var of = ma("animationend"), ff = ma("animationiteration"), df = ma("animationstart"), fy = ma("transitionrun"), dy = ma("transitionstart"), hy = ma("transitioncancel"), hf = ma("transitionend"), mf = /* @__PURE__ */ new Map(), Bs = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Bs.push("scrollEnd");
  function Ft(e, t) {
    mf.set(e, t), fa(t, [e]);
  }
  var Gl = typeof reportError == "function" ? reportError : function(e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
        error: e
      });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
    console.error(e);
  }, Zt = [], Ka = 0, $s = 0;
  function Yl() {
    for (var e = Ka, t = $s = Ka = 0; t < e; ) {
      var a = Zt[t];
      Zt[t++] = null;
      var l = Zt[t];
      Zt[t++] = null;
      var s = Zt[t];
      Zt[t++] = null;
      var c = Zt[t];
      if (Zt[t++] = null, l !== null && s !== null) {
        var f = l.pending;
        f === null ? s.next = s : (s.next = f.next, f.next = s), l.pending = s;
      }
      c !== 0 && pf(a, s, c);
    }
  }
  function Kl(e, t, a, l) {
    Zt[Ka++] = e, Zt[Ka++] = t, Zt[Ka++] = a, Zt[Ka++] = l, $s |= l, e.lanes |= l, e = e.alternate, e !== null && (e.lanes |= l);
  }
  function ks(e, t, a, l) {
    return Kl(e, t, a, l), Xl(e);
  }
  function pa(e, t) {
    return Kl(e, null, null, t), Xl(e);
  }
  function pf(e, t, a) {
    e.lanes |= a;
    var l = e.alternate;
    l !== null && (l.lanes |= a);
    for (var s = !1, c = e.return; c !== null; )
      c.childLanes |= a, l = c.alternate, l !== null && (l.childLanes |= a), c.tag === 22 && (e = c.stateNode, e === null || e._visibility & 1 || (s = !0)), e = c, c = c.return;
    return e.tag === 3 ? (c = e.stateNode, s && t !== null && (s = 31 - Et(a), e = c.hiddenUpdates, l = e[s], l === null ? e[s] = [t] : l.push(t), t.lane = a | 536870912), c) : null;
  }
  function Xl(e) {
    if (50 < fl)
      throw fl = 0, Ir = null, Error(r(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var Xa = {};
  function my(e, t, a, l) {
    this.tag = e, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function At(e, t, a, l) {
    return new my(e, t, a, l);
  }
  function Ls(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function dn(e, t) {
    var a = e.alternate;
    return a === null ? (a = At(
      e.tag,
      t,
      e.key,
      e.mode
    ), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = e.flags & 65011712, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue, t = e.dependencies, a.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.refCleanup = e.refCleanup, a;
  }
  function vf(e, t) {
    e.flags &= 65011714;
    var a = e.alternate;
    return a === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type, t = a.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function Vl(e, t, a, l, s, c) {
    var f = 0;
    if (l = e, typeof e == "function") Ls(e) && (f = 1);
    else if (typeof e == "string")
      f = bg(
        e,
        a,
        X.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case pe:
          return e = At(31, a, t, s), e.elementType = pe, e.lanes = c, e;
        case M:
          return va(a.children, s, c, t);
        case G:
          f = 8, s |= 24;
          break;
        case U:
          return e = At(12, a, t, s | 2), e.elementType = U, e.lanes = c, e;
        case B:
          return e = At(13, a, t, s), e.elementType = B, e.lanes = c, e;
        case ae:
          return e = At(19, a, t, s), e.elementType = ae, e.lanes = c, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case ee:
                f = 10;
                break e;
              case I:
                f = 9;
                break e;
              case L:
                f = 11;
                break e;
              case F:
                f = 14;
                break e;
              case te:
                f = 16, l = null;
                break e;
            }
          f = 29, a = Error(
            r(130, e === null ? "null" : typeof e, "")
          ), l = null;
      }
    return t = At(f, a, t, s), t.elementType = e, t.type = l, t.lanes = c, t;
  }
  function va(e, t, a, l) {
    return e = At(7, e, l, t), e.lanes = a, e;
  }
  function Gs(e, t, a) {
    return e = At(6, e, null, t), e.lanes = a, e;
  }
  function yf(e) {
    var t = At(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function Ys(e, t, a) {
    return t = At(
      4,
      e.children !== null ? e.children : [],
      e.key,
      t
    ), t.lanes = a, t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
    }, t;
  }
  var gf = /* @__PURE__ */ new WeakMap();
  function Qt(e, t) {
    if (typeof e == "object" && e !== null) {
      var a = gf.get(e);
      return a !== void 0 ? a : (t = {
        value: e,
        source: t,
        stack: Ke(t)
      }, gf.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: Ke(t)
    };
  }
  var Va = [], Ja = 0, Jl = null, Gi = 0, Ht = [], Bt = 0, Un = null, nn = 1, an = "";
  function hn(e, t) {
    Va[Ja++] = Gi, Va[Ja++] = Jl, Jl = e, Gi = t;
  }
  function bf(e, t, a) {
    Ht[Bt++] = nn, Ht[Bt++] = an, Ht[Bt++] = Un, Un = e;
    var l = nn;
    e = an;
    var s = 32 - Et(l) - 1;
    l &= ~(1 << s), a += 1;
    var c = 32 - Et(t) + s;
    if (30 < c) {
      var f = s - s % 5;
      c = (l & (1 << f) - 1).toString(32), l >>= f, s -= f, nn = 1 << 32 - Et(t) + s | a << s | l, an = c + e;
    } else
      nn = 1 << c | a << s | l, an = e;
  }
  function Ks(e) {
    e.return !== null && (hn(e, 1), bf(e, 1, 0));
  }
  function Xs(e) {
    for (; e === Jl; )
      Jl = Va[--Ja], Va[Ja] = null, Gi = Va[--Ja], Va[Ja] = null;
    for (; e === Un; )
      Un = Ht[--Bt], Ht[Bt] = null, an = Ht[--Bt], Ht[Bt] = null, nn = Ht[--Bt], Ht[Bt] = null;
  }
  function _f(e, t) {
    Ht[Bt++] = nn, Ht[Bt++] = an, Ht[Bt++] = Un, nn = t.id, an = t.overflow, Un = e;
  }
  var lt = null, Ce = null, ve = !1, Zn = null, $t = !1, Vs = Error(r(519));
  function Qn(e) {
    var t = Error(
      r(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Yi(Qt(t, e)), Vs;
  }
  function Sf(e) {
    var t = e.stateNode, a = e.type, l = e.memoizedProps;
    switch (t[it] = e, t[mt] = l, a) {
      case "dialog":
        de("cancel", t), de("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        de("load", t);
        break;
      case "video":
      case "audio":
        for (a = 0; a < hl.length; a++)
          de(hl[a], t);
        break;
      case "source":
        de("error", t);
        break;
      case "img":
      case "image":
      case "link":
        de("error", t), de("load", t);
        break;
      case "details":
        de("toggle", t);
        break;
      case "input":
        de("invalid", t), Do(
          t,
          l.value,
          l.defaultValue,
          l.checked,
          l.defaultChecked,
          l.type,
          l.name,
          !0
        );
        break;
      case "select":
        de("invalid", t);
        break;
      case "textarea":
        de("invalid", t), qo(t, l.value, l.defaultValue, l.children);
    }
    a = l.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || t.textContent === "" + a || l.suppressHydrationWarning === !0 || Qh(t.textContent, a) ? (l.popover != null && (de("beforetoggle", t), de("toggle", t)), l.onScroll != null && de("scroll", t), l.onScrollEnd != null && de("scrollend", t), l.onClick != null && (t.onclick = on), t = !0) : t = !1, t || Qn(e, !0);
  }
  function zf(e) {
    for (lt = e.return; lt; )
      switch (lt.tag) {
        case 5:
        case 31:
        case 13:
          $t = !1;
          return;
        case 27:
        case 3:
          $t = !0;
          return;
        default:
          lt = lt.return;
      }
  }
  function Fa(e) {
    if (e !== lt) return !1;
    if (!ve) return zf(e), ve = !0, !1;
    var t = e.tag, a;
    if ((a = t !== 3 && t !== 27) && ((a = t === 5) && (a = e.type, a = !(a !== "form" && a !== "button") || dc(e.type, e.memoizedProps)), a = !a), a && Ce && Qn(e), zf(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      Ce = Xh(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      Ce = Xh(e);
    } else
      t === 27 ? (t = Ce, Wn(e.type) ? (e = yc, yc = null, Ce = e) : Ce = t) : Ce = lt ? Lt(e.stateNode.nextSibling) : null;
    return !0;
  }
  function ya() {
    Ce = lt = null, ve = !1;
  }
  function Js() {
    var e = Zn;
    return e !== null && (bt === null ? bt = e : bt.push.apply(
      bt,
      e
    ), Zn = null), e;
  }
  function Yi(e) {
    Zn === null ? Zn = [e] : Zn.push(e);
  }
  var Fs = w(null), ga = null, mn = null;
  function Hn(e, t, a) {
    K(Fs, t._currentValue), t._currentValue = a;
  }
  function pn(e) {
    e._currentValue = Fs.current, Q(Fs);
  }
  function Is(e, t, a) {
    for (; e !== null; ) {
      var l = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, l !== null && (l.childLanes |= t)) : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t), e === a) break;
      e = e.return;
    }
  }
  function Ws(e, t, a, l) {
    var s = e.child;
    for (s !== null && (s.return = e); s !== null; ) {
      var c = s.dependencies;
      if (c !== null) {
        var f = s.child;
        c = c.firstContext;
        e: for (; c !== null; ) {
          var p = c;
          c = s;
          for (var b = 0; b < t.length; b++)
            if (p.context === t[b]) {
              c.lanes |= a, p = c.alternate, p !== null && (p.lanes |= a), Is(
                c.return,
                a,
                e
              ), l || (f = null);
              break e;
            }
          c = p.next;
        }
      } else if (s.tag === 18) {
        if (f = s.return, f === null) throw Error(r(341));
        f.lanes |= a, c = f.alternate, c !== null && (c.lanes |= a), Is(f, a, e), f = null;
      } else f = s.child;
      if (f !== null) f.return = s;
      else
        for (f = s; f !== null; ) {
          if (f === e) {
            f = null;
            break;
          }
          if (s = f.sibling, s !== null) {
            s.return = f.return, f = s;
            break;
          }
          f = f.return;
        }
      s = f;
    }
  }
  function Ia(e, t, a, l) {
    e = null;
    for (var s = t, c = !1; s !== null; ) {
      if (!c) {
        if ((s.flags & 524288) !== 0) c = !0;
        else if ((s.flags & 262144) !== 0) break;
      }
      if (s.tag === 10) {
        var f = s.alternate;
        if (f === null) throw Error(r(387));
        if (f = f.memoizedProps, f !== null) {
          var p = s.type;
          Tt(s.pendingProps.value, f.value) || (e !== null ? e.push(p) : e = [p]);
        }
      } else if (s === ge.current) {
        if (f = s.alternate, f === null) throw Error(r(387));
        f.memoizedState.memoizedState !== s.memoizedState.memoizedState && (e !== null ? e.push(gl) : e = [gl]);
      }
      s = s.return;
    }
    e !== null && Ws(
      t,
      e,
      a,
      l
    ), t.flags |= 262144;
  }
  function Fl(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Tt(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function ba(e) {
    ga = e, mn = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function ut(e) {
    return wf(ga, e);
  }
  function Il(e, t) {
    return ga === null && ba(e), wf(e, t);
  }
  function wf(e, t) {
    var a = t._currentValue;
    if (t = { context: t, memoizedValue: a, next: null }, mn === null) {
      if (e === null) throw Error(r(308));
      mn = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else mn = mn.next = t;
    return a;
  }
  var py = typeof AbortController < "u" ? AbortController : function() {
    var e = [], t = this.signal = {
      aborted: !1,
      addEventListener: function(a, l) {
        e.push(l);
      }
    };
    this.abort = function() {
      t.aborted = !0, e.forEach(function(a) {
        return a();
      });
    };
  }, vy = n.unstable_scheduleCallback, yy = n.unstable_NormalPriority, Xe = {
    $$typeof: ee,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function Ps() {
    return {
      controller: new py(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Ki(e) {
    e.refCount--, e.refCount === 0 && vy(yy, function() {
      e.controller.abort();
    });
  }
  var Xi = null, er = 0, Wa = 0, Pa = null;
  function gy(e, t) {
    if (Xi === null) {
      var a = Xi = [];
      er = 0, Wa = ac(), Pa = {
        status: "pending",
        value: void 0,
        then: function(l) {
          a.push(l);
        }
      };
    }
    return er++, t.then(jf, jf), t;
  }
  function jf() {
    if (--er === 0 && Xi !== null) {
      Pa !== null && (Pa.status = "fulfilled");
      var e = Xi;
      Xi = null, Wa = 0, Pa = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function by(e, t) {
    var a = [], l = {
      status: "pending",
      value: null,
      reason: null,
      then: function(s) {
        a.push(s);
      }
    };
    return e.then(
      function() {
        l.status = "fulfilled", l.value = t;
        for (var s = 0; s < a.length; s++) (0, a[s])(t);
      },
      function(s) {
        for (l.status = "rejected", l.reason = s, s = 0; s < a.length; s++)
          (0, a[s])(void 0);
      }
    ), l;
  }
  var xf = R.S;
  R.S = function(e, t) {
    rh = jt(), typeof t == "object" && t !== null && typeof t.then == "function" && gy(e, t), xf !== null && xf(e, t);
  };
  var _a = w(null);
  function tr() {
    var e = _a.current;
    return e !== null ? e : Ne.pooledCache;
  }
  function Wl(e, t) {
    t === null ? K(_a, _a.current) : K(_a, t.pool);
  }
  function Ef() {
    var e = tr();
    return e === null ? null : { parent: Xe._currentValue, pool: e };
  }
  var ei = Error(r(460)), nr = Error(r(474)), Pl = Error(r(542)), eu = { then: function() {
  } };
  function Tf(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function Af(e, t, a) {
    switch (a = e[a], a === void 0 ? e.push(t) : a !== t && (t.then(on, on), t = a), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, Nf(e), e;
      default:
        if (typeof t.status == "string") t.then(on, on);
        else {
          if (e = Ne, e !== null && 100 < e.shellSuspendCounter)
            throw Error(r(482));
          e = t, e.status = "pending", e.then(
            function(l) {
              if (t.status === "pending") {
                var s = t;
                s.status = "fulfilled", s.value = l;
              }
            },
            function(l) {
              if (t.status === "pending") {
                var s = t;
                s.status = "rejected", s.reason = l;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw e = t.reason, Nf(e), e;
        }
        throw za = t, ei;
    }
  }
  function Sa(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (a) {
      throw a !== null && typeof a == "object" && typeof a.then == "function" ? (za = a, ei) : a;
    }
  }
  var za = null;
  function Of() {
    if (za === null) throw Error(r(459));
    var e = za;
    return za = null, e;
  }
  function Nf(e) {
    if (e === ei || e === Pl)
      throw Error(r(483));
  }
  var ti = null, Vi = 0;
  function tu(e) {
    var t = Vi;
    return Vi += 1, ti === null && (ti = []), Af(ti, e, t);
  }
  function Ji(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function nu(e, t) {
    throw t.$$typeof === S ? Error(r(525)) : (e = Object.prototype.toString.call(t), Error(
      r(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function Cf(e) {
    function t(x, z) {
      if (e) {
        var E = x.deletions;
        E === null ? (x.deletions = [z], x.flags |= 16) : E.push(z);
      }
    }
    function a(x, z) {
      if (!e) return null;
      for (; z !== null; )
        t(x, z), z = z.sibling;
      return null;
    }
    function l(x) {
      for (var z = /* @__PURE__ */ new Map(); x !== null; )
        x.key !== null ? z.set(x.key, x) : z.set(x.index, x), x = x.sibling;
      return z;
    }
    function s(x, z) {
      return x = dn(x, z), x.index = 0, x.sibling = null, x;
    }
    function c(x, z, E) {
      return x.index = E, e ? (E = x.alternate, E !== null ? (E = E.index, E < z ? (x.flags |= 67108866, z) : E) : (x.flags |= 67108866, z)) : (x.flags |= 1048576, z);
    }
    function f(x) {
      return e && x.alternate === null && (x.flags |= 67108866), x;
    }
    function p(x, z, E, Z) {
      return z === null || z.tag !== 6 ? (z = Gs(E, x.mode, Z), z.return = x, z) : (z = s(z, E), z.return = x, z);
    }
    function b(x, z, E, Z) {
      var ne = E.type;
      return ne === M ? D(
        x,
        z,
        E.props.children,
        Z,
        E.key
      ) : z !== null && (z.elementType === ne || typeof ne == "object" && ne !== null && ne.$$typeof === te && Sa(ne) === z.type) ? (z = s(z, E.props), Ji(z, E), z.return = x, z) : (z = Vl(
        E.type,
        E.key,
        E.props,
        null,
        x.mode,
        Z
      ), Ji(z, E), z.return = x, z);
    }
    function T(x, z, E, Z) {
      return z === null || z.tag !== 4 || z.stateNode.containerInfo !== E.containerInfo || z.stateNode.implementation !== E.implementation ? (z = Ys(E, x.mode, Z), z.return = x, z) : (z = s(z, E.children || []), z.return = x, z);
    }
    function D(x, z, E, Z, ne) {
      return z === null || z.tag !== 7 ? (z = va(
        E,
        x.mode,
        Z,
        ne
      ), z.return = x, z) : (z = s(z, E), z.return = x, z);
    }
    function H(x, z, E) {
      if (typeof z == "string" && z !== "" || typeof z == "number" || typeof z == "bigint")
        return z = Gs(
          "" + z,
          x.mode,
          E
        ), z.return = x, z;
      if (typeof z == "object" && z !== null) {
        switch (z.$$typeof) {
          case A:
            return E = Vl(
              z.type,
              z.key,
              z.props,
              null,
              x.mode,
              E
            ), Ji(E, z), E.return = x, E;
          case C:
            return z = Ys(
              z,
              x.mode,
              E
            ), z.return = x, z;
          case te:
            return z = Sa(z), H(x, z, E);
        }
        if (wt(z) || Be(z))
          return z = va(
            z,
            x.mode,
            E,
            null
          ), z.return = x, z;
        if (typeof z.then == "function")
          return H(x, tu(z), E);
        if (z.$$typeof === ee)
          return H(
            x,
            Il(x, z),
            E
          );
        nu(x, z);
      }
      return null;
    }
    function O(x, z, E, Z) {
      var ne = z !== null ? z.key : null;
      if (typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint")
        return ne !== null ? null : p(x, z, "" + E, Z);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case A:
            return E.key === ne ? b(x, z, E, Z) : null;
          case C:
            return E.key === ne ? T(x, z, E, Z) : null;
          case te:
            return E = Sa(E), O(x, z, E, Z);
        }
        if (wt(E) || Be(E))
          return ne !== null ? null : D(x, z, E, Z, null);
        if (typeof E.then == "function")
          return O(
            x,
            z,
            tu(E),
            Z
          );
        if (E.$$typeof === ee)
          return O(
            x,
            z,
            Il(x, E),
            Z
          );
        nu(x, E);
      }
      return null;
    }
    function N(x, z, E, Z, ne) {
      if (typeof Z == "string" && Z !== "" || typeof Z == "number" || typeof Z == "bigint")
        return x = x.get(E) || null, p(z, x, "" + Z, ne);
      if (typeof Z == "object" && Z !== null) {
        switch (Z.$$typeof) {
          case A:
            return x = x.get(
              Z.key === null ? E : Z.key
            ) || null, b(z, x, Z, ne);
          case C:
            return x = x.get(
              Z.key === null ? E : Z.key
            ) || null, T(z, x, Z, ne);
          case te:
            return Z = Sa(Z), N(
              x,
              z,
              E,
              Z,
              ne
            );
        }
        if (wt(Z) || Be(Z))
          return x = x.get(E) || null, D(z, x, Z, ne, null);
        if (typeof Z.then == "function")
          return N(
            x,
            z,
            E,
            tu(Z),
            ne
          );
        if (Z.$$typeof === ee)
          return N(
            x,
            z,
            E,
            Il(z, Z),
            ne
          );
        nu(z, Z);
      }
      return null;
    }
    function V(x, z, E, Z) {
      for (var ne = null, be = null, W = z, ce = z = 0, me = null; W !== null && ce < E.length; ce++) {
        W.index > ce ? (me = W, W = null) : me = W.sibling;
        var _e = O(
          x,
          W,
          E[ce],
          Z
        );
        if (_e === null) {
          W === null && (W = me);
          break;
        }
        e && W && _e.alternate === null && t(x, W), z = c(_e, z, ce), be === null ? ne = _e : be.sibling = _e, be = _e, W = me;
      }
      if (ce === E.length)
        return a(x, W), ve && hn(x, ce), ne;
      if (W === null) {
        for (; ce < E.length; ce++)
          W = H(x, E[ce], Z), W !== null && (z = c(
            W,
            z,
            ce
          ), be === null ? ne = W : be.sibling = W, be = W);
        return ve && hn(x, ce), ne;
      }
      for (W = l(W); ce < E.length; ce++)
        me = N(
          W,
          x,
          ce,
          E[ce],
          Z
        ), me !== null && (e && me.alternate !== null && W.delete(
          me.key === null ? ce : me.key
        ), z = c(
          me,
          z,
          ce
        ), be === null ? ne = me : be.sibling = me, be = me);
      return e && W.forEach(function(aa) {
        return t(x, aa);
      }), ve && hn(x, ce), ne;
    }
    function le(x, z, E, Z) {
      if (E == null) throw Error(r(151));
      for (var ne = null, be = null, W = z, ce = z = 0, me = null, _e = E.next(); W !== null && !_e.done; ce++, _e = E.next()) {
        W.index > ce ? (me = W, W = null) : me = W.sibling;
        var aa = O(x, W, _e.value, Z);
        if (aa === null) {
          W === null && (W = me);
          break;
        }
        e && W && aa.alternate === null && t(x, W), z = c(aa, z, ce), be === null ? ne = aa : be.sibling = aa, be = aa, W = me;
      }
      if (_e.done)
        return a(x, W), ve && hn(x, ce), ne;
      if (W === null) {
        for (; !_e.done; ce++, _e = E.next())
          _e = H(x, _e.value, Z), _e !== null && (z = c(_e, z, ce), be === null ? ne = _e : be.sibling = _e, be = _e);
        return ve && hn(x, ce), ne;
      }
      for (W = l(W); !_e.done; ce++, _e = E.next())
        _e = N(W, x, ce, _e.value, Z), _e !== null && (e && _e.alternate !== null && W.delete(_e.key === null ? ce : _e.key), z = c(_e, z, ce), be === null ? ne = _e : be.sibling = _e, be = _e);
      return e && W.forEach(function(Ng) {
        return t(x, Ng);
      }), ve && hn(x, ce), ne;
    }
    function Ae(x, z, E, Z) {
      if (typeof E == "object" && E !== null && E.type === M && E.key === null && (E = E.props.children), typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case A:
            e: {
              for (var ne = E.key; z !== null; ) {
                if (z.key === ne) {
                  if (ne = E.type, ne === M) {
                    if (z.tag === 7) {
                      a(
                        x,
                        z.sibling
                      ), Z = s(
                        z,
                        E.props.children
                      ), Z.return = x, x = Z;
                      break e;
                    }
                  } else if (z.elementType === ne || typeof ne == "object" && ne !== null && ne.$$typeof === te && Sa(ne) === z.type) {
                    a(
                      x,
                      z.sibling
                    ), Z = s(z, E.props), Ji(Z, E), Z.return = x, x = Z;
                    break e;
                  }
                  a(x, z);
                  break;
                } else t(x, z);
                z = z.sibling;
              }
              E.type === M ? (Z = va(
                E.props.children,
                x.mode,
                Z,
                E.key
              ), Z.return = x, x = Z) : (Z = Vl(
                E.type,
                E.key,
                E.props,
                null,
                x.mode,
                Z
              ), Ji(Z, E), Z.return = x, x = Z);
            }
            return f(x);
          case C:
            e: {
              for (ne = E.key; z !== null; ) {
                if (z.key === ne)
                  if (z.tag === 4 && z.stateNode.containerInfo === E.containerInfo && z.stateNode.implementation === E.implementation) {
                    a(
                      x,
                      z.sibling
                    ), Z = s(z, E.children || []), Z.return = x, x = Z;
                    break e;
                  } else {
                    a(x, z);
                    break;
                  }
                else t(x, z);
                z = z.sibling;
              }
              Z = Ys(E, x.mode, Z), Z.return = x, x = Z;
            }
            return f(x);
          case te:
            return E = Sa(E), Ae(
              x,
              z,
              E,
              Z
            );
        }
        if (wt(E))
          return V(
            x,
            z,
            E,
            Z
          );
        if (Be(E)) {
          if (ne = Be(E), typeof ne != "function") throw Error(r(150));
          return E = ne.call(E), le(
            x,
            z,
            E,
            Z
          );
        }
        if (typeof E.then == "function")
          return Ae(
            x,
            z,
            tu(E),
            Z
          );
        if (E.$$typeof === ee)
          return Ae(
            x,
            z,
            Il(x, E),
            Z
          );
        nu(x, E);
      }
      return typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint" ? (E = "" + E, z !== null && z.tag === 6 ? (a(x, z.sibling), Z = s(z, E), Z.return = x, x = Z) : (a(x, z), Z = Gs(E, x.mode, Z), Z.return = x, x = Z), f(x)) : a(x, z);
    }
    return function(x, z, E, Z) {
      try {
        Vi = 0;
        var ne = Ae(
          x,
          z,
          E,
          Z
        );
        return ti = null, ne;
      } catch (W) {
        if (W === ei || W === Pl) throw W;
        var be = At(29, W, null, x.mode);
        return be.lanes = Z, be.return = x, be;
      } finally {
      }
    };
  }
  var wa = Cf(!0), Mf = Cf(!1), Bn = !1;
  function ar(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function ir(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function $n(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function kn(e, t, a) {
    var l = e.updateQueue;
    if (l === null) return null;
    if (l = l.shared, (ze & 2) !== 0) {
      var s = l.pending;
      return s === null ? t.next = t : (t.next = s.next, s.next = t), l.pending = t, t = Xl(e), pf(e, null, a), t;
    }
    return Kl(e, l, t, a), Xl(e);
  }
  function Fi(e, t, a) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (a & 4194048) !== 0)) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, zo(e, a);
    }
  }
  function lr(e, t) {
    var a = e.updateQueue, l = e.alternate;
    if (l !== null && (l = l.updateQueue, a === l)) {
      var s = null, c = null;
      if (a = a.firstBaseUpdate, a !== null) {
        do {
          var f = {
            lane: a.lane,
            tag: a.tag,
            payload: a.payload,
            callback: null,
            next: null
          };
          c === null ? s = c = f : c = c.next = f, a = a.next;
        } while (a !== null);
        c === null ? s = c = t : c = c.next = t;
      } else s = c = t;
      a = {
        baseState: l.baseState,
        firstBaseUpdate: s,
        lastBaseUpdate: c,
        shared: l.shared,
        callbacks: l.callbacks
      }, e.updateQueue = a;
      return;
    }
    e = a.lastBaseUpdate, e === null ? a.firstBaseUpdate = t : e.next = t, a.lastBaseUpdate = t;
  }
  var ur = !1;
  function Ii() {
    if (ur) {
      var e = Pa;
      if (e !== null) throw e;
    }
  }
  function Wi(e, t, a, l) {
    ur = !1;
    var s = e.updateQueue;
    Bn = !1;
    var c = s.firstBaseUpdate, f = s.lastBaseUpdate, p = s.shared.pending;
    if (p !== null) {
      s.shared.pending = null;
      var b = p, T = b.next;
      b.next = null, f === null ? c = T : f.next = T, f = b;
      var D = e.alternate;
      D !== null && (D = D.updateQueue, p = D.lastBaseUpdate, p !== f && (p === null ? D.firstBaseUpdate = T : p.next = T, D.lastBaseUpdate = b));
    }
    if (c !== null) {
      var H = s.baseState;
      f = 0, D = T = b = null, p = c;
      do {
        var O = p.lane & -536870913, N = O !== p.lane;
        if (N ? (he & O) === O : (l & O) === O) {
          O !== 0 && O === Wa && (ur = !0), D !== null && (D = D.next = {
            lane: 0,
            tag: p.tag,
            payload: p.payload,
            callback: null,
            next: null
          });
          e: {
            var V = e, le = p;
            O = t;
            var Ae = a;
            switch (le.tag) {
              case 1:
                if (V = le.payload, typeof V == "function") {
                  H = V.call(Ae, H, O);
                  break e;
                }
                H = V;
                break e;
              case 3:
                V.flags = V.flags & -65537 | 128;
              case 0:
                if (V = le.payload, O = typeof V == "function" ? V.call(Ae, H, O) : V, O == null) break e;
                H = j({}, H, O);
                break e;
              case 2:
                Bn = !0;
            }
          }
          O = p.callback, O !== null && (e.flags |= 64, N && (e.flags |= 8192), N = s.callbacks, N === null ? s.callbacks = [O] : N.push(O));
        } else
          N = {
            lane: O,
            tag: p.tag,
            payload: p.payload,
            callback: p.callback,
            next: null
          }, D === null ? (T = D = N, b = H) : D = D.next = N, f |= O;
        if (p = p.next, p === null) {
          if (p = s.shared.pending, p === null)
            break;
          N = p, p = N.next, N.next = null, s.lastBaseUpdate = N, s.shared.pending = null;
        }
      } while (!0);
      D === null && (b = H), s.baseState = b, s.firstBaseUpdate = T, s.lastBaseUpdate = D, c === null && (s.shared.lanes = 0), Xn |= f, e.lanes = f, e.memoizedState = H;
    }
  }
  function Df(e, t) {
    if (typeof e != "function")
      throw Error(r(191, e));
    e.call(t);
  }
  function Rf(e, t) {
    var a = e.callbacks;
    if (a !== null)
      for (e.callbacks = null, e = 0; e < a.length; e++)
        Df(a[e], t);
  }
  var ni = w(null), au = w(0);
  function qf(e, t) {
    e = jn, K(au, e), K(ni, t), jn = e | t.baseLanes;
  }
  function sr() {
    K(au, jn), K(ni, ni.current);
  }
  function rr() {
    jn = au.current, Q(ni), Q(au);
  }
  var Ot = w(null), kt = null;
  function Ln(e) {
    var t = e.alternate;
    K(Ge, Ge.current & 1), K(Ot, e), kt === null && (t === null || ni.current !== null || t.memoizedState !== null) && (kt = e);
  }
  function cr(e) {
    K(Ge, Ge.current), K(Ot, e), kt === null && (kt = e);
  }
  function Uf(e) {
    e.tag === 22 ? (K(Ge, Ge.current), K(Ot, e), kt === null && (kt = e)) : Gn();
  }
  function Gn() {
    K(Ge, Ge.current), K(Ot, Ot.current);
  }
  function Nt(e) {
    Q(Ot), kt === e && (kt = null), Q(Ge);
  }
  var Ge = w(0);
  function iu(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var a = t.memoizedState;
        if (a !== null && (a = a.dehydrated, a === null || pc(a) || vc(a)))
          return t;
      } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var vn = 0, re = null, Ee = null, Ve = null, lu = !1, ai = !1, ja = !1, uu = 0, Pi = 0, ii = null, _y = 0;
  function $e() {
    throw Error(r(321));
  }
  function or(e, t) {
    if (t === null) return !1;
    for (var a = 0; a < t.length && a < e.length; a++)
      if (!Tt(e[a], t[a])) return !1;
    return !0;
  }
  function fr(e, t, a, l, s, c) {
    return vn = c, re = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, R.H = e === null || e.memoizedState === null ? bd : Er, ja = !1, c = a(l, s), ja = !1, ai && (c = Qf(
      t,
      a,
      l,
      s
    )), Zf(e), c;
  }
  function Zf(e) {
    R.H = nl;
    var t = Ee !== null && Ee.next !== null;
    if (vn = 0, Ve = Ee = re = null, lu = !1, Pi = 0, ii = null, t) throw Error(r(300));
    e === null || Je || (e = e.dependencies, e !== null && Fl(e) && (Je = !0));
  }
  function Qf(e, t, a, l) {
    re = e;
    var s = 0;
    do {
      if (ai && (ii = null), Pi = 0, ai = !1, 25 <= s) throw Error(r(301));
      if (s += 1, Ve = Ee = null, e.updateQueue != null) {
        var c = e.updateQueue;
        c.lastEffect = null, c.events = null, c.stores = null, c.memoCache != null && (c.memoCache.index = 0);
      }
      R.H = _d, c = t(a, l);
    } while (ai);
    return c;
  }
  function Sy() {
    var e = R.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? el(t) : t, e = e.useState()[0], (Ee !== null ? Ee.memoizedState : null) !== e && (re.flags |= 1024), t;
  }
  function dr() {
    var e = uu !== 0;
    return uu = 0, e;
  }
  function hr(e, t, a) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~a;
  }
  function mr(e) {
    if (lu) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      lu = !1;
    }
    vn = 0, Ve = Ee = re = null, ai = !1, Pi = uu = 0, ii = null;
  }
  function ft() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Ve === null ? re.memoizedState = Ve = e : Ve = Ve.next = e, Ve;
  }
  function Ye() {
    if (Ee === null) {
      var e = re.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Ee.next;
    var t = Ve === null ? re.memoizedState : Ve.next;
    if (t !== null)
      Ve = t, Ee = e;
    else {
      if (e === null)
        throw re.alternate === null ? Error(r(467)) : Error(r(310));
      Ee = e, e = {
        memoizedState: Ee.memoizedState,
        baseState: Ee.baseState,
        baseQueue: Ee.baseQueue,
        queue: Ee.queue,
        next: null
      }, Ve === null ? re.memoizedState = Ve = e : Ve = Ve.next = e;
    }
    return Ve;
  }
  function su() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function el(e) {
    var t = Pi;
    return Pi += 1, ii === null && (ii = []), e = Af(ii, e, t), t = re, (Ve === null ? t.memoizedState : Ve.next) === null && (t = t.alternate, R.H = t === null || t.memoizedState === null ? bd : Er), e;
  }
  function ru(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return el(e);
      if (e.$$typeof === ee) return ut(e);
    }
    throw Error(r(438, String(e)));
  }
  function pr(e) {
    var t = null, a = re.updateQueue;
    if (a !== null && (t = a.memoCache), t == null) {
      var l = re.alternate;
      l !== null && (l = l.updateQueue, l !== null && (l = l.memoCache, l != null && (t = {
        data: l.data.map(function(s) {
          return s.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), a === null && (a = su(), re.updateQueue = a), a.memoCache = t, a = t.data[t.index], a === void 0)
      for (a = t.data[t.index] = Array(e), l = 0; l < e; l++)
        a[l] = Qe;
    return t.index++, a;
  }
  function yn(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function cu(e) {
    var t = Ye();
    return vr(t, Ee, e);
  }
  function vr(e, t, a) {
    var l = e.queue;
    if (l === null) throw Error(r(311));
    l.lastRenderedReducer = a;
    var s = e.baseQueue, c = l.pending;
    if (c !== null) {
      if (s !== null) {
        var f = s.next;
        s.next = c.next, c.next = f;
      }
      t.baseQueue = s = c, l.pending = null;
    }
    if (c = e.baseState, s === null) e.memoizedState = c;
    else {
      t = s.next;
      var p = f = null, b = null, T = t, D = !1;
      do {
        var H = T.lane & -536870913;
        if (H !== T.lane ? (he & H) === H : (vn & H) === H) {
          var O = T.revertLane;
          if (O === 0)
            b !== null && (b = b.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: T.action,
              hasEagerState: T.hasEagerState,
              eagerState: T.eagerState,
              next: null
            }), H === Wa && (D = !0);
          else if ((vn & O) === O) {
            T = T.next, O === Wa && (D = !0);
            continue;
          } else
            H = {
              lane: 0,
              revertLane: T.revertLane,
              gesture: null,
              action: T.action,
              hasEagerState: T.hasEagerState,
              eagerState: T.eagerState,
              next: null
            }, b === null ? (p = b = H, f = c) : b = b.next = H, re.lanes |= O, Xn |= O;
          H = T.action, ja && a(c, H), c = T.hasEagerState ? T.eagerState : a(c, H);
        } else
          O = {
            lane: H,
            revertLane: T.revertLane,
            gesture: T.gesture,
            action: T.action,
            hasEagerState: T.hasEagerState,
            eagerState: T.eagerState,
            next: null
          }, b === null ? (p = b = O, f = c) : b = b.next = O, re.lanes |= H, Xn |= H;
        T = T.next;
      } while (T !== null && T !== t);
      if (b === null ? f = c : b.next = p, !Tt(c, e.memoizedState) && (Je = !0, D && (a = Pa, a !== null)))
        throw a;
      e.memoizedState = c, e.baseState = f, e.baseQueue = b, l.lastRenderedState = c;
    }
    return s === null && (l.lanes = 0), [e.memoizedState, l.dispatch];
  }
  function yr(e) {
    var t = Ye(), a = t.queue;
    if (a === null) throw Error(r(311));
    a.lastRenderedReducer = e;
    var l = a.dispatch, s = a.pending, c = t.memoizedState;
    if (s !== null) {
      a.pending = null;
      var f = s = s.next;
      do
        c = e(c, f.action), f = f.next;
      while (f !== s);
      Tt(c, t.memoizedState) || (Je = !0), t.memoizedState = c, t.baseQueue === null && (t.baseState = c), a.lastRenderedState = c;
    }
    return [c, l];
  }
  function Hf(e, t, a) {
    var l = re, s = Ye(), c = ve;
    if (c) {
      if (a === void 0) throw Error(r(407));
      a = a();
    } else a = t();
    var f = !Tt(
      (Ee || s).memoizedState,
      a
    );
    if (f && (s.memoizedState = a, Je = !0), s = s.queue, _r(kf.bind(null, l, s, e), [
      e
    ]), s.getSnapshot !== t || f || Ve !== null && Ve.memoizedState.tag & 1) {
      if (l.flags |= 2048, li(
        9,
        { destroy: void 0 },
        $f.bind(
          null,
          l,
          s,
          a,
          t
        ),
        null
      ), Ne === null) throw Error(r(349));
      c || (vn & 127) !== 0 || Bf(l, t, a);
    }
    return a;
  }
  function Bf(e, t, a) {
    e.flags |= 16384, e = { getSnapshot: t, value: a }, t = re.updateQueue, t === null ? (t = su(), re.updateQueue = t, t.stores = [e]) : (a = t.stores, a === null ? t.stores = [e] : a.push(e));
  }
  function $f(e, t, a, l) {
    t.value = a, t.getSnapshot = l, Lf(t) && Gf(e);
  }
  function kf(e, t, a) {
    return a(function() {
      Lf(t) && Gf(e);
    });
  }
  function Lf(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var a = t();
      return !Tt(e, a);
    } catch {
      return !0;
    }
  }
  function Gf(e) {
    var t = pa(e, 2);
    t !== null && _t(t, e, 2);
  }
  function gr(e) {
    var t = ft();
    if (typeof e == "function") {
      var a = e;
      if (e = a(), ja) {
        Dn(!0);
        try {
          a();
        } finally {
          Dn(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: yn,
      lastRenderedState: e
    }, t;
  }
  function Yf(e, t, a, l) {
    return e.baseState = a, vr(
      e,
      Ee,
      typeof l == "function" ? l : yn
    );
  }
  function zy(e, t, a, l, s) {
    if (du(e)) throw Error(r(485));
    if (e = t.action, e !== null) {
      var c = {
        payload: s,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(f) {
          c.listeners.push(f);
        }
      };
      R.T !== null ? a(!0) : c.isTransition = !1, l(c), a = t.pending, a === null ? (c.next = t.pending = c, Kf(t, c)) : (c.next = a.next, t.pending = a.next = c);
    }
  }
  function Kf(e, t) {
    var a = t.action, l = t.payload, s = e.state;
    if (t.isTransition) {
      var c = R.T, f = {};
      R.T = f;
      try {
        var p = a(s, l), b = R.S;
        b !== null && b(f, p), Xf(e, t, p);
      } catch (T) {
        br(e, t, T);
      } finally {
        c !== null && f.types !== null && (c.types = f.types), R.T = c;
      }
    } else
      try {
        c = a(s, l), Xf(e, t, c);
      } catch (T) {
        br(e, t, T);
      }
  }
  function Xf(e, t, a) {
    a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(
      function(l) {
        Vf(e, t, l);
      },
      function(l) {
        return br(e, t, l);
      }
    ) : Vf(e, t, a);
  }
  function Vf(e, t, a) {
    t.status = "fulfilled", t.value = a, Jf(t), e.state = a, t = e.pending, t !== null && (a = t.next, a === t ? e.pending = null : (a = a.next, t.next = a, Kf(e, a)));
  }
  function br(e, t, a) {
    var l = e.pending;
    if (e.pending = null, l !== null) {
      l = l.next;
      do
        t.status = "rejected", t.reason = a, Jf(t), t = t.next;
      while (t !== l);
    }
    e.action = null;
  }
  function Jf(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function Ff(e, t) {
    return t;
  }
  function If(e, t) {
    if (ve) {
      var a = Ne.formState;
      if (a !== null) {
        e: {
          var l = re;
          if (ve) {
            if (Ce) {
              t: {
                for (var s = Ce, c = $t; s.nodeType !== 8; ) {
                  if (!c) {
                    s = null;
                    break t;
                  }
                  if (s = Lt(
                    s.nextSibling
                  ), s === null) {
                    s = null;
                    break t;
                  }
                }
                c = s.data, s = c === "F!" || c === "F" ? s : null;
              }
              if (s) {
                Ce = Lt(
                  s.nextSibling
                ), l = s.data === "F!";
                break e;
              }
            }
            Qn(l);
          }
          l = !1;
        }
        l && (t = a[0]);
      }
    }
    return a = ft(), a.memoizedState = a.baseState = t, l = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Ff,
      lastRenderedState: t
    }, a.queue = l, a = vd.bind(
      null,
      re,
      l
    ), l.dispatch = a, l = gr(!1), c = xr.bind(
      null,
      re,
      !1,
      l.queue
    ), l = ft(), s = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, l.queue = s, a = zy.bind(
      null,
      re,
      s,
      c,
      a
    ), s.dispatch = a, l.memoizedState = e, [t, a, !1];
  }
  function Wf(e) {
    var t = Ye();
    return Pf(t, Ee, e);
  }
  function Pf(e, t, a) {
    if (t = vr(
      e,
      t,
      Ff
    )[0], e = cu(yn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var l = el(t);
      } catch (f) {
        throw f === ei ? Pl : f;
      }
    else l = t;
    t = Ye();
    var s = t.queue, c = s.dispatch;
    return a !== t.memoizedState && (re.flags |= 2048, li(
      9,
      { destroy: void 0 },
      wy.bind(null, s, a),
      null
    )), [l, c, e];
  }
  function wy(e, t) {
    e.action = t;
  }
  function ed(e) {
    var t = Ye(), a = Ee;
    if (a !== null)
      return Pf(t, a, e);
    Ye(), t = t.memoizedState, a = Ye();
    var l = a.queue.dispatch;
    return a.memoizedState = e, [t, l, !1];
  }
  function li(e, t, a, l) {
    return e = { tag: e, create: a, deps: l, inst: t, next: null }, t = re.updateQueue, t === null && (t = su(), re.updateQueue = t), a = t.lastEffect, a === null ? t.lastEffect = e.next = e : (l = a.next, a.next = e, e.next = l, t.lastEffect = e), e;
  }
  function td() {
    return Ye().memoizedState;
  }
  function ou(e, t, a, l) {
    var s = ft();
    re.flags |= e, s.memoizedState = li(
      1 | t,
      { destroy: void 0 },
      a,
      l === void 0 ? null : l
    );
  }
  function fu(e, t, a, l) {
    var s = Ye();
    l = l === void 0 ? null : l;
    var c = s.memoizedState.inst;
    Ee !== null && l !== null && or(l, Ee.memoizedState.deps) ? s.memoizedState = li(t, c, a, l) : (re.flags |= e, s.memoizedState = li(
      1 | t,
      c,
      a,
      l
    ));
  }
  function nd(e, t) {
    ou(8390656, 8, e, t);
  }
  function _r(e, t) {
    fu(2048, 8, e, t);
  }
  function jy(e) {
    re.flags |= 4;
    var t = re.updateQueue;
    if (t === null)
      t = su(), re.updateQueue = t, t.events = [e];
    else {
      var a = t.events;
      a === null ? t.events = [e] : a.push(e);
    }
  }
  function ad(e) {
    var t = Ye().memoizedState;
    return jy({ ref: t, nextImpl: e }), function() {
      if ((ze & 2) !== 0) throw Error(r(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function id(e, t) {
    return fu(4, 2, e, t);
  }
  function ld(e, t) {
    return fu(4, 4, e, t);
  }
  function ud(e, t) {
    if (typeof t == "function") {
      e = e();
      var a = t(e);
      return function() {
        typeof a == "function" ? a() : t(null);
      };
    }
    if (t != null)
      return e = e(), t.current = e, function() {
        t.current = null;
      };
  }
  function sd(e, t, a) {
    a = a != null ? a.concat([e]) : null, fu(4, 4, ud.bind(null, t, e), a);
  }
  function Sr() {
  }
  function rd(e, t) {
    var a = Ye();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    return t !== null && or(t, l[1]) ? l[0] : (a.memoizedState = [e, t], e);
  }
  function cd(e, t) {
    var a = Ye();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    if (t !== null && or(t, l[1]))
      return l[0];
    if (l = e(), ja) {
      Dn(!0);
      try {
        e();
      } finally {
        Dn(!1);
      }
    }
    return a.memoizedState = [l, t], l;
  }
  function zr(e, t, a) {
    return a === void 0 || (vn & 1073741824) !== 0 && (he & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = a, e = oh(), re.lanes |= e, Xn |= e, a);
  }
  function od(e, t, a, l) {
    return Tt(a, t) ? a : ni.current !== null ? (e = zr(e, a, l), Tt(e, t) || (Je = !0), e) : (vn & 42) === 0 || (vn & 1073741824) !== 0 && (he & 261930) === 0 ? (Je = !0, e.memoizedState = a) : (e = oh(), re.lanes |= e, Xn |= e, t);
  }
  function fd(e, t, a, l, s) {
    var c = Y.p;
    Y.p = c !== 0 && 8 > c ? c : 8;
    var f = R.T, p = {};
    R.T = p, xr(e, !1, t, a);
    try {
      var b = s(), T = R.S;
      if (T !== null && T(p, b), b !== null && typeof b == "object" && typeof b.then == "function") {
        var D = by(
          b,
          l
        );
        tl(
          e,
          t,
          D,
          Dt(e)
        );
      } else
        tl(
          e,
          t,
          l,
          Dt(e)
        );
    } catch (H) {
      tl(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: H },
        Dt()
      );
    } finally {
      Y.p = c, f !== null && p.types !== null && (f.types = p.types), R.T = f;
    }
  }
  function xy() {
  }
  function wr(e, t, a, l) {
    if (e.tag !== 5) throw Error(r(476));
    var s = dd(e).queue;
    fd(
      e,
      s,
      t,
      ie,
      a === null ? xy : function() {
        return hd(e), a(l);
      }
    );
  }
  function dd(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: ie,
      baseState: ie,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: yn,
        lastRenderedState: ie
      },
      next: null
    };
    var a = {};
    return t.next = {
      memoizedState: a,
      baseState: a,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: yn,
        lastRenderedState: a
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function hd(e) {
    var t = dd(e);
    t.next === null && (t = e.alternate.memoizedState), tl(
      e,
      t.next.queue,
      {},
      Dt()
    );
  }
  function jr() {
    return ut(gl);
  }
  function md() {
    return Ye().memoizedState;
  }
  function pd() {
    return Ye().memoizedState;
  }
  function Ey(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var a = Dt();
          e = $n(a);
          var l = kn(t, e, a);
          l !== null && (_t(l, t, a), Fi(l, t, a)), t = { cache: Ps() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function Ty(e, t, a) {
    var l = Dt();
    a = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, du(e) ? yd(t, a) : (a = ks(e, t, a, l), a !== null && (_t(a, e, l), gd(a, t, l)));
  }
  function vd(e, t, a) {
    var l = Dt();
    tl(e, t, a, l);
  }
  function tl(e, t, a, l) {
    var s = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (du(e)) yd(t, s);
    else {
      var c = e.alternate;
      if (e.lanes === 0 && (c === null || c.lanes === 0) && (c = t.lastRenderedReducer, c !== null))
        try {
          var f = t.lastRenderedState, p = c(f, a);
          if (s.hasEagerState = !0, s.eagerState = p, Tt(p, f))
            return Kl(e, t, s, 0), Ne === null && Yl(), !1;
        } catch {
        } finally {
        }
      if (a = ks(e, t, s, l), a !== null)
        return _t(a, e, l), gd(a, t, l), !0;
    }
    return !1;
  }
  function xr(e, t, a, l) {
    if (l = {
      lane: 2,
      revertLane: ac(),
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, du(e)) {
      if (t) throw Error(r(479));
    } else
      t = ks(
        e,
        a,
        l,
        2
      ), t !== null && _t(t, e, 2);
  }
  function du(e) {
    var t = e.alternate;
    return e === re || t !== null && t === re;
  }
  function yd(e, t) {
    ai = lu = !0;
    var a = e.pending;
    a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
  }
  function gd(e, t, a) {
    if ((a & 4194048) !== 0) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, zo(e, a);
    }
  }
  var nl = {
    readContext: ut,
    use: ru,
    useCallback: $e,
    useContext: $e,
    useEffect: $e,
    useImperativeHandle: $e,
    useLayoutEffect: $e,
    useInsertionEffect: $e,
    useMemo: $e,
    useReducer: $e,
    useRef: $e,
    useState: $e,
    useDebugValue: $e,
    useDeferredValue: $e,
    useTransition: $e,
    useSyncExternalStore: $e,
    useId: $e,
    useHostTransitionStatus: $e,
    useFormState: $e,
    useActionState: $e,
    useOptimistic: $e,
    useMemoCache: $e,
    useCacheRefresh: $e
  };
  nl.useEffectEvent = $e;
  var bd = {
    readContext: ut,
    use: ru,
    useCallback: function(e, t) {
      return ft().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: ut,
    useEffect: nd,
    useImperativeHandle: function(e, t, a) {
      a = a != null ? a.concat([e]) : null, ou(
        4194308,
        4,
        ud.bind(null, t, e),
        a
      );
    },
    useLayoutEffect: function(e, t) {
      return ou(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      ou(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var a = ft();
      t = t === void 0 ? null : t;
      var l = e();
      if (ja) {
        Dn(!0);
        try {
          e();
        } finally {
          Dn(!1);
        }
      }
      return a.memoizedState = [l, t], l;
    },
    useReducer: function(e, t, a) {
      var l = ft();
      if (a !== void 0) {
        var s = a(t);
        if (ja) {
          Dn(!0);
          try {
            a(t);
          } finally {
            Dn(!1);
          }
        }
      } else s = t;
      return l.memoizedState = l.baseState = s, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: s
      }, l.queue = e, e = e.dispatch = Ty.bind(
        null,
        re,
        e
      ), [l.memoizedState, e];
    },
    useRef: function(e) {
      var t = ft();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = gr(e);
      var t = e.queue, a = vd.bind(null, re, t);
      return t.dispatch = a, [e.memoizedState, a];
    },
    useDebugValue: Sr,
    useDeferredValue: function(e, t) {
      var a = ft();
      return zr(a, e, t);
    },
    useTransition: function() {
      var e = gr(!1);
      return e = fd.bind(
        null,
        re,
        e.queue,
        !0,
        !1
      ), ft().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, a) {
      var l = re, s = ft();
      if (ve) {
        if (a === void 0)
          throw Error(r(407));
        a = a();
      } else {
        if (a = t(), Ne === null)
          throw Error(r(349));
        (he & 127) !== 0 || Bf(l, t, a);
      }
      s.memoizedState = a;
      var c = { value: a, getSnapshot: t };
      return s.queue = c, nd(kf.bind(null, l, c, e), [
        e
      ]), l.flags |= 2048, li(
        9,
        { destroy: void 0 },
        $f.bind(
          null,
          l,
          c,
          a,
          t
        ),
        null
      ), a;
    },
    useId: function() {
      var e = ft(), t = Ne.identifierPrefix;
      if (ve) {
        var a = an, l = nn;
        a = (l & ~(1 << 32 - Et(l) - 1)).toString(32) + a, t = "_" + t + "R_" + a, a = uu++, 0 < a && (t += "H" + a.toString(32)), t += "_";
      } else
        a = _y++, t = "_" + t + "r_" + a.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: jr,
    useFormState: If,
    useActionState: If,
    useOptimistic: function(e) {
      var t = ft();
      t.memoizedState = t.baseState = e;
      var a = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = a, t = xr.bind(
        null,
        re,
        !0,
        a
      ), a.dispatch = t, [e, t];
    },
    useMemoCache: pr,
    useCacheRefresh: function() {
      return ft().memoizedState = Ey.bind(
        null,
        re
      );
    },
    useEffectEvent: function(e) {
      var t = ft(), a = { impl: e };
      return t.memoizedState = a, function() {
        if ((ze & 2) !== 0)
          throw Error(r(440));
        return a.impl.apply(void 0, arguments);
      };
    }
  }, Er = {
    readContext: ut,
    use: ru,
    useCallback: rd,
    useContext: ut,
    useEffect: _r,
    useImperativeHandle: sd,
    useInsertionEffect: id,
    useLayoutEffect: ld,
    useMemo: cd,
    useReducer: cu,
    useRef: td,
    useState: function() {
      return cu(yn);
    },
    useDebugValue: Sr,
    useDeferredValue: function(e, t) {
      var a = Ye();
      return od(
        a,
        Ee.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = cu(yn)[0], t = Ye().memoizedState;
      return [
        typeof e == "boolean" ? e : el(e),
        t
      ];
    },
    useSyncExternalStore: Hf,
    useId: md,
    useHostTransitionStatus: jr,
    useFormState: Wf,
    useActionState: Wf,
    useOptimistic: function(e, t) {
      var a = Ye();
      return Yf(a, Ee, e, t);
    },
    useMemoCache: pr,
    useCacheRefresh: pd
  };
  Er.useEffectEvent = ad;
  var _d = {
    readContext: ut,
    use: ru,
    useCallback: rd,
    useContext: ut,
    useEffect: _r,
    useImperativeHandle: sd,
    useInsertionEffect: id,
    useLayoutEffect: ld,
    useMemo: cd,
    useReducer: yr,
    useRef: td,
    useState: function() {
      return yr(yn);
    },
    useDebugValue: Sr,
    useDeferredValue: function(e, t) {
      var a = Ye();
      return Ee === null ? zr(a, e, t) : od(
        a,
        Ee.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = yr(yn)[0], t = Ye().memoizedState;
      return [
        typeof e == "boolean" ? e : el(e),
        t
      ];
    },
    useSyncExternalStore: Hf,
    useId: md,
    useHostTransitionStatus: jr,
    useFormState: ed,
    useActionState: ed,
    useOptimistic: function(e, t) {
      var a = Ye();
      return Ee !== null ? Yf(a, Ee, e, t) : (a.baseState = e, [e, a.queue.dispatch]);
    },
    useMemoCache: pr,
    useCacheRefresh: pd
  };
  _d.useEffectEvent = ad;
  function Tr(e, t, a, l) {
    t = e.memoizedState, a = a(l, t), a = a == null ? t : j({}, t, a), e.memoizedState = a, e.lanes === 0 && (e.updateQueue.baseState = a);
  }
  var Ar = {
    enqueueSetState: function(e, t, a) {
      e = e._reactInternals;
      var l = Dt(), s = $n(l);
      s.payload = t, a != null && (s.callback = a), t = kn(e, s, l), t !== null && (_t(t, e, l), Fi(t, e, l));
    },
    enqueueReplaceState: function(e, t, a) {
      e = e._reactInternals;
      var l = Dt(), s = $n(l);
      s.tag = 1, s.payload = t, a != null && (s.callback = a), t = kn(e, s, l), t !== null && (_t(t, e, l), Fi(t, e, l));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var a = Dt(), l = $n(a);
      l.tag = 2, t != null && (l.callback = t), t = kn(e, l, a), t !== null && (_t(t, e, a), Fi(t, e, a));
    }
  };
  function Sd(e, t, a, l, s, c, f) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, c, f) : t.prototype && t.prototype.isPureReactComponent ? !ki(a, l) || !ki(s, c) : !0;
  }
  function zd(e, t, a, l) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, l), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, l), t.state !== e && Ar.enqueueReplaceState(t, t.state, null);
  }
  function xa(e, t) {
    var a = t;
    if ("ref" in t) {
      a = {};
      for (var l in t)
        l !== "ref" && (a[l] = t[l]);
    }
    if (e = e.defaultProps) {
      a === t && (a = j({}, a));
      for (var s in e)
        a[s] === void 0 && (a[s] = e[s]);
    }
    return a;
  }
  function wd(e) {
    Gl(e);
  }
  function jd(e) {
    console.error(e);
  }
  function xd(e) {
    Gl(e);
  }
  function hu(e, t) {
    try {
      var a = e.onUncaughtError;
      a(t.value, { componentStack: t.stack });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function Ed(e, t, a) {
    try {
      var l = e.onCaughtError;
      l(a.value, {
        componentStack: a.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  function Or(e, t, a) {
    return a = $n(a), a.tag = 3, a.payload = { element: null }, a.callback = function() {
      hu(e, t);
    }, a;
  }
  function Td(e) {
    return e = $n(e), e.tag = 3, e;
  }
  function Ad(e, t, a, l) {
    var s = a.type.getDerivedStateFromError;
    if (typeof s == "function") {
      var c = l.value;
      e.payload = function() {
        return s(c);
      }, e.callback = function() {
        Ed(t, a, l);
      };
    }
    var f = a.stateNode;
    f !== null && typeof f.componentDidCatch == "function" && (e.callback = function() {
      Ed(t, a, l), typeof s != "function" && (Vn === null ? Vn = /* @__PURE__ */ new Set([this]) : Vn.add(this));
      var p = l.stack;
      this.componentDidCatch(l.value, {
        componentStack: p !== null ? p : ""
      });
    });
  }
  function Ay(e, t, a, l, s) {
    if (a.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
      if (t = a.alternate, t !== null && Ia(
        t,
        a,
        s,
        !0
      ), a = Ot.current, a !== null) {
        switch (a.tag) {
          case 31:
          case 13:
            return kt === null ? xu() : a.alternate === null && ke === 0 && (ke = 3), a.flags &= -257, a.flags |= 65536, a.lanes = s, l === eu ? a.flags |= 16384 : (t = a.updateQueue, t === null ? a.updateQueue = /* @__PURE__ */ new Set([l]) : t.add(l), ec(e, l, s)), !1;
          case 22:
            return a.flags |= 65536, l === eu ? a.flags |= 16384 : (t = a.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([l])
            }, a.updateQueue = t) : (a = t.retryQueue, a === null ? t.retryQueue = /* @__PURE__ */ new Set([l]) : a.add(l)), ec(e, l, s)), !1;
        }
        throw Error(r(435, a.tag));
      }
      return ec(e, l, s), xu(), !1;
    }
    if (ve)
      return t = Ot.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = s, l !== Vs && (e = Error(r(422), { cause: l }), Yi(Qt(e, a)))) : (l !== Vs && (t = Error(r(423), {
        cause: l
      }), Yi(
        Qt(t, a)
      )), e = e.current.alternate, e.flags |= 65536, s &= -s, e.lanes |= s, l = Qt(l, a), s = Or(
        e.stateNode,
        l,
        s
      ), lr(e, s), ke !== 4 && (ke = 2)), !1;
    var c = Error(r(520), { cause: l });
    if (c = Qt(c, a), ol === null ? ol = [c] : ol.push(c), ke !== 4 && (ke = 2), t === null) return !0;
    l = Qt(l, a), a = t;
    do {
      switch (a.tag) {
        case 3:
          return a.flags |= 65536, e = s & -s, a.lanes |= e, e = Or(a.stateNode, l, e), lr(a, e), !1;
        case 1:
          if (t = a.type, c = a.stateNode, (a.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || c !== null && typeof c.componentDidCatch == "function" && (Vn === null || !Vn.has(c))))
            return a.flags |= 65536, s &= -s, a.lanes |= s, s = Td(s), Ad(
              s,
              e,
              a,
              l
            ), lr(a, s), !1;
      }
      a = a.return;
    } while (a !== null);
    return !1;
  }
  var Nr = Error(r(461)), Je = !1;
  function st(e, t, a, l) {
    t.child = e === null ? Mf(t, null, a, l) : wa(
      t,
      e.child,
      a,
      l
    );
  }
  function Od(e, t, a, l, s) {
    a = a.render;
    var c = t.ref;
    if ("ref" in l) {
      var f = {};
      for (var p in l)
        p !== "ref" && (f[p] = l[p]);
    } else f = l;
    return ba(t), l = fr(
      e,
      t,
      a,
      f,
      c,
      s
    ), p = dr(), e !== null && !Je ? (hr(e, t, s), gn(e, t, s)) : (ve && p && Ks(t), t.flags |= 1, st(e, t, l, s), t.child);
  }
  function Nd(e, t, a, l, s) {
    if (e === null) {
      var c = a.type;
      return typeof c == "function" && !Ls(c) && c.defaultProps === void 0 && a.compare === null ? (t.tag = 15, t.type = c, Cd(
        e,
        t,
        c,
        l,
        s
      )) : (e = Vl(
        a.type,
        null,
        l,
        t,
        t.mode,
        s
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (c = e.child, !Qr(e, s)) {
      var f = c.memoizedProps;
      if (a = a.compare, a = a !== null ? a : ki, a(f, l) && e.ref === t.ref)
        return gn(e, t, s);
    }
    return t.flags |= 1, e = dn(c, l), e.ref = t.ref, e.return = t, t.child = e;
  }
  function Cd(e, t, a, l, s) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (ki(c, l) && e.ref === t.ref)
        if (Je = !1, t.pendingProps = l = c, Qr(e, s))
          (e.flags & 131072) !== 0 && (Je = !0);
        else
          return t.lanes = e.lanes, gn(e, t, s);
    }
    return Cr(
      e,
      t,
      a,
      l,
      s
    );
  }
  function Md(e, t, a, l) {
    var s = l.children, c = e !== null ? e.memoizedState : null;
    if (e === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), l.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (c = c !== null ? c.baseLanes | a : a, e !== null) {
          for (l = t.child = e.child, s = 0; l !== null; )
            s = s | l.lanes | l.childLanes, l = l.sibling;
          l = s & ~c;
        } else l = 0, t.child = null;
        return Dd(
          e,
          t,
          c,
          a,
          l
        );
      }
      if ((a & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && Wl(
          t,
          c !== null ? c.cachePool : null
        ), c !== null ? qf(t, c) : sr(), Uf(t);
      else
        return l = t.lanes = 536870912, Dd(
          e,
          t,
          c !== null ? c.baseLanes | a : a,
          a,
          l
        );
    } else
      c !== null ? (Wl(t, c.cachePool), qf(t, c), Gn(), t.memoizedState = null) : (e !== null && Wl(t, null), sr(), Gn());
    return st(e, t, s, a), t.child;
  }
  function al(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function Dd(e, t, a, l, s) {
    var c = tr();
    return c = c === null ? null : { parent: Xe._currentValue, pool: c }, t.memoizedState = {
      baseLanes: a,
      cachePool: c
    }, e !== null && Wl(t, null), sr(), Uf(t), e !== null && Ia(e, t, l, !0), t.childLanes = s, null;
  }
  function mu(e, t) {
    return t = vu(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function Rd(e, t, a) {
    return wa(t, e.child, null, a), e = mu(t, t.pendingProps), e.flags |= 2, Nt(t), t.memoizedState = null, e;
  }
  function Oy(e, t, a) {
    var l = t.pendingProps, s = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (ve) {
        if (l.mode === "hidden")
          return e = mu(t, l), t.lanes = 536870912, al(null, e);
        if (cr(t), (e = Ce) ? (e = Kh(
          e,
          $t
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Un !== null ? { id: nn, overflow: an } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = yf(e), a.return = t, t.child = a, lt = t, Ce = null)) : e = null, e === null) throw Qn(t);
        return t.lanes = 536870912, null;
      }
      return mu(t, l);
    }
    var c = e.memoizedState;
    if (c !== null) {
      var f = c.dehydrated;
      if (cr(t), s)
        if (t.flags & 256)
          t.flags &= -257, t = Rd(
            e,
            t,
            a
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(r(558));
      else if (Je || Ia(e, t, a, !1), s = (a & e.childLanes) !== 0, Je || s) {
        if (l = Ne, l !== null && (f = wo(l, a), f !== 0 && f !== c.retryLane))
          throw c.retryLane = f, pa(e, f), _t(l, e, f), Nr;
        xu(), t = Rd(
          e,
          t,
          a
        );
      } else
        e = c.treeContext, Ce = Lt(f.nextSibling), lt = t, ve = !0, Zn = null, $t = !1, e !== null && _f(t, e), t = mu(t, l), t.flags |= 4096;
      return t;
    }
    return e = dn(e.child, {
      mode: l.mode,
      children: l.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function pu(e, t) {
    var a = t.ref;
    if (a === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof a != "function" && typeof a != "object")
        throw Error(r(284));
      (e === null || e.ref !== a) && (t.flags |= 4194816);
    }
  }
  function Cr(e, t, a, l, s) {
    return ba(t), a = fr(
      e,
      t,
      a,
      l,
      void 0,
      s
    ), l = dr(), e !== null && !Je ? (hr(e, t, s), gn(e, t, s)) : (ve && l && Ks(t), t.flags |= 1, st(e, t, a, s), t.child);
  }
  function qd(e, t, a, l, s, c) {
    return ba(t), t.updateQueue = null, a = Qf(
      t,
      l,
      a,
      s
    ), Zf(e), l = dr(), e !== null && !Je ? (hr(e, t, c), gn(e, t, c)) : (ve && l && Ks(t), t.flags |= 1, st(e, t, a, c), t.child);
  }
  function Ud(e, t, a, l, s) {
    if (ba(t), t.stateNode === null) {
      var c = Xa, f = a.contextType;
      typeof f == "object" && f !== null && (c = ut(f)), c = new a(l, c), t.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, c.updater = Ar, t.stateNode = c, c._reactInternals = t, c = t.stateNode, c.props = l, c.state = t.memoizedState, c.refs = {}, ar(t), f = a.contextType, c.context = typeof f == "object" && f !== null ? ut(f) : Xa, c.state = t.memoizedState, f = a.getDerivedStateFromProps, typeof f == "function" && (Tr(
        t,
        a,
        f,
        l
      ), c.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (f = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), f !== c.state && Ar.enqueueReplaceState(c, c.state, null), Wi(t, l, c, s), Ii(), c.state = t.memoizedState), typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !0;
    } else if (e === null) {
      c = t.stateNode;
      var p = t.memoizedProps, b = xa(a, p);
      c.props = b;
      var T = c.context, D = a.contextType;
      f = Xa, typeof D == "object" && D !== null && (f = ut(D));
      var H = a.getDerivedStateFromProps;
      D = typeof H == "function" || typeof c.getSnapshotBeforeUpdate == "function", p = t.pendingProps !== p, D || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (p || T !== f) && zd(
        t,
        c,
        l,
        f
      ), Bn = !1;
      var O = t.memoizedState;
      c.state = O, Wi(t, l, c, s), Ii(), T = t.memoizedState, p || O !== T || Bn ? (typeof H == "function" && (Tr(
        t,
        a,
        H,
        l
      ), T = t.memoizedState), (b = Bn || Sd(
        t,
        a,
        b,
        l,
        O,
        T,
        f
      )) ? (D || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount()), typeof c.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = l, t.memoizedState = T), c.props = l, c.state = T, c.context = f, l = b) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !1);
    } else {
      c = t.stateNode, ir(e, t), f = t.memoizedProps, D = xa(a, f), c.props = D, H = t.pendingProps, O = c.context, T = a.contextType, b = Xa, typeof T == "object" && T !== null && (b = ut(T)), p = a.getDerivedStateFromProps, (T = typeof p == "function" || typeof c.getSnapshotBeforeUpdate == "function") || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (f !== H || O !== b) && zd(
        t,
        c,
        l,
        b
      ), Bn = !1, O = t.memoizedState, c.state = O, Wi(t, l, c, s), Ii();
      var N = t.memoizedState;
      f !== H || O !== N || Bn || e !== null && e.dependencies !== null && Fl(e.dependencies) ? (typeof p == "function" && (Tr(
        t,
        a,
        p,
        l
      ), N = t.memoizedState), (D = Bn || Sd(
        t,
        a,
        D,
        l,
        O,
        N,
        b
      ) || e !== null && e.dependencies !== null && Fl(e.dependencies)) ? (T || typeof c.UNSAFE_componentWillUpdate != "function" && typeof c.componentWillUpdate != "function" || (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(l, N, b), typeof c.UNSAFE_componentWillUpdate == "function" && c.UNSAFE_componentWillUpdate(
        l,
        N,
        b
      )), typeof c.componentDidUpdate == "function" && (t.flags |= 4), typeof c.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof c.componentDidUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 1024), t.memoizedProps = l, t.memoizedState = N), c.props = l, c.state = N, c.context = b, l = D) : (typeof c.componentDidUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 1024), l = !1);
    }
    return c = l, pu(e, t), l = (t.flags & 128) !== 0, c || l ? (c = t.stateNode, a = l && typeof a.getDerivedStateFromError != "function" ? null : c.render(), t.flags |= 1, e !== null && l ? (t.child = wa(
      t,
      e.child,
      null,
      s
    ), t.child = wa(
      t,
      null,
      a,
      s
    )) : st(e, t, a, s), t.memoizedState = c.state, e = t.child) : e = gn(
      e,
      t,
      s
    ), e;
  }
  function Zd(e, t, a, l) {
    return ya(), t.flags |= 256, st(e, t, a, l), t.child;
  }
  var Mr = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Dr(e) {
    return { baseLanes: e, cachePool: Ef() };
  }
  function Rr(e, t, a) {
    return e = e !== null ? e.childLanes & ~a : 0, t && (e |= Mt), e;
  }
  function Qd(e, t, a) {
    var l = t.pendingProps, s = !1, c = (t.flags & 128) !== 0, f;
    if ((f = c) || (f = e !== null && e.memoizedState === null ? !1 : (Ge.current & 2) !== 0), f && (s = !0, t.flags &= -129), f = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (ve) {
        if (s ? Ln(t) : Gn(), (e = Ce) ? (e = Kh(
          e,
          $t
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Un !== null ? { id: nn, overflow: an } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = yf(e), a.return = t, t.child = a, lt = t, Ce = null)) : e = null, e === null) throw Qn(t);
        return vc(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var p = l.children;
      return l = l.fallback, s ? (Gn(), s = t.mode, p = vu(
        { mode: "hidden", children: p },
        s
      ), l = va(
        l,
        s,
        a,
        null
      ), p.return = t, l.return = t, p.sibling = l, t.child = p, l = t.child, l.memoizedState = Dr(a), l.childLanes = Rr(
        e,
        f,
        a
      ), t.memoizedState = Mr, al(null, l)) : (Ln(t), qr(t, p));
    }
    var b = e.memoizedState;
    if (b !== null && (p = b.dehydrated, p !== null)) {
      if (c)
        t.flags & 256 ? (Ln(t), t.flags &= -257, t = Ur(
          e,
          t,
          a
        )) : t.memoizedState !== null ? (Gn(), t.child = e.child, t.flags |= 128, t = null) : (Gn(), p = l.fallback, s = t.mode, l = vu(
          { mode: "visible", children: l.children },
          s
        ), p = va(
          p,
          s,
          a,
          null
        ), p.flags |= 2, l.return = t, p.return = t, l.sibling = p, t.child = l, wa(
          t,
          e.child,
          null,
          a
        ), l = t.child, l.memoizedState = Dr(a), l.childLanes = Rr(
          e,
          f,
          a
        ), t.memoizedState = Mr, t = al(null, l));
      else if (Ln(t), vc(p)) {
        if (f = p.nextSibling && p.nextSibling.dataset, f) var T = f.dgst;
        f = T, l = Error(r(419)), l.stack = "", l.digest = f, Yi({ value: l, source: null, stack: null }), t = Ur(
          e,
          t,
          a
        );
      } else if (Je || Ia(e, t, a, !1), f = (a & e.childLanes) !== 0, Je || f) {
        if (f = Ne, f !== null && (l = wo(f, a), l !== 0 && l !== b.retryLane))
          throw b.retryLane = l, pa(e, l), _t(f, e, l), Nr;
        pc(p) || xu(), t = Ur(
          e,
          t,
          a
        );
      } else
        pc(p) ? (t.flags |= 192, t.child = e.child, t = null) : (e = b.treeContext, Ce = Lt(
          p.nextSibling
        ), lt = t, ve = !0, Zn = null, $t = !1, e !== null && _f(t, e), t = qr(
          t,
          l.children
        ), t.flags |= 4096);
      return t;
    }
    return s ? (Gn(), p = l.fallback, s = t.mode, b = e.child, T = b.sibling, l = dn(b, {
      mode: "hidden",
      children: l.children
    }), l.subtreeFlags = b.subtreeFlags & 65011712, T !== null ? p = dn(
      T,
      p
    ) : (p = va(
      p,
      s,
      a,
      null
    ), p.flags |= 2), p.return = t, l.return = t, l.sibling = p, t.child = l, al(null, l), l = t.child, p = e.child.memoizedState, p === null ? p = Dr(a) : (s = p.cachePool, s !== null ? (b = Xe._currentValue, s = s.parent !== b ? { parent: b, pool: b } : s) : s = Ef(), p = {
      baseLanes: p.baseLanes | a,
      cachePool: s
    }), l.memoizedState = p, l.childLanes = Rr(
      e,
      f,
      a
    ), t.memoizedState = Mr, al(e.child, l)) : (Ln(t), a = e.child, e = a.sibling, a = dn(a, {
      mode: "visible",
      children: l.children
    }), a.return = t, a.sibling = null, e !== null && (f = t.deletions, f === null ? (t.deletions = [e], t.flags |= 16) : f.push(e)), t.child = a, t.memoizedState = null, a);
  }
  function qr(e, t) {
    return t = vu(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function vu(e, t) {
    return e = At(22, e, null, t), e.lanes = 0, e;
  }
  function Ur(e, t, a) {
    return wa(t, e.child, null, a), e = qr(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Hd(e, t, a) {
    e.lanes |= t;
    var l = e.alternate;
    l !== null && (l.lanes |= t), Is(e.return, t, a);
  }
  function Zr(e, t, a, l, s, c) {
    var f = e.memoizedState;
    f === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: l,
      tail: a,
      tailMode: s,
      treeForkCount: c
    } : (f.isBackwards = t, f.rendering = null, f.renderingStartTime = 0, f.last = l, f.tail = a, f.tailMode = s, f.treeForkCount = c);
  }
  function Bd(e, t, a) {
    var l = t.pendingProps, s = l.revealOrder, c = l.tail;
    l = l.children;
    var f = Ge.current, p = (f & 2) !== 0;
    if (p ? (f = f & 1 | 2, t.flags |= 128) : f &= 1, K(Ge, f), st(e, t, l, a), l = ve ? Gi : 0, !p && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Hd(e, a, t);
        else if (e.tag === 19)
          Hd(e, a, t);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t)
            break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
    switch (s) {
      case "forwards":
        for (a = t.child, s = null; a !== null; )
          e = a.alternate, e !== null && iu(e) === null && (s = a), a = a.sibling;
        a = s, a === null ? (s = t.child, t.child = null) : (s = a.sibling, a.sibling = null), Zr(
          t,
          !1,
          s,
          a,
          c,
          l
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (a = null, s = t.child, t.child = null; s !== null; ) {
          if (e = s.alternate, e !== null && iu(e) === null) {
            t.child = s;
            break;
          }
          e = s.sibling, s.sibling = a, a = s, s = e;
        }
        Zr(
          t,
          !0,
          a,
          null,
          c,
          l
        );
        break;
      case "together":
        Zr(
          t,
          !1,
          null,
          null,
          void 0,
          l
        );
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function gn(e, t, a) {
    if (e !== null && (t.dependencies = e.dependencies), Xn |= t.lanes, (a & t.childLanes) === 0)
      if (e !== null) {
        if (Ia(
          e,
          t,
          a,
          !1
        ), (a & t.childLanes) === 0)
          return null;
      } else return null;
    if (e !== null && t.child !== e.child)
      throw Error(r(153));
    if (t.child !== null) {
      for (e = t.child, a = dn(e, e.pendingProps), t.child = a, a.return = t; e.sibling !== null; )
        e = e.sibling, a = a.sibling = dn(e, e.pendingProps), a.return = t;
      a.sibling = null;
    }
    return t.child;
  }
  function Qr(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && Fl(e)));
  }
  function Ny(e, t, a) {
    switch (t.tag) {
      case 3:
        at(t, t.stateNode.containerInfo), Hn(t, Xe, e.memoizedState.cache), ya();
        break;
      case 27:
      case 5:
        Mn(t);
        break;
      case 4:
        at(t, t.stateNode.containerInfo);
        break;
      case 10:
        Hn(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, cr(t), null;
        break;
      case 13:
        var l = t.memoizedState;
        if (l !== null)
          return l.dehydrated !== null ? (Ln(t), t.flags |= 128, null) : (a & t.child.childLanes) !== 0 ? Qd(e, t, a) : (Ln(t), e = gn(
            e,
            t,
            a
          ), e !== null ? e.sibling : null);
        Ln(t);
        break;
      case 19:
        var s = (e.flags & 128) !== 0;
        if (l = (a & t.childLanes) !== 0, l || (Ia(
          e,
          t,
          a,
          !1
        ), l = (a & t.childLanes) !== 0), s) {
          if (l)
            return Bd(
              e,
              t,
              a
            );
          t.flags |= 128;
        }
        if (s = t.memoizedState, s !== null && (s.rendering = null, s.tail = null, s.lastEffect = null), K(Ge, Ge.current), l) break;
        return null;
      case 22:
        return t.lanes = 0, Md(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        Hn(t, Xe, e.memoizedState.cache);
    }
    return gn(e, t, a);
  }
  function $d(e, t, a) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        Je = !0;
      else {
        if (!Qr(e, a) && (t.flags & 128) === 0)
          return Je = !1, Ny(
            e,
            t,
            a
          );
        Je = (e.flags & 131072) !== 0;
      }
    else
      Je = !1, ve && (t.flags & 1048576) !== 0 && bf(t, Gi, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var l = t.pendingProps;
          if (e = Sa(t.elementType), t.type = e, typeof e == "function")
            Ls(e) ? (l = xa(e, l), t.tag = 1, t = Ud(
              null,
              t,
              e,
              l,
              a
            )) : (t.tag = 0, t = Cr(
              null,
              t,
              e,
              l,
              a
            ));
          else {
            if (e != null) {
              var s = e.$$typeof;
              if (s === L) {
                t.tag = 11, t = Od(
                  null,
                  t,
                  e,
                  l,
                  a
                );
                break e;
              } else if (s === F) {
                t.tag = 14, t = Nd(
                  null,
                  t,
                  e,
                  l,
                  a
                );
                break e;
              }
            }
            throw t = Jt(e) || e, Error(r(306, t, ""));
          }
        }
        return t;
      case 0:
        return Cr(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 1:
        return l = t.type, s = xa(
          l,
          t.pendingProps
        ), Ud(
          e,
          t,
          l,
          s,
          a
        );
      case 3:
        e: {
          if (at(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(r(387));
          l = t.pendingProps;
          var c = t.memoizedState;
          s = c.element, ir(e, t), Wi(t, l, null, a);
          var f = t.memoizedState;
          if (l = f.cache, Hn(t, Xe, l), l !== c.cache && Ws(
            t,
            [Xe],
            a,
            !0
          ), Ii(), l = f.element, c.isDehydrated)
            if (c = {
              element: l,
              isDehydrated: !1,
              cache: f.cache
            }, t.updateQueue.baseState = c, t.memoizedState = c, t.flags & 256) {
              t = Zd(
                e,
                t,
                l,
                a
              );
              break e;
            } else if (l !== s) {
              s = Qt(
                Error(r(424)),
                t
              ), Yi(s), t = Zd(
                e,
                t,
                l,
                a
              );
              break e;
            } else {
              switch (e = t.stateNode.containerInfo, e.nodeType) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
              }
              for (Ce = Lt(e.firstChild), lt = t, ve = !0, Zn = null, $t = !0, a = Mf(
                t,
                null,
                l,
                a
              ), t.child = a; a; )
                a.flags = a.flags & -3 | 4096, a = a.sibling;
            }
          else {
            if (ya(), l === s) {
              t = gn(
                e,
                t,
                a
              );
              break e;
            }
            st(e, t, l, a);
          }
          t = t.child;
        }
        return t;
      case 26:
        return pu(e, t), e === null ? (a = Wh(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = a : ve || (a = t.type, e = t.pendingProps, l = Mu(
          oe.current
        ).createElement(a), l[it] = t, l[mt] = e, rt(l, a, e), tt(l), t.stateNode = l) : t.memoizedState = Wh(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return Mn(t), e === null && ve && (l = t.stateNode = Jh(
          t.type,
          t.pendingProps,
          oe.current
        ), lt = t, $t = !0, s = Ce, Wn(t.type) ? (yc = s, Ce = Lt(l.firstChild)) : Ce = s), st(
          e,
          t,
          t.pendingProps.children,
          a
        ), pu(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && ve && ((s = l = Ce) && (l = ug(
          l,
          t.type,
          t.pendingProps,
          $t
        ), l !== null ? (t.stateNode = l, lt = t, Ce = Lt(l.firstChild), $t = !1, s = !0) : s = !1), s || Qn(t)), Mn(t), s = t.type, c = t.pendingProps, f = e !== null ? e.memoizedProps : null, l = c.children, dc(s, c) ? l = null : f !== null && dc(s, f) && (t.flags |= 32), t.memoizedState !== null && (s = fr(
          e,
          t,
          Sy,
          null,
          null,
          a
        ), gl._currentValue = s), pu(e, t), st(e, t, l, a), t.child;
      case 6:
        return e === null && ve && ((e = a = Ce) && (a = sg(
          a,
          t.pendingProps,
          $t
        ), a !== null ? (t.stateNode = a, lt = t, Ce = null, e = !0) : e = !1), e || Qn(t)), null;
      case 13:
        return Qd(e, t, a);
      case 4:
        return at(
          t,
          t.stateNode.containerInfo
        ), l = t.pendingProps, e === null ? t.child = wa(
          t,
          null,
          l,
          a
        ) : st(e, t, l, a), t.child;
      case 11:
        return Od(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 7:
        return st(
          e,
          t,
          t.pendingProps,
          a
        ), t.child;
      case 8:
        return st(
          e,
          t,
          t.pendingProps.children,
          a
        ), t.child;
      case 12:
        return st(
          e,
          t,
          t.pendingProps.children,
          a
        ), t.child;
      case 10:
        return l = t.pendingProps, Hn(t, t.type, l.value), st(e, t, l.children, a), t.child;
      case 9:
        return s = t.type._context, l = t.pendingProps.children, ba(t), s = ut(s), l = l(s), t.flags |= 1, st(e, t, l, a), t.child;
      case 14:
        return Nd(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 15:
        return Cd(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 19:
        return Bd(e, t, a);
      case 31:
        return Oy(e, t, a);
      case 22:
        return Md(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        return ba(t), l = ut(Xe), e === null ? (s = tr(), s === null && (s = Ne, c = Ps(), s.pooledCache = c, c.refCount++, c !== null && (s.pooledCacheLanes |= a), s = c), t.memoizedState = { parent: l, cache: s }, ar(t), Hn(t, Xe, s)) : ((e.lanes & a) !== 0 && (ir(e, t), Wi(t, null, null, a), Ii()), s = e.memoizedState, c = t.memoizedState, s.parent !== l ? (s = { parent: l, cache: l }, t.memoizedState = s, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = s), Hn(t, Xe, l)) : (l = c.cache, Hn(t, Xe, l), l !== s.cache && Ws(
          t,
          [Xe],
          a,
          !0
        ))), st(
          e,
          t,
          t.pendingProps.children,
          a
        ), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(r(156, t.tag));
  }
  function bn(e) {
    e.flags |= 4;
  }
  function Hr(e, t, a, l, s) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (s & 335544128) === s)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (mh()) e.flags |= 8192;
        else
          throw za = eu, nr;
    } else e.flags &= -16777217;
  }
  function kd(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !am(t))
      if (mh()) e.flags |= 8192;
      else
        throw za = eu, nr;
  }
  function yu(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? _o() : 536870912, e.lanes |= t, ci |= t);
  }
  function il(e, t) {
    if (!ve)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var a = null; t !== null; )
            t.alternate !== null && (a = t), t = t.sibling;
          a === null ? e.tail = null : a.sibling = null;
          break;
        case "collapsed":
          a = e.tail;
          for (var l = null; a !== null; )
            a.alternate !== null && (l = a), a = a.sibling;
          l === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : l.sibling = null;
      }
  }
  function Me(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, a = 0, l = 0;
    if (t)
      for (var s = e.child; s !== null; )
        a |= s.lanes | s.childLanes, l |= s.subtreeFlags & 65011712, l |= s.flags & 65011712, s.return = e, s = s.sibling;
    else
      for (s = e.child; s !== null; )
        a |= s.lanes | s.childLanes, l |= s.subtreeFlags, l |= s.flags, s.return = e, s = s.sibling;
    return e.subtreeFlags |= l, e.childLanes = a, t;
  }
  function Cy(e, t, a) {
    var l = t.pendingProps;
    switch (Xs(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Me(t), null;
      case 1:
        return Me(t), null;
      case 3:
        return a = t.stateNode, l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), pn(Xe), De(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (e === null || e.child === null) && (Fa(t) ? bn(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Js())), Me(t), null;
      case 26:
        var s = t.type, c = t.memoizedState;
        return e === null ? (bn(t), c !== null ? (Me(t), kd(t, c)) : (Me(t), Hr(
          t,
          s,
          null,
          l,
          a
        ))) : c ? c !== e.memoizedState ? (bn(t), Me(t), kd(t, c)) : (Me(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== l && bn(t), Me(t), Hr(
          t,
          s,
          e,
          l,
          a
        )), null;
      case 27:
        if (ca(t), a = oe.current, s = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && bn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return Me(t), null;
          }
          e = X.current, Fa(t) ? Sf(t) : (e = Jh(s, l, a), t.stateNode = e, bn(t));
        }
        return Me(t), null;
      case 5:
        if (ca(t), s = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && bn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return Me(t), null;
          }
          if (c = X.current, Fa(t))
            Sf(t);
          else {
            var f = Mu(
              oe.current
            );
            switch (c) {
              case 1:
                c = f.createElementNS(
                  "http://www.w3.org/2000/svg",
                  s
                );
                break;
              case 2:
                c = f.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  s
                );
                break;
              default:
                switch (s) {
                  case "svg":
                    c = f.createElementNS(
                      "http://www.w3.org/2000/svg",
                      s
                    );
                    break;
                  case "math":
                    c = f.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      s
                    );
                    break;
                  case "script":
                    c = f.createElement("div"), c.innerHTML = "<script><\/script>", c = c.removeChild(
                      c.firstChild
                    );
                    break;
                  case "select":
                    c = typeof l.is == "string" ? f.createElement("select", {
                      is: l.is
                    }) : f.createElement("select"), l.multiple ? c.multiple = !0 : l.size && (c.size = l.size);
                    break;
                  default:
                    c = typeof l.is == "string" ? f.createElement(s, { is: l.is }) : f.createElement(s);
                }
            }
            c[it] = t, c[mt] = l;
            e: for (f = t.child; f !== null; ) {
              if (f.tag === 5 || f.tag === 6)
                c.appendChild(f.stateNode);
              else if (f.tag !== 4 && f.tag !== 27 && f.child !== null) {
                f.child.return = f, f = f.child;
                continue;
              }
              if (f === t) break e;
              for (; f.sibling === null; ) {
                if (f.return === null || f.return === t)
                  break e;
                f = f.return;
              }
              f.sibling.return = f.return, f = f.sibling;
            }
            t.stateNode = c;
            e: switch (rt(c, s, l), s) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                l = !!l.autoFocus;
                break e;
              case "img":
                l = !0;
                break e;
              default:
                l = !1;
            }
            l && bn(t);
          }
        }
        return Me(t), Hr(
          t,
          t.type,
          e === null ? null : e.memoizedProps,
          t.pendingProps,
          a
        ), null;
      case 6:
        if (e && t.stateNode != null)
          e.memoizedProps !== l && bn(t);
        else {
          if (typeof l != "string" && t.stateNode === null)
            throw Error(r(166));
          if (e = oe.current, Fa(t)) {
            if (e = t.stateNode, a = t.memoizedProps, l = null, s = lt, s !== null)
              switch (s.tag) {
                case 27:
                case 5:
                  l = s.memoizedProps;
              }
            e[it] = t, e = !!(e.nodeValue === a || l !== null && l.suppressHydrationWarning === !0 || Qh(e.nodeValue, a)), e || Qn(t, !0);
          } else
            e = Mu(e).createTextNode(
              l
            ), e[it] = t, t.stateNode = e;
        }
        return Me(t), null;
      case 31:
        if (a = t.memoizedState, e === null || e.memoizedState !== null) {
          if (l = Fa(t), a !== null) {
            if (e === null) {
              if (!l) throw Error(r(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(557));
              e[it] = t;
            } else
              ya(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Me(t), e = !1;
          } else
            a = Js(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), e = !0;
          if (!e)
            return t.flags & 256 ? (Nt(t), t) : (Nt(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(r(558));
        }
        return Me(t), null;
      case 13:
        if (l = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (s = Fa(t), l !== null && l.dehydrated !== null) {
            if (e === null) {
              if (!s) throw Error(r(318));
              if (s = t.memoizedState, s = s !== null ? s.dehydrated : null, !s) throw Error(r(317));
              s[it] = t;
            } else
              ya(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Me(t), s = !1;
          } else
            s = Js(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = s), s = !0;
          if (!s)
            return t.flags & 256 ? (Nt(t), t) : (Nt(t), null);
        }
        return Nt(t), (t.flags & 128) !== 0 ? (t.lanes = a, t) : (a = l !== null, e = e !== null && e.memoizedState !== null, a && (l = t.child, s = null, l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (s = l.alternate.memoizedState.cachePool.pool), c = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (c = l.memoizedState.cachePool.pool), c !== s && (l.flags |= 2048)), a !== e && a && (t.child.flags |= 8192), yu(t, t.updateQueue), Me(t), null);
      case 4:
        return De(), e === null && sc(t.stateNode.containerInfo), Me(t), null;
      case 10:
        return pn(t.type), Me(t), null;
      case 19:
        if (Q(Ge), l = t.memoizedState, l === null) return Me(t), null;
        if (s = (t.flags & 128) !== 0, c = l.rendering, c === null)
          if (s) il(l, !1);
          else {
            if (ke !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (c = iu(e), c !== null) {
                  for (t.flags |= 128, il(l, !1), e = c.updateQueue, t.updateQueue = e, yu(t, e), t.subtreeFlags = 0, e = a, a = t.child; a !== null; )
                    vf(a, e), a = a.sibling;
                  return K(
                    Ge,
                    Ge.current & 1 | 2
                  ), ve && hn(t, l.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            l.tail !== null && jt() > zu && (t.flags |= 128, s = !0, il(l, !1), t.lanes = 4194304);
          }
        else {
          if (!s)
            if (e = iu(c), e !== null) {
              if (t.flags |= 128, s = !0, e = e.updateQueue, t.updateQueue = e, yu(t, e), il(l, !0), l.tail === null && l.tailMode === "hidden" && !c.alternate && !ve)
                return Me(t), null;
            } else
              2 * jt() - l.renderingStartTime > zu && a !== 536870912 && (t.flags |= 128, s = !0, il(l, !1), t.lanes = 4194304);
          l.isBackwards ? (c.sibling = t.child, t.child = c) : (e = l.last, e !== null ? e.sibling = c : t.child = c, l.last = c);
        }
        return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = jt(), e.sibling = null, a = Ge.current, K(
          Ge,
          s ? a & 1 | 2 : a & 1
        ), ve && hn(t, l.treeForkCount), e) : (Me(t), null);
      case 22:
      case 23:
        return Nt(t), rr(), l = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192), l ? (a & 536870912) !== 0 && (t.flags & 128) === 0 && (Me(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Me(t), a = t.updateQueue, a !== null && yu(t, a.retryQueue), a = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== a && (t.flags |= 2048), e !== null && Q(_a), null;
      case 24:
        return a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), pn(Xe), Me(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(r(156, t.tag));
  }
  function My(e, t) {
    switch (Xs(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return pn(Xe), De(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return ca(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Nt(t), t.alternate === null)
            throw Error(r(340));
          ya();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Nt(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(r(340));
          ya();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return Q(Ge), null;
      case 4:
        return De(), null;
      case 10:
        return pn(t.type), null;
      case 22:
      case 23:
        return Nt(t), rr(), e !== null && Q(_a), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return pn(Xe), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Ld(e, t) {
    switch (Xs(t), t.tag) {
      case 3:
        pn(Xe), De();
        break;
      case 26:
      case 27:
      case 5:
        ca(t);
        break;
      case 4:
        De();
        break;
      case 31:
        t.memoizedState !== null && Nt(t);
        break;
      case 13:
        Nt(t);
        break;
      case 19:
        Q(Ge);
        break;
      case 10:
        pn(t.type);
        break;
      case 22:
      case 23:
        Nt(t), rr(), e !== null && Q(_a);
        break;
      case 24:
        pn(Xe);
    }
  }
  function ll(e, t) {
    try {
      var a = t.updateQueue, l = a !== null ? a.lastEffect : null;
      if (l !== null) {
        var s = l.next;
        a = s;
        do {
          if ((a.tag & e) === e) {
            l = void 0;
            var c = a.create, f = a.inst;
            l = c(), f.destroy = l;
          }
          a = a.next;
        } while (a !== s);
      }
    } catch (p) {
      xe(t, t.return, p);
    }
  }
  function Yn(e, t, a) {
    try {
      var l = t.updateQueue, s = l !== null ? l.lastEffect : null;
      if (s !== null) {
        var c = s.next;
        l = c;
        do {
          if ((l.tag & e) === e) {
            var f = l.inst, p = f.destroy;
            if (p !== void 0) {
              f.destroy = void 0, s = t;
              var b = a, T = p;
              try {
                T();
              } catch (D) {
                xe(
                  s,
                  b,
                  D
                );
              }
            }
          }
          l = l.next;
        } while (l !== c);
      }
    } catch (D) {
      xe(t, t.return, D);
    }
  }
  function Gd(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var a = e.stateNode;
      try {
        Rf(t, a);
      } catch (l) {
        xe(e, e.return, l);
      }
    }
  }
  function Yd(e, t, a) {
    a.props = xa(
      e.type,
      e.memoizedProps
    ), a.state = e.memoizedState;
    try {
      a.componentWillUnmount();
    } catch (l) {
      xe(e, t, l);
    }
  }
  function ul(e, t) {
    try {
      var a = e.ref;
      if (a !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var l = e.stateNode;
            break;
          case 30:
            l = e.stateNode;
            break;
          default:
            l = e.stateNode;
        }
        typeof a == "function" ? e.refCleanup = a(l) : a.current = l;
      }
    } catch (s) {
      xe(e, t, s);
    }
  }
  function ln(e, t) {
    var a = e.ref, l = e.refCleanup;
    if (a !== null)
      if (typeof l == "function")
        try {
          l();
        } catch (s) {
          xe(e, t, s);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof a == "function")
        try {
          a(null);
        } catch (s) {
          xe(e, t, s);
        }
      else a.current = null;
  }
  function Kd(e) {
    var t = e.type, a = e.memoizedProps, l = e.stateNode;
    try {
      e: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          a.autoFocus && l.focus();
          break e;
        case "img":
          a.src ? l.src = a.src : a.srcSet && (l.srcset = a.srcSet);
      }
    } catch (s) {
      xe(e, e.return, s);
    }
  }
  function Br(e, t, a) {
    try {
      var l = e.stateNode;
      eg(l, e.type, a, t), l[mt] = t;
    } catch (s) {
      xe(e, e.return, s);
    }
  }
  function Xd(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Wn(e.type) || e.tag === 4;
  }
  function $r(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Xd(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && Wn(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function kr(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(e, t) : (t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, t.appendChild(e), a = a._reactRootContainer, a != null || t.onclick !== null || (t.onclick = on));
    else if (l !== 4 && (l === 27 && Wn(e.type) && (a = e.stateNode, t = null), e = e.child, e !== null))
      for (kr(e, t, a), e = e.sibling; e !== null; )
        kr(e, t, a), e = e.sibling;
  }
  function gu(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? a.insertBefore(e, t) : a.appendChild(e);
    else if (l !== 4 && (l === 27 && Wn(e.type) && (a = e.stateNode), e = e.child, e !== null))
      for (gu(e, t, a), e = e.sibling; e !== null; )
        gu(e, t, a), e = e.sibling;
  }
  function Vd(e) {
    var t = e.stateNode, a = e.memoizedProps;
    try {
      for (var l = e.type, s = t.attributes; s.length; )
        t.removeAttributeNode(s[0]);
      rt(t, l, a), t[it] = e, t[mt] = a;
    } catch (c) {
      xe(e, e.return, c);
    }
  }
  var _n = !1, Fe = !1, Lr = !1, Jd = typeof WeakSet == "function" ? WeakSet : Set, nt = null;
  function Dy(e, t) {
    if (e = e.containerInfo, oc = Hu, e = sf(e), Us(e)) {
      if ("selectionStart" in e)
        var a = {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      else
        e: {
          a = (a = e.ownerDocument) && a.defaultView || window;
          var l = a.getSelection && a.getSelection();
          if (l && l.rangeCount !== 0) {
            a = l.anchorNode;
            var s = l.anchorOffset, c = l.focusNode;
            l = l.focusOffset;
            try {
              a.nodeType, c.nodeType;
            } catch {
              a = null;
              break e;
            }
            var f = 0, p = -1, b = -1, T = 0, D = 0, H = e, O = null;
            t: for (; ; ) {
              for (var N; H !== a || s !== 0 && H.nodeType !== 3 || (p = f + s), H !== c || l !== 0 && H.nodeType !== 3 || (b = f + l), H.nodeType === 3 && (f += H.nodeValue.length), (N = H.firstChild) !== null; )
                O = H, H = N;
              for (; ; ) {
                if (H === e) break t;
                if (O === a && ++T === s && (p = f), O === c && ++D === l && (b = f), (N = H.nextSibling) !== null) break;
                H = O, O = H.parentNode;
              }
              H = N;
            }
            a = p === -1 || b === -1 ? null : { start: p, end: b };
          } else a = null;
        }
      a = a || { start: 0, end: 0 };
    } else a = null;
    for (fc = { focusedElem: e, selectionRange: a }, Hu = !1, nt = t; nt !== null; )
      if (t = nt, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = t, nt = e;
      else
        for (; nt !== null; ) {
          switch (t = nt, c = t.alternate, e = t.flags, t.tag) {
            case 0:
              if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                for (a = 0; a < e.length; a++)
                  s = e[a], s.ref.impl = s.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && c !== null) {
                e = void 0, a = t, s = c.memoizedProps, c = c.memoizedState, l = a.stateNode;
                try {
                  var V = xa(
                    a.type,
                    s
                  );
                  e = l.getSnapshotBeforeUpdate(
                    V,
                    c
                  ), l.__reactInternalSnapshotBeforeUpdate = e;
                } catch (le) {
                  xe(
                    a,
                    a.return,
                    le
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = t.stateNode.containerInfo, a = e.nodeType, a === 9)
                  mc(e);
                else if (a === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      mc(e);
                      break;
                    default:
                      e.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((e & 1024) !== 0) throw Error(r(163));
          }
          if (e = t.sibling, e !== null) {
            e.return = t.return, nt = e;
            break;
          }
          nt = t.return;
        }
  }
  function Fd(e, t, a) {
    var l = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        zn(e, a), l & 4 && ll(5, a);
        break;
      case 1:
        if (zn(e, a), l & 4)
          if (e = a.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (f) {
              xe(a, a.return, f);
            }
          else {
            var s = xa(
              a.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              e.componentDidUpdate(
                s,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              );
            } catch (f) {
              xe(
                a,
                a.return,
                f
              );
            }
          }
        l & 64 && Gd(a), l & 512 && ul(a, a.return);
        break;
      case 3:
        if (zn(e, a), l & 64 && (e = a.updateQueue, e !== null)) {
          if (t = null, a.child !== null)
            switch (a.child.tag) {
              case 27:
              case 5:
                t = a.child.stateNode;
                break;
              case 1:
                t = a.child.stateNode;
            }
          try {
            Rf(e, t);
          } catch (f) {
            xe(a, a.return, f);
          }
        }
        break;
      case 27:
        t === null && l & 4 && Vd(a);
      case 26:
      case 5:
        zn(e, a), t === null && l & 4 && Kd(a), l & 512 && ul(a, a.return);
        break;
      case 12:
        zn(e, a);
        break;
      case 31:
        zn(e, a), l & 4 && Pd(e, a);
        break;
      case 13:
        zn(e, a), l & 4 && eh(e, a), l & 64 && (e = a.memoizedState, e !== null && (e = e.dehydrated, e !== null && (a = ky.bind(
          null,
          a
        ), rg(e, a))));
        break;
      case 22:
        if (l = a.memoizedState !== null || _n, !l) {
          t = t !== null && t.memoizedState !== null || Fe, s = _n;
          var c = Fe;
          _n = l, (Fe = t) && !c ? wn(
            e,
            a,
            (a.subtreeFlags & 8772) !== 0
          ) : zn(e, a), _n = s, Fe = c;
        }
        break;
      case 30:
        break;
      default:
        zn(e, a);
    }
  }
  function Id(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, Id(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && bs(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var Re = null, vt = !1;
  function Sn(e, t, a) {
    for (a = a.child; a !== null; )
      Wd(e, t, a), a = a.sibling;
  }
  function Wd(e, t, a) {
    if (xt && typeof xt.onCommitFiberUnmount == "function")
      try {
        xt.onCommitFiberUnmount(Ni, a);
      } catch {
      }
    switch (a.tag) {
      case 26:
        Fe || ln(a, t), Sn(
          e,
          t,
          a
        ), a.memoizedState ? a.memoizedState.count-- : a.stateNode && (a = a.stateNode, a.parentNode.removeChild(a));
        break;
      case 27:
        Fe || ln(a, t);
        var l = Re, s = vt;
        Wn(a.type) && (Re = a.stateNode, vt = !1), Sn(
          e,
          t,
          a
        ), pl(a.stateNode), Re = l, vt = s;
        break;
      case 5:
        Fe || ln(a, t);
      case 6:
        if (l = Re, s = vt, Re = null, Sn(
          e,
          t,
          a
        ), Re = l, vt = s, Re !== null)
          if (vt)
            try {
              (Re.nodeType === 9 ? Re.body : Re.nodeName === "HTML" ? Re.ownerDocument.body : Re).removeChild(a.stateNode);
            } catch (c) {
              xe(
                a,
                t,
                c
              );
            }
          else
            try {
              Re.removeChild(a.stateNode);
            } catch (c) {
              xe(
                a,
                t,
                c
              );
            }
        break;
      case 18:
        Re !== null && (vt ? (e = Re, Gh(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          a.stateNode
        ), yi(e)) : Gh(Re, a.stateNode));
        break;
      case 4:
        l = Re, s = vt, Re = a.stateNode.containerInfo, vt = !0, Sn(
          e,
          t,
          a
        ), Re = l, vt = s;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Yn(2, a, t), Fe || Yn(4, a, t), Sn(
          e,
          t,
          a
        );
        break;
      case 1:
        Fe || (ln(a, t), l = a.stateNode, typeof l.componentWillUnmount == "function" && Yd(
          a,
          t,
          l
        )), Sn(
          e,
          t,
          a
        );
        break;
      case 21:
        Sn(
          e,
          t,
          a
        );
        break;
      case 22:
        Fe = (l = Fe) || a.memoizedState !== null, Sn(
          e,
          t,
          a
        ), Fe = l;
        break;
      default:
        Sn(
          e,
          t,
          a
        );
    }
  }
  function Pd(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        yi(e);
      } catch (a) {
        xe(t, t.return, a);
      }
    }
  }
  function eh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        yi(e);
      } catch (a) {
        xe(t, t.return, a);
      }
  }
  function Ry(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new Jd()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Jd()), t;
      default:
        throw Error(r(435, e.tag));
    }
  }
  function bu(e, t) {
    var a = Ry(e);
    t.forEach(function(l) {
      if (!a.has(l)) {
        a.add(l);
        var s = Ly.bind(null, e, l);
        l.then(s, s);
      }
    });
  }
  function yt(e, t) {
    var a = t.deletions;
    if (a !== null)
      for (var l = 0; l < a.length; l++) {
        var s = a[l], c = e, f = t, p = f;
        e: for (; p !== null; ) {
          switch (p.tag) {
            case 27:
              if (Wn(p.type)) {
                Re = p.stateNode, vt = !1;
                break e;
              }
              break;
            case 5:
              Re = p.stateNode, vt = !1;
              break e;
            case 3:
            case 4:
              Re = p.stateNode.containerInfo, vt = !0;
              break e;
          }
          p = p.return;
        }
        if (Re === null) throw Error(r(160));
        Wd(c, f, s), Re = null, vt = !1, c = s.alternate, c !== null && (c.return = null), s.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        th(t, e), t = t.sibling;
  }
  var It = null;
  function th(e, t) {
    var a = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        yt(t, e), gt(e), l & 4 && (Yn(3, e, e.return), ll(3, e), Yn(5, e, e.return));
        break;
      case 1:
        yt(t, e), gt(e), l & 512 && (Fe || a === null || ln(a, a.return)), l & 64 && _n && (e = e.updateQueue, e !== null && (l = e.callbacks, l !== null && (a = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = a === null ? l : a.concat(l))));
        break;
      case 26:
        var s = It;
        if (yt(t, e), gt(e), l & 512 && (Fe || a === null || ln(a, a.return)), l & 4) {
          var c = a !== null ? a.memoizedState : null;
          if (l = e.memoizedState, a === null)
            if (l === null)
              if (e.stateNode === null) {
                e: {
                  l = e.type, a = e.memoizedProps, s = s.ownerDocument || s;
                  t: switch (l) {
                    case "title":
                      c = s.getElementsByTagName("title")[0], (!c || c[Di] || c[it] || c.namespaceURI === "http://www.w3.org/2000/svg" || c.hasAttribute("itemprop")) && (c = s.createElement(l), s.head.insertBefore(
                        c,
                        s.querySelector("head > title")
                      )), rt(c, l, a), c[it] = e, tt(c), l = c;
                      break e;
                    case "link":
                      var f = tm(
                        "link",
                        "href",
                        s
                      ).get(l + (a.href || ""));
                      if (f) {
                        for (var p = 0; p < f.length; p++)
                          if (c = f[p], c.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && c.getAttribute("rel") === (a.rel == null ? null : a.rel) && c.getAttribute("title") === (a.title == null ? null : a.title) && c.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                            f.splice(p, 1);
                            break t;
                          }
                      }
                      c = s.createElement(l), rt(c, l, a), s.head.appendChild(c);
                      break;
                    case "meta":
                      if (f = tm(
                        "meta",
                        "content",
                        s
                      ).get(l + (a.content || ""))) {
                        for (p = 0; p < f.length; p++)
                          if (c = f[p], c.getAttribute("content") === (a.content == null ? null : "" + a.content) && c.getAttribute("name") === (a.name == null ? null : a.name) && c.getAttribute("property") === (a.property == null ? null : a.property) && c.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && c.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                            f.splice(p, 1);
                            break t;
                          }
                      }
                      c = s.createElement(l), rt(c, l, a), s.head.appendChild(c);
                      break;
                    default:
                      throw Error(r(468, l));
                  }
                  c[it] = e, tt(c), l = c;
                }
                e.stateNode = l;
              } else
                nm(
                  s,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = em(
                s,
                l,
                e.memoizedProps
              );
          else
            c !== l ? (c === null ? a.stateNode !== null && (a = a.stateNode, a.parentNode.removeChild(a)) : c.count--, l === null ? nm(
              s,
              e.type,
              e.stateNode
            ) : em(
              s,
              l,
              e.memoizedProps
            )) : l === null && e.stateNode !== null && Br(
              e,
              e.memoizedProps,
              a.memoizedProps
            );
        }
        break;
      case 27:
        yt(t, e), gt(e), l & 512 && (Fe || a === null || ln(a, a.return)), a !== null && l & 4 && Br(
          e,
          e.memoizedProps,
          a.memoizedProps
        );
        break;
      case 5:
        if (yt(t, e), gt(e), l & 512 && (Fe || a === null || ln(a, a.return)), e.flags & 32) {
          s = e.stateNode;
          try {
            Ba(s, "");
          } catch (V) {
            xe(e, e.return, V);
          }
        }
        l & 4 && e.stateNode != null && (s = e.memoizedProps, Br(
          e,
          s,
          a !== null ? a.memoizedProps : s
        )), l & 1024 && (Lr = !0);
        break;
      case 6:
        if (yt(t, e), gt(e), l & 4) {
          if (e.stateNode === null)
            throw Error(r(162));
          l = e.memoizedProps, a = e.stateNode;
          try {
            a.nodeValue = l;
          } catch (V) {
            xe(e, e.return, V);
          }
        }
        break;
      case 3:
        if (qu = null, s = It, It = Du(t.containerInfo), yt(t, e), It = s, gt(e), l & 4 && a !== null && a.memoizedState.isDehydrated)
          try {
            yi(t.containerInfo);
          } catch (V) {
            xe(e, e.return, V);
          }
        Lr && (Lr = !1, nh(e));
        break;
      case 4:
        l = It, It = Du(
          e.stateNode.containerInfo
        ), yt(t, e), gt(e), It = l;
        break;
      case 12:
        yt(t, e), gt(e);
        break;
      case 31:
        yt(t, e), gt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, bu(e, l)));
        break;
      case 13:
        yt(t, e), gt(e), e.child.flags & 8192 && e.memoizedState !== null != (a !== null && a.memoizedState !== null) && (Su = jt()), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, bu(e, l)));
        break;
      case 22:
        s = e.memoizedState !== null;
        var b = a !== null && a.memoizedState !== null, T = _n, D = Fe;
        if (_n = T || s, Fe = D || b, yt(t, e), Fe = D, _n = T, gt(e), l & 8192)
          e: for (t = e.stateNode, t._visibility = s ? t._visibility & -2 : t._visibility | 1, s && (a === null || b || _n || Fe || Ea(e)), a = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (a === null) {
                b = a = t;
                try {
                  if (c = b.stateNode, s)
                    f = c.style, typeof f.setProperty == "function" ? f.setProperty("display", "none", "important") : f.display = "none";
                  else {
                    p = b.stateNode;
                    var H = b.memoizedProps.style, O = H != null && H.hasOwnProperty("display") ? H.display : null;
                    p.style.display = O == null || typeof O == "boolean" ? "" : ("" + O).trim();
                  }
                } catch (V) {
                  xe(b, b.return, V);
                }
              }
            } else if (t.tag === 6) {
              if (a === null) {
                b = t;
                try {
                  b.stateNode.nodeValue = s ? "" : b.memoizedProps;
                } catch (V) {
                  xe(b, b.return, V);
                }
              }
            } else if (t.tag === 18) {
              if (a === null) {
                b = t;
                try {
                  var N = b.stateNode;
                  s ? Yh(N, !0) : Yh(b.stateNode, !1);
                } catch (V) {
                  xe(b, b.return, V);
                }
              }
            } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === e) break e;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === e) break e;
              a === t && (a = null), t = t.return;
            }
            a === t && (a = null), t.sibling.return = t.return, t = t.sibling;
          }
        l & 4 && (l = e.updateQueue, l !== null && (a = l.retryQueue, a !== null && (l.retryQueue = null, bu(e, a))));
        break;
      case 19:
        yt(t, e), gt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, bu(e, l)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        yt(t, e), gt(e);
    }
  }
  function gt(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var a, l = e.return; l !== null; ) {
          if (Xd(l)) {
            a = l;
            break;
          }
          l = l.return;
        }
        if (a == null) throw Error(r(160));
        switch (a.tag) {
          case 27:
            var s = a.stateNode, c = $r(e);
            gu(e, c, s);
            break;
          case 5:
            var f = a.stateNode;
            a.flags & 32 && (Ba(f, ""), a.flags &= -33);
            var p = $r(e);
            gu(e, p, f);
            break;
          case 3:
          case 4:
            var b = a.stateNode.containerInfo, T = $r(e);
            kr(
              e,
              T,
              b
            );
            break;
          default:
            throw Error(r(161));
        }
      } catch (D) {
        xe(e, e.return, D);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function nh(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        nh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function zn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        Fd(e, t.alternate, t), t = t.sibling;
  }
  function Ea(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Yn(4, t, t.return), Ea(t);
          break;
        case 1:
          ln(t, t.return);
          var a = t.stateNode;
          typeof a.componentWillUnmount == "function" && Yd(
            t,
            t.return,
            a
          ), Ea(t);
          break;
        case 27:
          pl(t.stateNode);
        case 26:
        case 5:
          ln(t, t.return), Ea(t);
          break;
        case 22:
          t.memoizedState === null && Ea(t);
          break;
        case 30:
          Ea(t);
          break;
        default:
          Ea(t);
      }
      e = e.sibling;
    }
  }
  function wn(e, t, a) {
    for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var l = t.alternate, s = e, c = t, f = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          wn(
            s,
            c,
            a
          ), ll(4, c);
          break;
        case 1:
          if (wn(
            s,
            c,
            a
          ), l = c, s = l.stateNode, typeof s.componentDidMount == "function")
            try {
              s.componentDidMount();
            } catch (T) {
              xe(l, l.return, T);
            }
          if (l = c, s = l.updateQueue, s !== null) {
            var p = l.stateNode;
            try {
              var b = s.shared.hiddenCallbacks;
              if (b !== null)
                for (s.shared.hiddenCallbacks = null, s = 0; s < b.length; s++)
                  Df(b[s], p);
            } catch (T) {
              xe(l, l.return, T);
            }
          }
          a && f & 64 && Gd(c), ul(c, c.return);
          break;
        case 27:
          Vd(c);
        case 26:
        case 5:
          wn(
            s,
            c,
            a
          ), a && l === null && f & 4 && Kd(c), ul(c, c.return);
          break;
        case 12:
          wn(
            s,
            c,
            a
          );
          break;
        case 31:
          wn(
            s,
            c,
            a
          ), a && f & 4 && Pd(s, c);
          break;
        case 13:
          wn(
            s,
            c,
            a
          ), a && f & 4 && eh(s, c);
          break;
        case 22:
          c.memoizedState === null && wn(
            s,
            c,
            a
          ), ul(c, c.return);
          break;
        case 30:
          break;
        default:
          wn(
            s,
            c,
            a
          );
      }
      t = t.sibling;
    }
  }
  function Gr(e, t) {
    var a = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== a && (e != null && e.refCount++, a != null && Ki(a));
  }
  function Yr(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Ki(e));
  }
  function Wt(e, t, a, l) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        ah(
          e,
          t,
          a,
          l
        ), t = t.sibling;
  }
  function ah(e, t, a, l) {
    var s = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        Wt(
          e,
          t,
          a,
          l
        ), s & 2048 && ll(9, t);
        break;
      case 1:
        Wt(
          e,
          t,
          a,
          l
        );
        break;
      case 3:
        Wt(
          e,
          t,
          a,
          l
        ), s & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Ki(e)));
        break;
      case 12:
        if (s & 2048) {
          Wt(
            e,
            t,
            a,
            l
          ), e = t.stateNode;
          try {
            var c = t.memoizedProps, f = c.id, p = c.onPostCommit;
            typeof p == "function" && p(
              f,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (b) {
            xe(t, t.return, b);
          }
        } else
          Wt(
            e,
            t,
            a,
            l
          );
        break;
      case 31:
        Wt(
          e,
          t,
          a,
          l
        );
        break;
      case 13:
        Wt(
          e,
          t,
          a,
          l
        );
        break;
      case 23:
        break;
      case 22:
        c = t.stateNode, f = t.alternate, t.memoizedState !== null ? c._visibility & 2 ? Wt(
          e,
          t,
          a,
          l
        ) : sl(e, t) : c._visibility & 2 ? Wt(
          e,
          t,
          a,
          l
        ) : (c._visibility |= 2, ui(
          e,
          t,
          a,
          l,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), s & 2048 && Gr(f, t);
        break;
      case 24:
        Wt(
          e,
          t,
          a,
          l
        ), s & 2048 && Yr(t.alternate, t);
        break;
      default:
        Wt(
          e,
          t,
          a,
          l
        );
    }
  }
  function ui(e, t, a, l, s) {
    for (s = s && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var c = e, f = t, p = a, b = l, T = f.flags;
      switch (f.tag) {
        case 0:
        case 11:
        case 15:
          ui(
            c,
            f,
            p,
            b,
            s
          ), ll(8, f);
          break;
        case 23:
          break;
        case 22:
          var D = f.stateNode;
          f.memoizedState !== null ? D._visibility & 2 ? ui(
            c,
            f,
            p,
            b,
            s
          ) : sl(
            c,
            f
          ) : (D._visibility |= 2, ui(
            c,
            f,
            p,
            b,
            s
          )), s && T & 2048 && Gr(
            f.alternate,
            f
          );
          break;
        case 24:
          ui(
            c,
            f,
            p,
            b,
            s
          ), s && T & 2048 && Yr(f.alternate, f);
          break;
        default:
          ui(
            c,
            f,
            p,
            b,
            s
          );
      }
      t = t.sibling;
    }
  }
  function sl(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var a = e, l = t, s = l.flags;
        switch (l.tag) {
          case 22:
            sl(a, l), s & 2048 && Gr(
              l.alternate,
              l
            );
            break;
          case 24:
            sl(a, l), s & 2048 && Yr(l.alternate, l);
            break;
          default:
            sl(a, l);
        }
        t = t.sibling;
      }
  }
  var rl = 8192;
  function si(e, t, a) {
    if (e.subtreeFlags & rl)
      for (e = e.child; e !== null; )
        ih(
          e,
          t,
          a
        ), e = e.sibling;
  }
  function ih(e, t, a) {
    switch (e.tag) {
      case 26:
        si(
          e,
          t,
          a
        ), e.flags & rl && e.memoizedState !== null && _g(
          a,
          It,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        si(
          e,
          t,
          a
        );
        break;
      case 3:
      case 4:
        var l = It;
        It = Du(e.stateNode.containerInfo), si(
          e,
          t,
          a
        ), It = l;
        break;
      case 22:
        e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = rl, rl = 16777216, si(
          e,
          t,
          a
        ), rl = l) : si(
          e,
          t,
          a
        ));
        break;
      default:
        si(
          e,
          t,
          a
        );
    }
  }
  function lh(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function cl(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          nt = l, sh(
            l,
            e
          );
        }
      lh(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        uh(e), e = e.sibling;
  }
  function uh(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        cl(e), e.flags & 2048 && Yn(9, e, e.return);
        break;
      case 3:
        cl(e);
        break;
      case 12:
        cl(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, _u(e)) : cl(e);
        break;
      default:
        cl(e);
    }
  }
  function _u(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          nt = l, sh(
            l,
            e
          );
        }
      lh(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          Yn(8, t, t.return), _u(t);
          break;
        case 22:
          a = t.stateNode, a._visibility & 2 && (a._visibility &= -3, _u(t));
          break;
        default:
          _u(t);
      }
      e = e.sibling;
    }
  }
  function sh(e, t) {
    for (; nt !== null; ) {
      var a = nt;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          Yn(8, a, t);
          break;
        case 23:
        case 22:
          if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
            var l = a.memoizedState.cachePool.pool;
            l != null && l.refCount++;
          }
          break;
        case 24:
          Ki(a.memoizedState.cache);
      }
      if (l = a.child, l !== null) l.return = a, nt = l;
      else
        e: for (a = e; nt !== null; ) {
          l = nt;
          var s = l.sibling, c = l.return;
          if (Id(l), l === a) {
            nt = null;
            break e;
          }
          if (s !== null) {
            s.return = c, nt = s;
            break e;
          }
          nt = c;
        }
    }
  }
  var qy = {
    getCacheForType: function(e) {
      var t = ut(Xe), a = t.data.get(e);
      return a === void 0 && (a = e(), t.data.set(e, a)), a;
    },
    cacheSignal: function() {
      return ut(Xe).controller.signal;
    }
  }, Uy = typeof WeakMap == "function" ? WeakMap : Map, ze = 0, Ne = null, fe = null, he = 0, je = 0, Ct = null, Kn = !1, ri = !1, Kr = !1, jn = 0, ke = 0, Xn = 0, Ta = 0, Xr = 0, Mt = 0, ci = 0, ol = null, bt = null, Vr = !1, Su = 0, rh = 0, zu = 1 / 0, wu = null, Vn = null, Pe = 0, Jn = null, oi = null, xn = 0, Jr = 0, Fr = null, ch = null, fl = 0, Ir = null;
  function Dt() {
    return (ze & 2) !== 0 && he !== 0 ? he & -he : R.T !== null ? ac() : jo();
  }
  function oh() {
    if (Mt === 0)
      if ((he & 536870912) === 0 || ve) {
        var e = Cl;
        Cl <<= 1, (Cl & 3932160) === 0 && (Cl = 262144), Mt = e;
      } else Mt = 536870912;
    return e = Ot.current, e !== null && (e.flags |= 32), Mt;
  }
  function _t(e, t, a) {
    (e === Ne && (je === 2 || je === 9) || e.cancelPendingCommit !== null) && (fi(e, 0), Fn(
      e,
      he,
      Mt,
      !1
    )), Mi(e, a), ((ze & 2) === 0 || e !== Ne) && (e === Ne && ((ze & 2) === 0 && (Ta |= a), ke === 4 && Fn(
      e,
      he,
      Mt,
      !1
    )), un(e));
  }
  function fh(e, t, a) {
    if ((ze & 6) !== 0) throw Error(r(327));
    var l = !a && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Ci(e, t), s = l ? Hy(e, t) : Pr(e, t, !0), c = l;
    do {
      if (s === 0) {
        ri && !l && Fn(e, t, 0, !1);
        break;
      } else {
        if (a = e.current.alternate, c && !Zy(a)) {
          s = Pr(e, t, !1), c = !1;
          continue;
        }
        if (s === 2) {
          if (c = t, e.errorRecoveryDisabledLanes & c)
            var f = 0;
          else
            f = e.pendingLanes & -536870913, f = f !== 0 ? f : f & 536870912 ? 536870912 : 0;
          if (f !== 0) {
            t = f;
            e: {
              var p = e;
              s = ol;
              var b = p.current.memoizedState.isDehydrated;
              if (b && (fi(p, f).flags |= 256), f = Pr(
                p,
                f,
                !1
              ), f !== 2) {
                if (Kr && !b) {
                  p.errorRecoveryDisabledLanes |= c, Ta |= c, s = 4;
                  break e;
                }
                c = bt, bt = s, c !== null && (bt === null ? bt = c : bt.push.apply(
                  bt,
                  c
                ));
              }
              s = f;
            }
            if (c = !1, s !== 2) continue;
          }
        }
        if (s === 1) {
          fi(e, 0), Fn(e, t, 0, !0);
          break;
        }
        e: {
          switch (l = e, c = s, c) {
            case 0:
            case 1:
              throw Error(r(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              Fn(
                l,
                t,
                Mt,
                !Kn
              );
              break e;
            case 2:
              bt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(r(329));
          }
          if ((t & 62914560) === t && (s = Su + 300 - jt(), 10 < s)) {
            if (Fn(
              l,
              t,
              Mt,
              !Kn
            ), Dl(l, 0, !0) !== 0) break e;
            xn = t, l.timeoutHandle = kh(
              dh.bind(
                null,
                l,
                a,
                bt,
                wu,
                Vr,
                t,
                Mt,
                Ta,
                ci,
                Kn,
                c,
                "Throttled",
                -0,
                0
              ),
              s
            );
            break e;
          }
          dh(
            l,
            a,
            bt,
            wu,
            Vr,
            t,
            Mt,
            Ta,
            ci,
            Kn,
            c,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    un(e);
  }
  function dh(e, t, a, l, s, c, f, p, b, T, D, H, O, N) {
    if (e.timeoutHandle = -1, H = t.subtreeFlags, H & 8192 || (H & 16785408) === 16785408) {
      H = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: on
      }, ih(
        t,
        c,
        H
      );
      var V = (c & 62914560) === c ? Su - jt() : (c & 4194048) === c ? rh - jt() : 0;
      if (V = Sg(
        H,
        V
      ), V !== null) {
        xn = c, e.cancelPendingCommit = V(
          _h.bind(
            null,
            e,
            t,
            c,
            a,
            l,
            s,
            f,
            p,
            b,
            D,
            H,
            null,
            O,
            N
          )
        ), Fn(e, c, f, !T);
        return;
      }
    }
    _h(
      e,
      t,
      c,
      a,
      l,
      s,
      f,
      p,
      b
    );
  }
  function Zy(e) {
    for (var t = e; ; ) {
      var a = t.tag;
      if ((a === 0 || a === 11 || a === 15) && t.flags & 16384 && (a = t.updateQueue, a !== null && (a = a.stores, a !== null)))
        for (var l = 0; l < a.length; l++) {
          var s = a[l], c = s.getSnapshot;
          s = s.value;
          try {
            if (!Tt(c(), s)) return !1;
          } catch {
            return !1;
          }
        }
      if (a = t.child, t.subtreeFlags & 16384 && a !== null)
        a.return = t, t = a;
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function Fn(e, t, a, l) {
    t &= ~Xr, t &= ~Ta, e.suspendedLanes |= t, e.pingedLanes &= ~t, l && (e.warmLanes |= t), l = e.expirationTimes;
    for (var s = t; 0 < s; ) {
      var c = 31 - Et(s), f = 1 << c;
      l[c] = -1, s &= ~f;
    }
    a !== 0 && So(e, a, t);
  }
  function ju() {
    return (ze & 6) === 0 ? (dl(0), !1) : !0;
  }
  function Wr() {
    if (fe !== null) {
      if (je === 0)
        var e = fe.return;
      else
        e = fe, mn = ga = null, mr(e), ti = null, Vi = 0, e = fe;
      for (; e !== null; )
        Ld(e.alternate, e), e = e.return;
      fe = null;
    }
  }
  function fi(e, t) {
    var a = e.timeoutHandle;
    a !== -1 && (e.timeoutHandle = -1, ag(a)), a = e.cancelPendingCommit, a !== null && (e.cancelPendingCommit = null, a()), xn = 0, Wr(), Ne = e, fe = a = dn(e.current, null), he = t, je = 0, Ct = null, Kn = !1, ri = Ci(e, t), Kr = !1, ci = Mt = Xr = Ta = Xn = ke = 0, bt = ol = null, Vr = !1, (t & 8) !== 0 && (t |= t & 32);
    var l = e.entangledLanes;
    if (l !== 0)
      for (e = e.entanglements, l &= t; 0 < l; ) {
        var s = 31 - Et(l), c = 1 << s;
        t |= e[s], l &= ~c;
      }
    return jn = t, Yl(), a;
  }
  function hh(e, t) {
    re = null, R.H = nl, t === ei || t === Pl ? (t = Of(), je = 3) : t === nr ? (t = Of(), je = 4) : je = t === Nr ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Ct = t, fe === null && (ke = 1, hu(
      e,
      Qt(t, e.current)
    ));
  }
  function mh() {
    var e = Ot.current;
    return e === null ? !0 : (he & 4194048) === he ? kt === null : (he & 62914560) === he || (he & 536870912) !== 0 ? e === kt : !1;
  }
  function ph() {
    var e = R.H;
    return R.H = nl, e === null ? nl : e;
  }
  function vh() {
    var e = R.A;
    return R.A = qy, e;
  }
  function xu() {
    ke = 4, Kn || (he & 4194048) !== he && Ot.current !== null || (ri = !0), (Xn & 134217727) === 0 && (Ta & 134217727) === 0 || Ne === null || Fn(
      Ne,
      he,
      Mt,
      !1
    );
  }
  function Pr(e, t, a) {
    var l = ze;
    ze |= 2;
    var s = ph(), c = vh();
    (Ne !== e || he !== t) && (wu = null, fi(e, t)), t = !1;
    var f = ke;
    e: do
      try {
        if (je !== 0 && fe !== null) {
          var p = fe, b = Ct;
          switch (je) {
            case 8:
              Wr(), f = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Ot.current === null && (t = !0);
              var T = je;
              if (je = 0, Ct = null, di(e, p, b, T), a && ri) {
                f = 0;
                break e;
              }
              break;
            default:
              T = je, je = 0, Ct = null, di(e, p, b, T);
          }
        }
        Qy(), f = ke;
        break;
      } catch (D) {
        hh(e, D);
      }
    while (!0);
    return t && e.shellSuspendCounter++, mn = ga = null, ze = l, R.H = s, R.A = c, fe === null && (Ne = null, he = 0, Yl()), f;
  }
  function Qy() {
    for (; fe !== null; ) yh(fe);
  }
  function Hy(e, t) {
    var a = ze;
    ze |= 2;
    var l = ph(), s = vh();
    Ne !== e || he !== t ? (wu = null, zu = jt() + 500, fi(e, t)) : ri = Ci(
      e,
      t
    );
    e: do
      try {
        if (je !== 0 && fe !== null) {
          t = fe;
          var c = Ct;
          t: switch (je) {
            case 1:
              je = 0, Ct = null, di(e, t, c, 1);
              break;
            case 2:
            case 9:
              if (Tf(c)) {
                je = 0, Ct = null, gh(t);
                break;
              }
              t = function() {
                je !== 2 && je !== 9 || Ne !== e || (je = 7), un(e);
              }, c.then(t, t);
              break e;
            case 3:
              je = 7;
              break e;
            case 4:
              je = 5;
              break e;
            case 7:
              Tf(c) ? (je = 0, Ct = null, gh(t)) : (je = 0, Ct = null, di(e, t, c, 7));
              break;
            case 5:
              var f = null;
              switch (fe.tag) {
                case 26:
                  f = fe.memoizedState;
                case 5:
                case 27:
                  var p = fe;
                  if (f ? am(f) : p.stateNode.complete) {
                    je = 0, Ct = null;
                    var b = p.sibling;
                    if (b !== null) fe = b;
                    else {
                      var T = p.return;
                      T !== null ? (fe = T, Eu(T)) : fe = null;
                    }
                    break t;
                  }
              }
              je = 0, Ct = null, di(e, t, c, 5);
              break;
            case 6:
              je = 0, Ct = null, di(e, t, c, 6);
              break;
            case 8:
              Wr(), ke = 6;
              break e;
            default:
              throw Error(r(462));
          }
        }
        By();
        break;
      } catch (D) {
        hh(e, D);
      }
    while (!0);
    return mn = ga = null, R.H = l, R.A = s, ze = a, fe !== null ? 0 : (Ne = null, he = 0, Yl(), ke);
  }
  function By() {
    for (; fe !== null && !cv(); )
      yh(fe);
  }
  function yh(e) {
    var t = $d(e.alternate, e, jn);
    e.memoizedProps = e.pendingProps, t === null ? Eu(e) : fe = t;
  }
  function gh(e) {
    var t = e, a = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = qd(
          a,
          t,
          t.pendingProps,
          t.type,
          void 0,
          he
        );
        break;
      case 11:
        t = qd(
          a,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          he
        );
        break;
      case 5:
        mr(t);
      default:
        Ld(a, t), t = fe = vf(t, jn), t = $d(a, t, jn);
    }
    e.memoizedProps = e.pendingProps, t === null ? Eu(e) : fe = t;
  }
  function di(e, t, a, l) {
    mn = ga = null, mr(t), ti = null, Vi = 0;
    var s = t.return;
    try {
      if (Ay(
        e,
        s,
        t,
        a,
        he
      )) {
        ke = 1, hu(
          e,
          Qt(a, e.current)
        ), fe = null;
        return;
      }
    } catch (c) {
      if (s !== null) throw fe = s, c;
      ke = 1, hu(
        e,
        Qt(a, e.current)
      ), fe = null;
      return;
    }
    t.flags & 32768 ? (ve || l === 1 ? e = !0 : ri || (he & 536870912) !== 0 ? e = !1 : (Kn = e = !0, (l === 2 || l === 9 || l === 3 || l === 6) && (l = Ot.current, l !== null && l.tag === 13 && (l.flags |= 16384))), bh(t, e)) : Eu(t);
  }
  function Eu(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        bh(
          t,
          Kn
        );
        return;
      }
      e = t.return;
      var a = Cy(
        t.alternate,
        t,
        jn
      );
      if (a !== null) {
        fe = a;
        return;
      }
      if (t = t.sibling, t !== null) {
        fe = t;
        return;
      }
      fe = t = e;
    } while (t !== null);
    ke === 0 && (ke = 5);
  }
  function bh(e, t) {
    do {
      var a = My(e.alternate, e);
      if (a !== null) {
        a.flags &= 32767, fe = a;
        return;
      }
      if (a = e.return, a !== null && (a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null), !t && (e = e.sibling, e !== null)) {
        fe = e;
        return;
      }
      fe = e = a;
    } while (e !== null);
    ke = 6, fe = null;
  }
  function _h(e, t, a, l, s, c, f, p, b) {
    e.cancelPendingCommit = null;
    do
      Tu();
    while (Pe !== 0);
    if ((ze & 6) !== 0) throw Error(r(327));
    if (t !== null) {
      if (t === e.current) throw Error(r(177));
      if (c = t.lanes | t.childLanes, c |= $s, bv(
        e,
        a,
        c,
        f,
        p,
        b
      ), e === Ne && (fe = Ne = null, he = 0), oi = t, Jn = e, xn = a, Jr = c, Fr = s, ch = l, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Gy(Ol, function() {
        return xh(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), l = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || l) {
        l = R.T, R.T = null, s = Y.p, Y.p = 2, f = ze, ze |= 4;
        try {
          Dy(e, t, a);
        } finally {
          ze = f, Y.p = s, R.T = l;
        }
      }
      Pe = 1, Sh(), zh(), wh();
    }
  }
  function Sh() {
    if (Pe === 1) {
      Pe = 0;
      var e = Jn, t = oi, a = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || a) {
        a = R.T, R.T = null;
        var l = Y.p;
        Y.p = 2;
        var s = ze;
        ze |= 4;
        try {
          th(t, e);
          var c = fc, f = sf(e.containerInfo), p = c.focusedElem, b = c.selectionRange;
          if (f !== p && p && p.ownerDocument && uf(
            p.ownerDocument.documentElement,
            p
          )) {
            if (b !== null && Us(p)) {
              var T = b.start, D = b.end;
              if (D === void 0 && (D = T), "selectionStart" in p)
                p.selectionStart = T, p.selectionEnd = Math.min(
                  D,
                  p.value.length
                );
              else {
                var H = p.ownerDocument || document, O = H && H.defaultView || window;
                if (O.getSelection) {
                  var N = O.getSelection(), V = p.textContent.length, le = Math.min(b.start, V), Ae = b.end === void 0 ? le : Math.min(b.end, V);
                  !N.extend && le > Ae && (f = Ae, Ae = le, le = f);
                  var x = lf(
                    p,
                    le
                  ), z = lf(
                    p,
                    Ae
                  );
                  if (x && z && (N.rangeCount !== 1 || N.anchorNode !== x.node || N.anchorOffset !== x.offset || N.focusNode !== z.node || N.focusOffset !== z.offset)) {
                    var E = H.createRange();
                    E.setStart(x.node, x.offset), N.removeAllRanges(), le > Ae ? (N.addRange(E), N.extend(z.node, z.offset)) : (E.setEnd(z.node, z.offset), N.addRange(E));
                  }
                }
              }
            }
            for (H = [], N = p; N = N.parentNode; )
              N.nodeType === 1 && H.push({
                element: N,
                left: N.scrollLeft,
                top: N.scrollTop
              });
            for (typeof p.focus == "function" && p.focus(), p = 0; p < H.length; p++) {
              var Z = H[p];
              Z.element.scrollLeft = Z.left, Z.element.scrollTop = Z.top;
            }
          }
          Hu = !!oc, fc = oc = null;
        } finally {
          ze = s, Y.p = l, R.T = a;
        }
      }
      e.current = t, Pe = 2;
    }
  }
  function zh() {
    if (Pe === 2) {
      Pe = 0;
      var e = Jn, t = oi, a = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || a) {
        a = R.T, R.T = null;
        var l = Y.p;
        Y.p = 2;
        var s = ze;
        ze |= 4;
        try {
          Fd(e, t.alternate, t);
        } finally {
          ze = s, Y.p = l, R.T = a;
        }
      }
      Pe = 3;
    }
  }
  function wh() {
    if (Pe === 4 || Pe === 3) {
      Pe = 0, ov();
      var e = Jn, t = oi, a = xn, l = ch;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Pe = 5 : (Pe = 0, oi = Jn = null, jh(e, e.pendingLanes));
      var s = e.pendingLanes;
      if (s === 0 && (Vn = null), ys(a), t = t.stateNode, xt && typeof xt.onCommitFiberRoot == "function")
        try {
          xt.onCommitFiberRoot(
            Ni,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (l !== null) {
        t = R.T, s = Y.p, Y.p = 2, R.T = null;
        try {
          for (var c = e.onRecoverableError, f = 0; f < l.length; f++) {
            var p = l[f];
            c(p.value, {
              componentStack: p.stack
            });
          }
        } finally {
          R.T = t, Y.p = s;
        }
      }
      (xn & 3) !== 0 && Tu(), un(e), s = e.pendingLanes, (a & 261930) !== 0 && (s & 42) !== 0 ? e === Ir ? fl++ : (fl = 0, Ir = e) : fl = 0, dl(0);
    }
  }
  function jh(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Ki(t)));
  }
  function Tu() {
    return Sh(), zh(), wh(), xh();
  }
  function xh() {
    if (Pe !== 5) return !1;
    var e = Jn, t = Jr;
    Jr = 0;
    var a = ys(xn), l = R.T, s = Y.p;
    try {
      Y.p = 32 > a ? 32 : a, R.T = null, a = Fr, Fr = null;
      var c = Jn, f = xn;
      if (Pe = 0, oi = Jn = null, xn = 0, (ze & 6) !== 0) throw Error(r(331));
      var p = ze;
      if (ze |= 4, uh(c.current), ah(
        c,
        c.current,
        f,
        a
      ), ze = p, dl(0, !1), xt && typeof xt.onPostCommitFiberRoot == "function")
        try {
          xt.onPostCommitFiberRoot(Ni, c);
        } catch {
        }
      return !0;
    } finally {
      Y.p = s, R.T = l, jh(e, t);
    }
  }
  function Eh(e, t, a) {
    t = Qt(a, t), t = Or(e.stateNode, t, 2), e = kn(e, t, 2), e !== null && (Mi(e, 2), un(e));
  }
  function xe(e, t, a) {
    if (e.tag === 3)
      Eh(e, e, a);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Eh(
            t,
            e,
            a
          );
          break;
        } else if (t.tag === 1) {
          var l = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (Vn === null || !Vn.has(l))) {
            e = Qt(a, e), a = Td(2), l = kn(t, a, 2), l !== null && (Ad(
              a,
              l,
              t,
              e
            ), Mi(l, 2), un(l));
            break;
          }
        }
        t = t.return;
      }
  }
  function ec(e, t, a) {
    var l = e.pingCache;
    if (l === null) {
      l = e.pingCache = new Uy();
      var s = /* @__PURE__ */ new Set();
      l.set(t, s);
    } else
      s = l.get(t), s === void 0 && (s = /* @__PURE__ */ new Set(), l.set(t, s));
    s.has(a) || (Kr = !0, s.add(a), e = $y.bind(null, e, t, a), t.then(e, e));
  }
  function $y(e, t, a) {
    var l = e.pingCache;
    l !== null && l.delete(t), e.pingedLanes |= e.suspendedLanes & a, e.warmLanes &= ~a, Ne === e && (he & a) === a && (ke === 4 || ke === 3 && (he & 62914560) === he && 300 > jt() - Su ? (ze & 2) === 0 && fi(e, 0) : Xr |= a, ci === he && (ci = 0)), un(e);
  }
  function Th(e, t) {
    t === 0 && (t = _o()), e = pa(e, t), e !== null && (Mi(e, t), un(e));
  }
  function ky(e) {
    var t = e.memoizedState, a = 0;
    t !== null && (a = t.retryLane), Th(e, a);
  }
  function Ly(e, t) {
    var a = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var l = e.stateNode, s = e.memoizedState;
        s !== null && (a = s.retryLane);
        break;
      case 19:
        l = e.stateNode;
        break;
      case 22:
        l = e.stateNode._retryCache;
        break;
      default:
        throw Error(r(314));
    }
    l !== null && l.delete(t), Th(e, a);
  }
  function Gy(e, t) {
    return hs(e, t);
  }
  var Au = null, hi = null, tc = !1, Ou = !1, nc = !1, In = 0;
  function un(e) {
    e !== hi && e.next === null && (hi === null ? Au = hi = e : hi = hi.next = e), Ou = !0, tc || (tc = !0, Ky());
  }
  function dl(e, t) {
    if (!nc && Ou) {
      nc = !0;
      do
        for (var a = !1, l = Au; l !== null; ) {
          if (e !== 0) {
            var s = l.pendingLanes;
            if (s === 0) var c = 0;
            else {
              var f = l.suspendedLanes, p = l.pingedLanes;
              c = (1 << 31 - Et(42 | e) + 1) - 1, c &= s & ~(f & ~p), c = c & 201326741 ? c & 201326741 | 1 : c ? c | 2 : 0;
            }
            c !== 0 && (a = !0, Ch(l, c));
          } else
            c = he, c = Dl(
              l,
              l === Ne ? c : 0,
              l.cancelPendingCommit !== null || l.timeoutHandle !== -1
            ), (c & 3) === 0 || Ci(l, c) || (a = !0, Ch(l, c));
          l = l.next;
        }
      while (a);
      nc = !1;
    }
  }
  function Yy() {
    Ah();
  }
  function Ah() {
    Ou = tc = !1;
    var e = 0;
    In !== 0 && ng() && (e = In);
    for (var t = jt(), a = null, l = Au; l !== null; ) {
      var s = l.next, c = Oh(l, t);
      c === 0 ? (l.next = null, a === null ? Au = s : a.next = s, s === null && (hi = a)) : (a = l, (e !== 0 || (c & 3) !== 0) && (Ou = !0)), l = s;
    }
    Pe !== 0 && Pe !== 5 || dl(e), In !== 0 && (In = 0);
  }
  function Oh(e, t) {
    for (var a = e.suspendedLanes, l = e.pingedLanes, s = e.expirationTimes, c = e.pendingLanes & -62914561; 0 < c; ) {
      var f = 31 - Et(c), p = 1 << f, b = s[f];
      b === -1 ? ((p & a) === 0 || (p & l) !== 0) && (s[f] = gv(p, t)) : b <= t && (e.expiredLanes |= p), c &= ~p;
    }
    if (t = Ne, a = he, a = Dl(
      e,
      e === t ? a : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l = e.callbackNode, a === 0 || e === t && (je === 2 || je === 9) || e.cancelPendingCommit !== null)
      return l !== null && l !== null && ms(l), e.callbackNode = null, e.callbackPriority = 0;
    if ((a & 3) === 0 || Ci(e, a)) {
      if (t = a & -a, t === e.callbackPriority) return t;
      switch (l !== null && ms(l), ys(a)) {
        case 2:
        case 8:
          a = go;
          break;
        case 32:
          a = Ol;
          break;
        case 268435456:
          a = bo;
          break;
        default:
          a = Ol;
      }
      return l = Nh.bind(null, e), a = hs(a, l), e.callbackPriority = t, e.callbackNode = a, t;
    }
    return l !== null && l !== null && ms(l), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function Nh(e, t) {
    if (Pe !== 0 && Pe !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var a = e.callbackNode;
    if (Tu() && e.callbackNode !== a)
      return null;
    var l = he;
    return l = Dl(
      e,
      e === Ne ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l === 0 ? null : (fh(e, l, t), Oh(e, jt()), e.callbackNode != null && e.callbackNode === a ? Nh.bind(null, e) : null);
  }
  function Ch(e, t) {
    if (Tu()) return null;
    fh(e, t, !0);
  }
  function Ky() {
    ig(function() {
      (ze & 6) !== 0 ? hs(
        yo,
        Yy
      ) : Ah();
    });
  }
  function ac() {
    if (In === 0) {
      var e = Wa;
      e === 0 && (e = Nl, Nl <<= 1, (Nl & 261888) === 0 && (Nl = 256)), In = e;
    }
    return In;
  }
  function Mh(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Zl("" + e);
  }
  function Dh(e, t) {
    var a = t.ownerDocument.createElement("input");
    return a.name = t.name, a.value = t.value, e.id && a.setAttribute("form", e.id), t.parentNode.insertBefore(a, t), e = new FormData(e), a.parentNode.removeChild(a), e;
  }
  function Xy(e, t, a, l, s) {
    if (t === "submit" && a && a.stateNode === s) {
      var c = Mh(
        (s[mt] || null).action
      ), f = l.submitter;
      f && (t = (t = f[mt] || null) ? Mh(t.formAction) : f.getAttribute("formAction"), t !== null && (c = t, f = null));
      var p = new $l(
        "action",
        "action",
        null,
        l,
        s
      );
      e.push({
        event: p,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (l.defaultPrevented) {
                if (In !== 0) {
                  var b = f ? Dh(s, f) : new FormData(s);
                  wr(
                    a,
                    {
                      pending: !0,
                      data: b,
                      method: s.method,
                      action: c
                    },
                    null,
                    b
                  );
                }
              } else
                typeof c == "function" && (p.preventDefault(), b = f ? Dh(s, f) : new FormData(s), wr(
                  a,
                  {
                    pending: !0,
                    data: b,
                    method: s.method,
                    action: c
                  },
                  c,
                  b
                ));
            },
            currentTarget: s
          }
        ]
      });
    }
  }
  for (var ic = 0; ic < Bs.length; ic++) {
    var lc = Bs[ic], Vy = lc.toLowerCase(), Jy = lc[0].toUpperCase() + lc.slice(1);
    Ft(
      Vy,
      "on" + Jy
    );
  }
  Ft(of, "onAnimationEnd"), Ft(ff, "onAnimationIteration"), Ft(df, "onAnimationStart"), Ft("dblclick", "onDoubleClick"), Ft("focusin", "onFocus"), Ft("focusout", "onBlur"), Ft(fy, "onTransitionRun"), Ft(dy, "onTransitionStart"), Ft(hy, "onTransitionCancel"), Ft(hf, "onTransitionEnd"), Qa("onMouseEnter", ["mouseout", "mouseover"]), Qa("onMouseLeave", ["mouseout", "mouseover"]), Qa("onPointerEnter", ["pointerout", "pointerover"]), Qa("onPointerLeave", ["pointerout", "pointerover"]), fa(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), fa(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), fa("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), fa(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), fa(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), fa(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var hl = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), Fy = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(hl)
  );
  function Rh(e, t) {
    t = (t & 4) !== 0;
    for (var a = 0; a < e.length; a++) {
      var l = e[a], s = l.event;
      l = l.listeners;
      e: {
        var c = void 0;
        if (t)
          for (var f = l.length - 1; 0 <= f; f--) {
            var p = l[f], b = p.instance, T = p.currentTarget;
            if (p = p.listener, b !== c && s.isPropagationStopped())
              break e;
            c = p, s.currentTarget = T;
            try {
              c(s);
            } catch (D) {
              Gl(D);
            }
            s.currentTarget = null, c = b;
          }
        else
          for (f = 0; f < l.length; f++) {
            if (p = l[f], b = p.instance, T = p.currentTarget, p = p.listener, b !== c && s.isPropagationStopped())
              break e;
            c = p, s.currentTarget = T;
            try {
              c(s);
            } catch (D) {
              Gl(D);
            }
            s.currentTarget = null, c = b;
          }
      }
    }
  }
  function de(e, t) {
    var a = t[gs];
    a === void 0 && (a = t[gs] = /* @__PURE__ */ new Set());
    var l = e + "__bubble";
    a.has(l) || (qh(t, e, 2, !1), a.add(l));
  }
  function uc(e, t, a) {
    var l = 0;
    t && (l |= 4), qh(
      a,
      e,
      l,
      t
    );
  }
  var Nu = "_reactListening" + Math.random().toString(36).slice(2);
  function sc(e) {
    if (!e[Nu]) {
      e[Nu] = !0, To.forEach(function(a) {
        a !== "selectionchange" && (Fy.has(a) || uc(a, !1, e), uc(a, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Nu] || (t[Nu] = !0, uc("selectionchange", !1, t));
    }
  }
  function qh(e, t, a, l) {
    switch (om(t)) {
      case 2:
        var s = jg;
        break;
      case 8:
        s = xg;
        break;
      default:
        s = zc;
    }
    a = s.bind(
      null,
      t,
      a,
      e
    ), s = void 0, !Ts || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (s = !0), l ? s !== void 0 ? e.addEventListener(t, a, {
      capture: !0,
      passive: s
    }) : e.addEventListener(t, a, !0) : s !== void 0 ? e.addEventListener(t, a, {
      passive: s
    }) : e.addEventListener(t, a, !1);
  }
  function rc(e, t, a, l, s) {
    var c = l;
    if ((t & 1) === 0 && (t & 2) === 0 && l !== null)
      e: for (; ; ) {
        if (l === null) return;
        var f = l.tag;
        if (f === 3 || f === 4) {
          var p = l.stateNode.containerInfo;
          if (p === s) break;
          if (f === 4)
            for (f = l.return; f !== null; ) {
              var b = f.tag;
              if ((b === 3 || b === 4) && f.stateNode.containerInfo === s)
                return;
              f = f.return;
            }
          for (; p !== null; ) {
            if (f = qa(p), f === null) return;
            if (b = f.tag, b === 5 || b === 6 || b === 26 || b === 27) {
              l = c = f;
              continue e;
            }
            p = p.parentNode;
          }
        }
        l = l.return;
      }
    Ho(function() {
      var T = c, D = xs(a), H = [];
      e: {
        var O = mf.get(e);
        if (O !== void 0) {
          var N = $l, V = e;
          switch (e) {
            case "keypress":
              if (Hl(a) === 0) break e;
            case "keydown":
            case "keyup":
              N = Lv;
              break;
            case "focusin":
              V = "focus", N = Cs;
              break;
            case "focusout":
              V = "blur", N = Cs;
              break;
            case "beforeblur":
            case "afterblur":
              N = Cs;
              break;
            case "click":
              if (a.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              N = ko;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              N = Cv;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              N = Kv;
              break;
            case of:
            case ff:
            case df:
              N = Rv;
              break;
            case hf:
              N = Vv;
              break;
            case "scroll":
            case "scrollend":
              N = Ov;
              break;
            case "wheel":
              N = Fv;
              break;
            case "copy":
            case "cut":
            case "paste":
              N = Uv;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              N = Go;
              break;
            case "toggle":
            case "beforetoggle":
              N = Wv;
          }
          var le = (t & 4) !== 0, Ae = !le && (e === "scroll" || e === "scrollend"), x = le ? O !== null ? O + "Capture" : null : O;
          le = [];
          for (var z = T, E; z !== null; ) {
            var Z = z;
            if (E = Z.stateNode, Z = Z.tag, Z !== 5 && Z !== 26 && Z !== 27 || E === null || x === null || (Z = qi(z, x), Z != null && le.push(
              ml(z, Z, E)
            )), Ae) break;
            z = z.return;
          }
          0 < le.length && (O = new N(
            O,
            V,
            null,
            a,
            D
          ), H.push({ event: O, listeners: le }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (O = e === "mouseover" || e === "pointerover", N = e === "mouseout" || e === "pointerout", O && a !== js && (V = a.relatedTarget || a.fromElement) && (qa(V) || V[Ra]))
            break e;
          if ((N || O) && (O = D.window === D ? D : (O = D.ownerDocument) ? O.defaultView || O.parentWindow : window, N ? (V = a.relatedTarget || a.toElement, N = T, V = V ? qa(V) : null, V !== null && (Ae = h(V), le = V.tag, V !== Ae || le !== 5 && le !== 27 && le !== 6) && (V = null)) : (N = null, V = T), N !== V)) {
            if (le = ko, Z = "onMouseLeave", x = "onMouseEnter", z = "mouse", (e === "pointerout" || e === "pointerover") && (le = Go, Z = "onPointerLeave", x = "onPointerEnter", z = "pointer"), Ae = N == null ? O : Ri(N), E = V == null ? O : Ri(V), O = new le(
              Z,
              z + "leave",
              N,
              a,
              D
            ), O.target = Ae, O.relatedTarget = E, Z = null, qa(D) === T && (le = new le(
              x,
              z + "enter",
              V,
              a,
              D
            ), le.target = E, le.relatedTarget = Ae, Z = le), Ae = Z, N && V)
              t: {
                for (le = Iy, x = N, z = V, E = 0, Z = x; Z; Z = le(Z))
                  E++;
                Z = 0;
                for (var ne = z; ne; ne = le(ne))
                  Z++;
                for (; 0 < E - Z; )
                  x = le(x), E--;
                for (; 0 < Z - E; )
                  z = le(z), Z--;
                for (; E--; ) {
                  if (x === z || z !== null && x === z.alternate) {
                    le = x;
                    break t;
                  }
                  x = le(x), z = le(z);
                }
                le = null;
              }
            else le = null;
            N !== null && Uh(
              H,
              O,
              N,
              le,
              !1
            ), V !== null && Ae !== null && Uh(
              H,
              Ae,
              V,
              le,
              !0
            );
          }
        }
        e: {
          if (O = T ? Ri(T) : window, N = O.nodeName && O.nodeName.toLowerCase(), N === "select" || N === "input" && O.type === "file")
            var be = Wo;
          else if (Fo(O))
            if (Po)
              be = ry;
            else {
              be = uy;
              var W = ly;
            }
          else
            N = O.nodeName, !N || N.toLowerCase() !== "input" || O.type !== "checkbox" && O.type !== "radio" ? T && ws(T.elementType) && (be = Wo) : be = sy;
          if (be && (be = be(e, T))) {
            Io(
              H,
              be,
              a,
              D
            );
            break e;
          }
          W && W(e, O, T), e === "focusout" && T && O.type === "number" && T.memoizedProps.value != null && zs(O, "number", O.value);
        }
        switch (W = T ? Ri(T) : window, e) {
          case "focusin":
            (Fo(W) || W.contentEditable === "true") && (Ga = W, Zs = T, Li = null);
            break;
          case "focusout":
            Li = Zs = Ga = null;
            break;
          case "mousedown":
            Qs = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Qs = !1, rf(H, a, D);
            break;
          case "selectionchange":
            if (oy) break;
          case "keydown":
          case "keyup":
            rf(H, a, D);
        }
        var ce;
        if (Ds)
          e: {
            switch (e) {
              case "compositionstart":
                var me = "onCompositionStart";
                break e;
              case "compositionend":
                me = "onCompositionEnd";
                break e;
              case "compositionupdate":
                me = "onCompositionUpdate";
                break e;
            }
            me = void 0;
          }
        else
          La ? Vo(e, a) && (me = "onCompositionEnd") : e === "keydown" && a.keyCode === 229 && (me = "onCompositionStart");
        me && (Yo && a.locale !== "ko" && (La || me !== "onCompositionStart" ? me === "onCompositionEnd" && La && (ce = Bo()) : (qn = D, As = "value" in qn ? qn.value : qn.textContent, La = !0)), W = Cu(T, me), 0 < W.length && (me = new Lo(
          me,
          e,
          null,
          a,
          D
        ), H.push({ event: me, listeners: W }), ce ? me.data = ce : (ce = Jo(a), ce !== null && (me.data = ce)))), (ce = ey ? ty(e, a) : ny(e, a)) && (me = Cu(T, "onBeforeInput"), 0 < me.length && (W = new Lo(
          "onBeforeInput",
          "beforeinput",
          null,
          a,
          D
        ), H.push({
          event: W,
          listeners: me
        }), W.data = ce)), Xy(
          H,
          e,
          T,
          a,
          D
        );
      }
      Rh(H, t);
    });
  }
  function ml(e, t, a) {
    return {
      instance: e,
      listener: t,
      currentTarget: a
    };
  }
  function Cu(e, t) {
    for (var a = t + "Capture", l = []; e !== null; ) {
      var s = e, c = s.stateNode;
      if (s = s.tag, s !== 5 && s !== 26 && s !== 27 || c === null || (s = qi(e, a), s != null && l.unshift(
        ml(e, s, c)
      ), s = qi(e, t), s != null && l.push(
        ml(e, s, c)
      )), e.tag === 3) return l;
      e = e.return;
    }
    return [];
  }
  function Iy(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function Uh(e, t, a, l, s) {
    for (var c = t._reactName, f = []; a !== null && a !== l; ) {
      var p = a, b = p.alternate, T = p.stateNode;
      if (p = p.tag, b !== null && b === l) break;
      p !== 5 && p !== 26 && p !== 27 || T === null || (b = T, s ? (T = qi(a, c), T != null && f.unshift(
        ml(a, T, b)
      )) : s || (T = qi(a, c), T != null && f.push(
        ml(a, T, b)
      ))), a = a.return;
    }
    f.length !== 0 && e.push({ event: t, listeners: f });
  }
  var Wy = /\r\n?/g, Py = /\u0000|\uFFFD/g;
  function Zh(e) {
    return (typeof e == "string" ? e : "" + e).replace(Wy, `
`).replace(Py, "");
  }
  function Qh(e, t) {
    return t = Zh(t), Zh(e) === t;
  }
  function Te(e, t, a, l, s, c) {
    switch (a) {
      case "children":
        typeof l == "string" ? t === "body" || t === "textarea" && l === "" || Ba(e, l) : (typeof l == "number" || typeof l == "bigint") && t !== "body" && Ba(e, "" + l);
        break;
      case "className":
        ql(e, "class", l);
        break;
      case "tabIndex":
        ql(e, "tabindex", l);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        ql(e, a, l);
        break;
      case "style":
        Zo(e, l, c);
        break;
      case "data":
        if (t !== "object") {
          ql(e, "data", l);
          break;
        }
      case "src":
      case "href":
        if (l === "" && (t !== "a" || a !== "href")) {
          e.removeAttribute(a);
          break;
        }
        if (l == null || typeof l == "function" || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(a);
          break;
        }
        l = Zl("" + l), e.setAttribute(a, l);
        break;
      case "action":
      case "formAction":
        if (typeof l == "function") {
          e.setAttribute(
            a,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof c == "function" && (a === "formAction" ? (t !== "input" && Te(e, t, "name", s.name, s, null), Te(
            e,
            t,
            "formEncType",
            s.formEncType,
            s,
            null
          ), Te(
            e,
            t,
            "formMethod",
            s.formMethod,
            s,
            null
          ), Te(
            e,
            t,
            "formTarget",
            s.formTarget,
            s,
            null
          )) : (Te(e, t, "encType", s.encType, s, null), Te(e, t, "method", s.method, s, null), Te(e, t, "target", s.target, s, null)));
        if (l == null || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(a);
          break;
        }
        l = Zl("" + l), e.setAttribute(a, l);
        break;
      case "onClick":
        l != null && (e.onclick = on);
        break;
      case "onScroll":
        l != null && de("scroll", e);
        break;
      case "onScrollEnd":
        l != null && de("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l))
            throw Error(r(61));
          if (a = l.__html, a != null) {
            if (s.children != null) throw Error(r(60));
            e.innerHTML = a;
          }
        }
        break;
      case "multiple":
        e.multiple = l && typeof l != "function" && typeof l != "symbol";
        break;
      case "muted":
        e.muted = l && typeof l != "function" && typeof l != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (l == null || typeof l == "function" || typeof l == "boolean" || typeof l == "symbol") {
          e.removeAttribute("xlink:href");
          break;
        }
        a = Zl("" + l), e.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          a
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(a, "" + l) : e.removeAttribute(a);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        l && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(a, "") : e.removeAttribute(a);
        break;
      case "capture":
      case "download":
        l === !0 ? e.setAttribute(a, "") : l !== !1 && l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(a, l) : e.removeAttribute(a);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        l != null && typeof l != "function" && typeof l != "symbol" && !isNaN(l) && 1 <= l ? e.setAttribute(a, l) : e.removeAttribute(a);
        break;
      case "rowSpan":
      case "start":
        l == null || typeof l == "function" || typeof l == "symbol" || isNaN(l) ? e.removeAttribute(a) : e.setAttribute(a, l);
        break;
      case "popover":
        de("beforetoggle", e), de("toggle", e), Rl(e, "popover", l);
        break;
      case "xlinkActuate":
        cn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          l
        );
        break;
      case "xlinkArcrole":
        cn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          l
        );
        break;
      case "xlinkRole":
        cn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          l
        );
        break;
      case "xlinkShow":
        cn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          l
        );
        break;
      case "xlinkTitle":
        cn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          l
        );
        break;
      case "xlinkType":
        cn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          l
        );
        break;
      case "xmlBase":
        cn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          l
        );
        break;
      case "xmlLang":
        cn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          l
        );
        break;
      case "xmlSpace":
        cn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          l
        );
        break;
      case "is":
        Rl(e, "is", l);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") && (a = Tv.get(a) || a, Rl(e, a, l));
    }
  }
  function cc(e, t, a, l, s, c) {
    switch (a) {
      case "style":
        Zo(e, l, c);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l))
            throw Error(r(61));
          if (a = l.__html, a != null) {
            if (s.children != null) throw Error(r(60));
            e.innerHTML = a;
          }
        }
        break;
      case "children":
        typeof l == "string" ? Ba(e, l) : (typeof l == "number" || typeof l == "bigint") && Ba(e, "" + l);
        break;
      case "onScroll":
        l != null && de("scroll", e);
        break;
      case "onScrollEnd":
        l != null && de("scrollend", e);
        break;
      case "onClick":
        l != null && (e.onclick = on);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Ao.hasOwnProperty(a))
          e: {
            if (a[0] === "o" && a[1] === "n" && (s = a.endsWith("Capture"), t = a.slice(2, s ? a.length - 7 : void 0), c = e[mt] || null, c = c != null ? c[a] : null, typeof c == "function" && e.removeEventListener(t, c, s), typeof l == "function")) {
              typeof c != "function" && c !== null && (a in e ? e[a] = null : e.hasAttribute(a) && e.removeAttribute(a)), e.addEventListener(t, l, s);
              break e;
            }
            a in e ? e[a] = l : l === !0 ? e.setAttribute(a, "") : Rl(e, a, l);
          }
    }
  }
  function rt(e, t, a) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        de("error", e), de("load", e);
        var l = !1, s = !1, c;
        for (c in a)
          if (a.hasOwnProperty(c)) {
            var f = a[c];
            if (f != null)
              switch (c) {
                case "src":
                  l = !0;
                  break;
                case "srcSet":
                  s = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(r(137, t));
                default:
                  Te(e, t, c, f, a, null);
              }
          }
        s && Te(e, t, "srcSet", a.srcSet, a, null), l && Te(e, t, "src", a.src, a, null);
        return;
      case "input":
        de("invalid", e);
        var p = c = f = s = null, b = null, T = null;
        for (l in a)
          if (a.hasOwnProperty(l)) {
            var D = a[l];
            if (D != null)
              switch (l) {
                case "name":
                  s = D;
                  break;
                case "type":
                  f = D;
                  break;
                case "checked":
                  b = D;
                  break;
                case "defaultChecked":
                  T = D;
                  break;
                case "value":
                  c = D;
                  break;
                case "defaultValue":
                  p = D;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (D != null)
                    throw Error(r(137, t));
                  break;
                default:
                  Te(e, t, l, D, a, null);
              }
          }
        Do(
          e,
          c,
          p,
          b,
          T,
          f,
          s,
          !1
        );
        return;
      case "select":
        de("invalid", e), l = f = c = null;
        for (s in a)
          if (a.hasOwnProperty(s) && (p = a[s], p != null))
            switch (s) {
              case "value":
                c = p;
                break;
              case "defaultValue":
                f = p;
                break;
              case "multiple":
                l = p;
              default:
                Te(e, t, s, p, a, null);
            }
        t = c, a = f, e.multiple = !!l, t != null ? Ha(e, !!l, t, !1) : a != null && Ha(e, !!l, a, !0);
        return;
      case "textarea":
        de("invalid", e), c = s = l = null;
        for (f in a)
          if (a.hasOwnProperty(f) && (p = a[f], p != null))
            switch (f) {
              case "value":
                l = p;
                break;
              case "defaultValue":
                s = p;
                break;
              case "children":
                c = p;
                break;
              case "dangerouslySetInnerHTML":
                if (p != null) throw Error(r(91));
                break;
              default:
                Te(e, t, f, p, a, null);
            }
        qo(e, l, s, c);
        return;
      case "option":
        for (b in a)
          if (a.hasOwnProperty(b) && (l = a[b], l != null))
            switch (b) {
              case "selected":
                e.selected = l && typeof l != "function" && typeof l != "symbol";
                break;
              default:
                Te(e, t, b, l, a, null);
            }
        return;
      case "dialog":
        de("beforetoggle", e), de("toggle", e), de("cancel", e), de("close", e);
        break;
      case "iframe":
      case "object":
        de("load", e);
        break;
      case "video":
      case "audio":
        for (l = 0; l < hl.length; l++)
          de(hl[l], e);
        break;
      case "image":
        de("error", e), de("load", e);
        break;
      case "details":
        de("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        de("error", e), de("load", e);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (T in a)
          if (a.hasOwnProperty(T) && (l = a[T], l != null))
            switch (T) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(r(137, t));
              default:
                Te(e, t, T, l, a, null);
            }
        return;
      default:
        if (ws(t)) {
          for (D in a)
            a.hasOwnProperty(D) && (l = a[D], l !== void 0 && cc(
              e,
              t,
              D,
              l,
              a,
              void 0
            ));
          return;
        }
    }
    for (p in a)
      a.hasOwnProperty(p) && (l = a[p], l != null && Te(e, t, p, l, a, null));
  }
  function eg(e, t, a, l) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var s = null, c = null, f = null, p = null, b = null, T = null, D = null;
        for (N in a) {
          var H = a[N];
          if (a.hasOwnProperty(N) && H != null)
            switch (N) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                b = H;
              default:
                l.hasOwnProperty(N) || Te(e, t, N, null, l, H);
            }
        }
        for (var O in l) {
          var N = l[O];
          if (H = a[O], l.hasOwnProperty(O) && (N != null || H != null))
            switch (O) {
              case "type":
                c = N;
                break;
              case "name":
                s = N;
                break;
              case "checked":
                T = N;
                break;
              case "defaultChecked":
                D = N;
                break;
              case "value":
                f = N;
                break;
              case "defaultValue":
                p = N;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (N != null)
                  throw Error(r(137, t));
                break;
              default:
                N !== H && Te(
                  e,
                  t,
                  O,
                  N,
                  l,
                  H
                );
            }
        }
        Ss(
          e,
          f,
          p,
          b,
          T,
          D,
          c,
          s
        );
        return;
      case "select":
        N = f = p = O = null;
        for (c in a)
          if (b = a[c], a.hasOwnProperty(c) && b != null)
            switch (c) {
              case "value":
                break;
              case "multiple":
                N = b;
              default:
                l.hasOwnProperty(c) || Te(
                  e,
                  t,
                  c,
                  null,
                  l,
                  b
                );
            }
        for (s in l)
          if (c = l[s], b = a[s], l.hasOwnProperty(s) && (c != null || b != null))
            switch (s) {
              case "value":
                O = c;
                break;
              case "defaultValue":
                p = c;
                break;
              case "multiple":
                f = c;
              default:
                c !== b && Te(
                  e,
                  t,
                  s,
                  c,
                  l,
                  b
                );
            }
        t = p, a = f, l = N, O != null ? Ha(e, !!a, O, !1) : !!l != !!a && (t != null ? Ha(e, !!a, t, !0) : Ha(e, !!a, a ? [] : "", !1));
        return;
      case "textarea":
        N = O = null;
        for (p in a)
          if (s = a[p], a.hasOwnProperty(p) && s != null && !l.hasOwnProperty(p))
            switch (p) {
              case "value":
                break;
              case "children":
                break;
              default:
                Te(e, t, p, null, l, s);
            }
        for (f in l)
          if (s = l[f], c = a[f], l.hasOwnProperty(f) && (s != null || c != null))
            switch (f) {
              case "value":
                O = s;
                break;
              case "defaultValue":
                N = s;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (s != null) throw Error(r(91));
                break;
              default:
                s !== c && Te(e, t, f, s, l, c);
            }
        Ro(e, O, N);
        return;
      case "option":
        for (var V in a)
          if (O = a[V], a.hasOwnProperty(V) && O != null && !l.hasOwnProperty(V))
            switch (V) {
              case "selected":
                e.selected = !1;
                break;
              default:
                Te(
                  e,
                  t,
                  V,
                  null,
                  l,
                  O
                );
            }
        for (b in l)
          if (O = l[b], N = a[b], l.hasOwnProperty(b) && O !== N && (O != null || N != null))
            switch (b) {
              case "selected":
                e.selected = O && typeof O != "function" && typeof O != "symbol";
                break;
              default:
                Te(
                  e,
                  t,
                  b,
                  O,
                  l,
                  N
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var le in a)
          O = a[le], a.hasOwnProperty(le) && O != null && !l.hasOwnProperty(le) && Te(e, t, le, null, l, O);
        for (T in l)
          if (O = l[T], N = a[T], l.hasOwnProperty(T) && O !== N && (O != null || N != null))
            switch (T) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (O != null)
                  throw Error(r(137, t));
                break;
              default:
                Te(
                  e,
                  t,
                  T,
                  O,
                  l,
                  N
                );
            }
        return;
      default:
        if (ws(t)) {
          for (var Ae in a)
            O = a[Ae], a.hasOwnProperty(Ae) && O !== void 0 && !l.hasOwnProperty(Ae) && cc(
              e,
              t,
              Ae,
              void 0,
              l,
              O
            );
          for (D in l)
            O = l[D], N = a[D], !l.hasOwnProperty(D) || O === N || O === void 0 && N === void 0 || cc(
              e,
              t,
              D,
              O,
              l,
              N
            );
          return;
        }
    }
    for (var x in a)
      O = a[x], a.hasOwnProperty(x) && O != null && !l.hasOwnProperty(x) && Te(e, t, x, null, l, O);
    for (H in l)
      O = l[H], N = a[H], !l.hasOwnProperty(H) || O === N || O == null && N == null || Te(e, t, H, O, l, N);
  }
  function Hh(e) {
    switch (e) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function tg() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, a = performance.getEntriesByType("resource"), l = 0; l < a.length; l++) {
        var s = a[l], c = s.transferSize, f = s.initiatorType, p = s.duration;
        if (c && p && Hh(f)) {
          for (f = 0, p = s.responseEnd, l += 1; l < a.length; l++) {
            var b = a[l], T = b.startTime;
            if (T > p) break;
            var D = b.transferSize, H = b.initiatorType;
            D && Hh(H) && (b = b.responseEnd, f += D * (b < p ? 1 : (p - T) / (b - T)));
          }
          if (--l, t += 8 * (c + f) / (s.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var oc = null, fc = null;
  function Mu(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Bh(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function $h(e, t) {
    if (e === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return e === 1 && t === "foreignObject" ? 0 : e;
  }
  function dc(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var hc = null;
  function ng() {
    var e = window.event;
    return e && e.type === "popstate" ? e === hc ? !1 : (hc = e, !0) : (hc = null, !1);
  }
  var kh = typeof setTimeout == "function" ? setTimeout : void 0, ag = typeof clearTimeout == "function" ? clearTimeout : void 0, Lh = typeof Promise == "function" ? Promise : void 0, ig = typeof queueMicrotask == "function" ? queueMicrotask : typeof Lh < "u" ? function(e) {
    return Lh.resolve(null).then(e).catch(lg);
  } : kh;
  function lg(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function Wn(e) {
    return e === "head";
  }
  function Gh(e, t) {
    var a = t, l = 0;
    do {
      var s = a.nextSibling;
      if (e.removeChild(a), s && s.nodeType === 8)
        if (a = s.data, a === "/$" || a === "/&") {
          if (l === 0) {
            e.removeChild(s), yi(t);
            return;
          }
          l--;
        } else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&")
          l++;
        else if (a === "html")
          pl(e.ownerDocument.documentElement);
        else if (a === "head") {
          a = e.ownerDocument.head, pl(a);
          for (var c = a.firstChild; c; ) {
            var f = c.nextSibling, p = c.nodeName;
            c[Di] || p === "SCRIPT" || p === "STYLE" || p === "LINK" && c.rel.toLowerCase() === "stylesheet" || a.removeChild(c), c = f;
          }
        } else
          a === "body" && pl(e.ownerDocument.body);
      a = s;
    } while (a);
    yi(t);
  }
  function Yh(e, t) {
    var a = e;
    e = 0;
    do {
      var l = a.nextSibling;
      if (a.nodeType === 1 ? t ? (a._stashedDisplay = a.style.display, a.style.display = "none") : (a.style.display = a._stashedDisplay || "", a.getAttribute("style") === "" && a.removeAttribute("style")) : a.nodeType === 3 && (t ? (a._stashedText = a.nodeValue, a.nodeValue = "") : a.nodeValue = a._stashedText || ""), l && l.nodeType === 8)
        if (a = l.data, a === "/$") {
          if (e === 0) break;
          e--;
        } else
          a !== "$" && a !== "$?" && a !== "$~" && a !== "$!" || e++;
      a = l;
    } while (a);
  }
  function mc(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var a = t;
      switch (t = t.nextSibling, a.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          mc(a), bs(a);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (a.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(a);
    }
  }
  function ug(e, t, a, l) {
    for (; e.nodeType === 1; ) {
      var s = a;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (l) {
        if (!e[Di])
          switch (t) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (c = e.getAttribute("rel"), c === "stylesheet" && e.hasAttribute("data-precedence"))
                break;
              if (c !== s.rel || e.getAttribute("href") !== (s.href == null || s.href === "" ? null : s.href) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin) || e.getAttribute("title") !== (s.title == null ? null : s.title))
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (c = e.getAttribute("src"), (c !== (s.src == null ? null : s.src) || e.getAttribute("type") !== (s.type == null ? null : s.type) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin)) && c && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                break;
              return e;
            default:
              return e;
          }
      } else if (t === "input" && e.type === "hidden") {
        var c = s.name == null ? null : "" + s.name;
        if (s.type === "hidden" && e.getAttribute("name") === c)
          return e;
      } else return e;
      if (e = Lt(e.nextSibling), e === null) break;
    }
    return null;
  }
  function sg(e, t, a) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !a || (e = Lt(e.nextSibling), e === null)) return null;
    return e;
  }
  function Kh(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Lt(e.nextSibling), e === null)) return null;
    return e;
  }
  function pc(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function vc(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function rg(e, t) {
    var a = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = t;
    else if (e.data !== "$?" || a.readyState !== "loading")
      t();
    else {
      var l = function() {
        t(), a.removeEventListener("DOMContentLoaded", l);
      };
      a.addEventListener("DOMContentLoaded", l), e._reactRetry = l;
    }
  }
  function Lt(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
          break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return e;
  }
  var yc = null;
  function Xh(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var a = e.data;
        if (a === "/$" || a === "/&") {
          if (t === 0)
            return Lt(e.nextSibling);
          t--;
        } else
          a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function Vh(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var a = e.data;
        if (a === "$" || a === "$!" || a === "$?" || a === "$~" || a === "&") {
          if (t === 0) return e;
          t--;
        } else a !== "/$" && a !== "/&" || t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function Jh(e, t, a) {
    switch (t = Mu(a), e) {
      case "html":
        if (e = t.documentElement, !e) throw Error(r(452));
        return e;
      case "head":
        if (e = t.head, !e) throw Error(r(453));
        return e;
      case "body":
        if (e = t.body, !e) throw Error(r(454));
        return e;
      default:
        throw Error(r(451));
    }
  }
  function pl(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    bs(e);
  }
  var Gt = /* @__PURE__ */ new Map(), Fh = /* @__PURE__ */ new Set();
  function Du(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var En = Y.d;
  Y.d = {
    f: cg,
    r: og,
    D: fg,
    C: dg,
    L: hg,
    m: mg,
    X: vg,
    S: pg,
    M: yg
  };
  function cg() {
    var e = En.f(), t = ju();
    return e || t;
  }
  function og(e) {
    var t = Ua(e);
    t !== null && t.tag === 5 && t.type === "form" ? hd(t) : En.r(e);
  }
  var mi = typeof document > "u" ? null : document;
  function Ih(e, t, a) {
    var l = mi;
    if (l && typeof t == "string" && t) {
      var s = Ut(t);
      s = 'link[rel="' + e + '"][href="' + s + '"]', typeof a == "string" && (s += '[crossorigin="' + a + '"]'), Fh.has(s) || (Fh.add(s), e = { rel: e, crossOrigin: a, href: t }, l.querySelector(s) === null && (t = l.createElement("link"), rt(t, "link", e), tt(t), l.head.appendChild(t)));
    }
  }
  function fg(e) {
    En.D(e), Ih("dns-prefetch", e, null);
  }
  function dg(e, t) {
    En.C(e, t), Ih("preconnect", e, t);
  }
  function hg(e, t, a) {
    En.L(e, t, a);
    var l = mi;
    if (l && e && t) {
      var s = 'link[rel="preload"][as="' + Ut(t) + '"]';
      t === "image" && a && a.imageSrcSet ? (s += '[imagesrcset="' + Ut(
        a.imageSrcSet
      ) + '"]', typeof a.imageSizes == "string" && (s += '[imagesizes="' + Ut(
        a.imageSizes
      ) + '"]')) : s += '[href="' + Ut(e) + '"]';
      var c = s;
      switch (t) {
        case "style":
          c = pi(e);
          break;
        case "script":
          c = vi(e);
      }
      Gt.has(c) || (e = j(
        {
          rel: "preload",
          href: t === "image" && a && a.imageSrcSet ? void 0 : e,
          as: t
        },
        a
      ), Gt.set(c, e), l.querySelector(s) !== null || t === "style" && l.querySelector(vl(c)) || t === "script" && l.querySelector(yl(c)) || (t = l.createElement("link"), rt(t, "link", e), tt(t), l.head.appendChild(t)));
    }
  }
  function mg(e, t) {
    En.m(e, t);
    var a = mi;
    if (a && e) {
      var l = t && typeof t.as == "string" ? t.as : "script", s = 'link[rel="modulepreload"][as="' + Ut(l) + '"][href="' + Ut(e) + '"]', c = s;
      switch (l) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          c = vi(e);
      }
      if (!Gt.has(c) && (e = j({ rel: "modulepreload", href: e }, t), Gt.set(c, e), a.querySelector(s) === null)) {
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (a.querySelector(yl(c)))
              return;
        }
        l = a.createElement("link"), rt(l, "link", e), tt(l), a.head.appendChild(l);
      }
    }
  }
  function pg(e, t, a) {
    En.S(e, t, a);
    var l = mi;
    if (l && e) {
      var s = Za(l).hoistableStyles, c = pi(e);
      t = t || "default";
      var f = s.get(c);
      if (!f) {
        var p = { loading: 0, preload: null };
        if (f = l.querySelector(
          vl(c)
        ))
          p.loading = 5;
        else {
          e = j(
            { rel: "stylesheet", href: e, "data-precedence": t },
            a
          ), (a = Gt.get(c)) && gc(e, a);
          var b = f = l.createElement("link");
          tt(b), rt(b, "link", e), b._p = new Promise(function(T, D) {
            b.onload = T, b.onerror = D;
          }), b.addEventListener("load", function() {
            p.loading |= 1;
          }), b.addEventListener("error", function() {
            p.loading |= 2;
          }), p.loading |= 4, Ru(f, t, l);
        }
        f = {
          type: "stylesheet",
          instance: f,
          count: 1,
          state: p
        }, s.set(c, f);
      }
    }
  }
  function vg(e, t) {
    En.X(e, t);
    var a = mi;
    if (a && e) {
      var l = Za(a).hoistableScripts, s = vi(e), c = l.get(s);
      c || (c = a.querySelector(yl(s)), c || (e = j({ src: e, async: !0 }, t), (t = Gt.get(s)) && bc(e, t), c = a.createElement("script"), tt(c), rt(c, "link", e), a.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, l.set(s, c));
    }
  }
  function yg(e, t) {
    En.M(e, t);
    var a = mi;
    if (a && e) {
      var l = Za(a).hoistableScripts, s = vi(e), c = l.get(s);
      c || (c = a.querySelector(yl(s)), c || (e = j({ src: e, async: !0, type: "module" }, t), (t = Gt.get(s)) && bc(e, t), c = a.createElement("script"), tt(c), rt(c, "link", e), a.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, l.set(s, c));
    }
  }
  function Wh(e, t, a, l) {
    var s = (s = oe.current) ? Du(s) : null;
    if (!s) throw Error(r(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof a.precedence == "string" && typeof a.href == "string" ? (t = pi(a.href), a = Za(
          s
        ).hoistableStyles, l = a.get(t), l || (l = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, a.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
          e = pi(a.href);
          var c = Za(
            s
          ).hoistableStyles, f = c.get(e);
          if (f || (s = s.ownerDocument || s, f = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, c.set(e, f), (c = s.querySelector(
            vl(e)
          )) && !c._p && (f.instance = c, f.state.loading = 5), Gt.has(e) || (a = {
            rel: "preload",
            as: "style",
            href: a.href,
            crossOrigin: a.crossOrigin,
            integrity: a.integrity,
            media: a.media,
            hrefLang: a.hrefLang,
            referrerPolicy: a.referrerPolicy
          }, Gt.set(e, a), c || gg(
            s,
            e,
            a,
            f.state
          ))), t && l === null)
            throw Error(r(528, ""));
          return f;
        }
        if (t && l !== null)
          throw Error(r(529, ""));
        return null;
      case "script":
        return t = a.async, a = a.src, typeof a == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = vi(a), a = Za(
          s
        ).hoistableScripts, l = a.get(t), l || (l = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, a.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(r(444, e));
    }
  }
  function pi(e) {
    return 'href="' + Ut(e) + '"';
  }
  function vl(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function Ph(e) {
    return j({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function gg(e, t, a, l) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? l.loading = 1 : (t = e.createElement("link"), l.preload = t, t.addEventListener("load", function() {
      return l.loading |= 1;
    }), t.addEventListener("error", function() {
      return l.loading |= 2;
    }), rt(t, "link", a), tt(t), e.head.appendChild(t));
  }
  function vi(e) {
    return '[src="' + Ut(e) + '"]';
  }
  function yl(e) {
    return "script[async]" + e;
  }
  function em(e, t, a) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var l = e.querySelector(
            'style[data-href~="' + Ut(a.href) + '"]'
          );
          if (l)
            return t.instance = l, tt(l), l;
          var s = j({}, a, {
            "data-href": a.href,
            "data-precedence": a.precedence,
            href: null,
            precedence: null
          });
          return l = (e.ownerDocument || e).createElement(
            "style"
          ), tt(l), rt(l, "style", s), Ru(l, a.precedence, e), t.instance = l;
        case "stylesheet":
          s = pi(a.href);
          var c = e.querySelector(
            vl(s)
          );
          if (c)
            return t.state.loading |= 4, t.instance = c, tt(c), c;
          l = Ph(a), (s = Gt.get(s)) && gc(l, s), c = (e.ownerDocument || e).createElement("link"), tt(c);
          var f = c;
          return f._p = new Promise(function(p, b) {
            f.onload = p, f.onerror = b;
          }), rt(c, "link", l), t.state.loading |= 4, Ru(c, a.precedence, e), t.instance = c;
        case "script":
          return c = vi(a.src), (s = e.querySelector(
            yl(c)
          )) ? (t.instance = s, tt(s), s) : (l = a, (s = Gt.get(c)) && (l = j({}, a), bc(l, s)), e = e.ownerDocument || e, s = e.createElement("script"), tt(s), rt(s, "link", l), e.head.appendChild(s), t.instance = s);
        case "void":
          return null;
        default:
          throw Error(r(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (l = t.instance, t.state.loading |= 4, Ru(l, a.precedence, e));
    return t.instance;
  }
  function Ru(e, t, a) {
    for (var l = a.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), s = l.length ? l[l.length - 1] : null, c = s, f = 0; f < l.length; f++) {
      var p = l[f];
      if (p.dataset.precedence === t) c = p;
      else if (c !== s) break;
    }
    c ? c.parentNode.insertBefore(e, c.nextSibling) : (t = a.nodeType === 9 ? a.head : a, t.insertBefore(e, t.firstChild));
  }
  function gc(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function bc(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var qu = null;
  function tm(e, t, a) {
    if (qu === null) {
      var l = /* @__PURE__ */ new Map(), s = qu = /* @__PURE__ */ new Map();
      s.set(a, l);
    } else
      s = qu, l = s.get(a), l || (l = /* @__PURE__ */ new Map(), s.set(a, l));
    if (l.has(e)) return l;
    for (l.set(e, null), a = a.getElementsByTagName(e), s = 0; s < a.length; s++) {
      var c = a[s];
      if (!(c[Di] || c[it] || e === "link" && c.getAttribute("rel") === "stylesheet") && c.namespaceURI !== "http://www.w3.org/2000/svg") {
        var f = c.getAttribute(t) || "";
        f = e + f;
        var p = l.get(f);
        p ? p.push(c) : l.set(f, [c]);
      }
    }
    return l;
  }
  function nm(e, t, a) {
    e = e.ownerDocument || e, e.head.insertBefore(
      a,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function bg(e, t, a) {
    if (a === 1 || t.itemProp != null) return !1;
    switch (e) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
          break;
        return !0;
      case "link":
        if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
          break;
        switch (t.rel) {
          case "stylesheet":
            return e = t.disabled, typeof t.precedence == "string" && e == null;
          default:
            return !0;
        }
      case "script":
        if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
          return !0;
    }
    return !1;
  }
  function am(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function _g(e, t, a, l) {
    if (a.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== !1) && (a.state.loading & 4) === 0) {
      if (a.instance === null) {
        var s = pi(l.href), c = t.querySelector(
          vl(s)
        );
        if (c) {
          t = c._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = Uu.bind(e), t.then(e, e)), a.state.loading |= 4, a.instance = c, tt(c);
          return;
        }
        c = t.ownerDocument || t, l = Ph(l), (s = Gt.get(s)) && gc(l, s), c = c.createElement("link"), tt(c);
        var f = c;
        f._p = new Promise(function(p, b) {
          f.onload = p, f.onerror = b;
        }), rt(c, "link", l), a.instance = c;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(a, t), (t = a.state.preload) && (a.state.loading & 3) === 0 && (e.count++, a = Uu.bind(e), t.addEventListener("load", a), t.addEventListener("error", a));
    }
  }
  var _c = 0;
  function Sg(e, t) {
    return e.stylesheets && e.count === 0 && Qu(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(a) {
      var l = setTimeout(function() {
        if (e.stylesheets && Qu(e, e.stylesheets), e.unsuspend) {
          var c = e.unsuspend;
          e.unsuspend = null, c();
        }
      }, 6e4 + t);
      0 < e.imgBytes && _c === 0 && (_c = 62500 * tg());
      var s = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Qu(e, e.stylesheets), e.unsuspend)) {
            var c = e.unsuspend;
            e.unsuspend = null, c();
          }
        },
        (e.imgBytes > _c ? 50 : 800) + t
      );
      return e.unsuspend = a, function() {
        e.unsuspend = null, clearTimeout(l), clearTimeout(s);
      };
    } : null;
  }
  function Uu() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Qu(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var Zu = null;
  function Qu(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, Zu = /* @__PURE__ */ new Map(), t.forEach(zg, e), Zu = null, Uu.call(e));
  }
  function zg(e, t) {
    if (!(t.state.loading & 4)) {
      var a = Zu.get(e);
      if (a) var l = a.get(null);
      else {
        a = /* @__PURE__ */ new Map(), Zu.set(e, a);
        for (var s = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), c = 0; c < s.length; c++) {
          var f = s[c];
          (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") && (a.set(f.dataset.precedence, f), l = f);
        }
        l && a.set(null, l);
      }
      s = t.instance, f = s.getAttribute("data-precedence"), c = a.get(f) || l, c === l && a.set(null, s), a.set(f, s), this.count++, l = Uu.bind(this), s.addEventListener("load", l), s.addEventListener("error", l), c ? c.parentNode.insertBefore(s, c.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(s, e.firstChild)), t.state.loading |= 4;
    }
  }
  var gl = {
    $$typeof: ee,
    Provider: null,
    Consumer: null,
    _currentValue: ie,
    _currentValue2: ie,
    _threadCount: 0
  };
  function wg(e, t, a, l, s, c, f, p, b) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = ps(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ps(0), this.hiddenUpdates = ps(null), this.identifierPrefix = l, this.onUncaughtError = s, this.onCaughtError = c, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = b, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function im(e, t, a, l, s, c, f, p, b, T, D, H) {
    return e = new wg(
      e,
      t,
      a,
      f,
      b,
      T,
      D,
      H,
      p
    ), t = 1, c === !0 && (t |= 24), c = At(3, null, null, t), e.current = c, c.stateNode = e, t = Ps(), t.refCount++, e.pooledCache = t, t.refCount++, c.memoizedState = {
      element: l,
      isDehydrated: a,
      cache: t
    }, ar(c), e;
  }
  function lm(e) {
    return e ? (e = Xa, e) : Xa;
  }
  function um(e, t, a, l, s, c) {
    s = lm(s), l.context === null ? l.context = s : l.pendingContext = s, l = $n(t), l.payload = { element: a }, c = c === void 0 ? null : c, c !== null && (l.callback = c), a = kn(e, l, t), a !== null && (_t(a, e, t), Fi(a, e, t));
  }
  function sm(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var a = e.retryLane;
      e.retryLane = a !== 0 && a < t ? a : t;
    }
  }
  function Sc(e, t) {
    sm(e, t), (e = e.alternate) && sm(e, t);
  }
  function rm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = pa(e, 67108864);
      t !== null && _t(t, e, 67108864), Sc(e, 67108864);
    }
  }
  function cm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Dt();
      t = vs(t);
      var a = pa(e, t);
      a !== null && _t(a, e, t), Sc(e, t);
    }
  }
  var Hu = !0;
  function jg(e, t, a, l) {
    var s = R.T;
    R.T = null;
    var c = Y.p;
    try {
      Y.p = 2, zc(e, t, a, l);
    } finally {
      Y.p = c, R.T = s;
    }
  }
  function xg(e, t, a, l) {
    var s = R.T;
    R.T = null;
    var c = Y.p;
    try {
      Y.p = 8, zc(e, t, a, l);
    } finally {
      Y.p = c, R.T = s;
    }
  }
  function zc(e, t, a, l) {
    if (Hu) {
      var s = wc(l);
      if (s === null)
        rc(
          e,
          t,
          l,
          Bu,
          a
        ), fm(e, l);
      else if (Tg(
        s,
        e,
        t,
        a,
        l
      ))
        l.stopPropagation();
      else if (fm(e, l), t & 4 && -1 < Eg.indexOf(e)) {
        for (; s !== null; ) {
          var c = Ua(s);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (c = c.stateNode, c.current.memoizedState.isDehydrated) {
                  var f = oa(c.pendingLanes);
                  if (f !== 0) {
                    var p = c;
                    for (p.pendingLanes |= 2, p.entangledLanes |= 2; f; ) {
                      var b = 1 << 31 - Et(f);
                      p.entanglements[1] |= b, f &= ~b;
                    }
                    un(c), (ze & 6) === 0 && (zu = jt() + 500, dl(0));
                  }
                }
                break;
              case 31:
              case 13:
                p = pa(c, 2), p !== null && _t(p, c, 2), ju(), Sc(c, 2);
            }
          if (c = wc(l), c === null && rc(
            e,
            t,
            l,
            Bu,
            a
          ), c === s) break;
          s = c;
        }
        s !== null && l.stopPropagation();
      } else
        rc(
          e,
          t,
          l,
          null,
          a
        );
    }
  }
  function wc(e) {
    return e = xs(e), jc(e);
  }
  var Bu = null;
  function jc(e) {
    if (Bu = null, e = qa(e), e !== null) {
      var t = h(e);
      if (t === null) e = null;
      else {
        var a = t.tag;
        if (a === 13) {
          if (e = d(t), e !== null) return e;
          e = null;
        } else if (a === 31) {
          if (e = v(t), e !== null) return e;
          e = null;
        } else if (a === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return Bu = e, null;
  }
  function om(e) {
    switch (e) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (fv()) {
          case yo:
            return 2;
          case go:
            return 8;
          case Ol:
          case dv:
            return 32;
          case bo:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var xc = !1, Pn = null, ea = null, ta = null, bl = /* @__PURE__ */ new Map(), _l = /* @__PURE__ */ new Map(), na = [], Eg = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function fm(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Pn = null;
        break;
      case "dragenter":
      case "dragleave":
        ea = null;
        break;
      case "mouseover":
      case "mouseout":
        ta = null;
        break;
      case "pointerover":
      case "pointerout":
        bl.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        _l.delete(t.pointerId);
    }
  }
  function Sl(e, t, a, l, s, c) {
    return e === null || e.nativeEvent !== c ? (e = {
      blockedOn: t,
      domEventName: a,
      eventSystemFlags: l,
      nativeEvent: c,
      targetContainers: [s]
    }, t !== null && (t = Ua(t), t !== null && rm(t)), e) : (e.eventSystemFlags |= l, t = e.targetContainers, s !== null && t.indexOf(s) === -1 && t.push(s), e);
  }
  function Tg(e, t, a, l, s) {
    switch (t) {
      case "focusin":
        return Pn = Sl(
          Pn,
          e,
          t,
          a,
          l,
          s
        ), !0;
      case "dragenter":
        return ea = Sl(
          ea,
          e,
          t,
          a,
          l,
          s
        ), !0;
      case "mouseover":
        return ta = Sl(
          ta,
          e,
          t,
          a,
          l,
          s
        ), !0;
      case "pointerover":
        var c = s.pointerId;
        return bl.set(
          c,
          Sl(
            bl.get(c) || null,
            e,
            t,
            a,
            l,
            s
          )
        ), !0;
      case "gotpointercapture":
        return c = s.pointerId, _l.set(
          c,
          Sl(
            _l.get(c) || null,
            e,
            t,
            a,
            l,
            s
          )
        ), !0;
    }
    return !1;
  }
  function dm(e) {
    var t = qa(e.target);
    if (t !== null) {
      var a = h(t);
      if (a !== null) {
        if (t = a.tag, t === 13) {
          if (t = d(a), t !== null) {
            e.blockedOn = t, xo(e.priority, function() {
              cm(a);
            });
            return;
          }
        } else if (t === 31) {
          if (t = v(a), t !== null) {
            e.blockedOn = t, xo(e.priority, function() {
              cm(a);
            });
            return;
          }
        } else if (t === 3 && a.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = a.tag === 3 ? a.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function $u(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var a = wc(e.nativeEvent);
      if (a === null) {
        a = e.nativeEvent;
        var l = new a.constructor(
          a.type,
          a
        );
        js = l, a.target.dispatchEvent(l), js = null;
      } else
        return t = Ua(a), t !== null && rm(t), e.blockedOn = a, !1;
      t.shift();
    }
    return !0;
  }
  function hm(e, t, a) {
    $u(e) && a.delete(t);
  }
  function Ag() {
    xc = !1, Pn !== null && $u(Pn) && (Pn = null), ea !== null && $u(ea) && (ea = null), ta !== null && $u(ta) && (ta = null), bl.forEach(hm), _l.forEach(hm);
  }
  function ku(e, t) {
    e.blockedOn === t && (e.blockedOn = null, xc || (xc = !0, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      Ag
    )));
  }
  var Lu = null;
  function mm(e) {
    Lu !== e && (Lu = e, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      function() {
        Lu === e && (Lu = null);
        for (var t = 0; t < e.length; t += 3) {
          var a = e[t], l = e[t + 1], s = e[t + 2];
          if (typeof l != "function") {
            if (jc(l || a) === null)
              continue;
            break;
          }
          var c = Ua(a);
          c !== null && (e.splice(t, 3), t -= 3, wr(
            c,
            {
              pending: !0,
              data: s,
              method: a.method,
              action: l
            },
            l,
            s
          ));
        }
      }
    ));
  }
  function yi(e) {
    function t(b) {
      return ku(b, e);
    }
    Pn !== null && ku(Pn, e), ea !== null && ku(ea, e), ta !== null && ku(ta, e), bl.forEach(t), _l.forEach(t);
    for (var a = 0; a < na.length; a++) {
      var l = na[a];
      l.blockedOn === e && (l.blockedOn = null);
    }
    for (; 0 < na.length && (a = na[0], a.blockedOn === null); )
      dm(a), a.blockedOn === null && na.shift();
    if (a = (e.ownerDocument || e).$$reactFormReplay, a != null)
      for (l = 0; l < a.length; l += 3) {
        var s = a[l], c = a[l + 1], f = s[mt] || null;
        if (typeof c == "function")
          f || mm(a);
        else if (f) {
          var p = null;
          if (c && c.hasAttribute("formAction")) {
            if (s = c, f = c[mt] || null)
              p = f.formAction;
            else if (jc(s) !== null) continue;
          } else p = f.action;
          typeof p == "function" ? a[l + 1] = p : (a.splice(l, 3), l -= 3), mm(a);
        }
      }
  }
  function pm() {
    function e(c) {
      c.canIntercept && c.info === "react-transition" && c.intercept({
        handler: function() {
          return new Promise(function(f) {
            return s = f;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      s !== null && (s(), s = null), l || setTimeout(a, 20);
    }
    function a() {
      if (!l && !navigation.transition) {
        var c = navigation.currentEntry;
        c && c.url != null && navigation.navigate(c.url, {
          state: c.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var l = !1, s = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(a, 100), function() {
        l = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), s !== null && (s(), s = null);
      };
    }
  }
  function Ec(e) {
    this._internalRoot = e;
  }
  Gu.prototype.render = Ec.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(r(409));
    var a = t.current, l = Dt();
    um(a, l, e, t, null, null);
  }, Gu.prototype.unmount = Ec.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      um(e.current, 2, null, e, null, null), ju(), t[Ra] = null;
    }
  };
  function Gu(e) {
    this._internalRoot = e;
  }
  Gu.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = jo();
      e = { blockedOn: null, target: e, priority: t };
      for (var a = 0; a < na.length && t !== 0 && t < na[a].priority; a++) ;
      na.splice(a, 0, e), a === 0 && dm(e);
    }
  };
  var vm = i.version;
  if (vm !== "19.2.7")
    throw Error(
      r(
        527,
        vm,
        "19.2.7"
      )
    );
  Y.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(r(188)) : (e = Object.keys(e).join(","), Error(r(268, e)));
    return e = g(t), e = e !== null ? _(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Og = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: R,
    reconcilerVersion: "19.2.7"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Yu = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Yu.isDisabled && Yu.supportsFiber)
      try {
        Ni = Yu.inject(
          Og
        ), xt = Yu;
      } catch {
      }
  }
  return wl.createRoot = function(e, t) {
    if (!o(e)) throw Error(r(299));
    var a = !1, l = "", s = wd, c = jd, f = xd;
    return t != null && (t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (l = t.identifierPrefix), t.onUncaughtError !== void 0 && (s = t.onUncaughtError), t.onCaughtError !== void 0 && (c = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError)), t = im(
      e,
      1,
      !1,
      null,
      null,
      a,
      l,
      null,
      s,
      c,
      f,
      pm
    ), e[Ra] = t.current, sc(e), new Ec(t);
  }, wl.hydrateRoot = function(e, t, a) {
    if (!o(e)) throw Error(r(299));
    var l = !1, s = "", c = wd, f = jd, p = xd, b = null;
    return a != null && (a.unstable_strictMode === !0 && (l = !0), a.identifierPrefix !== void 0 && (s = a.identifierPrefix), a.onUncaughtError !== void 0 && (c = a.onUncaughtError), a.onCaughtError !== void 0 && (f = a.onCaughtError), a.onRecoverableError !== void 0 && (p = a.onRecoverableError), a.formState !== void 0 && (b = a.formState)), t = im(
      e,
      1,
      !0,
      t,
      a ?? null,
      l,
      s,
      b,
      c,
      f,
      p,
      pm
    ), t.context = lm(null), a = t.current, l = Dt(), l = vs(l), s = $n(l), s.callback = null, kn(a, s, l), a = l, t.current.lanes = a, Mi(t, a), un(t), e[Ra] = t.current, sc(e), new Gu(t);
  }, wl.version = "19.2.7", wl;
}
var Em;
function Hg() {
  if (Em) return Ac.exports;
  Em = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Ac.exports = Qg(), Ac.exports;
}
var Bg = Hg(), J = Ic(), ji = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set(), this.subscribe = this.subscribe.bind(this);
  }
  subscribe(n) {
    return this.listeners.add(n), this.onSubscribe(), () => {
      this.listeners.delete(n), this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
}, $g = class extends ji {
  #e;
  #t;
  #n;
  constructor() {
    super(), this.#n = (n) => {
      if (typeof window < "u" && window.addEventListener) {
        const i = () => n();
        return window.addEventListener("visibilitychange", i, !1), () => {
          window.removeEventListener("visibilitychange", i);
        };
      }
    };
  }
  onSubscribe() {
    this.#t || this.setEventListener(this.#n);
  }
  onUnsubscribe() {
    this.hasListeners() || (this.#t?.(), this.#t = void 0);
  }
  setEventListener(n) {
    this.#n = n, this.#t?.(), this.#t = n((i) => {
      typeof i == "boolean" ? this.setFocused(i) : this.onFocus();
    });
  }
  setFocused(n) {
    this.#e !== n && (this.#e = n, this.onFocus());
  }
  onFocus() {
    const n = this.isFocused();
    this.listeners.forEach((i) => {
      i(n);
    });
  }
  isFocused() {
    return typeof this.#e == "boolean" ? this.#e : globalThis.document?.visibilityState !== "hidden";
  }
}, Wc = new $g(), kg = {
  // We need the wrapper function syntax below instead of direct references to
  // global setTimeout etc.
  //
  // BAD: `setTimeout: setTimeout`
  // GOOD: `setTimeout: (cb, delay) => setTimeout(cb, delay)`
  //
  // If we use direct references here, then anything that wants to spy on or
  // replace the global setTimeout (like tests) won't work since we'll already
  // have a hard reference to the original implementation at the time when this
  // file was imported.
  setTimeout: (n, i) => setTimeout(n, i),
  clearTimeout: (n) => clearTimeout(n),
  setInterval: (n, i) => setInterval(n, i),
  clearInterval: (n) => clearInterval(n)
}, Lg = class {
  // We cannot have TimeoutManager<T> as we must instantiate it with a concrete
  // type at app boot; and if we leave that type, then any new timer provider
  // would need to support the default provider's concrete timer ID, which is
  // infeasible across environments.
  //
  // We settle for type safety for the TimeoutProvider type, and accept that
  // this class is unsafe internally to allow for extension.
  #e = kg;
  #t = !1;
  setTimeoutProvider(n) {
    this.#e = n;
  }
  setTimeout(n, i) {
    return this.#e.setTimeout(n, i);
  }
  clearTimeout(n) {
    this.#e.clearTimeout(n);
  }
  setInterval(n, i) {
    return this.#e.setInterval(n, i);
  }
  clearInterval(n) {
    this.#e.clearInterval(n);
  }
}, Aa = new Lg();
function Gg(n) {
  setTimeout(n, 0);
}
var Yg = typeof window > "u" || "Deno" in globalThis;
function ht() {
}
function Kg(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Zc(n) {
  return typeof n == "number" && n >= 0 && n !== 1 / 0;
}
function vp(n, i) {
  return Math.max(n + (i || 0) - Date.now(), 0);
}
function ua(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Rt(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Tm(n, i) {
  const {
    type: u = "all",
    exact: r,
    fetchStatus: o,
    predicate: h,
    queryKey: d,
    stale: v
  } = n;
  if (d) {
    if (r) {
      if (i.queryHash !== Pc(d, i.options))
        return !1;
    } else if (!xl(i.queryKey, d))
      return !1;
  }
  if (u !== "all") {
    const y = i.isActive();
    if (u === "active" && !y || u === "inactive" && y)
      return !1;
  }
  return !(typeof v == "boolean" && i.isStale() !== v || o && o !== i.state.fetchStatus || h && !h(i));
}
function Am(n, i) {
  const { exact: u, status: r, predicate: o, mutationKey: h } = n;
  if (h) {
    if (!i.options.mutationKey)
      return !1;
    if (u) {
      if (Na(i.options.mutationKey) !== Na(h))
        return !1;
    } else if (!xl(i.options.mutationKey, h))
      return !1;
  }
  return !(r && i.state.status !== r || o && !o(i));
}
function Pc(n, i) {
  return (i?.queryKeyHashFn || Na)(n);
}
function Na(n) {
  return JSON.stringify(
    n,
    (i, u) => Qc(u) ? Object.keys(u).sort().reduce((r, o) => (r[o] = u[o], r), {}) : u
  );
}
function xl(n, i) {
  return n === i ? !0 : typeof n != typeof i ? !1 : n && i && typeof n == "object" && typeof i == "object" ? Object.keys(i).every((u) => xl(n[u], i[u])) : !1;
}
var Xg = Object.prototype.hasOwnProperty;
function yp(n, i, u = 0) {
  if (n === i)
    return n;
  if (u > 500) return i;
  const r = Om(n) && Om(i);
  if (!r && !(Qc(n) && Qc(i))) return i;
  const h = (r ? n : Object.keys(n)).length, d = r ? i : Object.keys(i), v = d.length, y = r ? new Array(v) : {};
  let g = 0;
  for (let _ = 0; _ < v; _++) {
    const j = r ? _ : d[_], S = n[j], A = i[j];
    if (S === A) {
      y[j] = S, (r ? _ < h : Xg.call(n, j)) && g++;
      continue;
    }
    if (S === null || A === null || typeof S != "object" || typeof A != "object") {
      y[j] = A;
      continue;
    }
    const C = yp(S, A, u + 1);
    y[j] = C, C === S && g++;
  }
  return h === v && g === h ? n : y;
}
function es(n, i) {
  if (!i || Object.keys(n).length !== Object.keys(i).length)
    return !1;
  for (const u in n)
    if (n[u] !== i[u])
      return !1;
  return !0;
}
function Om(n) {
  return Array.isArray(n) && n.length === Object.keys(n).length;
}
function Qc(n) {
  if (!Nm(n))
    return !1;
  const i = n.constructor;
  if (i === void 0)
    return !0;
  const u = i.prototype;
  return !(!Nm(u) || !u.hasOwnProperty("isPrototypeOf") || Object.getPrototypeOf(n) !== Object.prototype);
}
function Nm(n) {
  return Object.prototype.toString.call(n) === "[object Object]";
}
function Vg(n) {
  return new Promise((i) => {
    Aa.setTimeout(i, n);
  });
}
function Hc(n, i, u) {
  return typeof u.structuralSharing == "function" ? u.structuralSharing(n, i) : u.structuralSharing !== !1 ? yp(n, i) : i;
}
function Jg(n, i, u = 0) {
  const r = [...n, i];
  return u && r.length > u ? r.slice(1) : r;
}
function Fg(n, i, u = 0) {
  const r = [i, ...n];
  return u && r.length > u ? r.slice(0, -1) : r;
}
var eo = /* @__PURE__ */ Symbol();
function gp(n, i) {
  return !n.queryFn && i?.initialPromise ? () => i.initialPromise : !n.queryFn || n.queryFn === eo ? () => Promise.reject(new Error(`Missing queryFn: '${n.queryHash}'`)) : n.queryFn;
}
function to(n, i) {
  return typeof n == "function" ? n(...i) : !!n;
}
function Ig(n, i, u) {
  let r = !1, o;
  return Object.defineProperty(n, "signal", {
    enumerable: !0,
    get: () => (o ??= i(), r || (r = !0, o.aborted ? u() : o.addEventListener("abort", u, { once: !0 })), o)
  }), n;
}
var El = /* @__PURE__ */ (() => {
  let n = () => Yg;
  return {
    /**
     * Returns whether the current runtime should be treated as a server environment.
     */
    isServer() {
      return n();
    },
    /**
     * Overrides the server check globally.
     */
    setIsServer(i) {
      n = i;
    }
  };
})();
function Bc() {
  let n, i;
  const u = new Promise((o, h) => {
    n = o, i = h;
  });
  u.status = "pending", u.catch(() => {
  });
  function r(o) {
    Object.assign(u, o), delete u.resolve, delete u.reject;
  }
  return u.resolve = (o) => {
    r({
      status: "fulfilled",
      value: o
    }), n(o);
  }, u.reject = (o) => {
    r({
      status: "rejected",
      reason: o
    }), i(o);
  }, u;
}
var Wg = Gg;
function Pg() {
  let n = [], i = 0, u = (v) => {
    v();
  }, r = (v) => {
    v();
  }, o = Wg;
  const h = (v) => {
    i ? n.push(v) : o(() => {
      u(v);
    });
  }, d = () => {
    const v = n;
    n = [], v.length && o(() => {
      r(() => {
        v.forEach((y) => {
          u(y);
        });
      });
    });
  };
  return {
    batch: (v) => {
      let y;
      i++;
      try {
        y = v();
      } finally {
        i--, i || d();
      }
      return y;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (v) => (...y) => {
      h(() => {
        v(...y);
      });
    },
    schedule: h,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (v) => {
      u = v;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (v) => {
      r = v;
    },
    setScheduler: (v) => {
      o = v;
    }
  };
}
var et = Pg(), eb = class extends ji {
  #e = !0;
  #t;
  #n;
  constructor() {
    super(), this.#n = (n) => {
      if (typeof window < "u" && window.addEventListener) {
        const i = () => n(!0), u = () => n(!1);
        return window.addEventListener("online", i, !1), window.addEventListener("offline", u, !1), () => {
          window.removeEventListener("online", i), window.removeEventListener("offline", u);
        };
      }
    };
  }
  onSubscribe() {
    this.#t || this.setEventListener(this.#n);
  }
  onUnsubscribe() {
    this.hasListeners() || (this.#t?.(), this.#t = void 0);
  }
  setEventListener(n) {
    this.#n = n, this.#t?.(), this.#t = n(this.setOnline.bind(this));
  }
  setOnline(n) {
    this.#e !== n && (this.#e = n, this.listeners.forEach((u) => {
      u(n);
    }));
  }
  isOnline() {
    return this.#e;
  }
}, ts = new eb();
function tb(n) {
  return Math.min(1e3 * 2 ** n, 3e4);
}
function bp(n) {
  return (n ?? "online") === "online" ? ts.isOnline() : !0;
}
var $c = class extends Error {
  constructor(n) {
    super("CancelledError"), this.revert = n?.revert, this.silent = n?.silent;
  }
};
function _p(n) {
  let i = !1, u = 0, r;
  const o = Bc(), h = () => o.status !== "pending", d = (M) => {
    if (!h()) {
      const G = new $c(M);
      S(G), n.onCancel?.(G);
    }
  }, v = () => {
    i = !0;
  }, y = () => {
    i = !1;
  }, g = () => Wc.isFocused() && (n.networkMode === "always" || ts.isOnline()) && n.canRun(), _ = () => bp(n.networkMode) && n.canRun(), j = (M) => {
    h() || (r?.(), o.resolve(M));
  }, S = (M) => {
    h() || (r?.(), o.reject(M));
  }, A = () => new Promise((M) => {
    r = (G) => {
      (h() || g()) && M(G);
    }, n.onPause?.();
  }).then(() => {
    r = void 0, h() || n.onContinue?.();
  }), C = () => {
    if (h())
      return;
    let M;
    const G = u === 0 ? n.initialPromise : void 0;
    try {
      M = G ?? n.fn();
    } catch (U) {
      M = Promise.reject(U);
    }
    Promise.resolve(M).then(j).catch((U) => {
      if (h())
        return;
      const I = n.retry ?? (El.isServer() ? 0 : 3), ee = n.retryDelay ?? tb, L = typeof ee == "function" ? ee(u, U) : ee, B = I === !0 || typeof I == "number" && u < I || typeof I == "function" && I(u, U);
      if (i || !B) {
        S(U);
        return;
      }
      u++, n.onFail?.(u, U), Vg(L).then(() => g() ? void 0 : A()).then(() => {
        i ? S(U) : C();
      });
    });
  };
  return {
    promise: o,
    status: () => o.status,
    cancel: d,
    continue: () => (r?.(), o),
    cancelRetry: v,
    continueRetry: y,
    canStart: _,
    start: () => (_() ? C() : A().then(C), o)
  };
}
var Sp = class {
  #e;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout(), Zc(this.gcTime) && (this.#e = Aa.setTimeout(() => {
      this.optionalRemove();
    }, this.gcTime));
  }
  updateGcTime(n) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      n ?? (El.isServer() ? 1 / 0 : 300 * 1e3)
    );
  }
  clearGcTimeout() {
    this.#e !== void 0 && (Aa.clearTimeout(this.#e), this.#e = void 0);
  }
};
function nb(n) {
  return {
    onFetch: (i, u) => {
      const r = i.options, o = i.fetchOptions?.meta?.fetchMore?.direction, h = i.state.data?.pages || [], d = i.state.data?.pageParams || [];
      let v = { pages: [], pageParams: [] }, y = 0;
      const g = async () => {
        let _ = !1;
        const j = (C) => {
          Ig(
            C,
            () => i.signal,
            () => _ = !0
          );
        }, S = gp(i.options, i.fetchOptions), A = async (C, M, G) => {
          if (_)
            return Promise.reject(i.signal.reason);
          if (M == null && C.pages.length)
            return Promise.resolve(C);
          const I = (() => {
            const ae = {
              client: i.client,
              queryKey: i.queryKey,
              pageParam: M,
              direction: G ? "backward" : "forward",
              meta: i.options.meta
            };
            return j(ae), ae;
          })(), ee = await S(I), { maxPages: L } = i.options, B = G ? Fg : Jg;
          return {
            pages: B(C.pages, ee, L),
            pageParams: B(C.pageParams, M, L)
          };
        };
        if (o && h.length) {
          const C = o === "backward", M = C ? ab : Cm, G = {
            pages: h,
            pageParams: d
          }, U = M(r, G);
          v = await A(G, U, C);
        } else {
          const C = n ?? h.length;
          do {
            const M = y === 0 ? d[0] ?? r.initialPageParam : Cm(r, v);
            if (y > 0 && M == null)
              break;
            v = await A(v, M), y++;
          } while (y < C);
        }
        return v;
      };
      i.options.persister ? i.fetchFn = () => i.options.persister?.(
        g,
        {
          client: i.client,
          queryKey: i.queryKey,
          meta: i.options.meta,
          signal: i.signal
        },
        u
      ) : i.fetchFn = g;
    }
  };
}
function Cm(n, { pages: i, pageParams: u }) {
  const r = i.length - 1;
  return i.length > 0 ? n.getNextPageParam(
    i[r],
    i,
    u[r],
    u
  ) : void 0;
}
function ab(n, { pages: i, pageParams: u }) {
  return i.length > 0 ? n.getPreviousPageParam?.(i[0], i, u[0], u) : void 0;
}
var ib = class extends Sp {
  #e;
  #t;
  #n;
  #a;
  #l;
  #i;
  #s;
  #u;
  constructor(n) {
    super(), this.#u = !1, this.#s = n.defaultOptions, this.setOptions(n.options), this.observers = [], this.#l = n.client, this.#a = this.#l.getQueryCache(), this.queryKey = n.queryKey, this.queryHash = n.queryHash, this.#t = Dm(this.options), this.state = n.state ?? this.#t, this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  get queryType() {
    return this.#e;
  }
  get promise() {
    return this.#i?.promise;
  }
  setOptions(n) {
    if (this.options = { ...this.#s, ...n }, n?._type && (this.#e = n._type), this.updateGcTime(this.options.gcTime), this.state && this.state.data === void 0) {
      const i = Dm(this.options);
      i.data !== void 0 && (this.setState(
        Mm(i.data, i.dataUpdatedAt)
      ), this.#t = i);
    }
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && this.#a.remove(this);
  }
  setData(n, i) {
    const u = Hc(this.state.data, n, this.options);
    return this.#r({
      data: u,
      type: "success",
      dataUpdatedAt: i?.updatedAt,
      manual: i?.manual
    }), u;
  }
  setState(n) {
    this.#r({ type: "setState", state: n });
  }
  cancel(n) {
    const i = this.#i?.promise;
    return this.#i?.cancel(n), i ? i.then(ht).catch(ht) : Promise.resolve();
  }
  destroy() {
    super.destroy(), this.cancel({ silent: !0 });
  }
  get resetState() {
    return this.#t;
  }
  reset() {
    this.destroy(), this.setState(this.resetState);
  }
  isActive() {
    return this.observers.some(
      (n) => Rt(n.options.enabled, this) !== !1
    );
  }
  isDisabled() {
    return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === eo || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => ua(n.options.staleTime, this) === "static"
    ) : !1;
  }
  isStale() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => n.getCurrentResult().isStale
    ) : this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(n = 0) {
    return this.state.data === void 0 ? !0 : n === "static" ? !1 : this.state.isInvalidated ? !0 : !vp(this.state.dataUpdatedAt, n);
  }
  onFocus() {
    this.observers.find((i) => i.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: !1 }), this.#i?.continue();
  }
  onOnline() {
    this.observers.find((i) => i.shouldFetchOnReconnect())?.refetch({ cancelRefetch: !1 }), this.#i?.continue();
  }
  addObserver(n) {
    this.observers.includes(n) || (this.observers.push(n), this.clearGcTimeout(), this.#a.notify({ type: "observerAdded", query: this, observer: n }));
  }
  removeObserver(n) {
    this.observers.includes(n) && (this.observers = this.observers.filter((i) => i !== n), this.observers.length || (this.#i && (this.#u || this.#o() ? this.#i.cancel({ revert: !0 }) : this.#i.cancelRetry()), this.scheduleGc()), this.#a.notify({ type: "observerRemoved", query: this, observer: n }));
  }
  getObserversCount() {
    return this.observers.length;
  }
  #o() {
    return this.state.fetchStatus === "paused" && this.state.status === "pending";
  }
  invalidate() {
    this.state.isInvalidated || this.#r({ type: "invalidate" });
  }
  async fetch(n, i) {
    if (this.state.fetchStatus !== "idle" && // If the promise in the retryer is already rejected, we have to definitely
    // re-start the fetch; there is a chance that the query is still in a
    // pending state when that happens
    this.#i?.status() !== "rejected") {
      if (this.state.data !== void 0 && i?.cancelRefetch)
        this.cancel({ silent: !0 });
      else if (this.#i)
        return this.#i.continueRetry(), this.#i.promise;
    }
    if (n && this.setOptions(n), !this.options.queryFn) {
      const y = this.observers.find((g) => g.options.queryFn);
      y && this.setOptions(y.options);
    }
    const u = new AbortController(), r = (y) => {
      Object.defineProperty(y, "signal", {
        enumerable: !0,
        get: () => (this.#u = !0, u.signal)
      });
    }, o = () => {
      const y = gp(this.options, i), _ = (() => {
        const j = {
          client: this.#l,
          queryKey: this.queryKey,
          meta: this.meta
        };
        return r(j), j;
      })();
      return this.#u = !1, this.options.persister ? this.options.persister(
        y,
        _,
        this
      ) : y(_);
    }, d = (() => {
      const y = {
        fetchOptions: i,
        options: this.options,
        queryKey: this.queryKey,
        client: this.#l,
        state: this.state,
        fetchFn: o
      };
      return r(y), y;
    })();
    (this.#e === "infinite" ? nb(
      this.options.pages
    ) : this.options.behavior)?.onFetch(d, this), this.#n = this.state, (this.state.fetchStatus === "idle" || this.state.fetchMeta !== d.fetchOptions?.meta) && this.#r({ type: "fetch", meta: d.fetchOptions?.meta }), this.#i = _p({
      initialPromise: i?.initialPromise,
      fn: d.fetchFn,
      onCancel: (y) => {
        y instanceof $c && y.revert && this.setState({
          ...this.#n,
          fetchStatus: "idle"
        }), u.abort();
      },
      onFail: (y, g) => {
        this.#r({ type: "failed", failureCount: y, error: g });
      },
      onPause: () => {
        this.#r({ type: "pause" });
      },
      onContinue: () => {
        this.#r({ type: "continue" });
      },
      retry: d.options.retry,
      retryDelay: d.options.retryDelay,
      networkMode: d.options.networkMode,
      canRun: () => !0
    });
    try {
      const y = await this.#i.start();
      if (y === void 0)
        throw new Error(`${this.queryHash} data is undefined`);
      return this.setData(y), this.#a.config.onSuccess?.(y, this), this.#a.config.onSettled?.(
        y,
        this.state.error,
        this
      ), y;
    } catch (y) {
      if (y instanceof $c) {
        if (y.silent)
          return this.#i.promise;
        if (y.revert) {
          if (this.state.data === void 0)
            throw y;
          return this.state.data;
        }
      }
      throw this.#r({
        type: "error",
        error: y
      }), this.#a.config.onError?.(
        y,
        this
      ), this.#a.config.onSettled?.(
        this.state.data,
        y,
        this
      ), y;
    } finally {
      this.scheduleGc();
    }
  }
  #r(n) {
    const i = (u) => {
      switch (n.type) {
        case "failed":
          return {
            ...u,
            fetchFailureCount: n.failureCount,
            fetchFailureReason: n.error
          };
        case "pause":
          return {
            ...u,
            fetchStatus: "paused"
          };
        case "continue":
          return {
            ...u,
            fetchStatus: "fetching"
          };
        case "fetch":
          return {
            ...u,
            ...zp(u.data, this.options),
            fetchMeta: n.meta ?? null
          };
        case "success":
          const r = {
            ...u,
            ...Mm(n.data, n.dataUpdatedAt),
            dataUpdateCount: u.dataUpdateCount + 1,
            ...!n.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null
            }
          };
          return this.#n = n.manual ? r : void 0, r;
        case "error":
          const o = n.error;
          return {
            ...u,
            error: o,
            errorUpdateCount: u.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: u.fetchFailureCount + 1,
            fetchFailureReason: o,
            fetchStatus: "idle",
            status: "error",
            // flag existing data as invalidated if we get a background error
            // note that "no data" always means stale so we can set unconditionally here
            isInvalidated: !0
          };
        case "invalidate":
          return {
            ...u,
            isInvalidated: !0
          };
        case "setState":
          return {
            ...u,
            ...n.state
          };
      }
    };
    this.state = i(this.state), et.batch(() => {
      this.observers.forEach((u) => {
        u.onQueryUpdate();
      }), this.#a.notify({ query: this, type: "updated", action: n });
    });
  }
};
function zp(n, i) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: bp(i.networkMode) ? "fetching" : "paused",
    ...n === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function Mm(n, i) {
  return {
    data: n,
    dataUpdatedAt: i ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: "success"
  };
}
function Dm(n) {
  const i = typeof n.initialData == "function" ? n.initialData() : n.initialData, u = i !== void 0, r = u ? typeof n.initialDataUpdatedAt == "function" ? n.initialDataUpdatedAt() : n.initialDataUpdatedAt : 0;
  return {
    data: i,
    dataUpdateCount: 0,
    dataUpdatedAt: u ? r ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: u ? "success" : "pending",
    fetchStatus: "idle"
  };
}
var lb = class extends ji {
  constructor(n, i) {
    super(), this.options = i, this.#e = n, this.#u = null, this.#s = Bc(), this.bindMethods(), this.setOptions(i);
  }
  #e;
  #t = void 0;
  #n = void 0;
  #a = void 0;
  #l;
  #i;
  #s;
  #u;
  #o;
  #r;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #m;
  #f;
  #d;
  #c;
  #p = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    this.listeners.size === 1 && (this.#t.addObserver(this), Rm(this.#t, this.options) ? this.#h() : this.updateResult(), this.#b());
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return kc(
      this.#t,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return kc(
      this.#t,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set(), this.#_(), this.#S(), this.#t.removeObserver(this);
  }
  setOptions(n) {
    const i = this.options, u = this.#t;
    if (this.options = this.#e.defaultQueryOptions(n), this.options.enabled !== void 0 && typeof this.options.enabled != "boolean" && typeof this.options.enabled != "function" && typeof Rt(this.options.enabled, this.#t) != "boolean")
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    this.#z(), this.#t.setOptions(this.options), i._defaulted && !es(this.options, i) && this.#e.getQueryCache().notify({
      type: "observerOptionsUpdated",
      query: this.#t,
      observer: this
    });
    const r = this.hasListeners();
    r && qm(
      this.#t,
      u,
      this.options,
      i
    ) && this.#h(), this.updateResult(), r && (this.#t !== u || Rt(this.options.enabled, this.#t) !== Rt(i.enabled, this.#t) || ua(this.options.staleTime, this.#t) !== ua(i.staleTime, this.#t)) && this.#v();
    const o = this.#y();
    r && (this.#t !== u || Rt(this.options.enabled, this.#t) !== Rt(i.enabled, this.#t) || o !== this.#c) && this.#g(o);
  }
  getOptimisticResult(n) {
    const i = this.#e.getQueryCache().build(this.#e, n), u = this.createResult(i, n);
    return sb(this, u) && (this.#a = u, this.#i = this.options, this.#l = this.#t.state), u;
  }
  getCurrentResult() {
    return this.#a;
  }
  trackResult(n, i) {
    return new Proxy(n, {
      get: (u, r) => (this.trackProp(r), i?.(r), r === "promise" && (this.trackProp("data"), !this.options.experimental_prefetchInRender && this.#s.status === "pending" && this.#s.reject(
        new Error(
          "experimental_prefetchInRender feature flag is not enabled"
        )
      )), Reflect.get(u, r))
    });
  }
  trackProp(n) {
    this.#p.add(n);
  }
  getCurrentQuery() {
    return this.#t;
  }
  refetch({ ...n } = {}) {
    return this.fetch({
      ...n
    });
  }
  fetchOptimistic(n) {
    const i = this.#e.defaultQueryOptions(n), u = this.#e.getQueryCache().build(this.#e, i);
    return u.fetch().then(() => this.createResult(u, i));
  }
  fetch(n) {
    return this.#h({
      ...n,
      cancelRefetch: n.cancelRefetch ?? !0
    }).then(() => (this.updateResult(), this.#a));
  }
  #h(n) {
    this.#z();
    let i = this.#t.fetch(
      this.options,
      n
    );
    return n?.throwOnError || (i = i.catch(ht)), i;
  }
  #v() {
    this.#_();
    const n = ua(
      this.options.staleTime,
      this.#t
    );
    if (El.isServer() || this.#a.isStale || !Zc(n))
      return;
    const u = vp(this.#a.dataUpdatedAt, n) + 1;
    this.#f = Aa.setTimeout(() => {
      this.#a.isStale || this.updateResult();
    }, u);
  }
  #y() {
    return (typeof this.options.refetchInterval == "function" ? this.options.refetchInterval(this.#t) : this.options.refetchInterval) ?? !1;
  }
  #g(n) {
    this.#S(), this.#c = n, !(El.isServer() || Rt(this.options.enabled, this.#t) === !1 || !Zc(this.#c) || this.#c === 0) && (this.#d = Aa.setInterval(() => {
      (this.options.refetchIntervalInBackground || Wc.isFocused()) && this.#h();
    }, this.#c));
  }
  #b() {
    this.#v(), this.#g(this.#y());
  }
  #_() {
    this.#f !== void 0 && (Aa.clearTimeout(this.#f), this.#f = void 0);
  }
  #S() {
    this.#d !== void 0 && (Aa.clearInterval(this.#d), this.#d = void 0);
  }
  createResult(n, i) {
    const u = this.#t, r = this.options, o = this.#a, h = this.#l, d = this.#i, y = n !== u ? n.state : this.#n, { state: g } = n;
    let _ = { ...g }, j = !1, S;
    if (i._optimisticResults) {
      const te = this.hasListeners(), pe = !te && Rm(n, i), Qe = te && qm(n, u, i, r);
      (pe || Qe) && (_ = {
        ..._,
        ...zp(g.data, n.options)
      }), i._optimisticResults === "isRestoring" && (_.fetchStatus = "idle");
    }
    let { error: A, errorUpdatedAt: C, status: M } = _;
    S = _.data;
    let G = !1;
    if (i.placeholderData !== void 0 && S === void 0 && M === "pending") {
      let te;
      o?.isPlaceholderData && i.placeholderData === d?.placeholderData ? (te = o.data, G = !0) : te = typeof i.placeholderData == "function" ? i.placeholderData(
        this.#m?.state.data,
        this.#m
      ) : i.placeholderData, te !== void 0 && (M = "success", S = Hc(
        o?.data,
        te,
        i
      ), j = !0);
    }
    if (i.select && S !== void 0 && !G)
      if (o && S === h?.data && i.select === this.#o)
        S = this.#r;
      else
        try {
          this.#o = i.select, S = i.select(S), S = Hc(o?.data, S, i), this.#r = S, this.#u = null;
        } catch (te) {
          this.#u = te;
        }
    this.#u && (A = this.#u, S = this.#r, C = Date.now(), M = "error");
    const U = _.fetchStatus === "fetching", I = M === "pending", ee = M === "error", L = I && U, B = S !== void 0, F = {
      status: M,
      fetchStatus: _.fetchStatus,
      isPending: I,
      isSuccess: M === "success",
      isError: ee,
      isInitialLoading: L,
      isLoading: L,
      data: S,
      dataUpdatedAt: _.dataUpdatedAt,
      error: A,
      errorUpdatedAt: C,
      failureCount: _.fetchFailureCount,
      failureReason: _.fetchFailureReason,
      errorUpdateCount: _.errorUpdateCount,
      isFetched: n.isFetched(),
      isFetchedAfterMount: _.dataUpdateCount > y.dataUpdateCount || _.errorUpdateCount > y.errorUpdateCount,
      isFetching: U,
      isRefetching: U && !I,
      isLoadingError: ee && !B,
      isPaused: _.fetchStatus === "paused",
      isPlaceholderData: j,
      isRefetchError: ee && B,
      isStale: no(n, i),
      refetch: this.refetch,
      promise: this.#s,
      isEnabled: Rt(i.enabled, n) !== !1
    };
    if (this.options.experimental_prefetchInRender) {
      const te = F.data !== void 0, pe = F.status === "error" && !te, Qe = (zt) => {
        pe ? zt.reject(F.error) : te && zt.resolve(F.data);
      }, Le = () => {
        const zt = this.#s = F.promise = Bc();
        Qe(zt);
      }, Be = this.#s;
      switch (Be.status) {
        case "pending":
          n.queryHash === u.queryHash && Qe(Be);
          break;
        case "fulfilled":
          (pe || F.data !== Be.value) && Le();
          break;
        case "rejected":
          (!pe || F.error !== Be.reason) && Le();
          break;
      }
    }
    return F;
  }
  updateResult() {
    const n = this.#a, i = this.createResult(this.#t, this.options);
    if (this.#l = this.#t.state, this.#i = this.options, this.#l.data !== void 0 && (this.#m = this.#t), es(i, n))
      return;
    this.#a = i;
    const u = () => {
      if (!n)
        return !0;
      const { notifyOnChangeProps: r } = this.options, o = typeof r == "function" ? r() : r;
      if (o === "all" || !o && !this.#p.size)
        return !0;
      const h = new Set(
        o ?? this.#p
      );
      return this.options.throwOnError && h.add("error"), Object.keys(this.#a).some((d) => {
        const v = d;
        return this.#a[v] !== n[v] && h.has(v);
      });
    };
    this.#w({ listeners: u() });
  }
  #z() {
    const n = this.#e.getQueryCache().build(this.#e, this.options);
    if (n === this.#t)
      return;
    const i = this.#t;
    this.#t = n, this.#n = n.state, this.hasListeners() && (i?.removeObserver(this), n.addObserver(this));
  }
  onQueryUpdate() {
    this.updateResult(), this.hasListeners() && this.#b();
  }
  #w(n) {
    et.batch(() => {
      n.listeners && this.listeners.forEach((i) => {
        i(this.#a);
      }), this.#e.getQueryCache().notify({
        query: this.#t,
        type: "observerResultsUpdated"
      });
    });
  }
};
function ub(n, i) {
  return Rt(i.enabled, n) !== !1 && n.state.data === void 0 && !(n.state.status === "error" && Rt(i.retryOnMount, n) === !1);
}
function Rm(n, i) {
  return ub(n, i) || n.state.data !== void 0 && kc(n, i, i.refetchOnMount);
}
function kc(n, i, u) {
  if (Rt(i.enabled, n) !== !1 && ua(i.staleTime, n) !== "static") {
    const r = typeof u == "function" ? u(n) : u;
    return r === "always" || r !== !1 && no(n, i);
  }
  return !1;
}
function qm(n, i, u, r) {
  return (n !== i || Rt(r.enabled, n) === !1) && (!u.suspense || n.state.status !== "error") && no(n, u);
}
function no(n, i) {
  return Rt(i.enabled, n) !== !1 && n.isStaleByTime(ua(i.staleTime, n));
}
function sb(n, i) {
  return !es(n.getCurrentResult(), i);
}
var rb = class extends Sp {
  #e;
  #t;
  #n;
  #a;
  constructor(n) {
    super(), this.#e = n.client, this.mutationId = n.mutationId, this.#n = n.mutationCache, this.#t = [], this.state = n.state || wp(), this.setOptions(n.options), this.scheduleGc();
  }
  setOptions(n) {
    this.options = n, this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(n) {
    this.#t.includes(n) || (this.#t.push(n), this.clearGcTimeout(), this.#n.notify({
      type: "observerAdded",
      mutation: this,
      observer: n
    }));
  }
  removeObserver(n) {
    this.#t = this.#t.filter((i) => i !== n), this.scheduleGc(), this.#n.notify({
      type: "observerRemoved",
      mutation: this,
      observer: n
    });
  }
  optionalRemove() {
    this.#t.length || (this.state.status === "pending" ? this.scheduleGc() : this.#n.remove(this));
  }
  continue() {
    return this.#a?.continue() ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(n) {
    const i = () => {
      this.#l({ type: "continue" });
    }, u = {
      client: this.#e,
      meta: this.options.meta,
      mutationKey: this.options.mutationKey
    };
    this.#a = _p({
      fn: () => this.options.mutationFn ? this.options.mutationFn(n, u) : Promise.reject(new Error("No mutationFn found")),
      onFail: (h, d) => {
        this.#l({ type: "failed", failureCount: h, error: d });
      },
      onPause: () => {
        this.#l({ type: "pause" });
      },
      onContinue: i,
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => this.#n.canRun(this)
    });
    const r = this.state.status === "pending", o = !this.#a.canStart();
    try {
      if (r)
        i();
      else {
        this.#l({ type: "pending", variables: n, isPaused: o }), this.#n.config.onMutate && await this.#n.config.onMutate(
          n,
          this,
          u
        );
        const d = await this.options.onMutate?.(
          n,
          u
        );
        d !== this.state.context && this.#l({
          type: "pending",
          context: d,
          variables: n,
          isPaused: o
        });
      }
      const h = await this.#a.start();
      return await this.#n.config.onSuccess?.(
        h,
        n,
        this.state.context,
        this,
        u
      ), await this.options.onSuccess?.(
        h,
        n,
        this.state.context,
        u
      ), await this.#n.config.onSettled?.(
        h,
        null,
        this.state.variables,
        this.state.context,
        this,
        u
      ), await this.options.onSettled?.(
        h,
        null,
        n,
        this.state.context,
        u
      ), this.#l({ type: "success", data: h }), h;
    } catch (h) {
      try {
        await this.#n.config.onError?.(
          h,
          n,
          this.state.context,
          this,
          u
        );
      } catch (d) {
        Promise.reject(d);
      }
      try {
        await this.options.onError?.(
          h,
          n,
          this.state.context,
          u
        );
      } catch (d) {
        Promise.reject(d);
      }
      try {
        await this.#n.config.onSettled?.(
          void 0,
          h,
          this.state.variables,
          this.state.context,
          this,
          u
        );
      } catch (d) {
        Promise.reject(d);
      }
      try {
        await this.options.onSettled?.(
          void 0,
          h,
          n,
          this.state.context,
          u
        );
      } catch (d) {
        Promise.reject(d);
      }
      throw this.#l({ type: "error", error: h }), h;
    } finally {
      this.#n.runNext(this);
    }
  }
  #l(n) {
    const i = (u) => {
      switch (n.type) {
        case "failed":
          return {
            ...u,
            failureCount: n.failureCount,
            failureReason: n.error
          };
        case "pause":
          return {
            ...u,
            isPaused: !0
          };
        case "continue":
          return {
            ...u,
            isPaused: !1
          };
        case "pending":
          return {
            ...u,
            context: n.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: n.isPaused,
            status: "pending",
            variables: n.variables,
            submittedAt: Date.now()
          };
        case "success":
          return {
            ...u,
            data: n.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: !1
          };
        case "error":
          return {
            ...u,
            data: void 0,
            error: n.error,
            failureCount: u.failureCount + 1,
            failureReason: n.error,
            isPaused: !1,
            status: "error"
          };
      }
    };
    this.state = i(this.state), et.batch(() => {
      this.#t.forEach((u) => {
        u.onMutationUpdate(n);
      }), this.#n.notify({
        mutation: this,
        type: "updated",
        action: n
      });
    });
  }
};
function wp() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var cb = class extends ji {
  constructor(n = {}) {
    super(), this.config = n, this.#e = /* @__PURE__ */ new Set(), this.#t = /* @__PURE__ */ new Map(), this.#n = 0;
  }
  #e;
  #t;
  #n;
  build(n, i, u) {
    const r = new rb({
      client: n,
      mutationCache: this,
      mutationId: ++this.#n,
      options: n.defaultMutationOptions(i),
      state: u
    });
    return this.add(r), r;
  }
  add(n) {
    this.#e.add(n);
    const i = Ku(n);
    if (typeof i == "string") {
      const u = this.#t.get(i);
      u ? u.push(n) : this.#t.set(i, [n]);
    }
    this.notify({ type: "added", mutation: n });
  }
  remove(n) {
    if (this.#e.delete(n)) {
      const i = Ku(n);
      if (typeof i == "string") {
        const u = this.#t.get(i);
        if (u)
          if (u.length > 1) {
            const r = u.indexOf(n);
            r !== -1 && u.splice(r, 1);
          } else u[0] === n && this.#t.delete(i);
      }
    }
    this.notify({ type: "removed", mutation: n });
  }
  canRun(n) {
    const i = Ku(n);
    if (typeof i == "string") {
      const r = this.#t.get(i)?.find(
        (o) => o.state.status === "pending"
      );
      return !r || r === n;
    } else
      return !0;
  }
  runNext(n) {
    const i = Ku(n);
    return typeof i == "string" ? this.#t.get(i)?.find((r) => r !== n && r.state.isPaused)?.continue() ?? Promise.resolve() : Promise.resolve();
  }
  clear() {
    et.batch(() => {
      this.#e.forEach((n) => {
        this.notify({ type: "removed", mutation: n });
      }), this.#e.clear(), this.#t.clear();
    });
  }
  getAll() {
    return Array.from(this.#e);
  }
  find(n) {
    const i = { exact: !0, ...n };
    return this.getAll().find(
      (u) => Am(i, u)
    );
  }
  findAll(n = {}) {
    return this.getAll().filter((i) => Am(n, i));
  }
  notify(n) {
    et.batch(() => {
      this.listeners.forEach((i) => {
        i(n);
      });
    });
  }
  resumePausedMutations() {
    const n = this.getAll().filter((i) => i.state.isPaused);
    return et.batch(
      () => Promise.all(
        n.map((i) => i.continue().catch(ht))
      )
    );
  }
};
function Ku(n) {
  return n.options.scope?.id;
}
var ob = class extends ji {
  #e;
  #t = void 0;
  #n;
  #a;
  constructor(n, i) {
    super(), this.#e = n, this.setOptions(i), this.bindMethods(), this.#l();
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this), this.reset = this.reset.bind(this);
  }
  setOptions(n) {
    const i = this.options;
    this.options = this.#e.defaultMutationOptions(n), es(this.options, i) || this.#e.getMutationCache().notify({
      type: "observerOptionsUpdated",
      mutation: this.#n,
      observer: this
    }), i?.mutationKey && this.options.mutationKey && Na(i.mutationKey) !== Na(this.options.mutationKey) ? this.reset() : this.#n?.state.status === "pending" && this.#n.setOptions(this.options);
  }
  onUnsubscribe() {
    this.hasListeners() || this.#n?.removeObserver(this);
  }
  onMutationUpdate(n) {
    this.#l(), this.#i(n);
  }
  getCurrentResult() {
    return this.#t;
  }
  reset() {
    this.#n?.removeObserver(this), this.#n = void 0, this.#l(), this.#i();
  }
  mutate(n, i) {
    return this.#a = i, this.#n?.removeObserver(this), this.#n = this.#e.getMutationCache().build(this.#e, this.options), this.#n.addObserver(this), this.#n.execute(n);
  }
  #l() {
    const n = this.#n?.state ?? wp();
    this.#t = {
      ...n,
      isPending: n.status === "pending",
      isSuccess: n.status === "success",
      isError: n.status === "error",
      isIdle: n.status === "idle",
      mutate: this.mutate,
      reset: this.reset
    };
  }
  #i(n) {
    et.batch(() => {
      if (this.#a && this.hasListeners()) {
        const i = this.#t.variables, u = this.#t.context, r = {
          client: this.#e,
          meta: this.options.meta,
          mutationKey: this.options.mutationKey
        };
        if (n?.type === "success") {
          try {
            this.#a.onSuccess?.(
              n.data,
              i,
              u,
              r
            );
          } catch (o) {
            Promise.reject(o);
          }
          try {
            this.#a.onSettled?.(
              n.data,
              null,
              i,
              u,
              r
            );
          } catch (o) {
            Promise.reject(o);
          }
        } else if (n?.type === "error") {
          try {
            this.#a.onError?.(
              n.error,
              i,
              u,
              r
            );
          } catch (o) {
            Promise.reject(o);
          }
          try {
            this.#a.onSettled?.(
              void 0,
              n.error,
              i,
              u,
              r
            );
          } catch (o) {
            Promise.reject(o);
          }
        }
      }
      this.listeners.forEach((i) => {
        i(this.#t);
      });
    });
  }
}, fb = class extends ji {
  constructor(n = {}) {
    super(), this.config = n, this.#e = /* @__PURE__ */ new Map();
  }
  #e;
  build(n, i, u) {
    const r = i.queryKey, o = i.queryHash ?? Pc(r, i);
    let h = this.get(o);
    return h || (h = new ib({
      client: n,
      queryKey: r,
      queryHash: o,
      options: n.defaultQueryOptions(i),
      state: u,
      defaultOptions: n.getQueryDefaults(r)
    }), this.add(h)), h;
  }
  add(n) {
    this.#e.has(n.queryHash) || (this.#e.set(n.queryHash, n), this.notify({
      type: "added",
      query: n
    }));
  }
  remove(n) {
    const i = this.#e.get(n.queryHash);
    i && (n.destroy(), i === n && this.#e.delete(n.queryHash), this.notify({ type: "removed", query: n }));
  }
  clear() {
    et.batch(() => {
      this.getAll().forEach((n) => {
        this.remove(n);
      });
    });
  }
  get(n) {
    return this.#e.get(n);
  }
  getAll() {
    return [...this.#e.values()];
  }
  find(n) {
    const i = { exact: !0, ...n };
    return this.getAll().find(
      (u) => Tm(i, u)
    );
  }
  findAll(n = {}) {
    const i = this.getAll();
    return Object.keys(n).length > 0 ? i.filter((u) => Tm(n, u)) : i;
  }
  notify(n) {
    et.batch(() => {
      this.listeners.forEach((i) => {
        i(n);
      });
    });
  }
  onFocus() {
    et.batch(() => {
      this.getAll().forEach((n) => {
        n.onFocus();
      });
    });
  }
  onOnline() {
    et.batch(() => {
      this.getAll().forEach((n) => {
        n.onOnline();
      });
    });
  }
}, db = class {
  #e;
  #t;
  #n;
  #a;
  #l;
  #i;
  #s;
  #u;
  constructor(n = {}) {
    this.#e = n.queryCache || new fb(), this.#t = n.mutationCache || new cb(), this.#n = n.defaultOptions || {}, this.#a = /* @__PURE__ */ new Map(), this.#l = /* @__PURE__ */ new Map(), this.#i = 0;
  }
  mount() {
    this.#i++, this.#i === 1 && (this.#s = Wc.subscribe(async (n) => {
      n && (await this.resumePausedMutations(), this.#e.onFocus());
    }), this.#u = ts.subscribe(async (n) => {
      n && (await this.resumePausedMutations(), this.#e.onOnline());
    }));
  }
  unmount() {
    this.#i--, this.#i === 0 && (this.#s?.(), this.#s = void 0, this.#u?.(), this.#u = void 0);
  }
  isFetching(n) {
    return this.#e.findAll({ ...n, fetchStatus: "fetching" }).length;
  }
  isMutating(n) {
    return this.#t.findAll({ ...n, status: "pending" }).length;
  }
  /**
   * Imperative (non-reactive) way to retrieve data for a QueryKey.
   * Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
   *
   * Hint: Do not use this function inside a component, because it won't receive updates.
   * Use `useQuery` to create a `QueryObserver` that subscribes to changes.
   */
  getQueryData(n) {
    const i = this.defaultQueryOptions({ queryKey: n });
    return this.#e.get(i.queryHash)?.state.data;
  }
  ensureQueryData(n) {
    const i = this.defaultQueryOptions(n), u = this.#e.build(this, i), r = u.state.data;
    return r === void 0 ? this.fetchQuery(n) : (n.revalidateIfStale && u.isStaleByTime(ua(i.staleTime, u)) && this.prefetchQuery(i), Promise.resolve(r));
  }
  getQueriesData(n) {
    return this.#e.findAll(n).map(({ queryKey: i, state: u }) => {
      const r = u.data;
      return [i, r];
    });
  }
  setQueryData(n, i, u) {
    const r = this.defaultQueryOptions({ queryKey: n }), h = this.#e.get(
      r.queryHash
    )?.state.data, d = Kg(i, h);
    if (d !== void 0)
      return this.#e.build(this, r).setData(d, { ...u, manual: !0 });
  }
  setQueriesData(n, i, u) {
    return et.batch(
      () => this.#e.findAll(n).map(({ queryKey: r }) => [
        r,
        this.setQueryData(r, i, u)
      ])
    );
  }
  getQueryState(n) {
    const i = this.defaultQueryOptions({ queryKey: n });
    return this.#e.get(
      i.queryHash
    )?.state;
  }
  removeQueries(n) {
    const i = this.#e;
    et.batch(() => {
      i.findAll(n).forEach((u) => {
        i.remove(u);
      });
    });
  }
  resetQueries(n, i) {
    const u = this.#e;
    return et.batch(() => (u.findAll(n).forEach((r) => {
      r.reset();
    }), this.refetchQueries(
      {
        type: "active",
        ...n
      },
      i
    )));
  }
  cancelQueries(n, i = {}) {
    const u = { revert: !0, ...i }, r = et.batch(
      () => this.#e.findAll(n).map((o) => o.cancel(u))
    );
    return Promise.all(r).then(ht).catch(ht);
  }
  invalidateQueries(n, i = {}) {
    return et.batch(() => (this.#e.findAll(n).forEach((u) => {
      u.invalidate();
    }), n?.refetchType === "none" ? Promise.resolve() : this.refetchQueries(
      {
        ...n,
        type: n?.refetchType ?? n?.type ?? "active"
      },
      i
    )));
  }
  refetchQueries(n, i = {}) {
    const u = {
      ...i,
      cancelRefetch: i.cancelRefetch ?? !0
    }, r = et.batch(
      () => this.#e.findAll(n).filter((o) => !o.isDisabled() && !o.isStatic()).map((o) => {
        let h = o.fetch(void 0, u);
        return u.throwOnError || (h = h.catch(ht)), o.state.fetchStatus === "paused" ? Promise.resolve() : h;
      })
    );
    return Promise.all(r).then(ht);
  }
  fetchQuery(n) {
    const i = this.defaultQueryOptions(n);
    i.retry === void 0 && (i.retry = !1);
    const u = this.#e.build(this, i);
    return u.isStaleByTime(
      ua(i.staleTime, u)
    ) ? u.fetch(i) : Promise.resolve(u.state.data);
  }
  prefetchQuery(n) {
    return this.fetchQuery(n).then(ht).catch(ht);
  }
  fetchInfiniteQuery(n) {
    return n._type = "infinite", this.fetchQuery(n);
  }
  prefetchInfiniteQuery(n) {
    return this.fetchInfiniteQuery(n).then(ht).catch(ht);
  }
  ensureInfiniteQueryData(n) {
    return n._type = "infinite", this.ensureQueryData(n);
  }
  resumePausedMutations() {
    return ts.isOnline() ? this.#t.resumePausedMutations() : Promise.resolve();
  }
  getQueryCache() {
    return this.#e;
  }
  getMutationCache() {
    return this.#t;
  }
  getDefaultOptions() {
    return this.#n;
  }
  setDefaultOptions(n) {
    this.#n = n;
  }
  setQueryDefaults(n, i) {
    this.#a.set(Na(n), {
      queryKey: n,
      defaultOptions: i
    });
  }
  getQueryDefaults(n) {
    const i = [...this.#a.values()], u = {};
    return i.forEach((r) => {
      xl(n, r.queryKey) && Object.assign(u, r.defaultOptions);
    }), u;
  }
  setMutationDefaults(n, i) {
    this.#l.set(Na(n), {
      mutationKey: n,
      defaultOptions: i
    });
  }
  getMutationDefaults(n) {
    const i = [...this.#l.values()], u = {};
    return i.forEach((r) => {
      xl(n, r.mutationKey) && Object.assign(u, r.defaultOptions);
    }), u;
  }
  defaultQueryOptions(n) {
    if (n._defaulted)
      return n;
    const i = {
      ...this.#n.queries,
      ...this.getQueryDefaults(n.queryKey),
      ...n,
      _defaulted: !0
    };
    return i.queryHash || (i.queryHash = Pc(
      i.queryKey,
      i
    )), i.refetchOnReconnect === void 0 && (i.refetchOnReconnect = i.networkMode !== "always"), i.throwOnError === void 0 && (i.throwOnError = !!i.suspense), !i.networkMode && i.persister && (i.networkMode = "offlineFirst"), i.queryFn === eo && (i.enabled = !1), i;
  }
  defaultMutationOptions(n) {
    return n?._defaulted ? n : {
      ...this.#n.mutations,
      ...n?.mutationKey && this.getMutationDefaults(n.mutationKey),
      ...n,
      _defaulted: !0
    };
  }
  clear() {
    this.#e.clear(), this.#t.clear();
  }
}, jp = J.createContext(
  void 0
), xi = (n) => {
  const i = J.useContext(jp);
  if (!i)
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  return i;
}, hb = ({
  client: n,
  children: i
}) => (J.useEffect(() => (n.mount(), () => {
  n.unmount();
}), [n]), /* @__PURE__ */ m.jsx(jp.Provider, { value: n, children: i })), xp = J.createContext(!1), mb = () => J.useContext(xp);
xp.Provider;
function pb() {
  let n = !1;
  return {
    clearReset: () => {
      n = !1;
    },
    reset: () => {
      n = !0;
    },
    isReset: () => n
  };
}
var vb = J.createContext(pb()), yb = () => J.useContext(vb), gb = (n, i, u) => {
  const r = u?.state.error && typeof n.throwOnError == "function" ? to(n.throwOnError, [u.state.error, u]) : n.throwOnError;
  (n.suspense || n.experimental_prefetchInRender || r) && (i.isReset() || (n.retryOnMount = !1));
}, bb = (n) => {
  J.useEffect(() => {
    n.clearReset();
  }, [n]);
}, _b = ({
  result: n,
  errorResetBoundary: i,
  throwOnError: u,
  query: r,
  suspense: o
}) => n.isError && !i.isReset() && !n.isFetching && r && (o && n.data === void 0 || to(u, [n.error, r])), Sb = (n) => {
  if (n.suspense) {
    const u = (o) => o === "static" ? o : Math.max(o ?? 1e3, 1e3), r = n.staleTime;
    n.staleTime = typeof r == "function" ? (...o) => u(r(...o)) : u(r), typeof n.gcTime == "number" && (n.gcTime = Math.max(
      n.gcTime,
      1e3
    ));
  }
}, zb = (n, i) => n.isLoading && n.isFetching && !i, wb = (n, i) => n?.suspense && i.isPending, Um = (n, i, u) => i.fetchOptimistic(n).catch(() => {
  u.clearReset();
});
function jb(n, i, u) {
  const r = mb(), o = yb(), h = xi(), d = h.defaultQueryOptions(n);
  h.getDefaultOptions().queries?._experimental_beforeQuery?.(
    d
  );
  const v = h.getQueryCache().get(d.queryHash), y = n.subscribed !== !1;
  d._optimisticResults = r ? "isRestoring" : y ? "optimistic" : void 0, Sb(d), gb(d, o, v), bb(o);
  const g = !h.getQueryCache().get(d.queryHash), [_] = J.useState(
    () => new i(
      h,
      d
    )
  ), j = _.getOptimisticResult(d), S = !r && y;
  if (J.useSyncExternalStore(
    J.useCallback(
      (A) => {
        const C = S ? _.subscribe(et.batchCalls(A)) : ht;
        return _.updateResult(), C;
      },
      [_, S]
    ),
    () => _.getCurrentResult(),
    () => _.getCurrentResult()
  ), J.useEffect(() => {
    _.setOptions(d);
  }, [d, _]), wb(d, j))
    throw Um(d, _, o);
  if (_b({
    result: j,
    errorResetBoundary: o,
    throwOnError: d.throwOnError,
    query: v,
    suspense: d.suspense
  }))
    throw j.error;
  return h.getDefaultOptions().queries?._experimental_afterQuery?.(
    d,
    j
  ), d.experimental_prefetchInRender && !El.isServer() && zb(j, r) && (g ? (
    // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
    Um(d, _, o)
  ) : (
    // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
    v?.promise
  ))?.catch(ht).finally(() => {
    _.updateResult();
  }), d.notifyOnChangeProps ? j : _.trackResult(j);
}
function Tn(n, i) {
  return jb(n, lb);
}
function Kt(n, i) {
  const u = xi(), [r] = J.useState(
    () => new ob(
      u,
      n
    )
  );
  J.useEffect(() => {
    r.setOptions(n);
  }, [r, n]);
  const o = J.useSyncExternalStore(
    J.useCallback(
      (d) => r.subscribe(et.batchCalls(d)),
      [r]
    ),
    () => r.getCurrentResult(),
    () => r.getCurrentResult()
  ), h = J.useCallback(
    (d, v) => {
      r.mutate(d, v).catch(ht);
    },
    [r]
  );
  if (o.error && to(r.options.throwOnError, [o.error]))
    throw o.error;
  return { ...o, mutate: h, mutateAsync: o.mutate };
}
var Zm;
function q(n, i, u) {
  function r(v, y) {
    if (v._zod || Object.defineProperty(v, "_zod", {
      value: {
        def: y,
        constr: d,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), v._zod.traits.has(n))
      return;
    v._zod.traits.add(n), i(v, y);
    const g = d.prototype, _ = Object.keys(g);
    for (let j = 0; j < _.length; j++) {
      const S = _[j];
      S in v || (v[S] = g[S].bind(v));
    }
  }
  const o = u?.Parent ?? Object;
  class h extends o {
  }
  Object.defineProperty(h, "name", { value: n });
  function d(v) {
    var y;
    const g = u?.Parent ? new h() : this;
    r(g, v), (y = g._zod).deferred ?? (y.deferred = []);
    for (const _ of g._zod.deferred)
      _();
    return g;
  }
  return Object.defineProperty(d, "init", { value: r }), Object.defineProperty(d, Symbol.hasInstance, {
    value: (v) => u?.Parent && v instanceof u.Parent ? !0 : v?._zod?.traits?.has(n)
  }), Object.defineProperty(d, "name", { value: n }), d;
}
class _i extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Ep extends Error {
  constructor(i) {
    super(`Encountered unidirectional transform during encode: ${i}`), this.name = "ZodEncodeError";
  }
}
(Zm = globalThis).__zod_globalConfig ?? (Zm.__zod_globalConfig = {});
const ao = globalThis.__zod_globalConfig;
function An(n) {
  return ao;
}
function Tp(n) {
  const i = Object.values(n).filter((r) => typeof r == "number");
  return Object.entries(n).filter(([r, o]) => i.indexOf(+r) === -1).map(([r, o]) => o);
}
function Lc(n, i) {
  return typeof i == "bigint" ? i.toString() : i;
}
function io(n) {
  return {
    get value() {
      {
        const i = n();
        return Object.defineProperty(this, "value", { value: i }), i;
      }
    }
  };
}
function lo(n) {
  return n == null;
}
function uo(n) {
  const i = n.startsWith("^") ? 1 : 0, u = n.endsWith("$") ? n.length - 1 : n.length;
  return n.slice(i, u);
}
function xb(n, i) {
  const u = n / i, r = Math.round(u), o = Number.EPSILON * Math.max(Math.abs(u), 1);
  return Math.abs(u - r) < o ? 0 : u - r;
}
const Qm = /* @__PURE__ */ Symbol("evaluating");
function Oe(n, i, u) {
  let r;
  Object.defineProperty(n, i, {
    get() {
      if (r !== Qm)
        return r === void 0 && (r = Qm, r = u()), r;
    },
    set(o) {
      Object.defineProperty(n, i, {
        value: o
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function Da(n, i, u) {
  Object.defineProperty(n, i, {
    value: u,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function sa(...n) {
  const i = {};
  for (const u of n) {
    const r = Object.getOwnPropertyDescriptors(u);
    Object.assign(i, r);
  }
  return Object.defineProperties({}, i);
}
function Hm(n) {
  return JSON.stringify(n);
}
function Eb(n) {
  return n.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Ap = "captureStackTrace" in Error ? Error.captureStackTrace : (...n) => {
};
function ns(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
const Tb = /* @__PURE__ */ io(() => {
  if (ao.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const n = Function;
    return new n(""), !0;
  } catch {
    return !1;
  }
});
function wi(n) {
  if (ns(n) === !1)
    return !1;
  const i = n.constructor;
  if (i === void 0 || typeof i != "function")
    return !0;
  const u = i.prototype;
  return !(ns(u) === !1 || Object.prototype.hasOwnProperty.call(u, "isPrototypeOf") === !1);
}
function Op(n) {
  return wi(n) ? { ...n } : Array.isArray(n) ? [...n] : n instanceof Map ? new Map(n) : n instanceof Set ? new Set(n) : n;
}
const Ab = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function ss(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ra(n, i, u) {
  const r = new n._zod.constr(i ?? n._zod.def);
  return (!i || u?.parent) && (r._zod.parent = n), r;
}
function P(n) {
  const i = n;
  if (!i)
    return {};
  if (typeof i == "string")
    return { error: () => i };
  if (i?.message !== void 0) {
    if (i?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    i.error = i.message;
  }
  return delete i.message, typeof i.error == "string" ? { ...i, error: () => i.error } : i;
}
function Ob(n) {
  return Object.keys(n).filter((i) => n[i]._zod.optin === "optional" && n[i]._zod.optout === "optional");
}
const Nb = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function Cb(n, i) {
  const u = n._zod.def, r = u.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const h = sa(n._zod.def, {
    get shape() {
      const d = {};
      for (const v in i) {
        if (!(v in u.shape))
          throw new Error(`Unrecognized key: "${v}"`);
        i[v] && (d[v] = u.shape[v]);
      }
      return Da(this, "shape", d), d;
    },
    checks: []
  });
  return ra(n, h);
}
function Mb(n, i) {
  const u = n._zod.def, r = u.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const h = sa(n._zod.def, {
    get shape() {
      const d = { ...n._zod.def.shape };
      for (const v in i) {
        if (!(v in u.shape))
          throw new Error(`Unrecognized key: "${v}"`);
        i[v] && delete d[v];
      }
      return Da(this, "shape", d), d;
    },
    checks: []
  });
  return ra(n, h);
}
function Db(n, i) {
  if (!wi(i))
    throw new Error("Invalid input to extend: expected a plain object");
  const u = n._zod.def.checks;
  if (u && u.length > 0) {
    const h = n._zod.def.shape;
    for (const d in i)
      if (Object.getOwnPropertyDescriptor(h, d) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const o = sa(n._zod.def, {
    get shape() {
      const h = { ...n._zod.def.shape, ...i };
      return Da(this, "shape", h), h;
    }
  });
  return ra(n, o);
}
function Rb(n, i) {
  if (!wi(i))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const u = sa(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i };
      return Da(this, "shape", r), r;
    }
  });
  return ra(n, u);
}
function qb(n, i) {
  if (n._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const u = sa(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i._zod.def.shape };
      return Da(this, "shape", r), r;
    },
    get catchall() {
      return i._zod.def.catchall;
    },
    checks: i._zod.def.checks ?? []
  });
  return ra(n, u);
}
function Ub(n, i, u) {
  const o = i._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const d = sa(i._zod.def, {
    get shape() {
      const v = i._zod.def.shape, y = { ...v };
      if (u)
        for (const g in u) {
          if (!(g in v))
            throw new Error(`Unrecognized key: "${g}"`);
          u[g] && (y[g] = n ? new n({
            type: "optional",
            innerType: v[g]
          }) : v[g]);
        }
      else
        for (const g in v)
          y[g] = n ? new n({
            type: "optional",
            innerType: v[g]
          }) : v[g];
      return Da(this, "shape", y), y;
    },
    checks: []
  });
  return ra(i, d);
}
function Zb(n, i, u) {
  const r = sa(i._zod.def, {
    get shape() {
      const o = i._zod.def.shape, h = { ...o };
      if (u)
        for (const d in u) {
          if (!(d in h))
            throw new Error(`Unrecognized key: "${d}"`);
          u[d] && (h[d] = new n({
            type: "nonoptional",
            innerType: o[d]
          }));
        }
      else
        for (const d in o)
          h[d] = new n({
            type: "nonoptional",
            innerType: o[d]
          });
      return Da(this, "shape", h), h;
    }
  });
  return ra(i, r);
}
function gi(n, i = 0) {
  if (n.aborted === !0)
    return !0;
  for (let u = i; u < n.issues.length; u++)
    if (n.issues[u]?.continue !== !0)
      return !0;
  return !1;
}
function Qb(n, i = 0) {
  if (n.aborted === !0)
    return !0;
  for (let u = i; u < n.issues.length; u++)
    if (n.issues[u]?.continue === !1)
      return !0;
  return !1;
}
function bi(n, i) {
  return i.map((u) => {
    var r;
    return (r = u).path ?? (r.path = []), u.path.unshift(n), u;
  });
}
function Xu(n) {
  return typeof n == "string" ? n : n?.message;
}
function On(n, i, u) {
  const r = n.message ? n.message : Xu(n.inst?._zod.def?.error?.(n)) ?? Xu(i?.error?.(n)) ?? Xu(u.customError?.(n)) ?? Xu(u.localeError?.(n)) ?? "Invalid input", { inst: o, continue: h, input: d, ...v } = n;
  return v.path ?? (v.path = []), v.message = r, i?.reportInput && (v.input = d), v;
}
function so(n) {
  return Array.isArray(n) ? "array" : typeof n == "string" ? "string" : "unknown";
}
function Tl(...n) {
  const [i, u, r] = n;
  return typeof i == "string" ? {
    message: i,
    code: "custom",
    input: u,
    inst: r
  } : { ...i };
}
const Np = (n, i) => {
  n.name = "$ZodError", Object.defineProperty(n, "_zod", {
    value: n._zod,
    enumerable: !1
  }), Object.defineProperty(n, "issues", {
    value: i,
    enumerable: !1
  }), n.message = JSON.stringify(i, Lc, 2), Object.defineProperty(n, "toString", {
    value: () => n.message,
    enumerable: !1
  });
}, Cp = q("$ZodError", Np), Mp = q("$ZodError", Np, { Parent: Error });
function Hb(n, i = (u) => u.message) {
  const u = {}, r = [];
  for (const o of n.issues)
    o.path.length > 0 ? (u[o.path[0]] = u[o.path[0]] || [], u[o.path[0]].push(i(o))) : r.push(i(o));
  return { formErrors: r, fieldErrors: u };
}
function Bb(n, i = (u) => u.message) {
  const u = { _errors: [] }, r = (o, h = []) => {
    for (const d of o.issues)
      if (d.code === "invalid_union" && d.errors.length)
        d.errors.map((v) => r({ issues: v }, [...h, ...d.path]));
      else if (d.code === "invalid_key")
        r({ issues: d.issues }, [...h, ...d.path]);
      else if (d.code === "invalid_element")
        r({ issues: d.issues }, [...h, ...d.path]);
      else {
        const v = [...h, ...d.path];
        if (v.length === 0)
          u._errors.push(i(d));
        else {
          let y = u, g = 0;
          for (; g < v.length; ) {
            const _ = v[g];
            g === v.length - 1 ? (y[_] = y[_] || { _errors: [] }, y[_]._errors.push(i(d))) : y[_] = y[_] || { _errors: [] }, y = y[_], g++;
          }
        }
      }
  };
  return r(n), u;
}
const ro = (n) => (i, u, r, o) => {
  const h = r ? { ...r, async: !1 } : { async: !1 }, d = i._zod.run({ value: u, issues: [] }, h);
  if (d instanceof Promise)
    throw new _i();
  if (d.issues.length) {
    const v = new (o?.Err ?? n)(d.issues.map((y) => On(y, h, An())));
    throw Ap(v, o?.callee), v;
  }
  return d.value;
}, co = (n) => async (i, u, r, o) => {
  const h = r ? { ...r, async: !0 } : { async: !0 };
  let d = i._zod.run({ value: u, issues: [] }, h);
  if (d instanceof Promise && (d = await d), d.issues.length) {
    const v = new (o?.Err ?? n)(d.issues.map((y) => On(y, h, An())));
    throw Ap(v, o?.callee), v;
  }
  return d.value;
}, rs = (n) => (i, u, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, h = i._zod.run({ value: u, issues: [] }, o);
  if (h instanceof Promise)
    throw new _i();
  return h.issues.length ? {
    success: !1,
    error: new (n ?? Cp)(h.issues.map((d) => On(d, o, An())))
  } : { success: !0, data: h.value };
}, $b = /* @__PURE__ */ rs(Mp), cs = (n) => async (i, u, r) => {
  const o = r ? { ...r, async: !0 } : { async: !0 };
  let h = i._zod.run({ value: u, issues: [] }, o);
  return h instanceof Promise && (h = await h), h.issues.length ? {
    success: !1,
    error: new n(h.issues.map((d) => On(d, o, An())))
  } : { success: !0, data: h.value };
}, kb = /* @__PURE__ */ cs(Mp), Lb = (n) => (i, u, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return ro(n)(i, u, o);
}, Gb = (n) => (i, u, r) => ro(n)(i, u, r), Yb = (n) => async (i, u, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return co(n)(i, u, o);
}, Kb = (n) => async (i, u, r) => co(n)(i, u, r), Xb = (n) => (i, u, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return rs(n)(i, u, o);
}, Vb = (n) => (i, u, r) => rs(n)(i, u, r), Jb = (n) => async (i, u, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return cs(n)(i, u, o);
}, Fb = (n) => async (i, u, r) => cs(n)(i, u, r), Ib = /^[cC][0-9a-z]{6,}$/, Wb = /^[0-9a-z]+$/, Pb = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, e0 = /^[0-9a-vA-V]{20}$/, t0 = /^[A-Za-z0-9]{27}$/, n0 = /^[a-zA-Z0-9_-]{21}$/, a0 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, i0 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Bm = (n) => n ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${n}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, l0 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, u0 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function s0() {
  return new RegExp(u0, "u");
}
const r0 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, c0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, o0 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, f0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, d0 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Dp = /^[A-Za-z0-9_-]*$/, h0 = /^https?$/, m0 = /^\+[1-9]\d{6,14}$/, Rp = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", p0 = /* @__PURE__ */ new RegExp(`^${Rp}$`);
function qp(n) {
  const i = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof n.precision == "number" ? n.precision === -1 ? `${i}` : n.precision === 0 ? `${i}:[0-5]\\d` : `${i}:[0-5]\\d\\.\\d{${n.precision}}` : `${i}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function v0(n) {
  return new RegExp(`^${qp(n)}$`);
}
function y0(n) {
  const i = qp({ precision: n.precision }), u = ["Z"];
  n.local && u.push(""), n.offset && u.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${i}(?:${u.join("|")})`;
  return new RegExp(`^${Rp}T(?:${r})$`);
}
const g0 = (n) => {
  const i = n ? `[\\s\\S]{${n?.minimum ?? 0},${n?.maximum ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${i}$`);
}, b0 = /^-?\d+$/, Up = /^-?\d+(?:\.\d+)?$/, _0 = /^(?:true|false)$/i, S0 = /^null$/i, z0 = /^undefined$/i, w0 = /^[^A-Z]*$/, j0 = /^[^a-z]*$/, St = /* @__PURE__ */ q("$ZodCheck", (n, i) => {
  var u;
  n._zod ?? (n._zod = {}), n._zod.def = i, (u = n._zod).onattach ?? (u.onattach = []);
}), Zp = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Qp = /* @__PURE__ */ q("$ZodCheckLessThan", (n, i) => {
  St.init(n, i);
  const u = Zp[typeof i.value];
  n._zod.onattach.push((r) => {
    const o = r._zod.bag, h = (i.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    i.value < h && (i.inclusive ? o.maximum = i.value : o.exclusiveMaximum = i.value);
  }), n._zod.check = (r) => {
    (i.inclusive ? r.value <= i.value : r.value < i.value) || r.issues.push({
      origin: u,
      code: "too_big",
      maximum: typeof i.value == "object" ? i.value.getTime() : i.value,
      input: r.value,
      inclusive: i.inclusive,
      inst: n,
      continue: !i.abort
    });
  };
}), Hp = /* @__PURE__ */ q("$ZodCheckGreaterThan", (n, i) => {
  St.init(n, i);
  const u = Zp[typeof i.value];
  n._zod.onattach.push((r) => {
    const o = r._zod.bag, h = (i.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    i.value > h && (i.inclusive ? o.minimum = i.value : o.exclusiveMinimum = i.value);
  }), n._zod.check = (r) => {
    (i.inclusive ? r.value >= i.value : r.value > i.value) || r.issues.push({
      origin: u,
      code: "too_small",
      minimum: typeof i.value == "object" ? i.value.getTime() : i.value,
      input: r.value,
      inclusive: i.inclusive,
      inst: n,
      continue: !i.abort
    });
  };
}), x0 = /* @__PURE__ */ q("$ZodCheckMultipleOf", (n, i) => {
  St.init(n, i), n._zod.onattach.push((u) => {
    var r;
    (r = u._zod.bag).multipleOf ?? (r.multipleOf = i.value);
  }), n._zod.check = (u) => {
    if (typeof u.value != typeof i.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof u.value == "bigint" ? u.value % i.value === BigInt(0) : xb(u.value, i.value) === 0) || u.issues.push({
      origin: typeof u.value,
      code: "not_multiple_of",
      divisor: i.value,
      input: u.value,
      inst: n,
      continue: !i.abort
    });
  };
}), E0 = /* @__PURE__ */ q("$ZodCheckNumberFormat", (n, i) => {
  St.init(n, i), i.format = i.format || "float64";
  const u = i.format?.includes("int"), r = u ? "int" : "number", [o, h] = Nb[i.format];
  n._zod.onattach.push((d) => {
    const v = d._zod.bag;
    v.format = i.format, v.minimum = o, v.maximum = h, u && (v.pattern = b0);
  }), n._zod.check = (d) => {
    const v = d.value;
    if (u) {
      if (!Number.isInteger(v)) {
        d.issues.push({
          expected: r,
          format: i.format,
          code: "invalid_type",
          continue: !1,
          input: v,
          inst: n
        });
        return;
      }
      if (!Number.isSafeInteger(v)) {
        v > 0 ? d.issues.push({
          input: v,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: n,
          origin: r,
          inclusive: !0,
          continue: !i.abort
        }) : d.issues.push({
          input: v,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: n,
          origin: r,
          inclusive: !0,
          continue: !i.abort
        });
        return;
      }
    }
    v < o && d.issues.push({
      origin: "number",
      input: v,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: n,
      continue: !i.abort
    }), v > h && d.issues.push({
      origin: "number",
      input: v,
      code: "too_big",
      maximum: h,
      inclusive: !0,
      inst: n,
      continue: !i.abort
    });
  };
}), T0 = /* @__PURE__ */ q("$ZodCheckMaxLength", (n, i) => {
  var u;
  St.init(n, i), (u = n._zod.def).when ?? (u.when = (r) => {
    const o = r.value;
    return !lo(o) && o.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    i.maximum < o && (r._zod.bag.maximum = i.maximum);
  }), n._zod.check = (r) => {
    const o = r.value;
    if (o.length <= i.maximum)
      return;
    const d = so(o);
    r.issues.push({
      origin: d,
      code: "too_big",
      maximum: i.maximum,
      inclusive: !0,
      input: o,
      inst: n,
      continue: !i.abort
    });
  };
}), A0 = /* @__PURE__ */ q("$ZodCheckMinLength", (n, i) => {
  var u;
  St.init(n, i), (u = n._zod.def).when ?? (u.when = (r) => {
    const o = r.value;
    return !lo(o) && o.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    i.minimum > o && (r._zod.bag.minimum = i.minimum);
  }), n._zod.check = (r) => {
    const o = r.value;
    if (o.length >= i.minimum)
      return;
    const d = so(o);
    r.issues.push({
      origin: d,
      code: "too_small",
      minimum: i.minimum,
      inclusive: !0,
      input: o,
      inst: n,
      continue: !i.abort
    });
  };
}), O0 = /* @__PURE__ */ q("$ZodCheckLengthEquals", (n, i) => {
  var u;
  St.init(n, i), (u = n._zod.def).when ?? (u.when = (r) => {
    const o = r.value;
    return !lo(o) && o.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.minimum = i.length, o.maximum = i.length, o.length = i.length;
  }), n._zod.check = (r) => {
    const o = r.value, h = o.length;
    if (h === i.length)
      return;
    const d = so(o), v = h > i.length;
    r.issues.push({
      origin: d,
      ...v ? { code: "too_big", maximum: i.length } : { code: "too_small", minimum: i.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: n,
      continue: !i.abort
    });
  };
}), os = /* @__PURE__ */ q("$ZodCheckStringFormat", (n, i) => {
  var u, r;
  St.init(n, i), n._zod.onattach.push((o) => {
    const h = o._zod.bag;
    h.format = i.format, i.pattern && (h.patterns ?? (h.patterns = /* @__PURE__ */ new Set()), h.patterns.add(i.pattern));
  }), i.pattern ? (u = n._zod).check ?? (u.check = (o) => {
    i.pattern.lastIndex = 0, !i.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: i.format,
      input: o.value,
      ...i.pattern ? { pattern: i.pattern.toString() } : {},
      inst: n,
      continue: !i.abort
    });
  }) : (r = n._zod).check ?? (r.check = () => {
  });
}), N0 = /* @__PURE__ */ q("$ZodCheckRegex", (n, i) => {
  os.init(n, i), n._zod.check = (u) => {
    i.pattern.lastIndex = 0, !i.pattern.test(u.value) && u.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: u.value,
      pattern: i.pattern.toString(),
      inst: n,
      continue: !i.abort
    });
  };
}), C0 = /* @__PURE__ */ q("$ZodCheckLowerCase", (n, i) => {
  i.pattern ?? (i.pattern = w0), os.init(n, i);
}), M0 = /* @__PURE__ */ q("$ZodCheckUpperCase", (n, i) => {
  i.pattern ?? (i.pattern = j0), os.init(n, i);
}), D0 = /* @__PURE__ */ q("$ZodCheckIncludes", (n, i) => {
  St.init(n, i);
  const u = ss(i.includes), r = new RegExp(typeof i.position == "number" ? `^.{${i.position}}${u}` : u);
  i.pattern = r, n._zod.onattach.push((o) => {
    const h = o._zod.bag;
    h.patterns ?? (h.patterns = /* @__PURE__ */ new Set()), h.patterns.add(r);
  }), n._zod.check = (o) => {
    o.value.includes(i.includes, i.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: i.includes,
      input: o.value,
      inst: n,
      continue: !i.abort
    });
  };
}), R0 = /* @__PURE__ */ q("$ZodCheckStartsWith", (n, i) => {
  St.init(n, i);
  const u = new RegExp(`^${ss(i.prefix)}.*`);
  i.pattern ?? (i.pattern = u), n._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(u);
  }), n._zod.check = (r) => {
    r.value.startsWith(i.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: i.prefix,
      input: r.value,
      inst: n,
      continue: !i.abort
    });
  };
}), q0 = /* @__PURE__ */ q("$ZodCheckEndsWith", (n, i) => {
  St.init(n, i);
  const u = new RegExp(`.*${ss(i.suffix)}$`);
  i.pattern ?? (i.pattern = u), n._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(u);
  }), n._zod.check = (r) => {
    r.value.endsWith(i.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: i.suffix,
      input: r.value,
      inst: n,
      continue: !i.abort
    });
  };
}), U0 = /* @__PURE__ */ q("$ZodCheckOverwrite", (n, i) => {
  St.init(n, i), n._zod.check = (u) => {
    u.value = i.tx(u.value);
  };
});
class Z0 {
  constructor(i = []) {
    this.content = [], this.indent = 0, this && (this.args = i);
  }
  indented(i) {
    this.indent += 1, i(this), this.indent -= 1;
  }
  write(i) {
    if (typeof i == "function") {
      i(this, { execution: "sync" }), i(this, { execution: "async" });
      return;
    }
    const r = i.split(`
`).filter((d) => d), o = Math.min(...r.map((d) => d.length - d.trimStart().length)), h = r.map((d) => d.slice(o)).map((d) => " ".repeat(this.indent * 2) + d);
    for (const d of h)
      this.content.push(d);
  }
  compile() {
    const i = Function, u = this?.args, o = [...(this?.content ?? [""]).map((h) => `  ${h}`)];
    return new i(...u, o.join(`
`));
  }
}
const Q0 = {
  major: 4,
  minor: 4,
  patch: 3
}, qe = /* @__PURE__ */ q("$ZodType", (n, i) => {
  var u;
  n ?? (n = {}), n._zod.def = i, n._zod.bag = n._zod.bag || {}, n._zod.version = Q0;
  const r = [...n._zod.def.checks ?? []];
  n._zod.traits.has("$ZodCheck") && r.unshift(n);
  for (const o of r)
    for (const h of o._zod.onattach)
      h(n);
  if (r.length === 0)
    (u = n._zod).deferred ?? (u.deferred = []), n._zod.deferred?.push(() => {
      n._zod.run = n._zod.parse;
    });
  else {
    const o = (d, v, y) => {
      let g = gi(d), _;
      for (const j of v) {
        if (j._zod.def.when) {
          if (Qb(d) || !j._zod.def.when(d))
            continue;
        } else if (g)
          continue;
        const S = d.issues.length, A = j._zod.check(d);
        if (A instanceof Promise && y?.async === !1)
          throw new _i();
        if (_ || A instanceof Promise)
          _ = (_ ?? Promise.resolve()).then(async () => {
            await A, d.issues.length !== S && (g || (g = gi(d, S)));
          });
        else {
          if (d.issues.length === S)
            continue;
          g || (g = gi(d, S));
        }
      }
      return _ ? _.then(() => d) : d;
    }, h = (d, v, y) => {
      if (gi(d))
        return d.aborted = !0, d;
      const g = o(v, r, y);
      if (g instanceof Promise) {
        if (y.async === !1)
          throw new _i();
        return g.then((_) => n._zod.parse(_, y));
      }
      return n._zod.parse(g, y);
    };
    n._zod.run = (d, v) => {
      if (v.skipChecks)
        return n._zod.parse(d, v);
      if (v.direction === "backward") {
        const g = n._zod.parse({ value: d.value, issues: [] }, { ...v, skipChecks: !0 });
        return g instanceof Promise ? g.then((_) => h(_, d, v)) : h(g, d, v);
      }
      const y = n._zod.parse(d, v);
      if (y instanceof Promise) {
        if (v.async === !1)
          throw new _i();
        return y.then((g) => o(g, r, v));
      }
      return o(y, r, v);
    };
  }
  Oe(n, "~standard", () => ({
    validate: (o) => {
      try {
        const h = $b(n, o);
        return h.success ? { value: h.data } : { issues: h.error?.issues };
      } catch {
        return kb(n, o).then((d) => d.success ? { value: d.data } : { issues: d.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), oo = /* @__PURE__ */ q("$ZodString", (n, i) => {
  qe.init(n, i), n._zod.pattern = [...n?._zod.bag?.patterns ?? []].pop() ?? g0(n._zod.bag), n._zod.parse = (u, r) => {
    if (i.coerce)
      try {
        u.value = String(u.value);
      } catch {
      }
    return typeof u.value == "string" || u.issues.push({
      expected: "string",
      code: "invalid_type",
      input: u.value,
      inst: n
    }), u;
  };
}), Ue = /* @__PURE__ */ q("$ZodStringFormat", (n, i) => {
  os.init(n, i), oo.init(n, i);
}), H0 = /* @__PURE__ */ q("$ZodGUID", (n, i) => {
  i.pattern ?? (i.pattern = i0), Ue.init(n, i);
}), B0 = /* @__PURE__ */ q("$ZodUUID", (n, i) => {
  if (i.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[i.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${i.version}"`);
    i.pattern ?? (i.pattern = Bm(r));
  } else
    i.pattern ?? (i.pattern = Bm());
  Ue.init(n, i);
}), $0 = /* @__PURE__ */ q("$ZodEmail", (n, i) => {
  i.pattern ?? (i.pattern = l0), Ue.init(n, i);
}), k0 = /* @__PURE__ */ q("$ZodURL", (n, i) => {
  Ue.init(n, i), n._zod.check = (u) => {
    try {
      const r = u.value.trim();
      if (!i.normalize && i.protocol?.source === h0.source && !/^https?:\/\//i.test(r)) {
        u.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: u.value,
          inst: n,
          continue: !i.abort
        });
        return;
      }
      const o = new URL(r);
      i.hostname && (i.hostname.lastIndex = 0, i.hostname.test(o.hostname) || u.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: i.hostname.source,
        input: u.value,
        inst: n,
        continue: !i.abort
      })), i.protocol && (i.protocol.lastIndex = 0, i.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) || u.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: i.protocol.source,
        input: u.value,
        inst: n,
        continue: !i.abort
      })), i.normalize ? u.value = o.href : u.value = r;
      return;
    } catch {
      u.issues.push({
        code: "invalid_format",
        format: "url",
        input: u.value,
        inst: n,
        continue: !i.abort
      });
    }
  };
}), L0 = /* @__PURE__ */ q("$ZodEmoji", (n, i) => {
  i.pattern ?? (i.pattern = s0()), Ue.init(n, i);
}), G0 = /* @__PURE__ */ q("$ZodNanoID", (n, i) => {
  i.pattern ?? (i.pattern = n0), Ue.init(n, i);
}), Y0 = /* @__PURE__ */ q("$ZodCUID", (n, i) => {
  i.pattern ?? (i.pattern = Ib), Ue.init(n, i);
}), K0 = /* @__PURE__ */ q("$ZodCUID2", (n, i) => {
  i.pattern ?? (i.pattern = Wb), Ue.init(n, i);
}), X0 = /* @__PURE__ */ q("$ZodULID", (n, i) => {
  i.pattern ?? (i.pattern = Pb), Ue.init(n, i);
}), V0 = /* @__PURE__ */ q("$ZodXID", (n, i) => {
  i.pattern ?? (i.pattern = e0), Ue.init(n, i);
}), J0 = /* @__PURE__ */ q("$ZodKSUID", (n, i) => {
  i.pattern ?? (i.pattern = t0), Ue.init(n, i);
}), F0 = /* @__PURE__ */ q("$ZodISODateTime", (n, i) => {
  i.pattern ?? (i.pattern = y0(i)), Ue.init(n, i);
}), I0 = /* @__PURE__ */ q("$ZodISODate", (n, i) => {
  i.pattern ?? (i.pattern = p0), Ue.init(n, i);
}), W0 = /* @__PURE__ */ q("$ZodISOTime", (n, i) => {
  i.pattern ?? (i.pattern = v0(i)), Ue.init(n, i);
}), P0 = /* @__PURE__ */ q("$ZodISODuration", (n, i) => {
  i.pattern ?? (i.pattern = a0), Ue.init(n, i);
}), e_ = /* @__PURE__ */ q("$ZodIPv4", (n, i) => {
  i.pattern ?? (i.pattern = r0), Ue.init(n, i), n._zod.bag.format = "ipv4";
}), t_ = /* @__PURE__ */ q("$ZodIPv6", (n, i) => {
  i.pattern ?? (i.pattern = c0), Ue.init(n, i), n._zod.bag.format = "ipv6", n._zod.check = (u) => {
    try {
      new URL(`http://[${u.value}]`);
    } catch {
      u.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: u.value,
        inst: n,
        continue: !i.abort
      });
    }
  };
}), n_ = /* @__PURE__ */ q("$ZodCIDRv4", (n, i) => {
  i.pattern ?? (i.pattern = o0), Ue.init(n, i);
}), a_ = /* @__PURE__ */ q("$ZodCIDRv6", (n, i) => {
  i.pattern ?? (i.pattern = f0), Ue.init(n, i), n._zod.check = (u) => {
    const r = u.value.split("/");
    try {
      if (r.length !== 2)
        throw new Error();
      const [o, h] = r;
      if (!h)
        throw new Error();
      const d = Number(h);
      if (`${d}` !== h)
        throw new Error();
      if (d < 0 || d > 128)
        throw new Error();
      new URL(`http://[${o}]`);
    } catch {
      u.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: u.value,
        inst: n,
        continue: !i.abort
      });
    }
  };
});
function Bp(n) {
  if (n === "")
    return !0;
  if (/\s/.test(n) || n.length % 4 !== 0)
    return !1;
  try {
    return atob(n), !0;
  } catch {
    return !1;
  }
}
const i_ = /* @__PURE__ */ q("$ZodBase64", (n, i) => {
  i.pattern ?? (i.pattern = d0), Ue.init(n, i), n._zod.bag.contentEncoding = "base64", n._zod.check = (u) => {
    Bp(u.value) || u.issues.push({
      code: "invalid_format",
      format: "base64",
      input: u.value,
      inst: n,
      continue: !i.abort
    });
  };
});
function l_(n) {
  if (!Dp.test(n))
    return !1;
  const i = n.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), u = i.padEnd(Math.ceil(i.length / 4) * 4, "=");
  return Bp(u);
}
const u_ = /* @__PURE__ */ q("$ZodBase64URL", (n, i) => {
  i.pattern ?? (i.pattern = Dp), Ue.init(n, i), n._zod.bag.contentEncoding = "base64url", n._zod.check = (u) => {
    l_(u.value) || u.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: u.value,
      inst: n,
      continue: !i.abort
    });
  };
}), s_ = /* @__PURE__ */ q("$ZodE164", (n, i) => {
  i.pattern ?? (i.pattern = m0), Ue.init(n, i);
});
function r_(n, i = null) {
  try {
    const u = n.split(".");
    if (u.length !== 3)
      return !1;
    const [r] = u;
    if (!r)
      return !1;
    const o = JSON.parse(atob(r));
    return !("typ" in o && o?.typ !== "JWT" || !o.alg || i && (!("alg" in o) || o.alg !== i));
  } catch {
    return !1;
  }
}
const c_ = /* @__PURE__ */ q("$ZodJWT", (n, i) => {
  Ue.init(n, i), n._zod.check = (u) => {
    r_(u.value, i.alg) || u.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: u.value,
      inst: n,
      continue: !i.abort
    });
  };
}), $p = /* @__PURE__ */ q("$ZodNumber", (n, i) => {
  qe.init(n, i), n._zod.pattern = n._zod.bag.pattern ?? Up, n._zod.parse = (u, r) => {
    if (i.coerce)
      try {
        u.value = Number(u.value);
      } catch {
      }
    const o = u.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return u;
    const h = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
    return u.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: n,
      ...h ? { received: h } : {}
    }), u;
  };
}), o_ = /* @__PURE__ */ q("$ZodNumberFormat", (n, i) => {
  E0.init(n, i), $p.init(n, i);
}), f_ = /* @__PURE__ */ q("$ZodBoolean", (n, i) => {
  qe.init(n, i), n._zod.pattern = _0, n._zod.parse = (u, r) => {
    if (i.coerce)
      try {
        u.value = !!u.value;
      } catch {
      }
    const o = u.value;
    return typeof o == "boolean" || u.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: n
    }), u;
  };
}), d_ = /* @__PURE__ */ q("$ZodUndefined", (n, i) => {
  qe.init(n, i), n._zod.pattern = z0, n._zod.values = /* @__PURE__ */ new Set([void 0]), n._zod.parse = (u, r) => {
    const o = u.value;
    return typeof o > "u" || u.issues.push({
      expected: "undefined",
      code: "invalid_type",
      input: o,
      inst: n
    }), u;
  };
}), h_ = /* @__PURE__ */ q("$ZodNull", (n, i) => {
  qe.init(n, i), n._zod.pattern = S0, n._zod.values = /* @__PURE__ */ new Set([null]), n._zod.parse = (u, r) => {
    const o = u.value;
    return o === null || u.issues.push({
      expected: "null",
      code: "invalid_type",
      input: o,
      inst: n
    }), u;
  };
}), m_ = /* @__PURE__ */ q("$ZodUnknown", (n, i) => {
  qe.init(n, i), n._zod.parse = (u) => u;
}), p_ = /* @__PURE__ */ q("$ZodNever", (n, i) => {
  qe.init(n, i), n._zod.parse = (u, r) => (u.issues.push({
    expected: "never",
    code: "invalid_type",
    input: u.value,
    inst: n
  }), u);
});
function $m(n, i, u) {
  n.issues.length && i.issues.push(...bi(u, n.issues)), i.value[u] = n.value;
}
const v_ = /* @__PURE__ */ q("$ZodArray", (n, i) => {
  qe.init(n, i), n._zod.parse = (u, r) => {
    const o = u.value;
    if (!Array.isArray(o))
      return u.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: n
      }), u;
    u.value = Array(o.length);
    const h = [];
    for (let d = 0; d < o.length; d++) {
      const v = o[d], y = i.element._zod.run({
        value: v,
        issues: []
      }, r);
      y instanceof Promise ? h.push(y.then((g) => $m(g, u, d))) : $m(y, u, d);
    }
    return h.length ? Promise.all(h).then(() => u) : u;
  };
});
function as(n, i, u, r, o, h) {
  const d = u in r;
  if (n.issues.length) {
    if (o && h && !d)
      return;
    i.issues.push(...bi(u, n.issues));
  }
  if (!d && !o) {
    n.issues.length || i.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: void 0,
      path: [u]
    });
    return;
  }
  n.value === void 0 ? d && (i.value[u] = void 0) : i.value[u] = n.value;
}
function kp(n) {
  const i = Object.keys(n.shape);
  for (const r of i)
    if (!n.shape?.[r]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${r}": expected a Zod schema`);
  const u = Ob(n.shape);
  return {
    ...n,
    keys: i,
    keySet: new Set(i),
    numKeys: i.length,
    optionalKeys: new Set(u)
  };
}
function Lp(n, i, u, r, o, h) {
  const d = [], v = o.keySet, y = o.catchall._zod, g = y.def.type, _ = y.optin === "optional", j = y.optout === "optional";
  for (const S in i) {
    if (S === "__proto__" || v.has(S))
      continue;
    if (g === "never") {
      d.push(S);
      continue;
    }
    const A = y.run({ value: i[S], issues: [] }, r);
    A instanceof Promise ? n.push(A.then((C) => as(C, u, S, i, _, j))) : as(A, u, S, i, _, j);
  }
  return d.length && u.issues.push({
    code: "unrecognized_keys",
    keys: d,
    input: i,
    inst: h
  }), n.length ? Promise.all(n).then(() => u) : u;
}
const y_ = /* @__PURE__ */ q("$ZodObject", (n, i) => {
  if (qe.init(n, i), !Object.getOwnPropertyDescriptor(i, "shape")?.get) {
    const v = i.shape;
    Object.defineProperty(i, "shape", {
      get: () => {
        const y = { ...v };
        return Object.defineProperty(i, "shape", {
          value: y
        }), y;
      }
    });
  }
  const r = io(() => kp(i));
  Oe(n._zod, "propValues", () => {
    const v = i.shape, y = {};
    for (const g in v) {
      const _ = v[g]._zod;
      if (_.values) {
        y[g] ?? (y[g] = /* @__PURE__ */ new Set());
        for (const j of _.values)
          y[g].add(j);
      }
    }
    return y;
  });
  const o = ns, h = i.catchall;
  let d;
  n._zod.parse = (v, y) => {
    d ?? (d = r.value);
    const g = v.value;
    if (!o(g))
      return v.issues.push({
        expected: "object",
        code: "invalid_type",
        input: g,
        inst: n
      }), v;
    v.value = {};
    const _ = [], j = d.shape;
    for (const S of d.keys) {
      const A = j[S], C = A._zod.optin === "optional", M = A._zod.optout === "optional", G = A._zod.run({ value: g[S], issues: [] }, y);
      G instanceof Promise ? _.push(G.then((U) => as(U, v, S, g, C, M))) : as(G, v, S, g, C, M);
    }
    return h ? Lp(_, g, v, y, r.value, n) : _.length ? Promise.all(_).then(() => v) : v;
  };
}), g_ = /* @__PURE__ */ q("$ZodObjectJIT", (n, i) => {
  y_.init(n, i);
  const u = n._zod.parse, r = io(() => kp(i)), o = (S) => {
    const A = new Z0(["shape", "payload", "ctx"]), C = r.value, M = (ee) => {
      const L = Hm(ee);
      return `shape[${L}]._zod.run({ value: input[${L}], issues: [] }, ctx)`;
    };
    A.write("const input = payload.value;");
    const G = /* @__PURE__ */ Object.create(null);
    let U = 0;
    for (const ee of C.keys)
      G[ee] = `key_${U++}`;
    A.write("const newResult = {};");
    for (const ee of C.keys) {
      const L = G[ee], B = Hm(ee), ae = S[ee], F = ae?._zod?.optin === "optional", te = ae?._zod?.optout === "optional";
      A.write(`const ${L} = ${M(ee)};`), F && te ? A.write(`
        if (${L}.issues.length) {
          if (${B} in input) {
            payload.issues = payload.issues.concat(${L}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${B}, ...iss.path] : [${B}]
            })));
          }
        }
        
        if (${L}.value === undefined) {
          if (${B} in input) {
            newResult[${B}] = undefined;
          }
        } else {
          newResult[${B}] = ${L}.value;
        }
        
      `) : F ? A.write(`
        if (${L}.issues.length) {
          payload.issues = payload.issues.concat(${L}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${B}, ...iss.path] : [${B}]
          })));
        }
        
        if (${L}.value === undefined) {
          if (${B} in input) {
            newResult[${B}] = undefined;
          }
        } else {
          newResult[${B}] = ${L}.value;
        }
        
      `) : A.write(`
        const ${L}_present = ${B} in input;
        if (${L}.issues.length) {
          payload.issues = payload.issues.concat(${L}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${B}, ...iss.path] : [${B}]
          })));
        }
        if (!${L}_present && !${L}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${B}]
          });
        }

        if (${L}_present) {
          if (${L}.value === undefined) {
            newResult[${B}] = undefined;
          } else {
            newResult[${B}] = ${L}.value;
          }
        }

      `);
    }
    A.write("payload.value = newResult;"), A.write("return payload;");
    const I = A.compile();
    return (ee, L) => I(S, ee, L);
  };
  let h;
  const d = ns, v = !ao.jitless, g = v && Tb.value, _ = i.catchall;
  let j;
  n._zod.parse = (S, A) => {
    j ?? (j = r.value);
    const C = S.value;
    return d(C) ? v && g && A?.async === !1 && A.jitless !== !0 ? (h || (h = o(i.shape)), S = h(S, A), _ ? Lp([], C, S, A, j, n) : S) : u(S, A) : (S.issues.push({
      expected: "object",
      code: "invalid_type",
      input: C,
      inst: n
    }), S);
  };
});
function km(n, i, u, r) {
  for (const h of n)
    if (h.issues.length === 0)
      return i.value = h.value, i;
  const o = n.filter((h) => !gi(h));
  return o.length === 1 ? (i.value = o[0].value, o[0]) : (i.issues.push({
    code: "invalid_union",
    input: i.value,
    inst: u,
    errors: n.map((h) => h.issues.map((d) => On(d, r, An())))
  }), i);
}
const b_ = /* @__PURE__ */ q("$ZodUnion", (n, i) => {
  qe.init(n, i), Oe(n._zod, "optin", () => i.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), Oe(n._zod, "optout", () => i.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), Oe(n._zod, "values", () => {
    if (i.options.every((r) => r._zod.values))
      return new Set(i.options.flatMap((r) => Array.from(r._zod.values)));
  }), Oe(n._zod, "pattern", () => {
    if (i.options.every((r) => r._zod.pattern)) {
      const r = i.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${r.map((o) => uo(o.source)).join("|")})$`);
    }
  });
  const u = i.options.length === 1 ? i.options[0]._zod.run : null;
  n._zod.parse = (r, o) => {
    if (u)
      return u(r, o);
    let h = !1;
    const d = [];
    for (const v of i.options) {
      const y = v._zod.run({
        value: r.value,
        issues: []
      }, o);
      if (y instanceof Promise)
        d.push(y), h = !0;
      else {
        if (y.issues.length === 0)
          return y;
        d.push(y);
      }
    }
    return h ? Promise.all(d).then((v) => km(v, r, n, o)) : km(d, r, n, o);
  };
}), __ = /* @__PURE__ */ q("$ZodIntersection", (n, i) => {
  qe.init(n, i), n._zod.parse = (u, r) => {
    const o = u.value, h = i.left._zod.run({ value: o, issues: [] }, r), d = i.right._zod.run({ value: o, issues: [] }, r);
    return h instanceof Promise || d instanceof Promise ? Promise.all([h, d]).then(([y, g]) => Lm(u, y, g)) : Lm(u, h, d);
  };
});
function Gc(n, i) {
  if (n === i)
    return { valid: !0, data: n };
  if (n instanceof Date && i instanceof Date && +n == +i)
    return { valid: !0, data: n };
  if (wi(n) && wi(i)) {
    const u = Object.keys(i), r = Object.keys(n).filter((h) => u.indexOf(h) !== -1), o = { ...n, ...i };
    for (const h of r) {
      const d = Gc(n[h], i[h]);
      if (!d.valid)
        return {
          valid: !1,
          mergeErrorPath: [h, ...d.mergeErrorPath]
        };
      o[h] = d.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(n) && Array.isArray(i)) {
    if (n.length !== i.length)
      return { valid: !1, mergeErrorPath: [] };
    const u = [];
    for (let r = 0; r < n.length; r++) {
      const o = n[r], h = i[r], d = Gc(o, h);
      if (!d.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...d.mergeErrorPath]
        };
      u.push(d.data);
    }
    return { valid: !0, data: u };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Lm(n, i, u) {
  const r = /* @__PURE__ */ new Map();
  let o;
  for (const v of i.issues)
    if (v.code === "unrecognized_keys") {
      o ?? (o = v);
      for (const y of v.keys)
        r.has(y) || r.set(y, {}), r.get(y).l = !0;
    } else
      n.issues.push(v);
  for (const v of u.issues)
    if (v.code === "unrecognized_keys")
      for (const y of v.keys)
        r.has(y) || r.set(y, {}), r.get(y).r = !0;
    else
      n.issues.push(v);
  const h = [...r].filter(([, v]) => v.l && v.r).map(([v]) => v);
  if (h.length && o && n.issues.push({ ...o, keys: h }), gi(n))
    return n;
  const d = Gc(i.value, u.value);
  if (!d.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(d.mergeErrorPath)}`);
  return n.value = d.data, n;
}
const S_ = /* @__PURE__ */ q("$ZodRecord", (n, i) => {
  qe.init(n, i), n._zod.parse = (u, r) => {
    const o = u.value;
    if (!wi(o))
      return u.issues.push({
        expected: "record",
        code: "invalid_type",
        input: o,
        inst: n
      }), u;
    const h = [], d = i.keyType._zod.values;
    if (d) {
      u.value = {};
      const v = /* @__PURE__ */ new Set();
      for (const g of d)
        if (typeof g == "string" || typeof g == "number" || typeof g == "symbol") {
          v.add(typeof g == "number" ? g.toString() : g);
          const _ = i.keyType._zod.run({ value: g, issues: [] }, r);
          if (_ instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          if (_.issues.length) {
            u.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: _.issues.map((A) => On(A, r, An())),
              input: g,
              path: [g],
              inst: n
            });
            continue;
          }
          const j = _.value, S = i.valueType._zod.run({ value: o[g], issues: [] }, r);
          S instanceof Promise ? h.push(S.then((A) => {
            A.issues.length && u.issues.push(...bi(g, A.issues)), u.value[j] = A.value;
          })) : (S.issues.length && u.issues.push(...bi(g, S.issues)), u.value[j] = S.value);
        }
      let y;
      for (const g in o)
        v.has(g) || (y = y ?? [], y.push(g));
      y && y.length > 0 && u.issues.push({
        code: "unrecognized_keys",
        input: o,
        inst: n,
        keys: y
      });
    } else {
      u.value = {};
      for (const v of Reflect.ownKeys(o)) {
        if (v === "__proto__" || !Object.prototype.propertyIsEnumerable.call(o, v))
          continue;
        let y = i.keyType._zod.run({ value: v, issues: [] }, r);
        if (y instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof v == "string" && Up.test(v) && y.issues.length) {
          const j = i.keyType._zod.run({ value: Number(v), issues: [] }, r);
          if (j instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          j.issues.length === 0 && (y = j);
        }
        if (y.issues.length) {
          i.mode === "loose" ? u.value[v] = o[v] : u.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: y.issues.map((j) => On(j, r, An())),
            input: v,
            path: [v],
            inst: n
          });
          continue;
        }
        const _ = i.valueType._zod.run({ value: o[v], issues: [] }, r);
        _ instanceof Promise ? h.push(_.then((j) => {
          j.issues.length && u.issues.push(...bi(v, j.issues)), u.value[y.value] = j.value;
        })) : (_.issues.length && u.issues.push(...bi(v, _.issues)), u.value[y.value] = _.value);
      }
    }
    return h.length ? Promise.all(h).then(() => u) : u;
  };
}), z_ = /* @__PURE__ */ q("$ZodEnum", (n, i) => {
  qe.init(n, i);
  const u = Tp(i.entries), r = new Set(u);
  n._zod.values = r, n._zod.pattern = new RegExp(`^(${u.filter((o) => Ab.has(typeof o)).map((o) => typeof o == "string" ? ss(o) : o.toString()).join("|")})$`), n._zod.parse = (o, h) => {
    const d = o.value;
    return r.has(d) || o.issues.push({
      code: "invalid_value",
      values: u,
      input: d,
      inst: n
    }), o;
  };
}), w_ = /* @__PURE__ */ q("$ZodTransform", (n, i) => {
  qe.init(n, i), n._zod.optin = "optional", n._zod.parse = (u, r) => {
    if (r.direction === "backward")
      throw new Ep(n.constructor.name);
    const o = i.transform(u.value, u);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((d) => (u.value = d, u.fallback = !0, u));
    if (o instanceof Promise)
      throw new _i();
    return u.value = o, u.fallback = !0, u;
  };
});
function Gm(n, i) {
  return i === void 0 && (n.issues.length || n.fallback) ? { issues: [], value: void 0 } : n;
}
const Gp = /* @__PURE__ */ q("$ZodOptional", (n, i) => {
  qe.init(n, i), n._zod.optin = "optional", n._zod.optout = "optional", Oe(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, void 0]) : void 0), Oe(n._zod, "pattern", () => {
    const u = i.innerType._zod.pattern;
    return u ? new RegExp(`^(${uo(u.source)})?$`) : void 0;
  }), n._zod.parse = (u, r) => {
    if (i.innerType._zod.optin === "optional") {
      const o = u.value, h = i.innerType._zod.run(u, r);
      return h instanceof Promise ? h.then((d) => Gm(d, o)) : Gm(h, o);
    }
    return u.value === void 0 ? u : i.innerType._zod.run(u, r);
  };
}), j_ = /* @__PURE__ */ q("$ZodExactOptional", (n, i) => {
  Gp.init(n, i), Oe(n._zod, "values", () => i.innerType._zod.values), Oe(n._zod, "pattern", () => i.innerType._zod.pattern), n._zod.parse = (u, r) => i.innerType._zod.run(u, r);
}), x_ = /* @__PURE__ */ q("$ZodNullable", (n, i) => {
  qe.init(n, i), Oe(n._zod, "optin", () => i.innerType._zod.optin), Oe(n._zod, "optout", () => i.innerType._zod.optout), Oe(n._zod, "pattern", () => {
    const u = i.innerType._zod.pattern;
    return u ? new RegExp(`^(${uo(u.source)}|null)$`) : void 0;
  }), Oe(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, null]) : void 0), n._zod.parse = (u, r) => u.value === null ? u : i.innerType._zod.run(u, r);
}), E_ = /* @__PURE__ */ q("$ZodDefault", (n, i) => {
  qe.init(n, i), n._zod.optin = "optional", Oe(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (u, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(u, r);
    if (u.value === void 0)
      return u.value = i.defaultValue, u;
    const o = i.innerType._zod.run(u, r);
    return o instanceof Promise ? o.then((h) => Ym(h, i)) : Ym(o, i);
  };
});
function Ym(n, i) {
  return n.value === void 0 && (n.value = i.defaultValue), n;
}
const T_ = /* @__PURE__ */ q("$ZodPrefault", (n, i) => {
  qe.init(n, i), n._zod.optin = "optional", Oe(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (u, r) => (r.direction === "backward" || u.value === void 0 && (u.value = i.defaultValue), i.innerType._zod.run(u, r));
}), A_ = /* @__PURE__ */ q("$ZodNonOptional", (n, i) => {
  qe.init(n, i), Oe(n._zod, "values", () => {
    const u = i.innerType._zod.values;
    return u ? new Set([...u].filter((r) => r !== void 0)) : void 0;
  }), n._zod.parse = (u, r) => {
    const o = i.innerType._zod.run(u, r);
    return o instanceof Promise ? o.then((h) => Km(h, n)) : Km(o, n);
  };
});
function Km(n, i) {
  return !n.issues.length && n.value === void 0 && n.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: n.value,
    inst: i
  }), n;
}
const O_ = /* @__PURE__ */ q("$ZodCatch", (n, i) => {
  qe.init(n, i), n._zod.optin = "optional", Oe(n._zod, "optout", () => i.innerType._zod.optout), Oe(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (u, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(u, r);
    const o = i.innerType._zod.run(u, r);
    return o instanceof Promise ? o.then((h) => (u.value = h.value, h.issues.length && (u.value = i.catchValue({
      ...u,
      error: {
        issues: h.issues.map((d) => On(d, r, An()))
      },
      input: u.value
    }), u.issues = [], u.fallback = !0), u)) : (u.value = o.value, o.issues.length && (u.value = i.catchValue({
      ...u,
      error: {
        issues: o.issues.map((h) => On(h, r, An()))
      },
      input: u.value
    }), u.issues = [], u.fallback = !0), u);
  };
}), N_ = /* @__PURE__ */ q("$ZodPipe", (n, i) => {
  qe.init(n, i), Oe(n._zod, "values", () => i.in._zod.values), Oe(n._zod, "optin", () => i.in._zod.optin), Oe(n._zod, "optout", () => i.out._zod.optout), Oe(n._zod, "propValues", () => i.in._zod.propValues), n._zod.parse = (u, r) => {
    if (r.direction === "backward") {
      const h = i.out._zod.run(u, r);
      return h instanceof Promise ? h.then((d) => Vu(d, i.in, r)) : Vu(h, i.in, r);
    }
    const o = i.in._zod.run(u, r);
    return o instanceof Promise ? o.then((h) => Vu(h, i.out, r)) : Vu(o, i.out, r);
  };
});
function Vu(n, i, u) {
  return n.issues.length ? (n.aborted = !0, n) : i._zod.run({ value: n.value, issues: n.issues, fallback: n.fallback }, u);
}
const C_ = /* @__PURE__ */ q("$ZodReadonly", (n, i) => {
  qe.init(n, i), Oe(n._zod, "propValues", () => i.innerType._zod.propValues), Oe(n._zod, "values", () => i.innerType._zod.values), Oe(n._zod, "optin", () => i.innerType?._zod?.optin), Oe(n._zod, "optout", () => i.innerType?._zod?.optout), n._zod.parse = (u, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(u, r);
    const o = i.innerType._zod.run(u, r);
    return o instanceof Promise ? o.then(Xm) : Xm(o);
  };
});
function Xm(n) {
  return n.value = Object.freeze(n.value), n;
}
const M_ = /* @__PURE__ */ q("$ZodCustom", (n, i) => {
  St.init(n, i), qe.init(n, i), n._zod.parse = (u, r) => u, n._zod.check = (u) => {
    const r = u.value, o = i.fn(r);
    if (o instanceof Promise)
      return o.then((h) => Vm(h, u, r, n));
    Vm(o, u, r, n);
  };
});
function Vm(n, i, u, r) {
  if (!n) {
    const o = {
      code: "custom",
      input: u,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), i.issues.push(Tl(o));
  }
}
var Jm;
class D_ {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(i, ...u) {
    const r = u[0];
    return this._map.set(i, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, i), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(i) {
    const u = this._map.get(i);
    return u && typeof u == "object" && "id" in u && this._idmap.delete(u.id), this._map.delete(i), this;
  }
  get(i) {
    const u = i._zod.parent;
    if (u) {
      const r = { ...this.get(u) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(i) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(i);
  }
  has(i) {
    return this._map.has(i);
  }
}
function R_() {
  return new D_();
}
(Jm = globalThis).__zod_globalRegistry ?? (Jm.__zod_globalRegistry = R_());
const jl = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function q_(n, i) {
  return new n({
    type: "string",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function U_(n, i) {
  return new n({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function Fm(n, i) {
  return new n({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function Z_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function Q_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function H_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function B_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function $_(n, i) {
  return new n({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function k_(n, i) {
  return new n({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function L_(n, i) {
  return new n({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function G_(n, i) {
  return new n({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function Y_(n, i) {
  return new n({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function K_(n, i) {
  return new n({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function X_(n, i) {
  return new n({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function V_(n, i) {
  return new n({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function J_(n, i) {
  return new n({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function F_(n, i) {
  return new n({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function I_(n, i) {
  return new n({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function W_(n, i) {
  return new n({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function P_(n, i) {
  return new n({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function eS(n, i) {
  return new n({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function tS(n, i) {
  return new n({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function nS(n, i) {
  return new n({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function aS(n, i) {
  return new n({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function iS(n, i) {
  return new n({
    type: "string",
    format: "date",
    check: "string_format",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function lS(n, i) {
  return new n({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function uS(n, i) {
  return new n({
    type: "string",
    format: "duration",
    check: "string_format",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function sS(n, i) {
  return new n({
    type: "number",
    checks: [],
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function rS(n, i) {
  return new n({
    type: "number",
    coerce: !0,
    checks: [],
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function cS(n, i) {
  return new n({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function oS(n, i) {
  return new n({
    type: "boolean",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function fS(n, i) {
  return new n({
    type: "undefined",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function dS(n, i) {
  return new n({
    type: "null",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function hS(n) {
  return new n({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function mS(n, i) {
  return new n({
    type: "never",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function Im(n, i) {
  return new Qp({
    check: "less_than",
    ...P(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Dc(n, i) {
  return new Qp({
    check: "less_than",
    ...P(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Wm(n, i) {
  return new Hp({
    check: "greater_than",
    ...P(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Rc(n, i) {
  return new Hp({
    check: "greater_than",
    ...P(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Pm(n, i) {
  return new x0({
    check: "multiple_of",
    ...P(i),
    value: n
  });
}
// @__NO_SIDE_EFFECTS__
function Yp(n, i) {
  return new T0({
    check: "max_length",
    ...P(i),
    maximum: n
  });
}
// @__NO_SIDE_EFFECTS__
function is(n, i) {
  return new A0({
    check: "min_length",
    ...P(i),
    minimum: n
  });
}
// @__NO_SIDE_EFFECTS__
function Kp(n, i) {
  return new O0({
    check: "length_equals",
    ...P(i),
    length: n
  });
}
// @__NO_SIDE_EFFECTS__
function pS(n, i) {
  return new N0({
    check: "string_format",
    format: "regex",
    ...P(i),
    pattern: n
  });
}
// @__NO_SIDE_EFFECTS__
function vS(n) {
  return new C0({
    check: "string_format",
    format: "lowercase",
    ...P(n)
  });
}
// @__NO_SIDE_EFFECTS__
function yS(n) {
  return new M0({
    check: "string_format",
    format: "uppercase",
    ...P(n)
  });
}
// @__NO_SIDE_EFFECTS__
function gS(n, i) {
  return new D0({
    check: "string_format",
    format: "includes",
    ...P(i),
    includes: n
  });
}
// @__NO_SIDE_EFFECTS__
function bS(n, i) {
  return new R0({
    check: "string_format",
    format: "starts_with",
    ...P(i),
    prefix: n
  });
}
// @__NO_SIDE_EFFECTS__
function _S(n, i) {
  return new q0({
    check: "string_format",
    format: "ends_with",
    ...P(i),
    suffix: n
  });
}
// @__NO_SIDE_EFFECTS__
function Ei(n) {
  return new U0({
    check: "overwrite",
    tx: n
  });
}
// @__NO_SIDE_EFFECTS__
function SS(n) {
  return /* @__PURE__ */ Ei((i) => i.normalize(n));
}
// @__NO_SIDE_EFFECTS__
function zS() {
  return /* @__PURE__ */ Ei((n) => n.trim());
}
// @__NO_SIDE_EFFECTS__
function wS() {
  return /* @__PURE__ */ Ei((n) => n.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function jS() {
  return /* @__PURE__ */ Ei((n) => n.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function xS() {
  return /* @__PURE__ */ Ei((n) => Eb(n));
}
// @__NO_SIDE_EFFECTS__
function ES(n, i, u) {
  return new n({
    type: "array",
    element: i,
    // get element() {
    //   return element;
    // },
    ...P(u)
  });
}
// @__NO_SIDE_EFFECTS__
function TS(n, i, u) {
  return new n({
    type: "custom",
    check: "custom",
    fn: i,
    ...P(u)
  });
}
// @__NO_SIDE_EFFECTS__
function AS(n, i) {
  const u = /* @__PURE__ */ OS((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(Tl(o, r.value, u._zod.def));
    else {
      const h = o;
      h.fatal && (h.continue = !1), h.code ?? (h.code = "custom"), h.input ?? (h.input = r.value), h.inst ?? (h.inst = u), h.continue ?? (h.continue = !u._zod.def.abort), r.issues.push(Tl(h));
    }
  }, n(r.value, r)), i);
  return u;
}
// @__NO_SIDE_EFFECTS__
function OS(n, i) {
  const u = new St({
    check: "custom",
    ...P(i)
  });
  return u._zod.check = n, u;
}
function Xp(n) {
  let i = n?.target ?? "draft-2020-12";
  return i === "draft-4" && (i = "draft-04"), i === "draft-7" && (i = "draft-07"), {
    processors: n.processors ?? {},
    metadataRegistry: n?.metadata ?? jl,
    target: i,
    unrepresentable: n?.unrepresentable ?? "throw",
    override: n?.override ?? (() => {
    }),
    io: n?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: n?.cycles ?? "ref",
    reused: n?.reused ?? "inline",
    external: n?.external ?? void 0
  };
}
function We(n, i, u = { path: [], schemaPath: [] }) {
  var r;
  const o = n._zod.def, h = i.seen.get(n);
  if (h)
    return h.count++, u.schemaPath.includes(n) && (h.cycle = u.path), h.schema;
  const d = { schema: {}, count: 1, cycle: void 0, path: u.path };
  i.seen.set(n, d);
  const v = n._zod.toJSONSchema?.();
  if (v)
    d.schema = v;
  else {
    const _ = {
      ...u,
      schemaPath: [...u.schemaPath, n],
      path: u.path
    };
    if (n._zod.processJSONSchema)
      n._zod.processJSONSchema(i, d.schema, _);
    else {
      const S = d.schema, A = i.processors[o.type];
      if (!A)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      A(n, i, S, _);
    }
    const j = n._zod.parent;
    j && (d.ref || (d.ref = j), We(j, i, _), i.seen.get(j).isParent = !0);
  }
  const y = i.metadataRegistry.get(n);
  return y && Object.assign(d.schema, y), i.io === "input" && dt(n) && (delete d.schema.examples, delete d.schema.default), i.io === "input" && "_prefault" in d.schema && ((r = d.schema).default ?? (r.default = d.schema._prefault)), delete d.schema._prefault, i.seen.get(n).schema;
}
function Vp(n, i) {
  const u = n.seen.get(i);
  if (!u)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const d of n.seen.entries()) {
    const v = n.metadataRegistry.get(d[0])?.id;
    if (v) {
      const y = r.get(v);
      if (y && y !== d[0])
        throw new Error(`Duplicate schema id "${v}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(v, d[0]);
    }
  }
  const o = (d) => {
    const v = n.target === "draft-2020-12" ? "$defs" : "definitions";
    if (n.external) {
      const j = n.external.registry.get(d[0])?.id, S = n.external.uri ?? ((C) => C);
      if (j)
        return { ref: S(j) };
      const A = d[1].defId ?? d[1].schema.id ?? `schema${n.counter++}`;
      return d[1].defId = A, { defId: A, ref: `${S("__shared")}#/${v}/${A}` };
    }
    if (d[1] === u)
      return { ref: "#" };
    const g = `#/${v}/`, _ = d[1].schema.id ?? `__schema${n.counter++}`;
    return { defId: _, ref: g + _ };
  }, h = (d) => {
    if (d[1].schema.$ref)
      return;
    const v = d[1], { ref: y, defId: g } = o(d);
    v.def = { ...v.schema }, g && (v.defId = g);
    const _ = v.schema;
    for (const j in _)
      delete _[j];
    _.$ref = y;
  };
  if (n.cycles === "throw")
    for (const d of n.seen.entries()) {
      const v = d[1];
      if (v.cycle)
        throw new Error(`Cycle detected: #/${v.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const d of n.seen.entries()) {
    const v = d[1];
    if (i === d[0]) {
      h(d);
      continue;
    }
    if (n.external) {
      const g = n.external.registry.get(d[0])?.id;
      if (i !== d[0] && g) {
        h(d);
        continue;
      }
    }
    if (n.metadataRegistry.get(d[0])?.id) {
      h(d);
      continue;
    }
    if (v.cycle) {
      h(d);
      continue;
    }
    if (v.count > 1 && n.reused === "ref") {
      h(d);
      continue;
    }
  }
}
function Jp(n, i) {
  const u = n.seen.get(i);
  if (!u)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (v) => {
    const y = n.seen.get(v);
    if (y.ref === null)
      return;
    const g = y.def ?? y.schema, _ = { ...g }, j = y.ref;
    if (y.ref = null, j) {
      r(j);
      const A = n.seen.get(j), C = A.schema;
      if (C.$ref && (n.target === "draft-07" || n.target === "draft-04" || n.target === "openapi-3.0") ? (g.allOf = g.allOf ?? [], g.allOf.push(C)) : Object.assign(g, C), Object.assign(g, _), v._zod.parent === j)
        for (const G in g)
          G === "$ref" || G === "allOf" || G in _ || delete g[G];
      if (C.$ref && A.def)
        for (const G in g)
          G === "$ref" || G === "allOf" || G in A.def && JSON.stringify(g[G]) === JSON.stringify(A.def[G]) && delete g[G];
    }
    const S = v._zod.parent;
    if (S && S !== j) {
      r(S);
      const A = n.seen.get(S);
      if (A?.schema.$ref && (g.$ref = A.schema.$ref, A.def))
        for (const C in g)
          C === "$ref" || C === "allOf" || C in A.def && JSON.stringify(g[C]) === JSON.stringify(A.def[C]) && delete g[C];
    }
    n.override({
      zodSchema: v,
      jsonSchema: g,
      path: y.path ?? []
    });
  };
  for (const v of [...n.seen.entries()].reverse())
    r(v[0]);
  const o = {};
  if (n.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : n.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : n.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : n.target, n.external?.uri) {
    const v = n.external.registry.get(i)?.id;
    if (!v)
      throw new Error("Schema is missing an `id` property");
    o.$id = n.external.uri(v);
  }
  Object.assign(o, u.def ?? u.schema);
  const h = n.metadataRegistry.get(i)?.id;
  h !== void 0 && o.id === h && delete o.id;
  const d = n.external?.defs ?? {};
  for (const v of n.seen.entries()) {
    const y = v[1];
    y.def && y.defId && (y.def.id === y.defId && delete y.def.id, d[y.defId] = y.def);
  }
  n.external || Object.keys(d).length > 0 && (n.target === "draft-2020-12" ? o.$defs = d : o.definitions = d);
  try {
    const v = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(v, "~standard", {
      value: {
        ...i["~standard"],
        jsonSchema: {
          input: ls(i, "input", n.processors),
          output: ls(i, "output", n.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), v;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function dt(n, i) {
  const u = i ?? { seen: /* @__PURE__ */ new Set() };
  if (u.seen.has(n))
    return !1;
  u.seen.add(n);
  const r = n._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return dt(r.element, u);
  if (r.type === "set")
    return dt(r.valueType, u);
  if (r.type === "lazy")
    return dt(r.getter(), u);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return dt(r.innerType, u);
  if (r.type === "intersection")
    return dt(r.left, u) || dt(r.right, u);
  if (r.type === "record" || r.type === "map")
    return dt(r.keyType, u) || dt(r.valueType, u);
  if (r.type === "pipe")
    return n._zod.traits.has("$ZodCodec") ? !0 : dt(r.in, u) || dt(r.out, u);
  if (r.type === "object") {
    for (const o in r.shape)
      if (dt(r.shape[o], u))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (dt(o, u))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (dt(o, u))
        return !0;
    return !!(r.rest && dt(r.rest, u));
  }
  return !1;
}
const NS = (n, i = {}) => (u) => {
  const r = Xp({ ...u, processors: i });
  return We(n, r), Vp(r, n), Jp(r, n);
}, ls = (n, i, u = {}) => (r) => {
  const { libraryOptions: o, target: h } = r ?? {}, d = Xp({ ...o ?? {}, target: h, io: i, processors: u });
  return We(n, d), Vp(d, n), Jp(d, n);
}, CS = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, MS = (n, i, u, r) => {
  const o = u;
  o.type = "string";
  const { minimum: h, maximum: d, format: v, patterns: y, contentEncoding: g } = n._zod.bag;
  if (typeof h == "number" && (o.minLength = h), typeof d == "number" && (o.maxLength = d), v && (o.format = CS[v] ?? v, o.format === "" && delete o.format, v === "time" && delete o.format), g && (o.contentEncoding = g), y && y.size > 0) {
    const _ = [...y];
    _.length === 1 ? o.pattern = _[0].source : _.length > 1 && (o.allOf = [
      ..._.map((j) => ({
        ...i.target === "draft-07" || i.target === "draft-04" || i.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: j.source
      }))
    ]);
  }
}, DS = (n, i, u, r) => {
  const o = u, { minimum: h, maximum: d, format: v, multipleOf: y, exclusiveMaximum: g, exclusiveMinimum: _ } = n._zod.bag;
  typeof v == "string" && v.includes("int") ? o.type = "integer" : o.type = "number";
  const j = typeof _ == "number" && _ >= (h ?? Number.NEGATIVE_INFINITY), S = typeof g == "number" && g <= (d ?? Number.POSITIVE_INFINITY), A = i.target === "draft-04" || i.target === "openapi-3.0";
  j ? A ? (o.minimum = _, o.exclusiveMinimum = !0) : o.exclusiveMinimum = _ : typeof h == "number" && (o.minimum = h), S ? A ? (o.maximum = g, o.exclusiveMaximum = !0) : o.exclusiveMaximum = g : typeof d == "number" && (o.maximum = d), typeof y == "number" && (o.multipleOf = y);
}, RS = (n, i, u, r) => {
  u.type = "boolean";
}, qS = (n, i, u, r) => {
  i.target === "openapi-3.0" ? (u.type = "string", u.nullable = !0, u.enum = [null]) : u.type = "null";
}, US = (n, i, u, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Undefined cannot be represented in JSON Schema");
}, ZS = (n, i, u, r) => {
  u.not = {};
}, QS = (n, i, u, r) => {
}, HS = (n, i, u, r) => {
  const o = n._zod.def, h = Tp(o.entries);
  h.every((d) => typeof d == "number") && (u.type = "number"), h.every((d) => typeof d == "string") && (u.type = "string"), u.enum = h;
}, BS = (n, i, u, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, $S = (n, i, u, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, kS = (n, i, u, r) => {
  const o = u, h = n._zod.def, { minimum: d, maximum: v } = n._zod.bag;
  typeof d == "number" && (o.minItems = d), typeof v == "number" && (o.maxItems = v), o.type = "array", o.items = We(h.element, i, {
    ...r,
    path: [...r.path, "items"]
  });
}, LS = (n, i, u, r) => {
  const o = u, h = n._zod.def;
  o.type = "object", o.properties = {};
  const d = h.shape;
  for (const g in d)
    o.properties[g] = We(d[g], i, {
      ...r,
      path: [...r.path, "properties", g]
    });
  const v = new Set(Object.keys(d)), y = new Set([...v].filter((g) => {
    const _ = h.shape[g]._zod;
    return i.io === "input" ? _.optin === void 0 : _.optout === void 0;
  }));
  y.size > 0 && (o.required = Array.from(y)), h.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : h.catchall ? h.catchall && (o.additionalProperties = We(h.catchall, i, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : i.io === "output" && (o.additionalProperties = !1);
}, GS = (n, i, u, r) => {
  const o = n._zod.def, h = o.inclusive === !1, d = o.options.map((v, y) => We(v, i, {
    ...r,
    path: [...r.path, h ? "oneOf" : "anyOf", y]
  }));
  h ? u.oneOf = d : u.anyOf = d;
}, YS = (n, i, u, r) => {
  const o = n._zod.def, h = We(o.left, i, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), d = We(o.right, i, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), v = (g) => "allOf" in g && Object.keys(g).length === 1, y = [
    ...v(h) ? h.allOf : [h],
    ...v(d) ? d.allOf : [d]
  ];
  u.allOf = y;
}, KS = (n, i, u, r) => {
  const o = u, h = n._zod.def;
  o.type = "object";
  const d = h.keyType, y = d._zod.bag?.patterns;
  if (h.mode === "loose" && y && y.size > 0) {
    const _ = We(h.valueType, i, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    o.patternProperties = {};
    for (const j of y)
      o.patternProperties[j.source] = _;
  } else
    (i.target === "draft-07" || i.target === "draft-2020-12") && (o.propertyNames = We(h.keyType, i, {
      ...r,
      path: [...r.path, "propertyNames"]
    })), o.additionalProperties = We(h.valueType, i, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  const g = d._zod.values;
  if (g) {
    const _ = [...g].filter((j) => typeof j == "string" || typeof j == "number");
    _.length > 0 && (o.required = _);
  }
}, XS = (n, i, u, r) => {
  const o = n._zod.def, h = We(o.innerType, i, r), d = i.seen.get(n);
  i.target === "openapi-3.0" ? (d.ref = o.innerType, u.nullable = !0) : u.anyOf = [h, { type: "null" }];
}, VS = (n, i, u, r) => {
  const o = n._zod.def;
  We(o.innerType, i, r);
  const h = i.seen.get(n);
  h.ref = o.innerType;
}, JS = (n, i, u, r) => {
  const o = n._zod.def;
  We(o.innerType, i, r);
  const h = i.seen.get(n);
  h.ref = o.innerType, u.default = JSON.parse(JSON.stringify(o.defaultValue));
}, FS = (n, i, u, r) => {
  const o = n._zod.def;
  We(o.innerType, i, r);
  const h = i.seen.get(n);
  h.ref = o.innerType, i.io === "input" && (u._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
}, IS = (n, i, u, r) => {
  const o = n._zod.def;
  We(o.innerType, i, r);
  const h = i.seen.get(n);
  h.ref = o.innerType;
  let d;
  try {
    d = o.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  u.default = d;
}, WS = (n, i, u, r) => {
  const o = n._zod.def, h = o.in._zod.traits.has("$ZodTransform"), d = i.io === "input" ? h ? o.out : o.in : o.out;
  We(d, i, r);
  const v = i.seen.get(n);
  v.ref = d;
}, PS = (n, i, u, r) => {
  const o = n._zod.def;
  We(o.innerType, i, r);
  const h = i.seen.get(n);
  h.ref = o.innerType, u.readOnly = !0;
}, Fp = (n, i, u, r) => {
  const o = n._zod.def;
  We(o.innerType, i, r);
  const h = i.seen.get(n);
  h.ref = o.innerType;
}, e1 = /* @__PURE__ */ q("ZodISODateTime", (n, i) => {
  F0.init(n, i), He.init(n, i);
});
function t1(n) {
  return /* @__PURE__ */ aS(e1, n);
}
const n1 = /* @__PURE__ */ q("ZodISODate", (n, i) => {
  I0.init(n, i), He.init(n, i);
});
function a1(n) {
  return /* @__PURE__ */ iS(n1, n);
}
const i1 = /* @__PURE__ */ q("ZodISOTime", (n, i) => {
  W0.init(n, i), He.init(n, i);
});
function l1(n) {
  return /* @__PURE__ */ lS(i1, n);
}
const u1 = /* @__PURE__ */ q("ZodISODuration", (n, i) => {
  P0.init(n, i), He.init(n, i);
});
function s1(n) {
  return /* @__PURE__ */ uS(u1, n);
}
const r1 = (n, i) => {
  Cp.init(n, i), n.name = "ZodError", Object.defineProperties(n, {
    format: {
      value: (u) => Bb(n, u)
      // enumerable: false,
    },
    flatten: {
      value: (u) => Hb(n, u)
      // enumerable: false,
    },
    addIssue: {
      value: (u) => {
        n.issues.push(u), n.message = JSON.stringify(n.issues, Lc, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (u) => {
        n.issues.push(...u), n.message = JSON.stringify(n.issues, Lc, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return n.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, Vt = /* @__PURE__ */ q("ZodError", r1, {
  Parent: Error
}), c1 = /* @__PURE__ */ ro(Vt), o1 = /* @__PURE__ */ co(Vt), f1 = /* @__PURE__ */ rs(Vt), d1 = /* @__PURE__ */ cs(Vt), h1 = /* @__PURE__ */ Lb(Vt), m1 = /* @__PURE__ */ Gb(Vt), p1 = /* @__PURE__ */ Yb(Vt), v1 = /* @__PURE__ */ Kb(Vt), y1 = /* @__PURE__ */ Xb(Vt), g1 = /* @__PURE__ */ Vb(Vt), b1 = /* @__PURE__ */ Jb(Vt), _1 = /* @__PURE__ */ Fb(Vt), ep = /* @__PURE__ */ new WeakMap();
function Al(n, i, u) {
  const r = Object.getPrototypeOf(n);
  let o = ep.get(r);
  if (o || (o = /* @__PURE__ */ new Set(), ep.set(r, o)), !o.has(i)) {
    o.add(i);
    for (const h in u) {
      const d = u[h];
      Object.defineProperty(r, h, {
        configurable: !0,
        enumerable: !1,
        get() {
          const v = d.bind(this);
          return Object.defineProperty(this, h, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: v
          }), v;
        },
        set(v) {
          Object.defineProperty(this, h, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: v
          });
        }
      });
    }
  }
}
const Ze = /* @__PURE__ */ q("ZodType", (n, i) => (qe.init(n, i), Object.assign(n["~standard"], {
  jsonSchema: {
    input: ls(n, "input"),
    output: ls(n, "output")
  }
}), n.toJSONSchema = NS(n, {}), n.def = i, n.type = i.type, Object.defineProperty(n, "_def", { value: i }), n.parse = (u, r) => c1(n, u, r, { callee: n.parse }), n.safeParse = (u, r) => f1(n, u, r), n.parseAsync = async (u, r) => o1(n, u, r, { callee: n.parseAsync }), n.safeParseAsync = async (u, r) => d1(n, u, r), n.spa = n.safeParseAsync, n.encode = (u, r) => h1(n, u, r), n.decode = (u, r) => m1(n, u, r), n.encodeAsync = async (u, r) => p1(n, u, r), n.decodeAsync = async (u, r) => v1(n, u, r), n.safeEncode = (u, r) => y1(n, u, r), n.safeDecode = (u, r) => g1(n, u, r), n.safeEncodeAsync = async (u, r) => b1(n, u, r), n.safeDecodeAsync = async (u, r) => _1(n, u, r), Al(n, "ZodType", {
  check(...u) {
    const r = this.def;
    return this.clone(sa(r, {
      checks: [
        ...r.checks ?? [],
        ...u.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
      ]
    }), { parent: !0 });
  },
  with(...u) {
    return this.check(...u);
  },
  clone(u, r) {
    return ra(this, u, r);
  },
  brand() {
    return this;
  },
  register(u, r) {
    return u.add(this, r), this;
  },
  refine(u, r) {
    return this.check(yz(u, r));
  },
  superRefine(u, r) {
    return this.check(gz(u, r));
  },
  overwrite(u) {
    return this.check(/* @__PURE__ */ Ei(u));
  },
  optional() {
    return ip(this);
  },
  exactOptional() {
    return iz(this);
  },
  nullable() {
    return lp(this);
  },
  nullish() {
    return ip(lp(this));
  },
  nonoptional(u) {
    return oz(this, u);
  },
  array() {
    return Ie(this);
  },
  or(u) {
    return en([this, u]);
  },
  and(u) {
    return W1(this, u);
  },
  transform(u) {
    return up(this, nz(u));
  },
  default(u) {
    return sz(this, u);
  },
  prefault(u) {
    return cz(this, u);
  },
  catch(u) {
    return dz(this, u);
  },
  pipe(u) {
    return up(this, u);
  },
  readonly() {
    return pz(this);
  },
  describe(u) {
    const r = this.clone();
    return jl.add(r, { description: u }), r;
  },
  meta(...u) {
    if (u.length === 0)
      return jl.get(this);
    const r = this.clone();
    return jl.add(r, u[0]), r;
  },
  isOptional() {
    return this.safeParse(void 0).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(u) {
    return u(this);
  }
}), Object.defineProperty(n, "description", {
  get() {
    return jl.get(n)?.description;
  },
  configurable: !0
}), n)), Ip = /* @__PURE__ */ q("_ZodString", (n, i) => {
  oo.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (r, o, h) => MS(n, r, o);
  const u = n._zod.bag;
  n.format = u.format ?? null, n.minLength = u.minimum ?? null, n.maxLength = u.maximum ?? null, Al(n, "_ZodString", {
    regex(...r) {
      return this.check(/* @__PURE__ */ pS(...r));
    },
    includes(...r) {
      return this.check(/* @__PURE__ */ gS(...r));
    },
    startsWith(...r) {
      return this.check(/* @__PURE__ */ bS(...r));
    },
    endsWith(...r) {
      return this.check(/* @__PURE__ */ _S(...r));
    },
    min(...r) {
      return this.check(/* @__PURE__ */ is(...r));
    },
    max(...r) {
      return this.check(/* @__PURE__ */ Yp(...r));
    },
    length(...r) {
      return this.check(/* @__PURE__ */ Kp(...r));
    },
    nonempty(...r) {
      return this.check(/* @__PURE__ */ is(1, ...r));
    },
    lowercase(r) {
      return this.check(/* @__PURE__ */ vS(r));
    },
    uppercase(r) {
      return this.check(/* @__PURE__ */ yS(r));
    },
    trim() {
      return this.check(/* @__PURE__ */ zS());
    },
    normalize(...r) {
      return this.check(/* @__PURE__ */ SS(...r));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ wS());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ jS());
    },
    slugify() {
      return this.check(/* @__PURE__ */ xS());
    }
  });
}), S1 = /* @__PURE__ */ q("ZodString", (n, i) => {
  oo.init(n, i), Ip.init(n, i), n.email = (u) => n.check(/* @__PURE__ */ U_(z1, u)), n.url = (u) => n.check(/* @__PURE__ */ $_(w1, u)), n.jwt = (u) => n.check(/* @__PURE__ */ nS(Q1, u)), n.emoji = (u) => n.check(/* @__PURE__ */ k_(j1, u)), n.guid = (u) => n.check(/* @__PURE__ */ Fm(tp, u)), n.uuid = (u) => n.check(/* @__PURE__ */ Z_(Ju, u)), n.uuidv4 = (u) => n.check(/* @__PURE__ */ Q_(Ju, u)), n.uuidv6 = (u) => n.check(/* @__PURE__ */ H_(Ju, u)), n.uuidv7 = (u) => n.check(/* @__PURE__ */ B_(Ju, u)), n.nanoid = (u) => n.check(/* @__PURE__ */ L_(x1, u)), n.guid = (u) => n.check(/* @__PURE__ */ Fm(tp, u)), n.cuid = (u) => n.check(/* @__PURE__ */ G_(E1, u)), n.cuid2 = (u) => n.check(/* @__PURE__ */ Y_(T1, u)), n.ulid = (u) => n.check(/* @__PURE__ */ K_(A1, u)), n.base64 = (u) => n.check(/* @__PURE__ */ P_(q1, u)), n.base64url = (u) => n.check(/* @__PURE__ */ eS(U1, u)), n.xid = (u) => n.check(/* @__PURE__ */ X_(O1, u)), n.ksuid = (u) => n.check(/* @__PURE__ */ V_(N1, u)), n.ipv4 = (u) => n.check(/* @__PURE__ */ J_(C1, u)), n.ipv6 = (u) => n.check(/* @__PURE__ */ F_(M1, u)), n.cidrv4 = (u) => n.check(/* @__PURE__ */ I_(D1, u)), n.cidrv6 = (u) => n.check(/* @__PURE__ */ W_(R1, u)), n.e164 = (u) => n.check(/* @__PURE__ */ tS(Z1, u)), n.datetime = (u) => n.check(t1(u)), n.date = (u) => n.check(a1(u)), n.time = (u) => n.check(l1(u)), n.duration = (u) => n.check(s1(u));
});
function k(n) {
  return /* @__PURE__ */ q_(S1, n);
}
const He = /* @__PURE__ */ q("ZodStringFormat", (n, i) => {
  Ue.init(n, i), Ip.init(n, i);
}), z1 = /* @__PURE__ */ q("ZodEmail", (n, i) => {
  $0.init(n, i), He.init(n, i);
}), tp = /* @__PURE__ */ q("ZodGUID", (n, i) => {
  H0.init(n, i), He.init(n, i);
}), Ju = /* @__PURE__ */ q("ZodUUID", (n, i) => {
  B0.init(n, i), He.init(n, i);
}), w1 = /* @__PURE__ */ q("ZodURL", (n, i) => {
  k0.init(n, i), He.init(n, i);
}), j1 = /* @__PURE__ */ q("ZodEmoji", (n, i) => {
  L0.init(n, i), He.init(n, i);
}), x1 = /* @__PURE__ */ q("ZodNanoID", (n, i) => {
  G0.init(n, i), He.init(n, i);
}), E1 = /* @__PURE__ */ q("ZodCUID", (n, i) => {
  Y0.init(n, i), He.init(n, i);
}), T1 = /* @__PURE__ */ q("ZodCUID2", (n, i) => {
  K0.init(n, i), He.init(n, i);
}), A1 = /* @__PURE__ */ q("ZodULID", (n, i) => {
  X0.init(n, i), He.init(n, i);
}), O1 = /* @__PURE__ */ q("ZodXID", (n, i) => {
  V0.init(n, i), He.init(n, i);
}), N1 = /* @__PURE__ */ q("ZodKSUID", (n, i) => {
  J0.init(n, i), He.init(n, i);
}), C1 = /* @__PURE__ */ q("ZodIPv4", (n, i) => {
  e_.init(n, i), He.init(n, i);
}), M1 = /* @__PURE__ */ q("ZodIPv6", (n, i) => {
  t_.init(n, i), He.init(n, i);
}), D1 = /* @__PURE__ */ q("ZodCIDRv4", (n, i) => {
  n_.init(n, i), He.init(n, i);
}), R1 = /* @__PURE__ */ q("ZodCIDRv6", (n, i) => {
  a_.init(n, i), He.init(n, i);
}), q1 = /* @__PURE__ */ q("ZodBase64", (n, i) => {
  i_.init(n, i), He.init(n, i);
}), U1 = /* @__PURE__ */ q("ZodBase64URL", (n, i) => {
  u_.init(n, i), He.init(n, i);
}), Z1 = /* @__PURE__ */ q("ZodE164", (n, i) => {
  s_.init(n, i), He.init(n, i);
}), Q1 = /* @__PURE__ */ q("ZodJWT", (n, i) => {
  c_.init(n, i), He.init(n, i);
}), fo = /* @__PURE__ */ q("ZodNumber", (n, i) => {
  $p.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (r, o, h) => DS(n, r, o), Al(n, "ZodNumber", {
    gt(r, o) {
      return this.check(/* @__PURE__ */ Wm(r, o));
    },
    gte(r, o) {
      return this.check(/* @__PURE__ */ Rc(r, o));
    },
    min(r, o) {
      return this.check(/* @__PURE__ */ Rc(r, o));
    },
    lt(r, o) {
      return this.check(/* @__PURE__ */ Im(r, o));
    },
    lte(r, o) {
      return this.check(/* @__PURE__ */ Dc(r, o));
    },
    max(r, o) {
      return this.check(/* @__PURE__ */ Dc(r, o));
    },
    int(r) {
      return this.check(np(r));
    },
    safe(r) {
      return this.check(np(r));
    },
    positive(r) {
      return this.check(/* @__PURE__ */ Wm(0, r));
    },
    nonnegative(r) {
      return this.check(/* @__PURE__ */ Rc(0, r));
    },
    negative(r) {
      return this.check(/* @__PURE__ */ Im(0, r));
    },
    nonpositive(r) {
      return this.check(/* @__PURE__ */ Dc(0, r));
    },
    multipleOf(r, o) {
      return this.check(/* @__PURE__ */ Pm(r, o));
    },
    step(r, o) {
      return this.check(/* @__PURE__ */ Pm(r, o));
    },
    finite() {
      return this;
    }
  });
  const u = n._zod.bag;
  n.minValue = Math.max(u.minimum ?? Number.NEGATIVE_INFINITY, u.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, n.maxValue = Math.min(u.maximum ?? Number.POSITIVE_INFINITY, u.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, n.isInt = (u.format ?? "").includes("int") || Number.isSafeInteger(u.multipleOf ?? 0.5), n.isFinite = !0, n.format = u.format ?? null;
});
function Ca(n) {
  return /* @__PURE__ */ sS(fo, n);
}
const H1 = /* @__PURE__ */ q("ZodNumberFormat", (n, i) => {
  o_.init(n, i), fo.init(n, i);
});
function np(n) {
  return /* @__PURE__ */ cS(H1, n);
}
const B1 = /* @__PURE__ */ q("ZodBoolean", (n, i) => {
  f_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => RS(n, u, r);
});
function Ma(n) {
  return /* @__PURE__ */ oS(B1, n);
}
const $1 = /* @__PURE__ */ q("ZodUndefined", (n, i) => {
  d_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => US(n, u);
});
function k1(n) {
  return /* @__PURE__ */ fS($1, n);
}
const L1 = /* @__PURE__ */ q("ZodNull", (n, i) => {
  h_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => qS(n, u, r);
});
function G1(n) {
  return /* @__PURE__ */ dS(L1, n);
}
const Y1 = /* @__PURE__ */ q("ZodUnknown", (n, i) => {
  m_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => QS();
});
function sn() {
  return /* @__PURE__ */ hS(Y1);
}
const K1 = /* @__PURE__ */ q("ZodNever", (n, i) => {
  p_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => ZS(n, u, r);
});
function X1(n) {
  return /* @__PURE__ */ mS(K1, n);
}
const V1 = /* @__PURE__ */ q("ZodArray", (n, i) => {
  v_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => kS(n, u, r, o), n.element = i.element, Al(n, "ZodArray", {
    min(u, r) {
      return this.check(/* @__PURE__ */ is(u, r));
    },
    nonempty(u) {
      return this.check(/* @__PURE__ */ is(1, u));
    },
    max(u, r) {
      return this.check(/* @__PURE__ */ Yp(u, r));
    },
    length(u, r) {
      return this.check(/* @__PURE__ */ Kp(u, r));
    },
    unwrap() {
      return this.element;
    }
  });
});
function Ie(n, i) {
  return /* @__PURE__ */ ES(V1, n, i);
}
const J1 = /* @__PURE__ */ q("ZodObject", (n, i) => {
  g_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => LS(n, u, r, o), Oe(n, "shape", () => i.shape), Al(n, "ZodObject", {
    keyof() {
      return ez(Object.keys(this._zod.def.shape));
    },
    catchall(u) {
      return this.clone({ ...this._zod.def, catchall: u });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: sn() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: sn() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: X1() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: void 0 });
    },
    extend(u) {
      return Db(this, u);
    },
    safeExtend(u) {
      return Rb(this, u);
    },
    merge(u) {
      return qb(this, u);
    },
    pick(u) {
      return Cb(this, u);
    },
    omit(u) {
      return Mb(this, u);
    },
    partial(...u) {
      return Ub(Wp, this, u[0]);
    },
    required(...u) {
      return Zb(Pp, this, u[0]);
    }
  });
});
function ct(n, i) {
  const u = {
    type: "object",
    shape: n ?? {},
    ...P(i)
  };
  return new J1(u);
}
const F1 = /* @__PURE__ */ q("ZodUnion", (n, i) => {
  b_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => GS(n, u, r, o), n.options = i.options;
});
function en(n, i) {
  return new F1({
    type: "union",
    options: n,
    ...P(i)
  });
}
const I1 = /* @__PURE__ */ q("ZodIntersection", (n, i) => {
  __.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => YS(n, u, r, o);
});
function W1(n, i) {
  return new I1({
    type: "intersection",
    left: n,
    right: i
  });
}
const ap = /* @__PURE__ */ q("ZodRecord", (n, i) => {
  S_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => KS(n, u, r, o), n.keyType = i.keyType, n.valueType = i.valueType;
});
function P1(n, i, u) {
  return !i || !i._zod ? new ap({
    type: "record",
    keyType: k(),
    valueType: n,
    ...P(i)
  }) : new ap({
    type: "record",
    keyType: n,
    valueType: i,
    ...P(u)
  });
}
const Yc = /* @__PURE__ */ q("ZodEnum", (n, i) => {
  z_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (r, o, h) => HS(n, r, o), n.enum = i.entries, n.options = Object.values(i.entries);
  const u = new Set(Object.keys(i.entries));
  n.extract = (r, o) => {
    const h = {};
    for (const d of r)
      if (u.has(d))
        h[d] = i.entries[d];
      else
        throw new Error(`Key ${d} not found in enum`);
    return new Yc({
      ...i,
      checks: [],
      ...P(o),
      entries: h
    });
  }, n.exclude = (r, o) => {
    const h = { ...i.entries };
    for (const d of r)
      if (u.has(d))
        delete h[d];
      else
        throw new Error(`Key ${d} not found in enum`);
    return new Yc({
      ...i,
      checks: [],
      ...P(o),
      entries: h
    });
  };
});
function ez(n, i) {
  const u = Array.isArray(n) ? Object.fromEntries(n.map((r) => [r, r])) : n;
  return new Yc({
    type: "enum",
    entries: u,
    ...P(i)
  });
}
const tz = /* @__PURE__ */ q("ZodTransform", (n, i) => {
  w_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => $S(n, u), n._zod.parse = (u, r) => {
    if (r.direction === "backward")
      throw new Ep(n.constructor.name);
    u.addIssue = (h) => {
      if (typeof h == "string")
        u.issues.push(Tl(h, u.value, i));
      else {
        const d = h;
        d.fatal && (d.continue = !1), d.code ?? (d.code = "custom"), d.input ?? (d.input = u.value), d.inst ?? (d.inst = n), u.issues.push(Tl(d));
      }
    };
    const o = i.transform(u.value, u);
    return o instanceof Promise ? o.then((h) => (u.value = h, u.fallback = !0, u)) : (u.value = o, u.fallback = !0, u);
  };
});
function nz(n) {
  return new tz({
    type: "transform",
    transform: n
  });
}
const Wp = /* @__PURE__ */ q("ZodOptional", (n, i) => {
  Gp.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => Fp(n, u, r, o), n.unwrap = () => n._zod.def.innerType;
});
function ip(n) {
  return new Wp({
    type: "optional",
    innerType: n
  });
}
const az = /* @__PURE__ */ q("ZodExactOptional", (n, i) => {
  j_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => Fp(n, u, r, o), n.unwrap = () => n._zod.def.innerType;
});
function iz(n) {
  return new az({
    type: "optional",
    innerType: n
  });
}
const lz = /* @__PURE__ */ q("ZodNullable", (n, i) => {
  x_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => XS(n, u, r, o), n.unwrap = () => n._zod.def.innerType;
});
function lp(n) {
  return new lz({
    type: "nullable",
    innerType: n
  });
}
const uz = /* @__PURE__ */ q("ZodDefault", (n, i) => {
  E_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => JS(n, u, r, o), n.unwrap = () => n._zod.def.innerType, n.removeDefault = n.unwrap;
});
function sz(n, i) {
  return new uz({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : Op(i);
    }
  });
}
const rz = /* @__PURE__ */ q("ZodPrefault", (n, i) => {
  T_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => FS(n, u, r, o), n.unwrap = () => n._zod.def.innerType;
});
function cz(n, i) {
  return new rz({
    type: "prefault",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : Op(i);
    }
  });
}
const Pp = /* @__PURE__ */ q("ZodNonOptional", (n, i) => {
  A_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => VS(n, u, r, o), n.unwrap = () => n._zod.def.innerType;
});
function oz(n, i) {
  return new Pp({
    type: "nonoptional",
    innerType: n,
    ...P(i)
  });
}
const fz = /* @__PURE__ */ q("ZodCatch", (n, i) => {
  O_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => IS(n, u, r, o), n.unwrap = () => n._zod.def.innerType, n.removeCatch = n.unwrap;
});
function dz(n, i) {
  return new fz({
    type: "catch",
    innerType: n,
    catchValue: typeof i == "function" ? i : () => i
  });
}
const hz = /* @__PURE__ */ q("ZodPipe", (n, i) => {
  N_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => WS(n, u, r, o), n.in = i.in, n.out = i.out;
});
function up(n, i) {
  return new hz({
    type: "pipe",
    in: n,
    out: i
    // ...util.normalizeParams(params),
  });
}
const mz = /* @__PURE__ */ q("ZodReadonly", (n, i) => {
  C_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => PS(n, u, r, o), n.unwrap = () => n._zod.def.innerType;
});
function pz(n) {
  return new mz({
    type: "readonly",
    innerType: n
  });
}
const vz = /* @__PURE__ */ q("ZodCustom", (n, i) => {
  M_.init(n, i), Ze.init(n, i), n._zod.processJSONSchema = (u, r, o) => BS(n, u);
});
function yz(n, i = {}) {
  return /* @__PURE__ */ TS(vz, n, i);
}
function gz(n, i) {
  return /* @__PURE__ */ AS(n, i);
}
function Yt(n) {
  return /* @__PURE__ */ rS(fo, n);
}
const la = {
  courseId: null,
  topic: "",
  learningObjectives: [],
  difficulty: "",
  questionCount: null,
  language: "English",
  questionTypeDistribution: {
    multipleChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
    essay: 0,
    coding: 0
  },
  useIndexedMaterialOnly: !1,
  includeExplanations: !0,
  timeLimitMinutes: null,
  tags: [],
  specialInstructions: "",
  missingRequiredFields: ["courseId", "topic", "questionCount", "questionTypeDistribution"],
  readinessStatus: "gathering_requirements",
  materialScope: "general_knowledge_allowed",
  materialIds: [],
  scoringPreferences: ""
}, Nn = P1(k(), sn()), Si = en([k(), Ca(), Ma()]).transform(String), Pt = en([Ca(), k()]).transform((n) => Number(n)), Oa = en([Ca(), k(), G1(), k1()]).transform((n) => n == null || n === "" ? null : Number(n)), ho = en([
  k(),
  ct({
    label: k().optional(),
    value: k().optional()
  }).passthrough()
]), mo = ct({
  id: en([Ca(), k()]).optional(),
  sender: k().optional(),
  senderType: k().optional(),
  role: k().optional(),
  content: k().optional(),
  safeMessageContent: k().optional(),
  messageType: k().optional(),
  createdAt: k().optional(),
  status: k().optional(),
  quickReplies: Ie(ho).optional(),
  metadata: Nn.optional()
}).passthrough(), Kc = en([
  k(),
  ct({
    id: en([Ca(), k()]).optional(),
    materialId: Pt.optional(),
    chunkId: Pt.optional(),
    label: k().optional(),
    sourceLabel: k().optional(),
    excerpt: k().optional(),
    content: k().optional()
  }).passthrough()
]), Xc = ct({
  id: en([Ca(), k()]).optional(),
  type: k().optional(),
  text: k().optional(),
  prompt: k().optional(),
  options: Ie(Si).optional(),
  correctAnswer: Si.optional(),
  explanation: k().optional(),
  difficulty: k().optional(),
  learningObjective: k().optional(),
  points: en([Ca(), k()]).optional(),
  sourceReferences: Ie(Kc).optional(),
  sources: Ie(Kc).optional(),
  sourceHint: k().optional(),
  validationStatus: k().optional()
}).passthrough(), ev = ct({
  id: Oa.optional(),
  draftId: Oa.optional(),
  title: k().optional(),
  description: k().optional(),
  status: k().optional(),
  questions: Ie(Xc).optional(),
  updatedAt: k().optional(),
  draft: ct({
    title: k().optional(),
    description: k().optional(),
    status: k().optional(),
    questions: Ie(Xc).optional(),
    updatedAt: k().optional()
  }).passthrough().optional()
}).passthrough(), bz = ct({
  multipleChoice: Yt().optional(),
  multiple_choice: Yt().optional(),
  trueFalse: Yt().optional(),
  true_false: Yt().optional(),
  shortAnswer: Yt().optional(),
  short_answer: Yt().optional(),
  essay: Yt().optional(),
  coding: Yt().optional()
}).passthrough(), tv = ct({
  courseId: Oa.optional(),
  topic: k().optional(),
  learningObjectives: Ie(Si).optional(),
  difficulty: k().optional(),
  questionCount: Oa.optional(),
  language: k().optional(),
  questionTypeDistribution: bz.optional(),
  useIndexedMaterialOnly: Ma().optional(),
  includeExplanations: Ma().optional(),
  timeLimitMinutes: Oa.optional(),
  tags: Ie(Si).optional(),
  specialInstructions: k().optional(),
  additionalInstructions: k().optional(),
  missingRequiredFields: Ie(Si).optional(),
  readinessStatus: k().optional(),
  materialScope: k().optional(),
  materialMode: k().optional(),
  materialIds: Ie(Pt).optional(),
  scoringPreferences: en([k(), Nn]).optional(),
  gradingPreferences: k().optional(),
  gradingOrScoringPreferences: k().optional()
}).passthrough(), nv = ct({
  status: k().optional(),
  stage: k().optional(),
  currentStage: k().optional(),
  progressStage: k().optional(),
  message: k().optional(),
  canCancel: Ma().optional(),
  startedAt: k().optional(),
  updatedAt: k().optional()
}).passthrough(), _z = ct({
  title: k().optional(),
  questions: Ie(sn()).optional(),
  draft: ct({
    title: k().optional(),
    questions: Ie(sn()).optional()
  }).passthrough().optional()
}).passthrough(), Pu = ct({
  id: Pt.optional(),
  revisionId: Pt.optional(),
  revisionNumber: Pt.optional(),
  revisionType: k().optional(),
  requestText: k().optional(),
  status: k().optional(),
  summary: k().optional(),
  changes: Ie(Si).optional(),
  destructive: Ma().optional(),
  metadata: Nn.optional(),
  beforeSnapshot: sn().optional(),
  proposedSnapshot: sn().optional(),
  beforeData: sn().optional(),
  afterData: sn().optional(),
  preview: sn().optional(),
  appliedAt: k().optional(),
  createdAt: k().optional()
}).passthrough(), fs = ct({
  id: Pt.optional(),
  conversationId: Pt.optional(),
  title: k().optional(),
  status: k().optional(),
  courseId: Oa.optional(),
  createdAt: k().optional(),
  updatedAt: k().optional(),
  messageCount: Yt().optional(),
  draftId: Oa.optional(),
  plan: tv.optional(),
  messages: Ie(mo).optional(),
  suggestedReplies: Ie(ho).optional(),
  draft: ev.nullable().optional(),
  generation: nv.nullable().optional(),
  pendingRevision: Pu.nullable().optional(),
  revision: Pu.nullable().optional(),
  revisions: Ie(Pu).optional()
}).passthrough();
function Cn(n, i) {
  const u = Nn.safeParse(n);
  if (!u.success) return n;
  for (const r of i)
    if (u.data[r] !== void 0) return u.data[r];
  return n;
}
function Sz(n) {
  const i = String(n.senderType || n.sender || n.role || "assistant").toLowerCase();
  return ["user", "teacher", "admin", "human"].includes(i) ? "user" : i === "system" ? "system" : "assistant";
}
function zz(n) {
  const i = Array.isArray(n.metadata?.quickReplies) ? n.metadata.quickReplies : [], u = n.quickReplies || i;
  return av(u);
}
function av(n) {
  return n.flatMap((i, u) => {
    const r = ho.safeParse(i);
    if (!r.success) return [];
    if (typeof r.data == "string") return [{ label: r.data, value: r.data }];
    const o = r.data.value || r.data.label || "";
    return o ? [{ label: r.data.label || o, value: o }] : [];
  }).map((i, u) => ({ ...i, key: `${u}-${i.value}` })).map(({ label: i, value: u }) => ({ label: i, value: u }));
}
function iv(n, i = 0) {
  const u = mo.parse(n), r = u.status === "failed" ? "failed" : u.status === "pending" ? "pending" : "sent";
  return {
    id: u.id ?? `message-${i}`,
    sender: Sz(u),
    content: u.content || u.safeMessageContent || "",
    messageType: u.messageType || "text",
    createdAt: u.createdAt || "",
    status: r,
    quickReplies: zz(u)
  };
}
function wz(n, i) {
  const u = Kc.parse(n);
  return typeof u == "string" ? { id: `source-${i}`, label: u } : {
    id: u.id ?? `source-${i}`,
    materialId: u.materialId,
    chunkId: u.chunkId,
    label: u.label || u.sourceLabel || `Source ${i + 1}`,
    excerpt: u.excerpt || u.content
  };
}
function jz(n) {
  const i = Xc.parse(n), u = i.sourceReferences || i.sources || (i.sourceHint ? [i.sourceHint] : []), r = Number(i.points ?? 1);
  return {
    id: i.id,
    type: i.type || "multiple_choice",
    text: i.text || i.prompt || "",
    options: i.options || [],
    correctAnswer: i.correctAnswer || "",
    explanation: i.explanation || "",
    difficulty: i.difficulty || "medium",
    learningObjective: i.learningObjective || "",
    points: Number.isFinite(r) && r > 0 ? r : 1,
    sourceReferences: u.map(wz),
    validationStatus: i.validationStatus || "valid"
  };
}
function xz(n) {
  if (n == null) return null;
  const i = ev.parse(Cn(n, ["draft"])), u = i.draft || {};
  return {
    id: i.id ?? i.draftId ?? null,
    title: i.title || u.title || "Untitled quiz draft",
    description: i.description || u.description || "",
    status: i.status || u.status || "draft",
    questions: (i.questions || u.questions || []).map(jz),
    updatedAt: i.updatedAt || u.updatedAt || ""
  };
}
function Ez(n) {
  const i = tv.parse(n || {}), u = i.questionTypeDistribution || {}, r = i.materialScope || (i.materialMode === "general_model_knowledge_allowed" ? "general_knowledge_allowed" : i.materialMode), o = ["course_material_only", "course_material_preferred", "general_knowledge_allowed"].includes(String(r)) ? r : i.useIndexedMaterialOnly ? "course_material_only" : la.materialScope, h = i.scoringPreferences ?? i.gradingPreferences ?? i.gradingOrScoringPreferences, d = typeof h == "string" ? h : h ? JSON.stringify(h) : "";
  return {
    ...la,
    courseId: i.courseId ?? la.courseId,
    topic: i.topic ?? la.topic,
    learningObjectives: i.learningObjectives ?? [],
    difficulty: ["easy", "medium", "hard"].includes(String(i.difficulty)) ? i.difficulty : la.difficulty,
    questionCount: i.questionCount ?? la.questionCount,
    language: i.language ?? la.language,
    questionTypeDistribution: {
      multipleChoice: Math.max(0, Number(u.multipleChoice ?? u.multiple_choice ?? 0)),
      trueFalse: Math.max(0, Number(u.trueFalse ?? u.true_false ?? 0)),
      shortAnswer: Math.max(0, Number(u.shortAnswer ?? u.short_answer ?? 0)),
      essay: Math.max(0, Number(u.essay ?? 0)),
      coding: Math.max(0, Number(u.coding ?? 0))
    },
    useIndexedMaterialOnly: i.useIndexedMaterialOnly ?? o === "course_material_only",
    includeExplanations: i.includeExplanations ?? !0,
    timeLimitMinutes: i.timeLimitMinutes ?? null,
    tags: i.tags ?? [],
    specialInstructions: i.specialInstructions ?? i.additionalInstructions ?? "",
    missingRequiredFields: i.missingRequiredFields ?? [],
    readinessStatus: i.readinessStatus || "gathering_requirements",
    materialScope: o,
    materialIds: i.materialIds ?? [],
    scoringPreferences: d
  };
}
function lv(n) {
  if (!n) return null;
  const i = nv.parse(Cn(n, ["generation"]));
  return {
    status: i.status || "generating",
    stage: i.stage || i.currentStage || i.progressStage || "",
    message: i.message || "",
    canCancel: i.canCancel ?? i.status === "generating",
    startedAt: i.startedAt || "",
    updatedAt: i.updatedAt || ""
  };
}
function sp(n) {
  if (!n) return { title: "", questionCount: null, questions: null };
  const i = _z.safeParse(n);
  if (!i.success) return { title: "", questionCount: null, questions: null };
  const u = i.data.draft, r = i.data.questions || u?.questions || null;
  return {
    title: i.data.title || u?.title || "",
    questionCount: r ? r.length : null,
    questions: r
  };
}
function us(n) {
  if (Array.isArray(n)) return n.map(us);
  const i = Nn.safeParse(n);
  return i.success ? Object.fromEntries(
    Object.keys(i.data).sort().map((u) => [u, us(i.data[u])])
  ) : n;
}
function rp(n) {
  const i = Nn.safeParse(n);
  if (!i.success) return "";
  const u = i.data.id ?? i.data.questionId;
  return typeof u == "string" || typeof u == "number" ? String(u) : "";
}
function cp(n, i) {
  return JSON.stringify(us(n)) === JSON.stringify(us(i));
}
function Tz(n, i) {
  if (!n || !i) return { changed: null, removed: null, added: null };
  const u = n.map(rp), r = i.map(rp);
  if (u.length > 0 && r.length > 0 && u.every(Boolean) && r.every(Boolean) && new Set(u).size === u.length && new Set(r).size === r.length) {
    const v = new Map(u.map((S, A) => [S, n[A]])), y = new Map(r.map((S, A) => [S, i[A]])), g = u.filter((S) => !y.has(S)).length, _ = r.filter((S) => !v.has(S)).length;
    return { changed: u.filter((S) => y.has(S) && !cp(v.get(S), y.get(S))).length, removed: g, added: _ };
  }
  const h = Math.min(n.length, i.length);
  let d = 0;
  for (let v = 0; v < h; v += 1)
    cp(n[v], i[v]) || (d += 1);
  return {
    changed: d,
    removed: Math.max(0, n.length - i.length),
    added: Math.max(0, i.length - n.length)
  };
}
function qc(n, i) {
  const u = Number(n?.[i]);
  return Number.isSafeInteger(u) && u >= 0 ? u : null;
}
function Az(n) {
  const i = String(n.status || "").toLowerCase(), u = n.metadata?.applied;
  return !!n.appliedAt?.trim() || u === !0 || u === "true" || ["applied", "accepted", "completed"].includes(i);
}
function uv(n, i = !1) {
  if (Az(n)) return !1;
  const u = String(n.status || "").toLowerCase(), r = n.metadata || {};
  return r.requiresConfirmation === !0 || r.previewOnly === !0 ? !0 : r.draftOnly === !0 || n.revisionType === "initial_generation" ? !1 : ["preview", "pending", "pending_confirmation", "awaiting_confirmation", "unapplied"].includes(u) ? n.revisionType !== "whole_quiz_revision" || r.requiresConfirmation === !0 : i;
}
function po(n) {
  if (!n) return null;
  const i = Nn.safeParse(n), u = i.success ? i.data.preview : void 0, r = Cn(n, ["revision", "pendingRevision"]), o = Pu.safeParse(r);
  if (!o.success) return null;
  const h = o.data.id ?? o.data.revisionId;
  if (!h) return null;
  const d = sp(o.data.beforeSnapshot || o.data.beforeData), v = sp(
    o.data.proposedSnapshot || o.data.afterData || o.data.preview || u
  ), y = Tz(d.questions, v.questions), g = Array.isArray(o.data.metadata?.questionIndexes) ? new Set(
    o.data.metadata.questionIndexes.map(Number).filter((C) => Number.isSafeInteger(C) && C >= 0)
  ).size : null, _ = y.changed ?? g ?? qc(o.data.metadata, "changedQuestionCount"), j = y.removed ?? qc(o.data.metadata, "removedQuestionCount") ?? (d.questionCount !== null && v.questionCount !== null ? Math.max(0, d.questionCount - v.questionCount) : null), S = y.added ?? qc(o.data.metadata, "addedQuestionCount") ?? (d.questionCount !== null && v.questionCount !== null ? Math.max(0, v.questionCount - d.questionCount) : null), A = v.title || d.title;
  return {
    id: h,
    revisionNumber: o.data.revisionNumber ?? null,
    revisionType: o.data.revisionType || "",
    requestText: o.data.requestText || "",
    status: o.data.status || "preview",
    summary: o.data.summary || (o.data.requestText ? `Requested change: ${o.data.requestText}` : "Review the proposed quiz changes."),
    changes: o.data.changes || [],
    destructive: o.data.destructive ?? !!j,
    beforeSnapshot: {
      title: d.title,
      questionCount: d.questionCount
    },
    proposedSnapshot: {
      title: A,
      questionCount: v.questionCount
    },
    changedQuestionCount: _,
    removedQuestionCount: j,
    addedQuestionCount: S,
    createdAt: o.data.createdAt || ""
  };
}
function Oz(n) {
  const i = n.map((u, r) => ({ raw: u, index: r })).filter(({ raw: u }) => uv(u)).sort((u, r) => {
    const o = Number(r.raw.revisionNumber || 0) - Number(u.raw.revisionNumber || 0);
    if (o) return o;
    const h = Date.parse(r.raw.createdAt || "") - Date.parse(u.raw.createdAt || "");
    return Number.isFinite(h) && h ? h : u.index - r.index;
  })[0]?.raw;
  return i ? po(i) : null;
}
function sv(n) {
  const i = fs.parse(n), u = i.id ?? i.conversationId;
  if (!u) throw new Error("AI conversation response is missing an id.");
  return {
    id: u,
    title: i.title || "New quiz conversation",
    status: i.status || i.plan?.readinessStatus || "gathering_requirements",
    courseId: i.courseId ?? i.plan?.courseId ?? null,
    createdAt: i.createdAt || "",
    updatedAt: i.updatedAt || "",
    messageCount: i.messageCount ?? i.messages?.length ?? 0,
    draftId: i.draftId ?? i.draft?.id ?? i.draft?.draftId ?? null
  };
}
function Vc(n) {
  const i = Cn(n, ["conversation"]), u = fs.parse(i), r = sv(u), o = u.pendingRevision || u.revision, h = o && uv(
    o,
    !!u.pendingRevision
  ) ? po(o) : Oz(u.revisions || []);
  return {
    ...r,
    plan: Ez(u.plan || {}),
    messages: (u.messages || []).map(iv),
    suggestedReplies: av(u.suggestedReplies || []),
    draft: xz(u.draft),
    generation: lv(u.generation),
    pendingRevision: h
  };
}
function Nz(n) {
  const i = Cn(n, ["conversations", "items", "data"]);
  return Ie(fs).parse(i).map(sv);
}
const Cz = ct({
  id: Pt,
  code: k().optional(),
  title: k().optional(),
  name: k().optional()
}).passthrough();
function Mz(n) {
  const i = Cn(n, ["courses", "items", "data"]);
  return Ie(Cz).parse(i).map((u) => ({
    id: u.id,
    code: u.code || `COURSE-${u.id}`,
    title: u.title || u.name || "Untitled course"
  }));
}
const Dz = ct({
  id: Pt,
  courseId: Pt,
  originalName: k().optional(),
  name: k().optional(),
  byteSize: Yt().optional(),
  chunkCount: Yt().optional(),
  status: k().optional(),
  createdAt: k().optional(),
  errorMessage: k().optional(),
  error: k().optional()
}).passthrough();
function Rz(n) {
  const i = Cn(n, ["materials", "items", "data"]);
  return Ie(Dz).parse(i).map((u) => ({
    id: u.id,
    courseId: u.courseId,
    originalName: u.originalName || u.name || `Material ${u.id}`,
    byteSize: u.byteSize || 0,
    chunkCount: u.chunkCount || 0,
    status: u.status || "ready",
    createdAt: u.createdAt || "",
    errorMessage: u.errorMessage || u.error || ""
  }));
}
const qz = ct({
  enabled: Ma().optional(),
  configured: Ma().optional(),
  source: k().optional(),
  endpoint: k().optional(),
  maskedApiKey: k().optional(),
  chatDeployment: k().optional(),
  embeddingDeployment: k().optional(),
  apiVersion: k().optional(),
  message: k().optional()
}).passthrough();
function op(n) {
  const i = qz.parse(Cn(n, ["settings"]));
  return {
    enabled: i.enabled ?? !0,
    configured: i.configured ?? !1,
    source: i.source || "none",
    endpoint: i.endpoint || "",
    maskedApiKey: i.maskedApiKey || "",
    chatDeployment: i.chatDeployment || "",
    embeddingDeployment: i.embeddingDeployment || "",
    apiVersion: i.apiVersion || "",
    message: i.message || ""
  };
}
function ia(n) {
  const i = Nn.parse(n), u = i.conversation || (i.id || i.conversationId ? i : null);
  let r = null;
  if (u) {
    const h = fs.safeParse(u);
    h.success && (h.data.id || h.data.conversationId) && (r = Vc(h.data));
  }
  const o = i.message && typeof i.message == "object" ? mo.safeParse(i.message) : null;
  return {
    conversation: r,
    revision: po(i.revision || i.pendingRevision ? {
      revision: i.revision || i.pendingRevision,
      preview: i.preview
    } : null),
    message: o?.success ? iv(o.data) : null,
    notice: typeof i.message == "string" ? i.message : typeof i.notice == "string" ? i.notice : ""
  };
}
function Uz(n) {
  return lv(n) || {
    status: "generating",
    stage: "",
    message: "",
    canCancel: !0,
    startedAt: "",
    updatedAt: ""
  };
}
function Zz(n) {
  const i = ct({
    label: k().optional(),
    sourceLabel: k().optional(),
    content: k().optional(),
    excerpt: k().optional(),
    chunkIndex: Yt().optional()
  }).passthrough().parse(Cn(n, ["chunk", "source"]));
  return {
    label: i.label || i.sourceLabel || `Source chunk ${(i.chunkIndex ?? 0) + 1}`,
    content: i.content || i.excerpt || ""
  };
}
function Fu(n) {
  return Nn.parse(n);
}
function Qz(n) {
  return {
    async listConversations() {
      return Nz(await n.getAiConversations());
    },
    async createConversation(i = {}) {
      return Vc(await n.createAiConversation(i));
    },
    async getConversation(i) {
      return Vc(await n.getAiConversation(i));
    },
    async sendMessage(i, u) {
      return ia(await n.sendAiConversationMessage(i, u));
    },
    async updatePlan(i, u) {
      const r = { ...u };
      return u.scoringPreferences !== void 0 && (r.gradingPreferences = u.scoringPreferences, delete r.scoringPreferences), ia(await n.updateAiConversationPlan(i, r));
    },
    async generateDraft(i, u) {
      return ia(await n.generateAiConversationDraft(i, u));
    },
    async getGenerationStatus(i) {
      return Uz(await n.getAiConversationGenerationStatus(i));
    },
    async cancelGeneration(i) {
      return ia(await n.cancelAiConversationGeneration(i));
    },
    async reviseDraft(i, u) {
      return ia(await n.reviseAiConversationDraft(i, u));
    },
    async applyRevision(i, u) {
      return ia(await n.applyAiConversationRevision(i, u));
    },
    async regenerateQuestions(i, u, r) {
      return ia(await n.regenerateAiConversationQuestions(i, u, r));
    },
    async saveDraft(i, u) {
      return ia(await n.saveAiConversationDraft(i, u));
    },
    async listCourses() {
      return Mz(await n.getCourses());
    },
    async getSettings() {
      return op(await n.getAiSettingsStatus());
    },
    async saveSettings(i) {
      return op(await n.saveAiSettings(i));
    },
    async testSettings(i) {
      return Fu(await n.testAiSettings(i));
    },
    async listMaterials(i) {
      return Rz(await n.getAiMaterials(i));
    },
    async uploadMaterial(i, u) {
      return Fu(await n.uploadAiMaterial(i, u));
    },
    async pasteMaterial(i, u) {
      return Fu(await n.pasteAiMaterial(i, u));
    },
    async deleteMaterial(i, u) {
      return Fu(await n.deleteAiMaterial(i, u));
    },
    async getMaterialChunk(i, u, r) {
      return Zz(await n.getAiMaterialChunk(i, u, r));
    }
  };
}
const fp = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function vo({ title: n, description: i, onClose: u, size: r = "normal", children: o }) {
  const h = J.useId(), d = J.useId(), v = J.useRef(null), y = J.useRef(null);
  J.useEffect(() => {
    y.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const _ = v.current;
    (_?.querySelector(fp) || _)?.focus();
    const S = (A) => {
      A.key === "Escape" && (A.preventDefault(), u());
    };
    return document.addEventListener("keydown", S), () => {
      document.removeEventListener("keydown", S), y.current?.focus();
    };
  }, [u]);
  const g = (_) => {
    if (_.key !== "Tab" || !v.current) return;
    const j = Array.from(
      v.current.querySelectorAll(fp)
    ).filter((C) => !C.hidden);
    if (!j.length) {
      _.preventDefault(), v.current.focus();
      return;
    }
    const S = j[0], A = j[j.length - 1];
    _.shiftKey && document.activeElement === S ? (_.preventDefault(), A.focus()) : !_.shiftKey && document.activeElement === A && (_.preventDefault(), S.focus());
  };
  return /* @__PURE__ */ m.jsx(
    "div",
    {
      className: "aiw-modal-backdrop",
      onMouseDown: (_) => {
        _.currentTarget === _.target && u();
      },
      children: /* @__PURE__ */ m.jsxs(
        "div",
        {
          ref: v,
          className: `aiw-modal aiw-modal--${r}`,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": h,
          "aria-describedby": i ? d : void 0,
          tabIndex: -1,
          onKeyDown: g,
          children: [
            /* @__PURE__ */ m.jsxs("header", { className: "aiw-modal__header", children: [
              /* @__PURE__ */ m.jsxs("div", { children: [
                /* @__PURE__ */ m.jsx("h2", { id: h, children: n }),
                i ? /* @__PURE__ */ m.jsx("p", { id: d, children: i }) : null
              ] }),
              /* @__PURE__ */ m.jsx("button", { className: "aiw-icon-button", type: "button", onClick: u, "aria-label": "Close dialog", children: "×" })
            ] }),
            /* @__PURE__ */ m.jsx("div", { className: "aiw-modal__body", children: o })
          ]
        }
      )
    }
  );
}
const Hz = {
  endpoint: "",
  apiKey: "",
  chatDeployment: "",
  embeddingDeployment: "",
  apiVersion: ""
};
function Bz({ client: n, onClose: i, onToast: u }) {
  const r = xi(), [o, h] = J.useState(Hz), [d, v] = J.useState(""), y = Tn({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  });
  J.useEffect(() => {
    const C = y.data;
    C && h((M) => ({
      ...M,
      endpoint: C.endpoint,
      chatDeployment: C.chatDeployment,
      embeddingDeployment: C.embeddingDeployment,
      apiVersion: C.apiVersion
    }));
  }, [y.data]);
  const g = Kt({
    mutationFn: () => n.saveSettings(o),
    onSuccess: async () => {
      await r.invalidateQueries({ queryKey: ["ai", "settings"] }), u("Private Azure settings saved.", "success"), i();
    },
    onError: (C) => u(C instanceof Error ? C.message : "Could not save Azure settings.", "error")
  }), _ = Kt({
    mutationFn: () => n.testSettings(o),
    onSuccess: (C) => {
      const M = C.chat === !1 ? "Chat deployment failed." : "Chat deployment connected.", G = C.embeddings === !1 ? " Embedding deployment failed." : C.embeddings === !0 ? " Embedding deployment connected." : "";
      v(`${M}${G}`);
    },
    onError: (C) => v(C instanceof Error ? C.message : "Connection test failed.")
  }), j = (C, M) => {
    h((G) => ({ ...G, [C]: M })), v("");
  }, S = (C) => {
    C.preventDefault(), g.mutate();
  }, A = y.data?.configured ?? !1;
  return /* @__PURE__ */ m.jsxs(
    vo,
    {
      title: "Private Azure settings",
      description: "Credentials stay on the LMS server. Saved API keys are never returned to this browser.",
      onClose: i,
      children: [
        y.isLoading ? /* @__PURE__ */ m.jsx("p", { role: "status", children: "Loading settings…" }) : null,
        y.isError ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Settings could not be loaded." }),
          /* @__PURE__ */ m.jsx("button", { type: "button", onClick: () => y.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ m.jsxs("form", { className: "aiw-dialog-form", onSubmit: S, children: [
          /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ m.jsx("span", { children: "Azure endpoint" }),
            /* @__PURE__ */ m.jsx(
              "input",
              {
                type: "url",
                required: !0,
                value: o.endpoint,
                onChange: (C) => j("endpoint", C.target.value),
                placeholder: "https://your-resource.openai.azure.com"
              }
            )
          ] }),
          /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ m.jsxs("span", { children: [
              "API key",
              y.data?.maskedApiKey ? /* @__PURE__ */ m.jsxs("small", { children: [
                "saved · ",
                y.data.maskedApiKey
              ] }) : null
            ] }),
            /* @__PURE__ */ m.jsx(
              "input",
              {
                type: "password",
                autoComplete: "new-password",
                required: !A,
                value: o.apiKey,
                onChange: (C) => j("apiKey", C.target.value),
                placeholder: A ? "Leave blank to keep saved key" : "Enter your private key"
              }
            )
          ] }),
          /* @__PURE__ */ m.jsxs("div", { className: "aiw-field-row", children: [
            /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ m.jsx("span", { children: "Chat deployment" }),
              /* @__PURE__ */ m.jsx("input", { required: !0, value: o.chatDeployment, onChange: (C) => j("chatDeployment", C.target.value) })
            ] }),
            /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ m.jsx("span", { children: "Embedding deployment" }),
              /* @__PURE__ */ m.jsx(
                "input",
                {
                  value: o.embeddingDeployment,
                  onChange: (C) => j("embeddingDeployment", C.target.value),
                  placeholder: "Required for materials"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ m.jsx("span", { children: "API version" }),
            /* @__PURE__ */ m.jsx(
              "input",
              {
                required: !0,
                value: o.apiVersion,
                onChange: (C) => j("apiVersion", C.target.value),
                placeholder: "2024-10-21"
              }
            )
          ] }),
          /* @__PURE__ */ m.jsxs("div", { className: "aiw-security-note", children: [
            /* @__PURE__ */ m.jsx("strong", { children: "Private by design" }),
            /* @__PURE__ */ m.jsx("span", { children: "Azure calls run on the backend. The browser receives configuration status only." })
          ] }),
          d ? /* @__PURE__ */ m.jsx("p", { className: "aiw-test-result", role: "status", children: d }) : null,
          /* @__PURE__ */ m.jsxs("div", { className: "aiw-dialog-actions aiw-dialog-actions--split", children: [
            /* @__PURE__ */ m.jsx(
              "button",
              {
                className: "aiw-button aiw-button--quiet",
                type: "button",
                onClick: () => _.mutate(),
                disabled: _.isPending || !o.endpoint || !o.chatDeployment || !o.apiVersion,
                children: _.isPending ? "Testing…" : "Test connection"
              }
            ),
            /* @__PURE__ */ m.jsxs("div", { children: [
              /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: i, children: "Cancel" }),
              /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--primary", type: "submit", disabled: g.isPending, children: g.isPending ? "Saving…" : "Save settings" })
            ] })
          ] })
        ] })
      ]
    }
  );
}
const $z = {
  gathering_requirements: "Gathering requirements",
  ready_to_generate: "Ready to generate",
  generating: "Generating",
  generation_failed: "Generation failed",
  review_required: "Review required",
  draft_saved: "Draft saved",
  published: "Published"
}, kz = {
  validating_quiz_plan: "Validating quiz plan",
  retrieving_course_material: "Retrieving course material",
  selecting_source_passages: "Selecting source passages",
  generating_questions: "Generating questions",
  validating_generated_output: "Validating generated output",
  saving_draft: "Saving draft",
  opening_review_workspace: "Opening review workspace"
};
function Jc(n) {
  return n ? $z[n] || n.replaceAll("_", " ") : "Gathering requirements";
}
function dp(n) {
  return n ? kz[n] || n.replaceAll("_", " ") : "Preparing generation";
}
function Lz(n) {
  if (!n) return "";
  const i = new Date(n);
  return Number.isNaN(i.getTime()) ? "" : new Intl.DateTimeFormat(void 0, {
    hour: "numeric",
    minute: "2-digit"
  }).format(i);
}
function Gz(n) {
  return n ? n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB` : "";
}
function ds(n) {
  const i = [];
  n.courseId || i.push("courseId"), n.topic.trim() || i.push("topic"), n.difficulty || i.push("difficulty"), (!n.questionCount || n.questionCount < 1) && i.push("questionCount"), n.language.trim() || i.push("language");
  const u = Object.values(n.questionTypeDistribution).reduce((o, h) => o + Number(h || 0), 0);
  (u < 1 || n.questionCount && u !== n.questionCount) && i.push("questionTypeDistribution");
  const r = n.missingRequiredFields.filter((o) => o === "courseId" ? !n.courseId : o === "topic" ? !n.topic.trim() : o === "difficulty" ? !n.difficulty : o === "questionCount" ? !n.questionCount : o === "language" ? !n.language.trim() : o === "questionTypeDistribution" || o === "questionTypes" ? u < 1 || !!(n.questionCount && u !== n.questionCount) : !0);
  return [.../* @__PURE__ */ new Set([...i, ...r])];
}
function Yz(n) {
  return ds(n).length === 0;
}
function rv(n) {
  return {
    courseId: "course",
    topic: "topic",
    difficulty: "difficulty",
    questionCount: "question count",
    questionTypeDistribution: "question types",
    questionTypes: "question types",
    language: "language",
    learningObjectives: "learning objectives"
  }[n] || n.replaceAll("_", " ");
}
function Kz() {
  return typeof crypto < "u" && typeof crypto.randomUUID == "function" ? crypto.randomUUID() : `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
const Fc = {
  multipleChoice: { short: "MCQ", full: "multiple-choice" },
  trueFalse: { short: "true/false", full: "true/false" },
  shortAnswer: { short: "short answer", full: "short-answer" },
  essay: { short: "essay", full: "essay" },
  coding: { short: "coding", full: "coding" }
}, Xz = /\b(?:algorithm|code|coding|computer|data structure|database|javascript|java|program|python|software|web)\b/i, Uc = 5;
function Xt(n, i) {
  const u = String(n || "").replace(/https?:\/\/\S+/gi, "").replace(/<[^>]*>/g, " ").replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (u.length <= i) return u;
  const r = u.slice(0, i + 1), o = r.lastIndexOf(" ");
  return `${r.slice(0, o > i * 0.6 ? o : i).trim()}…`;
}
function Iu(n) {
  return Xt(
    n.originalName.replace(/\.(?:docx|md|pdf|txt)$/i, "").replace(/[_-]+/g, " "),
    54
  ) || `Material ${n.id}`;
}
function zi(n) {
  return n ? Xt(`${n.code} — ${n.title}`, 72) : "the selected course";
}
function Vz(n, i) {
  return Xt(n.topic, 56) || Xt(i?.title, 56) || "this course";
}
function Jz(n) {
  const i = Object.entries(n.questionTypeDistribution).filter(([, u]) => Number(u) > 0);
  return i.length ? {
    label: i.map(([u, r]) => `${r} ${Fc[u].short}`).join(" + "),
    value: i.map(([u, r]) => `${r} ${Fc[u].full} question${r === 1 ? "" : "s"}`).join(" and ")
  } : null;
}
function Fz(n) {
  return Object.entries(n.questionTypeDistribution).sort((i, u) => Number(u[1]) - Number(i[1]))[0]?.[0] || "multipleChoice";
}
function Iz(n) {
  if (!n.length)
    return [
      {
        label: "Create a concept-check quiz",
        value: "Create a medium concept-check quiz and help me choose its course and topic."
      },
      {
        label: "Build a mixed assessment",
        value: "Build a 10-question mixed assessment with explanations and help me complete the plan."
      },
      {
        label: "Design a source-grounded quiz",
        value: "Design a quiz grounded in my selected course materials."
      }
    ];
  if (n.length === 1) {
    const i = zi(n[0]);
    return [
      {
        label: `Concept check for ${Xt(n[0].code, 24)}`,
        value: `Create a medium concept-check quiz for ${i}.`
      },
      {
        label: `Mixed quiz for ${Xt(n[0].code, 24)}`,
        value: `Build a 10-question mixed quiz for ${i} with explanations.`
      },
      {
        label: `Use ${Xt(n[0].code, 24)} materials`,
        value: `Create a quiz for ${i} using its indexed course materials.`
      }
    ];
  }
  return n.slice(0, 4).map((i, u) => ({
    label: `Quiz for ${Xt(i.code, 24)}`,
    value: u % 2 ? `Create a 10-question mixed quiz for ${zi(i)}.` : `Create a medium concept-check quiz for ${zi(i)}.`
  }));
}
function Wz({
  detail: n,
  plan: i,
  courses: u,
  materials: r
}) {
  if (!n) return Iz(u);
  const o = [], h = /* @__PURE__ */ new Set(), d = (S) => {
    if (!S || o.length >= Uc) return;
    const A = Xt(S.label, 80), C = Xt(S.value, 180), M = C.toLocaleLowerCase();
    !A || !C || h.has(M) || (h.add(M), o.push({ label: A, value: C }));
  };
  n.suggestedReplies.forEach(d);
  const v = u.find((S) => Number(S.id) === Number(i.courseId)), y = ds(i), g = Vz(i, v), _ = r.filter((S) => S.status !== "failed"), j = i.materialIds.length ? _.filter((S) => i.materialIds.includes(S.id)) : _;
  if (y.includes("courseId"))
    u.slice(0, Uc).forEach((S) => d({
      label: `Use ${Xt(S.code, 24)}`,
      value: `Create this quiz for ${zi(S)}.`
    }));
  else if (y.includes("topic"))
    j.slice(0, 2).forEach((S) => d({
      label: `Use ${Iu(S)}`,
      value: `Use the main concepts from “${Iu(S)}” as the quiz topic for ${zi(v)}.`
    })), d({
      label: `Choose a ${Xt(v?.code, 24)} topic`,
      value: `Help me choose a focused topic from ${zi(v)}.`
    });
  else if (y.includes("difficulty"))
    ["easy", "medium", "hard"].forEach((S) => d({
      label: `${S[0].toUpperCase()}${S.slice(1)} ${g}`,
      value: `Make the ${g} quiz ${S}.`
    }));
  else if (y.includes("questionCount"))
    [5, 10, 15].forEach((S) => d({
      label: `${S} ${g} questions`,
      value: `Use ${S} questions for the ${g} quiz.`
    }));
  else if (y.includes("language"))
    ["English", "Turkish", "Spanish"].forEach((S) => d({
      label: `${g} in ${S}`,
      value: `Write the ${g} quiz in ${S}.`
    }));
  else if (y.includes("questionTypeDistribution")) {
    const S = i.questionCount || 10, A = Xz.test(`${g} ${v?.title || ""}`), C = Math.min(2, Math.max(1, Math.floor(S / 4)));
    d({
      label: "Mostly multiple choice",
      value: `Use ${S} mostly multiple-choice questions about ${g}.`
    }), d(A ? {
      label: `MCQ + ${C} coding`,
      value: `Use ${S - C} multiple-choice and ${C} coding questions about ${g}.`
    } : {
      label: `MCQ + ${C} short answer`,
      value: `Use ${S - C} multiple-choice and ${C} short-answer questions about ${g}.`
    }), d({
      label: "Balanced mixed quiz",
      value: `Use a balanced mix of question types for the ${g} quiz.`
    });
  } else {
    const S = Jz(i);
    if (S && d({
      label: `Keep ${S.label}`,
      value: `Keep the ${g} quiz at ${S.value}.`
    }), j.slice(0, 2).forEach((A) => d({
      label: `${i.materialScope === "course_material_only" ? "Use only" : "Ground in"} ${Iu(A)}`,
      value: `${i.materialScope === "course_material_only" ? "Use only" : "Ground the quiz in"} “${Iu(A)}” for the ${g} questions.`
    })), n.draft) {
      const A = Fc[Fz(i)].short;
      d({
        label: `Make ${A} questions harder`,
        value: `Make the ${A} questions more challenging while keeping the ${g} learning objectives.`
      }), d({
        label: i.includeExplanations ? "Tighten explanations" : "Add answer explanations",
        value: i.includeExplanations ? "Make every answer explanation shorter and more precise." : "Add a concise explanation for every answer."
      });
    } else
      i.questionTypeDistribution.coding > 0 && d({
        label: "Make coding questions scenario-based",
        value: `Make the coding questions scenario-based and focused on ${g}.`
      }), d({
        label: i.includeExplanations ? "Use concise explanations" : "Include explanations",
        value: i.includeExplanations ? "Keep the answer explanations concise and instructional." : "Include a concise explanation for every answer."
      });
  }
  return o.length < 3 && [...n.messages].reverse().find((A) => A.sender === "assistant")?.quickReplies.forEach(d), o.slice(0, Uc);
}
function Pz({
  disabled: n,
  isSending: i,
  hasDraft: u,
  onSend: r,
  onAttach: o,
  onPasteMaterial: h
}) {
  const [d, v] = J.useState(""), y = J.useRef(null), g = (j) => {
    j?.preventDefault();
    const S = d.trim();
    !S || n || i || (r(S), v(""));
  }, _ = (j) => {
    j.key === "Enter" && !j.shiftKey && (j.preventDefault(), g());
  };
  return /* @__PURE__ */ m.jsxs("form", { className: "aiw-composer", onSubmit: g, "aria-label": "Message the AI quiz assistant", children: [
    /* @__PURE__ */ m.jsx("label", { htmlFor: "aiw-chat-message", className: "aiw-sr-only", children: u ? "Describe a revision to the quiz draft" : "Describe the quiz you want to create" }),
    /* @__PURE__ */ m.jsx(
      "textarea",
      {
        ref: y,
        id: "aiw-chat-message",
        value: d,
        onChange: (j) => v(j.target.value),
        onKeyDown: _,
        rows: 3,
        maxLength: 8e3,
        disabled: n || i,
        placeholder: u ? "Ask for a controlled revision, for example “Make question 3 harder”…" : "Describe the course, topic, outcomes, difficulty, question types, and special instructions…"
      }
    ),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-composer__footer", children: [
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-composer__tools", children: [
        /* @__PURE__ */ m.jsxs("button", { type: "button", onClick: o, disabled: n, "aria-label": "Upload course material", children: [
          /* @__PURE__ */ m.jsx("span", { "aria-hidden": "true", children: "＋" }),
          " Attach"
        ] }),
        /* @__PURE__ */ m.jsx("button", { type: "button", onClick: h, disabled: n, "aria-label": "Paste course material", children: "Paste notes" })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-composer__send", children: [
        /* @__PURE__ */ m.jsxs("span", { children: [
          d.length,
          "/8000"
        ] }),
        /* @__PURE__ */ m.jsx(
          "button",
          {
            className: "aiw-button aiw-button--primary",
            type: "submit",
            disabled: !d.trim() || n || i,
            children: i ? "Sending…" : u ? "Request revision" : "Send"
          }
        )
      ] })
    ] })
  ] });
}
const hp = [
  "validating_quiz_plan",
  "retrieving_course_material",
  "selecting_source_passages",
  "generating_questions",
  "validating_generated_output",
  "saving_draft",
  "opening_review_workspace"
];
function ew({ generation: n, cancelling: i, onCancel: u }) {
  const r = hp.indexOf(n.stage);
  return /* @__PURE__ */ m.jsxs("section", { className: "aiw-generation", "aria-labelledby": "aiw-generation-title", "aria-live": "polite", children: [
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-generation__head", children: [
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("span", { className: "aiw-eyebrow", children: "Generation in progress" }),
        /* @__PURE__ */ m.jsx("h3", { id: "aiw-generation-title", children: dp(n.stage) }),
        n.message ? /* @__PURE__ */ m.jsx("p", { children: n.message }) : null
      ] }),
      n.canCancel ? /* @__PURE__ */ m.jsx(
        "button",
        {
          className: "aiw-button aiw-button--danger aiw-button--small",
          type: "button",
          onClick: u,
          disabled: i,
          children: i ? "Stopping…" : "Stop generation"
        }
      ) : null
    ] }),
    /* @__PURE__ */ m.jsx("ol", { className: "aiw-generation__stages", "aria-label": "Generation stages", children: hp.map((o, h) => /* @__PURE__ */ m.jsxs(
      "li",
      {
        className: [
          o === n.stage ? "is-current" : "",
          r >= 0 && h < r ? "is-complete" : ""
        ].filter(Boolean).join(" "),
        "aria-current": o === n.stage ? "step" : void 0,
        children: [
          /* @__PURE__ */ m.jsx("span", { "aria-hidden": "true", children: r >= 0 && h < r ? "✓" : h + 1 }),
          dp(o)
        ]
      },
      o
    )) })
  ] });
}
function tw({
  revision: n,
  applying: i,
  onApply: u,
  onDismiss: r
}) {
  const o = n.beforeSnapshot.questionCount, h = n.proposedSnapshot.questionCount, d = n.proposedSnapshot.title || n.beforeSnapshot.title || "Untitled quiz", v = o !== null || h !== null;
  return /* @__PURE__ */ m.jsxs("section", { className: "aiw-revision-preview", "aria-labelledby": "aiw-revision-title", children: [
    /* @__PURE__ */ m.jsxs("div", { children: [
      /* @__PURE__ */ m.jsx("span", { className: "aiw-eyebrow", children: "Revision preview" }),
      /* @__PURE__ */ m.jsx("h3", { id: "aiw-revision-title", children: n.summary }),
      /* @__PURE__ */ m.jsx("p", { children: "No quiz content has been replaced yet." })
    ] }),
    /* @__PURE__ */ m.jsxs("dl", { className: "aiw-revision-facts", children: [
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Proposed title" }),
        /* @__PURE__ */ m.jsx("dd", { children: d })
      ] }),
      v ? /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ m.jsxs(
          "dd",
          {
            "aria-label": `Question count changes from ${o ?? "unknown"} to ${h ?? "unknown"}`,
            children: [
              o ?? "—",
              " ",
              /* @__PURE__ */ m.jsx("span", { "aria-hidden": "true", children: "→" }),
              " ",
              h ?? "—"
            ]
          }
        )
      ] }) : null,
      n.changedQuestionCount ? /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Changed" }),
        /* @__PURE__ */ m.jsx("dd", { children: n.changedQuestionCount })
      ] }) : null,
      n.removedQuestionCount ? /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Removed" }),
        /* @__PURE__ */ m.jsx("dd", { children: n.removedQuestionCount })
      ] }) : null,
      n.addedQuestionCount ? /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Added" }),
        /* @__PURE__ */ m.jsx("dd", { children: n.addedQuestionCount })
      ] }) : null
    ] }),
    n.changes.length ? /* @__PURE__ */ m.jsx("ul", { children: n.changes.map((y, g) => /* @__PURE__ */ m.jsx("li", { children: y }, `${g}-${y}`)) }) : null,
    n.destructive ? /* @__PURE__ */ m.jsx("p", { className: "aiw-warning-note", children: "This revision replaces or removes existing questions. Review it carefully before applying." }) : null,
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-inline-actions", children: [
      /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, disabled: i, children: "Keep current draft" }),
      /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: u, disabled: i, children: i ? "Applying…" : "Apply revision" })
    ] })
  ] });
}
function nw({ replies: n, onSelect: i, disabled: u = !1 }) {
  return n.length ? /* @__PURE__ */ m.jsx("div", { className: "aiw-suggestions", "aria-label": "Suggested replies", children: n.map((r) => /* @__PURE__ */ m.jsx(
    "button",
    {
      type: "button",
      onClick: () => i(r.value),
      disabled: u,
      children: r.label
    },
    `${r.label}-${r.value}`
  )) }) : null;
}
const aw = "What kind of quiz would you like to create? You can describe the course, topic, learning objectives, difficulty, question types and any special instructions.";
function iw({
  detail: n,
  plan: i,
  courses: u,
  materials: r,
  loading: o,
  error: h,
  isSending: d,
  generation: v,
  cancelling: y,
  revision: g,
  applyingRevision: _,
  onRetryLoad: j,
  onSend: S,
  onRetryMessage: A,
  onAttach: C,
  onPasteMaterial: M,
  onCancelGeneration: G,
  onApplyRevision: U,
  onDismissRevision: I,
  review: ee
}) {
  const L = J.useRef(null), B = n?.messages || [], ae = J.useMemo(
    () => Wz({ detail: n, plan: i, courses: u, materials: r }),
    [u, n, r, i]
  ), F = !!n?.draft, te = J.useMemo(() => ds(i), [i]);
  return J.useEffect(() => {
    L.current?.scrollTo({
      top: L.current.scrollHeight,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }, [B.length, d]), /* @__PURE__ */ m.jsxs("section", { className: `aiw-chat ${F ? "aiw-chat--with-review" : ""}`, "aria-labelledby": "aiw-chat-heading", children: [
    /* @__PURE__ */ m.jsxs("header", { className: "aiw-chat__header", children: [
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("span", { className: "aiw-eyebrow", children: "Guided quiz designer" }),
        /* @__PURE__ */ m.jsx("h2", { id: "aiw-chat-heading", children: n?.title || "New quiz conversation" })
      ] }),
      n ? /* @__PURE__ */ m.jsx("span", { className: "aiw-chat__context", children: te.length ? `Still needs ${te.map(rv).slice(0, 2).join(" and ")}` : "Quiz plan is ready" }) : null
    ] }),
    h ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("strong", { children: "Conversation unavailable" }),
        /* @__PURE__ */ m.jsx("p", { children: "Your work is still stored. Try loading it again." })
      ] }),
      /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: j, children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ m.jsxs(
      "div",
      {
        ref: L,
        className: "aiw-message-list",
        "aria-live": "polite",
        "aria-busy": o || d,
        "aria-label": "Conversation messages",
        children: [
          o ? /* @__PURE__ */ m.jsx("p", { className: "aiw-loading-message", role: "status", children: "Loading conversation…" }) : null,
          !o && !B.length ? /* @__PURE__ */ m.jsxs("article", { className: "aiw-message aiw-message--assistant", children: [
            /* @__PURE__ */ m.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ m.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ m.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ m.jsx("p", { children: aw })
            ] })
          ] }) : null,
          B.map((pe) => /* @__PURE__ */ m.jsxs(
            "article",
            {
              className: `aiw-message aiw-message--${pe.sender}`,
              "data-status": pe.status,
              children: [
                /* @__PURE__ */ m.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: pe.sender === "user" ? "You" : "AI" }),
                /* @__PURE__ */ m.jsxs("div", { className: "aiw-message__bubble", children: [
                  /* @__PURE__ */ m.jsxs("div", { className: "aiw-message__meta", children: [
                    /* @__PURE__ */ m.jsx("span", { className: "aiw-message__author", children: pe.sender === "user" ? "You" : "Quiz Assistant" }),
                    pe.createdAt ? /* @__PURE__ */ m.jsx("time", { dateTime: pe.createdAt, children: Lz(pe.createdAt) }) : null
                  ] }),
                  /* @__PURE__ */ m.jsx("p", { children: pe.content }),
                  pe.status === "failed" ? /* @__PURE__ */ m.jsx("button", { type: "button", className: "aiw-text-button", onClick: () => A(pe), children: "Retry message" }) : null
                ] })
              ]
            },
            pe.id
          )),
          d ? /* @__PURE__ */ m.jsxs("article", { className: "aiw-message aiw-message--assistant aiw-message--pending", role: "status", children: [
            /* @__PURE__ */ m.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ m.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ m.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ m.jsxs("span", { className: "aiw-typing", "aria-label": "Assistant is responding", children: [
                /* @__PURE__ */ m.jsx("i", {}),
                /* @__PURE__ */ m.jsx("i", {}),
                /* @__PURE__ */ m.jsx("i", {})
              ] })
            ] })
          ] }) : null
        ]
      }
    ),
    /* @__PURE__ */ m.jsx(nw, { replies: ae, onSelect: S, disabled: d || !!v }),
    g ? /* @__PURE__ */ m.jsx(
      tw,
      {
        revision: g,
        applying: _,
        onApply: () => U(g),
        onDismiss: I
      }
    ) : null,
    v?.status === "generating" ? /* @__PURE__ */ m.jsx(ew, { generation: v, cancelling: y, onCancel: G }) : null,
    /* @__PURE__ */ m.jsx(
      Pz,
      {
        disabled: !!(v && ["queued", "generating", "cancel_requested"].includes(v.status)),
        isSending: d,
        hasDraft: F,
        onSend: S,
        onAttach: C,
        onPasteMaterial: M
      }
    ),
    ee
  ] });
}
function lw({
  conversations: n,
  selectedId: i,
  isLoading: u,
  isCreating: r,
  onNew: o,
  onSelect: h,
  materials: d
}) {
  const [v, y] = J.useState(""), [g, _] = J.useState("all"), j = J.useMemo(() => {
    const A = v.trim().toLocaleLowerCase();
    return n.filter((C) => {
      const M = !A || C.title.toLocaleLowerCase().includes(A), G = g === "all" || C.status === g;
      return M && G;
    });
  }, [n, v, g]), S = n.filter((A) => A.draftId).slice(0, 4);
  return /* @__PURE__ */ m.jsxs("aside", { className: "aiw-sidebar", "aria-label": "AI conversations and materials", children: [
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-sidebar__top", children: [
      /* @__PURE__ */ m.jsxs("button", { className: "aiw-button aiw-button--primary aiw-button--full", type: "button", onClick: o, disabled: r, children: [
        /* @__PURE__ */ m.jsx("span", { "aria-hidden": "true", children: "＋" }),
        r ? "Starting…" : "New conversation"
      ] }),
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-search", children: [
        /* @__PURE__ */ m.jsx("span", { className: "aiw-sr-only", children: "Search conversations" }),
        /* @__PURE__ */ m.jsx("span", { "aria-hidden": "true", children: "⌕" }),
        /* @__PURE__ */ m.jsx(
          "input",
          {
            type: "search",
            value: v,
            onChange: (A) => y(A.target.value),
            placeholder: "Search conversations"
          }
        )
      ] }),
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-field aiw-field--compact", children: [
        /* @__PURE__ */ m.jsx("span", { children: "Status" }),
        /* @__PURE__ */ m.jsxs("select", { value: g, onChange: (A) => _(A.target.value), children: [
          /* @__PURE__ */ m.jsx("option", { value: "all", children: "All conversations" }),
          /* @__PURE__ */ m.jsx("option", { value: "gathering_requirements", children: "Gathering requirements" }),
          /* @__PURE__ */ m.jsx("option", { value: "ready_to_generate", children: "Ready to generate" }),
          /* @__PURE__ */ m.jsx("option", { value: "review_required", children: "Review required" }),
          /* @__PURE__ */ m.jsx("option", { value: "draft_saved", children: "Draft saved" }),
          /* @__PURE__ */ m.jsx("option", { value: "generation_failed", children: "Generation failed" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ m.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-conversations-heading", children: [
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ m.jsx("h2", { id: "aiw-conversations-heading", children: "Conversations" }),
        /* @__PURE__ */ m.jsx("span", { children: j.length })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-conversation-list", children: [
        u ? /* @__PURE__ */ m.jsx("p", { className: "aiw-muted", role: "status", children: "Loading conversations…" }) : null,
        !u && !j.length ? /* @__PURE__ */ m.jsx("div", { className: "aiw-mini-empty", children: /* @__PURE__ */ m.jsx("p", { children: n.length ? "No conversations match this filter." : "No conversations yet." }) }) : null,
        j.map((A) => /* @__PURE__ */ m.jsxs(
          "button",
          {
            className: `aiw-conversation ${i === A.id ? "is-active" : ""}`,
            type: "button",
            onClick: () => h(A.id),
            "aria-current": i === A.id ? "page" : void 0,
            children: [
              /* @__PURE__ */ m.jsx("span", { className: "aiw-conversation__title", children: A.title }),
              /* @__PURE__ */ m.jsx("span", { className: `aiw-status aiw-status--${A.status}`, children: Jc(A.status) })
            ]
          },
          A.id
        ))
      ] })
    ] }),
    S.length ? /* @__PURE__ */ m.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-drafts-heading", children: [
      /* @__PURE__ */ m.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ m.jsx("h2", { id: "aiw-drafts-heading", children: "Recent drafts" }) }),
      /* @__PURE__ */ m.jsx("div", { className: "aiw-compact-list", children: S.map((A) => /* @__PURE__ */ m.jsxs("button", { type: "button", onClick: () => h(A.id), children: [
        /* @__PURE__ */ m.jsx("span", { children: A.title }),
        /* @__PURE__ */ m.jsx("small", { children: Jc(A.status) })
      ] }, A.id)) })
    ] }) : null,
    d
  ] });
}
function uw({
  client: n,
  conversationId: i,
  plan: u,
  onPlanPatch: r,
  onOpenPaste: o,
  onToast: h
}) {
  const d = xi(), [v, y] = J.useState(""), g = u.courseId, _ = Tn({
    queryKey: ["ai", "materials", g],
    queryFn: () => n.listMaterials(g),
    enabled: !!g
  }), j = _.data || [], S = Kt({
    mutationFn: ({ selectedCourseId: U, file: I }) => n.uploadMaterial(U, I),
    onSuccess: async () => {
      await Promise.all([
        d.invalidateQueries({ queryKey: ["ai", "materials", g] }),
        i ? d.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), h("Course material indexed.", "success");
    },
    onError: (U) => h(U instanceof Error ? U.message : "Material upload failed.", "error")
  }), A = Kt({
    mutationFn: ({ selectedCourseId: U, materialId: I }) => n.deleteMaterial(U, I),
    onSuccess: async (U, I) => {
      r({ materialIds: u.materialIds.filter((ee) => ee !== I.materialId) }), await Promise.all([
        d.invalidateQueries({ queryKey: ["ai", "materials", g] }),
        i ? d.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), h("Material removed.", "success");
    },
    onError: (U) => h(U instanceof Error ? U.message : "Could not remove material.", "error")
  }), C = J.useMemo(() => {
    const U = v.trim().toLocaleLowerCase();
    return j.filter((I) => !U || I.originalName.toLocaleLowerCase().includes(U));
  }, [v, j]), M = (U) => {
    const I = U.target.files?.[0];
    U.target.value = "", !(!I || !g) && S.mutate({ selectedCourseId: g, file: I });
  }, G = (U) => {
    if (!i) {
      h("Start a conversation before selecting source material.", "info");
      return;
    }
    const I = u.materialIds.includes(U.id);
    r({
      materialIds: I ? u.materialIds.filter((ee) => ee !== U.id) : [...u.materialIds, U.id]
    });
  };
  return /* @__PURE__ */ m.jsxs("section", { className: "aiw-sidebar__section aiw-materials", "aria-labelledby": "aiw-materials-heading", children: [
    /* @__PURE__ */ m.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ m.jsxs("div", { children: [
      /* @__PURE__ */ m.jsx("h2", { id: "aiw-materials-heading", children: "Course materials" }),
      /* @__PURE__ */ m.jsx("small", { children: g ? `${j.length} indexed` : "Choose a course first" })
    ] }) }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-material-actions", children: [
      /* @__PURE__ */ m.jsxs("label", { className: `aiw-button aiw-button--quiet aiw-button--small ${g ? "" : "is-disabled"}`, children: [
        /* @__PURE__ */ m.jsx("span", { "aria-hidden": "true", children: "↑" }),
        S.isPending ? "Indexing…" : "Upload",
        /* @__PURE__ */ m.jsx(
          "input",
          {
            id: "aiw-material-upload",
            className: "aiw-sr-only",
            type: "file",
            accept: ".pdf,.txt,.md,.docx",
            onChange: M,
            disabled: !g || S.isPending
          }
        )
      ] }),
      /* @__PURE__ */ m.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet aiw-button--small",
          type: "button",
          onClick: o,
          disabled: !g,
          children: "Paste notes"
        }
      )
    ] }),
    j.length > 4 ? /* @__PURE__ */ m.jsxs("label", { className: "aiw-search aiw-search--small", children: [
      /* @__PURE__ */ m.jsx("span", { className: "aiw-sr-only", children: "Filter course materials" }),
      /* @__PURE__ */ m.jsx("span", { "aria-hidden": "true", children: "⌕" }),
      /* @__PURE__ */ m.jsx("input", { value: v, onChange: (U) => y(U.target.value), placeholder: "Filter materials" })
    ] }) : null,
    _.isLoading ? /* @__PURE__ */ m.jsx("p", { className: "aiw-muted", role: "status", children: "Loading materials…" }) : null,
    _.isError ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
      /* @__PURE__ */ m.jsx("span", { children: "Materials could not be loaded." }),
      /* @__PURE__ */ m.jsx("button", { type: "button", onClick: () => _.refetch(), children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-material-list", children: [
      g && !_.isLoading && !C.length ? /* @__PURE__ */ m.jsx("p", { className: "aiw-muted", children: "No indexed material for this course." }) : null,
      C.map((U) => /* @__PURE__ */ m.jsxs("div", { className: "aiw-material", children: [
        /* @__PURE__ */ m.jsxs("label", { children: [
          /* @__PURE__ */ m.jsx(
            "input",
            {
              type: "checkbox",
              checked: u.materialIds.includes(U.id),
              onChange: () => G(U),
              disabled: U.status === "failed"
            }
          ),
          /* @__PURE__ */ m.jsxs("span", { children: [
            /* @__PURE__ */ m.jsx("strong", { children: U.originalName }),
            /* @__PURE__ */ m.jsx("small", { children: U.status === "failed" ? U.errorMessage || "Indexing failed" : `${U.chunkCount} chunks${U.byteSize ? ` · ${Gz(U.byteSize)}` : ""}` })
          ] })
        ] }),
        /* @__PURE__ */ m.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            "aria-label": `Remove ${U.originalName}`,
            disabled: A.isPending,
            onClick: () => {
              g && window.confirm(`Remove “${U.originalName}” and its indexed chunks?`) && A.mutate({ selectedCourseId: g, materialId: U.id });
            },
            children: "×"
          }
        )
      ] }, U.id))
    ] })
  ] });
}
function sw({
  client: n,
  courseId: i,
  conversationId: u,
  onClose: r,
  onToast: o
}) {
  const h = xi(), [d, v] = J.useState("Pasted course notes"), [y, g] = J.useState(""), _ = Kt({
    mutationFn: () => n.pasteMaterial(i, { name: d.trim(), content: y.trim() }),
    onSuccess: async () => {
      await Promise.all([
        h.invalidateQueries({ queryKey: ["ai", "materials", i] }),
        u ? h.invalidateQueries({ queryKey: ["ai", "conversation", u] }) : Promise.resolve()
      ]), o("Pasted notes indexed.", "success"), r();
    },
    onError: (S) => o(S instanceof Error ? S.message : "Could not index pasted notes.", "error")
  }), j = (S) => {
    S.preventDefault(), d.trim() && y.trim() && _.mutate();
  };
  return /* @__PURE__ */ m.jsx(
    vo,
    {
      title: "Paste course material",
      description: "The text is treated as untrusted reference content and indexed only for this course.",
      onClose: r,
      size: "wide",
      children: /* @__PURE__ */ m.jsxs("form", { className: "aiw-dialog-form", onSubmit: j, children: [
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Material name" }),
          /* @__PURE__ */ m.jsx("input", { value: d, onChange: (S) => v(S.target.value), maxLength: 160, required: !0 })
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Course notes" }),
          /* @__PURE__ */ m.jsx(
            "textarea",
            {
              value: y,
              onChange: (S) => g(S.target.value),
              rows: 12,
              maxLength: 1e5,
              required: !0,
              placeholder: "Paste lecture notes, reading excerpts, or other course-owned content…"
            }
          )
        ] }),
        /* @__PURE__ */ m.jsxs("p", { className: "aiw-field-hint", children: [
          y.length.toLocaleString(),
          " / 100,000 characters"
        ] }),
        /* @__PURE__ */ m.jsxs("div", { className: "aiw-dialog-actions", children: [
          /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, children: "Cancel" }),
          /* @__PURE__ */ m.jsx(
            "button",
            {
              className: "aiw-button aiw-button--primary",
              type: "submit",
              disabled: !d.trim() || !y.trim() || _.isPending,
              children: _.isPending ? "Indexing notes…" : "Index pasted text"
            }
          )
        ] })
      ] })
    }
  );
}
const mp = [
  ["multipleChoice", "Multiple choice"],
  ["trueFalse", "True / false"],
  ["shortAnswer", "Short answer"],
  ["essay", "Essay"],
  ["coding", "Coding"]
];
function Wu(n) {
  return n == null || n === "" ? "Not set" : n;
}
function rw({
  plan: n,
  courses: i,
  conversationId: u,
  conversationStatus: r,
  generation: o,
  generating: h,
  generationAvailable: d,
  generationConfigured: v,
  onPatch: y,
  onGenerate: g
}) {
  const _ = ds(n), j = !!u && Yz(n), S = i.find((M) => M.id === n.courseId), A = Object.values(n.questionTypeDistribution).reduce((M, G) => M + Number(G || 0), 0), C = (M, G) => {
    y({
      questionTypeDistribution: {
        ...n.questionTypeDistribution,
        [M]: Math.max(0, G)
      }
    });
  };
  return /* @__PURE__ */ m.jsxs("aside", { className: "aiw-plan", "aria-labelledby": "aiw-plan-heading", children: [
    /* @__PURE__ */ m.jsxs("header", { className: "aiw-plan__header", children: [
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("span", { className: "aiw-eyebrow", children: "Live specification" }),
        /* @__PURE__ */ m.jsx("h2", { id: "aiw-plan-heading", children: "Quiz Plan" })
      ] }),
      /* @__PURE__ */ m.jsxs("span", { className: `aiw-readiness ${j ? "is-ready" : ""}`, children: [
        /* @__PURE__ */ m.jsx("i", { "aria-hidden": "true" }),
        j ? "Ready" : `${_.length} missing`
      ] })
    ] }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-plan__status", children: [
      /* @__PURE__ */ m.jsx("span", { children: "Status" }),
      /* @__PURE__ */ m.jsx("strong", { children: Jc(o?.status || r) })
    ] }),
    /* @__PURE__ */ m.jsxs("dl", { className: "aiw-plan-summary", children: [
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Course" }),
        /* @__PURE__ */ m.jsx("dd", { children: S ? `${S.code} · ${S.title}` : "Not set" })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Topic" }),
        /* @__PURE__ */ m.jsx("dd", { children: Wu(n.topic) })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Difficulty" }),
        /* @__PURE__ */ m.jsx("dd", { children: Wu(n.difficulty) })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ m.jsx("dd", { children: Wu(n.questionCount) })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Language" }),
        /* @__PURE__ */ m.jsx("dd", { children: Wu(n.language) })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("dt", { children: "Knowledge scope" }),
        /* @__PURE__ */ m.jsx("dd", { children: n.materialScope.replaceAll("_", " ") })
      ] })
    ] }),
    n.learningObjectives.length ? /* @__PURE__ */ m.jsxs("section", { className: "aiw-plan__objectives", "aria-labelledby": "aiw-objectives-heading", children: [
      /* @__PURE__ */ m.jsx("h3", { id: "aiw-objectives-heading", children: "Learning objectives" }),
      /* @__PURE__ */ m.jsx("ul", { children: n.learningObjectives.map((M) => /* @__PURE__ */ m.jsx("li", { children: M }, M)) })
    ] }) : null,
    /* @__PURE__ */ m.jsxs("section", { className: "aiw-plan__types", "aria-labelledby": "aiw-type-summary-heading", children: [
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ m.jsx("h3", { id: "aiw-type-summary-heading", children: "Question mix" }),
        /* @__PURE__ */ m.jsxs("span", { children: [
          A,
          "/",
          n.questionCount || 0
        ] })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-type-bars", children: [
        mp.filter(([M]) => n.questionTypeDistribution[M] > 0).map(([M, G]) => /* @__PURE__ */ m.jsxs("div", { children: [
          /* @__PURE__ */ m.jsx("span", { children: G }),
          /* @__PURE__ */ m.jsx("strong", { children: n.questionTypeDistribution[M] })
        ] }, M)),
        A ? null : /* @__PURE__ */ m.jsx("p", { className: "aiw-muted", children: "No question types selected." })
      ] })
    ] }),
    v ? d ? u ? _.length ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-plan-note", role: "status", children: [
      /* @__PURE__ */ m.jsx("strong", { children: "Still needed:" }),
      " ",
      _.map(rv).join(", ")
    ] }) : /* @__PURE__ */ m.jsx("div", { className: "aiw-plan-note aiw-plan-note--success", role: "status", children: "The plan is complete. Generation starts only when you choose Generate Draft." }) : /* @__PURE__ */ m.jsx("p", { className: "aiw-plan-note", children: "Start a conversation to build and save a quiz plan." }) : /* @__PURE__ */ m.jsx("div", { className: "aiw-plan-note", role: "status", children: "AI generation is currently disabled. Your Quiz Plan remains saved." }) : /* @__PURE__ */ m.jsx("div", { className: "aiw-plan-note", role: "status", children: "Configure Azure OpenAI in Azure settings before generating a draft." }),
    /* @__PURE__ */ m.jsx(
      "button",
      {
        className: "aiw-button aiw-button--primary aiw-button--full aiw-generate-button",
        type: "button",
        onClick: g,
        disabled: !j || h || !d,
        children: h ? "Generating draft…" : r === "generation_failed" ? "Retry generation" : "Generate Draft"
      }
    ),
    /* @__PURE__ */ m.jsx("p", { className: "aiw-safety-copy", children: "Generation always creates a private draft. Nothing is published automatically." }),
    /* @__PURE__ */ m.jsxs("details", { className: "aiw-advanced", children: [
      /* @__PURE__ */ m.jsxs("summary", { children: [
        /* @__PURE__ */ m.jsx("span", { children: "Advanced settings" }),
        /* @__PURE__ */ m.jsx("small", { children: "Direct controls for the same Quiz Plan" })
      ] }),
      /* @__PURE__ */ m.jsxs("fieldset", { disabled: !u || h, children: [
        /* @__PURE__ */ m.jsx("legend", { className: "aiw-sr-only", children: "Advanced Quiz Plan settings" }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Course" }),
          /* @__PURE__ */ m.jsxs(
            "select",
            {
              "aria-label": "Quiz course",
              value: n.courseId || "",
              onChange: (M) => y({ courseId: M.target.value ? Number(M.target.value) : null }),
              children: [
                /* @__PURE__ */ m.jsx("option", { value: "", children: "Select a course" }),
                i.map((M) => /* @__PURE__ */ m.jsxs("option", { value: M.id, children: [
                  M.code,
                  " — ",
                  M.title
                ] }, M.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Topic" }),
          /* @__PURE__ */ m.jsx(
            "input",
            {
              value: n.topic,
              maxLength: 500,
              onChange: (M) => y({ topic: M.target.value }),
              placeholder: "e.g. Python loops"
            }
          )
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsxs("span", { children: [
            "Learning objectives ",
            /* @__PURE__ */ m.jsx("small", { children: "one per line" })
          ] }),
          /* @__PURE__ */ m.jsx(
            "textarea",
            {
              rows: 3,
              value: n.learningObjectives.join(`
`),
              onChange: (M) => y({
                learningObjectives: M.target.value.split(`
`).map((G) => G.trim()).filter(Boolean)
              })
            }
          )
        ] }),
        /* @__PURE__ */ m.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ m.jsx("span", { children: "Difficulty" }),
            /* @__PURE__ */ m.jsxs(
              "select",
              {
                value: n.difficulty,
                onChange: (M) => y({ difficulty: M.target.value }),
                children: [
                  /* @__PURE__ */ m.jsx("option", { value: "", children: "Select difficulty" }),
                  /* @__PURE__ */ m.jsx("option", { value: "easy", children: "Easy" }),
                  /* @__PURE__ */ m.jsx("option", { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ m.jsx("option", { value: "hard", children: "Hard" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ m.jsx("span", { children: "Question count" }),
            /* @__PURE__ */ m.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 20,
                value: n.questionCount || "",
                onChange: (M) => y({
                  questionCount: M.target.value ? Number(M.target.value) : null
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ m.jsxs("fieldset", { className: "aiw-distribution", children: [
          /* @__PURE__ */ m.jsx("legend", { children: "Question type distribution" }),
          /* @__PURE__ */ m.jsx("div", { className: "aiw-distribution__grid", children: mp.map(([M, G]) => /* @__PURE__ */ m.jsxs("label", { children: [
            /* @__PURE__ */ m.jsx("span", { children: G }),
            /* @__PURE__ */ m.jsx(
              "input",
              {
                "aria-label": `${G} count`,
                type: "number",
                min: 0,
                max: 20,
                value: n.questionTypeDistribution[M],
                onChange: (U) => C(M, Number(U.target.value || 0))
              }
            )
          ] }, M)) })
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Language" }),
          /* @__PURE__ */ m.jsx("input", { value: n.language, maxLength: 60, onChange: (M) => y({ language: M.target.value }) })
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Knowledge scope" }),
          /* @__PURE__ */ m.jsxs(
            "select",
            {
              value: n.materialScope,
              onChange: (M) => {
                const G = M.target.value;
                y({
                  materialScope: G,
                  useIndexedMaterialOnly: G === "course_material_only"
                });
              },
              children: [
                /* @__PURE__ */ m.jsx("option", { value: "general_knowledge_allowed", children: "General model knowledge allowed" }),
                /* @__PURE__ */ m.jsx("option", { value: "course_material_preferred", children: "Course material preferred" }),
                /* @__PURE__ */ m.jsx("option", { value: "course_material_only", children: "Course material only" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-check", children: [
          /* @__PURE__ */ m.jsx(
            "input",
            {
              type: "checkbox",
              checked: n.includeExplanations,
              onChange: (M) => y({ includeExplanations: M.target.checked })
            }
          ),
          /* @__PURE__ */ m.jsx("span", { children: "Include answer explanations" })
        ] }),
        /* @__PURE__ */ m.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ m.jsxs("span", { children: [
              "Time limit ",
              /* @__PURE__ */ m.jsx("small", { children: "minutes" })
            ] }),
            /* @__PURE__ */ m.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 600,
                value: n.timeLimitMinutes || "",
                onChange: (M) => y({
                  timeLimitMinutes: M.target.value ? Number(M.target.value) : null
                })
              }
            )
          ] }),
          /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ m.jsxs("span", { children: [
              "Tags ",
              /* @__PURE__ */ m.jsx("small", { children: "comma separated" })
            ] }),
            /* @__PURE__ */ m.jsx(
              "input",
              {
                value: n.tags.join(", "),
                onChange: (M) => y({
                  tags: M.target.value.split(",").map((G) => G.trim()).filter(Boolean)
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Additional instructions" }),
          /* @__PURE__ */ m.jsx(
            "textarea",
            {
              rows: 3,
              maxLength: 4e3,
              value: n.specialInstructions,
              onChange: (M) => y({ specialInstructions: M.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Scoring preferences" }),
          /* @__PURE__ */ m.jsx(
            "textarea",
            {
              rows: 2,
              maxLength: 1e3,
              value: n.scoringPreferences,
              onChange: (M) => y({ scoringPreferences: M.target.value }),
              placeholder: "e.g. 2 points each, partial credit for essays"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const cw = [
  ["multiple_choice", "Multiple choice"],
  ["true_false", "True / false"],
  ["short_answer", "Short answer"],
  ["essay", "Essay"],
  ["coding", "Coding"]
];
function pp(n) {
  return {
    ...n,
    questions: n.questions.map((i) => ({
      ...i,
      options: [...i.options],
      sourceReferences: i.sourceReferences.map((u) => ({ ...u }))
    }))
  };
}
function ow() {
  return {
    type: "multiple_choice",
    text: "",
    options: ["Option A", "Option B", "Option C"],
    correctAnswer: "Option A",
    explanation: "",
    difficulty: "medium",
    learningObjective: "",
    points: 1,
    sourceReferences: [],
    validationStatus: "pending_review"
  };
}
function fw({
  question: n,
  index: i,
  total: u,
  selected: r,
  disabled: o,
  onSelect: h,
  onChange: d,
  onMove: v,
  onDelete: y,
  onDuplicate: g,
  onRegenerate: _,
  onOpenSource: j
}) {
  const S = J.useId(), A = n.type === "multiple_choice", C = n.type === "true_false", M = (U, I) => {
    d({ ...n, [U]: I });
  }, G = (U) => {
    if (U === "multiple_choice") {
      const I = n.options.length >= 3 ? n.options : ["Option A", "Option B", "Option C"];
      d({ ...n, type: U, options: I, correctAnswer: I.includes(n.correctAnswer) ? n.correctAnswer : I[0] });
    } else d(U === "true_false" ? { ...n, type: U, options: ["true", "false"], correctAnswer: ["true", "false"].includes(n.correctAnswer) ? n.correctAnswer : "true" } : { ...n, type: U, options: [] });
  };
  return /* @__PURE__ */ m.jsxs("article", { className: `aiw-question ${r ? "is-selected" : ""}`, "aria-labelledby": `${S}-title`, children: [
    /* @__PURE__ */ m.jsxs("header", { className: "aiw-question__header", children: [
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-question__select", children: [
        /* @__PURE__ */ m.jsx(
          "input",
          {
            type: "checkbox",
            checked: r,
            onChange: (U) => h(U.target.checked),
            disabled: o
          }
        ),
        /* @__PURE__ */ m.jsx("span", { className: "aiw-question__number", "aria-hidden": "true", children: i + 1 }),
        /* @__PURE__ */ m.jsxs("span", { className: "aiw-sr-only", children: [
          "Select question ",
          i + 1
        ] })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsxs("h4", { id: `${S}-title`, children: [
          "Question ",
          i + 1
        ] }),
        /* @__PURE__ */ m.jsx("span", { className: `aiw-validation aiw-validation--${n.validationStatus}`, children: n.validationStatus.replaceAll("_", " ") })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-question__order", "aria-label": `Reorder question ${i + 1}`, children: [
        /* @__PURE__ */ m.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            onClick: () => v(-1),
            disabled: o || i === 0,
            "aria-label": `Move question ${i + 1} up`,
            children: "↑"
          }
        ),
        /* @__PURE__ */ m.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            onClick: () => v(1),
            disabled: o || i === u - 1,
            "aria-label": `Move question ${i + 1} down`,
            children: "↓"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-question__body", children: [
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-field-row aiw-field-row--three", children: [
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Question type" }),
          /* @__PURE__ */ m.jsx("select", { value: n.type, onChange: (U) => G(U.target.value), disabled: o, children: cw.map(([U, I]) => /* @__PURE__ */ m.jsx("option", { value: U, children: I }, U)) })
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Difficulty" }),
          /* @__PURE__ */ m.jsxs("select", { value: n.difficulty, onChange: (U) => M("difficulty", U.target.value), disabled: o, children: [
            /* @__PURE__ */ m.jsx("option", { value: "easy", children: "Easy" }),
            /* @__PURE__ */ m.jsx("option", { value: "medium", children: "Medium" }),
            /* @__PURE__ */ m.jsx("option", { value: "hard", children: "Hard" })
          ] })
        ] }),
        /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ m.jsx("span", { children: "Points" }),
          /* @__PURE__ */ m.jsx(
            "input",
            {
              type: "number",
              min: 0.25,
              max: 100,
              step: 0.25,
              value: n.points,
              onChange: (U) => M("points", Number(U.target.value || 1)),
              disabled: o
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ m.jsx("span", { children: "Question prompt" }),
        /* @__PURE__ */ m.jsx(
          "textarea",
          {
            rows: 3,
            maxLength: 4e3,
            value: n.text,
            onChange: (U) => M("text", U.target.value),
            disabled: o
          }
        )
      ] }),
      A ? /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ m.jsxs("span", { children: [
          "Answer options ",
          /* @__PURE__ */ m.jsx("small", { children: "one per line" })
        ] }),
        /* @__PURE__ */ m.jsx(
          "textarea",
          {
            rows: 4,
            value: n.options.join(`
`),
            onChange: (U) => {
              const I = U.target.value.split(`
`), ee = I.includes(n.correctAnswer) ? n.correctAnswer : I.find(Boolean) || "";
              d({ ...n, options: I, correctAnswer: ee });
            },
            disabled: o
          }
        )
      ] }) : null,
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ m.jsx("span", { children: n.type === "essay" ? "Expected answer or rubric" : "Correct answer" }),
        A || C ? /* @__PURE__ */ m.jsx("select", { value: n.correctAnswer, onChange: (U) => M("correctAnswer", U.target.value), disabled: o, children: (C ? ["true", "false"] : n.options.filter(Boolean)).map((U, I) => /* @__PURE__ */ m.jsx("option", { value: U, children: U }, `${I}-${U}`)) }) : /* @__PURE__ */ m.jsx(
          "textarea",
          {
            rows: 2,
            maxLength: 2e3,
            value: n.correctAnswer,
            onChange: (U) => M("correctAnswer", U.target.value),
            disabled: o
          }
        )
      ] }),
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ m.jsx("span", { children: "Explanation" }),
        /* @__PURE__ */ m.jsx(
          "textarea",
          {
            rows: 3,
            maxLength: 4e3,
            value: n.explanation,
            onChange: (U) => M("explanation", U.target.value),
            disabled: o
          }
        )
      ] }),
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ m.jsx("span", { children: "Learning objective" }),
        /* @__PURE__ */ m.jsx(
          "input",
          {
            maxLength: 500,
            value: n.learningObjective,
            onChange: (U) => M("learningObjective", U.target.value),
            disabled: o
          }
        )
      ] }),
      n.sourceReferences.length ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-question__sources", children: [
        /* @__PURE__ */ m.jsx("span", { children: "Sources" }),
        /* @__PURE__ */ m.jsx("div", { children: n.sourceReferences.map((U) => /* @__PURE__ */ m.jsx(
          "button",
          {
            type: "button",
            onClick: () => j(U),
            disabled: o && !U.excerpt && !(U.materialId && U.chunkId),
            children: U.label
          },
          U.id || U.label
        )) })
      ] }) : null
    ] }),
    /* @__PURE__ */ m.jsxs("footer", { className: "aiw-question__actions", children: [
      /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: _, disabled: o, children: "Regenerate" }),
      /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: g, disabled: o, children: "Duplicate" }),
      /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--danger aiw-button--small", type: "button", onClick: y, disabled: o, children: "Delete" })
    ] })
  ] });
}
function dw({
  draft: n,
  saving: i,
  regenerating: u,
  onSave: r,
  onRegenerate: o,
  onOpenSource: h
}) {
  const [d, v] = J.useState(() => pp(n)), [y, g] = J.useState(() => JSON.stringify(n)), [_, j] = J.useState(/* @__PURE__ */ new Set()), S = i || u;
  J.useEffect(() => {
    v(pp(n)), g(JSON.stringify(n)), j(/* @__PURE__ */ new Set());
  }, [n]);
  const A = J.useMemo(() => JSON.stringify(d) !== y, [d, y]), C = (L, B) => {
    v((ae) => ({
      ...ae,
      questions: ae.questions.map((F, te) => te === L ? B : F)
    }));
  }, M = (L, B) => {
    const ae = L + B;
    ae < 0 || ae >= d.questions.length || (v((F) => {
      const te = [...F.questions];
      return [te[L], te[ae]] = [te[ae], te[L]], { ...F, questions: te };
    }), j(/* @__PURE__ */ new Set()));
  }, G = (L) => {
    window.confirm(`Delete question ${L + 1} from this draft?`) && (v((B) => ({
      ...B,
      questions: B.questions.filter((ae, F) => F !== L)
    })), j(/* @__PURE__ */ new Set()));
  }, U = (L) => {
    v((B) => {
      const ae = B.questions[L], F = {
        ...ae,
        id: void 0,
        text: `${ae.text} (copy)`,
        options: [...ae.options],
        sourceReferences: ae.sourceReferences.map((pe) => ({ ...pe }))
      }, te = [...B.questions];
      return te.splice(L + 1, 0, F), { ...B, questions: te };
    }), j(/* @__PURE__ */ new Set());
  }, I = async (L = !0) => {
    const B = await r(d, L);
    return B && g(JSON.stringify(d)), B;
  }, ee = async (L) => {
    L.length && (A && !await I(!1) || await o(L));
  };
  return /* @__PURE__ */ m.jsxs("section", { className: "aiw-review", "aria-labelledby": "aiw-review-heading", children: [
    /* @__PURE__ */ m.jsxs("header", { className: "aiw-review__header", children: [
      /* @__PURE__ */ m.jsxs("div", { children: [
        /* @__PURE__ */ m.jsx("span", { className: "aiw-eyebrow", children: "Review required" }),
        /* @__PURE__ */ m.jsx("h3", { id: "aiw-review-heading", children: "Edit quiz draft" }),
        /* @__PURE__ */ m.jsx("p", { children: "Review every question before saving. The quiz remains private." })
      ] }),
      /* @__PURE__ */ m.jsx("span", { className: `aiw-save-state ${A ? "is-unsaved" : ""}`, role: "status", children: A ? "Unsaved changes" : "All changes saved" })
    ] }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-review__meta", children: [
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ m.jsx("span", { children: "Quiz title" }),
        /* @__PURE__ */ m.jsx(
          "input",
          {
            value: d.title,
            maxLength: 160,
            onChange: (L) => v((B) => ({ ...B, title: L.target.value })),
            disabled: S
          }
        )
      ] }),
      /* @__PURE__ */ m.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ m.jsx("span", { children: "Description" }),
        /* @__PURE__ */ m.jsx(
          "textarea",
          {
            rows: 3,
            value: d.description,
            maxLength: 2e3,
            onChange: (L) => v((B) => ({ ...B, description: L.target.value })),
            disabled: S
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-review__toolbar", children: [
      /* @__PURE__ */ m.jsxs("label", { children: [
        /* @__PURE__ */ m.jsx(
          "input",
          {
            type: "checkbox",
            checked: d.questions.length > 0 && _.size === d.questions.length,
            onChange: (L) => j(L.target.checked ? new Set(d.questions.map((B, ae) => ae)) : /* @__PURE__ */ new Set()),
            disabled: S || !d.questions.length
          }
        ),
        "Select all"
      ] }),
      /* @__PURE__ */ m.jsxs("span", { children: [
        d.questions.length,
        " questions · ",
        d.questions.reduce((L, B) => L + Number(B.points || 0), 0),
        " points"
      ] }),
      /* @__PURE__ */ m.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet aiw-button--small",
          type: "button",
          disabled: !_.size || S,
          onClick: () => ee([..._].sort((L, B) => L - B)),
          children: u ? "Regenerating…" : `Regenerate selected (${_.size})`
        }
      )
    ] }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-question-list", children: [
      d.questions.map((L, B) => /* @__PURE__ */ m.jsx(
        fw,
        {
          question: L,
          index: B,
          total: d.questions.length,
          selected: _.has(B),
          disabled: S,
          onSelect: (ae) => j((F) => {
            const te = new Set(F);
            return ae ? te.add(B) : te.delete(B), te;
          }),
          onChange: (ae) => C(B, ae),
          onMove: (ae) => M(B, ae),
          onDelete: () => G(B),
          onDuplicate: () => U(B),
          onRegenerate: () => ee([B]),
          onOpenSource: h
        },
        L.id || `${B}-${L.text.slice(0, 24)}`
      )),
      d.questions.length ? null : /* @__PURE__ */ m.jsxs("div", { className: "aiw-mini-empty", children: [
        /* @__PURE__ */ m.jsx("strong", { children: "This draft has no questions." }),
        /* @__PURE__ */ m.jsx("p", { children: "Add a manual question or ask the assistant to revise the quiz." })
      ] })
    ] }),
    /* @__PURE__ */ m.jsxs("footer", { className: "aiw-review__footer", children: [
      /* @__PURE__ */ m.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet",
          type: "button",
          disabled: S || d.questions.length >= 20,
          onClick: () => v((L) => ({ ...L, questions: [...L.questions, ow()] })),
          children: "＋ Add manual question"
        }
      ),
      /* @__PURE__ */ m.jsx(
        "button",
        {
          className: "aiw-button aiw-button--primary",
          type: "button",
          onClick: () => I(!0),
          disabled: !A || S || !d.title.trim() || !d.questions.length,
          children: i ? "Saving…" : "Save as draft"
        }
      )
    ] })
  ] });
}
function hw({ client: n, courseId: i, source: u, onClose: r }) {
  const o = !!(u.materialId && u.chunkId), h = Tn({
    queryKey: ["ai", "source", i, u.materialId, u.chunkId],
    queryFn: () => n.getMaterialChunk(i, u.materialId, u.chunkId),
    enabled: o
  });
  return /* @__PURE__ */ m.jsxs(
    vo,
    {
      title: u.label || "Course material source",
      description: "Use this excerpt to verify the generated question against the selected course material.",
      onClose: r,
      size: "wide",
      children: [
        h.isLoading ? /* @__PURE__ */ m.jsx("p", { role: "status", children: "Loading source excerpt…" }) : null,
        h.isError ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
          /* @__PURE__ */ m.jsxs("div", { children: [
            /* @__PURE__ */ m.jsx("strong", { children: "Source unavailable" }),
            /* @__PURE__ */ m.jsx("p", { children: "The excerpt could not be loaded." })
          ] }),
          /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => h.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ m.jsxs("article", { className: "aiw-source-excerpt", children: [
          /* @__PURE__ */ m.jsx("h3", { children: h.data?.label || u.label }),
          /* @__PURE__ */ m.jsx("pre", { children: h.data?.content || u.excerpt || "No excerpt is available for this source reference." })
        ] }),
        /* @__PURE__ */ m.jsx("div", { className: "aiw-dialog-actions", children: /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: r, children: "Done" }) })
      ]
    }
  );
}
class mw extends J.Component {
  state = { error: null };
  static getDerivedStateFromError(i) {
    return { error: i };
  }
  componentDidCatch(i) {
    const u = typeof i?.name == "string" && i.name ? i.name.slice(0, 80) : "RenderError";
    console.error("AI Assistant frontend failed safely.", { name: u });
  }
  render() {
    return this.state.error ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-fatal", role: "alert", children: [
      /* @__PURE__ */ m.jsx("span", { className: "aiw-eyebrow", children: "AI Assistant unavailable" }),
      /* @__PURE__ */ m.jsx("h1", { children: "The conversational workspace could not start." }),
      /* @__PURE__ */ m.jsx("p", { children: "Your saved conversations and drafts were not changed." }),
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-inline-actions", children: [
        /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => location.reload(), children: "Reload page" }),
        this.props.onFallback ? /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: this.props.onFallback, children: "Open legacy assistant" }) : null
      ] })
    ] }) : this.props.children;
  }
}
function pw(n, i) {
  return {
    ...n,
    ...i,
    questionTypeDistribution: i.questionTypeDistribution ? { ...n.questionTypeDistribution, ...i.questionTypeDistribution } : n.questionTypeDistribution
  };
}
function vw({
  client: n,
  user: i,
  onToast: u,
  onNavigate: r
}) {
  const o = xi(), [h, d] = J.useState(null), [v, y] = J.useState("chat"), [g, _] = J.useState(!1), [j, S] = J.useState(!1), [A, C] = J.useState(null), [M, G] = J.useState(null), [U, I] = J.useState(null), ee = J.useRef(null), L = J.useRef(null), B = J.useCallback(($, we = "info") => {
    u?.($, we);
  }, [u]), ae = Tn({
    queryKey: ["ai", "conversations"],
    queryFn: n.listConversations
  }), F = Tn({
    queryKey: ["ai", "courses"],
    queryFn: n.listCourses
  }), te = Tn({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  }), pe = Tn({
    queryKey: ["ai", "conversation", h],
    queryFn: () => n.getConversation(h),
    enabled: !!h
  });
  J.useEffect(() => {
    h || !ae.data?.length || d(ae.data[0].id);
  }, [ae.data, h]), J.useEffect(() => {
    G(null), I(null);
  }, [h]);
  const Qe = pe.data || null, Le = Qe?.plan || la, Be = F.data || [], Jt = Tn({
    queryKey: ["ai", "materials", Le.courseId],
    queryFn: () => n.listMaterials(Le.courseId),
    enabled: !!Le.courseId
  }).data || [], wt = Qe?.status || "gathering_requirements", R = Kt({
    mutationFn: () => n.createConversation(),
    onSuccess: async ($) => {
      o.setQueryData(["ai", "conversation", $.id], $), d($.id), G(null), I(null), y("chat"), await o.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
    onError: ($) => B($ instanceof Error ? $.message : "Could not start a conversation.", "error")
  }), Y = J.useCallback(async () => {
    const $ = L.current;
    if ($) {
      L.current = null, ee.current && window.clearTimeout(ee.current), ee.current = null;
      try {
        const we = await n.updatePlan($.id, $.patch);
        we.conversation ? o.setQueryData(["ai", "conversation", $.id], we.conversation) : await o.invalidateQueries({ queryKey: ["ai", "conversation", $.id] }), await o.invalidateQueries({ queryKey: ["ai", "conversations"] });
      } catch (we) {
        await o.invalidateQueries({ queryKey: ["ai", "conversation", $.id] }), B(we instanceof Error ? we.message : "Quiz Plan could not be saved.", "error");
      }
    }
  }, [n, o, B]);
  J.useEffect(() => () => {
    ee.current && window.clearTimeout(ee.current), L.current && Y();
  }, [Y, h]);
  const ie = J.useCallback(($) => {
    if (!h) {
      B("Start a conversation before editing the Quiz Plan.", "info");
      return;
    }
    o.setQueryData(
      ["ai", "conversation", h],
      (Ke) => Ke && {
        ...Ke,
        plan: pw(Ke.plan, $),
        suggestedReplies: []
      }
    );
    const we = L.current;
    L.current = {
      id: h,
      patch: we?.id === h ? { ...we.patch, ...$ } : $
    }, ee.current && window.clearTimeout(ee.current), ee.current = window.setTimeout(() => void Y(), 450);
  }, [Y, o, h, B]), ye = Kt({
    mutationFn: async ($) => {
      let we = h, Ke = Qe;
      we || (Ke = await n.createConversation(), we = Ke.id);
      const Oi = Ke?.draft ? await n.reviseDraft(we, $) : await n.sendMessage(we, $);
      return { conversationId: we, currentDetail: Ke, result: Oi };
    },
    onSuccess: async ({ conversationId: $, currentDetail: we, result: Ke }) => {
      d($), y("chat"), Ke.conversation ? o.setQueryData(["ai", "conversation", $], Ke.conversation) : we && h !== $ && o.setQueryData(["ai", "conversation", $], we), Ke.revision && (G(Ke.revision), I(null)), await Promise.all([
        o.invalidateQueries({ queryKey: ["ai", "conversation", $] }),
        o.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: ($) => B($ instanceof Error ? $.message : "The message could not be sent.", "error")
  }), Se = Kt({
    mutationFn: () => n.generateDraft(h, Kz()),
    onSuccess: async ($) => {
      $.conversation && h && o.setQueryData(["ai", "conversation", h], $.conversation), await Promise.all([
        o.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        o.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: ($) => B($ instanceof Error ? $.message : "Draft generation failed.", "error")
  }), w = Qe?.status === "generating" || Qe?.generation?.status === "generating", Q = Tn({
    queryKey: ["ai", "generation", h],
    queryFn: () => n.getGenerationStatus(h),
    enabled: !!(h && (w || Se.isPending)),
    refetchInterval: ($) => ["queued", "generating", "cancel_requested"].includes($.state.data?.status || "") ? 1400 : !1
  }), K = Q.data || Qe?.generation || (Se.isPending ? {
    status: "generating",
    stage: "validating_quiz_plan",
    message: "",
    canCancel: !1,
    startedAt: "",
    updatedAt: ""
  } : null), X = J.useRef("");
  J.useEffect(() => {
    const $ = Q.data?.status;
    !$ || $ === X.current || (X.current = $, $ !== "generating" && h && (Promise.all([
      o.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
      o.invalidateQueries({ queryKey: ["ai", "conversations"] })
    ]), $ === "completed" && B("Quiz draft is ready for review.", "success")));
  }, [Q.data?.status, o, h, B]);
  const ue = Kt({
    mutationFn: () => n.cancelGeneration(h),
    onSuccess: async () => {
      await Promise.all([
        o.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        o.invalidateQueries({ queryKey: ["ai", "generation", h] })
      ]), B("Generation stopped.", "info");
    },
    onError: ($) => B($ instanceof Error ? $.message : "Generation could not be stopped.", "error")
  }), oe = Kt({
    mutationFn: ($) => n.applyRevision(h, $.id),
    onSuccess: async ($) => {
      G(null), I(null), $.conversation && h && o.setQueryData(["ai", "conversation", h], $.conversation), await o.invalidateQueries({ queryKey: ["ai", "conversation", h] }), B("Revision applied to the draft.", "success");
    },
    onError: ($) => B($ instanceof Error ? $.message : "Revision could not be applied.", "error")
  }), ge = Kt({
    mutationFn: ($) => n.saveDraft(h, $),
    onSuccess: async ($) => {
      $.conversation && h && o.setQueryData(["ai", "conversation", h], $.conversation), await Promise.all([
        o.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        o.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    }
  }), at = async ($, we = !0) => {
    try {
      return await ge.mutateAsync($), we && B("Draft changes saved.", "success"), !0;
    } catch (Ke) {
      return B(Ke instanceof Error ? Ke.message : "Draft could not be saved.", "error"), !1;
    }
  }, De = Kt({
    mutationFn: ({ indexes: $, instruction: we }) => n.regenerateQuestions(h, $, we),
    onSuccess: async ($) => {
      $.conversation && h && o.setQueryData(["ai", "conversation", h], $.conversation), await o.invalidateQueries({ queryKey: ["ai", "conversation", h] }), B("Selected questions regenerated. Review the changes before saving.", "success");
    },
    onError: ($) => B($ instanceof Error ? $.message : "Questions could not be regenerated.", "error")
  }), Mn = M || Qe?.pendingRevision || null, ca = Mn?.id === U ? null : Mn, tn = Le.courseId, Ti = () => {
    if (!tn) {
      y("plan"), B("Choose a course before adding material.", "info");
      return;
    }
    S(!0);
  }, rn = () => {
    if (!tn) {
      y("plan"), B("Choose a course before uploading material.", "info");
      return;
    }
    document.getElementById("aiw-material-upload")?.click();
  }, Ai = Qe?.draft ? /* @__PURE__ */ m.jsx(
    dw,
    {
      draft: Qe.draft,
      saving: ge.isPending,
      regenerating: De.isPending,
      onSave: at,
      onRegenerate: async ($, we) => {
        await De.mutateAsync({ indexes: $, instruction: we });
      },
      onOpenSource: C
    }
  ) : null;
  return /* @__PURE__ */ m.jsxs("div", { className: "aiw-app", children: [
    /* @__PURE__ */ m.jsxs("header", { className: "aiw-topbar", children: [
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-topbar__title", children: [
        /* @__PURE__ */ m.jsx("div", { className: "aiw-product-mark", "aria-hidden": "true", children: "AI" }),
        /* @__PURE__ */ m.jsxs("div", { children: [
          /* @__PURE__ */ m.jsx("span", { className: "aiw-eyebrow", children: i.role === "admin" ? "Administrator workspace" : "Teacher workspace" }),
          /* @__PURE__ */ m.jsx("h1", { children: "AI Quiz Assistant" }),
          /* @__PURE__ */ m.jsx("p", { children: "Plan together, generate a private draft, then review every question." })
        ] })
      ] }),
      /* @__PURE__ */ m.jsxs("div", { className: "aiw-topbar__actions", children: [
        /* @__PURE__ */ m.jsxs("span", { className: `aiw-config-status ${te.data?.configured ? "is-ready" : ""}`, children: [
          /* @__PURE__ */ m.jsx("i", { "aria-hidden": "true" }),
          te.data?.configured ? "Azure configured" : "Setup required"
        ] }),
        /* @__PURE__ */ m.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => _(!0), children: "Azure settings" })
      ] })
    ] }),
    !te.data?.enabled && te.data ? /* @__PURE__ */ m.jsxs("div", { className: "aiw-page-alert", role: "alert", children: [
      /* @__PURE__ */ m.jsx("strong", { children: "AI generation is disabled." }),
      /* @__PURE__ */ m.jsx("span", { children: te.data.message || "Contact an administrator to enable the assistant." })
    ] }) : null,
    /* @__PURE__ */ m.jsx("div", { className: "aiw-mobile-tabs", role: "tablist", "aria-label": "AI Assistant workspace panels", children: [
      ["conversations", "Conversations"],
      ["chat", Qe?.draft ? "Chat & review" : "Chat"],
      ["plan", "Quiz Plan"]
    ].map(([$, we]) => /* @__PURE__ */ m.jsx(
      "button",
      {
        id: `aiw-${$}-tab`,
        type: "button",
        role: "tab",
        "aria-selected": v === $,
        "aria-controls": `aiw-${$}-panel`,
        tabIndex: v === $ ? 0 : -1,
        onClick: () => y($),
        children: we
      },
      $
    )) }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-layout", children: [
      /* @__PURE__ */ m.jsx(
        "div",
        {
          id: "aiw-conversations-panel",
          className: `aiw-region aiw-region--left ${v === "conversations" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-conversations-tab",
          children: /* @__PURE__ */ m.jsx(
            lw,
            {
              conversations: ae.data || [],
              selectedId: h,
              isLoading: ae.isLoading,
              isCreating: R.isPending,
              onNew: () => R.mutate(),
              onSelect: ($) => {
                Y(), d($), G(null), I(null), y("chat");
              },
              materials: /* @__PURE__ */ m.jsx(
                uw,
                {
                  client: n,
                  conversationId: h,
                  plan: Le,
                  onPlanPatch: ie,
                  onOpenPaste: Ti,
                  onToast: B
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ m.jsx(
        "div",
        {
          id: "aiw-chat-panel",
          className: `aiw-region aiw-region--center ${v === "chat" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-chat-tab",
          children: /* @__PURE__ */ m.jsx(
            iw,
            {
              detail: Qe,
              plan: Le,
              courses: Be,
              materials: Jt,
              loading: pe.isLoading,
              error: pe.isError,
              isSending: ye.isPending,
              generation: K,
              cancelling: ue.isPending,
              revision: ca,
              applyingRevision: oe.isPending,
              onRetryLoad: () => pe.refetch(),
              onSend: ($) => ye.mutate($),
              onRetryMessage: ($) => ye.mutate($.content),
              onAttach: rn,
              onPasteMaterial: Ti,
              onCancelGeneration: () => ue.mutate(),
              onApplyRevision: ($) => oe.mutate($),
              onDismissRevision: () => {
                I(ca?.id || null), G(null);
              },
              review: Ai
            }
          )
        }
      ),
      /* @__PURE__ */ m.jsx(
        "div",
        {
          id: "aiw-plan-panel",
          className: `aiw-region aiw-region--right ${v === "plan" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-plan-tab",
          children: /* @__PURE__ */ m.jsx(
            rw,
            {
              plan: Le,
              courses: Be,
              conversationId: h,
              conversationStatus: wt,
              generation: K,
              generating: !!(K && ["queued", "generating", "cancel_requested"].includes(K.status)),
              generationAvailable: !!(te.data?.enabled && te.data?.configured),
              generationConfigured: !!te.data?.configured,
              onPatch: ie,
              onGenerate: () => Se.mutate()
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ m.jsxs("div", { className: "aiw-sr-only", "aria-live": "polite", "aria-atomic": "true", children: [
      ye.isPending ? "The assistant is responding." : "",
      K?.status === "generating" ? `Generation stage: ${K.stage}.` : ""
    ] }),
    g ? /* @__PURE__ */ m.jsx(Bz, { client: n, onClose: () => _(!1), onToast: B }) : null,
    j && tn ? /* @__PURE__ */ m.jsx(
      sw,
      {
        client: n,
        courseId: tn,
        conversationId: h,
        onClose: () => S(!1),
        onToast: B
      }
    ) : null,
    A && tn ? /* @__PURE__ */ m.jsx(
      hw,
      {
        client: n,
        courseId: tn,
        source: A,
        onClose: () => C(null)
      }
    ) : null
  ] });
}
function yw({
  api: n,
  user: i,
  onToast: u,
  onNavigate: r,
  onFallback: o
}) {
  const [h] = J.useState(() => new db({
    defaultOptions: {
      queries: {
        staleTime: 15e3,
        retry: 1,
        refetchOnWindowFocus: !1
      },
      mutations: {
        retry: !1
      }
    }
  })), d = J.useMemo(() => Qz(n), [n]);
  return /* @__PURE__ */ m.jsx(mw, { onFallback: o, children: /* @__PURE__ */ m.jsx(hb, { client: h, children: /* @__PURE__ */ m.jsx(
    vw,
    {
      client: d,
      user: i,
      onToast: u,
      onNavigate: r,
      onFallback: o
    }
  ) }) });
}
function gw(n, i) {
  const u = n.closest("#app");
  u?.classList.add("ai-assistant-page-host"), n.classList.add("ai-assistant-root");
  let r = Bg.createRoot(n);
  return r.render(
    /* @__PURE__ */ m.jsx(
      yw,
      {
        api: i.api,
        user: i.user,
        onToast: i.onToast,
        onNavigate: i.onNavigate,
        onFallback: i.onFallback
      }
    )
  ), {
    unmount() {
      r?.unmount(), r = null, u?.classList.remove("ai-assistant-page-host"), n.classList.remove("ai-assistant-root");
    }
  };
}
export {
  yw as AiAssistantApp,
  gw as mountAiAssistant
};
//# sourceMappingURL=ai-assistant.js.map
