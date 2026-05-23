export async function extractTextBlocks(_pdfPath: string) {
  return [
    {
      page: 1,
      kind: "passage",
      text: "mock passage block for later OCR/pdf text extraction"
    }
  ];
}
