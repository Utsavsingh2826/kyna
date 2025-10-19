export function getAccessToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    // ignore storage errors
  }
  return null;
}

export function setAccessToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  } catch {
    // ignore storage errors
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem("token");
  } catch {
    // ignore storage errors
  }
}
