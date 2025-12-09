const fetchData = async (
  url: string,
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE",
  body?: object,
) => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
    },
    body:
      method !== "GET" && method !== "DELETE" && body
        ? JSON.stringify(body)
        : undefined,
  });

  if (response.status === 204) {
    return {
      isError: false,
      code: response.status,
    };
  }
  if (response.status >= 400) {
    return {
      isError: true,
      code: response.status,
      message: (await response.json()).message,
    };
  }

  return {
    isError: false,
    code: response.status,
    data: await response.json(),
  };
};

export const get = async (url: string) => {
  return await fetchData(url, "GET");
};

export const post = async (url: string, body: object) => {
  return await fetchData(url, "POST", body);
};

export const put = async (url: string, body: object) => {
  return await fetchData(url, "PUT", body);
};

export const patch = async (url: string, body: object) => {
  return await fetchData(url, "PATCH", body);
};

export const del = async (url: string) => {
  return await fetchData(url, "DELETE");
};
