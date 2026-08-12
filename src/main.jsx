import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChevronDown,
  Globe2,
  Cpu,
  TrendingUp,
  Sparkles,
  Rocket,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Phone,
  Calendar,
  Menu,
  House,
  Headphones,
  Info,
  IdCard,
  Crown,
  Wrench,
  User,
  LogOut,
  Search,
  Heart,
  Upload,
  Plus,
  Check,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { supabase, SITE_SETTINGS_ID, SUPABASE_ADMIN_EMAIL } from "./supabaseClient";
import "./styles.css";

const DASHBOARD_SERVICES_STORAGE_KEY = "beat-body-dashboard-services";
const DASHBOARD_FEATURED_SERVICES_STORAGE_KEY = "beat-body-dashboard-featured-services";
const LANGUAGE_STORAGE_KEY = "beat-body-language";
const CONTACT_PHONES_STORAGE_KEY = "beat-body-contact-phones";
const CONTACT_EMAILS_STORAGE_KEY = "beat-body-contact-emails";
const CONTACT_SETTINGS_STORAGE_KEY = "beat-body-contact-settings";
const BLOCKED_DATES_STORAGE_KEY = "beat-body-blocked-dates";
const DASHBOARD_UNLOCK_STORAGE_KEY = "beat-body-dashboard-unlocked";
const MAX_CONTACT_PHONES = 3;
const MAX_CONTACT_EMAILS = 2;
const DEFAULT_CONTACT_PHONES = ["+212 645461998"];

const readStoredJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
};

const cleanStringList = (items, maxItems) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, maxItems);
};

const readStoredContactSettings = () => {
  const storedSettings = readStoredJson(CONTACT_SETTINGS_STORAGE_KEY, null);
  const storedPhones = cleanStringList(storedSettings?.phones, MAX_CONTACT_PHONES);
  const storedEmails = cleanStringList(storedSettings?.emails, MAX_CONTACT_EMAILS);

  if (storedSettings && (storedPhones.length || storedEmails.length || Array.isArray(storedSettings?.phones))) {
    return { phones: storedPhones, emails: storedEmails };
  }

  return {
    phones: cleanStringList(readStoredJson(CONTACT_PHONES_STORAGE_KEY, DEFAULT_CONTACT_PHONES), MAX_CONTACT_PHONES),
    emails: cleanStringList(readStoredJson(CONTACT_EMAILS_STORAGE_KEY, []), MAX_CONTACT_EMAILS),
  };
};

const readStoredLanguage = () => {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return ["fr", "ar", "en"].includes(stored) ? stored : "fr";
};

const normalizeSiteSettings = (data) => ({
  services: Array.isArray(data?.services) ? data.services : servicesPageItems,
  featuredServices: Array.isArray(data?.featuredServices) ? data.featuredServices : [],
  pricing: Array.isArray(data?.pricing) ? data.pricing : pricingPlans,
  phones: cleanStringList(data?.phones, MAX_CONTACT_PHONES),
  emails: cleanStringList(data?.emails, MAX_CONTACT_EMAILS),
  blockedDates: Array.isArray(data?.blockedDates) ? data.blockedDates : [],
});

const translations = {
  fr: {
    code: "FR",
    label: "Français",
    flag: "\u{1F1EB}\u{1F1F7}",
    dir: "ltr",
    nav: ["Accueil", "Services", "À propos", "Contact"],
    session: "Réserver votre séance",
    intro:
      "Transformez votre corps plus vite avec une technologie EMS avancée. Là où la performance rencontre la récupération.",
    infoTitle: "Là où la performance rencontre la récupération.",
    infoBody:
      "Combinez la technologie EMS, un coaching expert et des solutions de récupération pour libérer tout votre potentiel physique.",
    pricing: "Voir les tarifs",
    proof:
      "L'une des destinations pionnières du Maroc combinant technologie EMS, récupération sportive et optimisation des performances sous un même toit.",
    proofShort: "L'une des destinations pionnières du Maroc",
  },
  ar: {
    code: "AR",
    label: "العربية",
    flag: "\u{1F1F8}\u{1F1E6}",
    dir: "rtl",
    nav: ["الرئيسية", "الخدمات", "من نحن", "تواصل"],
    session: "احجز جلستك",
    intro:
      "حوّل جسمك بسرعة أكبر مع تقنية EMS المتقدمة. حيث تلتقي القوة بالتعافي.",
    infoTitle: "حيث تلتقي القوة بالتعافي.",
    infoBody:
      "نجمع بين تقنية EMS والتدريب المتخصص وحلول التعافي لإطلاق كامل إمكاناتك البدنية.",
    pricing: "عرض الأسعار",
    proof:
      "إحدى الوجهات الرائدة في المغرب التي تجمع بين تقنية EMS والتعافي الرياضي وتحسين الأداء تحت سقف واحد.",
    proofShort: "إحدى الوجهات الرائدة في المغرب",
  },
  en: {
    code: "EN",
    label: "English",
    flag: "\u{1F1EC}\u{1F1E7}",
    dir: "ltr",
    nav: ["Home", "Services", "About", "Contact"],
    session: "Book Your Session",
    intro:
      "Transform your body faster with advanced EMS technology. Where performance meets recovery.",
    infoTitle: "Where performance meets recovery.",
    infoBody:
      "Combining EMS technology, expert coaching, and recovery solutions to unlock your full physical potential.",
    pricing: "View Pricing",
    proof:
      "One of Morocco's pioneering destinations combining EMS technology, sports recovery, and performance optimization under one roof.",
    proofShort: "One of Morocco's pioneering destinations",
  },
};

const pageText = {
  fr: {
    servicesKicker: "UNE NOUVELLE ÈRE DU FITNESS ET DE LA RÉCUPÉRATION",
    priorityKicker: "NOTRE PRIORITÉ",
    priorityWords: ["TECHNOLOGIE", "AVANCÉE", "ACCOMPAGNEMENT", "EXPERT", "RÉSULTATS", "EXCEPTIONNELS"],
    aboutPreviewTitle: "À PROPOS DE BEAT BODY",
    aboutPreviewBody: "Beat Body combine la technologie EMS avancée, les solutions de récupération sportive et le coaching personnalisé pour vous aider à atteindre vos objectifs plus vite, plus intelligemment et en moins de temps que les méthodes d'entraînement traditionnelles.",
    allServices: "TOUS LES SERVICES",
    viewPricing: "Voir les tarifs",
    bookSession: "Réserver votre séance",
    whyTitle: "POURQUOI BEAT BODY",
    whyItems: [
      ["Programmes adaptés à chaque objectif", "Que votre objectif soit la perte de poids, le gain musculaire, la rééducation ou l'amélioration de la performance."],
      ["Coachs et spécialistes experts", "Bénéficiez de conseils de professionnels qualifiés spécialisés en performance et récupération."],
      ["Une expérience complète de récupération", "La récupération n'est pas une option - elle fait partie du processus."],
      ["Équipement EMS de pointe", "Entraînez-vous avec la dernière génération de technologie EMS conçue pour la performance et l'efficacité."],
    ],
    journeyTitle: "VOTRE PARCOURS COMMENCE ICI",
    journeyCards: ["Réservez votre consultation", "Créez votre plan", "Récupérez, progressez", "Entraînez-vous, récupérez, progressez"],
    performanceTitle: "ENTRAÎNEZ-VOUS PLUS INTELLIGEMMENT. RÉCUPÉREZ PLUS VITE. PERFORMEZ MIEUX.",
    performanceTiles: ["ACTIVATION COMPLÈTE DU CORPS", "RÉCUPÉRATION PLUS RAPIDE", "TECHNOLOGIE MODERNE", "EXPÉRIENCE PERSONNALISÉE"],
    pricingTitle: "DES PLANS FLEXIBLES POUR CHAQUE PARCOURS",
    perMonth: "/mois",
    ctaBadge: "Équipement EMS moderne et avancé",
    ctaTitle1: "Prêt à découvrir",
    ctaTitle2: "le futur du fitness ?",
    ctaBody: "Rejoignez Beat Body et découvrez une façon plus intelligente de vous entraîner, récupérer et performer.",
    ctaButton: "Réserver votre première séance",
    ctaSmall: "Moins de temps. Meilleure récupération. Résultats plus forts.",
    footerTagline: "Technologie avancée. Accompagnement expert. Résultats exceptionnels.",
    followUs: "Suivez-nous",
    footerSections: [
      ["Accueil", ["Hero", "Pourquoi Beat Body", "Parcours"]],
      ["Services", ["EMS Training", "Récupération", "Technologie"]],
      ["À propos", ["À propos de Beat Body", "Notre priorité", "Résultats"]],
      ["Contact", ["Réserver votre séance", "Support", "Localisation"]],
    ],
    rights: "© 2026 BEAT BODY. Tous droits réservés.",
    aboutHeroTitle1: "PLUS QUE DU FITNESS.",
    aboutHeroTitle2: "PAS QUE DES CORPS",
    aboutHeroSubtitle: "NOUS CONSTRUISONS LA PERFO",
    aboutHeroStrong: "RMANCE.",
    philosophyTitle: "NOTRE PHILOSOPHIE",
    philosophyBody: "CHEZ BEAT BODY, LA PERFORMANCE NE SE MESURE PAS AU TEMPS PASSÉ À S'ENTRAÎNER, MAIS À LA QUALITÉ DE CHAQUE MOUVEMENT, CHAQUE RÉCUPÉRATION ET CHAQUE RÉSULTAT.",
    aboutStoryTitle: "L'HISTOIRE BEAT BODY",
    aboutExperienceTitle: "L'EXPÉRIENCE BEAT BODY",
    aboutStorySteps: [
      ["VISION", "VISION", "TOUT A COMMENCÉ PAR UNE QUESTION : ET SI LA RÉCUPÉRATION ÉTAIT CONÇUE AVEC LA MÊME PRÉCISION QUE LA PERFORMANCE ?"],
      ["INNOVATION", "INNOVATION", "NOUS AVONS ASSOCIÉ LA TECHNOLOGIE EMS À DES MÉTHODES D'ENTRAÎNEMENT COGNITIF UTILISÉES PAR LES ATHLÈTES D'ÉLITE."],
      ["TECHNOLOGIE", "TECHNOLOGIE", "CHAQUE APPAREIL, CHAQUE PROTOCOLE, EST CALIBRÉ POUR LIRE ET RÉPONDRE À VOTRE CORPS EN TEMPS RÉEL."],
      ["RÉCUPÉRATION", "RÉCUPÉRATION", "LA RÉCUPÉRATION MUSCULAIRE N'EST PAS DU REPOS. C'EST UNE RÉPARATION ACTIVE, GUIDÉE PAR LES DONNÉES ET PAR L'EXPERTISE."],
      ["PERFORMANCE", "PERFORMANCE", "20 MINUTES. 300+ MUSCLES. UNE SÉANCE CONÇUE POUR LE RÉSULTAT."],
      ["RÉSULTATS", "RÉSULTATS", "UNE FORCE MESURABLE. UNE RÉCUPÉRATION MESURABLE. UNE DIFFÉRENCE MESURABLE."],
    ],
    aboutExperienceItems: ["RÉCUPÉRATION", "EMS", "BIEN-ÊTRE", "RÉSULTATS", "PERFORMANCE", "COACHING"],
    contactTitle1: "Commençons Ta",
    contactTitle2: "Transformation",
    contactBadge: "Équipement EMS moderne et avancé",
    contactIntro: "Que vous soyez prêt à réserver votre première séance d'EMS ou que vous ayez simplement une question, notre équipe est là pour vous guider à chaque étape.",
    contactFeatures: ["Technologie avancée", "Conseils d'expert", "Résultats exceptionnels", "Développez votre corps", "Et bien plus encore"],
    formTab: "Remplir le formulaire",
    callTab: "Appelez-le",
    formNote: "Nous te contacterons bientôt pour confirmer la réservation.",
    callNote: "Notre équipe est disponible pour répondre à toutes vos questions.",
    namePlaceholder: "Prénom et Nom *",
    phonePlaceholder: "6XX XXX XXX",
    emailPlaceholder: "Email",
    messagePlaceholder: "Message*",
    reserveButton: "Réserve ma séance",
    datePreferred: "Date préférée",
    continue: "Continuer",
    weekdays: ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"],
    serviceTexts: {
      "EMS TRAINING": ["ENTRAÎNEMENT EMS", "ACTIVEZ PLUS DE MUSCLES EN MOINS DE TEMPS GRÂCE À UNE TECHNOLOGIE D'ÉLECTROSTIMULATION INTELLIGENTE."],
      "PERSONALIZED COACHING": ["COACHING PERSONNALISÉ", "DES PROGRAMMES ADAPTÉS À VOS OBJECTIFS, VOTRE NIVEAU ET VOTRE CONDITION PHYSIQUE."],
      "SPORTS RECOVERY": ["RÉCUPÉRATION SPORTIVE", "ACCÉLÉREZ LA RÉCUPÉRATION ET RÉDUISEZ LA FATIGUE MUSCULAIRE APRÈS L'EFFORT."],
      "MASSAGE THERAPY": ["MASSAGE THÉRAPEUTIQUE", "UN MASSAGE PROFESSIONNEL CONÇU POUR LES ATHLÈTES ET LES MODES DE VIE ACTIFS."],
      "MUSCLE RECOVERY": ["RÉCUPÉRATION MUSCULAIRE", "RESTAUREZ LA FONCTION MUSCULAIRE ET AMÉLIOREZ LA FLEXIBILITÉ ET LA MOBILITÉ."],
      "COGNITIVE BODY TRAINING": ["ENTRAÎNEMENT CORPS-ESPRIT", "UNE APPROCHE HOLISTIQUE QUI COMBINE PERFORMANCE, COORDINATION ET ENGAGEMENT MENTAL."],
    },
    pricingPlans: {
      Starter: ["Débutant", "Idéal pour découvrir la technologie EMS et vivre vos premières séances.", ["4 séances", "Évaluation personnalisée", "Suivi des progrès"]],
      Performance: ["Performance", "Conçu pour les clients axés sur les résultats et la progression durable.", ["8 séances", "Coaching personnalisé", "Analyse de composition corporelle", "Suivi des progrès"]],
      Elite: ["Elite", "L'expérience Beat Body complète.", ["12 séances", "Coaching personnalisé", "Séances de récupération", "Réservation prioritaire", "Suivi complet des progrès"]],
    },
  },
  en: {
    servicesKicker: "A NEW ERA OF FITNESS AND RECOVERY",
    priorityKicker: "OUR PRIORITY",
    priorityWords: ["ADVANCED", "TECHNOLOGY", "EXPERT", "GUIDANCE", "EXCEPTIONAL", "RESULTS"],
    aboutPreviewTitle: "ABOUT BEAT BODY",
    aboutPreviewBody: "Beat Body combines advanced EMS technology, sports recovery solutions, and personalized coaching to help you achieve your goals faster, smarter, and with less time than traditional training methods.",
    allServices: "ALL SERVICES",
    viewPricing: "View Pricing",
    bookSession: "Book Your Session",
    whyTitle: "WHY BEAT BODY",
    whyItems: [
      ["Tailored Programs for Every Goal", "Whether your objective is weight loss, muscle gain, rehabilitation, or performance improvement."],
      ["Expert Coaches and Specialists", "Receive guidance from qualified professionals specialized in performance and recovery."],
      ["A Complete Recovery Experience", "Recovery is not an option - it is part of the process."],
      ["State-of-the-Art EMS Equipment", "Train with the latest generation of EMS technology designed for performance and efficiency."],
    ],
    journeyTitle: "YOUR JOURNEY STARTS HERE",
    journeyCards: ["Book Your Consultation", "Create Your Plan", "Recover, Progress", "Train, Recover, Improve"],
    performanceTitle: "TRAIN SMARTER. RECOVER FASTER. PERFORM BETTER.",
    performanceTiles: ["FULL BODY ACTIVATION", "FASTER RECOVERY", "MODERN TECHNOLOGY", "PERSONALIZED EXPERIENCE"],
    pricingTitle: "FLEXIBLE PLANS FOR EVERY JOURNEY",
    perMonth: "/month",
    ctaBadge: "Modern and advanced EMS equipment",
    ctaTitle1: "Ready To Experience",
    ctaTitle2: "The Future Of Fitness?",
    ctaBody: "Join Beat Body and discover a smarter way to train, recover, and perform.",
    ctaButton: "Book Your First Session",
    ctaSmall: "Less time. Better recovery. Stronger results.",
    footerTagline: "Advanced technology. Expert guidance. Exceptional results.",
    followUs: "Follow us",
    footerSections: [
      ["Home", ["Hero", "Why Beat Body", "Journey"]],
      ["Services", ["EMS Training", "Recovery", "Technology"]],
      ["About", ["About Beat Body", "Our Priority", "Results"]],
      ["Contact", ["Book Your Session", "Support", "Location"]],
    ],
    rights: "© 2026 BEAT BODY. All rights reserved.",
    aboutHeroTitle1: "MORE THAN FITNESS.",
    aboutHeroTitle2: "NOT JUST BODIES",
    aboutHeroSubtitle: "WE BUILD PERFO",
    aboutHeroStrong: "RMANCE.",
    philosophyTitle: "OUR PHILOSOPHY",
    philosophyBody: "AT BEAT BODY, PERFORMANCE IS NOT MEASURED BY TIME SPENT TRAINING, BUT BY THE QUALITY OF EVERY MOVEMENT, EVERY RECOVERY, AND EVERY RESULT.",
    aboutStoryTitle: "THE BEAT BODY STORY",
    aboutExperienceTitle: "THE BEAT BODY EXPERIENCE",
    aboutStorySteps: [],
    aboutExperienceItems: [],
    contactTitle1: "Let's Start Your",
    contactTitle2: "Transformation",
    contactBadge: "Modern and advanced EMS equipment",
    contactIntro: "Whether you are ready to book your first EMS session or simply have a question, our team is here to guide you at every step.",
    contactFeatures: ["Advanced technology", "Expert guidance", "Exceptional results", "Develop your body", "And much more"],
    formTab: "Fill the form",
    callTab: "Call us",
    formNote: "We will contact you soon to confirm the reservation.",
    callNote: "Our team is available to answer all your questions.",
    namePlaceholder: "First and Last Name *",
    phonePlaceholder: "6XX XXX XXX",
    emailPlaceholder: "Email",
    messagePlaceholder: "Message*",
    reserveButton: "Book my session",
    datePreferred: "Preferred date",
    continue: "Continue",
    weekdays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    serviceTexts: {},
    pricingPlans: {},
  },
  ar: {
    servicesKicker: "عصر جديد للياقة والتعافي",
    priorityKicker: "أولويتنا",
    priorityWords: ["تكنولوجيا", "متقدمة", "إرشاد", "خبير", "نتائج", "استثنائية"],
    aboutPreviewTitle: "عن Beat Body",
    aboutPreviewBody: "تجمع Beat Body بين تقنية EMS المتقدمة وحلول التعافي الرياضي والتدريب الشخصي لمساعدتك على تحقيق أهدافك بشكل أسرع وأذكى وبوقت أقل من طرق التدريب التقليدية.",
    allServices: "كل الخدمات",
    viewPricing: "عرض الأسعار",
    bookSession: "احجز جلستك",
    whyTitle: "لماذا Beat Body",
    whyItems: [
      ["برامج مناسبة لكل هدف", "سواء كان هدفك خسارة الوزن أو بناء العضلات أو التأهيل أو تحسين الأداء."],
      ["مدربون وخبراء متخصصون", "احصل على توجيه من محترفين مؤهلين في الأداء والتعافي."],
      ["تجربة تعافي كاملة", "التعافي ليس خياراً، بل جزء من العملية."],
      ["معدات EMS متطورة", "تدرب بأحدث تقنيات EMS المصممة للأداء والكفاءة."],
    ],
    journeyTitle: "رحلتك تبدأ هنا",
    journeyCards: ["احجز استشارتك", "أنشئ خطتك", "تعافَ وتقدّم", "تدرّب، تعافَ، تحسّن"],
    performanceTitle: "تدرب بذكاء. تعافَ أسرع. أدِّ أفضل.",
    performanceTiles: ["تنشيط كامل للجسم", "تعافٍ أسرع", "تكنولوجيا حديثة", "تجربة شخصية"],
    pricingTitle: "خطط مرنة لكل رحلة",
    perMonth: "/شهر",
    ctaBadge: "معدات EMS حديثة ومتقدمة",
    ctaTitle1: "هل أنت مستعد لاكتشاف",
    ctaTitle2: "مستقبل اللياقة؟",
    ctaBody: "انضم إلى Beat Body واكتشف طريقة أذكى للتدريب والتعافي وتحسين الأداء.",
    ctaButton: "احجز جلستك الأولى",
    ctaSmall: "وقت أقل. تعافٍ أفضل. نتائج أقوى.",
    footerTagline: "تكنولوجيا متقدمة. توجيه خبير. نتائج استثنائية.",
    followUs: "تابعنا",
    footerSections: [
      ["الرئيسية", ["البطل", "لماذا Beat Body", "الرحلة"]],
      ["الخدمات", ["تدريب EMS", "التعافي", "التكنولوجيا"]],
      ["من نحن", ["عن Beat Body", "أولويتنا", "النتائج"]],
      ["تواصل", ["احجز جلستك", "الدعم", "الموقع"]],
    ],
    rights: "© 2026 BEAT BODY. جميع الحقوق محفوظة.",
    aboutHeroTitle1: "أكثر من لياقة.",
    aboutHeroTitle2: "ليس مجرد أجسام",
    aboutHeroSubtitle: "نحن نبني الأداء",
    aboutHeroStrong: "",
    philosophyTitle: "فلسفتنا",
    philosophyBody: "في Beat Body، لا تُقاس القوة بوقت التدريب، بل بجودة كل حركة وكل تعافٍ وكل نتيجة.",
    aboutStoryTitle: "قصة Beat Body",
    aboutExperienceTitle: "تجربة Beat Body",
    aboutStorySteps: [
      ["الرؤية", "الرؤية", "بدأ الأمر بسؤال: ماذا لو كان التعافي مصمماً بالدقة نفسها التي يُصمم بها الأداء؟"],
      ["الابتكار", "الابتكار", "جمعنا تقنية EMS مع أساليب التدريب الذهني المستخدمة لدى الرياضيين المحترفين."],
      ["التكنولوجيا", "التكنولوجيا", "كل جهاز وكل بروتوكول مضبوط لقراءة جسمك والاستجابة له في الوقت الحقيقي."],
      ["التعافي", "التعافي", "تعافي العضلات ليس مجرد راحة، بل إصلاح نشط موجه بالبيانات والخبرة."],
      ["الأداء", "الأداء", "20 دقيقة. أكثر من 300 عضلة. جلسة واحدة مصممة للنتيجة."],
      ["النتائج", "النتائج", "قوة قابلة للقياس. تعافٍ قابل للقياس. فرق قابل للقياس."],
    ],
    aboutExperienceItems: ["التعافي", "EMS", "العافية", "النتائج", "الأداء", "التدريب"],
    contactTitle1: "لنبدأ",
    contactTitle2: "تحولك",
    contactBadge: "معدات EMS حديثة ومتقدمة",
    contactIntro: "سواء كنت مستعداً لحجز أول جلسة EMS أو لديك سؤال، فريقنا هنا لإرشادك في كل خطوة.",
    contactFeatures: ["تكنولوجيا متقدمة", "إرشاد خبير", "نتائج استثنائية", "طوّر جسمك", "والمزيد"],
    formTab: "املأ النموذج",
    callTab: "اتصل بنا",
    formNote: "سنتواصل معك قريباً لتأكيد الحجز.",
    callNote: "فريقنا متاح للإجابة عن جميع أسئلتك.",
    namePlaceholder: "الاسم الكامل *",
    phonePlaceholder: "6XX XXX XXX",
    emailPlaceholder: "البريد الإلكتروني",
    messagePlaceholder: "الرسالة*",
    reserveButton: "احجز جلستي",
    datePreferred: "التاريخ المفضل",
    continue: "متابعة",
    weekdays: ["إثن", "ثلا", "أرب", "خمي", "جمع", "سبت", "أحد"],
    serviceTexts: {
      "EMS TRAINING": ["تدريب EMS", "نشّط عضلات أكثر في وقت أقل باستخدام تقنية التحفيز العضلي الذكية."],
      "PERSONALIZED COACHING": ["تدريب شخصي", "برامج مخصصة حسب أهدافك ومستواك وحالتك البدنية."],
      "SPORTS RECOVERY": ["تعافٍ رياضي", "سرّع التعافي وقلل التعب العضلي بعد النشاط المكثف."],
      "MASSAGE THERAPY": ["علاج بالتدليك", "تدليك علاجي احترافي مصمم للرياضيين وأنماط الحياة النشطة."],
      "MUSCLE RECOVERY": ["تعافي العضلات", "استعد وظيفة العضلات وحسّن المرونة والحركة."],
      "COGNITIVE BODY TRAINING": ["تدريب الجسم والذهن", "نهج شامل يجمع بين أداء الجسم والتنسيق والتركيز الذهني."],
    },
    pricingPlans: {
      Starter: ["البداية", "مثالي لاكتشاف تقنية EMS وتجربة جلساتك الأولى.", ["4 جلسات", "تقييم شخصي", "تتبع التقدم"]],
      Performance: ["الأداء", "مصمم للعملاء الذين يركزون على النتائج والتقدم طويل المدى.", ["8 جلسات", "تدريب شخصي", "تحليل تركيبة الجسم", "تتبع التقدم"]],
      Elite: ["النخبة", "تجربة Beat Body الكاملة.", ["12 جلسة", "تدريب شخصي", "جلسات تعافٍ", "حجز بأولوية", "متابعة كاملة للتقدم"]],
    },
  },
};

