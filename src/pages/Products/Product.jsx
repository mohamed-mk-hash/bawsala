import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import "./Product.css";

import { db } from "../../firebase";

import productHeroBg from "../../assets/product_hero.jpg";
import productHeroMacbook from "../../assets/MacBook_product_hero.png";

import productImage from "../../assets/Business_Plan_Template.png";

import viewAllIcon from "../../assets/view_all_products.png";

import priceIcon from "../../assets/price_products.png";
import mostRecentIcon from "../../assets/most_recent_products.png";

import instantDownloadIcon from "../../assets/free_download_guide.png";
import editableIcon from "../../assets/editable_products.png";
import professionalQualityIcon from "../../assets/Professional_Quality.png";
import saveTimeIcon from "../../assets/save_time_products.png";

import starIcon from "../../assets/review_star.png";
import pdfIcon from "../../assets/pdf_icon.png";
import downloadIcon from "../../assets/free_download_guide.png";
import cartIcon from "../../assets/shopping-cart.png";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

const HERO_TEXT = {
  en: {
    pill: "Used by startups, organizations, and growing businesses.",
    titleLineOne: "Ready-to-Use Business",
    titleLineTwo: "Templates & Systems",
    description:
      "Professional administrative templates, planning systems, and operational tools designed to help businesses work smarter and grow faster.",
    button: "Browse all the products",
    consultations: "More then 100+ consultations",
  },
  ar: {
    pill: "تستخدمها الشركات الناشئة والمؤسسات والأعمال النامية.",
    titleLineOne: "قوالب وأنظمة أعمال",
    titleLineTwo: "جاهزة للاستخدام",
    description:
      "قوالب إدارية احترافية، وأنظمة تخطيط، وأدوات تشغيلية مصممة لمساعدة الأعمال على العمل بذكاء والنمو بسرعة.",
    button: "تصفح جميع المنتجات",
    consultations: "أكثر من 100 استشارة",
  },
};

const FILTER_TEXT = {
  en: {
    viewAll: "View all",
    search: "Search",
    price: "Price:",
    all: "All",
    free: "Free",
    paid: "Paid",
    mostRecent: "Most recent",
    bestSeller: "Best seller",
    popular: "Popular",
    loading: "Loading products...",
    empty: "No products found.",
    addToCart: "Add to cart",
    downloadTemplate: "Download Template",
    viewDetails: "View details",
    downloads: "Downloads",
  },
  ar: {
    viewAll: "عرض الكل",
    search: "بحث",
    price: "السعر:",
    all: "الكل",
    free: "مجاني",
    paid: "مدفوع",
    mostRecent: "الأحدث",
    bestSeller: "الأكثر مبيعاً",
    popular: "الأكثر شيوعاً",
    loading: "جاري تحميل المنتجات...",
    empty: "لم يتم العثور على منتجات.",
    addToCart: "أضف إلى السلة",
    downloadTemplate: "تحميل القالب",
    viewDetails: "عرض التفاصيل",
    downloads: "تحميل",
  },
};

const BENEFITS_TEXT = {
  en: {
    title: "Why professionals choose our templates",
    items: [
      {
        title: "Instant Download",
        description:
          "Get immediate access to your files right after purchase or download.",
        icon: instantDownloadIcon,
      },
      {
        title: "Fully Editable",
        description:
          "Easily customize templates in Excel, Google Sheets, PowerPoint.",
        icon: editableIcon,
      },
      {
        title: "Professional Quality",
        description:
          "Built by business and management experts using operational frameworks.",
        icon: professionalQualityIcon,
      },
      {
        title: "Saves Time",
        description:
          "Reduce hours of manual planning and focus on execution instead of setup.",
        icon: saveTimeIcon,
      },
    ],
  },
  ar: {
    title: "لماذا يختار المحترفون قوالبنا",
    items: [
      {
        title: "تحميل فوري",
        description: "احصل على ملفاتك مباشرة بعد الشراء أو التحميل.",
        icon: instantDownloadIcon,
      },
      {
        title: "قابلة للتعديل بالكامل",
        description: "خصّص القوالب بسهولة على Excel وGoogle Sheets وPowerPoint.",
        icon: editableIcon,
      },
      {
        title: "جودة احترافية",
        description:
          "مبنية من طرف خبراء في الأعمال والإدارة باستخدام أطر تشغيلية عملية.",
        icon: professionalQualityIcon,
      },
      {
        title: "توفير للوقت",
        description:
          "قلّل ساعات التخطيط اليدوي وركّز على التنفيذ بدل إعداد الملفات من الصفر.",
        icon: saveTimeIcon,
      },
    ],
  },
};

