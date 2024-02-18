const gameBoard = document.getElementById('gameBoard'); 
const ctx = gameBoard.getContext('2d'); 
const perfChartCtx = document.getElementById('performanceChart').getContext('2d');
const actionDistChartCtx = document.getElementById('actionDistributionChart').getContext('2d');
const alphaSlider = document.getElementById('alphaSlider');
const epsilonSlider = document.getElementById('epsilonSlider');
const gammaSlider = document.getElementById('gammaSlider');
const startTrainingButton = document.getElementById('startTrainingButton');

const gridSize = 20; // Size of each snake/food block
let snake = [{ x: 10, y: 10}]; // Initial snake position (center)
let food = {};  // Food will be generated later  
let dx = 0; // Movement - Horizontal change
let dy = 0; // Movement - Vertical change
let score = 0;
let s_epsilon = 0.9;
let  epsilon = s_epsilon; // Start with high exploration
let alpha = 0.1; // Learning rate
let gamma = 0.9; // Discount factor
let qTableA = {}; 
let qTableB = {};
let iterationCount = 0;
let previousState = null;
let hit = false;
let food_bool = false;

function main() {

    setTimeout(function onTick() {
        
        clearCanvas();
        drawSnake();
        drawFood(); // Draw the food
        main(); // Call the main function again (creating the game loop)
    }, 10) // Set game speed (milliseconds delay)
}


// Start the game!
generateFood(); // Add this line to generate initial food
main(); 

function didHitSelf() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function didHitWall() {
    return snake[0].x < 0 || snake[0].x >= gameBoard.width / gridSize || 
           snake[0].y < 0 || snake[0].y >= gameBoard.height / gridSize;
}
function clearCanvas() {
    ctx.fillStyle = 'white'; 
    ctx.fillRect(0, 0, gameBoard.width, gameBoard.height); 
}

function drawSnake() {
    snake.forEach(part => drawSnakePart(part));
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize); 
    ctx.strokeRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize, gridSize); 
}

document.getElementById('restartButton').addEventListener('click', restartGame);
document.getElementById('alphaValue').textContent = alpha.toFixed(2); 
document.getElementById('sepsilonValue').textContent = s_epsilon.toFixed(2);
document.getElementById('gammaValue').textContent = gamma.toFixed(2);

alphaSlider.addEventListener('input', () => {
    alpha = parseFloat(alphaSlider.value); 
    document.getElementById('alphaValue').textContent = alpha.toFixed(2);
});
  
epsilonSlider.addEventListener('input', () => {
    s_epsilon = parseFloat(epsilonSlider.value); 
    document.getElementById('sepsilonValue').textContent = s_epsilon.toFixed(2); 
});
  
gammaSlider.addEventListener('input', () => {
    gamma = parseFloat(gammaSlider.value); 
    document.getElementById('gammaValue').textContent = gamma.toFixed(2); 
});


function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize); 
}

function generateFood() {
    const targetAreaSize = 20; // Size of the square area around 20
    const baseLocation = 10;  
  
    // Generate random location within a square centered at 'baseLocation'
    let x = baseLocation - targetAreaSize/2 + Math.floor(Math.random() * targetAreaSize);
    let y = baseLocation - targetAreaSize/2 + Math.floor(Math.random() * targetAreaSize);
  
    // Boundary checks:
    x = Math.max(0, Math.min(x, gameBoard.width / gridSize - 1));  
    y = Math.max(0, Math.min(y, gameBoard.height / gridSize - 1));
  
    food = {
      x: x,
      y: y
    };
  }

function restartGame() {
    snake = [{ x: 10, y: 10 }]; // Reset snake position
    score = 0; // Reset score
    document.getElementById('scoreDisplay').textContent = "Score: " + score;
    dx = 0; // Reset horizontal direction
    dy = 0; // Reset vertical direction
    generateFood(); // Generate new food
    main(); // Start the game again
}

