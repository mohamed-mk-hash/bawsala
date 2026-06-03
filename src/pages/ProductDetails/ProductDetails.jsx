import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

import "./ProductDetails.css";

import { auth, db } from "../../firebase";

import homeIcon from "../../assets/Home_icon.png";

import productMainImage from "../../assets/product_Thumbnail.jpg";
import productThumb2 from "../../assets/product_Thumbnail_2.png";
import productThumb3 from "../../assets/product_Thumbnail_3.png";
import productThumb4 from "../../assets/product_Thumbnail_4.png";

import starIcon from "../../assets/review_star.png";
import pdfIcon from "../../assets/pdf_icon.png";
import cartIcon from "../../assets/shopping-cart.png";
import saveIcon from "../../assets/product_save.png";
import correctIcon from "../../assets/product_correct.png";

import instantAccessIcon from "../../assets/instant_acces.png";
import editableIcon from "../../assets/editable_products.png";
import lifetimeUpdateIcon from "../../assets/lifetime_update_product.png";
import securePaymentIcon from "../../assets/secure_payment_product.png";

import startupIcon from "../../assets/startup_product.png";
import managerIcon from "../../assets/manager_product.png";
import teamLeadersIcon from "../../assets/Team_Leaders.png";
import consultantsIcon from "../../assets/Consultants_Freelancers.png";
import studentsIcon from "../../assets/students_product.png";

import aboutImageOne from "../../assets/template_feature_1.png";
import aboutImageTwo from "../../assets/template_feature_2.png";

import relatedProductImage from "../../assets/Business_Plan_Template.png";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

const FALLBACK_GALLERY = [
  productMainImage,
  productThumb2,
  productThumb3,
  productThumb4,
];

const FALLBACK_TRUST_ICONS = [
  instantAccessIcon,
  editableIcon,
  lifetimeUpdateIcon,
  securePaymentIcon,
];

const FALLBACK_AUDIENCE_ICONS = [
  startupIcon,
  managerIcon,
  teamLeadersIcon,
  consultantsIcon,
  studentsIcon,
];

