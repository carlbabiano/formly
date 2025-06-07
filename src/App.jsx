
import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Login from "./pages/login"
import Register from "./pages/register"
import ForgotPassword from "./pages/forgot-password"
import ResetPassword from "./pages/reset-password"
import Formly from "./pages/formly"
import BuilderPage from "./pages/builderpage"
import Answerpage from "./pages/answerpage"
import Responses from "./pages/responses"
import TemplateSelection from "./pages/template-selection"
import Navbar from "./components/navbar"
import AdminDashboard from "./pages/AdminDashboard"
import ProtectedRoutes from "./components/ProtectedRoutes"
import { UserProvider } from "./context/UserContext"
import AboutUs from "./pages/about-us"
import Developers from "./pages/developers"
import ContactUs from "./pages/contact-us"
import LandingPage from "./pages/landing-page"

const getUserFromToken = () => {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1])) // Decode the JWT payload
    return {
      email: payload.email,
      firstName: payload.firstName, // Extract first name
      lastName: payload.lastName, // Extract last name
    }
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

const App = () => {
  const user = getUserFromToken() // Get the user from the token

  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/answerpage/:id" element={<Answerpage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/developers" element={<Developers />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route
              path="/formly"
              element={
                <>
                  <Navbar user={user} />
                  <Formly />
                </>
              }
            />
            <Route
              path="/AdminDashboard"
              element={
                <>
                  <Navbar user={user} />
                  <AdminDashboard />
                </>
              }
            />
            <Route path="/builderpage" element={<BuilderPage />} />
            <Route path="/builderpage/:id" element={<BuilderPage />} />
            <Route path="/responses/:id" element={<Responses />} />
            <Route
              path="/template-selection"
              element={
                <>
                  <Navbar user={user} />
                  <TemplateSelection />
                </>
              }
            />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App
