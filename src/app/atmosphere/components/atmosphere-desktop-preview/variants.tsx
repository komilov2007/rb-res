"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { ArrowRight, Expand } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { galleryImages } from "@/constants/atmosphere";

import {
  ATMOSPHERE_VIDEO_SRC,
  type AtmosphereVariantProps,
} from "../../constants";
import { pad } from "../../utils";

// TEMPORARY — desktop /atmosphere layout variants 1, 2, 4. Every variant shows
// the same content: the one description text, the video, the six photos
// and the booking button. Media open the shared viewer (0 = video,
// photo i = i + 1), same as AtmosphereDesktop.

export type DesktopVariantProps = AtmosphereVariantProps & {
  onBook: () => void;
};

const BookButton = ({
  onBook,
  className = "",
}: {
  onBook: () => void;
  className?: string;
}) => {
  const t = useTranslations();

  return (
    <Button
      type="button"
      variant="primary-solid"
      size="primaryWide"
      onClick={onBook}
      className={`h-12 w-auto rounded-xl px-8 text-base ${className}`}
    >
      {t("booking_submit")}
      <ArrowRight size={18} />
    </Button>
  );
};

const Video = ({ className = "" }: { className?: string }) => (
  <video
    src={ATMOSPHERE_VIDEO_SRC}
    autoPlay
    muted
    loop
    playsInline
    className={`h-full w-full object-cover ${className}`}
  />
);

