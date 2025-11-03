/**
 * ML-Enhanced Attention Budget System
 * Uses machine learning to optimize attention scoring based on user behavior
 * Learns from user interactions to predict what actually matters
 */

class MLAttentionScorer {
    constructor(contextManager) {
        this.context = contextManager;
        this.interactionHistory = [];
        this.maxHistorySize = 1000;

        // Feature weights (learned over time)
        this.weights = {
            urgency: 2.0,
            timeOfDay: 0.5,
            userState: 1.5,
            environmentNoise: 0.8,
            viewerCount: 1.0,
            historicalEngagement: 1.8,
            contextSimilarity: 1.2,
            recency: 0.6,
            frequency: 0.7
        };

        // Training data
        this.trainingData = [];
        this.model = null;

        this.init();
    }

    init() {
        this.loadHistoryFromStorage();
        this.startLearning();
        console.log('ML Attention Scorer initialized');
    }

    /**
     * Calculate attention score using ML-enhanced algorithm
     */
    calculateScore(component, context) {
        const features = this.extractFeatures(component, context);
        const baseScore = this.computeBaseScore(features);
        const mlAdjustment = this.computeMLAdjustment(features);
        const finalScore = baseScore * (1 + mlAdjustment);

        return Math.max(0, Math.min(100, finalScore));
    }

    /**
     * Extract features for ML model
     */
    extractFeatures(component, context) {
        const urgency = this.getUrgencyValue(component.getAttribute('urgency'));
        const priority = component.getAttribute('priority') || 'passive-info';
        const canDefer = component.getAttribute('can-defer') !== 'false';

        return {
            // Component features
            urgency,
            priority: this.getPriorityValue(priority),
            canDefer: canDefer ? 0 : 1,
            attentionWeight: parseFloat(component.getAttribute('attention-weight') || '50'),

            // Context features
            timeOfDay: this.getTimeOfDayFeature(),
            dayOfWeek: new Date().getDay() / 7,
            noiseLevel: context.environment.noiseLevel / 100,
            viewerCount: Math.log(context.environment.viewerCount + 1),
            userBusy: context.user.isBusy ? 1 : 0,
            userFocus: context.user.inFocusMode ? 1 : 0,

            // Historical features
            historicalEngagement: this.getHistoricalEngagement(component),
            contextSimilarity: this.getContextSimilarity(context),
            recency: this.getRecencyFactor(component),
            frequency: this.getFrequencyFactor(component),

            // Derived features
            urgencyTimeCombination: urgency * this.getTimeOfDayFeature(),
            noiseBusyCombination: (context.environment.noiseLevel / 100) * (context.user.isBusy ? 1 : 0)
        };
    }

    /**
     * Compute base attention score from features
     */
    computeBaseScore(features) {
        let score = 0;

        // Weighted sum of features
        score += features.urgency * this.weights.urgency * 25;
        score += features.priority * 15;
        score += features.attentionWeight * 0.5;
        score += features.historicalEngagement * this.weights.historicalEngagement * 10;
        score += features.contextSimilarity * this.weights.contextSimilarity * 8;

        // Penalties
        if (features.userBusy && features.canDefer) {
            score *= 0.3;
        }

        if (features.userFocus && features.urgency < 2) {
            score *= 0.5;
        }

        if (features.noiseLevel > 0.7 && features.urgency < 2) {
            score *= 0.7;
        }

        return score;
    }

    /**
     * ML-based adjustment to base score
     * Uses learned patterns from user behavior
     */
    computeMLAdjustment(features) {
        if (this.trainingData.length < 50) {
            return 0; // Not enough data yet
        }

        // Simple neural network-like calculation
        // In production, use TensorFlow.js for real ML

        let adjustment = 0;

        // Pattern 1: User tends to engage more at certain times
        const timePattern = this.findTimePattern(features.timeOfDay);
        adjustment += timePattern * 0.3;

        // Pattern 2: User interaction with similar components
        const similarityPattern = this.findSimilarityPattern(features);
        adjustment += similarityPattern * 0.4;

        // Pattern 3: Context-dependent engagement
        const contextPattern = this.findContextPattern(features);
        adjustment += contextPattern * 0.3;

        return adjustment;
    }