const STATIC_TEXT = {
  en: {
    products: "Products",
    loading: "Loading product...",
    notFound: "Product not found",
    backToProducts: "Back to products",
    downloads: "Downloads",
    addToCart: "Add to cart",
    removeFromCart: "Remove from cart",
    saveForLater: "Save for later",
    savedForLater: "Saved for later",
    adding: "Updating...",
    saving: "Saving...",
    addedToCartMessage: "Product added to cart.",
    removedFromCartMessage: "Product removed from cart.",
    savedMessage: "Product saved for later.",
    removedSavedMessage: "Product removed from saved items.",
    loginRequired: "Please log in first.",
    aboutTitle: "About This Template",
    audienceTitle: "Who Is This For?",
    relatedTitle: "You may also like",
    viewDetails: "View details",
    stillQuestions: "Still have questions?",
    stillQuestionsSubtitle:
      "Can’t find the answer you’re looking for? Please chat to our friendly team.",
    getInTouch: "Get in touch",
    free: "Free",
    new: "New",
    popular: "Popular",
    bestSeller: "Best Seller",
    trustItems: [
      {
        title: "Instant Access",
        description: "Get started right away after purchase",
      },
      {
        title: "Editable",
        description: "Fully customizable to fit your needs",
      },
      {
        title: "Lifetime Updates",
        description: "Free updates whenever we improve it",
      },
      {
        title: "Secure Payment",
        description: "Your payment is 100% secure",
      },
    ],
    features: [
      "Instant Download",
      "Easy to Customize",
      "Works with Notion / Excel / PDF",
      "Beginner Friendly",
    ],
    audience: [
      "Startup Founders",
      "Product Managers",
      "Team Leaders",
      "Consultants & Freelancers",
      "Students & Educators",
    ],
  },

  ar: {
    products: "المنتجات",
    loading: "جاري تحميل المنتج...",
    notFound: "المنتج غير موجود",
    backToProducts: "العودة إلى المنتجات",
    downloads: "تحميل",
    addToCart: "أضف إلى السلة",
    removeFromCart: "إزالة من السلة",
    saveForLater: "احفظ لوقت لاحق",
    savedForLater: "محفوظ لوقت لاحق",
    adding: "جاري التحديث...",
    saving: "جاري الحفظ...",
    addedToCartMessage: "تمت إضافة المنتج إلى السلة.",
    removedFromCartMessage: "تمت إزالة المنتج من السلة.",
    savedMessage: "تم حفظ المنتج لوقت لاحق.",
    removedSavedMessage: "تمت إزالة المنتج من العناصر المحفوظة.",
    loginRequired: "يرجى تسجيل الدخول أولاً.",
    aboutTitle: "حول هذا القالب",
    audienceTitle: "لمن هذا المنتج؟",
    relatedTitle: "قد يعجبك أيضاً",
    viewDetails: "عرض التفاصيل",
    stillQuestions: "ما زالت لديك أسئلة؟",
    stillQuestionsSubtitle:
      "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا.",
    getInTouch: "تواصل معنا",
    free: "مجاني",
    new: "جديد",
    popular: "شائع",
    bestSeller: "الأكثر مبيعاً",
    trustItems: [
      {
        title: "وصول فوري",
        description: "ابدأ مباشرة بعد الشراء أو التحميل",
      },
      {
        title: "قابل للتعديل",
        description: "يمكن تخصيصه بالكامل حسب احتياجاتك",
      },
      {
        title: "تحديثات مستمرة",
        description: "تحديثات مجانية عند تحسين المنتج",
      },
      {
        title: "دفع آمن",
        description: "عملية الدفع الخاصة بك آمنة بالكامل",
      },
    ],
    features: [
      "تحميل فوري",
      "سهل التخصيص",
      "يعمل مع Notion / Excel / PDF",
      "مناسب للمبتدئين",
    ],
    audience: [
      "مؤسسو الشركات الناشئة",
      "مديرو المنتجات",
      "قادة الفرق",
      "المستشارون والمستقلون",
      "الطلاب والمدربون",
    ],
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

const parsePriceValue = (value) => {
  if (typeof value === "number") return value;

  const numberOnly = String(value || "").replace(/[^\d.]/g, "");
  return Number(numberOnly || 0);
};

const isPublished = (product) => {
  if (!product?.status) return true;
  return product.status === "published";
};

const getProductSlug = (product) => {
  return product?.slug || product?.en?.slug || product?.ar?.slug || product?.id;
};

const getProductUrl = (product) => {
  return `/products/${getProductSlug(product)}`;
};

const getProductTitle = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  return localizedProduct.title || localizedProduct.seoTitle || "";
};

const getProductDescriptionOne = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  return (
    localizedProduct.heroDescriptionOne ||
    localizedProduct.seoDescription ||
    localizedProduct.aboutParagraphOne ||
    ""
  );
};

const getProductDescriptionTwo = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  return (
    localizedProduct.heroDescriptionTwo ||
    localizedProduct.aboutParagraphTwo ||
    ""
  );
};

const getProductAboutOne = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  return (
    localizedProduct.aboutParagraphOne ||
    localizedProduct.heroDescriptionOne ||
    localizedProduct.seoDescription ||
    ""
  );
};

const getProductAboutTwo = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  return localizedProduct.aboutParagraphTwo || localizedProduct.heroDescriptionTwo || "";
};

const getProductCategoryName = (product, categories, language) => {
  const category = categories.find((item) => item.id === product.categoryId);

  if (category) {
    const localizedCategory = getLocalizedObject(category, language);
    const englishCategory = category.en || {};
    const arabicCategory = category.ar || {};

    return (
      localizedCategory.name ||
      englishCategory.name ||
      arabicCategory.name ||
      ""
    );
  }

  return (
    getLocalizedText(product.categoryName, language) ||
    getLocalizedObject(product, language).categoryLabel ||
    ""
  );
};

