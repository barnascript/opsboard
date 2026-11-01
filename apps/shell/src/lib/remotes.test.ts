/** @jest-environment node */
describe("REMOTES", () => {
  const load = (env: Record<string, string | undefined>) => {
    jest.resetModules();
    Object.assign(process.env, env);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require("./remotes") as typeof import("./remotes")).REMOTES;
  };
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SALES_URL;
    delete process.env.NEXT_PUBLIC_CUSTOMERS_URL;
  });

  it("falls back to localhost in development", () => {
    expect(load({})).toEqual({ sales: "http://localhost:3001", customers: "http://localhost:3002" });
  });

  it("turns a bare Render hostname into an https origin", () => {
    expect(load({ NEXT_PUBLIC_SALES_URL: "opsboard-sales.onrender.com" }).sales).toBe("https://opsboard-sales.onrender.com");
  });

  it("keeps a full URL and drops a trailing slash", () => {
    expect(load({ NEXT_PUBLIC_CUSTOMERS_URL: "https://cdn.example.com/" }).customers).toBe("https://cdn.example.com");
  });
});
