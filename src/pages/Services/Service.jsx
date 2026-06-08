import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import "./Service.css";

import { db } from "../../firebase";

import serviceHeaderBg from "../../assets/carrer_header_background.png";

import serviceCardImage from "../../assets/blog-img-5.jpg";
import fasterInternalIcon from "../../assets/faster_internal.png";
import useTemplatesIcon from "../../assets/use_templates.png";
import operationalSystemIcon from "../../assets/operational_system.png";
import shareServiceIcon from "../../assets/share_service.png";

import packagePointIcon from "../../assets/our_package_point.png";

const FEATURE_FALLBACK_ICONS = [
  operationalSystemIcon,
  fasterInternalIcon,
  useTemplatesIcon,
];

const OVERLAY_COLORS = ["green", "blue", "red", "blue", "green", "red"];

const HERO_TEXT = {
  en: {
    tag: "Our services",
    titleBefore: "Empowering Businesses",
    titleMiddle: "Through",
    titleHighlight: "Smart Solutions",
    description:
      "At Bawsala, we help startups, entrepreneurs, and organizations grow through tailored business solutions from administrative development and business consulting to digital marketing and website creation.",
    requestButton: "Request a Service",
    consultationButton: "Book a Free Consultation",
  },
  ar: {
    tag: "خدماتنا",
    titleBefore: "تمكين الأعمال",
    titleMiddle: "من خلال",
    titleHighlight: "حلول ذكية",
    description:
      "في بوصلة، نساعد الشركات الناشئة ورواد الأعمال والمؤسسات على النمو من خلال حلول أعمال مخصصة تشمل التطوير الإداري والاستشارات والتسويق الرقمي وإنشاء المواقع.",
    requestButton: "اطلب خدمة",
    consultationButton: "احجز استشارة مجانية",
  },
};

const SERVICES_HEADER_TEXT = {
  en: {
    title: "Our Services",
    description:
      "Explore our range of professional services designed to support your business growth, improve operations, strengthen your digital presence, and accelerate success.",
    loading: "Loading services...",
    empty: "No services available yet.",
    learnMore: "Learn More",
  },
  ar: {
    title: "خدماتنا",
    description:
      "استكشف مجموعة من الخدمات الاحترافية المصممة لدعم نمو أعمالك، وتحسين العمليات، وتعزيز حضورك الرقمي، وتسريع النجاح.",
    loading: "جاري تحميل الخدمات...",
    empty: "لا توجد خدمات متاحة حالياً.",
    learnMore: "اعرف المزيد",
  },
};

const PACKAGES_TEXT = {
  en: {
    kicker: "Our Packages",
    title:
      "Choose the package that best fits your organization’s goals and stage of growth.",
    subtitle:
      "we are here to help you grow , we offer you three packages to achieve your goal faster and smarter.",
    popular: "Most popular",
    button: "Request Package",
  },
  ar: {
    kicker: "باقاتنا",
    title: "اختر الباقة التي تناسب أهداف مؤسستك ومرحلة نموها.",
    subtitle:
      "نحن هنا لمساعدتك على النمو، ونقدم لك ثلاث باقات لتحقيق هدفك بشكل أسرع وأذكى.",
    popular: "الأكثر طلباً",
    button: "اطلب الباقة",
  },
};

