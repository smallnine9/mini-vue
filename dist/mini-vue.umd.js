(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MiniVue = {}));
})(this, (function (exports) { 'use strict';

    const extend = Object.assign;
    const isObject = (res) => {
        return res !== null && typeof res === 'object';
    };
    const hasChanged = (value, oldValue) => {
        return !Object.is(value, oldValue);
    };
    const hasKey = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
    const camelizeRE = /-(\w)/g;
    const camelize = (str) => {
        return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
    };
    const capitalize = (str) => {
        return str[0].toUpperCase() + str.slice(1);
    };
    const toHandlerKey = (str) => {
        return str ? `on${capitalize(str)}` : ``;
    };

    let activeEffect;
    const targetMap = new WeakMap();
    function track(target, key) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, depsMap = new Map());
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, dep = new Set());
        }
        trackEffects(dep);
    }
    function trackEffects(dep) {
        if (activeEffect) {
            dep.add(activeEffect);
            activeEffect.deps.push(dep);
        }
    }
    function trigger(target, key) {
        const depMap = targetMap.get(target);
        if (!depMap) {
            return;
        }
        const dep = depMap.get(key);
        if (dep) {
            triggerEffects(dep);
        }
    }
    function triggerEffects(dep) {
        dep.forEach(effect => {
            if (effect._options && effect._options.scheduler) {
                effect._options.scheduler(effect);
            }
            else {
                effect.run();
            }
        });
    }
    class ReactiveEffect {
        constructor(fn, options) {
            this.fn = fn;
            this.deps = [];
            this._options = options;
        }
        run() {
            activeEffect = this;
            const res = this.fn();
            activeEffect = null;
            return res;
        }
        stop() {
            if (this.onStop) {
                this.onStop();
            }
            this.deps.forEach(dep => {
                dep.delete(this);
            });
        }
    }
    function effect(fn, options) {
        const _effect = new ReactiveEffect(fn, options);
        extend(_effect, options);
        if (!options || !options.lazy) {
            _effect.run();
        }
        const runner = _effect.run.bind(_effect);
        runner.effect = _effect;
        return runner;
    }
    function stop(runner) {
        runner.effect.stop();
    }

    function createGetters(isReadonly = false, isShallow = false) {
        return function get(target, key, receiver) {
            if (key === "__v_isReactive") {
                return !isReadonly;
            }
            else if (key === "__v_isReadonly") {
                return isReadonly;
            }
            const res = Reflect.get(target, key, receiver);
            if (!isReadonly) {
                track(target, key);
            }
            if (isShallow) {
                return res;
            }
            if (isObject(res)) {
                return isReadonly ? readonly(res) : reactive(res);
            }
            return res;
        };
    }
    function createSetters() {
        return function set(target, key, value, receiver) {
            Reflect.set(target, key, value, receiver);
            trigger(target, key);
            return true;
        };
    }
    const get = createGetters(false);
    const set = createSetters();
    const readonlyGet = createGetters(true);
    const shallowReadonlyGet = createGetters(true, true);
    const mutableHandlers = {
        get,
        set
    };
    const readonlyHandlers = {
        get: readonlyGet,
        set(target, key) {
            console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
            return true;
        }
    };
    const shallowReadonlyHandlers = {
        get: shallowReadonlyGet,
        set(target, key) {
            console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
            return true;
        }
    };

    var ReactiveFlags;
    (function (ReactiveFlags) {
        ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
        ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
    })(ReactiveFlags || (ReactiveFlags = {}));
    function createReactiveObject(target, baseHandlers) {
        if (!isObject(target)) {
            return target;
        }
        const observed = new Proxy(target, baseHandlers);
        return observed;
    }
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers);
    }
    function readonly(target) {
        return createReactiveObject(target, readonlyHandlers);
    }
    function isReactive(target) {
        return !!target["__v_isReactive"];
    }
    function isReadonly(target) {
        return !!target["__v_isReadonly"];
    }
    function shallowReadonly(target) {
        return createReactiveObject(target, shallowReadonlyHandlers);
    }

    class RefImpl {
        constructor(value) {
            this.__v_isRef = true;
            if (typeof value === 'object') {
                this._value = reactive(value);
            }
            else {
                this._value = value;
            }
            this.dep = new Set();
        }
        get value() {
            trackEffects(this.dep);
            return this._value;
        }
        set value(newValue) {
            if (!hasChanged(this._value, newValue)) {
                return;
            }
            this._value = newValue;
            triggerEffects(this.dep);
        }
    }
    function ref(value) {
        return new RefImpl(value);
    }
    function isRef(target) {
        return !!target.__v_isRef;
    }
    function unRef(target) {
        return isRef(target) ? target.value : target;
    }
    const shallowUnWrapHandlers = {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            const oldValue = target[key];
            if (isRef(oldValue) && !isRef(value)) {
                oldValue.value = value;
                return true;
            }
            return Reflect.set(target, key, value);
        }
    };
    function proxyRefs(target) {
        return new Proxy(target, shallowUnWrapHandlers);
    }

    class ComputedRefImpl {
        constructor(getter) {
            this._dirty = true;
            this._effect = new ReactiveEffect(getter, { scheduler: () => {
                    this._dirty = true;
                } });
        }
        get value() {
            if (this._dirty) {
                this._dirty = false;
                this._value = this._effect.run();
            }
            return this._value;
        }
    }
    const computed = function (fn) {
        return new ComputedRefImpl(fn);
    };

    const Fragment = Symbol('v-fgt');
    const Text = Symbol('v-text');
    function createVNode(type, props, children) {
        return {
            type,
            props,
            children,
            el: null,
            shapeFlag: getShapeFlag(type, children)
        };
    }
    function getShapeFlag(type, children) {
        let shapeFlag = 0;
        if (typeof type === 'string') {
            shapeFlag |= 1;
        }
        if (isObject(type)) {
            shapeFlag |= 4;
        }
        if (typeof children === 'string') {
            shapeFlag |= 8;
        }
        if (Array.isArray(children)) {
            shapeFlag |= 16;
        }
        if (children && isObject(children)) {
            shapeFlag |= 32;
        }
        return shapeFlag;
    }
    function createTextVnode(text) {
        return createVNode(Text, null, text);
    }

    function initProps(instance, rawProps) {
        instance.props = rawProps || {};
    }

    const publicPropertiesMap = {
        $el: (i) => i.vnode.el,
        $slots: (i) => i.slots
    };
    const PublicInstanceProxyHandlers = {
        get({ _: instance }, key) {
            const { setupState, props } = instance;
            if (hasKey(setupState, key)) {
                return Reflect.get(setupState, key);
            }
            else if (hasKey(props, key)) {
                return Reflect.get(props, key);
            }
            if (key in publicPropertiesMap) {
                return publicPropertiesMap[key](instance);
            }
        }
    };

    function emit(instance, event, ...args) {
        const { props } = instance;
        const handlerKey = toHandlerKey(camelize(event));
        const handler = props[handlerKey];
        handler && handler(...args);
    }

    function initSlots(instance, children) {
        const { vnode } = instance;
        if (vnode.shapeFlag & 32) {
            normalizeObjectSlots(children, (instance.slots = {}));
        }
    }
    function normalizeObjectSlots(rawSlots, slots) {
        for (const key in rawSlots) {
            const value = rawSlots[key];
            if (typeof value === 'function') {
                slots[key] = (props) => normalizeSlotValue(value(props));
            }
        }
    }
    function normalizeSlotValue(value) {
        return Array.isArray(value) ? createVNode(Fragment, null, value) : value;
    }

    let currentInstance = null;
    function createComponentInstance(vnode, parent) {
        const instance = {
            type: vnode.type,
            props: {},
            subTree: null,
            setupState: {},
            provides: parent ? parent.provides : {},
            emit: () => { },
            parent,
            vnode
        };
        instance.emit = emit.bind(null, instance);
        return instance;
    }
    function setupComponent(instance) {
        initProps(instance, instance.vnode.props);
        initSlots(instance, instance.vnode.children);
        setupStatefulComponent(instance);
    }
    function setupStatefulComponent(instance) {
        currentInstance = instance;
        const component = instance.type;
        instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
        const setup = component.setup;
        if (setup) {
            const emit = instance.emit;
            const setupResult = setup(shallowReadonly(instance.props), { emit });
            handleSetupResult(instance, setupResult);
        }
        currentInstance = null;
    }
    function handleSetupResult(instance, setupResult) {
        if (isObject(setupResult)) {
            instance.setupState = setupResult;
        }
        finishComponentSetup(instance);
    }
    function finishComponentSetup(instance) {
        const component = instance.type;
        if (component.render) {
            instance.render = component.render;
        }
    }
    function getCurrentInstance() {
        return currentInstance;
    }

    function provide(key, value) {
        const currentInstance = getCurrentInstance();
        if (currentInstance) {
            let { provides } = currentInstance;
            const parentProvides = currentInstance.parent && currentInstance.parent.provides;
            if (provides === parentProvides) {
                provides = currentInstance.provides = Object.create(parentProvides);
            }
            provides[key] = value;
        }
    }
    function inject(key, value) {
        const currentInstance = getCurrentInstance();
        if (currentInstance) {
            const { parent } = currentInstance;
            const { provides } = parent || {};
            return provides[key] || value;
        }
    }

    function createAppAPI(render) {
        return function creaateApp(rootComponent) {
            const app = {
                mount(rootContainer) {
                    const vnode = createVNode(rootComponent);
                    render(vnode, rootContainer);
                }
            };
            return app;
        };
    }

    function createRenderer(options) {
        const { createElement, patchProp, insert } = options;
        function render(vnode, container) {
            if (vnode) {
                patch(vnode, container, null);
            }
            else {
                container.innerHTML = '';
            }
        }
        function patch(vnode, container, parentComponent) {
            const { shapeFlag, type } = vnode;
            switch (type) {
                case Fragment:
                    processFragment(vnode, container, parentComponent);
                    break;
                case Text:
                    processText(vnode, container);
                    break;
                default:
                    if (shapeFlag & 1) {
                        processElement(vnode, container, parentComponent);
                    }
                    else if (shapeFlag & 4) {
                        processComponent(vnode, container, parentComponent);
                    }
            }
        }
        function processFragment(vnode, container, parentComponent) {
            const { children } = vnode;
            children.forEach(child => {
                patch(child, container, parentComponent);
            });
        }
        function processComponent(vnode, container, parent) {
            mountComponent(vnode, container, parent);
        }
        function mountComponent(vnode, container, parentComponent) {
            const instance = createComponentInstance(vnode, parentComponent);
            setupComponent(instance);
            setupRenderEffect(instance, vnode, container);
        }
        function setupRenderEffect(instance, vnode, container) {
            const subTree = instance.render.call(instance.proxy);
            patch(subTree, container, instance);
            vnode.el = subTree.el;
        }
        function processElement(vnode, container, parentComponent) {
            mountElement(vnode, container, parentComponent);
        }
        function mountElement(vnode, container, parentComponent) {
            const el = (vnode.el = createElement(vnode.type));
            if (vnode.props) {
                patchProp(el, vnode.props);
            }
            const { shapeFlag } = vnode;
            if (shapeFlag & 16) {
                mountChildren(vnode.children, el, parentComponent);
            }
            else if (shapeFlag & 8) {
                el.textContent = vnode.children;
            }
            insert(el, container);
        }
        function mountChildren(children, container, parentComponent) {
            children.forEach(child => {
                patch(child, container, parentComponent);
            });
        }
        function processText(vnode, container) {
            container.appendChild(document.createTextNode(vnode.children));
        }
        return {
            createApp: createAppAPI(render)
        };
    }

    function patchProp(el, props) {
        for (let key in props) {
            const isOn = /^on[A-Z]/.test(key);
            if (isOn) {
                const func = props[key];
                el.addEventListener(key.slice(2).toLocaleLowerCase(), func);
            }
            else {
                el.setAttribute(key, props[key]);
            }
        }
    }
    function createElement(type) {
        return document.createElement(type);
    }
    function insert(el, container) {
        container.appendChild(el);
    }
    const options = {
        createElement,
        patchProp,
        insert
    };
    function createApp(...args) {
        return createRenderer(options).createApp(...args);
    }

    exports.ReactiveEffect = ReactiveEffect;
    exports.computed = computed;
    exports.createApp = createApp;
    exports.createRenderer = createRenderer;
    exports.createTextVnode = createTextVnode;
    exports.effect = effect;
    exports.h = createVNode;
    exports.inject = inject;
    exports.isReactive = isReactive;
    exports.isReadonly = isReadonly;
    exports.isRef = isRef;
    exports.provide = provide;
    exports.proxyRefs = proxyRefs;
    exports.reactive = reactive;
    exports.readonly = readonly;
    exports.ref = ref;
    exports.shallowReadonly = shallowReadonly;
    exports.stop = stop;
    exports.unRef = unRef;

}));
//# sourceMappingURL=mini-vue.umd.js.map
