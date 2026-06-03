// Contact.jsx
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase";

import "./Contact.css";

import contactImg from "../../assets/conatct-form.jpg";

// icons
import iconSales from "../../assets/Icon.png";
import iconSupport from "../../assets/message-chat-circle.png";
import iconVisit from "../../assets/marker-pin-02.png";
import iconCall from "../../assets/phone.png";

const ICONS = {
  chat: iconSales,
  support: iconSupport,
  location: iconVisit,
  phone: iconCall,
};

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

export default function Contact() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [contactContent, setContactContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        setLoading(true);

        const documentRef = doc(db, "siteContent", "contact");
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          setContactContent(documentSnapshot.data());
        } else {
          setContactContent(null);
          console.warn("Document siteContent/contact does not exist.");
        }
      } catch (error) {
        console.error("Error loading contact content:", error);
        setContactContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContactContent();
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

  const formSection = contactContent?.formSection || null;
  const infoSection = contactContent?.infoSection || null;

  const contactCards = useMemo(() => {
    if (!Array.isArray(infoSection?.cards)) return [];

    return infoSection.cards;
  }, [infoSection]);

  if (loading) {
    return (
      <main
        className="contactPageRoot"
        dir={isArabic ? "rtl" : "ltr"}
      />
    );
  }

  if (!formSection || !infoSection) {
    return null;
  }

  const formImageUrl = formSection.imageUrl || contactImg;

  return (
    <main
      className="contactPageRoot"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <section className="contactPage">
        <div className="contactPage__container">
          <div className="contactForm">
            <h1 className="contactForm__title">
              {getLocalizedText(formSection.title, language)}
            </h1>

            <p className="contactForm__subtitle">
              {getLocalizedText(formSection.subtitle, language)}
            </p>

            <form
              className="contactForm__grid"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="contactField">
                <label className="contactField__label">
                  {getLocalizedText(formSection.firstNameLabel, language)}
                </label>

                <input
                  className="contactField__input"
                  placeholder={getLocalizedText(
                    formSection.firstNamePlaceholder,
                    language
                  )}
                />
              </div>

              <div className="contactField">
                <label className="contactField__label">
                  {getLocalizedText(formSection.lastNameLabel, language)}
                </label>

                <input
                  className="contactField__input"
                  placeholder={getLocalizedText(
                    formSection.lastNamePlaceholder,
                    language
                  )}
                />
              </div>

              <div className="contactField contactField--full">
                <label className="contactField__label">
                  {getLocalizedText(formSection.emailLabel, language)}
                </label>

                <input
                  className="contactField__input"
                  placeholder={getLocalizedText(
                    formSection.emailPlaceholder,
                    language
                  )}
                  type="email"
                />
              </div>

              <div className="contactField contactField--full">
                <label className="contactField__label">
                  {getLocalizedText(formSection.phoneLabel, language)}
                </label>

                <div className="contactPhoneField">
                  <select
                    className="contactPhoneField__select"
                    aria-label={getLocalizedText(
                      formSection.countryCodeLabel,
                      language
                    )}
                    defaultValue={isArabic ? "+213" : "+1"}
                  >
                    <option value="+1">
                      {language === "en"
                        ? getLocalizedText(formSection.countryCodeLabel, language)
                        : "US"}
                    </option>

                    <option value="+213">
                      {language === "ar"
                        ? getLocalizedText(formSection.countryCodeLabel, language)
                        : "DZ"}
                    </option>

                    <option value="+33">FR</option>
                  </select>

                  <input
                    className="contactPhoneField__input"
                    placeholder={getLocalizedText(
                      formSection.phonePlaceholder,
                      language
                    )}
                    type="tel"
                  />
                </div>
              </div>

              <div className="contactField contactField--full">
                <label className="contactField__label">
                  {getLocalizedText(formSection.messageLabel, language)}
                </label>

                <textarea
                  className="contactField__textarea"
                  placeholder={getLocalizedText(
                    formSection.messagePlaceholder,
                    language
                  )}
                  rows={6}
                />
              </div>

              <label className="contactCheck contactField--full">
                <input className="contactCheck__box" type="checkbox" />

                <span className="contactCheck__text">
                  {getLocalizedText(formSection.privacyText, language)}{" "}
                  <a href={formSection.privacyUrl || "/privacy-policy"}>
                    {getLocalizedText(formSection.privacyLinkText, language)}
                  </a>
                </span>
              </label>

              <button
                className="contactForm__submit contactField--full"
                type="submit"
              >
                {getLocalizedText(formSection.buttonText, language)}
              </button>
            </form>
          </div>

          <div className="contactSide">
            <img
              className="contactSide__img"
              src={formImageUrl}
              alt={getLocalizedText(formSection.title, language)}
            />
          </div>
        </div>
      </section>

      <section className="contactCards">
        <div className="contactCards__container">
          <p className="contactCards__kicker">
            {getLocalizedText(infoSection.kicker, language)}
          </p>

          <h2 className="contactCards__title">
            {getLocalizedText(infoSection.title, language)}
          </h2>

          <p className="contactCards__subtitle">
            {getLocalizedText(infoSection.subtitle, language)}
          </p>

          <div className="contactCards__grid">
            {contactCards.map((card, index) => {
              const icon = ICONS[card.icon] || iconSales;
              const title = getLocalizedText(card.title, language);
              const description = getLocalizedText(card.description, language);
              const linkText = getLocalizedText(card.linkText, language);
              const linkUrl = card.linkUrl || "#";

              const isExternal =
                linkUrl.startsWith("http://") ||
                linkUrl.startsWith("https://");

              return (
                <article className="contactCard" key={`${card.icon}-${index}`}>
                  <div className="contactCard__iconWrap">
                    <img className="contactCard__icon" src={icon} alt="" />
                  </div>

                  <h3 className="contactCard__title">{title}</h3>

                  <p className="contactCard__desc">{description}</p>

                  <a
                    className="contactCard__link"
                    href={linkUrl}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    {linkText}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}