const getProductImage = (product) => {
  return (
    product?.mainImageUrl ||
    product?.mainImage?.url ||
    product?.galleryImages?.[0]?.url ||
    product?.galleryImages?.[0] ||
    product?.aboutImageOneUrl ||
    productMainImage
  );
};

const getGalleryImages = (product) => {
  const images = [];

  const mainImage = getProductImage(product);
  if (mainImage) images.push(mainImage);

  if (Array.isArray(product?.galleryImages)) {
    product.galleryImages.forEach((item) => {
      const url = typeof item === "string" ? item : item?.url;

      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  }

  if (product?.aboutImageOneUrl && !images.includes(product.aboutImageOneUrl)) {
    images.push(product.aboutImageOneUrl);
  }

  if (product?.aboutImageTwoUrl && !images.includes(product.aboutImageTwoUrl)) {
    images.push(product.aboutImageTwoUrl);
  }

  if (images.length === 0) return FALLBACK_GALLERY;

  return images;
};

const getProductFeatures = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  const source =
    localizedProduct.features ||
    localizedProduct.productFeatures ||
    product?.features ||
    product?.productFeatures ||
    [];

  if (Array.isArray(source) && source.length > 0) {
    return source
      .map((item) => {
        if (typeof item === "string") return item;

        const localizedItem = getLocalizedObject(item, language);
        return localizedItem.text || localizedItem.title || item.text || item.title || "";
      })
      .filter(Boolean);
  }

  return STATIC_TEXT[language].features;
};

const getTrustItems = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  const source =
    localizedProduct.trustItems ||
    localizedProduct.trustBadges ||
    product?.trustItems ||
    product?.trustBadges ||
    [];

  if (Array.isArray(source) && source.length > 0) {
    return source.map((item, index) => {
      const localizedItem = getLocalizedObject(item, language);

      return {
        id: item.id || index,
        icon: item.iconUrl || item.imageUrl || FALLBACK_TRUST_ICONS[index % FALLBACK_TRUST_ICONS.length],
        title: localizedItem.title || item.title || "",
        description: localizedItem.description || item.description || "",
      };
    });
  }

  return STATIC_TEXT[language].trustItems.map((item, index) => ({
    id: index,
    icon: FALLBACK_TRUST_ICONS[index],
    title: item.title,
    description: item.description,
  }));
};

const getAudienceItems = (product, language) => {
  const localizedProduct = getLocalizedObject(product, language);

  const source =
    localizedProduct.audienceItems ||
    localizedProduct.audience ||
    product?.audienceItems ||
    product?.audience ||
    [];

  if (Array.isArray(source) && source.length > 0) {
    return source.map((item, index) => {
      if (typeof item === "string") {
        return {
          id: index,
          icon: FALLBACK_AUDIENCE_ICONS[index % FALLBACK_AUDIENCE_ICONS.length],
          text: item,
        };
      }

      const localizedItem = getLocalizedObject(item, language);

      return {
        id: item.id || index,
        icon: item.iconUrl || item.imageUrl || FALLBACK_AUDIENCE_ICONS[index % FALLBACK_AUDIENCE_ICONS.length],
        text: localizedItem.text || localizedItem.title || item.text || item.title || "",
      };
    });
  }

  return STATIC_TEXT[language].audience.map((item, index) => ({
    id: index,
    icon: FALLBACK_AUDIENCE_ICONS[index],
    text: item,
  }));
};

