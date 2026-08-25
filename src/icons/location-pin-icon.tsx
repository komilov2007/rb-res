type LocationPinIconProps = {
  className?: string;
};

const LocationPinIcon = ({ className }: LocationPinIconProps) => {
  return (
    <svg
      width="36"
      height="60"
      viewBox="0 0 56 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M28 70C26.31 70 24.86 68.9 24.43 67.27C22.29 59.18 17.67 53.36 12.96 47.43C6.92 39.83 0.75 32.07 0.75 20.99C0.75 9.4 12.95 0 28 0C43.05 0 55.25 9.4 55.25 20.99C55.25 32.07 49.08 39.83 43.04 47.43C38.33 53.36 33.71 59.18 31.57 67.27C31.14 68.9 29.69 70 28 70Z"
        fill="currentColor"
      />
      <circle cx="28" cy="23.5" r="8.5" fill="white" />
    </svg>
  );
};

export default LocationPinIcon;
