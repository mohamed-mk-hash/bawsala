import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

import { db } from "../firebase";
import heroImg from "../assets/hero-img.jpg";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
};

const getLocalizedText = (value, lang) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value?.[lang] || "";
};

export default function Hero() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        setLoading(true);

        const documentRef = doc(db, "siteContent", "home");
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          const data = documentSnapshot.data();
          setHero(data?.hero || null);
        } else {
          setHero(null);
          console.warn("Document siteContent/home does not exist.");
        }
      } catch (error) {
        console.error("Error loading hero content:", error);
        setHero(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
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

  const logos = useMemo(() => {
    if (!hero?.logos || !Array.isArray(hero.logos)) return [];

    return hero.logos.filter((logo) => logo?.image?.url);
  }, [hero]);

  const repeatedLogos = useMemo(() => {
    return [...logos, ...logos, ...logos];
  }, [logos]);

  if (loading) {
    return (
      <section className="heroSection" dir={isArabic ? "rtl" : "ltr"}>
        <div className="heroContainer">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (!hero) {
    return null;
  }

  const badgeText = getLocalizedText(hero.badgeText, language);
  const badgeLinkText = getLocalizedText(hero.badgeLinkText, language);

  const titleBeforeHighlight = getLocalizedText(
    hero.titleBeforeHighlight,
    language
  );

  const highlightedTitle = getLocalizedText(hero.highlightedTitle, language);

  const titleAfterHighlight = getLocalizedText(
    hero.titleAfterHighlight,
    language
  );

  const subtitle = getLocalizedText(hero.subtitle, language);

  const primaryButton = getLocalizedText(hero.primaryButton, language);
  const secondaryButton = getLocalizedText(hero.secondaryButton, language);

  const primaryButtonUrl = hero.primaryButtonUrl || "#";
  const secondaryButtonUrl = hero.secondaryButtonUrl || "#";

  const trustTitle = getLocalizedText(hero.trustTitle, language);
  const trustStatus = getLocalizedText(hero.trustStatus, language);

  const heroImageUrl = hero?.image?.url || hero?.heroImage?.url || heroImg;

  return (
    <section className="heroSection" dir={isArabic ? "rtl" : "ltr"}>
      <div className="heroContainer">
        <div className="heroLeft">
          <Link className="heroPill" to={secondaryButtonUrl}>
            <span className="heroPillTag">{badgeText}</span>
            <span className="heroPillText">{badgeLinkText}</span>
            <span className="heroPillArrow">{isArabic ? "←" : "→"}</span>
          </Link>

          <h1 className="heroTitle">
            {titleBeforeHighlight}{" "}
            <span className="heroBrand">{highlightedTitle}</span>
            {titleAfterHighlight ? ` ${titleAfterHighlight}` : ""}
          </h1>

          <p className="heroDesc">{subtitle}</p>

          <div className="heroCtas">
            <Link className="btnPrimary" to={primaryButtonUrl}>
              {primaryButton}
            </Link>

            <Link className="btnSecondary" to={secondaryButtonUrl}>
              {secondaryButton}
            </Link>
          </div>
        </div>

        <div className="heroRight">
          <div className="heroImageWrap">
            <img
              className="heroImage"
              src={heroImageUrl}
              alt={highlightedTitle || "Hero image"}
            />

            <div className="heroCard">
              <div className="heroCardTop">
                <span className="checkDot">✓</span>
                <span className="heroCardTitle">{trustTitle}</span>
              </div>

              <div className="bars" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, index) => (
                  <span key={index} className="bar" />
                ))}
              </div>

              <div className="heroCardBottom">
                <span className="statusDot" />
                <span>{trustStatus}</span>
              </div>
            </div>
          </div>

          <div className="heroBlob heroBlob1" aria-hidden="true" />
          <div className="heroBlob heroBlob2" aria-hidden="true" />
        </div>
      </div>

      {logos.length > 0 && (
        <div className="heroLogosWrap">
          <Swiper
            className="heroLogosSwiper"
            modules={[Autoplay]}
            loop={true}
            speed={4000}
            slidesPerView="auto"
            spaceBetween={80}
            autoplay={{
              delay: 1,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            allowTouchMove={false}
          >
            {repeatedLogos.map((logo, index) => (
              <SwiperSlide
                key={`${logo?.name || "logo"}-${index}`}
                className="heroLogoSlide"
              >
                <img
                  className="heroLogo"
                  src={logo.image.url}
                  alt={logo.name || ""}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}