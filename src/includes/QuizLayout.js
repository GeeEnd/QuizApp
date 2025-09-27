// src/includes/QuizLayout.js
import React from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  LinearProgress,
} from "@mui/material";
import QuestionCard from "../components/QuestionCard";
import ScoreCard from "./ScoreCard";

export default function QuizLayout({
  user,
  logout,
  message,
  submitted,
  loadingScore,
  score,
  tabSwitchCount,
  questions,
  currentIndex,
  answers,
  handleSelect,
  handlePrevious,
  handleNext,
  handleSubmit,
}) {
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Quiz App</Typography>
        <Button variant="outlined" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Box>

      {message && (
        <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {submitted ? (
        loadingScore ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Calculating your score...</Typography>
            <LinearProgress sx={{ height: 8, borderRadius: 5 }} />
          </Box>
        ) : (
          <ScoreCard
            user={user}
            score={score}
            tabSwitchCount={tabSwitchCount}
            questions={questions}
            answers={answers}
          />
        )
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" sx={{ mt: 0.5, textAlign: "center" }}>
              Question {currentIndex + 1} of {questions.length}
            </Typography>
          </Box>

          <QuestionCard
            q={currentQuestion}
            selected={answers[currentQuestion.ID] || ""}
            onSelect={handleSelect}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit Quiz
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
