"use client";
import { motion } from "framer-motion";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const SoalCreatePembahasan = () => {
  const navigate = useNavigate();
  const { tryout_id, subject_id } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState({
    correct_answer_index: null,
    question_explanation: ""
  });
  const [questionData, setQuestionData] = useState({
    question: "",
    answer_options: [],
    score: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answerOptionIds, setAnswerOptionIds] = useState([]);

  const handleBack = () => {
    navigate(`/guru/tryout/${tryout_id}/${subject_id}/createsoal`);
  };

  // Fungsi untuk memperbaharui token autentikasi
  const refreshToken = useCallback(async () => {
    try {
      console.log('Mencoba memperbaharui token...');
      
      // Gunakan endpoint refresh token yang tersedia di backend
      const response = await axiosInstance.post('/API/auth/refresh-token', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data.token) {
        console.log('Token berhasil diperbaharui');
        
        // Simpan token baru ke localStorage
        localStorage.setItem('authToken', response.data.token);
        
        // Tetapkan opsi cookie dengan expiry dan httpOnly
        document.cookie = `authToken=${response.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Gagal memperbaharui token:', error);
      return false;
    }
  }, []);

  const handleNext = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Validasi input
      if (formData.correct_answer_index === null || formData.correct_answer_index === undefined) {
        setError('Jawaban benar harus dipilih.');
        alert('Jawaban benar harus dipilih.');
        setLoading(false);
        return;
      }

      if (!formData.question_explanation || !formData.question_explanation.trim()) {
        setError('Pembahasan soal tidak boleh kosong.');
        alert('Pembahasan soal tidak boleh kosong.');
        setLoading(false);
        return;
      }

      // Ambil id_answer_option dari array jika tersedia
      let id_answer_option = null;
      if (answerOptionIds.length > 0 && answerOptionIds[formData.correct_answer_index] !== undefined) {
        id_answer_option = answerOptionIds[formData.correct_answer_index];
      }
      if (!id_answer_option) {
        setError('ID jawaban benar tidak ditemukan. Silakan ulangi pembuatan soal.');
        setLoading(false);
        return;
      }

      // Siapkan data dalam format yang sesuai dengan struktur database
      const explanationData = {
        id_answer_option: id_answer_option,
        question_explanation: formData.question_explanation,
        tryout_id: parseInt(tryout_id),
        subject_id: parseInt(subject_id)
      };

      console.log('Sending data:', explanationData); // For debugging

      const response = await axiosInstance.post(
        `/API/teacher/tryout/${tryout_id}/${subject_id}`,
        explanationData,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        localStorage.removeItem(`tryout_form_${tryout_id}_${subject_id}`);
        localStorage.removeItem(`temp_save_data_${tryout_id}_${subject_id}`);
        alert('Soal dan pembahasan berhasil disimpan!');
        navigate(`/guru/tryout/${tryout_id}/${subject_id}`);
        return;
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Terjadi kesalahan saat menyimpan data.');
      } else {
        setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk handle successful submission
  const onSuccessfulSubmission = () => {
    // Bersihkan localStorage
    localStorage.removeItem(`tryout_form_${tryout_id}_${subject_id}`);
    localStorage.removeItem(`temp_save_data_${tryout_id}_${subject_id}`);
    
    alert('Soal dan pembahasan berhasil disimpan!');
    
    // Navigasi kembali ke halaman soal
    navigate(`/guru/tryout/${tryout_id}/${subject_id}`, { 
      state: { 
        refreshData: true, 
        timestamp: new Date().getTime(),
        message: 'Data soal baru telah ditambahkan'
      } 
    });
  };

  // Load the question data when component mounts
  useEffect(() => {
    const loadQuestionData = async () => {
      try {
        // Cek apakah ada data yang tersimpan sebelumnya karena session expired
        const tempSavedData = localStorage.getItem(`temp_save_data_${tryout_id}_${subject_id}`);
        if (tempSavedData) {
          const tempData = JSON.parse(tempSavedData);
          console.log('Found temporary saved data from previous session:', tempData);
          
          // Muat data soal
          setQuestionData({
            question: tempData.question || "",
            answer_options: Array.isArray(tempData.answer_options) 
              ? tempData.answer_options.filter(option => option !== null && option !== undefined)
              : [],
            score: tempData.score || ""
          });
          
          // Muat data pembahasan
          setFormData({
            correct_answer_index: tempData.correct_answer_index !== undefined ? tempData.correct_answer_index : null,
            question_explanation: tempData.question_explanation || ""
          });
          
          // Hapus data sementara setelah digunakan
          localStorage.removeItem(`temp_save_data_${tryout_id}_${subject_id}`);
          
          console.log('Temporary question data loaded successfully');
          return;
        }
        
        // Load data dari localStorage reguler
        const savedData = localStorage.getItem(`tryout_form_${tryout_id}_${subject_id}`);
        console.log('Data from localStorage:', savedData);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('Parsed data:', parsedData);
          
          // Pastikan answer_options adalah array valid
          const answer_options = Array.isArray(parsedData.answer_options) 
            ? parsedData.answer_options.filter(option => option !== null && option !== undefined)
            : [];
            
          setQuestionData({
            question: parsedData.question || "",
            answer_options: answer_options,
            score: parsedData.score || ""
          });
          
          // Cek apakah ada array ID jawaban
          if (parsedData.answer_option_ids) {
            setAnswerOptionIds(parsedData.answer_option_ids);
          } else {
            setAnswerOptionIds([]);
          }
          
          console.log('Question data loaded successfully');
        } else {
          console.error('No saved data found in localStorage');
          alert("Data soal sementara tidak ditemukan, mohon mulai dari awal.");
          navigate(`/guru/tryout/${tryout_id}/${subject_id}/createsoal`);
        }
      } catch (error) {
        console.error('Error loading question data:', error);
        alert('Terjadi kesalahan saat memuat data soal.');
        navigate(`/guru/tryout/${tryout_id}/${subject_id}/createsoal`);
      }
    };

    loadQuestionData();
  }, [tryout_id, subject_id, navigate]);

  // Method khusus untuk ujicoba pengiriman pembahasan dengan berbagai format
  const sendExplanationWithFormat = async () => {
    try {
      setLoading(true);
      
      // Ambil nilai indeks dari dropdown
      const dropdownIndex = document.querySelector('select').value;
      console.log('Raw dropdown value:', dropdownIndex);
      
      // PENDEKATAN BARU: Kirim dalam 3 format berbeda
      
      // 1. Format integer tanpa quotes
      const numericIndex = parseInt(dropdownIndex, 10);
      
      // 2. Gunakan FormData dengan parameter yang diubah namanya
      const formDataNew = new FormData();
      formDataNew.append('answer_index', numericIndex); // Coba ubah nama parameter
      formDataNew.append('explanation', formData.question_explanation); // Coba ubah nama parameter
      
      // Kirim dengan FormData dan parameter baru
      try {
        const response = await axiosInstance.post(
          `/API/teacher/tryout/${tryout_id}/${subject_id}/create_question/create_explanation`,
          formDataNew,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        
        console.log('Alternative format success:', response.data);
        onSuccessfulSubmission();
        return true;
      } catch (error) {
        console.error('Alternative format failed:', error);
        
        // 3. Coba dengan parameter yang berbeda-beda
        try {
          // Coba dengan struktur data yang sepenuhnya berbeda
          const alternativeFormat = {
            answerIndex: numericIndex,
            explanation: formData.question_explanation,
            tryoutId: tryout_id,
            subjectId: subject_id
          };
          
          const response = await axiosInstance.post(
            `/API/teacher/tryout/${tryout_id}/${subject_id}/create_question/create_explanation`,
            alternativeFormat,
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          
          console.log('Completely different format success:', response.data);
          onSuccessfulSubmission();
          return true;
        } catch (finalError) {
          console.error('All formats failed. Final attempt:', finalError);
          
          // CARA TERAKHIR: Coba reset session dan mulai lagi
          try {
            alert("Semua format gagal. Mencoba memulai ulang session...");
            
            // Reset session dengan membuat permintaan ke endpoint utama
            await axiosInstance.get(`/API/teacher/tryout/${tryout_id}/${subject_id}`);
            
            // Mulai lagi dari awal - buat pertanyaan baru
            const stepOneData = new FormData();
            stepOneData.append('question', questionData.question || '');
            stepOneData.append('score', questionData.score || '');
            
            if (Array.isArray(questionData.answer_options)) {
              questionData.answer_options.forEach((option) => {
                if (option !== undefined && option !== null) {
                  stepOneData.append('answer_options', option);
                }
              });
            }
            
            // Coba buat pertanyaan baru
            const newQuestionResponse = await axiosInstance.post(
              `/API/teacher/tryout/${tryout_id}/${subject_id}/create_question`,
              stepOneData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                }
              }
            );
            
            if (newQuestionResponse.status === 201) {
              // Coba tambahkan pembahasan langsung dengan parameter minimal
              const minimalParams = new FormData();
              minimalParams.append('correct_answer_index', numericIndex);
              
              const explanationResponse = await axiosInstance.post(
                `/API/teacher/tryout/${tryout_id}/${subject_id}/create_question/create_explanation`,
                minimalParams,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  }
                }
              );
              
              if (explanationResponse.status === 201) {
                onSuccessfulSubmission();
                return true;
              }
            }
            
            throw new Error("Reset session failed");
          } catch (resetError) {
            console.error('Session reset failed:', resetError);
            alert("Semua upaya gagal. Silakan refresh halaman dan coba lagi.");
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Format testing failed:', error);
      setLoading(false);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Metode terakhir: reset hard dan coba metode baru yang benar-benar berbeda
  const hardResetAndTryAgain = async () => {
    try {
      setLoading(true);
      
      // Konfirmasi dengan user
      if (!confirm("Ini akan menghapus soal saat ini dan mencoba prosedur berbeda. Lanjutkan?")) {
        setLoading(false);
        return;
      }
      
      // 1. Reset session dengan membuat permintaan ke endpoint utama
      await axiosInstance.get(`/API/teacher/tryout/${tryout_id}/${subject_id}/reset_session`);
      
      // 2. Buat soal terlebih dahulu tanpa pembahasan (step 1)
      const createQuestionOnly = new FormData();
      createQuestionOnly.append('question', questionData.question || '');
      createQuestionOnly.append('score', questionData.score || '');
      createQuestionOnly.append('correct_answer_index', formData.correct_answer_index);
      
      // Tambahkan pilihan jawaban
      if (Array.isArray(questionData.answer_options)) {
        questionData.answer_options.forEach((option) => {
          if (option !== undefined && option !== null) {
            createQuestionOnly.append('answer_options', option);
          }
        });
      }
      
      // 3. Kirim soal dengan correct_answer_index dalam satu permintaan
      const combinedResponse = await axiosInstance.post(
        `/API/teacher/tryout/${tryout_id}/${subject_id}/create_complete_question`,
        createQuestionOnly,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      if (combinedResponse.status === 201 || combinedResponse.status === 200) {
        // 4. Kirim pembahasan secara terpisah jika diperlukan
        const explanationOnly = new FormData();
        explanationOnly.append('question_explanation', formData.question_explanation);
        explanationOnly.append('id', combinedResponse.data.question_id); // Gunakan ID dari response
        
        const explanationResponse = await axiosInstance.post(
          `/API/teacher/tryout/${tryout_id}/${subject_id}/add_explanation`,
          explanationOnly,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        
        if (explanationResponse.status === 201 || explanationResponse.status === 200) {
          onSuccessfulSubmission();
          return;
        }
      }
      
      throw new Error("Hard reset failed");
    } catch (error) {
      console.error('Hard reset approach failed:', error);
      alert("Pendekatan alternatif gagal. Silakan hubungi administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Pembahasan Soal</h2>
            <p className="text-sm text-gray-600">Tambahkan pembahasan untuk soal yang telah dibuat</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="question-container border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
            <div className="mb-8">
              {/* Display the question */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Pertanyaan:</h4>
                <p className="text-gray-800">{questionData.question}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Opsi Jawaban:</h4>
                  <div className="space-y-2">
                    {questionData.answer_options.map((option, index) => (
                      option !== undefined && option !== null && (
                        <div 
                          key={index} 
                          className={`p-2 rounded-lg ${
                            parseInt(formData.correct_answer_index) === index 
                              ? 'bg-green-100 border border-green-500 text-green-700' 
                              : 'text-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                          {parseInt(formData.correct_answer_index) === index && (
                            <span className="ml-2 text-green-600 font-medium">(Jawaban Benar)</span>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-800">Pembahasan</h3>
              </div>

              <div className="explanation-container space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Jawaban Benar <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.correct_answer_index ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({
                          ...formData,
                          correct_answer_index: value === "" ? null : parseInt(value, 10)
                        });
                      }}
                      className="input-field w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Pilih jawaban benar</option>
                      {questionData.answer_options.map((option, index) => (
                        option !== undefined && option !== null && (
                          <option key={answerOptionIds[index] || index} value={index}>
                            {String.fromCharCode(65 + index)}. {option}
                          </option>
                        )
                      ))}
                    </select>
                  </div>
                  {formData.correct_answer_index !== null && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        Jawaban yang dipilih: {String.fromCharCode(65 + formData.correct_answer_index)}. {questionData.answer_options[formData.correct_answer_index]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pembahasan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.question_explanation || ""}
                    onChange={(e) => setFormData({ ...formData, question_explanation: e.target.value })}
                    className="textarea-field w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    rows="5"
                    placeholder="Masukkan pembahasan soal"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button 
                onClick={handleBack}
                className="button-secondary px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                <FiArrowLeft size={16} />
                Kembali
              </button>
              <button 
                onClick={() => handleNext()}
                disabled={loading}
                className={`button-primary px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
                <FiSave size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoalCreatePembahasan;

