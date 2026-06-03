import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Blogs from "./pages/Blogs/Blogs";
import Home from "./Components/Home";
import SignIn from "./pages/Sign_in/SignIn";
import Login from "./pages/Login/Login";
import ResetPassword from "./pages/Reset_password/ResetPassword";
import PasswordResetCode from "./pages/Password_reset_code/PasswordResetCode";
import Setnewpassword from "./pages/Set_new_password/Setnewpassword";
import Alldone from "./pages/Password_all_done/Alldone";
import Careers from "./pages/Carrer/Carrers";
import Courses from "./pages/Courses/Courses";
import CourseDetails from "./pages/CourseDetails/CourseDetails";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Service from "./pages/Services/Service";
import ServiceDetail from "./pages/serviceDetails/ServiceDetail";
import Product from "./pages/Products/Product";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import BlogDetail from "./pages/BlogDetail/BlogDetail";
export default function App() {
  return (
    <div>
      <Header />
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blogs />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/resetpassword" element={<ResetPassword/>} />
        <Route path="/resetpasswordcode" element={<PasswordResetCode/>} />
        <Route path="/Setnewpassword" element={<Setnewpassword/>} />
        <Route path="/alldone" element={<Alldone/>} />
        <Route path="/careers" element={<Careers/>} />
       <Route path="/courses" element={<Courses />} />
       <Route path="/courses/:slug" element={<CourseDetails />} />
        <Route path="/Cart" element={<Cart/>} /> 
        <Route path="/Checkout" element={<Checkout/>} /> 
        <Route path="/UserDashboard" element={<Dashboard/>} /> 
        <Route path="/services" element={<Service />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/products" element={<Product />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
      </Routes>
      <Footer/>
    </div>
  );
}
