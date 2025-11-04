import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      placeholder,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`input-field ${error ? 'input-error' : ''} ${
              icon ? 'input-with-icon' : ''
            }`}
            {...props}
          />
          {icon && <div className="input-icon">{icon}</div>}
        </div>
        {error && <span className="input-error-message">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
