import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import "./Checkout.css";

import homeIcon from "../../assets/Home_icon.png";
import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

import chargilyLogo from "../../assets/chargily.svg";

import paymentWorkImg from "../../assets/payment-work.png";
import paymentErrorImg from "../../assets/payment-error.png";

const normalizeLanguage = (language) => {
  const normalizedLanguage = String(language || "").toLowerCase();

  if (normalizedLanguage === "ar") return "ar";
  return "en";
};

const getInitialLanguage = () => {
  return normalizeLanguage(localStorage.getItem("site_language"));
};

const getCoursePrice = (course) => {
  return Number(course.price || course.priceValue || 0);
};

const formatDZD = (value, isArabic) => {
  const numberValue = Number(value || 0);
  const formattedNumber = numberValue.toLocaleString("fr-FR");

  return isArabic ? `${formattedNumber} دج` : `${formattedNumber} DZD`;
};

const CHECKOUT_TEXT = {
  en: {
    loading: "Loading checkout...",
    checkout: "Checkout",
    cart: "Cart",
    coursesAndProgrammes: "Courses and programmes",
    billingInformation: "Billing Information",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phoneNumber: "Phone number",
    notes: "Notes (optional)",
    firstNamePlaceholder: "Enter your first name",
    lastNamePlaceholder: "Enter your last name",
    notesPlaceholder: "Notes ...",
    cartTotals: "Cart totals",
    totalItems: "Total Items",
    subtotal: "Subtotal",
    discount: "Discount",
    estimatedTotal: "Estimated total",
    coupon: "Coupon",
    couponPlaceholder: "Coupon code",
    applyCoupon: "Apply Coupon",
    payNow: "Pay Now",
    payment: "Payment",
    selectPaymentMethod: "Select online payment method",
    choosePaymentMethod: "Choose your payment method",
    acceptPolicies: "Accept the conditions of use and confidentiality policies",
    total: "Total",
    paymentSuccessful: "Payment Successful",
    paymentSuccessfulText:
      "Your payment was successful, you can access the course now.",
    thankYou: "Thank you for your trust.",
    done: "Done",
    paymentError: "Payment Error!",
    paymentErrorText:
      "Something went wrong with your payment. Please check your details or try again with a different method.",
    retryPayment: "Retry payment",
    stillQuestions: "Still have questions?",
    questionsText:
      "Can’t find the answer you’re looking for? Please chat to our friendly team.",
    getInTouch: "Get in touch",
    emptyCart: "Your cart is empty.",
    backToCart: "Back to cart",
    loadError: "Could not load checkout data. Please try again.",
    checkoutDirectAccessError: "Please go to checkout from your cart first.",
    formRequiredError: "Please fill in your first name, last name, email, and phone number before continuing.",
    invalidEmailError: "Please enter a valid email address.",
  },

  ar: {
    loading: "جاري تحميل صفحة الدفع...",
    checkout: "إتمام الدفع",
    cart: "السلة",
    coursesAndProgrammes: "الدورات والبرامج",
    billingInformation: "معلومات الفوترة",
    firstName: "الاسم",
    lastName: "اللقب",
    email: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    notes: "ملاحظات اختيارية",
    firstNamePlaceholder: "أدخل اسمك",
    lastNamePlaceholder: "أدخل لقبك",
    notesPlaceholder: "ملاحظات ...",
    cartTotals: "إجمالي السلة",
    totalItems: "عدد العناصر",
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    estimatedTotal: "الإجمالي المتوقع",
    coupon: "كوبون",
    couponPlaceholder: "رمز الكوبون",
    applyCoupon: "تطبيق الكوبون",
    payNow: "ادفع الآن",
    payment: "الدفع",
    selectPaymentMethod: "اختر طريقة الدفع عبر الإنترنت",
    choosePaymentMethod: "اختر طريقة الدفع",
    acceptPolicies: "أوافق على شروط الاستخدام وسياسة الخصوصية",
    total: "المجموع",
    paymentSuccessful: "تم الدفع بنجاح",
    paymentSuccessfulText: "تمت عملية الدفع بنجاح، يمكنك الآن الوصول إلى الدورة.",
    thankYou: "شكرًا على ثقتك.",
    done: "تم",
    paymentError: "حدث خطأ في الدفع!",
    paymentErrorText:
      "حدث خطأ أثناء عملية الدفع. يرجى التحقق من المعلومات أو المحاولة بطريقة دفع أخرى.",
    retryPayment: "إعادة المحاولة",
    stillQuestions: "هل ما زالت لديك أسئلة؟",
    questionsText:
      "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا وسنساعدك بكل سرور.",
    getInTouch: "تواصل معنا",
    emptyCart: "سلتك فارغة.",
    backToCart: "العودة إلى السلة",
    loadError: "تعذر تحميل معلومات الدفع. يرجى المحاولة مرة أخرى.",
    checkoutDirectAccessError: "يرجى الدخول إلى صفحة الدفع من السلة أولاً.",
    formRequiredError: "يرجى ملء الاسم واللقب والبريد الإلكتروني ورقم الهاتف قبل المتابعة.",
    invalidEmailError: "يرجى إدخال بريد إلكتروني صحيح.",
  },
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cameFromCart = location.state?.fromCart === true;

  const selectedCourseIds = useMemo(() => {
    return Array.isArray(location.state?.selectedCourseIds)
      ? location.state.selectedCourseIds
      : [];
  }, [location.state]);

  const [language, setLanguage] = useState(getInitialLanguage);
  const isArabic = language === "ar";
  const text = CHECKOUT_TEXT[language] || CHECKOUT_TEXT.en;

  const [couponCode, setCouponCode] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [checkoutCourses, setCheckoutCourses] = useState([]);
  const [loadingCheckout, setLoadingCheckout] = useState(true);
  const [checkoutError, setCheckoutError] = useState("");
  const [billingError, setBillingError] = useState("");

  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "DZ",
    phoneNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (!cameFromCart) {
      navigate("/cart", {
        replace: true,
        state: {
          cartMessage: text.checkoutDirectAccessError,
        },
      });
    }
  }, [cameFromCart, navigate, text.checkoutDirectAccessError]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const handleLanguageChanged = (event) => {
      const newLanguage = normalizeLanguage(event.detail?.language);
      setLanguage(newLanguage);
      localStorage.setItem("site_language", newLanguage);
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
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment_status");

    if (paymentStatus === "success") {
      setPaymentResult("success");
      setIsPaymentModalOpen(false);
    }

    if (
      paymentStatus === "failed" ||
      paymentStatus === "error" ||
      paymentStatus === "cancelled"
    ) {
      setPaymentResult("error");
      setIsPaymentModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!cameFromCart) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login?redirect=/checkout");
        return;
      }

      setCurrentUser(user);

      setBillingInfo((currentInfo) => ({
        ...currentInfo,
        email: user.email || currentInfo.email,
      }));

      try {
        setLoadingCheckout(true);
        setCheckoutError("");

        const cartSnapshot = await getDocs(
          collection(db, "users", user.uid, "cart")
        );

        let cartItems = cartSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        if (selectedCourseIds.length > 0) {
          cartItems = cartItems.filter((item) =>
            selectedCourseIds.includes(item.id)
          );
        }

        const coursesWithFullData = await Promise.all(
          cartItems.map(async (cartItem) => {
            try {
              const courseId = cartItem.courseId || cartItem.id;
              const courseRef = doc(db, "courses", courseId);
              const courseSnapshot = await getDoc(courseRef);

              if (!courseSnapshot.exists()) {
                return cartItem;
              }

              return {
                ...cartItem,
                ...courseSnapshot.data(),
                id: cartItem.id,
                cartId: cartItem.id,
                courseId,
              };
            } catch (error) {
              console.warn("Could not load course details:", error);
              return cartItem;
            }
          })
        );

        setCheckoutCourses(coursesWithFullData);
      } catch (error) {
        console.error("Error loading checkout:", error);
        setCheckoutError(text.loadError);
      } finally {
        setLoadingCheckout(false);
      }
    });

    return () => unsubscribe();
  }, [cameFromCart, navigate, selectedCourseIds, text.loadError]);

  const totalItems = checkoutCourses.length;

  const subtotal = useMemo(() => {
    return checkoutCourses.reduce(
      (total, course) => total + getCoursePrice(course),
      0
    );
  }, [checkoutCourses]);

  const discount = 0;

  const estimatedTotal = useMemo(() => {
    return subtotal;
  }, [subtotal]);

  const handleBillingChange = (event) => {
    const { name, value } = event.target;

    setBillingInfo((currentInfo) => ({
      ...currentInfo,
      [name]: value,
    }));

    if (billingError) {
      setBillingError("");
    }
  };

  const validateBillingInfo = () => {
    const firstName = billingInfo.firstName.trim();
    const lastName = billingInfo.lastName.trim();
    const email = billingInfo.email.trim();
    const phoneNumber = billingInfo.phoneNumber.trim();

    if (!firstName || !lastName || !email || !phoneNumber) {
      return text.formRequiredError;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return text.invalidEmailError;
    }

    return "";
  };

  const handleApplyCoupon = (event) => {
    event.preventDefault();
    console.log("Coupon code:", couponCode);
  };

  const openPaymentModal = () => {
    setBillingError("");

    if (totalItems === 0 || estimatedTotal <= 0) {
      return;
    }

    const validationError = validateBillingInfo();

    if (validationError) {
      setBillingError(validationError);
      return;
    }

    setIsPaymentModalOpen(true);
    setPaymentResult(null);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const closePaymentResult = () => {
    setPaymentResult(null);

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  };

  const retryPayment = () => {
    setPaymentResult(null);

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    setIsPaymentModalOpen(true);
  };

 const handleGatewayPayNow = async () => {
  if (!acceptedPolicies || !recaptchaToken || totalItems === 0) {
    return;
  }

  try {
    const response = await fetch("/api/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: estimatedTotal,
        paymentMethod: "chargily",
        billingInfo,
        courses: checkoutCourses.map((course) => ({
          id: course.courseId || course.id,
          title: course.title || course.en?.title || course.ar?.title || "",
          price: getCoursePrice(course),
        })),
        userId: currentUser?.uid || null,
      }),
    });

    const data = await response.json();

    console.log("Create payment response:", data);

    if (!response.ok || !data.ok) {
      alert(data.message || "Could not create payment.");
      return;
    }

    if (!data.paymentUrl) {
  alert("Payment link was not created.");
  return;
}

