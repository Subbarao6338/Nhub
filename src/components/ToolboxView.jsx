import React, { useState, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { storage } from '../utils/storage';
import CategoryNav from './CategoryNav';
import NatureEmptyState from './NatureEmptyState';
import { highlightText } from '../utils/helpers';

// Lazy Loaded Tools
const Calculator = lazy(() => import('./tools/Calculator'));
const QrGen = lazy(() => import('./tools/QrGen'));
const PasswordGenerator = lazy(() => import('./tools/PasswordGenerator'));
const UnitConverter = lazy(() => import('./tools/UnitConverter'));
const CurrencyConverter = lazy(() => import('./tools/CurrencyConverter'));
const Stopwatch = lazy(() => import('./tools/Stopwatch'));
const Notes = lazy(() => import('./tools/Notes'));
const Translate = lazy(() => import('./tools/Translate'));
const MorseCode = lazy(() => import('./tools/MorseCode'));
const AgeCalculator = lazy(() => import('./tools/AgeCalculator'));
const BMICalculator = lazy(() => import('./tools/BMICalculator'));
const ColorPicker = lazy(() => import('./tools/ColorPicker'));
const TimestampConverter = lazy(() => import('./tools/TimestampConverter'));
const TextUtils = lazy(() => import('./tools/TextUtils'));
const Flashcards = lazy(() => import('./tools/Flashcards'));
const ImageOptimizer = lazy(() => import('./tools/ImageOptimizer'));
const Base64Converter = lazy(() => import('./tools/Base64Converter'));
const PomodoroTimer = lazy(() => import('./tools/PomodoroTimer'));
const MarkdownPreview = lazy(() => import('./tools/MarkdownPreview'));
const TeluguPanchangam = lazy(() => import('./tools/TeluguPanchangam'));
const AiSummary = lazy(() => import('./tools/AiSummary'));
const PerchanceAi = lazy(() => import('./tools/PerchanceAi'));
const OmniHub = lazy(() => import('./tools/OmniHub'));
const Cookies = lazy(() => import('./tools/Cookies'));
const Inspect = lazy(() => import('./tools/Inspect'));
const UrlTool = lazy(() => import('./tools/UrlTool'));
const SecurityInfo = lazy(() => import('./tools/SecurityInfo'));
const UserScripts = lazy(() => import('./tools/UserScripts'));
const TravelTools = lazy(() => import('./tools/TravelTools'));
const DiffViewer = lazy(() => import('./tools/DiffViewer'));
const AnomalyDetection = lazy(() => import('./tools/AnomalyDetection'));
const HashGenerator = lazy(() => import('./tools/HashGenerator'));
const GlassGenerator = lazy(() => import('./tools/GlassGenerator'));
const AspectRatioCalc = lazy(() => import('./tools/AspectRatioCalc'));
const CronExpressionDescriptor = lazy(() => import('./tools/CronExpressionDescriptor'));
const DataQuality = lazy(() => import('./tools/DataQuality'));
const DataAnonymizer = lazy(() => import('./tools/DataAnonymizer'));
const Observability = lazy(() => import('./tools/Observability'));
const DataPortal = lazy(() => import('./tools/DataPortal'));
const PredictiveAnalysis = lazy(() => import('./tools/PredictiveAnalysis'));
const SpecializedTools = lazy(() => import('./tools/SpecializedTools'));
const UuidGenerator = lazy(() => import('./tools/UuidGenerator'));
const DiceRoller = lazy(() => import('./tools/DiceRoller'));
const CoinFlipper = lazy(() => import('./tools/CoinFlipper'));
const Counter = lazy(() => import('./tools/Counter'));
const MarkdownTable = lazy(() => import('./tools/MarkdownTable'));
const Measurements = lazy(() => import('./tools/Measurements'));
const Games = lazy(() => import('./tools/Games'));
const MathTools = lazy(() => import('./tools/MathTools'));
const Generators = lazy(() => import('./tools/Generators'));
const FinanceCalculators = lazy(() => import('./tools/FinanceCalculators'));
const MiscCalculators = lazy(() => import('./tools/MiscCalculators'));
const ImageTools = lazy(() => import('./tools/ImageTools'));
const ColorTools = lazy(() => import('./tools/ColorTools'));
const OutdoorTools = lazy(() => import('./tools/OutdoorTools'));
const PdfEdit = lazy(() => import('./tools/PdfEdit'));
const PdfSecure = lazy(() => import('./tools/PdfSecure'));
const PdfConvert = lazy(() => import('./tools/PdfConvert'));
const SocialTools = lazy(() => import('./tools/SocialTools'));
const WebToMarkdown = lazy(() => import('./tools/WebToMarkdown'));
const NatureSounds = lazy(() => import('./tools/NatureSounds'));
const WaterReminder = lazy(() => import('./tools/WaterReminder'));
const HardwareTools = lazy(() => import('./tools/HardwareTools'));
const HealthTools = lazy(() => import('./tools/HealthTools'));
const PrivacyDashboard = lazy(() => import('./tools/PrivacyDashboard'));
const QrScanner = lazy(() => import('./tools/QrScanner'));
const NetworkingTools = lazy(() => import('./tools/NetworkingTools'));
const SystemTools = lazy(() => import('./tools/SystemTools'));
const DevOpsTools = lazy(() => import('./tools/DevOpsTools'));
const DataScienceTools = lazy(() => import('./tools/DataScienceTools'));
const AudioTools = lazy(() => import('./tools/AudioTools'));
const SecurityTools = lazy(() => import('./tools/SecurityTools'));
const ProductivityTools = lazy(() => import('./tools/ProductivityTools'));
const CreativeTools = lazy(() => import('./tools/CreativeTools'));
const EducationTools = lazy(() => import('./tools/EducationTools'));

const TOOLS = [
    // Productivity
    { id: 'habit-tracker', title: 'Habit Tracker', icon: 'auto_graph', category: 'Productivity', component: ProductivityTools },
    { id: 'sticky-notes', title: 'Sticky Notes', icon: 'note_alt', category: 'Productivity', component: ProductivityTools },
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Productivity', component: Notes },
    { id: 'flashcards', title: 'Flashcards', icon: 'style', category: 'Productivity', component: Flashcards },
    { id: 'ai-summary', title: 'AI Content', icon: 'auto_fix_high', category: 'Productivity', component: AiSummary },
    { id: 'water-reminder', title: 'Water Reminder', icon: 'local_drink', category: 'Productivity', component: WaterReminder },
    { id: 'nature-sounds', title: 'Nature Sounds', icon: 'filter_drama', category: 'Productivity', component: NatureSounds },
    { id: 'tally-counter', title: 'Tally Counter', icon: 'add_circle_outline', category: 'Productivity', component: Counter },
    { id: 'packing-list', title: 'Packing List', icon: 'checklist', category: 'Productivity', component: TravelTools },

    // Creative
    { id: 'canvas-draw', title: 'Canvas Draw', icon: 'brush', category: 'Creative', component: CreativeTools },
    { id: 'palette-gen', title: 'Palette Gen', icon: 'palette', category: 'Creative', component: CreativeTools },
    { id: 'img-color', title: 'Image Color Picker', icon: 'colorize', category: 'Creative', component: ColorTools },
    { id: 'cam-color', title: 'Camera Color Picker', icon: 'camera', category: 'Creative', component: ColorTools },
    { id: 'color-conv', title: 'Color Converter', icon: 'autorenew', category: 'Creative', component: ColorTools },
    { id: 'tints-shades', title: 'Tints & Shades', icon: 'opacity', category: 'Creative', component: ColorTools },
    { id: 'color-harm', title: 'Color Harmonizer', icon: 'style', category: 'Creative', component: ColorTools },
    { id: 'color-blend', title: 'Color Blender', icon: 'format_color_fill', category: 'Creative', component: ColorTools },
    { id: 'color-picker-std', title: 'Color Picker', icon: 'palette', category: 'Creative', component: ColorPicker },

    // Media
    { id: 'img-format', title: 'Format Converter', icon: 'transform', category: 'Media', component: ImageTools },
    { id: 'img-compress', title: 'Compressor', icon: 'compress', category: 'Media', component: ImageOptimizer },
    { id: 'img-resize', title: 'Resize Image', icon: 'aspect_ratio', category: 'Media', component: ImageTools },
    { id: 'img-blur', title: 'Privacy Blur', icon: 'blur_on', category: 'Media', component: ImageTools },
    { id: 'img-meta', title: 'Metadata Cleaner', icon: 'no_photography', category: 'Media', component: ImageTools },
    { id: 'img-bw', title: 'Black & White Filter', icon: 'filter_b_and_w', category: 'Media', component: ImageTools },
    { id: 'pdf-merge', title: 'Merge PDF', icon: 'merge_type', category: 'Media', component: PdfEdit },
    { id: 'pdf-split', title: 'Split PDF', icon: 'call_split', category: 'Media', component: PdfEdit },
    { id: 'pdf-delete', title: 'Delete Pages', icon: 'delete', category: 'Media', component: PdfEdit },
    { id: 'pdf-rearrange', title: 'Rearrange PDF', icon: 'low_priority', category: 'Media', component: PdfEdit },
    { id: 'pdf-rotate', title: 'Rotate PDF', icon: 'rotate_right', category: 'Media', component: PdfEdit },
    { id: 'pdf-sign', title: 'Sign PDF', icon: 'draw', category: 'Media', component: PdfEdit },
    { id: 'pdf-watermark', title: 'Watermark PDF', icon: 'branding_watermark', category: 'Media', component: PdfEdit },
    { id: 'pdf-numbers', title: 'Add Page Numbers', icon: 'format_list_numbered', category: 'Media', component: PdfEdit },
    { id: 'pdf-bookmarks', title: 'PDF Bookmarks', icon: 'bookmark', category: 'Media', component: PdfEdit },
    { id: 'pdf-crop', title: 'Crop PDF', icon: 'crop', category: 'Media', component: PdfEdit },
    { id: 'pdf-compress', title: 'Compress PDF', icon: 'compress', category: 'Media', component: PdfSecure },
    { id: 'pdf-grayscale', title: 'Grayscale PDF', icon: 'filter_b_and_w', category: 'Media', component: PdfSecure },
    { id: 'pdf-repair', title: 'Repair PDF', icon: 'build', category: 'Media', component: PdfSecure },
    { id: 'pdf-compare', title: 'Compare PDF', icon: 'difference', category: 'Media', component: PdfSecure },
    { id: 'pdf-flatten', title: 'Flatten PDF', icon: 'layers_clear', category: 'Media', component: PdfSecure },
    { id: 'pdf-lock', title: 'Lock PDF', icon: 'lock', category: 'Media', component: PdfSecure },
    { id: 'pdf-unlock', title: 'Unlock PDF', icon: 'lock_open', category: 'Media', component: PdfSecure },
    { id: 'pdf-meta', title: 'PDF Metadata', icon: 'info', category: 'Media', component: PdfSecure },
    { id: 'pdf-to-img', title: 'PDF to Img', icon: 'image', category: 'Media', component: PdfConvert },
    { id: 'img-to-pdf', title: 'Img to PDF', icon: 'picture_as_pdf', category: 'Media', component: PdfConvert },
    { id: 'pdf-to-zip', title: 'PDF to ZIP', icon: 'folder_zip', category: 'Media', component: PdfConvert },
    { id: 'pdf-extract', title: 'Extract Assets', icon: 'file_download', category: 'Media', component: PdfConvert },
    { id: 'pdf-to-text', title: 'PDF to Text', icon: 'text_snippet', category: 'Media', component: PdfConvert },
    { id: 'word-to-pdf', title: 'Word to PDF', icon: 'description', category: 'Media', component: PdfConvert },
    { id: 'excel-to-pdf', title: 'Excel to PDF', icon: 'table_chart', category: 'Media', component: PdfConvert },
    { id: 'ppt-to-pdf', title: 'PPT to PDF', icon: 'slideshow', category: 'Media', component: PdfConvert },
    { id: 'pdf-to-word', title: 'PDF to Word', icon: 'article', category: 'Media', component: PdfConvert },
    { id: 'pdf-scan', title: 'Scan PDF (OCR)', icon: 'document_scanner', category: 'Media', component: PdfConvert },
    { id: 'social-downloader', title: 'Social Downloader', icon: 'download', category: 'Media', component: SocialTools },
    { id: 'whatsapp-link', title: 'WhatsApp Link', icon: 'chat', category: 'Media', component: SocialTools },
    { id: 'telegram-link', title: 'Telegram Link', icon: 'send', category: 'Media', component: SocialTools },
    { id: 'hashtag-gen', title: 'Hashtag Gen', icon: 'tag', category: 'Media', component: SocialTools },
    { id: 'web-to-md', title: 'Web to MD', icon: 'article', category: 'Media', component: WebToMarkdown },

    // Developer
    { id: 'translate', title: 'Translate', icon: 'translate', category: 'Developer', component: Translate },
    { id: 'url-tool', title: 'URL Tool', icon: 'link', category: 'Developer', component: UrlTool },
    { id: 'json-formatter', title: 'JSON Formatter', icon: 'code', category: 'Developer', component: DevOpsTools },
    { id: 'csv-json', title: 'CSV/JSON', icon: 'swap_horiz', category: 'Developer', component: DevOpsTools },
    { id: 'json-to-csv', title: 'JSON to CSV', icon: 'table_view', category: 'Developer', component: DevOpsTools },
    { id: 'json-validator', title: 'JSON Validator', icon: 'spellcheck', category: 'Developer', component: DevOpsTools },
    { id: 'network-tools', title: 'Network', icon: 'timeline', category: 'Developer', component: NetworkingTools },
    { id: 'cookies', title: 'Cookies', icon: 'cookie', category: 'Developer', component: Cookies },
    { id: 'inspect', title: 'Inspect', icon: 'search', category: 'Developer', component: Inspect },
    { id: 'omni-hub', title: 'Omni Hub', icon: 'public', category: 'Developer', component: OmniHub },
    { id: 'networking-main', title: 'Network Info', icon: 'router', category: 'Developer', component: NetworkingTools },
    { id: 'ping', title: 'Ping', icon: 'settings_input_antenna', category: 'Developer', component: NetworkingTools },
    { id: 'dns', title: 'DNS Lookup', icon: 'dns', category: 'Developer', component: NetworkingTools },
    { id: 'whois', title: 'Whois', icon: 'person_search', category: 'Developer', component: NetworkingTools },
    { id: 'markdown-preview', title: 'Markdown', icon: 'article', category: 'Developer', component: MarkdownPreview },
    { id: 'markdown-table', title: 'MD Table', icon: 'grid_on', category: 'Developer', component: MarkdownTable },
    { id: 'diff-viewer', title: 'Diff Viewer', icon: 'difference', category: 'Developer', component: DiffViewer },
    { id: 'base64-converter', title: 'Base64', icon: 'transform', category: 'Developer', component: Base64Converter },
    { id: 'user-scripts', title: 'User Scripts', icon: 'add', category: 'Developer', component: UserScripts },
    { id: 'cron-desc', title: 'Cron Explainer', icon: 'event_repeat', category: 'Developer', component: CronExpressionDescriptor },
    { id: 'devops-main', title: 'DevOps Hub', icon: 'terminal', category: 'Developer', component: DevOpsTools },
    { id: 'jwt-decoder', title: 'JWT Decoder', icon: 'api', category: 'Developer', component: DevOpsTools },
    { id: 'cron-gen', title: 'Cron Generator', icon: 'schedule', category: 'Developer', component: DevOpsTools },
    { id: 'sql-format', title: 'SQL Formatter', icon: 'storage', category: 'Developer', component: DevOpsTools },
    { id: 'http-client', title: 'HTTP Client', icon: 'sync_alt', category: 'Developer', component: DevOpsTools },
    { id: 'regex-tester', title: 'Regex Tester', icon: 'find_replace', category: 'Developer', component: DevOpsTools },

    // Data & Science
    { id: 'regression', title: 'Linear Regression', icon: 'show_chart', category: 'Data & Science', component: DataScienceTools },
    { id: 'correlation', title: 'Correlation Matrix', icon: 'grid_on', category: 'Data & Science', component: DataScienceTools },
    { id: 'descriptive-stats', title: 'Descriptive Stats', icon: 'insights', category: 'Data & Science', component: DataScienceTools },
    { id: 'anomaly-detection', title: 'Anomaly Detection', icon: 'notifications_active', category: 'Data & Science', component: AnomalyDetection },
    { id: 'data-quality', title: 'Data Quality', icon: 'verified', category: 'Data & Science', component: DataQuality },
    { id: 'observability', title: 'Observability', icon: 'visibility', category: 'Data & Science', component: Observability },
    { id: 'data-portal', title: 'Data Portal', icon: 'dashboard', category: 'Data & Science', component: DataPortal },
    { id: 'predictive-analysis', title: 'Predictive Analysis', icon: 'trending_up', category: 'Data & Science', component: PredictiveAnalysis },
    { id: 'specialized-tools', title: 'Specialized Tools', icon: 'construction', category: 'Data & Science', component: SpecializedTools },

    // Security
    { id: 'hash-gen', title: 'Hash Gen', icon: 'security', category: 'Security', component: HashGenerator },
    { id: 'rsa-gen', title: 'RSA Key Gen', icon: 'vpn_key', category: 'Security', component: SecurityTools },
    { id: 'hmac-calc', title: 'HMAC Calculator', icon: 'enhanced_encryption', category: 'Security', component: SecurityTools },
    { id: 'uuid-gen', title: 'UUID Gen', icon: 'fingerprint', category: 'Security', component: UuidGenerator },
    { id: 'security-info', title: 'Security Info', icon: 'verified_user', category: 'Security', component: SecurityInfo },
    { id: 'privacy-audit', title: 'Privacy Auditor', icon: 'shield', category: 'Security', component: PrivacyDashboard },
    { id: 'password-strength', title: 'Password Strength', icon: 'password', category: 'Security', component: PrivacyDashboard },
    { id: 'data-anonymizer', title: 'Data Anonymizer', icon: 'security', category: 'Security', component: DataAnonymizer },
    { id: 'password-gen', title: 'Password', icon: 'vpn_key', category: 'Security', component: PasswordGenerator },

    // Sensors
    { id: 'ruler', title: 'Ruler', icon: 'straighten', category: 'Sensors', component: Measurements },
    { id: 'level-pendulum', title: 'Level & Pendulum', icon: 'vibration', category: 'Sensors', component: Measurements },
    { id: 'protractor', title: 'Protractor', icon: 'architecture', category: 'Sensors', component: Measurements },
    { id: 'luxmeter', title: 'Luxmeter', icon: 'light_mode', category: 'Sensors', component: HardwareTools },
    { id: 'soundmeter', title: 'Soundmeter', icon: 'volume_up', category: 'Sensors', component: HardwareTools },
    { id: 'magnetic-tester', title: 'Magnetic Tester', icon: 'explore', category: 'Sensors', component: HardwareTools },
    { id: 'flashlight', title: 'Flashlight', icon: 'flashlight_on', category: 'Sensors', component: HardwareTools },
    { id: 'vibrometer', title: 'Vibrometer', icon: 'vibration', category: 'Sensors', component: HardwareTools },
    { id: 'sos', title: 'SOS', icon: 'warning', category: 'Sensors', component: OutdoorTools },
    { id: 'compass', title: 'Compass', icon: 'explore', category: 'Sensors', component: OutdoorTools },
    { id: 'gps-info', title: 'Altitude & GPS', icon: 'location_on', category: 'Sensors', component: OutdoorTools },
    { id: 'magnifier', title: 'Magnifying Glass', icon: 'zoom_in', category: 'Sensors', component: HardwareTools },
    { id: 'mirror', title: 'Mirror', icon: 'face', category: 'Sensors', component: OutdoorTools },
    { id: 'device-info', title: 'Device Info', icon: 'memory', category: 'Sensors', component: SystemTools },
    { id: 'android-sensors', title: 'Sensors', icon: 'sensors', category: 'Sensors', component: SystemTools },

    // Games
    { id: 'dice-roller', title: 'Dice Roller', icon: 'casino', category: 'Games', component: DiceRoller },
    { id: 'spin-wheel', title: 'Spin the Wheel', icon: 'refresh', category: 'Games', component: Games },
    { id: 'spin-bottle', title: 'Spin the Bottle', icon: 'wine_bar', category: 'Games', component: Games },
    { id: 'team-maker', title: 'Team Maker', icon: 'groups', category: 'Games', component: Games },
    { id: 'tournament-maker', title: 'Tournament Maker', icon: 'account_tree', category: 'Games', component: Games },
    { id: 'scoreboard', title: 'Scoreboard', icon: 'scoreboard', category: 'Games', component: Games },
    { id: 'chess-clock', title: 'Chess Clock', icon: 'timer', category: 'Games', component: Games },
    { id: 'chess960', title: 'Chess960', icon: 'grid_view', category: 'Games', component: Games },
    { id: 'darts-scoreboard', title: 'Darts Scoreboard', icon: 'ads_click', category: 'Games', component: Games },
    { id: 'tictactoe', title: 'Tic-Tac-Toe', icon: 'grid_view', category: 'Games', component: Games },
    { id: 'heads-tails', title: 'Heads or Tails', icon: 'monetization_on', category: 'Games', component: CoinFlipper },
    { id: 'magic-8ball', title: 'Magic 8-Ball', icon: 'filter_8', category: 'Games', component: Generators },
    { id: 'perchance-ai', title: 'Perchance Gen', icon: 'casino', category: 'Games', component: PerchanceAi },

    // Education & Math
    { id: 'periodic-table', title: 'Periodic Table', icon: 'grid_view', category: 'Education & Math', component: EducationTools },
    { id: 'unit-circle', title: 'Unit Circle', icon: 'blur_circular', category: 'Education & Math', component: EducationTools },
    { id: 'physics-constants', title: 'Physics Constants', icon: 'square_foot', category: 'Education & Math', component: EducationTools },
    { id: 'percentages', title: 'Percentages', icon: 'percent', category: 'Education & Math', component: MathTools },
    { id: 'geometry', title: 'Geometry', icon: 'architecture', category: 'Education & Math', component: MathTools },
    { id: 'pythagoras', title: 'Pythagoras', icon: 'change_history', category: 'Education & Math', component: MathTools },
    { id: 'proportions', title: 'Proportions', icon: 'balance', category: 'Education & Math', component: MathTools },
    { id: 'ruffini', title: 'Ruffini', icon: 'reorder', category: 'Education & Math', component: MathTools },
    { id: 'quadratic', title: 'Quadratic Equation', icon: 'functions', category: 'Education & Math', component: MathTools },
    { id: 'fractions', title: 'Fractions', icon: 'vertical_align_center', category: 'Education & Math', component: MathTools },
    { id: 'gcd-lcm', title: 'GCD & LCM', icon: 'format_list_numbered', category: 'Education & Math', component: MathTools },
    { id: 'prime-factors', title: 'Prime Factors', icon: 'grid_3x3', category: 'Education & Math', component: MathTools },
    { id: 'fibonacci', title: 'Fibonacci Series', icon: 'reorder', category: 'Education & Math', component: MathTools },
    { id: 'statistics', title: 'Statistics', icon: 'bar_chart', category: 'Education & Math', component: MathTools },
    { id: 'matrix', title: 'Matrix Multiply', icon: 'grid_on', category: 'Education & Math', component: MathTools },
    { id: 'calculator-main', title: 'Scientific Calc', icon: 'calculate', category: 'Education & Math', component: Calculator },

    // Utility & Time
    { id: 'age-calculator', title: 'Age Calculator', icon: 'calendar_today', category: 'Utility & Time', component: AgeCalculator },
    { id: 'timestamp-conv', title: 'Timestamp', icon: 'schedule', category: 'Utility & Time', component: TimestampConverter },
    { id: 'stopwatch', title: 'Stopwatch', icon: 'timer', category: 'Utility & Time', component: Stopwatch },
    { id: 'pomodoro-timer', title: 'Pomodoro Timer', icon: 'schedule', category: 'Utility & Time', component: PomodoroTimer },
    { id: 'metronome', title: 'Metronome', icon: 'timer', category: 'Utility & Time', component: AudioTools },
    { id: 'reaction-time', title: 'Reaction Time', icon: 'bolt', category: 'Utility & Time', component: Measurements },
    { id: 'tabata-timer', title: 'Tabata Timer', icon: 'fitness_center', category: 'Utility & Time', component: Measurements },
    { id: 'world-clock', title: 'World Clock', icon: 'public', category: 'Utility & Time', component: TravelTools },
    { id: 'timezone-conv', title: 'Timezone Conv', icon: 'schedule', category: 'Utility & Time', component: TravelTools },
    { id: 'panchangam', title: 'Panchangam', icon: 'auto_awesome', category: 'Utility & Time', component: TeluguPanchangam },
    { id: 'morse', title: 'Morse', icon: 'timeline', category: 'Utility & Time', component: MorseCode },
    { id: 'bmi-metabolism', title: 'BMI & Metabolism', icon: 'person', category: 'Utility & Time', component: BMICalculator },
    { id: 'bmr-calc', title: 'BMR Calculator', icon: 'monitor_heart', category: 'Utility & Time', component: HealthTools },
    { id: 'calorie-calc', title: 'Calorie Needs', icon: 'local_fire_department', category: 'Utility & Time', component: HealthTools },
    { id: 'tip-split', title: 'Tip & Split', icon: 'restaurant', category: 'Utility & Time', component: MiscCalculators },
    { id: 'unit-converter', title: 'Unit Converter', icon: 'balance', category: 'Utility & Time', component: UnitConverter },
    { id: 'weighted-avg', title: 'Weighted Average', icon: 'show_chart', category: 'Utility & Time', component: MiscCalculators },
    { id: 'date-diff', title: 'Date Difference', icon: 'calendar_month', category: 'Utility & Time', component: MiscCalculators },
    { id: 'qr-gen', title: 'QR Generator', icon: 'qr_code_2', category: 'Utility & Time', component: QrGen },
    { id: 'qr-scan', title: 'QR Scanner', icon: 'qr_code_scanner', category: 'Utility & Time', component: QrScanner },
    { id: 'barcode-gen', title: 'Barcode Generator', icon: 'barcode_reader', category: 'Utility & Time', component: Generators },
    { id: 'random-numbers', title: 'Random Numbers', icon: 'pin', category: 'Utility & Time', component: Generators },
    { id: 'fake-data', title: 'Fake Data', icon: 'reorder', category: 'Utility & Time', component: Generators },
    { id: 'url-shortener', title: 'URL Shortener', icon: 'link', category: 'Utility & Time', component: TextUtils },
    { id: 'character-counter', title: 'Character Counter', icon: 'format_list_numbered', category: 'Utility & Time', component: TextUtils },
    { id: 'word-rank', title: 'Word Rank', icon: 'sort_by_alpha', category: 'Utility & Time', component: TextUtils },
    { id: 'html-entities', title: 'HTML Entities', icon: 'html', category: 'Utility & Time', component: TextUtils },
    { id: 'lorem-ipsum', title: 'Lorem Ipsum', icon: 'notes', category: 'Utility & Time', component: TextUtils },
    { id: 'emoji-text', title: 'Emoji Text', icon: 'mood', category: 'Utility & Time', component: TextUtils },
    { id: 'invisible-char', title: 'Invisible Character', icon: 'visibility_off', category: 'Utility & Time', component: TextUtils },
    { id: 'case-converter', title: 'Case Converter', icon: 'title', category: 'Utility & Time', component: TextUtils },
    { id: 'text-repeater', title: 'Text Repeater', icon: 'repeat', category: 'Utility & Time', component: TextUtils },
    { id: 'list-sorter', title: 'List Sorter', icon: 'sort', category: 'Utility & Time', component: TextUtils },
    { id: 'reverse-text', title: 'Reverse Text', icon: 'settings_backup_restore', category: 'Utility & Time', component: TextUtils },
    { id: 'binary-conv', title: 'Binary Converter', icon: 'data_object', category: 'Utility & Time', component: TextUtils },
    { id: 'hex-conv', title: 'Hex Converter', icon: 'hexagon', category: 'Utility & Time', component: TextUtils },
    { id: 'caesar-cipher', title: 'Caesar Cipher', icon: 'lock_open', category: 'Utility & Time', component: TextUtils },
    { id: 'braille', title: 'Braille Translator', icon: 'pattern', category: 'Utility & Time', component: TextUtils },
    { id: 'ascii-art', title: 'ASCII Art', icon: 'font_download', category: 'Utility & Time', component: TextUtils },
    { id: 'currency-conv', title: 'Currency Exchange', icon: 'payments', category: 'Utility & Time', component: CurrencyConverter },
    { id: 'vat-calc', title: 'VAT Calculator', icon: 'receipt_long', category: 'Utility & Time', component: FinanceCalculators },
    { id: 'inflation', title: 'Inflation', icon: 'trending_up', category: 'Utility & Time', component: FinanceCalculators },
    { id: 'loan-calc', title: 'Loan Calculator', icon: 'credit_card', category: 'Utility & Time', component: FinanceCalculators },
    { id: 'compound-int', title: 'Compound Interest', icon: 'savings', category: 'Utility & Time', component: FinanceCalculators },
    { id: 'cagr', title: 'CAGR', icon: 'query_stats', category: 'Utility & Time', component: FinanceCalculators },
    { id: 'dcf', title: 'DCF', icon: 'account_balance', category: 'Utility & Time', component: FinanceCalculators },
    { id: 'frequency-gen', title: 'Frequency Gen', icon: 'waves', category: 'Utility & Time', component: AudioTools },
    { id: 'tuner', title: 'Instrument Tuner', icon: 'music_note', category: 'Utility & Time', component: AudioTools },
];

const ToolboxView = ({ searchQuery, groupToolbox, showStats, recentTools, setRecentTools, hideRecentTools }) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [pinnedTools, setPinnedTools] = useState(storage.getJSON('hub_pinned_tools', []));

  useEffect(() => {
    storage.setJSON('hub_pinned_tools', pinnedTools);
  }, [pinnedTools]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    let newPinned;
    if (pinnedTools.includes(id)) {
      newPinned = pinnedTools.filter(t => t !== id);
    } else {
      newPinned = [id, ...pinnedTools];
    }
    setPinnedTools(newPinned);
  };

  const openTool = (id, skipHistory = false) => {
    if (activeToolId === id) return;
    setActiveToolId(id);
    setCurrentResult(null);

    const tool = TOOLS.find(t => t.id === id);
    if (tool) {
      const newRecents = [id, ...recentTools.filter(t => t !== id)].slice(0, 4);
      setRecentTools(newRecents);
      storage.setJSON('hub_recent_tools', newRecents);
    }

    if (!skipHistory) {
      const url = new URL(window.location);
      url.searchParams.set('tab', 'toolbox');
      url.searchParams.set('tool', id);
      window.history.pushState({ toolId: id, tab: 'toolbox' }, '', url.toString());
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      const params = new URLSearchParams(window.location.search);
      const toolId = params.get('tool');
      const tab = params.get('tab');

      if (tab === 'toolbox' && toolId) {
        setActiveToolId(toolId);
      } else {
        setActiveToolId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Handle initial tool from URL
    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('tool');
    if (toolId) {
      setActiveToolId(toolId);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleShare = async (e, tool) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nature toolbox - ${tool.title}`,
          text: `Check out the ${tool.title} tool on Nature toolbox dashboard!`,
          url: window.location.origin + window.location.pathname + `?tab=toolbox&tool=${tool.id}`
        });
      } catch (err) { console.error("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + `?tab=toolbox&tool=${tool.id}`);
      alert("Tool link copied to clipboard!");
    }
  };

  const filteredTools = useMemo(() => TOOLS.filter(t => {
    let matchesSearch = true;
    let matchesCat = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('cat:')) {
        const catQuery = query.replace('cat:', '').trim();
        matchesCat = t.category.toLowerCase().includes(catQuery);
        matchesSearch = true;
      } else {
        matchesSearch = t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query);
      }
    }

    if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
      if (activeCategory === 'Pinned') matchesCat = pinnedTools.includes(t.id);
      else if (activeCategory !== 'All') matchesCat = t.category === activeCategory;
    }

    return matchesSearch && matchesCat;
  }), [searchQuery, activeCategory, pinnedTools]);

  const { grouped, cats } = useMemo(() => {
    const grouped = {};
    filteredTools.forEach(t => {
      (grouped[t.category] || (grouped[t.category] = [])).push(t);
    });
    // Sort tools within each category: Pinned first, then Alphabetical
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => {
        const aPinned = pinnedTools.includes(a.id);
        const bPinned = pinnedTools.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return a.title.localeCompare(b.title);
      });
    });
    return { grouped, cats: Object.keys(grouped).sort() };
  }, [filteredTools, pinnedTools]);

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const collapseAll = () => {
    const newCollapsed = {};
    cats.forEach(cat => newCollapsed[cat] = true);
    setCollapsedCategories(newCollapsed);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const stats = {};
  TOOLS.forEach(t => {
    stats[t.category] = (stats[t.category] || 0) + 1;
  });

  const handleCopyResult = () => {
    if (!currentResult?.text) return;
    navigator.clipboard.writeText(currentResult.text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadResult = () => {
    if (!currentResult) return;
    const { text, blob, filename } = currentResult;
    const finalBlob = blob || new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toolboxCategories = useMemo(() => {
    const cats = {};
    [...new Set(TOOLS.map(t => t.category))].forEach(cat => {
      cats[cat] = getCategoryIcon(cat);
    });
    return cats;
  }, []);

  if (activeToolId) {
    const tool = TOOLS.find(t => t.id === activeToolId);
    if (!tool) {
      return (
        <div className="tool-view">
          <div className="tool-view-header">
            <button className="icon-btn" onClick={() => { setActiveToolId(null); window.history.back(); }} title="Back to Toolbox">
              <span className="material-icons">arrow_back</span>
            </button>
            <h2 className="m-0">Tool Not Found</h2>
          </div>
          <NatureEmptyState
            title="Lost in the woods?"
            body="The tool you're looking for doesn't seem to exist in our toolbox."
            action={{ label: "Back to Toolbox", onClick: () => { setActiveToolId(null); window.history.back(); } }}
          />
        </div>
      );
    }
    return (
      <div className="tool-view">
        <div className="tool-view-header">
          <div className="flex-center" style={{ gap: '12px' }}>
            <button className="icon-btn" onClick={() => { setActiveToolId(null); window.history.back(); }} title="Back to Toolbox">
              <span className="material-icons">arrow_back</span>
            </button>
            <div className="flex-center" style={{ gap: '12px' }}>
              <span className="material-icons" style={{fontSize: '2rem', color: 'var(--primary)'}}>{tool.icon}</span>
              <h2 className="m-0" style={{ fontSize: '1.75rem' }}>{tool.title}</h2>
            </div>
          </div>
          <div className="flex-center" style={{ gap: '10px' }}>
            {currentResult?.text && (
              <button className={`icon-btn ${copySuccess ? 'copy-success' : ''}`} onClick={handleCopyResult} title="Copy Result">
                <span className="material-icons">{copySuccess ? 'check' : 'content_copy'}</span>
              </button>
            )}
            {currentResult && (
              <button className="icon-btn" onClick={handleDownloadResult} title="Download Result">
                <span className="material-icons">download</span>
              </button>
            )}
          </div>
        </div>
        <div className="tool-container-inner">
          <Suspense fallback={<div className="text-center p-20"><span className="material-icons rotating">refresh</span> Loading tool...</div>}>
            {tool.component ? <tool.component onResultChange={setCurrentResult} toolId={tool.id} /> : <div className="text-center p-20 opacity-5">This tool is under development.</div>}
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <>
      <CategoryNav
        categories={toolboxCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showStats={showStats}
        stats={stats}
        totalCount={TOOLS.length}
        extraCategories={[
          { name: 'Pinned', icon: 'push_pin', count: pinnedTools.length }
        ]}
      />

      <div className="toolbox-page-header">
        <h2>Toolbox</h2>
        <p>Collection of useful offline utilities.</p>
        {groupToolbox && cats.length > 0 && (
          <div className="pill-group flex-center mt-20">
            <button className="pill p-8-16" onClick={collapseAll} style={{ fontSize: '0.8rem' }}>
              <span className="material-icons" style={{ fontSize: '1.1rem' }}>unfold_less</span> Collapse All
            </button>
            <button className="pill p-8-16" onClick={expandAll} style={{ fontSize: '0.8rem' }}>
              <span className="material-icons" style={{ fontSize: '1.1rem' }}>unfold_more</span> Expand All
            </button>
          </div>
        )}
      </div>

      {activeCategory === 'All' && !searchQuery && (
        <div className="p-0-10 mb-20">
          {(pinnedTools.length > 0 || (recentTools.length > 0 && !hideRecentTools)) && (
            <div className="toolbox-special-sections-container">
              <div className="toolbox-special-sections grid gap-15" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {pinnedTools.length > 0 && (
                  <div className="special-section">
                    <h3 className="uppercase tracking-wider opacity-6 mb-10 flex-center gap-10" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }}>
                      <span className="material-icons" style={{ fontSize: '1.2rem' }}>push_pin</span> Pinned
                    </h3>
                    <div className="grid gap-12">
                      {pinnedTools.map(id => {
                        const tool = TOOLS.find(t => t.id === id);
                        if (!tool) return null;
                        return (
                          <div key={id} className="card p-15 min-h-unset no-animation" onClick={() => openTool(tool.id)}>
                            <div className="card-header m-0 gap-12">
                              <span className="material-icons" style={{ color: 'var(--primary)' }}>{tool.icon}</span>
                              <span className="font-semibold">{tool.title}</span>
                            </div>
                            <div className="card-actions">
                              <button className="pin-btn active" onClick={(e) => togglePin(e, tool.id)}><span className="material-icons">push_pin</span></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {recentTools.length > 0 && !hideRecentTools && (
                  <div className="special-section">
                    <h3 className="uppercase tracking-wider opacity-6 mb-10 flex-center gap-10" style={{ fontSize: '0.9rem', justifyContent: 'flex-start' }}>
                      <span className="material-icons" style={{ fontSize: '1.2rem' }}>history</span> Recent
                    </h3>
                    <div className="grid gap-12">
                      {recentTools.filter(id => !pinnedTools.includes(id)).map(id => {
                        const tool = TOOLS.find(t => t.id === id);
                        if (!tool) return null;
                        return (
                          <div key={id} className="card p-15 min-h-unset no-animation" onClick={() => openTool(tool.id)}>
                            <div className="card-header m-0 gap-12">
                              <span className="material-icons" style={{ color: 'var(--text-muted)' }}>{tool.icon}</span>
                              <span className="font-semibold">{tool.title}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {filteredTools.length === 0 ? (
        <NatureEmptyState
          title={searchQuery ? "No matching tools" : "The toolbox is empty"}
          body={searchQuery ? `No tools match "${searchQuery}". Try a different search.` : "Wait for the seeds to grow or check back later."}
        />
      ) : !groupToolbox ? (
        <div className="category-grid p-0-10">
           {[...filteredTools]
             .sort((a, b) => {
               const aPinned = pinnedTools.includes(a.id);
               const bPinned = pinnedTools.includes(b.id);
               if (aPinned && !bPinned) return -1;
               if (!aPinned && bPinned) return 1;
               return 0; // Keep original search order if both pinned or both not pinned
             })
             .map((tool, idx) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                idx={idx}
                isPinned={pinnedTools.includes(tool.id)}
                togglePin={togglePin}
                handleShare={handleShare}
                openTool={openTool}
                searchQuery={searchQuery}
                highlightText={highlightText}
              />
            ))}
        </div>
      ) : (
        cats.map(cat => (
          <div key={cat} className={`category-section ${collapsedCategories[cat] ? 'collapsed' : ''}`}>
            <div className="category-header" onClick={() => toggleCategoryCollapse(cat)}>
              <div className="category-title">
                <span className="material-icons">{getCategoryIcon(cat)}</span>
                {cat}
                {showStats && <span className="count">{grouped[cat].length}</span>}
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {grouped[cat].map((tool, idx) => (
                <ToolCard
                    key={tool.id}
                    tool={tool}
                    idx={idx}
                    isPinned={pinnedTools.includes(tool.id)}
                    togglePin={togglePin}
                    handleShare={handleShare}
                    openTool={openTool}
                    searchQuery={searchQuery}
                    highlightText={highlightText}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const ToolCard = memo(({ tool, idx, isPinned, togglePin, handleShare, openTool, searchQuery, highlightText }) => (
    <div id={`card-${tool.id}`} className="card" style={{'--delay': idx}} onClick={() => openTool(tool.id)}>
       <div className="card-actions">
            <button className={`pin-btn ${isPinned ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)} title="Pin Tool">
                <span className="material-icons">push_pin</span>
            </button>
            <button onClick={(e) => handleShare(e, tool)} title="Share Tool">
                <span className="material-icons">share</span>
            </button>
       </div>
       <div className="card-header">
            <div className="card-icon flex-center" style={{ background: 'var(--bg)' }}>
                <span className="material-icons">{tool.icon}</span>
            </div>
            <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(tool.title, searchQuery) }} />
        </div>
    </div>
));

const getCategoryIcon = (cat) => {
    const icons = {
        'Productivity': 'assignment',
        'Creative': 'brush',
        'Media': 'perm_media',
        'Developer': 'terminal',
        'Data & Science': 'insights',
        'Security': 'security',
        'Sensors': 'sensors',
        'Games': 'casino',
        'Education & Math': 'school',
        'Utility & Time': 'more_horiz'
    };
    return icons[cat] || 'folder';
};

export default ToolboxView;
