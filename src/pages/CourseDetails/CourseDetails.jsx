import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import "./CourseDetails.css";

import courseImage from "../../assets/featured_course.png";
import instructorImg from "../../assets/courses_account.png";
import clockIcon from "../../assets/Clock.png";
import calendarIcon from "../../assets/CalendarBlank.png";
import monitorIcon from "../../assets/MonitorPlay.png";
import UserIcon from "../../assets/user.png";
import shareIcon from "../../assets/ShareFat.png";
import videoImage from "../../assets/video_explicatif.jpg";
import shoppingCartIcon from "../../assets/shopping-cart.png";
import homeIcon from "../../assets/Home_icon.png";

import instructorFeatured from "../../assets/instructor_featured.jpg";
import bawsalaLogo from "../../assets/bawsala-logo.png";
import reviewAvatar from "../../assets/profile2.jpg";

import courseCatalogue from "../../assets/course_catalogue.png";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";


const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("site_language");

  if (savedLanguage === "ar" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
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

const parsePriceValue = (...values) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    const digitsOnly = String(value || "").replace(/[^\d]/g, "");

    if (digitsOnly) {
      return Number(digitsOnly);
    }
  }

  return 0;
};

const formatDZD = (value, isArabic) => {
  const numberValue = Number(value || 0);
  const formattedNumber = numberValue.toLocaleString("fr-FR");

  return isArabic ? `${formattedNumber} دج` : `${formattedNumber} DZD`;
};

const getCoursePriceValue = (course, localizedCourse = {}) => {
  if (!course) return 0;

  if (course.isFree) return 0;

  return parsePriceValue(
    localizedCourse.priceLabel,
    course.priceLabel,
    course.priceText,
    course.en?.priceLabel,
    course.ar?.priceLabel,
    localizedCourse.priceValue,
    course.priceValue,
    localizedCourse.price,
    course.price
  );
};

const getCourseOldPriceValue = (course, localizedCourse = {}) => {
  if (!course) return 0;

  return parsePriceValue(
    localizedCourse.oldPriceLabel,
    course.oldPriceLabel,
    course.oldPriceText,
    course.en?.oldPriceLabel,
    course.ar?.oldPriceLabel,
    localizedCourse.oldPriceValue,
    course.oldPriceValue,
    localizedCourse.oldPrice,
    course.oldPrice
  );
};

const getCoursePriceLabel = (course, localizedCourse = {}, isArabic, priceValue) => {
  const savedLabel =
    localizedCourse.priceLabel ||
    course?.priceLabel ||
    course?.priceText ||
    course?.en?.priceLabel ||
    course?.ar?.priceLabel ||
    "";

  if (savedLabel) return savedLabel;

  if (course?.isFree) return isArabic ? "مجاني" : "Free";

  if (priceValue > 0) return formatDZD(priceValue, isArabic);

  return "";
};

const normalizeText = (value) => {
  return String(value || "").trim().toLowerCase();
};

const getCourseTitle = (course, language) => {
  const localized = getLocalizedObject(course, language);

  return localized.title || localized.cardTitle || "";
};

const getCourseDescription = (course, language) => {
  const localized = getLocalizedObject(course, language);

  return (
    localized.cardShortDescription ||
    localized.subtitle ||
    localized.seoDescription ||
    ""
  );
};

const getCourseSlug = (course) => {
  return course?.slug || course?.en?.slug || course?.ar?.slug || course?.id;
};

const getCourseDetailsUrl = (course) => {
  return `/courses/${getCourseSlug(course)}`;
};

const splitTitleIntoLines = (title, language) => {
  const cleanTitle = String(title || "").trim();

  if (language === "ar") {
    return [cleanTitle];
  }

  const words = cleanTitle
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 2) return [cleanTitle];

  if (words.length <= 3) {
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")].filter(
      Boolean
    );
  }

  if (words.length === 4) {
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  }

  return [
    words.slice(0, 2).join(" "),
    words.slice(2, 4).join(" "),
    words.slice(4).join(" "),
  ].filter(Boolean);
};

const getYouTubeEmbedUrl = (url) => {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return "";

  try {
    const parsedUrl = new URL(cleanUrl);
    let videoId = "";

    if (parsedUrl.hostname.includes("youtu.be")) {
      videoId = parsedUrl.pathname.replace("/", "");
    } else if (parsedUrl.pathname.includes("/shorts/")) {
      videoId = parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] || "";
    } else if (parsedUrl.pathname.includes("/embed/")) {
      videoId = parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] || "";
    } else {
      videoId = parsedUrl.searchParams.get("v") || "";
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : cleanUrl;
  } catch (error) {
    return cleanUrl;
  }
};

