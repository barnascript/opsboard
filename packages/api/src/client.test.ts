import { ApiRequestError, createApiClient } from "./client";

const json = (status: number, body: unknown) =>
  ({ ok: status < 400, status, statusText: "x", json: async () => body }) as Response;

describe("createApiClient", () => {
  it("returns parsed JSON on success", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(json(200, { totalRevenue: 5 }));
    const api = createApiClient({ baseUrl: "http://x", fetchImpl });
    await expect(api.sales(7)).resolves.toEqual({ totalRevenue: 5 });
    expect(fetchImpl).toHaveBeenCalledWith("http://x/api/sales?days=7", expect.anything());
  });

  it("retries 5xx and then succeeds", async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(json(503, {})).mockResolvedValueOnce(json(200, { ok: 1 }));
    const api = createApiClient({ baseUrl: "", fetchImpl, retries: 1 });
    await expect(api.sales(7)).resolves.toEqual({ ok: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 4xx and surfaces the server message", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(json(400, { error: "days must be 7, 30 or 90" }));
    const api = createApiClient({ baseUrl: "", fetchImpl, retries: 3 });
    const err = await api.sales(5).catch((e) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect(err.message).toBe("days must be 7, 30 or 90");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("builds customer query strings without empty params", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(json(200, { items: [] }));
    await createApiClient({ baseUrl: "", fetchImpl }).customers({ page: 2, search: "ada", tier: "" });
    expect(fetchImpl.mock.calls[0][0]).toBe("/api/customers?page=2&search=ada");
  });
});
