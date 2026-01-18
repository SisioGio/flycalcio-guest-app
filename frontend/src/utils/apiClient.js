import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://18c750l81c.execute-api.eu-central-1.amazonaws.com/dev/',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }


    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response, // Return the successful response
  async (error) => {
    console.log(error)
    if (error.response && error.response.status === 403) {
      // Token expired or unauthorized
      const refreshToken = localStorage.getItem('refresh_token');
      console.log("Refresh token:", refreshToken);
      if (refreshToken) {
        try {
          // Maximum number of attempts to refresh the token
          let retryCount = 0;
          const maxRetries = 3;
          
          // Attempt to refresh the token while retrying
          while (retryCount < maxRetries) {
            retryCount++;
            try {
              // Send the refresh token to the server to get a new access token
              const response = await apiClient.post('/auth/refresh', { refreshToken });
              
              // Store the new access and refresh tokens
              localStorage.setItem('access_token', response.data.access_token);
              localStorage.setItem('refresh_token', response.data.refresh_token);
                
              // Retry the original request with the new access token
              error.config.headers['Authorization'] = `Bearer ${response.data.access_token}`;
              
              return apiClient(error.config); // Retry the request
            } catch (refreshError) {
              console.error("Refresh token error, retrying...", refreshError);
              // If refresh token fails, retry up to maxRetries
            }
          }

          // If we reached max retries and still failed, log the user out
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = "/login"; // Redirect to login page
          
        } catch (refreshError) {
          // Handle if refresh token request fails (network error, etc.)
          console.error("Refresh token failed", refreshError);
          // Log out user and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = "/login"; // Redirect to login page
        }
      } else {
        // If no refresh token is found, redirect to login directly
        window.location.href = "/login";
      }
    }

    // If other errors happen, reject the error (usual flow)
    return Promise.reject(error);
  }
);

export default apiClient;
