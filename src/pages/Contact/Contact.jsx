// Contact.jsx
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase";

import "./Contact.css";

import contactImg from "../../assets/conatct-form.jpg";

// icons
import iconSales from "../../assets/Icon.png";
import iconSupport from "../../assets/message-chat-circle.png";
import iconVisit from "../../assets/marker-pin-02.png";
import iconCall from "../../assets/phone.png";

const ICONS = {
  chat: iconSales,
  support: iconSupport,
  location: iconVisit,
  phone: iconCall,
};

const PHONE_COUNTRIES = [
  {
    code: "DZ",
    name: { en: "Algeria", ar: "الجزائر" },
    dialCode: "+213",
    placeholder: "551 239 279",
    example: "551239279",
    regex: /^[567]\d{8}$/,
  },
  {
    code: "US",
    name: { en: "United States", ar: "الولايات المتحدة" },
    dialCode: "+1",
    placeholder: "555 123 4567",
    example: "5551234567",
    regex: /^\d{10}$/,
  },
  {
    code: "CA",
    name: { en: "Canada", ar: "كندا" },
    dialCode: "+1",
    placeholder: "555 123 4567",
    example: "5551234567",
    regex: /^\d{10}$/,
  },
  {
    code: "FR",
    name: { en: "France", ar: "فرنسا" },
    dialCode: "+33",
    placeholder: "6 12 34 56 78",
    example: "612345678",
    regex: /^[1-9]\d{8}$/,
  },
  {
    code: "GB",
    name: { en: "United Kingdom", ar: "المملكة المتحدة" },
    dialCode: "+44",
    placeholder: "7123 456789",
    example: "7123456789",
    regex: /^\d{10}$/,
  },
  {
    code: "AE",
    name: { en: "United Arab Emirates", ar: "الإمارات" },
    dialCode: "+971",
    placeholder: "50 123 4567",
    example: "501234567",
    regex: /^[2-9]\d{8}$/,
  },
  {
    code: "SA",
    name: { en: "Saudi Arabia", ar: "السعودية" },
    dialCode: "+966",
    placeholder: "50 123 4567",
    example: "501234567",
    regex: /^[1-9]\d{8}$/,
  },
  {
    code: "MA",
    name: { en: "Morocco", ar: "المغرب" },
    dialCode: "+212",
    placeholder: "612 345 678",
    example: "612345678",
    regex: /^[5-7]\d{8}$/,
  },
  {
    code: "TN",
    name: { en: "Tunisia", ar: "تونس" },
    dialCode: "+216",
    placeholder: "20 123 456",
    example: "20123456",
    regex: /^[2-9]\d{7}$/,
  },
  {
    code: "EG",
    name: { en: "Egypt", ar: "مصر" },
    dialCode: "+20",
    placeholder: "100 123 4567",
    example: "1001234567",
    regex: /^1\d{9}$/,
  },
  {
    code: "TR",
    name: { en: "Turkey", ar: "تركيا" },
    dialCode: "+90",
    placeholder: "501 234 5678",
    example: "5012345678",
    regex: /^5\d{9}$/,
  },
];

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

const getCountryByCode = (countryCode) => {
  return (
    PHONE_COUNTRIES.find((country) => country.code === countryCode) ||
    PHONE_COUNTRIES[0]
  );
};

const normalizePhoneNumber = (value, country) => {
  let cleanedValue = String(value || "").trim();

  cleanedValue = cleanedValue.replace(/[^\d+]/g, "");

  const dialCodeWithoutPlus = country.dialCode.replace("+", "");

  if (cleanedValue.startsWith(country.dialCode)) {
    cleanedValue = cleanedValue.slice(country.dialCode.length);
  }

  if (cleanedValue.startsWith(`00${dialCodeWithoutPlus}`)) {
    cleanedValue = cleanedValue.slice(`00${dialCodeWithoutPlus}`.length);
  }

  if (cleanedValue.startsWith(dialCodeWithoutPlus)) {
    cleanedValue = cleanedValue.slice(dialCodeWithoutPlus.length);
  }

  cleanedValue = cleanedValue.replace(/\D/g, "");

  if (cleanedValue.startsWith("0")) {
    cleanedValue = cleanedValue.slice(1);
  }

  return cleanedValue;
};

