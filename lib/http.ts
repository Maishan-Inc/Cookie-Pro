export function jsonResponse<T>(body: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
    status: init?.status ?? 200,
  });
}

export function errorResponse({
  status = 400,
  code = "BAD_REQUEST",
  message,
}: {
  status?: number;
  code?: string;
  message: string;
}): Response {
  return jsonResponse(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
