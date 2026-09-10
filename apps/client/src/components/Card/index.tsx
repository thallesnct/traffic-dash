import type { HTMLAttributes } from "react";

import "./Card.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section";
};

export function Card({ as = "div", className, ...props }: CardProps) {
  const cardClassName = ["card", className].filter(Boolean).join(" ");

  if (as === "section") {
    return <section {...props} className={cardClassName} />;
  }

  return <div {...props} className={cardClassName} />;
}
