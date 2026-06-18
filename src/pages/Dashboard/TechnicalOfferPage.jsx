import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase";
import "./TechnicalOfferPage.css";

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");
  return savedLanguage === "ar" ? "ar" : "en";
};

const TRANSLATIONS = {
  ar: {
    loading: "جاري تحميل العرض الفني...",
    notFound: "العرض الفني غير موجود.",
    unauthorized: "لا يمكنك عرض هذا العرض الفني.",
    backToDashboard: "العودة إلى لوحة التحكم",
    print: "طباعة / حفظ PDF",
    languageSwitcher: "تغيير لغة العرض",
    arabic: "العربية",
    english: "English",
    technicalOffer: "العرض الفني",
    preparedFor: "مقدم إلى",
    preparedBy: "مقدم من",
    bawsala: "بوصلة",
    offerDate: "تاريخ العرض",
    validUntil: "صالح إلى غاية",
    executiveSummary: "الملخص التنفيذي",
    currentSituation: "الوضع الحالي",
    goalAfterDevelopment: "الهدف بعد التطوير",
    projectScope: "نطاق العمل",
    proposedServices: "الخدمات المقترحة",
    deliverables: "المخرجات النهائية",
    implementationPlan: "خطة التنفيذ",
    technicalStack: "المقترح التقني",
    commercialSummary: "الملخص التجاري",
    estimatedTimeline: "المدة الزمنية التقديرية",
    websitePackagePrice: "سعر باقة الموقع",
    platformPackagePrice: "سعر إضافة لوحة الإدارة / المنصة",
    monthlyMaintenance: "الصيانة الشهرية",
    notIncluded: "التكاليف غير المشمولة",
    nextSteps: "الخطوات التالية",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    serviceCategory: "قسم الخدمة",
    confidential: "وثيقة سرية",
    contact: "serine@bawsala-dz.com - bouaicha@bawsala-dz.com",
    footer: "بوصلة طريق الريادة",
    notProvided: "غير متوفر",
  },
  en: {
    loading: "Loading technical offer...",
    notFound: "Technical offer not found.",
    unauthorized: "You cannot view this technical offer.",
    backToDashboard: "Back to dashboard",
    print: "Print / Save PDF",
    languageSwitcher: "Change offer language",
    arabic: "العربية",
    english: "English",
    technicalOffer: "Technical Offer",
    preparedFor: "Prepared for",
    preparedBy: "Prepared by",
    bawsala: "Bawsala",
    offerDate: "Offer date",
    validUntil: "Valid until",
    executiveSummary: "Executive Summary",
    currentSituation: "Current Situation",
    goalAfterDevelopment: "Goal After Development",
    projectScope: "Project Scope",
    proposedServices: "Proposed Services",
    deliverables: "Deliverables",
    implementationPlan: "Implementation Plan",
    technicalStack: "Technical Stack",
    commercialSummary: "Commercial Summary",
    estimatedTimeline: "Estimated Timeline",
    websitePackagePrice: "Website Package Price",
    platformPackagePrice: "Platform / Admin Panel Price",
    monthlyMaintenance: "Monthly Maintenance",
    notIncluded: "Not Included",
    nextSteps: "Next Steps",
    email: "Email",
    phone: "Phone",
    serviceCategory: "Service category",
    confidential: "Confidential Document",
    contact: "serine@bawsala-dz.com - bouaicha@bawsala-dz.com",
    footer: "Bawsala, your path to leadership",
    notProvided: "Not provided",
  },
};

const FIELD_KEYS = [
  "clientName",
  "clientDescription",
  "offerTitle",
  "offerSubtitle",
  "offerDate",
  "validUntil",
  "executiveSummary",
  "currentSituation",
  "goalAfterDevelopment",
  "projectScope",
  "proposedServices",
  "deliverables",
  "implementationPlan",
  "technicalStack",
  "estimatedTimeline",
  "websitePackagePrice",
  "platformPackagePrice",
  "monthlyMaintenance",
  "notIncluded",
  "nextSteps",
];

const safeObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
};

const hasFilledValue = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const hasLanguageContent = (offer, language) => {
  if (!offer) return false;

  const translations = safeObject(offer.translations);
  const localizedContent = safeObject(offer.localizedContent);
  const translation = safeObject(translations[language]);
  const localized = safeObject(localizedContent[language]);

  return FIELD_KEYS.some(
    (key) => hasFilledValue(translation[key]) || hasFilledValue(localized[key])
  );
};

