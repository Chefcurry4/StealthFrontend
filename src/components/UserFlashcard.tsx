import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Building, Camera, User, Sparkles } from "lucide-react";

interface UserFlashcardProps {
  username?: string;
  profilePhotoUrl?: string | null;
  universityName?: string | null;
  universityLogo?: string | null;
  studentLevel?: 'Bachelor' | 'Master' | null;
  memberSince?: string | null;
  isEditable?: boolean;
  onAvatarClick?: () => void;
  className?: string;
  isPreview?: boolean;
}

const UserFlashcard = ({
  username,
  profilePhotoUrl,
  universityName,
  universityLogo,
  studentLevel,
  memberSince,
  isEditable = false,
  onAvatarClick,
  className = "",
  isPreview = false,
}: UserFlashcardProps) => {
  // Generate unique gradient based on username
  const gradientColors = useMemo(() => {
    const colors = [
      { from: "from-violet-500", via: "via-purple-500", to: "to-fuchsia-500" },
      { from: "from-blue-500", via: "via-cyan-500", to: "to-teal-500" },
      { from: "from-rose-500", via: "via-pink-500", to: "to-purple-500" },
      { from: "from-orange-500", via: "via-amber-500", to: "to-yellow-500" },
      { from: "from-emerald-500", via: "via-green-500", to: "to-lime-500" },
      { from: "from-indigo-500", via: "via-blue-500", to: "to-cyan-500" },
    ];
    
    if (!username) return colors[0];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [username]);

  const userInitial = username?.[0]?.toUpperCase() || "?";

  return (
    <div className={`relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.via} ${gradientColors.to} opacity-90`} />
      
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glass card content */}
      <div className="relative z-10 h-full flex flex-col p-5">
        {/* Top badge row */}
        <div className="flex justify-between items-start mb-4">
          {studentLevel ? (
            <Badge 
              variant="secondary" 
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white font-semibold px-3 py-1"
            >
              {studentLevel === 'Bachelor' ? 'Ba' : 'Ma'}
            </Badge>
          ) : (
            <div className="h-6" />
          )}
          
          {/* Decorative sparkle */}
          <Sparkles className="h-5 w-5 text-white/60 animate-pulse" />
        </div>

        {/* Avatar section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div 
            className={`relative ${isEditable ? 'cursor-pointer' : ''}`}
            onClick={isEditable ? onAvatarClick : undefined}
          >
            <div className="absolute inset-0 bg-white/30 rounded-full blur-lg scale-110" />
            <Avatar className="h-24 w-24 border-4 border-white/40 shadow-2xl relative">
              <AvatarImage src={profilePhotoUrl || undefined} />
              <AvatarFallback className="text-3xl bg-white/20 text-white font-bold backdrop-blur-sm">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            
            {isEditable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Username */}
          <h3 className="mt-4 text-xl font-bold text-white text-center truncate max-w-full px-2">
            {username || (
              <span className="text-white/50 italic flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </span>
            )}
          </h3>
        </div>

        {/* Bottom info section */}
        <div className="space-y-3 mt-auto">
          {/* Separator line */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          {/* University */}
          <div className="flex items-center gap-2 text-white/90">
            {universityLogo ? (
              <img src={universityLogo} alt="" className="h-5 w-5 rounded object-cover" />
            ) : (
              <Building className="h-4 w-4 text-white/70" />
            )}
            <span className="text-sm truncate flex-1">
              {universityName || (
                <span className="text-white/50 italic">Select university</span>
              )}
            </span>
          </div>

          {/* Student level indicator (visual) */}
          <div className="flex items-center gap-2 text-white/90">
            <GraduationCap className="h-4 w-4 text-white/70" />
            <span className="text-sm">
              {studentLevel ? `${studentLevel} Student` : (
                <span className="text-white/50 italic">Select level</span>
              )}
            </span>
          </div>

          {/* Member since (only show when not preview) */}
          {memberSince && !isPreview && (
            <p className="text-xs text-white/60 text-center mt-2">
              Member since {memberSince}
            </p>
          )}
        </div>
      </div>

      {/* Card border glow effect */}
      <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" />
      
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.1)',
        }}
      />
    </div>
  );
};

export default UserFlashcard;
