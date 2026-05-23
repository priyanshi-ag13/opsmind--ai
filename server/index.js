const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();

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

    // SEND RESPONSE
    res.status(200).json({
      message: "PDF uploaded and text extracted successfully",
      extractedText: pdfData.text,
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