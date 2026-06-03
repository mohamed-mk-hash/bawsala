import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";

import plusIcon from "../assets/plus-circle.png";
import minusIcon from "../assets/minus-circle.png";

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

function FaqItem({ item, isOpen, onToggle, language, isArabic }) {
  const question = getLocalizedText(item.question, language);
  const answer = getLocalizedText(item.answer, language);

  return (
    <div className={`faqItem ${isOpen ? "open" : ""}`}>
      <button className="faqQuestion" onClick={onToggle} type="button">
        <span>{question}</span>

        <img
          src={isOpen ? minusIcon : plusIcon}
          alt=""
          className="faqIcon"
        />
      </button>

      <div className="faqAnswerWrap">
        <div className="faqAnswerInner">
          <p className="faqAnswer">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [faqContent, setFaqContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);

  const isArabic = language === "ar";

  useEffect(() => {
    const fetchFaqContent = async () => {
      try {
        setLoading(true);

        const documentRef = doc(db, "siteContent", "home");
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          const data = documentSnapshot.data();
          setFaqContent(data?.faq || null);
        } else {
          setFaqContent(null);
          console.warn("Document siteContent/home does not exist.");
        }
      } catch (error) {
        console.error("Error loading FAQ content:", error);
        setFaqContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqContent();
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

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section
        className="faqSection"
        dir={isArabic ? "rtl" : "ltr"}
        style={{ fontFamily: "Alexandria, sans-serif" }}
      >
        <div className="faqContainer"></div>
      </section>
    );
  }

  if (!faqContent || !Array.isArray(faqContent.items)) {
    return null;
  }

  const kicker = getLocalizedText(faqContent.kicker, language);
  const title = getLocalizedText(faqContent.title, language);
  const subtitle = getLocalizedText(faqContent.subtitle, language);

  return (
    <section
      className="faqSection"
      dir={isArabic ? "rtl" : "ltr"}
      style={{ fontFamily: "Alexandria, sans-serif" }}
    >
      <div className="faqContainer">
        {kicker && <p className="faqKicker">{kicker}</p>}

        <h2 className="faqTitle">{title}</h2>

        <p className="faqSubtitle">{subtitle}</p>

        <div className="faqList">
          {faqContent.items.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
              language={language}
              isArabic={isArabic}
            />
          ))}
        </div>
      </div>
    </section>
  );
}