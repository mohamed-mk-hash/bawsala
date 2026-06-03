// src/Components/Experience.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";

import PersonImg from "../assets/experience-personne.png";
import PeopleImg from "../assets/experience-people.jpg";
import CirclesImg from "../assets/circles.png";

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

export default function Experience() {
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
      <section className="experienceSection" dir={isArabic ? "rtl" : "ltr"}>
        <div className="experienceContainer"></div>
      </section>
    );
  }

  if (!chooseContent) {
    return null;
  }

  const title = getLocalizedText(chooseContent.title, language);
  const subtitle = getLocalizedText(chooseContent.subtitle, language);

  const cards = Array.isArray(chooseContent.cards) ? chooseContent.cards : [];
  const stats = Array.isArray(chooseContent.stats) ? chooseContent.stats : [];

  const firstCard = cards[0];
  const secondCard = cards[1];
  const thirdCard = cards[2];

  return (
    <section className="experienceSection" dir={isArabic ? "rtl" : "ltr"}>
      <div className="experienceContainer">
        <div className="experienceHeading">
          <a href="/about" className="experienceKicker">
            {isArabic ? "لماذا تختار بوصلة" : "Why Choose Bawsala"}
          </a>

          <h2 className="experienceTitle">{title}</h2>

          <p className="experienceSubtitle">{subtitle}</p>
        </div>

        <div className="experienceGrid">
          <div className="experienceLeftCol">
            {firstCard && (
              <div className="expCard expCard--dark">
                <h3 className="expCardTitle">
                  {getLocalizedText(firstCard.title, language)}
                </h3>

                <p className="expCardDesc">
                  {getLocalizedText(firstCard.description, language)}
                </p>

                <a className="expBtnPrimary" href="/services">
                  {isArabic ? "اكتشف خدماتنا" : "Explore our services"}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            )}

            {secondCard && (
              <div className="expCard expCard--image">
                <img
                  className="expCardImg"
                  src={PeopleImg}
                  alt=""
                  loading="lazy"
                />

                <div className="expCardOverlay">
                  <h4 className="expOverlayTitle">
                    {getLocalizedText(secondCard.title, language)}
                  </h4>

                  <p className="expOverlayDesc">
                    {getLocalizedText(secondCard.description, language)}
                  </p>

                  <a className="expOverlayLink" href="/about">
                    {isArabic ? "تعرف على منهجيتنا" : "Learn About Our Method"}{" "}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="experienceMid">
            <img
              className="experienceMid__circles"
              src={CirclesImg}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />

            <div className="experienceMid__content">
              <h3 className="experienceMid__title">
                {thirdCard
                  ? getLocalizedText(thirdCard.title, language)
                  : ""}
              </h3>

              <p className="experienceMid__desc">
                {thirdCard
                  ? getLocalizedText(thirdCard.description, language)
                  : ""}
              </p>
            </div>

            <img
              className="experienceMid__person"
              src={PersonImg}
              alt=""
              loading="lazy"
            />

            <div className="experienceMid__line" aria-hidden="true">
              <span className="experienceMid__dot" />
              <span className="experienceMid__dash" />
            </div>
          </div>

          <div className="experienceRight">
            <h3 className="expStatsTitle">
              {isArabic ? "الأثر والنطاق" : "Impact & Scale"}
            </h3>

            <p className="expStatsSubtitle">
              {isArabic
                ? "نتائج تتحدث عن نفسها"
                : "Results that speak for themselves"}
            </p>

            {stats.map((stat, index) => (
              <div className="expStat" key={`${stat.value}-${index}`}>
                <div className="expStatNum">{stat.value}</div>

                <div className="expStatText">
                  {getLocalizedText(stat.label, language)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}