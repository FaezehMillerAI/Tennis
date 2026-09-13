/**
 * LTA Pre-loaded Standard Drills & Sessions Library (100% English)
 * Authentic British LTA coaching sessions adhering to the 4-tier Hourglass structure.
 */

const LTA_PRESETS = [
    {
        id: 'red_crosscourt_recovery',
        title: 'Crosscourt Rally & Dynamic Recovery',
        level: 'RED',
        situation: 'BOTH_BACK',
        capacity: 'PHYSICAL',
        surface: 'hard_blue',
        duration: 45,
        playersCount: '2 to 4 Players',
        equipment: 'LTA Red Felt Balls (Stage 3), 19-21" Rackets, 4 Cones, 2 Marker Discs, Agility Ladder',
        overview: 'Developing consistent diagonal groundstroke shape, solid contact out front, and active recovery back to the centre mark on a 36ft court.',
        
        stages: {
            GAME_ASSESSMENT: {
                goal: 'Diagnose whether players recover dynamically after hitting or remain stuck in the corner.',
                drillDescription: '2-player diagonal crosscourt rally on the Red 36ft court. Play begins with an underhand feed; players rally cooperatively to reach 6 consecutive shots.',
                coachObservations: 'Check if players watch the ball onto the strings, stay balanced on contact, and execute side-shuffle recovery steps immediately following their finish.',
                timeMinutes: 10,
                elements: [
                    { type: 'player', id: 'p1', x: 0.35, y: 0.85, label: 'Player 1' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.15, label: 'Player 2' },
                    { type: 'ball', id: 'b1', x: 0.36, y: 0.83 },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.85, color: '#f59e0b' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.35, y: 0.83 }, to: { x: 0.65, y: 0.17 }, style: 'solid', color: '#CCFF00', label: 'Diagonal Rally' },
                    { type: 'move_path', from: { x: 0.35, y: 0.85 }, to: { x: 0.48, y: 0.85 }, style: 'dashed', color: '#38bdf8', label: 'Recovery Step' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'Isolate the preparation unit turn, solid contact point, and 3-step side-shuffle recovery around the centre cone.',
                drillDescription: 'Coach positions with a ball hopper at the net post, delivering steady, predictable feeds to the forehand corner. Player strikes crosscourt to a target disc, then immediately shuffles around the centre cone.',
                coachingCues: [
                    'Early Unit Turn: Turn shoulders before the incoming ball bounces.',
                    'Contact Out Front: Strike the ball ahead of the front hip with a firm wrist.',
                    'Centre Recovery: Immediately push off the outside leg with 3 rapid side-shuffles to reset.'
                ],
                timeMinutes: 15,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.45, y: 0.45, label: 'Coach' },
                    { type: 'hopper', id: 'hop', x: 0.40, y: 0.44 },
                    { type: 'player', id: 'p1', x: 0.32, y: 0.82, label: 'Player' },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.82, color: '#f97316' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.20, points: 5, color: '#10b981' },
                    { type: 'cone', id: 'c2', x: 0.75, y: 0.25, color: '#ef4444' }
                ],
                drawings: [
                    { type: 'feed_path', from: { x: 0.43, y: 0.46 }, to: { x: 0.33, y: 0.80 }, style: 'dotted', color: '#facc15', label: 'Coach Feed' },
                    { type: 'ball_path', from: { x: 0.32, y: 0.80 }, to: { x: 0.70, y: 0.20 }, style: 'solid', color: '#CCFF00', label: 'Crosscourt Drive' },
                    { type: 'move_path', from: { x: 0.32, y: 0.82 }, to: { x: 0.48, y: 0.82 }, style: 'dashed', color: '#38bdf8', label: 'Side-Shuffle' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'Introduce movement pressure and decision making: player must touch the centre recovery cone between every shot.',
                drillDescription: 'Live 2-player rally with recovery constraint. Each player must retreat and touch their centre cone with their foot before striking the next ball. Rallies continue live until an error occurs.',
                coachingCues: [
                    'Read the ball trajectory while moving back to centre.',
                    'Split-step the exact moment the opponent strikes the ball.'
                ],
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.32, y: 0.82, label: 'Player 1' },
                    { type: 'player', id: 'p2', x: 0.68, y: 0.18, label: 'Player 2' },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.82, color: '#f97316' },
                    { type: 'cone', id: 'c2', x: 0.50, y: 0.18, color: '#f97316' },
                    { type: 'target', id: 't1', x: 0.68, y: 0.25, points: 3 }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.32, y: 0.82 }, to: { x: 0.68, y: 0.18 }, style: 'solid', color: '#CCFF00', label: 'Live Rally' },
                    { type: 'ball_path', from: { x: 0.68, y: 0.18 }, to: { x: 0.32, y: 0.82 }, style: 'solid', color: '#CCFF00' },
                    { type: 'move_path', from: { x: 0.32, y: 0.82 }, to: { x: 0.48, y: 0.82 }, style: 'dashed', color: '#38bdf8' }
                ]
            },
            GAME: {
                goal: 'First to 10 points tiebreak with a +2 bonus for any point won while recovering behind the cone.',
                drillDescription: 'Match play on the Red court. Regular scoring with the bonus rule: hitting into the designated crosscourt zone or recovering cleanly behind the cone before winning the rally earns 2 points.',
                debriefQuestions: [
                    'How did resetting to the centre help you reach the next shot with more time?',
                    'When the opponent hit deep, how did your split-step help your balance?'
                ],
                timeMinutes: 8,
                elements: [
                    { type: 'player', id: 'p1', x: 0.35, y: 0.85, label: 'Player 1' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.15, label: 'Player 2' },
                    { type: 'coach', id: 'coach', x: 0.15, y: 0.50, label: 'Umpire / Coach' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.25, points: 2, color: '#10b981' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.35, y: 0.85 }, to: { x: 0.70, y: 0.25 }, style: 'solid', color: '#CCFF00', label: 'Match Point' }
                ]
            }
        }
    },

    {
        id: 'orange_approach_volley',
        title: 'Approach Shot & Net Attack Transition',
        level: 'ORANGE',
        situation: 'APPROACH_NET',
        capacity: 'TACTICAL',
        surface: 'clay',
        duration: 60,
        playersCount: '2 to 4 Players',
        equipment: 'LTA Orange Balls (50% compression), 23-25" Rackets, Boundary Cones, Target Discs',
        overview: 'Recognizing the short ball, stepping aggressively inside the baseline, driving an approach down the line, and closing the net with a punch volley.',

        stages: {
            GAME_ASSESSMENT: {
                goal: 'Observe if players step inside the baseline on short balls or hesitate and let the ball drop deep.',
                drillDescription: 'Live baseline points. Coach introduces short mid-court balls at random to observe player forward transition and net instincts.',
                coachObservations: 'Does the player recognize the short ball early? Do they commit forward or stay glued to the baseline? Are volleys punched or swung?',
                timeMinutes: 10,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.85, label: 'Attacker' },
                    { type: 'player', id: 'p2', x: 0.50, y: 0.15, label: 'Defender' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.15 }, to: { x: 0.40, y: 0.65 }, style: 'solid', color: '#CCFF00', label: 'Short Ball' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'Rehearse forward momentum transfer on the approach drive followed by a split-step and compact punch volley.',
                drillDescription: 'Coach feeds ball 1 short to the mid-court. Player drives approach down the line to target, advances forward into the transition zone, split-steps as coach feeds ball 2, and punches the volley.',
                coachingCues: [
                    'Forward Weight Transfer: Step inside the court with authority.',
                    'Split-Step at Service Line: Land on the balls of both feet as the opponent prepares to hit.',
                    'Compact Punch: Keep the racket head above the wrist with no backswing.'
                ],
                timeMinutes: 20,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.35, y: 0.40, label: 'Coach' },
                    { type: 'hopper', id: 'hop', x: 0.30, y: 0.39 },
                    { type: 'player', id: 'p1', x: 0.45, y: 0.70, label: 'Player' },
                    { type: 'target', id: 't1', x: 0.25, y: 0.15, points: 5, color: '#3b82f6' },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.45, color: '#f59e0b' }
                ],
                drawings: [
                    { type: 'feed_path', from: { x: 0.35, y: 0.40 }, to: { x: 0.45, y: 0.68 }, style: 'dotted', color: '#facc15', label: 'Short Feed 1' },
                    { type: 'ball_path', from: { x: 0.45, y: 0.68 }, to: { x: 0.25, y: 0.15 }, style: 'solid', color: '#CCFF00', label: 'Approach Drive' },
                    { type: 'move_path', from: { x: 0.45, y: 0.68 }, to: { x: 0.50, y: 0.45 }, style: 'dashed', color: '#38bdf8', label: 'Net Rush' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'Open tactical decision: Player 1 attacks the net whenever Player 2 lands a ball short of the service line.',
                drillDescription: 'Continuous rally. Player 1 must call "Attack!" on any ball landing in the short zone, drive an approach, and close the net. Player 2 attempts a pass or lob.',
                coachingCues: [
                    'Approach to the open space behind the opponent.',
                    'Cut off the volley angle along the line of ball flight.'
                ],
                timeMinutes: 18,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.55, label: 'Net Attacker' },
                    { type: 'player', id: 'p2', x: 0.30, y: 0.15, label: 'Baseline Defender' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.20, points: 3 }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.55 }, to: { x: 0.70, y: 0.20 }, style: 'solid', color: '#CCFF00', label: 'Volley Finish' },
                    { type: 'move_path', from: { x: 0.50, y: 0.75 }, to: { x: 0.50, y: 0.55 }, style: 'dashed', color: '#38bdf8', label: 'Approach' }
                ]
            },
            GAME: {
                goal: 'Fast-4 match play with a 3-point reward for winning any point via a successful net volley.',
                drillDescription: 'Standard Orange court match rules. Normal winner = 1 point; winning a point at the net following an approach = 3 bonus points.',
                debriefQuestions: [
                    'What visual cues showed you that the opponent’s ball was going to land short?',
                    'Which approach direction gave you the safest net coverage?'
                ],
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.85, label: 'Server' },
                    { type: 'player', id: 'p2', x: 0.35, y: 0.15, label: 'Receiver' },
                    { type: 'coach', id: 'coach', x: 0.85, y: 0.50, label: 'LTA Coach' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.85 }, to: { x: 0.35, y: 0.35 }, style: 'solid', color: '#CCFF00', label: 'Serve + Attack' }
                ]
            }
        }
    },

    {
        id: 'green_serve_plus_one',
        title: 'Serve + 1 Dominant Forehand Attack',
        level: 'GREEN',
        situation: 'SERVE',
        capacity: 'TACTICAL',
        surface: 'grass',
        duration: 60,
        playersCount: '2 to 4 Players',
        equipment: 'LTA Green Balls (25% compression), 25-26" Rackets, Service Box Target Markers, Baseline Deep Zones',
        overview: 'Mastering targeted first serves (T and Wide) followed by immediate dynamic positioning to dictate the point with a penetrating +1 forehand.',

        stages: {
            GAME_ASSESSMENT: {
                goal: 'Assess if the server treats the serve as a weapon to set up shot #2 or merely as a ball restart.',
                drillDescription: 'Match play from Deuce court. Coach tracks what percentage of second shots the server plays on their forehand versus backhand.',
                coachObservations: 'Does the server land dynamically inside the baseline? Do they hunt the forehand on ball +1 or passively wait on the baseline?',
                timeMinutes: 10,
                elements: [
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'Server' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.12, label: 'Returner' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.55, y: 0.38 }, style: 'solid', color: '#CCFF00', label: 'Serve to T' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'Rehearse the repeatable pattern: targeted serve, dynamic split-step forward recovery, and inside-out forehand drive.',
                drillDescription: 'Player serves into the Deuce T target. Coach immediately feeds a floating return to mid-court. Server pivots around the ball to strike an aggressive inside-out forehand into the deep corner.',
                coachingCues: [
                    'Forward Toss: Toss at 1 o\'clock slightly inside the baseline to drive momentum.',
                    'Dynamic Split-Step: Recover both feet in an athletic stance immediately on landing.',
                    'Forehand Loading: Rotate hips and coil shoulders early to take the ball on the rise.'
                ],
                timeMinutes: 20,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.70, y: 0.45, label: 'Coach' },
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'Server' },
                    { type: 'target', id: 't1', x: 0.55, y: 0.38, points: 5, color: '#10b981' },
                    { type: 'target', id: 't2', x: 0.25, y: 0.15, points: 10, color: '#38bdf8' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.55, y: 0.38 }, style: 'solid', color: '#CCFF00', label: 'Targeted Serve' },
                    { type: 'feed_path', from: { x: 0.70, y: 0.45 }, to: { x: 0.48, y: 0.75 }, style: 'dotted', color: '#facc15', label: 'Return Feed' },
                    { type: 'ball_path', from: { x: 0.48, y: 0.75 }, to: { x: 0.25, y: 0.15 }, style: 'solid', color: '#CCFF00', label: 'Inside-Out Drive' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'Live returner scenario: Server must hunt the forehand on shot +1 regardless of return location.',
                drillDescription: 'Live serve and return. Returner attempts deep central returns. If server successfully executes an aggressive forehand on ball +1, they receive 2 points.',
                coachingCues: [
                    'Read the returner\'s racket angle at contact.',
                    'Anticipate and begin footwork before the return crosses the net.'
                ],
                timeMinutes: 18,
                elements: [
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'Server' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.12, label: 'Returner' },
                    { type: 'target', id: 't1', x: 0.20, y: 0.15, points: 5 },
                    { type: 'target', id: 't2', x: 0.80, y: 0.15, points: 5 }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.55, y: 0.38 }, style: 'solid', color: '#CCFF00' },
                    { type: 'ball_path', from: { x: 0.65, y: 0.12 }, to: { x: 0.48, y: 0.75 }, style: 'solid', color: '#f97316' },
                    { type: 'ball_path', from: { x: 0.48, y: 0.75 }, to: { x: 0.20, y: 0.15 }, style: 'solid', color: '#CCFF00' }
                ]
            },
            GAME: {
                goal: 'Match tiebreak to 10 points. Coach evaluates first serve percentage and Serve+1 conversion rate.',
                drillDescription: '10-point Champions Tiebreak. Server switches every 2 points. Full match pressure with performance statistics tracked by the coach.',
                debriefQuestions: [
                    'How did serving to the T open up the opposite corner for your forehand?',
                    'When the return was struck deep, what adjustment kept you on offense?'
                ],
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'Player 1' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.12, label: 'Player 2' },
                    { type: 'coach', id: 'coach', x: 0.15, y: 0.50, label: 'Coach / Analyst' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.55, y: 0.38 }, style: 'solid', color: '#CCFF00' }
                ]
            }
        }
    },

    {
        id: 'yellow_baseline_depth',
        title: 'Heavy Topspin Depth & Baseline Control',
        level: 'YELLOW_INT',
        situation: 'BOTH_BACK',
        capacity: 'TECHNICAL',
        surface: 'clay',
        duration: 75,
        playersCount: '2 Players',
        equipment: 'Standard Yellow Balls, Baseline Target Strips, Above-Net Clearance Ropes',
        overview: 'Mastering heavy topspin with 3-4 feet net clearance to consistently push the opponent behind their baseline and control the tempo.',

        stages: {
            GAME_ASSESSMENT: {
                goal: 'Diagnose why player shots drop short into the service boxes, allowing the opponent to attack.',
                drillDescription: 'Open baseline crosscourt rally. Coach charts the landing depth of 20 consecutive shots.',
                coachObservations: 'Is the swing path too flat? Is the player dropping the racket head below the ball before accelerating upwards?',
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.30, y: 0.88, label: 'Player A' },
                    { type: 'player', id: 'p2', x: 0.70, y: 0.12, label: 'Player B' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.30, y: 0.88 }, to: { x: 0.70, y: 0.28 }, style: 'solid', color: '#f59e0b', label: 'Short Ball (Vulnerable)' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'Refine the Low-to-High brush trajectory to produce heavy topspin with 3-4 feet net clearance.',
                drillDescription: 'Coach feeds deep, heavy balls. A training cord is suspended 1 metre above the net. Player must drive balls over the cord into the deep baseline zone.',
                coachingCues: [
                    'Racket Tip Drop: Drop the racket head below the height of the ball.',
                    'Aggressive Brush: Accelerate strings upwards from 6 o\'clock to 12 o\'clock.',
                    'High Finish: Complete follow-through above the shoulder with full hip rotation.'
                ],
                timeMinutes: 25,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.50, y: 0.40, label: 'Coach' },
                    { type: 'player', id: 'p1', x: 0.30, y: 0.88, label: 'Player' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.15, points: 5, color: '#10b981' },
                    { type: 'cone', id: 'c1', x: 0.70, y: 0.28, color: '#ef4444' }
                ],
                drawings: [
                    { type: 'feed_path', from: { x: 0.50, y: 0.40 }, to: { x: 0.30, y: 0.85 }, style: 'dotted', color: '#facc15' },
                    { type: 'ball_path', from: { x: 0.30, y: 0.85 }, to: { x: 0.70, y: 0.15 }, style: 'loop', color: '#CCFF00', label: 'Heavy Arched Topspin' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'Continuous depth rally: any ball bouncing inside the service boxes grants the opposing player immediate attack rights.',
                drillDescription: 'Dynamic 2-player baseline rally. Players count consecutive shots landing between the service line and baseline.',
                coachingCues: [
                    'Maintain rally patience and wait for the short ball.',
                    'Adjust micro-footwork when pushed deep behind the baseline.'
                ],
                timeMinutes: 20,
                elements: [
                    { type: 'player', id: 'p1', x: 0.30, y: 0.88, label: 'Player A' },
                    { type: 'player', id: 'p2', x: 0.70, y: 0.12, label: 'Player B' },
                    { type: 'target', id: 't1', x: 0.30, y: 0.15, points: 2 },
                    { type: 'target', id: 't2', x: 0.70, y: 0.85, points: 2 }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.30, y: 0.88 }, to: { x: 0.70, y: 0.15 }, style: 'loop', color: '#CCFF00' },
                    { type: 'ball_path', from: { x: 0.70, y: 0.12 }, to: { x: 0.30, y: 0.85 }, style: 'loop', color: '#CCFF00' }
                ]
            },
            GAME: {
                goal: 'Full 6-game set on clay with a double point reward for forcing the opponent 2+ metres behind their baseline.',
                drillDescription: 'Standard match rules. Points won while pushing the opponent deep into defense score 2 points.',
                debriefQuestions: [
                    'How did the clay court bounce amplify your heavy topspin?',
                    'When fatigue set in, how did you maintain your net clearance?'
                ],
                timeMinutes: 18,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.90, label: 'Player A' },
                    { type: 'player', id: 'p2', x: 0.50, y: 0.10, label: 'Player B' },
                    { type: 'coach', id: 'coach', x: 0.85, y: 0.50, label: 'Coach' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.90 }, to: { x: 0.30, y: 0.12 }, style: 'solid', color: '#CCFF00' }
                ]
            }
        }
    }
];

window.LTA_PRESETS = LTA_PRESETS;
