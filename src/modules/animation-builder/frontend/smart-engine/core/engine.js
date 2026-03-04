import { Registry } from './infra.js';
import { CommandRegistry } from '../commands/base.js';
import { ToCommand, FromCommand, FromToCommand, SetCommand, CallCommand } from '../commands/standard.js';

import { ActionEngine } from './actions.js';
import { CommandBus } from './bus.js';
import { GSAPMediator } from './mediator.js';

/*************************************************
 * Compiler (DSL -> ExecutionPlan)
 *************************************************/
export class Compiler {
    constructor(hooks) {
        this.hooks = hooks;
    }

    compile(dsl, options = {}) {
        // allow plugins to modify raw DSL
        const dsl2 = this.hooks.applyFilters("animation.dsl", structuredClone(dsl), options);

        let timelines = dsl2.timelines || [];
        if (options.onlyTimelines?.length) {
            timelines = timelines.filter(t => options.onlyTimelines.includes(t.id));
        }

        // Normalize trigger — ensure type exists
        let trigger = dsl2.trigger || { type: "pageload" };
        if (!trigger.type) {
            // Legacy: trigger without type is scroll
            trigger = { type: "scroll", ...trigger };
        }

        // Disable scroll triggers if option set
        if (options.disableScroll && trigger.type === "scroll") {
            trigger = { type: "pageload" };
        }

        let plan = {
            id: dsl2.id,
            mode: options.mode || "normal",
            trigger,
            timelines,
            callbacks: dsl2.callbacks || [],
            interactions: dsl2.interactions || []
        };

        // allow plugins to modify execution plan
        plan = this.hooks.applyFilters("animation.plan", plan, options);
        return plan;
    }
}

/*************************************************
 * Runtime (Execution only)
 *************************************************/
export class GsapRuntime {
    constructor(reg, hooks, commandRegistry, actionEngine, mediator) {
        this.reg = reg;
        this.hooks = hooks;
        this.commandRegistry = commandRegistry;
        this.actionEngine = actionEngine;
        this.mediator = mediator;
    }

    execute(plan) {
        this.hooks.doAction("runtime.before", plan);

        // Create a GSAP context for this plan (lifecycle management)
        const ctx = gsap.context(() => {
            // Register Callbacks
            if (this.actionEngine) {
                this.actionEngine.registerPlanCallbacks(plan);
                this.actionEngine.registerPlanInteractions(plan);
            }

            // build timelines
            for (const t of plan.timelines) {
                // Extract specific GSAP properties from 't'
                const { id, steps, callbacks, kind, triggering, ...tlConfig } = t;
                // create timeline with config, forcing paused:true initially for setup
                const tl = gsap.timeline({ ...tlConfig, paused: true, id: t.id });

                if (t.timeScale !== undefined) tl.timeScale(t.timeScale);

                for (const s of (t.steps || [])) {
                    // filter step before execution
                    const step = this.hooks.applyFilters("timeline.step", s, t, plan);

                    // Command Pattern Execution
                    const type = step.type || "to"; // default to 'to'
                    const CommandClass = this.commandRegistry.get(type);

                    if (CommandClass) {
                        const cmd = new CommandClass(this.hooks);
                        try {
                            cmd.execute(tl, step.target, step.vars);
                        } catch (err) {
                            //console.error(`[GsapRuntime] Error executing command '${type}':`, err);
                        }
                    } else {
                        //console.warn(`[GsapRuntime] Unknown command type: '${type}'`);
                    }
                }
                // Register timeline-specific callbacks
                if (this.actionEngine) {
                    this.actionEngine.registerTimelineCallbacks(tl, t);
                }

                this.reg.timelines.register(t.id, tl);
            }

            // ─── Trigger-based execution ───
            const triggerType = plan.trigger?.type || "pageload";

            switch (triggerType) {

                case "scroll":
                    this._executeScroll(plan);
                    break;

                case "click":
                    this._executeClick(plan);
                    break;

                case "hover":
                    this._executeHover(plan);
                    break;

                case "pageload":
                default:
                    this._executePageload(plan);
                    break;
            }
        });

        // Store the context for cleanup
        this.reg.contexts.register(plan.id, ctx);

        this.hooks.doAction("runtime.after", plan);
        return { animationId: plan.id, context: ctx };
    }

    // ─── Trigger Handlers ─────────────────────────────

    _executePageload(plan) {
        const delay = plan.trigger?.delay || 0;
        let completedCount = 0;
        const total = plan.timelines.length;

        if (total === 0) {
            this.hooks.doAction("animation.complete", plan);
            return;
        }

        for (const t of plan.timelines) {
            const tl = this.reg.timelines.get(t.id);
            if (tl) {
                const existingOnComplete = tl.eventCallback("onComplete");
                const _hooks = this.hooks;

                tl.eventCallback("onComplete", function (...args) {
                    if (existingOnComplete) existingOnComplete.apply(this, args);
                    completedCount++;
                    if (completedCount === total) {
                        _hooks.doAction("animation.complete", plan);
                    }
                });

                tl.delay(tl.delay() + delay);
                tl.play(0);
            } else {
                completedCount++;
            }
        }
    }

    _executeClick(plan) {
        const { selector, action = "play" } = plan.trigger;
        const elements = document.querySelectorAll(selector);
        const listeners = [];

        elements.forEach(el => {
            const handler = () => {
                for (const t of plan.timelines) {
                    const tl = this.reg.timelines.get(t.id);
                    if (!tl) continue;

                    switch (action) {
                        case "toggle":
                            tl.reversed() ? tl.play() : tl.reverse();
                            break;
                        case "restart":
                            tl.restart();
                            break;
                        case "reverse":
                            tl.reverse();
                            break;
                        case "play":
                        default:
                            tl.play(0);
                            break;
                    }
                }
            };

            el.addEventListener("click", handler);
            listeners.push({ el, event: "click", handler });
        });

        // Store listeners for cleanup
        this.reg._triggerListeners = this.reg._triggerListeners || new Map();
        this.reg._triggerListeners.set(plan.id, listeners);
    }

    _executeHover(plan) {
        const { selector, enterAction = "play", leaveAction = "reverse" } = plan.trigger;
        const elements = document.querySelectorAll(selector);
        const listeners = [];

        const applyAction = (actionName) => {
            for (const t of plan.timelines) {
                const tl = this.reg.timelines.get(t.id);
                if (!tl) continue;

                switch (actionName) {
                    case "play":    tl.play(); break;
                    case "reverse": tl.reverse(); break;
                    case "restart": tl.restart(); break;
                    case "pause":   tl.pause(); break;
                    case "toggle":
                        tl.reversed() ? tl.play() : tl.reverse();
                        break;
                    default:        tl.play(); break;
                }
            }
        };

        elements.forEach(el => {
            const enterHandler = () => applyAction(enterAction);
            const leaveHandler = () => applyAction(leaveAction);

            el.addEventListener("mouseenter", enterHandler);
            el.addEventListener("mouseleave", leaveHandler);
            listeners.push(
                { el, event: "mouseenter", handler: enterHandler },
                { el, event: "mouseleave", handler: leaveHandler }
            );
        });

        this.reg._triggerListeners = this.reg._triggerListeners || new Map();
        this.reg._triggerListeners.set(plan.id, listeners);
    }

    _executeScroll(plan) {
        const { type, selector, ...scrollConfig } = plan.trigger;
        // Map DSL "selector" to GSAP's "trigger" property
        const rawConfig = selector ? { trigger: selector, ...scrollConfig } : scrollConfig;
        const triggerConfig = this.hooks.applyFilters("scrollTrigger.config", rawConfig, plan);

        if (typeof ScrollTrigger === 'undefined') return;

        const _triggerConfig = {
            ...triggerConfig,
            onUpdate: self => {
                this.hooks.doAction("scroll.update", self, plan);
                for (const t of plan.timelines) {
                    this.reg.timelines.get(t.id)?.progress?.(self.progress);
                }
            },
            onEnter: self => {
                this.hooks.doAction("scroll.enter", self, plan);
            },
            onLeave: self => {
                this.hooks.doAction("scroll.leave", self, plan);
                this.hooks.doAction("animation.complete", plan);
            },
            onEnterBack: self => {
                this.hooks.doAction("scroll.enterBack", self, plan);
            },
            onLeaveBack: self => {
                this.hooks.doAction("scroll.leaveBack", self, plan);
            },
            onToggle: self => {
                this.hooks.doAction("scroll.toggle", self, plan);
            },
            onRefresh: self => {
                this.hooks.doAction("scroll.refresh", self, plan);
            },
            onRefreshInit: self => {
                this.hooks.doAction("scroll.refreshInit", self, plan);
            },
            onScrubComplete: self => {
                this.hooks.doAction("scroll.scrubComplete", self, plan);
            },
            onSnapComplete: self => {
                this.hooks.doAction("scroll.snapComplete", self, plan);
            }
        };

        const st = ScrollTrigger.create(_triggerConfig);
        this.reg.triggers.register(plan.id, st);
    }

