import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image file using Tesseract.js OCR.
 * @param file - The image file to process
 * @param maxChars - Maximum characters to return (default 12000)
 * @returns Extracted text or null if failed
 */
export const extractTextFromImage = async (
  file: File,
  maxChars: number = 12000
): Promise<string | null> => {
  try {
    // Create a URL for the file
    const imageUrl = URL.createObjectURL(file);
    
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Clean up the URL
    URL.revokeObjectURL(imageUrl);

    const text = result.data.text.trim();
    
    if (!text || text.length < 10) {
      return null;
    }

    return text.substring(0, maxChars);
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return null;
  }
};

/**
 * Extracts text from an image Blob using Tesseract.js OCR.
 */
export const extractTextFromImageBlob = async (
  blob: Blob,
  maxChars: number = 12000
): Promise<string | null> => {
  const file = new File([blob], 'image.png', { type: blob.type });
  return extractTextFromImage(file, maxChars);
};
