"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"

export default function SiswaDashBoard() {
  const [progressValues, setProgressValues] = useState([0, 0, 0])
  const [notDoneTryouts, setNotDoneTryouts] = useState([])
  const [topTryoutScores, setTopTryoutScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('/API/student/dashboard')
        setNotDoneTryouts(response.data.notDoneTryouts || [])
        setTopTryoutScores(response.data.topTryoutScores || [])
        setLoading(false)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.response?.data?.message || 'Failed to fetch dashboard data')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
  }

  // Animate progress bars after component mounts
  useEffect(() => {
    setProgressValues(
      topTryoutScores.map((item) => (item.average_score / 100) * 100)
    )
  }, [topTryoutScores])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F0E9]">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F0E9]">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="bg-[#F5F0E9] min-h-screen p-6 screen w-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        style={{
          backgroundImage: "radial-gradient(circle at top right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1))",
        }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl font-bold text-gray-800 flex items-center"
        >
          <span className="bg-[#1E3A5F] h-6 w-1.5 rounded-full mr-2 inline-block"></span>
          Dashboard
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center mt-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-[#1E3A5F] to-[#2E4A7F] text-white p-4 rounded-2xl text-center w-20 shadow-md"
            style={{ boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.3)" }}
          >
            <p className="text-sm font-medium">Hari</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-3xl font-bold"
            >
              24
            </motion.p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="ml-6 text-lg font-semibold text-gray-800 border-l-4 border-[#1E3A5F] pl-4 py-1"
          >
            Usaha hari ini, kampus impian esok hari!
          </motion.p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gradient-to-br from-[#1E3A5F] to-[#2E4A7F] text-white p-6 rounded-2xl shadow-lg mt-6"
        style={{ boxShadow: "0 10px 25px -5px rgba(30, 58, 95, 0.4)" }}
      >
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg font-semibold flex items-center"
        >
          <span className="bg-white h-5 w-1.5 rounded-full mr-2 inline-block"></span>
          Skor Tertinggi
        </motion.h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-4 mt-6"
        >
          {topTryoutScores.map((item, index) => (
            <motion.div
              key={item.id_tryout}
              custom={index}
              variants={cardVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.4)",
                transition: { type: "spring", stiffness: 300 },
              }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl relative overflow-hidden"
              style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gray-700 rounded-bl-full opacity-30"></div>
              <motion.div variants={itemVariants} className="flex items-center mb-2">
                <span className="bg-white text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">Rank #{index + 1}</p>
              </motion.div>
              <motion.p variants={itemVariants} className="text-sm text-gray-300 mb-3">
                {item.tryout_name}
              </motion.p>
              <div className="w-full bg-gray-700 h-3 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressValues[index] || 0}%` }}
                  transition={{ delay: 0.8 + index * 0.2, duration: 1, type: "spring" }}
                  className="bg-gradient-to-r from-blue-400 to-blue-300 h-3 rounded-full"
                />
              </div>
              <motion.p variants={itemVariants} className="text-sm mt-2 text-right font-bold text-blue-300">
                {item.average_score} / 1000
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gradient-to-br from-[#2E3A5F] to-[#3E4A7F] text-white p-6 rounded-2xl shadow-lg mt-6"
        style={{ boxShadow: "0 10px 25px -5px rgba(46, 58, 95, 0.4)" }}
      >
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-lg font-semibold flex items-center"
        >
          <span className="bg-white h-5 w-1.5 rounded-full mr-2 inline-block"></span>
          Tryout Belum Dikerjakan
        </motion.h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: 0.8 }}
          className="grid grid-cols-2 gap-4 mt-6"
        >
          {notDoneTryouts.map((tryout, index) => (
            <motion.div
              key={tryout.tryout_id}
              custom={index}
              variants={cardVariants}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.2)",
                transition: { type: "spring", stiffness: 300 },
              }}
              className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden"
              style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="absolute top-0 left-0 w-20 h-20 bg-gray-300 rounded-br-full opacity-50"></div>
              <motion.div variants={itemVariants} className="z-10">
                <span className="bg-[#1E3A5F] text-white text-xs font-bold px-2 py-1 rounded-full mb-1 inline-block">
                  EP.{tryout.tryout_id}
                </span>
                <p className="text-sm font-medium mt-1">{tryout.tryout_name}</p>
              </motion.div>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "#2E4A7F",
                  boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => navigate(`/siswa/tryout/${tryout.tryout_id}`)}
                className="bg-gradient-to-r from-[#1E3A5F] to-[#2E4A7F] text-white px-5 py-2 rounded-xl text-sm font-medium z-10"
                style={{ boxShadow: "0 4px 6px -1px rgba(30, 58, 95, 0.3)" }}
              >
                Lihat
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

