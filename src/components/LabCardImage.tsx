interface LabCardImageProps {
  labName: string;
  labId: string;
}

export const LabCardImage = ({ labName, labId }: LabCardImageProps) => {
  // Generate a unique gradient based on lab ID
  const gradients = [
    "from-blue-400 via-purple-400 to-pink-400",
    "from-cyan-400 via-teal-400 to-emerald-400",
    "from-violet-400 via-fuchsia-400 to-pink-400",
    "from-amber-400 via-orange-400 to-red-400",
    "from-indigo-400 via-purple-400 to-pink-400",
    "from-rose-400 via-pink-400 to-fuchsia-400",
    "from-sky-400 via-blue-400 to-indigo-400",
    "from-teal-400 via-cyan-400 to-blue-400",
  ];

  // Use lab ID to consistently select a gradient
  const hash = labId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = hash % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <div className={`relative h-32 w-full bg-gradient-to-br ${gradient} overflow-hidden rounded-t-lg`}>
      {/* Fluid blob effect */}
      <div className="absolute inset-0 opacity-30">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id={`grad-${labId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
          <path 
            fill={`url(#grad-${labId})`}
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.8,87.6,-7.1,87.1C-23,86.6,-37.9,82.6,-51.2,74.9C-64.5,67.2,-76.2,55.8,-82.8,41.8C-89.4,27.8,-90.9,11.2,-88.7,-4.2C-86.5,-19.6,-80.6,-33.8,-71.8,-46.2C-63,-58.6,-51.3,-69.2,-37.8,-76.6C-24.3,-84,-12.2,-88.2,1.4,-90.5C15,-92.8,30.6,-83.6,44.7,-76.4Z" 
            transform="translate(100 100)" 
          />
        </svg>
      </div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
};
