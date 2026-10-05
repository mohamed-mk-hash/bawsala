import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../../firebase";

import "./LiveCourseDetails.css";

import homeIcon from "../../assets/Home_icon.png";
import liveFeatureImage from "../../assets/live_course_featured.png";
import trainingIcon from "../../assets/Workshop_&_Training_Programs.png";
import strategyIcon from "../../assets/course_strategy.png";
import blueCalendarIcon from "../../assets/blue_calendar_course.png";
import whiteClockIcon from "../../assets/white_clock_course.png";
import calendarWhiteIcon from "../../assets/calendar_white_course.png";
import languageIcon from "../../assets/course_language.png";
import zoomIcon from "../../assets/zoom_course.png";
import secureIcon from "../../assets/secure_course.png";
import supportIcon from "../../assets/support_course.png";
import instructorAvatar from "../../assets/courses_account.png";
import instructorFeatured from "../../assets/instructor_featured.jpg";
import bawsalaLogo from "../../assets/bawsala-logo.png";
import courseImage from "../../assets/featured_course.png";
import monitorIcon from "../../assets/MonitorPlay.png";
import shareIcon from "../../assets/ShareFat.png";
import clockIcon from "../../assets/Clock.png";
import calendarIcon from "../../assets/CalendarBlank.png";
import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";
import arrowDownIcon from "../../assets/arrow-down.png";

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
};

