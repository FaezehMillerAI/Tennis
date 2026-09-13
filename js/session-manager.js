/**
 * LTA Session Manager (100% English)
 * Handles session state, stage transitions (Hourglass 4-Tier Model),
 * Tactical Matrix state (Where, What, Tactic, Ball Characteristics),
 * localStorage persistence, JSON import/export, and print-to-PDF formatting.
 */

class LTASessionManager {
    constructor(courtEngine) {
        this.court = courtEngine;
        this.activeSession = null;
        this.activeStageKey = 'GAME_ASSESSMENT'; // GAME_ASSESSMENT, DEMO_CLOSED, PROGRESSING_OPEN, GAME
        this.savedSessions = this.loadSavedSessionsFromStorage();

        // Start with the first curated preset
        if (window.LTA_PRESETS && window.LTA_PRESETS.length > 0) {
            this.loadSession(window.LTA_PRESETS[0]);
        }
    }

    loadSavedSessionsFromStorage() {
        try {
            const raw = localStorage.getItem('lta_coach_sessions_en');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load sessions from storage', e);
            return [];
        }
    }

    saveSessionsToStorage() {
        try {
            localStorage.setItem('lta_coach_sessions_en', JSON.stringify(this.savedSessions));
        } catch (e) {
            console.error('Failed to save sessions to storage', e);
        }
    }

    loadSession(sessionData) {
        this.activeSession = JSON.parse(JSON.stringify(sessionData));

        // Ensure Tactical Matrix defaults
        if (!this.activeSession.phaseOfPlay) this.activeSession.phaseOfPlay = 'RALLY';
        if (!this.activeSession.tactic) this.activeSession.tactic = 'CONTROL_SPACE';
        if (!this.activeSession.ballCharacteristics) this.activeSession.ballCharacteristics = ['DEPTH', 'DIRECTION'];

        if (this.activeSession.surface && this.court) {
            this.court.setSurface(this.activeSession.surface);
        }

        this.setStage('GAME_ASSESSMENT', false);
    }

    setStage(stageKey, saveCurrent = true) {
        if (!this.activeSession) return;

        if (saveCurrent && this.court && this.activeSession.stages[this.activeStageKey]) {
            const currentData = this.court.getCurrentPhaseData();
            this.activeSession.stages[this.activeStageKey].elements = currentData.elements;
            this.activeSession.stages[this.activeStageKey].drawings = currentData.drawings;
        }

        this.activeStageKey = stageKey;

        let stageData = this.activeSession.stages[stageKey];
        if (!stageData || !stageData.elements || stageData.elements.length === 0) {
            if (window.LTA_FRAMEWORK?.buildTacticalLayout) {
                const layout = LTA_FRAMEWORK.buildTacticalLayout(
                    this.activeSession.situation || 'BOTH_BACK',
                    this.activeSession.phaseOfPlay || 'RALLY',
                    this.activeSession.tactic || 'CONTROL_SPACE',
                    this.activeSession.ballCharacteristics || ['DEPTH', 'DIRECTION'],
                    stageKey,
                    this.activeSession.level || 'RED'
                );
                if (!stageData) {
                    stageData = {
                        goal: 'Stage Objective',
                        drillDescription: 'Drill Description',
                        timeMinutes: 15
                    };
                    this.activeSession.stages[stageKey] = stageData;
                }
                stageData.elements = layout.elements;
                stageData.drawings = layout.drawings;
            }
        }

        if (stageData && this.court) {
            this.court.loadPhase(stageData);
        }

        window.tennisAudio?.playBounce();
    }

