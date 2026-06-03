import React, { useEffect, useState } from "react";
import "./SignIn.css";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db, googleProvider } from "../../firebase";

import logo from "../../assets/bawsala-logo.png";
import signInImage from "../../assets/sign_in.jpg";
import googleIcon from "../../assets/google_icon.png";

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

const SIGNIN_TEXT = {
  en: {
    title: "Welcome to Bawsala",
    subtitle: "Welcome back! Please enter your details.",
    fullName: "Full name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "olivia@untitledui.com",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordPlaceholder: "••••••••",
    remember: "Remember for 30 days",
    forgotPassword: "Forgot password?",
    submit: "Create account",
    loading: "Creating account...",
    google: "Sign up with Google",
    googleLoading: "Connecting...",
    footerText: "Already have an account?",
    footerLink: "Login",
    backHome: "Back to home",
    fullNameRequired: "Please enter your full name.",
    emailRequired: "Please enter your email.",
    passwordRequired: "Please enter your password.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordsDoNotMatch: "Passwords do not match.",
    accountCreated: "Account created successfully.",
    visualTitle: "Your business. Our consultations we ‘re in this together",
    visualSubtitle:
      "Strategic consulting designed to align with your goals, solve real challenges, and grow your business — side by side.",
    consultations: "More then 100+ consultations",
  },

  fr: {
    title: "Bienvenue à Bawsala",
    subtitle: "Bienvenue ! Veuillez entrer vos informations.",
    fullName: "Nom complet",
    fullNamePlaceholder: "Entrez votre nom complet",
    email: "Email",
    emailPlaceholder: "olivia@untitledui.com",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    passwordPlaceholder: "••••••••",
    remember: "Se souvenir pendant 30 jours",
    forgotPassword: "Mot de passe oublié ?",
    submit: "Créer un compte",
    loading: "Création du compte...",
    google: "S’inscrire avec Google",
    googleLoading: "Connexion...",
    footerText: "Vous avez déjà un compte ?",
    footerLink: "Connexion",
    backHome: "Retour à l’accueil",
    fullNameRequired: "Veuillez entrer votre nom complet.",
    emailRequired: "Veuillez entrer votre email.",
    passwordRequired: "Veuillez entrer votre mot de passe.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    accountCreated: "Compte créé avec succès.",
    visualTitle: "Votre entreprise. Nos consultations, ensemble",
    visualSubtitle:
      "Un accompagnement stratégique conçu pour s’aligner avec vos objectifs, résoudre vos défis réels et faire grandir votre entreprise — côte à côte.",
    consultations: "Plus de 100 consultations",
  },

  ar: {
    title: "مرحباً بك في بوصلة",
    subtitle: "مرحباً بك! يرجى إدخال معلوماتك.",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    email: "البريد الإلكتروني",
    emailPlaceholder: "olivia@untitledui.com",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    passwordPlaceholder: "••••••••",
    remember: "تذكرني لمدة 30 يوماً",
    forgotPassword: "نسيت كلمة المرور؟",
    submit: "إنشاء حساب",
    loading: "جاري إنشاء الحساب...",
    google: "المتابعة باستخدام Google",
    googleLoading: "جاري الاتصال...",
    footerText: "لديك حساب بالفعل؟",
    footerLink: "تسجيل الدخول",
    backHome: "العودة للرئيسية",
    fullNameRequired: "يرجى إدخال الاسم الكامل.",
    emailRequired: "يرجى إدخال البريد الإلكتروني.",
    passwordRequired: "يرجى إدخال كلمة المرور.",
    passwordTooShort: "يجب أن تتكوّن كلمة المرور من 8 أحرف على الأقل.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    accountCreated: "تم إنشاء الحساب بنجاح.",
    visualTitle: "عملك. واستشاراتنا معاً في نفس الطريق",
    visualSubtitle:
      "استشارات استراتيجية مصممة لتتوافق مع أهدافك، وتعالج تحدياتك الحقيقية، وتساعد عملك على النمو خطوة بخطوة.",
    consultations: "أكثر من 100 استشارة",
  },
};

const getFirebaseErrorMessage = (error, language) => {
  const code = error?.code;

  const messages = {
    en: {
      "auth/email-already-in-use": "This email is already in use.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password is too weak.",
      "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
      default: "Something went wrong. Please try again.",
    },

    fr: {
      "auth/email-already-in-use": "Cet email est déjà utilisé.",
      "auth/invalid-email": "Veuillez entrer une adresse email valide.",
      "auth/weak-password": "Le mot de passe est trop faible.",
      "auth/popup-closed-by-user":
        "La connexion Google a été fermée avant la fin.",
      default: "Une erreur s’est produite. Veuillez réessayer.",
    },

    ar: {
      "auth/email-already-in-use": "هذا البريد الإلكتروني مستعمل من قبل.",
      "auth/invalid-email": "يرجى إدخال بريد إلكتروني صحيح.",
      "auth/weak-password": "كلمة المرور ضعيفة.",
      "auth/popup-closed-by-user": "تم إغلاق نافذة Google قبل إكمال العملية.",
      default: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    },
  };

  return (
    messages[language]?.[code] ||
    messages[language]?.default ||
    messages.en.default
  );
};

