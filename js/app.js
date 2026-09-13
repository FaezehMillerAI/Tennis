/**
 * LTA Coach Studio 3D - Main Application Controller (100% English)
 * Coordinates 3D WebGL Court Engine, LTA Tactical Matrix Widget,
 * 4-Tier Hourglass Lesson Structure, Camera Presets & Modals
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Safe Initialization of 3D Engine & Session Manager
    let court = null;
    try {
        court = new TennisCourt3DEngine('tennis-court-3d-container');
    } catch (err) {
        console.error('TennisCourt3DEngine init failed:', err);
    }

    let sessionMgr = null;
    try {
        sessionMgr = new LTASessionManager(court);
    } catch (err) {
        console.error('LTASessionManager init failed:', err);
    }

    window.court = court;
    window.sessionMgr = sessionMgr;

    // 2. UI Elements
    const surfaceButtons = document.querySelectorAll('.surface-btn');
    const formatTabs = document.querySelectorAll('.format-tab');
    const cameraButtons = document.querySelectorAll('.camera-btn');
    const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
    const ballStyleSelect = document.getElementById('ball-path-style');
    const paletteButtons = document.querySelectorAll('.palette-item-btn');
    
    // Matrix Elements
    const matrixSituationButtons = document.querySelectorAll('.matrix-pill-btn[data-situation]');
    const matrixPhaseButtons = document.querySelectorAll('.matrix-phase-btn[data-phase]');
    const matrixTacticButtons = document.querySelectorAll('.matrix-tactic-btn[data-tactic]');
    const matrixDirectionButtons = document.querySelectorAll('.matrix-dir-btn[data-direction]');
    const matrixBallItems = document.querySelectorAll('.matrix-ball-item[data-ball]');
    
    const matrixActiveSituation = document.getElementById('matrix-active-situation');
    const matrixActivePhase = document.getElementById('matrix-active-phase');
    const matrixActiveTactic = document.getElementById('matrix-active-tactic');
    const matrixActiveDirection = document.getElementById('matrix-active-direction');

    // Hourglass Elements
    const hourglassTiers = document.querySelectorAll('.hourglass-tier');
    const stageTitleEn = document.getElementById('stage-title-en');
    const stageDescription = document.getElementById('stage-description');
    
    // Form Inputs
    const stageGoalInput = document.getElementById('stage-goal');
    const stageDrillInput = document.getElementById('stage-drill');
    const stageTimeInput = document.getElementById('stage-time');
    const stageSpecificLabel = document.getElementById('stage-specific-label');
    const stageSpecificInput = document.getElementById('stage-specific-input');

    // Modals
    const generatorModal = document.getElementById('generator-modal');
    const presetsModal = document.getElementById('presets-modal');
    const savedModal = document.getElementById('saved-modal');

    // 3. Sync UI with Active Session & Stage
    function updateUIForCurrentStage() {
        const session = sessionMgr.activeSession;
        if (!session) return;

        const currentStageKey = sessionMgr.activeStageKey;
        const stageDef = LTA_FRAMEWORK.stages[currentStageKey];
        const stageData = session.stages[currentStageKey] || {};

        // Update Tactical Matrix State
        const sitDef = LTA_FRAMEWORK.situations[session.situation] || LTA_FRAMEWORK.situations.BOTH_BACK;
        const phaseDef = LTA_FRAMEWORK.phasesOfPlay[session.phaseOfPlay] || LTA_FRAMEWORK.phasesOfPlay.RALLY;
        const tacticDef = LTA_FRAMEWORK.tactics[session.tactic] || LTA_FRAMEWORK.tactics.CONTROL_SPACE;
        const activeDir = session.shotDirection || 'CROSSCOURT';
        const dirDef = LTA_FRAMEWORK.directions?.[activeDir] || LTA_FRAMEWORK.directions?.CROSSCOURT || { titleEn: 'Crosscourt' };

        if (matrixActiveSituation) matrixActiveSituation.textContent = sitDef.titleEn;
        if (matrixActivePhase) {
            matrixActivePhase.textContent = phaseDef.titleEn;
            matrixActivePhase.style.color = phaseDef.color;
        }
        if (matrixActiveTactic) matrixActiveTactic.textContent = tacticDef.titleEn;
        if (matrixActiveDirection) matrixActiveDirection.textContent = dirDef.titleEn;

        // Highlight Matrix Buttons
        matrixSituationButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.situation === session.situation);
        });

        matrixPhaseButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.phase === session.phaseOfPlay);
        });

        matrixTacticButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tactic === session.tactic);
        });

        matrixDirectionButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.direction === activeDir);
        });

        matrixBallItems.forEach(item => {
            const ballKey = item.dataset.ball;
            const isActive = (session.ballCharacteristics || []).includes(ballKey);
            item.classList.toggle('active', isActive);
        });

        // Update Hourglass Visual Highlight
        hourglassTiers.forEach(tier => {
            if (tier.dataset.stage === currentStageKey) {
                tier.classList.add('active');
            } else {
                tier.classList.remove('active');
            }
        });

        // Update Stage Editor Texts
        if (stageTitleEn) stageTitleEn.textContent = stageDef.titleEn;
        if (stageDescription) stageDescription.textContent = stageDef.description;

        if (stageGoalInput) stageGoalInput.value = stageData.goal || '';
        if (stageDrillInput) stageDrillInput.value = stageData.drillDescription || '';
        if (stageTimeInput) stageTimeInput.value = stageData.timeMinutes || 15;

        // Custom label & input based on stage type (from diagram)
        if (stageSpecificLabel && stageSpecificInput) {
            if (currentStageKey === 'GAME_ASSESSMENT') {
                stageSpecificLabel.textContent = 'Coach Observations:';
                stageSpecificInput.placeholder = 'e.g. Is contact point out front? Is recovery active or delayed?';
                stageSpecificInput.value = stageData.coachObservations || '';
            } else if (currentStageKey === 'DEMO_CLOSED') {
                stageSpecificLabel.textContent = 'Action Coaching Cues (one per line):';
                stageSpecificInput.placeholder = 'e.g. Early Unit Turn\nContact Out Front\nFull Follow-Through';
                stageSpecificInput.value = Array.isArray(stageData.coachingCues) 
                    ? stageData.coachingCues.join('\n') 
                    : (stageData.coachingCues || '');
            } else if (currentStageKey === 'PROGRESSING_OPEN') {
                stageSpecificLabel.textContent = 'Decision Rules & Constraints (one per line):';
                stageSpecificInput.placeholder = 'e.g. If opponent hits short -> drive approach down the line\nSplit-step timing on ball contact';
                stageSpecificInput.value = Array.isArray(stageData.coachingCues) 
                    ? stageData.coachingCues.join('\n') 
                    : (stageData.coachingCues || '');
            } else if (currentStageKey === 'GAME') {
                stageSpecificLabel.textContent = 'Player Debrief Questions (one per line):';
                stageSpecificInput.placeholder = 'e.g. When did you feel most in control of the rally?\nWhat is your personal goal for next session?';
                stageSpecificInput.value = Array.isArray(stageData.debriefQuestions) 
                    ? stageData.debriefQuestions.join('\n') 
                    : (stageData.debriefQuestions || '');
            }
        }

        // Update Session Metadata in header / drawer
        const sessionTitleDisplay = document.getElementById('session-title-display');
        if (sessionTitleDisplay) {
            sessionTitleDisplay.textContent = session.title;
        }

        const sessionMetaLevel = document.getElementById('session-meta-level');
        if (sessionMetaLevel) {
            const lvl = LTA_FRAMEWORK.levels[session.level];
            sessionMetaLevel.textContent = lvl ? lvl.nameEn : session.level;
            sessionMetaLevel.style.backgroundColor = lvl?.badgeColor || '#3b82f6';
        }

        const sessionMetaSituation = document.getElementById('session-meta-situation');
        if (sessionMetaSituation) {
            sessionMetaSituation.textContent = `${sitDef.titleEn} • ${phaseDef.titleEn} • ${dirDef.titleEn}`;
        }

        const simScenarioTitle = document.getElementById('sim-scenario-title');
        if (simScenarioTitle) {
            const ballVars = (session.ballCharacteristics || []).map(b => b.charAt(0) + b.slice(1).toLowerCase()).join('+');
            const ballSuffix = ballVars ? ` [${ballVars}]` : '';
            simScenarioTitle.textContent = `${sitDef.titleEn} • ${phaseDef.titleEn} • ${dirDef.titleEn}${ballSuffix}`;
        }

        // Highlight active surface button
        surfaceButtons.forEach(btn => {
            if (btn.dataset.surface === court.surface) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update LTA Feed - Shot - Play methodology breakdown
        if (window.LTA_FRAMEWORK?.getFSPDescription) {
            const fspText = LTA_FRAMEWORK.getFSPDescription(
                session.situation || 'BOTH_BACK',
                session.phaseOfPlay || 'RALLY',
                session.tactic || 'CONTROL_SPACE',
                session.ballCharacteristics || ['DEPTH', 'DIRECTION'],
                currentStageKey,
                activeDir
            );
            const fspTextFeed = document.getElementById('fsp-text-feed');
            const fspTextShot = document.getElementById('fsp-text-shot');
            const fspTextPlay = document.getElementById('fsp-text-play');
            if (fspTextFeed) fspTextFeed.textContent = fspText.feed;
            if (fspTextShot) fspTextShot.textContent = fspText.shot;
            if (fspTextPlay) fspTextPlay.textContent = fspText.play;
        }

        // Ensure court 3D engine has full scenario metadata for live simulation
        if (court?.setScenarioMetadata) {
            court.setScenarioMetadata({
                situation: session.situation || 'BOTH_BACK',
                phaseOfPlay: session.phaseOfPlay || 'RALLY',
                tactic: session.tactic || 'CONTROL_SPACE',
                ballCharacteristics: session.ballCharacteristics || ['DEPTH', 'DIRECTION'],
                stageKey: currentStageKey,
                level: session.level || 'RED',
                shotDirection: activeDir
            });
        }
    }

    // 4. Save form changes back to stage
    function bindFormInputs() {
        const syncFormToStage = () => {
            const session = sessionMgr.activeSession;
            if (!session) return;
            const currentStageKey = sessionMgr.activeStageKey;
            const stageData = session.stages[currentStageKey];
            if (!stageData) return;

            stageData.goal = stageGoalInput.value;
            stageData.drillDescription = stageDrillInput.value;
            stageData.timeMinutes = parseInt(stageTimeInput.value, 10) || 10;

            const specValue = stageSpecificInput.value;
            if (currentStageKey === 'GAME_ASSESSMENT') {
                stageData.coachObservations = specValue;
            } else if (currentStageKey === 'DEMO_CLOSED' || currentStageKey === 'PROGRESSING_OPEN') {
                stageData.coachingCues = specValue.split('\n').filter(s => s.trim().length > 0);
            } else if (currentStageKey === 'GAME') {
                stageData.debriefQuestions = specValue.split('\n').filter(s => s.trim().length > 0);
            }
        };

        if (stageGoalInput) stageGoalInput.addEventListener('input', syncFormToStage);
        if (stageDrillInput) stageDrillInput.addEventListener('input', syncFormToStage);
        if (stageTimeInput) stageTimeInput.addEventListener('input', syncFormToStage);
        if (stageSpecificInput) stageSpecificInput.addEventListener('input', syncFormToStage);
    }
    bindFormInputs();

    // 5. Tactical Matrix Interactive Handlers
    matrixSituationButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!sessionMgr.activeSession) return;
            sessionMgr.activeSession.situation = btn.dataset.situation;
            sessionMgr.applyTacticalMatrixUpdate(true);
            updateUIForCurrentStage();
            window.tennisAudio?.playHit();
        });
    });

    matrixPhaseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!sessionMgr.activeSession) return;
            sessionMgr.activeSession.phaseOfPlay = btn.dataset.phase;
            sessionMgr.applyTacticalMatrixUpdate(true);
            updateUIForCurrentStage();
            window.tennisAudio?.playBounce();
        });
    });

    matrixTacticButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!sessionMgr.activeSession) return;
            sessionMgr.activeSession.tactic = btn.dataset.tactic;
            sessionMgr.applyTacticalMatrixUpdate(true);
            updateUIForCurrentStage();
            window.tennisAudio?.playClick();
        });
    });

    matrixDirectionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!sessionMgr.activeSession) return;
            sessionMgr.activeSession.shotDirection = btn.dataset.direction;
            let list = sessionMgr.activeSession.ballCharacteristics || [];
            if (!list.includes('DIRECTION')) {
                list.push('DIRECTION');
                sessionMgr.activeSession.ballCharacteristics = list;
            }
            sessionMgr.applyTacticalMatrixUpdate(true);
            updateUIForCurrentStage();
            window.tennisAudio?.playHit();
        });
    });

    matrixBallItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!sessionMgr.activeSession) return;
            const ballKey = item.dataset.ball;
            let list = sessionMgr.activeSession.ballCharacteristics || [];
            if (list.includes(ballKey)) {
                list = list.filter(b => b !== ballKey);
            } else {
                list.push(ballKey);
            }
            sessionMgr.activeSession.ballCharacteristics = list;
            sessionMgr.applyTacticalMatrixUpdate(true);
            updateUIForCurrentStage();
            window.tennisAudio?.playHit();
        });
    });

    // 6. Hourglass Tier Switch
    hourglassTiers.forEach(tier => {
        tier.addEventListener('click', () => {
            const stageKey = tier.dataset.stage;
            sessionMgr.setStage(stageKey);
            updateUIForCurrentStage();
        });
    });

    // 7. Surface Selector Buttons
    surfaceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const surfaceKey = btn.dataset.surface;
            court.setSurface(surfaceKey);
            if (sessionMgr.activeSession) {
                sessionMgr.activeSession.surface = surfaceKey;
            }
            surfaceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showToast(`Surface changed to ${LTA_FRAMEWORK.surfaces[surfaceKey].nameEn}`, 'info');
        });
    });

    // 8. Court Format Tabs (Full, Red 36ft, Orange 60ft)
    formatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const format = tab.dataset.format;
            court.setCourtFormat(format);
            formatTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            window.tennisAudio?.playClick();
        });
    });

    // 9. 3D Camera Preset Buttons
    cameraButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.camera;
            court.setCameraPreset(preset, true);
            cameraButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Stadium Lighting Toggle (Day / Night)
    document.getElementById('btn-toggle-lighting')?.addEventListener('click', function() {
        const mode = court.toggleLighting();
        this.innerHTML = mode === 'night'
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Night Session'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Day Sun';
        showToast(mode === 'night' ? 'Night Session stadium floodlights activated' : 'Daylight sun lighting activated', 'info');
    });

    // 10. Court Drawing Tools
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            court.setTool(tool);
            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.tennisAudio?.playClick();
        });
    });

    if (ballStyleSelect) {
        ballStyleSelect.addEventListener('change', (e) => {
            court.setBallPathStyle(e.target.value);
        });
    }

    // Action buttons on toolbar
    document.getElementById('btn-undo')?.addEventListener('click', () => court.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => court.redo());
    document.getElementById('btn-clear-court')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all items and vectors from the 3D court?')) {
            court.clearCourt();
            showToast('3D Court cleared', 'info');
        }
    });
    document.getElementById('btn-export-png')?.addEventListener('click', () => {
        court.exportPNG();
        showToast('High-resolution 3D diagram saved as PNG', 'success');
    });

    // 11. Element Palette (3D Items)
    paletteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const extra = {};
            if (btn.dataset.color) extra.color = btn.dataset.color;
            if (btn.dataset.label) extra.label = btn.dataset.label;
            if (btn.dataset.points) extra.points = parseInt(btn.dataset.points, 10);

            court.addItem(type, extra);
            showToast(`Added 3D ${type} to court`, 'info');
        });
    });

    // 12. Header Actions
    document.getElementById('btn-new-session')?.addEventListener('click', () => {
        if (confirm('Create a new blank LTA coaching session?')) {
            sessionMgr.createNewSession();
            updateUIForCurrentStage();
            showToast('New session created', 'success');
        }
    });

    document.getElementById('btn-save-session')?.addEventListener('click', () => {
        sessionMgr.saveCurrentSession();
        showToast('Session saved to library', 'success');
    });

    document.getElementById('btn-print-pdf')?.addEventListener('click', () => {
        sessionMgr.printSessionCard();
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
        sessionMgr.exportJSON();
        showToast('Session JSON file downloaded', 'success');
    });

    document.getElementById('btn-sound-toggle')?.addEventListener('click', function() {
        const enabled = window.tennisAudio.toggleSound();
        this.innerHTML = enabled 
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
        showToast(enabled ? 'Tennis sounds enabled' : 'Sounds muted', 'info');
    });

    // 13. Modal Handlers
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        window.tennisAudio?.playClick();
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
    }

    document.querySelectorAll('.modal-overlay .close-btn, .modal-overlay .btn-close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay);
        });
    });

    // Smart AI Generator Trigger
    document.getElementById('btn-open-generator')?.addEventListener('click', () => {
        openModal(generatorModal);
    });

    document.getElementById('btn-generate-ai')?.addEventListener('click', () => {
        const level = document.getElementById('gen-level').value;
        const situation = document.getElementById('gen-situation').value;
        const phaseOfPlay = document.getElementById('gen-phase').value;
        const tactic = document.getElementById('gen-tactic').value;
        const shotDirection = document.getElementById('gen-direction')?.value || 'CROSSCOURT';
        const capacity = document.getElementById('gen-capacity').value;
        const surface = document.getElementById('gen-surface').value;
        const topic = document.getElementById('gen-topic').value;
        const duration = document.getElementById('gen-duration').value;

        const generatedSession = window.smartLTAGenerator.generate({
            level,
            situation,
            phaseOfPlay,
            tactic,
            shotDirection,
            capacity,
            surface,
            customTopic: topic,
            duration
        });

        sessionMgr.loadSession(generatedSession);
        updateUIForCurrentStage();
        closeModal(generatorModal);
        showToast('Accredited 4-tier LTA session plan generated successfully!', 'success');
    });

    // Presets Library Trigger
    document.getElementById('btn-open-presets')?.addEventListener('click', () => {
        populatePresetsList();
        openModal(presetsModal);
    });

    function populatePresetsList() {
        const container = document.getElementById('presets-list-container');
        if (!container) return;

        container.innerHTML = '';
        window.LTA_PRESETS.forEach(preset => {
            const lvl = LTA_FRAMEWORK.levels[preset.level] || {};
            const sit = LTA_FRAMEWORK.situations[preset.situation] || {};
            const phase = LTA_FRAMEWORK.phasesOfPlay[preset.phaseOfPlay] || {};

            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span class="preset-badge" style="background:${lvl.badgeColor || '#3b82f6'}">${lvl.nameEn || preset.level}</span>
                        <span style="font-size:11px; background:${phase.color || '#10b981'}; color:#fff; padding:2px 6px; border-radius:4px; font-weight:800;">${phase.titleEn || 'RALLY'}</span>
                        <span style="font-size:12px; color:#94a3b8; font-weight:600;">${sit.titleEn}</span>
                    </div>
                    <strong style="font-size:14px; color:#f8fafc;">${preset.title}</strong>
                    <div style="font-size:12px; color:#94a3b8; margin-top:4px;">${preset.overview}</div>
                </div>
                <button class="btn btn-secondary" style="font-size:12px; white-space:nowrap;">Load Session</button>
            `;

            card.addEventListener('click', () => {
                sessionMgr.loadSession(preset);
                updateUIForCurrentStage();
                closeModal(presetsModal);
                showToast(`Loaded "${preset.title}"`, 'success');
            });

            container.appendChild(card);
        });
    }

    // Saved Sessions Trigger
    document.getElementById('btn-open-saved')?.addEventListener('click', () => {
        populateSavedList();
        openModal(savedModal);
    });

    function populateSavedList() {
        const container = document.getElementById('saved-list-container');
        if (!container) return;

        const list = sessionMgr.savedSessions;
        if (list.length === 0) {
            container.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:24px;">No saved sessions found. Click the "Save" button in the header to archive your session plans here.</p>';
            return;
        }

        container.innerHTML = '';
        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div>
                    <strong style="font-size:14px; color:#f8fafc;">${item.title}</strong>
                    <div style="font-size:11px; color:#94a3b8; margin-top:2px;">
                        Level: ${item.level} • Last Modified: ${new Date(item.updatedAt || Date.now()).toLocaleDateString('en-GB')}
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-secondary btn-load-saved" style="font-size:12px;">Load</button>
                    <button class="btn btn-secondary btn-delete-saved" style="font-size:12px; color:#ef4444;">Delete</button>
                </div>
            `;

            card.querySelector('.btn-load-saved').addEventListener('click', (e) => {
                e.stopPropagation();
                sessionMgr.loadSession(item);
                updateUIForCurrentStage();
                closeModal(savedModal);
                showToast(`Loaded "${item.title}"`, 'success');
            });

            card.querySelector('.btn-delete-saved').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                    sessionMgr.deleteSession(item.id);
                    populateSavedList();
                    showToast('Session deleted', 'info');
                }
            });

            container.appendChild(card);
        });
    }

    // Import JSON File
    const jsonFileInput = document.getElementById('import-json-file');
    if (jsonFileInput) {
        jsonFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const success = sessionMgr.importJSON(event.target.result);
                if (success) {
                    updateUIForCurrentStage();
                    closeModal(savedModal);
                    showToast('Session successfully imported from JSON', 'success');
                } else {
                    alert('Invalid session JSON structure.');
                }
            };
            reader.readAsText(file);
        });
    }

    // Toast Notification Utility
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderColor = type === 'success' ? '#10b981' : '#38bdf8';
        toast.innerHTML = `
            <span>${type === 'success' ? '✓' : 'ℹ'}</span>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
    // 3D Live Simulation & Video Player Controls
    function bindSimulationControls() {
        const simBtnPlay = document.getElementById('sim-btn-play');
        const simPlayIcon = document.getElementById('sim-play-icon');
        const simPlayLabel = document.getElementById('sim-play-label');
        const simLiveBadge = document.getElementById('sim-live-badge');
        const simBadgeText = document.getElementById('sim-badge-text');
        const simBtnRestart = document.getElementById('sim-btn-restart');
        const simScrubber = document.getElementById('sim-scrubber');
        const simTimeDisplay = document.getElementById('sim-time-display');
        const simSpeedButtons = document.querySelectorAll('.sim-speed-btn');
        const simBtnTrackingCam = document.getElementById('sim-btn-tracking-cam');
        const simBtnLoop = document.getElementById('sim-btn-loop');

        const formatTime = (sec) => {
            const m = Math.floor(sec / 60);
            const s = (sec % 60).toFixed(1);
            return `${m < 10 ? '0' : ''}${m}:${parseFloat(s) < 10 ? '0' : ''}${s}`;
        };

        if (simBtnPlay) {
            simBtnPlay.addEventListener('click', () => {
                if (court?.toggleSimulation) {
                    court.toggleSimulation();
                } else {
                    showToast('3D Simulation engine ready', 'info');
                }
            });
        }

        if (simBtnRestart) {
            simBtnRestart.addEventListener('click', () => {
                if (court?.restartSimulation) {
                    court.restartSimulation();
                }
            });
        }

        if (simScrubber) {
            let isUserScrubbing = false;
            simScrubber.addEventListener('mousedown', () => { isUserScrubbing = true; });
            simScrubber.addEventListener('touchstart', () => { isUserScrubbing = true; });
            
            simScrubber.addEventListener('input', (e) => {
                if (court?.seekSimulation) {
                    court.seekSimulation(parseFloat(e.target.value) / 100);
                }
            });

            simScrubber.addEventListener('mouseup', () => { isUserScrubbing = false; });
            simScrubber.addEventListener('touchend', () => { isUserScrubbing = false; });

            if (court) {
                court.onSimProgress = (time, duration, progress) => {
                    if (!isUserScrubbing) {
                        simScrubber.value = (progress * 100).toFixed(1);
                    }
                    if (simTimeDisplay) {
                        simTimeDisplay.textContent = `${formatTime(time)} / ${formatTime(duration)}`;
                    }
                };
            }
        }

        if (court) {
            court.onSimStateChange = (isRunning) => {
                if (simBtnPlay) {
                    simBtnPlay.classList.toggle('playing', isRunning);
                    if (simPlayLabel) simPlayLabel.textContent = isRunning ? 'Pause Simulation' : 'Play Live Scenario';
                    if (simPlayIcon) {
                        simPlayIcon.innerHTML = isRunning
                            ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
                            : '<polygon points="5 3 19 12 5 21 5 3"/>';
                    }
                }
                if (simLiveBadge) {
                    simLiveBadge.classList.toggle('paused', !isRunning);
                    if (simBadgeText) simBadgeText.textContent = isRunning ? 'LIVE 3D PLAY' : 'PAUSED';
                }
            };
        }

        simSpeedButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                simSpeedButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (court?.setSimulationSpeed) court.setSimulationSpeed(btn.dataset.speed);
                window.tennisAudio?.playClick();
            });
        });

        if (simBtnTrackingCam) {
            simBtnTrackingCam.addEventListener('click', () => {
                const isActive = simBtnTrackingCam.classList.toggle('active');
                if (court?.setTrackingCam) court.setTrackingCam(isActive);
                window.tennisAudio?.playClick();
            });
        }

        if (simBtnLoop) {
            simBtnLoop.addEventListener('click', () => {
                const isLoop = simBtnLoop.classList.toggle('active');
                if (court?.setSimulationLoop) court.setSimulationLoop(isLoop);
                window.tennisAudio?.playClick();
            });
        }

        // Real-time LTA Feed - Shot - Play Phase Highlight
        const fspPillFeed = document.getElementById('fsp-pill-feed');
        const fspPillShot = document.getElementById('fsp-pill-shot');
        const fspPillPlay = document.getElementById('fsp-pill-play');

        if (court) {
            court.onSimPhaseChange = (phase) => {
                if (fspPillFeed) fspPillFeed.classList.toggle('active', phase === 'FEED');
                if (fspPillShot) fspPillShot.classList.toggle('active', phase === 'SHOT');
                if (fspPillPlay) fspPillPlay.classList.toggle('active', phase === 'PLAY');
            };
        }

        // Spacebar shortcut to play/pause simulation
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (court?.toggleSimulation) court.toggleSimulation();
            }
        });
    }

    bindSimulationControls();

    // Initial render
    updateUIForCurrentStage();
});
