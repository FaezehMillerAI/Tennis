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
        const assessment = this.buildAssessment(level, situation, phaseOfPlay, tactic, title);

        // Build Stage 2: Demo / Teaching Closed
        const closed = this.buildClosed(level, situation, phaseOfPlay, tactic, ballCharacteristics, title);

        // Build Stage 3: Progressing Open
        const open = this.buildOpen(level, situation, phaseOfPlay, tactic, ballCharacteristics, title);

        // Build Stage 4: Game
        const game = this.buildGame(level, situation, phaseOfPlay, tactic, title);

        return {
            id: 'generated_' + Date.now(),
            title: title,
            level: level,
            situation: situation,
            phaseOfPlay: phaseOfPlay,
            tactic: tactic,
            ballCharacteristics: Array.isArray(ballCharacteristics) && ballCharacteristics.length > 0 ? ballCharacteristics : ['DEPTH', 'DIRECTION'],
            capacity: capacity,
            surface: surface,
            duration: parseInt(duration, 10),
            playersCount: playersCount,
            equipment: this.generateEquipment(level),
            overview: `Official LTA Tactical Framework session. Phase: ${phaseInfo.titleEn} during ${situationInfo.titleEn}. Tactic: ${tacticInfo.titleEn}. Ball Variables: ${ballCharacteristics.join(', ')}.`,
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

    buildAssessment(level, situation, phaseOfPlay, tactic, title) {
        return {
            goal: `Diagnose current subconscious habits in the ${phaseOfPlay} phase (${situation}) before coaching intervention.`,
            drillDescription: `Begin with live competitive points focusing on ${situation}. Coach positions at the umpire/side area to observe player decisions, shot selection, and spatial control during the ${phaseOfPlay} phase.`,
            coachObservations: `Observe: Does the player recognize when to ${phaseOfPlay.toLowerCase()}? Is shot selection proactive or panicked? Check balance and footwork reset.`,
            timeMinutes: 10,
            elements: [
                { type: 'player', id: 'p1', x: 0.45, y: 0.86, label: 'Player A' },
                { type: 'player', id: 'p2', x: 0.55, y: 0.14, label: 'Player B' },
                { type: 'coach', id: 'coach', x: 0.15, y: 0.50, label: 'Coach' }
            ],
            drawings: [
                { type: 'ball_path', from: { x: 0.45, y: 0.86 }, to: { x: 0.55, y: 0.14 }, style: 'solid', color: '#CCFF00', label: 'Live Play' }
            ]
        };
    }

    buildClosed(level, situation, phaseOfPlay, tactic, ballCharacteristics, title) {
        const ballFocus = ballCharacteristics.join(' & ');
        return {
            goal: `Isolate the biomechanical cues and ball control variables (${ballFocus}) with predictable closed feeds.`,
            drillDescription: `Coach feeds from a basket with steady rhythm. Players focus on 3 action cues to manipulate ${ballFocus} into designated target zones with an 80%+ success rate.`,
            coachingCues: [
                `Early Preparation: Unit turn coordinated with incoming ball flight.`,
                `Solid Contact Out Front: Clean contact ahead of the front hip to regulate ${ballFocus.toLowerCase()}.`,
                `Targeted Follow-Through: Complete stroke trajectory toward the intended target zone.`
            ],
            timeMinutes: 20,
            elements: [
                { type: 'coach', id: 'coach', x: 0.35, y: 0.42, label: 'Coach' },
                { type: 'hopper', id: 'hop', x: 0.30, y: 0.41 },
                { type: 'player', id: 'p1', x: 0.45, y: 0.82, label: 'Player' },
                { type: 'target', id: 't1', x: 0.70, y: 0.18, points: 5, color: '#10b981' },
                { type: 'cone', id: 'c1', x: 0.50, y: 0.82, color: '#f59e0b' }
            ],
            drawings: [
                { type: 'feed_path', from: { x: 0.35, y: 0.42 }, to: { x: 0.45, y: 0.80 }, style: 'dotted', color: '#facc15', label: 'Coach Feed' },
                { type: 'ball_path', from: { x: 0.45, y: 0.80 }, to: { x: 0.70, y: 0.18 }, style: 'solid', color: '#CCFF00', label: 'Target Drive' },
                { type: 'move_path', from: { x: 0.45, y: 0.82 }, to: { x: 0.50, y: 0.82 }, style: 'dashed', color: '#38bdf8', label: 'Recovery' }
            ]
        };
    }

    buildOpen(level, situation, phaseOfPlay, tactic, ballCharacteristics, title) {
        return {
            goal: `Transfer the ${phaseOfPlay} skill into dynamic rallies by introducing decision-making variables and court movement.`,
            drillDescription: `Live 2-player rally with conditional rules: Players must recognize when an opportunity arises to execute "${tactic}" and manipulate ball flight accordingly.`,
            coachingCues: [
                'Read visual cues from opponent’s preparation angle.',
                'Anticipate bounce depth and adjust footwork cadence.'
            ],
            timeMinutes: 18,
            elements: [
                { type: 'player', id: 'p1', x: 0.40, y: 0.84, label: 'Player 1' },
                { type: 'player', id: 'p2', x: 0.60, y: 0.16, label: 'Player 2' },
                { type: 'target', id: 't1', x: 0.75, y: 0.20, points: 3 },
                { type: 'target', id: 't2', x: 0.25, y: 0.80, points: 3 }
            ],
            drawings: [
                { type: 'ball_path', from: { x: 0.40, y: 0.84 }, to: { x: 0.60, y: 0.16 }, style: 'solid', color: '#CCFF00', label: 'Dynamic Rally' },
                { type: 'ball_path', from: { x: 0.60, y: 0.16 }, to: { x: 0.75, y: 0.80 }, style: 'solid', color: '#f97316' },
                { type: 'move_path', from: { x: 0.40, y: 0.84 }, to: { x: 0.70, y: 0.82 }, style: 'dashed', color: '#38bdf8' }
            ]
        };
    }

    buildGame(level, situation, phaseOfPlay, tactic, title) {
        return {
            goal: `Evaluate skill transfer in competitive match play with thematic bonus point rules, followed by player debrief.`,
            drillDescription: `Match play games with rotating serve. Any player who wins a point by successfully executing the ${phaseOfPlay} objective receives 2 bonus points.`,
            debriefQuestions: [
                `How did executing "${tactic}" give you the advantage in crucial points?`,
                `Which ball characteristic (Height, Depth, Direction, Speed, Spin) felt most natural to control?`,
                `What is your personal focus area for our next practice session?`
            ],
            timeMinutes: 12,
            elements: [
                { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'Player 1' },
                { type: 'player', id: 'p2', x: 0.55, y: 0.12, label: 'Player 2' },
                { type: 'coach', id: 'coach', x: 0.88, y: 0.50, label: 'Coach' }
            ],
            drawings: [
                { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.25, y: 0.18 }, style: 'solid', color: '#CCFF00', label: 'Match Winning Shot' }
            ]
        };
    }
}

window.smartLTAGenerator = new SmartLTAGenerator();
