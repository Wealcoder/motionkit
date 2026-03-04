/**
 * GSAP Mediator
 * Central Hub for decoupling communication between Engine components.
 */
export class GSAPMediator {
    constructor() {
        this.colleagues = new Map(); // name -> instance
        this.listeners = new Map(); // event -> [handlers]
    }

    /**
     * Register a colleague (component) with the mediator.
     * @param {string} name - Unique identifier for the colleague
     * @param {object} instance - The component instance
     */
    register(name, instance) {
        this.colleagues.set(name, instance);
        // If colleague has a setMediator method, inject reference
        if (typeof instance.setMediator === 'function') {
            instance.setMediator(this);
        }
    }

    /**
     * Retrieve a registered colleague.
     * @param {string} name 
     */
    get(name) {
        return this.colleagues.get(name);
    }

    /**
     * Broadcast an event to all subscribers.
     * @param {string} event - Event name (e.g., 'timeline.complete')
     * @param {any} payload - Data to pass
     */
    notify(event, payload) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(handler => handler(payload));
    }

    /**
     * Subscribe to an event.
     * @param {string} event 
     * @param {function} handler 
     */
    subscribe(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
    }

    /**
     * Request a command execution.
     * Unlike notify (pub/sub), this is direct delegation.
     * @param {string} command - Command string (e.g., 'timeline.play')
     * @param {any} payload 
     */
    request(command, payload) {
        // Timeline Commands
        if (command.startsWith("timeline.")) {
            const registry = this.get("Registry");
            const action = command.split(".")[1]; // play, pause, etc.
            const tlId = payload; // payload is the ID

            if (registry) {
                const tl = registry.timelines.get(tlId);
                if (tl) {
                    switch (action) {
                        case "play":
                            // check completion for restart logic
                            if (tl.progress() === 1) tl.restart();
                            else tl.play();
                            break;
                        case "pause": tl.pause(); break;
                        case "reverse": tl.reverse(); break;
                        case "restart": tl.restart(); break;
                        case "resume": tl.resume(); break;
                        case "toggle":
                            if (tl.progress() > 0 && tl.progress() < 1 && !tl.paused()) tl.reverse();
                            else tl.play();
                            break;
                    }
                }
            }
            return;
        }

        // Global Bus Commands
        if (command === "engine.kill") {
            const engine = this.get("Engine");
            if (engine) engine.kill(payload.id);
        }

        // Add more routing logic here as needed
    }
}
