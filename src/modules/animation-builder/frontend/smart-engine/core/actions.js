/**
 * Logic Command Dispatcher
 * Handles "do" block in callbacks: { "cmd": "timeline.play", "args": ["id"] }
 */
export class ActionDispatcher {
    constructor(mediator) {
        this.mediator = mediator;
        this.commands = new Map();

        this.registerDefaults();
    }

    register(cmd, fn) {
        this.commands.set(cmd, fn);
    }

    execute(action, context) {
        const fn = this.commands.get(action.cmd);
        if (fn) {
            // Support both 'args' array and legacy 'ref' property
            const args = action.args || (action.ref ? [action.ref] : []);
            fn(args, context, this.mediator);
        } else {
            console.warn(`[ActionDispatcher] Unknown command: ${action.cmd}`);
        }
    }

    registerDefaults() {
        // Timeline controls
        this.register("timeline.play", (args, ctx, med) => {
            med.request("timeline.play", args[0]);
        });

        this.register("timeline.pause", (args, ctx, med) => {
            med.request("timeline.pause", args[0]);
        });

        this.register("timeline.reverse", (args, ctx, med) => {
            med.request("timeline.reverse", args[0]);
        });

        this.register("timeline.restart", (args, ctx, med) => {
            med.request("timeline.restart", args[0]);
        });

        this.register("timeline.resume", (args, ctx, med) => {
            med.request("timeline.resume", args[0]);
        });

        this.register("timeline.toggle", (args, ctx, med) => {
            med.request("timeline.toggle", args[0]);
        });

        // Trigger controls
        this.register("trigger.kill", (args, ctx, med) => {
            // Access Registry via Mediator if needed, or send a request
            // For now, let's assume we can get Registry from Mediator
            const triggers = med.get("Registry")?.triggers;
            if (triggers) {
                const st = triggers.get(args[0]);
                if (st) st.kill();
            }
        });

        // Debug
        this.register("console.log", (args, ctx) => {
            console.log(`[Console Log]`, ...args);
            if (ctx) console.log(`[Context]`, ctx);
        });

        // Add/Remove via Bus (delegated via Mediator)
        // Since Bus is also listening to commands or accessible via Mediator, 
        // we can route these requests. However, Bus is "above" ActionEngine.
        // Let's assume Mediator can route to CommandBus if registered, 
        // OR we just use Mediator to modify state directly if logic is moved there.
        // For now, let's look up the CommandBus or send a request the Bus listens to.

        // Actually, previous implementation called `eng.bus.execute`.
        // We should register CommandBus with Mediator.

        this.register("bus.add", (args, ctx, med) => {
            const bus = med.get("CommandBus");
            if (bus && args[0]) bus.execute({ type: 'ADD_ANIMATION', payload: args[0] });
        });

        this.register("bus.remove", (args, ctx, med) => {
            const bus = med.get("CommandBus");
            if (bus) bus.execute({ type: 'REMOVE_ANIMATION', payload: { id: args[0] } });
        });

        this.register("bus.pause", (args, ctx, med) => {
            const bus = med.get("CommandBus");
            if (bus) bus.execute({ type: 'PAUSE_ALL' });
        });

        this.register("bus.resume", (args, ctx, med) => {
            const bus = med.get("CommandBus");
            if (bus) bus.execute({ type: 'RESUME_ALL' });
        });

        // UI Builder / Custom JS
        this.register("js.run", (args, ctx, med) => {
            try {
                // Pass mediator as 3rd arg instead of engine
                const fn = new Function('args', 'ctx', 'mediator', args[0]);
                fn(args.slice(1), ctx, med);
            } catch (e) {
                console.error(`[ActionDispatcher] Error in js.run:`, e);
            }
        });

        this.register("global.call", (args, ctx, med) => {
            const [path, ...params] = args;
            const parts = path.split('.');
            let target = window;
            for (const part of parts) {
                target = target?.[part];
            }
            if (typeof target === 'function') {
                target(...params, ctx, med);
            } else {
                console.warn(`[ActionDispatcher] global.call: ${path} is not a function`);
            }
        });
    }
}

