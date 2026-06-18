import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../firebase";

import "./BlogDetail.css";

import BlogHeroImage from "../../assets/blog_featured_image.png";
import BlogContentImage from "../../assets/blog_featured_image_2.png";

import InstagramShareIcon from "../../assets/instagram.png";
import XShareIcon from "../../assets/x.png";
import WhatsappShareIcon from "../../assets/whatsapp.png";
import LinkedinShareIcon from "../../assets/linkedin.png";
import FacebookShareIcon from "../../assets/facebook.png";
import SendIcon from "../../assets/send-01.png";

import PostImage from "../../assets/insights.jpg";

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

const isPublished = (blog) => {
  if (!blog?.status) return true;

  return blog.status === "published";
};

const getBlogSlug = (blog) => {
  return blog?.slug || blog?.en?.slug || blog?.ar?.slug || blog?.id;
};

const getBlogUrl = (blog) => {
  return `/blog/${getBlogSlug(blog)}`;
};

const getBlogTitle = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.title || localizedBlog.seoTitle || "";
};

const getBlogSubtitle = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.subtitle || localizedBlog.seoDescription || "";
};

const getBlogPublishedText = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return (
    localizedBlog.publishedOnText ||
    localizedBlog.metaDateText ||
    localizedBlog.dateText ||
    ""
  );
};

const getBlogReadTime = (blog, language, isArabic) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return (
    localizedBlog.readTimeText ||
    localizedBlog.metaReadTimeText ||
    (isArabic ? "دقيقتان قراءة" : "2 minute read")
  );
};

const getBlogCategoryName = (blog, categories, language) => {
  const category = categories.find((item) => item.id === blog.categoryId);

  if (category) {
    const localizedCategory = getLocalizedObject(category, language);
    return localizedCategory.name || "";
  }

  return getLocalizedText(blog.categoryName, language) || blog.category || "";
};

const getBlogHeroImage = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return (
    localizedBlog.heroImageUrl ||
    localizedBlog.contentImageUrl ||
    blog.heroImageUrl ||
    blog.contentImageUrl ||
    BlogHeroImage
  );
};

const getBlogContentImage = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return (
    localizedBlog.contentImageUrl ||
    blog.contentImageUrl ||
    localizedBlog.heroImageUrl ||
    blog.heroImageUrl ||
    BlogContentImage
  );
};

const getBlogImageAlt = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return (
    localizedBlog.heroImageAlt ||
    localizedBlog.contentImageAlt ||
    localizedBlog.title ||
    ""
  );
};

const getBlogArticleHtml = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.articleHtml || localizedBlog.contentHtml || "";
};

const getBlogLatestExcerpt = (blog, language) => {
  const localizedBlog = getLocalizedObject(blog, language);

  return localizedBlog.subtitle || localizedBlog.seoDescription || "";
};

function LatestBlogCard({
  blog,
  categories,
  language,
  isArabic,
  variantIndex,
}) {
  const title = getBlogTitle(blog, language);
  const excerpt = getBlogLatestExcerpt(blog, language);
  const category = getBlogCategoryName(blog, categories, language);
  const image = getBlogHeroImage(blog, language);
  const publishedText = getBlogPublishedText(blog, language);
  const readTime = getBlogReadTime(blog, language, isArabic);

  return (
    <article
      className={`blog-latest-post-card blog-latest-post-card--tone-${
        variantIndex + 1
      }`}
    >
      <Link className="blog-latest-media" to={getBlogUrl(blog)}>
        <img src={image || PostImage} alt={title} loading="lazy" />

        <span className="blog-latest-category-badge">
          {category || (isArabic ? "مقال" : "Article")}
        </span>
      </Link>

      <div className="blog-latest-meta">
        {publishedText && <span>{publishedText}</span>}
        {readTime && <span>{readTime}</span>}
      </div>

      <h3>{title}</h3>

      <p>{excerpt}</p>

      <Link to={getBlogUrl(blog)}>
        {isArabic ? "اقرأ المقال" : "Read post"}{" "}
        <span>{isArabic ? "↖" : "↗"}</span>
      </Link>
    </article>
  );
}

