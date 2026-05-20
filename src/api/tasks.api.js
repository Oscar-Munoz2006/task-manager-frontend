import axios from "axios";

const tasksApi = axios.create({
  baseURL: "https://task-manager-backend-production-6faf.up.railway.app/api/v1/tasks/",
});

// interceptor de REQUEST — agrega el token en cada petición automáticamente
tasksApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// interceptor de RESPONSE — si el token expiró (401), intenta refrescarlo
tasksApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // si es 401 y no hemos intentado refrescar todavía
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post("http://localhost:8000/api/v1/token/refresh/", {
          refresh,
        });

        const newToken = res.data.access;
        localStorage.setItem("token", newToken);

        // reintentar la petición original con el nuevo token
        original.headers.Authorization = `Bearer ${newToken}`;
        return tasksApi(original);
      } catch {
        // refresh también falló → cerrar sesión
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("isAuth");
        localStorage.removeItem("username");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const getALLTasks = () => tasksApi.get("");
export const getTask     = (id)       => tasksApi.get(`${id}/`);
export const createTask  = (task)     => tasksApi.post("", task);
export const deleteTask  = (id)       => tasksApi.delete(`${id}/`);
export const updateTask  = (id, task) => tasksApi.put(`${id}/`, task);