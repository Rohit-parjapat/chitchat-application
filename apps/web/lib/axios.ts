import axios from "axios";
import {useRouter} from "next/navigation"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config; 
    
    // 3. Check if the error is due to authentication failure, and prevent infinite loops
    if (
      error.response &&
      error.response.status === 401 && // 401 = Unauthorized (token likely expired)
      !originalRequest._retry // Custom flag to avoid infinite retry loop
    ) {
      originalRequest._retry = true; // Mark this request as already retried

      try {
        // 4. Call your refresh token endpoint (server should read refresh token from cookies)
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/refresh-token`, 
          {}, // Empty body, server reads token from cookie
          { withCredentials: true } // Ensure cookies are sent
        );

        // 5. The server responds with new access token (could be set in another cookie)
  // const { accessToken } = res.data; // removed unused variable

        // 6. Optionally, set Authorization header for subsequent requests (if required)
        // api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        // originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // 7. Retry the original request with updated headers
        return api(originalRequest);

      } catch (refreshError) {
        const router = useRouter();
        // 8. If refreshing fails, return or handle the error (logout user, show a message, etc.)
        console.error("Token refresh failed:", refreshError);

        router.push("/login");

        return Promise.reject(refreshError);
      }
    }
    // 9. If error is not handled above, pass it to next error handler
    return Promise.reject(error);
  }
);

export default api;

