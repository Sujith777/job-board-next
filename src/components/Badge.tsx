import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="border px-2 py-0.5 bg-muted font-medium text-sm text-muted-foreground">
      {children}
    </span>
  );
}
