var ko = { exports: {} }, Cl = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var xm;
function Ug() {
  if (xm) return Cl;
  xm = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.fragment");
  function s(r, c, m) {
    var h = null;
    if (m !== void 0 && (h = "" + m), c.key !== void 0 && (h = "" + c.key), "key" in c) {
      m = {};
      for (var v in c)
        v !== "key" && (m[v] = c[v]);
    } else m = c;
    return c = m.ref, {
      $$typeof: n,
      type: r,
      key: h,
      ref: c !== void 0 ? c : null,
      props: m
    };
  }
  return Cl.Fragment = i, Cl.jsx = s, Cl.jsxs = s, Cl;
}
var jm;
function Zg() {
  return jm || (jm = 1, ko.exports = Ug()), ko.exports;
}
var f = Zg(), Bo = { exports: {} }, Nl = {}, Ho = { exports: {} }, $o = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Em;
function Qg() {
  return Em || (Em = 1, (function(n) {
    function i(M, Y) {
      var V = M.length;
      M.push(Y);
      e: for (; 0 < V; ) {
        var je = V - 1 >>> 1, Oe = M[je];
        if (0 < c(Oe, Y))
          M[je] = Y, M[V] = Oe, V = je;
        else break e;
      }
    }
    function s(M) {
      return M.length === 0 ? null : M[0];
    }
    function r(M) {
      if (M.length === 0) return null;
      var Y = M[0], V = M.pop();
      if (V !== Y) {
        M[0] = V;
        e: for (var je = 0, Oe = M.length, w = Oe >>> 1; je < w; ) {
          var U = 2 * (je + 1) - 1, K = M[U], F = U + 1, oe = M[F];
          if (0 > c(K, V))
            F < Oe && 0 > c(oe, K) ? (M[je] = oe, M[F] = V, je = F) : (M[je] = K, M[U] = V, je = U);
          else if (F < Oe && 0 > c(oe, V))
            M[je] = oe, M[F] = V, je = F;
          else break e;
        }
      }
      return Y;
    }
    function c(M, Y) {
      var V = M.sortIndex - Y.sortIndex;
      return V !== 0 ? V : M.id - Y.id;
    }
    if (n.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var m = performance;
      n.unstable_now = function() {
        return m.now();
      };
    } else {
      var h = Date, v = h.now();
      n.unstable_now = function() {
        return h.now() - v;
      };
    }
    var y = [], g = [], _ = 1, j = null, z = 3, O = !1, N = !1, B = !1, X = !1, $ = typeof setTimeout == "function" ? setTimeout : null, ae = typeof clearTimeout == "function" ? clearTimeout : null, G = typeof setImmediate < "u" ? setImmediate : null;
    function P(M) {
      for (var Y = s(g); Y !== null; ) {
        if (Y.callback === null) r(g);
        else if (Y.startTime <= M)
          r(g), Y.sortIndex = Y.expirationTime, i(y, Y);
        else break;
        Y = s(g);
      }
    }
    function ie(M) {
      if (B = !1, P(M), !N)
        if (s(y) !== null)
          N = !0, ce || (ce = !0, te());
        else {
          var Y = s(g);
          Y !== null && we(ie, Y.startTime - M);
        }
    }
    var ce = !1, H = -1, R = 5, le = -1;
    function xe() {
      return X ? !0 : !(n.unstable_now() - le < R);
    }
    function I() {
      if (X = !1, ce) {
        var M = n.unstable_now();
        le = M;
        var Y = !0;
        try {
          e: {
            N = !1, B && (B = !1, ae(H), H = -1), O = !0;
            var V = z;
            try {
              t: {
                for (P(M), j = s(y); j !== null && !(j.expirationTime > M && xe()); ) {
                  var je = j.callback;
                  if (typeof je == "function") {
                    j.callback = null, z = j.priorityLevel;
                    var Oe = je(
                      j.expirationTime <= M
                    );
                    if (M = n.unstable_now(), typeof Oe == "function") {
                      j.callback = Oe, P(M), Y = !0;
                      break t;
                    }
                    j === s(y) && r(y), P(M);
                  } else r(y);
                  j = s(y);
                }
                if (j !== null) Y = !0;
                else {
                  var w = s(g);
                  w !== null && we(
                    ie,
                    w.startTime - M
                  ), Y = !1;
                }
              }
              break e;
            } finally {
              j = null, z = V, O = !1;
            }
            Y = void 0;
          }
        } finally {
          Y ? te() : ce = !1;
        }
      }
    }
    var te;
    if (typeof G == "function")
      te = function() {
        G(I);
      };
    else if (typeof MessageChannel < "u") {
      var ue = new MessageChannel(), ze = ue.port2;
      ue.port1.onmessage = I, te = function() {
        ze.postMessage(null);
      };
    } else
      te = function() {
        $(I, 0);
      };
    function we(M, Y) {
      H = $(function() {
        M(n.unstable_now());
      }, Y);
    }
    n.unstable_IdlePriority = 5, n.unstable_ImmediatePriority = 1, n.unstable_LowPriority = 4, n.unstable_NormalPriority = 3, n.unstable_Profiling = null, n.unstable_UserBlockingPriority = 2, n.unstable_cancelCallback = function(M) {
      M.callback = null;
    }, n.unstable_forceFrameRate = function(M) {
      0 > M || 125 < M ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : R = 0 < M ? Math.floor(1e3 / M) : 5;
    }, n.unstable_getCurrentPriorityLevel = function() {
      return z;
    }, n.unstable_next = function(M) {
      switch (z) {
        case 1:
        case 2:
        case 3:
          var Y = 3;
          break;
        default:
          Y = z;
      }
      var V = z;
      z = Y;
      try {
        return M();
      } finally {
        z = V;
      }
    }, n.unstable_requestPaint = function() {
      X = !0;
    }, n.unstable_runWithPriority = function(M, Y) {
      switch (M) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          M = 3;
      }
      var V = z;
      z = M;
      try {
        return Y();
      } finally {
        z = V;
      }
    }, n.unstable_scheduleCallback = function(M, Y, V) {
      var je = n.unstable_now();
      switch (typeof V == "object" && V !== null ? (V = V.delay, V = typeof V == "number" && 0 < V ? je + V : je) : V = je, M) {
        case 1:
          var Oe = -1;
          break;
        case 2:
          Oe = 250;
          break;
        case 5:
          Oe = 1073741823;
          break;
        case 4:
          Oe = 1e4;
          break;
        default:
          Oe = 5e3;
      }
      return Oe = V + Oe, M = {
        id: _++,
        callback: Y,
        priorityLevel: M,
        startTime: V,
        expirationTime: Oe,
        sortIndex: -1
      }, V > je ? (M.sortIndex = V, i(g, M), s(y) === null && M === s(g) && (B ? (ae(H), H = -1) : B = !0, we(ie, V - je))) : (M.sortIndex = Oe, i(y, M), N || O || (N = !0, ce || (ce = !0, te()))), M;
    }, n.unstable_shouldYield = xe, n.unstable_wrapCallback = function(M) {
      var Y = z;
      return function() {
        var V = z;
        z = Y;
        try {
          return M.apply(this, arguments);
        } finally {
          z = V;
        }
      };
    };
  })($o)), $o;
}
var Tm;
function kg() {
  return Tm || (Tm = 1, Ho.exports = Qg()), Ho.exports;
}
var Lo = { exports: {} }, fe = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Am;
function Bg() {
  if (Am) return fe;
  Am = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.portal"), s = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), c = Symbol.for("react.profiler"), m = Symbol.for("react.consumer"), h = Symbol.for("react.context"), v = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), _ = Symbol.for("react.lazy"), j = Symbol.for("react.activity"), z = Symbol.iterator;
  function O(w) {
    return w === null || typeof w != "object" ? null : (w = z && w[z] || w["@@iterator"], typeof w == "function" ? w : null);
  }
  var N = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, B = Object.assign, X = {};
  function $(w, U, K) {
    this.props = w, this.context = U, this.refs = X, this.updater = K || N;
  }
  $.prototype.isReactComponent = {}, $.prototype.setState = function(w, U) {
    if (typeof w != "object" && typeof w != "function" && w != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, w, U, "setState");
  }, $.prototype.forceUpdate = function(w) {
    this.updater.enqueueForceUpdate(this, w, "forceUpdate");
  };
  function ae() {
  }
  ae.prototype = $.prototype;
  function G(w, U, K) {
    this.props = w, this.context = U, this.refs = X, this.updater = K || N;
  }
  var P = G.prototype = new ae();
  P.constructor = G, B(P, $.prototype), P.isPureReactComponent = !0;
  var ie = Array.isArray;
  function ce() {
  }
  var H = { H: null, A: null, T: null, S: null }, R = Object.prototype.hasOwnProperty;
  function le(w, U, K) {
    var F = K.ref;
    return {
      $$typeof: n,
      type: w,
      key: U,
      ref: F !== void 0 ? F : null,
      props: K
    };
  }
  function xe(w, U) {
    return le(w.type, U, w.props);
  }
  function I(w) {
    return typeof w == "object" && w !== null && w.$$typeof === n;
  }
  function te(w) {
    var U = { "=": "=0", ":": "=2" };
    return "$" + w.replace(/[=:]/g, function(K) {
      return U[K];
    });
  }
  var ue = /\/+/g;
  function ze(w, U) {
    return typeof w == "object" && w !== null && w.key != null ? te("" + w.key) : U.toString(36);
  }
  function we(w) {
    switch (w.status) {
      case "fulfilled":
        return w.value;
      case "rejected":
        throw w.reason;
      default:
        switch (typeof w.status == "string" ? w.then(ce, ce) : (w.status = "pending", w.then(
          function(U) {
            w.status === "pending" && (w.status = "fulfilled", w.value = U);
          },
          function(U) {
            w.status === "pending" && (w.status = "rejected", w.reason = U);
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
  function M(w, U, K, F, oe) {
    var de = typeof w;
    (de === "undefined" || de === "boolean") && (w = null);
    var _e = !1;
    if (w === null) _e = !0;
    else
      switch (de) {
        case "bigint":
        case "string":
        case "number":
          _e = !0;
          break;
        case "object":
          switch (w.$$typeof) {
            case n:
            case i:
              _e = !0;
              break;
            case _:
              return _e = w._init, M(
                _e(w._payload),
                U,
                K,
                F,
                oe
              );
          }
      }
    if (_e)
      return oe = oe(w), _e = F === "" ? "." + ze(w, 0) : F, ie(oe) ? (K = "", _e != null && (K = _e.replace(ue, "$&/") + "/"), M(oe, U, K, "", function(Zt) {
        return Zt;
      })) : oe != null && (I(oe) && (oe = xe(
        oe,
        K + (oe.key == null || w && w.key === oe.key ? "" : ("" + oe.key).replace(
          ue,
          "$&/"
        ) + "/") + _e
      )), U.push(oe)), 1;
    _e = 0;
    var at = F === "" ? "." : F + ":";
    if (ie(w))
      for (var Ze = 0; Ze < w.length; Ze++)
        F = w[Ze], de = at + ze(F, Ze), _e += M(
          F,
          U,
          K,
          de,
          oe
        );
    else if (Ze = O(w), typeof Ze == "function")
      for (w = Ze.call(w), Ze = 0; !(F = w.next()).done; )
        F = F.value, de = at + ze(F, Ze++), _e += M(
          F,
          U,
          K,
          de,
          oe
        );
    else if (de === "object") {
      if (typeof w.then == "function")
        return M(
          we(w),
          U,
          K,
          F,
          oe
        );
      throw U = String(w), Error(
        "Objects are not valid as a React child (found: " + (U === "[object Object]" ? "object with keys {" + Object.keys(w).join(", ") + "}" : U) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return _e;
  }
  function Y(w, U, K) {
    if (w == null) return w;
    var F = [], oe = 0;
    return M(w, F, "", "", function(de) {
      return U.call(K, de, oe++);
    }), F;
  }
  function V(w) {
    if (w._status === -1) {
      var U = w._result;
      U = U(), U.then(
        function(K) {
          (w._status === 0 || w._status === -1) && (w._status = 1, w._result = K);
        },
        function(K) {
          (w._status === 0 || w._status === -1) && (w._status = 2, w._result = K);
        }
      ), w._status === -1 && (w._status = 0, w._result = U);
    }
    if (w._status === 1) return w._result.default;
    throw w._result;
  }
  var je = typeof reportError == "function" ? reportError : function(w) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var U = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof w == "object" && w !== null && typeof w.message == "string" ? String(w.message) : String(w),
        error: w
      });
      if (!window.dispatchEvent(U)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", w);
      return;
    }
    console.error(w);
  }, Oe = {
    map: Y,
    forEach: function(w, U, K) {
      Y(
        w,
        function() {
          U.apply(this, arguments);
        },
        K
      );
    },
    count: function(w) {
      var U = 0;
      return Y(w, function() {
        U++;
      }), U;
    },
    toArray: function(w) {
      return Y(w, function(U) {
        return U;
      }) || [];
    },
    only: function(w) {
      if (!I(w))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return w;
    }
  };
  return fe.Activity = j, fe.Children = Oe, fe.Component = $, fe.Fragment = s, fe.Profiler = c, fe.PureComponent = G, fe.StrictMode = r, fe.Suspense = y, fe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = H, fe.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(w) {
      return H.H.useMemoCache(w);
    }
  }, fe.cache = function(w) {
    return function() {
      return w.apply(null, arguments);
    };
  }, fe.cacheSignal = function() {
    return null;
  }, fe.cloneElement = function(w, U, K) {
    if (w == null)
      throw Error(
        "The argument must be a React element, but you passed " + w + "."
      );
    var F = B({}, w.props), oe = w.key;
    if (U != null)
      for (de in U.key !== void 0 && (oe = "" + U.key), U)
        !R.call(U, de) || de === "key" || de === "__self" || de === "__source" || de === "ref" && U.ref === void 0 || (F[de] = U[de]);
    var de = arguments.length - 2;
    if (de === 1) F.children = K;
    else if (1 < de) {
      for (var _e = Array(de), at = 0; at < de; at++)
        _e[at] = arguments[at + 2];
      F.children = _e;
    }
    return le(w.type, oe, F);
  }, fe.createContext = function(w) {
    return w = {
      $$typeof: h,
      _currentValue: w,
      _currentValue2: w,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, w.Provider = w, w.Consumer = {
      $$typeof: m,
      _context: w
    }, w;
  }, fe.createElement = function(w, U, K) {
    var F, oe = {}, de = null;
    if (U != null)
      for (F in U.key !== void 0 && (de = "" + U.key), U)
        R.call(U, F) && F !== "key" && F !== "__self" && F !== "__source" && (oe[F] = U[F]);
    var _e = arguments.length - 2;
    if (_e === 1) oe.children = K;
    else if (1 < _e) {
      for (var at = Array(_e), Ze = 0; Ze < _e; Ze++)
        at[Ze] = arguments[Ze + 2];
      oe.children = at;
    }
    if (w && w.defaultProps)
      for (F in _e = w.defaultProps, _e)
        oe[F] === void 0 && (oe[F] = _e[F]);
    return le(w, de, oe);
  }, fe.createRef = function() {
    return { current: null };
  }, fe.forwardRef = function(w) {
    return { $$typeof: v, render: w };
  }, fe.isValidElement = I, fe.lazy = function(w) {
    return {
      $$typeof: _,
      _payload: { _status: -1, _result: w },
      _init: V
    };
  }, fe.memo = function(w, U) {
    return {
      $$typeof: g,
      type: w,
      compare: U === void 0 ? null : U
    };
  }, fe.startTransition = function(w) {
    var U = H.T, K = {};
    H.T = K;
    try {
      var F = w(), oe = H.S;
      oe !== null && oe(K, F), typeof F == "object" && F !== null && typeof F.then == "function" && F.then(ce, je);
    } catch (de) {
      je(de);
    } finally {
      U !== null && K.types !== null && (U.types = K.types), H.T = U;
    }
  }, fe.unstable_useCacheRefresh = function() {
    return H.H.useCacheRefresh();
  }, fe.use = function(w) {
    return H.H.use(w);
  }, fe.useActionState = function(w, U, K) {
    return H.H.useActionState(w, U, K);
  }, fe.useCallback = function(w, U) {
    return H.H.useCallback(w, U);
  }, fe.useContext = function(w) {
    return H.H.useContext(w);
  }, fe.useDebugValue = function() {
  }, fe.useDeferredValue = function(w, U) {
    return H.H.useDeferredValue(w, U);
  }, fe.useEffect = function(w, U) {
    return H.H.useEffect(w, U);
  }, fe.useEffectEvent = function(w) {
    return H.H.useEffectEvent(w);
  }, fe.useId = function() {
    return H.H.useId();
  }, fe.useImperativeHandle = function(w, U, K) {
    return H.H.useImperativeHandle(w, U, K);
  }, fe.useInsertionEffect = function(w, U) {
    return H.H.useInsertionEffect(w, U);
  }, fe.useLayoutEffect = function(w, U) {
    return H.H.useLayoutEffect(w, U);
  }, fe.useMemo = function(w, U) {
    return H.H.useMemo(w, U);
  }, fe.useOptimistic = function(w, U) {
    return H.H.useOptimistic(w, U);
  }, fe.useReducer = function(w, U, K) {
    return H.H.useReducer(w, U, K);
  }, fe.useRef = function(w) {
    return H.H.useRef(w);
  }, fe.useState = function(w) {
    return H.H.useState(w);
  }, fe.useSyncExternalStore = function(w, U, K) {
    return H.H.useSyncExternalStore(
      w,
      U,
      K
    );
  }, fe.useTransition = function() {
    return H.H.useTransition();
  }, fe.version = "19.2.7", fe;
}
var Om;
function oc() {
  return Om || (Om = 1, Lo.exports = Bg()), Lo.exports;
}
var Go = { exports: {} }, dt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Cm;
function Hg() {
  if (Cm) return dt;
  Cm = 1;
  var n = oc();
  function i(y) {
    var g = "https://react.dev/errors/" + y;
    if (1 < arguments.length) {
      g += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var _ = 2; _ < arguments.length; _++)
        g += "&args[]=" + encodeURIComponent(arguments[_]);
    }
    return "Minified React error #" + y + "; visit " + g + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function s() {
  }
  var r = {
    d: {
      f: s,
      r: function() {
        throw Error(i(522));
      },
      D: s,
      C: s,
      L: s,
      m: s,
      X: s,
      S: s,
      M: s
    },
    p: 0,
    findDOMNode: null
  }, c = Symbol.for("react.portal");
  function m(y, g, _) {
    var j = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: c,
      key: j == null ? null : "" + j,
      children: y,
      containerInfo: g,
      implementation: _
    };
  }
  var h = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function v(y, g) {
    if (y === "font") return "";
    if (typeof g == "string")
      return g === "use-credentials" ? g : "";
  }
  return dt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r, dt.createPortal = function(y, g) {
    var _ = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(i(299));
    return m(y, g, null, _);
  }, dt.flushSync = function(y) {
    var g = h.T, _ = r.p;
    try {
      if (h.T = null, r.p = 2, y) return y();
    } finally {
      h.T = g, r.p = _, r.d.f();
    }
  }, dt.preconnect = function(y, g) {
    typeof y == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, r.d.C(y, g));
  }, dt.prefetchDNS = function(y) {
    typeof y == "string" && r.d.D(y);
  }, dt.preinit = function(y, g) {
    if (typeof y == "string" && g && typeof g.as == "string") {
      var _ = g.as, j = v(_, g.crossOrigin), z = typeof g.integrity == "string" ? g.integrity : void 0, O = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      _ === "style" ? r.d.S(
        y,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: j,
          integrity: z,
          fetchPriority: O
        }
      ) : _ === "script" && r.d.X(y, {
        crossOrigin: j,
        integrity: z,
        fetchPriority: O,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, dt.preinitModule = function(y, g) {
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
  }, dt.preload = function(y, g) {
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
  }, dt.preloadModule = function(y, g) {
    if (typeof y == "string")
      if (g) {
        var _ = v(g.as, g.crossOrigin);
        r.d.m(y, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: _,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else r.d.m(y);
  }, dt.requestFormReset = function(y) {
    r.d.r(y);
  }, dt.unstable_batchedUpdates = function(y, g) {
    return y(g);
  }, dt.useFormState = function(y, g, _) {
    return h.H.useFormState(y, g, _);
  }, dt.useFormStatus = function() {
    return h.H.useHostTransitionStatus();
  }, dt.version = "19.2.7", dt;
}
var Nm;
function $g() {
  if (Nm) return Go.exports;
  Nm = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Go.exports = Hg(), Go.exports;
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
var Mm;
function Lg() {
  if (Mm) return Nl;
  Mm = 1;
  var n = kg(), i = oc(), s = $g();
  function r(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var a = 2; a < arguments.length; a++)
        t += "&args[]=" + encodeURIComponent(arguments[a]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function c(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function m(e) {
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
  function h(e) {
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
    if (m(e) !== e)
      throw Error(r(188));
  }
  function g(e) {
    var t = e.alternate;
    if (!t) {
      if (t = m(e), t === null) throw Error(r(188));
      return t !== e ? null : e;
    }
    for (var a = e, l = t; ; ) {
      var u = a.return;
      if (u === null) break;
      var o = u.alternate;
      if (o === null) {
        if (l = u.return, l !== null) {
          a = l;
          continue;
        }
        break;
      }
      if (u.child === o.child) {
        for (o = u.child; o; ) {
          if (o === a) return y(u), e;
          if (o === l) return y(u), t;
          o = o.sibling;
        }
        throw Error(r(188));
      }
      if (a.return !== l.return) a = u, l = o;
      else {
        for (var d = !1, p = u.child; p; ) {
          if (p === a) {
            d = !0, a = u, l = o;
            break;
          }
          if (p === l) {
            d = !0, l = u, a = o;
            break;
          }
          p = p.sibling;
        }
        if (!d) {
          for (p = o.child; p; ) {
            if (p === a) {
              d = !0, a = o, l = u;
              break;
            }
            if (p === l) {
              d = !0, l = o, a = u;
              break;
            }
            p = p.sibling;
          }
          if (!d) throw Error(r(189));
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
  var j = Object.assign, z = Symbol.for("react.element"), O = Symbol.for("react.transitional.element"), N = Symbol.for("react.portal"), B = Symbol.for("react.fragment"), X = Symbol.for("react.strict_mode"), $ = Symbol.for("react.profiler"), ae = Symbol.for("react.consumer"), G = Symbol.for("react.context"), P = Symbol.for("react.forward_ref"), ie = Symbol.for("react.suspense"), ce = Symbol.for("react.suspense_list"), H = Symbol.for("react.memo"), R = Symbol.for("react.lazy"), le = Symbol.for("react.activity"), xe = Symbol.for("react.memo_cache_sentinel"), I = Symbol.iterator;
  function te(e) {
    return e === null || typeof e != "object" ? null : (e = I && e[I] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var ue = Symbol.for("react.client.reference");
  function ze(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === ue ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case B:
        return "Fragment";
      case $:
        return "Profiler";
      case X:
        return "StrictMode";
      case ie:
        return "Suspense";
      case ce:
        return "SuspenseList";
      case le:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case N:
          return "Portal";
        case G:
          return e.displayName || "Context";
        case ae:
          return (e._context.displayName || "Context") + ".Consumer";
        case P:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case H:
          return t = e.displayName || null, t !== null ? t : ze(e.type) || "Memo";
        case R:
          t = e._payload, e = e._init;
          try {
            return ze(e(t));
          } catch {
          }
      }
    return null;
  }
  var we = Array.isArray, M = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Y = s.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, V = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, je = [], Oe = -1;
  function w(e) {
    return { current: e };
  }
  function U(e) {
    0 > Oe || (e.current = je[Oe], je[Oe] = null, Oe--);
  }
  function K(e, t) {
    Oe++, je[Oe] = e.current, e.current = t;
  }
  var F = w(null), oe = w(null), de = w(null), _e = w(null);
  function at(e, t) {
    switch (K(de, t), K(oe, e), K(F, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Xh(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Xh(t), e = Vh(t, e);
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
    U(F), K(F, e);
  }
  function Ze() {
    U(F), U(oe), U(de);
  }
  function Zt(e) {
    e.memoizedState !== null && K(_e, e);
    var t = F.current, a = Vh(t, e.type);
    t !== a && (K(oe, e), K(F, a));
  }
  function ha(e) {
    oe.current === e && (U(F), U(oe)), _e.current === e && (U(_e), El._currentValue = V);
  }
  var Qa, Ri;
  function ln(e) {
    if (Qa === void 0)
      try {
        throw Error();
      } catch (a) {
        var t = a.stack.trim().match(/\n( *(at )?)/);
        Qa = t && t[1] || "", Ri = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Qa + e + Ri;
  }
  var qi = !1;
  function ka(e, t) {
    if (!e || qi) return "";
    qi = !0;
    var a = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var l = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var Q = function() {
                throw Error();
              };
              if (Object.defineProperty(Q.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(Q, []);
                } catch (C) {
                  var A = C;
                }
                Reflect.construct(e, [], Q);
              } else {
                try {
                  Q.call();
                } catch (C) {
                  A = C;
                }
                e.call(Q.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (C) {
                A = C;
              }
              (Q = e()) && typeof Q.catch == "function" && Q.catch(function() {
              });
            }
          } catch (C) {
            if (C && A && typeof C.stack == "string")
              return [C.stack, A.stack];
          }
          return [null, null];
        }
      };
      l.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var u = Object.getOwnPropertyDescriptor(
        l.DetermineComponentFrameRoot,
        "name"
      );
      u && u.configurable && Object.defineProperty(
        l.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var o = l.DetermineComponentFrameRoot(), d = o[0], p = o[1];
      if (d && p) {
        var b = d.split(`
`), T = p.split(`
`);
        for (u = l = 0; l < b.length && !b[l].includes("DetermineComponentFrameRoot"); )
          l++;
        for (; u < T.length && !T[u].includes(
          "DetermineComponentFrameRoot"
        ); )
          u++;
        if (l === b.length || u === T.length)
          for (l = b.length - 1, u = T.length - 1; 1 <= l && 0 <= u && b[l] !== T[u]; )
            u--;
        for (; 1 <= l && 0 <= u; l--, u--)
          if (b[l] !== T[u]) {
            if (l !== 1 || u !== 1)
              do
                if (l--, u--, 0 > u || b[l] !== T[u]) {
                  var D = `
` + b[l].replace(" at new ", " at ");
                  return e.displayName && D.includes("<anonymous>") && (D = D.replace("<anonymous>", e.displayName)), D;
                }
              while (1 <= l && 0 <= u);
            break;
          }
      }
    } finally {
      qi = !1, Error.prepareStackTrace = a;
    }
    return (a = e ? e.displayName || e.name : "") ? ln(a) : "";
  }
  function Ql(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return ln(e.type);
      case 16:
        return ln("Lazy");
      case 13:
        return e.child !== t && t !== null ? ln("Suspense Fallback") : ln("Suspense");
      case 19:
        return ln("SuspenseList");
      case 0:
      case 15:
        return ka(e.type, !1);
      case 11:
        return ka(e.type.render, !1);
      case 1:
        return ka(e.type, !0);
      case 31:
        return ln("Activity");
      default:
        return "";
    }
  }
  function Ui(e) {
    try {
      var t = "", a = null;
      do
        t += Ql(e, a), a = e, e = e.return;
      while (e);
      return t;
    } catch (l) {
      return `
Error generating stack: ` + l.message + `
` + l.stack;
    }
  }
  var Pt = Object.prototype.hasOwnProperty, Zi = n.unstable_scheduleCallback, ma = n.unstable_cancelCallback, ju = n.unstable_shouldYield, Qi = n.unstable_requestPaint, ht = n.unstable_now, kl = n.unstable_getCurrentPriorityLevel, Bl = n.unstable_ImmediatePriority, Hl = n.unstable_UserBlockingPriority, Ba = n.unstable_NormalPriority, k = n.unstable_LowPriority, ye = n.unstable_IdlePriority, jt = n.log, qn = n.unstable_setDisableYieldValue, Qt = null, Et = null;
  function Un(e) {
    if (typeof jt == "function" && qn(e), Et && typeof Et.setStrictMode == "function")
      try {
        Et.setStrictMode(Qt, e);
      } catch {
      }
  }
  var Tt = Math.clz32 ? Math.clz32 : zv, _v = Math.log, Sv = Math.LN2;
  function zv(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (_v(e) / Sv | 0) | 0;
  }
  var $l = 256, Ll = 262144, Gl = 4194304;
  function pa(e) {
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
  function Yl(e, t, a) {
    var l = e.pendingLanes;
    if (l === 0) return 0;
    var u = 0, o = e.suspendedLanes, d = e.pingedLanes;
    e = e.warmLanes;
    var p = l & 134217727;
    return p !== 0 ? (l = p & ~o, l !== 0 ? u = pa(l) : (d &= p, d !== 0 ? u = pa(d) : a || (a = p & ~e, a !== 0 && (u = pa(a))))) : (p = l & ~o, p !== 0 ? u = pa(p) : d !== 0 ? u = pa(d) : a || (a = l & ~e, a !== 0 && (u = pa(a)))), u === 0 ? 0 : t !== 0 && t !== u && (t & o) === 0 && (o = u & -u, a = t & -t, o >= a || o === 32 && (a & 4194048) !== 0) ? t : u;
  }
  function ki(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function wv(e, t) {
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
  function Tc() {
    var e = Gl;
    return Gl <<= 1, (Gl & 62914560) === 0 && (Gl = 4194304), e;
  }
  function Eu(e) {
    for (var t = [], a = 0; 31 > a; a++) t.push(e);
    return t;
  }
  function Bi(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function xv(e, t, a, l, u, o) {
    var d = e.pendingLanes;
    e.pendingLanes = a, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= a, e.entangledLanes &= a, e.errorRecoveryDisabledLanes &= a, e.shellSuspendCounter = 0;
    var p = e.entanglements, b = e.expirationTimes, T = e.hiddenUpdates;
    for (a = d & ~a; 0 < a; ) {
      var D = 31 - Tt(a), Q = 1 << D;
      p[D] = 0, b[D] = -1;
      var A = T[D];
      if (A !== null)
        for (T[D] = null, D = 0; D < A.length; D++) {
          var C = A[D];
          C !== null && (C.lane &= -536870913);
        }
      a &= ~Q;
    }
    l !== 0 && Ac(e, l, 0), o !== 0 && u === 0 && e.tag !== 0 && (e.suspendedLanes |= o & ~(d & ~t));
  }
  function Ac(e, t, a) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var l = 31 - Tt(t);
    e.entangledLanes |= t, e.entanglements[l] = e.entanglements[l] | 1073741824 | a & 261930;
  }
  function Oc(e, t) {
    var a = e.entangledLanes |= t;
    for (e = e.entanglements; a; ) {
      var l = 31 - Tt(a), u = 1 << l;
      u & t | e[l] & t && (e[l] |= t), a &= ~u;
    }
  }
  function Cc(e, t) {
    var a = t & -t;
    return a = (a & 42) !== 0 ? 1 : Tu(a), (a & (e.suspendedLanes | t)) !== 0 ? 0 : a;
  }
  function Tu(e) {
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
  function Au(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Nc() {
    var e = Y.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : ym(e.type));
  }
  function Mc(e, t) {
    var a = Y.p;
    try {
      return Y.p = e, t();
    } finally {
      Y.p = a;
    }
  }
  var Zn = Math.random().toString(36).slice(2), st = "__reactFiber$" + Zn, yt = "__reactProps$" + Zn, Ha = "__reactContainer$" + Zn, Ou = "__reactEvents$" + Zn, jv = "__reactListeners$" + Zn, Ev = "__reactHandles$" + Zn, Dc = "__reactResources$" + Zn, Hi = "__reactMarker$" + Zn;
  function Cu(e) {
    delete e[st], delete e[yt], delete e[Ou], delete e[jv], delete e[Ev];
  }
  function $a(e) {
    var t = e[st];
    if (t) return t;
    for (var a = e.parentNode; a; ) {
      if (t = a[Ha] || a[st]) {
        if (a = t.alternate, t.child !== null || a !== null && a.child !== null)
          for (e = tm(e); e !== null; ) {
            if (a = e[st]) return a;
            e = tm(e);
          }
        return t;
      }
      e = a, a = e.parentNode;
    }
    return null;
  }
  function La(e) {
    if (e = e[st] || e[Ha]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function $i(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(r(33));
  }
  function Ga(e) {
    var t = e[Dc];
    return t || (t = e[Dc] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function it(e) {
    e[Hi] = !0;
  }
  var Rc = /* @__PURE__ */ new Set(), qc = {};
  function va(e, t) {
    Ya(e, t), Ya(e + "Capture", t);
  }
  function Ya(e, t) {
    for (qc[e] = t, e = 0; e < t.length; e++)
      Rc.add(t[e]);
  }
  var Tv = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Uc = {}, Zc = {};
  function Av(e) {
    return Pt.call(Zc, e) ? !0 : Pt.call(Uc, e) ? !1 : Tv.test(e) ? Zc[e] = !0 : (Uc[e] = !0, !1);
  }
  function Kl(e, t, a) {
    if (Av(t))
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
  function Xl(e, t, a) {
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
  function fn(e, t, a, l) {
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
  function kt(e) {
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
  function Qc(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function Ov(e, t, a) {
    var l = Object.getOwnPropertyDescriptor(
      e.constructor.prototype,
      t
    );
    if (!e.hasOwnProperty(t) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
      var u = l.get, o = l.set;
      return Object.defineProperty(e, t, {
        configurable: !0,
        get: function() {
          return u.call(this);
        },
        set: function(d) {
          a = "" + d, o.call(this, d);
        }
      }), Object.defineProperty(e, t, {
        enumerable: l.enumerable
      }), {
        getValue: function() {
          return a;
        },
        setValue: function(d) {
          a = "" + d;
        },
        stopTracking: function() {
          e._valueTracker = null, delete e[t];
        }
      };
    }
  }
  function Nu(e) {
    if (!e._valueTracker) {
      var t = Qc(e) ? "checked" : "value";
      e._valueTracker = Ov(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function kc(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var a = t.getValue(), l = "";
    return e && (l = Qc(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== a ? (t.setValue(e), !0) : !1;
  }
  function Vl(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var Cv = /[\n"\\]/g;
  function Bt(e) {
    return e.replace(
      Cv,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function Mu(e, t, a, l, u, o, d, p) {
    e.name = "", d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" ? e.type = d : e.removeAttribute("type"), t != null ? d === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + kt(t)) : e.value !== "" + kt(t) && (e.value = "" + kt(t)) : d !== "submit" && d !== "reset" || e.removeAttribute("value"), t != null ? Du(e, d, kt(t)) : a != null ? Du(e, d, kt(a)) : l != null && e.removeAttribute("value"), u == null && o != null && (e.defaultChecked = !!o), u != null && (e.checked = u && typeof u != "function" && typeof u != "symbol"), p != null && typeof p != "function" && typeof p != "symbol" && typeof p != "boolean" ? e.name = "" + kt(p) : e.removeAttribute("name");
  }
  function Bc(e, t, a, l, u, o, d, p) {
    if (o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.type = o), t != null || a != null) {
      if (!(o !== "submit" && o !== "reset" || t != null)) {
        Nu(e);
        return;
      }
      a = a != null ? "" + kt(a) : "", t = t != null ? "" + kt(t) : a, p || t === e.value || (e.value = t), e.defaultValue = t;
    }
    l = l ?? u, l = typeof l != "function" && typeof l != "symbol" && !!l, e.checked = p ? e.checked : !!l, e.defaultChecked = !!l, d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" && (e.name = d), Nu(e);
  }
  function Du(e, t, a) {
    t === "number" && Vl(e.ownerDocument) === e || e.defaultValue === "" + a || (e.defaultValue = "" + a);
  }
  function Ka(e, t, a, l) {
    if (e = e.options, t) {
      t = {};
      for (var u = 0; u < a.length; u++)
        t["$" + a[u]] = !0;
      for (a = 0; a < e.length; a++)
        u = t.hasOwnProperty("$" + e[a].value), e[a].selected !== u && (e[a].selected = u), u && l && (e[a].defaultSelected = !0);
    } else {
      for (a = "" + kt(a), t = null, u = 0; u < e.length; u++) {
        if (e[u].value === a) {
          e[u].selected = !0, l && (e[u].defaultSelected = !0);
          return;
        }
        t !== null || e[u].disabled || (t = e[u]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Hc(e, t, a) {
    if (t != null && (t = "" + kt(t), t !== e.value && (e.value = t), a == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = a != null ? "" + kt(a) : "";
  }
  function $c(e, t, a, l) {
    if (t == null) {
      if (l != null) {
        if (a != null) throw Error(r(92));
        if (we(l)) {
          if (1 < l.length) throw Error(r(93));
          l = l[0];
        }
        a = l;
      }
      a == null && (a = ""), t = a;
    }
    a = kt(t), e.defaultValue = a, l = e.textContent, l === a && l !== "" && l !== null && (e.value = l), Nu(e);
  }
  function Xa(e, t) {
    if (t) {
      var a = e.firstChild;
      if (a && a === e.lastChild && a.nodeType === 3) {
        a.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Nv = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function Lc(e, t, a) {
    var l = t.indexOf("--") === 0;
    a == null || typeof a == "boolean" || a === "" ? l ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : l ? e.setProperty(t, a) : typeof a != "number" || a === 0 || Nv.has(t) ? t === "float" ? e.cssFloat = a : e[t] = ("" + a).trim() : e[t] = a + "px";
  }
  function Gc(e, t, a) {
    if (t != null && typeof t != "object")
      throw Error(r(62));
    if (e = e.style, a != null) {
      for (var l in a)
        !a.hasOwnProperty(l) || t != null && t.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
      for (var u in t)
        l = t[u], t.hasOwnProperty(u) && a[u] !== l && Lc(e, u, l);
    } else
      for (var o in t)
        t.hasOwnProperty(o) && Lc(e, o, t[o]);
  }
  function Ru(e) {
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
  var Mv = /* @__PURE__ */ new Map([
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
  ]), Dv = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Jl(e) {
    return Dv.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function dn() {
  }
  var qu = null;
  function Uu(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var Va = null, Ja = null;
  function Yc(e) {
    var t = La(e);
    if (t && (e = t.stateNode)) {
      var a = e[yt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (Mu(
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
              'input[name="' + Bt(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < a.length; t++) {
              var l = a[t];
              if (l !== e && l.form === e.form) {
                var u = l[yt] || null;
                if (!u) throw Error(r(90));
                Mu(
                  l,
                  u.value,
                  u.defaultValue,
                  u.defaultValue,
                  u.checked,
                  u.defaultChecked,
                  u.type,
                  u.name
                );
              }
            }
            for (t = 0; t < a.length; t++)
              l = a[t], l.form === e.form && kc(l);
          }
          break e;
        case "textarea":
          Hc(e, a.value, a.defaultValue);
          break e;
        case "select":
          t = a.value, t != null && Ka(e, !!a.multiple, t, !1);
      }
    }
  }
  var Zu = !1;
  function Kc(e, t, a) {
    if (Zu) return e(t, a);
    Zu = !0;
    try {
      var l = e(t);
      return l;
    } finally {
      if (Zu = !1, (Va !== null || Ja !== null) && (Us(), Va && (t = Va, e = Ja, Ja = Va = null, Yc(t), e)))
        for (t = 0; t < e.length; t++) Yc(e[t]);
    }
  }
  function Li(e, t) {
    var a = e.stateNode;
    if (a === null) return null;
    var l = a[yt] || null;
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
  var hn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Qu = !1;
  if (hn)
    try {
      var Gi = {};
      Object.defineProperty(Gi, "passive", {
        get: function() {
          Qu = !0;
        }
      }), window.addEventListener("test", Gi, Gi), window.removeEventListener("test", Gi, Gi);
    } catch {
      Qu = !1;
    }
  var Qn = null, ku = null, Fl = null;
  function Xc() {
    if (Fl) return Fl;
    var e, t = ku, a = t.length, l, u = "value" in Qn ? Qn.value : Qn.textContent, o = u.length;
    for (e = 0; e < a && t[e] === u[e]; e++) ;
    var d = a - e;
    for (l = 1; l <= d && t[a - l] === u[o - l]; l++) ;
    return Fl = u.slice(e, 1 < l ? 1 - l : void 0);
  }
  function Il(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Wl() {
    return !0;
  }
  function Vc() {
    return !1;
  }
  function gt(e) {
    function t(a, l, u, o, d) {
      this._reactName = a, this._targetInst = u, this.type = l, this.nativeEvent = o, this.target = d, this.currentTarget = null;
      for (var p in e)
        e.hasOwnProperty(p) && (a = e[p], this[p] = a ? a(o) : o[p]);
      return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? Wl : Vc, this.isPropagationStopped = Vc, this;
    }
    return j(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var a = this.nativeEvent;
        a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = Wl);
      },
      stopPropagation: function() {
        var a = this.nativeEvent;
        a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = Wl);
      },
      persist: function() {
      },
      isPersistent: Wl
    }), t;
  }
  var ya = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Pl = gt(ya), Yi = j({}, ya, { view: 0, detail: 0 }), Rv = gt(Yi), Bu, Hu, Ki, es = j({}, Yi, {
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
    getModifierState: Lu,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== Ki && (Ki && e.type === "mousemove" ? (Bu = e.screenX - Ki.screenX, Hu = e.screenY - Ki.screenY) : Hu = Bu = 0, Ki = e), Bu);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : Hu;
    }
  }), Jc = gt(es), qv = j({}, es, { dataTransfer: 0 }), Uv = gt(qv), Zv = j({}, Yi, { relatedTarget: 0 }), $u = gt(Zv), Qv = j({}, ya, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), kv = gt(Qv), Bv = j({}, ya, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Hv = gt(Bv), $v = j({}, ya, { data: 0 }), Fc = gt($v), Lv = {
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
  }, Gv = {
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
  }, Yv = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function Kv(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = Yv[e]) ? !!t[e] : !1;
  }
  function Lu() {
    return Kv;
  }
  var Xv = j({}, Yi, {
    key: function(e) {
      if (e.key) {
        var t = Lv[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = Il(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Gv[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Lu,
    charCode: function(e) {
      return e.type === "keypress" ? Il(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? Il(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), Vv = gt(Xv), Jv = j({}, es, {
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
  }), Ic = gt(Jv), Fv = j({}, Yi, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Lu
  }), Iv = gt(Fv), Wv = j({}, ya, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Pv = gt(Wv), ey = j({}, es, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), ty = gt(ey), ny = j({}, ya, {
    newState: 0,
    oldState: 0
  }), ay = gt(ny), iy = [9, 13, 27, 32], Gu = hn && "CompositionEvent" in window, Xi = null;
  hn && "documentMode" in document && (Xi = document.documentMode);
  var ly = hn && "TextEvent" in window && !Xi, Wc = hn && (!Gu || Xi && 8 < Xi && 11 >= Xi), Pc = " ", ef = !1;
  function tf(e, t) {
    switch (e) {
      case "keyup":
        return iy.indexOf(t.keyCode) !== -1;
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
  function nf(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Fa = !1;
  function sy(e, t) {
    switch (e) {
      case "compositionend":
        return nf(t);
      case "keypress":
        return t.which !== 32 ? null : (ef = !0, Pc);
      case "textInput":
        return e = t.data, e === Pc && ef ? null : e;
      default:
        return null;
    }
  }
  function uy(e, t) {
    if (Fa)
      return e === "compositionend" || !Gu && tf(e, t) ? (e = Xc(), Fl = ku = Qn = null, Fa = !1, e) : null;
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
        return Wc && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var ry = {
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
  function af(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!ry[e.type] : t === "textarea";
  }
  function lf(e, t, a, l) {
    Va ? Ja ? Ja.push(l) : Ja = [l] : Va = l, t = Ls(t, "onChange"), 0 < t.length && (a = new Pl(
      "onChange",
      "change",
      null,
      a,
      l
    ), e.push({ event: a, listeners: t }));
  }
  var Vi = null, Ji = null;
  function oy(e) {
    Hh(e, 0);
  }
  function ts(e) {
    var t = $i(e);
    if (kc(t)) return e;
  }
  function sf(e, t) {
    if (e === "change") return t;
  }
  var uf = !1;
  if (hn) {
    var Yu;
    if (hn) {
      var Ku = "oninput" in document;
      if (!Ku) {
        var rf = document.createElement("div");
        rf.setAttribute("oninput", "return;"), Ku = typeof rf.oninput == "function";
      }
      Yu = Ku;
    } else Yu = !1;
    uf = Yu && (!document.documentMode || 9 < document.documentMode);
  }
  function of() {
    Vi && (Vi.detachEvent("onpropertychange", cf), Ji = Vi = null);
  }
  function cf(e) {
    if (e.propertyName === "value" && ts(Ji)) {
      var t = [];
      lf(
        t,
        Ji,
        e,
        Uu(e)
      ), Kc(oy, t);
    }
  }
  function cy(e, t, a) {
    e === "focusin" ? (of(), Vi = t, Ji = a, Vi.attachEvent("onpropertychange", cf)) : e === "focusout" && of();
  }
  function fy(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return ts(Ji);
  }
  function dy(e, t) {
    if (e === "click") return ts(t);
  }
  function hy(e, t) {
    if (e === "input" || e === "change")
      return ts(t);
  }
  function my(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var At = typeof Object.is == "function" ? Object.is : my;
  function Fi(e, t) {
    if (At(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var a = Object.keys(e), l = Object.keys(t);
    if (a.length !== l.length) return !1;
    for (l = 0; l < a.length; l++) {
      var u = a[l];
      if (!Pt.call(t, u) || !At(e[u], t[u]))
        return !1;
    }
    return !0;
  }
  function ff(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function df(e, t) {
    var a = ff(e);
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
      a = ff(a);
    }
  }
  function hf(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? hf(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function mf(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = Vl(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var a = typeof t.contentWindow.location.href == "string";
      } catch {
        a = !1;
      }
      if (a) e = t.contentWindow;
      else break;
      t = Vl(e.document);
    }
    return t;
  }
  function Xu(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var py = hn && "documentMode" in document && 11 >= document.documentMode, Ia = null, Vu = null, Ii = null, Ju = !1;
  function pf(e, t, a) {
    var l = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
    Ju || Ia == null || Ia !== Vl(l) || (l = Ia, "selectionStart" in l && Xu(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = {
      anchorNode: l.anchorNode,
      anchorOffset: l.anchorOffset,
      focusNode: l.focusNode,
      focusOffset: l.focusOffset
    }), Ii && Fi(Ii, l) || (Ii = l, l = Ls(Vu, "onSelect"), 0 < l.length && (t = new Pl(
      "onSelect",
      "select",
      null,
      t,
      a
    ), e.push({ event: t, listeners: l }), t.target = Ia)));
  }
  function ga(e, t) {
    var a = {};
    return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
  }
  var Wa = {
    animationend: ga("Animation", "AnimationEnd"),
    animationiteration: ga("Animation", "AnimationIteration"),
    animationstart: ga("Animation", "AnimationStart"),
    transitionrun: ga("Transition", "TransitionRun"),
    transitionstart: ga("Transition", "TransitionStart"),
    transitioncancel: ga("Transition", "TransitionCancel"),
    transitionend: ga("Transition", "TransitionEnd")
  }, Fu = {}, vf = {};
  hn && (vf = document.createElement("div").style, "AnimationEvent" in window || (delete Wa.animationend.animation, delete Wa.animationiteration.animation, delete Wa.animationstart.animation), "TransitionEvent" in window || delete Wa.transitionend.transition);
  function ba(e) {
    if (Fu[e]) return Fu[e];
    if (!Wa[e]) return e;
    var t = Wa[e], a;
    for (a in t)
      if (t.hasOwnProperty(a) && a in vf)
        return Fu[e] = t[a];
    return e;
  }
  var yf = ba("animationend"), gf = ba("animationiteration"), bf = ba("animationstart"), vy = ba("transitionrun"), yy = ba("transitionstart"), gy = ba("transitioncancel"), _f = ba("transitionend"), Sf = /* @__PURE__ */ new Map(), Iu = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Iu.push("scrollEnd");
  function en(e, t) {
    Sf.set(e, t), va(t, [e]);
  }
  var ns = typeof reportError == "function" ? reportError : function(e) {
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
  }, Ht = [], Pa = 0, Wu = 0;
  function as() {
    for (var e = Pa, t = Wu = Pa = 0; t < e; ) {
      var a = Ht[t];
      Ht[t++] = null;
      var l = Ht[t];
      Ht[t++] = null;
      var u = Ht[t];
      Ht[t++] = null;
      var o = Ht[t];
      if (Ht[t++] = null, l !== null && u !== null) {
        var d = l.pending;
        d === null ? u.next = u : (u.next = d.next, d.next = u), l.pending = u;
      }
      o !== 0 && zf(a, u, o);
    }
  }
  function is(e, t, a, l) {
    Ht[Pa++] = e, Ht[Pa++] = t, Ht[Pa++] = a, Ht[Pa++] = l, Wu |= l, e.lanes |= l, e = e.alternate, e !== null && (e.lanes |= l);
  }
  function Pu(e, t, a, l) {
    return is(e, t, a, l), ls(e);
  }
  function _a(e, t) {
    return is(e, null, null, t), ls(e);
  }
  function zf(e, t, a) {
    e.lanes |= a;
    var l = e.alternate;
    l !== null && (l.lanes |= a);
    for (var u = !1, o = e.return; o !== null; )
      o.childLanes |= a, l = o.alternate, l !== null && (l.childLanes |= a), o.tag === 22 && (e = o.stateNode, e === null || e._visibility & 1 || (u = !0)), e = o, o = o.return;
    return e.tag === 3 ? (o = e.stateNode, u && t !== null && (u = 31 - Tt(a), e = o.hiddenUpdates, l = e[u], l === null ? e[u] = [t] : l.push(t), t.lane = a | 536870912), o) : null;
  }
  function ls(e) {
    if (50 < bl)
      throw bl = 0, ro = null, Error(r(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var ei = {};
  function by(e, t, a, l) {
    this.tag = e, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Ot(e, t, a, l) {
    return new by(e, t, a, l);
  }
  function er(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function mn(e, t) {
    var a = e.alternate;
    return a === null ? (a = Ot(
      e.tag,
      t,
      e.key,
      e.mode
    ), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = e.flags & 65011712, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue, t = e.dependencies, a.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.refCleanup = e.refCleanup, a;
  }
  function wf(e, t) {
    e.flags &= 65011714;
    var a = e.alternate;
    return a === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type, t = a.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function ss(e, t, a, l, u, o) {
    var d = 0;
    if (l = e, typeof e == "function") er(e) && (d = 1);
    else if (typeof e == "string")
      d = xg(
        e,
        a,
        F.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case le:
          return e = Ot(31, a, t, u), e.elementType = le, e.lanes = o, e;
        case B:
          return Sa(a.children, u, o, t);
        case X:
          d = 8, u |= 24;
          break;
        case $:
          return e = Ot(12, a, t, u | 2), e.elementType = $, e.lanes = o, e;
        case ie:
          return e = Ot(13, a, t, u), e.elementType = ie, e.lanes = o, e;
        case ce:
          return e = Ot(19, a, t, u), e.elementType = ce, e.lanes = o, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case G:
                d = 10;
                break e;
              case ae:
                d = 9;
                break e;
              case P:
                d = 11;
                break e;
              case H:
                d = 14;
                break e;
              case R:
                d = 16, l = null;
                break e;
            }
          d = 29, a = Error(
            r(130, e === null ? "null" : typeof e, "")
          ), l = null;
      }
    return t = Ot(d, a, t, u), t.elementType = e, t.type = l, t.lanes = o, t;
  }
  function Sa(e, t, a, l) {
    return e = Ot(7, e, l, t), e.lanes = a, e;
  }
  function tr(e, t, a) {
    return e = Ot(6, e, null, t), e.lanes = a, e;
  }
  function xf(e) {
    var t = Ot(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function nr(e, t, a) {
    return t = Ot(
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
  var jf = /* @__PURE__ */ new WeakMap();
  function $t(e, t) {
    if (typeof e == "object" && e !== null) {
      var a = jf.get(e);
      return a !== void 0 ? a : (t = {
        value: e,
        source: t,
        stack: Ui(t)
      }, jf.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: Ui(t)
    };
  }
  var ti = [], ni = 0, us = null, Wi = 0, Lt = [], Gt = 0, kn = null, sn = 1, un = "";
  function pn(e, t) {
    ti[ni++] = Wi, ti[ni++] = us, us = e, Wi = t;
  }
  function Ef(e, t, a) {
    Lt[Gt++] = sn, Lt[Gt++] = un, Lt[Gt++] = kn, kn = e;
    var l = sn;
    e = un;
    var u = 32 - Tt(l) - 1;
    l &= ~(1 << u), a += 1;
    var o = 32 - Tt(t) + u;
    if (30 < o) {
      var d = u - u % 5;
      o = (l & (1 << d) - 1).toString(32), l >>= d, u -= d, sn = 1 << 32 - Tt(t) + u | a << u | l, un = o + e;
    } else
      sn = 1 << o | a << u | l, un = e;
  }
  function ar(e) {
    e.return !== null && (pn(e, 1), Ef(e, 1, 0));
  }
  function ir(e) {
    for (; e === us; )
      us = ti[--ni], ti[ni] = null, Wi = ti[--ni], ti[ni] = null;
    for (; e === kn; )
      kn = Lt[--Gt], Lt[Gt] = null, un = Lt[--Gt], Lt[Gt] = null, sn = Lt[--Gt], Lt[Gt] = null;
  }
  function Tf(e, t) {
    Lt[Gt++] = sn, Lt[Gt++] = un, Lt[Gt++] = kn, sn = t.id, un = t.overflow, kn = e;
  }
  var ut = null, Qe = null, Se = !1, Bn = null, Yt = !1, lr = Error(r(519));
  function Hn(e) {
    var t = Error(
      r(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Pi($t(t, e)), lr;
  }
  function Af(e) {
    var t = e.stateNode, a = e.type, l = e.memoizedProps;
    switch (t[st] = e, t[yt] = l, a) {
      case "dialog":
        ve("cancel", t), ve("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        ve("load", t);
        break;
      case "video":
      case "audio":
        for (a = 0; a < Sl.length; a++)
          ve(Sl[a], t);
        break;
      case "source":
        ve("error", t);
        break;
      case "img":
      case "image":
      case "link":
        ve("error", t), ve("load", t);
        break;
      case "details":
        ve("toggle", t);
        break;
      case "input":
        ve("invalid", t), Bc(
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
        ve("invalid", t);
        break;
      case "textarea":
        ve("invalid", t), $c(t, l.value, l.defaultValue, l.children);
    }
    a = l.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || t.textContent === "" + a || l.suppressHydrationWarning === !0 || Yh(t.textContent, a) ? (l.popover != null && (ve("beforetoggle", t), ve("toggle", t)), l.onScroll != null && ve("scroll", t), l.onScrollEnd != null && ve("scrollend", t), l.onClick != null && (t.onclick = dn), t = !0) : t = !1, t || Hn(e, !0);
  }
  function Of(e) {
    for (ut = e.return; ut; )
      switch (ut.tag) {
        case 5:
        case 31:
        case 13:
          Yt = !1;
          return;
        case 27:
        case 3:
          Yt = !0;
          return;
        default:
          ut = ut.return;
      }
  }
  function ai(e) {
    if (e !== ut) return !1;
    if (!Se) return Of(e), Se = !0, !1;
    var t = e.tag, a;
    if ((a = t !== 3 && t !== 27) && ((a = t === 5) && (a = e.type, a = !(a !== "form" && a !== "button") || xo(e.type, e.memoizedProps)), a = !a), a && Qe && Hn(e), Of(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      Qe = em(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      Qe = em(e);
    } else
      t === 27 ? (t = Qe, ta(e.type) ? (e = Oo, Oo = null, Qe = e) : Qe = t) : Qe = ut ? Xt(e.stateNode.nextSibling) : null;
    return !0;
  }
  function za() {
    Qe = ut = null, Se = !1;
  }
  function sr() {
    var e = Bn;
    return e !== null && (zt === null ? zt = e : zt.push.apply(
      zt,
      e
    ), Bn = null), e;
  }
  function Pi(e) {
    Bn === null ? Bn = [e] : Bn.push(e);
  }
  var ur = w(null), wa = null, vn = null;
  function $n(e, t, a) {
    K(ur, t._currentValue), t._currentValue = a;
  }
  function yn(e) {
    e._currentValue = ur.current, U(ur);
  }
  function rr(e, t, a) {
    for (; e !== null; ) {
      var l = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, l !== null && (l.childLanes |= t)) : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t), e === a) break;
      e = e.return;
    }
  }
  function or(e, t, a, l) {
    var u = e.child;
    for (u !== null && (u.return = e); u !== null; ) {
      var o = u.dependencies;
      if (o !== null) {
        var d = u.child;
        o = o.firstContext;
        e: for (; o !== null; ) {
          var p = o;
          o = u;
          for (var b = 0; b < t.length; b++)
            if (p.context === t[b]) {
              o.lanes |= a, p = o.alternate, p !== null && (p.lanes |= a), rr(
                o.return,
                a,
                e
              ), l || (d = null);
              break e;
            }
          o = p.next;
        }
      } else if (u.tag === 18) {
        if (d = u.return, d === null) throw Error(r(341));
        d.lanes |= a, o = d.alternate, o !== null && (o.lanes |= a), rr(d, a, e), d = null;
      } else d = u.child;
      if (d !== null) d.return = u;
      else
        for (d = u; d !== null; ) {
          if (d === e) {
            d = null;
            break;
          }
          if (u = d.sibling, u !== null) {
            u.return = d.return, d = u;
            break;
          }
          d = d.return;
        }
      u = d;
    }
  }
  function ii(e, t, a, l) {
    e = null;
    for (var u = t, o = !1; u !== null; ) {
      if (!o) {
        if ((u.flags & 524288) !== 0) o = !0;
        else if ((u.flags & 262144) !== 0) break;
      }
      if (u.tag === 10) {
        var d = u.alternate;
        if (d === null) throw Error(r(387));
        if (d = d.memoizedProps, d !== null) {
          var p = u.type;
          At(u.pendingProps.value, d.value) || (e !== null ? e.push(p) : e = [p]);
        }
      } else if (u === _e.current) {
        if (d = u.alternate, d === null) throw Error(r(387));
        d.memoizedState.memoizedState !== u.memoizedState.memoizedState && (e !== null ? e.push(El) : e = [El]);
      }
      u = u.return;
    }
    e !== null && or(
      t,
      e,
      a,
      l
    ), t.flags |= 262144;
  }
  function rs(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!At(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function xa(e) {
    wa = e, vn = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function rt(e) {
    return Cf(wa, e);
  }
  function os(e, t) {
    return wa === null && xa(e), Cf(e, t);
  }
  function Cf(e, t) {
    var a = t._currentValue;
    if (t = { context: t, memoizedValue: a, next: null }, vn === null) {
      if (e === null) throw Error(r(308));
      vn = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else vn = vn.next = t;
    return a;
  }
  var _y = typeof AbortController < "u" ? AbortController : function() {
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
  }, Sy = n.unstable_scheduleCallback, zy = n.unstable_NormalPriority, Je = {
    $$typeof: G,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function cr() {
    return {
      controller: new _y(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function el(e) {
    e.refCount--, e.refCount === 0 && Sy(zy, function() {
      e.controller.abort();
    });
  }
  var tl = null, fr = 0, li = 0, si = null;
  function wy(e, t) {
    if (tl === null) {
      var a = tl = [];
      fr = 0, li = po(), si = {
        status: "pending",
        value: void 0,
        then: function(l) {
          a.push(l);
        }
      };
    }
    return fr++, t.then(Nf, Nf), t;
  }
  function Nf() {
    if (--fr === 0 && tl !== null) {
      si !== null && (si.status = "fulfilled");
      var e = tl;
      tl = null, li = 0, si = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function xy(e, t) {
    var a = [], l = {
      status: "pending",
      value: null,
      reason: null,
      then: function(u) {
        a.push(u);
      }
    };
    return e.then(
      function() {
        l.status = "fulfilled", l.value = t;
        for (var u = 0; u < a.length; u++) (0, a[u])(t);
      },
      function(u) {
        for (l.status = "rejected", l.reason = u, u = 0; u < a.length; u++)
          (0, a[u])(void 0);
      }
    ), l;
  }
  var Mf = M.S;
  M.S = function(e, t) {
    ph = ht(), typeof t == "object" && t !== null && typeof t.then == "function" && wy(e, t), Mf !== null && Mf(e, t);
  };
  var ja = w(null);
  function dr() {
    var e = ja.current;
    return e !== null ? e : Ue.pooledCache;
  }
  function cs(e, t) {
    t === null ? K(ja, ja.current) : K(ja, t.pool);
  }
  function Df() {
    var e = dr();
    return e === null ? null : { parent: Je._currentValue, pool: e };
  }
  var ui = Error(r(460)), hr = Error(r(474)), fs = Error(r(542)), ds = { then: function() {
  } };
  function Rf(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function qf(e, t, a) {
    switch (a = e[a], a === void 0 ? e.push(t) : a !== t && (t.then(dn, dn), t = a), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, Zf(e), e;
      default:
        if (typeof t.status == "string") t.then(dn, dn);
        else {
          if (e = Ue, e !== null && 100 < e.shellSuspendCounter)
            throw Error(r(482));
          e = t, e.status = "pending", e.then(
            function(l) {
              if (t.status === "pending") {
                var u = t;
                u.status = "fulfilled", u.value = l;
              }
            },
            function(l) {
              if (t.status === "pending") {
                var u = t;
                u.status = "rejected", u.reason = l;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw e = t.reason, Zf(e), e;
        }
        throw Ta = t, ui;
    }
  }
  function Ea(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (a) {
      throw a !== null && typeof a == "object" && typeof a.then == "function" ? (Ta = a, ui) : a;
    }
  }
  var Ta = null;
  function Uf() {
    if (Ta === null) throw Error(r(459));
    var e = Ta;
    return Ta = null, e;
  }
  function Zf(e) {
    if (e === ui || e === fs)
      throw Error(r(483));
  }
  var ri = null, nl = 0;
  function hs(e) {
    var t = nl;
    return nl += 1, ri === null && (ri = []), qf(ri, e, t);
  }
  function al(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function ms(e, t) {
    throw t.$$typeof === z ? Error(r(525)) : (e = Object.prototype.toString.call(t), Error(
      r(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function Qf(e) {
    function t(x, S) {
      if (e) {
        var E = x.deletions;
        E === null ? (x.deletions = [S], x.flags |= 16) : E.push(S);
      }
    }
    function a(x, S) {
      if (!e) return null;
      for (; S !== null; )
        t(x, S), S = S.sibling;
      return null;
    }
    function l(x) {
      for (var S = /* @__PURE__ */ new Map(); x !== null; )
        x.key !== null ? S.set(x.key, x) : S.set(x.index, x), x = x.sibling;
      return S;
    }
    function u(x, S) {
      return x = mn(x, S), x.index = 0, x.sibling = null, x;
    }
    function o(x, S, E) {
      return x.index = E, e ? (E = x.alternate, E !== null ? (E = E.index, E < S ? (x.flags |= 67108866, S) : E) : (x.flags |= 67108866, S)) : (x.flags |= 1048576, S);
    }
    function d(x) {
      return e && x.alternate === null && (x.flags |= 67108866), x;
    }
    function p(x, S, E, Z) {
      return S === null || S.tag !== 6 ? (S = tr(E, x.mode, Z), S.return = x, S) : (S = u(S, E), S.return = x, S);
    }
    function b(x, S, E, Z) {
      var se = E.type;
      return se === B ? D(
        x,
        S,
        E.props.children,
        Z,
        E.key
      ) : S !== null && (S.elementType === se || typeof se == "object" && se !== null && se.$$typeof === R && Ea(se) === S.type) ? (S = u(S, E.props), al(S, E), S.return = x, S) : (S = ss(
        E.type,
        E.key,
        E.props,
        null,
        x.mode,
        Z
      ), al(S, E), S.return = x, S);
    }
    function T(x, S, E, Z) {
      return S === null || S.tag !== 4 || S.stateNode.containerInfo !== E.containerInfo || S.stateNode.implementation !== E.implementation ? (S = nr(E, x.mode, Z), S.return = x, S) : (S = u(S, E.children || []), S.return = x, S);
    }
    function D(x, S, E, Z, se) {
      return S === null || S.tag !== 7 ? (S = Sa(
        E,
        x.mode,
        Z,
        se
      ), S.return = x, S) : (S = u(S, E), S.return = x, S);
    }
    function Q(x, S, E) {
      if (typeof S == "string" && S !== "" || typeof S == "number" || typeof S == "bigint")
        return S = tr(
          "" + S,
          x.mode,
          E
        ), S.return = x, S;
      if (typeof S == "object" && S !== null) {
        switch (S.$$typeof) {
          case O:
            return E = ss(
              S.type,
              S.key,
              S.props,
              null,
              x.mode,
              E
            ), al(E, S), E.return = x, E;
          case N:
            return S = nr(
              S,
              x.mode,
              E
            ), S.return = x, S;
          case R:
            return S = Ea(S), Q(x, S, E);
        }
        if (we(S) || te(S))
          return S = Sa(
            S,
            x.mode,
            E,
            null
          ), S.return = x, S;
        if (typeof S.then == "function")
          return Q(x, hs(S), E);
        if (S.$$typeof === G)
          return Q(
            x,
            os(x, S),
            E
          );
        ms(x, S);
      }
      return null;
    }
    function A(x, S, E, Z) {
      var se = S !== null ? S.key : null;
      if (typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint")
        return se !== null ? null : p(x, S, "" + E, Z);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case O:
            return E.key === se ? b(x, S, E, Z) : null;
          case N:
            return E.key === se ? T(x, S, E, Z) : null;
          case R:
            return E = Ea(E), A(x, S, E, Z);
        }
        if (we(E) || te(E))
          return se !== null ? null : D(x, S, E, Z, null);
        if (typeof E.then == "function")
          return A(
            x,
            S,
            hs(E),
            Z
          );
        if (E.$$typeof === G)
          return A(
            x,
            S,
            os(x, E),
            Z
          );
        ms(x, E);
      }
      return null;
    }
    function C(x, S, E, Z, se) {
      if (typeof Z == "string" && Z !== "" || typeof Z == "number" || typeof Z == "bigint")
        return x = x.get(E) || null, p(S, x, "" + Z, se);
      if (typeof Z == "object" && Z !== null) {
        switch (Z.$$typeof) {
          case O:
            return x = x.get(
              Z.key === null ? E : Z.key
            ) || null, b(S, x, Z, se);
          case N:
            return x = x.get(
              Z.key === null ? E : Z.key
            ) || null, T(S, x, Z, se);
          case R:
            return Z = Ea(Z), C(
              x,
              S,
              E,
              Z,
              se
            );
        }
        if (we(Z) || te(Z))
          return x = x.get(E) || null, D(S, x, Z, se, null);
        if (typeof Z.then == "function")
          return C(
            x,
            S,
            E,
            hs(Z),
            se
          );
        if (Z.$$typeof === G)
          return C(
            x,
            S,
            E,
            os(S, Z),
            se
          );
        ms(S, Z);
      }
      return null;
    }
    function W(x, S, E, Z) {
      for (var se = null, Ee = null, ee = S, me = S = 0, be = null; ee !== null && me < E.length; me++) {
        ee.index > me ? (be = ee, ee = null) : be = ee.sibling;
        var Te = A(
          x,
          ee,
          E[me],
          Z
        );
        if (Te === null) {
          ee === null && (ee = be);
          break;
        }
        e && ee && Te.alternate === null && t(x, ee), S = o(Te, S, me), Ee === null ? se = Te : Ee.sibling = Te, Ee = Te, ee = be;
      }
      if (me === E.length)
        return a(x, ee), Se && pn(x, me), se;
      if (ee === null) {
        for (; me < E.length; me++)
          ee = Q(x, E[me], Z), ee !== null && (S = o(
            ee,
            S,
            me
          ), Ee === null ? se = ee : Ee.sibling = ee, Ee = ee);
        return Se && pn(x, me), se;
      }
      for (ee = l(ee); me < E.length; me++)
        be = C(
          ee,
          x,
          me,
          E[me],
          Z
        ), be !== null && (e && be.alternate !== null && ee.delete(
          be.key === null ? me : be.key
        ), S = o(
          be,
          S,
          me
        ), Ee === null ? se = be : Ee.sibling = be, Ee = be);
      return e && ee.forEach(function(sa) {
        return t(x, sa);
      }), Se && pn(x, me), se;
    }
    function re(x, S, E, Z) {
      if (E == null) throw Error(r(151));
      for (var se = null, Ee = null, ee = S, me = S = 0, be = null, Te = E.next(); ee !== null && !Te.done; me++, Te = E.next()) {
        ee.index > me ? (be = ee, ee = null) : be = ee.sibling;
        var sa = A(x, ee, Te.value, Z);
        if (sa === null) {
          ee === null && (ee = be);
          break;
        }
        e && ee && sa.alternate === null && t(x, ee), S = o(sa, S, me), Ee === null ? se = sa : Ee.sibling = sa, Ee = sa, ee = be;
      }
      if (Te.done)
        return a(x, ee), Se && pn(x, me), se;
      if (ee === null) {
        for (; !Te.done; me++, Te = E.next())
          Te = Q(x, Te.value, Z), Te !== null && (S = o(Te, S, me), Ee === null ? se = Te : Ee.sibling = Te, Ee = Te);
        return Se && pn(x, me), se;
      }
      for (ee = l(ee); !Te.done; me++, Te = E.next())
        Te = C(ee, x, me, Te.value, Z), Te !== null && (e && Te.alternate !== null && ee.delete(Te.key === null ? me : Te.key), S = o(Te, S, me), Ee === null ? se = Te : Ee.sibling = Te, Ee = Te);
      return e && ee.forEach(function(qg) {
        return t(x, qg);
      }), Se && pn(x, me), se;
    }
    function Re(x, S, E, Z) {
      if (typeof E == "object" && E !== null && E.type === B && E.key === null && (E = E.props.children), typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case O:
            e: {
              for (var se = E.key; S !== null; ) {
                if (S.key === se) {
                  if (se = E.type, se === B) {
                    if (S.tag === 7) {
                      a(
                        x,
                        S.sibling
                      ), Z = u(
                        S,
                        E.props.children
                      ), Z.return = x, x = Z;
                      break e;
                    }
                  } else if (S.elementType === se || typeof se == "object" && se !== null && se.$$typeof === R && Ea(se) === S.type) {
                    a(
                      x,
                      S.sibling
                    ), Z = u(S, E.props), al(Z, E), Z.return = x, x = Z;
                    break e;
                  }
                  a(x, S);
                  break;
                } else t(x, S);
                S = S.sibling;
              }
              E.type === B ? (Z = Sa(
                E.props.children,
                x.mode,
                Z,
                E.key
              ), Z.return = x, x = Z) : (Z = ss(
                E.type,
                E.key,
                E.props,
                null,
                x.mode,
                Z
              ), al(Z, E), Z.return = x, x = Z);
            }
            return d(x);
          case N:
            e: {
              for (se = E.key; S !== null; ) {
                if (S.key === se)
                  if (S.tag === 4 && S.stateNode.containerInfo === E.containerInfo && S.stateNode.implementation === E.implementation) {
                    a(
                      x,
                      S.sibling
                    ), Z = u(S, E.children || []), Z.return = x, x = Z;
                    break e;
                  } else {
                    a(x, S);
                    break;
                  }
                else t(x, S);
                S = S.sibling;
              }
              Z = nr(E, x.mode, Z), Z.return = x, x = Z;
            }
            return d(x);
          case R:
            return E = Ea(E), Re(
              x,
              S,
              E,
              Z
            );
        }
        if (we(E))
          return W(
            x,
            S,
            E,
            Z
          );
        if (te(E)) {
          if (se = te(E), typeof se != "function") throw Error(r(150));
          return E = se.call(E), re(
            x,
            S,
            E,
            Z
          );
        }
        if (typeof E.then == "function")
          return Re(
            x,
            S,
            hs(E),
            Z
          );
        if (E.$$typeof === G)
          return Re(
            x,
            S,
            os(x, E),
            Z
          );
        ms(x, E);
      }
      return typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint" ? (E = "" + E, S !== null && S.tag === 6 ? (a(x, S.sibling), Z = u(S, E), Z.return = x, x = Z) : (a(x, S), Z = tr(E, x.mode, Z), Z.return = x, x = Z), d(x)) : a(x, S);
    }
    return function(x, S, E, Z) {
      try {
        nl = 0;
        var se = Re(
          x,
          S,
          E,
          Z
        );
        return ri = null, se;
      } catch (ee) {
        if (ee === ui || ee === fs) throw ee;
        var Ee = Ot(29, ee, null, x.mode);
        return Ee.lanes = Z, Ee.return = x, Ee;
      } finally {
      }
    };
  }
  var Aa = Qf(!0), kf = Qf(!1), Ln = !1;
  function mr(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function pr(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function Gn(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function Yn(e, t, a) {
    var l = e.updateQueue;
    if (l === null) return null;
    if (l = l.shared, (Ae & 2) !== 0) {
      var u = l.pending;
      return u === null ? t.next = t : (t.next = u.next, u.next = t), l.pending = t, t = ls(e), zf(e, null, a), t;
    }
    return is(e, l, t, a), ls(e);
  }
  function il(e, t, a) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (a & 4194048) !== 0)) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, Oc(e, a);
    }
  }
  function vr(e, t) {
    var a = e.updateQueue, l = e.alternate;
    if (l !== null && (l = l.updateQueue, a === l)) {
      var u = null, o = null;
      if (a = a.firstBaseUpdate, a !== null) {
        do {
          var d = {
            lane: a.lane,
            tag: a.tag,
            payload: a.payload,
            callback: null,
            next: null
          };
          o === null ? u = o = d : o = o.next = d, a = a.next;
        } while (a !== null);
        o === null ? u = o = t : o = o.next = t;
      } else u = o = t;
      a = {
        baseState: l.baseState,
        firstBaseUpdate: u,
        lastBaseUpdate: o,
        shared: l.shared,
        callbacks: l.callbacks
      }, e.updateQueue = a;
      return;
    }
    e = a.lastBaseUpdate, e === null ? a.firstBaseUpdate = t : e.next = t, a.lastBaseUpdate = t;
  }
  var yr = !1;
  function ll() {
    if (yr) {
      var e = si;
      if (e !== null) throw e;
    }
  }
  function sl(e, t, a, l) {
    yr = !1;
    var u = e.updateQueue;
    Ln = !1;
    var o = u.firstBaseUpdate, d = u.lastBaseUpdate, p = u.shared.pending;
    if (p !== null) {
      u.shared.pending = null;
      var b = p, T = b.next;
      b.next = null, d === null ? o = T : d.next = T, d = b;
      var D = e.alternate;
      D !== null && (D = D.updateQueue, p = D.lastBaseUpdate, p !== d && (p === null ? D.firstBaseUpdate = T : p.next = T, D.lastBaseUpdate = b));
    }
    if (o !== null) {
      var Q = u.baseState;
      d = 0, D = T = b = null, p = o;
      do {
        var A = p.lane & -536870913, C = A !== p.lane;
        if (C ? (ge & A) === A : (l & A) === A) {
          A !== 0 && A === li && (yr = !0), D !== null && (D = D.next = {
            lane: 0,
            tag: p.tag,
            payload: p.payload,
            callback: null,
            next: null
          });
          e: {
            var W = e, re = p;
            A = t;
            var Re = a;
            switch (re.tag) {
              case 1:
                if (W = re.payload, typeof W == "function") {
                  Q = W.call(Re, Q, A);
                  break e;
                }
                Q = W;
                break e;
              case 3:
                W.flags = W.flags & -65537 | 128;
              case 0:
                if (W = re.payload, A = typeof W == "function" ? W.call(Re, Q, A) : W, A == null) break e;
                Q = j({}, Q, A);
                break e;
              case 2:
                Ln = !0;
            }
          }
          A = p.callback, A !== null && (e.flags |= 64, C && (e.flags |= 8192), C = u.callbacks, C === null ? u.callbacks = [A] : C.push(A));
        } else
          C = {
            lane: A,
            tag: p.tag,
            payload: p.payload,
            callback: p.callback,
            next: null
          }, D === null ? (T = D = C, b = Q) : D = D.next = C, d |= A;
        if (p = p.next, p === null) {
          if (p = u.shared.pending, p === null)
            break;
          C = p, p = C.next, C.next = null, u.lastBaseUpdate = C, u.shared.pending = null;
        }
      } while (!0);
      D === null && (b = Q), u.baseState = b, u.firstBaseUpdate = T, u.lastBaseUpdate = D, o === null && (u.shared.lanes = 0), Fn |= d, e.lanes = d, e.memoizedState = Q;
    }
  }
  function Bf(e, t) {
    if (typeof e != "function")
      throw Error(r(191, e));
    e.call(t);
  }
  function Hf(e, t) {
    var a = e.callbacks;
    if (a !== null)
      for (e.callbacks = null, e = 0; e < a.length; e++)
        Bf(a[e], t);
  }
  var oi = w(null), ps = w(0);
  function $f(e, t) {
    e = En, K(ps, e), K(oi, t), En = e | t.baseLanes;
  }
  function gr() {
    K(ps, En), K(oi, oi.current);
  }
  function br() {
    En = ps.current, U(oi), U(ps);
  }
  var Ct = w(null), Kt = null;
  function Kn(e) {
    var t = e.alternate;
    K(Xe, Xe.current & 1), K(Ct, e), Kt === null && (t === null || oi.current !== null || t.memoizedState !== null) && (Kt = e);
  }
  function _r(e) {
    K(Xe, Xe.current), K(Ct, e), Kt === null && (Kt = e);
  }
  function Lf(e) {
    e.tag === 22 ? (K(Xe, Xe.current), K(Ct, e), Kt === null && (Kt = e)) : Xn();
  }
  function Xn() {
    K(Xe, Xe.current), K(Ct, Ct.current);
  }
  function Nt(e) {
    U(Ct), Kt === e && (Kt = null), U(Xe);
  }
  var Xe = w(0);
  function vs(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var a = t.memoizedState;
        if (a !== null && (a = a.dehydrated, a === null || To(a) || Ao(a)))
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
  var gn = 0, he = null, Me = null, Fe = null, ys = !1, ci = !1, Oa = !1, gs = 0, ul = 0, fi = null, jy = 0;
  function Ye() {
    throw Error(r(321));
  }
  function Sr(e, t) {
    if (t === null) return !1;
    for (var a = 0; a < t.length && a < e.length; a++)
      if (!At(e[a], t[a])) return !1;
    return !0;
  }
  function zr(e, t, a, l, u, o) {
    return gn = o, he = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, M.H = e === null || e.memoizedState === null ? Ed : Zr, Oa = !1, o = a(l, u), Oa = !1, ci && (o = Yf(
      t,
      a,
      l,
      u
    )), Gf(e), o;
  }
  function Gf(e) {
    M.H = cl;
    var t = Me !== null && Me.next !== null;
    if (gn = 0, Fe = Me = he = null, ys = !1, ul = 0, fi = null, t) throw Error(r(300));
    e === null || Ie || (e = e.dependencies, e !== null && rs(e) && (Ie = !0));
  }
  function Yf(e, t, a, l) {
    he = e;
    var u = 0;
    do {
      if (ci && (fi = null), ul = 0, ci = !1, 25 <= u) throw Error(r(301));
      if (u += 1, Fe = Me = null, e.updateQueue != null) {
        var o = e.updateQueue;
        o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
      }
      M.H = Td, o = t(a, l);
    } while (ci);
    return o;
  }
  function Ey() {
    var e = M.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? rl(t) : t, e = e.useState()[0], (Me !== null ? Me.memoizedState : null) !== e && (he.flags |= 1024), t;
  }
  function wr() {
    var e = gs !== 0;
    return gs = 0, e;
  }
  function xr(e, t, a) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~a;
  }
  function jr(e) {
    if (ys) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      ys = !1;
    }
    gn = 0, Fe = Me = he = null, ci = !1, ul = gs = 0, fi = null;
  }
  function mt() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Fe === null ? he.memoizedState = Fe = e : Fe = Fe.next = e, Fe;
  }
  function Ve() {
    if (Me === null) {
      var e = he.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Me.next;
    var t = Fe === null ? he.memoizedState : Fe.next;
    if (t !== null)
      Fe = t, Me = e;
    else {
      if (e === null)
        throw he.alternate === null ? Error(r(467)) : Error(r(310));
      Me = e, e = {
        memoizedState: Me.memoizedState,
        baseState: Me.baseState,
        baseQueue: Me.baseQueue,
        queue: Me.queue,
        next: null
      }, Fe === null ? he.memoizedState = Fe = e : Fe = Fe.next = e;
    }
    return Fe;
  }
  function bs() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function rl(e) {
    var t = ul;
    return ul += 1, fi === null && (fi = []), e = qf(fi, e, t), t = he, (Fe === null ? t.memoizedState : Fe.next) === null && (t = t.alternate, M.H = t === null || t.memoizedState === null ? Ed : Zr), e;
  }
  function _s(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return rl(e);
      if (e.$$typeof === G) return rt(e);
    }
    throw Error(r(438, String(e)));
  }
  function Er(e) {
    var t = null, a = he.updateQueue;
    if (a !== null && (t = a.memoCache), t == null) {
      var l = he.alternate;
      l !== null && (l = l.updateQueue, l !== null && (l = l.memoCache, l != null && (t = {
        data: l.data.map(function(u) {
          return u.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), a === null && (a = bs(), he.updateQueue = a), a.memoCache = t, a = t.data[t.index], a === void 0)
      for (a = t.data[t.index] = Array(e), l = 0; l < e; l++)
        a[l] = xe;
    return t.index++, a;
  }
  function bn(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Ss(e) {
    var t = Ve();
    return Tr(t, Me, e);
  }
  function Tr(e, t, a) {
    var l = e.queue;
    if (l === null) throw Error(r(311));
    l.lastRenderedReducer = a;
    var u = e.baseQueue, o = l.pending;
    if (o !== null) {
      if (u !== null) {
        var d = u.next;
        u.next = o.next, o.next = d;
      }
      t.baseQueue = u = o, l.pending = null;
    }
    if (o = e.baseState, u === null) e.memoizedState = o;
    else {
      t = u.next;
      var p = d = null, b = null, T = t, D = !1;
      do {
        var Q = T.lane & -536870913;
        if (Q !== T.lane ? (ge & Q) === Q : (gn & Q) === Q) {
          var A = T.revertLane;
          if (A === 0)
            b !== null && (b = b.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: T.action,
              hasEagerState: T.hasEagerState,
              eagerState: T.eagerState,
              next: null
            }), Q === li && (D = !0);
          else if ((gn & A) === A) {
            T = T.next, A === li && (D = !0);
            continue;
          } else
            Q = {
              lane: 0,
              revertLane: T.revertLane,
              gesture: null,
              action: T.action,
              hasEagerState: T.hasEagerState,
              eagerState: T.eagerState,
              next: null
            }, b === null ? (p = b = Q, d = o) : b = b.next = Q, he.lanes |= A, Fn |= A;
          Q = T.action, Oa && a(o, Q), o = T.hasEagerState ? T.eagerState : a(o, Q);
        } else
          A = {
            lane: Q,
            revertLane: T.revertLane,
            gesture: T.gesture,
            action: T.action,
            hasEagerState: T.hasEagerState,
            eagerState: T.eagerState,
            next: null
          }, b === null ? (p = b = A, d = o) : b = b.next = A, he.lanes |= Q, Fn |= Q;
        T = T.next;
      } while (T !== null && T !== t);
      if (b === null ? d = o : b.next = p, !At(o, e.memoizedState) && (Ie = !0, D && (a = si, a !== null)))
        throw a;
      e.memoizedState = o, e.baseState = d, e.baseQueue = b, l.lastRenderedState = o;
    }
    return u === null && (l.lanes = 0), [e.memoizedState, l.dispatch];
  }
  function Ar(e) {
    var t = Ve(), a = t.queue;
    if (a === null) throw Error(r(311));
    a.lastRenderedReducer = e;
    var l = a.dispatch, u = a.pending, o = t.memoizedState;
    if (u !== null) {
      a.pending = null;
      var d = u = u.next;
      do
        o = e(o, d.action), d = d.next;
      while (d !== u);
      At(o, t.memoizedState) || (Ie = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), a.lastRenderedState = o;
    }
    return [o, l];
  }
  function Kf(e, t, a) {
    var l = he, u = Ve(), o = Se;
    if (o) {
      if (a === void 0) throw Error(r(407));
      a = a();
    } else a = t();
    var d = !At(
      (Me || u).memoizedState,
      a
    );
    if (d && (u.memoizedState = a, Ie = !0), u = u.queue, Nr(Jf.bind(null, l, u, e), [
      e
    ]), u.getSnapshot !== t || d || Fe !== null && Fe.memoizedState.tag & 1) {
      if (l.flags |= 2048, di(
        9,
        { destroy: void 0 },
        Vf.bind(
          null,
          l,
          u,
          a,
          t
        ),
        null
      ), Ue === null) throw Error(r(349));
      o || (gn & 127) !== 0 || Xf(l, t, a);
    }
    return a;
  }
  function Xf(e, t, a) {
    e.flags |= 16384, e = { getSnapshot: t, value: a }, t = he.updateQueue, t === null ? (t = bs(), he.updateQueue = t, t.stores = [e]) : (a = t.stores, a === null ? t.stores = [e] : a.push(e));
  }
  function Vf(e, t, a, l) {
    t.value = a, t.getSnapshot = l, Ff(t) && If(e);
  }
  function Jf(e, t, a) {
    return a(function() {
      Ff(t) && If(e);
    });
  }
  function Ff(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var a = t();
      return !At(e, a);
    } catch {
      return !0;
    }
  }
  function If(e) {
    var t = _a(e, 2);
    t !== null && wt(t, e, 2);
  }
  function Or(e) {
    var t = mt();
    if (typeof e == "function") {
      var a = e;
      if (e = a(), Oa) {
        Un(!0);
        try {
          a();
        } finally {
          Un(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: bn,
      lastRenderedState: e
    }, t;
  }
  function Wf(e, t, a, l) {
    return e.baseState = a, Tr(
      e,
      Me,
      typeof l == "function" ? l : bn
    );
  }
  function Ty(e, t, a, l, u) {
    if (xs(e)) throw Error(r(485));
    if (e = t.action, e !== null) {
      var o = {
        payload: u,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(d) {
          o.listeners.push(d);
        }
      };
      M.T !== null ? a(!0) : o.isTransition = !1, l(o), a = t.pending, a === null ? (o.next = t.pending = o, Pf(t, o)) : (o.next = a.next, t.pending = a.next = o);
    }
  }
  function Pf(e, t) {
    var a = t.action, l = t.payload, u = e.state;
    if (t.isTransition) {
      var o = M.T, d = {};
      M.T = d;
      try {
        var p = a(u, l), b = M.S;
        b !== null && b(d, p), ed(e, t, p);
      } catch (T) {
        Cr(e, t, T);
      } finally {
        o !== null && d.types !== null && (o.types = d.types), M.T = o;
      }
    } else
      try {
        o = a(u, l), ed(e, t, o);
      } catch (T) {
        Cr(e, t, T);
      }
  }
  function ed(e, t, a) {
    a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(
      function(l) {
        td(e, t, l);
      },
      function(l) {
        return Cr(e, t, l);
      }
    ) : td(e, t, a);
  }
  function td(e, t, a) {
    t.status = "fulfilled", t.value = a, nd(t), e.state = a, t = e.pending, t !== null && (a = t.next, a === t ? e.pending = null : (a = a.next, t.next = a, Pf(e, a)));
  }
  function Cr(e, t, a) {
    var l = e.pending;
    if (e.pending = null, l !== null) {
      l = l.next;
      do
        t.status = "rejected", t.reason = a, nd(t), t = t.next;
      while (t !== l);
    }
    e.action = null;
  }
  function nd(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function ad(e, t) {
    return t;
  }
  function id(e, t) {
    if (Se) {
      var a = Ue.formState;
      if (a !== null) {
        e: {
          var l = he;
          if (Se) {
            if (Qe) {
              t: {
                for (var u = Qe, o = Yt; u.nodeType !== 8; ) {
                  if (!o) {
                    u = null;
                    break t;
                  }
                  if (u = Xt(
                    u.nextSibling
                  ), u === null) {
                    u = null;
                    break t;
                  }
                }
                o = u.data, u = o === "F!" || o === "F" ? u : null;
              }
              if (u) {
                Qe = Xt(
                  u.nextSibling
                ), l = u.data === "F!";
                break e;
              }
            }
            Hn(l);
          }
          l = !1;
        }
        l && (t = a[0]);
      }
    }
    return a = mt(), a.memoizedState = a.baseState = t, l = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: ad,
      lastRenderedState: t
    }, a.queue = l, a = wd.bind(
      null,
      he,
      l
    ), l.dispatch = a, l = Or(!1), o = Ur.bind(
      null,
      he,
      !1,
      l.queue
    ), l = mt(), u = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, l.queue = u, a = Ty.bind(
      null,
      he,
      u,
      o,
      a
    ), u.dispatch = a, l.memoizedState = e, [t, a, !1];
  }
  function ld(e) {
    var t = Ve();
    return sd(t, Me, e);
  }
  function sd(e, t, a) {
    if (t = Tr(
      e,
      t,
      ad
    )[0], e = Ss(bn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var l = rl(t);
      } catch (d) {
        throw d === ui ? fs : d;
      }
    else l = t;
    t = Ve();
    var u = t.queue, o = u.dispatch;
    return a !== t.memoizedState && (he.flags |= 2048, di(
      9,
      { destroy: void 0 },
      Ay.bind(null, u, a),
      null
    )), [l, o, e];
  }
  function Ay(e, t) {
    e.action = t;
  }
  function ud(e) {
    var t = Ve(), a = Me;
    if (a !== null)
      return sd(t, a, e);
    Ve(), t = t.memoizedState, a = Ve();
    var l = a.queue.dispatch;
    return a.memoizedState = e, [t, l, !1];
  }
  function di(e, t, a, l) {
    return e = { tag: e, create: a, deps: l, inst: t, next: null }, t = he.updateQueue, t === null && (t = bs(), he.updateQueue = t), a = t.lastEffect, a === null ? t.lastEffect = e.next = e : (l = a.next, a.next = e, e.next = l, t.lastEffect = e), e;
  }
  function rd() {
    return Ve().memoizedState;
  }
  function zs(e, t, a, l) {
    var u = mt();
    he.flags |= e, u.memoizedState = di(
      1 | t,
      { destroy: void 0 },
      a,
      l === void 0 ? null : l
    );
  }
  function ws(e, t, a, l) {
    var u = Ve();
    l = l === void 0 ? null : l;
    var o = u.memoizedState.inst;
    Me !== null && l !== null && Sr(l, Me.memoizedState.deps) ? u.memoizedState = di(t, o, a, l) : (he.flags |= e, u.memoizedState = di(
      1 | t,
      o,
      a,
      l
    ));
  }
  function od(e, t) {
    zs(8390656, 8, e, t);
  }
  function Nr(e, t) {
    ws(2048, 8, e, t);
  }
  function Oy(e) {
    he.flags |= 4;
    var t = he.updateQueue;
    if (t === null)
      t = bs(), he.updateQueue = t, t.events = [e];
    else {
      var a = t.events;
      a === null ? t.events = [e] : a.push(e);
    }
  }
  function cd(e) {
    var t = Ve().memoizedState;
    return Oy({ ref: t, nextImpl: e }), function() {
      if ((Ae & 2) !== 0) throw Error(r(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function fd(e, t) {
    return ws(4, 2, e, t);
  }
  function dd(e, t) {
    return ws(4, 4, e, t);
  }
  function hd(e, t) {
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
  function md(e, t, a) {
    a = a != null ? a.concat([e]) : null, ws(4, 4, hd.bind(null, t, e), a);
  }
  function Mr() {
  }
  function pd(e, t) {
    var a = Ve();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    return t !== null && Sr(t, l[1]) ? l[0] : (a.memoizedState = [e, t], e);
  }
  function vd(e, t) {
    var a = Ve();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    if (t !== null && Sr(t, l[1]))
      return l[0];
    if (l = e(), Oa) {
      Un(!0);
      try {
        e();
      } finally {
        Un(!1);
      }
    }
    return a.memoizedState = [l, t], l;
  }
  function Dr(e, t, a) {
    return a === void 0 || (gn & 1073741824) !== 0 && (ge & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = a, e = yh(), he.lanes |= e, Fn |= e, a);
  }
  function yd(e, t, a, l) {
    return At(a, t) ? a : oi.current !== null ? (e = Dr(e, a, l), At(e, t) || (Ie = !0), e) : (gn & 42) === 0 || (gn & 1073741824) !== 0 && (ge & 261930) === 0 ? (Ie = !0, e.memoizedState = a) : (e = yh(), he.lanes |= e, Fn |= e, t);
  }
  function gd(e, t, a, l, u) {
    var o = Y.p;
    Y.p = o !== 0 && 8 > o ? o : 8;
    var d = M.T, p = {};
    M.T = p, Ur(e, !1, t, a);
    try {
      var b = u(), T = M.S;
      if (T !== null && T(p, b), b !== null && typeof b == "object" && typeof b.then == "function") {
        var D = xy(
          b,
          l
        );
        ol(
          e,
          t,
          D,
          Rt(e)
        );
      } else
        ol(
          e,
          t,
          l,
          Rt(e)
        );
    } catch (Q) {
      ol(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: Q },
        Rt()
      );
    } finally {
      Y.p = o, d !== null && p.types !== null && (d.types = p.types), M.T = d;
    }
  }
  function Cy() {
  }
  function Rr(e, t, a, l) {
    if (e.tag !== 5) throw Error(r(476));
    var u = bd(e).queue;
    gd(
      e,
      u,
      t,
      V,
      a === null ? Cy : function() {
        return _d(e), a(l);
      }
    );
  }
  function bd(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: V,
      baseState: V,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: bn,
        lastRenderedState: V
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
        lastRenderedReducer: bn,
        lastRenderedState: a
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function _d(e) {
    var t = bd(e);
    t.next === null && (t = e.alternate.memoizedState), ol(
      e,
      t.next.queue,
      {},
      Rt()
    );
  }
  function qr() {
    return rt(El);
  }
  function Sd() {
    return Ve().memoizedState;
  }
  function zd() {
    return Ve().memoizedState;
  }
  function Ny(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var a = Rt();
          e = Gn(a);
          var l = Yn(t, e, a);
          l !== null && (wt(l, t, a), il(l, t, a)), t = { cache: cr() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function My(e, t, a) {
    var l = Rt();
    a = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, xs(e) ? xd(t, a) : (a = Pu(e, t, a, l), a !== null && (wt(a, e, l), jd(a, t, l)));
  }
  function wd(e, t, a) {
    var l = Rt();
    ol(e, t, a, l);
  }
  function ol(e, t, a, l) {
    var u = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (xs(e)) xd(t, u);
    else {
      var o = e.alternate;
      if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer, o !== null))
        try {
          var d = t.lastRenderedState, p = o(d, a);
          if (u.hasEagerState = !0, u.eagerState = p, At(p, d))
            return is(e, t, u, 0), Ue === null && as(), !1;
        } catch {
        } finally {
        }
      if (a = Pu(e, t, u, l), a !== null)
        return wt(a, e, l), jd(a, t, l), !0;
    }
    return !1;
  }
  function Ur(e, t, a, l) {
    if (l = {
      lane: 2,
      revertLane: po(),
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, xs(e)) {
      if (t) throw Error(r(479));
    } else
      t = Pu(
        e,
        a,
        l,
        2
      ), t !== null && wt(t, e, 2);
  }
  function xs(e) {
    var t = e.alternate;
    return e === he || t !== null && t === he;
  }
  function xd(e, t) {
    ci = ys = !0;
    var a = e.pending;
    a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
  }
  function jd(e, t, a) {
    if ((a & 4194048) !== 0) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, Oc(e, a);
    }
  }
  var cl = {
    readContext: rt,
    use: _s,
    useCallback: Ye,
    useContext: Ye,
    useEffect: Ye,
    useImperativeHandle: Ye,
    useLayoutEffect: Ye,
    useInsertionEffect: Ye,
    useMemo: Ye,
    useReducer: Ye,
    useRef: Ye,
    useState: Ye,
    useDebugValue: Ye,
    useDeferredValue: Ye,
    useTransition: Ye,
    useSyncExternalStore: Ye,
    useId: Ye,
    useHostTransitionStatus: Ye,
    useFormState: Ye,
    useActionState: Ye,
    useOptimistic: Ye,
    useMemoCache: Ye,
    useCacheRefresh: Ye
  };
  cl.useEffectEvent = Ye;
  var Ed = {
    readContext: rt,
    use: _s,
    useCallback: function(e, t) {
      return mt().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: rt,
    useEffect: od,
    useImperativeHandle: function(e, t, a) {
      a = a != null ? a.concat([e]) : null, zs(
        4194308,
        4,
        hd.bind(null, t, e),
        a
      );
    },
    useLayoutEffect: function(e, t) {
      return zs(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      zs(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var a = mt();
      t = t === void 0 ? null : t;
      var l = e();
      if (Oa) {
        Un(!0);
        try {
          e();
        } finally {
          Un(!1);
        }
      }
      return a.memoizedState = [l, t], l;
    },
    useReducer: function(e, t, a) {
      var l = mt();
      if (a !== void 0) {
        var u = a(t);
        if (Oa) {
          Un(!0);
          try {
            a(t);
          } finally {
            Un(!1);
          }
        }
      } else u = t;
      return l.memoizedState = l.baseState = u, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: u
      }, l.queue = e, e = e.dispatch = My.bind(
        null,
        he,
        e
      ), [l.memoizedState, e];
    },
    useRef: function(e) {
      var t = mt();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = Or(e);
      var t = e.queue, a = wd.bind(null, he, t);
      return t.dispatch = a, [e.memoizedState, a];
    },
    useDebugValue: Mr,
    useDeferredValue: function(e, t) {
      var a = mt();
      return Dr(a, e, t);
    },
    useTransition: function() {
      var e = Or(!1);
      return e = gd.bind(
        null,
        he,
        e.queue,
        !0,
        !1
      ), mt().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, a) {
      var l = he, u = mt();
      if (Se) {
        if (a === void 0)
          throw Error(r(407));
        a = a();
      } else {
        if (a = t(), Ue === null)
          throw Error(r(349));
        (ge & 127) !== 0 || Xf(l, t, a);
      }
      u.memoizedState = a;
      var o = { value: a, getSnapshot: t };
      return u.queue = o, od(Jf.bind(null, l, o, e), [
        e
      ]), l.flags |= 2048, di(
        9,
        { destroy: void 0 },
        Vf.bind(
          null,
          l,
          o,
          a,
          t
        ),
        null
      ), a;
    },
    useId: function() {
      var e = mt(), t = Ue.identifierPrefix;
      if (Se) {
        var a = un, l = sn;
        a = (l & ~(1 << 32 - Tt(l) - 1)).toString(32) + a, t = "_" + t + "R_" + a, a = gs++, 0 < a && (t += "H" + a.toString(32)), t += "_";
      } else
        a = jy++, t = "_" + t + "r_" + a.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: qr,
    useFormState: id,
    useActionState: id,
    useOptimistic: function(e) {
      var t = mt();
      t.memoizedState = t.baseState = e;
      var a = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = a, t = Ur.bind(
        null,
        he,
        !0,
        a
      ), a.dispatch = t, [e, t];
    },
    useMemoCache: Er,
    useCacheRefresh: function() {
      return mt().memoizedState = Ny.bind(
        null,
        he
      );
    },
    useEffectEvent: function(e) {
      var t = mt(), a = { impl: e };
      return t.memoizedState = a, function() {
        if ((Ae & 2) !== 0)
          throw Error(r(440));
        return a.impl.apply(void 0, arguments);
      };
    }
  }, Zr = {
    readContext: rt,
    use: _s,
    useCallback: pd,
    useContext: rt,
    useEffect: Nr,
    useImperativeHandle: md,
    useInsertionEffect: fd,
    useLayoutEffect: dd,
    useMemo: vd,
    useReducer: Ss,
    useRef: rd,
    useState: function() {
      return Ss(bn);
    },
    useDebugValue: Mr,
    useDeferredValue: function(e, t) {
      var a = Ve();
      return yd(
        a,
        Me.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = Ss(bn)[0], t = Ve().memoizedState;
      return [
        typeof e == "boolean" ? e : rl(e),
        t
      ];
    },
    useSyncExternalStore: Kf,
    useId: Sd,
    useHostTransitionStatus: qr,
    useFormState: ld,
    useActionState: ld,
    useOptimistic: function(e, t) {
      var a = Ve();
      return Wf(a, Me, e, t);
    },
    useMemoCache: Er,
    useCacheRefresh: zd
  };
  Zr.useEffectEvent = cd;
  var Td = {
    readContext: rt,
    use: _s,
    useCallback: pd,
    useContext: rt,
    useEffect: Nr,
    useImperativeHandle: md,
    useInsertionEffect: fd,
    useLayoutEffect: dd,
    useMemo: vd,
    useReducer: Ar,
    useRef: rd,
    useState: function() {
      return Ar(bn);
    },
    useDebugValue: Mr,
    useDeferredValue: function(e, t) {
      var a = Ve();
      return Me === null ? Dr(a, e, t) : yd(
        a,
        Me.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = Ar(bn)[0], t = Ve().memoizedState;
      return [
        typeof e == "boolean" ? e : rl(e),
        t
      ];
    },
    useSyncExternalStore: Kf,
    useId: Sd,
    useHostTransitionStatus: qr,
    useFormState: ud,
    useActionState: ud,
    useOptimistic: function(e, t) {
      var a = Ve();
      return Me !== null ? Wf(a, Me, e, t) : (a.baseState = e, [e, a.queue.dispatch]);
    },
    useMemoCache: Er,
    useCacheRefresh: zd
  };
  Td.useEffectEvent = cd;
  function Qr(e, t, a, l) {
    t = e.memoizedState, a = a(l, t), a = a == null ? t : j({}, t, a), e.memoizedState = a, e.lanes === 0 && (e.updateQueue.baseState = a);
  }
  var kr = {
    enqueueSetState: function(e, t, a) {
      e = e._reactInternals;
      var l = Rt(), u = Gn(l);
      u.payload = t, a != null && (u.callback = a), t = Yn(e, u, l), t !== null && (wt(t, e, l), il(t, e, l));
    },
    enqueueReplaceState: function(e, t, a) {
      e = e._reactInternals;
      var l = Rt(), u = Gn(l);
      u.tag = 1, u.payload = t, a != null && (u.callback = a), t = Yn(e, u, l), t !== null && (wt(t, e, l), il(t, e, l));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var a = Rt(), l = Gn(a);
      l.tag = 2, t != null && (l.callback = t), t = Yn(e, l, a), t !== null && (wt(t, e, a), il(t, e, a));
    }
  };
  function Ad(e, t, a, l, u, o, d) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, o, d) : t.prototype && t.prototype.isPureReactComponent ? !Fi(a, l) || !Fi(u, o) : !0;
  }
  function Od(e, t, a, l) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, l), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, l), t.state !== e && kr.enqueueReplaceState(t, t.state, null);
  }
  function Ca(e, t) {
    var a = t;
    if ("ref" in t) {
      a = {};
      for (var l in t)
        l !== "ref" && (a[l] = t[l]);
    }
    if (e = e.defaultProps) {
      a === t && (a = j({}, a));
      for (var u in e)
        a[u] === void 0 && (a[u] = e[u]);
    }
    return a;
  }
  function Cd(e) {
    ns(e);
  }
  function Nd(e) {
    console.error(e);
  }
  function Md(e) {
    ns(e);
  }
  function js(e, t) {
    try {
      var a = e.onUncaughtError;
      a(t.value, { componentStack: t.stack });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function Dd(e, t, a) {
    try {
      var l = e.onCaughtError;
      l(a.value, {
        componentStack: a.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (u) {
      setTimeout(function() {
        throw u;
      });
    }
  }
  function Br(e, t, a) {
    return a = Gn(a), a.tag = 3, a.payload = { element: null }, a.callback = function() {
      js(e, t);
    }, a;
  }
  function Rd(e) {
    return e = Gn(e), e.tag = 3, e;
  }
  function qd(e, t, a, l) {
    var u = a.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var o = l.value;
      e.payload = function() {
        return u(o);
      }, e.callback = function() {
        Dd(t, a, l);
      };
    }
    var d = a.stateNode;
    d !== null && typeof d.componentDidCatch == "function" && (e.callback = function() {
      Dd(t, a, l), typeof u != "function" && (In === null ? In = /* @__PURE__ */ new Set([this]) : In.add(this));
      var p = l.stack;
      this.componentDidCatch(l.value, {
        componentStack: p !== null ? p : ""
      });
    });
  }
  function Dy(e, t, a, l, u) {
    if (a.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
      if (t = a.alternate, t !== null && ii(
        t,
        a,
        u,
        !0
      ), a = Ct.current, a !== null) {
        switch (a.tag) {
          case 31:
          case 13:
            return Kt === null ? Zs() : a.alternate === null && Ke === 0 && (Ke = 3), a.flags &= -257, a.flags |= 65536, a.lanes = u, l === ds ? a.flags |= 16384 : (t = a.updateQueue, t === null ? a.updateQueue = /* @__PURE__ */ new Set([l]) : t.add(l), fo(e, l, u)), !1;
          case 22:
            return a.flags |= 65536, l === ds ? a.flags |= 16384 : (t = a.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([l])
            }, a.updateQueue = t) : (a = t.retryQueue, a === null ? t.retryQueue = /* @__PURE__ */ new Set([l]) : a.add(l)), fo(e, l, u)), !1;
        }
        throw Error(r(435, a.tag));
      }
      return fo(e, l, u), Zs(), !1;
    }
    if (Se)
      return t = Ct.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = u, l !== lr && (e = Error(r(422), { cause: l }), Pi($t(e, a)))) : (l !== lr && (t = Error(r(423), {
        cause: l
      }), Pi(
        $t(t, a)
      )), e = e.current.alternate, e.flags |= 65536, u &= -u, e.lanes |= u, l = $t(l, a), u = Br(
        e.stateNode,
        l,
        u
      ), vr(e, u), Ke !== 4 && (Ke = 2)), !1;
    var o = Error(r(520), { cause: l });
    if (o = $t(o, a), gl === null ? gl = [o] : gl.push(o), Ke !== 4 && (Ke = 2), t === null) return !0;
    l = $t(l, a), a = t;
    do {
      switch (a.tag) {
        case 3:
          return a.flags |= 65536, e = u & -u, a.lanes |= e, e = Br(a.stateNode, l, e), vr(a, e), !1;
        case 1:
          if (t = a.type, o = a.stateNode, (a.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (In === null || !In.has(o))))
            return a.flags |= 65536, u &= -u, a.lanes |= u, u = Rd(u), qd(
              u,
              e,
              a,
              l
            ), vr(a, u), !1;
      }
      a = a.return;
    } while (a !== null);
    return !1;
  }
  var Hr = Error(r(461)), Ie = !1;
  function ot(e, t, a, l) {
    t.child = e === null ? kf(t, null, a, l) : Aa(
      t,
      e.child,
      a,
      l
    );
  }
  function Ud(e, t, a, l, u) {
    a = a.render;
    var o = t.ref;
    if ("ref" in l) {
      var d = {};
      for (var p in l)
        p !== "ref" && (d[p] = l[p]);
    } else d = l;
    return xa(t), l = zr(
      e,
      t,
      a,
      d,
      o,
      u
    ), p = wr(), e !== null && !Ie ? (xr(e, t, u), _n(e, t, u)) : (Se && p && ar(t), t.flags |= 1, ot(e, t, l, u), t.child);
  }
  function Zd(e, t, a, l, u) {
    if (e === null) {
      var o = a.type;
      return typeof o == "function" && !er(o) && o.defaultProps === void 0 && a.compare === null ? (t.tag = 15, t.type = o, Qd(
        e,
        t,
        o,
        l,
        u
      )) : (e = ss(
        a.type,
        null,
        l,
        t,
        t.mode,
        u
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (o = e.child, !Jr(e, u)) {
      var d = o.memoizedProps;
      if (a = a.compare, a = a !== null ? a : Fi, a(d, l) && e.ref === t.ref)
        return _n(e, t, u);
    }
    return t.flags |= 1, e = mn(o, l), e.ref = t.ref, e.return = t, t.child = e;
  }
  function Qd(e, t, a, l, u) {
    if (e !== null) {
      var o = e.memoizedProps;
      if (Fi(o, l) && e.ref === t.ref)
        if (Ie = !1, t.pendingProps = l = o, Jr(e, u))
          (e.flags & 131072) !== 0 && (Ie = !0);
        else
          return t.lanes = e.lanes, _n(e, t, u);
    }
    return $r(
      e,
      t,
      a,
      l,
      u
    );
  }
  function kd(e, t, a, l) {
    var u = l.children, o = e !== null ? e.memoizedState : null;
    if (e === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), l.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (o = o !== null ? o.baseLanes | a : a, e !== null) {
          for (l = t.child = e.child, u = 0; l !== null; )
            u = u | l.lanes | l.childLanes, l = l.sibling;
          l = u & ~o;
        } else l = 0, t.child = null;
        return Bd(
          e,
          t,
          o,
          a,
          l
        );
      }
      if ((a & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && cs(
          t,
          o !== null ? o.cachePool : null
        ), o !== null ? $f(t, o) : gr(), Lf(t);
      else
        return l = t.lanes = 536870912, Bd(
          e,
          t,
          o !== null ? o.baseLanes | a : a,
          a,
          l
        );
    } else
      o !== null ? (cs(t, o.cachePool), $f(t, o), Xn(), t.memoizedState = null) : (e !== null && cs(t, null), gr(), Xn());
    return ot(e, t, u, a), t.child;
  }
  function fl(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function Bd(e, t, a, l, u) {
    var o = dr();
    return o = o === null ? null : { parent: Je._currentValue, pool: o }, t.memoizedState = {
      baseLanes: a,
      cachePool: o
    }, e !== null && cs(t, null), gr(), Lf(t), e !== null && ii(e, t, l, !0), t.childLanes = u, null;
  }
  function Es(e, t) {
    return t = As(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function Hd(e, t, a) {
    return Aa(t, e.child, null, a), e = Es(t, t.pendingProps), e.flags |= 2, Nt(t), t.memoizedState = null, e;
  }
  function Ry(e, t, a) {
    var l = t.pendingProps, u = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (Se) {
        if (l.mode === "hidden")
          return e = Es(t, l), t.lanes = 536870912, fl(null, e);
        if (_r(t), (e = Qe) ? (e = Ph(
          e,
          Yt
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: kn !== null ? { id: sn, overflow: un } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = xf(e), a.return = t, t.child = a, ut = t, Qe = null)) : e = null, e === null) throw Hn(t);
        return t.lanes = 536870912, null;
      }
      return Es(t, l);
    }
    var o = e.memoizedState;
    if (o !== null) {
      var d = o.dehydrated;
      if (_r(t), u)
        if (t.flags & 256)
          t.flags &= -257, t = Hd(
            e,
            t,
            a
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(r(558));
      else if (Ie || ii(e, t, a, !1), u = (a & e.childLanes) !== 0, Ie || u) {
        if (l = Ue, l !== null && (d = Cc(l, a), d !== 0 && d !== o.retryLane))
          throw o.retryLane = d, _a(e, d), wt(l, e, d), Hr;
        Zs(), t = Hd(
          e,
          t,
          a
        );
      } else
        e = o.treeContext, Qe = Xt(d.nextSibling), ut = t, Se = !0, Bn = null, Yt = !1, e !== null && Tf(t, e), t = Es(t, l), t.flags |= 4096;
      return t;
    }
    return e = mn(e.child, {
      mode: l.mode,
      children: l.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function Ts(e, t) {
    var a = t.ref;
    if (a === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof a != "function" && typeof a != "object")
        throw Error(r(284));
      (e === null || e.ref !== a) && (t.flags |= 4194816);
    }
  }
  function $r(e, t, a, l, u) {
    return xa(t), a = zr(
      e,
      t,
      a,
      l,
      void 0,
      u
    ), l = wr(), e !== null && !Ie ? (xr(e, t, u), _n(e, t, u)) : (Se && l && ar(t), t.flags |= 1, ot(e, t, a, u), t.child);
  }
  function $d(e, t, a, l, u, o) {
    return xa(t), t.updateQueue = null, a = Yf(
      t,
      l,
      a,
      u
    ), Gf(e), l = wr(), e !== null && !Ie ? (xr(e, t, o), _n(e, t, o)) : (Se && l && ar(t), t.flags |= 1, ot(e, t, a, o), t.child);
  }
  function Ld(e, t, a, l, u) {
    if (xa(t), t.stateNode === null) {
      var o = ei, d = a.contextType;
      typeof d == "object" && d !== null && (o = rt(d)), o = new a(l, o), t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, o.updater = kr, t.stateNode = o, o._reactInternals = t, o = t.stateNode, o.props = l, o.state = t.memoizedState, o.refs = {}, mr(t), d = a.contextType, o.context = typeof d == "object" && d !== null ? rt(d) : ei, o.state = t.memoizedState, d = a.getDerivedStateFromProps, typeof d == "function" && (Qr(
        t,
        a,
        d,
        l
      ), o.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (d = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), d !== o.state && kr.enqueueReplaceState(o, o.state, null), sl(t, l, o, u), ll(), o.state = t.memoizedState), typeof o.componentDidMount == "function" && (t.flags |= 4194308), l = !0;
    } else if (e === null) {
      o = t.stateNode;
      var p = t.memoizedProps, b = Ca(a, p);
      o.props = b;
      var T = o.context, D = a.contextType;
      d = ei, typeof D == "object" && D !== null && (d = rt(D));
      var Q = a.getDerivedStateFromProps;
      D = typeof Q == "function" || typeof o.getSnapshotBeforeUpdate == "function", p = t.pendingProps !== p, D || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (p || T !== d) && Od(
        t,
        o,
        l,
        d
      ), Ln = !1;
      var A = t.memoizedState;
      o.state = A, sl(t, l, o, u), ll(), T = t.memoizedState, p || A !== T || Ln ? (typeof Q == "function" && (Qr(
        t,
        a,
        Q,
        l
      ), T = t.memoizedState), (b = Ln || Ad(
        t,
        a,
        b,
        l,
        A,
        T,
        d
      )) ? (D || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = l, t.memoizedState = T), o.props = l, o.state = T, o.context = d, l = b) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), l = !1);
    } else {
      o = t.stateNode, pr(e, t), d = t.memoizedProps, D = Ca(a, d), o.props = D, Q = t.pendingProps, A = o.context, T = a.contextType, b = ei, typeof T == "object" && T !== null && (b = rt(T)), p = a.getDerivedStateFromProps, (T = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (d !== Q || A !== b) && Od(
        t,
        o,
        l,
        b
      ), Ln = !1, A = t.memoizedState, o.state = A, sl(t, l, o, u), ll();
      var C = t.memoizedState;
      d !== Q || A !== C || Ln || e !== null && e.dependencies !== null && rs(e.dependencies) ? (typeof p == "function" && (Qr(
        t,
        a,
        p,
        l
      ), C = t.memoizedState), (D = Ln || Ad(
        t,
        a,
        D,
        l,
        A,
        C,
        b
      ) || e !== null && e.dependencies !== null && rs(e.dependencies)) ? (T || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(l, C, b), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(
        l,
        C,
        b
      )), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), t.memoizedProps = l, t.memoizedState = C), o.props = l, o.state = C, o.context = b, l = D) : (typeof o.componentDidUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || d === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), l = !1);
    }
    return o = l, Ts(e, t), l = (t.flags & 128) !== 0, o || l ? (o = t.stateNode, a = l && typeof a.getDerivedStateFromError != "function" ? null : o.render(), t.flags |= 1, e !== null && l ? (t.child = Aa(
      t,
      e.child,
      null,
      u
    ), t.child = Aa(
      t,
      null,
      a,
      u
    )) : ot(e, t, a, u), t.memoizedState = o.state, e = t.child) : e = _n(
      e,
      t,
      u
    ), e;
  }
  function Gd(e, t, a, l) {
    return za(), t.flags |= 256, ot(e, t, a, l), t.child;
  }
  var Lr = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Gr(e) {
    return { baseLanes: e, cachePool: Df() };
  }
  function Yr(e, t, a) {
    return e = e !== null ? e.childLanes & ~a : 0, t && (e |= Dt), e;
  }
  function Yd(e, t, a) {
    var l = t.pendingProps, u = !1, o = (t.flags & 128) !== 0, d;
    if ((d = o) || (d = e !== null && e.memoizedState === null ? !1 : (Xe.current & 2) !== 0), d && (u = !0, t.flags &= -129), d = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (Se) {
        if (u ? Kn(t) : Xn(), (e = Qe) ? (e = Ph(
          e,
          Yt
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: kn !== null ? { id: sn, overflow: un } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = xf(e), a.return = t, t.child = a, ut = t, Qe = null)) : e = null, e === null) throw Hn(t);
        return Ao(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var p = l.children;
      return l = l.fallback, u ? (Xn(), u = t.mode, p = As(
        { mode: "hidden", children: p },
        u
      ), l = Sa(
        l,
        u,
        a,
        null
      ), p.return = t, l.return = t, p.sibling = l, t.child = p, l = t.child, l.memoizedState = Gr(a), l.childLanes = Yr(
        e,
        d,
        a
      ), t.memoizedState = Lr, fl(null, l)) : (Kn(t), Kr(t, p));
    }
    var b = e.memoizedState;
    if (b !== null && (p = b.dehydrated, p !== null)) {
      if (o)
        t.flags & 256 ? (Kn(t), t.flags &= -257, t = Xr(
          e,
          t,
          a
        )) : t.memoizedState !== null ? (Xn(), t.child = e.child, t.flags |= 128, t = null) : (Xn(), p = l.fallback, u = t.mode, l = As(
          { mode: "visible", children: l.children },
          u
        ), p = Sa(
          p,
          u,
          a,
          null
        ), p.flags |= 2, l.return = t, p.return = t, l.sibling = p, t.child = l, Aa(
          t,
          e.child,
          null,
          a
        ), l = t.child, l.memoizedState = Gr(a), l.childLanes = Yr(
          e,
          d,
          a
        ), t.memoizedState = Lr, t = fl(null, l));
      else if (Kn(t), Ao(p)) {
        if (d = p.nextSibling && p.nextSibling.dataset, d) var T = d.dgst;
        d = T, l = Error(r(419)), l.stack = "", l.digest = d, Pi({ value: l, source: null, stack: null }), t = Xr(
          e,
          t,
          a
        );
      } else if (Ie || ii(e, t, a, !1), d = (a & e.childLanes) !== 0, Ie || d) {
        if (d = Ue, d !== null && (l = Cc(d, a), l !== 0 && l !== b.retryLane))
          throw b.retryLane = l, _a(e, l), wt(d, e, l), Hr;
        To(p) || Zs(), t = Xr(
          e,
          t,
          a
        );
      } else
        To(p) ? (t.flags |= 192, t.child = e.child, t = null) : (e = b.treeContext, Qe = Xt(
          p.nextSibling
        ), ut = t, Se = !0, Bn = null, Yt = !1, e !== null && Tf(t, e), t = Kr(
          t,
          l.children
        ), t.flags |= 4096);
      return t;
    }
    return u ? (Xn(), p = l.fallback, u = t.mode, b = e.child, T = b.sibling, l = mn(b, {
      mode: "hidden",
      children: l.children
    }), l.subtreeFlags = b.subtreeFlags & 65011712, T !== null ? p = mn(
      T,
      p
    ) : (p = Sa(
      p,
      u,
      a,
      null
    ), p.flags |= 2), p.return = t, l.return = t, l.sibling = p, t.child = l, fl(null, l), l = t.child, p = e.child.memoizedState, p === null ? p = Gr(a) : (u = p.cachePool, u !== null ? (b = Je._currentValue, u = u.parent !== b ? { parent: b, pool: b } : u) : u = Df(), p = {
      baseLanes: p.baseLanes | a,
      cachePool: u
    }), l.memoizedState = p, l.childLanes = Yr(
      e,
      d,
      a
    ), t.memoizedState = Lr, fl(e.child, l)) : (Kn(t), a = e.child, e = a.sibling, a = mn(a, {
      mode: "visible",
      children: l.children
    }), a.return = t, a.sibling = null, e !== null && (d = t.deletions, d === null ? (t.deletions = [e], t.flags |= 16) : d.push(e)), t.child = a, t.memoizedState = null, a);
  }
  function Kr(e, t) {
    return t = As(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function As(e, t) {
    return e = Ot(22, e, null, t), e.lanes = 0, e;
  }
  function Xr(e, t, a) {
    return Aa(t, e.child, null, a), e = Kr(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Kd(e, t, a) {
    e.lanes |= t;
    var l = e.alternate;
    l !== null && (l.lanes |= t), rr(e.return, t, a);
  }
  function Vr(e, t, a, l, u, o) {
    var d = e.memoizedState;
    d === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: l,
      tail: a,
      tailMode: u,
      treeForkCount: o
    } : (d.isBackwards = t, d.rendering = null, d.renderingStartTime = 0, d.last = l, d.tail = a, d.tailMode = u, d.treeForkCount = o);
  }
  function Xd(e, t, a) {
    var l = t.pendingProps, u = l.revealOrder, o = l.tail;
    l = l.children;
    var d = Xe.current, p = (d & 2) !== 0;
    if (p ? (d = d & 1 | 2, t.flags |= 128) : d &= 1, K(Xe, d), ot(e, t, l, a), l = Se ? Wi : 0, !p && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Kd(e, a, t);
        else if (e.tag === 19)
          Kd(e, a, t);
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
    switch (u) {
      case "forwards":
        for (a = t.child, u = null; a !== null; )
          e = a.alternate, e !== null && vs(e) === null && (u = a), a = a.sibling;
        a = u, a === null ? (u = t.child, t.child = null) : (u = a.sibling, a.sibling = null), Vr(
          t,
          !1,
          u,
          a,
          o,
          l
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (a = null, u = t.child, t.child = null; u !== null; ) {
          if (e = u.alternate, e !== null && vs(e) === null) {
            t.child = u;
            break;
          }
          e = u.sibling, u.sibling = a, a = u, u = e;
        }
        Vr(
          t,
          !0,
          a,
          null,
          o,
          l
        );
        break;
      case "together":
        Vr(
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
  function _n(e, t, a) {
    if (e !== null && (t.dependencies = e.dependencies), Fn |= t.lanes, (a & t.childLanes) === 0)
      if (e !== null) {
        if (ii(
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
      for (e = t.child, a = mn(e, e.pendingProps), t.child = a, a.return = t; e.sibling !== null; )
        e = e.sibling, a = a.sibling = mn(e, e.pendingProps), a.return = t;
      a.sibling = null;
    }
    return t.child;
  }
  function Jr(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && rs(e)));
  }
  function qy(e, t, a) {
    switch (t.tag) {
      case 3:
        at(t, t.stateNode.containerInfo), $n(t, Je, e.memoizedState.cache), za();
        break;
      case 27:
      case 5:
        Zt(t);
        break;
      case 4:
        at(t, t.stateNode.containerInfo);
        break;
      case 10:
        $n(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, _r(t), null;
        break;
      case 13:
        var l = t.memoizedState;
        if (l !== null)
          return l.dehydrated !== null ? (Kn(t), t.flags |= 128, null) : (a & t.child.childLanes) !== 0 ? Yd(e, t, a) : (Kn(t), e = _n(
            e,
            t,
            a
          ), e !== null ? e.sibling : null);
        Kn(t);
        break;
      case 19:
        var u = (e.flags & 128) !== 0;
        if (l = (a & t.childLanes) !== 0, l || (ii(
          e,
          t,
          a,
          !1
        ), l = (a & t.childLanes) !== 0), u) {
          if (l)
            return Xd(
              e,
              t,
              a
            );
          t.flags |= 128;
        }
        if (u = t.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), K(Xe, Xe.current), l) break;
        return null;
      case 22:
        return t.lanes = 0, kd(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        $n(t, Je, e.memoizedState.cache);
    }
    return _n(e, t, a);
  }
  function Vd(e, t, a) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        Ie = !0;
      else {
        if (!Jr(e, a) && (t.flags & 128) === 0)
          return Ie = !1, qy(
            e,
            t,
            a
          );
        Ie = (e.flags & 131072) !== 0;
      }
    else
      Ie = !1, Se && (t.flags & 1048576) !== 0 && Ef(t, Wi, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var l = t.pendingProps;
          if (e = Ea(t.elementType), t.type = e, typeof e == "function")
            er(e) ? (l = Ca(e, l), t.tag = 1, t = Ld(
              null,
              t,
              e,
              l,
              a
            )) : (t.tag = 0, t = $r(
              null,
              t,
              e,
              l,
              a
            ));
          else {
            if (e != null) {
              var u = e.$$typeof;
              if (u === P) {
                t.tag = 11, t = Ud(
                  null,
                  t,
                  e,
                  l,
                  a
                );
                break e;
              } else if (u === H) {
                t.tag = 14, t = Zd(
                  null,
                  t,
                  e,
                  l,
                  a
                );
                break e;
              }
            }
            throw t = ze(e) || e, Error(r(306, t, ""));
          }
        }
        return t;
      case 0:
        return $r(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 1:
        return l = t.type, u = Ca(
          l,
          t.pendingProps
        ), Ld(
          e,
          t,
          l,
          u,
          a
        );
      case 3:
        e: {
          if (at(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(r(387));
          l = t.pendingProps;
          var o = t.memoizedState;
          u = o.element, pr(e, t), sl(t, l, null, a);
          var d = t.memoizedState;
          if (l = d.cache, $n(t, Je, l), l !== o.cache && or(
            t,
            [Je],
            a,
            !0
          ), ll(), l = d.element, o.isDehydrated)
            if (o = {
              element: l,
              isDehydrated: !1,
              cache: d.cache
            }, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
              t = Gd(
                e,
                t,
                l,
                a
              );
              break e;
            } else if (l !== u) {
              u = $t(
                Error(r(424)),
                t
              ), Pi(u), t = Gd(
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
              for (Qe = Xt(e.firstChild), ut = t, Se = !0, Bn = null, Yt = !0, a = kf(
                t,
                null,
                l,
                a
              ), t.child = a; a; )
                a.flags = a.flags & -3 | 4096, a = a.sibling;
            }
          else {
            if (za(), l === u) {
              t = _n(
                e,
                t,
                a
              );
              break e;
            }
            ot(e, t, l, a);
          }
          t = t.child;
        }
        return t;
      case 26:
        return Ts(e, t), e === null ? (a = lm(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = a : Se || (a = t.type, e = t.pendingProps, l = Gs(
          de.current
        ).createElement(a), l[st] = t, l[yt] = e, ct(l, a, e), it(l), t.stateNode = l) : t.memoizedState = lm(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return Zt(t), e === null && Se && (l = t.stateNode = nm(
          t.type,
          t.pendingProps,
          de.current
        ), ut = t, Yt = !0, u = Qe, ta(t.type) ? (Oo = u, Qe = Xt(l.firstChild)) : Qe = u), ot(
          e,
          t,
          t.pendingProps.children,
          a
        ), Ts(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && Se && ((u = l = Qe) && (l = fg(
          l,
          t.type,
          t.pendingProps,
          Yt
        ), l !== null ? (t.stateNode = l, ut = t, Qe = Xt(l.firstChild), Yt = !1, u = !0) : u = !1), u || Hn(t)), Zt(t), u = t.type, o = t.pendingProps, d = e !== null ? e.memoizedProps : null, l = o.children, xo(u, o) ? l = null : d !== null && xo(u, d) && (t.flags |= 32), t.memoizedState !== null && (u = zr(
          e,
          t,
          Ey,
          null,
          null,
          a
        ), El._currentValue = u), Ts(e, t), ot(e, t, l, a), t.child;
      case 6:
        return e === null && Se && ((e = a = Qe) && (a = dg(
          a,
          t.pendingProps,
          Yt
        ), a !== null ? (t.stateNode = a, ut = t, Qe = null, e = !0) : e = !1), e || Hn(t)), null;
      case 13:
        return Yd(e, t, a);
      case 4:
        return at(
          t,
          t.stateNode.containerInfo
        ), l = t.pendingProps, e === null ? t.child = Aa(
          t,
          null,
          l,
          a
        ) : ot(e, t, l, a), t.child;
      case 11:
        return Ud(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 7:
        return ot(
          e,
          t,
          t.pendingProps,
          a
        ), t.child;
      case 8:
        return ot(
          e,
          t,
          t.pendingProps.children,
          a
        ), t.child;
      case 12:
        return ot(
          e,
          t,
          t.pendingProps.children,
          a
        ), t.child;
      case 10:
        return l = t.pendingProps, $n(t, t.type, l.value), ot(e, t, l.children, a), t.child;
      case 9:
        return u = t.type._context, l = t.pendingProps.children, xa(t), u = rt(u), l = l(u), t.flags |= 1, ot(e, t, l, a), t.child;
      case 14:
        return Zd(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 15:
        return Qd(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 19:
        return Xd(e, t, a);
      case 31:
        return Ry(e, t, a);
      case 22:
        return kd(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        return xa(t), l = rt(Je), e === null ? (u = dr(), u === null && (u = Ue, o = cr(), u.pooledCache = o, o.refCount++, o !== null && (u.pooledCacheLanes |= a), u = o), t.memoizedState = { parent: l, cache: u }, mr(t), $n(t, Je, u)) : ((e.lanes & a) !== 0 && (pr(e, t), sl(t, null, null, a), ll()), u = e.memoizedState, o = t.memoizedState, u.parent !== l ? (u = { parent: l, cache: l }, t.memoizedState = u, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = u), $n(t, Je, l)) : (l = o.cache, $n(t, Je, l), l !== u.cache && or(
          t,
          [Je],
          a,
          !0
        ))), ot(
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
  function Sn(e) {
    e.flags |= 4;
  }
  function Fr(e, t, a, l, u) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (u & 335544128) === u)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (Sh()) e.flags |= 8192;
        else
          throw Ta = ds, hr;
    } else e.flags &= -16777217;
  }
  function Jd(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !cm(t))
      if (Sh()) e.flags |= 8192;
      else
        throw Ta = ds, hr;
  }
  function Os(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? Tc() : 536870912, e.lanes |= t, vi |= t);
  }
  function dl(e, t) {
    if (!Se)
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
  function ke(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, a = 0, l = 0;
    if (t)
      for (var u = e.child; u !== null; )
        a |= u.lanes | u.childLanes, l |= u.subtreeFlags & 65011712, l |= u.flags & 65011712, u.return = e, u = u.sibling;
    else
      for (u = e.child; u !== null; )
        a |= u.lanes | u.childLanes, l |= u.subtreeFlags, l |= u.flags, u.return = e, u = u.sibling;
    return e.subtreeFlags |= l, e.childLanes = a, t;
  }
  function Uy(e, t, a) {
    var l = t.pendingProps;
    switch (ir(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return ke(t), null;
      case 1:
        return ke(t), null;
      case 3:
        return a = t.stateNode, l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), yn(Je), Ze(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (e === null || e.child === null) && (ai(t) ? Sn(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, sr())), ke(t), null;
      case 26:
        var u = t.type, o = t.memoizedState;
        return e === null ? (Sn(t), o !== null ? (ke(t), Jd(t, o)) : (ke(t), Fr(
          t,
          u,
          null,
          l,
          a
        ))) : o ? o !== e.memoizedState ? (Sn(t), ke(t), Jd(t, o)) : (ke(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== l && Sn(t), ke(t), Fr(
          t,
          u,
          e,
          l,
          a
        )), null;
      case 27:
        if (ha(t), a = de.current, u = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && Sn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return ke(t), null;
          }
          e = F.current, ai(t) ? Af(t) : (e = nm(u, l, a), t.stateNode = e, Sn(t));
        }
        return ke(t), null;
      case 5:
        if (ha(t), u = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && Sn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return ke(t), null;
          }
          if (o = F.current, ai(t))
            Af(t);
          else {
            var d = Gs(
              de.current
            );
            switch (o) {
              case 1:
                o = d.createElementNS(
                  "http://www.w3.org/2000/svg",
                  u
                );
                break;
              case 2:
                o = d.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  u
                );
                break;
              default:
                switch (u) {
                  case "svg":
                    o = d.createElementNS(
                      "http://www.w3.org/2000/svg",
                      u
                    );
                    break;
                  case "math":
                    o = d.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      u
                    );
                    break;
                  case "script":
                    o = d.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(
                      o.firstChild
                    );
                    break;
                  case "select":
                    o = typeof l.is == "string" ? d.createElement("select", {
                      is: l.is
                    }) : d.createElement("select"), l.multiple ? o.multiple = !0 : l.size && (o.size = l.size);
                    break;
                  default:
                    o = typeof l.is == "string" ? d.createElement(u, { is: l.is }) : d.createElement(u);
                }
            }
            o[st] = t, o[yt] = l;
            e: for (d = t.child; d !== null; ) {
              if (d.tag === 5 || d.tag === 6)
                o.appendChild(d.stateNode);
              else if (d.tag !== 4 && d.tag !== 27 && d.child !== null) {
                d.child.return = d, d = d.child;
                continue;
              }
              if (d === t) break e;
              for (; d.sibling === null; ) {
                if (d.return === null || d.return === t)
                  break e;
                d = d.return;
              }
              d.sibling.return = d.return, d = d.sibling;
            }
            t.stateNode = o;
            e: switch (ct(o, u, l), u) {
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
            l && Sn(t);
          }
        }
        return ke(t), Fr(
          t,
          t.type,
          e === null ? null : e.memoizedProps,
          t.pendingProps,
          a
        ), null;
      case 6:
        if (e && t.stateNode != null)
          e.memoizedProps !== l && Sn(t);
        else {
          if (typeof l != "string" && t.stateNode === null)
            throw Error(r(166));
          if (e = de.current, ai(t)) {
            if (e = t.stateNode, a = t.memoizedProps, l = null, u = ut, u !== null)
              switch (u.tag) {
                case 27:
                case 5:
                  l = u.memoizedProps;
              }
            e[st] = t, e = !!(e.nodeValue === a || l !== null && l.suppressHydrationWarning === !0 || Yh(e.nodeValue, a)), e || Hn(t, !0);
          } else
            e = Gs(e).createTextNode(
              l
            ), e[st] = t, t.stateNode = e;
        }
        return ke(t), null;
      case 31:
        if (a = t.memoizedState, e === null || e.memoizedState !== null) {
          if (l = ai(t), a !== null) {
            if (e === null) {
              if (!l) throw Error(r(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(557));
              e[st] = t;
            } else
              za(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            ke(t), e = !1;
          } else
            a = sr(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), e = !0;
          if (!e)
            return t.flags & 256 ? (Nt(t), t) : (Nt(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(r(558));
        }
        return ke(t), null;
      case 13:
        if (l = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (u = ai(t), l !== null && l.dehydrated !== null) {
            if (e === null) {
              if (!u) throw Error(r(318));
              if (u = t.memoizedState, u = u !== null ? u.dehydrated : null, !u) throw Error(r(317));
              u[st] = t;
            } else
              za(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            ke(t), u = !1;
          } else
            u = sr(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = u), u = !0;
          if (!u)
            return t.flags & 256 ? (Nt(t), t) : (Nt(t), null);
        }
        return Nt(t), (t.flags & 128) !== 0 ? (t.lanes = a, t) : (a = l !== null, e = e !== null && e.memoizedState !== null, a && (l = t.child, u = null, l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (u = l.alternate.memoizedState.cachePool.pool), o = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (o = l.memoizedState.cachePool.pool), o !== u && (l.flags |= 2048)), a !== e && a && (t.child.flags |= 8192), Os(t, t.updateQueue), ke(t), null);
      case 4:
        return Ze(), e === null && bo(t.stateNode.containerInfo), ke(t), null;
      case 10:
        return yn(t.type), ke(t), null;
      case 19:
        if (U(Xe), l = t.memoizedState, l === null) return ke(t), null;
        if (u = (t.flags & 128) !== 0, o = l.rendering, o === null)
          if (u) dl(l, !1);
          else {
            if (Ke !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (o = vs(e), o !== null) {
                  for (t.flags |= 128, dl(l, !1), e = o.updateQueue, t.updateQueue = e, Os(t, e), t.subtreeFlags = 0, e = a, a = t.child; a !== null; )
                    wf(a, e), a = a.sibling;
                  return K(
                    Xe,
                    Xe.current & 1 | 2
                  ), Se && pn(t, l.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            l.tail !== null && ht() > Rs && (t.flags |= 128, u = !0, dl(l, !1), t.lanes = 4194304);
          }
        else {
          if (!u)
            if (e = vs(o), e !== null) {
              if (t.flags |= 128, u = !0, e = e.updateQueue, t.updateQueue = e, Os(t, e), dl(l, !0), l.tail === null && l.tailMode === "hidden" && !o.alternate && !Se)
                return ke(t), null;
            } else
              2 * ht() - l.renderingStartTime > Rs && a !== 536870912 && (t.flags |= 128, u = !0, dl(l, !1), t.lanes = 4194304);
          l.isBackwards ? (o.sibling = t.child, t.child = o) : (e = l.last, e !== null ? e.sibling = o : t.child = o, l.last = o);
        }
        return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = ht(), e.sibling = null, a = Xe.current, K(
          Xe,
          u ? a & 1 | 2 : a & 1
        ), Se && pn(t, l.treeForkCount), e) : (ke(t), null);
      case 22:
      case 23:
        return Nt(t), br(), l = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192), l ? (a & 536870912) !== 0 && (t.flags & 128) === 0 && (ke(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : ke(t), a = t.updateQueue, a !== null && Os(t, a.retryQueue), a = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== a && (t.flags |= 2048), e !== null && U(ja), null;
      case 24:
        return a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), yn(Je), ke(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(r(156, t.tag));
  }
  function Zy(e, t) {
    switch (ir(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return yn(Je), Ze(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return ha(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Nt(t), t.alternate === null)
            throw Error(r(340));
          za();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Nt(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(r(340));
          za();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return U(Xe), null;
      case 4:
        return Ze(), null;
      case 10:
        return yn(t.type), null;
      case 22:
      case 23:
        return Nt(t), br(), e !== null && U(ja), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return yn(Je), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Fd(e, t) {
    switch (ir(t), t.tag) {
      case 3:
        yn(Je), Ze();
        break;
      case 26:
      case 27:
      case 5:
        ha(t);
        break;
      case 4:
        Ze();
        break;
      case 31:
        t.memoizedState !== null && Nt(t);
        break;
      case 13:
        Nt(t);
        break;
      case 19:
        U(Xe);
        break;
      case 10:
        yn(t.type);
        break;
      case 22:
      case 23:
        Nt(t), br(), e !== null && U(ja);
        break;
      case 24:
        yn(Je);
    }
  }
  function hl(e, t) {
    try {
      var a = t.updateQueue, l = a !== null ? a.lastEffect : null;
      if (l !== null) {
        var u = l.next;
        a = u;
        do {
          if ((a.tag & e) === e) {
            l = void 0;
            var o = a.create, d = a.inst;
            l = o(), d.destroy = l;
          }
          a = a.next;
        } while (a !== u);
      }
    } catch (p) {
      Ne(t, t.return, p);
    }
  }
  function Vn(e, t, a) {
    try {
      var l = t.updateQueue, u = l !== null ? l.lastEffect : null;
      if (u !== null) {
        var o = u.next;
        l = o;
        do {
          if ((l.tag & e) === e) {
            var d = l.inst, p = d.destroy;
            if (p !== void 0) {
              d.destroy = void 0, u = t;
              var b = a, T = p;
              try {
                T();
              } catch (D) {
                Ne(
                  u,
                  b,
                  D
                );
              }
            }
          }
          l = l.next;
        } while (l !== o);
      }
    } catch (D) {
      Ne(t, t.return, D);
    }
  }
  function Id(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var a = e.stateNode;
      try {
        Hf(t, a);
      } catch (l) {
        Ne(e, e.return, l);
      }
    }
  }
  function Wd(e, t, a) {
    a.props = Ca(
      e.type,
      e.memoizedProps
    ), a.state = e.memoizedState;
    try {
      a.componentWillUnmount();
    } catch (l) {
      Ne(e, t, l);
    }
  }
  function ml(e, t) {
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
    } catch (u) {
      Ne(e, t, u);
    }
  }
  function rn(e, t) {
    var a = e.ref, l = e.refCleanup;
    if (a !== null)
      if (typeof l == "function")
        try {
          l();
        } catch (u) {
          Ne(e, t, u);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof a == "function")
        try {
          a(null);
        } catch (u) {
          Ne(e, t, u);
        }
      else a.current = null;
  }
  function Pd(e) {
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
    } catch (u) {
      Ne(e, e.return, u);
    }
  }
  function Ir(e, t, a) {
    try {
      var l = e.stateNode;
      lg(l, e.type, a, t), l[yt] = t;
    } catch (u) {
      Ne(e, e.return, u);
    }
  }
  function eh(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && ta(e.type) || e.tag === 4;
  }
  function Wr(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || eh(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && ta(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Pr(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(e, t) : (t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, t.appendChild(e), a = a._reactRootContainer, a != null || t.onclick !== null || (t.onclick = dn));
    else if (l !== 4 && (l === 27 && ta(e.type) && (a = e.stateNode, t = null), e = e.child, e !== null))
      for (Pr(e, t, a), e = e.sibling; e !== null; )
        Pr(e, t, a), e = e.sibling;
  }
  function Cs(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? a.insertBefore(e, t) : a.appendChild(e);
    else if (l !== 4 && (l === 27 && ta(e.type) && (a = e.stateNode), e = e.child, e !== null))
      for (Cs(e, t, a), e = e.sibling; e !== null; )
        Cs(e, t, a), e = e.sibling;
  }
  function th(e) {
    var t = e.stateNode, a = e.memoizedProps;
    try {
      for (var l = e.type, u = t.attributes; u.length; )
        t.removeAttributeNode(u[0]);
      ct(t, l, a), t[st] = e, t[yt] = a;
    } catch (o) {
      Ne(e, e.return, o);
    }
  }
  var zn = !1, We = !1, eo = !1, nh = typeof WeakSet == "function" ? WeakSet : Set, lt = null;
  function Qy(e, t) {
    if (e = e.containerInfo, zo = Is, e = mf(e), Xu(e)) {
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
            var u = l.anchorOffset, o = l.focusNode;
            l = l.focusOffset;
            try {
              a.nodeType, o.nodeType;
            } catch {
              a = null;
              break e;
            }
            var d = 0, p = -1, b = -1, T = 0, D = 0, Q = e, A = null;
            t: for (; ; ) {
              for (var C; Q !== a || u !== 0 && Q.nodeType !== 3 || (p = d + u), Q !== o || l !== 0 && Q.nodeType !== 3 || (b = d + l), Q.nodeType === 3 && (d += Q.nodeValue.length), (C = Q.firstChild) !== null; )
                A = Q, Q = C;
              for (; ; ) {
                if (Q === e) break t;
                if (A === a && ++T === u && (p = d), A === o && ++D === l && (b = d), (C = Q.nextSibling) !== null) break;
                Q = A, A = Q.parentNode;
              }
              Q = C;
            }
            a = p === -1 || b === -1 ? null : { start: p, end: b };
          } else a = null;
        }
      a = a || { start: 0, end: 0 };
    } else a = null;
    for (wo = { focusedElem: e, selectionRange: a }, Is = !1, lt = t; lt !== null; )
      if (t = lt, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = t, lt = e;
      else
        for (; lt !== null; ) {
          switch (t = lt, o = t.alternate, e = t.flags, t.tag) {
            case 0:
              if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                for (a = 0; a < e.length; a++)
                  u = e[a], u.ref.impl = u.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && o !== null) {
                e = void 0, a = t, u = o.memoizedProps, o = o.memoizedState, l = a.stateNode;
                try {
                  var W = Ca(
                    a.type,
                    u
                  );
                  e = l.getSnapshotBeforeUpdate(
                    W,
                    o
                  ), l.__reactInternalSnapshotBeforeUpdate = e;
                } catch (re) {
                  Ne(
                    a,
                    a.return,
                    re
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = t.stateNode.containerInfo, a = e.nodeType, a === 9)
                  Eo(e);
                else if (a === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      Eo(e);
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
            e.return = t.return, lt = e;
            break;
          }
          lt = t.return;
        }
  }
  function ah(e, t, a) {
    var l = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        xn(e, a), l & 4 && hl(5, a);
        break;
      case 1:
        if (xn(e, a), l & 4)
          if (e = a.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (d) {
              Ne(a, a.return, d);
            }
          else {
            var u = Ca(
              a.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              e.componentDidUpdate(
                u,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              );
            } catch (d) {
              Ne(
                a,
                a.return,
                d
              );
            }
          }
        l & 64 && Id(a), l & 512 && ml(a, a.return);
        break;
      case 3:
        if (xn(e, a), l & 64 && (e = a.updateQueue, e !== null)) {
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
            Hf(e, t);
          } catch (d) {
            Ne(a, a.return, d);
          }
        }
        break;
      case 27:
        t === null && l & 4 && th(a);
      case 26:
      case 5:
        xn(e, a), t === null && l & 4 && Pd(a), l & 512 && ml(a, a.return);
        break;
      case 12:
        xn(e, a);
        break;
      case 31:
        xn(e, a), l & 4 && sh(e, a);
        break;
      case 13:
        xn(e, a), l & 4 && uh(e, a), l & 64 && (e = a.memoizedState, e !== null && (e = e.dehydrated, e !== null && (a = Xy.bind(
          null,
          a
        ), hg(e, a))));
        break;
      case 22:
        if (l = a.memoizedState !== null || zn, !l) {
          t = t !== null && t.memoizedState !== null || We, u = zn;
          var o = We;
          zn = l, (We = t) && !o ? jn(
            e,
            a,
            (a.subtreeFlags & 8772) !== 0
          ) : xn(e, a), zn = u, We = o;
        }
        break;
      case 30:
        break;
      default:
        xn(e, a);
    }
  }
  function ih(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, ih(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Cu(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var Be = null, bt = !1;
  function wn(e, t, a) {
    for (a = a.child; a !== null; )
      lh(e, t, a), a = a.sibling;
  }
  function lh(e, t, a) {
    if (Et && typeof Et.onCommitFiberUnmount == "function")
      try {
        Et.onCommitFiberUnmount(Qt, a);
      } catch {
      }
    switch (a.tag) {
      case 26:
        We || rn(a, t), wn(
          e,
          t,
          a
        ), a.memoizedState ? a.memoizedState.count-- : a.stateNode && (a = a.stateNode, a.parentNode.removeChild(a));
        break;
      case 27:
        We || rn(a, t);
        var l = Be, u = bt;
        ta(a.type) && (Be = a.stateNode, bt = !1), wn(
          e,
          t,
          a
        ), wl(a.stateNode), Be = l, bt = u;
        break;
      case 5:
        We || rn(a, t);
      case 6:
        if (l = Be, u = bt, Be = null, wn(
          e,
          t,
          a
        ), Be = l, bt = u, Be !== null)
          if (bt)
            try {
              (Be.nodeType === 9 ? Be.body : Be.nodeName === "HTML" ? Be.ownerDocument.body : Be).removeChild(a.stateNode);
            } catch (o) {
              Ne(
                a,
                t,
                o
              );
            }
          else
            try {
              Be.removeChild(a.stateNode);
            } catch (o) {
              Ne(
                a,
                t,
                o
              );
            }
        break;
      case 18:
        Be !== null && (bt ? (e = Be, Ih(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          a.stateNode
        ), xi(e)) : Ih(Be, a.stateNode));
        break;
      case 4:
        l = Be, u = bt, Be = a.stateNode.containerInfo, bt = !0, wn(
          e,
          t,
          a
        ), Be = l, bt = u;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Vn(2, a, t), We || Vn(4, a, t), wn(
          e,
          t,
          a
        );
        break;
      case 1:
        We || (rn(a, t), l = a.stateNode, typeof l.componentWillUnmount == "function" && Wd(
          a,
          t,
          l
        )), wn(
          e,
          t,
          a
        );
        break;
      case 21:
        wn(
          e,
          t,
          a
        );
        break;
      case 22:
        We = (l = We) || a.memoizedState !== null, wn(
          e,
          t,
          a
        ), We = l;
        break;
      default:
        wn(
          e,
          t,
          a
        );
    }
  }
  function sh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        xi(e);
      } catch (a) {
        Ne(t, t.return, a);
      }
    }
  }
  function uh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        xi(e);
      } catch (a) {
        Ne(t, t.return, a);
      }
  }
  function ky(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new nh()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new nh()), t;
      default:
        throw Error(r(435, e.tag));
    }
  }
  function Ns(e, t) {
    var a = ky(e);
    t.forEach(function(l) {
      if (!a.has(l)) {
        a.add(l);
        var u = Vy.bind(null, e, l);
        l.then(u, u);
      }
    });
  }
  function _t(e, t) {
    var a = t.deletions;
    if (a !== null)
      for (var l = 0; l < a.length; l++) {
        var u = a[l], o = e, d = t, p = d;
        e: for (; p !== null; ) {
          switch (p.tag) {
            case 27:
              if (ta(p.type)) {
                Be = p.stateNode, bt = !1;
                break e;
              }
              break;
            case 5:
              Be = p.stateNode, bt = !1;
              break e;
            case 3:
            case 4:
              Be = p.stateNode.containerInfo, bt = !0;
              break e;
          }
          p = p.return;
        }
        if (Be === null) throw Error(r(160));
        lh(o, d, u), Be = null, bt = !1, o = u.alternate, o !== null && (o.return = null), u.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        rh(t, e), t = t.sibling;
  }
  var tn = null;
  function rh(e, t) {
    var a = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        _t(t, e), St(e), l & 4 && (Vn(3, e, e.return), hl(3, e), Vn(5, e, e.return));
        break;
      case 1:
        _t(t, e), St(e), l & 512 && (We || a === null || rn(a, a.return)), l & 64 && zn && (e = e.updateQueue, e !== null && (l = e.callbacks, l !== null && (a = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = a === null ? l : a.concat(l))));
        break;
      case 26:
        var u = tn;
        if (_t(t, e), St(e), l & 512 && (We || a === null || rn(a, a.return)), l & 4) {
          var o = a !== null ? a.memoizedState : null;
          if (l = e.memoizedState, a === null)
            if (l === null)
              if (e.stateNode === null) {
                e: {
                  l = e.type, a = e.memoizedProps, u = u.ownerDocument || u;
                  t: switch (l) {
                    case "title":
                      o = u.getElementsByTagName("title")[0], (!o || o[Hi] || o[st] || o.namespaceURI === "http://www.w3.org/2000/svg" || o.hasAttribute("itemprop")) && (o = u.createElement(l), u.head.insertBefore(
                        o,
                        u.querySelector("head > title")
                      )), ct(o, l, a), o[st] = e, it(o), l = o;
                      break e;
                    case "link":
                      var d = rm(
                        "link",
                        "href",
                        u
                      ).get(l + (a.href || ""));
                      if (d) {
                        for (var p = 0; p < d.length; p++)
                          if (o = d[p], o.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && o.getAttribute("rel") === (a.rel == null ? null : a.rel) && o.getAttribute("title") === (a.title == null ? null : a.title) && o.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                            d.splice(p, 1);
                            break t;
                          }
                      }
                      o = u.createElement(l), ct(o, l, a), u.head.appendChild(o);
                      break;
                    case "meta":
                      if (d = rm(
                        "meta",
                        "content",
                        u
                      ).get(l + (a.content || ""))) {
                        for (p = 0; p < d.length; p++)
                          if (o = d[p], o.getAttribute("content") === (a.content == null ? null : "" + a.content) && o.getAttribute("name") === (a.name == null ? null : a.name) && o.getAttribute("property") === (a.property == null ? null : a.property) && o.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && o.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                            d.splice(p, 1);
                            break t;
                          }
                      }
                      o = u.createElement(l), ct(o, l, a), u.head.appendChild(o);
                      break;
                    default:
                      throw Error(r(468, l));
                  }
                  o[st] = e, it(o), l = o;
                }
                e.stateNode = l;
              } else
                om(
                  u,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = um(
                u,
                l,
                e.memoizedProps
              );
          else
            o !== l ? (o === null ? a.stateNode !== null && (a = a.stateNode, a.parentNode.removeChild(a)) : o.count--, l === null ? om(
              u,
              e.type,
              e.stateNode
            ) : um(
              u,
              l,
              e.memoizedProps
            )) : l === null && e.stateNode !== null && Ir(
              e,
              e.memoizedProps,
              a.memoizedProps
            );
        }
        break;
      case 27:
        _t(t, e), St(e), l & 512 && (We || a === null || rn(a, a.return)), a !== null && l & 4 && Ir(
          e,
          e.memoizedProps,
          a.memoizedProps
        );
        break;
      case 5:
        if (_t(t, e), St(e), l & 512 && (We || a === null || rn(a, a.return)), e.flags & 32) {
          u = e.stateNode;
          try {
            Xa(u, "");
          } catch (W) {
            Ne(e, e.return, W);
          }
        }
        l & 4 && e.stateNode != null && (u = e.memoizedProps, Ir(
          e,
          u,
          a !== null ? a.memoizedProps : u
        )), l & 1024 && (eo = !0);
        break;
      case 6:
        if (_t(t, e), St(e), l & 4) {
          if (e.stateNode === null)
            throw Error(r(162));
          l = e.memoizedProps, a = e.stateNode;
          try {
            a.nodeValue = l;
          } catch (W) {
            Ne(e, e.return, W);
          }
        }
        break;
      case 3:
        if (Xs = null, u = tn, tn = Ys(t.containerInfo), _t(t, e), tn = u, St(e), l & 4 && a !== null && a.memoizedState.isDehydrated)
          try {
            xi(t.containerInfo);
          } catch (W) {
            Ne(e, e.return, W);
          }
        eo && (eo = !1, oh(e));
        break;
      case 4:
        l = tn, tn = Ys(
          e.stateNode.containerInfo
        ), _t(t, e), St(e), tn = l;
        break;
      case 12:
        _t(t, e), St(e);
        break;
      case 31:
        _t(t, e), St(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, Ns(e, l)));
        break;
      case 13:
        _t(t, e), St(e), e.child.flags & 8192 && e.memoizedState !== null != (a !== null && a.memoizedState !== null) && (Ds = ht()), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, Ns(e, l)));
        break;
      case 22:
        u = e.memoizedState !== null;
        var b = a !== null && a.memoizedState !== null, T = zn, D = We;
        if (zn = T || u, We = D || b, _t(t, e), We = D, zn = T, St(e), l & 8192)
          e: for (t = e.stateNode, t._visibility = u ? t._visibility & -2 : t._visibility | 1, u && (a === null || b || zn || We || Na(e)), a = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (a === null) {
                b = a = t;
                try {
                  if (o = b.stateNode, u)
                    d = o.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none";
                  else {
                    p = b.stateNode;
                    var Q = b.memoizedProps.style, A = Q != null && Q.hasOwnProperty("display") ? Q.display : null;
                    p.style.display = A == null || typeof A == "boolean" ? "" : ("" + A).trim();
                  }
                } catch (W) {
                  Ne(b, b.return, W);
                }
              }
            } else if (t.tag === 6) {
              if (a === null) {
                b = t;
                try {
                  b.stateNode.nodeValue = u ? "" : b.memoizedProps;
                } catch (W) {
                  Ne(b, b.return, W);
                }
              }
            } else if (t.tag === 18) {
              if (a === null) {
                b = t;
                try {
                  var C = b.stateNode;
                  u ? Wh(C, !0) : Wh(b.stateNode, !1);
                } catch (W) {
                  Ne(b, b.return, W);
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
        l & 4 && (l = e.updateQueue, l !== null && (a = l.retryQueue, a !== null && (l.retryQueue = null, Ns(e, a))));
        break;
      case 19:
        _t(t, e), St(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, Ns(e, l)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        _t(t, e), St(e);
    }
  }
  function St(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var a, l = e.return; l !== null; ) {
          if (eh(l)) {
            a = l;
            break;
          }
          l = l.return;
        }
        if (a == null) throw Error(r(160));
        switch (a.tag) {
          case 27:
            var u = a.stateNode, o = Wr(e);
            Cs(e, o, u);
            break;
          case 5:
            var d = a.stateNode;
            a.flags & 32 && (Xa(d, ""), a.flags &= -33);
            var p = Wr(e);
            Cs(e, p, d);
            break;
          case 3:
          case 4:
            var b = a.stateNode.containerInfo, T = Wr(e);
            Pr(
              e,
              T,
              b
            );
            break;
          default:
            throw Error(r(161));
        }
      } catch (D) {
        Ne(e, e.return, D);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function oh(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        oh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function xn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        ah(e, t.alternate, t), t = t.sibling;
  }
  function Na(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Vn(4, t, t.return), Na(t);
          break;
        case 1:
          rn(t, t.return);
          var a = t.stateNode;
          typeof a.componentWillUnmount == "function" && Wd(
            t,
            t.return,
            a
          ), Na(t);
          break;
        case 27:
          wl(t.stateNode);
        case 26:
        case 5:
          rn(t, t.return), Na(t);
          break;
        case 22:
          t.memoizedState === null && Na(t);
          break;
        case 30:
          Na(t);
          break;
        default:
          Na(t);
      }
      e = e.sibling;
    }
  }
  function jn(e, t, a) {
    for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var l = t.alternate, u = e, o = t, d = o.flags;
      switch (o.tag) {
        case 0:
        case 11:
        case 15:
          jn(
            u,
            o,
            a
          ), hl(4, o);
          break;
        case 1:
          if (jn(
            u,
            o,
            a
          ), l = o, u = l.stateNode, typeof u.componentDidMount == "function")
            try {
              u.componentDidMount();
            } catch (T) {
              Ne(l, l.return, T);
            }
          if (l = o, u = l.updateQueue, u !== null) {
            var p = l.stateNode;
            try {
              var b = u.shared.hiddenCallbacks;
              if (b !== null)
                for (u.shared.hiddenCallbacks = null, u = 0; u < b.length; u++)
                  Bf(b[u], p);
            } catch (T) {
              Ne(l, l.return, T);
            }
          }
          a && d & 64 && Id(o), ml(o, o.return);
          break;
        case 27:
          th(o);
        case 26:
        case 5:
          jn(
            u,
            o,
            a
          ), a && l === null && d & 4 && Pd(o), ml(o, o.return);
          break;
        case 12:
          jn(
            u,
            o,
            a
          );
          break;
        case 31:
          jn(
            u,
            o,
            a
          ), a && d & 4 && sh(u, o);
          break;
        case 13:
          jn(
            u,
            o,
            a
          ), a && d & 4 && uh(u, o);
          break;
        case 22:
          o.memoizedState === null && jn(
            u,
            o,
            a
          ), ml(o, o.return);
          break;
        case 30:
          break;
        default:
          jn(
            u,
            o,
            a
          );
      }
      t = t.sibling;
    }
  }
  function to(e, t) {
    var a = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== a && (e != null && e.refCount++, a != null && el(a));
  }
  function no(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && el(e));
  }
  function nn(e, t, a, l) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        ch(
          e,
          t,
          a,
          l
        ), t = t.sibling;
  }
  function ch(e, t, a, l) {
    var u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        nn(
          e,
          t,
          a,
          l
        ), u & 2048 && hl(9, t);
        break;
      case 1:
        nn(
          e,
          t,
          a,
          l
        );
        break;
      case 3:
        nn(
          e,
          t,
          a,
          l
        ), u & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && el(e)));
        break;
      case 12:
        if (u & 2048) {
          nn(
            e,
            t,
            a,
            l
          ), e = t.stateNode;
          try {
            var o = t.memoizedProps, d = o.id, p = o.onPostCommit;
            typeof p == "function" && p(
              d,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (b) {
            Ne(t, t.return, b);
          }
        } else
          nn(
            e,
            t,
            a,
            l
          );
        break;
      case 31:
        nn(
          e,
          t,
          a,
          l
        );
        break;
      case 13:
        nn(
          e,
          t,
          a,
          l
        );
        break;
      case 23:
        break;
      case 22:
        o = t.stateNode, d = t.alternate, t.memoizedState !== null ? o._visibility & 2 ? nn(
          e,
          t,
          a,
          l
        ) : pl(e, t) : o._visibility & 2 ? nn(
          e,
          t,
          a,
          l
        ) : (o._visibility |= 2, hi(
          e,
          t,
          a,
          l,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), u & 2048 && to(d, t);
        break;
      case 24:
        nn(
          e,
          t,
          a,
          l
        ), u & 2048 && no(t.alternate, t);
        break;
      default:
        nn(
          e,
          t,
          a,
          l
        );
    }
  }
  function hi(e, t, a, l, u) {
    for (u = u && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var o = e, d = t, p = a, b = l, T = d.flags;
      switch (d.tag) {
        case 0:
        case 11:
        case 15:
          hi(
            o,
            d,
            p,
            b,
            u
          ), hl(8, d);
          break;
        case 23:
          break;
        case 22:
          var D = d.stateNode;
          d.memoizedState !== null ? D._visibility & 2 ? hi(
            o,
            d,
            p,
            b,
            u
          ) : pl(
            o,
            d
          ) : (D._visibility |= 2, hi(
            o,
            d,
            p,
            b,
            u
          )), u && T & 2048 && to(
            d.alternate,
            d
          );
          break;
        case 24:
          hi(
            o,
            d,
            p,
            b,
            u
          ), u && T & 2048 && no(d.alternate, d);
          break;
        default:
          hi(
            o,
            d,
            p,
            b,
            u
          );
      }
      t = t.sibling;
    }
  }
  function pl(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var a = e, l = t, u = l.flags;
        switch (l.tag) {
          case 22:
            pl(a, l), u & 2048 && to(
              l.alternate,
              l
            );
            break;
          case 24:
            pl(a, l), u & 2048 && no(l.alternate, l);
            break;
          default:
            pl(a, l);
        }
        t = t.sibling;
      }
  }
  var vl = 8192;
  function mi(e, t, a) {
    if (e.subtreeFlags & vl)
      for (e = e.child; e !== null; )
        fh(
          e,
          t,
          a
        ), e = e.sibling;
  }
  function fh(e, t, a) {
    switch (e.tag) {
      case 26:
        mi(
          e,
          t,
          a
        ), e.flags & vl && e.memoizedState !== null && jg(
          a,
          tn,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        mi(
          e,
          t,
          a
        );
        break;
      case 3:
      case 4:
        var l = tn;
        tn = Ys(e.stateNode.containerInfo), mi(
          e,
          t,
          a
        ), tn = l;
        break;
      case 22:
        e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = vl, vl = 16777216, mi(
          e,
          t,
          a
        ), vl = l) : mi(
          e,
          t,
          a
        ));
        break;
      default:
        mi(
          e,
          t,
          a
        );
    }
  }
  function dh(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function yl(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          lt = l, mh(
            l,
            e
          );
        }
      dh(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        hh(e), e = e.sibling;
  }
  function hh(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        yl(e), e.flags & 2048 && Vn(9, e, e.return);
        break;
      case 3:
        yl(e);
        break;
      case 12:
        yl(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ms(e)) : yl(e);
        break;
      default:
        yl(e);
    }
  }
  function Ms(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          lt = l, mh(
            l,
            e
          );
        }
      dh(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          Vn(8, t, t.return), Ms(t);
          break;
        case 22:
          a = t.stateNode, a._visibility & 2 && (a._visibility &= -3, Ms(t));
          break;
        default:
          Ms(t);
      }
      e = e.sibling;
    }
  }
  function mh(e, t) {
    for (; lt !== null; ) {
      var a = lt;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          Vn(8, a, t);
          break;
        case 23:
        case 22:
          if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
            var l = a.memoizedState.cachePool.pool;
            l != null && l.refCount++;
          }
          break;
        case 24:
          el(a.memoizedState.cache);
      }
      if (l = a.child, l !== null) l.return = a, lt = l;
      else
        e: for (a = e; lt !== null; ) {
          l = lt;
          var u = l.sibling, o = l.return;
          if (ih(l), l === a) {
            lt = null;
            break e;
          }
          if (u !== null) {
            u.return = o, lt = u;
            break e;
          }
          lt = o;
        }
    }
  }
  var By = {
    getCacheForType: function(e) {
      var t = rt(Je), a = t.data.get(e);
      return a === void 0 && (a = e(), t.data.set(e, a)), a;
    },
    cacheSignal: function() {
      return rt(Je).controller.signal;
    }
  }, Hy = typeof WeakMap == "function" ? WeakMap : Map, Ae = 0, Ue = null, pe = null, ge = 0, Ce = 0, Mt = null, Jn = !1, pi = !1, ao = !1, En = 0, Ke = 0, Fn = 0, Ma = 0, io = 0, Dt = 0, vi = 0, gl = null, zt = null, lo = !1, Ds = 0, ph = 0, Rs = 1 / 0, qs = null, In = null, tt = 0, Wn = null, yi = null, Tn = 0, so = 0, uo = null, vh = null, bl = 0, ro = null;
  function Rt() {
    return (Ae & 2) !== 0 && ge !== 0 ? ge & -ge : M.T !== null ? po() : Nc();
  }
  function yh() {
    if (Dt === 0)
      if ((ge & 536870912) === 0 || Se) {
        var e = Ll;
        Ll <<= 1, (Ll & 3932160) === 0 && (Ll = 262144), Dt = e;
      } else Dt = 536870912;
    return e = Ct.current, e !== null && (e.flags |= 32), Dt;
  }
  function wt(e, t, a) {
    (e === Ue && (Ce === 2 || Ce === 9) || e.cancelPendingCommit !== null) && (gi(e, 0), Pn(
      e,
      ge,
      Dt,
      !1
    )), Bi(e, a), ((Ae & 2) === 0 || e !== Ue) && (e === Ue && ((Ae & 2) === 0 && (Ma |= a), Ke === 4 && Pn(
      e,
      ge,
      Dt,
      !1
    )), on(e));
  }
  function gh(e, t, a) {
    if ((Ae & 6) !== 0) throw Error(r(327));
    var l = !a && (t & 127) === 0 && (t & e.expiredLanes) === 0 || ki(e, t), u = l ? Gy(e, t) : co(e, t, !0), o = l;
    do {
      if (u === 0) {
        pi && !l && Pn(e, t, 0, !1);
        break;
      } else {
        if (a = e.current.alternate, o && !$y(a)) {
          u = co(e, t, !1), o = !1;
          continue;
        }
        if (u === 2) {
          if (o = t, e.errorRecoveryDisabledLanes & o)
            var d = 0;
          else
            d = e.pendingLanes & -536870913, d = d !== 0 ? d : d & 536870912 ? 536870912 : 0;
          if (d !== 0) {
            t = d;
            e: {
              var p = e;
              u = gl;
              var b = p.current.memoizedState.isDehydrated;
              if (b && (gi(p, d).flags |= 256), d = co(
                p,
                d,
                !1
              ), d !== 2) {
                if (ao && !b) {
                  p.errorRecoveryDisabledLanes |= o, Ma |= o, u = 4;
                  break e;
                }
                o = zt, zt = u, o !== null && (zt === null ? zt = o : zt.push.apply(
                  zt,
                  o
                ));
              }
              u = d;
            }
            if (o = !1, u !== 2) continue;
          }
        }
        if (u === 1) {
          gi(e, 0), Pn(e, t, 0, !0);
          break;
        }
        e: {
          switch (l = e, o = u, o) {
            case 0:
            case 1:
              throw Error(r(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              Pn(
                l,
                t,
                Dt,
                !Jn
              );
              break e;
            case 2:
              zt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(r(329));
          }
          if ((t & 62914560) === t && (u = Ds + 300 - ht(), 10 < u)) {
            if (Pn(
              l,
              t,
              Dt,
              !Jn
            ), Yl(l, 0, !0) !== 0) break e;
            Tn = t, l.timeoutHandle = Jh(
              bh.bind(
                null,
                l,
                a,
                zt,
                qs,
                lo,
                t,
                Dt,
                Ma,
                vi,
                Jn,
                o,
                "Throttled",
                -0,
                0
              ),
              u
            );
            break e;
          }
          bh(
            l,
            a,
            zt,
            qs,
            lo,
            t,
            Dt,
            Ma,
            vi,
            Jn,
            o,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    on(e);
  }
  function bh(e, t, a, l, u, o, d, p, b, T, D, Q, A, C) {
    if (e.timeoutHandle = -1, Q = t.subtreeFlags, Q & 8192 || (Q & 16785408) === 16785408) {
      Q = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: dn
      }, fh(
        t,
        o,
        Q
      );
      var W = (o & 62914560) === o ? Ds - ht() : (o & 4194048) === o ? ph - ht() : 0;
      if (W = Eg(
        Q,
        W
      ), W !== null) {
        Tn = o, e.cancelPendingCommit = W(
          Th.bind(
            null,
            e,
            t,
            o,
            a,
            l,
            u,
            d,
            p,
            b,
            D,
            Q,
            null,
            A,
            C
          )
        ), Pn(e, o, d, !T);
        return;
      }
    }
    Th(
      e,
      t,
      o,
      a,
      l,
      u,
      d,
      p,
      b
    );
  }
  function $y(e) {
    for (var t = e; ; ) {
      var a = t.tag;
      if ((a === 0 || a === 11 || a === 15) && t.flags & 16384 && (a = t.updateQueue, a !== null && (a = a.stores, a !== null)))
        for (var l = 0; l < a.length; l++) {
          var u = a[l], o = u.getSnapshot;
          u = u.value;
          try {
            if (!At(o(), u)) return !1;
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
  function Pn(e, t, a, l) {
    t &= ~io, t &= ~Ma, e.suspendedLanes |= t, e.pingedLanes &= ~t, l && (e.warmLanes |= t), l = e.expirationTimes;
    for (var u = t; 0 < u; ) {
      var o = 31 - Tt(u), d = 1 << o;
      l[o] = -1, u &= ~d;
    }
    a !== 0 && Ac(e, a, t);
  }
  function Us() {
    return (Ae & 6) === 0 ? (_l(0), !1) : !0;
  }
  function oo() {
    if (pe !== null) {
      if (Ce === 0)
        var e = pe.return;
      else
        e = pe, vn = wa = null, jr(e), ri = null, nl = 0, e = pe;
      for (; e !== null; )
        Fd(e.alternate, e), e = e.return;
      pe = null;
    }
  }
  function gi(e, t) {
    var a = e.timeoutHandle;
    a !== -1 && (e.timeoutHandle = -1, rg(a)), a = e.cancelPendingCommit, a !== null && (e.cancelPendingCommit = null, a()), Tn = 0, oo(), Ue = e, pe = a = mn(e.current, null), ge = t, Ce = 0, Mt = null, Jn = !1, pi = ki(e, t), ao = !1, vi = Dt = io = Ma = Fn = Ke = 0, zt = gl = null, lo = !1, (t & 8) !== 0 && (t |= t & 32);
    var l = e.entangledLanes;
    if (l !== 0)
      for (e = e.entanglements, l &= t; 0 < l; ) {
        var u = 31 - Tt(l), o = 1 << u;
        t |= e[u], l &= ~o;
      }
    return En = t, as(), a;
  }
  function _h(e, t) {
    he = null, M.H = cl, t === ui || t === fs ? (t = Uf(), Ce = 3) : t === hr ? (t = Uf(), Ce = 4) : Ce = t === Hr ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Mt = t, pe === null && (Ke = 1, js(
      e,
      $t(t, e.current)
    ));
  }
  function Sh() {
    var e = Ct.current;
    return e === null ? !0 : (ge & 4194048) === ge ? Kt === null : (ge & 62914560) === ge || (ge & 536870912) !== 0 ? e === Kt : !1;
  }
  function zh() {
    var e = M.H;
    return M.H = cl, e === null ? cl : e;
  }
  function wh() {
    var e = M.A;
    return M.A = By, e;
  }
  function Zs() {
    Ke = 4, Jn || (ge & 4194048) !== ge && Ct.current !== null || (pi = !0), (Fn & 134217727) === 0 && (Ma & 134217727) === 0 || Ue === null || Pn(
      Ue,
      ge,
      Dt,
      !1
    );
  }
  function co(e, t, a) {
    var l = Ae;
    Ae |= 2;
    var u = zh(), o = wh();
    (Ue !== e || ge !== t) && (qs = null, gi(e, t)), t = !1;
    var d = Ke;
    e: do
      try {
        if (Ce !== 0 && pe !== null) {
          var p = pe, b = Mt;
          switch (Ce) {
            case 8:
              oo(), d = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Ct.current === null && (t = !0);
              var T = Ce;
              if (Ce = 0, Mt = null, bi(e, p, b, T), a && pi) {
                d = 0;
                break e;
              }
              break;
            default:
              T = Ce, Ce = 0, Mt = null, bi(e, p, b, T);
          }
        }
        Ly(), d = Ke;
        break;
      } catch (D) {
        _h(e, D);
      }
    while (!0);
    return t && e.shellSuspendCounter++, vn = wa = null, Ae = l, M.H = u, M.A = o, pe === null && (Ue = null, ge = 0, as()), d;
  }
  function Ly() {
    for (; pe !== null; ) xh(pe);
  }
  function Gy(e, t) {
    var a = Ae;
    Ae |= 2;
    var l = zh(), u = wh();
    Ue !== e || ge !== t ? (qs = null, Rs = ht() + 500, gi(e, t)) : pi = ki(
      e,
      t
    );
    e: do
      try {
        if (Ce !== 0 && pe !== null) {
          t = pe;
          var o = Mt;
          t: switch (Ce) {
            case 1:
              Ce = 0, Mt = null, bi(e, t, o, 1);
              break;
            case 2:
            case 9:
              if (Rf(o)) {
                Ce = 0, Mt = null, jh(t);
                break;
              }
              t = function() {
                Ce !== 2 && Ce !== 9 || Ue !== e || (Ce = 7), on(e);
              }, o.then(t, t);
              break e;
            case 3:
              Ce = 7;
              break e;
            case 4:
              Ce = 5;
              break e;
            case 7:
              Rf(o) ? (Ce = 0, Mt = null, jh(t)) : (Ce = 0, Mt = null, bi(e, t, o, 7));
              break;
            case 5:
              var d = null;
              switch (pe.tag) {
                case 26:
                  d = pe.memoizedState;
                case 5:
                case 27:
                  var p = pe;
                  if (d ? cm(d) : p.stateNode.complete) {
                    Ce = 0, Mt = null;
                    var b = p.sibling;
                    if (b !== null) pe = b;
                    else {
                      var T = p.return;
                      T !== null ? (pe = T, Qs(T)) : pe = null;
                    }
                    break t;
                  }
              }
              Ce = 0, Mt = null, bi(e, t, o, 5);
              break;
            case 6:
              Ce = 0, Mt = null, bi(e, t, o, 6);
              break;
            case 8:
              oo(), Ke = 6;
              break e;
            default:
              throw Error(r(462));
          }
        }
        Yy();
        break;
      } catch (D) {
        _h(e, D);
      }
    while (!0);
    return vn = wa = null, M.H = l, M.A = u, Ae = a, pe !== null ? 0 : (Ue = null, ge = 0, as(), Ke);
  }
  function Yy() {
    for (; pe !== null && !ju(); )
      xh(pe);
  }
  function xh(e) {
    var t = Vd(e.alternate, e, En);
    e.memoizedProps = e.pendingProps, t === null ? Qs(e) : pe = t;
  }
  function jh(e) {
    var t = e, a = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = $d(
          a,
          t,
          t.pendingProps,
          t.type,
          void 0,
          ge
        );
        break;
      case 11:
        t = $d(
          a,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          ge
        );
        break;
      case 5:
        jr(t);
      default:
        Fd(a, t), t = pe = wf(t, En), t = Vd(a, t, En);
    }
    e.memoizedProps = e.pendingProps, t === null ? Qs(e) : pe = t;
  }
  function bi(e, t, a, l) {
    vn = wa = null, jr(t), ri = null, nl = 0;
    var u = t.return;
    try {
      if (Dy(
        e,
        u,
        t,
        a,
        ge
      )) {
        Ke = 1, js(
          e,
          $t(a, e.current)
        ), pe = null;
        return;
      }
    } catch (o) {
      if (u !== null) throw pe = u, o;
      Ke = 1, js(
        e,
        $t(a, e.current)
      ), pe = null;
      return;
    }
    t.flags & 32768 ? (Se || l === 1 ? e = !0 : pi || (ge & 536870912) !== 0 ? e = !1 : (Jn = e = !0, (l === 2 || l === 9 || l === 3 || l === 6) && (l = Ct.current, l !== null && l.tag === 13 && (l.flags |= 16384))), Eh(t, e)) : Qs(t);
  }
  function Qs(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        Eh(
          t,
          Jn
        );
        return;
      }
      e = t.return;
      var a = Uy(
        t.alternate,
        t,
        En
      );
      if (a !== null) {
        pe = a;
        return;
      }
      if (t = t.sibling, t !== null) {
        pe = t;
        return;
      }
      pe = t = e;
    } while (t !== null);
    Ke === 0 && (Ke = 5);
  }
  function Eh(e, t) {
    do {
      var a = Zy(e.alternate, e);
      if (a !== null) {
        a.flags &= 32767, pe = a;
        return;
      }
      if (a = e.return, a !== null && (a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null), !t && (e = e.sibling, e !== null)) {
        pe = e;
        return;
      }
      pe = e = a;
    } while (e !== null);
    Ke = 6, pe = null;
  }
  function Th(e, t, a, l, u, o, d, p, b) {
    e.cancelPendingCommit = null;
    do
      ks();
    while (tt !== 0);
    if ((Ae & 6) !== 0) throw Error(r(327));
    if (t !== null) {
      if (t === e.current) throw Error(r(177));
      if (o = t.lanes | t.childLanes, o |= Wu, xv(
        e,
        a,
        o,
        d,
        p,
        b
      ), e === Ue && (pe = Ue = null, ge = 0), yi = t, Wn = e, Tn = a, so = o, uo = u, vh = l, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Jy(Ba, function() {
        return Mh(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), l = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || l) {
        l = M.T, M.T = null, u = Y.p, Y.p = 2, d = Ae, Ae |= 4;
        try {
          Qy(e, t, a);
        } finally {
          Ae = d, Y.p = u, M.T = l;
        }
      }
      tt = 1, Ah(), Oh(), Ch();
    }
  }
  function Ah() {
    if (tt === 1) {
      tt = 0;
      var e = Wn, t = yi, a = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || a) {
        a = M.T, M.T = null;
        var l = Y.p;
        Y.p = 2;
        var u = Ae;
        Ae |= 4;
        try {
          rh(t, e);
          var o = wo, d = mf(e.containerInfo), p = o.focusedElem, b = o.selectionRange;
          if (d !== p && p && p.ownerDocument && hf(
            p.ownerDocument.documentElement,
            p
          )) {
            if (b !== null && Xu(p)) {
              var T = b.start, D = b.end;
              if (D === void 0 && (D = T), "selectionStart" in p)
                p.selectionStart = T, p.selectionEnd = Math.min(
                  D,
                  p.value.length
                );
              else {
                var Q = p.ownerDocument || document, A = Q && Q.defaultView || window;
                if (A.getSelection) {
                  var C = A.getSelection(), W = p.textContent.length, re = Math.min(b.start, W), Re = b.end === void 0 ? re : Math.min(b.end, W);
                  !C.extend && re > Re && (d = Re, Re = re, re = d);
                  var x = df(
                    p,
                    re
                  ), S = df(
                    p,
                    Re
                  );
                  if (x && S && (C.rangeCount !== 1 || C.anchorNode !== x.node || C.anchorOffset !== x.offset || C.focusNode !== S.node || C.focusOffset !== S.offset)) {
                    var E = Q.createRange();
                    E.setStart(x.node, x.offset), C.removeAllRanges(), re > Re ? (C.addRange(E), C.extend(S.node, S.offset)) : (E.setEnd(S.node, S.offset), C.addRange(E));
                  }
                }
              }
            }
            for (Q = [], C = p; C = C.parentNode; )
              C.nodeType === 1 && Q.push({
                element: C,
                left: C.scrollLeft,
                top: C.scrollTop
              });
            for (typeof p.focus == "function" && p.focus(), p = 0; p < Q.length; p++) {
              var Z = Q[p];
              Z.element.scrollLeft = Z.left, Z.element.scrollTop = Z.top;
            }
          }
          Is = !!zo, wo = zo = null;
        } finally {
          Ae = u, Y.p = l, M.T = a;
        }
      }
      e.current = t, tt = 2;
    }
  }
  function Oh() {
    if (tt === 2) {
      tt = 0;
      var e = Wn, t = yi, a = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || a) {
        a = M.T, M.T = null;
        var l = Y.p;
        Y.p = 2;
        var u = Ae;
        Ae |= 4;
        try {
          ah(e, t.alternate, t);
        } finally {
          Ae = u, Y.p = l, M.T = a;
        }
      }
      tt = 3;
    }
  }
  function Ch() {
    if (tt === 4 || tt === 3) {
      tt = 0, Qi();
      var e = Wn, t = yi, a = Tn, l = vh;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? tt = 5 : (tt = 0, yi = Wn = null, Nh(e, e.pendingLanes));
      var u = e.pendingLanes;
      if (u === 0 && (In = null), Au(a), t = t.stateNode, Et && typeof Et.onCommitFiberRoot == "function")
        try {
          Et.onCommitFiberRoot(
            Qt,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (l !== null) {
        t = M.T, u = Y.p, Y.p = 2, M.T = null;
        try {
          for (var o = e.onRecoverableError, d = 0; d < l.length; d++) {
            var p = l[d];
            o(p.value, {
              componentStack: p.stack
            });
          }
        } finally {
          M.T = t, Y.p = u;
        }
      }
      (Tn & 3) !== 0 && ks(), on(e), u = e.pendingLanes, (a & 261930) !== 0 && (u & 42) !== 0 ? e === ro ? bl++ : (bl = 0, ro = e) : bl = 0, _l(0);
    }
  }
  function Nh(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, el(t)));
  }
  function ks() {
    return Ah(), Oh(), Ch(), Mh();
  }
  function Mh() {
    if (tt !== 5) return !1;
    var e = Wn, t = so;
    so = 0;
    var a = Au(Tn), l = M.T, u = Y.p;
    try {
      Y.p = 32 > a ? 32 : a, M.T = null, a = uo, uo = null;
      var o = Wn, d = Tn;
      if (tt = 0, yi = Wn = null, Tn = 0, (Ae & 6) !== 0) throw Error(r(331));
      var p = Ae;
      if (Ae |= 4, hh(o.current), ch(
        o,
        o.current,
        d,
        a
      ), Ae = p, _l(0, !1), Et && typeof Et.onPostCommitFiberRoot == "function")
        try {
          Et.onPostCommitFiberRoot(Qt, o);
        } catch {
        }
      return !0;
    } finally {
      Y.p = u, M.T = l, Nh(e, t);
    }
  }
  function Dh(e, t, a) {
    t = $t(a, t), t = Br(e.stateNode, t, 2), e = Yn(e, t, 2), e !== null && (Bi(e, 2), on(e));
  }
  function Ne(e, t, a) {
    if (e.tag === 3)
      Dh(e, e, a);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Dh(
            t,
            e,
            a
          );
          break;
        } else if (t.tag === 1) {
          var l = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (In === null || !In.has(l))) {
            e = $t(a, e), a = Rd(2), l = Yn(t, a, 2), l !== null && (qd(
              a,
              l,
              t,
              e
            ), Bi(l, 2), on(l));
            break;
          }
        }
        t = t.return;
      }
  }
  function fo(e, t, a) {
    var l = e.pingCache;
    if (l === null) {
      l = e.pingCache = new Hy();
      var u = /* @__PURE__ */ new Set();
      l.set(t, u);
    } else
      u = l.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), l.set(t, u));
    u.has(a) || (ao = !0, u.add(a), e = Ky.bind(null, e, t, a), t.then(e, e));
  }
  function Ky(e, t, a) {
    var l = e.pingCache;
    l !== null && l.delete(t), e.pingedLanes |= e.suspendedLanes & a, e.warmLanes &= ~a, Ue === e && (ge & a) === a && (Ke === 4 || Ke === 3 && (ge & 62914560) === ge && 300 > ht() - Ds ? (Ae & 2) === 0 && gi(e, 0) : io |= a, vi === ge && (vi = 0)), on(e);
  }
  function Rh(e, t) {
    t === 0 && (t = Tc()), e = _a(e, t), e !== null && (Bi(e, t), on(e));
  }
  function Xy(e) {
    var t = e.memoizedState, a = 0;
    t !== null && (a = t.retryLane), Rh(e, a);
  }
  function Vy(e, t) {
    var a = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var l = e.stateNode, u = e.memoizedState;
        u !== null && (a = u.retryLane);
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
    l !== null && l.delete(t), Rh(e, a);
  }
  function Jy(e, t) {
    return Zi(e, t);
  }
  var Bs = null, _i = null, ho = !1, Hs = !1, mo = !1, ea = 0;
  function on(e) {
    e !== _i && e.next === null && (_i === null ? Bs = _i = e : _i = _i.next = e), Hs = !0, ho || (ho = !0, Iy());
  }
  function _l(e, t) {
    if (!mo && Hs) {
      mo = !0;
      do
        for (var a = !1, l = Bs; l !== null; ) {
          if (e !== 0) {
            var u = l.pendingLanes;
            if (u === 0) var o = 0;
            else {
              var d = l.suspendedLanes, p = l.pingedLanes;
              o = (1 << 31 - Tt(42 | e) + 1) - 1, o &= u & ~(d & ~p), o = o & 201326741 ? o & 201326741 | 1 : o ? o | 2 : 0;
            }
            o !== 0 && (a = !0, Qh(l, o));
          } else
            o = ge, o = Yl(
              l,
              l === Ue ? o : 0,
              l.cancelPendingCommit !== null || l.timeoutHandle !== -1
            ), (o & 3) === 0 || ki(l, o) || (a = !0, Qh(l, o));
          l = l.next;
        }
      while (a);
      mo = !1;
    }
  }
  function Fy() {
    qh();
  }
  function qh() {
    Hs = ho = !1;
    var e = 0;
    ea !== 0 && ug() && (e = ea);
    for (var t = ht(), a = null, l = Bs; l !== null; ) {
      var u = l.next, o = Uh(l, t);
      o === 0 ? (l.next = null, a === null ? Bs = u : a.next = u, u === null && (_i = a)) : (a = l, (e !== 0 || (o & 3) !== 0) && (Hs = !0)), l = u;
    }
    tt !== 0 && tt !== 5 || _l(e), ea !== 0 && (ea = 0);
  }
  function Uh(e, t) {
    for (var a = e.suspendedLanes, l = e.pingedLanes, u = e.expirationTimes, o = e.pendingLanes & -62914561; 0 < o; ) {
      var d = 31 - Tt(o), p = 1 << d, b = u[d];
      b === -1 ? ((p & a) === 0 || (p & l) !== 0) && (u[d] = wv(p, t)) : b <= t && (e.expiredLanes |= p), o &= ~p;
    }
    if (t = Ue, a = ge, a = Yl(
      e,
      e === t ? a : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l = e.callbackNode, a === 0 || e === t && (Ce === 2 || Ce === 9) || e.cancelPendingCommit !== null)
      return l !== null && l !== null && ma(l), e.callbackNode = null, e.callbackPriority = 0;
    if ((a & 3) === 0 || ki(e, a)) {
      if (t = a & -a, t === e.callbackPriority) return t;
      switch (l !== null && ma(l), Au(a)) {
        case 2:
        case 8:
          a = Hl;
          break;
        case 32:
          a = Ba;
          break;
        case 268435456:
          a = ye;
          break;
        default:
          a = Ba;
      }
      return l = Zh.bind(null, e), a = Zi(a, l), e.callbackPriority = t, e.callbackNode = a, t;
    }
    return l !== null && l !== null && ma(l), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function Zh(e, t) {
    if (tt !== 0 && tt !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var a = e.callbackNode;
    if (ks() && e.callbackNode !== a)
      return null;
    var l = ge;
    return l = Yl(
      e,
      e === Ue ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l === 0 ? null : (gh(e, l, t), Uh(e, ht()), e.callbackNode != null && e.callbackNode === a ? Zh.bind(null, e) : null);
  }
  function Qh(e, t) {
    if (ks()) return null;
    gh(e, t, !0);
  }
  function Iy() {
    og(function() {
      (Ae & 6) !== 0 ? Zi(
        Bl,
        Fy
      ) : qh();
    });
  }
  function po() {
    if (ea === 0) {
      var e = li;
      e === 0 && (e = $l, $l <<= 1, ($l & 261888) === 0 && ($l = 256)), ea = e;
    }
    return ea;
  }
  function kh(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Jl("" + e);
  }
  function Bh(e, t) {
    var a = t.ownerDocument.createElement("input");
    return a.name = t.name, a.value = t.value, e.id && a.setAttribute("form", e.id), t.parentNode.insertBefore(a, t), e = new FormData(e), a.parentNode.removeChild(a), e;
  }
  function Wy(e, t, a, l, u) {
    if (t === "submit" && a && a.stateNode === u) {
      var o = kh(
        (u[yt] || null).action
      ), d = l.submitter;
      d && (t = (t = d[yt] || null) ? kh(t.formAction) : d.getAttribute("formAction"), t !== null && (o = t, d = null));
      var p = new Pl(
        "action",
        "action",
        null,
        l,
        u
      );
      e.push({
        event: p,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (l.defaultPrevented) {
                if (ea !== 0) {
                  var b = d ? Bh(u, d) : new FormData(u);
                  Rr(
                    a,
                    {
                      pending: !0,
                      data: b,
                      method: u.method,
                      action: o
                    },
                    null,
                    b
                  );
                }
              } else
                typeof o == "function" && (p.preventDefault(), b = d ? Bh(u, d) : new FormData(u), Rr(
                  a,
                  {
                    pending: !0,
                    data: b,
                    method: u.method,
                    action: o
                  },
                  o,
                  b
                ));
            },
            currentTarget: u
          }
        ]
      });
    }
  }
  for (var vo = 0; vo < Iu.length; vo++) {
    var yo = Iu[vo], Py = yo.toLowerCase(), eg = yo[0].toUpperCase() + yo.slice(1);
    en(
      Py,
      "on" + eg
    );
  }
  en(yf, "onAnimationEnd"), en(gf, "onAnimationIteration"), en(bf, "onAnimationStart"), en("dblclick", "onDoubleClick"), en("focusin", "onFocus"), en("focusout", "onBlur"), en(vy, "onTransitionRun"), en(yy, "onTransitionStart"), en(gy, "onTransitionCancel"), en(_f, "onTransitionEnd"), Ya("onMouseEnter", ["mouseout", "mouseover"]), Ya("onMouseLeave", ["mouseout", "mouseover"]), Ya("onPointerEnter", ["pointerout", "pointerover"]), Ya("onPointerLeave", ["pointerout", "pointerover"]), va(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), va(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), va("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), va(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), va(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), va(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var Sl = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), tg = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Sl)
  );
  function Hh(e, t) {
    t = (t & 4) !== 0;
    for (var a = 0; a < e.length; a++) {
      var l = e[a], u = l.event;
      l = l.listeners;
      e: {
        var o = void 0;
        if (t)
          for (var d = l.length - 1; 0 <= d; d--) {
            var p = l[d], b = p.instance, T = p.currentTarget;
            if (p = p.listener, b !== o && u.isPropagationStopped())
              break e;
            o = p, u.currentTarget = T;
            try {
              o(u);
            } catch (D) {
              ns(D);
            }
            u.currentTarget = null, o = b;
          }
        else
          for (d = 0; d < l.length; d++) {
            if (p = l[d], b = p.instance, T = p.currentTarget, p = p.listener, b !== o && u.isPropagationStopped())
              break e;
            o = p, u.currentTarget = T;
            try {
              o(u);
            } catch (D) {
              ns(D);
            }
            u.currentTarget = null, o = b;
          }
      }
    }
  }
  function ve(e, t) {
    var a = t[Ou];
    a === void 0 && (a = t[Ou] = /* @__PURE__ */ new Set());
    var l = e + "__bubble";
    a.has(l) || ($h(t, e, 2, !1), a.add(l));
  }
  function go(e, t, a) {
    var l = 0;
    t && (l |= 4), $h(
      a,
      e,
      l,
      t
    );
  }
  var $s = "_reactListening" + Math.random().toString(36).slice(2);
  function bo(e) {
    if (!e[$s]) {
      e[$s] = !0, Rc.forEach(function(a) {
        a !== "selectionchange" && (tg.has(a) || go(a, !1, e), go(a, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[$s] || (t[$s] = !0, go("selectionchange", !1, t));
    }
  }
  function $h(e, t, a, l) {
    switch (ym(t)) {
      case 2:
        var u = Og;
        break;
      case 8:
        u = Cg;
        break;
      default:
        u = Ro;
    }
    a = u.bind(
      null,
      t,
      a,
      e
    ), u = void 0, !Qu || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (u = !0), l ? u !== void 0 ? e.addEventListener(t, a, {
      capture: !0,
      passive: u
    }) : e.addEventListener(t, a, !0) : u !== void 0 ? e.addEventListener(t, a, {
      passive: u
    }) : e.addEventListener(t, a, !1);
  }
  function _o(e, t, a, l, u) {
    var o = l;
    if ((t & 1) === 0 && (t & 2) === 0 && l !== null)
      e: for (; ; ) {
        if (l === null) return;
        var d = l.tag;
        if (d === 3 || d === 4) {
          var p = l.stateNode.containerInfo;
          if (p === u) break;
          if (d === 4)
            for (d = l.return; d !== null; ) {
              var b = d.tag;
              if ((b === 3 || b === 4) && d.stateNode.containerInfo === u)
                return;
              d = d.return;
            }
          for (; p !== null; ) {
            if (d = $a(p), d === null) return;
            if (b = d.tag, b === 5 || b === 6 || b === 26 || b === 27) {
              l = o = d;
              continue e;
            }
            p = p.parentNode;
          }
        }
        l = l.return;
      }
    Kc(function() {
      var T = o, D = Uu(a), Q = [];
      e: {
        var A = Sf.get(e);
        if (A !== void 0) {
          var C = Pl, W = e;
          switch (e) {
            case "keypress":
              if (Il(a) === 0) break e;
            case "keydown":
            case "keyup":
              C = Vv;
              break;
            case "focusin":
              W = "focus", C = $u;
              break;
            case "focusout":
              W = "blur", C = $u;
              break;
            case "beforeblur":
            case "afterblur":
              C = $u;
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
              C = Jc;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              C = Uv;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              C = Iv;
              break;
            case yf:
            case gf:
            case bf:
              C = kv;
              break;
            case _f:
              C = Pv;
              break;
            case "scroll":
            case "scrollend":
              C = Rv;
              break;
            case "wheel":
              C = ty;
              break;
            case "copy":
            case "cut":
            case "paste":
              C = Hv;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              C = Ic;
              break;
            case "toggle":
            case "beforetoggle":
              C = ay;
          }
          var re = (t & 4) !== 0, Re = !re && (e === "scroll" || e === "scrollend"), x = re ? A !== null ? A + "Capture" : null : A;
          re = [];
          for (var S = T, E; S !== null; ) {
            var Z = S;
            if (E = Z.stateNode, Z = Z.tag, Z !== 5 && Z !== 26 && Z !== 27 || E === null || x === null || (Z = Li(S, x), Z != null && re.push(
              zl(S, Z, E)
            )), Re) break;
            S = S.return;
          }
          0 < re.length && (A = new C(
            A,
            W,
            null,
            a,
            D
          ), Q.push({ event: A, listeners: re }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (A = e === "mouseover" || e === "pointerover", C = e === "mouseout" || e === "pointerout", A && a !== qu && (W = a.relatedTarget || a.fromElement) && ($a(W) || W[Ha]))
            break e;
          if ((C || A) && (A = D.window === D ? D : (A = D.ownerDocument) ? A.defaultView || A.parentWindow : window, C ? (W = a.relatedTarget || a.toElement, C = T, W = W ? $a(W) : null, W !== null && (Re = m(W), re = W.tag, W !== Re || re !== 5 && re !== 27 && re !== 6) && (W = null)) : (C = null, W = T), C !== W)) {
            if (re = Jc, Z = "onMouseLeave", x = "onMouseEnter", S = "mouse", (e === "pointerout" || e === "pointerover") && (re = Ic, Z = "onPointerLeave", x = "onPointerEnter", S = "pointer"), Re = C == null ? A : $i(C), E = W == null ? A : $i(W), A = new re(
              Z,
              S + "leave",
              C,
              a,
              D
            ), A.target = Re, A.relatedTarget = E, Z = null, $a(D) === T && (re = new re(
              x,
              S + "enter",
              W,
              a,
              D
            ), re.target = E, re.relatedTarget = Re, Z = re), Re = Z, C && W)
              t: {
                for (re = ng, x = C, S = W, E = 0, Z = x; Z; Z = re(Z))
                  E++;
                Z = 0;
                for (var se = S; se; se = re(se))
                  Z++;
                for (; 0 < E - Z; )
                  x = re(x), E--;
                for (; 0 < Z - E; )
                  S = re(S), Z--;
                for (; E--; ) {
                  if (x === S || S !== null && x === S.alternate) {
                    re = x;
                    break t;
                  }
                  x = re(x), S = re(S);
                }
                re = null;
              }
            else re = null;
            C !== null && Lh(
              Q,
              A,
              C,
              re,
              !1
            ), W !== null && Re !== null && Lh(
              Q,
              Re,
              W,
              re,
              !0
            );
          }
        }
        e: {
          if (A = T ? $i(T) : window, C = A.nodeName && A.nodeName.toLowerCase(), C === "select" || C === "input" && A.type === "file")
            var Ee = sf;
          else if (af(A))
            if (uf)
              Ee = hy;
            else {
              Ee = fy;
              var ee = cy;
            }
          else
            C = A.nodeName, !C || C.toLowerCase() !== "input" || A.type !== "checkbox" && A.type !== "radio" ? T && Ru(T.elementType) && (Ee = sf) : Ee = dy;
          if (Ee && (Ee = Ee(e, T))) {
            lf(
              Q,
              Ee,
              a,
              D
            );
            break e;
          }
          ee && ee(e, A, T), e === "focusout" && T && A.type === "number" && T.memoizedProps.value != null && Du(A, "number", A.value);
        }
        switch (ee = T ? $i(T) : window, e) {
          case "focusin":
            (af(ee) || ee.contentEditable === "true") && (Ia = ee, Vu = T, Ii = null);
            break;
          case "focusout":
            Ii = Vu = Ia = null;
            break;
          case "mousedown":
            Ju = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Ju = !1, pf(Q, a, D);
            break;
          case "selectionchange":
            if (py) break;
          case "keydown":
          case "keyup":
            pf(Q, a, D);
        }
        var me;
        if (Gu)
          e: {
            switch (e) {
              case "compositionstart":
                var be = "onCompositionStart";
                break e;
              case "compositionend":
                be = "onCompositionEnd";
                break e;
              case "compositionupdate":
                be = "onCompositionUpdate";
                break e;
            }
            be = void 0;
          }
        else
          Fa ? tf(e, a) && (be = "onCompositionEnd") : e === "keydown" && a.keyCode === 229 && (be = "onCompositionStart");
        be && (Wc && a.locale !== "ko" && (Fa || be !== "onCompositionStart" ? be === "onCompositionEnd" && Fa && (me = Xc()) : (Qn = D, ku = "value" in Qn ? Qn.value : Qn.textContent, Fa = !0)), ee = Ls(T, be), 0 < ee.length && (be = new Fc(
          be,
          e,
          null,
          a,
          D
        ), Q.push({ event: be, listeners: ee }), me ? be.data = me : (me = nf(a), me !== null && (be.data = me)))), (me = ly ? sy(e, a) : uy(e, a)) && (be = Ls(T, "onBeforeInput"), 0 < be.length && (ee = new Fc(
          "onBeforeInput",
          "beforeinput",
          null,
          a,
          D
        ), Q.push({
          event: ee,
          listeners: be
        }), ee.data = me)), Wy(
          Q,
          e,
          T,
          a,
          D
        );
      }
      Hh(Q, t);
    });
  }
  function zl(e, t, a) {
    return {
      instance: e,
      listener: t,
      currentTarget: a
    };
  }
  function Ls(e, t) {
    for (var a = t + "Capture", l = []; e !== null; ) {
      var u = e, o = u.stateNode;
      if (u = u.tag, u !== 5 && u !== 26 && u !== 27 || o === null || (u = Li(e, a), u != null && l.unshift(
        zl(e, u, o)
      ), u = Li(e, t), u != null && l.push(
        zl(e, u, o)
      )), e.tag === 3) return l;
      e = e.return;
    }
    return [];
  }
  function ng(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function Lh(e, t, a, l, u) {
    for (var o = t._reactName, d = []; a !== null && a !== l; ) {
      var p = a, b = p.alternate, T = p.stateNode;
      if (p = p.tag, b !== null && b === l) break;
      p !== 5 && p !== 26 && p !== 27 || T === null || (b = T, u ? (T = Li(a, o), T != null && d.unshift(
        zl(a, T, b)
      )) : u || (T = Li(a, o), T != null && d.push(
        zl(a, T, b)
      ))), a = a.return;
    }
    d.length !== 0 && e.push({ event: t, listeners: d });
  }
  var ag = /\r\n?/g, ig = /\u0000|\uFFFD/g;
  function Gh(e) {
    return (typeof e == "string" ? e : "" + e).replace(ag, `
`).replace(ig, "");
  }
  function Yh(e, t) {
    return t = Gh(t), Gh(e) === t;
  }
  function De(e, t, a, l, u, o) {
    switch (a) {
      case "children":
        typeof l == "string" ? t === "body" || t === "textarea" && l === "" || Xa(e, l) : (typeof l == "number" || typeof l == "bigint") && t !== "body" && Xa(e, "" + l);
        break;
      case "className":
        Xl(e, "class", l);
        break;
      case "tabIndex":
        Xl(e, "tabindex", l);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Xl(e, a, l);
        break;
      case "style":
        Gc(e, l, o);
        break;
      case "data":
        if (t !== "object") {
          Xl(e, "data", l);
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
        l = Jl("" + l), e.setAttribute(a, l);
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
          typeof o == "function" && (a === "formAction" ? (t !== "input" && De(e, t, "name", u.name, u, null), De(
            e,
            t,
            "formEncType",
            u.formEncType,
            u,
            null
          ), De(
            e,
            t,
            "formMethod",
            u.formMethod,
            u,
            null
          ), De(
            e,
            t,
            "formTarget",
            u.formTarget,
            u,
            null
          )) : (De(e, t, "encType", u.encType, u, null), De(e, t, "method", u.method, u, null), De(e, t, "target", u.target, u, null)));
        if (l == null || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(a);
          break;
        }
        l = Jl("" + l), e.setAttribute(a, l);
        break;
      case "onClick":
        l != null && (e.onclick = dn);
        break;
      case "onScroll":
        l != null && ve("scroll", e);
        break;
      case "onScrollEnd":
        l != null && ve("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l))
            throw Error(r(61));
          if (a = l.__html, a != null) {
            if (u.children != null) throw Error(r(60));
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
        a = Jl("" + l), e.setAttributeNS(
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
        ve("beforetoggle", e), ve("toggle", e), Kl(e, "popover", l);
        break;
      case "xlinkActuate":
        fn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          l
        );
        break;
      case "xlinkArcrole":
        fn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          l
        );
        break;
      case "xlinkRole":
        fn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          l
        );
        break;
      case "xlinkShow":
        fn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          l
        );
        break;
      case "xlinkTitle":
        fn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          l
        );
        break;
      case "xlinkType":
        fn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          l
        );
        break;
      case "xmlBase":
        fn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          l
        );
        break;
      case "xmlLang":
        fn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          l
        );
        break;
      case "xmlSpace":
        fn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          l
        );
        break;
      case "is":
        Kl(e, "is", l);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") && (a = Mv.get(a) || a, Kl(e, a, l));
    }
  }
  function So(e, t, a, l, u, o) {
    switch (a) {
      case "style":
        Gc(e, l, o);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l))
            throw Error(r(61));
          if (a = l.__html, a != null) {
            if (u.children != null) throw Error(r(60));
            e.innerHTML = a;
          }
        }
        break;
      case "children":
        typeof l == "string" ? Xa(e, l) : (typeof l == "number" || typeof l == "bigint") && Xa(e, "" + l);
        break;
      case "onScroll":
        l != null && ve("scroll", e);
        break;
      case "onScrollEnd":
        l != null && ve("scrollend", e);
        break;
      case "onClick":
        l != null && (e.onclick = dn);
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
        if (!qc.hasOwnProperty(a))
          e: {
            if (a[0] === "o" && a[1] === "n" && (u = a.endsWith("Capture"), t = a.slice(2, u ? a.length - 7 : void 0), o = e[yt] || null, o = o != null ? o[a] : null, typeof o == "function" && e.removeEventListener(t, o, u), typeof l == "function")) {
              typeof o != "function" && o !== null && (a in e ? e[a] = null : e.hasAttribute(a) && e.removeAttribute(a)), e.addEventListener(t, l, u);
              break e;
            }
            a in e ? e[a] = l : l === !0 ? e.setAttribute(a, "") : Kl(e, a, l);
          }
    }
  }
  function ct(e, t, a) {
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
        ve("error", e), ve("load", e);
        var l = !1, u = !1, o;
        for (o in a)
          if (a.hasOwnProperty(o)) {
            var d = a[o];
            if (d != null)
              switch (o) {
                case "src":
                  l = !0;
                  break;
                case "srcSet":
                  u = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(r(137, t));
                default:
                  De(e, t, o, d, a, null);
              }
          }
        u && De(e, t, "srcSet", a.srcSet, a, null), l && De(e, t, "src", a.src, a, null);
        return;
      case "input":
        ve("invalid", e);
        var p = o = d = u = null, b = null, T = null;
        for (l in a)
          if (a.hasOwnProperty(l)) {
            var D = a[l];
            if (D != null)
              switch (l) {
                case "name":
                  u = D;
                  break;
                case "type":
                  d = D;
                  break;
                case "checked":
                  b = D;
                  break;
                case "defaultChecked":
                  T = D;
                  break;
                case "value":
                  o = D;
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
                  De(e, t, l, D, a, null);
              }
          }
        Bc(
          e,
          o,
          p,
          b,
          T,
          d,
          u,
          !1
        );
        return;
      case "select":
        ve("invalid", e), l = d = o = null;
        for (u in a)
          if (a.hasOwnProperty(u) && (p = a[u], p != null))
            switch (u) {
              case "value":
                o = p;
                break;
              case "defaultValue":
                d = p;
                break;
              case "multiple":
                l = p;
              default:
                De(e, t, u, p, a, null);
            }
        t = o, a = d, e.multiple = !!l, t != null ? Ka(e, !!l, t, !1) : a != null && Ka(e, !!l, a, !0);
        return;
      case "textarea":
        ve("invalid", e), o = u = l = null;
        for (d in a)
          if (a.hasOwnProperty(d) && (p = a[d], p != null))
            switch (d) {
              case "value":
                l = p;
                break;
              case "defaultValue":
                u = p;
                break;
              case "children":
                o = p;
                break;
              case "dangerouslySetInnerHTML":
                if (p != null) throw Error(r(91));
                break;
              default:
                De(e, t, d, p, a, null);
            }
        $c(e, l, u, o);
        return;
      case "option":
        for (b in a)
          if (a.hasOwnProperty(b) && (l = a[b], l != null))
            switch (b) {
              case "selected":
                e.selected = l && typeof l != "function" && typeof l != "symbol";
                break;
              default:
                De(e, t, b, l, a, null);
            }
        return;
      case "dialog":
        ve("beforetoggle", e), ve("toggle", e), ve("cancel", e), ve("close", e);
        break;
      case "iframe":
      case "object":
        ve("load", e);
        break;
      case "video":
      case "audio":
        for (l = 0; l < Sl.length; l++)
          ve(Sl[l], e);
        break;
      case "image":
        ve("error", e), ve("load", e);
        break;
      case "details":
        ve("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        ve("error", e), ve("load", e);
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
                De(e, t, T, l, a, null);
            }
        return;
      default:
        if (Ru(t)) {
          for (D in a)
            a.hasOwnProperty(D) && (l = a[D], l !== void 0 && So(
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
      a.hasOwnProperty(p) && (l = a[p], l != null && De(e, t, p, l, a, null));
  }
  function lg(e, t, a, l) {
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
        var u = null, o = null, d = null, p = null, b = null, T = null, D = null;
        for (C in a) {
          var Q = a[C];
          if (a.hasOwnProperty(C) && Q != null)
            switch (C) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                b = Q;
              default:
                l.hasOwnProperty(C) || De(e, t, C, null, l, Q);
            }
        }
        for (var A in l) {
          var C = l[A];
          if (Q = a[A], l.hasOwnProperty(A) && (C != null || Q != null))
            switch (A) {
              case "type":
                o = C;
                break;
              case "name":
                u = C;
                break;
              case "checked":
                T = C;
                break;
              case "defaultChecked":
                D = C;
                break;
              case "value":
                d = C;
                break;
              case "defaultValue":
                p = C;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (C != null)
                  throw Error(r(137, t));
                break;
              default:
                C !== Q && De(
                  e,
                  t,
                  A,
                  C,
                  l,
                  Q
                );
            }
        }
        Mu(
          e,
          d,
          p,
          b,
          T,
          D,
          o,
          u
        );
        return;
      case "select":
        C = d = p = A = null;
        for (o in a)
          if (b = a[o], a.hasOwnProperty(o) && b != null)
            switch (o) {
              case "value":
                break;
              case "multiple":
                C = b;
              default:
                l.hasOwnProperty(o) || De(
                  e,
                  t,
                  o,
                  null,
                  l,
                  b
                );
            }
        for (u in l)
          if (o = l[u], b = a[u], l.hasOwnProperty(u) && (o != null || b != null))
            switch (u) {
              case "value":
                A = o;
                break;
              case "defaultValue":
                p = o;
                break;
              case "multiple":
                d = o;
              default:
                o !== b && De(
                  e,
                  t,
                  u,
                  o,
                  l,
                  b
                );
            }
        t = p, a = d, l = C, A != null ? Ka(e, !!a, A, !1) : !!l != !!a && (t != null ? Ka(e, !!a, t, !0) : Ka(e, !!a, a ? [] : "", !1));
        return;
      case "textarea":
        C = A = null;
        for (p in a)
          if (u = a[p], a.hasOwnProperty(p) && u != null && !l.hasOwnProperty(p))
            switch (p) {
              case "value":
                break;
              case "children":
                break;
              default:
                De(e, t, p, null, l, u);
            }
        for (d in l)
          if (u = l[d], o = a[d], l.hasOwnProperty(d) && (u != null || o != null))
            switch (d) {
              case "value":
                A = u;
                break;
              case "defaultValue":
                C = u;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (u != null) throw Error(r(91));
                break;
              default:
                u !== o && De(e, t, d, u, l, o);
            }
        Hc(e, A, C);
        return;
      case "option":
        for (var W in a)
          if (A = a[W], a.hasOwnProperty(W) && A != null && !l.hasOwnProperty(W))
            switch (W) {
              case "selected":
                e.selected = !1;
                break;
              default:
                De(
                  e,
                  t,
                  W,
                  null,
                  l,
                  A
                );
            }
        for (b in l)
          if (A = l[b], C = a[b], l.hasOwnProperty(b) && A !== C && (A != null || C != null))
            switch (b) {
              case "selected":
                e.selected = A && typeof A != "function" && typeof A != "symbol";
                break;
              default:
                De(
                  e,
                  t,
                  b,
                  A,
                  l,
                  C
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
        for (var re in a)
          A = a[re], a.hasOwnProperty(re) && A != null && !l.hasOwnProperty(re) && De(e, t, re, null, l, A);
        for (T in l)
          if (A = l[T], C = a[T], l.hasOwnProperty(T) && A !== C && (A != null || C != null))
            switch (T) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (A != null)
                  throw Error(r(137, t));
                break;
              default:
                De(
                  e,
                  t,
                  T,
                  A,
                  l,
                  C
                );
            }
        return;
      default:
        if (Ru(t)) {
          for (var Re in a)
            A = a[Re], a.hasOwnProperty(Re) && A !== void 0 && !l.hasOwnProperty(Re) && So(
              e,
              t,
              Re,
              void 0,
              l,
              A
            );
          for (D in l)
            A = l[D], C = a[D], !l.hasOwnProperty(D) || A === C || A === void 0 && C === void 0 || So(
              e,
              t,
              D,
              A,
              l,
              C
            );
          return;
        }
    }
    for (var x in a)
      A = a[x], a.hasOwnProperty(x) && A != null && !l.hasOwnProperty(x) && De(e, t, x, null, l, A);
    for (Q in l)
      A = l[Q], C = a[Q], !l.hasOwnProperty(Q) || A === C || A == null && C == null || De(e, t, Q, A, l, C);
  }
  function Kh(e) {
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
  function sg() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, a = performance.getEntriesByType("resource"), l = 0; l < a.length; l++) {
        var u = a[l], o = u.transferSize, d = u.initiatorType, p = u.duration;
        if (o && p && Kh(d)) {
          for (d = 0, p = u.responseEnd, l += 1; l < a.length; l++) {
            var b = a[l], T = b.startTime;
            if (T > p) break;
            var D = b.transferSize, Q = b.initiatorType;
            D && Kh(Q) && (b = b.responseEnd, d += D * (b < p ? 1 : (p - T) / (b - T)));
          }
          if (--l, t += 8 * (o + d) / (u.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var zo = null, wo = null;
  function Gs(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Xh(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Vh(e, t) {
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
  function xo(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var jo = null;
  function ug() {
    var e = window.event;
    return e && e.type === "popstate" ? e === jo ? !1 : (jo = e, !0) : (jo = null, !1);
  }
  var Jh = typeof setTimeout == "function" ? setTimeout : void 0, rg = typeof clearTimeout == "function" ? clearTimeout : void 0, Fh = typeof Promise == "function" ? Promise : void 0, og = typeof queueMicrotask == "function" ? queueMicrotask : typeof Fh < "u" ? function(e) {
    return Fh.resolve(null).then(e).catch(cg);
  } : Jh;
  function cg(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function ta(e) {
    return e === "head";
  }
  function Ih(e, t) {
    var a = t, l = 0;
    do {
      var u = a.nextSibling;
      if (e.removeChild(a), u && u.nodeType === 8)
        if (a = u.data, a === "/$" || a === "/&") {
          if (l === 0) {
            e.removeChild(u), xi(t);
            return;
          }
          l--;
        } else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&")
          l++;
        else if (a === "html")
          wl(e.ownerDocument.documentElement);
        else if (a === "head") {
          a = e.ownerDocument.head, wl(a);
          for (var o = a.firstChild; o; ) {
            var d = o.nextSibling, p = o.nodeName;
            o[Hi] || p === "SCRIPT" || p === "STYLE" || p === "LINK" && o.rel.toLowerCase() === "stylesheet" || a.removeChild(o), o = d;
          }
        } else
          a === "body" && wl(e.ownerDocument.body);
      a = u;
    } while (a);
    xi(t);
  }
  function Wh(e, t) {
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
  function Eo(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var a = t;
      switch (t = t.nextSibling, a.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          Eo(a), Cu(a);
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
  function fg(e, t, a, l) {
    for (; e.nodeType === 1; ) {
      var u = a;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (l) {
        if (!e[Hi])
          switch (t) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (o = e.getAttribute("rel"), o === "stylesheet" && e.hasAttribute("data-precedence"))
                break;
              if (o !== u.rel || e.getAttribute("href") !== (u.href == null || u.href === "" ? null : u.href) || e.getAttribute("crossorigin") !== (u.crossOrigin == null ? null : u.crossOrigin) || e.getAttribute("title") !== (u.title == null ? null : u.title))
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (o = e.getAttribute("src"), (o !== (u.src == null ? null : u.src) || e.getAttribute("type") !== (u.type == null ? null : u.type) || e.getAttribute("crossorigin") !== (u.crossOrigin == null ? null : u.crossOrigin)) && o && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                break;
              return e;
            default:
              return e;
          }
      } else if (t === "input" && e.type === "hidden") {
        var o = u.name == null ? null : "" + u.name;
        if (u.type === "hidden" && e.getAttribute("name") === o)
          return e;
      } else return e;
      if (e = Xt(e.nextSibling), e === null) break;
    }
    return null;
  }
  function dg(e, t, a) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !a || (e = Xt(e.nextSibling), e === null)) return null;
    return e;
  }
  function Ph(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Xt(e.nextSibling), e === null)) return null;
    return e;
  }
  function To(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function Ao(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function hg(e, t) {
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
  function Xt(e) {
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
  var Oo = null;
  function em(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var a = e.data;
        if (a === "/$" || a === "/&") {
          if (t === 0)
            return Xt(e.nextSibling);
          t--;
        } else
          a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function tm(e) {
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
  function nm(e, t, a) {
    switch (t = Gs(a), e) {
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
  function wl(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    Cu(e);
  }
  var Vt = /* @__PURE__ */ new Map(), am = /* @__PURE__ */ new Set();
  function Ys(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var An = Y.d;
  Y.d = {
    f: mg,
    r: pg,
    D: vg,
    C: yg,
    L: gg,
    m: bg,
    X: Sg,
    S: _g,
    M: zg
  };
  function mg() {
    var e = An.f(), t = Us();
    return e || t;
  }
  function pg(e) {
    var t = La(e);
    t !== null && t.tag === 5 && t.type === "form" ? _d(t) : An.r(e);
  }
  var Si = typeof document > "u" ? null : document;
  function im(e, t, a) {
    var l = Si;
    if (l && typeof t == "string" && t) {
      var u = Bt(t);
      u = 'link[rel="' + e + '"][href="' + u + '"]', typeof a == "string" && (u += '[crossorigin="' + a + '"]'), am.has(u) || (am.add(u), e = { rel: e, crossOrigin: a, href: t }, l.querySelector(u) === null && (t = l.createElement("link"), ct(t, "link", e), it(t), l.head.appendChild(t)));
    }
  }
  function vg(e) {
    An.D(e), im("dns-prefetch", e, null);
  }
  function yg(e, t) {
    An.C(e, t), im("preconnect", e, t);
  }
  function gg(e, t, a) {
    An.L(e, t, a);
    var l = Si;
    if (l && e && t) {
      var u = 'link[rel="preload"][as="' + Bt(t) + '"]';
      t === "image" && a && a.imageSrcSet ? (u += '[imagesrcset="' + Bt(
        a.imageSrcSet
      ) + '"]', typeof a.imageSizes == "string" && (u += '[imagesizes="' + Bt(
        a.imageSizes
      ) + '"]')) : u += '[href="' + Bt(e) + '"]';
      var o = u;
      switch (t) {
        case "style":
          o = zi(e);
          break;
        case "script":
          o = wi(e);
      }
      Vt.has(o) || (e = j(
        {
          rel: "preload",
          href: t === "image" && a && a.imageSrcSet ? void 0 : e,
          as: t
        },
        a
      ), Vt.set(o, e), l.querySelector(u) !== null || t === "style" && l.querySelector(xl(o)) || t === "script" && l.querySelector(jl(o)) || (t = l.createElement("link"), ct(t, "link", e), it(t), l.head.appendChild(t)));
    }
  }
  function bg(e, t) {
    An.m(e, t);
    var a = Si;
    if (a && e) {
      var l = t && typeof t.as == "string" ? t.as : "script", u = 'link[rel="modulepreload"][as="' + Bt(l) + '"][href="' + Bt(e) + '"]', o = u;
      switch (l) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          o = wi(e);
      }
      if (!Vt.has(o) && (e = j({ rel: "modulepreload", href: e }, t), Vt.set(o, e), a.querySelector(u) === null)) {
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (a.querySelector(jl(o)))
              return;
        }
        l = a.createElement("link"), ct(l, "link", e), it(l), a.head.appendChild(l);
      }
    }
  }
  function _g(e, t, a) {
    An.S(e, t, a);
    var l = Si;
    if (l && e) {
      var u = Ga(l).hoistableStyles, o = zi(e);
      t = t || "default";
      var d = u.get(o);
      if (!d) {
        var p = { loading: 0, preload: null };
        if (d = l.querySelector(
          xl(o)
        ))
          p.loading = 5;
        else {
          e = j(
            { rel: "stylesheet", href: e, "data-precedence": t },
            a
          ), (a = Vt.get(o)) && Co(e, a);
          var b = d = l.createElement("link");
          it(b), ct(b, "link", e), b._p = new Promise(function(T, D) {
            b.onload = T, b.onerror = D;
          }), b.addEventListener("load", function() {
            p.loading |= 1;
          }), b.addEventListener("error", function() {
            p.loading |= 2;
          }), p.loading |= 4, Ks(d, t, l);
        }
        d = {
          type: "stylesheet",
          instance: d,
          count: 1,
          state: p
        }, u.set(o, d);
      }
    }
  }
  function Sg(e, t) {
    An.X(e, t);
    var a = Si;
    if (a && e) {
      var l = Ga(a).hoistableScripts, u = wi(e), o = l.get(u);
      o || (o = a.querySelector(jl(u)), o || (e = j({ src: e, async: !0 }, t), (t = Vt.get(u)) && No(e, t), o = a.createElement("script"), it(o), ct(o, "link", e), a.head.appendChild(o)), o = {
        type: "script",
        instance: o,
        count: 1,
        state: null
      }, l.set(u, o));
    }
  }
  function zg(e, t) {
    An.M(e, t);
    var a = Si;
    if (a && e) {
      var l = Ga(a).hoistableScripts, u = wi(e), o = l.get(u);
      o || (o = a.querySelector(jl(u)), o || (e = j({ src: e, async: !0, type: "module" }, t), (t = Vt.get(u)) && No(e, t), o = a.createElement("script"), it(o), ct(o, "link", e), a.head.appendChild(o)), o = {
        type: "script",
        instance: o,
        count: 1,
        state: null
      }, l.set(u, o));
    }
  }
  function lm(e, t, a, l) {
    var u = (u = de.current) ? Ys(u) : null;
    if (!u) throw Error(r(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof a.precedence == "string" && typeof a.href == "string" ? (t = zi(a.href), a = Ga(
          u
        ).hoistableStyles, l = a.get(t), l || (l = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, a.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
          e = zi(a.href);
          var o = Ga(
            u
          ).hoistableStyles, d = o.get(e);
          if (d || (u = u.ownerDocument || u, d = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, o.set(e, d), (o = u.querySelector(
            xl(e)
          )) && !o._p && (d.instance = o, d.state.loading = 5), Vt.has(e) || (a = {
            rel: "preload",
            as: "style",
            href: a.href,
            crossOrigin: a.crossOrigin,
            integrity: a.integrity,
            media: a.media,
            hrefLang: a.hrefLang,
            referrerPolicy: a.referrerPolicy
          }, Vt.set(e, a), o || wg(
            u,
            e,
            a,
            d.state
          ))), t && l === null)
            throw Error(r(528, ""));
          return d;
        }
        if (t && l !== null)
          throw Error(r(529, ""));
        return null;
      case "script":
        return t = a.async, a = a.src, typeof a == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = wi(a), a = Ga(
          u
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
  function zi(e) {
    return 'href="' + Bt(e) + '"';
  }
  function xl(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function sm(e) {
    return j({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function wg(e, t, a, l) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? l.loading = 1 : (t = e.createElement("link"), l.preload = t, t.addEventListener("load", function() {
      return l.loading |= 1;
    }), t.addEventListener("error", function() {
      return l.loading |= 2;
    }), ct(t, "link", a), it(t), e.head.appendChild(t));
  }
  function wi(e) {
    return '[src="' + Bt(e) + '"]';
  }
  function jl(e) {
    return "script[async]" + e;
  }
  function um(e, t, a) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var l = e.querySelector(
            'style[data-href~="' + Bt(a.href) + '"]'
          );
          if (l)
            return t.instance = l, it(l), l;
          var u = j({}, a, {
            "data-href": a.href,
            "data-precedence": a.precedence,
            href: null,
            precedence: null
          });
          return l = (e.ownerDocument || e).createElement(
            "style"
          ), it(l), ct(l, "style", u), Ks(l, a.precedence, e), t.instance = l;
        case "stylesheet":
          u = zi(a.href);
          var o = e.querySelector(
            xl(u)
          );
          if (o)
            return t.state.loading |= 4, t.instance = o, it(o), o;
          l = sm(a), (u = Vt.get(u)) && Co(l, u), o = (e.ownerDocument || e).createElement("link"), it(o);
          var d = o;
          return d._p = new Promise(function(p, b) {
            d.onload = p, d.onerror = b;
          }), ct(o, "link", l), t.state.loading |= 4, Ks(o, a.precedence, e), t.instance = o;
        case "script":
          return o = wi(a.src), (u = e.querySelector(
            jl(o)
          )) ? (t.instance = u, it(u), u) : (l = a, (u = Vt.get(o)) && (l = j({}, a), No(l, u)), e = e.ownerDocument || e, u = e.createElement("script"), it(u), ct(u, "link", l), e.head.appendChild(u), t.instance = u);
        case "void":
          return null;
        default:
          throw Error(r(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (l = t.instance, t.state.loading |= 4, Ks(l, a.precedence, e));
    return t.instance;
  }
  function Ks(e, t, a) {
    for (var l = a.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), u = l.length ? l[l.length - 1] : null, o = u, d = 0; d < l.length; d++) {
      var p = l[d];
      if (p.dataset.precedence === t) o = p;
      else if (o !== u) break;
    }
    o ? o.parentNode.insertBefore(e, o.nextSibling) : (t = a.nodeType === 9 ? a.head : a, t.insertBefore(e, t.firstChild));
  }
  function Co(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function No(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var Xs = null;
  function rm(e, t, a) {
    if (Xs === null) {
      var l = /* @__PURE__ */ new Map(), u = Xs = /* @__PURE__ */ new Map();
      u.set(a, l);
    } else
      u = Xs, l = u.get(a), l || (l = /* @__PURE__ */ new Map(), u.set(a, l));
    if (l.has(e)) return l;
    for (l.set(e, null), a = a.getElementsByTagName(e), u = 0; u < a.length; u++) {
      var o = a[u];
      if (!(o[Hi] || o[st] || e === "link" && o.getAttribute("rel") === "stylesheet") && o.namespaceURI !== "http://www.w3.org/2000/svg") {
        var d = o.getAttribute(t) || "";
        d = e + d;
        var p = l.get(d);
        p ? p.push(o) : l.set(d, [o]);
      }
    }
    return l;
  }
  function om(e, t, a) {
    e = e.ownerDocument || e, e.head.insertBefore(
      a,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function xg(e, t, a) {
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
  function cm(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function jg(e, t, a, l) {
    if (a.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== !1) && (a.state.loading & 4) === 0) {
      if (a.instance === null) {
        var u = zi(l.href), o = t.querySelector(
          xl(u)
        );
        if (o) {
          t = o._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = Vs.bind(e), t.then(e, e)), a.state.loading |= 4, a.instance = o, it(o);
          return;
        }
        o = t.ownerDocument || t, l = sm(l), (u = Vt.get(u)) && Co(l, u), o = o.createElement("link"), it(o);
        var d = o;
        d._p = new Promise(function(p, b) {
          d.onload = p, d.onerror = b;
        }), ct(o, "link", l), a.instance = o;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(a, t), (t = a.state.preload) && (a.state.loading & 3) === 0 && (e.count++, a = Vs.bind(e), t.addEventListener("load", a), t.addEventListener("error", a));
    }
  }
  var Mo = 0;
  function Eg(e, t) {
    return e.stylesheets && e.count === 0 && Fs(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(a) {
      var l = setTimeout(function() {
        if (e.stylesheets && Fs(e, e.stylesheets), e.unsuspend) {
          var o = e.unsuspend;
          e.unsuspend = null, o();
        }
      }, 6e4 + t);
      0 < e.imgBytes && Mo === 0 && (Mo = 62500 * sg());
      var u = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Fs(e, e.stylesheets), e.unsuspend)) {
            var o = e.unsuspend;
            e.unsuspend = null, o();
          }
        },
        (e.imgBytes > Mo ? 50 : 800) + t
      );
      return e.unsuspend = a, function() {
        e.unsuspend = null, clearTimeout(l), clearTimeout(u);
      };
    } : null;
  }
  function Vs() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Fs(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var Js = null;
  function Fs(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, Js = /* @__PURE__ */ new Map(), t.forEach(Tg, e), Js = null, Vs.call(e));
  }
  function Tg(e, t) {
    if (!(t.state.loading & 4)) {
      var a = Js.get(e);
      if (a) var l = a.get(null);
      else {
        a = /* @__PURE__ */ new Map(), Js.set(e, a);
        for (var u = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), o = 0; o < u.length; o++) {
          var d = u[o];
          (d.nodeName === "LINK" || d.getAttribute("media") !== "not all") && (a.set(d.dataset.precedence, d), l = d);
        }
        l && a.set(null, l);
      }
      u = t.instance, d = u.getAttribute("data-precedence"), o = a.get(d) || l, o === l && a.set(null, u), a.set(d, u), this.count++, l = Vs.bind(this), u.addEventListener("load", l), u.addEventListener("error", l), o ? o.parentNode.insertBefore(u, o.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(u, e.firstChild)), t.state.loading |= 4;
    }
  }
  var El = {
    $$typeof: G,
    Provider: null,
    Consumer: null,
    _currentValue: V,
    _currentValue2: V,
    _threadCount: 0
  };
  function Ag(e, t, a, l, u, o, d, p, b) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Eu(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Eu(0), this.hiddenUpdates = Eu(null), this.identifierPrefix = l, this.onUncaughtError = u, this.onCaughtError = o, this.onRecoverableError = d, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = b, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function fm(e, t, a, l, u, o, d, p, b, T, D, Q) {
    return e = new Ag(
      e,
      t,
      a,
      d,
      b,
      T,
      D,
      Q,
      p
    ), t = 1, o === !0 && (t |= 24), o = Ot(3, null, null, t), e.current = o, o.stateNode = e, t = cr(), t.refCount++, e.pooledCache = t, t.refCount++, o.memoizedState = {
      element: l,
      isDehydrated: a,
      cache: t
    }, mr(o), e;
  }
  function dm(e) {
    return e ? (e = ei, e) : ei;
  }
  function hm(e, t, a, l, u, o) {
    u = dm(u), l.context === null ? l.context = u : l.pendingContext = u, l = Gn(t), l.payload = { element: a }, o = o === void 0 ? null : o, o !== null && (l.callback = o), a = Yn(e, l, t), a !== null && (wt(a, e, t), il(a, e, t));
  }
  function mm(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var a = e.retryLane;
      e.retryLane = a !== 0 && a < t ? a : t;
    }
  }
  function Do(e, t) {
    mm(e, t), (e = e.alternate) && mm(e, t);
  }
  function pm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = _a(e, 67108864);
      t !== null && wt(t, e, 67108864), Do(e, 67108864);
    }
  }
  function vm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Rt();
      t = Tu(t);
      var a = _a(e, t);
      a !== null && wt(a, e, t), Do(e, t);
    }
  }
  var Is = !0;
  function Og(e, t, a, l) {
    var u = M.T;
    M.T = null;
    var o = Y.p;
    try {
      Y.p = 2, Ro(e, t, a, l);
    } finally {
      Y.p = o, M.T = u;
    }
  }
  function Cg(e, t, a, l) {
    var u = M.T;
    M.T = null;
    var o = Y.p;
    try {
      Y.p = 8, Ro(e, t, a, l);
    } finally {
      Y.p = o, M.T = u;
    }
  }
  function Ro(e, t, a, l) {
    if (Is) {
      var u = qo(l);
      if (u === null)
        _o(
          e,
          t,
          l,
          Ws,
          a
        ), gm(e, l);
      else if (Mg(
        u,
        e,
        t,
        a,
        l
      ))
        l.stopPropagation();
      else if (gm(e, l), t & 4 && -1 < Ng.indexOf(e)) {
        for (; u !== null; ) {
          var o = La(u);
          if (o !== null)
            switch (o.tag) {
              case 3:
                if (o = o.stateNode, o.current.memoizedState.isDehydrated) {
                  var d = pa(o.pendingLanes);
                  if (d !== 0) {
                    var p = o;
                    for (p.pendingLanes |= 2, p.entangledLanes |= 2; d; ) {
                      var b = 1 << 31 - Tt(d);
                      p.entanglements[1] |= b, d &= ~b;
                    }
                    on(o), (Ae & 6) === 0 && (Rs = ht() + 500, _l(0));
                  }
                }
                break;
              case 31:
              case 13:
                p = _a(o, 2), p !== null && wt(p, o, 2), Us(), Do(o, 2);
            }
          if (o = qo(l), o === null && _o(
            e,
            t,
            l,
            Ws,
            a
          ), o === u) break;
          u = o;
        }
        u !== null && l.stopPropagation();
      } else
        _o(
          e,
          t,
          l,
          null,
          a
        );
    }
  }
  function qo(e) {
    return e = Uu(e), Uo(e);
  }
  var Ws = null;
  function Uo(e) {
    if (Ws = null, e = $a(e), e !== null) {
      var t = m(e);
      if (t === null) e = null;
      else {
        var a = t.tag;
        if (a === 13) {
          if (e = h(t), e !== null) return e;
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
    return Ws = e, null;
  }
  function ym(e) {
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
        switch (kl()) {
          case Bl:
            return 2;
          case Hl:
            return 8;
          case Ba:
          case k:
            return 32;
          case ye:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var Zo = !1, na = null, aa = null, ia = null, Tl = /* @__PURE__ */ new Map(), Al = /* @__PURE__ */ new Map(), la = [], Ng = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function gm(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        na = null;
        break;
      case "dragenter":
      case "dragleave":
        aa = null;
        break;
      case "mouseover":
      case "mouseout":
        ia = null;
        break;
      case "pointerover":
      case "pointerout":
        Tl.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Al.delete(t.pointerId);
    }
  }
  function Ol(e, t, a, l, u, o) {
    return e === null || e.nativeEvent !== o ? (e = {
      blockedOn: t,
      domEventName: a,
      eventSystemFlags: l,
      nativeEvent: o,
      targetContainers: [u]
    }, t !== null && (t = La(t), t !== null && pm(t)), e) : (e.eventSystemFlags |= l, t = e.targetContainers, u !== null && t.indexOf(u) === -1 && t.push(u), e);
  }
  function Mg(e, t, a, l, u) {
    switch (t) {
      case "focusin":
        return na = Ol(
          na,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "dragenter":
        return aa = Ol(
          aa,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "mouseover":
        return ia = Ol(
          ia,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "pointerover":
        var o = u.pointerId;
        return Tl.set(
          o,
          Ol(
            Tl.get(o) || null,
            e,
            t,
            a,
            l,
            u
          )
        ), !0;
      case "gotpointercapture":
        return o = u.pointerId, Al.set(
          o,
          Ol(
            Al.get(o) || null,
            e,
            t,
            a,
            l,
            u
          )
        ), !0;
    }
    return !1;
  }
  function bm(e) {
    var t = $a(e.target);
    if (t !== null) {
      var a = m(t);
      if (a !== null) {
        if (t = a.tag, t === 13) {
          if (t = h(a), t !== null) {
            e.blockedOn = t, Mc(e.priority, function() {
              vm(a);
            });
            return;
          }
        } else if (t === 31) {
          if (t = v(a), t !== null) {
            e.blockedOn = t, Mc(e.priority, function() {
              vm(a);
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
  function Ps(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var a = qo(e.nativeEvent);
      if (a === null) {
        a = e.nativeEvent;
        var l = new a.constructor(
          a.type,
          a
        );
        qu = l, a.target.dispatchEvent(l), qu = null;
      } else
        return t = La(a), t !== null && pm(t), e.blockedOn = a, !1;
      t.shift();
    }
    return !0;
  }
  function _m(e, t, a) {
    Ps(e) && a.delete(t);
  }
  function Dg() {
    Zo = !1, na !== null && Ps(na) && (na = null), aa !== null && Ps(aa) && (aa = null), ia !== null && Ps(ia) && (ia = null), Tl.forEach(_m), Al.forEach(_m);
  }
  function eu(e, t) {
    e.blockedOn === t && (e.blockedOn = null, Zo || (Zo = !0, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      Dg
    )));
  }
  var tu = null;
  function Sm(e) {
    tu !== e && (tu = e, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      function() {
        tu === e && (tu = null);
        for (var t = 0; t < e.length; t += 3) {
          var a = e[t], l = e[t + 1], u = e[t + 2];
          if (typeof l != "function") {
            if (Uo(l || a) === null)
              continue;
            break;
          }
          var o = La(a);
          o !== null && (e.splice(t, 3), t -= 3, Rr(
            o,
            {
              pending: !0,
              data: u,
              method: a.method,
              action: l
            },
            l,
            u
          ));
        }
      }
    ));
  }
  function xi(e) {
    function t(b) {
      return eu(b, e);
    }
    na !== null && eu(na, e), aa !== null && eu(aa, e), ia !== null && eu(ia, e), Tl.forEach(t), Al.forEach(t);
    for (var a = 0; a < la.length; a++) {
      var l = la[a];
      l.blockedOn === e && (l.blockedOn = null);
    }
    for (; 0 < la.length && (a = la[0], a.blockedOn === null); )
      bm(a), a.blockedOn === null && la.shift();
    if (a = (e.ownerDocument || e).$$reactFormReplay, a != null)
      for (l = 0; l < a.length; l += 3) {
        var u = a[l], o = a[l + 1], d = u[yt] || null;
        if (typeof o == "function")
          d || Sm(a);
        else if (d) {
          var p = null;
          if (o && o.hasAttribute("formAction")) {
            if (u = o, d = o[yt] || null)
              p = d.formAction;
            else if (Uo(u) !== null) continue;
          } else p = d.action;
          typeof p == "function" ? a[l + 1] = p : (a.splice(l, 3), l -= 3), Sm(a);
        }
      }
  }
  function zm() {
    function e(o) {
      o.canIntercept && o.info === "react-transition" && o.intercept({
        handler: function() {
          return new Promise(function(d) {
            return u = d;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      u !== null && (u(), u = null), l || setTimeout(a, 20);
    }
    function a() {
      if (!l && !navigation.transition) {
        var o = navigation.currentEntry;
        o && o.url != null && navigation.navigate(o.url, {
          state: o.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var l = !1, u = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(a, 100), function() {
        l = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), u !== null && (u(), u = null);
      };
    }
  }
  function Qo(e) {
    this._internalRoot = e;
  }
  nu.prototype.render = Qo.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(r(409));
    var a = t.current, l = Rt();
    hm(a, l, e, t, null, null);
  }, nu.prototype.unmount = Qo.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      hm(e.current, 2, null, e, null, null), Us(), t[Ha] = null;
    }
  };
  function nu(e) {
    this._internalRoot = e;
  }
  nu.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = Nc();
      e = { blockedOn: null, target: e, priority: t };
      for (var a = 0; a < la.length && t !== 0 && t < la[a].priority; a++) ;
      la.splice(a, 0, e), a === 0 && bm(e);
    }
  };
  var wm = i.version;
  if (wm !== "19.2.7")
    throw Error(
      r(
        527,
        wm,
        "19.2.7"
      )
    );
  Y.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(r(188)) : (e = Object.keys(e).join(","), Error(r(268, e)));
    return e = g(t), e = e !== null ? _(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Rg = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: M,
    reconcilerVersion: "19.2.7"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var au = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!au.isDisabled && au.supportsFiber)
      try {
        Qt = au.inject(
          Rg
        ), Et = au;
      } catch {
      }
  }
  return Nl.createRoot = function(e, t) {
    if (!c(e)) throw Error(r(299));
    var a = !1, l = "", u = Cd, o = Nd, d = Md;
    return t != null && (t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (l = t.identifierPrefix), t.onUncaughtError !== void 0 && (u = t.onUncaughtError), t.onCaughtError !== void 0 && (o = t.onCaughtError), t.onRecoverableError !== void 0 && (d = t.onRecoverableError)), t = fm(
      e,
      1,
      !1,
      null,
      null,
      a,
      l,
      null,
      u,
      o,
      d,
      zm
    ), e[Ha] = t.current, bo(e), new Qo(t);
  }, Nl.hydrateRoot = function(e, t, a) {
    if (!c(e)) throw Error(r(299));
    var l = !1, u = "", o = Cd, d = Nd, p = Md, b = null;
    return a != null && (a.unstable_strictMode === !0 && (l = !0), a.identifierPrefix !== void 0 && (u = a.identifierPrefix), a.onUncaughtError !== void 0 && (o = a.onUncaughtError), a.onCaughtError !== void 0 && (d = a.onCaughtError), a.onRecoverableError !== void 0 && (p = a.onRecoverableError), a.formState !== void 0 && (b = a.formState)), t = fm(
      e,
      1,
      !0,
      t,
      a ?? null,
      l,
      u,
      b,
      o,
      d,
      p,
      zm
    ), t.context = dm(null), a = t.current, l = Rt(), l = Tu(l), u = Gn(l), u.callback = null, Yn(a, u, l), a = l, t.current.lanes = a, Bi(t, a), on(t), e[Ha] = t.current, bo(e), new nu(t);
  }, Nl.version = "19.2.7", Nl;
}
var Dm;
function Gg() {
  if (Dm) return Bo.exports;
  Dm = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Bo.exports = Lg(), Bo.exports;
}
var Yg = Gg(), J = oc(), Ni = class {
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
}, Kg = class extends Ni {
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
}, cc = new Kg(), Xg = {
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
}, Vg = class {
  // We cannot have TimeoutManager<T> as we must instantiate it with a concrete
  // type at app boot; and if we leave that type, then any new timer provider
  // would need to support the default provider's concrete timer ID, which is
  // infeasible across environments.
  //
  // We settle for type safety for the TimeoutProvider type, and accept that
  // this class is unsafe internally to allow for extension.
  #e = Xg;
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
}, Da = new Vg();
function Jg(n) {
  setTimeout(n, 0);
}
var Fg = typeof window > "u" || "Deno" in globalThis;
function vt() {
}
function Ig(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Jo(n) {
  return typeof n == "number" && n >= 0 && n !== 1 / 0;
}
function wp(n, i) {
  return Math.max(n + (i || 0) - Date.now(), 0);
}
function oa(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Ut(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Rm(n, i) {
  const {
    type: s = "all",
    exact: r,
    fetchStatus: c,
    predicate: m,
    queryKey: h,
    stale: v
  } = n;
  if (h) {
    if (r) {
      if (i.queryHash !== fc(h, i.options))
        return !1;
    } else if (!Rl(i.queryKey, h))
      return !1;
  }
  if (s !== "all") {
    const y = i.isActive();
    if (s === "active" && !y || s === "inactive" && y)
      return !1;
  }
  return !(typeof v == "boolean" && i.isStale() !== v || c && c !== i.state.fetchStatus || m && !m(i));
}
function qm(n, i) {
  const { exact: s, status: r, predicate: c, mutationKey: m } = n;
  if (m) {
    if (!i.options.mutationKey)
      return !1;
    if (s) {
      if (Ra(i.options.mutationKey) !== Ra(m))
        return !1;
    } else if (!Rl(i.options.mutationKey, m))
      return !1;
  }
  return !(r && i.state.status !== r || c && !c(i));
}
function fc(n, i) {
  return (i?.queryKeyHashFn || Ra)(n);
}
function Ra(n) {
  return JSON.stringify(
    n,
    (i, s) => Fo(s) ? Object.keys(s).sort().reduce((r, c) => (r[c] = s[c], r), {}) : s
  );
}
function Rl(n, i) {
  return n === i ? !0 : typeof n != typeof i ? !1 : n && i && typeof n == "object" && typeof i == "object" ? Object.keys(i).every((s) => Rl(n[s], i[s])) : !1;
}
var Wg = Object.prototype.hasOwnProperty;
function xp(n, i, s = 0) {
  if (n === i)
    return n;
  if (s > 500) return i;
  const r = Um(n) && Um(i);
  if (!r && !(Fo(n) && Fo(i))) return i;
  const m = (r ? n : Object.keys(n)).length, h = r ? i : Object.keys(i), v = h.length, y = r ? new Array(v) : {};
  let g = 0;
  for (let _ = 0; _ < v; _++) {
    const j = r ? _ : h[_], z = n[j], O = i[j];
    if (z === O) {
      y[j] = z, (r ? _ < m : Wg.call(n, j)) && g++;
      continue;
    }
    if (z === null || O === null || typeof z != "object" || typeof O != "object") {
      y[j] = O;
      continue;
    }
    const N = xp(z, O, s + 1);
    y[j] = N, N === z && g++;
  }
  return m === v && g === m ? n : y;
}
function fu(n, i) {
  if (!i || Object.keys(n).length !== Object.keys(i).length)
    return !1;
  for (const s in n)
    if (n[s] !== i[s])
      return !1;
  return !0;
}
function Um(n) {
  return Array.isArray(n) && n.length === Object.keys(n).length;
}
function Fo(n) {
  if (!Zm(n))
    return !1;
  const i = n.constructor;
  if (i === void 0)
    return !0;
  const s = i.prototype;
  return !(!Zm(s) || !s.hasOwnProperty("isPrototypeOf") || Object.getPrototypeOf(n) !== Object.prototype);
}
function Zm(n) {
  return Object.prototype.toString.call(n) === "[object Object]";
}
function Pg(n) {
  return new Promise((i) => {
    Da.setTimeout(i, n);
  });
}
function Io(n, i, s) {
  return typeof s.structuralSharing == "function" ? s.structuralSharing(n, i) : s.structuralSharing !== !1 ? xp(n, i) : i;
}
function eb(n, i, s = 0) {
  const r = [...n, i];
  return s && r.length > s ? r.slice(1) : r;
}
function tb(n, i, s = 0) {
  const r = [i, ...n];
  return s && r.length > s ? r.slice(0, -1) : r;
}
var dc = /* @__PURE__ */ Symbol();
function jp(n, i) {
  return !n.queryFn && i?.initialPromise ? () => i.initialPromise : !n.queryFn || n.queryFn === dc ? () => Promise.reject(new Error(`Missing queryFn: '${n.queryHash}'`)) : n.queryFn;
}
function hc(n, i) {
  return typeof n == "function" ? n(...i) : !!n;
}
function nb(n, i, s) {
  let r = !1, c;
  return Object.defineProperty(n, "signal", {
    enumerable: !0,
    get: () => (c ??= i(), r || (r = !0, c.aborted ? s() : c.addEventListener("abort", s, { once: !0 })), c)
  }), n;
}
var ql = /* @__PURE__ */ (() => {
  let n = () => Fg;
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
function Wo() {
  let n, i;
  const s = new Promise((c, m) => {
    n = c, i = m;
  });
  s.status = "pending", s.catch(() => {
  });
  function r(c) {
    Object.assign(s, c), delete s.resolve, delete s.reject;
  }
  return s.resolve = (c) => {
    r({
      status: "fulfilled",
      value: c
    }), n(c);
  }, s.reject = (c) => {
    r({
      status: "rejected",
      reason: c
    }), i(c);
  }, s;
}
var ab = Jg;
function ib() {
  let n = [], i = 0, s = (v) => {
    v();
  }, r = (v) => {
    v();
  }, c = ab;
  const m = (v) => {
    i ? n.push(v) : c(() => {
      s(v);
    });
  }, h = () => {
    const v = n;
    n = [], v.length && c(() => {
      r(() => {
        v.forEach((y) => {
          s(y);
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
        i--, i || h();
      }
      return y;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (v) => (...y) => {
      m(() => {
        v(...y);
      });
    },
    schedule: m,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (v) => {
      s = v;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (v) => {
      r = v;
    },
    setScheduler: (v) => {
      c = v;
    }
  };
}
var nt = ib(), lb = class extends Ni {
  #e = !0;
  #t;
  #n;
  constructor() {
    super(), this.#n = (n) => {
      if (typeof window < "u" && window.addEventListener) {
        const i = () => n(!0), s = () => n(!1);
        return window.addEventListener("online", i, !1), window.addEventListener("offline", s, !1), () => {
          window.removeEventListener("online", i), window.removeEventListener("offline", s);
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
    this.#e !== n && (this.#e = n, this.listeners.forEach((s) => {
      s(n);
    }));
  }
  isOnline() {
    return this.#e;
  }
}, du = new lb();
function sb(n) {
  return Math.min(1e3 * 2 ** n, 3e4);
}
function Ep(n) {
  return (n ?? "online") === "online" ? du.isOnline() : !0;
}
var Po = class extends Error {
  constructor(n) {
    super("CancelledError"), this.revert = n?.revert, this.silent = n?.silent;
  }
};
function Tp(n) {
  let i = !1, s = 0, r;
  const c = Wo(), m = () => c.status !== "pending", h = (B) => {
    if (!m()) {
      const X = new Po(B);
      z(X), n.onCancel?.(X);
    }
  }, v = () => {
    i = !0;
  }, y = () => {
    i = !1;
  }, g = () => cc.isFocused() && (n.networkMode === "always" || du.isOnline()) && n.canRun(), _ = () => Ep(n.networkMode) && n.canRun(), j = (B) => {
    m() || (r?.(), c.resolve(B));
  }, z = (B) => {
    m() || (r?.(), c.reject(B));
  }, O = () => new Promise((B) => {
    r = (X) => {
      (m() || g()) && B(X);
    }, n.onPause?.();
  }).then(() => {
    r = void 0, m() || n.onContinue?.();
  }), N = () => {
    if (m())
      return;
    let B;
    const X = s === 0 ? n.initialPromise : void 0;
    try {
      B = X ?? n.fn();
    } catch ($) {
      B = Promise.reject($);
    }
    Promise.resolve(B).then(j).catch(($) => {
      if (m())
        return;
      const ae = n.retry ?? (ql.isServer() ? 0 : 3), G = n.retryDelay ?? sb, P = typeof G == "function" ? G(s, $) : G, ie = ae === !0 || typeof ae == "number" && s < ae || typeof ae == "function" && ae(s, $);
      if (i || !ie) {
        z($);
        return;
      }
      s++, n.onFail?.(s, $), Pg(P).then(() => g() ? void 0 : O()).then(() => {
        i ? z($) : N();
      });
    });
  };
  return {
    promise: c,
    status: () => c.status,
    cancel: h,
    continue: () => (r?.(), c),
    cancelRetry: v,
    continueRetry: y,
    canStart: _,
    start: () => (_() ? N() : O().then(N), c)
  };
}
var Ap = class {
  #e;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout(), Jo(this.gcTime) && (this.#e = Da.setTimeout(() => {
      this.optionalRemove();
    }, this.gcTime));
  }
  updateGcTime(n) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      n ?? (ql.isServer() ? 1 / 0 : 300 * 1e3)
    );
  }
  clearGcTimeout() {
    this.#e !== void 0 && (Da.clearTimeout(this.#e), this.#e = void 0);
  }
};
function ub(n) {
  return {
    onFetch: (i, s) => {
      const r = i.options, c = i.fetchOptions?.meta?.fetchMore?.direction, m = i.state.data?.pages || [], h = i.state.data?.pageParams || [];
      let v = { pages: [], pageParams: [] }, y = 0;
      const g = async () => {
        let _ = !1;
        const j = (N) => {
          nb(
            N,
            () => i.signal,
            () => _ = !0
          );
        }, z = jp(i.options, i.fetchOptions), O = async (N, B, X) => {
          if (_)
            return Promise.reject(i.signal.reason);
          if (B == null && N.pages.length)
            return Promise.resolve(N);
          const ae = (() => {
            const ce = {
              client: i.client,
              queryKey: i.queryKey,
              pageParam: B,
              direction: X ? "backward" : "forward",
              meta: i.options.meta
            };
            return j(ce), ce;
          })(), G = await z(ae), { maxPages: P } = i.options, ie = X ? tb : eb;
          return {
            pages: ie(N.pages, G, P),
            pageParams: ie(N.pageParams, B, P)
          };
        };
        if (c && m.length) {
          const N = c === "backward", B = N ? rb : Qm, X = {
            pages: m,
            pageParams: h
          }, $ = B(r, X);
          v = await O(X, $, N);
        } else {
          const N = n ?? m.length;
          do {
            const B = y === 0 ? h[0] ?? r.initialPageParam : Qm(r, v);
            if (y > 0 && B == null)
              break;
            v = await O(v, B), y++;
          } while (y < N);
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
        s
      ) : i.fetchFn = g;
    }
  };
}
function Qm(n, { pages: i, pageParams: s }) {
  const r = i.length - 1;
  return i.length > 0 ? n.getNextPageParam(
    i[r],
    i,
    s[r],
    s
  ) : void 0;
}
function rb(n, { pages: i, pageParams: s }) {
  return i.length > 0 ? n.getPreviousPageParam?.(i[0], i, s[0], s) : void 0;
}
var ob = class extends Ap {
  #e;
  #t;
  #n;
  #a;
  #l;
  #i;
  #u;
  #s;
  constructor(n) {
    super(), this.#s = !1, this.#u = n.defaultOptions, this.setOptions(n.options), this.observers = [], this.#l = n.client, this.#a = this.#l.getQueryCache(), this.queryKey = n.queryKey, this.queryHash = n.queryHash, this.#t = Bm(this.options), this.state = n.state ?? this.#t, this.scheduleGc();
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
    if (this.options = { ...this.#u, ...n }, n?._type && (this.#e = n._type), this.updateGcTime(this.options.gcTime), this.state && this.state.data === void 0) {
      const i = Bm(this.options);
      i.data !== void 0 && (this.setState(
        km(i.data, i.dataUpdatedAt)
      ), this.#t = i);
    }
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && this.#a.remove(this);
  }
  setData(n, i) {
    const s = Io(this.state.data, n, this.options);
    return this.#r({
      data: s,
      type: "success",
      dataUpdatedAt: i?.updatedAt,
      manual: i?.manual
    }), s;
  }
  setState(n) {
    this.#r({ type: "setState", state: n });
  }
  cancel(n) {
    const i = this.#i?.promise;
    return this.#i?.cancel(n), i ? i.then(vt).catch(vt) : Promise.resolve();
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
      (n) => Ut(n.options.enabled, this) !== !1
    );
  }
  isDisabled() {
    return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === dc || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => oa(n.options.staleTime, this) === "static"
    ) : !1;
  }
  isStale() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => n.getCurrentResult().isStale
    ) : this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(n = 0) {
    return this.state.data === void 0 ? !0 : n === "static" ? !1 : this.state.isInvalidated ? !0 : !wp(this.state.dataUpdatedAt, n);
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
    this.observers.includes(n) && (this.observers = this.observers.filter((i) => i !== n), this.observers.length || (this.#i && (this.#s || this.#c() ? this.#i.cancel({ revert: !0 }) : this.#i.cancelRetry()), this.scheduleGc()), this.#a.notify({ type: "observerRemoved", query: this, observer: n }));
  }
  getObserversCount() {
    return this.observers.length;
  }
  #c() {
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
    const s = new AbortController(), r = (y) => {
      Object.defineProperty(y, "signal", {
        enumerable: !0,
        get: () => (this.#s = !0, s.signal)
      });
    }, c = () => {
      const y = jp(this.options, i), _ = (() => {
        const j = {
          client: this.#l,
          queryKey: this.queryKey,
          meta: this.meta
        };
        return r(j), j;
      })();
      return this.#s = !1, this.options.persister ? this.options.persister(
        y,
        _,
        this
      ) : y(_);
    }, h = (() => {
      const y = {
        fetchOptions: i,
        options: this.options,
        queryKey: this.queryKey,
        client: this.#l,
        state: this.state,
        fetchFn: c
      };
      return r(y), y;
    })();
    (this.#e === "infinite" ? ub(
      this.options.pages
    ) : this.options.behavior)?.onFetch(h, this), this.#n = this.state, (this.state.fetchStatus === "idle" || this.state.fetchMeta !== h.fetchOptions?.meta) && this.#r({ type: "fetch", meta: h.fetchOptions?.meta }), this.#i = Tp({
      initialPromise: i?.initialPromise,
      fn: h.fetchFn,
      onCancel: (y) => {
        y instanceof Po && y.revert && this.setState({
          ...this.#n,
          fetchStatus: "idle"
        }), s.abort();
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
      retry: h.options.retry,
      retryDelay: h.options.retryDelay,
      networkMode: h.options.networkMode,
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
      if (y instanceof Po) {
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
    const i = (s) => {
      switch (n.type) {
        case "failed":
          return {
            ...s,
            fetchFailureCount: n.failureCount,
            fetchFailureReason: n.error
          };
        case "pause":
          return {
            ...s,
            fetchStatus: "paused"
          };
        case "continue":
          return {
            ...s,
            fetchStatus: "fetching"
          };
        case "fetch":
          return {
            ...s,
            ...Op(s.data, this.options),
            fetchMeta: n.meta ?? null
          };
        case "success":
          const r = {
            ...s,
            ...km(n.data, n.dataUpdatedAt),
            dataUpdateCount: s.dataUpdateCount + 1,
            ...!n.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null
            }
          };
          return this.#n = n.manual ? r : void 0, r;
        case "error":
          const c = n.error;
          return {
            ...s,
            error: c,
            errorUpdateCount: s.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: s.fetchFailureCount + 1,
            fetchFailureReason: c,
            fetchStatus: "idle",
            status: "error",
            // flag existing data as invalidated if we get a background error
            // note that "no data" always means stale so we can set unconditionally here
            isInvalidated: !0
          };
        case "invalidate":
          return {
            ...s,
            isInvalidated: !0
          };
        case "setState":
          return {
            ...s,
            ...n.state
          };
      }
    };
    this.state = i(this.state), nt.batch(() => {
      this.observers.forEach((s) => {
        s.onQueryUpdate();
      }), this.#a.notify({ query: this, type: "updated", action: n });
    });
  }
};
function Op(n, i) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: Ep(i.networkMode) ? "fetching" : "paused",
    ...n === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function km(n, i) {
  return {
    data: n,
    dataUpdatedAt: i ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: "success"
  };
}
function Bm(n) {
  const i = typeof n.initialData == "function" ? n.initialData() : n.initialData, s = i !== void 0, r = s ? typeof n.initialDataUpdatedAt == "function" ? n.initialDataUpdatedAt() : n.initialDataUpdatedAt : 0;
  return {
    data: i,
    dataUpdateCount: 0,
    dataUpdatedAt: s ? r ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: s ? "success" : "pending",
    fetchStatus: "idle"
  };
}
var cb = class extends Ni {
  constructor(n, i) {
    super(), this.options = i, this.#e = n, this.#s = null, this.#u = Wo(), this.bindMethods(), this.setOptions(i);
  }
  #e;
  #t = void 0;
  #n = void 0;
  #a = void 0;
  #l;
  #i;
  #u;
  #s;
  #c;
  #r;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #m;
  #f;
  #d;
  #o;
  #p = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    this.listeners.size === 1 && (this.#t.addObserver(this), Hm(this.#t, this.options) ? this.#h() : this.updateResult(), this.#b());
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return ec(
      this.#t,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return ec(
      this.#t,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set(), this.#_(), this.#S(), this.#t.removeObserver(this);
  }
  setOptions(n) {
    const i = this.options, s = this.#t;
    if (this.options = this.#e.defaultQueryOptions(n), this.options.enabled !== void 0 && typeof this.options.enabled != "boolean" && typeof this.options.enabled != "function" && typeof Ut(this.options.enabled, this.#t) != "boolean")
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    this.#z(), this.#t.setOptions(this.options), i._defaulted && !fu(this.options, i) && this.#e.getQueryCache().notify({
      type: "observerOptionsUpdated",
      query: this.#t,
      observer: this
    });
    const r = this.hasListeners();
    r && $m(
      this.#t,
      s,
      this.options,
      i
    ) && this.#h(), this.updateResult(), r && (this.#t !== s || Ut(this.options.enabled, this.#t) !== Ut(i.enabled, this.#t) || oa(this.options.staleTime, this.#t) !== oa(i.staleTime, this.#t)) && this.#v();
    const c = this.#y();
    r && (this.#t !== s || Ut(this.options.enabled, this.#t) !== Ut(i.enabled, this.#t) || c !== this.#o) && this.#g(c);
  }
  getOptimisticResult(n) {
    const i = this.#e.getQueryCache().build(this.#e, n), s = this.createResult(i, n);
    return db(this, s) && (this.#a = s, this.#i = this.options, this.#l = this.#t.state), s;
  }
  getCurrentResult() {
    return this.#a;
  }
  trackResult(n, i) {
    return new Proxy(n, {
      get: (s, r) => (this.trackProp(r), i?.(r), r === "promise" && (this.trackProp("data"), !this.options.experimental_prefetchInRender && this.#u.status === "pending" && this.#u.reject(
        new Error(
          "experimental_prefetchInRender feature flag is not enabled"
        )
      )), Reflect.get(s, r))
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
    const i = this.#e.defaultQueryOptions(n), s = this.#e.getQueryCache().build(this.#e, i);
    return s.fetch().then(() => this.createResult(s, i));
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
    return n?.throwOnError || (i = i.catch(vt)), i;
  }
  #v() {
    this.#_();
    const n = oa(
      this.options.staleTime,
      this.#t
    );
    if (ql.isServer() || this.#a.isStale || !Jo(n))
      return;
    const s = wp(this.#a.dataUpdatedAt, n) + 1;
    this.#f = Da.setTimeout(() => {
      this.#a.isStale || this.updateResult();
    }, s);
  }
  #y() {
    return (typeof this.options.refetchInterval == "function" ? this.options.refetchInterval(this.#t) : this.options.refetchInterval) ?? !1;
  }
  #g(n) {
    this.#S(), this.#o = n, !(ql.isServer() || Ut(this.options.enabled, this.#t) === !1 || !Jo(this.#o) || this.#o === 0) && (this.#d = Da.setInterval(() => {
      (this.options.refetchIntervalInBackground || cc.isFocused()) && this.#h();
    }, this.#o));
  }
  #b() {
    this.#v(), this.#g(this.#y());
  }
  #_() {
    this.#f !== void 0 && (Da.clearTimeout(this.#f), this.#f = void 0);
  }
  #S() {
    this.#d !== void 0 && (Da.clearInterval(this.#d), this.#d = void 0);
  }
  createResult(n, i) {
    const s = this.#t, r = this.options, c = this.#a, m = this.#l, h = this.#i, y = n !== s ? n.state : this.#n, { state: g } = n;
    let _ = { ...g }, j = !1, z;
    if (i._optimisticResults) {
      const R = this.hasListeners(), le = !R && Hm(n, i), xe = R && $m(n, s, i, r);
      (le || xe) && (_ = {
        ..._,
        ...Op(g.data, n.options)
      }), i._optimisticResults === "isRestoring" && (_.fetchStatus = "idle");
    }
    let { error: O, errorUpdatedAt: N, status: B } = _;
    z = _.data;
    let X = !1;
    if (i.placeholderData !== void 0 && z === void 0 && B === "pending") {
      let R;
      c?.isPlaceholderData && i.placeholderData === h?.placeholderData ? (R = c.data, X = !0) : R = typeof i.placeholderData == "function" ? i.placeholderData(
        this.#m?.state.data,
        this.#m
      ) : i.placeholderData, R !== void 0 && (B = "success", z = Io(
        c?.data,
        R,
        i
      ), j = !0);
    }
    if (i.select && z !== void 0 && !X)
      if (c && z === m?.data && i.select === this.#c)
        z = this.#r;
      else
        try {
          this.#c = i.select, z = i.select(z), z = Io(c?.data, z, i), this.#r = z, this.#s = null;
        } catch (R) {
          this.#s = R;
        }
    this.#s && (O = this.#s, z = this.#r, N = Date.now(), B = "error");
    const $ = _.fetchStatus === "fetching", ae = B === "pending", G = B === "error", P = ae && $, ie = z !== void 0, H = {
      status: B,
      fetchStatus: _.fetchStatus,
      isPending: ae,
      isSuccess: B === "success",
      isError: G,
      isInitialLoading: P,
      isLoading: P,
      data: z,
      dataUpdatedAt: _.dataUpdatedAt,
      error: O,
      errorUpdatedAt: N,
      failureCount: _.fetchFailureCount,
      failureReason: _.fetchFailureReason,
      errorUpdateCount: _.errorUpdateCount,
      isFetched: n.isFetched(),
      isFetchedAfterMount: _.dataUpdateCount > y.dataUpdateCount || _.errorUpdateCount > y.errorUpdateCount,
      isFetching: $,
      isRefetching: $ && !ae,
      isLoadingError: G && !ie,
      isPaused: _.fetchStatus === "paused",
      isPlaceholderData: j,
      isRefetchError: G && ie,
      isStale: mc(n, i),
      refetch: this.refetch,
      promise: this.#u,
      isEnabled: Ut(i.enabled, n) !== !1
    };
    if (this.options.experimental_prefetchInRender) {
      const R = H.data !== void 0, le = H.status === "error" && !R, xe = (ue) => {
        le ? ue.reject(H.error) : R && ue.resolve(H.data);
      }, I = () => {
        const ue = this.#u = H.promise = Wo();
        xe(ue);
      }, te = this.#u;
      switch (te.status) {
        case "pending":
          n.queryHash === s.queryHash && xe(te);
          break;
        case "fulfilled":
          (le || H.data !== te.value) && I();
          break;
        case "rejected":
          (!le || H.error !== te.reason) && I();
          break;
      }
    }
    return H;
  }
  updateResult() {
    const n = this.#a, i = this.createResult(this.#t, this.options);
    if (this.#l = this.#t.state, this.#i = this.options, this.#l.data !== void 0 && (this.#m = this.#t), fu(i, n))
      return;
    this.#a = i;
    const s = () => {
      if (!n)
        return !0;
      const { notifyOnChangeProps: r } = this.options, c = typeof r == "function" ? r() : r;
      if (c === "all" || !c && !this.#p.size)
        return !0;
      const m = new Set(
        c ?? this.#p
      );
      return this.options.throwOnError && m.add("error"), Object.keys(this.#a).some((h) => {
        const v = h;
        return this.#a[v] !== n[v] && m.has(v);
      });
    };
    this.#w({ listeners: s() });
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
    nt.batch(() => {
      n.listeners && this.listeners.forEach((i) => {
        i(this.#a);
      }), this.#e.getQueryCache().notify({
        query: this.#t,
        type: "observerResultsUpdated"
      });
    });
  }
};
function fb(n, i) {
  return Ut(i.enabled, n) !== !1 && n.state.data === void 0 && !(n.state.status === "error" && Ut(i.retryOnMount, n) === !1);
}
function Hm(n, i) {
  return fb(n, i) || n.state.data !== void 0 && ec(n, i, i.refetchOnMount);
}
function ec(n, i, s) {
  if (Ut(i.enabled, n) !== !1 && oa(i.staleTime, n) !== "static") {
    const r = typeof s == "function" ? s(n) : s;
    return r === "always" || r !== !1 && mc(n, i);
  }
  return !1;
}
function $m(n, i, s, r) {
  return (n !== i || Ut(r.enabled, n) === !1) && (!s.suspense || n.state.status !== "error") && mc(n, s);
}
function mc(n, i) {
  return Ut(i.enabled, n) !== !1 && n.isStaleByTime(oa(i.staleTime, n));
}
function db(n, i) {
  return !fu(n.getCurrentResult(), i);
}
var hb = class extends Ap {
  #e;
  #t;
  #n;
  #a;
  constructor(n) {
    super(), this.#e = n.client, this.mutationId = n.mutationId, this.#n = n.mutationCache, this.#t = [], this.state = n.state || Cp(), this.setOptions(n.options), this.scheduleGc();
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
    }, s = {
      client: this.#e,
      meta: this.options.meta,
      mutationKey: this.options.mutationKey
    };
    this.#a = Tp({
      fn: () => this.options.mutationFn ? this.options.mutationFn(n, s) : Promise.reject(new Error("No mutationFn found")),
      onFail: (m, h) => {
        this.#l({ type: "failed", failureCount: m, error: h });
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
    const r = this.state.status === "pending", c = !this.#a.canStart();
    try {
      if (r)
        i();
      else {
        this.#l({ type: "pending", variables: n, isPaused: c }), this.#n.config.onMutate && await this.#n.config.onMutate(
          n,
          this,
          s
        );
        const h = await this.options.onMutate?.(
          n,
          s
        );
        h !== this.state.context && this.#l({
          type: "pending",
          context: h,
          variables: n,
          isPaused: c
        });
      }
      const m = await this.#a.start();
      return await this.#n.config.onSuccess?.(
        m,
        n,
        this.state.context,
        this,
        s
      ), await this.options.onSuccess?.(
        m,
        n,
        this.state.context,
        s
      ), await this.#n.config.onSettled?.(
        m,
        null,
        this.state.variables,
        this.state.context,
        this,
        s
      ), await this.options.onSettled?.(
        m,
        null,
        n,
        this.state.context,
        s
      ), this.#l({ type: "success", data: m }), m;
    } catch (m) {
      try {
        await this.#n.config.onError?.(
          m,
          n,
          this.state.context,
          this,
          s
        );
      } catch (h) {
        Promise.reject(h);
      }
      try {
        await this.options.onError?.(
          m,
          n,
          this.state.context,
          s
        );
      } catch (h) {
        Promise.reject(h);
      }
      try {
        await this.#n.config.onSettled?.(
          void 0,
          m,
          this.state.variables,
          this.state.context,
          this,
          s
        );
      } catch (h) {
        Promise.reject(h);
      }
      try {
        await this.options.onSettled?.(
          void 0,
          m,
          n,
          this.state.context,
          s
        );
      } catch (h) {
        Promise.reject(h);
      }
      throw this.#l({ type: "error", error: m }), m;
    } finally {
      this.#n.runNext(this);
    }
  }
  #l(n) {
    const i = (s) => {
      switch (n.type) {
        case "failed":
          return {
            ...s,
            failureCount: n.failureCount,
            failureReason: n.error
          };
        case "pause":
          return {
            ...s,
            isPaused: !0
          };
        case "continue":
          return {
            ...s,
            isPaused: !1
          };
        case "pending":
          return {
            ...s,
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
            ...s,
            data: n.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: !1
          };
        case "error":
          return {
            ...s,
            data: void 0,
            error: n.error,
            failureCount: s.failureCount + 1,
            failureReason: n.error,
            isPaused: !1,
            status: "error"
          };
      }
    };
    this.state = i(this.state), nt.batch(() => {
      this.#t.forEach((s) => {
        s.onMutationUpdate(n);
      }), this.#n.notify({
        mutation: this,
        type: "updated",
        action: n
      });
    });
  }
};
function Cp() {
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
var mb = class extends Ni {
  constructor(n = {}) {
    super(), this.config = n, this.#e = /* @__PURE__ */ new Set(), this.#t = /* @__PURE__ */ new Map(), this.#n = 0;
  }
  #e;
  #t;
  #n;
  build(n, i, s) {
    const r = new hb({
      client: n,
      mutationCache: this,
      mutationId: ++this.#n,
      options: n.defaultMutationOptions(i),
      state: s
    });
    return this.add(r), r;
  }
  add(n) {
    this.#e.add(n);
    const i = iu(n);
    if (typeof i == "string") {
      const s = this.#t.get(i);
      s ? s.push(n) : this.#t.set(i, [n]);
    }
    this.notify({ type: "added", mutation: n });
  }
  remove(n) {
    if (this.#e.delete(n)) {
      const i = iu(n);
      if (typeof i == "string") {
        const s = this.#t.get(i);
        if (s)
          if (s.length > 1) {
            const r = s.indexOf(n);
            r !== -1 && s.splice(r, 1);
          } else s[0] === n && this.#t.delete(i);
      }
    }
    this.notify({ type: "removed", mutation: n });
  }
  canRun(n) {
    const i = iu(n);
    if (typeof i == "string") {
      const r = this.#t.get(i)?.find(
        (c) => c.state.status === "pending"
      );
      return !r || r === n;
    } else
      return !0;
  }
  runNext(n) {
    const i = iu(n);
    return typeof i == "string" ? this.#t.get(i)?.find((r) => r !== n && r.state.isPaused)?.continue() ?? Promise.resolve() : Promise.resolve();
  }
  clear() {
    nt.batch(() => {
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
      (s) => qm(i, s)
    );
  }
  findAll(n = {}) {
    return this.getAll().filter((i) => qm(n, i));
  }
  notify(n) {
    nt.batch(() => {
      this.listeners.forEach((i) => {
        i(n);
      });
    });
  }
  resumePausedMutations() {
    const n = this.getAll().filter((i) => i.state.isPaused);
    return nt.batch(
      () => Promise.all(
        n.map((i) => i.continue().catch(vt))
      )
    );
  }
};
function iu(n) {
  return n.options.scope?.id;
}
var pb = class extends Ni {
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
    this.options = this.#e.defaultMutationOptions(n), fu(this.options, i) || this.#e.getMutationCache().notify({
      type: "observerOptionsUpdated",
      mutation: this.#n,
      observer: this
    }), i?.mutationKey && this.options.mutationKey && Ra(i.mutationKey) !== Ra(this.options.mutationKey) ? this.reset() : this.#n?.state.status === "pending" && this.#n.setOptions(this.options);
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
    const n = this.#n?.state ?? Cp();
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
    nt.batch(() => {
      if (this.#a && this.hasListeners()) {
        const i = this.#t.variables, s = this.#t.context, r = {
          client: this.#e,
          meta: this.options.meta,
          mutationKey: this.options.mutationKey
        };
        if (n?.type === "success") {
          try {
            this.#a.onSuccess?.(
              n.data,
              i,
              s,
              r
            );
          } catch (c) {
            Promise.reject(c);
          }
          try {
            this.#a.onSettled?.(
              n.data,
              null,
              i,
              s,
              r
            );
          } catch (c) {
            Promise.reject(c);
          }
        } else if (n?.type === "error") {
          try {
            this.#a.onError?.(
              n.error,
              i,
              s,
              r
            );
          } catch (c) {
            Promise.reject(c);
          }
          try {
            this.#a.onSettled?.(
              void 0,
              n.error,
              i,
              s,
              r
            );
          } catch (c) {
            Promise.reject(c);
          }
        }
      }
      this.listeners.forEach((i) => {
        i(this.#t);
      });
    });
  }
}, vb = class extends Ni {
  constructor(n = {}) {
    super(), this.config = n, this.#e = /* @__PURE__ */ new Map();
  }
  #e;
  build(n, i, s) {
    const r = i.queryKey, c = i.queryHash ?? fc(r, i);
    let m = this.get(c);
    return m || (m = new ob({
      client: n,
      queryKey: r,
      queryHash: c,
      options: n.defaultQueryOptions(i),
      state: s,
      defaultOptions: n.getQueryDefaults(r)
    }), this.add(m)), m;
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
    nt.batch(() => {
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
      (s) => Rm(i, s)
    );
  }
  findAll(n = {}) {
    const i = this.getAll();
    return Object.keys(n).length > 0 ? i.filter((s) => Rm(n, s)) : i;
  }
  notify(n) {
    nt.batch(() => {
      this.listeners.forEach((i) => {
        i(n);
      });
    });
  }
  onFocus() {
    nt.batch(() => {
      this.getAll().forEach((n) => {
        n.onFocus();
      });
    });
  }
  onOnline() {
    nt.batch(() => {
      this.getAll().forEach((n) => {
        n.onOnline();
      });
    });
  }
}, yb = class {
  #e;
  #t;
  #n;
  #a;
  #l;
  #i;
  #u;
  #s;
  constructor(n = {}) {
    this.#e = n.queryCache || new vb(), this.#t = n.mutationCache || new mb(), this.#n = n.defaultOptions || {}, this.#a = /* @__PURE__ */ new Map(), this.#l = /* @__PURE__ */ new Map(), this.#i = 0;
  }
  mount() {
    this.#i++, this.#i === 1 && (this.#u = cc.subscribe(async (n) => {
      n && (await this.resumePausedMutations(), this.#e.onFocus());
    }), this.#s = du.subscribe(async (n) => {
      n && (await this.resumePausedMutations(), this.#e.onOnline());
    }));
  }
  unmount() {
    this.#i--, this.#i === 0 && (this.#u?.(), this.#u = void 0, this.#s?.(), this.#s = void 0);
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
    const i = this.defaultQueryOptions(n), s = this.#e.build(this, i), r = s.state.data;
    return r === void 0 ? this.fetchQuery(n) : (n.revalidateIfStale && s.isStaleByTime(oa(i.staleTime, s)) && this.prefetchQuery(i), Promise.resolve(r));
  }
  getQueriesData(n) {
    return this.#e.findAll(n).map(({ queryKey: i, state: s }) => {
      const r = s.data;
      return [i, r];
    });
  }
  setQueryData(n, i, s) {
    const r = this.defaultQueryOptions({ queryKey: n }), m = this.#e.get(
      r.queryHash
    )?.state.data, h = Ig(i, m);
    if (h !== void 0)
      return this.#e.build(this, r).setData(h, { ...s, manual: !0 });
  }
  setQueriesData(n, i, s) {
    return nt.batch(
      () => this.#e.findAll(n).map(({ queryKey: r }) => [
        r,
        this.setQueryData(r, i, s)
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
    nt.batch(() => {
      i.findAll(n).forEach((s) => {
        i.remove(s);
      });
    });
  }
  resetQueries(n, i) {
    const s = this.#e;
    return nt.batch(() => (s.findAll(n).forEach((r) => {
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
    const s = { revert: !0, ...i }, r = nt.batch(
      () => this.#e.findAll(n).map((c) => c.cancel(s))
    );
    return Promise.all(r).then(vt).catch(vt);
  }
  invalidateQueries(n, i = {}) {
    return nt.batch(() => (this.#e.findAll(n).forEach((s) => {
      s.invalidate();
    }), n?.refetchType === "none" ? Promise.resolve() : this.refetchQueries(
      {
        ...n,
        type: n?.refetchType ?? n?.type ?? "active"
      },
      i
    )));
  }
  refetchQueries(n, i = {}) {
    const s = {
      ...i,
      cancelRefetch: i.cancelRefetch ?? !0
    }, r = nt.batch(
      () => this.#e.findAll(n).filter((c) => !c.isDisabled() && !c.isStatic()).map((c) => {
        let m = c.fetch(void 0, s);
        return s.throwOnError || (m = m.catch(vt)), c.state.fetchStatus === "paused" ? Promise.resolve() : m;
      })
    );
    return Promise.all(r).then(vt);
  }
  fetchQuery(n) {
    const i = this.defaultQueryOptions(n);
    i.retry === void 0 && (i.retry = !1);
    const s = this.#e.build(this, i);
    return s.isStaleByTime(
      oa(i.staleTime, s)
    ) ? s.fetch(i) : Promise.resolve(s.state.data);
  }
  prefetchQuery(n) {
    return this.fetchQuery(n).then(vt).catch(vt);
  }
  fetchInfiniteQuery(n) {
    return n._type = "infinite", this.fetchQuery(n);
  }
  prefetchInfiniteQuery(n) {
    return this.fetchInfiniteQuery(n).then(vt).catch(vt);
  }
  ensureInfiniteQueryData(n) {
    return n._type = "infinite", this.ensureQueryData(n);
  }
  resumePausedMutations() {
    return du.isOnline() ? this.#t.resumePausedMutations() : Promise.resolve();
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
    this.#a.set(Ra(n), {
      queryKey: n,
      defaultOptions: i
    });
  }
  getQueryDefaults(n) {
    const i = [...this.#a.values()], s = {};
    return i.forEach((r) => {
      Rl(n, r.queryKey) && Object.assign(s, r.defaultOptions);
    }), s;
  }
  setMutationDefaults(n, i) {
    this.#l.set(Ra(n), {
      mutationKey: n,
      defaultOptions: i
    });
  }
  getMutationDefaults(n) {
    const i = [...this.#l.values()], s = {};
    return i.forEach((r) => {
      Rl(n, r.mutationKey) && Object.assign(s, r.defaultOptions);
    }), s;
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
    return i.queryHash || (i.queryHash = fc(
      i.queryKey,
      i
    )), i.refetchOnReconnect === void 0 && (i.refetchOnReconnect = i.networkMode !== "always"), i.throwOnError === void 0 && (i.throwOnError = !!i.suspense), !i.networkMode && i.persister && (i.networkMode = "offlineFirst"), i.queryFn === dc && (i.enabled = !1), i;
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
}, Np = J.createContext(
  void 0
), Mi = (n) => {
  const i = J.useContext(Np);
  if (!i)
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  return i;
}, gb = ({
  client: n,
  children: i
}) => (J.useEffect(() => (n.mount(), () => {
  n.unmount();
}), [n]), /* @__PURE__ */ f.jsx(Np.Provider, { value: n, children: i })), Mp = J.createContext(!1), bb = () => J.useContext(Mp);
Mp.Provider;
function _b() {
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
var Sb = J.createContext(_b()), zb = () => J.useContext(Sb), wb = (n, i, s) => {
  const r = s?.state.error && typeof n.throwOnError == "function" ? hc(n.throwOnError, [s.state.error, s]) : n.throwOnError;
  (n.suspense || n.experimental_prefetchInRender || r) && (i.isReset() || (n.retryOnMount = !1));
}, xb = (n) => {
  J.useEffect(() => {
    n.clearReset();
  }, [n]);
}, jb = ({
  result: n,
  errorResetBoundary: i,
  throwOnError: s,
  query: r,
  suspense: c
}) => n.isError && !i.isReset() && !n.isFetching && r && (c && n.data === void 0 || hc(s, [n.error, r])), Eb = (n) => {
  if (n.suspense) {
    const s = (c) => c === "static" ? c : Math.max(c ?? 1e3, 1e3), r = n.staleTime;
    n.staleTime = typeof r == "function" ? (...c) => s(r(...c)) : s(r), typeof n.gcTime == "number" && (n.gcTime = Math.max(
      n.gcTime,
      1e3
    ));
  }
}, Tb = (n, i) => n.isLoading && n.isFetching && !i, Ab = (n, i) => n?.suspense && i.isPending, Lm = (n, i, s) => i.fetchOptimistic(n).catch(() => {
  s.clearReset();
});
function Ob(n, i, s) {
  const r = bb(), c = zb(), m = Mi(), h = m.defaultQueryOptions(n);
  m.getDefaultOptions().queries?._experimental_beforeQuery?.(
    h
  );
  const v = m.getQueryCache().get(h.queryHash), y = n.subscribed !== !1;
  h._optimisticResults = r ? "isRestoring" : y ? "optimistic" : void 0, Eb(h), wb(h, c, v), xb(c);
  const g = !m.getQueryCache().get(h.queryHash), [_] = J.useState(
    () => new i(
      m,
      h
    )
  ), j = _.getOptimisticResult(h), z = !r && y;
  if (J.useSyncExternalStore(
    J.useCallback(
      (O) => {
        const N = z ? _.subscribe(nt.batchCalls(O)) : vt;
        return _.updateResult(), N;
      },
      [_, z]
    ),
    () => _.getCurrentResult(),
    () => _.getCurrentResult()
  ), J.useEffect(() => {
    _.setOptions(h);
  }, [h, _]), Ab(h, j))
    throw Lm(h, _, c);
  if (jb({
    result: j,
    errorResetBoundary: c,
    throwOnError: h.throwOnError,
    query: v,
    suspense: h.suspense
  }))
    throw j.error;
  return m.getDefaultOptions().queries?._experimental_afterQuery?.(
    h,
    j
  ), h.experimental_prefetchInRender && !ql.isServer() && Tb(j, r) && (g ? (
    // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
    Lm(h, _, c)
  ) : (
    // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
    v?.promise
  ))?.catch(vt).finally(() => {
    _.updateResult();
  }), h.notifyOnChangeProps ? j : _.trackResult(j);
}
function Cn(n, i) {
  return Ob(n, cb);
}
function qt(n, i) {
  const s = Mi(), [r] = J.useState(
    () => new pb(
      s,
      n
    )
  );
  J.useEffect(() => {
    r.setOptions(n);
  }, [r, n]);
  const c = J.useSyncExternalStore(
    J.useCallback(
      (h) => r.subscribe(nt.batchCalls(h)),
      [r]
    ),
    () => r.getCurrentResult(),
    () => r.getCurrentResult()
  ), m = J.useCallback(
    (h, v) => {
      r.mutate(h, v).catch(vt);
    },
    [r]
  );
  if (c.error && hc(r.options.throwOnError, [c.error]))
    throw c.error;
  return { ...c, mutate: m, mutateAsync: c.mutate };
}
var Gm;
function q(n, i, s) {
  function r(v, y) {
    if (v._zod || Object.defineProperty(v, "_zod", {
      value: {
        def: y,
        constr: h,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), v._zod.traits.has(n))
      return;
    v._zod.traits.add(n), i(v, y);
    const g = h.prototype, _ = Object.keys(g);
    for (let j = 0; j < _.length; j++) {
      const z = _[j];
      z in v || (v[z] = g[z].bind(v));
    }
  }
  const c = s?.Parent ?? Object;
  class m extends c {
  }
  Object.defineProperty(m, "name", { value: n });
  function h(v) {
    var y;
    const g = s?.Parent ? new m() : this;
    r(g, v), (y = g._zod).deferred ?? (y.deferred = []);
    for (const _ of g._zod.deferred)
      _();
    return g;
  }
  return Object.defineProperty(h, "init", { value: r }), Object.defineProperty(h, Symbol.hasInstance, {
    value: (v) => s?.Parent && v instanceof s.Parent ? !0 : v?._zod?.traits?.has(n)
  }), Object.defineProperty(h, "name", { value: n }), h;
}
class Ti extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Dp extends Error {
  constructor(i) {
    super(`Encountered unidirectional transform during encode: ${i}`), this.name = "ZodEncodeError";
  }
}
(Gm = globalThis).__zod_globalConfig ?? (Gm.__zod_globalConfig = {});
const pc = globalThis.__zod_globalConfig;
function Mn(n) {
  return pc;
}
function Rp(n) {
  const i = Object.values(n).filter((r) => typeof r == "number");
  return Object.entries(n).filter(([r, c]) => i.indexOf(+r) === -1).map(([r, c]) => c);
}
function tc(n, i) {
  return typeof i == "bigint" ? i.toString() : i;
}
function vc(n) {
  return {
    get value() {
      {
        const i = n();
        return Object.defineProperty(this, "value", { value: i }), i;
      }
    }
  };
}
function yc(n) {
  return n == null;
}
function gc(n) {
  const i = n.startsWith("^") ? 1 : 0, s = n.endsWith("$") ? n.length - 1 : n.length;
  return n.slice(i, s);
}
function Cb(n, i) {
  const s = n / i, r = Math.round(s), c = Number.EPSILON * Math.max(Math.abs(s), 1);
  return Math.abs(s - r) < c ? 0 : s - r;
}
const Ym = /* @__PURE__ */ Symbol("evaluating");
function qe(n, i, s) {
  let r;
  Object.defineProperty(n, i, {
    get() {
      if (r !== Ym)
        return r === void 0 && (r = Ym, r = s()), r;
    },
    set(c) {
      Object.defineProperty(n, i, {
        value: c
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function Za(n, i, s) {
  Object.defineProperty(n, i, {
    value: s,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function ca(...n) {
  const i = {};
  for (const s of n) {
    const r = Object.getOwnPropertyDescriptors(s);
    Object.assign(i, r);
  }
  return Object.defineProperties({}, i);
}
function Km(n) {
  return JSON.stringify(n);
}
function Nb(n) {
  return n.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const qp = "captureStackTrace" in Error ? Error.captureStackTrace : (...n) => {
};
function hu(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
const Mb = /* @__PURE__ */ vc(() => {
  if (pc.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const n = Function;
    return new n(""), !0;
  } catch {
    return !1;
  }
});
function Ci(n) {
  if (hu(n) === !1)
    return !1;
  const i = n.constructor;
  if (i === void 0 || typeof i != "function")
    return !0;
  const s = i.prototype;
  return !(hu(s) === !1 || Object.prototype.hasOwnProperty.call(s, "isPrototypeOf") === !1);
}
function Up(n) {
  return Ci(n) ? { ...n } : Array.isArray(n) ? [...n] : n instanceof Map ? new Map(n) : n instanceof Set ? new Set(n) : n;
}
const Db = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function gu(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function fa(n, i, s) {
  const r = new n._zod.constr(i ?? n._zod.def);
  return (!i || s?.parent) && (r._zod.parent = n), r;
}
function ne(n) {
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
function Rb(n) {
  return Object.keys(n).filter((i) => n[i]._zod.optin === "optional" && n[i]._zod.optout === "optional");
}
const qb = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function Ub(n, i) {
  const s = n._zod.def, r = s.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const m = ca(n._zod.def, {
    get shape() {
      const h = {};
      for (const v in i) {
        if (!(v in s.shape))
          throw new Error(`Unrecognized key: "${v}"`);
        i[v] && (h[v] = s.shape[v]);
      }
      return Za(this, "shape", h), h;
    },
    checks: []
  });
  return fa(n, m);
}
function Zb(n, i) {
  const s = n._zod.def, r = s.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const m = ca(n._zod.def, {
    get shape() {
      const h = { ...n._zod.def.shape };
      for (const v in i) {
        if (!(v in s.shape))
          throw new Error(`Unrecognized key: "${v}"`);
        i[v] && delete h[v];
      }
      return Za(this, "shape", h), h;
    },
    checks: []
  });
  return fa(n, m);
}
function Qb(n, i) {
  if (!Ci(i))
    throw new Error("Invalid input to extend: expected a plain object");
  const s = n._zod.def.checks;
  if (s && s.length > 0) {
    const m = n._zod.def.shape;
    for (const h in i)
      if (Object.getOwnPropertyDescriptor(m, h) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const c = ca(n._zod.def, {
    get shape() {
      const m = { ...n._zod.def.shape, ...i };
      return Za(this, "shape", m), m;
    }
  });
  return fa(n, c);
}
function kb(n, i) {
  if (!Ci(i))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const s = ca(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i };
      return Za(this, "shape", r), r;
    }
  });
  return fa(n, s);
}
function Bb(n, i) {
  if (n._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const s = ca(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i._zod.def.shape };
      return Za(this, "shape", r), r;
    },
    get catchall() {
      return i._zod.def.catchall;
    },
    checks: i._zod.def.checks ?? []
  });
  return fa(n, s);
}
function Hb(n, i, s) {
  const c = i._zod.def.checks;
  if (c && c.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const h = ca(i._zod.def, {
    get shape() {
      const v = i._zod.def.shape, y = { ...v };
      if (s)
        for (const g in s) {
          if (!(g in v))
            throw new Error(`Unrecognized key: "${g}"`);
          s[g] && (y[g] = n ? new n({
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
      return Za(this, "shape", y), y;
    },
    checks: []
  });
  return fa(i, h);
}
function $b(n, i, s) {
  const r = ca(i._zod.def, {
    get shape() {
      const c = i._zod.def.shape, m = { ...c };
      if (s)
        for (const h in s) {
          if (!(h in m))
            throw new Error(`Unrecognized key: "${h}"`);
          s[h] && (m[h] = new n({
            type: "nonoptional",
            innerType: c[h]
          }));
        }
      else
        for (const h in c)
          m[h] = new n({
            type: "nonoptional",
            innerType: c[h]
          });
      return Za(this, "shape", m), m;
    }
  });
  return fa(i, r);
}
function ji(n, i = 0) {
  if (n.aborted === !0)
    return !0;
  for (let s = i; s < n.issues.length; s++)
    if (n.issues[s]?.continue !== !0)
      return !0;
  return !1;
}
function Lb(n, i = 0) {
  if (n.aborted === !0)
    return !0;
  for (let s = i; s < n.issues.length; s++)
    if (n.issues[s]?.continue === !1)
      return !0;
  return !1;
}
function Ei(n, i) {
  return i.map((s) => {
    var r;
    return (r = s).path ?? (r.path = []), s.path.unshift(n), s;
  });
}
function lu(n) {
  return typeof n == "string" ? n : n?.message;
}
function Dn(n, i, s) {
  const r = n.message ? n.message : lu(n.inst?._zod.def?.error?.(n)) ?? lu(i?.error?.(n)) ?? lu(s.customError?.(n)) ?? lu(s.localeError?.(n)) ?? "Invalid input", { inst: c, continue: m, input: h, ...v } = n;
  return v.path ?? (v.path = []), v.message = r, i?.reportInput && (v.input = h), v;
}
function bc(n) {
  return Array.isArray(n) ? "array" : typeof n == "string" ? "string" : "unknown";
}
function Ul(...n) {
  const [i, s, r] = n;
  return typeof i == "string" ? {
    message: i,
    code: "custom",
    input: s,
    inst: r
  } : { ...i };
}
const Zp = (n, i) => {
  n.name = "$ZodError", Object.defineProperty(n, "_zod", {
    value: n._zod,
    enumerable: !1
  }), Object.defineProperty(n, "issues", {
    value: i,
    enumerable: !1
  }), n.message = JSON.stringify(i, tc, 2), Object.defineProperty(n, "toString", {
    value: () => n.message,
    enumerable: !1
  });
}, Qp = q("$ZodError", Zp), kp = q("$ZodError", Zp, { Parent: Error });
function Gb(n, i = (s) => s.message) {
  const s = {}, r = [];
  for (const c of n.issues)
    c.path.length > 0 ? (s[c.path[0]] = s[c.path[0]] || [], s[c.path[0]].push(i(c))) : r.push(i(c));
  return { formErrors: r, fieldErrors: s };
}
function Yb(n, i = (s) => s.message) {
  const s = { _errors: [] }, r = (c, m = []) => {
    for (const h of c.issues)
      if (h.code === "invalid_union" && h.errors.length)
        h.errors.map((v) => r({ issues: v }, [...m, ...h.path]));
      else if (h.code === "invalid_key")
        r({ issues: h.issues }, [...m, ...h.path]);
      else if (h.code === "invalid_element")
        r({ issues: h.issues }, [...m, ...h.path]);
      else {
        const v = [...m, ...h.path];
        if (v.length === 0)
          s._errors.push(i(h));
        else {
          let y = s, g = 0;
          for (; g < v.length; ) {
            const _ = v[g];
            g === v.length - 1 ? (y[_] = y[_] || { _errors: [] }, y[_]._errors.push(i(h))) : y[_] = y[_] || { _errors: [] }, y = y[_], g++;
          }
        }
      }
  };
  return r(n), s;
}
const _c = (n) => (i, s, r, c) => {
  const m = r ? { ...r, async: !1 } : { async: !1 }, h = i._zod.run({ value: s, issues: [] }, m);
  if (h instanceof Promise)
    throw new Ti();
  if (h.issues.length) {
    const v = new (c?.Err ?? n)(h.issues.map((y) => Dn(y, m, Mn())));
    throw qp(v, c?.callee), v;
  }
  return h.value;
}, Sc = (n) => async (i, s, r, c) => {
  const m = r ? { ...r, async: !0 } : { async: !0 };
  let h = i._zod.run({ value: s, issues: [] }, m);
  if (h instanceof Promise && (h = await h), h.issues.length) {
    const v = new (c?.Err ?? n)(h.issues.map((y) => Dn(y, m, Mn())));
    throw qp(v, c?.callee), v;
  }
  return h.value;
}, bu = (n) => (i, s, r) => {
  const c = r ? { ...r, async: !1 } : { async: !1 }, m = i._zod.run({ value: s, issues: [] }, c);
  if (m instanceof Promise)
    throw new Ti();
  return m.issues.length ? {
    success: !1,
    error: new (n ?? Qp)(m.issues.map((h) => Dn(h, c, Mn())))
  } : { success: !0, data: m.value };
}, Kb = /* @__PURE__ */ bu(kp), _u = (n) => async (i, s, r) => {
  const c = r ? { ...r, async: !0 } : { async: !0 };
  let m = i._zod.run({ value: s, issues: [] }, c);
  return m instanceof Promise && (m = await m), m.issues.length ? {
    success: !1,
    error: new n(m.issues.map((h) => Dn(h, c, Mn())))
  } : { success: !0, data: m.value };
}, Xb = /* @__PURE__ */ _u(kp), Vb = (n) => (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return _c(n)(i, s, c);
}, Jb = (n) => (i, s, r) => _c(n)(i, s, r), Fb = (n) => async (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return Sc(n)(i, s, c);
}, Ib = (n) => async (i, s, r) => Sc(n)(i, s, r), Wb = (n) => (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return bu(n)(i, s, c);
}, Pb = (n) => (i, s, r) => bu(n)(i, s, r), e0 = (n) => async (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return _u(n)(i, s, c);
}, t0 = (n) => async (i, s, r) => _u(n)(i, s, r), n0 = /^[cC][0-9a-z]{6,}$/, a0 = /^[0-9a-z]+$/, i0 = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, l0 = /^[0-9a-vA-V]{20}$/, s0 = /^[A-Za-z0-9]{27}$/, u0 = /^[a-zA-Z0-9_-]{21}$/, r0 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, o0 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Xm = (n) => n ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${n}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, c0 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, f0 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function d0() {
  return new RegExp(f0, "u");
}
const h0 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, m0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, p0 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, v0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, y0 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Bp = /^[A-Za-z0-9_-]*$/, g0 = /^https?$/, b0 = /^\+[1-9]\d{6,14}$/, Hp = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", _0 = /* @__PURE__ */ new RegExp(`^${Hp}$`);
function $p(n) {
  const i = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof n.precision == "number" ? n.precision === -1 ? `${i}` : n.precision === 0 ? `${i}:[0-5]\\d` : `${i}:[0-5]\\d\\.\\d{${n.precision}}` : `${i}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function S0(n) {
  return new RegExp(`^${$p(n)}$`);
}
function z0(n) {
  const i = $p({ precision: n.precision }), s = ["Z"];
  n.local && s.push(""), n.offset && s.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${i}(?:${s.join("|")})`;
  return new RegExp(`^${Hp}T(?:${r})$`);
}
const w0 = (n) => {
  const i = n ? `[\\s\\S]{${n?.minimum ?? 0},${n?.maximum ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${i}$`);
}, x0 = /^-?\d+$/, Lp = /^-?\d+(?:\.\d+)?$/, j0 = /^(?:true|false)$/i, E0 = /^null$/i, T0 = /^undefined$/i, A0 = /^[^A-Z]*$/, O0 = /^[^a-z]*$/, xt = /* @__PURE__ */ q("$ZodCheck", (n, i) => {
  var s;
  n._zod ?? (n._zod = {}), n._zod.def = i, (s = n._zod).onattach ?? (s.onattach = []);
}), Gp = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Yp = /* @__PURE__ */ q("$ZodCheckLessThan", (n, i) => {
  xt.init(n, i);
  const s = Gp[typeof i.value];
  n._zod.onattach.push((r) => {
    const c = r._zod.bag, m = (i.inclusive ? c.maximum : c.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    i.value < m && (i.inclusive ? c.maximum = i.value : c.exclusiveMaximum = i.value);
  }), n._zod.check = (r) => {
    (i.inclusive ? r.value <= i.value : r.value < i.value) || r.issues.push({
      origin: s,
      code: "too_big",
      maximum: typeof i.value == "object" ? i.value.getTime() : i.value,
      input: r.value,
      inclusive: i.inclusive,
      inst: n,
      continue: !i.abort
    });
  };
}), Kp = /* @__PURE__ */ q("$ZodCheckGreaterThan", (n, i) => {
  xt.init(n, i);
  const s = Gp[typeof i.value];
  n._zod.onattach.push((r) => {
    const c = r._zod.bag, m = (i.inclusive ? c.minimum : c.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    i.value > m && (i.inclusive ? c.minimum = i.value : c.exclusiveMinimum = i.value);
  }), n._zod.check = (r) => {
    (i.inclusive ? r.value >= i.value : r.value > i.value) || r.issues.push({
      origin: s,
      code: "too_small",
      minimum: typeof i.value == "object" ? i.value.getTime() : i.value,
      input: r.value,
      inclusive: i.inclusive,
      inst: n,
      continue: !i.abort
    });
  };
}), C0 = /* @__PURE__ */ q("$ZodCheckMultipleOf", (n, i) => {
  xt.init(n, i), n._zod.onattach.push((s) => {
    var r;
    (r = s._zod.bag).multipleOf ?? (r.multipleOf = i.value);
  }), n._zod.check = (s) => {
    if (typeof s.value != typeof i.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof s.value == "bigint" ? s.value % i.value === BigInt(0) : Cb(s.value, i.value) === 0) || s.issues.push({
      origin: typeof s.value,
      code: "not_multiple_of",
      divisor: i.value,
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), N0 = /* @__PURE__ */ q("$ZodCheckNumberFormat", (n, i) => {
  xt.init(n, i), i.format = i.format || "float64";
  const s = i.format?.includes("int"), r = s ? "int" : "number", [c, m] = qb[i.format];
  n._zod.onattach.push((h) => {
    const v = h._zod.bag;
    v.format = i.format, v.minimum = c, v.maximum = m, s && (v.pattern = x0);
  }), n._zod.check = (h) => {
    const v = h.value;
    if (s) {
      if (!Number.isInteger(v)) {
        h.issues.push({
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
        v > 0 ? h.issues.push({
          input: v,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: n,
          origin: r,
          inclusive: !0,
          continue: !i.abort
        }) : h.issues.push({
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
    v < c && h.issues.push({
      origin: "number",
      input: v,
      code: "too_small",
      minimum: c,
      inclusive: !0,
      inst: n,
      continue: !i.abort
    }), v > m && h.issues.push({
      origin: "number",
      input: v,
      code: "too_big",
      maximum: m,
      inclusive: !0,
      inst: n,
      continue: !i.abort
    });
  };
}), M0 = /* @__PURE__ */ q("$ZodCheckMaxLength", (n, i) => {
  var s;
  xt.init(n, i), (s = n._zod.def).when ?? (s.when = (r) => {
    const c = r.value;
    return !yc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    i.maximum < c && (r._zod.bag.maximum = i.maximum);
  }), n._zod.check = (r) => {
    const c = r.value;
    if (c.length <= i.maximum)
      return;
    const h = bc(c);
    r.issues.push({
      origin: h,
      code: "too_big",
      maximum: i.maximum,
      inclusive: !0,
      input: c,
      inst: n,
      continue: !i.abort
    });
  };
}), D0 = /* @__PURE__ */ q("$ZodCheckMinLength", (n, i) => {
  var s;
  xt.init(n, i), (s = n._zod.def).when ?? (s.when = (r) => {
    const c = r.value;
    return !yc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    i.minimum > c && (r._zod.bag.minimum = i.minimum);
  }), n._zod.check = (r) => {
    const c = r.value;
    if (c.length >= i.minimum)
      return;
    const h = bc(c);
    r.issues.push({
      origin: h,
      code: "too_small",
      minimum: i.minimum,
      inclusive: !0,
      input: c,
      inst: n,
      continue: !i.abort
    });
  };
}), R0 = /* @__PURE__ */ q("$ZodCheckLengthEquals", (n, i) => {
  var s;
  xt.init(n, i), (s = n._zod.def).when ?? (s.when = (r) => {
    const c = r.value;
    return !yc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag;
    c.minimum = i.length, c.maximum = i.length, c.length = i.length;
  }), n._zod.check = (r) => {
    const c = r.value, m = c.length;
    if (m === i.length)
      return;
    const h = bc(c), v = m > i.length;
    r.issues.push({
      origin: h,
      ...v ? { code: "too_big", maximum: i.length } : { code: "too_small", minimum: i.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: n,
      continue: !i.abort
    });
  };
}), Su = /* @__PURE__ */ q("$ZodCheckStringFormat", (n, i) => {
  var s, r;
  xt.init(n, i), n._zod.onattach.push((c) => {
    const m = c._zod.bag;
    m.format = i.format, i.pattern && (m.patterns ?? (m.patterns = /* @__PURE__ */ new Set()), m.patterns.add(i.pattern));
  }), i.pattern ? (s = n._zod).check ?? (s.check = (c) => {
    i.pattern.lastIndex = 0, !i.pattern.test(c.value) && c.issues.push({
      origin: "string",
      code: "invalid_format",
      format: i.format,
      input: c.value,
      ...i.pattern ? { pattern: i.pattern.toString() } : {},
      inst: n,
      continue: !i.abort
    });
  }) : (r = n._zod).check ?? (r.check = () => {
  });
}), q0 = /* @__PURE__ */ q("$ZodCheckRegex", (n, i) => {
  Su.init(n, i), n._zod.check = (s) => {
    i.pattern.lastIndex = 0, !i.pattern.test(s.value) && s.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: s.value,
      pattern: i.pattern.toString(),
      inst: n,
      continue: !i.abort
    });
  };
}), U0 = /* @__PURE__ */ q("$ZodCheckLowerCase", (n, i) => {
  i.pattern ?? (i.pattern = A0), Su.init(n, i);
}), Z0 = /* @__PURE__ */ q("$ZodCheckUpperCase", (n, i) => {
  i.pattern ?? (i.pattern = O0), Su.init(n, i);
}), Q0 = /* @__PURE__ */ q("$ZodCheckIncludes", (n, i) => {
  xt.init(n, i);
  const s = gu(i.includes), r = new RegExp(typeof i.position == "number" ? `^.{${i.position}}${s}` : s);
  i.pattern = r, n._zod.onattach.push((c) => {
    const m = c._zod.bag;
    m.patterns ?? (m.patterns = /* @__PURE__ */ new Set()), m.patterns.add(r);
  }), n._zod.check = (c) => {
    c.value.includes(i.includes, i.position) || c.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: i.includes,
      input: c.value,
      inst: n,
      continue: !i.abort
    });
  };
}), k0 = /* @__PURE__ */ q("$ZodCheckStartsWith", (n, i) => {
  xt.init(n, i);
  const s = new RegExp(`^${gu(i.prefix)}.*`);
  i.pattern ?? (i.pattern = s), n._zod.onattach.push((r) => {
    const c = r._zod.bag;
    c.patterns ?? (c.patterns = /* @__PURE__ */ new Set()), c.patterns.add(s);
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
}), B0 = /* @__PURE__ */ q("$ZodCheckEndsWith", (n, i) => {
  xt.init(n, i);
  const s = new RegExp(`.*${gu(i.suffix)}$`);
  i.pattern ?? (i.pattern = s), n._zod.onattach.push((r) => {
    const c = r._zod.bag;
    c.patterns ?? (c.patterns = /* @__PURE__ */ new Set()), c.patterns.add(s);
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
}), H0 = /* @__PURE__ */ q("$ZodCheckOverwrite", (n, i) => {
  xt.init(n, i), n._zod.check = (s) => {
    s.value = i.tx(s.value);
  };
});
class $0 {
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
`).filter((h) => h), c = Math.min(...r.map((h) => h.length - h.trimStart().length)), m = r.map((h) => h.slice(c)).map((h) => " ".repeat(this.indent * 2) + h);
    for (const h of m)
      this.content.push(h);
  }
  compile() {
    const i = Function, s = this?.args, c = [...(this?.content ?? [""]).map((m) => `  ${m}`)];
    return new i(...s, c.join(`
`));
  }
}
const L0 = {
  major: 4,
  minor: 4,
  patch: 3
}, He = /* @__PURE__ */ q("$ZodType", (n, i) => {
  var s;
  n ?? (n = {}), n._zod.def = i, n._zod.bag = n._zod.bag || {}, n._zod.version = L0;
  const r = [...n._zod.def.checks ?? []];
  n._zod.traits.has("$ZodCheck") && r.unshift(n);
  for (const c of r)
    for (const m of c._zod.onattach)
      m(n);
  if (r.length === 0)
    (s = n._zod).deferred ?? (s.deferred = []), n._zod.deferred?.push(() => {
      n._zod.run = n._zod.parse;
    });
  else {
    const c = (h, v, y) => {
      let g = ji(h), _;
      for (const j of v) {
        if (j._zod.def.when) {
          if (Lb(h) || !j._zod.def.when(h))
            continue;
        } else if (g)
          continue;
        const z = h.issues.length, O = j._zod.check(h);
        if (O instanceof Promise && y?.async === !1)
          throw new Ti();
        if (_ || O instanceof Promise)
          _ = (_ ?? Promise.resolve()).then(async () => {
            await O, h.issues.length !== z && (g || (g = ji(h, z)));
          });
        else {
          if (h.issues.length === z)
            continue;
          g || (g = ji(h, z));
        }
      }
      return _ ? _.then(() => h) : h;
    }, m = (h, v, y) => {
      if (ji(h))
        return h.aborted = !0, h;
      const g = c(v, r, y);
      if (g instanceof Promise) {
        if (y.async === !1)
          throw new Ti();
        return g.then((_) => n._zod.parse(_, y));
      }
      return n._zod.parse(g, y);
    };
    n._zod.run = (h, v) => {
      if (v.skipChecks)
        return n._zod.parse(h, v);
      if (v.direction === "backward") {
        const g = n._zod.parse({ value: h.value, issues: [] }, { ...v, skipChecks: !0 });
        return g instanceof Promise ? g.then((_) => m(_, h, v)) : m(g, h, v);
      }
      const y = n._zod.parse(h, v);
      if (y instanceof Promise) {
        if (v.async === !1)
          throw new Ti();
        return y.then((g) => c(g, r, v));
      }
      return c(y, r, v);
    };
  }
  qe(n, "~standard", () => ({
    validate: (c) => {
      try {
        const m = Kb(n, c);
        return m.success ? { value: m.data } : { issues: m.error?.issues };
      } catch {
        return Xb(n, c).then((h) => h.success ? { value: h.data } : { issues: h.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), zc = /* @__PURE__ */ q("$ZodString", (n, i) => {
  He.init(n, i), n._zod.pattern = [...n?._zod.bag?.patterns ?? []].pop() ?? w0(n._zod.bag), n._zod.parse = (s, r) => {
    if (i.coerce)
      try {
        s.value = String(s.value);
      } catch {
      }
    return typeof s.value == "string" || s.issues.push({
      expected: "string",
      code: "invalid_type",
      input: s.value,
      inst: n
    }), s;
  };
}), $e = /* @__PURE__ */ q("$ZodStringFormat", (n, i) => {
  Su.init(n, i), zc.init(n, i);
}), G0 = /* @__PURE__ */ q("$ZodGUID", (n, i) => {
  i.pattern ?? (i.pattern = o0), $e.init(n, i);
}), Y0 = /* @__PURE__ */ q("$ZodUUID", (n, i) => {
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
    i.pattern ?? (i.pattern = Xm(r));
  } else
    i.pattern ?? (i.pattern = Xm());
  $e.init(n, i);
}), K0 = /* @__PURE__ */ q("$ZodEmail", (n, i) => {
  i.pattern ?? (i.pattern = c0), $e.init(n, i);
}), X0 = /* @__PURE__ */ q("$ZodURL", (n, i) => {
  $e.init(n, i), n._zod.check = (s) => {
    try {
      const r = s.value.trim();
      if (!i.normalize && i.protocol?.source === g0.source && !/^https?:\/\//i.test(r)) {
        s.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: s.value,
          inst: n,
          continue: !i.abort
        });
        return;
      }
      const c = new URL(r);
      i.hostname && (i.hostname.lastIndex = 0, i.hostname.test(c.hostname) || s.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: i.hostname.source,
        input: s.value,
        inst: n,
        continue: !i.abort
      })), i.protocol && (i.protocol.lastIndex = 0, i.protocol.test(c.protocol.endsWith(":") ? c.protocol.slice(0, -1) : c.protocol) || s.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: i.protocol.source,
        input: s.value,
        inst: n,
        continue: !i.abort
      })), i.normalize ? s.value = c.href : s.value = r;
      return;
    } catch {
      s.issues.push({
        code: "invalid_format",
        format: "url",
        input: s.value,
        inst: n,
        continue: !i.abort
      });
    }
  };
}), V0 = /* @__PURE__ */ q("$ZodEmoji", (n, i) => {
  i.pattern ?? (i.pattern = d0()), $e.init(n, i);
}), J0 = /* @__PURE__ */ q("$ZodNanoID", (n, i) => {
  i.pattern ?? (i.pattern = u0), $e.init(n, i);
}), F0 = /* @__PURE__ */ q("$ZodCUID", (n, i) => {
  i.pattern ?? (i.pattern = n0), $e.init(n, i);
}), I0 = /* @__PURE__ */ q("$ZodCUID2", (n, i) => {
  i.pattern ?? (i.pattern = a0), $e.init(n, i);
}), W0 = /* @__PURE__ */ q("$ZodULID", (n, i) => {
  i.pattern ?? (i.pattern = i0), $e.init(n, i);
}), P0 = /* @__PURE__ */ q("$ZodXID", (n, i) => {
  i.pattern ?? (i.pattern = l0), $e.init(n, i);
}), e_ = /* @__PURE__ */ q("$ZodKSUID", (n, i) => {
  i.pattern ?? (i.pattern = s0), $e.init(n, i);
}), t_ = /* @__PURE__ */ q("$ZodISODateTime", (n, i) => {
  i.pattern ?? (i.pattern = z0(i)), $e.init(n, i);
}), n_ = /* @__PURE__ */ q("$ZodISODate", (n, i) => {
  i.pattern ?? (i.pattern = _0), $e.init(n, i);
}), a_ = /* @__PURE__ */ q("$ZodISOTime", (n, i) => {
  i.pattern ?? (i.pattern = S0(i)), $e.init(n, i);
}), i_ = /* @__PURE__ */ q("$ZodISODuration", (n, i) => {
  i.pattern ?? (i.pattern = r0), $e.init(n, i);
}), l_ = /* @__PURE__ */ q("$ZodIPv4", (n, i) => {
  i.pattern ?? (i.pattern = h0), $e.init(n, i), n._zod.bag.format = "ipv4";
}), s_ = /* @__PURE__ */ q("$ZodIPv6", (n, i) => {
  i.pattern ?? (i.pattern = m0), $e.init(n, i), n._zod.bag.format = "ipv6", n._zod.check = (s) => {
    try {
      new URL(`http://[${s.value}]`);
    } catch {
      s.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: s.value,
        inst: n,
        continue: !i.abort
      });
    }
  };
}), u_ = /* @__PURE__ */ q("$ZodCIDRv4", (n, i) => {
  i.pattern ?? (i.pattern = p0), $e.init(n, i);
}), r_ = /* @__PURE__ */ q("$ZodCIDRv6", (n, i) => {
  i.pattern ?? (i.pattern = v0), $e.init(n, i), n._zod.check = (s) => {
    const r = s.value.split("/");
    try {
      if (r.length !== 2)
        throw new Error();
      const [c, m] = r;
      if (!m)
        throw new Error();
      const h = Number(m);
      if (`${h}` !== m)
        throw new Error();
      if (h < 0 || h > 128)
        throw new Error();
      new URL(`http://[${c}]`);
    } catch {
      s.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: s.value,
        inst: n,
        continue: !i.abort
      });
    }
  };
});
function Xp(n) {
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
const o_ = /* @__PURE__ */ q("$ZodBase64", (n, i) => {
  i.pattern ?? (i.pattern = y0), $e.init(n, i), n._zod.bag.contentEncoding = "base64", n._zod.check = (s) => {
    Xp(s.value) || s.issues.push({
      code: "invalid_format",
      format: "base64",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
});
function c_(n) {
  if (!Bp.test(n))
    return !1;
  const i = n.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), s = i.padEnd(Math.ceil(i.length / 4) * 4, "=");
  return Xp(s);
}
const f_ = /* @__PURE__ */ q("$ZodBase64URL", (n, i) => {
  i.pattern ?? (i.pattern = Bp), $e.init(n, i), n._zod.bag.contentEncoding = "base64url", n._zod.check = (s) => {
    c_(s.value) || s.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), d_ = /* @__PURE__ */ q("$ZodE164", (n, i) => {
  i.pattern ?? (i.pattern = b0), $e.init(n, i);
});
function h_(n, i = null) {
  try {
    const s = n.split(".");
    if (s.length !== 3)
      return !1;
    const [r] = s;
    if (!r)
      return !1;
    const c = JSON.parse(atob(r));
    return !("typ" in c && c?.typ !== "JWT" || !c.alg || i && (!("alg" in c) || c.alg !== i));
  } catch {
    return !1;
  }
}
const m_ = /* @__PURE__ */ q("$ZodJWT", (n, i) => {
  $e.init(n, i), n._zod.check = (s) => {
    h_(s.value, i.alg) || s.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), Vp = /* @__PURE__ */ q("$ZodNumber", (n, i) => {
  He.init(n, i), n._zod.pattern = n._zod.bag.pattern ?? Lp, n._zod.parse = (s, r) => {
    if (i.coerce)
      try {
        s.value = Number(s.value);
      } catch {
      }
    const c = s.value;
    if (typeof c == "number" && !Number.isNaN(c) && Number.isFinite(c))
      return s;
    const m = typeof c == "number" ? Number.isNaN(c) ? "NaN" : Number.isFinite(c) ? void 0 : "Infinity" : void 0;
    return s.issues.push({
      expected: "number",
      code: "invalid_type",
      input: c,
      inst: n,
      ...m ? { received: m } : {}
    }), s;
  };
}), p_ = /* @__PURE__ */ q("$ZodNumberFormat", (n, i) => {
  N0.init(n, i), Vp.init(n, i);
}), v_ = /* @__PURE__ */ q("$ZodBoolean", (n, i) => {
  He.init(n, i), n._zod.pattern = j0, n._zod.parse = (s, r) => {
    if (i.coerce)
      try {
        s.value = !!s.value;
      } catch {
      }
    const c = s.value;
    return typeof c == "boolean" || s.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: c,
      inst: n
    }), s;
  };
}), y_ = /* @__PURE__ */ q("$ZodUndefined", (n, i) => {
  He.init(n, i), n._zod.pattern = T0, n._zod.values = /* @__PURE__ */ new Set([void 0]), n._zod.parse = (s, r) => {
    const c = s.value;
    return typeof c > "u" || s.issues.push({
      expected: "undefined",
      code: "invalid_type",
      input: c,
      inst: n
    }), s;
  };
}), g_ = /* @__PURE__ */ q("$ZodNull", (n, i) => {
  He.init(n, i), n._zod.pattern = E0, n._zod.values = /* @__PURE__ */ new Set([null]), n._zod.parse = (s, r) => {
    const c = s.value;
    return c === null || s.issues.push({
      expected: "null",
      code: "invalid_type",
      input: c,
      inst: n
    }), s;
  };
}), b_ = /* @__PURE__ */ q("$ZodUnknown", (n, i) => {
  He.init(n, i), n._zod.parse = (s) => s;
}), __ = /* @__PURE__ */ q("$ZodNever", (n, i) => {
  He.init(n, i), n._zod.parse = (s, r) => (s.issues.push({
    expected: "never",
    code: "invalid_type",
    input: s.value,
    inst: n
  }), s);
});
function Vm(n, i, s) {
  n.issues.length && i.issues.push(...Ei(s, n.issues)), i.value[s] = n.value;
}
const S_ = /* @__PURE__ */ q("$ZodArray", (n, i) => {
  He.init(n, i), n._zod.parse = (s, r) => {
    const c = s.value;
    if (!Array.isArray(c))
      return s.issues.push({
        expected: "array",
        code: "invalid_type",
        input: c,
        inst: n
      }), s;
    s.value = Array(c.length);
    const m = [];
    for (let h = 0; h < c.length; h++) {
      const v = c[h], y = i.element._zod.run({
        value: v,
        issues: []
      }, r);
      y instanceof Promise ? m.push(y.then((g) => Vm(g, s, h))) : Vm(y, s, h);
    }
    return m.length ? Promise.all(m).then(() => s) : s;
  };
});
function mu(n, i, s, r, c, m) {
  const h = s in r;
  if (n.issues.length) {
    if (c && m && !h)
      return;
    i.issues.push(...Ei(s, n.issues));
  }
  if (!h && !c) {
    n.issues.length || i.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: void 0,
      path: [s]
    });
    return;
  }
  n.value === void 0 ? h && (i.value[s] = void 0) : i.value[s] = n.value;
}
function Jp(n) {
  const i = Object.keys(n.shape);
  for (const r of i)
    if (!n.shape?.[r]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${r}": expected a Zod schema`);
  const s = Rb(n.shape);
  return {
    ...n,
    keys: i,
    keySet: new Set(i),
    numKeys: i.length,
    optionalKeys: new Set(s)
  };
}
function Fp(n, i, s, r, c, m) {
  const h = [], v = c.keySet, y = c.catchall._zod, g = y.def.type, _ = y.optin === "optional", j = y.optout === "optional";
  for (const z in i) {
    if (z === "__proto__" || v.has(z))
      continue;
    if (g === "never") {
      h.push(z);
      continue;
    }
    const O = y.run({ value: i[z], issues: [] }, r);
    O instanceof Promise ? n.push(O.then((N) => mu(N, s, z, i, _, j))) : mu(O, s, z, i, _, j);
  }
  return h.length && s.issues.push({
    code: "unrecognized_keys",
    keys: h,
    input: i,
    inst: m
  }), n.length ? Promise.all(n).then(() => s) : s;
}
const z_ = /* @__PURE__ */ q("$ZodObject", (n, i) => {
  if (He.init(n, i), !Object.getOwnPropertyDescriptor(i, "shape")?.get) {
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
  const r = vc(() => Jp(i));
  qe(n._zod, "propValues", () => {
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
  const c = hu, m = i.catchall;
  let h;
  n._zod.parse = (v, y) => {
    h ?? (h = r.value);
    const g = v.value;
    if (!c(g))
      return v.issues.push({
        expected: "object",
        code: "invalid_type",
        input: g,
        inst: n
      }), v;
    v.value = {};
    const _ = [], j = h.shape;
    for (const z of h.keys) {
      const O = j[z], N = O._zod.optin === "optional", B = O._zod.optout === "optional", X = O._zod.run({ value: g[z], issues: [] }, y);
      X instanceof Promise ? _.push(X.then(($) => mu($, v, z, g, N, B))) : mu(X, v, z, g, N, B);
    }
    return m ? Fp(_, g, v, y, r.value, n) : _.length ? Promise.all(_).then(() => v) : v;
  };
}), w_ = /* @__PURE__ */ q("$ZodObjectJIT", (n, i) => {
  z_.init(n, i);
  const s = n._zod.parse, r = vc(() => Jp(i)), c = (z) => {
    const O = new $0(["shape", "payload", "ctx"]), N = r.value, B = (G) => {
      const P = Km(G);
      return `shape[${P}]._zod.run({ value: input[${P}], issues: [] }, ctx)`;
    };
    O.write("const input = payload.value;");
    const X = /* @__PURE__ */ Object.create(null);
    let $ = 0;
    for (const G of N.keys)
      X[G] = `key_${$++}`;
    O.write("const newResult = {};");
    for (const G of N.keys) {
      const P = X[G], ie = Km(G), ce = z[G], H = ce?._zod?.optin === "optional", R = ce?._zod?.optout === "optional";
      O.write(`const ${P} = ${B(G)};`), H && R ? O.write(`
        if (${P}.issues.length) {
          if (${ie} in input) {
            payload.issues = payload.issues.concat(${P}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${ie}, ...iss.path] : [${ie}]
            })));
          }
        }
        
        if (${P}.value === undefined) {
          if (${ie} in input) {
            newResult[${ie}] = undefined;
          }
        } else {
          newResult[${ie}] = ${P}.value;
        }
        
      `) : H ? O.write(`
        if (${P}.issues.length) {
          payload.issues = payload.issues.concat(${P}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${ie}, ...iss.path] : [${ie}]
          })));
        }
        
        if (${P}.value === undefined) {
          if (${ie} in input) {
            newResult[${ie}] = undefined;
          }
        } else {
          newResult[${ie}] = ${P}.value;
        }
        
      `) : O.write(`
        const ${P}_present = ${ie} in input;
        if (${P}.issues.length) {
          payload.issues = payload.issues.concat(${P}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${ie}, ...iss.path] : [${ie}]
          })));
        }
        if (!${P}_present && !${P}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${ie}]
          });
        }

        if (${P}_present) {
          if (${P}.value === undefined) {
            newResult[${ie}] = undefined;
          } else {
            newResult[${ie}] = ${P}.value;
          }
        }

      `);
    }
    O.write("payload.value = newResult;"), O.write("return payload;");
    const ae = O.compile();
    return (G, P) => ae(z, G, P);
  };
  let m;
  const h = hu, v = !pc.jitless, g = v && Mb.value, _ = i.catchall;
  let j;
  n._zod.parse = (z, O) => {
    j ?? (j = r.value);
    const N = z.value;
    return h(N) ? v && g && O?.async === !1 && O.jitless !== !0 ? (m || (m = c(i.shape)), z = m(z, O), _ ? Fp([], N, z, O, j, n) : z) : s(z, O) : (z.issues.push({
      expected: "object",
      code: "invalid_type",
      input: N,
      inst: n
    }), z);
  };
});
function Jm(n, i, s, r) {
  for (const m of n)
    if (m.issues.length === 0)
      return i.value = m.value, i;
  const c = n.filter((m) => !ji(m));
  return c.length === 1 ? (i.value = c[0].value, c[0]) : (i.issues.push({
    code: "invalid_union",
    input: i.value,
    inst: s,
    errors: n.map((m) => m.issues.map((h) => Dn(h, r, Mn())))
  }), i);
}
const x_ = /* @__PURE__ */ q("$ZodUnion", (n, i) => {
  He.init(n, i), qe(n._zod, "optin", () => i.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), qe(n._zod, "optout", () => i.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), qe(n._zod, "values", () => {
    if (i.options.every((r) => r._zod.values))
      return new Set(i.options.flatMap((r) => Array.from(r._zod.values)));
  }), qe(n._zod, "pattern", () => {
    if (i.options.every((r) => r._zod.pattern)) {
      const r = i.options.map((c) => c._zod.pattern);
      return new RegExp(`^(${r.map((c) => gc(c.source)).join("|")})$`);
    }
  });
  const s = i.options.length === 1 ? i.options[0]._zod.run : null;
  n._zod.parse = (r, c) => {
    if (s)
      return s(r, c);
    let m = !1;
    const h = [];
    for (const v of i.options) {
      const y = v._zod.run({
        value: r.value,
        issues: []
      }, c);
      if (y instanceof Promise)
        h.push(y), m = !0;
      else {
        if (y.issues.length === 0)
          return y;
        h.push(y);
      }
    }
    return m ? Promise.all(h).then((v) => Jm(v, r, n, c)) : Jm(h, r, n, c);
  };
}), j_ = /* @__PURE__ */ q("$ZodIntersection", (n, i) => {
  He.init(n, i), n._zod.parse = (s, r) => {
    const c = s.value, m = i.left._zod.run({ value: c, issues: [] }, r), h = i.right._zod.run({ value: c, issues: [] }, r);
    return m instanceof Promise || h instanceof Promise ? Promise.all([m, h]).then(([y, g]) => Fm(s, y, g)) : Fm(s, m, h);
  };
});
function nc(n, i) {
  if (n === i)
    return { valid: !0, data: n };
  if (n instanceof Date && i instanceof Date && +n == +i)
    return { valid: !0, data: n };
  if (Ci(n) && Ci(i)) {
    const s = Object.keys(i), r = Object.keys(n).filter((m) => s.indexOf(m) !== -1), c = { ...n, ...i };
    for (const m of r) {
      const h = nc(n[m], i[m]);
      if (!h.valid)
        return {
          valid: !1,
          mergeErrorPath: [m, ...h.mergeErrorPath]
        };
      c[m] = h.data;
    }
    return { valid: !0, data: c };
  }
  if (Array.isArray(n) && Array.isArray(i)) {
    if (n.length !== i.length)
      return { valid: !1, mergeErrorPath: [] };
    const s = [];
    for (let r = 0; r < n.length; r++) {
      const c = n[r], m = i[r], h = nc(c, m);
      if (!h.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...h.mergeErrorPath]
        };
      s.push(h.data);
    }
    return { valid: !0, data: s };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Fm(n, i, s) {
  const r = /* @__PURE__ */ new Map();
  let c;
  for (const v of i.issues)
    if (v.code === "unrecognized_keys") {
      c ?? (c = v);
      for (const y of v.keys)
        r.has(y) || r.set(y, {}), r.get(y).l = !0;
    } else
      n.issues.push(v);
  for (const v of s.issues)
    if (v.code === "unrecognized_keys")
      for (const y of v.keys)
        r.has(y) || r.set(y, {}), r.get(y).r = !0;
    else
      n.issues.push(v);
  const m = [...r].filter(([, v]) => v.l && v.r).map(([v]) => v);
  if (m.length && c && n.issues.push({ ...c, keys: m }), ji(n))
    return n;
  const h = nc(i.value, s.value);
  if (!h.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(h.mergeErrorPath)}`);
  return n.value = h.data, n;
}
const E_ = /* @__PURE__ */ q("$ZodRecord", (n, i) => {
  He.init(n, i), n._zod.parse = (s, r) => {
    const c = s.value;
    if (!Ci(c))
      return s.issues.push({
        expected: "record",
        code: "invalid_type",
        input: c,
        inst: n
      }), s;
    const m = [], h = i.keyType._zod.values;
    if (h) {
      s.value = {};
      const v = /* @__PURE__ */ new Set();
      for (const g of h)
        if (typeof g == "string" || typeof g == "number" || typeof g == "symbol") {
          v.add(typeof g == "number" ? g.toString() : g);
          const _ = i.keyType._zod.run({ value: g, issues: [] }, r);
          if (_ instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          if (_.issues.length) {
            s.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: _.issues.map((O) => Dn(O, r, Mn())),
              input: g,
              path: [g],
              inst: n
            });
            continue;
          }
          const j = _.value, z = i.valueType._zod.run({ value: c[g], issues: [] }, r);
          z instanceof Promise ? m.push(z.then((O) => {
            O.issues.length && s.issues.push(...Ei(g, O.issues)), s.value[j] = O.value;
          })) : (z.issues.length && s.issues.push(...Ei(g, z.issues)), s.value[j] = z.value);
        }
      let y;
      for (const g in c)
        v.has(g) || (y = y ?? [], y.push(g));
      y && y.length > 0 && s.issues.push({
        code: "unrecognized_keys",
        input: c,
        inst: n,
        keys: y
      });
    } else {
      s.value = {};
      for (const v of Reflect.ownKeys(c)) {
        if (v === "__proto__" || !Object.prototype.propertyIsEnumerable.call(c, v))
          continue;
        let y = i.keyType._zod.run({ value: v, issues: [] }, r);
        if (y instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof v == "string" && Lp.test(v) && y.issues.length) {
          const j = i.keyType._zod.run({ value: Number(v), issues: [] }, r);
          if (j instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          j.issues.length === 0 && (y = j);
        }
        if (y.issues.length) {
          i.mode === "loose" ? s.value[v] = c[v] : s.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: y.issues.map((j) => Dn(j, r, Mn())),
            input: v,
            path: [v],
            inst: n
          });
          continue;
        }
        const _ = i.valueType._zod.run({ value: c[v], issues: [] }, r);
        _ instanceof Promise ? m.push(_.then((j) => {
          j.issues.length && s.issues.push(...Ei(v, j.issues)), s.value[y.value] = j.value;
        })) : (_.issues.length && s.issues.push(...Ei(v, _.issues)), s.value[y.value] = _.value);
      }
    }
    return m.length ? Promise.all(m).then(() => s) : s;
  };
}), T_ = /* @__PURE__ */ q("$ZodEnum", (n, i) => {
  He.init(n, i);
  const s = Rp(i.entries), r = new Set(s);
  n._zod.values = r, n._zod.pattern = new RegExp(`^(${s.filter((c) => Db.has(typeof c)).map((c) => typeof c == "string" ? gu(c) : c.toString()).join("|")})$`), n._zod.parse = (c, m) => {
    const h = c.value;
    return r.has(h) || c.issues.push({
      code: "invalid_value",
      values: s,
      input: h,
      inst: n
    }), c;
  };
}), A_ = /* @__PURE__ */ q("$ZodTransform", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      throw new Dp(n.constructor.name);
    const c = i.transform(s.value, s);
    if (r.async)
      return (c instanceof Promise ? c : Promise.resolve(c)).then((h) => (s.value = h, s.fallback = !0, s));
    if (c instanceof Promise)
      throw new Ti();
    return s.value = c, s.fallback = !0, s;
  };
});
function Im(n, i) {
  return i === void 0 && (n.issues.length || n.fallback) ? { issues: [], value: void 0 } : n;
}
const Ip = /* @__PURE__ */ q("$ZodOptional", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", n._zod.optout = "optional", qe(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, void 0]) : void 0), qe(n._zod, "pattern", () => {
    const s = i.innerType._zod.pattern;
    return s ? new RegExp(`^(${gc(s.source)})?$`) : void 0;
  }), n._zod.parse = (s, r) => {
    if (i.innerType._zod.optin === "optional") {
      const c = s.value, m = i.innerType._zod.run(s, r);
      return m instanceof Promise ? m.then((h) => Im(h, c)) : Im(m, c);
    }
    return s.value === void 0 ? s : i.innerType._zod.run(s, r);
  };
}), O_ = /* @__PURE__ */ q("$ZodExactOptional", (n, i) => {
  Ip.init(n, i), qe(n._zod, "values", () => i.innerType._zod.values), qe(n._zod, "pattern", () => i.innerType._zod.pattern), n._zod.parse = (s, r) => i.innerType._zod.run(s, r);
}), C_ = /* @__PURE__ */ q("$ZodNullable", (n, i) => {
  He.init(n, i), qe(n._zod, "optin", () => i.innerType._zod.optin), qe(n._zod, "optout", () => i.innerType._zod.optout), qe(n._zod, "pattern", () => {
    const s = i.innerType._zod.pattern;
    return s ? new RegExp(`^(${gc(s.source)}|null)$`) : void 0;
  }), qe(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, null]) : void 0), n._zod.parse = (s, r) => s.value === null ? s : i.innerType._zod.run(s, r);
}), N_ = /* @__PURE__ */ q("$ZodDefault", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", qe(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    if (s.value === void 0)
      return s.value = i.defaultValue, s;
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => Wm(m, i)) : Wm(c, i);
  };
});
function Wm(n, i) {
  return n.value === void 0 && (n.value = i.defaultValue), n;
}
const M_ = /* @__PURE__ */ q("$ZodPrefault", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", qe(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => (r.direction === "backward" || s.value === void 0 && (s.value = i.defaultValue), i.innerType._zod.run(s, r));
}), D_ = /* @__PURE__ */ q("$ZodNonOptional", (n, i) => {
  He.init(n, i), qe(n._zod, "values", () => {
    const s = i.innerType._zod.values;
    return s ? new Set([...s].filter((r) => r !== void 0)) : void 0;
  }), n._zod.parse = (s, r) => {
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => Pm(m, n)) : Pm(c, n);
  };
});
function Pm(n, i) {
  return !n.issues.length && n.value === void 0 && n.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: n.value,
    inst: i
  }), n;
}
const R_ = /* @__PURE__ */ q("$ZodCatch", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", qe(n._zod, "optout", () => i.innerType._zod.optout), qe(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => (s.value = m.value, m.issues.length && (s.value = i.catchValue({
      ...s,
      error: {
        issues: m.issues.map((h) => Dn(h, r, Mn()))
      },
      input: s.value
    }), s.issues = [], s.fallback = !0), s)) : (s.value = c.value, c.issues.length && (s.value = i.catchValue({
      ...s,
      error: {
        issues: c.issues.map((m) => Dn(m, r, Mn()))
      },
      input: s.value
    }), s.issues = [], s.fallback = !0), s);
  };
}), q_ = /* @__PURE__ */ q("$ZodPipe", (n, i) => {
  He.init(n, i), qe(n._zod, "values", () => i.in._zod.values), qe(n._zod, "optin", () => i.in._zod.optin), qe(n._zod, "optout", () => i.out._zod.optout), qe(n._zod, "propValues", () => i.in._zod.propValues), n._zod.parse = (s, r) => {
    if (r.direction === "backward") {
      const m = i.out._zod.run(s, r);
      return m instanceof Promise ? m.then((h) => su(h, i.in, r)) : su(m, i.in, r);
    }
    const c = i.in._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => su(m, i.out, r)) : su(c, i.out, r);
  };
});
function su(n, i, s) {
  return n.issues.length ? (n.aborted = !0, n) : i._zod.run({ value: n.value, issues: n.issues, fallback: n.fallback }, s);
}
const U_ = /* @__PURE__ */ q("$ZodReadonly", (n, i) => {
  He.init(n, i), qe(n._zod, "propValues", () => i.innerType._zod.propValues), qe(n._zod, "values", () => i.innerType._zod.values), qe(n._zod, "optin", () => i.innerType?._zod?.optin), qe(n._zod, "optout", () => i.innerType?._zod?.optout), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then(ep) : ep(c);
  };
});
function ep(n) {
  return n.value = Object.freeze(n.value), n;
}
const Z_ = /* @__PURE__ */ q("$ZodCustom", (n, i) => {
  xt.init(n, i), He.init(n, i), n._zod.parse = (s, r) => s, n._zod.check = (s) => {
    const r = s.value, c = i.fn(r);
    if (c instanceof Promise)
      return c.then((m) => tp(m, s, r, n));
    tp(c, s, r, n);
  };
});
function tp(n, i, s, r) {
  if (!n) {
    const c = {
      code: "custom",
      input: s,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (c.params = r._zod.def.params), i.issues.push(Ul(c));
  }
}
var np;
class Q_ {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(i, ...s) {
    const r = s[0];
    return this._map.set(i, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, i), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(i) {
    const s = this._map.get(i);
    return s && typeof s == "object" && "id" in s && this._idmap.delete(s.id), this._map.delete(i), this;
  }
  get(i) {
    const s = i._zod.parent;
    if (s) {
      const r = { ...this.get(s) ?? {} };
      delete r.id;
      const c = { ...r, ...this._map.get(i) };
      return Object.keys(c).length ? c : void 0;
    }
    return this._map.get(i);
  }
  has(i) {
    return this._map.has(i);
  }
}
function k_() {
  return new Q_();
}
(np = globalThis).__zod_globalRegistry ?? (np.__zod_globalRegistry = k_());
const Dl = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function B_(n, i) {
  return new n({
    type: "string",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function H_(n, i) {
  return new n({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function ap(n, i) {
  return new n({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function $_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function L_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function G_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function Y_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function K_(n, i) {
  return new n({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function X_(n, i) {
  return new n({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function V_(n, i) {
  return new n({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function J_(n, i) {
  return new n({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function F_(n, i) {
  return new n({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function I_(n, i) {
  return new n({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function W_(n, i) {
  return new n({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function P_(n, i) {
  return new n({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function eS(n, i) {
  return new n({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function tS(n, i) {
  return new n({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function nS(n, i) {
  return new n({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function aS(n, i) {
  return new n({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function iS(n, i) {
  return new n({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function lS(n, i) {
  return new n({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function sS(n, i) {
  return new n({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function uS(n, i) {
  return new n({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function rS(n, i) {
  return new n({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function oS(n, i) {
  return new n({
    type: "string",
    format: "date",
    check: "string_format",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function cS(n, i) {
  return new n({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function fS(n, i) {
  return new n({
    type: "string",
    format: "duration",
    check: "string_format",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function dS(n, i) {
  return new n({
    type: "number",
    checks: [],
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function hS(n, i) {
  return new n({
    type: "number",
    coerce: !0,
    checks: [],
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function mS(n, i) {
  return new n({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function pS(n, i) {
  return new n({
    type: "boolean",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function vS(n, i) {
  return new n({
    type: "undefined",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function yS(n, i) {
  return new n({
    type: "null",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function gS(n) {
  return new n({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function bS(n, i) {
  return new n({
    type: "never",
    ...ne(i)
  });
}
// @__NO_SIDE_EFFECTS__
function ip(n, i) {
  return new Yp({
    check: "less_than",
    ...ne(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Yo(n, i) {
  return new Yp({
    check: "less_than",
    ...ne(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function lp(n, i) {
  return new Kp({
    check: "greater_than",
    ...ne(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Ko(n, i) {
  return new Kp({
    check: "greater_than",
    ...ne(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function sp(n, i) {
  return new C0({
    check: "multiple_of",
    ...ne(i),
    value: n
  });
}
// @__NO_SIDE_EFFECTS__
function Wp(n, i) {
  return new M0({
    check: "max_length",
    ...ne(i),
    maximum: n
  });
}
// @__NO_SIDE_EFFECTS__
function pu(n, i) {
  return new D0({
    check: "min_length",
    ...ne(i),
    minimum: n
  });
}
// @__NO_SIDE_EFFECTS__
function Pp(n, i) {
  return new R0({
    check: "length_equals",
    ...ne(i),
    length: n
  });
}
// @__NO_SIDE_EFFECTS__
function _S(n, i) {
  return new q0({
    check: "string_format",
    format: "regex",
    ...ne(i),
    pattern: n
  });
}
// @__NO_SIDE_EFFECTS__
function SS(n) {
  return new U0({
    check: "string_format",
    format: "lowercase",
    ...ne(n)
  });
}
// @__NO_SIDE_EFFECTS__
function zS(n) {
  return new Z0({
    check: "string_format",
    format: "uppercase",
    ...ne(n)
  });
}
// @__NO_SIDE_EFFECTS__
function wS(n, i) {
  return new Q0({
    check: "string_format",
    format: "includes",
    ...ne(i),
    includes: n
  });
}
// @__NO_SIDE_EFFECTS__
function xS(n, i) {
  return new k0({
    check: "string_format",
    format: "starts_with",
    ...ne(i),
    prefix: n
  });
}
// @__NO_SIDE_EFFECTS__
function jS(n, i) {
  return new B0({
    check: "string_format",
    format: "ends_with",
    ...ne(i),
    suffix: n
  });
}
// @__NO_SIDE_EFFECTS__
function Di(n) {
  return new H0({
    check: "overwrite",
    tx: n
  });
}
// @__NO_SIDE_EFFECTS__
function ES(n) {
  return /* @__PURE__ */ Di((i) => i.normalize(n));
}
// @__NO_SIDE_EFFECTS__
function TS() {
  return /* @__PURE__ */ Di((n) => n.trim());
}
// @__NO_SIDE_EFFECTS__
function AS() {
  return /* @__PURE__ */ Di((n) => n.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function OS() {
  return /* @__PURE__ */ Di((n) => n.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function CS() {
  return /* @__PURE__ */ Di((n) => Nb(n));
}
// @__NO_SIDE_EFFECTS__
function NS(n, i, s) {
  return new n({
    type: "array",
    element: i,
    // get element() {
    //   return element;
    // },
    ...ne(s)
  });
}
// @__NO_SIDE_EFFECTS__
function MS(n, i, s) {
  return new n({
    type: "custom",
    check: "custom",
    fn: i,
    ...ne(s)
  });
}
// @__NO_SIDE_EFFECTS__
function DS(n, i) {
  const s = /* @__PURE__ */ RS((r) => (r.addIssue = (c) => {
    if (typeof c == "string")
      r.issues.push(Ul(c, r.value, s._zod.def));
    else {
      const m = c;
      m.fatal && (m.continue = !1), m.code ?? (m.code = "custom"), m.input ?? (m.input = r.value), m.inst ?? (m.inst = s), m.continue ?? (m.continue = !s._zod.def.abort), r.issues.push(Ul(m));
    }
  }, n(r.value, r)), i);
  return s;
}
// @__NO_SIDE_EFFECTS__
function RS(n, i) {
  const s = new xt({
    check: "custom",
    ...ne(i)
  });
  return s._zod.check = n, s;
}
function ev(n) {
  let i = n?.target ?? "draft-2020-12";
  return i === "draft-4" && (i = "draft-04"), i === "draft-7" && (i = "draft-07"), {
    processors: n.processors ?? {},
    metadataRegistry: n?.metadata ?? Dl,
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
function et(n, i, s = { path: [], schemaPath: [] }) {
  var r;
  const c = n._zod.def, m = i.seen.get(n);
  if (m)
    return m.count++, s.schemaPath.includes(n) && (m.cycle = s.path), m.schema;
  const h = { schema: {}, count: 1, cycle: void 0, path: s.path };
  i.seen.set(n, h);
  const v = n._zod.toJSONSchema?.();
  if (v)
    h.schema = v;
  else {
    const _ = {
      ...s,
      schemaPath: [...s.schemaPath, n],
      path: s.path
    };
    if (n._zod.processJSONSchema)
      n._zod.processJSONSchema(i, h.schema, _);
    else {
      const z = h.schema, O = i.processors[c.type];
      if (!O)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${c.type}`);
      O(n, i, z, _);
    }
    const j = n._zod.parent;
    j && (h.ref || (h.ref = j), et(j, i, _), i.seen.get(j).isParent = !0);
  }
  const y = i.metadataRegistry.get(n);
  return y && Object.assign(h.schema, y), i.io === "input" && pt(n) && (delete h.schema.examples, delete h.schema.default), i.io === "input" && "_prefault" in h.schema && ((r = h.schema).default ?? (r.default = h.schema._prefault)), delete h.schema._prefault, i.seen.get(n).schema;
}
function tv(n, i) {
  const s = n.seen.get(i);
  if (!s)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const h of n.seen.entries()) {
    const v = n.metadataRegistry.get(h[0])?.id;
    if (v) {
      const y = r.get(v);
      if (y && y !== h[0])
        throw new Error(`Duplicate schema id "${v}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(v, h[0]);
    }
  }
  const c = (h) => {
    const v = n.target === "draft-2020-12" ? "$defs" : "definitions";
    if (n.external) {
      const j = n.external.registry.get(h[0])?.id, z = n.external.uri ?? ((N) => N);
      if (j)
        return { ref: z(j) };
      const O = h[1].defId ?? h[1].schema.id ?? `schema${n.counter++}`;
      return h[1].defId = O, { defId: O, ref: `${z("__shared")}#/${v}/${O}` };
    }
    if (h[1] === s)
      return { ref: "#" };
    const g = `#/${v}/`, _ = h[1].schema.id ?? `__schema${n.counter++}`;
    return { defId: _, ref: g + _ };
  }, m = (h) => {
    if (h[1].schema.$ref)
      return;
    const v = h[1], { ref: y, defId: g } = c(h);
    v.def = { ...v.schema }, g && (v.defId = g);
    const _ = v.schema;
    for (const j in _)
      delete _[j];
    _.$ref = y;
  };
  if (n.cycles === "throw")
    for (const h of n.seen.entries()) {
      const v = h[1];
      if (v.cycle)
        throw new Error(`Cycle detected: #/${v.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const h of n.seen.entries()) {
    const v = h[1];
    if (i === h[0]) {
      m(h);
      continue;
    }
    if (n.external) {
      const g = n.external.registry.get(h[0])?.id;
      if (i !== h[0] && g) {
        m(h);
        continue;
      }
    }
    if (n.metadataRegistry.get(h[0])?.id) {
      m(h);
      continue;
    }
    if (v.cycle) {
      m(h);
      continue;
    }
    if (v.count > 1 && n.reused === "ref") {
      m(h);
      continue;
    }
  }
}
function nv(n, i) {
  const s = n.seen.get(i);
  if (!s)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (v) => {
    const y = n.seen.get(v);
    if (y.ref === null)
      return;
    const g = y.def ?? y.schema, _ = { ...g }, j = y.ref;
    if (y.ref = null, j) {
      r(j);
      const O = n.seen.get(j), N = O.schema;
      if (N.$ref && (n.target === "draft-07" || n.target === "draft-04" || n.target === "openapi-3.0") ? (g.allOf = g.allOf ?? [], g.allOf.push(N)) : Object.assign(g, N), Object.assign(g, _), v._zod.parent === j)
        for (const X in g)
          X === "$ref" || X === "allOf" || X in _ || delete g[X];
      if (N.$ref && O.def)
        for (const X in g)
          X === "$ref" || X === "allOf" || X in O.def && JSON.stringify(g[X]) === JSON.stringify(O.def[X]) && delete g[X];
    }
    const z = v._zod.parent;
    if (z && z !== j) {
      r(z);
      const O = n.seen.get(z);
      if (O?.schema.$ref && (g.$ref = O.schema.$ref, O.def))
        for (const N in g)
          N === "$ref" || N === "allOf" || N in O.def && JSON.stringify(g[N]) === JSON.stringify(O.def[N]) && delete g[N];
    }
    n.override({
      zodSchema: v,
      jsonSchema: g,
      path: y.path ?? []
    });
  };
  for (const v of [...n.seen.entries()].reverse())
    r(v[0]);
  const c = {};
  if (n.target === "draft-2020-12" ? c.$schema = "https://json-schema.org/draft/2020-12/schema" : n.target === "draft-07" ? c.$schema = "http://json-schema.org/draft-07/schema#" : n.target === "draft-04" ? c.$schema = "http://json-schema.org/draft-04/schema#" : n.target, n.external?.uri) {
    const v = n.external.registry.get(i)?.id;
    if (!v)
      throw new Error("Schema is missing an `id` property");
    c.$id = n.external.uri(v);
  }
  Object.assign(c, s.def ?? s.schema);
  const m = n.metadataRegistry.get(i)?.id;
  m !== void 0 && c.id === m && delete c.id;
  const h = n.external?.defs ?? {};
  for (const v of n.seen.entries()) {
    const y = v[1];
    y.def && y.defId && (y.def.id === y.defId && delete y.def.id, h[y.defId] = y.def);
  }
  n.external || Object.keys(h).length > 0 && (n.target === "draft-2020-12" ? c.$defs = h : c.definitions = h);
  try {
    const v = JSON.parse(JSON.stringify(c));
    return Object.defineProperty(v, "~standard", {
      value: {
        ...i["~standard"],
        jsonSchema: {
          input: vu(i, "input", n.processors),
          output: vu(i, "output", n.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), v;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function pt(n, i) {
  const s = i ?? { seen: /* @__PURE__ */ new Set() };
  if (s.seen.has(n))
    return !1;
  s.seen.add(n);
  const r = n._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return pt(r.element, s);
  if (r.type === "set")
    return pt(r.valueType, s);
  if (r.type === "lazy")
    return pt(r.getter(), s);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return pt(r.innerType, s);
  if (r.type === "intersection")
    return pt(r.left, s) || pt(r.right, s);
  if (r.type === "record" || r.type === "map")
    return pt(r.keyType, s) || pt(r.valueType, s);
  if (r.type === "pipe")
    return n._zod.traits.has("$ZodCodec") ? !0 : pt(r.in, s) || pt(r.out, s);
  if (r.type === "object") {
    for (const c in r.shape)
      if (pt(r.shape[c], s))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const c of r.options)
      if (pt(c, s))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const c of r.items)
      if (pt(c, s))
        return !0;
    return !!(r.rest && pt(r.rest, s));
  }
  return !1;
}
const qS = (n, i = {}) => (s) => {
  const r = ev({ ...s, processors: i });
  return et(n, r), tv(r, n), nv(r, n);
}, vu = (n, i, s = {}) => (r) => {
  const { libraryOptions: c, target: m } = r ?? {}, h = ev({ ...c ?? {}, target: m, io: i, processors: s });
  return et(n, h), tv(h, n), nv(h, n);
}, US = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, ZS = (n, i, s, r) => {
  const c = s;
  c.type = "string";
  const { minimum: m, maximum: h, format: v, patterns: y, contentEncoding: g } = n._zod.bag;
  if (typeof m == "number" && (c.minLength = m), typeof h == "number" && (c.maxLength = h), v && (c.format = US[v] ?? v, c.format === "" && delete c.format, v === "time" && delete c.format), g && (c.contentEncoding = g), y && y.size > 0) {
    const _ = [...y];
    _.length === 1 ? c.pattern = _[0].source : _.length > 1 && (c.allOf = [
      ..._.map((j) => ({
        ...i.target === "draft-07" || i.target === "draft-04" || i.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: j.source
      }))
    ]);
  }
}, QS = (n, i, s, r) => {
  const c = s, { minimum: m, maximum: h, format: v, multipleOf: y, exclusiveMaximum: g, exclusiveMinimum: _ } = n._zod.bag;
  typeof v == "string" && v.includes("int") ? c.type = "integer" : c.type = "number";
  const j = typeof _ == "number" && _ >= (m ?? Number.NEGATIVE_INFINITY), z = typeof g == "number" && g <= (h ?? Number.POSITIVE_INFINITY), O = i.target === "draft-04" || i.target === "openapi-3.0";
  j ? O ? (c.minimum = _, c.exclusiveMinimum = !0) : c.exclusiveMinimum = _ : typeof m == "number" && (c.minimum = m), z ? O ? (c.maximum = g, c.exclusiveMaximum = !0) : c.exclusiveMaximum = g : typeof h == "number" && (c.maximum = h), typeof y == "number" && (c.multipleOf = y);
}, kS = (n, i, s, r) => {
  s.type = "boolean";
}, BS = (n, i, s, r) => {
  i.target === "openapi-3.0" ? (s.type = "string", s.nullable = !0, s.enum = [null]) : s.type = "null";
}, HS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Undefined cannot be represented in JSON Schema");
}, $S = (n, i, s, r) => {
  s.not = {};
}, LS = (n, i, s, r) => {
}, GS = (n, i, s, r) => {
  const c = n._zod.def, m = Rp(c.entries);
  m.every((h) => typeof h == "number") && (s.type = "number"), m.every((h) => typeof h == "string") && (s.type = "string"), s.enum = m;
}, YS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, KS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, XS = (n, i, s, r) => {
  const c = s, m = n._zod.def, { minimum: h, maximum: v } = n._zod.bag;
  typeof h == "number" && (c.minItems = h), typeof v == "number" && (c.maxItems = v), c.type = "array", c.items = et(m.element, i, {
    ...r,
    path: [...r.path, "items"]
  });
}, VS = (n, i, s, r) => {
  const c = s, m = n._zod.def;
  c.type = "object", c.properties = {};
  const h = m.shape;
  for (const g in h)
    c.properties[g] = et(h[g], i, {
      ...r,
      path: [...r.path, "properties", g]
    });
  const v = new Set(Object.keys(h)), y = new Set([...v].filter((g) => {
    const _ = m.shape[g]._zod;
    return i.io === "input" ? _.optin === void 0 : _.optout === void 0;
  }));
  y.size > 0 && (c.required = Array.from(y)), m.catchall?._zod.def.type === "never" ? c.additionalProperties = !1 : m.catchall ? m.catchall && (c.additionalProperties = et(m.catchall, i, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : i.io === "output" && (c.additionalProperties = !1);
}, JS = (n, i, s, r) => {
  const c = n._zod.def, m = c.inclusive === !1, h = c.options.map((v, y) => et(v, i, {
    ...r,
    path: [...r.path, m ? "oneOf" : "anyOf", y]
  }));
  m ? s.oneOf = h : s.anyOf = h;
}, FS = (n, i, s, r) => {
  const c = n._zod.def, m = et(c.left, i, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), h = et(c.right, i, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), v = (g) => "allOf" in g && Object.keys(g).length === 1, y = [
    ...v(m) ? m.allOf : [m],
    ...v(h) ? h.allOf : [h]
  ];
  s.allOf = y;
}, IS = (n, i, s, r) => {
  const c = s, m = n._zod.def;
  c.type = "object";
  const h = m.keyType, y = h._zod.bag?.patterns;
  if (m.mode === "loose" && y && y.size > 0) {
    const _ = et(m.valueType, i, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    c.patternProperties = {};
    for (const j of y)
      c.patternProperties[j.source] = _;
  } else
    (i.target === "draft-07" || i.target === "draft-2020-12") && (c.propertyNames = et(m.keyType, i, {
      ...r,
      path: [...r.path, "propertyNames"]
    })), c.additionalProperties = et(m.valueType, i, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  const g = h._zod.values;
  if (g) {
    const _ = [...g].filter((j) => typeof j == "string" || typeof j == "number");
    _.length > 0 && (c.required = _);
  }
}, WS = (n, i, s, r) => {
  const c = n._zod.def, m = et(c.innerType, i, r), h = i.seen.get(n);
  i.target === "openapi-3.0" ? (h.ref = c.innerType, s.nullable = !0) : s.anyOf = [m, { type: "null" }];
}, PS = (n, i, s, r) => {
  const c = n._zod.def;
  et(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
}, e1 = (n, i, s, r) => {
  const c = n._zod.def;
  et(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, s.default = JSON.parse(JSON.stringify(c.defaultValue));
}, t1 = (n, i, s, r) => {
  const c = n._zod.def;
  et(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, i.io === "input" && (s._prefault = JSON.parse(JSON.stringify(c.defaultValue)));
}, n1 = (n, i, s, r) => {
  const c = n._zod.def;
  et(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
  let h;
  try {
    h = c.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  s.default = h;
}, a1 = (n, i, s, r) => {
  const c = n._zod.def, m = c.in._zod.traits.has("$ZodTransform"), h = i.io === "input" ? m ? c.out : c.in : c.out;
  et(h, i, r);
  const v = i.seen.get(n);
  v.ref = h;
}, i1 = (n, i, s, r) => {
  const c = n._zod.def;
  et(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, s.readOnly = !0;
}, av = (n, i, s, r) => {
  const c = n._zod.def;
  et(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
}, l1 = /* @__PURE__ */ q("ZodISODateTime", (n, i) => {
  t_.init(n, i), Ge.init(n, i);
});
function s1(n) {
  return /* @__PURE__ */ rS(l1, n);
}
const u1 = /* @__PURE__ */ q("ZodISODate", (n, i) => {
  n_.init(n, i), Ge.init(n, i);
});
function r1(n) {
  return /* @__PURE__ */ oS(u1, n);
}
const o1 = /* @__PURE__ */ q("ZodISOTime", (n, i) => {
  a_.init(n, i), Ge.init(n, i);
});
function c1(n) {
  return /* @__PURE__ */ cS(o1, n);
}
const f1 = /* @__PURE__ */ q("ZodISODuration", (n, i) => {
  i_.init(n, i), Ge.init(n, i);
});
function d1(n) {
  return /* @__PURE__ */ fS(f1, n);
}
const h1 = (n, i) => {
  Qp.init(n, i), n.name = "ZodError", Object.defineProperties(n, {
    format: {
      value: (s) => Yb(n, s)
      // enumerable: false,
    },
    flatten: {
      value: (s) => Gb(n, s)
      // enumerable: false,
    },
    addIssue: {
      value: (s) => {
        n.issues.push(s), n.message = JSON.stringify(n.issues, tc, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (s) => {
        n.issues.push(...s), n.message = JSON.stringify(n.issues, tc, 2);
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
}, Wt = /* @__PURE__ */ q("ZodError", h1, {
  Parent: Error
}), m1 = /* @__PURE__ */ _c(Wt), p1 = /* @__PURE__ */ Sc(Wt), v1 = /* @__PURE__ */ bu(Wt), y1 = /* @__PURE__ */ _u(Wt), g1 = /* @__PURE__ */ Vb(Wt), b1 = /* @__PURE__ */ Jb(Wt), _1 = /* @__PURE__ */ Fb(Wt), S1 = /* @__PURE__ */ Ib(Wt), z1 = /* @__PURE__ */ Wb(Wt), w1 = /* @__PURE__ */ Pb(Wt), x1 = /* @__PURE__ */ e0(Wt), j1 = /* @__PURE__ */ t0(Wt), up = /* @__PURE__ */ new WeakMap();
function Zl(n, i, s) {
  const r = Object.getPrototypeOf(n);
  let c = up.get(r);
  if (c || (c = /* @__PURE__ */ new Set(), up.set(r, c)), !c.has(i)) {
    c.add(i);
    for (const m in s) {
      const h = s[m];
      Object.defineProperty(r, m, {
        configurable: !0,
        enumerable: !1,
        get() {
          const v = h.bind(this);
          return Object.defineProperty(this, m, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: v
          }), v;
        },
        set(v) {
          Object.defineProperty(this, m, {
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
const Le = /* @__PURE__ */ q("ZodType", (n, i) => (He.init(n, i), Object.assign(n["~standard"], {
  jsonSchema: {
    input: vu(n, "input"),
    output: vu(n, "output")
  }
}), n.toJSONSchema = qS(n, {}), n.def = i, n.type = i.type, Object.defineProperty(n, "_def", { value: i }), n.parse = (s, r) => m1(n, s, r, { callee: n.parse }), n.safeParse = (s, r) => v1(n, s, r), n.parseAsync = async (s, r) => p1(n, s, r, { callee: n.parseAsync }), n.safeParseAsync = async (s, r) => y1(n, s, r), n.spa = n.safeParseAsync, n.encode = (s, r) => g1(n, s, r), n.decode = (s, r) => b1(n, s, r), n.encodeAsync = async (s, r) => _1(n, s, r), n.decodeAsync = async (s, r) => S1(n, s, r), n.safeEncode = (s, r) => z1(n, s, r), n.safeDecode = (s, r) => w1(n, s, r), n.safeEncodeAsync = async (s, r) => x1(n, s, r), n.safeDecodeAsync = async (s, r) => j1(n, s, r), Zl(n, "ZodType", {
  check(...s) {
    const r = this.def;
    return this.clone(ca(r, {
      checks: [
        ...r.checks ?? [],
        ...s.map((c) => typeof c == "function" ? { _zod: { check: c, def: { check: "custom" }, onattach: [] } } : c)
      ]
    }), { parent: !0 });
  },
  with(...s) {
    return this.check(...s);
  },
  clone(s, r) {
    return fa(this, s, r);
  },
  brand() {
    return this;
  },
  register(s, r) {
    return s.add(this, r), this;
  },
  refine(s, r) {
    return this.check(zz(s, r));
  },
  superRefine(s, r) {
    return this.check(wz(s, r));
  },
  overwrite(s) {
    return this.check(/* @__PURE__ */ Di(s));
  },
  optional() {
    return fp(this);
  },
  exactOptional() {
    return oz(this);
  },
  nullable() {
    return dp(this);
  },
  nullish() {
    return fp(dp(this));
  },
  nonoptional(s) {
    return pz(this, s);
  },
  array() {
    return Pe(this);
  },
  or(s) {
    return an([this, s]);
  },
  and(s) {
    return az(this, s);
  },
  transform(s) {
    return hp(this, uz(s));
  },
  default(s) {
    return dz(this, s);
  },
  prefault(s) {
    return mz(this, s);
  },
  catch(s) {
    return yz(this, s);
  },
  pipe(s) {
    return hp(this, s);
  },
  readonly() {
    return _z(this);
  },
  describe(s) {
    const r = this.clone();
    return Dl.add(r, { description: s }), r;
  },
  meta(...s) {
    if (s.length === 0)
      return Dl.get(this);
    const r = this.clone();
    return Dl.add(r, s[0]), r;
  },
  isOptional() {
    return this.safeParse(void 0).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(s) {
    return s(this);
  }
}), Object.defineProperty(n, "description", {
  get() {
    return Dl.get(n)?.description;
  },
  configurable: !0
}), n)), iv = /* @__PURE__ */ q("_ZodString", (n, i) => {
  zc.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (r, c, m) => ZS(n, r, c);
  const s = n._zod.bag;
  n.format = s.format ?? null, n.minLength = s.minimum ?? null, n.maxLength = s.maximum ?? null, Zl(n, "_ZodString", {
    regex(...r) {
      return this.check(/* @__PURE__ */ _S(...r));
    },
    includes(...r) {
      return this.check(/* @__PURE__ */ wS(...r));
    },
    startsWith(...r) {
      return this.check(/* @__PURE__ */ xS(...r));
    },
    endsWith(...r) {
      return this.check(/* @__PURE__ */ jS(...r));
    },
    min(...r) {
      return this.check(/* @__PURE__ */ pu(...r));
    },
    max(...r) {
      return this.check(/* @__PURE__ */ Wp(...r));
    },
    length(...r) {
      return this.check(/* @__PURE__ */ Pp(...r));
    },
    nonempty(...r) {
      return this.check(/* @__PURE__ */ pu(1, ...r));
    },
    lowercase(r) {
      return this.check(/* @__PURE__ */ SS(r));
    },
    uppercase(r) {
      return this.check(/* @__PURE__ */ zS(r));
    },
    trim() {
      return this.check(/* @__PURE__ */ TS());
    },
    normalize(...r) {
      return this.check(/* @__PURE__ */ ES(...r));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ AS());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ OS());
    },
    slugify() {
      return this.check(/* @__PURE__ */ CS());
    }
  });
}), E1 = /* @__PURE__ */ q("ZodString", (n, i) => {
  zc.init(n, i), iv.init(n, i), n.email = (s) => n.check(/* @__PURE__ */ H_(T1, s)), n.url = (s) => n.check(/* @__PURE__ */ K_(A1, s)), n.jwt = (s) => n.check(/* @__PURE__ */ uS(L1, s)), n.emoji = (s) => n.check(/* @__PURE__ */ X_(O1, s)), n.guid = (s) => n.check(/* @__PURE__ */ ap(rp, s)), n.uuid = (s) => n.check(/* @__PURE__ */ $_(uu, s)), n.uuidv4 = (s) => n.check(/* @__PURE__ */ L_(uu, s)), n.uuidv6 = (s) => n.check(/* @__PURE__ */ G_(uu, s)), n.uuidv7 = (s) => n.check(/* @__PURE__ */ Y_(uu, s)), n.nanoid = (s) => n.check(/* @__PURE__ */ V_(C1, s)), n.guid = (s) => n.check(/* @__PURE__ */ ap(rp, s)), n.cuid = (s) => n.check(/* @__PURE__ */ J_(N1, s)), n.cuid2 = (s) => n.check(/* @__PURE__ */ F_(M1, s)), n.ulid = (s) => n.check(/* @__PURE__ */ I_(D1, s)), n.base64 = (s) => n.check(/* @__PURE__ */ iS(B1, s)), n.base64url = (s) => n.check(/* @__PURE__ */ lS(H1, s)), n.xid = (s) => n.check(/* @__PURE__ */ W_(R1, s)), n.ksuid = (s) => n.check(/* @__PURE__ */ P_(q1, s)), n.ipv4 = (s) => n.check(/* @__PURE__ */ eS(U1, s)), n.ipv6 = (s) => n.check(/* @__PURE__ */ tS(Z1, s)), n.cidrv4 = (s) => n.check(/* @__PURE__ */ nS(Q1, s)), n.cidrv6 = (s) => n.check(/* @__PURE__ */ aS(k1, s)), n.e164 = (s) => n.check(/* @__PURE__ */ sS($1, s)), n.datetime = (s) => n.check(s1(s)), n.date = (s) => n.check(r1(s)), n.time = (s) => n.check(c1(s)), n.duration = (s) => n.check(d1(s));
});
function L(n) {
  return /* @__PURE__ */ B_(E1, n);
}
const Ge = /* @__PURE__ */ q("ZodStringFormat", (n, i) => {
  $e.init(n, i), iv.init(n, i);
}), T1 = /* @__PURE__ */ q("ZodEmail", (n, i) => {
  K0.init(n, i), Ge.init(n, i);
}), rp = /* @__PURE__ */ q("ZodGUID", (n, i) => {
  G0.init(n, i), Ge.init(n, i);
}), uu = /* @__PURE__ */ q("ZodUUID", (n, i) => {
  Y0.init(n, i), Ge.init(n, i);
}), A1 = /* @__PURE__ */ q("ZodURL", (n, i) => {
  X0.init(n, i), Ge.init(n, i);
}), O1 = /* @__PURE__ */ q("ZodEmoji", (n, i) => {
  V0.init(n, i), Ge.init(n, i);
}), C1 = /* @__PURE__ */ q("ZodNanoID", (n, i) => {
  J0.init(n, i), Ge.init(n, i);
}), N1 = /* @__PURE__ */ q("ZodCUID", (n, i) => {
  F0.init(n, i), Ge.init(n, i);
}), M1 = /* @__PURE__ */ q("ZodCUID2", (n, i) => {
  I0.init(n, i), Ge.init(n, i);
}), D1 = /* @__PURE__ */ q("ZodULID", (n, i) => {
  W0.init(n, i), Ge.init(n, i);
}), R1 = /* @__PURE__ */ q("ZodXID", (n, i) => {
  P0.init(n, i), Ge.init(n, i);
}), q1 = /* @__PURE__ */ q("ZodKSUID", (n, i) => {
  e_.init(n, i), Ge.init(n, i);
}), U1 = /* @__PURE__ */ q("ZodIPv4", (n, i) => {
  l_.init(n, i), Ge.init(n, i);
}), Z1 = /* @__PURE__ */ q("ZodIPv6", (n, i) => {
  s_.init(n, i), Ge.init(n, i);
}), Q1 = /* @__PURE__ */ q("ZodCIDRv4", (n, i) => {
  u_.init(n, i), Ge.init(n, i);
}), k1 = /* @__PURE__ */ q("ZodCIDRv6", (n, i) => {
  r_.init(n, i), Ge.init(n, i);
}), B1 = /* @__PURE__ */ q("ZodBase64", (n, i) => {
  o_.init(n, i), Ge.init(n, i);
}), H1 = /* @__PURE__ */ q("ZodBase64URL", (n, i) => {
  f_.init(n, i), Ge.init(n, i);
}), $1 = /* @__PURE__ */ q("ZodE164", (n, i) => {
  d_.init(n, i), Ge.init(n, i);
}), L1 = /* @__PURE__ */ q("ZodJWT", (n, i) => {
  m_.init(n, i), Ge.init(n, i);
}), wc = /* @__PURE__ */ q("ZodNumber", (n, i) => {
  Vp.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (r, c, m) => QS(n, r, c), Zl(n, "ZodNumber", {
    gt(r, c) {
      return this.check(/* @__PURE__ */ lp(r, c));
    },
    gte(r, c) {
      return this.check(/* @__PURE__ */ Ko(r, c));
    },
    min(r, c) {
      return this.check(/* @__PURE__ */ Ko(r, c));
    },
    lt(r, c) {
      return this.check(/* @__PURE__ */ ip(r, c));
    },
    lte(r, c) {
      return this.check(/* @__PURE__ */ Yo(r, c));
    },
    max(r, c) {
      return this.check(/* @__PURE__ */ Yo(r, c));
    },
    int(r) {
      return this.check(op(r));
    },
    safe(r) {
      return this.check(op(r));
    },
    positive(r) {
      return this.check(/* @__PURE__ */ lp(0, r));
    },
    nonnegative(r) {
      return this.check(/* @__PURE__ */ Ko(0, r));
    },
    negative(r) {
      return this.check(/* @__PURE__ */ ip(0, r));
    },
    nonpositive(r) {
      return this.check(/* @__PURE__ */ Yo(0, r));
    },
    multipleOf(r, c) {
      return this.check(/* @__PURE__ */ sp(r, c));
    },
    step(r, c) {
      return this.check(/* @__PURE__ */ sp(r, c));
    },
    finite() {
      return this;
    }
  });
  const s = n._zod.bag;
  n.minValue = Math.max(s.minimum ?? Number.NEGATIVE_INFINITY, s.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, n.maxValue = Math.min(s.maximum ?? Number.POSITIVE_INFINITY, s.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, n.isInt = (s.format ?? "").includes("int") || Number.isSafeInteger(s.multipleOf ?? 0.5), n.isFinite = !0, n.format = s.format ?? null;
});
function qa(n) {
  return /* @__PURE__ */ dS(wc, n);
}
const G1 = /* @__PURE__ */ q("ZodNumberFormat", (n, i) => {
  p_.init(n, i), wc.init(n, i);
});
function op(n) {
  return /* @__PURE__ */ mS(G1, n);
}
const Y1 = /* @__PURE__ */ q("ZodBoolean", (n, i) => {
  v_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => kS(n, s, r);
});
function Ua(n) {
  return /* @__PURE__ */ pS(Y1, n);
}
const K1 = /* @__PURE__ */ q("ZodUndefined", (n, i) => {
  y_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => HS(n, s);
});
function X1(n) {
  return /* @__PURE__ */ vS(K1, n);
}
const V1 = /* @__PURE__ */ q("ZodNull", (n, i) => {
  g_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => BS(n, s, r);
});
function J1(n) {
  return /* @__PURE__ */ yS(V1, n);
}
const F1 = /* @__PURE__ */ q("ZodUnknown", (n, i) => {
  b_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => LS();
});
function cn() {
  return /* @__PURE__ */ gS(F1);
}
const I1 = /* @__PURE__ */ q("ZodNever", (n, i) => {
  __.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => $S(n, s, r);
});
function W1(n) {
  return /* @__PURE__ */ bS(I1, n);
}
const P1 = /* @__PURE__ */ q("ZodArray", (n, i) => {
  S_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => XS(n, s, r, c), n.element = i.element, Zl(n, "ZodArray", {
    min(s, r) {
      return this.check(/* @__PURE__ */ pu(s, r));
    },
    nonempty(s) {
      return this.check(/* @__PURE__ */ pu(1, s));
    },
    max(s, r) {
      return this.check(/* @__PURE__ */ Wp(s, r));
    },
    length(s, r) {
      return this.check(/* @__PURE__ */ Pp(s, r));
    },
    unwrap() {
      return this.element;
    }
  });
});
function Pe(n, i) {
  return /* @__PURE__ */ NS(P1, n, i);
}
const ez = /* @__PURE__ */ q("ZodObject", (n, i) => {
  w_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => VS(n, s, r, c), qe(n, "shape", () => i.shape), Zl(n, "ZodObject", {
    keyof() {
      return lz(Object.keys(this._zod.def.shape));
    },
    catchall(s) {
      return this.clone({ ...this._zod.def, catchall: s });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: cn() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: cn() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: W1() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: void 0 });
    },
    extend(s) {
      return Qb(this, s);
    },
    safeExtend(s) {
      return kb(this, s);
    },
    merge(s) {
      return Bb(this, s);
    },
    pick(s) {
      return Ub(this, s);
    },
    omit(s) {
      return Zb(this, s);
    },
    partial(...s) {
      return Hb(lv, this, s[0]);
    },
    required(...s) {
      return $b(sv, this, s[0]);
    }
  });
});
function ft(n, i) {
  const s = {
    type: "object",
    shape: n ?? {},
    ...ne(i)
  };
  return new ez(s);
}
const tz = /* @__PURE__ */ q("ZodUnion", (n, i) => {
  x_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => JS(n, s, r, c), n.options = i.options;
});
function an(n, i) {
  return new tz({
    type: "union",
    options: n,
    ...ne(i)
  });
}
const nz = /* @__PURE__ */ q("ZodIntersection", (n, i) => {
  j_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => FS(n, s, r, c);
});
function az(n, i) {
  return new nz({
    type: "intersection",
    left: n,
    right: i
  });
}
const cp = /* @__PURE__ */ q("ZodRecord", (n, i) => {
  E_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => IS(n, s, r, c), n.keyType = i.keyType, n.valueType = i.valueType;
});
function iz(n, i, s) {
  return !i || !i._zod ? new cp({
    type: "record",
    keyType: L(),
    valueType: n,
    ...ne(i)
  }) : new cp({
    type: "record",
    keyType: n,
    valueType: i,
    ...ne(s)
  });
}
const ac = /* @__PURE__ */ q("ZodEnum", (n, i) => {
  T_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (r, c, m) => GS(n, r, c), n.enum = i.entries, n.options = Object.values(i.entries);
  const s = new Set(Object.keys(i.entries));
  n.extract = (r, c) => {
    const m = {};
    for (const h of r)
      if (s.has(h))
        m[h] = i.entries[h];
      else
        throw new Error(`Key ${h} not found in enum`);
    return new ac({
      ...i,
      checks: [],
      ...ne(c),
      entries: m
    });
  }, n.exclude = (r, c) => {
    const m = { ...i.entries };
    for (const h of r)
      if (s.has(h))
        delete m[h];
      else
        throw new Error(`Key ${h} not found in enum`);
    return new ac({
      ...i,
      checks: [],
      ...ne(c),
      entries: m
    });
  };
});
function lz(n, i) {
  const s = Array.isArray(n) ? Object.fromEntries(n.map((r) => [r, r])) : n;
  return new ac({
    type: "enum",
    entries: s,
    ...ne(i)
  });
}
const sz = /* @__PURE__ */ q("ZodTransform", (n, i) => {
  A_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => KS(n, s), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      throw new Dp(n.constructor.name);
    s.addIssue = (m) => {
      if (typeof m == "string")
        s.issues.push(Ul(m, s.value, i));
      else {
        const h = m;
        h.fatal && (h.continue = !1), h.code ?? (h.code = "custom"), h.input ?? (h.input = s.value), h.inst ?? (h.inst = n), s.issues.push(Ul(h));
      }
    };
    const c = i.transform(s.value, s);
    return c instanceof Promise ? c.then((m) => (s.value = m, s.fallback = !0, s)) : (s.value = c, s.fallback = !0, s);
  };
});
function uz(n) {
  return new sz({
    type: "transform",
    transform: n
  });
}
const lv = /* @__PURE__ */ q("ZodOptional", (n, i) => {
  Ip.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => av(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function fp(n) {
  return new lv({
    type: "optional",
    innerType: n
  });
}
const rz = /* @__PURE__ */ q("ZodExactOptional", (n, i) => {
  O_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => av(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function oz(n) {
  return new rz({
    type: "optional",
    innerType: n
  });
}
const cz = /* @__PURE__ */ q("ZodNullable", (n, i) => {
  C_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => WS(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function dp(n) {
  return new cz({
    type: "nullable",
    innerType: n
  });
}
const fz = /* @__PURE__ */ q("ZodDefault", (n, i) => {
  N_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => e1(n, s, r, c), n.unwrap = () => n._zod.def.innerType, n.removeDefault = n.unwrap;
});
function dz(n, i) {
  return new fz({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : Up(i);
    }
  });
}
const hz = /* @__PURE__ */ q("ZodPrefault", (n, i) => {
  M_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => t1(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function mz(n, i) {
  return new hz({
    type: "prefault",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : Up(i);
    }
  });
}
const sv = /* @__PURE__ */ q("ZodNonOptional", (n, i) => {
  D_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => PS(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function pz(n, i) {
  return new sv({
    type: "nonoptional",
    innerType: n,
    ...ne(i)
  });
}
const vz = /* @__PURE__ */ q("ZodCatch", (n, i) => {
  R_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => n1(n, s, r, c), n.unwrap = () => n._zod.def.innerType, n.removeCatch = n.unwrap;
});
function yz(n, i) {
  return new vz({
    type: "catch",
    innerType: n,
    catchValue: typeof i == "function" ? i : () => i
  });
}
const gz = /* @__PURE__ */ q("ZodPipe", (n, i) => {
  q_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => a1(n, s, r, c), n.in = i.in, n.out = i.out;
});
function hp(n, i) {
  return new gz({
    type: "pipe",
    in: n,
    out: i
    // ...util.normalizeParams(params),
  });
}
const bz = /* @__PURE__ */ q("ZodReadonly", (n, i) => {
  U_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => i1(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function _z(n) {
  return new bz({
    type: "readonly",
    innerType: n
  });
}
const Sz = /* @__PURE__ */ q("ZodCustom", (n, i) => {
  Z_.init(n, i), Le.init(n, i), n._zod.processJSONSchema = (s, r, c) => YS(n, s);
});
function zz(n, i = {}) {
  return /* @__PURE__ */ MS(Sz, n, i);
}
function wz(n, i) {
  return /* @__PURE__ */ DS(n, i);
}
function Jt(n) {
  return /* @__PURE__ */ hS(wc, n);
}
const ra = {
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
}, Rn = iz(L(), cn()), Ai = an([L(), qa(), Ua()]).transform(String), It = an([qa(), L()]).transform((n) => Number(n)), Nn = an([qa(), L(), J1(), X1()]).transform((n) => n == null || n === "" ? null : Number(n)), xc = an([
  L(),
  ft({
    label: L().optional(),
    value: L().optional()
  }).passthrough()
]), jc = ft({
  id: an([qa(), L()]).optional(),
  sender: L().optional(),
  senderType: L().optional(),
  role: L().optional(),
  content: L().optional(),
  safeMessageContent: L().optional(),
  messageType: L().optional(),
  createdAt: L().optional(),
  status: L().optional(),
  quickReplies: Pe(xc).optional(),
  metadata: Rn.optional()
}).passthrough(), ic = an([
  L(),
  ft({
    id: an([qa(), L()]).optional(),
    materialId: It.optional(),
    chunkId: It.optional(),
    label: L().optional(),
    sourceLabel: L().optional(),
    excerpt: L().optional(),
    content: L().optional()
  }).passthrough()
]), lc = ft({
  id: an([qa(), L()]).optional(),
  type: L().optional(),
  text: L().optional(),
  prompt: L().optional(),
  options: Pe(Ai).optional(),
  correctAnswer: Ai.optional(),
  explanation: L().optional(),
  difficulty: L().optional(),
  learningObjective: L().optional(),
  points: an([qa(), L()]).optional(),
  sourceReferences: Pe(ic).optional(),
  sources: Pe(ic).optional(),
  sourceHint: L().optional(),
  validationStatus: L().optional()
}).passthrough(), uv = ft({
  id: Nn.optional(),
  draftId: Nn.optional(),
  quizId: Nn.optional(),
  title: L().optional(),
  description: L().optional(),
  difficulty: L().optional(),
  status: L().optional(),
  questions: Pe(lc).optional(),
  updatedAt: L().optional(),
  draft: ft({
    quizId: Nn.optional(),
    title: L().optional(),
    description: L().optional(),
    difficulty: L().optional(),
    status: L().optional(),
    questions: Pe(lc).optional(),
    updatedAt: L().optional()
  }).passthrough().optional()
}).passthrough(), xz = ft({
  multipleChoice: Jt().optional(),
  multiple_choice: Jt().optional(),
  trueFalse: Jt().optional(),
  true_false: Jt().optional(),
  shortAnswer: Jt().optional(),
  short_answer: Jt().optional(),
  essay: Jt().optional(),
  coding: Jt().optional()
}).passthrough(), rv = ft({
  courseId: Nn.optional(),
  topic: L().optional(),
  learningObjectives: Pe(Ai).optional(),
  difficulty: L().optional(),
  questionCount: Nn.optional(),
  language: L().optional(),
  questionTypeDistribution: xz.optional(),
  useIndexedMaterialOnly: Ua().optional(),
  includeExplanations: Ua().optional(),
  timeLimitMinutes: Nn.optional(),
  tags: Pe(Ai).optional(),
  specialInstructions: L().optional(),
  additionalInstructions: L().optional(),
  missingRequiredFields: Pe(Ai).optional(),
  readinessStatus: L().optional(),
  materialScope: L().optional(),
  materialMode: L().optional(),
  materialIds: Pe(It).optional(),
  scoringPreferences: an([L(), Rn]).optional(),
  gradingPreferences: L().optional(),
  gradingOrScoringPreferences: L().optional()
}).passthrough(), ov = ft({
  status: L().optional(),
  stage: L().optional(),
  currentStage: L().optional(),
  progressStage: L().optional(),
  message: L().optional(),
  canCancel: Ua().optional(),
  startedAt: L().optional(),
  updatedAt: L().optional()
}).passthrough(), jz = ft({
  title: L().optional(),
  questions: Pe(cn()).optional(),
  draft: ft({
    title: L().optional(),
    questions: Pe(cn()).optional()
  }).passthrough().optional()
}).passthrough(), cu = ft({
  id: It.optional(),
  revisionId: It.optional(),
  revisionNumber: It.optional(),
  revisionType: L().optional(),
  requestText: L().optional(),
  status: L().optional(),
  summary: L().optional(),
  changes: Pe(Ai).optional(),
  destructive: Ua().optional(),
  metadata: Rn.optional(),
  beforeSnapshot: cn().optional(),
  proposedSnapshot: cn().optional(),
  beforeData: cn().optional(),
  afterData: cn().optional(),
  preview: cn().optional(),
  appliedAt: L().optional(),
  createdAt: L().optional()
}).passthrough(), zu = ft({
  id: It.optional(),
  conversationId: It.optional(),
  title: L().optional(),
  status: L().optional(),
  courseId: Nn.optional(),
  createdAt: L().optional(),
  updatedAt: L().optional(),
  messageCount: Jt().optional(),
  draftId: Nn.optional(),
  plan: rv.optional(),
  messages: Pe(jc).optional(),
  suggestedReplies: Pe(xc).optional(),
  draft: uv.nullable().optional(),
  generation: ov.nullable().optional(),
  pendingRevision: cu.nullable().optional(),
  revision: cu.nullable().optional(),
  revisions: Pe(cu).optional()
}).passthrough();
function da(n, i) {
  const s = Rn.safeParse(n);
  if (!s.success) return n;
  for (const r of i)
    if (s.data[r] !== void 0) return s.data[r];
  return n;
}
function Ez(n) {
  const i = String(n.senderType || n.sender || n.role || "assistant").toLowerCase();
  return ["user", "teacher", "admin", "human"].includes(i) ? "user" : i === "system" ? "system" : "assistant";
}
function Tz(n) {
  const i = Array.isArray(n.metadata?.quickReplies) ? n.metadata.quickReplies : [], s = n.quickReplies || i;
  return cv(s);
}
function cv(n) {
  return n.flatMap((i, s) => {
    const r = xc.safeParse(i);
    if (!r.success) return [];
    if (typeof r.data == "string") return [{ label: r.data, value: r.data }];
    const c = r.data.value || r.data.label || "";
    return c ? [{ label: r.data.label || c, value: c }] : [];
  }).map((i, s) => ({ ...i, key: `${s}-${i.value}` })).map(({ label: i, value: s }) => ({ label: i, value: s }));
}
function fv(n, i = 0) {
  const s = jc.parse(n), r = s.status === "failed" ? "failed" : s.status === "pending" ? "pending" : "sent";
  return {
    id: s.id ?? `message-${i}`,
    sender: Ez(s),
    content: s.content || s.safeMessageContent || "",
    messageType: s.messageType || "text",
    createdAt: s.createdAt || "",
    status: r,
    quickReplies: Tz(s)
  };
}
function Az(n, i) {
  const s = ic.parse(n);
  return typeof s == "string" ? { id: `source-${i}`, label: s } : {
    id: s.id ?? `source-${i}`,
    materialId: s.materialId,
    chunkId: s.chunkId,
    label: s.label || s.sourceLabel || `Source ${i + 1}`,
    excerpt: s.excerpt || s.content
  };
}
function Oz(n) {
  const i = lc.parse(n), s = i.sourceReferences || i.sources || (i.sourceHint ? [i.sourceHint] : []), r = Number(i.points ?? 1);
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
    sourceReferences: s.map(Az),
    validationStatus: i.validationStatus || "valid"
  };
}
function Cz(n) {
  if (n == null) return null;
  const i = uv.parse(n), s = i.draft || {}, r = String(i.difficulty || s.difficulty || "medium").trim().toLowerCase(), c = ["easy", "medium", "hard", "mixed"].includes(r) ? r : "medium";
  return {
    id: i.id ?? i.draftId ?? null,
    quizId: i.quizId ?? s.quizId ?? null,
    title: i.title || s.title || "Untitled quiz draft",
    description: i.description || s.description || "",
    difficulty: c,
    status: i.status || s.status || "draft",
    questions: (i.questions || s.questions || []).map(Oz),
    updatedAt: i.updatedAt || s.updatedAt || ""
  };
}
function Nz(n) {
  const i = rv.parse(n || {}), s = i.questionTypeDistribution || {}, r = i.materialScope || (i.materialMode === "general_model_knowledge_allowed" ? "general_knowledge_allowed" : i.materialMode), c = ["course_material_only", "course_material_preferred", "general_knowledge_allowed"].includes(String(r)) ? r : i.useIndexedMaterialOnly ? "course_material_only" : ra.materialScope, m = i.scoringPreferences ?? i.gradingPreferences ?? i.gradingOrScoringPreferences, h = typeof m == "string" ? m : m ? JSON.stringify(m) : "";
  return {
    ...ra,
    courseId: i.courseId ?? ra.courseId,
    topic: i.topic ?? ra.topic,
    learningObjectives: i.learningObjectives ?? [],
    difficulty: ["easy", "medium", "hard", "mixed"].includes(String(i.difficulty)) ? i.difficulty : ra.difficulty,
    questionCount: i.questionCount ?? ra.questionCount,
    language: i.language ?? ra.language,
    questionTypeDistribution: {
      multipleChoice: Math.max(0, Number(s.multipleChoice ?? s.multiple_choice ?? 0)),
      trueFalse: Math.max(0, Number(s.trueFalse ?? s.true_false ?? 0)),
      shortAnswer: Math.max(0, Number(s.shortAnswer ?? s.short_answer ?? 0)),
      essay: Math.max(0, Number(s.essay ?? 0)),
      coding: Math.max(0, Number(s.coding ?? 0))
    },
    useIndexedMaterialOnly: i.useIndexedMaterialOnly ?? c === "course_material_only",
    includeExplanations: i.includeExplanations ?? !0,
    timeLimitMinutes: i.timeLimitMinutes ?? null,
    tags: i.tags ?? [],
    specialInstructions: i.specialInstructions ?? i.additionalInstructions ?? "",
    missingRequiredFields: i.missingRequiredFields ?? [],
    readinessStatus: i.readinessStatus || "gathering_requirements",
    materialScope: c,
    materialIds: i.materialIds ?? [],
    scoringPreferences: h
  };
}
function dv(n) {
  if (!n) return null;
  const i = ov.parse(da(n, ["generation"]));
  return {
    status: i.status || "generating",
    stage: i.stage || i.currentStage || i.progressStage || "",
    message: i.message || "",
    canCancel: i.canCancel ?? i.status === "generating",
    startedAt: i.startedAt || "",
    updatedAt: i.updatedAt || ""
  };
}
function mp(n) {
  if (!n) return { title: "", questionCount: null, questions: null };
  const i = jz.safeParse(n);
  if (!i.success) return { title: "", questionCount: null, questions: null };
  const s = i.data.draft, r = i.data.questions || s?.questions || null;
  return {
    title: i.data.title || s?.title || "",
    questionCount: r ? r.length : null,
    questions: r
  };
}
function yu(n) {
  if (Array.isArray(n)) return n.map(yu);
  const i = Rn.safeParse(n);
  return i.success ? Object.fromEntries(
    Object.keys(i.data).sort().map((s) => [s, yu(i.data[s])])
  ) : n;
}
function pp(n) {
  const i = Rn.safeParse(n);
  if (!i.success) return "";
  const s = i.data.id ?? i.data.questionId;
  return typeof s == "string" || typeof s == "number" ? String(s) : "";
}
function vp(n, i) {
  return JSON.stringify(yu(n)) === JSON.stringify(yu(i));
}
function Mz(n, i) {
  if (!n || !i) return { changed: null, removed: null, added: null };
  const s = n.map(pp), r = i.map(pp);
  if (s.length > 0 && r.length > 0 && s.every(Boolean) && r.every(Boolean) && new Set(s).size === s.length && new Set(r).size === r.length) {
    const v = new Map(s.map((z, O) => [z, n[O]])), y = new Map(r.map((z, O) => [z, i[O]])), g = s.filter((z) => !y.has(z)).length, _ = r.filter((z) => !v.has(z)).length;
    return { changed: s.filter((z) => y.has(z) && !vp(v.get(z), y.get(z))).length, removed: g, added: _ };
  }
  const m = Math.min(n.length, i.length);
  let h = 0;
  for (let v = 0; v < m; v += 1)
    vp(n[v], i[v]) || (h += 1);
  return {
    changed: h,
    removed: Math.max(0, n.length - i.length),
    added: Math.max(0, i.length - n.length)
  };
}
function Xo(n, i) {
  const s = Number(n?.[i]);
  return Number.isSafeInteger(s) && s >= 0 ? s : null;
}
function Dz(n) {
  const i = String(n.status || "").toLowerCase(), s = n.metadata?.applied;
  return !!n.appliedAt?.trim() || s === !0 || s === "true" || ["applied", "accepted", "completed"].includes(i);
}
function hv(n, i = !1) {
  if (Dz(n)) return !1;
  const s = String(n.status || "").toLowerCase(), r = n.metadata || {};
  return r.requiresConfirmation === !0 || r.previewOnly === !0 ? !0 : r.draftOnly === !0 || n.revisionType === "initial_generation" ? !1 : ["preview", "pending", "pending_confirmation", "awaiting_confirmation", "unapplied"].includes(s) ? n.revisionType !== "whole_quiz_revision" || r.requiresConfirmation === !0 : i;
}
function Ec(n) {
  if (!n) return null;
  const i = Rn.safeParse(n), s = i.success ? i.data.preview : void 0, r = da(n, ["revision", "pendingRevision"]), c = cu.safeParse(r);
  if (!c.success) return null;
  const m = c.data.id ?? c.data.revisionId;
  if (!m) return null;
  const h = mp(c.data.beforeSnapshot || c.data.beforeData), v = mp(
    c.data.proposedSnapshot || c.data.afterData || c.data.preview || s
  ), y = Mz(h.questions, v.questions), g = Array.isArray(c.data.metadata?.questionIndexes) ? new Set(
    c.data.metadata.questionIndexes.map(Number).filter((N) => Number.isSafeInteger(N) && N >= 0)
  ).size : null, _ = y.changed ?? g ?? Xo(c.data.metadata, "changedQuestionCount"), j = y.removed ?? Xo(c.data.metadata, "removedQuestionCount") ?? (h.questionCount !== null && v.questionCount !== null ? Math.max(0, h.questionCount - v.questionCount) : null), z = y.added ?? Xo(c.data.metadata, "addedQuestionCount") ?? (h.questionCount !== null && v.questionCount !== null ? Math.max(0, v.questionCount - h.questionCount) : null), O = v.title || h.title;
  return {
    id: m,
    revisionNumber: c.data.revisionNumber ?? null,
    revisionType: c.data.revisionType || "",
    requestText: c.data.requestText || "",
    status: c.data.status || "preview",
    summary: c.data.summary || (c.data.requestText ? `Requested change: ${c.data.requestText}` : "Review the proposed quiz changes."),
    changes: c.data.changes || [],
    destructive: c.data.destructive ?? !!j,
    beforeSnapshot: {
      title: h.title,
      questionCount: h.questionCount
    },
    proposedSnapshot: {
      title: O,
      questionCount: v.questionCount
    },
    changedQuestionCount: _,
    removedQuestionCount: j,
    addedQuestionCount: z,
    createdAt: c.data.createdAt || ""
  };
}
function Rz(n) {
  const i = n.map((s, r) => ({ raw: s, index: r })).filter(({ raw: s }) => hv(s)).sort((s, r) => {
    const c = Number(r.raw.revisionNumber || 0) - Number(s.raw.revisionNumber || 0);
    if (c) return c;
    const m = Date.parse(r.raw.createdAt || "") - Date.parse(s.raw.createdAt || "");
    return Number.isFinite(m) && m ? m : s.index - r.index;
  })[0]?.raw;
  return i ? Ec(i) : null;
}
function mv(n) {
  const i = zu.parse(n), s = i.id ?? i.conversationId;
  if (!s) throw new Error("AI conversation response is missing an id.");
  return {
    id: s,
    title: i.title || "New quiz conversation",
    status: i.status || i.plan?.readinessStatus || "gathering_requirements",
    courseId: i.courseId ?? i.plan?.courseId ?? null,
    createdAt: i.createdAt || "",
    updatedAt: i.updatedAt || "",
    messageCount: i.messageCount ?? i.messages?.length ?? 0,
    draftId: i.draftId ?? i.draft?.id ?? i.draft?.draftId ?? null
  };
}
function sc(n) {
  const i = da(n, ["conversation"]), s = zu.parse(i), r = mv(s), c = s.pendingRevision || s.revision, m = c && hv(
    c,
    !!s.pendingRevision
  ) ? Ec(c) : Rz(s.revisions || []);
  return {
    ...r,
    plan: Nz(s.plan || {}),
    messages: (s.messages || []).map(fv),
    suggestedReplies: cv(s.suggestedReplies || []),
    draft: Cz(s.draft),
    generation: dv(s.generation),
    pendingRevision: m
  };
}
function qz(n) {
  const i = da(n, ["conversations", "items", "data"]);
  return Pe(zu).parse(i).map(mv);
}
const Uz = ft({
  id: It,
  code: L().optional(),
  title: L().optional(),
  name: L().optional()
}).passthrough();
function Zz(n) {
  const i = da(n, ["courses", "items", "data"]);
  return Pe(Uz).parse(i).map((s) => ({
    id: s.id,
    code: s.code || `COURSE-${s.id}`,
    title: s.title || s.name || "Untitled course"
  }));
}
const Qz = ft({
  id: It,
  courseId: It,
  originalName: L().optional(),
  name: L().optional(),
  byteSize: Jt().optional(),
  chunkCount: Jt().optional(),
  status: L().optional(),
  createdAt: L().optional(),
  errorMessage: L().optional(),
  error: L().optional()
}).passthrough();
function kz(n) {
  const i = da(n, ["materials", "items", "data"]);
  return Pe(Qz).parse(i).map((s) => ({
    id: s.id,
    courseId: s.courseId,
    originalName: s.originalName || s.name || `Material ${s.id}`,
    byteSize: s.byteSize || 0,
    chunkCount: s.chunkCount || 0,
    status: s.status || "ready",
    createdAt: s.createdAt || "",
    errorMessage: s.errorMessage || s.error || ""
  }));
}
const Bz = ft({
  enabled: Ua().optional(),
  configured: Ua().optional(),
  conversationApiVersion: It.optional(),
  source: L().optional(),
  endpoint: L().optional(),
  maskedApiKey: L().optional(),
  chatDeployment: L().optional(),
  embeddingDeployment: L().optional(),
  apiVersion: L().optional(),
  message: L().optional()
}).passthrough();
function yp(n) {
  const i = Bz.parse(da(n, ["settings"]));
  return {
    enabled: i.enabled ?? !0,
    configured: i.configured ?? !1,
    conversationApiVersion: Number.isFinite(i.conversationApiVersion) ? i.conversationApiVersion : 0,
    source: i.source || "none",
    endpoint: i.endpoint || "",
    maskedApiKey: i.maskedApiKey || "",
    chatDeployment: i.chatDeployment || "",
    embeddingDeployment: i.embeddingDeployment || "",
    apiVersion: i.apiVersion || "",
    message: i.message || ""
  };
}
function ua(n) {
  const i = Rn.parse(n), s = i.conversation || (i.id || i.conversationId ? i : null);
  let r = null;
  if (s) {
    const m = zu.safeParse(s);
    m.success && (m.data.id || m.data.conversationId) && (r = sc(m.data));
  }
  const c = i.message && typeof i.message == "object" ? jc.safeParse(i.message) : null;
  return {
    conversation: r,
    revision: Ec(i.revision || i.pendingRevision ? {
      revision: i.revision || i.pendingRevision,
      preview: i.preview
    } : null),
    message: c?.success ? fv(c.data) : null,
    notice: typeof i.message == "string" ? i.message : typeof i.notice == "string" ? i.notice : ""
  };
}
function Hz(n) {
  return dv(n) || {
    status: "generating",
    stage: "",
    message: "",
    canCancel: !0,
    startedAt: "",
    updatedAt: ""
  };
}
function $z(n) {
  const i = ft({
    label: L().optional(),
    sourceLabel: L().optional(),
    content: L().optional(),
    excerpt: L().optional(),
    chunkIndex: Jt().optional()
  }).passthrough().parse(da(n, ["chunk", "source"]));
  return {
    label: i.label || i.sourceLabel || `Source chunk ${(i.chunkIndex ?? 0) + 1}`,
    content: i.content || i.excerpt || ""
  };
}
function Ml(n) {
  return Rn.parse(n);
}
function Lz(n) {
  return {
    async listConversations() {
      return qz(await n.getAiConversations());
    },
    async createConversation(i = {}) {
      return sc(await n.createAiConversation(i));
    },
    async getConversation(i) {
      return sc(await n.getAiConversation(i));
    },
    async deleteConversation(i) {
      return Ml(await n.deleteAiConversation(i));
    },
    async sendMessage(i, s) {
      return ua(await n.sendAiConversationMessage(i, s));
    },
    async updatePlan(i, s) {
      const r = { ...s };
      return s.scoringPreferences !== void 0 && (r.gradingPreferences = s.scoringPreferences, delete r.scoringPreferences), ua(await n.updateAiConversationPlan(i, r));
    },
    async generateDraft(i, s, r) {
      return ua(await n.generateAiConversationDraft(i, s, r));
    },
    async getGenerationStatus(i) {
      return Hz(await n.getAiConversationGenerationStatus(i));
    },
    async cancelGeneration(i) {
      return ua(await n.cancelAiConversationGeneration(i));
    },
    async reviseDraft(i, s) {
      return ua(await n.reviseAiConversationDraft(i, s));
    },
    async applyRevision(i, s) {
      return ua(await n.applyAiConversationRevision(i, s));
    },
    async regenerateQuestions(i, s, r) {
      return ua(await n.regenerateAiConversationQuestions(i, s, r));
    },
    async saveDraft(i, s) {
      return ua(await n.saveAiConversationDraft(i, s));
    },
    async listCourses() {
      return Zz(await n.getCourses());
    },
    async getSettings() {
      return yp(await n.getAiSettingsStatus());
    },
    async saveSettings(i) {
      return yp(await n.saveAiSettings(i));
    },
    async testSettings(i) {
      return Ml(await n.testAiSettings(i));
    },
    async listMaterials(i) {
      return kz(await n.getAiMaterials(i));
    },
    async uploadMaterial(i, s) {
      return Ml(await n.uploadAiMaterial(i, s));
    },
    async pasteMaterial(i, s) {
      return Ml(await n.pasteAiMaterial(i, s));
    },
    async deleteMaterial(i, s) {
      return Ml(await n.deleteAiMaterial(i, s));
    },
    async getMaterialChunk(i, s, r) {
      return $z(await n.getAiMaterialChunk(i, s, r));
    }
  };
}
const gp = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function wu({ title: n, description: i, onClose: s, size: r = "normal", children: c }) {
  const m = J.useId(), h = J.useId(), v = J.useRef(null), y = J.useRef(null);
  J.useEffect(() => {
    y.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const _ = v.current;
    (_?.querySelector(gp) || _)?.focus();
    const z = (O) => {
      O.key === "Escape" && (O.preventDefault(), s());
    };
    return document.addEventListener("keydown", z), () => {
      document.removeEventListener("keydown", z), y.current?.focus();
    };
  }, [s]);
  const g = (_) => {
    if (_.key !== "Tab" || !v.current) return;
    const j = Array.from(
      v.current.querySelectorAll(gp)
    ).filter((N) => !N.hidden);
    if (!j.length) {
      _.preventDefault(), v.current.focus();
      return;
    }
    const z = j[0], O = j[j.length - 1];
    _.shiftKey && document.activeElement === z ? (_.preventDefault(), O.focus()) : !_.shiftKey && document.activeElement === O && (_.preventDefault(), z.focus());
  };
  return /* @__PURE__ */ f.jsx(
    "div",
    {
      className: "aiw-modal-backdrop",
      onMouseDown: (_) => {
        _.currentTarget === _.target && s();
      },
      children: /* @__PURE__ */ f.jsxs(
        "div",
        {
          ref: v,
          className: `aiw-modal aiw-modal--${r}`,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": m,
          "aria-describedby": i ? h : void 0,
          tabIndex: -1,
          onKeyDown: g,
          children: [
            /* @__PURE__ */ f.jsxs("header", { className: "aiw-modal__header", children: [
              /* @__PURE__ */ f.jsxs("div", { children: [
                /* @__PURE__ */ f.jsx("h2", { id: m, children: n }),
                i ? /* @__PURE__ */ f.jsx("p", { id: h, children: i }) : null
              ] }),
              /* @__PURE__ */ f.jsx("button", { className: "aiw-icon-button", type: "button", onClick: s, "aria-label": "Close dialog", children: "×" })
            ] }),
            /* @__PURE__ */ f.jsx("div", { className: "aiw-modal__body", children: c })
          ]
        }
      )
    }
  );
}
const Gz = {
  endpoint: "",
  apiKey: "",
  chatDeployment: "",
  embeddingDeployment: "",
  apiVersion: ""
};
function bp(n, i) {
  if (typeof n == "boolean")
    return n ? `${i} deployment connected.` : `${i} deployment failed.`;
  if (!n || typeof n != "object") return "";
  const s = n;
  return typeof s.message == "string" && s.message.trim() ? s.message.trim() : s.skipped === !0 ? `${i} deployment was skipped.` : s.ok === !0 ? `${i} deployment connected.` : `${i} deployment failed.`;
}
function Yz({ client: n, onClose: i, onToast: s }) {
  const r = Mi(), [c, m] = J.useState(Gz), [h, v] = J.useState(""), y = Cn({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  });
  J.useEffect(() => {
    const N = y.data;
    N && m((B) => ({
      ...B,
      endpoint: N.endpoint,
      chatDeployment: N.chatDeployment,
      embeddingDeployment: N.embeddingDeployment,
      apiVersion: N.apiVersion
    }));
  }, [y.data]);
  const g = qt({
    mutationFn: () => n.saveSettings(c),
    onSuccess: async () => {
      await r.invalidateQueries({ queryKey: ["ai", "settings"] }), s("Private Azure settings saved.", "success"), i();
    },
    onError: (N) => s(N instanceof Error ? N.message : "Could not save Azure settings.", "error")
  }), _ = qt({
    mutationFn: () => n.testSettings(c),
    onSuccess: (N) => {
      const B = bp(N.chat, "Chat"), X = bp(N.embeddings, "Embedding");
      v([B, X].filter(Boolean).join(" "));
    },
    onError: (N) => v(N instanceof Error ? N.message : "Connection test failed.")
  }), j = (N, B) => {
    m((X) => ({ ...X, [N]: B })), v("");
  }, z = (N) => {
    N.preventDefault(), g.mutate();
  }, O = y.data?.configured ?? !1;
  return /* @__PURE__ */ f.jsxs(
    wu,
    {
      title: "Private Azure settings",
      description: "Credentials stay on the LMS server. Saved API keys are never returned to this browser.",
      onClose: i,
      children: [
        y.isLoading ? /* @__PURE__ */ f.jsx("p", { role: "status", children: "Loading settings…" }) : null,
        y.isError ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Settings could not be loaded." }),
          /* @__PURE__ */ f.jsx("button", { type: "button", onClick: () => y.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ f.jsxs("form", { className: "aiw-dialog-form", onSubmit: z, children: [
          /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ f.jsx("span", { children: "Azure endpoint" }),
            /* @__PURE__ */ f.jsx(
              "input",
              {
                type: "url",
                required: !0,
                value: c.endpoint,
                onChange: (N) => j("endpoint", N.target.value),
                placeholder: "https://your-resource.openai.azure.com"
              }
            )
          ] }),
          /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ f.jsxs("span", { children: [
              "API key",
              y.data?.maskedApiKey ? /* @__PURE__ */ f.jsxs("small", { children: [
                "saved · ",
                y.data.maskedApiKey
              ] }) : null
            ] }),
            /* @__PURE__ */ f.jsx(
              "input",
              {
                type: "password",
                autoComplete: "new-password",
                required: !O,
                value: c.apiKey,
                onChange: (N) => j("apiKey", N.target.value),
                placeholder: O ? "Leave blank to keep saved key" : "Enter your private key"
              }
            )
          ] }),
          /* @__PURE__ */ f.jsxs("div", { className: "aiw-field-row", children: [
            /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ f.jsx("span", { children: "Chat deployment" }),
              /* @__PURE__ */ f.jsx("input", { required: !0, value: c.chatDeployment, onChange: (N) => j("chatDeployment", N.target.value) })
            ] }),
            /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ f.jsx("span", { children: "Embedding deployment" }),
              /* @__PURE__ */ f.jsx(
                "input",
                {
                  value: c.embeddingDeployment,
                  onChange: (N) => j("embeddingDeployment", N.target.value),
                  placeholder: "Required for materials"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ f.jsx("span", { children: "API version" }),
            /* @__PURE__ */ f.jsx(
              "input",
              {
                required: !0,
                value: c.apiVersion,
                onChange: (N) => j("apiVersion", N.target.value),
                placeholder: "2024-10-21"
              }
            )
          ] }),
          /* @__PURE__ */ f.jsxs("div", { className: "aiw-security-note", children: [
            /* @__PURE__ */ f.jsx("strong", { children: "Private by design" }),
            /* @__PURE__ */ f.jsx("span", { children: "Azure calls run on the backend. The browser receives configuration status only." })
          ] }),
          h ? /* @__PURE__ */ f.jsx("p", { className: "aiw-test-result", role: "status", children: h }) : null,
          /* @__PURE__ */ f.jsxs("div", { className: "aiw-dialog-actions aiw-dialog-actions--split", children: [
            /* @__PURE__ */ f.jsx(
              "button",
              {
                className: "aiw-button aiw-button--quiet",
                type: "button",
                onClick: () => _.mutate(),
                disabled: _.isPending || !c.endpoint || !c.chatDeployment || !c.apiVersion,
                children: _.isPending ? "Testing…" : "Test connection"
              }
            ),
            /* @__PURE__ */ f.jsxs("div", { children: [
              /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: i, children: "Cancel" }),
              /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--primary", type: "submit", disabled: g.isPending, children: g.isPending ? "Saving…" : "Save settings" })
            ] })
          ] })
        ] })
      ]
    }
  );
}
const Kz = {
  gathering_requirements: "Gathering requirements",
  ready_to_generate: "Ready to generate",
  generating: "Generating",
  generation_failed: "Generation failed",
  review_required: "Review required",
  draft_saved: "Draft saved",
  published: "Published"
}, Xz = {
  validating_quiz_plan: "Validating quiz plan",
  retrieving_course_material: "Retrieving course material",
  selecting_source_passages: "Selecting source passages",
  generating_questions: "Generating questions",
  validating_generated_output: "Validating generated output",
  saving_draft: "Saving draft",
  opening_review_workspace: "Opening review workspace"
};
function uc(n) {
  return n ? Kz[n] || n.replaceAll("_", " ") : "Gathering requirements";
}
function _p(n) {
  return n ? Xz[n] || n.replaceAll("_", " ") : "Preparing generation";
}
function Vz(n) {
  if (!n) return "";
  const i = new Date(pv(n));
  return Number.isNaN(i.getTime()) ? "" : new Intl.DateTimeFormat(void 0, {
    hour: "numeric",
    minute: "2-digit"
  }).format(i);
}
function pv(n) {
  const i = n.trim();
  if (!i) return "";
  const s = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(i);
  return /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(i) && !s ? `${i.replace(" ", "T")}Z` : i;
}
function Jz(n) {
  return n ? n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB` : "";
}
function xu(n) {
  const i = [];
  n.courseId || i.push("courseId"), n.topic.trim() || i.push("topic"), n.difficulty || i.push("difficulty"), (!n.questionCount || n.questionCount < 1) && i.push("questionCount"), n.language.trim() || i.push("language");
  const s = Object.values(n.questionTypeDistribution).reduce((c, m) => c + Number(m || 0), 0);
  (s < 1 || n.questionCount && s !== n.questionCount) && i.push("questionTypeDistribution");
  const r = n.missingRequiredFields.filter((c) => c === "courseId" ? !n.courseId : c === "topic" ? !n.topic.trim() : c === "difficulty" ? !n.difficulty : c === "questionCount" ? !n.questionCount : c === "language" ? !n.language.trim() : c === "questionTypeDistribution" || c === "questionTypes" ? s < 1 || !!(n.questionCount && s !== n.questionCount) : !0);
  return [.../* @__PURE__ */ new Set([...i, ...r])];
}
function vv(n) {
  return xu(n).length === 0;
}
function Fz(n) {
  const i = n.trim().toLocaleLowerCase().replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
  return i ? /^(?:please )?(?:generate|create|build|produce)(?: (?:it|the quiz|quiz|the draft|draft))?(?: now)?(?: please)?$/.test(i) || /^(?:please )?(?:go ahead and |start )(?:generating|generation|generate)(?: (?:it|the quiz|quiz|the draft|draft))?(?: now)?$/.test(i) || /^(?:lütfen )?(?:oluştur|üret|hazırla)(?: (?:onu|quizi|sınavı|taslağı))?(?: şimdi)?(?: lütfen)?$/.test(i) || /^(?:lütfen )?(?:quizi|sınavı|taslağı) (?:oluştur|üret|hazırla)(?: şimdi)?(?: lütfen)?$/.test(i) : !1;
}
function yv(n) {
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
function Iz() {
  return typeof crypto < "u" && typeof crypto.randomUUID == "function" ? crypto.randomUUID() : `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
const rc = {
  multipleChoice: { short: "MCQ", full: "multiple-choice" },
  trueFalse: { short: "true/false", full: "true/false" },
  shortAnswer: { short: "short answer", full: "short-answer" },
  essay: { short: "essay", full: "essay" },
  coding: { short: "coding", full: "coding" }
}, Wz = /\b(?:algorithm|code|coding|computer|data structure|database|javascript|java|program|python|software|web)\b/i, Vo = 5;
function Ft(n, i) {
  const s = String(n || "").replace(/https?:\/\/\S+/gi, "").replace(/<[^>]*>/g, " ").replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (s.length <= i) return s;
  const r = s.slice(0, i + 1), c = r.lastIndexOf(" ");
  return `${r.slice(0, c > i * 0.6 ? c : i).trim()}…`;
}
function ru(n) {
  return Ft(
    n.originalName.replace(/\.(?:docx|md|pdf|txt)$/i, "").replace(/[_-]+/g, " "),
    54
  ) || `Material ${n.id}`;
}
function Oi(n) {
  return n ? Ft(`${n.code} — ${n.title}`, 72) : "the selected course";
}
function Pz(n, i) {
  return Ft(n.topic, 56) || Ft(i?.title, 56) || "this course";
}
function ew(n) {
  const i = Object.entries(n.questionTypeDistribution).filter(([, s]) => Number(s) > 0);
  return i.length ? {
    label: i.map(([s, r]) => `${r} ${rc[s].short}`).join(" + "),
    value: i.map(([s, r]) => `${r} ${rc[s].full} question${r === 1 ? "" : "s"}`).join(" and ")
  } : null;
}
function tw(n) {
  return Object.entries(n.questionTypeDistribution).sort((i, s) => Number(s[1]) - Number(i[1]))[0]?.[0] || "multipleChoice";
}
function nw(n) {
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
    const i = Oi(n[0]);
    return [
      {
        label: `Concept check for ${Ft(n[0].code, 24)}`,
        value: `Create a medium concept-check quiz for ${i}.`
      },
      {
        label: `Mixed quiz for ${Ft(n[0].code, 24)}`,
        value: `Build a 10-question mixed quiz for ${i} with explanations.`
      },
      {
        label: `Use ${Ft(n[0].code, 24)} materials`,
        value: `Create a quiz for ${i} using its indexed course materials.`
      }
    ];
  }
  return n.slice(0, 4).map((i, s) => ({
    label: `Quiz for ${Ft(i.code, 24)}`,
    value: s % 2 ? `Create a 10-question mixed quiz for ${Oi(i)}.` : `Create a medium concept-check quiz for ${Oi(i)}.`
  }));
}
function aw({
  detail: n,
  plan: i,
  courses: s,
  materials: r
}) {
  if (!n) return nw(s);
  const c = [], m = /* @__PURE__ */ new Set(), h = (z) => {
    if (!z || c.length >= Vo) return;
    const O = Ft(z.label, 80), N = Ft(z.value, 180), B = N.toLocaleLowerCase();
    !O || !N || m.has(B) || (m.add(B), c.push({ label: O, value: N }));
  };
  n.suggestedReplies.forEach(h);
  const v = s.find((z) => Number(z.id) === Number(i.courseId)), y = xu(i), g = Pz(i, v), _ = r.filter((z) => z.status !== "failed"), j = i.materialIds.length ? _.filter((z) => i.materialIds.includes(z.id)) : _;
  if (y.includes("courseId"))
    s.slice(0, Vo).forEach((z) => h({
      label: `Use ${Ft(z.code, 24)}`,
      value: `Create this quiz for ${Oi(z)}.`
    }));
  else if (y.includes("topic"))
    j.slice(0, 2).forEach((z) => h({
      label: `Use ${ru(z)}`,
      value: `Use the main concepts from “${ru(z)}” as the quiz topic for ${Oi(v)}.`
    })), h({
      label: `Choose a ${Ft(v?.code, 24)} topic`,
      value: `Help me choose a focused topic from ${Oi(v)}.`
    });
  else if (y.includes("difficulty"))
    ["easy", "medium", "hard", "mixed"].forEach((z) => h({
      label: `${z[0].toUpperCase()}${z.slice(1)} ${g}`,
      value: `Make the ${g} quiz ${z}.`
    }));
  else if (y.includes("questionCount"))
    [5, 10, 15].forEach((z) => h({
      label: `${z} ${g} questions`,
      value: `Use ${z} questions for the ${g} quiz.`
    }));
  else if (y.includes("language"))
    ["English", "Turkish", "Spanish"].forEach((z) => h({
      label: `${g} in ${z}`,
      value: `Write the ${g} quiz in ${z}.`
    }));
  else if (y.includes("questionTypeDistribution")) {
    const z = i.questionCount || 10, O = Wz.test(`${g} ${v?.title || ""}`), N = Math.min(2, Math.max(1, Math.floor(z / 4)));
    h({
      label: "Mostly multiple choice",
      value: `Use ${z} mostly multiple-choice questions about ${g}.`
    }), h(O ? {
      label: `MCQ + ${N} coding`,
      value: `Use ${z - N} multiple-choice and ${N} coding questions about ${g}.`
    } : {
      label: `MCQ + ${N} short answer`,
      value: `Use ${z - N} multiple-choice and ${N} short-answer questions about ${g}.`
    }), h({
      label: "Balanced mixed quiz",
      value: `Use a balanced mix of question types for the ${g} quiz.`
    });
  } else {
    const z = ew(i);
    if (z && h({
      label: `Keep ${z.label}`,
      value: `Keep the ${g} quiz at ${z.value}.`
    }), j.slice(0, 2).forEach((O) => h({
      label: `${i.materialScope === "course_material_only" ? "Use only" : "Ground in"} ${ru(O)}`,
      value: `${i.materialScope === "course_material_only" ? "Use only" : "Ground the quiz in"} “${ru(O)}” for the ${g} questions.`
    })), n.draft) {
      const O = rc[tw(i)].short;
      h({
        label: `Make ${O} questions harder`,
        value: `Make the ${O} questions more challenging while keeping the ${g} learning objectives.`
      }), h({
        label: i.includeExplanations ? "Tighten explanations" : "Add answer explanations",
        value: i.includeExplanations ? "Make every answer explanation shorter and more precise." : "Add a concise explanation for every answer."
      });
    } else
      i.questionTypeDistribution.coding > 0 && h({
        label: "Make coding questions scenario-based",
        value: `Make the coding questions scenario-based and focused on ${g}.`
      }), h({
        label: i.includeExplanations ? "Use concise explanations" : "Include explanations",
        value: i.includeExplanations ? "Keep the answer explanations concise and instructional." : "Include a concise explanation for every answer."
      });
  }
  return c.length < 3 && [...n.messages].reverse().find((O) => O.sender === "assistant")?.quickReplies.forEach(h), c.slice(0, Vo);
}
function iw({
  disabled: n,
  startRequired: i,
  isSending: s,
  hasDraft: r,
  onSend: c,
  onAttach: m,
  onPasteMaterial: h
}) {
  const [v, y] = J.useState(""), [g, _] = J.useState(""), j = J.useRef(null), z = n || i, O = (B) => {
    B?.preventDefault();
    const X = v.trim();
    if (!(z || s)) {
      if (!X) {
        r && (_("Describe what you want to change first."), j.current?.focus());
        return;
      }
      c(X), y(""), _("");
    }
  }, N = (B) => {
    B.key === "Enter" && !B.shiftKey && (B.preventDefault(), O());
  };
  return /* @__PURE__ */ f.jsxs("form", { className: "aiw-composer", onSubmit: O, "aria-label": "Message the AI quiz assistant", children: [
    /* @__PURE__ */ f.jsx("label", { htmlFor: "aiw-chat-message", className: "aiw-sr-only", children: r ? "Describe a revision to the quiz draft" : "Describe the quiz you want to create" }),
    /* @__PURE__ */ f.jsx(
      "textarea",
      {
        ref: j,
        id: "aiw-chat-message",
        value: v,
        onChange: (B) => {
          y(B.target.value), g && _("");
        },
        onKeyDown: N,
        rows: 3,
        maxLength: 8e3,
        disabled: z || s,
        placeholder: r ? "Ask for a controlled revision, for example “Make question 3 harder”…" : "Describe the course, topic, outcomes, difficulty, question types, and special instructions…",
        "aria-describedby": g ? "aiw-composer-validation" : void 0
      }
    ),
    g ? /* @__PURE__ */ f.jsx("p", { id: "aiw-composer-validation", className: "aiw-composer__validation", role: "status", children: g }) : null,
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-composer__footer", children: [
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-composer__tools", children: [
        /* @__PURE__ */ f.jsxs("button", { type: "button", onClick: m, disabled: n, "aria-label": "Upload course material", children: [
          /* @__PURE__ */ f.jsx("span", { "aria-hidden": "true", children: "＋" }),
          " Attach"
        ] }),
        /* @__PURE__ */ f.jsx("button", { type: "button", onClick: h, disabled: n, "aria-label": "Paste course material", children: "Paste notes" })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-composer__send", children: [
        /* @__PURE__ */ f.jsxs("span", { children: [
          v.length,
          "/8000"
        ] }),
        /* @__PURE__ */ f.jsx(
          "button",
          {
            className: "aiw-button aiw-button--primary",
            type: "submit",
            disabled: !r && !v.trim() || z || s,
            children: s ? "Sending…" : r ? "Request revision" : "Send"
          }
        )
      ] })
    ] })
  ] });
}
const Sp = [
  "validating_quiz_plan",
  "retrieving_course_material",
  "selecting_source_passages",
  "generating_questions",
  "validating_generated_output",
  "saving_draft",
  "opening_review_workspace"
];
function lw({ generation: n, cancelling: i, onCancel: s }) {
  const r = Sp.indexOf(n.stage);
  return /* @__PURE__ */ f.jsxs("section", { className: "aiw-generation", "aria-labelledby": "aiw-generation-title", "aria-live": "polite", children: [
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-generation__head", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: "Generation in progress" }),
        /* @__PURE__ */ f.jsx("h3", { id: "aiw-generation-title", children: _p(n.stage) }),
        n.message ? /* @__PURE__ */ f.jsx("p", { children: n.message }) : null
      ] }),
      n.canCancel ? /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "aiw-button aiw-button--danger aiw-button--small",
          type: "button",
          onClick: s,
          disabled: i,
          children: i ? "Stopping…" : "Stop generation"
        }
      ) : null
    ] }),
    /* @__PURE__ */ f.jsx("ol", { className: "aiw-generation__stages", "aria-label": "Generation stages", children: Sp.map((c, m) => /* @__PURE__ */ f.jsxs(
      "li",
      {
        className: [
          c === n.stage ? "is-current" : "",
          r >= 0 && m < r ? "is-complete" : ""
        ].filter(Boolean).join(" "),
        "aria-current": c === n.stage ? "step" : void 0,
        children: [
          /* @__PURE__ */ f.jsx("span", { "aria-hidden": "true", children: r >= 0 && m < r ? "✓" : m + 1 }),
          _p(c)
        ]
      },
      c
    )) })
  ] });
}
function sw({
  revision: n,
  applying: i,
  onApply: s,
  onDismiss: r
}) {
  const c = n.beforeSnapshot.questionCount, m = n.proposedSnapshot.questionCount, h = n.proposedSnapshot.title || n.beforeSnapshot.title || "Untitled quiz", v = c !== null || m !== null;
  return /* @__PURE__ */ f.jsxs("section", { className: "aiw-revision-preview", "aria-labelledby": "aiw-revision-title", children: [
    /* @__PURE__ */ f.jsxs("div", { children: [
      /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: "Revision preview" }),
      /* @__PURE__ */ f.jsx("h3", { id: "aiw-revision-title", children: n.summary }),
      /* @__PURE__ */ f.jsx("p", { children: "No quiz content has been replaced yet." })
    ] }),
    /* @__PURE__ */ f.jsxs("dl", { className: "aiw-revision-facts", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Proposed title" }),
        /* @__PURE__ */ f.jsx("dd", { children: h })
      ] }),
      v ? /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ f.jsxs(
          "dd",
          {
            "aria-label": `Question count changes from ${c ?? "unknown"} to ${m ?? "unknown"}`,
            children: [
              c ?? "—",
              " ",
              /* @__PURE__ */ f.jsx("span", { "aria-hidden": "true", children: "→" }),
              " ",
              m ?? "—"
            ]
          }
        )
      ] }) : null,
      n.changedQuestionCount ? /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Changed" }),
        /* @__PURE__ */ f.jsx("dd", { children: n.changedQuestionCount })
      ] }) : null,
      n.removedQuestionCount ? /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Removed" }),
        /* @__PURE__ */ f.jsx("dd", { children: n.removedQuestionCount })
      ] }) : null,
      n.addedQuestionCount ? /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Added" }),
        /* @__PURE__ */ f.jsx("dd", { children: n.addedQuestionCount })
      ] }) : null
    ] }),
    n.changes.length ? /* @__PURE__ */ f.jsx("ul", { children: n.changes.map((y, g) => /* @__PURE__ */ f.jsx("li", { children: y }, `${g}-${y}`)) }) : null,
    n.destructive ? /* @__PURE__ */ f.jsx("p", { className: "aiw-warning-note", children: "This revision replaces or removes existing questions. Review it carefully before applying." }) : null,
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-actions", children: [
      /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, disabled: i, children: "Keep current draft" }),
      /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: s, disabled: i, children: i ? "Applying…" : "Apply revision" })
    ] })
  ] });
}
function uw({ replies: n, onSelect: i, disabled: s = !1 }) {
  return n.length ? /* @__PURE__ */ f.jsx("div", { className: "aiw-suggestions", "aria-label": "Suggested replies", children: n.map((r) => /* @__PURE__ */ f.jsx(
    "button",
    {
      type: "button",
      onClick: () => i(r.value),
      disabled: s,
      children: r.label
    },
    `${r.label}-${r.value}`
  )) }) : null;
}
const rw = "What kind of quiz would you like to create? You can describe the course, topic, learning objectives, difficulty, question types and any special instructions.";
function ow({
  detail: n,
  plan: i,
  courses: s,
  materials: r,
  coursesLoading: c,
  coursesError: m,
  courseSelectionPending: h,
  loading: v,
  error: y,
  isSending: g,
  generation: _,
  cancelling: j,
  revision: z,
  applyingRevision: O,
  onRetryLoad: N,
  onRetryCourses: B,
  onOpenCourses: X,
  onCourseSelect: $,
  onSend: ae,
  onRetryMessage: G,
  onAttach: P,
  onPasteMaterial: ie,
  onCancelGeneration: ce,
  onApplyRevision: H,
  onDismissRevision: R,
  review: le
}) {
  const xe = J.useRef(null), I = n?.messages || [], te = J.useMemo(
    () => aw({ detail: n, plan: i, courses: s, materials: r }),
    [s, n, r, i]
  ), ue = !!i.courseId && !c && !m && s.length > 0, ze = !!n?.draft, we = !ze || n?.draft?.status === "draft", M = !!(_ && ["queued", "generating", "cancel_requested"].includes(_.status)), Y = J.useMemo(() => xu(i), [i]);
  return J.useEffect(() => {
    xe.current?.scrollTo({
      top: xe.current.scrollHeight,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }, [I.length, g]), /* @__PURE__ */ f.jsxs("section", { className: `aiw-chat ${ze ? "aiw-chat--with-review" : ""}`, "aria-labelledby": "aiw-chat-heading", children: [
    /* @__PURE__ */ f.jsxs("header", { className: "aiw-chat__header", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: "Guided quiz designer" }),
        /* @__PURE__ */ f.jsx("h2", { id: "aiw-chat-heading", children: n?.title || "New quiz conversation" })
      ] }),
      n ? /* @__PURE__ */ f.jsx("span", { className: "aiw-chat__context", children: Y.length ? `Still needs ${Y.map(yv).slice(0, 2).join(" and ")}` : "Quiz plan is ready" }) : null
    ] }),
    y ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("strong", { children: "Conversation unavailable" }),
        /* @__PURE__ */ f.jsx("p", { children: "Your work is still stored. Try loading it again." })
      ] }),
      /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: N, children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ f.jsxs(
      "div",
      {
        ref: xe,
        className: "aiw-message-list",
        "aria-live": "polite",
        "aria-busy": v || g,
        "aria-label": "Conversation messages",
        children: [
          v ? /* @__PURE__ */ f.jsx("p", { className: "aiw-loading-message", role: "status", children: "Loading conversation…" }) : null,
          !v && !I.length ? /* @__PURE__ */ f.jsxs("article", { className: "aiw-message aiw-message--assistant", children: [
            /* @__PURE__ */ f.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ f.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ f.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ f.jsx("p", { children: rw })
            ] })
          ] }) : null,
          !v && !i.courseId ? /* @__PURE__ */ f.jsxs("section", { className: "aiw-course-start", "aria-labelledby": "aiw-course-start-heading", children: [
            /* @__PURE__ */ f.jsxs("div", { children: [
              /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: "First step" }),
              /* @__PURE__ */ f.jsx("h3", { id: "aiw-course-start-heading", children: "Choose the course for this quiz" }),
              /* @__PURE__ */ f.jsx("p", { children: "The course controls available materials, context, and course-specific suggestions." })
            ] }),
            c ? /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : m ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
              /* @__PURE__ */ f.jsx("span", { children: "Courses could not be loaded." }),
              /* @__PURE__ */ f.jsx("button", { type: "button", onClick: B, children: "Retry" })
            ] }) : s.length ? /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ f.jsx("span", { children: "Course" }),
              /* @__PURE__ */ f.jsxs(
                "select",
                {
                  id: "aiw-start-course",
                  "aria-label": "Choose a course to start",
                  value: "",
                  disabled: h,
                  onChange: (V) => {
                    const je = Number(V.target.value);
                    je && $(je);
                  },
                  children: [
                    /* @__PURE__ */ f.jsx("option", { value: "", children: h ? "Starting course workspace…" : "Select a course" }),
                    s.map((V) => /* @__PURE__ */ f.jsxs("option", { value: V.id, children: [
                      V.code,
                      " — ",
                      V.title
                    ] }, V.id))
                  ]
                }
              ),
              /* @__PURE__ */ f.jsx("small", { children: "Selecting a course starts and saves this conversation." })
            ] }) : /* @__PURE__ */ f.jsxs("div", { className: "aiw-course-start__empty", children: [
              /* @__PURE__ */ f.jsx("p", { children: "No courses are available for your account yet." }),
              /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: X, children: "Open Courses" })
            ] })
          ] }) : null,
          I.map((V) => /* @__PURE__ */ f.jsxs(
            "article",
            {
              className: `aiw-message aiw-message--${V.sender}`,
              "data-status": V.status,
              children: [
                /* @__PURE__ */ f.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: V.sender === "user" ? "You" : "AI" }),
                /* @__PURE__ */ f.jsxs("div", { className: "aiw-message__bubble", children: [
                  /* @__PURE__ */ f.jsxs("div", { className: "aiw-message__meta", children: [
                    /* @__PURE__ */ f.jsx("span", { className: "aiw-message__author", children: V.sender === "user" ? "You" : "Quiz Assistant" }),
                    V.createdAt ? /* @__PURE__ */ f.jsx("time", { dateTime: pv(V.createdAt), children: Vz(V.createdAt) }) : null
                  ] }),
                  /* @__PURE__ */ f.jsx("p", { children: V.content }),
                  V.status === "failed" ? /* @__PURE__ */ f.jsx("button", { type: "button", className: "aiw-text-button", onClick: () => G(V), children: "Retry message" }) : null
                ] })
              ]
            },
            V.id
          )),
          g ? /* @__PURE__ */ f.jsxs("article", { className: "aiw-message aiw-message--assistant aiw-message--pending", role: "status", children: [
            /* @__PURE__ */ f.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ f.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ f.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ f.jsxs("span", { className: "aiw-typing", "aria-label": "Assistant is responding", children: [
                /* @__PURE__ */ f.jsx("i", {}),
                /* @__PURE__ */ f.jsx("i", {}),
                /* @__PURE__ */ f.jsx("i", {})
              ] })
            ] })
          ] }) : null
        ]
      }
    ),
    /* @__PURE__ */ f.jsx(
      uw,
      {
        replies: ue ? te : [],
        onSelect: ae,
        disabled: g || M || h || !we
      }
    ),
    z ? /* @__PURE__ */ f.jsx(
      sw,
      {
        revision: z,
        applying: O,
        onApply: () => H(z),
        onDismiss: R
      }
    ) : null,
    _?.status === "generating" ? /* @__PURE__ */ f.jsx(lw, { generation: _, cancelling: j, onCancel: ce }) : null,
    v ? null : /* @__PURE__ */ f.jsx(
      iw,
      {
        disabled: h || M || !we,
        startRequired: !n && !i.courseId,
        isSending: g,
        hasDraft: ze,
        onSend: ae,
        onAttach: P,
        onPasteMaterial: ie
      }
    ),
    le
  ] });
}
function cw({
  conversations: n,
  selectedId: i,
  isLoading: s,
  isError: r,
  isCreating: c,
  deletingId: m,
  onNew: h,
  onSelect: v,
  onDelete: y,
  onRetry: g,
  materials: _
}) {
  const [j, z] = J.useState(""), [O, N] = J.useState("all"), [B, X] = J.useState(null), $ = J.useMemo(() => {
    const G = j.trim().toLocaleLowerCase();
    return n.filter((P) => {
      const ie = !G || P.title.toLocaleLowerCase().includes(G), ce = O === "all" || P.status === O;
      return ie && ce;
    });
  }, [n, j, O]), ae = n.filter((G) => G.draftId).slice(0, 4);
  return /* @__PURE__ */ f.jsxs("aside", { className: "aiw-sidebar", "aria-label": "AI conversations and materials", children: [
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-sidebar__top", children: [
      /* @__PURE__ */ f.jsxs("button", { className: "aiw-button aiw-button--primary aiw-button--full", type: "button", onClick: h, disabled: c, children: [
        /* @__PURE__ */ f.jsx("span", { "aria-hidden": "true", children: "＋" }),
        c ? "Starting…" : "New conversation"
      ] }),
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-search", children: [
        /* @__PURE__ */ f.jsx("span", { className: "aiw-sr-only", children: "Search conversations" }),
        /* @__PURE__ */ f.jsx("span", { "aria-hidden": "true", children: "⌕" }),
        /* @__PURE__ */ f.jsx(
          "input",
          {
            type: "search",
            value: j,
            onChange: (G) => z(G.target.value),
            placeholder: "Search conversations"
          }
        )
      ] }),
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-field aiw-field--compact", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Status" }),
        /* @__PURE__ */ f.jsxs("select", { value: O, onChange: (G) => N(G.target.value), children: [
          /* @__PURE__ */ f.jsx("option", { value: "all", children: "All conversations" }),
          /* @__PURE__ */ f.jsx("option", { value: "gathering_requirements", children: "Gathering requirements" }),
          /* @__PURE__ */ f.jsx("option", { value: "ready_to_generate", children: "Ready to generate" }),
          /* @__PURE__ */ f.jsx("option", { value: "review_required", children: "Review required" }),
          /* @__PURE__ */ f.jsx("option", { value: "draft_saved", children: "Draft saved" }),
          /* @__PURE__ */ f.jsx("option", { value: "generation_failed", children: "Generation failed" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-conversations-heading", children: [
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ f.jsx("h2", { id: "aiw-conversations-heading", children: "Conversations" }),
        /* @__PURE__ */ f.jsx("span", { children: $.length })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-conversation-list", children: [
        s ? /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", role: "status", children: "Loading conversations…" }) : null,
        r ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Conversations could not be loaded." }),
          /* @__PURE__ */ f.jsx("button", { type: "button", onClick: g, children: "Retry" })
        ] }) : null,
        !s && !r && !$.length ? /* @__PURE__ */ f.jsx("div", { className: "aiw-mini-empty", children: /* @__PURE__ */ f.jsx("p", { children: n.length ? "No conversations match this filter." : "No conversations yet." }) }) : null,
        $.map((G) => /* @__PURE__ */ f.jsxs(
          "div",
          {
            className: `aiw-conversation-row ${i === G.id ? "is-active" : ""}`,
            children: [
              /* @__PURE__ */ f.jsxs(
                "button",
                {
                  className: "aiw-conversation",
                  type: "button",
                  onClick: () => v(G.id),
                  "aria-current": i === G.id ? "page" : void 0,
                  children: [
                    /* @__PURE__ */ f.jsx("span", { className: "aiw-conversation__title", children: G.title }),
                    /* @__PURE__ */ f.jsx("span", { className: `aiw-status aiw-status--${G.status}`, children: uc(G.status) })
                  ]
                }
              ),
              /* @__PURE__ */ f.jsx(
                "button",
                {
                  className: "aiw-conversation__delete",
                  type: "button",
                  "aria-label": `Delete conversation: ${G.title}`,
                  title: G.status === "generating" ? "Stop quiz generation before deleting this conversation" : "Delete conversation",
                  disabled: m === G.id || G.status === "generating",
                  onClick: () => X(G),
                  children: /* @__PURE__ */ f.jsx("span", { "aria-hidden": "true", children: "×" })
                }
              )
            ]
          },
          G.id
        ))
      ] })
    ] }),
    ae.length ? /* @__PURE__ */ f.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-drafts-heading", children: [
      /* @__PURE__ */ f.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ f.jsx("h2", { id: "aiw-drafts-heading", children: "Recent drafts" }) }),
      /* @__PURE__ */ f.jsx("div", { className: "aiw-compact-list", children: ae.map((G) => /* @__PURE__ */ f.jsxs("button", { type: "button", onClick: () => v(G.id), children: [
        /* @__PURE__ */ f.jsx("span", { children: G.title }),
        /* @__PURE__ */ f.jsx("small", { children: uc(G.status) })
      ] }, G.id)) })
    ] }) : null,
    _,
    B ? /* @__PURE__ */ f.jsxs(
      wu,
      {
        title: "Delete conversation?",
        description: "This permanently removes the conversation and all of its chat messages.",
        onClose: () => X(null),
        children: [
          /* @__PURE__ */ f.jsxs("p", { className: "aiw-delete-conversation-copy", children: [
            /* @__PURE__ */ f.jsx("strong", { children: B.title }),
            " cannot be recovered after deletion."
          ] }),
          /* @__PURE__ */ f.jsxs("div", { className: "aiw-dialog-actions", children: [
            /* @__PURE__ */ f.jsx(
              "button",
              {
                className: "aiw-button aiw-button--quiet",
                type: "button",
                onClick: () => X(null),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ f.jsx(
              "button",
              {
                className: "aiw-button aiw-button--danger",
                type: "button",
                disabled: m === B.id,
                onClick: () => {
                  y(B.id), X(null);
                },
                children: m === B.id ? "Deleting…" : "Delete conversation"
              }
            )
          ] })
        ]
      }
    ) : null
  ] });
}
function fw({
  client: n,
  conversationId: i,
  plan: s,
  courseId: r,
  courses: c,
  coursesLoading: m,
  coursesError: h,
  courseSelectionPending: v,
  onPlanPatch: y,
  onCourseSelect: g,
  onRetryCourses: _,
  onOpenCourses: j,
  onToast: z
}) {
  const O = Mi(), [N, B] = J.useState(""), X = Cn({
    queryKey: ["ai", "materials", r],
    queryFn: () => n.listMaterials(r),
    enabled: !!r
  }), $ = X.data || [], ae = qt({
    mutationFn: ({ selectedCourseId: H, file: R }) => n.uploadMaterial(H, R),
    onSuccess: async () => {
      await Promise.all([
        O.invalidateQueries({ queryKey: ["ai", "materials", r] }),
        i ? O.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), z("Course material indexed.", "success");
    },
    onError: (H) => z(H instanceof Error ? H.message : "Material upload failed.", "error")
  }), G = qt({
    mutationFn: ({ selectedCourseId: H, materialId: R }) => n.deleteMaterial(H, R),
    onSuccess: async (H, R) => {
      y({ materialIds: s.materialIds.filter((le) => le !== R.materialId) }), await Promise.all([
        O.invalidateQueries({ queryKey: ["ai", "materials", r] }),
        i ? O.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), z("Material removed.", "success");
    },
    onError: (H) => z(H instanceof Error ? H.message : "Could not remove material.", "error")
  }), P = J.useMemo(() => {
    const H = N.trim().toLocaleLowerCase();
    return $.filter((R) => !H || R.originalName.toLocaleLowerCase().includes(H));
  }, [N, $]), ie = (H) => {
    const R = H.target.files?.[0];
    H.target.value = "", !(!R || !r) && ae.mutate({ selectedCourseId: r, file: R });
  }, ce = (H) => {
    if (!i) {
      z("Start a conversation before selecting source material.", "info");
      return;
    }
    const R = s.materialIds.includes(H.id);
    y({
      materialIds: R ? s.materialIds.filter((le) => le !== H.id) : [...s.materialIds, H.id]
    });
  };
  return /* @__PURE__ */ f.jsxs("section", { className: "aiw-sidebar__section aiw-materials", "aria-labelledby": "aiw-materials-heading", children: [
    /* @__PURE__ */ f.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ f.jsxs("div", { children: [
      /* @__PURE__ */ f.jsx("h2", { id: "aiw-materials-heading", children: "Course materials" }),
      /* @__PURE__ */ f.jsx("small", { children: r ? `${$.length} indexed` : "Choose a course first" })
    ] }) }),
    r ? null : /* @__PURE__ */ f.jsx("div", { className: "aiw-material-course", children: m ? /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : h ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
      /* @__PURE__ */ f.jsx("span", { children: "Courses could not be loaded." }),
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: _, children: "Retry" })
    ] }) : c.length ? /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
      /* @__PURE__ */ f.jsx("span", { children: "Course for materials" }),
      /* @__PURE__ */ f.jsxs(
        "select",
        {
          "aria-label": "Course for materials",
          value: "",
          disabled: v,
          onChange: (H) => {
            const R = Number(H.target.value);
            R && g(R);
          },
          children: [
            /* @__PURE__ */ f.jsx("option", { value: "", children: v ? "Starting workspace…" : "Select a course" }),
            c.map((H) => /* @__PURE__ */ f.jsxs("option", { value: H.id, children: [
              H.code,
              " — ",
              H.title
            ] }, H.id))
          ]
        }
      )
    ] }) : /* @__PURE__ */ f.jsx(
      "button",
      {
        className: "aiw-button aiw-button--quiet aiw-button--small aiw-button--full",
        type: "button",
        onClick: j,
        children: "Open Courses"
      }
    ) }),
    /* @__PURE__ */ f.jsx(
      "input",
      {
        id: "aiw-material-upload",
        className: "aiw-sr-only",
        type: "file",
        accept: ".pdf,.txt,.md,.docx",
        onChange: ie,
        disabled: !r || v || ae.isPending
      }
    ),
    ae.isPending ? /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", role: "status", children: "Indexing material…" }) : null,
    $.length > 4 ? /* @__PURE__ */ f.jsxs("label", { className: "aiw-search aiw-search--small", children: [
      /* @__PURE__ */ f.jsx("span", { className: "aiw-sr-only", children: "Filter course materials" }),
      /* @__PURE__ */ f.jsx("span", { "aria-hidden": "true", children: "⌕" }),
      /* @__PURE__ */ f.jsx("input", { value: N, onChange: (H) => B(H.target.value), placeholder: "Filter materials" })
    ] }) : null,
    X.isLoading ? /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", role: "status", children: "Loading materials…" }) : null,
    X.isError ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
      /* @__PURE__ */ f.jsx("span", { children: "Materials could not be loaded." }),
      /* @__PURE__ */ f.jsx("button", { type: "button", onClick: () => X.refetch(), children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-material-list", children: [
      r && !X.isLoading && !P.length ? /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", children: "No indexed material for this course." }) : null,
      P.map((H) => /* @__PURE__ */ f.jsxs("div", { className: "aiw-material", children: [
        /* @__PURE__ */ f.jsxs("label", { children: [
          /* @__PURE__ */ f.jsx(
            "input",
            {
              type: "checkbox",
              checked: s.materialIds.includes(H.id),
              onChange: () => ce(H),
              disabled: H.status === "failed"
            }
          ),
          /* @__PURE__ */ f.jsxs("span", { children: [
            /* @__PURE__ */ f.jsx("strong", { children: H.originalName }),
            /* @__PURE__ */ f.jsx("small", { children: H.status === "failed" ? H.errorMessage || "Indexing failed" : `${H.chunkCount} chunks${H.byteSize ? ` · ${Jz(H.byteSize)}` : ""}` })
          ] })
        ] }),
        /* @__PURE__ */ f.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            "aria-label": `Remove ${H.originalName}`,
            disabled: G.isPending,
            onClick: () => {
              r && window.confirm(`Remove “${H.originalName}” and its indexed chunks?`) && G.mutate({ selectedCourseId: r, materialId: H.id });
            },
            children: "×"
          }
        )
      ] }, H.id))
    ] })
  ] });
}
function dw({
  client: n,
  courseId: i,
  conversationId: s,
  onClose: r,
  onToast: c
}) {
  const m = Mi(), [h, v] = J.useState("Pasted course notes"), [y, g] = J.useState(""), _ = qt({
    mutationFn: () => n.pasteMaterial(i, { name: h.trim(), content: y.trim() }),
    onSuccess: async () => {
      await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "materials", i] }),
        s ? m.invalidateQueries({ queryKey: ["ai", "conversation", s] }) : Promise.resolve()
      ]), c("Pasted notes indexed.", "success"), r();
    },
    onError: (z) => c(z instanceof Error ? z.message : "Could not index pasted notes.", "error")
  }), j = (z) => {
    z.preventDefault(), h.trim() && y.trim() && _.mutate();
  };
  return /* @__PURE__ */ f.jsx(
    wu,
    {
      title: "Paste course material",
      description: "The text is treated as untrusted reference content and indexed only for this course.",
      onClose: r,
      size: "wide",
      children: /* @__PURE__ */ f.jsxs("form", { className: "aiw-dialog-form", onSubmit: j, children: [
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Material name" }),
          /* @__PURE__ */ f.jsx("input", { value: h, onChange: (z) => v(z.target.value), maxLength: 160, required: !0 })
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Course notes" }),
          /* @__PURE__ */ f.jsx(
            "textarea",
            {
              value: y,
              onChange: (z) => g(z.target.value),
              rows: 12,
              maxLength: 1e5,
              required: !0,
              placeholder: "Paste lecture notes, reading excerpts, or other course-owned content…"
            }
          )
        ] }),
        /* @__PURE__ */ f.jsxs("p", { className: "aiw-field-hint", children: [
          y.length.toLocaleString(),
          " / 100,000 characters"
        ] }),
        /* @__PURE__ */ f.jsxs("div", { className: "aiw-dialog-actions", children: [
          /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, children: "Cancel" }),
          /* @__PURE__ */ f.jsx(
            "button",
            {
              className: "aiw-button aiw-button--primary",
              type: "submit",
              disabled: !h.trim() || !y.trim() || _.isPending,
              children: _.isPending ? "Indexing notes…" : "Index pasted text"
            }
          )
        ] })
      ] })
    }
  );
}
const zp = [
  ["multipleChoice", "Multiple choice"],
  ["trueFalse", "True / false"],
  ["shortAnswer", "Short answer"],
  ["essay", "Essay"],
  ["coding", "Coding"]
];
function ou(n) {
  return n == null || n === "" ? "Not set" : n;
}
function hw({
  plan: n,
  courses: i,
  coursesLoading: s,
  coursesError: r,
  courseSelectionPending: c,
  courseLocked: m,
  conversationId: h,
  conversationStatus: v,
  generation: y,
  generating: g,
  generationAvailable: _,
  generationConfigured: j,
  onCourseSelect: z,
  onRetryCourses: O,
  onOpenCourses: N,
  onPatch: B,
  onGenerate: X
}) {
  const [$, ae] = J.useState(""), G = xu(n), P = !!h && vv(n), ie = i.find((R) => R.id === n.courseId), ce = Object.values(n.questionTypeDistribution).reduce((R, le) => R + Number(le || 0), 0);
  J.useEffect(() => {
    ae("");
  }, [h]);
  const H = (R, le) => {
    B({
      questionTypeDistribution: {
        ...n.questionTypeDistribution,
        [R]: Math.max(0, le)
      }
    });
  };
  return /* @__PURE__ */ f.jsxs("aside", { className: "aiw-plan", "aria-labelledby": "aiw-plan-heading", children: [
    /* @__PURE__ */ f.jsxs("header", { className: "aiw-plan__header", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: "Live specification" }),
        /* @__PURE__ */ f.jsx("h2", { id: "aiw-plan-heading", children: "Quiz Plan" })
      ] }),
      /* @__PURE__ */ f.jsxs("span", { className: `aiw-readiness ${P ? "is-ready" : ""}`, children: [
        /* @__PURE__ */ f.jsx("i", { "aria-hidden": "true" }),
        P ? "Ready" : `${G.length} missing`
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-plan__status", children: [
      /* @__PURE__ */ f.jsx("span", { children: "Status" }),
      /* @__PURE__ */ f.jsx("strong", { children: uc(y?.status || v) })
    ] }),
    /* @__PURE__ */ f.jsxs("section", { className: "aiw-plan-course", "aria-labelledby": "aiw-plan-course-heading", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("h3", { id: "aiw-plan-course-heading", children: "Course" }),
        /* @__PURE__ */ f.jsx("small", { children: m ? "Locked after draft generation" : "Required before planning or adding material" })
      ] }),
      s ? /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : r ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Courses could not be loaded." }),
        /* @__PURE__ */ f.jsx("button", { type: "button", onClick: O, children: "Retry" })
      ] }) : i.length ? /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsx("span", { className: "aiw-sr-only", children: "Quiz course" }),
        /* @__PURE__ */ f.jsxs(
          "select",
          {
            "aria-label": "Quiz course",
            value: n.courseId || "",
            disabled: c || g || m,
            onChange: (R) => {
              const le = Number(R.target.value);
              le && z(le);
            },
            children: [
              /* @__PURE__ */ f.jsx("option", { value: "", disabled: !0, children: c ? "Saving course…" : "Select a course" }),
              i.map((R) => /* @__PURE__ */ f.jsxs("option", { value: R.id, children: [
                R.code,
                " — ",
                R.title
              ] }, R.id))
            ]
          }
        )
      ] }) : /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: N, children: "Open Courses" }),
      m ? /* @__PURE__ */ f.jsx("p", { children: "Start a new conversation to use another course." }) : null
    ] }),
    /* @__PURE__ */ f.jsxs("dl", { className: "aiw-plan-summary", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Course" }),
        /* @__PURE__ */ f.jsx("dd", { children: ie ? `${ie.code} · ${ie.title}` : "Not set" })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Topic" }),
        /* @__PURE__ */ f.jsx("dd", { children: ou(n.topic) })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Difficulty" }),
        /* @__PURE__ */ f.jsx("dd", { children: ou(n.difficulty) })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ f.jsx("dd", { children: ou(n.questionCount) })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Language" }),
        /* @__PURE__ */ f.jsx("dd", { children: ou(n.language) })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("dt", { children: "Knowledge scope" }),
        /* @__PURE__ */ f.jsx("dd", { children: n.materialScope.replaceAll("_", " ") })
      ] })
    ] }),
    n.learningObjectives.length ? /* @__PURE__ */ f.jsxs("section", { className: "aiw-plan__objectives", "aria-labelledby": "aiw-objectives-heading", children: [
      /* @__PURE__ */ f.jsx("h3", { id: "aiw-objectives-heading", children: "Learning objectives" }),
      /* @__PURE__ */ f.jsx("ul", { children: n.learningObjectives.map((R) => /* @__PURE__ */ f.jsx("li", { children: R }, R)) })
    ] }) : null,
    /* @__PURE__ */ f.jsxs("section", { className: "aiw-plan__types", "aria-labelledby": "aiw-type-summary-heading", children: [
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ f.jsx("h3", { id: "aiw-type-summary-heading", children: "Question mix" }),
        /* @__PURE__ */ f.jsxs("span", { children: [
          ce,
          "/",
          n.questionCount || 0
        ] })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-type-bars", children: [
        zp.filter(([R]) => n.questionTypeDistribution[R] > 0).map(([R, le]) => /* @__PURE__ */ f.jsxs("div", { children: [
          /* @__PURE__ */ f.jsx("span", { children: le }),
          /* @__PURE__ */ f.jsx("strong", { children: n.questionTypeDistribution[R] })
        ] }, R)),
        ce ? null : /* @__PURE__ */ f.jsx("p", { className: "aiw-muted", children: "No question types selected." })
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("label", { className: "aiw-field aiw-draft-title", children: [
      /* @__PURE__ */ f.jsxs("span", { children: [
        "Draft title ",
        /* @__PURE__ */ f.jsx("small", { children: "optional" })
      ] }),
      /* @__PURE__ */ f.jsx(
        "input",
        {
          value: $,
          maxLength: 120,
          disabled: !h || g,
          onChange: (R) => ae(R.target.value),
          placeholder: "AI will suggest one if left blank"
        }
      )
    ] }),
    !h || !n.courseId ? /* @__PURE__ */ f.jsx("div", { className: "aiw-plan-note", role: "status", children: "Choose a course above to start a saved quiz plan." }) : j ? _ ? G.length ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-plan-note", role: "status", children: [
      /* @__PURE__ */ f.jsx("strong", { children: "Still needed:" }),
      " ",
      G.map(yv).join(", ")
    ] }) : /* @__PURE__ */ f.jsx("div", { className: "aiw-plan-note aiw-plan-note--success", role: "status", children: "The plan is complete. Generation starts only when you choose Generate Draft." }) : /* @__PURE__ */ f.jsx("div", { className: "aiw-plan-note", role: "status", children: "AI generation is currently disabled. Your Quiz Plan remains saved." }) : /* @__PURE__ */ f.jsx("div", { className: "aiw-plan-note", role: "status", children: "Configure Azure OpenAI in Azure settings before generating a draft." }),
    /* @__PURE__ */ f.jsx(
      "button",
      {
        className: "aiw-button aiw-button--primary aiw-button--full aiw-generate-button",
        type: "button",
        onClick: () => X($.trim() || void 0),
        disabled: !P || g || !_,
        children: g ? "Generating draft…" : v === "generation_failed" ? "Retry generation" : "Generate Draft"
      }
    ),
    /* @__PURE__ */ f.jsx("p", { className: "aiw-safety-copy", children: "Generation always creates a private draft. Nothing is published automatically." }),
    /* @__PURE__ */ f.jsxs("details", { className: "aiw-advanced", children: [
      /* @__PURE__ */ f.jsxs("summary", { children: [
        /* @__PURE__ */ f.jsx("span", { children: "Advanced settings" }),
        /* @__PURE__ */ f.jsx("small", { children: "Direct controls for the same Quiz Plan" })
      ] }),
      /* @__PURE__ */ f.jsxs("fieldset", { disabled: !h || g, children: [
        /* @__PURE__ */ f.jsx("legend", { className: "aiw-sr-only", children: "Advanced Quiz Plan settings" }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Topic" }),
          /* @__PURE__ */ f.jsx(
            "input",
            {
              value: n.topic,
              maxLength: 500,
              onChange: (R) => B({ topic: R.target.value }),
              placeholder: "e.g. Python loops"
            }
          )
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsxs("span", { children: [
            "Learning objectives ",
            /* @__PURE__ */ f.jsx("small", { children: "one per line" })
          ] }),
          /* @__PURE__ */ f.jsx(
            "textarea",
            {
              rows: 3,
              value: n.learningObjectives.join(`
`),
              onChange: (R) => B({
                learningObjectives: R.target.value.split(`
`).map((le) => le.trim()).filter(Boolean)
              })
            }
          )
        ] }),
        /* @__PURE__ */ f.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ f.jsx("span", { children: "Difficulty" }),
            /* @__PURE__ */ f.jsxs(
              "select",
              {
                value: n.difficulty,
                onChange: (R) => B({ difficulty: R.target.value }),
                children: [
                  /* @__PURE__ */ f.jsx("option", { value: "", children: "Select difficulty" }),
                  /* @__PURE__ */ f.jsx("option", { value: "easy", children: "Easy" }),
                  /* @__PURE__ */ f.jsx("option", { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ f.jsx("option", { value: "hard", children: "Hard" }),
                  /* @__PURE__ */ f.jsx("option", { value: "mixed", children: "Mixed" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ f.jsx("span", { children: "Question count" }),
            /* @__PURE__ */ f.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 20,
                value: n.questionCount || "",
                onChange: (R) => B({
                  questionCount: R.target.value ? Number(R.target.value) : null
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ f.jsxs("fieldset", { className: "aiw-distribution", children: [
          /* @__PURE__ */ f.jsx("legend", { children: "Question type distribution" }),
          /* @__PURE__ */ f.jsx("div", { className: "aiw-distribution__grid", children: zp.map(([R, le]) => /* @__PURE__ */ f.jsxs("label", { children: [
            /* @__PURE__ */ f.jsx("span", { children: le }),
            /* @__PURE__ */ f.jsx(
              "input",
              {
                "aria-label": `${le} count`,
                type: "number",
                min: 0,
                max: 20,
                value: n.questionTypeDistribution[R],
                onChange: (xe) => H(R, Number(xe.target.value || 0))
              }
            )
          ] }, R)) })
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Language" }),
          /* @__PURE__ */ f.jsx("input", { value: n.language, maxLength: 60, onChange: (R) => B({ language: R.target.value }) })
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Knowledge scope" }),
          /* @__PURE__ */ f.jsxs(
            "select",
            {
              value: n.materialScope,
              onChange: (R) => {
                const le = R.target.value;
                B({
                  materialScope: le,
                  useIndexedMaterialOnly: le === "course_material_only"
                });
              },
              children: [
                /* @__PURE__ */ f.jsx("option", { value: "general_knowledge_allowed", children: "General model knowledge allowed" }),
                /* @__PURE__ */ f.jsx("option", { value: "course_material_preferred", children: "Course material preferred" }),
                /* @__PURE__ */ f.jsx("option", { value: "course_material_only", children: "Course material only" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-check", children: [
          /* @__PURE__ */ f.jsx(
            "input",
            {
              type: "checkbox",
              checked: n.includeExplanations,
              onChange: (R) => B({ includeExplanations: R.target.checked })
            }
          ),
          /* @__PURE__ */ f.jsx("span", { children: "Include answer explanations" })
        ] }),
        /* @__PURE__ */ f.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ f.jsxs("span", { children: [
              "Time limit ",
              /* @__PURE__ */ f.jsx("small", { children: "minutes" })
            ] }),
            /* @__PURE__ */ f.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 600,
                value: n.timeLimitMinutes || "",
                onChange: (R) => B({
                  timeLimitMinutes: R.target.value ? Number(R.target.value) : null
                })
              }
            )
          ] }),
          /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ f.jsxs("span", { children: [
              "Tags ",
              /* @__PURE__ */ f.jsx("small", { children: "comma separated" })
            ] }),
            /* @__PURE__ */ f.jsx(
              "input",
              {
                value: n.tags.join(", "),
                onChange: (R) => B({
                  tags: R.target.value.split(",").map((le) => le.trim()).filter(Boolean)
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Additional instructions" }),
          /* @__PURE__ */ f.jsx(
            "textarea",
            {
              rows: 3,
              maxLength: 4e3,
              value: n.specialInstructions,
              onChange: (R) => B({ specialInstructions: R.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Scoring preferences" }),
          /* @__PURE__ */ f.jsx(
            "textarea",
            {
              rows: 2,
              maxLength: 1e3,
              value: n.scoringPreferences,
              onChange: (R) => B({ scoringPreferences: R.target.value }),
              placeholder: "e.g. 2 points each, partial credit for essays"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const mw = [
  ["multiple_choice", "Multiple choice"],
  ["true_false", "True / false"],
  ["short_answer", "Short answer"],
  ["essay", "Essay"],
  ["coding", "Coding"]
];
function pw(n) {
  return {
    ...n,
    questions: n.questions.map((i) => ({
      ...i,
      options: [...i.options],
      sourceReferences: i.sourceReferences.map((s) => ({ ...s }))
    }))
  };
}
function vw() {
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
function yw({
  question: n,
  index: i,
  total: s,
  selected: r,
  disabled: c,
  onSelect: m,
  onChange: h,
  onMove: v,
  onDelete: y,
  onDuplicate: g,
  onRegenerate: _,
  onOpenSource: j
}) {
  const z = J.useId(), O = n.type === "multiple_choice", N = n.type === "true_false", B = ($, ae) => {
    h({ ...n, [$]: ae });
  }, X = ($) => {
    if ($ === "multiple_choice") {
      const ae = n.options.length >= 3 ? n.options : ["Option A", "Option B", "Option C"];
      h({ ...n, type: $, options: ae, correctAnswer: ae.includes(n.correctAnswer) ? n.correctAnswer : ae[0] });
    } else h($ === "true_false" ? { ...n, type: $, options: ["true", "false"], correctAnswer: ["true", "false"].includes(n.correctAnswer) ? n.correctAnswer : "true" } : { ...n, type: $, options: [] });
  };
  return /* @__PURE__ */ f.jsxs("article", { className: `aiw-question ${r ? "is-selected" : ""}`, "aria-labelledby": `${z}-title`, children: [
    /* @__PURE__ */ f.jsxs("header", { className: "aiw-question__header", children: [
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-question__select", children: [
        /* @__PURE__ */ f.jsx(
          "input",
          {
            type: "checkbox",
            checked: r,
            onChange: ($) => m($.target.checked),
            disabled: c
          }
        ),
        /* @__PURE__ */ f.jsx("span", { className: "aiw-question__number", "aria-hidden": "true", children: i + 1 }),
        /* @__PURE__ */ f.jsxs("span", { className: "aiw-sr-only", children: [
          "Select question ",
          i + 1
        ] })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsxs("h4", { id: `${z}-title`, children: [
          "Question ",
          i + 1
        ] }),
        /* @__PURE__ */ f.jsx("span", { className: `aiw-validation aiw-validation--${n.validationStatus}`, children: n.validationStatus.replaceAll("_", " ") })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-question__order", "aria-label": `Reorder question ${i + 1}`, children: [
        /* @__PURE__ */ f.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            onClick: () => v(-1),
            disabled: c || i === 0,
            "aria-label": `Move question ${i + 1} up`,
            children: "↑"
          }
        ),
        /* @__PURE__ */ f.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            onClick: () => v(1),
            disabled: c || i === s - 1,
            "aria-label": `Move question ${i + 1} down`,
            children: "↓"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-question__body", children: [
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-field-row aiw-field-row--three", children: [
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Question type" }),
          /* @__PURE__ */ f.jsx("select", { value: n.type, onChange: ($) => X($.target.value), disabled: c, children: mw.map(([$, ae]) => /* @__PURE__ */ f.jsx("option", { value: $, children: ae }, $)) })
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Difficulty" }),
          /* @__PURE__ */ f.jsxs("select", { value: n.difficulty, onChange: ($) => B("difficulty", $.target.value), disabled: c, children: [
            /* @__PURE__ */ f.jsx("option", { value: "easy", children: "Easy" }),
            /* @__PURE__ */ f.jsx("option", { value: "medium", children: "Medium" }),
            /* @__PURE__ */ f.jsx("option", { value: "hard", children: "Hard" })
          ] })
        ] }),
        /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ f.jsx("span", { children: "Points" }),
          /* @__PURE__ */ f.jsx(
            "input",
            {
              type: "number",
              min: 0.25,
              max: 100,
              step: 0.25,
              value: n.points,
              onChange: ($) => B("points", Number($.target.value || 1)),
              disabled: c
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Question prompt" }),
        /* @__PURE__ */ f.jsx(
          "textarea",
          {
            rows: 3,
            maxLength: 4e3,
            value: n.text,
            onChange: ($) => B("text", $.target.value),
            disabled: c
          }
        )
      ] }),
      O ? /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsxs("span", { children: [
          "Answer options ",
          /* @__PURE__ */ f.jsx("small", { children: "one per line" })
        ] }),
        /* @__PURE__ */ f.jsx(
          "textarea",
          {
            rows: 4,
            value: n.options.join(`
`),
            onChange: ($) => {
              const ae = $.target.value.split(`
`), G = ae.includes(n.correctAnswer) ? n.correctAnswer : ae.find(Boolean) || "";
              h({ ...n, options: ae, correctAnswer: G });
            },
            disabled: c
          }
        )
      ] }) : null,
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsx("span", { children: n.type === "essay" ? "Expected answer or rubric" : "Correct answer" }),
        O || N ? /* @__PURE__ */ f.jsx("select", { value: n.correctAnswer, onChange: ($) => B("correctAnswer", $.target.value), disabled: c, children: (N ? ["true", "false"] : n.options.filter(Boolean)).map(($, ae) => /* @__PURE__ */ f.jsx("option", { value: $, children: $ }, `${ae}-${$}`)) }) : /* @__PURE__ */ f.jsx(
          "textarea",
          {
            rows: 2,
            maxLength: 2e3,
            value: n.correctAnswer,
            onChange: ($) => B("correctAnswer", $.target.value),
            disabled: c
          }
        )
      ] }),
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Explanation" }),
        /* @__PURE__ */ f.jsx(
          "textarea",
          {
            rows: 3,
            maxLength: 4e3,
            value: n.explanation,
            onChange: ($) => B("explanation", $.target.value),
            disabled: c
          }
        )
      ] }),
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Learning objective" }),
        /* @__PURE__ */ f.jsx(
          "input",
          {
            maxLength: 500,
            value: n.learningObjective,
            onChange: ($) => B("learningObjective", $.target.value),
            disabled: c
          }
        )
      ] }),
      n.sourceReferences.length ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-question__sources", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Sources" }),
        /* @__PURE__ */ f.jsx("div", { children: n.sourceReferences.map(($) => /* @__PURE__ */ f.jsx(
          "button",
          {
            type: "button",
            onClick: () => j($),
            disabled: c && !$.excerpt && !($.materialId && $.chunkId),
            children: $.label
          },
          $.id || $.label
        )) })
      ] }) : null
    ] }),
    /* @__PURE__ */ f.jsxs("footer", { className: "aiw-question__actions", children: [
      /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: _, disabled: c, children: "Regenerate" }),
      /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: g, disabled: c, children: "Duplicate" }),
      /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--danger aiw-button--small", type: "button", onClick: y, disabled: c, children: "Delete" })
    ] })
  ] });
}
function gw({
  draft: n,
  draftSaved: i,
  saving: s,
  regenerating: r,
  onSave: c,
  onRegenerate: m,
  onOpenQuiz: h,
  onOpenSource: v
}) {
  const [y, g] = J.useState(() => pw(n)), [_, j] = J.useState(() => JSON.stringify(n)), [z, O] = J.useState(i), [N, B] = J.useState(/* @__PURE__ */ new Set()), X = s || r, $ = n.status !== "draft", ae = X || $, G = JSON.stringify(n);
  J.useEffect(() => {
    const I = JSON.parse(G);
    g(I), j(G), O(i), B(/* @__PURE__ */ new Set());
  }, [G, i]);
  const P = J.useMemo(() => JSON.stringify(y) !== _, [y, _]), ie = (I, te) => {
    g((ue) => ({
      ...ue,
      questions: ue.questions.map((ze, we) => we === I ? te : ze)
    }));
  }, ce = (I, te) => {
    const ue = I + te;
    ue < 0 || ue >= y.questions.length || (g((ze) => {
      const we = [...ze.questions];
      return [we[I], we[ue]] = [we[ue], we[I]], { ...ze, questions: we };
    }), B(/* @__PURE__ */ new Set()));
  }, H = (I) => {
    window.confirm(`Delete question ${I + 1} from this draft?`) && (g((te) => ({
      ...te,
      questions: te.questions.filter((ue, ze) => ze !== I)
    })), B(/* @__PURE__ */ new Set()));
  }, R = (I) => {
    g((te) => {
      const ue = te.questions[I], ze = {
        ...ue,
        id: void 0,
        text: `${ue.text} (copy)`,
        options: [...ue.options],
        sourceReferences: ue.sourceReferences.map((M) => ({ ...M }))
      }, we = [...te.questions];
      return we.splice(I + 1, 0, ze), { ...te, questions: we };
    }), B(/* @__PURE__ */ new Set());
  }, le = async (I = !0) => {
    const te = await c(y, I);
    return te && (j(JSON.stringify(y)), O(!0)), te;
  }, xe = async (I) => {
    I.length && (P && !await le(!1) || await m(I));
  };
  return /* @__PURE__ */ f.jsxs("section", { className: "aiw-review", "aria-labelledby": "aiw-review-heading", children: [
    /* @__PURE__ */ f.jsxs("header", { className: "aiw-review__header", children: [
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: $ ? "Published quiz" : "Review required" }),
        /* @__PURE__ */ f.jsx("h3", { id: "aiw-review-heading", children: $ ? "Quiz review" : "Edit quiz draft" }),
        /* @__PURE__ */ f.jsx("p", { children: $ ? "This quiz is read-only here. Open it in Quizzes to manage its published version." : "Review every question before saving. The quiz remains private." })
      ] }),
      /* @__PURE__ */ f.jsx("span", { className: `aiw-save-state ${P ? "is-unsaved" : ""}`, role: "status", children: $ ? "Published in Quizzes" : P ? "Unsaved changes" : z ? "All changes saved" : "Ready to save as draft" })
    ] }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-review__meta", children: [
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Quiz title" }),
        /* @__PURE__ */ f.jsx(
          "input",
          {
            value: y.title,
            maxLength: 120,
            onChange: (I) => g((te) => ({ ...te, title: I.target.value })),
            disabled: ae
          }
        )
      ] }),
      /* @__PURE__ */ f.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ f.jsx("span", { children: "Description" }),
        /* @__PURE__ */ f.jsx(
          "textarea",
          {
            rows: 3,
            value: y.description,
            maxLength: 2e3,
            onChange: (I) => g((te) => ({ ...te, description: I.target.value })),
            disabled: ae
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-review__toolbar", children: [
      /* @__PURE__ */ f.jsxs("label", { children: [
        /* @__PURE__ */ f.jsx(
          "input",
          {
            type: "checkbox",
            checked: y.questions.length > 0 && N.size === y.questions.length,
            onChange: (I) => B(I.target.checked ? new Set(y.questions.map((te, ue) => ue)) : /* @__PURE__ */ new Set()),
            disabled: ae || !y.questions.length
          }
        ),
        "Select all"
      ] }),
      /* @__PURE__ */ f.jsxs("span", { children: [
        y.questions.length,
        " questions · ",
        y.questions.reduce((I, te) => I + Number(te.points || 0), 0),
        " points"
      ] }),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet aiw-button--small",
          type: "button",
          disabled: !N.size || ae,
          onClick: () => xe([...N].sort((I, te) => I - te)),
          children: r ? "Regenerating…" : `Regenerate selected (${N.size})`
        }
      )
    ] }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-question-list", children: [
      y.questions.map((I, te) => /* @__PURE__ */ f.jsx(
        yw,
        {
          question: I,
          index: te,
          total: y.questions.length,
          selected: N.has(te),
          disabled: ae,
          onSelect: (ue) => B((ze) => {
            const we = new Set(ze);
            return ue ? we.add(te) : we.delete(te), we;
          }),
          onChange: (ue) => ie(te, ue),
          onMove: (ue) => ce(te, ue),
          onDelete: () => H(te),
          onDuplicate: () => R(te),
          onRegenerate: () => xe([te]),
          onOpenSource: v
        },
        I.id || `${te}-${I.text.slice(0, 24)}`
      )),
      y.questions.length ? null : /* @__PURE__ */ f.jsxs("div", { className: "aiw-mini-empty", children: [
        /* @__PURE__ */ f.jsx("strong", { children: "This draft has no questions." }),
        /* @__PURE__ */ f.jsx("p", { children: "Add a manual question or ask the assistant to revise the quiz." })
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("footer", { className: "aiw-review__footer", children: [
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-review__footer-actions", children: [
        /* @__PURE__ */ f.jsx(
          "button",
          {
            className: "aiw-button aiw-button--quiet",
            type: "button",
            disabled: ae || y.questions.length >= 20,
            onClick: () => g((I) => ({ ...I, questions: [...I.questions, vw()] })),
            children: "＋ Add manual question"
          }
        ),
        n.quizId ? /* @__PURE__ */ f.jsx(
          "button",
          {
            className: "aiw-button aiw-button--quiet",
            type: "button",
            disabled: X,
            onClick: () => h(n.quizId),
            children: "Open in Quizzes"
          }
        ) : null
      ] }),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "aiw-button aiw-button--primary",
          type: "button",
          onClick: () => le(!0),
          disabled: $ || !P && z || X || !y.title.trim() || !y.questions.length,
          children: s ? "Saving…" : "Save as draft"
        }
      )
    ] })
  ] });
}
function bw({ client: n, courseId: i, source: s, onClose: r }) {
  const c = !!(s.materialId && s.chunkId), m = Cn({
    queryKey: ["ai", "source", i, s.materialId, s.chunkId],
    queryFn: () => n.getMaterialChunk(i, s.materialId, s.chunkId),
    enabled: c
  });
  return /* @__PURE__ */ f.jsxs(
    wu,
    {
      title: s.label || "Course material source",
      description: "Use this excerpt to verify the generated question against the selected course material.",
      onClose: r,
      size: "wide",
      children: [
        m.isLoading ? /* @__PURE__ */ f.jsx("p", { role: "status", children: "Loading source excerpt…" }) : null,
        m.isError ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
          /* @__PURE__ */ f.jsxs("div", { children: [
            /* @__PURE__ */ f.jsx("strong", { children: "Source unavailable" }),
            /* @__PURE__ */ f.jsx("p", { children: "The excerpt could not be loaded." })
          ] }),
          /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => m.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ f.jsxs("article", { className: "aiw-source-excerpt", children: [
          /* @__PURE__ */ f.jsx("h3", { children: m.data?.label || s.label }),
          /* @__PURE__ */ f.jsx("pre", { children: m.data?.content || s.excerpt || "No excerpt is available for this source reference." })
        ] }),
        /* @__PURE__ */ f.jsx("div", { className: "aiw-dialog-actions", children: /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: r, children: "Done" }) })
      ]
    }
  );
}
const _w = 1, gv = "The running LMS server has not loaded the conversational AI routes. Restart the LMS server, then check again.";
function bv(n) {
  if (!(n instanceof Error)) return !1;
  const i = n;
  return i.status === 404 && /api route not found/i.test(i.message);
}
function On(n, i) {
  return bv(n) ? gv : n instanceof Error ? n.message : i;
}
class Sw extends J.Component {
  state = { error: null };
  static getDerivedStateFromError(i) {
    return { error: i };
  }
  componentDidCatch(i) {
    const s = typeof i?.name == "string" && i.name ? i.name.slice(0, 80) : "RenderError";
    console.error("AI Assistant frontend failed safely.", { name: s });
  }
  render() {
    return this.state.error ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-fatal", role: "alert", children: [
      /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: "AI Assistant unavailable" }),
      /* @__PURE__ */ f.jsx("h1", { children: "The conversational workspace could not start." }),
      /* @__PURE__ */ f.jsx("p", { children: "Your saved conversations and drafts were not changed." }),
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-actions", children: [
        /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => location.reload(), children: "Reload page" }),
        this.props.onFallback ? /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: this.props.onFallback, children: "Open legacy assistant" }) : null
      ] })
    ] }) : this.props.children;
  }
}
function zw(n, i) {
  return {
    ...n,
    ...i,
    questionTypeDistribution: i.questionTypeDistribution ? { ...n.questionTypeDistribution, ...i.questionTypeDistribution } : n.questionTypeDistribution
  };
}
function ww({
  checking: n,
  onCheckAgain: i,
  onFallback: s
}) {
  return /* @__PURE__ */ f.jsxs("main", { className: "aiw-compatibility", role: "alert", children: [
    /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: "Server update required" }),
    /* @__PURE__ */ f.jsx("h1", { children: "The AI workspace and the running LMS server are out of sync." }),
    /* @__PURE__ */ f.jsx("p", { children: gv }),
    /* @__PURE__ */ f.jsx("p", { children: "Your existing LMS, conversations, and drafts have not been changed." }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-inline-actions", children: [
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "aiw-button aiw-button--primary",
          type: "button",
          disabled: n,
          onClick: i,
          children: n ? "Checking…" : "Check again"
        }
      ),
      s ? /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: s, children: "Open existing assistant" }) : null
    ] })
  ] });
}
function xw({
  client: n,
  user: i,
  onToast: s,
  onNavigate: r,
  onFallback: c
}) {
  const m = Mi(), [h, v] = J.useState(null), [y, g] = J.useState(!1), [_, j] = J.useState("chat"), [z, O] = J.useState(!1), [N, B] = J.useState(!1), [X, $] = J.useState(null), [ae, G] = J.useState(null), [P, ie] = J.useState(null), ce = J.useRef(null), H = J.useRef(null), R = J.useCallback((k, ye = "info") => {
    s?.(k, ye);
  }, [s]), le = Cn({
    queryKey: ["ai", "conversations"],
    queryFn: n.listConversations
  }), xe = Cn({
    queryKey: ["ai", "courses"],
    queryFn: n.listCourses,
    retry: 1,
    retryDelay: 100
  }), I = Cn({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  }), te = Cn({
    queryKey: ["ai", "conversation", h],
    queryFn: () => n.getConversation(h),
    enabled: !!h
  });
  J.useEffect(() => {
    h || y || !le.data?.length || v(le.data[0].id);
  }, [le.data, y, h]), J.useEffect(() => {
    G(null), ie(null);
  }, [h]);
  const ue = te.data || null, ze = ue?.plan || ra, we = xe.data || [], M = le.data || [], Y = h ? M.find((k) => k.id === h) || null : y ? null : M[0] || null, V = le.isLoading || xe.isLoading || !!(M.length && !y && (!h || te.isLoading)), Oe = Cn({
    queryKey: ["ai", "materials", ze.courseId],
    queryFn: () => n.listMaterials(ze.courseId),
    enabled: !!ze.courseId
  }).data || [], w = ue?.status || "gathering_requirements", U = J.useCallback(async () => {
    const k = H.current;
    if (k) {
      H.current = null, ce.current && window.clearTimeout(ce.current), ce.current = null;
      try {
        const ye = await n.updatePlan(k.id, k.patch);
        ye.conversation ? m.setQueryData(["ai", "conversation", k.id], ye.conversation) : await m.invalidateQueries({ queryKey: ["ai", "conversation", k.id] }), await m.invalidateQueries({ queryKey: ["ai", "conversations"] });
      } catch (ye) {
        await m.invalidateQueries({ queryKey: ["ai", "conversation", k.id] }), R(On(ye, "Quiz Plan could not be saved."), "error");
      }
    }
  }, [n, m, R]);
  J.useEffect(() => () => {
    ce.current && window.clearTimeout(ce.current), H.current && U();
  }, [U, h]);
  const K = J.useCallback((k) => {
    if (!h) {
      R("Start a conversation before editing the Quiz Plan.", "info");
      return;
    }
    const ye = m.getQueryData(
      ["ai", "conversation", h]
    ), jt = k.courseId === void 0 && ye?.plan.courseId ? { ...k, courseId: ye.plan.courseId } : k;
    m.setQueryData(
      ["ai", "conversation", h],
      (Qt) => Qt && {
        ...Qt,
        plan: zw(Qt.plan, jt),
        suggestedReplies: []
      }
    );
    const qn = H.current;
    H.current = {
      id: h,
      patch: qn?.id === h ? { ...qn.patch, ...jt } : jt
    }, ce.current && window.clearTimeout(ce.current), ce.current = window.setTimeout(() => void U(), 450);
  }, [U, m, h, R]), F = qt({
    mutationFn: async ({
      courseId: k,
      conversationId: ye
    }) => ye ? {
      mode: "updated",
      conversationId: ye,
      result: await n.updatePlan(ye, {
        courseId: k,
        materialIds: []
      })
    } : {
      mode: "created",
      conversation: await n.createConversation({ courseId: k })
    },
    onSuccess: async (k) => {
      k.mode === "created" ? (m.setQueryData(
        ["ai", "conversation", k.conversation.id],
        k.conversation
      ), v(k.conversation.id), g(!1), G(null), ie(null)) : k.result.conversation ? m.setQueryData(
        ["ai", "conversation", k.conversationId],
        k.result.conversation
      ) : await m.invalidateQueries({
        queryKey: ["ai", "conversation", k.conversationId]
      }), await m.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
    onError: (k) => R(On(k, "The course could not be selected."), "error")
  }), oe = qt({
    mutationFn: (k) => n.deleteConversation(k),
    onSuccess: async (k, ye) => {
      const qn = (m.getQueryData(["ai", "conversations"]) || []).filter((Qt) => Qt.id !== ye);
      m.setQueryData(["ai", "conversations"], qn), m.removeQueries({ queryKey: ["ai", "conversation", ye], exact: !0 }), m.removeQueries({ queryKey: ["ai", "generation", ye], exact: !0 }), h === ye && (v(qn[0]?.id || null), g(!qn.length), G(null), ie(null)), await m.invalidateQueries({ queryKey: ["ai", "conversations"] }), R("Conversation deleted.", "success");
    },
    onError: (k) => R(On(k, "The conversation could not be deleted."), "error")
  }), de = qt({
    mutationFn: async (k) => {
      if (!h || !ue)
        throw new Error("Choose a course before starting the conversation.");
      const ye = ue.draft ? await n.reviseDraft(h, k) : await n.sendMessage(h, k);
      return { conversationId: h, currentDetail: ue, result: ye };
    },
    onSuccess: async ({ conversationId: k, currentDetail: ye, result: jt }) => {
      v(k), j("chat"), jt.conversation ? m.setQueryData(["ai", "conversation", k], jt.conversation) : ye && h !== k && m.setQueryData(["ai", "conversation", k], ye), jt.revision && (G(jt.revision), ie(null)), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", k] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: (k) => R(On(k, "The message could not be sent."), "error")
  }), _e = qt({
    mutationFn: (k) => n.generateDraft(h, Iz(), k),
    onSuccess: async (k) => {
      k.conversation && h && (m.setQueryData(["ai", "conversation", h], k.conversation), m.setQueryData(
        ["ai", "generation", h],
        k.conversation.generation || null
      )), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: (k) => R(On(k, "Draft generation failed."), "error")
  }), at = ue?.status === "generating" || ue?.generation?.status === "generating", Ze = Cn({
    queryKey: ["ai", "generation", h],
    queryFn: () => n.getGenerationStatus(h),
    enabled: !!(h && (at || _e.isPending)),
    refetchInterval: (k) => ["queued", "generating", "cancel_requested"].includes(k.state.data?.status || "") ? 1400 : !1
  }), Zt = at || _e.isPending ? Ze.data || ue?.generation || {
    status: "generating",
    stage: "validating_quiz_plan",
    message: "",
    canCancel: !1,
    startedAt: "",
    updatedAt: ""
  } : ue?.generation || null, ha = J.useRef("");
  J.useEffect(() => {
    const k = Ze.data?.status;
    !k || k === ha.current || (ha.current = k, k !== "generating" && h && (Promise.all([
      m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
      m.invalidateQueries({ queryKey: ["ai", "conversations"] })
    ]), k === "completed" && R("Quiz draft is ready for review and available in Quizzes.", "success")));
  }, [Ze.data?.status, m, h, R]);
  const Qa = qt({
    mutationFn: () => n.cancelGeneration(h),
    onSuccess: async () => {
      await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        m.invalidateQueries({ queryKey: ["ai", "generation", h] })
      ]), R("Generation stopped.", "info");
    },
    onError: (k) => R(On(k, "Generation could not be stopped."), "error")
  }), Ri = qt({
    mutationFn: (k) => n.applyRevision(h, k.id),
    onSuccess: async (k) => {
      G(null), ie(null), k.conversation && h && m.setQueryData(["ai", "conversation", h], k.conversation), await m.invalidateQueries({ queryKey: ["ai", "conversation", h] }), R("Revision applied to the draft.", "success");
    },
    onError: (k) => R(On(k, "Revision could not be applied."), "error")
  }), ln = qt({
    mutationFn: (k) => n.saveDraft(h, k),
    onSuccess: async (k) => {
      k.conversation && h && m.setQueryData(["ai", "conversation", h], k.conversation), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    }
  }), qi = async (k, ye = !0) => {
    try {
      return await ln.mutateAsync(k), ye && R("Draft changes saved.", "success"), !0;
    } catch (jt) {
      return R(On(jt, "Draft could not be saved."), "error"), !1;
    }
  }, ka = qt({
    mutationFn: ({ indexes: k, instruction: ye }) => n.regenerateQuestions(h, k, ye),
    onSuccess: async (k) => {
      k.conversation && h && m.setQueryData(["ai", "conversation", h], k.conversation), await m.invalidateQueries({ queryKey: ["ai", "conversation", h] }), R("Selected questions regenerated. Review the changes before saving.", "success");
    },
    onError: (k) => R(On(k, "Questions could not be regenerated."), "error")
  }), Ql = ae || ue?.pendingRevision || null, Ui = Ql?.id === P ? null : Ql, Pt = ze.courseId, Zi = !!(I.data && I.data.conversationApiVersion < _w || bv(le.error)), ma = (k) => {
    const ye = h;
    U().then(() => {
      F.mutate({ courseId: k, conversationId: ye });
    });
  }, ju = () => {
    U(), v(null), g(!0), G(null), ie(null), j("chat"), window.setTimeout(() => document.getElementById("aiw-start-course")?.focus(), 0);
  }, Qi = () => {
    r ? r("#/courses") : location.hash = "#/courses";
  }, ht = () => {
    r ? r("#/quizzes") : location.hash = "#/quizzes";
  }, kl = () => {
    j("chat"), window.setTimeout(() => document.getElementById("aiw-start-course")?.focus(), 0);
  }, Bl = () => {
    if (!Pt) {
      kl(), R("Choose a course before adding material.", "info");
      return;
    }
    B(!0);
  }, Hl = () => {
    if (!Pt) {
      kl(), R("Choose a course before uploading material.", "info");
      return;
    }
    document.getElementById("aiw-material-upload")?.click();
  }, Ba = ue?.draft ? /* @__PURE__ */ f.jsx(
    gw,
    {
      draft: ue.draft,
      draftSaved: ue.status === "draft_saved",
      saving: ln.isPending,
      regenerating: ka.isPending,
      onSave: qi,
      onRegenerate: async (k, ye) => {
        await ka.mutateAsync({ indexes: k, instruction: ye });
      },
      onOpenQuiz: ht,
      onOpenSource: $
    }
  ) : null;
  return Zi ? /* @__PURE__ */ f.jsx(
    ww,
    {
      checking: I.isFetching || le.isFetching,
      onCheckAgain: () => {
        Promise.all([I.refetch(), le.refetch()]);
      },
      onFallback: c
    }
  ) : /* @__PURE__ */ f.jsxs("div", { className: "aiw-app", children: [
    /* @__PURE__ */ f.jsxs("header", { className: "aiw-topbar", children: [
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-topbar__title", children: [
        /* @__PURE__ */ f.jsx("div", { className: "aiw-product-mark", "aria-hidden": "true", children: "AI" }),
        /* @__PURE__ */ f.jsxs("div", { children: [
          /* @__PURE__ */ f.jsx("span", { className: "aiw-eyebrow", children: i.role === "admin" ? "Administrator workspace" : "Teacher workspace" }),
          /* @__PURE__ */ f.jsx("h1", { children: "AI Quiz Assistant" }),
          /* @__PURE__ */ f.jsx("p", { children: "Plan together, generate a private draft, then review every question." })
        ] })
      ] }),
      /* @__PURE__ */ f.jsxs("div", { className: "aiw-topbar__actions", children: [
        /* @__PURE__ */ f.jsxs("span", { className: `aiw-config-status ${I.data?.configured ? "is-ready" : ""}`, children: [
          /* @__PURE__ */ f.jsx("i", { "aria-hidden": "true" }),
          I.data?.configured ? "Azure configured" : "Setup required"
        ] }),
        /* @__PURE__ */ f.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => O(!0), children: "Azure settings" })
      ] })
    ] }),
    !I.data?.enabled && I.data ? /* @__PURE__ */ f.jsxs("div", { className: "aiw-page-alert", role: "alert", children: [
      /* @__PURE__ */ f.jsx("strong", { children: "AI generation is disabled." }),
      /* @__PURE__ */ f.jsx("span", { children: I.data.message || "Contact an administrator to enable the assistant." })
    ] }) : null,
    /* @__PURE__ */ f.jsx("div", { className: "aiw-mobile-tabs", role: "tablist", "aria-label": "AI Assistant workspace panels", children: [
      ["conversations", "Conversations"],
      ["chat", ue?.draft ? "Chat & review" : "Chat"],
      ["plan", "Quiz Plan"]
    ].map(([k, ye]) => /* @__PURE__ */ f.jsx(
      "button",
      {
        id: `aiw-${k}-tab`,
        type: "button",
        role: "tab",
        "aria-selected": _ === k,
        "aria-controls": `aiw-${k}-panel`,
        tabIndex: _ === k ? 0 : -1,
        onClick: () => j(k),
        children: ye
      },
      k
    )) }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-layout", children: [
      /* @__PURE__ */ f.jsx(
        "div",
        {
          id: "aiw-conversations-panel",
          className: `aiw-region aiw-region--left ${_ === "conversations" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-conversations-tab",
          children: /* @__PURE__ */ f.jsx(
            cw,
            {
              conversations: le.data || [],
              selectedId: h,
              isLoading: le.isLoading,
              isError: le.isError,
              isCreating: F.isPending,
              deletingId: oe.isPending ? oe.variables : null,
              onNew: ju,
              onRetry: () => {
                le.refetch();
              },
              onSelect: (k) => {
                U(), v(k), g(!1), G(null), ie(null), j("chat");
              },
              onDelete: (k) => {
                H.current?.id === k && (H.current = null, ce.current && window.clearTimeout(ce.current), ce.current = null), oe.mutate(k);
              },
              materials: /* @__PURE__ */ f.jsx(
                fw,
                {
                  client: n,
                  conversationId: h,
                  plan: ze,
                  courseId: Pt,
                  courses: we,
                  coursesLoading: xe.isLoading,
                  coursesError: xe.isError,
                  courseSelectionPending: F.isPending,
                  onPlanPatch: K,
                  onCourseSelect: ma,
                  onRetryCourses: () => {
                    xe.refetch();
                  },
                  onOpenCourses: Qi,
                  onToast: R
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ f.jsx(
        "div",
        {
          id: "aiw-chat-panel",
          className: `aiw-region aiw-region--center ${_ === "chat" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-chat-tab",
          children: /* @__PURE__ */ f.jsx(
            ow,
            {
              detail: ue,
              plan: ze,
              courses: we,
              materials: Oe,
              coursesLoading: xe.isLoading,
              coursesError: xe.isError,
              courseSelectionPending: F.isPending,
              loading: V,
              error: te.isError,
              isSending: de.isPending,
              generation: Zt,
              cancelling: Qa.isPending,
              revision: Ui,
              applyingRevision: Ri.isPending,
              onRetryLoad: () => te.refetch(),
              onRetryCourses: () => {
                xe.refetch();
              },
              onOpenCourses: Qi,
              onCourseSelect: ma,
              onSend: (k) => {
                if (!ue?.draft && vv(ze) && Fz(k)) {
                  _e.mutate(void 0);
                  return;
                }
                de.mutate(k);
              },
              onRetryMessage: (k) => de.mutate(k.content),
              onAttach: Hl,
              onPasteMaterial: Bl,
              onCancelGeneration: () => Qa.mutate(),
              onApplyRevision: (k) => Ri.mutate(k),
              onDismissRevision: () => {
                ie(Ui?.id || null), G(null);
              },
              review: Ba
            }
          )
        }
      ),
      /* @__PURE__ */ f.jsx(
        "div",
        {
          id: "aiw-plan-panel",
          className: `aiw-region aiw-region--right ${_ === "plan" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-plan-tab",
          children: /* @__PURE__ */ f.jsx(
            hw,
            {
              plan: ze,
              courses: we,
              coursesLoading: xe.isLoading,
              coursesError: xe.isError,
              courseSelectionPending: F.isPending || V,
              courseLocked: !!(ue?.draft || Y?.draftId),
              conversationId: h,
              conversationStatus: w,
              generation: Zt,
              generating: !!(Zt && ["queued", "generating", "cancel_requested"].includes(Zt.status)),
              generationAvailable: !!(I.data?.enabled && I.data?.configured),
              generationConfigured: !!I.data?.configured,
              onCourseSelect: ma,
              onRetryCourses: () => {
                xe.refetch();
              },
              onOpenCourses: Qi,
              onPatch: K,
              onGenerate: (k) => _e.mutate(k)
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ f.jsxs("div", { className: "aiw-sr-only", "aria-live": "polite", "aria-atomic": "true", children: [
      de.isPending ? "The assistant is responding." : "",
      Zt?.status === "generating" ? `Generation stage: ${Zt.stage}.` : ""
    ] }),
    z ? /* @__PURE__ */ f.jsx(Yz, { client: n, onClose: () => O(!1), onToast: R }) : null,
    N && Pt ? /* @__PURE__ */ f.jsx(
      dw,
      {
        client: n,
        courseId: Pt,
        conversationId: h,
        onClose: () => B(!1),
        onToast: R
      }
    ) : null,
    X && Pt ? /* @__PURE__ */ f.jsx(
      bw,
      {
        client: n,
        courseId: Pt,
        source: X,
        onClose: () => $(null)
      }
    ) : null
  ] });
}
function jw({
  api: n,
  user: i,
  onToast: s,
  onNavigate: r,
  onFallback: c
}) {
  const [m] = J.useState(() => new yb({
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
  })), h = J.useMemo(() => Lz(n), [n]);
  return /* @__PURE__ */ f.jsx(Sw, { onFallback: c, children: /* @__PURE__ */ f.jsx(gb, { client: m, children: /* @__PURE__ */ f.jsx(
    xw,
    {
      client: h,
      user: i,
      onToast: s,
      onNavigate: r,
      onFallback: c
    }
  ) }) });
}
function Ew(n, i) {
  const s = n.closest("#app");
  s?.classList.add("ai-assistant-page-host"), n.classList.add("ai-assistant-root");
  let r = Yg.createRoot(n);
  return r.render(
    /* @__PURE__ */ f.jsx(
      jw,
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
      r?.unmount(), r = null, s?.classList.remove("ai-assistant-page-host"), n.classList.remove("ai-assistant-root");
    }
  };
}
export {
  jw as AiAssistantApp,
  Ew as mountAiAssistant
};
//# sourceMappingURL=ai-assistant.js.map
