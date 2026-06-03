import React, { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "./Courses.css";

import { db } from "../../firebase";

import headerBackground from "../../assets/carrer_header_background.png";

import bawsalaLogo from "../../assets/bawsala-logo.png";
import courseImage from "../../assets/featured_course.png";
import instructorImg from "../../assets/courses_account.png";
import clockIcon from "../../assets/Clock.png";
import calendarIcon from "../../assets/CalendarBlank.png";
import monitorIcon from "../../assets/MonitorPlay.png";
import shareIcon from "../../assets/ShareFat.png";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

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

const normalizeText = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim();
};

const getPriceNumber = (course, language = "en") => {
  const localizedCourse = getLocalizedObject(course, language);

  const priceText =
    localizedCourse.priceLabel ||
    course?.priceLabel ||
    course?.priceText ||
    course?.en?.priceLabel ||
    course?.ar?.priceLabel ||
    course?.priceValue ||
    course?.price ||
    "";

  if (typeof priceText === "number" && Number.isFinite(priceText)) {
    return priceText;
  }

  const numbersOnly = String(priceText).replace(/[^\d]/g, "");

  return Number(numbersOnly || 0);
};

const getPriceParts = (priceLabel, isArabic) => {
  if (!priceLabel) {
    return {
      number: "",
      currency: "",
      text: "",
    };
  }

  const value = String(priceLabel).trim();

  if (!isArabic) {
    return {
      number: "",
      currency: "",
      text: value,
    };
  }

  if (value.includes("دج")) {
    const numberPart = value
      .replace("دج", "")
      .replace(/\s+/g, "")
      .trim();

    return {
      number: numberPart,
      currency: "دج",
      text: value,
    };
  }

  return {
    number: value.replace(/\s+/g, "").trim(),
    currency: "",
    text: value,
  };
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

const getCategoryName = (category, language) => {
  const localizedCategory = getLocalizedObject(category, language);

  return localizedCategory.name || "";
};

const getCourseCategoryName = (course, categories, language) => {
  const category = categories.find((item) => item.id === course.categoryId);

  if (category) {
    return getCategoryName(category, language);
  }

  return getLocalizedText(course.categoryName, language);
};

const getDetailsUrl = (course) => {
  const slug = course.slug || course.en?.slug || course.ar?.slug;

  if (slug) {
    return `/courses/${slug}`;
  }

  return `/courses/${course.id}`;
};

const splitTitleIntoLines = (title, language) => {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 2) return [title];

  if (language === "ar") {
    if (words.length === 3) {
      return [words[0], words.slice(1).join(" ")];
    }

    if (words.length === 4) {
      return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
    }

    return [
      words.slice(0, 2).join(" "),
      words.slice(2, 4).join(" "),
      words.slice(4).join(" "),
    ].filter(Boolean);
  }

  if (words.length === 3) {
    return [words[0], words[1], words[2]];
  }

  if (words.length === 4) {
    return [`${words[0]} ${words[1]}`, words[2], words[3]];
  }

  return [
    words.slice(0, 2).join(" "),
    words.slice(2, 4).join(" "),
    words.slice(4).join(" "),
  ].filter(Boolean);
};

