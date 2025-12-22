// ============================================
// Educational Games Module
// ============================================

export const Games = {
    // ============================================
    // Computer Networks Game
    // ============================================
    CNGame: {
        state: {
            messagePosition: null,
            currentPath: [],
            isDragging: false,
            isAnimating: false
        },

        path: ['PC1', 'PC2', 'PC3', 'PC5', 'PC4'],

        render: () => `
            <div class="game-container cn-game">
                <div class="game-header">
                    <h2><i class="fas fa-network-wired"></i> Computer Networks: Packet Routing</h2>
                    <p>Drag the message to PC1 to start the packet transmission</p>
                </div>

                <div class="game-content">
                    <div class="network-container">
                        <svg class="network-svg" width="100%" height="450" viewBox="0 0 700 450">
                            <!-- Network Lines -->
                            <line id="line-pc1-pc2" x1="115" y1="100" x2="235" y2="100" class="network-line" stroke-width="3"/>
                            <line id="line-pc2-pc3" x1="285" y1="100" x2="405" y2="100" class="network-line" stroke-width="3"/>
                            <line id="line-pc3-pc5" x1="450" y1="120" x2="550" y2="200" class="network-line" stroke-width="3"/>
                            <line id="line-pc5-pc4" x1="550" y1="250" x2="450" y2="330" class="network-line" stroke-width="3"/>
                        </svg>

                        <!-- PCs -->
                        <div class="pc-node" id="PC1" style="left: 65px; top: 65px;">
                            <div class="pc-icon"><i class="fas fa-desktop"></i></div>
                            <span>PC1</span>
                        </div>
                        <div class="pc-node" id="PC2" style="left: 235px; top: 65px;">
                            <div class="pc-icon"><i class="fas fa-desktop"></i></div>
                            <span>PC2</span>
                        </div>
                        <div class="pc-node" id="PC3" style="left: 405px; top: 65px;">
                            <div class="pc-icon"><i class="fas fa-desktop"></i></div>
                            <span>PC3</span>
                        </div>
                        <div class="pc-node" id="PC5" style="left: 510px; top: 165px;">
                            <div class="pc-icon"><i class="fas fa-desktop"></i></div>
                            <span>PC5</span>
                        </div>
                        <div class="pc-node" id="PC4" style="left: 405px; top: 295px;">
                            <div class="pc-icon"><i class="fas fa-desktop"></i></div>
                            <span>PC4</span>
                        </div>

                        <!-- Message -->
                        <div class="message-packet" id="message-packet" draggable="true">
                            <i class="fas fa-envelope"></i>
                            <span>Hello</span>
                        </div>
                    </div>

                    <div class="game-controls">
                        <button class="btn btn-secondary" onclick="Games.CNGame.reset()">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        `,

        init: () => {
            const packet = document.getElementById('message-packet');
            const nodes = document.querySelectorAll('.pc-node');

            if (!packet) return;

            packet.addEventListener('dragstart', (e) => {
                Games.CNGame.state.isDragging = true;
                e.dataTransfer.effectAllowed = 'move';
            });

            nodes.forEach(node => {
                node.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });

                node.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    if (node.id === 'PC1' && Games.CNGame.state.currentPath.length === 0) {
                        Games.CNGame.state.isDragging = false;
                        await Games.CNGame.startTransmission();
                    }
                });
            });
        },

        startTransmission: async () => {
            if (Games.CNGame.state.isAnimating) return;
            Games.CNGame.state.isAnimating = true;

            const packet = document.getElementById('message-packet');
            const positions = {
                'PC1': { x: 90, y: 90 },
                'PC2': { x: 260, y: 90 },
                'PC3': { x: 430, y: 90 },
                'PC5': { x: 535, y: 190 },
                'PC4': { x: 430, y: 320 }
            };

            for (let i = 0; i < Games.CNGame.path.length; i++) {
                const pcId = Games.CNGame.path[i];
                const pos = positions[pcId];

                // Highlight path line
                if (i > 0) {
                    const prevPc = Games.CNGame.path[i - 1];
                    const line = document.getElementById(`line-${prevPc.toLowerCase()}-${pcId.toLowerCase()}`);
                    if (line) {
                        line.setAttribute('stroke', '#FFD700');
                        line.setAttribute('stroke-width', '4');
                    }
                }

                // Move packet
                packet.style.left = pos.x + 'px';
                packet.style.top = pos.y + 'px';
                packet.style.transition = 'all 1s ease-in-out';

                // Highlight current PC
                const pcNode = document.getElementById(pcId);
                if (pcNode) {
                    pcNode.classList.add('active');
                }

                await new Promise(resolve => setTimeout(resolve, 1200));

                if (pcNode) {
                    pcNode.classList.remove('active');
                }
            }

            // Show completion message
            const pc4 = document.getElementById('PC4');
            if (pc4) {
                const check = document.createElement('div');
                check.className = 'delivery-check';
                check.innerHTML = '<i class="fas fa-check-circle"></i> Message Delivered!';
                pc4.appendChild(check);
                setTimeout(() => check.remove(), 3000);
            }

            Games.CNGame.state.isAnimating = false;
        },

        reset: () => {
            const packet = document.getElementById('message-packet');
            const lines = document.querySelectorAll('.network-line');
            const nodes = document.querySelectorAll('.pc-node');

            if (packet) {
                packet.style.left = '20px';
                packet.style.top = '20px';
                packet.style.transition = 'all 0.3s ease';
            }

            lines.forEach(line => {
                line.setAttribute('stroke', '#FEFFFF');
                line.setAttribute('stroke-width', '3');
            });

            nodes.forEach(node => {
                node.classList.remove('active');
            });

            Games.CNGame.state.currentPath = [];
            Games.CNGame.state.isAnimating = false;
        }
    },

    // ============================================
    // Data Structures Game (Tree Traversal)
    // ============================================
    DSGame: {
        state: {
            selectedNodes: [],
            algorithm: 'preorder',
            isComplete: false
        },

        tree: {
            value: 1,
            left: {
                value: 2,
                left: { value: 4, left: null, right: null },
                right: { value: 5, left: null, right: null }
            },
            right: {
                value: 3,
                left: { value: 6, left: null, right: null },
                right: { value: 7, left: null, right: null }
            }
        },

        correctOrder: {
            preorder: [1, 2, 4, 5, 3, 6, 7],
            postorder: [4, 5, 2, 6, 7, 3, 1]
        },

        render: () => `
            <div class="game-container ds-game">
                <div class="game-header">
                    <h2><i class="fas fa-project-diagram"></i> Data Structures: Tree Traversal</h2>
                    <p>Click nodes in the correct ${Games.DSGame.state.algorithm} order</p>
                </div>

                <div class="game-content">
                    <div class="algorithm-selector">
                        <button class="btn ${Games.DSGame.state.algorithm === 'preorder' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Games.DSGame.setAlgorithm('preorder')">
                            Preorder (Root → Left → Right)
                        </button>
                        <button class="btn ${Games.DSGame.state.algorithm === 'postorder' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Games.DSGame.setAlgorithm('postorder')">
                            Postorder (Left → Right → Root)
                        </button>
                    </div>

                    <div class="tree-container">
                        <svg class="tree-svg" width="100%" height="380" viewBox="0 0 600 380">
                            <!-- Tree Lines -->
                            <line x1="300" y1="80" x2="200" y2="160" class="tree-line" stroke-width="2"/>
                            <line x1="300" y1="80" x2="400" y2="160" class="tree-line" stroke-width="2"/>
                            <line x1="200" y1="160" x2="140" y2="240" class="tree-line" stroke-width="2"/>
                            <line x1="200" y1="160" x2="260" y2="240" class="tree-line" stroke-width="2"/>
                            <line x1="400" y1="160" x2="340" y2="240" class="tree-line" stroke-width="2"/>
                            <line x1="400" y1="160" x2="460" y2="240" class="tree-line" stroke-width="2"/>
                        </svg>

                        <!-- Tree Nodes -->
                        <div class="tree-node" data-value="1" style="left: 50%; top: 60px; transform: translateX(-50%);" onclick="Games.DSGame.selectNode(1)">
                            <span>1</span>
                        </div>
                        <div class="tree-node" data-value="2" style="left: 33%; top: 140px; transform: translateX(-50%);" onclick="Games.DSGame.selectNode(2)">
                            <span>2</span>
                        </div>
                        <div class="tree-node" data-value="3" style="left: 67%; top: 140px; transform: translateX(-50%);" onclick="Games.DSGame.selectNode(3)">
                            <span>3</span>
                        </div>
                        <div class="tree-node" data-value="4" style="left: 23%; top: 220px; transform: translateX(-50%);" onclick="Games.DSGame.selectNode(4)">
                            <span>4</span>
                        </div>
                        <div class="tree-node" data-value="5" style="left: 43%; top: 220px; transform: translateX(-50%);" onclick="Games.DSGame.selectNode(5)">
                            <span>5</span>
                        </div>
                        <div class="tree-node" data-value="6" style="left: 57%; top: 220px; transform: translateX(-50%);" onclick="Games.DSGame.selectNode(6)">
                            <span>6</span>
                        </div>
                        <div class="tree-node" data-value="7" style="left: 77%; top: 220px; transform: translateX(-50%);" onclick="Games.DSGame.selectNode(7)">
                            <span>7</span>
                        </div>
                    </div>

                    <div class="selection-display">
                        <h4>Your Selection:</h4>
                        <div class="selected-sequence">
                            ${Games.DSGame.state.selectedNodes.map(n => `<span class="selected-item">${n}</span>`).join('')}
                        </div>
                    </div>

                    <div class="game-controls">
                        <button class="btn btn-secondary" onclick="Games.DSGame.reset()">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        `,

        selectNode: (value) => {
            if (Games.DSGame.state.isComplete) return;

            const correctOrder = Games.DSGame.correctOrder[Games.DSGame.state.algorithm];
            const expectedIndex = Games.DSGame.state.selectedNodes.length;
            const expectedValue = correctOrder[expectedIndex];

            const node = document.querySelector(`.tree-node[data-value="${value}"]`);
            
            if (value === expectedValue) {
                // Correct selection
                Games.DSGame.state.selectedNodes.push(value);
                if (node) {
                    node.classList.add('correct');
                    const check = document.createElement('i');
                    check.className = 'fas fa-check node-check';
                    node.appendChild(check);
                }

                // Check if complete
                if (Games.DSGame.state.selectedNodes.length === correctOrder.length) {
                    Games.DSGame.state.isComplete = true;
                    setTimeout(() => {
                        alert('🎉 Perfect! You completed the traversal correctly!');
                        Games.DSGame.reset();
                    }, 500);
                }
            } else {
                // Wrong selection
                if (node) {
                    node.classList.add('wrong');
                    setTimeout(() => node.classList.remove('wrong'), 800);
                }
            }

            // Re-render to update display
            const gameContainer = document.querySelector('.ds-game');
            if (gameContainer) {
                const parent = gameContainer.parentElement;
                parent.innerHTML = Games.DSGame.render();
            }
        },

        setAlgorithm: (algo) => {
            Games.DSGame.state.algorithm = algo;
            Games.DSGame.reset();
        },

        reset: () => {
            Games.DSGame.state.selectedNodes = [];
            Games.DSGame.state.isComplete = false;
            const gameContainer = document.querySelector('.ds-game');
            if (gameContainer) {
                const parent = gameContainer.parentElement;
                parent.innerHTML = Games.DSGame.render();
            }
        }
    },

    // ============================================
    // Operating Systems Game (CPU Scheduling)
    // ============================================
    OSGame: {
        state: {
            selectedOrder: [],
            algorithm: 'FCFS',
            isSubmitted: false
        },

        processes: [
            { id: 'P1', burst: 6 },
            { id: 'P2', burst: 2 },
            { id: 'P3', burst: 8 },
            { id: 'P4', burst: 3 }
        ],

        getCorrectOrder: () => {
            const processes = [...Games.OSGame.processes];
            if (Games.OSGame.state.algorithm === 'FCFS') {
                return processes.map(p => p.id);
            } else if (Games.OSGame.state.algorithm === 'SJF') {
                return processes.sort((a, b) => a.burst - b.burst).map(p => p.id);
            }
            return [];
        },

        render: () => `
            <div class="game-container os-game">
                <div class="game-header">
                    <h2><i class="fas fa-microchip"></i> Operating Systems: CPU Scheduling</h2>
                    <p>Select processes in the correct order for ${Games.OSGame.state.algorithm} algorithm</p>
                </div>

                <div class="game-content">
                    <div class="algorithm-selector">
                        <button class="btn ${Games.OSGame.state.algorithm === 'FCFS' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Games.OSGame.setAlgorithm('FCFS')">
                            FCFS (First Come First Served)
                        </button>
                        <button class="btn ${Games.OSGame.state.algorithm === 'SJF' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Games.OSGame.setAlgorithm('SJF')">
                            SJF (Shortest Job First)
                        </button>
                    </div>

                    <div class="processes-container">
                        <h4>Available Processes:</h4>
                        <div class="process-list">
                            ${Games.OSGame.processes.map(p => `
                                <div class="process-box ${Games.OSGame.state.selectedOrder.includes(p.id) ? 'selected' : ''}" 
                                     onclick="Games.OSGame.selectProcess('${p.id}')">
                                    <div class="process-id">${p.id}</div>
                                    <div class="process-burst">Burst: ${p.burst}ms</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="gantt-container">
                        <h4>Gantt Chart:</h4>
                        <div class="gantt-chart">
                            ${Games.OSGame.state.selectedOrder.map((pid, idx) => {
                                const process = Games.OSGame.processes.find(p => p.id === pid);
                                return `
                                    <div class="gantt-block" style="flex: ${process.burst}">
                                        <span>${pid}</span>
                                        <small>${process.burst}ms</small>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    ${Games.OSGame.state.isSubmitted ? `
                        <div class="feedback ${Games.OSGame.checkOrder() ? 'correct-feedback' : 'wrong-feedback'}">
                            <i class="fas fa-${Games.OSGame.checkOrder() ? 'check' : 'times'}-circle"></i>
                            ${Games.OSGame.checkOrder() ? '✅ Correct sequence!' : '❌ Wrong sequence. Try again!'}
                        </div>
                    ` : ''}

                    <div class="game-controls">
                        <button class="btn btn-primary" onclick="Games.OSGame.submit()">
                            <i class="fas fa-paper-plane"></i> Submit
                        </button>
                        <button class="btn btn-secondary" onclick="Games.OSGame.reset()">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        `,

        selectProcess: (pid) => {
            if (Games.OSGame.state.isSubmitted) return;

            const index = Games.OSGame.state.selectedOrder.indexOf(pid);
            if (index > -1) {
                Games.OSGame.state.selectedOrder.splice(index, 1);
            } else {
                Games.OSGame.state.selectedOrder.push(pid);
            }

            const gameContainer = document.querySelector('.os-game');
            if (gameContainer) {
                const parent = gameContainer.parentElement;
                parent.innerHTML = Games.OSGame.render();
            }
        },

        checkOrder: () => {
            const correct = Games.OSGame.getCorrectOrder();
            return JSON.stringify(Games.OSGame.state.selectedOrder) === JSON.stringify(correct);
        },

        submit: () => {
            if (Games.OSGame.state.selectedOrder.length !== Games.OSGame.processes.length) {
                alert('Please select all processes first!');
                return;
            }

            Games.OSGame.state.isSubmitted = true;
            const gameContainer = document.querySelector('.os-game');
            if (gameContainer) {
                const parent = gameContainer.parentElement;
                parent.innerHTML = Games.OSGame.render();
            }

            if (Games.OSGame.checkOrder()) {
                setTimeout(() => {
                    alert('🎉 Excellent! You understand ' + Games.OSGame.state.algorithm + ' scheduling!');
                }, 500);
            }
        },

        setAlgorithm: (algo) => {
            Games.OSGame.state.algorithm = algo;
            Games.OSGame.reset();
        },

        reset: () => {
            Games.OSGame.state.selectedOrder = [];
            Games.OSGame.state.isSubmitted = false;
            const gameContainer = document.querySelector('.os-game');
            if (gameContainer) {
                const parent = gameContainer.parentElement;
                parent.innerHTML = Games.OSGame.render();
            }
        }
    },

    // ============================================
    // Python Quiz Game
    // ============================================
    PythonGame: {
        state: {
            currentQuestion: 0,
            score: 0,
            answered: false,
            selectedAnswer: null
        },

        questions: [
            {
                question: "What will be the output of: print(type([]))?",
                options: ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"],
                correct: 1
            },
            {
                question: "Which keyword is used to define a function in Python?",
                options: ["function", "def", "func", "define"],
                correct: 1
            },
            {
                question: "What is the output of: print(2 ** 3)?",
                options: ["5", "6", "8", "9"],
                correct: 2
            },
            {
                question: "Which of these is a mutable data type?",
                options: ["tuple", "string", "list", "int"],
                correct: 2
            },
            {
                question: "What does 'len()' function return?",
                options: ["Length of object", "Type of object", "Size in bytes", "Memory address"],
                correct: 0
            }
        ],

        render: () => {
            const q = Games.PythonGame.questions[Games.PythonGame.state.currentQuestion];
            const progress = ((Games.PythonGame.state.currentQuestion + 1) / Games.PythonGame.questions.length) * 100;

            return `
                <div class="game-container python-game">
                    <div class="game-header">
                        <h2><i class="fab fa-python"></i> Python Programming Quiz</h2>
                        <div class="quiz-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span>Question ${Games.PythonGame.state.currentQuestion + 1} / ${Games.PythonGame.questions.length}</span>
                        </div>
                    </div>

                    <div class="game-content">
                        <div class="score-display">
                            <i class="fas fa-trophy"></i>
                            <span>Score: ${Games.PythonGame.state.score} / ${Games.PythonGame.questions.length}</span>
                        </div>

                        <div class="question-container">
                            <h3 class="question-text">${q.question}</h3>
                            
                            <div class="options-container">
                                ${q.options.map((opt, idx) => {
                                    let classes = 'option-btn';
                                    if (Games.PythonGame.state.answered) {
                                        if (idx === q.correct) classes += ' correct-option';
                                        else if (idx === Games.PythonGame.state.selectedAnswer) classes += ' wrong-option';
                                        classes += ' disabled';
                                    }
                                    return `
                                        <button class="${classes}" 
                                                onclick="Games.PythonGame.selectAnswer(${idx})"
                                                ${Games.PythonGame.state.answered ? 'disabled' : ''}>
                                            ${opt}
                                            ${Games.PythonGame.state.answered && idx === q.correct ? '<i class="fas fa-check"></i>' : ''}
                                            ${Games.PythonGame.state.answered && idx === Games.PythonGame.state.selectedAnswer && idx !== q.correct ? '<i class="fas fa-times"></i>' : ''}
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        ${Games.PythonGame.state.answered ? `
                            <div class="game-controls">
                                <button class="btn btn-primary" onclick="Games.PythonGame.nextQuestion()">
                                    ${Games.PythonGame.state.currentQuestion < Games.PythonGame.questions.length - 1 
                                        ? '<i class="fas fa-arrow-right"></i> Next Question' 
                                        : '<i class="fas fa-flag-checkered"></i> Finish Quiz'}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        },

        selectAnswer: (index) => {
            if (Games.PythonGame.state.answered) return;

            Games.PythonGame.state.answered = true;
            Games.PythonGame.state.selectedAnswer = index;

            const q = Games.PythonGame.questions[Games.PythonGame.state.currentQuestion];
            if (index === q.correct) {
                Games.PythonGame.state.score++;
            }

            const gameContainer = document.querySelector('.python-game');
            if (gameContainer) {
                const parent = gameContainer.parentElement;
                parent.innerHTML = Games.PythonGame.render();
            }
        },

        nextQuestion: () => {
            if (Games.PythonGame.state.currentQuestion < Games.PythonGame.questions.length - 1) {
                Games.PythonGame.state.currentQuestion++;
                Games.PythonGame.state.answered = false;
                Games.PythonGame.state.selectedAnswer = null;

                const gameContainer = document.querySelector('.python-game');
                if (gameContainer) {
                    const parent = gameContainer.parentElement;
                    parent.innerHTML = Games.PythonGame.render();
                }
            } else {
                // Quiz complete
                const percentage = (Games.PythonGame.state.score / Games.PythonGame.questions.length) * 100;
                alert(`🎉 Quiz Complete!\n\nYour Score: ${Games.PythonGame.state.score} / ${Games.PythonGame.questions.length}\nPercentage: ${percentage.toFixed(1)}%`);
                Games.PythonGame.reset();
            }
        },

        reset: () => {
            Games.PythonGame.state = {
                currentQuestion: 0,
                score: 0,
                answered: false,
                selectedAnswer: null
            };
            const gameContainer = document.querySelector('.python-game');
            if (gameContainer) {
                const parent = gameContainer.parentElement;
                parent.innerHTML = Games.PythonGame.render();
            }
        }
    }
};

// Make Games globally accessible
window.Games = Games;
