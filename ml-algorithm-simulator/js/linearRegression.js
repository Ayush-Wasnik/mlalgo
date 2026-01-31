/**
 * linearRegression.js
 * Linear Regression Algorithm Implementation
 * Educational focus with step-by-step visualization
 */

const LinearRegression = {
    // Algorithm state
    points: [],
    slope: 0,
    intercept: 0,
    currentStep: 0,
    isRunning: false,
    
    // Learning rate for gradient descent visualization
    learningRate: 0.0001,
    iterations: 0,
    maxIterations: 100,
    
    // Calculated values for display
    predictions: [],
    residuals: [],
    mse: 0,
    rSquared: 0,

    /**
     * Algorithm explanation for the UI
     */
    explanation: {
        title: "Linear Regression",
        description: `
            <p>Linear Regression finds the <strong>best straight line</strong> that fits through your data points.</p>
            
            <h4>🎯 Goal</h4>
            <p>Minimize the distance between the line and all data points.</p>
            
            <h4>📐 The Line Equation</h4>
            <div class="formula-box">
                y = mx + b
                <br>
                m = slope (steepness)
                <br>
                b = intercept (where line crosses y-axis)
            </div>
            
            <h4>📊 How It Works</h4>
            <ul>
                <li><strong>Step 1:</strong> Calculate mean of X and Y values</li>
                <li><strong>Step 2:</strong> Calculate the slope (m)</li>
                <li><strong>Step 3:</strong> Calculate the intercept (b)</li>
                <li><strong>Step 4:</strong> Draw the best-fit line</li>
            </ul>
            
            <h4>📈 Measuring Success</h4>
            <ul>
                <li><strong>MSE:</strong> Mean Squared Error - average of squared distances</li>
                <li><strong>R²:</strong> How well the line explains the data (0-1)</li>
            </ul>
        `
    },

    /**
     * Parameter definitions for UI
     */
    parameters: [
        {
            id: 'learning-rate',
            name: 'Learning Rate',
            min: 0.00001,
            max: 0.001,
            step: 0.00001,
            default: 0.0001,
            description: 'How fast the algorithm adjusts (for gradient descent mode)'
        },
        {
            id: 'show-residuals',
            name: 'Show Residuals',
            type: 'checkbox',
            default: true,
            description: 'Display lines from points to the regression line'
        }
    ],

    /**
     * Initialize with data points
     * @param {Array} points - Array of {x, y} points
     */
    init: function(points) {
        this.points = [...points];
        this.currentStep = 0;
        this.isRunning = false;
        this.slope = 0;
        this.intercept = 0;
        this.predictions = [];
        this.residuals = [];
        this.mse = 0;
        this.rSquared = 0;
        
        console.log('📈 Linear Regression initialized with', points.length, 'points');
    },

    /**
     * Calculate means of X and Y
     * @returns {object} {meanX, meanY}
     */
    calculateMeans: function() {
        const n = this.points.length;
        if (n === 0) return { meanX: 0, meanY: 0 };
        
        const sumX = this.points.reduce((sum, p) => sum + p.x, 0);
        const sumY = this.points.reduce((sum, p) => sum + p.y, 0);
        
        return {
            meanX: sumX / n,
            meanY: sumY / n
        };
    },

    /**
     * Calculate slope using least squares formula
     * Formula: m = Σ((xi - x̄)(yi - ȳ)) / Σ((xi - x̄)²)
     */
    calculateSlope: function() {
        const { meanX, meanY } = this.calculateMeans();
        
        let numerator = 0;
        let denominator = 0;
        
        this.points.forEach(point => {
            const xDiff = point.x - meanX;
            const yDiff = point.y - meanY;
            numerator += xDiff * yDiff;
            denominator += xDiff * xDiff;
        });
        
        // Prevent division by zero
        this.slope = denominator !== 0 ? numerator / denominator : 0;
        return this.slope;
    },

    /**
     * Calculate intercept
     * Formula: b = ȳ - m * x̄
     */
    calculateIntercept: function() {
        const { meanX, meanY } = this.calculateMeans();
        this.intercept = meanY - this.slope * meanX;
        return this.intercept;
    },

    /**
     * Make predictions for all points
     */
    predict: function() {
        this.predictions = this.points.map(point => {
            return this.slope * point.x + this.intercept;
        });
        return this.predictions;
    },

    /**
     * Calculate residuals (errors)
     */
    calculateResiduals: function() {
        this.residuals = this.points.map((point, i) => {
            return point.y - this.predictions[i];
        });
        return this.residuals;
    },

    /**
     * Calculate Mean Squared Error
     */
    calculateMSE: function() {
        if (this.residuals.length === 0) return 0;
        
        const sumSquaredErrors = this.residuals.reduce((sum, r) => sum + r * r, 0);
        this.mse = sumSquaredErrors / this.residuals.length;
        return this.mse;
    },

    /**
     * Calculate R-squared (coefficient of determination)
     */
    calculateRSquared: function() {
        const { meanY } = this.calculateMeans();
        
        const ssTotal = this.points.reduce((sum, p) => {
            return sum + Math.pow(p.y - meanY, 2);
        }, 0);
        
        const ssResidual = this.residuals.reduce((sum, r) => sum + r * r, 0);
        
        this.rSquared = ssTotal !== 0 ? 1 - (ssResidual / ssTotal) : 0;
        return this.rSquared;
    },

    /**
     * Run complete algorithm (all steps at once)
     */
    run: function() {
        if (this.points.length < 2) {
            console.warn('Need at least 2 points for regression');
            return null;
        }
        
        this.calculateSlope();
        this.calculateIntercept();
        this.predict();
        this.calculateResiduals();
        this.calculateMSE();
        this.calculateRSquared();
        
        this.currentStep = 4; // All steps complete
        
        return {
            slope: this.slope,
            intercept: this.intercept,
            mse: this.mse,
            rSquared: this.rSquared
        };
    },

    /**
     * Execute single step (for step-by-step mode)
     * @returns {object} Step information
     */
    step: function() {
        let stepInfo = {};
        
        switch(this.currentStep) {
            case 0:
                // Step 1: Calculate means
                const means = this.calculateMeans();
                stepInfo = {
                    step: 1,
                    title: "Calculate Means",
                    description: `Finding the center of our data:\n• Mean X = ${means.meanX.toFixed(2)}\n• Mean Y = ${means.meanY.toFixed(2)}`,
                    highlight: 'means'
                };
                break;
                
            case 1:
                // Step 2: Calculate slope
                this.calculateSlope();
                stepInfo = {
                    step: 2,
                    title: "Calculate Slope",
                    description: `The slope determines the line's steepness:\n• Slope (m) = ${this.slope.toFixed(4)}\n• ${this.slope < 0 ? 'Negative slope: line goes down' : 'Positive slope: line goes up'}`,
                    highlight: 'slope'
                };
                break;
                
            case 2:
                // Step 3: Calculate intercept
                this.calculateIntercept();
                stepInfo = {
                    step: 3,
                    title: "Calculate Intercept",
                    description: `Where the line crosses the Y-axis:\n• Intercept (b) = ${this.intercept.toFixed(2)}`,
                    highlight: 'intercept'
                };
                break;
                
            case 3:
                // Step 4: Make predictions and calculate errors
                this.predict();
                this.calculateResiduals();
                this.calculateMSE();
                this.calculateRSquared();
                stepInfo = {
                    step: 4,
                    title: "Evaluate Model",
                    description: `Measuring how good our line is:\n• MSE = ${this.mse.toFixed(2)}\n• R² = ${(this.rSquared * 100).toFixed(1)}% of variance explained`,
                    highlight: 'complete'
                };
                break;
                
            default:
                stepInfo = {
                    step: this.currentStep,
                    title: "Complete",
                    description: "Algorithm finished! Adjust parameters or try new data.",
                    highlight: 'complete'
                };
        }
        
        this.currentStep++;
        return stepInfo;
    },

    /**
     * Visualize current state
     * @param {object} viz - Visualization object
     * @param {boolean} showResiduals - Whether to show residual lines
     */
    visualize: function(viz, showResiduals = true) {
        viz.clear();
        viz.drawGrid();
        
        // Draw points
        viz.drawPoints(this.points);
        
        // Draw regression line if calculated
        if (this.currentStep >= 3) {
            viz.drawRegressionLine(this.slope, this.intercept);
            
            // Draw residual lines
            if (showResiduals && this.predictions.length > 0) {
                this.points.forEach((point, i) => {
                    viz.drawLine(
                        point.x, point.y,
                        point.x, this.predictions[i],
                        '#fbbf24', // Yellow for residuals
                        1,
                        true // Dashed
                    );
                });
            }
        }
        
        // Draw mean lines if in step 1
        if (this.currentStep === 1) {
            const { meanX, meanY } = this.calculateMeans();
            viz.drawLine(0, meanY, viz.width, meanY, '#10b981', 1, true);
            viz.drawLine(meanX, 0, meanX, viz.height, '#10b981', 1, true);
            viz.drawPoint(meanX, meanY, '#10b981', 10);
            viz.drawText('Mean Point', meanX + 15, meanY - 10, '#10b981');
        }
    },

    /**
     * Get current statistics for display
     * @returns {object} Statistics object
     */
    getStats: function() {
        return {
            'Points': this.points.length,
            'Slope (m)': this.slope.toFixed(4),
            'Intercept (b)': this.intercept.toFixed(2),
            'MSE': this.mse.toFixed(2),
            'R² Score': (this.rSquared * 100).toFixed(1) + '%',
            'Step': this.currentStep + '/4'
        };
    },

    /**
     * Reset the algorithm
     */
    reset: function() {
        this.currentStep = 0;
        this.slope = 0;
        this.intercept = 0;
        this.predictions = [];
        this.residuals = [];
        this.mse = 0;
        this.rSquared = 0;
    }
};

// Make globally available
window.LinearRegression = LinearRegression;

console.log('📈 Linear Regression module loaded');