function FilterDropdown({
  iconClass,
  label,
  value,
  options,
  onChange,
  alignRight = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`courses-filter-dropdown ${alignRight ? "align-right" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="courses-filter-button"
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className={`courses-filter-icon ${iconClass}`}></span>

        {label && <span className="courses-filter-label">{label}</span>}

        <span className="courses-filter-value">{selectedOption.label}</span>

        <span className="courses-chevron"></span>
      </button>

      {open && (
        <div className="courses-filter-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`courses-filter-option ${
                option.value === value ? "active" : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const Courses = () => {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("recent");

  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

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
    const fetchData = async () => {
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
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error loading courses:", error);
        setCategories([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const publishedCourses = useMemo(() => {
    return courses.filter((course) => {
      if (!course.status) return true;

      return course.status === "published";
    });
  }, [courses]);

  const topSearches = useMemo(() => {
    const categoryNames = categories
      .map((category) => getCategoryName(category, language))
      .filter(Boolean);

    const courseNames = publishedCourses
      .slice(0, 4)
      .map((course) => getCourseTitle(course, language))
      .filter(Boolean);

    return [...new Set([...categoryNames, ...courseNames])].slice(0, 4);
  }, [categories, publishedCourses, language]);

  const filterOptions = useMemo(() => {
    const formats = new Set();
    const levels = new Set();

    publishedCourses.forEach((course) => {
      const localizedCourse = getLocalizedObject(course, language);

      if (localizedCourse.formatValue) {
        formats.add(localizedCourse.formatValue);
      }

      if (localizedCourse.level) {
        levels.add(localizedCourse.level);
      }
    });

    return {
      formats: Array.from(formats),
      levels: Array.from(levels),
    };
  }, [publishedCourses, language]);

  const filteredCourses = useMemo(() => {
    const search = normalizeText(searchValue);

    const result = publishedCourses.filter((course) => {
      const localizedCourse = getLocalizedObject(course, language);
      const categoryName = getCourseCategoryName(course, categories, language);

      const title = getCourseTitle(course, language);
      const description = getCourseDescription(course, language);

      const searchableText = normalizeText(
        [
          title,
          description,
          localizedCourse.subtitle,
          localizedCourse.instructorName,
          localizedCourse.level,
          localizedCourse.formatValue,
          categoryName,
          course.slug,
          course.categorySlug,
        ].join(" ")
      );

      const matchesSearch = !search || searchableText.includes(search);

      const matchesCategory =
        selectedCategoryId === "all" || course.categoryId === selectedCategoryId;

      const matchesFormat =
        formatFilter === "all" || localizedCourse.formatValue === formatFilter;

      const matchesLevel =
        levelFilter === "all" || localizedCourse.level === levelFilter;

      const priceNumber = getPriceNumber(course, language);

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && (course.isFree || priceNumber === 0)) ||
        (priceFilter === "paid" && !course.isFree && priceNumber > 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFormat &&
        matchesLevel &&
        matchesPrice
      );
    });

    return result.sort((a, b) => {
      if (sortFilter === "priceLow") {
        return getPriceNumber(a, language) - getPriceNumber(b, language);
      }

      if (sortFilter === "priceHigh") {
        return getPriceNumber(b, language) - getPriceNumber(a, language);
      }

      return (
        timestampToMs(b.publishedAt || b.createdAt || b.updatedAt) -
        timestampToMs(a.publishedAt || a.createdAt || a.updatedAt)
      );
    });
  }, [
    publishedCourses,
    categories,
    language,
    searchValue,
    selectedCategoryId,
    formatFilter,
    levelFilter,
    priceFilter,
    sortFilter,
  ]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectedCategoryId("all");
    setFormatFilter("all");
    setLevelFilter("all");
    setPriceFilter("all");
    setSortFilter("recent");
  };

  const formatOptions = [
    {
      value: "all",
      label: isArabic ? "الكل" : "All",
    },
    ...filterOptions.formats.map((format) => ({
      value: format,
      label: format,
    })),
  ];

  const levelOptions = [
    {
      value: "all",
      label: isArabic ? "الكل" : "All",
    },
    ...filterOptions.levels.map((level) => ({
      value: level,
      label: level,
    })),
  ];

  const priceOptions = [
    {
      value: "all",
      label: isArabic ? "الكل" : "All",
    },
    {
      value: "free",
      label: isArabic ? "مجاني" : "Free",
    },
    {
      value: "paid",
      label: isArabic ? "مدفوع" : "Paid",
    },
  ];

  const sortOptions = [
    {
      value: "recent",
      label: isArabic ? "الأحدث" : "Most recent",
    },
    {
      value: "priceLow",
      label: isArabic ? "الأقل سعرًا" : "Price: Low to High",
    },
    {
      value: "priceHigh",
      label: isArabic ? "الأعلى سعرًا" : "Price: High to Low",
    },
  ];

  return (
    <main className="courses-page" dir={isArabic ? "rtl" : "ltr"}>
      <section
        className="courses-hero"
        style={{
          backgroundImage: `url(${headerBackground})`,
        }}
      >
        <div className="courses-hero-content">
          <p className="courses-hero-label">
            {isArabic ? "الدورات والبرامج" : "Courses and Programs"}
          </p>

          <h1 className="courses-hero-title">
            {isArabic
              ? "دورات وبرامج لنمو حقيقي"
              : "Courses & programs for real growth"}
          </h1>

          <form className="courses-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="courses-search-input"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={
                isArabic
                  ? "ما الدورة أو البرنامج الذي تبحث عنه اليوم؟"
                  : "What course and program are you looking for today?"
              }
            />

            <button type="submit" className="courses-search-button">
              <span className="courses-search-icon"></span>
              {isArabic ? "بحث" : "Search"}
            </button>
          </form>

          {topSearches.length > 0 && (
            <div className="courses-top-searches">
              <span className="courses-top-label">
                {isArabic ? "الأكثر بحثًا" : "Top searches"}
              </span>

              <div className="courses-tags">
                {topSearches.map((item, index) => (
                  <button
                    type="button"
                    className="courses-tag"
                    style={{ "--animation-order": index }}
                    key={`${item}-${index}`}
                    onClick={() => setSearchValue(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="courses-filter-section">
        <div className="courses-filter-container">
          <div className="courses-category-grid">
            <button
              type="button"
              className={`courses-category-card ${
                selectedCategoryId === "all" ? "active" : ""
              }`}
              style={{ "--animation-order": 0 }}
              onClick={() => setSelectedCategoryId("all")}
            >
              <div
                className="courses-category-logo-box"
                style={{
                  backgroundImage: `url(${bawsalaLogo})`,
                }}
                aria-label="Bawsala logo"
              ></div>

              <span className="courses-category-title">
                {isArabic ? "كل الدورات والبرامج" : "All courses and programmes"}
              </span>
            </button>

            {categories.map((category, index) => {
              const categoryName = getCategoryName(category, language);
              const iconUrl = category.iconUrl || "";

              return (
                <button
                  type="button"
                  className={`courses-category-card ${
                    selectedCategoryId === category.id ? "active" : ""
                  }`}
                  style={{ "--animation-order": index + 1 }}
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={categoryName}
                      className="courses-category-icon"
                    />
                  ) : (
                    <div
                      className="courses-category-logo-box"
                      style={{
                        backgroundImage: `url(${bawsalaLogo})`,
                      }}
                      aria-label={categoryName}
                    ></div>
                  )}

                  <span className="courses-category-title">{categoryName}</span>
                </button>
              );
            })}
          </div>

          <div className="courses-filter-row">
            <div className="courses-filter-left">
              <FilterDropdown
                iconClass="format-icon"
                label={isArabic ? "الصيغة:" : "Format:"}
                value={formatFilter}
                options={formatOptions}
                onChange={setFormatFilter}
              />

              <FilterDropdown
                iconClass="level-icon"
                label={isArabic ? "المستوى:" : "Level:"}
                value={levelFilter}
                options={levelOptions}
                onChange={setLevelFilter}
              />

              <FilterDropdown
                iconClass="price-icon"
                label={isArabic ? "السعر:" : "Price:"}
                value={priceFilter}
                options={priceOptions}
                onChange={setPriceFilter}
              />
            </div>

            <FilterDropdown
              iconClass="date-icon"
              label=""
              value={sortFilter}
              options={sortOptions}
              onChange={setSortFilter}
              alignRight
            />
          </div>

          {(searchValue ||
            selectedCategoryId !== "all" ||
            formatFilter !== "all" ||
            levelFilter !== "all" ||
            priceFilter !== "all" ||
            sortFilter !== "recent") && (
            <div className="courses-active-filter-row">
              <button
                type="button"
                className="courses-clear-filters"
                onClick={clearFilters}
              >
                {isArabic ? "مسح الفلاتر" : "Clear filters"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="courses-list-section">
        <div className="courses-list-container">
          {loading ? (
            <div className="courses-empty-state">
              {isArabic ? "جاري تحميل الدورات..." : "Loading courses..."}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="courses-empty-state">
              {isArabic
                ? "لم يتم العثور على دورات مطابقة."
                : "No matching courses found."}
            </div>
          ) : (
            <div className="courses-list-grid">
              {filteredCourses.map((course, index) => {
                const localizedCourse = getLocalizedObject(course, language);

                const title = getCourseTitle(course, language);
                const titleLines = splitTitleIntoLines(title, language);

                const shortDescription = getCourseDescription(course, language);

                const level = localizedCourse.level || "";
                const instructor = localizedCourse.instructorName || "";
                const instructorLabel =
                  localizedCourse.instructorLabel ||
                  (isArabic ? "المدرب:" : "Instructor:");

                const duration = localizedCourse.duration || "";
                const workload = localizedCourse.workload || "";
                const courseTypeLabel =
                  localizedCourse.courseTypeLabel ||
                  (isArabic ? "دورة" : "Cours");

                const priceLabel =
                  localizedCourse.priceLabel ||
                  course.priceText ||
                  (course.isFree ? (isArabic ? "مجاني" : "Free") : "");

                  const priceParts = getPriceParts(priceLabel, isArabic);

                const imageUrl = course.featuredImageUrl || courseImage;
                const instructorAvatarUrl =
                  course.instructorAvatarUrl || instructorImg;

                const badgeColor = course.badgeColor || "purple";
                const detailsUrl = getDetailsUrl(course);

                return (
                  <article
                    className="course-card"
                    style={{ "--animation-order": index }}
                    key={course.id}
                  >
                    <div className="course-image-wrap">
                      <img src={imageUrl} alt={title} className="course-image" />

                      <div className={`course-image-overlay ${badgeColor}`}>
                        <h3 dir={isArabic ? "rtl" : "ltr"}>
  {titleLines.map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {line}
      {lineIndex < titleLines.length - 1 && <br />}
    </React.Fragment>
  ))}
</h3>
                      </div>

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
                          <img src={instructorAvatarUrl} alt={instructor} />
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

                    <p className="course-desc">{shortDescription}</p>

                    {priceLabel && (
  <p className="course-price">
    {isArabic && priceParts.currency ? (
      <>
        <span className="course-price__number" dir="ltr">
          {priceParts.number}
        </span>
        <span className="course-price__currency">
          {priceParts.currency}
        </span>
      </>
    ) : (
      priceParts.text
    )}
  </p>
)}

                    <a href={detailsUrl} className="course-details-btn">
                      {isArabic ? "عرض التفاصيل" : "View details"}
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="courses-contact-cta">
        <div className="courses-contact-cta__container">
          <div className="courses-contact-cta__card">
            <div className="courses-contact-cta__avatars" aria-hidden="true">
              <img
                className="courses-contact-cta__avatar courses-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />
              <img
                className="courses-contact-cta__avatar courses-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />
              <img
                className="courses-contact-cta__avatar courses-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="courses-contact-cta__title">
              {isArabic ? "ما زالت لديك أسئلة؟" : "Still have questions?"}
            </h3>

            <p className="courses-contact-cta__subtitle">
              {isArabic
                ? "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا."
                : "Can’t find the answer you’re looking for? Please chat to our friendly team."}
            </p>

            <a className="courses-contact-cta__btn" href="/contact">
              {isArabic ? "تواصل معنا" : "Get in touch"}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Courses;