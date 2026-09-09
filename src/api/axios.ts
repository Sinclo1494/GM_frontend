import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
type Subscriber = { resolve: (token: string) => void; reject: (err: unknown) => void };
const subscribers: Subscriber[] = [];

const subscribeTokenRefresh = (cb: Subscriber) => {
  subscribers.push(cb);
};

const notifySubscribers = (newAccess: string) => {
  subscribers.forEach((sub) => sub.resolve(newAccess));
  subscribers.length = 0;
};

const notifySubscribersError = (err: unknown) => {
  subscribers.forEach((sub) => sub.reject(err));
  subscribers.length = 0;
};

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
       originalRequest.url?.includes("/token/refresh/") ||
       originalRequest.url?.includes("/token/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh({ resolve, reject });
      })
        .then((newAccess) => {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const { data } = await axios.post(`${API}/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccess = data.access as string;
      localStorage.setItem("token", newAccess);

      notifySubscribers(newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return axios(originalRequest);
    } catch (refreshError) {
      notifySubscribersError(refreshError);

      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axios;