const scrollTimeline = {
  priority: { start: 0, end: 0.75 },
  about: { start: 1.4, end: 2.15 },
  services: { start: 2.8, end: 3.54 },
  why: { start: 4.19, end: 4.94 },
  journey: { start: 5.59, end: 6.34, sequenceStart: 6.34, sequenceEnd: 8.94 },
  performance: { start: 9.59, end: 10.5 },
  pricing: { start: 11.15, end: 12.45 },
  cta: { start: 13.1, end: 14.01 },
  footer: { start: 14.01, end: 14.66 },
};

const homeScrollAnchors = [
  0,
  scrollTimeline.about.start,
  scrollTimeline.services.start,
  scrollTimeline.why.start,
  scrollTimeline.journey.start,
  scrollTimeline.journey.sequenceEnd,
  scrollTimeline.performance.start + (scrollTimeline.performance.end - scrollTimeline.performance.start) * 0.86,
  scrollTimeline.pricing.start + (scrollTimeline.pricing.end - scrollTimeline.pricing.start) * 0.3,
  scrollTimeline.cta.start + (scrollTimeline.cta.end - scrollTimeline.cta.start) * 0.82,
  scrollTimeline.footer.end,
];

function App() {
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [language, setLanguage] = useState(readStoredLanguage);
  const [journeyHeaderActive, setJourneyHeaderActive] = useState(false);
  const [heroHeaderActive, setHeroHeaderActive] = useState(true);
  const [dashboardUnlocked, setDashboardUnlocked] = useState(false);
  const [dashboardAuthChecked, setDashboardAuthChecked] = useState(false);
  const [page, setPage] = useState(
    () => (typeof window !== "undefined" && window.location.hash === "#dashboard" ? "dashboard" : "home"),
  );
  const [pricingPlansData, setPricingPlansData] = useState(() => pricingPlans);
  const initialContactSettingsRef = useRef(null);
  if (!initialContactSettingsRef.current) {
    initialContactSettingsRef.current = readStoredContactSettings();
  }
  const [contactPhones, setContactPhones] = useState(() => {
    const phones = initialContactSettingsRef.current?.phones || [];
    return phones.length ? phones : DEFAULT_CONTACT_PHONES;
  });
  const [contactEmails, setContactEmails] = useState(() => {
    return initialContactSettingsRef.current?.emails || [];
  });
  const [blockedDates, setBlockedDates] = useState(() => {
    const storedDates = readStoredJson(BLOCKED_DATES_STORAGE_KEY, []);
    return new Set(Array.isArray(storedDates) ? storedDates : []);
  });
  const [serviceItems, setServiceItems] = useState(() => {
    const storedServices = readStoredJson(DASHBOARD_SERVICES_STORAGE_KEY, null);
    return Array.isArray(storedServices) ? storedServices : servicesPageItems;
  });
  const [featuredServiceTitles, setFeaturedServiceTitles] = useState(
    () => {
      const defaultFeatured = servicesPageItems.filter((service) => service.overlay).map((service) => service.title);
      const storedFeatured = readStoredJson(DASHBOARD_FEATURED_SERVICES_STORAGE_KEY, null);
      return Array.isArray(storedFeatured) ? storedFeatured : defaultFeatured;
    },
  );

  useEffect(() => {
    let cancelled = false;

    const loadSiteSettings = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("site_settings")
        .select("data")
        .eq("id", SITE_SETTINGS_ID)
        .single();

      if (cancelled || error || !data?.data) return;

      const settings = normalizeSiteSettings(data.data);
      setServiceItems(settings.services.length ? settings.services : servicesPageItems);
      setFeaturedServiceTitles(settings.featuredServices);
      setPricingPlansData(settings.pricing.length ? settings.pricing : pricingPlans);
      setContactPhones(settings.phones.length ? settings.phones : DEFAULT_CONTACT_PHONES);
      setContactEmails(settings.emails);
      setBlockedDates(new Set(settings.blockedDates));
    };

    loadSiteSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      window.sessionStorage.removeItem(DASHBOARD_UNLOCK_STORAGE_KEY);
      setDashboardUnlocked(false);
      setDashboardAuthChecked(true);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      const hasSession = Boolean(data.session);
      if (hasSession) {
        window.sessionStorage.setItem(DASHBOARD_UNLOCK_STORAGE_KEY, "true");
        setDashboardUnlocked(true);
      } else {
        window.sessionStorage.removeItem(DASHBOARD_UNLOCK_STORAGE_KEY);
        setDashboardUnlocked(false);
      }
      setDashboardAuthChecked(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        window.sessionStorage.setItem(DASHBOARD_UNLOCK_STORAGE_KEY, "true");
        setDashboardUnlocked(true);
      } else {
        window.sessionStorage.removeItem(DASHBOARD_UNLOCK_STORAGE_KEY);
        setDashboardUnlocked(false);
      }
      setDashboardAuthChecked(true);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setPage(window.location.hash === "#dashboard" ? "dashboard" : "home");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setReady(true), 3820);
    const splashTimer = window.setTimeout(() => setShowSplash(false), 2450);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(splashTimer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = translations[language]?.dir || "ltr";
    document.documentElement.classList.add("notranslate");
    document.documentElement.setAttribute("translate", "no");
    document.body.classList.add("notranslate");
    document.body.setAttribute("translate", "no");
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(DASHBOARD_SERVICES_STORAGE_KEY, JSON.stringify(serviceItems));
  }, [serviceItems]);

  useEffect(() => {
    window.localStorage.setItem(DASHBOARD_FEATURED_SERVICES_STORAGE_KEY, JSON.stringify(featuredServiceTitles));
  }, [featuredServiceTitles]);

  useEffect(() => {
    const phones = cleanStringList(contactPhones, MAX_CONTACT_PHONES);
    const emails = cleanStringList(contactEmails, MAX_CONTACT_EMAILS);
    window.localStorage.setItem(CONTACT_SETTINGS_STORAGE_KEY, JSON.stringify({ phones, emails }));
    window.localStorage.setItem(CONTACT_PHONES_STORAGE_KEY, JSON.stringify(phones));
    window.localStorage.setItem(CONTACT_EMAILS_STORAGE_KEY, JSON.stringify(emails));
  }, [contactPhones, contactEmails]);

  useEffect(() => {
    window.localStorage.setItem(BLOCKED_DATES_STORAGE_KEY, JSON.stringify([...blockedDates]));
  }, [blockedDates]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== CONTACT_SETTINGS_STORAGE_KEY || !event.newValue) return;
      try {
        const settings = JSON.parse(event.newValue);
        const phones = cleanStringList(settings?.phones, MAX_CONTACT_PHONES);
        const emails = cleanStringList(settings?.emails, MAX_CONTACT_EMAILS);
        setContactPhones(phones.length ? phones : DEFAULT_CONTACT_PHONES);
        setContactEmails(emails);
      } catch {
        // Ignore malformed external storage updates.
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (page !== "home") return undefined;

    let isSnapping = false;
    let touchStartY = 0;
    let lastTouchY = 0;
    let performanceTouchConsumed = false;
    let snapFrame = 0;

    const easeInOutCubic = (value) =>
      value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

    const smoothSnapTo = (targetTop) => {
      const startTop = window.scrollY;
      const distance = targetTop - startTop;
      const isMobileViewport = window.matchMedia("(max-width: 900px)").matches;

      if (!isMobileViewport) {
        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
        return 720;
      }

      if (snapFrame) {
        window.cancelAnimationFrame(snapFrame);
      }

      const viewportDistance = Math.abs(distance) / Math.max(window.innerHeight || 1, 1);
      const duration = Math.min(680, Math.max(460, 420 + viewportDistance * 120));
      const startTime = window.performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        window.scrollTo(0, startTop + distance * easeOutCubic(progress));

        if (progress < 1) {
          snapFrame = window.requestAnimationFrame(animate);
        } else {
          snapFrame = 0;
        }
      };

      snapFrame = window.requestAnimationFrame(animate);
      return duration;
    };

    const canScrollPerformanceContent = (eventTarget, deltaY) => {
      if (!document.documentElement.classList.contains("performance-scroll-enabled")) return false;
      const performanceContent = eventTarget?.closest?.(".performance-content");
      if (!performanceContent) return false;

      const atTop = performanceContent.scrollTop <= 0;
      const atBottom =
        performanceContent.scrollTop + performanceContent.clientHeight >= performanceContent.scrollHeight - 1;

      return (deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom);
    };

    const consumePerformanceScroll = (deltaY) => {
      const viewportHeight = window.innerHeight || 1;
      const currentProgress = window.scrollY / viewportHeight;
      const isPerformanceStage =
        currentProgress >= scrollTimeline.performance.start + 0.42 &&
        currentProgress < scrollTimeline.pricing.start - 0.06;

      if (!isPerformanceStage || Math.abs(deltaY) < 1) return false;

      const performanceContent = document.querySelector(".performance-content");
      if (!performanceContent) return false;

      const maxScrollTop = performanceContent.scrollHeight - performanceContent.clientHeight;
      if (maxScrollTop <= 1) return false;

      const atTop = performanceContent.scrollTop <= 1;
      const atBottom = performanceContent.scrollTop >= maxScrollTop - 1;

      if ((deltaY > 0 && atBottom) || (deltaY < 0 && atTop)) return false;

      performanceContent.scrollTop = Math.min(
        maxScrollTop,
        Math.max(0, performanceContent.scrollTop + deltaY),
      );
      return true;
    };

    const isInsideJourneySequence = (deltaY = 0) => {
      const viewportHeight = window.innerHeight || 1;
      const currentProgress = window.scrollY / viewportHeight;
      return (
        currentProgress >= scrollTimeline.journey.start - 0.02 &&
        currentProgress < scrollTimeline.performance.start - 0.24
      ) || (
        deltaY < 0 &&
        currentProgress >= scrollTimeline.performance.start - 0.24 &&
        currentProgress <= scrollTimeline.performance.start + 0.35
      );
    };

    const snapToSection = (direction) => {
      if (isSnapping || !direction) return;

      const viewportHeight = window.innerHeight || 1;
      const currentProgress = window.scrollY / viewportHeight;
      const isMobileViewport = window.matchMedia("(max-width: 900px)").matches;
      const snapAnchors = isMobileViewport
        ? [
            ...homeScrollAnchors.slice(0, -1),
            scrollTimeline.footer.start + (scrollTimeline.footer.end - scrollTimeline.footer.start) * 0.18,
          ]
        : homeScrollAnchors;
      if (isInsideJourneySequence(direction)) return;
      const snapOffset = 0.06;
      let targetIndex = -1;
      if (direction > 0) {
        targetIndex = snapAnchors.findIndex((anchor) => anchor > currentProgress + snapOffset);
      } else {
        for (let index = snapAnchors.length - 1; index >= 0; index -= 1) {
          if (snapAnchors[index] < currentProgress - snapOffset) {
            targetIndex = index;
            break;
          }
        }
      }

      if (targetIndex < 0) return;
      const targetTop = snapAnchors[targetIndex] * viewportHeight;
      isSnapping = true;
      const snapDuration = smoothSnapTo(targetTop);
      window.setTimeout(() => {
        isSnapping = false;
      }, snapDuration + 45);
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 18) return;
      if (consumePerformanceScroll(event.deltaY)) {
        event.preventDefault();
        return;
      }
    };

    const handleTouchStart = (event) => {
      touchStartY = event.touches?.[0]?.clientY || 0;
      lastTouchY = touchStartY;
      performanceTouchConsumed = false;
    };

    const handleTouchMove = (event) => {
      const currentY = event.touches?.[0]?.clientY || touchStartY;
      const deltaY = lastTouchY - currentY;
      const totalDeltaY = touchStartY - currentY;
      if (Math.abs(totalDeltaY) < 8) return;
      if (consumePerformanceScroll(deltaY)) {
        performanceTouchConsumed = true;
        lastTouchY = currentY;
        event.preventDefault();
        return;
      }
      lastTouchY = currentY;
    };

    const handleTouchEnd = (event) => {
      const touchEndY = event.changedTouches?.[0]?.clientY || touchStartY;
      const deltaY = touchStartY - touchEndY;
      if (performanceTouchConsumed) return;
      if (Math.abs(deltaY) < 28) return;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (snapFrame) {
        window.cancelAnimationFrame(snapFrame);
      }
    };
  }, [page]);

  useEffect(() => {
    let frameId = 0;

    const updateScrollProgress = () => {
      frameId = 0;
      const viewportHeight = window.innerHeight || 1;
      const homeFooter = document.querySelector(".site .footer-section.footer-static");
      const homeFooterHeight = homeFooter?.getBoundingClientRect().height || viewportHeight * 0.62;
      const progress = Math.max(0, window.scrollY / viewportHeight);
      const rangeProgress = ({ start, end }) =>
        Math.min(1, Math.max(0, (progress - start) / (end - start)));
      const priorityProgress = rangeProgress(scrollTimeline.priority);
      const aboutProgress = rangeProgress(scrollTimeline.about);
      const servicesProgress = rangeProgress(scrollTimeline.services);
      const whyProgress = rangeProgress(scrollTimeline.why);
      const journeyProgress = rangeProgress(scrollTimeline.journey);
      const performanceProgress = rangeProgress(scrollTimeline.performance);
      const pricingProgress = rangeProgress(scrollTimeline.pricing);
      const ctaProgress = rangeProgress(scrollTimeline.cta);
      const footerProgress = rangeProgress(scrollTimeline.footer);
      const smoothStep = (start, end, value) => {
        const normalized = Math.min(1, Math.max(0, (value - start) / (end - start)));
        return normalized * normalized * (3 - 2 * normalized);
      };
      const panelIn = (value) => smoothStep(0.08, 0.78, value);
      const panel = panelIn(priorityProgress);
      const enter = smoothStep(0.18, 0.9, priorityProgress);
      const aboutPanel = panelIn(aboutProgress);
      const aboutEnter = smoothStep(0.08, 0.62, aboutProgress);
      const servicesPanel = panelIn(servicesProgress);
      const servicesEnter = smoothStep(0.14, 0.86, servicesProgress);
      const servicesActive = smoothStep(0.68, 1, servicesProgress);
      const whyPanel = panelIn(whyProgress);
      const whyEnter = smoothStep(0.16, 0.86, whyProgress);
      const journeyPanel = panelIn(journeyProgress);
      const journeyEnter = smoothStep(0.16, 0.88, journeyProgress);
      const performancePanel = panelIn(performanceProgress);
      const performanceEnter = smoothStep(0.12, 0.84, performanceProgress);
      const journeyExit = smoothStep(0.02, 0.78, performanceProgress);
      const performanceWipe = smoothStep(0.02, 0.58, performanceProgress);
      const performanceTitle = smoothStep(0.16, 0.58, performanceProgress);
      const performanceTile1 = smoothStep(0.26, 0.66, performanceProgress);
      const performanceTile2 = smoothStep(0.34, 0.74, performanceProgress);
      const performanceTile3 = smoothStep(0.42, 0.82, performanceProgress);
      const performanceTile4 = smoothStep(0.5, 0.9, performanceProgress);
      const pricingPanel = panelIn(pricingProgress);
      const pricingTitle = smoothStep(0.3, 0.52, pricingProgress);
      const pricingCard1 = smoothStep(0.46, 0.7, pricingProgress);
      const pricingCard2 = smoothStep(0.54, 0.78, pricingProgress);
      const pricingCard3 = smoothStep(0.62, 0.86, pricingProgress);
      const ctaPanel = panelIn(ctaProgress);
      const ctaMedia = smoothStep(0.18, 0.78, ctaProgress);
      const ctaCopy = smoothStep(0.34, 0.92, ctaProgress);
      const footerPanel = panelIn(footerProgress);
      const exitShift = (nextPanel) => `${Math.max(0, nextPanel - 0.0001) * -100}vh`;
      document.documentElement.style.setProperty("--hero-shift", exitShift(panel));
      document.documentElement.style.setProperty("--priority-shift", `${(1 - panel) * 100}vh`);
      document.documentElement.style.setProperty("--priority-exit-shift", exitShift(aboutPanel));
      document.documentElement.style.setProperty("--hero-dim", `${panel * 0.58}`);
      document.documentElement.style.setProperty("--priority-enter", String(enter));
      document.documentElement.style.setProperty("--priority-rest", String(1 - enter));
      document.documentElement.style.setProperty("--hero-header-pointer-events", enter < 0.5 ? "auto" : "none");
      document.documentElement.style.setProperty("--other-header-pointer-events", enter < 0.5 ? "none" : "auto");
      document.documentElement.style.setProperty("--about-shift", `${(1 - aboutPanel) * 100}vh`);
      document.documentElement.style.setProperty("--about-exit-shift", exitShift(servicesPanel));
      document.documentElement.style.setProperty("--about-enter", String(aboutEnter));
      document.documentElement.style.setProperty("--about-rest", String(1 - aboutEnter));
      document.documentElement.style.setProperty("--services-shift", `${(1 - servicesPanel) * 100}vh`);
      document.documentElement.style.setProperty("--services-exit-shift", exitShift(whyPanel));
      document.documentElement.style.setProperty("--services-enter", String(servicesEnter));
      document.documentElement.style.setProperty("--services-rest", String(1 - servicesEnter));
      document.documentElement.style.setProperty("--services-active", String(servicesActive));
      document.documentElement.style.setProperty("--why-shift", `${(1 - whyPanel) * 100}vh`);
      document.documentElement.style.setProperty("--why-exit-shift", exitShift(journeyPanel));
      document.documentElement.style.setProperty("--why-enter", String(whyEnter));
      document.documentElement.style.setProperty("--why-rest", String(1 - whyEnter));
      document.documentElement.style.setProperty("--journey-shift", `${(1 - journeyPanel) * 100}vh`);
      document.documentElement.style.setProperty("--journey-enter", String(journeyEnter));
      document.documentElement.style.setProperty("--journey-exit-shift", exitShift(performancePanel));
      document.documentElement.style.setProperty("--journey-exit-scale", "1");
      document.documentElement.style.setProperty("--journey-exit-dim", "0");
      document.documentElement.style.setProperty("--performance-shift", `${(1 - performancePanel) * 100}vh`);
      document.documentElement.style.setProperty("--performance-exit-shift", exitShift(pricingPanel));
      document.documentElement.style.setProperty("--performance-enter", String(performanceEnter));
      document.documentElement.style.setProperty("--performance-wipe", String(performanceWipe));
      document.documentElement.style.setProperty("--performance-title", String(performanceTitle));
      document.documentElement.style.setProperty("--performance-tile-1", String(performanceTile1));
      document.documentElement.style.setProperty("--performance-tile-2", String(performanceTile2));
      document.documentElement.style.setProperty("--performance-tile-3", String(performanceTile3));
      document.documentElement.style.setProperty("--performance-tile-4", String(performanceTile4));
      document.documentElement.classList.toggle("performance-scroll-enabled", performanceProgress > 0.72 && pricingProgress < 0.02);
      document.documentElement.style.setProperty("--pricing-shift", `${(1 - pricingPanel) * 100}vh`);
      document.documentElement.style.setProperty("--pricing-exit-shift", exitShift(ctaPanel));
      document.documentElement.style.setProperty("--pricing-title", String(pricingTitle));
      document.documentElement.style.setProperty("--pricing-card-1", String(pricingCard1));
      document.documentElement.style.setProperty("--pricing-card-2", String(pricingCard2));
      document.documentElement.style.setProperty("--pricing-card-3", String(pricingCard3));
      document.documentElement.style.setProperty("--cta-shift", `${(1 - ctaPanel) * 100}vh`);
      document.documentElement.style.setProperty("--cta-exit-shift", `${footerPanel * -homeFooterHeight}px`);
      document.documentElement.style.setProperty("--cta-media", String(ctaMedia));
      document.documentElement.style.setProperty("--cta-copy", String(ctaCopy));
      document.documentElement.style.setProperty("--cta-footer-lift", `${footerProgress * -28}vh`);
      document.documentElement.style.setProperty("--footer-shift", `${(1 - footerPanel) * 100}%`);
      document.documentElement.style.setProperty("--footer-copy", "1");
      setJourneyHeaderActive(progress >= scrollTimeline.journey.start);
      setHeroHeaderActive(progress < scrollTimeline.priority.end);
    };

    const requestUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const navigateTo = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const saveSiteSettings = async (overrides = {}) => {
    const settings = {
      services: serviceItems,
      featuredServices: featuredServiceTitles,
      pricing: pricingPlansData,
      phones: cleanStringList(contactPhones, MAX_CONTACT_PHONES),
      emails: cleanStringList(contactEmails, MAX_CONTACT_EMAILS),
      blockedDates: [...blockedDates],
      ...overrides,
    };

    if (!supabase) {
      return { ok: false, error: "Supabase is not configured in this environment." };
    }

    const { error } = await supabase
      .from("site_settings")
      .update({ data: settings, updated_at: new Date().toISOString() })
      .eq("id", SITE_SETTINGS_ID);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const unlockDashboard = () => {
    window.sessionStorage.setItem(DASHBOARD_UNLOCK_STORAGE_KEY, "true");
    setDashboardUnlocked(true);
    setPage("dashboard");
    window.location.hash = "dashboard";
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const lockDashboard = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.sessionStorage.removeItem(DASHBOARD_UNLOCK_STORAGE_KEY);
    setDashboardUnlocked(false);
    setPage("home");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const homeServiceItems = featuredServiceTitles
    .map((title) => serviceItems.find((service) => service.title === title))
    .filter(Boolean)
    .slice(0, 3);

  if (page === "dashboard") {
    if (!dashboardAuthChecked || !dashboardUnlocked) {
      return <DashboardAccessPage onSuccess={unlockDashboard} onCancel={() => navigateTo("home")} />;
    }

    return (
      <DashboardPage
        plans={pricingPlansData}
        setPlans={setPricingPlansData}
        phones={contactPhones}
        setPhones={setContactPhones}
        emails={contactEmails}
        setEmails={setContactEmails}
        blockedDates={blockedDates}
        setBlockedDates={setBlockedDates}
        services={serviceItems}
        setServices={setServiceItems}
        featuredTitles={featuredServiceTitles}
        setFeaturedTitles={setFeaturedServiceTitles}
        onSaveSettings={saveSiteSettings}
        onExit={lockDashboard}
      />
    );
  }

  if (page === "services") {
    return (
      <main className="services-page">
        <PostHeroHeader
          activeIndex={1}
          language={language}
          onLanguageChange={setLanguage}
          onNavigate={navigateTo}
          mobileMenu
        />
        <ServicesPage items={serviceItems} language={language} />
        <FooterSection staticMode language={language} />
      </main>
    );
  }

  if (page === "about") {
    return (
      <main className="about-page">
        <PostHeroHeader
          activeIndex={2}
          language={language}
          onLanguageChange={setLanguage}
          onNavigate={navigateTo}
          mobileMenu
        />
        <AboutPage language={language} />
        <FinalCtaSection staticMode language={language} />
        <FooterSection staticMode language={language} />
      </main>
    );
  }

  if (page === "contact") {
    return (
      <main className="contact-page">
        <PostHeroHeader
          activeIndex={3}
          language={language}
          onLanguageChange={setLanguage}
          onNavigate={navigateTo}
          mobileMenu
        />
        <ContactPage phones={contactPhones} emails={contactEmails} blockedDates={blockedDates} language={language} />
        <FooterSection staticMode language={language} />
      </main>
    );
  }

  return (
    <main className={ready ? "site is-ready" : "site"}>
      <Hero
        activeIndex={0}
        language={language}
        onLanguageChange={setLanguage}
        onNavigate={navigateTo}
      />
      <PostHeroHeader
        activeIndex={0}
        language={language}
        onLanguageChange={setLanguage}
        journeyActive={journeyHeaderActive}
        heroActive={heroHeaderActive}
        onNavigate={navigateTo}
        mobileMenu
        matchHeroStyle
      />
      <PrioritySection language={language} />
      <AboutVideoSection language={language} />
      <ServicesSection
        onNavigate={navigateTo}
        language={language}
        items={homeServiceItems.length ? homeServiceItems : services}
      />
      <WhySection language={language} />
      <JourneySection language={language} />
      <PerformanceSection language={language} />
      <PricingSection plans={pricingPlansData} language={language} onNavigate={navigateTo} />
      <FinalCtaSection language={language} onNavigate={navigateTo} />
      <FooterSection staticMode language={language} />
      {showSplash && <Splash />}
    </main>
  );
}

function Splash() {
  return (
    <section className="splash" aria-label="Beat Body loading animation">
      <img className="splash-logo" src="/beat-body-splash-logo.png" alt="Beat Body" />
      <div className="tile tile-a" />
      <div className="tile tile-b" />
      <div className="tile tile-c" />
      <div className="tile tile-d" />
      <div className="tile tile-e" />
      <div className="tile tile-f" />
      <div className="tile tile-g" />
      <div className="tile tile-h" />
    </section>
  );
}

const MOBILE_NAV_ICONS = [House, Headphones, Info, IdCard];

function MobileMenu({ open, onClose, activeIndex, language, onLanguageChange, onNavigate, variant = "" }) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const t = translations[language];
  const languageCodes = ["fr", "ar", "en"];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={variant === "hero" ? "mobile-menu-overlay mobile-menu-overlay-hero" : "mobile-menu-overlay"}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="mobile-menu-header">
        <a
          className="brand"
          href="#"
          aria-label="Beat Body home"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("home");
            onClose();
          }}
        >
          <img src="/beat-body-logo.png" alt="Beat Body" />
        </a>
        <button className="mobile-menu-close" type="button" aria-label="Close menu" onClick={onClose}>
          <X />
        </button>
      </div>

      <nav className="mobile-menu-nav" aria-label="Primary navigation" dir={t.dir}>
        {t.nav.map((item, index) => {
          const Icon = MOBILE_NAV_ICONS[index];
          return (
            <a
              className={index === activeIndex ? "active" : undefined}
              href="#"
              key={item}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(["home", "services", "about", "contact"][index]);
                onClose();
              }}
            >
              <Icon size={18} />
              {item}
            </a>
          );
        })}
      </nav>

      <div className="mobile-menu-actions">
        <a
          className="mobile-menu-session"
          href="#contact"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("contact");
            onClose();
          }}
        >
          {t.session}
          <ChevronRight size={16} />
        </a>

        <div className="mobile-menu-language">
          <button
            className="mobile-menu-language-toggle"
            type="button"
            aria-expanded={languageOpen}
            onClick={() => setLanguageOpen((isOpen) => !isOpen)}
          >
            <span className="mobile-menu-flag">{t.flag}</span>
            {t.label}
            <ChevronDown size={16} />
          </button>
          {languageOpen && (
            <div className="mobile-menu-language-options" role="menu">
              {languageCodes.map((code) => (
                <button
                  className={code === language ? "selected" : undefined}
                  key={code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(code);
                    setLanguageOpen(false);
                  }}
                  role="menuitem"
                >
                  <span className="mobile-menu-flag">{translations[code].flag}</span>
                  {translations[code].label}
                </button>
            ))}
          </div>
          )}
        </div>
      </div>

    </div>
  );
}

