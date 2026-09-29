import type { ReactNode } from "react";

const AboutSection = ({
  id,
  title,
  children,
}: {
  // Set only where something links straight to a section (the footer's
  // "Filiallar" jumps to #branches); the rest stay anchorless.
  id?: string;
  title: string;
  children: ReactNode;
}) => (
  <section
    id={id}
    data-about-section={title}
    className="rounded-2xl border border-gray180 bg-white p-4 lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:pb-5 lg:pt-3 lg:first-of-type:pt-0 lg:last-of-type:border-b-0 lg:last-of-type:pb-0"
  >
    <h2 className="text-sm font-medium text-black">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

export default AboutSection;
