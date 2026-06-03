import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Courses_Programs from "./Courses_Programs/Courses_Programs";
import Experience from "./Experience";
import Faq from "./Faq";
import Hero from "./Hero";
import Insights from "./Insights";
import Our_Service from "./Our_Service/Our_Service";
import Services from "./Services";
import Testimonials from "./testimonials ";

import "./Home.css";

export default function Home() {
  const location = useLocation();
  const [paymentToast, setPaymentToast] = useState("");

  const language = localStorage.getItem("site_language") || "en";
  const isArabic = language === "ar";

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const paymentStatus = params.get("payment_status");
    const orderId = params.get("order_id");
    const userId = params.get("user_id");

    if (paymentStatus !== "success" || !orderId || !userId) {
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await fetch(
          "/api/confirm-payment-success",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              userId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.ok) {
          setPaymentToast(
            isArabic
              ? "تم الدفع، لكن تعذر تأكيد الطلب. يرجى التواصل معنا."
              : "Payment succeeded, but the order could not be confirmed. Please contact us."
          );
          return;
        }

        setPaymentToast(
          isArabic
            ? "تم تأكيد طلبك بنجاح"
            : "Your order passed successfully"
        );

        window.history.replaceState({}, "", window.location.pathname);

        setTimeout(() => {
          setPaymentToast("");
        }, 5000);
      } catch (error) {
        console.error("Could not confirm payment:", error);

        setPaymentToast(
          isArabic
            ? "تم الدفع، لكن حدث خطأ أثناء تأكيد الطلب."
            : "Payment succeeded, but an error occurred while confirming the order."
        );
      }
    };

    confirmPayment();
  }, [location.search, isArabic]);

  return (
    <>
      {paymentToast && (
        <div
          className={`payment-success-toast ${
            isArabic ? "is-arabic" : "is-english"
          }`}
        >
          {paymentToast}
        </div>
      )}

      <Hero />
      <Our_Service />
      <Courses_Programs />
      <Services />
      <Testimonials />
      <Insights />
      <Faq />
    </>
  );
}