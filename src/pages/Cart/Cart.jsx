import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

import "./Cart.css";

import courseImage from "../../assets/featured_course.png";
import instructorImg from "../../assets/courses_account.png";
import clockIcon from "../../assets/Clock.png";
import calendarIcon from "../../assets/CalendarBlank.png";
import monitorIcon from "../../assets/MonitorPlay.png";
import shareIcon from "../../assets/ShareFat.png";
import homeIcon from "../../assets/Home_icon.png";
import coursesTagIcon from "../../assets/courses_tag.png";

import profile1 from "../../assets/profile1.jpg";
import profile2 from "../../assets/profile2.jpg";
import profile3 from "../../assets/profile3.jpg";

const VALID_COUPONS = {
  BAWSALA20: {
    type: "percentage",
    value: 20,
  },
  STUDENT10: {
    type: "percentage",
    value: 10,
  },
  WELCOME500: {
    type: "fixed",
    value: 500,
  },
};

const normalizeLanguage = (language) => {
  const normalizedLanguage = String(language || "").toLowerCase();

  if (normalizedLanguage === "ar") return "ar";
  return "en";
};

const getInitialLanguage = () => {
  return normalizeLanguage(localStorage.getItem("site_language"));
};

const getLocalizedObject = (item, language) => {
  if (!item) return {};
  return item?.[language] || item?.en || item?.ar || {};
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
  const numberValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const formattedNumber = numberValue.toLocaleString("fr-FR");

  return isArabic ? `${formattedNumber} دج` : `${formattedNumber} DZD`;
};

const getCartItemType = (item) => {
  if (item?.itemType === "product") return "product";
  if (item?.productId) return "product";
  return "course";
};

const getItemSlug = (item) => {
  return item?.slug || item?.en?.slug || item?.ar?.slug || item?.id;
};

const getItemUrl = (item) => {
  const itemType = getCartItemType(item);

  if (itemType === "product") {
    return `/products/${getItemSlug(item)}`;
  }

  return `/courses/${getItemSlug(item)}`;
};

const getItemPrice = (item, language) => {
  const localizedItem = getLocalizedObject(item, language);

  return parsePriceValue(
    item.priceLabel,
    localizedItem.priceLabel,
    item.priceText,
    item.en?.priceLabel,
    item.ar?.priceLabel,
    item.priceValue,
    localizedItem.priceValue,
    localizedItem.price,
    item.price
  );
};

const getItemOldPrice = (item, language) => {
  const localizedItem = getLocalizedObject(item, language);

  return parsePriceValue(
    item.oldPriceValue,
    item.oldPriceLabel,
    localizedItem.oldPriceLabel,
    item.oldPriceText,
    item.en?.oldPriceLabel,
    item.ar?.oldPriceLabel,
    localizedItem.oldPriceValue,
    localizedItem.oldPrice,
    item.oldPrice
  );
};

const getItemImage = (item) => {
  return (
    item.featuredImageUrl ||
    item.mainImageUrl ||
    item.image ||
    item.imageUrl ||
    item.mainImage?.url ||
    item.galleryImages?.[0]?.url ||
    item.galleryImages?.[0] ||
    courseImage
  );
};

