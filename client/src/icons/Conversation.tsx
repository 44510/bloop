import IconWrapper from './Wrapper';

const RawIcon = (
  <svg viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.60434 12.1667C3.23638 12.1667 3.02305 11.9188 3.02305 11.5377V10.0188H2.67411C0.955865 10.0188 0 9.10477 0 7.51301V2.99878C0 1.4078 0.955865 0.5 2.67411 0.5H10.6584C12.3766 0.5 13.3333 1.41323 13.3333 2.99878V7.51301C13.3333 9.09857 12.3766 10.0188 10.6584 10.0188H6.48517L4.35349 11.7794C4.04341 12.0334 3.86233 12.1667 3.60434 12.1667Z"
      fill="currentColor"
    />
    <path
      d="M13.3333 3.83333H9.3416C7.62336 3.83333 6.66667 4.74656 6.66667 6.33212V10.0188L10.6584 10.0188C12.3766 10.0188 13.3333 9.09857 13.3333 7.51301V3.83333Z"
      fill="currentColor"
    />
    <path
      d="M15 3.83333V7.51301C15 8.64511 14.6496 9.7561 13.7839 10.5728C12.932 11.3764 11.8029 11.6854 10.6584 11.6854H7.08445L6.83675 11.89C7.18229 12.8283 8.04518 13.3521 9.3416 13.3521H13.5148L15.6465 15.1127C15.9566 15.3668 16.1377 15.5 16.3957 15.5C16.7636 15.5 16.9769 15.2521 16.9769 14.871V13.3521H17.3259C19.0441 13.3521 20 12.4381 20 10.8463V6.33212C20 4.74114 19.0441 3.83333 17.3259 3.83333H15Z"
      fill="currentColor"
    />
  </svg>
);

const BoxedIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_8389_231408)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.60434 14.1667C3.23638 14.1667 3.02305 13.9188 3.02305 13.5377V12.0188H2.67411C0.955865 12.0188 0 11.1048 0 9.51301V4.99878C0 3.4078 0.955865 2.5 2.67411 2.5H10.6584C12.3766 2.5 13.3333 3.41323 13.3333 4.99878V9.51301C13.3333 11.0986 12.3766 12.0188 10.6584 12.0188H6.48517L4.35349 13.7794C4.04341 14.0334 3.86233 14.1667 3.60434 14.1667Z"
        fill="currentColor"
      />
      <path
        d="M13.3333 5.83333H9.3416C7.62336 5.83333 6.66667 6.74656 6.66667 8.33212V12.0188L10.6584 12.0188C12.3766 12.0188 13.3333 11.0986 13.3333 9.51301V5.83333Z"
        fill="currentColor"
      />
      <path
        d="M15 5.83333V9.51301C15 10.6451 14.6496 11.7561 13.7839 12.5728C12.932 13.3764 11.8029 13.6854 10.6584 13.6854H7.08445L6.83675 13.89C7.18229 14.8283 8.04518 15.3521 9.3416 15.3521H13.5148L15.6465 17.1127C15.9566 17.3668 16.1377 17.5 16.3957 17.5C16.7636 17.5 16.977 17.2521 16.977 16.871V15.3521H17.3259C19.0441 15.3521 20 14.4381 20 12.8463V8.33212C20 6.74114 19.0441 5.83333 17.3259 5.83333H15Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_8389_231408">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default IconWrapper(RawIcon, BoxedIcon);