const state = {
    snakeHeadX: 5,          // Example - position of the snake's head on the X-axis
    snakeHeadY: 8,          // Example - position of the snake's head on the Y-axis
    foodX: 12,              // X-coordinate of the food
    foodY: 3,               // Y-coordinate of the food
    direction: 'left',      // Current movement direction of the snake ('up', 'down', 'left', 'right')
    obstacleUp: false,      // True if there's an obstacle directly above the snake
    obstacleDown: true,     // True if there's an obstacle directly below the snake
    obstacleLeft: false,    // True if there's an obstacle directly left of the snake
    obstacleRight: true,    // True if there's an obstacle directly right of the snake 
};




function initializeQTable(stateKey){ // Call this at the appropriate initialization point
    if (!('stateKey' in qTableA)) { // Prevent overwriting an existing 'stateKey'
        qTableA[stateKey] = { 'up': 0, 'down': 0, 'left': 0, 'right': 0 };
    }
    if (!('stateKey' in qTableB)) { // Prevent overwriting an existing 'stateKey'
        qTableB[stateKey] = { 'up': 0, 'down': 0, 'left': 0, 'right': 0 };
    }
}
function trainingLoop() {     
    clearCanvas();
    advanceSnake(); // AI-controlled gameplay 
    drawSnake();
    drawFood();
    setTimeout(trainingLoop); // Adjust speed as needed
}

function startTraining() {
    qTableA = {}; // Assuming you have qTableA and qTableB
    qTableB = {}; 
    epsilon = s_epsilon
    iterationCount = 0; 
    trainingLoop(); // Initiate the AI training loop
}
document.getElementById('startRLButton').addEventListener('click', startTraining); 

function advanceSnake() { 
   // Calculate new head position (this should stay)
   const head = { x: snake[0].x + dx, y: snake[0].y + dy };
   snake.unshift(head); 

   // Game Logic 
   if (didHitSelf() || didHitWall()) {
       resetGame();
       hit = true;
   } else if (ateFood()) {
        food_bool = true;
        score++;
        document.getElementById('scoreDisplay').textContent = "Score: " + score;
        updateHighScore(score);
        generateFood(); 
   } else {
       snake.pop(); // Remove the tail 
   }

   // Q-Learning Updates  (move this from advanceSnake)
   const state = getGameState();
   const action = chooseAction(state, epsilon);
   takeAction(action); // Control the movement using AI's choice

   const reward = getReward(hit,food_bool);
   const newState = getGameState();
   updateQTable(state, action, reward, newState);
   updateScore();
   updateIteration();
   updateEpsilon();
   updateVisualizations(score, iterationCount, action, reward);
   previousState = state;
   hit = false;
   food_bool = false;
}


function ateFood() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

function getReward(hit,food_bool) {
    if (hit) {
        return -1; 
    } else if (food_bool) {
        return 1; 
    } else {
        if (previousState) { // Check if previousState exists 
            const oldDistance = previousState.distanceToFood; 
            const newDistance = getGameState().distanceToFood;

            if (newDistance < oldDistance) {
                return 5; // Positive reward for getting closer
            } else { 
                // Scaling element
                const distanceScalingFactor = 1; // Adjust as needed
                return -distanceScalingFactor * newDistance;
            }
        } 
        
        else { 
            return -1; // Slightly larger non-zero for aimless starting moves
        }
    }
}


