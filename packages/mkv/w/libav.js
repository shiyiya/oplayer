const Na = "osra-message", Wa = ({
  target: c,
  resolvers: u,
  filter: _,
  map: h,
  key: I = Na
}) => {
  const i = (k) => {
    if (!k.data || typeof k.data != "object" || k.data?.source !== I || _ && !_(k))
      return;
    const { type: $, data: E, port: S } = k.data, F = u[$];
    if (!F)
      throw new Error(`Osra received a message of type "${String($)}" but no resolver was found for type.`);
    h ? F(...h(E, { event: k, type: $, port: S })) : F(E, { event: k, type: $, port: S });
  };
  return c.addEventListener("message", i), {
    listener: i,
    resolvers: u
  };
}, qt = (c) => !!(globalThis.SharedArrayBuffer && c instanceof globalThis.SharedArrayBuffer), Kt = (c) => globalThis.ArrayBuffer && c instanceof globalThis.ArrayBuffer || globalThis.MessagePort && c instanceof globalThis.MessagePort || globalThis.ReadableStream && c instanceof globalThis.ReadableStream || globalThis.WritableStream && c instanceof globalThis.WritableStream || globalThis.TransformStream && c instanceof globalThis.TransformStream ? !0 : !!(globalThis.ImageBitmap && c instanceof globalThis.ImageBitmap), Zt = (c) => {
  const u = [], _ = (h) => qt(h) ? void 0 : Kt(h) ? u.push(h) : Array.isArray(h) ? h.map(_) : h && typeof h == "object" ? Object.values(h).map(_) : void 0;
  return _(c), u;
}, Gt = "__proxyFunctionPort__", Ha = (c) => {
  const { port1: u, port2: _ } = new MessageChannel();
  return u.addEventListener("message", async (h) => {
    try {
      const I = await c(...h.data), i = xe(I), k = Zt(i);
      u.postMessage({ result: i }, { transfer: k });
    } catch (I) {
      u.postMessage({ error: I });
    }
  }), u.start(), _;
}, xe = (c) => qt(c) || Kt(c) ? c : typeof c == "function" ? { [Gt]: Ha(c) } : Array.isArray(c) ? c.map(xe) : c && typeof c == "object" ? Object.fromEntries(
  Object.entries(c).map(([u, _]) => [
    u,
    xe(_)
  ])
) : c, Ya = (c) => (...u) => new Promise((_, h) => {
  const I = xe(u), i = Zt(I), k = ($) => {
    $.data.error ? h($.data.error) : _(Xt($.data.result)), c.removeEventListener("message", k);
  };
  c.addEventListener("message", k), c.start(), c.postMessage(I, { transfer: i });
}), Xt = (c) => qt(c) || Kt(c) ? c : c && typeof c == "object" && c[Gt] ? Ya(c[Gt]) : Array.isArray(c) ? c.map(xe) : c && typeof c == "object" ? Object.fromEntries(
  Object.entries(c).map(([u, _]) => [
    u,
    Xt(_)
  ])
) : c, ja = (c) => async (u, _) => {
  const { port: h } = _, I = Xt(u);
  try {
    const i = await c(I, _), k = xe(i), $ = Zt(k);
    return h.postMessage({ result: k }, { transfer: $ }), h.close(), i;
  } catch (i) {
    throw h.postMessage({ error: i }), h.close(), i;
  }
};
var Qt = {}, za = {
  get exports() {
    return Qt;
  },
  set exports(c) {
    Qt = c;
  }
};
(function(c, u) {
  var _ = (() => {
    var h = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
    return function(I = {}) {
      var i = I, k, $;
      i.ready = new Promise((e, t) => {
        k = e, $ = t;
      }), ["_main", "__embind_initialize_bindings", "_fflush", "___set_stack_limits", "onRuntimeInitialized"].forEach((e) => {
        Object.getOwnPropertyDescriptor(i.ready, e) || Object.defineProperty(i.ready, e, {
          get: () => J("You are getting " + e + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
          set: () => J("You are setting " + e + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
        });
      });
      var E = Object.assign({}, i), S = "./this.program", F = (e, t) => {
        throw t;
      }, O = !0, Q = !1, z = !1, L = !1;
      if (i.ENVIRONMENT)
        throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
      var H = "";
      function p(e) {
        return i.locateFile ? i.locateFile(e, H) : H + e;
      }
      var N;
      if (typeof document < "u" && document.currentScript && (H = document.currentScript.src), h && (H = h), H.indexOf("blob:") !== 0 ? H = H.substr(0, H.replace(/[?#].*/, "").lastIndexOf("/") + 1) : H = "", !(typeof window == "object" || typeof importScripts == "function"))
        throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
      var W = i.print || console.log.bind(console), C = i.printErr || console.error.bind(console);
      Object.assign(i, E), E = null, Ea(), i.arguments && i.arguments, ve("arguments", "arguments_"), i.thisProgram && (S = i.thisProgram), ve("thisProgram", "thisProgram"), i.quit && (F = i.quit), ve("quit", "quit_"), g(typeof i.memoryInitializerPrefixURL > "u", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"), g(typeof i.pthreadMainPrefixURL > "u", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"), g(typeof i.cdInitializerPrefixURL > "u", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"), g(typeof i.filePackagePrefixURL > "u", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead"), g(typeof i.read > "u", "Module.read option was removed (modify read_ in JS)"), g(typeof i.readAsync > "u", "Module.readAsync option was removed (modify readAsync in JS)"), g(typeof i.readBinary > "u", "Module.readBinary option was removed (modify readBinary in JS)"), g(typeof i.setWindowTitle > "u", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)"), g(typeof i.TOTAL_MEMORY > "u", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"), ve("read", "read_"), ve("readAsync", "readAsync"), ve("readBinary", "readBinary"), ve("setWindowTitle", "setWindowTitle"), g(!Q, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable."), g(!z, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable."), g(!L, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");
      var oe;
      i.wasmBinary && (oe = i.wasmBinary), ve("wasmBinary", "wasmBinary");
      var de = i.noExitRuntime || !0;
      ve("noExitRuntime", "noExitRuntime"), typeof WebAssembly != "object" && J("no native wasm support detected");
      var Se, _e = !1, Ue;
      function g(e, t) {
        e || J("Assertion failed" + (t ? ": " + t : ""));
      }
      var se, te, Fe, rt, b, x, er, tr;
      function rr() {
        var e = Se.buffer;
        i.HEAP8 = se = new Int8Array(e), i.HEAP16 = Fe = new Int16Array(e), i.HEAP32 = b = new Int32Array(e), i.HEAPU8 = te = new Uint8Array(e), i.HEAPU16 = rt = new Uint16Array(e), i.HEAPU32 = x = new Uint32Array(e), i.HEAPF32 = er = new Float32Array(e), i.HEAPF64 = tr = new Float64Array(e);
      }
      g(!i.STACK_SIZE, "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"), g(
        typeof Int32Array < "u" && typeof Float64Array < "u" && Int32Array.prototype.subarray != null && Int32Array.prototype.set != null,
        "JS engine does not provide full typed array support"
      ), g(!i.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"), g(!i.INITIAL_MEMORY, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
      var nr;
      function Xr() {
        var e = Je();
        g((e & 3) == 0), e == 0 && (e += 4), x[e >> 2] = 34821223, M(34821223), x[e + 4 >> 2] = 2310721022, M(2310721022), x[0] = 1668509029, M(1668509029);
      }
      function Le() {
        if (!_e) {
          var e = Je();
          e == 0 && (e += 4);
          var t = x[e >> 2], r = x[e + 4 >> 2];
          (t != 34821223 || r != 2310721022) && J(`Stack overflow! Stack cookie has been overwritten at ${he(e)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${he(r)} ${he(t)}`), x[0] != 1668509029 && J("Runtime error: The application has corrupted its heap memory area (address zero)!");
        }
      }
      (function() {
        var e = new Int16Array(1), t = new Int8Array(e.buffer);
        if (e[0] = 25459, t[0] !== 115 || t[1] !== 99)
          throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
      })();
      var wt = [], ir = [], en = [], ar = [], Tt = !1, or = 0;
      function Ct() {
        return de || or > 0;
      }
      function tn() {
        if (i.preRun)
          for (typeof i.preRun == "function" && (i.preRun = [i.preRun]); i.preRun.length; )
            on(i.preRun.shift());
        it(wt);
      }
      function rn() {
        g(!Tt), Tt = !0, Le(), Pn(), it(ir);
      }
      function nn() {
        Le(), it(en);
      }
      function an() {
        if (Le(), i.postRun)
          for (typeof i.postRun == "function" && (i.postRun = [i.postRun]); i.postRun.length; )
            ln(i.postRun.shift());
        it(ar);
      }
      function on(e) {
        wt.unshift(e);
      }
      function sn(e) {
        ir.unshift(e);
      }
      function ln(e) {
        ar.unshift(e);
      }
      g(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), g(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), g(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), g(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
      var be = 0, Pe = null, Ne = null, We = {};
      function un(e) {
        be++, i.monitorRunDependencies && i.monitorRunDependencies(be), e ? (g(!We[e]), We[e] = 1, Pe === null && typeof setInterval < "u" && (Pe = setInterval(() => {
          if (_e) {
            clearInterval(Pe), Pe = null;
            return;
          }
          var t = !1;
          for (var r in We)
            t || (t = !0, C("still waiting on run dependencies:")), C("dependency: " + r);
          t && C("(end of list)");
        }, 1e4))) : C("warning: run dependency added without ID");
      }
      function cn(e) {
        if (be--, i.monitorRunDependencies && i.monitorRunDependencies(be), e ? (g(We[e]), delete We[e]) : C("warning: run dependency removed without ID"), be == 0 && (Pe !== null && (clearInterval(Pe), Pe = null), Ne)) {
          var t = Ne;
          Ne = null, t();
        }
      }
      function J(e) {
        i.onAbort && i.onAbort(e), e = "Aborted(" + e + ")", C(e), _e = !0, Ue = 1, e.indexOf("RuntimeError: unreachable") >= 0 && (e += '. "unreachable" may be due to ASYNCIFY_STACK_SIZE not being large enough (try increasing it)');
        var t = new WebAssembly.RuntimeError(e);
        throw $(t), t;
      }
      var le = {
        error: function() {
          J("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
        },
        init: function() {
          le.error();
        },
        createDataFile: function() {
          le.error();
        },
        createPreloadedFile: function() {
          le.error();
        },
        createLazyFile: function() {
          le.error();
        },
        open: function() {
          le.error();
        },
        mkdev: function() {
          le.error();
        },
        registerDevice: function() {
          le.error();
        },
        analyzePath: function() {
          le.error();
        },
        ErrnoError: function() {
          le.error();
        }
      };
      i.FS_createDataFile = le.createDataFile, i.FS_createPreloadedFile = le.createPreloadedFile;
      var fn = "data:application/octet-stream;base64,";
      function sr(e) {
        return e.startsWith(fn);
      }
      function dn(e) {
        return e.startsWith("file://");
      }
      function D(e, t) {
        return function() {
          var r = e, n = t;
          return t || (n = i.asm), g(Tt, "native function `" + r + "` called before runtime initialization"), n[e] || g(n[e], "exported native function `" + r + "` not found"), n[e].apply(null, arguments);
        };
      }
      var we;
      we = "libav.wasm", sr(we) || (we = p(we));
      function lr(e) {
        try {
          if (e == we && oe)
            return new Uint8Array(oe);
          throw "both async and sync fetching of the wasm failed";
        } catch (t) {
          J(t);
        }
      }
      function _n(e) {
        return !oe && O && typeof fetch == "function" ? fetch(e, { credentials: "same-origin" }).then((t) => {
          if (!t.ok)
            throw "failed to load wasm binary file at '" + e + "'";
          return t.arrayBuffer();
        }).catch(() => lr(e)) : Promise.resolve().then(() => lr(e));
      }
      function ur(e, t, r) {
        return _n(e).then((n) => WebAssembly.instantiate(n, t)).then((n) => n).then(r, (n) => {
          C("failed to asynchronously prepare wasm: " + n), dn(we) && C("warning: Loading from a file URI (" + we + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing"), J(n);
        });
      }
      function vn(e, t, r, n) {
        return !e && typeof WebAssembly.instantiateStreaming == "function" && !sr(t) && typeof fetch == "function" ? fetch(t, { credentials: "same-origin" }).then((a) => {
          var s = WebAssembly.instantiateStreaming(a, r);
          return s.then(
            n,
            function(o) {
              return C("wasm streaming compile failed: " + o), C("falling back to ArrayBuffer instantiation"), ur(t, r, n);
            }
          );
        }) : ur(t, r, n);
      }
      function hn() {
        var e = {
          env: jt,
          wasi_snapshot_preview1: jt
        };
        function t(a, s) {
          var o = a.exports;
          return o = y.instrumentWasmExports(o), i.asm = o, Se = i.asm.memory, g(Se, "memory not found in wasm exports"), rr(), nr = i.asm.__indirect_function_table, g(nr, "table not found in wasm exports"), sn(i.asm.__wasm_call_ctors), cn("wasm-instantiate"), o;
        }
        un("wasm-instantiate");
        var r = i;
        function n(a) {
          g(i === r, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"), r = null, t(a.instance);
        }
        if (i.instantiateWasm)
          try {
            return i.instantiateWasm(e, t);
          } catch (a) {
            C("Module.instantiateWasm callback failed with error: " + a), $(a);
          }
        return vn(oe, we, e, n).catch($), {};
      }
      var ie, Me;
      function ve(e, t) {
        Object.getOwnPropertyDescriptor(i, e) || Object.defineProperty(i, e, {
          configurable: !0,
          get: function() {
            J("Module." + e + " has been replaced with plain " + t + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
          }
        });
      }
      function mn(e) {
        Object.getOwnPropertyDescriptor(i, e) && J("`Module." + e + "` was supplied but `" + e + "` not included in INCOMING_MODULE_JS_API");
      }
      function cr(e) {
        return e === "FS_createPath" || e === "FS_createDataFile" || e === "FS_createPreloadedFile" || e === "FS_unlink" || e === "addRunDependency" || e === "FS_createLazyFile" || e === "FS_createDevice" || e === "removeRunDependency";
      }
      function pn(e, t) {
        typeof globalThis < "u" && Object.defineProperty(globalThis, e, {
          configurable: !0,
          get: function() {
            ce("`" + e + "` is not longer defined by emscripten. " + t);
          }
        });
      }
      pn("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");
      function gn(e) {
        typeof globalThis < "u" && !Object.getOwnPropertyDescriptor(globalThis, e) && Object.defineProperty(globalThis, e, {
          configurable: !0,
          get: function() {
            var t = "`" + e + "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line", r = e;
            r.startsWith("_") || (r = "$" + e), t += " (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='" + r + "')", cr(e) && (t += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), ce(t);
          }
        }), fr(e);
      }
      function fr(e) {
        Object.getOwnPropertyDescriptor(i, e) || Object.defineProperty(i, e, {
          configurable: !0,
          get: function() {
            var t = "'" + e + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
            cr(e) && (t += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"), J(t);
          }
        });
      }
      var yn = 2 ** 8 - 1, bn = 2 ** 16 - 1, wn = 2 ** 32 - 1, Tn = 2 ** 64 - 1, Cn = -(2 ** (8 - 1)) + 1, En = -(2 ** (16 - 1)) + 1, Sn = -(2 ** (32 - 1)) + 1, Fn = -(2 ** (64 - 1)) + 1;
      function nt(e, t, r, n) {
        g(Number.isInteger(Number(e)), "attempt to write non-integer (" + e + ") into integer heap"), g(e <= n, "value (" + e + ") too large to write as " + t + "-bit value"), g(e >= r, "value (" + e + ") too small to write as " + t + "-bit value");
      }
      var He = (e) => nt(e, 8, Cn, yn), Et = (e) => nt(e, 16, En, bn), M = (e) => nt(e, 32, Sn, wn), dr = (e) => nt(e, 64, Fn, Tn);
      function _r(e) {
        this.name = "ExitStatus", this.message = `Program terminated with exit(${e})`, this.status = e;
      }
      var it = (e) => {
        for (; e.length > 0; )
          e.shift()(i);
      }, he = (e) => (g(typeof e == "number"), "0x" + e.toString(16).padStart(8, "0")), Pn = () => {
        var e = zt(), t = Je();
        Ia(e, t);
      }, ce = (e) => {
        ce.shown || (ce.shown = {}), ce.shown[e] || (ce.shown[e] = 1, C(e));
      };
      function An(e) {
        this.excPtr = e, this.ptr = e - 24, this.set_type = function(t) {
          x[this.ptr + 4 >> 2] = t;
        }, this.get_type = function() {
          return x[this.ptr + 4 >> 2];
        }, this.set_destructor = function(t) {
          x[this.ptr + 8 >> 2] = t;
        }, this.get_destructor = function() {
          return x[this.ptr + 8 >> 2];
        }, this.set_caught = function(t) {
          t = t ? 1 : 0, se[this.ptr + 12 >> 0] = t, He(t);
        }, this.get_caught = function() {
          return se[this.ptr + 12 >> 0] != 0;
        }, this.set_rethrown = function(t) {
          t = t ? 1 : 0, se[this.ptr + 13 >> 0] = t, He(t);
        }, this.get_rethrown = function() {
          return se[this.ptr + 13 >> 0] != 0;
        }, this.init = function(t, r) {
          this.set_adjusted_ptr(0), this.set_type(t), this.set_destructor(r);
        }, this.set_adjusted_ptr = function(t) {
          x[this.ptr + 16 >> 2] = t;
        }, this.get_adjusted_ptr = function() {
          return x[this.ptr + 16 >> 2];
        }, this.get_exception_ptr = function() {
          var t = Aa(this.get_type());
          if (t)
            return x[this.excPtr >> 2];
          var r = this.get_adjusted_ptr();
          return r !== 0 ? r : this.excPtr;
        };
      }
      function In(e, t, r) {
        var n = new An(e);
        n.init(t, r), g(!1, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
      }
      var Dn = (e) => {
        e = e >>> 0;
        var t = zt(), r = Je();
        J(`stack overflow (Attempt to set SP to ${he(e)}, with stack limits [${he(r)} - ${he(t)}]). If you require more stack space build with -sSTACK_SIZE=<bytes>`);
      }, vr = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, hr = (e, t, r) => {
        for (var n = t + r, a = t; e[a] && !(a >= n); )
          ++a;
        if (a - t > 16 && e.buffer && vr)
          return vr.decode(e.subarray(t, a));
        for (var s = ""; t < a; ) {
          var o = e[t++];
          if (!(o & 128)) {
            s += String.fromCharCode(o);
            continue;
          }
          var l = e[t++] & 63;
          if ((o & 224) == 192) {
            s += String.fromCharCode((o & 31) << 6 | l);
            continue;
          }
          var d = e[t++] & 63;
          if ((o & 240) == 224 ? o = (o & 15) << 12 | l << 6 | d : ((o & 248) != 240 && ce("Invalid UTF-8 leading byte " + he(o) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), o = (o & 7) << 18 | l << 12 | d << 6 | e[t++] & 63), o < 65536)
            s += String.fromCharCode(o);
          else {
            var f = o - 65536;
            s += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023);
          }
        }
        return s;
      }, St = (e, t) => (g(typeof e == "number"), e ? hr(te, e, t) : "");
      function Mn(e, t, r) {
        return 0;
      }
      function $n(e, t, r, n) {
        J("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");
      }
      var at = {};
      function Ft(e) {
        for (; e.length; ) {
          var t = e.pop(), r = e.pop();
          r(t);
        }
      }
      function Ye(e) {
        return this.fromWireType(b[e >> 2]);
      }
      var $e = {}, Ae = {}, ot = {}, On = 48, Rn = 57;
      function Pt(e) {
        if (e === void 0)
          return "_unknown";
        e = e.replace(/[^a-zA-Z0-9_]/g, "$");
        var t = e.charCodeAt(0);
        return t >= On && t <= Rn ? `_${e}` : e;
      }
      function At(e, t) {
        return e = Pt(e), {
          [e]: function() {
            return t.apply(this, arguments);
          }
        }[e];
      }
      function It(e, t) {
        var r = At(t, function(n) {
          this.name = t, this.message = n;
          var a = new Error(n).stack;
          a !== void 0 && (this.stack = this.toString() + `
` + a.replace(/^Error(:[^\n]*)?\n/, ""));
        });
        return r.prototype = Object.create(e.prototype), r.prototype.constructor = r, r.prototype.toString = function() {
          return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
        }, r;
      }
      var mr = void 0;
      function st(e) {
        throw new mr(e);
      }
      function Oe(e, t, r) {
        e.forEach(function(l) {
          ot[l] = t;
        });
        function n(l) {
          var d = r(l);
          d.length !== e.length && st("Mismatched type converter count");
          for (var f = 0; f < e.length; ++f)
            me(e[f], d[f]);
        }
        var a = new Array(t.length), s = [], o = 0;
        t.forEach((l, d) => {
          Ae.hasOwnProperty(l) ? a[d] = Ae[l] : (s.push(l), $e.hasOwnProperty(l) || ($e[l] = []), $e[l].push(() => {
            a[d] = Ae[l], ++o, o === s.length && n(a);
          }));
        }), s.length === 0 && n(a);
      }
      var kn = function(e) {
        var t = at[e];
        delete at[e];
        var r = t.rawConstructor, n = t.rawDestructor, a = t.fields, s = a.map((o) => o.getterReturnType).concat(a.map((o) => o.setterArgumentType));
        Oe([e], s, (o) => {
          var l = {};
          return a.forEach((d, f) => {
            var m = d.fieldName, P = o[f], A = d.getter, R = d.getterContext, j = o[f + a.length], V = d.setter, G = d.setterContext;
            l[m] = {
              read: (K) => P.fromWireType(
                A(R, K)
              ),
              write: (K, v) => {
                var T = [];
                V(G, K, j.toWireType(T, v)), Ft(T);
              }
            };
          }), [{
            name: t.name,
            fromWireType: function(d) {
              var f = {};
              for (var m in l)
                f[m] = l[m].read(d);
              return n(d), f;
            },
            toWireType: function(d, f) {
              for (var m in l)
                if (!(m in f))
                  throw new TypeError(`Missing field: "${m}"`);
              var P = r();
              for (m in l)
                l[m].write(P, f[m]);
              return d !== null && d.push(n, P), P;
            },
            argPackAdvance: 8,
            readValueFromPointer: Ye,
            destructorFunction: n
          }];
        });
      };
      function xn(e, t, r, n, a) {
      }
      function Dt(e) {
        switch (e) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError(`Unknown type size: ${e}`);
        }
      }
      function Un() {
        for (var e = new Array(256), t = 0; t < 256; ++t)
          e[t] = String.fromCharCode(t);
        pr = e;
      }
      var pr = void 0;
      function Z(e) {
        for (var t = "", r = e; te[r]; )
          t += pr[te[r++]];
        return t;
      }
      var Re = void 0;
      function U(e) {
        throw new Re(e);
      }
      function me(e, t, r = {}) {
        if (!("argPackAdvance" in t))
          throw new TypeError("registerType registeredInstance requires argPackAdvance");
        var n = t.name;
        if (e || U(`type "${n}" must have a positive integer typeid pointer`), Ae.hasOwnProperty(e)) {
          if (r.ignoreDuplicateRegistrations)
            return;
          U(`Cannot register type '${n}' twice`);
        }
        if (Ae[e] = t, delete ot[e], $e.hasOwnProperty(e)) {
          var a = $e[e];
          delete $e[e], a.forEach((s) => s());
        }
      }
      function Ln(e, t, r, n, a) {
        var s = Dt(r);
        t = Z(t), me(e, {
          name: t,
          fromWireType: function(o) {
            return !!o;
          },
          toWireType: function(o, l) {
            return l ? n : a;
          },
          argPackAdvance: 8,
          readValueFromPointer: function(o) {
            var l;
            if (r === 1)
              l = se;
            else if (r === 2)
              l = Fe;
            else if (r === 4)
              l = b;
            else
              throw new TypeError("Unknown boolean type size: " + t);
            return this.fromWireType(l[o >> s]);
          },
          destructorFunction: null
        });
      }
      function Nn(e) {
        if (!(this instanceof Te) || !(e instanceof Te))
          return !1;
        for (var t = this.$$.ptrType.registeredClass, r = this.$$.ptr, n = e.$$.ptrType.registeredClass, a = e.$$.ptr; t.baseClass; )
          r = t.upcast(r), t = t.baseClass;
        for (; n.baseClass; )
          a = n.upcast(a), n = n.baseClass;
        return t === n && r === a;
      }
      function Wn(e) {
        return {
          count: e.count,
          deleteScheduled: e.deleteScheduled,
          preservePointerOnDelete: e.preservePointerOnDelete,
          ptr: e.ptr,
          ptrType: e.ptrType,
          smartPtr: e.smartPtr,
          smartPtrType: e.smartPtrType
        };
      }
      function Mt(e) {
        function t(r) {
          return r.$$.ptrType.registeredClass.name;
        }
        U(t(e) + " instance already deleted");
      }
      var $t = !1;
      function gr(e) {
      }
      function Hn(e) {
        e.smartPtr ? e.smartPtrType.rawDestructor(e.smartPtr) : e.ptrType.registeredClass.rawDestructor(e.ptr);
      }
      function yr(e) {
        e.count.value -= 1;
        var t = e.count.value === 0;
        t && Hn(e);
      }
      function br(e, t, r) {
        if (t === r)
          return e;
        if (r.baseClass === void 0)
          return null;
        var n = br(e, t, r.baseClass);
        return n === null ? null : r.downcast(n);
      }
      var wr = {};
      function Yn() {
        return Object.keys(Ve).length;
      }
      function jn() {
        var e = [];
        for (var t in Ve)
          Ve.hasOwnProperty(t) && e.push(Ve[t]);
        return e;
      }
      var je = [];
      function Ot() {
        for (; je.length; ) {
          var e = je.pop();
          e.$$.deleteScheduled = !1, e.delete();
        }
      }
      var ze = void 0;
      function zn(e) {
        ze = e, je.length && ze && ze(Ot);
      }
      function Vn() {
        i.getInheritedInstanceCount = Yn, i.getLiveInheritedInstances = jn, i.flushPendingDeletes = Ot, i.setDelayFunction = zn;
      }
      var Ve = {};
      function Bn(e, t) {
        for (t === void 0 && U("ptr should not be undefined"); e.baseClass; )
          t = e.upcast(t), e = e.baseClass;
        return t;
      }
      function Gn(e, t) {
        return t = Bn(e, t), Ve[t];
      }
      function lt(e, t) {
        (!t.ptrType || !t.ptr) && st("makeClassHandle requires ptr and ptrType");
        var r = !!t.smartPtrType, n = !!t.smartPtr;
        return r !== n && st("Both smartPtrType and smartPtr must be specified"), t.count = { value: 1 }, Be(Object.create(e, {
          $$: {
            value: t
          }
        }));
      }
      function Tr(e) {
        var t = this.getPointee(e);
        if (!t)
          return this.destructor(e), null;
        var r = Gn(this.registeredClass, t);
        if (r !== void 0) {
          if (r.$$.count.value === 0)
            return r.$$.ptr = t, r.$$.smartPtr = e, r.clone();
          var n = r.clone();
          return this.destructor(e), n;
        }
        function a() {
          return this.isSmartPointer ? lt(this.registeredClass.instancePrototype, {
            ptrType: this.pointeeType,
            ptr: t,
            smartPtrType: this,
            smartPtr: e
          }) : lt(this.registeredClass.instancePrototype, {
            ptrType: this,
            ptr: e
          });
        }
        var s = this.registeredClass.getActualType(t), o = wr[s];
        if (!o)
          return a.call(this);
        var l;
        this.isConst ? l = o.constPointerType : l = o.pointerType;
        var d = br(
          t,
          this.registeredClass,
          l.registeredClass
        );
        return d === null ? a.call(this) : this.isSmartPointer ? lt(l.registeredClass.instancePrototype, {
          ptrType: l,
          ptr: d,
          smartPtrType: this,
          smartPtr: e
        }) : lt(l.registeredClass.instancePrototype, {
          ptrType: l,
          ptr: d
        });
      }
      var Be = function(e) {
        return typeof FinalizationRegistry > "u" ? (Be = (t) => t, e) : ($t = new FinalizationRegistry((t) => {
          console.warn(t.leakWarning.stack.replace(/^Error: /, "")), yr(t.$$);
        }), Be = (t) => {
          var r = t.$$, n = !!r.smartPtr;
          if (n) {
            var a = { $$: r }, s = r.ptrType.registeredClass;
            a.leakWarning = new Error(`Embind found a leaked C++ instance ${s.name} <${he(r.ptr)}>.
We'll free it automatically in this case, but this functionality is not reliable across various environments.
Make sure to invoke .delete() manually once you're done with the instance instead.
Originally allocated`), "captureStackTrace" in Error && Error.captureStackTrace(a.leakWarning, Tr), $t.register(t, a, t);
          }
          return t;
        }, gr = (t) => $t.unregister(t), Be(e));
      };
      function Qn() {
        if (this.$$.ptr || Mt(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var e = Be(Object.create(Object.getPrototypeOf(this), {
          $$: {
            value: Wn(this.$$)
          }
        }));
        return e.$$.count.value += 1, e.$$.deleteScheduled = !1, e;
      }
      function Jn() {
        this.$$.ptr || Mt(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && U("Object already scheduled for deletion"), gr(this), yr(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }
      function qn() {
        return !this.$$.ptr;
      }
      function Kn() {
        return this.$$.ptr || Mt(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && U("Object already scheduled for deletion"), je.push(this), je.length === 1 && ze && ze(Ot), this.$$.deleteScheduled = !0, this;
      }
      function Zn() {
        Te.prototype.isAliasOf = Nn, Te.prototype.clone = Qn, Te.prototype.delete = Jn, Te.prototype.isDeleted = qn, Te.prototype.deleteLater = Kn;
      }
      function Te() {
      }
      function Cr(e, t, r) {
        if (e[t].overloadTable === void 0) {
          var n = e[t];
          e[t] = function() {
            return e[t].overloadTable.hasOwnProperty(arguments.length) || U(`Function '${r}' called with an invalid number of arguments (${arguments.length}) - expects one of (${e[t].overloadTable})!`), e[t].overloadTable[arguments.length].apply(this, arguments);
          }, e[t].overloadTable = [], e[t].overloadTable[n.argCount] = n;
        }
      }
      function Xn(e, t, r) {
        i.hasOwnProperty(e) ? ((r === void 0 || i[e].overloadTable !== void 0 && i[e].overloadTable[r] !== void 0) && U(`Cannot register public name '${e}' twice`), Cr(i, e, e), i.hasOwnProperty(r) && U(`Cannot register multiple overloads of a function with the same number of arguments (${r})!`), i[e].overloadTable[r] = t) : (i[e] = t, r !== void 0 && (i[e].numArguments = r));
      }
      function ei(e, t, r, n, a, s, o, l) {
        this.name = e, this.constructor = t, this.instancePrototype = r, this.rawDestructor = n, this.baseClass = a, this.getActualType = s, this.upcast = o, this.downcast = l, this.pureVirtualFunctions = [];
      }
      function Rt(e, t, r) {
        for (; t !== r; )
          t.upcast || U(`Expected null or instance of ${r.name}, got an instance of ${t.name}`), e = t.upcast(e), t = t.baseClass;
        return e;
      }
      function ti(e, t) {
        if (t === null)
          return this.isReference && U(`null is not a valid ${this.name}`), 0;
        t.$$ || U(`Cannot pass "${ke(t)}" as a ${this.name}`), t.$$.ptr || U(`Cannot pass deleted object as a pointer of type ${this.name}`);
        var r = t.$$.ptrType.registeredClass, n = Rt(t.$$.ptr, r, this.registeredClass);
        return n;
      }
      function ri(e, t) {
        var r;
        if (t === null)
          return this.isReference && U(`null is not a valid ${this.name}`), this.isSmartPointer ? (r = this.rawConstructor(), e !== null && e.push(this.rawDestructor, r), r) : 0;
        t.$$ || U(`Cannot pass "${ke(t)}" as a ${this.name}`), t.$$.ptr || U(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && t.$$.ptrType.isConst && U(`Cannot convert argument of type ${t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name} to parameter type ${this.name}`);
        var n = t.$$.ptrType.registeredClass;
        if (r = Rt(t.$$.ptr, n, this.registeredClass), this.isSmartPointer)
          switch (t.$$.smartPtr === void 0 && U("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
            case 0:
              t.$$.smartPtrType === this ? r = t.$$.smartPtr : U(`Cannot convert argument of type ${t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name} to parameter type ${this.name}`);
              break;
            case 1:
              r = t.$$.smartPtr;
              break;
            case 2:
              if (t.$$.smartPtrType === this)
                r = t.$$.smartPtr;
              else {
                var a = t.clone();
                r = this.rawShare(
                  r,
                  X.toHandle(function() {
                    a.delete();
                  })
                ), e !== null && e.push(this.rawDestructor, r);
              }
              break;
            default:
              U("Unsupporting sharing policy");
          }
        return r;
      }
      function ni(e, t) {
        if (t === null)
          return this.isReference && U(`null is not a valid ${this.name}`), 0;
        t.$$ || U(`Cannot pass "${ke(t)}" as a ${this.name}`), t.$$.ptr || U(`Cannot pass deleted object as a pointer of type ${this.name}`), t.$$.ptrType.isConst && U(`Cannot convert argument of type ${t.$$.ptrType.name} to parameter type ${this.name}`);
        var r = t.$$.ptrType.registeredClass, n = Rt(t.$$.ptr, r, this.registeredClass);
        return n;
      }
      function ii(e) {
        return this.rawGetPointee && (e = this.rawGetPointee(e)), e;
      }
      function ai(e) {
        this.rawDestructor && this.rawDestructor(e);
      }
      function oi(e) {
        e !== null && e.delete();
      }
      function si() {
        pe.prototype.getPointee = ii, pe.prototype.destructor = ai, pe.prototype.argPackAdvance = 8, pe.prototype.readValueFromPointer = Ye, pe.prototype.deleteObject = oi, pe.prototype.fromWireType = Tr;
      }
      function pe(e, t, r, n, a, s, o, l, d, f, m) {
        this.name = e, this.registeredClass = t, this.isReference = r, this.isConst = n, this.isSmartPointer = a, this.pointeeType = s, this.sharingPolicy = o, this.rawGetPointee = l, this.rawConstructor = d, this.rawShare = f, this.rawDestructor = m, !a && t.baseClass === void 0 ? n ? (this.toWireType = ti, this.destructorFunction = null) : (this.toWireType = ni, this.destructorFunction = null) : this.toWireType = ri;
      }
      function li(e, t, r) {
        i.hasOwnProperty(e) || st("Replacing nonexistant public symbol"), i[e].overloadTable !== void 0 && r !== void 0 ? i[e].overloadTable[r] = t : (i[e] = t, i[e].argCount = r);
      }
      var ui = (e, t, r) => {
        g("dynCall_" + e in i, `bad function pointer type - dynCall function not found for sig '${e}'`), r && r.length ? g(r.length === e.substring(1).replace(/j/g, "--").length) : g(e.length == 1);
        var n = i["dynCall_" + e];
        return r && r.length ? n.apply(null, [t].concat(r)) : n.call(null, t);
      }, ci = (e, t, r) => ui(e, t, r), fi = (e, t) => {
        var r = [];
        return function() {
          return r.length = 0, Object.assign(r, arguments), ci(e, t, r);
        };
      };
      function fe(e, t) {
        e = Z(e);
        function r() {
          return fi(e, t);
        }
        var n = r();
        return typeof n != "function" && U(`unknown function pointer with signature ${e}: ${t}`), n;
      }
      var Er = void 0;
      function Sr(e) {
        var t = Fa(e), r = Z(t);
        return ge(t), r;
      }
      function kt(e, t) {
        var r = [], n = {};
        function a(s) {
          if (!n[s] && !Ae[s]) {
            if (ot[s]) {
              ot[s].forEach(a);
              return;
            }
            r.push(s), n[s] = !0;
          }
        }
        throw t.forEach(a), new Er(`${e}: ` + r.map(Sr).join([", "]));
      }
      function di(e, t, r, n, a, s, o, l, d, f, m, P, A) {
        m = Z(m), s = fe(a, s), l && (l = fe(o, l)), f && (f = fe(d, f)), A = fe(P, A);
        var R = Pt(m);
        Xn(R, function() {
          kt(`Cannot construct ${m} due to unbound types`, [n]);
        }), Oe(
          [e, t, r],
          n ? [n] : [],
          function(j) {
            j = j[0];
            var V, G;
            n ? (V = j.registeredClass, G = V.instancePrototype) : G = Te.prototype;
            var K = At(R, function() {
              if (Object.getPrototypeOf(this) !== v)
                throw new Re("Use 'new' to construct " + m);
              if (T.constructor_body === void 0)
                throw new Re(m + " has no accessible constructor");
              var _t = T.constructor_body[arguments.length];
              if (_t === void 0)
                throw new Re(`Tried to invoke ctor of ${m} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(T.constructor_body).toString()}) parameters instead!`);
              return _t.apply(this, arguments);
            }), v = Object.create(G, {
              constructor: { value: K }
            });
            K.prototype = v;
            var T = new ei(
              m,
              K,
              v,
              A,
              V,
              s,
              l,
              f
            );
            T.baseClass && (T.baseClass.__derivedClasses === void 0 && (T.baseClass.__derivedClasses = []), T.baseClass.__derivedClasses.push(T));
            var ee = new pe(
              m,
              T,
              !0,
              !1,
              !1
            ), q = new pe(
              m + "*",
              T,
              !1,
              !1,
              !1
            ), Ie = new pe(
              m + " const*",
              T,
              !1,
              !0,
              !1
            );
            return wr[e] = {
              pointerType: q,
              constPointerType: Ie
            }, li(R, K), [ee, q, Ie];
          }
        );
      }
      function Fr(e, t) {
        for (var r = [], n = 0; n < e; n++)
          r.push(x[t + n * 4 >> 2]);
        return r;
      }
      function _i(e, t) {
        if (!(e instanceof Function))
          throw new TypeError(`new_ called with constructor type ${typeof e} which is not a function`);
        var r = At(e.name || "unknownFunctionName", function() {
        });
        r.prototype = e.prototype;
        var n = new r(), a = e.apply(n, t);
        return a instanceof Object ? a : n;
      }
      function ut(e) {
        try {
          return e();
        } catch (t) {
          J(t);
        }
      }
      var xt = (e) => {
        if (e instanceof _r || e == "unwind")
          return Ue;
        Le(), e instanceof WebAssembly.RuntimeError && Wr() <= 0 && C("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 52428800)"), F(1, e);
      }, vi = (e) => {
        Ue = e, Ct() || (i.onExit && i.onExit(e), _e = !0), F(e, new _r(e));
      }, Pr = (e, t) => {
        if (Ue = e, La(), Ct() && !t) {
          var r = `program exited (with status: ${e}), but keepRuntimeAlive() is set (counter=${or}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
          $(r), C(r);
        }
        vi(e);
      }, hi = Pr, mi = () => {
        if (!Ct())
          try {
            hi(Ue);
          } catch (e) {
            xt(e);
          }
      }, pi = (e) => {
        if (_e) {
          C("user callback triggered after runtime exited or application aborted.  Ignoring.");
          return;
        }
        try {
          e(), mi();
        } catch (t) {
          xt(t);
        }
      }, y = { instrumentWasmImports: function(e) {
        var t = [/^invoke_.*$/, /^fd_sync$/, /^__wasi_fd_sync$/, /^__asyncjs__.*$/, /^emscripten_promise_await$/, /^emscripten_idb_load$/, /^emscripten_idb_store$/, /^emscripten_idb_delete$/, /^emscripten_idb_exists$/, /^emscripten_idb_load_blob$/, /^emscripten_idb_store_blob$/, /^emscripten_sleep$/, /^emscripten_wget$/, /^emscripten_wget_data$/, /^emscripten_scan_registers$/, /^emscripten_lazy_load_code$/, /^_load_secondary_module$/, /^emscripten_fiber_swap$/, /^SDL_Delay$/, /^_emval_await$/];
        for (var r in e)
          (function(n) {
            var a = e[n];
            if (a.sig, typeof a == "function") {
              var s = a.isAsync || t.some((o) => !!n.match(o));
              e[n] = function() {
                var o = y.state;
                try {
                  return a.apply(null, arguments);
                } finally {
                  var l = o === y.State.Normal && y.state === y.State.Disabled, d = n.startsWith("invoke_") && !0;
                  if (y.state !== o && !s && !l && !d)
                    throw new Error(`import ${n} was not in ASYNCIFY_IMPORTS, but changed the state`);
                }
              };
            }
          })(r);
      }, instrumentWasmExports: function(e) {
        var t = {};
        for (var r in e)
          (function(n) {
            var a = e[n];
            typeof a == "function" ? t[n] = function() {
              y.exportCallStack.push(n);
              try {
                return a.apply(null, arguments);
              } finally {
                if (!_e) {
                  var s = y.exportCallStack.pop();
                  g(s === n), y.maybeStopUnwind();
                }
              }
            } : t[n] = a;
          })(r);
        return t;
      }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 4096, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId: function(e) {
        var t = y.callStackNameToId[e];
        return t === void 0 && (t = y.callStackId++, y.callStackNameToId[e] = t, y.callStackIdToName[t] = e), t;
      }, maybeStopUnwind: function() {
        y.currData && y.state === y.State.Unwinding && y.exportCallStack.length === 0 && (y.state = y.State.Normal, ut(Ma), typeof Fibers < "u" && Fibers.trampoline());
      }, whenDone: function() {
        return g(y.currData, "Tried to wait for an async operation when none is in progress."), g(!y.asyncPromiseHandlers, "Cannot have multiple async operations in flight at once"), new Promise((e, t) => {
          y.asyncPromiseHandlers = { resolve: e, reject: t };
        });
      }, allocateData: function() {
        var e = ft(12 + y.StackSize);
        return y.setDataHeader(e, e + 12, y.StackSize), y.setDataRewindFunc(e), e;
      }, setDataHeader: function(e, t, r) {
        b[e >> 2] = t, M(t), b[e + 4 >> 2] = t + r, M(t + r);
      }, setDataRewindFunc: function(e) {
        var t = y.exportCallStack[0], r = y.getCallStackId(t);
        b[e + 8 >> 2] = r, M(r);
      }, getDataRewindFunc: function(e) {
        var t = b[e + 8 >> 2], r = y.callStackIdToName[t], n = i.asm[r];
        return n;
      }, doRewind: function(e) {
        var t = y.getDataRewindFunc(e);
        return t();
      }, handleSleep: function(e) {
        if (g(y.state !== y.State.Disabled, "Asyncify cannot be done during or after the runtime exits"), !_e) {
          if (y.state === y.State.Normal) {
            var t = !1, r = !1;
            e((n = 0) => {
              if (g(!n || typeof n == "number" || typeof n == "boolean"), !_e && (y.handleSleepReturnValue = n, t = !0, !!r)) {
                g(!y.exportCallStack.length, "Waking up (starting to rewind) must be done from JS, without compiled code on the stack."), y.state = y.State.Rewinding, ut(() => $a(y.currData)), typeof Browser < "u" && Browser.mainLoop.func && Browser.mainLoop.resume();
                var a, s = !1;
                try {
                  a = y.doRewind(y.currData);
                } catch (d) {
                  a = d, s = !0;
                }
                var o = !1;
                if (!y.currData) {
                  var l = y.asyncPromiseHandlers;
                  l && (y.asyncPromiseHandlers = null, (s ? l.reject : l.resolve)(a), o = !0);
                }
                if (s && !o)
                  throw a;
              }
            }), r = !0, t || (y.state = y.State.Unwinding, y.currData = y.allocateData(), typeof Browser < "u" && Browser.mainLoop.func && Browser.mainLoop.pause(), ut(() => Da(y.currData)));
          } else
            y.state === y.State.Rewinding ? (y.state = y.State.Normal, ut(Oa), ge(y.currData), y.currData = null, y.sleepCallbacks.forEach((n) => pi(n))) : J(`invalid state: ${y.state}`);
          return y.handleSleepReturnValue;
        }
      }, handleAsync: function(e) {
        return y.handleSleep((t) => {
          e().then(t);
        });
      } };
      function Ar(e, t, r, n, a, s) {
        var o = t.length;
        o < 2 && U("argTypes array size mismatch! Must at least get return value and 'this' types!"), g(!s, "Async bindings are only supported with JSPI.");
        for (var l = t[1] !== null && r !== null, d = !1, f = 1; f < t.length; ++f)
          if (t[f] !== null && t[f].destructorFunction === void 0) {
            d = !0;
            break;
          }
        var m = t[0].name !== "void";
        s && (n = y.makeAsyncFunction(n));
        for (var P = "", A = "", f = 0; f < o - 2; ++f)
          P += (f !== 0 ? ", " : "") + "arg" + f, A += (f !== 0 ? ", " : "") + "arg" + f + "Wired";
        var R = `
        return function ${Pt(e)}(${P}) {
        if (arguments.length !== ${o - 2}) {
          throwBindingError('function ${e} called with ${arguments.length} arguments, expected ${o - 2} args!');
        }`;
        d && (R += `var destructors = [];
`);
        var j = d ? "destructors" : "null", V = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"], G = [U, n, a, Ft, t[0], t[1]];
        l && (R += "var thisWired = classParam.toWireType(" + j + `, this);
`);
        for (var f = 0; f < o - 2; ++f)
          R += "var arg" + f + "Wired = argType" + f + ".toWireType(" + j + ", arg" + f + "); // " + t[f + 2].name + `
`, V.push("argType" + f), G.push(t[f + 2]);
        if (l && (A = "thisWired" + (A.length > 0 ? ", " : "") + A), R += (m || s ? "var rv = " : "") + "invoker(fn" + (A.length > 0 ? ", " : "") + A + `);
`, V.push("Asyncify"), G.push(y), R += "function onDone(" + (m ? "rv" : "") + `) {
`, d)
          R += `runDestructors(destructors);
`;
        else
          for (var f = l ? 1 : 2; f < t.length; ++f) {
            var K = f === 1 ? "thisWired" : "arg" + (f - 2) + "Wired";
            t[f].destructorFunction !== null && (R += K + "_dtor(" + K + "); // " + t[f].name + `
`, V.push(K + "_dtor"), G.push(t[f].destructorFunction));
          }
        return m && (R += `var ret = retType.fromWireType(rv);
return ret;
`), R += `}
`, R += "return Asyncify.currData ? Asyncify.whenDone().then(onDone) : onDone(" + (m ? "rv" : "") + `);
`, R += `}
`, V.push(R), _i(Function, V).apply(null, G);
      }
      function gi(e, t, r, n, a, s) {
        g(t > 0);
        var o = Fr(t, r);
        a = fe(n, a), Oe([], [e], function(l) {
          l = l[0];
          var d = `constructor ${l.name}`;
          if (l.registeredClass.constructor_body === void 0 && (l.registeredClass.constructor_body = []), l.registeredClass.constructor_body[t - 1] !== void 0)
            throw new Re(`Cannot register multiple constructors with identical number of parameters (${t - 1}) for class '${l.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
          return l.registeredClass.constructor_body[t - 1] = () => {
            kt(`Cannot construct ${l.name} due to unbound types`, o);
          }, Oe([], o, function(f) {
            return f.splice(1, 0, null), l.registeredClass.constructor_body[t - 1] = Ar(d, f, null, a, s), [];
          }), [];
        });
      }
      function yi(e, t, r, n, a, s, o, l, d) {
        var f = Fr(r, n);
        t = Z(t), s = fe(a, s), Oe([], [e], function(m) {
          m = m[0];
          var P = `${m.name}.${t}`;
          t.startsWith("@@") && (t = Symbol[t.substring(2)]), l && m.registeredClass.pureVirtualFunctions.push(t);
          function A() {
            kt(`Cannot call ${P} due to unbound types`, f);
          }
          var R = m.registeredClass.instancePrototype, j = R[t];
          return j === void 0 || j.overloadTable === void 0 && j.className !== m.name && j.argCount === r - 2 ? (A.argCount = r - 2, A.className = m.name, R[t] = A) : (Cr(R, t, P), R[t].overloadTable[r - 2] = A), Oe([], f, function(V) {
            var G = Ar(P, V, m, s, o, d);
            return R[t].overloadTable === void 0 ? (G.argCount = r - 2, R[t] = G) : R[t].overloadTable[r - 2] = G, [];
          }), [];
        });
      }
      function bi() {
        this.allocated = [void 0], this.freelist = [], this.get = function(e) {
          return g(this.allocated[e] !== void 0, `invalid handle: ${e}`), this.allocated[e];
        }, this.has = function(e) {
          return this.allocated[e] !== void 0;
        }, this.allocate = function(e) {
          var t = this.freelist.pop() || this.allocated.length;
          return this.allocated[t] = e, t;
        }, this.free = function(e) {
          g(this.allocated[e] !== void 0), this.allocated[e] = void 0, this.freelist.push(e);
        };
      }
      var ae = new bi();
      function Ut(e) {
        e >= ae.reserved && --ae.get(e).refcount === 0 && ae.free(e);
      }
      function wi() {
        for (var e = 0, t = ae.reserved; t < ae.allocated.length; ++t)
          ae.allocated[t] !== void 0 && ++e;
        return e;
      }
      function Ti() {
        ae.allocated.push(
          { value: void 0 },
          { value: null },
          { value: !0 },
          { value: !1 }
        ), ae.reserved = ae.allocated.length, i.count_emval_handles = wi;
      }
      var X = { toValue: (e) => (e || U("Cannot use deleted val. handle = " + e), ae.get(e).value), toHandle: (e) => {
        switch (e) {
          case void 0:
            return 1;
          case null:
            return 2;
          case !0:
            return 3;
          case !1:
            return 4;
          default:
            return ae.allocate({ refcount: 1, value: e });
        }
      } };
      function Ci(e, t) {
        t = Z(t), me(e, {
          name: t,
          fromWireType: function(r) {
            var n = X.toValue(r);
            return Ut(r), n;
          },
          toWireType: function(r, n) {
            return X.toHandle(n);
          },
          argPackAdvance: 8,
          readValueFromPointer: Ye,
          destructorFunction: null
        });
      }
      function ke(e) {
        if (e === null)
          return "null";
        var t = typeof e;
        return t === "object" || t === "array" || t === "function" ? e.toString() : "" + e;
      }
      function Ei(e, t) {
        switch (t) {
          case 2:
            return function(r) {
              return this.fromWireType(er[r >> 2]);
            };
          case 3:
            return function(r) {
              return this.fromWireType(tr[r >> 3]);
            };
          default:
            throw new TypeError("Unknown float type: " + e);
        }
      }
      function Si(e, t, r) {
        var n = Dt(r);
        t = Z(t), me(e, {
          name: t,
          fromWireType: function(a) {
            return a;
          },
          toWireType: function(a, s) {
            if (typeof s != "number" && typeof s != "boolean")
              throw new TypeError(`Cannot convert ${ke(s)} to ${this.name}`);
            return s;
          },
          argPackAdvance: 8,
          readValueFromPointer: Ei(t, n),
          destructorFunction: null
        });
      }
      function Fi(e, t, r) {
        switch (t) {
          case 0:
            return r ? function(a) {
              return se[a];
            } : function(a) {
              return te[a];
            };
          case 1:
            return r ? function(a) {
              return Fe[a >> 1];
            } : function(a) {
              return rt[a >> 1];
            };
          case 2:
            return r ? function(a) {
              return b[a >> 2];
            } : function(a) {
              return x[a >> 2];
            };
          default:
            throw new TypeError("Unknown integer type: " + e);
        }
      }
      function Pi(e, t, r, n, a) {
        t = Z(t), a === -1 && (a = 4294967295);
        var s = Dt(r), o = (P) => P;
        if (n === 0) {
          var l = 32 - 8 * r;
          o = (P) => P << l >>> l;
        }
        var d = t.includes("unsigned"), f = (P, A) => {
          if (typeof P != "number" && typeof P != "boolean")
            throw new TypeError(`Cannot convert "${ke(P)}" to ${A}`);
          if (P < n || P > a)
            throw new TypeError(`Passing a number "${ke(P)}" from JS side to C/C++ side to an argument of type "${t}", which is outside the valid range [${n}, ${a}]!`);
        }, m;
        d ? m = function(P, A) {
          return f(A, this.name), A >>> 0;
        } : m = function(P, A) {
          return f(A, this.name), A;
        }, me(e, {
          name: t,
          fromWireType: o,
          toWireType: m,
          argPackAdvance: 8,
          readValueFromPointer: Fi(t, s, n !== 0),
          destructorFunction: null
        });
      }
      function Ai(e, t, r) {
        var n = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array
        ], a = n[t];
        function s(o) {
          o = o >> 2;
          var l = x, d = l[o], f = l[o + 1];
          return new a(l.buffer, f, d);
        }
        r = Z(r), me(e, {
          name: r,
          fromWireType: s,
          argPackAdvance: 8,
          readValueFromPointer: s
        }, {
          ignoreDuplicateRegistrations: !0
        });
      }
      var Ir = (e, t, r, n) => {
        if (g(typeof e == "string"), !(n > 0))
          return 0;
        for (var a = r, s = r + n - 1, o = 0; o < e.length; ++o) {
          var l = e.charCodeAt(o);
          if (l >= 55296 && l <= 57343) {
            var d = e.charCodeAt(++o);
            l = 65536 + ((l & 1023) << 10) | d & 1023;
          }
          if (l <= 127) {
            if (r >= s)
              break;
            t[r++] = l;
          } else if (l <= 2047) {
            if (r + 1 >= s)
              break;
            t[r++] = 192 | l >> 6, t[r++] = 128 | l & 63;
          } else if (l <= 65535) {
            if (r + 2 >= s)
              break;
            t[r++] = 224 | l >> 12, t[r++] = 128 | l >> 6 & 63, t[r++] = 128 | l & 63;
          } else {
            if (r + 3 >= s)
              break;
            l > 1114111 && ce("Invalid Unicode code point " + he(l) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."), t[r++] = 240 | l >> 18, t[r++] = 128 | l >> 12 & 63, t[r++] = 128 | l >> 6 & 63, t[r++] = 128 | l & 63;
          }
        }
        return t[r] = 0, r - a;
      }, Dr = (e, t, r) => (g(typeof r == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), Ir(e, te, t, r)), Lt = (e) => {
        for (var t = 0, r = 0; r < e.length; ++r) {
          var n = e.charCodeAt(r);
          n <= 127 ? t++ : n <= 2047 ? t += 2 : n >= 55296 && n <= 57343 ? (t += 4, ++r) : t += 3;
        }
        return t;
      };
      function Ii(e, t) {
        t = Z(t);
        var r = t === "std::string";
        me(e, {
          name: t,
          fromWireType: function(n) {
            var a = x[n >> 2], s = n + 4, o;
            if (r)
              for (var l = s, d = 0; d <= a; ++d) {
                var f = s + d;
                if (d == a || te[f] == 0) {
                  var m = f - l, P = St(l, m);
                  o === void 0 ? o = P : (o += String.fromCharCode(0), o += P), l = f + 1;
                }
              }
            else {
              for (var A = new Array(a), d = 0; d < a; ++d)
                A[d] = String.fromCharCode(te[s + d]);
              o = A.join("");
            }
            return ge(n), o;
          },
          toWireType: function(n, a) {
            a instanceof ArrayBuffer && (a = new Uint8Array(a));
            var s, o = typeof a == "string";
            o || a instanceof Uint8Array || a instanceof Uint8ClampedArray || a instanceof Int8Array || U("Cannot pass non-string to std::string"), r && o ? s = Lt(a) : s = a.length;
            var l = ft(4 + s + 1), d = l + 4;
            if (x[l >> 2] = s, M(s), r && o)
              Dr(a, d, s + 1);
            else if (o)
              for (var f = 0; f < s; ++f) {
                var m = a.charCodeAt(f);
                m > 255 && (ge(d), U("String has UTF-16 code units that do not fit in 8 bits")), te[d + f] = m;
              }
            else
              for (var f = 0; f < s; ++f)
                te[d + f] = a[f];
            return n !== null && n.push(ge, l), l;
          },
          argPackAdvance: 8,
          readValueFromPointer: Ye,
          destructorFunction: function(n) {
            ge(n);
          }
        });
      }
      var Mr = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, Di = (e, t) => {
        g(e % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
        for (var r = e, n = r >> 1, a = n + t / 2; !(n >= a) && rt[n]; )
          ++n;
        if (r = n << 1, r - e > 32 && Mr)
          return Mr.decode(te.subarray(e, r));
        for (var s = "", o = 0; !(o >= t / 2); ++o) {
          var l = Fe[e + o * 2 >> 1];
          if (l == 0)
            break;
          s += String.fromCharCode(l);
        }
        return s;
      }, Mi = (e, t, r) => {
        if (g(t % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!"), g(typeof r == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), r === void 0 && (r = 2147483647), r < 2)
          return 0;
        r -= 2;
        for (var n = t, a = r < e.length * 2 ? r / 2 : e.length, s = 0; s < a; ++s) {
          var o = e.charCodeAt(s);
          Fe[t >> 1] = o, Et(o), t += 2;
        }
        return Fe[t >> 1] = 0, Et(0), t - n;
      }, $i = (e) => e.length * 2, Oi = (e, t) => {
        g(e % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
        for (var r = 0, n = ""; !(r >= t / 4); ) {
          var a = b[e + r * 4 >> 2];
          if (a == 0)
            break;
          if (++r, a >= 65536) {
            var s = a - 65536;
            n += String.fromCharCode(55296 | s >> 10, 56320 | s & 1023);
          } else
            n += String.fromCharCode(a);
        }
        return n;
      }, Ri = (e, t, r) => {
        if (g(t % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!"), g(typeof r == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), r === void 0 && (r = 2147483647), r < 4)
          return 0;
        for (var n = t, a = n + r - 4, s = 0; s < e.length; ++s) {
          var o = e.charCodeAt(s);
          if (o >= 55296 && o <= 57343) {
            var l = e.charCodeAt(++s);
            o = 65536 + ((o & 1023) << 10) | l & 1023;
          }
          if (b[t >> 2] = o, M(o), t += 4, t + 4 > a)
            break;
        }
        return b[t >> 2] = 0, M(0), t - n;
      }, ki = (e) => {
        for (var t = 0, r = 0; r < e.length; ++r) {
          var n = e.charCodeAt(r);
          n >= 55296 && n <= 57343 && ++r, t += 4;
        }
        return t;
      }, xi = function(e, t, r) {
        r = Z(r);
        var n, a, s, o, l;
        t === 2 ? (n = Di, a = Mi, o = $i, s = () => rt, l = 1) : t === 4 && (n = Oi, a = Ri, o = ki, s = () => x, l = 2), me(e, {
          name: r,
          fromWireType: function(d) {
            for (var f = x[d >> 2], m = s(), P, A = d + 4, R = 0; R <= f; ++R) {
              var j = d + 4 + R * t;
              if (R == f || m[j >> l] == 0) {
                var V = j - A, G = n(A, V);
                P === void 0 ? P = G : (P += String.fromCharCode(0), P += G), A = j + t;
              }
            }
            return ge(d), P;
          },
          toWireType: function(d, f) {
            typeof f != "string" && U(`Cannot pass non-string to C++ string type ${r}`);
            var m = o(f), P = ft(4 + m + t);
            return x[P >> 2] = m >> l, a(f, P + 4, m + t), d !== null && d.push(ge, P), P;
          },
          argPackAdvance: 8,
          readValueFromPointer: Ye,
          destructorFunction: function(d) {
            ge(d);
          }
        });
      };
      function Ui(e, t, r, n, a, s) {
        at[e] = {
          name: Z(t),
          rawConstructor: fe(r, n),
          rawDestructor: fe(a, s),
          fields: []
        };
      }
      function Li(e, t, r, n, a, s, o, l, d, f) {
        at[e].fields.push({
          fieldName: Z(t),
          getterReturnType: r,
          getter: fe(n, a),
          getterContext: s,
          setterArgumentType: o,
          setter: fe(l, d),
          setterContext: f
        });
      }
      function Ni(e, t) {
        t = Z(t), me(e, {
          isVoid: !0,
          name: t,
          argPackAdvance: 0,
          fromWireType: function() {
          },
          toWireType: function(r, n) {
          }
        });
      }
      var Wi = !0, Hi = () => Wi;
      function Nt(e, t) {
        var r = Ae[e];
        return r === void 0 && U(t + " has unknown type " + Sr(e)), r;
      }
      function Yi(e, t, r) {
        e = X.toValue(e), t = Nt(t, "emval::as");
        var n = [], a = X.toHandle(n);
        return x[r >> 2] = a, t.toWireType(n, e);
      }
      var $r = function(e) {
        return y.handleAsync(() => (e = X.toValue(e), e.then(X.toHandle)));
      };
      $r.isAsync = !0;
      function ji(e, t) {
        for (var r = new Array(e), n = 0; n < e; ++n)
          r[n] = Nt(
            x[t + n * 4 >> 2],
            "parameter " + n
          );
        return r;
      }
      function zi(e, t, r, n) {
        e = X.toValue(e);
        for (var a = ji(t, r), s = new Array(t), o = 0; o < t; ++o) {
          var l = a[o];
          s[o] = l.readValueFromPointer(n), n += l.argPackAdvance;
        }
        var d = e.apply(void 0, s);
        return X.toHandle(d);
      }
      function Vi(e, t) {
        return e = X.toValue(e), t = X.toValue(t), X.toHandle(e[t]);
      }
      function Bi(e) {
        e > 4 && (ae.get(e).refcount += 1);
      }
      var Gi = {};
      function Qi(e) {
        var t = Gi[e];
        return t === void 0 ? Z(e) : t;
      }
      function Ji(e) {
        return X.toHandle(Qi(e));
      }
      function qi(e) {
        var t = X.toValue(e);
        Ft(t), Ut(e);
      }
      function Ki(e, t) {
        e = Nt(e, "_emval_take_value");
        var r = e.readValueFromPointer(t);
        return X.toHandle(r);
      }
      function Or(e) {
        return x[e >> 2] + b[e + 4 >> 2] * 4294967296;
      }
      var Zi = (e, t) => {
        var r = new Date(Or(e) * 1e3);
        b[t >> 2] = r.getUTCSeconds(), M(r.getUTCSeconds()), b[t + 4 >> 2] = r.getUTCMinutes(), M(r.getUTCMinutes()), b[t + 8 >> 2] = r.getUTCHours(), M(r.getUTCHours()), b[t + 12 >> 2] = r.getUTCDate(), M(r.getUTCDate()), b[t + 16 >> 2] = r.getUTCMonth(), M(r.getUTCMonth()), b[t + 20 >> 2] = r.getUTCFullYear() - 1900, M(r.getUTCFullYear() - 1900), b[t + 24 >> 2] = r.getUTCDay(), M(r.getUTCDay());
        var n = Date.UTC(r.getUTCFullYear(), 0, 1, 0, 0, 0, 0), a = (r.getTime() - n) / (1e3 * 60 * 60 * 24) | 0;
        b[t + 28 >> 2] = a, M(a);
      }, Ge = (e) => e % 4 === 0 && (e % 100 !== 0 || e % 400 === 0), Xi = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ea = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Rr = (e) => {
        var t = Ge(e.getFullYear()), r = t ? Xi : ea, n = r[e.getMonth()] + e.getDate() - 1;
        return n;
      }, ta = (e, t) => {
        var r = new Date(Or(e) * 1e3);
        b[t >> 2] = r.getSeconds(), M(r.getSeconds()), b[t + 4 >> 2] = r.getMinutes(), M(r.getMinutes()), b[t + 8 >> 2] = r.getHours(), M(r.getHours()), b[t + 12 >> 2] = r.getDate(), M(r.getDate()), b[t + 16 >> 2] = r.getMonth(), M(r.getMonth()), b[t + 20 >> 2] = r.getFullYear() - 1900, M(r.getFullYear() - 1900), b[t + 24 >> 2] = r.getDay(), M(r.getDay());
        var n = Rr(r) | 0;
        b[t + 28 >> 2] = n, M(n), b[t + 36 >> 2] = -(r.getTimezoneOffset() * 60), M(-(r.getTimezoneOffset() * 60));
        var a = new Date(r.getFullYear(), 0, 1), s = new Date(r.getFullYear(), 6, 1).getTimezoneOffset(), o = a.getTimezoneOffset(), l = (s != o && r.getTimezoneOffset() == Math.min(o, s)) | 0;
        b[t + 32 >> 2] = l, M(l);
      }, ra = (e) => {
        var t = new Date(
          b[e + 20 >> 2] + 1900,
          b[e + 16 >> 2],
          b[e + 12 >> 2],
          b[e + 8 >> 2],
          b[e + 4 >> 2],
          b[e >> 2],
          0
        ), r = b[e + 32 >> 2], n = t.getTimezoneOffset(), a = new Date(t.getFullYear(), 0, 1), s = new Date(t.getFullYear(), 6, 1).getTimezoneOffset(), o = a.getTimezoneOffset(), l = Math.min(o, s);
        if (r < 0)
          b[e + 32 >> 2] = Number(s != o && l == n), M(Number(s != o && l == n));
        else if (r > 0 != (l == n)) {
          var d = Math.max(o, s), f = r > 0 ? l : d;
          t.setTime(t.getTime() + (f - n) * 6e4);
        }
        b[e + 24 >> 2] = t.getDay(), M(t.getDay());
        var m = Rr(t) | 0;
        return b[e + 28 >> 2] = m, M(m), b[e >> 2] = t.getSeconds(), M(t.getSeconds()), b[e + 4 >> 2] = t.getMinutes(), M(t.getMinutes()), b[e + 8 >> 2] = t.getHours(), M(t.getHours()), b[e + 12 >> 2] = t.getDate(), M(t.getDate()), b[e + 16 >> 2] = t.getMonth(), M(t.getMonth()), b[e + 20 >> 2] = t.getYear(), M(t.getYear()), t.getTime() / 1e3 | 0;
      }, kr = (e) => {
        var t = Lt(e) + 1, r = ft(t);
        return r && Dr(e, r, t), r;
      }, na = (e, t, r) => {
        var n = new Date().getFullYear(), a = new Date(n, 0, 1), s = new Date(n, 6, 1), o = a.getTimezoneOffset(), l = s.getTimezoneOffset(), d = Math.max(o, l);
        x[e >> 2] = d * 60, M(d * 60), b[t >> 2] = Number(o != l), M(Number(o != l));
        function f(j) {
          var V = j.toTimeString().match(/\(([A-Za-z ]+)\)$/);
          return V ? V[1] : "GMT";
        }
        var m = f(a), P = f(s), A = kr(m), R = kr(P);
        l < o ? (x[r >> 2] = A, M(A), x[r + 4 >> 2] = R, M(R)) : (x[r >> 2] = R, M(R), x[r + 4 >> 2] = A, M(A));
      }, ia = () => {
        J("native code called abort()");
      };
      function aa() {
        return Date.now();
      }
      var xr = () => 2147483648, oa = () => xr(), ct;
      ct = () => performance.now();
      var sa = (e) => {
        var t = Se.buffer, r = e - t.byteLength + 65535 >>> 16;
        try {
          return Se.grow(r), rr(), 1;
        } catch (n) {
          C(`growMemory: Attempted to grow heap from ${t.byteLength} bytes to ${e} bytes, but got error: ${n}`);
        }
      }, la = (e) => {
        var t = te.length;
        e = e >>> 0, g(e > t);
        var r = xr();
        if (e > r)
          return C(`Cannot enlarge memory, asked to go up to ${e} bytes, but the limit is ${r} bytes!`), !1;
        for (var n = (m, P) => m + (P - m % P) % P, a = 1; a <= 4; a *= 2) {
          var s = t * (1 + 0.2 / a);
          s = Math.min(s, e + 100663296);
          var o = Math.min(r, n(Math.max(e, s), 65536)), l = ct(), d = sa(o), f = ct();
          if (W(`Heap resize call from ${t} to ${o} took ${f - l} msecs. Success: ${!!d}`), d)
            return !0;
        }
        return C(`Failed to grow the heap from ${t} bytes to ${o} bytes, not enough memory!`), !1;
      }, Wt = {}, ua = () => S || "./this.program", Qe = () => {
        if (!Qe.strings) {
          var e = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", t = {
            USER: "web_user",
            LOGNAME: "web_user",
            PATH: "/",
            PWD: "/",
            HOME: "/home/web_user",
            LANG: e,
            _: ua()
          };
          for (var r in Wt)
            Wt[r] === void 0 ? delete t[r] : t[r] = Wt[r];
          var n = [];
          for (var r in t)
            n.push(`${r}=${t[r]}`);
          Qe.strings = n;
        }
        return Qe.strings;
      }, ca = (e, t) => {
        for (var r = 0; r < e.length; ++r)
          g(e.charCodeAt(r) === (e.charCodeAt(r) & 255)), se[t++ >> 0] = e.charCodeAt(r), He(e.charCodeAt(r));
        se[t >> 0] = 0, He(0);
      }, fa = (e, t) => {
        var r = 0;
        return Qe().forEach(function(n, a) {
          var s = t + r;
          x[e + a * 4 >> 2] = s, M(s), ca(n, s), r += n.length + 1;
        }), 0;
      }, da = (e, t) => {
        var r = Qe();
        x[e >> 2] = r.length, M(r.length);
        var n = 0;
        return r.forEach(function(a) {
          n += a.length + 1;
        }), x[t >> 2] = n, M(n), 0;
      }, _a = (e) => {
        J("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM");
      }, va = (e, t) => {
        var r = 0, n = 0, a = 0;
        {
          g(e == 0 || e == 1 || e == 2);
          var s = 2;
          e == 0 ? r = 2 : (e == 1 || e == 2) && (r = 64), a = 1;
        }
        return se[t >> 0] = s, He(s), Fe[t + 2 >> 1] = a, Et(a), Me = [r >>> 0, (ie = r, +Math.abs(ie) >= 1 ? ie > 0 ? +Math.floor(ie / 4294967296) >>> 0 : ~~+Math.ceil((ie - +(~~ie >>> 0)) / 4294967296) >>> 0 : 0)], b[t + 8 >> 2] = Me[0], b[t + 12 >> 2] = Me[1], dr(r), Me = [n >>> 0, (ie = n, +Math.abs(ie) >= 1 ? ie > 0 ? +Math.floor(ie / 4294967296) >>> 0 : ~~+Math.ceil((ie - +(~~ie >>> 0)) / 4294967296) >>> 0 : 0)], b[t + 16 >> 2] = Me[0], b[t + 20 >> 2] = Me[1], dr(n), 0;
      }, ha = (e, t, r, n) => {
        J("fd_read called without SYSCALLS_REQUIRE_FILESYSTEM");
      }, ma = (e, t, r, n, a) => 70, Ht = [null, [], []], Yt = (e, t) => {
        var r = Ht[e];
        g(r), t === 0 || t === 10 ? ((e === 1 ? W : C)(hr(r, 0)), r.length = 0) : r.push(t);
      }, pa = () => {
        Pa(0), Ht[1].length && Yt(1, 10), Ht[2].length && Yt(2, 10);
      }, ga = (e, t, r, n) => {
        for (var a = 0, s = 0; s < r; s++) {
          var o = x[t >> 2], l = x[t + 4 >> 2];
          t += 8;
          for (var d = 0; d < l; d++)
            Yt(e, te[o + d]);
          a += l;
        }
        return x[n >> 2] = a, M(a), 0;
      }, ya = (e, t) => {
        for (var r = 0, n = 0; n <= t; r += e[n++])
          ;
        return r;
      }, Ur = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Lr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], ba = (e, t) => {
        for (var r = new Date(e.getTime()); t > 0; ) {
          var n = Ge(r.getFullYear()), a = r.getMonth(), s = (n ? Ur : Lr)[a];
          if (t > s - r.getDate())
            t -= s - r.getDate() + 1, r.setDate(1), a < 11 ? r.setMonth(a + 1) : (r.setMonth(0), r.setFullYear(r.getFullYear() + 1));
          else
            return r.setDate(r.getDate() + t), r;
        }
        return r;
      };
      function wa(e, t, r) {
        var n = r > 0 ? r : Lt(e) + 1, a = new Array(n), s = Ir(e, a, 0, a.length);
        return t && (a.length = s), a;
      }
      var Ta = (e, t) => {
        g(e.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)"), se.set(e, t);
      }, Ca = (e, t, r, n) => {
        var a = b[n + 40 >> 2], s = {
          tm_sec: b[n >> 2],
          tm_min: b[n + 4 >> 2],
          tm_hour: b[n + 8 >> 2],
          tm_mday: b[n + 12 >> 2],
          tm_mon: b[n + 16 >> 2],
          tm_year: b[n + 20 >> 2],
          tm_wday: b[n + 24 >> 2],
          tm_yday: b[n + 28 >> 2],
          tm_isdst: b[n + 32 >> 2],
          tm_gmtoff: b[n + 36 >> 2],
          tm_zone: a ? St(a) : ""
        }, o = St(r), l = {
          "%c": "%a %b %d %H:%M:%S %Y",
          "%D": "%m/%d/%y",
          "%F": "%Y-%m-%d",
          "%h": "%b",
          "%r": "%I:%M:%S %p",
          "%R": "%H:%M",
          "%T": "%H:%M:%S",
          "%x": "%m/%d/%y",
          "%X": "%H:%M:%S",
          "%Ec": "%c",
          "%EC": "%C",
          "%Ex": "%m/%d/%y",
          "%EX": "%H:%M:%S",
          "%Ey": "%y",
          "%EY": "%Y",
          "%Od": "%d",
          "%Oe": "%e",
          "%OH": "%H",
          "%OI": "%I",
          "%Om": "%m",
          "%OM": "%M",
          "%OS": "%S",
          "%Ou": "%u",
          "%OU": "%U",
          "%OV": "%V",
          "%Ow": "%w",
          "%OW": "%W",
          "%Oy": "%y"
        };
        for (var d in l)
          o = o.replace(new RegExp(d, "g"), l[d]);
        var f = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        function P(v, T, ee) {
          for (var q = typeof v == "number" ? v.toString() : v || ""; q.length < T; )
            q = ee[0] + q;
          return q;
        }
        function A(v, T) {
          return P(v, T, "0");
        }
        function R(v, T) {
          function ee(Ie) {
            return Ie < 0 ? -1 : Ie > 0 ? 1 : 0;
          }
          var q;
          return (q = ee(v.getFullYear() - T.getFullYear())) === 0 && (q = ee(v.getMonth() - T.getMonth())) === 0 && (q = ee(v.getDate() - T.getDate())), q;
        }
        function j(v) {
          switch (v.getDay()) {
            case 0:
              return new Date(v.getFullYear() - 1, 11, 29);
            case 1:
              return v;
            case 2:
              return new Date(v.getFullYear(), 0, 3);
            case 3:
              return new Date(v.getFullYear(), 0, 2);
            case 4:
              return new Date(v.getFullYear(), 0, 1);
            case 5:
              return new Date(v.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(v.getFullYear() - 1, 11, 30);
          }
        }
        function V(v) {
          var T = ba(new Date(v.tm_year + 1900, 0, 1), v.tm_yday), ee = new Date(T.getFullYear(), 0, 4), q = new Date(T.getFullYear() + 1, 0, 4), Ie = j(ee), _t = j(q);
          return R(Ie, T) <= 0 ? R(_t, T) <= 0 ? T.getFullYear() + 1 : T.getFullYear() : T.getFullYear() - 1;
        }
        var G = {
          "%a": (v) => f[v.tm_wday].substring(0, 3),
          "%A": (v) => f[v.tm_wday],
          "%b": (v) => m[v.tm_mon].substring(0, 3),
          "%B": (v) => m[v.tm_mon],
          "%C": (v) => {
            var T = v.tm_year + 1900;
            return A(T / 100 | 0, 2);
          },
          "%d": (v) => A(v.tm_mday, 2),
          "%e": (v) => P(v.tm_mday, 2, " "),
          "%g": (v) => V(v).toString().substring(2),
          "%G": (v) => V(v),
          "%H": (v) => A(v.tm_hour, 2),
          "%I": (v) => {
            var T = v.tm_hour;
            return T == 0 ? T = 12 : T > 12 && (T -= 12), A(T, 2);
          },
          "%j": (v) => A(v.tm_mday + ya(Ge(v.tm_year + 1900) ? Ur : Lr, v.tm_mon - 1), 3),
          "%m": (v) => A(v.tm_mon + 1, 2),
          "%M": (v) => A(v.tm_min, 2),
          "%n": () => `
`,
          "%p": (v) => v.tm_hour >= 0 && v.tm_hour < 12 ? "AM" : "PM",
          "%S": (v) => A(v.tm_sec, 2),
          "%t": () => "	",
          "%u": (v) => v.tm_wday || 7,
          "%U": (v) => {
            var T = v.tm_yday + 7 - v.tm_wday;
            return A(Math.floor(T / 7), 2);
          },
          "%V": (v) => {
            var T = Math.floor((v.tm_yday + 7 - (v.tm_wday + 6) % 7) / 7);
            if ((v.tm_wday + 371 - v.tm_yday - 2) % 7 <= 2 && T++, T) {
              if (T == 53) {
                var q = (v.tm_wday + 371 - v.tm_yday) % 7;
                q != 4 && (q != 3 || !Ge(v.tm_year)) && (T = 1);
              }
            } else {
              T = 52;
              var ee = (v.tm_wday + 7 - v.tm_yday - 1) % 7;
              (ee == 4 || ee == 5 && Ge(v.tm_year % 400 - 1)) && T++;
            }
            return A(T, 2);
          },
          "%w": (v) => v.tm_wday,
          "%W": (v) => {
            var T = v.tm_yday + 7 - (v.tm_wday + 6) % 7;
            return A(Math.floor(T / 7), 2);
          },
          "%y": (v) => (v.tm_year + 1900).toString().substring(2),
          "%Y": (v) => v.tm_year + 1900,
          "%z": (v) => {
            var T = v.tm_gmtoff, ee = T >= 0;
            return T = Math.abs(T) / 60, T = T / 60 * 100 + T % 60, (ee ? "+" : "-") + String("0000" + T).slice(-4);
          },
          "%Z": (v) => v.tm_zone,
          "%%": () => "%"
        };
        o = o.replace(/%%/g, "\0\0");
        for (var d in G)
          o.includes(d) && (o = o.replace(new RegExp(d, "g"), G[d](s)));
        o = o.replace(/\0\0/g, "%");
        var K = wa(o, !1);
        return K.length > t ? 0 : (Ta(K, e), K.length - 1);
      };
      mr = i.InternalError = It(Error, "InternalError"), Un(), Re = i.BindingError = It(Error, "BindingError"), Zn(), Vn(), si(), Er = i.UnboundTypeError = It(Error, "UnboundTypeError"), Ti();
      function Ea() {
        mn("fetchSettings");
      }
      var jt = {
        __cxa_throw: In,
        __handle_stack_overflow: Dn,
        __syscall_fcntl64: Mn,
        __syscall_openat: $n,
        _embind_finalize_value_object: kn,
        _embind_register_bigint: xn,
        _embind_register_bool: Ln,
        _embind_register_class: di,
        _embind_register_class_constructor: gi,
        _embind_register_class_function: yi,
        _embind_register_emval: Ci,
        _embind_register_float: Si,
        _embind_register_integer: Pi,
        _embind_register_memory_view: Ai,
        _embind_register_std_string: Ii,
        _embind_register_std_wstring: xi,
        _embind_register_value_object: Ui,
        _embind_register_value_object_field: Li,
        _embind_register_void: Ni,
        _emscripten_get_now_is_monotonic: Hi,
        _emval_as: Yi,
        _emval_await: $r,
        _emval_call: zi,
        _emval_decref: Ut,
        _emval_get_property: Vi,
        _emval_incref: Bi,
        _emval_new_cstring: Ji,
        _emval_run_destructors: qi,
        _emval_take_value: Ki,
        _gmtime_js: Zi,
        _localtime_js: ta,
        _mktime_js: ra,
        _tzset_js: na,
        abort: ia,
        emscripten_date_now: aa,
        emscripten_get_heap_max: oa,
        emscripten_get_now: ct,
        emscripten_resize_heap: la,
        environ_get: fa,
        environ_sizes_get: da,
        fd_close: _a,
        fd_fdstat_get: va,
        fd_read: ha,
        fd_seek: ma,
        fd_write: ga,
        strftime: Ca
      };
      y.instrumentWasmImports(jt), hn();
      var ge = D("free"), ft = D("malloc"), Sa = i._main = D("main"), Fa = D("__getTypeName");
      i.__embind_initialize_bindings = D("_embind_initialize_bindings");
      var Pa = i._fflush = D("fflush"), Nr = function() {
        return (Nr = i.asm.emscripten_stack_init).apply(null, arguments);
      }, zt = function() {
        return (zt = i.asm.emscripten_stack_get_base).apply(null, arguments);
      }, Je = function() {
        return (Je = i.asm.emscripten_stack_get_end).apply(null, arguments);
      }, Wr = function() {
        return (Wr = i.asm.emscripten_stack_get_current).apply(null, arguments);
      }, Aa = D("__cxa_is_pointer_type"), Ia = i.___set_stack_limits = D("__set_stack_limits");
      i.dynCall_viiii = D("dynCall_viiii"), i.dynCall_dd = D("dynCall_dd"), i.dynCall_ii = D("dynCall_ii"), i.dynCall_vii = D("dynCall_vii"), i.dynCall_iii = D("dynCall_iii"), i.dynCall_iiii = D("dynCall_iiii"), i.dynCall_jiji = D("dynCall_jiji"), i.dynCall_ijiii = D("dynCall_ijiii"), i.dynCall_iiiiiii = D("dynCall_iiiiiii"), i.dynCall_vi = D("dynCall_vi"), i.dynCall_viiiiii = D("dynCall_viiiiii"), i.dynCall_viiiii = D("dynCall_viiiii"), i.dynCall_iiiiii = D("dynCall_iiiiii"), i.dynCall_viii = D("dynCall_viii"), i.dynCall_viiiiiiii = D("dynCall_viiiiiiii"), i.dynCall_viiiiiiiiii = D("dynCall_viiiiiiiiii"), i.dynCall_viiiiiiiii = D("dynCall_viiiiiiiii"), i.dynCall_v = D("dynCall_v"), i.dynCall_iiiii = D("dynCall_iiiii"), i.dynCall_viiiiiii = D("dynCall_viiiiiii"), i.dynCall_viiiiiiiiiiii = D("dynCall_viiiiiiiiiiii"), i.dynCall_viiiiiiiiiiiiii = D("dynCall_viiiiiiiiiiiiii"), i.dynCall_viiiiiiiiiii = D("dynCall_viiiiiiiiiii"), i.dynCall_viifi = D("dynCall_viifi"), i.dynCall_fiii = D("dynCall_fiii"), i.dynCall_viidi = D("dynCall_viidi"), i.dynCall_viiiiiifi = D("dynCall_viiiiiifi"), i.dynCall_viiiifii = D("dynCall_viiiifii"), i.dynCall_fii = D("dynCall_fii"), i.dynCall_iiiji = D("dynCall_iiiji"), i.dynCall_i = D("dynCall_i"), i.dynCall_dii = D("dynCall_dii"), i.dynCall_viid = D("dynCall_viid"), i.dynCall_iidiiii = D("dynCall_iidiiii");
      var Da = D("asyncify_start_unwind"), Ma = D("asyncify_stop_unwind"), $a = D("asyncify_start_rewind"), Oa = D("asyncify_stop_rewind");
      i._ff_h264_cabac_tables = 145716;
      var Ra = [
        "zeroMemory",
        "inetPton4",
        "inetNtop4",
        "inetPton6",
        "inetNtop6",
        "readSockaddr",
        "writeSockaddr",
        "getHostByName",
        "initRandomFill",
        "randomFill",
        "traverseStack",
        "getCallstack",
        "emscriptenLog",
        "convertPCtoSourceLocation",
        "readEmAsmArgs",
        "jstoi_q",
        "jstoi_s",
        "listenOnce",
        "autoResumeAudioContext",
        "setWasmTableEntry",
        "safeSetTimeout",
        "asmjsMangle",
        "asyncLoad",
        "alignMemory",
        "mmapAlloc",
        "getNativeTypeSize",
        "STACK_SIZE",
        "STACK_ALIGN",
        "POINTER_SIZE",
        "ASSERTIONS",
        "writeI53ToI64",
        "writeI53ToI64Clamped",
        "writeI53ToI64Signaling",
        "writeI53ToU64Clamped",
        "writeI53ToU64Signaling",
        "readI53FromU64",
        "convertI32PairToI53",
        "convertU32PairToI53",
        "getCFunc",
        "ccall",
        "cwrap",
        "uleb128Encode",
        "generateFuncType",
        "convertJsFunctionToWasm",
        "getEmptyTableSlot",
        "updateTableMap",
        "getFunctionAddress",
        "addFunction",
        "removeFunction",
        "reallyNegative",
        "unSign",
        "strLen",
        "reSign",
        "formatString",
        "intArrayToString",
        "AsciiToString",
        "stringToUTF8OnStack",
        "registerKeyEventCallback",
        "maybeCStringToJsString",
        "findEventTarget",
        "findCanvasEventTarget",
        "getBoundingClientRect",
        "fillMouseEventData",
        "registerMouseEventCallback",
        "registerWheelEventCallback",
        "registerUiEventCallback",
        "registerFocusEventCallback",
        "fillDeviceOrientationEventData",
        "registerDeviceOrientationEventCallback",
        "fillDeviceMotionEventData",
        "registerDeviceMotionEventCallback",
        "screenOrientation",
        "fillOrientationChangeEventData",
        "registerOrientationChangeEventCallback",
        "fillFullscreenChangeEventData",
        "registerFullscreenChangeEventCallback",
        "JSEvents_requestFullscreen",
        "JSEvents_resizeCanvasForFullscreen",
        "registerRestoreOldStyle",
        "hideEverythingExceptGivenElement",
        "restoreHiddenElements",
        "setLetterbox",
        "softFullscreenResizeWebGLRenderTarget",
        "doRequestFullscreen",
        "fillPointerlockChangeEventData",
        "registerPointerlockChangeEventCallback",
        "registerPointerlockErrorEventCallback",
        "requestPointerLock",
        "fillVisibilityChangeEventData",
        "registerVisibilityChangeEventCallback",
        "registerTouchEventCallback",
        "fillGamepadEventData",
        "registerGamepadEventCallback",
        "registerBeforeUnloadEventCallback",
        "fillBatteryEventData",
        "battery",
        "registerBatteryEventCallback",
        "setCanvasElementSize",
        "getCanvasElementSize",
        "demangle",
        "demangleAll",
        "jsStackTrace",
        "stackTrace",
        "checkWasiClock",
        "wasiRightsToMuslOFlags",
        "wasiOFlagsToMuslOFlags",
        "createDyncallWrapper",
        "setImmediateWrapped",
        "clearImmediateWrapped",
        "polyfillSetImmediate",
        "getPromise",
        "makePromise",
        "idsToPromises",
        "makePromiseCallback",
        "setMainLoop",
        "getSocketFromFD",
        "getSocketAddress",
        "heapObjectForWebGLType",
        "heapAccessShiftForWebGLHeap",
        "webgl_enable_ANGLE_instanced_arrays",
        "webgl_enable_OES_vertex_array_object",
        "webgl_enable_WEBGL_draw_buffers",
        "webgl_enable_WEBGL_multi_draw",
        "emscriptenWebGLGet",
        "computeUnpackAlignedImageSize",
        "colorChannelsInGlTextureFormat",
        "emscriptenWebGLGetTexPixelData",
        "__glGenObject",
        "emscriptenWebGLGetUniform",
        "webglGetUniformLocation",
        "webglPrepareUniformLocationsBeforeFirstUse",
        "webglGetLeftBracePos",
        "emscriptenWebGLGetVertexAttrib",
        "__glGetActiveAttribOrUniform",
        "writeGLArray",
        "registerWebGlEventCallback",
        "SDL_unicode",
        "SDL_ttfContext",
        "SDL_audio",
        "GLFW_Window",
        "ALLOC_NORMAL",
        "ALLOC_STACK",
        "allocate",
        "writeStringToMemory",
        "writeAsciiToMemory",
        "registerInheritedInstance",
        "unregisterInheritedInstance",
        "enumReadValueFromPointer",
        "validateThis",
        "craftEmvalAllocator",
        "emval_get_global",
        "emval_allocateDestructors",
        "emval_addMethodCaller"
      ];
      Ra.forEach(gn);
      var ka = [
        "run",
        "addOnPreRun",
        "addOnInit",
        "addOnPreMain",
        "addOnExit",
        "addOnPostRun",
        "addRunDependency",
        "removeRunDependency",
        "FS_createFolder",
        "FS_createPath",
        "FS_createDataFile",
        "FS_createLazyFile",
        "FS_createLink",
        "FS_createDevice",
        "FS_unlink",
        "out",
        "err",
        "callMain",
        "abort",
        "keepRuntimeAlive",
        "wasmMemory",
        "stackAlloc",
        "stackSave",
        "stackRestore",
        "getTempRet0",
        "setTempRet0",
        "writeStackCookie",
        "checkStackCookie",
        "ptrToString",
        "exitJS",
        "getHeapMax",
        "growMemory",
        "ENV",
        "setStackLimits",
        "MONTH_DAYS_REGULAR",
        "MONTH_DAYS_LEAP",
        "MONTH_DAYS_REGULAR_CUMULATIVE",
        "MONTH_DAYS_LEAP_CUMULATIVE",
        "isLeapYear",
        "ydayFromDate",
        "arraySum",
        "addDays",
        "ERRNO_CODES",
        "ERRNO_MESSAGES",
        "setErrNo",
        "DNS",
        "Protocols",
        "Sockets",
        "timers",
        "warnOnce",
        "UNWIND_CACHE",
        "readEmAsmArgsArray",
        "getExecutableName",
        "dynCallLegacy",
        "getDynCaller",
        "dynCall",
        "getWasmTableEntry",
        "handleException",
        "runtimeKeepalivePush",
        "runtimeKeepalivePop",
        "callUserCallback",
        "maybeExit",
        "HandleAllocator",
        "readI53FromI64",
        "convertI32PairToI53Checked",
        "sigToWasmTypes",
        "freeTableIndexes",
        "functionsInTableMap",
        "setValue",
        "getValue",
        "PATH",
        "PATH_FS",
        "UTF8Decoder",
        "UTF8ArrayToString",
        "UTF8ToString",
        "stringToUTF8Array",
        "stringToUTF8",
        "lengthBytesUTF8",
        "intArrayFromString",
        "stringToAscii",
        "UTF16Decoder",
        "UTF16ToString",
        "stringToUTF16",
        "lengthBytesUTF16",
        "UTF32ToString",
        "stringToUTF32",
        "lengthBytesUTF32",
        "stringToNewUTF8",
        "writeArrayToMemory",
        "JSEvents",
        "specialHTMLTargets",
        "currentFullscreenStrategy",
        "restoreOldWindowedStyle",
        "ExitStatus",
        "getEnvStrings",
        "flush_NO_FILESYSTEM",
        "promiseMap",
        "uncaughtExceptionCount",
        "exceptionLast",
        "exceptionCaught",
        "ExceptionInfo",
        "Browser",
        "wget",
        "SYSCALLS",
        "tempFixedLengthArray",
        "miniTempWebGLFloatBuffers",
        "miniTempWebGLIntBuffers",
        "GL",
        "emscripten_webgl_power_preferences",
        "AL",
        "GLUT",
        "EGL",
        "GLEW",
        "IDBStore",
        "runAndAbortIfError",
        "Asyncify",
        "Fibers",
        "SDL",
        "SDL_gfx",
        "GLFW",
        "allocateUTF8",
        "allocateUTF8OnStack",
        "InternalError",
        "BindingError",
        "UnboundTypeError",
        "PureVirtualError",
        "init_embind",
        "throwInternalError",
        "throwBindingError",
        "throwUnboundTypeError",
        "ensureOverloadTable",
        "exposePublicSymbol",
        "replacePublicSymbol",
        "extendError",
        "createNamedFunction",
        "embindRepr",
        "registeredInstances",
        "getBasestPointer",
        "getInheritedInstance",
        "getInheritedInstanceCount",
        "getLiveInheritedInstances",
        "registeredTypes",
        "awaitingDependencies",
        "typeDependencies",
        "registeredPointers",
        "registerType",
        "whenDependentTypesAreResolved",
        "embind_charCodes",
        "embind_init_charCodes",
        "readLatin1String",
        "getTypeName",
        "heap32VectorToArray",
        "requireRegisteredType",
        "getShiftFromSize",
        "integerReadValueFromPointer",
        "floatReadValueFromPointer",
        "simpleReadValueFromPointer",
        "runDestructors",
        "newFunc",
        "craftInvokerFunction",
        "embind__requireFunction",
        "tupleRegistrations",
        "structRegistrations",
        "genericPointerToWireType",
        "constNoSmartPtrRawPointerToWireType",
        "nonConstNoSmartPtrRawPointerToWireType",
        "init_RegisteredPointer",
        "RegisteredPointer",
        "RegisteredPointer_getPointee",
        "RegisteredPointer_destructor",
        "RegisteredPointer_deleteObject",
        "RegisteredPointer_fromWireType",
        "runDestructor",
        "releaseClassHandle",
        "finalizationRegistry",
        "detachFinalizer_deps",
        "detachFinalizer",
        "attachFinalizer",
        "makeClassHandle",
        "init_ClassHandle",
        "ClassHandle",
        "ClassHandle_isAliasOf",
        "throwInstanceAlreadyDeleted",
        "ClassHandle_clone",
        "ClassHandle_delete",
        "deletionQueue",
        "ClassHandle_isDeleted",
        "ClassHandle_deleteLater",
        "flushPendingDeletes",
        "delayFunction",
        "setDelayFunction",
        "RegisteredClass",
        "shallowCopyInternalPointer",
        "downcastPointer",
        "upcastPointer",
        "char_0",
        "char_9",
        "makeLegalFunctionName",
        "emval_handles",
        "emval_symbols",
        "init_emval",
        "count_emval_handles",
        "getStringOrSymbol",
        "Emval",
        "emval_newers",
        "emval_lookupTypes",
        "emval_methodCallers",
        "emval_registeredMethods"
      ];
      ka.forEach(fr);
      var dt;
      Ne = function e() {
        dt || Hr(), dt || (Ne = e);
      };
      function xa() {
        g(be == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])'), g(wt.length == 0, "cannot call main when preRun functions remain to be called");
        var e = Sa, t = 0, r = 0;
        try {
          var n = e(t, r);
          return Pr(n, !0), n;
        } catch (a) {
          return xt(a);
        }
      }
      function Ua() {
        Nr(), Xr();
      }
      function Hr() {
        if (be > 0 || (Ua(), tn(), be > 0))
          return;
        function e() {
          dt || (dt = !0, i.calledRun = !0, !_e && (rn(), nn(), k(i), i.onRuntimeInitialized && i.onRuntimeInitialized(), Yr && xa(), an()));
        }
        i.setStatus ? (i.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
            i.setStatus("");
          }, 1), e();
        }, 1)) : e(), Le();
      }
      function La() {
        var e = W, t = C, r = !1;
        W = C = (n) => {
          r = !0;
        };
        try {
          pa();
        } catch {
        }
        W = e, C = t, r && (ce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc."), ce("(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)"));
      }
      if (i.preInit)
        for (typeof i.preInit == "function" && (i.preInit = [i.preInit]); i.preInit.length > 0; )
          i.preInit.pop()();
      var Yr = !0;
      return i.noInitialRun && (Yr = !1), Hr(), I.ready;
    };
  })();
  c.exports = _;
})(za);
const Va = Qt;
var Jt = {}, Ba = {
  get exports() {
    return Jt;
  },
  set exports(c) {
    Jt = c;
  }
};
(function(c) {
  var u = Object.prototype.hasOwnProperty, _ = "~";
  function h() {
  }
  Object.create && (h.prototype = /* @__PURE__ */ Object.create(null), new h().__proto__ || (_ = !1));
  function I(E, S, F) {
    this.fn = E, this.context = S, this.once = F || !1;
  }
  function i(E, S, F, O, Q) {
    if (typeof F != "function")
      throw new TypeError("The listener must be a function");
    var z = new I(F, O || E, Q), L = _ ? _ + S : S;
    return E._events[L] ? E._events[L].fn ? E._events[L] = [E._events[L], z] : E._events[L].push(z) : (E._events[L] = z, E._eventsCount++), E;
  }
  function k(E, S) {
    --E._eventsCount === 0 ? E._events = new h() : delete E._events[S];
  }
  function $() {
    this._events = new h(), this._eventsCount = 0;
  }
  $.prototype.eventNames = function() {
    var S = [], F, O;
    if (this._eventsCount === 0)
      return S;
    for (O in F = this._events)
      u.call(F, O) && S.push(_ ? O.slice(1) : O);
    return Object.getOwnPropertySymbols ? S.concat(Object.getOwnPropertySymbols(F)) : S;
  }, $.prototype.listeners = function(S) {
    var F = _ ? _ + S : S, O = this._events[F];
    if (!O)
      return [];
    if (O.fn)
      return [O.fn];
    for (var Q = 0, z = O.length, L = new Array(z); Q < z; Q++)
      L[Q] = O[Q].fn;
    return L;
  }, $.prototype.listenerCount = function(S) {
    var F = _ ? _ + S : S, O = this._events[F];
    return O ? O.fn ? 1 : O.length : 0;
  }, $.prototype.emit = function(S, F, O, Q, z, L) {
    var H = _ ? _ + S : S;
    if (!this._events[H])
      return !1;
    var p = this._events[H], N = arguments.length, W, C;
    if (p.fn) {
      switch (p.once && this.removeListener(S, p.fn, void 0, !0), N) {
        case 1:
          return p.fn.call(p.context), !0;
        case 2:
          return p.fn.call(p.context, F), !0;
        case 3:
          return p.fn.call(p.context, F, O), !0;
        case 4:
          return p.fn.call(p.context, F, O, Q), !0;
        case 5:
          return p.fn.call(p.context, F, O, Q, z), !0;
        case 6:
          return p.fn.call(p.context, F, O, Q, z, L), !0;
      }
      for (C = 1, W = new Array(N - 1); C < N; C++)
        W[C - 1] = arguments[C];
      p.fn.apply(p.context, W);
    } else {
      var oe = p.length, de;
      for (C = 0; C < oe; C++)
        switch (p[C].once && this.removeListener(S, p[C].fn, void 0, !0), N) {
          case 1:
            p[C].fn.call(p[C].context);
            break;
          case 2:
            p[C].fn.call(p[C].context, F);
            break;
          case 3:
            p[C].fn.call(p[C].context, F, O);
            break;
          case 4:
            p[C].fn.call(p[C].context, F, O, Q);
            break;
          default:
            if (!W)
              for (de = 1, W = new Array(N - 1); de < N; de++)
                W[de - 1] = arguments[de];
            p[C].fn.apply(p[C].context, W);
        }
    }
    return !0;
  }, $.prototype.on = function(S, F, O) {
    return i(this, S, F, O, !1);
  }, $.prototype.once = function(S, F, O) {
    return i(this, S, F, O, !0);
  }, $.prototype.removeListener = function(S, F, O, Q) {
    var z = _ ? _ + S : S;
    if (!this._events[z])
      return this;
    if (!F)
      return k(this, z), this;
    var L = this._events[z];
    if (L.fn)
      L.fn === F && (!Q || L.once) && (!O || L.context === O) && k(this, z);
    else {
      for (var H = 0, p = [], N = L.length; H < N; H++)
        (L[H].fn !== F || Q && !L[H].once || O && L[H].context !== O) && p.push(L[H]);
      p.length ? this._events[z] = p.length === 1 ? p[0] : p : k(this, z);
    }
    return this;
  }, $.prototype.removeAllListeners = function(S) {
    var F;
    return S ? (F = _ ? _ + S : S, this._events[F] && k(this, F)) : (this._events = new h(), this._eventsCount = 0), this;
  }, $.prototype.off = $.prototype.removeListener, $.prototype.addListener = $.prototype.on, $.prefixed = _, $.EventEmitter = $, c.exports = $;
})(Ba);
const Ga = Jt;
class Kr extends Error {
  constructor(u) {
    super(u), this.name = "TimeoutError";
  }
}
let Qa = class extends Error {
  constructor(u) {
    super(), this.name = "AbortError", this.message = u;
  }
};
const jr = (c) => globalThis.DOMException === void 0 ? new Qa(c) : new DOMException(c), zr = (c) => {
  const u = c.reason === void 0 ? jr("This operation was aborted.") : c.reason;
  return u instanceof Error ? u : jr(u);
};
function Ja(c, u, _, h) {
  let I;
  const i = new Promise((k, $) => {
    if (typeof u != "number" || Math.sign(u) !== 1)
      throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${u}\``);
    if (u === Number.POSITIVE_INFINITY) {
      k(c);
      return;
    }
    if (h = {
      customTimers: { setTimeout, clearTimeout },
      ...h
    }, h.signal) {
      const { signal: E } = h;
      E.aborted && $(zr(E)), E.addEventListener("abort", () => {
        $(zr(E));
      });
    }
    I = h.customTimers.setTimeout.call(void 0, () => {
      if (typeof _ == "function") {
        try {
          k(_());
        } catch (F) {
          $(F);
        }
        return;
      }
      const E = typeof _ == "string" ? _ : `Promise timed out after ${u} milliseconds`, S = _ instanceof Error ? _ : new Kr(E);
      typeof c.cancel == "function" && c.cancel(), $(S);
    }, u), (async () => {
      try {
        k(await c);
      } catch (E) {
        $(E);
      } finally {
        h.customTimers.clearTimeout.call(void 0, I);
      }
    })();
  });
  return i.clear = () => {
    clearTimeout(I), I = void 0;
  }, i;
}
function qa(c, u, _) {
  let h = 0, I = c.length;
  for (; I > 0; ) {
    const i = Math.trunc(I / 2);
    let k = h + i;
    _(c[k], u) <= 0 ? (h = ++k, I -= i + 1) : I = i;
  }
  return h;
}
var De = globalThis && globalThis.__classPrivateFieldGet || function(c, u, _, h) {
  if (_ === "a" && !h)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof u == "function" ? c !== u || !h : !u.has(c))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return _ === "m" ? h : _ === "a" ? h.call(c) : h ? h.value : u.get(c);
}, ye;
class Ka {
  constructor() {
    ye.set(this, []);
  }
  enqueue(u, _) {
    _ = {
      priority: 0,
      ..._
    };
    const h = {
      priority: _.priority,
      run: u
    };
    if (this.size && De(this, ye, "f")[this.size - 1].priority >= _.priority) {
      De(this, ye, "f").push(h);
      return;
    }
    const I = qa(De(this, ye, "f"), h, (i, k) => k.priority - i.priority);
    De(this, ye, "f").splice(I, 0, h);
  }
  dequeue() {
    const u = De(this, ye, "f").shift();
    return u?.run;
  }
  filter(u) {
    return De(this, ye, "f").filter((_) => _.priority === u.priority).map((_) => _.run);
  }
  get size() {
    return De(this, ye, "f").length;
  }
}
ye = /* @__PURE__ */ new WeakMap();
var Y = globalThis && globalThis.__classPrivateFieldSet || function(c, u, _, h, I) {
  if (h === "m")
    throw new TypeError("Private method is not writable");
  if (h === "a" && !I)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof u == "function" ? c !== u || !I : !u.has(c))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return h === "a" ? I.call(c, _) : I ? I.value = _ : u.set(c, _), _;
}, w = globalThis && globalThis.__classPrivateFieldGet || function(c, u, _, h) {
  if (_ === "a" && !h)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof u == "function" ? c !== u || !h : !u.has(c))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return _ === "m" ? h : _ === "a" ? h.call(c) : h ? h.value : u.get(c);
}, B, Ze, Xe, Ee, yt, et, vt, ue, Ke, re, ht, ne, tt, Ce, mt, Vr, Br, Zr, Gr, Qr, Jr, pt, Vt, Bt, bt, gt;
const Za = new Kr();
class Xa extends Error {
}
class eo extends Ga {
  constructor(u) {
    var _, h, I, i;
    if (super(), B.add(this), Ze.set(this, void 0), Xe.set(this, void 0), Ee.set(this, 0), yt.set(this, void 0), et.set(this, void 0), vt.set(this, 0), ue.set(this, void 0), Ke.set(this, void 0), re.set(this, void 0), ht.set(this, void 0), ne.set(this, 0), tt.set(this, void 0), Ce.set(this, void 0), mt.set(this, void 0), Object.defineProperty(this, "timeout", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), u = {
      carryoverConcurrencyCount: !1,
      intervalCap: Number.POSITIVE_INFINITY,
      interval: 0,
      concurrency: Number.POSITIVE_INFINITY,
      autoStart: !0,
      queueClass: Ka,
      ...u
    }, !(typeof u.intervalCap == "number" && u.intervalCap >= 1))
      throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${(h = (_ = u.intervalCap) === null || _ === void 0 ? void 0 : _.toString()) !== null && h !== void 0 ? h : ""}\` (${typeof u.intervalCap})`);
    if (u.interval === void 0 || !(Number.isFinite(u.interval) && u.interval >= 0))
      throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${(i = (I = u.interval) === null || I === void 0 ? void 0 : I.toString()) !== null && i !== void 0 ? i : ""}\` (${typeof u.interval})`);
    Y(this, Ze, u.carryoverConcurrencyCount, "f"), Y(this, Xe, u.intervalCap === Number.POSITIVE_INFINITY || u.interval === 0, "f"), Y(this, yt, u.intervalCap, "f"), Y(this, et, u.interval, "f"), Y(this, re, new u.queueClass(), "f"), Y(this, ht, u.queueClass, "f"), this.concurrency = u.concurrency, this.timeout = u.timeout, Y(this, mt, u.throwOnTimeout === !0, "f"), Y(this, Ce, u.autoStart === !1, "f");
  }
  get concurrency() {
    return w(this, tt, "f");
  }
  set concurrency(u) {
    if (!(typeof u == "number" && u >= 1))
      throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${u}\` (${typeof u})`);
    Y(this, tt, u, "f"), w(this, B, "m", bt).call(this);
  }
  async add(u, _ = {}) {
    return new Promise((h, I) => {
      const i = async () => {
        var k, $, E;
        Y(this, ne, ($ = w(this, ne, "f"), $++, $), "f"), Y(this, Ee, (E = w(this, Ee, "f"), E++, E), "f");
        try {
          if (!((k = _.signal) === null || k === void 0) && k.aborted) {
            I(new Xa("The task was aborted."));
            return;
          }
          const F = await (this.timeout === void 0 && _.timeout === void 0 ? u({ signal: _.signal }) : Ja(Promise.resolve(u({ signal: _.signal })), _.timeout === void 0 ? this.timeout : _.timeout, () => {
            (_.throwOnTimeout === void 0 ? w(this, mt, "f") : _.throwOnTimeout) && I(Za);
          }));
          h(F), this.emit("completed", F);
        } catch (S) {
          I(S), this.emit("error", S);
        }
        w(this, B, "m", Zr).call(this);
      };
      w(this, re, "f").enqueue(i, _), w(this, B, "m", pt).call(this), this.emit("add");
    });
  }
  async addAll(u, _) {
    return Promise.all(u.map(async (h) => this.add(h, _)));
  }
  start() {
    return w(this, Ce, "f") ? (Y(this, Ce, !1, "f"), w(this, B, "m", bt).call(this), this) : this;
  }
  pause() {
    Y(this, Ce, !0, "f");
  }
  clear() {
    Y(this, re, new (w(this, ht, "f"))(), "f");
  }
  async onEmpty() {
    w(this, re, "f").size !== 0 && await w(this, B, "m", gt).call(this, "empty");
  }
  async onSizeLessThan(u) {
    w(this, re, "f").size < u || await w(this, B, "m", gt).call(this, "next", () => w(this, re, "f").size < u);
  }
  async onIdle() {
    w(this, ne, "f") === 0 && w(this, re, "f").size === 0 || await w(this, B, "m", gt).call(this, "idle");
  }
  get size() {
    return w(this, re, "f").size;
  }
  sizeBy(u) {
    return w(this, re, "f").filter(u).length;
  }
  get pending() {
    return w(this, ne, "f");
  }
  get isPaused() {
    return w(this, Ce, "f");
  }
}
Ze = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), ue = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ new WeakMap(), re = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakSet(), Vr = function() {
  return w(this, Xe, "f") || w(this, Ee, "f") < w(this, yt, "f");
}, Br = function() {
  return w(this, ne, "f") < w(this, tt, "f");
}, Zr = function() {
  var u;
  Y(this, ne, (u = w(this, ne, "f"), u--, u), "f"), w(this, B, "m", pt).call(this), this.emit("next");
}, Gr = function() {
  this.emit("empty"), w(this, ne, "f") === 0 && this.emit("idle");
}, Qr = function() {
  w(this, B, "m", Bt).call(this), w(this, B, "m", Vt).call(this), Y(this, Ke, void 0, "f");
}, Jr = function() {
  const u = Date.now();
  if (w(this, ue, "f") === void 0) {
    const _ = w(this, vt, "f") - u;
    if (_ < 0)
      Y(this, Ee, w(this, Ze, "f") ? w(this, ne, "f") : 0, "f");
    else
      return w(this, Ke, "f") === void 0 && Y(this, Ke, setTimeout(() => {
        w(this, B, "m", Qr).call(this);
      }, _), "f"), !0;
  }
  return !1;
}, pt = function() {
  if (w(this, re, "f").size === 0)
    return w(this, ue, "f") && clearInterval(w(this, ue, "f")), Y(this, ue, void 0, "f"), w(this, B, "m", Gr).call(this), !1;
  if (!w(this, Ce, "f")) {
    const u = !w(this, B, "a", Jr);
    if (w(this, B, "a", Vr) && w(this, B, "a", Br)) {
      const _ = w(this, re, "f").dequeue();
      return _ ? (this.emit("active"), _(), u && w(this, B, "m", Vt).call(this), !0) : !1;
    }
  }
  return !1;
}, Vt = function() {
  w(this, Xe, "f") || w(this, ue, "f") !== void 0 || (Y(this, ue, setInterval(() => {
    w(this, B, "m", Bt).call(this);
  }, w(this, et, "f")), "f"), Y(this, vt, Date.now() + w(this, et, "f"), "f"));
}, Bt = function() {
  w(this, Ee, "f") === 0 && w(this, ne, "f") === 0 && w(this, ue, "f") && (clearInterval(w(this, ue, "f")), Y(this, ue, void 0, "f")), Y(this, Ee, w(this, Ze, "f") ? w(this, ne, "f") : 0, "f"), w(this, B, "m", bt).call(this);
}, bt = function() {
  for (; w(this, B, "m", pt).call(this); )
    ;
}, gt = async function(u, _) {
  return new Promise((h) => {
    const I = () => {
      _ && !_() || (this.off(u, I), h());
    };
    this.on(u, I);
  });
};
const qr = (c) => Va({
  locateFile: (u) => `${c}${u.replace("/dist", "")}`,
  printErr: (u) => u.includes("Timestamps are unset in a packet") || u.includes("Read error at pos.") ? void 0 : console.error(u)
});
let qe;
const to = ja(async ({ publicPath: c, length: u, bufferSize: _, randomRead: h, streamRead: I, clearStream: i, attachment: k, subtitle: $ }) => {
  qe || (qe = await qr(c));
  let E = new Uint8Array(0), S, F, O;
  const Q = () => O || (O = new Promise((p, N) => {
    S = p, F = N;
  }), O), z = () => new qe.Remuxer({
    promise: Promise.resolve(),
    length: u,
    bufferSize: _,
    error: (p, N) => {
      console.log("worker error", p, N);
    },
    subtitle: (p, N, W, ...C) => {
      $(p, N, W, ...C);
    },
    attachment: (p, N, W) => {
      const C = new Uint8Array(W), oe = C.buffer.slice(C.byteOffset, C.byteOffset + C.byteLength);
      k(p, N, oe);
    },
    streamRead: async (p) => Promise.race([
      new Promise((N) => {
        H.on("add", function W() {
          H.size !== 0 && (N(void 0), H.off("add", W));
        });
      }).then(() => ({
        buffer: void 0,
        done: !1,
        cancelled: !0
      })),
      I(Number(p)).then(({ buffer: N, done: W, cancelled: C }) => ({
        buffer: N ? new Uint8Array(N) : void 0,
        done: W,
        cancelled: C
      }))
    ]),
    clearStream: () => i(),
    randomRead: async (p, N) => h(Number(p), N).then((W) => ({
      buffer: W ? new Uint8Array(W) : void 0,
      done: !1,
      cancelled: !1
    })),
    write: (p) => {
      const N = new Uint8Array(E.byteLength + p.byteLength);
      N.set(E), N.set(new Uint8Array(p), E.byteLength), E = N;
    },
    flush: async (p, N, W, C, oe) => {
      const de = Number(p), Se = Number(N);
      if (!E.byteLength)
        return !0;
      if (!S)
        throw new Error("No readResultPromiseResolve on libav flush");
      return S({
        isTrailer: oe,
        offset: de,
        buffer: E.buffer,
        pos: Se,
        pts: W,
        duration: C
      }), S = void 0, F = void 0, O = void 0, E = new Uint8Array(0), !1;
    },
    exit: () => {
      const p = F;
      S = void 0, F = void 0, O = void 0, p?.(new Error("exit"));
    }
  });
  let L = z();
  const H = new eo({ concurrency: 1 });
  return {
    init: async () => {
      E = new Uint8Array(0), qe = await qr(c), L = z();
      const p = Q();
      return L.init(), p;
    },
    destroy: () => {
      L.destroy(), L = void 0, qe = void 0, E = new Uint8Array(0);
    },
    seek: (p) => H.add(() => L.seek(p)),
    read: () => H.add(async () => {
      const p = Q();
      return L.read(), p;
    }),
    getInfo: async () => L.getInfo()
  };
}), ro = {
  init: to
};
Wa({
  target: globalThis,
  resolvers: ro
});
globalThis.postMessage("init");
