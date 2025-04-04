import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import "tailwindcss/tailwind.css";
import { motion } from "framer-motion";

const languageOptions = {
    javascript: { name: "JavaScript", extension: javascript() },
    python: { name: "Python", extension: python() },
    java: { name: "Java", extension: java() },
    cpp: { name: "C++", extension: cpp() },
};

const Home = () => {
    const [pseudocode, setPseudocode] = useState("");
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!pseudocode.trim()) {
            setError("Please enter pseudocode before generating code.");
            return;
        }

        setLoading(true);
        setError("");
        setCode("");

        try {
            const response = await axios.post("http://localhost:5000/generate", {
                pseudocode,
                language,
            });

            console.log("API Response:", response.data);

            if (response.data?.code) {
                setCode(typeof response.data.code === "string" ? response.data.code : response.data.code[0]?.generated_text || "No code generated.");
            } else {
                setError("No code generated. Please check the backend.");
            }
        } catch (error) {
            console.error("Error generating code:", error);
            setError("Failed to connect to the backend. Ensure the server is running and API is working.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6">
            <motion.h1 className="text-4xl font-bold mb-6 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                Pseudocode to Code Generator
            </motion.h1>
            <div className="flex items-center gap-3 mb-6">
                <label className="font-semibold">Select Language:</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border bg-gray-800 p-2 rounded text-white">
                    {Object.keys(languageOptions).map((key) => (
                        <option key={key} value={key}>{languageOptions[key].name}</option>
                    ))}
                </select>
            </div>
            <div className="w-full max-w-2xl">
                <h2 className="text-lg font-semibold mb-2">Enter Pseudocode:</h2>
                <CodeMirror value={pseudocode} height="200px" extensions={[languageOptions[language]?.extension]} theme={oneDark} onChange={(value) => setPseudocode(value)} className="border rounded p-2" />
            </div>
            <motion.button onClick={handleGenerate} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-gray-500 transition" disabled={loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {loading ? "Generating..." : "Generate Code"}
            </motion.button>
            {error && <p className="text-red-400 mt-3">{error}</p>}
            {code && (
                <div className="mt-6 w-full max-w-2xl">
                    <h2 className="text-lg font-semibold mb-2">Generated Code:</h2>
                    <CodeMirror value={code} height="200px" extensions={[languageOptions[language]?.extension]} theme={oneDark} readOnly className="border rounded p-2" />
                </div>
            )}
            <Link to="/developer" className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition text-center">Developer</Link>
        </div>
    );
};




const DeveloperPage = () => {
  const [problemStatement, setProblemStatement] = useState("");
  const [solution, setSolution] = useState("");

  const handleGenerate = async () => {
      if (!problemStatement.trim()) return;

      try {
          const response = await axios.post("http://localhost:5000/generate", {
              pseudocode: problemStatement,
              language: "english",
          });

          setSolution(response.data?.code || "No response received.");
      } catch (error) {
          setSolution("Error fetching response.");
      }
  };

  return (
      <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
          <h1 className="text-4xl font-bold mb-6">Hey Developer</h1>
          
          {/* Auto-resizing textarea for problem statement */}
          <textarea
              placeholder="Write your problem statement here"
              className="w-full max-w-2xl p-2 rounded bg-gray-700 text-white mb-4 resize-none"
              rows={3}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              onInput={(e) => {
                  e.target.style.height = "auto";
                  let maxHeight = 300; // Limit max expansion
                  e.target.style.height = Math.min(e.target.scrollHeight, maxHeight) + "px";
                  e.target.style.overflowY = e.target.scrollHeight > maxHeight ? "auto" : "hidden";
              }}
              style={{ overflowY: "hidden", maxHeight: "300px" }}
          />

          <button
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition mb-4"
          >
              Generate Answer
          </button>

          {/* Fixed-height answer box with scrollbar */}
          <textarea
              placeholder="Answer to your problem statement"
              className="w-full max-w-2xl p-2 rounded bg-gray-700 text-white"
              rows={6} // Initial height
              value={solution}
              readOnly
              style={{
                  height: "200px",  // Fixed height
                  overflowY: "auto", // Enable scrolling
                  resize: "none" // Prevent resizing
              }}
          />

          <Link
              to="/"
              className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition"
          >
              Back
          </Link>
      </div>
  );
};





const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/developer" element={<DeveloperPage />} />
            </Routes>
        </Router>
    );
};

export default App;