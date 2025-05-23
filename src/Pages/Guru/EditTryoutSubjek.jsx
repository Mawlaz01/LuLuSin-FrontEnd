"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiX, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const EditTryoutSubjek = () => {
  const { tryout_id, subject_id, question_id } = useParams();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    question: "",
    score: "",
    options: ["", "", "", "", ""],
    correct_answer: "",
    explanation: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosInstance.get(`/API/teacher/tryout/${tryout_id}/${subject_id}`);
        const soal = res.data.tryoutQuestionBySubject.find(q => String(q.question_id) === String(question_id));
        if (soal) {
          setFormState({
            question: soal.question,
            score: soal.score,
            options: soal.answer_options.map(opt => opt.answer_option),
            correct_answer: soal.correct_answer,
            explanation: soal.explanation,
          });
        } else {
          setError("Soal tidak ditemukan!");
          console.log("DEBUG: Soal tidak ditemukan", { question_id, data: res.data.tryoutQuestionBySubject });
        }
      } catch (err) {
        setError("Gagal mengambil data soal!");
        console.error("FETCH ERROR", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    console.log("FETCH", { tryout_id, subject_id, question_id });
  }, [tryout_id, subject_id, question_id]);

  const addOption = () => {
    setFormState(f => ({ ...f, options: [...f.options, ""] }));
  };

  const removeOption = (indexToRemove) => {
    if (formState.options.length > 2) {
      setFormState(f => ({
        ...f,
        options: f.options.filter((_, index) => index !== indexToRemove)
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Fungsi submit update soal
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kirim data ke backend (patch)
      await axiosInstance.patch(
        `/API/teacher/tryout/${tryout_id}/${subject_id}/edit_question/${question_id}`,
        {
          question: formState.question,
          score: formState.score,
          answer_options: formState.options,
        }
      );
      // Redirect ke halaman list soal dengan state refreshData
      alert("Soal berhasil diupdate!");
      navigate(`/guru/tryout/${tryout_id}/${subject_id}`, { state: { refreshData: true, timestamp: Date.now(), message: "Soal berhasil diupdate!" } });
    } catch (err) {
      alert("Gagal update soal! " + (err.response?.data?.message || err.message));
    }
  };

  console.log("RENDER", { formState, loading });

  return (
    <div className="flex justify-center items-center w-full" style={{ minHeight: 300 }}>
      <motion.div
        className="border-2 border-[#213555] rounded-2xl p-8 w-full max-w-xl bg-white shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h2
          className="text-xl font-bold mb-6 text-[#213555] relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Edit Soal Tryout
          <motion.div
            className="absolute -bottom-2 left-0 h-1 bg-[#4F709C] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            transition={{ delay: 0.4, duration: 0.4 }}
          />
        </motion.h2>
        {error && (
          <div className="text-center py-10 text-red-600 font-semibold">{error}</div>
        )}
        {!error && loading && (
          <div className="text-center py-10">Loading...</div>
        )}
        {!error && !loading && (
          <form onSubmit={handleSubmit}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Soal
                </label>
                <motion.textarea
                  className="w-full p-3 border border-gray-400 bg-gray-50 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-black"
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(107, 114, 128, 0.2)" }}
                  value={formState.question}
                  onChange={e => setFormState(f => ({ ...f, question: e.target.value }))}
                ></motion.textarea>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Skor
                </label>
                <motion.input
                  type="number"
                  className="w-full p-3 border border-gray-400 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-black"
                  value={formState.score}
                  onChange={e => setFormState(f => ({ ...f, score: e.target.value }))}
                />
              </motion.div>

              {/* <motion.div variants={itemVariants}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Gambar Soal (Opsional)
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiPlus className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          Klik untuk upload gambar
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>

                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg mx-auto"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <FiX size={16} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div> */}

              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-gray-700">
                    Opsi
                  </label>
                  <motion.button
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2 shadow-sm"
                    onClick={addOption}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPlus size={16} /> Tambah Opsi
                  </motion.button>
                </div>

                <motion.div
                  className="border border-gray-400 bg-gray-50 p-4 rounded-lg space-y-3"
                  variants={containerVariants}
                >
                  <AnimatePresence>
                    {formState.options.map((option, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex-grow relative">
                          <motion.input
                            type="text"
                            className="w-full p-3 border border-gray-400 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-10 text-black"
                            placeholder={`Opsi ${index + 1}`}
                            value={option}
                            onChange={e => {
                              const newOptions = [...formState.options];
                              newOptions[index] = e.target.value;
                              setFormState(f => ({ ...f, options: newOptions }));
                            }}
                            whileFocus={{
                              boxShadow: "0 0 0 3px rgba(107, 114, 128, 0.2)",
                            }}
                          />
                          {formState.options.length > 2 && (
                            <motion.button
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                              onClick={() => removeOption(index)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiX size={16} />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Jawaban Benar
                </label>
                <motion.input
                  type="text"
                  className="w-full p-3 border border-gray-400 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-black"
                  value={formState.correct_answer}
                  onChange={e => setFormState(f => ({ ...f, correct_answer: e.target.value }))}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Pembahasan
                </label>
                <motion.textarea
                  className="w-full p-3 border border-gray-400 bg-gray-50 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all text-black"
                  value={formState.explanation}
                  onChange={e => setFormState(f => ({ ...f, explanation: e.target.value }))}
                ></motion.textarea>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex justify-between mt-8 gap-4"
              >
                <motion.button
                  type="button"
                  className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(-1)}
                >
                  <FiArrowLeft size={16} /> Batalkan
                </motion.button>
                <motion.button
                  type="submit"
                  className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Simpan Perubahan <FiArrowRight size={16} />
                </motion.button>
              </motion.div>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EditTryoutSubjek;
