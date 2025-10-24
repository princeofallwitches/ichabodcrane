// Ichabod Crane's House of Pain - Game Logic

class Game {
    constructor() {
        this.gridSize = 10;
        this.player = {
            health: 6,
            maxHealth: 6,
            sanity: 6,
            maxSanity: 6,
            position: { x: 5, y: 5 },
            inventory: []
        };
        this.horrorLevel = 0;
        this.turn = 1;
        this.rooms = new Map();
        this.horseman = null;
        this.gameOver = false;
        this.hasMovedThisTurn = false;
        this.startPosition = { x: 5, y: 5 };
        this.turnStartPosition = { x: 5, y: 5 }; // Track where the current turn started

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        // Create starting room (entrance)
        this.createRoom(this.startPosition.x, this.startPosition.y, 'Entrance', {
            north: true,
            south: true,
            east: true,
            west: true
        }, 'exit');

        this.render();
        this.log("You enter the decrepit mansion. The door creaks shut behind you...");
        this.log("Explore the house by clicking on adjacent rooms.");
    }

    createRoom(x, y, name, doors, type = 'normal') {
        const key = `${x},${y}`;
        this.rooms.set(key, {
            x, y, name, doors, type,
            explored: (x === this.startPosition.x && y === this.startPosition.y),
            hasItem: false,
            hasEvent: false,
            hasPortent: false
        });
    }

    getRoomKey(x, y) {
        return `${x},${y}`;
    }

    getRoom(x, y) {
        return this.rooms.get(this.getRoomKey(x, y));
    }

