import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";

import testimonialBackground from "../assets/testimonial_background.jpg";
import featuredOrganization from "../assets/featured_organization.png";
import handDrawnArrow from "../assets/Hand-drawn arrow.png";

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
};

const getLocalizedText = (value, language) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value?.[language] || "";
};

const Testimonials = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [chooseContent, setChooseContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    const fetchChooseContent = async () => {
      try {
        setLoading(true);

        const documentRef = doc(db, "siteContent", "home");
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          const data = documentSnapshot.data();
          setChooseContent(data?.choose || null);
        } else {
          setChooseContent(null);
          console.warn("Document siteContent/home does not exist.");
        }
      } catch (error) {
        console.error("Error loading choose content:", error);
        setChooseContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChooseContent();
  }, []);

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

  if (loading) {
    return (
      <section
        className="testimonials-section"
        dir={isArabic ? "rtl" : "ltr"}
        style={{
          backgroundImage: `url(${testimonialBackground})`,
          backgroundSize: "110%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#121212",
          fontFamily: isArabic ? "Alexandria, sans-serif" : "inherit",
        }}
      >
        <div className="testimonials-overlay"></div>
      </section>
    );
  }

  if (!chooseContent) {
    return null;
  }

  const title = getLocalizedText(chooseContent.title, language);
  const subtitle = getLocalizedText(chooseContent.subtitle, language);

  const features = Array.isArray(chooseContent.cards)
    ? chooseContent.cards
    : [];

  const stats = Array.isArray(chooseContent.stats)
    ? chooseContent.stats
    : [];

  return (
    <section
      className="testimonials-section"
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        backgroundImage: `url(${testimonialBackground})`,
        backgroundSize: "110%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#121212",
        fontFamily: isArabic ? "Alexandria, sans-serif" : "inherit",
      }}
    >
      <div className="testimonials-overlay">
        <div className="choose-content">
          <div className="choose-left">
            <h2 className="choose-title">{title}</h2>

            <p className="choose-description">{subtitle}</p>

            <div className="choose-features-grid">
              {features.map((item, index) => {
                const featureTitle = getLocalizedText(item.title, language);
                const featureText = getLocalizedText(
                  item.description,
                  language
                );

                return (
                  <div className="choose-feature-card" key={index}>
                    <h3>{featureTitle}</h3>
                    <p>{featureText}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="choose-right">
            <img src={handDrawnArrow} alt="" className="choose-arrow" />

            <div className="choose-image-wrap">
              <img
                src={featuredOrganization}
                alt={isArabic ? "اجتماع مؤسسة" : "Organization meeting"}
                className="choose-image"
              />
            </div>
          </div>
        </div>

        <div className="choose-stats-grid">
          {stats.map((item, index) => {
            const statLabel = getLocalizedText(item.label, language);

            return (
              <div className="choose-stat-card" key={index}>
                <h3>{item.value}</h3>
                <p>{statLabel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;