    /**
     * Record user interaction for learning
     */
    recordInteraction(component, action, context) {
        const interaction = {
            timestamp: Date.now(),
            componentType: component.tagName.toLowerCase(),
            componentId: component.id || 'unnamed',
            action, // 'activate', 'inspect', 'dismiss', 'ignore'
            features: this.extractFeatures(component, context),
            context: {
                timeOfDay: this.getTimeOfDayFeature(),
                dayOfWeek: new Date().getDay(),
                noiseLevel: context.environment.noiseLevel,
                viewerCount: context.environment.viewerCount,
                userBusy: context.user.isBusy,
                userFocus: context.user.inFocusMode
            }
        };

        this.interactionHistory.push(interaction);

        // Limit history size
        if (this.interactionHistory.length > this.maxHistorySize) {
            this.interactionHistory.shift();
        }

        // Add to training data if it's a positive engagement
        if (action === 'activate' || action === 'inspect') {
            this.trainingData.push({
                features: interaction.features,
                label: 1 // User engaged
            });
        } else if (action === 'dismiss' || action === 'ignore') {
            this.trainingData.push({
                features: interaction.features,
                label: 0 // User didn't engage
            });
        }

        // Retrain periodically
        if (this.trainingData.length % 20 === 0) {
            this.train();
        }

        this.saveHistoryToStorage();
    }

    /**
     * Train the model on collected data
     */
    train() {
        if (this.trainingData.length < 50) return;

        console.log(`Training on ${this.trainingData.length} interactions...`);

        // Simple gradient descent on weights
        const learningRate = 0.01;
        const epochs = 10;

        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalError = 0;

            for (const example of this.trainingData) {
                const predicted = this.predict(example.features);
                const error = example.label - predicted;
                totalError += Math.abs(error);

                // Update weights
                for (const key in this.weights) {
                    if (example.features[key] !== undefined) {
                        this.weights[key] += learningRate * error * example.features[key];
                    }
                }
            }

            if (epoch % 5 === 0) {
                console.log(`Epoch ${epoch}, Avg Error: ${(totalError / this.trainingData.length).toFixed(4)}`);
            }
        }

