import type { ReactNode } from "react";

import "./DataList.css";

export type DataListItem = {
  id: string;
  label: ReactNode;
  color?: string;
  value?: ReactNode;
  action?: ReactNode;
};

type DataListProps = {
  label: string;
  items: readonly DataListItem[];
  layout?: "rows" | "chips";
};

export function DataList({ label, items, layout = "rows" }: DataListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={`data-list data-list--${layout}`} aria-label={label}>
      {items.map((item) => (
        <li key={item.id} className="data-list__item">
          {item.color === undefined ? null : (
            <span
              aria-hidden="true"
              className="data-list__mark"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="data-list__label">{item.label}</span>
          {item.value === undefined ? null : (
            <span className="data-list__value">{item.value}</span>
          )}
          {item.action}
        </li>
      ))}
    </ul>
  );
}
