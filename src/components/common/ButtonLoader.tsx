import React from "react";
import "./ButtonLoader.css";

interface ButtonLoaderProps {
  loading?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  loading = false,
  size = "medium",
  className = "",
}) => {
  if (!loading) return null;

  return (
    <div className={`button-loader ${className}`}>
      <div className={`spinner spinner--${size}`}>
        <div className="spinner__circle"></div>
      </div>
    </div>
  );
};

export default ButtonLoader;
