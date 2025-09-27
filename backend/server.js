// backend/server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = process.env.SHEETDB_BASE_URL;

// ---------------------
// LOGIN
// ---------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await fetch(
      `${BASE_URL}/search?sheet=Users&Email=${encodeURIComponent(email)}&Password=${encodeURIComponent(password)}`
    );
    const data = await response.json();

    if (!data.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = {
      Name: data[0].Name,
      Email: data[0].Email,
      Section: data[0].Section,
    };

    res.json(user); // ✅ only once
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// REGISTER
// ---------------------
app.post("/api/register", async (req, res) => {
  const { name, section, email, password } = req.body;

  try {
    const response = await fetch(`${BASE_URL}?sheet=Users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            Timestamp: new Date().toISOString(),
            Name: name,
            Section: section,
            Email: email,
            Password: password,
          },
        ],
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// GET QUESTIONS
// ---------------------
// ---------------------
// GET QUESTIONS (shuffled)
// ---------------------
app.get("/api/questions", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}?sheet=Questions`);
    let data = await response.json();

    // Shuffle the questions
    data = data
      .map((q) => ({ value: q, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ---------------------
// SAVE RESPONSES
// backend/server.js
app.post("/api/responses", async (req, res) => {
  try {
    // req.body should have { data: [responseData] }
    const { data } = req.body;

    if (!data) return res.status(400).json({ error: "No data provided" });

    const response = await fetch(`${BASE_URL}?sheet=Responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }), // send as { data: [...] } to SheetDB
    });

    const saved = await response.json();
    res.json(saved);
  } catch (err) {
    console.error("❌ Failed to save response:", err);
    res.status(500).json({ error: err.message });
  }
});


// GET all responses with correct answers included
app.get("/api/responses", async (req, res) => {
  try {
    // Fetch student responses
    const respResponses = await fetch(`${BASE_URL}?sheet=Responses`);
    const responsesData = await respResponses.json();

    // Fetch questions to get correct answers
    const respQuestions = await fetch(`${BASE_URL}?sheet=Questions`);
    const questionsData = await respQuestions.json();

    // Map question IDs to correct answers
    const correctAnswersMap = {};
    questionsData.forEach((q) => {
      correctAnswersMap[q.ID] = q.Answer;
    });

    // Attach correct answers to each response
    const enhancedResponses = responsesData.map((r) => ({
      ...r,
      CorrectAnswers: correctAnswersMap, // all questions' correct answers
    }));

    res.json(enhancedResponses);
  } catch (err) {
    console.error("❌ Failed to fetch responses:", err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