function generateStateKey(state) {
    const stateValues = [
        state.snakeHeadX, 
        state.snakeHeadY, 
        state.foodX - state.snakeHeadX, // Relative food X
        state.foodY - state.snakeHeadY, // Relative food Y
        state.direction, 
        state.obstacleUp ? 'T' : 'F',
        state.obstacleDown ? 'T' : 'F',
        state.obstacleLeft ? 'T' : 'F',
        state.obstacleRight ? 'T' : 'F',
    ];

    return 'state_' + stateValues.join('_');
}
function calculateStepsUntilCollision(direction) {
    let steps = 0;
    let x = snake[0].x;
    let y = snake[0].y;
    const maxStepsToCheck = 20;

    while (steps < maxStepsToCheck) { 
        if (direction === 'up') y--;
        else if (direction === 'down') y++;
        else if (direction === 'left') x--;
        else if (direction === 'right') x++;

        if (checkWallCollision(x, y, gameBoard.width, gameBoard.height)  || checkSelfCollision(x, y)) {
            return steps; // Collision identified
        }
        steps++;
    }

    // No collision within maxStepsToCheck - signal with a special value
    return maxStepsToCheck;  
}
function checkWallCollision(x, y, boardWidth, boardHeight) { 
    return x < 0 || x >= boardWidth || y < 0 || y >= boardHeight; 
}
function checkSelfCollision(x, y) {
    for (let i = 1; i < snake.length; i++) { // Start from index 1 to skip the head
        if (snake[i].x === x && snake[i].y === y) {
            return true; // Collision with own body
        }
    }
    return false; // No collision
}
function getGameState() {
    const snakeHeadX = snake[0].x; 
    const snakeHeadY = snake[0].y;
    const foodX = food.x;
    const foodY = food.y;
    const direction = getCurrentDirection(); 

    const obstacleUp = isObstacleInDirection('up'); 
    const obstacleDown = isObstacleInDirection('down');
    const obstacleLeft = isObstacleInDirection('left');
    const obstacleRight = isObstacleInDirection('right'); 

    // Food Information 
    const foodRelativeX = foodX - snakeHeadX;
    const foodRelativeY = foodY - snakeHeadY;
    const distanceToFood = Math.sqrt(foodRelativeX * foodRelativeX + foodRelativeY * foodRelativeY);

    // Simple quadrant indication for basic direction 
    let foodDirection = 'none';
    if (foodRelativeX >= 0 && foodRelativeY >= 0) foodDirection = 'bottomRight'; 
    else if (foodRelativeX >= 0 && foodRelativeY < 0) foodDirection = 'topRight';
    else if (foodRelativeX < 0 && foodRelativeY < 0) foodDirection = 'topLeft';
    else if (foodRelativeX < 0 && foodRelativeY >= 0) foodDirection = 'bottomLeft';
    // Steps until Collision Calculation
    const stepsUntilUpCollision = calculateStepsUntilCollision('up'); 
    const stepsUntilDownCollision = calculateStepsUntilCollision('down');
    const stepsUntilLeftCollision = calculateStepsUntilCollision('left');
    const stepsUntilRightCollision = calculateStepsUntilCollision('right');

    return {
        snakeHeadX,
        snakeHeadY,
        foodX,
        foodY,
        direction,
        obstacleUp,
        obstacleDown,
        obstacleLeft,
        obstacleRight,
        foodRelativeX,  
        foodRelativeY,  
        distanceToFood, 
        foodDirection
    };
} 

function getCurrentDirection() {
    if (dx === 0 && dy === -1) return 'up'; 
    if (dx === 0 && dy === 1) return 'down'; 
    if (dx === -1 && dy === 0) return 'left'; 
    if (dx === 1 && dy === 0) return 'right'; 

    return 'unknown'; 
}

function isObstacleInDirection(direction) {
    const headX = snake[0].x;
    const headY = snake[0].y;
    let newX = headX;
    let newY = headY;
    const lookAheadDistance = 3; // Customize how far ahead to look 

    for (let i = 0; i < lookAheadDistance; i++) {
        if (direction === 'up') newY--;
        else if (direction === 'down') newY++;
        else if (direction === 'left') newX--;
        else if (direction === 'right') newX++;

        // Wall Check 
        if (newX < 0 || newX >= gameBoard.width / gridSize ||
            newY < 0 || newY >= gameBoard.height / gridSize) {
            return true; 
        }

        // Self-Collision Check
        if (didHitSelf(newX, newY)) {
            return true;
        }
    }

    return false; // No obstacle found within the lookahead distance
}

