Here’s a README file template for your Node.js application that summarizes, translates, and generates quizzes based on uploaded PDFs or text inputs.


# Summa_Quiz

Summa_Quiz is a web application built using Node.js, Express, and Google Generative AI that allows users to upload PDF files or input text for summarization, translation, and quiz generation. This project leverages advanced AI capabilities to provide concise summaries and create quizzes based on the content provided by the user.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- Upload PDF files or enter text directly for summarization.
- Translate the generated summaries into various languages.
- Generate quizzes with multiple-choice questions based on the provided text.
- User-friendly interface with clear navigation and results display.

## Technologies Used

- Node.js
- Express.js
- Multer (for file uploads)
- pdf-parse (for parsing PDF files)
- Google Generative AI (Gemini)
- HTML, CSS, JavaScript (for frontend)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kaleharshavardhan07/summa_quiz.git
   cd summa_quiz
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google Generative AI API key:

   ```plaintext
   GEMINI_API_KEY=your_api_key_here
   ```

4. Create an `uploads` directory to store uploaded PDF files:

   ```bash
   mkdir uploads
   ```

## Usage

1. Start the server:

   ```bash
   node index.js
   ```

2. Open your web browser and navigate to `http://localhost:3000`.

3. Use the application to upload PDFs or enter text. Click the respective buttons to summarize, translate, or generate quizzes.

## API Endpoints

### Summarize

- **Endpoint:** `POST /summarize`
- **Description:** Upload a PDF or provide text to generate a summary.
- **Request Body:** 
  - Form-data with `pdfFile` (optional) and `textInput` (optional).

### Translate

- **Endpoint:** `POST /translate`
- **Description:** Translate the generated summary into the specified language.
- **Request Body:**
  - JSON with `summaryText` (the text to translate) and `targetLanguage` (the target language code).

### Quiz Generation

- **Endpoint:** `POST /quizgenerate`
- **Description:** Generate a quiz based on the text provided.
- **Request Body:**
  - JSON with `summaryText` (the text to generate the quiz from).

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and create a pull request.

```


