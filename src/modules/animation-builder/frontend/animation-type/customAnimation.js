import { Hooks } from '../smart-engine/core/infra.js';
import { Engine } from '../smart-engine/core/engine.js';
import {
  SplitTextCommand,
  DrawSVGCommand,
  ParallaxCommand,
  CounterCommand,
  RevealCommand,
} from '../smart-engine/commands/complex.js';

// ─── Bootstrap ────────────────────────────────────────────────────

if (typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const hooks = new Hooks();
window.MotionLyHooks = hooks;

const readyCallbacks = [];
let isInitialized = false;
let engineInstance = null;

window.MotionLy = {
  ready: (callback) => {
    if (isInitialized) {
      callback({ hooks, engine: engineInstance, bus: engineInstance.bus });
    } else {
      readyCallbacks.push(callback);
    }
  },
  get hooks() { return hooks; },
  get engine() { return engineInstance; },
  get bus() { return engineInstance?.bus; },
};

// ─── Engine Init ─────────────────────────────────────────────────

function initEngine() {
  // Register complex commands before engine initialises
  hooks.addAction('engine.init', (eng) => {
    eng.commands.register('splitText', SplitTextCommand);
    eng.commands.register('drawSVG', DrawSVGCommand);
    eng.commands.register('parallax', ParallaxCommand);
    eng.commands.register('counter', CounterCommand);
    eng.commands.register('reveal', RevealCommand);
  });

  engineInstance = new Engine({ hooks });
  window.MotionLySmartEngine = engineInstance;
  window.MotionLyAnimationBus = engineInstance.bus;
  isInitialized = true;

  readyCallbacks.forEach((cb) =>
    cb({ hooks, engine: engineInstance, bus: engineInstance.bus })
  );

  window.dispatchEvent(
    new CustomEvent('motionlyready', {
      detail: { hooks, engine: engineInstance, bus: engineInstance.bus },
    })
  );
}

// Defer so third-party scripts can register hooks first
setTimeout(initEngine, 0);

// ─── Listen for custom animation data from frontend.js ───────────

document.addEventListener('aae-animation-event', (e) => {
  const custom = e.detail?.custom;
  if (!Array.isArray(custom) || !custom.length) return;

  MotionLy.ready(({ bus }) => {
    custom.forEach((dsl) => {
      bus.execute({ type: 'ADD_ANIMATION', payload: dsl });
    });

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
});
console.log('hhhhh customAnimation.js loaded');
// ─── Reset / cleanup on device breakpoint switch ─────────────────

document.addEventListener('aae-reset-animation', () => {
  if (engineInstance) {
    engineInstance.destroyAll();
  }
});

