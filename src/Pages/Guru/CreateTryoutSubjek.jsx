"use client";

import { useState, useEffect } from "react";
import { FiUpload, FiArrowLeft, FiX, FiArrowRight } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const CreateTryoutSubjek = () => {
  const navigate = useNavigate();
  const { tryout_id, subject_id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    question: "",
    score: "",
    answer_options: ["", "", "", "", ""],
    question_image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [tryout_id, subject_id]);

  useEffect(() => {
    const saved = localStorage.getItem(`tryout_form_${tryout_id}_${subject_id}`);
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, [tryout_id, subject_id]);

  useEffect(() => {
    localStorage.setItem(`tryout_form_${tryout_id}_${subject_id}`, JSON.stringify(formData));
  }, [formData, tryout_id, subject_id]);

  const fetchQuestions = async () => {
    try {
      const response = await axiosInstance.get(`/API/teacher/tryout/${tryout_id}/${subject_id}`);
      if (response.data && response.data.tryoutQuestionBySubject) {
        setQuestions(response.data.tryoutQuestionBySubject);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.message || 'Gagal mengambil data soal.');
    }
  };

  const openDeleteConfirm = (questionId) => {
    setQuestionToDelete(questionId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  const confirmDelete = async () => {
    if (questionToDelete) {
      await handleDelete(questionToDelete);
      closeDeleteConfirm();
    }
  };

  const handleDelete = async (questionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.delete(
        `/API/teacher/tryout/${tryout_id}/${subject_id}/delete_question/${questionId}`
      );

      if (response.status === 200) {
        await fetchQuestions();
        setError(null);
        closeDeleteConfirm();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      setError(error.response?.data?.message || 'Gagal menghapus soal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, question_image: file });
    }
  };

  const handleBack = () => {
    navigate(`/guru/tryout/${tryout_id}/${subject_id}`);
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.question.trim()) {
        setError('Pertanyaan tidak boleh kosong');
        setLoading(false);
        return;
      }

      if (!formData.score.trim()) {
        setError('Skor tidak boleh kosong');
        setLoading(false);
        return;
      }

      const nonEmptyOptions = formData.answer_options.filter(opt => opt.trim() !== '');
      
      if (nonEmptyOptions.length < 2) {
        setError('Minimal harus ada 2 opsi jawaban');
        setLoading(false);
        return;
      }

      if (nonEmptyOptions.length > 5) {
        setError('Maksimal 5 opsi jawaban yang diperbolehkan');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('question', formData.question.trim());
      formDataToSend.append('score', formData.score);
      
      nonEmptyOptions.forEach((option) => {
        formDataToSend.append('answer_options', option.trim());
      });

      if (formData.question_image) {
        formDataToSend.append('question_image', formData.question_image);
      }
      
      console.log('------- CREATE QUESTION DEBUG INFO -------');
      console.log('Params:', { tryout_id, subject_id });
      console.log('Form data:', formData);
      console.log('Non-empty options:', nonEmptyOptions);
      console.log('API URL:', `/API/teacher/tryout/${tryout_id}/${subject_id}/create_question`);
      console.log('----------------------------------------');

      const response = await axiosInstance.post(
        `/API/teacher/tryout/${tryout_id}/${subject_id}/create_question`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      console.log('Response from server:', response);

      if (response.status === 201) {
        const answerOptionIds = response.data.answer_option_ids;
        const dataToSave = {
          question: (formData.question || "").trim(),
          score: formData.score,
          answer_options: nonEmptyOptions,
          answer_option_ids: answerOptionIds,
          question_image: formData.question_image ? formData.question_image.name : null
        };
        
        console.log('Saving data to localStorage:', dataToSave);
        localStorage.setItem(`tryout_form_${tryout_id}_${subject_id}`, JSON.stringify(dataToSave));
        
        alert('Soal berhasil disimpan! Klik OK untuk lanjut ke pembahasan.');
        
        navigate(`/guru/tryout/${tryout_id}/${subject_id}/createsoal/createpembahasan`, {
          state: { fromCreateSoal: true, timestamp: new Date().getTime() }
        });
      }
    } catch (error) {
      console.error('Error creating question:', error);
      
      console.log('------- CREATE QUESTION ERROR DETAILS -------');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Message:', error.message);
      console.log('--------------------------------------------');
      
      setError(error.response?.data?.message || 'Gagal menyimpan soal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus soal ini?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Soal</h2>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.question_id || index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">Soal {index + 1}</p>
                      <p className="text-gray-600 mt-1">{question.question}</p>
                      {question.question_image && (
                        <img src={question.question_image} alt="Question" className="mt-2 max-h-32 rounded" />
                      )}
                    </div>
                    <button
                      onClick={() => openDeleteConfirm(question.question_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Buat Soal Baru</h2>
            <p className="text-sm text-gray-600">Lengkapi informasi soal di bawah ini</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pertanyaan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                rows="3"
                placeholder="Masukkan pertanyaan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skor <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Masukkan skor"
                required
                min="0"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opsi Jawaban (Minimal 2, Maksimal 5 opsi) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {formData.answer_options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.answer_options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, answer_options: newOptions });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder={`Opsi ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-6">
              <button
                onClick={handleBack}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                disabled={loading}
              >
                <FiArrowLeft size={16} />
                Kembali
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Menyimpan...' : 'Selanjutnya'}
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTryoutSubjek;