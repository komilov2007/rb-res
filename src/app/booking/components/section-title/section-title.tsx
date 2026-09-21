import type { ComponentType } from "react";

type SectionTitleProps = {
  Icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  hint?: string;
};

// Same section heading the order page's cards use (shipping-time etc.).
const SectionTitle = ({ Icon, title, hint }: SectionTitleProps) => {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-bold text-black">
        <Icon size={18} className="text-gray220" />
        {title}
      </h2>
      {hint && (
        <p className="mt-0.5 text-xs font-medium text-gray220">{hint}</p>
      )}
    </div>
  );
};

export default SectionTitle;
