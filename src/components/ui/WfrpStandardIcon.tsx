import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./button";

type WfrpStandardIconProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  desktopLabel?: ReactNode;
  icon: ReactNode;
  label: string;
};

/** @deprecated Use Button with variant="wfrpIcon". */
export function WfrpStandardIcon({ desktopLabel, icon, label, ...props }: WfrpStandardIconProps) {
  return (
    <Button
      variant="wfrpIcon"
      aria-label={label}
      desktopLabel={desktopLabel}
      leadingIcon={icon}
      {...props}
    />
  );
}
