export async function loginRequest(username, password) {
  const res = await fetch("https://task-manager-backend-production-6faf.up.railway.app/api/v1/login/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("isAuth", "true");
    localStorage.setItem("username", username);
  }

  return data;
}

export async function logoutRequest() {
  await fetch("https://task-manager-backend-production-6faf.up.railway.app/api/v1/logout/", {
    method: "POST",
    credentials: "include",
  });
  localStorage.removeItem("isAuth");
  localStorage.removeItem("username");
}