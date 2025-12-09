import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log(m)
    });
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const extractExpiryDate = (text: string): string | null => {
  // Common expiry date patterns
  const patterns = [
    /(?:exp|expiry|expires|best before|use by|best by)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(?:exp|expiry|expires|best before|use by|best by)[:\s]*(\d{1,2}\s+\w+\s+\d{2,4})/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{2,4})/gi
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let dateStr = match[1] || match[0];
      // Normalize date format
      dateStr = dateStr.replace(/[\.]/g, '/');
      
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Date parsing error:', error);
      }
    }
  }
  
  return null;
};