"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label className="form-label">{label}</label>
        )}
        <input
          ref={ref}
          className={`input ${className}`.trim()}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
