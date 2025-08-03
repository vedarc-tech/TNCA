import React from "react";
import { useNavigate } from "react-router-dom";

const QuizzesWidget = ({ quizzes = [], availableQuizzes = [] }) => {
  const navigate = useNavigate();
  const handleTakeQuiz = () => {
    if (availableQuizzes && availableQuizzes.length > 0) {
      navigate(`/user/quiz-taking/${availableQuizzes[0]._id || availableQuizzes[0].id}`);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Quizzes Attempted</h3>
      <p className="text-2xl font-bold mb-1">{quizzes.length}</p>
      <ul className="text-sm text-gray-600 mb-2">
        {quizzes.length === 0 && <li>No quizzes attempted yet.</li>}
        {quizzes.map((q, i) => (
          <li key={q._id || i}>
            {q.quiz_title || q.title || `Quiz ${i + 1}`}: {q.score != null ? `${q.score}%` : "N/A"}
          </li>
        ))}
      </ul>
      {availableQuizzes && availableQuizzes.length > 0 ? (
        <button
          className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleTakeQuiz}
        >
          Take a Quiz
        </button>
      ) : (
        <button className="mt-2 px-4 py-1 bg-gray-300 text-gray-500 rounded cursor-not-allowed" disabled>
          No Quizzes Available
        </button>
      )}
    </div>
  );
};

export default QuizzesWidget; 