/**
 * Condition Evaluator
 * Handles "when" block: { "left": "trigger.progress", "op": ">=", "right": 0.5 }
 */
export class ConditionEvaluator {
    evaluate(conditions, context) {
        // Default to true if no conditions
        if (!conditions || conditions.length === 0) return true;

        // AND logic: all must be true
        return conditions.every(cond => this.check(cond, context));
    }

    check(cond, context) {
        const leftVal = this.resolveValue(cond.left, context);
        const rightVal = this.resolveValue(cond.right, context);

        switch (cond.op) {
            case "==": return leftVal == rightVal;
            case "===": return leftVal === rightVal;
            case "!=": return leftVal != rightVal;
            case "!==": return leftVal !== rightVal;
            case ">": return leftVal > rightVal;
            case ">=": return leftVal >= rightVal;
            case "<": return leftVal < rightVal;
            case "<=": return leftVal <= rightVal;
            default: return false;
        }
    }

    resolveValue(key, context) {
        // If it's not a string, return literal value
        if (typeof key !== 'string') return key;

        // Namespaced keys: "trigger.progress", "global.scrollY"
        if (key.startsWith("trigger.")) {
            const prop = key.split(".")[1];
            return context[prop];
        }

        if (key.startsWith("global.")) {
            const prop = key.split(".")[1];
            if (prop === "scrollY") return window.scrollY;
            if (prop === "innerWidth") return window.innerWidth;
            return window[prop];
        }

        // Legacy support: plain keys like "progress"
        return context[key];
    }
}

/**
 * Throttle Utility
 */
