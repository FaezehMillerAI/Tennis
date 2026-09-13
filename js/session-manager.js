/**
 * LTA Session Manager
 * Handles session state, stage transitions (Hourglass 4-Tier Model),
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
            const raw = localStorage.getItem('lta_coach_sessions');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load sessions from storage', e);
            return [];
        }
    }

    saveSessionsToStorage() {
        try {
            localStorage.setItem('lta_coach_sessions', JSON.stringify(this.savedSessions));
        } catch (e) {
            console.error('Failed to save sessions to storage', e);
        }
    }

    loadSession(sessionData) {
        // Deep copy
        this.activeSession = JSON.parse(JSON.stringify(sessionData));

        // Sync surface if specified
        if (this.activeSession.surface && this.court) {
            this.court.setSurface(this.activeSession.surface);
        }

        // Set to stage 1 (Game Assessment)
        this.setStage('GAME_ASSESSMENT', false);
    }

    // Switch between the 4 hourglass stages
    setStage(stageKey, saveCurrent = true) {
        if (!this.activeSession) return;

        // Save current canvas to current stage
        if (saveCurrent && this.court && this.activeSession.stages[this.activeStageKey]) {
            const currentData = this.court.getCurrentPhaseData();
            this.activeSession.stages[this.activeStageKey].elements = currentData.elements;
            this.activeSession.stages[this.activeStageKey].drawings = currentData.drawings;
        }

        this.activeStageKey = stageKey;

        // Load stage data into court
        const stageData = this.activeSession.stages[stageKey];
        if (stageData && this.court) {
            this.court.loadPhase(stageData);
        }

        window.tennisAudio?.playBounce();
    }

    // Save active session to library
    saveCurrentSession() {
        if (!this.activeSession) return;

        // Sync active court to active stage
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

    // Create new blank session
    createNewSession() {
        const newSession = {
            id: 'session_' + Date.now(),
            title: 'جلسه تمرینی جدید LTA',
            level: 'YELLOW_INT',
            situation: 'BOTH_BACK',
            capacity: 'TECHNICAL',
            surface: this.court ? this.court.surface : 'hard_blue',
            duration: 60,
            playersCount: '2 بازیکن',
            equipment: 'توپ استاندارد زرد، ۴ مخروط، تارگت‌های نقطه‌ای',
            overview: 'طراحی سناریوی آموزشی بر اساس ۴ مرحله استاندارد LTA.',
            stages: {
                GAME_ASSESSMENT: {
                    goal: 'ارزیابی مهارت اولیه بازیکن در جریان بازی واقعی.',
                    drillDescription: 'بازی امتیازی کوتاه برای شناسایی نیاز تکنیکی یا تاکتیکی.',
                    coachObservations: 'رفتار و تصمیم‌گیری بازیکن زیر نظر گرفته شود.',
                    timeMinutes: 10,
                    elements: [],
                    drawings: []
                },
                DEMO_CLOSED: {
                    goal: 'ایزوله‌سازی مهارت و تمرین بسته با فید یکنواخت مربی.',
                    drillDescription: 'نمایش شفاف تکنیک همراه با Cues و تکرار در شرایط کنترل‌شده.',
                    coachingCues: ['آمادگی زودهنگام', 'ضربه در جلوی بدن', 'پایان حرکت کامل'],
                    timeMinutes: 20,
                    elements: [],
                    drawings: []
                },
                PROGRESSING_OPEN: {
                    goal: 'توسعه به رالی باز و تقویت تصمیم‌گیری تاکتیکی.',
                    drillDescription: 'رالی پویا با محدودیت‌های هدفمند و تغییر سرعت و جهت.',
                    coachingCues: ['خواندن مسیر توپ حریف', 'انتخاب هوشمندانه شوت'],
                    timeMinutes: 20,
                    elements: [],
                    drawings: []
                },
                GAME: {
                    goal: 'بازگشت به شرایط مسابقه برای سنجش کاربرد مهارت.',
                    drillDescription: 'مسابقه با سیستم امتیازدهی ویژه برای موفقیت در مهارت آموخته‌شده.',
                    debriefQuestions: ['چه زمانی احساس تسلط بیشتری داشتی؟', 'هدف بعدی چیست؟'],
                    timeMinutes: 10,
                    elements: [],
                    drawings: []
                }
            }
        };

        this.loadSession(newSession);
        return newSession;
    }

    // Delete session
    deleteSession(sessionId) {
        this.savedSessions = this.savedSessions.filter(s => s.id !== sessionId);
        this.saveSessionsToStorage();
    }

    // Export to JSON
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

    // Import from JSON
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

    // Prepare and launch Print / PDF view
    printSessionCard() {
        if (!this.activeSession) return;

        // Ensure current stage is synced
        if (this.court && this.activeSession.stages[this.activeStageKey]) {
            const currentData = this.court.getCurrentPhaseData();
            this.activeSession.stages[this.activeStageKey].elements = currentData.elements;
            this.activeSession.stages[this.activeStageKey].drawings = currentData.drawings;
        }

        // Capture court snapshot image
        const courtDataUrl = this.court ? this.court.canvas.toDataURL('image/png') : '';
        const levelInfo = LTA_FRAMEWORK.levels[this.activeSession.level] || {};
        const situationInfo = LTA_FRAMEWORK.situations[this.activeSession.situation] || {};
        const capacityInfo = LTA_FRAMEWORK.capacities[this.activeSession.capacity] || {};
        const surfaceInfo = LTA_FRAMEWORK.surfaces[this.activeSession.surface || 'hard_blue'] || {};

        const stages = this.activeSession.stages;

        // Populate dedicated print container
        const printContainer = document.getElementById('print-container');
        if (!printContainer) return;

        printContainer.innerHTML = `
            <div class="print-page">
                <div class="print-header">
                    <div>
                        <div class="print-brand">
                            <span class="lta-logo-badge">LTA</span>
                            <span>طرح درس مربیگری تنیس بریتانیا | Lawn Tennis Association</span>
                        </div>
                        <h1 class="print-title">${this.activeSession.title}</h1>
                    </div>
                    <div class="print-meta-grid">
                        <div><strong>سطح / سن:</strong> ${levelInfo.nameFa || this.activeSession.level}</div>
                        <div><strong>وضعیت بازی:</strong> ${situationInfo.titleFa || this.activeSession.situation}</div>
                        <div><strong>ظرفیت عملکردی:</strong> ${capacityInfo.titleFa || this.activeSession.capacity}</div>
                        <div><strong>سطح زمین:</strong> ${surfaceInfo.nameFa || 'هاردکورت'}</div>
                        <div><strong>مدت جلسه:</strong> ${this.activeSession.duration} دقیقه</div>
                        <div><strong>تعداد بازیکنان:</strong> ${this.activeSession.playersCount || '۲ بازیکن'}</div>
                    </div>
                </div>

                <div class="print-body">
                    <div class="print-court-section">
                        <div class="print-section-title">دیاگرام زمین و چیدمان تاکتیکی (${LTA_FRAMEWORK.stages[this.activeStageKey]?.titleFa})</div>
                        <img src="${courtDataUrl}" class="print-court-img" alt="Court Diagram" />
                        <div class="print-equipment"><strong>تجهیزات مورد نیاز:</strong> ${this.activeSession.equipment || 'توپ و راکت'}</div>
                    </div>

                    <div class="print-hourglass-section">
                        <div class="print-section-title">مراحل ۴گانه درس بر اساس ساختار ساعت‌شنی LTA</div>
                        
                        <!-- 1. Game Assessment -->
                        <div class="print-stage-box stage-1">
                            <div class="print-stage-header">
                                <span class="stage-num">۱</span>
                                <strong>Game Assessment (ارزیابی اولیه در بازی)</strong>
                                <span class="stage-time">${stages.GAME_ASSESSMENT?.timeMinutes || 10} دقیقه</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>هدف:</strong> ${stages.GAME_ASSESSMENT?.goal || '-'}</p>
                                <p><strong>شرح تمرین:</strong> ${stages.GAME_ASSESSMENT?.drillDescription || '-'}</p>
                                <p><strong>مشاهدات مربی:</strong> ${stages.GAME_ASSESSMENT?.coachObservations || '-'}</p>
                            </div>
                        </div>

                        <!-- 2. Demo / Teaching Closed -->
                        <div class="print-stage-box stage-2">
                            <div class="print-stage-header">
                                <span class="stage-num">۲</span>
                                <strong>Demo / Teaching Closed (آموزش و تمرین بسته)</strong>
                                <span class="stage-time">${stages.DEMO_CLOSED?.timeMinutes || 20} دقیقه</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>هدف:</strong> ${stages.DEMO_CLOSED?.goal || '-'}</p>
                                <p><strong>شرح تمرین:</strong> ${stages.DEMO_CLOSED?.drillDescription || '-'}</p>
                                <p><strong>نکات کلیدی (Cues):</strong> ${(stages.DEMO_CLOSED?.coachingCues || []).join(' | ')}</p>
                            </div>
                        </div>

                        <!-- 3. Progressing Open -->
                        <div class="print-stage-box stage-3">
                            <div class="print-stage-header">
                                <span class="stage-num">۳</span>
                                <strong>Progressing Open (پیشرفت و تمرین باز)</strong>
                                <span class="stage-time">${stages.PROGRESSING_OPEN?.timeMinutes || 18} دقیقه</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>هدف:</strong> ${stages.PROGRESSING_OPEN?.goal || '-'}</p>
                                <p><strong>شرح تمرین:</strong> ${stages.PROGRESSING_OPEN?.drillDescription || '-'}</p>
                                <p><strong>تمرکز تصمیم‌گیری:</strong> ${(stages.PROGRESSING_OPEN?.coachingCues || []).join(' | ')}</p>
                            </div>
                        </div>

                        <!-- 4. Game -->
                        <div class="print-stage-box stage-4">
                            <div class="print-stage-header">
                                <span class="stage-num">۴</span>
                                <strong>Game (بازی پایانی و سنجش نهایی)</strong>
                                <span class="stage-time">${stages.GAME?.timeMinutes || 12} دقیقه</span>
                            </div>
                            <div class="print-stage-content">
                                <p><strong>قانون مسابقه:</strong> ${stages.GAME?.drillDescription || '-'}</p>
                                <p><strong>پرسش‌های جمع‌بندی (Debrief):</strong> ${(stages.GAME?.debriefQuestions || []).join(' | ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="print-footer">
                    <span>LTA Coach Studio • طراحی‌شده بر مبنای استانداردهای فدراسیون تنیس بریتانیا (Lawn Tennis Association)</span>
                    <span>تاریخ تهیه: ${new Date().toLocaleDateString('fa-IR')}</span>
                </div>
            </div>
        `;

        window.tennisAudio?.playWhistle();
        setTimeout(() => {
            window.print();
        }, 150);
    }
}

window.LTASessionManager = LTASessionManager;
