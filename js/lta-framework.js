/**
 * LTA Framework & Standards Data Model
 * Incorporating LTA Lesson Structure (Hourglass / Funnel model from user diagram),
 * LTA Youth Stages, 5 Game Situations, and 4 Performance Capacities.
 */

const LTA_FRAMEWORK = {
    // 4-Tier Lesson Structure (Hourglass Model from diagram)
    stages: {
        GAME_ASSESSMENT: {
            id: 'GAME_ASSESSMENT',
            titleFa: 'ارزیابی اولیه در بازی (Game Assessment)',
            titleEn: 'Game Assessment',
            color: '#1E3A8A', // Dark Navy Blue as in diagram
            icon: 'eye',
            stepNumber: 1,
            descriptionFa: 'شروع با سناریوی واقعی مسابقه برای تشخیص نقطه ضعف، نیاز فنی یا چالش تاکتیکی بازیکن.',
            descriptionEn: 'Start with a relevant game context to observe player tendencies and identify priority.',
            coachFocus: 'مشاهده بازیکن بدون دخالت سریع، ارزیابی تصمیم‌گیری و مکانیک ضربه در شرایط واقعی.',
            keyQuestions: [
                'آیا بازیکن زود تصمیم می‌گیرد یا دیر؟',
                'نقطه برخورد توپ کجاست؟ (جلو، عقب، بالا، پایین)',
                'آیا ریکاوری به مرکز زمین درست انجام می‌شود؟'
            ]
        },
        DEMO_CLOSED: {
            id: 'DEMO_CLOSED',
            titleFa: 'آموزش و تمرین بسته (Demo / Teaching Closed)',
            titleEn: 'Demo / Teaching (Closed)',
            color: '#3B82F6', // Lighter Blue
            icon: 'graduation-cap',
            stepNumber: 2,
            descriptionFa: 'نمایش شفاف و تدریس مهارت با فید ثابت و بدون عدم قطعیت برای تثبیت حافظه عضلانی و بیومکانیک.',
            descriptionEn: 'Clear demo & isolated technical practice with repetitive, controlled feeds.',
            coachFocus: 'ارائه نکات کلیدی کلامی و بصری (What, When, How, Why)، اصلاح گریپ، زاویه راکت و گام‌ها.',
            keyQuestions: [
                'آیا نشانه‌های کلیدی (Coaching Cues) کوتاه و به یادماندنی هستند؟',
                'آیا تکرار کافی با موفقیت بالای ۷۰٪ انجام می‌شود؟'
            ]
        },
        PROGRESSING_OPEN: {
            id: 'PROGRESSING_OPEN',
            titleFa: 'پیشرفت و تمرین باز (Progressing Open)',
            titleEn: 'Progressing (Open)',
            color: '#2563EB', // Royal Vibrant Blue
            icon: 'trending-up',
            stepNumber: 3,
            descriptionFa: 'افزایش پویایی، تصمیم‌گیری، حرکت در زمین و شبیه‌سازی رالی زنده با محدودیت‌ها و قوانین متغیر.',
            descriptionEn: 'Increasing variability, decision making, court movement and dynamic rallies.',
            coachFocus: 'هدایت بازیکن به "چه زمانی" و "به کجا" زدن توپ بر مبنای حریف و فضا، اعمال سناریوهای مشروط.',
            keyQuestions: [
                'اگر توپ حریف کوتاه بود بازیکن چه تصمیمی می‌گیرد؟',
                'آیا بازیکن تحت فشار زمان و فضا تکنیک را حفظ می‌کند؟'
            ]
        },
        GAME: {
            id: 'GAME',
            titleFa: 'بازی و ارزیابی نهایی (Game)',
            titleEn: 'Game',
            color: '#1E3A8A', // Base Navy Blue
            icon: 'trophy',
            stepNumber: 4,
            descriptionFa: 'بازگشت به مسابقه با امتیازشماری ویژه (Bonus Point) و سنجش نهایی انتقال مهارت به بازی واقعی.',
            descriptionEn: 'Return to competitive play to verify skill transfer and strategic execution.',
            coachFocus: 'تشویق به اجرای مهارت زیر فشار امتیاز، ثبت پیشرفت، بازخورد پایانی و پرسش‌های جمع‌بندی.',
            keyQuestions: [
                'آیا بازیکن در امتیازات حساس از مهارت آموزش‌داده‌شده استفاده کرد؟',
                'نتیجه یادگیری بازیکن برای جلسات آتی چیست؟'
            ]
        }
    },

    // LTA Youth & Adult Player Stages
    levels: {
        BLUE: {
            id: 'BLUE',
            nameFa: 'رده آبی LTA Blue (۴ تا ۶ سال)',
            nameEn: 'LTA Youth Blue (Ages 4-6)',
            ballType: 'توپ فومی بزرگ (Sponge/Foam)',
            racketSize: '17 تا 19 اینچ',
            courtSize: 'مینی کورت ۱/۴ با تور کوتاه',
            badgeColor: '#0ea5e9',
            description: 'آشنایی اولیه با راکت، غلتاندن توپ، ردیابی چشمی، هماهنگی عصب و عضله، دویدن و پرش با بازی‌های سرگرم‌کننده.'
        },
        RED: {
            id: 'RED',
            nameFa: 'رده قرمز LTA Red (۶ تا ۸ سال)',
            nameEn: 'LTA Youth Red (Ages 6-8)',
            ballType: 'توپ قرمز رد (۷۵٪ کندتر از توپ استاندارد)',
            racketSize: '19 تا 21 اینچ',
            courtSize: 'زمین ۳۶ فوتی (۱۱ متر عرضی)',
            badgeColor: '#ef4444',
            description: 'یادگیری رالی ساده از روی تور، تکنیک ضربات اولیه، فورهند و بک‌هند پایه، سرویس از بالا و حرکت به طرفین.'
        },
        ORANGE: {
            id: 'ORANGE',
            nameFa: 'رده نارنجی LTA Orange (۸ تا ۹ سال)',
            nameEn: 'LTA Youth Orange (Ages 8-9)',
            ballType: 'توپ نارنجی (۵۰٪ کندتر)',
            racketSize: '23 تا 25 اینچ',
            courtSize: 'زمین ۶۰ فوتی (۱۸ متر)',
            badgeColor: '#f97316',
            description: 'توسعه تاب کامل راکت، پیش‌بینی مسیر توپ حریف، ضربات پای تور و والی، کنترل عمق و زاویه ضربات.'
        },
        GREEN: {
            id: 'GREEN',
            nameFa: 'رده سبز LTA Green (۹ تا ۱۰ سال)',
            nameEn: 'LTA Youth Green (Ages 9-10)',
            ballType: 'توپ سبز (۲۵٪ کندتر)',
            racketSize: '25 تا 26 اینچ',
            courtSize: 'زمین کامل (Full Court)',
            badgeColor: '#10b981',
            description: 'انتقال به زمین استاندارد کامل، ضربات چرخشی تاپ‌اسپین، سرویس دوم با چرخش، استراتژی‌های حمله و دفاع.'
        },
        YELLOW_BEG: {
            id: 'YELLOW_BEG',
            nameFa: 'بزرگسالان / زرد مبتدی (Beginner)',
            nameEn: 'Yellow Ball - Beginner',
            ballType: 'توپ زرد استاندارد',
            racketSize: '27 اینچ استاندارد',
            courtSize: 'زمین کامل',
            badgeColor: '#eab308',
            description: 'شروع تنیس استاندارد، یادگیری ضربات پایه زمینی، ثبات در سرویس و ریترن، جاگیری مناسب در زمین.'
        },
        YELLOW_INT: {
            id: 'YELLOW_INT',
            nameFa: 'بزرگسالان / زرد متوسط (Intermediate)',
            nameEn: 'Yellow Ball - Intermediate',
            ballType: 'توپ زرد استاندارد',
            racketSize: '27 اینچ',
            courtSize: 'زمین کامل',
            badgeColor: '#8b5cf6',
            description: 'کنترل ریتم بازی، افزایش سرعت، بازی هدفمند کراس و خط، تکنیک‌های اسلایس و فوت‌ورک پیشرفته.'
        },
        YELLOW_ADV: {
            id: 'YELLOW_ADV',
            nameFa: 'پیشرفته / قهرمانی (Advanced & Performance)',
            nameEn: 'Yellow Ball - Advanced / Performance',
            ballType: 'توپ زرد استاندارد تورنمنتی',
            racketSize: '27 اینچ تخصصی',
            courtSize: 'زمین کامل',
            badgeColor: '#ec4899',
            description: 'تاکتیک‌های تخصصی مسابقه، تنوع ضربه، ضربات تحت فشار بالا، الگوهای امتیازگیری +1، آمادگی روانی و بدنی.'
        }
    },

    // LTA 5 Game Situations
    situations: {
        SERVE: {
            id: 'SERVE',
            titleFa: '۱. سرویس زدن (Serving)',
            titleEn: 'Serving',
            icon: 'zap',
            tacticalGoal: 'شروع نقطه با برتری تهاجمی، دقت به زوایای باکس، سرویس اول و دوم با تنوع چرخش.'
        },
        RETURN: {
            id: 'RETURN',
            titleFa: '۲. بازگرداندن سرویس (Returning)',
            titleEn: 'Returning',
            icon: 'shield',
            tacticalGoal: 'خنثی‌سازی برتری حریف، ارسال توپ عمیق به وسط یا حمله به سرویس‌های ضعیف دوم.'
        },
        BOTH_BACK: {
            id: 'BOTH_BACK',
            titleFa: '۳. رالی از انتهای زمین (Both at Baseline)',
            titleEn: 'Both at Baseline',
            icon: 'repeat',
            tacticalGoal: 'کنترل ۵ فاکتور پرتاب (جهت، عمق، ارتفاع، سرعت، اسپین) و جابجا کردن حریف برای ایجاد فضا.'
        },
        APPROACH_NET: {
            id: 'APPROACH_NET',
            titleFa: '۴. حمله و بازی پای تور (Approaching & at Net)',
            titleEn: 'Approaching & at Net',
            icon: 'arrow-up-right',
            tacticalGoal: 'ورود سریع به زمین روی توپ‌های کوتاه، ضربات اپروچ، بستن زاویه‌ها و فینیش با والی یا اسمش.'
        },
        DEFEND_NET: {
            id: 'DEFEND_NET',
            titleFa: '۵. دفاع مقابل بازیکن تور (Passing & Defending)',
            titleEn: 'Defending against Net Player',
            icon: 'crosshair',
            tacticalGoal: 'پاسینگ شات‌های تیز زمینی، شوت‌های پرشی، لاب‌های تاپ‌اسپین عمیق و ضربات قوس‌دار پای حریف.'
        }
    },

    // LTA 4 Performance Capacities
    capacities: {
        TACTICAL: {
            id: 'TACTICAL',
            titleFa: 'تاکتیکی (Tactical)',
            titleEn: 'Tactical',
            badgeColor: '#3b82f6',
            description: 'تشخیص فضا و زمان، انتخاب ضربه، خواندن بازی حریف و استراتژی.'
        },
        TECHNICAL: {
            id: 'TECHNICAL',
            titleFa: 'تکنیکی (Technical)',
            titleEn: 'Technical',
            badgeColor: '#10b981',
            description: 'بیومکانیک دست و راکت، گریپ، نقطه برخورد، چرخش مچ و تعقیب ضربه.'
        },
        PHYSICAL: {
            id: 'PHYSICAL',
            titleFa: 'آمادگی جسمانی (Physical)',
            titleEn: 'Physical',
            badgeColor: '#f59e0b',
            description: 'چابکی، تعادل، هماهنگی، سرعت واکنش، بازی پا (Footwork) و استقامت.'
        },
        MENTAL: {
            id: 'MENTAL',
            titleFa: 'روانی و ذهنی (Psychological)',
            titleEn: 'Psychological',
            badgeColor: '#8b5cf6',
            description: 'تمرکز، آرامش زیر فشار، انگیزه، خودباوری و پذیرش اشتباهات.'
        }
    },

    // Court Surfaces
    surfaces: {
        grass: {
            id: 'grass',
            nameFa: 'چمن طبیعی ویمبلدون (Wimbledon Grass)',
            nameEn: 'Wimbledon Grass',
            courtColor: '#1e5f38',
            surroundColor: '#154528',
            lineColor: '#FFFFFF',
            speed: 'سریع (Fast) | پرش کوتاه و لغزنده',
            accentColor: '#10b981'
        },
        clay: {
            id: 'clay',
            nameFa: 'خاک رس رولان گاروس (Roland Garros Clay)',
            nameEn: 'Roland Garros Clay',
            courtColor: '#C45731',
            surroundColor: '#9C3E1F',
            lineColor: '#FFFFFF',
            speed: 'کند (Slow) | پرش بلند و چرخش سنگین',
            accentColor: '#f97316'
        },
        hard_blue: {
            id: 'hard_blue',
            nameFa: 'هاردکورت آبی US Open (DecoTurf)',
            nameEn: 'US Open Hard Court',
            courtColor: '#195B9C',
            surroundColor: '#286B43',
            lineColor: '#FFFFFF',
            speed: 'متوسط-سریع (Medium-Fast) | پرش یکنواخت و استاندارد',
            accentColor: '#38bdf8'
        },
        hard_aus: {
            id: 'hard_aus',
            nameFa: 'هاردکورت استرالیا (Australian Open Blue)',
            nameEn: 'Australian Open Blue',
            courtColor: '#0085C7',
            surroundColor: '#00588A',
            lineColor: '#FFFFFF',
            speed: 'متوسط (Medium) | پرش شفاف و بدون لغزش',
            accentColor: '#0284c7'
        },
        carpet: {
            id: 'carpet',
            nameFa: 'کارپت و کفپوش سالن (Indoor Carpet)',
            nameEn: 'Indoor Carpet',
            courtColor: '#1E293B',
            surroundColor: '#0F172A',
            lineColor: '#E2E8F0',
            speed: 'بسیار سریع (Very Fast) | سرعت بالای تبادل توپ',
            accentColor: '#94a3b8'
        }
    }
};

window.LTA_FRAMEWORK = LTA_FRAMEWORK;
