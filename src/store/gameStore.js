import { create } from 'zustand';
import questionsData from '../data/questions.json';

export const CATEGORIES = {
    blue: { id: 'blue', color: 'bg-blue-500', name: 'Geografía e Historia' },
    red: { id: 'red', color: 'bg-red-500', name: 'Deportes' },
    yellow: { id: 'yellow', color: 'bg-yellow-500', name: 'Cultura Pop' },
    green: { id: 'green', color: 'bg-green-500', name: 'Naturales' },
};

export const RING_SIZE = 36;

export const BOARD_SPACES = {
    'center': { id: 'center', category: 'blue', isWedge: false, isCenter: true },
};

// Outer ring (36 spaces) — wedges at 0, 9, 18, 27
const WEDGE_INDICES = [0, 9, 18, 27];
for (let i = 0; i < RING_SIZE; i++) {
    const cats = ['blue', 'red', 'green', 'yellow'];
    let cat = cats[i % 4];
    // Force category at wedge positions
    if (i === 0) cat = 'blue';
    if (i === 9) cat = 'red';
    if (i === 18) cat = 'yellow';
    if (i === 27) cat = 'green';

    BOARD_SPACES[`ring-${i}`] = {
        id: `ring-${i}`,
        category: cat,
        isWedge: WEDGE_INDICES.includes(i),
        isRing: true,
        ringIndex: i
    };
}

// 4 spokes (5 spaces each) connecting center to wedges 0, 9, 18, 27
const spokeTargets = [0, 9, 18, 27];
spokeTargets.forEach((targetIndex, spokeNum) => {
    for (let i = 0; i < 5; i++) {
        const cats = ['yellow', 'blue', 'green', 'red'];
        BOARD_SPACES[`spoke-${spokeNum}-${i}`] = {
            id: `spoke-${spokeNum}-${i}`,
            category: cats[(spokeNum + i) % 4],
            isWedge: false,
            isSpoke: true,
            spokeNum,
            spokeIndex: i
        };
    }
});

// Wildcards: midpoints between wedges at 4, 13, 22, 31
const WILDCARD_SPACES = new Set(['ring-4', 'ring-13', 'ring-22', 'ring-31']);
const generateWildcardSpaces = () => WILDCARD_SPACES;

// Spoke entrances: wedge ring indices → spoke number
const SPOKE_ENTRANCES = { 0: 0, 9: 1, 18: 2, 27: 3 };

const getNextSpaces = (currentId, player) => {
    const isHeadingCenter = player.wedges.length === 4;

    if (currentId === 'center') {
        if (isHeadingCenter) return ['center'];
        const randomSpoke = Math.floor(Math.random() * 4);
        return [`spoke-${randomSpoke}-0`];
    }

    const space = BOARD_SPACES[currentId];

    if (space.isSpoke) {
        if (isHeadingCenter) {
            if (space.spokeIndex > 0) {
                return [`spoke-${space.spokeNum}-${space.spokeIndex - 1}`];
            } else {
                return ['center'];
            }
        } else {
            if (space.spokeIndex < 4) {
                return [`spoke-${space.spokeNum}-${space.spokeIndex + 1}`];
            } else {
                return [`ring-${spokeTargets[space.spokeNum]}`];
            }
        }
    }

    if (space.isRing) {
        if (isHeadingCenter && space.ringIndex in SPOKE_ENTRANCES) {
            const spokeNum = SPOKE_ENTRANCES[space.ringIndex];
            return [`spoke-${spokeNum}-4`];
        }
        const nextIndex = (space.ringIndex + 1) % RING_SIZE;
        return [`ring-${nextIndex}`];
    }

    return [currentId];
};

const getRandomQuestion = (category, usedQuestions) => {
    const all = questionsData.filter(q => q.category === category);
    if (all.length === 0) return null;
    const usedIds = usedQuestions[category] || new Set();
    let pool = all.filter(q => !usedIds.has(q.id));
    // If pool exhausted, reset and use all
    if (pool.length === 0) pool = all;
    return pool[Math.floor(Math.random() * pool.length)];
};


