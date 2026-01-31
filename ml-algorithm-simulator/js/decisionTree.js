/**
 * decisionTree.js
 * Decision Tree Classifier Implementation
 * Simplified for educational purposes
 */

const DecisionTree = {
    // Data
    points: [],
    
    // Tree structure
    tree: null,
    maxDepth: 3,
    minSamples: 2,
    
    // Visualization
    boundaries: [],
    regions: [],
    currentStep: 0,
    
    // Class labels (for visualization)
    classColors: ['#ef4444', '#3b82f6'],

    /**
     * Algorithm explanation
     */
    explanation: {
        title: "Decision Tree",
        description: `
            <p>A Decision Tree makes predictions by learning <strong>simple decision rules</strong> from data.</p>
            
            <h4>🎯 Goal</h4>
            <p>Create rules that split data into pure groups (same class).</p>
            
            <h4>🌳 How It Works</h4>
            <ul>
                <li><strong>Step 1:</strong> Find the best feature and value to split on</li>
                <li><strong>Step 2:</strong> Split data into two groups</li>
                <li><strong>Step 3:</strong> Repeat for each group</li>
                <li><strong>Step 4:</strong> Stop when groups are pure or max depth reached</li>
            </ul>
            
            <h4>📊 Splitting Criteria</h4>
            <p>We use <strong>Gini Impurity</strong> to find the best split:</p>
            <div class="formula-box">
                Gini = 1 - Σ(pi²)
                <br>
                Lower Gini = Better split
            </div>
            
            <h4>📍 For 2D Data</h4>
            <p>Splits create horizontal or vertical lines that divide the space into regions.</p>
        `
    },

    /**
     * Parameters
     */
    parameters: [
        {
            id: 'max-depth',
            name: 'Max Depth',
            min: 1,
            max: 5,
            step: 1,
            default: 3,
            description: 'Maximum tree depth (more = complex)'
        },
        {
            id: 'min-samples',
            name: 'Min Samples',
            min: 1,
            max: 10,
            step: 1,
            default: 2,
            description: 'Minimum points needed to split'
        }
    ],

    /**
     * Initialize
     */
    init: function(points) {
        // Assign labels if not present (for demo)
        this.points = points.map(p => ({
            x: p.x,
            y: p.y,
            label: p.label !== undefined ? p.label : (p.x < 350 ? 0 : 1) // Simple rule for demo
        }));
        
        this.tree = null;
        this.boundaries = [];
        this.regions = [];
        this.currentStep = 0;
        
        console.log('🌳 Decision Tree initialized with', points.length, 'points');
    },

    /**
     * Calculate Gini impurity
     */
    gini: function(points) {
        if (points.length === 0) return 0;
        
        const counts = {};
        points.forEach(p => {
            counts[p.label] = (counts[p.label] || 0) + 1;
        });
        
        let impurity = 1;
        for (const label in counts) {
            const prob = counts[label] / points.length;
            impurity -= prob * prob;
        }
        
        return impurity;
    },

    /**
     * Find best split
     */
    findBestSplit: function(points, bounds) {
        if (points.length < this.minSamples) return null;
        
        let bestGini = Infinity;
        let bestSplit = null;
        
        // Try splitting on X axis
        const xValues = [...new Set(points.map(p => p.x))].sort((a, b) => a - b);
        for (let i = 0; i < xValues.length - 1; i++) {
            const threshold = (xValues[i] + xValues[i + 1]) / 2;
            const left = points.filter(p => p.x < threshold);
            const right = points.filter(p => p.x >= threshold);
            
            if (left.length > 0 && right.length > 0) {
                const gini = (left.length * this.gini(left) + right.length * this.gini(right)) / points.length;
                if (gini < bestGini) {
                    bestGini = gini;
                    bestSplit = { feature: 'x', threshold, left, right };
                }
            }
        }
        
        // Try splitting on Y axis
        const yValues = [...new Set(points.map(p => p.y))].sort((a, b) => a - b);
        for (let i = 0; i < yValues.length - 1; i++) {
            const threshold = (yValues[i] + yValues[i + 1]) / 2;
            const left = points.filter(p => p.y < threshold);
            const right = points.filter(p => p.y >= threshold);
            
            if (left.length > 0 && right.length > 0) {
                const gini = (left.length * this.gini(left) + right.length * this.gini(right)) / points.length;
                if (gini < bestGini) {
                    bestGini = gini;
                    bestSplit = { feature: 'y', threshold, left, right };
                }
            }
        }
        
        return bestSplit;
    },

    /**
     * Get majority class
     */
    majorityClass: function(points) {
        const counts = {};
        points.forEach(p => {
            counts[p.label] = (counts[p.label] || 0) + 1;
        });
        
        let maxCount = 0;
        let majorityLabel = 0;
        for (const label in counts) {
            if (counts[label] > maxCount) {
                maxCount = counts[label];
                majorityLabel = parseInt(label);
            }
        }
        
        return majorityLabel;
    },

    /**
     * Build tree recursively
     */
    buildTree: function(points, depth = 0, bounds = { minX: 0, maxX: 700, minY: 0, maxY: 500 }) {
        // Base cases
        if (depth >= this.maxDepth || points.length < this.minSamples || this.gini(points) === 0) {
            const label = this.majorityClass(points);
            
            // Save region for visualization
            this.regions.push({
                bounds: { ...bounds },
                label: label
            });
            
            return {
                isLeaf: true,
                label: label,
                count: points.length,
                bounds: bounds
            };
        }
        
        // Find best split
        const split = this.findBestSplit(points, bounds);
        
        if (!split) {
            const label = this.majorityClass(points);
            this.regions.push({ bounds: { ...bounds }, label });
            return {
                isLeaf: true,
                label: label,
                count: points.length,
                bounds: bounds
            };
        }
        
        // Save boundary for visualization
        this.boundaries.push({
            feature: split.feature,
            threshold: split.threshold,
            bounds: { ...bounds },
            depth: depth
        });
        
        // Create child bounds
        let leftBounds, rightBounds;
        if (split.feature === 'x') {
            leftBounds = { ...bounds, maxX: split.threshold };
            rightBounds = { ...bounds, minX: split.threshold };
        } else {
            leftBounds = { ...bounds, maxY: split.threshold };
            rightBounds = { ...bounds, minY: split.threshold };
        }
        
        // Recurse
        return {
            isLeaf: false,
            feature: split.feature,
            threshold: split.threshold,
            gini: this.gini(points),
            left: this.buildTree(split.left, depth + 1, leftBounds),
            right: this.buildTree(split.right, depth + 1, rightBounds)
        };
    },

    /**
     * Run algorithm
     */
    run: function() {
        if (this.points.length < 2) {
            console.warn('Need more points');
            return null;
        }
        
        this.boundaries = [];
        this.regions = [];
        
        this.tree = this.buildTree(this.points);
        this.currentStep = this.boundaries.length + 1;
        
        return {
            tree: this.tree,
            boundaries: this.boundaries.length,
            regions: this.regions.length
        };
    },

    /**
     * Step through algorithm
     */
    step: function() {
        if (!this.tree) {
            this.run();
        }
        
        if (this.currentStep <= this.boundaries.length) {
            const boundary = this.boundaries[this.currentStep - 1];
            return {
                step: this.currentStep,
                title: `Split on ${boundary.feature.toUpperCase()}`,
                description: `Creating split at ${boundary.feature} = ${boundary.threshold.toFixed(0)}\nDepth: ${boundary.depth}`,
                highlight: 'boundary'
            };
        } else {
            return {
                step: 'Complete',
                title: 'Tree Built',
                description: `Tree complete with ${this.boundaries.length} splits and ${this.regions.length} regions.`,
                highlight: 'complete'
            };
        }
        
        this.currentStep++;
    },

    /**
     * Predict class for a point
     */
    predict: function(x, y) {
        let node = this.tree;
        
        while (node && !node.isLeaf) {
            if (node.feature === 'x') {
                node = x < node.threshold ? node.left : node.right;
            } else {
                node = y < node.threshold ? node.left : node.right;
            }
        }
        
        return node ? node.label : 0;
    },

    /**
     * Visualize
     */
    visualize: function(viz) {
        viz.clear();
        viz.drawGrid();
        
        // Draw regions with colors
        this.regions.forEach(region => {
            const color = this.classColors[region.label % this.classColors.length];
            viz.drawRect(
                region.bounds.minX,
                region.bounds.minY,
                region.bounds.maxX - region.bounds.minX,
                region.bounds.maxY - region.bounds.minY,
                color,
                0.15
            );
        });
        
        // Draw boundaries
        const showBoundaries = Math.min(this.currentStep, this.boundaries.length);
        for (let i = 0; i < showBoundaries; i++) {
            const b = this.boundaries[i];
            viz.drawDecisionBoundary(b.feature, b.threshold, b.bounds, '#8b5cf6');
        }
        
        // Draw points
        this.points.forEach(point => {
            const color = this.classColors[point.label % this.classColors.length];
            viz.drawPoint(point.x, point.y, color, 10);
        });
    },

    /**
     * Get stats
     */
    getStats: function() {
        return {
            'Points': this.points.length,
            'Max Depth': this.maxDepth,
            'Splits': this.boundaries.length,
            'Regions': this.regions.length,
            'Step': this.currentStep
        };
    },

    /**
     * Reset
     */
    reset: function() {
        this.tree = null;
        this.boundaries = [];
        this.regions = [];
        this.currentStep = 0;
    }
};

window.DecisionTree = DecisionTree;

console.log('🌳 Decision Tree module loaded');