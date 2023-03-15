(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MiniVue = {}));
})(this, (function (exports) { 'use strict';

    function add(a, b) {
        return a + b;
    }
    // add('1',2)  when running rollup, here we are getting error，so we comment it 使用rollup打包时，这里我们会得到一个错误，所以我们注释掉

    exports.add = add;

}));
