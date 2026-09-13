/**
 * LTA Pre-loaded Standard Drills & Sessions Library
 * Curated authentic LTA sessions adhering to the 4-tier Hourglass structure.
 */

const LTA_PRESETS = [
    {
        id: 'red_crosscourt_recovery',
        title: 'رالی کراس‌کورت و بازگشت به مرکز (Crosscourt & Recovery)',
        level: 'RED',
        situation: 'BOTH_BACK',
        capacity: 'PHYSICAL',
        surface: 'hard_blue',
        duration: 45,
        playersCount: '2 تا 4 بازیکن',
        equipment: 'توپ قرمز رد (Stage 3)، راکت 19-21 اینچ، 4 مخروط رنگی، 2 دیسک نشانه‌گذار، نردبان چابکی',
        overview: 'آموزش ضربه زدن به صورت قطری (کراس‌کورت) و بازیابی سریع وضعیت به نقطه تعادل (Recovery Step) در زمین مینی ۳۶ فوتی.',
        
        stages: {
            GAME_ASSESSMENT: {
                goal: 'مشاهده توانایی بازیکنان در نگه داشتن رالی در زاویه قطری و وضعیت ایستادن بعد از ضربه.',
                drillDescription: 'بازی ۲ نفره در کورت قطری قرمز. بازیکنان از پشت خط شروع کرده و سعی می‌کنند رالی را ادامه دهند.',
                coachObservations: 'آیا بازیکن بعد از ضربه در همان گوشه می‌ماند یا به سمت وسط گام ریکاوری برمی‌دارد؟ آیا به توپ نگاه می‌کند؟',
                timeMinutes: 10,
                elements: [
                    { type: 'player', id: 'p1', x: 0.35, y: 0.85, label: 'بازیکن ۱' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.15, label: 'بازیکن ۲' },
                    { type: 'ball', id: 'b1', x: 0.36, y: 0.83 },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.85, color: '#f59e0b' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.35, y: 0.83 }, to: { x: 0.65, y: 0.17 }, style: 'solid', color: '#CCFF00', label: 'رالی قطری' },
                    { type: 'move_path', from: { x: 0.35, y: 0.85 }, to: { x: 0.48, y: 0.85 }, style: 'dashed', color: '#38bdf8', label: 'ریکاوری' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'آموزش گام ریکاوری و جهت‌دهی صفحه راکت به سمت کراس با فید ثابت مربی.',
                drillDescription: 'مربی در کنار تور با سبد توپ می‌ایستد و توپ‌های آرام و یکنواخت به گوشه فورهند بازیکن می‌اندازد. بازیکن ضربه را زده و بلافاصله با گام‌های کنارپا (Side-shuffle) دور مخروط مرکزی می‌چرخد.',
                coachingCues: [
                    'آمادگی زودرس: راکت را قبل از پرش توپ عقب ببر.',
                    'نقطه برخورد: توپ را جلوی پای راهنما بزن.',
                    'پوشش مرکز: بعد از فالوترو، ۳ گام ساید-شافل به مرکز زمین.'
                ],
                timeMinutes: 15,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.45, y: 0.45, label: 'مربی' },
                    { type: 'hopper', id: 'hop', x: 0.40, y: 0.44 },
                    { type: 'player', id: 'p1', x: 0.32, y: 0.82, label: 'بازیکن' },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.82, color: '#f97316' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.20, points: 5, color: '#10b981' },
                    { type: 'cone', id: 'c2', x: 0.75, y: 0.25, color: '#ef4444' }
                ],
                drawings: [
                    { type: 'feed_path', from: { x: 0.43, y: 0.46 }, to: { x: 0.33, y: 0.80 }, style: 'dotted', color: '#facc15', label: 'فید مربی' },
                    { type: 'ball_path', from: { x: 0.32, y: 0.80 }, to: { x: 0.70, y: 0.20 }, style: 'solid', color: '#CCFF00', label: 'ضربه به هدف' },
                    { type: 'move_path', from: { x: 0.32, y: 0.82 }, to: { x: 0.48, y: 0.82 }, style: 'dashed', color: '#38bdf8', label: 'گام بازگشت' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'رالی مشارکتی ۲ نفره با تغییر مداوم جهت و شرط بازگشت به پشت مخروط.',
                drillDescription: 'دو بازیکن در زمین رالی می‌کنند. هر بار که بازیکن به توپ ضربه می‌زند، قبل از ضربه بعدی باید پای خود را پشت مخروط تعادل وسط بگذارد.',
                coachingCues: [
                    'خوانش توپ حریف هنگام پرواز',
                    'استفاده از پای کمکی برای فشار دادن به زمین و بازگشت'
                ],
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.32, y: 0.82, label: 'بازیکن ۱' },
                    { type: 'player', id: 'p2', x: 0.68, y: 0.18, label: 'بازیکن ۲' },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.82, color: '#f97316' },
                    { type: 'cone', id: 'c2', x: 0.50, y: 0.18, color: '#f97316' },
                    { type: 'target', id: 't1', x: 0.68, y: 0.25, points: 3 }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.32, y: 0.82 }, to: { x: 0.68, y: 0.18 }, style: 'solid', color: '#CCFF00', label: 'رالی متقابل' },
                    { type: 'ball_path', from: { x: 0.68, y: 0.18 }, to: { x: 0.32, y: 0.82 }, style: 'solid', color: '#CCFF00' },
                    { type: 'move_path', from: { x: 0.32, y: 0.82 }, to: { x: 0.48, y: 0.82 }, style: 'dashed', color: '#38bdf8' }
                ]
            },
            GAME: {
                goal: 'مسابقه تا امتیاز ۱۰ در کورت کراس‌کورت همراه با امتیاز ویژه برای ریکاوری صحیح.',
                drillDescription: 'امتیازگیری استاندارد تنیس رد. قانون ویژه: اگر بازیکنی امتیاز را با ضربه به زون هدف ببرد، ۲ امتیاز دریافت می‌کند. مربی بازی پا را می‌سنجد.',
                debriefQuestions: [
                    'وقتی ضربه‌ات رو زدی، احساس کردی زمان کافی برای رسیدن به توپ بعدی داری؟',
                    'چرا برگشتن به وسط بهت کمک کرد زمین رو بهتر بپوشونی؟'
                ],
                timeMinutes: 8,
                elements: [
                    { type: 'player', id: 'p1', x: 0.35, y: 0.85, label: 'بازیکن ۱' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.15, label: 'بازیکن ۲' },
                    { type: 'coach', id: 'coach', x: 0.15, y: 0.50, label: 'داور / مربی' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.25, points: 2, color: '#10b981' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.35, y: 0.85 }, to: { x: 0.70, y: 0.25 }, style: 'solid', color: '#CCFF00', label: 'امتیاز مسابقه' }
                ]
            }
        }
    },

    {
        id: 'orange_approach_volley',
        title: 'اپروچ شات و حمله پای تور (Approach & First Volley)',
        level: 'ORANGE',
        situation: 'APPROACH_NET',
        capacity: 'TACTICAL',
        surface: 'clay',
        duration: 60,
        playersCount: '2 تا 4 بازیکن',
        equipment: 'توپ نارنجی ۵۰٪، راکت 23-25 اینچ، مخروط‌های مرزی، طناب/نشانه‌گذار عمق',
        overview: 'تشخیص توپ کوتاه حریف، ورود تهاجمی به داخل زمین، ضربه اپروچ به گوشه و فینیش با والی اول در زمین ۱۸ متری.',

        stages: {
            GAME_ASSESSMENT: {
                goal: 'بررسی اینکه بازیکن چه زمانی تصمیم به حمله به سمت تور می‌گیرد و آیا توقف اسپلیت-استپ (Split-step) دارد یا نه.',
                drillDescription: 'بازی امتیازشماری آزاد. مربی توپ‌های رندوم کوتاه در رالی وارد می‌کند و واکنش بازیکن به جلو آمدن را ثبت می‌کند.',
                coachObservations: 'آیا بازیکن روی توپ کوتاه عقب می‌ماند و منتظر پرش می‌شود یا با زاویه تهاجمی به جلو می‌دود؟ آیا پای تور با تعادل والی می‌زند؟',
                timeMinutes: 10,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.85, label: 'مهاجم' },
                    { type: 'player', id: 'p2', x: 0.50, y: 0.15, label: 'مدافع' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.15 }, to: { x: 0.40, y: 0.65 }, style: 'solid', color: '#CCFF00', label: 'توپ کوتاه حریف' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'اصلاح بیومکانیک اپروچ فورهند داخل زمین و سپس جهش به سمت تور با اسپلیت-استپ قبل از والی.',
                drillDescription: 'مربی از پشت تور توپی نرم و با پرش کوتاه جلوی خط سرویس می‌اندازد. بازیکن به جلو حرکت کرده، اپروچ به انتهای خط می‌زند، بلافاصله دو گام به سمت تور می‌آید، اسپلیت-استپ کرده و والی فورسند فید دوم را لمس می‌کند.',
                coachingCues: [
                    'وزن بدن رو به جلو: با پای مخالف به داخل زمین قدم بگذار.',
                    'اسپلیت-استپ: وقتی راکت حریف به توپ می‌خورد، هر دو پا روی پنجه بنشیند.',
                    'پانچ والی: بدون چرخش راکت به عقب، مچ محکم و رو به جلو هل بده.'
                ],
                timeMinutes: 20,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.35, y: 0.40, label: 'مربی' },
                    { type: 'hopper', id: 'hop', x: 0.30, y: 0.39 },
                    { type: 'player', id: 'p1', x: 0.45, y: 0.70, label: 'بازیکن' },
                    { type: 'target', id: 't1', x: 0.25, y: 0.15, points: 5, color: '#3b82f6' },
                    { type: 'cone', id: 'c1', x: 0.50, y: 0.45, color: '#f59e0b' }
                ],
                drawings: [
                    { type: 'feed_path', from: { x: 0.35, y: 0.40 }, to: { x: 0.45, y: 0.68 }, style: 'dotted', color: '#facc15', label: 'فید ۱ (اپروچ)' },
                    { type: 'ball_path', from: { x: 0.45, y: 0.68 }, to: { x: 0.25, y: 0.15 }, style: 'solid', color: '#CCFF00', label: 'اپروچ عمیق' },
                    { type: 'move_path', from: { x: 0.45, y: 0.68 }, to: { x: 0.50, y: 0.45 }, style: 'dashed', color: '#38bdf8', label: 'پیشروی پای تور' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'شبیه‌سازی سناریوی حمله با تصمیم باز: انتخاب ضربه اپروچ لاین یا کراس بر اساس جایگیری حریف.',
                drillDescription: 'بازیکن ۱ و ۲ رالی می‌کنند. به محض اینکه توپ بازیکن ۲ از خط سرویس جلوتر افتاد، بازیکن ۱ باید فریاد "Attack" بزند، اپروچ کند و جلو بیاید. بازیکن ۲ اجازه دارد پاسینگ یا لاب بزند.',
                coachingCues: [
                    'خواندن موقعیت حریف: زدن اپروچ به فضای خالی پشت حریف',
                    'بستن زاویه: پوشش سمتی از تور که حریف مجبور به شوت شده'
                ],
                timeMinutes: 18,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.55, label: 'مهاجم تور' },
                    { type: 'player', id: 'p2', x: 0.30, y: 0.15, label: 'مدافع انتهای زمین' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.20, points: 3 }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.55 }, to: { x: 0.70, y: 0.20 }, style: 'solid', color: '#CCFF00', label: 'والی فینیش' },
                    { type: 'move_path', from: { x: 0.50, y: 0.75 }, to: { x: 0.50, y: 0.55 }, style: 'dashed', color: '#38bdf8', label: 'اپروچ' }
                ]
            },
            GAME: {
                goal: 'گیم استاندارد تنیس نارنجی با قانون بونس: ۳ امتیاز مستقیم برای بردن امتیاز پای تور.',
                drillDescription: 'گیم ۴ امتیازی با سرویس چرخشی. امتیاز حمله تور = ۳ امتیاز، امتیاز معمولی = ۱ امتیاز.',
                debriefQuestions: [
                    'وقتی جلو اومدی چه تفاوتی در زمان عکس‌العمل داشتی؟',
                    'کدوم اپروچ باعث شد حریف نتونه پاسینگ شات خوب بزنه؟'
                ],
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.85, label: 'سرویس‌زننده' },
                    { type: 'player', id: 'p2', x: 0.35, y: 0.15, label: 'ریترن‌زننده' },
                    { type: 'coach', id: 'coach', x: 0.85, y: 0.50, label: 'مربی LTA' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.85 }, to: { x: 0.35, y: 0.35 }, style: 'solid', color: '#CCFF00', label: 'سرویس + حمله' }
                ]
            }
        }
    },

    {
        id: 'green_serve_plus_one',
        title: 'الگوی سرویس + ضربه فورهند اول (Serve + 1 Forehand)',
        level: 'GREEN',
        situation: 'SERVE',
        capacity: 'TACTICAL',
        surface: 'grass',
        duration: 60,
        playersCount: '2 تا 4 بازیکن',
        equipment: 'توپ سبز ۲۵٪، راکت 25-26 اینچ، نشانه‌گذار زون سرویس، اهداف مخروطی عمیق',
        overview: 'تسلط بر زدن سرویس هدفمند (T یا Wide) و جایگیری فوری برای زدن فورهند تهاجمی بر روی ریترن ضعیف حریف.',

        stages: {
            GAME_ASSESSMENT: {
                goal: 'ارزیابی هوشیاری بازیکن در استفاده از ضربه بعد از سرویس برای دیکته کردن رالی.',
                drillDescription: 'بازی مسابقه‌ای با سرویس از سمت دوس (Deuce Court). مربی ضربه بعد از سرویس را زیر نظر می‌گیرد.',
                coachObservations: 'آیا بازیکن بعد از سرویس درجا می‌زند یا آماده زدن فورهند می‌شود؟ آیا سرویس فقط برای شروع است یا هدفی مشخص دارد؟',
                timeMinutes: 10,
                elements: [
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'سرویس‌زننده' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.12, label: 'ریترنر' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.55, y: 0.38 }, style: 'solid', color: '#CCFF00', label: 'سرویس T' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'تمرین الگوی تکراری: پرتاب سرویس، فرود روی پای چپ، استقرار برای فورهند داخل زمین (Inside-out یا Inside-in).',
                drillDescription: 'بازیکن سرویس می‌زند. مربی بلافاصله از سبد توپی نرم به وسط زمین فید می‌دهد. بازیکن به سرعت دور توپ چرخیده و فورهند اینساید-اوت می‌زند.',
                coachingCues: [
                    'پرتاب توپ (Toss): به داخل زمین ساعت ۱ برای ایجاد شتاب.',
                    'لندینگ فعال: فرود پویا و گام اول به سمت مرکز.',
                    'لودینگ فورهند: زاویه‌سازی شانه و چرخش سریع مچ پا.'
                ],
                timeMinutes: 20,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.70, y: 0.45, label: 'مربی' },
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'بازیکن' },
                    { type: 'target', id: 't1', x: 0.55, y: 0.38, points: 5, color: '#10b981' },
                    { type: 'target', id: 't2', x: 0.25, y: 0.15, points: 10, color: '#38bdf8' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.55, y: 0.38 }, style: 'solid', color: '#CCFF00', label: 'سرویس به هدف' },
                    { type: 'feed_path', from: { x: 0.70, y: 0.45 }, to: { x: 0.48, y: 0.75 }, style: 'dotted', color: '#facc15', label: 'فید ریترن فرضی' },
                    { type: 'ball_path', from: { x: 0.48, y: 0.75 }, to: { x: 0.25, y: 0.15 }, style: 'solid', color: '#CCFF00', label: 'فورهند اینساید-اوت' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'اجرای سناریو با ریترنر واقعی: ریترنر تلاش می‌کند به وسط بزند، سرویس‌زننده ملزم به زدن فورهند به گوشه‌هاست.',
                drillDescription: 'سرویس زنده. ریترنر موظف است توپ را در عمق متوسط نگه دارد. اگر سرویس‌زننده بتواند ضربه +1 را فورهند به زون گل بزند امتیاز ۲ برابری می‌گیرد.',
                coachingCues: [
                    'خوانش زاویه راکت ریترنر',
                    'پیش‌دستی ذهنی قبل از رسیدن توپ به زمین'
                ],
                timeMinutes: 18,
                elements: [
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'سرویس‌زننده' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.12, label: 'ریترنر' },
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
                goal: 'تای‌بریک ۱۰ امتیازی مسابقه چمن با قانون طلایی سرویس.',
                drillDescription: 'تای‌بریک تا ۱۰ امتیاز. مربی درصد موفقیت سرویس اول و تعداد بردهای مستقیم الگوی Serve+1 را ثبت می‌کند.',
                debriefQuestions: [
                    'سرویس به T چه فضایی در سمت بک‌هند حریف برات ایجاد کرد؟',
                    'اگر ریترن حریف خیلی عمیق می‌آمد استراتژیت چه تغییری می‌کرد؟'
                ],
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.45, y: 0.88, label: 'بازیکن ۱' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.12, label: 'بازیکن ۲' },
                    { type: 'coach', id: 'coach', x: 0.15, y: 0.50, label: 'تحلیل‌گر مربی' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.45, y: 0.88 }, to: { x: 0.55, y: 0.38 }, style: 'solid', color: '#CCFF00' }
                ]
            }
        }
    },

    {
        id: 'yellow_baseline_depth',
        title: 'عمق‌دهی و تاپ‌اسپین سنگین از انتهای زمین (Heavy Topspin Depth)',
        level: 'YELLOW_INT',
        situation: 'BOTH_BACK',
        capacity: 'TECHNICAL',
        surface: 'clay',
        duration: 75,
        playersCount: '2 بازیکن',
        equipment: 'توپ استاندارد زرد، تارگت‌های خط بیس‌لاین، نوارهای ارتفاع بالای تور',
        overview: 'تسلط بر رالی سنگین با ارتفاع ۱ متری از بالای تور برای ایجاد عمق بین خط سرویس و بیس‌لاین حریف.',

        stages: {
            GAME_ASSESSMENT: {
                goal: 'تشخیص اینکه چرا توپ‌های بازیکنان کوتاه افتاده و حریف امکان تهاجم پیدا می‌کند.',
                drillDescription: 'رالی کراس‌کورت آزاد بین دو بازیکن. مربی محل فرود توپ‌ها را یادداشت می‌کند.',
                coachObservations: 'آیا بازیکن توپ را فلت و نزدیک تور می‌زند؟ آیا با زاویه مچ به زیر توپ می‌رود تا چرخش ایجاد کند؟',
                timeMinutes: 12,
                elements: [
                    { type: 'player', id: 'p1', x: 0.30, y: 0.88, label: 'بازیکن A' },
                    { type: 'player', id: 'p2', x: 0.70, y: 0.12, label: 'بازیکن B' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.30, y: 0.88 }, to: { x: 0.70, y: 0.28 }, style: 'solid', color: '#f59e0b', label: 'توپ کوتاه (خطرناک)' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'آموزش مسیر حرکت راکت از پایین به بالا (Low-to-High Brush) و ارتفاع ایمن روی تور.',
                drillDescription: 'مربی فید عمیق و یکدست می‌دهد. نواری به ارتفاع ۱ متر بالای تور نصب شده؛ بازیکن باید توپ را از بالای نوار رد کرده و در زون هدف عمقی بنشاند.',
                coachingCues: [
                    'افت سر راکت: راکت زیر سطح توپ پایین برود.',
                    'براش پرقدرت: مالش سریع سیم‌های راکت از ساعت ۶ به ۱۲.',
                    'فالو ترو در بالای شانه و چرخش کامل لگن.'
                ],
                timeMinutes: 25,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.50, y: 0.40, label: 'مربی' },
                    { type: 'player', id: 'p1', x: 0.30, y: 0.88, label: 'بازیکن' },
                    { type: 'target', id: 't1', x: 0.70, y: 0.15, points: 5, color: '#10b981' },
                    { type: 'cone', id: 'c1', x: 0.70, y: 0.28, color: '#ef4444' }
                ],
                drawings: [
                    { type: 'feed_path', from: { x: 0.50, y: 0.40 }, to: { x: 0.30, y: 0.85 }, style: 'dotted', color: '#facc15' },
                    { type: 'ball_path', from: { x: 0.30, y: 0.85 }, to: { x: 0.70, y: 0.15 }, style: 'loop', color: '#CCFF00', label: 'قوس سنگین تاپ‌اسپین' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'رالی ۲ نفره با شرط فرود در زون عمق: هر توپ که جلوی خط سرویس بیفتد، بازیکن مقابل مجاز به شوت و تمام کردن است.',
                drillDescription: 'بازی پیوسته بین دو بازیکن با شمارش رالی عمقی. هدف رسیدن به رالی‌های بالای ۱۰ ضربه بدون افتادن توپ در زون کوتاه.',
                coachingCues: [
                    'صبر در ساخت امتیاز (Patience)',
                    'تنظیم مجدد پاها قبل از ضربه در شرایط حرکت حریف'
                ],
                timeMinutes: 20,
                elements: [
                    { type: 'player', id: 'p1', x: 0.30, y: 0.88, label: 'بازیکن A' },
                    { type: 'player', id: 'p2', x: 0.70, y: 0.12, label: 'بازیکن B' },
                    { type: 'target', id: 't1', x: 0.30, y: 0.15, points: 2 },
                    { type: 'target', id: 't2', x: 0.70, y: 0.85, points: 2 }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.30, y: 0.88 }, to: { x: 0.70, y: 0.15 }, style: 'loop', color: '#CCFF00' },
                    { type: 'ball_path', from: { x: 0.70, y: 0.12 }, to: { x: 0.30, y: 0.85 }, style: 'loop', color: '#CCFF00' }
                ]
            },
            GAME: {
                goal: 'گیم کامل ۶ امتیازی در زمین خاک رس با امتیاز دوبل برای وادار کردن حریف به زدن ضربه خارج از بیس‌لاین.',
                drillDescription: 'بازی استاندارد. هر بازیکنی که بتواند با اسپین عمیق حریف را ۲ متر پشت خط عقب براند امتیاز ویژه می‌گیرد.',
                debriefQuestions: [
                    'پرش بلند خاک رس چه کمکی به عمق دادن توپ‌هات کرد؟',
                    'چطور تونستی حتی وقتی خسته شدی ارتفاع توپ رو بالای تور حفظ کنی؟'
                ],
                timeMinutes: 18,
                elements: [
                    { type: 'player', id: 'p1', x: 0.50, y: 0.90, label: 'بازیکن A' },
                    { type: 'player', id: 'p2', x: 0.50, y: 0.10, label: 'بازیکن B' },
                    { type: 'coach', id: 'coach', x: 0.85, y: 0.50, label: 'مربی' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.50, y: 0.90 }, to: { x: 0.30, y: 0.12 }, style: 'solid', color: '#CCFF00' }
                ]
            }
        }
    },

    {
        id: 'blue_movement_agility',
        title: 'مهارت‌های پایه حرکتی، تعقیب توپ و مینی‌رالی (ABC & Fun)',
        level: 'BLUE',
        situation: 'BOTH_BACK',
        capacity: 'PHYSICAL',
        surface: 'carpet',
        duration: 40,
        playersCount: '4 تا 6 بازیکن',
        equipment: 'توپ‌های فومی اسفنجی، راکت‌های ۱۷-۱۹ اینچ، نردبان چابکی، دیسک‌های پلاستیکی رنگی',
        overview: 'توسعه چابکی، تعادل و هماهنگی (Agility, Balance, Coordination) برای خردسالان با استفاده از تمرینات بازی‌محور و شاد LTA Youth Blue.',

        stages: {
            GAME_ASSESSMENT: {
                goal: 'مشاهده توانایی کودک در تشخیص مسیر حرکت توپ غلتان و متوقف کردن آن با کف دست یا راکت.',
                drillDescription: 'بازی شاد "شکار خرگوش": مربی توپ‌های فومی رنگی را روی زمین می‌غلتاند و کودکان باید با دویدن آن را با راکت روی زمین بگیرند.',
                coachObservations: 'تعادل حرکتی کودک، توانایی ترمز کردن، هماهنگی چشم و دست در حین حرکت.',
                timeMinutes: 8,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.50, y: 0.40, label: 'مربی' },
                    { type: 'player', id: 'p1', x: 0.35, y: 0.70, label: 'کودک ۱' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.70, label: 'کودک ۲' },
                    { type: 'ball', id: 'b1', x: 0.42, y: 0.55 },
                    { type: 'ball', id: 'b2', x: 0.58, y: 0.55 }
                ],
                drawings: [
                    { type: 'move_path', from: { x: 0.35, y: 0.70 }, to: { x: 0.42, y: 0.55 }, style: 'dashed', color: '#38bdf8' },
                    { type: 'move_path', from: { x: 0.65, y: 0.70 }, to: { x: 0.58, y: 0.55 }, style: 'dashed', color: '#38bdf8' }
                ]
            },
            DEMO_CLOSED: {
                goal: 'آموزش گام‌های سریع از میان نردبان چابکی و سپس ضربه آرام فورهند به سمت هدف بزرگ با فید دستی.',
                drillDescription: 'کودک دو پا در میان پله‌های نردبان می‌گذارد، سپس به سمت راست دویده و توپی که مربی از ارتفاع کم رها می‌کند با راکت به هدف رنگی می‌زند.',
                coachingCues: [
                    'پاهای سبک مثل پروانه',
                    'راکت مثل قاشق بستنی: توپ رو نوازش کن و بالا بفرست'
                ],
                timeMinutes: 15,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.40, y: 0.60, label: 'مربی' },
                    { type: 'player', id: 'p1', x: 0.60, y: 0.85, label: 'کودک' },
                    { type: 'target', id: 't1', x: 0.50, y: 0.30, points: 10, color: '#facc15' },
                    { type: 'cone', id: 'c1', x: 0.60, y: 0.75, color: '#ef4444' }
                ],
                drawings: [
                    { type: 'move_path', from: { x: 0.60, y: 0.85 }, to: { x: 0.45, y: 0.65 }, style: 'dashed', color: '#38bdf8' },
                    { type: 'ball_path', from: { x: 0.45, y: 0.65 }, to: { x: 0.50, y: 0.30 }, style: 'solid', color: '#CCFF00' }
                ]
            },
            PROGRESSING_OPEN: {
                goal: 'بازی تیمی ۲ به ۲ با رد و بدل کردن توپ فومی از روی تور کوتاه بدون افتادن به زمین.',
                drillDescription: 'تیم‌ها تلاش می‌کنند رکورد رد کردن توپ را جابجا کنند. مربی شمارش معکوس هیجان‌انگیز می‌گذارد.',
                coachingCues: [
                    'صدا زدن "من زدم" برای تقویت ارتباط تیمی',
                    'استقرار آماده‌باش با زانوهای کمی خمیده'
                ],
                timeMinutes: 10,
                elements: [
                    { type: 'player', id: 'p1', x: 0.40, y: 0.65, label: 'یار ۱' },
                    { type: 'player', id: 'p2', x: 0.60, y: 0.65, label: 'یار ۲' },
                    { type: 'player', id: 'p3', x: 0.50, y: 0.35, label: 'یار ۳' }
                ],
                drawings: [
                    { type: 'ball_path', from: { x: 0.40, y: 0.65 }, to: { x: 0.50, y: 0.35 }, style: 'solid', color: '#CCFF00' }
                ]
            },
            GAME: {
                goal: 'مسابقه فتح قله: هر ضربه از روی تور = ۱ ستاره برای تیم.',
                drillDescription: 'کودکان در قالب بازی گروهی سرگرم‌کننده ستاره جمع می‌کنند تا به خط پایان برسند.',
                debriefQuestions: [
                    'کی امروز تونست قشنگ‌ترین پرش رو انجام بده؟',
                    'نگاه کردن به توپ چطوری کمکت کرد راحت‌تر با راکت بزنیش؟'
                ],
                timeMinutes: 7,
                elements: [
                    { type: 'coach', id: 'coach', x: 0.50, y: 0.50, label: 'مربی کاپیتان' },
                    { type: 'player', id: 'p1', x: 0.35, y: 0.75, label: 'تیم ستاره' },
                    { type: 'player', id: 'p2', x: 0.65, y: 0.75, label: 'تیم قهرمان' }
                ],
                drawings: []
            }
        }
    }
];

window.LTA_PRESETS = LTA_PRESETS;
