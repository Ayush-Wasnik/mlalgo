/**
 * main.js
 * Main application controller
 * Connects all modules together
 */

// Application state
const App = {
    currentAlgorithm: 'linear-regression',
    dataPoints: [],
    isRunning: false,
    animationSpeed: 5,
    
    // References to DOM elements
    elements: {},
    
    // Algorithm instances
    algorithms: {
        'linear-regression': LinearRegression,
        'k-means': KMeans,
        'decision-tree': DecisionTree
    }
};

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 Initializing ML Simulator...');
    
    // Cache DOM elements
    cacheElements();
    
    // Initialize visualization
    Visualization.init('main-canvas');
    
    // Load default dataset
    loadDataset('sample1');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial algorithm
    selectAlgorithm('linear-regression');
    
    console.log('✅ Application initialized');
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
    App.elements = {
        canvas: document.getElementById('main-canvas'),
        canvasOverlay: document.getElementById('canvas-overlay'),
        datasetSelect: document.getElementById('dataset-select'),
        generateBtn: document.getElementById('generate-data-btn'),
        clearBtn: document.getElementById('clear-data-btn'),
        runBtn: document.getElementById('run-btn'),
        stepBtn: document.getElementById('step-btn'),
        resetBtn: document.getElementById('reset-btn'),
        speedSlider: document.getElementById('speed-slider'),
        parametersPanel: document.getElementById('parameters-panel'),
        explanationContent: document.getElementById('explanation-content'),
        stepInfo: document.getElementById('step-info'),
        statsContent: document.getElementById('stats-content'),
        helpModal: document.getElementById('help-modal'),
        helpLink: document.getElementById('help-link')
    };
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Algorithm selection buttons
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const algo = e.currentTarget.dataset.algo;
            selectAlgorithm(algo);
        });
    });
    
    // Dataset selection
    App.elements.datasetSelect.addEventListener('change', (e) => {
        loadDataset(e.target.value);
    });
    
    // Generate random data
    App.elements.generateBtn.addEventListener('click', () => {
        generateRandomData();
    });
    
    // Clear data
    App.elements.clearBtn.addEventListener('click', () => {
        clearData();
    });
    
    // Run algorithm
    App.elements.runBtn.addEventListener('click', () => {
        runAlgorithm();
    });
    
    // Step through
    App.elements.stepBtn.addEventListener('click', () => {
        stepAlgorithm();
    });
    
    // Reset
    App.elements.resetBtn.addEventListener('click', () => {
        resetAlgorithm();
    });
    
    // Speed control
    App.elements.speedSlider.addEventListener('input', (e) => {
        App.animationSpeed = parseInt(e.target.value);
    });
    
    // Canvas click to add points
    App.elements.canvas.addEventListener('click', (e) => {
        const rect = App.elements.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addPoint(x, y);
    });
    
    // Help modal
    App.elements.helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        App.elements.helpModal.classList.add('show');
    });
    
    document.querySelector('.close-btn').addEventListener('click', () => {
        App.elements.helpModal.classList.remove('show');
    });
    
    // Close modal on outside click
    App.elements.helpModal.addEventListener('click', (e) => {
        if (e.target === App.elements.helpModal) {
            App.elements.helpModal.classList.remove('show');
        }
    });
}

/**
 * Select an algorithm
 */
function selectAlgorithm(algoId) {
    App.currentAlgorithm = algoId;
    
    // Update UI
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.algo === algoId);
    });
    
    const algo = App.algorithms[algoId];
    
    // Update explanation
    App.elements.explanationContent.innerHTML = algo.explanation.description;
    
    // Update parameters panel
    updateParametersPanel(algo.parameters);
    
    // Initialize algorithm with current data
    initializeCurrentAlgorithm();
    
    // Redraw
    visualize();
    
    console.log('Selected algorithm:', algoId);
}

/**
 * Update parameters panel based on algorithm
 */
function updateParametersPanel(params) {
    let html = '<h3>⚙️ Parameters</h3>';
    
    params.forEach(param => {
        if (param.type === 'checkbox') {
            html += `
                <div class="parameter-group">
                    <label>
                        <input type="checkbox" id="${param.id}" 
                               ${param.default ? 'checked' : ''}>
                        ${param.name}
                    </label>
                    <p class="parameter-description">${param.description}</p>
                </div>
            `;
        } else {
            html += `
                <div class="parameter-group">
                    <label for="${param.id}">${param.name}</label>
                    <input type="range" id="${param.id}" 
                           min="${param.min}" max="${param.max}" 
                           step="${param.step}" value="${param.default}">
                    <span class="parameter-value" id="${param.id}-value">${param.default}</span>
                    <p class="parameter-description">${param.description}</p>
                </div>
            `;
        }
    });
    
    App.elements.parametersPanel.innerHTML = html;
    
    // Add change listeners to sliders
    params.forEach(param => {
        if (param.type !== 'checkbox') {
            const slider = document.getElementById(param.id);
            const valueDisplay = document.getElementById(`${param.id}-value`);
            
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
                onParameterChange(param.id, e.target.value);
            });
        }
    });
}

