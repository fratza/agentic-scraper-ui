import React from "react";
import "./InlineLoader.css";

interface InlineLoaderProps {
  size?: "small" | "medium" | "large";
  message?: string;
  className?: string;
  variant?: "spinner" | "dots" | "pulse";
}

const InlineLoader: React.FC<InlineLoaderProps> = ({
  size = "medium",
  message = "Loading...",
  className = "",
  variant = "spinner",
}) => {
  const renderSpinner = () => (
    <div className={`inline-spinner inline-spinner--${size}`}>
      <div className="spinner-circle"></div>
    </div>
  );

  const renderDots = () => (
    <div className="dots-container">
      <div className={`dot dot--${size}`} style={{ animationDelay: "0ms" }} />
      <div className={`dot dot--${size}`} style={{ animationDelay: "150ms" }} />
      <div className={`dot dot--${size}`} style={{ animationDelay: "300ms" }} />
    </div>
  );

  const renderPulse = () => (
    <div className={`pulse-loader pulse-loader--${size}`} />
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`inline-loader ${className}`}>
      {renderLoader()}
      {message && (
        <span
          className={`inline-loader__message inline-loader__message--${size}`}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default InlineLoader;