const liveCourseData = {
  en: {
    breadcrumbCourses: "Courses and programmes",
    pageTitle: "Live of digital marketing for startups",
    topDate: "20 - 22 June 2025",
    topTime: "10:00 AM - 4:00 PM",
    topFormat: "Online (Zoom)",

    heroBadge: "Live Session",
    heroTitle: "Digital Marketing\nMasterclass",
    heroDescription:
      "Join this live session with our expert and get practical strategies to grow your brand and reach your audience.",
    dateLabel: "Date",
    dateValue: "Thu, 15 May 2025",
    timeLabel: "Time",
    timeValue: "02:00 PM (GMT+1)",
    languageLabel: "Language",
    languageValue: "English",
    countdownTitle: "The live session starts in",
    countdown: {
      hours: "02",
      minutes: "18",
      seconds: "45",
    },

    seatsTitle: "Seats are limited!",
    seatsValue: "32 / 100 seats left",
    seatsLeftShort: "32 / 100",
    price: "2,500 DZD",
    secureText: "Secure your spot",
    registerText: "Register Now",

    tabs: ["Overview", "About the Instructor", "Program", "FAQ"],

    overviewTitle: "About this session",
    overviewText:
      "This live session will give you practical insights, real-world examples, and actionable strategies you can apply right away to improve your digital marketing results.",
    learnTitle: "In this session, you will learn:",
    learningPoints: [
      "Build a strategy that works",
      "Reach the right audience",
      "Improve engagement and conversions",
      "Measure what matters",
    ],
    info: [
      { label: "Level", value: "All Levels" },
      { label: "Category", value: "Marketing" },
      { label: "Tags", value: "Strategy, Social Media, Ads, Growth" },
      { label: "Seats left", value: "32 / 100" },
      { label: "Replay", value: "No replay will be available", danger: true },
    ],

    instructorSectionTitle: "Meet Your Instructor",
    instructorName: "Ahmed Benali",
    instructorRole: "Business Strategy Consultant",
    instructorBio:
      "Ahmed has over 8 years of experience helping startups and organizations build business strategies, operational systems, and growth plans across North Africa.",
    instructorSidebarRole: "Digital Marketing Expert",
    instructorSidebarBio:
      "10+ years of experience helping brands grow through data-driven digital marketing strategies.",
    audienceTitle: "This Course Is For",
    audienceTags: [
      "Entrepreneurs",
      "Startup Founders",
      "Consultants",
      "SME Owners",
      "Students",
      "Business Managers",
    ],

    programTitle: "Program",
    modules: [
      {
        module: "Module 1:",
        title: "Introduction to Business Planning",
        meta: "8 quiz   12 resources",
        description:
          "This course provides a practical introduction to the fundamentals of business planning. You will learn how to transform an idea into a structured plan by defining your value proposition, understanding your market, and organizing your operations.",
        start: "09h00",
        end: "09h30",
      },
      {
        module: "Module 4:",
        title: "Introduction to Business Planning",
        meta: "8 quiz   12 resources",
        description:
          "Learn how to structure your offer, identify the right customer segment, and position your message clearly.",
        start: "09h00",
        end: "09h30",
      },
      {
        module: "Module 5:",
        title: "Introduction to Business Planning",
        meta: "8 quiz   12 resources",
        description:
          "Discover the practical tools used to create campaigns, manage channels, and track results.",
        start: "09h00",
        end: "09h30",
      },
      {
        module: "Module 6:",
        title: "Introduction to Business Planning",
        meta: "8 quiz   12 resources",
        description:
          "Wrap up the session with a simple action plan and a checklist you can use after the class.",
        start: "09h00",
        end: "09h30",
      },
    ],

    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "How do I access the live session?",
        answer:
          "After registration, you will receive the Zoom access link and session reminders by email.",
      },
      {
        question: "Will there be a recording available?",
        answer:
          "No replay will be available for this session, so please join live at the scheduled time.",
      },
      {
        question: "What materials do I need to prepare?",
        answer:
          "You only need a notebook, a stable internet connection, and any questions you want to ask during the session.",
      },
      {
        question: "Can I ask questions during the masterclass?",
        answer:
          "Yes. There will be dedicated Q&A moments during the live masterclass.",
      },
    ],

    sidebarTitle: "Session Information",
    liveLabel: "Live",
    trainingLabel: "Training",
    sessionTraining: "Digital Marketing Strategy",
    sessionDateLabel: "Date",
    sessionDateValue: "20 - 22 June 2025",
    sessionTimeLabel: "Time",
    sessionTimeValue: "10:00 AM - 4:00 PM (Local Time)",
    sessionFormatLabel: "Format",
    sessionFormatValue: "Online (Zoom)",
    sessionDurationLabel: "Duration",
    sessionDurationValue: "3 Days",
    sessionSeatsLabel: "Seats",
    sessionSeatsValue: "15 Seats Left",
    recordingTitle: "This session is being recorded",
    recordingText: "You will receive the recording after the training.",

    instructorCardTitle: "Instructor",
    helpTitle: "Need Help?",
    helpText:
      "If you have any technical issues or questions, our support team is here to help.",
    supportText: "Contact Support",
  },

  ar: {
    breadcrumbCourses: "الدورات والبرامج",
    pageTitle: "بث مباشر حول التسويق الرقمي للشركات الناشئة",
    topDate: "20 - 22 جوان 2025",
    topTime: "10:00 صباحًا - 4:00 مساءً",
    topFormat: "أونلاين (Zoom)",

    heroBadge: "جلسة مباشرة",
    heroTitle: "ماستر كلاس\nالتسويق الرقمي",
    heroDescription:
      "انضم إلى هذه الجلسة المباشرة مع خبيرنا واحصل على استراتيجيات عملية لتنمية علامتك التجارية والوصول إلى جمهورك.",
    dateLabel: "التاريخ",
    dateValue: "الخميس، 15 ماي 2025",
    timeLabel: "الوقت",
    timeValue: "02:00 مساءً (GMT+1)",
    languageLabel: "اللغة",
    languageValue: "العربية",
    countdownTitle: "تبدأ الجلسة المباشرة بعد",
    countdown: {
      hours: "02",
      minutes: "18",
      seconds: "45",
    },

    seatsTitle: "الأماكن محدودة!",
    seatsValue: "32 / 100 مقعد متبقي",
    seatsLeftShort: "32 / 100",
    price: "2,500 دج",
    secureText: "احجز مكانك بأمان",
    registerText: "سجل الآن",

    tabs: ["نظرة عامة", "عن المدرب", "البرنامج", "الأسئلة الشائعة"],

    overviewTitle: "حول هذه الجلسة",
    overviewText:
      "ستمنحك هذه الجلسة المباشرة أفكارًا عملية، أمثلة واقعية، واستراتيجيات قابلة للتطبيق مباشرة لتحسين نتائجك في التسويق الرقمي.",
    learnTitle: "في هذه الجلسة ستتعلم:",
    learningPoints: [
      "بناء استراتيجية فعالة",
      "الوصول إلى الجمهور المناسب",
      "تحسين التفاعل والتحويلات",
      "قياس المؤشرات المهمة",
    ],
    info: [
      { label: "المستوى", value: "كل المستويات" },
      { label: "التصنيف", value: "التسويق" },
      { label: "الوسوم", value: "استراتيجية، سوشيال ميديا، إعلانات، نمو" },
      { label: "المقاعد المتبقية", value: "32 / 100" },
      { label: "الإعادة", value: "لن تكون الإعادة متاحة", danger: true },
    ],

    instructorSectionTitle: "تعرف على المدرب",
    instructorName: "Ahmed Benali",
    instructorRole: "Business Strategy Consultant",
    instructorBio:
      "يمتلك أحمد أكثر من 8 سنوات من الخبرة في مساعدة الشركات الناشئة والمنظمات على بناء استراتيجيات الأعمال، الأنظمة التشغيلية، وخطط النمو في شمال إفريقيا.",
    instructorSidebarRole: "خبير تسويق رقمي",
    instructorSidebarBio:
      "أكثر من 10 سنوات من الخبرة في مساعدة العلامات التجارية على النمو عبر استراتيجيات تسويق رقمية مبنية على البيانات.",
    audienceTitle: "هذه الدورة مناسبة لـ",
    audienceTags: [
      "رواد الأعمال",
      "مؤسسو الشركات الناشئة",
      "المستشارون",
      "أصحاب المؤسسات الصغيرة",
      "الطلبة",
      "مديرو الأعمال",
    ],

    programTitle: "البرنامج",
    modules: [
      {
        module: "المحور 1:",
        title: "مقدمة في تخطيط الأعمال",
        meta: "8 اختبارات   12 مورد",
        description:
          "يقدم هذا المحور مقدمة عملية لأساسيات تخطيط الأعمال. ستتعلم كيف تحول الفكرة إلى خطة منظمة من خلال تحديد القيمة المقترحة، فهم السوق، وتنظيم العمليات.",
        start: "09h00",
        end: "09h30",
      },
      {
        module: "المحور 4:",
        title: "مقدمة في تخطيط الأعمال",
        meta: "8 اختبارات   12 مورد",
        description:
          "ستتعلم كيف تنظم عرضك، تحدد الشريحة المناسبة من العملاء، وتوضح رسالتك التسويقية.",
        start: "09h00",
        end: "09h30",
      },
      {
        module: "المحور 5:",
        title: "مقدمة في تخطيط الأعمال",
        meta: "8 اختبارات   12 مورد",
        description:
          "اكتشف الأدوات العملية المستخدمة لإنشاء الحملات، إدارة القنوات، وتتبع النتائج.",
        start: "09h00",
        end: "09h30",
      },
      {
        module: "المحور 6:",
        title: "مقدمة في تخطيط الأعمال",
        meta: "8 اختبارات   12 مورد",
        description:
          "اختتم الجلسة بخطة عمل بسيطة وقائمة تحقق يمكنك استخدامها بعد الحصة.",
        start: "09h00",
        end: "09h30",
      },
    ],

    faqTitle: "الأسئلة الشائعة",
    faqs: [
      {
        question: "كيف يمكنني الدخول إلى الجلسة المباشرة؟",
        answer:
          "بعد التسجيل، ستصلك رسالة بريد إلكتروني تحتوي على رابط Zoom وتذكيرات الجلسة.",
      },
      {
        question: "هل ستكون هناك إعادة متاحة؟",
        answer:
          "لن تكون الإعادة متاحة لهذه الجلسة، لذلك يرجى الحضور مباشرة في الوقت المحدد.",
      },
      {
        question: "ما المواد التي أحتاج إلى تحضيرها؟",
        answer:
          "تحتاج فقط إلى دفتر ملاحظات، اتصال إنترنت مستقر، وأي أسئلة تريد طرحها أثناء الجلسة.",
      },
      {
        question: "هل يمكنني طرح الأسئلة أثناء الماستر كلاس؟",
        answer: "نعم، ستكون هناك فترات مخصصة للأسئلة والأجوبة خلال الجلسة.",
      },
    ],

    sidebarTitle: "معلومات الجلسة",
    liveLabel: "مباشر",
    trainingLabel: "التدريب",
    sessionTraining: "استراتيجية التسويق الرقمي",
    sessionDateLabel: "التاريخ",
    sessionDateValue: "20 - 22 جوان 2025",
    sessionTimeLabel: "الوقت",
    sessionTimeValue: "10:00 صباحًا - 4:00 مساءً (الوقت المحلي)",
    sessionFormatLabel: "الصيغة",
    sessionFormatValue: "أونلاين (Zoom)",
    sessionDurationLabel: "المدة",
    sessionDurationValue: "3 أيام",
    sessionSeatsLabel: "المقاعد",
    sessionSeatsValue: "15 مقعد متبقي",
    recordingTitle: "هذه الجلسة يتم تسجيلها",
    recordingText: "ستحصل على التسجيل بعد انتهاء التدريب.",

    instructorCardTitle: "المدرب",
    helpTitle: "تحتاج مساعدة؟",
    helpText:
      "إذا واجهت أي مشكلة تقنية أو كان لديك سؤال، فريق الدعم جاهز لمساعدتك.",
    supportText: "تواصل مع الدعم",
  },
};


