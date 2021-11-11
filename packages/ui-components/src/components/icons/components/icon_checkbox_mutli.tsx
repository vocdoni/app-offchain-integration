import React from 'react';

export const IconCheckboxMulti = ({height = 24, width = 24, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M5 7C4.44772 7 4 7.44772 4 8C4 8.55229 4.44772 9 5 9H11C11.5523 9 12 8.55229 12 8C12 7.44772 11.5523 7 11 7H5Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M14.8284 1.17157C15.5786 1.92172 16 2.93913 16 4V12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16H4C2.93913 16 1.92172 15.5786 1.17157 14.8284C0.421427 14.0783 0 13.0609 0 12V4C0 2.93913 0.421427 1.92172 1.17157 1.17157C1.92172 0.421427 2.93913 0 4 0H12C13.0609 0 14.0783 0.421427 14.8284 1.17157ZM13.4142 2.58579C13.7893 2.96086 14 3.46957 14 4V12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14H4C3.46957 14 2.96086 13.7893 2.58579 13.4142C2.21071 13.0391 2 12.5304 2 12V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H12C12.5304 2 13.0391 2.21071 13.4142 2.58579Z"
        fill="currentColor"
      />
    </svg>
  );
};
