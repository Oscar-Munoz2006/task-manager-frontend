export async function loginRequest(username, password) {
  const res = await fetch("https://task-manager-backend-production-6faf.up.railway.app/api/v1/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (data.access) {
    localStorage.setItem("token", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("isAuth", "true");
    localStorage.setItem("username", username);
  }

  return data;
}