const getLocalizedObject = (item, language) => {
  if (!item) return {};

  return item?.[language] || item?.en || item?.ar || {};
};

const parsePriceValue = (...values) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    const digitsOnly = String(value || "").replace(/[^\d]/g, "");

    if (digitsOnly) {
      return Number(digitsOnly);
    }
  }

  return 0;
};

const formatDZD = (value, isArabic) => {
  const numberValue = Number(value || 0);
  const formattedNumber = numberValue.toLocaleString("fr-FR");

  return isArabic ? `${formattedNumber} دج` : `${formattedNumber} DZD`;
};

const getCoursePriceValue = (course, localizedCourse = {}) => {
  if (!course) return 0;

  if (course.isFree) return 0;

  return parsePriceValue(
    localizedCourse.priceLabel,
    course.priceLabel,
    course.priceText,
    course.en?.priceLabel,
    course.ar?.priceLabel,
    localizedCourse.priceValue,
    course.priceValue,
    localizedCourse.price,
    course.price
  );
};

const getCoursePriceLabel = (course, localizedCourse = {}, isArabic, priceValue) => {
  const savedLabel =
    localizedCourse.priceLabel ||
    course?.priceLabel ||
    course?.priceText ||
    course?.en?.priceLabel ||
    course?.ar?.priceLabel ||
    "";

  if (savedLabel) return savedLabel;

  if (course?.isFree) return isArabic ? "مجاني" : "Free";

  if (priceValue > 0) return formatDZD(priceValue, isArabic);

  return "";
};

