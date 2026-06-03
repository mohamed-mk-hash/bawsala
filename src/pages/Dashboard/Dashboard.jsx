import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import courseImage from "../../assets/featured_course.png";
import instructorImg from "../../assets/courses_account.png";
import clockIcon from "../../assets/Clock.png";
import calendarIcon from "../../assets/CalendarBlank.png";
import monitorIcon from "../../assets/MonitorPlay.png";
import shareIcon from "../../assets/ShareFat.png";
import coursesTagIcon from "../../assets/courses_tag.png";

const TRANSLATIONS = {
  en: {
    welcomeBack: "Welcome back",
    boughtCourses: "Bought courses",
    bestProgress: "Best progress",
    approvedOrders: "Approved orders",

    profileSettings: "Profile settings",
    profileDescription: "Update your personal information and profile image.",
    changePassword: "Change password",
    passwordDescription: "Use a strong password to protect your account.",
    myCourses: "My courses",
    coursesDescription: "Continue learning from the courses you bought.",
    myProducts: "My products",
    productsDescription: "Products you bought and can access.",
    myOrders: "My orders",
    ordersDescription: "Only paid orders are shown here.",
    logout: "Log out",

    change: "Change",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",

    firstNamePlaceholder: "Enter your first name",
    lastNamePlaceholder: "Enter your last name",
    emailPlaceholder: "Enter your email",
    phonePlaceholder: "Enter your phone number",
    currentPasswordPlaceholder: "Enter your current password",
    newPasswordPlaceholder: "Enter your new password",
    confirmPasswordPlaceholder: "Confirm your new password",

    saveChanges: "Save changes",
    updatePassword: "Update password",

    profileSaved: "Profile information saved successfully.",
    imageUpdated: "Profile image updated successfully.",
    mustLogin: "You must be logged in to update your profile.",
    passwordCurrentRequired: "Please enter your current password.",
    passwordMinLength: "New password must be at least 8 characters.",
    passwordNotMatch: "New password and confirmation do not match.",
    passwordUpdated: "Password updated successfully.",
    wrongPassword: "Current password is incorrect.",
    needRecentLogin: "Please log in again, then try changing your password.",
    errorMessage: "Something went wrong. Please try again.",

    beginner: "Beginner",
    instructor: "Instructor",
    courseType: "Course",
    productType: "Product",
    progress: "Progress",
    continueLearning: "Continue learning",
    viewProduct: "View product",

    noCourses: "You have not bought any courses yet.",
    browseCourses: "Browse courses",
    noProducts: "You have not bought any products yet.",
    browseProducts: "Browse products",
    loadingCourses: "Loading your courses...",
    loadingProducts: "Loading your products...",
    loadingOrders: "Loading your orders...",
    noOrders: "You do not have any paid orders yet.",

    order: "Order",
    orderNumber: "Order number",
    date: "Date",
    amount: "Amount",
    adminStatus: "Admin review",
    items: "Items",
    paid: "Paid",
    pending: "Waiting for admin review",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    failed: "Failed",
    unknown: "Unknown",
    products: "Products",
    services: "Services",
    courses: "Courses",
    orderContains: "This order contains",
  },

  ar: {
    welcomeBack: "مرحباً بعودتك",
    boughtCourses: "الدورات المشتراة",
    bestProgress: "أفضل تقدم",
    approvedOrders: "الطلبات المقبولة",

    profileSettings: "إعدادات الملف الشخصي",
    profileDescription: "قم بتحديث معلوماتك الشخصية وصورة حسابك.",
    changePassword: "تغيير كلمة السر",
    passwordDescription: "استعمل كلمة سر قوية لحماية حسابك.",
    myCourses: "دوراتي",
    coursesDescription: "واصل التعلم من الدورات التي قمت بشرائها.",
    myProducts: "منتجاتي",
    productsDescription: "المنتجات التي قمت بشرائها ويمكنك الوصول إليها.",
    myOrders: "طلباتي",
    ordersDescription: "تظهر هنا الطلبات المدفوعة فقط.",
    logout: "تسجيل الخروج",

    change: "تغيير",
    firstName: "الاسم",
    lastName: "اللقب",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    currentPassword: "كلمة السر الحالية",
    newPassword: "كلمة السر الجديدة",
    confirmPassword: "تأكيد كلمة السر الجديدة",

    firstNamePlaceholder: "أدخل اسمك",
    lastNamePlaceholder: "أدخل لقبك",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    phonePlaceholder: "أدخل رقم هاتفك",
    currentPasswordPlaceholder: "أدخل كلمة السر الحالية",
    newPasswordPlaceholder: "أدخل كلمة السر الجديدة",
    confirmPasswordPlaceholder: "أكد كلمة السر الجديدة",

    saveChanges: "حفظ التغييرات",
    updatePassword: "تحديث كلمة السر",

    profileSaved: "تم حفظ معلومات الملف الشخصي بنجاح.",
    imageUpdated: "تم تحديث صورة الملف الشخصي بنجاح.",
    mustLogin: "يجب تسجيل الدخول لتحديث الملف الشخصي.",
    passwordCurrentRequired: "يرجى إدخال كلمة السر الحالية.",
    passwordMinLength: "كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل.",
    passwordNotMatch: "كلمة السر الجديدة وتأكيدها غير متطابقين.",
    passwordUpdated: "تم تحديث كلمة السر بنجاح.",
    wrongPassword: "كلمة السر الحالية غير صحيحة.",
    needRecentLogin: "يرجى تسجيل الدخول من جديد ثم حاول تغيير كلمة السر.",
    errorMessage: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",

    beginner: "مبتدئ",
    instructor: "المدرب",
    courseType: "دورة",
    productType: "منتج",
    progress: "التقدم",
    continueLearning: "واصل التعلم",
    viewProduct: "عرض المنتج",

    noCourses: "لم تقم بشراء أي دورة بعد.",
    browseCourses: "تصفح الدورات",
    noProducts: "لم تقم بشراء أي منتج بعد.",
    browseProducts: "تصفح المنتجات",
    loadingCourses: "جاري تحميل دوراتك...",
    loadingProducts: "جاري تحميل منتجاتك...",
    loadingOrders: "جاري تحميل طلباتك...",
    noOrders: "لا توجد لديك طلبات مدفوعة بعد.",

    order: "الطلب",
    orderNumber: "رقم الطلب",
    date: "التاريخ",
    amount: "المبلغ",
    adminStatus: "مراجعة الإدارة",
    items: "العناصر",
    paid: "مدفوع",
    pending: "في انتظار مراجعة الإدارة",
    approved: "مقبول",
    rejected: "مرفوض",
    cancelled: "ملغي",
    failed: "فشل",
    unknown: "غير معروف",
    products: "المنتجات",
    services: "الخدمات",
    courses: "الدورات",
    orderContains: "يحتوي هذا الطلب على",
  },
};

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");
  return savedLanguage === "ar" ? "ar" : "en";
};

