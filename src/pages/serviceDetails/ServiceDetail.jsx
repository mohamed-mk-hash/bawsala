import React, { useMemo, useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from "firebase/firestore";

import "./ServiceDetail.css";

import { db } from "../../firebase";

import homeIcon from "../../assets/Home_icon.png";

import managementHeroBg from "../../assets/Management Development_background.png";

import operationalIcon from "../../assets/operational_system.png";
import templatesIcon from "../../assets/use_templates.png";
import fasterInternalIcon from "../../assets/faster_internal.png";
import packagePointIcon from "../../assets/our_package_point.png";

import guideImage from "../../assets/HR_Management_Toolkit.png";

import businessPlanTemplate from "../../assets/Business_Plan_Template.png";
import financialReportTemplate from "../../assets/Simplified_Financ_al_Report_Template.png";
import humanResourcesTemplate from "../../assets/Human_Resources_Plan.png";

import requestFeaturedImage from "../../assets/service_request_featured_image.png";

import reviewVideo from "../../assets/review_video.png";
import reviewFeaturedImage from "../../assets/review_featured_image.jpg";
import reviewStar from "../../assets/review_star.png";
import reviewBawsalaLogo from "../../assets/review_bawsala-logo.png";
import leaveReviewIcon from "../../assets/leave_a_review.png";
import arrowLeft from "../../assets/arrow-left.png";
import arrowRight from "../../assets/arrow-right.png";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

const FALLBACK_BENEFIT_ICONS = [
  operationalIcon,
  templatesIcon,
  packagePointIcon,
  fasterInternalIcon,
];

const FALLBACK_GUIDE_IMAGES = [guideImage, guideImage, guideImage];

const FALLBACK_TEMPLATE_IMAGES = [
  businessPlanTemplate,
  financialReportTemplate,
  humanResourcesTemplate,
];

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
};

const getLocalizedObject = (item, language) => {
  if (!item) return {};

  return item?.[language] || item?.en || item?.ar || {};
};

const getLocalizedText = (value, language) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value?.[language] || value?.en || value?.ar || "";
};

const getServiceSlug = (service) => {
  return service?.slug || service?.en?.slug || service?.ar?.slug || service?.id;
};

const isPublished = (service) => {
  if (!service?.status) return true;

  return service.status === "published";
};

const getServiceTitle = (service, language) => {
  const localizedService = getLocalizedObject(service, language);

  return (
    localizedService.heroTitle ||
    localizedService.breadcrumbTitle ||
    localizedService.seoTitle ||
    ""
  );
};

const getServiceDescription = (service, language) => {
  const localizedService = getLocalizedObject(service, language);

  return localizedService.heroDescription || localizedService.seoDescription || "";
};

const normalizeList = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
};

const getItemImage = (item, localizedItem) => {
  return (
    localizedItem?.imageUrl ||
    localizedItem?.iconUrl ||
    item?.imageUrl ||
    item?.iconUrl ||
    ""
  );
};

