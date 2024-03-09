// Fetches data from a URL and includes the access token in the request to allow secure access to the server
export async function fetchWithToken(url, options) {
  // Get the access token from local storage of the browser
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return Promise.reject(new Error("No access token"));
  }
  // Include the access token in the request headers
  const headers = {
    ...options.headers,
    Authorization: accessToken,
    "Content-Type": "application/json",
  };

  try {
    // Make the request with the access token included
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    // Check the content type of the response
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