    applyTacticalMatrixUpdate(triggerCourtUpdate = true) {
        if (!this.activeSession) return;
        const currentStageKey = this.activeStageKey;
        const session = this.activeSession;

        if (triggerCourtUpdate && window.LTA_FRAMEWORK?.buildTacticalLayout) {
            const layout = LTA_FRAMEWORK.buildTacticalLayout(
                session.situation || 'BOTH_BACK',
                session.phaseOfPlay || 'RALLY',
                session.tactic || 'CONTROL_SPACE',
                session.ballCharacteristics || ['DEPTH', 'DIRECTION'],
                currentStageKey,
                session.level || 'RED'
            );

            if (!session.stages[currentStageKey]) {
                session.stages[currentStageKey] = {
                    goal: 'Stage Objective',
                    drillDescription: 'Drill Description',
                    timeMinutes: 15
                };
            }
            session.stages[currentStageKey].elements = layout.elements;
            session.stages[currentStageKey].drawings = layout.drawings;

            if (this.court) {
                this.court.loadPhase(session.stages[currentStageKey]);
            }
        }
    }

    saveCurrentSession() {
        if (!this.activeSession) return;

        if (this.court && this.activeSession.stages[this.activeStageKey]) {
            const currentData = this.court.getCurrentPhaseData();
            this.activeSession.stages[this.activeStageKey].elements = currentData.elements;
            this.activeSession.stages[this.activeStageKey].drawings = currentData.drawings;
        }

        this.activeSession.updatedAt = new Date().toISOString();

        const existingIndex = this.savedSessions.findIndex(s => s.id === this.activeSession.id);
        if (existingIndex >= 0) {
            this.savedSessions[existingIndex] = JSON.parse(JSON.stringify(this.activeSession));
        } else {
            this.savedSessions.unshift(JSON.parse(JSON.stringify(this.activeSession)));
        }

        this.saveSessionsToStorage();
        window.tennisAudio?.playWhistle();
        return this.activeSession;
    }

    createNewSession() {
        const newSession = {
            id: 'session_' + Date.now(),
            title: 'New LTA Coaching Session',
            level: 'YELLOW_INT',
            situation: 'BOTH_BACK',
            phaseOfPlay: 'RALLY',
            tactic: 'CONTROL_SPACE',
            ballCharacteristics: ['DEPTH', 'DIRECTION'],
            capacity: 'TECHNICAL',
            surface: this.court ? this.court.surface : 'hard_blue',
            duration: 60,
            playersCount: '2 Players',
            equipment: 'Standard Yellow Balls, 4 Cones, Target Markers',
            overview: 'Custom training scenario designed according to the official British LTA 4-tier Hourglass structure & Tactical Matrix.',
            stages: {
                GAME_ASSESSMENT: {
                    goal: 'Diagnose baseline tendencies and technical/tactical priorities under real game conditions.',
                    drillDescription: 'Short competitive game or rally context to observe player shot execution and court recovery.',
                    coachObservations: 'Monitor player balance, preparation timing, and tactical shot choices.',
                    timeMinutes: 10,
                    elements: [],
                    drawings: []
                },
                DEMO_CLOSED: {
                    goal: 'Isolate technical mechanics and build muscle memory with controlled, predictable feeds.',
                    drillDescription: 'Clear visual demonstration with concise cues (What, When, How, Why) and repetitive closed feeding.',
                    coachingCues: ['Early Unit Turn', 'Solid Contact Out Front', 'Full Extension & Recovery'],
                    timeMinutes: 20,
                    elements: [],
                    drawings: []
                },
                PROGRESSING_OPEN: {
                    goal: 'Advance to dynamic live rallies, introducing decision-making variables and spatial awareness.',
                    drillDescription: 'Live rally with constraints: players respond dynamically based on incoming ball depth and opponent placement.',
                    coachingCues: ['Anticipate opponent recovery', 'Execute targeted tactical pattern under movement'],
                    timeMinutes: 20,
                    elements: [],
                    drawings: []
                },
                GAME: {
                    goal: 'Evaluate skill transfer in competitive match play with thematic bonus scoring, followed by debrief.',
                    drillDescription: 'Tiebreak or match play. Points won using the session\'s primary skill earn double points.',
                    debriefQuestions: ['When did you feel most in control of the rally?', 'What is your main takeaway for future matches?'],
                    timeMinutes: 10,
                    elements: [],
                    drawings: []
                }
            }
        };

        this.loadSession(newSession);
        return newSession;
    }

