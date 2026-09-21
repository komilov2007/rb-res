"use client";

import { useTranslations } from "next-intl";

// "<Robosell.uz> tomonidan taqdim etilgan" line. The paragraph's own classes
// differ between the mobile page and the desktop sidebar, so they're passed
// in unchanged.
const PoweredBy = ({ className }: { className: string }) => {
  const t = useTranslations();

  return (
    <p className={className}>
      {t.rich("profile_page_powered_by", {
        link: (chunks) => (
          <a
            href="https://robosell.uz/"
            target="_blank"
            rel="noopener noreferrer"
            className="!text-primary"
          >
            {chunks}
          </a>
        ),
      })}
    </p>
  );
};

export default PoweredBy;