function chooseAction(state, epsilon) {
    const stateKey = generateStateKey(state); 
    initializeQTable(stateKey)

    console.log('State Key:', stateKey); 
    if (Math.random() < epsilon) {
        return getRandomAction();  
    } else {
        return getGreedyAction(stateKey); 
    }
}

function getRandomAction() {
    const actions = ['up', 'down', 'left', 'right'];
    return actions[Math.floor(Math.random() * actions.length)];
}

function getGreedyAction(stateKey) {
  
    if (!(stateKey in qTableA) && !(stateKey in qTableB)) {
      const possibleActions = Object.keys(qTableA); // Or Q-table B - they should match 
      return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    }
  
    // Randomly select which Q-table to use to find the greedy action
    const qTableToUse = (Math.random() < 0.5) ? qTableA : qTableB;
  
    let bestAction = null;
    let bestQValue = -Infinity;
  
    for (const action in qTableToUse[stateKey]) {
      if (qTableToUse[stateKey][action] > bestQValue) {
        bestAction = action;
        bestQValue = qTableToUse[stateKey][action];
      }
    }
  
    return bestAction;
  }
  function updateQTable(state, action, reward, newState) {
    const stateKey = generateStateKey(state);
    const newKey = generateStateKey(newState);

    let futureRewards = 0;
    let qTableToUpdate = null;

    // Decide Q-table for update & find best action in the OTHER table
    if (Math.random() < 0.5) { 
        qTableToUpdate = qTableA; // Update Q-table A 
        if (newKey in qTableB) { // Evaluate using Q-table B
            const bestActionInQTableB = Object.entries(qTableB[newKey])
                                                .sort(([, valA], [, valB]) => valB - valA)[0][0];
            futureRewards = qTableB[newKey][bestActionInQTableB]; 
        }
    } else { 
        qTableToUpdate = qTableB; // Update Q-table B
        if (newKey in qTableA) { // Evaluate using Q-table A
            const bestActionInQTableA = Object.entries(qTableA[newKey])
                                                .sort(([, valA], [, valB]) => valB - valA)[0][0];
            futureRewards = qTableA[newKey][bestActionInQTableA]; 
        }
    }

    // Get qsa from the Q-table we're UPDATING 
    const qsa = qTableToUpdate[stateKey][action];

    const newQValue = qsa + alpha * (reward + gamma * futureRewards - qsa);

    // Update the chosen table
    qTableToUpdate[stateKey][action] = newQValue; 
    const crashActions = findCrashActions(state); // We'll define this function below

    let qValues;
    if (stateKey in qTableA) {
        qValues = qTableA[stateKey];
    } else {
        qValues = qTableB[stateKey];
    } 

    // Print values BEFORE the Q-table update
    console.log(`State: ${stateKey}, Crash Actions: ${crashActions}`);
    for (const act in qValues) {
        console.log(`  Action: ${act}, Q-value: ${qValues[act]}`);
    }
}

function findCrashActions(state) {
    const crashActions = [];
    if (state.stepsUntilUpCollision <= 1) {  
        crashActions.push('up');
    }
    if (state.stepsUntilDownCollision <= 1) { 
        crashActions.push('down');
    }
    // ... similar logic for 'left' and 'right' ... 
    return crashActions; 
}
function takeAction(action) {
    switch (action) {
        case 'up':
            if (dy !== 1) {  // Prevent immediate reversal (no moving down if currently traveling up)
                dx = 0;
                dy = -1;
            }
            break;
        case 'down':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'left':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            } 
            break;
        case 'right':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
}

function resetGame() { 
    snake = [{ x: 10, y: 10 }]; // Reset snake position
    score = 0; // Reset score
    dx = 0; // Reset horizontal direction
    dy = 0; // Reset vertical direction 
    document.getElementById('scoreDisplay').textContent = "Score: " + score;
    iterationCount++;
    epsilon = Math.max(0.05, epsilon * 0.99 )
    if(iterationCount % 100 ==  0){
        epsilon = s_epsilon;
    }
    updateScore();
    updateIteration();
    updateEpsilon();
    generateFood(); // Generate new food
    loadHighScore(); 
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = "Score: " + score;
  }
  
