// File: chroma-code-query/api/upload-rfp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
// Removed unused 'path' import
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import axios from 'axios';

const { pipeline } = await import('@xenova/transformers');
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Removed duplicate 'config' declaration

const extractTextFromFile = async (filePath: string, mimetype: string): Promise<string> => {
  const buffer = await fs.readFile(filePath);
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (filePath.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = files.file[0];
    const filePath = file.filepath;
    const text = await extractTextFromFile(filePath, file.mimetype || '');

    const embedding = await embedder(text, { pooling: 'mean', normalize: true });

    const payload = {
      ids: [Date.now().toString()],
      documents: [text],
      metadatas: [{
        title: fields.title[0],
        agency: fields.agency[0],
        dueDate: fields.dueDate?.[0],
        rfpNumber: fields.rfpNumber?.[0],
      }],
      embeddings: [Array.from(embedding.data)],
    };

    await axios.post('http://localhost:8000/api/v1/collections/rfp_documents/add', payload);

    res.status(200).json({ success: true, message: 'Document processed and added to ChromaDB' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message || 'Error processing document' });
    } else {
      console.error('Unexpected error', err);
      res.status(500).json({ success: false, message: 'Error processing document' });
    }
  }
};

export default handler;
export const config = {
  api: {
    bodyParser: false,
  },
};