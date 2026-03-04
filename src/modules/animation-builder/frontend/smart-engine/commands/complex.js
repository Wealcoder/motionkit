import { AnimationCommand } from './base.js';

/**
 * SplitText Command (Mock/Fallback)
 * 
 * Supports splitting text into chars or words.
 * 
 * Config:
 * {
 *   type: "splitText",
 *   vars: {
 *      splitType: "chars" | "words", // default: chars
 *      stagger: 0.1,
 *      y: 20, opacity: 0, // Animation vars
 *   }
 * }
 */
export class SplitTextCommand extends AnimationCommand {
    execute(timeline, target, config) {
        const elements = document.querySelectorAll(target);
        if (!elements.length) return;

        const splitType = config.splitType || 'chars';
        const allParts = [];

        elements.forEach(el => {
            // Check if already split
            const existingClass = splitType === 'words' ? 'word-split' : 'char-split';
            if (el.dataset.splitDone === splitType) {
                const parts = el.querySelectorAll(`.${existingClass}`);
                allParts.push(...parts);
                return;
            }

            const text = el.textContent;
            el.textContent = '';
            el.dataset.splitDone = splitType;

            if (splitType === 'words') {
                // Split by words
                const words = text.split(/\s+/).filter(w => w.length > 0);
                words.forEach((word, i) => {
                    const span = document.createElement('span');
                    span.className = 'word-split';
                    span.style.display = 'inline-block';
                    span.style.marginRight = '0.3em';
                    span.textContent = word;
                    el.appendChild(span);
                    allParts.push(span);
                });
            } else {
                // Split by chars
                const chars = text.split('').map(char => {
                    const span = document.createElement('span');
                    span.className = 'char-split';
                    span.style.display = 'inline-block';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    return span;
                });
                chars.forEach(c => el.appendChild(c));
                allParts.push(...chars);
            }
        });

        // Prepare animation vars
        const vars = { ...config };
        delete vars.type;
        delete vars.splitType;

        // Default animation if not provided
        if (!vars.opacity && !vars.y && !vars.x && !vars.scale) {
            vars.opacity = 0;
            vars.y = 20;
        }

        if (vars.stagger === undefined) vars.stagger = 0.05;

        timeline.from(allParts, vars);
    }
}

/**
 * Horizontal Scroll Command
 * 
 * Animates a container horizontally based on its children.
 */
export class HorizontalScrollCommand extends AnimationCommand {
    execute(timeline, target, config) {
        const container = document.querySelector(target);
        if (!container) return;

        const children = container.children;
        if (children.length <= 1) return;

        // Calculate scroll distance
        const containerWidth = container.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDistance = containerWidth - viewportWidth + 200; // Extra padding

        timeline.to(container, {
            x: -scrollDistance,
            ease: "none",
            ...config
        });
    }
}

/**
 * DrawSVG Command
 * 
 * Animates SVG stroke drawing.
 * Note: Requires GSAP DrawSVGPlugin (Club GreenSock)
 * Falls back to stroke-dasharray animation if plugin not available.
 */
export class DrawSVGCommand extends AnimationCommand {
    execute(timeline, target, config) {
        const elements = document.querySelectorAll(target);
        if (!elements.length) return;

        elements.forEach(el => {
            // Get path length
            const length = el.getTotalLength ? el.getTotalLength() : 1000;
            // Set initial state
            gsap.set(el, {
                strokeDasharray: length,
                strokeDashoffset: length
            });
        });

        timeline.to(target, {
            strokeDashoffset: 0,
            duration: config.duration || 1.5,
            ease: config.ease || 'power2.inOut',
            stagger: config.stagger || 0
        });
    }
}

/**
 * Flip Command
 * 
 * Wrapper for GSAP Flip plugin animations.
 */
export class FlipCommand extends AnimationCommand {
    execute(timeline, target, config) {
        // Flip is typically used programmatically, not in timeline
        // This is a placeholder for DSL-based Flip setup
        console.log('[FlipCommand] Use Flip programmatically for layout changes');
    }
}

/**
 * Parallax Command
 * 
 * Creates parallax scrolling effect.
 */
export class ParallaxCommand extends AnimationCommand {
    execute(timeline, target, config) {
        const speed = config.speed || 0.5;
        const direction = config.direction || 'y';

        const vars = {
            [direction]: () => `${speed * 100}%`,
            ease: 'none',
            ...config
        };

        delete vars.speed;
        delete vars.direction;

        timeline.to(target, vars);
    }
}