const getFeatures = (features) => {
  if (Array.isArray(features)) {
    return features.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof features === "string") {
    return features
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getReviewData = (review, language) => {
  const localizedReview = getLocalizedObject(review, language);
  const englishReview = review?.en || {};
  const arabicReview = review?.ar || {};

  return {
    name: localizedReview.name || englishReview.name || arabicReview.name || "",
    subtitle:
      localizedReview.subtitle ||
      localizedReview.role ||
      englishReview.subtitle ||
      englishReview.role ||
      arabicReview.subtitle ||
      arabicReview.role ||
      "",
    text: localizedReview.text || englishReview.text || arabicReview.text || "",
    image:
      localizedReview.avatarUrl ||
      localizedReview.imageUrl ||
      englishReview.avatarUrl ||
      englishReview.imageUrl ||
      arabicReview.avatarUrl ||
      arabicReview.imageUrl ||
      review?.avatarUrl ||
      review?.imageUrl ||
      reviewFeaturedImage,
    rating:
      localizedReview.rating ||
      englishReview.rating ||
      arabicReview.rating ||
      review?.rating ||
      5,
  };
};

const getFallbackText = (language) => {
  const isArabic = language === "ar";

  return {
    services: isArabic ? "الخدمات" : "Services",
    loading: isArabic ? "جاري تحميل الخدمة..." : "Loading service...",
    notFound: isArabic ? "الخدمة غير موجودة" : "Service not found",
    backToServices: isArabic ? "العودة إلى الخدمات" : "Back to services",

    overviewLabel: isArabic ? "نظرة عامة على الخدمة" : "Service overview",
    overviewTitle: isArabic ? "حل عملي مصمم حسب احتياجك" : "A practical solution built around your needs",

    benefitsTitle: isArabic ? "ما الذي ستحصل عليه" : "What you will get",
    deliverablesTitle: isArabic ? "مخرجات الخدمة" : "Service deliverables",
    processTitle: isArabic ? "كيف نعمل" : "How we work",
    pricingTitle: isArabic ? "الباقات والأسعار" : "Packages and pricing",
    resourcesTitle: isArabic ? "أدلة وموارد قابلة للتحميل" : "Downloadable guides and resources",
    resourcesDescription: isArabic
      ? "احصل على أدلة احترافية وموارد جاهزة لدعم رحلة تطوير أعمالك."
      : "Access professional guides and ready-to-use resources to support your business development journey.",
    templatesTitle: isArabic ? "كتالوج القوالب" : "Templates Catalog",
    templatesDescription: isArabic
      ? "استكشف قوالب احترافية تساعد الشركات على تنظيم العمليات وتحسين الإدارة."
      : "Explore professionally designed templates that help businesses organize operations and improve management processes.",
    faqsTitle: isArabic ? "الأسئلة الشائعة" : "Frequently asked questions",

    requestLabel: isArabic ? "طلب خدمة" : "Service request",
    requestTitle: isArabic ? "اطلب هذه الخدمة" : "Request this service",
    requestDescription: isArabic
      ? "أخبرنا باحتياجاتك وسيتواصل معك فريقنا لاقتراح الخطة الأنسب."
      : "Tell us about your needs and our team will contact you to suggest the most suitable plan.",
    firstName: isArabic ? "الاسم الأول" : "First name",
    lastName: isArabic ? "اللقب" : "Last name",
    email: isArabic ? "البريد الإلكتروني" : "Email",
    phone: isArabic ? "رقم الهاتف" : "Phone number",
    company: isArabic ? "اسم المؤسسة / الشركة" : "Company / organization",
    servicePackage: isArabic ? "الباقة المطلوبة" : "Preferred package",
    budget: isArabic ? "الميزانية المتوقعة" : "Expected budget",
    timeline: isArabic ? "موعد البداية أو التسليم" : "Start or delivery timeline",
    platforms: isArabic ? "المنصات أو القنوات" : "Platforms or channels",
    goals: isArabic ? "الأهداف الرئيسية" : "Main goals",
    message: isArabic ? "تفاصيل إضافية" : "Additional details",
    firstNamePlaceholder: isArabic ? "الاسم الأول" : "First name",
    lastNamePlaceholder: isArabic ? "اللقب" : "Last name",
    emailPlaceholder: "you@company.com",
    phonePlaceholder: isArabic ? "+213 ..." : "+213 ...",
    companyPlaceholder: isArabic ? "مثال: بوصلة" : "Example: Bawsala",
    packagePlaceholder: isArabic ? "اختر باقة أو اكتب طلب مخصص" : "Choose a package or custom request",
    budgetPlaceholder: isArabic ? "مثال: 100,000 دج" : "Example: 100,000 DZD",
    timelinePlaceholder: isArabic ? "مثال: خلال أسبوعين" : "Example: within two weeks",
    platformsPlaceholder: isArabic ? "Instagram, Facebook, LinkedIn..." : "Instagram, Facebook, LinkedIn...",
    goalsPlaceholder: isArabic ? "زيادة الوعي، جذب عملاء، تحسين الهوية..." : "Awareness, leads, branding...",
    messagePlaceholder: isArabic ? "اكتب أي تفاصيل مهمة عن الخدمة المطلوبة..." : "Share any important details about the service you need...",
    privacy: isArabic ? "أنت توافق على" : "You agree to our friendly",
    privacyLink: isArabic ? "سياسة الخصوصية" : "privacy policy",
    sendRequest: isArabic ? "إرسال الطلب" : "Send Request",
    requestSuccess: isArabic ? "تم تسجيل طلبك بنجاح. سنتواصل معك قريباً." : "Your request was submitted successfully. We will contact you soon.",
    requestError: isArabic ? "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى." : "Something went wrong while sending the request. Please try again.",

    testimonialsLabel: isArabic ? "آراء العملاء" : "TESTIMONIALS",
    testimonialsTitle: isArabic
      ? "قصص نجاح تمنحك الثقة فيما نقدمه"
      : "Success stories that inspire confidence in what we do",
    testimonialsDescription: isArabic
      ? "آراء حقيقية من شركات ومؤسسات عملنا معها."
      : "Real feedback from businesses and organizations we’ve worked with.",
    leaveReview: isArabic ? "اترك تقييماً" : "Leave a Review",
    videoTestimonial: isArabic ? "شهادة فيديو" : "Video testimonial",

    stillQuestions: isArabic ? "ما زالت لديك أسئلة؟" : "Still have questions?",
    stillQuestionsDescription: isArabic
      ? "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا."
      : "Can’t find the answer you’re looking for? Please chat to our friendly team.",
    getInTouch: isArabic ? "تواصل معنا" : "Get in touch",
  };
};

const ServiceDetail = () => {
  const { slug } = useParams();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState({ type: "", text: "" });

  const [requestForm, setRequestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    servicePackage: "",
    budget: "",
    timeline: "",
    platforms: "",
    goals: "",
    message: "",
    privacy: false,
  });

  const testimonialScrollerRef = useRef(null);
  const serviceRequestRef = useRef(null);
  const TESTIMONIAL_LOOP = 3;

  const isArabic = language === "ar";
  const text = getFallbackText(language);

  const localizedService = useMemo(() => {
    return getLocalizedObject(service, language);
  }, [service, language]);

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
    const fetchService = async () => {
      try {
        setLoading(true);

        let foundService = null;
        let allServices = [];

        try {
          const rootSlugQuery = query(
            collection(db, "services"),
            where("slug", "==", slug),
            limit(1)
          );

          const rootSlugSnapshot = await getDocs(rootSlugQuery);

          if (!rootSlugSnapshot.empty) {
            const docItem = rootSlugSnapshot.docs[0];

            foundService = {
              id: docItem.id,
              ...docItem.data(),
            };
          }
        } catch (error) {
          console.warn("Root service slug query failed, using fallback:", error);
        }

        const servicesSnapshot = await getDocs(collection(db, "services"));

        allServices = servicesSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        if (!foundService) {
          foundService =
            allServices.find((item) => {
              return (
                item.id === slug ||
                item.slug === slug ||
                item.en?.slug === slug ||
                item.ar?.slug === slug
              );
            }) || null;
        }

        if (foundService && !isPublished(foundService)) {
          foundService = null;
        }

        setService(foundService);
      } catch (error) {
        console.error("Error loading service:", error);
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  const scrollToRequestForm = (event) => {
    if (event) event.preventDefault();

    serviceRequestRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      const firstInput = serviceRequestRef.current?.querySelector("input, select, textarea");
      firstInput?.focus?.({ preventScroll: true });
    }, 520);
  };

  const handleRequestChange = (event) => {
    const { name, value, type, checked } = event.target;

    setRequestForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    setRequestMessage({ type: "", text: "" });

    if (!requestForm.privacy) {
      setRequestMessage({
        type: "error",
        text: isArabic
          ? "يرجى الموافقة على سياسة الخصوصية قبل الإرسال."
          : "Please agree to the privacy policy before sending.",
      });
      return;
    }

    try {
      setSubmittingRequest(true);

      await addDoc(collection(db, "serviceRequests"), {
        serviceId: service?.id || null,
        serviceSlug: getServiceSlug(service) || slug || "",
        serviceTitle: getServiceTitle(service, language),
        language,
        ...requestForm,
        createdAt: serverTimestamp(),
      });

      setRequestForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        servicePackage: "",
        budget: "",
        timeline: "",
        platforms: "",
        goals: "",
        message: "",
        privacy: false,
      });

      setRequestMessage({ type: "success", text: text.requestSuccess });
    } catch (error) {
      console.error("Service request submit failed:", error);
      setRequestMessage({ type: "error", text: text.requestError });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const benefits = useMemo(() => {
    return normalizeList(service?.benefits).map((benefit, index) => {
      const localizedBenefit = getLocalizedObject(benefit, language);

      return {
        id: benefit.id || index,
        icon:
          benefit.iconUrl ||
          benefit.imageUrl ||
          FALLBACK_BENEFIT_ICONS[index % FALLBACK_BENEFIT_ICONS.length],
        title: localizedBenefit.title || "",
        description: localizedBenefit.description || "",
      };
    });
  }, [service, language]);

  const resources = useMemo(() => {
    const source = normalizeList(service?.resources).length
      ? normalizeList(service?.resources)
      : normalizeList(service?.guides);

    return source.map((resource, index) => {
      const localizedResource = getLocalizedObject(resource, language);

      return {
        id: resource.id || index,
        image: getItemImage(resource, localizedResource),
        type: localizedResource.type || "",
        date:
          localizedResource.date ||
          localizedResource.dateText ||
          localizedResource.publishedText ||
          "",
        title: localizedResource.title || "",
        description: localizedResource.description || "",
        fileType: localizedResource.fileType || "",
        buttonText: localizedResource.buttonText || "",
        url: localizedResource.url || localizedResource.fileUrl || resource.url || resource.fileUrl || "",
      };
    });
  }, [service, language]);

  const deliverables = useMemo(() => {
    const source = normalizeList(service?.deliverables).length
      ? normalizeList(service?.deliverables)
      : normalizeList(service?.templates);

    return source.map((item, index) => {
      const localizedItem = getLocalizedObject(item, language);

      return {
        id: item.id || index,
        image: getItemImage(item, localizedItem),
        title: localizedItem.title || "",
        description: localizedItem.description || "",
        type: localizedItem.type || localizedItem.fileType || "",
      };
    });
  }, [service, language]);

  const processSteps = useMemo(() => {
    return normalizeList(service?.processSteps).map((step, index) => {
      const localizedStep = getLocalizedObject(step, language);

      return {
        id: step.id || index,
        label: localizedStep.label || `${isArabic ? "الخطوة" : "Step"} ${index + 1}`,
        title: localizedStep.title || "",
        description: localizedStep.description || "",
      };
    });
  }, [service, language, isArabic]);

  const pricingPlans = useMemo(() => {
    return normalizeList(service?.pricingPlans).map((plan, index) => {
      const localizedPlan = getLocalizedObject(plan, language);

      return {
        id: plan.id || index,
        title: localizedPlan.title || "",
        price: localizedPlan.price || "",
        description: localizedPlan.description || "",
        features: getFeatures(localizedPlan.features),
      };
    });
  }, [service, language]);

  const faqs = useMemo(() => {
    return normalizeList(service?.faqs).map((faq, index) => {
      const localizedFaq = getLocalizedObject(faq, language);

      return {
        id: faq.id || index,
        question: localizedFaq.question || "",
        answer: localizedFaq.answer || "",
      };
    });
  }, [service, language]);

  const reviews = useMemo(() => {
    const source = Array.isArray(service?.reviews) ? service.reviews : [];

    return source.map((review, index) => ({
      id: review.id || index,
      ...getReviewData(review, language),
    }));
  }, [service, language]);

  const loopedReviewCards = useMemo(() => {
    const cards = [];

    if (reviews.length === 0) return cards;

    for (let i = 0; i < TESTIMONIAL_LOOP; i++) {
      cards.push(...reviews);
    }

    return cards;
  }, [reviews]);

  const scrollTestimonials = (direction) => {
    const element = testimonialScrollerRef.current;

    if (!element) return;

    const step = isArabic ? -270 : 270;

    element.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const element = testimonialScrollerRef.current;

    if (!element || loopedReviewCards.length === 0) return;

    requestAnimationFrame(() => {
      const copyWidth = element.scrollWidth / TESTIMONIAL_LOOP;
      element.scrollLeft = copyWidth;
    });

    const handleScroll = () => {
      const copyWidth = element.scrollWidth / TESTIMONIAL_LOOP;

      if (element.scrollLeft < copyWidth * 0.25) {
        element.scrollLeft += copyWidth;
      }

      if (element.scrollLeft > copyWidth * 1.75) {
        element.scrollLeft -= copyWidth;
      }
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [loopedReviewCards.length]);

  if (loading) {
    return (
      <main className="service-detail-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="service-detail-hero-section">
          <div className="service-detail-container">
            <div className="service-detail-loading">{text.loading}</div>
          </div>
        </section>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="service-detail-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="service-detail-hero-section">
          <div className="service-detail-container">
            <div className="service-detail-loading">
              <h1>{text.notFound}</h1>

              <Link to="/services">{text.backToServices}</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const serviceTitle = getServiceTitle(service, language);
  const serviceDescription = getServiceDescription(service, language);

  const heroButtonText =
    localizedService.heroButtonText ||
    localizedService.requestButtonText ||
    (isArabic ? "اطلب هذه الخدمة" : "Request this service");

  const heroBackground =
    service.heroBackgroundUrl ||
    localizedService.heroBackgroundUrl ||
    service.imageUrl ||
    managementHeroBg;

  const overviewImage =
    service.overviewImageUrl ||
    localizedService.overviewImageUrl ||
    service.imageUrl ||
    "";

  const requestImage =
    service.requestImageUrl ||
    localizedService.requestImageUrl ||
    "";

  const videoReviewImage =
    service.videoReviewImageUrl ||
    localizedService.videoReviewImageUrl ||
    reviewVideo;

  const hasOverview = Boolean(
    localizedService.overviewTitle ||
      localizedService.overviewDescription ||
      localizedService.overviewLabel ||
      overviewImage
  );

  const showPricing = service.showPricing !== false && pricingPlans.length > 0;
  const showResources = service.showResources !== false && resources.length > 0;
  const showFaqs = service.showFaqs !== false && faqs.length > 0;

  const requestPackageOptions = pricingPlans
    .map((plan) => plan.title)
    .filter(Boolean);
  const showPackageSelect = requestPackageOptions.length > 0;

  return (
    <main className="service-detail-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="service-detail-breadcrumb-section">
        <div className="service-detail-container">
          <nav className="service-detail-breadcrumb" aria-label="Breadcrumb">
            <Link
              to="/"
              className="service-detail-breadcrumb-home"
              aria-label="Home"
            >
              <img src={homeIcon} alt="" />
            </Link>

            <span className="service-detail-breadcrumb-chevron"></span>

            <Link to="/services" className="service-detail-breadcrumb-link">
              {text.services}
            </Link>

            <span className="service-detail-breadcrumb-chevron"></span>

            <span className="service-detail-breadcrumb-current">
              {localizedService.breadcrumbTitle || serviceTitle}
            </span>
          </nav>
        </div>
      </section>

      <section className="service-detail-hero-section">
        <div className="service-detail-container">
          <div
            className="service-detail-hero"
            style={{ backgroundImage: `url(${heroBackground})` }}
          >
            <div className="service-detail-hero__content">
              {localizedService.heroEyebrow && (
                <span className="service-detail-hero__eyebrow">
                  {localizedService.heroEyebrow}
                </span>
              )}

              <h1>{serviceTitle}</h1>

              <p>{serviceDescription}</p>

              <a href="#service-request" className="service-detail-hero__btn" onClick={scrollToRequestForm}>
                {heroButtonText}
              </a>
            </div>
          </div>
        </div>
      </section>

      {hasOverview && (
        <section className="service-overview-section">
          <div className="service-detail-container">
            <div className={`service-overview-card ${!overviewImage ? "service-overview-card--text-only" : ""}`}>
              <div className="service-overview-content">
                <p className="service-section-kicker">
                  {localizedService.overviewLabel || text.overviewLabel}
                </p>

                <h2>{localizedService.overviewTitle || text.overviewTitle}</h2>

                {localizedService.overviewDescription && (
                  <p className="service-overview-description">
                    {localizedService.overviewDescription}
                  </p>
                )}
              </div>

              {overviewImage && (
                <div className="service-overview-image-wrap">
                  <img src={overviewImage} alt={localizedService.overviewTitle || serviceTitle} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {benefits.length > 0 && (
        <section className="service-benefits-section">
          <div className="service-detail-container">
            <div className="service-section-header service-section-header--compact">
              <h2>{localizedService.benefitsTitle || text.benefitsTitle}</h2>

              {localizedService.benefitsDescription && (
                <p>{localizedService.benefitsDescription}</p>
              )}
            </div>

            <div className="service-benefits-grid">
              {benefits.map((item, index) => (
                <article
                  className="service-benefit-card"
                  style={{ "--animation-order": index }}
                  key={item.id}
                >
                  <div className="service-benefit-card__icon">
                    <img src={item.icon} alt="" />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {deliverables.length > 0 && (
        <section className="service-templates-section">
          <div className="service-detail-container">
            <div className="service-section-header">
              <h2>{localizedService.deliverablesTitle || localizedService.templatesTitle || text.deliverablesTitle}</h2>

              <p>
                {localizedService.deliverablesDescription ||
                  localizedService.templatesDescription ||
                  text.templatesDescription}
              </p>
            </div>

            <div className="service-templates-panel">
              <div className={`service-templates-grid service-card-grid--count-${Math.min(deliverables.length, 3)}`}>
                {deliverables.map((item, index) => (
                  <article
                    className="service-template-card"
                    style={{ "--animation-order": index }}
                    key={item.id}
                  >
                    {item.image && (
                      <div className="service-template-card__image-wrap">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="service-template-card__image"
                        />
                      </div>
                    )}

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    {item.type && <span>{item.type}</span>}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {processSteps.length > 0 && (
        <section className="service-process-section">
          <div className="service-detail-container">
            <div className="service-section-header service-section-header--center">
              <h2>{localizedService.processTitle || text.processTitle}</h2>

              {localizedService.processDescription && (
                <p>{localizedService.processDescription}</p>
              )}
            </div>

            <div className="service-process-grid">
              {processSteps.map((step, index) => (
                <article
                  className="service-process-card"
                  style={{ "--animation-order": index }}
                  key={step.id}
                >
                  <span>{step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {showPricing && (
        <section className="service-pricing-section">
          <div className="service-detail-container">
            <div className="service-section-header service-section-header--center">
              <h2>{localizedService.pricingTitle || text.pricingTitle}</h2>

              {localizedService.pricingDescription && (
                <p>{localizedService.pricingDescription}</p>
              )}
            </div>

            <div className="service-pricing-grid">
              {pricingPlans.map((plan, index) => (
                <article
                  className="service-pricing-card"
                  style={{ "--animation-order": index }}
                  key={plan.id}
                >
                  <h3>{plan.title}</h3>
                  <strong>{plan.price}</strong>
                  <p>{plan.description}</p>

                  {plan.features.length > 0 && (
                    <ul>
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  )}

                  <a href="#service-request" onClick={scrollToRequestForm}>
                    {localizedService.requestButtonText || text.sendRequest}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {showResources && (
        <section className="service-guides-section">
          <div className="service-detail-container">
            <div className="service-section-header">
              <h2>{localizedService.resourcesTitle || localizedService.guidesTitle || text.resourcesTitle}</h2>

              <p>
                {localizedService.resourcesDescription ||
                  localizedService.guidesDescription ||
                  text.resourcesDescription}
              </p>
            </div>

            <div className="service-guides-panel">
              <div className={`service-guides-grid service-card-grid--count-${Math.min(resources.length, 3)}`}>
                {resources.map((resource, index) => (
                  <article
                    className="service-guide-card"
                    style={{ "--animation-order": index }}
                    key={resource.id}
                  >
                    {resource.image && (
                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="service-guide-card__image"
                      />
                    )}

                    <div className="service-guide-card__meta">
                      {resource.type && <span>{resource.type}</span>}
                      {resource.date && <span>{resource.date}</span>}
                    </div>

                    <h3>{resource.title}</h3>

                    <p>{resource.description}</p>

                    {resource.fileType && (
                      <small>{resource.fileType}</small>
                    )}

                    {resource.url && (
                      <a href={resource.url} className="service-download-btn" target="_blank" rel="noreferrer">
                        {resource.buttonText || (isArabic ? "تحميل المورد" : "Download resource")}
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="service-request-section" id="service-request" ref={serviceRequestRef}>
        <div className="service-detail-container">
          <div className="service-request-card">
            <div className="service-request-left">
              <p>{localizedService.requestLabel || text.requestLabel}</p>

              <h2>{localizedService.requestTitle || text.requestTitle}</h2>

              <span>{localizedService.requestDescription || text.requestDescription}</span>

              {requestImage && (
                <img src={requestImage} alt={localizedService.requestTitle || text.requestTitle} />
              )}
            </div>

            <form className="service-request-form" onSubmit={handleRequestSubmit}>
              <div className="service-request-form__grid">
                <FormGroup label={text.firstName} htmlFor="firstName">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder={text.firstNamePlaceholder}
                    value={requestForm.firstName}
                    onChange={handleRequestChange}
                    required
                  />
                </FormGroup>

                <FormGroup label={text.lastName} htmlFor="lastName">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder={text.lastNamePlaceholder}
                    value={requestForm.lastName}
                    onChange={handleRequestChange}
                  />
                </FormGroup>

                <FormGroup label={text.email} htmlFor="email">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={text.emailPlaceholder}
                    value={requestForm.email}
                    onChange={handleRequestChange}
                    required
                  />
                </FormGroup>

                <FormGroup label={text.phone} htmlFor="phone">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={text.phonePlaceholder}
                    value={requestForm.phone}
                    onChange={handleRequestChange}
                  />
                </FormGroup>

                <FormGroup label={text.company} htmlFor="company" full>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    placeholder={text.companyPlaceholder}
                    value={requestForm.company}
                    onChange={handleRequestChange}
                  />
                </FormGroup>

                {showPackageSelect && (
                  <FormGroup label={text.servicePackage} htmlFor="servicePackage" full>
                    <select
                      id="servicePackage"
                      name="servicePackage"
                      value={requestForm.servicePackage}
                      onChange={handleRequestChange}
                    >
                      <option value="">{text.packagePlaceholder}</option>
                      {requestPackageOptions.map((option) => (
                        <option value={option} key={option}>{option}</option>
                      ))}
                    </select>
                  </FormGroup>
                )}

                <FormGroup label={text.message} htmlFor="message" full>
                  <textarea
                    id="message"
                    name="message"
                    placeholder={text.messagePlaceholder}
                    value={requestForm.message}
                    onChange={handleRequestChange}
                  ></textarea>
                </FormGroup>
              </div>

              <label className="service-request-policy">
                <input
                  name="privacy"
                  type="checkbox"
                  checked={requestForm.privacy}
                  onChange={handleRequestChange}
                />

                <span>
                  {text.privacy} <a href="/privacy">{text.privacyLink}</a>.
                </span>
              </label>

              {requestMessage.text && (
                <div className={`service-request-alert service-request-alert--${requestMessage.type}`}>
                  {requestMessage.text}
                </div>
              )}

              <button type="submit" className="service-request-submit" disabled={submittingRequest}>
                {submittingRequest
                  ? isArabic
                    ? "جاري الإرسال..."
                    : "Sending..."
                  : localizedService.requestButtonText || text.sendRequest}
              </button>
            </form>
          </div>
        </div>
      </section>

      {showFaqs && (
        <section className="service-faq-section">
          <div className="service-detail-container">
            <div className="service-section-header service-section-header--center">
              <h2>{localizedService.faqsTitle || text.faqsTitle}</h2>

              {localizedService.faqsDescription && (
                <p>{localizedService.faqsDescription}</p>
              )}
            </div>

            <div className="service-faq-list">
              {faqs.map((faq, index) => (
                <details className="service-faq-item" key={faq.id} open={index === 0}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="service-testimonials-section">
          <div className="service-detail-container">
            <div className="service-testimonials-card">
              <div className="service-testimonials-left">
                <p>{localizedService.testimonialsLabel || text.testimonialsLabel}</p>

                <h2>{localizedService.testimonialsTitle || text.testimonialsTitle}</h2>

                <span>{localizedService.testimonialsDescription || text.testimonialsDescription}</span>

                <button type="button">
                  <img src={leaveReviewIcon} alt="" />
                  {text.leaveReview}
                </button>

                <div className="service-testimonials-arrows">
                  <button
                    type="button"
                    onClick={() => scrollTestimonials(-1)}
                    aria-label="Previous testimonial"
                  >
                    <img src={isArabic ? arrowRight : arrowLeft} alt="" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollTestimonials(1)}
                    aria-label="Next testimonial"
                  >
                    <img src={isArabic ? arrowLeft : arrowRight} alt="" />
                  </button>
                </div>
              </div>

              <div className="service-video-review-card">
                <div className="service-video-review-card__image-wrap">
                  <img src={videoReviewImage} alt={text.videoTestimonial} />

                  <div className="service-video-review-card__play"></div>

                  <span>{text.videoTestimonial}</span>
                  <strong>{localizedService.videoDuration || "1:20"}</strong>
                </div>

                <h3>{localizedService.videoReviewName || reviews[0]?.name}</h3>

                <p>{localizedService.videoReviewSubtitle || reviews[0]?.subtitle}</p>

                <img
                  src={reviewBawsalaLogo}
                  alt=""
                  className="service-video-review-card__logo"
                />
              </div>

              <div className="service-review-carousel-wrap">
                <div
                  className="service-review-carousel"
                  ref={testimonialScrollerRef}
                >
                  {loopedReviewCards.map((review, index) => (
                    <article
                      className="service-review-card"
                      key={`${review.id}-${index}`}
                    >
                      <div className="service-review-card__top">
                        <img src={review.image} alt={review.name} />

                        <div>
                          <div className="service-review-card__stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <img
                                src={reviewStar}
                                alt=""
                                key={star}
                                className={
                                  star <= Number(review.rating || 0)
                                    ? "is-active"
                                    : "is-muted"
                                }
                              />
                            ))}
                          </div>

                          <h3>{review.name}</h3>

                          <p>{review.subtitle}</p>
                        </div>
                      </div>

                      <p className="service-review-card__text">{review.text}</p>

                      <img
                        src={reviewBawsalaLogo}
                        alt=""
                        className="service-review-card__logo"
                      />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="service-detail-contact-cta">
        <div className="service-detail-contact-cta__container">
          <div className="service-detail-contact-cta__card">
            <div
              className="service-detail-contact-cta__avatars"
              aria-hidden="true"
            >
              <img
                className="service-detail-contact-cta__avatar service-detail-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />
              <img
                className="service-detail-contact-cta__avatar service-detail-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />
              <img
                className="service-detail-contact-cta__avatar service-detail-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="service-detail-contact-cta__title">
              {text.stillQuestions}
            </h3>

            <p className="service-detail-contact-cta__subtitle">
              {text.stillQuestionsDescription}
            </p>

            <Link className="service-detail-contact-cta__btn" to="/contact">
              {text.getInTouch}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

function FormGroup({ label, htmlFor, full = false, children }) {
  return (
    <div className={`service-request-form__group ${full ? "service-request-form__group--full" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default ServiceDetail;
