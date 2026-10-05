"use client";

import { useTranslations } from "next-intl";

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
            className="!text-robosell"
          >
            {chunks}
          </a>
        ),
      })}
    </p>
  );
};

export default PoweredBy;
