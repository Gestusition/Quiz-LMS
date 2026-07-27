var Uo = { exports: {} }, Al = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var zm;
function Ug() {
  if (zm) return Al;
  zm = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.fragment");
  function s(r, c, m) {
    var h = null;
    if (m !== void 0 && (h = "" + m), c.key !== void 0 && (h = "" + c.key), "key" in c) {
      m = {};
      for (var p in c)
        p !== "key" && (m[p] = c[p]);
    } else m = c;
    return c = m.ref, {
      $$typeof: n,
      type: r,
      key: h,
      ref: c !== void 0 ? c : null,
      props: m
    };
  }
  return Al.Fragment = i, Al.jsx = s, Al.jsxs = s, Al;
}
var wm;
function Zg() {
  return wm || (wm = 1, Uo.exports = Ug()), Uo.exports;
}
var d = Zg(), Zo = { exports: {} }, Ol = {}, Qo = { exports: {} }, ko = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var jm;
function Qg() {
  return jm || (jm = 1, (function(n) {
    function i(N, K) {
      var se = N.length;
      N.push(K);
      e: for (; 0 < se; ) {
        var ye = se - 1 >>> 1, Ee = N[ye];
        if (0 < c(Ee, K))
          N[ye] = K, N[se] = Ee, se = ye;
        else break e;
      }
    }
    function s(N) {
      return N.length === 0 ? null : N[0];
    }
    function r(N) {
      if (N.length === 0) return null;
      var K = N[0], se = N.pop();
      if (se !== K) {
        N[0] = se;
        e: for (var ye = 0, Ee = N.length, z = Ee >>> 1; ye < z; ) {
          var Z = 2 * (ye + 1) - 1, X = N[Z], F = Z + 1, re = N[F];
          if (0 > c(X, se))
            F < Ee && 0 > c(re, X) ? (N[ye] = re, N[F] = se, ye = F) : (N[ye] = X, N[Z] = se, ye = Z);
          else if (F < Ee && 0 > c(re, se))
            N[ye] = re, N[F] = se, ye = F;
          else break e;
        }
      }
      return K;
    }
    function c(N, K) {
      var se = N.sortIndex - K.sortIndex;
      return se !== 0 ? se : N.id - K.id;
    }
    if (n.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var m = performance;
      n.unstable_now = function() {
        return m.now();
      };
    } else {
      var h = Date, p = h.now();
      n.unstable_now = function() {
        return h.now() - p;
      };
    }
    var y = [], g = [], _ = 1, x = null, w = 3, C = !1, D = !1, B = !1, V = !1, $ = typeof setTimeout == "function" ? setTimeout : null, ie = typeof clearTimeout == "function" ? clearTimeout : null, Y = typeof setImmediate < "u" ? setImmediate : null;
    function ee(N) {
      for (var K = s(g); K !== null; ) {
        if (K.callback === null) r(g);
        else if (K.startTime <= N)
          r(g), K.sortIndex = K.expirationTime, i(y, K);
        else break;
        K = s(g);
      }
    }
    function te(N) {
      if (B = !1, ee(N), !D)
        if (s(y) !== null)
          D = !0, G || (G = !0, Oe());
        else {
          var K = s(g);
          K !== null && nt(te, K.startTime - N);
        }
    }
    var G = !1, A = -1, k = 5, ne = -1;
    function he() {
      return V ? !0 : !(n.unstable_now() - ne < k);
    }
    function ue() {
      if (V = !1, G) {
        var N = n.unstable_now();
        ne = N;
        var K = !0;
        try {
          e: {
            D = !1, B && (B = !1, ie(A), A = -1), C = !0;
            var se = w;
            try {
              t: {
                for (ee(N), x = s(y); x !== null && !(x.expirationTime > N && he()); ) {
                  var ye = x.callback;
                  if (typeof ye == "function") {
                    x.callback = null, w = x.priorityLevel;
                    var Ee = ye(
                      x.expirationTime <= N
                    );
                    if (N = n.unstable_now(), typeof Ee == "function") {
                      x.callback = Ee, ee(N), K = !0;
                      break t;
                    }
                    x === s(y) && r(y), ee(N);
                  } else r(y);
                  x = s(y);
                }
                if (x !== null) K = !0;
                else {
                  var z = s(g);
                  z !== null && nt(
                    te,
                    z.startTime - N
                  ), K = !1;
                }
              }
              break e;
            } finally {
              x = null, w = se, C = !1;
            }
            K = void 0;
          }
        } finally {
          K ? Oe() : G = !1;
        }
      }
    }
    var Oe;
    if (typeof Y == "function")
      Oe = function() {
        Y(ue);
      };
    else if (typeof MessageChannel < "u") {
      var je = new MessageChannel(), Xe = je.port2;
      je.port1.onmessage = ue, Oe = function() {
        Xe.postMessage(null);
      };
    } else
      Oe = function() {
        $(ue, 0);
      };
    function nt(N, K) {
      A = $(function() {
        N(n.unstable_now());
      }, K);
    }
    n.unstable_IdlePriority = 5, n.unstable_ImmediatePriority = 1, n.unstable_LowPriority = 4, n.unstable_NormalPriority = 3, n.unstable_Profiling = null, n.unstable_UserBlockingPriority = 2, n.unstable_cancelCallback = function(N) {
      N.callback = null;
    }, n.unstable_forceFrameRate = function(N) {
      0 > N || 125 < N ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : k = 0 < N ? Math.floor(1e3 / N) : 5;
    }, n.unstable_getCurrentPriorityLevel = function() {
      return w;
    }, n.unstable_next = function(N) {
      switch (w) {
        case 1:
        case 2:
        case 3:
          var K = 3;
          break;
        default:
          K = w;
      }
      var se = w;
      w = K;
      try {
        return N();
      } finally {
        w = se;
      }
    }, n.unstable_requestPaint = function() {
      V = !0;
    }, n.unstable_runWithPriority = function(N, K) {
      switch (N) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          N = 3;
      }
      var se = w;
      w = N;
      try {
        return K();
      } finally {
        w = se;
      }
    }, n.unstable_scheduleCallback = function(N, K, se) {
      var ye = n.unstable_now();
      switch (typeof se == "object" && se !== null ? (se = se.delay, se = typeof se == "number" && 0 < se ? ye + se : ye) : se = ye, N) {
        case 1:
          var Ee = -1;
          break;
        case 2:
          Ee = 250;
          break;
        case 5:
          Ee = 1073741823;
          break;
        case 4:
          Ee = 1e4;
          break;
        default:
          Ee = 5e3;
      }
      return Ee = se + Ee, N = {
        id: _++,
        callback: K,
        priorityLevel: N,
        startTime: se,
        expirationTime: Ee,
        sortIndex: -1
      }, se > ye ? (N.sortIndex = se, i(g, N), s(y) === null && N === s(g) && (B ? (ie(A), A = -1) : B = !0, nt(te, se - ye))) : (N.sortIndex = Ee, i(y, N), D || C || (D = !0, G || (G = !0, Oe()))), N;
    }, n.unstable_shouldYield = he, n.unstable_wrapCallback = function(N) {
      var K = w;
      return function() {
        var se = w;
        w = K;
        try {
          return N.apply(this, arguments);
        } finally {
          w = se;
        }
      };
    };
  })(ko)), ko;
}
var xm;
function kg() {
  return xm || (xm = 1, Qo.exports = Qg()), Qo.exports;
}
var Ho = { exports: {} }, oe = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Em;
function Hg() {
  if (Em) return oe;
  Em = 1;
  var n = Symbol.for("react.transitional.element"), i = Symbol.for("react.portal"), s = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), c = Symbol.for("react.profiler"), m = Symbol.for("react.consumer"), h = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), _ = Symbol.for("react.lazy"), x = Symbol.for("react.activity"), w = Symbol.iterator;
  function C(z) {
    return z === null || typeof z != "object" ? null : (z = w && z[w] || z["@@iterator"], typeof z == "function" ? z : null);
  }
  var D = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, B = Object.assign, V = {};
  function $(z, Z, X) {
    this.props = z, this.context = Z, this.refs = V, this.updater = X || D;
  }
  $.prototype.isReactComponent = {}, $.prototype.setState = function(z, Z) {
    if (typeof z != "object" && typeof z != "function" && z != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, z, Z, "setState");
  }, $.prototype.forceUpdate = function(z) {
    this.updater.enqueueForceUpdate(this, z, "forceUpdate");
  };
  function ie() {
  }
  ie.prototype = $.prototype;
  function Y(z, Z, X) {
    this.props = z, this.context = Z, this.refs = V, this.updater = X || D;
  }
  var ee = Y.prototype = new ie();
  ee.constructor = Y, B(ee, $.prototype), ee.isPureReactComponent = !0;
  var te = Array.isArray;
  function G() {
  }
  var A = { H: null, A: null, T: null, S: null }, k = Object.prototype.hasOwnProperty;
  function ne(z, Z, X) {
    var F = X.ref;
    return {
      $$typeof: n,
      type: z,
      key: Z,
      ref: F !== void 0 ? F : null,
      props: X
    };
  }
  function he(z, Z) {
    return ne(z.type, Z, z.props);
  }
  function ue(z) {
    return typeof z == "object" && z !== null && z.$$typeof === n;
  }
  function Oe(z) {
    var Z = { "=": "=0", ":": "=2" };
    return "$" + z.replace(/[=:]/g, function(X) {
      return Z[X];
    });
  }
  var je = /\/+/g;
  function Xe(z, Z) {
    return typeof z == "object" && z !== null && z.key != null ? Oe("" + z.key) : Z.toString(36);
  }
  function nt(z) {
    switch (z.status) {
      case "fulfilled":
        return z.value;
      case "rejected":
        throw z.reason;
      default:
        switch (typeof z.status == "string" ? z.then(G, G) : (z.status = "pending", z.then(
          function(Z) {
            z.status === "pending" && (z.status = "fulfilled", z.value = Z);
          },
          function(Z) {
            z.status === "pending" && (z.status = "rejected", z.reason = Z);
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
  function N(z, Z, X, F, re) {
    var fe = typeof z;
    (fe === "undefined" || fe === "boolean") && (z = null);
    var me = !1;
    if (z === null) me = !0;
    else
      switch (fe) {
        case "bigint":
        case "string":
        case "number":
          me = !0;
          break;
        case "object":
          switch (z.$$typeof) {
            case n:
            case i:
              me = !0;
              break;
            case _:
              return me = z._init, N(
                me(z._payload),
                Z,
                X,
                F,
                re
              );
          }
      }
    if (me)
      return re = re(z), me = F === "" ? "." + Xe(z, 0) : F, te(re) ? (X = "", me != null && (X = me.replace(je, "$&/") + "/"), N(re, Z, X, "", function(Dn) {
        return Dn;
      })) : re != null && (ue(re) && (re = he(
        re,
        X + (re.key == null || z && z.key === re.key ? "" : ("" + re.key).replace(
          je,
          "$&/"
        ) + "/") + me
      )), Z.push(re)), 1;
    me = 0;
    var at = F === "" ? "." : F + ":";
    if (te(z))
      for (var Ze = 0; Ze < z.length; Ze++)
        F = z[Ze], fe = at + Xe(F, Ze), me += N(
          F,
          Z,
          X,
          fe,
          re
        );
    else if (Ze = C(z), typeof Ze == "function")
      for (z = Ze.call(z), Ze = 0; !(F = z.next()).done; )
        F = F.value, fe = at + Xe(F, Ze++), me += N(
          F,
          Z,
          X,
          fe,
          re
        );
    else if (fe === "object") {
      if (typeof z.then == "function")
        return N(
          nt(z),
          Z,
          X,
          F,
          re
        );
      throw Z = String(z), Error(
        "Objects are not valid as a React child (found: " + (Z === "[object Object]" ? "object with keys {" + Object.keys(z).join(", ") + "}" : Z) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return me;
  }
  function K(z, Z, X) {
    if (z == null) return z;
    var F = [], re = 0;
    return N(z, F, "", "", function(fe) {
      return Z.call(X, fe, re++);
    }), F;
  }
  function se(z) {
    if (z._status === -1) {
      var Z = z._result;
      Z = Z(), Z.then(
        function(X) {
          (z._status === 0 || z._status === -1) && (z._status = 1, z._result = X);
        },
        function(X) {
          (z._status === 0 || z._status === -1) && (z._status = 2, z._result = X);
        }
      ), z._status === -1 && (z._status = 0, z._result = Z);
    }
    if (z._status === 1) return z._result.default;
    throw z._result;
  }
  var ye = typeof reportError == "function" ? reportError : function(z) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var Z = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof z == "object" && z !== null && typeof z.message == "string" ? String(z.message) : String(z),
        error: z
      });
      if (!window.dispatchEvent(Z)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", z);
      return;
    }
    console.error(z);
  }, Ee = {
    map: K,
    forEach: function(z, Z, X) {
      K(
        z,
        function() {
          Z.apply(this, arguments);
        },
        X
      );
    },
    count: function(z) {
      var Z = 0;
      return K(z, function() {
        Z++;
      }), Z;
    },
    toArray: function(z) {
      return K(z, function(Z) {
        return Z;
      }) || [];
    },
    only: function(z) {
      if (!ue(z))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return z;
    }
  };
  return oe.Activity = x, oe.Children = Ee, oe.Component = $, oe.Fragment = s, oe.Profiler = c, oe.PureComponent = Y, oe.StrictMode = r, oe.Suspense = y, oe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = A, oe.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(z) {
      return A.H.useMemoCache(z);
    }
  }, oe.cache = function(z) {
    return function() {
      return z.apply(null, arguments);
    };
  }, oe.cacheSignal = function() {
    return null;
  }, oe.cloneElement = function(z, Z, X) {
    if (z == null)
      throw Error(
        "The argument must be a React element, but you passed " + z + "."
      );
    var F = B({}, z.props), re = z.key;
    if (Z != null)
      for (fe in Z.key !== void 0 && (re = "" + Z.key), Z)
        !k.call(Z, fe) || fe === "key" || fe === "__self" || fe === "__source" || fe === "ref" && Z.ref === void 0 || (F[fe] = Z[fe]);
    var fe = arguments.length - 2;
    if (fe === 1) F.children = X;
    else if (1 < fe) {
      for (var me = Array(fe), at = 0; at < fe; at++)
        me[at] = arguments[at + 2];
      F.children = me;
    }
    return ne(z.type, re, F);
  }, oe.createContext = function(z) {
    return z = {
      $$typeof: h,
      _currentValue: z,
      _currentValue2: z,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, z.Provider = z, z.Consumer = {
      $$typeof: m,
      _context: z
    }, z;
  }, oe.createElement = function(z, Z, X) {
    var F, re = {}, fe = null;
    if (Z != null)
      for (F in Z.key !== void 0 && (fe = "" + Z.key), Z)
        k.call(Z, F) && F !== "key" && F !== "__self" && F !== "__source" && (re[F] = Z[F]);
    var me = arguments.length - 2;
    if (me === 1) re.children = X;
    else if (1 < me) {
      for (var at = Array(me), Ze = 0; Ze < me; Ze++)
        at[Ze] = arguments[Ze + 2];
      re.children = at;
    }
    if (z && z.defaultProps)
      for (F in me = z.defaultProps, me)
        re[F] === void 0 && (re[F] = me[F]);
    return ne(z, fe, re);
  }, oe.createRef = function() {
    return { current: null };
  }, oe.forwardRef = function(z) {
    return { $$typeof: p, render: z };
  }, oe.isValidElement = ue, oe.lazy = function(z) {
    return {
      $$typeof: _,
      _payload: { _status: -1, _result: z },
      _init: se
    };
  }, oe.memo = function(z, Z) {
    return {
      $$typeof: g,
      type: z,
      compare: Z === void 0 ? null : Z
    };
  }, oe.startTransition = function(z) {
    var Z = A.T, X = {};
    A.T = X;
    try {
      var F = z(), re = A.S;
      re !== null && re(X, F), typeof F == "object" && F !== null && typeof F.then == "function" && F.then(G, ye);
    } catch (fe) {
      ye(fe);
    } finally {
      Z !== null && X.types !== null && (Z.types = X.types), A.T = Z;
    }
  }, oe.unstable_useCacheRefresh = function() {
    return A.H.useCacheRefresh();
  }, oe.use = function(z) {
    return A.H.use(z);
  }, oe.useActionState = function(z, Z, X) {
    return A.H.useActionState(z, Z, X);
  }, oe.useCallback = function(z, Z) {
    return A.H.useCallback(z, Z);
  }, oe.useContext = function(z) {
    return A.H.useContext(z);
  }, oe.useDebugValue = function() {
  }, oe.useDeferredValue = function(z, Z) {
    return A.H.useDeferredValue(z, Z);
  }, oe.useEffect = function(z, Z) {
    return A.H.useEffect(z, Z);
  }, oe.useEffectEvent = function(z) {
    return A.H.useEffectEvent(z);
  }, oe.useId = function() {
    return A.H.useId();
  }, oe.useImperativeHandle = function(z, Z, X) {
    return A.H.useImperativeHandle(z, Z, X);
  }, oe.useInsertionEffect = function(z, Z) {
    return A.H.useInsertionEffect(z, Z);
  }, oe.useLayoutEffect = function(z, Z) {
    return A.H.useLayoutEffect(z, Z);
  }, oe.useMemo = function(z, Z) {
    return A.H.useMemo(z, Z);
  }, oe.useOptimistic = function(z, Z) {
    return A.H.useOptimistic(z, Z);
  }, oe.useReducer = function(z, Z, X) {
    return A.H.useReducer(z, Z, X);
  }, oe.useRef = function(z) {
    return A.H.useRef(z);
  }, oe.useState = function(z) {
    return A.H.useState(z);
  }, oe.useSyncExternalStore = function(z, Z, X) {
    return A.H.useSyncExternalStore(
      z,
      Z,
      X
    );
  }, oe.useTransition = function() {
    return A.H.useTransition();
  }, oe.version = "19.2.7", oe;
}
var Tm;
function sc() {
  return Tm || (Tm = 1, Ho.exports = Hg()), Ho.exports;
}
var Bo = { exports: {} }, dt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Am;
function Bg() {
  if (Am) return dt;
  Am = 1;
  var n = sc();
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
    var x = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: c,
      key: x == null ? null : "" + x,
      children: y,
      containerInfo: g,
      implementation: _
    };
  }
  var h = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function p(y, g) {
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
      var _ = g.as, x = p(_, g.crossOrigin), w = typeof g.integrity == "string" ? g.integrity : void 0, C = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      _ === "style" ? r.d.S(
        y,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: x,
          integrity: w,
          fetchPriority: C
        }
      ) : _ === "script" && r.d.X(y, {
        crossOrigin: x,
        integrity: w,
        fetchPriority: C,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, dt.preinitModule = function(y, g) {
    if (typeof y == "string")
      if (typeof g == "object" && g !== null) {
        if (g.as == null || g.as === "script") {
          var _ = p(
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
      var _ = g.as, x = p(_, g.crossOrigin);
      r.d.L(y, _, {
        crossOrigin: x,
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
        var _ = p(g.as, g.crossOrigin);
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
var Om;
function $g() {
  if (Om) return Bo.exports;
  Om = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Bo.exports = Bg(), Bo.exports;
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
var Cm;
function Lg() {
  if (Cm) return Ol;
  Cm = 1;
  var n = kg(), i = sc(), s = $g();
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
  function p(e) {
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
        for (var f = !1, v = u.child; v; ) {
          if (v === a) {
            f = !0, a = u, l = o;
            break;
          }
          if (v === l) {
            f = !0, l = u, a = o;
            break;
          }
          v = v.sibling;
        }
        if (!f) {
          for (v = o.child; v; ) {
            if (v === a) {
              f = !0, a = o, l = u;
              break;
            }
            if (v === l) {
              f = !0, l = o, a = u;
              break;
            }
            v = v.sibling;
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
  var x = Object.assign, w = Symbol.for("react.element"), C = Symbol.for("react.transitional.element"), D = Symbol.for("react.portal"), B = Symbol.for("react.fragment"), V = Symbol.for("react.strict_mode"), $ = Symbol.for("react.profiler"), ie = Symbol.for("react.consumer"), Y = Symbol.for("react.context"), ee = Symbol.for("react.forward_ref"), te = Symbol.for("react.suspense"), G = Symbol.for("react.suspense_list"), A = Symbol.for("react.memo"), k = Symbol.for("react.lazy"), ne = Symbol.for("react.activity"), he = Symbol.for("react.memo_cache_sentinel"), ue = Symbol.iterator;
  function Oe(e) {
    return e === null || typeof e != "object" ? null : (e = ue && e[ue] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var je = Symbol.for("react.client.reference");
  function Xe(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === je ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case B:
        return "Fragment";
      case $:
        return "Profiler";
      case V:
        return "StrictMode";
      case te:
        return "Suspense";
      case G:
        return "SuspenseList";
      case ne:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case D:
          return "Portal";
        case Y:
          return e.displayName || "Context";
        case ie:
          return (e._context.displayName || "Context") + ".Consumer";
        case ee:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case A:
          return t = e.displayName || null, t !== null ? t : Xe(e.type) || "Memo";
        case k:
          t = e._payload, e = e._init;
          try {
            return Xe(e(t));
          } catch {
          }
      }
    return null;
  }
  var nt = Array.isArray, N = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, K = s.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, se = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, ye = [], Ee = -1;
  function z(e) {
    return { current: e };
  }
  function Z(e) {
    0 > Ee || (e.current = ye[Ee], ye[Ee] = null, Ee--);
  }
  function X(e, t) {
    Ee++, ye[Ee] = e.current, e.current = t;
  }
  var F = z(null), re = z(null), fe = z(null), me = z(null);
  function at(e, t) {
    switch (X(fe, t), X(re, e), X(F, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Yh(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Yh(t), e = Kh(t, e);
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
    Z(F), X(F, e);
  }
  function Ze() {
    Z(F), Z(re), Z(fe);
  }
  function Dn(e) {
    e.memoizedState !== null && X(me, e);
    var t = F.current, a = Kh(t, e.type);
    t !== a && (X(re, e), X(F, a));
  }
  function fa(e) {
    re.current === e && (Z(F), Z(re)), me.current === e && (Z(me), jl._currentValue = se);
  }
  var Di, Ri;
  function nn(e) {
    if (Di === void 0)
      try {
        throw Error();
      } catch (a) {
        var t = a.stack.trim().match(/\n( *(at )?)/);
        Di = t && t[1] || "", Ri = -1 < a.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < a.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Di + e + Ri;
  }
  var Za = !1;
  function It(e, t) {
    if (!e || Za) return "";
    Za = !0;
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
                } catch (M) {
                  var O = M;
                }
                Reflect.construct(e, [], Q);
              } else {
                try {
                  Q.call();
                } catch (M) {
                  O = M;
                }
                e.call(Q.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (M) {
                O = M;
              }
              (Q = e()) && typeof Q.catch == "function" && Q.catch(function() {
              });
            }
          } catch (M) {
            if (M && O && typeof M.stack == "string")
              return [M.stack, O.stack];
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
      var o = l.DetermineComponentFrameRoot(), f = o[0], v = o[1];
      if (f && v) {
        var b = f.split(`
`), T = v.split(`
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
                  var R = `
` + b[l].replace(" at new ", " at ");
                  return e.displayName && R.includes("<anonymous>") && (R = R.replace("<anonymous>", e.displayName)), R;
                }
              while (1 <= l && 0 <= u);
            break;
          }
      }
    } finally {
      Za = !1, Error.prepareStackTrace = a;
    }
    return (a = e ? e.displayName || e.name : "") ? nn(a) : "";
  }
  function bu(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return nn(e.type);
      case 16:
        return nn("Lazy");
      case 13:
        return e.child !== t && t !== null ? nn("Suspense Fallback") : nn("Suspense");
      case 19:
        return nn("SuspenseList");
      case 0:
      case 15:
        return It(e.type, !1);
      case 11:
        return It(e.type.render, !1);
      case 1:
        return It(e.type, !0);
      case 31:
        return nn("Activity");
      default:
        return "";
    }
  }
  function Qa(e) {
    try {
      var t = "", a = null;
      do
        t += bu(e, a), a = e, e = e.return;
      while (e);
      return t;
    } catch (l) {
      return `
Error generating stack: ` + l.message + `
` + l.stack;
    }
  }
  var qi = Object.prototype.hasOwnProperty, da = n.unstable_scheduleCallback, ka = n.unstable_cancelCallback, _u = n.unstable_shouldYield, Su = n.unstable_requestPaint, ht = n.unstable_now, H = n.unstable_getCurrentPriorityLevel, ge = n.unstable_ImmediatePriority, mt = n.unstable_UserBlockingPriority, Rn = n.unstable_NormalPriority, zu = n.unstable_LowPriority, jc = n.unstable_IdlePriority, gv = n.log, bv = n.unstable_setDisableYieldValue, Ui = null, Et = null;
  function qn(e) {
    if (typeof gv == "function" && bv(e), Et && typeof Et.setStrictMode == "function")
      try {
        Et.setStrictMode(Ui, e);
      } catch {
      }
  }
  var Tt = Math.clz32 ? Math.clz32 : zv, _v = Math.log, Sv = Math.LN2;
  function zv(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (_v(e) / Sv | 0) | 0;
  }
  var Ul = 256, Zl = 262144, Ql = 4194304;
  function ha(e) {
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
  function kl(e, t, a) {
    var l = e.pendingLanes;
    if (l === 0) return 0;
    var u = 0, o = e.suspendedLanes, f = e.pingedLanes;
    e = e.warmLanes;
    var v = l & 134217727;
    return v !== 0 ? (l = v & ~o, l !== 0 ? u = ha(l) : (f &= v, f !== 0 ? u = ha(f) : a || (a = v & ~e, a !== 0 && (u = ha(a))))) : (v = l & ~o, v !== 0 ? u = ha(v) : f !== 0 ? u = ha(f) : a || (a = l & ~e, a !== 0 && (u = ha(a)))), u === 0 ? 0 : t !== 0 && t !== u && (t & o) === 0 && (o = u & -u, a = t & -t, o >= a || o === 32 && (a & 4194048) !== 0) ? t : u;
  }
  function Zi(e, t) {
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
  function xc() {
    var e = Ql;
    return Ql <<= 1, (Ql & 62914560) === 0 && (Ql = 4194304), e;
  }
  function wu(e) {
    for (var t = [], a = 0; 31 > a; a++) t.push(e);
    return t;
  }
  function Qi(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function jv(e, t, a, l, u, o) {
    var f = e.pendingLanes;
    e.pendingLanes = a, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= a, e.entangledLanes &= a, e.errorRecoveryDisabledLanes &= a, e.shellSuspendCounter = 0;
    var v = e.entanglements, b = e.expirationTimes, T = e.hiddenUpdates;
    for (a = f & ~a; 0 < a; ) {
      var R = 31 - Tt(a), Q = 1 << R;
      v[R] = 0, b[R] = -1;
      var O = T[R];
      if (O !== null)
        for (T[R] = null, R = 0; R < O.length; R++) {
          var M = O[R];
          M !== null && (M.lane &= -536870913);
        }
      a &= ~Q;
    }
    l !== 0 && Ec(e, l, 0), o !== 0 && u === 0 && e.tag !== 0 && (e.suspendedLanes |= o & ~(f & ~t));
  }
  function Ec(e, t, a) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var l = 31 - Tt(t);
    e.entangledLanes |= t, e.entanglements[l] = e.entanglements[l] | 1073741824 | a & 261930;
  }
  function Tc(e, t) {
    var a = e.entangledLanes |= t;
    for (e = e.entanglements; a; ) {
      var l = 31 - Tt(a), u = 1 << l;
      u & t | e[l] & t && (e[l] |= t), a &= ~u;
    }
  }
  function Ac(e, t) {
    var a = t & -t;
    return a = (a & 42) !== 0 ? 1 : ju(a), (a & (e.suspendedLanes | t)) !== 0 ? 0 : a;
  }
  function ju(e) {
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
  function xu(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Oc() {
    var e = K.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : pm(e.type));
  }
  function Cc(e, t) {
    var a = K.p;
    try {
      return K.p = e, t();
    } finally {
      K.p = a;
    }
  }
  var Un = Math.random().toString(36).slice(2), st = "__reactFiber$" + Un, gt = "__reactProps$" + Un, Ha = "__reactContainer$" + Un, Eu = "__reactEvents$" + Un, xv = "__reactListeners$" + Un, Ev = "__reactHandles$" + Un, Nc = "__reactResources$" + Un, ki = "__reactMarker$" + Un;
  function Tu(e) {
    delete e[st], delete e[gt], delete e[Eu], delete e[xv], delete e[Ev];
  }
  function Ba(e) {
    var t = e[st];
    if (t) return t;
    for (var a = e.parentNode; a; ) {
      if (t = a[Ha] || a[st]) {
        if (a = t.alternate, t.child !== null || a !== null && a.child !== null)
          for (e = Ph(e); e !== null; ) {
            if (a = e[st]) return a;
            e = Ph(e);
          }
        return t;
      }
      e = a, a = e.parentNode;
    }
    return null;
  }
  function $a(e) {
    if (e = e[st] || e[Ha]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function Hi(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(r(33));
  }
  function La(e) {
    var t = e[Nc];
    return t || (t = e[Nc] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function it(e) {
    e[ki] = !0;
  }
  var Mc = /* @__PURE__ */ new Set(), Dc = {};
  function ma(e, t) {
    Ga(e, t), Ga(e + "Capture", t);
  }
  function Ga(e, t) {
    for (Dc[e] = t, e = 0; e < t.length; e++)
      Mc.add(t[e]);
  }
  var Tv = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Rc = {}, qc = {};
  function Av(e) {
    return qi.call(qc, e) ? !0 : qi.call(Rc, e) ? !1 : Tv.test(e) ? qc[e] = !0 : (Rc[e] = !0, !1);
  }
  function Hl(e, t, a) {
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
  function Bl(e, t, a) {
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
  function on(e, t, a, l) {
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
  function Zt(e) {
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
  function Uc(e) {
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
  function Au(e) {
    if (!e._valueTracker) {
      var t = Uc(e) ? "checked" : "value";
      e._valueTracker = Ov(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function Zc(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var a = t.getValue(), l = "";
    return e && (l = Uc(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== a ? (t.setValue(e), !0) : !1;
  }
  function $l(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var Cv = /[\n"\\]/g;
  function Qt(e) {
    return e.replace(
      Cv,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function Ou(e, t, a, l, u, o, f, v) {
    e.name = "", f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? e.type = f : e.removeAttribute("type"), t != null ? f === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Zt(t)) : e.value !== "" + Zt(t) && (e.value = "" + Zt(t)) : f !== "submit" && f !== "reset" || e.removeAttribute("value"), t != null ? Cu(e, f, Zt(t)) : a != null ? Cu(e, f, Zt(a)) : l != null && e.removeAttribute("value"), u == null && o != null && (e.defaultChecked = !!o), u != null && (e.checked = u && typeof u != "function" && typeof u != "symbol"), v != null && typeof v != "function" && typeof v != "symbol" && typeof v != "boolean" ? e.name = "" + Zt(v) : e.removeAttribute("name");
  }
  function Qc(e, t, a, l, u, o, f, v) {
    if (o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.type = o), t != null || a != null) {
      if (!(o !== "submit" && o !== "reset" || t != null)) {
        Au(e);
        return;
      }
      a = a != null ? "" + Zt(a) : "", t = t != null ? "" + Zt(t) : a, v || t === e.value || (e.value = t), e.defaultValue = t;
    }
    l = l ?? u, l = typeof l != "function" && typeof l != "symbol" && !!l, e.checked = v ? e.checked : !!l, e.defaultChecked = !!l, f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" && (e.name = f), Au(e);
  }
  function Cu(e, t, a) {
    t === "number" && $l(e.ownerDocument) === e || e.defaultValue === "" + a || (e.defaultValue = "" + a);
  }
  function Ya(e, t, a, l) {
    if (e = e.options, t) {
      t = {};
      for (var u = 0; u < a.length; u++)
        t["$" + a[u]] = !0;
      for (a = 0; a < e.length; a++)
        u = t.hasOwnProperty("$" + e[a].value), e[a].selected !== u && (e[a].selected = u), u && l && (e[a].defaultSelected = !0);
    } else {
      for (a = "" + Zt(a), t = null, u = 0; u < e.length; u++) {
        if (e[u].value === a) {
          e[u].selected = !0, l && (e[u].defaultSelected = !0);
          return;
        }
        t !== null || e[u].disabled || (t = e[u]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function kc(e, t, a) {
    if (t != null && (t = "" + Zt(t), t !== e.value && (e.value = t), a == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = a != null ? "" + Zt(a) : "";
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
    a = Zt(t), e.defaultValue = a, l = e.textContent, l === a && l !== "" && l !== null && (e.value = l), Au(e);
  }
  function Ka(e, t) {
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
  function Bc(e, t, a) {
    var l = t.indexOf("--") === 0;
    a == null || typeof a == "boolean" || a === "" ? l ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : l ? e.setProperty(t, a) : typeof a != "number" || a === 0 || Nv.has(t) ? t === "float" ? e.cssFloat = a : e[t] = ("" + a).trim() : e[t] = a + "px";
  }
  function $c(e, t, a) {
    if (t != null && typeof t != "object")
      throw Error(r(62));
    if (e = e.style, a != null) {
      for (var l in a)
        !a.hasOwnProperty(l) || t != null && t.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
      for (var u in t)
        l = t[u], t.hasOwnProperty(u) && a[u] !== l && Bc(e, u, l);
    } else
      for (var o in t)
        t.hasOwnProperty(o) && Bc(e, o, t[o]);
  }
  function Nu(e) {
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
  function Ll(e) {
    return Dv.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function cn() {
  }
  var Mu = null;
  function Du(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var Xa = null, Va = null;
  function Lc(e) {
    var t = $a(e);
    if (t && (e = t.stateNode)) {
      var a = e[gt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (Ou(
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
              'input[name="' + Qt(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < a.length; t++) {
              var l = a[t];
              if (l !== e && l.form === e.form) {
                var u = l[gt] || null;
                if (!u) throw Error(r(90));
                Ou(
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
              l = a[t], l.form === e.form && Zc(l);
          }
          break e;
        case "textarea":
          kc(e, a.value, a.defaultValue);
          break e;
        case "select":
          t = a.value, t != null && Ya(e, !!a.multiple, t, !1);
      }
    }
  }
  var Ru = !1;
  function Gc(e, t, a) {
    if (Ru) return e(t, a);
    Ru = !0;
    try {
      var l = e(t);
      return l;
    } finally {
      if (Ru = !1, (Xa !== null || Va !== null) && (Cs(), Xa && (t = Xa, e = Va, Va = Xa = null, Lc(t), e)))
        for (t = 0; t < e.length; t++) Lc(e[t]);
    }
  }
  function Bi(e, t) {
    var a = e.stateNode;
    if (a === null) return null;
    var l = a[gt] || null;
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
  var fn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), qu = !1;
  if (fn)
    try {
      var $i = {};
      Object.defineProperty($i, "passive", {
        get: function() {
          qu = !0;
        }
      }), window.addEventListener("test", $i, $i), window.removeEventListener("test", $i, $i);
    } catch {
      qu = !1;
    }
  var Zn = null, Uu = null, Gl = null;
  function Yc() {
    if (Gl) return Gl;
    var e, t = Uu, a = t.length, l, u = "value" in Zn ? Zn.value : Zn.textContent, o = u.length;
    for (e = 0; e < a && t[e] === u[e]; e++) ;
    var f = a - e;
    for (l = 1; l <= f && t[a - l] === u[o - l]; l++) ;
    return Gl = u.slice(e, 1 < l ? 1 - l : void 0);
  }
  function Yl(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Kl() {
    return !0;
  }
  function Kc() {
    return !1;
  }
  function bt(e) {
    function t(a, l, u, o, f) {
      this._reactName = a, this._targetInst = u, this.type = l, this.nativeEvent = o, this.target = f, this.currentTarget = null;
      for (var v in e)
        e.hasOwnProperty(v) && (a = e[v], this[v] = a ? a(o) : o[v]);
      return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? Kl : Kc, this.isPropagationStopped = Kc, this;
    }
    return x(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var a = this.nativeEvent;
        a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = Kl);
      },
      stopPropagation: function() {
        var a = this.nativeEvent;
        a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = Kl);
      },
      persist: function() {
      },
      isPersistent: Kl
    }), t;
  }
  var pa = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Xl = bt(pa), Li = x({}, pa, { view: 0, detail: 0 }), Rv = bt(Li), Zu, Qu, Gi, Vl = x({}, Li, {
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
    getModifierState: Hu,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== Gi && (Gi && e.type === "mousemove" ? (Zu = e.screenX - Gi.screenX, Qu = e.screenY - Gi.screenY) : Qu = Zu = 0, Gi = e), Zu);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : Qu;
    }
  }), Xc = bt(Vl), qv = x({}, Vl, { dataTransfer: 0 }), Uv = bt(qv), Zv = x({}, Li, { relatedTarget: 0 }), ku = bt(Zv), Qv = x({}, pa, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), kv = bt(Qv), Hv = x({}, pa, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Bv = bt(Hv), $v = x({}, pa, { data: 0 }), Vc = bt($v), Lv = {
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
  function Hu() {
    return Kv;
  }
  var Xv = x({}, Li, {
    key: function(e) {
      if (e.key) {
        var t = Lv[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = Yl(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Gv[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Hu,
    charCode: function(e) {
      return e.type === "keypress" ? Yl(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? Yl(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), Vv = bt(Xv), Jv = x({}, Vl, {
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
  }), Jc = bt(Jv), Fv = x({}, Li, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Hu
  }), Iv = bt(Fv), Wv = x({}, pa, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Pv = bt(Wv), ey = x({}, Vl, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), ty = bt(ey), ny = x({}, pa, {
    newState: 0,
    oldState: 0
  }), ay = bt(ny), iy = [9, 13, 27, 32], Bu = fn && "CompositionEvent" in window, Yi = null;
  fn && "documentMode" in document && (Yi = document.documentMode);
  var ly = fn && "TextEvent" in window && !Yi, Fc = fn && (!Bu || Yi && 8 < Yi && 11 >= Yi), Ic = " ", Wc = !1;
  function Pc(e, t) {
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
  function ef(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Ja = !1;
  function sy(e, t) {
    switch (e) {
      case "compositionend":
        return ef(t);
      case "keypress":
        return t.which !== 32 ? null : (Wc = !0, Ic);
      case "textInput":
        return e = t.data, e === Ic && Wc ? null : e;
      default:
        return null;
    }
  }
  function uy(e, t) {
    if (Ja)
      return e === "compositionend" || !Bu && Pc(e, t) ? (e = Yc(), Gl = Uu = Zn = null, Ja = !1, e) : null;
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
        return Fc && t.locale !== "ko" ? null : t.data;
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
  function tf(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!ry[e.type] : t === "textarea";
  }
  function nf(e, t, a, l) {
    Xa ? Va ? Va.push(l) : Va = [l] : Xa = l, t = Zs(t, "onChange"), 0 < t.length && (a = new Xl(
      "onChange",
      "change",
      null,
      a,
      l
    ), e.push({ event: a, listeners: t }));
  }
  var Ki = null, Xi = null;
  function oy(e) {
    kh(e, 0);
  }
  function Jl(e) {
    var t = Hi(e);
    if (Zc(t)) return e;
  }
  function af(e, t) {
    if (e === "change") return t;
  }
  var lf = !1;
  if (fn) {
    var $u;
    if (fn) {
      var Lu = "oninput" in document;
      if (!Lu) {
        var sf = document.createElement("div");
        sf.setAttribute("oninput", "return;"), Lu = typeof sf.oninput == "function";
      }
      $u = Lu;
    } else $u = !1;
    lf = $u && (!document.documentMode || 9 < document.documentMode);
  }
  function uf() {
    Ki && (Ki.detachEvent("onpropertychange", rf), Xi = Ki = null);
  }
  function rf(e) {
    if (e.propertyName === "value" && Jl(Xi)) {
      var t = [];
      nf(
        t,
        Xi,
        e,
        Du(e)
      ), Gc(oy, t);
    }
  }
  function cy(e, t, a) {
    e === "focusin" ? (uf(), Ki = t, Xi = a, Ki.attachEvent("onpropertychange", rf)) : e === "focusout" && uf();
  }
  function fy(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Jl(Xi);
  }
  function dy(e, t) {
    if (e === "click") return Jl(t);
  }
  function hy(e, t) {
    if (e === "input" || e === "change")
      return Jl(t);
  }
  function my(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var At = typeof Object.is == "function" ? Object.is : my;
  function Vi(e, t) {
    if (At(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var a = Object.keys(e), l = Object.keys(t);
    if (a.length !== l.length) return !1;
    for (l = 0; l < a.length; l++) {
      var u = a[l];
      if (!qi.call(t, u) || !At(e[u], t[u]))
        return !1;
    }
    return !0;
  }
  function of(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function cf(e, t) {
    var a = of(e);
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
      a = of(a);
    }
  }
  function ff(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? ff(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function df(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = $l(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var a = typeof t.contentWindow.location.href == "string";
      } catch {
        a = !1;
      }
      if (a) e = t.contentWindow;
      else break;
      t = $l(e.document);
    }
    return t;
  }
  function Gu(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var py = fn && "documentMode" in document && 11 >= document.documentMode, Fa = null, Yu = null, Ji = null, Ku = !1;
  function hf(e, t, a) {
    var l = a.window === a ? a.document : a.nodeType === 9 ? a : a.ownerDocument;
    Ku || Fa == null || Fa !== $l(l) || (l = Fa, "selectionStart" in l && Gu(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = {
      anchorNode: l.anchorNode,
      anchorOffset: l.anchorOffset,
      focusNode: l.focusNode,
      focusOffset: l.focusOffset
    }), Ji && Vi(Ji, l) || (Ji = l, l = Zs(Yu, "onSelect"), 0 < l.length && (t = new Xl(
      "onSelect",
      "select",
      null,
      t,
      a
    ), e.push({ event: t, listeners: l }), t.target = Fa)));
  }
  function va(e, t) {
    var a = {};
    return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
  }
  var Ia = {
    animationend: va("Animation", "AnimationEnd"),
    animationiteration: va("Animation", "AnimationIteration"),
    animationstart: va("Animation", "AnimationStart"),
    transitionrun: va("Transition", "TransitionRun"),
    transitionstart: va("Transition", "TransitionStart"),
    transitioncancel: va("Transition", "TransitionCancel"),
    transitionend: va("Transition", "TransitionEnd")
  }, Xu = {}, mf = {};
  fn && (mf = document.createElement("div").style, "AnimationEvent" in window || (delete Ia.animationend.animation, delete Ia.animationiteration.animation, delete Ia.animationstart.animation), "TransitionEvent" in window || delete Ia.transitionend.transition);
  function ya(e) {
    if (Xu[e]) return Xu[e];
    if (!Ia[e]) return e;
    var t = Ia[e], a;
    for (a in t)
      if (t.hasOwnProperty(a) && a in mf)
        return Xu[e] = t[a];
    return e;
  }
  var pf = ya("animationend"), vf = ya("animationiteration"), yf = ya("animationstart"), vy = ya("transitionrun"), yy = ya("transitionstart"), gy = ya("transitioncancel"), gf = ya("transitionend"), bf = /* @__PURE__ */ new Map(), Vu = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Vu.push("scrollEnd");
  function Wt(e, t) {
    bf.set(e, t), ma(t, [e]);
  }
  var Fl = typeof reportError == "function" ? reportError : function(e) {
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
  }, kt = [], Wa = 0, Ju = 0;
  function Il() {
    for (var e = Wa, t = Ju = Wa = 0; t < e; ) {
      var a = kt[t];
      kt[t++] = null;
      var l = kt[t];
      kt[t++] = null;
      var u = kt[t];
      kt[t++] = null;
      var o = kt[t];
      if (kt[t++] = null, l !== null && u !== null) {
        var f = l.pending;
        f === null ? u.next = u : (u.next = f.next, f.next = u), l.pending = u;
      }
      o !== 0 && _f(a, u, o);
    }
  }
  function Wl(e, t, a, l) {
    kt[Wa++] = e, kt[Wa++] = t, kt[Wa++] = a, kt[Wa++] = l, Ju |= l, e.lanes |= l, e = e.alternate, e !== null && (e.lanes |= l);
  }
  function Fu(e, t, a, l) {
    return Wl(e, t, a, l), Pl(e);
  }
  function ga(e, t) {
    return Wl(e, null, null, t), Pl(e);
  }
  function _f(e, t, a) {
    e.lanes |= a;
    var l = e.alternate;
    l !== null && (l.lanes |= a);
    for (var u = !1, o = e.return; o !== null; )
      o.childLanes |= a, l = o.alternate, l !== null && (l.childLanes |= a), o.tag === 22 && (e = o.stateNode, e === null || e._visibility & 1 || (u = !0)), e = o, o = o.return;
    return e.tag === 3 ? (o = e.stateNode, u && t !== null && (u = 31 - Tt(a), e = o.hiddenUpdates, l = e[u], l === null ? e[u] = [t] : l.push(t), t.lane = a | 536870912), o) : null;
  }
  function Pl(e) {
    if (50 < yl)
      throw yl = 0, lo = null, Error(r(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var Pa = {};
  function by(e, t, a, l) {
    this.tag = e, this.key = a, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Ot(e, t, a, l) {
    return new by(e, t, a, l);
  }
  function Iu(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function dn(e, t) {
    var a = e.alternate;
    return a === null ? (a = Ot(
      e.tag,
      t,
      e.key,
      e.mode
    ), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = 0, a.subtreeFlags = 0, a.deletions = null), a.flags = e.flags & 65011712, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue, t = e.dependencies, a.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.refCleanup = e.refCleanup, a;
  }
  function Sf(e, t) {
    e.flags &= 65011714;
    var a = e.alternate;
    return a === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type, t = a.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function es(e, t, a, l, u, o) {
    var f = 0;
    if (l = e, typeof e == "function") Iu(e) && (f = 1);
    else if (typeof e == "string")
      f = jg(
        e,
        a,
        F.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case ne:
          return e = Ot(31, a, t, u), e.elementType = ne, e.lanes = o, e;
        case B:
          return ba(a.children, u, o, t);
        case V:
          f = 8, u |= 24;
          break;
        case $:
          return e = Ot(12, a, t, u | 2), e.elementType = $, e.lanes = o, e;
        case te:
          return e = Ot(13, a, t, u), e.elementType = te, e.lanes = o, e;
        case G:
          return e = Ot(19, a, t, u), e.elementType = G, e.lanes = o, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case Y:
                f = 10;
                break e;
              case ie:
                f = 9;
                break e;
              case ee:
                f = 11;
                break e;
              case A:
                f = 14;
                break e;
              case k:
                f = 16, l = null;
                break e;
            }
          f = 29, a = Error(
            r(130, e === null ? "null" : typeof e, "")
          ), l = null;
      }
    return t = Ot(f, a, t, u), t.elementType = e, t.type = l, t.lanes = o, t;
  }
  function ba(e, t, a, l) {
    return e = Ot(7, e, l, t), e.lanes = a, e;
  }
  function Wu(e, t, a) {
    return e = Ot(6, e, null, t), e.lanes = a, e;
  }
  function zf(e) {
    var t = Ot(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function Pu(e, t, a) {
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
  var wf = /* @__PURE__ */ new WeakMap();
  function Ht(e, t) {
    if (typeof e == "object" && e !== null) {
      var a = wf.get(e);
      return a !== void 0 ? a : (t = {
        value: e,
        source: t,
        stack: Qa(t)
      }, wf.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: Qa(t)
    };
  }
  var ei = [], ti = 0, ts = null, Fi = 0, Bt = [], $t = 0, Qn = null, an = 1, ln = "";
  function hn(e, t) {
    ei[ti++] = Fi, ei[ti++] = ts, ts = e, Fi = t;
  }
  function jf(e, t, a) {
    Bt[$t++] = an, Bt[$t++] = ln, Bt[$t++] = Qn, Qn = e;
    var l = an;
    e = ln;
    var u = 32 - Tt(l) - 1;
    l &= ~(1 << u), a += 1;
    var o = 32 - Tt(t) + u;
    if (30 < o) {
      var f = u - u % 5;
      o = (l & (1 << f) - 1).toString(32), l >>= f, u -= f, an = 1 << 32 - Tt(t) + u | a << u | l, ln = o + e;
    } else
      an = 1 << o | a << u | l, ln = e;
  }
  function er(e) {
    e.return !== null && (hn(e, 1), jf(e, 1, 0));
  }
  function tr(e) {
    for (; e === ts; )
      ts = ei[--ti], ei[ti] = null, Fi = ei[--ti], ei[ti] = null;
    for (; e === Qn; )
      Qn = Bt[--$t], Bt[$t] = null, ln = Bt[--$t], Bt[$t] = null, an = Bt[--$t], Bt[$t] = null;
  }
  function xf(e, t) {
    Bt[$t++] = an, Bt[$t++] = ln, Bt[$t++] = Qn, an = t.id, ln = t.overflow, Qn = e;
  }
  var ut = null, qe = null, Se = !1, kn = null, Lt = !1, nr = Error(r(519));
  function Hn(e) {
    var t = Error(
      r(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Ii(Ht(t, e)), nr;
  }
  function Ef(e) {
    var t = e.stateNode, a = e.type, l = e.memoizedProps;
    switch (t[st] = e, t[gt] = l, a) {
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
        for (a = 0; a < bl.length; a++)
          ve(bl[a], t);
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
        ve("invalid", t), Qc(
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
        ve("invalid", t), Hc(t, l.value, l.defaultValue, l.children);
    }
    a = l.children, typeof a != "string" && typeof a != "number" && typeof a != "bigint" || t.textContent === "" + a || l.suppressHydrationWarning === !0 || Lh(t.textContent, a) ? (l.popover != null && (ve("beforetoggle", t), ve("toggle", t)), l.onScroll != null && ve("scroll", t), l.onScrollEnd != null && ve("scrollend", t), l.onClick != null && (t.onclick = cn), t = !0) : t = !1, t || Hn(e, !0);
  }
  function Tf(e) {
    for (ut = e.return; ut; )
      switch (ut.tag) {
        case 5:
        case 31:
        case 13:
          Lt = !1;
          return;
        case 27:
        case 3:
          Lt = !0;
          return;
        default:
          ut = ut.return;
      }
  }
  function ni(e) {
    if (e !== ut) return !1;
    if (!Se) return Tf(e), Se = !0, !1;
    var t = e.tag, a;
    if ((a = t !== 3 && t !== 27) && ((a = t === 5) && (a = e.type, a = !(a !== "form" && a !== "button") || So(e.type, e.memoizedProps)), a = !a), a && qe && Hn(e), Tf(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      qe = Wh(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
      qe = Wh(e);
    } else
      t === 27 ? (t = qe, ea(e.type) ? (e = Eo, Eo = null, qe = e) : qe = t) : qe = ut ? Yt(e.stateNode.nextSibling) : null;
    return !0;
  }
  function _a() {
    qe = ut = null, Se = !1;
  }
  function ar() {
    var e = kn;
    return e !== null && (wt === null ? wt = e : wt.push.apply(
      wt,
      e
    ), kn = null), e;
  }
  function Ii(e) {
    kn === null ? kn = [e] : kn.push(e);
  }
  var ir = z(null), Sa = null, mn = null;
  function Bn(e, t, a) {
    X(ir, t._currentValue), t._currentValue = a;
  }
  function pn(e) {
    e._currentValue = ir.current, Z(ir);
  }
  function lr(e, t, a) {
    for (; e !== null; ) {
      var l = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, l !== null && (l.childLanes |= t)) : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t), e === a) break;
      e = e.return;
    }
  }
  function sr(e, t, a, l) {
    var u = e.child;
    for (u !== null && (u.return = e); u !== null; ) {
      var o = u.dependencies;
      if (o !== null) {
        var f = u.child;
        o = o.firstContext;
        e: for (; o !== null; ) {
          var v = o;
          o = u;
          for (var b = 0; b < t.length; b++)
            if (v.context === t[b]) {
              o.lanes |= a, v = o.alternate, v !== null && (v.lanes |= a), lr(
                o.return,
                a,
                e
              ), l || (f = null);
              break e;
            }
          o = v.next;
        }
      } else if (u.tag === 18) {
        if (f = u.return, f === null) throw Error(r(341));
        f.lanes |= a, o = f.alternate, o !== null && (o.lanes |= a), lr(f, a, e), f = null;
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
  function ai(e, t, a, l) {
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
          var v = u.type;
          At(u.pendingProps.value, f.value) || (e !== null ? e.push(v) : e = [v]);
        }
      } else if (u === me.current) {
        if (f = u.alternate, f === null) throw Error(r(387));
        f.memoizedState.memoizedState !== u.memoizedState.memoizedState && (e !== null ? e.push(jl) : e = [jl]);
      }
      u = u.return;
    }
    e !== null && sr(
      t,
      e,
      a,
      l
    ), t.flags |= 262144;
  }
  function ns(e) {
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
  function za(e) {
    Sa = e, mn = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function rt(e) {
    return Af(Sa, e);
  }
  function as(e, t) {
    return Sa === null && za(e), Af(e, t);
  }
  function Af(e, t) {
    var a = t._currentValue;
    if (t = { context: t, memoizedValue: a, next: null }, mn === null) {
      if (e === null) throw Error(r(308));
      mn = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else mn = mn.next = t;
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
  }, Sy = n.unstable_scheduleCallback, zy = n.unstable_NormalPriority, Ve = {
    $$typeof: Y,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function ur() {
    return {
      controller: new _y(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Wi(e) {
    e.refCount--, e.refCount === 0 && Sy(zy, function() {
      e.controller.abort();
    });
  }
  var Pi = null, rr = 0, ii = 0, li = null;
  function wy(e, t) {
    if (Pi === null) {
      var a = Pi = [];
      rr = 0, ii = fo(), li = {
        status: "pending",
        value: void 0,
        then: function(l) {
          a.push(l);
        }
      };
    }
    return rr++, t.then(Of, Of), t;
  }
  function Of() {
    if (--rr === 0 && Pi !== null) {
      li !== null && (li.status = "fulfilled");
      var e = Pi;
      Pi = null, ii = 0, li = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function jy(e, t) {
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
  var Cf = N.S;
  N.S = function(e, t) {
    hh = ht(), typeof t == "object" && t !== null && typeof t.then == "function" && wy(e, t), Cf !== null && Cf(e, t);
  };
  var wa = z(null);
  function or() {
    var e = wa.current;
    return e !== null ? e : Re.pooledCache;
  }
  function is(e, t) {
    t === null ? X(wa, wa.current) : X(wa, t.pool);
  }
  function Nf() {
    var e = or();
    return e === null ? null : { parent: Ve._currentValue, pool: e };
  }
  var si = Error(r(460)), cr = Error(r(474)), ls = Error(r(542)), ss = { then: function() {
  } };
  function Mf(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function Df(e, t, a) {
    switch (a = e[a], a === void 0 ? e.push(t) : a !== t && (t.then(cn, cn), t = a), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, qf(e), e;
      default:
        if (typeof t.status == "string") t.then(cn, cn);
        else {
          if (e = Re, e !== null && 100 < e.shellSuspendCounter)
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
            throw e = t.reason, qf(e), e;
        }
        throw xa = t, si;
    }
  }
  function ja(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (a) {
      throw a !== null && typeof a == "object" && typeof a.then == "function" ? (xa = a, si) : a;
    }
  }
  var xa = null;
  function Rf() {
    if (xa === null) throw Error(r(459));
    var e = xa;
    return xa = null, e;
  }
  function qf(e) {
    if (e === si || e === ls)
      throw Error(r(483));
  }
  var ui = null, el = 0;
  function us(e) {
    var t = el;
    return el += 1, ui === null && (ui = []), Df(ui, e, t);
  }
  function tl(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function rs(e, t) {
    throw t.$$typeof === w ? Error(r(525)) : (e = Object.prototype.toString.call(t), Error(
      r(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function Uf(e) {
    function t(j, S) {
      if (e) {
        var E = j.deletions;
        E === null ? (j.deletions = [S], j.flags |= 16) : E.push(S);
      }
    }
    function a(j, S) {
      if (!e) return null;
      for (; S !== null; )
        t(j, S), S = S.sibling;
      return null;
    }
    function l(j) {
      for (var S = /* @__PURE__ */ new Map(); j !== null; )
        j.key !== null ? S.set(j.key, j) : S.set(j.index, j), j = j.sibling;
      return S;
    }
    function u(j, S) {
      return j = dn(j, S), j.index = 0, j.sibling = null, j;
    }
    function o(j, S, E) {
      return j.index = E, e ? (E = j.alternate, E !== null ? (E = E.index, E < S ? (j.flags |= 67108866, S) : E) : (j.flags |= 67108866, S)) : (j.flags |= 1048576, S);
    }
    function f(j) {
      return e && j.alternate === null && (j.flags |= 67108866), j;
    }
    function v(j, S, E, U) {
      return S === null || S.tag !== 6 ? (S = Wu(E, j.mode, U), S.return = j, S) : (S = u(S, E), S.return = j, S);
    }
    function b(j, S, E, U) {
      var ae = E.type;
      return ae === B ? R(
        j,
        S,
        E.props.children,
        U,
        E.key
      ) : S !== null && (S.elementType === ae || typeof ae == "object" && ae !== null && ae.$$typeof === k && ja(ae) === S.type) ? (S = u(S, E.props), tl(S, E), S.return = j, S) : (S = es(
        E.type,
        E.key,
        E.props,
        null,
        j.mode,
        U
      ), tl(S, E), S.return = j, S);
    }
    function T(j, S, E, U) {
      return S === null || S.tag !== 4 || S.stateNode.containerInfo !== E.containerInfo || S.stateNode.implementation !== E.implementation ? (S = Pu(E, j.mode, U), S.return = j, S) : (S = u(S, E.children || []), S.return = j, S);
    }
    function R(j, S, E, U, ae) {
      return S === null || S.tag !== 7 ? (S = ba(
        E,
        j.mode,
        U,
        ae
      ), S.return = j, S) : (S = u(S, E), S.return = j, S);
    }
    function Q(j, S, E) {
      if (typeof S == "string" && S !== "" || typeof S == "number" || typeof S == "bigint")
        return S = Wu(
          "" + S,
          j.mode,
          E
        ), S.return = j, S;
      if (typeof S == "object" && S !== null) {
        switch (S.$$typeof) {
          case C:
            return E = es(
              S.type,
              S.key,
              S.props,
              null,
              j.mode,
              E
            ), tl(E, S), E.return = j, E;
          case D:
            return S = Pu(
              S,
              j.mode,
              E
            ), S.return = j, S;
          case k:
            return S = ja(S), Q(j, S, E);
        }
        if (nt(S) || Oe(S))
          return S = ba(
            S,
            j.mode,
            E,
            null
          ), S.return = j, S;
        if (typeof S.then == "function")
          return Q(j, us(S), E);
        if (S.$$typeof === Y)
          return Q(
            j,
            as(j, S),
            E
          );
        rs(j, S);
      }
      return null;
    }
    function O(j, S, E, U) {
      var ae = S !== null ? S.key : null;
      if (typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint")
        return ae !== null ? null : v(j, S, "" + E, U);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case C:
            return E.key === ae ? b(j, S, E, U) : null;
          case D:
            return E.key === ae ? T(j, S, E, U) : null;
          case k:
            return E = ja(E), O(j, S, E, U);
        }
        if (nt(E) || Oe(E))
          return ae !== null ? null : R(j, S, E, U, null);
        if (typeof E.then == "function")
          return O(
            j,
            S,
            us(E),
            U
          );
        if (E.$$typeof === Y)
          return O(
            j,
            S,
            as(j, E),
            U
          );
        rs(j, E);
      }
      return null;
    }
    function M(j, S, E, U, ae) {
      if (typeof U == "string" && U !== "" || typeof U == "number" || typeof U == "bigint")
        return j = j.get(E) || null, v(S, j, "" + U, ae);
      if (typeof U == "object" && U !== null) {
        switch (U.$$typeof) {
          case C:
            return j = j.get(
              U.key === null ? E : U.key
            ) || null, b(S, j, U, ae);
          case D:
            return j = j.get(
              U.key === null ? E : U.key
            ) || null, T(S, j, U, ae);
          case k:
            return U = ja(U), M(
              j,
              S,
              E,
              U,
              ae
            );
        }
        if (nt(U) || Oe(U))
          return j = j.get(E) || null, R(S, j, U, ae, null);
        if (typeof U.then == "function")
          return M(
            j,
            S,
            E,
            us(U),
            ae
          );
        if (U.$$typeof === Y)
          return M(
            j,
            S,
            E,
            as(S, U),
            ae
          );
        rs(S, U);
      }
      return null;
    }
    function I(j, S, E, U) {
      for (var ae = null, ze = null, W = S, de = S = 0, _e = null; W !== null && de < E.length; de++) {
        W.index > de ? (_e = W, W = null) : _e = W.sibling;
        var we = O(
          j,
          W,
          E[de],
          U
        );
        if (we === null) {
          W === null && (W = _e);
          break;
        }
        e && W && we.alternate === null && t(j, W), S = o(we, S, de), ze === null ? ae = we : ze.sibling = we, ze = we, W = _e;
      }
      if (de === E.length)
        return a(j, W), Se && hn(j, de), ae;
      if (W === null) {
        for (; de < E.length; de++)
          W = Q(j, E[de], U), W !== null && (S = o(
            W,
            S,
            de
          ), ze === null ? ae = W : ze.sibling = W, ze = W);
        return Se && hn(j, de), ae;
      }
      for (W = l(W); de < E.length; de++)
        _e = M(
          W,
          j,
          de,
          E[de],
          U
        ), _e !== null && (e && _e.alternate !== null && W.delete(
          _e.key === null ? de : _e.key
        ), S = o(
          _e,
          S,
          de
        ), ze === null ? ae = _e : ze.sibling = _e, ze = _e);
      return e && W.forEach(function(la) {
        return t(j, la);
      }), Se && hn(j, de), ae;
    }
    function le(j, S, E, U) {
      if (E == null) throw Error(r(151));
      for (var ae = null, ze = null, W = S, de = S = 0, _e = null, we = E.next(); W !== null && !we.done; de++, we = E.next()) {
        W.index > de ? (_e = W, W = null) : _e = W.sibling;
        var la = O(j, W, we.value, U);
        if (la === null) {
          W === null && (W = _e);
          break;
        }
        e && W && la.alternate === null && t(j, W), S = o(la, S, de), ze === null ? ae = la : ze.sibling = la, ze = la, W = _e;
      }
      if (we.done)
        return a(j, W), Se && hn(j, de), ae;
      if (W === null) {
        for (; !we.done; de++, we = E.next())
          we = Q(j, we.value, U), we !== null && (S = o(we, S, de), ze === null ? ae = we : ze.sibling = we, ze = we);
        return Se && hn(j, de), ae;
      }
      for (W = l(W); !we.done; de++, we = E.next())
        we = M(W, j, de, we.value, U), we !== null && (e && we.alternate !== null && W.delete(we.key === null ? de : we.key), S = o(we, S, de), ze === null ? ae = we : ze.sibling = we, ze = we);
      return e && W.forEach(function(qg) {
        return t(j, qg);
      }), Se && hn(j, de), ae;
    }
    function Me(j, S, E, U) {
      if (typeof E == "object" && E !== null && E.type === B && E.key === null && (E = E.props.children), typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case C:
            e: {
              for (var ae = E.key; S !== null; ) {
                if (S.key === ae) {
                  if (ae = E.type, ae === B) {
                    if (S.tag === 7) {
                      a(
                        j,
                        S.sibling
                      ), U = u(
                        S,
                        E.props.children
                      ), U.return = j, j = U;
                      break e;
                    }
                  } else if (S.elementType === ae || typeof ae == "object" && ae !== null && ae.$$typeof === k && ja(ae) === S.type) {
                    a(
                      j,
                      S.sibling
                    ), U = u(S, E.props), tl(U, E), U.return = j, j = U;
                    break e;
                  }
                  a(j, S);
                  break;
                } else t(j, S);
                S = S.sibling;
              }
              E.type === B ? (U = ba(
                E.props.children,
                j.mode,
                U,
                E.key
              ), U.return = j, j = U) : (U = es(
                E.type,
                E.key,
                E.props,
                null,
                j.mode,
                U
              ), tl(U, E), U.return = j, j = U);
            }
            return f(j);
          case D:
            e: {
              for (ae = E.key; S !== null; ) {
                if (S.key === ae)
                  if (S.tag === 4 && S.stateNode.containerInfo === E.containerInfo && S.stateNode.implementation === E.implementation) {
                    a(
                      j,
                      S.sibling
                    ), U = u(S, E.children || []), U.return = j, j = U;
                    break e;
                  } else {
                    a(j, S);
                    break;
                  }
                else t(j, S);
                S = S.sibling;
              }
              U = Pu(E, j.mode, U), U.return = j, j = U;
            }
            return f(j);
          case k:
            return E = ja(E), Me(
              j,
              S,
              E,
              U
            );
        }
        if (nt(E))
          return I(
            j,
            S,
            E,
            U
          );
        if (Oe(E)) {
          if (ae = Oe(E), typeof ae != "function") throw Error(r(150));
          return E = ae.call(E), le(
            j,
            S,
            E,
            U
          );
        }
        if (typeof E.then == "function")
          return Me(
            j,
            S,
            us(E),
            U
          );
        if (E.$$typeof === Y)
          return Me(
            j,
            S,
            as(j, E),
            U
          );
        rs(j, E);
      }
      return typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint" ? (E = "" + E, S !== null && S.tag === 6 ? (a(j, S.sibling), U = u(S, E), U.return = j, j = U) : (a(j, S), U = Wu(E, j.mode, U), U.return = j, j = U), f(j)) : a(j, S);
    }
    return function(j, S, E, U) {
      try {
        el = 0;
        var ae = Me(
          j,
          S,
          E,
          U
        );
        return ui = null, ae;
      } catch (W) {
        if (W === si || W === ls) throw W;
        var ze = Ot(29, W, null, j.mode);
        return ze.lanes = U, ze.return = j, ze;
      } finally {
      }
    };
  }
  var Ea = Uf(!0), Zf = Uf(!1), $n = !1;
  function fr(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function dr(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function Ln(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function Gn(e, t, a) {
    var l = e.updateQueue;
    if (l === null) return null;
    if (l = l.shared, (xe & 2) !== 0) {
      var u = l.pending;
      return u === null ? t.next = t : (t.next = u.next, u.next = t), l.pending = t, t = Pl(e), _f(e, null, a), t;
    }
    return Wl(e, l, t, a), Pl(e);
  }
  function nl(e, t, a) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (a & 4194048) !== 0)) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, Tc(e, a);
    }
  }
  function hr(e, t) {
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
  var mr = !1;
  function al() {
    if (mr) {
      var e = li;
      if (e !== null) throw e;
    }
  }
  function il(e, t, a, l) {
    mr = !1;
    var u = e.updateQueue;
    $n = !1;
    var o = u.firstBaseUpdate, f = u.lastBaseUpdate, v = u.shared.pending;
    if (v !== null) {
      u.shared.pending = null;
      var b = v, T = b.next;
      b.next = null, f === null ? o = T : f.next = T, f = b;
      var R = e.alternate;
      R !== null && (R = R.updateQueue, v = R.lastBaseUpdate, v !== f && (v === null ? R.firstBaseUpdate = T : v.next = T, R.lastBaseUpdate = b));
    }
    if (o !== null) {
      var Q = u.baseState;
      f = 0, R = T = b = null, v = o;
      do {
        var O = v.lane & -536870913, M = O !== v.lane;
        if (M ? (be & O) === O : (l & O) === O) {
          O !== 0 && O === ii && (mr = !0), R !== null && (R = R.next = {
            lane: 0,
            tag: v.tag,
            payload: v.payload,
            callback: null,
            next: null
          });
          e: {
            var I = e, le = v;
            O = t;
            var Me = a;
            switch (le.tag) {
              case 1:
                if (I = le.payload, typeof I == "function") {
                  Q = I.call(Me, Q, O);
                  break e;
                }
                Q = I;
                break e;
              case 3:
                I.flags = I.flags & -65537 | 128;
              case 0:
                if (I = le.payload, O = typeof I == "function" ? I.call(Me, Q, O) : I, O == null) break e;
                Q = x({}, Q, O);
                break e;
              case 2:
                $n = !0;
            }
          }
          O = v.callback, O !== null && (e.flags |= 64, M && (e.flags |= 8192), M = u.callbacks, M === null ? u.callbacks = [O] : M.push(O));
        } else
          M = {
            lane: O,
            tag: v.tag,
            payload: v.payload,
            callback: v.callback,
            next: null
          }, R === null ? (T = R = M, b = Q) : R = R.next = M, f |= O;
        if (v = v.next, v === null) {
          if (v = u.shared.pending, v === null)
            break;
          M = v, v = M.next, M.next = null, u.lastBaseUpdate = M, u.shared.pending = null;
        }
      } while (!0);
      R === null && (b = Q), u.baseState = b, u.firstBaseUpdate = T, u.lastBaseUpdate = R, o === null && (u.shared.lanes = 0), Jn |= f, e.lanes = f, e.memoizedState = Q;
    }
  }
  function Qf(e, t) {
    if (typeof e != "function")
      throw Error(r(191, e));
    e.call(t);
  }
  function kf(e, t) {
    var a = e.callbacks;
    if (a !== null)
      for (e.callbacks = null, e = 0; e < a.length; e++)
        Qf(a[e], t);
  }
  var ri = z(null), os = z(0);
  function Hf(e, t) {
    e = jn, X(os, e), X(ri, t), jn = e | t.baseLanes;
  }
  function pr() {
    X(os, jn), X(ri, ri.current);
  }
  function vr() {
    jn = os.current, Z(ri), Z(os);
  }
  var Ct = z(null), Gt = null;
  function Yn(e) {
    var t = e.alternate;
    X(Ye, Ye.current & 1), X(Ct, e), Gt === null && (t === null || ri.current !== null || t.memoizedState !== null) && (Gt = e);
  }
  function yr(e) {
    X(Ye, Ye.current), X(Ct, e), Gt === null && (Gt = e);
  }
  function Bf(e) {
    e.tag === 22 ? (X(Ye, Ye.current), X(Ct, e), Gt === null && (Gt = e)) : Kn();
  }
  function Kn() {
    X(Ye, Ye.current), X(Ct, Ct.current);
  }
  function Nt(e) {
    Z(Ct), Gt === e && (Gt = null), Z(Ye);
  }
  var Ye = z(0);
  function cs(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var a = t.memoizedState;
        if (a !== null && (a = a.dehydrated, a === null || jo(a) || xo(a)))
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
  var vn = 0, ce = null, Ce = null, Je = null, fs = !1, oi = !1, Ta = !1, ds = 0, ll = 0, ci = null, xy = 0;
  function Le() {
    throw Error(r(321));
  }
  function gr(e, t) {
    if (t === null) return !1;
    for (var a = 0; a < t.length && a < e.length; a++)
      if (!At(e[a], t[a])) return !1;
    return !0;
  }
  function br(e, t, a, l, u, o) {
    return vn = o, ce = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, N.H = e === null || e.memoizedState === null ? jd : Rr, Ta = !1, o = a(l, u), Ta = !1, oi && (o = Lf(
      t,
      a,
      l,
      u
    )), $f(e), o;
  }
  function $f(e) {
    N.H = rl;
    var t = Ce !== null && Ce.next !== null;
    if (vn = 0, Je = Ce = ce = null, fs = !1, ll = 0, ci = null, t) throw Error(r(300));
    e === null || Fe || (e = e.dependencies, e !== null && ns(e) && (Fe = !0));
  }
  function Lf(e, t, a, l) {
    ce = e;
    var u = 0;
    do {
      if (oi && (ci = null), ll = 0, oi = !1, 25 <= u) throw Error(r(301));
      if (u += 1, Je = Ce = null, e.updateQueue != null) {
        var o = e.updateQueue;
        o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
      }
      N.H = xd, o = t(a, l);
    } while (oi);
    return o;
  }
  function Ey() {
    var e = N.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? sl(t) : t, e = e.useState()[0], (Ce !== null ? Ce.memoizedState : null) !== e && (ce.flags |= 1024), t;
  }
  function _r() {
    var e = ds !== 0;
    return ds = 0, e;
  }
  function Sr(e, t, a) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~a;
  }
  function zr(e) {
    if (fs) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      fs = !1;
    }
    vn = 0, Je = Ce = ce = null, oi = !1, ll = ds = 0, ci = null;
  }
  function pt() {
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
    if (Ce === null) {
      var e = ce.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Ce.next;
    var t = Je === null ? ce.memoizedState : Je.next;
    if (t !== null)
      Je = t, Ce = e;
    else {
      if (e === null)
        throw ce.alternate === null ? Error(r(467)) : Error(r(310));
      Ce = e, e = {
        memoizedState: Ce.memoizedState,
        baseState: Ce.baseState,
        baseQueue: Ce.baseQueue,
        queue: Ce.queue,
        next: null
      }, Je === null ? ce.memoizedState = Je = e : Je = Je.next = e;
    }
    return Je;
  }
  function hs() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function sl(e) {
    var t = ll;
    return ll += 1, ci === null && (ci = []), e = Df(ci, e, t), t = ce, (Je === null ? t.memoizedState : Je.next) === null && (t = t.alternate, N.H = t === null || t.memoizedState === null ? jd : Rr), e;
  }
  function ms(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return sl(e);
      if (e.$$typeof === Y) return rt(e);
    }
    throw Error(r(438, String(e)));
  }
  function wr(e) {
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
    if (t == null && (t = { data: [], index: 0 }), a === null && (a = hs(), ce.updateQueue = a), a.memoCache = t, a = t.data[t.index], a === void 0)
      for (a = t.data[t.index] = Array(e), l = 0; l < e; l++)
        a[l] = he;
    return t.index++, a;
  }
  function yn(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function ps(e) {
    var t = Ke();
    return jr(t, Ce, e);
  }
  function jr(e, t, a) {
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
      var v = f = null, b = null, T = t, R = !1;
      do {
        var Q = T.lane & -536870913;
        if (Q !== T.lane ? (be & Q) === Q : (vn & Q) === Q) {
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
            }), Q === ii && (R = !0);
          else if ((vn & O) === O) {
            T = T.next, O === ii && (R = !0);
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
            }, b === null ? (v = b = Q, f = o) : b = b.next = Q, ce.lanes |= O, Jn |= O;
          Q = T.action, Ta && a(o, Q), o = T.hasEagerState ? T.eagerState : a(o, Q);
        } else
          O = {
            lane: Q,
            revertLane: T.revertLane,
            gesture: T.gesture,
            action: T.action,
            hasEagerState: T.hasEagerState,
            eagerState: T.eagerState,
            next: null
          }, b === null ? (v = b = O, f = o) : b = b.next = O, ce.lanes |= Q, Jn |= Q;
        T = T.next;
      } while (T !== null && T !== t);
      if (b === null ? f = o : b.next = v, !At(o, e.memoizedState) && (Fe = !0, R && (a = li, a !== null)))
        throw a;
      e.memoizedState = o, e.baseState = f, e.baseQueue = b, l.lastRenderedState = o;
    }
    return u === null && (l.lanes = 0), [e.memoizedState, l.dispatch];
  }
  function xr(e) {
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
      At(o, t.memoizedState) || (Fe = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), a.lastRenderedState = o;
    }
    return [o, l];
  }
  function Gf(e, t, a) {
    var l = ce, u = Ke(), o = Se;
    if (o) {
      if (a === void 0) throw Error(r(407));
      a = a();
    } else a = t();
    var f = !At(
      (Ce || u).memoizedState,
      a
    );
    if (f && (u.memoizedState = a, Fe = !0), u = u.queue, Ar(Xf.bind(null, l, u, e), [
      e
    ]), u.getSnapshot !== t || f || Je !== null && Je.memoizedState.tag & 1) {
      if (l.flags |= 2048, fi(
        9,
        { destroy: void 0 },
        Kf.bind(
          null,
          l,
          u,
          a,
          t
        ),
        null
      ), Re === null) throw Error(r(349));
      o || (vn & 127) !== 0 || Yf(l, t, a);
    }
    return a;
  }
  function Yf(e, t, a) {
    e.flags |= 16384, e = { getSnapshot: t, value: a }, t = ce.updateQueue, t === null ? (t = hs(), ce.updateQueue = t, t.stores = [e]) : (a = t.stores, a === null ? t.stores = [e] : a.push(e));
  }
  function Kf(e, t, a, l) {
    t.value = a, t.getSnapshot = l, Vf(t) && Jf(e);
  }
  function Xf(e, t, a) {
    return a(function() {
      Vf(t) && Jf(e);
    });
  }
  function Vf(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var a = t();
      return !At(e, a);
    } catch {
      return !0;
    }
  }
  function Jf(e) {
    var t = ga(e, 2);
    t !== null && jt(t, e, 2);
  }
  function Er(e) {
    var t = pt();
    if (typeof e == "function") {
      var a = e;
      if (e = a(), Ta) {
        qn(!0);
        try {
          a();
        } finally {
          qn(!1);
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
  function Ff(e, t, a, l) {
    return e.baseState = a, jr(
      e,
      Ce,
      typeof l == "function" ? l : yn
    );
  }
  function Ty(e, t, a, l, u) {
    if (gs(e)) throw Error(r(485));
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
      N.T !== null ? a(!0) : o.isTransition = !1, l(o), a = t.pending, a === null ? (o.next = t.pending = o, If(t, o)) : (o.next = a.next, t.pending = a.next = o);
    }
  }
  function If(e, t) {
    var a = t.action, l = t.payload, u = e.state;
    if (t.isTransition) {
      var o = N.T, f = {};
      N.T = f;
      try {
        var v = a(u, l), b = N.S;
        b !== null && b(f, v), Wf(e, t, v);
      } catch (T) {
        Tr(e, t, T);
      } finally {
        o !== null && f.types !== null && (o.types = f.types), N.T = o;
      }
    } else
      try {
        o = a(u, l), Wf(e, t, o);
      } catch (T) {
        Tr(e, t, T);
      }
  }
  function Wf(e, t, a) {
    a !== null && typeof a == "object" && typeof a.then == "function" ? a.then(
      function(l) {
        Pf(e, t, l);
      },
      function(l) {
        return Tr(e, t, l);
      }
    ) : Pf(e, t, a);
  }
  function Pf(e, t, a) {
    t.status = "fulfilled", t.value = a, ed(t), e.state = a, t = e.pending, t !== null && (a = t.next, a === t ? e.pending = null : (a = a.next, t.next = a, If(e, a)));
  }
  function Tr(e, t, a) {
    var l = e.pending;
    if (e.pending = null, l !== null) {
      l = l.next;
      do
        t.status = "rejected", t.reason = a, ed(t), t = t.next;
      while (t !== l);
    }
    e.action = null;
  }
  function ed(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function td(e, t) {
    return t;
  }
  function nd(e, t) {
    if (Se) {
      var a = Re.formState;
      if (a !== null) {
        e: {
          var l = ce;
          if (Se) {
            if (qe) {
              t: {
                for (var u = qe, o = Lt; u.nodeType !== 8; ) {
                  if (!o) {
                    u = null;
                    break t;
                  }
                  if (u = Yt(
                    u.nextSibling
                  ), u === null) {
                    u = null;
                    break t;
                  }
                }
                o = u.data, u = o === "F!" || o === "F" ? u : null;
              }
              if (u) {
                qe = Yt(
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
    return a = pt(), a.memoizedState = a.baseState = t, l = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: td,
      lastRenderedState: t
    }, a.queue = l, a = Sd.bind(
      null,
      ce,
      l
    ), l.dispatch = a, l = Er(!1), o = Dr.bind(
      null,
      ce,
      !1,
      l.queue
    ), l = pt(), u = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, l.queue = u, a = Ty.bind(
      null,
      ce,
      u,
      o,
      a
    ), u.dispatch = a, l.memoizedState = e, [t, a, !1];
  }
  function ad(e) {
    var t = Ke();
    return id(t, Ce, e);
  }
  function id(e, t, a) {
    if (t = jr(
      e,
      t,
      td
    )[0], e = ps(yn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var l = sl(t);
      } catch (f) {
        throw f === si ? ls : f;
      }
    else l = t;
    t = Ke();
    var u = t.queue, o = u.dispatch;
    return a !== t.memoizedState && (ce.flags |= 2048, fi(
      9,
      { destroy: void 0 },
      Ay.bind(null, u, a),
      null
    )), [l, o, e];
  }
  function Ay(e, t) {
    e.action = t;
  }
  function ld(e) {
    var t = Ke(), a = Ce;
    if (a !== null)
      return id(t, a, e);
    Ke(), t = t.memoizedState, a = Ke();
    var l = a.queue.dispatch;
    return a.memoizedState = e, [t, l, !1];
  }
  function fi(e, t, a, l) {
    return e = { tag: e, create: a, deps: l, inst: t, next: null }, t = ce.updateQueue, t === null && (t = hs(), ce.updateQueue = t), a = t.lastEffect, a === null ? t.lastEffect = e.next = e : (l = a.next, a.next = e, e.next = l, t.lastEffect = e), e;
  }
  function sd() {
    return Ke().memoizedState;
  }
  function vs(e, t, a, l) {
    var u = pt();
    ce.flags |= e, u.memoizedState = fi(
      1 | t,
      { destroy: void 0 },
      a,
      l === void 0 ? null : l
    );
  }
  function ys(e, t, a, l) {
    var u = Ke();
    l = l === void 0 ? null : l;
    var o = u.memoizedState.inst;
    Ce !== null && l !== null && gr(l, Ce.memoizedState.deps) ? u.memoizedState = fi(t, o, a, l) : (ce.flags |= e, u.memoizedState = fi(
      1 | t,
      o,
      a,
      l
    ));
  }
  function ud(e, t) {
    vs(8390656, 8, e, t);
  }
  function Ar(e, t) {
    ys(2048, 8, e, t);
  }
  function Oy(e) {
    ce.flags |= 4;
    var t = ce.updateQueue;
    if (t === null)
      t = hs(), ce.updateQueue = t, t.events = [e];
    else {
      var a = t.events;
      a === null ? t.events = [e] : a.push(e);
    }
  }
  function rd(e) {
    var t = Ke().memoizedState;
    return Oy({ ref: t, nextImpl: e }), function() {
      if ((xe & 2) !== 0) throw Error(r(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function od(e, t) {
    return ys(4, 2, e, t);
  }
  function cd(e, t) {
    return ys(4, 4, e, t);
  }
  function fd(e, t) {
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
  function dd(e, t, a) {
    a = a != null ? a.concat([e]) : null, ys(4, 4, fd.bind(null, t, e), a);
  }
  function Or() {
  }
  function hd(e, t) {
    var a = Ke();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    return t !== null && gr(t, l[1]) ? l[0] : (a.memoizedState = [e, t], e);
  }
  function md(e, t) {
    var a = Ke();
    t = t === void 0 ? null : t;
    var l = a.memoizedState;
    if (t !== null && gr(t, l[1]))
      return l[0];
    if (l = e(), Ta) {
      qn(!0);
      try {
        e();
      } finally {
        qn(!1);
      }
    }
    return a.memoizedState = [l, t], l;
  }
  function Cr(e, t, a) {
    return a === void 0 || (vn & 1073741824) !== 0 && (be & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = a, e = ph(), ce.lanes |= e, Jn |= e, a);
  }
  function pd(e, t, a, l) {
    return At(a, t) ? a : ri.current !== null ? (e = Cr(e, a, l), At(e, t) || (Fe = !0), e) : (vn & 42) === 0 || (vn & 1073741824) !== 0 && (be & 261930) === 0 ? (Fe = !0, e.memoizedState = a) : (e = ph(), ce.lanes |= e, Jn |= e, t);
  }
  function vd(e, t, a, l, u) {
    var o = K.p;
    K.p = o !== 0 && 8 > o ? o : 8;
    var f = N.T, v = {};
    N.T = v, Dr(e, !1, t, a);
    try {
      var b = u(), T = N.S;
      if (T !== null && T(v, b), b !== null && typeof b == "object" && typeof b.then == "function") {
        var R = jy(
          b,
          l
        );
        ul(
          e,
          t,
          R,
          Rt(e)
        );
      } else
        ul(
          e,
          t,
          l,
          Rt(e)
        );
    } catch (Q) {
      ul(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: Q },
        Rt()
      );
    } finally {
      K.p = o, f !== null && v.types !== null && (f.types = v.types), N.T = f;
    }
  }
  function Cy() {
  }
  function Nr(e, t, a, l) {
    if (e.tag !== 5) throw Error(r(476));
    var u = yd(e).queue;
    vd(
      e,
      u,
      t,
      se,
      a === null ? Cy : function() {
        return gd(e), a(l);
      }
    );
  }
  function yd(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: se,
      baseState: se,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: yn,
        lastRenderedState: se
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
  function gd(e) {
    var t = yd(e);
    t.next === null && (t = e.alternate.memoizedState), ul(
      e,
      t.next.queue,
      {},
      Rt()
    );
  }
  function Mr() {
    return rt(jl);
  }
  function bd() {
    return Ke().memoizedState;
  }
  function _d() {
    return Ke().memoizedState;
  }
  function Ny(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var a = Rt();
          e = Ln(a);
          var l = Gn(t, e, a);
          l !== null && (jt(l, t, a), nl(l, t, a)), t = { cache: ur() }, e.payload = t;
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
    }, gs(e) ? zd(t, a) : (a = Fu(e, t, a, l), a !== null && (jt(a, e, l), wd(a, t, l)));
  }
  function Sd(e, t, a) {
    var l = Rt();
    ul(e, t, a, l);
  }
  function ul(e, t, a, l) {
    var u = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (gs(e)) zd(t, u);
    else {
      var o = e.alternate;
      if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer, o !== null))
        try {
          var f = t.lastRenderedState, v = o(f, a);
          if (u.hasEagerState = !0, u.eagerState = v, At(v, f))
            return Wl(e, t, u, 0), Re === null && Il(), !1;
        } catch {
        } finally {
        }
      if (a = Fu(e, t, u, l), a !== null)
        return jt(a, e, l), wd(a, t, l), !0;
    }
    return !1;
  }
  function Dr(e, t, a, l) {
    if (l = {
      lane: 2,
      revertLane: fo(),
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, gs(e)) {
      if (t) throw Error(r(479));
    } else
      t = Fu(
        e,
        a,
        l,
        2
      ), t !== null && jt(t, e, 2);
  }
  function gs(e) {
    var t = e.alternate;
    return e === ce || t !== null && t === ce;
  }
  function zd(e, t) {
    oi = fs = !0;
    var a = e.pending;
    a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
  }
  function wd(e, t, a) {
    if ((a & 4194048) !== 0) {
      var l = t.lanes;
      l &= e.pendingLanes, a |= l, t.lanes = a, Tc(e, a);
    }
  }
  var rl = {
    readContext: rt,
    use: ms,
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
  rl.useEffectEvent = Le;
  var jd = {
    readContext: rt,
    use: ms,
    useCallback: function(e, t) {
      return pt().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: rt,
    useEffect: ud,
    useImperativeHandle: function(e, t, a) {
      a = a != null ? a.concat([e]) : null, vs(
        4194308,
        4,
        fd.bind(null, t, e),
        a
      );
    },
    useLayoutEffect: function(e, t) {
      return vs(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      vs(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var a = pt();
      t = t === void 0 ? null : t;
      var l = e();
      if (Ta) {
        qn(!0);
        try {
          e();
        } finally {
          qn(!1);
        }
      }
      return a.memoizedState = [l, t], l;
    },
    useReducer: function(e, t, a) {
      var l = pt();
      if (a !== void 0) {
        var u = a(t);
        if (Ta) {
          qn(!0);
          try {
            a(t);
          } finally {
            qn(!1);
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
        ce,
        e
      ), [l.memoizedState, e];
    },
    useRef: function(e) {
      var t = pt();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = Er(e);
      var t = e.queue, a = Sd.bind(null, ce, t);
      return t.dispatch = a, [e.memoizedState, a];
    },
    useDebugValue: Or,
    useDeferredValue: function(e, t) {
      var a = pt();
      return Cr(a, e, t);
    },
    useTransition: function() {
      var e = Er(!1);
      return e = vd.bind(
        null,
        ce,
        e.queue,
        !0,
        !1
      ), pt().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, a) {
      var l = ce, u = pt();
      if (Se) {
        if (a === void 0)
          throw Error(r(407));
        a = a();
      } else {
        if (a = t(), Re === null)
          throw Error(r(349));
        (be & 127) !== 0 || Yf(l, t, a);
      }
      u.memoizedState = a;
      var o = { value: a, getSnapshot: t };
      return u.queue = o, ud(Xf.bind(null, l, o, e), [
        e
      ]), l.flags |= 2048, fi(
        9,
        { destroy: void 0 },
        Kf.bind(
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
      var e = pt(), t = Re.identifierPrefix;
      if (Se) {
        var a = ln, l = an;
        a = (l & ~(1 << 32 - Tt(l) - 1)).toString(32) + a, t = "_" + t + "R_" + a, a = ds++, 0 < a && (t += "H" + a.toString(32)), t += "_";
      } else
        a = xy++, t = "_" + t + "r_" + a.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: Mr,
    useFormState: nd,
    useActionState: nd,
    useOptimistic: function(e) {
      var t = pt();
      t.memoizedState = t.baseState = e;
      var a = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = a, t = Dr.bind(
        null,
        ce,
        !0,
        a
      ), a.dispatch = t, [e, t];
    },
    useMemoCache: wr,
    useCacheRefresh: function() {
      return pt().memoizedState = Ny.bind(
        null,
        ce
      );
    },
    useEffectEvent: function(e) {
      var t = pt(), a = { impl: e };
      return t.memoizedState = a, function() {
        if ((xe & 2) !== 0)
          throw Error(r(440));
        return a.impl.apply(void 0, arguments);
      };
    }
  }, Rr = {
    readContext: rt,
    use: ms,
    useCallback: hd,
    useContext: rt,
    useEffect: Ar,
    useImperativeHandle: dd,
    useInsertionEffect: od,
    useLayoutEffect: cd,
    useMemo: md,
    useReducer: ps,
    useRef: sd,
    useState: function() {
      return ps(yn);
    },
    useDebugValue: Or,
    useDeferredValue: function(e, t) {
      var a = Ke();
      return pd(
        a,
        Ce.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = ps(yn)[0], t = Ke().memoizedState;
      return [
        typeof e == "boolean" ? e : sl(e),
        t
      ];
    },
    useSyncExternalStore: Gf,
    useId: bd,
    useHostTransitionStatus: Mr,
    useFormState: ad,
    useActionState: ad,
    useOptimistic: function(e, t) {
      var a = Ke();
      return Ff(a, Ce, e, t);
    },
    useMemoCache: wr,
    useCacheRefresh: _d
  };
  Rr.useEffectEvent = rd;
  var xd = {
    readContext: rt,
    use: ms,
    useCallback: hd,
    useContext: rt,
    useEffect: Ar,
    useImperativeHandle: dd,
    useInsertionEffect: od,
    useLayoutEffect: cd,
    useMemo: md,
    useReducer: xr,
    useRef: sd,
    useState: function() {
      return xr(yn);
    },
    useDebugValue: Or,
    useDeferredValue: function(e, t) {
      var a = Ke();
      return Ce === null ? Cr(a, e, t) : pd(
        a,
        Ce.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = xr(yn)[0], t = Ke().memoizedState;
      return [
        typeof e == "boolean" ? e : sl(e),
        t
      ];
    },
    useSyncExternalStore: Gf,
    useId: bd,
    useHostTransitionStatus: Mr,
    useFormState: ld,
    useActionState: ld,
    useOptimistic: function(e, t) {
      var a = Ke();
      return Ce !== null ? Ff(a, Ce, e, t) : (a.baseState = e, [e, a.queue.dispatch]);
    },
    useMemoCache: wr,
    useCacheRefresh: _d
  };
  xd.useEffectEvent = rd;
  function qr(e, t, a, l) {
    t = e.memoizedState, a = a(l, t), a = a == null ? t : x({}, t, a), e.memoizedState = a, e.lanes === 0 && (e.updateQueue.baseState = a);
  }
  var Ur = {
    enqueueSetState: function(e, t, a) {
      e = e._reactInternals;
      var l = Rt(), u = Ln(l);
      u.payload = t, a != null && (u.callback = a), t = Gn(e, u, l), t !== null && (jt(t, e, l), nl(t, e, l));
    },
    enqueueReplaceState: function(e, t, a) {
      e = e._reactInternals;
      var l = Rt(), u = Ln(l);
      u.tag = 1, u.payload = t, a != null && (u.callback = a), t = Gn(e, u, l), t !== null && (jt(t, e, l), nl(t, e, l));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var a = Rt(), l = Ln(a);
      l.tag = 2, t != null && (l.callback = t), t = Gn(e, l, a), t !== null && (jt(t, e, a), nl(t, e, a));
    }
  };
  function Ed(e, t, a, l, u, o, f) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, o, f) : t.prototype && t.prototype.isPureReactComponent ? !Vi(a, l) || !Vi(u, o) : !0;
  }
  function Td(e, t, a, l) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, l), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, l), t.state !== e && Ur.enqueueReplaceState(t, t.state, null);
  }
  function Aa(e, t) {
    var a = t;
    if ("ref" in t) {
      a = {};
      for (var l in t)
        l !== "ref" && (a[l] = t[l]);
    }
    if (e = e.defaultProps) {
      a === t && (a = x({}, a));
      for (var u in e)
        a[u] === void 0 && (a[u] = e[u]);
    }
    return a;
  }
  function Ad(e) {
    Fl(e);
  }
  function Od(e) {
    console.error(e);
  }
  function Cd(e) {
    Fl(e);
  }
  function bs(e, t) {
    try {
      var a = e.onUncaughtError;
      a(t.value, { componentStack: t.stack });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function Nd(e, t, a) {
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
  function Zr(e, t, a) {
    return a = Ln(a), a.tag = 3, a.payload = { element: null }, a.callback = function() {
      bs(e, t);
    }, a;
  }
  function Md(e) {
    return e = Ln(e), e.tag = 3, e;
  }
  function Dd(e, t, a, l) {
    var u = a.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var o = l.value;
      e.payload = function() {
        return u(o);
      }, e.callback = function() {
        Nd(t, a, l);
      };
    }
    var f = a.stateNode;
    f !== null && typeof f.componentDidCatch == "function" && (e.callback = function() {
      Nd(t, a, l), typeof u != "function" && (Fn === null ? Fn = /* @__PURE__ */ new Set([this]) : Fn.add(this));
      var v = l.stack;
      this.componentDidCatch(l.value, {
        componentStack: v !== null ? v : ""
      });
    });
  }
  function Dy(e, t, a, l, u) {
    if (a.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
      if (t = a.alternate, t !== null && ai(
        t,
        a,
        u,
        !0
      ), a = Ct.current, a !== null) {
        switch (a.tag) {
          case 31:
          case 13:
            return Gt === null ? Ns() : a.alternate === null && Ge === 0 && (Ge = 3), a.flags &= -257, a.flags |= 65536, a.lanes = u, l === ss ? a.flags |= 16384 : (t = a.updateQueue, t === null ? a.updateQueue = /* @__PURE__ */ new Set([l]) : t.add(l), ro(e, l, u)), !1;
          case 22:
            return a.flags |= 65536, l === ss ? a.flags |= 16384 : (t = a.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([l])
            }, a.updateQueue = t) : (a = t.retryQueue, a === null ? t.retryQueue = /* @__PURE__ */ new Set([l]) : a.add(l)), ro(e, l, u)), !1;
        }
        throw Error(r(435, a.tag));
      }
      return ro(e, l, u), Ns(), !1;
    }
    if (Se)
      return t = Ct.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = u, l !== nr && (e = Error(r(422), { cause: l }), Ii(Ht(e, a)))) : (l !== nr && (t = Error(r(423), {
        cause: l
      }), Ii(
        Ht(t, a)
      )), e = e.current.alternate, e.flags |= 65536, u &= -u, e.lanes |= u, l = Ht(l, a), u = Zr(
        e.stateNode,
        l,
        u
      ), hr(e, u), Ge !== 4 && (Ge = 2)), !1;
    var o = Error(r(520), { cause: l });
    if (o = Ht(o, a), vl === null ? vl = [o] : vl.push(o), Ge !== 4 && (Ge = 2), t === null) return !0;
    l = Ht(l, a), a = t;
    do {
      switch (a.tag) {
        case 3:
          return a.flags |= 65536, e = u & -u, a.lanes |= e, e = Zr(a.stateNode, l, e), hr(a, e), !1;
        case 1:
          if (t = a.type, o = a.stateNode, (a.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (Fn === null || !Fn.has(o))))
            return a.flags |= 65536, u &= -u, a.lanes |= u, u = Md(u), Dd(
              u,
              e,
              a,
              l
            ), hr(a, u), !1;
      }
      a = a.return;
    } while (a !== null);
    return !1;
  }
  var Qr = Error(r(461)), Fe = !1;
  function ot(e, t, a, l) {
    t.child = e === null ? Zf(t, null, a, l) : Ea(
      t,
      e.child,
      a,
      l
    );
  }
  function Rd(e, t, a, l, u) {
    a = a.render;
    var o = t.ref;
    if ("ref" in l) {
      var f = {};
      for (var v in l)
        v !== "ref" && (f[v] = l[v]);
    } else f = l;
    return za(t), l = br(
      e,
      t,
      a,
      f,
      o,
      u
    ), v = _r(), e !== null && !Fe ? (Sr(e, t, u), gn(e, t, u)) : (Se && v && er(t), t.flags |= 1, ot(e, t, l, u), t.child);
  }
  function qd(e, t, a, l, u) {
    if (e === null) {
      var o = a.type;
      return typeof o == "function" && !Iu(o) && o.defaultProps === void 0 && a.compare === null ? (t.tag = 15, t.type = o, Ud(
        e,
        t,
        o,
        l,
        u
      )) : (e = es(
        a.type,
        null,
        l,
        t,
        t.mode,
        u
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (o = e.child, !Kr(e, u)) {
      var f = o.memoizedProps;
      if (a = a.compare, a = a !== null ? a : Vi, a(f, l) && e.ref === t.ref)
        return gn(e, t, u);
    }
    return t.flags |= 1, e = dn(o, l), e.ref = t.ref, e.return = t, t.child = e;
  }
  function Ud(e, t, a, l, u) {
    if (e !== null) {
      var o = e.memoizedProps;
      if (Vi(o, l) && e.ref === t.ref)
        if (Fe = !1, t.pendingProps = l = o, Kr(e, u))
          (e.flags & 131072) !== 0 && (Fe = !0);
        else
          return t.lanes = e.lanes, gn(e, t, u);
    }
    return kr(
      e,
      t,
      a,
      l,
      u
    );
  }
  function Zd(e, t, a, l) {
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
        return Qd(
          e,
          t,
          o,
          a,
          l
        );
      }
      if ((a & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && is(
          t,
          o !== null ? o.cachePool : null
        ), o !== null ? Hf(t, o) : pr(), Bf(t);
      else
        return l = t.lanes = 536870912, Qd(
          e,
          t,
          o !== null ? o.baseLanes | a : a,
          a,
          l
        );
    } else
      o !== null ? (is(t, o.cachePool), Hf(t, o), Kn(), t.memoizedState = null) : (e !== null && is(t, null), pr(), Kn());
    return ot(e, t, u, a), t.child;
  }
  function ol(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function Qd(e, t, a, l, u) {
    var o = or();
    return o = o === null ? null : { parent: Ve._currentValue, pool: o }, t.memoizedState = {
      baseLanes: a,
      cachePool: o
    }, e !== null && is(t, null), pr(), Bf(t), e !== null && ai(e, t, l, !0), t.childLanes = u, null;
  }
  function _s(e, t) {
    return t = zs(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function kd(e, t, a) {
    return Ea(t, e.child, null, a), e = _s(t, t.pendingProps), e.flags |= 2, Nt(t), t.memoizedState = null, e;
  }
  function Ry(e, t, a) {
    var l = t.pendingProps, u = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (Se) {
        if (l.mode === "hidden")
          return e = _s(t, l), t.lanes = 536870912, ol(null, e);
        if (yr(t), (e = qe) ? (e = Ih(
          e,
          Lt
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Qn !== null ? { id: an, overflow: ln } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = zf(e), a.return = t, t.child = a, ut = t, qe = null)) : e = null, e === null) throw Hn(t);
        return t.lanes = 536870912, null;
      }
      return _s(t, l);
    }
    var o = e.memoizedState;
    if (o !== null) {
      var f = o.dehydrated;
      if (yr(t), u)
        if (t.flags & 256)
          t.flags &= -257, t = kd(
            e,
            t,
            a
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(r(558));
      else if (Fe || ai(e, t, a, !1), u = (a & e.childLanes) !== 0, Fe || u) {
        if (l = Re, l !== null && (f = Ac(l, a), f !== 0 && f !== o.retryLane))
          throw o.retryLane = f, ga(e, f), jt(l, e, f), Qr;
        Ns(), t = kd(
          e,
          t,
          a
        );
      } else
        e = o.treeContext, qe = Yt(f.nextSibling), ut = t, Se = !0, kn = null, Lt = !1, e !== null && xf(t, e), t = _s(t, l), t.flags |= 4096;
      return t;
    }
    return e = dn(e.child, {
      mode: l.mode,
      children: l.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function Ss(e, t) {
    var a = t.ref;
    if (a === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof a != "function" && typeof a != "object")
        throw Error(r(284));
      (e === null || e.ref !== a) && (t.flags |= 4194816);
    }
  }
  function kr(e, t, a, l, u) {
    return za(t), a = br(
      e,
      t,
      a,
      l,
      void 0,
      u
    ), l = _r(), e !== null && !Fe ? (Sr(e, t, u), gn(e, t, u)) : (Se && l && er(t), t.flags |= 1, ot(e, t, a, u), t.child);
  }
  function Hd(e, t, a, l, u, o) {
    return za(t), t.updateQueue = null, a = Lf(
      t,
      l,
      a,
      u
    ), $f(e), l = _r(), e !== null && !Fe ? (Sr(e, t, o), gn(e, t, o)) : (Se && l && er(t), t.flags |= 1, ot(e, t, a, o), t.child);
  }
  function Bd(e, t, a, l, u) {
    if (za(t), t.stateNode === null) {
      var o = Pa, f = a.contextType;
      typeof f == "object" && f !== null && (o = rt(f)), o = new a(l, o), t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, o.updater = Ur, t.stateNode = o, o._reactInternals = t, o = t.stateNode, o.props = l, o.state = t.memoizedState, o.refs = {}, fr(t), f = a.contextType, o.context = typeof f == "object" && f !== null ? rt(f) : Pa, o.state = t.memoizedState, f = a.getDerivedStateFromProps, typeof f == "function" && (qr(
        t,
        a,
        f,
        l
      ), o.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (f = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), f !== o.state && Ur.enqueueReplaceState(o, o.state, null), il(t, l, o, u), al(), o.state = t.memoizedState), typeof o.componentDidMount == "function" && (t.flags |= 4194308), l = !0;
    } else if (e === null) {
      o = t.stateNode;
      var v = t.memoizedProps, b = Aa(a, v);
      o.props = b;
      var T = o.context, R = a.contextType;
      f = Pa, typeof R == "object" && R !== null && (f = rt(R));
      var Q = a.getDerivedStateFromProps;
      R = typeof Q == "function" || typeof o.getSnapshotBeforeUpdate == "function", v = t.pendingProps !== v, R || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (v || T !== f) && Td(
        t,
        o,
        l,
        f
      ), $n = !1;
      var O = t.memoizedState;
      o.state = O, il(t, l, o, u), al(), T = t.memoizedState, v || O !== T || $n ? (typeof Q == "function" && (qr(
        t,
        a,
        Q,
        l
      ), T = t.memoizedState), (b = $n || Ed(
        t,
        a,
        b,
        l,
        O,
        T,
        f
      )) ? (R || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = l, t.memoizedState = T), o.props = l, o.state = T, o.context = f, l = b) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), l = !1);
    } else {
      o = t.stateNode, dr(e, t), f = t.memoizedProps, R = Aa(a, f), o.props = R, Q = t.pendingProps, O = o.context, T = a.contextType, b = Pa, typeof T == "object" && T !== null && (b = rt(T)), v = a.getDerivedStateFromProps, (T = typeof v == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (f !== Q || O !== b) && Td(
        t,
        o,
        l,
        b
      ), $n = !1, O = t.memoizedState, o.state = O, il(t, l, o, u), al();
      var M = t.memoizedState;
      f !== Q || O !== M || $n || e !== null && e.dependencies !== null && ns(e.dependencies) ? (typeof v == "function" && (qr(
        t,
        a,
        v,
        l
      ), M = t.memoizedState), (R = $n || Ed(
        t,
        a,
        R,
        l,
        O,
        M,
        b
      ) || e !== null && e.dependencies !== null && ns(e.dependencies)) ? (T || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(l, M, b), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(
        l,
        M,
        b
      )), typeof o.componentDidUpdate == "function" && (t.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 1024), t.memoizedProps = l, t.memoizedState = M), o.props = l, o.state = M, o.context = b, l = R) : (typeof o.componentDidUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || f === e.memoizedProps && O === e.memoizedState || (t.flags |= 1024), l = !1);
    }
    return o = l, Ss(e, t), l = (t.flags & 128) !== 0, o || l ? (o = t.stateNode, a = l && typeof a.getDerivedStateFromError != "function" ? null : o.render(), t.flags |= 1, e !== null && l ? (t.child = Ea(
      t,
      e.child,
      null,
      u
    ), t.child = Ea(
      t,
      null,
      a,
      u
    )) : ot(e, t, a, u), t.memoizedState = o.state, e = t.child) : e = gn(
      e,
      t,
      u
    ), e;
  }
  function $d(e, t, a, l) {
    return _a(), t.flags |= 256, ot(e, t, a, l), t.child;
  }
  var Hr = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Br(e) {
    return { baseLanes: e, cachePool: Nf() };
  }
  function $r(e, t, a) {
    return e = e !== null ? e.childLanes & ~a : 0, t && (e |= Dt), e;
  }
  function Ld(e, t, a) {
    var l = t.pendingProps, u = !1, o = (t.flags & 128) !== 0, f;
    if ((f = o) || (f = e !== null && e.memoizedState === null ? !1 : (Ye.current & 2) !== 0), f && (u = !0, t.flags &= -129), f = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (Se) {
        if (u ? Yn(t) : Kn(), (e = qe) ? (e = Ih(
          e,
          Lt
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Qn !== null ? { id: an, overflow: ln } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, a = zf(e), a.return = t, t.child = a, ut = t, qe = null)) : e = null, e === null) throw Hn(t);
        return xo(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var v = l.children;
      return l = l.fallback, u ? (Kn(), u = t.mode, v = zs(
        { mode: "hidden", children: v },
        u
      ), l = ba(
        l,
        u,
        a,
        null
      ), v.return = t, l.return = t, v.sibling = l, t.child = v, l = t.child, l.memoizedState = Br(a), l.childLanes = $r(
        e,
        f,
        a
      ), t.memoizedState = Hr, ol(null, l)) : (Yn(t), Lr(t, v));
    }
    var b = e.memoizedState;
    if (b !== null && (v = b.dehydrated, v !== null)) {
      if (o)
        t.flags & 256 ? (Yn(t), t.flags &= -257, t = Gr(
          e,
          t,
          a
        )) : t.memoizedState !== null ? (Kn(), t.child = e.child, t.flags |= 128, t = null) : (Kn(), v = l.fallback, u = t.mode, l = zs(
          { mode: "visible", children: l.children },
          u
        ), v = ba(
          v,
          u,
          a,
          null
        ), v.flags |= 2, l.return = t, v.return = t, l.sibling = v, t.child = l, Ea(
          t,
          e.child,
          null,
          a
        ), l = t.child, l.memoizedState = Br(a), l.childLanes = $r(
          e,
          f,
          a
        ), t.memoizedState = Hr, t = ol(null, l));
      else if (Yn(t), xo(v)) {
        if (f = v.nextSibling && v.nextSibling.dataset, f) var T = f.dgst;
        f = T, l = Error(r(419)), l.stack = "", l.digest = f, Ii({ value: l, source: null, stack: null }), t = Gr(
          e,
          t,
          a
        );
      } else if (Fe || ai(e, t, a, !1), f = (a & e.childLanes) !== 0, Fe || f) {
        if (f = Re, f !== null && (l = Ac(f, a), l !== 0 && l !== b.retryLane))
          throw b.retryLane = l, ga(e, l), jt(f, e, l), Qr;
        jo(v) || Ns(), t = Gr(
          e,
          t,
          a
        );
      } else
        jo(v) ? (t.flags |= 192, t.child = e.child, t = null) : (e = b.treeContext, qe = Yt(
          v.nextSibling
        ), ut = t, Se = !0, kn = null, Lt = !1, e !== null && xf(t, e), t = Lr(
          t,
          l.children
        ), t.flags |= 4096);
      return t;
    }
    return u ? (Kn(), v = l.fallback, u = t.mode, b = e.child, T = b.sibling, l = dn(b, {
      mode: "hidden",
      children: l.children
    }), l.subtreeFlags = b.subtreeFlags & 65011712, T !== null ? v = dn(
      T,
      v
    ) : (v = ba(
      v,
      u,
      a,
      null
    ), v.flags |= 2), v.return = t, l.return = t, l.sibling = v, t.child = l, ol(null, l), l = t.child, v = e.child.memoizedState, v === null ? v = Br(a) : (u = v.cachePool, u !== null ? (b = Ve._currentValue, u = u.parent !== b ? { parent: b, pool: b } : u) : u = Nf(), v = {
      baseLanes: v.baseLanes | a,
      cachePool: u
    }), l.memoizedState = v, l.childLanes = $r(
      e,
      f,
      a
    ), t.memoizedState = Hr, ol(e.child, l)) : (Yn(t), a = e.child, e = a.sibling, a = dn(a, {
      mode: "visible",
      children: l.children
    }), a.return = t, a.sibling = null, e !== null && (f = t.deletions, f === null ? (t.deletions = [e], t.flags |= 16) : f.push(e)), t.child = a, t.memoizedState = null, a);
  }
  function Lr(e, t) {
    return t = zs(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function zs(e, t) {
    return e = Ot(22, e, null, t), e.lanes = 0, e;
  }
  function Gr(e, t, a) {
    return Ea(t, e.child, null, a), e = Lr(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Gd(e, t, a) {
    e.lanes |= t;
    var l = e.alternate;
    l !== null && (l.lanes |= t), lr(e.return, t, a);
  }
  function Yr(e, t, a, l, u, o) {
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
  function Yd(e, t, a) {
    var l = t.pendingProps, u = l.revealOrder, o = l.tail;
    l = l.children;
    var f = Ye.current, v = (f & 2) !== 0;
    if (v ? (f = f & 1 | 2, t.flags |= 128) : f &= 1, X(Ye, f), ot(e, t, l, a), l = Se ? Fi : 0, !v && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Gd(e, a, t);
        else if (e.tag === 19)
          Gd(e, a, t);
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
          e = a.alternate, e !== null && cs(e) === null && (u = a), a = a.sibling;
        a = u, a === null ? (u = t.child, t.child = null) : (u = a.sibling, a.sibling = null), Yr(
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
          if (e = u.alternate, e !== null && cs(e) === null) {
            t.child = u;
            break;
          }
          e = u.sibling, u.sibling = a, a = u, u = e;
        }
        Yr(
          t,
          !0,
          a,
          null,
          o,
          l
        );
        break;
      case "together":
        Yr(
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
    if (e !== null && (t.dependencies = e.dependencies), Jn |= t.lanes, (a & t.childLanes) === 0)
      if (e !== null) {
        if (ai(
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
  function Kr(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && ns(e)));
  }
  function qy(e, t, a) {
    switch (t.tag) {
      case 3:
        at(t, t.stateNode.containerInfo), Bn(t, Ve, e.memoizedState.cache), _a();
        break;
      case 27:
      case 5:
        Dn(t);
        break;
      case 4:
        at(t, t.stateNode.containerInfo);
        break;
      case 10:
        Bn(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, yr(t), null;
        break;
      case 13:
        var l = t.memoizedState;
        if (l !== null)
          return l.dehydrated !== null ? (Yn(t), t.flags |= 128, null) : (a & t.child.childLanes) !== 0 ? Ld(e, t, a) : (Yn(t), e = gn(
            e,
            t,
            a
          ), e !== null ? e.sibling : null);
        Yn(t);
        break;
      case 19:
        var u = (e.flags & 128) !== 0;
        if (l = (a & t.childLanes) !== 0, l || (ai(
          e,
          t,
          a,
          !1
        ), l = (a & t.childLanes) !== 0), u) {
          if (l)
            return Yd(
              e,
              t,
              a
            );
          t.flags |= 128;
        }
        if (u = t.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), X(Ye, Ye.current), l) break;
        return null;
      case 22:
        return t.lanes = 0, Zd(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        Bn(t, Ve, e.memoizedState.cache);
    }
    return gn(e, t, a);
  }
  function Kd(e, t, a) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        Fe = !0;
      else {
        if (!Kr(e, a) && (t.flags & 128) === 0)
          return Fe = !1, qy(
            e,
            t,
            a
          );
        Fe = (e.flags & 131072) !== 0;
      }
    else
      Fe = !1, Se && (t.flags & 1048576) !== 0 && jf(t, Fi, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var l = t.pendingProps;
          if (e = ja(t.elementType), t.type = e, typeof e == "function")
            Iu(e) ? (l = Aa(e, l), t.tag = 1, t = Bd(
              null,
              t,
              e,
              l,
              a
            )) : (t.tag = 0, t = kr(
              null,
              t,
              e,
              l,
              a
            ));
          else {
            if (e != null) {
              var u = e.$$typeof;
              if (u === ee) {
                t.tag = 11, t = Rd(
                  null,
                  t,
                  e,
                  l,
                  a
                );
                break e;
              } else if (u === A) {
                t.tag = 14, t = qd(
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
        return kr(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 1:
        return l = t.type, u = Aa(
          l,
          t.pendingProps
        ), Bd(
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
          u = o.element, dr(e, t), il(t, l, null, a);
          var f = t.memoizedState;
          if (l = f.cache, Bn(t, Ve, l), l !== o.cache && sr(
            t,
            [Ve],
            a,
            !0
          ), al(), l = f.element, o.isDehydrated)
            if (o = {
              element: l,
              isDehydrated: !1,
              cache: f.cache
            }, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
              t = $d(
                e,
                t,
                l,
                a
              );
              break e;
            } else if (l !== u) {
              u = Ht(
                Error(r(424)),
                t
              ), Ii(u), t = $d(
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
              for (qe = Yt(e.firstChild), ut = t, Se = !0, kn = null, Lt = !0, a = Zf(
                t,
                null,
                l,
                a
              ), t.child = a; a; )
                a.flags = a.flags & -3 | 4096, a = a.sibling;
            }
          else {
            if (_a(), l === u) {
              t = gn(
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
        return Ss(e, t), e === null ? (a = am(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = a : Se || (a = t.type, e = t.pendingProps, l = Qs(
          fe.current
        ).createElement(a), l[st] = t, l[gt] = e, ct(l, a, e), it(l), t.stateNode = l) : t.memoizedState = am(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return Dn(t), e === null && Se && (l = t.stateNode = em(
          t.type,
          t.pendingProps,
          fe.current
        ), ut = t, Lt = !0, u = qe, ea(t.type) ? (Eo = u, qe = Yt(l.firstChild)) : qe = u), ot(
          e,
          t,
          t.pendingProps.children,
          a
        ), Ss(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && Se && ((u = l = qe) && (l = fg(
          l,
          t.type,
          t.pendingProps,
          Lt
        ), l !== null ? (t.stateNode = l, ut = t, qe = Yt(l.firstChild), Lt = !1, u = !0) : u = !1), u || Hn(t)), Dn(t), u = t.type, o = t.pendingProps, f = e !== null ? e.memoizedProps : null, l = o.children, So(u, o) ? l = null : f !== null && So(u, f) && (t.flags |= 32), t.memoizedState !== null && (u = br(
          e,
          t,
          Ey,
          null,
          null,
          a
        ), jl._currentValue = u), Ss(e, t), ot(e, t, l, a), t.child;
      case 6:
        return e === null && Se && ((e = a = qe) && (a = dg(
          a,
          t.pendingProps,
          Lt
        ), a !== null ? (t.stateNode = a, ut = t, qe = null, e = !0) : e = !1), e || Hn(t)), null;
      case 13:
        return Ld(e, t, a);
      case 4:
        return at(
          t,
          t.stateNode.containerInfo
        ), l = t.pendingProps, e === null ? t.child = Ea(
          t,
          null,
          l,
          a
        ) : ot(e, t, l, a), t.child;
      case 11:
        return Rd(
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
        return l = t.pendingProps, Bn(t, t.type, l.value), ot(e, t, l.children, a), t.child;
      case 9:
        return u = t.type._context, l = t.pendingProps.children, za(t), u = rt(u), l = l(u), t.flags |= 1, ot(e, t, l, a), t.child;
      case 14:
        return qd(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 15:
        return Ud(
          e,
          t,
          t.type,
          t.pendingProps,
          a
        );
      case 19:
        return Yd(e, t, a);
      case 31:
        return Ry(e, t, a);
      case 22:
        return Zd(
          e,
          t,
          a,
          t.pendingProps
        );
      case 24:
        return za(t), l = rt(Ve), e === null ? (u = or(), u === null && (u = Re, o = ur(), u.pooledCache = o, o.refCount++, o !== null && (u.pooledCacheLanes |= a), u = o), t.memoizedState = { parent: l, cache: u }, fr(t), Bn(t, Ve, u)) : ((e.lanes & a) !== 0 && (dr(e, t), il(t, null, null, a), al()), u = e.memoizedState, o = t.memoizedState, u.parent !== l ? (u = { parent: l, cache: l }, t.memoizedState = u, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = u), Bn(t, Ve, l)) : (l = o.cache, Bn(t, Ve, l), l !== u.cache && sr(
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
  function bn(e) {
    e.flags |= 4;
  }
  function Xr(e, t, a, l, u) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (u & 335544128) === u)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (bh()) e.flags |= 8192;
        else
          throw xa = ss, cr;
    } else e.flags &= -16777217;
  }
  function Xd(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !rm(t))
      if (bh()) e.flags |= 8192;
      else
        throw xa = ss, cr;
  }
  function ws(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? xc() : 536870912, e.lanes |= t, pi |= t);
  }
  function cl(e, t) {
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
  function Uy(e, t, a) {
    var l = t.pendingProps;
    switch (tr(t), t.tag) {
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
        return a = t.stateNode, l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), pn(Ve), Ze(), a.pendingContext && (a.context = a.pendingContext, a.pendingContext = null), (e === null || e.child === null) && (ni(t) ? bn(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, ar())), Ue(t), null;
      case 26:
        var u = t.type, o = t.memoizedState;
        return e === null ? (bn(t), o !== null ? (Ue(t), Xd(t, o)) : (Ue(t), Xr(
          t,
          u,
          null,
          l,
          a
        ))) : o ? o !== e.memoizedState ? (bn(t), Ue(t), Xd(t, o)) : (Ue(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== l && bn(t), Ue(t), Xr(
          t,
          u,
          e,
          l,
          a
        )), null;
      case 27:
        if (fa(t), a = fe.current, u = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && bn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return Ue(t), null;
          }
          e = F.current, ni(t) ? Ef(t) : (e = em(u, l, a), t.stateNode = e, bn(t));
        }
        return Ue(t), null;
      case 5:
        if (fa(t), u = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && bn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(r(166));
            return Ue(t), null;
          }
          if (o = F.current, ni(t))
            Ef(t);
          else {
            var f = Qs(
              fe.current
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
            o[st] = t, o[gt] = l;
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
            l && bn(t);
          }
        }
        return Ue(t), Xr(
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
          if (e = fe.current, ni(t)) {
            if (e = t.stateNode, a = t.memoizedProps, l = null, u = ut, u !== null)
              switch (u.tag) {
                case 27:
                case 5:
                  l = u.memoizedProps;
              }
            e[st] = t, e = !!(e.nodeValue === a || l !== null && l.suppressHydrationWarning === !0 || Lh(e.nodeValue, a)), e || Hn(t, !0);
          } else
            e = Qs(e).createTextNode(
              l
            ), e[st] = t, t.stateNode = e;
        }
        return Ue(t), null;
      case 31:
        if (a = t.memoizedState, e === null || e.memoizedState !== null) {
          if (l = ni(t), a !== null) {
            if (e === null) {
              if (!l) throw Error(r(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(557));
              e[st] = t;
            } else
              _a(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Ue(t), e = !1;
          } else
            a = ar(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), e = !0;
          if (!e)
            return t.flags & 256 ? (Nt(t), t) : (Nt(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(r(558));
        }
        return Ue(t), null;
      case 13:
        if (l = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (u = ni(t), l !== null && l.dehydrated !== null) {
            if (e === null) {
              if (!u) throw Error(r(318));
              if (u = t.memoizedState, u = u !== null ? u.dehydrated : null, !u) throw Error(r(317));
              u[st] = t;
            } else
              _a(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            Ue(t), u = !1;
          } else
            u = ar(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = u), u = !0;
          if (!u)
            return t.flags & 256 ? (Nt(t), t) : (Nt(t), null);
        }
        return Nt(t), (t.flags & 128) !== 0 ? (t.lanes = a, t) : (a = l !== null, e = e !== null && e.memoizedState !== null, a && (l = t.child, u = null, l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (u = l.alternate.memoizedState.cachePool.pool), o = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (o = l.memoizedState.cachePool.pool), o !== u && (l.flags |= 2048)), a !== e && a && (t.child.flags |= 8192), ws(t, t.updateQueue), Ue(t), null);
      case 4:
        return Ze(), e === null && vo(t.stateNode.containerInfo), Ue(t), null;
      case 10:
        return pn(t.type), Ue(t), null;
      case 19:
        if (Z(Ye), l = t.memoizedState, l === null) return Ue(t), null;
        if (u = (t.flags & 128) !== 0, o = l.rendering, o === null)
          if (u) cl(l, !1);
          else {
            if (Ge !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (o = cs(e), o !== null) {
                  for (t.flags |= 128, cl(l, !1), e = o.updateQueue, t.updateQueue = e, ws(t, e), t.subtreeFlags = 0, e = a, a = t.child; a !== null; )
                    Sf(a, e), a = a.sibling;
                  return X(
                    Ye,
                    Ye.current & 1 | 2
                  ), Se && hn(t, l.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            l.tail !== null && ht() > As && (t.flags |= 128, u = !0, cl(l, !1), t.lanes = 4194304);
          }
        else {
          if (!u)
            if (e = cs(o), e !== null) {
              if (t.flags |= 128, u = !0, e = e.updateQueue, t.updateQueue = e, ws(t, e), cl(l, !0), l.tail === null && l.tailMode === "hidden" && !o.alternate && !Se)
                return Ue(t), null;
            } else
              2 * ht() - l.renderingStartTime > As && a !== 536870912 && (t.flags |= 128, u = !0, cl(l, !1), t.lanes = 4194304);
          l.isBackwards ? (o.sibling = t.child, t.child = o) : (e = l.last, e !== null ? e.sibling = o : t.child = o, l.last = o);
        }
        return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = ht(), e.sibling = null, a = Ye.current, X(
          Ye,
          u ? a & 1 | 2 : a & 1
        ), Se && hn(t, l.treeForkCount), e) : (Ue(t), null);
      case 22:
      case 23:
        return Nt(t), vr(), l = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192), l ? (a & 536870912) !== 0 && (t.flags & 128) === 0 && (Ue(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Ue(t), a = t.updateQueue, a !== null && ws(t, a.retryQueue), a = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== a && (t.flags |= 2048), e !== null && Z(wa), null;
      case 24:
        return a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), pn(Ve), Ue(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(r(156, t.tag));
  }
  function Zy(e, t) {
    switch (tr(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return pn(Ve), Ze(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return fa(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Nt(t), t.alternate === null)
            throw Error(r(340));
          _a();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Nt(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(r(340));
          _a();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return Z(Ye), null;
      case 4:
        return Ze(), null;
      case 10:
        return pn(t.type), null;
      case 22:
      case 23:
        return Nt(t), vr(), e !== null && Z(wa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return pn(Ve), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Vd(e, t) {
    switch (tr(t), t.tag) {
      case 3:
        pn(Ve), Ze();
        break;
      case 26:
      case 27:
      case 5:
        fa(t);
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
        Z(Ye);
        break;
      case 10:
        pn(t.type);
        break;
      case 22:
      case 23:
        Nt(t), vr(), e !== null && Z(wa);
        break;
      case 24:
        pn(Ve);
    }
  }
  function fl(e, t) {
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
    } catch (v) {
      Ae(t, t.return, v);
    }
  }
  function Xn(e, t, a) {
    try {
      var l = t.updateQueue, u = l !== null ? l.lastEffect : null;
      if (u !== null) {
        var o = u.next;
        l = o;
        do {
          if ((l.tag & e) === e) {
            var f = l.inst, v = f.destroy;
            if (v !== void 0) {
              f.destroy = void 0, u = t;
              var b = a, T = v;
              try {
                T();
              } catch (R) {
                Ae(
                  u,
                  b,
                  R
                );
              }
            }
          }
          l = l.next;
        } while (l !== o);
      }
    } catch (R) {
      Ae(t, t.return, R);
    }
  }
  function Jd(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var a = e.stateNode;
      try {
        kf(t, a);
      } catch (l) {
        Ae(e, e.return, l);
      }
    }
  }
  function Fd(e, t, a) {
    a.props = Aa(
      e.type,
      e.memoizedProps
    ), a.state = e.memoizedState;
    try {
      a.componentWillUnmount();
    } catch (l) {
      Ae(e, t, l);
    }
  }
  function dl(e, t) {
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
  function sn(e, t) {
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
  function Id(e) {
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
  function Vr(e, t, a) {
    try {
      var l = e.stateNode;
      lg(l, e.type, a, t), l[gt] = t;
    } catch (u) {
      Ae(e, e.return, u);
    }
  }
  function Wd(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && ea(e.type) || e.tag === 4;
  }
  function Jr(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Wd(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && ea(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Fr(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? (a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a).insertBefore(e, t) : (t = a.nodeType === 9 ? a.body : a.nodeName === "HTML" ? a.ownerDocument.body : a, t.appendChild(e), a = a._reactRootContainer, a != null || t.onclick !== null || (t.onclick = cn));
    else if (l !== 4 && (l === 27 && ea(e.type) && (a = e.stateNode, t = null), e = e.child, e !== null))
      for (Fr(e, t, a), e = e.sibling; e !== null; )
        Fr(e, t, a), e = e.sibling;
  }
  function js(e, t, a) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? a.insertBefore(e, t) : a.appendChild(e);
    else if (l !== 4 && (l === 27 && ea(e.type) && (a = e.stateNode), e = e.child, e !== null))
      for (js(e, t, a), e = e.sibling; e !== null; )
        js(e, t, a), e = e.sibling;
  }
  function Pd(e) {
    var t = e.stateNode, a = e.memoizedProps;
    try {
      for (var l = e.type, u = t.attributes; u.length; )
        t.removeAttributeNode(u[0]);
      ct(t, l, a), t[st] = e, t[gt] = a;
    } catch (o) {
      Ae(e, e.return, o);
    }
  }
  var _n = !1, Ie = !1, Ir = !1, eh = typeof WeakSet == "function" ? WeakSet : Set, lt = null;
  function Qy(e, t) {
    if (e = e.containerInfo, bo = Ys, e = df(e), Gu(e)) {
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
            var f = 0, v = -1, b = -1, T = 0, R = 0, Q = e, O = null;
            t: for (; ; ) {
              for (var M; Q !== a || u !== 0 && Q.nodeType !== 3 || (v = f + u), Q !== o || l !== 0 && Q.nodeType !== 3 || (b = f + l), Q.nodeType === 3 && (f += Q.nodeValue.length), (M = Q.firstChild) !== null; )
                O = Q, Q = M;
              for (; ; ) {
                if (Q === e) break t;
                if (O === a && ++T === u && (v = f), O === o && ++R === l && (b = f), (M = Q.nextSibling) !== null) break;
                Q = O, O = Q.parentNode;
              }
              Q = M;
            }
            a = v === -1 || b === -1 ? null : { start: v, end: b };
          } else a = null;
        }
      a = a || { start: 0, end: 0 };
    } else a = null;
    for (_o = { focusedElem: e, selectionRange: a }, Ys = !1, lt = t; lt !== null; )
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
                  var I = Aa(
                    a.type,
                    u
                  );
                  e = l.getSnapshotBeforeUpdate(
                    I,
                    o
                  ), l.__reactInternalSnapshotBeforeUpdate = e;
                } catch (le) {
                  Ae(
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
                  wo(e);
                else if (a === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      wo(e);
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
  function th(e, t, a) {
    var l = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        zn(e, a), l & 4 && fl(5, a);
        break;
      case 1:
        if (zn(e, a), l & 4)
          if (e = a.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (f) {
              Ae(a, a.return, f);
            }
          else {
            var u = Aa(
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
        l & 64 && Jd(a), l & 512 && dl(a, a.return);
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
            kf(e, t);
          } catch (f) {
            Ae(a, a.return, f);
          }
        }
        break;
      case 27:
        t === null && l & 4 && Pd(a);
      case 26:
      case 5:
        zn(e, a), t === null && l & 4 && Id(a), l & 512 && dl(a, a.return);
        break;
      case 12:
        zn(e, a);
        break;
      case 31:
        zn(e, a), l & 4 && ih(e, a);
        break;
      case 13:
        zn(e, a), l & 4 && lh(e, a), l & 64 && (e = a.memoizedState, e !== null && (e = e.dehydrated, e !== null && (a = Xy.bind(
          null,
          a
        ), hg(e, a))));
        break;
      case 22:
        if (l = a.memoizedState !== null || _n, !l) {
          t = t !== null && t.memoizedState !== null || Ie, u = _n;
          var o = Ie;
          _n = l, (Ie = t) && !o ? wn(
            e,
            a,
            (a.subtreeFlags & 8772) !== 0
          ) : zn(e, a), _n = u, Ie = o;
        }
        break;
      case 30:
        break;
      default:
        zn(e, a);
    }
  }
  function nh(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, nh(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Tu(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var Qe = null, _t = !1;
  function Sn(e, t, a) {
    for (a = a.child; a !== null; )
      ah(e, t, a), a = a.sibling;
  }
  function ah(e, t, a) {
    if (Et && typeof Et.onCommitFiberUnmount == "function")
      try {
        Et.onCommitFiberUnmount(Ui, a);
      } catch {
      }
    switch (a.tag) {
      case 26:
        Ie || sn(a, t), Sn(
          e,
          t,
          a
        ), a.memoizedState ? a.memoizedState.count-- : a.stateNode && (a = a.stateNode, a.parentNode.removeChild(a));
        break;
      case 27:
        Ie || sn(a, t);
        var l = Qe, u = _t;
        ea(a.type) && (Qe = a.stateNode, _t = !1), Sn(
          e,
          t,
          a
        ), Sl(a.stateNode), Qe = l, _t = u;
        break;
      case 5:
        Ie || sn(a, t);
      case 6:
        if (l = Qe, u = _t, Qe = null, Sn(
          e,
          t,
          a
        ), Qe = l, _t = u, Qe !== null)
          if (_t)
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
        Qe !== null && (_t ? (e = Qe, Jh(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          a.stateNode
        ), wi(e)) : Jh(Qe, a.stateNode));
        break;
      case 4:
        l = Qe, u = _t, Qe = a.stateNode.containerInfo, _t = !0, Sn(
          e,
          t,
          a
        ), Qe = l, _t = u;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Xn(2, a, t), Ie || Xn(4, a, t), Sn(
          e,
          t,
          a
        );
        break;
      case 1:
        Ie || (sn(a, t), l = a.stateNode, typeof l.componentWillUnmount == "function" && Fd(
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
        Ie = (l = Ie) || a.memoizedState !== null, Sn(
          e,
          t,
          a
        ), Ie = l;
        break;
      default:
        Sn(
          e,
          t,
          a
        );
    }
  }
  function ih(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        wi(e);
      } catch (a) {
        Ae(t, t.return, a);
      }
    }
  }
  function lh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        wi(e);
      } catch (a) {
        Ae(t, t.return, a);
      }
  }
  function ky(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new eh()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new eh()), t;
      default:
        throw Error(r(435, e.tag));
    }
  }
  function xs(e, t) {
    var a = ky(e);
    t.forEach(function(l) {
      if (!a.has(l)) {
        a.add(l);
        var u = Vy.bind(null, e, l);
        l.then(u, u);
      }
    });
  }
  function St(e, t) {
    var a = t.deletions;
    if (a !== null)
      for (var l = 0; l < a.length; l++) {
        var u = a[l], o = e, f = t, v = f;
        e: for (; v !== null; ) {
          switch (v.tag) {
            case 27:
              if (ea(v.type)) {
                Qe = v.stateNode, _t = !1;
                break e;
              }
              break;
            case 5:
              Qe = v.stateNode, _t = !1;
              break e;
            case 3:
            case 4:
              Qe = v.stateNode.containerInfo, _t = !0;
              break e;
          }
          v = v.return;
        }
        if (Qe === null) throw Error(r(160));
        ah(o, f, u), Qe = null, _t = !1, o = u.alternate, o !== null && (o.return = null), u.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        sh(t, e), t = t.sibling;
  }
  var Pt = null;
  function sh(e, t) {
    var a = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        St(t, e), zt(e), l & 4 && (Xn(3, e, e.return), fl(3, e), Xn(5, e, e.return));
        break;
      case 1:
        St(t, e), zt(e), l & 512 && (Ie || a === null || sn(a, a.return)), l & 64 && _n && (e = e.updateQueue, e !== null && (l = e.callbacks, l !== null && (a = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = a === null ? l : a.concat(l))));
        break;
      case 26:
        var u = Pt;
        if (St(t, e), zt(e), l & 512 && (Ie || a === null || sn(a, a.return)), l & 4) {
          var o = a !== null ? a.memoizedState : null;
          if (l = e.memoizedState, a === null)
            if (l === null)
              if (e.stateNode === null) {
                e: {
                  l = e.type, a = e.memoizedProps, u = u.ownerDocument || u;
                  t: switch (l) {
                    case "title":
                      o = u.getElementsByTagName("title")[0], (!o || o[ki] || o[st] || o.namespaceURI === "http://www.w3.org/2000/svg" || o.hasAttribute("itemprop")) && (o = u.createElement(l), u.head.insertBefore(
                        o,
                        u.querySelector("head > title")
                      )), ct(o, l, a), o[st] = e, it(o), l = o;
                      break e;
                    case "link":
                      var f = sm(
                        "link",
                        "href",
                        u
                      ).get(l + (a.href || ""));
                      if (f) {
                        for (var v = 0; v < f.length; v++)
                          if (o = f[v], o.getAttribute("href") === (a.href == null || a.href === "" ? null : a.href) && o.getAttribute("rel") === (a.rel == null ? null : a.rel) && o.getAttribute("title") === (a.title == null ? null : a.title) && o.getAttribute("crossorigin") === (a.crossOrigin == null ? null : a.crossOrigin)) {
                            f.splice(v, 1);
                            break t;
                          }
                      }
                      o = u.createElement(l), ct(o, l, a), u.head.appendChild(o);
                      break;
                    case "meta":
                      if (f = sm(
                        "meta",
                        "content",
                        u
                      ).get(l + (a.content || ""))) {
                        for (v = 0; v < f.length; v++)
                          if (o = f[v], o.getAttribute("content") === (a.content == null ? null : "" + a.content) && o.getAttribute("name") === (a.name == null ? null : a.name) && o.getAttribute("property") === (a.property == null ? null : a.property) && o.getAttribute("http-equiv") === (a.httpEquiv == null ? null : a.httpEquiv) && o.getAttribute("charset") === (a.charSet == null ? null : a.charSet)) {
                            f.splice(v, 1);
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
                um(
                  u,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = lm(
                u,
                l,
                e.memoizedProps
              );
          else
            o !== l ? (o === null ? a.stateNode !== null && (a = a.stateNode, a.parentNode.removeChild(a)) : o.count--, l === null ? um(
              u,
              e.type,
              e.stateNode
            ) : lm(
              u,
              l,
              e.memoizedProps
            )) : l === null && e.stateNode !== null && Vr(
              e,
              e.memoizedProps,
              a.memoizedProps
            );
        }
        break;
      case 27:
        St(t, e), zt(e), l & 512 && (Ie || a === null || sn(a, a.return)), a !== null && l & 4 && Vr(
          e,
          e.memoizedProps,
          a.memoizedProps
        );
        break;
      case 5:
        if (St(t, e), zt(e), l & 512 && (Ie || a === null || sn(a, a.return)), e.flags & 32) {
          u = e.stateNode;
          try {
            Ka(u, "");
          } catch (I) {
            Ae(e, e.return, I);
          }
        }
        l & 4 && e.stateNode != null && (u = e.memoizedProps, Vr(
          e,
          u,
          a !== null ? a.memoizedProps : u
        )), l & 1024 && (Ir = !0);
        break;
      case 6:
        if (St(t, e), zt(e), l & 4) {
          if (e.stateNode === null)
            throw Error(r(162));
          l = e.memoizedProps, a = e.stateNode;
          try {
            a.nodeValue = l;
          } catch (I) {
            Ae(e, e.return, I);
          }
        }
        break;
      case 3:
        if (Bs = null, u = Pt, Pt = ks(t.containerInfo), St(t, e), Pt = u, zt(e), l & 4 && a !== null && a.memoizedState.isDehydrated)
          try {
            wi(t.containerInfo);
          } catch (I) {
            Ae(e, e.return, I);
          }
        Ir && (Ir = !1, uh(e));
        break;
      case 4:
        l = Pt, Pt = ks(
          e.stateNode.containerInfo
        ), St(t, e), zt(e), Pt = l;
        break;
      case 12:
        St(t, e), zt(e);
        break;
      case 31:
        St(t, e), zt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, xs(e, l)));
        break;
      case 13:
        St(t, e), zt(e), e.child.flags & 8192 && e.memoizedState !== null != (a !== null && a.memoizedState !== null) && (Ts = ht()), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, xs(e, l)));
        break;
      case 22:
        u = e.memoizedState !== null;
        var b = a !== null && a.memoizedState !== null, T = _n, R = Ie;
        if (_n = T || u, Ie = R || b, St(t, e), Ie = R, _n = T, zt(e), l & 8192)
          e: for (t = e.stateNode, t._visibility = u ? t._visibility & -2 : t._visibility | 1, u && (a === null || b || _n || Ie || Oa(e)), a = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (a === null) {
                b = a = t;
                try {
                  if (o = b.stateNode, u)
                    f = o.style, typeof f.setProperty == "function" ? f.setProperty("display", "none", "important") : f.display = "none";
                  else {
                    v = b.stateNode;
                    var Q = b.memoizedProps.style, O = Q != null && Q.hasOwnProperty("display") ? Q.display : null;
                    v.style.display = O == null || typeof O == "boolean" ? "" : ("" + O).trim();
                  }
                } catch (I) {
                  Ae(b, b.return, I);
                }
              }
            } else if (t.tag === 6) {
              if (a === null) {
                b = t;
                try {
                  b.stateNode.nodeValue = u ? "" : b.memoizedProps;
                } catch (I) {
                  Ae(b, b.return, I);
                }
              }
            } else if (t.tag === 18) {
              if (a === null) {
                b = t;
                try {
                  var M = b.stateNode;
                  u ? Fh(M, !0) : Fh(b.stateNode, !1);
                } catch (I) {
                  Ae(b, b.return, I);
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
        l & 4 && (l = e.updateQueue, l !== null && (a = l.retryQueue, a !== null && (l.retryQueue = null, xs(e, a))));
        break;
      case 19:
        St(t, e), zt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, xs(e, l)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        St(t, e), zt(e);
    }
  }
  function zt(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var a, l = e.return; l !== null; ) {
          if (Wd(l)) {
            a = l;
            break;
          }
          l = l.return;
        }
        if (a == null) throw Error(r(160));
        switch (a.tag) {
          case 27:
            var u = a.stateNode, o = Jr(e);
            js(e, o, u);
            break;
          case 5:
            var f = a.stateNode;
            a.flags & 32 && (Ka(f, ""), a.flags &= -33);
            var v = Jr(e);
            js(e, v, f);
            break;
          case 3:
          case 4:
            var b = a.stateNode.containerInfo, T = Jr(e);
            Fr(
              e,
              T,
              b
            );
            break;
          default:
            throw Error(r(161));
        }
      } catch (R) {
        Ae(e, e.return, R);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function uh(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        uh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function zn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        th(e, t.alternate, t), t = t.sibling;
  }
  function Oa(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Xn(4, t, t.return), Oa(t);
          break;
        case 1:
          sn(t, t.return);
          var a = t.stateNode;
          typeof a.componentWillUnmount == "function" && Fd(
            t,
            t.return,
            a
          ), Oa(t);
          break;
        case 27:
          Sl(t.stateNode);
        case 26:
        case 5:
          sn(t, t.return), Oa(t);
          break;
        case 22:
          t.memoizedState === null && Oa(t);
          break;
        case 30:
          Oa(t);
          break;
        default:
          Oa(t);
      }
      e = e.sibling;
    }
  }
  function wn(e, t, a) {
    for (a = a && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var l = t.alternate, u = e, o = t, f = o.flags;
      switch (o.tag) {
        case 0:
        case 11:
        case 15:
          wn(
            u,
            o,
            a
          ), fl(4, o);
          break;
        case 1:
          if (wn(
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
            var v = l.stateNode;
            try {
              var b = u.shared.hiddenCallbacks;
              if (b !== null)
                for (u.shared.hiddenCallbacks = null, u = 0; u < b.length; u++)
                  Qf(b[u], v);
            } catch (T) {
              Ae(l, l.return, T);
            }
          }
          a && f & 64 && Jd(o), dl(o, o.return);
          break;
        case 27:
          Pd(o);
        case 26:
        case 5:
          wn(
            u,
            o,
            a
          ), a && l === null && f & 4 && Id(o), dl(o, o.return);
          break;
        case 12:
          wn(
            u,
            o,
            a
          );
          break;
        case 31:
          wn(
            u,
            o,
            a
          ), a && f & 4 && ih(u, o);
          break;
        case 13:
          wn(
            u,
            o,
            a
          ), a && f & 4 && lh(u, o);
          break;
        case 22:
          o.memoizedState === null && wn(
            u,
            o,
            a
          ), dl(o, o.return);
          break;
        case 30:
          break;
        default:
          wn(
            u,
            o,
            a
          );
      }
      t = t.sibling;
    }
  }
  function Wr(e, t) {
    var a = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (a = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== a && (e != null && e.refCount++, a != null && Wi(a));
  }
  function Pr(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Wi(e));
  }
  function en(e, t, a, l) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        rh(
          e,
          t,
          a,
          l
        ), t = t.sibling;
  }
  function rh(e, t, a, l) {
    var u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        en(
          e,
          t,
          a,
          l
        ), u & 2048 && fl(9, t);
        break;
      case 1:
        en(
          e,
          t,
          a,
          l
        );
        break;
      case 3:
        en(
          e,
          t,
          a,
          l
        ), u & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Wi(e)));
        break;
      case 12:
        if (u & 2048) {
          en(
            e,
            t,
            a,
            l
          ), e = t.stateNode;
          try {
            var o = t.memoizedProps, f = o.id, v = o.onPostCommit;
            typeof v == "function" && v(
              f,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (b) {
            Ae(t, t.return, b);
          }
        } else
          en(
            e,
            t,
            a,
            l
          );
        break;
      case 31:
        en(
          e,
          t,
          a,
          l
        );
        break;
      case 13:
        en(
          e,
          t,
          a,
          l
        );
        break;
      case 23:
        break;
      case 22:
        o = t.stateNode, f = t.alternate, t.memoizedState !== null ? o._visibility & 2 ? en(
          e,
          t,
          a,
          l
        ) : hl(e, t) : o._visibility & 2 ? en(
          e,
          t,
          a,
          l
        ) : (o._visibility |= 2, di(
          e,
          t,
          a,
          l,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), u & 2048 && Wr(f, t);
        break;
      case 24:
        en(
          e,
          t,
          a,
          l
        ), u & 2048 && Pr(t.alternate, t);
        break;
      default:
        en(
          e,
          t,
          a,
          l
        );
    }
  }
  function di(e, t, a, l, u) {
    for (u = u && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var o = e, f = t, v = a, b = l, T = f.flags;
      switch (f.tag) {
        case 0:
        case 11:
        case 15:
          di(
            o,
            f,
            v,
            b,
            u
          ), fl(8, f);
          break;
        case 23:
          break;
        case 22:
          var R = f.stateNode;
          f.memoizedState !== null ? R._visibility & 2 ? di(
            o,
            f,
            v,
            b,
            u
          ) : hl(
            o,
            f
          ) : (R._visibility |= 2, di(
            o,
            f,
            v,
            b,
            u
          )), u && T & 2048 && Wr(
            f.alternate,
            f
          );
          break;
        case 24:
          di(
            o,
            f,
            v,
            b,
            u
          ), u && T & 2048 && Pr(f.alternate, f);
          break;
        default:
          di(
            o,
            f,
            v,
            b,
            u
          );
      }
      t = t.sibling;
    }
  }
  function hl(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var a = e, l = t, u = l.flags;
        switch (l.tag) {
          case 22:
            hl(a, l), u & 2048 && Wr(
              l.alternate,
              l
            );
            break;
          case 24:
            hl(a, l), u & 2048 && Pr(l.alternate, l);
            break;
          default:
            hl(a, l);
        }
        t = t.sibling;
      }
  }
  var ml = 8192;
  function hi(e, t, a) {
    if (e.subtreeFlags & ml)
      for (e = e.child; e !== null; )
        oh(
          e,
          t,
          a
        ), e = e.sibling;
  }
  function oh(e, t, a) {
    switch (e.tag) {
      case 26:
        hi(
          e,
          t,
          a
        ), e.flags & ml && e.memoizedState !== null && xg(
          a,
          Pt,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        hi(
          e,
          t,
          a
        );
        break;
      case 3:
      case 4:
        var l = Pt;
        Pt = ks(e.stateNode.containerInfo), hi(
          e,
          t,
          a
        ), Pt = l;
        break;
      case 22:
        e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = ml, ml = 16777216, hi(
          e,
          t,
          a
        ), ml = l) : hi(
          e,
          t,
          a
        ));
        break;
      default:
        hi(
          e,
          t,
          a
        );
    }
  }
  function ch(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function pl(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          lt = l, dh(
            l,
            e
          );
        }
      ch(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        fh(e), e = e.sibling;
  }
  function fh(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        pl(e), e.flags & 2048 && Xn(9, e, e.return);
        break;
      case 3:
        pl(e);
        break;
      case 12:
        pl(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Es(e)) : pl(e);
        break;
      default:
        pl(e);
    }
  }
  function Es(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var a = 0; a < t.length; a++) {
          var l = t[a];
          lt = l, dh(
            l,
            e
          );
        }
      ch(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          Xn(8, t, t.return), Es(t);
          break;
        case 22:
          a = t.stateNode, a._visibility & 2 && (a._visibility &= -3, Es(t));
          break;
        default:
          Es(t);
      }
      e = e.sibling;
    }
  }
  function dh(e, t) {
    for (; lt !== null; ) {
      var a = lt;
      switch (a.tag) {
        case 0:
        case 11:
        case 15:
          Xn(8, a, t);
          break;
        case 23:
        case 22:
          if (a.memoizedState !== null && a.memoizedState.cachePool !== null) {
            var l = a.memoizedState.cachePool.pool;
            l != null && l.refCount++;
          }
          break;
        case 24:
          Wi(a.memoizedState.cache);
      }
      if (l = a.child, l !== null) l.return = a, lt = l;
      else
        e: for (a = e; lt !== null; ) {
          l = lt;
          var u = l.sibling, o = l.return;
          if (nh(l), l === a) {
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
  }, By = typeof WeakMap == "function" ? WeakMap : Map, xe = 0, Re = null, pe = null, be = 0, Te = 0, Mt = null, Vn = !1, mi = !1, eo = !1, jn = 0, Ge = 0, Jn = 0, Ca = 0, to = 0, Dt = 0, pi = 0, vl = null, wt = null, no = !1, Ts = 0, hh = 0, As = 1 / 0, Os = null, Fn = null, et = 0, In = null, vi = null, xn = 0, ao = 0, io = null, mh = null, yl = 0, lo = null;
  function Rt() {
    return (xe & 2) !== 0 && be !== 0 ? be & -be : N.T !== null ? fo() : Oc();
  }
  function ph() {
    if (Dt === 0)
      if ((be & 536870912) === 0 || Se) {
        var e = Zl;
        Zl <<= 1, (Zl & 3932160) === 0 && (Zl = 262144), Dt = e;
      } else Dt = 536870912;
    return e = Ct.current, e !== null && (e.flags |= 32), Dt;
  }
  function jt(e, t, a) {
    (e === Re && (Te === 2 || Te === 9) || e.cancelPendingCommit !== null) && (yi(e, 0), Wn(
      e,
      be,
      Dt,
      !1
    )), Qi(e, a), ((xe & 2) === 0 || e !== Re) && (e === Re && ((xe & 2) === 0 && (Ca |= a), Ge === 4 && Wn(
      e,
      be,
      Dt,
      !1
    )), un(e));
  }
  function vh(e, t, a) {
    if ((xe & 6) !== 0) throw Error(r(327));
    var l = !a && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Zi(e, t), u = l ? Gy(e, t) : uo(e, t, !0), o = l;
    do {
      if (u === 0) {
        mi && !l && Wn(e, t, 0, !1);
        break;
      } else {
        if (a = e.current.alternate, o && !$y(a)) {
          u = uo(e, t, !1), o = !1;
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
              var v = e;
              u = vl;
              var b = v.current.memoizedState.isDehydrated;
              if (b && (yi(v, f).flags |= 256), f = uo(
                v,
                f,
                !1
              ), f !== 2) {
                if (eo && !b) {
                  v.errorRecoveryDisabledLanes |= o, Ca |= o, u = 4;
                  break e;
                }
                o = wt, wt = u, o !== null && (wt === null ? wt = o : wt.push.apply(
                  wt,
                  o
                ));
              }
              u = f;
            }
            if (o = !1, u !== 2) continue;
          }
        }
        if (u === 1) {
          yi(e, 0), Wn(e, t, 0, !0);
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
              Wn(
                l,
                t,
                Dt,
                !Vn
              );
              break e;
            case 2:
              wt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(r(329));
          }
          if ((t & 62914560) === t && (u = Ts + 300 - ht(), 10 < u)) {
            if (Wn(
              l,
              t,
              Dt,
              !Vn
            ), kl(l, 0, !0) !== 0) break e;
            xn = t, l.timeoutHandle = Xh(
              yh.bind(
                null,
                l,
                a,
                wt,
                Os,
                no,
                t,
                Dt,
                Ca,
                pi,
                Vn,
                o,
                "Throttled",
                -0,
                0
              ),
              u
            );
            break e;
          }
          yh(
            l,
            a,
            wt,
            Os,
            no,
            t,
            Dt,
            Ca,
            pi,
            Vn,
            o,
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
  function yh(e, t, a, l, u, o, f, v, b, T, R, Q, O, M) {
    if (e.timeoutHandle = -1, Q = t.subtreeFlags, Q & 8192 || (Q & 16785408) === 16785408) {
      Q = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: cn
      }, oh(
        t,
        o,
        Q
      );
      var I = (o & 62914560) === o ? Ts - ht() : (o & 4194048) === o ? hh - ht() : 0;
      if (I = Eg(
        Q,
        I
      ), I !== null) {
        xn = o, e.cancelPendingCommit = I(
          xh.bind(
            null,
            e,
            t,
            o,
            a,
            l,
            u,
            f,
            v,
            b,
            R,
            Q,
            null,
            O,
            M
          )
        ), Wn(e, o, f, !T);
        return;
      }
    }
    xh(
      e,
      t,
      o,
      a,
      l,
      u,
      f,
      v,
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
  function Wn(e, t, a, l) {
    t &= ~to, t &= ~Ca, e.suspendedLanes |= t, e.pingedLanes &= ~t, l && (e.warmLanes |= t), l = e.expirationTimes;
    for (var u = t; 0 < u; ) {
      var o = 31 - Tt(u), f = 1 << o;
      l[o] = -1, u &= ~f;
    }
    a !== 0 && Ec(e, a, t);
  }
  function Cs() {
    return (xe & 6) === 0 ? (gl(0), !1) : !0;
  }
  function so() {
    if (pe !== null) {
      if (Te === 0)
        var e = pe.return;
      else
        e = pe, mn = Sa = null, zr(e), ui = null, el = 0, e = pe;
      for (; e !== null; )
        Vd(e.alternate, e), e = e.return;
      pe = null;
    }
  }
  function yi(e, t) {
    var a = e.timeoutHandle;
    a !== -1 && (e.timeoutHandle = -1, rg(a)), a = e.cancelPendingCommit, a !== null && (e.cancelPendingCommit = null, a()), xn = 0, so(), Re = e, pe = a = dn(e.current, null), be = t, Te = 0, Mt = null, Vn = !1, mi = Zi(e, t), eo = !1, pi = Dt = to = Ca = Jn = Ge = 0, wt = vl = null, no = !1, (t & 8) !== 0 && (t |= t & 32);
    var l = e.entangledLanes;
    if (l !== 0)
      for (e = e.entanglements, l &= t; 0 < l; ) {
        var u = 31 - Tt(l), o = 1 << u;
        t |= e[u], l &= ~o;
      }
    return jn = t, Il(), a;
  }
  function gh(e, t) {
    ce = null, N.H = rl, t === si || t === ls ? (t = Rf(), Te = 3) : t === cr ? (t = Rf(), Te = 4) : Te = t === Qr ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Mt = t, pe === null && (Ge = 1, bs(
      e,
      Ht(t, e.current)
    ));
  }
  function bh() {
    var e = Ct.current;
    return e === null ? !0 : (be & 4194048) === be ? Gt === null : (be & 62914560) === be || (be & 536870912) !== 0 ? e === Gt : !1;
  }
  function _h() {
    var e = N.H;
    return N.H = rl, e === null ? rl : e;
  }
  function Sh() {
    var e = N.A;
    return N.A = Hy, e;
  }
  function Ns() {
    Ge = 4, Vn || (be & 4194048) !== be && Ct.current !== null || (mi = !0), (Jn & 134217727) === 0 && (Ca & 134217727) === 0 || Re === null || Wn(
      Re,
      be,
      Dt,
      !1
    );
  }
  function uo(e, t, a) {
    var l = xe;
    xe |= 2;
    var u = _h(), o = Sh();
    (Re !== e || be !== t) && (Os = null, yi(e, t)), t = !1;
    var f = Ge;
    e: do
      try {
        if (Te !== 0 && pe !== null) {
          var v = pe, b = Mt;
          switch (Te) {
            case 8:
              so(), f = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Ct.current === null && (t = !0);
              var T = Te;
              if (Te = 0, Mt = null, gi(e, v, b, T), a && mi) {
                f = 0;
                break e;
              }
              break;
            default:
              T = Te, Te = 0, Mt = null, gi(e, v, b, T);
          }
        }
        Ly(), f = Ge;
        break;
      } catch (R) {
        gh(e, R);
      }
    while (!0);
    return t && e.shellSuspendCounter++, mn = Sa = null, xe = l, N.H = u, N.A = o, pe === null && (Re = null, be = 0, Il()), f;
  }
  function Ly() {
    for (; pe !== null; ) zh(pe);
  }
  function Gy(e, t) {
    var a = xe;
    xe |= 2;
    var l = _h(), u = Sh();
    Re !== e || be !== t ? (Os = null, As = ht() + 500, yi(e, t)) : mi = Zi(
      e,
      t
    );
    e: do
      try {
        if (Te !== 0 && pe !== null) {
          t = pe;
          var o = Mt;
          t: switch (Te) {
            case 1:
              Te = 0, Mt = null, gi(e, t, o, 1);
              break;
            case 2:
            case 9:
              if (Mf(o)) {
                Te = 0, Mt = null, wh(t);
                break;
              }
              t = function() {
                Te !== 2 && Te !== 9 || Re !== e || (Te = 7), un(e);
              }, o.then(t, t);
              break e;
            case 3:
              Te = 7;
              break e;
            case 4:
              Te = 5;
              break e;
            case 7:
              Mf(o) ? (Te = 0, Mt = null, wh(t)) : (Te = 0, Mt = null, gi(e, t, o, 7));
              break;
            case 5:
              var f = null;
              switch (pe.tag) {
                case 26:
                  f = pe.memoizedState;
                case 5:
                case 27:
                  var v = pe;
                  if (f ? rm(f) : v.stateNode.complete) {
                    Te = 0, Mt = null;
                    var b = v.sibling;
                    if (b !== null) pe = b;
                    else {
                      var T = v.return;
                      T !== null ? (pe = T, Ms(T)) : pe = null;
                    }
                    break t;
                  }
              }
              Te = 0, Mt = null, gi(e, t, o, 5);
              break;
            case 6:
              Te = 0, Mt = null, gi(e, t, o, 6);
              break;
            case 8:
              so(), Ge = 6;
              break e;
            default:
              throw Error(r(462));
          }
        }
        Yy();
        break;
      } catch (R) {
        gh(e, R);
      }
    while (!0);
    return mn = Sa = null, N.H = l, N.A = u, xe = a, pe !== null ? 0 : (Re = null, be = 0, Il(), Ge);
  }
  function Yy() {
    for (; pe !== null && !_u(); )
      zh(pe);
  }
  function zh(e) {
    var t = Kd(e.alternate, e, jn);
    e.memoizedProps = e.pendingProps, t === null ? Ms(e) : pe = t;
  }
  function wh(e) {
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
          be
        );
        break;
      case 11:
        t = Hd(
          a,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          be
        );
        break;
      case 5:
        zr(t);
      default:
        Vd(a, t), t = pe = Sf(t, jn), t = Kd(a, t, jn);
    }
    e.memoizedProps = e.pendingProps, t === null ? Ms(e) : pe = t;
  }
  function gi(e, t, a, l) {
    mn = Sa = null, zr(t), ui = null, el = 0;
    var u = t.return;
    try {
      if (Dy(
        e,
        u,
        t,
        a,
        be
      )) {
        Ge = 1, bs(
          e,
          Ht(a, e.current)
        ), pe = null;
        return;
      }
    } catch (o) {
      if (u !== null) throw pe = u, o;
      Ge = 1, bs(
        e,
        Ht(a, e.current)
      ), pe = null;
      return;
    }
    t.flags & 32768 ? (Se || l === 1 ? e = !0 : mi || (be & 536870912) !== 0 ? e = !1 : (Vn = e = !0, (l === 2 || l === 9 || l === 3 || l === 6) && (l = Ct.current, l !== null && l.tag === 13 && (l.flags |= 16384))), jh(t, e)) : Ms(t);
  }
  function Ms(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        jh(
          t,
          Vn
        );
        return;
      }
      e = t.return;
      var a = Uy(
        t.alternate,
        t,
        jn
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
    Ge === 0 && (Ge = 5);
  }
  function jh(e, t) {
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
    Ge = 6, pe = null;
  }
  function xh(e, t, a, l, u, o, f, v, b) {
    e.cancelPendingCommit = null;
    do
      Ds();
    while (et !== 0);
    if ((xe & 6) !== 0) throw Error(r(327));
    if (t !== null) {
      if (t === e.current) throw Error(r(177));
      if (o = t.lanes | t.childLanes, o |= Ju, jv(
        e,
        a,
        o,
        f,
        v,
        b
      ), e === Re && (pe = Re = null, be = 0), vi = t, In = e, xn = a, ao = o, io = u, mh = l, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Jy(Rn, function() {
        return Ch(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), l = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || l) {
        l = N.T, N.T = null, u = K.p, K.p = 2, f = xe, xe |= 4;
        try {
          Qy(e, t, a);
        } finally {
          xe = f, K.p = u, N.T = l;
        }
      }
      et = 1, Eh(), Th(), Ah();
    }
  }
  function Eh() {
    if (et === 1) {
      et = 0;
      var e = In, t = vi, a = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || a) {
        a = N.T, N.T = null;
        var l = K.p;
        K.p = 2;
        var u = xe;
        xe |= 4;
        try {
          sh(t, e);
          var o = _o, f = df(e.containerInfo), v = o.focusedElem, b = o.selectionRange;
          if (f !== v && v && v.ownerDocument && ff(
            v.ownerDocument.documentElement,
            v
          )) {
            if (b !== null && Gu(v)) {
              var T = b.start, R = b.end;
              if (R === void 0 && (R = T), "selectionStart" in v)
                v.selectionStart = T, v.selectionEnd = Math.min(
                  R,
                  v.value.length
                );
              else {
                var Q = v.ownerDocument || document, O = Q && Q.defaultView || window;
                if (O.getSelection) {
                  var M = O.getSelection(), I = v.textContent.length, le = Math.min(b.start, I), Me = b.end === void 0 ? le : Math.min(b.end, I);
                  !M.extend && le > Me && (f = Me, Me = le, le = f);
                  var j = cf(
                    v,
                    le
                  ), S = cf(
                    v,
                    Me
                  );
                  if (j && S && (M.rangeCount !== 1 || M.anchorNode !== j.node || M.anchorOffset !== j.offset || M.focusNode !== S.node || M.focusOffset !== S.offset)) {
                    var E = Q.createRange();
                    E.setStart(j.node, j.offset), M.removeAllRanges(), le > Me ? (M.addRange(E), M.extend(S.node, S.offset)) : (E.setEnd(S.node, S.offset), M.addRange(E));
                  }
                }
              }
            }
            for (Q = [], M = v; M = M.parentNode; )
              M.nodeType === 1 && Q.push({
                element: M,
                left: M.scrollLeft,
                top: M.scrollTop
              });
            for (typeof v.focus == "function" && v.focus(), v = 0; v < Q.length; v++) {
              var U = Q[v];
              U.element.scrollLeft = U.left, U.element.scrollTop = U.top;
            }
          }
          Ys = !!bo, _o = bo = null;
        } finally {
          xe = u, K.p = l, N.T = a;
        }
      }
      e.current = t, et = 2;
    }
  }
  function Th() {
    if (et === 2) {
      et = 0;
      var e = In, t = vi, a = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || a) {
        a = N.T, N.T = null;
        var l = K.p;
        K.p = 2;
        var u = xe;
        xe |= 4;
        try {
          th(e, t.alternate, t);
        } finally {
          xe = u, K.p = l, N.T = a;
        }
      }
      et = 3;
    }
  }
  function Ah() {
    if (et === 4 || et === 3) {
      et = 0, Su();
      var e = In, t = vi, a = xn, l = mh;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? et = 5 : (et = 0, vi = In = null, Oh(e, e.pendingLanes));
      var u = e.pendingLanes;
      if (u === 0 && (Fn = null), xu(a), t = t.stateNode, Et && typeof Et.onCommitFiberRoot == "function")
        try {
          Et.onCommitFiberRoot(
            Ui,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (l !== null) {
        t = N.T, u = K.p, K.p = 2, N.T = null;
        try {
          for (var o = e.onRecoverableError, f = 0; f < l.length; f++) {
            var v = l[f];
            o(v.value, {
              componentStack: v.stack
            });
          }
        } finally {
          N.T = t, K.p = u;
        }
      }
      (xn & 3) !== 0 && Ds(), un(e), u = e.pendingLanes, (a & 261930) !== 0 && (u & 42) !== 0 ? e === lo ? yl++ : (yl = 0, lo = e) : yl = 0, gl(0);
    }
  }
  function Oh(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Wi(t)));
  }
  function Ds() {
    return Eh(), Th(), Ah(), Ch();
  }
  function Ch() {
    if (et !== 5) return !1;
    var e = In, t = ao;
    ao = 0;
    var a = xu(xn), l = N.T, u = K.p;
    try {
      K.p = 32 > a ? 32 : a, N.T = null, a = io, io = null;
      var o = In, f = xn;
      if (et = 0, vi = In = null, xn = 0, (xe & 6) !== 0) throw Error(r(331));
      var v = xe;
      if (xe |= 4, fh(o.current), rh(
        o,
        o.current,
        f,
        a
      ), xe = v, gl(0, !1), Et && typeof Et.onPostCommitFiberRoot == "function")
        try {
          Et.onPostCommitFiberRoot(Ui, o);
        } catch {
        }
      return !0;
    } finally {
      K.p = u, N.T = l, Oh(e, t);
    }
  }
  function Nh(e, t, a) {
    t = Ht(a, t), t = Zr(e.stateNode, t, 2), e = Gn(e, t, 2), e !== null && (Qi(e, 2), un(e));
  }
  function Ae(e, t, a) {
    if (e.tag === 3)
      Nh(e, e, a);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Nh(
            t,
            e,
            a
          );
          break;
        } else if (t.tag === 1) {
          var l = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (Fn === null || !Fn.has(l))) {
            e = Ht(a, e), a = Md(2), l = Gn(t, a, 2), l !== null && (Dd(
              a,
              l,
              t,
              e
            ), Qi(l, 2), un(l));
            break;
          }
        }
        t = t.return;
      }
  }
  function ro(e, t, a) {
    var l = e.pingCache;
    if (l === null) {
      l = e.pingCache = new By();
      var u = /* @__PURE__ */ new Set();
      l.set(t, u);
    } else
      u = l.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), l.set(t, u));
    u.has(a) || (eo = !0, u.add(a), e = Ky.bind(null, e, t, a), t.then(e, e));
  }
  function Ky(e, t, a) {
    var l = e.pingCache;
    l !== null && l.delete(t), e.pingedLanes |= e.suspendedLanes & a, e.warmLanes &= ~a, Re === e && (be & a) === a && (Ge === 4 || Ge === 3 && (be & 62914560) === be && 300 > ht() - Ts ? (xe & 2) === 0 && yi(e, 0) : to |= a, pi === be && (pi = 0)), un(e);
  }
  function Mh(e, t) {
    t === 0 && (t = xc()), e = ga(e, t), e !== null && (Qi(e, t), un(e));
  }
  function Xy(e) {
    var t = e.memoizedState, a = 0;
    t !== null && (a = t.retryLane), Mh(e, a);
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
    l !== null && l.delete(t), Mh(e, a);
  }
  function Jy(e, t) {
    return da(e, t);
  }
  var Rs = null, bi = null, oo = !1, qs = !1, co = !1, Pn = 0;
  function un(e) {
    e !== bi && e.next === null && (bi === null ? Rs = bi = e : bi = bi.next = e), qs = !0, oo || (oo = !0, Iy());
  }
  function gl(e, t) {
    if (!co && qs) {
      co = !0;
      do
        for (var a = !1, l = Rs; l !== null; ) {
          if (e !== 0) {
            var u = l.pendingLanes;
            if (u === 0) var o = 0;
            else {
              var f = l.suspendedLanes, v = l.pingedLanes;
              o = (1 << 31 - Tt(42 | e) + 1) - 1, o &= u & ~(f & ~v), o = o & 201326741 ? o & 201326741 | 1 : o ? o | 2 : 0;
            }
            o !== 0 && (a = !0, Uh(l, o));
          } else
            o = be, o = kl(
              l,
              l === Re ? o : 0,
              l.cancelPendingCommit !== null || l.timeoutHandle !== -1
            ), (o & 3) === 0 || Zi(l, o) || (a = !0, Uh(l, o));
          l = l.next;
        }
      while (a);
      co = !1;
    }
  }
  function Fy() {
    Dh();
  }
  function Dh() {
    qs = oo = !1;
    var e = 0;
    Pn !== 0 && ug() && (e = Pn);
    for (var t = ht(), a = null, l = Rs; l !== null; ) {
      var u = l.next, o = Rh(l, t);
      o === 0 ? (l.next = null, a === null ? Rs = u : a.next = u, u === null && (bi = a)) : (a = l, (e !== 0 || (o & 3) !== 0) && (qs = !0)), l = u;
    }
    et !== 0 && et !== 5 || gl(e), Pn !== 0 && (Pn = 0);
  }
  function Rh(e, t) {
    for (var a = e.suspendedLanes, l = e.pingedLanes, u = e.expirationTimes, o = e.pendingLanes & -62914561; 0 < o; ) {
      var f = 31 - Tt(o), v = 1 << f, b = u[f];
      b === -1 ? ((v & a) === 0 || (v & l) !== 0) && (u[f] = wv(v, t)) : b <= t && (e.expiredLanes |= v), o &= ~v;
    }
    if (t = Re, a = be, a = kl(
      e,
      e === t ? a : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l = e.callbackNode, a === 0 || e === t && (Te === 2 || Te === 9) || e.cancelPendingCommit !== null)
      return l !== null && l !== null && ka(l), e.callbackNode = null, e.callbackPriority = 0;
    if ((a & 3) === 0 || Zi(e, a)) {
      if (t = a & -a, t === e.callbackPriority) return t;
      switch (l !== null && ka(l), xu(a)) {
        case 2:
        case 8:
          a = mt;
          break;
        case 32:
          a = Rn;
          break;
        case 268435456:
          a = jc;
          break;
        default:
          a = Rn;
      }
      return l = qh.bind(null, e), a = da(a, l), e.callbackPriority = t, e.callbackNode = a, t;
    }
    return l !== null && l !== null && ka(l), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function qh(e, t) {
    if (et !== 0 && et !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var a = e.callbackNode;
    if (Ds() && e.callbackNode !== a)
      return null;
    var l = be;
    return l = kl(
      e,
      e === Re ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l === 0 ? null : (vh(e, l, t), Rh(e, ht()), e.callbackNode != null && e.callbackNode === a ? qh.bind(null, e) : null);
  }
  function Uh(e, t) {
    if (Ds()) return null;
    vh(e, t, !0);
  }
  function Iy() {
    og(function() {
      (xe & 6) !== 0 ? da(
        ge,
        Fy
      ) : Dh();
    });
  }
  function fo() {
    if (Pn === 0) {
      var e = ii;
      e === 0 && (e = Ul, Ul <<= 1, (Ul & 261888) === 0 && (Ul = 256)), Pn = e;
    }
    return Pn;
  }
  function Zh(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Ll("" + e);
  }
  function Qh(e, t) {
    var a = t.ownerDocument.createElement("input");
    return a.name = t.name, a.value = t.value, e.id && a.setAttribute("form", e.id), t.parentNode.insertBefore(a, t), e = new FormData(e), a.parentNode.removeChild(a), e;
  }
  function Wy(e, t, a, l, u) {
    if (t === "submit" && a && a.stateNode === u) {
      var o = Zh(
        (u[gt] || null).action
      ), f = l.submitter;
      f && (t = (t = f[gt] || null) ? Zh(t.formAction) : f.getAttribute("formAction"), t !== null && (o = t, f = null));
      var v = new Xl(
        "action",
        "action",
        null,
        l,
        u
      );
      e.push({
        event: v,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (l.defaultPrevented) {
                if (Pn !== 0) {
                  var b = f ? Qh(u, f) : new FormData(u);
                  Nr(
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
                typeof o == "function" && (v.preventDefault(), b = f ? Qh(u, f) : new FormData(u), Nr(
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
  for (var ho = 0; ho < Vu.length; ho++) {
    var mo = Vu[ho], Py = mo.toLowerCase(), eg = mo[0].toUpperCase() + mo.slice(1);
    Wt(
      Py,
      "on" + eg
    );
  }
  Wt(pf, "onAnimationEnd"), Wt(vf, "onAnimationIteration"), Wt(yf, "onAnimationStart"), Wt("dblclick", "onDoubleClick"), Wt("focusin", "onFocus"), Wt("focusout", "onBlur"), Wt(vy, "onTransitionRun"), Wt(yy, "onTransitionStart"), Wt(gy, "onTransitionCancel"), Wt(gf, "onTransitionEnd"), Ga("onMouseEnter", ["mouseout", "mouseover"]), Ga("onMouseLeave", ["mouseout", "mouseover"]), Ga("onPointerEnter", ["pointerout", "pointerover"]), Ga("onPointerLeave", ["pointerout", "pointerover"]), ma(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), ma(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), ma("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), ma(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), ma(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), ma(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var bl = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), tg = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(bl)
  );
  function kh(e, t) {
    t = (t & 4) !== 0;
    for (var a = 0; a < e.length; a++) {
      var l = e[a], u = l.event;
      l = l.listeners;
      e: {
        var o = void 0;
        if (t)
          for (var f = l.length - 1; 0 <= f; f--) {
            var v = l[f], b = v.instance, T = v.currentTarget;
            if (v = v.listener, b !== o && u.isPropagationStopped())
              break e;
            o = v, u.currentTarget = T;
            try {
              o(u);
            } catch (R) {
              Fl(R);
            }
            u.currentTarget = null, o = b;
          }
        else
          for (f = 0; f < l.length; f++) {
            if (v = l[f], b = v.instance, T = v.currentTarget, v = v.listener, b !== o && u.isPropagationStopped())
              break e;
            o = v, u.currentTarget = T;
            try {
              o(u);
            } catch (R) {
              Fl(R);
            }
            u.currentTarget = null, o = b;
          }
      }
    }
  }
  function ve(e, t) {
    var a = t[Eu];
    a === void 0 && (a = t[Eu] = /* @__PURE__ */ new Set());
    var l = e + "__bubble";
    a.has(l) || (Hh(t, e, 2, !1), a.add(l));
  }
  function po(e, t, a) {
    var l = 0;
    t && (l |= 4), Hh(
      a,
      e,
      l,
      t
    );
  }
  var Us = "_reactListening" + Math.random().toString(36).slice(2);
  function vo(e) {
    if (!e[Us]) {
      e[Us] = !0, Mc.forEach(function(a) {
        a !== "selectionchange" && (tg.has(a) || po(a, !1, e), po(a, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Us] || (t[Us] = !0, po("selectionchange", !1, t));
    }
  }
  function Hh(e, t, a, l) {
    switch (pm(t)) {
      case 2:
        var u = Og;
        break;
      case 8:
        u = Cg;
        break;
      default:
        u = No;
    }
    a = u.bind(
      null,
      t,
      a,
      e
    ), u = void 0, !qu || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (u = !0), l ? u !== void 0 ? e.addEventListener(t, a, {
      capture: !0,
      passive: u
    }) : e.addEventListener(t, a, !0) : u !== void 0 ? e.addEventListener(t, a, {
      passive: u
    }) : e.addEventListener(t, a, !1);
  }
  function yo(e, t, a, l, u) {
    var o = l;
    if ((t & 1) === 0 && (t & 2) === 0 && l !== null)
      e: for (; ; ) {
        if (l === null) return;
        var f = l.tag;
        if (f === 3 || f === 4) {
          var v = l.stateNode.containerInfo;
          if (v === u) break;
          if (f === 4)
            for (f = l.return; f !== null; ) {
              var b = f.tag;
              if ((b === 3 || b === 4) && f.stateNode.containerInfo === u)
                return;
              f = f.return;
            }
          for (; v !== null; ) {
            if (f = Ba(v), f === null) return;
            if (b = f.tag, b === 5 || b === 6 || b === 26 || b === 27) {
              l = o = f;
              continue e;
            }
            v = v.parentNode;
          }
        }
        l = l.return;
      }
    Gc(function() {
      var T = o, R = Du(a), Q = [];
      e: {
        var O = bf.get(e);
        if (O !== void 0) {
          var M = Xl, I = e;
          switch (e) {
            case "keypress":
              if (Yl(a) === 0) break e;
            case "keydown":
            case "keyup":
              M = Vv;
              break;
            case "focusin":
              I = "focus", M = ku;
              break;
            case "focusout":
              I = "blur", M = ku;
              break;
            case "beforeblur":
            case "afterblur":
              M = ku;
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
              M = Xc;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              M = Uv;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              M = Iv;
              break;
            case pf:
            case vf:
            case yf:
              M = kv;
              break;
            case gf:
              M = Pv;
              break;
            case "scroll":
            case "scrollend":
              M = Rv;
              break;
            case "wheel":
              M = ty;
              break;
            case "copy":
            case "cut":
            case "paste":
              M = Bv;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              M = Jc;
              break;
            case "toggle":
            case "beforetoggle":
              M = ay;
          }
          var le = (t & 4) !== 0, Me = !le && (e === "scroll" || e === "scrollend"), j = le ? O !== null ? O + "Capture" : null : O;
          le = [];
          for (var S = T, E; S !== null; ) {
            var U = S;
            if (E = U.stateNode, U = U.tag, U !== 5 && U !== 26 && U !== 27 || E === null || j === null || (U = Bi(S, j), U != null && le.push(
              _l(S, U, E)
            )), Me) break;
            S = S.return;
          }
          0 < le.length && (O = new M(
            O,
            I,
            null,
            a,
            R
          ), Q.push({ event: O, listeners: le }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (O = e === "mouseover" || e === "pointerover", M = e === "mouseout" || e === "pointerout", O && a !== Mu && (I = a.relatedTarget || a.fromElement) && (Ba(I) || I[Ha]))
            break e;
          if ((M || O) && (O = R.window === R ? R : (O = R.ownerDocument) ? O.defaultView || O.parentWindow : window, M ? (I = a.relatedTarget || a.toElement, M = T, I = I ? Ba(I) : null, I !== null && (Me = m(I), le = I.tag, I !== Me || le !== 5 && le !== 27 && le !== 6) && (I = null)) : (M = null, I = T), M !== I)) {
            if (le = Xc, U = "onMouseLeave", j = "onMouseEnter", S = "mouse", (e === "pointerout" || e === "pointerover") && (le = Jc, U = "onPointerLeave", j = "onPointerEnter", S = "pointer"), Me = M == null ? O : Hi(M), E = I == null ? O : Hi(I), O = new le(
              U,
              S + "leave",
              M,
              a,
              R
            ), O.target = Me, O.relatedTarget = E, U = null, Ba(R) === T && (le = new le(
              j,
              S + "enter",
              I,
              a,
              R
            ), le.target = E, le.relatedTarget = Me, U = le), Me = U, M && I)
              t: {
                for (le = ng, j = M, S = I, E = 0, U = j; U; U = le(U))
                  E++;
                U = 0;
                for (var ae = S; ae; ae = le(ae))
                  U++;
                for (; 0 < E - U; )
                  j = le(j), E--;
                for (; 0 < U - E; )
                  S = le(S), U--;
                for (; E--; ) {
                  if (j === S || S !== null && j === S.alternate) {
                    le = j;
                    break t;
                  }
                  j = le(j), S = le(S);
                }
                le = null;
              }
            else le = null;
            M !== null && Bh(
              Q,
              O,
              M,
              le,
              !1
            ), I !== null && Me !== null && Bh(
              Q,
              Me,
              I,
              le,
              !0
            );
          }
        }
        e: {
          if (O = T ? Hi(T) : window, M = O.nodeName && O.nodeName.toLowerCase(), M === "select" || M === "input" && O.type === "file")
            var ze = af;
          else if (tf(O))
            if (lf)
              ze = hy;
            else {
              ze = fy;
              var W = cy;
            }
          else
            M = O.nodeName, !M || M.toLowerCase() !== "input" || O.type !== "checkbox" && O.type !== "radio" ? T && Nu(T.elementType) && (ze = af) : ze = dy;
          if (ze && (ze = ze(e, T))) {
            nf(
              Q,
              ze,
              a,
              R
            );
            break e;
          }
          W && W(e, O, T), e === "focusout" && T && O.type === "number" && T.memoizedProps.value != null && Cu(O, "number", O.value);
        }
        switch (W = T ? Hi(T) : window, e) {
          case "focusin":
            (tf(W) || W.contentEditable === "true") && (Fa = W, Yu = T, Ji = null);
            break;
          case "focusout":
            Ji = Yu = Fa = null;
            break;
          case "mousedown":
            Ku = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Ku = !1, hf(Q, a, R);
            break;
          case "selectionchange":
            if (py) break;
          case "keydown":
          case "keyup":
            hf(Q, a, R);
        }
        var de;
        if (Bu)
          e: {
            switch (e) {
              case "compositionstart":
                var _e = "onCompositionStart";
                break e;
              case "compositionend":
                _e = "onCompositionEnd";
                break e;
              case "compositionupdate":
                _e = "onCompositionUpdate";
                break e;
            }
            _e = void 0;
          }
        else
          Ja ? Pc(e, a) && (_e = "onCompositionEnd") : e === "keydown" && a.keyCode === 229 && (_e = "onCompositionStart");
        _e && (Fc && a.locale !== "ko" && (Ja || _e !== "onCompositionStart" ? _e === "onCompositionEnd" && Ja && (de = Yc()) : (Zn = R, Uu = "value" in Zn ? Zn.value : Zn.textContent, Ja = !0)), W = Zs(T, _e), 0 < W.length && (_e = new Vc(
          _e,
          e,
          null,
          a,
          R
        ), Q.push({ event: _e, listeners: W }), de ? _e.data = de : (de = ef(a), de !== null && (_e.data = de)))), (de = ly ? sy(e, a) : uy(e, a)) && (_e = Zs(T, "onBeforeInput"), 0 < _e.length && (W = new Vc(
          "onBeforeInput",
          "beforeinput",
          null,
          a,
          R
        ), Q.push({
          event: W,
          listeners: _e
        }), W.data = de)), Wy(
          Q,
          e,
          T,
          a,
          R
        );
      }
      kh(Q, t);
    });
  }
  function _l(e, t, a) {
    return {
      instance: e,
      listener: t,
      currentTarget: a
    };
  }
  function Zs(e, t) {
    for (var a = t + "Capture", l = []; e !== null; ) {
      var u = e, o = u.stateNode;
      if (u = u.tag, u !== 5 && u !== 26 && u !== 27 || o === null || (u = Bi(e, a), u != null && l.unshift(
        _l(e, u, o)
      ), u = Bi(e, t), u != null && l.push(
        _l(e, u, o)
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
  function Bh(e, t, a, l, u) {
    for (var o = t._reactName, f = []; a !== null && a !== l; ) {
      var v = a, b = v.alternate, T = v.stateNode;
      if (v = v.tag, b !== null && b === l) break;
      v !== 5 && v !== 26 && v !== 27 || T === null || (b = T, u ? (T = Bi(a, o), T != null && f.unshift(
        _l(a, T, b)
      )) : u || (T = Bi(a, o), T != null && f.push(
        _l(a, T, b)
      ))), a = a.return;
    }
    f.length !== 0 && e.push({ event: t, listeners: f });
  }
  var ag = /\r\n?/g, ig = /\u0000|\uFFFD/g;
  function $h(e) {
    return (typeof e == "string" ? e : "" + e).replace(ag, `
`).replace(ig, "");
  }
  function Lh(e, t) {
    return t = $h(t), $h(e) === t;
  }
  function Ne(e, t, a, l, u, o) {
    switch (a) {
      case "children":
        typeof l == "string" ? t === "body" || t === "textarea" && l === "" || Ka(e, l) : (typeof l == "number" || typeof l == "bigint") && t !== "body" && Ka(e, "" + l);
        break;
      case "className":
        Bl(e, "class", l);
        break;
      case "tabIndex":
        Bl(e, "tabindex", l);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Bl(e, a, l);
        break;
      case "style":
        $c(e, l, o);
        break;
      case "data":
        if (t !== "object") {
          Bl(e, "data", l);
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
        l = Ll("" + l), e.setAttribute(a, l);
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
          typeof o == "function" && (a === "formAction" ? (t !== "input" && Ne(e, t, "name", u.name, u, null), Ne(
            e,
            t,
            "formEncType",
            u.formEncType,
            u,
            null
          ), Ne(
            e,
            t,
            "formMethod",
            u.formMethod,
            u,
            null
          ), Ne(
            e,
            t,
            "formTarget",
            u.formTarget,
            u,
            null
          )) : (Ne(e, t, "encType", u.encType, u, null), Ne(e, t, "method", u.method, u, null), Ne(e, t, "target", u.target, u, null)));
        if (l == null || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(a);
          break;
        }
        l = Ll("" + l), e.setAttribute(a, l);
        break;
      case "onClick":
        l != null && (e.onclick = cn);
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
        a = Ll("" + l), e.setAttributeNS(
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
        ve("beforetoggle", e), ve("toggle", e), Hl(e, "popover", l);
        break;
      case "xlinkActuate":
        on(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          l
        );
        break;
      case "xlinkArcrole":
        on(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          l
        );
        break;
      case "xlinkRole":
        on(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          l
        );
        break;
      case "xlinkShow":
        on(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          l
        );
        break;
      case "xlinkTitle":
        on(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          l
        );
        break;
      case "xlinkType":
        on(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          l
        );
        break;
      case "xmlBase":
        on(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          l
        );
        break;
      case "xmlLang":
        on(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          l
        );
        break;
      case "xmlSpace":
        on(
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
        (!(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") && (a = Mv.get(a) || a, Hl(e, a, l));
    }
  }
  function go(e, t, a, l, u, o) {
    switch (a) {
      case "style":
        $c(e, l, o);
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
        typeof l == "string" ? Ka(e, l) : (typeof l == "number" || typeof l == "bigint") && Ka(e, "" + l);
        break;
      case "onScroll":
        l != null && ve("scroll", e);
        break;
      case "onScrollEnd":
        l != null && ve("scrollend", e);
        break;
      case "onClick":
        l != null && (e.onclick = cn);
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
        if (!Dc.hasOwnProperty(a))
          e: {
            if (a[0] === "o" && a[1] === "n" && (u = a.endsWith("Capture"), t = a.slice(2, u ? a.length - 7 : void 0), o = e[gt] || null, o = o != null ? o[a] : null, typeof o == "function" && e.removeEventListener(t, o, u), typeof l == "function")) {
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
        ve("error", e), ve("load", e);
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
                  Ne(e, t, o, f, a, null);
              }
          }
        u && Ne(e, t, "srcSet", a.srcSet, a, null), l && Ne(e, t, "src", a.src, a, null);
        return;
      case "input":
        ve("invalid", e);
        var v = o = f = u = null, b = null, T = null;
        for (l in a)
          if (a.hasOwnProperty(l)) {
            var R = a[l];
            if (R != null)
              switch (l) {
                case "name":
                  u = R;
                  break;
                case "type":
                  f = R;
                  break;
                case "checked":
                  b = R;
                  break;
                case "defaultChecked":
                  T = R;
                  break;
                case "value":
                  o = R;
                  break;
                case "defaultValue":
                  v = R;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (R != null)
                    throw Error(r(137, t));
                  break;
                default:
                  Ne(e, t, l, R, a, null);
              }
          }
        Qc(
          e,
          o,
          v,
          b,
          T,
          f,
          u,
          !1
        );
        return;
      case "select":
        ve("invalid", e), l = f = o = null;
        for (u in a)
          if (a.hasOwnProperty(u) && (v = a[u], v != null))
            switch (u) {
              case "value":
                o = v;
                break;
              case "defaultValue":
                f = v;
                break;
              case "multiple":
                l = v;
              default:
                Ne(e, t, u, v, a, null);
            }
        t = o, a = f, e.multiple = !!l, t != null ? Ya(e, !!l, t, !1) : a != null && Ya(e, !!l, a, !0);
        return;
      case "textarea":
        ve("invalid", e), o = u = l = null;
        for (f in a)
          if (a.hasOwnProperty(f) && (v = a[f], v != null))
            switch (f) {
              case "value":
                l = v;
                break;
              case "defaultValue":
                u = v;
                break;
              case "children":
                o = v;
                break;
              case "dangerouslySetInnerHTML":
                if (v != null) throw Error(r(91));
                break;
              default:
                Ne(e, t, f, v, a, null);
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
                Ne(e, t, b, l, a, null);
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
        for (l = 0; l < bl.length; l++)
          ve(bl[l], e);
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
                Ne(e, t, T, l, a, null);
            }
        return;
      default:
        if (Nu(t)) {
          for (R in a)
            a.hasOwnProperty(R) && (l = a[R], l !== void 0 && go(
              e,
              t,
              R,
              l,
              a,
              void 0
            ));
          return;
        }
    }
    for (v in a)
      a.hasOwnProperty(v) && (l = a[v], l != null && Ne(e, t, v, l, a, null));
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
        var u = null, o = null, f = null, v = null, b = null, T = null, R = null;
        for (M in a) {
          var Q = a[M];
          if (a.hasOwnProperty(M) && Q != null)
            switch (M) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                b = Q;
              default:
                l.hasOwnProperty(M) || Ne(e, t, M, null, l, Q);
            }
        }
        for (var O in l) {
          var M = l[O];
          if (Q = a[O], l.hasOwnProperty(O) && (M != null || Q != null))
            switch (O) {
              case "type":
                o = M;
                break;
              case "name":
                u = M;
                break;
              case "checked":
                T = M;
                break;
              case "defaultChecked":
                R = M;
                break;
              case "value":
                f = M;
                break;
              case "defaultValue":
                v = M;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (M != null)
                  throw Error(r(137, t));
                break;
              default:
                M !== Q && Ne(
                  e,
                  t,
                  O,
                  M,
                  l,
                  Q
                );
            }
        }
        Ou(
          e,
          f,
          v,
          b,
          T,
          R,
          o,
          u
        );
        return;
      case "select":
        M = f = v = O = null;
        for (o in a)
          if (b = a[o], a.hasOwnProperty(o) && b != null)
            switch (o) {
              case "value":
                break;
              case "multiple":
                M = b;
              default:
                l.hasOwnProperty(o) || Ne(
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
                O = o;
                break;
              case "defaultValue":
                v = o;
                break;
              case "multiple":
                f = o;
              default:
                o !== b && Ne(
                  e,
                  t,
                  u,
                  o,
                  l,
                  b
                );
            }
        t = v, a = f, l = M, O != null ? Ya(e, !!a, O, !1) : !!l != !!a && (t != null ? Ya(e, !!a, t, !0) : Ya(e, !!a, a ? [] : "", !1));
        return;
      case "textarea":
        M = O = null;
        for (v in a)
          if (u = a[v], a.hasOwnProperty(v) && u != null && !l.hasOwnProperty(v))
            switch (v) {
              case "value":
                break;
              case "children":
                break;
              default:
                Ne(e, t, v, null, l, u);
            }
        for (f in l)
          if (u = l[f], o = a[f], l.hasOwnProperty(f) && (u != null || o != null))
            switch (f) {
              case "value":
                O = u;
                break;
              case "defaultValue":
                M = u;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (u != null) throw Error(r(91));
                break;
              default:
                u !== o && Ne(e, t, f, u, l, o);
            }
        kc(e, O, M);
        return;
      case "option":
        for (var I in a)
          if (O = a[I], a.hasOwnProperty(I) && O != null && !l.hasOwnProperty(I))
            switch (I) {
              case "selected":
                e.selected = !1;
                break;
              default:
                Ne(
                  e,
                  t,
                  I,
                  null,
                  l,
                  O
                );
            }
        for (b in l)
          if (O = l[b], M = a[b], l.hasOwnProperty(b) && O !== M && (O != null || M != null))
            switch (b) {
              case "selected":
                e.selected = O && typeof O != "function" && typeof O != "symbol";
                break;
              default:
                Ne(
                  e,
                  t,
                  b,
                  O,
                  l,
                  M
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
          O = a[le], a.hasOwnProperty(le) && O != null && !l.hasOwnProperty(le) && Ne(e, t, le, null, l, O);
        for (T in l)
          if (O = l[T], M = a[T], l.hasOwnProperty(T) && O !== M && (O != null || M != null))
            switch (T) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (O != null)
                  throw Error(r(137, t));
                break;
              default:
                Ne(
                  e,
                  t,
                  T,
                  O,
                  l,
                  M
                );
            }
        return;
      default:
        if (Nu(t)) {
          for (var Me in a)
            O = a[Me], a.hasOwnProperty(Me) && O !== void 0 && !l.hasOwnProperty(Me) && go(
              e,
              t,
              Me,
              void 0,
              l,
              O
            );
          for (R in l)
            O = l[R], M = a[R], !l.hasOwnProperty(R) || O === M || O === void 0 && M === void 0 || go(
              e,
              t,
              R,
              O,
              l,
              M
            );
          return;
        }
    }
    for (var j in a)
      O = a[j], a.hasOwnProperty(j) && O != null && !l.hasOwnProperty(j) && Ne(e, t, j, null, l, O);
    for (Q in l)
      O = l[Q], M = a[Q], !l.hasOwnProperty(Q) || O === M || O == null && M == null || Ne(e, t, Q, O, l, M);
  }
  function Gh(e) {
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
        var u = a[l], o = u.transferSize, f = u.initiatorType, v = u.duration;
        if (o && v && Gh(f)) {
          for (f = 0, v = u.responseEnd, l += 1; l < a.length; l++) {
            var b = a[l], T = b.startTime;
            if (T > v) break;
            var R = b.transferSize, Q = b.initiatorType;
            R && Gh(Q) && (b = b.responseEnd, f += R * (b < v ? 1 : (v - T) / (b - T)));
          }
          if (--l, t += 8 * (o + f) / (u.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var bo = null, _o = null;
  function Qs(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Yh(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Kh(e, t) {
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
  function So(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var zo = null;
  function ug() {
    var e = window.event;
    return e && e.type === "popstate" ? e === zo ? !1 : (zo = e, !0) : (zo = null, !1);
  }
  var Xh = typeof setTimeout == "function" ? setTimeout : void 0, rg = typeof clearTimeout == "function" ? clearTimeout : void 0, Vh = typeof Promise == "function" ? Promise : void 0, og = typeof queueMicrotask == "function" ? queueMicrotask : typeof Vh < "u" ? function(e) {
    return Vh.resolve(null).then(e).catch(cg);
  } : Xh;
  function cg(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function ea(e) {
    return e === "head";
  }
  function Jh(e, t) {
    var a = t, l = 0;
    do {
      var u = a.nextSibling;
      if (e.removeChild(a), u && u.nodeType === 8)
        if (a = u.data, a === "/$" || a === "/&") {
          if (l === 0) {
            e.removeChild(u), wi(t);
            return;
          }
          l--;
        } else if (a === "$" || a === "$?" || a === "$~" || a === "$!" || a === "&")
          l++;
        else if (a === "html")
          Sl(e.ownerDocument.documentElement);
        else if (a === "head") {
          a = e.ownerDocument.head, Sl(a);
          for (var o = a.firstChild; o; ) {
            var f = o.nextSibling, v = o.nodeName;
            o[ki] || v === "SCRIPT" || v === "STYLE" || v === "LINK" && o.rel.toLowerCase() === "stylesheet" || a.removeChild(o), o = f;
          }
        } else
          a === "body" && Sl(e.ownerDocument.body);
      a = u;
    } while (a);
    wi(t);
  }
  function Fh(e, t) {
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
  function wo(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var a = t;
      switch (t = t.nextSibling, a.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          wo(a), Tu(a);
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
        if (!e[ki])
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
      if (e = Yt(e.nextSibling), e === null) break;
    }
    return null;
  }
  function dg(e, t, a) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !a || (e = Yt(e.nextSibling), e === null)) return null;
    return e;
  }
  function Ih(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Yt(e.nextSibling), e === null)) return null;
    return e;
  }
  function jo(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function xo(e) {
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
  function Yt(e) {
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
  var Eo = null;
  function Wh(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var a = e.data;
        if (a === "/$" || a === "/&") {
          if (t === 0)
            return Yt(e.nextSibling);
          t--;
        } else
          a !== "$" && a !== "$!" && a !== "$?" && a !== "$~" && a !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function Ph(e) {
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
  function em(e, t, a) {
    switch (t = Qs(a), e) {
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
  function Sl(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    Tu(e);
  }
  var Kt = /* @__PURE__ */ new Map(), tm = /* @__PURE__ */ new Set();
  function ks(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var En = K.d;
  K.d = {
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
    var e = En.f(), t = Cs();
    return e || t;
  }
  function pg(e) {
    var t = $a(e);
    t !== null && t.tag === 5 && t.type === "form" ? gd(t) : En.r(e);
  }
  var _i = typeof document > "u" ? null : document;
  function nm(e, t, a) {
    var l = _i;
    if (l && typeof t == "string" && t) {
      var u = Qt(t);
      u = 'link[rel="' + e + '"][href="' + u + '"]', typeof a == "string" && (u += '[crossorigin="' + a + '"]'), tm.has(u) || (tm.add(u), e = { rel: e, crossOrigin: a, href: t }, l.querySelector(u) === null && (t = l.createElement("link"), ct(t, "link", e), it(t), l.head.appendChild(t)));
    }
  }
  function vg(e) {
    En.D(e), nm("dns-prefetch", e, null);
  }
  function yg(e, t) {
    En.C(e, t), nm("preconnect", e, t);
  }
  function gg(e, t, a) {
    En.L(e, t, a);
    var l = _i;
    if (l && e && t) {
      var u = 'link[rel="preload"][as="' + Qt(t) + '"]';
      t === "image" && a && a.imageSrcSet ? (u += '[imagesrcset="' + Qt(
        a.imageSrcSet
      ) + '"]', typeof a.imageSizes == "string" && (u += '[imagesizes="' + Qt(
        a.imageSizes
      ) + '"]')) : u += '[href="' + Qt(e) + '"]';
      var o = u;
      switch (t) {
        case "style":
          o = Si(e);
          break;
        case "script":
          o = zi(e);
      }
      Kt.has(o) || (e = x(
        {
          rel: "preload",
          href: t === "image" && a && a.imageSrcSet ? void 0 : e,
          as: t
        },
        a
      ), Kt.set(o, e), l.querySelector(u) !== null || t === "style" && l.querySelector(zl(o)) || t === "script" && l.querySelector(wl(o)) || (t = l.createElement("link"), ct(t, "link", e), it(t), l.head.appendChild(t)));
    }
  }
  function bg(e, t) {
    En.m(e, t);
    var a = _i;
    if (a && e) {
      var l = t && typeof t.as == "string" ? t.as : "script", u = 'link[rel="modulepreload"][as="' + Qt(l) + '"][href="' + Qt(e) + '"]', o = u;
      switch (l) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          o = zi(e);
      }
      if (!Kt.has(o) && (e = x({ rel: "modulepreload", href: e }, t), Kt.set(o, e), a.querySelector(u) === null)) {
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (a.querySelector(wl(o)))
              return;
        }
        l = a.createElement("link"), ct(l, "link", e), it(l), a.head.appendChild(l);
      }
    }
  }
  function _g(e, t, a) {
    En.S(e, t, a);
    var l = _i;
    if (l && e) {
      var u = La(l).hoistableStyles, o = Si(e);
      t = t || "default";
      var f = u.get(o);
      if (!f) {
        var v = { loading: 0, preload: null };
        if (f = l.querySelector(
          zl(o)
        ))
          v.loading = 5;
        else {
          e = x(
            { rel: "stylesheet", href: e, "data-precedence": t },
            a
          ), (a = Kt.get(o)) && To(e, a);
          var b = f = l.createElement("link");
          it(b), ct(b, "link", e), b._p = new Promise(function(T, R) {
            b.onload = T, b.onerror = R;
          }), b.addEventListener("load", function() {
            v.loading |= 1;
          }), b.addEventListener("error", function() {
            v.loading |= 2;
          }), v.loading |= 4, Hs(f, t, l);
        }
        f = {
          type: "stylesheet",
          instance: f,
          count: 1,
          state: v
        }, u.set(o, f);
      }
    }
  }
  function Sg(e, t) {
    En.X(e, t);
    var a = _i;
    if (a && e) {
      var l = La(a).hoistableScripts, u = zi(e), o = l.get(u);
      o || (o = a.querySelector(wl(u)), o || (e = x({ src: e, async: !0 }, t), (t = Kt.get(u)) && Ao(e, t), o = a.createElement("script"), it(o), ct(o, "link", e), a.head.appendChild(o)), o = {
        type: "script",
        instance: o,
        count: 1,
        state: null
      }, l.set(u, o));
    }
  }
  function zg(e, t) {
    En.M(e, t);
    var a = _i;
    if (a && e) {
      var l = La(a).hoistableScripts, u = zi(e), o = l.get(u);
      o || (o = a.querySelector(wl(u)), o || (e = x({ src: e, async: !0, type: "module" }, t), (t = Kt.get(u)) && Ao(e, t), o = a.createElement("script"), it(o), ct(o, "link", e), a.head.appendChild(o)), o = {
        type: "script",
        instance: o,
        count: 1,
        state: null
      }, l.set(u, o));
    }
  }
  function am(e, t, a, l) {
    var u = (u = fe.current) ? ks(u) : null;
    if (!u) throw Error(r(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof a.precedence == "string" && typeof a.href == "string" ? (t = Si(a.href), a = La(
          u
        ).hoistableStyles, l = a.get(t), l || (l = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, a.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (a.rel === "stylesheet" && typeof a.href == "string" && typeof a.precedence == "string") {
          e = Si(a.href);
          var o = La(
            u
          ).hoistableStyles, f = o.get(e);
          if (f || (u = u.ownerDocument || u, f = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, o.set(e, f), (o = u.querySelector(
            zl(e)
          )) && !o._p && (f.instance = o, f.state.loading = 5), Kt.has(e) || (a = {
            rel: "preload",
            as: "style",
            href: a.href,
            crossOrigin: a.crossOrigin,
            integrity: a.integrity,
            media: a.media,
            hrefLang: a.hrefLang,
            referrerPolicy: a.referrerPolicy
          }, Kt.set(e, a), o || wg(
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
        return t = a.async, a = a.src, typeof a == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = zi(a), a = La(
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
  function Si(e) {
    return 'href="' + Qt(e) + '"';
  }
  function zl(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function im(e) {
    return x({}, e, {
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
  function zi(e) {
    return '[src="' + Qt(e) + '"]';
  }
  function wl(e) {
    return "script[async]" + e;
  }
  function lm(e, t, a) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var l = e.querySelector(
            'style[data-href~="' + Qt(a.href) + '"]'
          );
          if (l)
            return t.instance = l, it(l), l;
          var u = x({}, a, {
            "data-href": a.href,
            "data-precedence": a.precedence,
            href: null,
            precedence: null
          });
          return l = (e.ownerDocument || e).createElement(
            "style"
          ), it(l), ct(l, "style", u), Hs(l, a.precedence, e), t.instance = l;
        case "stylesheet":
          u = Si(a.href);
          var o = e.querySelector(
            zl(u)
          );
          if (o)
            return t.state.loading |= 4, t.instance = o, it(o), o;
          l = im(a), (u = Kt.get(u)) && To(l, u), o = (e.ownerDocument || e).createElement("link"), it(o);
          var f = o;
          return f._p = new Promise(function(v, b) {
            f.onload = v, f.onerror = b;
          }), ct(o, "link", l), t.state.loading |= 4, Hs(o, a.precedence, e), t.instance = o;
        case "script":
          return o = zi(a.src), (u = e.querySelector(
            wl(o)
          )) ? (t.instance = u, it(u), u) : (l = a, (u = Kt.get(o)) && (l = x({}, a), Ao(l, u)), e = e.ownerDocument || e, u = e.createElement("script"), it(u), ct(u, "link", l), e.head.appendChild(u), t.instance = u);
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
      var v = l[f];
      if (v.dataset.precedence === t) o = v;
      else if (o !== u) break;
    }
    o ? o.parentNode.insertBefore(e, o.nextSibling) : (t = a.nodeType === 9 ? a.head : a, t.insertBefore(e, t.firstChild));
  }
  function To(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function Ao(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var Bs = null;
  function sm(e, t, a) {
    if (Bs === null) {
      var l = /* @__PURE__ */ new Map(), u = Bs = /* @__PURE__ */ new Map();
      u.set(a, l);
    } else
      u = Bs, l = u.get(a), l || (l = /* @__PURE__ */ new Map(), u.set(a, l));
    if (l.has(e)) return l;
    for (l.set(e, null), a = a.getElementsByTagName(e), u = 0; u < a.length; u++) {
      var o = a[u];
      if (!(o[ki] || o[st] || e === "link" && o.getAttribute("rel") === "stylesheet") && o.namespaceURI !== "http://www.w3.org/2000/svg") {
        var f = o.getAttribute(t) || "";
        f = e + f;
        var v = l.get(f);
        v ? v.push(o) : l.set(f, [o]);
      }
    }
    return l;
  }
  function um(e, t, a) {
    e = e.ownerDocument || e, e.head.insertBefore(
      a,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function jg(e, t, a) {
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
  function rm(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function xg(e, t, a, l) {
    if (a.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== !1) && (a.state.loading & 4) === 0) {
      if (a.instance === null) {
        var u = Si(l.href), o = t.querySelector(
          zl(u)
        );
        if (o) {
          t = o._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = $s.bind(e), t.then(e, e)), a.state.loading |= 4, a.instance = o, it(o);
          return;
        }
        o = t.ownerDocument || t, l = im(l), (u = Kt.get(u)) && To(l, u), o = o.createElement("link"), it(o);
        var f = o;
        f._p = new Promise(function(v, b) {
          f.onload = v, f.onerror = b;
        }), ct(o, "link", l), a.instance = o;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(a, t), (t = a.state.preload) && (a.state.loading & 3) === 0 && (e.count++, a = $s.bind(e), t.addEventListener("load", a), t.addEventListener("error", a));
    }
  }
  var Oo = 0;
  function Eg(e, t) {
    return e.stylesheets && e.count === 0 && Gs(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(a) {
      var l = setTimeout(function() {
        if (e.stylesheets && Gs(e, e.stylesheets), e.unsuspend) {
          var o = e.unsuspend;
          e.unsuspend = null, o();
        }
      }, 6e4 + t);
      0 < e.imgBytes && Oo === 0 && (Oo = 62500 * sg());
      var u = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Gs(e, e.stylesheets), e.unsuspend)) {
            var o = e.unsuspend;
            e.unsuspend = null, o();
          }
        },
        (e.imgBytes > Oo ? 50 : 800) + t
      );
      return e.unsuspend = a, function() {
        e.unsuspend = null, clearTimeout(l), clearTimeout(u);
      };
    } : null;
  }
  function $s() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Gs(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var Ls = null;
  function Gs(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, Ls = /* @__PURE__ */ new Map(), t.forEach(Tg, e), Ls = null, $s.call(e));
  }
  function Tg(e, t) {
    if (!(t.state.loading & 4)) {
      var a = Ls.get(e);
      if (a) var l = a.get(null);
      else {
        a = /* @__PURE__ */ new Map(), Ls.set(e, a);
        for (var u = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), o = 0; o < u.length; o++) {
          var f = u[o];
          (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") && (a.set(f.dataset.precedence, f), l = f);
        }
        l && a.set(null, l);
      }
      u = t.instance, f = u.getAttribute("data-precedence"), o = a.get(f) || l, o === l && a.set(null, u), a.set(f, u), this.count++, l = $s.bind(this), u.addEventListener("load", l), u.addEventListener("error", l), o ? o.parentNode.insertBefore(u, o.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(u, e.firstChild)), t.state.loading |= 4;
    }
  }
  var jl = {
    $$typeof: Y,
    Provider: null,
    Consumer: null,
    _currentValue: se,
    _currentValue2: se,
    _threadCount: 0
  };
  function Ag(e, t, a, l, u, o, f, v, b) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = wu(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = wu(0), this.hiddenUpdates = wu(null), this.identifierPrefix = l, this.onUncaughtError = u, this.onCaughtError = o, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = b, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function om(e, t, a, l, u, o, f, v, b, T, R, Q) {
    return e = new Ag(
      e,
      t,
      a,
      f,
      b,
      T,
      R,
      Q,
      v
    ), t = 1, o === !0 && (t |= 24), o = Ot(3, null, null, t), e.current = o, o.stateNode = e, t = ur(), t.refCount++, e.pooledCache = t, t.refCount++, o.memoizedState = {
      element: l,
      isDehydrated: a,
      cache: t
    }, fr(o), e;
  }
  function cm(e) {
    return e ? (e = Pa, e) : Pa;
  }
  function fm(e, t, a, l, u, o) {
    u = cm(u), l.context === null ? l.context = u : l.pendingContext = u, l = Ln(t), l.payload = { element: a }, o = o === void 0 ? null : o, o !== null && (l.callback = o), a = Gn(e, l, t), a !== null && (jt(a, e, t), nl(a, e, t));
  }
  function dm(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var a = e.retryLane;
      e.retryLane = a !== 0 && a < t ? a : t;
    }
  }
  function Co(e, t) {
    dm(e, t), (e = e.alternate) && dm(e, t);
  }
  function hm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = ga(e, 67108864);
      t !== null && jt(t, e, 67108864), Co(e, 67108864);
    }
  }
  function mm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Rt();
      t = ju(t);
      var a = ga(e, t);
      a !== null && jt(a, e, t), Co(e, t);
    }
  }
  var Ys = !0;
  function Og(e, t, a, l) {
    var u = N.T;
    N.T = null;
    var o = K.p;
    try {
      K.p = 2, No(e, t, a, l);
    } finally {
      K.p = o, N.T = u;
    }
  }
  function Cg(e, t, a, l) {
    var u = N.T;
    N.T = null;
    var o = K.p;
    try {
      K.p = 8, No(e, t, a, l);
    } finally {
      K.p = o, N.T = u;
    }
  }
  function No(e, t, a, l) {
    if (Ys) {
      var u = Mo(l);
      if (u === null)
        yo(
          e,
          t,
          l,
          Ks,
          a
        ), vm(e, l);
      else if (Mg(
        u,
        e,
        t,
        a,
        l
      ))
        l.stopPropagation();
      else if (vm(e, l), t & 4 && -1 < Ng.indexOf(e)) {
        for (; u !== null; ) {
          var o = $a(u);
          if (o !== null)
            switch (o.tag) {
              case 3:
                if (o = o.stateNode, o.current.memoizedState.isDehydrated) {
                  var f = ha(o.pendingLanes);
                  if (f !== 0) {
                    var v = o;
                    for (v.pendingLanes |= 2, v.entangledLanes |= 2; f; ) {
                      var b = 1 << 31 - Tt(f);
                      v.entanglements[1] |= b, f &= ~b;
                    }
                    un(o), (xe & 6) === 0 && (As = ht() + 500, gl(0));
                  }
                }
                break;
              case 31:
              case 13:
                v = ga(o, 2), v !== null && jt(v, o, 2), Cs(), Co(o, 2);
            }
          if (o = Mo(l), o === null && yo(
            e,
            t,
            l,
            Ks,
            a
          ), o === u) break;
          u = o;
        }
        u !== null && l.stopPropagation();
      } else
        yo(
          e,
          t,
          l,
          null,
          a
        );
    }
  }
  function Mo(e) {
    return e = Du(e), Do(e);
  }
  var Ks = null;
  function Do(e) {
    if (Ks = null, e = Ba(e), e !== null) {
      var t = m(e);
      if (t === null) e = null;
      else {
        var a = t.tag;
        if (a === 13) {
          if (e = h(t), e !== null) return e;
          e = null;
        } else if (a === 31) {
          if (e = p(t), e !== null) return e;
          e = null;
        } else if (a === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return Ks = e, null;
  }
  function pm(e) {
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
        switch (H()) {
          case ge:
            return 2;
          case mt:
            return 8;
          case Rn:
          case zu:
            return 32;
          case jc:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var Ro = !1, ta = null, na = null, aa = null, xl = /* @__PURE__ */ new Map(), El = /* @__PURE__ */ new Map(), ia = [], Ng = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function vm(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        ta = null;
        break;
      case "dragenter":
      case "dragleave":
        na = null;
        break;
      case "mouseover":
      case "mouseout":
        aa = null;
        break;
      case "pointerover":
      case "pointerout":
        xl.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        El.delete(t.pointerId);
    }
  }
  function Tl(e, t, a, l, u, o) {
    return e === null || e.nativeEvent !== o ? (e = {
      blockedOn: t,
      domEventName: a,
      eventSystemFlags: l,
      nativeEvent: o,
      targetContainers: [u]
    }, t !== null && (t = $a(t), t !== null && hm(t)), e) : (e.eventSystemFlags |= l, t = e.targetContainers, u !== null && t.indexOf(u) === -1 && t.push(u), e);
  }
  function Mg(e, t, a, l, u) {
    switch (t) {
      case "focusin":
        return ta = Tl(
          ta,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "dragenter":
        return na = Tl(
          na,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "mouseover":
        return aa = Tl(
          aa,
          e,
          t,
          a,
          l,
          u
        ), !0;
      case "pointerover":
        var o = u.pointerId;
        return xl.set(
          o,
          Tl(
            xl.get(o) || null,
            e,
            t,
            a,
            l,
            u
          )
        ), !0;
      case "gotpointercapture":
        return o = u.pointerId, El.set(
          o,
          Tl(
            El.get(o) || null,
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
  function ym(e) {
    var t = Ba(e.target);
    if (t !== null) {
      var a = m(t);
      if (a !== null) {
        if (t = a.tag, t === 13) {
          if (t = h(a), t !== null) {
            e.blockedOn = t, Cc(e.priority, function() {
              mm(a);
            });
            return;
          }
        } else if (t === 31) {
          if (t = p(a), t !== null) {
            e.blockedOn = t, Cc(e.priority, function() {
              mm(a);
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
  function Xs(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var a = Mo(e.nativeEvent);
      if (a === null) {
        a = e.nativeEvent;
        var l = new a.constructor(
          a.type,
          a
        );
        Mu = l, a.target.dispatchEvent(l), Mu = null;
      } else
        return t = $a(a), t !== null && hm(t), e.blockedOn = a, !1;
      t.shift();
    }
    return !0;
  }
  function gm(e, t, a) {
    Xs(e) && a.delete(t);
  }
  function Dg() {
    Ro = !1, ta !== null && Xs(ta) && (ta = null), na !== null && Xs(na) && (na = null), aa !== null && Xs(aa) && (aa = null), xl.forEach(gm), El.forEach(gm);
  }
  function Vs(e, t) {
    e.blockedOn === t && (e.blockedOn = null, Ro || (Ro = !0, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      Dg
    )));
  }
  var Js = null;
  function bm(e) {
    Js !== e && (Js = e, n.unstable_scheduleCallback(
      n.unstable_NormalPriority,
      function() {
        Js === e && (Js = null);
        for (var t = 0; t < e.length; t += 3) {
          var a = e[t], l = e[t + 1], u = e[t + 2];
          if (typeof l != "function") {
            if (Do(l || a) === null)
              continue;
            break;
          }
          var o = $a(a);
          o !== null && (e.splice(t, 3), t -= 3, Nr(
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
  function wi(e) {
    function t(b) {
      return Vs(b, e);
    }
    ta !== null && Vs(ta, e), na !== null && Vs(na, e), aa !== null && Vs(aa, e), xl.forEach(t), El.forEach(t);
    for (var a = 0; a < ia.length; a++) {
      var l = ia[a];
      l.blockedOn === e && (l.blockedOn = null);
    }
    for (; 0 < ia.length && (a = ia[0], a.blockedOn === null); )
      ym(a), a.blockedOn === null && ia.shift();
    if (a = (e.ownerDocument || e).$$reactFormReplay, a != null)
      for (l = 0; l < a.length; l += 3) {
        var u = a[l], o = a[l + 1], f = u[gt] || null;
        if (typeof o == "function")
          f || bm(a);
        else if (f) {
          var v = null;
          if (o && o.hasAttribute("formAction")) {
            if (u = o, f = o[gt] || null)
              v = f.formAction;
            else if (Do(u) !== null) continue;
          } else v = f.action;
          typeof v == "function" ? a[l + 1] = v : (a.splice(l, 3), l -= 3), bm(a);
        }
      }
  }
  function _m() {
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
  function qo(e) {
    this._internalRoot = e;
  }
  Fs.prototype.render = qo.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(r(409));
    var a = t.current, l = Rt();
    fm(a, l, e, t, null, null);
  }, Fs.prototype.unmount = qo.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      fm(e.current, 2, null, e, null, null), Cs(), t[Ha] = null;
    }
  };
  function Fs(e) {
    this._internalRoot = e;
  }
  Fs.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = Oc();
      e = { blockedOn: null, target: e, priority: t };
      for (var a = 0; a < ia.length && t !== 0 && t < ia[a].priority; a++) ;
      ia.splice(a, 0, e), a === 0 && ym(e);
    }
  };
  var Sm = i.version;
  if (Sm !== "19.2.7")
    throw Error(
      r(
        527,
        Sm,
        "19.2.7"
      )
    );
  K.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(r(188)) : (e = Object.keys(e).join(","), Error(r(268, e)));
    return e = g(t), e = e !== null ? _(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Rg = {
    bundleType: 0,
    version: "19.2.7",
    rendererPackageName: "react-dom",
    currentDispatcherRef: N,
    reconcilerVersion: "19.2.7"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Is = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Is.isDisabled && Is.supportsFiber)
      try {
        Ui = Is.inject(
          Rg
        ), Et = Is;
      } catch {
      }
  }
  return Ol.createRoot = function(e, t) {
    if (!c(e)) throw Error(r(299));
    var a = !1, l = "", u = Ad, o = Od, f = Cd;
    return t != null && (t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (l = t.identifierPrefix), t.onUncaughtError !== void 0 && (u = t.onUncaughtError), t.onCaughtError !== void 0 && (o = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError)), t = om(
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
      _m
    ), e[Ha] = t.current, vo(e), new qo(t);
  }, Ol.hydrateRoot = function(e, t, a) {
    if (!c(e)) throw Error(r(299));
    var l = !1, u = "", o = Ad, f = Od, v = Cd, b = null;
    return a != null && (a.unstable_strictMode === !0 && (l = !0), a.identifierPrefix !== void 0 && (u = a.identifierPrefix), a.onUncaughtError !== void 0 && (o = a.onUncaughtError), a.onCaughtError !== void 0 && (f = a.onCaughtError), a.onRecoverableError !== void 0 && (v = a.onRecoverableError), a.formState !== void 0 && (b = a.formState)), t = om(
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
      v,
      _m
    ), t.context = cm(null), a = t.current, l = Rt(), l = ju(l), u = Ln(l), u.callback = null, Gn(a, u, l), a = l, t.current.lanes = a, Qi(t, a), un(t), e[Ha] = t.current, vo(e), new Fs(t);
  }, Ol.version = "19.2.7", Ol;
}
var Nm;
function Gg() {
  if (Nm) return Zo.exports;
  Nm = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), Zo.exports = Lg(), Zo.exports;
}
var Yg = Gg(), J = sc(), Ci = class {
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
}, Kg = class extends Ci {
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
}, uc = new Kg(), Xg = {
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
}, Na = new Vg();
function Jg(n) {
  setTimeout(n, 0);
}
var Fg = typeof window > "u" || "Deno" in globalThis;
function yt() {
}
function Ig(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Ko(n) {
  return typeof n == "number" && n >= 0 && n !== 1 / 0;
}
function zp(n, i) {
  return Math.max(n + (i || 0) - Date.now(), 0);
}
function ra(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Ut(n, i) {
  return typeof n == "function" ? n(i) : n;
}
function Mm(n, i) {
  const {
    type: s = "all",
    exact: r,
    fetchStatus: c,
    predicate: m,
    queryKey: h,
    stale: p
  } = n;
  if (h) {
    if (r) {
      if (i.queryHash !== rc(h, i.options))
        return !1;
    } else if (!Ml(i.queryKey, h))
      return !1;
  }
  if (s !== "all") {
    const y = i.isActive();
    if (s === "active" && !y || s === "inactive" && y)
      return !1;
  }
  return !(typeof p == "boolean" && i.isStale() !== p || c && c !== i.state.fetchStatus || m && !m(i));
}
function Dm(n, i) {
  const { exact: s, status: r, predicate: c, mutationKey: m } = n;
  if (m) {
    if (!i.options.mutationKey)
      return !1;
    if (s) {
      if (Da(i.options.mutationKey) !== Da(m))
        return !1;
    } else if (!Ml(i.options.mutationKey, m))
      return !1;
  }
  return !(r && i.state.status !== r || c && !c(i));
}
function rc(n, i) {
  return (i?.queryKeyHashFn || Da)(n);
}
function Da(n) {
  return JSON.stringify(
    n,
    (i, s) => Xo(s) ? Object.keys(s).sort().reduce((r, c) => (r[c] = s[c], r), {}) : s
  );
}
function Ml(n, i) {
  return n === i ? !0 : typeof n != typeof i ? !1 : n && i && typeof n == "object" && typeof i == "object" ? Object.keys(i).every((s) => Ml(n[s], i[s])) : !1;
}
var Wg = Object.prototype.hasOwnProperty;
function wp(n, i, s = 0) {
  if (n === i)
    return n;
  if (s > 500) return i;
  const r = Rm(n) && Rm(i);
  if (!r && !(Xo(n) && Xo(i))) return i;
  const m = (r ? n : Object.keys(n)).length, h = r ? i : Object.keys(i), p = h.length, y = r ? new Array(p) : {};
  let g = 0;
  for (let _ = 0; _ < p; _++) {
    const x = r ? _ : h[_], w = n[x], C = i[x];
    if (w === C) {
      y[x] = w, (r ? _ < m : Wg.call(n, x)) && g++;
      continue;
    }
    if (w === null || C === null || typeof w != "object" || typeof C != "object") {
      y[x] = C;
      continue;
    }
    const D = wp(w, C, s + 1);
    y[x] = D, D === w && g++;
  }
  return m === p && g === m ? n : y;
}
function lu(n, i) {
  if (!i || Object.keys(n).length !== Object.keys(i).length)
    return !1;
  for (const s in n)
    if (n[s] !== i[s])
      return !1;
  return !0;
}
function Rm(n) {
  return Array.isArray(n) && n.length === Object.keys(n).length;
}
function Xo(n) {
  if (!qm(n))
    return !1;
  const i = n.constructor;
  if (i === void 0)
    return !0;
  const s = i.prototype;
  return !(!qm(s) || !s.hasOwnProperty("isPrototypeOf") || Object.getPrototypeOf(n) !== Object.prototype);
}
function qm(n) {
  return Object.prototype.toString.call(n) === "[object Object]";
}
function Pg(n) {
  return new Promise((i) => {
    Na.setTimeout(i, n);
  });
}
function Vo(n, i, s) {
  return typeof s.structuralSharing == "function" ? s.structuralSharing(n, i) : s.structuralSharing !== !1 ? wp(n, i) : i;
}
function eb(n, i, s = 0) {
  const r = [...n, i];
  return s && r.length > s ? r.slice(1) : r;
}
function tb(n, i, s = 0) {
  const r = [i, ...n];
  return s && r.length > s ? r.slice(0, -1) : r;
}
var oc = /* @__PURE__ */ Symbol();
function jp(n, i) {
  return !n.queryFn && i?.initialPromise ? () => i.initialPromise : !n.queryFn || n.queryFn === oc ? () => Promise.reject(new Error(`Missing queryFn: '${n.queryHash}'`)) : n.queryFn;
}
function cc(n, i) {
  return typeof n == "function" ? n(...i) : !!n;
}
function nb(n, i, s) {
  let r = !1, c;
  return Object.defineProperty(n, "signal", {
    enumerable: !0,
    get: () => (c ??= i(), r || (r = !0, c.aborted ? s() : c.addEventListener("abort", s, { once: !0 })), c)
  }), n;
}
var Dl = /* @__PURE__ */ (() => {
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
function Jo() {
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
  let n = [], i = 0, s = (p) => {
    p();
  }, r = (p) => {
    p();
  }, c = ab;
  const m = (p) => {
    i ? n.push(p) : c(() => {
      s(p);
    });
  }, h = () => {
    const p = n;
    n = [], p.length && c(() => {
      r(() => {
        p.forEach((y) => {
          s(y);
        });
      });
    });
  };
  return {
    batch: (p) => {
      let y;
      i++;
      try {
        y = p();
      } finally {
        i--, i || h();
      }
      return y;
    },
    /**
     * All calls to the wrapped function will be batched.
     */
    batchCalls: (p) => (...y) => {
      m(() => {
        p(...y);
      });
    },
    schedule: m,
    /**
     * Use this method to set a custom notify function.
     * This can be used to for example wrap notifications with `React.act` while running tests.
     */
    setNotifyFunction: (p) => {
      s = p;
    },
    /**
     * Use this method to set a custom function to batch notifications together into a single tick.
     * By default React Query will use the batch function provided by ReactDOM or React Native.
     */
    setBatchNotifyFunction: (p) => {
      r = p;
    },
    setScheduler: (p) => {
      c = p;
    }
  };
}
var tt = ib(), lb = class extends Ci {
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
}, su = new lb();
function sb(n) {
  return Math.min(1e3 * 2 ** n, 3e4);
}
function xp(n) {
  return (n ?? "online") === "online" ? su.isOnline() : !0;
}
var Fo = class extends Error {
  constructor(n) {
    super("CancelledError"), this.revert = n?.revert, this.silent = n?.silent;
  }
};
function Ep(n) {
  let i = !1, s = 0, r;
  const c = Jo(), m = () => c.status !== "pending", h = (B) => {
    if (!m()) {
      const V = new Fo(B);
      w(V), n.onCancel?.(V);
    }
  }, p = () => {
    i = !0;
  }, y = () => {
    i = !1;
  }, g = () => uc.isFocused() && (n.networkMode === "always" || su.isOnline()) && n.canRun(), _ = () => xp(n.networkMode) && n.canRun(), x = (B) => {
    m() || (r?.(), c.resolve(B));
  }, w = (B) => {
    m() || (r?.(), c.reject(B));
  }, C = () => new Promise((B) => {
    r = (V) => {
      (m() || g()) && B(V);
    }, n.onPause?.();
  }).then(() => {
    r = void 0, m() || n.onContinue?.();
  }), D = () => {
    if (m())
      return;
    let B;
    const V = s === 0 ? n.initialPromise : void 0;
    try {
      B = V ?? n.fn();
    } catch ($) {
      B = Promise.reject($);
    }
    Promise.resolve(B).then(x).catch(($) => {
      if (m())
        return;
      const ie = n.retry ?? (Dl.isServer() ? 0 : 3), Y = n.retryDelay ?? sb, ee = typeof Y == "function" ? Y(s, $) : Y, te = ie === !0 || typeof ie == "number" && s < ie || typeof ie == "function" && ie(s, $);
      if (i || !te) {
        w($);
        return;
      }
      s++, n.onFail?.(s, $), Pg(ee).then(() => g() ? void 0 : C()).then(() => {
        i ? w($) : D();
      });
    });
  };
  return {
    promise: c,
    status: () => c.status,
    cancel: h,
    continue: () => (r?.(), c),
    cancelRetry: p,
    continueRetry: y,
    canStart: _,
    start: () => (_() ? D() : C().then(D), c)
  };
}
var Tp = class {
  #e;
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout(), Ko(this.gcTime) && (this.#e = Na.setTimeout(() => {
      this.optionalRemove();
    }, this.gcTime));
  }
  updateGcTime(n) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      n ?? (Dl.isServer() ? 1 / 0 : 300 * 1e3)
    );
  }
  clearGcTimeout() {
    this.#e !== void 0 && (Na.clearTimeout(this.#e), this.#e = void 0);
  }
};
function ub(n) {
  return {
    onFetch: (i, s) => {
      const r = i.options, c = i.fetchOptions?.meta?.fetchMore?.direction, m = i.state.data?.pages || [], h = i.state.data?.pageParams || [];
      let p = { pages: [], pageParams: [] }, y = 0;
      const g = async () => {
        let _ = !1;
        const x = (D) => {
          nb(
            D,
            () => i.signal,
            () => _ = !0
          );
        }, w = jp(i.options, i.fetchOptions), C = async (D, B, V) => {
          if (_)
            return Promise.reject(i.signal.reason);
          if (B == null && D.pages.length)
            return Promise.resolve(D);
          const ie = (() => {
            const G = {
              client: i.client,
              queryKey: i.queryKey,
              pageParam: B,
              direction: V ? "backward" : "forward",
              meta: i.options.meta
            };
            return x(G), G;
          })(), Y = await w(ie), { maxPages: ee } = i.options, te = V ? tb : eb;
          return {
            pages: te(D.pages, Y, ee),
            pageParams: te(D.pageParams, B, ee)
          };
        };
        if (c && m.length) {
          const D = c === "backward", B = D ? rb : Um, V = {
            pages: m,
            pageParams: h
          }, $ = B(r, V);
          p = await C(V, $, D);
        } else {
          const D = n ?? m.length;
          do {
            const B = y === 0 ? h[0] ?? r.initialPageParam : Um(r, p);
            if (y > 0 && B == null)
              break;
            p = await C(p, B), y++;
          } while (y < D);
        }
        return p;
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
function Um(n, { pages: i, pageParams: s }) {
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
var ob = class extends Tp {
  #e;
  #t;
  #n;
  #a;
  #l;
  #i;
  #u;
  #s;
  constructor(n) {
    super(), this.#s = !1, this.#u = n.defaultOptions, this.setOptions(n.options), this.observers = [], this.#l = n.client, this.#a = this.#l.getQueryCache(), this.queryKey = n.queryKey, this.queryHash = n.queryHash, this.#t = Qm(this.options), this.state = n.state ?? this.#t, this.scheduleGc();
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
      const i = Qm(this.options);
      i.data !== void 0 && (this.setState(
        Zm(i.data, i.dataUpdatedAt)
      ), this.#t = i);
    }
  }
  optionalRemove() {
    !this.observers.length && this.state.fetchStatus === "idle" && this.#a.remove(this);
  }
  setData(n, i) {
    const s = Vo(this.state.data, n, this.options);
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
    return this.#i?.cancel(n), i ? i.then(yt).catch(yt) : Promise.resolve();
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
    return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === oc || !this.isFetched();
  }
  isFetched() {
    return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
  }
  isStatic() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => ra(n.options.staleTime, this) === "static"
    ) : !1;
  }
  isStale() {
    return this.getObserversCount() > 0 ? this.observers.some(
      (n) => n.getCurrentResult().isStale
    ) : this.state.data === void 0 || this.state.isInvalidated;
  }
  isStaleByTime(n = 0) {
    return this.state.data === void 0 ? !0 : n === "static" ? !1 : this.state.isInvalidated ? !0 : !zp(this.state.dataUpdatedAt, n);
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
        const x = {
          client: this.#l,
          queryKey: this.queryKey,
          meta: this.meta
        };
        return r(x), x;
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
    ) : this.options.behavior)?.onFetch(h, this), this.#n = this.state, (this.state.fetchStatus === "idle" || this.state.fetchMeta !== h.fetchOptions?.meta) && this.#r({ type: "fetch", meta: h.fetchOptions?.meta }), this.#i = Ep({
      initialPromise: i?.initialPromise,
      fn: h.fetchFn,
      onCancel: (y) => {
        y instanceof Fo && y.revert && this.setState({
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
      if (y instanceof Fo) {
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
            ...Ap(s.data, this.options),
            fetchMeta: n.meta ?? null
          };
        case "success":
          const r = {
            ...s,
            ...Zm(n.data, n.dataUpdatedAt),
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
function Ap(n, i) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: xp(i.networkMode) ? "fetching" : "paused",
    ...n === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function Zm(n, i) {
  return {
    data: n,
    dataUpdatedAt: i ?? Date.now(),
    error: null,
    isInvalidated: !1,
    status: "success"
  };
}
function Qm(n) {
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
var cb = class extends Ci {
  constructor(n, i) {
    super(), this.options = i, this.#e = n, this.#s = null, this.#u = Jo(), this.bindMethods(), this.setOptions(i);
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
    this.listeners.size === 1 && (this.#t.addObserver(this), km(this.#t, this.options) ? this.#h() : this.updateResult(), this.#b());
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return Io(
      this.#t,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return Io(
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
    ) && this.#h(), this.updateResult(), r && (this.#t !== s || Ut(this.options.enabled, this.#t) !== Ut(i.enabled, this.#t) || ra(this.options.staleTime, this.#t) !== ra(i.staleTime, this.#t)) && this.#v();
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
    return n?.throwOnError || (i = i.catch(yt)), i;
  }
  #v() {
    this.#_();
    const n = ra(
      this.options.staleTime,
      this.#t
    );
    if (Dl.isServer() || this.#a.isStale || !Ko(n))
      return;
    const s = zp(this.#a.dataUpdatedAt, n) + 1;
    this.#f = Na.setTimeout(() => {
      this.#a.isStale || this.updateResult();
    }, s);
  }
  #y() {
    return (typeof this.options.refetchInterval == "function" ? this.options.refetchInterval(this.#t) : this.options.refetchInterval) ?? !1;
  }
  #g(n) {
    this.#S(), this.#o = n, !(Dl.isServer() || Ut(this.options.enabled, this.#t) === !1 || !Ko(this.#o) || this.#o === 0) && (this.#d = Na.setInterval(() => {
      (this.options.refetchIntervalInBackground || uc.isFocused()) && this.#h();
    }, this.#o));
  }
  #b() {
    this.#v(), this.#g(this.#y());
  }
  #_() {
    this.#f !== void 0 && (Na.clearTimeout(this.#f), this.#f = void 0);
  }
  #S() {
    this.#d !== void 0 && (Na.clearInterval(this.#d), this.#d = void 0);
  }
  createResult(n, i) {
    const s = this.#t, r = this.options, c = this.#a, m = this.#l, h = this.#i, y = n !== s ? n.state : this.#n, { state: g } = n;
    let _ = { ...g }, x = !1, w;
    if (i._optimisticResults) {
      const k = this.hasListeners(), ne = !k && km(n, i), he = k && Hm(n, s, i, r);
      (ne || he) && (_ = {
        ..._,
        ...Ap(g.data, n.options)
      }), i._optimisticResults === "isRestoring" && (_.fetchStatus = "idle");
    }
    let { error: C, errorUpdatedAt: D, status: B } = _;
    w = _.data;
    let V = !1;
    if (i.placeholderData !== void 0 && w === void 0 && B === "pending") {
      let k;
      c?.isPlaceholderData && i.placeholderData === h?.placeholderData ? (k = c.data, V = !0) : k = typeof i.placeholderData == "function" ? i.placeholderData(
        this.#m?.state.data,
        this.#m
      ) : i.placeholderData, k !== void 0 && (B = "success", w = Vo(
        c?.data,
        k,
        i
      ), x = !0);
    }
    if (i.select && w !== void 0 && !V)
      if (c && w === m?.data && i.select === this.#c)
        w = this.#r;
      else
        try {
          this.#c = i.select, w = i.select(w), w = Vo(c?.data, w, i), this.#r = w, this.#s = null;
        } catch (k) {
          this.#s = k;
        }
    this.#s && (C = this.#s, w = this.#r, D = Date.now(), B = "error");
    const $ = _.fetchStatus === "fetching", ie = B === "pending", Y = B === "error", ee = ie && $, te = w !== void 0, A = {
      status: B,
      fetchStatus: _.fetchStatus,
      isPending: ie,
      isSuccess: B === "success",
      isError: Y,
      isInitialLoading: ee,
      isLoading: ee,
      data: w,
      dataUpdatedAt: _.dataUpdatedAt,
      error: C,
      errorUpdatedAt: D,
      failureCount: _.fetchFailureCount,
      failureReason: _.fetchFailureReason,
      errorUpdateCount: _.errorUpdateCount,
      isFetched: n.isFetched(),
      isFetchedAfterMount: _.dataUpdateCount > y.dataUpdateCount || _.errorUpdateCount > y.errorUpdateCount,
      isFetching: $,
      isRefetching: $ && !ie,
      isLoadingError: Y && !te,
      isPaused: _.fetchStatus === "paused",
      isPlaceholderData: x,
      isRefetchError: Y && te,
      isStale: fc(n, i),
      refetch: this.refetch,
      promise: this.#u,
      isEnabled: Ut(i.enabled, n) !== !1
    };
    if (this.options.experimental_prefetchInRender) {
      const k = A.data !== void 0, ne = A.status === "error" && !k, he = (je) => {
        ne ? je.reject(A.error) : k && je.resolve(A.data);
      }, ue = () => {
        const je = this.#u = A.promise = Jo();
        he(je);
      }, Oe = this.#u;
      switch (Oe.status) {
        case "pending":
          n.queryHash === s.queryHash && he(Oe);
          break;
        case "fulfilled":
          (ne || A.data !== Oe.value) && ue();
          break;
        case "rejected":
          (!ne || A.error !== Oe.reason) && ue();
          break;
      }
    }
    return A;
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
      return this.options.throwOnError && m.add("error"), Object.keys(this.#a).some((h) => {
        const p = h;
        return this.#a[p] !== n[p] && m.has(p);
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
function fb(n, i) {
  return Ut(i.enabled, n) !== !1 && n.state.data === void 0 && !(n.state.status === "error" && Ut(i.retryOnMount, n) === !1);
}
function km(n, i) {
  return fb(n, i) || n.state.data !== void 0 && Io(n, i, i.refetchOnMount);
}
function Io(n, i, s) {
  if (Ut(i.enabled, n) !== !1 && ra(i.staleTime, n) !== "static") {
    const r = typeof s == "function" ? s(n) : s;
    return r === "always" || r !== !1 && fc(n, i);
  }
  return !1;
}
function Hm(n, i, s, r) {
  return (n !== i || Ut(r.enabled, n) === !1) && (!s.suspense || n.state.status !== "error") && fc(n, s);
}
function fc(n, i) {
  return Ut(i.enabled, n) !== !1 && n.isStaleByTime(ra(i.staleTime, n));
}
function db(n, i) {
  return !lu(n.getCurrentResult(), i);
}
var hb = class extends Tp {
  #e;
  #t;
  #n;
  #a;
  constructor(n) {
    super(), this.#e = n.client, this.mutationId = n.mutationId, this.#n = n.mutationCache, this.#t = [], this.state = n.state || Op(), this.setOptions(n.options), this.scheduleGc();
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
    this.#a = Ep({
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
function Op() {
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
var mb = class extends Ci {
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
    const i = Ws(n);
    if (typeof i == "string") {
      const s = this.#t.get(i);
      s ? s.push(n) : this.#t.set(i, [n]);
    }
    this.notify({ type: "added", mutation: n });
  }
  remove(n) {
    if (this.#e.delete(n)) {
      const i = Ws(n);
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
    const i = Ws(n);
    if (typeof i == "string") {
      const r = this.#t.get(i)?.find(
        (c) => c.state.status === "pending"
      );
      return !r || r === n;
    } else
      return !0;
  }
  runNext(n) {
    const i = Ws(n);
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
      (s) => Dm(i, s)
    );
  }
  findAll(n = {}) {
    return this.getAll().filter((i) => Dm(n, i));
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
        n.map((i) => i.continue().catch(yt))
      )
    );
  }
};
function Ws(n) {
  return n.options.scope?.id;
}
var pb = class extends Ci {
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
    }), i?.mutationKey && this.options.mutationKey && Da(i.mutationKey) !== Da(this.options.mutationKey) ? this.reset() : this.#n?.state.status === "pending" && this.#n.setOptions(this.options);
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
    const n = this.#n?.state ?? Op();
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
}, vb = class extends Ci {
  constructor(n = {}) {
    super(), this.config = n, this.#e = /* @__PURE__ */ new Map();
  }
  #e;
  build(n, i, s) {
    const r = i.queryKey, c = i.queryHash ?? rc(r, i);
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
      (s) => Mm(i, s)
    );
  }
  findAll(n = {}) {
    const i = this.getAll();
    return Object.keys(n).length > 0 ? i.filter((s) => Mm(n, s)) : i;
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
    this.#i++, this.#i === 1 && (this.#u = uc.subscribe(async (n) => {
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
    return r === void 0 ? this.fetchQuery(n) : (n.revalidateIfStale && s.isStaleByTime(ra(i.staleTime, s)) && this.prefetchQuery(i), Promise.resolve(r));
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
    return Promise.all(r).then(yt).catch(yt);
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
        return s.throwOnError || (m = m.catch(yt)), c.state.fetchStatus === "paused" ? Promise.resolve() : m;
      })
    );
    return Promise.all(r).then(yt);
  }
  fetchQuery(n) {
    const i = this.defaultQueryOptions(n);
    i.retry === void 0 && (i.retry = !1);
    const s = this.#e.build(this, i);
    return s.isStaleByTime(
      ra(i.staleTime, s)
    ) ? s.fetch(i) : Promise.resolve(s.state.data);
  }
  prefetchQuery(n) {
    return this.fetchQuery(n).then(yt).catch(yt);
  }
  fetchInfiniteQuery(n) {
    return n._type = "infinite", this.fetchQuery(n);
  }
  prefetchInfiniteQuery(n) {
    return this.fetchInfiniteQuery(n).then(yt).catch(yt);
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
    this.#a.set(Da(n), {
      queryKey: n,
      defaultOptions: i
    });
  }
  getQueryDefaults(n) {
    const i = [...this.#a.values()], s = {};
    return i.forEach((r) => {
      Ml(n, r.queryKey) && Object.assign(s, r.defaultOptions);
    }), s;
  }
  setMutationDefaults(n, i) {
    this.#l.set(Da(n), {
      mutationKey: n,
      defaultOptions: i
    });
  }
  getMutationDefaults(n) {
    const i = [...this.#l.values()], s = {};
    return i.forEach((r) => {
      Ml(n, r.mutationKey) && Object.assign(s, r.defaultOptions);
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
    return i.queryHash || (i.queryHash = rc(
      i.queryKey,
      i
    )), i.refetchOnReconnect === void 0 && (i.refetchOnReconnect = i.networkMode !== "always"), i.throwOnError === void 0 && (i.throwOnError = !!i.suspense), !i.networkMode && i.persister && (i.networkMode = "offlineFirst"), i.queryFn === oc && (i.enabled = !1), i;
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
}, Cp = J.createContext(
  void 0
), Ni = (n) => {
  const i = J.useContext(Cp);
  if (!i)
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  return i;
}, gb = ({
  client: n,
  children: i
}) => (J.useEffect(() => (n.mount(), () => {
  n.unmount();
}), [n]), /* @__PURE__ */ d.jsx(Cp.Provider, { value: n, children: i })), Np = J.createContext(!1), bb = () => J.useContext(Np);
Np.Provider;
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
  const r = s?.state.error && typeof n.throwOnError == "function" ? cc(n.throwOnError, [s.state.error, s]) : n.throwOnError;
  (n.suspense || n.experimental_prefetchInRender || r) && (i.isReset() || (n.retryOnMount = !1));
}, jb = (n) => {
  J.useEffect(() => {
    n.clearReset();
  }, [n]);
}, xb = ({
  result: n,
  errorResetBoundary: i,
  throwOnError: s,
  query: r,
  suspense: c
}) => n.isError && !i.isReset() && !n.isFetching && r && (c && n.data === void 0 || cc(s, [n.error, r])), Eb = (n) => {
  if (n.suspense) {
    const s = (c) => c === "static" ? c : Math.max(c ?? 1e3, 1e3), r = n.staleTime;
    n.staleTime = typeof r == "function" ? (...c) => s(r(...c)) : s(r), typeof n.gcTime == "number" && (n.gcTime = Math.max(
      n.gcTime,
      1e3
    ));
  }
}, Tb = (n, i) => n.isLoading && n.isFetching && !i, Ab = (n, i) => n?.suspense && i.isPending, Bm = (n, i, s) => i.fetchOptimistic(n).catch(() => {
  s.clearReset();
});
function Ob(n, i, s) {
  const r = bb(), c = zb(), m = Ni(), h = m.defaultQueryOptions(n);
  m.getDefaultOptions().queries?._experimental_beforeQuery?.(
    h
  );
  const p = m.getQueryCache().get(h.queryHash), y = n.subscribed !== !1;
  h._optimisticResults = r ? "isRestoring" : y ? "optimistic" : void 0, Eb(h), wb(h, c, p), jb(c);
  const g = !m.getQueryCache().get(h.queryHash), [_] = J.useState(
    () => new i(
      m,
      h
    )
  ), x = _.getOptimisticResult(h), w = !r && y;
  if (J.useSyncExternalStore(
    J.useCallback(
      (C) => {
        const D = w ? _.subscribe(tt.batchCalls(C)) : yt;
        return _.updateResult(), D;
      },
      [_, w]
    ),
    () => _.getCurrentResult(),
    () => _.getCurrentResult()
  ), J.useEffect(() => {
    _.setOptions(h);
  }, [h, _]), Ab(h, x))
    throw Bm(h, _, c);
  if (xb({
    result: x,
    errorResetBoundary: c,
    throwOnError: h.throwOnError,
    query: p,
    suspense: h.suspense
  }))
    throw x.error;
  return m.getDefaultOptions().queries?._experimental_afterQuery?.(
    h,
    x
  ), h.experimental_prefetchInRender && !Dl.isServer() && Tb(x, r) && (g ? (
    // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
    Bm(h, _, c)
  ) : (
    // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
    p?.promise
  ))?.catch(yt).finally(() => {
    _.updateResult();
  }), h.notifyOnChangeProps ? x : _.trackResult(x);
}
function An(n, i) {
  return Ob(n, cb);
}
function qt(n, i) {
  const s = Ni(), [r] = J.useState(
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
      (h) => r.subscribe(tt.batchCalls(h)),
      [r]
    ),
    () => r.getCurrentResult(),
    () => r.getCurrentResult()
  ), m = J.useCallback(
    (h, p) => {
      r.mutate(h, p).catch(yt);
    },
    [r]
  );
  if (c.error && cc(r.options.throwOnError, [c.error]))
    throw c.error;
  return { ...c, mutate: m, mutateAsync: c.mutate };
}
var $m;
function q(n, i, s) {
  function r(p, y) {
    if (p._zod || Object.defineProperty(p, "_zod", {
      value: {
        def: y,
        constr: h,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), p._zod.traits.has(n))
      return;
    p._zod.traits.add(n), i(p, y);
    const g = h.prototype, _ = Object.keys(g);
    for (let x = 0; x < _.length; x++) {
      const w = _[x];
      w in p || (p[w] = g[w].bind(p));
    }
  }
  const c = s?.Parent ?? Object;
  class m extends c {
  }
  Object.defineProperty(m, "name", { value: n });
  function h(p) {
    var y;
    const g = s?.Parent ? new m() : this;
    r(g, p), (y = g._zod).deferred ?? (y.deferred = []);
    for (const _ of g._zod.deferred)
      _();
    return g;
  }
  return Object.defineProperty(h, "init", { value: r }), Object.defineProperty(h, Symbol.hasInstance, {
    value: (p) => s?.Parent && p instanceof s.Parent ? !0 : p?._zod?.traits?.has(n)
  }), Object.defineProperty(h, "name", { value: n }), h;
}
class Ei extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Mp extends Error {
  constructor(i) {
    super(`Encountered unidirectional transform during encode: ${i}`), this.name = "ZodEncodeError";
  }
}
($m = globalThis).__zod_globalConfig ?? ($m.__zod_globalConfig = {});
const dc = globalThis.__zod_globalConfig;
function On(n) {
  return dc;
}
function Dp(n) {
  const i = Object.values(n).filter((r) => typeof r == "number");
  return Object.entries(n).filter(([r, c]) => i.indexOf(+r) === -1).map(([r, c]) => c);
}
function Wo(n, i) {
  return typeof i == "bigint" ? i.toString() : i;
}
function hc(n) {
  return {
    get value() {
      {
        const i = n();
        return Object.defineProperty(this, "value", { value: i }), i;
      }
    }
  };
}
function mc(n) {
  return n == null;
}
function pc(n) {
  const i = n.startsWith("^") ? 1 : 0, s = n.endsWith("$") ? n.length - 1 : n.length;
  return n.slice(i, s);
}
function Cb(n, i) {
  const s = n / i, r = Math.round(s), c = Number.EPSILON * Math.max(Math.abs(s), 1);
  return Math.abs(s - r) < c ? 0 : s - r;
}
const Lm = /* @__PURE__ */ Symbol("evaluating");
function De(n, i, s) {
  let r;
  Object.defineProperty(n, i, {
    get() {
      if (r !== Lm)
        return r === void 0 && (r = Lm, r = s()), r;
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
function Ua(n, i, s) {
  Object.defineProperty(n, i, {
    value: s,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function oa(...n) {
  const i = {};
  for (const s of n) {
    const r = Object.getOwnPropertyDescriptors(s);
    Object.assign(i, r);
  }
  return Object.defineProperties({}, i);
}
function Gm(n) {
  return JSON.stringify(n);
}
function Nb(n) {
  return n.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Rp = "captureStackTrace" in Error ? Error.captureStackTrace : (...n) => {
};
function uu(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
const Mb = /* @__PURE__ */ hc(() => {
  if (dc.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const n = Function;
    return new n(""), !0;
  } catch {
    return !1;
  }
});
function Oi(n) {
  if (uu(n) === !1)
    return !1;
  const i = n.constructor;
  if (i === void 0 || typeof i != "function")
    return !0;
  const s = i.prototype;
  return !(uu(s) === !1 || Object.prototype.hasOwnProperty.call(s, "isPrototypeOf") === !1);
}
function qp(n) {
  return Oi(n) ? { ...n } : Array.isArray(n) ? [...n] : n instanceof Map ? new Map(n) : n instanceof Set ? new Set(n) : n;
}
const Db = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function du(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ca(n, i, s) {
  const r = new n._zod.constr(i ?? n._zod.def);
  return (!i || s?.parent) && (r._zod.parent = n), r;
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
  const m = oa(n._zod.def, {
    get shape() {
      const h = {};
      for (const p in i) {
        if (!(p in s.shape))
          throw new Error(`Unrecognized key: "${p}"`);
        i[p] && (h[p] = s.shape[p]);
      }
      return Ua(this, "shape", h), h;
    },
    checks: []
  });
  return ca(n, m);
}
function Zb(n, i) {
  const s = n._zod.def, r = s.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const m = oa(n._zod.def, {
    get shape() {
      const h = { ...n._zod.def.shape };
      for (const p in i) {
        if (!(p in s.shape))
          throw new Error(`Unrecognized key: "${p}"`);
        i[p] && delete h[p];
      }
      return Ua(this, "shape", h), h;
    },
    checks: []
  });
  return ca(n, m);
}
function Qb(n, i) {
  if (!Oi(i))
    throw new Error("Invalid input to extend: expected a plain object");
  const s = n._zod.def.checks;
  if (s && s.length > 0) {
    const m = n._zod.def.shape;
    for (const h in i)
      if (Object.getOwnPropertyDescriptor(m, h) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const c = oa(n._zod.def, {
    get shape() {
      const m = { ...n._zod.def.shape, ...i };
      return Ua(this, "shape", m), m;
    }
  });
  return ca(n, c);
}
function kb(n, i) {
  if (!Oi(i))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const s = oa(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i };
      return Ua(this, "shape", r), r;
    }
  });
  return ca(n, s);
}
function Hb(n, i) {
  if (n._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const s = oa(n._zod.def, {
    get shape() {
      const r = { ...n._zod.def.shape, ...i._zod.def.shape };
      return Ua(this, "shape", r), r;
    },
    get catchall() {
      return i._zod.def.catchall;
    },
    checks: i._zod.def.checks ?? []
  });
  return ca(n, s);
}
function Bb(n, i, s) {
  const c = i._zod.def.checks;
  if (c && c.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const h = oa(i._zod.def, {
    get shape() {
      const p = i._zod.def.shape, y = { ...p };
      if (s)
        for (const g in s) {
          if (!(g in p))
            throw new Error(`Unrecognized key: "${g}"`);
          s[g] && (y[g] = n ? new n({
            type: "optional",
            innerType: p[g]
          }) : p[g]);
        }
      else
        for (const g in p)
          y[g] = n ? new n({
            type: "optional",
            innerType: p[g]
          }) : p[g];
      return Ua(this, "shape", y), y;
    },
    checks: []
  });
  return ca(i, h);
}
function $b(n, i, s) {
  const r = oa(i._zod.def, {
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
      return Ua(this, "shape", m), m;
    }
  });
  return ca(i, r);
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
function xi(n, i) {
  return i.map((s) => {
    var r;
    return (r = s).path ?? (r.path = []), s.path.unshift(n), s;
  });
}
function Ps(n) {
  return typeof n == "string" ? n : n?.message;
}
function Cn(n, i, s) {
  const r = n.message ? n.message : Ps(n.inst?._zod.def?.error?.(n)) ?? Ps(i?.error?.(n)) ?? Ps(s.customError?.(n)) ?? Ps(s.localeError?.(n)) ?? "Invalid input", { inst: c, continue: m, input: h, ...p } = n;
  return p.path ?? (p.path = []), p.message = r, i?.reportInput && (p.input = h), p;
}
function vc(n) {
  return Array.isArray(n) ? "array" : typeof n == "string" ? "string" : "unknown";
}
function Rl(...n) {
  const [i, s, r] = n;
  return typeof i == "string" ? {
    message: i,
    code: "custom",
    input: s,
    inst: r
  } : { ...i };
}
const Up = (n, i) => {
  n.name = "$ZodError", Object.defineProperty(n, "_zod", {
    value: n._zod,
    enumerable: !1
  }), Object.defineProperty(n, "issues", {
    value: i,
    enumerable: !1
  }), n.message = JSON.stringify(i, Wo, 2), Object.defineProperty(n, "toString", {
    value: () => n.message,
    enumerable: !1
  });
}, Zp = q("$ZodError", Up), Qp = q("$ZodError", Up, { Parent: Error });
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
        h.errors.map((p) => r({ issues: p }, [...m, ...h.path]));
      else if (h.code === "invalid_key")
        r({ issues: h.issues }, [...m, ...h.path]);
      else if (h.code === "invalid_element")
        r({ issues: h.issues }, [...m, ...h.path]);
      else {
        const p = [...m, ...h.path];
        if (p.length === 0)
          s._errors.push(i(h));
        else {
          let y = s, g = 0;
          for (; g < p.length; ) {
            const _ = p[g];
            g === p.length - 1 ? (y[_] = y[_] || { _errors: [] }, y[_]._errors.push(i(h))) : y[_] = y[_] || { _errors: [] }, y = y[_], g++;
          }
        }
      }
  };
  return r(n), s;
}
const yc = (n) => (i, s, r, c) => {
  const m = r ? { ...r, async: !1 } : { async: !1 }, h = i._zod.run({ value: s, issues: [] }, m);
  if (h instanceof Promise)
    throw new Ei();
  if (h.issues.length) {
    const p = new (c?.Err ?? n)(h.issues.map((y) => Cn(y, m, On())));
    throw Rp(p, c?.callee), p;
  }
  return h.value;
}, gc = (n) => async (i, s, r, c) => {
  const m = r ? { ...r, async: !0 } : { async: !0 };
  let h = i._zod.run({ value: s, issues: [] }, m);
  if (h instanceof Promise && (h = await h), h.issues.length) {
    const p = new (c?.Err ?? n)(h.issues.map((y) => Cn(y, m, On())));
    throw Rp(p, c?.callee), p;
  }
  return h.value;
}, hu = (n) => (i, s, r) => {
  const c = r ? { ...r, async: !1 } : { async: !1 }, m = i._zod.run({ value: s, issues: [] }, c);
  if (m instanceof Promise)
    throw new Ei();
  return m.issues.length ? {
    success: !1,
    error: new (n ?? Zp)(m.issues.map((h) => Cn(h, c, On())))
  } : { success: !0, data: m.value };
}, Kb = /* @__PURE__ */ hu(Qp), mu = (n) => async (i, s, r) => {
  const c = r ? { ...r, async: !0 } : { async: !0 };
  let m = i._zod.run({ value: s, issues: [] }, c);
  return m instanceof Promise && (m = await m), m.issues.length ? {
    success: !1,
    error: new n(m.issues.map((h) => Cn(h, c, On())))
  } : { success: !0, data: m.value };
}, Xb = /* @__PURE__ */ mu(Qp), Vb = (n) => (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return yc(n)(i, s, c);
}, Jb = (n) => (i, s, r) => yc(n)(i, s, r), Fb = (n) => async (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return gc(n)(i, s, c);
}, Ib = (n) => async (i, s, r) => gc(n)(i, s, r), Wb = (n) => (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return hu(n)(i, s, c);
}, Pb = (n) => (i, s, r) => hu(n)(i, s, r), e0 = (n) => async (i, s, r) => {
  const c = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return mu(n)(i, s, c);
}, t0 = (n) => async (i, s, r) => mu(n)(i, s, r), n0 = /^[cC][0-9a-z]{6,}$/, a0 = /^[0-9a-z]+$/, i0 = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, l0 = /^[0-9a-vA-V]{20}$/, s0 = /^[A-Za-z0-9]{27}$/, u0 = /^[a-zA-Z0-9_-]{21}$/, r0 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, o0 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Ym = (n) => n ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${n}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, c0 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, f0 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function d0() {
  return new RegExp(f0, "u");
}
const h0 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, m0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, p0 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, v0 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, y0 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, kp = /^[A-Za-z0-9_-]*$/, g0 = /^https?$/, b0 = /^\+[1-9]\d{6,14}$/, Hp = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", _0 = /* @__PURE__ */ new RegExp(`^${Hp}$`);
function Bp(n) {
  const i = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof n.precision == "number" ? n.precision === -1 ? `${i}` : n.precision === 0 ? `${i}:[0-5]\\d` : `${i}:[0-5]\\d\\.\\d{${n.precision}}` : `${i}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function S0(n) {
  return new RegExp(`^${Bp(n)}$`);
}
function z0(n) {
  const i = Bp({ precision: n.precision }), s = ["Z"];
  n.local && s.push(""), n.offset && s.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${i}(?:${s.join("|")})`;
  return new RegExp(`^${Hp}T(?:${r})$`);
}
const w0 = (n) => {
  const i = n ? `[\\s\\S]{${n?.minimum ?? 0},${n?.maximum ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${i}$`);
}, j0 = /^-?\d+$/, $p = /^-?\d+(?:\.\d+)?$/, x0 = /^(?:true|false)$/i, E0 = /^null$/i, T0 = /^undefined$/i, A0 = /^[^A-Z]*$/, O0 = /^[^a-z]*$/, xt = /* @__PURE__ */ q("$ZodCheck", (n, i) => {
  var s;
  n._zod ?? (n._zod = {}), n._zod.def = i, (s = n._zod).onattach ?? (s.onattach = []);
}), Lp = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Gp = /* @__PURE__ */ q("$ZodCheckLessThan", (n, i) => {
  xt.init(n, i);
  const s = Lp[typeof i.value];
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
}), Yp = /* @__PURE__ */ q("$ZodCheckGreaterThan", (n, i) => {
  xt.init(n, i);
  const s = Lp[typeof i.value];
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
    const p = h._zod.bag;
    p.format = i.format, p.minimum = c, p.maximum = m, s && (p.pattern = j0);
  }), n._zod.check = (h) => {
    const p = h.value;
    if (s) {
      if (!Number.isInteger(p)) {
        h.issues.push({
          expected: r,
          format: i.format,
          code: "invalid_type",
          continue: !1,
          input: p,
          inst: n
        });
        return;
      }
      if (!Number.isSafeInteger(p)) {
        p > 0 ? h.issues.push({
          input: p,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: n,
          origin: r,
          inclusive: !0,
          continue: !i.abort
        }) : h.issues.push({
          input: p,
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
    p < c && h.issues.push({
      origin: "number",
      input: p,
      code: "too_small",
      minimum: c,
      inclusive: !0,
      inst: n,
      continue: !i.abort
    }), p > m && h.issues.push({
      origin: "number",
      input: p,
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
    return !mc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    i.maximum < c && (r._zod.bag.maximum = i.maximum);
  }), n._zod.check = (r) => {
    const c = r.value;
    if (c.length <= i.maximum)
      return;
    const h = vc(c);
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
    return !mc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    i.minimum > c && (r._zod.bag.minimum = i.minimum);
  }), n._zod.check = (r) => {
    const c = r.value;
    if (c.length >= i.minimum)
      return;
    const h = vc(c);
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
    return !mc(c) && c.length !== void 0;
  }), n._zod.onattach.push((r) => {
    const c = r._zod.bag;
    c.minimum = i.length, c.maximum = i.length, c.length = i.length;
  }), n._zod.check = (r) => {
    const c = r.value, m = c.length;
    if (m === i.length)
      return;
    const h = vc(c), p = m > i.length;
    r.issues.push({
      origin: h,
      ...p ? { code: "too_big", maximum: i.length } : { code: "too_small", minimum: i.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: n,
      continue: !i.abort
    });
  };
}), pu = /* @__PURE__ */ q("$ZodCheckStringFormat", (n, i) => {
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
}), U0 = /* @__PURE__ */ q("$ZodCheckLowerCase", (n, i) => {
  i.pattern ?? (i.pattern = A0), pu.init(n, i);
}), Z0 = /* @__PURE__ */ q("$ZodCheckUpperCase", (n, i) => {
  i.pattern ?? (i.pattern = O0), pu.init(n, i);
}), Q0 = /* @__PURE__ */ q("$ZodCheckIncludes", (n, i) => {
  xt.init(n, i);
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
}), k0 = /* @__PURE__ */ q("$ZodCheckStartsWith", (n, i) => {
  xt.init(n, i);
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
}), H0 = /* @__PURE__ */ q("$ZodCheckEndsWith", (n, i) => {
  xt.init(n, i);
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
}), B0 = /* @__PURE__ */ q("$ZodCheckOverwrite", (n, i) => {
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
}, ke = /* @__PURE__ */ q("$ZodType", (n, i) => {
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
    const c = (h, p, y) => {
      let g = ji(h), _;
      for (const x of p) {
        if (x._zod.def.when) {
          if (Lb(h) || !x._zod.def.when(h))
            continue;
        } else if (g)
          continue;
        const w = h.issues.length, C = x._zod.check(h);
        if (C instanceof Promise && y?.async === !1)
          throw new Ei();
        if (_ || C instanceof Promise)
          _ = (_ ?? Promise.resolve()).then(async () => {
            await C, h.issues.length !== w && (g || (g = ji(h, w)));
          });
        else {
          if (h.issues.length === w)
            continue;
          g || (g = ji(h, w));
        }
      }
      return _ ? _.then(() => h) : h;
    }, m = (h, p, y) => {
      if (ji(h))
        return h.aborted = !0, h;
      const g = c(p, r, y);
      if (g instanceof Promise) {
        if (y.async === !1)
          throw new Ei();
        return g.then((_) => n._zod.parse(_, y));
      }
      return n._zod.parse(g, y);
    };
    n._zod.run = (h, p) => {
      if (p.skipChecks)
        return n._zod.parse(h, p);
      if (p.direction === "backward") {
        const g = n._zod.parse({ value: h.value, issues: [] }, { ...p, skipChecks: !0 });
        return g instanceof Promise ? g.then((_) => m(_, h, p)) : m(g, h, p);
      }
      const y = n._zod.parse(h, p);
      if (y instanceof Promise) {
        if (p.async === !1)
          throw new Ei();
        return y.then((g) => c(g, r, p));
      }
      return c(y, r, p);
    };
  }
  De(n, "~standard", () => ({
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
}), bc = /* @__PURE__ */ q("$ZodString", (n, i) => {
  ke.init(n, i), n._zod.pattern = [...n?._zod.bag?.patterns ?? []].pop() ?? w0(n._zod.bag), n._zod.parse = (s, r) => {
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
}), He = /* @__PURE__ */ q("$ZodStringFormat", (n, i) => {
  pu.init(n, i), bc.init(n, i);
}), G0 = /* @__PURE__ */ q("$ZodGUID", (n, i) => {
  i.pattern ?? (i.pattern = o0), He.init(n, i);
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
    i.pattern ?? (i.pattern = Ym(r));
  } else
    i.pattern ?? (i.pattern = Ym());
  He.init(n, i);
}), K0 = /* @__PURE__ */ q("$ZodEmail", (n, i) => {
  i.pattern ?? (i.pattern = c0), He.init(n, i);
}), X0 = /* @__PURE__ */ q("$ZodURL", (n, i) => {
  He.init(n, i), n._zod.check = (s) => {
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
  i.pattern ?? (i.pattern = d0()), He.init(n, i);
}), J0 = /* @__PURE__ */ q("$ZodNanoID", (n, i) => {
  i.pattern ?? (i.pattern = u0), He.init(n, i);
}), F0 = /* @__PURE__ */ q("$ZodCUID", (n, i) => {
  i.pattern ?? (i.pattern = n0), He.init(n, i);
}), I0 = /* @__PURE__ */ q("$ZodCUID2", (n, i) => {
  i.pattern ?? (i.pattern = a0), He.init(n, i);
}), W0 = /* @__PURE__ */ q("$ZodULID", (n, i) => {
  i.pattern ?? (i.pattern = i0), He.init(n, i);
}), P0 = /* @__PURE__ */ q("$ZodXID", (n, i) => {
  i.pattern ?? (i.pattern = l0), He.init(n, i);
}), e_ = /* @__PURE__ */ q("$ZodKSUID", (n, i) => {
  i.pattern ?? (i.pattern = s0), He.init(n, i);
}), t_ = /* @__PURE__ */ q("$ZodISODateTime", (n, i) => {
  i.pattern ?? (i.pattern = z0(i)), He.init(n, i);
}), n_ = /* @__PURE__ */ q("$ZodISODate", (n, i) => {
  i.pattern ?? (i.pattern = _0), He.init(n, i);
}), a_ = /* @__PURE__ */ q("$ZodISOTime", (n, i) => {
  i.pattern ?? (i.pattern = S0(i)), He.init(n, i);
}), i_ = /* @__PURE__ */ q("$ZodISODuration", (n, i) => {
  i.pattern ?? (i.pattern = r0), He.init(n, i);
}), l_ = /* @__PURE__ */ q("$ZodIPv4", (n, i) => {
  i.pattern ?? (i.pattern = h0), He.init(n, i), n._zod.bag.format = "ipv4";
}), s_ = /* @__PURE__ */ q("$ZodIPv6", (n, i) => {
  i.pattern ?? (i.pattern = m0), He.init(n, i), n._zod.bag.format = "ipv6", n._zod.check = (s) => {
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
  i.pattern ?? (i.pattern = p0), He.init(n, i);
}), r_ = /* @__PURE__ */ q("$ZodCIDRv6", (n, i) => {
  i.pattern ?? (i.pattern = v0), He.init(n, i), n._zod.check = (s) => {
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
function Kp(n) {
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
  i.pattern ?? (i.pattern = y0), He.init(n, i), n._zod.bag.contentEncoding = "base64", n._zod.check = (s) => {
    Kp(s.value) || s.issues.push({
      code: "invalid_format",
      format: "base64",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
});
function c_(n) {
  if (!kp.test(n))
    return !1;
  const i = n.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), s = i.padEnd(Math.ceil(i.length / 4) * 4, "=");
  return Kp(s);
}
const f_ = /* @__PURE__ */ q("$ZodBase64URL", (n, i) => {
  i.pattern ?? (i.pattern = kp), He.init(n, i), n._zod.bag.contentEncoding = "base64url", n._zod.check = (s) => {
    c_(s.value) || s.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), d_ = /* @__PURE__ */ q("$ZodE164", (n, i) => {
  i.pattern ?? (i.pattern = b0), He.init(n, i);
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
  He.init(n, i), n._zod.check = (s) => {
    h_(s.value, i.alg) || s.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: s.value,
      inst: n,
      continue: !i.abort
    });
  };
}), Xp = /* @__PURE__ */ q("$ZodNumber", (n, i) => {
  ke.init(n, i), n._zod.pattern = n._zod.bag.pattern ?? $p, n._zod.parse = (s, r) => {
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
  N0.init(n, i), Xp.init(n, i);
}), v_ = /* @__PURE__ */ q("$ZodBoolean", (n, i) => {
  ke.init(n, i), n._zod.pattern = x0, n._zod.parse = (s, r) => {
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
  ke.init(n, i), n._zod.pattern = T0, n._zod.values = /* @__PURE__ */ new Set([void 0]), n._zod.parse = (s, r) => {
    const c = s.value;
    return typeof c > "u" || s.issues.push({
      expected: "undefined",
      code: "invalid_type",
      input: c,
      inst: n
    }), s;
  };
}), g_ = /* @__PURE__ */ q("$ZodNull", (n, i) => {
  ke.init(n, i), n._zod.pattern = E0, n._zod.values = /* @__PURE__ */ new Set([null]), n._zod.parse = (s, r) => {
    const c = s.value;
    return c === null || s.issues.push({
      expected: "null",
      code: "invalid_type",
      input: c,
      inst: n
    }), s;
  };
}), b_ = /* @__PURE__ */ q("$ZodUnknown", (n, i) => {
  ke.init(n, i), n._zod.parse = (s) => s;
}), __ = /* @__PURE__ */ q("$ZodNever", (n, i) => {
  ke.init(n, i), n._zod.parse = (s, r) => (s.issues.push({
    expected: "never",
    code: "invalid_type",
    input: s.value,
    inst: n
  }), s);
});
function Km(n, i, s) {
  n.issues.length && i.issues.push(...xi(s, n.issues)), i.value[s] = n.value;
}
const S_ = /* @__PURE__ */ q("$ZodArray", (n, i) => {
  ke.init(n, i), n._zod.parse = (s, r) => {
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
      const p = c[h], y = i.element._zod.run({
        value: p,
        issues: []
      }, r);
      y instanceof Promise ? m.push(y.then((g) => Km(g, s, h))) : Km(y, s, h);
    }
    return m.length ? Promise.all(m).then(() => s) : s;
  };
});
function ru(n, i, s, r, c, m) {
  const h = s in r;
  if (n.issues.length) {
    if (c && m && !h)
      return;
    i.issues.push(...xi(s, n.issues));
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
function Vp(n) {
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
function Jp(n, i, s, r, c, m) {
  const h = [], p = c.keySet, y = c.catchall._zod, g = y.def.type, _ = y.optin === "optional", x = y.optout === "optional";
  for (const w in i) {
    if (w === "__proto__" || p.has(w))
      continue;
    if (g === "never") {
      h.push(w);
      continue;
    }
    const C = y.run({ value: i[w], issues: [] }, r);
    C instanceof Promise ? n.push(C.then((D) => ru(D, s, w, i, _, x))) : ru(C, s, w, i, _, x);
  }
  return h.length && s.issues.push({
    code: "unrecognized_keys",
    keys: h,
    input: i,
    inst: m
  }), n.length ? Promise.all(n).then(() => s) : s;
}
const z_ = /* @__PURE__ */ q("$ZodObject", (n, i) => {
  if (ke.init(n, i), !Object.getOwnPropertyDescriptor(i, "shape")?.get) {
    const p = i.shape;
    Object.defineProperty(i, "shape", {
      get: () => {
        const y = { ...p };
        return Object.defineProperty(i, "shape", {
          value: y
        }), y;
      }
    });
  }
  const r = hc(() => Vp(i));
  De(n._zod, "propValues", () => {
    const p = i.shape, y = {};
    for (const g in p) {
      const _ = p[g]._zod;
      if (_.values) {
        y[g] ?? (y[g] = /* @__PURE__ */ new Set());
        for (const x of _.values)
          y[g].add(x);
      }
    }
    return y;
  });
  const c = uu, m = i.catchall;
  let h;
  n._zod.parse = (p, y) => {
    h ?? (h = r.value);
    const g = p.value;
    if (!c(g))
      return p.issues.push({
        expected: "object",
        code: "invalid_type",
        input: g,
        inst: n
      }), p;
    p.value = {};
    const _ = [], x = h.shape;
    for (const w of h.keys) {
      const C = x[w], D = C._zod.optin === "optional", B = C._zod.optout === "optional", V = C._zod.run({ value: g[w], issues: [] }, y);
      V instanceof Promise ? _.push(V.then(($) => ru($, p, w, g, D, B))) : ru(V, p, w, g, D, B);
    }
    return m ? Jp(_, g, p, y, r.value, n) : _.length ? Promise.all(_).then(() => p) : p;
  };
}), w_ = /* @__PURE__ */ q("$ZodObjectJIT", (n, i) => {
  z_.init(n, i);
  const s = n._zod.parse, r = hc(() => Vp(i)), c = (w) => {
    const C = new $0(["shape", "payload", "ctx"]), D = r.value, B = (Y) => {
      const ee = Gm(Y);
      return `shape[${ee}]._zod.run({ value: input[${ee}], issues: [] }, ctx)`;
    };
    C.write("const input = payload.value;");
    const V = /* @__PURE__ */ Object.create(null);
    let $ = 0;
    for (const Y of D.keys)
      V[Y] = `key_${$++}`;
    C.write("const newResult = {};");
    for (const Y of D.keys) {
      const ee = V[Y], te = Gm(Y), G = w[Y], A = G?._zod?.optin === "optional", k = G?._zod?.optout === "optional";
      C.write(`const ${ee} = ${B(Y)};`), A && k ? C.write(`
        if (${ee}.issues.length) {
          if (${te} in input) {
            payload.issues = payload.issues.concat(${ee}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${te}, ...iss.path] : [${te}]
            })));
          }
        }
        
        if (${ee}.value === undefined) {
          if (${te} in input) {
            newResult[${te}] = undefined;
          }
        } else {
          newResult[${te}] = ${ee}.value;
        }
        
      `) : A ? C.write(`
        if (${ee}.issues.length) {
          payload.issues = payload.issues.concat(${ee}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${te}, ...iss.path] : [${te}]
          })));
        }
        
        if (${ee}.value === undefined) {
          if (${te} in input) {
            newResult[${te}] = undefined;
          }
        } else {
          newResult[${te}] = ${ee}.value;
        }
        
      `) : C.write(`
        const ${ee}_present = ${te} in input;
        if (${ee}.issues.length) {
          payload.issues = payload.issues.concat(${ee}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${te}, ...iss.path] : [${te}]
          })));
        }
        if (!${ee}_present && !${ee}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${te}]
          });
        }

        if (${ee}_present) {
          if (${ee}.value === undefined) {
            newResult[${te}] = undefined;
          } else {
            newResult[${te}] = ${ee}.value;
          }
        }

      `);
    }
    C.write("payload.value = newResult;"), C.write("return payload;");
    const ie = C.compile();
    return (Y, ee) => ie(w, Y, ee);
  };
  let m;
  const h = uu, p = !dc.jitless, g = p && Mb.value, _ = i.catchall;
  let x;
  n._zod.parse = (w, C) => {
    x ?? (x = r.value);
    const D = w.value;
    return h(D) ? p && g && C?.async === !1 && C.jitless !== !0 ? (m || (m = c(i.shape)), w = m(w, C), _ ? Jp([], D, w, C, x, n) : w) : s(w, C) : (w.issues.push({
      expected: "object",
      code: "invalid_type",
      input: D,
      inst: n
    }), w);
  };
});
function Xm(n, i, s, r) {
  for (const m of n)
    if (m.issues.length === 0)
      return i.value = m.value, i;
  const c = n.filter((m) => !ji(m));
  return c.length === 1 ? (i.value = c[0].value, c[0]) : (i.issues.push({
    code: "invalid_union",
    input: i.value,
    inst: s,
    errors: n.map((m) => m.issues.map((h) => Cn(h, r, On())))
  }), i);
}
const j_ = /* @__PURE__ */ q("$ZodUnion", (n, i) => {
  ke.init(n, i), De(n._zod, "optin", () => i.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), De(n._zod, "optout", () => i.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), De(n._zod, "values", () => {
    if (i.options.every((r) => r._zod.values))
      return new Set(i.options.flatMap((r) => Array.from(r._zod.values)));
  }), De(n._zod, "pattern", () => {
    if (i.options.every((r) => r._zod.pattern)) {
      const r = i.options.map((c) => c._zod.pattern);
      return new RegExp(`^(${r.map((c) => pc(c.source)).join("|")})$`);
    }
  });
  const s = i.options.length === 1 ? i.options[0]._zod.run : null;
  n._zod.parse = (r, c) => {
    if (s)
      return s(r, c);
    let m = !1;
    const h = [];
    for (const p of i.options) {
      const y = p._zod.run({
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
    return m ? Promise.all(h).then((p) => Xm(p, r, n, c)) : Xm(h, r, n, c);
  };
}), x_ = /* @__PURE__ */ q("$ZodIntersection", (n, i) => {
  ke.init(n, i), n._zod.parse = (s, r) => {
    const c = s.value, m = i.left._zod.run({ value: c, issues: [] }, r), h = i.right._zod.run({ value: c, issues: [] }, r);
    return m instanceof Promise || h instanceof Promise ? Promise.all([m, h]).then(([y, g]) => Vm(s, y, g)) : Vm(s, m, h);
  };
});
function Po(n, i) {
  if (n === i)
    return { valid: !0, data: n };
  if (n instanceof Date && i instanceof Date && +n == +i)
    return { valid: !0, data: n };
  if (Oi(n) && Oi(i)) {
    const s = Object.keys(i), r = Object.keys(n).filter((m) => s.indexOf(m) !== -1), c = { ...n, ...i };
    for (const m of r) {
      const h = Po(n[m], i[m]);
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
      const c = n[r], m = i[r], h = Po(c, m);
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
function Vm(n, i, s) {
  const r = /* @__PURE__ */ new Map();
  let c;
  for (const p of i.issues)
    if (p.code === "unrecognized_keys") {
      c ?? (c = p);
      for (const y of p.keys)
        r.has(y) || r.set(y, {}), r.get(y).l = !0;
    } else
      n.issues.push(p);
  for (const p of s.issues)
    if (p.code === "unrecognized_keys")
      for (const y of p.keys)
        r.has(y) || r.set(y, {}), r.get(y).r = !0;
    else
      n.issues.push(p);
  const m = [...r].filter(([, p]) => p.l && p.r).map(([p]) => p);
  if (m.length && c && n.issues.push({ ...c, keys: m }), ji(n))
    return n;
  const h = Po(i.value, s.value);
  if (!h.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(h.mergeErrorPath)}`);
  return n.value = h.data, n;
}
const E_ = /* @__PURE__ */ q("$ZodRecord", (n, i) => {
  ke.init(n, i), n._zod.parse = (s, r) => {
    const c = s.value;
    if (!Oi(c))
      return s.issues.push({
        expected: "record",
        code: "invalid_type",
        input: c,
        inst: n
      }), s;
    const m = [], h = i.keyType._zod.values;
    if (h) {
      s.value = {};
      const p = /* @__PURE__ */ new Set();
      for (const g of h)
        if (typeof g == "string" || typeof g == "number" || typeof g == "symbol") {
          p.add(typeof g == "number" ? g.toString() : g);
          const _ = i.keyType._zod.run({ value: g, issues: [] }, r);
          if (_ instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          if (_.issues.length) {
            s.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: _.issues.map((C) => Cn(C, r, On())),
              input: g,
              path: [g],
              inst: n
            });
            continue;
          }
          const x = _.value, w = i.valueType._zod.run({ value: c[g], issues: [] }, r);
          w instanceof Promise ? m.push(w.then((C) => {
            C.issues.length && s.issues.push(...xi(g, C.issues)), s.value[x] = C.value;
          })) : (w.issues.length && s.issues.push(...xi(g, w.issues)), s.value[x] = w.value);
        }
      let y;
      for (const g in c)
        p.has(g) || (y = y ?? [], y.push(g));
      y && y.length > 0 && s.issues.push({
        code: "unrecognized_keys",
        input: c,
        inst: n,
        keys: y
      });
    } else {
      s.value = {};
      for (const p of Reflect.ownKeys(c)) {
        if (p === "__proto__" || !Object.prototype.propertyIsEnumerable.call(c, p))
          continue;
        let y = i.keyType._zod.run({ value: p, issues: [] }, r);
        if (y instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof p == "string" && $p.test(p) && y.issues.length) {
          const x = i.keyType._zod.run({ value: Number(p), issues: [] }, r);
          if (x instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          x.issues.length === 0 && (y = x);
        }
        if (y.issues.length) {
          i.mode === "loose" ? s.value[p] = c[p] : s.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: y.issues.map((x) => Cn(x, r, On())),
            input: p,
            path: [p],
            inst: n
          });
          continue;
        }
        const _ = i.valueType._zod.run({ value: c[p], issues: [] }, r);
        _ instanceof Promise ? m.push(_.then((x) => {
          x.issues.length && s.issues.push(...xi(p, x.issues)), s.value[y.value] = x.value;
        })) : (_.issues.length && s.issues.push(...xi(p, _.issues)), s.value[y.value] = _.value);
      }
    }
    return m.length ? Promise.all(m).then(() => s) : s;
  };
}), T_ = /* @__PURE__ */ q("$ZodEnum", (n, i) => {
  ke.init(n, i);
  const s = Dp(i.entries), r = new Set(s);
  n._zod.values = r, n._zod.pattern = new RegExp(`^(${s.filter((c) => Db.has(typeof c)).map((c) => typeof c == "string" ? du(c) : c.toString()).join("|")})$`), n._zod.parse = (c, m) => {
    const h = c.value;
    return r.has(h) || c.issues.push({
      code: "invalid_value",
      values: s,
      input: h,
      inst: n
    }), c;
  };
}), A_ = /* @__PURE__ */ q("$ZodTransform", (n, i) => {
  ke.init(n, i), n._zod.optin = "optional", n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      throw new Mp(n.constructor.name);
    const c = i.transform(s.value, s);
    if (r.async)
      return (c instanceof Promise ? c : Promise.resolve(c)).then((h) => (s.value = h, s.fallback = !0, s));
    if (c instanceof Promise)
      throw new Ei();
    return s.value = c, s.fallback = !0, s;
  };
});
function Jm(n, i) {
  return i === void 0 && (n.issues.length || n.fallback) ? { issues: [], value: void 0 } : n;
}
const Fp = /* @__PURE__ */ q("$ZodOptional", (n, i) => {
  ke.init(n, i), n._zod.optin = "optional", n._zod.optout = "optional", De(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, void 0]) : void 0), De(n._zod, "pattern", () => {
    const s = i.innerType._zod.pattern;
    return s ? new RegExp(`^(${pc(s.source)})?$`) : void 0;
  }), n._zod.parse = (s, r) => {
    if (i.innerType._zod.optin === "optional") {
      const c = s.value, m = i.innerType._zod.run(s, r);
      return m instanceof Promise ? m.then((h) => Jm(h, c)) : Jm(m, c);
    }
    return s.value === void 0 ? s : i.innerType._zod.run(s, r);
  };
}), O_ = /* @__PURE__ */ q("$ZodExactOptional", (n, i) => {
  Fp.init(n, i), De(n._zod, "values", () => i.innerType._zod.values), De(n._zod, "pattern", () => i.innerType._zod.pattern), n._zod.parse = (s, r) => i.innerType._zod.run(s, r);
}), C_ = /* @__PURE__ */ q("$ZodNullable", (n, i) => {
  ke.init(n, i), De(n._zod, "optin", () => i.innerType._zod.optin), De(n._zod, "optout", () => i.innerType._zod.optout), De(n._zod, "pattern", () => {
    const s = i.innerType._zod.pattern;
    return s ? new RegExp(`^(${pc(s.source)}|null)$`) : void 0;
  }), De(n._zod, "values", () => i.innerType._zod.values ? /* @__PURE__ */ new Set([...i.innerType._zod.values, null]) : void 0), n._zod.parse = (s, r) => s.value === null ? s : i.innerType._zod.run(s, r);
}), N_ = /* @__PURE__ */ q("$ZodDefault", (n, i) => {
  ke.init(n, i), n._zod.optin = "optional", De(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    if (s.value === void 0)
      return s.value = i.defaultValue, s;
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => Fm(m, i)) : Fm(c, i);
  };
});
function Fm(n, i) {
  return n.value === void 0 && (n.value = i.defaultValue), n;
}
const M_ = /* @__PURE__ */ q("$ZodPrefault", (n, i) => {
  ke.init(n, i), n._zod.optin = "optional", De(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => (r.direction === "backward" || s.value === void 0 && (s.value = i.defaultValue), i.innerType._zod.run(s, r));
}), D_ = /* @__PURE__ */ q("$ZodNonOptional", (n, i) => {
  ke.init(n, i), De(n._zod, "values", () => {
    const s = i.innerType._zod.values;
    return s ? new Set([...s].filter((r) => r !== void 0)) : void 0;
  }), n._zod.parse = (s, r) => {
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => Im(m, n)) : Im(c, n);
  };
});
function Im(n, i) {
  return !n.issues.length && n.value === void 0 && n.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: n.value,
    inst: i
  }), n;
}
const R_ = /* @__PURE__ */ q("$ZodCatch", (n, i) => {
  ke.init(n, i), n._zod.optin = "optional", De(n._zod, "optout", () => i.innerType._zod.optout), De(n._zod, "values", () => i.innerType._zod.values), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => (s.value = m.value, m.issues.length && (s.value = i.catchValue({
      ...s,
      error: {
        issues: m.issues.map((h) => Cn(h, r, On()))
      },
      input: s.value
    }), s.issues = [], s.fallback = !0), s)) : (s.value = c.value, c.issues.length && (s.value = i.catchValue({
      ...s,
      error: {
        issues: c.issues.map((m) => Cn(m, r, On()))
      },
      input: s.value
    }), s.issues = [], s.fallback = !0), s);
  };
}), q_ = /* @__PURE__ */ q("$ZodPipe", (n, i) => {
  ke.init(n, i), De(n._zod, "values", () => i.in._zod.values), De(n._zod, "optin", () => i.in._zod.optin), De(n._zod, "optout", () => i.out._zod.optout), De(n._zod, "propValues", () => i.in._zod.propValues), n._zod.parse = (s, r) => {
    if (r.direction === "backward") {
      const m = i.out._zod.run(s, r);
      return m instanceof Promise ? m.then((h) => eu(h, i.in, r)) : eu(m, i.in, r);
    }
    const c = i.in._zod.run(s, r);
    return c instanceof Promise ? c.then((m) => eu(m, i.out, r)) : eu(c, i.out, r);
  };
});
function eu(n, i, s) {
  return n.issues.length ? (n.aborted = !0, n) : i._zod.run({ value: n.value, issues: n.issues, fallback: n.fallback }, s);
}
const U_ = /* @__PURE__ */ q("$ZodReadonly", (n, i) => {
  ke.init(n, i), De(n._zod, "propValues", () => i.innerType._zod.propValues), De(n._zod, "values", () => i.innerType._zod.values), De(n._zod, "optin", () => i.innerType?._zod?.optin), De(n._zod, "optout", () => i.innerType?._zod?.optout), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      return i.innerType._zod.run(s, r);
    const c = i.innerType._zod.run(s, r);
    return c instanceof Promise ? c.then(Wm) : Wm(c);
  };
});
function Wm(n) {
  return n.value = Object.freeze(n.value), n;
}
const Z_ = /* @__PURE__ */ q("$ZodCustom", (n, i) => {
  xt.init(n, i), ke.init(n, i), n._zod.parse = (s, r) => s, n._zod.check = (s) => {
    const r = s.value, c = i.fn(r);
    if (c instanceof Promise)
      return c.then((m) => Pm(m, s, r, n));
    Pm(c, s, r, n);
  };
});
function Pm(n, i, s, r) {
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
    r._zod.def.params && (c.params = r._zod.def.params), i.issues.push(Rl(c));
  }
}
var ep;
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
(ep = globalThis).__zod_globalRegistry ?? (ep.__zod_globalRegistry = k_());
const Nl = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function H_(n, i) {
  return new n({
    type: "string",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function B_(n, i) {
  return new n({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function tp(n, i) {
  return new n({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function $_(n, i) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...P(i)
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
    ...P(i)
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
    ...P(i)
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
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function K_(n, i) {
  return new n({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function X_(n, i) {
  return new n({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function V_(n, i) {
  return new n({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function J_(n, i) {
  return new n({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function F_(n, i) {
  return new n({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function I_(n, i) {
  return new n({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function W_(n, i) {
  return new n({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function P_(n, i) {
  return new n({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function eS(n, i) {
  return new n({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function tS(n, i) {
  return new n({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function nS(n, i) {
  return new n({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function aS(n, i) {
  return new n({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function iS(n, i) {
  return new n({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function lS(n, i) {
  return new n({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function sS(n, i) {
  return new n({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function uS(n, i) {
  return new n({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...P(i)
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
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function oS(n, i) {
  return new n({
    type: "string",
    format: "date",
    check: "string_format",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function cS(n, i) {
  return new n({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function fS(n, i) {
  return new n({
    type: "string",
    format: "duration",
    check: "string_format",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function dS(n, i) {
  return new n({
    type: "number",
    checks: [],
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function hS(n, i) {
  return new n({
    type: "number",
    coerce: !0,
    checks: [],
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function mS(n, i) {
  return new n({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function pS(n, i) {
  return new n({
    type: "boolean",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function vS(n, i) {
  return new n({
    type: "undefined",
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function yS(n, i) {
  return new n({
    type: "null",
    ...P(i)
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
    ...P(i)
  });
}
// @__NO_SIDE_EFFECTS__
function np(n, i) {
  return new Gp({
    check: "less_than",
    ...P(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function $o(n, i) {
  return new Gp({
    check: "less_than",
    ...P(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function ap(n, i) {
  return new Yp({
    check: "greater_than",
    ...P(i),
    value: n,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Lo(n, i) {
  return new Yp({
    check: "greater_than",
    ...P(i),
    value: n,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function ip(n, i) {
  return new C0({
    check: "multiple_of",
    ...P(i),
    value: n
  });
}
// @__NO_SIDE_EFFECTS__
function Ip(n, i) {
  return new M0({
    check: "max_length",
    ...P(i),
    maximum: n
  });
}
// @__NO_SIDE_EFFECTS__
function ou(n, i) {
  return new D0({
    check: "min_length",
    ...P(i),
    minimum: n
  });
}
// @__NO_SIDE_EFFECTS__
function Wp(n, i) {
  return new R0({
    check: "length_equals",
    ...P(i),
    length: n
  });
}
// @__NO_SIDE_EFFECTS__
function _S(n, i) {
  return new q0({
    check: "string_format",
    format: "regex",
    ...P(i),
    pattern: n
  });
}
// @__NO_SIDE_EFFECTS__
function SS(n) {
  return new U0({
    check: "string_format",
    format: "lowercase",
    ...P(n)
  });
}
// @__NO_SIDE_EFFECTS__
function zS(n) {
  return new Z0({
    check: "string_format",
    format: "uppercase",
    ...P(n)
  });
}
// @__NO_SIDE_EFFECTS__
function wS(n, i) {
  return new Q0({
    check: "string_format",
    format: "includes",
    ...P(i),
    includes: n
  });
}
// @__NO_SIDE_EFFECTS__
function jS(n, i) {
  return new k0({
    check: "string_format",
    format: "starts_with",
    ...P(i),
    prefix: n
  });
}
// @__NO_SIDE_EFFECTS__
function xS(n, i) {
  return new H0({
    check: "string_format",
    format: "ends_with",
    ...P(i),
    suffix: n
  });
}
// @__NO_SIDE_EFFECTS__
function Mi(n) {
  return new B0({
    check: "overwrite",
    tx: n
  });
}
// @__NO_SIDE_EFFECTS__
function ES(n) {
  return /* @__PURE__ */ Mi((i) => i.normalize(n));
}
// @__NO_SIDE_EFFECTS__
function TS() {
  return /* @__PURE__ */ Mi((n) => n.trim());
}
// @__NO_SIDE_EFFECTS__
function AS() {
  return /* @__PURE__ */ Mi((n) => n.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function OS() {
  return /* @__PURE__ */ Mi((n) => n.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function CS() {
  return /* @__PURE__ */ Mi((n) => Nb(n));
}
// @__NO_SIDE_EFFECTS__
function NS(n, i, s) {
  return new n({
    type: "array",
    element: i,
    // get element() {
    //   return element;
    // },
    ...P(s)
  });
}
// @__NO_SIDE_EFFECTS__
function MS(n, i, s) {
  return new n({
    type: "custom",
    check: "custom",
    fn: i,
    ...P(s)
  });
}
// @__NO_SIDE_EFFECTS__
function DS(n, i) {
  const s = /* @__PURE__ */ RS((r) => (r.addIssue = (c) => {
    if (typeof c == "string")
      r.issues.push(Rl(c, r.value, s._zod.def));
    else {
      const m = c;
      m.fatal && (m.continue = !1), m.code ?? (m.code = "custom"), m.input ?? (m.input = r.value), m.inst ?? (m.inst = s), m.continue ?? (m.continue = !s._zod.def.abort), r.issues.push(Rl(m));
    }
  }, n(r.value, r)), i);
  return s;
}
// @__NO_SIDE_EFFECTS__
function RS(n, i) {
  const s = new xt({
    check: "custom",
    ...P(i)
  });
  return s._zod.check = n, s;
}
function Pp(n) {
  let i = n?.target ?? "draft-2020-12";
  return i === "draft-4" && (i = "draft-04"), i === "draft-7" && (i = "draft-07"), {
    processors: n.processors ?? {},
    metadataRegistry: n?.metadata ?? Nl,
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
  const h = { schema: {}, count: 1, cycle: void 0, path: s.path };
  i.seen.set(n, h);
  const p = n._zod.toJSONSchema?.();
  if (p)
    h.schema = p;
  else {
    const _ = {
      ...s,
      schemaPath: [...s.schemaPath, n],
      path: s.path
    };
    if (n._zod.processJSONSchema)
      n._zod.processJSONSchema(i, h.schema, _);
    else {
      const w = h.schema, C = i.processors[c.type];
      if (!C)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${c.type}`);
      C(n, i, w, _);
    }
    const x = n._zod.parent;
    x && (h.ref || (h.ref = x), Pe(x, i, _), i.seen.get(x).isParent = !0);
  }
  const y = i.metadataRegistry.get(n);
  return y && Object.assign(h.schema, y), i.io === "input" && vt(n) && (delete h.schema.examples, delete h.schema.default), i.io === "input" && "_prefault" in h.schema && ((r = h.schema).default ?? (r.default = h.schema._prefault)), delete h.schema._prefault, i.seen.get(n).schema;
}
function ev(n, i) {
  const s = n.seen.get(i);
  if (!s)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const h of n.seen.entries()) {
    const p = n.metadataRegistry.get(h[0])?.id;
    if (p) {
      const y = r.get(p);
      if (y && y !== h[0])
        throw new Error(`Duplicate schema id "${p}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(p, h[0]);
    }
  }
  const c = (h) => {
    const p = n.target === "draft-2020-12" ? "$defs" : "definitions";
    if (n.external) {
      const x = n.external.registry.get(h[0])?.id, w = n.external.uri ?? ((D) => D);
      if (x)
        return { ref: w(x) };
      const C = h[1].defId ?? h[1].schema.id ?? `schema${n.counter++}`;
      return h[1].defId = C, { defId: C, ref: `${w("__shared")}#/${p}/${C}` };
    }
    if (h[1] === s)
      return { ref: "#" };
    const g = `#/${p}/`, _ = h[1].schema.id ?? `__schema${n.counter++}`;
    return { defId: _, ref: g + _ };
  }, m = (h) => {
    if (h[1].schema.$ref)
      return;
    const p = h[1], { ref: y, defId: g } = c(h);
    p.def = { ...p.schema }, g && (p.defId = g);
    const _ = p.schema;
    for (const x in _)
      delete _[x];
    _.$ref = y;
  };
  if (n.cycles === "throw")
    for (const h of n.seen.entries()) {
      const p = h[1];
      if (p.cycle)
        throw new Error(`Cycle detected: #/${p.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const h of n.seen.entries()) {
    const p = h[1];
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
    if (p.cycle) {
      m(h);
      continue;
    }
    if (p.count > 1 && n.reused === "ref") {
      m(h);
      continue;
    }
  }
}
function tv(n, i) {
  const s = n.seen.get(i);
  if (!s)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (p) => {
    const y = n.seen.get(p);
    if (y.ref === null)
      return;
    const g = y.def ?? y.schema, _ = { ...g }, x = y.ref;
    if (y.ref = null, x) {
      r(x);
      const C = n.seen.get(x), D = C.schema;
      if (D.$ref && (n.target === "draft-07" || n.target === "draft-04" || n.target === "openapi-3.0") ? (g.allOf = g.allOf ?? [], g.allOf.push(D)) : Object.assign(g, D), Object.assign(g, _), p._zod.parent === x)
        for (const V in g)
          V === "$ref" || V === "allOf" || V in _ || delete g[V];
      if (D.$ref && C.def)
        for (const V in g)
          V === "$ref" || V === "allOf" || V in C.def && JSON.stringify(g[V]) === JSON.stringify(C.def[V]) && delete g[V];
    }
    const w = p._zod.parent;
    if (w && w !== x) {
      r(w);
      const C = n.seen.get(w);
      if (C?.schema.$ref && (g.$ref = C.schema.$ref, C.def))
        for (const D in g)
          D === "$ref" || D === "allOf" || D in C.def && JSON.stringify(g[D]) === JSON.stringify(C.def[D]) && delete g[D];
    }
    n.override({
      zodSchema: p,
      jsonSchema: g,
      path: y.path ?? []
    });
  };
  for (const p of [...n.seen.entries()].reverse())
    r(p[0]);
  const c = {};
  if (n.target === "draft-2020-12" ? c.$schema = "https://json-schema.org/draft/2020-12/schema" : n.target === "draft-07" ? c.$schema = "http://json-schema.org/draft-07/schema#" : n.target === "draft-04" ? c.$schema = "http://json-schema.org/draft-04/schema#" : n.target, n.external?.uri) {
    const p = n.external.registry.get(i)?.id;
    if (!p)
      throw new Error("Schema is missing an `id` property");
    c.$id = n.external.uri(p);
  }
  Object.assign(c, s.def ?? s.schema);
  const m = n.metadataRegistry.get(i)?.id;
  m !== void 0 && c.id === m && delete c.id;
  const h = n.external?.defs ?? {};
  for (const p of n.seen.entries()) {
    const y = p[1];
    y.def && y.defId && (y.def.id === y.defId && delete y.def.id, h[y.defId] = y.def);
  }
  n.external || Object.keys(h).length > 0 && (n.target === "draft-2020-12" ? c.$defs = h : c.definitions = h);
  try {
    const p = JSON.parse(JSON.stringify(c));
    return Object.defineProperty(p, "~standard", {
      value: {
        ...i["~standard"],
        jsonSchema: {
          input: cu(i, "input", n.processors),
          output: cu(i, "output", n.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), p;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function vt(n, i) {
  const s = i ?? { seen: /* @__PURE__ */ new Set() };
  if (s.seen.has(n))
    return !1;
  s.seen.add(n);
  const r = n._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return vt(r.element, s);
  if (r.type === "set")
    return vt(r.valueType, s);
  if (r.type === "lazy")
    return vt(r.getter(), s);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return vt(r.innerType, s);
  if (r.type === "intersection")
    return vt(r.left, s) || vt(r.right, s);
  if (r.type === "record" || r.type === "map")
    return vt(r.keyType, s) || vt(r.valueType, s);
  if (r.type === "pipe")
    return n._zod.traits.has("$ZodCodec") ? !0 : vt(r.in, s) || vt(r.out, s);
  if (r.type === "object") {
    for (const c in r.shape)
      if (vt(r.shape[c], s))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const c of r.options)
      if (vt(c, s))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const c of r.items)
      if (vt(c, s))
        return !0;
    return !!(r.rest && vt(r.rest, s));
  }
  return !1;
}
const qS = (n, i = {}) => (s) => {
  const r = Pp({ ...s, processors: i });
  return Pe(n, r), ev(r, n), tv(r, n);
}, cu = (n, i, s = {}) => (r) => {
  const { libraryOptions: c, target: m } = r ?? {}, h = Pp({ ...c ?? {}, target: m, io: i, processors: s });
  return Pe(n, h), ev(h, n), tv(h, n);
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
  const { minimum: m, maximum: h, format: p, patterns: y, contentEncoding: g } = n._zod.bag;
  if (typeof m == "number" && (c.minLength = m), typeof h == "number" && (c.maxLength = h), p && (c.format = US[p] ?? p, c.format === "" && delete c.format, p === "time" && delete c.format), g && (c.contentEncoding = g), y && y.size > 0) {
    const _ = [...y];
    _.length === 1 ? c.pattern = _[0].source : _.length > 1 && (c.allOf = [
      ..._.map((x) => ({
        ...i.target === "draft-07" || i.target === "draft-04" || i.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: x.source
      }))
    ]);
  }
}, QS = (n, i, s, r) => {
  const c = s, { minimum: m, maximum: h, format: p, multipleOf: y, exclusiveMaximum: g, exclusiveMinimum: _ } = n._zod.bag;
  typeof p == "string" && p.includes("int") ? c.type = "integer" : c.type = "number";
  const x = typeof _ == "number" && _ >= (m ?? Number.NEGATIVE_INFINITY), w = typeof g == "number" && g <= (h ?? Number.POSITIVE_INFINITY), C = i.target === "draft-04" || i.target === "openapi-3.0";
  x ? C ? (c.minimum = _, c.exclusiveMinimum = !0) : c.exclusiveMinimum = _ : typeof m == "number" && (c.minimum = m), w ? C ? (c.maximum = g, c.exclusiveMaximum = !0) : c.exclusiveMaximum = g : typeof h == "number" && (c.maximum = h), typeof y == "number" && (c.multipleOf = y);
}, kS = (n, i, s, r) => {
  s.type = "boolean";
}, HS = (n, i, s, r) => {
  i.target === "openapi-3.0" ? (s.type = "string", s.nullable = !0, s.enum = [null]) : s.type = "null";
}, BS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Undefined cannot be represented in JSON Schema");
}, $S = (n, i, s, r) => {
  s.not = {};
}, LS = (n, i, s, r) => {
}, GS = (n, i, s, r) => {
  const c = n._zod.def, m = Dp(c.entries);
  m.every((h) => typeof h == "number") && (s.type = "number"), m.every((h) => typeof h == "string") && (s.type = "string"), s.enum = m;
}, YS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, KS = (n, i, s, r) => {
  if (i.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, XS = (n, i, s, r) => {
  const c = s, m = n._zod.def, { minimum: h, maximum: p } = n._zod.bag;
  typeof h == "number" && (c.minItems = h), typeof p == "number" && (c.maxItems = p), c.type = "array", c.items = Pe(m.element, i, {
    ...r,
    path: [...r.path, "items"]
  });
}, VS = (n, i, s, r) => {
  const c = s, m = n._zod.def;
  c.type = "object", c.properties = {};
  const h = m.shape;
  for (const g in h)
    c.properties[g] = Pe(h[g], i, {
      ...r,
      path: [...r.path, "properties", g]
    });
  const p = new Set(Object.keys(h)), y = new Set([...p].filter((g) => {
    const _ = m.shape[g]._zod;
    return i.io === "input" ? _.optin === void 0 : _.optout === void 0;
  }));
  y.size > 0 && (c.required = Array.from(y)), m.catchall?._zod.def.type === "never" ? c.additionalProperties = !1 : m.catchall ? m.catchall && (c.additionalProperties = Pe(m.catchall, i, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : i.io === "output" && (c.additionalProperties = !1);
}, JS = (n, i, s, r) => {
  const c = n._zod.def, m = c.inclusive === !1, h = c.options.map((p, y) => Pe(p, i, {
    ...r,
    path: [...r.path, m ? "oneOf" : "anyOf", y]
  }));
  m ? s.oneOf = h : s.anyOf = h;
}, FS = (n, i, s, r) => {
  const c = n._zod.def, m = Pe(c.left, i, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), h = Pe(c.right, i, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), p = (g) => "allOf" in g && Object.keys(g).length === 1, y = [
    ...p(m) ? m.allOf : [m],
    ...p(h) ? h.allOf : [h]
  ];
  s.allOf = y;
}, IS = (n, i, s, r) => {
  const c = s, m = n._zod.def;
  c.type = "object";
  const h = m.keyType, y = h._zod.bag?.patterns;
  if (m.mode === "loose" && y && y.size > 0) {
    const _ = Pe(m.valueType, i, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    c.patternProperties = {};
    for (const x of y)
      c.patternProperties[x.source] = _;
  } else
    (i.target === "draft-07" || i.target === "draft-2020-12") && (c.propertyNames = Pe(m.keyType, i, {
      ...r,
      path: [...r.path, "propertyNames"]
    })), c.additionalProperties = Pe(m.valueType, i, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  const g = h._zod.values;
  if (g) {
    const _ = [...g].filter((x) => typeof x == "string" || typeof x == "number");
    _.length > 0 && (c.required = _);
  }
}, WS = (n, i, s, r) => {
  const c = n._zod.def, m = Pe(c.innerType, i, r), h = i.seen.get(n);
  i.target === "openapi-3.0" ? (h.ref = c.innerType, s.nullable = !0) : s.anyOf = [m, { type: "null" }];
}, PS = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
}, e1 = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, s.default = JSON.parse(JSON.stringify(c.defaultValue));
}, t1 = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, i.io === "input" && (s._prefault = JSON.parse(JSON.stringify(c.defaultValue)));
}, n1 = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
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
  Pe(h, i, r);
  const p = i.seen.get(n);
  p.ref = h;
}, i1 = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType, s.readOnly = !0;
}, nv = (n, i, s, r) => {
  const c = n._zod.def;
  Pe(c.innerType, i, r);
  const m = i.seen.get(n);
  m.ref = c.innerType;
}, l1 = /* @__PURE__ */ q("ZodISODateTime", (n, i) => {
  t_.init(n, i), $e.init(n, i);
});
function s1(n) {
  return /* @__PURE__ */ rS(l1, n);
}
const u1 = /* @__PURE__ */ q("ZodISODate", (n, i) => {
  n_.init(n, i), $e.init(n, i);
});
function r1(n) {
  return /* @__PURE__ */ oS(u1, n);
}
const o1 = /* @__PURE__ */ q("ZodISOTime", (n, i) => {
  a_.init(n, i), $e.init(n, i);
});
function c1(n) {
  return /* @__PURE__ */ cS(o1, n);
}
const f1 = /* @__PURE__ */ q("ZodISODuration", (n, i) => {
  i_.init(n, i), $e.init(n, i);
});
function d1(n) {
  return /* @__PURE__ */ fS(f1, n);
}
const h1 = (n, i) => {
  Zp.init(n, i), n.name = "ZodError", Object.defineProperties(n, {
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
        n.issues.push(s), n.message = JSON.stringify(n.issues, Wo, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (s) => {
        n.issues.push(...s), n.message = JSON.stringify(n.issues, Wo, 2);
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
}, Ft = /* @__PURE__ */ q("ZodError", h1, {
  Parent: Error
}), m1 = /* @__PURE__ */ yc(Ft), p1 = /* @__PURE__ */ gc(Ft), v1 = /* @__PURE__ */ hu(Ft), y1 = /* @__PURE__ */ mu(Ft), g1 = /* @__PURE__ */ Vb(Ft), b1 = /* @__PURE__ */ Jb(Ft), _1 = /* @__PURE__ */ Fb(Ft), S1 = /* @__PURE__ */ Ib(Ft), z1 = /* @__PURE__ */ Wb(Ft), w1 = /* @__PURE__ */ Pb(Ft), j1 = /* @__PURE__ */ e0(Ft), x1 = /* @__PURE__ */ t0(Ft), lp = /* @__PURE__ */ new WeakMap();
function ql(n, i, s) {
  const r = Object.getPrototypeOf(n);
  let c = lp.get(r);
  if (c || (c = /* @__PURE__ */ new Set(), lp.set(r, c)), !c.has(i)) {
    c.add(i);
    for (const m in s) {
      const h = s[m];
      Object.defineProperty(r, m, {
        configurable: !0,
        enumerable: !1,
        get() {
          const p = h.bind(this);
          return Object.defineProperty(this, m, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: p
          }), p;
        },
        set(p) {
          Object.defineProperty(this, m, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: p
          });
        }
      });
    }
  }
}
const Be = /* @__PURE__ */ q("ZodType", (n, i) => (ke.init(n, i), Object.assign(n["~standard"], {
  jsonSchema: {
    input: cu(n, "input"),
    output: cu(n, "output")
  }
}), n.toJSONSchema = qS(n, {}), n.def = i, n.type = i.type, Object.defineProperty(n, "_def", { value: i }), n.parse = (s, r) => m1(n, s, r, { callee: n.parse }), n.safeParse = (s, r) => v1(n, s, r), n.parseAsync = async (s, r) => p1(n, s, r, { callee: n.parseAsync }), n.safeParseAsync = async (s, r) => y1(n, s, r), n.spa = n.safeParseAsync, n.encode = (s, r) => g1(n, s, r), n.decode = (s, r) => b1(n, s, r), n.encodeAsync = async (s, r) => _1(n, s, r), n.decodeAsync = async (s, r) => S1(n, s, r), n.safeEncode = (s, r) => z1(n, s, r), n.safeDecode = (s, r) => w1(n, s, r), n.safeEncodeAsync = async (s, r) => j1(n, s, r), n.safeDecodeAsync = async (s, r) => x1(n, s, r), ql(n, "ZodType", {
  check(...s) {
    const r = this.def;
    return this.clone(oa(r, {
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
    return ca(this, s, r);
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
    return this.check(/* @__PURE__ */ Mi(s));
  },
  optional() {
    return op(this);
  },
  exactOptional() {
    return oz(this);
  },
  nullable() {
    return cp(this);
  },
  nullish() {
    return op(cp(this));
  },
  nonoptional(s) {
    return pz(this, s);
  },
  array() {
    return We(this);
  },
  or(s) {
    return tn([this, s]);
  },
  and(s) {
    return az(this, s);
  },
  transform(s) {
    return fp(this, uz(s));
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
    return fp(this, s);
  },
  readonly() {
    return _z(this);
  },
  describe(s) {
    const r = this.clone();
    return Nl.add(r, { description: s }), r;
  },
  meta(...s) {
    if (s.length === 0)
      return Nl.get(this);
    const r = this.clone();
    return Nl.add(r, s[0]), r;
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
    return Nl.get(n)?.description;
  },
  configurable: !0
}), n)), av = /* @__PURE__ */ q("_ZodString", (n, i) => {
  bc.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (r, c, m) => ZS(n, r, c);
  const s = n._zod.bag;
  n.format = s.format ?? null, n.minLength = s.minimum ?? null, n.maxLength = s.maximum ?? null, ql(n, "_ZodString", {
    regex(...r) {
      return this.check(/* @__PURE__ */ _S(...r));
    },
    includes(...r) {
      return this.check(/* @__PURE__ */ wS(...r));
    },
    startsWith(...r) {
      return this.check(/* @__PURE__ */ jS(...r));
    },
    endsWith(...r) {
      return this.check(/* @__PURE__ */ xS(...r));
    },
    min(...r) {
      return this.check(/* @__PURE__ */ ou(...r));
    },
    max(...r) {
      return this.check(/* @__PURE__ */ Ip(...r));
    },
    length(...r) {
      return this.check(/* @__PURE__ */ Wp(...r));
    },
    nonempty(...r) {
      return this.check(/* @__PURE__ */ ou(1, ...r));
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
  bc.init(n, i), av.init(n, i), n.email = (s) => n.check(/* @__PURE__ */ B_(T1, s)), n.url = (s) => n.check(/* @__PURE__ */ K_(A1, s)), n.jwt = (s) => n.check(/* @__PURE__ */ uS(L1, s)), n.emoji = (s) => n.check(/* @__PURE__ */ X_(O1, s)), n.guid = (s) => n.check(/* @__PURE__ */ tp(sp, s)), n.uuid = (s) => n.check(/* @__PURE__ */ $_(tu, s)), n.uuidv4 = (s) => n.check(/* @__PURE__ */ L_(tu, s)), n.uuidv6 = (s) => n.check(/* @__PURE__ */ G_(tu, s)), n.uuidv7 = (s) => n.check(/* @__PURE__ */ Y_(tu, s)), n.nanoid = (s) => n.check(/* @__PURE__ */ V_(C1, s)), n.guid = (s) => n.check(/* @__PURE__ */ tp(sp, s)), n.cuid = (s) => n.check(/* @__PURE__ */ J_(N1, s)), n.cuid2 = (s) => n.check(/* @__PURE__ */ F_(M1, s)), n.ulid = (s) => n.check(/* @__PURE__ */ I_(D1, s)), n.base64 = (s) => n.check(/* @__PURE__ */ iS(H1, s)), n.base64url = (s) => n.check(/* @__PURE__ */ lS(B1, s)), n.xid = (s) => n.check(/* @__PURE__ */ W_(R1, s)), n.ksuid = (s) => n.check(/* @__PURE__ */ P_(q1, s)), n.ipv4 = (s) => n.check(/* @__PURE__ */ eS(U1, s)), n.ipv6 = (s) => n.check(/* @__PURE__ */ tS(Z1, s)), n.cidrv4 = (s) => n.check(/* @__PURE__ */ nS(Q1, s)), n.cidrv6 = (s) => n.check(/* @__PURE__ */ aS(k1, s)), n.e164 = (s) => n.check(/* @__PURE__ */ sS($1, s)), n.datetime = (s) => n.check(s1(s)), n.date = (s) => n.check(r1(s)), n.time = (s) => n.check(c1(s)), n.duration = (s) => n.check(d1(s));
});
function L(n) {
  return /* @__PURE__ */ H_(E1, n);
}
const $e = /* @__PURE__ */ q("ZodStringFormat", (n, i) => {
  He.init(n, i), av.init(n, i);
}), T1 = /* @__PURE__ */ q("ZodEmail", (n, i) => {
  K0.init(n, i), $e.init(n, i);
}), sp = /* @__PURE__ */ q("ZodGUID", (n, i) => {
  G0.init(n, i), $e.init(n, i);
}), tu = /* @__PURE__ */ q("ZodUUID", (n, i) => {
  Y0.init(n, i), $e.init(n, i);
}), A1 = /* @__PURE__ */ q("ZodURL", (n, i) => {
  X0.init(n, i), $e.init(n, i);
}), O1 = /* @__PURE__ */ q("ZodEmoji", (n, i) => {
  V0.init(n, i), $e.init(n, i);
}), C1 = /* @__PURE__ */ q("ZodNanoID", (n, i) => {
  J0.init(n, i), $e.init(n, i);
}), N1 = /* @__PURE__ */ q("ZodCUID", (n, i) => {
  F0.init(n, i), $e.init(n, i);
}), M1 = /* @__PURE__ */ q("ZodCUID2", (n, i) => {
  I0.init(n, i), $e.init(n, i);
}), D1 = /* @__PURE__ */ q("ZodULID", (n, i) => {
  W0.init(n, i), $e.init(n, i);
}), R1 = /* @__PURE__ */ q("ZodXID", (n, i) => {
  P0.init(n, i), $e.init(n, i);
}), q1 = /* @__PURE__ */ q("ZodKSUID", (n, i) => {
  e_.init(n, i), $e.init(n, i);
}), U1 = /* @__PURE__ */ q("ZodIPv4", (n, i) => {
  l_.init(n, i), $e.init(n, i);
}), Z1 = /* @__PURE__ */ q("ZodIPv6", (n, i) => {
  s_.init(n, i), $e.init(n, i);
}), Q1 = /* @__PURE__ */ q("ZodCIDRv4", (n, i) => {
  u_.init(n, i), $e.init(n, i);
}), k1 = /* @__PURE__ */ q("ZodCIDRv6", (n, i) => {
  r_.init(n, i), $e.init(n, i);
}), H1 = /* @__PURE__ */ q("ZodBase64", (n, i) => {
  o_.init(n, i), $e.init(n, i);
}), B1 = /* @__PURE__ */ q("ZodBase64URL", (n, i) => {
  f_.init(n, i), $e.init(n, i);
}), $1 = /* @__PURE__ */ q("ZodE164", (n, i) => {
  d_.init(n, i), $e.init(n, i);
}), L1 = /* @__PURE__ */ q("ZodJWT", (n, i) => {
  m_.init(n, i), $e.init(n, i);
}), _c = /* @__PURE__ */ q("ZodNumber", (n, i) => {
  Xp.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (r, c, m) => QS(n, r, c), ql(n, "ZodNumber", {
    gt(r, c) {
      return this.check(/* @__PURE__ */ ap(r, c));
    },
    gte(r, c) {
      return this.check(/* @__PURE__ */ Lo(r, c));
    },
    min(r, c) {
      return this.check(/* @__PURE__ */ Lo(r, c));
    },
    lt(r, c) {
      return this.check(/* @__PURE__ */ np(r, c));
    },
    lte(r, c) {
      return this.check(/* @__PURE__ */ $o(r, c));
    },
    max(r, c) {
      return this.check(/* @__PURE__ */ $o(r, c));
    },
    int(r) {
      return this.check(up(r));
    },
    safe(r) {
      return this.check(up(r));
    },
    positive(r) {
      return this.check(/* @__PURE__ */ ap(0, r));
    },
    nonnegative(r) {
      return this.check(/* @__PURE__ */ Lo(0, r));
    },
    negative(r) {
      return this.check(/* @__PURE__ */ np(0, r));
    },
    nonpositive(r) {
      return this.check(/* @__PURE__ */ $o(0, r));
    },
    multipleOf(r, c) {
      return this.check(/* @__PURE__ */ ip(r, c));
    },
    step(r, c) {
      return this.check(/* @__PURE__ */ ip(r, c));
    },
    finite() {
      return this;
    }
  });
  const s = n._zod.bag;
  n.minValue = Math.max(s.minimum ?? Number.NEGATIVE_INFINITY, s.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, n.maxValue = Math.min(s.maximum ?? Number.POSITIVE_INFINITY, s.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, n.isInt = (s.format ?? "").includes("int") || Number.isSafeInteger(s.multipleOf ?? 0.5), n.isFinite = !0, n.format = s.format ?? null;
});
function Ra(n) {
  return /* @__PURE__ */ dS(_c, n);
}
const G1 = /* @__PURE__ */ q("ZodNumberFormat", (n, i) => {
  p_.init(n, i), _c.init(n, i);
});
function up(n) {
  return /* @__PURE__ */ mS(G1, n);
}
const Y1 = /* @__PURE__ */ q("ZodBoolean", (n, i) => {
  v_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => kS(n, s, r);
});
function qa(n) {
  return /* @__PURE__ */ pS(Y1, n);
}
const K1 = /* @__PURE__ */ q("ZodUndefined", (n, i) => {
  y_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => BS(n, s);
});
function X1(n) {
  return /* @__PURE__ */ vS(K1, n);
}
const V1 = /* @__PURE__ */ q("ZodNull", (n, i) => {
  g_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => HS(n, s, r);
});
function J1(n) {
  return /* @__PURE__ */ yS(V1, n);
}
const F1 = /* @__PURE__ */ q("ZodUnknown", (n, i) => {
  b_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => LS();
});
function rn() {
  return /* @__PURE__ */ gS(F1);
}
const I1 = /* @__PURE__ */ q("ZodNever", (n, i) => {
  __.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => $S(n, s, r);
});
function W1(n) {
  return /* @__PURE__ */ bS(I1, n);
}
const P1 = /* @__PURE__ */ q("ZodArray", (n, i) => {
  S_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => XS(n, s, r, c), n.element = i.element, ql(n, "ZodArray", {
    min(s, r) {
      return this.check(/* @__PURE__ */ ou(s, r));
    },
    nonempty(s) {
      return this.check(/* @__PURE__ */ ou(1, s));
    },
    max(s, r) {
      return this.check(/* @__PURE__ */ Ip(s, r));
    },
    length(s, r) {
      return this.check(/* @__PURE__ */ Wp(s, r));
    },
    unwrap() {
      return this.element;
    }
  });
});
function We(n, i) {
  return /* @__PURE__ */ NS(P1, n, i);
}
const ez = /* @__PURE__ */ q("ZodObject", (n, i) => {
  w_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => VS(n, s, r, c), De(n, "shape", () => i.shape), ql(n, "ZodObject", {
    keyof() {
      return lz(Object.keys(this._zod.def.shape));
    },
    catchall(s) {
      return this.clone({ ...this._zod.def, catchall: s });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: rn() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: rn() });
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
      return Hb(this, s);
    },
    pick(s) {
      return Ub(this, s);
    },
    omit(s) {
      return Zb(this, s);
    },
    partial(...s) {
      return Bb(iv, this, s[0]);
    },
    required(...s) {
      return $b(lv, this, s[0]);
    }
  });
});
function ft(n, i) {
  const s = {
    type: "object",
    shape: n ?? {},
    ...P(i)
  };
  return new ez(s);
}
const tz = /* @__PURE__ */ q("ZodUnion", (n, i) => {
  j_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => JS(n, s, r, c), n.options = i.options;
});
function tn(n, i) {
  return new tz({
    type: "union",
    options: n,
    ...P(i)
  });
}
const nz = /* @__PURE__ */ q("ZodIntersection", (n, i) => {
  x_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => FS(n, s, r, c);
});
function az(n, i) {
  return new nz({
    type: "intersection",
    left: n,
    right: i
  });
}
const rp = /* @__PURE__ */ q("ZodRecord", (n, i) => {
  E_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => IS(n, s, r, c), n.keyType = i.keyType, n.valueType = i.valueType;
});
function iz(n, i, s) {
  return !i || !i._zod ? new rp({
    type: "record",
    keyType: L(),
    valueType: n,
    ...P(i)
  }) : new rp({
    type: "record",
    keyType: n,
    valueType: i,
    ...P(s)
  });
}
const ec = /* @__PURE__ */ q("ZodEnum", (n, i) => {
  T_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (r, c, m) => GS(n, r, c), n.enum = i.entries, n.options = Object.values(i.entries);
  const s = new Set(Object.keys(i.entries));
  n.extract = (r, c) => {
    const m = {};
    for (const h of r)
      if (s.has(h))
        m[h] = i.entries[h];
      else
        throw new Error(`Key ${h} not found in enum`);
    return new ec({
      ...i,
      checks: [],
      ...P(c),
      entries: m
    });
  }, n.exclude = (r, c) => {
    const m = { ...i.entries };
    for (const h of r)
      if (s.has(h))
        delete m[h];
      else
        throw new Error(`Key ${h} not found in enum`);
    return new ec({
      ...i,
      checks: [],
      ...P(c),
      entries: m
    });
  };
});
function lz(n, i) {
  const s = Array.isArray(n) ? Object.fromEntries(n.map((r) => [r, r])) : n;
  return new ec({
    type: "enum",
    entries: s,
    ...P(i)
  });
}
const sz = /* @__PURE__ */ q("ZodTransform", (n, i) => {
  A_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => KS(n, s), n._zod.parse = (s, r) => {
    if (r.direction === "backward")
      throw new Mp(n.constructor.name);
    s.addIssue = (m) => {
      if (typeof m == "string")
        s.issues.push(Rl(m, s.value, i));
      else {
        const h = m;
        h.fatal && (h.continue = !1), h.code ?? (h.code = "custom"), h.input ?? (h.input = s.value), h.inst ?? (h.inst = n), s.issues.push(Rl(h));
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
const iv = /* @__PURE__ */ q("ZodOptional", (n, i) => {
  Fp.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => nv(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function op(n) {
  return new iv({
    type: "optional",
    innerType: n
  });
}
const rz = /* @__PURE__ */ q("ZodExactOptional", (n, i) => {
  O_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => nv(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function oz(n) {
  return new rz({
    type: "optional",
    innerType: n
  });
}
const cz = /* @__PURE__ */ q("ZodNullable", (n, i) => {
  C_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => WS(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function cp(n) {
  return new cz({
    type: "nullable",
    innerType: n
  });
}
const fz = /* @__PURE__ */ q("ZodDefault", (n, i) => {
  N_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => e1(n, s, r, c), n.unwrap = () => n._zod.def.innerType, n.removeDefault = n.unwrap;
});
function dz(n, i) {
  return new fz({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : qp(i);
    }
  });
}
const hz = /* @__PURE__ */ q("ZodPrefault", (n, i) => {
  M_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => t1(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function mz(n, i) {
  return new hz({
    type: "prefault",
    innerType: n,
    get defaultValue() {
      return typeof i == "function" ? i() : qp(i);
    }
  });
}
const lv = /* @__PURE__ */ q("ZodNonOptional", (n, i) => {
  D_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => PS(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function pz(n, i) {
  return new lv({
    type: "nonoptional",
    innerType: n,
    ...P(i)
  });
}
const vz = /* @__PURE__ */ q("ZodCatch", (n, i) => {
  R_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => n1(n, s, r, c), n.unwrap = () => n._zod.def.innerType, n.removeCatch = n.unwrap;
});
function yz(n, i) {
  return new vz({
    type: "catch",
    innerType: n,
    catchValue: typeof i == "function" ? i : () => i
  });
}
const gz = /* @__PURE__ */ q("ZodPipe", (n, i) => {
  q_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => a1(n, s, r, c), n.in = i.in, n.out = i.out;
});
function fp(n, i) {
  return new gz({
    type: "pipe",
    in: n,
    out: i
    // ...util.normalizeParams(params),
  });
}
const bz = /* @__PURE__ */ q("ZodReadonly", (n, i) => {
  U_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => i1(n, s, r, c), n.unwrap = () => n._zod.def.innerType;
});
function _z(n) {
  return new bz({
    type: "readonly",
    innerType: n
  });
}
const Sz = /* @__PURE__ */ q("ZodCustom", (n, i) => {
  Z_.init(n, i), Be.init(n, i), n._zod.processJSONSchema = (s, r, c) => YS(n, s);
});
function zz(n, i = {}) {
  return /* @__PURE__ */ MS(Sz, n, i);
}
function wz(n, i) {
  return /* @__PURE__ */ DS(n, i);
}
function Xt(n) {
  return /* @__PURE__ */ hS(_c, n);
}
const ua = {
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
}, Nn = iz(L(), rn()), Ti = tn([L(), Ra(), qa()]).transform(String), Jt = tn([Ra(), L()]).transform((n) => Number(n)), Ma = tn([Ra(), L(), J1(), X1()]).transform((n) => n == null || n === "" ? null : Number(n)), Sc = tn([
  L(),
  ft({
    label: L().optional(),
    value: L().optional()
  }).passthrough()
]), zc = ft({
  id: tn([Ra(), L()]).optional(),
  sender: L().optional(),
  senderType: L().optional(),
  role: L().optional(),
  content: L().optional(),
  safeMessageContent: L().optional(),
  messageType: L().optional(),
  createdAt: L().optional(),
  status: L().optional(),
  quickReplies: We(Sc).optional(),
  metadata: Nn.optional()
}).passthrough(), tc = tn([
  L(),
  ft({
    id: tn([Ra(), L()]).optional(),
    materialId: Jt.optional(),
    chunkId: Jt.optional(),
    label: L().optional(),
    sourceLabel: L().optional(),
    excerpt: L().optional(),
    content: L().optional()
  }).passthrough()
]), nc = ft({
  id: tn([Ra(), L()]).optional(),
  type: L().optional(),
  text: L().optional(),
  prompt: L().optional(),
  options: We(Ti).optional(),
  correctAnswer: Ti.optional(),
  explanation: L().optional(),
  difficulty: L().optional(),
  learningObjective: L().optional(),
  points: tn([Ra(), L()]).optional(),
  sourceReferences: We(tc).optional(),
  sources: We(tc).optional(),
  sourceHint: L().optional(),
  validationStatus: L().optional()
}).passthrough(), sv = ft({
  id: Ma.optional(),
  draftId: Ma.optional(),
  title: L().optional(),
  description: L().optional(),
  difficulty: L().optional(),
  status: L().optional(),
  questions: We(nc).optional(),
  updatedAt: L().optional(),
  draft: ft({
    title: L().optional(),
    description: L().optional(),
    difficulty: L().optional(),
    status: L().optional(),
    questions: We(nc).optional(),
    updatedAt: L().optional()
  }).passthrough().optional()
}).passthrough(), jz = ft({
  multipleChoice: Xt().optional(),
  multiple_choice: Xt().optional(),
  trueFalse: Xt().optional(),
  true_false: Xt().optional(),
  shortAnswer: Xt().optional(),
  short_answer: Xt().optional(),
  essay: Xt().optional(),
  coding: Xt().optional()
}).passthrough(), uv = ft({
  courseId: Ma.optional(),
  topic: L().optional(),
  learningObjectives: We(Ti).optional(),
  difficulty: L().optional(),
  questionCount: Ma.optional(),
  language: L().optional(),
  questionTypeDistribution: jz.optional(),
  useIndexedMaterialOnly: qa().optional(),
  includeExplanations: qa().optional(),
  timeLimitMinutes: Ma.optional(),
  tags: We(Ti).optional(),
  specialInstructions: L().optional(),
  additionalInstructions: L().optional(),
  missingRequiredFields: We(Ti).optional(),
  readinessStatus: L().optional(),
  materialScope: L().optional(),
  materialMode: L().optional(),
  materialIds: We(Jt).optional(),
  scoringPreferences: tn([L(), Nn]).optional(),
  gradingPreferences: L().optional(),
  gradingOrScoringPreferences: L().optional()
}).passthrough(), rv = ft({
  status: L().optional(),
  stage: L().optional(),
  currentStage: L().optional(),
  progressStage: L().optional(),
  message: L().optional(),
  canCancel: qa().optional(),
  startedAt: L().optional(),
  updatedAt: L().optional()
}).passthrough(), xz = ft({
  title: L().optional(),
  questions: We(rn()).optional(),
  draft: ft({
    title: L().optional(),
    questions: We(rn()).optional()
  }).passthrough().optional()
}).passthrough(), iu = ft({
  id: Jt.optional(),
  revisionId: Jt.optional(),
  revisionNumber: Jt.optional(),
  revisionType: L().optional(),
  requestText: L().optional(),
  status: L().optional(),
  summary: L().optional(),
  changes: We(Ti).optional(),
  destructive: qa().optional(),
  metadata: Nn.optional(),
  beforeSnapshot: rn().optional(),
  proposedSnapshot: rn().optional(),
  beforeData: rn().optional(),
  afterData: rn().optional(),
  preview: rn().optional(),
  appliedAt: L().optional(),
  createdAt: L().optional()
}).passthrough(), vu = ft({
  id: Jt.optional(),
  conversationId: Jt.optional(),
  title: L().optional(),
  status: L().optional(),
  courseId: Ma.optional(),
  createdAt: L().optional(),
  updatedAt: L().optional(),
  messageCount: Xt().optional(),
  draftId: Ma.optional(),
  plan: uv.optional(),
  messages: We(zc).optional(),
  suggestedReplies: We(Sc).optional(),
  draft: sv.nullable().optional(),
  generation: rv.nullable().optional(),
  pendingRevision: iu.nullable().optional(),
  revision: iu.nullable().optional(),
  revisions: We(iu).optional()
}).passthrough();
function Mn(n, i) {
  const s = Nn.safeParse(n);
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
  return ov(s);
}
function ov(n) {
  return n.flatMap((i, s) => {
    const r = Sc.safeParse(i);
    if (!r.success) return [];
    if (typeof r.data == "string") return [{ label: r.data, value: r.data }];
    const c = r.data.value || r.data.label || "";
    return c ? [{ label: r.data.label || c, value: c }] : [];
  }).map((i, s) => ({ ...i, key: `${s}-${i.value}` })).map(({ label: i, value: s }) => ({ label: i, value: s }));
}
function cv(n, i = 0) {
  const s = zc.parse(n), r = s.status === "failed" ? "failed" : s.status === "pending" ? "pending" : "sent";
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
  const s = tc.parse(n);
  return typeof s == "string" ? { id: `source-${i}`, label: s } : {
    id: s.id ?? `source-${i}`,
    materialId: s.materialId,
    chunkId: s.chunkId,
    label: s.label || s.sourceLabel || `Source ${i + 1}`,
    excerpt: s.excerpt || s.content
  };
}
function Oz(n) {
  const i = nc.parse(n), s = i.sourceReferences || i.sources || (i.sourceHint ? [i.sourceHint] : []), r = Number(i.points ?? 1);
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
  const i = sv.parse(Mn(n, ["draft"])), s = i.draft || {}, r = String(i.difficulty || s.difficulty || "medium").trim().toLowerCase(), c = ["easy", "medium", "hard"].includes(r) ? r : "medium";
  return {
    id: i.id ?? i.draftId ?? null,
    title: i.title || s.title || "Untitled quiz draft",
    description: i.description || s.description || "",
    difficulty: c,
    status: i.status || s.status || "draft",
    questions: (i.questions || s.questions || []).map(Oz),
    updatedAt: i.updatedAt || s.updatedAt || ""
  };
}
function Nz(n) {
  const i = uv.parse(n || {}), s = i.questionTypeDistribution || {}, r = i.materialScope || (i.materialMode === "general_model_knowledge_allowed" ? "general_knowledge_allowed" : i.materialMode), c = ["course_material_only", "course_material_preferred", "general_knowledge_allowed"].includes(String(r)) ? r : i.useIndexedMaterialOnly ? "course_material_only" : ua.materialScope, m = i.scoringPreferences ?? i.gradingPreferences ?? i.gradingOrScoringPreferences, h = typeof m == "string" ? m : m ? JSON.stringify(m) : "";
  return {
    ...ua,
    courseId: i.courseId ?? ua.courseId,
    topic: i.topic ?? ua.topic,
    learningObjectives: i.learningObjectives ?? [],
    difficulty: ["easy", "medium", "hard"].includes(String(i.difficulty)) ? i.difficulty : ua.difficulty,
    questionCount: i.questionCount ?? ua.questionCount,
    language: i.language ?? ua.language,
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
function fv(n) {
  if (!n) return null;
  const i = rv.parse(Mn(n, ["generation"]));
  return {
    status: i.status || "generating",
    stage: i.stage || i.currentStage || i.progressStage || "",
    message: i.message || "",
    canCancel: i.canCancel ?? i.status === "generating",
    startedAt: i.startedAt || "",
    updatedAt: i.updatedAt || ""
  };
}
function dp(n) {
  if (!n) return { title: "", questionCount: null, questions: null };
  const i = xz.safeParse(n);
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
  const i = Nn.safeParse(n);
  return i.success ? Object.fromEntries(
    Object.keys(i.data).sort().map((s) => [s, fu(i.data[s])])
  ) : n;
}
function hp(n) {
  const i = Nn.safeParse(n);
  if (!i.success) return "";
  const s = i.data.id ?? i.data.questionId;
  return typeof s == "string" || typeof s == "number" ? String(s) : "";
}
function mp(n, i) {
  return JSON.stringify(fu(n)) === JSON.stringify(fu(i));
}
function Mz(n, i) {
  if (!n || !i) return { changed: null, removed: null, added: null };
  const s = n.map(hp), r = i.map(hp);
  if (s.length > 0 && r.length > 0 && s.every(Boolean) && r.every(Boolean) && new Set(s).size === s.length && new Set(r).size === r.length) {
    const p = new Map(s.map((w, C) => [w, n[C]])), y = new Map(r.map((w, C) => [w, i[C]])), g = s.filter((w) => !y.has(w)).length, _ = r.filter((w) => !p.has(w)).length;
    return { changed: s.filter((w) => y.has(w) && !mp(p.get(w), y.get(w))).length, removed: g, added: _ };
  }
  const m = Math.min(n.length, i.length);
  let h = 0;
  for (let p = 0; p < m; p += 1)
    mp(n[p], i[p]) || (h += 1);
  return {
    changed: h,
    removed: Math.max(0, n.length - i.length),
    added: Math.max(0, i.length - n.length)
  };
}
function Go(n, i) {
  const s = Number(n?.[i]);
  return Number.isSafeInteger(s) && s >= 0 ? s : null;
}
function Dz(n) {
  const i = String(n.status || "").toLowerCase(), s = n.metadata?.applied;
  return !!n.appliedAt?.trim() || s === !0 || s === "true" || ["applied", "accepted", "completed"].includes(i);
}
function dv(n, i = !1) {
  if (Dz(n)) return !1;
  const s = String(n.status || "").toLowerCase(), r = n.metadata || {};
  return r.requiresConfirmation === !0 || r.previewOnly === !0 ? !0 : r.draftOnly === !0 || n.revisionType === "initial_generation" ? !1 : ["preview", "pending", "pending_confirmation", "awaiting_confirmation", "unapplied"].includes(s) ? n.revisionType !== "whole_quiz_revision" || r.requiresConfirmation === !0 : i;
}
function wc(n) {
  if (!n) return null;
  const i = Nn.safeParse(n), s = i.success ? i.data.preview : void 0, r = Mn(n, ["revision", "pendingRevision"]), c = iu.safeParse(r);
  if (!c.success) return null;
  const m = c.data.id ?? c.data.revisionId;
  if (!m) return null;
  const h = dp(c.data.beforeSnapshot || c.data.beforeData), p = dp(
    c.data.proposedSnapshot || c.data.afterData || c.data.preview || s
  ), y = Mz(h.questions, p.questions), g = Array.isArray(c.data.metadata?.questionIndexes) ? new Set(
    c.data.metadata.questionIndexes.map(Number).filter((D) => Number.isSafeInteger(D) && D >= 0)
  ).size : null, _ = y.changed ?? g ?? Go(c.data.metadata, "changedQuestionCount"), x = y.removed ?? Go(c.data.metadata, "removedQuestionCount") ?? (h.questionCount !== null && p.questionCount !== null ? Math.max(0, h.questionCount - p.questionCount) : null), w = y.added ?? Go(c.data.metadata, "addedQuestionCount") ?? (h.questionCount !== null && p.questionCount !== null ? Math.max(0, p.questionCount - h.questionCount) : null), C = p.title || h.title;
  return {
    id: m,
    revisionNumber: c.data.revisionNumber ?? null,
    revisionType: c.data.revisionType || "",
    requestText: c.data.requestText || "",
    status: c.data.status || "preview",
    summary: c.data.summary || (c.data.requestText ? `Requested change: ${c.data.requestText}` : "Review the proposed quiz changes."),
    changes: c.data.changes || [],
    destructive: c.data.destructive ?? !!x,
    beforeSnapshot: {
      title: h.title,
      questionCount: h.questionCount
    },
    proposedSnapshot: {
      title: C,
      questionCount: p.questionCount
    },
    changedQuestionCount: _,
    removedQuestionCount: x,
    addedQuestionCount: w,
    createdAt: c.data.createdAt || ""
  };
}
function Rz(n) {
  const i = n.map((s, r) => ({ raw: s, index: r })).filter(({ raw: s }) => dv(s)).sort((s, r) => {
    const c = Number(r.raw.revisionNumber || 0) - Number(s.raw.revisionNumber || 0);
    if (c) return c;
    const m = Date.parse(r.raw.createdAt || "") - Date.parse(s.raw.createdAt || "");
    return Number.isFinite(m) && m ? m : s.index - r.index;
  })[0]?.raw;
  return i ? wc(i) : null;
}
function hv(n) {
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
function ac(n) {
  const i = Mn(n, ["conversation"]), s = vu.parse(i), r = hv(s), c = s.pendingRevision || s.revision, m = c && dv(
    c,
    !!s.pendingRevision
  ) ? wc(c) : Rz(s.revisions || []);
  return {
    ...r,
    plan: Nz(s.plan || {}),
    messages: (s.messages || []).map(cv),
    suggestedReplies: ov(s.suggestedReplies || []),
    draft: Cz(s.draft),
    generation: fv(s.generation),
    pendingRevision: m
  };
}
function qz(n) {
  const i = Mn(n, ["conversations", "items", "data"]);
  return We(vu).parse(i).map(hv);
}
const Uz = ft({
  id: Jt,
  code: L().optional(),
  title: L().optional(),
  name: L().optional()
}).passthrough();
function Zz(n) {
  const i = Mn(n, ["courses", "items", "data"]);
  return We(Uz).parse(i).map((s) => ({
    id: s.id,
    code: s.code || `COURSE-${s.id}`,
    title: s.title || s.name || "Untitled course"
  }));
}
const Qz = ft({
  id: Jt,
  courseId: Jt,
  originalName: L().optional(),
  name: L().optional(),
  byteSize: Xt().optional(),
  chunkCount: Xt().optional(),
  status: L().optional(),
  createdAt: L().optional(),
  errorMessage: L().optional(),
  error: L().optional()
}).passthrough();
function kz(n) {
  const i = Mn(n, ["materials", "items", "data"]);
  return We(Qz).parse(i).map((s) => ({
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
  enabled: qa().optional(),
  configured: qa().optional(),
  conversationApiVersion: Jt.optional(),
  source: L().optional(),
  endpoint: L().optional(),
  maskedApiKey: L().optional(),
  chatDeployment: L().optional(),
  embeddingDeployment: L().optional(),
  apiVersion: L().optional(),
  message: L().optional()
}).passthrough();
function pp(n) {
  const i = Hz.parse(Mn(n, ["settings"]));
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
function sa(n) {
  const i = Nn.parse(n), s = i.conversation || (i.id || i.conversationId ? i : null);
  let r = null;
  if (s) {
    const m = vu.safeParse(s);
    m.success && (m.data.id || m.data.conversationId) && (r = ac(m.data));
  }
  const c = i.message && typeof i.message == "object" ? zc.safeParse(i.message) : null;
  return {
    conversation: r,
    revision: wc(i.revision || i.pendingRevision ? {
      revision: i.revision || i.pendingRevision,
      preview: i.preview
    } : null),
    message: c?.success ? cv(c.data) : null,
    notice: typeof i.message == "string" ? i.message : typeof i.notice == "string" ? i.notice : ""
  };
}
function Bz(n) {
  return fv(n) || {
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
    chunkIndex: Xt().optional()
  }).passthrough().parse(Mn(n, ["chunk", "source"]));
  return {
    label: i.label || i.sourceLabel || `Source chunk ${(i.chunkIndex ?? 0) + 1}`,
    content: i.content || i.excerpt || ""
  };
}
function Cl(n) {
  return Nn.parse(n);
}
function Lz(n) {
  return {
    async listConversations() {
      return qz(await n.getAiConversations());
    },
    async createConversation(i = {}) {
      return ac(await n.createAiConversation(i));
    },
    async getConversation(i) {
      return ac(await n.getAiConversation(i));
    },
    async deleteConversation(i) {
      return Cl(await n.deleteAiConversation(i));
    },
    async sendMessage(i, s) {
      return sa(await n.sendAiConversationMessage(i, s));
    },
    async updatePlan(i, s) {
      const r = { ...s };
      return s.scoringPreferences !== void 0 && (r.gradingPreferences = s.scoringPreferences, delete r.scoringPreferences), sa(await n.updateAiConversationPlan(i, r));
    },
    async generateDraft(i, s) {
      return sa(await n.generateAiConversationDraft(i, s));
    },
    async getGenerationStatus(i) {
      return Bz(await n.getAiConversationGenerationStatus(i));
    },
    async cancelGeneration(i) {
      return sa(await n.cancelAiConversationGeneration(i));
    },
    async reviseDraft(i, s) {
      return sa(await n.reviseAiConversationDraft(i, s));
    },
    async applyRevision(i, s) {
      return sa(await n.applyAiConversationRevision(i, s));
    },
    async regenerateQuestions(i, s, r) {
      return sa(await n.regenerateAiConversationQuestions(i, s, r));
    },
    async saveDraft(i, s) {
      return sa(await n.saveAiConversationDraft(i, s));
    },
    async listCourses() {
      return Zz(await n.getCourses());
    },
    async getSettings() {
      return pp(await n.getAiSettingsStatus());
    },
    async saveSettings(i) {
      return pp(await n.saveAiSettings(i));
    },
    async testSettings(i) {
      return Cl(await n.testAiSettings(i));
    },
    async listMaterials(i) {
      return kz(await n.getAiMaterials(i));
    },
    async uploadMaterial(i, s) {
      return Cl(await n.uploadAiMaterial(i, s));
    },
    async pasteMaterial(i, s) {
      return Cl(await n.pasteAiMaterial(i, s));
    },
    async deleteMaterial(i, s) {
      return Cl(await n.deleteAiMaterial(i, s));
    },
    async getMaterialChunk(i, s, r) {
      return $z(await n.getAiMaterialChunk(i, s, r));
    }
  };
}
const vp = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function yu({ title: n, description: i, onClose: s, size: r = "normal", children: c }) {
  const m = J.useId(), h = J.useId(), p = J.useRef(null), y = J.useRef(null);
  J.useEffect(() => {
    y.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const _ = p.current;
    (_?.querySelector(vp) || _)?.focus();
    const w = (C) => {
      C.key === "Escape" && (C.preventDefault(), s());
    };
    return document.addEventListener("keydown", w), () => {
      document.removeEventListener("keydown", w), y.current?.focus();
    };
  }, [s]);
  const g = (_) => {
    if (_.key !== "Tab" || !p.current) return;
    const x = Array.from(
      p.current.querySelectorAll(vp)
    ).filter((D) => !D.hidden);
    if (!x.length) {
      _.preventDefault(), p.current.focus();
      return;
    }
    const w = x[0], C = x[x.length - 1];
    _.shiftKey && document.activeElement === w ? (_.preventDefault(), C.focus()) : !_.shiftKey && document.activeElement === C && (_.preventDefault(), w.focus());
  };
  return /* @__PURE__ */ d.jsx(
    "div",
    {
      className: "aiw-modal-backdrop",
      onMouseDown: (_) => {
        _.currentTarget === _.target && s();
      },
      children: /* @__PURE__ */ d.jsxs(
        "div",
        {
          ref: p,
          className: `aiw-modal aiw-modal--${r}`,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": m,
          "aria-describedby": i ? h : void 0,
          tabIndex: -1,
          onKeyDown: g,
          children: [
            /* @__PURE__ */ d.jsxs("header", { className: "aiw-modal__header", children: [
              /* @__PURE__ */ d.jsxs("div", { children: [
                /* @__PURE__ */ d.jsx("h2", { id: m, children: n }),
                i ? /* @__PURE__ */ d.jsx("p", { id: h, children: i }) : null
              ] }),
              /* @__PURE__ */ d.jsx("button", { className: "aiw-icon-button", type: "button", onClick: s, "aria-label": "Close dialog", children: "×" })
            ] }),
            /* @__PURE__ */ d.jsx("div", { className: "aiw-modal__body", children: c })
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
function yp(n, i) {
  if (typeof n == "boolean")
    return n ? `${i} deployment connected.` : `${i} deployment failed.`;
  if (!n || typeof n != "object") return "";
  const s = n;
  return typeof s.message == "string" && s.message.trim() ? s.message.trim() : s.skipped === !0 ? `${i} deployment was skipped.` : s.ok === !0 ? `${i} deployment connected.` : `${i} deployment failed.`;
}
function Yz({ client: n, onClose: i, onToast: s }) {
  const r = Ni(), [c, m] = J.useState(Gz), [h, p] = J.useState(""), y = An({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  });
  J.useEffect(() => {
    const D = y.data;
    D && m((B) => ({
      ...B,
      endpoint: D.endpoint,
      chatDeployment: D.chatDeployment,
      embeddingDeployment: D.embeddingDeployment,
      apiVersion: D.apiVersion
    }));
  }, [y.data]);
  const g = qt({
    mutationFn: () => n.saveSettings(c),
    onSuccess: async () => {
      await r.invalidateQueries({ queryKey: ["ai", "settings"] }), s("Private Azure settings saved.", "success"), i();
    },
    onError: (D) => s(D instanceof Error ? D.message : "Could not save Azure settings.", "error")
  }), _ = qt({
    mutationFn: () => n.testSettings(c),
    onSuccess: (D) => {
      const B = yp(D.chat, "Chat"), V = yp(D.embeddings, "Embedding");
      p([B, V].filter(Boolean).join(" "));
    },
    onError: (D) => p(D instanceof Error ? D.message : "Connection test failed.")
  }), x = (D, B) => {
    m((V) => ({ ...V, [D]: B })), p("");
  }, w = (D) => {
    D.preventDefault(), g.mutate();
  }, C = y.data?.configured ?? !1;
  return /* @__PURE__ */ d.jsxs(
    yu,
    {
      title: "Private Azure settings",
      description: "Credentials stay on the LMS server. Saved API keys are never returned to this browser.",
      onClose: i,
      children: [
        y.isLoading ? /* @__PURE__ */ d.jsx("p", { role: "status", children: "Loading settings…" }) : null,
        y.isError ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Settings could not be loaded." }),
          /* @__PURE__ */ d.jsx("button", { type: "button", onClick: () => y.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ d.jsxs("form", { className: "aiw-dialog-form", onSubmit: w, children: [
          /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ d.jsx("span", { children: "Azure endpoint" }),
            /* @__PURE__ */ d.jsx(
              "input",
              {
                type: "url",
                required: !0,
                value: c.endpoint,
                onChange: (D) => x("endpoint", D.target.value),
                placeholder: "https://your-resource.openai.azure.com"
              }
            )
          ] }),
          /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ d.jsxs("span", { children: [
              "API key",
              y.data?.maskedApiKey ? /* @__PURE__ */ d.jsxs("small", { children: [
                "saved · ",
                y.data.maskedApiKey
              ] }) : null
            ] }),
            /* @__PURE__ */ d.jsx(
              "input",
              {
                type: "password",
                autoComplete: "new-password",
                required: !C,
                value: c.apiKey,
                onChange: (D) => x("apiKey", D.target.value),
                placeholder: C ? "Leave blank to keep saved key" : "Enter your private key"
              }
            )
          ] }),
          /* @__PURE__ */ d.jsxs("div", { className: "aiw-field-row", children: [
            /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ d.jsx("span", { children: "Chat deployment" }),
              /* @__PURE__ */ d.jsx("input", { required: !0, value: c.chatDeployment, onChange: (D) => x("chatDeployment", D.target.value) })
            ] }),
            /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ d.jsx("span", { children: "Embedding deployment" }),
              /* @__PURE__ */ d.jsx(
                "input",
                {
                  value: c.embeddingDeployment,
                  onChange: (D) => x("embeddingDeployment", D.target.value),
                  placeholder: "Required for materials"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ d.jsx("span", { children: "API version" }),
            /* @__PURE__ */ d.jsx(
              "input",
              {
                required: !0,
                value: c.apiVersion,
                onChange: (D) => x("apiVersion", D.target.value),
                placeholder: "2024-10-21"
              }
            )
          ] }),
          /* @__PURE__ */ d.jsxs("div", { className: "aiw-security-note", children: [
            /* @__PURE__ */ d.jsx("strong", { children: "Private by design" }),
            /* @__PURE__ */ d.jsx("span", { children: "Azure calls run on the backend. The browser receives configuration status only." })
          ] }),
          h ? /* @__PURE__ */ d.jsx("p", { className: "aiw-test-result", role: "status", children: h }) : null,
          /* @__PURE__ */ d.jsxs("div", { className: "aiw-dialog-actions aiw-dialog-actions--split", children: [
            /* @__PURE__ */ d.jsx(
              "button",
              {
                className: "aiw-button aiw-button--quiet",
                type: "button",
                onClick: () => _.mutate(),
                disabled: _.isPending || !c.endpoint || !c.chatDeployment || !c.apiVersion,
                children: _.isPending ? "Testing…" : "Test connection"
              }
            ),
            /* @__PURE__ */ d.jsxs("div", { children: [
              /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: i, children: "Cancel" }),
              /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--primary", type: "submit", disabled: g.isPending, children: g.isPending ? "Saving…" : "Save settings" })
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
function ic(n) {
  return n ? Kz[n] || n.replaceAll("_", " ") : "Gathering requirements";
}
function gp(n) {
  return n ? Xz[n] || n.replaceAll("_", " ") : "Preparing generation";
}
function Vz(n) {
  if (!n) return "";
  const i = new Date(mv(n));
  return Number.isNaN(i.getTime()) ? "" : new Intl.DateTimeFormat(void 0, {
    hour: "numeric",
    minute: "2-digit"
  }).format(i);
}
function mv(n) {
  const i = n.trim();
  if (!i) return "";
  const s = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(i);
  return /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(i) && !s ? `${i.replace(" ", "T")}Z` : i;
}
function Jz(n) {
  return n ? n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB` : "";
}
function gu(n) {
  const i = [];
  n.courseId || i.push("courseId"), n.topic.trim() || i.push("topic"), n.difficulty || i.push("difficulty"), (!n.questionCount || n.questionCount < 1) && i.push("questionCount"), n.language.trim() || i.push("language");
  const s = Object.values(n.questionTypeDistribution).reduce((c, m) => c + Number(m || 0), 0);
  (s < 1 || n.questionCount && s !== n.questionCount) && i.push("questionTypeDistribution");
  const r = n.missingRequiredFields.filter((c) => c === "courseId" ? !n.courseId : c === "topic" ? !n.topic.trim() : c === "difficulty" ? !n.difficulty : c === "questionCount" ? !n.questionCount : c === "language" ? !n.language.trim() : c === "questionTypeDistribution" || c === "questionTypes" ? s < 1 || !!(n.questionCount && s !== n.questionCount) : !0);
  return [.../* @__PURE__ */ new Set([...i, ...r])];
}
function Fz(n) {
  return gu(n).length === 0;
}
function pv(n) {
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
const lc = {
  multipleChoice: { short: "MCQ", full: "multiple-choice" },
  trueFalse: { short: "true/false", full: "true/false" },
  shortAnswer: { short: "short answer", full: "short-answer" },
  essay: { short: "essay", full: "essay" },
  coding: { short: "coding", full: "coding" }
}, Wz = /\b(?:algorithm|code|coding|computer|data structure|database|javascript|java|program|python|software|web)\b/i, Yo = 5;
function Vt(n, i) {
  const s = String(n || "").replace(/https?:\/\/\S+/gi, "").replace(/<[^>]*>/g, " ").replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (s.length <= i) return s;
  const r = s.slice(0, i + 1), c = r.lastIndexOf(" ");
  return `${r.slice(0, c > i * 0.6 ? c : i).trim()}…`;
}
function nu(n) {
  return Vt(
    n.originalName.replace(/\.(?:docx|md|pdf|txt)$/i, "").replace(/[_-]+/g, " "),
    54
  ) || `Material ${n.id}`;
}
function Ai(n) {
  return n ? Vt(`${n.code} — ${n.title}`, 72) : "the selected course";
}
function Pz(n, i) {
  return Vt(n.topic, 56) || Vt(i?.title, 56) || "this course";
}
function ew(n) {
  const i = Object.entries(n.questionTypeDistribution).filter(([, s]) => Number(s) > 0);
  return i.length ? {
    label: i.map(([s, r]) => `${r} ${lc[s].short}`).join(" + "),
    value: i.map(([s, r]) => `${r} ${lc[s].full} question${r === 1 ? "" : "s"}`).join(" and ")
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
    const i = Ai(n[0]);
    return [
      {
        label: `Concept check for ${Vt(n[0].code, 24)}`,
        value: `Create a medium concept-check quiz for ${i}.`
      },
      {
        label: `Mixed quiz for ${Vt(n[0].code, 24)}`,
        value: `Build a 10-question mixed quiz for ${i} with explanations.`
      },
      {
        label: `Use ${Vt(n[0].code, 24)} materials`,
        value: `Create a quiz for ${i} using its indexed course materials.`
      }
    ];
  }
  return n.slice(0, 4).map((i, s) => ({
    label: `Quiz for ${Vt(i.code, 24)}`,
    value: s % 2 ? `Create a 10-question mixed quiz for ${Ai(i)}.` : `Create a medium concept-check quiz for ${Ai(i)}.`
  }));
}
function aw({
  detail: n,
  plan: i,
  courses: s,
  materials: r
}) {
  if (!n) return nw(s);
  const c = [], m = /* @__PURE__ */ new Set(), h = (w) => {
    if (!w || c.length >= Yo) return;
    const C = Vt(w.label, 80), D = Vt(w.value, 180), B = D.toLocaleLowerCase();
    !C || !D || m.has(B) || (m.add(B), c.push({ label: C, value: D }));
  };
  n.suggestedReplies.forEach(h);
  const p = s.find((w) => Number(w.id) === Number(i.courseId)), y = gu(i), g = Pz(i, p), _ = r.filter((w) => w.status !== "failed"), x = i.materialIds.length ? _.filter((w) => i.materialIds.includes(w.id)) : _;
  if (y.includes("courseId"))
    s.slice(0, Yo).forEach((w) => h({
      label: `Use ${Vt(w.code, 24)}`,
      value: `Create this quiz for ${Ai(w)}.`
    }));
  else if (y.includes("topic"))
    x.slice(0, 2).forEach((w) => h({
      label: `Use ${nu(w)}`,
      value: `Use the main concepts from “${nu(w)}” as the quiz topic for ${Ai(p)}.`
    })), h({
      label: `Choose a ${Vt(p?.code, 24)} topic`,
      value: `Help me choose a focused topic from ${Ai(p)}.`
    });
  else if (y.includes("difficulty"))
    ["easy", "medium", "hard"].forEach((w) => h({
      label: `${w[0].toUpperCase()}${w.slice(1)} ${g}`,
      value: `Make the ${g} quiz ${w}.`
    }));
  else if (y.includes("questionCount"))
    [5, 10, 15].forEach((w) => h({
      label: `${w} ${g} questions`,
      value: `Use ${w} questions for the ${g} quiz.`
    }));
  else if (y.includes("language"))
    ["English", "Turkish", "Spanish"].forEach((w) => h({
      label: `${g} in ${w}`,
      value: `Write the ${g} quiz in ${w}.`
    }));
  else if (y.includes("questionTypeDistribution")) {
    const w = i.questionCount || 10, C = Wz.test(`${g} ${p?.title || ""}`), D = Math.min(2, Math.max(1, Math.floor(w / 4)));
    h({
      label: "Mostly multiple choice",
      value: `Use ${w} mostly multiple-choice questions about ${g}.`
    }), h(C ? {
      label: `MCQ + ${D} coding`,
      value: `Use ${w - D} multiple-choice and ${D} coding questions about ${g}.`
    } : {
      label: `MCQ + ${D} short answer`,
      value: `Use ${w - D} multiple-choice and ${D} short-answer questions about ${g}.`
    }), h({
      label: "Balanced mixed quiz",
      value: `Use a balanced mix of question types for the ${g} quiz.`
    });
  } else {
    const w = ew(i);
    if (w && h({
      label: `Keep ${w.label}`,
      value: `Keep the ${g} quiz at ${w.value}.`
    }), x.slice(0, 2).forEach((C) => h({
      label: `${i.materialScope === "course_material_only" ? "Use only" : "Ground in"} ${nu(C)}`,
      value: `${i.materialScope === "course_material_only" ? "Use only" : "Ground the quiz in"} “${nu(C)}” for the ${g} questions.`
    })), n.draft) {
      const C = lc[tw(i)].short;
      h({
        label: `Make ${C} questions harder`,
        value: `Make the ${C} questions more challenging while keeping the ${g} learning objectives.`
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
  return c.length < 3 && [...n.messages].reverse().find((C) => C.sender === "assistant")?.quickReplies.forEach(h), c.slice(0, Yo);
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
  const [p, y] = J.useState(""), g = J.useRef(null), _ = n || i, x = (C) => {
    C?.preventDefault();
    const D = p.trim();
    !D || _ || s || (c(D), y(""));
  }, w = (C) => {
    C.key === "Enter" && !C.shiftKey && (C.preventDefault(), x());
  };
  return /* @__PURE__ */ d.jsxs("form", { className: "aiw-composer", onSubmit: x, "aria-label": "Message the AI quiz assistant", children: [
    /* @__PURE__ */ d.jsx("label", { htmlFor: "aiw-chat-message", className: "aiw-sr-only", children: r ? "Describe a revision to the quiz draft" : "Describe the quiz you want to create" }),
    /* @__PURE__ */ d.jsx(
      "textarea",
      {
        ref: g,
        id: "aiw-chat-message",
        value: p,
        onChange: (C) => y(C.target.value),
        onKeyDown: w,
        rows: 3,
        maxLength: 8e3,
        disabled: _ || s,
        placeholder: r ? "Ask for a controlled revision, for example “Make question 3 harder”…" : "Describe the course, topic, outcomes, difficulty, question types, and special instructions…"
      }
    ),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-composer__footer", children: [
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-composer__tools", children: [
        /* @__PURE__ */ d.jsxs("button", { type: "button", onClick: m, disabled: n, "aria-label": "Upload course material", children: [
          /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", children: "＋" }),
          " Attach"
        ] }),
        /* @__PURE__ */ d.jsx("button", { type: "button", onClick: h, disabled: n, "aria-label": "Paste course material", children: "Paste notes" })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-composer__send", children: [
        /* @__PURE__ */ d.jsxs("span", { children: [
          p.length,
          "/8000"
        ] }),
        /* @__PURE__ */ d.jsx(
          "button",
          {
            className: "aiw-button aiw-button--primary",
            type: "submit",
            disabled: !p.trim() || _ || s,
            children: s ? "Sending…" : r ? "Request revision" : "Send"
          }
        )
      ] })
    ] })
  ] });
}
const bp = [
  "validating_quiz_plan",
  "retrieving_course_material",
  "selecting_source_passages",
  "generating_questions",
  "validating_generated_output",
  "saving_draft",
  "opening_review_workspace"
];
function lw({ generation: n, cancelling: i, onCancel: s }) {
  const r = bp.indexOf(n.stage);
  return /* @__PURE__ */ d.jsxs("section", { className: "aiw-generation", "aria-labelledby": "aiw-generation-title", "aria-live": "polite", children: [
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-generation__head", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "Generation in progress" }),
        /* @__PURE__ */ d.jsx("h3", { id: "aiw-generation-title", children: gp(n.stage) }),
        n.message ? /* @__PURE__ */ d.jsx("p", { children: n.message }) : null
      ] }),
      n.canCancel ? /* @__PURE__ */ d.jsx(
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
    /* @__PURE__ */ d.jsx("ol", { className: "aiw-generation__stages", "aria-label": "Generation stages", children: bp.map((c, m) => /* @__PURE__ */ d.jsxs(
      "li",
      {
        className: [
          c === n.stage ? "is-current" : "",
          r >= 0 && m < r ? "is-complete" : ""
        ].filter(Boolean).join(" "),
        "aria-current": c === n.stage ? "step" : void 0,
        children: [
          /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", children: r >= 0 && m < r ? "✓" : m + 1 }),
          gp(c)
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
  const c = n.beforeSnapshot.questionCount, m = n.proposedSnapshot.questionCount, h = n.proposedSnapshot.title || n.beforeSnapshot.title || "Untitled quiz", p = c !== null || m !== null;
  return /* @__PURE__ */ d.jsxs("section", { className: "aiw-revision-preview", "aria-labelledby": "aiw-revision-title", children: [
    /* @__PURE__ */ d.jsxs("div", { children: [
      /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "Revision preview" }),
      /* @__PURE__ */ d.jsx("h3", { id: "aiw-revision-title", children: n.summary }),
      /* @__PURE__ */ d.jsx("p", { children: "No quiz content has been replaced yet." })
    ] }),
    /* @__PURE__ */ d.jsxs("dl", { className: "aiw-revision-facts", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Proposed title" }),
        /* @__PURE__ */ d.jsx("dd", { children: h })
      ] }),
      p ? /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ d.jsxs(
          "dd",
          {
            "aria-label": `Question count changes from ${c ?? "unknown"} to ${m ?? "unknown"}`,
            children: [
              c ?? "—",
              " ",
              /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", children: "→" }),
              " ",
              m ?? "—"
            ]
          }
        )
      ] }) : null,
      n.changedQuestionCount ? /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Changed" }),
        /* @__PURE__ */ d.jsx("dd", { children: n.changedQuestionCount })
      ] }) : null,
      n.removedQuestionCount ? /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Removed" }),
        /* @__PURE__ */ d.jsx("dd", { children: n.removedQuestionCount })
      ] }) : null,
      n.addedQuestionCount ? /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Added" }),
        /* @__PURE__ */ d.jsx("dd", { children: n.addedQuestionCount })
      ] }) : null
    ] }),
    n.changes.length ? /* @__PURE__ */ d.jsx("ul", { children: n.changes.map((y, g) => /* @__PURE__ */ d.jsx("li", { children: y }, `${g}-${y}`)) }) : null,
    n.destructive ? /* @__PURE__ */ d.jsx("p", { className: "aiw-warning-note", children: "This revision replaces or removes existing questions. Review it carefully before applying." }) : null,
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-actions", children: [
      /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, disabled: i, children: "Keep current draft" }),
      /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: s, disabled: i, children: i ? "Applying…" : "Apply revision" })
    ] })
  ] });
}
function uw({ replies: n, onSelect: i, disabled: s = !1 }) {
  return n.length ? /* @__PURE__ */ d.jsx("div", { className: "aiw-suggestions", "aria-label": "Suggested replies", children: n.map((r) => /* @__PURE__ */ d.jsx(
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
  loading: p,
  error: y,
  isSending: g,
  generation: _,
  cancelling: x,
  revision: w,
  applyingRevision: C,
  onRetryLoad: D,
  onRetryCourses: B,
  onOpenCourses: V,
  onCourseSelect: $,
  onSend: ie,
  onRetryMessage: Y,
  onAttach: ee,
  onPasteMaterial: te,
  onCancelGeneration: G,
  onApplyRevision: A,
  onDismissRevision: k,
  review: ne
}) {
  const he = J.useRef(null), ue = n?.messages || [], Oe = J.useMemo(
    () => aw({ detail: n, plan: i, courses: s, materials: r }),
    [s, n, r, i]
  ), je = !!i.courseId && !c && !m && s.length > 0, Xe = !!n?.draft, nt = J.useMemo(() => gu(i), [i]);
  return J.useEffect(() => {
    he.current?.scrollTo({
      top: he.current.scrollHeight,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }, [ue.length, g]), /* @__PURE__ */ d.jsxs("section", { className: `aiw-chat ${Xe ? "aiw-chat--with-review" : ""}`, "aria-labelledby": "aiw-chat-heading", children: [
    /* @__PURE__ */ d.jsxs("header", { className: "aiw-chat__header", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "Guided quiz designer" }),
        /* @__PURE__ */ d.jsx("h2", { id: "aiw-chat-heading", children: n?.title || "New quiz conversation" })
      ] }),
      n ? /* @__PURE__ */ d.jsx("span", { className: "aiw-chat__context", children: nt.length ? `Still needs ${nt.map(pv).slice(0, 2).join(" and ")}` : "Quiz plan is ready" }) : null
    ] }),
    y ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("strong", { children: "Conversation unavailable" }),
        /* @__PURE__ */ d.jsx("p", { children: "Your work is still stored. Try loading it again." })
      ] }),
      /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: D, children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ d.jsxs(
      "div",
      {
        ref: he,
        className: "aiw-message-list",
        "aria-live": "polite",
        "aria-busy": p || g,
        "aria-label": "Conversation messages",
        children: [
          p ? /* @__PURE__ */ d.jsx("p", { className: "aiw-loading-message", role: "status", children: "Loading conversation…" }) : null,
          !p && !ue.length ? /* @__PURE__ */ d.jsxs("article", { className: "aiw-message aiw-message--assistant", children: [
            /* @__PURE__ */ d.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ d.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ d.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ d.jsx("p", { children: rw })
            ] })
          ] }) : null,
          !p && !i.courseId ? /* @__PURE__ */ d.jsxs("section", { className: "aiw-course-start", "aria-labelledby": "aiw-course-start-heading", children: [
            /* @__PURE__ */ d.jsxs("div", { children: [
              /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "First step" }),
              /* @__PURE__ */ d.jsx("h3", { id: "aiw-course-start-heading", children: "Choose the course for this quiz" }),
              /* @__PURE__ */ d.jsx("p", { children: "The course controls available materials, context, and course-specific suggestions." })
            ] }),
            c ? /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : m ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
              /* @__PURE__ */ d.jsx("span", { children: "Courses could not be loaded." }),
              /* @__PURE__ */ d.jsx("button", { type: "button", onClick: B, children: "Retry" })
            ] }) : s.length ? /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
              /* @__PURE__ */ d.jsx("span", { children: "Course" }),
              /* @__PURE__ */ d.jsxs(
                "select",
                {
                  id: "aiw-start-course",
                  "aria-label": "Choose a course to start",
                  value: "",
                  disabled: h,
                  onChange: (N) => {
                    const K = Number(N.target.value);
                    K && $(K);
                  },
                  children: [
                    /* @__PURE__ */ d.jsx("option", { value: "", children: h ? "Starting course workspace…" : "Select a course" }),
                    s.map((N) => /* @__PURE__ */ d.jsxs("option", { value: N.id, children: [
                      N.code,
                      " — ",
                      N.title
                    ] }, N.id))
                  ]
                }
              ),
              /* @__PURE__ */ d.jsx("small", { children: "Selecting a course starts and saves this conversation." })
            ] }) : /* @__PURE__ */ d.jsxs("div", { className: "aiw-course-start__empty", children: [
              /* @__PURE__ */ d.jsx("p", { children: "No courses are available for your account yet." }),
              /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: V, children: "Open Courses" })
            ] })
          ] }) : null,
          ue.map((N) => /* @__PURE__ */ d.jsxs(
            "article",
            {
              className: `aiw-message aiw-message--${N.sender}`,
              "data-status": N.status,
              children: [
                /* @__PURE__ */ d.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: N.sender === "user" ? "You" : "AI" }),
                /* @__PURE__ */ d.jsxs("div", { className: "aiw-message__bubble", children: [
                  /* @__PURE__ */ d.jsxs("div", { className: "aiw-message__meta", children: [
                    /* @__PURE__ */ d.jsx("span", { className: "aiw-message__author", children: N.sender === "user" ? "You" : "Quiz Assistant" }),
                    N.createdAt ? /* @__PURE__ */ d.jsx("time", { dateTime: mv(N.createdAt), children: Vz(N.createdAt) }) : null
                  ] }),
                  /* @__PURE__ */ d.jsx("p", { children: N.content }),
                  N.status === "failed" ? /* @__PURE__ */ d.jsx("button", { type: "button", className: "aiw-text-button", onClick: () => Y(N), children: "Retry message" }) : null
                ] })
              ]
            },
            N.id
          )),
          g ? /* @__PURE__ */ d.jsxs("article", { className: "aiw-message aiw-message--assistant aiw-message--pending", role: "status", children: [
            /* @__PURE__ */ d.jsx("div", { className: "aiw-avatar", "aria-hidden": "true", children: "AI" }),
            /* @__PURE__ */ d.jsxs("div", { className: "aiw-message__bubble", children: [
              /* @__PURE__ */ d.jsx("span", { className: "aiw-message__author", children: "Quiz Assistant" }),
              /* @__PURE__ */ d.jsxs("span", { className: "aiw-typing", "aria-label": "Assistant is responding", children: [
                /* @__PURE__ */ d.jsx("i", {}),
                /* @__PURE__ */ d.jsx("i", {}),
                /* @__PURE__ */ d.jsx("i", {})
              ] })
            ] })
          ] }) : null
        ]
      }
    ),
    /* @__PURE__ */ d.jsx(
      uw,
      {
        replies: je ? Oe : [],
        onSelect: ie,
        disabled: g || !!_ || h
      }
    ),
    w ? /* @__PURE__ */ d.jsx(
      sw,
      {
        revision: w,
        applying: C,
        onApply: () => A(w),
        onDismiss: k
      }
    ) : null,
    _?.status === "generating" ? /* @__PURE__ */ d.jsx(lw, { generation: _, cancelling: x, onCancel: G }) : null,
    /* @__PURE__ */ d.jsx(
      iw,
      {
        disabled: h || !!(_ && ["queued", "generating", "cancel_requested"].includes(_.status)),
        startRequired: !n && !i.courseId,
        isSending: g,
        hasDraft: Xe,
        onSend: ie,
        onAttach: ee,
        onPasteMaterial: te
      }
    ),
    ne
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
  onSelect: p,
  onDelete: y,
  onRetry: g,
  materials: _
}) {
  const [x, w] = J.useState(""), [C, D] = J.useState("all"), [B, V] = J.useState(null), $ = J.useMemo(() => {
    const Y = x.trim().toLocaleLowerCase();
    return n.filter((ee) => {
      const te = !Y || ee.title.toLocaleLowerCase().includes(Y), G = C === "all" || ee.status === C;
      return te && G;
    });
  }, [n, x, C]), ie = n.filter((Y) => Y.draftId).slice(0, 4);
  return /* @__PURE__ */ d.jsxs("aside", { className: "aiw-sidebar", "aria-label": "AI conversations and materials", children: [
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-sidebar__top", children: [
      /* @__PURE__ */ d.jsxs("button", { className: "aiw-button aiw-button--primary aiw-button--full", type: "button", onClick: h, disabled: c, children: [
        /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", children: "＋" }),
        c ? "Starting…" : "New conversation"
      ] }),
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-search", children: [
        /* @__PURE__ */ d.jsx("span", { className: "aiw-sr-only", children: "Search conversations" }),
        /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", children: "⌕" }),
        /* @__PURE__ */ d.jsx(
          "input",
          {
            type: "search",
            value: x,
            onChange: (Y) => w(Y.target.value),
            placeholder: "Search conversations"
          }
        )
      ] }),
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-field aiw-field--compact", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Status" }),
        /* @__PURE__ */ d.jsxs("select", { value: C, onChange: (Y) => D(Y.target.value), children: [
          /* @__PURE__ */ d.jsx("option", { value: "all", children: "All conversations" }),
          /* @__PURE__ */ d.jsx("option", { value: "gathering_requirements", children: "Gathering requirements" }),
          /* @__PURE__ */ d.jsx("option", { value: "ready_to_generate", children: "Ready to generate" }),
          /* @__PURE__ */ d.jsx("option", { value: "review_required", children: "Review required" }),
          /* @__PURE__ */ d.jsx("option", { value: "draft_saved", children: "Draft saved" }),
          /* @__PURE__ */ d.jsx("option", { value: "generation_failed", children: "Generation failed" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ d.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-conversations-heading", children: [
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ d.jsx("h2", { id: "aiw-conversations-heading", children: "Conversations" }),
        /* @__PURE__ */ d.jsx("span", { children: $.length })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-conversation-list", children: [
        s ? /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", role: "status", children: "Loading conversations…" }) : null,
        r ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Conversations could not be loaded." }),
          /* @__PURE__ */ d.jsx("button", { type: "button", onClick: g, children: "Retry" })
        ] }) : null,
        !s && !r && !$.length ? /* @__PURE__ */ d.jsx("div", { className: "aiw-mini-empty", children: /* @__PURE__ */ d.jsx("p", { children: n.length ? "No conversations match this filter." : "No conversations yet." }) }) : null,
        $.map((Y) => /* @__PURE__ */ d.jsxs(
          "div",
          {
            className: `aiw-conversation-row ${i === Y.id ? "is-active" : ""}`,
            children: [
              /* @__PURE__ */ d.jsxs(
                "button",
                {
                  className: "aiw-conversation",
                  type: "button",
                  onClick: () => p(Y.id),
                  "aria-current": i === Y.id ? "page" : void 0,
                  children: [
                    /* @__PURE__ */ d.jsx("span", { className: "aiw-conversation__title", children: Y.title }),
                    /* @__PURE__ */ d.jsx("span", { className: `aiw-status aiw-status--${Y.status}`, children: ic(Y.status) })
                  ]
                }
              ),
              /* @__PURE__ */ d.jsx(
                "button",
                {
                  className: "aiw-conversation__delete",
                  type: "button",
                  "aria-label": `Delete conversation: ${Y.title}`,
                  title: Y.status === "generating" ? "Stop quiz generation before deleting this conversation" : "Delete conversation",
                  disabled: m === Y.id || Y.status === "generating",
                  onClick: () => V(Y),
                  children: /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", children: "×" })
                }
              )
            ]
          },
          Y.id
        ))
      ] })
    ] }),
    ie.length ? /* @__PURE__ */ d.jsxs("section", { className: "aiw-sidebar__section", "aria-labelledby": "aiw-drafts-heading", children: [
      /* @__PURE__ */ d.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ d.jsx("h2", { id: "aiw-drafts-heading", children: "Recent drafts" }) }),
      /* @__PURE__ */ d.jsx("div", { className: "aiw-compact-list", children: ie.map((Y) => /* @__PURE__ */ d.jsxs("button", { type: "button", onClick: () => p(Y.id), children: [
        /* @__PURE__ */ d.jsx("span", { children: Y.title }),
        /* @__PURE__ */ d.jsx("small", { children: ic(Y.status) })
      ] }, Y.id)) })
    ] }) : null,
    _,
    B ? /* @__PURE__ */ d.jsxs(
      yu,
      {
        title: "Delete conversation?",
        description: "This permanently removes the conversation and all of its chat messages.",
        onClose: () => V(null),
        children: [
          /* @__PURE__ */ d.jsxs("p", { className: "aiw-delete-conversation-copy", children: [
            /* @__PURE__ */ d.jsx("strong", { children: B.title }),
            " cannot be recovered after deletion."
          ] }),
          /* @__PURE__ */ d.jsxs("div", { className: "aiw-dialog-actions", children: [
            /* @__PURE__ */ d.jsx(
              "button",
              {
                className: "aiw-button aiw-button--quiet",
                type: "button",
                onClick: () => V(null),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ d.jsx(
              "button",
              {
                className: "aiw-button aiw-button--danger",
                type: "button",
                disabled: m === B.id,
                onClick: () => {
                  y(B.id), V(null);
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
  courseSelectionPending: p,
  onPlanPatch: y,
  onCourseSelect: g,
  onRetryCourses: _,
  onOpenCourses: x,
  onToast: w
}) {
  const C = Ni(), [D, B] = J.useState(""), V = An({
    queryKey: ["ai", "materials", r],
    queryFn: () => n.listMaterials(r),
    enabled: !!r
  }), $ = V.data || [], ie = qt({
    mutationFn: ({ selectedCourseId: A, file: k }) => n.uploadMaterial(A, k),
    onSuccess: async () => {
      await Promise.all([
        C.invalidateQueries({ queryKey: ["ai", "materials", r] }),
        i ? C.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), w("Course material indexed.", "success");
    },
    onError: (A) => w(A instanceof Error ? A.message : "Material upload failed.", "error")
  }), Y = qt({
    mutationFn: ({ selectedCourseId: A, materialId: k }) => n.deleteMaterial(A, k),
    onSuccess: async (A, k) => {
      y({ materialIds: s.materialIds.filter((ne) => ne !== k.materialId) }), await Promise.all([
        C.invalidateQueries({ queryKey: ["ai", "materials", r] }),
        i ? C.invalidateQueries({ queryKey: ["ai", "conversation", i] }) : Promise.resolve()
      ]), w("Material removed.", "success");
    },
    onError: (A) => w(A instanceof Error ? A.message : "Could not remove material.", "error")
  }), ee = J.useMemo(() => {
    const A = D.trim().toLocaleLowerCase();
    return $.filter((k) => !A || k.originalName.toLocaleLowerCase().includes(A));
  }, [D, $]), te = (A) => {
    const k = A.target.files?.[0];
    A.target.value = "", !(!k || !r) && ie.mutate({ selectedCourseId: r, file: k });
  }, G = (A) => {
    if (!i) {
      w("Start a conversation before selecting source material.", "info");
      return;
    }
    const k = s.materialIds.includes(A.id);
    y({
      materialIds: k ? s.materialIds.filter((ne) => ne !== A.id) : [...s.materialIds, A.id]
    });
  };
  return /* @__PURE__ */ d.jsxs("section", { className: "aiw-sidebar__section aiw-materials", "aria-labelledby": "aiw-materials-heading", children: [
    /* @__PURE__ */ d.jsx("div", { className: "aiw-section-heading", children: /* @__PURE__ */ d.jsxs("div", { children: [
      /* @__PURE__ */ d.jsx("h2", { id: "aiw-materials-heading", children: "Course materials" }),
      /* @__PURE__ */ d.jsx("small", { children: r ? `${$.length} indexed` : "Choose a course first" })
    ] }) }),
    r ? null : /* @__PURE__ */ d.jsx("div", { className: "aiw-material-course", children: m ? /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : h ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
      /* @__PURE__ */ d.jsx("span", { children: "Courses could not be loaded." }),
      /* @__PURE__ */ d.jsx("button", { type: "button", onClick: _, children: "Retry" })
    ] }) : c.length ? /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
      /* @__PURE__ */ d.jsx("span", { children: "Course for materials" }),
      /* @__PURE__ */ d.jsxs(
        "select",
        {
          "aria-label": "Course for materials",
          value: "",
          disabled: p,
          onChange: (A) => {
            const k = Number(A.target.value);
            k && g(k);
          },
          children: [
            /* @__PURE__ */ d.jsx("option", { value: "", children: p ? "Starting workspace…" : "Select a course" }),
            c.map((A) => /* @__PURE__ */ d.jsxs("option", { value: A.id, children: [
              A.code,
              " — ",
              A.title
            ] }, A.id))
          ]
        }
      )
    ] }) : /* @__PURE__ */ d.jsx(
      "button",
      {
        className: "aiw-button aiw-button--quiet aiw-button--small aiw-button--full",
        type: "button",
        onClick: x,
        children: "Open Courses"
      }
    ) }),
    /* @__PURE__ */ d.jsx(
      "input",
      {
        id: "aiw-material-upload",
        className: "aiw-sr-only",
        type: "file",
        accept: ".pdf,.txt,.md,.docx",
        onChange: te,
        disabled: !r || p || ie.isPending
      }
    ),
    ie.isPending ? /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", role: "status", children: "Indexing material…" }) : null,
    $.length > 4 ? /* @__PURE__ */ d.jsxs("label", { className: "aiw-search aiw-search--small", children: [
      /* @__PURE__ */ d.jsx("span", { className: "aiw-sr-only", children: "Filter course materials" }),
      /* @__PURE__ */ d.jsx("span", { "aria-hidden": "true", children: "⌕" }),
      /* @__PURE__ */ d.jsx("input", { value: D, onChange: (A) => B(A.target.value), placeholder: "Filter materials" })
    ] }) : null,
    V.isLoading ? /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", role: "status", children: "Loading materials…" }) : null,
    V.isError ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
      /* @__PURE__ */ d.jsx("span", { children: "Materials could not be loaded." }),
      /* @__PURE__ */ d.jsx("button", { type: "button", onClick: () => V.refetch(), children: "Retry" })
    ] }) : null,
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-material-list", children: [
      r && !V.isLoading && !ee.length ? /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", children: "No indexed material for this course." }) : null,
      ee.map((A) => /* @__PURE__ */ d.jsxs("div", { className: "aiw-material", children: [
        /* @__PURE__ */ d.jsxs("label", { children: [
          /* @__PURE__ */ d.jsx(
            "input",
            {
              type: "checkbox",
              checked: s.materialIds.includes(A.id),
              onChange: () => G(A),
              disabled: A.status === "failed"
            }
          ),
          /* @__PURE__ */ d.jsxs("span", { children: [
            /* @__PURE__ */ d.jsx("strong", { children: A.originalName }),
            /* @__PURE__ */ d.jsx("small", { children: A.status === "failed" ? A.errorMessage || "Indexing failed" : `${A.chunkCount} chunks${A.byteSize ? ` · ${Jz(A.byteSize)}` : ""}` })
          ] })
        ] }),
        /* @__PURE__ */ d.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            "aria-label": `Remove ${A.originalName}`,
            disabled: Y.isPending,
            onClick: () => {
              r && window.confirm(`Remove “${A.originalName}” and its indexed chunks?`) && Y.mutate({ selectedCourseId: r, materialId: A.id });
            },
            children: "×"
          }
        )
      ] }, A.id))
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
  const m = Ni(), [h, p] = J.useState("Pasted course notes"), [y, g] = J.useState(""), _ = qt({
    mutationFn: () => n.pasteMaterial(i, { name: h.trim(), content: y.trim() }),
    onSuccess: async () => {
      await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "materials", i] }),
        s ? m.invalidateQueries({ queryKey: ["ai", "conversation", s] }) : Promise.resolve()
      ]), c("Pasted notes indexed.", "success"), r();
    },
    onError: (w) => c(w instanceof Error ? w.message : "Could not index pasted notes.", "error")
  }), x = (w) => {
    w.preventDefault(), h.trim() && y.trim() && _.mutate();
  };
  return /* @__PURE__ */ d.jsx(
    yu,
    {
      title: "Paste course material",
      description: "The text is treated as untrusted reference content and indexed only for this course.",
      onClose: r,
      size: "wide",
      children: /* @__PURE__ */ d.jsxs("form", { className: "aiw-dialog-form", onSubmit: x, children: [
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Material name" }),
          /* @__PURE__ */ d.jsx("input", { value: h, onChange: (w) => p(w.target.value), maxLength: 160, required: !0 })
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Course notes" }),
          /* @__PURE__ */ d.jsx(
            "textarea",
            {
              value: y,
              onChange: (w) => g(w.target.value),
              rows: 12,
              maxLength: 1e5,
              required: !0,
              placeholder: "Paste lecture notes, reading excerpts, or other course-owned content…"
            }
          )
        ] }),
        /* @__PURE__ */ d.jsxs("p", { className: "aiw-field-hint", children: [
          y.length.toLocaleString(),
          " / 100,000 characters"
        ] }),
        /* @__PURE__ */ d.jsxs("div", { className: "aiw-dialog-actions", children: [
          /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: r, children: "Cancel" }),
          /* @__PURE__ */ d.jsx(
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
const _p = [
  ["multipleChoice", "Multiple choice"],
  ["trueFalse", "True / false"],
  ["shortAnswer", "Short answer"],
  ["essay", "Essay"],
  ["coding", "Coding"]
];
function au(n) {
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
  conversationStatus: p,
  generation: y,
  generating: g,
  generationAvailable: _,
  generationConfigured: x,
  onCourseSelect: w,
  onRetryCourses: C,
  onOpenCourses: D,
  onPatch: B,
  onGenerate: V
}) {
  const $ = gu(n), ie = !!h && Fz(n), Y = i.find((G) => G.id === n.courseId), ee = Object.values(n.questionTypeDistribution).reduce((G, A) => G + Number(A || 0), 0), te = (G, A) => {
    B({
      questionTypeDistribution: {
        ...n.questionTypeDistribution,
        [G]: Math.max(0, A)
      }
    });
  };
  return /* @__PURE__ */ d.jsxs("aside", { className: "aiw-plan", "aria-labelledby": "aiw-plan-heading", children: [
    /* @__PURE__ */ d.jsxs("header", { className: "aiw-plan__header", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "Live specification" }),
        /* @__PURE__ */ d.jsx("h2", { id: "aiw-plan-heading", children: "Quiz Plan" })
      ] }),
      /* @__PURE__ */ d.jsxs("span", { className: `aiw-readiness ${ie ? "is-ready" : ""}`, children: [
        /* @__PURE__ */ d.jsx("i", { "aria-hidden": "true" }),
        ie ? "Ready" : `${$.length} missing`
      ] })
    ] }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-plan__status", children: [
      /* @__PURE__ */ d.jsx("span", { children: "Status" }),
      /* @__PURE__ */ d.jsx("strong", { children: ic(y?.status || p) })
    ] }),
    /* @__PURE__ */ d.jsxs("section", { className: "aiw-plan-course", "aria-labelledby": "aiw-plan-course-heading", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("h3", { id: "aiw-plan-course-heading", children: "Course" }),
        /* @__PURE__ */ d.jsx("small", { children: m ? "Locked after draft generation" : "Required before planning or adding material" })
      ] }),
      s ? /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", role: "status", children: "Loading courses…" }) : r ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-error", role: "alert", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Courses could not be loaded." }),
        /* @__PURE__ */ d.jsx("button", { type: "button", onClick: C, children: "Retry" })
      ] }) : i.length ? /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsx("span", { className: "aiw-sr-only", children: "Quiz course" }),
        /* @__PURE__ */ d.jsxs(
          "select",
          {
            "aria-label": "Quiz course",
            value: n.courseId || "",
            disabled: c || g || m,
            onChange: (G) => {
              const A = Number(G.target.value);
              A && w(A);
            },
            children: [
              /* @__PURE__ */ d.jsx("option", { value: "", disabled: !0, children: c ? "Saving course…" : "Select a course" }),
              i.map((G) => /* @__PURE__ */ d.jsxs("option", { value: G.id, children: [
                G.code,
                " — ",
                G.title
              ] }, G.id))
            ]
          }
        )
      ] }) : /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: D, children: "Open Courses" }),
      m ? /* @__PURE__ */ d.jsx("p", { children: "Start a new conversation to use another course." }) : null
    ] }),
    /* @__PURE__ */ d.jsxs("dl", { className: "aiw-plan-summary", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Course" }),
        /* @__PURE__ */ d.jsx("dd", { children: Y ? `${Y.code} · ${Y.title}` : "Not set" })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Topic" }),
        /* @__PURE__ */ d.jsx("dd", { children: au(n.topic) })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Difficulty" }),
        /* @__PURE__ */ d.jsx("dd", { children: au(n.difficulty) })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Questions" }),
        /* @__PURE__ */ d.jsx("dd", { children: au(n.questionCount) })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Language" }),
        /* @__PURE__ */ d.jsx("dd", { children: au(n.language) })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("dt", { children: "Knowledge scope" }),
        /* @__PURE__ */ d.jsx("dd", { children: n.materialScope.replaceAll("_", " ") })
      ] })
    ] }),
    n.learningObjectives.length ? /* @__PURE__ */ d.jsxs("section", { className: "aiw-plan__objectives", "aria-labelledby": "aiw-objectives-heading", children: [
      /* @__PURE__ */ d.jsx("h3", { id: "aiw-objectives-heading", children: "Learning objectives" }),
      /* @__PURE__ */ d.jsx("ul", { children: n.learningObjectives.map((G) => /* @__PURE__ */ d.jsx("li", { children: G }, G)) })
    ] }) : null,
    /* @__PURE__ */ d.jsxs("section", { className: "aiw-plan__types", "aria-labelledby": "aiw-type-summary-heading", children: [
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-section-heading", children: [
        /* @__PURE__ */ d.jsx("h3", { id: "aiw-type-summary-heading", children: "Question mix" }),
        /* @__PURE__ */ d.jsxs("span", { children: [
          ee,
          "/",
          n.questionCount || 0
        ] })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-type-bars", children: [
        _p.filter(([G]) => n.questionTypeDistribution[G] > 0).map(([G, A]) => /* @__PURE__ */ d.jsxs("div", { children: [
          /* @__PURE__ */ d.jsx("span", { children: A }),
          /* @__PURE__ */ d.jsx("strong", { children: n.questionTypeDistribution[G] })
        ] }, G)),
        ee ? null : /* @__PURE__ */ d.jsx("p", { className: "aiw-muted", children: "No question types selected." })
      ] })
    ] }),
    !h || !n.courseId ? /* @__PURE__ */ d.jsx("div", { className: "aiw-plan-note", role: "status", children: "Choose a course above to start a saved quiz plan." }) : x ? _ ? $.length ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-plan-note", role: "status", children: [
      /* @__PURE__ */ d.jsx("strong", { children: "Still needed:" }),
      " ",
      $.map(pv).join(", ")
    ] }) : /* @__PURE__ */ d.jsx("div", { className: "aiw-plan-note aiw-plan-note--success", role: "status", children: "The plan is complete. Generation starts only when you choose Generate Draft." }) : /* @__PURE__ */ d.jsx("div", { className: "aiw-plan-note", role: "status", children: "AI generation is currently disabled. Your Quiz Plan remains saved." }) : /* @__PURE__ */ d.jsx("div", { className: "aiw-plan-note", role: "status", children: "Configure Azure OpenAI in Azure settings before generating a draft." }),
    /* @__PURE__ */ d.jsx(
      "button",
      {
        className: "aiw-button aiw-button--primary aiw-button--full aiw-generate-button",
        type: "button",
        onClick: V,
        disabled: !ie || g || !_,
        children: g ? "Generating draft…" : p === "generation_failed" ? "Retry generation" : "Generate Draft"
      }
    ),
    /* @__PURE__ */ d.jsx("p", { className: "aiw-safety-copy", children: "Generation always creates a private draft. Nothing is published automatically." }),
    /* @__PURE__ */ d.jsxs("details", { className: "aiw-advanced", children: [
      /* @__PURE__ */ d.jsxs("summary", { children: [
        /* @__PURE__ */ d.jsx("span", { children: "Advanced settings" }),
        /* @__PURE__ */ d.jsx("small", { children: "Direct controls for the same Quiz Plan" })
      ] }),
      /* @__PURE__ */ d.jsxs("fieldset", { disabled: !h || g, children: [
        /* @__PURE__ */ d.jsx("legend", { className: "aiw-sr-only", children: "Advanced Quiz Plan settings" }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Topic" }),
          /* @__PURE__ */ d.jsx(
            "input",
            {
              value: n.topic,
              maxLength: 500,
              onChange: (G) => B({ topic: G.target.value }),
              placeholder: "e.g. Python loops"
            }
          )
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsxs("span", { children: [
            "Learning objectives ",
            /* @__PURE__ */ d.jsx("small", { children: "one per line" })
          ] }),
          /* @__PURE__ */ d.jsx(
            "textarea",
            {
              rows: 3,
              value: n.learningObjectives.join(`
`),
              onChange: (G) => B({
                learningObjectives: G.target.value.split(`
`).map((A) => A.trim()).filter(Boolean)
              })
            }
          )
        ] }),
        /* @__PURE__ */ d.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ d.jsx("span", { children: "Difficulty" }),
            /* @__PURE__ */ d.jsxs(
              "select",
              {
                value: n.difficulty,
                onChange: (G) => B({ difficulty: G.target.value }),
                children: [
                  /* @__PURE__ */ d.jsx("option", { value: "", children: "Select difficulty" }),
                  /* @__PURE__ */ d.jsx("option", { value: "easy", children: "Easy" }),
                  /* @__PURE__ */ d.jsx("option", { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ d.jsx("option", { value: "hard", children: "Hard" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ d.jsx("span", { children: "Question count" }),
            /* @__PURE__ */ d.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 20,
                value: n.questionCount || "",
                onChange: (G) => B({
                  questionCount: G.target.value ? Number(G.target.value) : null
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ d.jsxs("fieldset", { className: "aiw-distribution", children: [
          /* @__PURE__ */ d.jsx("legend", { children: "Question type distribution" }),
          /* @__PURE__ */ d.jsx("div", { className: "aiw-distribution__grid", children: _p.map(([G, A]) => /* @__PURE__ */ d.jsxs("label", { children: [
            /* @__PURE__ */ d.jsx("span", { children: A }),
            /* @__PURE__ */ d.jsx(
              "input",
              {
                "aria-label": `${A} count`,
                type: "number",
                min: 0,
                max: 20,
                value: n.questionTypeDistribution[G],
                onChange: (k) => te(G, Number(k.target.value || 0))
              }
            )
          ] }, G)) })
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Language" }),
          /* @__PURE__ */ d.jsx("input", { value: n.language, maxLength: 60, onChange: (G) => B({ language: G.target.value }) })
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Knowledge scope" }),
          /* @__PURE__ */ d.jsxs(
            "select",
            {
              value: n.materialScope,
              onChange: (G) => {
                const A = G.target.value;
                B({
                  materialScope: A,
                  useIndexedMaterialOnly: A === "course_material_only"
                });
              },
              children: [
                /* @__PURE__ */ d.jsx("option", { value: "general_knowledge_allowed", children: "General model knowledge allowed" }),
                /* @__PURE__ */ d.jsx("option", { value: "course_material_preferred", children: "Course material preferred" }),
                /* @__PURE__ */ d.jsx("option", { value: "course_material_only", children: "Course material only" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-check", children: [
          /* @__PURE__ */ d.jsx(
            "input",
            {
              type: "checkbox",
              checked: n.includeExplanations,
              onChange: (G) => B({ includeExplanations: G.target.checked })
            }
          ),
          /* @__PURE__ */ d.jsx("span", { children: "Include answer explanations" })
        ] }),
        /* @__PURE__ */ d.jsxs("div", { className: "aiw-field-row", children: [
          /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ d.jsxs("span", { children: [
              "Time limit ",
              /* @__PURE__ */ d.jsx("small", { children: "minutes" })
            ] }),
            /* @__PURE__ */ d.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 600,
                value: n.timeLimitMinutes || "",
                onChange: (G) => B({
                  timeLimitMinutes: G.target.value ? Number(G.target.value) : null
                })
              }
            )
          ] }),
          /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
            /* @__PURE__ */ d.jsxs("span", { children: [
              "Tags ",
              /* @__PURE__ */ d.jsx("small", { children: "comma separated" })
            ] }),
            /* @__PURE__ */ d.jsx(
              "input",
              {
                value: n.tags.join(", "),
                onChange: (G) => B({
                  tags: G.target.value.split(",").map((A) => A.trim()).filter(Boolean)
                })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Additional instructions" }),
          /* @__PURE__ */ d.jsx(
            "textarea",
            {
              rows: 3,
              maxLength: 4e3,
              value: n.specialInstructions,
              onChange: (G) => B({ specialInstructions: G.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Scoring preferences" }),
          /* @__PURE__ */ d.jsx(
            "textarea",
            {
              rows: 2,
              maxLength: 1e3,
              value: n.scoringPreferences,
              onChange: (G) => B({ scoringPreferences: G.target.value }),
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
function Sp(n) {
  return {
    ...n,
    questions: n.questions.map((i) => ({
      ...i,
      options: [...i.options],
      sourceReferences: i.sourceReferences.map((s) => ({ ...s }))
    }))
  };
}
function pw() {
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
function vw({
  question: n,
  index: i,
  total: s,
  selected: r,
  disabled: c,
  onSelect: m,
  onChange: h,
  onMove: p,
  onDelete: y,
  onDuplicate: g,
  onRegenerate: _,
  onOpenSource: x
}) {
  const w = J.useId(), C = n.type === "multiple_choice", D = n.type === "true_false", B = ($, ie) => {
    h({ ...n, [$]: ie });
  }, V = ($) => {
    if ($ === "multiple_choice") {
      const ie = n.options.length >= 3 ? n.options : ["Option A", "Option B", "Option C"];
      h({ ...n, type: $, options: ie, correctAnswer: ie.includes(n.correctAnswer) ? n.correctAnswer : ie[0] });
    } else h($ === "true_false" ? { ...n, type: $, options: ["true", "false"], correctAnswer: ["true", "false"].includes(n.correctAnswer) ? n.correctAnswer : "true" } : { ...n, type: $, options: [] });
  };
  return /* @__PURE__ */ d.jsxs("article", { className: `aiw-question ${r ? "is-selected" : ""}`, "aria-labelledby": `${w}-title`, children: [
    /* @__PURE__ */ d.jsxs("header", { className: "aiw-question__header", children: [
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-question__select", children: [
        /* @__PURE__ */ d.jsx(
          "input",
          {
            type: "checkbox",
            checked: r,
            onChange: ($) => m($.target.checked),
            disabled: c
          }
        ),
        /* @__PURE__ */ d.jsx("span", { className: "aiw-question__number", "aria-hidden": "true", children: i + 1 }),
        /* @__PURE__ */ d.jsxs("span", { className: "aiw-sr-only", children: [
          "Select question ",
          i + 1
        ] })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsxs("h4", { id: `${w}-title`, children: [
          "Question ",
          i + 1
        ] }),
        /* @__PURE__ */ d.jsx("span", { className: `aiw-validation aiw-validation--${n.validationStatus}`, children: n.validationStatus.replaceAll("_", " ") })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-question__order", "aria-label": `Reorder question ${i + 1}`, children: [
        /* @__PURE__ */ d.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            onClick: () => p(-1),
            disabled: c || i === 0,
            "aria-label": `Move question ${i + 1} up`,
            children: "↑"
          }
        ),
        /* @__PURE__ */ d.jsx(
          "button",
          {
            className: "aiw-icon-button aiw-icon-button--small",
            type: "button",
            onClick: () => p(1),
            disabled: c || i === s - 1,
            "aria-label": `Move question ${i + 1} down`,
            children: "↓"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-question__body", children: [
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-field-row aiw-field-row--three", children: [
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Question type" }),
          /* @__PURE__ */ d.jsx("select", { value: n.type, onChange: ($) => V($.target.value), disabled: c, children: mw.map(([$, ie]) => /* @__PURE__ */ d.jsx("option", { value: $, children: ie }, $)) })
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Difficulty" }),
          /* @__PURE__ */ d.jsxs("select", { value: n.difficulty, onChange: ($) => B("difficulty", $.target.value), disabled: c, children: [
            /* @__PURE__ */ d.jsx("option", { value: "easy", children: "Easy" }),
            /* @__PURE__ */ d.jsx("option", { value: "medium", children: "Medium" }),
            /* @__PURE__ */ d.jsx("option", { value: "hard", children: "Hard" })
          ] })
        ] }),
        /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
          /* @__PURE__ */ d.jsx("span", { children: "Points" }),
          /* @__PURE__ */ d.jsx(
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
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Question prompt" }),
        /* @__PURE__ */ d.jsx(
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
      C ? /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsxs("span", { children: [
          "Answer options ",
          /* @__PURE__ */ d.jsx("small", { children: "one per line" })
        ] }),
        /* @__PURE__ */ d.jsx(
          "textarea",
          {
            rows: 4,
            value: n.options.join(`
`),
            onChange: ($) => {
              const ie = $.target.value.split(`
`), Y = ie.includes(n.correctAnswer) ? n.correctAnswer : ie.find(Boolean) || "";
              h({ ...n, options: ie, correctAnswer: Y });
            },
            disabled: c
          }
        )
      ] }) : null,
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsx("span", { children: n.type === "essay" ? "Expected answer or rubric" : "Correct answer" }),
        C || D ? /* @__PURE__ */ d.jsx("select", { value: n.correctAnswer, onChange: ($) => B("correctAnswer", $.target.value), disabled: c, children: (D ? ["true", "false"] : n.options.filter(Boolean)).map(($, ie) => /* @__PURE__ */ d.jsx("option", { value: $, children: $ }, `${ie}-${$}`)) }) : /* @__PURE__ */ d.jsx(
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
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Explanation" }),
        /* @__PURE__ */ d.jsx(
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
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Learning objective" }),
        /* @__PURE__ */ d.jsx(
          "input",
          {
            maxLength: 500,
            value: n.learningObjective,
            onChange: ($) => B("learningObjective", $.target.value),
            disabled: c
          }
        )
      ] }),
      n.sourceReferences.length ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-question__sources", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Sources" }),
        /* @__PURE__ */ d.jsx("div", { children: n.sourceReferences.map(($) => /* @__PURE__ */ d.jsx(
          "button",
          {
            type: "button",
            onClick: () => x($),
            disabled: c && !$.excerpt && !($.materialId && $.chunkId),
            children: $.label
          },
          $.id || $.label
        )) })
      ] }) : null
    ] }),
    /* @__PURE__ */ d.jsxs("footer", { className: "aiw-question__actions", children: [
      /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: _, disabled: c, children: "Regenerate" }),
      /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet aiw-button--small", type: "button", onClick: g, disabled: c, children: "Duplicate" }),
      /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--danger aiw-button--small", type: "button", onClick: y, disabled: c, children: "Delete" })
    ] })
  ] });
}
function yw({
  draft: n,
  draftSaved: i,
  saving: s,
  regenerating: r,
  onSave: c,
  onRegenerate: m,
  onOpenSource: h
}) {
  const [p, y] = J.useState(() => Sp(n)), [g, _] = J.useState(() => JSON.stringify(n)), [x, w] = J.useState(i), [C, D] = J.useState(/* @__PURE__ */ new Set()), B = s || r;
  J.useEffect(() => {
    y(Sp(n)), _(JSON.stringify(n)), w(i), D(/* @__PURE__ */ new Set());
  }, [n, i]);
  const V = J.useMemo(() => JSON.stringify(p) !== g, [p, g]), $ = (A, k) => {
    y((ne) => ({
      ...ne,
      questions: ne.questions.map((he, ue) => ue === A ? k : he)
    }));
  }, ie = (A, k) => {
    const ne = A + k;
    ne < 0 || ne >= p.questions.length || (y((he) => {
      const ue = [...he.questions];
      return [ue[A], ue[ne]] = [ue[ne], ue[A]], { ...he, questions: ue };
    }), D(/* @__PURE__ */ new Set()));
  }, Y = (A) => {
    window.confirm(`Delete question ${A + 1} from this draft?`) && (y((k) => ({
      ...k,
      questions: k.questions.filter((ne, he) => he !== A)
    })), D(/* @__PURE__ */ new Set()));
  }, ee = (A) => {
    y((k) => {
      const ne = k.questions[A], he = {
        ...ne,
        id: void 0,
        text: `${ne.text} (copy)`,
        options: [...ne.options],
        sourceReferences: ne.sourceReferences.map((Oe) => ({ ...Oe }))
      }, ue = [...k.questions];
      return ue.splice(A + 1, 0, he), { ...k, questions: ue };
    }), D(/* @__PURE__ */ new Set());
  }, te = async (A = !0) => {
    const k = await c(p, A);
    return k && (_(JSON.stringify(p)), w(!0)), k;
  }, G = async (A) => {
    A.length && (V && !await te(!1) || await m(A));
  };
  return /* @__PURE__ */ d.jsxs("section", { className: "aiw-review", "aria-labelledby": "aiw-review-heading", children: [
    /* @__PURE__ */ d.jsxs("header", { className: "aiw-review__header", children: [
      /* @__PURE__ */ d.jsxs("div", { children: [
        /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "Review required" }),
        /* @__PURE__ */ d.jsx("h3", { id: "aiw-review-heading", children: "Edit quiz draft" }),
        /* @__PURE__ */ d.jsx("p", { children: "Review every question before saving. The quiz remains private." })
      ] }),
      /* @__PURE__ */ d.jsx("span", { className: `aiw-save-state ${V ? "is-unsaved" : ""}`, role: "status", children: V ? "Unsaved changes" : "All changes saved" })
    ] }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-review__meta", children: [
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Quiz title" }),
        /* @__PURE__ */ d.jsx(
          "input",
          {
            value: p.title,
            maxLength: 160,
            onChange: (A) => y((k) => ({ ...k, title: A.target.value })),
            disabled: B
          }
        )
      ] }),
      /* @__PURE__ */ d.jsxs("label", { className: "aiw-field", children: [
        /* @__PURE__ */ d.jsx("span", { children: "Description" }),
        /* @__PURE__ */ d.jsx(
          "textarea",
          {
            rows: 3,
            value: p.description,
            maxLength: 2e3,
            onChange: (A) => y((k) => ({ ...k, description: A.target.value })),
            disabled: B
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-review__toolbar", children: [
      /* @__PURE__ */ d.jsxs("label", { children: [
        /* @__PURE__ */ d.jsx(
          "input",
          {
            type: "checkbox",
            checked: p.questions.length > 0 && C.size === p.questions.length,
            onChange: (A) => D(A.target.checked ? new Set(p.questions.map((k, ne) => ne)) : /* @__PURE__ */ new Set()),
            disabled: B || !p.questions.length
          }
        ),
        "Select all"
      ] }),
      /* @__PURE__ */ d.jsxs("span", { children: [
        p.questions.length,
        " questions · ",
        p.questions.reduce((A, k) => A + Number(k.points || 0), 0),
        " points"
      ] }),
      /* @__PURE__ */ d.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet aiw-button--small",
          type: "button",
          disabled: !C.size || B,
          onClick: () => G([...C].sort((A, k) => A - k)),
          children: r ? "Regenerating…" : `Regenerate selected (${C.size})`
        }
      )
    ] }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-question-list", children: [
      p.questions.map((A, k) => /* @__PURE__ */ d.jsx(
        vw,
        {
          question: A,
          index: k,
          total: p.questions.length,
          selected: C.has(k),
          disabled: B,
          onSelect: (ne) => D((he) => {
            const ue = new Set(he);
            return ne ? ue.add(k) : ue.delete(k), ue;
          }),
          onChange: (ne) => $(k, ne),
          onMove: (ne) => ie(k, ne),
          onDelete: () => Y(k),
          onDuplicate: () => ee(k),
          onRegenerate: () => G([k]),
          onOpenSource: h
        },
        A.id || `${k}-${A.text.slice(0, 24)}`
      )),
      p.questions.length ? null : /* @__PURE__ */ d.jsxs("div", { className: "aiw-mini-empty", children: [
        /* @__PURE__ */ d.jsx("strong", { children: "This draft has no questions." }),
        /* @__PURE__ */ d.jsx("p", { children: "Add a manual question or ask the assistant to revise the quiz." })
      ] })
    ] }),
    /* @__PURE__ */ d.jsxs("footer", { className: "aiw-review__footer", children: [
      /* @__PURE__ */ d.jsx(
        "button",
        {
          className: "aiw-button aiw-button--quiet",
          type: "button",
          disabled: B || p.questions.length >= 20,
          onClick: () => y((A) => ({ ...A, questions: [...A.questions, pw()] })),
          children: "＋ Add manual question"
        }
      ),
      /* @__PURE__ */ d.jsx(
        "button",
        {
          className: "aiw-button aiw-button--primary",
          type: "button",
          onClick: () => te(!0),
          disabled: !V && x || B || !p.title.trim() || !p.questions.length,
          children: s ? "Saving…" : "Save as draft"
        }
      )
    ] })
  ] });
}
function gw({ client: n, courseId: i, source: s, onClose: r }) {
  const c = !!(s.materialId && s.chunkId), m = An({
    queryKey: ["ai", "source", i, s.materialId, s.chunkId],
    queryFn: () => n.getMaterialChunk(i, s.materialId, s.chunkId),
    enabled: c
  });
  return /* @__PURE__ */ d.jsxs(
    yu,
    {
      title: s.label || "Course material source",
      description: "Use this excerpt to verify the generated question against the selected course material.",
      onClose: r,
      size: "wide",
      children: [
        m.isLoading ? /* @__PURE__ */ d.jsx("p", { role: "status", children: "Loading source excerpt…" }) : null,
        m.isError ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-error-state", role: "alert", children: [
          /* @__PURE__ */ d.jsxs("div", { children: [
            /* @__PURE__ */ d.jsx("strong", { children: "Source unavailable" }),
            /* @__PURE__ */ d.jsx("p", { children: "The excerpt could not be loaded." })
          ] }),
          /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => m.refetch(), children: "Retry" })
        ] }) : null,
        /* @__PURE__ */ d.jsxs("article", { className: "aiw-source-excerpt", children: [
          /* @__PURE__ */ d.jsx("h3", { children: m.data?.label || s.label }),
          /* @__PURE__ */ d.jsx("pre", { children: m.data?.content || s.excerpt || "No excerpt is available for this source reference." })
        ] }),
        /* @__PURE__ */ d.jsx("div", { className: "aiw-dialog-actions", children: /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: r, children: "Done" }) })
      ]
    }
  );
}
const bw = 1, vv = "The running LMS server has not loaded the conversational AI routes. Restart the LMS server, then check again.";
function yv(n) {
  if (!(n instanceof Error)) return !1;
  const i = n;
  return i.status === 404 && /api route not found/i.test(i.message);
}
function Tn(n, i) {
  return yv(n) ? vv : n instanceof Error ? n.message : i;
}
class _w extends J.Component {
  state = { error: null };
  static getDerivedStateFromError(i) {
    return { error: i };
  }
  componentDidCatch(i) {
    const s = typeof i?.name == "string" && i.name ? i.name.slice(0, 80) : "RenderError";
    console.error("AI Assistant frontend failed safely.", { name: s });
  }
  render() {
    return this.state.error ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-fatal", role: "alert", children: [
      /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "AI Assistant unavailable" }),
      /* @__PURE__ */ d.jsx("h1", { children: "The conversational workspace could not start." }),
      /* @__PURE__ */ d.jsx("p", { children: "Your saved conversations and drafts were not changed." }),
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-actions", children: [
        /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => location.reload(), children: "Reload page" }),
        this.props.onFallback ? /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--primary", type: "button", onClick: this.props.onFallback, children: "Open legacy assistant" }) : null
      ] })
    ] }) : this.props.children;
  }
}
function Sw(n, i) {
  return {
    ...n,
    ...i,
    questionTypeDistribution: i.questionTypeDistribution ? { ...n.questionTypeDistribution, ...i.questionTypeDistribution } : n.questionTypeDistribution
  };
}
function zw({
  checking: n,
  onCheckAgain: i,
  onFallback: s
}) {
  return /* @__PURE__ */ d.jsxs("main", { className: "aiw-compatibility", role: "alert", children: [
    /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: "Server update required" }),
    /* @__PURE__ */ d.jsx("h1", { children: "The AI workspace and the running LMS server are out of sync." }),
    /* @__PURE__ */ d.jsx("p", { children: vv }),
    /* @__PURE__ */ d.jsx("p", { children: "Your existing LMS, conversations, and drafts have not been changed." }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-inline-actions", children: [
      /* @__PURE__ */ d.jsx(
        "button",
        {
          className: "aiw-button aiw-button--primary",
          type: "button",
          disabled: n,
          onClick: i,
          children: n ? "Checking…" : "Check again"
        }
      ),
      s ? /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: s, children: "Open existing assistant" }) : null
    ] })
  ] });
}
function ww({
  client: n,
  user: i,
  onToast: s,
  onNavigate: r,
  onFallback: c
}) {
  const m = Ni(), [h, p] = J.useState(null), [y, g] = J.useState(!1), [_, x] = J.useState("chat"), [w, C] = J.useState(!1), [D, B] = J.useState(!1), [V, $] = J.useState(null), [ie, Y] = J.useState(null), [ee, te] = J.useState(null), G = J.useRef(null), A = J.useRef(null), k = J.useCallback((H, ge = "info") => {
    s?.(H, ge);
  }, [s]), ne = An({
    queryKey: ["ai", "conversations"],
    queryFn: n.listConversations
  }), he = An({
    queryKey: ["ai", "courses"],
    queryFn: n.listCourses
  }), ue = An({
    queryKey: ["ai", "settings"],
    queryFn: n.getSettings
  }), Oe = An({
    queryKey: ["ai", "conversation", h],
    queryFn: () => n.getConversation(h),
    enabled: !!h
  });
  J.useEffect(() => {
    h || y || !ne.data?.length || p(ne.data[0].id);
  }, [ne.data, y, h]), J.useEffect(() => {
    Y(null), te(null);
  }, [h]);
  const je = Oe.data || null, Xe = je?.plan || ua, nt = he.data || [], K = An({
    queryKey: ["ai", "materials", Xe.courseId],
    queryFn: () => n.listMaterials(Xe.courseId),
    enabled: !!Xe.courseId
  }).data || [], se = je?.status || "gathering_requirements", ye = J.useCallback(async () => {
    const H = A.current;
    if (H) {
      A.current = null, G.current && window.clearTimeout(G.current), G.current = null;
      try {
        const ge = await n.updatePlan(H.id, H.patch);
        ge.conversation ? m.setQueryData(["ai", "conversation", H.id], ge.conversation) : await m.invalidateQueries({ queryKey: ["ai", "conversation", H.id] }), await m.invalidateQueries({ queryKey: ["ai", "conversations"] });
      } catch (ge) {
        await m.invalidateQueries({ queryKey: ["ai", "conversation", H.id] }), k(Tn(ge, "Quiz Plan could not be saved."), "error");
      }
    }
  }, [n, m, k]);
  J.useEffect(() => () => {
    G.current && window.clearTimeout(G.current), A.current && ye();
  }, [ye, h]);
  const Ee = J.useCallback((H) => {
    if (!h) {
      k("Start a conversation before editing the Quiz Plan.", "info");
      return;
    }
    m.setQueryData(
      ["ai", "conversation", h],
      (mt) => mt && {
        ...mt,
        plan: Sw(mt.plan, H),
        suggestedReplies: []
      }
    );
    const ge = A.current;
    A.current = {
      id: h,
      patch: ge?.id === h ? { ...ge.patch, ...H } : H
    }, G.current && window.clearTimeout(G.current), G.current = window.setTimeout(() => void ye(), 450);
  }, [ye, m, h, k]), z = qt({
    mutationFn: async ({
      courseId: H,
      conversationId: ge
    }) => ge ? {
      mode: "updated",
      conversationId: ge,
      result: await n.updatePlan(ge, {
        courseId: H,
        materialIds: []
      })
    } : {
      mode: "created",
      conversation: await n.createConversation({ courseId: H })
    },
    onSuccess: async (H) => {
      H.mode === "created" ? (m.setQueryData(
        ["ai", "conversation", H.conversation.id],
        H.conversation
      ), p(H.conversation.id), g(!1), Y(null), te(null)) : H.result.conversation ? m.setQueryData(
        ["ai", "conversation", H.conversationId],
        H.result.conversation
      ) : await m.invalidateQueries({
        queryKey: ["ai", "conversation", H.conversationId]
      }), await m.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
    onError: (H) => k(Tn(H, "The course could not be selected."), "error")
  }), Z = qt({
    mutationFn: (H) => n.deleteConversation(H),
    onSuccess: async (H, ge) => {
      const Rn = (m.getQueryData(["ai", "conversations"]) || []).filter((zu) => zu.id !== ge);
      m.setQueryData(["ai", "conversations"], Rn), m.removeQueries({ queryKey: ["ai", "conversation", ge], exact: !0 }), m.removeQueries({ queryKey: ["ai", "generation", ge], exact: !0 }), h === ge && (p(Rn[0]?.id || null), g(!Rn.length), Y(null), te(null)), await m.invalidateQueries({ queryKey: ["ai", "conversations"] }), k("Conversation deleted.", "success");
    },
    onError: (H) => k(Tn(H, "The conversation could not be deleted."), "error")
  }), X = qt({
    mutationFn: async (H) => {
      if (!h || !je)
        throw new Error("Choose a course before starting the conversation.");
      const ge = je.draft ? await n.reviseDraft(h, H) : await n.sendMessage(h, H);
      return { conversationId: h, currentDetail: je, result: ge };
    },
    onSuccess: async ({ conversationId: H, currentDetail: ge, result: mt }) => {
      p(H), x("chat"), mt.conversation ? m.setQueryData(["ai", "conversation", H], mt.conversation) : ge && h !== H && m.setQueryData(["ai", "conversation", H], ge), mt.revision && (Y(mt.revision), te(null)), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", H] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: (H) => k(Tn(H, "The message could not be sent."), "error")
  }), F = qt({
    mutationFn: () => n.generateDraft(h, Iz()),
    onSuccess: async (H) => {
      H.conversation && h && (m.setQueryData(["ai", "conversation", h], H.conversation), m.setQueryData(
        ["ai", "generation", h],
        H.conversation.generation || null
      )), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    },
    onError: (H) => k(Tn(H, "Draft generation failed."), "error")
  }), re = je?.status === "generating" || je?.generation?.status === "generating", fe = An({
    queryKey: ["ai", "generation", h],
    queryFn: () => n.getGenerationStatus(h),
    enabled: !!(h && (re || F.isPending)),
    refetchInterval: (H) => ["queued", "generating", "cancel_requested"].includes(H.state.data?.status || "") ? 1400 : !1
  }), me = re || F.isPending ? fe.data || je?.generation || {
    status: "generating",
    stage: "validating_quiz_plan",
    message: "",
    canCancel: !1,
    startedAt: "",
    updatedAt: ""
  } : je?.generation || null, at = J.useRef("");
  J.useEffect(() => {
    const H = fe.data?.status;
    !H || H === at.current || (at.current = H, H !== "generating" && h && (Promise.all([
      m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
      m.invalidateQueries({ queryKey: ["ai", "conversations"] })
    ]), H === "completed" && k("Quiz draft is ready for review.", "success")));
  }, [fe.data?.status, m, h, k]);
  const Ze = qt({
    mutationFn: () => n.cancelGeneration(h),
    onSuccess: async () => {
      await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        m.invalidateQueries({ queryKey: ["ai", "generation", h] })
      ]), k("Generation stopped.", "info");
    },
    onError: (H) => k(Tn(H, "Generation could not be stopped."), "error")
  }), Dn = qt({
    mutationFn: (H) => n.applyRevision(h, H.id),
    onSuccess: async (H) => {
      Y(null), te(null), H.conversation && h && m.setQueryData(["ai", "conversation", h], H.conversation), await m.invalidateQueries({ queryKey: ["ai", "conversation", h] }), k("Revision applied to the draft.", "success");
    },
    onError: (H) => k(Tn(H, "Revision could not be applied."), "error")
  }), fa = qt({
    mutationFn: (H) => n.saveDraft(h, H),
    onSuccess: async (H) => {
      H.conversation && h && m.setQueryData(["ai", "conversation", h], H.conversation), await Promise.all([
        m.invalidateQueries({ queryKey: ["ai", "conversation", h] }),
        m.invalidateQueries({ queryKey: ["ai", "conversations"] })
      ]);
    }
  }), Di = async (H, ge = !0) => {
    try {
      return await fa.mutateAsync(H), ge && k("Draft changes saved.", "success"), !0;
    } catch (mt) {
      return k(Tn(mt, "Draft could not be saved."), "error"), !1;
    }
  }, Ri = qt({
    mutationFn: ({ indexes: H, instruction: ge }) => n.regenerateQuestions(h, H, ge),
    onSuccess: async (H) => {
      H.conversation && h && m.setQueryData(["ai", "conversation", h], H.conversation), await m.invalidateQueries({ queryKey: ["ai", "conversation", h] }), k("Selected questions regenerated. Review the changes before saving.", "success");
    },
    onError: (H) => k(Tn(H, "Questions could not be regenerated."), "error")
  }), nn = ie || je?.pendingRevision || null, Za = nn?.id === ee ? null : nn, It = Xe.courseId, bu = !!(ue.data && ue.data.conversationApiVersion < bw || yv(ne.error)), Qa = (H) => {
    const ge = h;
    ye().then(() => {
      z.mutate({ courseId: H, conversationId: ge });
    });
  }, qi = () => {
    ye(), p(null), g(!0), Y(null), te(null), x("chat"), window.setTimeout(() => document.getElementById("aiw-start-course")?.focus(), 0);
  }, da = () => {
    r ? r("#/courses") : location.hash = "#/courses";
  }, ka = () => {
    x("chat"), window.setTimeout(() => document.getElementById("aiw-start-course")?.focus(), 0);
  }, _u = () => {
    if (!It) {
      ka(), k("Choose a course before adding material.", "info");
      return;
    }
    B(!0);
  }, Su = () => {
    if (!It) {
      ka(), k("Choose a course before uploading material.", "info");
      return;
    }
    document.getElementById("aiw-material-upload")?.click();
  }, ht = je?.draft ? /* @__PURE__ */ d.jsx(
    yw,
    {
      draft: je.draft,
      draftSaved: je.status === "draft_saved",
      saving: fa.isPending,
      regenerating: Ri.isPending,
      onSave: Di,
      onRegenerate: async (H, ge) => {
        await Ri.mutateAsync({ indexes: H, instruction: ge });
      },
      onOpenSource: $
    }
  ) : null;
  return bu ? /* @__PURE__ */ d.jsx(
    zw,
    {
      checking: ue.isFetching || ne.isFetching,
      onCheckAgain: () => {
        Promise.all([ue.refetch(), ne.refetch()]);
      },
      onFallback: c
    }
  ) : /* @__PURE__ */ d.jsxs("div", { className: "aiw-app", children: [
    /* @__PURE__ */ d.jsxs("header", { className: "aiw-topbar", children: [
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-topbar__title", children: [
        /* @__PURE__ */ d.jsx("div", { className: "aiw-product-mark", "aria-hidden": "true", children: "AI" }),
        /* @__PURE__ */ d.jsxs("div", { children: [
          /* @__PURE__ */ d.jsx("span", { className: "aiw-eyebrow", children: i.role === "admin" ? "Administrator workspace" : "Teacher workspace" }),
          /* @__PURE__ */ d.jsx("h1", { children: "AI Quiz Assistant" }),
          /* @__PURE__ */ d.jsx("p", { children: "Plan together, generate a private draft, then review every question." })
        ] })
      ] }),
      /* @__PURE__ */ d.jsxs("div", { className: "aiw-topbar__actions", children: [
        /* @__PURE__ */ d.jsxs("span", { className: `aiw-config-status ${ue.data?.configured ? "is-ready" : ""}`, children: [
          /* @__PURE__ */ d.jsx("i", { "aria-hidden": "true" }),
          ue.data?.configured ? "Azure configured" : "Setup required"
        ] }),
        /* @__PURE__ */ d.jsx("button", { className: "aiw-button aiw-button--quiet", type: "button", onClick: () => C(!0), children: "Azure settings" })
      ] })
    ] }),
    !ue.data?.enabled && ue.data ? /* @__PURE__ */ d.jsxs("div", { className: "aiw-page-alert", role: "alert", children: [
      /* @__PURE__ */ d.jsx("strong", { children: "AI generation is disabled." }),
      /* @__PURE__ */ d.jsx("span", { children: ue.data.message || "Contact an administrator to enable the assistant." })
    ] }) : null,
    /* @__PURE__ */ d.jsx("div", { className: "aiw-mobile-tabs", role: "tablist", "aria-label": "AI Assistant workspace panels", children: [
      ["conversations", "Conversations"],
      ["chat", je?.draft ? "Chat & review" : "Chat"],
      ["plan", "Quiz Plan"]
    ].map(([H, ge]) => /* @__PURE__ */ d.jsx(
      "button",
      {
        id: `aiw-${H}-tab`,
        type: "button",
        role: "tab",
        "aria-selected": _ === H,
        "aria-controls": `aiw-${H}-panel`,
        tabIndex: _ === H ? 0 : -1,
        onClick: () => x(H),
        children: ge
      },
      H
    )) }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-layout", children: [
      /* @__PURE__ */ d.jsx(
        "div",
        {
          id: "aiw-conversations-panel",
          className: `aiw-region aiw-region--left ${_ === "conversations" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-conversations-tab",
          children: /* @__PURE__ */ d.jsx(
            cw,
            {
              conversations: ne.data || [],
              selectedId: h,
              isLoading: ne.isLoading,
              isError: ne.isError,
              isCreating: z.isPending,
              deletingId: Z.isPending ? Z.variables : null,
              onNew: qi,
              onRetry: () => {
                ne.refetch();
              },
              onSelect: (H) => {
                ye(), p(H), g(!1), Y(null), te(null), x("chat");
              },
              onDelete: (H) => {
                A.current?.id === H && (A.current = null, G.current && window.clearTimeout(G.current), G.current = null), Z.mutate(H);
              },
              materials: /* @__PURE__ */ d.jsx(
                fw,
                {
                  client: n,
                  conversationId: h,
                  plan: Xe,
                  courseId: It,
                  courses: nt,
                  coursesLoading: he.isLoading,
                  coursesError: he.isError,
                  courseSelectionPending: z.isPending,
                  onPlanPatch: Ee,
                  onCourseSelect: Qa,
                  onRetryCourses: () => {
                    he.refetch();
                  },
                  onOpenCourses: da,
                  onToast: k
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ d.jsx(
        "div",
        {
          id: "aiw-chat-panel",
          className: `aiw-region aiw-region--center ${_ === "chat" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-chat-tab",
          children: /* @__PURE__ */ d.jsx(
            ow,
            {
              detail: je,
              plan: Xe,
              courses: nt,
              materials: K,
              coursesLoading: he.isLoading,
              coursesError: he.isError,
              courseSelectionPending: z.isPending,
              loading: Oe.isLoading,
              error: Oe.isError,
              isSending: X.isPending,
              generation: me,
              cancelling: Ze.isPending,
              revision: Za,
              applyingRevision: Dn.isPending,
              onRetryLoad: () => Oe.refetch(),
              onRetryCourses: () => {
                he.refetch();
              },
              onOpenCourses: da,
              onCourseSelect: Qa,
              onSend: (H) => X.mutate(H),
              onRetryMessage: (H) => X.mutate(H.content),
              onAttach: Su,
              onPasteMaterial: _u,
              onCancelGeneration: () => Ze.mutate(),
              onApplyRevision: (H) => Dn.mutate(H),
              onDismissRevision: () => {
                te(Za?.id || null), Y(null);
              },
              review: ht
            }
          )
        }
      ),
      /* @__PURE__ */ d.jsx(
        "div",
        {
          id: "aiw-plan-panel",
          className: `aiw-region aiw-region--right ${_ === "plan" ? "is-mobile-active" : ""}`,
          role: "tabpanel",
          "aria-labelledby": "aiw-plan-tab",
          children: /* @__PURE__ */ d.jsx(
            hw,
            {
              plan: Xe,
              courses: nt,
              coursesLoading: he.isLoading,
              coursesError: he.isError,
              courseSelectionPending: z.isPending,
              courseLocked: !!je?.draft,
              conversationId: h,
              conversationStatus: se,
              generation: me,
              generating: !!(me && ["queued", "generating", "cancel_requested"].includes(me.status)),
              generationAvailable: !!(ue.data?.enabled && ue.data?.configured),
              generationConfigured: !!ue.data?.configured,
              onCourseSelect: Qa,
              onRetryCourses: () => {
                he.refetch();
              },
              onOpenCourses: da,
              onPatch: Ee,
              onGenerate: () => F.mutate()
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ d.jsxs("div", { className: "aiw-sr-only", "aria-live": "polite", "aria-atomic": "true", children: [
      X.isPending ? "The assistant is responding." : "",
      me?.status === "generating" ? `Generation stage: ${me.stage}.` : ""
    ] }),
    w ? /* @__PURE__ */ d.jsx(Yz, { client: n, onClose: () => C(!1), onToast: k }) : null,
    D && It ? /* @__PURE__ */ d.jsx(
      dw,
      {
        client: n,
        courseId: It,
        conversationId: h,
        onClose: () => B(!1),
        onToast: k
      }
    ) : null,
    V && It ? /* @__PURE__ */ d.jsx(
      gw,
      {
        client: n,
        courseId: It,
        source: V,
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
  return /* @__PURE__ */ d.jsx(_w, { onFallback: c, children: /* @__PURE__ */ d.jsx(gb, { client: m, children: /* @__PURE__ */ d.jsx(
    ww,
    {
      client: h,
      user: i,
      onToast: s,
      onNavigate: r,
      onFallback: c
    }
  ) }) });
}
function xw(n, i) {
  const s = n.closest("#app");
  s?.classList.add("ai-assistant-page-host"), n.classList.add("ai-assistant-root");
  let r = Yg.createRoot(n);
  return r.render(
    /* @__PURE__ */ d.jsx(
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
  xw as mountAiAssistant
};
//# sourceMappingURL=ai-assistant.js.map
