export async function fetchWithToken(url, options) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return Promise.reject(new Error("No access token"));
  }

  const headers = {
    ...options.headers,
    Authorization: accessToken,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow the error for downstream handling
  }
}
