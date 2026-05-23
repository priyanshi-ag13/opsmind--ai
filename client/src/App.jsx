import { useState } from "react";

function App() {
  const [pdf, setPdf] = useState(null);
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");

  const handleUpload = async () => {
    if (!pdf) {
      alert("Please select a PDF");
      return;
    }

    const formData = new FormData();

    formData.append("pdf", pdf);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setMessage(data.message);
      setText(data.chunks.join("\n\n------------------\n\n"));
    } catch (error) {
      console.log(error);

      setMessage("Upload failed");
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>OpsMind AI</h1>

      <h2>PDF Upload System</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setPdf(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={handleUpload}>
        Upload PDF
      </button>

      <p>{message}</p>

<p>
  Total Chunks: {text ? text.split("------------------").length : 0}
</p>
      <textarea
      value={text}
      readOnly
      rows={15}
      cols={100}
      />
    </div>
  );
}

export default App;