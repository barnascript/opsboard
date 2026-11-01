import { render, screen, within } from "@testing-library/react";
import { act } from "react";
import { DataTable, type Column } from "./DataTable";

type Row = { id: string; name: string; spend: number };
const rows: Row[] = [
  { id: "1", name: "Bola", spend: 30 },
  { id: "2", name: "Ada", spend: 90 },
  { id: "3", name: "Chi", spend: 10 },
];
const columns: Column<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "spend", header: "Spend", numeric: true, sortable: true },
];

const names = () => screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[0]!.textContent);

describe("DataTable", () => {
  it("sorts numerically and toggles direction, exposing aria-sort", () => {
    render(<DataTable rows={rows} columns={columns} caption="People" />);
    const spend = screen.getByRole("button", { name: /spend/i });
    act(() => spend.click());
    expect(names()).toEqual(["Chi", "Bola", "Ada"]);
    expect(screen.getByRole("columnheader", { name: /spend/i })).toHaveAttribute("aria-sort", "ascending");
    act(() => spend.click());
    expect(names()).toEqual(["Ada", "Bola", "Chi"]);
    expect(screen.getByRole("columnheader", { name: /spend/i })).toHaveAttribute("aria-sort", "descending");
  });

  it("has an accessible caption", () => {
    render(<DataTable rows={rows} columns={columns} caption="People" />);
    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
  });
});