const CART_TEXT = {
  en: {
    loading: "Loading cart...",
    cart: "Cart",
    coursesAndProgrammes: "Courses and programmes",
    elementsInCart: "elements in the cart",
    selectAll: "Select all elements",
    deleteSelected: "Delete selected elements",
    emptyTitle: "Your cart is empty",
    emptyText: "Add courses or products to your cart and they will appear here.",
    browseCourses: "Browse courses",
    cartTotals: "Cart totals",
    totalItems: "Total Items",
    subtotal: "Subtotal",
    discount: "Coupon discount",
    estimatedTotal: "Estimated total",
    coupon: "Coupon",
    couponPlaceholder: "Enter coupon code",
    applyCoupon: "Apply Coupon",
    checkout: "Checkout",
    instructor: "Instructor:",
    courseType: "Course",
    productType: "Product",
    stillQuestions: "Still have questions?",
    questionsText:
      "Can’t find the answer you’re looking for? Please chat to our friendly team.",
    getInTouch: "Get in touch",
    loadError: "Could not load your cart. Please try again.",
    deleteError: "Could not delete selected elements. Please try again.",
    untitledCourse: "Untitled course",
    untitledProduct: "Untitled product",
    emptyCartCheckoutError:
      "Your cart is empty. Add at least one element before going to checkout.",
    noSelectedCoursesError:
      "Please select at least one element before going to checkout.",
    couponRequired: "Please enter a coupon code.",
    couponInvalid: "Invalid coupon code.",
    couponApplied: "Coupon applied successfully.",
  },

  ar: {
    loading: "جاري تحميل السلة...",
    cart: "السلة",
    coursesAndProgrammes: "الدورات والبرامج",
    elementsInCart: "عنصر في السلة",
    selectAll: "تحديد كل العناصر",
    deleteSelected: "حذف العناصر المحددة",
    emptyTitle: "سلتك فارغة",
    emptyText: "أضف الدورات أو المنتجات إلى السلة وستظهر هنا.",
    browseCourses: "تصفح الدورات",
    cartTotals: "إجمالي السلة",
    totalItems: "عدد العناصر",
    subtotal: "المجموع الفرعي",
    discount: "خصم الكوبون",
    estimatedTotal: "الإجمالي المتوقع",
    coupon: "كوبون",
    couponPlaceholder: "أدخل رمز الكوبون",
    applyCoupon: "تطبيق الكوبون",
    checkout: "إتمام الدفع",
    instructor: "المدرب:",
    courseType: "دورة",
    productType: "منتج",
    stillQuestions: "هل ما زالت لديك أسئلة؟",
    questionsText:
      "لم تجد الإجابة التي تبحث عنها؟ تواصل مع فريقنا وسنساعدك بكل سرور.",
    getInTouch: "تواصل معنا",
    loadError: "تعذر تحميل السلة. يرجى المحاولة مرة أخرى.",
    deleteError: "تعذر حذف العناصر المحددة. يرجى المحاولة مرة أخرى.",
    untitledCourse: "دورة بدون عنوان",
    untitledProduct: "منتج بدون عنوان",
    emptyCartCheckoutError:
      "سلتك فارغة. أضف عنصرًا واحدًا على الأقل قبل المتابعة إلى الدفع.",
    noSelectedCoursesError:
      "يرجى اختيار عنصر واحد على الأقل قبل المتابعة إلى الدفع.",
    couponRequired: "يرجى إدخال رمز الكوبون.",
    couponInvalid: "رمز الكوبون غير صحيح.",
    couponApplied: "تم تطبيق الكوبون بنجاح.",
  },
};

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [language, setLanguage] = useState(getInitialLanguage);
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponMessageType, setCouponMessageType] = useState("");
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState("");

  const isArabic = language === "ar";
  const text = CART_TEXT[language] || CART_TEXT.en;

  const locationCartMessage = location.state?.cartMessage;

  useEffect(() => {
    if (locationCartMessage) {
      setCartError(locationCartMessage);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [locationCartMessage, location.pathname, navigate]);

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login?redirect=/cart");
        return;
      }

      setCurrentUser(user);

      try {
        setLoadingCart(true);

        const cartSnapshot = await getDocs(
          collection(db, "users", user.uid, "cart")
        );

        const rawCartItems = cartSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          cartId: docItem.id,
          ...docItem.data(),
        }));

        const itemsWithFullData = await Promise.all(
          rawCartItems.map(async (cartItem) => {
            try {
              const itemType = getCartItemType(cartItem);

              if (itemType === "product") {
                const productId =
                  cartItem.productId ||
                  String(cartItem.id || "").replace(/^product_/, "");

                const productRef = doc(db, "products", productId);
                const productSnapshot = await getDoc(productRef);

                if (!productSnapshot.exists()) {
                  return {
                    ...cartItem,
                    itemType: "product",
                    productId,
                  };
                }

                return {
                  ...productSnapshot.data(),
                  ...cartItem,
                  id: cartItem.id,
                  cartId: cartItem.id,
                  itemType: "product",
                  productId,
                };
              }

              const courseId = cartItem.courseId || cartItem.id;
              const courseRef = doc(db, "courses", courseId);
              const courseSnapshot = await getDoc(courseRef);

              if (!courseSnapshot.exists()) {
                return {
                  ...cartItem,
                  itemType: "course",
                  courseId,
                };
              }

              return {
                ...courseSnapshot.data(),
                ...cartItem,
                id: cartItem.id,
                cartId: cartItem.id,
                itemType: "course",
                courseId,
              };
            } catch (error) {
              console.warn("Could not load cart item details:", error);
              return cartItem;
            }
          })
        );

        setCartItems(itemsWithFullData);
        setSelectedIds(itemsWithFullData.map((item) => item.id));
      } catch (error) {
        console.error("Error loading cart:", error);
        setCartError(text.loadError);
      } finally {
        setLoadingCart(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, text.loadError]);

  const allSelected =
    cartItems.length > 0 && selectedIds.length === cartItems.length;

  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => selectedIds.includes(item.id));
  }, [cartItems, selectedIds]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce(
      (total, item) => total + getItemPrice(item, language),
      0
    );
  }, [selectedItems, language]);

  const discount = useMemo(() => {
    if (!appliedCoupon || selectedItems.length === 0) return 0;

    if (appliedCoupon.type === "percentage") {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    }

    if (appliedCoupon.type === "fixed") {
      return Math.min(appliedCoupon.value, subtotal);
    }

    return 0;
  }, [appliedCoupon, selectedItems.length, subtotal]);

  const estimatedTotal = Math.max(subtotal - discount, 0);

  const handleSelectAll = () => {
    setCartError("");

    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(cartItems.map((item) => item.id));
  };

  const handleSelectItem = (itemId) => {
    setCartError("");

    setSelectedIds((currentSelected) => {
      if (currentSelected.includes(itemId)) {
        return currentSelected.filter((id) => id !== itemId);
      }

      return [...currentSelected, itemId];
    });
  };

  const handleDeleteSelected = async () => {
    if (!currentUser || selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map((itemId) =>
          deleteDoc(doc(db, "users", currentUser.uid, "cart", itemId))
        )
      );

      setCartItems((currentItems) =>
        currentItems.filter((item) => !selectedIds.includes(item.id))
      );

      setSelectedIds([]);
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponMessage("");
      setCartError("");
    } catch (error) {
      console.error("Error deleting cart items:", error);
      setCartError(text.deleteError);
    }
  };

  const handleApplyCoupon = (event) => {
    event.preventDefault();

    const normalizedCoupon = couponCode.trim().toUpperCase();

    if (!normalizedCoupon) {
      setAppliedCoupon(null);
      setCouponMessageType("error");
      setCouponMessage(text.couponRequired);
      return;
    }

    if (!VALID_COUPONS[normalizedCoupon]) {
      setAppliedCoupon(null);
      setCouponMessageType("error");
      setCouponMessage(text.couponInvalid);
      return;
    }

    setAppliedCoupon({
      code: normalizedCoupon,
      ...VALID_COUPONS[normalizedCoupon],
    });

    setCouponCode(normalizedCoupon);
    setCouponMessageType("success");
    setCouponMessage(text.couponApplied);
  };

  const handleGoToCheckout = () => {
    setCartError("");

    if (cartItems.length === 0) {
      setCartError(text.emptyCartCheckoutError);
      return;
    }

    if (selectedItems.length === 0) {
      setCartError(text.noSelectedCoursesError);
      return;
    }

    navigate("/checkout", {
      state: {
        fromCart: true,
        selectedItemIds: selectedIds,
        selectedCourseIds: selectedIds,
        couponCode: appliedCoupon?.code || "",
        discount,
        subtotal,
        estimatedTotal,
      },
    });
  };

  if (loadingCart) {
    return (
      <main
        className={`cart-page ${isArabic ? "cart-page--rtl" : "cart-page--ltr"}`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <section className="cart-content-section">
          <div className="cart-container">
            <p>{text.loading}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`cart-page ${isArabic ? "cart-page--rtl" : "cart-page--ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <section className="cart-breadcrumb-section">
        <div className="cart-container">
          <nav className="cart-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="cart-breadcrumb-home" aria-label="Home">
              <img src={homeIcon} alt="" />
            </Link>

            <span className="cart-breadcrumb-chevron"></span>

            <Link to="/courses" className="cart-breadcrumb-link">
              {text.coursesAndProgrammes}
            </Link>

            <span className="cart-breadcrumb-chevron"></span>

            <span className="cart-breadcrumb-current">{text.cart}</span>
          </nav>
        </div>
      </section>

      <section className="cart-content-section">
        <div className="cart-container cart-layout">
          <div className="cart-main">
            <header className="cart-header-card">
              <h1>
                {text.cart} ({cartItems.length})
              </h1>

              <p>
                {cartItems.length} {text.elementsInCart}
              </p>

              {cartError && <p className="cart-error-message">{cartError}</p>}

              <div className="cart-actions-row">
                <label className="cart-check-label">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    disabled={cartItems.length === 0}
                  />

                  <span>{text.selectAll}</span>
                </label>

                <span className="cart-actions-divider"></span>

                <button
                  type="button"
                  className="cart-delete-selected"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                >
                  {text.deleteSelected}
                </button>
              </div>
            </header>

            <div className="cart-list-card">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => {
                  const itemType = getCartItemType(item);
                  const localizedItem = getLocalizedObject(item, language);

                  const isProduct = itemType === "product";

                  const title =
                    localizedItem.title ||
                    localizedItem.cardTitle ||
                    localizedItem.seoTitle ||
                    item.title ||
                    (isProduct ? text.untitledProduct : text.untitledCourse);

                  const level = localizedItem.level || item.level || "";

                  const instructorName =
                    localizedItem.instructorName ||
                    item.instructorName ||
                    item.instructor ||
                    "";

                  const duration =
                    localizedItem.duration || item.duration || "";

                  const workload =
                    localizedItem.workload ||
                    item.workload ||
                    item.time ||
                    "";

                  const description =
                    localizedItem.cardShortDescription ||
                    localizedItem.subtitle ||
                    localizedItem.heroDescriptionOne ||
                    localizedItem.seoDescription ||
                    item.shortDescription ||
                    item.description ||
                    "";

                  const itemTypeLabel = isProduct
                    ? text.productType
                    : localizedItem.courseTypeLabel || text.courseType;

                  const price = getItemPrice(item, language);
                  const oldPrice = getItemOldPrice(item, language);

                  const itemUrl = getItemUrl(item);

                  return (
                    <article
                      className="cart-course-row"
                      style={{ "--animation-order": index }}
                      key={item.id}
                    >
                      <label className="cart-course-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </label>

                      <div className="cart-course-card">
                        <Link to={itemUrl} className="cart-course-image-wrap">
                          <img
                            src={getItemImage(item)}
                            alt={title}
                            className="cart-course-image"
                          />

                          <div className="cart-course-type-badge">
                            <img src={monitorIcon} alt="" />
                            <span>{itemTypeLabel}</span>
                          </div>
                        </Link>

                        <button className="cart-course-share-btn" type="button">
                          <img src={shareIcon} alt="" />
                        </button>

                        <div className="cart-course-details">
                          <div className="cart-course-top">
                            <div className="cart-course-meta-row">
                              {!isProduct && level && (
                                <span className="cart-course-level">
                                  {level}
                                </span>
                              )}

                              {!isProduct && instructorName && (
                                <div className="cart-course-instructor">
                                  <img
                                    src={
                                      item.instructorAvatarUrl || instructorImg
                                    }
                                    alt={instructorName}
                                  />

                                  <span>
                                    {text.instructor}{" "}
                                    <strong>{instructorName}</strong>
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="cart-course-price-box">
                              <p className="cart-course-price">
                                <span className="cart-course-price-text">
                                  {formatDZD(price, isArabic)}
                                </span>

                                <img
                                  className="cart-course-price-tag"
                                  src={coursesTagIcon}
                                  alt=""
                                />
                              </p>

                              {oldPrice > 0 && (
                                <p className="cart-course-old-price">
                                  {formatDZD(oldPrice, isArabic)}
                                </p>
                              )}
                            </div>
                          </div>

                          <Link to={itemUrl} className="cart-course-title-link">
                            <h2 className="cart-course-title">{title}</h2>
                          </Link>

                          {!isProduct && (
                            <div className="cart-course-info">
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
                          )}

                          {description && (
                            <p className="cart-course-desc">{description}</p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="cart-empty-state">
                  <h2>{text.emptyTitle}</h2>
                  <p>{text.emptyText}</p>

                  <Link to="/courses" className="cart-checkout-btn">
                    {text.browseCourses}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <aside className="cart-summary-card">
            <h2>{text.cartTotals}</h2>

            <div className="cart-summary-line">
              <span>{text.totalItems}</span>
              <strong>{selectedItems.length}</strong>
            </div>

            <div className="cart-summary-line">
              <span>{text.subtotal}</span>
              <strong>{formatDZD(subtotal, isArabic)}</strong>
            </div>

            <div className="cart-summary-line">
              <span>
                {text.discount}
                {appliedCoupon?.code ? ` (${appliedCoupon.code})` : ""}
              </span>
              <strong>{formatDZD(discount, isArabic)}</strong>
            </div>

            <div className="cart-summary-total">
              <span>{text.estimatedTotal}</span>
              <strong>{formatDZD(estimatedTotal, isArabic)}</strong>
            </div>

            <form className="cart-coupon-form" onSubmit={handleApplyCoupon}>
              <label htmlFor="coupon">{text.coupon}</label>

              <input
                id="coupon"
                type="text"
                placeholder={text.couponPlaceholder}
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value);
                  setCouponMessage("");
                }}
              />

              <button type="submit">{text.applyCoupon}</button>

              {couponMessage && (
                <p className={`cart-coupon-message ${couponMessageType}`}>
                  {couponMessage}
                </p>
              )}
            </form>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={handleGoToCheckout}
            >
              {text.checkout}
            </button>
          </aside>
        </div>
      </section>

      <section className="cart-contact-cta">
        <div className="cart-contact-cta__container">
          <div className="cart-contact-cta__card">
            <div className="cart-contact-cta__avatars" aria-hidden="true">
              <img
                className="cart-contact-cta__avatar cart-contact-cta__avatar--1"
                src={profile1}
                alt=""
              />

              <img
                className="cart-contact-cta__avatar cart-contact-cta__avatar--2"
                src={profile2}
                alt=""
              />

              <img
                className="cart-contact-cta__avatar cart-contact-cta__avatar--3"
                src={profile3}
                alt=""
              />
            </div>

            <h3 className="cart-contact-cta__title">{text.stillQuestions}</h3>

            <p className="cart-contact-cta__subtitle">{text.questionsText}</p>

            <Link className="cart-contact-cta__btn" to="/contact">
              {text.getInTouch}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Cart;