export const useGameStore = create((set, get) => ({
    status: 'setup',
    players: [],
    currentPlayerIndex: 0,
    diceRoll: null,
    currentQuestion: null,
    winner: null,
    isMoving: false,
    wildcardSpaces: new Set(),
    usedQuestions: {}, // { [category]: Set<id> }

    addPlayer: (player) => set((state) => ({
        players: [...state.players, { ...player, wedges: [], position: 'center' }]
    })),

    removePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id)
    })),

    startGame: () => set((state) => {
        if (state.players.length === 0) return state;
        return {
            status: 'playing',
            currentPlayerIndex: 0,
            diceRoll: null,
            currentQuestion: null,
            isMoving: false,
            wildcardSpaces: generateWildcardSpaces(),
            usedQuestions: {}
        };
    }),

    rollDice: () => {
        if (get().isMoving) return;

        const roll = Math.floor(Math.random() * 6) + 1;
        set({ diceRoll: roll, isMoving: true });

        const stateInitial = get();
        const initialPosition = stateInitial.players[stateInitial.currentPlayerIndex].position;

        let stepsTaken = 0;

        const interval = setInterval(() => {
            set((state) => {
                const { players, currentPlayerIndex } = state;
                const currentPlayer = players[currentPlayerIndex];

                const nextOptions = getNextSpaces(currentPlayer.position, currentPlayer);
                const nextPos = nextOptions[0];

                const updatedPlayers = [...players];
                updatedPlayers[currentPlayerIndex] = {
                    ...currentPlayer,
                    position: nextPos
                };

                stepsTaken++;
                const isFinalCenter = nextPos === 'center' && currentPlayer.wedges.length === 4;

                const spaceInfo = BOARD_SPACES[nextPos];
                const isUncollectedWedge = spaceInfo.isWedge && !currentPlayer.wedges.includes(spaceInfo.category);
                const isWildcard = state.wildcardSpaces.has(nextPos);

                if (stepsTaken >= roll || isFinalCenter || isUncollectedWedge) {
                    clearInterval(interval);
                    const landedSpace = BOARD_SPACES[nextPos];

                    // Wildcard and final center both get a random-category question
                    const randomCat = ['blue', 'red', 'yellow', 'green'][Math.floor(Math.random() * 4)];
                    const questionCategory = (isFinalCenter || isWildcard) ? randomCat : landedSpace.category;
                    const questionData = getRandomQuestion(questionCategory, state.usedQuestions);

                    // Mark this question as used
                    const updatedUsed = { ...state.usedQuestions };
                    if (questionData?.id) {
                        const prev = updatedUsed[questionCategory] ? new Set(updatedUsed[questionCategory]) : new Set();
                        prev.add(questionData.id);
                        updatedUsed[questionCategory] = prev;
                    }

                    return {
                        players: updatedPlayers,
                        isMoving: false,
                        usedQuestions: updatedUsed,
                        currentQuestion: {
                            category: questionCategory,
                            isFinalCenter: isFinalCenter || isWildcard,
                            isRealFinalCenter: isFinalCenter,
                            startPosition: initialPosition,
                            isWildcard,
                            questionData,
                        }
                    };
                }

                return { players: updatedPlayers };
            });
        }, 300);
    },

    answerQuestion: (selectedOption) => set((state) => {
        const { players, currentPlayerIndex, currentQuestion } = state;
        const currentPlayer = players[currentPlayerIndex];
        let updatedPlayers = [...players];
        let nextPlayerIndex = currentPlayerIndex;
        let newStatus = state.status;
        let winner = null;

        const isCorrect = currentQuestion?.questionData
            ? selectedOption === currentQuestion.questionData.correctAnswer
            : selectedOption === true;

        if (isCorrect && currentQuestion) {
            if (currentQuestion.isRealFinalCenter) {
                newStatus = 'gameover';
                winner = updatedPlayers[currentPlayerIndex];
            } else {
                const currentSpace = BOARD_SPACES[currentPlayer.position];
                if (currentSpace.isWedge && !currentPlayer.wedges.includes(currentQuestion.category)) {
                    updatedPlayers[currentPlayerIndex] = {
                        ...currentPlayer,
                        wedges: [...currentPlayer.wedges, currentQuestion.category]
                    };
                }
                // If correct, keep the same player's turn (don't advance)
            }
        } else {
            // Failed the question. Return to start position!
            if (currentQuestion && currentQuestion.startPosition) {
                updatedPlayers[currentPlayerIndex] = {
                    ...currentPlayer,
                    position: currentQuestion.startPosition
                };
            }
            nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        }

        return {
            players: updatedPlayers,
            currentPlayerIndex: nextPlayerIndex,
            currentQuestion: null,
            diceRoll: null,
            status: newStatus,
            winner: winner
        };
    }),

    resetGame: () => set({
        status: 'setup',
        players: [],
        currentPlayerIndex: 0,
        diceRoll: null,
        currentQuestion: null,
        winner: null,
        isMoving: false,
        wildcardSpaces: new Set(),
        usedQuestions: {}
    })
}));
