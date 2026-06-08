const express = require("express");
const cors = require("cors");
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
   Start server
========================= */

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});