/**
 * Smart LTA Session Generator (100% English)
 * Algorithmic generator producing complete 4-tier LTA coaching plans based on:
 * - Stage/Level (Blue, Red, Orange, Green, Yellow)
 * - Official LTA Tactical Matrix:
 *   - WHERE: Game Situation (Serve, Return, Both Back, At Net, Opponent at Net)
 *   - WHAT: Phase of Play (Rally, Attack, Defend)
 *   - TACTIC: Consistency, Control Space, Control Time, Strengths, Weaknesses
 *   - BALL CHARACTERISTICS: Height, Depth, Direction, Speed, Spin
 * - 4 Capacities (Tactical, Technical, Physical, Psychological)
 * - Custom Topic / Goal
 */

class SmartLTAGenerator {
    generate(options) {
        const {
            level = 'RED',
            situation = 'BOTH_BACK',
            phaseOfPlay = 'RALLY',
            tactic = 'CONTROL_SPACE',
            ballCharacteristics = ['DEPTH', 'DIRECTION'],
            shotDirection = 'CROSSCOURT',
            capacity = 'TACTICAL',
            surface = 'hard_blue',
            customTopic = '',
            duration = 60,
            playersCount = '2 Players'
        } = options;

        const levelInfo = LTA_FRAMEWORK.levels[level] || LTA_FRAMEWORK.levels.RED;
        const situationInfo = LTA_FRAMEWORK.situations[situation] || LTA_FRAMEWORK.situations.BOTH_BACK;
        const phaseInfo = LTA_FRAMEWORK.phasesOfPlay[phaseOfPlay] || LTA_FRAMEWORK.phasesOfPlay.RALLY;
        const tacticInfo = LTA_FRAMEWORK.tactics[tactic] || LTA_FRAMEWORK.tactics.CONTROL_SPACE;
        const capacityInfo = LTA_FRAMEWORK.capacities[capacity] || LTA_FRAMEWORK.capacities.TACTICAL;

        const title = customTopic 
            ? `${customTopic} (${levelInfo.nameEn})`
            : this.generateTitle(level, situation, phaseOfPlay, tactic);

        // Build Stage 1: Game Assessment
        const assessment = this.buildAssessment(level, situation, phaseOfPlay, tactic, title, shotDirection);

        // Build Stage 2: Demo / Teaching Closed
        const closed = this.buildClosed(level, situation, phaseOfPlay, tactic, ballCharacteristics, title, shotDirection);

        // Build Stage 3: Progressing Open
        const open = this.buildOpen(level, situation, phaseOfPlay, tactic, ballCharacteristics, title, shotDirection);

        // Build Stage 4: Game
        const game = this.buildGame(level, situation, phaseOfPlay, tactic, title, shotDirection);

        return {
            id: 'generated_' + Date.now(),
            title: title,
            level: level,
            situation: situation,
            phaseOfPlay: phaseOfPlay,
            tactic: tactic,
            shotDirection: shotDirection,
            ballCharacteristics: Array.isArray(ballCharacteristics) && ballCharacteristics.length > 0 ? ballCharacteristics : ['DEPTH', 'DIRECTION'],
            capacity: capacity,
            surface: surface,
            duration: parseInt(duration, 10),
            playersCount: playersCount,
            equipment: this.generateEquipment(level),
            overview: `Official LTA Tactical Framework session. Phase: ${phaseInfo.titleEn} during ${situationInfo.titleEn}. Tactic: ${tacticInfo.titleEn}. Direction: ${shotDirection}. Ball Variables: ${ballCharacteristics.join(', ')}.`,
            stages: {
                GAME_ASSESSMENT: assessment,
                DEMO_CLOSED: closed,
                PROGRESSING_OPEN: open,
                GAME: game
            }
        };
    }

    generateTitle(level, situation, phaseOfPlay, tactic) {
        const titles = {
            RALLY: {
                CONSISTENCY: 'Baseline Rally Depth & Net Clearance Margin',
                CONTROL_SPACE: 'Crosscourt Angles to Displace the Opponent',
                CONTROL_TIME: 'Taking the Ball on the Rise in Heavy Rallies',
                STRENGTHS: 'Dictating Baseline Exchanges with Forehand Dominance',
                WEAKNESSES: 'Pinning the Opponent Deep on Their Weaker Wing'
            },
            ATTACK: {
                CONSISTENCY: 'High-Percentage Approach Drives & Solid Net Volleys',
                CONTROL_SPACE: 'Short Ball Attack to Open Court & Cross-Volley Finish',
                CONTROL_TIME: 'Forward Transition to Rob Opponent Recovery Time',
                STRENGTHS: 'Aggressive Serve+1 Weapon Execution',
                WEAKNESSES: 'Attacking the Opponent’s Second Serve into Weakness'
            },
            DEFEND: {
                CONSISTENCY: 'Neutralizing Heavy Pace with Deep Central Height',
                CONTROL_SPACE: 'Lateral Court Coverage & Sliding Defensive Recovery',
                CONTROL_TIME: 'High Heavy Topspin Looping to Buy Court Reset Time',
                STRENGTHS: 'Counter-Punching Passing Shots from Defensive Corners',
                WEAKNESSES: 'Floating Dipping Balls at the Opponent’s Feet'
            }
        };

        return titles[phaseOfPlay]?.[tactic] || `${phaseOfPlay} Strategy in ${situation}`;
    }

