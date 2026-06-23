import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import "../Blogs/Blogs.css";

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
};

export default function NewsletterVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = String(searchParams.get("email") || "").trim().toLowerCase();
  const urlLanguage = searchParams.get("lang");
  const [language, setLanguage] = useState(
    urlLanguage === "ar" || urlLanguage === "en" ? urlLanguage : getInitialLanguage()
  );

  const isArabic = language === "ar";

  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  const handleVerify = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError(
        isArabic
          ? "البريد الإلكتروني غير موجود في الرابط."
          : "Email is missing from the link."
      );
      return;
    }

    if (!code.trim()) {
      setError(
        isArabic
          ? "يرجى إدخال رمز التأكيد."
          : "Please enter the verification code."
      );
      return;
    }

    try {
      setStatus("loading");

      const response = await fetch("/api/newsletter/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: code.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setMessage(
        isArabic
          ? "تم حفظ إيميلك بنجاح"
          : "Your email has been saved successfully"
      );

      window.setTimeout(() => {
        navigate("/blog");
      }, 1200);
    } catch (err) {
      console.error("Newsletter verification error:", err);

      const translatedMessage =
        err.message === "MAIL_ALREADY_EXISTS"
          ? isArabic
            ? "هذا البريد الإلكتروني موجود بالفعل."
            : "Mail already exists."
          : err.message === "INVALID_CODE"
          ? isArabic
            ? "رمز التأكيد غير صحيح."
            : "Invalid verification code."
          : err.message === "CODE_EXPIRED"
          ? isArabic
            ? "انتهت صلاحية الرمز. يرجى الاشتراك من جديد."
            : "The code expired. Please subscribe again."
          : err.message === "TOO_MANY_ATTEMPTS"
          ? isArabic
            ? "تم تجاوز عدد المحاولات. يرجى الاشتراك من جديد."
            : "Too many attempts. Please subscribe again."
          : isArabic
          ? "حدث خطأ أثناء تأكيد البريد الإلكتروني."
          : "There was an error verifying your email.";

      setError(translatedMessage);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <main
      className="blogsPage"
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
      }}
    >
      <section
        className="newsletterCard"
        style={{
          width: "min(100%, 460px)",
          "--card-index": 0,
        }}
      >
        <h1 className="newsletterCard__title">
          {isArabic ? "تأكيد البريد الإلكتروني" : "Verify your email"}
        </h1>

        <p className="newsletterCard__desc">
          {isArabic
            ? `أدخل الرمز الذي أرسلناه إلى ${email}.`
            : `Enter the code we sent to ${email}.`}
        </p>

        <form onSubmit={handleVerify}>
          <input
            className="newsletterCard__input"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={isArabic ? "رمز التأكيد" : "Verification code"}
            maxLength={6}
          />

          <button
            className="newsletterCard__btn"
            type="submit"
            disabled={status === "loading"}
            style={{ marginTop: "14px" }}
          >
            {status === "loading"
              ? isArabic
                ? "جاري التأكيد..."
                : "Verifying..."
              : isArabic
              ? "تأكيد"
              : "Verify"}
          </button>
        </form>

        {message && (
          <p style={{ color: "green", marginTop: "10px", fontWeight: 600 }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: "red", marginTop: "10px", fontWeight: 600 }}>
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

