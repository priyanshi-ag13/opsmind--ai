import { useState } from "react";

function App() {
  const [pdf, setPdf] = useState(null);
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

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
     setText(`Total Embeddings Generated: ${data.totalEmbeddings}`);
    } catch (error) {
      console.log(error);

      setMessage("Upload failed");
    }
  };
const handleSearch = async () => {

  try {

    const response = await fetch("http://localhost:5000/search", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query,
      }),
    });

    const data = await response.json();

    setChatHistory((prev) => [
  ...prev,
  {
    question: query,
    answer: data.answer,
  },
]);

setQuery("");

  } catch (error) {

    console.log(error);

    setAnswer("Search failed");
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
      <hr />

<h2>Ask Question</h2>

<input
  type="text"
  placeholder="Ask something from PDF..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>

<button onClick={handleSearch}>
  Search
</button>

<div>

  {chatHistory.map((chat, index) => (

    <div key={index}>

      <h3>User:</h3>
      <p>{chat.question}</p>

      <h3>AI:</h3>
      <p>{chat.answer}</p>

      <hr />

    </div>
  ))}

</div>
    </div>
  );
}

export default App;