import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${
        fullWidth ? 'btn-full-width' : ''
      } ${loading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-loader"></span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="btn-icon btn-icon-left">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="btn-icon btn-icon-right">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
