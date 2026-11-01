"""
Build Opsboard's data files from the UCI "Online Retail II" dataset.

  Source:  https://archive.ics.uci.edu/dataset/502/online+retail+ii
  Licence: CC BY 4.0 (Daqing Chen, 2019)

Usage:
  curl -L -o data/raw/online_retail_ii.zip https://archive.ics.uci.edu/static/public/502/online+retail+ii.zip
  unzip -o data/raw/online_retail_ii.zip -d data/raw
  python3 -I scripts/import_uci.py data/raw/online_retail_II.xlsx apps/shell/src/data

The ~1M raw rows are aggregated here, once, so the API serves small
pre-computed files instead of scanning transactions on every request.
"""

import json
import sys
from pathlib import Path

import pandas as pd

# stock codes that are fees or adjustments, not products
NON_PRODUCT = {"POST", "DOT", "M", "m", "BANK CHARGES", "AMAZONFEE", "ADJUST", "ADJUST2", "D", "C2", "CRUK", "PADS", "S", "B", "TEST001", "TEST002"}


def main(xlsx: str, out_dir: str) -> None:
    sheets = pd.read_excel(xlsx, sheet_name=None, dtype={"Invoice": str, "StockCode": str, "Customer ID": "Int64"})
    raw = pd.concat(sheets.values(), ignore_index=True)
    # the two yearly sheets overlap on 1-9 Dec 2010
    raw = raw.drop_duplicates()
    stats = {"rawRows": int(len(raw))}

    # A cancellation ("C" invoice, negative qty) only removes itself if we just
    # drop it; the purchase it reversed stays counted. 9 Dec 2011 alone would
    # carry a £168k order of 80,995 paper birds that was cancelled that day.
    # Match each cancellation to the latest earlier purchase with the same
    # customer, stock code and quantity, and drop that purchase too.
    cancels = raw[raw["Invoice"].str.startswith("C") & (raw["Quantity"] < 0) & raw["Customer ID"].notna()]
    buys = raw[~raw["Invoice"].str.startswith("C") & (raw["Quantity"] > 0) & raw["Customer ID"].notna()]
    open_buys: dict[tuple, list] = {}
    for idx, r in buys.sort_values("InvoiceDate").iterrows():
        open_buys.setdefault((r["Customer ID"], r["StockCode"], r["Quantity"]), []).append((r["InvoiceDate"], idx))
    reversed_idx = []
    for _, c in cancels.sort_values("InvoiceDate").iterrows():
        candidates = open_buys.get((c["Customer ID"], c["StockCode"], -c["Quantity"]), [])
        # latest purchase at or before the cancellation; later ones stay for later cancellations
        for i in range(len(candidates) - 1, -1, -1):
            if candidates[i][0] <= c["InvoiceDate"]:
                reversed_idx.append(candidates.pop(i)[1])
                break
    raw = raw.drop(index=reversed_idx)
    stats["purchasesReversedByCancellation"] = len(reversed_idx)

    df = raw[
        ~raw["Invoice"].str.startswith("C")
        & (raw["Quantity"] > 0)
        & (raw["Price"] > 0)
        & ~raw["StockCode"].isin(NON_PRODUCT)
        & ~raw["StockCode"].str.startswith("gift_", na=False)
    ].copy()
    stats["cleanRows"] = int(len(df))
    df["revenue"] = df["Quantity"] * df["Price"]
    df["date"] = df["InvoiceDate"].dt.normalize()

    # daily sales over a continuous calendar: days the shop was closed are real zeros
    daily = df.groupby("date").agg(revenue=("revenue", "sum"), orders=("Invoice", "nunique"))
    calendar = pd.date_range(daily.index.min(), daily.index.max(), freq="D")
    daily = daily.reindex(calendar, fill_value=0)
    sales = [
        {"date": d.strftime("%Y-%m-%d"), "revenue": round(float(r.revenue), 2), "orders": int(r.orders)}
        for d, r in daily.iterrows()
    ]

    known = df[df["Customer ID"].notna()]
    cust = known.groupby("Customer ID").agg(
        country=("Country", "first"),
        visits=("Invoice", "nunique"),
        lifetimeSpend=("revenue", "sum"),
        firstVisit=("date", "min"),
        lastVisit=("date", "max"),
    )
    # tier by spend rank: top 10% gold, next 30% silver, rest bronze
    pct = cust["lifetimeSpend"].rank(pct=True, method="first")
    cust["tier"] = "bronze"
    cust.loc[pct > 0.6, "tier"] = "silver"
    cust.loc[pct > 0.9, "tier"] = "gold"
    customers = [
        {
            "id": str(int(cid)),
            "country": r.country,
            "tier": r.tier,
            "visits": int(r.visits),
            "lifetimeSpend": round(float(r.lifetimeSpend), 2),
            "lastVisit": r.lastVisit.strftime("%Y-%m-%d"),
        }
        for cid, r in cust.sort_values("lifetimeSpend", ascending=False).iterrows()
    ]

    stats.update(
        {
            "source": "UCI Online Retail II (CC BY 4.0)",
            "currency": "GBP",
            "firstDate": sales[0]["date"],
            "lastDate": sales[-1]["date"],
            "customers": len(customers),
            "orders": int(df["Invoice"].nunique()),
            "revenue": round(float(df["revenue"].sum()), 2),
            "rowsWithoutCustomer": int(df["Customer ID"].isna().sum()),
        }
    )

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "sales-daily.json").write_text(json.dumps(sales, separators=(",", ":")))
    (out / "customers.json").write_text(json.dumps(customers, separators=(",", ":")))
    (out / "meta.json").write_text(json.dumps(stats, indent=2) + "\n")
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
