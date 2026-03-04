/**
 * Abstract Base Command
 * All animation commands must extend this.
 */
export class AnimationCommand {
    constructor(hooks) {
        this.hooks = hooks;
    }

    /**
     * Execute the command.
     * @param {GSAPTimeline} timeline - The GSAP timeline instance to attach to.
     * @param {string|Element} target - The target element(s).
     * @param {object} config - The step configuration (vars, duration, etc).
     */
    execute(timeline, target, config) {
        throw new Error("Method 'execute' must be implemented.");
    }
}

/**
 * Registry for storing available Animation Commands.
 */
export class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }

    /**
     * Register a new command type.
     * @param {string} type - The unique type identifier (e.g., 'to', 'fade', 'wiggle').
     * @param {class} CommandClass - The class definition (not instance).
     */
    register(type, CommandClass) {
        this.commands.set(type, CommandClass);
    }

    get(type) {
        return this.commands.get(type);
    }

    has(type) {
        return this.commands.has(type);
    }
}
