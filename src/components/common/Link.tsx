import React, { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigateTo, isActivePath } from "../../utils/navigation";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  activeClassName?: string;
  exact?: boolean;
  replace?: boolean;
}

const Link: React.FC<LinkProps> = ({
  to,
  className = "",
  activeClassName = "",
  exact = false,
  replace = false,
  children,
  onClick,
  ...rest
}) => {
  const isActive = isActivePath(to, exact);
  const combinedClassName = `${className} ${
    isActive ? activeClassName : ""
  }`.trim();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }

    // Only navigate if the default was prevented
    if (!e.defaultPrevented) {
      navigateTo(to, { replace });
    }
  };

  return (
    <a
      href={to}
      className={combinedClassName || undefined}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
