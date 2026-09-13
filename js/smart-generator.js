/**
 * Smart LTA Session Generator
 * Algorithmic generator producing complete 4-tier LTA coaching plans based on:
 * - Stage/Level (Blue, Red, Orange, Green, Yellow)
 * - Game Situation (Serve, Return, Both Back, Approach/Net, Defend/Net)
 * - Capacity Focus (Tactical, Technical, Physical, Psychological)
 * - Topic / Custom Goal
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
            playersCount = '2 بازیکن'
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
            overview: `طرح درس تخصصی مهندسی‌شده بر اساس متدولوژی ۴ مرحله‌ای LTA بریتانیا با تمرکز بر ${capacityInfo.titleFa} در وضعیت ${situationInfo.titleFa} ویژه ${levelInfo.nameFa}.`,
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
                TACTICAL: 'هدف‌گیری زوایای باکس سرویس و استراتژی شروع امتیاز',
                TECHNICAL: 'اصلاح پرتاب توپ (Toss) و پرونیشن مچ در سرویس',
                PHYSICAL: 'انفجار پاها و ریتم پرش به داخل زمین در سرویس',
                MENTAL: 'مدیریت استرس سرویس دوم در موقعیت‌های بریک‌پوینت'
            },
            RETURN: {
                TACTICAL: 'خنثی‌سازی سرویس اول با ارسال عمیق به مرکز زمین',
                TECHNICAL: 'بک‌سوئینگ کوتاه و بلاک ضربه روی سرویس‌های سرعتی',
                PHYSICAL: 'اسپلیت-استپ پیش‌بینانه و واکنش انفجاری پاها',
                MENTAL: 'شجاعت هجومی برای گام نهادن داخل زمین در سرویس دوم'
            },
            BOTH_BACK: {
                TACTICAL: 'جابجا کردن حریف با تغییر زاویه کراس‌کورت و خط',
                TECHNICAL: 'تولید تاپ‌اسپین سنگین با حرکت Low-to-High راکت',
                PHYSICAL: 'استقامت هوازی در رالی‌های طولانی بالای ۱۰ ضربه',
                MENTAL: 'صبر هوشمندانه در رالی و پرهیز از شوت‌های زودهنگام پرخطر'
            },
            APPROACH_NET: {
                TACTICAL: 'شناسایی فرصت حمله روی توپ‌های کوتاه و وال‌کردن',
                TECHNICAL: 'تکنیک پانچ والی بدون سوئینگ و زاویه‌دهی صفحه راکت',
                PHYSICAL: 'شتاب اولیه برای رسیدن سریع به منطقه ترنزیشن تور',
                MENTAL: 'اعتماد به نفس در بستن تور و نترسیدن از پاسینگ‌شات'
            },
            DEFEND_NET: {
                TACTICAL: 'پاسینگ‌شات خطی یا لاب فورهند در شرایط اضطرار',
                TECHNICAL: 'دایپ‌کردن توپ (Dipping) دقیقاً جلوی پای بازیکن پای تور',
                PHYSICAL: 'تغییر جهت ناگهانی در انتهای زمین و اسلاید دفاعی',
                MENTAL: 'تمرکز و آرامش هنگام مواجهه با حریف هجومی پای تور'
            }
        };

        return titles[situation]?.[capacity] || `توسعه مهارت ${situation} در سطح ${level}`;
    }

    generateEquipment(level) {
        switch (level) {
            case 'BLUE':
                return 'توپ‌های فومی اسفنجی، راکت‌های ۱۷ تا ۱۹ اینچ، نردبان چابکی، دیسک‌های پرتابی رنگی';
            case 'RED':
                return 'توپ‌های نمدی قرمز LTA Stage 3، راکت ۱۹ تا ۲۱ اینچ، ۴ مخروط بزرگ، ۲ نشانه‌گذار نواری';
            case 'ORANGE':
                return 'توپ‌های نارنجی LTA Stage 2، راکت ۲۳ تا ۲۵ اینچ، سبد توپ، اهداف دایره‌ای ۵ و ۱۰ امتیازی';
            case 'GREEN':
                return 'توپ‌های سبز ۲۵٪ کندتر LTA Stage 1، راکت ۲۵ تا ۲۶ اینچ، نوارهای مرزی بیس‌لاین، مانع کوتاه';
            default:
                return 'توپ‌های استاندارد زرد LTA، راکت‌های تخصصی ۲۷ اینچ، سبد تغذیه، تارگت‌های نقطه‌ای بیس‌لاین و زون';
        }
    }

    buildAssessment(level, situation, capacity, title) {
        return {
            goal: `تشخیص الگوی فعلی و عادات ناخودآگاه بازیکن در وضعیت ${situation} قبل از هرگونه دخالت آموزشی.`,
            drillDescription: `شروع با بازی امتیازشماری زنده بین بازیکنان در موقعیت ${situation}. مربی در موقعیت ناظر ایستاده و آمادگی بازیکن در مواجهه با چالش "${title}" را ثبت می‌کند.`,
            coachObservations: 'آیا بازیکن زمان‌بندی مناسبی دارد؟ آیا تصمیم‌گیری تاکتیکی متناسب با موقعیت حریف و فضا است یا تک‌بعدی ضربه می‌زند؟',
            timeMinutes: 10,
            elements: [
                { type: 'player', id: 'p1', x: 0.45, y: 0.86, label: 'بازیکن A' },
                { type: 'player', id: 'p2', x: 0.55, y: 0.14, label: 'بازیکن B' },
                { type: 'coach', id: 'coach', x: 0.15, y: 0.50, label: 'مربی (ناظر)' }
            ],
            drawings: [
                { type: 'ball_path', from: { x: 0.45, y: 0.86 }, to: { x: 0.55, y: 0.14 }, style: 'solid', color: '#CCFF00', label: 'تبادل اولیه' }
            ]
        };
    }

    buildClosed(level, situation, capacity, title) {
        return {
            goal: `تثبیت الگوی حرکتی و بیومکانیک صحیح بدون حضور متغیرهای پیش‌بینی‌ناپذیر با فید ثابت مربی.`,
            drillDescription: `مربی با سبد توپ در موقعیت مناسب می‌ایستد. توپ‌ها با ریتم مشخص و یکنواخت فید می‌شوند. بازیکن روی ۳ نکته کلیدی کلامی (Cues) تمرکز کرده و سعی می‌کند توپ را در زون هدف بنشاند.`,
            coachingCues: [
                'آمادگی بدنی زودهنگام (Early Unit Turn): چرخش همزمان شانه و باسن قبل از پرش توپ.',
                'نقطه برخورد پایدار (Solid Contact Point): ضربه زدن به توپ در جلو بدن با دید مستقیم چشم به سیم‌ها.',
                'فالو ترو و بازگشت متعادل (Balance Recovery): پایان حرکت راکت و استقرار سریع پاها برای آماده‌باش.'
            ],
            timeMinutes: 20,
            elements: [
                { type: 'coach', id: 'coach', x: 0.35, y: 0.42, label: 'مربی' },
                { type: 'hopper', id: 'hop', x: 0.30, y: 0.41 },
                { type: 'player', id: 'p1', x: 0.45, y: 0.82, label: 'بازیکن' },
                { type: 'target', id: 't1', x: 0.70, y: 0.18, points: 5, color: '#10b981' },
                { type: 'cone', id: 'c1', x: 0.50, y: 0.82, color: '#f59e0b' }
            ],
            drawings: [
                { type: 'feed_path', from: { x: 0.35, y: 0.42 }, to: { x: 0.45, y: 0.80 }, style: 'dotted', color: '#facc15', label: 'فید کنترل‌شده' },
                { type: 'ball_path', from: { x: 0.45, y: 0.80 }, to: { x: 0.70, y: 0.18 }, style: 'solid', color: '#CCFF00', label: 'ارسال به تارگت' },
                { type: 'move_path', from: { x: 0.45, y: 0.82 }, to: { x: 0.50, y: 0.82 }, style: 'dashed', color: '#38bdf8', label: 'ریکاوری' }
            ]
        };
    }

    buildOpen(level, situation, capacity, title) {
        return {
            goal: `انتقال مهارت به جریان دینامیک بازی با اضافه کردن فشار تصمیم‌گیری (Decision Making) و حریف مقابل.`,
            drillDescription: `رالی پویا با شرایط ویژه LTA: بازیکن ۱ و ۲ در جریان رالی هستند. هر زمان که شرط خاصی پیش بیاید (مثلاً پرواز توپ بالای تور یا ورود به زون هدف)، بازیکن موظف است تصمیم تاکتیکی سریع اتخاذ کند.`,
            coachingCues: [
                'خواندن سرنخ‌های بصری از زبان بدن حریف',
                'تطبیق اندازه و سرعت گام‌ها با سرعت توپ ورودی'
            ],
            timeMinutes: 18,
            elements: [
                { type: 'player', id: 'p1', x: 0.40, y: 0.84, label: 'بازیکن ۱' },
                { type: 'player', id: 'p2', x: 0.60, y: 0.16, label: 'بازیکن ۲' },
                { type: 'target', id: 't1', x: 0.75, y: 0.20, points: 3 },
                { type: 'target', id: 't2', x: 0.25, y: 0.80, points: 3 }
            ],
            drawings: [
                { type: 'ball_path', from: { x: 0.40, y: 0.84 }, to: { x: 0.60, y: 0.16 }, style: 'solid', color: '#CCFF00', label: 'رالی دینامیک' },
                { type: 'ball_path', from: { x: 0.60, y: 0.16 }, to: { x: 0.75, y: 0.80 }, style: 'solid', color: '#f97316' },
                { type: 'move_path', from: { x: 0.40, y: 0.84 }, to: { x: 0.70, y: 0.82 }, style: 'dashed', color: '#38bdf8' }
            ]
        };
    }

    buildGame(level, situation, capacity, title) {
        return {
            goal: `آزمون نهایی انتقال یادگیری به شرایط واقعی مسابقه با سیستم امتیازشماری تشویقی (Bonus Scoring).`,
            drillDescription: `گیم‌های مسابقه‌ای با سرویس نوبتی. هر بار که بازیکنی با موفقیت ضربه آموخته‌شده را در شرایط مسابقه اجرا کند و به هدف بنشاند، امتیاز دوبل یا ۲ امتیاز تشویقی می‌گیرد.`,
            debriefQuestions: [
                'امروز در موقعیت‌های حساس چقدر تونستی تکنیک جدید رو به یاد بیاری؟',
                'وقتی حریف تو رو تحت فشار گذاشت، چه نشانه‌ای کمکت کرد ضربه درست رو انتخاب کنی؟',
                'برای جلسه آینده چه هدفی رو برای خودت اولویت قرار می‌دی؟'
            ],
            timeMinutes: 12,
            elements: [
                { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'بازیکن ۱' },
                { type: 'player', id: 'p2', x: 0.55, y: 0.12, label: 'بازیکن ۲' },
                { type: 'coach', id: 'coach', x: 0.88, y: 0.50, label: 'مربی (ارزیاب)' }
            ],
            drawings: [
                { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.25, y: 0.18 }, style: 'solid', color: '#CCFF00', label: 'ضربه امتیاز مسابقه' }
            ]
        };
    }
}

window.smartLTAGenerator = new SmartLTAGenerator();
