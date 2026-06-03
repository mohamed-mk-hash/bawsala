import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
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

const LOGIN_TEXT = {
  en: {
    title: "Welcome Back",
    subtitle: "Welcome back! Please enter your details.",
    email: "Email",
    emailPlaceholder: "olivia@untitledui.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    remember: "Remember for 30 days",
    forgotPassword: "Forgot password?",
    submit: "Login",
    loading: "Logging in...",
    google: "Sign in with Google",
    googleLoading: "Connecting...",
    footerText: "Don’t have an account?",
    footerLink: "Sign up",
    backHome: "Back to home",
    emailRequired: "Please enter your email.",
    passwordRequired: "Please enter your password.",
    visualTitle: "Your business. Our consultations we ‘re in this together",
    visualSubtitle:
      "Strategic consulting designed to align with your goals, solve real challenges, and grow your business — side by side.",
    consultations: "More then 100+ consultations",
  },

  fr: {
    title: "Bon retour",
    subtitle: "Bienvenue ! Veuillez entrer vos informations.",
    email: "Email",
    emailPlaceholder: "olivia@untitledui.com",
    password: "Mot de passe",
    passwordPlaceholder: "••••••••",
    remember: "Se souvenir pendant 30 jours",
    forgotPassword: "Mot de passe oublié ?",
    submit: "Connexion",
    loading: "Connexion...",
    google: "Se connecter avec Google",
    googleLoading: "Connexion...",
    footerText: "Vous n’avez pas de compte ?",
    footerLink: "Créer un compte",
    backHome: "Retour à l’accueil",
    emailRequired: "Veuillez entrer votre email.",
    passwordRequired: "Veuillez entrer votre mot de passe.",
    visualTitle: "Votre entreprise. Nos consultations, ensemble",
    visualSubtitle:
      "Un accompagnement stratégique conçu pour s’aligner avec vos objectifs, résoudre vos défis réels et faire grandir votre entreprise — côte à côte.",
    consultations: "Plus de 100 consultations",
  },

  ar: {
    title: "مرحباً بعودتك",
    subtitle: "مرحباً بك! يرجى إدخال معلوماتك.",
    email: "البريد الإلكتروني",
    emailPlaceholder: "olivia@untitledui.com",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    remember: "تذكرني لمدة 30 يوماً",
    forgotPassword: "نسيت كلمة المرور؟",
    submit: "تسجيل الدخول",
    loading: "جاري تسجيل الدخول...",
    google: "المتابعة باستخدام Google",
    googleLoading: "جاري الاتصال...",
    footerText: "ليس لديك حساب؟",
    footerLink: "إنشاء حساب",
    backHome: "العودة للرئيسية",
    emailRequired: "يرجى إدخال البريد الإلكتروني.",
    passwordRequired: "يرجى إدخال كلمة المرور.",
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
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account was found with this email.",
      "auth/wrong-password": "Incorrect email or password.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
      default: "Something went wrong. Please try again.",
    },

    fr: {
      "auth/invalid-email": "Veuillez entrer une adresse email valide.",
      "auth/user-disabled": "Ce compte a été désactivé.",
      "auth/user-not-found": "Aucun compte trouvé avec cet email.",
      "auth/wrong-password": "Email ou mot de passe incorrect.",
      "auth/invalid-credential": "Email ou mot de passe incorrect.",
      "auth/popup-closed-by-user":
        "La connexion Google a été fermée avant la fin.",
      default: "Une erreur s’est produite. Veuillez réessayer.",
    },

    ar: {
      "auth/invalid-email": "يرجى إدخال بريد إلكتروني صحيح.",
      "auth/user-disabled": "تم تعطيل هذا الحساب.",
      "auth/user-not-found": "لا يوجد حساب بهذا البريد الإلكتروني.",
      "auth/wrong-password": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
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

const Login = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const navigate = useNavigate();
const [searchParams] = useSearchParams();
const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const isArabic = language === "ar";
  const text = LOGIN_TEXT[language] || LOGIN_TEXT.en;

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

  const applyAuthPersistence = async () => {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  };

  const saveGoogleUserToFirestore = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      fullName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      provider: "google",
      preferredLanguage: language,
      rememberMe,
      updatedAt: serverTimestamp(),
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

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanedEmail = email.trim();

    if (!cleanedEmail) {
      setError(text.emailRequired);
      return;
    }

    if (!password) {
      setError(text.passwordRequired);
      return;
    }

    try {
      setLoading(true);

      await applyAuthPersistence();

      await signInWithEmailAndPassword(auth, cleanedEmail, password);

      navigate(redirectPath);
    } catch (error) {
      setError(getFirebaseErrorMessage(error, language));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      setGoogleLoading(true);

      await applyAuthPersistence();

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await saveGoogleUserToFirestore(user);

      navigate(redirectPath);
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

            <form className="signin-form" onSubmit={handleEmailLogin}>
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
                  autoComplete="current-password"
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
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
              >
                <img src={googleIcon} alt="Google" className="social-btn-icon" />
                <span>{googleLoading ? text.googleLoading : text.google}</span>
              </button>
            </form>

            <p className="signin-footer-text">
              {text.footerText} <a href="/signin">{text.footerLink}</a>
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

export default Login;