/**
 * Context Detection System
 * Automatically detects environmental context using device sensors and APIs
 * - Ambient noise level
 * - Number of viewers (via camera/proximity)
 * - Lighting conditions
 * - Device orientation
 * - User activity/idle state
 * - Network conditions
 */

class ContextDetectionSystem {
    constructor(contextManager) {
        this.context = contextManager;
        this.sensors = {};
        this.detectionInterval = null;
        this.isRunning = false;

        this.init();
    }

    async init() {
        await this.setupAudioDetection();
        await this.setupVideoDetection();
        await this.setupLightDetection();
        await this.setupMotionDetection();
        await this.setupIdleDetection();
        await this.setupNetworkDetection();

        console.log('Context detection initialized');
    }

    // ========================================================================
    // AUDIO DETECTION - Ambient noise level
    // ========================================================================

    async setupAudioDetection() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);

            this.sensors.audio = {
                analyser,
                dataArray,
                stream,
                detectNoise: () => {
                    analyser.getByteFrequencyData(dataArray);

                    // Calculate average volume
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / dataArray.length;

                    // Convert to 0-100 scale
                    const noiseLevel = Math.min(100, (average / 255) * 100);

                    return Math.round(noiseLevel);
                }
            };

            console.log('Audio detection enabled');
        } catch (error) {
            console.warn('Audio detection not available:', error.message);
            this.sensors.audio = { detectNoise: () => 0 };
        }
    }

    // ========================================================================
    // VIDEO DETECTION - Number of faces/viewers
    // ========================================================================

    async setupVideoDetection() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            // Create hidden video element for face detection
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.style.display = 'none';
            document.body.appendChild(video);

            // Simple face detection using canvas analysis
            // In production, use Face-API.js or TensorFlow.js
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            this.sensors.video = {
                video,
                stream,
                canvas,
                ctx,
                detectViewers: () => {
                    // This is a simplified version
                    // In production, use proper face detection library
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    if (canvas.width === 0) return 1; // Default to 1 viewer

                    ctx.drawImage(video, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Simple motion/presence detection
                    let movement = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        if (brightness > 50) movement++;
                    }

                    const presenceRatio = movement / (data.length / 4);

                    // Rough estimate: more presence = more viewers
                    if (presenceRatio > 0.3) return Math.min(5, Math.ceil(presenceRatio * 3));
                    return 1;
                }
            };

            console.log('Video detection enabled');
        } catch (error) {
            console.warn('Video detection not available:', error.message);
            this.sensors.video = { detectViewers: () => 1 };
        }
    }

    // ========================================================================
    // LIGHT DETECTION - Ambient lighting
    // ========================================================================

    async setupLightDetection() {
        try {
            // Try AmbientLightSensor API (limited browser support)
            if ('AmbientLightSensor' in window) {
                const sensor = new AmbientLightSensor();
                sensor.start();

                this.sensors.light = {
                    sensor,
                    detectLighting: () => {
                        const lux = sensor.illuminance || 500;

                        if (lux < 50) return 'dark';
                        if (lux < 200) return 'dim';
                        if (lux < 1000) return 'normal';
                        return 'bright';
                    }
                };

                console.log('Light sensor enabled');
            } else {
                // Fallback: Use time of day
                this.sensors.light = {
                    detectLighting: () => {
                        const hour = new Date().getHours();

                        if (hour < 6 || hour > 20) return 'dark';
                        if (hour < 8 || hour > 18) return 'dim';
                        return 'normal';
                    }
                };

                console.log('Light detection using time-based fallback');
            }
        } catch (error) {
            console.warn('Light detection not available:', error.message);
            this.sensors.light = { detectLighting: () => 'normal' };
        }
    }

    // ========================================================================
    // MOTION DETECTION - Device orientation and movement
    // ========================================================================

    async setupMotionDetection() {
        try {
            if ('DeviceOrientationEvent' in window) {
                let orientation = { alpha: 0, beta: 0, gamma: 0 };

                window.addEventListener('deviceorientation', (event) => {
                    orientation = {
                        alpha: event.alpha || 0,
                        beta: event.beta || 0,
                        gamma: event.gamma || 0
                    };
                });

                this.sensors.motion = {
                    orientation,
                    detectOrientation: () => {
                        // Detect if device is portrait or landscape
                        // Detect if device is flat (on table) vs held
                        const beta = Math.abs(orientation.beta);

                        if (beta < 30) return 'flat'; // On table/desk
                        if (beta < 60) return 'tilted'; // Partially held
                        return 'held'; // Actively held
                    }
                };

                console.log('Motion detection enabled');
            } else {
                this.sensors.motion = { detectOrientation: () => 'unknown' };
            }
        } catch (error) {
            console.warn('Motion detection not available:', error.message);
            this.sensors.motion = { detectOrientation: () => 'unknown' };
        }
    }

    // ========================================================================
    // IDLE DETECTION - User activity state
    // ========================================================================

    async setupIdleDetection() {
        let lastActivity = Date.now();
        let idleTimeout = null;

        const resetIdleTimer = () => {
            lastActivity = Date.now();
            if (idleTimeout) {
                clearTimeout(idleTimeout);
            }
        };

        // Track user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });

        this.sensors.idle = {
            lastActivity,
            detectIdleState: () => {
                const idleTime = Date.now() - lastActivity;

                if (idleTime < 5000) return 'active'; // Active in last 5 seconds
                if (idleTime < 30000) return 'idle'; // Idle for 5-30 seconds
                return 'away'; // Away for more than 30 seconds
            }
        };

        // Try to use official Idle Detection API if available
        if ('IdleDetector' in window) {
            try {
                const idleDetector = new IdleDetector();
                idleDetector.addEventListener('change', () => {
                    const userState = idleDetector.userState; // 'active' or 'idle'
                    const screenState = idleDetector.screenState; // 'locked' or 'unlocked'

                    console.log(`Idle state: ${userState}, Screen: ${screenState}`);
                });

                await idleDetector.start({ threshold: 60000 });
                console.log('Idle detection API enabled');
            } catch (error) {
                console.warn('Idle detection API error:', error.message);
            }
        }

        console.log('Idle detection enabled');
    }

    // ========================================================================
    // NETWORK DETECTION - Connection quality
    // ========================================================================

    async setupNetworkDetection() {
        try {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            if (connection) {
                this.sensors.network = {
                    connection,
                    detectQuality: () => {
                        const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
                        const downlink = connection.downlink; // Mbps
                        const rtt = connection.rtt; // Round-trip time in ms

                        if (effectiveType === '4g' && downlink > 10) return 'excellent';
                        if (effectiveType === '4g' || downlink > 5) return 'good';
                        if (effectiveType === '3g') return 'fair';
                        return 'poor';
                    }
                };

                connection.addEventListener('change', () => {
                    console.log('Network conditions changed:', this.sensors.network.detectQuality());
                    this.updateContext();
                });

                console.log('Network detection enabled');
            } else {
                this.sensors.network = { detectQuality: () => 'unknown' };
            }
        } catch (error) {
            console.warn('Network detection not available:', error.message);
            this.sensors.network = { detectQuality: () => 'unknown' };
        }
    }

    // ========================================================================
    // CONTINUOUS DETECTION
    // ========================================================================

    start() {
        if (this.isRunning) return;

        this.isRunning = true;

        // Update context every second
        this.detectionInterval = setInterval(() => {
            this.updateContext();
        }, 1000);

        // Initial update
        this.updateContext();

        console.log('Context detection started');
    }

    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }

        // Stop all sensors
        if (this.sensors.audio?.stream) {
            this.sensors.audio.stream.getTracks().forEach(track => track.stop());
        }
        if (this.sensors.video?.stream) {
            this.sensors.video.stream.getTracks().forEach(track => track.stop());
        }
        if (this.sensors.light?.sensor) {
            this.sensors.light.sensor.stop();
        }

        console.log('Context detection stopped');
    }

    updateContext() {
        const updates = {
            environment: {
                noiseLevel: this.sensors.audio?.detectNoise() || 0,
                viewerCount: this.sensors.video?.detectViewers() || 1,
                lighting: this.sensors.light?.detectLighting() || 'normal',
                orientation: this.sensors.motion?.detectOrientation() || 'unknown'
            },
            user: {
                idleState: this.sensors.idle?.detectIdleState() || 'active',
                isBusy: this.sensors.idle?.detectIdleState() === 'active',
                networkQuality: this.sensors.network?.detectQuality() || 'unknown'
            }
        };

        // Update context manager
        this.context.updateContext(updates);
    }

    // ========================================================================
    // MANUAL SIMULATION (for testing without permissions)
    // ========================================================================

    simulate(config) {
        // Allow manual simulation for testing
        console.log('Simulating context:', config);

        this.context.updateContext({
            environment: {
                noiseLevel: config.noiseLevel !== undefined ? config.noiseLevel : this.context.context.environment.noiseLevel,
                viewerCount: config.viewerCount !== undefined ? config.viewerCount : this.context.context.environment.viewerCount,
                lighting: config.lighting || this.context.context.environment.lighting,
                isPublic: config.isPublic !== undefined ? config.isPublic : this.context.context.environment.isPublic
            },
            user: {
                isBusy: config.isBusy !== undefined ? config.isBusy : this.context.context.user.isBusy,
                inFocusMode: config.inFocusMode !== undefined ? config.inFocusMode : this.context.context.user.inFocusMode
            }
        });
    }
}

// Initialize context detection when ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        if (window.semanticContext) {
            window.contextDetection = new ContextDetectionSystem(window.semanticContext);

            // Don't auto-start (requires permissions)
            // User can manually start via window.contextDetection.start()

            console.log('Context detection system ready. Call window.contextDetection.start() to begin.');

            // Add keyboard shortcut to toggle (Ctrl+Shift+C)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                    e.preventDefault();
                    if (window.contextDetection.isRunning) {
                        window.contextDetection.stop();
                    } else {
                        window.contextDetection.start();
                    }
                }
            });
        }
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextDetectionSystem;
}
