import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";

import { auth, db } from "../firebase";

import logo from "../assets/bawsala-logo.png";
import cartIcon from "../assets/Cart.png";
import menuIcon from "../assets/menu.png";
import usaFlag from "../assets/united-states.png";
import saudiFlag from "../assets/saudi.png";
import defaultProfileImage from "../assets/manager_product.png";

const ChevronDown = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar") return "Arabic";
  if (savedLanguage === "en") return "English";

  return "English";
};

const getLanguageCode = (language) => {
  return language === "Arabic" ? "ar" : "en";
};

const NAV_LABELS = {
  en: {
    home: "Home",
    about: "About us",
    services: "Services",
    courses: "Courses",
    products: "Products",
    blog: "Blogs",
    contact: "Contact us",
    login: "Log in",
    signup: "Sign up",
    profile: "My profile",
    dashboard: "Dashboard",
    logout: "Log out",
    cart: "Cart",
    menu: "Menu",
  },
  ar: {
    home: "الرئيسية",
    about: "من نحن",
    services: "الخدمات",
    courses: "الدورات",
    products: "المنتجات",
    blog: "المدونة",
    contact: "اتصل بنا",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    profile: "ملفي الشخصي",
    dashboard: "لوحة التحكم",
    logout: "تسجيل الخروج",
    cart: "السلة",
    menu: "القائمة",
  },
};

function NavItem({ label, to = "/", onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
    >
      <span>{label}</span>
    </NavLink>
  );
}