/**
 * Handle parameter changes
 */
function onParameterChange(paramId, value) {
    const algo = App.algorithms[App.currentAlgorithm];
    
    switch(paramId) {
        case 'k-clusters':
            if (algo === KMeans) {
                KMeans.k = parseInt(value);
                initializeCurrentAlgorithm();
            }
            break;
        case 'max-depth':
            if (algo === DecisionTree) {
                DecisionTree.maxDepth = parseInt(value);
            }
            break;
        case 'learning-rate':
            if (algo === LinearRegression) {
                LinearRegression.learningRate = parseFloat(value);
            }
            break;
    }
    
    visualize();
}

/**
 * Load a dataset
 */
function loadDataset(name) {
    if (name === 'custom') {
        App.dataPoints = [];
        App.elements.canvasOverlay.classList.remove('hidden');
    } else {
        App.dataPoints = Datasets.get(name);
        App.elements.canvasOverlay.classList.add('hidden');
    }
    
    initializeCurrentAlgorithm();
    visualize();
    updateStats();
    
    console.log('Loaded dataset:', name, 'with', App.dataPoints.length, 'points');
}

/**
 * Generate random data
 */
function generateRandomData() {
    const pattern = App.currentAlgorithm === 'k-means' ? 'clusters' : 'linear';
    App.dataPoints = Datasets.generateRandom(20, 700, 500, pattern);
    App.elements.canvasOverlay.classList.add('hidden');
    
    initializeCurrentAlgorithm();
    visualize();
    updateStats();
}

/**
 * Clear all data
 */
function clearData() {
    App.dataPoints = [];
    initializeCurrentAlgorithm();
    visualize();
    updateStats();
    App.elements.canvasOverlay.classList.remove('hidden');
}

/**
 * Add a point on canvas click
 */
function addPoint(x, y) {
    // For decision tree, alternate labels
    const label = App.currentAlgorithm === 'decision-tree' 
        ? App.dataPoints.length % 2 
        : undefined;
    
    App.dataPoints.push({ x, y, label });
    App.elements.canvasOverlay.classList.add('hidden');
    
    initializeCurrentAlgorithm();
    visualize();
    updateStats();
    
    console.log('Added point:', x, y);
}

/**
 * Initialize the current algorithm with data
 */
function initializeCurrentAlgorithm() {
    const algo = App.algorithms[App.currentAlgorithm];
    
    switch(App.currentAlgorithm) {
        case 'linear-regression':
            algo.init(App.dataPoints);
            break;
        case 'k-means':
            const k = parseInt(document.getElementById('k-clusters')?.value || 3);
            algo.init(App.dataPoints, k);
            break;
        case 'decision-tree':
            algo.init(App.dataPoints);
            break;
    }
}

/**
 * Run the algorithm
 */
function runAlgorithm() {
    if (App.dataPoints.length < 2) {
        alert('Please add at least 2 data points first!');
        return;
    }
    
    const algo = App.algorithms[App.currentAlgorithm];
    const result = algo.run();
    
    visualize();
    updateStats();
    updateStepInfo({
        step: 'Complete',
        title: 'Algorithm Finished',
        description: 'View the results and statistics below.'
    });
    
    console.log('Algorithm result:', result);
}

/**
 * Step through algorithm
 */
function stepAlgorithm() {
    if (App.dataPoints.length < 2) {
        alert('Please add at least 2 data points first!');
        return;
    }
    
    const algo = App.algorithms[App.currentAlgorithm];
    const stepInfo = algo.step();
    
    visualize();
    updateStats();
    updateStepInfo(stepInfo);
}

/**
 * Reset algorithm
 */
function resetAlgorithm() {
    const algo = App.algorithms[App.currentAlgorithm];
    algo.reset();
    
    visualize();
    updateStats();
    updateStepInfo({
        step: 0,
        title: 'Ready',
        description: 'Click "Run" or "Step Forward" to begin.'
    });
}

/**
 * Visualize current state
 */
function visualize() {
    const algo = App.algorithms[App.currentAlgorithm];
    
    if (typeof algo.visualize === 'function') {
        algo.visualize(Visualization);
    } else {
        // Default visualization
        Visualization.clear();
        Visualization.drawGrid();
        Visualization.drawPoints(App.dataPoints);
    }
}

/**
 * Update statistics display
 */
function updateStats() {
    const algo = App.algorithms[App.currentAlgorithm];
    const stats = algo.getStats ? algo.getStats() : { 'Points': App.dataPoints.length };
    
    let html = '';
    for (const [key, value] of Object.entries(stats)) {
        html += `
            <div class="stat-item">
                <span class="stat-label">${key}</span>
                <span class="stat-value">${value}</span>
            </div>
        `;
    }
    
    App.elements.statsContent.innerHTML = html;
}

/**
 * Update step info display
 */
function updateStepInfo(info) {
    App.elements.stepInfo.innerHTML = `
        <span class="step-number">Step ${info.step}</span>
        <h4>${info.title}</h4>
        <p class="step-description">${info.description}</p>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

console.log('📦 Main module loaded');