const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PROXY_URL = "/api/proxy";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  useProxy?: boolean;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, useProxy = true, ...fetchOptions } = options;

  const url = useProxy
    ? `${PROXY_URL}${path.startsWith("/") ? path : `/${path}`}`
    : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

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
      if (useProxy) {
        headers.set("x-client-token", token);
      } else {
        headers.set("Authorization", `Bearer ${token}`);
      }
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
