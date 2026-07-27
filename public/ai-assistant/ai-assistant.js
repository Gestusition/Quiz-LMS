var Do = { exports: {} }, El = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Sm;
function qg() {
  if (Sm) return El;
  Sm = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.fragment");
  function s(r, c, m) {
    var d = null;
    if (m !== void 0 && (d = "" + m), c.key !== void 0 && (d = "" + c.key), "key" in c) {
      m = {};
      for (var v in c)
        v !== "key" && (m[v] = c[v]);
    } else m = c;
    return c = m.ref, {
      $$typeof: n,
      type: r,
      key: d,
      ref: c !== void 0 ? c : null,
      props: m
    };
  }
  return El.Fragment = i, El.jsx = s, El.jsxs = s, El;
}
var zm;
function Ug() {
  return zm || (zm = 1, Do.exports = qg()), Do.exports;
}
var h = Ug(), Ro = { exports: {} }, Tl = {}, qo = { exports: {} }, Uo = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var wm;
function Zg() {
  return wm || (wm = 1, (function(n) {
    function i(C, X) {
      var le = C.length;
      C.push(X);
      e: for (; 0 < le; ) {
        var me = le - 1 >>> 1, xe = C[me];
        if (0 < c(xe, X))
          C[me] = X, C[le] = xe, le = me;
        else break e;
      }
    }
    function s(C) {
      return C.length === 0 ? null : C[0];
    }
    function r(C) {
      if (C.length === 0) return null;
      var X = C[0], le = C.pop();
      if (le !== X) {
        C[0] = le;
        e: for (var me = 0, xe = C.length, z = xe >>> 1; me < z; ) {
          var U = 2 * (me + 1) - 1, V = C[U], J = U + 1, ue = C[J];
          if (0 > c(V, le))
            J < xe && 0 > c(ue, V) ? (C[me] = ue, C[J] = le, me = J) : (C[me] = V, C[U] = le, me = U);
          else if (J < xe && 0 > c(ue, le))
            C[me] = ue, C[J] = le, me = J;
          else break e;
        }
      }
      return X;
    }
    function c(C, X) {
      var le = C.sortIndex - X.sortIndex;
      return le !== 0 ? le : C.id - X.id;
    }
    if (n.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var m = performance;
      n.unstable_now = function() {
        return m.now();
      };
    } else {
      var d = Date, v = d.now();
      n.unstable_now = function() {
        return d.now() - v;
      };
    }
    var g = [], y = [], _ = 1, j = null, w = 3, O = !1, M = !1, H = !1, W = !1, $ = typeof setTimeout == "function" ? setTimeout : null, ne = typeof clearTimeout == "function" ? clearTimeout : null, ee = typeof setImmediate < "u" ? setImmediate : null;
    function G(C) {
      for (var X = s(y); X !== null; ) {
        if (X.callback === null) r(y);
        else if (X.startTime <= C)
          r(y), X.sortIndex = X.expirationTime, i(g, X);
        else break;
        X = s(y);
      }
    }
    function K(C) {
      if (H = !1, G(C), !M)
        if (s(g) !== null)
          M = !0, B || (B = !0, Re());
        else {
          var X = s(y);
          X !== null && nt(K, X.startTime - C);
        }
    }
    var B = !1, Y = -1, Z = 5, se = -1;
    function ze() {
      return W ? !0 : !(n.unstable_now() - se < Z);
    }
    function we() {
      if (W = !1, B) {
        var C = n.unstable_now();
        se = C;
        var X = !0;
        try {
          e: {
            M = !1, H && (H = !1, ne(Y), Y = -1), O = !0;
            var le = w;
            try {
              t: {
                for (G(C), j = s(g); j !== null && !(j.expirationTime > C && ze()); ) {
                  var me = j.callback;
                  if (typeof me == "function") {
                    j.callback = null, w = j.priorityLevel;
                    var xe = me(
                      j.expirationTime <= C
                    );
                    if (C = n.unstable_now(), typeof xe == "function") {
                      j.callback = xe, G(C), X = !0;
                      break t;
                    }
                    j === s(g) && r(g), G(C);
                  } else r(g);
                  j = s(g);
                }
                if (j !== null) X = !0;
                else {
                  var z = s(y);
                  z !== null && nt(
                    K,
                    z.startTime - C
                  ), X = !1;
                }
              }
              break e;
            } finally {
              j = null, w = le, O = !1;
            }
            X = void 0;
          }
        } finally {
          X ? Re() : B = !1;
        }
      }
    }
    var Re;
    if (typeof ee == "function")
      Re = function() {
        ee(we);
      };
    else if (typeof MessageChannel < "u") {
      var je = new MessageChannel(), Xe = je.port2;
      je.port1.onmessage = we, Re = function() {
        Xe.postMessage(null);
      };
    } else
      Re = function() {
        $(we, 0);
      };
    function nt(C, X) {
      Y = $(function() {
        C(n.unstable_now());
      }, X);
    }
    n.unstable_IdlePriority = 5, n.unstable_ImmediatePriority = 1, n.unstable_LowPriority = 4, n.unstable_NormalPriority = 3, n.unstable_Profiling = null, n.unstable_UserBlockingPriority = 2, n.unstable_cancelCallback = function(C) {
      C.callback = null;
    }, n.unstable_forceFrameRate = function(C) {
      0 > C || 125 < C ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : Z = 0 < C ? Math.floor(1e3 / C) : 5;
    }, n.unstable_getCurrentPriorityLevel = function() {
      return w;
    }, n.unstable_next = function(C) {
      switch (w) {
        case 1:
        case 2:
        case 3:
          var X = 3;
          break;
        default:
          X = w;
      }
      var le = w;
      w = X;
      try {
        return C();
      } finally {
        w = le;
      }
    }, n.unstable_requestPaint = function() {
      W = !0;
    }, n.unstable_runWithPriority = function(C, X) {
      switch (C) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          C = 3;
      }
      var le = w;
      w = C;
      try {
        return X();
      } finally {
        w = le;
      }
    }, n.unstable_scheduleCallback = function(C, X, le) {
      var me = n.unstable_now();
      switch (typeof le == "object" && le !== null ? (le = le.delay, le = typeof le == "number" && 0 < le ? me + le : me) : le = me, C) {
        case 1:
          var xe = -1;
          break;
        case 2:
          xe = 250;
          break;
        case 5:
          xe = 1073741823;
          break;
        case 4:
          xe = 1e4;
          break;
        default:
          xe = 5e3;
      }
      return xe = le + xe, C = {
        id: _++,
        callback: X,
        priorityLevel: C,
        startTime: le,
        expirationTime: xe,
        sortIndex: -1
      }, le > me ? (C.sortIndex = le, i(y, C), s(g) === null && C === s(y) && (H ? (ne(Y), Y = -1) : H = !0, nt(K, le - me))) : (C.sortIndex = xe, i(g, C), M || O || (M = !0, B || (B = !0, Re()))), C;
    }, n.unstable_shouldYield = ze, n.unstable_wrapCallback = function(C) {
      var X = w;
      return function() {
        var le = w;
        w = X;
        try {
          return C.apply(this, arguments);
        } finally {
          w = le;
        }
      };
    };
  })(Uo)), Uo;
}
var jm;
function Qg() {
  return jm || (jm = 1, qo.exports = Zg()), qo.exports;
}
var Zo = { exports: {} }, oe = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var xm;
function Hg() {
  if (xm) return oe;
  xm = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.portal"), s = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), c = Symbol.for("react.profiler"), m = Symbol.for("react.consumer"), d = Symbol.for("react.context"), v = Symbol.for("react.forward_ref"), g = Symbol.for("react.suspense"), y = Symbol.for("react.memo"), _ = Symbol.for("react.lazy"), j = Symbol.for("react.activity"), w = Symbol.iterator;
  function O(z) {
    return z === null || typeof z != "object" ? null : (z = w && z[w] || z["@@iterator"], typeof z == "function" ? z : null);
  }
  var M = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, H = Object.assign, W = {};
  function $(z, U, V) {
    this.props = z, this.context = U, this.refs = W, this.updater = V || M;
  }
  $.prototype.isReactComponent = {}, $.prototype.setState = function(z, U) {
    if (typeof z != "object" && typeof z != "function" && z != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, z, U, "setState");
  }, $.prototype.forceUpdate = function(z) {
    this.updater.enqueueForceUpdate(this, z, "forceUpdate");
  };
  function ne() {
  }
  ne.prototype = $.prototype;
  function ee(z, U, V) {
    this.props = z, this.context = U, this.refs = W, this.updater = V || M;
  }
  var G = ee.prototype = new ne();
  G.constructor = ee, H(G, $.prototype), G.isPureReactComponent = !0;
  var K = Array.isArray;
  function B() {
  }
  var Y = { H: null, A: null, T: null, S: null }, Z = Object.prototype.hasOwnProperty;
  function se(z, U, V) {
    var J = V.ref;
    return {
      $$typeof: n,
      type: z,
      key: U,
      ref: J !== void 0 ? J : null,
      props: V
    };
  }
  function ze(z, U) {
    return se(z.type, U, z.props);
  }
  function we(z) {
    return typeof z == "object" && z !== null && z.$$typeof === n;
  }
  function Re(z) {
    var U = { "=": "=0", ":": "=2" };
    return "$" + z.replace(/[=:]/g, function(V) {
      return U[V];
    });
  }
  var je = /\/+/g;
  function Xe(z, U) {
    return typeof z == "object" && z !== null && z.key != null ? Re("" + z.key) : U.toString(36);
  }
  function nt(z) {
    switch (z.status) {
      case "fulfilled":
        return z.value;
      case "rejected":
        throw z.reason;
      default:
        switch (typeof z.status == "string" ? z.then(B, B) : (z.status = "pending", z.then(
          function(U) {
            z.status === "pending" && (z.status = "fulfilled", z.value = U);
          },
          function(U) {
            z.status === "pending" && (z.status = "rejected", z.reason = U);
          }
        )), z.status) {
          case "fulfilled":
            return z.value;
          case "rejected":
            throw z.reason;
        }
    }
    throw z;
  }
  function C(z, U, V, J, ue) {
    var re = typeof z;
    (re === "undefined" || re === "boolean") && (z = null);
    var ge = !1;
    if (z === null) ge = !0;
    else
      switch (re) {
        case "bigint":
        case "string":
        case "number":
          ge = !0;
          break;
        case "object":
          switch (z.$$typeof) {
            case n:
            case i:
              ge = !0;
              break;
            case _:
              return ge = z._init, C(
                ge(z._payload),
                U,
                V,
                J,
                ue
              );
          }
      }
    if (ge)
      return ue = ue(z), ge = J === "" ? "." + Xe(z, 0) : J, K(ue) ? (V = "", ge != null && (V = ge.replace(je, "$&/") + "/"), C(ue, U, V, "", function(Nn) {
        return Nn;
      })) : ue != null && (we(ue) && (ue = ze(
        ue,
        V + (ue.key == null || z && z.key === ue.key ? "" : ("" + ue.key).replace(
          je,
          "$&/"
        ) + "/") + ge
      )), U.push(ue)), 1;
    ge = 0;
    var at = J === "" ? "." : J + ":";
    if (K(z))
      for (var Ze = 0; Ze < z.length; Ze++)
        J = z[Ze], re = at + Xe(J, Ze), ge += C(
          J,
          U,
          V,
          re,
          ue
        );
    else if (Ze = O(z), typeof Ze == "function")
      for (z = Ze.call(z), Ze = 0; !(J = z.next()).done; )
        J = J.value, re = at + Xe(J, Ze++), ge += C(
          J,
          U,
          V,
          re,
          ue
        );
    else if (re === "object") {
      if (typeof z.then == "function")
        return C(
          nt(z),
          U,
          V,
          J,
          ue
        );
      throw U = String(z), Error(
        "Objects are not valid as a React child (found: " + (U === "[object Object]" ? "object with keys {" + Object.keys(z).join(", ") + "}" : U) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return ge;
  }
  function X(z, U, V) {
    if (z == null) return z;
    var J = [], ue = 0;
    return C(z, J, "", "", function(re) {
      return U.call(V, re, ue++);
    }), J;
  }
  function le(z) {
    if (z._status === -1) {
      var U = z._result;
      U = U(), U.then(
        function(V) {
          (z._status === 0 || z._status === -1) && (z._status = 1, z._result = V);
        },
        function(V) {
          (z._status === 0 || z._status === -1) && (z._status = 2, z._result = V);
        }
      ), z._status === -1 && (z._status = 0, z._result = U);
    }
    if (z._status === 1) return z._result.default;
    throw z._result;
  }
  var me = typeof reportError == "function" ? reportError : function(z) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var U = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof z == "object" && z !== null && typeof z.message == "string" ? String(z.message) : String(z),
        error: z
      });
      if (!window.dispatchEvent(U)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", z);
      return;
    }
    console.error(z);
  }, xe = {
    map: X,
    forEach: function(z, U, V) {
      X(
        z,
        function() {
          U.apply(this, arguments);
        },
        V
      );
    },
    count: function(z) {
      var U = 0;
      return X(z, function() {
        U++;
      }), U;
    },
    toArray: function(z) {
      return X(z, function(U) {
        return U;
      }) || [];
    },
    only: function(z) {
      if (!we(z))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return z;
    }
  };
  return oe.Activity = j, oe.Children = xe, oe.Component = $, oe.Fragment = s, oe.Profiler = c, oe.PureComponent = ee, oe.StrictMode = r, oe.Suspense = g, oe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Y, oe.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(z) {
      return Y.H.useMemoCache(z);
    }
  }, oe.cache = function(z) {
    return function() {
      return z.apply(null, arguments);
    };
  }, oe.cacheSignal = function() {
    return null;
  }, oe.cloneElement = function(z, U, V) {
    if (z == null)
      throw Error(
        "The argument must be a React element, but you passed " + z + "."
      );
    var J = H({}, z.props), ue = z.key;
    if (U != null)
      for (re in U.key !== void 0 && (ue = "" + U.key), U)
        !Z.call(U, re) || re === "key" || re === "__self" || re === "__source" || re === "ref" && U.ref === void 0 || (J[re] = U[re]);
    var re = arguments.length - 2;
    if (re === 1) J.children = V;
    else if (1 < re) {
      for (var ge = Array(re), at = 0; at < re; at++)
        ge[at] = arguments[at + 2];
      J.children = ge;
    }
    return se(z.type, ue, J);
  }, oe.createContext = function(z) {
    return z = {
      $$typeof: d,
      _currentValue: z,
      _currentValue2: z,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, z.Provider = z, z.Consumer = {
      $$typeof: m,
      _context: z
    }, z;
  }, oe.createElement = function(z, U, V) {
    var J, ue = {}, re = null;
    if (U != null)
      for (J in U.key !== void 0 && (re = "" + U.key), U)
        Z.call(U, J) && J !== "key" && J !== "__self" && J !== "__source" && (ue[J] = U[J]);
    var ge = arguments.length - 2;
    if (ge === 1) ue.children = V;
    else if (1 < ge) {
      for (var at = Array(ge), Ze = 0; Ze < ge; Ze++)
        at[Ze] = arguments[Ze + 2];
      ue.children = at;
    }
    if (z && z.defaultProps)
      for (J in ge = z.defaultProps, ge)
        ue[J] === void 0 && (ue[J] = ge[J]);
    return se(z, re, ue);
  }, oe.createRef = function() {
    return { current: null };
  }, oe.forwardRef = function(z) {
    return { $$typeof: v, render: z };
  }, oe.isValidElement = we, oe.lazy = function(z) {
    return {
      $$typeof: _,
      _payload: { _status: -1, _result: z },
      _init: le
    };
  }, oe.memo = function(z, U) {
    return {
      $$typeof: y,
      type: z,
      compare: U === void 0 ? null : U
    };
  }, oe.startTransition = function(z) {
    var U = Y.T, V = {};
    Y.T = V;
    try {
      var J = z(), ue = Y.S;
      ue !== null && ue(V, J), typeof J == "object" && J !== null && typeof J.then == "function" && J.then(B, me);
    } catch (re) {
      me(re);
    } finally {
      U !== null && V.types !== null && (U.types = V.types), Y.T = U;
    }
  }, oe.unstable_useCacheRefresh = function() {
    return Y.H.useCacheRefresh();
  }, oe.use = function(z) {
    return Y.H.use(z);
  }, oe.useActionState = function(z, U, V) {
    return Y.H.useActionState(z, U, V);
  }, oe.useCallback = function(z, U) {
    return Y.H.useCallback(z, U);
  }, oe.useContext = function(z) {
    return Y.H.useContext(z);
  }, oe.useDebugValue = function() {
  }, oe.useDeferredValue = function(z, U) {
    return Y.H.useDeferredValue(z, U);
  }, oe.useEffect = function(z, U) {
    return Y.H.useEffect(z, U);
  }, oe.useEffectEvent = function(z) {
    return Y.H.useEffectEvent(z);
  }, oe.useId = function() {
    return Y.H.useId();
  }, oe.useImperativeHandle = function(z, U, V) {
    return Y.H.useImperativeHandle(z, U, V);
  }, oe.useInsertionEffect = function(z, U) {
    return Y.H.useInsertionEffect(z, U);
  }, oe.useLayoutEffect = function(z, U) {
    return Y.H.useLayoutEffect(z, U);
  }, oe.useMemo = function(z, U) {
    return Y.H.useMemo(z, U);
  }, oe.useOptimistic = function(z, U) {
    return Y.H.useOptimistic(z, U);
  }, oe.useReducer = function(z, U, V) {
    return Y.H.useReducer(z, U, V);
  }, oe.useRef = function(z) {
    return Y.H.useRef(z);
  }, oe.useState = function(z) {
    return Y.H.useState(z);
  }, oe.useSyncExternalStore = function(z, U, V) {
    return Y.H.useSyncExternalStore(
      z,
      U,
      V
    );
  }, oe.useTransition = function() {
    return Y.H.useTransition();
  }, oe.version = "19.2.7", oe;
}
var Em;
function ac() {
  return Em || (Em = 1, Zo.exports = Hg()), Zo.exports;
}
var Qo = { exports: {} }, dt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Tm;
function kg() {
  if (Tm) return dt;
  Tm = 1;
  var n = ac();
  function i(g) {
    var y = "https://react.dev/errors/" + g;
    if (1 < arguments.length) {
      y += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var _ = 2; _ < arguments.length; _++)
        y += "&args[]=" + encodeURIComponent(arguments[_]);
    }
    return "Minified React error #" + g + "; visit " + y + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
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
  function m(g, y, _) {
    var j = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: c,
      key: j == null ? null : "" + j,
      children: g,
      containerInfo: y,
      implementation: _
    };
  }
  var d = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function v(g, y) {
    if (g === "font") return "";
    if (typeof y == "string")
      return y === "use-credentials" ? y : "";
  }
  return dt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r, dt.createPortal = function(g, y) {
    var _ = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!y || y.nodeType !== 1 && y.nodeType !== 9 && y.nodeType !== 11)
      throw Error(i(299));
    return m(g, y, null, _);
  }, dt.flushSync = function(g) {
    var y = d.T, _ = r.p;
    try {
      if (d.T = null, r.p = 2, g) return g();
    } finally {
      d.T = y, r.p = _, r.d.f();
    }
  }, dt.preconnect = function(g, y) {
    typeof g == "string" && (y ? (y = y.crossOrigin, y = typeof y == "string" ? y === "use-credentials" ? y : "" : void 0) : y = null, r.d.C(g, y));
  }, dt.prefetchDNS = function(g) {
    typeof g == "string" && r.d.D(g);
  }, dt.preinit = function(g, y) {
    if (typeof g == "string" && y && typeof y.as == "string") {
      var _ = y.as, j = v(_, y.crossOrigin), w = typeof y.integrity == "string" ? y.integrity : void 0, O = typeof y.fetchPriority == "string" ? y.fetchPriority : void 0;
      _ === "style" ? r.d.S(
        g,
        typeof y.precedence == "string" ? y.precedence : void 0,
        {
          crossOrigin: j,
          integrity: w,
          fetchPriority: O
        }
      ) : _ === "script" && r.d.X(g, {
        crossOrigin: j,
        integrity: w,
        fetchPriority: O,
        nonce: typeof y.nonce == "string" ? y.nonce : void 0
      });
    }
  }, dt.preinitModule = function(g, y) {
    if (typeof g == "string")
      if (typeof y == "object" && y !== null) {
        if (y.as == null || y.as === "script") {
          var _ = v(
            y.as,
            y.crossOrigin
          );
          r.d.M(g, {
            crossOrigin: _,
            integrity: typeof y.integrity == "string" ? y.integrity : void 0,
            nonce: typeof y.nonce == "string" ? y.nonce : void 0
          });
        }
      } else y == null && r.d.M(g);
  }, dt.preload = function(g, y) {
    if (typeof g == "string" && typeof y == "object" && y !== null && typeof y.as == "string") {
      var _ = y.as, j = v(_, y.crossOrigin);
      r.d.L(g, _, {
        crossOrigin: j,
        integrity: typeof y.integrity == "string" ? y.integrity : void 0,
        nonce: typeof y.nonce == "string" ? y.nonce : void 0,
        type: typeof y.type == "string" ? y.type : void 0,
        fetchPriority: typeof y.fetchPriority == "string" ? y.fetchPriority : void 0,
        referrerPolicy: typeof y.referrerPolicy == "string" ? y.referrerPolicy : void 0,
        imageSrcSet: typeof y.imageSrcSet == "string" ? y.imageSrcSet : void 0,
        imageSizes: typeof y.imageSizes == "string" ? y.imageSizes : void 0,
        media: typeof y.media == "string" ? y.media : void 0
      });
    }
  }, dt.preloadModule = function(g, y) {
    if (typeof g == "string")
      if (y) {
        var _ = v(y.as, y.crossOrigin);
        r.d.m(g, {
          as: typeof y.as == "string" && y.as !== "script" ? y.as : void 0,
          crossOrigin: _,
          integrity: typeof y.integrity == "string" ? y.integrity : void 0
        });
      } else r.d.m(g);
  }, dt.requestFormReset = function(g) {
    r.d.r(g);
  }, dt.unstable_batchedUpdates = function(g, y) {
    return g(y);
  }, dt.useFormState = function(g, y, _) {
    return d.H.useFormState(g, y, _);
  }, dt.useFormStatus = function() {
    return d.H.useHostTransitionStatus();
  }, dt.version = "19.2.7", dt;
}
var Am;
function Bg() {
  if (Am) return Qo.exports;
  Am = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Qo.exports = kg(), Qo.exports;
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
var Om;
function $g() {
  if (Om) return Tl;
  Om = 1;
  var n = Qg(), i = ac(), s = Bg();
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
  function g(e) {
    if (m(e) !== e)
      throw Error(r(188));
  }
  function y(e) {
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
          if (o === a) return g(u), e;
          if (o === l) return g(u), t;
          o = o.sibling;
        }
        throw Error(r(188));
      }
      if (a.return !== l.return) a = u, l = o;
      else {
        for (var f = !1, p = u.child; p; ) {
          if (p === a) {
            f = !0, a = u, l = o;
            break;
          }
          if (p === l) {
            f = !0, l = u, a = o;
            break;
          }
          p = p.sibling;
        }
        if (!f) {
          for (p = o.child; p; ) {
            if (p === a) {
              f = !0, a = o, l = u;
              break;
            }
            if (p === l) {
              f = !0, l = o, a = u;
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
  var j = Object.assign, w = Symbol.for("react.element"), O = Symbol.for("react.transitional.element"), M = Symbol.for("react.portal"), H = Symbol.for("react.fragment"), W = Symbol.for("react.strict_mode"), $ = Symbol.for("react.profiler"), ne = Symbol.for("react.consumer"), ee = Symbol.for("react.context"), G = Symbol.for("react.forward_ref"), K = Symbol.for("react.suspense"), B = Symbol.for("react.suspense_list"), Y = Symbol.for("react.memo"), Z = Symbol.for("react.lazy"), se = Symbol.for("react.activity"), ze = Symbol.for("react.memo_cache_sentinel"), we = Symbol.iterator;
  function Re(e) {
    return e === null || typeof e != "object" ? null : (e = we && e[we] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var je = Symbol.for("react.client.reference");
  function Xe(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === je ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case H:
        return "Fragment";
      case $:
        return "Profiler";
      case W:
        return "StrictMode";
      case K:
        return "Suspense";
      case B:
        return "SuspenseList";
      case se:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case M:
          return "Portal";
        case ee:
          return e.displayName || "Context";
        case ne:
          return (e._context.displayName || "Context") + ".Consumer";
        case G:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case Y:
          return t = e.displayName || null, t !== null ? t : Xe(e.type) || "Memo";
        case Z:
          t = e._payload, e = e._init;
          try {
            return Xe(e(t));
          } catch {
          }
      }
    return null;
  }
  var nt = Array.isArray, C = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, X = s.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, le = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, me = [], xe = -1;
  function z(e) {
    return { current: e };
  }
  function U(e) {
    0 > xe || (e.current = me[xe], me[xe] = null, xe--);
  }
  function V(e, t) {
    xe++, me[xe] = e.current, e.current = t;
  }
  var J = z(null), ue = z(null), re = z(null), ge = z(null);
  function at(e, t) {
    switch (V(re, t), V(ue, e), V(J, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Gh(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Gh(t), e = Yh(t, e);
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
    U(J), V(J, e);
  }
  function Ze() {
    U(J), U(ue), U(re);
  }
  function Nn(e) {
    e.memoizedState !== null && V(ge, e);
    var t = J.current, a = Yh(t, e.type);
    t !== a && (V(ue, e), V(J, a));
  }
  function Ra(e) {
    ue.current === e && (U(J), U(ue)), ge.current === e && (U(ge), zl._currentValue = le);
  }
  var qa, Ni;
  function tn(e) {
    if (qa === void 0)
      try {
        throw Error();
      } catch (a) {
        var t = a.stack.trim().match(/\n( *(at )?)/);
        qa = t && t[1] || "", Ni = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + qa + e + Ni;
  }
  var Ft = !1;
  function Mi(e, t) {
    if (!e || Ft) return "";
    Ft = !0;
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
                } catch (N) {
                  var A = N;
                }
                Reflect.construct(e, [], Q);
              } else {
                try {
                  Q.call();
                } catch (N) {
                  A = N;
                }
                e.call(Q.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (N) {
                A = N;
              }
              (Q = e()) && typeof Q.catch == "function" && Q.catch(function() {
              });
            }
          } catch (N) {
            if (N && A && typeof N.stack == "string")
              return [N.stack, A.stack];
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
      var o = l.DetermineComponentFrameRoot(), f = o[0], p = o[1];
      if (f && p) {
        var b = f.split(`
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
      Ft = !1, Error.prepareStackTrace = a;
    }
    return (a = e ? e.displayName || e.name : "") ? tn(a) : "";
  }
  function Di(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return tn(e.type);
      case 16:
        return tn("Lazy");
      case 13:
        return e.child !== t && t !== null ? tn("Suspense Fallback") : tn("Suspense");
      case 19:
        return tn("SuspenseList");
      case 0:
      case 15:
        return Mi(e.type, !1);
      case 11:
        return Mi(e.type.render, !1);
      case 1:
        return Mi(e.type, !0);
      case 31:
        return tn("Activity");
      default:
        return "";
    }
  }
  function Dl(e) {
    try {
      var t = "", a = null;
      do
        t += Di(e, a), a = e, e = e.return;
      while (e);
      return t;
    } catch (l) {
      return `
Error generating stack: ` + l.message + `
` + l.stack;
    }
  }
  var oa = Object.prototype.hasOwnProperty, Ua = n.unstable_scheduleCallback, Za = n.unstable_cancelCallback, gu = n.unstable_shouldYield, bu = n.unstable_requestPaint, k = n.unstable_now, Ee = n.unstable_getCurrentPriorityLevel, vt = n.unstable_ImmediatePriority, zc = n.unstable_UserBlockingPriority, Rl = n.unstable_NormalPriority, vv = n.unstable_LowPriority, wc = n.unstable_IdlePriority, yv = n.log, gv = n.unstable_setDisableYieldValue, Ri = null, xt = null;
  function Mn(e) {
    if (typeof yv == "function" && gv(e), xt && typeof xt.setStrictMode == "function")
      try {
        xt.setStrictMode(Ri, e);
      } catch {
      }
  }
  var Et = Math.clz32 ? Math.clz32 : Sv, bv = Math.log, _v = Math.LN2;
  function Sv(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (bv(e) / _v | 0) | 0;
  }
  var ql = 256, Ul = 262144, Zl = 4194304;
  function ca(e) {
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
  function Ql(e, t, a) {
    var l = e.pendingLanes;
    if (l === 0) return 0;
    var u = 0, o = e.suspendedLanes, f = e.pingedLanes;
    e = e.warmLanes;
    var p = l & 134217727;
    return p !== 0 ? (l = p & ~o, l !== 0 ? u = ca(l) : (f &= p, f !== 0 ? u = ca(f) : a || (a = p & ~e, a !== 0 && (u = ca(a))))) : (p = l & ~o, p !== 0 ? u = ca(p) : f !== 0 ? u = ca(f) : a || (a = l & ~e, a !== 0 && (u = ca(a)))), u === 0 ? 0 : t !== 0 && t !== u && (t & o) === 0 && (o = u & -u, a = t & -t, o >= a || o === 32 && (a & 4194048) !== 0) ? t : u;
  }
  function qi(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function zv(e, t) {
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
  function jc() {
    var e = Zl;
    return Zl <<= 1, (Zl & 62914560) === 0 && (Zl = 4194304), e;
  }
  function _u(e) {
    for (var t = [], a = 0; 31 > a; a++) t.push(e);
    return t;
  }
  function Ui(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function wv(e, t, a, l, u, o) {
    var f = e.pendingLanes;
    e.pendingLanes = a, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= a, e.entangledLanes &= a, e.errorRecoveryDisabledLanes &= a, e.shellSuspendCounter = 0;
    var p = e.entanglements, b = e.expirationTimes, T = e.hiddenUpdates;
    for (a = f & ~a; 0 < a; ) {
      var D = 31 - Et(a), Q = 1 << D;
      p[D] = 0, b[D] = -1;
      var A = T[D];
      if (A !== null)
        for (T[D] = null, D = 0; D < A.length; D++) {
          var N = A[D];
          N !== null && (N.lane &= -536870913);
        }
      a &= ~Q;
    }
    l !== 0 && xc(e, l, 0), o !== 0 && u === 0 && e.tag !== 0 && (e.suspendedLanes |= o & ~(f & ~t));
  }
  function xc(e, t, a) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var l = 31 - Et(t);
    e.entangledLanes |= t, e.entanglements[l] = e.entanglements[l] | 1073741824 | a & 261930;
  }
  function Ec(e, t) {
    var a = e.entangledLanes |= t;
    for (e = e.entanglements; a; ) {
      var l = 31 - Et(a), u = 1 << l;
      u & t | e[l] & t && (e[l] |= t), a &= ~u;
    }
  }
  function Tc(e, t) {
    var a = t & -t;
    return a = (a & 42) !== 0 ? 1 : Su(a), (a & (e.suspendedLanes | t)) !== 0 ? 0 : a;
  }
  function Su(e) {
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
  function zu(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Ac() {
    var e = X.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : mm(e.type));
  }
  function Oc(e, t) {
    var a = X.p;
    try {
      return X.p = e, t();
    } finally {
      X.p = a;
    }
  }
  var Dn = Math.random().toString(36).slice(2), st = "__reactFiber$" + Dn, yt = "__reactProps$" + Dn, Qa = "__reactContainer$" + Dn, wu = "__reactEvents$" + Dn, jv = "__reactListeners$" + Dn, xv = "__reactHandles$" + Dn, Cc = "__reactResources$" + Dn, Zi = "__reactMarker$" + Dn;
  function ju(e) {
    delete e[st], delete e[yt], delete e[wu], delete e[jv], delete e[xv];
  }
  function Ha(e) {
    var t = e[st];
    if (t) return t;
    for (var a = e.parentNode; a; ) {
      if (t = a[Qa] || a[st]) {
        if (a = t.alternate, t.child !== null || a !== null && a.child !== null)
          for (e = Wh(e); e !== null; ) {
            if (a = e[st]) return a;
            e = Wh(e);
          }
        return t;
      }
      e = a, a = e.parentNode;
    }
    return null;
  }
  function ka(e) {
    if (e = e[st] || e[Qa]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function Qi(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(r(33));
  }
  function Ba(e) {
    var t = e[Cc];
    return t || (t = e[Cc] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function it(e) {
    e[Zi] = !0;
  }
  var Nc = /* @__PURE__ */ new Set(), Mc = {};
  function fa(e, t) {
    $a(e, t), $a(e + "Capture", t);
  }
  function $a(e, t) {
    for (Mc[e] = t, e = 0; e < t.length; e++)
      Nc.add(t[e]);
  }
  var Ev = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Dc = {}, Rc = {};
  function Tv(e) {
    return oa.call(Rc, e) ? !0 : oa.call(Dc, e) ? !1 : Ev.test(e) ? Rc[e] = !0 : (Dc[e] = !0, !1);
  }
  function Hl(e, t, a) {
    if (Tv(t))
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
  function kl(e, t, a) {
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
  function rn(e, t, a, l) {
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
  function qc(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function Av(e, t, a) {
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
        set: function(f) {
          a = "" + f, o.call(this, f);
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
  function xu(e) {
    if (!e._valueTracker) {
      var t = qc(e) ? "checked" : "value";
      e._valueTracker = Av(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function Uc(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var a = t.getValue(), l = "";
    return e && (l = qc(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== a ? (t.setValue(e), !0) : !1;
  }
  function Bl(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var Ov = /[\n"\\]/g;
  function Ut(e) {
    return e.replace(
      Ov,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function Eu(e, t, a, l, u, o, f, p) {
    e.name = "", f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? e.type = f : e.removeAttribute("type"), t != null ? f === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + qt(t)) : e.value !== "" + qt(t) && (e.value = "" + qt(t)) : f !== "submit" && f !== "reset" || e.removeAttribute("value"), t != null ? Tu(e, f, qt(t)) : a != null ? Tu(e, f, qt(a)) : l != null && e.removeAttribute("value"), u == null && o != null && (e.defaultChecked = !!o), u != null && (e.checked = u && typeof u != "function" && typeof u != "symbol"), p != null && typeof p != "function" && typeof p != "symbol" && typeof p != "boolean" ? e.name = "" + qt(p) : e.removeAttribute("name");
  }
  function Zc(e, t, a, l, u, o, f, p) {
    if (o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.type = o), t != null || a != null) {
      if (!(o !== "submit" && o !== "reset" || t != null)) {
        xu(e);
        return;
      }
      a = a != null ? "" + qt(a) : "", t = t != null ? "" + qt(t) : a, p || t === e.value || (e.value = t), e.defaultValue = t;
    }
    l = l ?? u, l = typeof l != "function" && typeof l != "symbol" && !!l, e.checked = p ? e.checked : !!l, e.defaultChecked = !!l, f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" && (e.name = f), xu(e);
  }
  function Tu(e, t, a) {
    t === "number" && Bl(e.ownerDocument) === e || e.defaultValue === "" + a || (e.defaultValue = "" + a);
  }
  function La(e, t, a, l) {
    if (e = e.options, t) {
      t = {};
      for (var u = 0; u < a.length; u++)
        t["$" + a[u]] = !0;
      for (a = 0; a < e.length; a++)
        u = t.hasOwnProperty("$" + e[a].value), e[a].selected !== u && (e[a].selected = u), u && l && (e[a].defaultSelected = !0);
    } else {
      for (a = "" + qt(a), t = null, u = 0; u < e.length; u++) {
        if (e[u].value === a) {
          e[u].selected = !0, l && (e[u].defaultSelected = !0);
          return;
        }
        t !== null || e[u].disabled || (t = e[u]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Qc(e, t, a) {
    if (t != null && (t = "" + qt(t), t !== e.value && (e.value = t), a == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = a != null ? "" + qt(a) : "";
  }
  function Hc(e, t, a, l) {
    if (t == null) {
      if (l != null) {
        if (a != null) throw Error(r(92));
        if (nt(l)) {
          if (1 < l.length) throw Error(r(93));
          l = l[0];
        }
        a = l;
      }
      a == null && (a = ""), t = a;
    }
    a = qt(t), e.defaultValue = a, l = e.textContent, l === a && l !== "" && l !== null && (e.value = l), xu(e);
  }
  function Ga(e, t) {
    if (t) {
      var a = e.firstChild;
      if (a && a === e.lastChild && a.nodeType === 3) {
        a.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Cv = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function kc(e, t, a) {
    var l = t.indexOf("--") === 0;
    a == null || typeof a == "boolean" || a === "" ? l ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : l ? e.setProperty(t, a) : typeof a != "number" || a === 0 || Cv.has(t) ? t === "float" ? e.cssFloat = a : e[t] = ("" + a).trim() : e[t] = a + "px";
  }
  function Bc(e, t, a) {
    if (t != null && typeof t != "object")
      throw Error(r(62));
    if (e = e.style, a != null) {
      for (var l in a)
        !a.hasOwnProperty(l) || t != null && t.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
      for (var u in t)
        l = t[u], t.hasOwnProperty(u) && a[u] !== l && kc(e, u, l);
    } else
      for (var o in t)
        t.hasOwnProperty(o) && kc(e, o, t[o]);
  }
  function Au(e) {
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
  var Nv = /* @__PURE__ */ new Map([
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
  ]), Mv = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function $l(e) {
    return Mv.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function on() {
  }
  var Ou = null;
  function Cu(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var Ya = null, Ka = null;
  function $c(e) {
    var t = ka(e);
    if (t && (e = t.stateNode)) {
      var a = e[yt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (Eu(
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
                var u = l[yt] || null;
                if (!u) throw Error(r(90));
                Eu(
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
              l = a[t], l.form === e.form && Uc(l);
          }
          break e;
        case "textarea":
          Qc(e, a.value, a.defaultValue);
          break e;
        case "select":
          t = a.value, t != null && La(e, !!a.multiple, t, !1);
      }
    }
  }
  var Nu = !1;
  function Lc(e, t, a) {
    if (Nu) return e(t, a);
    Nu = !0;
    try {
      var l = e(t);
      return l;
    } finally {
      if (Nu = !1, (Ya !== null || Ka !== null) && (Os(), Ya && (t = Ya, e = Ka, Ka = Ya = null, $c(t), e)))
        for (t = 0; t < e.length; t++) $c(e[t]);
    }
  }
  function Hi(e, t) {
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
  var cn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Mu = !1;
  if (cn)
    try {
      var ki = {};
      Object.defineProperty(ki, "passive", {
        get: function() {
          Mu = !0;
        }
      }), window.addEventListener("test", ki, ki), window.removeEventListener("test", ki, ki);
    } catch {
      Mu = !1;
    }
  var Rn = null, Du = null, Ll = null;
  function Gc() {
    if (Ll) return Ll;
    var e, t = Du, a = t.length, l, u = "value" in Rn ? Rn.value : Rn.textContent, o = u.length;
    for (e = 0; e < a && t[e] === u[e]; e++) ;
    var f = a - e;
    for (l = 1; l <= f && t[a - l] === u[o - l]; l++) ;
    return Ll = u.slice(e, 1 < l ? 1 - l : void 0);
  }
  function Gl(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Yl() {
    return !0;
  }
  function Yc() {
    return !1;
  }
  function gt(e) {
    function t(a, l, u, o, f) {
      this._reactName = a, this._targetInst = u, this.type = l, this.nativeEvent = o, this.target = f, this.currentTarget = null;
      for (var p in e)
        e.hasOwnProperty(p) && (a = e[p], this[p] = a ? a(o) : o[p]);
      return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? Yl : Yc, this.isPropagationStopped = Yc, this;
    }
    return j(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var a = this.nativeEvent;
        a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = Yl);
      },
      stopPropagation: function() {
        var a = this.nativeEvent;
        a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = Yl);
      },
      persist: function() {
      },
      isPersistent: Yl
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
  }, Kl = gt(da), Bi = j({}, da, { view: 0, detail: 0 }), Dv = gt(Bi), Ru, qu, $i, Xl = j({}, Bi, {
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
    getModifierState: Zu,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== $i && ($i && e.type === "mousemove" ? (Ru = e.screenX - $i.screenX, qu = e.screenY - $i.screenY) : qu = Ru = 0, $i = e), Ru);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : qu;
    }
  }), Kc = gt(Xl), Rv = j({}, Xl, { dataTransfer: 0 }), qv = gt(Rv), Uv = j({}, Bi, { relatedTarget: 0 }), Uu = gt(Uv), Zv = j({}, da, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Qv = gt(Zv), Hv = j({}, da, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), kv = gt(Hv), Bv = j({}, da, { data: 0 }), Xc = gt(Bv), $v = {
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
  }, Lv = {
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
  }, Gv = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function Yv(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = Gv[e]) ? !!t[e] : !1;
  }
  function Zu() {
    return Yv;
  }
  var Kv = j({}, Bi, {
    key: function(e) {
      if (e.key) {
        var t = $v[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = Gl(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Lv[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Zu,
    charCode: function(e) {
      return e.type === "keypress" ? Gl(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? Gl(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), Xv = gt(Kv), Vv = j({}, Xl, {
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
  }), Vc = gt(Vv), Jv = j({}, Bi, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Zu
  }), Fv = gt(Jv), Iv = j({}, da, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Wv = gt(Iv), Pv = j({}, Xl, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), ey = gt(Pv), ty = j({}, da, {
    newState: 0,
    oldState: 0
  }), ny = gt(ty), ay = [9, 13, 27, 32], Qu = cn && "CompositionEvent" in window, Li = null;
  cn && "documentMode" in document && (Li = document.documentMode);
  var iy = cn && "TextEvent" in window && !Li, Jc = cn && (!Qu || Li && 8 < Li && 11 >= Li), Fc = " ", Ic = !1;
  function Wc(e, t) {
    switch (e) {
      case "keyup":
        return ay.indexOf(t.keyCode) !== -1;
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
  function Pc(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Xa = !1;
  function ly(e, t) {
    switch (e) {
      case "compositionend":
        return Pc(t);
      case "keypress":
        return t.which !== 32 ? null : (Ic = !0, Fc);
      case "textInput":
        return e = t.data, e === Fc && Ic ? null : e;
      default:
        return null;
    }
  }
  function sy(e, t) {
    if (Xa)
      return e === "compositionend" || !Qu && Wc(e, t) ? (e = Gc(), Ll = Du = Rn = null, Xa = !1, e) : null;
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
        return Jc && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var uy = {
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
  function ef(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!uy[e.type] : t === "textarea";
  }
  function tf(e, t, a, l) {
    Ya ? Ka ? Ka.push(l) : Ka = [l] : Ya = l, t = Us(t, "onChange"), 0 < t.length && (a = new Kl(
      "onChange",
      "change",
      null,
      a,
      l
    ), e.push({ event: a, listeners: t }));
  }
  var Gi = null, Yi = null;
  function ry(e) {
    Qh(e, 0);
  }
  function Vl(e) {
    var t = Qi(e);
    if (Uc(t)) return e;
  }
  function nf(e, t) {
    if (e === "change") return t;
  }
  var af = !1;
  if (cn) {
    var Hu;
    if (cn) {
      var ku = "oninput" in document;
      if (!ku) {
        var lf = document.createElement("div");
        lf.setAttribute("oninput", "return;"), ku = typeof lf.oninput == "function";
      }
      Hu = ku;
    } else Hu = !1;
    af = Hu && (!document.documentMode || 9 < document.documentMode);
  }
  function sf() {
    Gi && (Gi.detachEvent("onpropertychange", uf), Yi = Gi = null);
  }
  function uf(e) {
    if (e.propertyName === "value" && Vl(Yi)) {
      var t = [];
      tf(
        t,
        Yi,
        e,
        Cu(e)
      ), Lc(ry, t);
    }
  }
  function oy(e, t, a) {
    e === "focusin" ? (sf(), Gi = t, Yi = a, Gi.attachEvent("onpropertychange", uf)) : e === "focusout" && sf();
  }
  function cy(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Vl(Yi);
  }
  function fy(e, t) {
    if (e === "click") return Vl(t);
  }
  function dy(e, t) {
    if (e === "input" || e === "change")
      return Vl(t);
  }
  function hy(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Tt = typeof Object.is == "function" ? Object.is : hy;
  function Ki(e, t) {
    if (Tt(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var a = Object.keys(e), l = Object.keys(t);
    if (a.length !== l.length) return !1;
    for (l = 0; l < a.length; l++) {
      var u = a[l];
      if (!oa.call(t, u) || !Tt(e[u], t[u]))
        return !1;
    }
    return !0;
  }
  function rf(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function of(e, t) {
    var a = rf(e);
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
      a = rf(a);
    }
  }
  function cf(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? cf(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function ff(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = Bl(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var a = typeof t.contentWindow.location.href == "string";
      } catch {
        a = !1;
      }
      if (a) e = t.contentWindow;
      else break;
      t = Bl(e.document);
    }
    return t;
  }
  function Bu(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var my = cn && "documentMode" in document && 11 >= document.documentMode, Va = null, $u = null, Xi = null, Lu = !1;
  function df(e, t, a) {
    var l = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
    Lu || Va == null || Va !== Bl(l) || (l = Va, "selectionStart" in l && Bu(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = {
      anchorNode: l.anchorNode,
      anchorOffset: l.anchorOffset,
      focusNode: l.focusNode,
      focusOffset: l.focusOffset
    }), Xi && Ki(Xi, l) || (Xi = l, l = Us($u, "onSelect"), 0 < l.length && (t = new Kl(
      "onSelect",
      "select",
      null,
      t,
      a
    ), e.push({ event: t, listeners: l }), t.target = Va)));
  }
  function ha(e, t) {
    var a = {};
    return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
  }
  var Ja = {
    animationend: ha("Animation", "AnimationEnd"),
    animationiteration: ha("Animation", "AnimationIteration"),
    animationstart: ha("Animation", "AnimationStart"),
    transitionrun: ha("Transition", "TransitionRun"),
    transitionstart: ha("Transition", "TransitionStart"),
    transitioncancel: ha("Transition", "TransitionCancel"),
    transitionend: ha("Transition", "TransitionEnd")
  }, Gu = {}, hf = {};
  cn && (hf = document.createElement("div").style, "AnimationEvent" in window || (delete Ja.animationend.animation, delete Ja.animationiteration.animation, delete Ja.animationstart.animation), "TransitionEvent" in window || delete Ja.transitionend.transition);
  function ma(e) {
    if (Gu[e]) return Gu[e];
    if (!Ja[e]) return e;
    var t = Ja[e], a;
    for (a in t)
      if (t.hasOwnProperty(a) && a in hf)
        return Gu[e] = t[a];
    return e;
  }
  var mf = ma("animationend"), pf = ma("animationiteration"), vf = ma("animationstart"), py = ma("transitionrun"), vy = ma("transitionstart"), yy = ma("transitioncancel"), yf = ma("transitionend"), gf = /* @__PURE__ */ new Map(), Yu = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Yu.push("scrollEnd");
  function It(e, t) {
    gf.set(e, t), fa(t, [e]);
  }
  var Jl = typeof reportError == "function" ? reportError : function(e) {
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
  }, Zt = [], Fa = 0, Ku = 0;
  function Fl() {
    for (var e = Fa, t = Ku = Fa = 0; t < e; ) {
      var a = Zt[t];
      Zt[t++] = null;
      var l = Zt[t];
      Zt[t++] = null;
      var u = Zt[t];
      Zt[t++] = null;
      var o = Zt[t];
      if (Zt[t++] = null, l !== null && u !== null) {
        var f = l.pending;
        f === null ? u.next = u : (u.next = f.next, f.next = u), l.pending = u;
      }
      o !== 0 && bf(a, u, o);
    }
  }
  function Il(e, t, a, l) {
    Zt[Fa++] = e, Zt[Fa++] = t, Zt[Fa++] = a, Zt[Fa++] = l, Ku |= l, e.lanes |= l, e = e.alternate, e !== null && (e.lanes |= l);
  }
  function Xu(e, t, a, l) {
    return Il(e, t, a, l), Wl(e);
  }
  function pa(e, t) {
    return Il(e, null, null, t), Wl(e);
  }
  function bf(e, t, a) {
    e.lanes |= a;
    var l = e.alternate;
    l !== null && (l.lanes |= a);
    for (var u = !1, o = e.return; o !== null; )
      o.childLanes |= a, l = o.alternate, l !== null && (l.childLanes |= a), o.tag === 22 && (e = o.stateNode, e === null || e._visibility & 1 || (u = !0)), e = o, o = o.return;
    return e.tag === 3 ? (o = e.stateNode, u && t !== null && (u = 31 - Et(a), e = o.hiddenUpdates, l = e[u], l === null ? e[u] = [t] : l.push(t), t.lane = a | 536870912), o) : null;
  }
  function Wl(e) {
    if (50 < pl)
      throw pl = 0, no = null, Error(r(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var Ia = {};
  function gy(e, t, a, l) {
    this.tag = e, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function At(e, t, a, l) {
    return new gy(e, t, a, l);
  }
  function Vu(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function fn(e, t) {
    var a = e.alternate;
    return a === null ? (a = At(
      e.tag,
      t,
      e.key,
      e.mode
    ), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = e.flags & 65011712, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue, t = e.dependencies, a.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.refCleanup = e.refCleanup, a;
  }
  function _f(e, t) {
    e.flags &= 65011714;
    var a = e.alternate;
    return a === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type, t = a.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function Pl(e, t, a, l, u, o) {
    var f = 0;
    if (l = e, typeof e == "function") Vu(e) && (f = 1);
    else if (typeof e == "string")
      f = wg(
        e,
        a,
        J.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case se:
          return e = At(31, a, t, u), e.elementType = se, e.lanes = o, e;
        case H:
          return va(a.children, u, o, t);
        case W:
          f = 8, u |= 24;
          break;
        case $:
          return e = At(12, a, t, u | 2), e.elementType = $, e.lanes = o, e;
        case K:
          return e = At(13, a, t, u), e.elementType = K, e.lanes = o, e;
        case B:
          return e = At(19, a, t, u), e.elementType = B, e.lanes = o, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case ee:
                f = 10;
                break e;
              case ne:
                f = 9;
                break e;
              case G:
                f = 11;
                break e;
              case Y:
                f = 14;
                break e;
              case Z:
                f = 16, l = null;
                break e;
            }
          f = 29, a = Error(
            r(130, e === null ? "null" : typeof e, "")
          ), l = null;
      }
    return t = At(f, a, t, u), t.elementType = e, t.type = l, t.lanes = o, t;
  }
  function va(e, t, a, l) {
    return e = At(7, e, l, t), e.lanes = a, e;
  }
  function Ju(e, t, a) {
    return e = At(6, e, null, t), e.lanes = a, e;
  }
  function Sf(e) {
    var t = At(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function Fu(e, t, a) {
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
  var zf = /* @__PURE__ */ new WeakMap();
  function Qt(e, t) {
    if (typeof e == "object" && e !== null) {
      var a = zf.get(e);
      return a !== void 0 ? a : (t = {
        value: e,
        source: t,
        stack: Dl(t)
      }, zf.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: Dl(t)
    };
  }
  var Wa = [], Pa = 0, es = null, Vi = 0, Ht = [], kt = 0, qn = null, nn = 1, an = "";
  function dn(e, t) {
    Wa[Pa++] = Vi, Wa[Pa++] = es, es = e, Vi = t;
  }
  function wf(e, t, a) {
    Ht[kt++] = nn, Ht[kt++] = an, Ht[kt++] = qn, qn = e;
    var l = nn;
    e = an;
    var u = 32 - Et(l) - 1;
    l &= ~(1 << u), a += 1;
    var o = 32 - Et(t) + u;
    if (30 < o) {
      var f = u - u % 5;
      o = (l & (1 << f) - 1).toString(32), l >>= f, u -= f, nn = 1 << 32 - Et(t) + u | a << u | l, an = o + e;
    } else
      nn = 1 << o | a << u | l, an = e;
  }
  function Iu(e) {
    e.return !== null && (dn(e, 1), wf(e, 1, 0));
  }
  function Wu(e) {
    for (; e === es; )
      es = Wa[--Pa], Wa[Pa] = null, Vi = Wa[--Pa], Wa[Pa] = null;
    for (; e === qn; )
      qn = Ht[--kt], Ht[kt] = null, an = Ht[--kt], Ht[kt] = null, nn = Ht[--kt], Ht[kt] = null;
  }
  function jf(e, t) {
    Ht[kt++] = nn, Ht[kt++] = an, Ht[kt++] = qn, nn = t.id, an = t.overflow, qn = e;
  }
  var ut = null, qe = null, ye = !1, Un = null, Bt = !1, Pu = Error(r(519));
  function Zn(e) {
    var t = Error(
      r(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Ji(Qt(t, e)), Pu;
  }
  function xf(e) {
    var t = e.stateNode, a = e.type, l = e.memoizedProps;
    switch (t[st] = e, t[yt] = l, a) {
      case "dialog":
        he("cancel", t), he("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        he("load", t);
        break;
      case "video":
      case "audio":
        for (a = 0; a < yl.length; a++)
          he(yl[a], t);
        break;
      case "source":
        he("error", t);
        break;
      case "img":
      case "image":
      case "link":
        he("error", t), he("load", t);
        break;
      case "details":
        he("toggle", t);
        break;
      case "input":
        he("invalid", t), Zc(
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
        he("invalid", t);
        break;
      case "textarea":
        he("invalid", t), Hc(t, l.value, l.defaultValue, l.children);
    }
    a = l.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || t.textContent === "" + a || l.suppressHydrationWarning === !0 || $h(t.textContent, a) ? (l.popover != null && (he("beforetoggle", t), he("toggle", t)), l.onScroll != null && he("scroll", t), l.onScrollEnd != null && he("scrollend", t), l.onClick != null && (t.onclick = on), t = !0) : t = !1, t || Zn(e, !0);
  }
  function Ef(e) {
    for (ut = e.return; ut; )
      switch (ut.tag) {
        case 5:
        case 31:
        case 13:
          Bt = !1;
          return;
        case 27:
        case 3:
          Bt = !0;
          return;
        default:
          ut = ut.return;
      }
  }
  function ei(e) {
    if (e !== ut) return !1;
    if (!ye) return Ef(e), ye = !0, !1;
    var t = e.tag, a;
    if ((a = t !== 3 && t !== 27) && ((a = t === 5) && (a = e.type, a = !(a !== "form" && a !== "button") || go(e.type, e.memoizedProps)), a = !a), a && qe && Zn(e), Ef(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      qe = Ih(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      qe = Ih(e);
    } else
      t === 27 ? (t = qe, In(e.type) ? (e = wo, wo = null, qe = e) : qe = t) : qe = ut ? Lt(e.stateNode.nextSibling) : null;
    return !0;
  }
  function ya() {
    qe = ut = null, ye = !1;
  }
  function er() {
    var e = Un;
    return e !== null && (zt === null ? zt = e : zt.push.apply(
      zt,
      e
    ), Un = null), e;
  }
  function Ji(e) {
    Un === null ? Un = [e] : Un.push(e);
  }
  var tr = z(null), ga = null, hn = null;
  function Qn(e, t, a) {
    V(tr, t._currentValue), t._currentValue = a;
  }
  function mn(e) {
    e._currentValue = tr.current, U(tr);
  }
  function nr(e, t, a) {
    for (; e !== null; ) {
      var l = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, l !== null && (l.childLanes |= t)) : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t), e === a) break;
      e = e.return;
    }
  }
  function ar(e, t, a, l) {
    var u = e.child;
    for (u !== null && (u.return = e); u !== null; ) {
      var o = u.dependencies;
      if (o !== null) {
        var f = u.child;
        o = o.firstContext;
        e: for (; o !== null; ) {
          var p = o;
          o = u;
          for (var b = 0; b < t.length; b++)
            if (p.context === t[b]) {
              o.lanes |= a, p = o.alternate, p !== null && (p.lanes |= a), nr(
                o.return,
                a,
                e
              ), l || (f = null);
              break e;
            }
          o = p.next;
        }
      } else if (u.tag === 18) {
        if (f = u.return, f === null) throw Error(r(341));
        f.lanes |= a, o = f.alternate, o !== null && (o.lanes |= a), nr(f, a, e), f = null;
      } else f = u.child;
      if (f !== null) f.return = u;
      else
        for (f = u; f !== null; ) {
          if (f === e) {
            f = null;
            break;
          }
          if (u = f.sibling, u !== null) {
            u.return = f.return, f = u;
            break;
          }
          f = f.return;
        }
      u = f;
    }
  }
  function ti(e, t, a, l) {
    e = null;
    for (var u = t, o = !1; u !== null; ) {
      if (!o) {
        if ((u.flags & 524288) !== 0) o = !0;
        else if ((u.flags & 262144) !== 0) break;
      }
      if (u.tag === 10) {
        var f = u.alternate;
        if (f === null) throw Error(r(387));
        if (f = f.memoizedProps, f !== null) {
          var p = u.type;
          Tt(u.pendingProps.value, f.value) || (e !== null ? e.push(p) : e = [p]);
        }
      } else if (u === ge.current) {
        if (f = u.alternate, f === null) throw Error(r(387));
        f.memoizedState.memoizedState !== u.memoizedState.memoizedState && (e !== null ? e.push(zl) : e = [zl]);
      }
      u = u.return;
    }
    e !== null && ar(
      t,
      e,
      a,
      l
    ), t.flags |= 262144;
  }
  function ts(e) {
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
    ga = e, hn = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function rt(e) {
    return Tf(ga, e);
  }
  function ns(e, t) {
    return ga === null && ba(e), Tf(e, t);
  }
  function Tf(e, t) {
    var a = t._currentValue;
    if (t = { context: t, memoizedValue: a, next: null }, hn === null) {
      if (e === null) throw Error(r(308));
      hn = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else hn = hn.next = t;
    return a;
  }
  var by = typeof AbortController < "u" ? AbortController : function() {
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
  }, _y = n.unstable_scheduleCallback, Sy = n.unstable_NormalPriority, Ve = {
    $$typeof: ee,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function ir() {
    return {
      controller: new by(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Fi(e) {
    e.refCount--, e.refCount === 0 && _y(Sy, function() {
      e.controller.abort();
    });
  }
  var Ii = null, lr = 0, ni = 0, ai = null;
  function zy(e, t) {
    if (Ii === null) {
      var a = Ii = [];
      lr = 0, ni = ro(), ai = {
        status: "pending",
        value: void 0,
        then: function(l) {
          a.push(l);
        }
      };
    }
    return lr++, t.then(Af, Af), t;
  }
  function Af() {
    if (--lr === 0 && Ii !== null) {
      ai !== null && (ai.status = "fulfilled");
      var e = Ii;
      Ii = null, ni = 0, ai = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function wy(e, t) {
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
  var Of = C.S;
  C.S = function(e, t) {
    dh = k(), typeof t == "object" && t !== null && typeof t.then == "function" && zy(e, t), Of !== null && Of(e, t);
  };
  var _a = z(null);
  function sr() {
    var e = _a.current;
    return e !== null ? e : De.pooledCache;
  }
  function as(e, t) {
    t === null ? V(_a, _a.current) : V(_a, t.pool);
  }
  function Cf() {
    var e = sr();
    return e === null ? null : { parent: Ve._currentValue, pool: e };
  }
  var ii = Error(r(460)), ur = Error(r(474)), is = Error(r(542)), ls = { then: function() {
  } };
  function Nf(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function Mf(e, t, a) {
    switch (a = e[a], a === void 0 ? e.push(t) : a !== t && (t.then(on, on), t = a), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, Rf(e), e;
      default:
        if (typeof t.status == "string") t.then(on, on);
        else {
          if (e = De, e !== null && 100 < e.shellSuspendCounter)
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
            throw e = t.reason, Rf(e), e;
        }
        throw za = t, ii;
    }
  }
  function Sa(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (a) {
      throw a !== null && typeof a == "object" && typeof a.then == "function" ? (za = a, ii) : a;
    }
  }
  var za = null;
  function Df() {
    if (za === null) throw Error(r(459));
    var e = za;
    return za = null, e;
  }
  function Rf(e) {
    if (e === ii || e === is)
      throw Error(r(483));
  }
  var li = null, Wi = 0;
  function ss(e) {
    var t = Wi;
    return Wi += 1, li === null && (li = []), Mf(li, e, t);
  }
  function Pi(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function us(e, t) {
    throw t.$$typeof === w ? Error(r(525)) : (e = Object.prototype.toString.call(t), Error(
      r(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function qf(e) {
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
      return x = fn(x, S), x.index = 0, x.sibling = null, x;
    }
    function o(x, S, E) {
      return x.index = E, e ? (E = x.alternate, E !== null ? (E = E.index, E < S ? (x.flags |= 67108866, S) : E) : (x.flags |= 67108866, S)) : (x.flags |= 1048576, S);
    }
    function f(x) {
      return e && x.alternate === null && (x.flags |= 67108866), x;
    }
    function p(x, S, E, q) {
      return S === null || S.tag !== 6 ? (S = Ju(E, x.mode, q), S.return = x, S) : (S = u(S, E), S.return = x, S);
    }
    function b(x, S, E, q) {
      var ae = E.type;
      return ae === H ? D(
        x,
        S,
        E.props.children,
        q,
        E.key
      ) : S !== null && (S.elementType === ae || typeof ae == "object" && ae !== null && ae.$$typeof === Z && Sa(ae) === S.type) ? (S = u(S, E.props), Pi(S, E), S.return = x, S) : (S = Pl(
        E.type,
        E.key,
        E.props,
        null,
        x.mode,
        q
      ), Pi(S, E), S.return = x, S);
    }
    function T(x, S, E, q) {
      return S === null || S.tag !== 4 || S.stateNode.containerInfo !== E.containerInfo || S.stateNode.implementation !== E.implementation ? (S = Fu(E, x.mode, q), S.return = x, S) : (S = u(S, E.children || []), S.return = x, S);
    }
    function D(x, S, E, q, ae) {
      return S === null || S.tag !== 7 ? (S = va(
        E,
        x.mode,
        q,
        ae
      ), S.return = x, S) : (S = u(S, E), S.return = x, S);
    }
    function Q(x, S, E) {
      if (typeof S == "string" && S !== "" || typeof S == "number" || typeof S == "bigint")
        return S = Ju(
          "" + S,
          x.mode,
          E
        ), S.return = x, S;
      if (typeof S == "object" && S !== null) {
        switch (S.$$typeof) {
          case O:
            return E = Pl(
              S.type,
              S.key,
              S.props,
              null,
              x.mode,
              E
            ), Pi(E, S), E.return = x, E;
          case M:
            return S = Fu(
              S,
              x.mode,
              E
            ), S.return = x, S;
          case Z:
            return S = Sa(S), Q(x, S, E);
        }
        if (nt(S) || Re(S))
          return S = va(
            S,
            x.mode,
            E,
            null
          ), S.return = x, S;
        if (typeof S.then == "function")
          return Q(x, ss(S), E);
        if (S.$$typeof === ee)
          return Q(
            x,
            ns(x, S),
            E
          );
        us(x, S);
      }
      return null;
    }
    function A(x, S, E, q) {
      var ae = S !== null ? S.key : null;
      if (typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint")
        return ae !== null ? null : p(x, S, "" + E, q);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case O:
            return E.key === ae ? b(x, S, E, q) : null;
          case M:
            return E.key === ae ? T(x, S, E, q) : null;
          case Z:
            return E = Sa(E), A(x, S, E, q);
        }
        if (nt(E) || Re(E))
          return ae !== null ? null : D(x, S, E, q, null);
        if (typeof E.then == "function")
          return A(
            x,
            S,
            ss(E),
            q
          );
        if (E.$$typeof === ee)
          return A(
            x,
            S,
            ns(x, E),
            q
          );
        us(x, E);
      }
      return null;
    }
    function N(x, S, E, q, ae) {
      if (typeof q == "string" && q !== "" || typeof q == "number" || typeof q == "bigint")
        return x = x.get(E) || null, p(S, x, "" + q, ae);
      if (typeof q == "object" && q !== null) {
        switch (q.$$typeof) {
          case O:
            return x = x.get(
              q.key === null ? E : q.key
            ) || null, b(S, x, q, ae);
          case M:
            return x = x.get(
              q.key === null ? E : q.key
            ) || null, T(S, x, q, ae);
          case Z:
            return q = Sa(q), N(
              x,
              S,
              E,
              q,
              ae
            );
        }
        if (nt(q) || Re(q))
          return x = x.get(E) || null, D(S, x, q, ae, null);
        if (typeof q.then == "function")
          return N(
            x,
            S,
            E,
            ss(q),
            ae
          );
        if (q.$$typeof === ee)
          return N(
            x,
            S,
            E,
            ns(S, q),
            ae
          );
        us(S, q);
      }
      return null;
    }
    function F(x, S, E, q) {
      for (var ae = null, be = null, P = S, fe = S = 0, ve = null; P !== null && fe < E.length; fe++) {
        P.index > fe ? (ve = P, P = null) : ve = P.sibling;
        var _e = A(
          x,
          P,
          E[fe],
          q
        );
        if (_e === null) {
          P === null && (P = ve);
          break;
        }
        e && P && _e.alternate === null && t(x, P), S = o(_e, S, fe), be === null ? ae = _e : be.sibling = _e, be = _e, P = ve;
      }
      if (fe === E.length)
        return a(x, P), ye && dn(x, fe), ae;
      if (P === null) {
        for (; fe < E.length; fe++)
          P = Q(x, E[fe], q), P !== null && (S = o(
            P,
            S,
            fe
          ), be === null ? ae = P : be.sibling = P, be = P);
        return ye && dn(x, fe), ae;
      }
      for (P = l(P); fe < E.length; fe++)
        ve = N(
          P,
          x,
          fe,
          E[fe],
          q
        ), ve !== null && (e && ve.alternate !== null && P.delete(
          ve.key === null ? fe : ve.key
        ), S = o(
          ve,
          S,
          fe
        ), be === null ? ae = ve : be.sibling = ve, be = ve);
      return e && P.forEach(function(na) {
        return t(x, na);
      }), ye && dn(x, fe), ae;
    }
    function ie(x, S, E, q) {
      if (E == null) throw Error(r(151));
      for (var ae = null, be = null, P = S, fe = S = 0, ve = null, _e = E.next(); P !== null && !_e.done; fe++, _e = E.next()) {
        P.index > fe ? (ve = P, P = null) : ve = P.sibling;
        var na = A(x, P, _e.value, q);
        if (na === null) {
          P === null && (P = ve);
          break;
        }
        e && P && na.alternate === null && t(x, P), S = o(na, S, fe), be === null ? ae = na : be.sibling = na, be = na, P = ve;
      }
      if (_e.done)
        return a(x, P), ye && dn(x, fe), ae;
      if (P === null) {
        for (; !_e.done; fe++, _e = E.next())
          _e = Q(x, _e.value, q), _e !== null && (S = o(_e, S, fe), be === null ? ae = _e : be.sibling = _e, be = _e);
        return ye && dn(x, fe), ae;
      }
      for (P = l(P); !_e.done; fe++, _e = E.next())
        _e = N(P, x, fe, _e.value, q), _e !== null && (e && _e.alternate !== null && P.delete(_e.key === null ? fe : _e.key), S = o(_e, S, fe), be === null ? ae = _e : be.sibling = _e, be = _e);
      return e && P.forEach(function(Rg) {
        return t(x, Rg);
      }), ye && dn(x, fe), ae;
    }
    function Ne(x, S, E, q) {
      if (typeof E == "object" && E !== null && E.type === H && E.key === null && (E = E.props.children), typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case O:
            e: {
              for (var ae = E.key; S !== null; ) {
                if (S.key === ae) {
                  if (ae = E.type, ae === H) {
                    if (S.tag === 7) {
                      a(
                        x,
                        S.sibling
                      ), q = u(
                        S,
                        E.props.children
                      ), q.return = x, x = q;
                      break e;
                    }
                  } else if (S.elementType === ae || typeof ae == "object" && ae !== null && ae.$$typeof === Z && Sa(ae) === S.type) {
                    a(
                      x,
                      S.sibling
                    ), q = u(S, E.props), Pi(q, E), q.return = x, x = q;
                    break e;
                  }
                  a(x, S);
                  break;
                } else t(x, S);
                S = S.sibling;
              }
              E.type === H ? (q = va(
                E.props.children,
                x.mode,
                q,
                E.key
              ), q.return = x, x = q) : (q = Pl(
                E.type,
                E.key,
                E.props,
                null,
                x.mode,
                q
              ), Pi(q, E), q.return = x, x = q);
            }
            return f(x);
          case M:
            e: {
              for (ae = E.key; S !== null; ) {
                if (S.key === ae)
                  if (S.tag === 4 && S.stateNode.containerInfo === E.containerInfo && S.stateNode.implementation === E.implementation) {
                    a(
                      x,
                      S.sibling
                    ), q = u(S, E.children || []), q.return = x, x = q;
                    break e;
                  } else {
                    a(x, S);
                    break;
                  }
                else t(x, S);
                S = S.sibling;
              }
              q = Fu(E, x.mode, q), q.return = x, x = q;
            }
            return f(x);
          case Z:
            return E = Sa(E), Ne(
              x,
              S,
              E,
              q
            );
        }
        if (nt(E))
          return F(
            x,
            S,
            E,
            q
          );
        if (Re(E)) {
          if (ae = Re(E), typeof ae != "function") throw Error(r(150));
          return E = ae.call(E), ie(
            x,
            S,
            E,
            q
          );
        }
        if (typeof E.then == "function")
          return Ne(
            x,
            S,
            ss(E),
            q
          );
        if (E.$$typeof === ee)
          return Ne(
            x,
            S,
            ns(x, E),
            q
          );
        us(x, E);
      }
      return typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint" ? (E = "" + E, S !== null && S.tag === 6 ? (a(x, S.sibling), q = u(S, E), q.return = x, x = q) : (a(x, S), q = Ju(E, x.mode, q), q.return = x, x = q), f(x)) : a(x, S);
    }
    return function(x, S, E, q) {
      try {
        Wi = 0;
        var ae = Ne(
          x,
          S,
          E,
          q
        );
        return li = null, ae;
      } catch (P) {
        if (P === ii || P === is) throw P;
        var be = At(29, P, null, x.mode);
        return be.lanes = q, be.return = x, be;
      } finally {
      }
    };
  }
  var wa = qf(!0), Uf = qf(!1), Hn = !1;
  function rr(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function or(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function kn(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function Bn(e, t, a) {
    var l = e.updateQueue;
    if (l === null) return null;
    if (l = l.shared, (Se & 2) !== 0) {
      var u = l.pending;
      return u === null ? t.next = t : (t.next = u.next, u.next = t), l.pending = t, t = Wl(e), bf(e, null, a), t;
    }
    return Il(e, l, t, a), Wl(e);
  }
  function el(e, t, a) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (a & 4194048) !== 0)) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, Ec(e, a);
    }
  }
  function cr(e, t) {
    var a = e.updateQueue, l = e.alternate;
    if (l !== null && (l = l.updateQueue, a === l)) {
      var u = null, o = null;
      if (a = a.firstBaseUpdate, a !== null) {
        do {
          var f = {
            lane: a.lane,
            tag: a.tag,
            payload: a.payload,
            callback: null,
            next: null
          };
          o === null ? u = o = f : o = o.next = f, a = a.next;
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
  var fr = !1;
  function tl() {
    if (fr) {
      var e = ai;
      if (e !== null) throw e;
    }
  }
  function nl(e, t, a, l) {
    fr = !1;
    var u = e.updateQueue;
    Hn = !1;
    var o = u.firstBaseUpdate, f = u.lastBaseUpdate, p = u.shared.pending;
    if (p !== null) {
      u.shared.pending = null;
      var b = p, T = b.next;
      b.next = null, f === null ? o = T : f.next = T, f = b;
      var D = e.alternate;
      D !== null && (D = D.updateQueue, p = D.lastBaseUpdate, p !== f && (p === null ? D.firstBaseUpdate = T : p.next = T, D.lastBaseUpdate = b));
    }
    if (o !== null) {
      var Q = u.baseState;
      f = 0, D = T = b = null, p = o;
      do {
        var A = p.lane & -536870913, N = A !== p.lane;
        if (N ? (pe & A) === A : (l & A) === A) {
          A !== 0 && A === ni && (fr = !0), D !== null && (D = D.next = {
            lane: 0,
            tag: p.tag,
            payload: p.payload,
            callback: null,
            next: null
          });
          e: {
            var F = e, ie = p;
            A = t;
            var Ne = a;
            switch (ie.tag) {
              case 1:
                if (F = ie.payload, typeof F == "function") {
                  Q = F.call(Ne, Q, A);
                  break e;
                }
                Q = F;
                break e;
              case 3:
                F.flags = F.flags & -65537 | 128;
              case 0:
                if (F = ie.payload, A = typeof F == "function" ? F.call(Ne, Q, A) : F, A == null) break e;
                Q = j({}, Q, A);
                break e;
              case 2:
                Hn = !0;
            }
          }
          A = p.callback, A !== null && (e.flags |= 64, N && (e.flags |= 8192), N = u.callbacks, N === null ? u.callbacks = [A] : N.push(A));
        } else
          N = {
            lane: A,
            tag: p.tag,
            payload: p.payload,
            callback: p.callback,
            next: null
          }, D === null ? (T = D = N, b = Q) : D = D.next = N, f |= A;
        if (p = p.next, p === null) {
          if (p = u.shared.pending, p === null)
            break;
          N = p, p = N.next, N.next = null, u.lastBaseUpdate = N, u.shared.pending = null;
        }
      } while (!0);
      D === null && (b = Q), u.baseState = b, u.firstBaseUpdate = T, u.lastBaseUpdate = D, o === null && (u.shared.lanes = 0), Kn |= f, e.lanes = f, e.memoizedState = Q;
    }
  }
  function Zf(e, t) {
    if (typeof e != "function")
      throw Error(r(191, e));
    e.call(t);
  }
  function Qf(e, t) {
    var a = e.callbacks;
    if (a !== null)
      for (e.callbacks = null, e = 0; e < a.length; e++)
        Zf(a[e], t);
  }
  var si = z(null), rs = z(0);
  function Hf(e, t) {
    e = wn, V(rs, e), V(si, t), wn = e | t.baseLanes;
  }
  function dr() {
    V(rs, wn), V(si, si.current);
  }
  function hr() {
    wn = rs.current, U(si), U(rs);
  }
  var Ot = z(null), $t = null;
  function $n(e) {
    var t = e.alternate;
    V(Ye, Ye.current & 1), V(Ot, e), $t === null && (t === null || si.current !== null || t.memoizedState !== null) && ($t = e);
  }
  function mr(e) {
    V(Ye, Ye.current), V(Ot, e), $t === null && ($t = e);
  }
  function kf(e) {
    e.tag === 22 ? (V(Ye, Ye.current), V(Ot, e), $t === null && ($t = e)) : Ln();
  }
  function Ln() {
    V(Ye, Ye.current), V(Ot, Ot.current);
  }
  function Ct(e) {
    U(Ot), $t === e && ($t = null), U(Ye);
  }
  var Ye = z(0);
  function os(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var a = t.memoizedState;
        if (a !== null && (a = a.dehydrated, a === null || So(a) || zo(a)))
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
  var pn = 0, ce = null, Oe = null, Je = null, cs = !1, ui = !1, ja = !1, fs = 0, al = 0, ri = null, jy = 0;
  function Le() {
    throw Error(r(321));
  }
  function pr(e, t) {
    if (t === null) return !1;
    for (var a = 0; a < t.length && a < e.length; a++)
      if (!Tt(e[a], t[a])) return !1;
    return !0;
  }
  function vr(e, t, a, l, u, o) {
    return pn = o, ce = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, C.H = e === null || e.memoizedState === null ? wd : Nr, ja = !1, o = a(l, u), ja = !1, ui && (o = $f(
      t,
      a,
      l,
      u
    )), Bf(e), o;
  }
  function Bf(e) {
    C.H = sl;
    var t = Oe !== null && Oe.next !== null;
    if (pn = 0, Je = Oe = ce = null, cs = !1, al = 0, ri = null, t) throw Error(r(300));
    e === null || Fe || (e = e.dependencies, e !== null && ts(e) && (Fe = !0));
  }
  function $f(e, t, a, l) {
    ce = e;
    var u = 0;
    do {
      if (ui && (ri = null), al = 0, ui = !1, 25 <= u) throw Error(r(301));
      if (u += 1, Je = Oe = null, e.updateQueue != null) {
        var o = e.updateQueue;
        o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
      }
      C.H = jd, o = t(a, l);
    } while (ui);
    return o;
  }
  function xy() {
    var e = C.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? il(t) : t, e = e.useState()[0], (Oe !== null ? Oe.memoizedState : null) !== e && (ce.flags |= 1024), t;
  }
  function yr() {
    var e = fs !== 0;
    return fs = 0, e;
  }
  function gr(e, t, a) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~a;
  }
  function br(e) {
    if (cs) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      cs = !1;
    }
    pn = 0, Je = Oe = ce = null, ui = !1, al = fs = 0, ri = null;
  }
  function ht() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Je === null ? ce.memoizedState = Je = e : Je = Je.next = e, Je;
  }
  function Ke() {
    if (Oe === null) {
      var e = ce.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Oe.next;
    var t = Je === null ? ce.memoizedState : Je.next;
    if (t !== null)
      Je = t, Oe = e;
    else {
      if (e === null)
        throw ce.alternate === null ? Error(r(467)) : Error(r(310));
      Oe = e, e = {
        memoizedState: Oe.memoizedState,
        baseState: Oe.baseState,
        baseQueue: Oe.baseQueue,
        queue: Oe.queue,
        next: null
      }, Je === null ? ce.memoizedState = Je = e : Je = Je.next = e;
    }
    return Je;
  }
  function ds() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function il(e) {
    var t = al;
    return al += 1, ri === null && (ri = []), e = Mf(ri, e, t), t = ce, (Je === null ? t.memoizedState : Je.next) === null && (t = t.alternate, C.H = t === null || t.memoizedState === null ? wd : Nr), e;
  }
  function hs(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return il(e);
      if (e.$$typeof === ee) return rt(e);
    }
    throw Error(r(438, String(e)));
  }
  function _r(e) {
    var t = null, a = ce.updateQueue;
    if (a !== null && (t = a.memoCache), t == null) {
      var l = ce.alternate;
      l !== null && (l = l.updateQueue, l !== null && (l = l.memoCache, l != null && (t = {
        data: l.data.map(function(u) {
          return u.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), a === null && (a = ds(), ce.updateQueue = a), a.memoCache = t, a = t.data[t.index], a === void 0)
      for (a = t.data[t.index] = Array(e), l = 0; l < e; l++)
        a[l] = ze;
    return t.index++, a;
  }
  function vn(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function ms(e) {
    var t = Ke();
    return Sr(t, Oe, e);
  }
  function Sr(e, t, a) {
    var l = e.queue;
    if (l === null) throw Error(r(311));
    l.lastRenderedReducer = a;
    var u = e.baseQueue, o = l.pending;
    if (o !== null) {
      if (u !== null) {
        var f = u.next;
        u.next = o.next, o.next = f;
      }
      t.baseQueue = u = o, l.pending = null;
    }
    if (o = e.baseState, u === null) e.memoizedState = o;
    else {
      t = u.next;
      var p = f = null, b = null, T = t, D = !1;
      do {
        var Q = T.lane & -536870913;
        if (Q !== T.lane ? (pe & Q) === Q : (pn & Q) === Q) {
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
            }), Q === ni && (D = !0);
          else if ((pn & A) === A) {
            T = T.next, A === ni && (D = !0);
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
            }, b === null ? (p = b = Q, f = o) : b = b.next = Q, ce.lanes |= A, Kn |= A;
          Q = T.action, ja && a(o, Q), o = T.hasEagerState ? T.eagerState : a(o, Q);
        } else
          A = {
            lane: Q,
            revertLane: T.revertLane,
            gesture: T.gesture,
            action: T.action,
            hasEagerState: T.hasEagerState,
            eagerState: T.eagerState,
            next: null
          }, b === null ? (p = b = A, f = o) : b = b.next = A, ce.lanes |= Q, Kn |= Q;
        T = T.next;
      } while (T !== null && T !== t);
      if (b === null ? f = o : b.next = p, !Tt(o, e.memoizedState) && (Fe = !0, D && (a = ai, a !== null)))
        throw a;
      e.memoizedState = o, e.baseState = f, e.baseQueue = b, l.lastRenderedState = o;
    }
    return u === null && (l.lanes = 0), [e.memoizedState, l.dispatch];
  }
  function zr(e) {
    var t = Ke(), a = t.queue;
    if (a === null) throw Error(r(311));
    a.lastRenderedReducer = e;
    var l = a.dispatch, u = a.pending, o = t.memoizedState;
    if (u !== null) {
      a.pending = null;
      var f = u = u.next;
      do
        o = e(o, f.action), f = f.next;
      while (f !== u);
      Tt(o, t.memoizedState) || (Fe = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), a.lastRenderedState = o;
    }
    return [o, l];
  }
  function Lf(e, t, a) {
    var l = ce, u = Ke(), o = ye;
    if (o) {
      if (a === void 0) throw Error(r(407));
      a = a();
    } else a = t();
    var f = !Tt(
      (Oe || u).memoizedState,
      a
    );
    if (f && (u.memoizedState = a, Fe = !0), u = u.queue, xr(Kf.bind(null, l, u, e), [
      e
    ]), u.getSnapshot !== t || f || Je !== null && Je.memoizedState.tag & 1) {
      if (l.flags |= 2048, oi(
        9,
        { destroy: void 0 },
        Yf.bind(
          null,
          l,
          u,
          a,
          t
        ),
        null
      ), De === null) throw Error(r(349));
      o || (pn & 127) !== 0 || Gf(l, t, a);
    }
    return a;
  }
  function Gf(e, t, a) {
    e.flags |= 16384, e = { getSnapshot: t, value: a }, t = ce.updateQueue, t === null ? (t = ds(), ce.updateQueue = t, t.stores = [e]) : (a = t.stores, a === null ? t.stores = [e] : a.push(e));
  }
  function Yf(e, t, a, l) {
    t.value = a, t.getSnapshot = l, Xf(t) && Vf(e);
  }
  function Kf(e, t, a) {
    return a(function() {
      Xf(t) && Vf(e);
    });
  }
  function Xf(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var a = t();
      return !Tt(e, a);
    } catch {
      return !0;
    }
  }
  function Vf(e) {
    var t = pa(e, 2);
    t !== null && wt(t, e, 2);
  }
  function wr(e) {
    var t = ht();
    if (typeof e == "function") {
      var a = e;
      if (e = a(), ja) {
        Mn(!0);
        try {
          a();
        } finally {
          Mn(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: vn,
      lastRenderedState: e
    }, t;
  }
  function Jf(e, t, a, l) {
    return e.baseState = a, Sr(
      e,
      Oe,
      typeof l == "function" ? l : vn
    );
  }
  function Ey(e, t, a, l, u) {
    if (ys(e)) throw Error(r(485));
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
        then: function(f) {
          o.listeners.push(f);
        }
      };
      C.T !== null ? a(!0) : o.isTransition = !1, l(o), a = t.pending, a === null ? (o.next = t.pending = o, Ff(t, o)) : (o.next = a.next, t.pending = a.next = o);
    }
  }
  function Ff(e, t) {
    var a = t.action, l = t.payload, u = e.state;
    if (t.isTransition) {
      var o = C.T, f = {};
      C.T = f;
      try {
        var p = a(u, l), b = C.S;
        b !== null && b(f, p), If(e, t, p);
      } catch (T) {
        jr(e, t, T);
      } finally {
        o !== null && f.types !== null && (o.types = f.types), C.T = o;
      }
    } else
      try {
        o = a(u, l), If(e, t, o);
      } catch (T) {
        jr(e, t, T);
      }
  }
  function If(e, t, a) {
    a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(
      function(l) {
        Wf(e, t, l);
      },
      function(l) {
        return jr(e, t, l);
      }
    ) : Wf(e, t, a);
  }
  function Wf(e, t, a) {
    t.status = "fulfilled", t.value = a, Pf(t), e.state = a, t = e.pending, t !== null && (a = t.next, a === t ? e.pending = null : (a = a.next, t.next = a, Ff(e, a)));
  }
  function jr(e, t, a) {
    var l = e.pending;
    if (e.pending = null, l !== null) {
      l = l.next;
      do
        t.status = "rejected", t.reason = a, Pf(t), t = t.next;
      while (t !== l);
    }
    e.action = null;
  }
  function Pf(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function ed(e, t) {
    return t;
  }
  function td(e, t) {
    if (ye) {
      var a = De.formState;
      if (a !== null) {
        e: {
          var l = ce;
          if (ye) {
            if (qe) {
              t: {
                for (var u = qe, o = Bt; u.nodeType !== 8; ) {
                  if (!o) {
                    u = null;
                    break t;
                  }
                  if (u = Lt(
                    u.nextSibling
                  ), u === null) {
                    u = null;
                    break t;
                  }
                }
                o = u.data, u = o === "F!" || o === "F" ? u : null;
              }
              if (u) {
                qe = Lt(
                  u.nextSibling
                ), l = u.data === "F!";
                break e;
              }
            }
            Zn(l);
          }
          l = !1;
        }
        l && (t = a[0]);
      }
    }
    return a = ht(), a.memoizedState = a.baseState = t, l = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: ed,
      lastRenderedState: t
    }, a.queue = l, a = _d.bind(
      null,
      ce,
      l
    ), l.dispatch = a, l = wr(!1), o = Cr.bind(
      null,
      ce,
      !1,
      l.queue
    ), l = ht(), u = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, l.queue = u, a = Ey.bind(
      null,
      ce,
      u,
      o,
      a
    ), u.dispatch = a, l.memoizedState = e, [t, a, !1];
  }
  function nd(e) {
    var t = Ke();
    return ad(t, Oe, e);
  }
  function ad(e, t, a) {
    if (t = Sr(
      e,
      t,
      ed
    )[0], e = ms(vn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var l = il(t);
      } catch (f) {
        throw f === ii ? is : f;
      }
    else l = t;
    t = Ke();
    var u = t.queue, o = u.dispatch;
    return a !== t.memoizedState && (ce.flags |= 2048, oi(
      9,
      { destroy: void 0 },
      Ty.bind(null, u, a),
      null
    )), [l, o, e];
  }
  function Ty(e, t) {
    e.action = t;
  }
  function id(e) {
    var t = Ke(), a = Oe;
    if (a !== null)
      return ad(t, a, e);
    Ke(), t = t.memoizedState, a = Ke();
    var l = a.queue.dispatch;
    return a.memoizedState = e, [t, l, !1];
  }
  function oi(e, t, a, l) {
    return e = { tag: e, create: a, deps: l, inst: t, next: null }, t = ce.updateQueue, t === null && (t = ds(), ce.updateQueue = t), a = t.lastEffect, a === null ? t.lastEffect = e.next = e : (l = a.next, a.next = e, e.next = l, t.lastEffect = e), e;
  }
  function ld() {
    return Ke().memoizedState;
  }
  function ps(e, t, a, l) {
    var u = ht();
    ce.flags |= e, u.memoizedState = oi(
      1 | t,
      { destroy: void 0 },
      a,
      l === void 0 ? null : l
    );
  }
  function vs(e, t, a, l) {
    var u = Ke();
    l = l === void 0 ? null : l;
    var o = u.memoizedState.inst;
    Oe !== null && l !== null && pr(l, Oe.memoizedState.deps) ? u.memoizedState = oi(t, o, a, l) : (ce.flags |= e, u.memoizedState = oi(
      1 | t,
      o,
      a,
      l
    ));
  }
  function sd(e, t) {
    ps(8390656, 8, e, t);
  }
  function xr(e, t) {
    vs(2048, 8, e, t);
  }
  function Ay(e) {
    ce.flags |= 4;
    var t = ce.updateQueue;
    if (t === null)
      t = ds(), ce.updateQueue = t, t.events = [e];
    else {
      var a = t.events;
      a === null ? t.events = [e] : a.push(e);
    }
  }
  function ud(e) {
    var t = Ke().memoizedState;
    return Ay({ ref: t, nextImpl: e }), function() {
      if ((Se & 2) !== 0) throw Error(r(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function rd(e, t) {
    return vs(4, 2, e, t);
  }
  function od(e, t) {
    return vs(4, 4, e, t);
  }
  function cd(e, t) {
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
  function fd(e, t, a) {
    a = a != null ? a.concat([e]) : null, vs(4, 4, cd.bind(null, t, e), a);
  }
  function Er() {
  }
  function dd(e, t) {
    var a = Ke();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    return t !== null && pr(t, l[1]) ? l[0] : (a.memoizedState = [e, t], e);
  }
  function hd(e, t) {
    var a = Ke();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    if (t !== null && pr(t, l[1]))
      return l[0];
    if (l = e(), ja) {
      Mn(!0);
      try {
        e();
      } finally {
        Mn(!1);
      }
    }
    return a.memoizedState = [l, t], l;
  }
  function Tr(e, t, a) {
    return a === void 0 || (pn & 1073741824) !== 0 && (pe & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = a, e = mh(), ce.lanes |= e, Kn |= e, a);
  }
  function md(e, t, a, l) {
    return Tt(a, t) ? a : si.current !== null ? (e = Tr(e, a, l), Tt(e, t) || (Fe = !0), e) : (pn & 42) === 0 || (pn & 1073741824) !== 0 && (pe & 261930) === 0 ? (Fe = !0, e.memoizedState = a) : (e = mh(), ce.lanes |= e, Kn |= e, t);
  }
  function pd(e, t, a, l, u) {
    var o = X.p;
    X.p = o !== 0 && 8 > o ? o : 8;
    var f = C.T, p = {};
    C.T = p, Cr(e, !1, t, a);
    try {
      var b = u(), T = C.S;
      if (T !== null && T(p, b), b !== null && typeof b == "object" && typeof b.then == "function") {
        var D = wy(
          b,
          l
        );
        ll(
          e,
          t,
          D,
          Dt(e)
        );
      } else
        ll(
          e,
          t,
          l,
          Dt(e)
        );
    } catch (Q) {
      ll(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: Q },
        Dt()
      );
    } finally {
      X.p = o, f !== null && p.types !== null && (f.types = p.types), C.T = f;
    }
  }
  function Oy() {
  }
  function Ar(e, t, a, l) {
    if (e.tag !== 5) throw Error(r(476));
    var u = vd(e).queue;
    pd(
      e,
      u,
      t,
      le,
      a === null ? Oy : function() {
        return yd(e), a(l);
      }
    );
  }
  function vd(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: le,
      baseState: le,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: vn,
        lastRenderedState: le
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
        lastRenderedReducer: vn,
        lastRenderedState: a
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function yd(e) {
    var t = vd(e);
    t.next === null && (t = e.alternate.memoizedState), ll(
      e,
      t.next.queue,
      {},
      Dt()
    );
  }
  function Or() {
    return rt(zl);
  }
  function gd() {
    return Ke().memoizedState;
  }
  function bd() {
    return Ke().memoizedState;
  }
  function Cy(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var a = Dt();
          e = kn(a);
          var l = Bn(t, e, a);
          l !== null && (wt(l, t, a), el(l, t, a)), t = { cache: ir() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function Ny(e, t, a) {
    var l = Dt();
    a = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, ys(e) ? Sd(t, a) : (a = Xu(e, t, a, l), a !== null && (wt(a, e, l), zd(a, t, l)));
  }
  function _d(e, t, a) {
    var l = Dt();
    ll(e, t, a, l);
  }
  function ll(e, t, a, l) {
    var u = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (ys(e)) Sd(t, u);
    else {
      var o = e.alternate;
      if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer, o !== null))
        try {
          var f = t.lastRenderedState, p = o(f, a);
          if (u.hasEagerState = !0, u.eagerState = p, Tt(p, f))
            return Il(e, t, u, 0), De === null && Fl(), !1;
        } catch {
        } finally {
        }
      if (a = Xu(e, t, u, l), a !== null)
        return wt(a, e, l), zd(a, t, l), !0;
    }
    return !1;
  }
  function Cr(e, t, a, l) {
    if (l = {
      lane: 2,
      revertLane: ro(),
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, ys(e)) {
      if (t) throw Error(r(479));
    } else
      t = Xu(
        e,
        a,
        l,
        2
      ), t !== null && wt(t, e, 2);
  }
  function ys(e) {
    var t = e.alternate;
    return e === ce || t !== null && t === ce;
  }
  function Sd(e, t) {
    ui = cs = !0;
    var a = e.pending;
    a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
  }
  function zd(e, t, a) {
    if ((a & 4194048) !== 0) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, Ec(e, a);
    }
  }
  var sl = {
    readContext: rt,
    use: hs,
    useCallback: Le,
    useContext: Le,
    useEffect: Le,
    useImperativeHandle: Le,
    useLayoutEffect: Le,
    useInsertionEffect: Le,
    useMemo: Le,
    useReducer: Le,
    useRef: Le,
    useState: Le,
    useDebugValue: Le,
    useDeferredValue: Le,
    useTransition: Le,
    useSyncExternalStore: Le,
    useId: Le,
    useHostTransitionStatus: Le,
    useFormState: Le,
    useActionState: Le,
    useOptimistic: Le,
    useMemoCache: Le,
    useCacheRefresh: Le
  };
  sl.useEffectEvent = Le;
  var wd = {
    readContext: rt,
    use: hs,
    useCallback: function(e, t) {
      return ht().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: rt,
    useEffect: sd,
    useImperativeHandle: function(e, t, a) {
      a = a != null ? a.concat([e]) : null, ps(
        4194308,
        4,
        cd.bind(null, t, e),
        a
      );
    },
    useLayoutEffect: function(e, t) {
      return ps(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      ps(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var a = ht();
      t = t === void 0 ? null : t;
      var l = e();
      if (ja) {
        Mn(!0);
        try {
          e();
        } finally {
          Mn(!1);
        }
      }
      return a.memoizedState = [l, t], l;
    },
    useReducer: function(e, t, a) {
      var l = ht();
      if (a !== void 0) {
        var u = a(t);
        if (ja) {
          Mn(!0);
          try {
            a(t);
          } finally {
            Mn(!1);
          }
        }
      } else u = t;
      return l.memoizedState = l.baseState = u, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: u
      }, l.queue = e, e = e.dispatch = Ny.bind(
        null,
        ce,
        e
      ), [l.memoizedState, e];
    },
    useRef: function(e) {
      var t = ht();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = wr(e);
      var t = e.queue, a = _d.bind(null, ce, t);
      return t.dispatch = a, [e.memoizedState, a];
    },
    useDebugValue: Er,
    useDeferredValue: function(e, t) {
      var a = ht();
      return Tr(a, e, t);
    },
    useTransition: function() {
      var e = wr(!1);
      return e = pd.bind(
        null,
        ce,
        e.queue,
        !0,
        !1
      ), ht().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, a) {
      var l = ce, u = ht();
      if (ye) {
        if (a === void 0)
          throw Error(r(407));
        a = a();
      } else {
        if (a = t(), De === null)
          throw Error(r(349));
        (pe & 127) !== 0 || Gf(l, t, a);
      }
      u.memoizedState = a;
      var o = { value: a, getSnapshot: t };
      return u.queue = o, sd(Kf.bind(null, l, o, e), [
        e
      ]), l.flags |= 2048, oi(
        9,
        { destroy: void 0 },
        Yf.bind(
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
      var e = ht(), t = De.identifierPrefix;
      if (ye) {
        var a = an, l = nn;
        a = (l & ~(1 << 32 - Et(l) - 1)).toString(32) + a, t = "_" + t + "R_" + a, a = fs++, 0 < a && (t += "H" + a.toString(32)), t += "_";
      } else
        a = jy++, t = "_" + t + "r_" + a.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: Or,
    useFormState: td,
    useActionState: td,
    useOptimistic: function(e) {
      var t = ht();
      t.memoizedState = t.baseState = e;
      var a = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = a, t = Cr.bind(
        null,
        ce,
        !0,
        a
      ), a.dispatch = t, [e, t];
    },
    useMemoCache: _r,
    useCacheRefresh: function() {
      return ht().memoizedState = Cy.bind(
        null,
        ce
      );
    },
    useEffectEvent: function(e) {
      var t = ht(), a = { impl: e };
      return t.memoizedState = a, function() {
        if ((Se & 2) !== 0)
          throw Error(r(440));
        return a.impl.apply(void 0, arguments);
      };
    }
  }, Nr = {
    readContext: rt,
    use: hs,
    useCallback: dd,
    useContext: rt,
    useEffect: xr,
    useImperativeHandle: fd,
    useInsertionEffect: rd,
    useLayoutEffect: od,
    useMemo: hd,
    useReducer: ms,
    useRef: ld,
    useState: function() {
      return ms(vn);
    },
    useDebugValue: Er,
    useDeferredValue: function(e, t) {
      var a = Ke();
      return md(
        a,
        Oe.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = ms(vn)[0], t = Ke().memoizedState;
      return [
        typeof e == "boolean" ? e : il(e),
        t
      ];
    },
    useSyncExternalStore: Lf,
    useId: gd,
    useHostTransitionStatus: Or,
    useFormState: nd,
    useActionState: nd,
    useOptimistic: function(e, t) {
      var a = Ke();
      return Jf(a, Oe, e, t);
    },
    useMemoCache: _r,
    useCacheRefresh: bd
  };
  Nr.useEffectEvent = ud;
  var jd = {
    readContext: rt,
    use: hs,
    useCallback: dd,
    useContext: rt,
    useEffect: xr,
    useImperativeHandle: fd,
    useInsertionEffect: rd,
    useLayoutEffect: od,
    useMemo: hd,
    useReducer: zr,
    useRef: ld,
    useState: function() {
      return zr(vn);
    },
    useDebugValue: Er,
    useDeferredValue: function(e, t) {
      var a = Ke();
      return Oe === null ? Tr(a, e, t) : md(
        a,
        Oe.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = zr(vn)[0], t = Ke().memoizedState;
      return [
        typeof e == "boolean" ? e : il(e),
        t
      ];
    },
    useSyncExternalStore: Lf,
    useId: gd,
    useHostTransitionStatus: Or,
    useFormState: id,
    useActionState: id,
    useOptimistic: function(e, t) {
      var a = Ke();
      return Oe !== null ? Jf(a, Oe, e, t) : (a.baseState = e, [e, a.queue.dispatch]);
    },
    useMemoCache: _r,
    useCacheRefresh: bd
  };
  jd.useEffectEvent = ud;
  function Mr(e, t, a, l) {
    t = e.memoizedState, a = a(l, t), a = a == null ? t : j({}, t, a), e.memoizedState = a, e.lanes === 0 && (e.updateQueue.baseState = a);
  }
  var Dr = {
    enqueueSetState: function(e, t, a) {
      e = e._reactInternals;
      var l = Dt(), u = kn(l);
      u.payload = t, a != null && (u.callback = a), t = Bn(e, u, l), t !== null && (wt(t, e, l), el(t, e, l));
    },
    enqueueReplaceState: function(e, t, a) {
      e = e._reactInternals;
      var l = Dt(), u = kn(l);
      u.tag = 1, u.payload = t, a != null && (u.callback = a), t = Bn(e, u, l), t !== null && (wt(t, e, l), el(t, e, l));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var a = Dt(), l = kn(a);
      l.tag = 2, t != null && (l.callback = t), t = Bn(e, l, a), t !== null && (wt(t, e, a), el(t, e, a));
    }
  };
  function xd(e, t, a, l, u, o, f) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, o, f) : t.prototype && t.prototype.isPureReactComponent ? !Ki(a, l) || !Ki(u, o) : !0;
  }
  function Ed(e, t, a, l) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, l), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, l), t.state !== e && Dr.enqueueReplaceState(t, t.state, null);
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
      for (var u in e)
        a[u] === void 0 && (a[u] = e[u]);
    }
    return a;
  }
  function Td(e) {
    Jl(e);
  }
  function Ad(e) {
    console.error(e);
  }
  function Od(e) {
    Jl(e);
  }
  function gs(e, t) {
    try {
      var a = e.onUncaughtError;
      a(t.value, { componentStack: t.stack });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function Cd(e, t, a) {
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
  function Rr(e, t, a) {
    return a = kn(a), a.tag = 3, a.payload = { element: null }, a.callback = function() {
      gs(e, t);
    }, a;
  }
  function Nd(e) {
    return e = kn(e), e.tag = 3, e;
  }
  function Md(e, t, a, l) {
    var u = a.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var o = l.value;
      e.payload = function() {
        return u(o);
      }, e.callback = function() {
        Cd(t, a, l);
      };
    }
    var f = a.stateNode;
    f !== null && typeof f.componentDidCatch == "function" && (e.callback = function() {
      Cd(t, a, l), typeof u != "function" && (Xn === null ? Xn = /* @__PURE__ */ new Set([this]) : Xn.add(this));
      var p = l.stack;
      this.componentDidCatch(l.value, {
        componentStack: p !== null ? p : ""
      });
    });
  }
  function My(e, t, a, l, u) {
    if (a.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
      if (t = a.alternate, t !== null && ti(
        t,
        a,
        u,
        !0
      ), a = Ot.current, a !== null) {
        switch (a.tag) {
          case 31:
          case 13:
            return $t === null ? Cs() : a.alternate === null && Ge === 0 && (Ge = 3), a.flags &= -257, a.flags |= 65536, a.lanes = u, l === ls ? a.flags |= 16384 : (t = a.updateQueue, t === null ? a.updateQueue = /* @__PURE__ */ new Set([l]) : t.add(l), lo(e, l, u)), !1;
          case 22:
            return a.flags |= 65536, l === ls ? a.flags |= 16384 : (t = a.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([l])
            }, a.updateQueue = t) : (a = t.retryQueue, a === null ? t.retryQueue = /* @__PURE__ */ new Set([l]) : a.add(l)), lo(e, l, u)), !1;
        }
        throw Error(r(435, a.tag));
      }
      return lo(e, l, u), Cs(), !1;
    }
    if (ye)
      return t = Ot.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = u, l !== Pu && (e = Error(r(422), { cause: l }), Ji(Qt(e, a)))) : (l !== Pu && (t = Error(r(423), {
        cause: l
      }), Ji(
        Qt(t, a)
      )), e = e.current.alternate, e.flags |= 65536, u &= -u, e.lanes |= u, l = Qt(l, a), u = Rr(
        e.stateNode,
        l,
        u
      ), cr(e, u), Ge !== 4 && (Ge = 2)), !1;
    var o = Error(r(520), { cause: l });
    if (o = Qt(o, a), ml === null ? ml = [o] : ml.push(o), Ge !== 4 && (Ge = 2), t === null) return !0;
    l = Qt(l, a), a = t;
    do {
      switch (a.tag) {
        case 3:
          return a.flags |= 65536, e = u & -u, a.lanes |= e, e = Rr(a.stateNode, l, e), cr(a, e), !1;
        case 1:
          if (t = a.type, o = a.stateNode, (a.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (Xn === null || !Xn.has(o))))
            return a.flags |= 65536, u &= -u, a.lanes |= u, u = Nd(u), Md(
              u,
              e,
              a,
              l
            ), cr(a, u), !1;
      }
      a = a.return;
    } while (a !== null);
    return !1;
  }
  var qr = Error(r(461)), Fe = !1;
  function ot(e, t, a, l) {
    t.child = e === null ? Uf(t, null, a, l) : wa(
      t,
      e.child,
      a,
      l
    );
  }
  function Dd(e, t, a, l, u) {
    a = a.render;
    var o = t.ref;
    if ("ref" in l) {
      var f = {};
      for (var p in l)
        p !== "ref" && (f[p] = l[p]);
    } else f = l;
    return ba(t), l = vr(
      e,
      t,
      a,
      f,
      o,
      u
    ), p = yr(), e !== null && !Fe ? (gr(e, t, u), yn(e, t, u)) : (ye && p && Iu(t), t.flags |= 1, ot(e, t, l, u), t.child);
  }
  function Rd(e, t, a, l, u) {
    if (e === null) {
      var o = a.type;
      return typeof o == "function" && !Vu(o) && o.defaultProps === void 0 && a.compare === null ? (t.tag = 15, t.type = o, qd(
        e,
        t,
        o,
        l,
        u
      )) : (e = Pl(
        a.type,
        null,
        l,
        t,
        t.mode,
        u
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (o = e.child, !Lr(e, u)) {
      var f = o.memoizedProps;
      if (a = a.compare, a = a !== null ? a : Ki, a(f, l) && e.ref === t.ref)
        return yn(e, t, u);
    }
    return t.flags |= 1, e = fn(o, l), e.ref = t.ref, e.return = t, t.child = e;
  }
  function qd(e, t, a, l, u) {
    if (e !== null) {
      var o = e.memoizedProps;
      if (Ki(o, l) && e.ref === t.ref)
        if (Fe = !1, t.pendingProps = l = o, Lr(e, u))
          (e.flags & 131072) !== 0 && (Fe = !0);
        else
          return t.lanes = e.lanes, yn(e, t, u);
    }
    return Ur(
      e,
      t,
      a,
      l,
      u
    );
  }
  function Ud(e, t, a, l) {
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
        return Zd(
          e,
          t,
          o,
          a,
          l
        );
      }
      if ((a & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && as(
          t,
          o !== null ? o.cachePool : null
        ), o !== null ? Hf(t, o) : dr(), kf(t);
      else
        return l = t.lanes = 536870912, Zd(
          e,
          t,
          o !== null ? o.baseLanes | a : a,
          a,
          l
        );
    } else
      o !== null ? (as(t, o.cachePool), Hf(t, o), Ln(), t.memoizedState = null) : (e !== null && as(t, null), dr(), Ln());
    return ot(e, t, u, a), t.child;
  }
  function ul(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function Zd(e, t, a, l, u) {
    var o = sr();
    return o = o === null ? null : { parent: Ve._currentValue, pool: o }, t.memoizedState = {
      baseLanes: a,
      cachePool: o
    }, e !== null && as(t, null), dr(), kf(t), e !== null && ti(e, t, l, !0), t.childLanes = u, null;
  }
  function bs(e, t) {
    return t = Ss(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function Qd(e, t, a) {
    return wa(t, e.child, null, a), e = bs(t, t.pendingProps), e.flags |= 2, Ct(t), t.memoizedState = null, e;
  }
  function Dy(e, t, a) {
    var l = t.pendingProps, u = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (ye) {
        if (l.mode === "hidden")
          return e = bs(t, l), t.lanes = 536870912, ul(null, e);
        if (mr(t), (e = qe) ? (e = Fh(
          e,
          Bt
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: qn !== null ? { id: nn, overflow: an } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = Sf(e), a.return = t, t.child = a, ut = t, qe = null)) : e = null, e === null) throw Zn(t);
        return t.lanes = 536870912, null;
      }
      return bs(t, l);
    }
    var o = e.memoizedState;
    if (o !== null) {
      var f = o.dehydrated;
      if (mr(t), u)
        if (t.flags & 256)
          t.flags &= -257, t = Qd(
            e,
            t,
            a
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(r(558));
      else if (Fe || ti(e, t, a, !1), u = (a & e.childLanes) !== 0, Fe || u) {
        if (l = De, l !== null && (f = Tc(l, a), f !== 0 && f !== o.retryLane))
          throw o.retryLane = f, pa(e, f), wt(l, e, f), qr;
        Cs(), t = Qd(
          e,
          t,
          a
        );
      } else
        e = o.treeContext, qe = Lt(f.nextSibling), ut = t, ye = !0, Un = null, Bt = !1, e !== null && jf(t, e), t = bs(t, l), t.flags |= 4096;
      return t;
    }
    return e = fn(e.child, {
      mode: l.mode,
      children: l.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function _s(e, t) {
    var a = t.ref;
    if (a === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof a != "function" && typeof a != "object")
        throw Error(r(284));
      (e === null || e.ref !== a) && (t.flags |= 4194816);
    }
  }
  function Ur(e, t, a, l, u) {
    return ba(t), a = vr(
      e,
      t,
      a,
      l,
      void 0,
      u
    ), l = yr(), e !== null && !Fe ? (gr(e, t, u), yn(e, t, u)) : (ye && l && Iu(t), t.flags |= 1, ot(e, t, a, u), t.child);
  }
  function Hd(e, t, a, l, u, o) {
    return ba(t), t.updateQueue = null, a = $f(
      t,
      l,
      a,
      u
    ), Bf(e), l = yr(), e !== null && !Fe ? (gr(e, t, o), yn(e, t, o)) : (ye && l && Iu(t), t.flags |= 1, ot(e, t, a, o), t.child);
  }
  function kd(e, t, a, l, u) {
    if (ba(t), t.stateNode === null) {
      var o = Ia, f = a.contextType;
      typeof f == "object" && f !== null && (o = rt(f)), o = new a(l, o), t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, o.updater = Dr, t.stateNode = o, o._reactInternals = t, o = t.stateNode, o.props = l, o.state = t.memoizedState, o.refs = {}, rr(t), f = a.contextType, o.context = typeof f == "object" && f !== null ? rt(f) : Ia, o.state = t.memoizedState, f = a.getDerivedStateFromProps, typeof f == "function" && (Mr(
        t,
        a,
        f,
        l
      ), o.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (f = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), f !== o.state && Dr.enqueueReplaceState(o, o.state, null), nl(t, l, o, u), tl(), o.state = t.memoizedState), typeof o.componentDidMount == "function" && (t.flags |= 4194308), l = !0;
    } else if (e === null) {
      o = t.stateNode;
      var p = t.memoizedProps, b = xa(a, p);
      o.props = b;
      var T = o.context, D = a.contextType;
      f = Ia, typeof D == "object" && D !== null && (f = rt(D));
      var Q = a.getDerivedStateFromProps;
      D = typeof Q == "function" || typeof o.getSnapshotBeforeUpdate == "function", p = t.pendingProps !== p, D || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (p || T !== f) && Ed(
        t,
        o,
        l,
        f
      ), Hn = !1;
      var A = t.memoizedState;
      o.state = A, nl(t, l, o, u), tl(), T = t.memoizedState, p || A !== T || Hn ? (typeof Q == "function" && (Mr(
        t,
        a,
        Q,
        l
      ), T = t.memoizedState), (b = Hn || xd(
        t,
        a,
        b,
        l,
        A,
        T,
        f
      )) ? (D || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = l, t.memoizedState = T), o.props = l, o.state = T, o.context = f, l = b) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), l = !1);
    } else {
      o = t.stateNode, or(e, t), f = t.memoizedProps, D = xa(a, f), o.props = D, Q = t.pendingProps, A = o.context, T = a.contextType, b = Ia, typeof T == "object" && T !== null && (b = rt(T)), p = a.getDerivedStateFromProps, (T = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (f !== Q || A !== b) && Ed(
        t,
        o,
        l,
        b
      ), Hn = !1, A = t.memoizedState, o.state = A, nl(t, l, o, u), tl();
      var N = t.memoizedState;
      f !== Q || A !== N || Hn || e !== null && e.dependencies !== null && ts(e.dependencies) ? (typeof p == "function" && (Mr(
        t,
        a,
        p,
        l
      ), N = t.memoizedState), (D = Hn || xd(
        t,
        a,
        D,
        l,
        A,
        N,
        b
      ) || e !== null && e.dependencies !== null && ts(e.dependencies)) ? (T || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(l, N, b), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(
        l,
        N,
        b
      )), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || f === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), t.memoizedProps = l, t.memoizedState = N), o.props = l, o.state = N, o.context = b, l = D) : (typeof o.componentDidUpdate != "function" || f === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), l = !1);
    }
    return o = l, _s(e, t), l = (t.flags & 128) !== 0, o || l ? (o = t.stateNode, a = l && typeof a.getDerivedStateFromError != "function" ? null : o.render(), t.flags |= 1, e !== null && l ? (t.child = wa(
      t,
      e.child,
      null,
      u
    ), t.child = wa(
      t,
      null,
      a,
      u
    )) : ot(e, t, a, u), t.memoizedState = o.state, e = t.child) : e = yn(
      e,
      t,
      u
    ), e;
  }
  function Bd(e, t, a, l) {
    return ya(), t.flags |= 256, ot(e, t, a, l), t.child;
  }
  var Zr = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Qr(e) {
    return { baseLanes: e, cachePool: Cf() };
  }
  function Hr(e, t, a) {
    return e = e !== null ? e.childLanes & ~a : 0, t && (e |= Mt), e;
  }
  function $d(e, t, a) {
    var l = t.pendingProps, u = !1, o = (t.flags & 128) !== 0, f;
    if ((f = o) || (f = e !== null && e.memoizedState === null ? !1 : (Ye.current & 2) !== 0), f && (u = !0, t.flags &= -129), f = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (ye) {
        if (u ? $n(t) : Ln(), (e = qe) ? (e = Fh(
          e,
          Bt
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: qn !== null ? { id: nn, overflow: an } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = Sf(e), a.return = t, t.child = a, ut = t, qe = null)) : e = null, e === null) throw Zn(t);
        return zo(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var p = l.children;
      return l = l.fallback, u ? (Ln(), u = t.mode, p = Ss(
        { mode: "hidden", children: p },
        u
      ), l = va(
        l,
        u,
        a,
        null
      ), p.return = t, l.return = t, p.sibling = l, t.child = p, l = t.child, l.memoizedState = Qr(a), l.childLanes = Hr(
        e,
        f,
        a
      ), t.memoizedState = Zr, ul(null, l)) : ($n(t), kr(t, p));
    }
    var b = e.memoizedState;
    if (b !== null && (p = b.dehydrated, p !== null)) {
      if (o)
        t.flags & 256 ? ($n(t), t.flags &= -257, t = Br(
          e,
          t,
          a
        )) : t.memoizedState !== null ? (Ln(), t.child = e.child, t.flags |= 128, t = null) : (Ln(), p = l.fallback, u = t.mode, l = Ss(
          { mode: "visible", children: l.children },
          u
        ), p = va(
          p,
          u,
          a,
          null
        ), p.flags |= 2, l.return = t, p.return = t, l.sibling = p, t.child = l, wa(
          t,
          e.child,
          null,
          a
        ), l = t.child, l.memoizedState = Qr(a), l.childLanes = Hr(
          e,
          f,
          a
        ), t.memoizedState = Zr, t = ul(null, l));
      else if ($n(t), zo(p)) {
        if (f = p.nextSibling && p.nextSibling.dataset, f) var T = f.dgst;
        f = T, l = Error(r(419)), l.stack = "", l.digest = f, Ji({ value: l, source: null, stack: null }), t = Br(
          e,
          t,
          a
        );
      } else if (Fe || ti(e, t, a, !1), f = (a & e.childLanes) !== 0, Fe || f) {
        if (f = De, f !== null && (l = Tc(f, a), l !== 0 && l !== b.retryLane))
          throw b.retryLane = l, pa(e, l), wt(f, e, l), qr;
        So(p) || Cs(), t = Br(
          e,
          t,
          a
        );
      } else
        So(p) ? (t.flags |= 192, t.child = e.child, t = null) : (e = b.treeContext, qe = Lt(
          p.nextSibling
        ), ut = t, ye = !0, Un = null, Bt = !1, e !== null && jf(t, e), t = kr(
          t,
          l.children
        ), t.flags |= 4096);
      return t;
    }
    return u ? (Ln(), p = l.fallback, u = t.mode, b = e.child, T = b.sibling, l = fn(b, {
      mode: "hidden",
      children: l.children
    }), l.subtreeFlags = b.subtreeFlags & 65011712, T !== null ? p = fn(
      T,
      p
    ) : (p = va(
      p,
      u,
      a,
      null
    ), p.flags |= 2), p.return = t, l.return = t, l.sibling = p, t.child = l, ul(null, l), l = t.child, p = e.child.memoizedState, p === null ? p = Qr(a) : (u = p.cachePool, u !== null ? (b = Ve._currentValue, u = u.parent !== b ? { parent: b, pool: b } : u) : u = Cf(), p = {
      baseLanes: p.baseLanes | a,
      cachePool: u
    }), l.memoizedState = p, l.childLanes = Hr(
      e,
      f,
      a
    ), t.memoizedState = Zr, ul(e.child, l)) : ($n(t), a = e.child, e = a.sibling, a = fn(a, {
      mode: "visible",
      children: l.children
    }), a.return = t, a.sibling = null, e !== null && (f = t.deletions, f === null ? (t.deletions = [e], t.flags |= 16) : f.push(e)), t.child = a, t.memoizedState = null, a);
  }
  function kr(e, t) {
    return t = Ss(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function Ss(e, t) {
    return e = At(22, e, null, t), e.lanes = 0, e;
  }
  function Br(e, t, a) {
    return wa(t, e.child, null, a), e = kr(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Ld(e, t, a) {
    e.lanes |= t;
    var l = e.alternate;
    l !== null && (l.lanes |= t), nr(e.return, t, a);
  }
  function $r(e, t, a, l, u, o) {
    var f = e.memoizedState;
    f === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: l,
      tail: a,
      tailMode: u,
      treeForkCount: o
    } : (f.isBackwards = t, f.rendering = null, f.renderingStartTime = 0, f.last = l, f.tail = a, f.tailMode = u, f.treeForkCount = o);
  }
  function Gd(e, t, a) {
    var l = t.pendingProps, u = l.revealOrder, o = l.tail;
    l = l.children;
    var f = Ye.current, p = (f & 2) !== 0;
    if (p ? (f = f & 1 | 2, t.flags |= 128) : f &= 1, V(Ye, f), ot(e, t, l, a), l = ye ? Vi : 0, !p && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Ld(e, a, t);
        else if (e.tag === 19)
          Ld(e, a, t);
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
          e = a.alternate, e !== null && os(e) === null && (u = a), a = a.sibling;
        a = u, a === null ? (u = t.child, t.child = null) : (u = a.sibling, a.sibling = null), $r(
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
          if (e = u.alternate, e !== null && os(e) === null) {
            t.child = u;
            break;
          }
          e = u.sibling, u.sibling = a, a = u, u = e;
        }
        $r(
          t,
          !0,
          a,
          null,
          o,
          l
        );
        break;
      case "together":
        $r(
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
  function yn(e, t, a) {
    if (e !== null && (t.dependencies = e.dependencies), Kn |= t.lanes, (a & t.childLanes) === 0)
      if (e !== null) {
        if (ti(
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
      for (e = t.child, a = fn(e, e.pendingProps), t.child = a, a.return = t; e.sibling !== null; )
        e = e.sibling, a = a.sibling = fn(e, e.pendingProps), a.return = t;
      a.sibling = null;
    }
    return t.child;
  }
  function Lr(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && ts(e)));
  }
  function Ry(e, t, a) {
    switch (t.tag) {
      case 3:
        at(t, t.stateNode.containerInfo), Qn(t, Ve, e.memoizedState.cache), ya();
        break;
      case 27:
      case 5:
        Nn(t);
        break;
      case 4:
        at(t, t.stateNode.containerInfo);
        break;
      case 10:
        Qn(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, mr(t), null;
        break;
      case 13:
        var l = t.memoizedState;
        if (l !== null)
          return l.dehydrated !== null ? ($n(t), t.flags |= 128, null) : (a & t.child.childLanes) !== 0 ? $d(e, t, a) : ($n(t), e = yn(
            e,
            t,
            a
          ), e !== null ? e.sibling : null);
        $n(t);
        break;
      case 19:
        var u = (e.flags & 128) !== 0;
        if (l = (a & t.childLanes) !== 0, l || (ti(
          e,
          t,
          a,
          !1
        ), l = (a & t.childLanes) !== 0), u) {
          if (l)
            return Gd(
              e,
              t,
              a
            );
          t.flags |= 128;
        }
        if (u = t.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), V(Ye, Ye.current), l) break;
        return null;
      case 22:
        return t.lanes = 0, Ud(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        Qn(t, Ve, e.memoizedState.cache);
    }
    return yn(e, t, a);
  }
  function Yd(e, t, a) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        Fe = !0;
      else {
        if (!Lr(e, a) && (t.flags & 128) === 0)
          return Fe = !1, Ry(
            e,
            t,
            a
          );
        Fe = (e.flags & 131072) !== 0;
      }
    else
      Fe = !1, ye && (t.flags & 1048576) !== 0 && wf(t, Vi, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var l = t.pendingProps;
          if (e = Sa(t.elementType), t.type = e, typeof e == "function")
            Vu(e) ? (l = xa(e, l), t.tag = 1, t = kd(
              null,
              t,
              e,
              l,
              a
            )) : (t.tag = 0, t = Ur(
              null,
              t,
              e,
              l,
              a
            ));
          else {
            if (e != null) {
              var u = e.$$typeof;
              if (u === G) {
                t.tag = 11, t = Dd(
                  null,
                  t,
                  e,
                  l,
                  a
                );
                break e;
              } else if (u === Y) {
                t.tag = 14, t = Rd(
                  null,
                  t,
                  e,
                  l,
                  a
                );
                break e;
              }
            }
            throw t = Xe(e) || e, Error(r(306, t, ""));
          }
        }
        return t;
      case 0:
        return Ur(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 1:
        return l = t.type, u = xa(
          l,
          t.pendingProps
        ), kd(
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
          u = o.element, or(e, t), nl(t, l, null, a);
          var f = t.memoizedState;
          if (l = f.cache, Qn(t, Ve, l), l !== o.cache && ar(
            t,
            [Ve],
            a,
            !0
          ), tl(), l = f.element, o.isDehydrated)
            if (o = {
              element: l,
              isDehydrated: !1,
              cache: f.cache
            }, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
              t = Bd(
                e,
                t,
                l,
                a
              );
              break e;
            } else if (l !== u) {
              u = Qt(
                Error(r(424)),
                t
              ), Ji(u), t = Bd(
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
              for (qe = Lt(e.firstChild), ut = t, ye = !0, Un = null, Bt = !0, a = Uf(
                t,
                null,
                l,
                a
              ), t.child = a; a; )
                a.flags = a.flags & -3 | 4096, a = a.sibling;
            }
          else {
            if (ya(), l === u) {
              t = yn(
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
        return _s(e, t), e === null ? (a = nm(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = a : ye || (a = t.type, e = t.pendingProps, l = Zs(
          re.current
        ).createElement(a), l[st] = t, l[yt] = e, ct(l, a, e), it(l), t.stateNode = l) : t.memoizedState = nm(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return Nn(t), e === null && ye && (l = t.stateNode = Ph(
          t.type,
          t.pendingProps,
          re.current
        ), ut = t, Bt = !0, u = qe, In(t.type) ? (wo = u, qe = Lt(l.firstChild)) : qe = u), ot(
          e,
          t,
          t.pendingProps.children,
          a
        ), _s(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && ye && ((u = l = qe) && (l = cg(
          l,
          t.type,
          t.pendingProps,
          Bt
        ), l !== null ? (t.stateNode = l, ut = t, qe = Lt(l.firstChild), Bt = !1, u = !0) : u = !1), u || Zn(t)), Nn(t), u = t.type, o = t.pendingProps, f = e !== null ? e.memoizedProps : null, l = o.children, go(u, o) ? l = null : f !== null && go(u, f) && (t.flags |= 32), t.memoizedState !== null && (u = vr(
          e,
          t,
          xy,
          null,
          null,
          a
        ), zl._currentValue = u), _s(e, t), ot(e, t, l, a), t.child;
      case 6:
        return e === null && ye && ((e = a = qe) && (a = fg(
          a,
          t.pendingProps,
          Bt
        ), a !== null ? (t.stateNode = a, ut = t, qe = null, e = !0) : e = !1), e || Zn(t)), null;
      case 13:
        return $d(e, t, a);
      case 4:
        return at(
          t,
          t.stateNode.containerInfo
        ), l = t.pendingProps, e === null ? t.child = wa(
          t,
          null,
          l,
          a
        ) : ot(e, t, l, a), t.child;
      case 11:
        return Dd(
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
        return l = t.pendingProps, Qn(t, t.type, l.value), ot(e, t, l.children, a), t.child;
      case 9:
        return u = t.type._context, l = t.pendingProps.children, ba(t), u = rt(u), l = l(u), t.flags |= 1, ot(e, t, l, a), t.child;
      case 14:
        return Rd(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 15:
        return qd(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 19:
        return Gd(e, t, a);
      case 31:
        return Dy(e, t, a);
      case 22:
        return Ud(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        return ba(t), l = rt(Ve), e === null ? (u = sr(), u === null && (u = De, o = ir(), u.pooledCache = o, o.refCount++, o !== null && (u.pooledCacheLanes |= a), u = o), t.memoizedState = { parent: l, cache: u }, rr(t), Qn(t, Ve, u)) : ((e.lanes & a) !== 0 && (or(e, t), nl(t, null, null, a), tl()), u = e.memoizedState, o = t.memoizedState, u.parent !== l ? (u = { parent: l, cache: l }, t.memoizedState = u, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = u), Qn(t, Ve, l)) : (l = o.cache, Qn(t, Ve, l), l !== u.cache && ar(
          t,
          [Ve],
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
  function gn(e) {
    e.flags |= 4;
  }
  function Gr(e, t, a, l, u) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (u & 335544128) === u)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (gh()) e.flags |= 8192;
        else
          throw za = ls, ur;
    } else e.flags &= -16777217;
  }
  function Kd(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !um(t))
      if (gh()) e.flags |= 8192;
      else
        throw za = ls, ur;
  }
  function zs(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? jc() : 536870912, e.lanes |= t, hi |= t);
  }
  function rl(e, t) {
    if (!ye)
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
  function Ue(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, a = 0, l = 0;
    if (t)
      for (var u = e.child; u !== null; )
        a |= u.lanes | u.childLanes, l |= u.subtreeFlags & 65011712, l |= u.flags & 65011712, u.return = e, u = u.sibling;
    else
      for (u = e.child; u !== null; )
        a |= u.lanes | u.childLanes, l |= u.subtreeFlags, l |= u.flags, u.return = e, u = u.sibling;
    return e.subtreeFlags |= l, e.childLanes = a, t;
  }
  function qy(e, t, a) {
    var l = t.pendingProps;
    switch (Wu(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Ue(t), null;
      case 1:
        return Ue(t), null;
      case 3:
        return a = t.stateNode, l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), mn(Ve), Ze(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (e === null || e.child === null) && (ei(t) ? gn(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, er())), Ue(t), null;
      case 26:
        var u = t.type, o = t.memoizedState;
        return e === null ? (gn(t), o !== null ? (Ue(t), Kd(t, o)) : (Ue(t), Gr(
          t,
          u,
          null,
          l,
          a
        ))) : o ? o !== e.memoizedState ? (gn(t), Ue(t), Kd(t, o)) : (Ue(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== l && gn(t), Ue(t), Gr(
          t,
          u,
          e,
          l,
          a
        )), null;
      case 27:
        if (Ra(t), a = re.current, u = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && gn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return Ue(t), null;
          }
          e = J.current, ei(t) ? xf(t) : (e = Ph(u, l, a), t.stateNode = e, gn(t));
        }
        return Ue(t), null;
      case 5:
        if (Ra(t), u = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && gn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return Ue(t), null;
          }
          if (o = J.current, ei(t))
            xf(t);
          else {
            var f = Zs(
              re.current
            );
            switch (o) {
              case 1:
                o = f.createElementNS(
                  "http://www.w3.org/2000/svg",
                  u
                );
                break;
              case 2:
                o = f.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  u
                );
                break;
              default:
                switch (u) {
                  case "svg":
                    o = f.createElementNS(
                      "http://www.w3.org/2000/svg",
                      u
                    );
                    break;
                  case "math":
                    o = f.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      u
                    );
                    break;
                  case "script":
                    o = f.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(
                      o.firstChild
                    );
                    break;
                  case "select":
                    o = typeof l.is == "string" ? f.createElement("select", {
                      is: l.is
                    }) : f.createElement("select"), l.multiple ? o.multiple = !0 : l.size && (o.size = l.size);
                    break;
                  default:
                    o = typeof l.is == "string" ? f.createElement(u, { is: l.is }) : f.createElement(u);
                }
            }
            o[st] = t, o[yt] = l;
            e: for (f = t.child; f !== null; ) {
              if (f.tag === 5 || f.tag === 6)
                o.appendChild(f.stateNode);
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
            l && gn(t);
          }
        }
        return Ue(t), Gr(
          t,
          t.type,
          e === null ? null : e.memoizedProps,
          t.pendingProps,
          a
        ), null;
      case 6:
        if (e && t.stateNode != null)
          e.memoizedProps !== l && gn(t);
        else {
          if (typeof l != "string" && t.stateNode === null)
            throw Error(r(166));
          if (e = re.current, ei(t)) {
            if (e = t.stateNode, a = t.memoizedProps, l = null, u = ut, u !== null)
              switch (u.tag) {
                case 27:
                case 5:
                  l = u.memoizedProps;
              }
            e[st] = t, e = !!(e.nodeValue === a || l !== null && l.suppressHydrationWarning === !0 || $h(e.nodeValue, a)), e || Zn(t, !0);
          } else
            e = Zs(e).createTextNode(
              l
            ), e[st] = t, t.stateNode = e;
        }
        return Ue(t), null;
      case 31:
        if (a = t.memoizedState, e === null || e.memoizedState !== null) {
          if (l = ei(t), a !== null) {
            if (e === null) {
              if (!l) throw Error(r(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(557));
              e[st] = t;
            } else
              ya(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Ue(t), e = !1;
          } else
            a = er(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), e = !0;
          if (!e)
            return t.flags & 256 ? (Ct(t), t) : (Ct(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(r(558));
        }
        return Ue(t), null;
      case 13:
        if (l = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (u = ei(t), l !== null && l.dehydrated !== null) {
            if (e === null) {
              if (!u) throw Error(r(318));
              if (u = t.memoizedState, u = u !== null ? u.dehydrated : null, !u) throw Error(r(317));
              u[st] = t;
            } else
              ya(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Ue(t), u = !1;
          } else
            u = er(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = u), u = !0;
          if (!u)
            return t.flags & 256 ? (Ct(t), t) : (Ct(t), null);
        }
        return Ct(t), (t.flags & 128) !== 0 ? (t.lanes = a, t) : (a = l !== null, e = e !== null && e.memoizedState !== null, a && (l = t.child, u = null, l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (u = l.alternate.memoizedState.cachePool.pool), o = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (o = l.memoizedState.cachePool.pool), o !== u && (l.flags |= 2048)), a !== e && a && (t.child.flags |= 8192), zs(t, t.updateQueue), Ue(t), null);
      case 4:
        return Ze(), e === null && ho(t.stateNode.containerInfo), Ue(t), null;
      case 10:
        return mn(t.type), Ue(t), null;
      case 19:
        if (U(Ye), l = t.memoizedState, l === null) return Ue(t), null;
        if (u = (t.flags & 128) !== 0, o = l.rendering, o === null)
          if (u) rl(l, !1);
          else {
            if (Ge !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (o = os(e), o !== null) {
                  for (t.flags |= 128, rl(l, !1), e = o.updateQueue, t.updateQueue = e, zs(t, e), t.subtreeFlags = 0, e = a, a = t.child; a !== null; )
                    _f(a, e), a = a.sibling;
                  return V(
                    Ye,
                    Ye.current & 1 | 2
                  ), ye && dn(t, l.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            l.tail !== null && k() > Ts && (t.flags |= 128, u = !0, rl(l, !1), t.lanes = 4194304);
          }
        else {
          if (!u)
            if (e = os(o), e !== null) {
              if (t.flags |= 128, u = !0, e = e.updateQueue, t.updateQueue = e, zs(t, e), rl(l, !0), l.tail === null && l.tailMode === "hidden" && !o.alternate && !ye)
                return Ue(t), null;
            } else
              2 * k() - l.renderingStartTime > Ts && a !== 536870912 && (t.flags |= 128, u = !0, rl(l, !1), t.lanes = 4194304);
          l.isBackwards ? (o.sibling = t.child, t.child = o) : (e = l.last, e !== null ? e.sibling = o : t.child = o, l.last = o);
        }
        return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = k(), e.sibling = null, a = Ye.current, V(
          Ye,
          u ? a & 1 | 2 : a & 1
        ), ye && dn(t, l.treeForkCount), e) : (Ue(t), null);
      case 22:
      case 23:
        return Ct(t), hr(), l = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192), l ? (a & 536870912) !== 0 && (t.flags & 128) === 0 && (Ue(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Ue(t), a = t.updateQueue, a !== null && zs(t, a.retryQueue), a = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== a && (t.flags |= 2048), e !== null && U(_a), null;
      case 24:
        return a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), mn(Ve), Ue(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(r(156, t.tag));
  }
  function Uy(e, t) {
    switch (Wu(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return mn(Ve), Ze(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return Ra(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Ct(t), t.alternate === null)
            throw Error(r(340));
          ya();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Ct(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(r(340));
          ya();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return U(Ye), null;
      case 4:
        return Ze(), null;
      case 10:
        return mn(t.type), null;
      case 22:
      case 23:
        return Ct(t), hr(), e !== null && U(_a), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return mn(Ve), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Xd(e, t) {
    switch (Wu(t), t.tag) {
      case 3:
        mn(Ve), Ze();
        break;
      case 26:
      case 27:
      case 5:
        Ra(t);
        break;
      case 4:
        Ze();
        break;
      case 31:
        t.memoizedState !== null && Ct(t);
        break;
      case 13:
        Ct(t);
        break;
      case 19:
        U(Ye);
        break;
      case 10:
        mn(t.type);
        break;
      case 22:
      case 23:
        Ct(t), hr(), e !== null && U(_a);
        break;
      case 24:
        mn(Ve);
    }
  }
  function ol(e, t) {
    try {
      var a = t.updateQueue, l = a !== null ? a.lastEffect : null;
      if (l !== null) {
        var u = l.next;
        a = u;
        do {
          if ((a.tag & e) === e) {
            l = void 0;
            var o = a.create, f = a.inst;
            l = o(), f.destroy = l;
          }
          a = a.next;
        } while (a !== u);
      }
    } catch (p) {
      Ae(t, t.return, p);
    }
  }
  function Gn(e, t, a) {
    try {
      var l = t.updateQueue, u = l !== null ? l.lastEffect : null;
      if (u !== null) {
        var o = u.next;
        l = o;
        do {
          if ((l.tag & e) === e) {
            var f = l.inst, p = f.destroy;
            if (p !== void 0) {
              f.destroy = void 0, u = t;
              var b = a, T = p;
              try {
                T();
              } catch (D) {
                Ae(
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
      Ae(t, t.return, D);
    }
  }
  function Vd(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var a = e.stateNode;
      try {
        Qf(t, a);
      } catch (l) {
        Ae(e, e.return, l);
      }
    }
  }
  function Jd(e, t, a) {
    a.props = xa(
      e.type,
      e.memoizedProps
    ), a.state = e.memoizedState;
    try {
      a.componentWillUnmount();
    } catch (l) {
      Ae(e, t, l);
    }
  }
  function cl(e, t) {
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
      Ae(e, t, u);
    }
  }
  function ln(e, t) {
    var a = e.ref, l = e.refCleanup;
    if (a !== null)
      if (typeof l == "function")
        try {
          l();
        } catch (u) {
          Ae(e, t, u);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof a == "function")
        try {
          a(null);
        } catch (u) {
          Ae(e, t, u);
        }
      else a.current = null;
  }
  function Fd(e) {
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
      Ae(e, e.return, u);
    }
  }
  function Yr(e, t, a) {
    try {
      var l = e.stateNode;
      ig(l, e.type, a, t), l[yt] = t;
    } catch (u) {
      Ae(e, e.return, u);
    }
  }
  function Id(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && In(e.type) || e.tag === 4;
  }
  function Kr(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Id(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && In(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Xr(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(e, t) : (t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, t.appendChild(e), a = a._reactRootContainer, a != null || t.onclick !== null || (t.onclick = on));
    else if (l !== 4 && (l === 27 && In(e.type) && (a = e.stateNode, t = null), e = e.child, e !== null))
      for (Xr(e, t, a), e = e.sibling; e !== null; )
        Xr(e, t, a), e = e.sibling;
  }
  function ws(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? a.insertBefore(e, t) : a.appendChild(e);
    else if (l !== 4 && (l === 27 && In(e.type) && (a = e.stateNode), e = e.child, e !== null))
      for (ws(e, t, a), e = e.sibling; e !== null; )
        ws(e, t, a), e = e.sibling;
  }
  function Wd(e) {
    var t = e.stateNode, a = e.memoizedProps;
    try {
      for (var l = e.type, u = t.attributes; u.length; )
        t.removeAttributeNode(u[0]);
      ct(t, l, a), t[st] = e, t[yt] = a;
    } catch (o) {
      Ae(e, e.return, o);
    }
  }
  var bn = !1, Ie = !1, Vr = !1, Pd = typeof WeakSet == "function" ? WeakSet : Set, lt = null;
  function Zy(e, t) {
    if (e = e.containerInfo, vo = Gs, e = ff(e), Bu(e)) {
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
            var f = 0, p = -1, b = -1, T = 0, D = 0, Q = e, A = null;
            t: for (; ; ) {
              for (var N; Q !== a || u !== 0 && Q.nodeType !== 3 || (p = f + u), Q !== o || l !== 0 && Q.nodeType !== 3 || (b = f + l), Q.nodeType === 3 && (f += Q.nodeValue.length), (N = Q.firstChild) !== null; )
                A = Q, Q = N;
              for (; ; ) {
                if (Q === e) break t;
                if (A === a && ++T === u && (p = f), A === o && ++D === l && (b = f), (N = Q.nextSibling) !== null) break;
                Q = A, A = Q.parentNode;
              }
              Q = N;
            }
            a = p === -1 || b === -1 ? null : { start: p, end: b };
          } else a = null;
        }
      a = a || { start: 0, end: 0 };
    } else a = null;
    for (yo = { focusedElem: e, selectionRange: a }, Gs = !1, lt = t; lt !== null; )
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
                  var F = xa(
                    a.type,
                    u
                  );
                  e = l.getSnapshotBeforeUpdate(
                    F,
                    o
                  ), l.__reactInternalSnapshotBeforeUpdate = e;
                } catch (ie) {
                  Ae(
                    a,
                    a.return,
                    ie
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = t.stateNode.containerInfo, a = e.nodeType, a === 9)
                  _o(e);
                else if (a === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      _o(e);
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
  function eh(e, t, a) {
    var l = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        Sn(e, a), l & 4 && ol(5, a);
        break;
      case 1:
        if (Sn(e, a), l & 4)
          if (e = a.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (f) {
              Ae(a, a.return, f);
            }
          else {
            var u = xa(
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
            } catch (f) {
              Ae(
                a,
                a.return,
                f
              );
            }
          }
        l & 64 && Vd(a), l & 512 && cl(a, a.return);
        break;
      case 3:
        if (Sn(e, a), l & 64 && (e = a.updateQueue, e !== null)) {
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
            Qf(e, t);
          } catch (f) {
            Ae(a, a.return, f);
          }
        }
        break;
      case 27:
        t === null && l & 4 && Wd(a);
      case 26:
      case 5:
        Sn(e, a), t === null && l & 4 && Fd(a), l & 512 && cl(a, a.return);
        break;
      case 12:
        Sn(e, a);
        break;
      case 31:
        Sn(e, a), l & 4 && ah(e, a);
        break;
      case 13:
        Sn(e, a), l & 4 && ih(e, a), l & 64 && (e = a.memoizedState, e !== null && (e = e.dehydrated, e !== null && (a = Ky.bind(
          null,
          a
        ), dg(e, a))));
        break;
      case 22:
        if (l = a.memoizedState !== null || bn, !l) {
          t = t !== null && t.memoizedState !== null || Ie, u = bn;
          var o = Ie;
          bn = l, (Ie = t) && !o ? zn(
            e,
            a,
            (a.subtreeFlags & 8772) !== 0
          ) : Sn(e, a), bn = u, Ie = o;
        }
        break;
      case 30:
        break;
      default:
        Sn(e, a);
    }
  }
  function th(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, th(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ju(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var Qe = null, bt = !1;
  function _n(e, t, a) {
    for (a = a.child; a !== null; )
      nh(e, t, a), a = a.sibling;
  }
  function nh(e, t, a) {
    if (xt && typeof xt.onCommitFiberUnmount == "function")
      try {
        xt.onCommitFiberUnmount(Ri, a);
      } catch {
      }
    switch (a.tag) {
      case 26:
        Ie || ln(a, t), _n(
          e,
          t,
          a
        ), a.memoizedState ? a.memoizedState.count-- : a.stateNode && (a = a.stateNode, a.parentNode.removeChild(a));
        break;
      case 27:
        Ie || ln(a, t);
        var l = Qe, u = bt;
        In(a.type) && (Qe = a.stateNode, bt = !1), _n(
          e,
          t,
          a
        ), bl(a.stateNode), Qe = l, bt = u;
        break;
      case 5:
        Ie || ln(a, t);
      case 6:
        if (l = Qe, u = bt, Qe = null, _n(
          e,
          t,
          a
        ), Qe = l, bt = u, Qe !== null)
          if (bt)
            try {
              (Qe.nodeType === 9 ? Qe.body : Qe.nodeName === "HTML" ? Qe.ownerDocument.body : Qe).removeChild(a.stateNode);
            } catch (o) {
              Ae(
                a,
                t,
                o
              );
            }
          else
            try {
              Qe.removeChild(a.stateNode);
            } catch (o) {
              Ae(
                a,
                t,
                o
              );
            }
        break;
      case 18:
        Qe !== null && (bt ? (e = Qe, Vh(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          a.stateNode
        ), Si(e)) : Vh(Qe, a.stateNode));
        break;
      case 4:
        l = Qe, u = bt, Qe = a.stateNode.containerInfo, bt = !0, _n(
          e,
          t,
          a
        ), Qe = l, bt = u;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Gn(2, a, t), Ie || Gn(4, a, t), _n(
          e,
          t,
          a
        );
        break;
      case 1:
        Ie || (ln(a, t), l = a.stateNode, typeof l.componentWillUnmount == "function" && Jd(
          a,
          t,
          l
        )), _n(
          e,
          t,
          a
        );
        break;
      case 21:
        _n(
          e,
          t,
          a
        );
        break;
      case 22:
        Ie = (l = Ie) || a.memoizedState !== null, _n(
          e,
          t,
          a
        ), Ie = l;
        break;
      default:
        _n(
          e,
          t,
          a
        );
    }
  }
  function ah(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        Si(e);
      } catch (a) {
        Ae(t, t.return, a);
      }
    }
  }
  function ih(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        Si(e);
      } catch (a) {
        Ae(t, t.return, a);
      }
  }
  function Qy(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new Pd()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Pd()), t;
      default:
        throw Error(r(435, e.tag));
    }
  }
  function js(e, t) {
    var a = Qy(e);
    t.forEach(function(l) {
      if (!a.has(l)) {
        a.add(l);
        var u = Xy.bind(null, e, l);
        l.then(u, u);
      }
    });
  }
  function _t(e, t) {
    var a = t.deletions;
    if (a !== null)
      for (var l = 0; l < a.length; l++) {
        var u = a[l], o = e, f = t, p = f;
        e: for (; p !== null; ) {
          switch (p.tag) {
            case 27:
              if (In(p.type)) {
                Qe = p.stateNode, bt = !1;
                break e;
              }
              break;
            case 5:
              Qe = p.stateNode, bt = !1;
              break e;
            case 3:
            case 4:
              Qe = p.stateNode.containerInfo, bt = !0;
              break e;
          }
          p = p.return;
        }
        if (Qe === null) throw Error(r(160));
        nh(o, f, u), Qe = null, bt = !1, o = u.alternate, o !== null && (o.return = null), u.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        lh(t, e), t = t.sibling;
  }
  var Wt = null;
  function lh(e, t) {
    var a = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        _t(t, e), St(e), l & 4 && (Gn(3, e, e.return), ol(3, e), Gn(5, e, e.return));
        break;
      case 1:
        _t(t, e), St(e), l & 512 && (Ie || a === null || ln(a, a.return)), l & 64 && bn && (e = e.updateQueue, e !== null && (l = e.callbacks, l !== null && (a = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = a === null ? l : a.concat(l))));
        break;
      case 26:
        var u = Wt;
        if (_t(t, e), St(e), l & 512 && (Ie || a === null || ln(a, a.return)), l & 4) {
          var o = a !== null ? a.memoizedState : null;
          if (l = e.memoizedState, a === null)
            if (l === null)
              if (e.stateNode === null) {
                e: {
                  l = e.type, a = e.memoizedProps, u = u.ownerDocument || u;
                  t: switch (l) {
                    case "title":
                      o = u.getElementsByTagName("title")[0], (!o || o[Zi] || o[st] || o.namespaceURI === "http://www.w3.org/2000/svg" || o.hasAttribute("itemprop")) && (o = u.createElement(l), u.head.insertBefore(
                        o,
                        u.querySelector("head > title")
                      )), ct(o, l, a), o[st] = e, it(o), l = o;
                      break e;
                    case "link":
                      var f = lm(
                        "link",
                        "href",
                        u
                      ).get(l + (a.href || ""));
                      if (f) {
                        for (var p = 0; p < f.length; p++)
                          if (o = f[p], o.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && o.getAttribute("rel") === (a.rel == null ? null : a.rel) && o.getAttribute("title") === (a.title == null ? null : a.title) && o.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                            f.splice(p, 1);
                            break t;
                          }
                      }
                      o = u.createElement(l), ct(o, l, a), u.head.appendChild(o);
                      break;
                    case "meta":
                      if (f = lm(
                        "meta",
                        "content",
                        u
                      ).get(l + (a.content || ""))) {
                        for (p = 0; p < f.length; p++)
                          if (o = f[p], o.getAttribute("content") === (a.content == null ? null : "" + a.content) && o.getAttribute("name") === (a.name == null ? null : a.name) && o.getAttribute("property") === (a.property == null ? null : a.property) && o.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && o.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                            f.splice(p, 1);
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
                sm(
                  u,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = im(
                u,
                l,
                e.memoizedProps
              );
          else
            o !== l ? (o === null ? a.stateNode !== null && (a = a.stateNode, a.parentNode.removeChild(a)) : o.count--, l === null ? sm(
              u,
              e.type,
              e.stateNode
            ) : im(
              u,
              l,
              e.memoizedProps
            )) : l === null && e.stateNode !== null && Yr(
              e,
              e.memoizedProps,
              a.memoizedProps
            );
        }
        break;
      case 27:
        _t(t, e), St(e), l & 512 && (Ie || a === null || ln(a, a.return)), a !== null && l & 4 && Yr(
          e,
          e.memoizedProps,
          a.memoizedProps
        );
        break;
      case 5:
        if (_t(t, e), St(e), l & 512 && (Ie || a === null || ln(a, a.return)), e.flags & 32) {
          u = e.stateNode;
          try {
            Ga(u, "");
          } catch (F) {
            Ae(e, e.return, F);
          }
        }
        l & 4 && e.stateNode != null && (u = e.memoizedProps, Yr(
          e,
          u,
          a !== null ? a.memoizedProps : u
        )), l & 1024 && (Vr = !0);
        break;
      case 6:
        if (_t(t, e), St(e), l & 4) {
          if (e.stateNode === null)
            throw Error(r(162));
          l = e.memoizedProps, a = e.stateNode;
          try {
            a.nodeValue = l;
          } catch (F) {
            Ae(e, e.return, F);
          }
        }
        break;
      case 3:
        if (ks = null, u = Wt, Wt = Qs(t.containerInfo), _t(t, e), Wt = u, St(e), l & 4 && a !== null && a.memoizedState.isDehydrated)
          try {
            Si(t.containerInfo);
          } catch (F) {
            Ae(e, e.return, F);
          }
        Vr && (Vr = !1, sh(e));
        break;
      case 4:
        l = Wt, Wt = Qs(
          e.stateNode.containerInfo
        ), _t(t, e), St(e), Wt = l;
        break;
      case 12:
        _t(t, e), St(e);
        break;
      case 31:
        _t(t, e), St(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, js(e, l)));
        break;
      case 13:
        _t(t, e), St(e), e.child.flags & 8192 && e.memoizedState !== null != (a !== null && a.memoizedState !== null) && (Es = k()), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, js(e, l)));
        break;
      case 22:
        u = e.memoizedState !== null;
        var b = a !== null && a.memoizedState !== null, T = bn, D = Ie;
        if (bn = T || u, Ie = D || b, _t(t, e), Ie = D, bn = T, St(e), l & 8192)
          e: for (t = e.stateNode, t._visibility = u ? t._visibility & -2 : t._visibility | 1, u && (a === null || b || bn || Ie || Ea(e)), a = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (a === null) {
                b = a = t;
                try {
                  if (o = b.stateNode, u)
                    f = o.style, typeof f.setProperty == "function" ? f.setProperty("display", "none", "important") : f.display = "none";
                  else {
                    p = b.stateNode;
                    var Q = b.memoizedProps.style, A = Q != null && Q.hasOwnProperty("display") ? Q.display : null;
                    p.style.display = A == null || typeof A == "boolean" ? "" : ("" + A).trim();
                  }
                } catch (F) {
                  Ae(b, b.return, F);
                }
              }
            } else if (t.tag === 6) {
              if (a === null) {
                b = t;
                try {
                  b.stateNode.nodeValue = u ? "" : b.memoizedProps;
                } catch (F) {
                  Ae(b, b.return, F);
                }
              }
            } else if (t.tag === 18) {
              if (a === null) {
                b = t;
                try {
                  var N = b.stateNode;
                  u ? Jh(N, !0) : Jh(b.stateNode, !1);
                } catch (F) {
                  Ae(b, b.return, F);
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
        l & 4 && (l = e.updateQueue, l !== null && (a = l.retryQueue, a !== null && (l.retryQueue = null, js(e, a))));
        break;
      case 19:
        _t(t, e), St(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, js(e, l)));
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
          if (Id(l)) {
            a = l;
            break;
          }
          l = l.return;
        }
        if (a == null) throw Error(r(160));
        switch (a.tag) {
          case 27:
            var u = a.stateNode, o = Kr(e);
            ws(e, o, u);
            break;
          case 5:
            var f = a.stateNode;
            a.flags & 32 && (Ga(f, ""), a.flags &= -33);
            var p = Kr(e);
            ws(e, p, f);
            break;
          case 3:
          case 4:
            var b = a.stateNode.containerInfo, T = Kr(e);
            Xr(
              e,
              T,
              b
            );
            break;
          default:
            throw Error(r(161));
        }
      } catch (D) {
        Ae(e, e.return, D);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function sh(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        sh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function Sn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        eh(e, t.alternate, t), t = t.sibling;
  }
  function Ea(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Gn(4, t, t.return), Ea(t);
          break;
        case 1:
          ln(t, t.return);
          var a = t.stateNode;
          typeof a.componentWillUnmount == "function" && Jd(
            t,
            t.return,
            a
          ), Ea(t);
          break;
        case 27:
          bl(t.stateNode);
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
  function zn(e, t, a) {
    for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var l = t.alternate, u = e, o = t, f = o.flags;
      switch (o.tag) {
        case 0:
        case 11:
        case 15:
          zn(
            u,
            o,
            a
          ), ol(4, o);
          break;
        case 1:
          if (zn(
            u,
            o,
            a
          ), l = o, u = l.stateNode, typeof u.componentDidMount == "function")
            try {
              u.componentDidMount();
            } catch (T) {
              Ae(l, l.return, T);
            }
          if (l = o, u = l.updateQueue, u !== null) {
            var p = l.stateNode;
            try {
              var b = u.shared.hiddenCallbacks;
              if (b !== null)
                for (u.shared.hiddenCallbacks = null, u = 0; u < b.length; u++)
                  Zf(b[u], p);
            } catch (T) {
              Ae(l, l.return, T);
            }
          }
          a && f & 64 && Vd(o), cl(o, o.return);
          break;
        case 27:
          Wd(o);
        case 26:
        case 5:
          zn(
            u,
            o,
            a
          ), a && l === null && f & 4 && Fd(o), cl(o, o.return);
          break;
        case 12:
          zn(
            u,
            o,
            a
          );
          break;
        case 31:
          zn(
            u,
            o,
            a
          ), a && f & 4 && ah(u, o);
          break;
        case 13:
          zn(
            u,
            o,
            a
          ), a && f & 4 && ih(u, o);
          break;
        case 22:
          o.memoizedState === null && zn(
            u,
            o,
            a
          ), cl(o, o.return);
          break;
        case 30:
          break;
        default:
          zn(
            u,
            o,
            a
          );
      }
      t = t.sibling;
    }
  }
  function Jr(e, t) {
    var a = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== a && (e != null && e.refCount++, a != null && Fi(a));
  }
  function Fr(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Fi(e));
  }
  function Pt(e, t, a, l) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        uh(
          e,
          t,
          a,
          l
        ), t = t.sibling;
  }
  function uh(e, t, a, l) {
    var u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        Pt(
          e,
          t,
          a,
          l
        ), u & 2048 && ol(9, t);
        break;
      case 1:
        Pt(
          e,
          t,
          a,
          l
        );
        break;
      case 3:
        Pt(
          e,
          t,
          a,
          l
        ), u & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Fi(e)));
        break;
      case 12:
        if (u & 2048) {
          Pt(
            e,
            t,
            a,
            l
          ), e = t.stateNode;
          try {
            var o = t.memoizedProps, f = o.id, p = o.onPostCommit;
            typeof p == "function" && p(
              f,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (b) {
            Ae(t, t.return, b);
          }
        } else
          Pt(
            e,
            t,
            a,
            l
          );
        break;
      case 31:
        Pt(
          e,
          t,
          a,
          l
        );
        break;
      case 13:
        Pt(
          e,
          t,
          a,
          l
        );
        break;
      case 23:
        break;
      case 22:
        o = t.stateNode, f = t.alternate, t.memoizedState !== null ? o._visibility & 2 ? Pt(
          e,
          t,
          a,
          l
        ) : fl(e, t) : o._visibility & 2 ? Pt(
          e,
          t,
          a,
          l
        ) : (o._visibility |= 2, ci(
          e,
          t,
          a,
          l,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), u & 2048 && Jr(f, t);
        break;
      case 24:
        Pt(
          e,
          t,
          a,
          l
        ), u & 2048 && Fr(t.alternate, t);
        break;
      default:
        Pt(
          e,
          t,
          a,
          l
        );
    }
  }
  function ci(e, t, a, l, u) {
    for (u = u && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var o = e, f = t, p = a, b = l, T = f.flags;
      switch (f.tag) {
        case 0:
        case 11:
        case 15:
          ci(
            o,
            f,
            p,
            b,
            u
          ), ol(8, f);
          break;
        case 23:
          break;
        case 22:
          var D = f.stateNode;
          f.memoizedState !== null ? D._visibility & 2 ? ci(
            o,
            f,
            p,
            b,
            u
          ) : fl(
            o,
            f
          ) : (D._visibility |= 2, ci(
            o,
            f,
            p,
            b,
            u
          )), u && T & 2048 && Jr(
            f.alternate,
            f
          );
          break;
        case 24:
          ci(
            o,
            f,
            p,
            b,
            u
          ), u && T & 2048 && Fr(f.alternate, f);
          break;
        default:
          ci(
            o,
            f,
            p,
            b,
            u
          );
      }
      t = t.sibling;
    }
  }
  function fl(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var a = e, l = t, u = l.flags;
        switch (l.tag) {
          case 22:
            fl(a, l), u & 2048 && Jr(
              l.alternate,
              l
            );
            break;
          case 24:
            fl(a, l), u & 2048 && Fr(l.alternate, l);
            break;
          default:
            fl(a, l);
        }
        t = t.sibling;
      }
  }
  var dl = 8192;
  function fi(e, t, a) {
    if (e.subtreeFlags & dl)
      for (e = e.child; e !== null; )
        rh(
          e,
          t,
          a
        ), e = e.sibling;
  }
  function rh(e, t, a) {
    switch (e.tag) {
      case 26:
        fi(
          e,
          t,
          a
        ), e.flags & dl && e.memoizedState !== null && jg(
          a,
          Wt,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        fi(
          e,
          t,
          a
        );
        break;
      case 3:
      case 4:
        var l = Wt;
        Wt = Qs(e.stateNode.containerInfo), fi(
          e,
          t,
          a
        ), Wt = l;
        break;
      case 22:
        e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = dl, dl = 16777216, fi(
          e,
          t,
          a
        ), dl = l) : fi(
          e,
          t,
          a
        ));
        break;
      default:
        fi(
          e,
          t,
          a
        );
    }
  }
  function oh(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function hl(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          lt = l, fh(
            l,
            e
          );
        }
      oh(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        ch(e), e = e.sibling;
  }
  function ch(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        hl(e), e.flags & 2048 && Gn(9, e, e.return);
        break;
      case 3:
        hl(e);
        break;
      case 12:
        hl(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, xs(e)) : hl(e);
        break;
      default:
        hl(e);
    }
  }
  function xs(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          lt = l, fh(
            l,
            e
          );
        }
      oh(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          Gn(8, t, t.return), xs(t);
          break;
        case 22:
          a = t.stateNode, a._visibility & 2 && (a._visibility &= -3, xs(t));
          break;
        default:
          xs(t);
      }
      e = e.sibling;
    }
  }
  function fh(e, t) {
    for (; lt !== null; ) {
      var a = lt;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          Gn(8, a, t);
          break;
        case 23:
        case 22:
          if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
            var l = a.memoizedState.cachePool.pool;
            l != null && l.refCount++;
          }
          break;
        case 24:
          Fi(a.memoizedState.cache);
      }
      if (l = a.child, l !== null) l.return = a, lt = l;
      else
        e: for (a = e; lt !== null; ) {
          l = lt;
          var u = l.sibling, o = l.return;
          if (th(l), l === a) {
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
  var Hy = {
    getCacheForType: function(e) {
      var t = rt(Ve), a = t.data.get(e);
      return a === void 0 && (a = e(), t.data.set(e, a)), a;
    },
    cacheSignal: function() {
      return rt(Ve).controller.signal;
    }
  }, ky = typeof WeakMap == "function" ? WeakMap : Map, Se = 0, De = null, de = null, pe = 0, Te = 0, Nt = null, Yn = !1, di = !1, Ir = !1, wn = 0, Ge = 0, Kn = 0, Ta = 0, Wr = 0, Mt = 0, hi = 0, ml = null, zt = null, Pr = !1, Es = 0, dh = 0, Ts = 1 / 0, As = null, Xn = null, et = 0, Vn = null, mi = null, jn = 0, eo = 0, to = null, hh = null, pl = 0, no = null;
  function Dt() {
    return (Se & 2) !== 0 && pe !== 0 ? pe & -pe : C.T !== null ? ro() : Ac();
  }
  function mh() {
    if (Mt === 0)
      if ((pe & 536870912) === 0 || ye) {
        var e = Ul;
        Ul <<= 1, (Ul & 3932160) === 0 && (Ul = 262144), Mt = e;
      } else Mt = 536870912;
    return e = Ot.current, e !== null && (e.flags |= 32), Mt;
  }
  function wt(e, t, a) {
    (e === De && (Te === 2 || Te === 9) || e.cancelPendingCommit !== null) && (pi(e, 0), Jn(
      e,
      pe,
      Mt,
      !1
    )), Ui(e, a), ((Se & 2) === 0 || e !== De) && (e === De && ((Se & 2) === 0 && (Ta |= a), Ge === 4 && Jn(
      e,
      pe,
      Mt,
      !1
    )), sn(e));
  }
  function ph(e, t, a) {
    if ((Se & 6) !== 0) throw Error(r(327));
    var l = !a && (t & 127) === 0 && (t & e.expiredLanes) === 0 || qi(e, t), u = l ? Ly(e, t) : io(e, t, !0), o = l;
    do {
      if (u === 0) {
        di && !l && Jn(e, t, 0, !1);
        break;
      } else {
        if (a = e.current.alternate, o && !By(a)) {
          u = io(e, t, !1), o = !1;
          continue;
        }
        if (u === 2) {
          if (o = t, e.errorRecoveryDisabledLanes & o)
            var f = 0;
          else
            f = e.pendingLanes & -536870913, f = f !== 0 ? f : f & 536870912 ? 536870912 : 0;
          if (f !== 0) {
            t = f;
            e: {
              var p = e;
              u = ml;
              var b = p.current.memoizedState.isDehydrated;
              if (b && (pi(p, f).flags |= 256), f = io(
                p,
                f,
                !1
              ), f !== 2) {
                if (Ir && !b) {
                  p.errorRecoveryDisabledLanes |= o, Ta |= o, u = 4;
                  break e;
                }
                o = zt, zt = u, o !== null && (zt === null ? zt = o : zt.push.apply(
                  zt,
                  o
                ));
              }
              u = f;
            }
            if (o = !1, u !== 2) continue;
          }
        }
        if (u === 1) {
          pi(e, 0), Jn(e, t, 0, !0);
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
              Jn(
                l,
                t,
                Mt,
                !Yn
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
          if ((t & 62914560) === t && (u = Es + 300 - k(), 10 < u)) {
            if (Jn(
              l,
              t,
              Mt,
              !Yn
            ), Ql(l, 0, !0) !== 0) break e;
            jn = t, l.timeoutHandle = Kh(
              vh.bind(
                null,
                l,
                a,
                zt,
                As,
                Pr,
                t,
                Mt,
                Ta,
                hi,
                Yn,
                o,
                "Throttled",
                -0,
                0
              ),
              u
            );
            break e;
          }
          vh(
            l,
            a,
            zt,
            As,
            Pr,
            t,
            Mt,
            Ta,
            hi,
            Yn,
            o,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    sn(e);
  }
  function vh(e, t, a, l, u, o, f, p, b, T, D, Q, A, N) {
    if (e.timeoutHandle = -1, Q = t.subtreeFlags, Q & 8192 || (Q & 16785408) === 16785408) {
      Q = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: on
      }, rh(
        t,
        o,
        Q
      );
      var F = (o & 62914560) === o ? Es - k() : (o & 4194048) === o ? dh - k() : 0;
      if (F = xg(
        Q,
        F
      ), F !== null) {
        jn = o, e.cancelPendingCommit = F(
          jh.bind(
            null,
            e,
            t,
            o,
            a,
            l,
            u,
            f,
            p,
            b,
            D,
            Q,
            null,
            A,
            N
          )
        ), Jn(e, o, f, !T);
        return;
      }
    }
    jh(
      e,
      t,
      o,
      a,
      l,
      u,
      f,
      p,
      b
    );
  }
  function By(e) {
    for (var t = e; ; ) {
      var a = t.tag;
      if ((a === 0 || a === 11 || a === 15) && t.flags & 16384 && (a = t.updateQueue, a !== null && (a = a.stores, a !== null)))
        for (var l = 0; l < a.length; l++) {
          var u = a[l], o = u.getSnapshot;
          u = u.value;
          try {
            if (!Tt(o(), u)) return !1;
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
  function Jn(e, t, a, l) {
    t &= ~Wr, t &= ~Ta, e.suspendedLanes |= t, e.pingedLanes &= ~t, l && (e.warmLanes |= t), l = e.expirationTimes;
    for (var u = t; 0 < u; ) {
      var o = 31 - Et(u), f = 1 << o;
      l[o] = -1, u &= ~f;
    }
    a !== 0 && xc(e, a, t);
  }
  function Os() {
    return (Se & 6) === 0 ? (vl(0), !1) : !0;
  }
  function ao() {
    if (de !== null) {
      if (Te === 0)
        var e = de.return;
      else
        e = de, hn = ga = null, br(e), li = null, Wi = 0, e = de;
      for (; e !== null; )
        Xd(e.alternate, e), e = e.return;
      de = null;
    }
  }
  function pi(e, t) {
    var a = e.timeoutHandle;
    a !== -1 && (e.timeoutHandle = -1, ug(a)), a = e.cancelPendingCommit, a !== null && (e.cancelPendingCommit = null, a()), jn = 0, ao(), De = e, de = a = fn(e.current, null), pe = t, Te = 0, Nt = null, Yn = !1, di = qi(e, t), Ir = !1, hi = Mt = Wr = Ta = Kn = Ge = 0, zt = ml = null, Pr = !1, (t & 8) !== 0 && (t |= t & 32);
    var l = e.entangledLanes;
    if (l !== 0)
      for (e = e.entanglements, l &= t; 0 < l; ) {
        var u = 31 - Et(l), o = 1 << u;
        t |= e[u], l &= ~o;
      }
    return wn = t, Fl(), a;
  }
  function yh(e, t) {
    ce = null, C.H = sl, t === ii || t === is ? (t = Df(), Te = 3) : t === ur ? (t = Df(), Te = 4) : Te = t === qr ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Nt = t, de === null && (Ge = 1, gs(
      e,
      Qt(t, e.current)
    ));
  }
  function gh() {
    var e = Ot.current;
    return e === null ? !0 : (pe & 4194048) === pe ? $t === null : (pe & 62914560) === pe || (pe & 536870912) !== 0 ? e === $t : !1;
  }
  function bh() {
    var e = C.H;
    return C.H = sl, e === null ? sl : e;
  }
  function _h() {
    var e = C.A;
    return C.A = Hy, e;
  }
  function Cs() {
    Ge = 4, Yn || (pe & 4194048) !== pe && Ot.current !== null || (di = !0), (Kn & 134217727) === 0 && (Ta & 134217727) === 0 || De === null || Jn(
      De,
      pe,
      Mt,
      !1
    );
  }
  function io(e, t, a) {
    var l = Se;
    Se |= 2;
    var u = bh(), o = _h();
    (De !== e || pe !== t) && (As = null, pi(e, t)), t = !1;
    var f = Ge;
    e: do
      try {
        if (Te !== 0 && de !== null) {
          var p = de, b = Nt;
          switch (Te) {
            case 8:
              ao(), f = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Ot.current === null && (t = !0);
              var T = Te;
              if (Te = 0, Nt = null, vi(e, p, b, T), a && di) {
                f = 0;
                break e;
              }
              break;
            default:
              T = Te, Te = 0, Nt = null, vi(e, p, b, T);
          }
        }
        $y(), f = Ge;
        break;
      } catch (D) {
        yh(e, D);
      }
    while (!0);
    return t && e.shellSuspendCounter++, hn = ga = null, Se = l, C.H = u, C.A = o, de === null && (De = null, pe = 0, Fl()), f;
  }
  function $y() {
    for (; de !== null; ) Sh(de);
  }
  function Ly(e, t) {
    var a = Se;
    Se |= 2;
    var l = bh(), u = _h();
    De !== e || pe !== t ? (As = null, Ts = k() + 500, pi(e, t)) : di = qi(
      e,
      t
    );
    e: do
      try {
        if (Te !== 0 && de !== null) {
          t = de;
          var o = Nt;
          t: switch (Te) {
            case 1:
              Te = 0, Nt = null, vi(e, t, o, 1);
              break;
            case 2:
            case 9:
              if (Nf(o)) {
                Te = 0, Nt = null, zh(t);
                break;
              }
              t = function() {
                Te !== 2 && Te !== 9 || De !== e || (Te = 7), sn(e);
              }, o.then(t, t);
              break e;
            case 3:
              Te = 7;
              break e;
            case 4:
              Te = 5;
              break e;
            case 7:
              Nf(o) ? (Te = 0, Nt = null, zh(t)) : (Te = 0, Nt = null, vi(e, t, o, 7));
              break;
            case 5:
              var f = null;
              switch (de.tag) {
                case 26:
                  f = de.memoizedState;
                case 5:
                case 27:
                  var p = de;
                  if (f ? um(f) : p.stateNode.complete) {
                    Te = 0, Nt = null;
                    var b = p.sibling;
                    if (b !== null) de = b;
                    else {
                      var T = p.return;
                      T !== null ? (de = T, Ns(T)) : de = null;
                    }
                    break t;
                  }
              }
              Te = 0, Nt = null, vi(e, t, o, 5);
              break;
            case 6:
              Te = 0, Nt = null, vi(e, t, o, 6);
              break;
            case 8:
              ao(), Ge = 6;
              break e;
            default:
              throw Error(r(462));
          }
        }
        Gy();
        break;
      } catch (D) {
        yh(e, D);
      }
    while (!0);
    return hn = ga = null, C.H = l, C.A = u, Se = a, de !== null ? 0 : (De = null, pe = 0, Fl(), Ge);
  }
  function Gy() {
    for (; de !== null && !gu(); )
      Sh(de);
  }
  function Sh(e) {
    var t = Yd(e.alternate, e, wn);
    e.memoizedProps = e.pendingProps, t === null ? Ns(e) : de = t;
  }
  function zh(e) {
    var t = e, a = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = Hd(
          a,
          t,
          t.pendingProps,
          t.type,
          void 0,
          pe
        );
        break;
      case 11:
        t = Hd(
          a,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          pe
        );
        break;
      case 5:
        br(t);
      default:
        Xd(a, t), t = de = _f(t, wn), t = Yd(a, t, wn);
    }
    e.memoizedProps = e.pendingProps, t === null ? Ns(e) : de = t;
  }
  function vi(e, t, a, l) {
    hn = ga = null, br(t), li = null, Wi = 0;
    var u = t.return;
    try {
      if (My(
        e,
        u,
        t,
        a,
        pe
      )) {
        Ge = 1, gs(
          e,
          Qt(a, e.current)
        ), de = null;
        return;
      }
    } catch (o) {
      if (u !== null) throw de = u, o;
      Ge = 1, gs(
        e,
        Qt(a, e.current)
      ), de = null;
      return;
    }
    t.flags & 32768 ? (ye || l === 1 ? e = !0 : di || (pe & 536870912) !== 0 ? e = !1 : (Yn = e = !0, (l === 2 || l === 9 || l === 3 || l === 6) && (l = Ot.current, l !== null && l.tag === 13 && (l.flags |= 16384))), wh(t, e)) : Ns(t);
  }
  function Ns(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        wh(
          t,
          Yn
        );
        return;
      }
      e = t.return;
      var a = qy(
        t.alternate,
        t,
        wn
      );
      if (a !== null) {
        de = a;
        return;
      }
      if (t = t.sibling, t !== null) {
        de = t;
        return;
      }
      de = t = e;
    } while (t !== null);
    Ge === 0 && (Ge = 5);
  }
  function wh(e, t) {
    do {
      var a = Uy(e.alternate, e);
      if (a !== null) {
        a.flags &= 32767, de = a;
        return;
      }
      if (a = e.return, a !== null && (a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null), !t && (e = e.sibling, e !== null)) {
        de = e;
        return;
      }
      de = e = a;
    } while (e !== null);
    Ge = 6, de = null;
  }
  function jh(e, t, a, l, u, o, f, p, b) {
    e.cancelPendingCommit = null;
    do
      Ms();
    while (et !== 0);
    if ((Se & 6) !== 0) throw Error(r(327));
    if (t !== null) {
      if (t === e.current) throw Error(r(177));
      if (o = t.lanes | t.childLanes, o |= Ku, wv(
        e,
        a,
        o,
        f,
        p,
        b
      ), e === De && (de = De = null, pe = 0), mi = t, Vn = e, jn = a, eo = o, to = u, hh = l, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Vy(Rl, function() {
        return Oh(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), l = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || l) {
        l = C.T, C.T = null, u = X.p, X.p = 2, f = Se, Se |= 4;
        try {
          Zy(e, t, a);
        } finally {
          Se = f, X.p = u, C.T = l;
        }
      }
      et = 1, xh(), Eh(), Th();
    }
  }
  function xh() {
    if (et === 1) {
      et = 0;
      var e = Vn, t = mi, a = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || a) {
        a = C.T, C.T = null;
        var l = X.p;
        X.p = 2;
        var u = Se;
        Se |= 4;
        try {
          lh(t, e);
          var o = yo, f = ff(e.containerInfo), p = o.focusedElem, b = o.selectionRange;
          if (f !== p && p && p.ownerDocument && cf(
            p.ownerDocument.documentElement,
            p
          )) {
            if (b !== null && Bu(p)) {
              var T = b.start, D = b.end;
              if (D === void 0 && (D = T), "selectionStart" in p)
                p.selectionStart = T, p.selectionEnd = Math.min(
                  D,
                  p.value.length
                );
              else {
                var Q = p.ownerDocument || document, A = Q && Q.defaultView || window;
                if (A.getSelection) {
                  var N = A.getSelection(), F = p.textContent.length, ie = Math.min(b.start, F), Ne = b.end === void 0 ? ie : Math.min(b.end, F);
                  !N.extend && ie > Ne && (f = Ne, Ne = ie, ie = f);
                  var x = of(
                    p,
                    ie
                  ), S = of(
                    p,
                    Ne
                  );
                  if (x && S && (N.rangeCount !== 1 || N.anchorNode !== x.node || N.anchorOffset !== x.offset || N.focusNode !== S.node || N.focusOffset !== S.offset)) {
                    var E = Q.createRange();
                    E.setStart(x.node, x.offset), N.removeAllRanges(), ie > Ne ? (N.addRange(E), N.extend(S.node, S.offset)) : (E.setEnd(S.node, S.offset), N.addRange(E));
                  }
                }
              }
            }
            for (Q = [], N = p; N = N.parentNode; )
              N.nodeType === 1 && Q.push({
                element: N,
                left: N.scrollLeft,
                top: N.scrollTop
              });
            for (typeof p.focus == "function" && p.focus(), p = 0; p < Q.length; p++) {
              var q = Q[p];
              q.element.scrollLeft = q.left, q.element.scrollTop = q.top;
            }
          }
          Gs = !!vo, yo = vo = null;
        } finally {
          Se = u, X.p = l, C.T = a;
        }
      }
      e.current = t, et = 2;
    }
  }
  function Eh() {
    if (et === 2) {
      et = 0;
      var e = Vn, t = mi, a = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || a) {
        a = C.T, C.T = null;
        var l = X.p;
        X.p = 2;
        var u = Se;
        Se |= 4;
        try {
          eh(e, t.alternate, t);
        } finally {
          Se = u, X.p = l, C.T = a;
        }
      }
      et = 3;
    }
  }
  function Th() {
    if (et === 4 || et === 3) {
      et = 0, bu();
      var e = Vn, t = mi, a = jn, l = hh;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? et = 5 : (et = 0, mi = Vn = null, Ah(e, e.pendingLanes));
      var u = e.pendingLanes;
      if (u === 0 && (Xn = null), zu(a), t = t.stateNode, xt && typeof xt.onCommitFiberRoot == "function")
        try {
          xt.onCommitFiberRoot(
            Ri,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (l !== null) {
        t = C.T, u = X.p, X.p = 2, C.T = null;
        try {
          for (var o = e.onRecoverableError, f = 0; f < l.length; f++) {
            var p = l[f];
            o(p.value, {
              componentStack: p.stack
            });
          }
        } finally {
          C.T = t, X.p = u;
        }
      }
      (jn & 3) !== 0 && Ms(), sn(e), u = e.pendingLanes, (a & 261930) !== 0 && (u & 42) !== 0 ? e === no ? pl++ : (pl = 0, no = e) : pl = 0, vl(0);
    }
  }
  function Ah(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Fi(t)));
  }
  function Ms() {
    return xh(), Eh(), Th(), Oh();
  }
  function Oh() {
    if (et !== 5) return !1;
    var e = Vn, t = eo;
    eo = 0;
    var a = zu(jn), l = C.T, u = X.p;
    try {
      X.p = 32 > a ? 32 : a, C.T = null, a = to, to = null;
      var o = Vn, f = jn;
      if (et = 0, mi = Vn = null, jn = 0, (Se & 6) !== 0) throw Error(r(331));
      var p = Se;
      if (Se |= 4, ch(o.current), uh(
        o,
        o.current,
        f,
        a
      ), Se = p, vl(0, !1), xt && typeof xt.onPostCommitFiberRoot == "function")
        try {
          xt.onPostCommitFiberRoot(Ri, o);
        } catch {
        }
      return !0;
    } finally {
      X.p = u, C.T = l, Ah(e, t);
    }
  }
  function Ch(e, t, a) {
    t = Qt(a, t), t = Rr(e.stateNode, t, 2), e = Bn(e, t, 2), e !== null && (Ui(e, 2), sn(e));
  }
  function Ae(e, t, a) {
    if (e.tag === 3)
      Ch(e, e, a);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Ch(
            t,
            e,
            a
          );
          break;
        } else if (t.tag === 1) {
          var l = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (Xn === null || !Xn.has(l))) {
            e = Qt(a, e), a = Nd(2), l = Bn(t, a, 2), l !== null && (Md(
              a,
              l,
              t,
              e
            ), Ui(l, 2), sn(l));
            break;
          }
        }
        t = t.return;
      }
  }
  function lo(e, t, a) {
    var l = e.pingCache;
    if (l === null) {
      l = e.pingCache = new ky();
      var u = /* @__PURE__ */ new Set();
      l.set(t, u);
    } else
      u = l.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), l.set(t, u));
    u.has(a) || (Ir = !0, u.add(a), e = Yy.bind(null, e, t, a), t.then(e, e));
  }
  function Yy(e, t, a) {
    var l = e.pingCache;
    l !== null && l.delete(t), e.pingedLanes |= e.suspendedLanes & a, e.warmLanes &= ~a, De === e && (pe & a) === a && (Ge === 4 || Ge === 3 && (pe & 62914560) === pe && 300 > k() - Es ? (Se & 2) === 0 && pi(e, 0) : Wr |= a, hi === pe && (hi = 0)), sn(e);
  }
  function Nh(e, t) {
    t === 0 && (t = jc()), e = pa(e, t), e !== null && (Ui(e, t), sn(e));
  }
  function Ky(e) {
    var t = e.memoizedState, a = 0;
    t !== null && (a = t.retryLane), Nh(e, a);
  }
  function Xy(e, t) {
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
    l !== null && l.delete(t), Nh(e, a);
  }
  function Vy(e, t) {
    return Ua(e, t);
  }
  var Ds = null, yi = null, so = !1, Rs = !1, uo = !1, Fn = 0;
  function sn(e) {
    e !== yi && e.next === null && (yi === null ? Ds = yi = e : yi = yi.next = e), Rs = !0, so || (so = !0, Fy());
  }
  function vl(e, t) {
    if (!uo && Rs) {
      uo = !0;
      do
        for (var a = !1, l = Ds; l !== null; ) {
          if (e !== 0) {
            var u = l.pendingLanes;
            if (u === 0) var o = 0;
            else {
              var f = l.suspendedLanes, p = l.pingedLanes;
              o = (1 << 31 - Et(42 | e) + 1) - 1, o &= u & ~(f & ~p), o = o & 201326741 ? o & 201326741 | 1 : o ? o | 2 : 0;
            }
            o !== 0 && (a = !0, qh(l, o));
          } else
            o = pe, o = Ql(
              l,
              l === De ? o : 0,
              l.cancelPendingCommit !== null || l.timeoutHandle !== -1
            ), (o & 3) === 0 || qi(l, o) || (a = !0, qh(l, o));
          l = l.next;
        }
      while (a);
      uo = !1;
    }
  }
  function Jy() {
    Mh();
  }
  function Mh() {
    Rs = so = !1;
    var e = 0;
    Fn !== 0 && sg() && (e = Fn);
    for (var t = k(), a = null, l = Ds; l !== null; ) {
      var u = l.next, o = Dh(l, t);
      o === 0 ? (l.next = null, a === null ? Ds = u : a.next = u, u === null && (yi = a)) : (a = l, (e !== 0 || (o & 3) !== 0) && (Rs = !0)), l = u;
    }
    et !== 0 && et !== 5 || vl(e), Fn !== 0 && (Fn = 0);
  }
  function Dh(e, t) {
    for (var a = e.suspendedLanes, l = e.pingedLanes, u = e.expirationTimes, o = e.pendingLanes & -62914561; 0 < o; ) {
      var f = 31 - Et(o), p = 1 << f, b = u[f];
      b === -1 ? ((p & a) === 0 || (p & l) !== 0) && (u[f] = zv(p, t)) : b <= t && (e.expiredLanes |= p), o &= ~p;
    }
    if (t = De, a = pe, a = Ql(
      e,
      e === t ? a : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l = e.callbackNode, a === 0 || e === t && (Te === 2 || Te === 9) || e.cancelPendingCommit !== null)
      return l !== null && l !== null && Za(l), e.callbackNode = null, e.callbackPriority = 0;
    if ((a & 3) === 0 || qi(e, a)) {
      if (t = a & -a, t === e.callbackPriority) return t;
      switch (l !== null && Za(l), zu(a)) {
        case 2:
        case 8:
          a = zc;
          break;
        case 32:
          a = Rl;
          break;
        case 268435456:
          a = wc;
          break;
        default:
          a = Rl;
      }
      return l = Rh.bind(null, e), a = Ua(a, l), e.callbackPriority = t, e.callbackNode = a, t;
    }
    return l !== null && l !== null && Za(l), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function Rh(e, t) {
    if (et !== 0 && et !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var a = e.callbackNode;
    if (Ms() && e.callbackNode !== a)
      return null;
    var l = pe;
    return l = Ql(
      e,
      e === De ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l === 0 ? null : (ph(e, l, t), Dh(e, k()), e.callbackNode != null && e.callbackNode === a ? Rh.bind(null, e) : null);
  }
  function qh(e, t) {
    if (Ms()) return null;
    ph(e, t, !0);
  }
  function Fy() {
    rg(function() {
      (Se & 6) !== 0 ? Ua(
        vt,
        Jy
      ) : Mh();
    });
  }
  function ro() {
    if (Fn === 0) {
      var e = ni;
      e === 0 && (e = ql, ql <<= 1, (ql & 261888) === 0 && (ql = 256)), Fn = e;
    }
    return Fn;
  }
  function Uh(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : $l("" + e);
  }
  function Zh(e, t) {
    var a = t.ownerDocument.createElement("input");
    return a.name = t.name, a.value = t.value, e.id && a.setAttribute("form", e.id), t.parentNode.insertBefore(a, t), e = new FormData(e), a.parentNode.removeChild(a), e;
  }
  function Iy(e, t, a, l, u) {
    if (t === "submit" && a && a.stateNode === u) {
      var o = Uh(
        (u[yt] || null).action
      ), f = l.submitter;
      f && (t = (t = f[yt] || null) ? Uh(t.formAction) : f.getAttribute("formAction"), t !== null && (o = t, f = null));
      var p = new Kl(
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
                if (Fn !== 0) {
                  var b = f ? Zh(u, f) : new FormData(u);
                  Ar(
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
                typeof o == "function" && (p.preventDefault(), b = f ? Zh(u, f) : new FormData(u), Ar(
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
  for (var oo = 0; oo < Yu.length; oo++) {
    var co = Yu[oo], Wy = co.toLowerCase(), Py = co[0].toUpperCase() + co.slice(1);
    It(
      Wy,
      "on" + Py
    );
  }
  It(mf, "onAnimationEnd"), It(pf, "onAnimationIteration"), It(vf, "onAnimationStart"), It("dblclick", "onDoubleClick"), It("focusin", "onFocus"), It("focusout", "onBlur"), It(py, "onTransitionRun"), It(vy, "onTransitionStart"), It(yy, "onTransitionCancel"), It(yf, "onTransitionEnd"), $a("onMouseEnter", ["mouseout", "mouseover"]), $a("onMouseLeave", ["mouseout", "mouseover"]), $a("onPointerEnter", ["pointerout", "pointerover"]), $a("onPointerLeave", ["pointerout", "pointerover"]), fa(
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
  var yl = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), eg = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(yl)
  );
  function Qh(e, t) {
    t = (t & 4) !== 0;
    for (var a = 0; a < e.length; a++) {
      var l = e[a], u = l.event;
      l = l.listeners;
      e: {
        var o = void 0;
        if (t)
          for (var f = l.length - 1; 0 <= f; f--) {
            var p = l[f], b = p.instance, T = p.currentTarget;
            if (p = p.listener, b !== o && u.isPropagationStopped())
              break e;
            o = p, u.currentTarget = T;
            try {
              o(u);
            } catch (D) {
              Jl(D);
            }
            u.currentTarget = null, o = b;
          }
        else
          for (f = 0; f < l.length; f++) {
            if (p = l[f], b = p.instance, T = p.currentTarget, p = p.listener, b !== o && u.isPropagationStopped())
              break e;
            o = p, u.currentTarget = T;
            try {
              o(u);
            } catch (D) {
              Jl(D);
            }
            u.currentTarget = null, o = b;
          }
      }
    }
  }
  function he(e, t) {
    var a = t[wu];
    a === void 0 && (a = t[wu] = /* @__PURE__ */ new Set());
    var l = e + "__bubble";
    a.has(l) || (Hh(t, e, 2, !1), a.add(l));
  }
  function fo(e, t, a) {
    var l = 0;
    t && (l |= 4), Hh(
      a,
      e,
      l,
      t
    );
  }
  var qs = "_reactListening" + Math.random().toString(36).slice(2);
  function ho(e) {
    if (!e[qs]) {
      e[qs] = !0, Nc.forEach(function(a) {
        a !== "selectionchange" && (eg.has(a) || fo(a, !1, e), fo(a, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[qs] || (t[qs] = !0, fo("selectionchange", !1, t));
    }
  }
  function Hh(e, t, a, l) {
    switch (mm(t)) {
      case 2:
        var u = Ag;
        break;
      case 8:
        u = Og;
        break;
      default:
        u = Ao;
    }
    a = u.bind(
      null,
      t,
      a,
      e
    ), u = void 0, !Mu || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (u = !0), l ? u !== void 0 ? e.addEventListener(t, a, {
      capture: !0,
      passive: u
    }) : e.addEventListener(t, a, !0) : u !== void 0 ? e.addEventListener(t, a, {
      passive: u
    }) : e.addEventListener(t, a, !1);
  }
  function mo(e, t, a, l, u) {
    var o = l;
    if ((t & 1) === 0 && (t & 2) === 0 && l !== null)
      e: for (; ; ) {
        if (l === null) return;
        var f = l.tag;
        if (f === 3 || f === 4) {
          var p = l.stateNode.containerInfo;
          if (p === u) break;
          if (f === 4)
            for (f = l.return; f !== null; ) {
              var b = f.tag;
              if ((b === 3 || b === 4) && f.stateNode.containerInfo === u)
                return;
              f = f.return;
            }
          for (; p !== null; ) {
            if (f = Ha(p), f === null) return;
            if (b = f.tag, b === 5 || b === 6 || b === 26 || b === 27) {
              l = o = f;
              continue e;
            }
            p = p.parentNode;
          }
        }
        l = l.return;
      }
    Lc(function() {
      var T = o, D = Cu(a), Q = [];
      e: {
        var A = gf.get(e);
        if (A !== void 0) {
          var N = Kl, F = e;
          switch (e) {
            case "keypress":
              if (Gl(a) === 0) break e;
            case "keydown":
            case "keyup":
              N = Xv;
              break;
            case "focusin":
              F = "focus", N = Uu;
              break;
            case "focusout":
              F = "blur", N = Uu;
              break;
            case "beforeblur":
            case "afterblur":
              N = Uu;
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
              N = Kc;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              N = qv;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              N = Fv;
              break;
            case mf:
            case pf:
            case vf:
              N = Qv;
              break;
            case yf:
              N = Wv;
              break;
            case "scroll":
            case "scrollend":
              N = Dv;
              break;
            case "wheel":
              N = ey;
              break;
            case "copy":
            case "cut":
            case "paste":
              N = kv;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              N = Vc;
              break;
            case "toggle":
            case "beforetoggle":
              N = ny;
          }
          var ie = (t & 4) !== 0, Ne = !ie && (e === "scroll" || e === "scrollend"), x = ie ? A !== null ? A + "Capture" : null : A;
          ie = [];
          for (var S = T, E; S !== null; ) {
            var q = S;
            if (E = q.stateNode, q = q.tag, q !== 5 && q !== 26 && q !== 27 || E === null || x === null || (q = Hi(S, x), q != null && ie.push(
              gl(S, q, E)
            )), Ne) break;
            S = S.return;
          }
          0 < ie.length && (A = new N(
            A,
            F,
            null,
            a,
            D
          ), Q.push({ event: A, listeners: ie }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (A = e === "mouseover" || e === "pointerover", N = e === "mouseout" || e === "pointerout", A && a !== Ou && (F = a.relatedTarget || a.fromElement) && (Ha(F) || F[Qa]))
            break e;
          if ((N || A) && (A = D.window === D ? D : (A = D.ownerDocument) ? A.defaultView || A.parentWindow : window, N ? (F = a.relatedTarget || a.toElement, N = T, F = F ? Ha(F) : null, F !== null && (Ne = m(F), ie = F.tag, F !== Ne || ie !== 5 && ie !== 27 && ie !== 6) && (F = null)) : (N = null, F = T), N !== F)) {
            if (ie = Kc, q = "onMouseLeave", x = "onMouseEnter", S = "mouse", (e === "pointerout" || e === "pointerover") && (ie = Vc, q = "onPointerLeave", x = "onPointerEnter", S = "pointer"), Ne = N == null ? A : Qi(N), E = F == null ? A : Qi(F), A = new ie(
              q,
              S + "leave",
              N,
              a,
              D
            ), A.target = Ne, A.relatedTarget = E, q = null, Ha(D) === T && (ie = new ie(
              x,
              S + "enter",
              F,
              a,
              D
            ), ie.target = E, ie.relatedTarget = Ne, q = ie), Ne = q, N && F)
              t: {
                for (ie = tg, x = N, S = F, E = 0, q = x; q; q = ie(q))
                  E++;
                q = 0;
                for (var ae = S; ae; ae = ie(ae))
                  q++;
                for (; 0 < E - q; )
                  x = ie(x), E--;
                for (; 0 < q - E; )
                  S = ie(S), q--;
                for (; E--; ) {
                  if (x === S || S !== null && x === S.alternate) {
                    ie = x;
                    break t;
                  }
                  x = ie(x), S = ie(S);
                }
                ie = null;
              }
            else ie = null;
            N !== null && kh(
              Q,
              A,
              N,
              ie,
              !1
            ), F !== null && Ne !== null && kh(
              Q,
              Ne,
              F,
              ie,
              !0
            );
          }
        }
        e: {
          if (A = T ? Qi(T) : window, N = A.nodeName && A.nodeName.toLowerCase(), N === "select" || N === "input" && A.type === "file")
            var be = nf;
          else if (ef(A))
            if (af)
              be = dy;
            else {
              be = cy;
              var P = oy;
            }
          else
            N = A.nodeName, !N || N.toLowerCase() !== "input" || A.type !== "checkbox" && A.type !== "radio" ? T && Au(T.elementType) && (be = nf) : be = fy;
          if (be && (be = be(e, T))) {
            tf(
              Q,
              be,
              a,
              D
            );
            break e;
          }
          P && P(e, A, T), e === "focusout" && T && A.type === "number" && T.memoizedProps.value != null && Tu(A, "number", A.value);
        }
        switch (P = T ? Qi(T) : window, e) {
          case "focusin":
            (ef(P) || P.contentEditable === "true") && (Va = P, $u = T, Xi = null);
            break;
          case "focusout":
            Xi = $u = Va = null;
            break;
          case "mousedown":
            Lu = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Lu = !1, df(Q, a, D);
            break;
          case "selectionchange":
            if (my) break;
          case "keydown":
          case "keyup":
            df(Q, a, D);
        }
        var fe;
        if (Qu)
          e: {
            switch (e) {
              case "compositionstart":
                var ve = "onCompositionStart";
                break e;
              case "compositionend":
                ve = "onCompositionEnd";
                break e;
              case "compositionupdate":
                ve = "onCompositionUpdate";
                break e;
            }
            ve = void 0;
          }
        else
          Xa ? Wc(e, a) && (ve = "onCompositionEnd") : e === "keydown" && a.keyCode === 229 && (ve = "onCompositionStart");
        ve && (Jc && a.locale !== "ko" && (Xa || ve !== "onCompositionStart" ? ve === "onCompositionEnd" && Xa && (fe = Gc()) : (Rn = D, Du = "value" in Rn ? Rn.value : Rn.textContent, Xa = !0)), P = Us(T, ve), 0 < P.length && (ve = new Xc(
          ve,
          e,
          null,
          a,
          D
        ), Q.push({ event: ve, listeners: P }), fe ? ve.data = fe : (fe = Pc(a), fe !== null && (ve.data = fe)))), (fe = iy ? ly(e, a) : sy(e, a)) && (ve = Us(T, "onBeforeInput"), 0 < ve.length && (P = new Xc(
          "onBeforeInput",
          "beforeinput",
          null,
          a,
          D
        ), Q.push({
          event: P,
          listeners: ve
        }), P.data = fe)), Iy(
          Q,
          e,
          T,
          a,
          D
        );
      }
      Qh(Q, t);
    });
  }
  function gl(e, t, a) {
    return {
      instance: e,
      listener: t,
      currentTarget: a
    };
  }
  function Us(e, t) {
    for (var a = t + "Capture", l = []; e !== null; ) {
      var u = e, o = u.stateNode;
      if (u = u.tag, u !== 5 && u !== 26 && u !== 27 || o === null || (u = Hi(e, a), u != null && l.unshift(
        gl(e, u, o)
      ), u = Hi(e, t), u != null && l.push(
        gl(e, u, o)
      )), e.tag === 3) return l;
      e = e.return;
    }
    return [];
  }
  function tg(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function kh(e, t, a, l, u) {
    for (var o = t._reactName, f = []; a !== null && a !== l; ) {
      var p = a, b = p.alternate, T = p.stateNode;
      if (p = p.tag, b !== null && b === l) break;
      p !== 5 && p !== 26 && p !== 27 || T === null || (b = T, u ? (T = Hi(a, o), T != null && f.unshift(
        gl(a, T, b)
      )) : u || (T = Hi(a, o), T != null && f.push(
        gl(a, T, b)
      ))), a = a.return;
    }
    f.length !== 0 && e.push({ event: t, listeners: f });
  }
  var ng = /\r\n?/g, ag = /\u0000|\uFFFD/g;
  function Bh(e) {
    return (typeof e == "string" ? e : "" + e).replace(ng, `
`).replace(ag, "");
  }
  function $h(e, t) {
    return t = Bh(t), Bh(e) === t;
  }
  function Ce(e, t, a, l, u, o) {
    switch (a) {
      case "children":
        typeof l == "string" ? t === "body" || t === "textarea" && l === "" || Ga(e, l) : (typeof l == "number" || typeof l == "bigint") && t !== "body" && Ga(e, "" + l);
        break;
      case "className":
        kl(e, "class", l);
        break;
      case "tabIndex":
        kl(e, "tabindex", l);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        kl(e, a, l);
        break;
      case "style":
        Bc(e, l, o);
        break;
      case "data":
        if (t !== "object") {
          kl(e, "data", l);
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
        l = $l("" + l), e.setAttribute(a, l);
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
          typeof o == "function" && (a === "formAction" ? (t !== "input" && Ce(e, t, "name", u.name, u, null), Ce(
            e,
            t,
            "formEncType",
            u.formEncType,
            u,
            null
          ), Ce(
            e,
            t,
            "formMethod",
            u.formMethod,
            u,
            null
          ), Ce(
            e,
            t,
            "formTarget",
            u.formTarget,
            u,
            null
          )) : (Ce(e, t, "encType", u.encType, u, null), Ce(e, t, "method", u.method, u, null), Ce(e, t, "target", u.target, u, null)));
        if (l == null || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(a);
          break;
        }
        l = $l("" + l), e.setAttribute(a, l);
        break;
      case "onClick":
        l != null && (e.onclick = on);
        break;
      case "onScroll":
        l != null && he("scroll", e);
        break;
      case "onScrollEnd":
        l != null && he("scrollend", e);
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
        a = $l("" + l), e.setAttributeNS(
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
        he("beforetoggle", e), he("toggle", e), Hl(e, "popover", l);
        break;
      case "xlinkActuate":
        rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          l
        );
        break;
      case "xlinkArcrole":
        rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          l
        );
        break;
      case "xlinkRole":
        rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          l
        );
        break;
      case "xlinkShow":
        rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          l
        );
        break;
      case "xlinkTitle":
        rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          l
        );
        break;
      case "xlinkType":
        rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          l
        );
        break;
      case "xmlBase":
        rn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          l
        );
        break;
      case "xmlLang":
        rn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          l
        );
        break;
      case "xmlSpace":
        rn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          l
        );
        break;
      case "is":
        Hl(e, "is", l);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") && (a = Nv.get(a) || a, Hl(e, a, l));
    }
  }
  function po(e, t, a, l, u, o) {
    switch (a) {
      case "style":
        Bc(e, l, o);
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
        typeof l == "string" ? Ga(e, l) : (typeof l == "number" || typeof l == "bigint") && Ga(e, "" + l);
        break;
      case "onScroll":
        l != null && he("scroll", e);
        break;
      case "onScrollEnd":
        l != null && he("scrollend", e);
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
        if (!Mc.hasOwnProperty(a))
          e: {
            if (a[0] === "o" && a[1] === "n" && (u = a.endsWith("Capture"), t = a.slice(2, u ? a.length - 7 : void 0), o = e[yt] || null, o = o != null ? o[a] : null, typeof o == "function" && e.removeEventListener(t, o, u), typeof l == "function")) {
              typeof o != "function" && o !== null && (a in e ? e[a] = null : e.hasAttribute(a) && e.removeAttribute(a)), e.addEventListener(t, l, u);
              break e;
            }
            a in e ? e[a] = l : l === !0 ? e.setAttribute(a, "") : Hl(e, a, l);
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
        he("error", e), he("load", e);
        var l = !1, u = !1, o;
        for (o in a)
          if (a.hasOwnProperty(o)) {
            var f = a[o];
            if (f != null)
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
                  Ce(e, t, o, f, a, null);
              }
          }
        u && Ce(e, t, "srcSet", a.srcSet, a, null), l && Ce(e, t, "src", a.src, a, null);
        return;
      case "input":
        he("invalid", e);
        var p = o = f = u = null, b = null, T = null;
        for (l in a)
          if (a.hasOwnProperty(l)) {
            var D = a[l];
            if (D != null)
              switch (l) {
                case "name":
                  u = D;
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
                  Ce(e, t, l, D, a, null);
              }
          }
        Zc(
          e,
          o,
          p,
          b,
          T,
          f,
          u,
          !1
        );
        return;
      case "select":
        he("invalid", e), l = f = o = null;
        for (u in a)
          if (a.hasOwnProperty(u) && (p = a[u], p != null))
            switch (u) {
              case "value":
                o = p;
                break;
              case "defaultValue":
                f = p;
                break;
              case "multiple":
                l = p;
              default:
                Ce(e, t, u, p, a, null);
            }
        t = o, a = f, e.multiple = !!l, t != null ? La(e, !!l, t, !1) : a != null && La(e, !!l, a, !0);
        return;
      case "textarea":
        he("invalid", e), o = u = l = null;
        for (f in a)
          if (a.hasOwnProperty(f) && (p = a[f], p != null))
            switch (f) {
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
                Ce(e, t, f, p, a, null);
            }
        Hc(e, l, u, o);
        return;
      case "option":
        for (b in a)
          if (a.hasOwnProperty(b) && (l = a[b], l != null))
            switch (b) {
              case "selected":
                e.selected = l && typeof l != "function" && typeof l != "symbol";
                break;
              default:
                Ce(e, t, b, l, a, null);
            }
        return;
      case "dialog":
        he("beforetoggle", e), he("toggle", e), he("cancel", e), he("close", e);
        break;
      case "iframe":
      case "object":
        he("load", e);
        break;
      case "video":
      case "audio":
        for (l = 0; l < yl.length; l++)
          he(yl[l], e);
        break;
      case "image":
        he("error", e), he("load", e);
        break;
      case "details":
        he("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        he("error", e), he("load", e);
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
                Ce(e, t, T, l, a, null);
            }
        return;
      default:
        if (Au(t)) {
          for (D in a)
            a.hasOwnProperty(D) && (l = a[D], l !== void 0 && po(
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
      a.hasOwnProperty(p) && (l = a[p], l != null && Ce(e, t, p, l, a, null));
  }
  function ig(e, t, a, l) {
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
        var u = null, o = null, f = null, p = null, b = null, T = null, D = null;
        for (N in a) {
          var Q = a[N];
          if (a.hasOwnProperty(N) && Q != null)
            switch (N) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                b = Q;
              default:
                l.hasOwnProperty(N) || Ce(e, t, N, null, l, Q);
            }
        }
        for (var A in l) {
          var N = l[A];
          if (Q = a[A], l.hasOwnProperty(A) && (N != null || Q != null))
            switch (A) {
              case "type":
                o = N;
                break;
              case "name":
                u = N;
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
                N !== Q && Ce(
                  e,
                  t,
                  A,
                  N,
                  l,
                  Q
                );
            }
        }
        Eu(
          e,
          f,
          p,
          b,
          T,
          D,
          o,
          u
        );
        return;
      case "select":
        N = f = p = A = null;
        for (o in a)
          if (b = a[o], a.hasOwnProperty(o) && b != null)
            switch (o) {
              case "value":
                break;
              case "multiple":
                N = b;
              default:
                l.hasOwnProperty(o) || Ce(
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
                f = o;
              default:
                o !== b && Ce(
                  e,
                  t,
                  u,
                  o,
                  l,
                  b
                );
            }
        t = p, a = f, l = N, A != null ? La(e, !!a, A, !1) : !!l != !!a && (t != null ? La(e, !!a, t, !0) : La(e, !!a, a ? [] : "", !1));
        return;
      case "textarea":
        N = A = null;
        for (p in a)
          if (u = a[p], a.hasOwnProperty(p) && u != null && !l.hasOwnProperty(p))
            switch (p) {
              case "value":
                break;
              case "children":
                break;
              default:
                Ce(e, t, p, null, l, u);
            }
        for (f in l)
          if (u = l[f], o = a[f], l.hasOwnProperty(f) && (u != null || o != null))
            switch (f) {
              case "value":
                A = u;
                break;
              case "defaultValue":
                N = u;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (u != null) throw Error(r(91));
                break;
              default:
                u !== o && Ce(e, t, f, u, l, o);
            }
        Qc(e, A, N);
        return;
      case "option":
        for (var F in a)
          if (A = a[F], a.hasOwnProperty(F) && A != null && !l.hasOwnProperty(F))
            switch (F) {
              case "selected":
                e.selected = !1;
                break;
              default:
                Ce(
                  e,
                  t,
                  F,
                  null,
                  l,
                  A
                );
            }
        for (b in l)
          if (A = l[b], N = a[b], l.hasOwnProperty(b) && A !== N && (A != null || N != null))
            switch (b) {
              case "selected":
                e.selected = A && typeof A != "function" && typeof A != "symbol";
                break;
              default:
                Ce(
                  e,
                  t,
                  b,
                  A,
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
        for (var ie in a)
          A = a[ie], a.hasOwnProperty(ie) && A != null && !l.hasOwnProperty(ie) && Ce(e, t, ie, null, l, A);
        for (T in l)
          if (A = l[T], N = a[T], l.hasOwnProperty(T) && A !== N && (A != null || N != null))
            switch (T) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (A != null)
                  throw Error(r(137, t));
                break;
              default:
                Ce(
                  e,
                  t,
                  T,
                  A,
                  l,
                  N
                );
            }
        return;
      default:
        if (Au(t)) {
          for (var Ne in a)
            A = a[Ne], a.hasOwnProperty(Ne) && A !== void 0 && !l.hasOwnProperty(Ne) && po(
              e,
              t,
              Ne,
              void 0,
              l,
              A
            );
          for (D in l)
            A = l[D], N = a[D], !l.hasOwnProperty(D) || A === N || A === void 0 && N === void 0 || po(
              e,
              t,
              D,
              A,
              l,
              N
            );
          return;
        }
    }
    for (var x in a)
      A = a[x], a.hasOwnProperty(x) && A != null && !l.hasOwnProperty(x) && Ce(e, t, x, null, l, A);
    for (Q in l)
      A = l[Q], N = a[Q], !l.hasOwnProperty(Q) || A === N || A == null && N == null || Ce(e, t, Q, A, l, N);
  }
  function Lh(e) {
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
  function lg() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, a = performance.getEntriesByType("resource"), l = 0; l < a.length; l++) {
        var u = a[l], o = u.transferSize, f = u.initiatorType, p = u.duration;
        if (o && p && Lh(f)) {
          for (f = 0, p = u.responseEnd, l += 1; l < a.length; l++) {
            var b = a[l], T = b.startTime;
            if (T > p) break;
            var D = b.transferSize, Q = b.initiatorType;
            D && Lh(Q) && (b = b.responseEnd, f += D * (b < p ? 1 : (p - T) / (b - T)));
          }
          if (--l, t += 8 * (o + f) / (u.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var vo = null, yo = null;
  function Zs(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Gh(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Yh(e, t) {
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
  function go(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var bo = null;
  function sg() {
    var e = window.event;
    return e && e.type === "popstate" ? e === bo ? !1 : (bo = e, !0) : (bo = null, !1);
  }
  var Kh = typeof setTimeout == "function" ? setTimeout : void 0, ug = typeof clearTimeout == "function" ? clearTimeout : void 0, Xh = typeof Promise == "function" ? Promise : void 0, rg = typeof queueMicrotask == "function" ? queueMicrotask : typeof Xh < "u" ? function(e) {
    return Xh.resolve(null).then(e).catch(og);
  } : Kh;
  function og(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function In(e) {
    return e === "head";
  }
  function Vh(e, t) {
    var a = t, l = 0;
    do {
      var u = a.nextSibling;
      if (e.removeChild(a), u && u.nodeType === 8)
        if (a = u.data, a === "/$" || a === "/&") {
          if (l === 0) {
            e.removeChild(u), Si(t);
            return;
          }
          l--;
        } else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&")
          l++;
        else if (a === "html")
          bl(e.ownerDocument.documentElement);
        else if (a === "head") {
          a = e.ownerDocument.head, bl(a);
          for (var o = a.firstChild; o; ) {
            var f = o.nextSibling, p = o.nodeName;
            o[Zi] || p === "SCRIPT" || p === "STYLE" || p === "LINK" && o.rel.toLowerCase() === "stylesheet" || a.removeChild(o), o = f;
          }
        } else
          a === "body" && bl(e.ownerDocument.body);
      a = u;
    } while (a);
    Si(t);
  }
  function Jh(e, t) {
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
  function _o(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var a = t;
      switch (t = t.nextSibling, a.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          _o(a), ju(a);
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
  function cg(e, t, a, l) {
    for (; e.nodeType === 1; ) {
      var u = a;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (l) {
        if (!e[Zi])
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
      if (e = Lt(e.nextSibling), e === null) break;
    }
    return null;
  }
  function fg(e, t, a) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !a || (e = Lt(e.nextSibling), e === null)) return null;
    return e;
  }
  function Fh(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Lt(e.nextSibling), e === null)) return null;
    return e;
  }
  function So(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function zo(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function dg(e, t) {
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
  var wo = null;
  function Ih(e) {
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
  function Wh(e) {
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
  function Ph(e, t, a) {
    switch (t = Zs(a), e) {
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
  function bl(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    ju(e);
  }
  var Gt = /* @__PURE__ */ new Map(), em = /* @__PURE__ */ new Set();
  function Qs(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var xn = X.d;
  X.d = {
    f: hg,
    r: mg,
    D: pg,
    C: vg,
    L: yg,
    m: gg,
    X: _g,
    S: bg,
    M: Sg
  };
  function hg() {
    var e = xn.f(), t = Os();
    return e || t;
  }
  function mg(e) {
    var t = ka(e);
    t !== null && t.tag === 5 && t.type === "form" ? yd(t) : xn.r(e);
  }
  var gi = typeof document > "u" ? null : document;
  function tm(e, t, a) {
    var l = gi;
    if (l && typeof t == "string" && t) {
      var u = Ut(t);
      u = 'link[rel="' + e + '"][href="' + u + '"]', typeof a == "string" && (u += '[crossorigin="' + a + '"]'), em.has(u) || (em.add(u), e = { rel: e, crossOrigin: a, href: t }, l.querySelector(u) === null && (t = l.createElement("link"), ct(t, "link", e), it(t), l.head.appendChild(t)));
    }
  }
  function pg(e) {
    xn.D(e), tm("dns-prefetch", e, null);
  }
  function vg(e, t) {
    xn.C(e, t), tm("preconnect", e, t);
  }
  function yg(e, t, a) {
    xn.L(e, t, a);
    var l = gi;
    if (l && e && t) {
      var u = 'link[rel="preload"][as="' + Ut(t) + '"]';
      t === "image" && a && a.imageSrcSet ? (u += '[imagesrcset="' + Ut(
        a.imageSrcSet
      ) + '"]', typeof a.imageSizes == "string" && (u += '[imagesizes="' + Ut(
        a.imageSizes
      ) + '"]')) : u += '[href="' + Ut(e) + '"]';
      var o = u;
      switch (t) {
        case "style":
          o = bi(e);
          break;
        case "script":
          o = _i(e);
      }
      Gt.has(o) || (e = j(
        {
          rel: "preload",
          href: t === "image" && a && a.imageSrcSet ? void 0 : e,
          as: t
        },
        a
      ), Gt.set(o, e), l.querySelector(u) !== null || t === "style" && l.querySelector(_l(o)) || t === "script" && l.querySelector(Sl(o)) || (t = l.createElement("link"), ct(t, "link", e), it(t), l.head.appendChild(t)));
    }
  }
  function gg(e, t) {
    xn.m(e, t);
    var a = gi;
    if (a && e) {
      var l = t && typeof t.as == "string" ? t.as : "script", u = 'link[rel="modulepreload"][as="' + Ut(l) + '"][href="' + Ut(e) + '"]', o = u;
      switch (l) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          o = _i(e);
      }
      if (!Gt.has(o) && (e = j({ rel: "modulepreload", href: e }, t), Gt.set(o, e), a.querySelector(u) === null)) {
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (a.querySelector(Sl(o)))
              return;
        }
        l = a.createElement("link"), ct(l, "link", e), it(l), a.head.appendChild(l);
      }
    }
  }
  function bg(e, t, a) {
    xn.S(e, t, a);
    var l = gi;
    if (l && e) {
      var u = Ba(l).hoistableStyles, o = bi(e);
      t = t || "default";
      var f = u.get(o);
      if (!f) {
        var p = { loading: 0, preload: null };
        if (f = l.querySelector(
          _l(o)
        ))
          p.loading = 5;
        else {
          e = j(
            { rel: "stylesheet", href: e, "data-precedence": t },
            a
          ), (a = Gt.get(o)) && jo(e, a);
          var b = f = l.createElement("link");
          it(b), ct(b, "link", e), b._p = new Promise(function(T, D) {
            b.onload = T, b.onerror = D;
          }), b.addEventListener("load", function() {
            p.loading |= 1;
          }), b.addEventListener("error", function() {
            p.loading |= 2;
          }), p.loading |= 4, Hs(f, t, l);
        }
        f = {
          type: "stylesheet",
          instance: f,
          count: 1,
          state: p
        }, u.set(o, f);
      }
    }
  }
  function _g(e, t) {
    xn.X(e, t);
    var a = gi;
    if (a && e) {
      var l = Ba(a).hoistableScripts, u = _i(e), o = l.get(u);
      o || (o = a.querySelector(Sl(u)), o || (e = j({ src: e, async: !0 }, t), (t = Gt.get(u)) && xo(e, t), o = a.createElement("script"), it(o), ct(o, "link", e), a.head.appendChild(o)), o = {
        type: "script",
        instance: o,
        count: 1,
        state: null
      }, l.set(u, o));
    }
  }
  function Sg(e, t) {
    xn.M(e, t);
    var a = gi;
    if (a && e) {
      var l = Ba(a).hoistableScripts, u = _i(e), o = l.get(u);
      o || (o = a.querySelector(Sl(u)), o || (e = j({ src: e, async: !0, type: "module" }, t), (t = Gt.get(u)) && xo(e, t), o = a.createElement("script"), it(o), ct(o, "link", e), a.head.appendChild(o)), o = {
        type: "script",
        instance: o,
        count: 1,
        state: null
      }, l.set(u, o));
    }
  }
  function nm(e, t, a, l) {
    var u = (u = re.current) ? Qs(u) : null;
    if (!u) throw Error(r(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof a.precedence == "string" && typeof a.href == "string" ? (t = bi(a.href), a = Ba(
          u
        ).hoistableStyles, l = a.get(t), l || (l = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, a.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
          e = bi(a.href);
          var o = Ba(
            u
          ).hoistableStyles, f = o.get(e);
          if (f || (u = u.ownerDocument || u, f = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, o.set(e, f), (o = u.querySelector(
            _l(e)
          )) && !o._p && (f.instance = o, f.state.loading = 5), Gt.has(e) || (a = {
            rel: "preload",
            as: "style",
            href: a.href,
            crossOrigin: a.crossOrigin,
            integrity: a.integrity,
            media: a.media,
            hrefLang: a.hrefLang,
            referrerPolicy: a.referrerPolicy
          }, Gt.set(e, a), o || zg(
            u,
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
        return t = a.async, a = a.src, typeof a == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = _i(a), a = Ba(
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
  function bi(e) {
    return 'href="' + Ut(e) + '"';
  }
  function _l(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function am(e) {
    return j({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function zg(e, t, a, l) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? l.loading = 1 : (t = e.createElement("link"), l.preload = t, t.addEventListener("load", function() {
      return l.loading |= 1;
    }), t.addEventListener("error", function() {
      return l.loading |= 2;
    }), ct(t, "link", a), it(t), e.head.appendChild(t));
  }
  function _i(e) {
    return '[src="' + Ut(e) + '"]';
  }
  function Sl(e) {
    return "script[async]" + e;
  }
  function im(e, t, a) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var l = e.querySelector(
            'style[data-href~="' + Ut(a.href) + '"]'
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
          ), it(l), ct(l, "style", u), Hs(l, a.precedence, e), t.instance = l;
        case "stylesheet":
          u = bi(a.href);
          var o = e.querySelector(
            _l(u)
          );
          if (o)
            return t.state.loading |= 4, t.instance = o, it(o), o;
          l = am(a), (u = Gt.get(u)) && jo(l, u), o = (e.ownerDocument || e).createElement("link"), it(o);
          var f = o;
          return f._p = new Promise(function(p, b) {
            f.onload = p, f.onerror = b;
          }), ct(o, "link", l), t.state.loading |= 4, Hs(o, a.precedence, e), t.instance = o;
        case "script":
          return o = _i(a.src), (u = e.querySelector(
            Sl(o)
          )) ? (t.instance = u, it(u), u) : (l = a, (u = Gt.get(o)) && (l = j({}, a), xo(l, u)), e = e.ownerDocument || e, u = e.createElement("script"), it(u), ct(u, "link", l), e.head.appendChild(u), t.instance = u);
        case "void":
          return null;
        default:
          throw Error(r(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (l = t.instance, t.state.loading |= 4, Hs(l, a.precedence, e));
    return t.instance;
  }
  function Hs(e, t, a) {
    for (var l = a.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), u = l.length ? l[l.length - 1] : null, o = u, f = 0; f < l.length; f++) {
      var p = l[f];
      if (p.dataset.precedence === t) o = p;
      else if (o !== u) break;
    }
    o ? o.parentNode.insertBefore(e, o.nextSibling) : (t = a.nodeType === 9 ? a.head : a, t.insertBefore(e, t.firstChild));
  }
  function jo(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function xo(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var ks = null;
  function lm(e, t, a) {
    if (ks === null) {
      var l = /* @__PURE__ */ new Map(), u = ks = /* @__PURE__ */ new Map();
      u.set(a, l);
    } else
      u = ks, l = u.get(a), l || (l = /* @__PURE__ */ new Map(), u.set(a, l));
    if (l.has(e)) return l;
    for (l.set(e, null), a = a.getElementsByTagName(e), u = 0; u < a.length; u++) {
      var o = a[u];
      if (!(o[Zi] || o[st] || e === "link" && o.getAttribute("rel") === "stylesheet") && o.namespaceURI !== "http://www.w3.org/2000/svg") {
        var f = o.getAttribute(t) || "";
        f = e + f;
        var p = l.get(f);
        p ? p.push(o) : l.set(f, [o]);
      }
    }
    return l;
  }
  function sm(e, t, a) {
    e = e.ownerDocument || e, e.head.insertBefore(
      a,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function wg(e, t, a) {
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
  function um(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function jg(e, t, a, l) {
    if (a.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== !1) && (a.state.loading & 4) === 0) {
      if (a.instance === null) {
        var u = bi(l.href), o = t.querySelector(
          _l(u)
        );
        if (o) {
          t = o._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = Bs.bind(e), t.then(e, e)), a.state.loading |= 4, a.instance = o, it(o);
          return;
        }
        o = t.ownerDocument || t, l = am(l), (u = Gt.get(u)) && jo(l, u), o = o.createElement("link"), it(o);
        var f = o;
        f._p = new Promise(function(p, b) {
          f.onload = p, f.onerror = b;
        }), ct(o, "link", l), a.instance = o;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(a, t), (t = a.state.preload) && (a.state.loading & 3) === 0 && (e.count++, a = Bs.bind(e), t.addEventListener("load", a), t.addEventListener("error", a));
    }
  }
  var Eo = 0;
  function xg(e, t) {
    return e.stylesheets && e.count === 0 && Ls(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(a) {
      var l = setTimeout(function() {
        if (e.stylesheets && Ls(e, e.stylesheets), e.unsuspend) {
          var o = e.unsuspend;
          e.unsuspend = null, o();
        }
      }, 6e4 + t);
      0 < e.imgBytes && Eo === 0 && (Eo = 62500 * lg());
      var u = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Ls(e, e.stylesheets), e.unsuspend)) {
            var o = e.unsuspend;
            e.unsuspend = null, o();
          }
        },
        (e.imgBytes > Eo ? 50 : 800) + t
      );
      return e.unsuspend = a, function() {
        e.unsuspend = null, clearTimeout(l), clearTimeout(u);
      };
    } : null;
  }
  function Bs() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Ls(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var $s = null;
  function Ls(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, $s = /* @__PURE__ */ new Map(), t.forEach(Eg, e), $s = null, Bs.call(e));
  }
  function Eg(e, t) {
    if (!(t.state.loading & 4)) {
      var a = $s.get(e);
      if (a) var l = a.get(null);
      else {
        a = /* @__PURE__ */ new Map(), $s.set(e, a);
        for (var u = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), o = 0; o < u.length; o++) {
          var f = u[o];
          (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") && (a.set(f.dataset.precedence, f), l = f);
        }
        l && a.set(null, l);
      }
      u = t.instance, f = u.getAttribute("data-precedence"), o = a.get(f) || l, o === l && a.set(null, u), a.set(f, u), this.count++, l = Bs.bind(this), u.addEventListener("load", l), u.addEventListener("error", l), o ? o.parentNode.insertBefore(u, o.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(u, e.firstChild)), t.state.loading |= 4;
    }
  }
  var zl = {
    $$typeof: ee,
    Provider: null,
    Consumer: null,
    _currentValue: le,
    _currentValue2: le,
    _threadCount: 0
  };
  function Tg(e, t, a, l, u, o, f, p, b) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = _u(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = _u(0), this.hiddenUpdates = _u(null), this.identifierPrefix = l, this.onUncaughtError = u, this.onCaughtError = o, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = b, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function rm(e, t, a, l, u, o, f, p, b, T, D, Q) {
    return e = new Tg(
      e,
      t,
      a,
      f,
      b,
      T,
      D,
      Q,
      p
    ), t = 1, o === !0 && (t |= 24), o = At(3, null, null, t), e.current = o, o.stateNode = e, t = ir(), t.refCount++, e.pooledCache = t, t.refCount++, o.memoizedState = {
      element: l,
      isDehydrated: a,
      cache: t
    }, rr(o), e;
  }
  function om(e) {
    return e ? (e = Ia, e) : Ia;
  }
  function cm(e, t, a, l, u, o) {
    u = om(u), l.context === null ? l.context = u : l.pendingContext = u, l = kn(t), l.payload = { element: a }, o = o === void 0 ? null : o, o !== null && (l.callback = o), a = Bn(e, l, t), a !== null && (wt(a, e, t), el(a, e, t));
  }
  function fm(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var a = e.retryLane;
      e.retryLane = a !== 0 && a < t ? a : t;
    }
  }
  function To(e, t) {
    fm(e, t), (e = e.alternate) && fm(e, t);
  }
  function dm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = pa(e, 67108864);
      t !== null && wt(t, e, 67108864), To(e, 67108864);
    }
  }
  function hm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Dt();
      t = Su(t);
      var a = pa(e, t);
      a !== null && wt(a, e, t), To(e, t);
    }
  }
  var Gs = !0;
  function Ag(e, t, a, l) {
    var u = C.T;
    C.T = null;
    var o = X.p;
    try {
      X.p = 2, Ao(e, t, a, l);
    } finally {
      X.p = o, C.T = u;
    }
  }
  function Og(e, t, a, l) {
    var u = C.T;
    C.T = null;
    var o = X.p;
    try {
      X.p = 8, Ao(e, t, a, l);
    } finally {
      X.p = o, C.T = u;
    }
  }
  function Ao(e, t, a, l) {
    if (Gs) {
      var u = Oo(l);
      if (u === null)
        mo(
          e,
          t,
          l,
          Ys,
          a
        ), pm(e, l);
      else if (Ng(
        u,
        e,
        t,
        a,
        l
      ))
        l.stopPropagation();
      else if (pm(e, l), t & 4 && -1 < Cg.indexOf(e)) {
        for (; u !== null; ) {
          var o = ka(u);
          if (o !== null)
            switch (o.tag) {
              case 3:
                if (o = o.stateNode, o.current.memoizedState.isDehydrated) {
                  var f = ca(o.pendingLanes);
                  if (f !== 0) {
                    var p = o;
                    for (p.pendingLanes |= 2, p.entangledLanes |= 2; f; ) {
                      var b = 1 << 31 - Et(f);
                      p.entanglements[1] |= b, f &= ~b;
                    }
                    sn(o), (Se & 6) === 0 && (Ts = k() + 500, vl(0));
                  }
                }
                break;
              case 31:
              case 13:
                p = pa(o, 2), p !== null && wt(p, o, 2), Os(), To(o, 2);
            }
          if (o = Oo(l), o === null && mo(
            e,
            t,
            l,
            Ys,
            a
          ), o === u) break;
          u = o;
        }
        u !== null && l.stopPropagation();
      } else
        mo(
          e,
          t,
          l,
          null,
          a
        );
    }
  }
  function Oo(e) {
    return e = Cu(e), Co(e);
  }
  var Ys = null;
  function Co(e) {
    if (Ys = null, e = Ha(e), e !== null) {
      var t = m(e);
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
    return Ys = e, null;
  }
  function mm(e) {
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
        switch (Ee()) {
          case vt:
            return 2;
          case zc:
            return 8;
          case Rl:
          case vv:
            return 32;
          case wc:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var No = !1, Wn = null, Pn = null, ea = null, wl = /* @__PURE__ */ new Map(), jl = /* @__PURE__ */ new Map(), ta = [], Cg = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function pm(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Wn = null;
        break;
      case "dragenter":
      case "dragleave":
        Pn = null;
        break;
      case "mouseover":
      case "mouseout":
        ea = null;
        break;
      case "pointerover":
      case "pointerout":
        wl.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        jl.delete(t.pointerId);
    }
  }
  function xl(e, t, a, l, u, o) {
    return e === null || e.nativeEvent !== o ? (e = {
      blockedOn: t,
      domEventName: a,
      eventSystemFlags: l,
      nativeEvent: o,
      targetContainers: [u]
    }, t !== null && (t = ka(t), t !== null && dm(t)), e) : (e.eventSystemFlags |= l, t = e.targetContainers, u !== null && t.indexOf(u) === -1 && t.push(u), e);
  }
  function Ng(e, t, a, l, u) {
    switch (t) {
      case "focusin":
        return Wn = xl(
          Wn,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "dragenter":
        return Pn = xl(
          Pn,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "mouseover":
        return ea = xl(
          ea,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "pointerover":
        var o = u.pointerId;
        return wl.set(
          o,
          xl(
            wl.get(o) || null,
            e,
            t,
            a,
            l,
            u
          )
        ), !0;
      case "gotpointercapture":
        return o = u.pointerId, jl.set(
          o,
          xl(
            jl.get(o) || null,
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
  function vm(e) {
    var t = Ha(e.target);
    if (t !== null) {
      var a = m(t);
      if (a !== null) {
        if (t = a.tag, t === 13) {
          if (t = d(a), t !== null) {
            e.blockedOn = t, Oc(e.priority, function() {
              hm(a);
            });
            return;
          }
        } else if (t === 31) {
          if (t = v(a), t !== null) {
            e.blockedOn = t, Oc(e.priority, function() {
              hm(a);
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
  function Ks(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var a = Oo(e.nativeEvent);
      if (a === null) {
        a = e.nativeEvent;
        var l = new a.constructor(
          a.type,
          a
        );
        Ou = l, a.target.dispatchEvent(l), Ou = null;
      } else
        return t = ka(a), t !== null && dm(t), e.blockedOn = a, !1;
      t.shift();
    }
    return !0;
  }
  function ym(e, t, a) {
    Ks(e) && a.delete(t);
  }
  function Mg() {
    No = !1, Wn !== null && Ks(Wn) && (Wn = null), Pn !== null && Ks(Pn) && (Pn = null), ea !== null && Ks(ea) && (ea = null), wl.forEach(ym), jl.forEach(ym);
  }
  function Xs(e, t) {
    e.blockedOn === t && (e.blockedOn = null, No || (No = !0, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      Mg
    )));
  }
  var Vs = null;
  function gm(e) {
    Vs !== e && (Vs = e, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      function() {
        Vs === e && (Vs = null);
        for (var t = 0; t < e.length; t += 3) {
          var a = e[t], l = e[t + 1], u = e[t + 2];
          if (typeof l != "function") {
            if (Co(l || a) === null)
              continue;
            break;
          }
          var o = ka(a);
          o !== null && (e.splice(t, 3), t -= 3, Ar(
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
  function Si(e) {
    function t(b) {
      return Xs(b, e);
    }
    Wn !== null && Xs(Wn, e), Pn !== null && Xs(Pn, e), ea !== null && Xs(ea, e), wl.forEach(t), jl.forEach(t);
    for (var a = 0; a < ta.length; a++) {
      var l = ta[a];
      l.blockedOn === e && (l.blockedOn = null);
    }
    for (; 0 < ta.length && (a = ta[0], a.blockedOn === null); )
      vm(a), a.blockedOn === null && ta.shift();
    if (a = (e.ownerDocument || e).$$reactFormReplay, a != null)
      for (l = 0; l < a.length; l += 3) {
        var u = a[l], o = a[l + 1], f = u[yt] || null;
        if (typeof o == "function")
          f || gm(a);
        else if (f) {
          var p = null;
          if (o && o.hasAttribute("formAction")) {
            if (u = o, f = o[yt] || null)
              p = f.formAction;
            else if (Co(u) !== null) continue;
          } else p = f.action;
          typeof p == "function" ? a[l + 1] = p : (a.splice(l, 3), l -= 3), gm(a);
        }
      }
  }
  function bm() {
    function e(o) {
      o.canIntercept && o.info === "react-transition" && o.intercept({
        handler: function() {
          return new Promise(function(f) {
            return u = f;
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
  function Mo(e) {
    this._internalRoot = e;
  }
  Js.prototype.render = Mo.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(r(409));
    var a = t.current, l = Dt();
    cm(a, l, e, t, null, null);
  }, Js.prototype.unmount = Mo.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      cm(e.current, 2, null, e, null, null), Os(), t[Qa] = null;
    }
  };
  function Js(e) {
    this._internalRoot = e;
  }
  Js.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = Ac();
      e = { blockedOn: null, target: e, priority: t };
      for (var a = 0; a < ta.length && t !== 0 && t < ta[a].priority; a++) ;
      ta.splice(a, 0, e), a === 0 && vm(e);
    }
  };
  var _m = i.version;
  if (_m !== "19.2.7")
    throw Error(
      r(
        527,
        _m,
        "19.2.7"
      )
    );
  X.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(r(188)) : (e = Object.keys(e).join(","), Error(r(268, e)));
    return e = y(t), e = e !== null ? _(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Dg = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: C,
    reconcilerVersion: "19.2.7"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Fs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Fs.isDisabled && Fs.supportsFiber)
      try {
        Ri = Fs.inject(
          Dg
        ), xt = Fs;
      } catch {
      }
  }
  return Tl.createRoot = function(e, t) {
    if (!c(e)) throw Error(r(299));
    var a = !1, l = "", u = Td, o = Ad, f = Od;
    return t != null && (t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (l = t.identifierPrefix), t.onUncaughtError !== void 0 && (u = t.onUncaughtError), t.onCaughtError !== void 0 && (o = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError)), t = rm(
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
      f,
      bm
    ), e[Qa] = t.current, ho(e), new Mo(t);
  }, Tl.hydrateRoot = function(e, t, a) {
    if (!c(e)) throw Error(r(299));
    var l = !1, u = "", o = Td, f = Ad, p = Od, b = null;
    return a != null && (a.unstable_strictMode === !0 && (l = !0), a.identifierPrefix !== void 0 && (u = a.identifierPrefix), a.onUncaughtError !== void 0 && (o = a.onUncaughtError), a.onCaughtError !== void 0 && (f = a.onCaughtError), a.onRecoverableError !== void 0 && (p = a.onRecoverableError), a.formState !== void 0 && (b = a.formState)), t = rm(
      e,
      1,
      !0,
      t,
      a ?? null,
      l,
      u,
      b,
      o,
      f,
      p,
      bm
    ), t.context = om(null), a = t.current, l = Dt(), l = Su(l), u = kn(l), u.callback = null, Bn(a, u, l), a = l, t.current.lanes = a, Ui(t, a), sn(t), e[Qa] = t.current, ho(e), new Js(t);
  }, Tl.version = "19.2.7", Tl;
}
var Cm;
function Lg() {
  if (Cm) return Ro.exports;
  Cm = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Ro.exports = $g(), Ro.exports;
}
var Gg = Lg(), I = ac(), Ai = class {
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
}, Yg = class extends Ai {
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
}, ic = new Yg(), Kg = {
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
}, Xg = class {
  // We cannot have TimeoutManager<T> as we must instantiate it with a concrete
  // type at app boot; and if we leave that type, then any new timer provider
  // would need to support the default provider's concrete timer ID, which is
  // infeasible across environments.
  //
  // We settle for type safety for the TimeoutProvider type, and accept that
  // this class is unsafe internally to allow for extension.
  #e = Kg;
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
}, Aa = new Xg();
function Vg(n) {
  setTimeout(n, 0);
}
var Jg = typeof window > "u" || "Deno" in globalThis;
function pt() {
}
function Fg(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Lo(n) {
  return typeof n == "number" && n >= 0 && n !== 1 / 0;
}
function Sp(n, i) {
  return Math.max(n + (i || 0) - Date.now(), 0);
}
function sa(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Rt(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Nm(n, i) {
  const {
    type: s = "all",
    exact: r,
    fetchStatus: c,
    predicate: m,
    queryKey: d,
    stale: v
  } = n;
  if (d) {
    if (r) {
      if (i.queryHash !== lc(d, i.options))
        return !1;
    } else if (!Ol(i.queryKey, d))
      return !1;
  }
  if (s !== "all") {
    const g = i.isActive();
    if (s === "active" && !g || s === "inactive" && g)
      return !1;
  }
  return !(typeof v == "boolean" && i.isStale() !== v || c && c !== i.state.fetchStatus || m && !m(i));
}
function Mm(n, i) {
  const { exact: s, status: r, predicate: c, mutationKey: m } = n;
  if (m) {
    if (!i.options.mutationKey)
      return !1;
    if (s) {
      if (Ca(i.options.mutationKey) !== Ca(m))
        return !1;
    } else if (!Ol(i.options.mutationKey, m))
      return !1;
  }
  return !(r && i.state.status !== r || c && !c(i));
}
function lc(n, i) {
  return (i?.queryKeyHashFn || Ca)(n);
}
function Ca(n) {
  return JSON.stringify(
    n,
    (i, s) => Go(s) ? Object.keys(s).sort().reduce((r, c) => (r[c] = s[c], r), {}) : s
  );
}
function Ol(n, i) {
  return n === i ? !0 : typeof n != typeof i ? !1 : n && i && typeof n == "object" && typeof i == "object" ? Object.keys(i).every((s) => Ol(n[s], i[s])) : !1;
}
var Ig = Object.prototype.hasOwnProperty;
function zp(n, i, s = 0) {
  if (n === i)
    return n;
  if (s > 500) return i;
  const r = Dm(n) && Dm(i);
  if (!r && !(Go(n) && Go(i))) return i;
  const m = (r ? n : Object.keys(n)).length, d = r ? i : Object.keys(i), v = d.length, g = r ? new Array(v) : {};
  let y = 0;
  for (let _ = 0; _ < v; _++) {
    const j = r ? _ : d[_], w = n[j], O = i[j];
    if (w === O) {
      g[j] = w, (r ? _ < m : Ig.call(n, j)) && y++;
      continue;
    }
    if (w === null || O === null || typeof w != "object" || typeof O != "object") {
      g[j] = O;
      continue;
    }
    const M = zp(w, O, s + 1);
    g[j] = M, M === w && y++;
  }
  return m === v && y === m ? n : g;
}
function lu(n, i) {
  if (!i || Object.keys(n).length !== Object.keys(i).length)
    return !1;
  for (const s in n)
    if (n[s] !== i[s])
      return !1;
  return !0;
}
function Dm(n) {
  return Array.isArray(n) && n.length === Object.keys(n).length;
}
function Go(n) {
  if (!Rm(n))
    return !1;
  const i = n.constructor;
  if (i === void 0)
    return !0;
  const s = i.prototype;
  return !(!Rm(s) || !s.hasOwnProperty("isPrototypeOf") || Object.getPrototypeOf(n) !== Object.prototype);
}
function Rm(n) {
  return Object.prototype.toString.call(n) === "[object Object]";
}
function Wg(n) {
  return new Promise((i) => {
    Aa.setTimeout(i, n);
  });
}
function Yo(n, i, s) {
  return typeof s.structuralSharing == "function" ? s.structuralSharing(n, i) : s.structuralSharing !== !1 ? zp(n, i) : i;
}
function Pg(n, i, s = 0) {
  const r = [...n, i];
  return s && r.length > s ? r.slice(1) : r;
}
function eb(n, i, s = 0) {
  const r = [i, ...n];
  return s && r.length > s ? r.slice(0, -1) : r;
}
var sc = /* @__PURE__ */ Symbol();
function wp(n, i) {
  return !n.queryFn && i?.initialPromise ? () => i.initialPromise : !n.queryFn || n.queryFn === sc ? () => Promise.reject(new Error(`Missing queryFn: '${n.queryHash}'`)) : n.queryFn;
}
function uc(n, i) {
  return typeof n == "function" ? n(...i) : !!n;
}
function tb(n, i, s) {
  let r = !1, c;
  return Object.defineProperty(n, "signal", {
    enumerable: !0,
    get: () => (c ??= i(), r || (r = !0, c.aborted ? s() : c.addEventListener("abort", s, { once: !0 })), c)
  }), n;
}
var Cl = /* @__PURE__ */ (() => {
  let n = () => Jg;
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
function Ko() {
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
var nb = Vg;
function ab() {
  let n = [], i = 0, s = (v) => {
    v();
  }, r = (v) => {
    v();
  }, c = nb;
  const m = (v) => {
    i ? n.push(v) : c(() => {
      s(v);
    });
  }, d = () => {
    const v = n;
    n = [], v.length && c(() => {
      r(() => {
        v.forEach((g) => {
          s(g);
        });
      });
    });
  };
  return {
    batch: (v) => {
      let g;
      i++;
      try {
        g = v();
      } finally {
        i--, i || d();
      }
      return g;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (v) => (...g) => {
      m(() => {
        v(...g);
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
var tt = ab(), ib = class extends Ai {
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
}, su = new ib();
function lb(n) {
  return Math.min(1e3 * 2 ** n, 3e4);
}
function jp(n) {
  return (n ?? "online") === "online" ? su.isOnline() : !0;
}
var Xo = class extends Error {
  constructor(n) {
    super("CancelledError"), this.revert = n?.revert, this.silent = n?.silent;
  }
};
function xp(n) {
  let i = !1, s = 0, r;
  const c = Ko(), m = () => c.status !== "pending", d = (H) => {
    if (!m()) {
      const W = new Xo(H);
      w(W), n.onCancel?.(W);
    }
  }, v = () => {
    i = !0;
  }, g = () => {
    i = !1;
  }, y = () => ic.isFocused() && (n.networkMode === "always" || su.isOnline()) && n.canRun(), _ = () => jp(n.networkMode) && n.canRun(), j = (H) => {
    m() || (r?.(), c.resolve(H));
  }, w = (H) => {
    m() || (r?.(), c.reject(H));
  }, O = () => new Promise((H) => {
    r = (W) => {
      (m() || y()) && H(W);
    }, n.onPause?.();
  }).then(() => {
    r = void 0, m() || n.onContinue?.();
  }), M = () => {
    if (m())
      return;
    let H;
    const W = s === 0 ? n.initialPromise : void 0;
    try {
      H = W ?? n.fn();
    } catch ($) {
      H = Promise.reject($);
    }
    Promise.resolve(H).then(j).catch(($) => {
      if (m())
        return;
      const ne = n.retry ?? (Cl.isServer() ? 0 : 3), ee = n.retryDelay ?? lb, G = typeof ee == "function" ? ee(s, $) : ee, K = ne === !0 || typeof ne == "number" && s < ne || typeof ne == "function" && ne(s, $);
      if (i || !K) {
        w($);
        return;
      }
      s++, n.onFail?.(s, $), Wg(G).then(() => y() ? void 0 : O()).then(() => {
        i ? w($) : M();
      });
    });
  };
  return {
    promise: c,
    status: () => c.status,
    cancel: d,
    continue: () => (r?.(), c),
    cancelRetry: v,
    continueRetry: g,
    canStart: _,
    start: () => (_() ? M() : O().then(M), c)
  };
}
var Ep = class {
  #e;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout(), Lo(this.gcTime) && (this.#e = Aa.setTimeout(() => {
      this.optionalRemove();
    }, this.gcTime));
  }
  updateGcTime(n) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      n ?? (Cl.isServer() ? 1 / 0 : 300 * 1e3)
    );
  }
  clearGcTimeout() {
    this.#e !== void 0 && (Aa.clearTimeout(this.#e), this.#e = void 0);
  }
};
function sb(n) {
  return {
    onFetch: (i, s) => {
      const r = i.options, c = i.fetchOptions?.meta?.fetchMore?.direction, m = i.state.data?.pages || [], d = i.state.data?.pageParams || [];
      let v = { pages: [], pageParams: [] }, g = 0;
      const y = async () => {
        let _ = !1;
        const j = (M) => {
          tb(
            M,
            () => i.signal,
            () => _ = !0
          );
        }, w = wp(i.options, i.fetchOptions), O = async (M, H, W) => {
          if (_)
            return Promise.reject(i.signal.reason);
          if (H == null && M.pages.length)
            return Promise.resolve(M);
          const ne = (() => {
            const B = {
              client: i.client,
              queryKey: i.queryKey,
              pageParam: H,
              direction: W ? "backward" : "forward",
              meta: i.options.meta
            };
            return j(B), B;
          })(), ee = await w(ne), { maxPages: G } = i.options, K = W ? eb : Pg;
          return {
            pages: K(M.pages, ee, G),
            pageParams: K(M.pageParams, H, G)
          };
        };
        if (c && m.length) {
          const M = c === "backward", H = M ? ub : qm, W = {
            pages: m,
            pageParams: d
          }, $ = H(r, W);
          v = await O(W, $, M);
        } else {
          const M = n ?? m.length;
          do {
            const H = g === 0 ? d[0] ?? r.initialPageParam : qm(r, v);
            if (g > 0 && H == null)
              break;
            v = await O(v, H), g++;
          } while (g < M);
        }
        return v;
      };
      i.options.persister ? i.fetchFn = () => i.options.persister?.(
        y,
        {
          client: i.client,
          queryKey: i.queryKey,
          meta: i.options.meta,
          signal: i.signal
        },
        s
      ) : i.fetchFn = y;
    }
  };
}
function qm(n, { pages: i, pageParams: s }) {
  const r = i.length - 1;
  return i.length > 0 ? n.getNextPageParam(
    i[r],
    i,
    s[r],
    s
  ) : void 0;
}
function ub(n, { pages: i, pageParams: s }) {
  return i.length > 0 ? n.getPreviousPageParam?.(i[0], i, s[0], s) : void 0;
}
var rb = class extends Ep {
  #e;
  #t;
  #n;
  #a;
  #l;
  #i;
  #u;
  #s;
  constructor(n) {
    super(), this.#s = !1, this.#u = n.defaultOptions, this.setOptions(n.options), this.observers = [], this.#l = n.client, this.#a = this.#l.getQueryCache(), this.queryKey = n.queryKey, this.queryHash = n.queryHash, this.#t = Zm(this.options), this.state = n.state ?? this.#t, this.scheduleGc();
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
      const i = Zm(this.options);
      i.data !== void 0 && (this.setState(
        Um(i.data, i.dataUpdatedAt)
      ), this.#t = i);
    }
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && this.#a.remove(this);
  }
  setData(n, i) {
    const s = Yo(this.state.data, n, this.options);
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
    return this.#i?.cancel(n), i ? i.then(pt).catch(pt) : Promise.resolve();
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
    return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === sc || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => sa(n.options.staleTime, this) === "static"
    ) : !1;
  }
  isStale() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => n.getCurrentResult().isStale
    ) : this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(n = 0) {
    return this.state.data === void 0 ? !0 : n === "static" ? !1 : this.state.isInvalidated ? !0 : !Sp(this.state.dataUpdatedAt, n);
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
      const g = this.observers.find((y) => y.options.queryFn);
      g && this.setOptions(g.options);
    }
    const s = new AbortController(), r = (g) => {
      Object.defineProperty(g, "signal", {
        enumerable: !0,
        get: () => (this.#s = !0, s.signal)
      });
    }, c = () => {
      const g = wp(this.options, i), _ = (() => {
        const j = {
          client: this.#l,
          queryKey: this.queryKey,
          meta: this.meta
        };
        return r(j), j;
      })();
      return this.#s = !1, this.options.persister ? this.options.persister(
        g,
        _,
        this
      ) : g(_);
    }, d = (() => {
      const g = {
        fetchOptions: i,
        options: this.options,
        queryKey: this.queryKey,
        client: this.#l,
        state: this.state,
        fetchFn: c
      };
      return r(g), g;
    })();
    (this.#e === "infinite" ? sb(
      this.options.pages
    ) : this.options.behavior)?.onFetch(d, this), this.#n = this.state, (this.state.fetchStatus === "idle" || this.state.fetchMeta !== d.fetchOptions?.meta) && this.#r({ type: "fetch", meta: d.fetchOptions?.meta }), this.#i = xp({
      initialPromise: i?.initialPromise,
      fn: d.fetchFn,
      onCancel: (g) => {
        g instanceof Xo && g.revert && this.setState({
          ...this.#n,
          fetchStatus: "idle"
        }), s.abort();
      },
      onFail: (g, y) => {
        this.#r({ type: "failed", failureCount: g, error: y });
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
      const g = await this.#i.start();
      if (g === void 0)
        throw new Error(`${this.queryHash} data is undefined`);
      return this.setData(g), this.#a.config.onSuccess?.(g, this), this.#a.config.onSettled?.(
        g,
        this.state.error,
        this
      ), g;
    } catch (g) {
      if (g instanceof Xo) {
        if (g.silent)
          return this.#i.promise;
        if (g.revert) {
          if (this.state.data === void 0)
            throw g;
          return this.state.data;
        }
      }
      throw this.#r({
        type: "error",
        error: g
      }), this.#a.config.onError?.(
        g,
        this
      ), this.#a.config.onSettled?.(
        this.state.data,
        g,
        this
      ), g;
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
            ...Tp(s.data, this.options),
            fetchMeta: n.meta ?? null
          };
        case "success":
          const r = {
            ...s,
            ...Um(n.data, n.dataUpdatedAt),
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
    this.state = i(this.state), tt.batch(() => {
      this.observers.forEach((s) => {
        s.onQueryUpdate();
      }), this.#a.notify({ query: this, type: "updated", action: n });
    });
  }
};
function Tp(n, i) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: jp(i.networkMode) ? "fetching" : "paused",
    ...n === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function Um(n, i) {
  return {
    data: n,
    dataUpdatedAt: i ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: "success"
  };
}
function Zm(n) {
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
var ob = class extends Ai {
  constructor(n, i) {
    super(), this.options = i, this.#e = n, this.#s = null, this.#u = Ko(), this.bindMethods(), this.setOptions(i);
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
    this.listeners.size === 1 && (this.#t.addObserver(this), Qm(this.#t, this.options) ? this.#h() : this.updateResult(), this.#b());
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return Vo(
      this.#t,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return Vo(
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
    if (this.options = this.#e.defaultQueryOptions(n), this.options.enabled !== void 0 && typeof this.options.enabled != "boolean" && typeof this.options.enabled != "function" && typeof Rt(this.options.enabled, this.#t) != "boolean")
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    this.#z(), this.#t.setOptions(this.options), i._defaulted && !lu(this.options, i) && this.#e.getQueryCache().notify({
      type: "observerOptionsUpdated",
      query: this.#t,
      observer: this
    });
    const r = this.hasListeners();
    r && Hm(
      this.#t,
      s,
      this.options,
      i
    ) && this.#h(), this.updateResult(), r && (this.#t !== s || Rt(this.options.enabled, this.#t) !== Rt(i.enabled, this.#t) || sa(this.options.staleTime, this.#t) !== sa(i.staleTime, this.#t)) && this.#v();
    const c = this.#y();
    r && (this.#t !== s || Rt(this.options.enabled, this.#t) !== Rt(i.enabled, this.#t) || c !== this.#o) && this.#g(c);
  }
  getOptimisticResult(n) {
    const i = this.#e.getQueryCache().build(this.#e, n), s = this.createResult(i, n);
    return fb(this, s) && (this.#a = s, this.#i = this.options, this.#l = this.#t.state), s;
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
    return n?.throwOnError || (i = i.catch(pt)), i;
  }
  #v() {
    this.#_();
    const n = sa(
      this.options.staleTime,
      this.#t
    );
    if (Cl.isServer() || this.#a.isStale || !Lo(n))
      return;
    const s = Sp(this.#a.dataUpdatedAt, n) + 1;
    this.#f = Aa.setTimeout(() => {
      this.#a.isStale || this.updateResult();
    }, s);
  }
  #y() {
    return (typeof this.options.refetchInterval == "function" ? this.options.refetchInterval(this.#t) : this.options.refetchInterval) ?? !1;
  }
  #g(n) {
    this.#S(), this.#o = n, !(Cl.isServer() || Rt(this.options.enabled, this.#t) === !1 || !Lo(this.#o) || this.#o === 0) && (this.#d = Aa.setInterval(() => {
      (this.options.refetchIntervalInBackground || ic.isFocused()) && this.#h();
    }, this.#o));
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
    const s = this.#t, r = this.options, c = this.#a, m = this.#l, d = this.#i, g = n !== s ? n.state : this.#n, { state: y } = n;
    let _ = { ...y }, j = !1, w;
    if (i._optimisticResults) {
      const Z = this.hasListeners(), se = !Z && Qm(n, i), ze = Z && Hm(n, s, i, r);
      (se || ze) && (_ = {
        ..._,
        ...Tp(y.data, n.options)
      }), i._optimisticResults === "isRestoring" && (_.fetchStatus = "idle");
    }
    let { error: O, errorUpdatedAt: M, status: H } = _;
    w = _.data;
    let W = !1;
    if (i.placeholderData !== void 0 && w === void 0 && H === "pending") {
      let Z;
      c?.isPlaceholderData && i.placeholderData === d?.placeholderData ? (Z = c.data, W = !0) : Z = typeof i.placeholderData == "function" ? i.placeholderData(
        this.#m?.state.data,
        this.#m
      ) : i.placeholderData, Z !== void 0 && (H = "success", w = Yo(
        c?.data,
        Z,
        i
      ), j = !0);
    }
    if (i.select && w !== void 0 && !W)
      if (c && w === m?.data && i.select === this.#c)
        w = this.#r;
      else
        try {
          this.#c = i.select, w = i.select(w), w = Yo(c?.data, w, i), this.#r = w, this.#s = null;
        } catch (Z) {
          this.#s = Z;
        }
    this.#s && (O = this.#s, w = this.#r, M = Date.now(), H = "error");
    const $ = _.fetchStatus === "fetching", ne = H === "pending", ee = H === "error", G = ne && $, K = w !== void 0, Y = {
      status: H,
      fetchStatus: _.fetchStatus,
      isPending: ne,
      isSuccess: H === "success",
      isError: ee,
      isInitialLoading: G,
      isLoading: G,
      data: w,
      dataUpdatedAt: _.dataUpdatedAt,
      error: O,
      errorUpdatedAt: M,
      failureCount: _.fetchFailureCount,
      failureReason: _.fetchFailureReason,
      errorUpdateCount: _.errorUpdateCount,
      isFetched: n.isFetched(),
      isFetchedAfterMount: _.dataUpdateCount > g.dataUpdateCount || _.errorUpdateCount > g.errorUpdateCount,
      isFetching: $,
      isRefetching: $ && !ne,
      isLoadingError: ee && !K,
      isPaused: _.fetchStatus === "paused",
      isPlaceholderData: j,
      isRefetchError: ee && K,
      isStale: rc(n, i),
      refetch: this.refetch,
      promise: this.#u,
      isEnabled: Rt(i.enabled, n) !== !1
    };
    if (this.options.experimental_prefetchInRender) {
      const Z = Y.data !== void 0, se = Y.status === "error" && !Z, ze = (je) => {
        se ? je.reject(Y.error) : Z && je.resolve(Y.data);
      }, we = () => {
        const je = this.#u = Y.promise = Ko();
        ze(je);
      }, Re = this.#u;
      switch (Re.status) {
        case "pending":
          n.queryHash === s.queryHash && ze(Re);
          break;
        case "fulfilled":
          (se || Y.data !== Re.value) && we();
          break;
        case "rejected":
          (!se || Y.error !== Re.reason) && we();
          break;
      }
    }
    return Y;
  }
  updateResult() {
    const n = this.#a, i = this.createResult(this.#t, this.options);
    if (this.#l = this.#t.state, this.#i = this.options, this.#l.data !== void 0 && (this.#m = this.#t), lu(i, n))
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
      return this.options.throwOnError && m.add("error"), Object.keys(this.#a).some((d) => {
        const v = d;
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
    tt.batch(() => {
      n.listeners && this.listeners.forEach((i) => {
        i(this.#a);
      }), this.#e.getQueryCache().notify({
        query: this.#t,
        type: "observerResultsUpdated"
      });
    });
  }
};
function cb(n, i) {
  return Rt(i.enabled, n) !== !1 && n.state.data === void 0 && !(n.state.status === "error" && Rt(i.retryOnMount, n) === !1);
}
function Qm(n, i) {
  return cb(n, i) || n.state.data !== void 0 && Vo(n, i, i.refetchOnMount);
}
function Vo(n, i, s) {
  if (Rt(i.enabled, n) !== !1 && sa(i.staleTime, n) !== "static") {
    const r = typeof s == "function" ? s(n) : s;
    return r === "always" || r !== !1 && rc(n, i);
  }
  return !1;
}
function Hm(n, i, s, r) {
  return (n !== i || Rt(r.enabled, n) === !1) && (!s.suspense || n.state.status !== "error") && rc(n, s);
}
function rc(n, i) {
  return Rt(i.enabled, n) !== !1 && n.isStaleByTime(sa(i.staleTime, n));
}
function fb(n, i) {
  return !lu(n.getCurrentResult(), i);
}
var db = class extends Ep {
  #e;
  #t;
  #n;
  #a;
  constructor(n) {
    super(), this.#e = n.client, this.mutationId = n.mutationId, this.#n = n.mutationCache, this.#t = [], this.state = n.state || Ap(), this.setOptions(n.options), this.scheduleGc();
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
    this.#a = xp({
      fn: () => this.options.mutationFn ? this.options.mutationFn(n, s) : Promise.reject(new Error("No mutationFn found")),
      onFail: (m, d) => {
        this.#l({ type: "failed", failureCount: m, error: d });
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
        const d = await this.options.onMutate?.(
          n,
          s
        );
        d !== this.state.context && this.#l({
          type: "pending",
          context: d,
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
      } catch (d) {
        Promise.reject(d);
      }
      try {
        await this.options.onError?.(
          m,
          n,
          this.state.context,
          s
        );
      } catch (d) {
        Promise.reject(d);
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
      } catch (d) {
        Promise.reject(d);
      }
      try {
        await this.options.onSettled?.(
          void 0,
          m,
          n,
          this.state.context,
          s
        );
      } catch (d) {
        Promise.reject(d);
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
    this.state = i(this.state), tt.batch(() => {
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
function Ap() {
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
var hb = class extends Ai {
  constructor(n = {}) {
    super(), this.config = n, this.#e = /* @__PURE__ */ new Set(), this.#t = /* @__PURE__ */ new Map(), this.#n = 0;
  }
  #e;
  #t;
  #n;
  build(n, i, s) {
    const r = new db({
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
    const i = Is(n);
    if (typeof i == "string") {
      const s = this.#t.get(i);
      s ? s.push(n) : this.#t.set(i, [n]);
    }
    this.notify({ type: "added", mutation: n });
  }
  remove(n) {
    if (this.#e.delete(n)) {
      const i = Is(n);
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
    const i = Is(n);
    if (typeof i == "string") {
      const r = this.#t.get(i)?.find(
        (c) => c.state.status === "pending"
      );
      return !r || r === n;
    } else
      return !0;
  }
  runNext(n) {
    const i = Is(n);
    return typeof i == "string" ? this.#t.get(i)?.find((r) => r !== n && r.state.isPaused)?.continue() ?? Promise.resolve() : Promise.resolve();
  }
  clear() {
    tt.batch(() => {
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
      (s) => Mm(i, s)
    );
  }
  findAll(n = {}) {
    return this.getAll().filter((i) => Mm(n, i));
  }
  notify(n) {
    tt.batch(() => {
      this.listeners.forEach((i) => {
        i(n);
      });
    });
  }
  resumePausedMutations() {
    const n = this.getAll().filter((i) => i.state.isPaused);
    return tt.batch(
      () => Promise.all(
        n.map((i) => i.continue().catch(pt))
      )
    );
  }
};
function Is(n) {
  return n.options.scope?.id;
}
var mb = class extends Ai {
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
    this.options = this.#e.defaultMutationOptions(n), lu(this.options, i) || this.#e.getMutationCache().notify({
      type: "observerOptionsUpdated",
      mutation: this.#n,
      observer: this
    }), i?.mutationKey && this.options.mutationKey && Ca(i.mutationKey) !== Ca(this.options.mutationKey) ? this.reset() : this.#n?.state.status === "pending" && this.#n.setOptions(this.options);
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
    const n = this.#n?.state ?? Ap();
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
    tt.batch(() => {
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
}, pb = class extends Ai {
  constructor(n = {}) {
    super(), this.config = n, this.#e = /* @__PURE__ */ new Map();
  }
  #e;
  build(n, i, s) {
    const r = i.queryKey, c = i.queryHash ?? lc(r, i);
    let m = this.get(c);
    return m || (m = new rb({
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
    tt.batch(() => {
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
      (s) => Nm(i, s)
    );
  }
  findAll(n = {}) {
    const i = this.getAll();
    return Object.keys(n).length > 0 ? i.filter((s) => Nm(n, s)) : i;
  }
  notify(n) {
    tt.batch(() => {
      this.listeners.forEach((i) => {
        i(n);
      });
    });
  }
  onFocus() {
    tt.batch(() => {
      this.getAll().forEach((n) => {
        n.onFocus();
      });
    });
  }
  onOnline() {
    tt.batch(() => {
      this.getAll().forEach((n) => {
        n.onOnline();
      });
    });
  }
}, vb = class {
  #e;
  #t;
  #n;
  #a;
  #l;
  #i;
  #u;
  #s;
  constructor(n = {}) {
    this.#e = n.queryCache || new pb(), this.#t = n.mutationCache || new hb(), this.#n = n.defaultOptions || {}, this.#a = /* @__PURE__ */ new Map(), this.#l = /* @__PURE__ */ new Map(), this.#i = 0;
  }
  mount() {
    this.#i++, this.#i === 1 && (this.#u = ic.subscribe(async (n) => {
      n && (await this.resumePausedMutations(), this.#e.onFocus());
    }), this.#s = su.subscribe(async (n) => {
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
    return r === void 0 ? this.fetchQuery(n) : (n.revalidateIfStale && s.isStaleByTime(sa(i.staleTime, s)) && this.prefetchQuery(i), Promise.resolve(r));
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
    )?.state.data, d = Fg(i, m);
    if (d !== void 0)
      return this.#e.build(this, r).setData(d, { ...s, manual: !0 });
  }
  setQueriesData(n, i, s) {
    return tt.batch(
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
    tt.batch(() => {
      i.findAll(n).forEach((s) => {
        i.remove(s);
      });
    });
  }
  resetQueries(n, i) {
    const s = this.#e;
    return tt.batch(() => (s.findAll(n).forEach((r) => {
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
    const s = { revert: !0, ...i }, r = tt.batch(
      () => this.#e.findAll(n).map((c) => c.cancel(s))
    );
    return Promise.all(r).then(pt).catch(pt);
  }
  invalidateQueries(n, i = {}) {
    return tt.batch(() => (this.#e.findAll(n).forEach((s) => {
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
    }, r = tt.batch(
      () => this.#e.findAll(n).filter((c) => !c.isDisabled() && !c.isStatic()).map((c) => {
        let m = c.fetch(void 0, s);
        return s.throwOnError || (m = m.catch(pt)), c.state.fetchStatus === "paused" ? Promise.resolve() : m;
      })
    );
    return Promise.all(r).then(pt);
  }
  fetchQuery(n) {
    const i = this.defaultQueryOptions(n);
    i.retry === void 0 && (i.retry = !1);
    const s = this.#e.build(this, i);
    return s.isStaleByTime(
      sa(i.staleTime, s)
    ) ? s.fetch(i) : Promise.resolve(s.state.data);
  }
  prefetchQuery(n) {
    return this.fetchQuery(n).then(pt).catch(pt);
  }
  fetchInfiniteQuery(n) {
    return n._type = "infinite", this.fetchQuery(n);
  }
  prefetchInfiniteQuery(n) {
    return this.fetchInfiniteQuery(n).then(pt).catch(pt);
  }
  ensureInfiniteQueryData(n) {
    return n._type = "infinite", this.ensureQueryData(n);
  }
  resumePausedMutations() {
    return su.isOnline() ? this.#t.resumePausedMutations() : Promise.resolve();
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
    this.#a.set(Ca(n), {
      queryKey: n,
      defaultOptions: i
    });
  }
  getQueryDefaults(n) {
    const i = [...this.#a.values()], s = {};
    return i.forEach((r) => {
      Ol(n, r.queryKey) && Object.assign(s, r.defaultOptions);
    }), s;
  }
  setMutationDefaults(n, i) {
    this.#l.set(Ca(n), {
      mutationKey: n,
      defaultOptions: i
    });
  }
  getMutationDefaults(n) {
    const i = [...this.#l.values()], s = {};
    return i.forEach((r) => {
      Ol(n, r.mutationKey) && Object.assign(s, r.defaultOptions);
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
    return i.queryHash || (i.queryHash = lc(
      i.queryKey,
      i
    )), i.refetchOnReconnect === void 0 && (i.refetchOnReconnect = i.networkMode !== "always"), i.throwOnError === void 0 && (i.throwOnError = !!i.suspense), !i.networkMode && i.persister && (i.networkMode = "offlineFirst"), i.queryFn === sc && (i.enabled = !1), i;
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
}, Op = I.createContext(
  void 0
), Oi = (n) => {
  const i = I.useContext(Op);
  if (!i)
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  return i;
}, yb = ({
  client: n,
  children: i
}) => (I.useEffect(() => (n.mount(), () => {
  n.unmount();
}), [n]), /* @__PURE__ */ h.jsx(Op.Provider, { value: n, children: i })), Cp = I.createContext(!1), gb = () => I.useContext(Cp);
Cp.Provider;
function bb() {
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
var _b = I.createContext(bb()), Sb = () => I.useContext(_b), zb = (n, i, s) => {
  const r = s?.state.error && typeof n.throwOnError == "function" ? uc(n.throwOnError, [s.state.error, s]) : n.throwOnError;
  (n.suspense || n.experimental_prefetchInRender || r) && (i.isReset() || (n.retryOnMount = !1));
}, wb = (n) => {
  I.useEffect(() => {
    n.clearReset();
  }, [n]);
}, jb = ({
  result: n,
  errorResetBoundary: i,
  throwOnError: s,
  query: r,
  suspense: c
}) => n.isError && !i.isReset() && !n.isFetching && r && (c && n.data === void 0 || uc(s, [n.error, r])), xb = (n) => {
  if (n.suspense) {
    const s = (c) => c === "static" ? c : Math.max(c ?? 1e3, 1e3), r = n.staleTime;
    n.staleTime = typeof r == "function" ? (...c) => s(r(...c)) : s(r), typeof n.gcTime == "number" && (n.gcTime = Math.max(
      n.gcTime,
      1e3
    ));
  }
}, Eb = (n, i) => n.isLoading && n.isFetching && !i, Tb = (n, i) => n?.suspense && i.isPending, km = (n, i, s) => i.fetchOptimistic(n).catch(() => {
  s.clearReset();
});
function Ab(n, i, s) {
  const r = gb(), c = Sb(), m = Oi(), d = m.defaultQueryOptions(n);
  m.getDefaultOptions().queries?._experimental_beforeQuery?.(
    d
  );
  const v = m.getQueryCache().get(d.queryHash), g = n.subscribed !== !1;
  d._optimisticResults = r ? "isRestoring" : g ? "optimistic" : void 0, xb(d), zb(d, c, v), wb(c);
  const y = !m.getQueryCache().get(d.queryHash), [_] = I.useState(
    () => new i(
      m,
      d
    )
  ), j = _.getOptimisticResult(d), w = !r && g;
  if (I.useSyncExternalStore(
    I.useCallback(
      (O) => {
        const M = w ? _.subscribe(tt.batchCalls(O)) : pt;
        return _.updateResult(), M;
      },
      [_, w]
    ),
    () => _.getCurrentResult(),
    () => _.getCurrentResult()
  ), I.useEffect(() => {
    _.setOptions(d);
  }, [d, _]), Tb(d, j))
    throw km(d, _, c);
  if (jb({
    result: j,
    errorResetBoundary: c,
    throwOnError: d.throwOnError,
    query: v,
    suspense: d.suspense
  }))
    throw j.error;
  return m.getDefaultOptions().queries?._experimental_afterQuery?.(
    d,
    j
  ), d.experimental_prefetchInRender && !Cl.isServer() && Eb(j, r) && (y ? (
    // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
    km(d, _, c)
  ) : (
    // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
    v?.promise
  ))?.catch(pt).finally(() => {
    _.updateResult();
  }), d.notifyOnChangeProps ? j : _.trackResult(j);
}
function En(n, i) {
  return Ab(n, ob);
}
function Kt(n, i) {
  const s = Oi(), [r] = I.useState(
    () => new mb(
      s,
      n
    )
  );
  I.useEffect(() => {
    r.setOptions(n);
  }, [r, n]);
  const c = I.useSyncExternalStore(
    I.useCallback(
      (d) => r.subscribe(tt.batchCalls(d)),
      [r]
    ),
    () => r.getCurrentResult(),
    () => r.getCurrentResult()
  ), m = I.useCallback(
    (d, v) => {
      r.mutate(d, v).catch(pt);
    },
    [r]
  );
  if (c.error && uc(r.options.throwOnError, [c.error]))
    throw c.error;
  return { ...c, mutate: m, mutateAsync: c.mutate };
}
var Bm;
function R(n, i, s) {
  function r(v, g) {
    if (v._zod || Object.defineProperty(v, "_zod", {
      value: {
        def: g,
        constr: d,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), v._zod.traits.has(n))
      return;
    v._zod.traits.add(n), i(v, g);
    const y = d.prototype, _ = Object.keys(y);
    for (let j = 0; j < _.length; j++) {
      const w = _[j];
      w in v || (v[w] = y[w].bind(v));
    }
  }
  const c = s?.Parent ?? Object;
  class m extends c {
  }
  Object.defineProperty(m, "name", { value: n });
  function d(v) {
    var g;
    const y = s?.Parent ? new m() : this;
    r(y, v), (g = y._zod).deferred ?? (g.deferred = []);
    for (const _ of y._zod.deferred)
      _();
    return y;
  }
  return Object.defineProperty(d, "init", { value: r }), Object.defineProperty(d, Symbol.hasInstance, {
    value: (v) => s?.Parent && v instanceof s.Parent ? !0 : v?._zod?.traits?.has(n)
  }), Object.defineProperty(d, "name", { value: n }), d;
}
class ji extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Np extends Error {
  constructor(i) {
    super(`Encountered unidirectional transform during encode: ${i}`), this.name = "ZodEncodeError";
  }
}
(Bm = globalThis).__zod_globalConfig ?? (Bm.__zod_globalConfig = {});
const oc = globalThis.__zod_globalConfig;
function Tn(n) {
  return oc;
}
function Mp(n) {
  const i = Object.values(n).filter((r) => typeof r == "number");
  return Object.entries(n).filter(([r, c]) => i.indexOf(+r) === -1).map(([r, c]) => c);
}
function Jo(n, i) {
  return typeof i == "bigint" ? i.toString() : i;
}
function cc(n) {
  return {
    get value() {
      {
        const i = n();
        return Object.defineProperty(this, "value", { value: i }), i;
      }
    }
  };
}
function fc(n) {
  return n == null;
}
function dc(n) {
  const i = n.startsWith("^") ? 1 : 0, s = n.endsWith("$") ? n.length - 1 : n.length;
  return n.slice(i, s);
}
function Ob(n, i) {
  const s = n / i, r = Math.round(s), c = Number.EPSILON * Math.max(Math.abs(s), 1);
  return Math.abs(s - r) < c ? 0 : s - r;
}
const $m = /* @__PURE__ */ Symbol("evaluating");
function Me(n, i, s) {
  let r;
  Object.defineProperty(n, i, {
    get() {
      if (r !== $m)
        return r === void 0 && (r = $m, r = s()), r;
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
function Da(n, i, s) {
  Object.defineProperty(n, i, {
    value: s,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function ua(...n) {
  const i = {};
  for (const s of n) {
    const r = Object.getOwnPropertyDescriptors(s);
    Object.assign(i, r);
  }
  return Object.defineProperties({}, i);
}
function Lm(n) {
  return JSON.stringify(n);
}
function Cb(n) {
  return n.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Dp = "captureStackTrace" in Error ? Error.captureStackTrace : (...n) => {
};
function uu(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
const Nb = /* @__PURE__ */ cc(() => {
  if (oc.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const n = Function;
    return new n(""), !0;
  } catch {
    return !1;
  }
});
function Ti(n) {
  if (uu(n) === !1)
    return !1;
  const i = n.constructor;
  if (i === void 0 || typeof i != "function")
    return !0;
  const s = i.prototype;
  return !(uu(s) === !1 || Object.prototype.hasOwnProperty.call(s, "isPrototypeOf") === !1);
}
function Rp(n) {
  return Ti(n) ? { ...n } : Array.isArray(n) ? [...n] : n instanceof Map ? new Map(n) : n instanceof Set ? new Set(n) : n;
}
const Mb = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function du(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ra(n, i, s) {
  const r = new n._zod.constr(i ?? n._zod.def);
  return (!i || s?.parent) && (r._zod.parent = n), r;
}
function te(n) {
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
function Db(n) {
  return Object.keys(n).filter((i) => n[i]._zod.optin === "optional" && n[i]._zod.optout === "optional");
}
const Rb = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function qb(n, i) {
  const s = n._zod.def, r = s.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const m = ua(n._zod.def, {
    get shape() {
      const d = {};
      for (const v in i) {
        if (!(v in s.shape))
          throw new Error(`Unrecognized key: "${v}"`);
        i[v] && (d[v] = s.shape[v]);
      }
      return Da(this, "shape", d), d;
    },
    checks: []
  });
  return ra(n, m);
}
function Ub(n, i) {
  const s = n._zod.def, r = s.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const m = ua(n._zod.def, {
    get shape() {
      const d = { ...n._zod.def.shape };
      for (const v in i) {
        if (!(v in s.shape))
          throw new Error(`Unrecognized key: "${v}"`);
        i[v] && delete d[v];
      }
      return Da(this, "shape", d), d;
    },
    checks: []
  });
  return ra(n, m);
}
function Zb(n, i) {
  if (!Ti(i))
    throw new Error("Invalid input to extend: expected a plain object");
  const s = n._zod.def.checks;
  if (s && s.length > 0) {
    const m = n._zod.def.shape;
    for (const d in i)
      if (Object.getOwnPropertyDescriptor(m, d) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const c = ua(n._zod.def, {
    get shape() {
      const m = { ...n._zod.def.shape, ...i };
      return Da(this, "shape", m), m;
    }
  });
  return ra(n, c);
}
function Qb(n, i) {
  if (!Ti(i))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const s = ua(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i };
      return Da(this, "shape", r), r;
    }
  });
  return ra(n, s);
}
function Hb(n, i) {
  if (n._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const s = ua(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i._zod.def.shape };
      return Da(this, "shape", r), r;
    },
    get catchall() {
      return i._zod.def.catchall;
    },
    checks: i._zod.def.checks ?? []
  });
  return ra(n, s);
}
function kb(n, i, s) {
  const c = i._zod.def.checks;
  if (c && c.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const d = ua(i._zod.def, {
    get shape() {
      const v = i._zod.def.shape, g = { ...v };
      if (s)
        for (const y in s) {
          if (!(y in v))
            throw new Error(`Unrecognized key: "${y}"`);
          s[y] && (g[y] = n ? new n({
            type: "optional",
            innerType: v[y]
          }) : v[y]);
        }
      else
        for (const y in v)
          g[y] = n ? new n({
            type: "optional",
            innerType: v[y]
          }) : v[y];
      return Da(this, "shape", g), g;
    },
    checks: []
  });
  return ra(i, d);
}
function Bb(n, i, s) {
  const r = ua(i._zod.def, {
    get shape() {
      const c = i._zod.def.shape, m = { ...c };
      if (s)
        for (const d in s) {
          if (!(d in m))
            throw new Error(`Unrecognized key: "${d}"`);
          s[d] && (m[d] = new n({
            type: "nonoptional",
            innerType: c[d]
          }));
        }
      else
        for (const d in c)
          m[d] = new n({
            type: "nonoptional",
            innerType: c[d]
          });
      return Da(this, "shape", m), m;
    }
  });
  return ra(i, r);
}
function zi(n, i = 0) {
  if (n.aborted === !0)
    return !0;
  for (let s = i; s < n.issues.length; s++)
    if (n.issues[s]?.continue !== !0)
      return !0;
  return !1;
}
function $b(n, i = 0) {
  if (n.aborted === !0)
    return !0;
  for (let s = i; s < n.issues.length; s++)
    if (n.issues[s]?.continue === !1)
      return !0;
  return !1;
}
function wi(n, i) {
  return i.map((s) => {
    var r;
    return (r = s).path ?? (r.path = []), s.path.unshift(n), s;
  });
}
function Ws(n) {
  return typeof n == "string" ? n : n?.message;
}
function An(n, i, s) {
  const r = n.message ? n.message : Ws(n.inst?._zod.def?.error?.(n)) ?? Ws(i?.error?.(n)) ?? Ws(s.customError?.(n)) ?? Ws(s.localeError?.(n)) ?? "Invalid input", { inst: c, continue: m, input: d, ...v } = n;
  return v.path ?? (v.path = []), v.message = r, i?.reportInput && (v.input = d), v;
}
function hc(n) {
  return Array.isArray(n) ? "array" : typeof n == "string" ? "string" : "unknown";
}
function Nl(...n) {
  const [i, s, r] = n;
  return typeof i == "string" ? {
    message: i,
    code: "custom",
    input: s,
    inst: r
  } : { ...i };
}
const qp = (n, i) => {
  n.name = "$ZodError", Object.defineProperty(n, "_zod", {
    value: n._zod,
    enumerable: !1
  }), Object.defineProperty(n, "issues", {
    value: i,
    enumerable: !1
  }), n.message = JSON.stringify(i, Jo, 2), Object.defineProperty(n, "toString", {
    value: () => n.message,
    enumerable: !1
  });
}, Up = R("$ZodError", qp), Zp = R("$ZodError", qp, { Parent: Error });
function Lb(n, i = (s) => s.message) {
  const s = {}, r = [];
  for (const c of n.issues)
    c.path.length > 0 ? (s[c.path[0]] = s[c.path[0]] || [], s[c.path[0]].push(i(c))) : r.push(i(c));
  return { formErrors: r, fieldErrors: s };
}
function Gb(n, i = (s) => s.message) {
  const s = { _errors: [] }, r = (c, m = []) => {
    for (const d of c.issues)
      if (d.code === "invalid_union" && d.errors.length)
        d.errors.map((v) => r({ issues: v }, [...m, ...d.path]));
      else if (d.code === "invalid_key")
        r({ issues: d.issues }, [...m, ...d.path]);
      else if (d.code === "invalid_element")
        r({ issues: d.issues }, [...m, ...d.path]);
      else {
        const v = [...m, ...d.path];
        if (v.length === 0)
          s._errors.push(i(d));
        else {
          let g = s, y = 0;
          for (; y < v.length; ) {
            const _ = v[y];
            y === v.length - 1 ? (g[_] = g[_] || { _errors: [] }, g[_]._errors.push(i(d))) : g[_] = g[_] || { _errors: [] }, g = g[_], y++;
          }
        }
      }
  };
  return r(n), s;
}
const mc = (n) => (i, s, r, c) => {
  const m = r ? { ...r, async: !1 } : { async: !1 }, d = i._zod.run({ value: s, issues: [] }, m);
  if (d instanceof Promise)
    throw new ji();
  if (d.issues.length) {
    const v = new (c?.Err ?? n)(d.issues.map((g) => An(g, m, Tn())));
    throw Dp(v, c?.callee), v;
  }
  return d.value;
}, pc = (n) => async (i, s, r, c) => {
  const m = r ? { ...r, async: !0 } : { async: !0 };
  let d = i._zod.run({ value: s, issues: [] }, m);
  if (d instanceof Promise && (d = await d), d.issues.length) {
    const v = new (c?.Err ?? n)(d.issues.map((g) => An(g, m, Tn())));
    throw Dp(v, c?.callee), v;
  }
  return d.value;
}, hu = (n) => (i, s, r) => {
  const c = r ? { ...r, async: !1 } : { async: !1 }, m = i._zod.run({ value: s, issues: [] }, c);
  if (m instanceof Promise)
    throw new ji();
  return m.issues.length ? {
    success: !1,
    error: new (n ?? Up)(m.issues.map((d) => An(d, c, Tn())))
  } : { success: !0, data: m.value };
}, Yb = /* @__PURE__ */ hu(Zp), mu = (n) => async (i, s, r) => {
  const c = r ? { ...r, async: !0 } : { async: !0 };
  let m = i._zod.run({ value: s, issues: [] }, c);
  return m instanceof Promise && (m = await m), m.issues.length ? {
    success: !1,
    error: new n(m.issues.map((d) => An(d, c, Tn())))
  } : { success: !0, data: m.value };
}, Kb = /* @__PURE__ */ mu(Zp), Xb = (n) => (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return mc(n)(i, s, c);
}, Vb = (n) => (i, s, r) => mc(n)(i, s, r), Jb = (n) => async (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return pc(n)(i, s, c);
}, Fb = (n) => async (i, s, r) => pc(n)(i, s, r), Ib = (n) => (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return hu(n)(i, s, c);
}, Wb = (n) => (i, s, r) => hu(n)(i, s, r), Pb = (n) => async (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return mu(n)(i, s, c);
}, e0 = (n) => async (i, s, r) => mu(n)(i, s, r), t0 = /^[cC][0-9a-z]{6,}$/, n0 = /^[0-9a-z]+$/, a0 = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, i0 = /^[0-9a-vA-V]{20}$/, l0 = /^[A-Za-z0-9]{27}$/, s0 = /^[a-zA-Z0-9_-]{21}$/, u0 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, r0 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Gm = (n) => n ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${n}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, o0 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, c0 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function f0() {
  return new RegExp(c0, "u");
}
const d0 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, h0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, m0 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, p0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, v0 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Qp = /^[A-Za-z0-9_-]*$/, y0 = /^https?$/, g0 = /^\+[1-9]\d{6,14}$/, Hp = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", b0 = /* @__PURE__ */ new RegExp(`^${Hp}$`);
function kp(n) {
  const i = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof n.precision == "number" ? n.precision === -1 ? `${i}` : n.precision === 0 ? `${i}:[0-5]\\d` : `${i}:[0-5]\\d\\.\\d{${n.precision}}` : `${i}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function _0(n) {
  return new RegExp(`^${kp(n)}$`);
}
function S0(n) {
  const i = kp({ precision: n.precision }), s = ["Z"];
  n.local && s.push(""), n.offset && s.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${i}(?:${s.join("|")})`;
  return new RegExp(`^${Hp}T(?:${r})$`);
}
const z0 = (n) => {
  const i = n ? `[\\s\\S]{${n?.minimum ?? 0},${n?.maximum ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${i}$`);
}, w0 = /^-?\d+$/, Bp = /^-?\d+(?:\.\d+)?$/, j0 = /^(?:true|false)$/i, x0 = /^null$/i, E0 = /^undefined$/i, T0 = /^[^A-Z]*$/, A0 = /^[^a-z]*$/, jt = /* @__PURE__ */ R("$ZodCheck", (n, i) => {
  var s;
  n._zod ?? (n._zod = {}), n._zod.def = i, (s = n._zod).onattach ?? (s.onattach = []);
}), $p = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Lp = /* @__PURE__ */ R("$ZodCheckLessThan", (n, i) => {
  jt.init(n, i);
  const s = $p[typeof i.value];
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
}), Gp = /* @__PURE__ */ R("$ZodCheckGreaterThan", (n, i) => {
  jt.init(n, i);
  const s = $p[typeof i.value];
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
}), O0 = /* @__PURE__ */ R("$ZodCheckMultipleOf", (n, i) => {
  jt.init(n, i), n._zod.onattach.push((s) => {
    var r;
    (r = s._zod.bag).multipleOf ?? (r.multipleOf = i.value);
  }), n._zod.check = (s) => {
    if (typeof s.value != typeof i.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof s.value == "bigint" ? s.value % i.value === BigInt(0) : Ob(s.value, i.value) === 0) || s.issues.push({
      origin: typeof s.value,
      code: "not_multiple_of",
      divisor: i.value,
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), C0 = /* @__PURE__ */ R("$ZodCheckNumberFormat", (n, i) => {
  jt.init(n, i), i.format = i.format || "float64";
  const s = i.format?.includes("int"), r = s ? "int" : "number", [c, m] = Rb[i.format];
  n._zod.onattach.push((d) => {
    const v = d._zod.bag;
    v.format = i.format, v.minimum = c, v.maximum = m, s && (v.pattern = w0);
  }), n._zod.check = (d) => {
    const v = d.value;
    if (s) {
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
    v < c && d.issues.push({
      origin: "number",
      input: v,
      code: "too_small",
      minimum: c,
      inclusive: !0,
      inst: n,
      continue: !i.abort
    }), v > m && d.issues.push({
      origin: "number",
      input: v,
      code: "too_big",
      maximum: m,
      inclusive: !0,
      inst: n,
      continue: !i.abort
    });
  };
}), N0 = /* @__PURE__ */ R("$ZodCheckMaxLength", (n, i) => {
  var s;
  jt.init(n, i), (s = n._zod.def).when ?? (s.when = (r) => {
    const c = r.value;
    return !fc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    i.maximum < c && (r._zod.bag.maximum = i.maximum);
  }), n._zod.check = (r) => {
    const c = r.value;
    if (c.length <= i.maximum)
      return;
    const d = hc(c);
    r.issues.push({
      origin: d,
      code: "too_big",
      maximum: i.maximum,
      inclusive: !0,
      input: c,
      inst: n,
      continue: !i.abort
    });
  };
}), M0 = /* @__PURE__ */ R("$ZodCheckMinLength", (n, i) => {
  var s;
  jt.init(n, i), (s = n._zod.def).when ?? (s.when = (r) => {
    const c = r.value;
    return !fc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    i.minimum > c && (r._zod.bag.minimum = i.minimum);
  }), n._zod.check = (r) => {
    const c = r.value;
    if (c.length >= i.minimum)
      return;
    const d = hc(c);
    r.issues.push({
      origin: d,
      code: "too_small",
      minimum: i.minimum,
      inclusive: !0,
      input: c,
      inst: n,
      continue: !i.abort
    });
  };
}), D0 = /* @__PURE__ */ R("$ZodCheckLengthEquals", (n, i) => {
  var s;
  jt.init(n, i), (s = n._zod.def).when ?? (s.when = (r) => {
    const c = r.value;
    return !fc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag;
    c.minimum = i.length, c.maximum = i.length, c.length = i.length;
  }), n._zod.check = (r) => {
    const c = r.value, m = c.length;
    if (m === i.length)
      return;
    const d = hc(c), v = m > i.length;
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
}), pu = /* @__PURE__ */ R("$ZodCheckStringFormat", (n, i) => {
  var s, r;
  jt.init(n, i), n._zod.onattach.push((c) => {
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
}), R0 = /* @__PURE__ */ R("$ZodCheckRegex", (n, i) => {
  pu.init(n, i), n._zod.check = (s) => {
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
}), q0 = /* @__PURE__ */ R("$ZodCheckLowerCase", (n, i) => {
  i.pattern ?? (i.pattern = T0), pu.init(n, i);
}), U0 = /* @__PURE__ */ R("$ZodCheckUpperCase", (n, i) => {
  i.pattern ?? (i.pattern = A0), pu.init(n, i);
}), Z0 = /* @__PURE__ */ R("$ZodCheckIncludes", (n, i) => {
  jt.init(n, i);
  const s = du(i.includes), r = new RegExp(typeof i.position == "number" ? `^.{${i.position}}${s}` : s);
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
}), Q0 = /* @__PURE__ */ R("$ZodCheckStartsWith", (n, i) => {
  jt.init(n, i);
  const s = new RegExp(`^${du(i.prefix)}.*`);
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
}), H0 = /* @__PURE__ */ R("$ZodCheckEndsWith", (n, i) => {
  jt.init(n, i);
  const s = new RegExp(`.*${du(i.suffix)}$`);
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
}), k0 = /* @__PURE__ */ R("$ZodCheckOverwrite", (n, i) => {
  jt.init(n, i), n._zod.check = (s) => {
    s.value = i.tx(s.value);
  };
});
class B0 {
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
`).filter((d) => d), c = Math.min(...r.map((d) => d.length - d.trimStart().length)), m = r.map((d) => d.slice(c)).map((d) => " ".repeat(this.indent * 2) + d);
    for (const d of m)
      this.content.push(d);
  }
  compile() {
    const i = Function, s = this?.args, c = [...(this?.content ?? [""]).map((m) => `  ${m}`)];
    return new i(...s, c.join(`
`));
  }
}
const $0 = {
  major: 4,
  minor: 4,
  patch: 3
}, He = /* @__PURE__ */ R("$ZodType", (n, i) => {
  var s;
  n ?? (n = {}), n._zod.def = i, n._zod.bag = n._zod.bag || {}, n._zod.version = $0;
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
    const c = (d, v, g) => {
      let y = zi(d), _;
      for (const j of v) {
        if (j._zod.def.when) {
          if ($b(d) || !j._zod.def.when(d))
            continue;
        } else if (y)
          continue;
        const w = d.issues.length, O = j._zod.check(d);
        if (O instanceof Promise && g?.async === !1)
          throw new ji();
        if (_ || O instanceof Promise)
          _ = (_ ?? Promise.resolve()).then(async () => {
            await O, d.issues.length !== w && (y || (y = zi(d, w)));
          });
        else {
          if (d.issues.length === w)
            continue;
          y || (y = zi(d, w));
        }
      }
      return _ ? _.then(() => d) : d;
    }, m = (d, v, g) => {
      if (zi(d))
        return d.aborted = !0, d;
      const y = c(v, r, g);
      if (y instanceof Promise) {
        if (g.async === !1)
          throw new ji();
        return y.then((_) => n._zod.parse(_, g));
      }
      return n._zod.parse(y, g);
    };
    n._zod.run = (d, v) => {
      if (v.skipChecks)
        return n._zod.parse(d, v);
      if (v.direction === "backward") {
        const y = n._zod.parse({ value: d.value, issues: [] }, { ...v, skipChecks: !0 });
        return y instanceof Promise ? y.then((_) => m(_, d, v)) : m(y, d, v);
      }
      const g = n._zod.parse(d, v);
      if (g instanceof Promise) {
        if (v.async === !1)
          throw new ji();
        return g.then((y) => c(y, r, v));
      }
      return c(g, r, v);
    };
  }
  Me(n, "~standard", () => ({
    validate: (c) => {
      try {
        const m = Yb(n, c);
        return m.success ? { value: m.data } : { issues: m.error?.issues };
      } catch {
        return Kb(n, c).then((d) => d.success ? { value: d.data } : { issues: d.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), vc = /* @__PURE__ */ R("$ZodString", (n, i) => {
  He.init(n, i), n._zod.pattern = [...n?._zod.bag?.patterns ?? []].pop() ?? z0(n._zod.bag), n._zod.parse = (s, r) => {
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
}), ke = /* @__PURE__ */ R("$ZodStringFormat", (n, i) => {
  pu.init(n, i), vc.init(n, i);
}), L0 = /* @__PURE__ */ R("$ZodGUID", (n, i) => {
  i.pattern ?? (i.pattern = r0), ke.init(n, i);
}), G0 = /* @__PURE__ */ R("$ZodUUID", (n, i) => {
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
    i.pattern ?? (i.pattern = Gm(r));
  } else
    i.pattern ?? (i.pattern = Gm());
  ke.init(n, i);
}), Y0 = /* @__PURE__ */ R("$ZodEmail", (n, i) => {
  i.pattern ?? (i.pattern = o0), ke.init(n, i);
}), K0 = /* @__PURE__ */ R("$ZodURL", (n, i) => {
  ke.init(n, i), n._zod.check = (s) => {
    try {
      const r = s.value.trim();
      if (!i.normalize && i.protocol?.source === y0.source && !/^https?:\/\//i.test(r)) {
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
}), X0 = /* @__PURE__ */ R("$ZodEmoji", (n, i) => {
  i.pattern ?? (i.pattern = f0()), ke.init(n, i);
}), V0 = /* @__PURE__ */ R("$ZodNanoID", (n, i) => {
  i.pattern ?? (i.pattern = s0), ke.init(n, i);
}), J0 = /* @__PURE__ */ R("$ZodCUID", (n, i) => {
  i.pattern ?? (i.pattern = t0), ke.init(n, i);
}), F0 = /* @__PURE__ */ R("$ZodCUID2", (n, i) => {
  i.pattern ?? (i.pattern = n0), ke.init(n, i);
}), I0 = /* @__PURE__ */ R("$ZodULID", (n, i) => {
  i.pattern ?? (i.pattern = a0), ke.init(n, i);
}), W0 = /* @__PURE__ */ R("$ZodXID", (n, i) => {
  i.pattern ?? (i.pattern = i0), ke.init(n, i);
}), P0 = /* @__PURE__ */ R("$ZodKSUID", (n, i) => {
  i.pattern ?? (i.pattern = l0), ke.init(n, i);
}), e_ = /* @__PURE__ */ R("$ZodISODateTime", (n, i) => {
  i.pattern ?? (i.pattern = S0(i)), ke.init(n, i);
}), t_ = /* @__PURE__ */ R("$ZodISODate", (n, i) => {
  i.pattern ?? (i.pattern = b0), ke.init(n, i);
}), n_ = /* @__PURE__ */ R("$ZodISOTime", (n, i) => {
  i.pattern ?? (i.pattern = _0(i)), ke.init(n, i);
}), a_ = /* @__PURE__ */ R("$ZodISODuration", (n, i) => {
  i.pattern ?? (i.pattern = u0), ke.init(n, i);
}), i_ = /* @__PURE__ */ R("$ZodIPv4", (n, i) => {
  i.pattern ?? (i.pattern = d0), ke.init(n, i), n._zod.bag.format = "ipv4";
}), l_ = /* @__PURE__ */ R("$ZodIPv6", (n, i) => {
  i.pattern ?? (i.pattern = h0), ke.init(n, i), n._zod.bag.format = "ipv6", n._zod.check = (s) => {
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
}), s_ = /* @__PURE__ */ R("$ZodCIDRv4", (n, i) => {
  i.pattern ?? (i.pattern = m0), ke.init(n, i);
}), u_ = /* @__PURE__ */ R("$ZodCIDRv6", (n, i) => {
  i.pattern ?? (i.pattern = p0), ke.init(n, i), n._zod.check = (s) => {
    const r = s.value.split("/");
    try {
      if (r.length !== 2)
        throw new Error();
      const [c, m] = r;
      if (!m)
        throw new Error();
      const d = Number(m);
      if (`${d}` !== m)
        throw new Error();
      if (d < 0 || d > 128)
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
function Yp(n) {
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
const r_ = /* @__PURE__ */ R("$ZodBase64", (n, i) => {
  i.pattern ?? (i.pattern = v0), ke.init(n, i), n._zod.bag.contentEncoding = "base64", n._zod.check = (s) => {
    Yp(s.value) || s.issues.push({
      code: "invalid_format",
      format: "base64",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
});
function o_(n) {
  if (!Qp.test(n))
    return !1;
  const i = n.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), s = i.padEnd(Math.ceil(i.length / 4) * 4, "=");
  return Yp(s);
}
const c_ = /* @__PURE__ */ R("$ZodBase64URL", (n, i) => {
  i.pattern ?? (i.pattern = Qp), ke.init(n, i), n._zod.bag.contentEncoding = "base64url", n._zod.check = (s) => {
    o_(s.value) || s.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), f_ = /* @__PURE__ */ R("$ZodE164", (n, i) => {
  i.pattern ?? (i.pattern = g0), ke.init(n, i);
});
function d_(n, i = null) {
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
const h_ = /* @__PURE__ */ R("$ZodJWT", (n, i) => {
  ke.init(n, i), n._zod.check = (s) => {
    d_(s.value, i.alg) || s.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), Kp = /* @__PURE__ */ R("$ZodNumber", (n, i) => {
  He.init(n, i), n._zod.pattern = n._zod.bag.pattern ?? Bp, n._zod.parse = (s, r) => {
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
}), m_ = /* @__PURE__ */ R("$ZodNumberFormat", (n, i) => {
  C0.init(n, i), Kp.init(n, i);
}), p_ = /* @__PURE__ */ R("$ZodBoolean", (n, i) => {
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
}), v_ = /* @__PURE__ */ R("$ZodUndefined", (n, i) => {
  He.init(n, i), n._zod.pattern = E0, n._zod.values = /* @__PURE__ */ new Set([void 0]), n._zod.parse = (s, r) => {
    const c = s.value;
    return typeof c > "u" || s.issues.push({
      expected: "undefined",
      code: "invalid_type",
      input: c,
      inst: n
    }), s;
  };
}), y_ = /* @__PURE__ */ R("$ZodNull", (n, i) => {
  He.init(n, i), n._zod.pattern = x0, n._zod.values = /* @__PURE__ */ new Set([null]), n._zod.parse = (s, r) => {
    const c = s.value;
    return c === null || s.issues.push({
      expected: "null",
      code: "invalid_type",
      input: c,
      inst: n
    }), s;
  };
}), g_ = /* @__PURE__ */ R("$ZodUnknown", (n, i) => {
  He.init(n, i), n._zod.parse = (s) => s;
}), b_ = /* @__PURE__ */ R("$ZodNever", (n, i) => {
  He.init(n, i), n._zod.parse = (s, r) => (s.issues.push({
    expected: "never",
    code: "invalid_type",
    input: s.value,
    inst: n
  }), s);
});
function Ym(n, i, s) {
  n.issues.length && i.issues.push(...wi(s, n.issues)), i.value[s] = n.value;
}
const __ = /* @__PURE__ */ R("$ZodArray", (n, i) => {
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
    for (let d = 0; d < c.length; d++) {
      const v = c[d], g = i.element._zod.run({
        value: v,
        issues: []
      }, r);
      g instanceof Promise ? m.push(g.then((y) => Ym(y, s, d))) : Ym(g, s, d);
    }
    return m.length ? Promise.all(m).then(() => s) : s;
  };
});
function ru(n, i, s, r, c, m) {
  const d = s in r;
  if (n.issues.length) {
    if (c && m && !d)
      return;
    i.issues.push(...wi(s, n.issues));
  }
  if (!d && !c) {
    n.issues.length || i.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: void 0,
      path: [s]
    });
    return;
  }
  n.value === void 0 ? d && (i.value[s] = void 0) : i.value[s] = n.value;
}
function Xp(n) {
  const i = Object.keys(n.shape);
  for (const r of i)
    if (!n.shape?.[r]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${r}": expected a Zod schema`);
  const s = Db(n.shape);
  return {
    ...n,
    keys: i,
    keySet: new Set(i),
    numKeys: i.length,
    optionalKeys: new Set(s)
  };
}
function Vp(n, i, s, r, c, m) {
  const d = [], v = c.keySet, g = c.catchall._zod, y = g.def.type, _ = g.optin === "optional", j = g.optout === "optional";
  for (const w in i) {
    if (w === "__proto__" || v.has(w))
      continue;
    if (y === "never") {
      d.push(w);
      continue;
    }
    const O = g.run({ value: i[w], issues: [] }, r);
    O instanceof Promise ? n.push(O.then((M) => ru(M, s, w, i, _, j))) : ru(O, s, w, i, _, j);
  }
  return d.length && s.issues.push({
    code: "unrecognized_keys",
    keys: d,
    input: i,
    inst: m
  }), n.length ? Promise.all(n).then(() => s) : s;
}
const S_ = /* @__PURE__ */ R("$ZodObject", (n, i) => {
  if (He.init(n, i), !Object.getOwnPropertyDescriptor(i, "shape")?.get) {
    const v = i.shape;
    Object.defineProperty(i, "shape", {
      get: () => {
        const g = { ...v };
        return Object.defineProperty(i, "shape", {
          value: g
        }), g;
      }
    });
  }
  const r = cc(() => Xp(i));
  Me(n._zod, "propValues", () => {
    const v = i.shape, g = {};
    for (const y in v) {
      const _ = v[y]._zod;
      if (_.values) {
        g[y] ?? (g[y] = /* @__PURE__ */ new Set());
        for (const j of _.values)
          g[y].add(j);
      }
    }
    return g;
  });
  const c = uu, m = i.catchall;
  let d;
  n._zod.parse = (v, g) => {
    d ?? (d = r.value);
    const y = v.value;
    if (!c(y))
      return v.issues.push({
        expected: "object",
        code: "invalid_type",
        input: y,
        inst: n
      }), v;
    v.value = {};
    const _ = [], j = d.shape;
    for (const w of d.keys) {
      const O = j[w], M = O._zod.optin === "optional", H = O._zod.optout === "optional", W = O._zod.run({ value: y[w], issues: [] }, g);
      W instanceof Promise ? _.push(W.then(($) => ru($, v, w, y, M, H))) : ru(W, v, w, y, M, H);
    }
    return m ? Vp(_, y, v, g, r.value, n) : _.length ? Promise.all(_).then(() => v) : v;
  };
}), z_ = /* @__PURE__ */ R("$ZodObjectJIT", (n, i) => {
  S_.init(n, i);
  const s = n._zod.parse, r = cc(() => Xp(i)), c = (w) => {
    const O = new B0(["shape", "payload", "ctx"]), M = r.value, H = (ee) => {
      const G = Lm(ee);
      return `shape[${G}]._zod.run({ value: input[${G}], issues: [] }, ctx)`;
    };
    O.write("const input = payload.value;");
    const W = /* @__PURE__ */ Object.create(null);
    let $ = 0;
    for (const ee of M.keys)
      W[ee] = `key_${$++}`;
    O.write("const newResult = {};");
    for (const ee of M.keys) {
      const G = W[ee], K = Lm(ee), B = w[ee], Y = B?._zod?.optin === "optional", Z = B?._zod?.optout === "optional";
      O.write(`const ${G} = ${H(ee)};`), Y && Z ? O.write(`
        if (${G}.issues.length) {
          if (${K} in input) {
            payload.issues = payload.issues.concat(${G}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${K}, ...iss.path] : [${K}]
            })));
          }
        }
        
        if (${G}.value === undefined) {
          if (${K} in input) {
            newResult[${K}] = undefined;
          }
        } else {
          newResult[${K}] = ${G}.value;
        }
        
      `) : Y ? O.write(`
        if (${G}.issues.length) {
          payload.issues = payload.issues.concat(${G}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${K}, ...iss.path] : [${K}]
          })));
        }
        
        if (${G}.value === undefined) {
          if (${K} in input) {
            newResult[${K}] = undefined;
          }
        } else {
          newResult[${K}] = ${G}.value;
        }
        
      `) : O.write(`
        const ${G}_present = ${K} in input;
        if (${G}.issues.length) {
          payload.issues = payload.issues.concat(${G}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${K}, ...iss.path] : [${K}]
          })));
        }
        if (!${G}_present && !${G}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${K}]
          });
        }

        if (${G}_present) {
          if (${G}.value === undefined) {
            newResult[${K}] = undefined;
          } else {
            newResult[${K}] = ${G}.value;
          }
        }

      `);
    }
    O.write("payload.value = newResult;"), O.write("return payload;");
    const ne = O.compile();
    return (ee, G) => ne(w, ee, G);
  };
  let m;
  const d = uu, v = !oc.jitless, y = v && Nb.value, _ = i.catchall;
  let j;
  n._zod.parse = (w, O) => {
    j ?? (j = r.value);
    const M = w.value;
    return d(M) ? v && y && O?.async === !1 && O.jitless !== !0 ? (m || (m = c(i.shape)), w = m(w, O), _ ? Vp([], M, w, O, j, n) : w) : s(w, O) : (w.issues.push({
      expected: "object",
      code: "invalid_type",
      input: M,
      inst: n
    }), w);
  };
});
function Km(n, i, s, r) {
  for (const m of n)
    if (m.issues.length === 0)
      return i.value = m.value, i;
  const c = n.filter((m) => !zi(m));
  return c.length === 1 ? (i.value = c[0].value, c[0]) : (i.issues.push({
    code: "invalid_union",
    input: i.value,
    inst: s,
    errors: n.map((m) => m.issues.map((d) => An(d, r, Tn())))
  }), i);
}
const w_ = /* @__PURE__ */ R("$ZodUnion", (n, i) => {
  He.init(n, i), Me(n._zod, "optin", () => i.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), Me(n._zod, "optout", () => i.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), Me(n._zod, "values", () => {
    if (i.options.every((r) => r._zod.values))
      return new Set(i.options.flatMap((r) => Array.from(r._zod.values)));
  }), Me(n._zod, "pattern", () => {
    if (i.options.every((r) => r._zod.pattern)) {
      const r = i.options.map((c) => c._zod.pattern);
      return new RegExp(`^(${r.map((c) => dc(c.source)).join("|")})$`);
    }
  });
  const s = i.options.length === 1 ? i.options[0]._zod.run : null;
  n._zod.parse = (r, c) => {
    if (s)
      return s(r, c);
    let m = !1;
    const d = [];
    for (const v of i.options) {
      const g = v._zod.run({
        value: r.value,
        issues: []
      }, c);
      if (g instanceof Promise)
        d.push(g), m = !0;
      else {
        if (g.issues.length === 0)
          return g;
        d.push(g);
      }
    }
    return m ? Promise.all(d).then((v) => Km(v, r, n, c)) : Km(d, r, n, c);
  };
}), j_ = /* @__PURE__ */ R("$ZodIntersection", (n, i) => {
  He.init(n, i), n._zod.parse = (s, r) => {
    const c = s.value, m = i.left._zod.run({ value: c, issues: [] }, r), d = i.right._zod.run({ value: c, issues: [] }, r);
    return m instanceof Promise || d instanceof Promise ? Promise.all([m, d]).then(([g, y]) => Xm(s, g, y)) : Xm(s, m, d);
  };
});
function Fo(n, i) {
  if (n === i)
    return { valid: !0, data: n };
  if (n instanceof Date && i instanceof Date && +n == +i)
    return { valid: !0, data: n };
  if (Ti(n) && Ti(i)) {
    const s = Object.keys(i), r = Object.keys(n).filter((m) => s.indexOf(m) !== -1), c = { ...n, ...i };
    for (const m of r) {
      const d = Fo(n[m], i[m]);
      if (!d.valid)
        return {
          valid: !1,
          mergeErrorPath: [m, ...d.mergeErrorPath]
        };
      c[m] = d.data;
    }
    return { valid: !0, data: c };
  }
  if (Array.isArray(n) && Array.isArray(i)) {
    if (n.length !== i.length)
      return { valid: !1, mergeErrorPath: [] };
    const s = [];
    for (let r = 0; r < n.length; r++) {
      const c = n[r], m = i[r], d = Fo(c, m);
      if (!d.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...d.mergeErrorPath]
        };
      s.push(d.data);
    }
    return { valid: !0, data: s };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Xm(n, i, s) {
  const r = /* @__PURE__ */ new Map();
  let c;
  for (const v of i.issues)
    if (v.code === "unrecognized_keys") {
      c ?? (c = v);
      for (const g of v.keys)
        r.has(g) || r.set(g, {}), r.get(g).l = !0;
    } else
      n.issues.push(v);
  for (const v of s.issues)
    if (v.code === "unrecognized_keys")
      for (const g of v.keys)
        r.has(g) || r.set(g, {}), r.get(g).r = !0;
    else
      n.issues.push(v);
  const m = [...r].filter(([, v]) => v.l && v.r).map(([v]) => v);
  if (m.length && c && n.issues.push({ ...c, keys: m }), zi(n))
    return n;
  const d = Fo(i.value, s.value);
  if (!d.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(d.mergeErrorPath)}`);
  return n.value = d.data, n;
}
const x_ = /* @__PURE__ */ R("$ZodRecord", (n, i) => {
  He.init(n, i), n._zod.parse = (s, r) => {
    const c = s.value;
    if (!Ti(c))
      return s.issues.push({
        expected: "record",
        code: "invalid_type",
        input: c,
        inst: n
      }), s;
    const m = [], d = i.keyType._zod.values;
    if (d) {
      s.value = {};
      const v = /* @__PURE__ */ new Set();
      for (const y of d)
        if (typeof y == "string" || typeof y == "number" || typeof y == "symbol") {
          v.add(typeof y == "number" ? y.toString() : y);
          const _ = i.keyType._zod.run({ value: y, issues: [] }, r);
          if (_ instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          if (_.issues.length) {
            s.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: _.issues.map((O) => An(O, r, Tn())),
              input: y,
              path: [y],
              inst: n
            });
            continue;
          }
          const j = _.value, w = i.valueType._zod.run({ value: c[y], issues: [] }, r);
          w instanceof Promise ? m.push(w.then((O) => {
            O.issues.length && s.issues.push(...wi(y, O.issues)), s.value[j] = O.value;
          })) : (w.issues.length && s.issues.push(...wi(y, w.issues)), s.value[j] = w.value);
        }
      let g;
      for (const y in c)
        v.has(y) || (g = g ?? [], g.push(y));
      g && g.length > 0 && s.issues.push({
        code: "unrecognized_keys",
        input: c,
        inst: n,
        keys: g
      });
    } else {
      s.value = {};
      for (const v of Reflect.ownKeys(c)) {
        if (v === "__proto__" || !Object.prototype.propertyIsEnumerable.call(c, v))
          continue;
        let g = i.keyType._zod.run({ value: v, issues: [] }, r);
        if (g instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof v == "string" && Bp.test(v) && g.issues.length) {
          const j = i.keyType._zod.run({ value: Number(v), issues: [] }, r);
          if (j instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          j.issues.length === 0 && (g = j);
        }
        if (g.issues.length) {
          i.mode === "loose" ? s.value[v] = c[v] : s.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: g.issues.map((j) => An(j, r, Tn())),
            input: v,
            path: [v],
            inst: n
          });
          continue;
        }
        const _ = i.valueType._zod.run({ value: c[v], issues: [] }, r);
        _ instanceof Promise ? m.push(_.then((j) => {
          j.issues.length && s.issues.push(...wi(v, j.issues)), s.value[g.value] = j.value;
        })) : (_.issues.length && s.issues.push(...wi(v, _.issues)), s.value[g.value] = _.value);
      }
    }
    return m.length ? Promise.all(m).then(() => s) : s;
  };
}), E_ = /* @__PURE__ */ R("$ZodEnum", (n, i) => {
  He.init(n, i);
  const s = Mp(i.entries), r = new Set(s);
  n._zod.values = r, n._zod.pattern = new RegExp(`^(${s.filter((c) => Mb.has(typeof c)).map((c) => typeof c == "string" ? du(c) : c.toString()).join("|")})$`), n._zod.parse = (c, m) => {
    const d = c.value;
    return r.has(d) || c.issues.push({
      code: "invalid_value",
      values: s,
      input: d,
      inst: n
    }), c;
  };
}), T_ = /* @__PURE__ */ R("$ZodTransform", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      throw new Np(n.constructor.name);
    const c = i.transform(s.value, s);
    if (r.async)
      return (c instanceof Promise ? c : Promise.resolve(c)).then((d) => (s.value = d, s.fallback = !0, s));
    if (c instanceof Promise)
      throw new ji();
    return s.value = c, s.fallback = !0, s;
  };
});
function Vm(n, i) {
  return i === void 0 && (n.issues.length || n.fallback) ? { issues: [], value: void 0 } : n;
}
const Jp = /* @__PURE__ */ R("$ZodOptional", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", n._zod.optout = "optional", Me(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, void 0]) : void 0), Me(n._zod, "pattern", () => {
    const s = i.innerType._zod.pattern;
    return s ? new RegExp(`^(${dc(s.source)})?$`) : void 0;
  }), n._zod.parse = (s, r) => {
    if (i.innerType._zod.optin === "optional") {
      const c = s.value, m = i.innerType._zod.run(s, r);
      return m instanceof Promise ? m.then((d) => Vm(d, c)) : Vm(m, c);
    }
    return s.value === void 0 ? s : i.innerType._zod.run(s, r);
  };
}), A_ = /* @__PURE__ */ R("$ZodExactOptional", (n, i) => {
  Jp.init(n, i), Me(n._zod, "values", () => i.innerType._zod.values), Me(n._zod, "pattern", () => i.innerType._zod.pattern), n._zod.parse = (s, r) => i.innerType._zod.run(s, r);
}), O_ = /* @__PURE__ */ R("$ZodNullable", (n, i) => {
  He.init(n, i), Me(n._zod, "optin", () => i.innerType._zod.optin), Me(n._zod, "optout", () => i.innerType._zod.optout), Me(n._zod, "pattern", () => {
    const s = i.innerType._zod.pattern;
    return s ? new RegExp(`^(${dc(s.source)}|null)$`) : void 0;
  }), Me(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, null]) : void 0), n._zod.parse = (s, r) => s.value === null ? s : i.innerType._zod.run(s, r);
}), C_ = /* @__PURE__ */ R("$ZodDefault", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", Me(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    if (s.value === void 0)
      return s.value = i.defaultValue, s;
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => Jm(m, i)) : Jm(c, i);
  };
});
function Jm(n, i) {
  return n.value === void 0 && (n.value = i.defaultValue), n;
}
const N_ = /* @__PURE__ */ R("$ZodPrefault", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", Me(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => (r.direction === "backward" || s.value === void 0 && (s.value = i.defaultValue), i.innerType._zod.run(s, r));
}), M_ = /* @__PURE__ */ R("$ZodNonOptional", (n, i) => {
  He.init(n, i), Me(n._zod, "values", () => {
    const s = i.innerType._zod.values;
    return s ? new Set([...s].filter((r) => r !== void 0)) : void 0;
  }), n._zod.parse = (s, r) => {
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => Fm(m, n)) : Fm(c, n);
  };
});
function Fm(n, i) {
  return !n.issues.length && n.value === void 0 && n.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: n.value,
    inst: i
  }), n;
}
const D_ = /* @__PURE__ */ R("$ZodCatch", (n, i) => {
  He.init(n, i), n._zod.optin = "optional", Me(n._zod, "optout", () => i.innerType._zod.optout), Me(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => (s.value = m.value, m.issues.length && (s.value = i.catchValue({
      ...s,
      error: {
        issues: m.issues.map((d) => An(d, r, Tn()))
      },
      input: s.value
    }), s.issues = [], s.fallback = !0), s)) : (s.value = c.value, c.issues.length && (s.value = i.catchValue({
      ...s,
      error: {
        issues: c.issues.map((m) => An(m, r, Tn()))
      },
      input: s.value
    }), s.issues = [], s.fallback = !0), s);
  };
}), R_ = /* @__PURE__ */ R("$ZodPipe", (n, i) => {
  He.init(n, i), Me(n._zod, "values", () => i.in._zod.values), Me(n._zod, "optin", () => i.in._zod.optin), Me(n._zod, "optout", () => i.out._zod.optout), Me(n._zod, "propValues", () => i.in._zod.propValues), n._zod.parse = (s, r) => {
    if (r.direction === "backward") {
      const m = i.out._zod.run(s, r);
      return m instanceof Promise ? m.then((d) => Ps(d, i.in, r)) : Ps(m, i.in, r);
    }
    const c = i.in._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => Ps(m, i.out, r)) : Ps(c, i.out, r);
  };
});
function Ps(n, i, s) {
  return n.issues.length ? (n.aborted = !0, n) : i._zod.run({ value: n.value, issues: n.issues, fallback: n.fallback }, s);
}
const q_ = /* @__PURE__ */ R("$ZodReadonly", (n, i) => {
  He.init(n, i), Me(n._zod, "propValues", () => i.innerType._zod.propValues), Me(n._zod, "values", () => i.innerType._zod.values), Me(n._zod, "optin", () => i.innerType?._zod?.optin), Me(n._zod, "optout", () => i.innerType?._zod?.optout), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then(Im) : Im(c);
  };
});
function Im(n) {
  return n.value = Object.freeze(n.value), n;
}
const U_ = /* @__PURE__ */ R("$ZodCustom", (n, i) => {
  jt.init(n, i), He.init(n, i), n._zod.parse = (s, r) => s, n._zod.check = (s) => {
    const r = s.value, c = i.fn(r);
    if (c instanceof Promise)
      return c.then((m) => Wm(m, s, r, n));
    Wm(c, s, r, n);
  };
});
function Wm(n, i, s, r) {
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
    r._zod.def.params && (c.params = r._zod.def.params), i.issues.push(Nl(c));
  }
}
var Pm;
class Z_ {
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
function Q_() {
  return new Z_();
}
(Pm = globalThis).__zod_globalRegistry ?? (Pm.__zod_globalRegistry = Q_());
const Al = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function H_(n, i) {
  return new n({
    type: "string",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function k_(n, i) {
  return new n({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function ep(n, i) {
  return new n({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function B_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function $_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function L_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function G_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function Y_(n, i) {
  return new n({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function K_(n, i) {
  return new n({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function X_(n, i) {
  return new n({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function V_(n, i) {
  return new n({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function J_(n, i) {
  return new n({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function F_(n, i) {
  return new n({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function I_(n, i) {
  return new n({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function W_(n, i) {
  return new n({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function P_(n, i) {
  return new n({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function eS(n, i) {
  return new n({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function tS(n, i) {
  return new n({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function nS(n, i) {
  return new n({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function aS(n, i) {
  return new n({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function iS(n, i) {
  return new n({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function lS(n, i) {
  return new n({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function sS(n, i) {
  return new n({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function uS(n, i) {
  return new n({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function rS(n, i) {
  return new n({
    type: "string",
    format: "date",
    check: "string_format",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function oS(n, i) {
  return new n({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function cS(n, i) {
  return new n({
    type: "string",
    format: "duration",
    check: "string_format",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function fS(n, i) {
  return new n({
    type: "number",
    checks: [],
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function dS(n, i) {
  return new n({
    type: "number",
    coerce: !0,
    checks: [],
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function hS(n, i) {
  return new n({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function mS(n, i) {
  return new n({
    type: "boolean",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function pS(n, i) {
  return new n({
    type: "undefined",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function vS(n, i) {
  return new n({
    type: "null",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function yS(n) {
  return new n({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function gS(n, i) {
  return new n({
    type: "never",
    ...te(i)
  });
}
// @__NO_SIDE_EFFECTS__
function tp(n, i) {
  return new Lp({
    check: "less_than",
    ...te(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Ho(n, i) {
  return new Lp({
    check: "less_than",
    ...te(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function np(n, i) {
  return new Gp({
    check: "greater_than",
    ...te(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function ko(n, i) {
  return new Gp({
    check: "greater_than",
    ...te(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function ap(n, i) {
  return new O0({
    check: "multiple_of",
    ...te(i),
    value: n
  });
}
// @__NO_SIDE_EFFECTS__
function Fp(n, i) {
  return new N0({
    check: "max_length",
    ...te(i),
    maximum: n
  });
}
// @__NO_SIDE_EFFECTS__
function ou(n, i) {
  return new M0({
    check: "min_length",
    ...te(i),
    minimum: n
  });
}
// @__NO_SIDE_EFFECTS__
function Ip(n, i) {
  return new D0({
    check: "length_equals",
    ...te(i),
    length: n
  });
}
// @__NO_SIDE_EFFECTS__
function bS(n, i) {
  return new R0({
    check: "string_format",
    format: "regex",
    ...te(i),
    pattern: n
  });
}
// @__NO_SIDE_EFFECTS__
function _S(n) {
  return new q0({
    check: "string_format",
    format: "lowercase",
    ...te(n)
  });
}
// @__NO_SIDE_EFFECTS__
function SS(n) {
  return new U0({
    check: "string_format",
    format: "uppercase",
    ...te(n)
  });
}
// @__NO_SIDE_EFFECTS__
function zS(n, i) {
  return new Z0({
    check: "string_format",
    format: "includes",
    ...te(i),
    includes: n
  });
}
// @__NO_SIDE_EFFECTS__
function wS(n, i) {
  return new Q0({
    check: "string_format",
    format: "starts_with",
    ...te(i),
    prefix: n
  });
}
// @__NO_SIDE_EFFECTS__
function jS(n, i) {
  return new H0({
    check: "string_format",
    format: "ends_with",
    ...te(i),
    suffix: n
  });
}
// @__NO_SIDE_EFFECTS__
function Ci(n) {
  return new k0({
    check: "overwrite",
    tx: n
  });
}
// @__NO_SIDE_EFFECTS__
function xS(n) {
  return /* @__PURE__ */ Ci((i) => i.normalize(n));
}
// @__NO_SIDE_EFFECTS__
function ES() {
  return /* @__PURE__ */ Ci((n) => n.trim());
}
// @__NO_SIDE_EFFECTS__
function TS() {
  return /* @__PURE__ */ Ci((n) => n.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function AS() {
  return /* @__PURE__ */ Ci((n) => n.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function OS() {
  return /* @__PURE__ */ Ci((n) => Cb(n));
}
// @__NO_SIDE_EFFECTS__
function CS(n, i, s) {
  return new n({
    type: "array",
    element: i,
    // get element() {
    //   return element;
    // },
    ...te(s)
  });
}
// @__NO_SIDE_EFFECTS__
function NS(n, i, s) {
  return new n({
    type: "custom",
    check: "custom",
    fn: i,
    ...te(s)
  });
}
// @__NO_SIDE_EFFECTS__
function MS(n, i) {
  const s = /* @__PURE__ */ DS((r) => (r.addIssue = (c) => {
    if (typeof c == "string")
      r.issues.push(Nl(c, r.value, s._zod.def));
    else {
      const m = c;
      m.fatal && (m.continue = !1), m.code ?? (m.code = "custom"), m.input ?? (m.input = r.value), m.inst ?? (m.inst = s), m.continue ?? (m.continue = !s._zod.def.abort), r.issues.push(Nl(m));
    }
  }, n(r.value, r)), i);
  return s;
}
// @__NO_SIDE_EFFECTS__
function DS(n, i) {
  const s = new jt({
    check: "custom",
    ...te(i)
  });
  return s._zod.check = n, s;
}
function Wp(n) {
  let i = n?.target ?? "draft-2020-12";
  return i === "draft-4" && (i = "draft-04"), i === "draft-7" && (i = "draft-07"), {
    processors: n.processors ?? {},
    metadataRegistry: n?.metadata ?? Al,
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
function Pe(n, i, s = { path: [], schemaPath: [] }) {
  var r;
  const c = n._zod.def, m = i.seen.get(n);
  if (m)
    return m.count++, s.schemaPath.includes(n) && (m.cycle = s.path), m.schema;
  const d = { schema: {}, count: 1, cycle: void 0, path: s.path };
  i.seen.set(n, d);
  const v = n._zod.toJSONSchema?.();
  if (v)
    d.schema = v;
  else {
    const _ = {
      ...s,
      schemaPath: [...s.schemaPath, n],
      path: s.path
    };
    if (n._zod.processJSONSchema)
      n._zod.processJSONSchema(i, d.schema, _);
    else {
      const w = d.schema, O = i.processors[c.type];
      if (!O)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${c.type}`);
      O(n, i, w, _);
    }
    const j = n._zod.parent;
    j && (d.ref || (d.ref = j), Pe(j, i, _), i.seen.get(j).isParent = !0);
  }
  const g = i.metadataRegistry.get(n);
  return g && Object.assign(d.schema, g), i.io === "input" && mt(n) && (delete d.schema.examples, delete d.schema.default), i.io === "input" && "_prefault" in d.schema && ((r = d.schema).default ?? (r.default = d.schema._prefault)), delete d.schema._prefault, i.seen.get(n).schema;
}
function Pp(n, i) {
  const s = n.seen.get(i);
  if (!s)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const d of n.seen.entries()) {
    const v = n.metadataRegistry.get(d[0])?.id;
    if (v) {
      const g = r.get(v);
      if (g && g !== d[0])
        throw new Error(`Duplicate schema id "${v}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(v, d[0]);
    }
  }
  const c = (d) => {
    const v = n.target === "draft-2020-12" ? "$defs" : "definitions";
    if (n.external) {
      const j = n.external.registry.get(d[0])?.id, w = n.external.uri ?? ((M) => M);
      if (j)
        return { ref: w(j) };
      const O = d[1].defId ?? d[1].schema.id ?? `schema${n.counter++}`;
      return d[1].defId = O, { defId: O, ref: `${w("__shared")}#/${v}/${O}` };
    }
    if (d[1] === s)
      return { ref: "#" };
    const y = `#/${v}/`, _ = d[1].schema.id ?? `__schema${n.counter++}`;
    return { defId: _, ref: y + _ };
  }, m = (d) => {
    if (d[1].schema.$ref)
      return;
    const v = d[1], { ref: g, defId: y } = c(d);
    v.def = { ...v.schema }, y && (v.defId = y);
    const _ = v.schema;
    for (const j in _)
      delete _[j];
    _.$ref = g;
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
      m(d);
      continue;
    }
    if (n.external) {
      const y = n.external.registry.get(d[0])?.id;
      if (i !== d[0] && y) {
        m(d);
        continue;
      }
    }
    if (n.metadataRegistry.get(d[0])?.id) {
      m(d);
      continue;
    }
    if (v.cycle) {
      m(d);
      continue;
    }
    if (v.count > 1 && n.reused === "ref") {
      m(d);
      continue;
    }
  }
}
function ev(n, i) {
  const s = n.seen.get(i);
  if (!s)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (v) => {
    const g = n.seen.get(v);
    if (g.ref === null)
      return;
    const y = g.def ?? g.schema, _ = { ...y }, j = g.ref;
    if (g.ref = null, j) {
      r(j);
      const O = n.seen.get(j), M = O.schema;
      if (M.$ref && (n.target === "draft-07" || n.target === "draft-04" || n.target === "openapi-3.0") ? (y.allOf = y.allOf ?? [], y.allOf.push(M)) : Object.assign(y, M), Object.assign(y, _), v._zod.parent === j)
        for (const W in y)
          W === "$ref" || W === "allOf" || W in _ || delete y[W];
      if (M.$ref && O.def)
        for (const W in y)
          W === "$ref" || W === "allOf" || W in O.def && JSON.stringify(y[W]) === JSON.stringify(O.def[W]) && delete y[W];
    }
    const w = v._zod.parent;
    if (w && w !== j) {
      r(w);
      const O = n.seen.get(w);
      if (O?.schema.$ref && (y.$ref = O.schema.$ref, O.def))
        for (const M in y)
          M === "$ref" || M === "allOf" || M in O.def && JSON.stringify(y[M]) === JSON.stringify(O.def[M]) && delete y[M];
    }
    n.override({
      zodSchema: v,
      jsonSchema: y,
      path: g.path ?? []
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
  const d = n.external?.defs ?? {};
  for (const v of n.seen.entries()) {
    const g = v[1];
    g.def && g.defId && (g.def.id === g.defId && delete g.def.id, d[g.defId] = g.def);
  }
  n.external || Object.keys(d).length > 0 && (n.target === "draft-2020-12" ? c.$defs = d : c.definitions = d);
  try {
    const v = JSON.parse(JSON.stringify(c));
    return Object.defineProperty(v, "~standard", {
      value: {
        ...i["~standard"],
        jsonSchema: {
          input: cu(i, "input", n.processors),
          output: cu(i, "output", n.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), v;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function mt(n, i) {
  const s = i ?? { seen: /* @__PURE__ */ new Set() };
  if (s.seen.has(n))
    return !1;
  s.seen.add(n);
  const r = n._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return mt(r.element, s);
  if (r.type === "set")
    return mt(r.valueType, s);
  if (r.type === "lazy")
    return mt(r.getter(), s);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return mt(r.innerType, s);
  if (r.type === "intersection")
    return mt(r.left, s) || mt(r.right, s);
  if (r.type === "record" || r.type === "map")
    return mt(r.keyType, s) || mt(r.valueType, s);
  if (r.type === "pipe")
    return n._zod.traits.has("$ZodCodec") ? !0 : mt(r.in, s) || mt(r.out, s);
  if (r.type === "object") {
    for (const c in r.shape)
      if (mt(r.shape[c], s))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const c of r.options)
      if (mt(c, s))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const c of r.items)
      if (mt(c, s))
        return !0;
    return !!(r.rest && mt(r.rest, s));
  }
  return !1;
}
const RS = (n, i = {}) => (s) => {
  const r = Wp({ ...s, processors: i });
  return Pe(n, r), Pp(r, n), ev(r, n);
}, cu = (n, i, s = {}) => (r) => {
  const { libraryOptions: c, target: m } = r ?? {}, d = Wp({ ...c ?? {}, target: m, io: i, processors: s });
  return Pe(n, d), Pp(d, n), ev(d, n);
}, qS = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, US = (n, i, s, r) => {
  const c = s;
  c.type = "string";
  const { minimum: m, maximum: d, format: v, patterns: g, contentEncoding: y } = n._zod.bag;
  if (typeof m == "number" && (c.minLength = m), typeof d == "number" && (c.maxLength = d), v && (c.format = qS[v] ?? v, c.format === "" && delete c.format, v === "time" && delete c.format), y && (c.contentEncoding = y), g && g.size > 0) {
    const _ = [...g];
    _.length === 1 ? c.pattern = _[0].source : _.length > 1 && (c.allOf = [
      ..._.map((j) => ({
        ...i.target === "draft-07" || i.target === "draft-04" || i.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: j.source
      }))
    ]);
  }
}, ZS = (n, i, s, r) => {
  const c = s, { minimum: m, maximum: d, format: v, multipleOf: g, exclusiveMaximum: y, exclusiveMinimum: _ } = n._zod.bag;
  typeof v == "string" && v.includes("int") ? c.type = "integer" : c.type = "number";
  const j = typeof _ == "number" && _ >= (m ?? Number.NEGATIVE_INFINITY), w = typeof y == "number" && y <= (d ?? Number.POSITIVE_INFINITY), O = i.target === "draft-04" || i.target === "openapi-3.0";
  j ? O ? (c.minimum = _, c.exclusiveMinimum = !0) : c.exclusiveMinimum = _ : typeof m == "number" && (c.minimum = m), w ? O ? (c.maximum = y, c.exclusiveMaximum = !0) : c.exclusiveMaximum = y : typeof d == "number" && (c.maximum = d), typeof g == "number" && (c.multipleOf = g);
}, QS = (n, i, s, r) => {
  s.type = "boolean";
}, HS = (n, i, s, r) => {
  i.target === "openapi-3.0" ? (s.type = "string", s.nullable = !0, s.enum = [null]) : s.type = "null";
}, kS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Undefined cannot be represented in JSON Schema");
}, BS = (n, i, s, r) => {
  s.not = {};
}, $S = (n, i, s, r) => {
}, LS = (n, i, s, r) => {
  const c = n._zod.def, m = Mp(c.entries);
  m.every((d) => typeof d == "number") && (s.type = "number"), m.every((d) => typeof d == "string") && (s.type = "string"), s.enum = m;
}, GS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, YS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, KS = (n, i, s, r) => {
  const c = s, m = n._zod.def, { minimum: d, maximum: v } = n._zod.bag;
  typeof d == "number" && (c.minItems = d), typeof v == "number" && (c.maxItems = v), c.type = "array", c.items = Pe(m.element, i, {
    ...r,
    path: [...r.path, "items"]
  });
}, XS = (n, i, s, r) => {
  const c = s, m = n._zod.def;
  c.type = "object", c.properties = {};
  const d = m.shape;
  for (const y in d)
    c.properties[y] = Pe(d[y], i, {
      ...r,
      path: [...r.path, "properties", y]
    });
  const v = new Set(Object.keys(d)), g = new Set([...v].filter((y) => {
    const _ = m.shape[y]._zod;
    return i.io === "input" ? _.optin === void 0 : _.optout === void 0;
  }));
  g.size > 0 && (c.required = Array.from(g)), m.catchall?._zod.def.type === "never" ? c.additionalProperties = !1 : m.catchall ? m.catchall && (c.additionalProperties = Pe(m.catchall, i, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : i.io === "output" && (c.additionalProperties = !1);
}, VS = (n, i, s, r) => {
  const c = n._zod.def, m = c.inclusive === !1, d = c.options.map((v, g) => Pe(v, i, {
    ...r,
    path: [...r.path, m ? "oneOf" : "anyOf", g]
  }));
  m ? s.oneOf = d : s.anyOf = d;
}, JS = (n, i, s, r) => {
  const c = n._zod.def, m = Pe(c.left, i, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), d = Pe(c.right, i, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), v = (y) => "allOf" in y && Object.keys(y).length === 1, g = [
    ...v(m) ? m.allOf : [m],
    ...v(d) ? d.allOf : [d]
  ];
  s.allOf = g;
}, FS = (n, i, s, r) => {
  const c = s, m = n._zod.def;
  c.type = "object";
  const d = m.keyType, g = d._zod.bag?.patterns;
  if (m.mode === "loose" && g && g.size > 0) {
    const _ = Pe(m.valueType, i, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    c.patternProperties = {};
    for (const j of g)
      c.patternProperties[j.source] = _;
  } else
    (i.target === "draft-07" || i.target === "draft-2020-12") && (c.propertyNames = Pe(m.keyType, i, {
      ...r,
      path: [...r.path, "propertyNames"]
    })), c.additionalProperties = Pe(m.valueType, i, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  const y = d._zod.values;
  if (y) {
    const _ = [...y].filter((j) => typeof j == "string" || typeof j == "number");
    _.length > 0 && (c.required = _);
  }
}, IS = (n, i, s, r) => {
  const c = n._zod.def, m = Pe(c.innerType, i, r), d = i.seen.get(n);
  i.target === "openapi-3.0" ? (d.ref = c.innerType, s.nullable = !0) : s.anyOf = [m, { type: "null" }];
}, WS = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
}, PS = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, s.default = JSON.parse(JSON.stringify(c.defaultValue));
}, e1 = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, i.io === "input" && (s._prefault = JSON.parse(JSON.stringify(c.defaultValue)));
}, t1 = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
  let d;
  try {
    d = c.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  s.default = d;
}, n1 = (n, i, s, r) => {
  const c = n._zod.def, m = c.in._zod.traits.has("$ZodTransform"), d = i.io === "input" ? m ? c.out : c.in : c.out;
  Pe(d, i, r);
  const v = i.seen.get(n);
  v.ref = d;
}, a1 = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, s.readOnly = !0;
}, tv = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
}, i1 = /* @__PURE__ */ R("ZodISODateTime", (n, i) => {
  e_.init(n, i), $e.init(n, i);
});
function l1(n) {
  return /* @__PURE__ */ uS(i1, n);
}
const s1 = /* @__PURE__ */ R("ZodISODate", (n, i) => {
  t_.init(n, i), $e.init(n, i);
});
function u1(n) {
  return /* @__PURE__ */ rS(s1, n);
}
const r1 = /* @__PURE__ */ R("ZodISOTime", (n, i) => {
  n_.init(n, i), $e.init(n, i);
});
function o1(n) {
  return /* @__PURE__ */ oS(r1, n);
}
const c1 = /* @__PURE__ */ R("ZodISODuration", (n, i) => {
  a_.init(n, i), $e.init(n, i);
});
function f1(n) {
  return /* @__PURE__ */ cS(c1, n);
}
const d1 = (n, i) => {
  Up.init(n, i), n.name = "ZodError", Object.defineProperties(n, {
    format: {
      value: (s) => Gb(n, s)
      // enumerable: false,
    },
    flatten: {
      value: (s) => Lb(n, s)
      // enumerable: false,
    },
    addIssue: {
      value: (s) => {
        n.issues.push(s), n.message = JSON.stringify(n.issues, Jo, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (s) => {
        n.issues.push(...s), n.message = JSON.stringify(n.issues, Jo, 2);
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
}, Jt = /* @__PURE__ */ R("ZodError", d1, {
  Parent: Error
}), h1 = /* @__PURE__ */ mc(Jt), m1 = /* @__PURE__ */ pc(Jt), p1 = /* @__PURE__ */ hu(Jt), v1 = /* @__PURE__ */ mu(Jt), y1 = /* @__PURE__ */ Xb(Jt), g1 = /* @__PURE__ */ Vb(Jt), b1 = /* @__PURE__ */ Jb(Jt), _1 = /* @__PURE__ */ Fb(Jt), S1 = /* @__PURE__ */ Ib(Jt), z1 = /* @__PURE__ */ Wb(Jt), w1 = /* @__PURE__ */ Pb(Jt), j1 = /* @__PURE__ */ e0(Jt), ip = /* @__PURE__ */ new WeakMap();
function Ml(n, i, s) {
  const r = Object.getPrototypeOf(n);
  let c = ip.get(r);
  if (c || (c = /* @__PURE__ */ new Set(), ip.set(r, c)), !c.has(i)) {
    c.add(i);
    for (const m in s) {
      const d = s[m];
      Object.defineProperty(r, m, {
        configurable: !0,
        enumerable: !1,
        get() {
          const v = d.bind(this);
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
const Be = /* @__PURE__ */ R("ZodType", (n, i) => (He.init(n, i), Object.assign(n["~standard"], {
  jsonSchema: {
    input: cu(n, "input"),
    output: cu(n, "output")
  }
}), n.toJSONSchema = RS(n, {}), n.def = i, n.type = i.type, Object.defineProperty(n, "_def", { value: i }), n.parse = (s, r) => h1(n, s, r, { callee: n.parse }), n.safeParse = (s, r) => p1(n, s, r), n.parseAsync = async (s, r) => m1(n, s, r, { callee: n.parseAsync }), n.safeParseAsync = async (s, r) => v1(n, s, r), n.spa = n.safeParseAsync, n.encode = (s, r) => y1(n, s, r), n.decode = (s, r) => g1(n, s, r), n.encodeAsync = async (s, r) => b1(n, s, r), n.decodeAsync = async (s, r) => _1(n, s, r), n.safeEncode = (s, r) => S1(n, s, r), n.safeDecode = (s, r) => z1(n, s, r), n.safeEncodeAsync = async (s, r) => w1(n, s, r), n.safeDecodeAsync = async (s, r) => j1(n, s, r), Ml(n, "ZodType", {
  check(...s) {
    const r = this.def;
    return this.clone(ua(r, {
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
    return ra(this, s, r);
  },
  brand() {
    return this;
  },
  register(s, r) {
    return s.add(this, r), this;
  },
  refine(s, r) {
    return this.check(Sz(s, r));
  },
  superRefine(s, r) {
    return this.check(zz(s, r));
  },
  overwrite(s) {
    return this.check(/* @__PURE__ */ Ci(s));
  },
  optional() {
    return rp(this);
  },
  exactOptional() {
    return rz(this);
  },
  nullable() {
    return op(this);
  },
  nullish() {
    return rp(op(this));
  },
  nonoptional(s) {
    return mz(this, s);
  },
  array() {
    return We(this);
  },
  or(s) {
    return en([this, s]);
  },
  and(s) {
    return nz(this, s);
  },
  transform(s) {
    return cp(this, sz(s));
  },
  default(s) {
    return fz(this, s);
  },
  prefault(s) {
    return hz(this, s);
  },
  catch(s) {
    return vz(this, s);
  },
  pipe(s) {
    return cp(this, s);
  },
  readonly() {
    return bz(this);
  },
  describe(s) {
    const r = this.clone();
    return Al.add(r, { description: s }), r;
  },
  meta(...s) {
    if (s.length === 0)
      return Al.get(this);
    const r = this.clone();
    return Al.add(r, s[0]), r;
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
    return Al.get(n)?.description;
  },
  configurable: !0
}), n)), nv = /* @__PURE__ */ R("_ZodString", (n, i) => {
  vc.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (r, c, m) => US(n, r, c);
  const s = n._zod.bag;
  n.format = s.format ?? null, n.minLength = s.minimum ?? null, n.maxLength = s.maximum ?? null, Ml(n, "_ZodString", {
    regex(...r) {
      return this.check(/* @__PURE__ */ bS(...r));
    },
    includes(...r) {
      return this.check(/* @__PURE__ */ zS(...r));
    },
    startsWith(...r) {
      return this.check(/* @__PURE__ */ wS(...r));
    },
    endsWith(...r) {
      return this.check(/* @__PURE__ */ jS(...r));
    },
    min(...r) {
      return this.check(/* @__PURE__ */ ou(...r));
    },
    max(...r) {
      return this.check(/* @__PURE__ */ Fp(...r));
    },
    length(...r) {
      return this.check(/* @__PURE__ */ Ip(...r));
    },
    nonempty(...r) {
      return this.check(/* @__PURE__ */ ou(1, ...r));
    },
    lowercase(r) {
      return this.check(/* @__PURE__ */ _S(r));
    },
    uppercase(r) {
      return this.check(/* @__PURE__ */ SS(r));
    },
    trim() {
      return this.check(/* @__PURE__ */ ES());
    },
    normalize(...r) {
      return this.check(/* @__PURE__ */ xS(...r));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ TS());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ AS());
    },
    slugify() {
      return this.check(/* @__PURE__ */ OS());
    }
  });
}), x1 = /* @__PURE__ */ R("ZodString", (n, i) => {
  vc.init(n, i), nv.init(n, i), n.email = (s) => n.check(/* @__PURE__ */ k_(E1, s)), n.url = (s) => n.check(/* @__PURE__ */ Y_(T1, s)), n.jwt = (s) => n.check(/* @__PURE__ */ sS($1, s)), n.emoji = (s) => n.check(/* @__PURE__ */ K_(A1, s)), n.guid = (s) => n.check(/* @__PURE__ */ ep(lp, s)), n.uuid = (s) => n.check(/* @__PURE__ */ B_(eu, s)), n.uuidv4 = (s) => n.check(/* @__PURE__ */ $_(eu, s)), n.uuidv6 = (s) => n.check(/* @__PURE__ */ L_(eu, s)), n.uuidv7 = (s) => n.check(/* @__PURE__ */ G_(eu, s)), n.nanoid = (s) => n.check(/* @__PURE__ */ X_(O1, s)), n.guid = (s) => n.check(/* @__PURE__ */ ep(lp, s)), n.cuid = (s) => n.check(/* @__PURE__ */ V_(C1, s)), n.cuid2 = (s) => n.check(/* @__PURE__ */ J_(N1, s)), n.ulid = (s) => n.check(/* @__PURE__ */ F_(M1, s)), n.base64 = (s) => n.check(/* @__PURE__ */ aS(H1, s)), n.base64url = (s) => n.check(/* @__PURE__ */ iS(k1, s)), n.xid = (s) => n.check(/* @__PURE__ */ I_(D1, s)), n.ksuid = (s) => n.check(/* @__PURE__ */ W_(R1, s)), n.ipv4 = (s) => n.check(/* @__PURE__ */ P_(q1, s)), n.ipv6 = (s) => n.check(/* @__PURE__ */ eS(U1, s)), n.cidrv4 = (s) => n.check(/* @__PURE__ */ tS(Z1, s)), n.cidrv6 = (s) => n.check(/* @__PURE__ */ nS(Q1, s)), n.e164 = (s) => n.check(/* @__PURE__ */ lS(B1, s)), n.datetime = (s) => n.check(l1(s)), n.date = (s) => n.check(u1(s)), n.time = (s) => n.check(o1(s)), n.duration = (s) => n.check(f1(s));
});
function L(n) {
  return /* @__PURE__ */ H_(x1, n);
}
const $e = /* @__PURE__ */ R("ZodStringFormat", (n, i) => {
  ke.init(n, i), nv.init(n, i);
}), E1 = /* @__PURE__ */ R("ZodEmail", (n, i) => {
  Y0.init(n, i), $e.init(n, i);
}), lp = /* @__PURE__ */ R("ZodGUID", (n, i) => {
  L0.init(n, i), $e.init(n, i);
}), eu = /* @__PURE__ */ R("ZodUUID", (n, i) => {
  G0.init(n, i), $e.init(n, i);
}), T1 = /* @__PURE__ */ R("ZodURL", (n, i) => {
  K0.init(n, i), $e.init(n, i);
}), A1 = /* @__PURE__ */ R("ZodEmoji", (n, i) => {
  X0.init(n, i), $e.init(n, i);
}), O1 = /* @__PURE__ */ R("ZodNanoID", (n, i) => {
  V0.init(n, i), $e.init(n, i);
}), C1 = /* @__PURE__ */ R("ZodCUID", (n, i) => {
  J0.init(n, i), $e.init(n, i);
}), N1 = /* @__PURE__ */ R("ZodCUID2", (n, i) => {
  F0.init(n, i), $e.init(n, i);
}), M1 = /* @__PURE__ */ R("ZodULID", (n, i) => {
  I0.init(n, i), $e.init(n, i);
}), D1 = /* @__PURE__ */ R("ZodXID", (n, i) => {
  W0.init(n, i), $e.init(n, i);
}), R1 = /* @__PURE__ */ R("ZodKSUID", (n, i) => {
  P0.init(n, i), $e.init(n, i);
}), q1 = /* @__PURE__ */ R("ZodIPv4", (n, i) => {
  i_.init(n, i), $e.init(n, i);
}), U1 = /* @__PURE__ */ R("ZodIPv6", (n, i) => {
  l_.init(n, i), $e.init(n, i);
}), Z1 = /* @__PURE__ */ R("ZodCIDRv4", (n, i) => {
  s_.init(n, i), $e.init(n, i);
}), Q1 = /* @__PURE__ */ R("ZodCIDRv6", (n, i) => {
  u_.init(n, i), $e.init(n, i);
}), H1 = /* @__PURE__ */ R("ZodBase64", (n, i) => {
  r_.init(n, i), $e.init(n, i);
}), k1 = /* @__PURE__ */ R("ZodBase64URL", (n, i) => {
  c_.init(n, i), $e.init(n, i);
}), B1 = /* @__PURE__ */ R("ZodE164", (n, i) => {
  f_.init(n, i), $e.init(n, i);
}), $1 = /* @__PURE__ */ R("ZodJWT", (n, i) => {
  h_.init(n, i), $e.init(n, i);
}), yc = /* @__PURE__ */ R("ZodNumber", (n, i) => {
  Kp.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (r, c, m) => ZS(n, r, c), Ml(n, "ZodNumber", {
    gt(r, c) {
      return this.check(/* @__PURE__ */ np(r, c));
    },
    gte(r, c) {
      return this.check(/* @__PURE__ */ ko(r, c));
    },
    min(r, c) {
      return this.check(/* @__PURE__ */ ko(r, c));
    },
    lt(r, c) {
      return this.check(/* @__PURE__ */ tp(r, c));
    },
    lte(r, c) {
      return this.check(/* @__PURE__ */ Ho(r, c));
    },
    max(r, c) {
      return this.check(/* @__PURE__ */ Ho(r, c));
    },
    int(r) {
      return this.check(sp(r));
    },
    safe(r) {
      return this.check(sp(r));
    },
    positive(r) {
      return this.check(/* @__PURE__ */ np(0, r));
    },
    nonnegative(r) {
      return this.check(/* @__PURE__ */ ko(0, r));
    },
    negative(r) {
      return this.check(/* @__PURE__ */ tp(0, r));
    },
    nonpositive(r) {
      return this.check(/* @__PURE__ */ Ho(0, r));
    },
    multipleOf(r, c) {
      return this.check(/* @__PURE__ */ ap(r, c));
    },
    step(r, c) {
      return this.check(/* @__PURE__ */ ap(r, c));
    },
    finite() {
      return this;
    }
  });
  const s = n._zod.bag;
  n.minValue = Math.max(s.minimum ?? Number.NEGATIVE_INFINITY, s.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, n.maxValue = Math.min(s.maximum ?? Number.POSITIVE_INFINITY, s.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, n.isInt = (s.format ?? "").includes("int") || Number.isSafeInteger(s.multipleOf ?? 0.5), n.isFinite = !0, n.format = s.format ?? null;
});
function Na(n) {
  return /* @__PURE__ */ fS(yc, n);
}
const L1 = /* @__PURE__ */ R("ZodNumberFormat", (n, i) => {
  m_.init(n, i), yc.init(n, i);
});
function sp(n) {
  return /* @__PURE__ */ hS(L1, n);
}
const G1 = /* @__PURE__ */ R("ZodBoolean", (n, i) => {
  p_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => QS(n, s, r);
});
function Ma(n) {
  return /* @__PURE__ */ mS(G1, n);
}
const Y1 = /* @__PURE__ */ R("ZodUndefined", (n, i) => {
  v_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => kS(n, s);
});
function K1(n) {
  return /* @__PURE__ */ pS(Y1, n);
}
const X1 = /* @__PURE__ */ R("ZodNull", (n, i) => {
  y_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => HS(n, s, r);
});
function V1(n) {
  return /* @__PURE__ */ vS(X1, n);
}
const J1 = /* @__PURE__ */ R("ZodUnknown", (n, i) => {
  g_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => $S();
});
function un() {
  return /* @__PURE__ */ yS(J1);
}
const F1 = /* @__PURE__ */ R("ZodNever", (n, i) => {
  b_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => BS(n, s, r);
});
function I1(n) {
  return /* @__PURE__ */ gS(F1, n);
}
const W1 = /* @__PURE__ */ R("ZodArray", (n, i) => {
  __.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => KS(n, s, r, c), n.element = i.element, Ml(n, "ZodArray", {
    min(s, r) {
      return this.check(/* @__PURE__ */ ou(s, r));
    },
    nonempty(s) {
      return this.check(/* @__PURE__ */ ou(1, s));
    },
    max(s, r) {
      return this.check(/* @__PURE__ */ Fp(s, r));
    },
    length(s, r) {
      return this.check(/* @__PURE__ */ Ip(s, r));
    },
    unwrap() {
      return this.element;
    }
  });
});
function We(n, i) {
  return /* @__PURE__ */ CS(W1, n, i);
}
const P1 = /* @__PURE__ */ R("ZodObject", (n, i) => {
  z_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => XS(n, s, r, c), Me(n, "shape", () => i.shape), Ml(n, "ZodObject", {
    keyof() {
      return iz(Object.keys(this._zod.def.shape));
    },
    catchall(s) {
      return this.clone({ ...this._zod.def, catchall: s });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: un() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: un() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: I1() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: void 0 });
    },
    extend(s) {
      return Zb(this, s);
    },
    safeExtend(s) {
      return Qb(this, s);
    },
    merge(s) {
      return Hb(this, s);
    },
    pick(s) {
      return qb(this, s);
    },
    omit(s) {
      return Ub(this, s);
    },
    partial(...s) {
      return kb(av, this, s[0]);
    },
    required(...s) {
      return Bb(iv, this, s[0]);
    }
  });
});
function ft(n, i) {
  const s = {
    type: "object",
    shape: n ?? {},
    ...te(i)
  };
  return new P1(s);
}
const ez = /* @__PURE__ */ R("ZodUnion", (n, i) => {
  w_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => VS(n, s, r, c), n.options = i.options;
});
function en(n, i) {
  return new ez({
    type: "union",
    options: n,
    ...te(i)
  });
}
const tz = /* @__PURE__ */ R("ZodIntersection", (n, i) => {
  j_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => JS(n, s, r, c);
});
function nz(n, i) {
  return new tz({
    type: "intersection",
    left: n,
    right: i
  });
}
const up = /* @__PURE__ */ R("ZodRecord", (n, i) => {
  x_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => FS(n, s, r, c), n.keyType = i.keyType, n.valueType = i.valueType;
});
function az(n, i, s) {
  return !i || !i._zod ? new up({
    type: "record",
    keyType: L(),
    valueType: n,
    ...te(i)
  }) : new up({
    type: "record",
    keyType: n,
    valueType: i,
    ...te(s)
  });
}
const Io = /* @__PURE__ */ R("ZodEnum", (n, i) => {
  E_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (r, c, m) => LS(n, r, c), n.enum = i.entries, n.options = Object.values(i.entries);
  const s = new Set(Object.keys(i.entries));
  n.extract = (r, c) => {
    const m = {};
    for (const d of r)
      if (s.has(d))
        m[d] = i.entries[d];
      else
        throw new Error(`Key ${d} not found in enum`);
    return new Io({
      ...i,
      checks: [],
      ...te(c),
      entries: m
    });
  }, n.exclude = (r, c) => {
    const m = { ...i.entries };
    for (const d of r)
      if (s.has(d))
        delete m[d];
      else
        throw new Error(`Key ${d} not found in enum`);
    return new Io({
      ...i,
      checks: [],
      ...te(c),
      entries: m
    });
  };
});
function iz(n, i) {
  const s = Array.isArray(n) ? Object.fromEntries(n.map((r) => [r, r])) : n;
  return new Io({
    type: "enum",
    entries: s,
    ...te(i)
  });
}
const lz = /* @__PURE__ */ R("ZodTransform", (n, i) => {
  T_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => YS(n, s), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      throw new Np(n.constructor.name);
    s.addIssue = (m) => {
      if (typeof m == "string")
        s.issues.push(Nl(m, s.value, i));
      else {
        const d = m;
        d.fatal && (d.continue = !1), d.code ?? (d.code = "custom"), d.input ?? (d.input = s.value), d.inst ?? (d.inst = n), s.issues.push(Nl(d));
      }
    };
    const c = i.transform(s.value, s);
    return c instanceof Promise ? c.then((m) => (s.value = m, s.fallback = !0, s)) : (s.value = c, s.fallback = !0, s);
  };
});
function sz(n) {
  return new lz({
    type: "transform",
    transform: n
  });
}
const av = /* @__PURE__ */ R("ZodOptional", (n, i) => {
  Jp.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => tv(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function rp(n) {
  return new av({
    type: "optional",
    innerType: n
  });
}
const uz = /* @__PURE__ */ R("ZodExactOptional", (n, i) => {
  A_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => tv(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function rz(n) {
  return new uz({
    type: "optional",
    innerType: n
  });
}
const oz = /* @__PURE__ */ R("ZodNullable", (n, i) => {
  O_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => IS(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function op(n) {
  return new oz({
    type: "nullable",
    innerType: n
  });
}
const cz = /* @__PURE__ */ R("ZodDefault", (n, i) => {
  C_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => PS(n, s, r, c), n.unwrap = () => n._zod.def.innerType, n.removeDefault = n.unwrap;
});
function fz(n, i) {
  return new cz({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : Rp(i);
    }
  });
}
const dz = /* @__PURE__ */ R("ZodPrefault", (n, i) => {
  N_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => e1(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function hz(n, i) {
  return new dz({
    type: "prefault",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : Rp(i);
    }
  });
}
const iv = /* @__PURE__ */ R("ZodNonOptional", (n, i) => {
  M_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => WS(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function mz(n, i) {
  return new iv({
    type: "nonoptional",
    innerType: n,
    ...te(i)
  });
}
const pz = /* @__PURE__ */ R("ZodCatch", (n, i) => {
  D_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => t1(n, s, r, c), n.unwrap = () => n._zod.def.innerType, n.removeCatch = n.unwrap;
});
function vz(n, i) {
  return new pz({
    type: "catch",
    innerType: n,
    catchValue: typeof i == "function" ? i : () => i
  });
}
const yz = /* @__PURE__ */ R("ZodPipe", (n, i) => {
  R_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => n1(n, s, r, c), n.in = i.in, n.out = i.out;
});
function cp(n, i) {
  return new yz({
    type: "pipe",
    in: n,
    out: i
    // ...util.normalizeParams(params),
  });
}
const gz = /* @__PURE__ */ R("ZodReadonly", (n, i) => {
  q_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => a1(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function bz(n) {
  return new gz({
    type: "readonly",
    innerType: n
  });
}
const _z = /* @__PURE__ */ R("ZodCustom", (n, i) => {
  U_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => GS(n, s);
});
function Sz(n, i = {}) {
  return /* @__PURE__ */ NS(_z, n, i);
}
function zz(n, i) {
  return /* @__PURE__ */ MS(n, i);
}
function Yt(n) {
  return /* @__PURE__ */ dS(yc, n);
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
}, On = az(L(), un()), xi = en([L(), Na(), Ma()]).transform(String), Vt = en([Na(), L()]).transform((n) => Number(n)), Oa = en([Na(), L(), V1(), K1()]).transform((n) => n == null || n === "" ? null : Number(n)), gc = en([
  L(),
  ft({
    label: L().optional(),
    value: L().optional()
  }).passthrough()
]), bc = ft({
  id: en([Na(), L()]).optional(),
  sender: L().optional(),
  senderType: L().optional(),
  role: L().optional(),
  content: L().optional(),
  safeMessageContent: L().optional(),
  messageType: L().optional(),
  createdAt: L().optional(),
  status: L().optional(),
  quickReplies: We(gc).optional(),
  metadata: On.optional()
}).passthrough(), Wo = en([
  L(),
  ft({
    id: en([Na(), L()]).optional(),
    materialId: Vt.optional(),
    chunkId: Vt.optional(),
    label: L().optional(),
    sourceLabel: L().optional(),
    excerpt: L().optional(),
    content: L().optional()
  }).passthrough()
]), Po = ft({
  id: en([Na(), L()]).optional(),
  type: L().optional(),
  text: L().optional(),
  prompt: L().optional(),
  options: We(xi).optional(),
  correctAnswer: xi.optional(),
  explanation: L().optional(),
  difficulty: L().optional(),
  learningObjective: L().optional(),
  points: en([Na(), L()]).optional(),
  sourceReferences: We(Wo).optional(),
  sources: We(Wo).optional(),
  sourceHint: L().optional(),
  validationStatus: L().optional()
}).passthrough(), lv = ft({
  id: Oa.optional(),
  draftId: Oa.optional(),
  title: L().optional(),
  description: L().optional(),
  status: L().optional(),
  questions: We(Po).optional(),
  updatedAt: L().optional(),
  draft: ft({
    title: L().optional(),
    description: L().optional(),
    status: L().optional(),
    questions: We(Po).optional(),
    updatedAt: L().optional()
  }).passthrough().optional()
}).passthrough(), wz = ft({
  multipleChoice: Yt().optional(),
  multiple_choice: Yt().optional(),
  trueFalse: Yt().optional(),
  true_false: Yt().optional(),
  shortAnswer: Yt().optional(),
  short_answer: Yt().optional(),
  essay: Yt().optional(),
  coding: Yt().optional()
}).passthrough(), sv = ft({
  courseId: Oa.optional(),
  topic: L().optional(),
  learningObjectives: We(xi).optional(),
  difficulty: L().optional(),
  questionCount: Oa.optional(),
  language: L().optional(),
  questionTypeDistribution: wz.optional(),
  useIndexedMaterialOnly: Ma().optional(),
  includeExplanations: Ma().optional(),
  timeLimitMinutes: Oa.optional(),
  tags: We(xi).optional(),
  specialInstructions: L().optional(),
  additionalInstructions: L().optional(),
  missingRequiredFields: We(xi).optional(),
  readinessStatus: L().optional(),
  materialScope: L().optional(),
  materialMode: L().optional(),
  materialIds: We(Vt).optional(),
  scoringPreferences: en([L(), On]).optional(),
  gradingPreferences: L().optional(),
  gradingOrScoringPreferences: L().optional()
}).passthrough(), uv = ft({
  status: L().optional(),
  stage: L().optional(),
  currentStage: L().optional(),
  progressStage: L().optional(),
  message: L().optional(),
  canCancel: Ma().optional(),
  startedAt: L().optional(),
  updatedAt: L().optional()
}).passthrough(), jz = ft({
  title: L().optional(),
  questions: We(un()).optional(),
  draft: ft({
    title: L().optional(),
    questions: We(un()).optional()
  }).passthrough().optional()
}).passthrough(), iu = ft({
  id: Vt.optional(),
  revisionId: Vt.optional(),
  revisionNumber: Vt.optional(),
  revisionType: L().optional(),
  requestText: L().optional(),
  status: L().optional(),
  summary: L().optional(),
  changes: We(xi).optional(),
  destructive: Ma().optional(),
  metadata: On.optional(),
  beforeSnapshot: un().optional(),
  proposedSnapshot: un().optional(),
  beforeData: un().optional(),
  afterData: un().optional(),
  preview: un().optional(),
  appliedAt: L().optional(),
  createdAt: L().optional()
}).passthrough(), vu = ft({
  id: Vt.optional(),
  conversationId: Vt.optional(),
  title: L().optional(),
  status: L().optional(),
  courseId: Oa.optional(),
  createdAt: L().optional(),
  updatedAt: L().optional(),
  messageCount: Yt().optional(),
  draftId: Oa.optional(),
  plan: sv.optional(),
  messages: We(bc).optional(),
  suggestedReplies: We(gc).optional(),
  draft: lv.nullable().optional(),
  generation: uv.nullable().optional(),
  pendingRevision: iu.nullable().optional(),
  revision: iu.nullable().optional(),
  revisions: We(iu).optional()
}).passthrough();
function Cn(n, i) {
  const s = On.safeParse(n);
  if (!s.success) return n;
  for (const r of i)
    if (s.data[r] !== void 0) return s.data[r];
  return n;
}
function xz(n) {
  const i = String(n.senderType || n.sender || n.role || "assistant").toLowerCase();
  return ["user", "teacher", "admin", "human"].includes(i) ? "user" : i === "system" ? "system" : "assistant";
}
function Ez(n) {
  const i = Array.isArray(n.metadata?.quickReplies) ? n.metadata.quickReplies : [], s = n.quickReplies || i;
  return rv(s);
}
function rv(n) {
  return n.flatMap((i, s) => {
    const r = gc.safeParse(i);
    if (!r.success) return [];
    if (typeof r.data == "string") return [{ label: r.data, value: r.data }];
    const c = r.data.value || r.data.label || "";
    return c ? [{ label: r.data.label || c, value: c }] : [];
  }).map((i, s) => ({ ...i, key: `${s}-${i.value}` })).map(({ label: i, value: s }) => ({ label: i, value: s }));
}
function ov(n, i = 0) {
  const s = bc.parse(n), r = s.status === "failed" ? "failed" : s.status === "pending" ? "pending" : "sent";
  return {
    id: s.id ?? `message-${i}`,
    sender: xz(s),
    content: s.content || s.safeMessageContent || "",
    messageType: s.messageType || "text",
    createdAt: s.createdAt || "",
    status: r,
    quickReplies: Ez(s)
  };
}
function Tz(n, i) {
  const s = Wo.parse(n);
  return typeof s == "string" ? { id: `source-${i}`, label: s } : {
    id: s.id ?? `source-${i}`,
    materialId: s.materialId,
    chunkId: s.chunkId,
    label: s.label || s.sourceLabel || `Source ${i + 1}`,
    excerpt: s.excerpt || s.content
  };
}
function Az(n) {
  const i = Po.parse(n), s = i.sourceReferences || i.sources || (i.sourceHint ? [i.sourceHint] : []), r = Number(i.points ?? 1);
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
    sourceReferences: s.map(Tz),
    validationStatus: i.validationStatus || "valid"
  };
}
function Oz(n) {
  if (n == null) return null;
  const i = lv.parse(Cn(n, ["draft"])), s = i.draft || {};
  return {
    id: i.id ?? i.draftId ?? null,
    title: i.title || s.title || "Untitled quiz draft",
    description: i.description || s.description || "",
    status: i.status || s.status || "draft",
    questions: (i.questions || s.questions || []).map(Az),
    updatedAt: i.updatedAt || s.updatedAt || ""
  };
}
function Cz(n) {
  const i = sv.parse(n || {}), s = i.questionTypeDistribution || {}, r = i.materialScope || (i.materialMode === "general_model_knowledge_allowed" ? "general_knowledge_allowed" : i.materialMode), c = ["course_material_only", "course_material_preferred", "general_knowledge_allowed"].includes(String(r)) ? r : i.useIndexedMaterialOnly ? "course_material_only" : la.materialScope, m = i.scoringPreferences ?? i.gradingPreferences ?? i.gradingOrScoringPreferences, d = typeof m == "string" ? m : m ? JSON.stringify(m) : "";
  return {
    ...la,
    courseId: i.courseId ?? la.courseId,
    topic: i.topic ?? la.topic,
    learningObjectives: i.learningObjectives ?? [],
    difficulty: ["easy", "medium", "hard"].includes(String(i.difficulty)) ? i.difficulty : la.difficulty,
    questionCount: i.questionCount ?? la.questionCount,
    language: i.language ?? la.language,
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
    scoringPreferences: d
  };
}
function cv(n) {
  if (!n) return null;
  const i = uv.parse(Cn(n, ["generation"]));
  return {
    status: i.status || "generating",
    stage: i.stage || i.currentStage || i.progressStage || "",
    message: i.message || "",
    canCancel: i.canCancel ?? i.status === "generating",
    startedAt: i.startedAt || "",
    updatedAt: i.updatedAt || ""
  };
}
function fp(n) {
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
function fu(n) {
  if (Array.isArray(n)) return n.map(fu);
  const i = On.safeParse(n);
  return i.success ? Object.fromEntries(
    Object.keys(i.data).sort().map((s) => [s, fu(i.data[s])])
  ) : n;
}
function dp(n) {
  const i = On.safeParse(n);
  if (!i.success) return "";
  const s = i.data.id ?? i.data.questionId;
  return typeof s == "string" || typeof s == "number" ? String(s) : "";
}
function hp(n, i) {
  return JSON.stringify(fu(n)) === JSON.stringify(fu(i));
}
function Nz(n, i) {
  if (!n || !i) return { changed: null, removed: null, added: null };
  const s = n.map(dp), r = i.map(dp);
  if (s.length > 0 && r.length > 0 && s.every(Boolean) && r.every(Boolean) && new Set(s).size === s.length && new Set(r).size === r.length) {
    const v = new Map(s.map((w, O) => [w, n[O]])), g = new Map(r.map((w, O) => [w, i[O]])), y = s.filter((w) => !g.has(w)).length, _ = r.filter((w) => !v.has(w)).length;
    return { changed: s.filter((w) => g.has(w) && !hp(v.get(w), g.get(w))).length, removed: y, added: _ };
  }
  const m = Math.min(n.length, i.length);
  let d = 0;
  for (let v = 0; v < m; v += 1)
    hp(n[v], i[v]) || (d += 1);
  return {
    changed: d,
    removed: Math.max(0, n.length - i.length),
    added: Math.max(0, i.length - n.length)
  };
}
function Bo(n, i) {
  const s = Number(n?.[i]);
  return Number.isSafeInteger(s) && s >= 0 ? s : null;
}
function Mz(n) {
  const i = String(n.status || "").toLowerCase(), s = n.metadata?.applied;
  return !!n.appliedAt?.trim() || s === !0 || s === "true" || ["applied", "accepted", "completed"].includes(i);
}
function fv(n, i = !1) {
  if (Mz(n)) return !1;
  const s = String(n.status || "").toLowerCase(), r = n.metadata || {};
  return r.requiresConfirmation === !0 || r.previewOnly === !0 ? !0 : r.draftOnly === !0 || n.revisionType === "initial_generation" ? !1 : ["preview", "pending", "pending_confirmation", "awaiting_confirmation", "unapplied"].includes(s) ? n.revisionType !== "whole_quiz_revision" || r.requiresConfirmation === !0 : i;
}
function _c(n) {
  if (!n) return null;
  const i = On.safeParse(n), s = i.success ? i.data.preview : void 0, r = Cn(n, ["revision", "pendingRevision"]), c = iu.safeParse(r);
  if (!c.success) return null;
  const m = c.data.id ?? c.data.revisionId;
  if (!m) return null;
  const d = fp(c.data.beforeSnapshot || c.data.beforeData), v = fp(
    c.data.proposedSnapshot || c.data.afterData || c.data.preview || s
  ), g = Nz(d.questions, v.questions), y = Array.isArray(c.data.metadata?.questionIndexes) ? new Set(
    c.data.metadata.questionIndexes.map(Number).filter((M) => Number.isSafeInteger(M) && M >= 0)
  ).size : null, _ = g.changed ?? y ?? Bo(c.data.metadata, "changedQuestionCount"), j = g.removed ?? Bo(c.data.metadata, "removedQuestionCount") ?? (d.questionCount !== null && v.questionCount !== null ? Math.max(0, d.questionCount - v.questionCount) : null), w = g.added ?? Bo(c.data.metadata, "addedQuestionCount") ?? (d.questionCount !== null && v.questionCount !== null ? Math.max(0, v.questionCount - d.questionCount) : null), O = v.title || d.title;
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
      title: d.title,
      questionCount: d.questionCount
    },
    proposedSnapshot: {
      title: O,
      questionCount: v.questionCount
    },
    changedQuestionCount: _,
    removedQuestionCount: j,
    addedQuestionCount: w,
    createdAt: c.data.createdAt || ""
  };
}
function Dz(n) {
  const i = n.map((s, r) => ({ raw: s, index: r })).filter(({ raw: s }) => fv(s)).sort((s, r) => {
    const c = Number(r.raw.revisionNumber || 0) - Number(s.raw.revisionNumber || 0);
    if (c) return c;
    const m = Date.parse(r.raw.createdAt || "") - Date.parse(s.raw.createdAt || "");
    return Number.isFinite(m) && m ? m : s.index - r.index;
  })[0]?.raw;
  return i ? _c(i) : null;
}
function dv(n) {
  const i = vu.parse(n), s = i.id ?? i.conversationId;
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
function ec(n) {
  const i = Cn(n, ["conversation"]), s = vu.parse(i), r = dv(s), c = s.pendingRevision || s.revision, m = c && fv(
    c,
    !!s.pendingRevision
  ) ? _c(c) : Dz(s.revisions || []);
  return {
    ...r,
    plan: Cz(s.plan || {}),
    messages: (s.messages || []).map(ov),
    suggestedReplies: rv(s.suggestedReplies || []),
    draft: Oz(s.draft),
    generation: cv(s.generation),
    pendingRevision: m
  };
}
function Rz(n) {
  const i = Cn(n, ["conversations", "items", "data"]);
  return We(vu).parse(i).map(dv);
}
const qz = ft({
  id: Vt,
  code: L().optional(),
  title: L().optional(),
  name: L().optional()
}).passthrough();
function Uz(n) {
  const i = Cn(n, ["courses", "items", "data"]);
  return We(qz).parse(i).map((s) => ({
    id: s.id,
    code: s.code || `COURSE-${s.id}`,
    title: s.title || s.name || "Untitled course"
  }));
}
const Zz = ft({
  id: Vt,
  courseId: Vt,
  originalName: L().optional(),
  name: L().optional(),
  byteSize: Yt().optional(),
  chunkCount: Yt().optional(),
  status: L().optional(),
  createdAt: L().optional(),
  errorMessage: L().optional(),
  error: L().optional()
}).passthrough();
function Qz(n) {
  const i = Cn(n, ["materials", "items", "data"]);
  return We(Zz).parse(i).map((s) => ({
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
const Hz = ft({
  enabled: Ma().optional(),
  configured: Ma().optional(),
  conversationApiVersion: Vt.optional(),
  source: L().optional(),
  endpoint: L().optional(),
  maskedApiKey: L().optional(),
  chatDeployment: L().optional(),
  embeddingDeployment: L().optional(),
  apiVersion: L().optional(),
  message: L().optional()
}).passthrough();
function mp(n) {
  const i = Hz.parse(Cn(n, ["settings"]));
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
function aa(n) {
  const i = On.parse(n), s = i.conversation || (i.id || i.conversationId ? i : null);
  let r = null;
  if (s) {
    const m = vu.safeParse(s);
    m.success && (m.data.id || m.data.conversationId) && (r = ec(m.data));
  }
  const c = i.message && typeof i.message == "object" ? bc.safeParse(i.message) : null;
  return {
    conversation: r,
    revision: _c(i.revision || i.pendingRevision ? {
      revision: i.revision || i.pendingRevision,
      preview: i.preview
    } : null),
    message: c?.success ? ov(c.data) : null,
    notice: typeof i.message == "string" ? i.message : typeof i.notice == "string" ? i.notice : ""
  };
}
function kz(n) {
  return cv(n) || {
    status: "generating",
    stage: "",
    message: "",
    canCancel: !0,
    startedAt: "",
    updatedAt: ""
  };
}
function Bz(n) {
  const i = ft({
    label: L().optional(),
    sourceLabel: L().optional(),
    content: L().optional(),
    excerpt: L().optional(),
    chunkIndex: Yt().optional()
  }).passthrough().parse(Cn(n, ["chunk", "source"]));
  return {
    label: i.label || i.sourceLabel || `Source chunk ${(i.chunkIndex ?? 0) + 1}`,
    content: i.content || i.excerpt || ""
  };
}
function tu(n) {
  return On.parse(n);
}
function $z(n) {
  return {
    async listConversations() {
      return Rz(await n.getAiConversations());
    },
    async createConversation(i = {}) {
      return ec(await n.createAiConversation(i));
    },
    async getConversation(i) {
      return ec(await n.getAiConversation(i));
    },
    async sendMessage(i, s) {
      return aa(await n.sendAiConversationMessage(i, s));
    },
    async updatePlan(i, s) {
      const r = { ...s };
      return s.scoringPreferences !== void 0 && (r.gradingPreferences = s.scoringPreferences, delete r.scoringPreferences), aa(await n.updateAiConversationPlan(i, r));
    },
    async generateDraft(i, s) {
      return aa(await n.generateAiConversationDraft(i, s));
    },
    async getGenerationStatus(i) {
      return kz(await n.getAiConversationGenerationStatus(i));
    },
    async cancelGeneration(i) {
      return aa(await n.cancelAiConversationGeneration(i));
    },
    async reviseDraft(i, s) {
      return aa(await n.reviseAiConversationDraft(i, s));
    },
    async applyRevision(i, s) {
      return aa(await n.applyAiConversationRevision(i, s));
    },
    async regenerateQuestions(i, s, r) {
      return aa(await n.regenerateAiConversationQuestions(i, s, r));
    },
    async saveDraft(i, s) {
      return aa(await n.saveAiConversationDraft(i, s));
    },
    async listCourses() {
      return Uz(await n.getCourses());
    },
    async getSettings() {
      return mp(await n.getAiSettingsStatus());
    },
    async saveSettings(i) {
      return mp(await n.saveAiSettings(i));
    },
    async testSettings(i) {
      return tu(await n.testAiSettings(i));
    },
    async listMaterials(i) {
      return Qz(await n.getAiMaterials(i));
    },
    async uploadMaterial(i, s) {
      return tu(await n.uploadAiMaterial(i, s));
    },
    async pasteMaterial(i, s) {
      return tu(await n.pasteAiMaterial(i, s));
    },
    async deleteMaterial(i, s) {
      return tu(await n.deleteAiMaterial(i, s));
    },
    async getMaterialChunk(i, s, r) {
      return Bz(await n.getAiMaterialChunk(i, s, r));
    }
  };
}
const pp = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function Sc({ title: n, description: i, onClose: s, size: r = "normal", children: c }) {
  const m = I.useId(), d = I.useId(), v = I.useRef(null), g = I.useRef(null);
  I.useEffect(() => {
    g.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const _ = v.current;
    (_?.querySelector(pp) || _)?.focus();
    const w = (O) => {
      O.key === "Escape" && (O.preventDefault(), s());
    };
    return document.addEventListener("keydown", w), () => {
      document.removeEventListener("keydown", w), g.current?.focus();
    };
  }, [s]);
  const y = (_) => {
    if (_.key !== "Tab" || !v.current) return;
    const j = Array.from(
      v.current.querySelectorAll(pp)
    ).filter((M) => !M.hidden);
    if (!j.length) {
      _.preventDefault(), v.current.focus();
      return;
    }
    const w = j[0], O = j[j.length - 1];
    _.shiftKey && document.activeElement === w ? (_.preventDefault(), O.focus()) : !_.shiftKey && document.activeElement === O && (_.preventDefault(), w.focus());
  };
  return /* @__PURE__ */ h.jsx(
    "div",
    {
      className: "aiw-modal-backdrop",
      onMouseDown: (_) => {
        _.currentTarget === _.target && s();
      },
      children: /* @__PURE__ */ h.jsxs(
        "div",
        {
          ref: v,
          className: `aiw-modal aiw-modal--${r}`,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": m,
          "aria-describedby": i ? d : void 0,
          tabIndex: -1,
          onKeyDown: y,
          children: [
            /* @__PURE__ */ h.jsxs("header", { className: "aiw-modal__header", children: [
              /* @__PURE__ */ h.jsxs("div", { children: [
                /* @__PURE__ */ h.jsx("h2", { id: m, children: n }),
                i ? /* @__PURE__ */ h.jsx("p", { id: d, children: i }) : null
              ] }),
              /* @__PURE__ */ h.jsx("button", { className: "aiw-icon-button", type: "button", onClick: s, "aria-label": "Close dialog", children: "×" })
            ] }),
            /* @__PURE__ */ h.jsx("div", { className: "aiw-modal__body", children: c })
          ]
        }
      )
    }
  );
}
const Lz = {
  endpoint: "",
  apiKey: "",
  chatDeployment: "",
  embeddingDeployment: "",
  apiVersion: ""
};
function vp(n, i) {
  if (typeof n == "boolean")
    return n ? `${i} deployment connected.` : `${i} deployment failed.`;
  if (!n || typeof n != "object") return "";
  const s = n;
  return typeof s.message == "string" && s.message.trim() ? s.message.trim() : s.skipped === !0 ? `${i} deployment was skipped.` : s.ok === !0 ? `${i} deployment connected.` : `${i} deployment failed.`;
}
function Gz({ client: n, onClose: i, onToast: s }) {
  const r = Oi(), [c, m] = I.useState(Lz), [d, v] = I.useState(""), g = En({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  });
  I.useEffect(() => {
    const M = g.data;
    M && m((H) => ({
      ...H,
      endpoint: M.endpoint,
      chatDeployment: M.chatDeployment,
      embeddingDeployment: M.embeddingDeployment,
      apiVersion: M.apiVersion
    }));
  }, [g.data]);
  const y = Kt({
    mutationFn: () => n.saveSettings(c),
    onSuccess: async () => {
      await r.invalidateQueries({ queryKey: ["ai", "settings"] }), s("Private Azure settings saved.", "success"), i();
    },
    onError: (M) => s(M instanceof Error ? M.message : "Could not save Azure settings.", "error")
  }), _ = Kt({
    mutationFn: () => n.testSettings(c),
    onSuccess: (M) => {
      const H = vp(M.chat, "Chat"), W = vp(M.embeddings, "Embedding");
      v([H, W].filter(Boolean).join(" "));
    },
    onError: (M) => v(M instanceof Error ? M.message : "Connection test failed.")
  }), j = (M, H) => {
    m((W) => ({ ...W, [M]: H })), v("");
  }, w = (M) => {
    M.preventDefault(), y.mutate();
  }, O = g.data?.configured ?? !1;
  return /* @__PURE__ */ h.jsxs(
    Sc,
    {
      title: "Private Azure settings",
      description: "Credentials stay on the LMS server. Saved API keys are never returned to this browser.",
      onClose: i,
      children: [
        g.isLoading ? /* @__PURE__ */ h.jsx("p", { role: "status", children: "Loading settings…" }) : null,
        g.isError ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Settings could not be loaded." }),
          /* @__PURE__ */ h.jsx("button", { type: "button", onClick: () => g.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ h.jsxs("form", { className: "aiw-dialog-form", onSubmit: w, children: [
          /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ h.jsx("span", { children: "Azure endpoint" }),
            /* @__PURE__ */ h.jsx(
              "input",
              {
                type: "url",
                required: !0,
                value: c.endpoint,
                onChange: (M) => j("endpoint", M.target.value),
                placeholder: "https://your-resource.openai.azure.com"
              }
            )
          ] }),
          /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ h.jsxs("span", { children: [
              "API key",
              g.data?.maskedApiKey ? /* @__PURE__ */ h.jsxs("small", { children: [
                "saved · ",
                g.data.maskedApiKey
              ] }) : null
            ] }),
            /* @__PURE__ */ h.jsx(
              "input",
              {
                type: "password",
                autoComplete: "new-password",
                required: !O,
                value: c.apiKey,
                onChange: (M) => j("apiKey", M.target.value),
                placeholder: O ? "Leave blank to keep saved key" : "Enter your private key"
              }
            )
          ] }),
          /* @__PURE__ */ h.jsxs("div", { className: "aiw-field-row", children: [
            /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ h.jsx("span", { children: "Chat deployment" }),
              /* @__PURE__ */ h.jsx("input", { required: !0, value: c.chatDeployment, onChange: (M) => j("chatDeployment", M.target.value) })
            ] }),
            /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ h.jsx("span", { children: "Embedding deployment" }),
              /* @__PURE__ */ h.jsx(
                "input",
                {
                  value: c.embeddingDeployment,
                  onChange: (M) => j("embeddingDeployment", M.target.value),
                  placeholder: "Required for materials"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ h.jsx("span", { children: "API version" }),
            /* @__PURE__ */ h.jsx(
              "input",
              {
                required: !0,
                value: c.apiVersion,
                onChange: (M) => j("apiVersion", M.target.value),
                placeholder: "2024-10-21"
              }
            )
          ] }),
          /* @__PURE__ */ h.jsxs("div", { className: "aiw-security-note", children: [
            /* @__PURE__ */ h.jsx("strong", { children: "Private by design" }),
            /* @__PURE__ */ h.jsx("span", { children: "Azure calls run on the backend. The browser receives configuration status only." })
          ] }),
          d ? /* @__PURE__ */ h.jsx("p", { className: "aiw-test-result", role: "status", children: d }) : null,
          /* @__PURE__ */ h.jsxs("div", { className: "aiw-dialog-actions aiw-dialog-actions--split", children: [
            /* @__PURE__ */ h.jsx(
              "button",
              {
                className: "aiw-button aiw-button--quiet",
                type: "button",
                onClick: () => _.mutate(),
                disabled: _.isPending || !c.endpoint || !c.chatDeployment || !c.apiVersion,
                children: _.isPending ? "Testing…" : "Test connection"
              }
            ),
            /* @__PURE__ */ h.jsxs("div", { children: [
              /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: i, children: "Cancel" }),
              /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--primary", type: "submit", disabled: y.isPending, children: y.isPending ? "Saving…" : "Save settings" })
            ] })
          ] })
        ] })
      ]
    }
  );
}
const Yz = {
  gathering_requirements: "Gathering requirements",
  ready_to_generate: "Ready to generate",
  generating: "Generating",
  generation_failed: "Generation failed",
  review_required: "Review required",
  draft_saved: "Draft saved",
  published: "Published"
}, Kz = {
  validating_quiz_plan: "Validating quiz plan",
  retrieving_course_material: "Retrieving course material",
  selecting_source_passages: "Selecting source passages",
  generating_questions: "Generating questions",
  validating_generated_output: "Validating generated output",
  saving_draft: "Saving draft",
  opening_review_workspace: "Opening review workspace"
};
function tc(n) {
  return n ? Yz[n] || n.replaceAll("_", " ") : "Gathering requirements";
}
function yp(n) {
  return n ? Kz[n] || n.replaceAll("_", " ") : "Preparing generation";
}
function Xz(n) {
  if (!n) return "";
  const i = new Date(n);
  return Number.isNaN(i.getTime()) ? "" : new Intl.DateTimeFormat(void 0, {
    hour: "numeric",
    minute: "2-digit"
  }).format(i);
}
function Vz(n) {
  return n ? n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB` : "";
}
function yu(n) {
  const i = [];
  n.courseId || i.push("courseId"), n.topic.trim() || i.push("topic"), n.difficulty || i.push("difficulty"), (!n.questionCount || n.questionCount < 1) && i.push("questionCount"), n.language.trim() || i.push("language");
  const s = Object.values(n.questionTypeDistribution).reduce((c, m) => c + Number(m || 0), 0);
  (s < 1 || n.questionCount && s !== n.questionCount) && i.push("questionTypeDistribution");
  const r = n.missingRequiredFields.filter((c) => c === "courseId" ? !n.courseId : c === "topic" ? !n.topic.trim() : c === "difficulty" ? !n.difficulty : c === "questionCount" ? !n.questionCount : c === "language" ? !n.language.trim() : c === "questionTypeDistribution" || c === "questionTypes" ? s < 1 || !!(n.questionCount && s !== n.questionCount) : !0);
  return [.../* @__PURE__ */ new Set([...i, ...r])];
}
function Jz(n) {
  return yu(n).length === 0;
}
function hv(n) {
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
function Fz() {
  return typeof crypto < "u" && typeof crypto.randomUUID == "function" ? crypto.randomUUID() : `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
const nc = {
  multipleChoice: { short: "MCQ", full: "multiple-choice" },
  trueFalse: { short: "true/false", full: "true/false" },
  shortAnswer: { short: "short answer", full: "short-answer" },
  essay: { short: "essay", full: "essay" },
  coding: { short: "coding", full: "coding" }
}, Iz = /\b(?:algorithm|code|coding|computer|data structure|database|javascript|java|program|python|software|web)\b/i, $o = 5;
function Xt(n, i) {
  const s = String(n || "").replace(/https?:\/\/\S+/gi, "").replace(/<[^>]*>/g, " ").replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (s.length <= i) return s;
  const r = s.slice(0, i + 1), c = r.lastIndexOf(" ");
  return `${r.slice(0, c > i * 0.6 ? c : i).trim()}…`;
}
function nu(n) {
  return Xt(
    n.originalName.replace(/\.(?:docx|md|pdf|txt)$/i, "").replace(/[_-]+/g, " "),
    54
  ) || `Material ${n.id}`;
}
function Ei(n) {
  return n ? Xt(`${n.code} — ${n.title}`, 72) : "the selected course";
}
function Wz(n, i) {
  return Xt(n.topic, 56) || Xt(i?.title, 56) || "this course";
}
function Pz(n) {
  const i = Object.entries(n.questionTypeDistribution).filter(([, s]) => Number(s) > 0);
  return i.length ? {
    label: i.map(([s, r]) => `${r} ${nc[s].short}`).join(" + "),
    value: i.map(([s, r]) => `${r} ${nc[s].full} question${r === 1 ? "" : "s"}`).join(" and ")
  } : null;
}
function ew(n) {
  return Object.entries(n.questionTypeDistribution).sort((i, s) => Number(s[1]) - Number(i[1]))[0]?.[0] || "multipleChoice";
}
function tw(n) {
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
    const i = Ei(n[0]);
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
  return n.slice(0, 4).map((i, s) => ({
    label: `Quiz for ${Xt(i.code, 24)}`,
    value: s % 2 ? `Create a 10-question mixed quiz for ${Ei(i)}.` : `Create a medium concept-check quiz for ${Ei(i)}.`
  }));
}
function nw({
  detail: n,
  plan: i,
  courses: s,
  materials: r
}) {
  if (!n) return tw(s);
  const c = [], m = /* @__PURE__ */ new Set(), d = (w) => {
    if (!w || c.length >= $o) return;
    const O = Xt(w.label, 80), M = Xt(w.value, 180), H = M.toLocaleLowerCase();
    !O || !M || m.has(H) || (m.add(H), c.push({ label: O, value: M }));
  };
  n.suggestedReplies.forEach(d);
  const v = s.find((w) => Number(w.id) === Number(i.courseId)), g = yu(i), y = Wz(i, v), _ = r.filter((w) => w.status !== "failed"), j = i.materialIds.length ? _.filter((w) => i.materialIds.includes(w.id)) : _;
  if (g.includes("courseId"))
    s.slice(0, $o).forEach((w) => d({
      label: `Use ${Xt(w.code, 24)}`,
      value: `Create this quiz for ${Ei(w)}.`
    }));
  else if (g.includes("topic"))
    j.slice(0, 2).forEach((w) => d({
      label: `Use ${nu(w)}`,
      value: `Use the main concepts from “${nu(w)}” as the quiz topic for ${Ei(v)}.`
    })), d({
      label: `Choose a ${Xt(v?.code, 24)} topic`,
      value: `Help me choose a focused topic from ${Ei(v)}.`
    });
  else if (g.includes("difficulty"))
    ["easy", "medium", "hard"].forEach((w) => d({
      label: `${w[0].toUpperCase()}${w.slice(1)} ${y}`,
      value: `Make the ${y} quiz ${w}.`
    }));
  else if (g.includes("questionCount"))
    [5, 10, 15].forEach((w) => d({
      label: `${w} ${y} questions`,
      value: `Use ${w} questions for the ${y} quiz.`
    }));
  else if (g.includes("language"))
    ["English", "Turkish", "Spanish"].forEach((w) => d({
      label: `${y} in ${w}`,
      value: `Write the ${y} quiz in ${w}.`
    }));
  else if (g.includes("questionTypeDistribution")) {
    const w = i.questionCount || 10, O = Iz.test(`${y} ${v?.title || ""}`), M = Math.min(2, Math.max(1, Math.floor(w / 4)));
    d({
      label: "Mostly multiple choice",
      value: `Use ${w} mostly multiple-choice questions about ${y}.`
    }), d(O ? {
      label: `MCQ + ${M} coding`,
      value: `Use ${w - M} multiple-choice and ${M} coding questions about ${y}.`
    } : {
      label: `MCQ + ${M} short answer`,
      value: `Use ${w - M} multiple-choice and ${M} short-answer questions about ${y}.`
    }), d({
      label: "Balanced mixed quiz",
      value: `Use a balanced mix of question types for the ${y} quiz.`
    });
  } else {
    const w = Pz(i);
    if (w && d({
      label: `Keep ${w.label}`,
      value: `Keep the ${y} quiz at ${w.value}.`
    }), j.slice(0, 2).forEach((O) => d({
      label: `${i.materialScope === "course_material_only" ? "Use only" : "Ground in"} ${nu(O)}`,
      value: `${i.materialScope === "course_material_only" ? "Use only" : "Ground the quiz in"} “${nu(O)}” for the ${y} questions.`
    })), n.draft) {
      const O = nc[ew(i)].short;
      d({
        label: `Make ${O} questions harder`,
        value: `Make the ${O} questions more challenging while keeping the ${y} learning objectives.`
      }), d({
        label: i.includeExplanations ? "Tighten explanations" : "Add answer explanations",
        value: i.includeExplanations ? "Make every answer explanation shorter and more precise." : "Add a concise explanation for every answer."
      });
    } else
      i.questionTypeDistribution.coding > 0 && d({
        label: "Make coding questions scenario-based",
        value: `Make the coding questions scenario-based and focused on ${y}.`
      }), d({
        label: i.includeExplanations ? "Use concise explanations" : "Include explanations",
        value: i.includeExplanations ? "Keep the answer explanations concise and instructional." : "Include a concise explanation for every answer."
      });
  }
  return c.length < 3 && [...n.messages].reverse().find((O) => O.sender === "assistant")?.quickReplies.forEach(d), c.slice(0, $o);
}
function aw({
  disabled: n,
  startRequired: i,
  isSending: s,
  hasDraft: r,
  onSend: c,
  onAttach: m,
  onPasteMaterial: d
}) {
  const [v, g] = I.useState(""), y = I.useRef(null), _ = n || i, j = (O) => {
    O?.preventDefault();
    const M = v.trim();
    !M || _ || s || (c(M), g(""));
  }, w = (O) => {
    O.key === "Enter" && !O.shiftKey && (O.preventDefault(), j());
  };
  return /* @__PURE__ */ h.jsxs("form", { className: "aiw-composer", onSubmit: j, "aria-label": "Message the AI quiz assistant", children: [
    /* @__PURE__ */ h.jsx("label", { htmlFor: "aiw-chat-message", className: "aiw-sr-only", children: r ? "Describe a revision to the quiz draft" : "Describe the quiz you want to create" }),
    /* @__PURE__ */ h.jsx(
      "textarea",
      {
        ref: y,
        id: "aiw-chat-message",
        value: v,
        onChange: (O) => g(O.target.value),
        onKeyDown: w,
        rows: 3,
        maxLength: 8e3,
        disabled: _ || s,
        placeholder: r ? "Ask for a controlled revision, for example “Make question 3 harder”…" : "Describe the course, topic, outcomes, difficulty, question types, and special instructions…"
      }
    ),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-composer__footer", children: [
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-composer__tools", children: [
        /* @__PURE__ */ h.jsxs("button", { type: "button", onClick: m, disabled: n, "aria-label": "Upload course material", children: [
          /* @__PURE__ */ h.jsx("span", { "aria-hidden": "true", children: "＋" }),
          " Attach"
        ] }),
        /* @__PURE__ */ h.jsx("button", { type: "button", onClick: d, disabled: n, "aria-label": "Paste course material", children: "Paste notes" })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-composer__send", children: [
        /* @__PURE__ */ h.jsxs("span", { children: [
          v.length,
          "/8000"
        ] }),
        /* @__PURE__ */ h.jsx(
          "button",
          {
            className: "aiw-button aiw-button--primary",
            type: "submit",
            disabled: !v.trim() || _ || s,
            children: s ? "Sending…" : r ? "Request revision" : "Send"
          }
        )
      ] })
    ] })
  ] });
}
const gp = [
  "validating_quiz_plan",
  "retrieving_course_material",
  "selecting_source_passages",
  "generating_questions",
  "validating_generated_output",
  "saving_draft",
  "opening_review_workspace"
];
function iw({ generation: n, cancelling: i, onCancel: s }) {
  const r = gp.indexOf(n.stage);
  return /* @__PURE__ */ h.jsxs("section", { className: "aiw-generation", "aria-labelledby": "aiw-generation-title", "aria-live": "polite", children: [
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-generation__head", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "Generation in progress" }),
        /* @__PURE__ */ h.jsx("h3", { id: "aiw-generation-title", children: yp(n.stage) }),
        n.message ? /* @__PURE__ */ h.jsx("p", { children: n.message }) : null
      ] }),
      n.canCancel ? /* @__PURE__ */ h.jsx(
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
    /* @__PURE__ */ h.jsx("ol", { className: "aiw-generation__stages", "aria-label": "Generation stages", children: gp.map((c, m) => /* @__PURE__ */ h.jsxs(
      "li",
      {
        className: [
          c === n.stage ? "is-current" : "",
          r >= 0 && m < r ? "is-complete" : ""
        ].filter(Boolean).join(" "),
        "aria-current": c === n.stage ? "step" : void 0,
        children: [
          /* @__PURE__ */ h.jsx("span", { "aria-hidden": "true", children: r >= 0 && m < r ? "✓" : m + 1 }),
          yp(c)
        ]
      },
      c
    )) })
  ] });
}
function lw({
  revision: n,
  applying: i,
  onApply: s,
  onDismiss: r
}) {
  const c = n.beforeSnapshot.questionCount, m = n.proposedSnapshot.questionCount, d = n.proposedSnapshot.title || n.beforeSnapshot.title || "Untitled quiz", v = c !== null || m !== null;
  return /* @__PURE__ */ h.jsxs("section", { className: "aiw-revision-preview", "aria-labelledby": "aiw-revision-title", children: [
    /* @__PURE__ */ h.jsxs("div", { children: [
      /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "Revision preview" }),
      /* @__PURE__ */ h.jsx("h3", { id: "aiw-revision-title", children: n.summary }),
      /* @__PURE__ */ h.jsx("p", { children: "No quiz content has been replaced yet." })
    ] }),
    /* @__PURE__ */ h.jsxs("dl", { className: "aiw-revision-facts", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Proposed title" }),
        /* @__PURE__ */ h.jsx("dd", { children: d })
      ] }),
      v ? /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ h.jsxs(
          "dd",
          {
            "aria-label": `Question count changes from ${c ?? "unknown"} to ${m ?? "unknown"}`,
            children: [
              c ?? "—",
              " ",
              /* @__PURE__ */ h.jsx("span", { "aria-hidden": "true", children: "→" }),
              " ",
              m ?? "—"
            ]
          }
        )
      ] }) : null,
      n.changedQuestionCount ? /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Changed" }),
        /* @__PURE__ */ h.jsx("dd", { children: n.changedQuestionCount })
      ] }) : null,
      n.removedQuestionCount ? /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Removed" }),
        /* @__PURE__ */ h.jsx("dd", { children: n.removedQuestionCount })
      ] }) : null,
      n.addedQuestionCount ? /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Added" }),
        /* @__PURE__ */ h.jsx("dd", { children: n.addedQuestionCount })
      ] }) : null
    ] }),
    n.changes.length ? /* @__PURE__ */ h.jsx("ul", { children: n.changes.map((g, y) => /* @__PURE__ */ h.jsx("li", { children: g }, `${y}-${g}`)) }) : null,
    n.destructive ? /* @__PURE__ */ h.jsx("p", { className: "aiw-warning-note", children: "This revision replaces or removes existing questions. Review it carefully before applying." }) : null,
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-actions", children: [
      /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, disabled: i, children: "Keep current draft" }),
      /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: s, disabled: i, children: i ? "Applying…" : "Apply revision" })
    ] })
  ] });
}
function sw({ replies: n, onSelect: i, disabled: s = !1 }) {
  return n.length ? /* @__PURE__ */ h.jsx("div", { className: "aiw-suggestions", "aria-label": "Suggested replies", children: n.map((r) => /* @__PURE__ */ h.jsx(
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
const uw = "What kind of quiz would you like to create? You can describe the course, topic, learning objectives, difficulty, question types and any special instructions.";
function rw({
  detail: n,
  plan: i,
  courses: s,
  materials: r,
  coursesLoading: c,
  coursesError: m,
  courseSelectionPending: d,
  loading: v,
  error: g,
  isSending: y,
  generation: _,
  cancelling: j,
  revision: w,
  applyingRevision: O,
  onRetryLoad: M,
  onRetryCourses: H,
  onOpenCourses: W,
  onCourseSelect: $,
  onSend: ne,
  onRetryMessage: ee,
  onAttach: G,
  onPasteMaterial: K,
  onCancelGeneration: B,
  onApplyRevision: Y,
  onDismissRevision: Z,
  review: se
}) {
  const ze = I.useRef(null), we = n?.messages || [], Re = I.useMemo(
    () => nw({ detail: n, plan: i, courses: s, materials: r }),
    [s, n, r, i]
  ), je = !!i.courseId && !c && !m && s.length > 0, Xe = !!n?.draft, nt = I.useMemo(() => yu(i), [i]);
  return I.useEffect(() => {
    ze.current?.scrollTo({
      top: ze.current.scrollHeight,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }, [we.length, y]), /* @__PURE__ */ h.jsxs("section", { className: `aiw-chat ${Xe ? "aiw-chat--with-review" : ""}`, "aria-labelledby": "aiw-chat-heading", children: [
    /* @__PURE__ */ h.jsxs("header", { className: "aiw-chat__header", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "Guided quiz designer" }),
        /* @__PURE__ */ h.jsx("h2", { id: "aiw-chat-heading", children: n?.title || "New quiz conversation" })
      ] }),
      n ? /* @__PURE__ */ h.jsx("span", { className: "aiw-chat__context", children: nt.length ? `Still needs ${nt.map(hv).slice(0, 2).join(" and ")}` : "Quiz plan is ready" }) : null
    ] }),
    g ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("strong", { children: "Conversation unavailable" }),
        /* @__PURE__ */ h.jsx("p", { children: "Your work is still stored. Try loading it again." })
      ] }),
      /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: M, children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ h.jsxs(
      "div",
      {
        ref: ze,
        className: "aiw-message-list",
        "aria-live": "polite",
        "aria-busy": v || y,
        "aria-label": "Conversation messages",
        children: [
          v ? /* @__PURE__ */ h.jsx("p", { className: "aiw-loading-message", role: "status", children: "Loading conversation…" }) : null,
          !v && !we.length ? /* @__PURE__ */ h.jsxs("article", { className: "aiw-message aiw-message--assistant", children: [
            /* @__PURE__ */ h.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ h.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ h.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ h.jsx("p", { children: uw })
            ] })
          ] }) : null,
          !v && !i.courseId ? /* @__PURE__ */ h.jsxs("section", { className: "aiw-course-start", "aria-labelledby": "aiw-course-start-heading", children: [
            /* @__PURE__ */ h.jsxs("div", { children: [
              /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "First step" }),
              /* @__PURE__ */ h.jsx("h3", { id: "aiw-course-start-heading", children: "Choose the course for this quiz" }),
              /* @__PURE__ */ h.jsx("p", { children: "The course controls available materials, context, and course-specific suggestions." })
            ] }),
            c ? /* @__PURE__ */ h.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : m ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
              /* @__PURE__ */ h.jsx("span", { children: "Courses could not be loaded." }),
              /* @__PURE__ */ h.jsx("button", { type: "button", onClick: H, children: "Retry" })
            ] }) : s.length ? /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ h.jsx("span", { children: "Course" }),
              /* @__PURE__ */ h.jsxs(
                "select",
                {
                  id: "aiw-start-course",
                  "aria-label": "Choose a course to start",
                  value: "",
                  disabled: d,
                  onChange: (C) => {
                    const X = Number(C.target.value);
                    X && $(X);
                  },
                  children: [
                    /* @__PURE__ */ h.jsx("option", { value: "", children: d ? "Starting course workspace…" : "Select a course" }),
                    s.map((C) => /* @__PURE__ */ h.jsxs("option", { value: C.id, children: [
                      C.code,
                      " — ",
                      C.title
                    ] }, C.id))
                  ]
                }
              ),
              /* @__PURE__ */ h.jsx("small", { children: "Selecting a course starts and saves this conversation." })
            ] }) : /* @__PURE__ */ h.jsxs("div", { className: "aiw-course-start__empty", children: [
              /* @__PURE__ */ h.jsx("p", { children: "No courses are available for your account yet." }),
              /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: W, children: "Open Courses" })
            ] })
          ] }) : null,
          we.map((C) => /* @__PURE__ */ h.jsxs(
            "article",
            {
              className: `aiw-message aiw-message--${C.sender}`,
              "data-status": C.status,
              children: [
                /* @__PURE__ */ h.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: C.sender === "user" ? "You" : "AI" }),
                /* @__PURE__ */ h.jsxs("div", { className: "aiw-message__bubble", children: [
                  /* @__PURE__ */ h.jsxs("div", { className: "aiw-message__meta", children: [
                    /* @__PURE__ */ h.jsx("span", { className: "aiw-message__author", children: C.sender === "user" ? "You" : "Quiz Assistant" }),
                    C.createdAt ? /* @__PURE__ */ h.jsx("time", { dateTime: C.createdAt, children: Xz(C.createdAt) }) : null
                  ] }),
                  /* @__PURE__ */ h.jsx("p", { children: C.content }),
                  C.status === "failed" ? /* @__PURE__ */ h.jsx("button", { type: "button", className: "aiw-text-button", onClick: () => ee(C), children: "Retry message" }) : null
                ] })
              ]
            },
            C.id
          )),
          y ? /* @__PURE__ */ h.jsxs("article", { className: "aiw-message aiw-message--assistant aiw-message--pending", role: "status", children: [
            /* @__PURE__ */ h.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ h.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ h.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ h.jsxs("span", { className: "aiw-typing", "aria-label": "Assistant is responding", children: [
                /* @__PURE__ */ h.jsx("i", {}),
                /* @__PURE__ */ h.jsx("i", {}),
                /* @__PURE__ */ h.jsx("i", {})
              ] })
            ] })
          ] }) : null
        ]
      }
    ),
    /* @__PURE__ */ h.jsx(
      sw,
      {
        replies: je ? Re : [],
        onSelect: ne,
        disabled: y || !!_ || d
      }
    ),
    w ? /* @__PURE__ */ h.jsx(
      lw,
      {
        revision: w,
        applying: O,
        onApply: () => Y(w),
        onDismiss: Z
      }
    ) : null,
    _?.status === "generating" ? /* @__PURE__ */ h.jsx(iw, { generation: _, cancelling: j, onCancel: B }) : null,
    /* @__PURE__ */ h.jsx(
      aw,
      {
        disabled: d || !!(_ && ["queued", "generating", "cancel_requested"].includes(_.status)),
        startRequired: !n && !i.courseId,
        isSending: y,
        hasDraft: Xe,
        onSend: ne,
        onAttach: G,
        onPasteMaterial: K
      }
    ),
    se
  ] });
}
function ow({
  conversations: n,
  selectedId: i,
  isLoading: s,
  isError: r,
  isCreating: c,
  onNew: m,
  onSelect: d,
  onRetry: v,
  materials: g
}) {
  const [y, _] = I.useState(""), [j, w] = I.useState("all"), O = I.useMemo(() => {
    const H = y.trim().toLocaleLowerCase();
    return n.filter((W) => {
      const $ = !H || W.title.toLocaleLowerCase().includes(H), ne = j === "all" || W.status === j;
      return $ && ne;
    });
  }, [n, y, j]), M = n.filter((H) => H.draftId).slice(0, 4);
  return /* @__PURE__ */ h.jsxs("aside", { className: "aiw-sidebar", "aria-label": "AI conversations and materials", children: [
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-sidebar__top", children: [
      /* @__PURE__ */ h.jsxs("button", { className: "aiw-button aiw-button--primary aiw-button--full", type: "button", onClick: m, disabled: c, children: [
        /* @__PURE__ */ h.jsx("span", { "aria-hidden": "true", children: "＋" }),
        c ? "Starting…" : "New conversation"
      ] }),
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-search", children: [
        /* @__PURE__ */ h.jsx("span", { className: "aiw-sr-only", children: "Search conversations" }),
        /* @__PURE__ */ h.jsx("span", { "aria-hidden": "true", children: "⌕" }),
        /* @__PURE__ */ h.jsx(
          "input",
          {
            type: "search",
            value: y,
            onChange: (H) => _(H.target.value),
            placeholder: "Search conversations"
          }
        )
      ] }),
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-field aiw-field--compact", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Status" }),
        /* @__PURE__ */ h.jsxs("select", { value: j, onChange: (H) => w(H.target.value), children: [
          /* @__PURE__ */ h.jsx("option", { value: "all", children: "All conversations" }),
          /* @__PURE__ */ h.jsx("option", { value: "gathering_requirements", children: "Gathering requirements" }),
          /* @__PURE__ */ h.jsx("option", { value: "ready_to_generate", children: "Ready to generate" }),
          /* @__PURE__ */ h.jsx("option", { value: "review_required", children: "Review required" }),
          /* @__PURE__ */ h.jsx("option", { value: "draft_saved", children: "Draft saved" }),
          /* @__PURE__ */ h.jsx("option", { value: "generation_failed", children: "Generation failed" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ h.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-conversations-heading", children: [
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ h.jsx("h2", { id: "aiw-conversations-heading", children: "Conversations" }),
        /* @__PURE__ */ h.jsx("span", { children: O.length })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-conversation-list", children: [
        s ? /* @__PURE__ */ h.jsx("p", { className: "aiw-muted", role: "status", children: "Loading conversations…" }) : null,
        r ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Conversations could not be loaded." }),
          /* @__PURE__ */ h.jsx("button", { type: "button", onClick: v, children: "Retry" })
        ] }) : null,
        !s && !r && !O.length ? /* @__PURE__ */ h.jsx("div", { className: "aiw-mini-empty", children: /* @__PURE__ */ h.jsx("p", { children: n.length ? "No conversations match this filter." : "No conversations yet." }) }) : null,
        O.map((H) => /* @__PURE__ */ h.jsxs(
          "button",
          {
            className: `aiw-conversation ${i === H.id ? "is-active" : ""}`,
            type: "button",
            onClick: () => d(H.id),
            "aria-current": i === H.id ? "page" : void 0,
            children: [
              /* @__PURE__ */ h.jsx("span", { className: "aiw-conversation__title", children: H.title }),
              /* @__PURE__ */ h.jsx("span", { className: `aiw-status aiw-status--${H.status}`, children: tc(H.status) })
            ]
          },
          H.id
        ))
      ] })
    ] }),
    M.length ? /* @__PURE__ */ h.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-drafts-heading", children: [
      /* @__PURE__ */ h.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ h.jsx("h2", { id: "aiw-drafts-heading", children: "Recent drafts" }) }),
      /* @__PURE__ */ h.jsx("div", { className: "aiw-compact-list", children: M.map((H) => /* @__PURE__ */ h.jsxs("button", { type: "button", onClick: () => d(H.id), children: [
        /* @__PURE__ */ h.jsx("span", { children: H.title }),
        /* @__PURE__ */ h.jsx("small", { children: tc(H.status) })
      ] }, H.id)) })
    ] }) : null,
    g
  ] });
}
function cw({
  client: n,
  conversationId: i,
  plan: s,
  courseId: r,
  courses: c,
  coursesLoading: m,
  coursesError: d,
  courseSelectionPending: v,
  onPlanPatch: g,
  onCourseSelect: y,
  onRetryCourses: _,
  onOpenCourses: j,
  onOpenPaste: w,
  onToast: O
}) {
  const M = Oi(), [H, W] = I.useState(""), $ = En({
    queryKey: ["ai", "materials", r],
    queryFn: () => n.listMaterials(r),
    enabled: !!r
  }), ne = $.data || [], ee = Kt({
    mutationFn: ({ selectedCourseId: Z, file: se }) => n.uploadMaterial(Z, se),
    onSuccess: async () => {
      await Promise.all([
        M.invalidateQueries({ queryKey: ["ai", "materials", r] }),
        i ? M.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), O("Course material indexed.", "success");
    },
    onError: (Z) => O(Z instanceof Error ? Z.message : "Material upload failed.", "error")
  }), G = Kt({
    mutationFn: ({ selectedCourseId: Z, materialId: se }) => n.deleteMaterial(Z, se),
    onSuccess: async (Z, se) => {
      g({ materialIds: s.materialIds.filter((ze) => ze !== se.materialId) }), await Promise.all([
        M.invalidateQueries({ queryKey: ["ai", "materials", r] }),
        i ? M.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), O("Material removed.", "success");
    },
    onError: (Z) => O(Z instanceof Error ? Z.message : "Could not remove material.", "error")
  }), K = I.useMemo(() => {
    const Z = H.trim().toLocaleLowerCase();
    return ne.filter((se) => !Z || se.originalName.toLocaleLowerCase().includes(Z));
  }, [H, ne]), B = (Z) => {
    const se = Z.target.files?.[0];
    Z.target.value = "", !(!se || !r) && ee.mutate({ selectedCourseId: r, file: se });
  }, Y = (Z) => {
    if (!i) {
      O("Start a conversation before selecting source material.", "info");
      return;
    }
    const se = s.materialIds.includes(Z.id);
    g({
      materialIds: se ? s.materialIds.filter((ze) => ze !== Z.id) : [...s.materialIds, Z.id]
    });
  };
  return /* @__PURE__ */ h.jsxs("section", { className: "aiw-sidebar__section aiw-materials", "aria-labelledby": "aiw-materials-heading", children: [
    /* @__PURE__ */ h.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ h.jsxs("div", { children: [
      /* @__PURE__ */ h.jsx("h2", { id: "aiw-materials-heading", children: "Course materials" }),
      /* @__PURE__ */ h.jsx("small", { children: r ? `${ne.length} indexed` : "Choose a course first" })
    ] }) }),
    r ? null : /* @__PURE__ */ h.jsx("div", { className: "aiw-material-course", children: m ? /* @__PURE__ */ h.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : d ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
      /* @__PURE__ */ h.jsx("span", { children: "Courses could not be loaded." }),
      /* @__PURE__ */ h.jsx("button", { type: "button", onClick: _, children: "Retry" })
    ] }) : c.length ? /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
      /* @__PURE__ */ h.jsx("span", { children: "Course for materials" }),
      /* @__PURE__ */ h.jsxs(
        "select",
        {
          "aria-label": "Course for materials",
          value: "",
          disabled: v,
          onChange: (Z) => {
            const se = Number(Z.target.value);
            se && y(se);
          },
          children: [
            /* @__PURE__ */ h.jsx("option", { value: "", children: v ? "Starting workspace…" : "Select a course" }),
            c.map((Z) => /* @__PURE__ */ h.jsxs("option", { value: Z.id, children: [
              Z.code,
              " — ",
              Z.title
            ] }, Z.id))
          ]
        }
      )
    ] }) : /* @__PURE__ */ h.jsx(
      "button",
      {
        className: "aiw-button aiw-button--quiet aiw-button--small aiw-button--full",
        type: "button",
        onClick: j,
        children: "Open Courses"
      }
    ) }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-material-actions", children: [
      /* @__PURE__ */ h.jsxs("label", { className: `aiw-button aiw-button--quiet aiw-button--small ${!r || v ? "is-disabled" : ""}`, children: [
        /* @__PURE__ */ h.jsx("span", { "aria-hidden": "true", children: "↑" }),
        ee.isPending ? "Indexing…" : "Upload",
        /* @__PURE__ */ h.jsx(
          "input",
          {
            id: "aiw-material-upload",
            className: "aiw-sr-only",
            type: "file",
            accept: ".pdf,.txt,.md,.docx",
            onChange: B,
            disabled: !r || v || ee.isPending
          }
        )
      ] }),
      /* @__PURE__ */ h.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet aiw-button--small",
          type: "button",
          onClick: w,
          disabled: !r || v,
          children: "Paste notes"
        }
      )
    ] }),
    ne.length > 4 ? /* @__PURE__ */ h.jsxs("label", { className: "aiw-search aiw-search--small", children: [
      /* @__PURE__ */ h.jsx("span", { className: "aiw-sr-only", children: "Filter course materials" }),
      /* @__PURE__ */ h.jsx("span", { "aria-hidden": "true", children: "⌕" }),
      /* @__PURE__ */ h.jsx("input", { value: H, onChange: (Z) => W(Z.target.value), placeholder: "Filter materials" })
    ] }) : null,
    $.isLoading ? /* @__PURE__ */ h.jsx("p", { className: "aiw-muted", role: "status", children: "Loading materials…" }) : null,
    $.isError ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
      /* @__PURE__ */ h.jsx("span", { children: "Materials could not be loaded." }),
      /* @__PURE__ */ h.jsx("button", { type: "button", onClick: () => $.refetch(), children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-material-list", children: [
      r && !$.isLoading && !K.length ? /* @__PURE__ */ h.jsx("p", { className: "aiw-muted", children: "No indexed material for this course." }) : null,
      K.map((Z) => /* @__PURE__ */ h.jsxs("div", { className: "aiw-material", children: [
        /* @__PURE__ */ h.jsxs("label", { children: [
          /* @__PURE__ */ h.jsx(
            "input",
            {
              type: "checkbox",
              checked: s.materialIds.includes(Z.id),
              onChange: () => Y(Z),
              disabled: Z.status === "failed"
            }
          ),
          /* @__PURE__ */ h.jsxs("span", { children: [
            /* @__PURE__ */ h.jsx("strong", { children: Z.originalName }),
            /* @__PURE__ */ h.jsx("small", { children: Z.status === "failed" ? Z.errorMessage || "Indexing failed" : `${Z.chunkCount} chunks${Z.byteSize ? ` · ${Vz(Z.byteSize)}` : ""}` })
          ] })
        ] }),
        /* @__PURE__ */ h.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            "aria-label": `Remove ${Z.originalName}`,
            disabled: G.isPending,
            onClick: () => {
              r && window.confirm(`Remove “${Z.originalName}” and its indexed chunks?`) && G.mutate({ selectedCourseId: r, materialId: Z.id });
            },
            children: "×"
          }
        )
      ] }, Z.id))
    ] })
  ] });
}
function fw({
  client: n,
  courseId: i,
  conversationId: s,
  onClose: r,
  onToast: c
}) {
  const m = Oi(), [d, v] = I.useState("Pasted course notes"), [g, y] = I.useState(""), _ = Kt({
    mutationFn: () => n.pasteMaterial(i, { name: d.trim(), content: g.trim() }),
    onSuccess: async () => {
      await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "materials", i] }),
        s ? m.invalidateQueries({ queryKey: ["ai", "conversation", s] }) : Promise.resolve()
      ]), c("Pasted notes indexed.", "success"), r();
    },
    onError: (w) => c(w instanceof Error ? w.message : "Could not index pasted notes.", "error")
  }), j = (w) => {
    w.preventDefault(), d.trim() && g.trim() && _.mutate();
  };
  return /* @__PURE__ */ h.jsx(
    Sc,
    {
      title: "Paste course material",
      description: "The text is treated as untrusted reference content and indexed only for this course.",
      onClose: r,
      size: "wide",
      children: /* @__PURE__ */ h.jsxs("form", { className: "aiw-dialog-form", onSubmit: j, children: [
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Material name" }),
          /* @__PURE__ */ h.jsx("input", { value: d, onChange: (w) => v(w.target.value), maxLength: 160, required: !0 })
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Course notes" }),
          /* @__PURE__ */ h.jsx(
            "textarea",
            {
              value: g,
              onChange: (w) => y(w.target.value),
              rows: 12,
              maxLength: 1e5,
              required: !0,
              placeholder: "Paste lecture notes, reading excerpts, or other course-owned content…"
            }
          )
        ] }),
        /* @__PURE__ */ h.jsxs("p", { className: "aiw-field-hint", children: [
          g.length.toLocaleString(),
          " / 100,000 characters"
        ] }),
        /* @__PURE__ */ h.jsxs("div", { className: "aiw-dialog-actions", children: [
          /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, children: "Cancel" }),
          /* @__PURE__ */ h.jsx(
            "button",
            {
              className: "aiw-button aiw-button--primary",
              type: "submit",
              disabled: !d.trim() || !g.trim() || _.isPending,
              children: _.isPending ? "Indexing notes…" : "Index pasted text"
            }
          )
        ] })
      ] })
    }
  );
}
const bp = [
  ["multipleChoice", "Multiple choice"],
  ["trueFalse", "True / false"],
  ["shortAnswer", "Short answer"],
  ["essay", "Essay"],
  ["coding", "Coding"]
];
function au(n) {
  return n == null || n === "" ? "Not set" : n;
}
function dw({
  plan: n,
  courses: i,
  coursesLoading: s,
  coursesError: r,
  courseSelectionPending: c,
  courseLocked: m,
  conversationId: d,
  conversationStatus: v,
  generation: g,
  generating: y,
  generationAvailable: _,
  generationConfigured: j,
  onCourseSelect: w,
  onRetryCourses: O,
  onOpenCourses: M,
  onPatch: H,
  onGenerate: W
}) {
  const $ = yu(n), ne = !!d && Jz(n), ee = i.find((B) => B.id === n.courseId), G = Object.values(n.questionTypeDistribution).reduce((B, Y) => B + Number(Y || 0), 0), K = (B, Y) => {
    H({
      questionTypeDistribution: {
        ...n.questionTypeDistribution,
        [B]: Math.max(0, Y)
      }
    });
  };
  return /* @__PURE__ */ h.jsxs("aside", { className: "aiw-plan", "aria-labelledby": "aiw-plan-heading", children: [
    /* @__PURE__ */ h.jsxs("header", { className: "aiw-plan__header", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "Live specification" }),
        /* @__PURE__ */ h.jsx("h2", { id: "aiw-plan-heading", children: "Quiz Plan" })
      ] }),
      /* @__PURE__ */ h.jsxs("span", { className: `aiw-readiness ${ne ? "is-ready" : ""}`, children: [
        /* @__PURE__ */ h.jsx("i", { "aria-hidden": "true" }),
        ne ? "Ready" : `${$.length} missing`
      ] })
    ] }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-plan__status", children: [
      /* @__PURE__ */ h.jsx("span", { children: "Status" }),
      /* @__PURE__ */ h.jsx("strong", { children: tc(g?.status || v) })
    ] }),
    /* @__PURE__ */ h.jsxs("section", { className: "aiw-plan-course", "aria-labelledby": "aiw-plan-course-heading", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("h3", { id: "aiw-plan-course-heading", children: "Course" }),
        /* @__PURE__ */ h.jsx("small", { children: m ? "Locked after draft generation" : "Required before planning or adding material" })
      ] }),
      s ? /* @__PURE__ */ h.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : r ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Courses could not be loaded." }),
        /* @__PURE__ */ h.jsx("button", { type: "button", onClick: O, children: "Retry" })
      ] }) : i.length ? /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsx("span", { className: "aiw-sr-only", children: "Quiz course" }),
        /* @__PURE__ */ h.jsxs(
          "select",
          {
            "aria-label": "Quiz course",
            value: n.courseId || "",
            disabled: c || y || m,
            onChange: (B) => {
              const Y = Number(B.target.value);
              Y && w(Y);
            },
            children: [
              /* @__PURE__ */ h.jsx("option", { value: "", disabled: !0, children: c ? "Saving course…" : "Select a course" }),
              i.map((B) => /* @__PURE__ */ h.jsxs("option", { value: B.id, children: [
                B.code,
                " — ",
                B.title
              ] }, B.id))
            ]
          }
        )
      ] }) : /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: M, children: "Open Courses" }),
      m ? /* @__PURE__ */ h.jsx("p", { children: "Start a new conversation to use another course." }) : null
    ] }),
    /* @__PURE__ */ h.jsxs("dl", { className: "aiw-plan-summary", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Course" }),
        /* @__PURE__ */ h.jsx("dd", { children: ee ? `${ee.code} · ${ee.title}` : "Not set" })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Topic" }),
        /* @__PURE__ */ h.jsx("dd", { children: au(n.topic) })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Difficulty" }),
        /* @__PURE__ */ h.jsx("dd", { children: au(n.difficulty) })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ h.jsx("dd", { children: au(n.questionCount) })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Language" }),
        /* @__PURE__ */ h.jsx("dd", { children: au(n.language) })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("dt", { children: "Knowledge scope" }),
        /* @__PURE__ */ h.jsx("dd", { children: n.materialScope.replaceAll("_", " ") })
      ] })
    ] }),
    n.learningObjectives.length ? /* @__PURE__ */ h.jsxs("section", { className: "aiw-plan__objectives", "aria-labelledby": "aiw-objectives-heading", children: [
      /* @__PURE__ */ h.jsx("h3", { id: "aiw-objectives-heading", children: "Learning objectives" }),
      /* @__PURE__ */ h.jsx("ul", { children: n.learningObjectives.map((B) => /* @__PURE__ */ h.jsx("li", { children: B }, B)) })
    ] }) : null,
    /* @__PURE__ */ h.jsxs("section", { className: "aiw-plan__types", "aria-labelledby": "aiw-type-summary-heading", children: [
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ h.jsx("h3", { id: "aiw-type-summary-heading", children: "Question mix" }),
        /* @__PURE__ */ h.jsxs("span", { children: [
          G,
          "/",
          n.questionCount || 0
        ] })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-type-bars", children: [
        bp.filter(([B]) => n.questionTypeDistribution[B] > 0).map(([B, Y]) => /* @__PURE__ */ h.jsxs("div", { children: [
          /* @__PURE__ */ h.jsx("span", { children: Y }),
          /* @__PURE__ */ h.jsx("strong", { children: n.questionTypeDistribution[B] })
        ] }, B)),
        G ? null : /* @__PURE__ */ h.jsx("p", { className: "aiw-muted", children: "No question types selected." })
      ] })
    ] }),
    !d || !n.courseId ? /* @__PURE__ */ h.jsx("div", { className: "aiw-plan-note", role: "status", children: "Choose a course above to start a saved quiz plan." }) : j ? _ ? $.length ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-plan-note", role: "status", children: [
      /* @__PURE__ */ h.jsx("strong", { children: "Still needed:" }),
      " ",
      $.map(hv).join(", ")
    ] }) : /* @__PURE__ */ h.jsx("div", { className: "aiw-plan-note aiw-plan-note--success", role: "status", children: "The plan is complete. Generation starts only when you choose Generate Draft." }) : /* @__PURE__ */ h.jsx("div", { className: "aiw-plan-note", role: "status", children: "AI generation is currently disabled. Your Quiz Plan remains saved." }) : /* @__PURE__ */ h.jsx("div", { className: "aiw-plan-note", role: "status", children: "Configure Azure OpenAI in Azure settings before generating a draft." }),
    /* @__PURE__ */ h.jsx(
      "button",
      {
        className: "aiw-button aiw-button--primary aiw-button--full aiw-generate-button",
        type: "button",
        onClick: W,
        disabled: !ne || y || !_,
        children: y ? "Generating draft…" : v === "generation_failed" ? "Retry generation" : "Generate Draft"
      }
    ),
    /* @__PURE__ */ h.jsx("p", { className: "aiw-safety-copy", children: "Generation always creates a private draft. Nothing is published automatically." }),
    /* @__PURE__ */ h.jsxs("details", { className: "aiw-advanced", children: [
      /* @__PURE__ */ h.jsxs("summary", { children: [
        /* @__PURE__ */ h.jsx("span", { children: "Advanced settings" }),
        /* @__PURE__ */ h.jsx("small", { children: "Direct controls for the same Quiz Plan" })
      ] }),
      /* @__PURE__ */ h.jsxs("fieldset", { disabled: !d || y, children: [
        /* @__PURE__ */ h.jsx("legend", { className: "aiw-sr-only", children: "Advanced Quiz Plan settings" }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Topic" }),
          /* @__PURE__ */ h.jsx(
            "input",
            {
              value: n.topic,
              maxLength: 500,
              onChange: (B) => H({ topic: B.target.value }),
              placeholder: "e.g. Python loops"
            }
          )
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsxs("span", { children: [
            "Learning objectives ",
            /* @__PURE__ */ h.jsx("small", { children: "one per line" })
          ] }),
          /* @__PURE__ */ h.jsx(
            "textarea",
            {
              rows: 3,
              value: n.learningObjectives.join(`
`),
              onChange: (B) => H({
                learningObjectives: B.target.value.split(`
`).map((Y) => Y.trim()).filter(Boolean)
              })
            }
          )
        ] }),
        /* @__PURE__ */ h.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ h.jsx("span", { children: "Difficulty" }),
            /* @__PURE__ */ h.jsxs(
              "select",
              {
                value: n.difficulty,
                onChange: (B) => H({ difficulty: B.target.value }),
                children: [
                  /* @__PURE__ */ h.jsx("option", { value: "", children: "Select difficulty" }),
                  /* @__PURE__ */ h.jsx("option", { value: "easy", children: "Easy" }),
                  /* @__PURE__ */ h.jsx("option", { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ h.jsx("option", { value: "hard", children: "Hard" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ h.jsx("span", { children: "Question count" }),
            /* @__PURE__ */ h.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 20,
                value: n.questionCount || "",
                onChange: (B) => H({
                  questionCount: B.target.value ? Number(B.target.value) : null
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ h.jsxs("fieldset", { className: "aiw-distribution", children: [
          /* @__PURE__ */ h.jsx("legend", { children: "Question type distribution" }),
          /* @__PURE__ */ h.jsx("div", { className: "aiw-distribution__grid", children: bp.map(([B, Y]) => /* @__PURE__ */ h.jsxs("label", { children: [
            /* @__PURE__ */ h.jsx("span", { children: Y }),
            /* @__PURE__ */ h.jsx(
              "input",
              {
                "aria-label": `${Y} count`,
                type: "number",
                min: 0,
                max: 20,
                value: n.questionTypeDistribution[B],
                onChange: (Z) => K(B, Number(Z.target.value || 0))
              }
            )
          ] }, B)) })
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Language" }),
          /* @__PURE__ */ h.jsx("input", { value: n.language, maxLength: 60, onChange: (B) => H({ language: B.target.value }) })
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Knowledge scope" }),
          /* @__PURE__ */ h.jsxs(
            "select",
            {
              value: n.materialScope,
              onChange: (B) => {
                const Y = B.target.value;
                H({
                  materialScope: Y,
                  useIndexedMaterialOnly: Y === "course_material_only"
                });
              },
              children: [
                /* @__PURE__ */ h.jsx("option", { value: "general_knowledge_allowed", children: "General model knowledge allowed" }),
                /* @__PURE__ */ h.jsx("option", { value: "course_material_preferred", children: "Course material preferred" }),
                /* @__PURE__ */ h.jsx("option", { value: "course_material_only", children: "Course material only" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-check", children: [
          /* @__PURE__ */ h.jsx(
            "input",
            {
              type: "checkbox",
              checked: n.includeExplanations,
              onChange: (B) => H({ includeExplanations: B.target.checked })
            }
          ),
          /* @__PURE__ */ h.jsx("span", { children: "Include answer explanations" })
        ] }),
        /* @__PURE__ */ h.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ h.jsxs("span", { children: [
              "Time limit ",
              /* @__PURE__ */ h.jsx("small", { children: "minutes" })
            ] }),
            /* @__PURE__ */ h.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 600,
                value: n.timeLimitMinutes || "",
                onChange: (B) => H({
                  timeLimitMinutes: B.target.value ? Number(B.target.value) : null
                })
              }
            )
          ] }),
          /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ h.jsxs("span", { children: [
              "Tags ",
              /* @__PURE__ */ h.jsx("small", { children: "comma separated" })
            ] }),
            /* @__PURE__ */ h.jsx(
              "input",
              {
                value: n.tags.join(", "),
                onChange: (B) => H({
                  tags: B.target.value.split(",").map((Y) => Y.trim()).filter(Boolean)
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Additional instructions" }),
          /* @__PURE__ */ h.jsx(
            "textarea",
            {
              rows: 3,
              maxLength: 4e3,
              value: n.specialInstructions,
              onChange: (B) => H({ specialInstructions: B.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Scoring preferences" }),
          /* @__PURE__ */ h.jsx(
            "textarea",
            {
              rows: 2,
              maxLength: 1e3,
              value: n.scoringPreferences,
              onChange: (B) => H({ scoringPreferences: B.target.value }),
              placeholder: "e.g. 2 points each, partial credit for essays"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const hw = [
  ["multiple_choice", "Multiple choice"],
  ["true_false", "True / false"],
  ["short_answer", "Short answer"],
  ["essay", "Essay"],
  ["coding", "Coding"]
];
function _p(n) {
  return {
    ...n,
    questions: n.questions.map((i) => ({
      ...i,
      options: [...i.options],
      sourceReferences: i.sourceReferences.map((s) => ({ ...s }))
    }))
  };
}
function mw() {
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
function pw({
  question: n,
  index: i,
  total: s,
  selected: r,
  disabled: c,
  onSelect: m,
  onChange: d,
  onMove: v,
  onDelete: g,
  onDuplicate: y,
  onRegenerate: _,
  onOpenSource: j
}) {
  const w = I.useId(), O = n.type === "multiple_choice", M = n.type === "true_false", H = ($, ne) => {
    d({ ...n, [$]: ne });
  }, W = ($) => {
    if ($ === "multiple_choice") {
      const ne = n.options.length >= 3 ? n.options : ["Option A", "Option B", "Option C"];
      d({ ...n, type: $, options: ne, correctAnswer: ne.includes(n.correctAnswer) ? n.correctAnswer : ne[0] });
    } else d($ === "true_false" ? { ...n, type: $, options: ["true", "false"], correctAnswer: ["true", "false"].includes(n.correctAnswer) ? n.correctAnswer : "true" } : { ...n, type: $, options: [] });
  };
  return /* @__PURE__ */ h.jsxs("article", { className: `aiw-question ${r ? "is-selected" : ""}`, "aria-labelledby": `${w}-title`, children: [
    /* @__PURE__ */ h.jsxs("header", { className: "aiw-question__header", children: [
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-question__select", children: [
        /* @__PURE__ */ h.jsx(
          "input",
          {
            type: "checkbox",
            checked: r,
            onChange: ($) => m($.target.checked),
            disabled: c
          }
        ),
        /* @__PURE__ */ h.jsx("span", { className: "aiw-question__number", "aria-hidden": "true", children: i + 1 }),
        /* @__PURE__ */ h.jsxs("span", { className: "aiw-sr-only", children: [
          "Select question ",
          i + 1
        ] })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsxs("h4", { id: `${w}-title`, children: [
          "Question ",
          i + 1
        ] }),
        /* @__PURE__ */ h.jsx("span", { className: `aiw-validation aiw-validation--${n.validationStatus}`, children: n.validationStatus.replaceAll("_", " ") })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-question__order", "aria-label": `Reorder question ${i + 1}`, children: [
        /* @__PURE__ */ h.jsx(
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
        /* @__PURE__ */ h.jsx(
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
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-question__body", children: [
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-field-row aiw-field-row--three", children: [
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Question type" }),
          /* @__PURE__ */ h.jsx("select", { value: n.type, onChange: ($) => W($.target.value), disabled: c, children: hw.map(([$, ne]) => /* @__PURE__ */ h.jsx("option", { value: $, children: ne }, $)) })
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Difficulty" }),
          /* @__PURE__ */ h.jsxs("select", { value: n.difficulty, onChange: ($) => H("difficulty", $.target.value), disabled: c, children: [
            /* @__PURE__ */ h.jsx("option", { value: "easy", children: "Easy" }),
            /* @__PURE__ */ h.jsx("option", { value: "medium", children: "Medium" }),
            /* @__PURE__ */ h.jsx("option", { value: "hard", children: "Hard" })
          ] })
        ] }),
        /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ h.jsx("span", { children: "Points" }),
          /* @__PURE__ */ h.jsx(
            "input",
            {
              type: "number",
              min: 0.25,
              max: 100,
              step: 0.25,
              value: n.points,
              onChange: ($) => H("points", Number($.target.value || 1)),
              disabled: c
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Question prompt" }),
        /* @__PURE__ */ h.jsx(
          "textarea",
          {
            rows: 3,
            maxLength: 4e3,
            value: n.text,
            onChange: ($) => H("text", $.target.value),
            disabled: c
          }
        )
      ] }),
      O ? /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsxs("span", { children: [
          "Answer options ",
          /* @__PURE__ */ h.jsx("small", { children: "one per line" })
        ] }),
        /* @__PURE__ */ h.jsx(
          "textarea",
          {
            rows: 4,
            value: n.options.join(`
`),
            onChange: ($) => {
              const ne = $.target.value.split(`
`), ee = ne.includes(n.correctAnswer) ? n.correctAnswer : ne.find(Boolean) || "";
              d({ ...n, options: ne, correctAnswer: ee });
            },
            disabled: c
          }
        )
      ] }) : null,
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsx("span", { children: n.type === "essay" ? "Expected answer or rubric" : "Correct answer" }),
        O || M ? /* @__PURE__ */ h.jsx("select", { value: n.correctAnswer, onChange: ($) => H("correctAnswer", $.target.value), disabled: c, children: (M ? ["true", "false"] : n.options.filter(Boolean)).map(($, ne) => /* @__PURE__ */ h.jsx("option", { value: $, children: $ }, `${ne}-${$}`)) }) : /* @__PURE__ */ h.jsx(
          "textarea",
          {
            rows: 2,
            maxLength: 2e3,
            value: n.correctAnswer,
            onChange: ($) => H("correctAnswer", $.target.value),
            disabled: c
          }
        )
      ] }),
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Explanation" }),
        /* @__PURE__ */ h.jsx(
          "textarea",
          {
            rows: 3,
            maxLength: 4e3,
            value: n.explanation,
            onChange: ($) => H("explanation", $.target.value),
            disabled: c
          }
        )
      ] }),
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Learning objective" }),
        /* @__PURE__ */ h.jsx(
          "input",
          {
            maxLength: 500,
            value: n.learningObjective,
            onChange: ($) => H("learningObjective", $.target.value),
            disabled: c
          }
        )
      ] }),
      n.sourceReferences.length ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-question__sources", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Sources" }),
        /* @__PURE__ */ h.jsx("div", { children: n.sourceReferences.map(($) => /* @__PURE__ */ h.jsx(
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
    /* @__PURE__ */ h.jsxs("footer", { className: "aiw-question__actions", children: [
      /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: _, disabled: c, children: "Regenerate" }),
      /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: y, disabled: c, children: "Duplicate" }),
      /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--danger aiw-button--small", type: "button", onClick: g, disabled: c, children: "Delete" })
    ] })
  ] });
}
function vw({
  draft: n,
  saving: i,
  regenerating: s,
  onSave: r,
  onRegenerate: c,
  onOpenSource: m
}) {
  const [d, v] = I.useState(() => _p(n)), [g, y] = I.useState(() => JSON.stringify(n)), [_, j] = I.useState(/* @__PURE__ */ new Set()), w = i || s;
  I.useEffect(() => {
    v(_p(n)), y(JSON.stringify(n)), j(/* @__PURE__ */ new Set());
  }, [n]);
  const O = I.useMemo(() => JSON.stringify(d) !== g, [d, g]), M = (G, K) => {
    v((B) => ({
      ...B,
      questions: B.questions.map((Y, Z) => Z === G ? K : Y)
    }));
  }, H = (G, K) => {
    const B = G + K;
    B < 0 || B >= d.questions.length || (v((Y) => {
      const Z = [...Y.questions];
      return [Z[G], Z[B]] = [Z[B], Z[G]], { ...Y, questions: Z };
    }), j(/* @__PURE__ */ new Set()));
  }, W = (G) => {
    window.confirm(`Delete question ${G + 1} from this draft?`) && (v((K) => ({
      ...K,
      questions: K.questions.filter((B, Y) => Y !== G)
    })), j(/* @__PURE__ */ new Set()));
  }, $ = (G) => {
    v((K) => {
      const B = K.questions[G], Y = {
        ...B,
        id: void 0,
        text: `${B.text} (copy)`,
        options: [...B.options],
        sourceReferences: B.sourceReferences.map((se) => ({ ...se }))
      }, Z = [...K.questions];
      return Z.splice(G + 1, 0, Y), { ...K, questions: Z };
    }), j(/* @__PURE__ */ new Set());
  }, ne = async (G = !0) => {
    const K = await r(d, G);
    return K && y(JSON.stringify(d)), K;
  }, ee = async (G) => {
    G.length && (O && !await ne(!1) || await c(G));
  };
  return /* @__PURE__ */ h.jsxs("section", { className: "aiw-review", "aria-labelledby": "aiw-review-heading", children: [
    /* @__PURE__ */ h.jsxs("header", { className: "aiw-review__header", children: [
      /* @__PURE__ */ h.jsxs("div", { children: [
        /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "Review required" }),
        /* @__PURE__ */ h.jsx("h3", { id: "aiw-review-heading", children: "Edit quiz draft" }),
        /* @__PURE__ */ h.jsx("p", { children: "Review every question before saving. The quiz remains private." })
      ] }),
      /* @__PURE__ */ h.jsx("span", { className: `aiw-save-state ${O ? "is-unsaved" : ""}`, role: "status", children: O ? "Unsaved changes" : "All changes saved" })
    ] }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-review__meta", children: [
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Quiz title" }),
        /* @__PURE__ */ h.jsx(
          "input",
          {
            value: d.title,
            maxLength: 160,
            onChange: (G) => v((K) => ({ ...K, title: G.target.value })),
            disabled: w
          }
        )
      ] }),
      /* @__PURE__ */ h.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ h.jsx("span", { children: "Description" }),
        /* @__PURE__ */ h.jsx(
          "textarea",
          {
            rows: 3,
            value: d.description,
            maxLength: 2e3,
            onChange: (G) => v((K) => ({ ...K, description: G.target.value })),
            disabled: w
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-review__toolbar", children: [
      /* @__PURE__ */ h.jsxs("label", { children: [
        /* @__PURE__ */ h.jsx(
          "input",
          {
            type: "checkbox",
            checked: d.questions.length > 0 && _.size === d.questions.length,
            onChange: (G) => j(G.target.checked ? new Set(d.questions.map((K, B) => B)) : /* @__PURE__ */ new Set()),
            disabled: w || !d.questions.length
          }
        ),
        "Select all"
      ] }),
      /* @__PURE__ */ h.jsxs("span", { children: [
        d.questions.length,
        " questions · ",
        d.questions.reduce((G, K) => G + Number(K.points || 0), 0),
        " points"
      ] }),
      /* @__PURE__ */ h.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet aiw-button--small",
          type: "button",
          disabled: !_.size || w,
          onClick: () => ee([..._].sort((G, K) => G - K)),
          children: s ? "Regenerating…" : `Regenerate selected (${_.size})`
        }
      )
    ] }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-question-list", children: [
      d.questions.map((G, K) => /* @__PURE__ */ h.jsx(
        pw,
        {
          question: G,
          index: K,
          total: d.questions.length,
          selected: _.has(K),
          disabled: w,
          onSelect: (B) => j((Y) => {
            const Z = new Set(Y);
            return B ? Z.add(K) : Z.delete(K), Z;
          }),
          onChange: (B) => M(K, B),
          onMove: (B) => H(K, B),
          onDelete: () => W(K),
          onDuplicate: () => $(K),
          onRegenerate: () => ee([K]),
          onOpenSource: m
        },
        G.id || `${K}-${G.text.slice(0, 24)}`
      )),
      d.questions.length ? null : /* @__PURE__ */ h.jsxs("div", { className: "aiw-mini-empty", children: [
        /* @__PURE__ */ h.jsx("strong", { children: "This draft has no questions." }),
        /* @__PURE__ */ h.jsx("p", { children: "Add a manual question or ask the assistant to revise the quiz." })
      ] })
    ] }),
    /* @__PURE__ */ h.jsxs("footer", { className: "aiw-review__footer", children: [
      /* @__PURE__ */ h.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet",
          type: "button",
          disabled: w || d.questions.length >= 20,
          onClick: () => v((G) => ({ ...G, questions: [...G.questions, mw()] })),
          children: "＋ Add manual question"
        }
      ),
      /* @__PURE__ */ h.jsx(
        "button",
        {
          className: "aiw-button aiw-button--primary",
          type: "button",
          onClick: () => ne(!0),
          disabled: !O || w || !d.title.trim() || !d.questions.length,
          children: i ? "Saving…" : "Save as draft"
        }
      )
    ] })
  ] });
}
function yw({ client: n, courseId: i, source: s, onClose: r }) {
  const c = !!(s.materialId && s.chunkId), m = En({
    queryKey: ["ai", "source", i, s.materialId, s.chunkId],
    queryFn: () => n.getMaterialChunk(i, s.materialId, s.chunkId),
    enabled: c
  });
  return /* @__PURE__ */ h.jsxs(
    Sc,
    {
      title: s.label || "Course material source",
      description: "Use this excerpt to verify the generated question against the selected course material.",
      onClose: r,
      size: "wide",
      children: [
        m.isLoading ? /* @__PURE__ */ h.jsx("p", { role: "status", children: "Loading source excerpt…" }) : null,
        m.isError ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
          /* @__PURE__ */ h.jsxs("div", { children: [
            /* @__PURE__ */ h.jsx("strong", { children: "Source unavailable" }),
            /* @__PURE__ */ h.jsx("p", { children: "The excerpt could not be loaded." })
          ] }),
          /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => m.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ h.jsxs("article", { className: "aiw-source-excerpt", children: [
          /* @__PURE__ */ h.jsx("h3", { children: m.data?.label || s.label }),
          /* @__PURE__ */ h.jsx("pre", { children: m.data?.content || s.excerpt || "No excerpt is available for this source reference." })
        ] }),
        /* @__PURE__ */ h.jsx("div", { className: "aiw-dialog-actions", children: /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: r, children: "Done" }) })
      ]
    }
  );
}
const gw = 1, mv = "The running LMS server has not loaded the conversational AI routes. Restart the LMS server, then check again.";
function pv(n) {
  if (!(n instanceof Error)) return !1;
  const i = n;
  return i.status === 404 && /api route not found/i.test(i.message);
}
function ia(n, i) {
  return pv(n) ? mv : n instanceof Error ? n.message : i;
}
class bw extends I.Component {
  state = { error: null };
  static getDerivedStateFromError(i) {
    return { error: i };
  }
  componentDidCatch(i) {
    const s = typeof i?.name == "string" && i.name ? i.name.slice(0, 80) : "RenderError";
    console.error("AI Assistant frontend failed safely.", { name: s });
  }
  render() {
    return this.state.error ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-fatal", role: "alert", children: [
      /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "AI Assistant unavailable" }),
      /* @__PURE__ */ h.jsx("h1", { children: "The conversational workspace could not start." }),
      /* @__PURE__ */ h.jsx("p", { children: "Your saved conversations and drafts were not changed." }),
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-actions", children: [
        /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => location.reload(), children: "Reload page" }),
        this.props.onFallback ? /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: this.props.onFallback, children: "Open legacy assistant" }) : null
      ] })
    ] }) : this.props.children;
  }
}
function _w(n, i) {
  return {
    ...n,
    ...i,
    questionTypeDistribution: i.questionTypeDistribution ? { ...n.questionTypeDistribution, ...i.questionTypeDistribution } : n.questionTypeDistribution
  };
}
function Sw({
  checking: n,
  onCheckAgain: i,
  onFallback: s
}) {
  return /* @__PURE__ */ h.jsxs("main", { className: "aiw-compatibility", role: "alert", children: [
    /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: "Server update required" }),
    /* @__PURE__ */ h.jsx("h1", { children: "The AI workspace and the running LMS server are out of sync." }),
    /* @__PURE__ */ h.jsx("p", { children: mv }),
    /* @__PURE__ */ h.jsx("p", { children: "Your existing LMS, conversations, and drafts have not been changed." }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-inline-actions", children: [
      /* @__PURE__ */ h.jsx(
        "button",
        {
          className: "aiw-button aiw-button--primary",
          type: "button",
          disabled: n,
          onClick: i,
          children: n ? "Checking…" : "Check again"
        }
      ),
      s ? /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: s, children: "Open existing assistant" }) : null
    ] })
  ] });
}
function zw({
  client: n,
  user: i,
  onToast: s,
  onNavigate: r,
  onFallback: c
}) {
  const m = Oi(), [d, v] = I.useState(null), [g, y] = I.useState(!1), [_, j] = I.useState("chat"), [w, O] = I.useState(!1), [M, H] = I.useState(!1), [W, $] = I.useState(null), [ne, ee] = I.useState(null), [G, K] = I.useState(null), B = I.useRef(null), Y = I.useRef(null), Z = I.useCallback((k, Ee = "info") => {
    s?.(k, Ee);
  }, [s]), se = En({
    queryKey: ["ai", "conversations"],
    queryFn: n.listConversations
  }), ze = En({
    queryKey: ["ai", "courses"],
    queryFn: n.listCourses
  }), we = En({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  }), Re = En({
    queryKey: ["ai", "conversation", d],
    queryFn: () => n.getConversation(d),
    enabled: !!d
  });
  I.useEffect(() => {
    d || g || !se.data?.length || v(se.data[0].id);
  }, [se.data, g, d]), I.useEffect(() => {
    ee(null), K(null);
  }, [d]);
  const je = Re.data || null, Xe = je?.plan || la, nt = ze.data || [], X = En({
    queryKey: ["ai", "materials", Xe.courseId],
    queryFn: () => n.listMaterials(Xe.courseId),
    enabled: !!Xe.courseId
  }).data || [], le = je?.status || "gathering_requirements", me = I.useCallback(async () => {
    const k = Y.current;
    if (k) {
      Y.current = null, B.current && window.clearTimeout(B.current), B.current = null;
      try {
        const Ee = await n.updatePlan(k.id, k.patch);
        Ee.conversation ? m.setQueryData(["ai", "conversation", k.id], Ee.conversation) : await m.invalidateQueries({ queryKey: ["ai", "conversation", k.id] }), await m.invalidateQueries({ queryKey: ["ai", "conversations"] });
      } catch (Ee) {
        await m.invalidateQueries({ queryKey: ["ai", "conversation", k.id] }), Z(ia(Ee, "Quiz Plan could not be saved."), "error");
      }
    }
  }, [n, m, Z]);
  I.useEffect(() => () => {
    B.current && window.clearTimeout(B.current), Y.current && me();
  }, [me, d]);
  const xe = I.useCallback((k) => {
    if (!d) {
      Z("Start a conversation before editing the Quiz Plan.", "info");
      return;
    }
    m.setQueryData(
      ["ai", "conversation", d],
      (vt) => vt && {
        ...vt,
        plan: _w(vt.plan, k),
        suggestedReplies: []
      }
    );
    const Ee = Y.current;
    Y.current = {
      id: d,
      patch: Ee?.id === d ? { ...Ee.patch, ...k } : k
    }, B.current && window.clearTimeout(B.current), B.current = window.setTimeout(() => void me(), 450);
  }, [me, m, d, Z]), z = Kt({
    mutationFn: async ({
      courseId: k,
      conversationId: Ee
    }) => Ee ? {
      mode: "updated",
      conversationId: Ee,
      result: await n.updatePlan(Ee, {
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
      ), v(k.conversation.id), y(!1), ee(null), K(null)) : k.result.conversation ? m.setQueryData(
        ["ai", "conversation", k.conversationId],
        k.result.conversation
      ) : await m.invalidateQueries({
        queryKey: ["ai", "conversation", k.conversationId]
      }), await m.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
    onError: (k) => Z(ia(k, "The course could not be selected."), "error")
  }), U = Kt({
    mutationFn: async (k) => {
      if (!d || !je)
        throw new Error("Choose a course before starting the conversation.");
      const Ee = je.draft ? await n.reviseDraft(d, k) : await n.sendMessage(d, k);
      return { conversationId: d, currentDetail: je, result: Ee };
    },
    onSuccess: async ({ conversationId: k, currentDetail: Ee, result: vt }) => {
      v(k), j("chat"), vt.conversation ? m.setQueryData(["ai", "conversation", k], vt.conversation) : Ee && d !== k && m.setQueryData(["ai", "conversation", k], Ee), vt.revision && (ee(vt.revision), K(null)), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", k] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: (k) => Z(ia(k, "The message could not be sent."), "error")
  }), V = Kt({
    mutationFn: () => n.generateDraft(d, Fz()),
    onSuccess: async (k) => {
      k.conversation && d && (m.setQueryData(["ai", "conversation", d], k.conversation), m.setQueryData(
        ["ai", "generation", d],
        k.conversation.generation || null
      )), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", d] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: (k) => Z(ia(k, "Draft generation failed."), "error")
  }), J = je?.status === "generating" || je?.generation?.status === "generating", ue = En({
    queryKey: ["ai", "generation", d],
    queryFn: () => n.getGenerationStatus(d),
    enabled: !!(d && (J || V.isPending)),
    refetchInterval: (k) => ["queued", "generating", "cancel_requested"].includes(k.state.data?.status || "") ? 1400 : !1
  }), re = J || V.isPending ? ue.data || je?.generation || {
    status: "generating",
    stage: "validating_quiz_plan",
    message: "",
    canCancel: !1,
    startedAt: "",
    updatedAt: ""
  } : je?.generation || null, ge = I.useRef("");
  I.useEffect(() => {
    const k = ue.data?.status;
    !k || k === ge.current || (ge.current = k, k !== "generating" && d && (Promise.all([
      m.invalidateQueries({ queryKey: ["ai", "conversation", d] }),
      m.invalidateQueries({ queryKey: ["ai", "conversations"] })
    ]), k === "completed" && Z("Quiz draft is ready for review.", "success")));
  }, [ue.data?.status, m, d, Z]);
  const at = Kt({
    mutationFn: () => n.cancelGeneration(d),
    onSuccess: async () => {
      await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", d] }),
        m.invalidateQueries({ queryKey: ["ai", "generation", d] })
      ]), Z("Generation stopped.", "info");
    },
    onError: (k) => Z(ia(k, "Generation could not be stopped."), "error")
  }), Ze = Kt({
    mutationFn: (k) => n.applyRevision(d, k.id),
    onSuccess: async (k) => {
      ee(null), K(null), k.conversation && d && m.setQueryData(["ai", "conversation", d], k.conversation), await m.invalidateQueries({ queryKey: ["ai", "conversation", d] }), Z("Revision applied to the draft.", "success");
    },
    onError: (k) => Z(ia(k, "Revision could not be applied."), "error")
  }), Nn = Kt({
    mutationFn: (k) => n.saveDraft(d, k),
    onSuccess: async (k) => {
      k.conversation && d && m.setQueryData(["ai", "conversation", d], k.conversation), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", d] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    }
  }), Ra = async (k, Ee = !0) => {
    try {
      return await Nn.mutateAsync(k), Ee && Z("Draft changes saved.", "success"), !0;
    } catch (vt) {
      return Z(ia(vt, "Draft could not be saved."), "error"), !1;
    }
  }, qa = Kt({
    mutationFn: ({ indexes: k, instruction: Ee }) => n.regenerateQuestions(d, k, Ee),
    onSuccess: async (k) => {
      k.conversation && d && m.setQueryData(["ai", "conversation", d], k.conversation), await m.invalidateQueries({ queryKey: ["ai", "conversation", d] }), Z("Selected questions regenerated. Review the changes before saving.", "success");
    },
    onError: (k) => Z(ia(k, "Questions could not be regenerated."), "error")
  }), Ni = ne || je?.pendingRevision || null, tn = Ni?.id === G ? null : Ni, Ft = Xe.courseId, Mi = !!(we.data && we.data.conversationApiVersion < gw || pv(se.error)), Di = (k) => {
    const Ee = d;
    me().then(() => {
      z.mutate({ courseId: k, conversationId: Ee });
    });
  }, Dl = () => {
    me(), v(null), y(!0), ee(null), K(null), j("chat"), window.setTimeout(() => document.getElementById("aiw-start-course")?.focus(), 0);
  }, oa = () => {
    r ? r("#/courses") : location.hash = "#/courses";
  }, Ua = () => {
    j("chat"), window.setTimeout(() => document.getElementById("aiw-start-course")?.focus(), 0);
  }, Za = () => {
    if (!Ft) {
      Ua(), Z("Choose a course before adding material.", "info");
      return;
    }
    H(!0);
  }, gu = () => {
    if (!Ft) {
      Ua(), Z("Choose a course before uploading material.", "info");
      return;
    }
    document.getElementById("aiw-material-upload")?.click();
  }, bu = je?.draft ? /* @__PURE__ */ h.jsx(
    vw,
    {
      draft: je.draft,
      saving: Nn.isPending,
      regenerating: qa.isPending,
      onSave: Ra,
      onRegenerate: async (k, Ee) => {
        await qa.mutateAsync({ indexes: k, instruction: Ee });
      },
      onOpenSource: $
    }
  ) : null;
  return Mi ? /* @__PURE__ */ h.jsx(
    Sw,
    {
      checking: we.isFetching || se.isFetching,
      onCheckAgain: () => {
        Promise.all([we.refetch(), se.refetch()]);
      },
      onFallback: c
    }
  ) : /* @__PURE__ */ h.jsxs("div", { className: "aiw-app", children: [
    /* @__PURE__ */ h.jsxs("header", { className: "aiw-topbar", children: [
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-topbar__title", children: [
        /* @__PURE__ */ h.jsx("div", { className: "aiw-product-mark", "aria-hidden": "true", children: "AI" }),
        /* @__PURE__ */ h.jsxs("div", { children: [
          /* @__PURE__ */ h.jsx("span", { className: "aiw-eyebrow", children: i.role === "admin" ? "Administrator workspace" : "Teacher workspace" }),
          /* @__PURE__ */ h.jsx("h1", { children: "AI Quiz Assistant" }),
          /* @__PURE__ */ h.jsx("p", { children: "Plan together, generate a private draft, then review every question." })
        ] })
      ] }),
      /* @__PURE__ */ h.jsxs("div", { className: "aiw-topbar__actions", children: [
        /* @__PURE__ */ h.jsxs("span", { className: `aiw-config-status ${we.data?.configured ? "is-ready" : ""}`, children: [
          /* @__PURE__ */ h.jsx("i", { "aria-hidden": "true" }),
          we.data?.configured ? "Azure configured" : "Setup required"
        ] }),
        /* @__PURE__ */ h.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => O(!0), children: "Azure settings" })
      ] })
    ] }),
    !we.data?.enabled && we.data ? /* @__PURE__ */ h.jsxs("div", { className: "aiw-page-alert", role: "alert", children: [
      /* @__PURE__ */ h.jsx("strong", { children: "AI generation is disabled." }),
      /* @__PURE__ */ h.jsx("span", { children: we.data.message || "Contact an administrator to enable the assistant." })
    ] }) : null,
    /* @__PURE__ */ h.jsx("div", { className: "aiw-mobile-tabs", role: "tablist", "aria-label": "AI Assistant workspace panels", children: [
      ["conversations", "Conversations"],
      ["chat", je?.draft ? "Chat & review" : "Chat"],
      ["plan", "Quiz Plan"]
    ].map(([k, Ee]) => /* @__PURE__ */ h.jsx(
      "button",
      {
        id: `aiw-${k}-tab`,
        type: "button",
        role: "tab",
        "aria-selected": _ === k,
        "aria-controls": `aiw-${k}-panel`,
        tabIndex: _ === k ? 0 : -1,
        onClick: () => j(k),
        children: Ee
      },
      k
    )) }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-layout", children: [
      /* @__PURE__ */ h.jsx(
        "div",
        {
          id: "aiw-conversations-panel",
          className: `aiw-region aiw-region--left ${_ === "conversations" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-conversations-tab",
          children: /* @__PURE__ */ h.jsx(
            ow,
            {
              conversations: se.data || [],
              selectedId: d,
              isLoading: se.isLoading,
              isError: se.isError,
              isCreating: z.isPending,
              onNew: Dl,
              onRetry: () => {
                se.refetch();
              },
              onSelect: (k) => {
                me(), v(k), y(!1), ee(null), K(null), j("chat");
              },
              materials: /* @__PURE__ */ h.jsx(
                cw,
                {
                  client: n,
                  conversationId: d,
                  plan: Xe,
                  courseId: Ft,
                  courses: nt,
                  coursesLoading: ze.isLoading,
                  coursesError: ze.isError,
                  courseSelectionPending: z.isPending,
                  onPlanPatch: xe,
                  onCourseSelect: Di,
                  onRetryCourses: () => {
                    ze.refetch();
                  },
                  onOpenCourses: oa,
                  onOpenPaste: Za,
                  onToast: Z
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ h.jsx(
        "div",
        {
          id: "aiw-chat-panel",
          className: `aiw-region aiw-region--center ${_ === "chat" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-chat-tab",
          children: /* @__PURE__ */ h.jsx(
            rw,
            {
              detail: je,
              plan: Xe,
              courses: nt,
              materials: X,
              coursesLoading: ze.isLoading,
              coursesError: ze.isError,
              courseSelectionPending: z.isPending,
              loading: Re.isLoading,
              error: Re.isError,
              isSending: U.isPending,
              generation: re,
              cancelling: at.isPending,
              revision: tn,
              applyingRevision: Ze.isPending,
              onRetryLoad: () => Re.refetch(),
              onRetryCourses: () => {
                ze.refetch();
              },
              onOpenCourses: oa,
              onCourseSelect: Di,
              onSend: (k) => U.mutate(k),
              onRetryMessage: (k) => U.mutate(k.content),
              onAttach: gu,
              onPasteMaterial: Za,
              onCancelGeneration: () => at.mutate(),
              onApplyRevision: (k) => Ze.mutate(k),
              onDismissRevision: () => {
                K(tn?.id || null), ee(null);
              },
              review: bu
            }
          )
        }
      ),
      /* @__PURE__ */ h.jsx(
        "div",
        {
          id: "aiw-plan-panel",
          className: `aiw-region aiw-region--right ${_ === "plan" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-plan-tab",
          children: /* @__PURE__ */ h.jsx(
            dw,
            {
              plan: Xe,
              courses: nt,
              coursesLoading: ze.isLoading,
              coursesError: ze.isError,
              courseSelectionPending: z.isPending,
              courseLocked: !!je?.draft,
              conversationId: d,
              conversationStatus: le,
              generation: re,
              generating: !!(re && ["queued", "generating", "cancel_requested"].includes(re.status)),
              generationAvailable: !!(we.data?.enabled && we.data?.configured),
              generationConfigured: !!we.data?.configured,
              onCourseSelect: Di,
              onRetryCourses: () => {
                ze.refetch();
              },
              onOpenCourses: oa,
              onPatch: xe,
              onGenerate: () => V.mutate()
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ h.jsxs("div", { className: "aiw-sr-only", "aria-live": "polite", "aria-atomic": "true", children: [
      U.isPending ? "The assistant is responding." : "",
      re?.status === "generating" ? `Generation stage: ${re.stage}.` : ""
    ] }),
    w ? /* @__PURE__ */ h.jsx(Gz, { client: n, onClose: () => O(!1), onToast: Z }) : null,
    M && Ft ? /* @__PURE__ */ h.jsx(
      fw,
      {
        client: n,
        courseId: Ft,
        conversationId: d,
        onClose: () => H(!1),
        onToast: Z
      }
    ) : null,
    W && Ft ? /* @__PURE__ */ h.jsx(
      yw,
      {
        client: n,
        courseId: Ft,
        source: W,
        onClose: () => $(null)
      }
    ) : null
  ] });
}
function ww({
  api: n,
  user: i,
  onToast: s,
  onNavigate: r,
  onFallback: c
}) {
  const [m] = I.useState(() => new vb({
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
  })), d = I.useMemo(() => $z(n), [n]);
  return /* @__PURE__ */ h.jsx(bw, { onFallback: c, children: /* @__PURE__ */ h.jsx(yb, { client: m, children: /* @__PURE__ */ h.jsx(
    zw,
    {
      client: d,
      user: i,
      onToast: s,
      onNavigate: r,
      onFallback: c
    }
  ) }) });
}
function jw(n, i) {
  const s = n.closest("#app");
  s?.classList.add("ai-assistant-page-host"), n.classList.add("ai-assistant-root");
  let r = Gg.createRoot(n);
  return r.render(
    /* @__PURE__ */ h.jsx(
      ww,
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
  ww as AiAssistantApp,
  jw as mountAiAssistant
};
//# sourceMappingURL=ai-assistant.js.map
