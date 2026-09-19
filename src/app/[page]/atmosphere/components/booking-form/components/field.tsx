import { type ReactNode } from "react";

type FieldProps = {
  label: string;
  badge?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

const Field = ({
  label,
  badge,
  required,
  className = "",
  children,
}: FieldProps) => {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex items-center gap-1 text-sm font-medium text-black">
        {label}
        {required && <span className="text-red">*</span>}
        {badge && (
          <span className="ml-auto text-xs font-medium text-gray220">
            {badge}
          </span>
        )}
      </span>
      {children}
    </label>
  );
};

export default Field;