    generateRandomRoom(x, y) {
        const roomTypes = [
            'Drawing Room', 'Library', 'Parlor', 'Dining Hall', 'Kitchen',
            'Cellar', 'Attic', 'Bedroom', 'Study', 'Ballroom',
            'Servant\'s Quarters', 'Pantry', 'Gallery', 'Chapel', 'Conservatory'
        ];

        const name = roomTypes[Math.floor(Math.random() * roomTypes.length)];

        // Generate random doors (at least 1, up to 4)
        const doors = {
            north: Math.random() > 0.5,
            south: Math.random() > 0.5,
            east: Math.random() > 0.5,
            west: Math.random() > 0.5
        };

        // Ensure at least one door
        const doorCount = Object.values(doors).filter(d => d).length;
        if (doorCount === 0) {
            const randomDir = ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)];
            doors[randomDir] = true;
        }

        // Small chance for special rooms
        let type = 'normal';
        const rand = Math.random();
        if (rand > 0.95 && !this.hasSecretPassage()) {
            type = 'secret-passage';
        }

        this.createRoom(x, y, name, doors, type);

        // Determine room content (item, event, or portent)
        const contentRoll = Math.random();
        if (contentRoll < 0.3) {
            this.rooms.get(this.getRoomKey(x, y)).hasItem = true;
        } else if (contentRoll < 0.6) {
            this.rooms.get(this.getRoomKey(x, y)).hasEvent = true;
        } else {
            this.rooms.get(this.getRoomKey(x, y)).hasPortent = true;
        }
    }

    hasSecretPassage() {
        for (let room of this.rooms.values()) {
            if (room.type === 'secret-passage') return true;
        }
        return false;
    }

    movePlayer(x, y) {
        if (this.gameOver) return;

        const targetRoom = this.getRoom(x, y);
        const adjacent = this.getAdjacentRooms();
        const isAdjacent = adjacent.some(pos => pos.x === x && pos.y === y);

        // Moving to an explored room
        if (targetRoom && targetRoom.explored) {
            // Check if room is within movement range
            if (!this.isRoomReachable(x, y)) {
                this.log("Too far! You don't have enough strength to reach that room.", 'event');
                return;
            }

            this.player.position = { x, y };
            this.hasMovedThisTurn = true;
            this.render();
            return;
        }

        // Exploring a new room (must be adjacent and ends turn)
        if (!isAdjacent) {
            return; // Can only explore adjacent rooms
        }

        if (!targetRoom) {
            this.generateRandomRoom(x, y);
        }

        const room = this.getRoom(x, y);
        room.explored = true;
        this.player.position = { x, y };

        this.log(`You enter the ${room.name}...`);

        // Handle room content
        if (room.hasItem) {
            this.handleItem(room);
        } else if (room.hasEvent) {
            this.handleEvent(room);
        } else if (room.hasPortent) {
            this.handlePortent(room);
        } else {
            this.log("The room is eerily empty.");
        }

        // Check for special room types
        if (room.type === 'secret-passage') {
            this.log("You've discovered a SECRET PASSAGE!", 'item');
            if (this.horseman) {
                this.showModal('Secret Passage Found!',
                    'You can escape through this hidden exit! Click here to win!',
                    [{ text: 'Escape!', action: () => this.winGame('secret-passage') }]);
            } else {
                this.showModal('Secret Passage',
                    'You find a hidden passage that could serve as an escape route... but you have no reason to flee. Yet.',
                    [{ text: 'Continue', action: () => this.closeModal() }]);
            }
        }

        // End turn after exploring new room
        this.endTurn();
    }

    handleItem(room) {
        const items = [
            { name: 'Blessed Bible', effect: 'sanity', value: 2 },
            { name: 'Medicinal Tonic', effect: 'health', value: 2 },
            { name: 'Silver Cross', effect: 'sanity', value: 1 },
            { name: 'Bandages', effect: 'health', value: 1 },
            { name: 'Whiskey Flask', effect: 'health', value: 1 },
            { name: 'Prayer Book', effect: 'sanity', value: 1 }
        ];

        const item = items[Math.floor(Math.random() * items.length)];

        if (item.effect === 'health') {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + item.value);
            this.log(`Found ${item.name}! Restored ${item.value} health.`, 'item');
        } else if (item.effect === 'sanity') {
            this.player.sanity = Math.min(this.player.maxSanity, this.player.sanity + item.value);
            this.log(`Found ${item.name}! Restored ${item.value} sanity.`, 'item');
        }

        this.player.inventory.push(item.name);
        room.hasItem = false;
    }

    handleEvent(room) {
        const events = [
            {
                name: 'Ghostly Apparition',
                description: 'A spectral figure materializes before you, its hollow eyes piercing your soul!',
                saveType: 'sanity',
                damage: 2
            },
            {
                name: 'Collapsing Floor',
                description: 'The floorboards give way beneath your feet!',
                saveType: 'health',
                damage: 1
            },
            {
                name: 'Swarm of Rats',
                description: 'Diseased rats surge from the shadows, gnashing at your ankles!',
                saveType: 'health',
                damage: 1
            },
            {
                name: 'Maddening Whispers',
                description: 'Incomprehensible whispers echo through the room, clawing at your mind!',
                saveType: 'sanity',
                damage: 2
            },
            {
                name: 'Portrait\'s Gaze',
                description: 'The eyes of a portrait follow your every move. You cannot look away!',
                saveType: 'sanity',
                damage: 1
            },
            {
                name: 'Rusty Trap',
                description: 'Your foot catches in a rusty bear trap!',
                saveType: 'health',
                damage: 2
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        this.log(`EVENT: ${event.name}!`, 'event');

        const saveSuccess = this.makeSavingThrow();

        if (saveSuccess) {
            this.showModal(event.name,
                event.description + '\n\nYou narrowly avoid harm!',
                [{ text: 'Continue', action: () => this.closeModal() }]);
        } else {
            if (event.saveType === 'health') {
                this.player.health -= event.damage;
                this.showModal(event.name,
                    event.description + `\n\nYou take ${event.damage} damage!`,
                    [{ text: 'Continue', action: () => this.closeModal() }]);
            } else {
                this.player.sanity -= event.damage;
                this.showModal(event.name,
                    event.description + `\n\nYou lose ${event.damage} sanity!`,
                    [{ text: 'Continue', action: () => this.closeModal() }]);
            }
            this.checkDeath();
        }

        room.hasEvent = false;
    }

    handlePortent(room) {
        const portents = [
            'The temperature drops suddenly. Your breath mists in the air.',
            'You hear the distant sound of hoofbeats echoing through the night.',
            'A raven caws three times outside the window.',
            'The candles flicker and die, leaving you in momentary darkness.',
            'You smell sulfur and decay on the wind.',
            'A child\'s laughter echoes from nowhere.',
            'The walls seem to breathe around you.',
            'You glimpse a shadow that moves against the light.'
        ];

        const portent = portents[Math.floor(Math.random() * portents.length)];
        this.horrorLevel++;

        this.log(`OMEN: ${portent}`, 'portent');
        this.log(`Horror level increased to ${this.horrorLevel}!`, 'portent');

        if (this.horrorLevel >= 5 && !this.horseman) {
            this.summonHorseman();
        }

        this.showModal('Ominous Portent',
            portent + `\n\nHorror Level: ${this.horrorLevel}/5`,
            [{ text: 'Continue', action: () => this.closeModal() }]);

        room.hasPortent = false;
    }

    makeSavingThrow() {
        // Roll 1d6, succeed on 4+
        const roll = Math.floor(Math.random() * 6) + 1;
        return roll >= 4;
    }

    summonHorseman() {
        this.log('The HEADLESS HORSEMAN has appeared!', 'horseman');
        this.log('Find the exit or secret passage to escape!', 'horseman');

        // Find the farthest explored room from player
        let farthestRoom = null;
        let maxDistance = 0;

        for (let room of this.rooms.values()) {
            if (room.explored && !(room.x === this.player.position.x && room.y === this.player.position.y)) {
                const distance = Math.abs(room.x - this.player.position.x) + Math.abs(room.y - this.player.position.y);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    farthestRoom = room;
                }
            }
        }

        if (farthestRoom) {
            this.horseman = {
                position: { x: farthestRoom.x, y: farthestRoom.y },
                speed: 1,
                turnsSinceAppearance: 0
            };
        } else {
            // Fallback: place at start position if no other rooms
            this.horseman = {
                position: { x: this.startPosition.x, y: this.startPosition.y },
                speed: 1,
                turnsSinceAppearance: 0
            };
        }

        this.showModal('THE HEADLESS HORSEMAN',
            'A thunderous gallop shakes the very foundations! The Headless Horseman has entered the house, and he hunts for YOU!\n\nFind the Exit or Secret Passage to escape with your life!',
            [{ text: 'RUN!', action: () => this.closeModal() }]);
    }

    moveHorseman() {
        if (!this.horseman) return;

        this.horseman.turnsSinceAppearance++;
        const movesThisTurn = this.horseman.speed;

        for (let i = 0; i < movesThisTurn; i++) {
            // Find path to player using BFS
            const path = this.findPath(this.horseman.position, this.player.position);

            if (path && path.length > 1) {
                this.horseman.position = path[1]; // Move one step closer

                // Check if horseman caught player
                if (this.horseman.position.x === this.player.position.x &&
                    this.horseman.position.y === this.player.position.y) {
                    this.horsemanEncounter();
                    return;
                }
            }
        }

        this.horseman.speed++; // Increase speed each turn
        this.log(`The Horseman draws closer! (Speed: ${this.horseman.speed})`, 'horseman');
    }

    findPath(start, end) {
        // BFS pathfinding through explored rooms
        const queue = [[start]];
        const visited = new Set([this.getRoomKey(start.x, start.y)]);

        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];

            if (current.x === end.x && current.y === end.y) {
                return path;
            }

            const room = this.getRoom(current.x, current.y);
            if (!room) continue;

            const directions = [
                { dx: 0, dy: -1, door: 'north' },
                { dx: 0, dy: 1, door: 'south' },
                { dx: 1, dy: 0, door: 'east' },
                { dx: -1, dy: 0, door: 'west' }
            ];

            for (let dir of directions) {
                if (!room.doors[dir.door]) continue;

                const nextX = current.x + dir.dx;
                const nextY = current.y + dir.dy;
                const key = this.getRoomKey(nextX, nextY);

                if (visited.has(key)) continue;

                const nextRoom = this.getRoom(nextX, nextY);
                if (!nextRoom || !nextRoom.explored) continue;

                visited.add(key);
                queue.push([...path, { x: nextX, y: nextY }]);
            }
        }

        return null;
    }

    horsemanEncounter() {
        const saveSuccess = this.makeSavingThrow();

        if (saveSuccess) {
            this.showModal('Narrow Escape!',
                'The Headless Horseman\'s blade whistles past your head! You dodge at the last moment!\n\nYou must reach the exit NOW!',
                [{ text: 'Continue', action: () => this.closeModal() }]);
        } else {
            this.showModal('GAME OVER',
                'The Headless Horseman\'s spectral blade finds its mark. Your world fades to darkness...\n\nYou have perished in the House of Pain.',
                [{ text: 'New Game', action: () => this.newGame() }]);
            this.gameOver = true;
        }
    }

    checkDeath() {
        if (this.player.health <= 0) {
            this.showModal('GAME OVER',
                'Your wounds prove fatal. You collapse in the darkness of the mansion...\n\nYou have died.',
                [{ text: 'New Game', action: () => this.newGame() }]);
            this.gameOver = true;
        } else if (this.player.sanity <= 0) {
            this.showModal('GAME OVER',
                'Your mind shatters under the weight of unspeakable horrors. You are lost to madness...\n\nYou have gone insane.',
                [{ text: 'New Game', action: () => this.newGame() }]);
            this.gameOver = true;
        }
    }

    endTurn() {
        this.turn++;
        this.hasMovedThisTurn = false;

        // Reset turn start position to current position for next turn
        this.turnStartPosition = { x: this.player.position.x, y: this.player.position.y };

        // Move horseman
        if (this.horseman) {
            this.moveHorseman();
        }

        this.render();
    }

    checkExit() {
        const currentRoom = this.getRoom(this.player.position.x, this.player.position.y);

        if (currentRoom.type === 'exit') {
            if (this.horseman) {
                this.winGame('exit');
            } else {
                this.showModal('The Exit',
                    'You could leave now... but something tells you that you haven\'t yet faced the true horror of this place.',
                    [{ text: 'Continue Exploring', action: () => this.closeModal() }]);
            }
        }
    }

    winGame(escapeType) {
        const message = escapeType === 'exit'
            ? 'You burst through the entrance and flee into the night! The Headless Horseman\'s cry of rage fades behind you.\n\nYou have ESCAPED the House of Pain!'
            : 'You slip through the secret passage and emerge in the safety of the forest! The Horseman will never find you.\n\nYou have ESCAPED the House of Pain!';

        this.showModal('VICTORY!', message,
            [{ text: 'New Game', action: () => this.newGame() }]);
        this.gameOver = true;
    }

    getAdjacentRooms() {
        const current = this.getRoom(this.player.position.x, this.player.position.y);
        if (!current) return [];

        const adjacent = [];
        const directions = [
            { dx: 0, dy: -1, door: 'north' },
            { dx: 0, dy: 1, door: 'south' },
            { dx: 1, dy: 0, door: 'east' },
            { dx: -1, dy: 0, door: 'west' }
        ];

        for (let dir of directions) {
            if (current.doors[dir.door]) {
                const x = this.player.position.x + dir.dx;
                const y = this.player.position.y + dir.dy;
                if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                    adjacent.push({ x, y });
                }
            }
        }

        return adjacent;
    }

    getReachableRooms() {
        // Calculate which rooms are within movement range (based on health)
        const movementRange = this.player.health;
        const reachable = new Map();

        // BFS to find all rooms within movement range from turn start position
        const queue = [{ pos: this.turnStartPosition, distance: 0 }];
        reachable.set(this.getRoomKey(this.turnStartPosition.x, this.turnStartPosition.y), 0);

        while (queue.length > 0) {
            const { pos, distance } = queue.shift();

            if (distance >= movementRange) continue;

            const room = this.getRoom(pos.x, pos.y);
            if (!room || !room.explored) continue;

            const directions = [
                { dx: 0, dy: -1, door: 'north' },
                { dx: 0, dy: 1, door: 'south' },
                { dx: 1, dy: 0, door: 'east' },
                { dx: -1, dy: 0, door: 'west' }
            ];

            for (let dir of directions) {
                if (!room.doors[dir.door]) continue;

                const nextX = pos.x + dir.dx;
                const nextY = pos.y + dir.dy;
                const key = this.getRoomKey(nextX, nextY);

                if (nextX < 0 || nextX >= this.gridSize || nextY < 0 || nextY >= this.gridSize) continue;

                const nextRoom = this.getRoom(nextX, nextY);
                if (!nextRoom || !nextRoom.explored) continue;

                if (!reachable.has(key) || reachable.get(key) > distance + 1) {
                    reachable.set(key, distance + 1);
                    queue.push({ pos: { x: nextX, y: nextY }, distance: distance + 1 });
                }
            }
        }

        return reachable;
    }

    isRoomReachable(x, y) {
        const reachable = this.getReachableRooms();
        return reachable.has(this.getRoomKey(x, y));
    }

    render() {
        // Update stats
        document.getElementById('health-bar').style.width =
            `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('health-text').textContent =
            `${this.player.health}/${this.player.maxHealth}`;

        document.getElementById('sanity-bar').style.width =
            `${(this.player.sanity / this.player.maxSanity) * 100}%`;
        document.getElementById('sanity-text').textContent =
            `${this.player.sanity}/${this.player.maxSanity}`;

        // Update horror level
        document.getElementById('horror-level').textContent = this.horrorLevel;
        const horrorWarning = document.getElementById('horror-warning');
        if (this.horrorLevel === 0) {
            horrorWarning.textContent = 'The darkness gathers...';
        } else if (this.horrorLevel < 3) {
            horrorWarning.textContent = 'Something wicked approaches...';
        } else if (this.horrorLevel < 5) {
            horrorWarning.textContent = 'Terror is imminent!';
        } else {
            horrorWarning.textContent = 'THE HORSEMAN RIDES!';
            horrorWarning.style.color = '#ff0000';
        }

        // Update inventory
        const inventoryList = document.getElementById('inventory-list');
        if (this.player.inventory.length === 0) {
            inventoryList.innerHTML = '<li class="empty-inventory">No items</li>';
        } else {
            inventoryList.innerHTML = this.player.inventory
                .map(item => `<li>${item}</li>`)
                .join('');
        }

        // Update turn counter
        document.getElementById('turn-counter').textContent = `Turn: ${this.turn}`;

        // Update movement info
        const movementInfo = document.getElementById('movement-info');
        movementInfo.textContent = `Movement Range: ${this.player.health} rooms`;

        // Render game board
        this.renderBoard();

        // Check for exit condition
        this.checkExit();
    }

    renderBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';

        const adjacent = this.getAdjacentRooms();
        const reachable = this.getReachableRooms();

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const room = this.getRoom(x, y);
                const div = document.createElement('div');
                div.className = 'room';

                const isPlayerHere = this.player.position.x === x && this.player.position.y === y;
                const isHorsemanHere = this.horseman && this.horseman.position.x === x && this.horseman.position.y === y;
                const isAdjacent = adjacent.some(pos => pos.x === x && pos.y === y);
                const isReachable = reachable.has(this.getRoomKey(x, y));

                if (room && room.explored) {
                    div.classList.add('explored');

                    // Mark rooms that are out of range
                    if (!isPlayerHere && !isReachable) {
                        div.classList.add('out-of-range');
                    } else if (!isPlayerHere && isReachable) {
                        div.classList.add('in-range');
                    }

                    if (room.type === 'exit') {
                        div.classList.add('exit');
                    }

                    if (isPlayerHere) {
                        div.classList.add('current');
                        div.innerHTML = '<span class="room-icon">🚶</span>';
                    } else if (isHorsemanHere) {
                        div.classList.add('horseman');
                        div.innerHTML = '<span class="room-icon">💀</span>';
                    } else {
                        div.textContent = room.name.substring(0, 8);

                        if (room.type === 'secret-passage') {
                            div.innerHTML = '<span class="room-icon">🚪</span>';
                        }
                    }
                } else if (isAdjacent) {
                    div.classList.add('unexplored');
                    div.innerHTML = '<span class="room-icon">?</span>';
                }

                // Add click handler for movement - only for adjacent unexplored or reachable explored rooms
                if (isAdjacent || (room && room.explored && !isPlayerHere && isReachable)) {
                    div.style.cursor = 'pointer';
                    div.addEventListener('click', () => this.movePlayer(x, y));
                } else if (room && room.explored && !isPlayerHere && !isReachable) {
                    // Out of range rooms are not clickable
                    div.style.cursor = 'not-allowed';
                }

                board.appendChild(div);
            }
        }
    }

    log(message, type = 'normal') {
        const logDiv = document.getElementById('log-entries');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `Turn ${this.turn}: ${message}`;
        logDiv.insertBefore(entry, logDiv.firstChild);

        // Keep only last 20 entries
        while (logDiv.children.length > 20) {
            logDiv.removeChild(logDiv.lastChild);
        }
    }

    showModal(title, description, actions) {
        const modal = document.getElementById('event-modal');
        document.getElementById('event-title').textContent = title;
        document.getElementById('event-description').textContent = description;

        const actionsDiv = document.getElementById('event-actions');
        actionsDiv.innerHTML = '';

        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.textContent = action.text;
            btn.onclick = action.action;
            actionsDiv.appendChild(btn);
        });

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('event-modal').classList.remove('active');
    }

    showInstructions() {
        const instructions = `ICHABOD CRANE'S HOUSE OF PAIN

OBJECTIVE:
Explore the haunted mansion and survive the Headless Horseman!

HOW TO PLAY:
- Click on rooms with "?" to explore new areas
- Click on explored rooms to move freely
- Exploring a new room ends your turn
- Collect items to restore Health and Sanity
- Avoid events or make saving throws (4+ on d6)

MOVEMENT:
- You can move up to Health rooms per turn
- Lower health = shorter movement range!
- Rooms out of range are dimmed and unclickable
- Healing increases your movement range

ROOMS CONTAIN:
- Items: Restore health or sanity
- Events: Dangerous encounters requiring saves
- Portents: Increase horror level by 1

HORROR LEVEL:
When horror reaches 5, the Headless Horseman appears!

THE HORSEMAN:
- Spawns far from you in explored rooms
- Moves 1 room first turn, 2 second turn, etc.
- Catches you = death (unless you save)

WIN CONDITIONS:
- Return to the Entrance (Exit) after Horseman appears
- Find and use the Secret Passage room

LOSE CONDITIONS:
- Health reaches 0 (death)
- Sanity reaches 0 (madness)
- Horseman catches you (failed save)

Good luck, Ichabod! The night is dark and full of terrors...`;

        this.showModal('Instructions', instructions,
            [{ text: 'Close', action: () => this.closeModal() }]);
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('instructions-btn').addEventListener('click', () => this.showInstructions());
    }

    newGame() {
        this.player = {
            health: 6,
            maxHealth: 6,
            sanity: 6,
            maxSanity: 6,
            position: { x: 5, y: 5 },
            inventory: []
        };
        this.horrorLevel = 0;
        this.turn = 1;
        this.rooms = new Map();
        this.horseman = null;
        this.gameOver = false;
        this.hasMovedThisTurn = false;
        this.turnStartPosition = { x: 5, y: 5 };

        document.getElementById('log-entries').innerHTML = '';
        document.getElementById('horror-warning').style.color = '';

        this.closeModal();
        this.initializeGame();
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});