window.location.assign(data.paymentUrl);
  } catch (error) {
    console.error("Could not create payment:", error);
    alert("Could not create payment");
  }
};

  const isFieldInvalid = (fieldName) => {
    if (!billingError) return false;

    if (fieldName === "email") {
      return !billingInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email.trim());
    }

    return !String(billingInfo[fieldName] || "").trim();
  };

  if (loadingCheckout) {
    return (
      <main
        className={`checkout-page ${
          isArabic ? "checkout-page--rtl" : "checkout-page--ltr"
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <section className="checkout-content-section">
          <div className="checkout-container">
            <p>{text.loading}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`checkout-page ${
        isArabic ? "checkout-page--rtl" : "checkout-page--ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <section className="checkout-breadcrumb-section">
        <div className="checkout-container">
          <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="checkout-breadcrumb-home" aria-label="Home">
              <img src={homeIcon} alt="" />
            </Link>

            <span className="checkout-breadcrumb-chevron"></span>

            <Link to="/courses" className="checkout-breadcrumb-link">
              {text.coursesAndProgrammes}
            </Link>

            <span className="checkout-breadcrumb-chevron"></span>

            <Link to="/cart" className="checkout-breadcrumb-link">
              {text.cart}
            </Link>

            <span className="checkout-breadcrumb-chevron"></span>

            <span className="checkout-breadcrumb-current">
              {text.checkout}
            </span>
          </nav>
        </div>
      </section>

      <section className="checkout-content-section">
        <div className="checkout-container checkout-layout">
          <form className="checkout-billing-card" noValidate onSubmit={(event) => event.preventDefault()}>
            <h1>{text.billingInformation}</h1>

            {checkoutError && (
              <p className="checkout-error-message">{checkoutError}</p>
            )}

            {billingError && (
              <p className="checkout-error-message checkout-error-message--billing">
                {billingError}
              </p>
            )}

            {totalItems === 0 && (
              <div className="checkout-empty-state">
                <p>{text.emptyCart}</p>

                <Link to="/cart" className="checkout-pay-btn">
                  {text.backToCart}
                </Link>
              </div>
            )}

            <div className="checkout-form-grid">
              <div className="checkout-form-group">
                <label htmlFor="firstName">{text.firstName}</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder={text.firstNamePlaceholder}
                  value={billingInfo.firstName}
                  onChange={handleBillingChange}
                  className={isFieldInvalid("firstName") ? "checkout-input-error" : ""}
                  aria-invalid={isFieldInvalid("firstName")}
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="lastName">{text.lastName}</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder={text.lastNamePlaceholder}
                  value={billingInfo.lastName}
                  onChange={handleBillingChange}
                  className={isFieldInvalid("lastName") ? "checkout-input-error" : ""}
                  aria-invalid={isFieldInvalid("lastName")}
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="email">{text.email}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={billingInfo.email}
                  onChange={handleBillingChange}
                  className={isFieldInvalid("email") ? "checkout-input-error" : ""}
                  aria-invalid={isFieldInvalid("email")}
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="phoneNumber">{text.phoneNumber}</label>

                <div className="checkout-phone-field">
                  <select
                    name="countryCode"
                    value={billingInfo.countryCode}
                    onChange={handleBillingChange}
                    aria-label="Country code"
                  >
                    <option value="DZ">DZ</option>
                    <option value="FR">FR</option>
                    <option value="US">US</option>
                  </select>

                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={billingInfo.phoneNumber}
                    onChange={handleBillingChange}
                    className={isFieldInvalid("phoneNumber") ? "checkout-input-error" : ""}
                    aria-invalid={isFieldInvalid("phoneNumber")}
                  />
                </div>
              </div>

              <div className="checkout-form-group checkout-form-group--full">
                <label htmlFor="notes">{text.notes}</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder={text.notesPlaceholder}
                  value={billingInfo.notes}
                  onChange={handleBillingChange}
                ></textarea>
              </div>
            </div>
          </form>

          <aside className="checkout-summary-card">
            <h2>{text.cartTotals}</h2>

            <div className="checkout-summary-line">
              <span>{text.totalItems}</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="checkout-summary-line">
              <span>{text.subtotal}</span>
              <strong>{formatDZD(subtotal, isArabic)}</strong>
            </div>

            <div className="checkout-summary-total">
              <span>{text.estimatedTotal}</span>
              <strong>{formatDZD(estimatedTotal, isArabic)}</strong>
            </div>

            <form className="checkout-coupon-form" onSubmit={handleApplyCoupon}>
              <label htmlFor="coupon">{text.coupon}</label>

              <input
                id="coupon"
                type="text"
                placeholder={text.couponPlaceholder}
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
              />

              <button type="submit">{text.applyCoupon}</button>
            </form>

            <button
              type="button"
              className="checkout-pay-btn"
              onClick={openPaymentModal}
              disabled={totalItems === 0}
            >
              {text.payNow}
            </button>
          </aside>
        </div>
      </section>

      <section className="checkout-contact-cta">
        <div className="checkout-contact-cta__container">
          <div className="checkout-contact-cta__card">
            <div className="checkout-contact-cta__avatars" aria-hidden="true">
              <img
                className="checkout-contact-cta__avatar checkout-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />

              <img
                className="checkout-contact-cta__avatar checkout-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />

              <img
                className="checkout-contact-cta__avatar checkout-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="checkout-contact-cta__title">
              {text.stillQuestions}
            </h3>

            <p className="checkout-contact-cta__subtitle">
              {text.questionsText}
            </p>

            <Link className="checkout-contact-cta__btn" to="/contact">
              {text.getInTouch}
            </Link>
          </div>
        </div>
      </section>

      {isPaymentModalOpen && (
        <div className="checkout-payment-overlay" role="presentation">
          <div
            className="checkout-payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
          >
            <button
              type="button"
              className="checkout-payment-close"
              onClick={closePaymentModal}
              aria-label="Close payment popup"
            >
              ×
            </button>

            <h2 id="payment-title">{text.payment}</h2>

            <p className="checkout-payment-subtitle">
              {text.selectPaymentMethod}
            </p>

            <div className="checkout-payment-method-box">
              <h3>{text.choosePaymentMethod}</h3>

              <label className="checkout-payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="chargily"
                  checked
                  readOnly
                />

                <span className="checkout-payment-method-logo">
                  <img
                    className="checkout-payment-logo-img checkout-payment-logo-img--chargily"
                    src={chargilyLogo}
                    alt="Chargily"
                  />
                </span>

                <span>Chargily</span>
              </label>

              <label className="checkout-payment-check">
                <input
                  type="checkbox"
                  checked={acceptedPolicies}
                  onChange={(event) =>
                    setAcceptedPolicies(event.target.checked)
                  }
                />

                <span>{text.acceptPolicies}</span>
              </label>

              <div className="checkout-recaptcha-box">
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>
            </div>

            <div className="checkout-payment-total">
              <span>{text.total}</span>

              <div>
                <strong>{formatDZD(estimatedTotal, isArabic)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="checkout-payment-pay-btn"
              onClick={handleGatewayPayNow}
              disabled={!acceptedPolicies || !recaptchaToken || totalItems === 0}
            >
              {text.payNow}
            </button>
          </div>
        </div>
      )}

      {paymentResult === "success" && (
        <div className="checkout-result-overlay" role="presentation">
          <div
            className="checkout-result-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-success-title"
          >
            <button
              type="button"
              className="checkout-result-close"
              onClick={closePaymentResult}
              aria-label="Close payment success popup"
            >
              ×
            </button>

            <img
              className="checkout-result-image"
              src={paymentWorkImg}
              alt=""
            />

            <h2 id="payment-success-title">{text.paymentSuccessful}</h2>

            <p className="checkout-result-message">
              {text.paymentSuccessfulText}
            </p>

            <div className="checkout-success-note">
              <span></span>
              {text.thankYou}
            </div>

            <button
              type="button"
              className="checkout-result-done-btn"
              onClick={closePaymentResult}
            >
              {text.done}
            </button>
          </div>
        </div>
      )}

      {paymentResult === "error" && (
        <div className="checkout-result-overlay" role="presentation">
          <div
            className="checkout-result-modal checkout-result-modal--error"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-error-title"
          >
            <button
              type="button"
              className="checkout-result-close"
              onClick={closePaymentResult}
              aria-label="Close payment error popup"
            >
              ×
            </button>

            <img
              className="checkout-result-image checkout-result-image--error"
              src={paymentErrorImg}
              alt=""
            />

            <h2 id="payment-error-title">{text.paymentError}</h2>

            <p className="checkout-result-message">{text.paymentErrorText}</p>

            <button
              type="button"
              className="checkout-result-retry-btn"
              onClick={retryPayment}
            >
              {text.retryPayment}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Checkout;