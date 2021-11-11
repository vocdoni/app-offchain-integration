import React from 'react';

export const IconChevronRight = ({height = 24, width = 24, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.304675 0.292433C0.117581 0.479735 0.0124767 0.733736 0.0124767 0.998581C0.0124767 1.26342 0.117581 1.51743 0.304675 1.70473L3.59106 4.99376L0.304675 8.28278C0.209357 8.37492 0.133328 8.48513 0.0810238 8.60699C0.0287201 8.72885 0.00118918 8.85991 3.76812e-05 8.99253C-0.00111382 9.12515 0.0241369 9.25667 0.0743168 9.37941C0.124497 9.50216 0.198601 9.61368 0.292305 9.70746C0.386009 9.80124 0.497437 9.8754 0.620086 9.92562C0.742736 9.97584 0.874151 10.0011 1.00666 9.99996C1.13918 9.99881 1.27013 9.97126 1.39189 9.91891C1.51365 9.86656 1.62377 9.79047 1.71583 9.69508L5.7078 5.6999C5.8949 5.5126 6 5.2586 6 4.99376C6 4.72891 5.8949 4.47491 5.7078 4.28761L1.71583 0.292433C1.52868 0.105189 1.27489 0 1.01026 0C0.745624 0 0.491826 0.105189 0.304675 0.292433Z"
        fill="currentColor"
      />
    </svg>
  );
};
