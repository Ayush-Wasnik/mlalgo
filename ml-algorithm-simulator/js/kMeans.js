/**
 * kMeans.js
 * K-Means Clustering Algorithm Implementation
 * Educational visualization with step-by-step execution
 */

const KMeans = {
    // Data
    points: [],
    k: 3,                    // Number of clusters
    
    // Algorithm state
    centroids: [],
    assignments: [],         // Cluster assignment for each point
    previousAssignments: [],
    currentStep: 0,
    iteration: 0,
    maxIterations: 50,
    isConverged: false,
    isRunning: false,
    
    // History for animation
    history: [],

    /**
     * Algorithm explanation
     */
    explanation: {
        title: "K-Means Clustering",
        description: `
            <p>K-Means groups similar data points into <strong>K clusters</strong>.</p>
            
            <h4>🎯 Goal</h4>
            <p>Find K cluster centers that minimize the total distance from each point to its nearest center.</p>
            
            <h4>📊 How It Works</h4>
            <ul>
                <li><strong>Step 1:</strong> Randomly place K centroids</li>
                <li><strong>Step 2:</strong> Assign each point to nearest centroid</li>
                <li><strong>Step 3:</strong> Move centroids to cluster means</li>
                <li><strong>Step 4:</strong> Repeat until stable</li>
            </ul>
            
            <h4>🔄 Convergence</h4>
            <p>The algorithm stops when centroids stop moving (assignments don't change).</p>
            
            <h4>⚠️ Things to Note</h4>
            <ul>
                <li>Different starting positions may give different results</li>
                <li>K must be chosen beforehand</li>
                <li>Works best with spherical clusters</li>
            </ul>
        `
    },

    /**
     * Parameters for UI
     */
    parameters: [
        {
            id: 'k-clusters',
            name: 'Number of Clusters (K)',
            min: 2,
            max: 7,
            step: 1,
            default: 3,
            description: 'How many groups to create'
        },
        {
            id: 'max-iterations',
            name: 'Max Iterations',
            min: 10,
            max: 100,
            step: 10,
            default: 50,
            description: 'Maximum steps before stopping'
        }
    ],

    /**
     * Initialize algorithm
     * @param {Array} points - Data points
     * @param {number} k - Number of clusters
     */
    init: function(points, k = 3) {
        this.points = [...points];
        this.k = Math.min(k, points.length); // Can't have more clusters than points
        this.centroids = [];
        this.assignments = new Array(points.length).fill(-1);
        this.previousAssignments = [];
        this.currentStep = 0;
        this.iteration = 0;
        this.isConverged = false;
        this.isRunning = false;
        this.history = [];
        
        console.log('🎯 K-Means initialized with', points.length, 'points, K =', this.k);
    },

    /**
     * Initialize centroids randomly from data points
     */
    initializeCentroids: function() {
        this.centroids = [];
        const usedIndices = new Set();
        
        while (this.centroids.length < this.k) {
            const randomIndex = Math.floor(Math.random() * this.points.length);
            
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                this.centroids.push({
                    x: this.points[randomIndex].x,
                    y: this.points[randomIndex].y
                });
            }
        }
        
        console.log('Initialized', this.k, 'centroids');
    },

    /**
     * Calculate Euclidean distance between two points
     */
    distance: function(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    },

    /**
     * Assign each point to nearest centroid
     * @returns {boolean} Whether any assignments changed
     */
    assignPoints: function() {
        this.previousAssignments = [...this.assignments];
        let changed = false;
        
        this.points.forEach((point, i) => {
            let minDist = Infinity;
            let closestCentroid = 0;
            
            this.centroids.forEach((centroid, j) => {
                const dist = this.distance(point, centroid);
                if (dist < minDist) {
                    minDist = dist;
                    closestCentroid = j;
                }
            });
            
            if (this.assignments[i] !== closestCentroid) {
                changed = true;
            }
            this.assignments[i] = closestCentroid;
        });
        
        return changed;
    },

    /**
     * Update centroids to be mean of assigned points
     */
    updateCentroids: function() {
        const newCentroids = [];
        
        for (let i = 0; i < this.k; i++) {
            const clusterPoints = this.points.filter((_, j) => this.assignments[j] === i);
            
            if (clusterPoints.length > 0) {
                const meanX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
                const meanY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
                newCentroids.push({ x: meanX, y: meanY });
            } else {
                // Keep old centroid if no points assigned
                newCentroids.push(this.centroids[i]);
            }
        }
        
        this.centroids = newCentroids;
    },

    /**
     * Calculate total within-cluster sum of squares (WCSS)
     */
    calculateWCSS: function() {
        let wcss = 0;
        
        this.points.forEach((point, i) => {
            const centroid = this.centroids[this.assignments[i]];
            wcss += Math.pow(this.distance(point, centroid), 2);
        });
        
        return wcss;
    },

    /**
     * Run complete algorithm
     */
    run: function() {
        if (this.points.length < this.k) {
            console.warn('Not enough points for', this.k, 'clusters');
            return;
        }
        
        this.initializeCentroids();
        
        for (let i = 0; i < this.maxIterations; i++) {
            const changed = this.assignPoints();
            this.updateCentroids();
            this.iteration = i + 1;
            
            // Save state for history
            this.history.push({
                centroids: JSON.parse(JSON.stringify(this.centroids)),
                assignments: [...this.assignments]
            });
            
            if (!changed) {
                this.isConverged = true;
                break;
            }
        }
        
        this.currentStep = 3;
        
        return {
            centroids: this.centroids,
            assignments: this.assignments,
            iterations: this.iteration,
            wcss: this.calculateWCSS()
        };
    },

    /**
     * Execute single step
     */
    step: function() {
        let stepInfo = {};
        
        switch(this.currentStep % 3) {
            case 0:
                if (this.iteration === 0) {
                    // First step: Initialize centroids
                    this.initializeCentroids();
                    stepInfo = {
                        step: 1,
                        title: "Initialize Centroids",
                        description: `Placed ${this.k} random centroids.\nThese are the initial cluster centers.`,
                        highlight: 'centroids'
                    };
                } else {
                    // Start new iteration
                    const changed = this.assignPoints();
                    if (!changed) {
                        this.isConverged = true;
                        stepInfo = {
                            step: 'Done',
                            title: "Converged!",
                            description: `Algorithm converged after ${this.iteration} iterations.\nNo points changed clusters.`,
                            highlight: 'complete'
                        };
                        return stepInfo;
                    }
                    stepInfo = {
                        step: `Iteration ${this.iteration + 1} - Assign`,
                        title: "Assign Points to Clusters",
                        description: `Each point assigned to nearest centroid.\nPoints can change clusters between iterations.`,
                        highlight: 'assignments'
                    };
                }
                break;
                
            case 1:
                // Assign points
                this.assignPoints();
                stepInfo = {
                    step: `Iteration ${this.iteration + 1} - Assign`,
                    title: "Assign Points to Clusters",
                    description: `Each point assigned to its nearest centroid based on Euclidean distance.`,
                    highlight: 'assignments'
                };
                break;
                
            case 2:
                // Update centroids
                this.updateCentroids();
                this.iteration++;
                
                // Save to history
                this.history.push({
                    centroids: JSON.parse(JSON.stringify(this.centroids)),
                    assignments: [...this.assignments]
                });
                
                stepInfo = {
                    step: `Iteration ${this.iteration} - Update`,
                    title: "Update Centroids",
                    description: `Centroids moved to the mean position of their cluster points.\nWCSS: ${this.calculateWCSS().toFixed(2)}`,
                    highlight: 'centroids'
                };
                break;
        }
        
        this.currentStep++;
        return stepInfo;
    },

    /**
     * Visualize current state
     * @param {object} viz - Visualization object
     */
    visualize: function(viz) {
        viz.clear();
        viz.drawGrid();
        
        const colors = viz.colors.cluster;
        
        // Draw cluster connections (lines to centroids)
        if (this.centroids.length > 0 && this.assignments.some(a => a >= 0)) {
            viz.drawClusterConnections(this.points, this.centroids, this.assignments);
        }
        
        // Draw points with cluster colors
        this.points.forEach((point, i) => {
            const clusterIndex = this.assignments[i];
            const color = clusterIndex >= 0 ? colors[clusterIndex % colors.length] : viz.colors.point;
            viz.drawPoint(point.x, point.y, color, 8);
        });
        
        // Draw centroids
        this.centroids.forEach((centroid, i) => {
            viz.drawCentroid(centroid.x, centroid.y, colors[i % colors.length], `C${i + 1}`);
        });
        
        // Draw iteration info
        if (this.iteration > 0) {
            viz.drawText(`Iteration: ${this.iteration}`, 10, 20, '#1e293b', 'bold 14px Poppins');
            if (this.isConverged) {
                viz.drawText('✓ Converged', 10, 40, '#10b981', 'bold 14px Poppins');
            }
        }
    },

    /**
     * Get statistics
     */
    getStats: function() {
        const clusterSizes = new Array(this.k).fill(0);
        this.assignments.forEach(a => {
            if (a >= 0) clusterSizes[a]++;
        });
        
        const stats = {
            'Points': this.points.length,
            'Clusters (K)': this.k,
            'Iteration': this.iteration,
            'WCSS': this.calculateWCSS().toFixed(2),
            'Converged': this.isConverged ? 'Yes ✓' : 'No'
        };
        
        // Add cluster sizes
        clusterSizes.forEach((size, i) => {
            stats[`Cluster ${i + 1} Size`] = size;
        });
        
        return stats;
    },

    /**
     * Reset algorithm
     */
    reset: function() {
        this.centroids = [];
        this.assignments = new Array(this.points.length).fill(-1);
        this.previousAssignments = [];
        this.currentStep = 0;
        this.iteration = 0;
        this.isConverged = false;
        this.history = [];
    }
};

// Make globally available
window.KMeans = KMeans;

console.log('🎯 K-Means module loaded');