const getCourseTitle = (course, language) => {
  const localized = getLocalizedObject(course, language);

  return localized.title || localized.cardTitle || "";
};

const getCourseDescription = (course, language) => {
  const localized = getLocalizedObject(course, language);

  return (
    localized.cardShortDescription ||
    localized.subtitle ||
    localized.seoDescription ||
    ""
  );
};

const getCourseSlug = (course) => {
  return course?.slug || course?.en?.slug || course?.ar?.slug || course?.id;
};

const getCourseDetailsUrl = (course) => {
  return `/courses/${getCourseSlug(course)}`;
};

const splitTitleIntoLines = (title, language) => {
  const cleanTitle = String(title || "").trim();

  if (language === "ar") {
    return [cleanTitle];
  }

  const words = cleanTitle.split(/\s+/).filter(Boolean);

  if (words.length <= 2) return [cleanTitle];

  if (words.length <= 3) {
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")].filter(Boolean);
  }

  if (words.length === 4) {
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  }

  return [
    words.slice(0, 2).join(" "),
    words.slice(2, 4).join(" "),
    words.slice(4).join(" "),
  ].filter(Boolean);
};

const isPublished = (course) => {
  if (!course?.status) return true;

  return course.status === "published";
};

const isLiveCourse = (course) => {
  const type = String(course?.courseType || course?.type || course?.format || "").toLowerCase();

  return Boolean(course?.isLive) || type.includes("live");
};

