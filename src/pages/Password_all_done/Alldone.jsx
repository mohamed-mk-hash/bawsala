import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Alldone.css";

import logo from "../../assets/bawsala-logo.png";
import signInImage from "../../assets/sign_in.jpg";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";
import reviewFeaturedImage from "../../assets/review_featured_image.jpg";
import yellowStar from "../../assets/yellow_star.png";

const normalizeLanguage = (language) => {
  const normalizedLanguage = String(language || "").toLowerCase();

  if (normalizedLanguage === "ar") return "ar";
  if (normalizedLanguage === "fr") return "fr";
  return "en";
};

const getInitialLanguage = () => {
  return normalizeLanguage(localStorage.getItem("site_language"));
};

const ALL_DONE_TEXT = {
  en: {
    title: "All done",
    subtitle:
      "Your password has been successfully reset. You can now log in with your new credentials.",
    button: "Log in",
    visualTitle: "Your business. Our consultations we ‘re in this together",
    visualSubtitle:
      "Strategic consulting designed to align with your goals, solve real challenges, and grow your business — side by side.",
    consultations: "More then 100+ consultations",
  },

  fr: {
    title: "C’est terminé",
    subtitle:
      "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.",
    button: "Connexion",
    visualTitle: "Votre entreprise. Nos consultations, ensemble",
    visualSubtitle:
      "Un accompagnement stratégique conçu pour s’aligner avec vos objectifs, résoudre vos défis réels et faire grandir votre entreprise — côte à côte.",
    consultations: "Plus de 100 consultations",
  },

  ar: {
    title: "تم بنجاح",
    subtitle:
      "تمت إعادة تعيين كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول باستخدام بياناتك الجديدة.",
    button: "تسجيل الدخول",
    visualTitle: "عملك. واستشاراتنا معاً في نفس الطريق",
    visualSubtitle:
      "استشارات استراتيجية مصممة لتتوافق مع أهدافك، وتعالج تحدياتك الحقيقية، وتساعد عملك على النمو خطوة بخطوة.",
    consultations: "أكثر من 100 استشارة",
  },
};

const Alldone = () => {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(getInitialLanguage);

  const isArabic = language === "ar";
  const text = ALL_DONE_TEXT[language] || ALL_DONE_TEXT.en;

  const profiles = [profile1, reviewFeaturedImage, profile3, profile2];

  useEffect(() => {
    const handleLanguageChanged = (event) => {
      const newLanguage = normalizeLanguage(event.detail?.language);
      setLanguage(newLanguage);
    };

    const handleStorageChanged = () => {
      setLanguage(getInitialLanguage());
    };

    window.addEventListener("languageChanged", handleLanguageChanged);
    window.addEventListener("storage", handleStorageChanged);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChanged);
      window.removeEventListener("storage", handleStorageChanged);
    };
  }, []);

  return (
    <div
      className={`all-done-page ${isArabic ? "all-done-page--rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="all-done-container">
        <div className="all-done-left">
          <div className="all-done-form-wrapper">
            <div className="all-done-top-bar">
              <div className="all-done-logo">
                <img src={logo} alt="Bawsala Logo" />
              </div>
            </div>

            <div className="all-done-content">
              <h1>{text.title}</h1>

              <p className="all-done-subtitle">{text.subtitle}</p>

              <button
                type="button"
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                {text.button}
              </button>
            </div>
          </div>
        </div>

        <div className="all-done-right">
          <div className="all-done-visual-card">
            <img
              src={signInImage}
              alt="Sign in visual"
              className="all-done-right-image"
            />

            <div className="all-done-visual-overlay">
              <h2>{text.visualTitle}</h2>

              <p>{text.visualSubtitle}</p>

              <div className="all-done-review-row">
                <div className="all-done-profile-stack">
                  {profiles.map((profile, index) => (
                    <img
                      key={index}
                      src={profile}
                      alt={`Reviewer ${index + 1}`}
                      className="all-done-profile-img"
                    />
                  ))}
                </div>

                <div className="all-done-rating">
                  <span>{text.consultations}</span>

                  <div className="all-done-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <img key={star} src={yellowStar} alt="Star" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Alldone;