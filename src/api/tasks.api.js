import axios from "axios";

const tasksApi = axios.create({
  baseURL: "https://task-manager-backend-production-6faf.up.railway.app/api/v1/tasks/",
  withCredentials: true,
});

// interceptor de RESPONSE — si el token expiró (401), intenta refrescarlo
tasksApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        await axios.post(
          "https://task-manager-backend-production-6faf.up.railway.app/api/v1/refresh/",
          {},
          { withCredentials: true }
        );

        return tasksApi(original);
      } catch {
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