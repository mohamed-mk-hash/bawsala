import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Setnewpassword.css";

import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";

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

const SET_PASSWORD_TEXT = {
  en: {
    title: "Set a new password",
    subtitle: "Must be at least 8 characters.",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordPlaceholder: "••••••••",
    submit: "Reset Password",
    loading: "Resetting password...",
    checking: "Checking reset link...",
    invalidLink:
      "This password reset link is invalid or expired. Please request a new one.",
    passwordRequired: "Please enter your new password.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordsDoNotMatch: "Passwords do not match.",
    tryAgain: "Request a new link",
    account: "Account",
    visualTitle: "Your business. Our consultations we ‘re in this together",
    visualSubtitle:
      "Strategic consulting designed to align with your goals, solve real challenges, and grow your business — side by side.",
    consultations: "More then 100+ consultations",
  },

  fr: {
    title: "Définir un nouveau mot de passe",
    subtitle: "Il doit contenir au moins 8 caractères.",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    passwordPlaceholder: "••••••••",
    submit: "Réinitialiser le mot de passe",
    loading: "Réinitialisation...",
    checking: "Vérification du lien...",
    invalidLink:
      "Ce lien de réinitialisation est invalide ou expiré. Veuillez en demander un nouveau.",
    passwordRequired: "Veuillez entrer votre nouveau mot de passe.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    tryAgain: "Demander un nouveau lien",
    account: "Compte",
    visualTitle: "Votre entreprise. Nos consultations, ensemble",
    visualSubtitle:
      "Un accompagnement stratégique conçu pour s’aligner avec vos objectifs, résoudre vos défis réels et faire grandir votre entreprise — côte à côte.",
    consultations: "Plus de 100 consultations",
  },

  ar: {
    title: "تعيين كلمة مرور جديدة",
    subtitle: "يجب أن تتكوّن من 8 أحرف على الأقل.",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    passwordPlaceholder: "••••••••",
    submit: "إعادة تعيين كلمة المرور",
    loading: "جاري تغيير كلمة المرور...",
    checking: "جاري التحقق من الرابط...",
    invalidLink:
      "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
    passwordRequired: "يرجى إدخال كلمة المرور الجديدة.",
    passwordTooShort: "يجب أن تتكوّن كلمة المرور من 8 أحرف على الأقل.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    tryAgain: "طلب رابط جديد",
    account: "الحساب",
    visualTitle: "عملك. واستشاراتنا معاً في نفس الطريق",
    visualSubtitle:
      "استشارات استراتيجية مصممة لتتوافق مع أهدافك، وتعالج تحدياتك الحقيقية، وتساعد عملك على النمو خطوة بخطوة.",
    consultations: "أكثر من 100 استشارة",
  },
};

const Setnewpassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [password, setPassword] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [checkingCode, setCheckingCode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [error, setError] = useState("");

  const isArabic = language === "ar";
  const text = SET_PASSWORD_TEXT[language] || SET_PASSWORD_TEXT.en;

  const profiles = [profile1, reviewFeaturedImage, profile3, profile2];

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

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

  useEffect(() => {
    const verifyCode = async () => {
      setCheckingCode(true);
      setLinkError("");

      if (!oobCode || mode !== "resetPassword") {
        setLinkError(text.invalidLink);
        setCheckingCode(false);
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setAccountEmail(email);
      } catch (error) {
        setLinkError(text.invalidLink);
      } finally {
        setCheckingCode(false);
      }
    };

    verifyCode();
  }, [oobCode, mode, text.invalidLink]);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");

    if (!password) {
      setError(text.passwordRequired);
      return;
    }

    if (password.length < 8) {
      setError(text.passwordTooShort);
      return;
    }

    if (password !== confirmPasswordValue) {
      setError(text.passwordsDoNotMatch);
      return;
    }

    try {
      setLoading(true);

      await confirmPasswordReset(auth, oobCode, password);

      sessionStorage.removeItem("reset_password_email");

      navigate("/alldone", { replace: true });
    } catch (error) {
      setError(text.invalidLink);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`set-password-page ${isArabic ? "set-password-page--rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="set-password-container">
        <div className="set-password-left">
          <div className="set-password-form-wrapper">
            <div className="set-password-top-bar">
              <div className="set-password-logo">
                <img src={logo} alt="Bawsala Logo" />
              </div>
            </div>

            <div className="set-password-content">
              <h1>{text.title}</h1>

              <p className="set-password-subtitle">
                {checkingCode ? text.checking : text.subtitle}
              </p>

              {accountEmail && (
                <p className="set-password-subtitle">
                  {text.account}: <strong>{accountEmail}</strong>
                </p>
              )}

              {linkError ? (
                <>
                  <p className="auth-message auth-message--error">
                    {linkError}
                  </p>

                  <a href="/resetpassword" className="continue-btn link-as-btn">
                    {text.tryAgain}
                  </a>
                </>
              ) : (
                <form
                  className="set-password-form"
                  onSubmit={handleResetPassword}
                >
                  <div className="form-group">
                    <label htmlFor="password">{text.password}</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={text.passwordPlaceholder}
                      autoComplete="new-password"
                      disabled={checkingCode || loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      {text.confirmPassword}
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPasswordValue}
                      onChange={(event) =>
                        setConfirmPasswordValue(event.target.value)
                      }
                      placeholder={text.passwordPlaceholder}
                      autoComplete="new-password"
                      disabled={checkingCode || loading}
                    />
                  </div>

                  {error && (
                    <p className="auth-message auth-message--error">{error}</p>
                  )}

                  <button
                    type="submit"
                    className="continue-btn"
                    disabled={checkingCode || loading}
                  >
                    {loading ? text.loading : text.submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="set-password-right">
          <div className="set-password-visual-card">
            <img
              src={signInImage}
              alt="Set new password visual"
              className="set-password-right-image"
            />

            <div className="set-password-visual-overlay">
              <h2>{text.visualTitle}</h2>

              <p>{text.visualSubtitle}</p>

              <div className="set-password-review-row">
                <div className="set-password-profile-stack">
                  {profiles.map((profile, index) => (
                    <img
                      key={index}
                      src={profile}
                      alt={`Reviewer ${index + 1}`}
                      className="set-password-profile-img"
                    />
                  ))}
                </div>

                <div className="set-password-rating">
                  <span>{text.consultations}</span>

                  <div className="set-password-stars">
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

export default Setnewpassword;