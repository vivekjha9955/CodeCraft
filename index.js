require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

app.post("/generate", async (req, res) => {
    const { pseudocode, language } = req.body;

    if (!pseudocode) {
        return res.status(400).json({ error: "Pseudocode input is required." });
    }

    try {
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
            { inputs: `Convert the following pseudocode to ${language}:\n${pseudocode}` },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ code: response.data[0].generated_text });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate code." });
    }
});

app.post("/solve", async (req, res) => {
    const { problemStatement } = req.body;

    if (!problemStatement) {
        return res.status(400).json({ error: "Problem statement is required." });
    }

    try {
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
            { inputs: `Solve the following problem: ${problemStatement}` },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ solution: response.data[0].generated_text });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch response." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
