const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const path = req.url.split('/api/')[1];

  try {
    switch (path) {
      case 'summarize':
        // Handle file upload and text summarization
        upload.single('pdfFile')(req, res, async (err) => {
          if (err) {
            return res.status(500).json({ error: 'File upload error' });
          }

          try {
            let text = req.body?.textInput || '';

            if (req.file) {
              const pdfData = await pdfParse(req.file.buffer);
              text = pdfData.text;
            }

            const prompt = `Summarize this text:\n\n${text}`;
            const result = await model.generateContentStream(prompt);

            let summary = '';
            for await (const chunk of result.stream) {
              summary += chunk.text();
            }

            res.json({ summary });
          } catch (error) {
            res.status(500).json({ error: 'Error summarizing text' });
          }
        });
        break;

      case 'translate':
        const { summaryText, targetLanguage } = req.body;
        const translationPrompt = `Translate this summary to ${targetLanguage}:\n\n${summaryText}`;
        const translationResult = await model.generateContentStream(translationPrompt);

        let translatedSummary = '';
        for await (const chunk of translationResult.stream) {
          translatedSummary += chunk.text();
        }

        res.json({ translatedSummary });
        break;

      case 'quizgenerate':
        const { text } = req.body;
        const quizPrompt = `
          Generate a quiz based on this text. Generate exactly this JSON structure without any markdown formatting, code blocks, or backticks:
          {
            "questions": [
              {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "The correct option text"
              }
            ]
          }
          Create 8 multiple choice questions that test understanding of key concepts.
          Text to generate quiz from: ${text}`;

        const result = await model.generateContent(quizPrompt);
        const resultText = result.response.text().trim();
        const quizData = JSON.parse(resultText);

        res.json({ quizData: quizData.questions });
        break;

      default:
        res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};