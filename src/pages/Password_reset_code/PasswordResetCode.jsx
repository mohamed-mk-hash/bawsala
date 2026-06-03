import React, { useEffect, useState } from "react";
import "./PasswordResetCode.css";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

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

const RESET_CODE_TEXT = {
  en: {
    title: "Check your email",
    sentCode: "We sent a password reset link to",
    hint: "Open the email and click the reset link to choose a new password.",
    resendText: "Didn't receive the email?",
    resendLink: "Click to resend",
    resending: "Sending...",
    resent: "Reset email sent again.",
    backLogin: "Back to log in",
    backReset: "Use another email",
    visualTitle: "Your business. Our consultations we ‘re in this together",
    visualSubtitle:
      "Strategic consulting designed to align with your goals, solve real challenges, and grow your business — side by side.",
    consultations: "More then 100+ consultations",
  },

  fr: {
    title: "Vérifiez votre email",
    sentCode: "Nous avons envoyé un lien de réinitialisation à",
    hint: "Ouvrez l’email et cliquez sur le lien pour choisir un nouveau mot de passe.",
    resendText: "Vous n’avez pas reçu l’e-mail ?",
    resendLink: "Renvoyer le lien",
    resending: "Envoi...",
    resent: "Email de réinitialisation envoyé à nouveau.",
    backLogin: "Retour à la connexion",
    backReset: "Utiliser un autre email",
    visualTitle: "Votre entreprise. Nos consultations, ensemble",
    visualSubtitle:
      "Un accompagnement stratégique conçu pour s’aligner avec vos objectifs, résoudre vos défis réels et faire grandir votre entreprise — côte à côte.",
    consultations: "Plus de 100 consultations",
  },

  ar: {
    title: "تحقق من بريدك الإلكتروني",
    sentCode: "أرسلنا رابط إعادة تعيين كلمة المرور إلى",
    hint: "افتح الرسالة واضغط على الرابط لاختيار كلمة مرور جديدة.",
    resendText: "لم تستلم البريد الإلكتروني؟",
    resendLink: "إعادة الإرسال",
    resending: "جاري الإرسال...",
    resent: "تم إرسال رسالة إعادة التعيين مرة أخرى.",
    backLogin: "العودة إلى تسجيل الدخول",
    backReset: "استعمال بريد آخر",
    visualTitle: "عملك. واستشاراتنا معاً في نفس الطريق",
    visualSubtitle:
      "استشارات استراتيجية مصممة لتتوافق مع أهدافك، وتعالج تحدياتك الحقيقية، وتساعد عملك على النمو خطوة بخطوة.",
    consultations: "أكثر من 100 استشارة",
  },
};

const PasswordResetCode = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [email, setEmail] = useState(
    sessionStorage.getItem("reset_password_email") || ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isArabic = language === "ar";
  const text = RESET_CODE_TEXT[language] || RESET_CODE_TEXT.en;

  const profiles = [profile1, reviewFeaturedImage, profile3, profile2];

  useEffect(() => {
    const handleLanguageChanged = (event) => {
      const newLanguage = normalizeLanguage(event.detail?.language);
      setLanguage(newLanguage);
    };

    const handleStorageChanged = () => {
      setLanguage(getInitialLanguage());
      setEmail(sessionStorage.getItem("reset_password_email") || "");
    };

    window.addEventListener("languageChanged", handleLanguageChanged);
    window.addEventListener("storage", handleStorageChanged);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChanged);
      window.removeEventListener("storage", handleStorageChanged);
    };
  }, []);

  const handleResend = async () => {
    if (!email) return;

    try {
      setLoading(true);
      setMessage("");

      const actionCodeSettings = {
  url: "http://localhost:5173/Setnewpassword",
  handleCodeInApp: false,
};

await sendPasswordResetEmail(auth, cleanedEmail, actionCodeSettings);

      setMessage(text.resent);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`reset-code-page ${isArabic ? "reset-code-page--rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="reset-code-container">
        <div className="reset-code-left">
          <div className="reset-code-form-wrapper">
            <div className="reset-code-top-bar">
              <div className="reset-code-logo">
                <img src={logo} alt="Bawsala Logo" />
              </div>
            </div>

            <div className="reset-code-content">
              <h1>{text.title}</h1>

              <p className="reset-code-subtitle">
                {text.sentCode} <strong>{email || "your email"}</strong>
              </p>

              <p className="reset-code-subtitle">{text.hint}</p>

              {message && (
                <p className="auth-message auth-message--success">
                  {message}
                </p>
              )}

              <p className="resend-text">
                {text.resendText}{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={handleResend}
                  disabled={loading || !email}
                >
                  {loading ? text.resending : text.resendLink}
                </button>
              </p>

              <a href="/resetpassword" className="back-login">
                <span>{isArabic ? "→" : "←"}</span> {text.backReset}
              </a>

              <a href="/login" className="back-login">
                <span>{isArabic ? "→" : "←"}</span> {text.backLogin}
              </a>
            </div>
          </div>
        </div>

        <div className="reset-code-right">
          <div className="reset-code-visual-card">
            <img
              src={signInImage}
              alt="Password reset visual"
              className="reset-code-right-image"
            />

            <div className="reset-code-visual-overlay">
              <h2>{text.visualTitle}</h2>

              <p>{text.visualSubtitle}</p>

              <div className="reset-code-review-row">
                <div className="reset-code-profile-stack">
                  {profiles.map((profile, index) => (
                    <img
                      key={index}
                      src={profile}
                      alt={`Reviewer ${index + 1}`}
                      className="reset-code-profile-img"
                    />
                  ))}
                </div>

                <div className="reset-code-rating">
                  <span>{text.consultations}</span>

                  <div className="reset-code-stars">
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

export default PasswordResetCode;