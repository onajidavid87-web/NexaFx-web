const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach((key) => searchParams.append(key, params[key]));
  }
  const finalUrl = searchParams.toString()
    ? `${url}?${searchParams.toString()}`
    : url;

  const getHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    const headers = new Headers(fetchOptions.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  const response = await fetch(finalUrl, {
    ...fetchOptions,
    headers: getHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data?.message || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}
