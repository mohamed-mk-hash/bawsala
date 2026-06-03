import React, { useMemo, useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

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

    benefitsTitle: isArabic ? "ما الذي ستحصل عليه" : "What you will get",

    guidesTitle: isArabic ? "أدلة مجانية قابلة للتحميل" : "Free Downloadable Guides",
    guidesDescription: isArabic
      ? "احصل على أدلة احترافية وموارد جاهزة لدعم رحلة تطوير أعمالك."
      : "Access professional guides and ready-to-use resources to support your business development journey.",

    templatesTitle: isArabic ? "كتالوج القوالب الإدارية" : "Administrative Templates Catalog",
    templatesDescription: isArabic
      ? "استكشف قوالب احترافية تساعد الشركات على تنظيم العمليات وتحسين الإدارة."
      : "Explore professionally designed templates that help businesses organize operations and improve management processes.",

    requestLabel: isArabic ? "طلب خدمة" : "Service request",
    requestTitle: isArabic ? "طلب استشارة إدارية" : "Request Administrative Consultation",
    requestDescription: isArabic
      ? "أخبرنا باحتياجات مؤسستك وسيتواصل معك فريقنا بأفضل حل مناسب."
      : "Tell us about your business needs and our team will contact you with the best solution.",
    firstName: isArabic ? "الاسم الأول" : "First name",
    lastName: isArabic ? "اللقب" : "Last name",
    email: isArabic ? "البريد الإلكتروني" : "Email",
    message: isArabic ? "الرسالة" : "Message",
    firstNamePlaceholder: isArabic ? "الاسم الأول" : "First name",
    lastNamePlaceholder: isArabic ? "اللقب" : "Last name",
    emailPlaceholder: "you@company.com",
    messagePlaceholder: isArabic ? "اكتب رسالتك هنا..." : "Leave us a message...",
    privacy: isArabic ? "أنت توافق على" : "You agree to our friendly",
    privacyLink: isArabic ? "سياسة الخصوصية" : "privacy policy",
    sendRequest: isArabic ? "إرسال الطلب" : "Send Request",

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

  const [requestForm, setRequestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    privacy: false,
  });

  const testimonialScrollerRef = useRef(null);
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

  const handleRequestChange = (event) => {
    const { name, value, type, checked } = event.target;

    setRequestForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRequestSubmit = (event) => {
    event.preventDefault();

    console.log("Service request:", {
      serviceId: service?.id,
      serviceSlug: getServiceSlug(service),
      serviceTitle: getServiceTitle(service, language),
      ...requestForm,
    });
  };

  const benefits = useMemo(() => {
    if (!Array.isArray(service?.benefits)) return [];

    return service.benefits.map((benefit, index) => {
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

  const guides = useMemo(() => {
    const source = Array.isArray(service?.guides) ? service.guides : [];

    return source.map((guide, index) => {
      const localizedGuide = getLocalizedObject(guide, language);

      return {
        id: guide.id || index,
        image:
          localizedGuide.imageUrl ||
          guide.imageUrl ||
          FALLBACK_GUIDE_IMAGES[index % FALLBACK_GUIDE_IMAGES.length],
        date:
          localizedGuide.date ||
          localizedGuide.dateText ||
          localizedGuide.publishedText ||
          "",
        title: localizedGuide.title || "",
        description: localizedGuide.description || "",
      };
    });
  }, [service, language]);

  const templates = useMemo(() => {
    const source = Array.isArray(service?.templates) ? service.templates : [];

    return source.map((template, index) => {
      const localizedTemplate = getLocalizedObject(template, language);

      return {
        id: template.id || index,
        image:
          localizedTemplate.imageUrl ||
          template.imageUrl ||
          FALLBACK_TEMPLATE_IMAGES[index % FALLBACK_TEMPLATE_IMAGES.length],
        title: localizedTemplate.title || "",
        description: localizedTemplate.description || "",
        type: localizedTemplate.type || localizedTemplate.fileType || "",
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

  const benefitsTitle = localizedService.benefitsTitle || text.benefitsTitle;

  const guidesTitle = localizedService.guidesTitle || text.guidesTitle;
  const guidesDescription =
    localizedService.guidesDescription || text.guidesDescription;

  const templatesTitle = localizedService.templatesTitle || text.templatesTitle;
  const templatesDescription =
    localizedService.templatesDescription || text.templatesDescription;

  const requestLabel = localizedService.requestLabel || text.requestLabel;
  const requestTitle = localizedService.requestTitle || text.requestTitle;
  const requestDescription =
    localizedService.requestDescription || text.requestDescription;

  const testimonialLabel =
    localizedService.testimonialsLabel || text.testimonialsLabel;
  const testimonialTitle =
    localizedService.testimonialsTitle || text.testimonialsTitle;
  const testimonialDescription =
    localizedService.testimonialsDescription || text.testimonialsDescription;

  const requestImage =
    service.requestImageUrl ||
    localizedService.requestImageUrl ||
    requestFeaturedImage;

  const videoReviewImage =
    service.videoReviewImageUrl ||
    localizedService.videoReviewImageUrl ||
    reviewVideo;

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
              <h1>{serviceTitle}</h1>

              <p>{serviceDescription}</p>

              <a href="#service-request" className="service-detail-hero__btn">
                {heroButtonText}
              </a>
            </div>
          </div>
        </div>
      </section>

      {benefits.length > 0 && (
        <section className="service-benefits-section">
          <div className="service-detail-container">
            <h2>{benefitsTitle}</h2>

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

      {guides.length > 0 && (
        <section className="service-guides-section">
          <div className="service-detail-container">
            <div className="service-section-header">
              <h2>{guidesTitle}</h2>

              <p>{guidesDescription}</p>
            </div>

            <div className="service-guides-panel">
              <div className="service-guides-grid">
                {guides.map((guide, index) => (
                  <article
                    className="service-guide-card"
                    style={{ "--animation-order": index }}
                    key={guide.id}
                  >
                    <img
                      src={guide.image}
                      alt={guide.title}
                      className="service-guide-card__image"
                    />

                    {guide.date && (
                      <span className="service-guide-card__date">
                        {guide.date}
                      </span>
                    )}

                    <h3>{guide.title}</h3>

                    <p>{guide.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {templates.length > 0 && (
        <section className="service-templates-section">
          <div className="service-detail-container">
            <div className="service-section-header">
              <h2>{templatesTitle}</h2>

              <p>{templatesDescription}</p>
            </div>

            <div className="service-templates-panel">
              <div className="service-templates-grid">
                {templates.map((template, index) => (
                  <article
                    className="service-template-card"
                    style={{ "--animation-order": index }}
                    key={template.id}
                  >
                    <img
                      src={template.image}
                      alt={template.title}
                      className="service-template-card__image"
                    />

                    <h3>{template.title}</h3>

                    <p>{template.description}</p>

                    {template.type && <span>{template.type}</span>}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="service-request-section" id="service-request">
        <div className="service-detail-container">
          <div className="service-request-card">
            <div className="service-request-left">
              <p>{requestLabel}</p>

              <h2>{requestTitle}</h2>

              <span>{requestDescription}</span>

              <img src={requestImage} alt={requestTitle} />
            </div>

            <form className="service-request-form" onSubmit={handleRequestSubmit}>
              <div className="service-request-form__grid">
                <div className="service-request-form__group">
                  <label htmlFor="firstName">{text.firstName}</label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder={text.firstNamePlaceholder}
                    value={requestForm.firstName}
                    onChange={handleRequestChange}
                  />
                </div>

                <div className="service-request-form__group">
                  <label htmlFor="lastName">{text.lastName}</label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder={text.lastNamePlaceholder}
                    value={requestForm.lastName}
                    onChange={handleRequestChange}
                  />
                </div>

                <div className="service-request-form__group service-request-form__group--full">
                  <label htmlFor="email">{text.email}</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={text.emailPlaceholder}
                    value={requestForm.email}
                    onChange={handleRequestChange}
                  />
                </div>

                <div className="service-request-form__group service-request-form__group--full">
                  <label htmlFor="message">{text.message}</label>

                  <textarea
                    id="message"
                    name="message"
                    placeholder={text.messagePlaceholder}
                    value={requestForm.message}
                    onChange={handleRequestChange}
                  ></textarea>
                </div>
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

              <button type="submit" className="service-request-submit">
                {localizedService.requestButtonText || text.sendRequest}
              </button>
            </form>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="service-testimonials-section">
          <div className="service-detail-container">
            <div className="service-testimonials-card">
              <div className="service-testimonials-left">
                <p>{testimonialLabel}</p>

                <h2>{testimonialTitle}</h2>

                <span>{testimonialDescription}</span>

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

export default ServiceDetail;