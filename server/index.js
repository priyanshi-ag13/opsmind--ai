require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());


// STORAGE CONFIGURATION
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


// MULTER INSTANCE
const upload = multer({ storage });

let storedChunks = [];
let storedEmbeddings = [];

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("OpsMind AI Backend Running");
});


// PDF UPLOAD ROUTE
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {

    // FILE PATH
    const filePath = req.file.path;

    // READ PDF FILE
    const dataBuffer = fs.readFileSync(filePath);

    // EXTRACT TEXT
    const pdfData = await pdf(dataBuffer);
    // FULL TEXT
const fullText = pdfData.text;


// CHUNK SIZE
const chunkSize = 500;


// ARRAY TO STORE CHUNKS
const chunks = [];


// LOOP TO CREATE CHUNKS
for (let i = 0; i < fullText.length; i += chunkSize) {

  const chunk = fullText.slice(i, i + chunkSize);

  chunks.push(chunk);
}
const embeddings = chunks.map(chunk => {

  return chunk
    .split("")
    .map(char => char.charCodeAt(0));
});
storedChunks = chunks;
storedEmbeddings = embeddings;

    // SEND RESPONSE
   res.status(200).json({
  message: "Embeddings generated successfully",
  totalChunks: chunks.length,
  totalEmbeddings: embeddings.length,
});
app.post("/search", async (req, res) => {

  try {

    const { query } = req.body;

    const queryEmbedding = query
  .split("")
  .map(char => char.charCodeAt(0));


    let bestScore = -1;

    let bestChunk = "";


    // COMPARE ALL CHUNKS
    for (let i = 0; i < storedEmbeddings.length; i++) {

      const chunkEmbedding = storedEmbeddings[i];

      let score = 0;


      for (let j = 0; j < queryEmbedding.length; j++) {

        score += queryEmbedding[j] * chunkEmbedding[j];
      }


      if (score > bestScore) {

        bestScore = score;

        bestChunk = storedChunks[i];
      }
    }


    const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const prompt = `
Answer the user's question using the context below.

Context:
${bestChunk}

Question:
${query}
`;

const resultText = await model.generateContent(prompt);

const finalAnswer = resultText.response.text();

res.status(200).json({
  message: "AI answer generated",
  answer: finalAnswer,
});
  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Search failed",
    });
  }
});

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "PDF processing failed",
    });
  }
});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});