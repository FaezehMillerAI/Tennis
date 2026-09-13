/**
 * LTA Framework & Standards Data Model (100% English)
 * Incorporating official British LTA Lesson Hourglass Model,
 * LTA Youth Stages, 5 Game Situations, and 4 Performance Capacities.
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

    // LTA 5 Game Situations
    situations: {
        SERVE: {
            id: 'SERVE',
            titleEn: '1. Serving',
            icon: 'zap',
            tacticalGoal: 'Seize immediate offensive advantage, target service box corners (T and Wide), and vary spin.'
        },
        RETURN: {
            id: 'RETURN',
            titleEn: '2. Returning',
            icon: 'shield',
            tacticalGoal: 'Neutralize server advantage with deep central returns, or punish weak second serves into open space.'
        },
        BOTH_BACK: {
            id: 'BOTH_BACK',
            titleEn: '3. Both at Baseline',
            icon: 'repeat',
            tacticalGoal: 'Control the 5 ball reception/projection variables (Speed, Spin, Height, Depth, Direction) to dictate tempo.'
        },
        APPROACH_NET: {
            id: 'APPROACH_NET',
            titleEn: '4. Approaching & at Net',
            icon: 'arrow-up-right',
            tacticalGoal: 'Exploit short balls, drive aggressive approaches down the line, close the net, and finish with decisive volleys.'
        },
        DEFEND_NET: {
            id: 'DEFEND_NET',
            titleEn: '5. Defending against Net Player',
            icon: 'crosshair',
            tacticalGoal: 'Execute sharp passing shots, dipping balls at the opponent\'s feet, and defensive topspin lobs.'
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
    }
};

window.LTA_FRAMEWORK = LTA_FRAMEWORK;
