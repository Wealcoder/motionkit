/**
 * Command Bus
 * Central control plane for adding/removing animations programmatically.
 */
export class CommandBus {
    constructor(engine, mediator) {
        this.engine = engine;
        this.mediator = mediator;
        this.activeAnimations = new Map(); // id -> { plan, context }

        if (this.mediator) {
            this.mediator.register("CommandBus", this);
        }
    }

    /**
     * Unity-like Execute pattern
     * @param {Object} command - { type: 'ADD', payload: ... }
     */
    execute(command) {
        if (!command || !command.type) {
            //  console.warn("[CommandBus] Invalid command structure", command);
            return;
        }

        //   console.log(`[CommandBus] Executing ${command.type}`, command.payload?.id || "");

        switch (command.type) {
            case "ADD_ANIMATION":
                return this.add(command.payload);
            case "REMOVE_ANIMATION":
                return this.remove(command.payload.id);
            case "UPDATE_ANIMATION":
                this.remove(command.payload.id);
                return this.add(command.payload);
            case "PAUSE_ALL":
                return this.pauseAll();
            case "RESUME_ALL":
                return this.resumeAll();
            case "KILL_ALL":
                return this.killAll();
            case "REGISTER_ACTION":
                if (command.payload.cmd && command.payload.fn) {
                    return this.engine.registerAction(command.payload.cmd, command.payload.fn);
                }
                return false;
            default:
                console.warn(`[CommandBus] Unknown command type: ${command.type}`);
        }
    }

    add(dsl) {
        if (this.activeAnimations.has(dsl.id)) {
            // console.warn(`[CommandBus] Animation ${dsl.id} already exists. Use UPDATE to overwrite.`);
            return null;
        }

        try {
            const result = this.engine.run(dsl);
            this.activeAnimations.set(dsl.id, result);
            //  console.log(`[CommandBus] Added ${dsl.id}`);
            return result;
        } catch (e) {
            //  console.error(`[CommandBus] Failed to add ${dsl.id}:`, e);
            return null;
        }
    }

    remove(id) {
        if (!this.activeAnimations.has(id)) {
            // console.warn(`[CommandBus] cannot remove ${id} (not found)`);
            return false;
        }

        this.engine.kill(id);
        this.activeAnimations.delete(id);
        // console.log(`[CommandBus] Removed ${id}`);
        return true;
    }

    pauseAll() {
        gsap.globalTimeline.pause();
        //  console.log("[CommandBus] Paused all animations");
    }

    resumeAll() {
        gsap.globalTimeline.play();
        //   console.log("[CommandBus] Resumed all animations");
    }

    killAll() {
        const ids = [...this.activeAnimations.keys()];
        ids.forEach(id => this.remove(id));
        //  console.log("[CommandBus] Killed all animations");
    }

    /**
     * Get list of active animation IDs
     */
    getActiveIds() {
        return [...this.activeAnimations.keys()];
    }

    /**
     * Check if an animation is active
     */
    has(id) {
        return this.activeAnimations.has(id);
    }
}
