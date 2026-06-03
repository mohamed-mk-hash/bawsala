import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/bawsala-logo.png";

import facebookIcon from "../assets/facebook.png";
import instagramIcon from "../assets/instagram.png";
import linkedinIcon from "../assets/linkedin.png";
import xIcon from "../assets/x.png";

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
};

const FOOTER_TEXT = {
  en: {
    tagline:
      "Design amazing digital experiences that create more value in the world.",
    socialTitle: "Follow us",
    links: {
      home: "Home",
      about: "About us",
      services: "Services",
      courses: "Courses",
      products: "Products",
      blog: "Blogs",
      contact: "Contact us",
    },
    copy: "All rights reserved.",
  },
  ar: {
    tagline: "نصمم تجارب رقمية مميزة تساعد الأعمال على النمو وصناعة قيمة أكبر.",
    socialTitle: "تابعنا",
    links: {
      home: "الرئيسية",
      about: "من نحن",
      services: "الخدمات",
      courses: "الدورات",
      products: "المنتجات",
      blog: "المدونة",
      contact: "اتصل بنا",
    },
    copy: "جميع الحقوق محفوظة.",
  },
};

export default function Footer() {
  const year = new Date().getFullYear();

  const [language, setLanguage] = useState(getInitialLanguage);

  const isArabic = language === "ar";
  const text = FOOTER_TEXT[language];

  useEffect(() => {
    const handleLanguageChanged = (event) => {
      const newLanguage = event.detail?.language;

      if (newLanguage === "ar" || newLanguage === "en") {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener("languageChanged", handleLanguageChanged);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChanged);
    };
  }, []);

  return (
    <footer className="footer" dir={isArabic ? "rtl" : "ltr"}>
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/">
              <img className="footer__logo" src={logo} alt="Bawsala" />
            </Link>

            <p className="footer__tagline">{text.tagline}</p>
          </div>

          <nav className="footer__links" aria-label="Footer navigation">
            <ul className="footer__col">
              <li>
                <Link to="/">{text.links.home}</Link>
              </li>
              <li>
                <Link to="/about">{text.links.about}</Link>
              </li>
              <li>
                <Link to="/services">{text.links.services}</Link>
              </li>
              <li>
                <Link to="/courses">{text.links.courses}</Link>
              </li>
            </ul>

            <ul className="footer__col">
              <li>
                <Link to="/products">{text.links.products}</Link>
              </li>
              <li>
                <Link to="/blog">{text.links.blog}</Link>
              </li>
              <li>
                <Link to="/contact">{text.links.contact}</Link>
              </li>
            </ul>
          </nav>

          <div className="footer__socialBlock">
            <h4 className="footer__socialTitle">{text.socialTitle}</h4>

            <div className="footer__socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <img src={facebookIcon} alt="" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <img src={instagramIcon} alt="" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <img src={linkedinIcon} alt="" />
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <img src={xIcon} alt="" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer__divider" />

        <div className="footer__bottom">
          <p className="footer__copy">
            © {year} BAWSSALA. {text.copy}
          </p>
        </div>
      </div>
    </footer>
  );
}