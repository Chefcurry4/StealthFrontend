interface PandaIconProps {
  size?: number;
  className?: string;
}

export const PandaIcon = ({ size = 24, className = "" }: PandaIconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`lucide lucide-panda-icon lucide-panda ${className}`}
    >
      {/* mouth */}
      <path d="M11.25 17.25h1.5L12 18z"/>

      {/* X eyes (left) */}
      <path d="M7.8 11.2l1.8 1.8"/>
      <path d="M9.6 11.2l-1.8 1.8"/>

      {/* X eyes (right) */}
      <path d="M14.4 11.2l1.8 1.8"/>
      <path d="M16.2 11.2l-1.8 1.8"/>

      {/* head/body outline */}
      <path d="M18 6.5a.5.5 0 0 0-.5-.5"/>
      <path d="M20.69 9.67a4.5 4.5 0 1 0-7.04-5.5 8.35 8.35 0 0 0-3.3 0 4.5 4.5 0 1 0-7.04 5.5C2.49 11.2 2 12.88 2 14.5 2 19.47 6.48 22 12 22s10-2.53 10-7.5c0-1.62-.48-3.3-1.3-4.83"/>
      <path d="M6 6.5a.495.495 0 0 1 .5-.5"/>
    </svg>
  );
};

export default PandaIcon;
