import { create } from 'zustand';

export const CATEGORIES = {
    blue: { id: 'blue', color: 'bg-blue-500', name: 'Deportes' },
    red: { id: 'red', color: 'bg-red-500', name: 'Geografía e Historia' },
    green: { id: 'green', color: 'bg-green-500', name: 'Cultura Pop' },
    yellow: { id: 'yellow', color: 'bg-yellow-500', name: 'Otros' },
};

export const BOARD_SPACES = {
    'center': { id: 'center', category: 'blue', isWedge: false, isCenter: true },
};

// Outer ring (24 spaces)
for (let i = 0; i < 24; i++) {
    const cats = ['blue', 'red', 'green', 'yellow'];
    let cat = cats[i % 4];
    if (i === 6) cat = 'green';
    if (i === 12) cat = 'red';
    if (i === 18) cat = 'yellow';

    BOARD_SPACES[`ring-${i}`] = {
        id: `ring-${i}`,
        category: cat,
        isWedge: [0, 6, 12, 18].includes(i),
        isRing: true,
        ringIndex: i
    };
}

// 4 spokes (5 spaces each) connecting center to wedges 0, 6, 12, 18
const spokeTargets = [0, 6, 12, 18];
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

const getNextSpaces = (currentId, player) => {
    const isHeadingCenter = player.wedges.length === 4;

    if (currentId === 'center') {
        if (isHeadingCenter) return ['center']; // Reached the end
        const randomSpoke = Math.floor(Math.random() * 4);
        return [`spoke-${randomSpoke}-0`];
    }

    const space = BOARD_SPACES[currentId];

    if (space.isSpoke) {
        if (isHeadingCenter) {
            // Move inwards towards center
            if (space.spokeIndex > 0) {
                return [`spoke-${space.spokeNum}-${space.spokeIndex - 1}`];
            } else {
                return ['center'];
            }
        } else {
            // Move outwards towards ring
            if (space.spokeIndex < 4) {
                return [`spoke-${space.spokeNum}-${space.spokeIndex + 1}`];
            } else {
                const targets = [0, 6, 12, 18];
                return [`ring-${targets[space.spokeNum]}`];
            }
        }
    }

    if (space.isRing) {
        if (isHeadingCenter) {
            // Turn inwards if at a spoke entrance
            const spokeEntrances = { 0: 0, 6: 1, 12: 2, 18: 3 };
            if (space.ringIndex in spokeEntrances) {
                const spokeNum = spokeEntrances[space.ringIndex];
                return [`spoke-${spokeNum}-4`];
            }
        }
        // Move clockwise around the ring
        const nextIndex = (space.ringIndex + 1) % 24;
        return [`ring-${nextIndex}`];
    }

    return [currentId];
};


export const useGameStore = create((set, get) => ({
    status: 'setup',
    players: [],
    currentPlayerIndex: 0,
    diceRoll: null,
    currentQuestion: null,
    winner: null,
    isMoving: false,

    addPlayer: (player) => set((state) => ({
        players: [...state.players, { ...player, wedges: [], position: 'center' }]
    })),

    removePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id)
    })),

    startGame: () => set((state) => {
        if (state.players.length === 0) return state;
        return { status: 'playing', currentPlayerIndex: 0, diceRoll: null, currentQuestion: null, isMoving: false };
    }),

    rollDice: () => {
        if (get().isMoving) return;

        const roll = Math.floor(Math.random() * 6) + 1;
        set({ diceRoll: roll, isMoving: true });

        // Save original position so we can revert if they fail a question
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

                if (stepsTaken >= roll || isFinalCenter || isUncollectedWedge) {
                    clearInterval(interval);
                    const landedSpace = BOARD_SPACES[nextPos];
                    return {
                        players: updatedPlayers,
                        isMoving: false,
                        currentQuestion: {
                            category: landedSpace.category,
                            isFinalCenter,
                            startPosition: initialPosition
                        }
                    };
                }

                return { players: updatedPlayers };
            });
        }, 300);
    },

    answerQuestion: (isCorrect) => set((state) => {
        const { players, currentPlayerIndex, currentQuestion } = state;
        const currentPlayer = players[currentPlayerIndex];
        let updatedPlayers = [...players];
        let nextPlayerIndex = currentPlayerIndex;
        let newStatus = state.status;
        let winner = null;

        if (isCorrect && currentQuestion) {
            if (currentQuestion.isFinalCenter) {
                // If they answer HEIS correctly at the center, they win!
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
        isMoving: false
    })
}));