const addYouTubeAutoplay = (url) => {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return "";

  try {
    const parsedUrl = new URL(cleanUrl);
    parsedUrl.searchParams.set("autoplay", "1");
    parsedUrl.searchParams.set("rel", "0");
    parsedUrl.searchParams.set("modestbranding", "1");
    parsedUrl.searchParams.set("controls", "1");
    parsedUrl.searchParams.set("disablekb", "1");
    return parsedUrl.toString();
  } catch (error) {
    return cleanUrl;
  }
};

const isPublished = (course) => {
  if (!course?.status) return true;

  return course.status === "published";
};

const getReviewData = (review, language) => {
  const localizedReview = getLocalizedObject(review, language);
  const englishReview = review?.en || {};
  const arabicReview = review?.ar || {};

  return {
    name: localizedReview.name || englishReview.name || arabicReview.name || "",
    role: localizedReview.role || englishReview.role || arabicReview.role || "",
    text: localizedReview.text || englishReview.text || arabicReview.text || "",

    avatarUrl:
      localizedReview.avatarUrl ||
      englishReview.avatarUrl ||
      arabicReview.avatarUrl ||
      review?.avatarUrl ||
      "",

    rating:
      englishReview.rating ||
      arabicReview.rating ||
      localizedReview.rating ||
      review?.rating ||
      0,
  };
};

function CourseSmallCard({ course, language, isArabic }) {
  const localized = getLocalizedObject(course, language);

  const title = getCourseTitle(course, language);
  const titleLines = splitTitleIntoLines(title, language);

  const description = getCourseDescription(course, language);

  const level = localized.level || "";
  const instructorName = localized.instructorName || "";
  const instructorLabel =
    localized.instructorLabel || (isArabic ? "المدرب:" : "Instructor:");

  const duration = localized.duration || "";
  const workload = localized.workload || "";
  const priceValue = getCoursePriceValue(course, localized);
  const priceLabel = getCoursePriceLabel(
    course,
    localized,
    isArabic,
    priceValue
  );

  const courseTypeLabel =
    localized.courseTypeLabel || (isArabic ? "دورة" : "Cours");

  const featuredImageUrl = course.featuredImageUrl || courseImage;
  const instructorAvatarUrl = course.instructorAvatarUrl || instructorImg;
  const badgeColor = course.badgeColor || "purple";

  return (
    <article className="related-course-card">
      <div className="related-course-image-wrap">
        <img
          src={featuredImageUrl}
          alt={title}
          className="related-course-image"
        />

        <div className={`related-course-overlay ${badgeColor}`}>
          <h3 dir={isArabic ? "rtl" : "ltr"}>
  {isArabic
    ? title
    : titleLines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < titleLines.length - 1 && <br />}
        </React.Fragment>
      ))}
</h3>
        </div>

        <div className="related-course-badge">
          <img src={monitorIcon} alt="" />
          <span>{courseTypeLabel}</span>
        </div>

        <button className="related-course-share" type="button">
          <img src={shareIcon} alt={isArabic ? "مشاركة" : "Share"} />
        </button>
      </div>

      <div className="related-course-meta">
        {level && <span className="related-course-level">{level}</span>}

        {instructorName && (
          <div className="related-course-instructor">
            <img src={instructorAvatarUrl} alt={instructorName} />
            <span>
              {instructorLabel} <strong>{instructorName}</strong>
            </span>
          </div>
        )}
      </div>

      <h3 className="related-course-title">{title}</h3>

      <div className="related-course-info">
        {duration && (
          <span>
            <img src={calendarIcon} alt="" />
            {duration}
          </span>
        )}

        {workload && (
          <span>
            <img src={clockIcon} alt="" />
            {workload}
          </span>
        )}
      </div>

      <p className="related-course-desc">{description}</p>

      <p className="details-card-price">
  <bdi>{priceLabel}</bdi>
</p>

      <Link to={getCourseDetailsUrl(course)} className="related-course-btn">
        {isArabic ? "عرض التفاصيل" : "View details"}
      </Link>
    </article>
  );
}

const CourseDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [cartError, setCartError] = useState("");
  const [mediaModal, setMediaModal] = useState(null);
  const [hasCourseAccess, setHasCourseAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [moduleVideoLoading, setModuleVideoLoading] = useState(false);
  const [moduleVideoError, setModuleVideoError] = useState("");

  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    if (!mediaModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMediaModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mediaModal]);

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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);

        let foundCourse = null;
        let allCourses = [];

        try {
          const byRootSlugQuery = query(
            collection(db, "courses"),
            where("slug", "==", slug),
            limit(1)
          );

          const byRootSlugSnapshot = await getDocs(byRootSlugQuery);

          if (!byRootSlugSnapshot.empty) {
            const docItem = byRootSlugSnapshot.docs[0];

            foundCourse = {
              id: docItem.id,
              ...docItem.data(),
            };
          }
        } catch (error) {
          console.warn("Root slug query failed, falling back:", error);
        }

        const allCoursesSnapshot = await getDocs(collection(db, "courses"));

        allCourses = allCoursesSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        if (!foundCourse) {
          foundCourse =
            allCourses.find((item) => {
              return (
                item.id === slug ||
                item.slug === slug ||
                item.en?.slug === slug ||
                item.ar?.slug === slug
              );
            }) || null;
        }

        setCourse(foundCourse);

        if (!foundCourse) {
          setRelatedCourses([]);
          return;
        }

        const publishedOtherCourses = allCourses.filter((item) => {
          return item.id !== foundCourse.id && isPublished(item);
        });

        const sameCategoryCourses = publishedOtherCourses.filter((item) => {
          return (
            foundCourse.categoryId &&
            item.categoryId &&
            item.categoryId === foundCourse.categoryId
          );
        });

        const fallbackCourses = publishedOtherCourses.filter((item) => {
          return !sameCategoryCourses.some(
            (sameCategoryItem) => sameCategoryItem.id === item.id
          );
        });

        const finalRelatedCourses = [
          ...sameCategoryCourses,
          ...fallbackCourses,
        ].slice(0, 3);

        setRelatedCourses(finalRelatedCourses);
      } catch (error) {
        console.error("Error loading course details:", error);
        setCourse(null);
        setRelatedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  const localizedCourse = useMemo(() => {
    return getLocalizedObject(course, language);
  }, [course, language]);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user || !course?.id) {
        setIsInCart(false);
        return;
      }

      try {
        const cartRef = doc(db, "users", user.uid, "cart", course.id);
        const cartSnapshot = await getDoc(cartRef);

        if (!cancelled) {
          setIsInCart(cartSnapshot.exists());
        }
      } catch (error) {
        console.error("Error checking cart item:", error);

        if (!cancelled) {
          setIsInCart(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [course?.id]);

  useEffect(() => {
    let cancelled = false;

    const checkCourseAccess = async () => {
      const user = auth.currentUser || currentUser;

      if (!course?.id) {
        if (!cancelled) {
          setHasCourseAccess(false);
          setCheckingAccess(false);
        }
        return;
      }

      if (course.isFree) {
        if (!cancelled) {
          setHasCourseAccess(true);
          setCheckingAccess(false);
        }
        return;
      }

      if (!user) {
        if (!cancelled) {
          setHasCourseAccess(false);
          setCheckingAccess(false);
        }
        return;
      }

      try {
        setCheckingAccess(true);

        const purchaseRef = doc(
          db,
          "users",
          user.uid,
          "purchasedCourses",
          course.id
        );

        const purchaseSnapshot = await getDoc(purchaseRef);

        if (!cancelled) {
          setHasCourseAccess(
            purchaseSnapshot.exists() &&
              purchaseSnapshot.data()?.status === "active"
          );
        }
      } catch (error) {
        console.error("Error checking course access:", error);

        if (!cancelled) {
          setHasCourseAccess(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingAccess(false);
        }
      }
    };

    checkCourseAccess();

    return () => {
      cancelled = true;
    };
  }, [course?.id, course?.isFree, currentUser]);

  useEffect(() => {
    const removeOwnedCourseFromCart = async () => {
      const user = auth.currentUser || currentUser;

      if (!hasCourseAccess || !course?.id || !user) return;

      try {
        const cartRef = doc(db, "users", user.uid, "cart", course.id);
        await deleteDoc(cartRef);
        setIsInCart(false);
      } catch (error) {
        console.error("Error removing owned course from cart:", error);
      }
    };

    removeOwnedCourseFromCart();
  }, [hasCourseAccess, course?.id, currentUser]);

  if (loading) {
    return (
      <main className="course-details-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="course-details-hero">
          <div className="course-details-layout">
            <p>{isArabic ? "جاري تحميل الدورة..." : "Loading course..."}</p>
          </div>
        </section>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="course-details-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="course-details-hero">
          <div className="course-details-layout">
            <div>
              <h1>{isArabic ? "الدورة غير موجودة" : "Course not found"}</h1>

              <Link to="/courses">
                {isArabic ? "العودة إلى الدورات" : "Back to courses"}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const title = localizedCourse.title || localizedCourse.cardTitle || "";
  const titleLines = splitTitleIntoLines(title, language);

  const subtitle =
    localizedCourse.subtitle || localizedCourse.seoDescription || "";

  const shortDescription =
    localizedCourse.cardShortDescription || localizedCourse.subtitle || "";

  const courseTypeLabel =
    localizedCourse.courseTypeLabel || (isArabic ? "دورة" : "Cours");

  const level = localizedCourse.level || "";
  const instructorName = localizedCourse.instructorName || "";
  const instructorLabel =
    localizedCourse.instructorLabel || (isArabic ? "المدرب:" : "Instructor:");

  const duration = localizedCourse.duration || "";
  const workload = localizedCourse.workload || "";

  const priceValue = getCoursePriceValue(course, localizedCourse);
  const oldPriceValue = getCourseOldPriceValue(course, localizedCourse);
  const priceLabel = getCoursePriceLabel(
    course,
    localizedCourse,
    isArabic,
    priceValue
  );

  const courseIsOwned = !checkingAccess && hasCourseAccess;
  const startLearningText = localizedCourse.startLearningText ||
    (isArabic ? "ابدأ التعلم" : "Start learning");

  const featuredImageUrl = course.featuredImageUrl || courseImage;
  const instructorAvatarUrl = course.instructorAvatarUrl || instructorImg;
  const instructorFeaturedUrl =
    course.instructorFeaturedUrl || instructorFeatured;
  const videoImageUrl = course.videoImageUrl || videoImage;
  const explanatoryVideoUrl = course.explanatoryVideoUrl || "";
  const catalogImageUrl = course.catalogImageUrl || courseCatalogue;
  const catalogPdfUrl = course.catalogPdfUrl || "";
  const badgeColor = course.badgeColor || "purple";

  const handleToggleCart = async () => {
    if (hasCourseAccess) {
      setActiveTab(1);
      return;
    }

    const user = auth.currentUser || currentUser;

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }

    if (!course?.id || cartBusy) return;

    const cartRef = doc(db, "users", user.uid, "cart", course.id);

    try {
      setCartBusy(true);
      setCartError("");

      if (isInCart) {
        await deleteDoc(cartRef);
        setIsInCart(false);
        return;
      }

      const cartItem = {
        courseId: course.id,
        slug: getCourseSlug(course),
        title,
        price: priceValue,
        priceValue,
        priceLabel,
        oldPrice: oldPriceValue,
        oldPriceValue,
        level,
        instructorName,
        instructorAvatarUrl,
        duration,
        workload,
        shortDescription,
        featuredImageUrl,
        badgeColor,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(cartRef, cartItem, { merge: true });
      setIsInCart(true);
    } catch (error) {
      console.error("Error updating cart:", error);
      setCartError(
        isArabic
          ? "تعذر تحديث السلة. يرجى المحاولة مرة أخرى."
          : "Could not update your cart. Please try again."
      );
    } finally {
      setCartBusy(false);
    }
  };

  const handleOpenModuleVideo = async (moduleItem) => {
    const user = auth.currentUser || currentUser;

    if (!hasCourseAccess || !course?.id || !user) {
      setModuleVideoError(
        isArabic
          ? "يجب شراء الكورس أولاً لمشاهدة هذا الفيديو."
          : "You need to buy this course first to watch this video."
      );
      return;
    }

    try {
      setModuleVideoLoading(true);
      setModuleVideoError("");

      const response = await fetch(`${API_BASE_URL}/api/course-module-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          courseId: course.id,
          moduleIndex: moduleItem.moduleIndex,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok || !data.embedUrl) {
        setModuleVideoError(
          data.message ||
            (isArabic
              ? "تعذر فتح الفيديو حالياً."
              : "Could not open the video right now.")
        );
        return;
      }

      setMediaModal({
        type: "youtube",
        url: addYouTubeAutoplay(data.embedUrl),
        title: `${moduleItem.module || ""} ${moduleItem.title || ""}`.trim(),
      });
    } catch (error) {
      console.error("Error loading protected module video:", error);

      setModuleVideoError(
        isArabic
          ? "حدث خطأ أثناء تحميل الفيديو."
          : "An error occurred while loading the video."
      );
    } finally {
      setModuleVideoLoading(false);
    }
  };

  const tabs = [
    localizedCourse.aboutTab || (isArabic ? "حول الدورة" : "About the Course"),
    localizedCourse.programmeTab || (isArabic ? "البرنامج" : "Programme"),
    localizedCourse.instructorTab || (isArabic ? "المدرب" : "Instructor"),
    localizedCourse.reviewsTab || (isArabic ? "التقييمات" : "Rating & Reviews"),
  ];

  const learningPoints = Array.isArray(localizedCourse.learningPoints)
    ? localizedCourse.learningPoints
    : [];

  const requirements = Array.isArray(localizedCourse.requirements)
    ? localizedCourse.requirements
    : [];

  const audienceTags = Array.isArray(localizedCourse.audienceTags)
    ? localizedCourse.audienceTags
    : [];

  const programmeModules = Array.isArray(course.programmeModules)
    ? course.programmeModules
        .map((module, index) => ({
          ...getLocalizedObject(module, language),
          moduleIndex: index,
          hasVideo: Boolean(module.youtubeUrl || module.videoUrl || module.hasVideo),
        }))
        .filter((module) => module?.title || module?.module)
    : [];

  const reviews = Array.isArray(course.reviews)
    ? course.reviews
        .map((review) => getReviewData(review, language))
        .filter((review) => review?.text || review?.name)
    : [];

  return (
    <main className="course-details-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="course-details-hero">
        <div className="course-details-layout">
          <aside className="course-details-side-card">
            <div className="details-card">
              <div className="details-card-image-wrap">
                <img
                  src={featuredImageUrl}
                  alt={title}
                  className="details-card-image"
                />

                <div className={`details-card-overlay ${badgeColor}`}>
                  <h3 dir={isArabic ? "rtl" : "ltr"}>
  {isArabic
    ? title
    : titleLines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < titleLines.length - 1 && <br />}
        </React.Fragment>
      ))}
</h3>
                </div>

                <div className="details-card-badge">
                  <img src={monitorIcon} alt="" />
                  <span>{courseTypeLabel}</span>
                </div>

                <button className="details-card-share" type="button">
                  <img src={shareIcon} alt={isArabic ? "مشاركة" : "Share"} />
                </button>
              </div>

              <div className="details-card-meta">
                {level && <span className="details-card-level">{level}</span>}

                {instructorName && (
                  <div className="details-card-instructor">
                    <img src={instructorAvatarUrl} alt={instructorName} />

                    <span>
                      {instructorLabel} <strong>{instructorName}</strong>
                    </span>
                  </div>
                )}
              </div>

              <h3 className="details-card-title">{title}</h3>

              <div className="details-card-info">
                {duration && (
                  <span>
                    <img src={calendarIcon} alt="" />
                    {duration}
                  </span>
                )}

                {workload && (
                  <span>
                    <img src={clockIcon} alt="" />
                    {workload}
                  </span>
                )}
              </div>

              <p className="details-card-desc">{shortDescription}</p>

              <p className="details-card-price">
                <bdi>{priceLabel}</bdi>
              </p>

              {courseIsOwned ? (
                <button
                  type="button"
                  className="details-cart-btn details-access-btn"
                  onClick={() => setActiveTab(1)}
                >
                  {startLearningText}
                </button>
              ) : (
                <button
                  type="button"
                  className={`details-cart-btn ${isInCart ? "is-in-cart" : ""}`}
                  onClick={handleToggleCart}
                  disabled={cartBusy || checkingAccess}
                >
                  <img src={shoppingCartIcon} alt="" className="details-cart-img" />

                  {cartBusy
                    ? isArabic
                      ? "جاري التحديث..."
                      : "Updating..."
                    : checkingAccess
                    ? isArabic
                      ? "جاري التحقق..."
                      : "Checking..."
                    : isInCart
                    ? localizedCourse.removeFromCartText ||
                      (isArabic ? "إزالة من السلة" : "Remove from cart")
                    : localizedCourse.addToCartText ||
                      (isArabic ? "أضف إلى السلة" : "Add to cart")}
                </button>
              )}

              {cartError && <p className="details-cart-error">{cartError}</p>}
            </div>

            <a
              href={catalogPdfUrl || catalogImageUrl}
              className="details-catalog-card"
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <div className="details-catalog-image-wrap">
                <img
                  src={catalogImageUrl}
                  alt={localizedCourse.catalogTitle || "Course catalogue"}
                  className="details-catalog-image"
                />
              </div>

              <div className="details-catalog-content">
                <h3>
                  {localizedCourse.catalogTitle ||
                    (isArabic ? "تحميل الكتالوج" : "Download the catalog")}{" "}
                  <span>{isArabic ? "←" : "→"}</span>
                </h3>

                <p>
                  {localizedCourse.catalogDescription ||
                    (isArabic
                      ? "اكتشف جميع محتوياتنا التعليمية"
                      : "Discover all our learning content")}
                </p>
              </div>
            </a>
          </aside>

          <div className="course-details-main">
            <nav className="course-breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="breadcrumb-home" aria-label="Home">
                <img src={homeIcon} alt="" />
              </Link>

              <span>›</span>

              <Link to="/courses">
                {isArabic ? "الدورات والبرامج" : "Courses and programmes"}
              </Link>

              <span>›</span>

              <span>{title}</span>
            </nav>

            <h1 className="course-details-title">{title}</h1>

            <p className="course-details-subtitle">{subtitle}</p>

            <div className="course-details-facts">
              <div className="course-fact">
                <div className="course-fact-head">
                  <span
                    className="course-fact-icon-img"
                    style={{ "--fact-icon": `url(${calendarIcon})` }}
                  ></span>

                  <span className="course-fact-label">
                    {localizedCourse.dateLabel || (isArabic ? "التاريخ" : "Date")}
                  </span>
                </div>

                <strong>{localizedCourse.dateValue}</strong>
              </div>

              <div className="course-fact">
                <div className="course-fact-head">
                  <span
                    className="course-fact-icon-img"
                    style={{ "--fact-icon": `url(${clockIcon})` }}
                  ></span>

                  <span className="course-fact-label">
                    {localizedCourse.scheduleLabel ||
                      (isArabic ? "الوقت" : "Schedule")}
                  </span>
                </div>

                <strong>{localizedCourse.scheduleValue}</strong>
              </div>

              <div className="course-fact">
                <div className="course-fact-head">
                  <span
                    className="course-fact-icon-img"
                    style={{ "--fact-icon": `url(${UserIcon})` }}
                  ></span>

                  <span className="course-fact-label">
                    {localizedCourse.formatLabel ||
                      (isArabic ? "الصيغة" : "Format")}
                  </span>
                </div>

                <strong>{localizedCourse.formatValue}</strong>
              </div>
            </div>
          </div>

          <div
            className={`course-video-card ${explanatoryVideoUrl ? "is-clickable" : ""}`}
            role={explanatoryVideoUrl ? "button" : undefined}
            tabIndex={explanatoryVideoUrl ? 0 : undefined}
            onClick={() => {
              if (!explanatoryVideoUrl) return;

              setMediaModal({
                type: "mp4",
                url: explanatoryVideoUrl,
                poster: videoImageUrl,
                title: isArabic ? "فيديو توضيحي" : "Explanatory video",
              });
            }}
            onKeyDown={(event) => {
              if (!explanatoryVideoUrl) return;

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setMediaModal({
                  type: "mp4",
                  url: explanatoryVideoUrl,
                  poster: videoImageUrl,
                  title: isArabic ? "فيديو توضيحي" : "Explanatory video",
                });
              }
            }}
          >
            <img
              src={videoImageUrl}
              alt={title}
              className="course-video-img"
            />

            {explanatoryVideoUrl && (
              <button
                className="course-video-play"
                type="button"
                aria-label={isArabic ? "تشغيل الفيديو التوضيحي" : "Play explanatory video"}
              >
                <span></span>
              </button>
            )}

            <div className="course-video-label">
              {isArabic ? "فيديو توضيحي" : "Explanatory video"}
            </div>
          </div>
        </div>
      </section>

      <section className="course-details-content-section">
        <div className="course-details-content-container">
          <div className="course-tabs">
            {tabs.map((tab, index) => (
              <button
                type="button"
                className={`course-tab ${activeTab === index ? "active" : ""}`}
                key={`${tab}-${index}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <div className="course-content">
              <p>{localizedCourse.aboutText}</p>

              {learningPoints.length > 0 && (
                <>
                  <h2>
                    {localizedCourse.learningTitle ||
                      (isArabic ? "ماذا ستتعلم؟" : "What You Will Learn?")}
                  </h2>

                  <ul className="course-learning-list">
                    {learningPoints.map((point, index) => (
                      <li key={`${point}-${index}`}>{point}</li>
                    ))}
                  </ul>
                </>
              )}

              {requirements.length > 0 && (
                <section className="course-requirements">
                  <h2>
                    {localizedCourse.requirementsTitle ||
                      (isArabic ? "المتطلبات" : "Requirements")}
                  </h2>

                  <div className="course-requirements-grid">
                    {requirements.map((requirement, index) => (
                      <div
                        className="course-requirement-pill"
                        key={`${requirement}-${index}`}
                      >
                        <span>{requirement}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div className="course-programme-content">
              <h2 className="course-programme-title">
                {localizedCourse.programmeTitle ||
                  (isArabic ? "محتوى الدورة" : "Course Content")}
              </h2>

              {moduleVideoError && (
                <p className="course-module-video-error">{moduleVideoError}</p>
              )}

              {checkingAccess ? (
                <div className="course-locked-message">
                  <h3>{isArabic ? "جاري التحقق من الوصول..." : "Checking access..."}</h3>
                  <p>
                    {isArabic
                      ? "يرجى الانتظار قليلاً."
                      : "Please wait a moment."}
                  </p>
                </div>
              ) : !hasCourseAccess ? (
                <div className="course-locked-message">
                  <h3>{isArabic ? "هذا المحتوى مقفل" : "This content is locked"}</h3>
                  <p>
                    {isArabic
                      ? "يجب شراء الكورس أولاً لمشاهدة الموديولات والفيديوهات."
                      : "You need to buy this course first to watch the modules and videos."}
                  </p>

                  <button
                    type="button"
                    className="details-cart-btn course-locked-cart-btn"
                    onClick={handleToggleCart}
                    disabled={cartBusy}
                  >
                    <img src={shoppingCartIcon} alt="" className="details-cart-img" />
                    {isInCart
                      ? isArabic
                        ? "الكورس موجود في السلة"
                        : "Course is in cart"
                      : isArabic
                      ? "أضف إلى السلة"
                      : "Add to cart"}
                  </button>
                </div>
              ) : (
                <div className="course-programme-list">
                  {programmeModules.map((item, index) => (
                    <div
                      className={`course-programme-row ${item.hasVideo ? "has-video" : ""}`}
                      key={index}
                      role={item.hasVideo ? "button" : undefined}
                      tabIndex={item.hasVideo ? 0 : undefined}
                      onClick={() => {
                        if (!item.hasVideo || moduleVideoLoading) return;
                        handleOpenModuleVideo(item);
                      }}
                      onKeyDown={(event) => {
                        if (!item.hasVideo || moduleVideoLoading) return;

                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleOpenModuleVideo(item);
                        }
                      }}
                    >
                      <div className="course-programme-text">
                        <h3>{item.module}</h3>
                        <p>{item.title}</p>
                      </div>

                      <div className="course-programme-actions">
                        <div className="course-programme-time">
                          <span>{item.start}</span>
                          <i></i>
                          <span>{item.end}</span>
                        </div>

                        {item.hasVideo && (
                          <button
                            type="button"
                            className="course-programme-play-btn"
                            disabled={moduleVideoLoading}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (moduleVideoLoading) return;
                              handleOpenModuleVideo(item);
                            }}
                          >
                            <span aria-hidden="true">▶</span>
                            {moduleVideoLoading
                              ? isArabic
                                ? "جاري التحميل..."
                                : "Loading..."
                              : isArabic
                              ? "مشاهدة"
                              : "Watch"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="course-instructor-content">
              <h2 className="course-instructor-heading">
                {localizedCourse.instructorSectionTitle ||
                  (isArabic ? "تعرف على المدرب" : "Meet Your Instructor")}
              </h2>

              <div className="course-instructor-card">
                <div className="course-instructor-image-wrap">
                  <img
                    src={instructorFeaturedUrl}
                    alt={instructorName}
                    className="course-instructor-featured"
                  />
                </div>

                <div className="course-instructor-info">
                  <img
                    src={bawsalaLogo}
                    alt="Bawsala"
                    className="course-instructor-logo"
                  />

                  <h3>{instructorName}</h3>

                  <p className="course-instructor-role">
                    {localizedCourse.instructorRole}
                  </p>

                  <p className="course-instructor-bio">
                    {localizedCourse.instructorBio}
                  </p>
                </div>
              </div>

              {audienceTags.length > 0 && (
                <div className="course-audience-section">
                  <h2 className="course-audience-title">
                    {localizedCourse.audienceTitle ||
                      (isArabic ? "هذه الدورة مناسبة لـ" : "This Course Is For")}
                  </h2>

                  <div className="course-audience-tags">
                    {audienceTags.map((tag, index) => (
                      <span
                        className={`course-audience-tag course-audience-tag--${
                          tag.color || "green"
                        }`}
                        key={`${tag.label}-${index}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div className="course-reviews-content">
              <h2 className="course-reviews-heading">
                {localizedCourse.reviewsTitle ||
                  (isArabic
                    ? "التقييمات والآراء حول الكورس"
                    : "Ratings & Reviews about the course")}
              </h2>

              <div className="course-reviews-grid">
                {reviews.map((review, index) => (
                  <article className="course-review-card" key={index}>
                    <div className="course-review-header">
                      <img
  src={review.avatarUrl}
  alt={review.name}
  className="course-review-avatar"
/>

                      <div className="course-review-user">
                        <h3>{review.name}</h3>
                        <p>{review.role}</p>
                      </div>
                    </div>

                    <div
                      className="course-review-stars"
                      aria-label={`${review.rating} out of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= Number(review.rating || 0)
                              ? "is-active"
                              : "is-muted"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <p className="course-review-text">{review.text}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {relatedCourses.length > 0 && (
        <section className="related-programs-section">
          <div className="related-programs-container">
            <div className="related-programs-header">
              <div>
                <h2>
                  {localizedCourse.relatedTitle ||
                    (isArabic
                      ? "اكتشف برامج تدريبية أخرى لتنظيم تعلمك على المدى الطويل"
                      : "Discover other training programs to structure your long-term learning")}
                </h2>

                <p>
                  {localizedCourse.relatedDescription ||
                    (isArabic
                      ? "استكشف مجموعة مختارة من البرامج التدريبية المصممة لمساعدتك على بناء مهارات جديدة."
                      : "Explore a curated selection of training programs designed to help you build new skills.")}
                </p>
              </div>

              <Link to="/courses" className="related-programs-see-more">
                {localizedCourse.relatedButtonText ||
                  (isArabic ? "عرض المزيد" : "See more")}{" "}
                <span>{isArabic ? "←" : "→"}</span>
              </Link>
            </div>

            <div className="related-programs-grid">
              {relatedCourses.map((relatedCourse) => (
                <CourseSmallCard
                  key={relatedCourse.id}
                  course={relatedCourse}
                  language={language}
                  isArabic={isArabic}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="course-contact-cta">
        <div className="course-contact-cta__container">
          <div className="course-contact-cta__card">
            <div className="course-contact-cta__avatars" aria-hidden="true">
              <img
                className="course-contact-cta__avatar course-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />

              <img
                className="course-contact-cta__avatar course-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />

              <img
                className="course-contact-cta__avatar course-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="course-contact-cta__title">
              {isArabic ? "ما زالت لديك أسئلة؟" : "Still have questions?"}
            </h3>

            <p className="course-contact-cta__subtitle">
              {isArabic
                ? "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا."
                : "Can’t find the answer you’re looking for? Please chat to our friendly team."}
            </p>

            <Link className="course-contact-cta__btn" to="/contact">
              {isArabic ? "تواصل معنا" : "Get in touch"}
            </Link>
          </div>
        </div>
      </section>

      {mediaModal && (
        <div
          className="course-media-modal"
          role="dialog"
          aria-modal="true"
          aria-label={mediaModal.title || (isArabic ? "مشغل الفيديو" : "Video player")}
          onClick={() => setMediaModal(null)}
        >
          <div
            className="course-media-modal__panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="course-media-modal__close"
              onClick={() => setMediaModal(null)}
              aria-label={isArabic ? "إغلاق الفيديو" : "Close video"}
            >
              ×
            </button>

            {mediaModal.title && (
              <h2 className="course-media-modal__title">{mediaModal.title}</h2>
            )}

            <div className="course-media-modal__frame">
              {mediaModal.type === "mp4" ? (
                <video controls autoPlay poster={mediaModal.poster || ""}>
                  <source src={mediaModal.url} type="video/mp4" />
                </video>
              ) : (
                <iframe
                  src={mediaModal.url}
                  title={mediaModal.title || "Course video"}
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CourseDetails;