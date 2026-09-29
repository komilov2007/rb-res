import type { GeneralProps } from "@/types/general";
import {
  formatSocialName,
  getSocialIcon,
  getSocialStyle,
} from "@/utils/socials";

type SocialLinksProps = {
  socials: NonNullable<GeneralProps["socials"]>;
  // Each link's own classes — the icon circle is sized differently on the
  // mobile page and the desktop sidebar.
  itemClassName: string;
};

// The shop's social profiles as brand-coloured icon links.
const SocialLinks = ({ socials, itemClassName }: SocialLinksProps) => (
  <div className="mt-2 flex flex-wrap gap-2">
    {socials.map((social) => {
      const Icon = getSocialIcon(social.type);
      const style = getSocialStyle(social.type);

      return (
        <a
          key={social.id}
          href={social.url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: style.color,
            borderColor: style.borderColor,
            backgroundColor: style.backgroundColor,
          }}
          className={itemClassName}
          aria-label={formatSocialName(social.type)}
        >
          <Icon size={22} />
        </a>
      );
    })}
  </div>
);

export default SocialLinks;
