import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "../firebase";

import PostImage from "../assets/insights.jpg";

const TEXT = {
  en: {
    label: "Latest posts",
    title: "Insights & Articles",
    subtitle:
      "Practical knowledge, real-world perspectives, and tools to help leaders and organizations make better decisions.",
    viewAll: "View all posts",
    readPost: "Read post",
    publishedOn: "Published on",
    readTime: "8 min read",
    loading: "Loading articles...",
    empty: "No articles available yet.",
    previous: "Previous",
    next: "Next",
  },
  ar: {
    label: "أحدث المقالات",
    title: "رؤى ومقالات",
    subtitle:
      "معرفة عملية، ووجهات نظر واقعية، وأدوات تساعد القادة والمؤسسات على اتخاذ قرارات أفضل.",
    viewAll: "عرض كل المقالات",
    readPost: "اقرأ المقال",
    publishedOn: "نشر في",
    readTime: "8 دقائق قراءة",
    loading: "جاري تحميل المقالات...",
    empty: "لا توجد مقالات متاحة حالياً.",
    previous: "السابق",
    next: "التالي",
  },
};

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

const isPublished = (blog) => {
  if (!blog?.status) return true;

  return blog.status === "published";
};

const getBlogTitle = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.title || localizedBlog.seoTitle || "";
};

const getBlogExcerpt = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.subtitle || localizedBlog.seoDescription || "";
};

const getBlogDate = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  const dateText =
    localizedBlog.metaDateText ||
    localizedBlog.publishedOnText ||
    blog.metaDateText ||
    "";

  if (dateText) return dateText;

  const dateMs = timestampToMs(
    blog.publishedAt || blog.publishedDate || blog.createdAt
  );

  if (!dateMs) return "";

  return new Intl.DateTimeFormat(language === "ar" ? "ar-DZ" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateMs));
};

const getBlogReadTime = (blog, language, fallback) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.readTimeText || blog.readTimeText || fallback;
};

const getBlogCategoryName = (blog, categories, language) => {
  const category = categories.find((item) => item.id === blog.categoryId);

  if (category) {
    return getLocalizedObject(category, language).name || "";
  }

  return getLocalizedText(blog.categoryName, language) || blog.category || "";
};

const getBlogImage = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return (
    localizedBlog.heroImageUrl ||
    blog.heroImageUrl ||
    blog.contentImageUrl ||
    localizedBlog.contentImageUrl ||
    PostImage
  );
};

const getBlogImageAlt = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return (
    localizedBlog.heroImageAlt ||
    localizedBlog.contentImageAlt ||
    getBlogTitle(blog, language)
  );
};

const getBlogSlug = (blog) => {
  return blog.slug || blog.en?.slug || blog.ar?.slug || blog.id;
};

const getBlogUrl = (blog) => {
  return `/blog/${getBlogSlug(blog)}`;
};

export default function Insights() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const insightsScrollerRef = useRef(null);

  const isArabic = language === "ar";
  const text = TEXT[language];

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
    const fetchBlogsData = async () => {
      try {
        setLoading(true);

        let fetchedCategories = [];
        let fetchedBlogs = [];

        try {
          const categoriesSnapshot = await getDocs(
            query(collection(db, "blogCategories"), orderBy("createdAt", "desc"))
          );

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          const categoriesSnapshot = await getDocs(
            collection(db, "blogCategories")
          );

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        }

        try {
          const blogsSnapshot = await getDocs(
            query(collection(db, "blogs"), orderBy("publishedAt", "desc"))
          );

          fetchedBlogs = blogsSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          try {
            const blogsSnapshot = await getDocs(
              query(collection(db, "blogs"), orderBy("createdAt", "desc"))
            );

            fetchedBlogs = blogsSnapshot.docs.map((docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            }));
          } catch (fallbackError) {
            const blogsSnapshot = await getDocs(collection(db, "blogs"));

            fetchedBlogs = blogsSnapshot.docs.map((docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            }));
          }
        }

        setCategories(fetchedCategories);
        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error("Error loading home insights:", error);
        setCategories([]);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogsData();
  }, []);

  const latestBlogs = useMemo(() => {
    return blogs
      .filter(isPublished)
      .sort((a, b) => {
        return (
          timestampToMs(b.publishedAt || b.publishedDate || b.createdAt) -
          timestampToMs(a.publishedAt || a.publishedDate || a.createdAt)
        );
      })
      .slice(0, 3);
  }, [blogs]);

  const scrollInsights = (direction) => {
    const element = insightsScrollerRef.current;

    if (!element) return;

    const scrollAmount = 330;
    const rtlMultiplier = isArabic ? -1 : 1;

    element.scrollBy({
      left: direction * scrollAmount * rtlMultiplier,
      behavior: "smooth",
    });
  };

  return (
    <section className="insightsSection" dir={isArabic ? "rtl" : "ltr"}>
      <div className="insightsTop">
        <div className="insightsTopContent">
          <p className="insightsLabel">{text.label}</p>

          <h2 className="insightsTitle">{text.title}</h2>

          <p className="insightsSubtitle">{text.subtitle}</p>
        </div>

        <Link to="/blog" className="insightsTopBtn">
          {text.viewAll}
        </Link>
      </div>

      <div className="insightsCardsWrap">
        {loading ? (
          <div className="insightsState">{text.loading}</div>
        ) : latestBlogs.length === 0 ? (
          <div className="insightsState">{text.empty}</div>
        ) : (
          <>
            <div className="insightsGrid" ref={insightsScrollerRef}>
              {latestBlogs.map((post) => {
                const title = getBlogTitle(post, language);
                const excerpt = getBlogExcerpt(post, language);
                const date = getBlogDate(post, language);
                const readTime = getBlogReadTime(post, language, text.readTime);
                const category = getBlogCategoryName(post, categories, language);
                const image = getBlogImage(post, language);
                const imageAlt = getBlogImageAlt(post, language);
                const url = getBlogUrl(post);

                return (
                  <article className="insightCard" key={post.id}>
                    <Link to={url} className="insightMedia">
                      <img src={image} alt={imageAlt || title} loading="lazy" />

                      {category && (
                        <span className="insightCategoryBadge">{category}</span>
                      )}
                    </Link>

                    <div className="insightMeta">
                      {date && (
                        <span>
                          {text.publishedOn} {date}
                        </span>
                      )}

                      <span>{readTime}</span>
                    </div>

                    <h3 className="insightCardTitle">{title}</h3>

                    {excerpt && <p className="insightCardDesc">{excerpt}</p>}

                    <Link to={url} className="insightReadBtn">
                      {text.readPost} <span>{isArabic ? "↖" : "↗"}</span>
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="insightsArrows">
              <button
                type="button"
                className="insightsArrowBtn"
                onClick={() => scrollInsights(-1)}
                aria-label={text.previous}
              >
                ←
              </button>

              <button
                type="button"
                className="insightsArrowBtn"
                onClick={() => scrollInsights(1)}
                aria-label={text.next}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}