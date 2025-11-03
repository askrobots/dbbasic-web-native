/**
 * Gesture Recognition System
 * Recognizes touch gestures and maps them to semantic intents
 * Supports: swipe, pinch, rotate, long-press, double-tap, multi-finger
 */

class GestureRecognizer {
    constructor() {
        this.gestures = new Map();
        this.activeTouch = null;
        this.touchStart = null;
        this.touchHistory = [];
        this.config = {
            swipeThreshold: 50, // pixels
            swipeVelocityThreshold: 0.3, // pixels/ms
            longPressDelay: 500, // ms
            doubleTapDelay: 300, // ms
            pinchThreshold: 20, // pixels
            rotateThreshold: 15 // degrees
        };

        this.lastTap = null;
        this.longPressTimer = null;

        this.init();
    }

    init() {
        this.registerDefaultGestures();
        this.attachGlobalListeners();
        console.log('Gesture Recognition initialized');
    }

    /**
     * Register default gesture patterns
     */
    registerDefaultGestures() {
        // Swipe gestures
        this.registerGesture({
            name: 'swipe-left',
            pattern: (data) => data.dx < -this.config.swipeThreshold && Math.abs(data.dy) < 50,
            intent: 'navigate-back',
            description: 'Swipe left to go back'
        });

        this.registerGesture({
            name: 'swipe-right',
            pattern: (data) => data.dx > this.config.swipeThreshold && Math.abs(data.dy) < 50,
            intent: 'navigate-forward',
            description: 'Swipe right to go forward'
        });

        this.registerGesture({
            name: 'swipe-up',
            pattern: (data) => data.dy < -this.config.swipeThreshold && Math.abs(data.dx) < 50,
            intent: 'scroll-down',
            description: 'Swipe up to scroll down'
        });

        this.registerGesture({
            name: 'swipe-down',
            pattern: (data) => data.dy > this.config.swipeThreshold && Math.abs(data.dx) < 50,
            intent: 'scroll-up',
            description: 'Swipe down to scroll up or refresh'
        });

        // Pinch gestures
        this.registerGesture({
            name: 'pinch-in',
            pattern: (data) => data.fingers === 2 && data.scale < 0.8,
            intent: 'zoom-out',
            description: 'Pinch in to zoom out'
        });

        this.registerGesture({
            name: 'pinch-out',
            pattern: (data) => data.fingers === 2 && data.scale > 1.2,
            intent: 'zoom-in',
            description: 'Pinch out to zoom in'
        });

        // Rotate gesture
        this.registerGesture({
            name: 'rotate',
            pattern: (data) => data.fingers === 2 && Math.abs(data.rotation) > this.config.rotateThreshold,
            intent: 'rotate',
            description: 'Two-finger rotate'
        });

        // Multi-finger gestures
        this.registerGesture({
            name: 'three-finger-swipe-up',
            pattern: (data) => data.fingers === 3 && data.dy < -this.config.swipeThreshold,
            intent: 'show-overview',
            description: 'Three-finger swipe up for overview'
        });

        this.registerGesture({
            name: 'three-finger-swipe-down',
            pattern: (data) => data.fingers === 3 && data.dy > this.config.swipeThreshold,
            intent: 'minimize',
            description: 'Three-finger swipe down to minimize'
        });

        // Edge swipes
        this.registerGesture({
            name: 'edge-swipe-right',
            pattern: (data) => data.startX < 20 && data.dx > this.config.swipeThreshold,
            intent: 'open-menu',
            description: 'Swipe from left edge to open menu'
        });

        this.registerGesture({
            name: 'edge-swipe-left',
            pattern: (data) => data.startX > window.innerWidth - 20 && data.dx < -this.config.swipeThreshold,
            intent: 'close-panel',
            description: 'Swipe from right edge to close panel'
        });
    }

    /**
     * Register a custom gesture
     */
    registerGesture(gesture) {
        this.gestures.set(gesture.name, gesture);
    }

