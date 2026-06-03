import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "../firebase";

import serviceFallbackImage from "../assets/services-img-1.jpg";

import fasterInternalIcon from "../assets/faster_internal.png";
import useTemplatesIcon from "../assets/use_templates.png";
import operationalSystemIcon from "../assets/operational_system.png";
import shareServiceIcon from "../assets/share_service.png";

const FEATURE_FALLBACK_ICONS = [
  operationalSystemIcon,
  fasterInternalIcon,
  useTemplatesIcon,
];

const OVERLAY_COLORS = ["green", "blue", "red", "blue", "green", "red"];

const TEXT = {
  en: {
    title: "Our Services",
    subtitle:
      "We support organizations and leaders with practical services designed to bring clarity, improve performance, and support meaningful progress.",
    viewAll: "View all services",
    learnMore: "Learn More",
    loading: "Loading services...",
    empty: "No services available yet.",
    previous: "Previous services",
    next: "Next services",
    share: "Share service",
  },
  ar: {
    title: "خدماتنا",
    subtitle:
      "ندعم المؤسسات والقادة بخدمات عملية مصممة لتحقيق الوضوح، وتحسين الأداء، ودعم التقدم الحقيقي.",
    viewAll: "عرض كل الخدمات",
    learnMore: "اعرف المزيد",
    loading: "جاري تحميل الخدمات...",
    empty: "لا توجد خدمات متاحة حالياً.",
    previous: "الخدمات السابقة",
    next: "الخدمات التالية",
    share: "مشاركة الخدمة",
  },
};

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
    localizedService.title ||
    ""
  );
};

const getServiceDescription = (service, language) => {
  const localizedService = getLocalizedObject(service, language);

  return (
    localizedService.heroDescription ||
    localizedService.seoDescription ||
    localizedService.description ||
    ""
  );
};

const getServiceButtonText = (service, language, isArabic) => {
  const localizedService = getLocalizedObject(service, language);

  return localizedService.heroButtonText || (isArabic ? "اعرف المزيد" : "Learn More");
};

const getServiceImage = (service) => {
  return (
    service.heroBackgroundUrl ||
    service.imageUrl ||
    service.cardImageUrl ||
    serviceFallbackImage
  );
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

export default function Services() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef(null);

  const LOOP = 3;
  const isArabic = language === "ar";
  const text = TEXT[language];

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
        console.error("Error loading home services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const loopedServices = useMemo(() => {
    if (services.length === 0) return [];

    const items = [];

    for (let i = 0; i < LOOP; i += 1) {
      items.push(...services);
    }

    return items;
  }, [services]);

  useEffect(() => {
    const element = scrollerRef.current;

    if (!element || loopedServices.length === 0) return;

    requestAnimationFrame(() => {
      const copyWidth = element.scrollWidth / LOOP;
      element.scrollLeft = copyWidth;
    });

    const handleScroll = () => {
      const copyWidth = element.scrollWidth / LOOP;

      if (copyWidth <= 0) return;

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
  }, [loopedServices.length]);

  const scrollByCards = (direction) => {
    const element = scrollerRef.current;

    if (!element) return;

    const firstCard = element.querySelector(".serviceCard");
    const gap = 26;
    const cardWidth = firstCard ? firstCard.offsetWidth + gap : 410;

    element.scrollBy({
      left: direction * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="servicesSection" dir={isArabic ? "rtl" : "ltr"}>
      <div className="servicesTop">
        <div className="servicesTopText">
          <h2 className="servicesTitle">{text.title}</h2>

          <p className="servicesSubtitle">{text.subtitle}</p>
        </div>

        <Link className="servicesTopBtn" to="/services">
          {text.viewAll}
        </Link>
      </div>

      <div className="servicesCarouselWrap">
        {loading ? (
          <div className="servicesState">{text.loading}</div>
        ) : services.length === 0 ? (
          <div className="servicesState">{text.empty}</div>
        ) : (
          <>
            <div className="servicesCarousel" ref={scrollerRef}>
              {loopedServices.map((service, index) => {
                const title = getServiceTitle(service, language);
                const description = getServiceDescription(service, language);
                const buttonText = getServiceButtonText(
                  service,
                  language,
                  isArabic
                );
                const tags = getServiceTags(service, language);
                const features = getServiceFeatures(service, language);
                const image = getServiceImage(service);
                const overlayColor =
                  service.overlayColor ||
                  OVERLAY_COLORS[index % OVERLAY_COLORS.length];

                return (
                  <article
                    className="serviceCard"
                    style={{ "--animation-order": index }}
                    key={`${service.id}-${index}`}
                  >
                    <div className="serviceCardImageWrap">
                      <img
                        src={image}
                        alt={title}
                        className="serviceCardImage"
                        loading="lazy"
                      />

                      <div
                        className={`serviceCardImageOverlay ${overlayColor}`}
                      ></div>

                      <button type="button" className="serviceCardShare">
                        <img src={shareServiceIcon} alt={text.share} />
                      </button>

                      {tags.length > 0 && (
                        <div className="serviceCardTags">
                          {tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="serviceCardBody">
                      <h3>{title}</h3>

                      <p className="serviceCardDesc">{description}</p>

                      {features.length > 0 && (
                        <ul className="serviceCardFeatures">
                          {features.map((feature, featureIndex) => (
                            <li key={`${feature.text}-${featureIndex}`}>
                              <img src={feature.icon} alt="" />
                              <span>{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link
                        className="serviceCardBtn"
                        to={getServiceUrl(service)}
                      >
                        {buttonText}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="servicesArrows">
              <button
                className="servicesArrowBtn"
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label={text.previous}
              >
                ←
              </button>

              <button
                className="servicesArrowBtn"
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label={text.next}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}