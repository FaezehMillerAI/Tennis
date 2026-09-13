/**
 * Smart LTA Session Generator (100% English)
 * Algorithmic generator producing complete 4-tier LTA coaching plans based on:
 * - Stage/Level (Blue, Red, Orange, Green, Yellow)
 * - Game Situation (Serve, Return, Both Back, Approach/Net, Defend/Net)
 * - Capacity Focus (Tactical, Technical, Physical, Psychological)
 * - Custom Topic / Goal
 */

class SmartLTAGenerator {
    generate(options) {
        const {
            level = 'RED',
            situation = 'BOTH_BACK',
            capacity = 'TACTICAL',
            surface = 'hard_blue',
            customTopic = '',
            duration = 60,
            playersCount = '2 Players'
        } = options;

        const levelInfo = LTA_FRAMEWORK.levels[level] || LTA_FRAMEWORK.levels.RED;
        const situationInfo = LTA_FRAMEWORK.situations[situation] || LTA_FRAMEWORK.situations.BOTH_BACK;
        const capacityInfo = LTA_FRAMEWORK.capacities[capacity] || LTA_FRAMEWORK.capacities.TACTICAL;

        const title = customTopic 
            ? `${customTopic} (${levelInfo.nameEn})`
            : this.generateTitle(level, situation, capacity);

        // Build Stage 1: Game Assessment
        const assessment = this.buildAssessment(level, situation, capacity, title);

        // Build Stage 2: Demo / Teaching Closed
        const closed = this.buildClosed(level, situation, capacity, title);

        // Build Stage 3: Progressing Open
        const open = this.buildOpen(level, situation, capacity, title);

        // Build Stage 4: Game
        const game = this.buildGame(level, situation, capacity, title);

        return {
            id: 'generated_' + Date.now(),
            title: title,
            level: level,
            situation: situation,
            capacity: capacity,
            surface: surface,
            duration: parseInt(duration, 10),
            playersCount: playersCount,
            equipment: this.generateEquipment(level),
            overview: `Accredited LTA session plan designed with the 4-tier Hourglass framework. Focus: ${capacityInfo.titleEn} capacity during ${situationInfo.titleEn} for ${levelInfo.nameEn}.`,
            stages: {
                GAME_ASSESSMENT: assessment,
                DEMO_CLOSED: closed,
                PROGRESSING_OPEN: open,
                GAME: game
            }
        };
    }

    generateTitle(level, situation, capacity) {
        const titles = {
            SERVE: {
                TACTICAL: 'Service Box Corner Targeting & First Strike Strategy',
                TECHNICAL: 'Toss Precision, Trophy Position & Wrist Pronation',
                PHYSICAL: 'Leg Drive Explosion & Dynamic Landing Balance',
                MENTAL: 'Second Serve Composure on Break Points'
            },
            RETURN: {
                TACTICAL: 'Neutralizing First Serves with Deep Central Placement',
                TECHNICAL: 'Compact Backswing & Firm Block on Fast Serves',
                PHYSICAL: 'Anticipatory Split-Step & Explosive First Step',
                MENTAL: 'Aggressive Mindset to Step Inside on Weak Second Serves'
            },
            BOTH_BACK: {
                TACTICAL: 'Moving Opponents Off-Court via Angle & Line Changes',
                TECHNICAL: 'Heavy Topspin Production with Low-to-High Brush',
                PHYSICAL: 'Aerobic Endurance & Footwork Reset in 10+ Shot Rallies',
                MENTAL: 'Rally Patience & Eliminating Unforced Haste'
            },
            APPROACH_NET: {
                TACTICAL: 'Short Ball Attack Recognition & Net Cut-Off Angles',
                TECHNICAL: 'Compact Punch Volley Mechanics with Solid Wrist',
                PHYSICAL: 'Forward Transition Speed & Decelerative Split-Step',
                MENTAL: 'Confidence Closing the Net & Commitment Under Fire'
            },
            DEFEND_NET: {
                TACTICAL: 'Down-the-Line Passing Shot vs. High Defensive Topspin Lob',
                TECHNICAL: 'Dipping Crosscourt Groundstrokes at Opponent’s Feet',
                PHYSICAL: 'Lateral Open-Stance Sliding & Emergency Balance',
                MENTAL: 'Composure & Laser Focus Under Heavy Net Pressure'
            }
        };

        return titles[situation]?.[capacity] || `Mastering ${situation} in ${level}`;
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

    buildAssessment(level, situation, capacity, title) {
        return {
            goal: `Diagnose current subconscious habits and timing breakdown in ${situation} before coaching intervention.`,
            drillDescription: `Begin with live competitive points focusing on ${situation}. Coach positions at the umpire/side area to observe player decisions and biomechanics under game pressure.`,
            coachObservations: 'Is the player recognizing incoming ball cues early? Is shot selection proactive or reactive? How is the balance upon contact?',
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

    buildClosed(level, situation, capacity, title) {
        return {
            goal: `Isolate and groove the fundamental movement pattern and solid contact point with predictable feeds.`,
            drillDescription: `Coach feeds from a basket with steady rhythm. Players focus strictly on 3 action cues to drive balls into designated target zones with an 80%+ success rate.`,
            coachingCues: [
                'Early Unit Turn: Rotate shoulders and hips the instant the ball leaves the coach’s racket.',
                'Contact Out Front: Meet the ball ahead of the front hip with a firm wrist and eyes on the contact point.',
                'Follow-Through & Reset: Accelerate through the finish and execute an immediate balance recovery.'
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

    buildOpen(level, situation, capacity, title) {
        return {
            goal: `Transfer the technical skill into dynamic rallies by introducing decision-making variables and court movement.`,
            drillDescription: `Live 2-player rally with conditional rules: Players must recognize when an opportunity arises (e.g. short ball or weak bounce) and execute the targeted tactical pattern.`,
            coachingCues: [
                'Read visual cues from opponent’s preparation angle.',
                'Adjust footwork cadence to match incoming ball speed.'
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

    buildGame(level, situation, capacity, title) {
        return {
            goal: `Evaluate skill transfer in competitive match play with thematic bonus point rules, followed by player debrief.`,
            drillDescription: `Match play games with rotating serve. Any player who wins a point by executing the session’s primary skill into the target zone receives 2 bonus points.`,
            debriefQuestions: [
                'How did you maintain your composure and technique during crucial pressure points?',
                'Which visual cue helped you choose the correct shot under pressure?',
                'What is your personal focus area for our next practice session?'
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
