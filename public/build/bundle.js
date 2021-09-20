
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.6' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
        // find the complete implementation of crypto (msCrypto) on IE11.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    /* src\components\Form.svelte generated by Svelte v3.42.6 */

    const { console: console_1$1 } = globals;
    const file$3 = "src\\components\\Form.svelte";

    function create_fragment$3(ctx) {
    	let form;
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let label1;
    	let t2;
    	let input1;
    	let t3;
    	let label2;
    	let t4;
    	let input2;
    	let t5;
    	let label3;
    	let t6;
    	let input3;
    	let t7;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			label0 = element("label");
    			t0 = text("Namn på item\r\n        ");
    			input0 = element("input");
    			t1 = space();
    			label1 = element("label");
    			t2 = text("Typ av item\r\n        ");
    			input1 = element("input");
    			t3 = space();
    			label2 = element("label");
    			t4 = text("Färg\r\n        ");
    			input2 = element("input");
    			t5 = space();
    			label3 = element("label");
    			t6 = text("Böter för sen inlämning\r\n        ");
    			input3 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Lägg till i bibliotek";
    			input0.required = true;
    			add_location(input0, file$3, 38, 8, 702);
    			add_location(label0, file$3, 36, 4, 663);
    			input1.required = true;
    			add_location(input1, file$3, 42, 8, 797);
    			add_location(label1, file$3, 40, 4, 759);
    			attr_dev(input2, "type", "color");
    			input2.required = true;
    			add_location(input2, file$3, 46, 8, 884);
    			add_location(label2, file$3, 44, 4, 853);
    			attr_dev(input3, "type", "number");
    			input3.required = true;
    			attr_dev(input3, "class", "svelte-4gksgh");
    			add_location(input3, file$3, 50, 8, 1020);
    			attr_dev(label3, "class", "latefee svelte-4gksgh");
    			add_location(label3, file$3, 48, 4, 954);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 56, 4, 1201);
    			attr_dev(form, "class", "svelte-4gksgh");
    			add_location(form, file$3, 35, 0, 611);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(label0, t0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*titel*/ ctx[0]);
    			append_dev(form, t1);
    			append_dev(form, label1);
    			append_dev(label1, t2);
    			append_dev(label1, input1);
    			set_input_value(input1, /*type*/ ctx[1]);
    			append_dev(form, t3);
    			append_dev(form, label2);
    			append_dev(label2, t4);
    			append_dev(label2, input2);
    			set_input_value(input2, /*color*/ ctx[2]);
    			append_dev(form, t5);
    			append_dev(form, label3);
    			append_dev(label3, t6);
    			append_dev(label3, input3);
    			set_input_value(input3, /*latefee*/ ctx[3]);
    			append_dev(form, t7);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[9]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*titel*/ 1 && input0.value !== /*titel*/ ctx[0]) {
    				set_input_value(input0, /*titel*/ ctx[0]);
    			}

    			if (dirty & /*type*/ 2 && input1.value !== /*type*/ ctx[1]) {
    				set_input_value(input1, /*type*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 4) {
    				set_input_value(input2, /*color*/ ctx[2]);
    			}

    			if (dirty & /*latefee*/ 8 && to_number(input3.value) !== /*latefee*/ ctx[3]) {
    				set_input_value(input3, /*latefee*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Form', slots, []);
    	let titel = '';
    	let type = '';
    	let color = '';
    	let latefee = '50';
    	let { addNewItem } = $$props;

    	function handleSubmit() {
    		console.log('Done');

    		addNewItem({
    			titel,
    			_id: v4(),
    			type,
    			color,
    			latefee,
    			utlånad: false
    		});
    	}

    	const writable_props = ['addNewItem'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		titel = this.value;
    		$$invalidate(0, titel);
    	}

    	function input1_input_handler() {
    		type = this.value;
    		$$invalidate(1, type);
    	}

    	function input2_input_handler() {
    		color = this.value;
    		$$invalidate(2, color);
    	}

    	function input3_input_handler() {
    		latefee = to_number(this.value);
    		$$invalidate(3, latefee);
    	}

    	$$self.$$set = $$props => {
    		if ('addNewItem' in $$props) $$invalidate(5, addNewItem = $$props.addNewItem);
    	};

    	$$self.$capture_state = () => ({
    		uuidv4: v4,
    		titel,
    		type,
    		color,
    		latefee,
    		addNewItem,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('titel' in $$props) $$invalidate(0, titel = $$props.titel);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('latefee' in $$props) $$invalidate(3, latefee = $$props.latefee);
    		if ('addNewItem' in $$props) $$invalidate(5, addNewItem = $$props.addNewItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		titel,
    		type,
    		color,
    		latefee,
    		handleSubmit,
    		addNewItem,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { addNewItem: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*addNewItem*/ ctx[5] === undefined && !('addNewItem' in props)) {
    			console_1$1.warn("<Form> was created without expected prop 'addNewItem'");
    		}
    	}

    	get addNewItem() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addNewItem(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Bibliotekartikel.svelte generated by Svelte v3.42.6 */

    const file$2 = "src\\components\\Bibliotekartikel.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let span2;
    	let span0;
    	let t1;
    	let t2_value = /*articleData*/ ctx[0]['_id'] + "";
    	let t2;
    	let t3;
    	let span1;
    	let em;
    	let t4_value = /*articleData*/ ctx[0].titel + "";
    	let t4;
    	let t5;
    	let u;
    	let t6_value = /*articleData*/ ctx[0].type + "";
    	let t6;
    	let t7;
    	let button;
    	let t8_value = (/*articleData*/ ctx[0].utlånad ? 'Utlånad' : 'Låna') + "";
    	let t8;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span2 = element("span");
    			span0 = element("span");
    			t1 = text("id: ");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			em = element("em");
    			t4 = text(t4_value);
    			t5 = text(" of type: ");
    			u = element("u");
    			t6 = text(t6_value);
    			t7 = space();
    			button = element("button");
    			t8 = text(t8_value);
    			if (!src_url_equal(img.src, img_src_value = /*articleData*/ ctx[0].coverArt)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "30");
    			attr_dev(img, "width", "30");
    			attr_dev(img, "alt", img_alt_value = /*articleData*/ ctx[0].titel + /*articleData*/ ctx[0].color);
    			attr_dev(img, "class", "svelte-hbv8kl");
    			add_location(img, file$2, 45, 4, 800);
    			attr_dev(span0, "class", "id-span svelte-hbv8kl");
    			add_location(span0, file$2, 52, 8, 983);
    			add_location(em, file$2, 54, 12, 1085);
    			add_location(u, file$2, 54, 50, 1123);
    			attr_dev(span1, "class", "inner-span svelte-hbv8kl");
    			add_location(span1, file$2, 53, 8, 1046);
    			attr_dev(span2, "class", "outer-span svelte-hbv8kl");
    			add_location(span2, file$2, 51, 4, 948);
    			button.disabled = button_disabled_value = /*articleData*/ ctx[0].utlånad;
    			attr_dev(button, "class", "svelte-hbv8kl");
    			add_location(button, file$2, 57, 4, 1184);
    			attr_dev(div, "class", "svelte-hbv8kl");
    			add_location(div, file$2, 44, 0, 789);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span2);
    			append_dev(span2, span0);
    			append_dev(span0, t1);
    			append_dev(span0, t2);
    			append_dev(span2, t3);
    			append_dev(span2, span1);
    			append_dev(span1, em);
    			append_dev(em, t4);
    			append_dev(span1, t5);
    			append_dev(span1, u);
    			append_dev(u, t6);
    			append_dev(div, t7);
    			append_dev(div, button);
    			append_dev(button, t8);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*toggleAvailability*/ ctx[1](/*articleData*/ ctx[0]))) /*toggleAvailability*/ ctx[1](/*articleData*/ ctx[0]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*articleData*/ 1 && !src_url_equal(img.src, img_src_value = /*articleData*/ ctx[0].coverArt)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*articleData*/ 1 && img_alt_value !== (img_alt_value = /*articleData*/ ctx[0].titel + /*articleData*/ ctx[0].color)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*articleData*/ 1 && t2_value !== (t2_value = /*articleData*/ ctx[0]['_id'] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*articleData*/ 1 && t4_value !== (t4_value = /*articleData*/ ctx[0].titel + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*articleData*/ 1 && t6_value !== (t6_value = /*articleData*/ ctx[0].type + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*articleData*/ 1 && t8_value !== (t8_value = (/*articleData*/ ctx[0].utlånad ? 'Utlånad' : 'Låna') + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*articleData*/ 1 && button_disabled_value !== (button_disabled_value = /*articleData*/ ctx[0].utlånad)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bibliotekartikel', slots, []);
    	let { articleData = {} } = $$props;
    	let { toggleAvailability } = $$props;
    	const writable_props = ['articleData', 'toggleAvailability'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bibliotekartikel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('articleData' in $$props) $$invalidate(0, articleData = $$props.articleData);
    		if ('toggleAvailability' in $$props) $$invalidate(1, toggleAvailability = $$props.toggleAvailability);
    	};

    	$$self.$capture_state = () => ({ articleData, toggleAvailability });

    	$$self.$inject_state = $$props => {
    		if ('articleData' in $$props) $$invalidate(0, articleData = $$props.articleData);
    		if ('toggleAvailability' in $$props) $$invalidate(1, toggleAvailability = $$props.toggleAvailability);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [articleData, toggleAvailability];
    }

    class Bibliotekartikel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { articleData: 0, toggleAvailability: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bibliotekartikel",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleAvailability*/ ctx[1] === undefined && !('toggleAvailability' in props)) {
    			console.warn("<Bibliotekartikel> was created without expected prop 'toggleAvailability'");
    		}
    	}

    	get articleData() {
    		throw new Error("<Bibliotekartikel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set articleData(value) {
    		throw new Error("<Bibliotekartikel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleAvailability() {
    		throw new Error("<Bibliotekartikel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleAvailability(value) {
    		throw new Error("<Bibliotekartikel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Bibliotek.svelte generated by Svelte v3.42.6 */

    const { Error: Error_1, console: console_1 } = globals;
    const file$1 = "src\\components\\Bibliotek.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (129:0) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [.../*libraryArticles*/ ctx[1]].filter(func);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*toggleAvailability, libraryArticles*/ 6) {
    				each_value_1 = [.../*libraryArticles*/ ctx[1]].filter(func);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(129:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (125:0) {#if toggleShowAll}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*libraryArticles*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*toggleAvailability, libraryArticles*/ 6) {
    				each_value = /*libraryArticles*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(125:0) {#if toggleShowAll}",
    		ctx
    	});

    	return block;
    }

    // (130:4) {#each [...libraryArticles].filter((item) => !item.utlånad) as articleData}
    function create_each_block_1(ctx) {
    	let bibliotekartikel;
    	let current;

    	bibliotekartikel = new Bibliotekartikel({
    			props: {
    				toggleAvailability: /*toggleAvailability*/ ctx[2],
    				articleData: /*articleData*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(bibliotekartikel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bibliotekartikel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bibliotekartikel_changes = {};
    			if (dirty & /*libraryArticles*/ 2) bibliotekartikel_changes.articleData = /*articleData*/ ctx[10];
    			bibliotekartikel.$set(bibliotekartikel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bibliotekartikel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bibliotekartikel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bibliotekartikel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(130:4) {#each [...libraryArticles].filter((item) => !item.utlånad) as articleData}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {#each libraryArticles as articleData}
    function create_each_block(ctx) {
    	let bibliotekartikel;
    	let current;

    	bibliotekartikel = new Bibliotekartikel({
    			props: {
    				toggleAvailability: /*toggleAvailability*/ ctx[2],
    				articleData: /*articleData*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(bibliotekartikel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bibliotekartikel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bibliotekartikel_changes = {};
    			if (dirty & /*libraryArticles*/ 2) bibliotekartikel_changes.articleData = /*articleData*/ ctx[10];
    			bibliotekartikel.$set(bibliotekartikel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bibliotekartikel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bibliotekartikel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bibliotekartikel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(126:4) {#each libraryArticles as articleData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h2;
    	let t1;
    	let form;
    	let t2;
    	let div1;
    	let div0;
    	let label0;
    	let span0;
    	let t4;
    	let input0;
    	let t5;
    	let label1;
    	let span1;
    	let t7;
    	let input1;
    	let t8;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	form = new Form({
    			props: { addNewItem: /*addNewItem*/ ctx[3] },
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*toggleShowAll*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Välkommen till biblioteket!";
    			t1 = space();
    			create_component(form.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Visa alla";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Visa endast tillgängliga";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(h2, file$1, 99, 0, 2497);
    			add_location(span0, file$1, 104, 12, 2633);
    			attr_dev(input0, "name", "toggleShowAll");
    			attr_dev(input0, "type", "radio");
    			input0.__value = true;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[6][0].push(input0);
    			add_location(input0, file$1, 105, 12, 2671);
    			attr_dev(label0, "class", "svelte-lhl22f");
    			add_location(label0, file$1, 103, 8, 2612);
    			add_location(span1, file$1, 113, 12, 2884);
    			attr_dev(input1, "name", "toggleShowAll");
    			attr_dev(input1, "type", "radio");
    			input1.__value = false;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[6][0].push(input1);
    			add_location(input1, file$1, 114, 12, 2937);
    			attr_dev(label1, "class", "svelte-lhl22f");
    			add_location(label1, file$1, 112, 8, 2863);
    			attr_dev(div0, "class", "inner svelte-lhl22f");
    			add_location(div0, file$1, 102, 4, 2583);
    			attr_dev(div1, "class", "outer svelte-lhl22f");
    			add_location(div1, file$1, 101, 0, 2558);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(form, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t4);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*toggleShowAll*/ ctx[0];
    			append_dev(div0, t5);
    			append_dev(div0, label1);
    			append_dev(label1, span1);
    			append_dev(label1, t7);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*toggleShowAll*/ ctx[0];
    			insert_dev(target, t8, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[5]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toggleShowAll*/ 1) {
    				input0.checked = input0.__value === /*toggleShowAll*/ ctx[0];
    			}

    			if (dirty & /*toggleShowAll*/ 1) {
    				input1.checked = input1.__value === /*toggleShowAll*/ ctx[0];
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			destroy_component(form, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input1), 1);
    			if (detaching) detach_dev(t8);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = item => !item.utlånad;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bibliotek', slots, []);

    	async function getLibraryArticles() {
    		const res = await fetch(`http://localhost:3000/content`);
    		const data = await res.json();

    		if (res.ok) {
    			$$invalidate(1, libraryArticles = [...data]);
    			return libraryArticles;
    		} else {
    			throw new Error(res);
    		}
    	}

    	let promise;
    	let triggerNewRender = 0;

    	onMount(() => {
    		promise = getLibraryArticles();
    	});

    	function toggleAvailability(articleData) {
    		console.log('articleData: ', articleData.utlånad);

    		const newData = {
    			...articleData,
    			utlånad: !articleData.utlånad
    		};

    		console.log('newData: ', newData.utlånad);

    		fetch(`http://localhost:3000/content/${articleData['id']}`, {
    			method: 'PUT',
    			headers: { 'Content-type': 'application/json' },
    			body: JSON.stringify(newData)
    		}).then(res => {
    			return res.json();
    		}).then(data => {
    			console.log('type: ', data.type);
    			console.log('data: ', data.utlånad);
    			console.table(data);
    			$$invalidate(4, triggerNewRender += 1);
    		});
    	}

    	function addNewItem(articleData) {
    		fetch(`http://localhost:3000/content`, {
    			method: 'POST',
    			headers: { 'Content-type': 'application/json' },
    			body: JSON.stringify(articleData)
    		}).then(res => {
    			return res.json();
    		}).then(data => {
    			console.table(data);
    			$$invalidate(4, triggerNewRender += 1);
    		});
    	}

    	let toggleShowAll = true;
    	let libraryArticles = [];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Bibliotek> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_change_handler() {
    		toggleShowAll = this.__value;
    		$$invalidate(0, toggleShowAll);
    	}

    	function input1_change_handler() {
    		toggleShowAll = this.__value;
    		$$invalidate(0, toggleShowAll);
    	}

    	$$self.$capture_state = () => ({
    		Form,
    		onMount,
    		Bibliotekartikel,
    		getLibraryArticles,
    		promise,
    		triggerNewRender,
    		toggleAvailability,
    		addNewItem,
    		toggleShowAll,
    		libraryArticles
    	});

    	$$self.$inject_state = $$props => {
    		if ('promise' in $$props) promise = $$props.promise;
    		if ('triggerNewRender' in $$props) $$invalidate(4, triggerNewRender = $$props.triggerNewRender);
    		if ('toggleShowAll' in $$props) $$invalidate(0, toggleShowAll = $$props.toggleShowAll);
    		if ('libraryArticles' in $$props) $$invalidate(1, libraryArticles = $$props.libraryArticles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*triggerNewRender*/ 16) {
    			{
    				console.log('Data mutated:', triggerNewRender);
    				promise = getLibraryArticles();
    			}
    		}

    		if ($$self.$$.dirty & /*toggleShowAll*/ 1) {
    			console.log('Show all toggled to: ', toggleShowAll);
    		}
    	};

    	return [
    		toggleShowAll,
    		libraryArticles,
    		toggleAvailability,
    		addNewItem,
    		triggerNewRender,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler
    	];
    }

    class Bibliotek extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bibliotek",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.6 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let i;
    	let t2;
    	let bibliotek;
    	let current;
    	bibliotek = new Bibliotek({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Biblioteket Online - ");
    			i = element("i");
    			i.textContent = "Ditt bibliotek online";
    			t2 = space();
    			create_component(bibliotek.$$.fragment);
    			add_location(i, file, 25, 29, 418);
    			attr_dev(h1, "class", "svelte-nhm522");
    			add_location(h1, file, 25, 4, 393);
    			attr_dev(main, "class", "svelte-nhm522");
    			add_location(main, file, 24, 0, 382);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(h1, i);
    			append_dev(main, t2);
    			mount_component(bibliotek, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bibliotek.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bibliotek.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(bibliotek);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Bibliotek });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