function throttle(fn, wait) {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

/**
 * Main Action Engine
 * Listens to hooks and triggers logic
 */
export class ActionEngine {
    constructor(hooks, mediator) {
        this.hooks = hooks;
        this.mediator = mediator;
        this.dispatcher = new ActionDispatcher(mediator);
        this.evaluator = new ConditionEvaluator();
        this.registeredCallbacks = new Map(); // planId -> callback handlers
        this.registeredInteractions = new Map(); // planId -> [{ selector, event, handler, el }]
    }

    /**
     * Parse and register listeners for a plan's callbacks
     * @param {Object} plan - The execution plan containing 'callbacks' array
     */
    registerPlanCallbacks(plan) {
        if (!plan.callbacks || !Array.isArray(plan.callbacks)) return;

        const handlers = [];

        plan.callbacks.forEach(cb => {
            // cb = { id, on, priority, throttle, when, do }

            let handler = (context) => {
                // 1. Evaluate Conditions
                if (this.evaluator.evaluate(cb.when, context)) {
                    // 2. Execute Actions
                    cb.do.forEach(action => {
                        this.dispatcher.execute(action, context);
                    });
                }
            };

            // Apply throttle if specified
            if (cb.throttle && cb.throttle > 0) {
                handler = throttle(handler, cb.throttle);
            }

            // Normalize event names (mapping DSL names to engine hook names)
            // onComplete   
            // onEnter
            // onLeave
            // onEnterBack
            // onLeaveBack
            // onUpdate
            const mapping = {
                "trigger.onEnter": "scroll.enter",
                "onEnter": "scroll.enter",
                "trigger.onLeave": "scroll.leave",
                "onLeave": "scroll.leave",
                "trigger.onEnterBack": "scroll.enterBack",
                "onEnterBack": "scroll.enterBack",
                "trigger.onLeaveBack": "scroll.leaveBack",
                "onLeaveBack": "scroll.leaveBack",
                "trigger.onUpdate": "scroll.update",
                "onUpdate": "scroll.update",
                "trigger.onComplete": "animation.complete",
                "onComplete": "animation.complete",
                // New ScrollTrigger Callbacks
                "trigger.onToggle": "scroll.toggle",
                "onToggle": "scroll.toggle",
                "trigger.onRefresh": "scroll.refresh",
                "onRefresh": "scroll.refresh",
                "trigger.onRefreshInit": "scroll.refreshInit",
                "onRefreshInit": "scroll.refreshInit",
                "trigger.onScrubComplete": "scroll.scrubComplete",
                "onScrubComplete": "scroll.scrubComplete",
                "trigger.onSnapComplete": "scroll.snapComplete",
                "onSnapComplete": "scroll.snapComplete"
            };
            const eventName = mapping[cb.on] || cb.on;
            this.hooks.addAction(eventName, handler, cb.priority || 10);
            handlers.push({ event: eventName, handler, priority: cb.priority || 10 });
        });

        this.registeredCallbacks.set(plan.id, handlers);
    }

    /**
     * Unregister callbacks for a specific plan
     */
    unregisterPlanCallbacks(planId) {
        const handlers = this.registeredCallbacks.get(planId);
        if (!handlers) return;

        handlers.forEach(({ event, handler, priority }) => {
            this.hooks.removeAction(event, handler, priority);
        });

        this.registeredCallbacks.delete(planId);
    }

    /**
     * Register DOM event interactions for a plan
     * @param {Object} plan 
     */
    registerPlanInteractions(plan) {
        if (!plan.interactions || !Array.isArray(plan.interactions)) return;

        const handlers = [];

        plan.interactions.forEach(inter => {
            const elements = document.querySelectorAll(inter.selector);
            elements.forEach(el => {
                const handler = (event) => {
                    const context = { domEvent: event, target: el };
                    // Apply when conditions if present
                    if (this.evaluator.evaluate(inter.when, context)) {
                        inter.do.forEach(action => {
                            this.dispatcher.execute(action, context);
                        });
                    }
                };

                el.addEventListener(inter.on, handler);
                handlers.push({ selector: inter.selector, event: inter.on, handler, el });
            });
        });

        this.registeredInteractions.set(plan.id, handlers);
    }

    /**
     * Parse and register callbacks directly on a GSAP Timeline instance
     * @param {gsap.core.Timeline} tl - The GSAP timeline instance
     * @param {Object} config - The timeline configuration from DSL
     */
    registerTimelineCallbacks(tl, config) {
        if (!config.callbacks || !Array.isArray(config.callbacks)) return;

        config.callbacks.forEach(cb => {
            // cb = { on, when, do, throttle }

            let handler = () => {
                console.log(`[ActionEngine] Timeline Callback Fired: ${cb.on}`, tl.vars.id || "");
                const context = { timeline: tl, progress: tl.progress() };
                if (this.evaluator.evaluate(cb.when, context)) {
                    cb.do.forEach(action => {
                        this.dispatcher.execute(action, context);
                    });
                }
            };

            if (cb.throttle && cb.throttle > 0) {
                handler = throttle(handler, cb.throttle);
            }

            // Map DSL event names to GSAP event names
            const eventMap = {
                "onStart": "onStart",
                "onUpdate": "onUpdate",
                "onComplete": "onComplete",
                "onReverseComplete": "onReverseComplete",
                "onRepeat": "onRepeat",
                "onInterrupt": "onInterrupt"
            };

            const gsapEvent = eventMap[cb.on] || cb.on;
            tl.eventCallback(gsapEvent, handler);
        });
    }

    /**
     * Unregister interactions for a specific plan
     */
    unregisterPlanInteractions(planId) {
        const handlers = this.registeredInteractions.get(planId);
        if (!handlers) return;

        handlers.forEach(({ event, handler, el }) => {
            el.removeEventListener(event, handler);
        });

        this.registeredInteractions.delete(planId);
    }

    /**
     * Register a custom action command
     */
    registerAction(cmd, fn) {
        this.dispatcher.register(cmd, fn);
    }
}