function RelatedCourseCard({ course, language, isArabic }) {
  const localized = getLocalizedObject(course, language);
  const title = getCourseTitle(course, language);
  const titleLines = splitTitleIntoLines(title, language);
  const description = getCourseDescription(course, language);
  const level = localized.level || "";
  const instructorName = localized.instructorName || "";
  const instructorLabel = localized.instructorLabel || (isArabic ? "المدرب:" : "Instructor:");
  const duration = localized.duration || "";
  const workload = localized.workload || "";
  const priceValue = getCoursePriceValue(course, localized);
  const priceLabel = getCoursePriceLabel(course, localized, isArabic, priceValue);
  const courseTypeLabel = localized.courseTypeLabel || (isArabic ? "دورة" : "Cours");
  const featuredImageUrl = course.featuredImageUrl || courseImage;
  const instructorAvatarUrl = course.instructorAvatarUrl || instructorAvatar;
  const badgeColor = course.badgeColor || "purple";

  return (
    <article className="related-course-card">
      <div className="related-course-image-wrap">
        <img src={featuredImageUrl} alt={title} className="related-course-image" />

        <div className={`related-course-overlay ${badgeColor}`}>
          <h3 dir={isArabic ? "rtl" : "ltr"}>
            {isArabic
              ? title
              : titleLines.map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < titleLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
          </h3>
        </div>

        <div className="related-course-badge">
          <img src={monitorIcon} alt="" />
          <span>{courseTypeLabel}</span>
        </div>

        <button className="related-course-share" type="button" aria-label={isArabic ? "مشاركة" : "Share"}>
          <img src={shareIcon} alt="" />
        </button>
      </div>

      <div className="related-course-meta">
        {level && <span className="related-course-level">{level}</span>}

        {instructorName && (
          <div className="related-course-instructor">
            <img src={instructorAvatarUrl} alt={instructorName} />
            <span>
              {instructorLabel} <strong>{instructorName}</strong>
            </span>
          </div>
        )}
      </div>

      <h3 className="related-course-title">{title}</h3>

      <div className="related-course-info">
        {duration && (
          <span>
            <img src={calendarIcon} alt="" />
            {duration}
          </span>
        )}

        {workload && (
          <span>
            <img src={clockIcon} alt="" />
            {workload}
          </span>
        )}
      </div>

      <p className="related-course-desc">{description}</p>

      {priceLabel && (
        <p className="related-course-price">
          <bdi>{priceLabel}</bdi>
        </p>
      )}

      <Link to={getCourseDetailsUrl(course)} className="related-course-btn">
        {isArabic ? "عرض التفاصيل" : "View details"}
      </Link>
    </article>
  );
}

function TopMetaItem({ icon, children, className = "" }) {
  return (
    <span className={`live-course-top-meta__item ${className}`}>
      <img src={icon} alt="" />
      {children}
    </span>
  );
}

function SidebarInfoRow({ icon, label, value, iconClassName = "" }) {
  return (
    <div className="live-course-info-row">
      <span className={`live-course-info-row__icon ${iconClassName}`.trim()}>
        <img src={icon} alt="" />
      </span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ProgramModule({ item, index, isOpen, onToggle }) {
  const panelId = `live-course-module-panel-${index}`;

  return (
    <article
      className={`live-course-module ${isOpen ? "is-open" : ""}`}
      style={{ "--module-delay": `${index * 70}ms` }}
    >
      <button
        className="live-course-module__head"
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <div className="live-course-module__text">
          <h3>{item.module}</h3>
          <p>{item.title}</p>

          <span className="live-course-module__meta">{item.meta}</span>
        </div>

        <div className="live-course-module__side">
          <span className="live-course-module__time">
            <bdi>{item.start}</bdi>
            <i></i>
            <bdi>{item.end}</bdi>
          </span>

          <span className="live-course-module__arrow" aria-hidden="true">
            <img src={arrowDownIcon} alt="" />
          </span>
        </div>
      </button>

      <div
        id={panelId}
        className="live-course-module__body"
        aria-hidden={!isOpen}
      >
        <div className="live-course-module__body-inner">
          <p className="live-course-module__description">{item.description}</p>
        </div>
      </div>
    </article>
  );
}

function FaqItem({ item, index, isOpen, onToggle }) {
  const panelId = `live-course-faq-panel-${index}`;

  return (
    <article
      className={`live-course-faq ${isOpen ? "is-open" : ""}`}
      style={{ "--faq-delay": `${index * 70}ms` }}
    >
      <button
        className="live-course-faq__question"
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span>{item.question}</span>
        <b aria-hidden="true">
          <img src={arrowDownIcon} alt="" />
        </b>
      </button>

      <div id={panelId} className="live-course-faq__body" aria-hidden={!isOpen}>
        <div className="live-course-faq__body-inner">
          <p className="live-course-faq__answer">{item.answer}</p>
        </div>
      </div>
    </article>
  );
}

const LiveCourseDetails = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [activeTab, setActiveTab] = useState(0);
  const [openModule, setOpenModule] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);

  const isArabic = language === "ar";
  const content = useMemo(() => liveCourseData[language] || liveCourseData.en, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const handleLanguageChanged = (event) => {
      const newLanguage = event.detail?.language;

      if (newLanguage === "ar" || newLanguage === "en") {
        setLanguage(newLanguage);
        localStorage.setItem("site_language", newLanguage);
      }
    };

    window.addEventListener("languageChanged", handleLanguageChanged);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChanged);
    };
  }, []);


  useEffect(() => {
    let cancelled = false;

    const fetchRelatedCourses = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        const allCourses = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        const finalCourses = allCourses
          .filter((item) => isPublished(item) && !isLiveCourse(item))
          .slice(0, 3);

        if (!cancelled) {
          setRelatedCourses(finalCourses);
        }
      } catch (error) {
        console.error("Error loading related courses:", error);

        if (!cancelled) {
          setRelatedCourses([]);
        }
      }
    };

    fetchRelatedCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="live-course-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="live-course-shell">
        <nav className="live-course-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" aria-label="Home" className="live-course-breadcrumb__home">
            <img src={homeIcon} alt="" />
          </Link>

          <span>›</span>

          <Link to="/courses">{content.breadcrumbCourses}</Link>

          <span>›</span>

          <span>{content.pageTitle}</span>
        </nav>

        <header className="live-course-header">
          <div>
            <span className="live-course-status">
              <i></i>
              {content.liveLabel}
            </span>

            <h1>{content.pageTitle}</h1>

            <div className="live-course-top-meta">
              <TopMetaItem icon={blueCalendarIcon}>{content.topDate}</TopMetaItem>
              <TopMetaItem icon={whiteClockIcon} className="is-blue-clock">
                {content.topTime}
              </TopMetaItem>
              <TopMetaItem icon={zoomIcon} className="is-pill">
                {content.topFormat}
              </TopMetaItem>
            </div>
          </div>
        </header>

        <div className="live-course-grid">
          <div className="live-course-main-column">
            <section className="live-course-hero-card">
              <div className="live-course-hero-content">
                <span className="live-course-hero-kicker">
                  <i></i>
                  {content.heroBadge}
                </span>

                <h2>
                  {content.heroTitle.split("\n").map((line, index) => (
                    <React.Fragment key={line}>
                      {line}
                      {index < content.heroTitle.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h2>

                <p>{content.heroDescription}</p>

                <div className="live-course-hero-facts">
                  <div>
                    <img src={calendarWhiteIcon} alt="" />
                    <span>{content.dateLabel}</span>
                    <strong>{content.dateValue}</strong>
                  </div>

                  <div>
                    <img src={whiteClockIcon} alt="" />
                    <span>{content.timeLabel}</span>
                    <strong>{content.timeValue}</strong>
                  </div>

                  <div>
                    <img src={languageIcon} alt="" />
                    <span>{content.languageLabel}</span>
                    <strong>{content.languageValue}</strong>
                  </div>
                </div>
              </div>

              <div className="live-course-hero-media">
                <img src={liveFeatureImage} alt={content.heroTitle.replace("\n", " ")} />

                <div className="live-course-countdown">
                  <span>{content.countdownTitle}</span>

                  <div>
                    <strong>{content.countdown.hours}</strong>
                    <i>:</i>
                    <strong>{content.countdown.minutes}</strong>
                    <i>:</i>
                    <strong>{content.countdown.seconds}</strong>
                  </div>

                  <ul>
                    <li>Hours</li>
                    <li>Minutes</li>
                    <li>Seconds</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="live-course-register-strip">
              <div className="live-course-seat-box">
                <span className="live-course-seat-box__icon">
                  <img src={trainingIcon} alt="" />
                </span>

                <div>
                  <strong>{content.seatsTitle}</strong>
                  <p>{content.seatsValue}</p>
                  <span className="live-course-progress">
                    <i></i>
                  </span>
                </div>
              </div>

              <div className="live-course-register-actions">
                <div className="live-course-price-box">
                  <strong>
                    <bdi>{content.price}</bdi>
                  </strong>

                  <span>
                    <img src={secureIcon} alt="" />
                    {content.secureText}
                  </span>
                </div>

                <Link className="live-course-register-btn" to="/checkout">
                  {content.registerText}
                  <span>{isArabic ? "←" : "→"}</span>
                </Link>
              </div>
            </section>

            <section className="live-course-tabs-card">
              <div className="live-course-tabs" role="tablist">
                {content.tabs.map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    className={`live-course-tab ${activeTab === index ? "active" : ""}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 0 && (
                <div className="live-course-tab-panel live-course-overview-panel">
                  <div className="live-course-overview-text">
                    <h2>{content.overviewTitle}</h2>
                    <p>{content.overviewText}</p>

                    <h3>{content.learnTitle}</h3>
                    <ul>
                      {content.learningPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <aside className="live-course-overview-info">
                    {content.info.map((item) => (
                      <div key={item.label}>
                        <span>{item.label}</span>
                        <strong className={item.danger ? "is-danger" : ""}>{item.value}</strong>
                      </div>
                    ))}
                  </aside>
                </div>
              )}

              {activeTab === 1 && (
                <div className="live-course-tab-panel">
                  <h2 className="live-course-section-title">{content.instructorSectionTitle}</h2>

                  <article className="live-course-instructor-large">
                    <div className="live-course-instructor-large__image">
                      <img src={instructorFeatured} alt={content.instructorName} />
                    </div>

                    <div className="live-course-instructor-large__content">
                      <img src={bawsalaLogo} alt="Bawsala" />
                      <h3>{content.instructorName}</h3>
                      <strong>{content.instructorRole}</strong>
                      <p>{content.instructorBio}</p>
                    </div>
                  </article>

                  <div className="live-course-audience">
                    <h2>{content.audienceTitle}</h2>

                    <div>
                      {content.audienceTags.map((tag, index) => (
                        <span key={tag} className={`tag-${(index % 4) + 1}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="live-course-tab-panel">
                  <h2 className="live-course-section-title">{content.programTitle}</h2>

                  <div className="live-course-program-list">
                    {content.modules.map((item, index) => (
                      <ProgramModule
                        key={`${item.module}-${index}`}
                        item={item}
                        index={index}
                        isOpen={openModule === index}
                        onToggle={() => setOpenModule(openModule === index ? null : index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div className="live-course-tab-panel">
                  <h2 className="live-course-section-title">{content.faqTitle}</h2>

                  <div className="live-course-faq-grid">
                    {content.faqs.map((item, index) => (
                      <FaqItem
                        key={item.question}
                        item={item}
                        index={index}
                        isOpen={openFaq === index}
                        onToggle={() => setOpenFaq(openFaq === index ? null : index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="live-course-sidebar">
            <section className="live-course-sidebar-card live-course-session-card">
              <div className="live-course-sidebar-head">
                <h2>{content.sidebarTitle}</h2>
                <span>
                  <i></i>
                  {content.liveLabel}
                </span>
              </div>

              <SidebarInfoRow icon={strategyIcon} label={content.trainingLabel} value={content.sessionTraining} />
              <SidebarInfoRow icon={blueCalendarIcon} label={content.sessionDateLabel} value={content.sessionDateValue} />
              <SidebarInfoRow icon={whiteClockIcon} label={content.sessionTimeLabel} value={content.sessionTimeValue} iconClassName="is-clock" />
              <SidebarInfoRow icon={zoomIcon} label={content.sessionFormatLabel} value={content.sessionFormatValue} />
              <SidebarInfoRow icon={whiteClockIcon} label={content.sessionDurationLabel} value={content.sessionDurationValue} iconClassName="is-clock" />
              <SidebarInfoRow icon={trainingIcon} label={content.sessionSeatsLabel} value={content.sessionSeatsValue} />

              <div className="live-course-recording-note">
                <span>
                  <img src={zoomIcon} alt="" />
                </span>
                <div>
                  <strong>{content.recordingTitle}</strong>
                  <p>{content.recordingText}</p>
                </div>
              </div>
            </section>

            <section className="live-course-sidebar-card live-course-mini-instructor">
              <h2>{content.instructorCardTitle}</h2>

              <div className="live-course-mini-instructor__head">
                <img src={instructorAvatar} alt={content.instructorName} />

                <div>
                  <h3>{content.instructorName}</h3>
                  <span>{content.instructorSidebarRole}</span>
                </div>
              </div>

              <p>{content.instructorSidebarBio}</p>
            </section>

            <section className="live-course-sidebar-card live-course-help-card">
              <h2>{content.helpTitle}</h2>
              <p>{content.helpText}</p>

              <Link to="/contact">
                <img src={supportIcon} alt="" />
                {content.supportText}
              </Link>
            </section>
          </aside>
        </div>
      </section>

      {relatedCourses.length > 0 && (
        <section className="related-programs-section">
          <div className="related-programs-container">
            <div className="related-programs-header">
              <div>
                <h2>
                  {isArabic
                    ? "اكتشف برامج تدريبية أخرى لتنظيم تعلمك على المدى الطويل"
                    : "Discover other training programs to structure your long-term learning"}
                </h2>

                <p>
                  {isArabic
                    ? "استكشف مجموعة مختارة من البرامج التدريبية المصممة لمساعدتك على بناء مهارات جديدة خطوة بخطوة."
                    : "Explore a curated selection of training programs designed to help you build new skills, deepen your expertise, and grow step by step."}
                </p>
              </div>

              <Link to="/courses" className="related-programs-see-more">
                {isArabic ? "عرض المزيد" : "See more"} <span>{isArabic ? "←" : "→"}</span>
              </Link>
            </div>

            <div className="related-programs-grid">
              {relatedCourses.map((relatedCourse) => (
                <RelatedCourseCard
                  key={relatedCourse.id}
                  course={relatedCourse}
                  language={language}
                  isArabic={isArabic}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="course-contact-cta">
        <div className="course-contact-cta__container">
          <div className="course-contact-cta__card">
            <div className="course-contact-cta__avatars" aria-hidden="true">
              <img className="course-contact-cta__avatar course-contact-cta__avatar--1" src={profile1} alt="" />
              <img className="course-contact-cta__avatar course-contact-cta__avatar--2" src={profile2} alt="" />
              <img className="course-contact-cta__avatar course-contact-cta__avatar--3" src={profile3} alt="" />
            </div>

            <h3 className="course-contact-cta__title">
              {isArabic ? "ما زالت لديك أسئلة؟" : "Still have questions?"}
            </h3>

            <p className="course-contact-cta__subtitle">
              {isArabic
                ? "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا."
                : "Can’t find the answer you’re looking for? Please chat to our friendly team."}
            </p>

            <Link className="course-contact-cta__btn" to="/contact">
              {isArabic ? "تواصل معنا" : "Get in touch"}
            </Link>
          </div>
        </div>
      </section>


    </main>
  );
};

export default LiveCourseDetails;
