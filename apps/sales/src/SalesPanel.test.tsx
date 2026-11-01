import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import SalesPanel from "./SalesPanel";

const summary = (days: number) => ({
  asOf: "2011-12-09",
  days: [{ date: "2026-10-31", revenue: 1000, orders: 20 }],
  totalRevenue: days * 100,
  totalOrders: 20,
  avgOrderValue: 50,
  changeVsPrevious: 0.1,
});

beforeEach(() => {
  global.fetch = jest.fn(async (url: string) => {
    const days = Number(new URL(url, "http://x").searchParams.get("days"));
    return { ok: true, status: 200, json: async () => summary(days) } as Response;
  }) as unknown as typeof fetch;
});

it("loads 30 days by default and refetches when the range changes", async () => {
  render(<SalesPanel apiBase="" />);
  expect(screen.getByRole("status")).toHaveTextContent(/loading sales/i);
  expect(await screen.findByText("£3,000")).toBeInTheDocument();

  act(() => screen.getByRole("button", { name: "7d" }).click());
  expect(await screen.findByText("£700")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "7d" })).toHaveAttribute("aria-pressed", "true");
});

it("shows an error with a working retry", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: false, status: 400, statusText: "Bad", json: async () => ({ error: "nope" }) })
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => summary(30) });
  render(<SalesPanel apiBase="" />);
  expect(await screen.findByRole("alert")).toHaveTextContent("nope");
  act(() => screen.getByRole("button", { name: /try again/i }).click());
  await waitFor(() => expect(screen.getByText("£3,000")).toBeInTheDocument());
});