export default function Header() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [localProfile, setLocalProfile] = useState({
    displayName: "",
    photoURL: "",
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  const languageCode = getLanguageCode(language);
  const isArabic = languageCode === "ar";

  const selectedFlag = isArabic ? saudiFlag : usaFlag;
  const labels = NAV_LABELS[languageCode];

  const closeMenus = () => {
    setIsLanguageOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const loadLocalProfile = (user) => {
    if (!user) {
      setLocalProfile({
        displayName: "",
        photoURL: "",
      });
      return;
    }

    const savedProfile = JSON.parse(
      localStorage.getItem(`user_profile_${user.uid}`) || "{}"
    );

    setLocalProfile({
      displayName: savedProfile.displayName || user.displayName || "",
      photoURL: savedProfile.photoURL || user.photoURL || "",
    });
  };

  useEffect(() => {
    localStorage.setItem("site_language", languageCode);

    document.documentElement.lang = languageCode;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";

    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: {
          language: languageCode,
        },
      })
    );
  }, [languageCode, isArabic]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      loadLocalProfile(user);

      if (!user) {
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setCartCount(0);
      return undefined;
    }

    const cartRef = collection(db, "users", currentUser.uid, "cart");

    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        setCartCount(snapshot.size);
      },
      (error) => {
        console.error("Cart count error:", error);
        setCartCount(0);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      loadLocalProfile(auth.currentUser);
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdated);

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".languageBox")) {
        setIsLanguageOpen(false);
      }

      if (!event.target.closest(".profileBox")) {
        setIsProfileOpen(false);
      }

      if (
        !event.target.closest(".mobileMenuBox") &&
        !event.target.closest(".mobileMenuButton")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setIsLanguageOpen(false);
  };

  const handleGoToDashboard = () => {
    closeMenus();
    navigate("/UserDashboard");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeMenus();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const profileImage =
    localProfile.photoURL || currentUser?.photoURL || defaultProfileImage;

  const profileName =
    localProfile.displayName || currentUser?.displayName || labels.profile;

  return (
    <header className="pageTop" dir={isArabic ? "rtl" : "ltr"}>
      <div className="headerBox">
        <div className="left">
          <NavLink to="/" onClick={closeMenus}>
            <img className="logo" src={logo} alt="Bawsala" />
          </NavLink>
        </div>

        <nav className="nav">
          <NavItem label={labels.home} to="/" />
          <NavItem label={labels.about} to="/about" />
          <NavItem label={labels.services} to="/services" />
          <NavItem label={labels.courses} to="/courses" />
          <NavItem label={labels.products} to="/products" />
          <NavItem label={labels.blog} to="/blog" />
          <NavItem label={labels.contact} to="/contact" />
        </nav>

        <div className="mobileCenterActions">
          <NavLink
            className="cartBtn"
            to="/cart"
            aria-label={labels.cart}
            onClick={closeMenus}
          >
            <img className="cartIcon" src={cartIcon} alt={labels.cart} />
            {cartCount > 0 && <span className="cartBadge">{cartCount}</span>}
          </NavLink>

          <div className="languageBox">
            <button
              className="languageBtn"
              type="button"
              onClick={() => setIsLanguageOpen((previous) => !previous)}
            >
              <img className="flagIcon" src={selectedFlag} alt={language} />
              <span>{language}</span>
              <ChevronDown size={14} />
            </button>

            {isLanguageOpen && (
              <div className="languageMenu">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("English")}
                >
                  <img className="flagIcon" src={usaFlag} alt="English" />
                  English
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange("Arabic")}
                >
                  <img className="flagIcon" src={saudiFlag} alt="Arabic" />
                  العربية
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="right">
          <NavLink className="cartBtn desktopCartBtn" to="/cart" aria-label={labels.cart}>
            <img className="cartIcon" src={cartIcon} alt={labels.cart} />
            {cartCount > 0 && <span className="cartBadge">{cartCount}</span>}
          </NavLink>

          <div className="languageBox desktopLanguageBox">
            <button
              className="languageBtn"
              type="button"
              onClick={() => setIsLanguageOpen((previous) => !previous)}
            >
              <img className="flagIcon" src={selectedFlag} alt={language} />
              <span>{language}</span>
              <ChevronDown size={14} />
            </button>

            {isLanguageOpen && (
              <div className="languageMenu">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("English")}
                >
                  <img className="flagIcon" src={usaFlag} alt="English" />
                  English
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange("Arabic")}
                >
                  <img className="flagIcon" src={saudiFlag} alt="Arabic" />
                  العربية
                </button>
              </div>
            )}
          </div>

          {!currentUser ? (
            <>
              <NavLink className="login desktopAuthLink" to="/login">
                {labels.login}
              </NavLink>

              <NavLink className="signup desktopAuthLink" to="/signin">
                {labels.signup}
              </NavLink>
            </>
          ) : (
            <div className="profileBox desktopProfileBox">
              <button
                type="button"
                className="profileBtn"
                onClick={() => setIsProfileOpen((previous) => !previous)}
              >
                <img
                  className="profileImage"
                  src={profileImage}
                  alt={profileName}
                />
              </button>

              {isProfileOpen && (
                <div className="profileMenu">
                  <div className="profileInfo">
                    <strong>{profileName}</strong>
                    <span>{currentUser.email}</span>
                  </div>

                  <button type="button" onClick={handleGoToDashboard}>
                    {labels.profile}
                  </button>

                  <button type="button" onClick={handleLogout}>
                    {labels.logout}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="mobileMenuButton"
          onClick={() => setIsMobileMenuOpen((previous) => !previous)}
          aria-label={labels.menu}
        >
          <img src={menuIcon} alt="" />
        </button>

        {isMobileMenuOpen && (
          <div className="mobileMenuBox">
            <nav className="mobileNav">
              <NavItem label={labels.home} to="/" onClick={closeMenus} />
              <NavItem label={labels.about} to="/about" onClick={closeMenus} />
              <NavItem
                label={labels.services}
                to="/services"
                onClick={closeMenus}
              />
              <NavItem
                label={labels.courses}
                to="/courses"
                onClick={closeMenus}
              />
              <NavItem
                label={labels.products}
                to="/products"
                onClick={closeMenus}
              />
              <NavItem label={labels.blog} to="/blog" onClick={closeMenus} />
              <NavItem
                label={labels.contact}
                to="/contact"
                onClick={closeMenus}
              />
            </nav>

            <div className="mobileMenuDivider"></div>

            {!currentUser ? (
              <div className="mobileAuthActions">
                <NavLink className="login mobileLogin" to="/login" onClick={closeMenus}>
                  {labels.login}
                </NavLink>

                <NavLink className="signup mobileSignup" to="/signin" onClick={closeMenus}>
                  {labels.signup}
                </NavLink>
              </div>
            ) : (
              <div className="mobileProfilePanel">
                <div className="mobileProfileInfo">
                  <img src={profileImage} alt={profileName} />

                  <div>
                    <strong>{profileName}</strong>
                    <span>{currentUser.email}</span>
                  </div>
                </div>

                <button type="button" onClick={handleGoToDashboard}>
                  {labels.profile}
                </button>

                <button type="button" onClick={handleLogout}>
                  {labels.logout}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}