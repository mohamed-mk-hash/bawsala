import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import "./Courses_Programs.css";

import { db } from "../../firebase";

import crownIcon from "../../assets/Crown.png";
import courseImage from "../../assets/featured_course.png";
import instructorImg from "../../assets/courses_account.png";
import clockIcon from "../../assets/Clock.png";
import calendarIcon from "../../assets/CalendarBlank.png";
import monitorIcon from "../../assets/MonitorPlay.png";
import shareIcon from "../../assets/ShareFat.png";

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

const timestampToMs = (value) => {
  if (!value) return 0;

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
};

const isPublished = (course) => {
  if (!course?.status) return true;

  return course.status === "published";
};

const getCourseTitle = (course, language) => {
  const localizedCourse = getLocalizedObject(course, language);

  return localizedCourse.title || localizedCourse.cardTitle || "";
};

const getCourseDescription = (course, language) => {
  const localizedCourse = getLocalizedObject(course, language);

  return (
    localizedCourse.cardShortDescription ||
    localizedCourse.subtitle ||
    localizedCourse.seoDescription ||
    ""
  );
};

const getCourseCategoryName = (course, categories, language) => {
  const category = categories.find((item) => item.id === course.categoryId);

  if (category) {
    return getLocalizedObject(category, language).name || "";
  }

  return getLocalizedText(course.categoryName, language) || "";
};

const getCourseSlug = (course) => {
  return course.slug || course.en?.slug || course.ar?.slug || course.id;
};

const getCourseUrl = (course) => {
  return `/courses/${getCourseSlug(course)}`;
};

const getCourseImage = (course) => {
  return (
    course.featuredImageUrl ||
    course.cardImageUrl ||
    course.heroImageUrl ||
    course.imageUrl ||
    courseImage
  );
};

const SECTION_TEXT = {
  en: {
    title: "Courses and programs",
    subtitle:
      "Explore practical courses, leadership programs, and specialized training experiences designed to develop skills, strengthen teams, and accelerate professional growth.",
    seeMore: "See more",
    loading: "Loading courses...",
    empty: "No courses available.",
    instructor: "Instructor:",
    courseType: "Cours",
    viewDetails: "View details",
    free: "Free",
  },
  ar: {
    title: "الدورات والبرامج",
    subtitle:
      "استكشف دورات عملية، وبرامج قيادية، وتجارب تدريبية متخصصة مصممة لتطوير المهارات، وتقوية الفرق، وتسريع النمو المهني.",
    seeMore: "عرض المزيد",
    loading: "جاري تحميل الدورات...",
    empty: "لا توجد دورات متاحة حالياً.",
    instructor: "المدرب:",
    courseType: "دورة",
    viewDetails: "عرض التفاصيل",
    free: "مجاني",
  },
};

const getPriceParts = (price, isArabic) => {
  if (!price) {
    return {
      number: "",
      currency: "",
      text: "",
    };
  }

  const value = String(price).trim();

  if (!isArabic) {
    return {
      number: "",
      currency: "",
      text: value,
    };
  }

  const numberPart = value
    .replace("دج", "")
    .replace(/\s+/g, "")
    .trim();

  const currencyPart = value.includes("دج") ? "دج" : "";

  return {
    number: numberPart,
    currency: currencyPart,
    text: value,
  };
};