const getBadgeLabel = (badge, language) => {
  const value = String(badge || "").toLowerCase();

  if (!badge) return "";

  if (language === "ar") {
    if (value === "new") return STATIC_TEXT.ar.new;
    if (value === "popular") return STATIC_TEXT.ar.popular;
    if (value === "best seller") return STATIC_TEXT.ar.bestSeller;
  }

  return badge;
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(productMainImage);
  const [loading, setLoading] = useState(true);

  const [isInCart, setIsInCart] = useState(false);
  const [isSavedForLater, setIsSavedForLater] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const isArabic = language === "ar";
  const text = STATIC_TEXT[language];

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
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        let foundProduct = null;
        let allProducts = [];
        let fetchedCategories = [];

        try {
          const rootSlugQuery = query(
            collection(db, "products"),
            where("slug", "==", slug),
            limit(1)
          );

          const rootSlugSnapshot = await getDocs(rootSlugQuery);

          if (!rootSlugSnapshot.empty) {
            const docItem = rootSlugSnapshot.docs[0];

            foundProduct = {
              id: docItem.id,
              ...docItem.data(),
            };
          }
        } catch (error) {
          console.warn("Root product slug query failed:", error);
        }

        const productsSnapshot = await getDocs(collection(db, "products"));

        allProducts = productsSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        if (!foundProduct) {
          foundProduct =
            allProducts.find((item) => {
              return (
                item.id === slug ||
                item.slug === slug ||
                item.en?.slug === slug ||
                item.ar?.slug === slug
              );
            }) || null;
        }

        try {
          const categoriesSnapshot = await getDocs(collection(db, "productCategories"));

          fetchedCategories = categoriesSnapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          }));
        } catch (error) {
          console.warn("Could not load product categories:", error);
        }

        if (foundProduct && !isPublished(foundProduct)) {
          foundProduct = null;
        }

        const publishedOtherProducts = allProducts
          .filter((item) => foundProduct && item.id !== foundProduct.id)
          .filter(isPublished);

        const sameCategoryProducts = publishedOtherProducts.filter((item) => {
          return (
            foundProduct?.categoryId &&
            item.categoryId &&
            item.categoryId === foundProduct.categoryId
          );
        });

        const fallbackProducts = publishedOtherProducts.filter((item) => {
          return !sameCategoryProducts.some(
            (sameCategoryItem) => sameCategoryItem.id === item.id
          );
        });

        const finalRelatedProducts = [
          ...sameCategoryProducts,
          ...fallbackProducts,
        ]
          .sort((a, b) => {
            return (
              timestampToMs(b.publishedAt || b.createdAt || b.updatedAt) -
              timestampToMs(a.publishedAt || a.createdAt || a.updatedAt)
            );
          })
          .slice(0, 3);

        setProduct(foundProduct);
        setCategories(fetchedCategories);
        setRelatedProducts(finalRelatedProducts);
      } catch (error) {
        console.error("Error loading product details:", error);
        setProduct(null);
        setCategories([]);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  const galleryImages = useMemo(() => {
    return getGalleryImages(product);
  }, [product]);

  useEffect(() => {
    setActiveImage(galleryImages[0] || productMainImage);
  }, [galleryImages]);

  useEffect(() => {
    const checkUserProductState = async () => {
      const user = auth.currentUser;

      setIsInCart(false);
      setIsSavedForLater(false);
      setActionMessage("");

      if (!user || !product?.id) return;

      try {
        const cartId = `product_${product.id}`;

        const cartSnapshot = await getDoc(
          doc(db, "users", user.uid, "cart", cartId)
        );

        const savedSnapshot = await getDoc(
          doc(db, "users", user.uid, "savedProducts", product.id)
        );

        setIsInCart(cartSnapshot.exists());
        setIsSavedForLater(savedSnapshot.exists());
      } catch (error) {
        console.error("Error checking product state:", error);
      }
    };

    checkUserProductState();
  }, [product]);

  const getProductCartItem = (targetProduct) => {
    const localizedProduct = getLocalizedObject(targetProduct, language);

    const productTitle = getProductTitle(targetProduct, language);
    const productDescription = getProductDescriptionOne(targetProduct, language);
    const productPriceLabel =
      localizedProduct.priceLabel ||
      targetProduct.priceText ||
      (targetProduct.isFree ? text.free : "");

    const productImage = getProductImage(targetProduct);

    return {
      itemType: "product",
      productId: targetProduct.id,
      courseId: null,
      slug: getProductSlug(targetProduct),
      title: productTitle,
      priceLabel: productPriceLabel,
      price: parsePriceValue(
        targetProduct.price ||
          targetProduct.priceValue ||
          productPriceLabel
      ),
      oldPrice: parsePriceValue(targetProduct.oldPrice || targetProduct.oldPriceValue),
      categoryId: targetProduct.categoryId || "",
      shortDescription: productDescription,
      description: productDescription,
      featuredImageUrl: productImage,
      image: productImage,
      isFree: Boolean(targetProduct.isFree),
      quantity: 1,
      addedAt: serverTimestamp(),
    };
  };

  const redirectToLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/products/${slug}`)}`);
  };

  const handleCartToggle = async () => {
    const user = auth.currentUser;

    if (!user) {
      redirectToLogin();
      return;
    }

    if (!product?.id || cartBusy) return;

    try {
      setCartBusy(true);
      setActionMessage("");

      const cartId = `product_${product.id}`;
      const cartRef = doc(db, "users", user.uid, "cart", cartId);

      if (isInCart) {
        await deleteDoc(cartRef);
        setIsInCart(false);
        setActionMessage(text.removedFromCartMessage);
        return;
      }

      await setDoc(cartRef, getProductCartItem(product), { merge: true });
      setIsInCart(true);
      setActionMessage(text.addedToCartMessage);
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setCartBusy(false);
    }
  };

  const handleRelatedAddToCart = async (targetProduct) => {
    const user = auth.currentUser;

    if (!user) {
      redirectToLogin();
      return;
    }

    if (!targetProduct?.id) return;

    try {
      setActionMessage("");

      const cartId = `product_${targetProduct.id}`;

      await setDoc(
        doc(db, "users", user.uid, "cart", cartId),
        getProductCartItem(targetProduct),
        { merge: true }
      );

      if (targetProduct.id === product?.id) {
        setIsInCart(true);
      }

      setActionMessage(text.addedToCartMessage);
    } catch (error) {
      console.error("Error adding related product to cart:", error);
    }
  };

  const handleSaveForLater = async () => {
    const user = auth.currentUser;

    if (!user) {
      redirectToLogin();
      return;
    }

    if (!product?.id || saveBusy) return;

    try {
      setSaveBusy(true);
      setActionMessage("");

      const savedRef = doc(db, "users", user.uid, "savedProducts", product.id);

      if (isSavedForLater) {
        await deleteDoc(savedRef);
        setIsSavedForLater(false);
        setActionMessage(text.removedSavedMessage);
        return;
      }

      await setDoc(
        savedRef,
        {
          itemType: "product",
          productId: product.id,
          slug: getProductSlug(product),
          title,
          priceLabel,
          price: parsePriceValue(product.price || product.priceValue || priceLabel),
          image: getProductImage(product),
          shortDescription: descriptionOne,
          savedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setIsSavedForLater(true);
      setActionMessage(text.savedMessage);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSaveBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="product-details-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="product-details-hero-section">
          <div className="product-details-container">
            <div className="product-details-loading">{text.loading}</div>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-details-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="product-details-hero-section">
          <div className="product-details-container">
            <div className="product-details-loading">
              <h1>{text.notFound}</h1>
              <Link to="/products">{text.backToProducts}</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const localizedProduct = getLocalizedObject(product, language);

  const title = getProductTitle(product, language);
  const descriptionOne = getProductDescriptionOne(product, language);
  const descriptionTwo = getProductDescriptionTwo(product, language);

  const aboutTitle = localizedProduct.aboutTitle || text.aboutTitle;
  const aboutParagraphOne = getProductAboutOne(product, language);
  const aboutParagraphTwo = getProductAboutTwo(product, language);

  const audienceTitle = localizedProduct.audienceTitle || text.audienceTitle;

  const categoryName = getProductCategoryName(product, categories, language);

  const rating = product.rating || "0";
  const downloads = product.downloads || 0;

  const priceLabel =
    localizedProduct.priceLabel ||
    product.priceText ||
    (product.isFree ? text.free : "");

  const badgeLabel = getBadgeLabel(product.badge || localizedProduct.badge, language);
  const badgeType = product.badgeType || "green";

  const features = getProductFeatures(product, language);
  const trustItems = getTrustItems(product, language);
  const audienceItems = getAudienceItems(product, language);

  const aboutImageOneUrl =
    product.aboutImageOneUrl ||
    localizedProduct.aboutImageOneUrl ||
    aboutImageOne;

  const aboutImageTwoUrl =
    product.aboutImageTwoUrl ||
    localizedProduct.aboutImageTwoUrl ||
    aboutImageTwo;

  return (
    <main className="product-details-page" dir={isArabic ? "rtl" : "ltr"}>
      <section className="product-details-breadcrumb-section">
        <div className="product-details-container">
          <nav className="product-details-breadcrumb" aria-label="Breadcrumb">
            <Link
              to="/"
              className="product-details-breadcrumb-home"
              aria-label="Home"
            >
              <img src={homeIcon} alt="" />
            </Link>

            <span className="product-details-breadcrumb-chevron"></span>

            <Link to="/products" className="product-details-breadcrumb-link">
              {text.products}
            </Link>

            <span className="product-details-breadcrumb-chevron"></span>

            <span className="product-details-breadcrumb-current">
              {title}
            </span>
          </nav>
        </div>
      </section>

      <section className="product-details-hero-section">
        <div className="product-details-container">
          <div className="product-details-hero">
            <div className="product-details-gallery">
              <div className="product-details-thumbs">
                {galleryImages.map((image, index) => (
                  <button
                    type="button"
                    className={`product-details-thumb ${
                      activeImage === image ? "active" : ""
                    }`}
                    onClick={() => setActiveImage(image)}
                    key={`${image}-${index}`}
                  >
                    <img src={image} alt={`${title} ${index + 1}`} />
                  </button>
                ))}
              </div>

              <div className="product-details-main-image">
                {badgeLabel && (
                  <span
                    className={`product-details-badge product-details-badge--${badgeType}`}
                  >
                    {badgeLabel}
                  </span>
                )}

                <img src={activeImage} alt={title} />
              </div>
            </div>

            <div className="product-details-info">
              {categoryName && (
                <span className="product-details-category">
                  {categoryName}
                </span>
              )}

              <h1>{title}</h1>

              <div className="product-details-rating">
                <img src={starIcon} alt="" />
                <span>{rating}</span>
                <img src={pdfIcon} alt="" />
                <span>
                  {downloads} {text.downloads}
                </span>
              </div>

              {descriptionOne && (
                <p className="product-details-description">
                  {descriptionOne}
                </p>
              )}

              {descriptionTwo && (
                <p className="product-details-description">
                  {descriptionTwo}
                </p>
              )}

              {features.length > 0 && (
                <ul className="product-details-feature-list">
                  {features.map((feature) => (
                    <li key={feature}>
                      <img src={correctIcon} alt="" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <strong className="product-details-price">{priceLabel}</strong>

              <button
                type="button"
                className={`product-details-save ${
                  isSavedForLater ? "is-saved" : ""
                }`}
                onClick={handleSaveForLater}
                disabled={saveBusy}
              >
                <img src={saveIcon} alt="" />
                {saveBusy
                  ? text.saving
                  : isSavedForLater
                    ? text.savedForLater
                    : text.saveForLater}
              </button>

              {actionMessage && (
                <p className="product-details-action-message">
                  {actionMessage}
                </p>
              )}

              <div className="product-details-actions">
                <button
                  type="button"
                  className={`product-details-cart-btn ${
                    isInCart ? "is-in-cart" : ""
                  }`}
                  onClick={handleCartToggle}
                  disabled={cartBusy}
                >
                  <img src={cartIcon} alt="" />
                  {cartBusy
                    ? text.adding
                    : isInCart
                      ? text.removeFromCart
                      : text.addToCart}
                </button>
              </div>
            </div>
          </div>

          <div className="product-details-trust-grid">
            {trustItems.map((item) => (
              <article className="product-details-trust-card" key={item.id}>
                <div>
                  <img src={item.icon} alt="" />
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="product-details-about-section">
        <div className="product-details-container">
          <div className="product-details-about-panel">
            <div className="product-details-about-content">
              <article className="product-details-about-card">
                <h2>{aboutTitle}</h2>

                {aboutParagraphOne && <p>{aboutParagraphOne}</p>}
                {aboutParagraphTwo && <p>{aboutParagraphTwo}</p>}
              </article>

              <aside className="product-details-audience-card">
                <h2>{audienceTitle}</h2>

                <ul>
                  {audienceItems.map((item) => (
                    <li key={item.id}>
                      <img src={item.icon} alt="" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>

            <div className="product-details-about-images">
              <img src={aboutImageOneUrl} alt={title} />
              <img src={aboutImageTwoUrl} alt={title} />
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="product-details-related-section">
          <div className="product-details-container">
            <h2>{localizedProduct.relatedTitle || text.relatedTitle}</h2>

            <div className="product-details-related-grid">
              {relatedProducts.map((relatedProduct, index) => {
                const relatedTitle = getProductTitle(relatedProduct, language);
                const relatedDescription = getProductDescriptionOne(
                  relatedProduct,
                  language
                );
                const relatedCategory = getProductCategoryName(
                  relatedProduct,
                  categories,
                  language
                );
                const relatedImage = getProductImage(relatedProduct);
                const relatedLocalized = getLocalizedObject(
                  relatedProduct,
                  language
                );

                const relatedPrice =
                  relatedLocalized.priceLabel ||
                  relatedProduct.priceText ||
                  (relatedProduct.isFree ? text.free : "");

                const relatedBadge = getBadgeLabel(
                  relatedProduct.badge || relatedLocalized.badge,
                  language
                );

                return (
                  <article
                    className="product-details-related-card"
                    style={{ "--animation-order": index }}
                    key={relatedProduct.id}
                  >
                    <div className="product-details-related-image">
                      <img src={relatedImage || relatedProductImage} alt={relatedTitle} />

                      {relatedBadge && (
                        <span
                          className={`product-details-related-badge product-details-related-badge--${
                            relatedProduct.badgeType || "green"
                          }`}
                        >
                          {relatedBadge}
                        </span>
                      )}
                    </div>

                    <div className="product-details-related-meta">
                      <span>{relatedCategory}</span>

                      <div>
                        <img src={starIcon} alt="" />
                        <small>{relatedProduct.rating || "0"}</small>
                        <img src={pdfIcon} alt="" />
                        <small>
                          {relatedProduct.downloads || 0} {text.downloads}
                        </small>
                      </div>
                    </div>

                    <h3>{relatedTitle}</h3>

                    <p>{relatedDescription}</p>

                    <strong>{relatedPrice}</strong>

                    <button
                      type="button"
                      onClick={() => handleRelatedAddToCart(relatedProduct)}
                    >
                      <img src={cartIcon} alt="" />
                      {text.addToCart}
                    </button>

                    <Link to={getProductUrl(relatedProduct)}>
                      {text.viewDetails}
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="product-details-contact-cta">
        <div className="product-details-contact-cta__container">
          <div className="product-details-contact-cta__card">
            <div
              className="product-details-contact-cta__avatars"
              aria-hidden="true"
            >
              <img
                className="product-details-contact-cta__avatar product-details-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />
              <img
                className="product-details-contact-cta__avatar product-details-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />
              <img
                className="product-details-contact-cta__avatar product-details-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="product-details-contact-cta__title">
              {text.stillQuestions}
            </h3>

            <p className="product-details-contact-cta__subtitle">
              {text.stillQuestionsSubtitle}
            </p>

            <Link className="product-details-contact-cta__btn" to="/contact">
              {text.getInTouch}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;