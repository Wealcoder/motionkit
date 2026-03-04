import { AnimationCommand } from './base.js';

export class ToCommand extends AnimationCommand {
    execute(timeline, target, config) {
        timeline.to(target, config);
    }
}

export class FromCommand extends AnimationCommand {
    execute(timeline, target, config) {
        timeline.from(target, config);
    }
}

export class FromToCommand extends AnimationCommand {
    execute(timeline, target, config) {
        // Pattern: config = { from: { opacity: 0 }, to: { opacity: 1, duration: 1 } }
        if (config.from && config.to) {
            timeline.fromTo(target, config.from, config.to);
        } else {
            // console.warn("FromToCommand requires 'from' and 'to' properties in config");
        }
    }
}

export class SetCommand extends AnimationCommand {
    execute(timeline, target, config) {
        timeline.set(target, config);
    }
}

export class CallCommand extends AnimationCommand {
    execute(timeline, target, config) {
        // config: { fn: "console.log('hello')", args: [] }
        // OR: { fn: "myCustomAction", args: [], isAction: true }

        if (typeof config.fn === 'function') {
            timeline.call(config.fn, config.args);
        } else if (typeof config.fn === 'string') {
            timeline.call((params) => {
                try {
                    // executing raw JS string
                    const f = new Function("args", config.fn);
                    f(params);
                } catch (e) {
                    console.error("[CallCommand] Error:", e);
                }
            }, [config.args]);
        }
    }
}

//Animation Reset Command


