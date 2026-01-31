/**
 * visualization.js
 * Handles all canvas drawing and animations
 */

const Visualization = {
    canvas: null,
    ctx: null,
    width: 700,
    height: 500,

    // Color palette for visualization
    colors: {
        point: '#4f46e5',           // Primary purple
        pointHover: '#818cf8',       // Light purple
        line: '#ef4444',             // Red for regression line
        cluster: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], // Cluster colors
        centroid: '#1e293b',         // Dark for centroids
        grid: '#e2e8f0',             // Grid lines
        text: '#64748b',             // Text color
        highlight: '#fbbf24',        // Highlight yellow
        treeNode: '#10b981',         // Green for tree nodes
        treeLine: '#64748b'          // Gray for tree connections
    },

    /**
     * Initialize the visualization
     * @param {string} canvasId - Canvas element ID
     */
    init: function(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        console.log('🎨 Visualization initialized');
    },

    /**
     * Clear the canvas
     */
    clear: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },

    /**
     * Draw coordinate grid
     */
    drawGrid: function() {
        const ctx = this.ctx;
        const gridSize = 50;
        
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = gridSize; x < this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = gridSize; y < this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    },

    /**
     * Draw a single point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Point color
     * @param {number} radius - Point radius
     * @param {boolean} filled - Fill or stroke
     */
    drawPoint: function(x, y, color = this.colors.point, radius = 8, filled = true) {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (filled) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Add subtle shadow
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
    },

    /**
     * Draw all data points
     * @param {Array} points - Array of {x, y} points
     * @param {Array} colors - Optional array of colors for each point
     */
    drawPoints: function(points, colors = null) {
        points.forEach((point, index) => {
            const color = colors ? colors[index] : this.colors.point;
            this.drawPoint(point.x, point.y, color);
        });
    },

    /**
     * Draw a line
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     * @param {string} color - Line color
     * @param {number} width - Line width
     * @param {boolean} dashed - Dashed line
     */
    drawLine: function(x1, y1, x2, y2, color = this.colors.line, width = 2, dashed = false) {
        const ctx = this.ctx;
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        
        if (dashed) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        ctx.setLineDash([]); // Reset
    },

    /**
     * Draw regression line extending across canvas
     * @param {number} slope - Line slope
     * @param {number} intercept - Y-intercept
     * @param {string} color - Line color
     */
    drawRegressionLine: function(slope, intercept, color = this.colors.line) {
        const x1 = 0;
        const y1 = intercept;
        const x2 = this.width;
        const y2 = slope * this.width + intercept;
        
        this.drawLine(x1, y1, x2, y2, color, 3);
    },

    /**
     * Draw centroid (larger point with special styling)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Centroid color
     * @param {string} label - Optional label
     */
    drawCentroid: function(x, y, color, label = '') {
        const ctx = this.ctx;
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Inner filled circle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Cross mark
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
        
        // Label
        if (label) {
            ctx.fillStyle = this.colors.text;
            ctx.font = '12px Poppins';
            ctx.fillText(label, x + 20, y + 5);
        }
    },

    /**
     * Draw text on canvas
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Text color
     * @param {string} font - Font style
     */
    drawText: function(text, x, y, color = this.colors.text, font = '14px Poppins') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    },

    /**
     * Draw a rectangle (for decision tree regions)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} color - Fill color
     * @param {number} alpha - Opacity
     */
    drawRect: function(x, y, width, height, color, alpha = 0.2) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x, y, width, height);
        ctx.globalAlpha = 1;
        
        // Border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    },

    /**
     * Animate a point (pulse effect)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Point color
     * @param {function} callback - Callback when done
     */
    animatePoint: function(x, y, color, callback) {
        let radius = 5;
        const maxRadius = 20;
        const speed = 1;
        
        const animate = () => {
            // Clear area
            this.ctx.clearRect(x - maxRadius - 5, y - maxRadius - 5, 
                              maxRadius * 2 + 10, maxRadius * 2 + 10);
            
            // Draw expanding circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 1 - (radius / maxRadius);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
            
            radius += speed;
            
            if (radius < maxRadius) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };
        
        animate();
    },

    /**
     * Draw cluster connections (lines from points to centroids)
     * @param {Array} points - Data points
     * @param {Array} centroids - Centroid positions
     * @param {Array} assignments - Cluster assignments for each point
     */
    drawClusterConnections: function(points, centroids, assignments) {
        points.forEach((point, i) => {
            const centroid = centroids[assignments[i]];
            if (centroid) {
                this.drawLine(
                    point.x, point.y,
                    centroid.x, centroid.y,
                    this.colors.cluster[assignments[i]] + '40', // With transparency
                    1,
                    true // Dashed
                );
            }
        });
    },

    /**
     * Draw decision boundary (vertical or horizontal line)
     * @param {string} axis - 'x' or 'y'
     * @param {number} value - Split value
     * @param {object} bounds - {minX, maxX, minY, maxY}
     * @param {string} color - Line color
     */
    drawDecisionBoundary: function(axis, value, bounds, color = '#8b5cf6') {
        if (axis === 'x') {
            this.drawLine(value, bounds.minY, value, bounds.maxY, color, 2, true);
        } else {
            this.drawLine(bounds.minX, value, bounds.maxX, value, color, 2, true);
        }
    },

    /**
     * Draw tree node visualization
     * @param {object} node - Tree node
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} level - Tree level
     */
    drawTreeNode: function(node, x, y, level) {
        const ctx = this.ctx;
        const nodeRadius = 25;
        
        // Draw node circle
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.isLeaf ? '#10b981' : '#4f46e5';
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Poppins';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (node.isLeaf) {
            ctx.fillText(`Class ${node.label}`, x, y);
        } else {
            ctx.fillText(`${node.feature}`, x, y - 8);
            ctx.font = '10px Poppins';
            ctx.fillText(`< ${node.threshold.toFixed(0)}`, x, y + 8);
        }
        
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
};

// Make globally available
window.Visualization = Visualization;

console.log('🎨 Visualization module loaded');