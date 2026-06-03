import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase";

import principlesImg from "../../assets/principales.jpg";
import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";
import headerBackground from "../../assets/carrer_header_background.png";
import heroRight from "../../assets/About_Hero.jpg";
import aboutArtDown from "../../assets/about_art_down.jpg";
import bawsalaLogo from "../../assets/bawsala-logo.png";
import createImpactBg from "../../assets/create_impact.png";

import teamProfile from "../../assets/profile2.jpg";
import profileOverlay from "../../assets/BAWSALA_1-removebg-preview 1.jpg";
import FaTwitter from "../../assets/x.png";
import FaLinkedinIn from "../../assets/linkedin.png";
import FiGlobe from "../../assets/globe.png";

import "./About.css";
import "swiper/css";
import "swiper/css/navigation";

function useInView(
  options = { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    if (reduceMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

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

function PrinciplesSection({ aboutContent, language }) {
  const [ref, inView] = useInView();

  const intro = aboutContent?.intro || {};

  const principles = Array.isArray(aboutContent?.principles)
    ? aboutContent.principles
    : [];

  return (
    <section
      ref={ref}
      className={`principles reveal ${inView ? "is-inView" : ""}`}
    >
      <div className="principles__container">
        <p className="principles__intro reveal__item">
          {getLocalizedText(intro.headline, language)}
        </p>

        <div className="principles__topGrid">
          <div className="principles__imageWrap reveal__item">
            <img
              className="principles__image"
              src={intro.imageUrl || principlesImg}
              alt=""
              loading="lazy"
            />
          </div>

          <div className="principles__about reveal__item">
            <img
              className="principles__logo"
              src={intro.logoUrl || bawsalaLogo}
              alt="Bawsala logo"
              loading="lazy"
            />

            <p>{getLocalizedText(intro.paragraphOne, language)}</p>

            <p>{getLocalizedText(intro.paragraphTwo, language)}</p>
          </div>
        </div>

        <div className="principles__bottomGrid">
          <div className="principles__list">
            {principles.map((principle, index) => (
              <div
                className={`principles__item reveal__item ${
                  index === 0 ? "is-active" : ""
                }`}
                style={{ "--d": `${index * 90}ms` }}
                key={index}
              >
                <div className="principles__content">
                  <h3 className="principles__itemTitle">
                    {getLocalizedText(principle.title, language)}
                  </h3>

                  <p className="principles__itemDesc">
                    {getLocalizedText(principle.description, language)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="principles__imageWrap principles__imageWrap--down reveal__item">
            <img
              className="principles__image"
              src={intro.secondImageUrl || aboutArtDown}
              alt=""
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [approachRef, approachInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        setLoading(true);

        const documentRef = doc(db, "siteContent", "About");
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          setAboutContent(documentSnapshot.data());
        } else {
          setAboutContent(null);
          console.warn("Document siteContent/About does not exist.");
        }
      } catch (error) {
        console.error("Error loading about content:", error);
        setAboutContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
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

  if (loading) {
    return <main className="about-page" dir={isArabic ? "rtl" : "ltr"} />;
  }

  if (!aboutContent) {
    return null;
  }

  const hero = aboutContent.hero || {};
  const approach = aboutContent.approach || {};
  const missionValues = aboutContent.missionValues || {};
  const impact = aboutContent.impact || {};
  const team = aboutContent.team || {};

  const heroStats = Array.isArray(hero.stats) ? hero.stats : [];
  const approachItems = Array.isArray(approach.items) ? approach.items : [];
  const values = Array.isArray(missionValues.values)
    ? missionValues.values
    : [];
  const impactSteps = Array.isArray(impact.steps) ? impact.steps : [];
  const teamMembers = Array.isArray(team.members) ? team.members : [];

  return (
    <main className="about-page" dir={isArabic ? "rtl" : "ltr"}>
      <section
        className="about-hero"
        style={{
          backgroundImage: `url(${headerBackground})`,
        }}
      >
        <div className="about-hero-content">
          <div className="about-hero-text">
            <p className="about-hero-label">
              {getLocalizedText(hero.kicker, language)}
            </p>

            <h1 className="about-hero-title">
              {getLocalizedText(hero.title, language)}
            </h1>

            <p className="about-hero-description">
              {getLocalizedText(hero.subtitle, language)}
            </p>

            <div className="about-hero-stats">
              {heroStats.map((stat, index) => (
                <div className="about-hero-stat" key={index}>
                  <strong>{stat.value}</strong>
                  <span>{getLocalizedText(stat.label, language)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-hero-media">
            <img
              src={hero.videoImageUrl || heroRight}
              alt={isArabic ? "فريق بوصلة" : "Bawsala team meeting"}
            />

            {hero.videoUrl ? (
              <a
                href={hero.videoUrl}
                className="about-hero-play"
                aria-label="Play video"
              >
                <span></span>
              </a>
            ) : (
              <button
                type="button"
                className="about-hero-play"
                aria-label="Play video"
              >
                <span></span>
              </button>
            )}
          </div>
        </div>
      </section>

      <PrinciplesSection aboutContent={aboutContent} language={language} />

      <section
        ref={approachRef}
        className={`approach reveal ${approachInView ? "is-inView" : ""}`}
      >
        <div className="approach__container">
          <h2 className="approach__title reveal__item">
            {getLocalizedText(approach.title, language)}
          </h2>

          <p className="approach__subtitle reveal__item">
            {getLocalizedText(approach.subtitle, language)}
          </p>

          <div className="approach__card">
            {approachItems.map((item, index) => (
              <article
                className="approach__item reveal__item"
                style={{ "--d": `${index * 80}ms` }}
                key={index}
              >
                <span
                  className={`approach__dot approach__dot--${
                    item.dot === "orange" ? "amber" : item.dot || "blue"
                  }`}
                />

                <h3 className="approach__itemTitle">
                  {getLocalizedText(item.title, language)}
                </h3>

                <p className="approach__itemDesc">
                  {getLocalizedText(item.description, language)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mission-values">
        <div className="mission-values__container">
          <div className="mission-values__mission">
            <p className="mission-values__eyebrow">
              {getLocalizedText(missionValues.missionLabel, language)}
            </p>

            <h2 className="mission-values__missionText">
              {getLocalizedText(missionValues.missionText, language)}
            </h2>
          </div>

          <div className="mission-values__values">
            <p className="mission-values__eyebrow">
              {getLocalizedText(missionValues.valuesLabel, language)}
            </p>

            <div className="mission-values__grid">
              {values.map((item, index) => (
                <div className="mission-values__item" key={index}>
                  <span className="mission-values__line"></span>

                  <h3>{getLocalizedText(item.title, language)}</h3>

                  <p>{getLocalizedText(item.description, language)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="impact-section"
        style={{
          backgroundImage: `url(${createImpactBg})`,
        }}
      >
        <div className="impact-section__content">
          <div className="impact-section__header">
            <h2 className="impact-section__title">
              {getLocalizedText(impact.title, language)}
            </h2>

            <p className="impact-section__subtitle">
              {getLocalizedText(impact.subtitle, language)}
            </p>
          </div>

          <div className="impact-section__steps">
            {impactSteps.map((step, index) => (
              <div className="impact-section__step" key={index}>
                <span className="impact-section__number">{step.number}</span>

                <h3>{getLocalizedText(step.title, language)}</h3>

                <p>{getLocalizedText(step.description, language)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="team-section__container">
          <div className="team-section__header">
            <h2 className="team-section__title">
              {getLocalizedText(team.title, language)}
            </h2>

            <p className="team-section__subtitle">
              {getLocalizedText(team.subtitle, language)}
            </p>
          </div>

          <div className="team-section__grid">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={index}>
                <div className="team-card__imageWrap">
                  <img
                    src={member.imageUrl || teamProfile}
                    alt={member.name}
                    className="team-card__image"
                    loading="lazy"
                  />

                  <img
                    src={profileOverlay}
                    alt=""
                    className="team-card__overlay"
                    loading="lazy"
                  />
                </div>

                <div className="team-card__content">
                  <h3 className="team-card__name">{member.name}</h3>

                  <p className="team-card__role">
                    {getLocalizedText(member.role, language)}
                  </p>

                  <div className="team-card__socials">
                    <a
                      href={member.xUrl || "/"}
                      className="team-card__social"
                      aria-label="Twitter"
                    >
                      <img src={FaTwitter} alt="Twitter" />
                    </a>

                    <a
                      href={member.linkedinUrl || "/"}
                      className="team-card__social"
                      aria-label="LinkedIn"
                    >
                      <img src={FaLinkedinIn} alt="LinkedIn" />
                    </a>

                    <a
                      href={member.websiteUrl || "/"}
                      className="team-card__social"
                      aria-label="Website"
                    >
                      <img src={FiGlobe} alt="Website" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        className={`contactCta reveal ${ctaInView ? "is-inView" : ""}`}
      >
        <div className="contactCta__container">
          <div className="contactCta__card">
            <div className="contactCta__avatars" aria-hidden="true">
              <img
                className="contactCta__avatar contactCta__avatar--1"
                src={profile1}
                alt=""
              />

              <img
                className="contactCta__avatar contactCta__avatar--2"
                src={profile2}
                alt=""
              />

              <img
                className="contactCta__avatar contactCta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="contactCta__title reveal__item">
              {isArabic ? "ما زالت لديك أسئلة؟" : "Still have questions?"}
            </h3>

            <p className="contactCta__subtitle reveal__item">
              {isArabic
                ? "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا."
                : "Can’t find the answer you’re looking for? Please chat to our friendly team."}
            </p>

            <a className="contactCta__btn reveal__item" href="/contact">
              {isArabic ? "تواصل معنا" : "Get in touch"}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}