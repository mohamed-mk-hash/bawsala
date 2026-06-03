import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";

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

const RESET_TEXT = {
  en: {
    title: "Forgot password?",
    subtitle: "No worries, we’ve got you!",
    email: "Email",
    emailPlaceholder: "olivia@untitledui.com",
    submit: "Reset password",
    loading: "Checking email...",
    backLogin: "Back to log in",
    emailRequired: "Please enter your email.",
    emailNotFound: "No account was found with this email.",
    googleAccount:
      "This email uses Google sign-in. Please continue with Google instead.",
    invalidEmail: "Please enter a valid email address.",
    sent: "We sent you a password reset email.",
    visualTitle: "Your business. Our consultations we ‘re in this together",
    visualSubtitle:
      "Strategic consulting designed to align with your goals, solve real challenges, and grow your business — side by side.",
    consultations: "More then 100+ consultations",
  },

  fr: {
    title: "Mot de passe oublié ?",
    subtitle: "Pas d’inquiétude, nous sommes là pour vous aider !",
    email: "Email",
    emailPlaceholder: "olivia@untitledui.com",
    submit: "Réinitialiser le mot de passe",
    loading: "Vérification de l’email...",
    backLogin: "Retour à la connexion",
    emailRequired: "Veuillez entrer votre email.",
    emailNotFound: "Aucun compte trouvé avec cet email.",
    googleAccount:
      "Cet email utilise la connexion Google. Veuillez continuer avec Google.",
    invalidEmail: "Veuillez entrer une adresse email valide.",
    sent: "Nous vous avons envoyé un email de réinitialisation.",
    visualTitle: "Votre entreprise. Nos consultations, ensemble",
    visualSubtitle:
      "Un accompagnement stratégique conçu pour s’aligner avec vos objectifs, résoudre vos défis réels et faire grandir votre entreprise — côte à côte.",
    consultations: "Plus de 100 consultations",
  },

  ar: {
    title: "نسيت كلمة المرور؟",
    subtitle: "لا تقلق، نحن هنا لمساعدتك!",
    email: "البريد الإلكتروني",
    emailPlaceholder: "olivia@untitledui.com",
    submit: "إعادة تعيين كلمة المرور",
    loading: "جاري التحقق من البريد...",
    backLogin: "العودة إلى تسجيل الدخول",
    emailRequired: "يرجى إدخال البريد الإلكتروني.",
    emailNotFound: "لا يوجد حساب بهذا البريد الإلكتروني.",
    googleAccount:
      "هذا البريد يستعمل تسجيل الدخول عبر Google. يرجى المتابعة باستخدام Google.",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح.",
    sent: "أرسلنا لك رسالة إعادة تعيين كلمة المرور.",
    visualTitle: "عملك. واستشاراتنا معاً في نفس الطريق",
    visualSubtitle:
      "استشارات استراتيجية مصممة لتتوافق مع أهدافك، وتعالج تحدياتك الحقيقية، وتساعد عملك على النمو خطوة بخطوة.",
    consultations: "أكثر من 100 استشارة",
  },
};

const getFirebaseErrorMessage = (error, text) => {
  const code = error?.code;

  if (code === "auth/invalid-email") return text.invalidEmail;
  if (code === "auth/user-not-found") return text.emailNotFound;

  return text.emailNotFound;
};

const ResetPassword = () => {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isArabic = language === "ar";
  const text = RESET_TEXT[language] || RESET_TEXT.en;

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

  const findUserByEmail = async (cleanedEmail) => {
    const emailOptions = Array.from(
      new Set([cleanedEmail, cleanedEmail.toLowerCase()])
    );

    const usersQuery = query(
      collection(db, "users"),
      where("email", "in", emailOptions)
    );

    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanedEmail = email.trim();

    if (!cleanedEmail) {
      setError(text.emailRequired);
      return;
    }

    try {
      setLoading(true);

      const existingUser = await findUserByEmail(cleanedEmail);

      if (!existingUser) {
        setError(text.emailNotFound);
        return;
      }

      if (existingUser.provider === "google") {
        setError(text.googleAccount);
        return;
      }

      await sendPasswordResetEmail(auth, cleanedEmail);

      sessionStorage.setItem("reset_password_email", cleanedEmail);
      setMessage(text.sent);

      navigate("/resetpasswordcode");
    } catch (error) {
  console.log("Reset password error:", error.code, error.message);
  setError(getFirebaseErrorMessage(error, text));
} finally {
  setLoading(false);
}
  };

  return (
    <div
      className={`reset-page ${isArabic ? "reset-page--rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="reset-container">
        <div className="reset-left">
          <div className="reset-form-wrapper">
            <div className="reset-top-bar reset-top-bar--no-language">
              <div className="reset-logo">
                <img src={logo} alt="Bawsala Logo" />
              </div>
            </div>

            <div className="reset-content">
              <h1>{text.title}</h1>

              <p className="reset-subtitle">{text.subtitle}</p>

              <form className="reset-form" onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="email">{text.email}</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={text.emailPlaceholder}
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <p className="auth-message auth-message--error">{error}</p>
                )}

                {message && (
                  <p className="auth-message auth-message--success">
                    {message}
                  </p>
                )}

                <button type="submit" className="reset-btn" disabled={loading}>
                  {loading ? text.loading : text.submit}
                </button>
              </form>

              <a href="/login" className="back-login">
                <span>{isArabic ? "→" : "←"}</span> {text.backLogin}
              </a>
            </div>
          </div>
        </div>

        <div className="reset-right">
          <div className="reset-visual-card">
            <img
              src={signInImage}
              alt="Reset password visual"
              className="reset-right-image"
            />

            <div className="reset-visual-overlay">
              <h2>{text.visualTitle}</h2>

              <p>{text.visualSubtitle}</p>

              <div className="reset-review-row">
                <div className="reset-profile-stack">
                  {profiles.map((profile, index) => (
                    <img
                      key={index}
                      src={profile}
                      alt={`Reviewer ${index + 1}`}
                      className="reset-profile-img"
                    />
                  ))}
                </div>

                <div className="reset-rating">
                  <span>{text.consultations}</span>

                  <div className="reset-stars">
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

export default ResetPassword;