function updateIteration() {
    document.getElementById('iterationCounter').textContent = "Iteration: " + iterationCount;
  }
  
function updateEpsilon() {
    document.getElementById('epsilonValue').textContent = "Epsilon: " + epsilon;
  }

// Chart Configurations
const performanceChart = new Chart(perfChartCtx, {
    type: 'line',
    data: {
        labels: [], // your labels here
        datasets: [{
            label: 'Performance',
            data: [], // your data here
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
const actionDistributionChart = new Chart(actionDistChartCtx, {
    type: 'bar',
    data: {
        labels: [], // Your action labels will go here
        datasets: [{
            label: 'Action Selection Frequency',
            data: [],
            backgroundColor: 'rgba(255, 150, 0, 0.6)' // Example color
        }]
    }
});

// Data Tracking (Inside your Q-learning logic)
const performanceData = []; 
const actionDistribution = {}; // Dict to store how often each action is taken
const rewardsHistory = []; 
const iterationHistory = []; 

function updateVisualizations(score, iteration, selectedAction,reward) {
    performanceData.push({x: iteration, y: score}); // Use x, y for Chart.js line 
    updateChart(performanceChart, performanceData.map(data => data.x), performanceData.map(data => data.y)); 

    // Action distribution tracking update
    actionDistribution[selectedAction] = (actionDistribution[selectedAction] || 0) + 1; 
    updateChart(actionDistributionChart, Object.keys(actionDistribution), Object.values(actionDistribution));

    rewardsHistory.push(reward);
    iterationHistory.push(iterationCount);
    updateReward(rewardsChart, iterationHistory, rewardsHistory);
}

// Helper Chart Update function 
function updateChart(chart, labels, data) {
    if (chart.data.datasets && chart.data.datasets.length > 0) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    } else {
        console.error('The datasets array is not initialized or is empty.');
    }
}

const rewardsChartCtx = document.getElementById('rewardsChart').getContext('2d');

const rewardsChart = new Chart(rewardsChartCtx, {
    type: 'line', // Line chart is suitable for visualizing rewards over time
    data: {
        labels: [], // Placeholder for iteration numbers 
        datasets: [{ 
            label: 'Reward',
            data: [], 
            borderColor: 'rgba(0, 200, 100, 0.8)', // Example color, customize as desired
            backgroundColor: 'rgba(0, 200, 100, 0.1)'  //  Optional subtle fill
        }]
    },
    options: {  
        scales: { 
            y: {   // Focus on the y-axis
                min: -1,  // Set minimum slightly below your smallest reward
                max: 1    // Set maximum slightly above your highest reward
            }
        }
    }
});

function updateReward(chart, labels, data) {
    if (chart.data.datasets && chart.data.datasets.length > 0) {
        const maxLabels = Math.floor(chart.canvas.width / 5); // Adjust the division factor as needed
        const startIndex = Math.max(0, labels.length - maxLabels);
        const endIndex = startIndex + 100;
        chart.data.labels = labels.slice(startIndex, endIndex);
        chart.data.datasets[0].data = data.slice(startIndex, endIndex);
        chart.update();
    } else {
        console.error('The datasets array is not initialized or is empty.');
    }
}

function loadHighScore() {
    const storedHighScore = localStorage.getItem('highScore');
    if (storedHighScore) {
      document.getElementById('highscore').textContent = storedHighScore;
    } else {
      localStorage.setItem('highScore', 0); // Initialize if not found
    }
  }
  
  // Function to update the high score if necessary
  function updateHighScore(newScore) {
    const currentHighScore = parseInt(localStorage.getItem('highScore') || 0);
    if (newScore > currentHighScore) {
      localStorage.setItem('highScore', newScore);
      document.getElementById('highscore').textContent = newScore;
    }
  }