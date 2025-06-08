import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";
import axios from "axios"; // Import axios for API calls


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCn-DHT5V9D8IpfrvzbwGEZJZI3cLNb7gU",
  authDomain: "formly-ca78c.firebaseapp.com",
  projectId: "formly-ca78c",
  storageBucket: "formly-ca78c.firebasestorage.app",
  messagingSenderId: "754941100690",
  appId: "1:754941100690:web:652d2c5c018f29302ddc4b",
  measurementId: "G-6N8W86X062",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
auth.languageCode = "it";

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // Force account selection every time
});



export const handleGoogleSignIn = async (navigate, setValidationError) => {
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    // Sign in with Google
    const result = await signInWithPopup(auth, provider);

    // Get the signed-in user's details
    const user = result.user;

    // Extract user details
    const displayName = user.displayName || "";
    const [firstName, ...lastNameParts] = displayName.split(" ");
    const lastName = lastNameParts.join(" ") || null;

    // Send the user's email, first name, and last name to the backend
    const response = await axios.post("https://formly-production.up.railway.app/google_register.php", {
      email: user.email,
      firstName: firstName,
      lastName: lastName,
    });

    if (response.data.success) {
      const { token, user } = response.data; // Extract token and user from the response
      localStorage.setItem("token", token); // Store the token in localStorage
      localStorage.setItem("userId", user.id); // Store the userId in localStorage
      localStorage.setItem("email", user.email); // Store the email in localStorage
      navigate("/formly"); // Redirect to /formly after successful sign-in
    } else {
      setValidationError(response.data.message || "An error occurred during Google Sign-In.");
    }
  } catch (error) {
    console.error("Error during Google Sign-In:", error.message);
    setValidationError("An error occurred during Google Sign-In. Please try again.");
  }
};

export const handleLogout = async (navigate) => {
    const auth = getAuth();
    try {
      await signOut(auth); // Sign out from Firebase (Google users)
      console.log("User logged out successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("userId"); // Store the userId in localStorage
      localStorage.removeItem("email"); // Example: Clear token from localStorage
      localStorage.removeItem("draftSurvey"); // Example: Clear draft from localStorage
      
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };