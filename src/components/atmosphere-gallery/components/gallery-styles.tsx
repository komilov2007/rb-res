const GalleryStyles = () => {
  return (
    <style jsx global>{`
      .atmosphere-marquee {
        animation: atmosphere-scroll 36s linear infinite;
      }

      .group:hover .atmosphere-marquee {
        animation-play-state: paused;
      }

      @keyframes atmosphere-scroll {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-33.333%);
        }
      }

      .gallery-thumbs {
        scrollbar-width: thin;
        scrollbar-color: var(--primary) rgba(255, 255, 255, 0.12);
      }

      .gallery-thumbs::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      .gallery-thumbs::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: var(--primary);
      }

      .gallery-thumbs::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.12);
      }
    `}</style>
  );
};

export default GalleryStyles;
