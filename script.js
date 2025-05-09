document.addEventListener('DOMContentLoaded', () => {
    let currentScene = 0;
    let storyScript = [];
    let typewriterInterval;
    let typewriterText = "";
    let typewriterCharIndex = 0;
    let skipTypewriterListener;
    const saveSlotKey = 'echoesOfAShatteredHour_saveGame';

    let gameState = {
        flags: {},
        inventory: []
    };

    function resetGameState() {
        gameState.flags = {};
        gameState.inventory = [];
    }

    const titleScreen = document.getElementById('title-screen');
    const gameEngine = document.getElementById('visual-novel-engine');
    const startButton = document.getElementById('start-button');
    const loadGameButtonTitle = document.getElementById('load-game-button-title');

    const backgroundLayer = document.getElementById('background-layer');
    const cgLayer = document.getElementById('cg-layer');
    const characterLayer = document.getElementById('character-layer');
    const dialogueBox = document.getElementById('dialogue-box');
    const speakerName = document.getElementById('speaker-name');
    const dialogueText = document.getElementById('dialogue-text');
    const choicesContainer = document.getElementById('choices-container');
    const nextButton = document.getElementById('next-button');

    const menuButtonIngame = document.getElementById('menu-button-ingame');
    const ingameMenuPanel = document.getElementById('ingame-menu-panel');
    const menuSaveButton = document.getElementById('menu-save-button');
    const menuLoadButton = document.getElementById('menu-load-button');
    const menuQuitButton = document.getElementById('menu-quit-button');
    const menuCloseButton = document.getElementById('menu-close-button');
    const menuInventoryButton = document.getElementById('menu-inventory-button');
    const inventoryPanel = document.getElementById('inventory-panel');
    const inventoryList = document.getElementById('inventory-list');
    const inventoryCloseButton = document.getElementById('inventory-close-button');

    const assetPaths = {
        backgrounds: 'assets/img/backgrounds/',
        cgs: 'assets/img/cgs/',
        characters: {
            aria: 'assets/img/characters/aria/',
            elara: 'assets/img/characters/elara_thorne/',
            lysander: 'assets/img/characters/lysander/',
            warden: 'assets/img/characters/warden/'
        },
        ui: 'assets/img/ui/'
    };

    function initGame() {
        titleScreen.classList.remove('hidden');
        gameEngine.classList.add('hidden');
        if(ingameMenuPanel) ingameMenuPanel.classList.add('hidden');

        startButton.addEventListener('click', startGame);
        nextButton.addEventListener('click', advanceScene);
        if(loadGameButtonTitle) loadGameButtonTitle.addEventListener('click', loadGame);

        if (menuButtonIngame) {
            menuButtonIngame.addEventListener('click', () => {
                toggleInGameMenu();
            });
        }
        if (menuSaveButton) menuSaveButton.addEventListener('click', () => {
            saveGame();
        });
        if (menuLoadButton) menuLoadButton.addEventListener('click', () => {
            loadGame();
        });
        if (menuQuitButton) menuQuitButton.addEventListener('click', quitToTitle);
        if (menuCloseButton) menuCloseButton.addEventListener('click', () => toggleInGameMenu(false));
        if (menuInventoryButton) menuInventoryButton.addEventListener('click', toggleInventoryPanel);
        if (inventoryCloseButton) inventoryCloseButton.addEventListener('click', () => toggleInventoryPanel(false));

        if (loadGameButtonTitle && menuLoadButton) {
             if (!localStorage.getItem(saveSlotKey)) {
                loadGameButtonTitle.disabled = true;
                menuLoadButton.disabled = true;
            } else {
                loadGameButtonTitle.disabled = false;
                menuLoadButton.disabled = false;
            }
        }

        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'J') {
                const sceneId = prompt("Enter Scene ID to jump to:");
                if (sceneId) {
                    const targetSceneIndex = storyScript.findIndex(s => s.id === sceneId.trim());
                    if (targetSceneIndex !== -1) {
                        if (typewriterInterval) {
                            clearInterval(typewriterInterval);
                            typewriterInterval = null;
                            if (skipTypewriterListener) {
                                dialogueBox.removeEventListener('click', skipTypewriterListener);
                                skipTypewriterListener = null;
                            }
                        }
                        currentScene = targetSceneIndex;
                        displayScene(storyScript[currentScene]);
                    } else {
                        alert("Scene ID not found!");
                    }
                }
            }
        });

        loadStoryScript();
    }

    function startGame() {
        titleScreen.classList.add('hidden');
        gameEngine.classList.remove('hidden');
        currentScene = 0;
        resetGameState();
        displayScene(storyScript[currentScene]);
    }

    function loadStoryScript() {
        storyScript = [
            {
                cg: 'act_1/fragment_discovery.png',
                narration: "Aria stumbled upon an ancient, pulsating fragment in the ruins near her village. It hummed with an unnatural energy."
            },
            {
                background: 'estate/aria_room.png',
                characters: [
                    { name: 'aria', sprite: 'base/neutral_thoughtful.png', position: 'center' }
                ],
                speaker: "Aria",
                dialogue: "What... what is this thing? It feels... strange."
            },
            {
                background: 'estate/aria_room.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'center' }
                ],
                narration: "Drawn by an unknown force, she took it back to her room."
            },
            {
                background: 'village/day_square.png',
                cg: 'act_1/lysander_awakens.png',
                narration: "Later, while exploring the old Thorne estate, the fragment reacted violently. A figure materialized from the swirling temporal energies."
            },
            {
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'base/surprised_shocked.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/neutral_formal.png', position: 'left' }
                ],
                speaker: "Lysander",
                dialogue: "Where... Who are you?"
            },
            {
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'base/anxious_worried.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/neutral_formal.png', position: 'left' }
                ],
                speaker: "Aria",
                dialogue: "I... I'm Aria. Who are *you*?"
            },
            {
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'base/anxious_worried.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/neutral_formal.png', position: 'left' }
                ],
                cg: 'act_1/warden_glimpse.png',
                narration: "As they spoke, a chilling presence swept through the area. A shadowy figure, the Warden, observed them from afar before vanishing."
            },
            {
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'base/anxious_worried.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/neutral_formal.png', position: 'left' }
                ],
                speaker: "Lysander",
                dialogue: "We need to understand what's happening. That... presence was not natural."
            },
            {
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'base/anxious_worried.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/neutral_formal.png', position: 'left' }
                ],
                narration: "What should Aria do?",
                choices: [
                    {
                        text: "Trust this stranger and investigate together.",
                        nextScene: "investigate_together",
                        setFlags: { trustedLysanderEarly: true }
                    },
                    {
                        text: "Be cautious. Find Elara Thorne for advice.",
                        nextScene: "seek_elara",
                        setFlags: { soughtElaraFirst: true }
                    }
                ]
            },
            {
                id: "investigate_together",
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'adventuring/determined.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "You chose to trust Lysander. The path ahead is uncertain.",
                dialogue: [
                    {
                        text: "I'll help you investigate this mystery, Aria. Together, we'll uncover the truth.",
                        condition: { flag: "trustedLysanderEarly", value: true }
                    },
                    {
                        text: "Let's proceed with caution. There's much we don't understand yet.",
                        condition: { flag: "trustedLysanderEarly", value: false }
                    }
                ],
                next: "clock_tower_approach"
            },
            {
                id: "clock_tower_approach",
                background: 'additional/clock_tower.png',
                characters: [
                    { name: 'aria', sprite: 'adventuring/determined.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "You and Lysander approach the old clock tower, the source of the temporal anomaly.",
                dialogue: [
                    {
                        text: "This place... it feels different. The air is thick with temporal energy.",
                        condition: { flag: "trustedLysanderEarly", value: true }
                    },
                    {
                        text: "We should be careful. The Warden's presence lingers here.",
                        condition: { flag: "trustedLysanderEarly", value: false }
                    }
                ],
                next: "clock_tower_inside"
            },
            {
                id: "clock_tower_inside",
                background: 'additional/clock_tower.png',
                characters: [
                    { name: 'aria', sprite: 'adventuring/determined.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "Inside, you find a complex mechanism that seems to be the heart of the anomaly.",
                dialogue: [
                    {
                        text: "This is incredible! The mechanism is still functional after all these years.",
                        condition: { flag: "trustedLysanderEarly", value: true }
                    },
                    {
                        text: "Be careful, Aria. The mechanism is unstable. We need to proceed with caution.",
                        condition: { flag: "trustedLysanderEarly", value: false }
                    }
                ],
                choices: [
                    {
                        text: "Examine the mechanism closely.",
                        nextScene: "examine_mechanism",
                        setFlags: { examinedMechanism: true }
                    },
                    {
                        text: "Look for clues about the Warden.",
                        nextScene: "search_for_clues",
                        setFlags: { searchedForClues: true }
                    }
                ]
            },
            {
                id: "examine_mechanism",
                background: 'additional/clock_tower.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "You carefully examine the ancient mechanism.",
                dialogue: [
                    {
                        text: "This is remarkable! The mechanism is designed to manipulate time itself.",
                        condition: { flag: "trustedLysanderEarly", value: true }
                    },
                    {
                        text: "Be careful, Aria. The mechanism is ancient and unstable.",
                        condition: { flag: "trustedLysanderEarly", value: false }
                    }
                ],
                next: "clock_tower_decision"
            },
            {
                id: "search_for_clues",
                background: 'additional/clock_tower.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "You search the room for any signs of the Warden's presence.",
                dialogue: [
                    {
                        text: "I found something! There's an ancient tome hidden in the wall.",
                        condition: { flag: "trustedLysanderEarly", value: true }
                    },
                    {
                        text: "Be careful, Aria. The Warden may have left traps.",
                        condition: { flag: "trustedLysanderEarly", value: false }
                    }
                ],
                next: "clock_tower_decision"
            },
            {
                id: "clock_tower_decision",
                background: 'additional/clock_tower.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "What should you do next?",
                choices: [
                    {
                        text: "Try to activate the mechanism.",
                        nextScene: "activate_mechanism",
                        setFlags: { attemptedActivation: true }
                    },
                    {
                        text: "Leave and seek more information.",
                        nextScene: "leave_clock_tower",
                        setFlags: { decidedToLeave: true }
                    }
                ]
            },
            {
                id: "activate_mechanism",
                background: 'additional/clock_tower.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "You attempt to activate the ancient mechanism.",
                dialogue: [
                    {
                        text: "The mechanism hums to life, filling the room with temporal energy.",
                        condition: { flag: "trustedLysanderEarly", value: true }
                    },
                    {
                        text: "The mechanism activates, but it's unstable. We need to be careful!",
                        condition: { flag: "trustedLysanderEarly", value: false }
                    }
                ],
                next: "end_of_current_story"
            },
            {
                id: "leave_clock_tower",
                background: 'additional/clock_tower.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'right' },
                    { name: 'lysander', sprite: 'base/approving_smile.png', position: 'left' }
                ],
                narration: "You decide to leave the clock tower and seek more information.",
                dialogue: [
                    {
                        text: "We've learned much, but there's still much to discover.",
                        condition: { flag: "trustedLysanderEarly", value: true }
                    },
                    {
                        text: "We should be careful. The Warden may return.",
                        condition: { flag: "trustedLysanderEarly", value: false }
                    }
                ],
                next: "end_of_current_story"
            },
            {
                id: "seek_elara",
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'base/anxious_worried.png', position: 'center' }
                ],
                narration: "You decide to seek Elara Thorne's advice first.",
                next: "elara_meeting_intro"
            },
            {
                id: "elara_meeting_intro",
                background: 'village/elaras_cottage_int.png',
                onEnter: { setFlags: { metElara: true } },
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                speaker: "Elara Thorne",
                dialogue: "Aria, child. What brings you to my door with such a troubled look?",
                next: "elara_conversation_1"
            },
            {
                id: "elara_conversation_1",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                speaker: "Aria",
                dialogue: "Elara, I found something strange in the ruins. It's pulsing with... I don't know what, but it's not natural.",
                next: "elara_response_1"
            },
            {
                id: "elara_response_1",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                speaker: "Elara Thorne",
                dialogue: "I see. And what did you do with this... thing?",
                choices: [
                    {
                        text: "I brought it to my room.",
                        nextScene: "elara_reaction_1",
                        setFlags: { showedFragmentToElara: true }
                    },
                    {
                        text: "I left it in the ruins.",
                        nextScene: "elara_reaction_2",
                        setFlags: { leftFragmentInRuins: true }
                    }
                ]
            },
            {
                id: "elara_reaction_1",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                 dialogue: [
                    {
                        text: "You brought it here? Child, do you realize what you've done?",
                        condition: { flag: "showedFragmentToElara", value: true }
                    },
                     {
                         text: "That thing is dangerous, Aria. Very dangerous.", // Default fallback
                     }
                ],
                 speaker: "Elara Thorne",
                next: "elara_warning"
            },
            {
                id: "elara_reaction_2",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                dialogue: [
                    {
                        text: "Wise choice. That thing is dangerous. It's connected to the temporal anomalies.",
                        condition: { flag: "leftFragmentInRuins", value: true }
                    },
                    {
                         text: "Good. Leaving it was for the best.", // Default fallback
                    }
                ],
                 speaker: "Elara Thorne",
                next: "elara_warning"
            },
            {
                id: "elara_warning",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                speaker: "Elara Thorne",
                dialogue: "The temporal anomalies... they're getting worse. The Warden is stirring again.",
                next: "elara_advice"
            },
            {
                id: "elara_advice",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                speaker: "Elara Thorne",
                dialogue: "You must be careful, Aria. The Warden is not to be trifled with. What will you do?",
                choices: [
                    {
                        text: "Seek the truth about the anomalies.",
                        nextScene: "elara_path_1",
                        setFlags: { choseToInvestigate: true }
                    },
                    {
                        text: "Stay safe and avoid the danger.",
                        nextScene: "elara_path_2",
                        setFlags: { choseToAvoid: true }
                    }
                ]
            },
            {
                id: "elara_path_1",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                speaker: "Elara Thorne",
                dialogue: "Very well. I'll help you investigate. But remember, the Warden is not to be underestimated.",
                next: "end_of_current_story"
            },
            {
                id: "elara_path_2",
                background: 'village/elaras_cottage_int.png',
                characters: [
                    { name: 'aria', sprite: 'base/curious_inquisitive.png', position: 'left' },
                    { name: 'elara', sprite: 'base_attire/neutral_wary.png', position: 'right' }
                ],
                speaker: "Elara Thorne",
                dialogue: "Wise choice, child. Sometimes, the best course is to avoid danger altogether.",
                next: "end_of_current_story"
            },
            {
                id: "end_of_current_story",
                background: 'village/day_square.png',
                characters: [
                    { name: 'aria', sprite: 'base/neutral_thoughtful.png', position: 'center' }
                ],
                narration: "This is the end of the current story. Thank you for playing!"
            }
        ];
    }

    function displayScene(scene) {
        if (!scene) {
            console.error("Attempted to display undefined scene.");
            dialogueText.textContent = "Error: Could not load scene.";
            speakerName.textContent = "";
            speakerName.classList.remove('active');
            nextButton.classList.add('hidden');
            choicesContainer.innerHTML = '';
            return;
        }

        console.log("Displaying scene:", scene.id || currentScene, scene);

        speakerName.textContent = "";
        speakerName.classList.remove('active');
        dialogueText.textContent = "";
        choicesContainer.innerHTML = "";
        nextButton.classList.remove('hidden');
        nextButton.disabled = true;

        if (typewriterInterval) {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }
         if (skipTypewriterListener) {
             dialogueBox.removeEventListener('click', skipTypewriterListener);
             skipTypewriterListener = null;
         }

        if (scene.onEnter && scene.onEnter.setFlags) {
             for (const flag in scene.onEnter.setFlags) {
                  gameState.flags[flag] = scene.onEnter.setFlags[flag];
             }
        }
        if (scene.onEnter && scene.onEnter.addItem) {
            if (!gameState.inventory.includes(scene.onEnter.addItem)) {
                gameState.inventory.push(scene.onEnter.addItem);
                console.log(`Item added on scene entry: ${scene.onEnter.addItem}. Inventory:`, gameState.inventory);
            }
        }

        const currentBgImage = backgroundLayer.style.backgroundImage;
        const newBgImage = scene.background ? `url('${assetPaths.backgrounds}${scene.background}')` : "";

        if (newBgImage !== currentBgImage) {
            backgroundLayer.style.opacity = 0;
            setTimeout(() => {
                backgroundLayer.style.backgroundImage = newBgImage;
                if (newBgImage) {
                    backgroundLayer.style.opacity = 1;
                } else {
                    backgroundLayer.style.opacity = 0;
                }
            }, 200);
        }

        const newCgImageSrc = scene.cg ? `${assetPaths.cgs}${scene.cg}` : null;
        const newCgUrl = newCgImageSrc ? `url('${newCgImageSrc}')` : '';

        if (newCgUrl) {
             cgLayer.style.backgroundImage = newCgUrl;
             cgLayer.style.backgroundSize = 'cover';
             cgLayer.style.backgroundPosition = 'center';
             cgLayer.style.opacity = 1;
        } else {
             cgLayer.style.opacity = 0;
             cgLayer.style.backgroundImage = '';
        }

        characterLayer.innerHTML = '';
        if (scene.characters && scene.characters.length > 0) {
            scene.characters.forEach(charData => {
                if (assetPaths.characters[charData.name]) {
                    const charImg = document.createElement('img');
                    charImg.src = `${assetPaths.characters[charData.name]}${charData.sprite}`;
                    charImg.id = `char-${charData.name}`;

                    charImg.classList.add('character-sprite');
                    if (charData.position) {
                        charImg.classList.add(`char-${charData.position}`);
                    } else {
                        charImg.classList.add('char-center');
                    }

                    const speakerNameToHighlight = scene.speaker ? scene.speaker.toLowerCase() : null;
                    if (speakerNameToHighlight && charData.name.toLowerCase() === speakerNameToHighlight) {
                        charImg.classList.add('active-speaker-sprite');
                    }

                    characterLayer.appendChild(charImg);
                    void charImg.offsetWidth;
                    charImg.classList.add('visible');
                } else {
                   console.warn(`Character asset path not found for: ${charData.name}`);
                }
            });
        }

        if (scene.speaker) {
             speakerName.textContent = scene.speaker;
             speakerName.classList.add('active');
        } else {
             speakerName.textContent = "";
             speakerName.classList.remove('active');
        }

        let textToDisplay = "";
        if (Array.isArray(scene.dialogue)) {
            let fallbackText = "";
            let lineFound = false;
            for (const line of scene.dialogue) {
                let conditionMet = false;
                if (line.condition) {
                    if (line.condition.flag !== undefined) {
                        if (gameState.flags[line.condition.flag] === line.condition.value) {
                            conditionMet = true;
                        }
                    } else if (line.condition.inventoryHas !== undefined) {
                        if (gameState.inventory.includes(line.condition.inventoryHas)) {
                            conditionMet = true;
                        }
                    } else if (line.condition.inventoryHasNot !== undefined) {
                        if (!gameState.inventory.includes(line.condition.inventoryHasNot)) {
                            conditionMet = true;
                        }
                    }
                }

                if (conditionMet) {
                    textToDisplay = line.text;
                    if (line.addItem && !gameState.inventory.includes(line.addItem)) {
                        gameState.inventory.push(line.addItem);
                        console.log(`Item added via dialogue: ${line.addItem}. Inventory:`, gameState.inventory);
                    }
                    lineFound = true;
                    break;
                } else {
                    fallbackText = line.text;
                    if (line.addItem && !gameState.inventory.includes(line.addItem)) {
                        gameState.inventory.push(line.addItem);
                        console.log(`Item added via default dialogue: ${line.addItem}. Inventory:`, gameState.inventory);
                    }
                }
            }
             if (!lineFound && fallbackText !== "") {
                  textToDisplay = fallbackText;
             } else if (!lineFound && scene.dialogue.length > 0) {
                  console.warn("No dialogue line matched conditions or found fallback for scene:", scene.id || currentScene);
                  textToDisplay = "...";
             }
        } else {
            textToDisplay = scene.dialogue || scene.narration || "";
        }

        if (textToDisplay) {
            typewriterEffect(textToDisplay, () => {
                if (!scene.choices || scene.choices.length === 0 || choicesContainer.children.length === 0) {
                    nextButton.disabled = false;
                    nextButton.classList.remove('hidden');
                } else {
                    nextButton.classList.add('hidden');
                    nextButton.disabled = true;
                }
            });
        } else {
            dialogueText.textContent = "";
             if (!scene.choices || scene.choices.length === 0) {
                 nextButton.disabled = false;
                 nextButton.classList.remove('hidden');
             } else {
                  nextButton.classList.add('hidden');
                  nextButton.disabled = true;
             }
        }

        choicesContainer.innerHTML = '';
        if (scene.choices && scene.choices.length > 0) {
            let choicesDisplayed = false;
            scene.choices.forEach(choice => {
                let showChoice = true;
                if (choice.condition) {
                    showChoice = false;
                    if (choice.condition.flag !== undefined) {
                        if (gameState.flags[choice.condition.flag] === choice.condition.value) {
                            showChoice = true;
                        }
                    } else if (choice.condition.inventoryHas !== undefined) {
                        if (gameState.inventory.includes(choice.condition.inventoryHas)) {
                            showChoice = true;
                        }
                    } else if (choice.condition.inventoryHasNot !== undefined) {
                        if (!gameState.inventory.includes(choice.condition.inventoryHasNot)) {
                            showChoice = true;
                        }
                    }
                }

                if (showChoice) {
                    const button = document.createElement('button');
                    button.classList.add('choice-button');
                    button.textContent = choice.text;
                    button.addEventListener('click', () => {
                        console.log("Choice button clicked for:", choice.text);
                        if (typewriterInterval) {
                            console.log("Typewriter was active, attempting to skip via choice click.");
                            if (skipTypewriterListener) {
                                skipTypewriterListener();
                            }
                        }
                        makeChoice(choice.nextScene, choice);
                    });
                    choicesContainer.appendChild(button);
                    choicesDisplayed = true;
                }
            });

            if (choicesDisplayed) {
                nextButton.classList.add('hidden');
                nextButton.disabled = true;
            } else {
                console.log("No choices displayed for scene:", scene.id || currentScene, "based on conditions.");
                nextButton.classList.remove('hidden');
                if (!typewriterInterval && !textToDisplay) {
                    nextButton.disabled = false;
                } else if (!typewriterInterval) {
                    nextButton.disabled = false;
                } else {
                    nextButton.disabled = true;
                }
            }
        } else {
            nextButton.classList.remove('hidden');
            if (!typewriterInterval && !textToDisplay) {
                nextButton.disabled = false;
            } else if (!typewriterInterval) {
                nextButton.disabled = false;
            } else {
                nextButton.disabled = true;
            }
        }
    }

    function typewriterEffect(text, onCompleteCallback) {
        typewriterText = text;
        typewriterCharIndex = 0;
        dialogueText.textContent = '';
        nextButton.disabled = true;

        if (typewriterInterval) {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }
        if (skipTypewriterListener) {
            dialogueBox.removeEventListener('click', skipTypewriterListener);
            skipTypewriterListener = null;
        }

        const currentSkipHandler = () => {
            console.log("[Typewriter] SKIPPED by click or explicit call. Text:", typewriterText);
            if (typewriterInterval) {
                clearInterval(typewriterInterval);
                typewriterInterval = null;
            }
            dialogueText.textContent = typewriterText;
            dialogueBox.removeEventListener('click', currentSkipHandler);
            skipTypewriterListener = null;
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        };
        skipTypewriterListener = currentSkipHandler;

        dialogueBox.addEventListener('click', currentSkipHandler);

        typewriterInterval = setInterval(() => {
            if (typewriterCharIndex < typewriterText.length) {
                dialogueText.textContent += typewriterText.charAt(typewriterCharIndex);
                typewriterCharIndex++;
            } else {
                console.log("[Typewriter] Finished typing. Enabling next button if no choices.");
                clearInterval(typewriterInterval);
                typewriterInterval = null;
                dialogueBox.removeEventListener('click', currentSkipHandler);
                skipTypewriterListener = null;
                if (onCompleteCallback) {
                    onCompleteCallback();
                }
            }
        }, 50);
    }

    function makeChoice(nextSceneId, choiceData) {
        console.log("Making choice, nextSceneId:", nextSceneId);

        if (choiceData) {
            if (choiceData.setFlags) {
                for (const flag in choiceData.setFlags) {
                    gameState.flags[flag] = choiceData.setFlags[flag];
                }
            }
            if (choiceData.addItem) {
                if (!gameState.inventory.includes(choiceData.addItem)) {
                    gameState.inventory.push(choiceData.addItem);
                    console.log(`Item added from choice: ${choiceData.addItem}. Inventory:`, gameState.inventory);
                }
            }
        }
        console.log("Current Game State after choice:", gameState);

        const targetSceneIndex = storyScript.findIndex(s => s.id === nextSceneId);

        if (targetSceneIndex !== -1) {
            currentScene = targetSceneIndex;
            displayScene(storyScript[currentScene]);
        } else {
            console.error("Error: Next scene ID not found:", nextSceneId);
            dialogueText.textContent = `Error: Target scene '${nextSceneId}' not found.`;
            speakerName.textContent = "";
            speakerName.classList.remove('active');
            nextButton.classList.add('hidden');
            nextButton.disabled = true;
            choicesContainer.innerHTML = '';
        }
    }

    function saveGame() {
        if (typeof(Storage) !== "undefined") {
            const saveData = {
                sceneIndex: currentScene,
                gameState: JSON.parse(JSON.stringify(gameState))
            };
            localStorage.setItem(saveSlotKey, JSON.stringify(saveData));
            alert("Game Saved!");
            if(loadGameButtonTitle) loadGameButtonTitle.disabled = false;
            if(menuLoadButton) menuLoadButton.disabled = false;
        } else {
            alert("Your browser does not support saving.");
        }
    }

    function loadGame() {
        if (typeof(Storage) !== "undefined") {
            const savedDataJSON = localStorage.getItem(saveSlotKey);
            if (savedDataJSON) {
                const saveData = JSON.parse(savedDataJSON);
                currentScene = saveData.sceneIndex;
                gameState = JSON.parse(JSON.stringify(saveData.gameState || { flags: {}, inventory: [] }));

                titleScreen.classList.add('hidden');
                gameEngine.classList.remove('hidden');
                toggleInGameMenu(false);
                displayScene(storyScript[currentScene]);
            } else {
                alert("No saved game found.");
            }
        } else {
            alert("Your browser does not support loading.");
        }
    }

    function toggleInventoryPanel(show) {
    if (!inventoryPanel) return;

    const isHidden = inventoryPanel.classList.contains('hidden');
    if (show === undefined) {
        inventoryPanel.classList.toggle('hidden');
    } else if (show) {
        inventoryPanel.classList.remove('hidden');
    } else {
        inventoryPanel.classList.add('hidden');
    }

    if (!inventoryPanel.classList.contains('hidden')) {
        updateInventoryDisplay();
        toggleInGameMenu(false); // Close main menu when inventory opens
    }
}

