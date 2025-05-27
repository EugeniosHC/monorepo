type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  role?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "white";
  style?: React.CSSProperties;
};

export default function CustomButton({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  role = "button",
  variant = "primary",
  style = {},
}: ButtonProps) {
  const baseStyles =
    "text-sm md:text-base border-2 py-4 px-8 rounded-full font-semibold transition-colors uppercase leading-none flex items-center";

  const variantStyles = {
    primary: "bg-primary text-white border-primary hover:bg-transparent hover:text-primary",
    secondary: "bg-secondary text-white border-secondary hover:bg-transparent hover:text-secondary",
    white: "bg-white text-neutral-800 border-white hover:bg-transparent hover:text-white",
    outline: "bg-transparent border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "bg-transparent border-transparent text-primary hover:bg-primary/10",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      role={role}
      type={type}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
