import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={
        "rounded-2xl border border-border bg-surface p-4 shadow-sm " +
        className
      }
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={"flex items-start justify-between gap-2 " + className}
    />
  );
}