    generateEquipment(level) {
        switch (level) {
            case 'BLUE':
                return 'Red Sponge/Foam Balls, 17-19" Rackets, Agility Ladder, Throw-down Marker Discs';
            case 'RED':
                return 'LTA Red Felt Balls (Stage 3), 19-21" Rackets, 4 Cones, Target Discs, Agility Ladder';
            case 'ORANGE':
                return 'LTA Orange Balls (Stage 2), 23-25" Rackets, Boundary Cones, +5 and +10 Target Rings';
            case 'GREEN':
                return 'LTA Green Balls (Stage 1), 25-26" Rackets, Baseline Depth Strips, Low Hurdles';
            default:
                return 'Standard Yellow Balls, 27" Rackets, Ball Hopper, Baseline Depth Cones, Target Markers';
        }
    }

    buildAssessment(level, situation, phaseOfPlay, tactic, title, shotDirection = 'CROSSCOURT') {
        const layout = window.LTA_FRAMEWORK?.buildTacticalLayout
            ? window.LTA_FRAMEWORK.buildTacticalLayout(situation, phaseOfPlay, tactic, ['DEPTH', 'DIRECTION'], 'GAME_ASSESSMENT', level, shotDirection)
            : { elements: [], drawings: [] };

        return {
            goal: `Diagnose current subconscious habits in the ${phaseOfPlay} phase (${situation}) focusing on ${shotDirection.replace(/_/g, ' ')} trajectory before coaching intervention.`,
            drillDescription: `Begin with live competitive points focusing on ${situation} (${shotDirection.replace(/_/g, ' ')}). Coach positions at the umpire/side area to observe player decisions, shot selection, and spatial control during the ${phaseOfPlay} phase.`,
            coachObservations: `Observe: Does the player recognize when to ${phaseOfPlay.toLowerCase()}? Is shot selection proactive or panicked? Check balance and footwork reset.`,
            timeMinutes: 10,
            elements: layout.elements,
            drawings: layout.drawings
        };
    }

    buildClosed(level, situation, phaseOfPlay, tactic, ballCharacteristics, title, shotDirection = 'CROSSCOURT') {
        const ballFocus = (ballCharacteristics || []).join(' & ');
        const layout = window.LTA_FRAMEWORK?.buildTacticalLayout
            ? window.LTA_FRAMEWORK.buildTacticalLayout(situation, phaseOfPlay, tactic, ballCharacteristics, 'DEMO_CLOSED', level, shotDirection)
            : { elements: [], drawings: [] };

        return {
            goal: `Isolate the biomechanical cues and ball control variables (${ballFocus} - ${shotDirection.replace(/_/g, ' ')}) with predictable closed feeds.`,
            drillDescription: `Coach feeds from a basket with steady rhythm focusing on ${shotDirection.replace(/_/g, ' ')} patterns. Players focus on 3 action cues to manipulate ${ballFocus} into designated target zones with an 80%+ success rate.`,
            coachingCues: [
                `Early Preparation: Unit turn coordinated with incoming ball flight.`,
                `Solid Contact Out Front: Clean contact ahead of the front hip to regulate ${ballFocus.toLowerCase()}.`,
                `Targeted Follow-Through: Complete stroke trajectory toward the ${shotDirection.replace(/_/g, ' ').toLowerCase()} target zone.`
            ],
            timeMinutes: 20,
            elements: layout.elements,
            drawings: layout.drawings
        };
    }

    buildOpen(level, situation, phaseOfPlay, tactic, ballCharacteristics, title, shotDirection = 'CROSSCOURT') {
        const layout = window.LTA_FRAMEWORK?.buildTacticalLayout
            ? window.LTA_FRAMEWORK.buildTacticalLayout(situation, phaseOfPlay, tactic, ballCharacteristics, 'PROGRESSING_OPEN', level, shotDirection)
            : { elements: [], drawings: [] };

        return {
            goal: `Transfer the ${phaseOfPlay} skill (${shotDirection.replace(/_/g, ' ')}) into dynamic rallies by introducing decision-making variables and court movement.`,
            drillDescription: `Live 2-player rally with conditional rules: Players must recognize when an opportunity arises to execute "${tactic}" and direct the ball ${shotDirection.replace(/_/g, ' ').toLowerCase()}.`,
            coachingCues: [
                'Read visual cues from opponent’s preparation angle.',
                'Anticipate bounce depth and adjust footwork cadence.'
            ],
            timeMinutes: 18,
            elements: layout.elements,
            drawings: layout.drawings
        };
    }

    buildGame(level, situation, phaseOfPlay, tactic, title, shotDirection = 'CROSSCOURT') {
        const layout = window.LTA_FRAMEWORK?.buildTacticalLayout
            ? window.LTA_FRAMEWORK.buildTacticalLayout(situation, phaseOfPlay, tactic, ['DEPTH', 'DIRECTION'], 'GAME', level, shotDirection)
            : { elements: [], drawings: [] };

        return {
            goal: `Evaluate skill transfer in competitive match play with thematic bonus point rules (${shotDirection.replace(/_/g, ' ')}), followed by player debrief.`,
            drillDescription: `Match play games with rotating serve. Any player who wins a point by successfully executing the ${phaseOfPlay} objective with accurate ${shotDirection.replace(/_/g, ' ').toLowerCase()} placement receives 2 bonus points.`,
            debriefQuestions: [
                `How did executing "${tactic}" give you the advantage in crucial points?`,
                `Which ball characteristic (Height, Depth, Direction, Speed, Spin) felt most natural to control?`,
                `What is your personal focus area for our next practice session?`
            ],
            timeMinutes: 12,
            elements: layout.elements,
            drawings: layout.drawings
        };
    }
}

window.smartLTAGenerator = new SmartLTAGenerator();
