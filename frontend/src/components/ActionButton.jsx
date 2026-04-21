const variants = {
  primary: 'cyber-button-primary',
  secondary: 'cyber-button-secondary',
};

export function ActionButton({ variant = 'primary', className = '', children, ...props }) {
  const variantClass = variants[variant] ?? variants.primary;

  return (
    <button
      type="button"
      className={`cyber-button ${variantClass} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