    /**
     * Attach global touch listeners
     */
    attachGlobalListeners() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        const touch = e.touches[0];
        const now = Date.now();

        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: now,
            fingers: e.touches.length,
            target: e.target
        };

        this.touchHistory = [{
            x: touch.clientX,
            y: touch.clientY,
            time: now
        }];

        // Check for double-tap
        if (this.lastTap && now - this.lastTap.time < this.config.doubleTapDelay) {
            const distance = Math.hypot(
                touch.clientX - this.lastTap.x,
                touch.clientY - this.lastTap.y
            );

            if (distance < 20) {
                this.emitGestureIntent('double-tap', {
                    x: touch.clientX,
                    y: touch.clientY,
                    target: e.target
                });
                this.lastTap = null;
                return;
            }
        }

        this.lastTap = { x: touch.clientX, y: touch.clientY, time: now };

        // Start long-press timer
        this.longPressTimer = setTimeout(() => {
            this.emitGestureIntent('long-press', {
                x: touch.clientX,
                y: touch.clientY,
                target: e.target
            });
        }, this.config.longPressDelay);

        // Handle multi-touch
        if (e.touches.length === 2) {
            this.touchStart.initialDistance = this.getTouchDistance(e.touches);
            this.touchStart.initialAngle = this.getTouchAngle(e.touches);
        }
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        if (!this.touchStart) return;

        clearTimeout(this.longPressTimer);

        const touch = e.touches[0];
        const now = Date.now();

        this.touchHistory.push({
            x: touch.clientX,
            y: touch.clientY,
            time: now
        });

        // Keep history limited
        if (this.touchHistory.length > 10) {
            this.touchHistory.shift();
        }

        // Handle multi-touch gestures
        if (e.touches.length === 2 && this.touchStart.initialDistance) {
            const currentDistance = this.getTouchDistance(e.touches);
            const currentAngle = this.getTouchAngle(e.touches);

            const scale = currentDistance / this.touchStart.initialDistance;
            const rotation = currentAngle - this.touchStart.initialAngle;

            // Check for pinch
            if (scale < 0.8 || scale > 1.2) {
                this.emitGestureIntent(scale < 1 ? 'pinch-in' : 'pinch-out', {
                    scale,
                    target: e.target
                });
            }

            // Check for rotate
            if (Math.abs(rotation) > this.config.rotateThreshold) {
                this.emitGestureIntent('rotate', {
                    rotation,
                    target: e.target
                });
            }
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (!this.touchStart) return;

        clearTimeout(this.longPressTimer);

        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStart.x;
        const dy = touch.clientY - this.touchStart.y;
        const dt = Date.now() - this.touchStart.time;

        const distance = Math.hypot(dx, dy);
        const velocity = distance / dt;

        // Build gesture data
        const gestureData = {
            dx,
            dy,
            distance,
            velocity,
            duration: dt,
            startX: this.touchStart.x,
            startY: this.touchStart.y,
            endX: touch.clientX,
            endY: touch.clientY,
            fingers: this.touchStart.fingers,
            target: this.touchStart.target
        };

        // If multi-touch, add scale/rotation
        if (this.touchStart.initialDistance) {
            gestureData.scale = this.getTouchDistance([touch]) / this.touchStart.initialDistance;
            gestureData.rotation = this.getTouchAngle([touch]) - this.touchStart.initialAngle;
        }

        // Match gesture patterns
        for (const [name, gesture] of this.gestures.entries()) {
            if (gesture.pattern(gestureData)) {
                this.emitGestureIntent(name, gestureData);
                break;
            }
        }

        // Check for tap (short duration, small distance)
        if (dt < 200 && distance < 10) {
            this.emitGestureIntent('tap', {
                x: touch.clientX,
                y: touch.clientY,
                target: this.touchStart.target
            });
        }

        this.touchStart = null;
        this.touchHistory = [];
    }

    /**
     * Handle touch cancel
     */
    handleTouchCancel(e) {
        clearTimeout(this.longPressTimer);
        this.touchStart = null;
        this.touchHistory = [];
    }

    /**
     * Emit gesture intent event
     */
    emitGestureIntent(gestureName, data) {
        const gesture = this.gestures.get(gestureName);

        const event = new CustomEvent('gesture', {
            bubbles: true,
            composed: true,
            detail: {
                gesture: gestureName,
                intent: gesture?.intent || gestureName,
                description: gesture?.description || `Gesture: ${gestureName}`,
                ...data
            }
        });

        (data.target || document).dispatchEvent(event);

        // Also emit as semantic intent
        if (gesture) {
            const intentEvent = new CustomEvent('intent', {
                bubbles: true,
                composed: true,
                detail: {
                    type: gesture.intent,
                    gesture: gestureName,
                    ...data
                }
            });

            (data.target || document).dispatchEvent(intentEvent);
        }

        console.log(`Gesture: ${gestureName}`, data);
    }

    /**
     * Get distance between two touches
     */
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }

    /**
     * Get angle between two touches (in degrees)
     */
    getTouchAngle(touches) {
        const dx = touches[1].clientX - touches[0].clientX;
        const dy = touches[1].clientY - touches[0].clientY;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }

    /**
     * Get velocity from touch history
     */
    getVelocity() {
        if (this.touchHistory.length < 2) return { vx: 0, vy: 0 };

        const recent = this.touchHistory.slice(-2);
        const dx = recent[1].x - recent[0].x;
        const dy = recent[1].y - recent[0].y;
        const dt = recent[1].time - recent[0].time;

        return {
            vx: dx / dt,
            vy: dy / dt
        };
    }

    /**
     * Visual feedback for gestures (debug mode)
     */
    showGestureFeedback(gesture, x, y) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            padding: 8px 16px;
            background: rgba(0, 122, 255, 0.9);
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 999999;
            pointer-events: none;
            animation: fadeOut 1s forwards;
        `;
        feedback.textContent = gesture;

        document.body.appendChild(feedback);

        setTimeout(() => feedback.remove(), 1000);
    }
}

// Initialize gesture recognition
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.gestureRecognizer = new GestureRecognizer();

        // Listen to gestures globally
        document.addEventListener('gesture', (e) => {
            console.log('Gesture detected:', e.detail);
        });

        // Add CSS for feedback animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(1.5); }
            }
        `;
        document.head.appendChild(style);

        console.log('Gesture Recognition ready');
        console.log('Available gestures:', Array.from(window.gestureRecognizer.gestures.keys()));
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureRecognizer;
}
