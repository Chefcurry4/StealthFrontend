// Program logo imports
import arLogo from "@/assets/programs/AR.png";
import civLogo from "@/assets/programs/CIV.png";
import csLogo from "@/assets/programs/CS.png";
import chLogo from "@/assets/programs/CH.png";
import dsLogo from "@/assets/programs/DS.png";
import eeLogo from "@/assets/programs/EE.png";
import maLogo from "@/assets/programs/MA.png";
import cybLogo from "@/assets/programs/CYB.png";
import comSysLogo from "@/assets/programs/COM-SYS.png";
import comScLogo from "@/assets/programs/COM-Sc.png";
import dhLogo from "@/assets/programs/DH.png";
import energyScLogo from "@/assets/programs/Energy-Sc.png";
import envScLogo from "@/assets/programs/ENV-Sc.png";
import feLogo from "@/assets/programs/FE.png";
import lifeScLogo from "@/assets/programs/Life-Sc.png";
import matScLogo from "@/assets/programs/MAT-Sc.png";
import meLogo from "@/assets/programs/ME.png";
import microLogo from "@/assets/programs/MICRO.png";
import molecularChLogo from "@/assets/programs/Molecular-CH.png";
import mteLogo from "@/assets/programs/MTE.png";
import nanoLogo from "@/assets/programs/NANO.png";
import neuroXLogo from "@/assets/programs/Neuro-X.png";
import nuclearLogo from "@/assets/programs/NUCLEAR.png";
import phLogo from "@/assets/programs/PH.png";
import quantLogo from "@/assets/programs/QUANT.png";
import roLogo from "@/assets/programs/RO.png";
import socialScLogo from "@/assets/programs/Social-Sc.png";
import stLogo from "@/assets/programs/ST.png";
import sustLogo from "@/assets/programs/SUST.png";
import urbSysLogo from "@/assets/programs/URB-SYS.png";
import chEngLogo from "@/assets/programs/CH-ENG.png";
import chbEngLogo from "@/assets/programs/CHB-ENG.png";

// Map program slugs to their logo images
const programLogos: Record<string, string> = {
  AR: arLogo,
  CIV: civLogo,
  CS: csLogo,
  CH: chLogo,
  DS: dsLogo,
  EE: eeLogo,
  "MA++": maLogo,
  MA: maLogo,
  CYB: cybLogo,
  "COM-SYS": comSysLogo,
  "COM-Sc": comScLogo,
  DH: dhLogo,
  "Energy-Sc": energyScLogo,
  "ENV-Sc": envScLogo,
  FE: feLogo,
  "Life-Sc": lifeScLogo,
  "MAT-Sc": matScLogo,
  ME: meLogo,
  MICRO: microLogo,
  "Molecular-CH": molecularChLogo,
  MTE: mteLogo,
  NANO: nanoLogo,
  "Neuro-X": neuroXLogo,
  NUCLEAR: nuclearLogo,
  PH: phLogo,
  QUANT: quantLogo,
  RO: roLogo,
  "Social-Sc": socialScLogo,
  ST: stLogo,
  SUST: sustLogo,
  "URB-SYS": urbSysLogo,
  "CH-ENG": chEngLogo,
  "CHB-ENG": chbEngLogo,
};

export const getProgramLogo = (slug: string | undefined): string | null => {
  if (!slug) return null;
  return programLogos[slug] || null;
};
