var extend = Object.assign;
var isObject = function (res) {
    return res !== null && typeof res === 'object';
};
var hasChanged = function (value, oldValue) {
    return !Object.is(value, oldValue);
};

var activeEffect;
var targetMap = new WeakMap();
function track(target, key) {
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, depsMap = new Map());
    }
    var dep = depsMap.get(key);
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
    var depMap = targetMap.get(target);
    if (!depMap) {
        return;
    }
    var dep = depMap.get(key);
    if (dep) {
        triggerEffects(dep);
    }
}
function triggerEffects(dep) {
    dep.forEach(function (effect) {
        if (effect._options && effect._options.scheduler) {
            effect._options.scheduler(effect);
        }
        else {
            effect.run();
        }
    });
}
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, options) {
        this.fn = fn;
        this.deps = [];
        this._options = options;
    }
    ReactiveEffect.prototype.run = function () {
        activeEffect = this;
        var res = this.fn();
        activeEffect = null;
        return res;
    };
    ReactiveEffect.prototype.stop = function () {
        var _this = this;
        if (this.onStop) {
            this.onStop();
        }
        this.deps.forEach(function (dep) {
            dep["delete"](_this);
        });
    };
    return ReactiveEffect;
}());
function effect(fn, options) {
    var _effect = new ReactiveEffect(fn, options);
    extend(_effect, options);
    if (!options || !options.lazy) {
        _effect.run();
    }
    var runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}

function createGetters(isReadonly, isShallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (isShallow === void 0) { isShallow = false; }
    return function get(target, key, receiver) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key, receiver);
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
var get = createGetters(false);
var set = createSetters();
var readonlyGet = createGetters(true);
createGetters(false, true);
var shallowReadonlyGet = createGetters(true, true);
var mutableHandlers = {
    get: get,
    set: set
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key) {
        console.warn("Set operation on key \"".concat(String(key), "\" failed: target is readonly."), target);
        return true;
    }
};
var shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: function (target, key) {
        console.warn("Set operation on key \"".concat(String(key), "\" failed: target is readonly."), target);
        return true;
    }
};

function createReactiveObject(target, baseHandlers) {
    var observed = new Proxy(target, baseHandlers);
    return observed;
}
function reactive(target) {
    return createReactiveObject(target, mutableHandlers);
}
function readonly(target) {
    return createReactiveObject(target, readonlyHandlers);
}
function isReactive(target) {
    return !!target["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
function isReadonly(target) {
    return !!target["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyHandlers);
}

var RefImpl = /** @class */ (function () {
    function RefImpl(value) {
        this.__v_isRef = true;
        if (typeof value === 'object') {
            this._value = reactive(value);
        }
        else {
            this._value = value;
        }
        this.dep = new Set();
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            trackEffects(this.dep);
            return this._value;
        },
        set: function (newValue) {
            if (!hasChanged(this._value, newValue)) {
                return;
            }
            this._value = newValue;
            triggerEffects(this.dep);
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());
function ref(value) {
    return new RefImpl(value);
}
function isRef(target) {
    return !!target.__v_isRef;
}
function unRef(target) {
    return isRef(target) ? target.value : target;
}
var shallowUnWrapHandlers = {
    get: function (target, key) {
        return unRef(Reflect.get(target, key));
    },
    set: function (target, key, value) {
        var oldValue = target[key];
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

var ComputedRefImpl = /** @class */ (function () {
    function ComputedRefImpl(getter) {
        var _this = this;
        this._dirty = true;
        this._effect = new ReactiveEffect(getter, { scheduler: function () {
                _this._dirty = true;
            } });
    }
    Object.defineProperty(ComputedRefImpl.prototype, "value", {
        get: function () {
            if (this._dirty) {
                this._dirty = false;
                this._value = this._effect.run();
            }
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    return ComputedRefImpl;
}());
var computed = function (fn) {
    return new ComputedRefImpl(fn);
};

function createVNode(type, props, children) {
    return {
        type: type,
        props: props,
        children: children
    };
}

function createComponentInstance(vnode) {
    var instance = {
        type: vnode.type,
        props: {},
        subTree: null,
        vnode: vnode
    };
    return instance;
}
function setupComponent(instance) {
    // Todo 函数式组件没有state
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var component = instance.type;
    var setup = component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var component = instance.type;
    console.log(component);
    if (component.render) {
        instance.render = component.render;
    }
}

function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        // 普通的元素
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 组件
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    console.log(instance);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    patch(subTree, container);
}
function processElement(vnode, container) {
    var el = (vnode.el = document.createElement(vnode.type));
    if (vnode.props) {
        patchProps(el, vnode.props);
    }
    if (Array.isArray(vnode.children)) {
        mountChildren(vnode.children, el);
    }
    else if (typeof vnode.children === 'string') {
        el.textContent = vnode.children;
    }
    container.appendChild(el);
}
function mountChildren(children, container) {
    children.forEach(function (child) {
        patch(child, container);
    });
}
function patchProps(el, props) {
    for (var key in props) {
        el.setAttribute(key, props[key]);
    }
}

function createApp(rootComponent) {
    // ...
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            patch(vnode, rootContainer);
        }
    };
}

export { ReactiveEffect, computed, createApp, effect, createVNode as h, isReactive, isReadonly, isRef, proxyRefs, reactive, readonly, ref, shallowReadonly, stop, unRef };