const BlogDetail = () => {
  const { slug } = useParams();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [blog, setBlog] = useState(null);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");
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
    const fetchBlogData = async () => {
      try {
        setLoading(true);

        let foundBlog = null;
        let allBlogs = [];
        let fetchedCategories = [];

        try {
          const categoriesSnapshot = await getDocs(
            collection(db, "blogCategories")
          );

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          console.warn("Could not load blog categories:", error);
          fetchedCategories = [];
        }

        try {
          const byRootSlugQuery = query(
            collection(db, "blogs"),
            where("slug", "==", slug),
            limit(1)
          );

          const byRootSlugSnapshot = await getDocs(byRootSlugQuery);

          if (!byRootSlugSnapshot.empty) {
            const docItem = byRootSlugSnapshot.docs[0];

            foundBlog = {
              id: docItem.id,
              ...docItem.data(),
            };
          }
        } catch (error) {
          console.warn("Root slug query failed, using full blogs scan:", error);
        }

        const blogsSnapshot = await getDocs(collection(db, "blogs"));

        allBlogs = blogsSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        if (!foundBlog) {
          foundBlog =
            allBlogs.find((item) => {
              return (
                item.id === slug ||
                item.slug === slug ||
                item.en?.slug === slug ||
                item.ar?.slug === slug
              );
            }) || null;
        }

        const otherPublishedBlogs = allBlogs
          .filter((item) => foundBlog && item.id !== foundBlog.id)
          .filter(isPublished)
          .sort((a, b) => {
            return (
              timestampToMs(b.publishedAt || b.createdAt || b.updatedAt) -
              timestampToMs(a.publishedAt || a.createdAt || a.updatedAt)
            );
          })
          .slice(0, 3);

        setBlog(foundBlog);
        setLatestBlogs(otherPublishedBlogs);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading blog detail:", error);
        setBlog(null);
        setLatestBlogs([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [slug]);

  const localizedBlog = useMemo(() => {
    return getLocalizedObject(blog, language);
  }, [blog, language]);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    setEmail("");
  };

  if (loading) {
    return (
      <main className="blog-detail-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="blog-detail-hero">
          <div className="blog-detail-container">
            <p className="blog-detail-loading">
              {isArabic ? "جاري تحميل المقال..." : "Loading article..."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="blog-detail-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="blog-detail-hero">
          <div className="blog-detail-container">
            <div className="blog-detail-not-found">
              <h1>{isArabic ? "المقال غير موجود" : "Article not found"}</h1>

              <Link to="/blog">
                {isArabic ? "العودة إلى المدونة" : "Back to blog"}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const title = getBlogTitle(blog, language);
  const subtitle = getBlogSubtitle(blog, language);
  const publishedText = getBlogPublishedText(blog, language);
  const readTime = getBlogReadTime(blog, language, isArabic);
  const heroImage = getBlogHeroImage(blog, language);
  const contentImage = getBlogContentImage(blog, language);
  const imageAlt = getBlogImageAlt(blog, language) || title;
  const articleHtml = getBlogArticleHtml(blog, language);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const socialLinks = [
    {
      name: "Instagram",
      icon: InstagramShareIcon,
      href: "https://www.instagram.com/",
    },
    {
      name: "X",
      icon: XShareIcon,
      href: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      icon: WhatsappShareIcon,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedShareUrl}`,
    },
    {
      name: "LinkedIn",
      icon: LinkedinShareIcon,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
    },
    {
      name: "Facebook",
      icon: FacebookShareIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
    },
  ];

  const introTitle =
    localizedBlog.introductionTitle || (isArabic ? "المقدمة" : "Introduction");

  const introText =
    localizedBlog.introductionText ||
    localizedBlog.description ||
    subtitle ||
    "";

  const quoteText = localizedBlog.quoteText || localizedBlog.quote || "";

  const softwareTitle =
    localizedBlog.softwareTitle ||
    localizedBlog.toolsTitle ||
    localizedBlog.softwareAndToolsTitle ||
    "";

  const resourcesTitle =
    localizedBlog.resourcesTitle ||
    localizedBlog.otherResourcesTitle ||
    "";

  const resourcesText =
    localizedBlog.resourcesText ||
    localizedBlog.otherResourcesText ||
    "";

  const resourcesList = Array.isArray(localizedBlog.resourcesList)
    ? localizedBlog.resourcesList
    : [];

  const closingText =
    localizedBlog.closingText ||
    localizedBlog.conclusionText ||
    "";

  return (
    <main className="blog-detail-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="blog-detail-hero">
        <div className="blog-detail-container">
          <div className="blog-detail-hero__content">
            <div className="blog-detail-meta-line">
              {publishedText && <span>{publishedText}</span>}

              {publishedText && readTime && (
                <span className="blog-detail-meta-line__dash">—</span>
              )}

              {readTime && (
                <>
                  <span className="blog-detail-meta-line__clock" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M12 7v5l3.2 2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <span>{readTime}</span>
                </>
              )}
            </div>

            <h1>{title}</h1>

            {subtitle && <p>{subtitle}</p>}
          </div>

          <img
            className="blog-detail-hero__image"
            src={heroImage}
            alt={imageAlt}
          />
        </div>
      </section>

      <section className="blog-detail-content-section">
        <div className="blog-detail-content-container">
          <article className="blog-detail-article">
            {articleHtml ? (
              <div
                className="blog-detail-html"
                dangerouslySetInnerHTML={{ __html: articleHtml }}
              />
            ) : (
              <>
                <h2>{introTitle}</h2>

                {introText && <p>{introText}</p>}

                <figure>
                  <img src={contentImage} alt={imageAlt} />

                  {localizedBlog.contentImageCaption && (
                    <figcaption>{localizedBlog.contentImageCaption}</figcaption>
                  )}
                </figure>

                {localizedBlog.afterImageText && (
                  <p>{localizedBlog.afterImageText}</p>
                )}

                {quoteText && <blockquote>“{quoteText}”</blockquote>}

                {softwareTitle && <h3>{softwareTitle}</h3>}

                {resourcesTitle && <h3>{resourcesTitle}</h3>}

                {resourcesText && <p>{resourcesText}</p>}

                {resourcesList.length > 0 && (
                  <ol>
                    {resourcesList.map((item, index) => (
                      <li key={`resource-${index}`}>{item}</li>
                    ))}
                  </ol>
                )}

                {closingText && <p>{closingText}</p>}
              </>
            )}
          </article>

          <nav
            className="blog-detail-share-rail"
            aria-label={isArabic ? "مشاركة المقال" : "Share article"}
          >
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.name}
              >
                <img src={item.icon} alt="" draggable="false" />
              </a>
            ))}
          </nav>

          <aside className="blog-detail-sidebar">
            <div className="blog-detail-newsletter-card">
              <div className="blog-detail-newsletter-icon">
                <img src={SendIcon} alt="" />
              </div>

              <h3>{isArabic ? "النشرة الأسبوعية" : "Weekly newsletter"}</h3>

              <p>
                {isArabic
                  ? "بدون إزعاج. فقط أحدث المقالات والنصائح والموارد في بريدك كل أسبوع."
                  : "No spam. Just the latest releases and tips, interesting articles, and exclusive interviews in your inbox every week."}
              </p>

              <form onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder={
                    isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"
                  }
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />

                <div className="blog-detail-newsletter-policy">
                  {isArabic ? "اقرأ عن " : "Read about our "}
                  <a href="#privacy">
                    {isArabic ? "سياسة الخصوصية" : "privacy policy"}
                  </a>
                  .
                </div>

                <button type="submit">
                  {isArabic ? "اشترك" : "Subscribe"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {latestBlogs.length > 0 && (
        <section className="blog-latest-section">
          <div className="blog-detail-container">
            <div className="blog-latest-card">
              <h2>{isArabic ? "أحدث المقالات" : "Latest articles"}</h2>

              <div className="blog-latest-grid">
                {latestBlogs.map((latestBlog, index) => (
                  <LatestBlogCard
                    key={latestBlog.id}
                    blog={latestBlog}
                    categories={categories}
                    language={language}
                    isArabic={isArabic}
                    variantIndex={index % 3}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="blog-detail-bottom-newsletter">
        <div className="blog-detail-container">
          <form
            className="blog-detail-bottom-newsletter__content"
            onSubmit={handleNewsletterSubmit}
          >
            <div>
              <h3>
                {isArabic ? "انضم إلى نشرتنا البريدية" : "Join our newsletter"}
              </h3>

              <p>
                {isArabic
                  ? "سنرسل لك رسالة مفيدة مرة واحدة في الأسبوع. بدون إزعاج."
                  : "We’ll send you a nice letter once per week. No spam."}
              </p>
            </div>

            <div className="blog-detail-bottom-newsletter__form">
              <input
                type="email"
                placeholder={
                  isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"
                }
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <button type="submit">{isArabic ? "اشترك" : "Subscribe"}</button>
            </div>
          </form>
        </div>
      </section>

      <section className="blog-detail-contact-cta">
        <div className="blog-detail-contact-cta__container">
          <div className="blog-detail-contact-cta__card">
            <div
              className="blog-detail-contact-cta__avatars"
              aria-hidden="true"
            >
              <img
                className="blog-detail-contact-cta__avatar blog-detail-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />

              <img
                className="blog-detail-contact-cta__avatar blog-detail-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />

              <img
                className="blog-detail-contact-cta__avatar blog-detail-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="blog-detail-contact-cta__title">
              {isArabic ? "ما زالت لديك أسئلة؟" : "Still have questions?"}
            </h3>

            <p className="blog-detail-contact-cta__subtitle">
              {isArabic
                ? "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا."
                : "Can’t find the answer you’re looking for? Please chat to our friendly team."}
            </p>

            <Link className="blog-detail-contact-cta__btn" to="/contact">
              {isArabic ? "تواصل معنا" : "Get in touch"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogDetail;