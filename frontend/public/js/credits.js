import { API_CONFIG } from "./config.js";

const API_URL = API_CONFIG.NODE_API;

export async function getCredits() {
  const token = localStorage.getItem("token");

  try {
<<<<<<< HEAD
    const response = await fetch(`${API_URL}/api/user/credits`, {
=======
    const response = await fetch(`${API_URL}/credits`, {
>>>>>>> eabecb719819e77d343788f4e3a9af80e6c5c542
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching credits:", error);
    return null;
  }
}

export async function checkCredits() {
  const token = localStorage.getItem("token");

  try {
<<<<<<< HEAD
    const response = await fetch(`${API_URL}/api/user/credits/check`, {
=======
    const response = await fetch(`${API_URL}/credits/check`, {
>>>>>>> eabecb719819e77d343788f4e3a9af80e6c5c542
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { hasEnoughCredits: false };
  } catch (error) {
    console.error("Error checking credits:", error);
    return { hasEnoughCredits: false };
  }
}

export async function deductCredits() {
  const token = localStorage.getItem("token");

  try {
<<<<<<< HEAD
    const response = await fetch(`${API_URL}/api/user/credits/deduct`, {
=======
    const response = await fetch(`${API_URL}/credits/deduct`, {
>>>>>>> eabecb719819e77d343788f4e3a9af80e6c5c542
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    const error = await response.json();
    throw new Error(error.error || "Failed to deduct credits");
  } catch (error) {
    console.error("Error deducting credits:", error);
    throw error;
  }
}