function Hero({ activeIndex = 0, language, onLanguageChange, onNavigate }) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const t = translations[language];
  const languageCodes = ["fr", "ar", "en"];

  const handleLanguageChange = (nextLanguage) => {
    onLanguageChange(nextLanguage);
    setLanguageOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setReplayKey((key) => key + 1);
  };

  return (
    <section className="hero" aria-label="Beat Body EMS studio">
      <div className="hero-bg" />
      <div className="shade" />
      <img key={`people-${replayKey}`} className="people" src="/people.png" alt="" />

      <header className={mobileMenuOpen ? "topbar mobile-menu-visible" : "topbar"}>
        <a
          className="brand"
          href="#"
          aria-label="Beat Body home"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("home");
          }}
        >
          <img src="/beat-body-logo.png" alt="Beat Body" />
        </a>

        <div className="center-controls">
          <nav className="nav" aria-label="Primary navigation" dir={t.dir}>
            {t.nav.map((item, index) => (
              <a
                className={index === activeIndex ? "active" : undefined}
                href="#"
                key={item}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(["home", "services", "about", "contact"][index]);
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="language-menu">
            <button
              className="language-toggle"
              type="button"
              aria-expanded={languageOpen}
              aria-label="Change language"
              onClick={() => setLanguageOpen((isOpen) => !isOpen)}
            >
              <Globe2 className="language-icon" />
              <span>{t.code}</span>
              <ChevronDown className="language-caret" />
            </button>
            {languageOpen && (
              <div className="language-options" role="menu">
                {languageCodes.map((code) => (
                  <button
                    className={code === language ? "selected" : undefined}
                    key={code}
                    type="button"
                    onClick={() => handleLanguageChange(code)}
                    role="menuitem"
                  >
                    <span>{translations[code].code}</span>
                    {translations[code].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <a
          className="session"
          href="#contact"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("contact");
          }}
        >
          {t.session}
        </a>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => (mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true))}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section key={`headline-${replayKey}`} className="headline" aria-label="Beat Body introduction">
        <p className="headline-proof-badge" dir={t.dir}>
          <Crown size={14} />
          <span>{t.proofShort}</span>
        </p>
        <h1 dir="ltr">
          <span className="title-word title-beat">Beat</span>
          <span className="title-body">
            <img className="mobile-title-mark" src="/mobile-title-b.png" alt="B" />
            <span className="title-word">ody</span>
            <sup>&reg;</sup>
          </span>
        </h1>
        <p dir={t.dir}>{t.intro}</p>
        <a
          className="headline-session"
          href="#contact"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("contact");
          }}
        >
          {t.session}
          <ChevronRight size={16} />
        </a>
      </section>

      <aside key={`info-panel-${replayKey}`} className="info-panel text-card" dir={t.dir}>
        <h2>{t.infoTitle}</h2>
        <p>{t.infoBody}</p>
        <a
          href="#pricing"
          onClick={(event) => {
            event.preventDefault();
            window.scrollTo({
              top: window.innerHeight * (scrollTimeline.pricing.start + 1.12),
              behavior: "smooth",
            });
          }}
        >
          {t.pricing}
          <ChevronRight size={14} />
        </a>
      </aside>

      <aside key={`proof-card-${replayKey}`} className="proof-card">
        <img src="/proof-card.png" alt={t.proof} />
      </aside>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        activeIndex={activeIndex}
        language={language}
        onLanguageChange={onLanguageChange}
        onNavigate={onNavigate}
        variant="hero"
      />

    </section>
  );
}

function PostHeroHeader({ activeIndex = 0, language, onLanguageChange, journeyActive, heroActive = false, onNavigate, mobileMenu = false, matchHeroStyle = false }) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];
  const languageCodes = ["fr", "ar", "en"];

  const handleLanguageChange = (nextLanguage) => {
    onLanguageChange(nextLanguage);
    setLanguageOpen(false);
  };

  return (
    <>
    <header
      className={[
        "topbar",
        "post-topbar",
        journeyActive ? "journey-topbar" : "",
        heroActive ? "hero-hidden-topbar" : "",
        mobileMenu ? "has-mobile-menu" : "",
        matchHeroStyle ? "match-hero-style" : "",
      ].filter(Boolean).join(" ")}
    >
      <a
        className="brand"
        href="#"
        aria-label="Beat Body home"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("home");
          setMobileMenuOpen(false);
        }}
      >
        <img src="/beat-body-logo.png" alt="Beat Body" />
      </a>

      <div className="center-controls">
        <nav className="nav priority-nav" aria-label="Primary navigation" dir={t.dir}>
          {t.nav.map((item, index) => (
            <a
              className={index === activeIndex ? "active" : undefined}
              href="#"
              key={item}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(["home", "services", "about", "contact"][index]);
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="language-menu">
          <button
            className="language-toggle priority-language-toggle"
            type="button"
            aria-expanded={languageOpen}
            aria-label="Change language"
            onClick={() => setLanguageOpen((isOpen) => !isOpen)}
          >
            <Globe2 className="language-icon" />
            <span>{t.code}</span>
            <ChevronDown className="language-caret" />
          </button>
          {languageOpen && (
            <div className="language-options priority-language-options" role="menu">
              {languageCodes.map((code) => (
                <button
                  className={code === language ? "selected" : undefined}
                  key={code}
                  type="button"
                  onClick={() => handleLanguageChange(code)}
                  role="menuitem"
                >
                  <span>{translations[code].code}</span>
                  {translations[code].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <a
        className="session priority-session"
        href="#contact"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("contact");
        }}
      >
        {t.session}
      </a>

      {mobileMenu && (
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      )}

    </header>
    {mobileMenu && (
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeIndex={activeIndex}
        language={language}
        onLanguageChange={onLanguageChange}
        onNavigate={onNavigate}
      />
    )}
    </>
  );
}

function PrioritySection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  return (
    <section className={`priority-section priority-section-${language}`} aria-label="Beat Body priority">
      <div className="priority-content">
        <p className="priority-kicker">
          <img className="priority-vector" src="/priority-vector.png" alt="" />
          <span className="priority-text-label">{text.priorityKicker}</span>
        </p>

        <h2 className="priority-title" aria-label={text.priorityWords.join(" ")}>
          <span className="priority-title-row priority-title-row-top">
            <span>{text.priorityWords[0]}</span>
            <span>{text.priorityWords[1]}</span>
            <img src="/priority-pill-right.png" alt="" />
          </span>
          <span className="priority-title-row priority-title-row-middle">
            <span>{text.priorityWords[2]}</span>
            {language === "ar" && <span className="priority-ar-word-spacer" aria-hidden="true" />}
            <span>{text.priorityWords[3]}</span>
          </span>
          <span className="priority-title-row priority-title-row-bottom">
            <img src="/priority-pill-left.png" alt="" />
            <span>{text.priorityWords[4]}</span>
            <span>{text.priorityWords[5]}</span>
          </span>
        </h2>
        <img className="priority-suit" src="/priority-suit.png" alt="EMS training suit" />
      </div>
    </section>
  );
}

function AboutVideoSection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const scrollToPricing = (event) => {
    event.preventDefault();
    window.scrollTo({
      top: window.innerHeight * (scrollTimeline.pricing.start + 1.12),
      behavior: "smooth",
    });
  };
  return (
    <section className="about-section" aria-label="About Beat Body">
      <div className="about-stage">
        <video
          className="about-video"
          src="/ems-training.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="about-video-shade" />

        <aside className="about-card">
          <div className="about-card-top">
            <span>{text.aboutPreviewTitle}</span>
            <a href="#pricing" onClick={scrollToPricing}>{text.viewPricing}</a>
          </div>
          <p>{text.aboutPreviewBody}</p>
        </aside>

        <span className="about-tag-text">{text.servicesKicker}</span>
        <img className="about-wordmark" src="/about-beat-body.png" alt="Beat Body" />
      </div>
    </section>
  );
}

const services = [
  {
    title: "EMS TRAINING",
    text: "ACTIVATE MORE MUSCLES IN LESS TIME WITH INTELLIGENT ELECTRO MUSCLE STIMULATION TECHNOLOGY.",
    base: "/service-ems-cutout.png",
    active: "/service-ems-photo.jpg",
  },
  {
    title: "PERSONALIZED COACHING",
    text: "TAILORED PROGRAMS ADAPTED TO YOUR GOALS, LEVEL, AND PHYSICAL CONDITION.",
    base: "/service-coaching-cutout.png",
    active: "/service-coaching-photo.jpg",
  },
  {
    title: "SPORTS RECOVERY",
    text: "ACCELERATE RECOVERY AND REDUCE MUSCLE FATIGUE AFTER INTENSE ACTIVITY.",
    base: "/service-sports-cutout.png",
    active: "/service-sports-photo.jpg",
  },
];

const servicesPageItems = [
  ...services,
  {
    title: "MASSAGE THERAPY",
    text: "PROFESSIONAL THERAPEUTIC MASSAGE DESIGNED FOR ATHLETES AND ACTIVE LIFESTYLES.",
    base: "/service-massage-photo-cutout.png",
    active: "/service-massage-cutout.png",
    overlay: true,
  },
  {
    title: "MUSCLE RECOVERY",
    text: "RESTORE MUSCLE FUNCTION AND IMPROVE FLEXIBILITY AND MOBILITY.",
    base: "/service-muscle-cutout.png",
    active: "/service-muscle-photo.jpg",
  },
  {
    title: "COGNITIVE BODY TRAINING",
    text: "A HOLISTIC APPROACH COMBINING BODY PERFORMANCE, COORDINATION, AND MENTAL ENGAGEMENT.",
    base: "/service-cognitive-cutout.png",
    active: "/service-cognitive-photo.jpg",
  },
];

function ServiceCard({ service, index, className = "", isActive = false, language = "fr", onNavigate }) {
  const text = pageText[language] || pageText.fr;
  const localizedService = text.serviceTexts[service.title];
  const serviceTitle = localizedService?.[0] || service.title;
  const serviceBody = localizedService?.[1] || service.text;
  const handlePricingClick = (event) => {
    event.preventDefault();
    window.scrollTo({
      top: window.innerHeight * (scrollTimeline.pricing.start + 1.12),
      behavior: "smooth",
    });
  };
  const handleBookingClick = (event) => {
    event.preventDefault();
    if (onNavigate) onNavigate("contact");
    else window.location.hash = "contact";
  };
  return (
    <article
      className={[
        "service-card",
        service.overlay ? "service-card--overlay" : "",
        isActive ? "is-active" : "",
        className,
      ].filter(Boolean).join(" ")}
      style={{ "--card-index": index }}
      tabIndex="0"
    >
      <img className="service-base-image" src={service.base} alt="" />
      <img className="service-active-image" src={service.active} alt="" />

      <div className="service-copy service-copy-base">
        <h3>{serviceTitle}</h3>
        <p>{serviceBody}</p>
        <a href="#pricing" onClick={handlePricingClick}>{text.viewPricing}</a>
      </div>
      <div className="service-copy service-copy-active">
        <h3>{serviceTitle}</h3>
        <p>{serviceBody}</p>
        <a href="#contact" onClick={handleBookingClick}>{text.bookSession}</a>
      </div>
    </article>
  );
}

function ServicesSection({ onNavigate, items = services, language = "fr" }) {
  const gridRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const text = pageText[language] || pageText.fr;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let frameId = 0;
    const updateActiveIndex = () => {
      frameId = 0;
      const cards = [...grid.children];
      if (!cards.length) return;
      const gridCenter = grid.scrollLeft + grid.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - gridCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateActiveIndex);
    };

    updateActiveIndex();
    grid.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      grid.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className={`services-section services-section-${language}`} aria-label="Beat Body services">
      <div className="services-content">
        <div className="services-heading">
          <p className="services-kicker">
            <img className="priority-vector" src="/priority-vector.png" alt="" />
            <span>{text.servicesKicker}</span>
          </p>
          <a
            className="services-all"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("services");
            }}
          >
            {text.allServices}
          </a>
        </div>

        <div className="services-grid" ref={gridRef}>
          {items.map((service, index) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={index}
              isActive={index === activeIndex}
              language={language}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="services-dots" aria-hidden="true">
          {items.map((service, index) => (
            <span key={service.title} className={index === activeIndex ? "active" : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}

const pricingPlanNamesFr = {
  Starter: "Démarreur",
  Performance: "Performance",
  Elite: "Elite",
};

function DashboardAccessPage({ onSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const adminEmail = SUPABASE_ADMIN_EMAIL.trim().toLowerCase();

  const submitLogin = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase n'est pas configuré.");
      return;
    }
    if (!adminEmail) {
      setError("Email administrateur manquant dans la configuration.");
      return;
    }

    setLoading(true);
    setError("");
    await supabase.auth.signOut();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(`Connexion refusée: ${signInError.message}`);
      setPassword("");
      return;
    }

    onSuccess();
  };

  return (
    <main className="dashboard-access-page">
      <section className="dashboard-access-card" aria-labelledby="dashboard-access-title">
        <img src="/beat-body-logo.png" alt="Beat Body" />
        <p className="dashboard-access-kicker">Archive interne</p>
        <h1 id="dashboard-access-title">Accès réservé</h1>
        <form onSubmit={submitLogin}>
          <label htmlFor="dashboard-password">Mot de passe</label>
          <input
            id="dashboard-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            placeholder="••••••••"
            autoFocus
          />
          {error && <p className="dashboard-access-error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Connexion..." : "Continuer"}</button>
        </form>
        <button type="button" className="dashboard-access-back" onClick={onCancel}>
          Retour au site
        </button>
      </section>
    </main>
  );
}

function DashboardPage({
  plans = pricingPlans,
  setPlans = () => {},
  phones: contactPhones,
  setPhones: setContactPhones,
  emails: contactEmails,
  setEmails: setContactEmails,
  blockedDates,
  setBlockedDates,
  services: serviceList = servicesPageItems,
  setServices = () => {},
  featuredTitles = [],
  setFeaturedTitles = () => {},
  onSaveSettings = async () => ({ ok: true }),
  onExit = () => {},
}) {
  const [dashboardTab, setDashboardTab] = useState("services");
  const dashboardText = pageText.fr;
  const [hoverTab, setHoverTab] = useState("before");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [beforeImageUrl, setBeforeImageUrl] = useState("");
  const [afterImageUrl, setAfterImageUrl] = useState("");
  const [newFeatureInputs, setNewFeatureInputs] = useState({});
  const [draftServices, setDraftServices] = useState(() => serviceList);
  const [draftFeaturedTitles, setDraftFeaturedTitles] = useState(() => featuredTitles);

  useEffect(() => {
    setDraftServices(serviceList);
  }, [serviceList]);

  useEffect(() => {
    setDraftFeaturedTitles(featuredTitles);
  }, [featuredTitles]);

  const toggleFeatured = (title) => {
    setDraftFeaturedTitles((prev) => {
      if (prev.includes(title)) return prev.filter((t) => t !== title);
      if (prev.length >= 3) return prev;
      return [...prev, title];
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    let url = URL.createObjectURL(file);

    if (supabase) {
      const safeName = file.name.replace(/[^a-z0-9.-]/gi, "-").toLowerCase();
      const filePath = `services/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("beatbody-images").upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
      });

      if (error) {
        alert(`Impossible d'envoyer l'image: ${error.message}`);
        return;
      }

      const { data } = supabase.storage.from("beatbody-images").getPublicUrl(filePath);
      url = data.publicUrl;
    }

    if (hoverTab === "before") setBeforeImageUrl(url);
    else setAfterImageUrl(url);
  };

  const canSaveService = serviceTitle.trim() && description.trim() && beforeImageUrl && afterImageUrl;

  const handleSaveService = () => {
    if (!canSaveService) return;
    setDraftServices((prev) => [
      ...prev,
      {
        title: serviceTitle.trim(),
        text: description.trim(),
        base: beforeImageUrl,
        active: afterImageUrl,
      },
    ]);
    setServiceTitle("");
    setDescription("");
    setBeforeImageUrl("");
    setAfterImageUrl("");
  };

  const removeService = (title) => {
    setDraftServices((prev) => prev.filter((service) => service.title !== title));
    setDraftFeaturedTitles((prev) => prev.filter((featuredTitle) => featuredTitle !== title));
  };

  const updatePlan = (planName, updater) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.name === planName ? { ...plan, ...updater(plan) } : plan)),
    );
  };

  const addFeature = (planName) => {
    const text = (newFeatureInputs[planName] || "").trim();
    if (!text) return;
    updatePlan(planName, (plan) => {
      if (plan.features.length >= 6) return {};
      return { features: [...plan.features, text] };
    });
    setNewFeatureInputs((prev) => ({ ...prev, [planName]: "" }));
  };

  const removeFeature = (planName, index) => {
    updatePlan(planName, (plan) => ({
      features: plan.features.filter((_, i) => i !== index),
    }));
  };

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    const serviceOverrides =
      dashboardTab === "services"
        ? {
            services: draftServices,
            featuredServices: draftFeaturedTitles.filter((title) =>
              draftServices.some((service) => service.title === title),
            ),
          }
        : {};

    if (dashboardTab === "services") {
      setServices(serviceOverrides.services);
      setFeaturedTitles(serviceOverrides.featuredServices);
    }

    const result = await onSaveSettings(serviceOverrides);
    setIsSaving(false);

    if (result?.ok === false) {
      setSaveError(result.error || "Impossible d'enregistrer.");
      return;
    }

    setShowSaveConfirm(true);
  };

  const [calendarBaseMonth, setCalendarBaseMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [newFeatureValue, setNewFeatureValue] = useState("");
  const [newEmailValue, setNewEmailValue] = useState("");
  const phoneLimitReached = contactPhones.length >= MAX_CONTACT_PHONES;
  const emailLimitReached = contactEmails.length >= MAX_CONTACT_EMAILS;

  const shiftCalendarMonth = (delta) => {
    setCalendarBaseMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const buildMonthGrid = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) {
      const prevMonthDays = new Date(year, month, 0).getDate();
      cells.push({ day: prevMonthDays - startOffset + i + 1, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, inMonth: true, key: `${year}-${month}-${day}`, date: new Date(year, month, day) });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length - startOffset - daysInMonth + 1, inMonth: false });
    }
    return cells;
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const setDateAvailability = (key, shouldBlock, event) => {
    event.stopPropagation();
    setBlockedDates((prev) => {
      const next = new Set(prev);
      if (shouldBlock) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const addContactFeature = () => {
    const text = newFeatureValue.trim();
    if (!text || phoneLimitReached) return;
    setContactPhones((prev) => (prev.length >= MAX_CONTACT_PHONES ? prev : [...prev, text]));
    setNewFeatureValue("");
  };

  const addContactEmail = () => {
    const text = newEmailValue.trim();
    if (!text || emailLimitReached) return;
    setContactEmails((prev) => (prev.length >= MAX_CONTACT_EMAILS ? prev : [...prev, text]));
    setNewEmailValue("");
  };

  const removePhone = (index) => {
    setContactPhones((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEmail = (index) => {
    setContactEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const visibleServices = draftServices.filter((service) => {
    if (featuredOnly && !draftFeaturedTitles.includes(service.title)) return false;
    if (search && !service.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <img src="/beat-body-logo.png" alt="Beat Body" />
        </div>

        <nav className="dashboard-nav">
          <a
            className={dashboardTab === "services" ? "active" : undefined}
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setDashboardTab("services");
            }}
          >
            <Wrench size={16} />
            <span>Services</span>
          </a>
          <a
            className={dashboardTab === "prix" ? "active" : undefined}
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setDashboardTab("prix");
            }}
          >
            <User size={16} />
            <span>Prix</span>
          </a>
          <a
            className={dashboardTab === "contact" ? "active" : undefined}
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setDashboardTab("contact");
            }}
          >
            <IdCard size={16} />
            <span>Contact</span>
          </a>
        </nav>

        <button className="dashboard-logout" type="button" onClick={onExit}>
          <LogOut size={16} />
          <span>Sortie</span>
        </button>
      </aside>

      <div className="dashboard-topbar">
        {saveError && <p className="dashboard-save-error">{saveError}</p>}
        <button type="button" className="dashboard-save-button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {showSaveConfirm && (
        <div className="dashboard-save-overlay" onClick={() => setShowSaveConfirm(false)}>
          <div className="dashboard-save-modal" onClick={(event) => event.stopPropagation()}>
            <CheckCircle2 size={40} />
            <h3>Enregistré avec succès</h3>
            <p>Vos modifications ont bien été prises en compte.</p>
            <button type="button" onClick={() => setShowSaveConfirm(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <section className="dashboard-main">
        {dashboardTab === "prix" ? (
          <div className="dashboard-prix">
            {plans.map((plan, planIndex) => (
              <React.Fragment key={plan.name}>
                <div className="dashboard-prix-block">
                <div className="dashboard-prix-row">
                  <div className="dashboard-prix-card">
                    <h3>
                      Carte de souscription {planIndex + 1} : {pricingPlanNamesFr[plan.name] || plan.name}
                    </h3>
                    <input
                      type="text"
                      placeholder="Prix de la carte *"
                      value={plan.price}
                      onChange={(event) => updatePlan(plan.name, () => ({ price: event.target.value }))}
                    />
                    <input
                      type="text"
                      placeholder="Description du carte *"
                      value={plan.description}
                      onChange={(event) => updatePlan(plan.name, () => ({ description: event.target.value }))}
                    />

                    <p className="dashboard-prix-label">Fonctionnalités du plan d'abonnement</p>
                    <div className="dashboard-prix-features">
                      {Array.from({ length: 6 }).map((_, featureIndex) => {
                        const currentFeatures = plan.features;
                        const feature = currentFeatures[featureIndex];
                        if (feature) {
                          return (
                            <div className="dashboard-prix-feature" key={featureIndex}>
                              <span className="dashboard-prix-feature-number">{featureIndex + 1}</span>
                              <span className="dashboard-prix-feature-text">{feature}</span>
                              <button
                                type="button"
                                className="dashboard-prix-feature-remove"
                                aria-label="Supprimer"
                                onClick={() => removeFeature(plan.name, featureIndex)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        }

                        const isNextSlot = featureIndex === currentFeatures.length;
                        return (
                          <div className="dashboard-prix-feature-add" key={featureIndex}>
                            <span className="dashboard-prix-feature-number">{featureIndex + 1}</span>
                            <input
                              type="text"
                              className="dashboard-prix-feature-input"
                              placeholder="Ajouter une fonctionnalité"
                              disabled={!isNextSlot}
                              value={isNextSlot ? newFeatureInputs[plan.name] || "" : ""}
                              onChange={(event) =>
                                setNewFeatureInputs((prev) => ({ ...prev, [plan.name]: event.target.value }))
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") addFeature(plan.name);
                              }}
                            />
                            <button
                              type="button"
                              className="dashboard-prix-feature-add-icon"
                              aria-label="Ajouter"
                              disabled={!isNextSlot}
                              onClick={() => addFeature(plan.name)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="dashboard-prix-preview-card">
                  <div className="dashboard-prix-preview">
                    <article
                      className={["pricing-card", plan.featured ? "is-featured" : ""].filter(Boolean).join(" ")}
                    >
                      <span className="pricing-name">{plan.name}</span>
                      <p className="pricing-price"><strong>${plan.price}</strong><em>/month</em></p>
                      <p className="pricing-description">{plan.description}</p>
                      <div className="pricing-divider" />
                      <ul>
                        {plan.features.map((feature, i) => <li key={i}>{feature}</li>)}
                      </ul>
                      <button type="button">Book Your Session</button>
                    </article>
                  </div>
                  </div>
                </div>
                </div>
                {planIndex < plans.length - 1 && <div className="dashboard-prix-divider" />}
              </React.Fragment>
            ))}
          </div>
        ) : dashboardTab === "contact" ? (
          <div className="dashboard-contact">
            <div className="dashboard-contact-block">
              <div className="dashboard-contact-block-inner">
              <span className="dashboard-contact-tab">{dashboardText.formTab}</span>
              <div className="dashboard-contact-card">
                <div className="dashboard-contact-card-header">
                  <Calendar size={16} />
                  <span>Date de reservation</span>
                </div>

                <div className="dashboard-calendar-row">
                  <button
                    type="button"
                    className="dashboard-calendar-nav"
                    aria-label="Mois précédent"
                    onClick={() => shiftCalendarMonth(-1)}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {[0, 1].map((offset) => {
                    const monthDate = new Date(
                      calendarBaseMonth.getFullYear(),
                      calendarBaseMonth.getMonth() + offset,
                      1,
                    );
                    const year = monthDate.getFullYear();
                    const month = monthDate.getMonth();
                    const cells = buildMonthGrid(year, month);
                    return (
                      <div className="dashboard-calendar-month" key={offset}>
                        <p className="dashboard-calendar-month-label">
                          {String(month + 1).padStart(2, "0")}/{year}
                        </p>
                        <div className="dashboard-calendar-grid">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <span className="dashboard-calendar-dow" key={i}>
                              DAY
                            </span>
                          ))}
                          {cells.map((cell, i) => {
                            const isSelected = cell.inMonth && cell.key === selectedDate;
                            const isBlocked = cell.inMonth && blockedDates.has(cell.key);
                            const isPast = cell.inMonth && cell.date < todayStart;
                            const isDisabled = !cell.inMonth || isPast;
                            return (
                              <button
                                type="button"
                                key={i}
                                className={[
                                  "dashboard-calendar-day",
                                  !cell.inMonth ? "is-outside" : "",
                                  isPast ? "is-past" : "",
                                  isSelected ? "is-selected" : "",
                                  isBlocked ? "is-blocked" : "",
                                ].filter(Boolean).join(" ")}
                                disabled={isDisabled}
                                onClick={() => !isDisabled && setSelectedDate(cell.key)}
                              >
                                {cell.day}
                                {isSelected && (
                                  <span className="dashboard-calendar-day-controls">
                                    <span
                                      className={
                                        isBlocked
                                          ? "dashboard-calendar-day-block is-disabled"
                                          : "dashboard-calendar-day-block"
                                      }
                                      onClick={(event) => !isBlocked && setDateAvailability(cell.key, true, event)}
                                    >
                                      <X size={9} />
                                    </span>
                                    <span
                                      className={
                                        isBlocked
                                          ? "dashboard-calendar-day-add"
                                          : "dashboard-calendar-day-add is-disabled"
                                      }
                                      onClick={(event) => isBlocked && setDateAvailability(cell.key, false, event)}
                                    >
                                      <Check size={9} />
                                    </span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className="dashboard-calendar-nav"
                    aria-label="Mois suivant"
                    onClick={() => shiftCalendarMonth(1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button type="button" className="dashboard-calendar-save" onClick={handleSave}>
                  Save <ChevronRight size={14} />
                </button>
              </div>
              </div>
            </div>

            <div className="dashboard-contact-block">
              <div className="dashboard-contact-block-inner">
              <span className="dashboard-contact-tab">{dashboardText.callTab}</span>
              <div className="dashboard-contact-list">
                {contactPhones.map((phone, index) => (
                  <div className="dashboard-contact-row" key={index}>
                    <span className="dashboard-contact-flag" />
                    <span className="dashboard-contact-text">{phone}</span>
                    <button
                      type="button"
                      className="dashboard-prix-feature-remove"
                      aria-label="Supprimer"
                      onClick={() => removePhone(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                <div className={phoneLimitReached ? "dashboard-contact-row dashboard-contact-row-add is-disabled" : "dashboard-contact-row dashboard-contact-row-add"}>
                  <span className="dashboard-contact-flag" />
                  <input
                    type="text"
                    className="dashboard-contact-input"
                    placeholder="Ajouter une fonctionnalité"
                    value={newFeatureValue}
                    disabled={phoneLimitReached}
                    onChange={(event) => setNewFeatureValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addContactFeature();
                    }}
                  />
                  <button
                    type="button"
                    className="dashboard-prix-feature-add-icon"
                    aria-label="Ajouter"
                    disabled={phoneLimitReached}
                    onClick={addContactFeature}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {contactEmails.map((email, index) => (
                  <div className="dashboard-contact-row" key={index}>
                    <span className="dashboard-contact-text">{email}</span>
                    <button
                      type="button"
                      className="dashboard-prix-feature-remove"
                      aria-label="Supprimer"
                      onClick={() => removeEmail(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                <div className={emailLimitReached ? "dashboard-contact-row dashboard-contact-row-add is-disabled" : "dashboard-contact-row dashboard-contact-row-add"}>
                  <input
                    type="text"
                    className="dashboard-contact-input"
                    placeholder="Ajouter un Email"
                    value={newEmailValue}
                    disabled={emailLimitReached}
                    onChange={(event) => setNewEmailValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addContactEmail();
                    }}
                  />
                  <button
                    type="button"
                    className="dashboard-prix-feature-add-icon"
                    aria-label="Ajouter"
                    disabled={emailLimitReached}
                    onClick={addContactEmail}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              </div>
            </div>
          </div>
        ) : (
        <>
        <div className="dashboard-toolbar-card">
          <div className="dashboard-toolbar-left">
            <div className="dashboard-hover-toggle">
              <button
                type="button"
                className={hoverTab === "before" ? "active" : undefined}
                onClick={() => setHoverTab("before")}
              >
                Avant le survol
              </button>
              <button
                type="button"
                className={hoverTab === "after" ? "active" : undefined}
                onClick={() => setHoverTab("after")}
              >
                Après le survol
              </button>
            </div>

            <div className="dashboard-upload-row">
              <label className="dashboard-upload-box">
                <input type="file" accept="image/jpeg,image/png" hidden onChange={handleImageUpload} />
                {(hoverTab === "before" ? beforeImageUrl : afterImageUrl) ? (
                  <img
                    className="dashboard-upload-preview"
                    src={hoverTab === "before" ? beforeImageUrl : afterImageUrl}
                    alt=""
                  />
                ) : (
                  <>
                    <Upload size={28} />
                    <p>Au format JPG ou PNG</p>
                    <p>L'image sera recadrée aux dimensions 427px par 452px.</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="dashboard-toolbar-divider" />

          <form className="dashboard-form" onSubmit={(event) => event.preventDefault()}>
            <input
              type="text"
              placeholder="Titre du service *"
              maxLength={50}
              value={serviceTitle}
              onChange={(event) => setServiceTitle(event.target.value)}
            />
            <textarea
              placeholder="Description du service*"
              maxLength={120}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <span className="dashboard-form-hint">Ne pas dépasser {description.length}/120 caractères</span>
            <button
              type="button"
              className="dashboard-save-service-button"
              disabled={!canSaveService}
              onClick={handleSaveService}
            >
              Enregistrer
            </button>
          </form>
        </div>

        <div className="dashboard-services-toolbar">
          <div className="dashboard-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search for something"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="dashboard-view-toggle">
            <button
              type="button"
              className={!featuredOnly ? "dashboard-all-services active" : "dashboard-all-services"}
              onClick={() => setFeaturedOnly(false)}
            >
              Tous les services
            </button>
            <span className="dashboard-view-toggle-divider" />
            <button
              type="button"
              className={featuredOnly ? "dashboard-featured-toggle active" : "dashboard-featured-toggle"}
              onClick={() => setFeaturedOnly(true)}
            >
              En vedette
            </button>
          </div>
        </div>

        <p className="dashboard-hint">
          Cliquez sur le cœur pour définir un service qui va apparaître dans la section 03 de la Home
          Page. Vous pouvez sélectionner jusqu'à 3 services maximum.
        </p>

        <div className="services-page-grid dashboard-services-grid">
          {visibleServices.map((service, index) => (
            <div className="dashboard-service-card-wrap" key={service.title}>
              <button
                type="button"
                className={draftFeaturedTitles.includes(service.title) ? "dashboard-favorite is-active" : "dashboard-favorite"}
                aria-label="Toggle featured"
                onClick={() => toggleFeatured(service.title)}
              >
                {draftFeaturedTitles.includes(service.title) && (
                  <span className="dashboard-favorite-count">
                    {draftFeaturedTitles.indexOf(service.title) + 1}
                  </span>
                )}
                <Heart size={14} />
              </button>
              <button
                type="button"
                className="dashboard-remove-service"
                aria-label={`Supprimer ${service.title}`}
                onClick={() => removeService(service.title)}
              >
                <X size={14} />
              </button>
              <ServiceCard className="services-page-card" service={service} index={index} isActive />
            </div>
          ))}
        </div>
        </>
        )}
      </section>
    </main>
  );
}

function ServicesPage({ items = servicesPageItems, language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  return (
    <section className="services-page-section" aria-label="All Beat Body services">
      <div className="services-page-inner">
        <div className="services-heading services-page-heading">
          <p className="services-kicker">
            <img className="priority-vector" src="/priority-vector.png" alt="" />
            <span>{text.servicesKicker}</span>
          </p>
        </div>

        <div className="services-page-grid">
          {items.map((service, index) => (
            <ServiceCard
              className="services-page-card"
              key={service.title}
              service={service}
              index={index}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const whyItems = [
  {
    title: "Tailored Programs for Every Goal",
    icon: "/why-icon-programs.png",
    image: "/why-programs.png",
    text: "Whether your objective is weight loss, muscle gain, rehabilitation, or performance improvement.",
  },
  {
    title: "Expert Coaches and Specialists",
    icon: "/why-icon-coaches.png",
    image: "/why-coaches.png",
    text: "Receive guidance from qualified professionals specialized in performance and recovery.",
  },
  {
    title: "A Complete Recovery Experience",
    icon: "/why-icon-recovery.png",
    image: "/why-recovery.png",
    text: "Recovery is not an option - it is part of the process.",
  },
  {
    title: "State-of-the-Art EMS Equipment",
    icon: "/why-icon-equipment.png",
    image: "/why-equipment.png",
    text: "Train with the latest generation of EMS technology designed for performance and efficiency.",
  },
];

const WHY_STEP_DURATION = 3200;

function WhySection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const localizedWhyItems = whyItems.map((item, index) => ({
    ...item,
    title: text.whyItems[index]?.[0] || item.title,
    text: text.whyItems[index]?.[1] || item.text,
  }));
  const [active, setActive] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [outgoingImage, setOutgoingImage] = useState(null);
  const sectionRef = useRef(null);
  const inViewRef = useRef(false);
  const timerRef = useRef(null);
  const prevImageRef = useRef(whyItems[0].image);
  const current = localizedWhyItems[active];
  const preview = localizedWhyItems[(active + 1) % localizedWhyItems.length];

  useEffect(() => {
    if (prevImageRef.current === current.image) return undefined;
    const previousImage = prevImageRef.current;
    prevImageRef.current = current.image;
    setOutgoingImage(previousImage);
    const timeout = window.setTimeout(() => setOutgoingImage(null), 420);
    return () => window.clearTimeout(timeout);
  }, [current.image]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      inViewRef.current = true;
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasInView = inViewRef.current;
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !wasInView) {
          setActive(0);
          setProgressKey((key) => key + 1);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (inViewRef.current) {
        setActive((currentIndex) => (currentIndex + 1) % whyItems.length);
        setProgressKey((key) => key + 1);
      }
    }, WHY_STEP_DURATION);

    return () => window.clearTimeout(timerRef.current);
  }, [active, progressKey]);

  const handleTabClick = (index) => {
    window.clearTimeout(timerRef.current);
    setActive(index);
    setProgressKey((key) => key + 1);
  };

  return (
    <section className={`why-section why-section-${language}`} aria-labelledby="why-title" ref={sectionRef}>
      <div className="why-content">
        <h2 id="why-title">{text.whyTitle}</h2>
        <div className="why-tabs" role="tablist" aria-label="Why Beat Body">
          {localizedWhyItems.map((item, index) => (
            <button
              className={index === active ? "why-tab is-active" : "why-tab"}
              key={item.title}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => handleTabClick(index)}
            >
              <img src={item.icon} alt="" />
              <span>{item.title}</span>
              <i key={index === active ? `why-progress-${progressKey}-${active}` : undefined} />
            </button>
          ))}
        </div>

        <div className="why-visual" key={current.image}>
          <img className="why-main-image" src={current.image} alt="" />
          <img className="why-preview" key={preview.image} src={preview.image} alt="" />
          <p>{current.text}</p>
        </div>
        {outgoingImage && (
          <img className="why-main-image-outgoing" key={outgoingImage} src={outgoingImage} alt="" />
        )}
      </div>
    </section>
  );
}

const journeyCards = [
  "/journey-step-1.png",
  "/journey-step-2.png",
  "/journey-step-3.png",
  "/journey-step-4.png",
];

function JourneySection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const viewportHeight = window.innerHeight || 1;
      const progress = window.scrollY / viewportHeight;
      const sectionReached = progress >= scrollTimeline.journey.start - 0.04;
      const sequence = Math.min(
        1,
        Math.max(
          0,
          (progress - scrollTimeline.journey.sequenceStart) /
            (scrollTimeline.journey.sequenceEnd - scrollTimeline.journey.sequenceStart),
        ),
      );
      setVisibleSteps(sectionReached ? Math.min(4, 1 + Math.floor(sequence * 3.001)) : 0);
    };
    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="journey-section" aria-labelledby="journey-title">
      <div className="journey-overlay">
        <h2 id="journey-title">{text.journeyTitle}</h2>
        <div className="journey-stack">
          {journeyCards.map((src, index) => (
            <div
              className={index < visibleSteps ? "journey-card is-visible" : "journey-card"}
              key={src}
              style={{ "--journey-index": index }}
            >
              <img src={src} alt="" />
              <span className="journey-card-title">{text.journeyCards?.[index]}</span>
            </div>
          ))}
        </div>
        <a
          className="journey-book journey-book-link"
          href="#contact"
          onClick={(event) => {
            event.preventDefault();
            window.location.hash = "contact";
          }}
          style={{
            "--journey-book-top": visibleSteps <= 1 ? 32.5 : 32.5 + (visibleSteps - 1) * 13.5,
          }}
        >
          {text.bookSession}
        </a>
        <img
          className="journey-rail"
          src={`/journey-rail-${visibleSteps}.png`}
          alt=""
        />
      </div>
    </section>
  );
}

function PerformanceSection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const technologyVideoRef = useRef(null);
  const tileRefs = useRef([]);

  useEffect(() => {
    const tiles = tileRefs.current.filter(Boolean);
    if (!tiles.length || typeof IntersectionObserver === "undefined") {
      tiles.forEach((tile) => tile.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.28 },
    );
    tiles.forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frameId = 0;
    const updatePlayback = () => {
      frameId = 0;
      const video = technologyVideoRef.current;
      if (!video) return;
      const viewportHeight = window.innerHeight || 1;
      const isActive = window.scrollY / viewportHeight >= scrollTimeline.performance.start;
      if (isActive) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    };
    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updatePlayback);
    };
    updatePlayback();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="performance-section" aria-labelledby="performance-title">
      <div className="performance-content">
        <h2 id="performance-title">{text.performanceTitle}</h2>
        <div className="performance-grid">
          <article className="performance-tile full-body" ref={(el) => { tileRefs.current[0] = el; }}>
            <img src="/performance-full-body.png" alt="" />
            <span>{text.performanceTiles[0]}</span>
          </article>
          <article className="performance-tile recovery" ref={(el) => { tileRefs.current[1] = el; }}>
            <img src="/performance-recovery.png" alt="" />
            <span>{text.performanceTiles[1]}</span>
          </article>
          <article className="performance-tile technology" ref={(el) => { tileRefs.current[2] = el; }}>
            <video
              ref={technologyVideoRef}
              src="/performance-technology.mp4"
              poster="/performance-technology.png"
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={text.performanceTiles[2]}
            />
            <span>{text.performanceTiles[2]}</span>
          </article>
          <article className="performance-tile experience" ref={(el) => { tileRefs.current[3] = el; }}>
            <img src="/performance-experience.png" alt="" />
            <span>{text.performanceTiles[3]}</span>
          </article>
        </div>
      </div>
    </section>
  );
}

const pricingPlans = [
  {
    name: "Starter",
    price: "39",
    description: "Ideal for discovering EMS technology and experiencing your first sessions.",
    features: ["4 Sessions", "Personalized Assessment", "Progress Tracking"],
  },
  {
    name: "Performance",
    featured: true,
    price: "39",
    description: "Designed for clients focused on results and long-term progress.",
    features: ["8 Sessions", "Personalized Coaching", "Body Composition Analysis", "Progress Tracking"],
  },
  {
    name: "Elite",
    price: "39",
    description: "The complete Beat Body experience.",
    features: ["12 Sessions", "Personalized Coaching", "Recovery Sessions", "Priority Booking", "Full Progress Monitoring"],
  },
];

function PricingSection({ plans = pricingPlans, language = "fr", onNavigate }) {
  const text = pageText[language] || pageText.fr;
  const gridRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, plans.findIndex((plan) => plan.featured)),
  );

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    const card = grid.children[activeIndex];
    if (card) {
      grid.scrollLeft = card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2;
    }
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;

    let frameId = 0;
    const updateActiveIndex = () => {
      frameId = 0;
      const cards = [...grid.children];
      if (!cards.length) return;
      const gridCenter = grid.scrollLeft + grid.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - gridCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateActiveIndex);
    };

    grid.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      grid.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const scrollToIndex = (index) => {
    const grid = gridRef.current;
    if (!grid) return;
    const card = grid.children[index];
    if (!card) return;
    grid.scrollTo({
      left: card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  return (
    <section id="pricing" className="pricing-section" aria-labelledby="pricing-title">
      <div className="pricing-content">
        <h2 id="pricing-title">{text.pricingTitle}</h2>
        <div className="pricing-carousel-frame">
        <div className="pricing-grid" ref={gridRef}>
          {plans.map((plan, index) => {
            const localizedPlan = text.pricingPlans[plan.name];
            const planName = localizedPlan?.[0] || plan.name;
            const planDescription = plan.description || localizedPlan?.[1] || "";
            const planFeatures = plan.features?.length ? plan.features : localizedPlan?.[2] || [];
            return (
            <article
              className={[
                "pricing-card",
                plan.featured ? "is-featured" : "",
                index === activeIndex ? "is-current" : "",
              ].filter(Boolean).join(" ")}
              key={plan.name}
              style={{ "--pricing-card-enter": `var(--pricing-card-${index + 1})` }}
            >
              <span className="pricing-name">{planName}</span>
              <p className="pricing-price"><strong>${plan.price}</strong><em>{text.perMonth}</em></p>
              <p className="pricing-description">{planDescription}</p>
              <div className="pricing-divider" />
              <ul>
                {planFeatures.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate("contact");
                  else window.location.hash = "contact";
                }}
              >
                {text.bookSession}
              </button>
            </article>
            );
          })}
        </div>
        </div>

        <div className="pricing-dots" role="tablist" aria-label="Pricing plans">
          {plans.map((plan, index) => {
            const localizedPlan = text.pricingPlans[plan.name];
            const planName = localizedPlan?.[0] || plan.name;
            return (
            <div className="pricing-dot-item" key={plan.name}>
              <button
                type="button"
                className={[
                  "pricing-dot",
                  plan.featured ? "is-active" : "",
                  index === activeIndex ? "is-current" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => scrollToIndex(index)}
              >
                <strong>${plan.price}</strong>
              </button>
              <span className="pricing-dot-label">{planName}</span>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const aboutStorySteps = [
  {
    number: "01",
    kicker: "VISION",
    title: "VISION",
    body: "IT STARTED WITH A QUESTION: WHAT IF RECOVERY WAS ENGINEERED AS PRECISELY AS PERFORMANCE?",
    side: "left",
  },
  {
    number: "02",
    kicker: "INNOVATION",
    title: "INNOVATION",
    body: "WE PAIRED EMS TECHNOLOGY WITH COGNITIVE TRAINING METHODS USED BY ELITE ATHLETES.",
    side: "right",
  },
  {
    number: "03",
    kicker: "TECHNOLOGY",
    title: "TECHNOLOGY",
    body: "EVERY DEVICE, EVERY PROTOCOL, CALIBRATED TO READ AND RESPOND TO YOUR BODY IN REAL TIME.",
    side: "left",
  },
  {
    number: "04",
    kicker: "RECOVERY",
    title: "RECOVERY",
    body: "MUSCLE RECOVERY ISN'T REST. IT'S ACTIVE REPAIR, GUIDED BY DATA AND BY HAND.",
    side: "right",
  },
  {
    number: "05",
    kicker: "PERFORMANCE",
    title: "PERFORMANCE",
    body: "20 MINUTES. 300+ MUSCLES. ONE SESSION, ENGINEERED FOR OUTPUT.",
    side: "left",
  },
  {
    number: "06",
    kicker: "RESULTS",
    title: "RESULTS",
    body: "MEASURABLE STRENGTH. MEASURABLE RECOVERY. MEASURABLE DIFFERENCE.",
    side: "right",
  },
];

const aboutExperienceItems = [
  { label: "RECOVERY", className: "recovery" },
  { label: "EMS", className: "ems" },
  { label: "WELLNESS", className: "wellness" },
  { label: "RESULTS", className: "results" },
  { label: "PERFORMANCE", className: "performance" },
  { label: "COACHING", className: "coaching" },
];

function AboutPage({ language = "fr" }) {
  const aboutRef = useRef(null);

  useEffect(() => {
    let frameId = 0;
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const smoothStep = (start, end, value) => {
      const progress = clamp((value - start) / (end - start));
      return progress * progress * (3 - 2 * progress);
    };

    const update = () => {
      frameId = 0;
      const root = aboutRef.current;
      if (!root) return;
      const viewportHeight = window.innerHeight || 1;
      const sectionProgress = (selector) => {
        const element = root.querySelector(selector);
        if (!element) return 0;
        const rect = element.getBoundingClientRect();
        return clamp((viewportHeight - rect.top) / (rect.height + viewportHeight));
      };
      const pinnedProgress = (selector) => {
        const element = root.querySelector(selector);
        if (!element) return 0;
        const rect = element.getBoundingClientRect();
        return clamp(-rect.top / Math.max(1, rect.height - viewportHeight));
      };
      const heroProgress = sectionProgress(".about-hero");
      const storyProgress = pinnedProgress(".about-story");
      const experienceProgress = sectionProgress(".about-experience");
      const storyShift = 12 - storyProgress * 160;
      const experienceEnter = smoothStep(0.05, 0.24, experienceProgress);
      const storySteps = Array.from(root.querySelectorAll(".about-story-step"));
      const storyTrack = root.querySelector(".about-story-track");
      const storyTrackHeight = storyTrack?.offsetHeight || 1;
      const lastStoryStep = storySteps[storySteps.length - 1];
      const storyLineEnd = lastStoryStep
        ? Math.min(
            storyTrackHeight,
            lastStoryStep.offsetTop + lastStoryStep.offsetHeight * 0.18
          )
        : storyTrackHeight;
      let storyLine = 0;
      storySteps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        const stepProgress = smoothStep(
          viewportHeight * 0.58,
          viewportHeight * 0.38,
          rect.top
        );
        const stepDirection = step.classList.contains("is-left") ? -1 : 1;
        const stepOffset = (1 - stepProgress) * 92 * stepDirection;
        const stepTarget = clamp((step.offsetTop + step.offsetHeight * 0.18) / storyLineEnd);
        storyLine = Math.max(storyLine, stepTarget * stepProgress);
        step.style.setProperty("--story-step-progress", stepProgress.toFixed(4));
        step.style.setProperty("--story-step-x", `${stepOffset.toFixed(2)}px`);
        step.classList.toggle("is-visible", stepProgress > 0.18);
      });
      storyLine = clamp(storyLine);

      root.style.setProperty("--about-hero-exit", smoothStep(0.62, 0.92, heroProgress).toFixed(4));
      root.style.setProperty("--about-story-scroll", storyProgress.toFixed(4));
      root.style.setProperty("--about-story-shift", `${storyShift.toFixed(2)}vh`);
      root.style.setProperty("--about-story-line-end", `${storyLineEnd.toFixed(2)}px`);
      root.style.setProperty("--about-story-line", `${(storyLine * 100).toFixed(2)}%`);
      root.style.setProperty("--about-experience-enter", experienceEnter.toFixed(4));
      root.style.setProperty("--about-experience-y", `${((1 - experienceEnter) * 42).toFixed(2)}px`);
      root.style.setProperty("--about-experience-scale", (0.94 + experienceEnter * 0.06).toFixed(4));
      root.style.setProperty("--about-experience-rotate", `${((1 - experienceEnter) * -4).toFixed(2)}deg`);
    };

    const requestUpdate = () => {
      if (!frameId) frameId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={aboutRef} className="about-sections">
      <AboutHeroSection language={language} />
      <AboutStorySection language={language} />
      <AboutExperienceSection language={language} />
    </div>
  );
}

const ABOUT_TITLE_LINE_TARGETS = [1, 0.84];
const ABOUT_TITLE_LINE_TARGETS_AR = [1, 1];
const ABOUT_TITLE_LINE2_TEXT = "PAS QUE DES CORPS";

function AboutHeroSection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const line2Text = text.aboutHeroTitle2;
  const h1Ref = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const suitRef = useRef(null);
  const line2CharRefs = useRef([]);
  const [lineScales, setLineScales] = useState([1, 1]);
  const [suitOverlap, setSuitOverlap] = useState(() => line2Text.split("").map(() => false));

  useEffect(() => {
    const refs = [line1Ref, line2Ref];
    const titleLineTargets = language === "ar" ? ABOUT_TITLE_LINE_TARGETS_AR : ABOUT_TITLE_LINE_TARGETS;

    const detectSuitOverlap = () => {
      const suit = suitRef.current;
      if (!suit) return;
      const suitBox = suit.getBoundingClientRect();
      const nextOverlap = line2CharRefs.current.map((el) => {
        if (!el) return false;
        const box = el.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        return (
          centerX >= suitBox.left &&
          centerX <= suitBox.right &&
          centerY >= suitBox.top &&
          centerY <= suitBox.bottom
        );
      });
      setSuitOverlap((prev) =>
        prev.length === nextOverlap.length && prev.every((v, i) => v === nextOverlap[i]) ? prev : nextOverlap
      );
    };

    const measure = () => {
      setLineScales([1, 1]);
      requestAnimationFrame(() => {
        const h1 = h1Ref.current;
        if (!h1) return;
        const containerWidth = h1.getBoundingClientRect().width;
        const nextScales = refs.map((ref, index) => {
          const line = ref.current;
          if (!line) return 1;
          const naturalWidth = line.getBoundingClientRect().width;
          if (naturalWidth <= 0) return 1;
            return (containerWidth * titleLineTargets[index]) / naturalWidth;
        });
        setLineScales(nextScales);
        requestAnimationFrame(detectSuitOverlap);
      });
    };

    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [line2Text, language]);

  return (
    <section className="about-hero" aria-labelledby="about-hero-title">
      <div className="about-hero-copy">
        <h1 id="about-hero-title" ref={h1Ref}>
          <span className="about-title-line" ref={line1Ref} style={{ transform: `scaleX(${lineScales[0]})` }}>
            {text.aboutHeroTitle1}
          </span>
          <span className="about-title-line" ref={line2Ref} style={{ transform: `scaleX(${lineScales[1]})` }}>
            {line2Text.split("").map((char, i) =>
              char === " " ? (
                " "
              ) : (
                <span
                  key={i}
                  ref={(el) => {
                    line2CharRefs.current[i] = el;
                  }}
                  className={suitOverlap[i] ? "about-title-white" : undefined}
                >
                  {char}
                </span>
              )
            )}
          </span>
        </h1>
        <p>{text.aboutHeroSubtitle}<strong>{text.aboutHeroStrong}</strong></p>
      </div>
      <img ref={suitRef} className="about-hero-suit" src="/about-suit.png" alt="" />
      <img className="about-hero-photo" src="/about-philosophy.png" alt="Beat Body EMS preparation" />
      <article className="about-philosophy">
        <h2>{text.philosophyTitle}</h2>
        <p>{text.philosophyBody}</p>
      </article>
    </section>
  );
}

function AboutStorySection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const localizedSteps = aboutStorySteps.map((step, index) => {
    const localized = text.aboutStorySteps[index];
    if (!localized) return step;
    return { ...step, kicker: localized[0], title: localized[1], body: localized[2] };
  });
  return (
    <section className="about-story" aria-labelledby="about-story-title">
      <h2 id="about-story-title">{text.aboutStoryTitle}</h2>
      <div className="about-story-track">
        <div className="about-story-line" aria-hidden="true">
          <span />
          <i />
        </div>
        <div className="about-story-items">
          {localizedSteps.map((step, index) => (
            <article
              className={`about-story-step is-${step.side}`}
              key={step.number}
              style={{ "--story-index": index }}
            >
              <p>{step.number} -- {step.kicker}</p>
              <h3>{step.title}</h3>
              <span>{step.body}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutExperienceSection({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const localizedExperienceItems = aboutExperienceItems.map((item, index) => ({
    ...item,
    label: text.aboutExperienceItems[index] || item.label,
  }));
  const [activeExperience, setActiveExperience] = useState(null);
  const [scrollExperience, setScrollExperience] = useState(aboutExperienceItems[0].className);
  const experienceRef = useRef(null);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const element = experienceRef.current;
      if (!element) return;
      const viewportHeight = window.innerHeight || 1;
      const rect = element.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (rect.height + viewportHeight * 0.45)));
      const index = Math.min(aboutExperienceItems.length - 1, Math.floor(progress * aboutExperienceItems.length));
      setScrollExperience(aboutExperienceItems[index].className);
    };
    const requestUpdate = () => {
      if (!frameId) frameId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  const visibleExperience = activeExperience || scrollExperience;

  return (
    <section ref={experienceRef} className="about-experience" aria-labelledby="about-experience-title">
      <h2 id="about-experience-title">{text.aboutExperienceTitle}</h2>
      <div className="experience-map" aria-label="Beat Body experience system">
        <div className="experience-ring outer" />
        <div className="experience-ring inner" />
        {localizedExperienceItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <span
              className={`experience-spoke ${item.className}${visibleExperience === item.className ? " is-active" : ""}`}
              aria-hidden="true"
            />
            <button
              className={`experience-node ${item.className}${visibleExperience === item.className ? " is-active" : ""}`}
              type="button"
              onMouseEnter={() => setActiveExperience(item.className)}
              onMouseLeave={() => setActiveExperience(null)}
              onFocus={() => setActiveExperience(item.className)}
              onBlur={() => setActiveExperience(null)}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
        <div className="experience-center">BEAT<br />BODY</div>
      </div>
    </section>
  );
}

function FinalCtaSection({ staticMode = false, language = "fr", onNavigate }) {
  const videoRef = useRef(null);
  const text = pageText[language] || pageText.fr;

  useEffect(() => {
    if (staticMode) {
      videoRef.current?.play().catch(() => {});
      return undefined;
    }

    let frameId = 0;
    const updatePlayback = () => {
      frameId = 0;
      const video = videoRef.current;
      if (!video) return;
      const viewportHeight = window.innerHeight || 1;
      const progress = window.scrollY / viewportHeight;
      const isActive = progress >= scrollTimeline.cta.start && progress <= scrollTimeline.footer.end + 0.25;
      if (isActive) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    };
    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updatePlayback);
    };
    updatePlayback();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [staticMode]);

  return (
    <section
      className={staticMode ? "final-cta-section final-cta-static" : "final-cta-section"}
      aria-labelledby="final-cta-title"
    >
      <div className="final-cta-shell">
        <video
          ref={videoRef}
          src="/ems-final-cta.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Beat Body EMS session"
        />
        <div className="final-cta-overlay" />
        <div className="final-cta-content">
          <div className="final-cta-badge">
            <span className="badge-avatars">
              <span />
              <span />
            </span>
            <span>{text.ctaBadge}</span>
          </div>
          <h2 id="final-cta-title">
            <span>{text.ctaTitle1}</span>
            <span className="mark-inline"><img src="/priority-vector.png" alt="" /></span>
            <span>{text.ctaTitle2}</span>
          </h2>
          <p>{text.ctaBody}</p>
          <a
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              if (onNavigate) onNavigate("contact");
              else window.location.hash = "contact";
            }}
          >
            {text.ctaButton}
          </a>
          <small><span>✓</span> {text.ctaSmall}</small>
        </div>
      </div>
    </section>
  );
}

function FooterWatermark() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [scaleX, setScaleX] = useState(1);

  useEffect(() => {
    const measure = () => {
      setScaleX(1);
      requestAnimationFrame(() => {
        const container = containerRef.current;
        const text = textRef.current;
        if (!container || !text) return;
        const containerWidth = window.innerWidth || container.getBoundingClientRect().width;
        const naturalWidth = text.scrollWidth;
        if (naturalWidth > 0) {
          setScaleX((containerWidth / naturalWidth) * 1.04);
        }
      });
    };

    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="footer-watermark" aria-hidden="true" ref={containerRef}>
      <span className="footer-watermark-text" ref={textRef} style={{ transform: `scaleX(${scaleX})` }}>
        BEAT BODY
      </span>
    </div>
  );
}

function FooterSection({ staticMode = false, language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const footerSections = text.footerSections.map(([title, items]) => ({ title, items }));
  const openDashboardAccess = (event) => {
    event.preventDefault();
    window.location.hash = "dashboard";
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <footer className={staticMode ? "footer-section footer-static" : "footer-section"} aria-label="Beat Body footer">
      <div className="footer-preview-strip" aria-hidden="true" />
      <div className="footer-content">
        <div className="footer-brand-row">
          <div className="footer-brand">
            <img src="/beat-body-logo.png" alt="Beat Body" />
            <span />
            <p>{text.footerTagline}</p>
          </div>
        </div>
        <div className="footer-main">
          <div className="footer-social">
            <h2>{text.followUs}</h2>
            <div className="social-list" aria-label="Social links">
              <a href="#" aria-label="Facebook"><SocialIcon type="facebook" /></a>
              <a href="#" aria-label="Instagram"><SocialIcon type="instagram" /></a>
              <a href="#" aria-label="TikTok"><SocialIcon type="tiktok" /></a>
              <a href="#" aria-label="LinkedIn"><SocialIcon type="linkedin" /></a>
            </div>
            <div className="store-list">
              <a href="#" className="store-badge">
                <StoreIcon type="apple" />
                <span>Download on the<br />App Store</span>
              </a>
              <a href="#" className="store-badge">
                <StoreIcon type="google" />
                <span>Get it on<br />Google Play</span>
              </a>
            </div>
          </div>
          {footerSections.map((section) => (
            <FooterColumn key={section.title} title={section.title} items={section.items} />
          ))}
        </div>
        <div className="footer-bottom">
          <span>{text.rights}</span>
          <a className="footer-access-link" href="#dashboard" onClick={openDashboardAccess}>Archive</a>
          <a href="mailto:beatbody@gmail.com">beatbody@gmail.com</a>
        </div>
        <FooterWatermark />
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <nav className="footer-column" aria-label={title}>
      <h3>{title}</h3>
      {items.map((item) => (
        <a href="#" key={item}>{item}</a>
      ))}
    </nav>
  );
}

function SocialIcon({ type }) {
  if (type === "facebook") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path fill="#1877f2" d="M30 16.09C30 8.3 23.73 2 16 2S2 8.3 2 16.09C2 23.13 7.12 28.97 13.81 30v-9.84h-3.55v-4.07h3.55v-3.1c0-3.53 2.09-5.48 5.29-5.48 1.53 0 3.13.28 3.13.28v3.46h-1.76c-1.73 0-2.27 1.08-2.27 2.19v2.65h3.86l-.62 4.07H18.2V30C24.88 28.97 30 23.13 30 16.09Z" />
      </svg>
    );
  }

  if (type === "instagram") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="footerInstagramGradient" cx="30%" cy="105%" r="115%">
            <stop offset="0" stopColor="#feda75" />
            <stop offset=".35" stopColor="#fa7e1e" />
            <stop offset=".55" stopColor="#d62976" />
            <stop offset=".75" stopColor="#962fbf" />
            <stop offset="1" stopColor="#4f5bd5" />
          </radialGradient>
        </defs>
        <rect x="4" y="4" width="24" height="24" rx="7" fill="url(#footerInstagramGradient)" />
        <rect x="9" y="9" width="14" height="14" rx="4.5" fill="none" stroke="#fff" strokeWidth="2.2" />
        <circle cx="16" cy="16" r="3.8" fill="none" stroke="#fff" strokeWidth="2.2" />
        <circle cx="22.2" cy="9.8" r="1.35" fill="#fff" />
      </svg>
    );
  }

  if (type === "tiktok") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path fill="#25f4ee" d="M20.25 7.1c.55 3.05 2.25 4.88 5.25 5.08v3.55a9.2 9.2 0 0 1-5.16-1.57v6.77c0 8.6-9.37 11.28-13.12 5.12-2.4-3.96-.93-10.93 6.78-11.2v3.75c-.54.09-1.13.23-1.65.43-1.58.6-2.48 1.72-2.23 3.7.48 3.78 7.45 4.9 6.88-2.49V7.1h3.25Z" />
        <path fill="#fe2c55" d="M18.9 6h3.2c.39 2.12 1.44 3.65 3.15 4.5v3.7a9 9 0 0 1-4.92-1.59v6.78c0 8.6-9.37 11.28-13.12 5.12a6.33 6.33 0 0 1-.86-3.08c1.15 3.66 7.2 4.4 6.68-2.35V6h5.87Z" opacity=".95" />
        <path fill="#111" d="M18.9 6c.55 3.05 2.25 4.88 5.25 5.08v3.55a9.2 9.2 0 0 1-5.16-1.57v6.77c0 8.6-9.37 11.28-13.12 5.12-2.4-3.96-.93-10.93 6.78-11.2v3.75c-.54.09-1.13.23-1.65.43-1.58.6-2.48 1.72-2.23 3.7.48 3.78 7.45 4.9 6.88-2.49V6h3.25Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <circle cx="18" cy="18" r="14" fill="#0a66c2" />
      <path fill="#fff" d="M11.2 15h3.52v10.7H11.2V15Zm1.76-4.75a2.02 2.02 0 1 1 0 4.04 2.02 2.02 0 0 1 0-4.04ZM17 15h3.36v1.46h.05c.47-.86 1.62-1.78 3.33-1.78 3.56 0 4.22 2.29 4.22 5.27v5.75h-3.52v-5.1c0-1.22-.02-2.78-1.73-2.78-1.73 0-1.99 1.32-1.99 2.69v5.19H17V15Z" />
    </svg>
  );
}

function StoreIcon({ type }) {
  if (type === "google") {
    return (
      <strong className="store-icon store-icon-google" aria-hidden="true">
        <svg viewBox="0 0 32 32" focusable="false">
          <path fill="#34a853" d="M6 4.7c-.36.39-.57.98-.57 1.76v19.08c0 .78.21 1.37.57 1.76l10.7-11.3L6 4.7Z" />
          <path fill="#4285f4" d="m20.06 12.43-3.36 3.56 3.44 3.62 4.08-2.36c1.15-.66 1.15-1.74 0-2.4l-4.16-2.42Z" />
          <path fill="#fbbc04" d="m6 4.7 14.06 7.73-3.36 3.56L6 4.7Zm0 22.6 14.14-7.69-3.44-3.62L6 27.3Z" />
          <path fill="#ea4335" d="m6 27.3 10.7-11.31 3.44 3.62L6 27.3Z" />
        </svg>
      </strong>
    );
  }

  return (
    <strong className="store-icon store-icon-apple" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <path fill="#fff" d="M23.1 17.1 21 15.9l-4.1 7.1a1.42 1.42 0 0 0 2.46 1.42l3.74-7.32Zm-8.75-3.72L9.4 21.94H7.15a1.38 1.38 0 1 0 0 2.76h3.06c.5 0 .96-.27 1.21-.7l5.31-9.2-2.38-1.42Zm3.76-3.34.82-1.42a1.42 1.42 0 1 0-2.46-1.42l-.82 1.42-.82-1.42a1.42 1.42 0 0 0-2.46 1.42l5.38 9.32h-3.01a1.38 1.38 0 1 0 0 2.76h6.9c.5 0 .96-.27 1.21-.7.25-.43.25-.97 0-1.4l-4.74-8.56Zm6.74 11.9H23.5a1.38 1.38 0 0 0 0 2.76h1.35a1.38 1.38 0 0 0 0-2.76Z" />
      </svg>
    </strong>
  );
}

function ServicesPageFooter({ language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const footerSections = text.footerSections.map(([title, items]) => ({ title, items }));

  return (
    <footer className="services-page-footer" aria-label="Beat Body footer">
      <div className="footer-content services-page-footer-content">
        <div className="footer-brand-row">
          <div className="footer-brand">
            <img src="/beat-body-logo.png" alt="Beat Body" />
            <span />
            <p>{text.footerTagline}</p>
          </div>
        </div>
        <div className="footer-main">
          <div className="footer-social">
            <h2>{text.followUs}</h2>
            <div className="social-list" aria-label="Social links">
              <a href="#" aria-label="Facebook"><SocialIcon type="facebook" /></a>
              <a href="#" aria-label="Instagram"><SocialIcon type="instagram" /></a>
              <a href="#" aria-label="TikTok"><SocialIcon type="tiktok" /></a>
              <a href="#" aria-label="LinkedIn"><SocialIcon type="linkedin" /></a>
            </div>
            <div className="store-list">
              <a href="#" className="store-badge">
                <StoreIcon type="apple" />
                <span>Download on the<br />App Store</span>
              </a>
              <a href="#" className="store-badge">
                <StoreIcon type="google" />
                <span>Get it on<br />Google Play</span>
              </a>
            </div>
          </div>
          {footerSections.map((section) => (
            <FooterColumn key={section.title} title={section.title} items={section.items} />
          ))}
        </div>
        <div className="footer-bottom">
          <span>{text.rights}</span>
          <a href="mailto:beatbody@gmail.com">beatbody@gmail.com</a>
        </div>
        <FooterWatermark />
      </div>
    </footer>
  );
}

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatMonthLabel(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function ContactMonthCalendar({
  year,
  month,
  label,
  selectedDate,
  today,
  onSelect,
  className = "",
  blockedDates = new Set(),
  language = "fr",
}) {
  const cells = buildMonthCells(year, month);
  const text = pageText[language] || pageText.fr;

  return (
    <div className={["contact-calendar-month", className].filter(Boolean).join(" ")}>
      <div className="contact-calendar-month-label">{label}</div>
      <div className="contact-calendar-weekdays">
        {text.weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="contact-calendar-days">
        {cells.map((day, index) => {
          if (day === null) {
            return <span className="contact-calendar-day is-empty" key={index} />;
          }
          const cellDate = new Date(year, month, day);
          const isPast = cellDate < today;
          const isBlocked = blockedDates.has(`${year}-${month}-${day}`);
          const isDisabled = isPast || isBlocked;
          const isSelected = Boolean(selectedDate) && cellDate.getTime() === selectedDate.getTime();
          return (
            <button
              key={index}
              type="button"
              className={[
                "contact-calendar-day",
                isSelected ? "is-selected" : "",
                isDisabled ? "is-disabled" : "",
                isBlocked ? "is-blocked" : "",
              ].filter(Boolean).join(" ")}
              disabled={isDisabled}
              onClick={() => onSelect(cellDate)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContactDateModal({
  viewDate,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onSelectDate,
  onClose,
  onContinue,
  blockedDates,
  language = "fr",
}) {
  const text = pageText[language] || pageText.fr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthOne = viewDate;
  const monthTwo = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  return (
    <div className="contact-modal-overlay" role="dialog" aria-modal="false" aria-label={text.datePreferred}>
      <div className="contact-modal">
        <div className="contact-modal-header">
          <span>
            <Calendar size={18} />
            {text.datePreferred}
          </span>
          <button type="button" aria-label="Fermer" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="contact-modal-body">
          <button
            type="button"
            className="contact-modal-nav contact-modal-nav-prev"
            aria-label="Mois précédent"
            onClick={onPrevMonth}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="contact-modal-months">
            <ContactMonthCalendar
              year={monthOne.getFullYear()}
              month={monthOne.getMonth()}
              label={formatMonthLabel(monthOne)}
              selectedDate={selectedDate}
              today={today}
              onSelect={onSelectDate}
              blockedDates={blockedDates}
              language={language}
            />
            <ContactMonthCalendar
              year={monthTwo.getFullYear()}
              month={monthTwo.getMonth()}
              label={formatMonthLabel(monthTwo)}
              selectedDate={selectedDate}
              today={today}
              onSelect={onSelectDate}
              className="contact-calendar-month-secondary"
              blockedDates={blockedDates}
              language={language}
            />
          </div>

          <button
            type="button"
            className="contact-modal-nav contact-modal-nav-next"
            aria-label="Mois suivant"
            onClick={onNextMonth}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          type="button"
          className="contact-modal-continue"
          disabled={!selectedDate}
          onClick={onContinue}
        >
          {text.continue}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ContactPage({ phones = [], emails = [], blockedDates = new Set(), language = "fr" }) {
  const text = pageText[language] || pageText.fr;
  const [activeTab, setActiveTab] = useState("form");
  const [showModal, setShowModal] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const updateFormData = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const formatSelectedDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("fr-MA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const sendWhatsAppReservation = () => {
    if (!selectedDate) return;
    const whatsappNumber = "212615230807";
    const text = [
      "Nouvelle demande de reservation Beat Body",
      "",
      `Nom: ${formData.name}`,
      `Telephone: +212 ${formData.phone}`,
      ...(formData.email ? [`Email: ${formData.email}`] : []),
      `Date preferee: ${formatSelectedDate(selectedDate)}`,
      `Message: ${formData.message}`,
    ].join("\n");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setShowModal(false);
  };

  const toTelHref = (phone) => {
    const trimmed = String(phone).trim();
    if (trimmed.startsWith("+")) return `tel:${trimmed.replace(/[^\d+]/g, "")}`;
    return `tel:${trimmed.replace(/\D/g, "")}`;
  };

  const toMailHref = (email) => `mailto:${String(email).trim()}`;

  const features = [
    { icon: Cpu, label: text.contactFeatures[0] },
    { icon: TrendingUp, label: text.contactFeatures[1] },
    { icon: Sparkles, label: text.contactFeatures[2] },
    { icon: Rocket, label: text.contactFeatures[3] },
    { icon: MoreHorizontal, label: text.contactFeatures[4] },
  ];

  return (
    <section className="contact-page-content">
      <div className="contact-grid">
        <div className="contact-intro">
          <h1>
            {text.contactTitle1}
            <br />
            {text.contactTitle2}
          </h1>

          <div className="contact-badge">
            <span className="contact-badge-avatars">
              <img src="/people.png" alt="" />
              <img src="/proof-athlete.png" alt="" />
            </span>
            {text.contactBadge}
          </div>

          <p>
            {text.contactIntro}
          </p>

          <ul className="contact-features">
            {features.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={16} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className={`contact-card${showModal ? " has-calendar" : ""}${activeTab === "call" ? " is-call" : ""}`}>
          <div className="contact-tabs">
            <button
              type="button"
              className={activeTab === "form" ? "active" : undefined}
              onClick={() => {
                setActiveTab("form");
              }}
            >
              {text.formTab}
            </button>
            <button
              type="button"
              className={activeTab === "call" ? "active" : undefined}
              onClick={() => {
                setShowModal(false);
                setActiveTab("call");
              }}
            >
              {text.callTab}
            </button>
          </div>

          <div className="contact-card-logo">
            <img src="/contact-form-logo-tight.png" alt="Beat Body" />
          </div>

          {activeTab === "form" ? (
            <>
              <p className="contact-card-note">
                {text.formNote}
              </p>
              <form
                className="contact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const fields = form.querySelectorAll("input, textarea");
                  const phone = fields[1].value.replace(/\D/g, "").slice(0, 9);
                  setFormData({
                    name: fields[0].value.trim(),
                    phone,
                    email: fields[2].value.trim(),
                    message: fields[3].value.trim(),
                  });
                  setShowModal(true);
                }}
              >
                <input type="text" placeholder={text.namePlaceholder} required />
                <div className="contact-phone">
                  <span className="contact-phone-code">🇲🇦 +212</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[0-9]{9}"
                    maxLength={9}
                    placeholder={text.phonePlaceholder}
                    title="Entrez un numero marocain de 9 chiffres."
                    required
                    onInput={(event) => {
                      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 9);
                    }}
                  />
                </div>
                <input type="email" placeholder={text.emailPlaceholder} />
                <textarea placeholder={text.messagePlaceholder} required />
                <button type="submit" className="contact-submit">
                  {text.reserveButton}
                  <ChevronRight size={16} />
                </button>
              </form>
              {showModal && (
                <ContactDateModal
                  viewDate={viewDate}
                  onPrevMonth={() => setViewDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                  onNextMonth={() => setViewDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onClose={() => setShowModal(false)}
                  onContinue={sendWhatsAppReservation}
                  blockedDates={blockedDates}
                  language={language}
                />
              )}
            </>
          ) : (
            <div className="contact-call">
              <p className="contact-card-note">
                {text.callNote}
              </p>
              <div className="contact-call-actions">
                {phones.map((phone) => (
                  <a
                    key={phone}
                    className="contact-call-number"
                    href={toTelHref(phone)}
                  >
                    <Phone size={16} />
                    {phone}
                  </a>
                ))}
                {emails.map((email) => (
                  <a key={email} className="contact-call-number" href={toMailHref(email)}>
                    <Mail size={16} />
                    {email}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
