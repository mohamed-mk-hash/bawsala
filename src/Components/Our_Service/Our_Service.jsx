import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import "./Our_Service.css";

import { db } from "../../firebase";

import managementIcon from "../../assets/management_devlopement.png";
import planningIcon from "../../assets/Business_Planning.png";
import curriculumIcon from "../../assets/Curriculum_&_Training_Programs.png";
import workshopIcon from "../../assets/Workshop_&_Training_Programs.png";
import marketingIcon from "../../assets/Digital_Marketing.png";
import websiteIcon from "../../assets/Website_Design_&_Development.png";
import serviceBg from "../../assets/Our_service_background.png";

const ICONS = {
  chart: managementIcon,
  analytics: planningIcon,
  education: curriculumIcon,
  users: workshopIcon,
  marketing: marketingIcon,
  code: websiteIcon,
};

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

const Our_Service = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [servicesContent, setServicesContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    const fetchServicesContent = async () => {
      try {
        setLoading(true);

        const documentRef = doc(db, "siteContent", "home");
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          const data = documentSnapshot.data();
          setServicesContent(data?.services || null);
        } else {
          setServicesContent(null);
          console.warn("Document siteContent/home does not exist.");
        }
      } catch (error) {
        console.error("Error loading services content:", error);
        setServicesContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesContent();
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
    return (
      <section className="ourServiceSection" dir={isArabic ? "rtl" : "ltr"}>
        <img src={serviceBg} alt="" className="ourServiceBg" />
      </section>
    );
  }

  if (!servicesContent || !Array.isArray(servicesContent.items)) {
    return null;
  }

  const kicker = getLocalizedText(servicesContent.kicker, language);
  const title = getLocalizedText(servicesContent.title, language);
  const subtitle = getLocalizedText(servicesContent.subtitle, language);

  return (
    <section className="ourServiceSection" dir={isArabic ? "rtl" : "ltr"}>
      <img src={serviceBg} alt="" className="ourServiceBg" />

      <div className="ourServiceHeader">
        <p className="ourServiceLabel">{kicker}</p>

        <h2 className="ourServiceTitle">{title}</h2>

        <p className="ourServiceSubtitle">{subtitle}</p>
      </div>

      <div className="ourServiceBox">
        <div className="ourServiceGrid">
          {servicesContent.items.map((service, index) => {
            const serviceTitle = getLocalizedText(service.title, language);
            const serviceDescription = getLocalizedText(
              service.description,
              language
            );
            const linkText = getLocalizedText(service.linkText, language);

            const icon = ICONS[service.icon] || managementIcon;
            const linkUrl = service.linkUrl || "/services";

            return (
              <div className="ourServiceCard" key={`${service.icon}-${index}`}>
                <div className="ourServiceIconWrap">
                  <img
                    src={icon}
                    alt={serviceTitle}
                    className="ourServiceIcon"
                  />
                </div>

                <h3 className="ourServiceCardTitle">{serviceTitle}</h3>

                <p className="ourServiceCardDesc">{serviceDescription}</p>

                <a href={linkUrl} className="ourServiceLink">
                  {linkText} <span>{isArabic ? "←" : "→"}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Our_Service;