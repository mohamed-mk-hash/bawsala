import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../../firebase";

import "./Blogs.css";

import BlogAvatar1 from "../../assets/blog-avatar-1.png";
import SendIcon from "../../assets/send-01.png";
import IconWrap from "../../assets/Icon-wrap.png";

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

const getBlogAuthor = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.authorName || "";
};

const getBlogDate = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.metaDateText || localizedBlog.publishedOnText || "";
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
    ""
  );
};

const getBlogImageAlt = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.heroImageAlt || localizedBlog.contentImageAlt || "";
};

const getBlogSlug = (blog) => {
  return blog.slug || blog.en?.slug || blog.ar?.slug || blog.id;
};

const getBlogUrl = (blog) => {
  return `/blog/${getBlogSlug(blog)}`;
};

export default function Blogs() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [sort, setSort] = useState("recent");
  const [searchValue, setSearchValue] = useState("");

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
        console.error("Error loading blogs:", error);
        setCategories([]);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogsData();
  }, []);

  const publishedBlogs = useMemo(() => {
    return blogs.filter(isPublished);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const search = normalizeText(searchValue);

    const result = publishedBlogs.filter((blog) => {
      const localizedBlog = getLocalizedObject(blog, language);
      const categoryName = getBlogCategoryName(blog, categories, language);

      const searchableText = normalizeText(
        [
          localizedBlog.title,
          localizedBlog.subtitle,
          localizedBlog.seoTitle,
          localizedBlog.seoDescription,
          localizedBlog.authorName,
          localizedBlog.readTimeText,
          categoryName,
          blog.categorySlug,
          blog.slug,
          ...(Array.isArray(blog.tags) ? blog.tags : []),
        ].join(" ")
      );

      const matchesSearch = !search || searchableText.includes(search);

      const matchesCategory =
        activeCategoryId === "all" || blog.categoryId === activeCategoryId;

      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sort === "oldest") {
        return (
          timestampToMs(a.publishedAt || a.publishedDate || a.createdAt) -
          timestampToMs(b.publishedAt || b.publishedDate || b.createdAt)
        );
      }

      return (
        timestampToMs(b.publishedAt || b.publishedDate || b.createdAt) -
        timestampToMs(a.publishedAt || a.publishedDate || a.createdAt)
      );
    });
  }, [publishedBlogs, categories, language, searchValue, activeCategoryId, sort]);

  const tabs = useMemo(() => {
    return [
      {
        id: "all",
        name: isArabic ? "عرض الكل" : "View all",
      },
      ...categories.map((category) => ({
        id: category.id,
        name: getLocalizedObject(category, language).name || "",
      })),
    ].filter((tab) => tab.name);
  }, [categories, language, isArabic]);

  const firstThreeBlogs = filteredBlogs.slice(0, 3);
  const middleBlogs = filteredBlogs.slice(3, 5);
  const lastBlogs = filteredBlogs.slice(5, 8);

  return (
    <main className="blogsPage" dir={isArabic ? "rtl" : "ltr"}>
      <section className="blogsHero">
        <div className="blogsHero__container">
          <a href="#blog" className="blogsHero__kicker">
            {isArabic ? "مدونتنا" : "Our blog"}
          </a>

          <h1 className="blogsHero__title">
            {isArabic ? "موارد ورؤى" : "Resources and insights"}
          </h1>

          <p className="blogsHero__subtitle">
            {isArabic
              ? "أحدث الأخبار، المقالات، التقنيات، والموارد لمساعدتك على النمو."
              : "The latest industry news, interviews, technologies, and resources."}
          </p>

          <div className="blogsHero__searchWrap">
            <span className="blogsHero__searchIcon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M20 20l-3.6-3.6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <input
              className="blogsHero__search"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={isArabic ? "ابحث" : "Search"}
              aria-label={isArabic ? "البحث في المقالات" : "Search articles"}
            />
          </div>
        </div>
      </section>

      <section className="blogsGrid" id="blog">
        <div className="blogsGrid__container">
          <div className="blogsGrid__top">
            <div
              className="blogsGrid__tabs"
              role="tablist"
              aria-label={isArabic ? "تصنيفات المدونة" : "Blog categories"}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategoryId === tab.id}
                  className={`blogsGrid__tab ${
                    activeCategoryId === tab.id ? "is-active" : ""
                  }`}
                  onClick={() => setActiveCategoryId(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="blogsGrid__sort">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label={isArabic ? "ترتيب المقالات" : "Sort posts"}
              >
                <option value="recent">
                  {isArabic ? "الأحدث" : "Most recent"}
                </option>
                <option value="oldest">{isArabic ? "الأقدم" : "Oldest"}</option>
              </select>

              <span className="blogsGrid__chev" aria-hidden="true">
                ▾
              </span>
            </div>
          </div>

          {loading ? (
            <div className="blogsGrid__empty">
              {isArabic ? "جاري تحميل المقالات..." : "Loading articles..."}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="blogsGrid__empty">
              {isArabic
                ? "لم يتم العثور على مقالات مطابقة."
                : "No matching articles found."}
            </div>
          ) : (
            <div
              className="blogsGrid__grid blogsGrid__grid--animated"
              key={`${activeCategoryId}-${sort}-${searchValue}`}
            >
              {firstThreeBlogs.map((blog, index) => (
                <PostCard
                  key={blog.id}
                  blog={blog}
                  categories={categories}
                  language={language}
                  isArabic={isArabic}
                  animationIndex={index}
                />
              ))}

              <NewsletterCard
                isArabic={isArabic}
                animationIndex={firstThreeBlogs.length}
              />

              {middleBlogs.map((blog, index) => (
                <PostCard
                  key={blog.id}
                  blog={blog}
                  categories={categories}
                  language={language}
                  isArabic={isArabic}
                  animationIndex={firstThreeBlogs.length + 1 + index}
                />
              ))}

              {lastBlogs.map((blog, index) => (
                <PostCard
                  key={blog.id}
                  blog={blog}
                  categories={categories}
                  language={language}
                  isArabic={isArabic}
                  animationIndex={
                    firstThreeBlogs.length + 1 + middleBlogs.length + index
                  }
                />
              ))}
            </div>
          )}

          <div className="blogsGrid__pagination">
            <button className="blogsGrid__pagerBtn" type="button">
              {isArabic ? (
                <>
                  <span>السابق</span> →
                </>
              ) : (
                <>
                  ← <span>Previous</span>
                </>
              )}
            </button>

            <div className="blogsGrid__pages" aria-label="Pagination">
              <button className="blogsGrid__page is-active" type="button">
                1
              </button>
              <button className="blogsGrid__page" type="button">
                2
              </button>
              <button className="blogsGrid__page" type="button">
                3
              </button>
              <span className="blogsGrid__dots">…</span>
              <button className="blogsGrid__page" type="button">
                8
              </button>
              <button className="blogsGrid__page" type="button">
                9
              </button>
              <button className="blogsGrid__page" type="button">
                10
              </button>
            </div>

            <button className="blogsGrid__pagerBtn" type="button">
              {isArabic ? (
                <>
                  ← <span>التالي</span>
                </>
              ) : (
                <>
                  <span>Next</span> →
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="blogsCta">
        <div className="blogsCta__container">
          <div className="blogsCta__row">
            <div className="blogsCta__left">
              <h3 className="blogsCta__title">
                {isArabic ? "ابدأ تجربتك المجانية" : "Start your free trial"}
              </h3>

              <p className="blogsCta__desc">
                {isArabic
                  ? "انضم إلى المؤسسات التي تنمو مع بوصلة."
                  : "Join over 4,000+ startups already growing with Bawsala."}
              </p>
            </div>

            <div className="blogsCta__actions">
              <button
                className="blogsCta__btn blogsCta__btn--ghost"
                type="button"
              >
                {isArabic ? "اعرف المزيد" : "Learn more"}
              </button>

              <button
                className="blogsCta__btn blogsCta__btn--primary"
                type="button"
              >
                {isArabic ? "ابدأ الآن" : "Get started"}
              </button>
            </div>
          </div>

          <div className="blogsCta__row__newsletter">
            <div className="blogsCta__left">
              <h3 className="blogsCta__title-newsletter">
                {isArabic ? "انضم إلى نشرتنا البريدية" : "Join our newsletter"}
              </h3>

              <p className="blogsCta__desc-newsletter">
                {isArabic
                  ? "سنرسل لك رسالة مفيدة مرة واحدة في الأسبوع. بدون إزعاج."
                  : "We’ll send you a nice letter once per week. No spam."}
              </p>
            </div>

            <form
              className="blogsCta__form"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                className="blogsCta__input"
                type="email"
                placeholder={
                  isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"
                }
                aria-label={isArabic ? "البريد الإلكتروني" : "Email address"}
              />

              <button
                className="blogsCta__btn blogsCta__btn--primary"
                type="submit"
              >
                {isArabic ? "اشترك" : "Subscribe"}
              </button>
            </form>
          </div>

          <div className="blogsCta__bottomLine" />
        </div>
      </section>
    </main>
  );
}

function PostCard({ blog, categories, language, isArabic, animationIndex = 0 }) {
  const title = getBlogTitle(blog, language);
  const excerpt = getBlogExcerpt(blog, language);
  const author = getBlogAuthor(blog, language);
  const date = getBlogDate(blog, language);
  const category = getBlogCategoryName(blog, categories, language);

  const image = getBlogImage(blog, language);
  const imageAlt = getBlogImageAlt(blog, language) || title;

  const url = getBlogUrl(blog);

  return (
    <article
      className="postCard"
      lang={isArabic ? "ar" : "en"}
      style={{ "--card-index": animationIndex }}
    >
      <Link className="postCard__media" to={`/blog/${getBlogSlug(blog)}`}>
        {image && <img src={image} alt={imageAlt} loading="lazy" />}
      </Link>

      <div className="postCard__body">
        <span className="postCard__cat">{category}</span>

        <div className="postCard__titleRow">
          <h3 className="postCard__title">{title}</h3>

          <Link className="postCard__arrow" to={`/blog/${getBlogSlug(blog)}`}>
            <img
              src={IconWrap}
              alt=""
              className="postCard__iconImg"
              draggable="false"
            />
          </Link>
        </div>

        <p className="postCard__excerpt">{excerpt}</p>

        <div className="postCard__meta">
          <img
            className="postCard__avatar"
            src={blog.authorAvatarUrl || BlogAvatar1}
            alt={author}
            loading="lazy"
          />

          <div className="postCard__metaText">
            <div className="postCard__author">{author}</div>
            <div className="postCard__date">{date}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

function NewsletterCard({ isArabic, animationIndex = 0 }) {
  return (
    <aside
      className="newsletterCard"
      style={{ "--card-index": animationIndex }}
    >
      <div className="newsletterCard__icon" aria-hidden="true">
        <img
          src={SendIcon}
          alt=""
          className="newsletterCard__iconImg"
          draggable="false"
        />
      </div>

      <h3 className="newsletterCard__title">
        {isArabic ? "النشرة الأسبوعية" : "Weekly newsletter"}
      </h3>

      <p className="newsletterCard__desc">
        {isArabic
          ? "بدون إزعاج. فقط أحدث المقالات والنصائح والموارد في بريدك كل أسبوع."
          : "No spam. Just the latest releases and tips, interesting articles, and exclusive interviews in your inbox every week."}
      </p>

      <input
        className="newsletterCard__input"
        type="email"
        placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
      />

      <div className="newsletterCard__policy">
        {isArabic ? "اقرأ عن " : "Read about our "}
        <a href="#policy">{isArabic ? "سياسة الخصوصية" : "privacy policy"}</a>.
      </div>

      <button className="newsletterCard__btn" type="button">
        {isArabic ? "اشترك" : "Subscribe"}
      </button>
    </aside>
  );
}