const Courses_Programs = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const coursesScrollerRef = useRef(null);

  const isArabic = language === "ar";
  const text = SECTION_TEXT[language];

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
    const fetchCoursesData = async () => {
      try {
        setLoading(true);

        let fetchedCategories = [];
        let fetchedCourses = [];

        try {
          const categoriesSnapshot = await getDocs(
            query(collection(db, "courseCategories"), orderBy("createdAt", "desc"))
          );

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          const categoriesSnapshot = await getDocs(
            collection(db, "courseCategories")
          );

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        }

        try {
          const coursesSnapshot = await getDocs(
            query(collection(db, "courses"), orderBy("createdAt", "desc"))
          );

          fetchedCourses = coursesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          const coursesSnapshot = await getDocs(collection(db, "courses"));

          fetchedCourses = coursesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        }

        setCategories(fetchedCategories);
        setCourses(fetchedCourses.filter(isPublished));
      } catch (error) {
        console.error("Error loading courses section:", error);
        setCategories([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const featuredCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => {
        return (
          timestampToMs(b.publishedAt || b.createdAt || b.updatedAt) -
          timestampToMs(a.publishedAt || a.createdAt || a.updatedAt)
        );
      })
      .slice(0, 3);
  }, [courses]);

  const scrollCourses = (direction) => {
  const element = coursesScrollerRef.current;

  if (!element) return;

  const scrollAmount = 330;
  const rtlMultiplier = isArabic ? -1 : 1;

  element.scrollBy({
    left: direction * scrollAmount * rtlMultiplier,
    behavior: "smooth",
  });
};
  return (
    <section className="coursesSection" dir={isArabic ? "rtl" : "ltr"}>
      <div className="coursesContainer">
        <div className="coursesTop">
          <div className="coursesHeader">
            <h2 className="coursesTitle">
              <img src={crownIcon} alt="" className="coursesTitleIcon" />
              {text.title}
            </h2>

            <p className="coursesSubtitle">{text.subtitle}</p>
          </div>

          <Link to="/courses" className="coursesSeeMore">
            {text.seeMore} <span>{isArabic ? "←" : "→"}</span>
          </Link>
        </div>

        {loading ? (
          <div className="coursesSectionState">{text.loading}</div>
        ) : featuredCourses.length === 0 ? (
          <div className="coursesSectionState">{text.empty}</div>
        ) : (
          <div className="coursesGrid" ref={coursesScrollerRef}>
            {featuredCourses.map((course, index) => {
              const localizedCourse = getLocalizedObject(course, language);

              const title = getCourseTitle(course, language);

              const level = localizedCourse.level || "";
              const instructor = localizedCourse.instructorName || "";
              const instructorLabel =
                localizedCourse.instructorLabel || text.instructor;

              const duration = localizedCourse.duration || "";
              const workload = localizedCourse.workload || localizedCourse.time || "";

              const description = getCourseDescription(course, language);

              const price =
                localizedCourse.priceLabel ||
                course.priceText ||
                (course.isFree ? text.free : "");

              const priceParts = getPriceParts(price, isArabic);

              const image = getCourseImage(course);
              const instructorAvatar =
                course.instructorAvatarUrl ||
                localizedCourse.instructorAvatarUrl ||
                instructorImg;

              const courseTypeLabel =
                localizedCourse.courseTypeLabel ||
                getCourseCategoryName(course, categories, language) ||
                text.courseType;

              return (
                <article
                  className="course-card"
                  style={{ "--animation-order": index }}
                  key={course.id}
                >
                  <div className="course-image-wrap">
                    <img src={image} alt={title} className="course-image" />

                    <div className="course-type-badge">
                      <img src={monitorIcon} alt="" />
                      <span>{courseTypeLabel}</span>
                    </div>

                    <button className="course-share-btn" type="button">
                      <img src={shareIcon} alt={isArabic ? "مشاركة" : "Share"} />
                    </button>
                  </div>

                  <div className="course-meta-row">
                    {level && <span className="course-level">{level}</span>}

                    {instructor && (
                      <div className="course-instructor">
                        <img src={instructorAvatar} alt={instructor} />

                        <span>
                          {instructorLabel} <strong>{instructor}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="course-card-title">{title}</h3>

                  <div className="course-info">
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

                  {description && <p className="course-desc">{description}</p>}

                  {price && (
                    <p className="course-price">
                      {isArabic ? (
                        <>
                          <span className="course-price__number" dir="ltr">
                            {priceParts.number}
                          </span>

                          {priceParts.currency && (
                            <span className="course-price__currency">
                              {priceParts.currency}
                            </span>
                          )}
                        </>
                      ) : (
                        priceParts.text
                      )}
                    </p>
                  )}

                  <Link to={getCourseUrl(course)} className="course-details-btn">
                    {text.viewDetails}
                  </Link>
                </article>
              );
            })}
            
          </div>
        )}
      </div>
      <div className="coursesArrows">
  <button
    type="button"
    className="coursesArrowBtn"
    onClick={() => scrollCourses(-1)}
    aria-label={isArabic ? "السابق" : "Previous"}
  >
    ←
  </button>

  <button
    type="button"
    className="coursesArrowBtn"
    onClick={() => scrollCourses(1)}
    aria-label={isArabic ? "التالي" : "Next"}
  >
    →
  </button>
</div>
    </section>
  );
};

export default Courses_Programs;