const SignIn = () => {
  const [language, setLanguage] = useState(getInitialLanguage);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isArabic = language === "ar";
  const text = SIGNIN_TEXT[language] || SIGNIN_TEXT.en;

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

  const saveUserToFirestore = async (user, provider, extraData = {}) => {
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      fullName: user.displayName || extraData.fullName || "",
      email: user.email || extraData.email || "",
      photoURL: user.photoURL || "",
      provider,
      preferredLanguage: language,
      updatedAt: serverTimestamp(),
      ...extraData,
    };

    if (userSnapshot.exists()) {
      await setDoc(userRef, userData, { merge: true });
      return;
    }

    await setDoc(userRef, {
      ...userData,
      role: "user",
      status: "active",
      createdAt: serverTimestamp(),
    });
  };

  const applyAuthPersistence = async () => {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  };

  const handleEmailSignUp = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanedFullName = fullName.trim();
    const cleanedEmail = email.trim();

    if (!cleanedFullName) {
      setError(text.fullNameRequired);
      return;
    }

    if (!cleanedEmail) {
      setError(text.emailRequired);
      return;
    }

    if (!password) {
      setError(text.passwordRequired);
      return;
    }

    if (password.length < 8) {
      setError(text.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(text.passwordsDoNotMatch);
      return;
    }

    try {
      setLoading(true);

      await applyAuthPersistence();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanedEmail,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: cleanedFullName,
      });

      await saveUserToFirestore(user, "password", {
        fullName: cleanedFullName,
        email: cleanedEmail,
        rememberMe,
      });

      setSuccess(text.accountCreated);

      window.location.href = "/";
    } catch (error) {
      setError(getFirebaseErrorMessage(error, language));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setSuccess("");

    try {
      setGoogleLoading(true);

      await applyAuthPersistence();

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await saveUserToFirestore(user, "google", {
        rememberMe,
      });

      window.location.href = "/";
    } catch (error) {
      setError(getFirebaseErrorMessage(error, language));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className={`signin-page ${isArabic ? "signin-page--rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="signin-container">
        <div className="signin-left">
          <div className="signin-form-wrapper">
            <div className="signin-top-bar signin-top-bar--no-language">
              <div className="signin-logo">
                <img src={logo} alt="Bawsala Logo" />
              </div>
            </div>

            <h1>{text.title}</h1>

            <p className="signin-subtitle">{text.subtitle}</p>

            <form className="signin-form" onSubmit={handleEmailSignUp}>
              <div className="form-group">
                <label htmlFor="name">{text.fullName}</label>
                <input
                  type="text"
                  id="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder={text.fullNamePlaceholder}
                  autoComplete="name"
                />
              </div>

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

              <div className="form-group">
                <label htmlFor="password">{text.password}</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={text.passwordPlaceholder}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">{text.confirmPassword}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={text.passwordPlaceholder}
                  autoComplete="new-password"
                />
              </div>

              <div className="signin-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>{text.remember}</span>
                </label>

                <a href="/resetpassword" className="forgot-password">
                  {text.forgotPassword}
                </a>
              </div>

              {error && (
                <p className="auth-message auth-message--error">{error}</p>
              )}

              {success && (
                <p className="auth-message auth-message--success">{success}</p>
              )}

              <button
                type="submit"
                className="signin-btn"
                disabled={loading || googleLoading}
              >
                {loading ? text.loading : text.submit}
              </button>

              <button
                type="button"
                className="social-btn"
                onClick={handleGoogleSignUp}
                disabled={loading || googleLoading}
              >
                <img src={googleIcon} alt="Google" className="social-btn-icon" />
                <span>{googleLoading ? text.googleLoading : text.google}</span>
              </button>
            </form>

            <p className="signin-footer-text">
              {text.footerText} <a href="/login">{text.footerLink}</a>
            </p>

            <a href="/" className="back-home">
              <span>{isArabic ? "→" : "←"}</span> {text.backHome}
            </a>
          </div>
        </div>

        <div className="signin-right">
          <div className="signin-visual-card">
            <img
              src={signInImage}
              alt="Sign in visual"
              className="signin-right-image"
            />

            <div className="signin-visual-overlay">
              <h2>{text.visualTitle}</h2>

              <p>{text.visualSubtitle}</p>

              <div className="signin-review-row">
                <div className="signin-profile-stack">
                  {profiles.map((profile, index) => (
                    <img
                      key={index}
                      src={profile}
                      alt={`Reviewer ${index + 1}`}
                      className="signin-profile-img"
                    />
                  ))}
                </div>

                <div className="signin-rating">
                  <span>{text.consultations}</span>

                  <div className="signin-stars">
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

export default SignIn;