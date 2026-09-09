import type { ReactNode } from "react";
export default function Link({ children, href, ...props }: { children?: ReactNode; href: string }) {
  return <a href={href} {...props}>{children}</a>;
}
export function HomeBrandLink({ children, ariaLabel, ...props }: { children?: ReactNode; ariaLabel?: string }) {
  return <a href="#" aria-label={ariaLabel} {...props}>{children}</a>;
}