/**
 * Counter Command
 * 
 * Animates a number counting up.
 */
export class CounterCommand extends AnimationCommand {
    execute(timeline, target, config) {
        const elements = document.querySelectorAll(target);

        elements.forEach(el => {
            const endValue = parseInt(el.dataset.count || el.textContent) || 100;
            const startValue = config.from || 0;
            const obj = { value: startValue };

            timeline.to(obj, {
                value: endValue,
                duration: config.duration || 2,
                ease: config.ease || 'power2.out',
                onUpdate: () => {
                    el.textContent = Math.round(obj.value);
                }
            });
        });
    }
}

/**
 * Reveal Command
 *
 * Advanced clip-path based reveal animation.
 *
 * Supported directions:
 *   Inset:    left, right, top, bottom, center
 *   Shape:    circle, ellipse, diamond, triangle, hexagon, star
 *   Wipe:     diagonal-left, diagonal-right, diagonal-double
 *   Iris:     iris-in (circle shrink-to-reveal reversed)
 *   Custom:   custom (provide custom "from"/"to" clip-path strings in config)
 *
 * Config:
 * {
 *   direction: "circle",
 *   duration: 1.2,
 *   ease: "power3.inOut",
 *   stagger: 0.15,
 *   // For "custom" direction:
 *   from: "polygon(...)",
 *   to: "polygon(...)"
 * }
 */
export class RevealCommand extends AnimationCommand {
    execute(timeline, target, config) {
        const direction = config.direction || 'left';

        const clipPaths = {
            // ── Inset wipes ──
            left:   { from: 'inset(0 100% 0 0)',       to: 'inset(0 0% 0 0)' },
            right:  { from: 'inset(0 0 0 100%)',        to: 'inset(0 0 0 0%)' },
            top:    { from: 'inset(100% 0 0 0)',        to: 'inset(0% 0 0 0)' },
            bottom: { from: 'inset(0 0 100% 0)',        to: 'inset(0 0 0% 0)' },
            center: { from: 'inset(50% 50% 50% 50%)',   to: 'inset(0% 0% 0% 0%)' },

            // ── Circle / Ellipse ──
            circle: {
                from: 'circle(0% at 50% 50%)',
                to:   'circle(75% at 50% 50%)'
            },
            'circle-top-left': {
                from: 'circle(0% at 0% 0%)',
                to:   'circle(150% at 0% 0%)'
            },
            'circle-bottom-right': {
                from: 'circle(0% at 100% 100%)',
                to:   'circle(150% at 100% 100%)'
            },
            ellipse: {
                from: 'ellipse(0% 0% at 50% 50%)',
                to:   'ellipse(80% 80% at 50% 50%)'
            },

            // ── Iris (reverse circle — full to focused) ──
            'iris-in': {
                from: 'circle(75% at 50% 50%)',
                to:   'circle(0% at 50% 50%)'
            },

            // ── Polygon shapes ──
            diamond: {
                from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
                to:   'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            },
            triangle: {
                from: 'polygon(50% 50%, 50% 50%, 50% 50%)',
                to:   'polygon(50% 0%, 100% 100%, 0% 100%)'
            },
            hexagon: {
                from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
                to:   'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
            },
            star: {
                from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
                to:   'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            },

            // ── Diagonal wipes ──
            'diagonal-left': {
                from: 'polygon(0% 0%, 0% 0%, 0% 0%)',
                to:   'polygon(0% 0%, 200% 0%, 0% 200%)'
            },
            'diagonal-right': {
                from: 'polygon(100% 0%, 100% 0%, 100% 0%)',
                to:   'polygon(100% 0%, 100% 200%, -100% 0%)'
            },
            'diagonal-double': {
                from: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
                to:   'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
            },

            // ── Split wipes ──
            'split-x': {
                from: 'inset(0 50% 0 50%)',
                to:   'inset(0 0% 0 0%)'
            },
            'split-y': {
                from: 'inset(50% 0 50% 0)',
                to:   'inset(0% 0 0% 0)'
            }
        };

        // Support custom from/to clip-paths
        let clip;
        if (direction === 'custom' && config.from && config.to) {
            clip = { from: config.from, to: config.to };
        } else {
            clip = clipPaths[direction] || clipPaths.left;
        }

        const vars = {
            clipPath: clip.to,
            duration: config.duration || 1,
            ease: config.ease || 'power3.inOut',
            stagger: config.stagger || 0
        };

        gsap.set(target, { clipPath: clip.from });
        timeline.to(target, vars);
    }
}
