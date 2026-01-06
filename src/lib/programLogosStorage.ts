// Utility to get program logos from Supabase storage bucket "program_logos"
// Logo files should be named as: {program_slug}.png (e.g., CS.png, ME.png)

const SUPABASE_URL = "https://zbgcvuocupxfugtfjids.supabase.co";
const BUCKET_NAME = "Program_logos";

export const getProgramLogoUrl = (slug: string | undefined | null): string | null => {
  if (!slug) return null;
  
  // Return the public URL for the program logo
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${slug}.png`;
};