function updateInventoryDisplay() {
    if (!inventoryList) return;
    inventoryList.innerHTML = '';

    if (gameState.inventory.length === 0) {
        const li = document.createElement('li');
        li.textContent = "Your inventory is empty.";
        inventoryList.appendChild(li);
        return;
    }

    gameState.inventory.forEach(itemId => {
        const li = document.createElement('li');
        const itemImg = document.createElement('img');
        
        // Simple mapping of item IDs to display names and icons
        let itemName = itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let iconSrc = `${assetPaths.ui}icons/inventory/${itemId}.png`;
        const placeholderIcon = `${assetPaths.ui}icons/inventory/fragment_base.png`;

        itemImg.src = iconSrc;
        itemImg.alt = itemName;
        itemImg.onerror = () => { itemImg.src = placeholderIcon; };

        li.appendChild(itemImg);
        li.appendChild(document.createTextNode(" " + itemName));
        inventoryList.appendChild(li);
    });
}

function toggleInGameMenu(show) {
        if (!ingameMenuPanel) return;

        if (show === undefined) {
            ingameMenuPanel.classList.toggle('hidden');
        } else if (show) {
            ingameMenuPanel.classList.remove('hidden');
        } else {
            ingameMenuPanel.classList.add('hidden');
        }

        if (!ingameMenuPanel.classList.contains('hidden')) {
            nextButton.disabled = true;
        } else {
             const currentSceneData = storyScript[currentScene];
             if (currentSceneData) {
                  if (currentSceneData.choices && choicesContainer.children.length > 0) {
                       nextButton.classList.add('hidden');
                       nextButton.disabled = true;
                  } else if (typewriterInterval) {
                       nextButton.disabled = true;
                  } else {
                        nextButton.classList.remove('hidden');
                        nextButton.disabled = false;
                  }
             } else {
                  nextButton.classList.add('hidden');
                  nextButton.disabled = true;
             }
        }
    }

    function quitToTitle() {
        gameEngine.classList.add('hidden');
        toggleInGameMenu(false);
        titleScreen.classList.remove('hidden');
         if (typewriterInterval) {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
         }
         if (skipTypewriterListener) {
             dialogueBox.removeEventListener('click', skipTypewriterListener);
             skipTypewriterListener = null;
         }
    }

    function advanceScene() {
        const scene = storyScript[currentScene];

        if (typewriterInterval) {
            if (skipTypewriterListener) {
                skipTypewriterListener();
            }
            return;
        }

        if (scene && scene.next) {
             const nextSceneId = scene.next;
             const targetSceneIndex = storyScript.findIndex(s => s.id === nextSceneId);

             if (targetSceneIndex !== -1) {
                 currentScene = targetSceneIndex;
             } else {
                 console.error("Error: 'next' scene ID not found:", nextSceneId, ". Proceeding sequentially.");
                 currentScene++;
             }
         } else {
             currentScene++;
         }

        if (currentScene < storyScript.length) {
            displayScene(storyScript[currentScene]);
        } else {
            dialogueText.textContent = "The story has concluded.";
            speakerName.textContent = "";
            speakerName.classList.remove('active');
            nextButton.classList.add('hidden');
            nextButton.disabled = true;
            choicesContainer.innerHTML = '';
        }
    }

    initGame();
});