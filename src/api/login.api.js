export async function loginRequest(username, password) {
  const res = await fetch("http://localhost:8000/api/v1/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (data.access) {
    localStorage.setItem("token", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("isAuth", "true");
    localStorage.setItem("username", username); // 👈 para el dashboard y navbar
  }

  return data;
}