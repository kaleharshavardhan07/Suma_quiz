const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3000;

// Load API key from environment variable
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('API key is missing. Please set GEMINI_API_KEY in your .env file.');
  process.exit(1);
}

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let text='';
// Route to handle PDF upload and text input
app.post('/summarize', upload.single('pdfFile'), async (req, res) => {
  try {
    text = req.body.textInput;

    // Parse PDF text if a PDF file was uploaded
    if (req.file) {
      const pdfData = await pdfParse(req.file.path);
      text = pdfData.text;
      fs.unlink(req.file.path, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
      });
    }

    // Summarize the text using Google Generative AI (Gemini)
    const prompt = `Summarize this text:\n\n${text}`;
    const result = await model.generateContentStream(prompt);

    let summary = '';
    for await (const chunk of result.stream) {
      summary += chunk.text(); // Collect the summary chunks
    }

    res.json({ summary });
  } catch (error) {
    console.error('Error summarizing text:', error.message);
    res.status(500).send('Error summarizing text');
  }
});

// Route to translate text
app.post('/translate', async (req, res) => {
  try {
    const texti = req.body.summaryText; // Assuming this comes from the summarize route
    const targetLanguage = req.body.targetLanguage || 'English';
    const translationPrompt = `Translate this summary to ${targetLanguage}:\n\n${texti}`;
    const translationResult = await model.generateContentStream(translationPrompt);

    let translatedSummary = '';
    for await (const chunk of translationResult.stream) {
      translatedSummary += chunk.text();
    }

    res.json({ translatedSummary });
  } catch (error) {
    console.error('Error translating text:', error.message);
    res.status(500).send('Error translating text');
  }
});
// Backend (Node.js) code
app.post('/quizgenerate', async (req, res) => {
  try {
    // Structured prompt for consistent output
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
    let resultText = result.response.text();
    
    // Clean up the response text
    // Remove markdown code blocks if present
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    // Remove any leading/trailing whitespace
    resultText = resultText.trim();
    
    // Parse and validate JSON response
    let quizData;
    try {
      quizData = JSON.parse(resultText);
      
      // Validate structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz format');
      }
      
      // Validate each question
      quizData.questions = quizData.questions.map(q => {
        if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) {
          throw new Error('Invalid question format');
        }
        
        // Ensure correctAnswer is one of the options
        if (!q.options.includes(q.correctAnswer)) {
          console.warn('Correct answer not in options for question:', q.question);
          // Use the first option as fallback
          q.correctAnswer = q.options[0];
        }
        
        return {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        };
      });

      // Add logging to help debug the response
      console.log('Processed quiz data:', JSON.stringify(quizData, null, 2));
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', resultText);
      throw new Error('Failed to generate valid quiz format');
    }

    res.json({ quizData: quizData.questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
