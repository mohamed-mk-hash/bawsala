const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const { ChargilyClient } = require("@chargily/chargily-pay");

const chargily = new ChargilyClient({
  api_key: process.env.CHARGILY_SECRET_KEY,
  mode: process.env.CHARGILY_MODE || "test",
});

const app = express();

const contactEmailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",

      // Add your production frontend URL here later, for example:
      // "https://yourdomain.com",
    ],
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   Helpers
========================= */

async function getAuthenticatedUserId(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  const decodedToken = await admin.auth().verifyIdToken(token);

  return decodedToken.uid;
}

function getYouTubeEmbedUrl(url) {
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

    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
      : cleanUrl;
  } catch (error) {
    return cleanUrl;
  }
}

/* =========================
   Test routes
========================= */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Bawsala backend is running",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
    message: "React can call the backend",
    time: new Date().toISOString(),
  });
});

/* =========================
   Create Chargily payment
========================= */

app.post("/api/create-payment", async (req, res) => {
  try {
    const { amount, paymentMethod, billingInfo, courses, userId } = req.body;

    if (!process.env.CHARGILY_SECRET_KEY) {
      return res.status(500).json({
        ok: false,
        message: "Chargily secret key is missing in server .env file.",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: "Invalid payment amount.",
      });
    }

    if (
      !billingInfo?.firstName ||
      !billingInfo?.lastName ||
      !billingInfo?.email
    ) {
      return res.status(400).json({
        ok: false,
        message: "Missing billing information.",
      });
    }

    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const orderRef = db.collection("orders").doc(orderId);

    await orderRef.set({
      orderId,
      status: "pending",
      amount: Number(amount),
      currency: "DZD",
      paymentMethod,
      paymentProvider: "chargily",
      userId: userId || null,
      billingInfo: {
        firstName: billingInfo.firstName || "",
        lastName: billingInfo.lastName || "",
        email: billingInfo.email || "",
        countryCode: billingInfo.countryCode || "DZ",
        phoneNumber: billingInfo.phoneNumber || "",
        notes: billingInfo.notes || "",
      },
      courses: Array.isArray(courses) ? courses : [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const fullName = `${billingInfo.firstName} ${billingInfo.lastName}`.trim();

    const checkout = await chargily.createCheckout({
      amount: Number(amount),
      currency: "dzd",
      success_url: `${process.env.FRONTEND_URL}/?payment_status=success&order_id=${orderId}&user_id=${userId}`,
      failure_url: `${process.env.FRONTEND_URL}/checkout?payment_status=failed&order_id=${orderId}`,
      payment_method: paymentMethod === "chargily" ? "edahabia" : "edahabia",
      locale: "en",
      pass_fees_to_customer: false,
      metadata: {
        orderId,
        userId: userId || "",
        customerName: fullName,
        customerEmail: billingInfo.email,
        customerPhone: billingInfo.phoneNumber || "",
        courses: JSON.stringify(
          Array.isArray(courses)
            ? courses.map((course) => ({
                id: course.id,
                title: course.title,
                price: course.price,
              }))
            : []
        ),
      },
    });

    console.log("Chargily checkout created:", checkout);

    const paymentUrl = String(checkout.checkout_url || "").replace(
      /^http:\/\//,
      "https://"
    );

    if (!paymentUrl) {
      return res.status(500).json({
        ok: false,
        message: "Chargily did not return a payment URL.",
      });
    }

    return res.json({
      ok: true,
      message: "Chargily checkout created successfully.",
      orderId,
      paymentUrl,
      checkout,
    });
  } catch (error) {
    console.error("Create Chargily payment error:", error);

    return res.status(500).json({
      ok: false,
      message:
        error?.message || "Server error while creating Chargily payment.",
    });
  }
});

/* =========================
   Confirm payment success
========================= */

app.post("/api/confirm-payment-success", async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      return res.status(400).json({
        ok: false,
        message: "Missing orderId or userId.",
      });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderSnapshot = await orderRef.get();

    if (!orderSnapshot.exists) {
      return res.status(404).json({
        ok: false,
        message: "Order not found.",
      });
    }

    const orderData = orderSnapshot.data();
    const courses = Array.isArray(orderData.courses) ? orderData.courses : [];

    const batch = db.batch();

    batch.set(
      orderRef,
      {
        status: "paid",
        adminStatus: orderData.adminStatus || "pending",
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    courses.forEach((course) => {
      const courseId = course.id;

      if (!courseId) return;

      const purchasedCourseRef = db
        .collection("users")
        .doc(userId)
        .collection("purchasedCourses")
        .doc(courseId);

      batch.set(
        purchasedCourseRef,
        {
          courseId,
          orderId,
          title: course.title || "",
          price: Number(course.price || 0),
          status: "active",
          purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    const cartSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("cart")
      .get();

    cartSnapshot.docs.forEach((cartDoc) => {
      batch.delete(cartDoc.ref);
    });

    await batch.commit();

    return res.json({
      ok: true,
      message: "Order confirmed, courses unlocked, and cart emptied.",
    });
  } catch (error) {
    console.error("Confirm payment success error:", error);

    return res.status(500).json({
      ok: false,
      message: "Could not confirm payment success.",
    });
  }
});

/* =========================
   Protected course video
========================= */

app.post("/api/course-module-video", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const userId = await getAuthenticatedUserId(req);
    const { courseId, moduleIndex } = req.body;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "You must be logged in to access this video.",
      });
    }

    if (!courseId || moduleIndex === undefined) {
      return res.status(400).json({
        ok: false,
        message: "Missing courseId or moduleIndex.",
      });
    }

    const purchaseRef = db
      .collection("users")
      .doc(userId)
      .collection("purchasedCourses")
      .doc(courseId);

    const purchaseSnapshot = await purchaseRef.get();

    if (
      !purchaseSnapshot.exists ||
      purchaseSnapshot.data()?.status !== "active"
    ) {
      return res.status(403).json({
        ok: false,
        message: "You do not have access to this course.",
      });
    }

    const courseRef = db.collection("courses").doc(courseId);
    const courseSnapshot = await courseRef.get();

    if (!courseSnapshot.exists) {
      return res.status(404).json({
        ok: false,
        message: "Course not found.",
      });
    }

    const courseData = courseSnapshot.data();

    const modules = Array.isArray(courseData.programmeModules)
      ? courseData.programmeModules
      : [];

    const selectedModule = modules[Number(moduleIndex)];

    if (!selectedModule?.youtubeUrl) {
      return res.status(404).json({
        ok: false,
        message: "Video not found for this module.",
      });
    }

    const embedUrl = getYouTubeEmbedUrl(selectedModule.youtubeUrl);

    return res.json({
      ok: true,
      embedUrl,
    });
  } catch (error) {
    console.error("Course module video error:", error);

    return res.status(500).json({
      ok: false,
      message: "Could not load course video.",
    });
  }
});


/* =========================
   Newsletter verification
========================= */

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

async function saveNewsletterSubscriber({
  email,
  userId = null,
  language = "en",
  verifiedBy = "otp",
}) {
  const subscriberRef = db.collection("newsletterSubscribers").doc(email);

  await subscriberRef.set(
    {
      email,
      userId,
      language,
      subscribed: true,
      verified: true,
      verifiedBy,
      source: "blogs_page",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

app.get("/api/newsletter/status", async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        ok: false,
        message: "INVALID_EMAIL",
      });
    }

    const subscriberSnapshot = await db
      .collection("newsletterSubscribers")
      .doc(email)
      .get();

    const subscribed =
      subscriberSnapshot.exists &&
      subscriberSnapshot.data()?.subscribed === true;

    return res.json({
      ok: true,
      subscribed,
    });
  } catch (error) {
    console.error("Newsletter status error:", error);

    return res.status(500).json({
      ok: false,
      message: error?.message || "Could not check newsletter status.",
    });
  }
});

