export async function loginRequest(username, password) {
  const res = await fetch('http://localhost:8000/api/v1/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  return { data };
}