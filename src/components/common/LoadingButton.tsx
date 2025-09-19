import React from "react";
import { Button } from "primereact/button";
import ButtonLoader from "./ButtonLoader";
import "./LoadingButton.css";

interface LoadingButtonProps {
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  icon?: string;
  className?: string;
  severity?:
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "help"
    | "secondary"
    | undefined;
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "large";
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  loaderSize?: "small" | "medium" | "large";
  hideIconWhenLoading?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  disabled = false,
  label,
  loadingLabel,
  icon,
  className = "",
  severity,
  variant = "contained",
  size = "small",
  type = "button",
  onClick,
  children,
  loaderSize = "small",
  hideIconWhenLoading = true,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const displayLabel = loading ? loadingLabel || "Loading..." : label;
  const displayIcon = loading && hideIconWhenLoading ? undefined : icon;

  const buttonClassName = `loading-button ${className} ${
    loading ? "loading-button--loading" : ""
  }`;

  return (
    <Button
      {...props}
      type={type}
      label={displayLabel}
      icon={displayIcon}
      className={buttonClassName}
      severity={severity}
      size={size}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading && (
        <ButtonLoader
          loading={true}
          size={loaderSize}
          className="loading-button__loader"
        />
      )}
      {children && <span className="loading-button__content">{children}</span>}
    </Button>
  );
};

export default LoadingButton;