        console.log('Training complete. New weights:', this.weights);
    }

    /**
     * Predict engagement probability
     */
    predict(features) {
        let score = 0;
        for (const key in this.weights) {
            if (features[key] !== undefined) {
                score += this.weights[key] * features[key];
            }
        }
        return 1 / (1 + Math.exp(-score)); // Sigmoid activation
    }

    /**
     * Find time-based patterns in user engagement
     */
    findTimePattern(currentTime) {
        const relevantInteractions = this.interactionHistory.filter(i => {
            const timeDiff = Math.abs(i.features.timeOfDay - currentTime);
            return timeDiff < 0.1; // Within ~2.4 hours
        });

        if (relevantInteractions.length < 5) return 0;

        const engagementRate = relevantInteractions.filter(i =>
            i.action === 'activate' || i.action === 'inspect'
        ).length / relevantInteractions.length;

        return (engagementRate - 0.5) * 2; // Normalize to [-1, 1]
    }

    /**
     * Find similarity patterns
     */
    findSimilarityPattern(features) {
        const similarInteractions = this.interactionHistory.filter(i => {
            const similarity = this.cosineSimilarity(features, i.features);
            return similarity > 0.7;
        });

        if (similarInteractions.length < 3) return 0;

        const engagementRate = similarInteractions.filter(i =>
            i.action === 'activate' || i.action === 'inspect'
        ).length / similarInteractions.length;

        return (engagementRate - 0.5) * 2;
    }

    /**
     * Find context-dependent patterns
     */
    findContextPattern(features) {
        const contextKey = `${features.userBusy}_${features.userFocus}_${Math.floor(features.noiseLevel * 4)}`;

        const contextInteractions = this.interactionHistory.filter(i => {
            const key = `${i.context.userBusy}_${i.context.userFocus}_${Math.floor(i.context.noiseLevel / 25)}`;
            return key === contextKey;
        });

        if (contextInteractions.length < 5) return 0;

        const engagementRate = contextInteractions.filter(i =>
            i.action === 'activate' || i.action === 'inspect'
        ).length / contextInteractions.length;

        return (engagementRate - 0.5) * 2;
    }

    /**
     * Calculate cosine similarity between feature vectors
     */
    cosineSimilarity(f1, f2) {
        const keys = new Set([...Object.keys(f1), ...Object.keys(f2)]);
        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        keys.forEach(key => {
            const v1 = f1[key] || 0;
            const v2 = f2[key] || 0;
            dotProduct += v1 * v2;
            mag1 += v1 * v1;
            mag2 += v2 * v2;
        });

        if (mag1 === 0 || mag2 === 0) return 0;
        return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
    }

    /**
     * Helper: Get urgency numeric value
     */
    getUrgencyValue(urgency) {
        const map = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
        return map[urgency] || 1;
    }

    /**
     * Helper: Get priority numeric value
     */
    getPriorityValue(priority) {
        const map = {
            'user-initiated': 5,
            'system-critical': 4,
            'time-sensitive': 3,
            'user-requested': 2,
            'passive-info': 1,
            'promotional': 0
        };
        return map[priority] || 1;
    }

    /**
     * Helper: Time of day as 0-1 value
     */
    getTimeOfDayFeature() {
        const hour = new Date().getHours();
        return hour / 24;
    }

    /**
     * Helper: Historical engagement for component
     */
    getHistoricalEngagement(component) {
        const componentId = component.id || component.tagName.toLowerCase();
        const interactions = this.interactionHistory.filter(i =>
            i.componentId === componentId || i.componentType === componentId
        );

        if (interactions.length === 0) return 0.5; // Neutral

        const engaged = interactions.filter(i =>
            i.action === 'activate' || i.action === 'inspect'
        ).length;

        return engaged / interactions.length;
    }

    /**
     * Helper: Context similarity to past successful interactions
     */
    getContextSimilarity(context) {
        const successfulInteractions = this.interactionHistory.filter(i =>
            i.action === 'activate' || i.action === 'inspect'
        );

        if (successfulInteractions.length === 0) return 0.5;

        const currentContext = {
            timeOfDay: this.getTimeOfDayFeature(),
            noiseLevel: context.environment.noiseLevel / 100,
            viewerCount: Math.log(context.environment.viewerCount + 1),
            userBusy: context.user.isBusy ? 1 : 0,
            userFocus: context.user.inFocusMode ? 1 : 0
        };

        const similarities = successfulInteractions.map(i =>
            this.cosineSimilarity(currentContext, {
                timeOfDay: i.context.timeOfDay / 24,
                noiseLevel: i.context.noiseLevel / 100,
                viewerCount: Math.log(i.context.viewerCount + 1),
                userBusy: i.context.userBusy ? 1 : 0,
                userFocus: i.context.userFocus ? 1 : 0
            })
        );

        return similarities.reduce((a, b) => a + b, 0) / similarities.length;
    }

    /**
     * Helper: Recency factor
     */
    getRecencyFactor(component) {
        const componentId = component.id || component.tagName.toLowerCase();
        const lastInteraction = this.interactionHistory
            .reverse()
            .find(i => i.componentId === componentId || i.componentType === componentId);

        if (!lastInteraction) return 1; // New component

        const hoursSince = (Date.now() - lastInteraction.timestamp) / (1000 * 60 * 60);
        return Math.exp(-hoursSince / 24); // Decay over 24 hours
    }

    /**
     * Helper: Frequency factor
     */
    getFrequencyFactor(component) {
        const componentId = component.id || component.tagName.toLowerCase();
        const last24h = Date.now() - (24 * 60 * 60 * 1000);

        const recentInteractions = this.interactionHistory.filter(i =>
            (i.componentId === componentId || i.componentType === componentId) &&
            i.timestamp > last24h
        );

        return Math.min(1, recentInteractions.length / 10);
    }

    /**
     * Save interaction history to localStorage
     */
    saveHistoryToStorage() {
        try {
            localStorage.setItem('semantic-ml-history', JSON.stringify({
                history: this.interactionHistory.slice(-500), // Save last 500
                weights: this.weights,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Could not save ML history:', e);
        }
    }

    /**
     * Load interaction history from localStorage
     */
    loadHistoryFromStorage() {
        try {
            const stored = localStorage.getItem('semantic-ml-history');
            if (stored) {
                const data = JSON.parse(stored);
                this.interactionHistory = data.history || [];
                this.weights = { ...this.weights, ...data.weights };
                console.log(`Loaded ${this.interactionHistory.length} historical interactions`);
            }
        } catch (e) {
            console.warn('Could not load ML history:', e);
        }
    }

    /**
     * Start learning from user interactions
     */
    startLearning() {
        // Listen to all intents
        document.addEventListener('intent', (e) => {
            const component = e.target;
            const action = e.detail.type;

            if (window.semanticContext) {
                this.recordInteraction(component, action, window.semanticContext.context);
            }
        });

        console.log('ML learning started');
    }

    /**
     * Get insights about learned patterns
     */
    getInsights() {
        return {
            totalInteractions: this.interactionHistory.length,
            trainingExamples: this.trainingData.length,
            weights: this.weights,
            engagementRate: this.calculateOverallEngagementRate(),
            topEngagedComponents: this.getTopEngagedComponents(),
            bestTimes: this.getBestEngagementTimes()
        };
    }

    calculateOverallEngagementRate() {
        if (this.interactionHistory.length === 0) return 0;

        const engaged = this.interactionHistory.filter(i =>
            i.action === 'activate' || i.action === 'inspect'
        ).length;

        return (engaged / this.interactionHistory.length * 100).toFixed(1) + '%';
    }

    getTopEngagedComponents() {
        const componentCounts = {};

        this.interactionHistory
            .filter(i => i.action === 'activate' || i.action === 'inspect')
            .forEach(i => {
                const key = i.componentId || i.componentType;
                componentCounts[key] = (componentCounts[key] || 0) + 1;
            });

        return Object.entries(componentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }

    getBestEngagementTimes() {
        const hourCounts = Array(24).fill(0);
        const hourEngaged = Array(24).fill(0);

        this.interactionHistory.forEach(i => {
            const hour = new Date(i.timestamp).getHours();
            hourCounts[hour]++;
            if (i.action === 'activate' || i.action === 'inspect') {
                hourEngaged[hour]++;
            }
        });

        const rates = hourCounts.map((count, hour) => ({
            hour,
            rate: count > 0 ? hourEngaged[hour] / count : 0
        }));

        return rates
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 3)
            .filter(r => r.rate > 0)
            .map(r => ({ hour: `${r.hour}:00`, rate: (r.rate * 100).toFixed(0) + '%' }));
    }
}

// Initialize ML scorer
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (window.semanticContext) {
            window.mlAttentionScorer = new MLAttentionScorer(window.semanticContext);

            // Integrate with context manager
            const originalAllocate = window.semanticContext.allocateAttention;
            window.semanticContext.allocateAttention = function() {
                // Use ML scoring instead of basic scoring
                const needsAttention = Array.from(this.components)
                    .filter(c => c.computeAttentionScore)
                    .map(c => ({
                        component: c,
                        score: window.mlAttentionScorer.calculateScore(c, this.context)
                    }))
                    .sort((a, b) => b.score - a.score);

                // Rest of allocation logic...
                let screenUsed = 0;
                let audioUsed = 0;
                let cognitiveUsed = 0;

                needsAttention.forEach(({ component, score }) => {
                    const needs = component.getAttentionNeeds();

                    const canAllocate =
                        screenUsed + needs.screen <= this.context.attention.maxScreenSpace &&
                        audioUsed + needs.audio <= this.context.attention.maxAudioTime &&
                        cognitiveUsed + needs.cognitive <= this.context.attention.maxCognitiveLoad;

                    if (canAllocate && score > 10) {
                        component.setAttribute('attention-state', 'allocated');
                        component.setAttribute('data-ml-score', Math.round(score));
                        screenUsed += needs.screen;
                        audioUsed += needs.audio;
                        cognitiveUsed += needs.cognitive;
                    } else {
                        component.setAttribute('attention-state', 'deferred');
                    }
                });

                this.context.attention.usedScreenSpace = screenUsed;
                this.context.attention.usedAudioTime = audioUsed;
                this.context.attention.usedCognitiveLoad = cognitiveUsed;
            };

            console.log('ML Attention Scoring enabled');
            console.log('Get insights: window.mlAttentionScorer.getInsights()');
        }
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLAttentionScorer;
}
