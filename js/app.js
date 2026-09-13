/**
 * LTA Coach Studio - Main Application Controller
 * Connects Canvas Engine, Session Manager, Hourglass 4-Tier UI, Modals & Audio
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Engines
    const court = new TennisCourtEngine('tennis-court-canvas');
    const sessionMgr = new LTASessionManager(court);

    window.court = court;
    window.sessionMgr = sessionMgr;

    // 2. UI Elements
    const surfaceButtons = document.querySelectorAll('.surface-btn');
    const formatTabs = document.querySelectorAll('.format-tab');
    const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
    const ballStyleSelect = document.getElementById('ball-path-style');
    const paletteButtons = document.querySelectorAll('.palette-item-btn');
    
    const hourglassTiers = document.querySelectorAll('.hourglass-tier');
    const stageTitleFa = document.getElementById('stage-title-fa');
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

        // Update Hourglass Visual Highlight
        hourglassTiers.forEach(tier => {
            if (tier.dataset.stage === currentStageKey) {
                tier.classList.add('active');
            } else {
                tier.classList.remove('active');
            }
        });

        // Update Stage Editor Texts
        if (stageTitleFa) stageTitleFa.textContent = stageDef.titleFa;
        if (stageTitleEn) stageTitleEn.textContent = stageDef.titleEn;
        if (stageDescription) stageDescription.textContent = stageDef.descriptionFa;

        if (stageGoalInput) stageGoalInput.value = stageData.goal || '';
        if (stageDrillInput) stageDrillInput.value = stageData.drillDescription || '';
        if (stageTimeInput) stageTimeInput.value = stageData.timeMinutes || 15;

        // Custom label & input based on stage type (from diagram)
        if (stageSpecificLabel && stageSpecificInput) {
            if (currentStageKey === 'GAME_ASSESSMENT') {
                stageSpecificLabel.textContent = 'مشاهدات مربی (Coach Observations):';
                stageSpecificInput.value = stageData.coachObservations || '';
            } else if (currentStageKey === 'DEMO_CLOSED') {
                stageSpecificLabel.textContent = 'نکات کلیدی فنی (Coaching Cues - با خط تیره جدا کنید):';
                stageSpecificInput.value = Array.isArray(stageData.coachingCues) 
                    ? stageData.coachingCues.join('\n') 
                    : (stageData.coachingCues || '');
            } else if (currentStageKey === 'PROGRESSING_OPEN') {
                stageSpecificLabel.textContent = 'تمرکز تصمیم‌گیری و متغیرها (Decisions & Constraints):';
                stageSpecificInput.value = Array.isArray(stageData.coachingCues) 
                    ? stageData.coachingCues.join('\n') 
                    : (stageData.coachingCues || '');
            } else if (currentStageKey === 'GAME') {
                stageSpecificLabel.textContent = 'پرسش‌های جمع‌بندی از بازیکن (Debrief Questions):';
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
            sessionMetaLevel.textContent = lvl ? lvl.nameFa : session.level;
            sessionMetaLevel.style.backgroundColor = lvl?.badgeColor || '#3b82f6';
        }

        const sessionMetaSituation = document.getElementById('session-meta-situation');
        if (sessionMetaSituation) {
            const sit = LTA_FRAMEWORK.situations[session.situation];
            sessionMetaSituation.textContent = sit ? sit.titleFa : session.situation;
        }

        // Highlight active surface button
        surfaceButtons.forEach(btn => {
            if (btn.dataset.surface === court.surface) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
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

    // 5. Hourglass Tier Switch
    hourglassTiers.forEach(tier => {
        tier.addEventListener('click', () => {
            const stageKey = tier.dataset.stage;
            sessionMgr.setStage(stageKey);
            updateUIForCurrentStage();
        });
    });

    // 6. Surface Buttons
    surfaceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const surfaceKey = btn.dataset.surface;
            court.setSurface(surfaceKey);
            if (sessionMgr.activeSession) {
                sessionMgr.activeSession.surface = surfaceKey;
            }
            surfaceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showToast(`سطح زمین به ${LTA_FRAMEWORK.surfaces[surfaceKey].nameFa.split('(')[0]} تغییر یافت`, 'info');
        });
    });

    // 7. Court Format Tabs
    formatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const format = tab.dataset.format;
            court.setCourtFormat(format);
            formatTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            window.tennisAudio?.playClick();
        });
    });

    // 8. Court Drawing Tools
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
        if (confirm('آیا از پاک کردن تمامی المان‌ها و رسم‌های زمین اطمینان دارید؟')) {
            court.clearCourt();
            showToast('زمین پاکسازی شد', 'info');
        }
    });
    document.getElementById('btn-export-png')?.addEventListener('click', () => {
        court.exportPNG();
        showToast('تصویر باکیفیت زمین ذخیره شد', 'success');
    });

    // 9. Element Palette (Drag & Drop Items)
    paletteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const extra = {};
            if (btn.dataset.color) extra.color = btn.dataset.color;
            if (btn.dataset.label) extra.label = btn.dataset.label;
            if (btn.dataset.points) extra.points = parseInt(btn.dataset.points, 10);

            court.addItem(type, extra);
        });
    });

    // 10. Header Actions
    document.getElementById('btn-new-session')?.addEventListener('click', () => {
        if (confirm('آیا می‌خواهید یک طرح درس جدید ایجاد کنید؟')) {
            sessionMgr.createNewSession();
            updateUIForCurrentStage();
            showToast('طرح درس جدید آماده شد', 'success');
        }
    });

    document.getElementById('btn-save-session')?.addEventListener('click', () => {
        sessionMgr.saveCurrentSession();
        showToast('طرح درس با موفقیت ذخیره شد', 'success');
    });

    document.getElementById('btn-print-pdf')?.addEventListener('click', () => {
        sessionMgr.printSessionCard();
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
        sessionMgr.exportJSON();
        showToast('فایل JSON سناریو دانلود شد', 'success');
    });

    document.getElementById('btn-sound-toggle')?.addEventListener('click', function() {
        const enabled = window.tennisAudio.toggleSound();
        this.innerHTML = enabled 
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
        showToast(enabled ? 'صداهای تنیس فعال شدند' : 'صداها بی‌صدا شدند', 'info');
    });

    // 11. Modal Handlers
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
        const capacity = document.getElementById('gen-capacity').value;
        const surface = document.getElementById('gen-surface').value;
        const topic = document.getElementById('gen-topic').value;
        const duration = document.getElementById('gen-duration').value;

        const generatedSession = window.smartLTAGenerator.generate({
            level,
            situation,
            capacity,
            surface,
            customTopic: topic,
            duration
        });

        sessionMgr.loadSession(generatedSession);
        updateUIForCurrentStage();
        closeModal(generatorModal);
        showToast('سناریوی ۴ مرحله‌ای استاندارد LTA با موفقیت تولید شد!', 'success');
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

            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span class="preset-badge" style="background:${lvl.badgeColor || '#3b82f6'}">${lvl.nameFa || preset.level}</span>
                        <span style="font-size:11px; color:#94a3b8;">${sit.titleFa}</span>
                    </div>
                    <strong style="font-size:14px; color:#f8fafc;">${preset.title}</strong>
                    <div style="font-size:12px; color:#94a3b8; margin-top:4px;">${preset.overview}</div>
                </div>
                <button class="btn btn-secondary" style="font-size:12px; white-space:nowrap;">بارگذاری سناریو</button>
            `;

            card.addEventListener('click', () => {
                sessionMgr.loadSession(preset);
                updateUIForCurrentStage();
                closeModal(presetsModal);
                showToast(`سناریوی "${preset.title}" بارگذاری شد`, 'success');
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
            container.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:20px;">هنوز طرح درسی ذخیره نشده است. با زدن دکمه ذخیره جلسه می‌توانید جلسات خود را اینجا بایگانی کنید.</p>';
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
                        سطح: ${item.level} • آخرین ویرایش: ${new Date(item.updatedAt || Date.now()).toLocaleDateString('fa-IR')}
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-secondary btn-load-saved" style="font-size:12px;">بارگذاری</button>
                    <button class="btn btn-secondary btn-delete-saved" style="font-size:12px; color:#ef4444;">حذف</button>
                </div>
            `;

            card.querySelector('.btn-load-saved').addEventListener('click', (e) => {
                e.stopPropagation();
                sessionMgr.loadSession(item);
                updateUIForCurrentStage();
                closeModal(savedModal);
                showToast(`طرح درس "${item.title}" بارگذاری شد`, 'success');
            });

            card.querySelector('.btn-delete-saved').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`آیا می‌خواهید "${item.title}" را حذف کنید؟`)) {
                    sessionMgr.deleteSession(item.id);
                    populateSavedList();
                    showToast('طرح درس حذف شد', 'info');
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
                    showToast('طرح درس با موفقیت ایمپورت شد', 'success');
                } else {
                    alert('ساختار فایل JSON معتبر نیست.');
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
    window.showToast = showToast;

    // Initial render
    updateUIForCurrentStage();
});