app.post("/api/newsletter/request-verification", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const accountEmail = normalizeEmail(req.body.accountEmail);
    const userId = req.body.userId || null;
    const language = req.body.language === "ar" ? "ar" : "en";

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        ok: false,
        message: "INVALID_EMAIL",
      });
    }

    const subscriberRef = db.collection("newsletterSubscribers").doc(email);
    const subscriberSnapshot = await subscriberRef.get();

    if (subscriberSnapshot.exists && subscriberSnapshot.data()?.subscribed) {
      return res.status(409).json({
        ok: false,
        message: "MAIL_ALREADY_EXISTS",
      });
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      return res.status(500).json({
        ok: false,
        message: "SMTP_CONFIGURATION_MISSING",
      });
    }

    const otpCode = createOtpCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await db.collection("newsletterOtp").doc(email).set({
      email,
      userId,
      language,
      otpHash: hashOtp(otpCode),
      expiresAt,
      attempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await contactEmailTransporter.sendMail({
  from: `"Bawsala" <${process.env.SMTP_USER}>`,
  to: email,
  subject:
    language === "ar"
      ? "رمز تأكيد الاشتراك في نشرة بوصلة"
      : "Confirm your Bawsala newsletter subscription",
  html: `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#101828;">
      <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border-radius:20px;padding:32px;border:1px solid #e5e7eb;box-shadow:0 18px 45px rgba(16,24,40,0.08);">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="margin:0;font-size:24px;line-height:1.3;color:#101828;">
              ${language === "ar" ? "تأكيد الاشتراك" : "Confirm your subscription"}
            </h1>
            <p style="margin:10px 0 0;color:#667085;font-size:15px;line-height:1.6;">
              ${
                language === "ar"
                  ? "استخدم الرمز التالي لتأكيد اشتراكك في نشرة بوصلة البريدية."
                  : "Use the code below to confirm your Bawsala newsletter subscription."
              }
            </p>
          </div>

          <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:16px;text-align:center;padding:22px;margin:24px 0;">
            <div style="font-size:34px;font-weight:800;letter-spacing:10px;color:#1570ef;">
              ${otpCode}
            </div>
          </div>

          <p style="margin:0;color:#667085;font-size:14px;line-height:1.7;text-align:center;">
            ${
              language === "ar"
                ? "هذا الرمز صالح لمدة 10 دقائق فقط."
                : "This code is valid for 10 minutes only."
            }
          </p>
        </div>

        <p style="text-align:center;color:#98a2b3;font-size:12px;margin-top:18px;">
          © Bawsala
        </p>
      </div>
    </div>
  `,
  text:
    language === "ar"
      ? `رمز تأكيد الاشتراك: ${otpCode}\nهذا الرمز صالح لمدة 10 دقائق فقط.`
      : `Your confirmation code is: ${otpCode}\nThis code is valid for 10 minutes only.`,
});

    return res.json({
      ok: true,
      alreadyVerified: false,
      message: "Verification code sent.",
    });
  } catch (error) {
    console.error("Newsletter request verification error:", error);

    return res.status(500).json({
      ok: false,
      message: error?.message || "Could not send verification code.",
    });
  }
});

