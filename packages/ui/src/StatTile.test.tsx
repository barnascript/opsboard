import { render, screen } from "@testing-library/react";
import { StatTile } from "./StatTile";

describe("StatTile", () => {
  it("colours a rise as good by default", () => {
    render(<StatTile label="Revenue" value="$10" change={0.12} />);
    expect(screen.getByText(/\+12\.0%/).closest("span")).toHaveClass("is-good");
    expect(screen.getByText(/better/)).toBeInTheDocument();
  });

  it("colours a rise as bad when lower is better", () => {
    render(<StatTile label="Refunds" value="3%" change={0.05} lowerIsBetter />);
    expect(screen.getByText(/\+5\.0%/).closest("span")).toHaveClass("is-bad");
  });
});
