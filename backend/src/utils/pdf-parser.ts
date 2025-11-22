// @ts-ignore - pdf-parse types
import pdfParse from "pdf-parse";
// @ts-ignore - mammoth types
import mammoth from "mammoth";

export interface ParsedDocument {
  text: string;
  pageCount?: number;
  fileName: string;
  fileType: string;
}

/**
 * Parse a PDF file and extract text content
 */
export async function parsePDF(buffer: ArrayBuffer, fileName: string): Promise<ParsedDocument> {
  try {
    const data = await pdfParse(Buffer.from(buffer));
    return {
      text: data.text.trim(),
      pageCount: data.numpages,
      fileName,
      fileType: "pdf",
    };
  } catch (error) {
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Parse a DOCX file and extract text content
 */
export async function parseDOCX(buffer: ArrayBuffer, fileName: string): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return {
      text: result.value.trim(),
      fileName,
      fileType: "docx",
    };
  } catch (error) {
    throw new Error(
      `Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Parse a document based on file extension
 */
export async function parseDocument(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ParsedDocument> {
  const extension = fileName.toLowerCase().split(".").pop();

  switch (extension) {
    case "pdf":
      return parsePDF(buffer, fileName);
    case "docx":
    case "doc":
      return parseDOCX(buffer, fileName);
    case "txt":
      // Plain text file
      const decoder = new TextDecoder("utf-8");
      return {
        text: decoder.decode(buffer).trim(),
        fileName,
        fileType: "txt",
      };
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}
