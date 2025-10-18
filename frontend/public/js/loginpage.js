import { API_CONFIG } from "./config.js";
const API_URL = API_CONFIG.NODE_API;

console.log("🌿 Bloom Login Page Loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Card flip functionality
  const card = document.querySelector(".card");
  const createAccountLink = document.querySelector(".createnew a");
  const backToLoginLink = document.querySelector(".backtologin a");

  createAccountLink?.addEventListener("click", (e) => {
    e.preventDefault();
    card.classList.add("flipped");
  });

  backToLoginLink?.addEventListener("click", (e) => {
    e.preventDefault();
    card.classList.remove("flipped");
  });

  // Password toggle
  document.querySelectorAll(".password-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const container = toggle.closest(".password-container");
      const input = container.querySelector("input");
      container.classList.toggle("show-password");
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // ========== LOGIN ==========
  const loginBtn = document.querySelector(".loginbtn");

  loginBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail")?.value.trim() || "";
    const password = document.getElementById("loginPassword")?.value || "";

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        window.location.href = "/landingindex.html";
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("Network error: " + error.message);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Log in";
    }
  });

  // ========== SIGNUP ==========
  const signupBtn = document.querySelector(".signupbtn");

  signupBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName")?.value.trim() || "";
    const email = document.getElementById("signupEmail")?.value.trim() || "";
    const password = document.getElementById("signupPassword")?.value || "";
    const confirmPwd =
      document.getElementById("signupConfirmPassword")?.value || "";

    console.log("Signup data:", {
      name,
      email,
      password: "***",
      confirmPwd: "***",
    });

    if (!name || !email || !password || !confirmPwd) {
      alert("Please fill in all fields");
      return;
    }

    if (name.length < 2) {
      alert("Name must be at least 2 characters");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPwd) {
      alert("Passwords do not match");
      return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = "Creating account...";

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Account created successfully!");
        window.location.href = "/landingindex.html";
        // Or the exact filename of your beautiful page
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Network error: " + error.message);
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";
    }
  });

  // Check if already logged in
  const token = localStorage.getItem("token");
  if (token) {
    fetch(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) =>
        res.ok
          ? (window.location.href = "/landingindex.html")
          : localStorage.clear()
      )
      .catch(() => localStorage.clear());
  }
});
