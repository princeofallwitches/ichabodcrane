# Ichabod Crane's House of Pain

A Gothic horror board game inspired by Washington Irving's "The Legend of Sleepy Hollow" and the classic board game "Betrayal at House on the Hill."

## Story

You are **Ichabod Crane**, a nervous schoolmaster who has entered a decrepit mansion on the outskirts of Sleepy Hollow. As you explore the house's many rooms, you encounter increasingly terrifying omens. When the horror reaches its peak, the legendary **Headless Horseman** manifests and begins his relentless hunt. Can you find a way to escape before he claims your head?

## How to Play

### Starting the Game

1. Open `index.html` in a modern web browser
2. You begin at the Entrance (marked with blue border)
3. Click adjacent rooms marked with "?" to explore

### Turn Structure

- **Movement**: Click on explored rooms within range to move freely
- **Movement Range**: You can move a number of rooms equal to your current Health
- **Exploration**: Click on an unexplored room (marked "?") to enter
- **Turn End**: Entering a new room ends your turn

### Movement System

The movement range is **limited by your current Health value**:

- **Health 6**: Can move up to 6 rooms away from where your turn started
- **Health 3**: Can only move 3 rooms away
- **Health 1**: Can only move to adjacent rooms!

**Important Notes**:
- Movement is counted through connected doors (pathfinding distance)
- Rooms out of range appear dimmed and grayed out
- Rooms within range are highlighted when hovered
- Taking damage reduces your mobility - healing is crucial!
- You can always explore adjacent unexplored rooms regardless of health

### Character Stats

**Health (6)**: Physical well-being. Reduced by physical dangers.
**Sanity (6)**: Mental stability. Reduced by supernatural horrors.

If either reaches 0, you die/go mad and lose the game.

### Room Contents

Each newly discovered room contains one of:

1. **Items (30% chance)**
   - Blessed Bible, Prayer Book, Silver Cross → Restore Sanity
   - Medicinal Tonic, Bandages, Whiskey Flask → Restore Health

2. **Dreadful Events (30% chance)**
   - Ghostly Apparition, Maddening Whispers → Sanity damage
   - Collapsing Floor, Rusty Trap, Rat Swarm → Health damage
   - Make a saving throw (roll 4+ on d6) to avoid damage

3. **Ominous Portents (40% chance)**
   - Increases Horror Level by 1
   - No immediate danger, but brings the Horseman closer

### Horror Level

- Starts at 0, increases with Portents
- At **Horror Level 5**, the **Headless Horseman appears**!

### The Headless Horseman

When summoned:
- Spawns in the farthest explored room from you
- Moves through explored rooms only
- **Turn 1**: Moves 1 room toward you
- **Turn 2**: Moves 2 rooms toward you
- **Turn 3+**: Speed increases each turn!
- If he catches you, make a saving throw or die instantly

### Saving Throws

When required (events, Horseman encounter):
- Roll 1d6 automatically
- **Success**: 4, 5, or 6 (50% chance)
- **Failure**: 1, 2, or 3 - take damage/effect

### Win Conditions

You can only escape **after** the Headless Horseman appears:

1. **Return to the Entrance** (starting room with blue border)
2. **Find the Secret Passage** (rare special room)

Before the Horseman appears, these locations won't let you leave.

### Lose Conditions

- Health reaches 0 (death)
- Sanity reaches 0 (madness)
- Headless Horseman catches you and you fail the save

## Strategy Tips

1. **Protect your Health** - It determines movement range! Low health = trapped and vulnerable
2. **Explore quickly** early on to find useful items and the Secret Passage
3. **Heal strategically** - Restoring health increases both survivability AND mobility
4. **Plan your escape** - note where the Entrance is or find the Secret Passage before Horror 5
5. **Path management** - The Horseman can only move through explored rooms, so be mindful of creating direct paths
6. **Speed matters** - The Horseman accelerates each turn, so don't delay your escape!
7. **Stay healthy before summoning** - Having full health (6 movement) when the Horseman appears gives you the best escape chances

## Room Types

### Regular Rooms
- Drawing Room, Library, Parlor, Dining Hall
- Kitchen, Cellar, Attic, Bedroom, Study
- Ballroom, Servant's Quarters, Pantry
- Gallery, Chapel, Conservatory

### Special Rooms
- **Entrance** (Blue): Starting location and one escape route
- **Secret Passage** (Rare): Hidden escape route if discovered

## Technical Details

### Files
- `index.html` - Game interface
- `style.css` - Gothic horror styling
- `game.js` - Game logic and mechanics
- `README.md` - This file

### Browser Requirements
- Modern browser with JavaScript enabled
- Tested on Chrome, Firefox, Safari, Edge

### Features
- 10x10 grid-based exploration
- Procedurally generated rooms
- Dynamic difficulty (Horseman acceleration)
- BFS pathfinding for enemy AI
- Atmospheric period-appropriate design

## Credits

**Game Design**: Inspired by "Betrayal at House on the Hill"
**Theme**: Based on "The Legend of Sleepy Hollow" by Washington Irving
**Setting**: Early 1800s Hudson Valley, New York

## Version

**Version 1.0** - Initial Release

---

*"The dominant spirit that haunts this enchanted region is the apparition of a figure on horseback, without a head..."*
— Washington Irving, The Legend of Sleepy Hollow (1820)