const CTA_TEXT = {
  en: {
    title: "Still have questions?",
    subtitle:
      "Can’t find the answer you’re looking for? Please chat to our friendly team.",
    button: "Get in touch",
  },
  ar: {
    title: "ما زالت لديك أسئلة؟",
    subtitle: "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا.",
    button: "تواصل معنا",
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

const normalizeText = (value) => {
  return String(value || "").trim().toLowerCase();
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

const isPublished = (product) => {
  if (!product?.status) return true;
  return product.status === "published";
};

const getProductTitle = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  return localizedProduct.title || localizedProduct.seoTitle || "";
};

const getProductDescription = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  return (
    localizedProduct.heroDescriptionOne ||
    localizedProduct.seoDescription ||
    localizedProduct.aboutParagraphOne ||
    ""
  );
};

const getProductCategoryName = (product, categories, language) => {
  const category = categories.find((item) => item.id === product.categoryId);

  if (category) {
    return getLocalizedObject(category, language).name || "";
  }

  return (
    getLocalizedText(product.categoryName, language) ||
    getLocalizedObject(product, language).categoryLabel ||
    ""
  );
};

const getProductImage = (product) => {
  return (
    product.mainImageUrl ||
    product.galleryImages?.[0]?.url ||
    product.aboutImageOneUrl ||
    productImage
  );
};

const getProductSlug = (product) => {
  return product.slug || product.en?.slug || product.ar?.slug || product.id;
};

const getProductUrl = (product) => {
  return `/products/${getProductSlug(product)}`;
};

const getBadgeLabel = (badge, language) => {
  const value = String(badge || "").toLowerCase();

  if (language === "ar") {
    if (value === "new") return "جديد";
    if (value === "popular") return "شائع";
    if (value === "best seller") return "الأكثر مبيعاً";
  }

  return badge || "";
};

const Product = () => {
  const [language, setLanguage] = useState(getInitialLanguage);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("recent");

  const [loading, setLoading] = useState(true);

  const isArabic = language === "ar";

  const heroText = HERO_TEXT[language];
  const filterText = FILTER_TEXT[language];
  const benefitsText = BENEFITS_TEXT[language];
  const ctaText = CTA_TEXT[language];

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
    const fetchProductsData = async () => {
      try {
        setLoading(true);

        let fetchedCategories = [];
        let fetchedProducts = [];

        try {
          const categoriesSnapshot = await getDocs(
            query(collection(db, "productCategories"), orderBy("createdAt", "desc"))
          );

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          const categoriesSnapshot = await getDocs(
            collection(db, "productCategories")
          );

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        }

        try {
          const productsSnapshot = await getDocs(
            query(collection(db, "products"), orderBy("publishedAt", "desc"))
          );

          fetchedProducts = productsSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          try {
            const productsSnapshot = await getDocs(
              query(collection(db, "products"), orderBy("createdAt", "desc"))
            );

            fetchedProducts = productsSnapshot.docs.map((docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            }));
          } catch (fallbackError) {
            const productsSnapshot = await getDocs(collection(db, "products"));

            fetchedProducts = productsSnapshot.docs.map((docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            }));
          }
        }

        setCategories(fetchedCategories);
        setProducts(fetchedProducts.filter(isPublished));
      } catch (error) {
        console.error("Error loading products:", error);
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, []);

const categoryTabs = useMemo(() => {
  return [
    {
      id: "all",
      name: filterText.viewAll,
      icon: viewAllIcon,
    },
    ...categories.map((category) => {
      const localizedCategory = getLocalizedObject(category, language);
      const englishCategory = category.en || {};
      const arabicCategory = category.ar || {};

      return {
        id: category.id,
        name:
          localizedCategory.name ||
          englishCategory.name ||
          arabicCategory.name ||
          "",

        // iconUrl exists in en map in your database, so always fallback to en.iconUrl
        icon:
          category.iconUrl ||
          localizedCategory.iconUrl ||
          englishCategory.iconUrl ||
          arabicCategory.iconUrl ||
          viewAllIcon,
      };
    }),
  ].filter((item) => item.name);
}, [categories, language, filterText.viewAll]);

  const filteredProducts = useMemo(() => {
    const search = normalizeText(searchValue);

    const result = products.filter((product) => {
      const localizedProduct = getLocalizedObject(product, language);
      const categoryName = getProductCategoryName(product, categories, language);

      const searchableText = normalizeText(
        [
          localizedProduct.title,
          localizedProduct.seoTitle,
          localizedProduct.seoDescription,
          localizedProduct.heroDescriptionOne,
          localizedProduct.heroDescriptionTwo,
          localizedProduct.categoryLabel,
          categoryName,
          product.slug,
          product.categorySlug,
        ].join(" ")
      );

      const matchesCategory =
        activeCategoryId === "all" || product.categoryId === activeCategoryId;

      const matchesSearch = !search || searchableText.includes(search);

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && product.isFree) ||
        (priceFilter === "paid" && !product.isFree);

      return matchesCategory && matchesSearch && matchesPrice;
    });

    return [...result].sort((a, b) => {
      if (sortFilter === "popular") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      if (sortFilter === "bestSeller") {
        return Number(b.downloads || 0) - Number(a.downloads || 0);
      }

      return (
        timestampToMs(b.publishedAt || b.createdAt || b.updatedAt) -
        timestampToMs(a.publishedAt || a.createdAt || a.updatedAt)
      );
    });
  }, [
    products,
    categories,
    language,
    activeCategoryId,
    searchValue,
    priceFilter,
    sortFilter,
  ]);

  return (
    <main className="product-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="product-hero">
        <div
          className="product-hero__container"
          style={{ backgroundImage: `url(${productHeroBg})` }}
        >
          <div className="product-hero__content">
            <a href="/products" className="product-hero__pill">
              {heroText.pill}
              <span>{isArabic ? "←" : "→"}</span>
            </a>

            <h1>
              {heroText.titleLineOne}
              <br />
              {heroText.titleLineTwo}
            </h1>

            <p>{heroText.description}</p>

            <div className="product-hero__bottom">
              <a href="#products" className="product-hero__button">
                {heroText.button}
              </a>

              <div className="product-hero__social">
                <div className="product-hero__avatars">
                  <img src={profile1} alt="" />
                  <img src={profile2} alt="" />
                  <img src={profile3} alt="" />
                  <img src={profile1} alt="" />
                </div>

                <div>
                  <span>{heroText.consultations}</span>

                  <div className="product-hero__stars">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <img src={starIcon} alt="" key={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-hero__media">
            <img src={productHeroMacbook} alt="" />
          </div>
        </div>
      </section>

      <section className="product-list-section" id="products">
        <div className="product-container">
          <div className="product-toolbar">
            <div className="product-categories">
              {categoryTabs.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`product-category-btn ${
                    activeCategoryId === category.id ? "active" : ""
                  }`}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  <img src={category.icon} alt="" />
                  {category.name}
                </button>
              ))}
            </div>

            <div className="product-search">
              <span></span>

              <input
                type="text"
                placeholder={filterText.search}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </div>

          <div className="product-filters">
            <label className="product-select">
              <img src={priceIcon} alt="" />

              <span>{filterText.price}</span>

              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value)}
              >
                <option value="all">{filterText.all}</option>
                <option value="free">{filterText.free}</option>
                <option value="paid">{filterText.paid}</option>
              </select>
            </label>

            <label className="product-select">
              <img src={mostRecentIcon} alt="" />

              <select
                value={sortFilter}
                onChange={(event) => setSortFilter(event.target.value)}
              >
                <option value="recent">{filterText.mostRecent}</option>
                <option value="bestSeller">{filterText.bestSeller}</option>
                <option value="popular">{filterText.popular}</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="product-empty-state">{filterText.loading}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="product-empty-state">{filterText.empty}</div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product, index) => {
                const title = getProductTitle(product, language);
                const description = getProductDescription(product, language);
                const categoryName = getProductCategoryName(
                  product,
                  categories,
                  language
                );

                const image = getProductImage(product);

                const localizedProduct = getLocalizedObject(product, language);

                const badge = getBadgeLabel(product.badge, language);
                const badgeType = product.badgeType || "green";

                const priceLabel =
                  localizedProduct.priceLabel ||
                  product.priceText ||
                  (product.isFree ? filterText.free : "");

                const downloadsLabel = product.downloads
                  ? `${product.downloads} ${filterText.downloads}`
                  : "";

                return (
                  <article
                    className="product-card"
                    style={{ "--animation-order": index }}
                    key={product.id}
                  >
                    <div className="product-card__image-wrap">
                      <img
                        src={image}
                        alt={title}
                        className="product-card__image"
                      />

                      {badge && (
                        <span
                          className={`product-card__badge product-card__badge--${badgeType}`}
                        >
                          {badge}
                        </span>
                      )}
                    </div>

                    <div className="product-card__meta">
                      <span className="product-card__category">
                        {categoryName}
                      </span>

                      <div className="product-card__rating">
                        <img src={starIcon} alt="" />
                        <span>{product.rating || "0"}</span>

                        <img src={pdfIcon} alt="" />
                        <span>{downloadsLabel}</span>
                      </div>
                    </div>

                    <h3>{title}</h3>

                    <p>{description}</p>

                    <strong>{priceLabel}</strong>

                    <Link
                      to={getProductUrl(product)}
                      className="product-card__details-btn"
                    >
                      {filterText.viewDetails}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="product-benefits-section">
        <div className="product-container">
          <div className="product-benefits-card">
            <h2>{benefitsText.title}</h2>

            <div className="product-benefits-grid">
              {benefitsText.items.map((item) => (
                <article className="product-benefit" key={item.title}>
                  <div className="product-benefit__icon">
                    <img src={item.icon} alt="" />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="product-contact-cta">
        <div className="product-contact-cta__container">
          <div className="product-contact-cta__card">
            <div className="product-contact-cta__avatars" aria-hidden="true">
              <img
                className="product-contact-cta__avatar product-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />
              <img
                className="product-contact-cta__avatar product-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />
              <img
                className="product-contact-cta__avatar product-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="product-contact-cta__title">{ctaText.title}</h3>

            <p className="product-contact-cta__subtitle">{ctaText.subtitle}</p>

            <Link className="product-contact-cta__btn" to="/contact">
              {ctaText.button}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Product;