const getSavedProfile = (uid) => {
  return JSON.parse(localStorage.getItem(`user_profile_${uid}`) || "{}");
};

const saveProfileLocally = (uid, profileData) => {
  localStorage.setItem(`user_profile_${uid}`, JSON.stringify(profileData));

  window.dispatchEvent(
    new CustomEvent("userProfileUpdated", {
      detail: profileData,
    })
  );
};

const getLocalizedObject = (item, language) => {
  if (!item) return {};
  return item?.[language] || item?.en || item?.ar || {};
};

const getLocalizedText = (value, language) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?.[language] || value?.en || value?.ar || "";
};

const getCourseTitle = (course, language) => {
  const localized = getLocalizedObject(course, language);
  return localized.title || localized.cardTitle || course.title || course.name || "";
};

const getCourseSlug = (course) => {
  return (
    course?.slug ||
    course?.en?.slug ||
    course?.ar?.slug ||
    course?.id ||
    course?.courseId
  );
};

const getCourseDescription = (course, language) => {
  const localized = getLocalizedObject(course, language);
  return (
    localized.cardShortDescription ||
    localized.subtitle ||
    localized.seoDescription ||
    course.description ||
    ""
  );
};

const getProductTitle = (product, language) => {
  return (
    getLocalizedText(product.title, language) ||
    getLocalizedText(product.name, language) ||
    product.title ||
    product.name ||
    product.id ||
    ""
  );
};

const getProductSlug = (product) => {
  return product.slug || product.en?.slug || product.ar?.slug || product.id || product.productId;
};

const formatDZD = (value, isArabic) => {
  const numberValue = Number(value || 0);
  const formattedNumber = numberValue.toLocaleString("fr-FR");
  return isArabic ? `${formattedNumber} دج` : `${formattedNumber} DZD`;
};

const formatDate = (value, isArabic) => {
  if (!value) return "";

  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(isArabic ? "ar-DZ" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeStatus = (status) => String(status || "pending").toLowerCase();

const getStatusLabel = (status, t) => {
  const normalized = normalizeStatus(status);
  return t[normalized] || status || t.unknown;
};

const isPaidOrder = (order) => normalizeStatus(order.status) === "paid";

const getOrderItemsCount = (order) => {
  const courses = Array.isArray(order.courses) ? order.courses.length : 0;
  const products = Array.isArray(order.products) ? order.products.length : 0;
  const services = Array.isArray(order.services) ? order.services.length : 0;
  return courses + products + services;
};

const getReadableOrderNumber = (order) => {
  const value = order.orderId || order.id || "";
  const parts = value.split("_");
  return parts.length >= 2 ? `#${parts[1].slice(-6)}` : `#${value.slice(-6)}`;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [language, setLanguage] = useState(getInitialLanguage);
  const [currentUser, setCurrentUser] = useState(null);

  const t = TRANSLATIONS[language];
  const isArabic = language === "ar";

  const [profileImage, setProfileImage] = useState(instructorImg);

  const [profileInfo, setProfileInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState("success");
  const [passwordMessageType, setPasswordMessageType] = useState("success");

  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = (event) => {
      const newLanguage = event.detail?.language;

      if (newLanguage === "ar" || newLanguage === "en") {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener("languageChanged", handleLanguageChanged);

    const interval = setInterval(() => {
      const savedLanguage = getInitialLanguage();
      setLanguage(savedLanguage);
    }, 300);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChanged);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) return;

      const savedProfile = getSavedProfile(user.uid);
      const displayName = savedProfile.displayName || user.displayName || "";
      const [firstName = "", ...lastNameParts] = displayName.split(" ");

      setProfileInfo({
        firstName: savedProfile.firstName || firstName || "",
        lastName: savedProfile.lastName || lastNameParts.join(" ") || "",
        email: savedProfile.email || user.email || "",
        phone: savedProfile.phone || "",
      });

      setProfileImage(savedProfile.photoURL || user.photoURL || instructorImg);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setPurchasedCourses([]);
      setPurchasedProducts([]);
      setUserOrders([]);
      return;
    }

    const fetchUserPurchases = async () => {
      try {
        setLoadingPurchases(true);

        const purchasesSnapshot = await getDocs(
          collection(db, "users", currentUser.uid, "purchasedCourses")
        );

        const purchases = purchasesSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        const coursesWithDetails = await Promise.all(
          purchases.map(async (purchase) => {
            try {
              const courseRef = doc(
                db,
                "courses",
                purchase.courseId || purchase.id
              );

              const courseSnapshot = await getDoc(courseRef);

              if (!courseSnapshot.exists()) {
                return purchase;
              }

              return {
                ...courseSnapshot.data(),
                ...purchase,
                id: purchase.courseId || purchase.id,
                courseId: purchase.courseId || purchase.id,
                purchaseId: purchase.id,
              };
            } catch (error) {
              console.warn("Could not load purchased course details:", error);
              return purchase;
            }
          })
        );

        setPurchasedCourses(
          coursesWithDetails.filter((course) => course.status !== "revoked")
        );
      } catch (error) {
        console.error("Error loading purchased courses:", error);
        setPurchasedCourses([]);
      } finally {
        setLoadingPurchases(false);
      }
    };

    const fetchUserOrders = async () => {
      try {
        setLoadingOrders(true);
        setLoadingProducts(true);

        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid)
        );

        const ordersSnapshot = await getDocs(ordersQuery);

        const paidOrders = ordersSnapshot.docs
          .map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }))
          .filter(isPaidOrder)
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          });

        setUserOrders(paidOrders);

        const productItems = paidOrders.flatMap((order) => {
          const products = Array.isArray(order.products) ? order.products : [];

          return products.map((product, index) => ({
            ...product,
            id: product.id || product.productId || `${order.id}-product-${index}`,
            productId: product.productId || product.id || "",
            orderId: order.orderId || order.id,
            orderDate: order.createdAt,
            adminStatus: order.adminStatus || "pending",
          }));
        });

        setPurchasedProducts(productItems);
      } catch (error) {
        console.error("Error loading user orders:", error);
        setUserOrders([]);
        setPurchasedProducts([]);
      } finally {
        setLoadingOrders(false);
        setLoadingProducts(false);
      }
    };

    fetchUserPurchases();
    fetchUserOrders();
  }, [currentUser]);

  const fullName = `${profileInfo.firstName} ${profileInfo.lastName}`.trim();

  const approvedOrders = useMemo(() => {
    return userOrders.filter(
      (order) => normalizeStatus(order.adminStatus) === "approved"
    ).length;
  }, [userOrders]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileInfo((currentInfo) => ({
      ...currentInfo,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordInfo((currentInfo) => ({
      ...currentInfo,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const imageDataUrl = reader.result;

      setProfileImage(imageDataUrl);

      if (currentUser) {
        const profileData = {
          ...profileInfo,
          displayName: fullName,
          photoURL: imageDataUrl,
        };

        saveProfileLocally(currentUser.uid, profileData);

        try {
          await updateProfile(currentUser, {
            displayName: fullName,
            photoURL: imageDataUrl,
          });
        } catch (error) {
          console.error("Firebase profile image update error:", error);
        }
      }

      setProfileMessageType("success");
      setProfileMessage(t.imageUpdated);
    };

    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      setProfileMessageType("error");
      setProfileMessage(t.mustLogin);
      return;
    }

    try {
      const displayName = fullName || currentUser.displayName || "";

      await updateProfile(currentUser, {
        displayName,
        photoURL: profileImage,
      });

      const profileData = {
        ...profileInfo,
        displayName,
        photoURL: profileImage,
      };

      saveProfileLocally(currentUser.uid, profileData);

      setProfileMessageType("success");
      setProfileMessage(t.profileSaved);
    } catch (error) {
      console.error("Profile update error:", error);
      setProfileMessageType("error");
      setProfileMessage(t.errorMessage);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      setPasswordMessageType("error");
      setPasswordMessage(t.mustLogin);
      return;
    }

    if (!passwordInfo.currentPassword) {
      setPasswordMessageType("error");
      setPasswordMessage(t.passwordCurrentRequired);
      return;
    }

    if (passwordInfo.newPassword.length < 8) {
      setPasswordMessageType("error");
      setPasswordMessage(t.passwordMinLength);
      return;
    }

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      setPasswordMessageType("error");
      setPasswordMessage(t.passwordNotMatch);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordInfo.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordInfo.newPassword);

      setPasswordMessageType("success");
      setPasswordMessage(t.passwordUpdated);

      setPasswordInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update error:", error);

      setPasswordMessageType("error");

      if (error.code === "auth/wrong-password") {
        setPasswordMessage(t.wrongPassword);
      } else if (error.code === "auth/requires-recent-login") {
        setPasswordMessage(t.needRecentLogin);
      } else {
        setPasswordMessage(t.errorMessage);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("site_user");
      sessionStorage.clear();

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderOrderItems = (order) => {
    const courses = Array.isArray(order.courses) ? order.courses : [];
    const products = Array.isArray(order.products) ? order.products : [];
    const services = Array.isArray(order.services) ? order.services : [];

    const items = [
      ...courses.map((item) => ({ ...item, type: t.courses })),
      ...products.map((item) => ({ ...item, type: t.products })),
      ...services.map((item) => ({ ...item, type: t.services })),
    ];

    if (items.length === 0) {
      return <p className="dashboard-order-friendly-empty">{t.unknown}</p>;
    }

    return (
      <div className="dashboard-order-friendly-items">
        <p>{t.orderContains}</p>

        <div className="dashboard-order-friendly-grid">
          {items.map((item, index) => (
            <div className="dashboard-order-friendly-item" key={`${item.type}-${item.id || index}`}>
              <span>{item.type}</span>
              <strong>{item.title || item.name || item.id || t.unknown}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="dashboard-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="dashboard-hero-section">
        <div className="dashboard-container">
          <div className="dashboard-hero-card">
            <div className="dashboard-hero-left">
              <div className="dashboard-avatar-wrap">
                <img
                  src={profileImage}
                  alt="User profile"
                  className="dashboard-avatar"
                />

                <label className="dashboard-avatar-upload">
                  {t.change}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div>
                <p className="dashboard-welcome">{t.welcomeBack}</p>
                <h1>{fullName || t.profileSettings}</h1>
                <p className="dashboard-email">{profileInfo.email}</p>
              </div>
            </div>

            <div className="dashboard-hero-stats">
              <div className="dashboard-stat-card">
                <strong>{purchasedCourses.length}</strong>
                <span>{t.boughtCourses}</span>
              </div>

              <div className="dashboard-stat-card">
                <strong>0%</strong>
                <span>{t.bestProgress}</span>
              </div>

              <div className="dashboard-stat-card">
                <strong>{approvedOrders}</strong>
                <span>{t.approvedOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-content-section">
        <div className="dashboard-container dashboard-layout">
          <aside className="dashboard-sidebar">
            <button
              type="button"
              className={`dashboard-sidebar-btn ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              {t.profileSettings}
            </button>

            <button
              type="button"
              className={`dashboard-sidebar-btn ${
                activeTab === "password" ? "active" : ""
              }`}
              onClick={() => setActiveTab("password")}
            >
              {t.changePassword}
            </button>

            <button
              type="button"
              className={`dashboard-sidebar-btn ${
                activeTab === "courses" ? "active" : ""
              }`}
              onClick={() => setActiveTab("courses")}
            >
              {t.myCourses}
            </button>

            <button
              type="button"
              className={`dashboard-sidebar-btn ${
                activeTab === "products" ? "active" : ""
              }`}
              onClick={() => setActiveTab("products")}
            >
              {t.myProducts}
            </button>

            <button
              type="button"
              className={`dashboard-sidebar-btn ${
                activeTab === "orders" ? "active" : ""
              }`}
              onClick={() => setActiveTab("orders")}
            >
              {t.myOrders}
            </button>

            <button
              type="button"
              className="dashboard-sidebar-btn dashboard-logout-btn"
              onClick={handleLogout}
            >
              {t.logout}
            </button>
          </aside>

          <div className="dashboard-main">
            {activeTab === "profile" && (
              <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>{t.profileSettings}</h2>
                    <p>{t.profileDescription}</p>
                  </div>
                </div>

                <form
                  className="dashboard-form"
                  onSubmit={handleProfileSubmit}
                >
                  <div className="dashboard-form-grid">
                    <div className="dashboard-form-group">
                      <label htmlFor="firstName">{t.firstName}</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={profileInfo.firstName}
                        onChange={handleProfileChange}
                        placeholder={t.firstNamePlaceholder}
                      />
                    </div>

                    <div className="dashboard-form-group">
                      <label htmlFor="lastName">{t.lastName}</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={profileInfo.lastName}
                        onChange={handleProfileChange}
                        placeholder={t.lastNamePlaceholder}
                      />
                    </div>

                    <div className="dashboard-form-group">
                      <label htmlFor="email">{t.email}</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={profileInfo.email}
                        onChange={handleProfileChange}
                        placeholder={t.emailPlaceholder}
                        disabled
                      />
                    </div>

                    <div className="dashboard-form-group">
                      <label htmlFor="phone">{t.phone}</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profileInfo.phone}
                        onChange={handleProfileChange}
                        placeholder={t.phonePlaceholder}
                      />
                    </div>
                  </div>

                  {profileMessage && (
                    <p
                      className={
                        profileMessageType === "success"
                          ? "dashboard-success-message"
                          : "dashboard-password-message error"
                      }
                    >
                      {profileMessage}
                    </p>
                  )}

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-primary-btn">
                      {t.saveChanges}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === "password" && (
              <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>{t.changePassword}</h2>
                    <p>{t.passwordDescription}</p>
                  </div>
                </div>

                <form
                  className="dashboard-form"
                  onSubmit={handlePasswordSubmit}
                >
                  <div className="dashboard-form-grid dashboard-form-grid--password">
                    <div className="dashboard-form-group dashboard-form-group--full">
                      <label htmlFor="currentPassword">
                        {t.currentPassword}
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordInfo.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder={t.currentPasswordPlaceholder}
                      />
                    </div>

                    <div className="dashboard-form-group">
                      <label htmlFor="newPassword">{t.newPassword}</label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordInfo.newPassword}
                        onChange={handlePasswordChange}
                        placeholder={t.newPasswordPlaceholder}
                      />
                    </div>

                    <div className="dashboard-form-group">
                      <label htmlFor="confirmPassword">
                        {t.confirmPassword}
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordInfo.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder={t.confirmPasswordPlaceholder}
                      />
                    </div>
                  </div>

                  {passwordMessage && (
                    <p
                      className={`dashboard-password-message ${passwordMessageType}`}
                    >
                      {passwordMessage}
                    </p>
                  )}

                  <div className="dashboard-form-actions">
                    <button type="submit" className="dashboard-primary-btn">
                      {t.updatePassword}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === "courses" && (
              <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>{t.myCourses}</h2>
                    <p>{t.coursesDescription}</p>
                  </div>
                </div>

                {loadingPurchases ? (
                  <p className="dashboard-empty-message">{t.loadingCourses}</p>
                ) : purchasedCourses.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <p>{t.noCourses}</p>
                    <Link to="/courses" className="dashboard-primary-btn">
                      {t.browseCourses}
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-courses-grid">
                    {purchasedCourses.map((course, index) => {
                      const localized = getLocalizedObject(course, language);
                      const title = getCourseTitle(course, language);
                      const description = getCourseDescription(course, language);
                      const level = localized.level || course.level || t.beginner;
                      const instructor =
                        localized.instructorName || course.instructorName || "";
                      const duration = localized.duration || course.duration || "";
                      const time = localized.workload || course.workload || "";
                      const price = course.price || course.priceValue || 0;
                      const featuredImageUrl =
                        course.featuredImageUrl || course.image || courseImage;
                      const badgeColor = course.badgeColor || "blue";
                      const progress = Number(course.progress || 0);

                      return (
                        <article
                          className="dashboard-course-card"
                          style={{ "--animation-order": index }}
                          key={course.courseId || course.id}
                        >
                          <div className="dashboard-course-image-wrap">
                            <img
                              src={featuredImageUrl}
                              alt={title}
                              className="dashboard-course-image"
                            />

                            <div
                              className={`dashboard-course-image-overlay ${badgeColor}`}
                            >
                              <h3>{title}</h3>
                            </div>

                            <div className="dashboard-course-type-badge">
                              <img src={monitorIcon} alt="" />
                              <span>{t.courseType}</span>
                            </div>

                            <button
                              className="dashboard-course-share-btn"
                              type="button"
                            >
                              <img src={shareIcon} alt="Share" />
                            </button>
                          </div>

                          <div className="dashboard-course-body">
                            <div className="dashboard-course-meta-row">
                              <span className="dashboard-course-level">
                                {level}
                              </span>

                              {instructor && (
                                <div className="dashboard-course-instructor">
                                  <img
                                    src={course.instructorAvatarUrl || instructorImg}
                                    alt={instructor}
                                  />
                                  <span>
                                    {t.instructor}:{" "}
                                    <strong>{instructor}</strong>
                                  </span>
                                </div>
                              )}
                            </div>

                            <h3 className="dashboard-course-title">
                              {title}
                            </h3>

                            <div className="dashboard-course-info">
                              {duration && (
                                <span>
                                  <img src={calendarIcon} alt="" />
                                  {duration}
                                </span>
                              )}

                              {time && (
                                <span>
                                  <img src={clockIcon} alt="" />
                                  {time}
                                </span>
                              )}
                            </div>

                            <p className="dashboard-course-desc">
                              {description}
                            </p>

                            <div className="dashboard-course-price-row">
                              <p>
                                {formatDZD(price, isArabic)}
                                <img src={coursesTagIcon} alt="" />
                              </p>
                            </div>

                            <div className="dashboard-progress-block">
                              <div className="dashboard-progress-top">
                                <span>{t.progress}</span>
                                <strong>{progress}%</strong>
                              </div>

                              <div className="dashboard-progress-track">
                                <div
                                  className="dashboard-progress-fill"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>

                            <Link
                              to={`/courses/${getCourseSlug(course)}`}
                              className="dashboard-course-btn"
                            >
                              {t.continueLearning}
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "products" && (
              <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>{t.myProducts}</h2>
                    <p>{t.productsDescription}</p>
                  </div>
                </div>

                {loadingProducts ? (
                  <p className="dashboard-empty-message">{t.loadingProducts}</p>
                ) : purchasedProducts.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <p>{t.noProducts}</p>
                    <Link to="/products" className="dashboard-primary-btn">
                      {t.browseProducts}
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-products-grid">
                    {purchasedProducts.map((product, index) => {
                      const title = getProductTitle(product, language);
                      const imageUrl = product.imageUrl || product.featuredImageUrl || product.image || courseImage;
                      const price = product.price || product.priceValue || 0;

                      return (
                        <article
                          className="dashboard-product-card"
                          key={`${product.orderId}-${product.id}-${index}`}
                        >
                          <img
                            src={imageUrl}
                            alt={title}
                            className="dashboard-product-image"
                          />

                          <div className="dashboard-product-body">
                            <span className="dashboard-product-type">
                              {t.productType}
                            </span>

                            <h3>{title}</h3>

                            <p className="dashboard-product-meta">
                              {t.orderNumber}: {getReadableOrderNumber({ id: product.orderId })}
                            </p>

                            <p className="dashboard-product-meta">
                              {t.adminStatus}: {getStatusLabel(product.adminStatus, t)}
                            </p>

                            <strong className="dashboard-product-price">
                              {formatDZD(price, isArabic)}
                            </strong>

                            <Link
                              to={`/products/${getProductSlug(product)}`}
                              className="dashboard-course-btn"
                            >
                              {t.viewProduct}
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "orders" && (
              <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>{t.myOrders}</h2>
                    <p>{t.ordersDescription}</p>
                  </div>
                </div>

                {loadingOrders ? (
                  <p className="dashboard-empty-message">{t.loadingOrders}</p>
                ) : userOrders.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <p>{t.noOrders}</p>
                  </div>
                ) : (
                  <div className="dashboard-orders-list">
                    {userOrders.map((order) => (
                      <article className="dashboard-order-card" key={order.id}>
                        <div className="dashboard-order-head">
                          <div>
                            <p className="dashboard-order-label">{t.orderNumber}</p>
                            <h3>{getReadableOrderNumber(order)}</h3>
                          </div>

                          <span
                            className={`dashboard-order-status dashboard-order-status--${normalizeStatus(
                              order.adminStatus || order.status
                            )}`}
                          >
                            {getStatusLabel(order.adminStatus || order.status, t)}
                          </span>
                        </div>

                        <div className="dashboard-order-grid">
                          <div>
                            <span>{t.date}</span>
                            <strong>{formatDate(order.createdAt, isArabic)}</strong>
                          </div>

                          <div>
                            <span>{t.amount}</span>
                            <strong>{formatDZD(order.amount, isArabic)}</strong>
                          </div>

                          <div>
                            <span>{t.adminStatus}</span>
                            <strong>{getStatusLabel(order.adminStatus, t)}</strong>
                          </div>

                          <div>
                            <span>{t.items}</span>
                            <strong>{getOrderItemsCount(order)}</strong>
                          </div>
                        </div>

                        {renderOrderItems(order)}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
