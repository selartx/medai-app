/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "(pages-dir-node)/./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"(pages-dir-node)/./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"(pages-dir-node)/./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/link */ \"(pages-dir-node)/./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const isStart = router.pathname === '/start';\n    const pageBg = isStart ? 'min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-purple-100 text-slate-900' : 'min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 text-pink-900';\n    const headerClass = (isStart ? 'bg-purple-100 border-b border-purple-200' : 'bg-pink-200 border-b border-pink-300') + ' flex justify-between items-center px-6 py-4 shadow-md relative z-50'; // z-50: üzerine bir şey binmesin\n    const loginBtnClass = isStart ? 'bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition' : 'bg-pink-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-500 transition';\n    const signupBtnClass = isStart ? 'bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg border border-purple-400 hover:bg-purple-50 transition' : 'bg-white text-pink-500 font-semibold py-2 px-4 rounded-lg border border-pink-400 hover:bg-pink-100 transition';\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: pageBg,\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"header\", {\n                className: headerClass,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {\n                        href: \"/\",\n                        legacyBehavior: true,\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"a\", {\n                            className: isStart ? 'text-2xl font-bold text-purple-800' : 'text-2xl font-bold text-pink-900',\n                            children: \"MedAI\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n                            lineNumber: 31,\n                            columnNumber: 11\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n                        lineNumber: 30,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"flex space-x-4\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                className: loginBtnClass,\n                                onClick: ()=>router.push('/login'),\n                                children: \"Log In\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n                                lineNumber: 37,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                className: signupBtnClass,\n                                onClick: ()=>router.push('/signup'),\n                                children: \"Sign Up\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n                                lineNumber: 40,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n                        lineNumber: 36,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n                lineNumber: 29,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n                lineNumber: 46,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\musta\\\\Desktop\\\\medai-app\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 28,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1ub2RlKS8uL3NyYy9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQStCO0FBRVM7QUFDWDtBQUU3QixTQUFTRSxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFZO0lBQy9DLE1BQU1DLFNBQVNMLHNEQUFTQTtJQUN4QixNQUFNTSxVQUFVRCxPQUFPRSxRQUFRLEtBQUs7SUFFcEMsTUFBTUMsU0FBU0YsVUFDWCw0RkFDQTtJQUVKLE1BQU1HLGNBQWMsQ0FBQ0gsVUFDakIsNkNBQ0Esc0NBQXFDLElBQ3JDLHdFQUF3RSxpQ0FBaUM7SUFFN0csTUFBTUksZ0JBQWdCSixVQUNsQiwrRkFDQTtJQUVKLE1BQU1LLGlCQUFpQkwsVUFDbkIsdUhBQ0E7SUFFSixxQkFDRSw4REFBQ007UUFBSUMsV0FBV0w7OzBCQUNkLDhEQUFDTTtnQkFBT0QsV0FBV0o7O2tDQUNqQiw4REFBQ1Isa0RBQUlBO3dCQUFDYyxNQUFLO3dCQUFJQyxjQUFjO2tDQUMzQiw0RUFBQ0M7NEJBQUVKLFdBQVdQLFVBQVUsdUNBQXVDO3NDQUFvQzs7Ozs7Ozs7Ozs7a0NBS3JHLDhEQUFDTTt3QkFBSUMsV0FBVTs7MENBQ2IsOERBQUNLO2dDQUFPTCxXQUFXSDtnQ0FBZVMsU0FBUyxJQUFNZCxPQUFPZSxJQUFJLENBQUM7MENBQVc7Ozs7OzswQ0FHeEUsOERBQUNGO2dDQUFPTCxXQUFXRjtnQ0FBZ0JRLFNBQVMsSUFBTWQsT0FBT2UsSUFBSSxDQUFDOzBDQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBTTlFLDhEQUFDakI7Z0JBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7O0FBRzlCO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcbXVzdGFcXERlc2t0b3BcXG1lZGFpLWFwcFxcc3JjXFxwYWdlc1xcX2FwcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xyXG5pbXBvcnQgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcclxuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xyXG5pbXBvcnQgTGluayBmcm9tICduZXh0L2xpbmsnO1xyXG5cclxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xyXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xyXG4gIGNvbnN0IGlzU3RhcnQgPSByb3V0ZXIucGF0aG5hbWUgPT09ICcvc3RhcnQnO1xyXG5cclxuICBjb25zdCBwYWdlQmcgPSBpc1N0YXJ0XHJcbiAgICA/ICdtaW4taC1zY3JlZW4gYmctZ3JhZGllbnQtdG8tYiBmcm9tLXZpb2xldC01MCB2aWEtcHVycGxlLTUwIHRvLXB1cnBsZS0xMDAgdGV4dC1zbGF0ZS05MDAnXHJcbiAgICA6ICdtaW4taC1zY3JlZW4gYmctZ3JhZGllbnQtdG8tYnIgZnJvbS1waW5rLTEwMCB2aWEtcGluay0yMDAgdG8tcGluay0zMDAgdGV4dC1waW5rLTkwMCc7XHJcblxyXG4gIGNvbnN0IGhlYWRlckNsYXNzID0gKGlzU3RhcnRcclxuICAgID8gJ2JnLXB1cnBsZS0xMDAgYm9yZGVyLWIgYm9yZGVyLXB1cnBsZS0yMDAnXHJcbiAgICA6ICdiZy1waW5rLTIwMCBib3JkZXItYiBib3JkZXItcGluay0zMDAnKVxyXG4gICAgKyAnIGZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBweC02IHB5LTQgc2hhZG93LW1kIHJlbGF0aXZlIHotNTAnOyAvLyB6LTUwOiDDvHplcmluZSBiaXIgxZ9leSBiaW5tZXNpblxyXG5cclxuICBjb25zdCBsb2dpbkJ0bkNsYXNzID0gaXNTdGFydFxyXG4gICAgPyAnYmctcHVycGxlLTYwMCB0ZXh0LXdoaXRlIGZvbnQtc2VtaWJvbGQgcHktMiBweC00IHJvdW5kZWQtbGcgaG92ZXI6YmctcHVycGxlLTcwMCB0cmFuc2l0aW9uJ1xyXG4gICAgOiAnYmctcGluay00MDAgdGV4dC13aGl0ZSBmb250LXNlbWlib2xkIHB5LTIgcHgtNCByb3VuZGVkLWxnIGhvdmVyOmJnLXBpbmstNTAwIHRyYW5zaXRpb24nO1xyXG5cclxuICBjb25zdCBzaWdudXBCdG5DbGFzcyA9IGlzU3RhcnRcclxuICAgID8gJ2JnLXdoaXRlIHRleHQtcHVycGxlLTcwMCBmb250LXNlbWlib2xkIHB5LTIgcHgtNCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItcHVycGxlLTQwMCBob3ZlcjpiZy1wdXJwbGUtNTAgdHJhbnNpdGlvbidcclxuICAgIDogJ2JnLXdoaXRlIHRleHQtcGluay01MDAgZm9udC1zZW1pYm9sZCBweS0yIHB4LTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXBpbmstNDAwIGhvdmVyOmJnLXBpbmstMTAwIHRyYW5zaXRpb24nO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBjbGFzc05hbWU9e3BhZ2VCZ30+XHJcbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPXtoZWFkZXJDbGFzc30+XHJcbiAgICAgICAgPExpbmsgaHJlZj1cIi9cIiBsZWdhY3lCZWhhdmlvcj5cclxuICAgICAgICAgIDxhIGNsYXNzTmFtZT17aXNTdGFydCA/ICd0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1wdXJwbGUtODAwJyA6ICd0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1waW5rLTkwMCd9PlxyXG4gICAgICAgICAgICBNZWRBSVxyXG4gICAgICAgICAgPC9hPlxyXG4gICAgICAgIDwvTGluaz5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IHNwYWNlLXgtNFwiPlxyXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9e2xvZ2luQnRuQ2xhc3N9IG9uQ2xpY2s9eygpID0+IHJvdXRlci5wdXNoKCcvbG9naW4nKX0+XHJcbiAgICAgICAgICAgIExvZyBJblxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17c2lnbnVwQnRuQ2xhc3N9IG9uQ2xpY2s9eygpID0+IHJvdXRlci5wdXNoKCcvc2lnbnVwJyl9PlxyXG4gICAgICAgICAgICBTaWduIFVwXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9oZWFkZXI+XHJcblxyXG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNeUFwcDtcclxuIl0sIm5hbWVzIjpbInVzZVJvdXRlciIsIkxpbmsiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInJvdXRlciIsImlzU3RhcnQiLCJwYXRobmFtZSIsInBhZ2VCZyIsImhlYWRlckNsYXNzIiwibG9naW5CdG5DbGFzcyIsInNpZ251cEJ0bkNsYXNzIiwiZGl2IiwiY2xhc3NOYW1lIiwiaGVhZGVyIiwiaHJlZiIsImxlZ2FjeUJlaGF2aW9yIiwiYSIsImJ1dHRvbiIsIm9uQ2xpY2siLCJwdXNoIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(pages-dir-node)/./src/pages/_app.tsx\n");

/***/ }),

/***/ "(pages-dir-node)/./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("(pages-dir-node)/./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();