    deleteSession(sessionId) {
        this.savedSessions = this.savedSessions.filter(s => s.id !== sessionId);
        this.saveSessionsToStorage();
    }

    exportJSON() {
        if (!this.activeSession) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.activeSession, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `lta_session_${this.activeSession.id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        window.tennisAudio?.playClick();
    }

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.stages && parsed.title) {
                parsed.id = 'imported_' + Date.now();
                this.savedSessions.unshift(parsed);
                this.saveSessionsToStorage();
                this.loadSession(parsed);
                window.tennisAudio?.playWhistle();
                return true;
            }
        } catch (e) {
            console.error('Import error', e);
        }
        return false;
    }

    printSessionCard() {
        if (!this.activeSession) return;

        if (this.court && this.activeSession.stages[this.activeStageKey]) {
            const currentData = this.court.getCurrentPhaseData();
            this.activeSession.stages[this.activeStageKey].elements = currentData.elements;
            this.activeSession.stages[this.activeStageKey].drawings = currentData.drawings;
        }

        let courtDataUrl = '';
        if (this.court && this.court.renderer) {
            this.court.renderer.render(this.court.scene, this.court.camera);
            courtDataUrl = this.court.renderer.domElement.toDataURL('image/png');
        }

        const levelInfo = LTA_FRAMEWORK.levels[this.activeSession.level] || {};
        const situationInfo = LTA_FRAMEWORK.situations[this.activeSession.situation] || {};
        const phaseInfo = LTA_FRAMEWORK.phasesOfPlay[this.activeSession.phaseOfPlay || 'RALLY'] || {};
        const tacticInfo = LTA_FRAMEWORK.tactics[this.activeSession.tactic || 'CONTROL_SPACE'] || {};
        const capacityInfo = LTA_FRAMEWORK.capacities[this.activeSession.capacity] || {};
        const surfaceInfo = LTA_FRAMEWORK.surfaces[this.activeSession.surface || 'hard_blue'] || {};

        const stages = this.activeSession.stages;
        const ballVars = (this.activeSession.ballCharacteristics || ['DEPTH', 'DIRECTION']).join(' • ');

        const printContainer = document.getElementById('print-container');
        if (!printContainer) return;

        printContainer.innerHTML = `
            <div class="print-page">
                <div class="print-header">
                    <div>
                        <div class="print-brand">
                            <span class="lta-logo-badge">LTA</span>
                            <span>British Lawn Tennis Association | Official Coaching Lesson Plan</span>
                        </div>
                        <h1 class="print-title">${this.activeSession.title}</h1>
                    </div>

                    <!-- LTA Tactical Framework Matrix Ribbon in Print -->
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#0F2552; color:#fff; padding:8px 12px; border-radius:6px; margin:8px 0; font-size:11px;">
                        <div><strong>WHERE (Situation):</strong> ${situationInfo.titleEn || this.activeSession.situation}</div>
                        <div><strong>WHAT (Phase):</strong> <span style="background:${phaseInfo.color || '#10b981'}; color:#fff; padding:2px 8px; border-radius:4px; font-weight:800;">${phaseInfo.titleEn || 'RALLY'}</span></div>
                        <div><strong>TACTIC:</strong> ${tacticInfo.titleEn || 'Control Space'}</div>
                        <div><strong>BALL VARIABLES:</strong> ${ballVars}</div>
                    </div>

                    <div class="print-meta-grid">
                        <div><strong>Stage / Age:</strong> ${levelInfo.nameEn || this.activeSession.level}</div>
                        <div><strong>Focus Capacity:</strong> ${capacityInfo.titleEn || this.activeSession.capacity}</div>
                        <div><strong>Surface:</strong> ${surfaceInfo.nameEn || 'Hard Court'}</div>
                        <div><strong>Duration:</strong> ${this.activeSession.duration} mins</div>
                        <div><strong>Group Size:</strong> ${this.activeSession.playersCount || '2 Players'}</div>
                    </div>
                </div>

                <div class="print-body">
                    <div class="print-court-section">
                        <div class="print-section-title">Tactical 3D Court Diagram (${LTA_FRAMEWORK.stages[this.activeStageKey]?.titleEn})</div>
                        <img src="${courtDataUrl}" class="print-court-img" alt="3D Court Diagram" />
                        <div class="print-equipment"><strong>Required Equipment:</strong> ${this.activeSession.equipment || 'Standard balls and rackets'}</div>
                    </div>

                    <div class="print-hourglass-section">
                        <div class="print-section-title">4-Tier Lesson Structure (Hourglass Model)</div>
                        
                        <!-- 1. Game Assessment -->
                        <div class="print-stage-box stage-1">
                            <div class="print-stage-header">
                                <span class="stage-num">1</span>
                                <strong>GAME ASSESSMENT</strong>
                                <span class="stage-time">${stages.GAME_ASSESSMENT?.timeMinutes || 10} mins</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>Goal:</strong> ${stages.GAME_ASSESSMENT?.goal || '-'}</p>
                                <p><strong>Drill Context:</strong> ${stages.GAME_ASSESSMENT?.drillDescription || '-'}</p>
                                <p><strong>Coach Observations:</strong> ${stages.GAME_ASSESSMENT?.coachObservations || '-'}</p>
                            </div>
                        </div>

                        <!-- 2. Demo / Teaching Closed -->
                        <div class="print-stage-box stage-2">
                            <div class="print-stage-header">
                                <span class="stage-num">2</span>
                                <strong>DEMO / TEACHING (CLOSED)</strong>
                                <span class="stage-time">${stages.DEMO_CLOSED?.timeMinutes || 20} mins</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>Goal:</strong> ${stages.DEMO_CLOSED?.goal || '-'}</p>
                                <p><strong>Drill Context:</strong> ${stages.DEMO_CLOSED?.drillDescription || '-'}</p>
                                <p><strong>Coaching Cues:</strong> ${(stages.DEMO_CLOSED?.coachingCues || []).join(' • ')}</p>
                            </div>
                        </div>

                        <!-- 3. Progressing Open -->
                        <div class="print-stage-box stage-3">
                            <div class="print-stage-header">
                                <span class="stage-num">3</span>
                                <strong>PROGRESSING (OPEN)</strong>
                                <span class="stage-time">${stages.PROGRESSING_OPEN?.timeMinutes || 18} mins</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>Goal:</strong> ${stages.PROGRESSING_OPEN?.goal || '-'}</p>
                                <p><strong>Drill Context:</strong> ${stages.PROGRESSING_OPEN?.drillDescription || '-'}</p>
                                <p><strong>Decision Rules:</strong> ${(stages.PROGRESSING_OPEN?.coachingCues || []).join(' • ')}</p>
                            </div>
                        </div>

                        <!-- 4. Game -->
                        <div class="print-stage-box stage-4">
                            <div class="print-stage-header">
                                <span class="stage-num">4</span>
                                <strong>GAME (MATCH PLAY)</strong>
                                <span class="stage-time">${stages.GAME?.timeMinutes || 12} mins</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>Match Rules & Bonus:</strong> ${stages.GAME?.drillDescription || '-'}</p>
                                <p><strong>Player Debrief Questions:</strong> ${(stages.GAME?.debriefQuestions || []).join(' • ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="print-footer">
                    <span>LTA Coach Studio 3D • Designed to official Lawn Tennis Association British Standards</span>
                    <span>Date: ${new Date().toLocaleDateString('en-GB')}</span>
                </div>
            </div>
        `;

        window.tennisAudio?.playWhistle();
        setTimeout(() => {
            window.print();
        }, 200);
    }
}

window.LTASessionManager = LTASessionManager;