const packages = [
  {
    id: 1,
    popular: false,
    en: {
      priceAmount: "7 000",
priceCurrency: "DZ",
pricePeriod: "mth",
      title: "Compass for Nonprofit Organizations",
      included: "Included Services",
      features: [
        "Business consulting",
        "Personal strategic guidance",
        "Branding consultation",
        "Monthly advisory sessions",
        "Basic digital marketing support",
      ],
    },
    ar: {
  priceAmount: "7 000",
  priceCurrency: "دج",
  pricePeriod: "شهر",
  title: "بوصلة للمنظمات غير الربحية",
  included: "الخدمات المشمولة",
  features: [
    "استشارات أعمال",
    "إرشاد استراتيجي شخصي",
    "استشارة في الهوية والعلامة",
    "جلسات استشارية شهرية",
    "دعم أساسي في التسويق الرقمي",
  ],
},
  },
  {
    id: 2,
    popular: true,
    en: {
     priceAmount: "7 000",
priceCurrency: "DZ",
pricePeriod: "mth",
      title: "Compass Leaders",
      included: "Included Services",
      features: [
        "Business consulting",
        "Personal strategic guidance",
        "Branding consultation",
        "Monthly advisory sessions",
        "Basic digital marketing support",
      ],
    },
   ar: {
  priceAmount: "7 000",
  priceCurrency: "دج",
  pricePeriod: "شهر",
  title: "قادة بوصلة",
  included: "الخدمات المشمولة",
  features: [
    "استشارات أعمال",
    "إرشاد استراتيجي شخصي",
    "استشارة في الهوية والعلامة",
    "جلسات استشارية شهرية",
    "دعم أساسي في التسويق الرقمي",
  ],
},
  },
  {
    id: 3,
    popular: false,
    en: {
      priceAmount: "7 000",
priceCurrency: "DZ",
pricePeriod: "mth",
      title: "Compass for Profit Organizations",
      included: "Included Services",
      features: [
        "Business consulting",
        "Personal strategic guidance",
        "Branding consultation",
        "Monthly advisory sessions",
        "Basic digital marketing support",
      ],
    },
   ar: {
  priceAmount: "7 000",
  priceCurrency: "دج",
  pricePeriod: "شهر",
  title: "بوصلة للمؤسسات الربحية",
  included: "الخدمات المشمولة",
  features: [
    "استشارات أعمال",
    "إرشاد استراتيجي شخصي",
    "استشارة في الهوية والعلامة",
    "جلسات استشارية شهرية",
    "دعم أساسي في التسويق الرقمي",
  ],
},
  },
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

const timestampToMs = (value) => {
  if (!value) return 0;

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
};

const isPublished = (service) => {
  if (!service?.status) return true;
  return service.status === "published";
};

const getServiceSlug = (service) => {
  return service?.slug || service?.en?.slug || service?.ar?.slug || service?.id;
};

const getServiceUrl = (service) => {
  return `/services/${getServiceSlug(service)}`;
};

const getServiceTitle = (service, language) => {
  const localizedService = getLocalizedObject(service, language);

  return (
    localizedService.heroTitle ||
    localizedService.seoTitle ||
    localizedService.breadcrumbTitle ||
    ""
  );
};

const getServiceDescription = (service, language) => {
  const localizedService = getLocalizedObject(service, language);

  return (
    localizedService.heroDescription ||
    localizedService.seoDescription ||
    ""
  );
};

const getServiceButtonText = (service, language, isArabic) => {
  const localizedService = getLocalizedObject(service, language);

  return localizedService.heroButtonText || (isArabic ? "اعرف المزيد" : "Learn More");
};

const getServiceTags = (service, language) => {
  const benefits = Array.isArray(service?.benefits) ? service.benefits : [];

  return benefits
    .slice(0, 2)
    .map((benefit) => {
      const localizedBenefit = getLocalizedObject(benefit, language);
      return localizedBenefit.title || "";
    })
    .filter(Boolean);
};

const getServiceFeatures = (service, language) => {
  const benefits = Array.isArray(service?.benefits) ? service.benefits : [];

  return benefits.slice(0, 3).map((benefit, index) => {
    const localizedBenefit = getLocalizedObject(benefit, language);

    return {
      icon:
        benefit.iconUrl ||
        FEATURE_FALLBACK_ICONS[index % FEATURE_FALLBACK_ICONS.length],
      text: localizedBenefit.title || localizedBenefit.description || "",
    };
  });
};

const Service = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  const heroText = HERO_TEXT[language];
  const servicesHeaderText = SERVICES_HEADER_TEXT[language];
  const packagesText = PACKAGES_TEXT[language];

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
    const fetchServices = async () => {
      try {
        setLoading(true);

        let fetchedServices = [];

        try {
          const servicesSnapshot = await getDocs(
            query(collection(db, "services"), orderBy("publishedAt", "desc"))
          );

          fetchedServices = servicesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          try {
            const servicesSnapshot = await getDocs(
              query(collection(db, "services"), orderBy("createdAt", "desc"))
            );

            fetchedServices = servicesSnapshot.docs.map((docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            }));
          } catch (fallbackError) {
            const servicesSnapshot = await getDocs(collection(db, "services"));

            fetchedServices = servicesSnapshot.docs.map((docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            }));
          }
        }

        const publishedServices = fetchedServices
          .filter(isPublished)
          .sort((a, b) => {
            return (
              timestampToMs(b.publishedAt || b.createdAt || b.updatedAt) -
              timestampToMs(a.publishedAt || a.createdAt || a.updatedAt)
            );
          });

        setServices(publishedServices);
      } catch (error) {
        console.error("Error loading services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <main className="service-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="service-hero">
        <div
          className="service-hero__container"
          style={{ backgroundImage: `url(${serviceHeaderBg})` }}
        >
          <p className="service-hero__tag">{heroText.tag}</p>

          <h1 className="service-hero__title">
            {heroText.titleBefore}
            <br />
            {heroText.titleMiddle}{" "}
            <span>{heroText.titleHighlight}</span>
          </h1>

          <p className="service-hero__description">{heroText.description}</p>

          <div className="service-hero__actions">
            <Link to="/contact" className="service-hero__button">
              {heroText.requestButton}
            </Link>

            <Link
              to="/contact"
              className="service-hero__button service-hero__button--light"
            >
              {heroText.consultationButton}
            </Link>
          </div>
        </div>
      </section>

      <section className="service-list-section">
        <div className="service-container">
          <div className="service-list-header">
            <h2>{servicesHeaderText.title}</h2>

            <p>{servicesHeaderText.description}</p>
          </div>

          {loading ? (
            <div className="service-empty-state">
              {servicesHeaderText.loading}
            </div>
          ) : services.length === 0 ? (
            <div className="service-empty-state">
              {servicesHeaderText.empty}
            </div>
          ) : (
            <div className="service-cards-grid">
              {services.map((service, index) => {
                const title = getServiceTitle(service, language);
                const description = getServiceDescription(service, language);
                const buttonText = getServiceButtonText(
                  service,
                  language,
                  isArabic
                );
                const tags = getServiceTags(service, language);
                const features = getServiceFeatures(service, language);
                const image =
                  service.heroBackgroundUrl ||
                  service.imageUrl ||
                  serviceCardImage;
                const overlayColor =
                  service.overlayColor ||
                  OVERLAY_COLORS[index % OVERLAY_COLORS.length];

                return (
                  <article
                    className="service-card"
                    style={{ "--animation-order": index }}
                    key={service.id}
                  >
                    <div className="service-card__image-wrap">
                      <img
                        src={image}
                        alt={title}
                        className="service-card__image"
                      />

                      <div
                        className={`service-card__image-overlay ${overlayColor}`}
                      ></div>

                      <button type="button" className="service-card__share">
                        <img
                          src={shareServiceIcon}
                          alt={isArabic ? "مشاركة الخدمة" : "Share service"}
                        />
                      </button>

                      {tags.length > 0 && (
                        <div className="service-card__tags">
                          {tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="service-card__body">
                      <h3>{title}</h3>

                      <p className="service-card__description">
                        {description}
                      </p>

                      {features.length > 0 && (
                        <ul className="service-card__features">
                          {features.map((feature, featureIndex) => (
                            <li key={`${feature.text}-${featureIndex}`}>
                              <img src={feature.icon} alt="" />
                              <span>{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                     <Link to={getServiceUrl(service)} className="service-card__button">
                     {buttonText}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </main>
  );
};

export default Service;