const Photo = ({
  index,
  onOpen,
  className = "",
  imgClassName = "",
}: {
  index: number;
  onOpen: (index: number) => void;
  className?: string;
  imgClassName?: string;
}) => {
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={() => onOpen(index + 1)}
      className={`group relative overflow-hidden bg-gray10 ${className}`}
    >
      <img
        src={galleryImages[index].src}
        alt={t("booking_gallery_image_alt")}
        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgClassName}`}
      />
    </button>
  );
};

const ExpandButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Expand"
    className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/55"
  >
    <Expand size={18} />
  </button>
);

// 1 — text + button stay pinned on the left while tall photos scroll by.
export const StickySplit = ({ onOpen, onBook }: DesktopVariantProps) => {
  const t = useTranslations();

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-14 px-5 py-10">
      <div>
        <div className="sticky top-24 flex flex-col gap-8">
          <span className="block h-1 w-14 rounded-full bg-primary" />
          <p className="text-[22px] leading-[1.6] text-black/80">
            {t("atmosphere_description")}
          </p>
          <BookButton onBook={onBook} className="self-start" />
          <div className="relative h-56 overflow-hidden rounded-3xl bg-black">
            <Video />
            <ExpandButton onClick={() => onOpen(0)} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {galleryImages.map((image, index) => (
          <Photo
            key={image.src}
            index={index}
            onOpen={onOpen}
            className={`rounded-[28px] ${index % 3 === 0 ? "h-[560px]" : "h-[400px]"}`}
          />
        ))}
      </div>
    </div>
  );
};

// px per frame (~30px/s at 60fps) — slow enough to read as ambient motion.
const STRIP_SPEED = 0.5;
// Pointer travel above which a press counts as a drag, not a click.
const DRAG_THRESHOLD = 5;

// Variant 2's photo strip: drifts left on its own in an endless loop (the
// photos are rendered twice and the offset wraps at one set's width) and
// can be dragged with the mouse; the drift pauses while hovered or
// dragged. A press that moved is a drag, so it doesn't open the viewer.
// Length of one photo set (incl. its trailing gap): where the second copy
// starts relative to the first — so the wrap lands on an identical frame.
const getLoopWidth = (track: HTMLDivElement) => {
  const first = track.children[0] as HTMLElement | undefined;
  const copy = track.children[galleryImages.length] as HTMLElement | undefined;

  return first && copy ? copy.offsetLeft - first.offsetLeft : 0;
};

const FilmStrip = ({ onOpen }: { onOpen: (index: number) => void }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  // Scroll offset kept as a float — scrollLeft itself rounds, which would
  // stall a sub-pixel drift.
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const track = trackRef.current;

      if (track && !pausedRef.current && !dragRef.current) {
        const loop = getLoopWidth(track);

        offsetRef.current += STRIP_SPEED;
        if (loop && offsetRef.current >= loop) offsetRef.current -= loop;
        track.scrollLeft = offsetRef.current;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: event.clientX,
      startOffset: offsetRef.current,
    };
    draggedRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const drag = dragRef.current;

    if (!track || !drag) return;

    const delta = event.clientX - drag.startX;

    if (Math.abs(delta) > DRAG_THRESHOLD && !draggedRef.current) {
      draggedRef.current = true;
      track.setPointerCapture(event.pointerId);
    }

    if (!draggedRef.current) return;

    const loop = getLoopWidth(track);

    if (!loop) return;

    // Wrap both ways so dragging right past the start keeps looping.
    const next = (((drag.startOffset - delta) % loop) + loop) % loop;

    offsetRef.current = next;
    track.scrollLeft = next;
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleOpen = (index: number) => {
    if (draggedRef.current) return;

    onOpen(index);
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        dragRef.current = null;
      }}
      // Native drag of the <img>s would hijack the pointer drag.
      onDragStart={(event) => event.preventDefault()}
      className="scroll-hidden -mx-5 flex cursor-grab select-none gap-4 overflow-x-hidden px-5 pb-2 active:cursor-grabbing"
    >
      {[...galleryImages, ...galleryImages].map((image, index) => (
        <Photo
          key={`${image.src}-${index}`}
          index={index % galleryImages.length}
          onOpen={handleOpen}
          className="h-[280px] w-[400px] shrink-0 rounded-3xl"
        />
      ))}
    </div>
  );
};

// 2 — full-width video with the text over it, photos in a filmstrip.
export const CinemaHero = ({ onOpen, onBook }: DesktopVariantProps) => {
  const t = useTranslations();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10">
      <div className="relative h-[600px] overflow-hidden rounded-[32px] bg-black">
        <Video />
        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <ExpandButton onClick={() => onOpen(0)} />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-10 p-10">
          <p className="max-w-2xl text-[22px] leading-[1.6] text-white">
            {t("atmosphere_description")}
          </p>
          <BookButton onBook={onBook} className="shrink-0" />
        </div>
      </div>
      <FilmStrip onOpen={onOpen} />
    </div>
  );
};

// 4 — magazine layout: big centred text, wide video, zigzag photo pairs.
export const Editorial = ({ onOpen, onBook }: DesktopVariantProps) => {
  const t = useTranslations();
  const pairs = [0, 2, 4];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-5 py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <p className="text-[28px] leading-[1.5] text-black">
          {t("atmosphere_description")}
        </p>
        <BookButton onBook={onBook} />
      </div>
      <div className="relative aspect-[21/9] overflow-hidden rounded-[32px] bg-black">
        <Video />
        <ExpandButton onClick={() => onOpen(0)} />
      </div>
      {pairs.map((first, row) => {
        const flipped = row % 2 === 1;

        return (
          <div key={first} className="grid grid-cols-12 items-start gap-6">
            <Photo
              index={first}
              onOpen={onOpen}
              className={`col-span-7 h-[520px] rounded-[28px] ${flipped ? "order-2" : ""}`}
            />
            <Photo
              index={first + 1}
              onOpen={onOpen}
              className={`col-span-5 mt-24 h-[380px] rounded-[28px] ${flipped ? "order-1" : ""}`}
            />
          </div>
        );
      })}
    </div>
  );
};

// Chapter heading: "01 — Atmosfera" on the left, optional aside on the
// right, over a hairline — the editorial "chapter" marker.
const ChapterHead = ({
  index,
  title,
  aside,
}: {
  index: number;
  title: string;
  aside?: string;
}) => (
  <div className="flex items-center justify-between border-t border-gray180 pt-5 text-sm text-gray220">
    <span>
      <span className="text-black">{pad(index)}</span> — {title}
    </span>
    {aside && <span>{aside}</span>}
  </div>
);

// Photo tile for the chapters layout: slow zoom and its number fading in.
const ChapterPhoto = ({
  index,
  onOpen,
  className,
}: {
  index: number;
  onOpen: (index: number) => void;
  className: string;
}) => {
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={() => onOpen(index + 1)}
      className={`group relative overflow-hidden rounded-[28px] bg-gray10 ${className}`}
    >
      <img
        src={galleryImages[index].src}
        alt={t("booking_gallery_image_alt")}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute bottom-5 left-5 translate-y-2 text-sm text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        {pad(index + 1)} / {pad(galleryImages.length)}
      </span>
    </button>
  );
};

// 5 — editorial chapters (after Dishoom's location pages, Awwwards SOTD):
// the page reads like a magazine spread in three numbered chapters —
// story, gallery, booking. The one description is set as a large lead
// sentence plus body; photos sit on an asymmetric 12-column grid. No
// fixed/sticky elements anywhere — everything scrolls with the page.
export const Chapters = ({ onOpen, onBook }: DesktopVariantProps) => {
  const t = useTranslations();
  const description = t("atmosphere_description");
  // First sentence becomes the lead; the rest is body copy.
  const splitAt = description.search(/[.!?]\s/);
  const lead = splitAt === -1 ? description : description.slice(0, splitAt + 1);
  const body = splitAt === -1 ? "" : description.slice(splitAt + 2);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 py-14">
      <section className="flex flex-col gap-10">
        <ChapterHead index={1} title={t("atmosphere_title")} />
        <div className="grid grid-cols-12 gap-5">
          <p className="col-span-6 text-[36px] leading-[1.25] text-black">
            {lead}
          </p>
          <div className="col-span-5 col-start-8 flex flex-col items-start gap-8 pt-2">
            {body && (
              <p className="text-lg leading-[1.7] text-black/70">{body}</p>
            )}
            <BookButton onBook={onBook} />
          </div>
        </div>
        <div className="relative aspect-[16/7] overflow-hidden rounded-[32px] bg-black">
          <Video />
          <ExpandButton onClick={() => onOpen(0)} />
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <ChapterHead
          index={2}
          title={t("atmosphere_gallery_title")}
          aside={pad(galleryImages.length)}
        />
        <div className="grid grid-cols-12 items-start gap-5">
          <ChapterPhoto
            index={0}
            onOpen={onOpen}
            className="col-span-7 row-span-2 h-[620px]"
          />
          <ChapterPhoto
            index={1}
            onOpen={onOpen}
            className="col-span-5 h-[300px]"
          />
          <ChapterPhoto
            index={2}
            onOpen={onOpen}
            className="col-span-5 h-[300px]"
          />
          <ChapterPhoto
            index={3}
            onOpen={onOpen}
            className="col-span-4 h-[380px]"
          />
          <ChapterPhoto
            index={4}
            onOpen={onOpen}
            className="col-span-4 mt-16 h-[380px]"
          />
          <ChapterPhoto
            index={5}
            onOpen={onOpen}
            className="col-span-4 h-[380px]"
          />
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <ChapterHead index={3} title={t("booking_title")} />
        <div className="flex items-end justify-between gap-10">
          {/* Closing band: the space in miniature + the one action — the
              description isn't repeated. */}
          <span className="flex -space-x-4">
            {galleryImages.slice(0, 4).map((image) => (
              <img
                key={image.src}
                src={image.src}
                alt=""
                className="h-16 w-16 rounded-full border-4 border-white object-cover"
              />
            ))}
          </span>
          <BookButton onBook={onBook} className="shrink-0" />
        </div>
      </section>
    </div>
  );
};
