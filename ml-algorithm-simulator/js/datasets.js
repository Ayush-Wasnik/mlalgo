/**
 * datasets.js
 * Contains sample datasets for the ML simulator
 * Each dataset is an array of {x, y} points
 */

const Datasets = {
    // Sample dataset 1 - Linear pattern (good for regression)
    sample1: [
        { x: 50, y: 400 },
        { x: 80, y: 380 },
        { x: 120, y: 350 },
        { x: 150, y: 320 },
        { x: 180, y: 290 },
        { x: 220, y: 270 },
        { x: 260, y: 250 },
        { x: 300, y: 220 },
        { x: 350, y: 200 },
        { x: 400, y: 170 },
        { x: 450, y: 150 },
        { x: 500, y: 120 },
        { x: 550, y: 100 },
        { x: 600, y: 80 },
        { x: 650, y: 50 }
    ],

    // Sample dataset 2 - Cluster pattern (good for K-means)
    sample2: [
        // Cluster 1 (top-left)
        { x: 100, y: 100 },
        { x: 120, y: 80 },
        { x: 80, y: 120 },
        { x: 110, y: 130 },
        { x: 90, y: 90 },
        
        // Cluster 2 (top-right)
        { x: 550, y: 100 },
        { x: 580, y: 120 },
        { x: 530, y: 80 },
        { x: 560, y: 140 },
        { x: 540, y: 110 },
        
        // Cluster 3 (bottom-center)
        { x: 350, y: 400 },
        { x: 320, y: 420 },
        { x: 380, y: 380 },
        { x: 340, y: 440 },
        { x: 370, y: 410 }
    ],

    // Sample dataset 3 - Classification pattern (good for decision trees)
    sample3: [
        // Class A (blue) - left side
        { x: 100, y: 150, label: 0 },
        { x: 120, y: 200, label: 0 },
        { x: 80, y: 250, label: 0 },
        { x: 150, y: 180, label: 0 },
        { x: 130, y: 300, label: 0 },
        
        // Class B (red) - right side
        { x: 500, y: 150, label: 1 },
        { x: 550, y: 200, label: 1 },
        { x: 480, y: 250, label: 1 },
        { x: 520, y: 180, label: 1 },
        { x: 540, y: 300, label: 1 }
    ],

    /**
     * Generate random dataset
     * @param {number} count - Number of points to generate
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {string} pattern - 'random', 'linear', 'clusters'
     * @returns {Array} Array of point objects
     */
    generateRandom: function(count = 20, canvasWidth = 700, canvasHeight = 500, pattern = 'random') {
        const points = [];
        const padding = 50;

        switch(pattern) {
            case 'linear':
                // Generate points with linear trend + noise
                for (let i = 0; i < count; i++) {
                    const x = padding + (i / count) * (canvasWidth - 2 * padding);
                    const noise = (Math.random() - 0.5) * 100;
                    const y = canvasHeight - padding - (i / count) * (canvasHeight - 2 * padding) + noise;
                    points.push({ x, y });
                }
                break;

            case 'clusters':
                // Generate 3 clusters
                const clusterCenters = [
                    { x: 150, y: 150 },
                    { x: 550, y: 150 },
                    { x: 350, y: 400 }
                ];
                
                for (let i = 0; i < count; i++) {
                    const center = clusterCenters[i % 3];
                    const x = center.x + (Math.random() - 0.5) * 100;
                    const y = center.y + (Math.random() - 0.5) * 100;
                    points.push({ x, y });
                }
                break;

            default:
                // Random scatter
                for (let i = 0; i < count; i++) {
                    points.push({
                        x: padding + Math.random() * (canvasWidth - 2 * padding),
                        y: padding + Math.random() * (canvasHeight - 2 * padding)
                    });
                }
        }

        return points;
    },

    /**
     * Get dataset by name
     * @param {string} name - Dataset name
     * @returns {Array} Dataset points
     */
    get: function(name) {
        if (this[name]) {
            // Return a copy to prevent modification
            return JSON.parse(JSON.stringify(this[name]));
        }
        return this.sample1;
    }
};

// Make it available globally
window.Datasets = Datasets;

console.log('📊 Datasets module loaded');