// Program logo imports
import arLogo from "@/assets/programs/AR.png";
import civLogo from "@/assets/programs/CIV.png";
import csLogo from "@/assets/programs/CS.png";
import chLogo from "@/assets/programs/CH.png";
import dsLogo from "@/assets/programs/DS.png";
import eeLogo from "@/assets/programs/EE.png";
import maLogo from "@/assets/programs/MA.png";
import cybLogo from "@/assets/programs/CYB.png";

// Map program slugs to their logo images
const programLogos: Record<string, string> = {
  AR: arLogo,
  CIV: civLogo,
  CS: csLogo,
  CH: chLogo,
  DS: dsLogo,
  EE: eeLogo,
  "MA++": maLogo,
  CYB: cybLogo,
};

export const getProgramLogo = (slug: string | undefined): string | null => {
  if (!slug) return null;
  return programLogos[slug] || null;
};
