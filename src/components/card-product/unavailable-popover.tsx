"use client";

import { useEffect, type ReactNode } from "react";

type UnavailablePopoverProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

// Rendered as a direct child of the card's own <article> (already position:
// relative), positioned with plain absolute inset-0 — not a portal
// positioned via getBoundingClientRect()/scroll offsets. That approach
// (rendered into document.body, positioned by measuring the card) could
// show a stray node stuck at the top of the page and never reliably landed
// on the card either. Anchoring it inside the card's own DOM subtree
// instead makes "stay inside the card, one instance, no leftovers" the
// default — there's no viewport math to get wrong and nothing that can
// render anywhere else, since this simply doesn't exist in the tree at all
// while `open` is false (and CardProduct only ever renders one of these per
// card, gated by that same card's own isUnavailable).
const UnavailablePopover = ({ open, onClose, children }: UnavailablePopoverProps) => {
  // A tap on a different card closes this one via the shared openProductId
  // store (see card-product.tsx), and a tap on the backdrop below (inside
  // this same card) calls onClose directly — Escape is the only dismiss
  // path that needs a listener of its own here.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(event) => {
        // Stops this from also reaching the card's own onClick (which would
        // just reopen the same popover) and closes on a backdrop tap.
        event.stopPropagation();
        onClose();
      }}
      className="absolute inset-0 z-20 flex flex-col justify-end rounded-[18px] bg-black/40 p-3 backdrop-blur-[1px] lg:rounded-[20px]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.14)]"
      >
        {children}
      </div>
    </div>
  );
};

export default UnavailablePopover;
