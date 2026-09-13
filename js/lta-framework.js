/**
 * LTA Framework & Standards Data Model (100% English)
 * Incorporating official British LTA Lesson Hourglass Model,
 * LTA Youth Stages, LTA Tactical Matrix (Where, What, Tactic, Ball Characteristics).
 */

const LTA_FRAMEWORK = {
    // 4-Tier Lesson Structure (Hourglass / Funnel Model)
    stages: {
        GAME_ASSESSMENT: {
            id: 'GAME_ASSESSMENT',
            titleEn: 'Game Assessment',
            titleShort: 'Game Assessment',
            color: '#1E3A8A', // Dark Navy Blue
            icon: 'eye',
            stepNumber: 1,
            description: 'Start with a live game context to diagnose player tendencies, biomechanical breakdowns, and tactical needs.',
            coachFocus: 'Observe without early intervention. Diagnose whether errors are tactical (decision/space) or technical (contact/timing).',
            keyQuestions: [
                'Does the player recognize incoming ball depth early?',
                'Where is the contact point relative to the front hip?',
                'Is the recovery movement active or delayed after ball strike?'
            ]
        },
        DEMO_CLOSED: {
            id: 'DEMO_CLOSED',
            titleEn: 'Demo / Teaching (Closed)',
            titleShort: 'Demo Teaching Closed',
            color: '#3B82F6', // Lighter Blue
            icon: 'graduation-cap',
            stepNumber: 2,
            description: 'Clear demonstration and isolated technical practice with repetitive, controlled feeds to build muscle memory.',
            coachFocus: 'Deliver concise verbal and visual coaching cues (What, When, How, Why). Focus on grip, unit turn, contact point, and balance.',
            keyQuestions: [
                'Are coaching cues memorable and action-oriented?',
                'Is repetition achieving an 80%+ success rate in closed feeds?'
            ]
        },
        PROGRESSING_OPEN: {
            id: 'PROGRESSING_OPEN',
            titleEn: 'Progressing (Open)',
            titleShort: 'Progressing Open',
            color: '#2563EB', // Royal Vibrant Blue
            icon: 'trending-up',
            stepNumber: 3,
            description: 'Introduce variability, decision-making, and court movement through dynamic rallies with constraints and tactical triggers.',
            coachFocus: 'Guide players on "When" and "Where" to direct the ball based on opponent positioning and incoming ball trajectory.',
            keyQuestions: [
                'How does the player respond when receiving a short or deep ball?',
                'Does technique hold up under movement and time pressure?'
            ]
        },
        GAME: {
            id: 'GAME',
            titleEn: 'Game (Match Application)',
            titleShort: 'Game',
            color: '#1E3A8A', // Base Navy Blue
            icon: 'trophy',
            stepNumber: 4,
            description: 'Return to competitive play with thematic bonus scoring to evaluate skill transfer under match pressure, followed by debrief.',
            coachFocus: 'Evaluate retention during pressure points. Lead player debrief with open questions and set self-practice goals.',
            keyQuestions: [
                'Did the player execute the tactical pattern in crucial points?',
                'What is the key takeaway for their next match or session?'
            ]
        }
    },

    // OFFICIAL LTA TACTICAL MATRIX: WHERE (5 Game Situations)
    situations: {
        SERVE: {
            id: 'SERVE',
            titleEn: 'Serve',
            category: 'WHERE',
            icon: 'zap',
            tacticalGoal: 'Seize offensive advantage, target corners of the service box (T and Wide), and vary spin.'
        },
        RETURN: {
            id: 'RETURN',
            titleEn: 'Return',
            category: 'WHERE',
            icon: 'shield',
            tacticalGoal: 'Neutralize server advantage with deep central placement, or attack second serves.'
        },
        BOTH_BACK: {
            id: 'BOTH_BACK',
            titleEn: 'Both Back',
            category: 'WHERE',
            icon: 'repeat',
            tacticalGoal: 'Control groundstroke depth, height, speed, spin, and direction to dictate the baseline rally.'
        },
        AT_NET: {
            id: 'AT_NET',
            titleEn: 'At Net',
            category: 'WHERE',
            icon: 'arrow-up-right',
            tacticalGoal: 'Exploit short balls, drive aggressive approaches, close the net, and execute punch volleys.'
        },
        OPPONENT_AT_NET: {
            id: 'OPPONENT_AT_NET',
            titleEn: 'Opponent at Net',
            category: 'WHERE',
            icon: 'crosshair',
            tacticalGoal: 'Execute dipping passing shots at the opponent\'s feet, sharp angles, and defensive lobs.'
        }
    },

    // OFFICIAL LTA TACTICAL MATRIX: WHAT (3 Phases of Play)
    phasesOfPlay: {
        RALLY: {
            id: 'RALLY',
            titleEn: 'RALLY',
            color: '#10B981', // Emerald Green as in LTA chart
            bgColor: 'rgba(16, 185, 129, 0.25)',
            borderColor: '#10B981',
            description: 'Neutral groundstroke exchange, maintaining depth, rally tolerance, and constructing the point.'
        },
        ATTACK: {
            id: 'ATTACK',
            titleEn: 'ATTACK',
            color: '#F87171', // Coral Red as in LTA chart
            bgColor: 'rgba(239, 68, 68, 0.25)',
            borderColor: '#EF4444',
            description: 'Stepping inside the baseline, taking time away from the opponent, driving approach shots, and finishing at net.'
        },
        DEFEND: {
            id: 'DEFEND',
            titleEn: 'DEFEND',
            color: '#94A3B8', // Steel Grey as in LTA chart
            bgColor: 'rgba(148, 163, 184, 0.25)',
            borderColor: '#94A3B8',
            description: 'Absorbing heavy pace, buying time with height and depth, scrambling, and resetting to neutral.'
        }
    },

    // OFFICIAL LTA TACTICAL MATRIX: TACTIC (5 Intentions)
    tactics: {
        CONSISTENCY: {
            id: 'CONSISTENCY',
            titleEn: 'Consistency',
            description: 'High margin over the net, repeatable shapes, minimizing unforced errors.'
        },
        CONTROL_SPACE: {
            id: 'CONTROL_SPACE',
            titleEn: 'Control Space',
            description: 'Directing the ball into open court, moving the opponent off-court with angles and depth.'
        },
        CONTROL_TIME: {
            id: 'CONTROL_TIME',
            titleEn: 'Control Time',
            description: 'Taking the ball early on the rise to rob opponent reaction time, or floating deep to buy recovery time.'
        },
        STRENGTHS: {
            id: 'STRENGTHS',
            titleEn: 'Play to your Strengths',
            description: 'Imposing personal weapon shots (dominant forehand, big serve, or agile net game).'
        },
        WEAKNESSES: {
            id: 'WEAKNESSES',
            titleEn: "Play to your Opponent's Weaknesses",
            description: 'Targeting opponent limitations (high backhand balls, second serve, lateral movement).'
        }
    },

    // OFFICIAL LTA TACTICAL MATRIX: BALL CHARACTERISTICS (5 Reception & Projection Variables)
    ballCharacteristics: {
        HEIGHT: {
            id: 'HEIGHT',
            titleEn: 'Height',
            icon: '🎾',
            description: 'Net clearance margin (high topspin clearance vs. dipping low skim).'
        },
        DEPTH: {
            id: 'DEPTH',
            titleEn: 'Depth',
            icon: '🎾',
            description: 'Landing distance between service line and baseline.'
        },
        DIRECTION: {
            id: 'DIRECTION',
            titleEn: 'Direction',
            icon: '🎾',
            description: 'Crosscourt, down-the-line, down-the-middle, or inside-out.'
        },
        SPEED: {
            id: 'SPEED',
            titleEn: 'Speed',
            icon: '🎾',
            description: 'Pace modulation (heavy drive vs. change-of-pace drop shot).'
        },
        SPIN: {
            id: 'SPIN',
            titleEn: 'Spin',
            icon: '🎾',
            description: 'Topspin, backspin / slice, flat drive, or kick.'
        }
    },

    // LTA Youth & Adult Player Stages
    levels: {
        BLUE: {
            id: 'BLUE',
            nameEn: 'LTA Youth Blue (Ages 4-6)',
            ballType: 'Red Foam / Sponge Ball',
            racketSize: '17" to 19"',
            courtSize: 'Mini Court (1/4 size with low net)',
            badgeColor: '#0ea5e9',
            description: 'Movement fundamentals, eye-hand coordination, agility, balance, tracking rolling balls, and playful racket games.'
        },
        RED: {
            id: 'RED',
            nameEn: 'LTA Youth Red (Ages 6-8)',
            ballType: 'Red Felt Ball (75% slower than standard)',
            racketSize: '19" to 21"',
            courtSize: '36ft Mini Court (11m x 5.5m)',
            badgeColor: '#ef4444',
            description: 'Over-the-net rallies, fundamental groundstroke shapes, overhand serving basics, lateral movement, and recovery.'
        },
        ORANGE: {
            id: 'ORANGE',
            nameEn: 'LTA Youth Orange (Ages 8-9)',
            ballType: 'Orange Ball (50% slower)',
            racketSize: '23" to 25"',
            courtSize: '60ft Court (18m x 6.5m)',
            badgeColor: '#f97316',
            description: 'Developing full rotational swings, approaching the net, split-step footwork, depth control, and court geometry.'
        },
        GREEN: {
            id: 'GREEN',
            nameEn: 'LTA Youth Green (Ages 9-10)',
            ballType: 'Green Ball (25% slower)',
            racketSize: '25" to 26"',
            courtSize: 'Full Regulation Court (78ft)',
            badgeColor: '#10b981',
            description: 'Transition to full court dimensions, heavy topspin production, spin serves, tactical patterns, and endurance.'
        },
        YELLOW_BEG: {
            id: 'YELLOW_BEG',
            nameEn: 'Yellow Ball - Adult Beginner',
            ballType: 'Standard Yellow Ball',
            racketSize: '27" Standard',
            courtSize: 'Full Regulation Court',
            badgeColor: '#eab308',
            description: 'Solidifying baseline groundstrokes, consistent directional serving, reliable returns, and basic court positioning.'
        },
        YELLOW_INT: {
            id: 'YELLOW_INT',
            nameEn: 'Yellow Ball - Intermediate',
            ballType: 'Standard Yellow Ball',
            racketSize: '27" Standard',
            courtSize: 'Full Regulation Court',
            badgeColor: '#8b5cf6',
            description: 'Pace control, heavy crosscourt and down-the-line targeting, slice variations, approach shots, and solid transition volleys.'
        },
        YELLOW_ADV: {
            id: 'YELLOW_ADV',
            nameEn: 'Yellow Ball - Advanced / Performance',
            ballType: 'Tournament Grade Yellow Ball',
            racketSize: '27" Performance',
            courtSize: 'Full Regulation Court',
            badgeColor: '#ec4899',
            description: 'High-performance match strategy, Serve+1 and Return+1 patterns, weapon development, and psychological resilience.'
        }
    },

    // LTA 4 Performance Capacities
    capacities: {
        TACTICAL: {
            id: 'TACTICAL',
            titleEn: 'Tactical',
            badgeColor: '#3b82f6',
            description: 'Shot selection, space and time awareness, opponent pattern recognition, and risk management.'
        },
        TECHNICAL: {
            id: 'TECHNICAL',
            titleEn: 'Technical',
            badgeColor: '#10b981',
            description: 'Grip mechanics, racket trajectory, solid contact point, follow-through, and fluid stroke mechanics.'
        },
        PHYSICAL: {
            id: 'PHYSICAL',
            titleEn: 'Physical',
            badgeColor: '#f59e0b',
            description: 'Agility, Balance, Coordination (ABCs), reactive speed, split-step timing, dynamic recovery, and stamina.'
        },
        MENTAL: {
            id: 'MENTAL',
            titleEn: 'Mental / Psychological',
            badgeColor: '#8b5cf6',
            description: 'Focus under pressure, competitive resilience, emotional composure, and proactive problem solving.'
        }
    },

    // 3D Court Surfaces
    surfaces: {
        grass: {
            id: 'grass',
            nameEn: 'Wimbledon Grass',
            courtColor: '#1d5a35',
            surroundColor: '#133e24',
            lineColor: '#FFFFFF',
            speed: 'Fast | Low skid bounce',
            accentColor: '#10b981',
            specular: '#2d7a4b',
            roughness: 0.8
        },
        clay: {
            id: 'clay',
            nameEn: 'Roland Garros Clay',
            courtColor: '#c55831',
            surroundColor: '#96391a',
            lineColor: '#FFFFFF',
            speed: 'Slow | High heavy bounce with slide',
            accentColor: '#f97316',
            specular: '#d96e48',
            roughness: 0.9
        },
        hard_blue: {
            id: 'hard_blue',
            nameEn: 'US Open Hard Court (DecoTurf)',
            courtColor: '#195B9C',
            surroundColor: '#25633e',
            lineColor: '#FFFFFF',
            speed: 'Medium-Fast | True uniform bounce',
            accentColor: '#38bdf8',
            specular: '#3a7dbf',
            roughness: 0.5
        },
        hard_aus: {
            id: 'hard_aus',
            nameEn: 'Australian Open Blue',
            courtColor: '#0085C7',
            surroundColor: '#005580',
            lineColor: '#FFFFFF',
            speed: 'Medium | Bright Pacific blue finish',
            accentColor: '#0284c7',
            specular: '#22a2e6',
            roughness: 0.5
        },
        carpet: {
            id: 'carpet',
            nameEn: 'Indoor Carpet / Graphite',
            courtColor: '#1e293b',
            surroundColor: '#0f172a',
            lineColor: '#e2e8f0',
            speed: 'Very Fast | Low flat trajectory',
            accentColor: '#94a3b8',
            specular: '#334155',
            roughness: 0.6
        }
    },

    /**
     * Synthesize 3D Court Elements & Trajectories for ANY Tactical Matrix Selection
     * Instantly updates the 3D court when coaches change options on the right panel.
     */
    buildTacticalLayout: function(situation = 'BOTH_BACK', phase = 'RALLY', tactic = 'CONTROL_SPACE', ballChars = ['DEPTH', 'DIRECTION'], stageKey = 'GAME_ASSESSMENT', level = 'RED') {
        const isClosed = (stageKey === 'DEMO_CLOSED');
        const hasHeight = ballChars.includes('HEIGHT');
        const hasDepth = ballChars.includes('DEPTH');
        const hasDirection = ballChars.includes('DIRECTION');
        const hasSpeed = ballChars.includes('SPEED');
        const hasSpin = ballChars.includes('SPIN');
        const arcStyle = hasHeight || phase === 'DEFEND' ? 'loop' : 'solid';

        let elements = [];
        let drawings = [];

        if (isClosed) {
            // Tier 2: Demo Teaching Closed (Coach feeding with Ball Hopper)
            elements.push(
                { type: 'coach', id: 'coach', x: 0.38, y: 0.46, label: 'LTA Coach' },
                { type: 'hopper', id: 'hop', x: 0.33, y: 0.45 }
            );

            if (situation === 'SERVE') {
                elements.push(
                    { type: 'player', id: 'p1', x: 0.58, y: 0.88, label: 'Server (P1)', color: '#2563EB' },
                    { type: 'cone', id: 'c_lead', x: 0.58, y: 0.82, color: '#f59e0b' },
                    { type: 'target', id: 't1', x: 0.38, y: 0.32, points: 10, color: '#10b981' },
                    { type: 'cone', id: 'c_t', x: 0.48, y: 0.32, color: '#ef4444' }
                );
                drawings.push(
                    { type: 'ball_path', from: { x: 0.58, y: 0.88 }, to: { x: 0.38, y: 0.32 }, style: arcStyle, color: '#CCFF00', label: 'Serve Trajectory' },
                    { type: 'move_path', from: { x: 0.58, y: 0.88 }, to: { x: 0.56, y: 0.82 }, style: 'dashed', color: '#38bdf8', label: 'Landing Step' }
                );
            } else if (situation === 'AT_NET') {
                elements.push(
                    { type: 'player', id: 'p1', x: 0.52, y: 0.60, label: 'Volleyer (P1)', color: '#2563EB' },
                    { type: 'cone', id: 'c_split', x: 0.52, y: 0.64, color: '#f59e0b' },
                    { type: 'target', id: 't1', x: 0.75, y: 0.24, points: 10, color: '#10b981' }
                );
                drawings.push(
                    { type: 'feed_path', from: { x: 0.38, y: 0.46 }, to: { x: 0.52, y: 0.60 }, style: 'dotted', color: '#facc15', label: 'Coach Feed' },
                    { type: 'ball_path', from: { x: 0.52, y: 0.60 }, to: { x: 0.75, y: 0.24 }, style: 'solid', color: '#CCFF00', label: 'Punch Volley' },
                    { type: 'move_path', from: { x: 0.52, y: 0.65 }, to: { x: 0.52, y: 0.60 }, style: 'dashed', color: '#38bdf8', label: 'Forward Split' }
                );
            } else {
                // Baseline Groundstroke Closed Practice
                elements.push(
                    { type: 'player', id: 'p1', x: 0.35, y: 0.84, label: 'Player (P1)', color: '#2563EB' },
                    { type: 'cone', id: 'c_reset', x: 0.50, y: 0.84, color: '#f59e0b' },
                    { type: 'target', id: 't1', x: hasDepth ? 0.70 : 0.65, y: hasDepth ? 0.16 : 0.26, points: 5, color: '#10b981' }
                );
                drawings.push(
                    { type: 'feed_path', from: { x: 0.38, y: 0.46 }, to: { x: 0.35, y: 0.82 }, style: 'dotted', color: '#facc15', label: 'Coach Feed' },
                    { type: 'ball_path', from: { x: 0.35, y: 0.82 }, to: { x: hasDepth ? 0.70 : 0.65, y: hasDepth ? 0.16 : 0.26 }, style: arcStyle, color: '#CCFF00', label: 'Crosscourt Drive' },
                    { type: 'move_path', from: { x: 0.35, y: 0.84 }, to: { x: 0.50, y: 0.84 }, style: 'dashed', color: '#38bdf8', label: 'Shuffle to Centre' }
                );
            }

            return { elements, drawings };
        }

        // Open / Assessment / Game Scenarios (Dynamic 2-Player Tactical Setup)
        if (situation === 'SERVE') {
            elements.push(
                { type: 'player', id: 'p1', x: 0.58, y: 0.88, label: 'Server (P1)', color: '#2563EB' },
                { type: 'player', id: 'p2', x: 0.32, y: 0.12, label: 'Receiver (P2)', color: '#DC2626' },
                { type: 'target', id: 't_srv', x: 0.38, y: 0.32, points: 10, color: '#10b981' },
                { type: 'target', id: 't_ret', x: 0.65, y: 0.85, points: 5, color: '#38bdf8' }
            );
            drawings.push(
                { type: 'ball_path', from: { x: 0.58, y: 0.88 }, to: { x: 0.38, y: 0.32 }, style: arcStyle, color: '#CCFF00', label: '1st Serve' },
                { type: 'ball_path', from: { x: 0.38, y: 0.32 }, to: { x: 0.65, y: 0.85 }, style: 'solid', color: '#38bdf8', label: 'Deep Return' },
                { type: 'move_path', from: { x: 0.58, y: 0.88 }, to: { x: 0.50, y: 0.88 }, style: 'dashed', color: '#38bdf8', label: 'Centre Reset' }
            );
        } else if (situation === 'RETURN') {
            elements.push(
                { type: 'player', id: 'p1', x: 0.66, y: 0.88, label: 'Receiver (P1)', color: '#2563EB' },
                { type: 'player', id: 'p2', x: 0.42, y: 0.10, label: 'Server (P2)', color: '#DC2626' },
                { type: 'cone', id: 'c_split', x: 0.66, y: 0.82, color: '#f59e0b' },
                { type: 'target', id: 't_deep', x: 0.25, y: 0.16, points: 10, color: '#10b981' }
            );
            drawings.push(
                { type: 'ball_path', from: { x: 0.42, y: 0.10 }, to: { x: 0.64, y: 0.68 }, style: 'solid', color: '#facc15', label: 'Opponent Serve' },
                { type: 'ball_path', from: { x: 0.66, y: 0.88 }, to: { x: 0.25, y: 0.16 }, style: arcStyle, color: '#CCFF00', label: 'Aggressive Return' },
                { type: 'move_path', from: { x: 0.66, y: 0.92 }, to: { x: 0.66, y: 0.86 }, style: 'dashed', color: '#38bdf8', label: 'Step Forward' }
            );
        } else if (situation === 'AT_NET') {
            elements.push(
                { type: 'player', id: 'p1', x: 0.52, y: 0.58, label: 'Net Player (P1)', color: '#2563EB' },
                { type: 'player', id: 'p2', x: 0.30, y: 0.12, label: 'Defender (P2)', color: '#DC2626' },
                { type: 'target', id: 't_vol', x: 0.75, y: 0.24, points: 10, color: '#10b981' }
            );
            drawings.push(
                { type: 'ball_path', from: { x: 0.30, y: 0.12 }, to: { x: 0.52, y: 0.58 }, style: 'solid', color: '#facc15', label: 'Dipping Drive' },
                { type: 'ball_path', from: { x: 0.52, y: 0.58 }, to: { x: 0.75, y: 0.24 }, style: 'solid', color: '#CCFF00', label: 'Punch Volley' },
                { type: 'move_path', from: { x: 0.52, y: 0.66 }, to: { x: 0.52, y: 0.58 }, style: 'dashed', color: '#38bdf8', label: 'Close the Net' }
            );
        } else if (situation === 'OPPONENT_AT_NET') {
            elements.push(
                { type: 'player', id: 'p1', x: 0.26, y: 0.88, label: 'Passer (P1)', color: '#2563EB' },
                { type: 'player', id: 'p2', x: 0.48, y: 0.42, label: 'Net Rusher (P2)', color: '#DC2626' },
                { type: 'target', id: 't_pass', x: 0.18, y: 0.14, points: 10, color: '#10b981' }
            );
            drawings.push(
                { type: 'ball_path', from: { x: 0.26, y: 0.88 }, to: { x: 0.18, y: 0.14 }, style: phase === 'DEFEND' ? 'loop' : 'solid', color: '#CCFF00', label: phase === 'DEFEND' ? 'Topspin Lob' : 'Down-the-Line Pass' },
                { type: 'move_path', from: { x: 0.26, y: 0.88 }, to: { x: 0.42, y: 0.86 }, style: 'dashed', color: '#38bdf8', label: 'Recovery' }
            );
        } else {
            // BOTH_BACK (Most common tactical scenario)
            if (phase === 'ATTACK') {
                elements.push(
                    { type: 'player', id: 'p1', x: 0.38, y: 0.76, label: 'Attacker (P1)', color: '#2563EB' },
                    { type: 'player', id: 'p2', x: 0.80, y: 0.16, label: 'Opponent (P2)', color: '#DC2626' },
                    { type: 'target', id: 't_att', x: 0.80, y: 0.18, points: 10, color: '#10b981' }
                );
                drawings.push(
                    { type: 'ball_path', from: { x: 0.38, y: 0.76 }, to: { x: 0.80, y: 0.18 }, style: 'solid', color: '#CCFF00', label: 'Penetrating Drive' },
                    { type: 'move_path', from: { x: 0.38, y: 0.76 }, to: { x: 0.48, y: 0.65 }, style: 'dashed', color: '#38bdf8', label: 'Approach to Net' }
                );
            } else if (phase === 'DEFEND') {
                elements.push(
                    { type: 'player', id: 'p1', x: 0.16, y: 0.94, label: 'Defender (P1)', color: '#2563EB' },
                    { type: 'player', id: 'p2', x: 0.55, y: 0.20, label: 'Opponent (P2)', color: '#DC2626' },
                    { type: 'target', id: 't_def', x: 0.50, y: 0.12, points: 5, color: '#38bdf8' }
                );
                drawings.push(
                    { type: 'ball_path', from: { x: 0.16, y: 0.94 }, to: { x: 0.50, y: 0.12 }, style: 'loop', color: '#CCFF00', label: 'Defensive High Lob / Moonball' },
                    { type: 'move_path', from: { x: 0.16, y: 0.94 }, to: { x: 0.50, y: 0.88 }, style: 'dashed', color: '#38bdf8', label: 'Sprint Recovery to Centre' }
                );
            } else {
                // RALLY (Neutral)
                elements.push(
                    { type: 'player', id: 'p1', x: 0.45, y: 0.86, label: 'Player 1', color: '#2563EB' },
                    { type: 'player', id: 'p2', x: 0.55, y: 0.14, label: 'Player 2', color: '#DC2626' },
                    { type: 'cone', id: 'c_rec1', x: 0.50, y: 0.86, color: '#f59e0b' },
                    { type: 'target', id: 't_deep', x: 0.70, y: 0.18, points: 5, color: '#10b981' }
                );
                drawings.push(
                    { type: 'ball_path', from: { x: 0.45, y: 0.86 }, to: { x: 0.70, y: 0.18 }, style: arcStyle, color: '#CCFF00', label: 'Crosscourt Rally' },
                    { type: 'ball_path', from: { x: 0.70, y: 0.18 }, to: { x: 0.35, y: 0.84 }, style: arcStyle, color: '#38bdf8', label: 'Deep Reply' },
                    { type: 'move_path', from: { x: 0.45, y: 0.86 }, to: { x: 0.50, y: 0.86 }, style: 'dashed', color: '#38bdf8', label: 'Centre Recovery' }
                );
            }
        }

        // Add Coach observer in Assessment or Game stages
        if (stageKey === 'GAME_ASSESSMENT' || stageKey === 'GAME') {
            elements.push({ type: 'coach', id: 'coach_obs', x: 0.12, y: 0.50, label: 'Coach' });
        }

        return { elements, drawings };
    },

    /**
     * Official British LTA Drill Methodology: FEED - SHOT - PLAY Framework
     * Generates structured 3-phase drill definitions for every tactical scenario.
     */
    getFSPDescription: function(situation = 'BOTH_BACK', phase = 'RALLY', tactic = 'CONTROL_SPACE', ballChars = ['DEPTH', 'DIRECTION'], stageKey = 'GAME_ASSESSMENT') {
        const isClosed = (stageKey === 'DEMO_CLOSED');
        const heightTag = ballChars.includes('HEIGHT') ? 'with high net clearance' : 'with penetrating flat shape';
        const depthTag = ballChars.includes('DEPTH') ? 'landing beyond the service line' : 'into short/medium depth';

        if (isClosed) {
            if (situation === 'SERVE') {
                return {
                    feed: 'Coach sets target cones in the service box (T and Wide). Ball begins in server\'s hand at deuce baseline.',
                    shot: 'Player executes fluid service motion, focusing on high contact point and pronation into target.',
                    play: 'Player lands cleanly on front foot inside baseline, resets behind recovery cone for next serve.'
                };
            } else if (situation === 'AT_NET') {
                return {
                    feed: 'Coach feeds steady underhand ball from basket at net post into player\'s forward volley strike zone.',
                    shot: `Player executes punch volley out front ${heightTag}, aiming at the +10 target disc in open court.`,
                    play: 'Player maintains low athletic base, splits forward, and resets for next feed.'
                };
            } else {
                return {
                    feed: 'Coach delivers controlled basket feed from net/service line with predictable bounce to player\'s wing.',
                    shot: `Player executes early unit turn, strikes crosscourt drive ${heightTag} ${depthTag} to target zone.`,
                    play: 'Player immediately pushes off outside leg, executes 3 rapid side-shuffles around center cone.'
                };
            }
        }

        // Open & Game scenarios
        if (situation === 'SERVE') {
            return {
                feed: 'Server (P1) delivers first serve out wide or down the T into opponent\'s diagonal service box.',
                shot: 'Receiver (P2) executes split-step, returns deep down the middle or crosscourt.',
                play: 'Server steps around to hit aggressive "Plus-One" groundstroke; players play out the point to conclusion.'
            };
        } else if (situation === 'RETURN') {
            return {
                feed: 'Opponent (P2) delivers serve from far baseline into player\'s service box.',
                shot: 'Player 1 steps forward inside baseline, takes return early on the rise into the open corner.',
                play: 'Opponent scrambles to recover; live baseline rally commences until winner or error.'
            };
        } else if (situation === 'AT_NET') {
            return {
                feed: 'Opponent drives a low dipping passing attempt from the far baseline.',
                shot: 'Player 1 punches a crisp angled volley into the open corner (+10 bonus target).',
                play: 'Player 1 covers the passing line; players play out the point at the net.'
            };
        } else if (situation === 'OPPONENT_AT_NET') {
            return {
                feed: 'Opponent approaches net behind an aggressive drive.',
                shot: phase === 'DEFEND' 
                    ? 'Player 1 executes high topspin lob clearing opponent\'s overhead reach.'
                    : 'Player 1 drives a sharp down-the-line passing shot past opponent.',
                play: 'Opponent scrambles back or stretches; point is completed live.'
            };
        } else {
            // BOTH_BACK
            if (phase === 'ATTACK') {
                return {
                    feed: 'Opponent hits short or neutral ball landing before the service line.',
                    shot: 'Player 1 steps inside baseline, executes aggressive penetrating drive into the open corner.',
                    play: 'Player 1 charges forward to transition/net position; finishes point on the next ball.'
                };
            } else if (phase === 'DEFEND') {
                return {
                    feed: 'Opponent hits heavy deep drive pushing Player 1 wide into the doubles alley.',
                    shot: 'Player 1 absorbs pace with open-stance defensive high topspin lob/moonball to buy court reset time.',
                    play: 'Player 1 sprints back to center mark behind baseline; resets point back to neutral.'
                };
            } else {
                return {
                    feed: 'Crosscourt groundstroke feed initiating live rally exchange from baseline.',
                    shot: `Player strikes continuous crosscourt groundstrokes maintaining ${depthTag} and margin.`,
                    play: 'Players maintain rally tolerance until an opening appears to transition or force an error.'
                };
            }
        }
    }
};

window.LTA_FRAMEWORK = LTA_FRAMEWORK;
