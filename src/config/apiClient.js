import axios from 'axios';
import BASE_URL from '../config';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        try {
            const stored = localStorage.getItem('token');
            if (stored) {
                const token = JSON.parse(stored);
                if (token?.access) {
                    config.headers.Authorization = `Bearer ${token.access}`;
                }
            }
        } catch {
            // Malformed token in storage — ignore, the request will be unauthenticated
        }
        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const stored = localStorage.getItem('token');
                const tokenObj = stored ? JSON.parse(stored) : null;
                
                if (!tokenObj || !tokenObj.refresh) {
                    throw new Error("No refresh token");
                }

                const { data } = await axios.post(`${BASE_URL}/api/token/refresh/`, {
                    refresh: tokenObj.refresh
                });

                const newTokenObj = { ...tokenObj, access: data.access };
                if (data.refresh) {
                    newTokenObj.refresh = data.refresh;
                }
                
                localStorage.setItem('token', JSON.stringify(newTokenObj));

                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'token',
                    newValue: JSON.stringify(newTokenObj)
                }));
                
                originalRequest.headers.Authorization = 'Bearer ' + data.access;
                
                processQueue(null, data.access);
                return apiClient(originalRequest);

            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('token');
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'token',
                    newValue: null
                }));
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
