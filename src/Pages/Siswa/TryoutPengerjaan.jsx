"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Clock, User, BookOpen, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"

export default function SiswaTryoutPengerjaan() {
  const navigate = useNavigate()
  const { id: idTryout, subjectId } = useParams()
  
  console.log('Current subjectId from params:', subjectId); // Log untuk debug
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [answeredQuestions, setAnsweredQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [examData, setExamData] = useState({
    studentData: null,
    subjectData: null,
    questionData: []
  })

// Reset state setiap subjectId berubah, tapi jangan clear localStorage
useEffect(() => {
  setCurrentQuestion(1)
  setLoading(true)
  setError(null)
  setExamData({
    studentData: null,
    subjectData: null,
    questionData: []
  })
  // (JANGAN clear localStorage di sini, biarkan timer & jawaban tersimpan)
}, [subjectId, idTryout])

  // Ambil data tryout setiap idTryout atau subjectId berubah
  useEffect(() => {
    const fetchTryoutData = async () => {
      try {
        setLoading(true)
        
        console.log('URL yang dipanggil:', `http://localhost:3000/API/student/tryout/${idTryout}/${subjectId}/taking`)
        const response = await axiosInstance.get(`http://localhost:3000/API/student/tryout/${idTryout}/${subjectId}/taking`)
        console.log('Response API:', response.data)

        if (!response.data) {
          throw new Error('Data tidak ditemukan')
        }

        // Simpan data ke state
        setExamData({
          studentData: response.data.studentData || {},
          subjectData: response.data.subjectData || {},
          questionData: Array.isArray(response.data.questionData) ? response.data.questionData : []
        })

        // Set timer berdasarkan total_waktu dari API atau dari localStorage jika ada
        if (response.data.subjectData?.total_waktu) {
          const minutes = parseInt(response.data.subjectData.total_waktu)
          const savedTime = localStorage.getItem(`tryout_${idTryout}_${subjectId}_time`)
          
          if (savedTime) {
            const { minutes: savedMinutes, seconds: savedSeconds, timestamp } = JSON.parse(savedTime)
            const now = Date.now()
            const elapsedSeconds = Math.floor((now - timestamp) / 1000)
            const totalSeconds = savedMinutes * 60 + savedSeconds - elapsedSeconds
            
            if (totalSeconds > 0) {
              setTimeLeft({
                minutes: Math.floor(totalSeconds / 60),
                seconds: totalSeconds % 60
              })
            } else {
              setTimeLeft({ minutes, seconds: 0 })
            }
          } else {
            setTimeLeft({ minutes, seconds: 0 })
          }
        }

        // Load saved answers and answered questions from localStorage
        const savedAnswers = localStorage.getItem(`tryout_${idTryout}_${subjectId}_answers`)
        const savedAnsweredQuestions = localStorage.getItem(`tryout_${idTryout}_${subjectId}_answered`)
        
        if (savedAnswers) {
          setSelectedAnswers(JSON.parse(savedAnswers))
        }
        if (savedAnsweredQuestions) {
          setAnsweredQuestions(JSON.parse(savedAnsweredQuestions))
        }

        setLoading(false)
      } catch (err) {
        console.error('Error lengkap:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat memuat data'
        setError(errorMessage)
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('Error autentikasi, redirect ke login')
          navigate('/login')
        }
        
        setLoading(false)
      }
    }

    fetchTryoutData()
  }, [idTryout, subjectId, navigate])

// Efek timer + auto‐submit jawaban null saat waktu habis
useEffect(() => {
  if (!timeLeft) return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (!prev) return null;

      // Countdown normal
      if (prev.seconds > 0) {
        const newTime = { minutes: prev.minutes, seconds: prev.seconds - 1 };
        localStorage.setItem(
          `tryout_${idTryout}_${subjectId}_time`,
          JSON.stringify({ ...newTime, timestamp: Date.now() })
        );
        return newTime;
      }
      if (prev.minutes > 0) {
        const newTime = { minutes: prev.minutes - 1, seconds: 59 };
        localStorage.setItem(
          `tryout_${idTryout}_${subjectId}_time`,
          JSON.stringify({ ...newTime, timestamp: Date.now() })
        );
        return newTime;
      }

      // Waktu habis: menit=0 & detik=0
      clearInterval(timer);
      localStorage.removeItem(`tryout_${idTryout}_${subjectId}_time`);

      // 1) Kumpulkan semua question_id
      const allIds = examData.questionData.map(q => q.question_id);
      // 2) Filter yang belum dijawab
      const unanswered = allIds.filter(id => !answeredQuestions.includes(id));
      // 3) POST null untuk tiap unanswered question
      unanswered.forEach(async questionId => {
        try {
          await axiosInstance.post(
            `/API/student/tryout/${idTryout}/${subjectId}/${questionId}/taking`,
            { answerOptionId: null }
          );
        } catch(err) {
          console.error(`Gagal submit null untuk soal ${questionId}:`, err);
        }
      });

      // 4) Hapus semua storage lokal subjek ini
      localStorage.removeItem(`tryout_${idTryout}_${subjectId}_answers`);
      localStorage.removeItem(`tryout_${idTryout}_${subjectId}_answered`);

      // 5) Navigasi: kalau bukan subjek terakhir → peralihan, else → penilaian
      const sid = Number(subjectId);
      const maxSid = 7;
      if (sid < maxSid) {
        navigate(`/siswa/tryout/${idTryout}/${sid + 1}/peralihan`);
      } else {
        navigate(`/siswa/tryout/${idTryout}/penilaian`);
      }

      return prev;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [
  timeLeft,
  examData.questionData,
  answeredQuestions,
  idTryout,
  subjectId,
  navigate
]);

  // Jumlah total soal
  const totalQuestions = examData.questionData?.length || 0

  // Data soal saat ini
  const currentQuestionData = examData.questionData?.[currentQuestion - 1] || null

  // Find next unanswered question
  const findNextUnansweredQuestion = () => {
    for (let i = 1; i <= totalQuestions; i++) {
      if (!answeredQuestions.includes(i)) {
        return i
      }
    }
    return 1 // If all questions are answered, return to first question
  }

  // Fungsi untuk memilih atau menghapus jawaban
  const handleAnswerSelect = async (answerOptionId) => {
    try {
      const questionId = currentQuestionData.question_id;
      const selected = selectedAnswers[questionId];
      const url = `/API/student/tryout/${idTryout}/${subjectId}/${questionId}/taking`;

      // Jika klik jawaban yang sama, hapus jawaban dengan mengirim null
      if (selected === answerOptionId) {
        await axiosInstance.patch(url, { 
          answer_option_id: null,
          is_update: true 
        });
        setSelectedAnswers((prev) => {
          const newAnswers = { ...prev };
          delete newAnswers[questionId];
          // Simpan ke localStorage setelah update
          localStorage.setItem(`tryout_${idTryout}_${subjectId}_answers`, JSON.stringify(newAnswers));
          return newAnswers;
        });
        setAnsweredQuestions((prev) => {
          const newAnswered = prev.filter(id => id !== questionId);
          // Simpan ke localStorage setelah update
          localStorage.setItem(`tryout_${idTryout}_${subjectId}_answered`, JSON.stringify(newAnswered));
          return newAnswered;
        });
        return;
      }

      // Log data yang dikirim ke backend
      console.log("FRONTEND SEND:", {
        idTryout,
        subjectId,
        questionId,
        answerOptionId
      });

      // Cek apakah sudah pernah menjawab soal ini
      const alreadyAnswered = answeredQuestions.includes(questionId);

      if (alreadyAnswered) {
        // PATCH untuk update jawaban
        await axiosInstance.patch(url, { 
          answer_option_id: answerOptionId,
          is_update: true 
        });
      } else {
        // POST untuk jawaban baru
        await axiosInstance.post(url, { 
          answerOptionId,
          is_update: false 
        });
      }

      // Update state setelah berhasil menyimpan
      setSelectedAnswers((prev) => {
        const newAnswers = { ...prev, [questionId]: answerOptionId };
        // Simpan ke localStorage setelah update
        localStorage.setItem(`tryout_${idTryout}_${subjectId}_answers`, JSON.stringify(newAnswers));
        return newAnswers;
      });
      
      // Pastikan questionId ada dalam answeredQuestions
      if (!answeredQuestions.includes(questionId)) {
        setAnsweredQuestions((prev) => {
          const newAnswered = [...prev, questionId];
          // Simpan ke localStorage setelah update
          localStorage.setItem(`tryout_${idTryout}_${subjectId}_answered`, JSON.stringify(newAnswered));
          return newAnswered;
        });
      }
    } catch (err) {
      console.error('Error menyimpan/menghapus jawaban:', err);
      if (err.response) {
        console.error('Backend error response:', err.response.data);
        // Tampilkan pesan error yang lebih spesifik
        const errorMessage = err.response.data?.message || 'Terjadi kesalahan saat menyimpan jawaban';
        alert(errorMessage);
      } else {
        alert('Gagal menyimpan/menghapus jawaban. Silakan coba lagi.');
      }
    }
  }

  // Fungsi untuk submit jawaban kosong
  const submitEmptyAnswer = async (questionId) => {
    try {
      const url = `/API/student/tryout/${idTryout}/${subjectId}/${questionId}/taking`;
      
      // Log untuk memastikan mengirim null
      console.log("FRONTEND SEND EMPTY:", {
        idTryout,
        subjectId,
        questionId,
        answerOptionId: null  // Pastikan mengirim null
      });

      // Cek apakah sudah pernah menjawab soal ini
      const alreadyAnswered = answeredQuestions.includes(questionId);

      if (alreadyAnswered) {
        // Hapus jawaban yang ada dengan DELETE request
        await axiosInstance.delete(url);
      } else {
        // POST untuk jawaban kosong baru dengan null
        await axiosInstance.post(url, { 
          answerOptionId: null  // Pastikan mengirim null
        });
      }

      // Update state
      setSelectedAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
      
      // Update answeredQuestions
      setAnsweredQuestions((prev) => {
        if (!prev.includes(questionId)) {
          const newAnswered = [...prev, questionId];
          // Simpan ke localStorage setelah update
          localStorage.setItem(`tryout_${idTryout}_${subjectId}_answered`, JSON.stringify(newAnswered));
          return newAnswered;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error menyimpan jawaban kosong:', err);
      if (err.response) {
        console.error('Backend error response:', err.response.data);
        const errorMessage = err.response.data?.message || 'Terjadi kesalahan saat menyimpan jawaban kosong';
        alert(errorMessage);
      } else {
        alert('Gagal menyimpan jawaban kosong. Silakan coba lagi.');
      }
    }
  }

  // Fungsi navigasi soal
  const navigateQuestion = async (direction) => {
    const questionId = currentQuestionData.question_id;
    if (direction === "next") {
      // Submit jawaban kosong untuk soal saat ini jika belum dijawab
      if (!answeredQuestions.includes(questionId)) {
        await submitEmptyAnswer(questionId);
      }

      if (currentQuestion === totalQuestions) {
        // Jika masih ada waktu, jangan pindah ke subjek berikutnya
        if (timeLeft && (timeLeft.minutes > 0 || timeLeft.seconds > 0)) {
          // Jika masih ada soal yang belum dijawab, arahkan ke soal pertama yang belum dijawab
          const nextUnanswered = findNextUnansweredQuestion();
          setCurrentQuestion(nextUnanswered);
        } else {
          // Cek apakah semua soal sudah dijawab
          if (answeredQuestions.length === totalQuestions) {
            const currentSubjectId = Number(subjectId);
            const maxSubjectId = 7; // ID subjek maksimal

            if (currentSubjectId < maxSubjectId) {
              // Jika masih ada subjek berikutnya, arahkan ke peralihan
              const nextSubjectId = currentSubjectId + 1;
              // Hapus data dari localStorage sebelum pindah subjek
              localStorage.removeItem(`tryout_${idTryout}_${subjectId}_time`);
              localStorage.removeItem(`tryout_${idTryout}_${subjectId}_answers`);
              localStorage.removeItem(`tryout_${idTryout}_${subjectId}_answered`);
              navigate(`/siswa/tryout/${idTryout}/${nextSubjectId}/peralihan`);
            } else {
              // Jika ini adalah subjek terakhir dan semua soal sudah dijawab
              // Hapus semua data dari localStorage
              localStorage.removeItem(`tryout_${idTryout}_${subjectId}_time`);
              localStorage.removeItem(`tryout_${idTryout}_${subjectId}_answers`);
              localStorage.removeItem(`tryout_${idTryout}_${subjectId}_answered`);
              navigate(`/siswa/tryout/${idTryout}/penilaian`);
            }
          } else {
            // Jika masih ada soal yang belum dijawab, arahkan ke soal pertama yang belum dijawab
            const nextUnanswered = findNextUnansweredQuestion();
            setCurrentQuestion(nextUnanswered);
          }
        }
      } else {
        setCurrentQuestion((prev) => prev + 1);
      }
    } else if (direction === "prev") {
      setCurrentQuestion((prev) => Math.max(1, prev - 1));
    }
  }

  // Fungsi untuk menghapus jawaban
  const handleDeleteAnswer = async (questionId) => {
    try {
      const url = `/API/student/tryout/${idTryout}/${subjectId}/${questionId}/taking`;
      
      // Log data yang dikirim ke backend untuk menghapus jawaban
      console.log("FRONTEND DELETE ANSWER:", {
        idTryout,
        subjectId,
        questionId
      });

      await axiosInstance.delete(url);
      
      // Update state setelah menghapus jawaban
      setSelectedAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        // Simpan ke localStorage setelah update
        localStorage.setItem(`tryout_${idTryout}_${subjectId}_answers`, JSON.stringify(newAnswers));
        return newAnswers;
      });
      
      // Hapus dari daftar soal yang sudah dijawab
      setAnsweredQuestions((prev) => {
        const newAnswered = prev.filter(id => id !== questionId);
        // Simpan ke localStorage setelah update
        localStorage.setItem(`tryout_${idTryout}_${subjectId}_answered`, JSON.stringify(newAnswered));
        return newAnswered;
      });
      
    } catch (err) {
      console.error('Error menghapus jawaban:', err);
      alert('Gagal menghapus jawaban. Silakan coba lagi.');
    }
  }

  // Peringatan waktu (5 menit)
  const isTimeWarning = timeLeft?.minutes < 5

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#F5F0E9] to-[#EAE5DE]">
        <div className="text-xl font-semibold text-gray-700">Memuat...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#F5F0E9] to-[#EAE5DE]">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-[#F5F0E9] to-[#EAE5DE] flex flex-col items-center p-6 min-h-screen w-screen">
      <motion.div className="w-full max-w-6xl">
        <motion.div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <motion.div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E4A7F] text-white p-6 rounded-xl shadow-lg w-full md:w-1/3">
            <motion.h2 className="text-xl font-bold text-center mb-6">
              Selamat Mengerjakan
            </motion.h2>

            {timeLeft && (
              <motion.div className={`${
                isTimeWarning ? "bg-red-500" : "bg-[#2C4A6E]"
              } text-white text-center py-3 px-4 rounded-xl mb-4`}>
                <Clock className="inline-block mr-2" size={20} />
                <span className="text-xl font-bold">
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </motion.div>
            )}

            <motion.div className="bg-[#2C4A6E] text-white text-center py-3 px-4 rounded-xl mb-4">
              <User className="inline-block mr-2" size={18} />
              <span>{examData.studentData?.nama || "Siswa"}</span>
              <div className="text-sm text-gray-300">NISN: {examData.studentData?.nisn}</div>
            </motion.div>

            <motion.div className="bg-[#2C4A6E] text-white text-center py-3 px-4 rounded-xl mb-4">
              <BookOpen className="inline-block mr-2" size={18} />
              <span>{examData.subjectData?.subjek}</span>
              <div className="text-sm text-gray-300">{examData.subjectData?.kategori_subjek}</div>
            </motion.div>

            <div className="grid grid-cols-5 gap-2 mt-4">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const qId = examData.questionData[i]?.question_id;
                return (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentQuestion(i + 1)}
                    className={`p-2 rounded-lg ${
                      currentQuestion === i + 1 ? "ring-2 ring-white" : ""
                    } ${
                      answeredQuestions.includes(qId)
                        ? "bg-green-500"
                        : "bg-[#2C4A6E]"
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 bg-[#2C4A6E]/50 p-3 rounded-xl">
              <div className="flex justify-between text-sm">
                <span>Terjawab: {answeredQuestions.length}</span>
                <span>Sisa: {totalQuestions - answeredQuestions.length}</span>
              </div>
            </div>
          </motion.div>

          {/* Bagian Soal */}
          <motion.div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-2/3">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Soal {currentQuestion} dari {totalQuestions}
              </h3>
              {currentQuestionData?.question_image && (
                <img 
                  src={currentQuestionData.question_image} 
                  alt="Soal" 
                  className="mb-4 rounded-lg max-w-full"
                />
              )}
              <p className="text-gray-700 whitespace-pre-wrap">
                {currentQuestionData?.question || "Pertanyaan tidak tersedia"}
              </p>
            </div>

            <div className="space-y-4 mt-6">
              {Array.isArray(currentQuestionData?.answer_options) && currentQuestionData.answer_options.length > 0 ? (
                currentQuestionData.answer_options.map((option) => (
                  <motion.button
                    key={option.answer_option_id || option.id}
                    onClick={() => handleAnswerSelect(option.answer_option_id || option.id)}
                    className={`w-full p-4 text-left rounded-xl ${
                      selectedAnswers[currentQuestionData.question_id] === (option.answer_option_id || option.id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {option.text || option.answer_option}
                  </motion.button>
                ))
              ) : (
                <div className="text-gray-500 italic">Pilihan jawaban tidak tersedia</div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => navigateQuestion("prev")}
                disabled={currentQuestion === 1}
                className={`flex items-center px-4 py-2 rounded-xl ${
                  currentQuestion === 1 ? "bg-gray-300" : "bg-[#1E3A5F] text-white"
                }`}
              >
                <ArrowLeft className="mr-2" size={16} />
                Sebelumnya
              </button>

              <button
                onClick={() => navigateQuestion("next")}
                disabled={false}
                className={`flex items-center px-4 py-2 rounded-xl ${
                  currentQuestion === totalQuestions ? "bg-[#1E3A5F] text-white" : "bg-[#1E3A5F] text-white"
                }`}
              >
                {currentQuestion === totalQuestions ? "Selesai" : "Selanjutnya"}
                <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

