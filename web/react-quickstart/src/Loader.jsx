export const Loader = () => (
  <div className="home center">
    <svg
      width={64}
      height={64}
      viewBox="0 0 50 50"
      fill="#2572ED"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="#2572ED"
        strokeWidth="4"
        strokeDasharray="70 30"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
);
