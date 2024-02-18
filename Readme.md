## **Snake AI: Train Your Own Snake with Q-Learning!** 🐍🧠


**Get Started!**

1. **Download or Clone:**  
2. **Run the Game:** Open index.htlm
3. **Play Yourself:** Try beating your own high score in traditional Snake mode.
4. **Train the AI:** Hit the 'Start Training' button and watch the magic happen. Tweak the training settings for even more interesting results.

Features

1. **Interactive Gameplay:** Take control of the snake and try to beat your own high score in traditional Snake mode.
2. **AI Training:** Watch the AI learn in real-time. Observe as it evolves from making random moves to mastering the game.
3. **Customization:** Tweak the hyperparameters of the Q-Learning algorithm (learning rate, discount factor, exploration rate) and witness the impact on the agent's performance.
4. **Visualizations:** Track the AI's progress with charts that visualize performance, action distribution, and rewards.
te the reward mechanism that guides the AI's learning.

Why Simple Q-Learning Doesn't Work

Simple Q-Learning implementations often face challenges in the Snake game due to the sheer complexity of potential game states. Every combination of the snake's position, food location, and the presence or absence of obstacles creates a unique state.  This vast number of states can overwhelm Q-tables, which store values for each state-action pair.  Additionally, the random repositioning of food after each consumption makes it difficult for the AI to develop consistent strategies.  Moreover, if rewards are only given when the snake eats food,  feedback might be too infrequent for effective learning, especially early in training. This combination of factors can lead to slow convergence or even the complete failure of the algorithm to find a good solution.


**License**
MIT License: [https://choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/) 

