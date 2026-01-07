import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Building, Camera, User, Sparkles, Crown, Star, Fingerprint } from "lucide-react";

export type FlashcardColorStyle = 'gradient' | 'ocean' | 'sunset' | 'forest' | 'epic-dark' | 'epic-pink' | 'epic-white' | 'epic-sunset';

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
  colorStyle?: FlashcardColorStyle;
  isPulsating?: boolean;
  size?: 'default' | 'large';
  isEpic?: boolean;
  reviewCount?: number;
}

const COLOR_STYLES: Record<FlashcardColorStyle, { from: string; via: string; to: string }[]> = {
  gradient: [
    { from: "from-violet-500", via: "via-purple-500", to: "to-fuchsia-500" },
    { from: "from-blue-500", via: "via-cyan-500", to: "to-teal-500" },
    { from: "from-rose-500", via: "via-pink-500", to: "to-purple-500" },
    { from: "from-orange-500", via: "via-amber-500", to: "to-yellow-500" },
    { from: "from-emerald-500", via: "via-green-500", to: "to-lime-500" },
    { from: "from-indigo-500", via: "via-blue-500", to: "to-cyan-500" },
  ],
  ocean: [
    { from: "from-blue-600", via: "via-cyan-500", to: "to-teal-400" },
    { from: "from-sky-500", via: "via-blue-500", to: "to-indigo-500" },
    { from: "from-teal-500", via: "via-cyan-400", to: "to-blue-500" },
  ],
  sunset: [
    { from: "from-orange-500", via: "via-rose-500", to: "to-pink-500" },
    { from: "from-amber-500", via: "via-orange-500", to: "to-red-500" },
    { from: "from-rose-500", via: "via-pink-500", to: "to-orange-400" },
  ],
  forest: [
    { from: "from-emerald-600", via: "via-green-500", to: "to-teal-500" },
    { from: "from-green-500", via: "via-emerald-500", to: "to-cyan-500" },
    { from: "from-teal-600", via: "via-emerald-500", to: "to-green-400" },
  ],
  'epic-dark': [
    { from: "from-gray-950", via: "via-black", to: "to-gray-900" },
    { from: "from-black", via: "via-gray-950", to: "to-neutral-900" },
    { from: "from-neutral-950", via: "via-black", to: "to-gray-950" },
  ],
  'epic-pink': [
    { from: "from-pink-400", via: "via-pink-500", to: "to-rose-500" },
    { from: "from-rose-400", via: "via-pink-500", to: "to-fuchsia-500" },
    { from: "from-fuchsia-400", via: "via-pink-500", to: "to-rose-400" },
  ],
  'epic-white': [
    { from: "from-white", via: "via-blue-20", to: "to-cyan-50" },
    { from: "from-blue-50", via: "via-cyan-30", to: "to-white-50" },
    { from: "from-white", via: "via-cyan-50", to: "to-blue-100" },
  ],
  'epic-sunset': [
    { from: "from-orange-400", via: "via-rose-400", to: "to-purple-500" },
    { from: "from-amber-400", via: "via-orange-500", to: "to-rose-500" },
    { from: "from-yellow-400", via: "via-orange-500", to: "to-pink-500" },
  ],
};

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
  colorStyle = 'gradient',
  isPulsating = false,
  size = 'default',
  isEpic = false,
  reviewCount = 0,
}: UserFlashcardProps) => {
  // Determine if using epic color styles
  const isEpicStyle = colorStyle === 'epic-dark' || colorStyle === 'epic-pink' || colorStyle === 'epic-white' || colorStyle === 'epic-sunset';
  const isEpicDark = colorStyle === 'epic-dark';
  const isEpicPink = colorStyle === 'epic-pink';
  const isEpicWhite = colorStyle === 'epic-white';
  const isEpicSunset = colorStyle === 'epic-sunset';
  
  // Determine if particles should be hidden (pink, white, sunset don't have particles)
  const hideParticles = isEpicPink || isEpicWhite || isEpicSunset;
  
  // Generate unique gradient based on username within the selected color style
  const gradientColors = useMemo(() => {
    const colors = COLOR_STYLES[colorStyle] || COLOR_STYLES.gradient;
    
    if (!username) return colors[0];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [username, colorStyle]);

  const userInitial = username?.[0]?.toUpperCase() || "?";
  
  const sizeClasses = size === 'large' 
    ? 'max-w-[320px]' 
    : 'max-w-[280px]';
    
  const avatarSize = size === 'large' ? 'h-28 w-28' : 'h-24 w-24';

  // Get ring color for epic cards
  const getEpicRingClass = () => {
    if (isEpicDark) return 'ring-2 ring-black ring-offset-2 ring-offset-background';
    if (isEpicPink) return 'ring-2 ring-pink-400 ring-offset-2 ring-offset-background';
    if (isEpicWhite) return 'ring-2 ring-cyan-200 ring-offset-2 ring-offset-background';
    if (isEpicSunset) return 'ring-2 ring-white ring-offset-2 ring-offset-background';
    return 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background';
  };

  return (
    <div 
      className={`relative w-full ${sizeClasses} aspect-[3/4] rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${className} ${
        isEpic ? getEpicRingClass() : ''
      }`}
      style={{
        animation: isPulsating ? 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined,
      }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.via} ${gradientColors.to} opacity-90`} />
      
      {/* Epic style animated particles and glow effects (not for pink, white, sunset) */}
      {isEpicStyle && !hideParticles && (
        <>
          {/* Animated floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/60"
                style={{
                  width: `${3 + (i % 4) * 2}px`,
                  height: `${3 + (i % 4) * 2}px`,
                  left: `${8 + (i * 6) % 84}%`,
                  top: `${3 + (i * 11) % 94}%`,
                  animation: `float ${2.5 + (i % 4)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.25}s`,
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                }}
              />
            ))}
          </div>
          
          {/* Pulsing glow effect */}
          <div 
            className="absolute inset-0 bg-white/8"
            style={{
              animation: 'epicGlow 2s ease-in-out infinite',
            }}
          />
          
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 55%, transparent 60%)',
            }}
          />
        </>
      )}
      
      {/* Sunset sun icon */}
      {isEpicSunset && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {/* Outer glow layers */}
          <div 
            className="absolute -inset-3 rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(251, 146, 60, 0.4) 40%, transparent 70%)',
              animation: 'epicGlow 3s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute -inset-1 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(253, 224, 71, 0.6) 0%, rgba(251, 191, 36, 0.3) 50%, transparent 80%)',
            }}
          />
          {/* Main sun body with realistic gradient */}
          <div 
            className="relative w-20 h-20 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #FEF3C7 0%, #FDE68A 15%, #FBBF24 35%, #F59E0B 60%, #D97706 85%, #B45309 100%)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.7), 0 0 40px rgba(251, 146, 60, 0.5), inset -3px -3px 8px rgba(217, 119, 6, 0.4), inset 2px 2px 6px rgba(254, 243, 199, 0.6)',
              animation: 'sunPulse 4s ease-in-out infinite',
            }}
          />
        </div>
      )}
      
      {/* Regular animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-10 -right-10 w-32 h-32 ${isEpicWhite ? 'bg-cyan-200/20' : isEpicStyle ? 'bg-white/15' : 'bg-white/20'} rounded-full blur-2xl animate-pulse`} style={{ animationDuration: '4s' }} />
        <div className={`absolute -bottom-10 -left-10 w-40 h-40 ${isEpicWhite ? 'bg-blue-200/15' : isEpicStyle ? 'bg-white/12' : 'bg-white/15'} rounded-full blur-2xl animate-pulse`} style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${isEpicWhite ? 'bg-sky-200/10' : isEpicStyle ? 'bg-white/8' : 'bg-white/10'} rounded-full blur-xl animate-pulse`} style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* CSS Keyframes for epic animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes epicGlow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.25; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.1); }
        }
      `}</style>

      {/* Glass card content */}
      <div className="relative z-10 h-full flex flex-col p-5">
        {/* Top badge row */}
        <div className="flex justify-between items-start mb-4">
          {isEpic ? (
            <Badge 
              className={`font-bold px-3 py-1 gap-1 ${
                isEpicDark 
                  ? 'bg-black border-black text-white' 
                  : isEpicPink 
                    ? 'bg-pink-400 border-pink-400 text-white'
                    : isEpicWhite 
                      ? 'bg-blue-100 border-blue-200 text-amber-100'
                      : isEpicSunset 
                        ? 'bg-white border-white text-orange-600'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500 border-amber-300 text-white'
              }`}
            >
              <Crown className="h-3 w-3" />
              EPIC
            </Badge>
          ) : studentLevel ? (
            <Badge 
              variant="secondary" 
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white font-semibold px-3 py-1"
            >
              {studentLevel === 'Bachelor' ? "Bachelor's" : "Master's"}
            </Badge>
          ) : (
            <div className="h-6" />
          )}
          
          {/* Decorative sparkle */}
          <Fingerprint className={`h-5 w-5 ${isEpicWhite ? 'text-amber-100/60' : 'text-white/60'} animate-pulse`} style={{ animationDuration: '5s' }} />
        </div>

        {/* Avatar section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div 
            className={`relative ${isEditable ? 'cursor-pointer' : ''} transition-transform duration-300 group-hover:scale-105`}
            onClick={isEditable ? onAvatarClick : undefined}
          >
            <div className={`absolute inset-0 rounded-full blur-lg scale-110 ${
              isEpicDark 
                ? 'bg-black/40' 
                : isEpicPink 
                  ? 'bg-pink-400/40'
                  : isEpicWhite 
                    ? 'bg-cyan-300/40'
                    : isEpicSunset 
                      ? 'bg-white/40'
                      : isEpic || isEpicStyle 
                        ? 'bg-amber-400/40' 
                        : 'bg-white/30'
            }`} />
            <Avatar className={`${avatarSize} border-4 ${
              isEpicDark 
                ? 'border-black/60' 
                : isEpicPink 
                  ? 'border-pink-400/60'
                  : isEpicWhite 
                    ? 'border-cyan-200/60'
                    : isEpicSunset 
                      ? 'border-white/60'
                      : isEpic || isEpicStyle 
                        ? 'border-amber-400/60' 
                        : 'border-white/40'
            } shadow-2xl relative`}>
              <AvatarImage src={profilePhotoUrl || undefined} />
              <AvatarFallback className="bg-gray-300 text-gray-500">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-16 h-16"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </AvatarFallback>
            </Avatar>
            
            {isEditable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Username */}
          <h3 className={`mt-4 text-xl font-bold ${isEpicWhite ? 'text-amber-100' : 'text-sky'} text-center truncate max-w-full px-2`}>
            {username || (
              <span className={`${isEpicWhite ? 'text-amber-100/50' : 'text-sky/50'} italic flex items-center gap-2`}>
                <User className="h-4 w-4" />
                Username
              </span>
            )}
          </h3>
          
          {/* Review count for EPIC users */}
          {isEpic && reviewCount > 0 && (
            <div className={`flex items-center gap-1 mt-2 ${isEpicWhite ? 'text-amber-100/90' : 'text-sky/90'}`}>
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              <span className="text-sm font-medium">{reviewCount} reviews</span>
            </div>
          )}
        </div>

        {/* Bottom info section */}
        <div className="space-y-3 mt-auto">
          {/* Separator line */}
          <div className={`h-px bg-gradient-to-r from-transparent ${
            isEpicDark 
              ? 'via-black/60' 
              : isEpicPink 
                ? 'via-pink-400/60'
                : isEpicWhite 
                  ? 'via-cyan-300/60'
                  : isEpicSunset 
                    ? 'via-white/60'
                    : isEpic || isEpicStyle 
                      ? 'via-amber-400/60' 
                      : 'via-white/40'
          } to-transparent`} />
          
          {/* University */}
          <div className={`flex items-center gap-2 ${isEpicWhite ? 'text-amber-100/90' : 'text-sky/90'}`}>
            {universityLogo ? (
              <img src={universityLogo} alt="" className="h-5 w-5 rounded object-cover" />
            ) : (
              <Building className={`h-4 w-4 ${isEpicWhite ? 'text-amber-100/70' : 'text-sky/70'}`} />
            )}
            <span className="text-sm truncate flex-1">
              {universityName || (
                <span className={`${isEpicWhite ? 'text-amber-100/50' : 'text-sky/50'} italic`}>Select university</span>
              )}
            </span>
          </div>

          {/* Student level indicator (visual) */}
          <div className={`flex items-center gap-2 ${isEpicWhite ? 'text-amber-100/90' : 'text-white/90'}`}>
            <GraduationCap className={`h-4 w-4 ${isEpicWhite ? 'text-amber-100/70' : 'text-white/70'}`} />
            <span className="text-sm">
              {studentLevel ? `${studentLevel} Student` : (
                <span className={`${isEpicWhite ? 'text-amber-100/50' : 'text-white/50'} italic`}>Select level</span>
              )}
            </span>
          </div>

          {/* Member since (only show when not preview) */}
          {memberSince && !isPreview && (
            <p className={`text-xs ${isEpicWhite ? 'text-amber-100/60' : 'text-white/60'} text-center mt-2`}>
              Member since {memberSince}
            </p>
          )}
        </div>
      </div>

      {/* Card border glow effect */}
      <div className={`absolute inset-0 rounded-2xl border ${
        isEpicDark 
          ? 'border-black/40' 
          : isEpicPink 
            ? 'border-pink-400/40'
            : isEpicWhite 
              ? 'border-cyan-200/40'
              : isEpicSunset 
                ? 'border-white/40'
                : isEpic || isEpicStyle 
                  ? 'border-amber-400/40' 
                  : 'border-white/20'
      } pointer-events-none`} />
      
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: isEpicDark
            ? 'inset 0 0 30px rgba(0,0,0,0.3), 0 0 60px rgba(0,0,0,0.3)'
            : isEpicPink
              ? 'inset 0 0 30px rgba(244,114,182,0.3), 0 0 60px rgba(244,114,182,0.3)'
              : isEpicWhite
                ? 'inset 0 0 30px rgba(165,243,252,0.2), 0 0 60px rgba(165,243,252,0.2)'
                : isEpicSunset
                  ? 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.3)'
                  : isEpic || isEpicStyle
                    ? 'inset 0 0 30px rgba(251,191,36,0.2), 0 0 60px rgba(251,191,36,0.2)'
                    : 'inset 0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.15)',
        }}
      />
    </div>
  );
};

export default UserFlashcard;