const formatPhoneForDisplay = (phone, country) => {
  const digits = normalizePhoneNumber(phone, country);

  if (!digits) return "";

  if (country.code === "DZ") {
    return digits.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  if (country.code === "US" || country.code === "CA") {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  }

  if (country.code === "FR") {
    return digits.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
  }

  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
};

export default function Contact() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [contactContent, setContactContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "DZ",
    countryCode: "+213",
    phone: "",
    message: "",
    acceptedPrivacy: false,
  });

  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const selectedCountry = getCountryByCode(formData.country);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        setLoading(true);

        const documentRef = doc(db, "siteContent", "contact");
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          setContactContent(documentSnapshot.data());
        } else {
          setContactContent(null);
          console.warn("Document siteContent/contact does not exist.");
        }
      } catch (error) {
        console.error("Error loading contact content:", error);
        setContactContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContactContent();
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

  const formSection = contactContent?.formSection || null;
  const infoSection = contactContent?.infoSection || null;

  const contactCards = useMemo(() => {
    if (!Array.isArray(infoSection?.cards)) return [];

    return infoSection.cards;
  }, [infoSection]);

  const getPhoneErrorMessage = (country) => {
    return isArabic
      ? `رقم الهاتف غير صحيح. مثال صحيح: ${country.dialCode} ${country.example}`
      : `Invalid phone number. Example: ${country.dialCode} ${country.example}`;
  };

  const validatePhoneNumber = (phone, country) => {
    const normalizedPhone = normalizePhoneNumber(phone, country);

    if (!normalizedPhone) {
      return "";
    }

    if (!country.regex.test(normalizedPhone)) {
      return getPhoneErrorMessage(country);
    }

    return "";
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "country") {
      const newCountry = getCountryByCode(value);
      const normalizedPhone = normalizePhoneNumber(formData.phone, newCountry);

      setFormData((previousData) => ({
        ...previousData,
        country: newCountry.code,
        countryCode: newCountry.dialCode,
        phone: normalizedPhone,
      }));

      setPhoneError(validatePhoneNumber(normalizedPhone, newCountry));
      return;
    }

    if (name === "phone") {
      const normalizedPhone = normalizePhoneNumber(value, selectedCountry);

      setFormData((previousData) => ({
        ...previousData,
        phone: normalizedPhone,
      }));

      setPhoneError(validatePhoneNumber(normalizedPhone, selectedCountry));
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedPhone = normalizePhoneNumber(formData.phone, selectedCountry);
    const currentPhoneError = validatePhoneNumber(
      normalizedPhone,
      selectedCountry
    );

    if (currentPhoneError) {
      setPhoneError(currentPhoneError);
      setSubmitMessage("");
      setSubmitError("");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMessage("");
      setSubmitError("");

      const payload = {
        ...formData,
        countryCode: selectedCountry.dialCode,
        phone: normalizedPhone,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setSubmitMessage(
        isArabic
          ? "تم إرسال رسالتك بنجاح."
          : "Your message has been sent successfully."
      );

      setPhoneError("");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "DZ",
        countryCode: "+213",
        phone: "",
        message: "",
        acceptedPrivacy: false,
      });
    } catch (error) {
      console.error("Contact form submit error:", error);

      setSubmitError(
        isArabic
          ? "حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى."
          : "There was an error sending your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main
        className="contactPageRoot"
        dir={isArabic ? "rtl" : "ltr"}
      />
    );
  }

  if (!formSection || !infoSection) {
    return null;
  }

  const formImageUrl = formSection.imageUrl || contactImg;

  return (
    <main
      className="contactPageRoot"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <section className="contactPage">
        <div className="contactPage__container">
          <div className="contactForm">
            <h1 className="contactForm__title">
              {getLocalizedText(formSection.title, language)}
            </h1>

            <p className="contactForm__subtitle">
              {getLocalizedText(formSection.subtitle, language)}
            </p>

            <form
              className="contactForm__grid"
              onSubmit={handleSubmit}
            >
              <div className="contactField">
                <label className="contactField__label">
                  {getLocalizedText(formSection.firstNameLabel, language)}
                </label>

                <input
                  className="contactField__input"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={getLocalizedText(
                    formSection.firstNamePlaceholder,
                    language
                  )}
                  required
                />
              </div>

              <div className="contactField">
                <label className="contactField__label">
                  {getLocalizedText(formSection.lastNameLabel, language)}
                </label>

                <input
                  className="contactField__input"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={getLocalizedText(
                    formSection.lastNamePlaceholder,
                    language
                  )}
                  required
                />
              </div>

              <div className="contactField contactField--full">
                <label className="contactField__label">
                  {getLocalizedText(formSection.emailLabel, language)}
                </label>

                <input
                  className="contactField__input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={getLocalizedText(
                    formSection.emailPlaceholder,
                    language
                  )}
                  type="email"
                  required
                />
              </div>

              <div className="contactField contactField--full">
                <label className="contactField__label">
                  {getLocalizedText(formSection.phoneLabel, language)}
                </label>

                <div
                  className="contactPhoneField"
                  dir="ltr"
                  style={{ direction: "ltr" }}
                >
                  <select
                    className="contactPhoneField__select"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    aria-label={getLocalizedText(
                      formSection.countryCodeLabel,
                      language
                    )}
                  >
                    {PHONE_COUNTRIES.map((country) => (
                      <option value={country.code} key={country.code}>
                        {country.code} {country.dialCode}
                      </option>
                    ))}
                  </select>

                  <input
                    className="contactPhoneField__input"
                    name="phone"
                    value={formatPhoneForDisplay(
                      formData.phone,
                      selectedCountry
                    )}
                    onChange={handleChange}
                    placeholder={selectedCountry.placeholder}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    aria-invalid={phoneError ? "true" : "false"}
                    required
                  />
                </div>

                <small
                  className="contactField__hint"
                  style={{
                    display: "block",
                    marginTop: "8px",
                    color: phoneError ? "red" : "#64748b",
                  }}
                >
                  {phoneError ||
                    (isArabic
                      ? `مثال: ${selectedCountry.dialCode} ${selectedCountry.example}`
                      : `Example: ${selectedCountry.dialCode} ${selectedCountry.example}`)}
                </small>
              </div>

              <div className="contactField contactField--full">
                <label className="contactField__label">
                  {getLocalizedText(formSection.messageLabel, language)}
                </label>

                <textarea
                  className="contactField__textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={getLocalizedText(
                    formSection.messagePlaceholder,
                    language
                  )}
                  rows={6}
                  required
                />
              </div>

              <label className="contactCheck contactField--full">
                <input
                  className="contactCheck__box"
                  type="checkbox"
                  name="acceptedPrivacy"
                  checked={formData.acceptedPrivacy}
                  onChange={handleChange}
                  required
                />

                <span className="contactCheck__text">
                  {getLocalizedText(formSection.privacyText, language)}{" "}
                  <a href={formSection.privacyUrl || "/privacy-policy"}>
                    {getLocalizedText(formSection.privacyLinkText, language)}
                  </a>
                </span>
              </label>

              <button
                className="contactForm__submit contactField--full"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? isArabic
                    ? "جاري الإرسال..."
                    : "Sending..."
                  : getLocalizedText(formSection.buttonText, language)}
              </button>

              {submitMessage && (
                <p
                  className="contactField--full"
                  style={{ color: "green", margin: 0 }}
                >
                  {submitMessage}
                </p>
              )}

              {submitError && (
                <p
                  className="contactField--full"
                  style={{ color: "red", margin: 0 }}
                >
                  {submitError}
                </p>
              )}
            </form>
          </div>

          <div className="contactSide">
            <img
              className="contactSide__img"
              src={formImageUrl}
              alt={getLocalizedText(formSection.title, language)}
            />
          </div>
        </div>
      </section>

      <section className="contactCards">
        <div className="contactCards__container">
          <p className="contactCards__kicker">
            {getLocalizedText(infoSection.kicker, language)}
          </p>

          <h2 className="contactCards__title">
            {getLocalizedText(infoSection.title, language)}
          </h2>

          <p className="contactCards__subtitle">
            {getLocalizedText(infoSection.subtitle, language)}
          </p>

          <div className="contactCards__grid">
            {contactCards.map((card, index) => {
              const icon = ICONS[card.icon] || iconSales;
              const title = getLocalizedText(card.title, language);
              const description = getLocalizedText(card.description, language);
              const linkText = getLocalizedText(card.linkText, language);
              const linkUrl = card.linkUrl || "#";

              const isExternal =
                linkUrl.startsWith("http://") ||
                linkUrl.startsWith("https://");

              return (
                <article className="contactCard" key={`${card.icon}-${index}`}>
                  <div className="contactCard__iconWrap">
                    <img className="contactCard__icon" src={icon} alt="" />
                  </div>

                  <h3 className="contactCard__title">{title}</h3>

                  <p className="contactCard__desc">{description}</p>

                  <a
                    className="contactCard__link"
                    href={linkUrl}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    {linkText}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}