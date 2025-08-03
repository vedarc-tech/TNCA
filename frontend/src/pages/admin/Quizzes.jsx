import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  FileImage, 
  Save, 
  X,
  Upload,
  Image as ImageIcon,
  Type,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

// Separate memoized QuestionEditor component
const QuestionEditor = memo(({ 
  question, 
  index, 
  onUpdate, 
  onRemove, 
  onImageUpload, 
  allowImageQuestions, 
  allowImageAnswers 
}) => {
  const handleOptionChange = useCallback((optionIndex, value) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate(index, 'options', newOptions);
  }, [question.options, onUpdate, index]);

  const handleOptionImageUpload = useCallback((file, optionIndex) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      const newOptionImages = [...(question.option_images || [])];
      newOptionImages[optionIndex] = base64;
      onUpdate(index, 'option_images', newOptionImages);
    };
    reader.readAsDataURL(file);
  }, [question.option_images, onUpdate, index]);

  const addOption = useCallback(() => {
    if (question.options.length < 6) {
      const newOptions = [...question.options, ''];
      const newOptionImages = [...(question.option_images || []), null];
      onUpdate(index, 'options', newOptions);
      onUpdate(index, 'option_images', newOptionImages);
    }
  }, [question.options, question.option_images, onUpdate, index]);

  const removeOption = useCallback((optionIndex) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      const newOptionImages = (question.option_images || []).filter((_, i) => i !== optionIndex);
      
      // Adjust correct answer if needed
      let newCorrectAnswer = question.correct_answer;
      if (optionIndex === question.correct_answer) {
        newCorrectAnswer = 0; // Reset to first option
      } else if (optionIndex < question.correct_answer) {
        newCorrectAnswer = question.correct_answer - 1; // Adjust index
      }
      
      onUpdate(index, 'options', newOptions);
      onUpdate(index, 'option_images', newOptionImages);
      onUpdate(index, 'correct_answer', newCorrectAnswer);
    }
  }, [question.options, question.option_images, question.correct_answer, onUpdate, index]);

  const handleImageUpload = useCallback((file, type) => {
    onImageUpload(file, index, type);
  }, [onImageUpload, index]);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </label>
          <textarea
            value={question.question_text}
            onChange={(e) => onUpdate(index, 'question_text', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Enter your question..."
          />
        </div>

        {/* Question Image */}
        {allowImageQuestions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Image (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/png"
                onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'question')}
                className="hidden"
                id={`question-image-${question.id || index}`}
              />
              <label
                htmlFor={`question-image-${question.id || index}`}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </label>
              {question.question_image && (
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Image uploaded</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Options ({question.options.length}/6)
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={addOption}
                disabled={question.options.length >= 6}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
                <span>Add Option</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Minimum 2 options, maximum 6. Each option can have text and/or an image. Images are responsive and will scale appropriately on all devices.
          </p>
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name={`correct-${question.id || index}`}
                    checked={question.correct_answer === optionIndex}
                    onChange={() => onUpdate(index, 'correct_answer', optionIndex)}
                    className="text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(optionIndex)}
                        disabled={question.options.length <= 2}
                        className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove Option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Option Image Upload */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleOptionImageUpload(e.target.files[0], optionIndex)}
                        className="hidden"
                        id={`option-image-${question.id || index}-${optionIndex}`}
                      />
                      <label
                        htmlFor={`option-image-${question.id || index}-${optionIndex}`}
                        className="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs cursor-pointer hover:bg-purple-100"
                        title="Upload option image (recommended: 300x200px, max 2MB)"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Image</span>
                      </label>
                      {(question.option_images && question.option_images[optionIndex]) && (
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">Image uploaded</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Option Image Preview */}
                    {(question.option_images && question.option_images[optionIndex]) && (
                      <div className="mt-2">
                        <img 
                          src={question.option_images[optionIndex]} 
                          alt={`Option ${optionIndex + 1}`}
                          className="max-w-full h-auto max-h-32 rounded border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Image */}
        {allowImageAnswers && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer Image (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/png"
                onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'answer')}
                className="hidden"
                id={`answer-image-${question.id || index}`}
              />
              <label
                htmlFor={`answer-image-${question.id || index}`}
                className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg cursor-pointer hover:bg-green-100"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Answer Image</span>
              </label>
              {question.correct_answer_image && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Answer image uploaded</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marks
          </label>
          <input
            type="number"
            value={question.marks}
            onChange={(e) => onUpdate(index, 'marks', parseInt(e.target.value))}
            className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={question.explanation}
            onChange={(e) => onUpdate(index, 'explanation', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            placeholder="Explain the correct answer..."
          />
        </div>
      </div>
    </div>
  );
});

// Separate memoized QuizModal component
const QuizModal = memo(({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  isEdit = false,
  formData,
  setFormData,
  categories,
  difficulties,
  addQuestion,
  QuestionEditor,
  questions
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quiz title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={formData.time_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                value={formData.total_marks}
                onChange={(e) => setFormData(prev => ({ ...prev, total_marks: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter quiz description"
            />
          </div>

          {/* Image Settings */}
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.allow_image_questions}
                onChange={(e) => setFormData(prev => ({ ...prev, allow_image_questions: e.target.checked }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Allow image questions</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.allow_image_answers}
                onChange={(e) => setFormData(prev => ({ ...prev, allow_image_answers: e.target.checked }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Allow image answers</span>
            </label>
          </div>

          {/* Questions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <button
                onClick={addQuestion}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={question.id || index}
                  question={question}
                  index={index}
                  onUpdate={(index, field, value) => {
                    setFormData(prev => {
                      const updatedQuestions = [...prev.questions];
                      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
                      return { ...prev, questions: updatedQuestions };
                    });
                  }}
                  onRemove={(index) => setFormData(prev => ({
                    ...prev,
                    questions: prev.questions.filter((_, i) => i !== index)
                  }))}
                  onImageUpload={(file, index, type) => {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      const base64 = e.target.result;
                      if (type === 'question') {
                        setFormData(prev => {
                          const updatedQuestions = [...prev.questions];
                          updatedQuestions[index] = { ...updatedQuestions[index], question_image: base64 };
                          return { ...prev, questions: updatedQuestions };
                        });
                      } else if (type === 'answer') {
                        setFormData(prev => {
                          const updatedQuestions = [...prev.questions];
                          updatedQuestions[index] = { ...updatedQuestions[index], correct_answer_image: base64 };
                          return { ...prev, questions: updatedQuestions };
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  allowImageQuestions={formData.allow_image_questions}
                  allowImageAnswers={formData.allow_image_answers}
                />
              ))}
            </div>

            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!formData.title || questions.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
});

const Quizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    difficulty: "Medium",
    time_limit: 30,
    total_marks: 100,
    questions: [],
    allow_image_questions: true,
    allow_image_answers: true
  });

  const categories = useMemo(() => ["General", "Mathematics", "Science", "Language", "Logic"], []);
  const difficulties = useMemo(() => ["Easy", "Medium", "Hard", "Expert"], []);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/quizzes", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateQuiz = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Quiz created successfully");
        setShowCreateModal(false);
        resetForm();
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to create quiz");
    }
  }, [formData, fetchQuizzes]);

  const handleUpdateQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/quizzes/${editingQuiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Quiz updated successfully");
        setShowEditModal(false);
        setEditingQuiz(null);
        resetForm();
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update quiz");
    }
  }, [formData, editingQuiz, fetchQuizzes]);

  const handleDeleteQuiz = useCallback(async (quizId) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Quiz deleted successfully");
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  }, [fetchQuizzes]);

  const handleToggleStatus = useCallback(async (quizId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/toggle-status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to toggle quiz status");
    }
  }, [fetchQuizzes]);

  const handlePreviewQuiz = useCallback((quiz) => {
    setPreviewQuiz(quiz);
    setShowPreviewModal(true);
  }, []);

  // Handle keyboard events for expanded image
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && expandedImage) {
        setExpandedImage(null);
      }
    };

    if (expandedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [expandedImage]);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      category: "General",
      difficulty: "Medium",
      time_limit: 30,
      total_marks: 100,
      questions: [],
      allow_image_questions: true,
      allow_image_answers: true
    });
  }, []);

  const addQuestion = useCallback(() => {
    const newQuestion = {
      id: Date.now() + Math.random(),
      question_text: "",
      question_image: null,
      options: ["", "", "", ""],
      option_images: [null, null, null, null],
      correct_answer: 0,
      marks: 1,
      explanation: ""
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  }, []);

  const updateQuestion = useCallback((index, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return { ...prev, questions: updatedQuestions };
    });
  }, []);

  const removeQuestion = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  }, []);

  const handleImageUpload = useCallback(async (file, questionIndex, type) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      if (type === 'question') {
        updateQuestion(questionIndex, 'question_image', base64);
      } else if (type === 'answer') {
        updateQuestion(questionIndex, 'correct_answer_image', base64);
      }
    };
    reader.readAsDataURL(file);
  }, [updateQuestion]);

  const openEditModal = useCallback((quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      time_limit: quiz.time_limit,
      total_marks: quiz.total_marks,
      questions: quiz.questions.map((q, index) => ({
        id: Date.now() + index + Math.random(),
        ...q,
        option_images: q.option_images || Array(q.options.length).fill(null),
        correct_answer: quiz.answer_key[index]?.correct_answer || 0,
        correct_answer_image: quiz.answer_key[index]?.correct_answer_image || null,
        explanation: quiz.answer_key[index]?.explanation || ""
      })),
      allow_image_questions: quiz.allow_image_questions,
      allow_image_answers: quiz.allow_image_answers
    });
    setShowEditModal(true);
  }, []);

  // Memoized stats calculations
  const quizStats = useMemo(() => {
    const activeQuizzes = quizzes.filter(q => q.is_active).length;
    const totalAttempts = quizzes.reduce((sum, q) => sum + (q.total_attempts || 0), 0);
    const avgScore = quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.average_score || 0), 0) / quizzes.length)
      : 0;
    
    return { activeQuizzes, totalAttempts, avgScore };
  }, [quizzes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Management</h1>
            <p className="text-gray-600">Create, edit, and manage assessments with image support</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileImage className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizStats.activeQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{quizStats.totalAttempts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{quizStats.avgScore}%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quizzes List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quizzes List</h2>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <FileImage className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-w-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{quiz.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{quiz.category}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{quiz.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handlePreviewQuiz(quiz)}
                      className="p-1.5 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                      title="Preview Quiz"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(quiz.id, quiz.is_active)}
                      className={`p-1.5 rounded ${
                        quiz.is_active 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title={quiz.is_active ? 'Deactivate Quiz' : 'Activate Quiz'}
                    >
                      {quiz.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(quiz)}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="Edit Quiz"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{quiz.time_limit}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marks:</span>
                    <span className="font-medium">{quiz.total_marks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempts:</span>
                    <span className="font-medium">{quiz.total_attempts || 0}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Avg Score:</span>
                    <span className="font-medium">{Math.round(quiz.average_score || 0)}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded ${
                      quiz.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {quiz.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Preview Modal */}
      {showPreviewModal && previewQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quiz Preview</h2>
                <p className="text-gray-600">How students will see this quiz</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Quiz Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{previewQuiz.title}</h1>
                <p className="text-gray-600 mb-4">{previewQuiz.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {previewQuiz.category}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {previewQuiz.difficulty}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {previewQuiz.time_limit} minutes
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {previewQuiz.total_marks} marks
                  </span>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {previewQuiz.questions.map((question, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {question.question_text}
                        </h3>
                        {question.question_image && (
                          <div className="mb-4 relative group">
                            <img 
                              src={question.question_image} 
                              alt="Question" 
                              className="max-w-full h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                              onClick={() => setExpandedImage(question.question_image)}
                              title="Click to expand image"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="ml-11 space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            id={`question-${index}-option-${optionIndex}`}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                            disabled
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={`question-${index}-option-${optionIndex}`}
                              className="text-gray-700 cursor-pointer block"
                            >
                              {option}
                            </label>
                            {/* Option Image */}
                            {(question.option_images && question.option_images[optionIndex]) && (
                              <div className="mt-2 relative group">
                                <img 
                                  src={question.option_images[optionIndex]} 
                                  alt={`Option ${optionIndex + 1}`}
                                  className="max-w-full h-auto max-h-24 rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                                  onClick={() => setExpandedImage(question.option_images[optionIndex])}
                                  title="Click to expand image"
                                />
                                <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Eye className="w-3 h-3" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz Footer */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    This is how students will see the quiz. Correct answers are hidden in preview mode.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-500">
                    <span>Total Questions: {previewQuiz.questions.length}</span>
                    <span>•</span>
                    <span>Time Limit: {previewQuiz.time_limit} minutes</span>
                    <span>•</span>
                    <span>Total Marks: {previewQuiz.total_marks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div 
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <button
                onClick={() => setExpandedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              <img 
                src={expandedImage} 
                alt="Expanded view"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuizModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateQuiz}
        title="Create New Quiz"
        isEdit={false}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        difficulties={difficulties}
        addQuestion={addQuestion}
        QuestionEditor={QuestionEditor}
        questions={formData.questions}
      />

      <QuizModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingQuiz(null);
          resetForm();
        }}
        onSubmit={handleUpdateQuiz}
        title="Edit Quiz"
        isEdit={true}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        difficulties={difficulties}
        addQuestion={addQuestion}
        QuestionEditor={QuestionEditor}
        questions={formData.questions}
      />
    </div>
  );
};

export default Quizzes; 