const getOfferContent = (offer, language) => {
  if (!offer) return {};

  const fallbackLanguage = language === "ar" ? "en" : "ar";
  const translations = safeObject(offer.translations);
  const localizedContent = safeObject(offer.localizedContent);

  const requestedContent = {
    ...safeObject(localizedContent[language]),
    ...safeObject(translations[language]),
  };

  const fallbackContent = {
    ...safeObject(localizedContent[fallbackLanguage]),
    ...safeObject(translations[fallbackLanguage]),
  };

  const selectedContent = FIELD_KEYS.some((key) => hasFilledValue(requestedContent[key]))
    ? requestedContent
    : fallbackContent;

  return {
    ...offer,
    ...selectedContent,
  };
};

const formatDate = (value, language = "en") => {
  if (!value) return "-";

  const normalizedValue =
    typeof value === "string" && value.includes("/")
      ? value
      : `${value}T00:00:00`;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(language === "ar" ? "ar-DZ" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const splitLines = (value) => {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const getValue = (value, fallback = "-") => {
  return typeof value === "string" && value.trim() ? value : fallback;
};

const isAllowedToView = (offer, user) => {
  if (!offer || !user) return false;

  const userEmail = String(user.email || "").toLowerCase();
  const offerUserEmail = String(offer.userEmail || "").toLowerCase();
  const clientEmail = String(offer.clientEmail || "").toLowerCase();

  return (
    offer.userId === user.uid ||
    offerUserEmail === userEmail ||
    clientEmail === userEmail
  );
};

const TechnicalOfferPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [currentUser, setCurrentUser] = useState(null);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const isArabic = language === "ar";
  const t = TRANSLATIONS[language];

  const offerContent = useMemo(() => {
    return getOfferContent(offer, language);
  }, [offer, language]);

  const availableLanguages = useMemo(() => {
    return {
      ar: hasLanguageContent(offer, "ar"),
      en: hasLanguageContent(offer, "en"),
    };
  }, [offer]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setLoading(false);
        setUnauthorized(true);
        return;
      }

      if (!offerId) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);
        setUnauthorized(false);

        const offerSnapshot = await getDoc(doc(db, "technicalOffers", offerId));

        if (!offerSnapshot.exists()) {
          setNotFound(true);
          setOffer(null);
          return;
        }

        const offerData = {
          id: offerSnapshot.id,
          ...offerSnapshot.data(),
        };

        const isPublished = !offerData.status || offerData.status === "published";

        if (!isPublished || !isAllowedToView(offerData, user)) {
          setUnauthorized(true);
          setOffer(null);
          return;
        }

        setOffer(offerData);
      } catch (error) {
        console.error("Error loading technical offer:", error);
        setNotFound(true);
        setOffer(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [offerId]);

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem("site_language", nextLanguage);
  };

  const commercialRows = useMemo(() => {
    if (!offer) return [];

    return [
      {
        label: t.estimatedTimeline,
        value: offerContent.estimatedTimeline,
      },
      {
        label: t.websitePackagePrice,
        value: offerContent.websitePackagePrice,
      },
      {
        label: t.platformPackagePrice,
        value: offerContent.platformPackagePrice,
      },
      {
        label: t.monthlyMaintenance,
        value: offerContent.monthlyMaintenance,
      },
    ];
  }, [offer, offerContent, t]);

  if (loading) {
    return (
      <main className="technical-offer-page" dir={isArabic ? "rtl" : "ltr"}>
        <div className="technical-offer-state">{t.loading}</div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="technical-offer-page" dir={isArabic ? "rtl" : "ltr"}>
        <div className="technical-offer-state">
          <h1>{t.notFound}</h1>
          <Link to="/dashboard">{t.backToDashboard}</Link>
        </div>
      </main>
    );
  }

  if (unauthorized || !currentUser || !offer) {
    return (
      <main className="technical-offer-page" dir={isArabic ? "rtl" : "ltr"}>
        <div className="technical-offer-state">
          <h1>{t.unauthorized}</h1>
          <button type="button" onClick={() => navigate("/dashboard")}>
            {t.backToDashboard}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="technical-offer-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="technical-offer-actions no-print">
        <Link to="/dashboard" className="technical-offer-back-btn">
          {t.backToDashboard}
        </Link>

        <div className="technical-offer-action-group">
          <div
            className="technical-offer-language-switch"
            role="group"
            aria-label={t.languageSwitcher}
          >
            <button
              type="button"
              className={language === "ar" ? "is-active" : ""}
              onClick={() => handleLanguageChange("ar")}
              title={availableLanguages.ar ? t.arabic : t.arabic}
            >
              {t.arabic}
            </button>

            <button
              type="button"
              className={language === "en" ? "is-active" : ""}
              onClick={() => handleLanguageChange("en")}
              title={availableLanguages.en ? t.english : t.english}
            >
              {t.english}
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="technical-offer-print-btn"
          >
            {t.print}
          </button>
        </div>
      </div>

      <article className="technical-offer-document">
        <header className="technical-offer-cover">
          <div className="technical-offer-cover-top">
            <div className="technical-offer-brand">
              <span>{t.bawsala}</span>
            </div>

            <span className="technical-offer-kicker">{t.technicalOffer}</span>
          </div>

          <div className="technical-offer-heading">
            <h1>{getValue(offerContent.offerTitle, t.technicalOffer)}</h1>
            <p>{getValue(offerContent.offerSubtitle, "")}</p>
          </div>

          <dl className="technical-offer-cover-details">
            <div>
              <dt>{t.preparedFor}</dt>
              <dd>
                <strong>{getValue(offerContent.clientName, t.notProvided)}</strong>
                <span>{getValue(offerContent.clientDescription, t.notProvided)}</span>
              </dd>
            </div>

            <div>
              <dt>{t.preparedBy}</dt>
              <dd>
                <strong>{t.bawsala}</strong>
                <span>{t.confidential}</span>
              </dd>
            </div>

            <div>
              <dt>{t.offerDate}</dt>
              <dd>
                <strong>{formatDate(offerContent.offerDate, language)}</strong>
              </dd>
            </div>

            <div>
              <dt>{t.validUntil}</dt>
              <dd>
                <strong>{formatDate(offerContent.validUntil, language)}</strong>
              </dd>
            </div>
          </dl>
        </header>

        <section className="technical-offer-contact-row">
          <dl>
            <div>
              <dt>{t.email}</dt>
              <dd>{getValue(offer.clientEmail || offer.userEmail, t.notProvided)}</dd>
            </div>

            <div>
              <dt>{t.phone}</dt>
              <dd>{getValue(offer.clientPhone, t.notProvided)}</dd>
            </div>

            <div>
              <dt>{t.serviceCategory}</dt>
              <dd>{getValue(offer.serviceCategory, t.notProvided)}</dd>
            </div>
          </dl>
        </section>

        <OfferSection title={t.executiveSummary}>
          <p>{getValue(offerContent.executiveSummary, t.notProvided)}</p>
        </OfferSection>

        <section className="technical-offer-split-section">
          <div>
            <h2>{t.currentSituation}</h2>
            <p>{getValue(offerContent.currentSituation, t.notProvided)}</p>
          </div>

          <div>
            <h2>{t.goalAfterDevelopment}</h2>
            <p>{getValue(offerContent.goalAfterDevelopment, t.notProvided)}</p>
          </div>
        </section>

        <OfferSection title={t.projectScope}>
          <p>{getValue(offerContent.projectScope, t.notProvided)}</p>
        </OfferSection>

        <OfferSection title={t.proposedServices}>
          <OfferList lines={splitLines(offerContent.proposedServices)} emptyText={t.notProvided} />
        </OfferSection>

        <OfferSection title={t.deliverables}>
          <OfferList lines={splitLines(offerContent.deliverables)} emptyText={t.notProvided} />
        </OfferSection>

        <OfferSection title={t.implementationPlan}>
          <OfferList lines={splitLines(offerContent.implementationPlan)} emptyText={t.notProvided} />
        </OfferSection>

        <OfferSection title={t.technicalStack}>
          <OfferList lines={splitLines(offerContent.technicalStack)} emptyText={t.notProvided} />
        </OfferSection>

        <section className="technical-offer-commercial-section">
          <h2>{t.commercialSummary}</h2>

          <dl className="technical-offer-commercial-list">
            {commercialRows.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{getValue(item.value, t.notProvided)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <OfferSection title={t.notIncluded}>
          <p>{getValue(offerContent.notIncluded, t.notProvided)}</p>
        </OfferSection>

        <OfferSection title={t.nextSteps}>
          <OfferList lines={splitLines(offerContent.nextSteps)} emptyText={t.notProvided} />
        </OfferSection>

        <footer className="technical-offer-footer">
          <strong>{t.footer}</strong>
          <span>{t.contact}</span>
        </footer>
      </article>
    </main>
  );
};

const OfferSection = ({ title, children }) => {
  return (
    <section className="technical-offer-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
};

const OfferList = ({ lines, emptyText = "-" }) => {
  if (!lines.length) return <p>{emptyText}</p>;

  return (
    <ul className="technical-offer-list">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
};

export default TechnicalOfferPage;