    destroyAll() {
        // Clean up trigger DOM listeners
        if (this.reg._triggerListeners) {
            for (const listeners of this.reg._triggerListeners.values()) {
                listeners.forEach(({ el, event, handler }) => el.removeEventListener(event, handler));
            }
            this.reg._triggerListeners.clear();
        }
        // Revert all contexts (this kills all nested animations)
        for (const ctx of this.reg.contexts.getAll()) {
            ctx.revert();
        }
        this.reg.contexts.killAll();
        this.reg.triggers.killAll();
        this.reg.timelines.killAll();
    }

    kill(id) {
        // Unregister callbacks first
        if (this.actionEngine) {
            this.actionEngine.unregisterPlanCallbacks(id);
            this.actionEngine.unregisterPlanInteractions(id);
        }

        // Clean up trigger DOM listeners (click/hover)
        if (this.reg._triggerListeners?.has(id)) {
            const listeners = this.reg._triggerListeners.get(id);
            listeners.forEach(({ el, event, handler }) => el.removeEventListener(event, handler));
            this.reg._triggerListeners.delete(id);
        }

        // Revert the context (kills all ScrollTriggers and Timelines within)
        const ctx = this.reg.contexts.get(id);
        if (ctx) {
            ctx.revert();
            this.reg.contexts.remove(id);
        }

        // Manual cleanup as fallback
        this.reg.triggers.remove(id);
    }
}

/*************************************************
 * Engine (Orchestrator)
 *************************************************/
export class Engine {
    constructor({ hooks }) {
        this.hooks = hooks;
        this.mediator = new GSAPMediator();

        this.reg = {
            timelines: new Registry("Timelines"),
            triggers: new Registry("Triggers"),
            contexts: new Registry("Contexts") // New: GSAP contexts for lifecycle
        };

        // Initialize Command Registry with defaults
        this.commands = new CommandRegistry();
        this.commands.register("to", ToCommand);
        this.commands.register("from", FromCommand);
        this.commands.register("fromTo", FromToCommand);
        this.commands.register("set", SetCommand);
        this.commands.register("call", CallCommand);

        // Register Core Colleagues
        this.mediator.register("Engine", this);
        this.mediator.register("Registry", this.reg);

        // Core Modules
        this.actionEngine = new ActionEngine(this.hooks, this.mediator);
        this.compiler = new Compiler(this.hooks);
        this.runtime = new GsapRuntime(this.reg, this.hooks, this.commands, this.actionEngine, this.mediator);
        // Command Bus
        this.bus = new CommandBus(this, this.mediator);
        this.hooks.doAction("engine.init", this);

    }

    /**
     * Register a custom animation command.
     * Logic for "Third Party" developers.
     */
    registerCommand(type, CommandClass) {
        this.commands.register(type, CommandClass);
    }

    /**
     * Register a custom action command (for callbacks).
     */
    registerAction(cmd, fn) {
        this.actionEngine.registerAction(cmd, fn);
    }

    run(dsl, options = {}) {
        this.hooks.doAction("engine.beforeCompile", dsl, options);
        const plan = this.compiler.compile(dsl, options);
        this.hooks.doAction("engine.afterCompile", plan, options);
        return this.runtime.execute(plan);
    }

    kill(id) {
        this.runtime.kill(id);
    }

    destroyAll() {
        this.hooks.doAction("engine.beforeDestroy");
        this.runtime.destroyAll();
        this.hooks.doAction("engine.afterDestroy");
    }
}