app.post("/api/newsletter/verify", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "").trim();

    if (!email || !code) {
      return res.status(400).json({
        ok: false,
        message: "MISSING_EMAIL_OR_CODE",
      });
    }

    const subscriberRef = db.collection("newsletterSubscribers").doc(email);
    const subscriberSnapshot = await subscriberRef.get();

    if (subscriberSnapshot.exists && subscriberSnapshot.data()?.subscribed) {
      return res.status(409).json({
        ok: false,
        message: "MAIL_ALREADY_EXISTS",
      });
    }

    const otpRef = db.collection("newsletterOtp").doc(email);
    const otpSnapshot = await otpRef.get();

    if (!otpSnapshot.exists) {
      return res.status(404).json({
        ok: false,
        message: "CODE_NOT_FOUND",
      });
    }

    const otpData = otpSnapshot.data();

    if (Date.now() > Number(otpData.expiresAt || 0)) {
      await otpRef.delete();

      return res.status(400).json({
        ok: false,
        message: "CODE_EXPIRED",
      });
    }

    if (Number(otpData.attempts || 0) >= 5) {
      await otpRef.delete();

      return res.status(429).json({
        ok: false,
        message: "TOO_MANY_ATTEMPTS",
      });
    }

    if (hashOtp(code) !== otpData.otpHash) {
      await otpRef.set(
        {
          attempts: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return res.status(400).json({
        ok: false,
        message: "INVALID_CODE",
      });
    }

    await saveNewsletterSubscriber({
      email,
      userId: otpData.userId || null,
      language: otpData.language || "en",
      verifiedBy: "otp",
    });

    await otpRef.delete();

    return res.json({
      ok: true,
      message: "Newsletter email verified and saved.",
    });
  } catch (error) {
    console.error("Newsletter verify error:", error);

    return res.status(500).json({
      ok: false,
      message: error?.message || "Could not verify code.",
    });
  }
});


/* =========================
   Contact form email
========================= */

app.post("/api/contact", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      countryCode,
      phone,
      message,
      acceptedPrivacy,
    } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        ok: false,
        message: "Please fill all required fields.",
      });
    }

    if (!acceptedPrivacy) {
      return res.status(400).json({
        ok: false,
        message: "Privacy policy must be accepted.",
      });
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.CONTACT_RECEIVER_EMAIL
    ) {
      return res.status(500).json({
        ok: false,
        message: "Contact email configuration is missing in server .env file.",
      });
    }

    const safeFirstName = String(firstName).trim();
    const safeLastName = String(lastName).trim();
    const safeEmail = String(email).trim();
    const safeCountryCode = String(countryCode || "").trim();
    const safePhone = String(phone || "").trim();
    const safeMessage = String(message).trim();

    const emailInfo = await contactEmailTransporter.sendMail({
      from: `"Bawsala Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: safeEmail,
      subject: `New contact message from ${safeFirstName} ${safeLastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Form Message</h2>

          <p><strong>First name:</strong> ${safeFirstName}</p>
          <p><strong>Last name:</strong> ${safeLastName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safeCountryCode} ${safePhone}</p>

          <hr />

          <p><strong>Message:</strong></p>
          <p>${safeMessage.replace(/\n/g, "<br />")}</p>
        </div>
      `,
      text: `
New Contact Form Message

First name: ${safeFirstName}
Last name: ${safeLastName}
Email: ${safeEmail}
Phone: ${safeCountryCode} ${safePhone}

Message:
${safeMessage}
      `,
    });

    console.log("Contact email sent:", {
  messageId: emailInfo.messageId,
  accepted: emailInfo.accepted,
  rejected: emailInfo.rejected,
  response: emailInfo.response,
});

    return res.json({
      ok: true,
      message: "Contact message sent successfully.",
    });
  } catch (error) {
    console.error("Contact form email error:", error);

    return res.status(500).json({
      ok: false,
      message: "Could not send contact message.",
    });
  }
});

/* =========================
   Start server
========================= */

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
