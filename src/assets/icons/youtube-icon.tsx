// Full-color brand mark (red circle + white play badge), unlike the
// currentColor instagram/telegram/facebook glyphs. The original design
// export wrapped it in a clipPath the full-bleed circle never needs — left
// out, so repeated instances on one page don't share a duplicate SVG id.
export const IconYoutube = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 24C5.3736 24 0 18.6264 0 12C0 5.3736 5.3736 0 12 0C18.6264 0 24 5.3736 24 12C24 18.6264 18.6264 24 12 24Z"
        fill="#FF0000"
      />
      <path
        d="M19.6361 8.13819C19.4537 7.44699 18.9137 6.90459 18.2273 6.71979C16.984 6.38379 12.0017 6.38379 12.0017 6.38379C12.0017 6.38379 7.01685 6.38379 5.77605 6.71979C5.08965 6.90459 4.54965 7.44699 4.36725 8.13819C4.03125 9.38859 4.03125 11.9998 4.03125 11.9998C4.03125 11.9998 4.03125 14.611 4.36485 15.8614C4.54725 16.5526 5.08725 17.095 5.77365 17.2798C7.01685 17.6158 11.9992 17.6158 11.9992 17.6158C11.9992 17.6158 16.9841 17.6158 18.2249 17.2798C18.9113 17.095 19.4512 16.5526 19.6336 15.8614C19.9672 14.611 19.9672 11.9998 19.9672 11.9998C19.9672 11.9998 19.9673 9.38859 19.6361 8.13819ZM10.3697 14.3686V9.63099L14.5336 11.9998L10.3697 14.3686Z"
        fill="white"
      />
    </svg>
  );
};
