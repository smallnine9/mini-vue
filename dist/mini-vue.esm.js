function toDisplayString(value) {
    return String(value);
}

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
const isString = (value) => {
    return typeof value === 'string';
};

const Fragment = Symbol('v-fgt');
const Text = Symbol('v-text');
function createVNode(type, props, children) {
    return {
        type,
        props,
        key: props && props.key,
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
    if (typeof children === 'string' || typeof children === 'number') {
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

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
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
        vnode,
        component: null,
        next: null,
        isMounted: false
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
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component && !component.render) {
        if (component.template) {
            component.render = compiler(component.template);
        }
    }
    instance.render = component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
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

const queue = [];
let isFlushing = false;
function nextTick(fn) {
    const p = Promise.resolve();
    return fn ? p.then(fn) : p;
}
function queueJobs(fn) {
    if (!queue.includes(fn)) {
        queue.push(fn);
        queueFlash();
    }
}
function queueFlash() {
    if (isFlushing)
        return;
    isFlushing = true;
    nextTick(flushJobs);
}
function flushJobs() {
    let job;
    while ((job = queue.shift())) {
        job();
    }
    queue.length = 0;
    isFlushing = false;
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, setElementText: hostSetElementText, remove: hostRemove } = options;
    function render(vnode, container) {
        if (vnode) {
            patch(null, vnode, container, null, null);
        }
        else {
            container.innerHTML = '';
        }
    }
    function patch(n1, n2, container, anchor = null, parentComponent = null) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1) {
                    processElement(n1, n2, container, anchor, parentComponent);
                }
                else if (shapeFlag & 4) {
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        const { children } = n2;
        children.forEach(child => {
            patch(null, child, container, null, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parent) {
        if (!n1) {
            mountComponent(n2, container, parent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2, container, parent) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
    }
    function shouldUpdateComponent(n1, n2) {
        const { props: prevProps } = n1;
        const { props: nextProps } = n2;
        return prevProps !== nextProps;
    }
    function mountComponent(vnode, container, parentComponent) {
        const instance = (vnode.component = createComponentInstance(vnode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log('effect mounted!');
                const proxy = instance.proxy;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                patch(null, subTree, container, null, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const nextVnode = instance.next;
                if (nextVnode) {
                    updateComponentPreRender(instance, nextVnode);
                }
                console.log('effect update!');
                const prevSubTree = instance.subTree;
                const proxy = instance.proxy;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                patch(prevSubTree, subTree, container, null, instance);
            }
        }, {
            scheduler: () => {
                queueJobs(instance.update);
            }
        });
    }
    function updateComponentPreRender(instance, nextVnode) {
        nextVnode.component = instance;
        instance.vnode = nextVnode;
        instance.next = null;
        instance.props = nextVnode.props;
    }
    function processElement(n1, n2, container, anchor, parentComponent) {
        console.log('processelement');
        if (!n1) {
            mountElement(n2, container, anchor, parentComponent);
        }
        else {
            updateElement(n1, n2);
        }
    }
    function mountElement(vnode, container, anchor, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        if (vnode.props) {
            for (const key in vnode.props) {
                const value = vnode.props[key];
                hostPatchProp(el, key, null, value);
            }
        }
        const { shapeFlag } = vnode;
        if (shapeFlag & 16) {
            mountChildren(vnode.children, el, parentComponent);
        }
        else if (shapeFlag & 8) {
            hostSetElementText(el, vnode.children);
        }
        hostInsert(el, container, anchor);
    }
    function updateElement(n1, n2, container, anchor) {
        const oldProps = n1.props;
        const newProps = n2.props;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el);
    }
    function patchChildren(n1, n2, container, anchor) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1;
        const { shapeFlag: ShapeFlag, children: c2 } = n2;
        if (ShapeFlag & 8) {
            if (prevShapeFlag & 16) {
                unMountChildren(c1, container);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else if (ShapeFlag & 16) {
            if (prevShapeFlag & 8) {
                hostCreateElement(container, '');
                mountChildren(c2, container, null);
            }
            else {
                patchKeyedChildren(c1, c2, container);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        while (i <= e1 && i <= e2) {
            if (isSameVnodeType(c1[i], c2[i])) {
                patch(c1[i], c2[i], container, null);
                i++;
            }
            else {
                break;
            }
        }
        console.log('i:', i);
        while (i <= e1 && i <= e2) {
            if (isSameVnodeType(c1[e1], c2[e2])) {
                patch(c1[e1], c2[e2], container, null);
                e1--;
                e2--;
            }
            else {
                break;
            }
        }
        console.log('e1:', e1, 'e2:', e2);
        let anchorIndex = e2 + 1;
        let anchor = anchorIndex < c2.length ? c2[anchorIndex].el : null;
        if (i > e1) {
            while (i <= e2) {
                patch(null, c2[i], container, anchor, null);
                i++;
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            let s1 = i, s2 = i;
            let moved = false;
            let pos = 0;
            let toBePatched = e2 - s2 + 1;
            const newKeyIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                newKeyIndexMap.set(c2[i].key, i);
            }
            const newIndexToOldIndexMap = new Array(e2 - s2 + 1).fill(0);
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = newKeyIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVnodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    if (newIndex < pos) {
                        moved = true;
                    }
                    else {
                        pos = newIndex;
                    }
                    patch(prevChild, c2[newIndex], container, null, null);
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i;
                let nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, anchor, null);
                }
                else if (moved) {
                    if (i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function getSequence(arr) {
        const p = arr.slice();
        const result = [0];
        let i, j, u, v, c;
        const len = arr.length;
        for (i = 0; i < len; i++) {
            const arrI = arr[i];
            if (arrI !== 0) {
                j = result[result.length - 1];
                if (arr[j] < arrI) {
                    p[i] = j;
                    result.push(i);
                    continue;
                }
                u = 0;
                v = result.length - 1;
                while (u < v) {
                    c = (u + v) >> 1;
                    if (arr[result[c]] < arrI) {
                        u = c + 1;
                    }
                    else {
                        v = c;
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1];
                    }
                    result[u] = i;
                }
            }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
            result[u] = v;
            v = p[v];
        }
        return result;
    }
    function isSameVnodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function unMountChildren(children, container) {
        for (const child of children) {
            container.removeChild(child.el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null);
                }
            }
        }
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach(child => {
            patch(null, child, container, null, parentComponent);
        });
    }
    function processText(n1, n2, container) {
        container.appendChild(document.createTextNode(vnode.children));
    }
    return {
        createApp: createAppAPI(render)
    };
}

function patchProp(el, key, prevVal, nextVal) {
    const isOn = /^on[A-Z]/.test(key);
    if (isOn) {
        const func = nextVal;
        el.addEventListener(key.slice(2).toLocaleLowerCase(), func);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function createElement(type) {
    return document.createElement(type);
}
function insert(el, container, anchor) {
    container.insertBefore(el, anchor);
}
function setElementText(el, text) {
    el.textContent = text;
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
const options = {
    createElement,
    patchProp,
    insert,
    setElementText,
    remove
};
function createApp(...args) {
    return createRenderer(options).createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ReactiveEffect: ReactiveEffect,
    computed: computed,
    createApp: createApp,
    createElementVNode: createVNode,
    createRenderer: createRenderer,
    createTextVnode: createTextVnode,
    effect: effect,
    h: createVNode,
    inject: inject,
    isReactive: isReactive,
    isReadonly: isReadonly,
    isRef: isRef,
    nextTick: nextTick,
    provide: provide,
    proxyRefs: proxyRefs,
    reactive: reactive,
    readonly: readonly,
    ref: ref,
    registerRuntimeCompiler: registerRuntimeCompiler,
    shallowReadonly: shallowReadonly,
    stop: stop,
    toDisplayString: toDisplayString,
    unRef: unRef
});

const TO_DISPLAY_STRING = Symbol('toDisplayString');
const CREATE_ELEMENT_VNODE = Symbol('createElementVNode');
const helperMapName = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    genFunctionPreamble(ast, context);
    const functionName = 'render';
    const args = ['_ctx', '_cache'];
    const signature = args.join(', ');
    push(`function ${functionName}(${signature}){`);
    push('return ');
    genNode(ast.codegenNode, context);
    push('}');
    return {
        code: context.code
    };
}
function genFunctionPreamble(node, context) {
    const { push, helper } = context;
    const VueBinging = 'Vue';
    const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    if (node.helpers.length > 0) {
        push(`const { ${node.helpers.map(aliasHelper).join(',\n')} } = ${VueBinging}`);
    }
    push('\n');
    push('return ');
}
function genNode(node, context) {
    switch (node.type) {
        case 3:
            genText(node, context);
            break;
        case 1:
            genInterpolation(node, context);
            break;
        case 2:
            genExpression(node, context);
            break;
        case 4:
            genElement(node, context);
            break;
        case 5:
            genCompoundExpression(node, context);
            break;
    }
}
function genCompoundExpression(node, context) {
    const { push } = context;
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, props, children } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    console.log(children);
    genNodeList(genNullable([tag, props, children]), context);
    push(")");
}
function genNodeList(children, context) {
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
        if (i < children.length - 1) {
            push(', ');
        }
    }
}
function genNullable(args) {
    return args.map(arg => arg || 'null');
}
function genExpression(node, context) {
    const { push } = context;
    push(node.content);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(')');
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function createCodegenContext() {
    const context = {
        code: '',
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        }
    };
    return context;
}

var TagType;
(function (TagType) {
    TagType[TagType["START"] = 0] = "START";
    TagType[TagType["END"] = 1] = "END";
})(TagType || (TagType = {}));
function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function createParserContext(content) {
    return {
        source: content
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        const s = context.source;
        if (s.startsWith('<')) {
            if (/[a-z]/.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        else if (context.source.startsWith('{{')) {
            node = parseInterpolation(context);
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestors) {
    const s = context.source;
    if (s.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (tag && startWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    return !s;
}
function parseInterpolation(context) {
    const openDelimiter = '{{';
    const endDelimiter = '}}';
    const endIndex = context.source.indexOf(endDelimiter, endDelimiter.length);
    advanceBy(context, openDelimiter.length);
    const rawContentLength = endIndex - openDelimiter.length;
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    advanceBy(context, endDelimiter.length);
    return {
        type: 1,
        content: {
            type: 2,
            content
        }
    };
}
function parseText(context) {
    const endTag = ['<', '{{'];
    let endIndex = context.source.length;
    for (let i = 0; i < endTag.length; i++) {
        let index = context.source.indexOf(endTag[i]);
        if (index !== -1 && index < endIndex) {
            endIndex = index;
        }
    }
    const text = parseTextData(context, endIndex);
    return {
        type: 3,
        content: text
    };
}
function parseTextData(context, length) {
    const text = context.source.slice(0, length);
    advanceBy(context, length);
    return text;
}
function createRoot(children) {
    return {
        type: 0,
        children
    };
}
function parseElement(context, ancestors) {
    const element = parseTag(context, 0);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop(element);
    if (startWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1);
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    return element;
}
function startWithEndTagOpen(source, tag) {
    return source.slice(2, 2 + tag.length) === tag;
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type === 1)
        return;
    return {
        type: 4,
        tag
    };
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type === 4) {
        root.codegenNode = root.children[0].codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
}
function traverseNode(node, context) {
    const { nodeTransforms } = context;
    switch (node.type) {
        case 1:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 0:
        case 4:
            traverseChildren(node, context);
            break;
    }
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        transform(node, context);
    }
}
function traverseChildren(node, context) {
    const { children } = node;
    for (let i = 0; i < children.length; i++) {
        traverseNode(children[i], context);
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}

var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["ROOT"] = 0] = "ROOT";
    NodeTypes[NodeTypes["INTERPOLATION"] = 1] = "INTERPOLATION";
    NodeTypes[NodeTypes["SIMPLE_EXPRESSION"] = 2] = "SIMPLE_EXPRESSION";
    NodeTypes[NodeTypes["TEXT"] = 3] = "TEXT";
    NodeTypes[NodeTypes["ELEMENT"] = 4] = "ELEMENT";
    NodeTypes[NodeTypes["COMPOUND_EXPRESSION"] = 5] = "COMPOUND_EXPRESSION";
})(NodeTypes || (NodeTypes = {}));
function createVNodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: 4,
        tag,
        props,
        children
    };
}

function transformElement(node, context) {
    if (node.type === 4) {
        const vnodeTag = `'${node.tag}'`;
        let vnodeProps;
        const children = node.children;
        let vnodeChildren = children[0];
        node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
    }
}

function transformExpression(node) {
    if (node.type === 1) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return (node.type === 3 || node.type === 1);
}

function transformText(node) {
    if (node.type === 4) {
        const { children } = node;
        let currentContainer;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (isText(child)) {
                for (let j = i + 1; j < children.length; j++) {
                    let next = children[j];
                    if (isText(next)) {
                        if (!currentContainer) {
                            currentContainer = children[i] = {
                                type: 5,
                                children: [child]
                            };
                        }
                        currentContainer.children.push(" + ");
                        currentContainer.children.push(next);
                        children.splice(j, 1);
                        j--;
                    }
                    else {
                        currentContainer = undefined;
                        break;
                    }
                }
            }
        }
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformText, transformElement],
    });
    return generate(ast);
}

function complileToFunction(template) {
  // Todo 编译模板
  const { code } = baseCompile(template);
  const render = new Function('Vue', code)(runtimeDom);
  return render
}

registerRuntimeCompiler(complileToFunction);

export { ReactiveEffect, computed, createApp, createVNode as createElementVNode, createRenderer, createTextVnode, effect, createVNode as h, inject, isReactive, isReadonly, isRef, nextTick, provide, proxyRefs, reactive, readonly, ref, registerRuntimeCompiler, shallowReadonly, stop, toDisplayString, unRef };
//# sourceMappingURL=mini-vue.esm.js.map
