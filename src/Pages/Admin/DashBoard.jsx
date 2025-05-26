import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function Dashboard() {
  const navigate = useNavigate();
  // States for API data and error handling
  const [adminData, setAdminData] = useState({ admin_name: "" });
  const [countTS, setCountTS] = useState({ total_students: 0, total_teachers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Fetch data from the backend endpoint using axiosInstance
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching admin dashboard data...");
        const response = await axiosInstance.get("/API/admin/dashboard");
        console.log("Dashboard API Response:", response.data);

        // Validate that the response structure matches what we expect
        if (response.data && response.data.adminData && response.data.countTS) {
          setAdminData(response.data.adminData);
          setCountTS(response.data.countTS);
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error("Format data dashboard tidak sesuai harapan.");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        
        // Handle specific error cases
        if (err.response) {
          switch (err.response.status) {
            case 401:
              setError("Sesi Anda telah berakhir. Silakan login kembali.");
              navigate('/login');
              break;
            case 403:
              setError("Anda tidak memiliki akses ke halaman ini.");
              navigate('/login');
              break;
            case 404:
              setError("Endpoint dashboard tidak ditemukan.");
              break;
            case 500:
              setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
              break;
            default:
              setError(err.response.data?.message || "Terjadi kesalahan saat memuat data dashboard.");
          }
        } else if (err.request) {
          // Network error
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setTimeout(fetchData, 2000 * (retryCount + 1)); // Exponential backoff
            return;
          }
          setError("Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.");
        } else {
          setError(err.message || "Terjadi kesalahan saat memuat data dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, retryCount]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  // Display a loading indicator while data is fetching.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Display an error message if fetching data fails.
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex bg-[#f5f0e6] w-screen h-screen fixed inset-0 overflow-hidden"
    >
      {/* Sidebar */}
      <motion.div
        variants={itemVariants}
        className="w-64 bg-white p-6 shadow-lg h-full border-r border-gray-200"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-[#2f4a64]">LuLuSin</h1>
          <p className="text-sm text-gray-500">Education Academy</p>
        </motion.div>

        <nav className="mt-6">
          <ul className="space-y-4">
            <Link to="/admin/dashboard">
              <motion.li
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 text-gray-700 hover:text-[#2f4a64] cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">📊</span>
                <span className="font-medium">Dashboard</span>
              </motion.li>
            </Link>

            <Link to="/admin/detailguru">
              <motion.li
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 text-gray-700 hover:text-[#2f4a64] cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">👨‍🏫</span>
                <span className="font-medium">Data Guru</span>
              </motion.li>
            </Link>

            <Link to="/admin/detailmurid">
              <motion.li
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 text-gray-700 hover:text-[#2f4a64] cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">👩‍🎓</span>
                <span className="font-medium">Data Murid</span>
              </motion.li>
            </Link>
          </ul>
        </nav>
      </motion.div>

      {/* Content */}
      <div className="flex-1 p-8 h-full overflow-auto">
        {/* Navbar */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#2f4a64]">Dashboard</h2>
          <Link to="/login">
            <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
              {/* Logout Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              Logout
            </motion.button>
          </Link>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white p-8 rounded-xl shadow-lg w-full h-full flex flex-col justify-center items-center"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-[#2f4a64]">
              Selamat Datang, {adminData.admin_name}
            </h3>
            <p className="text-gray-600 mt-2">Admin LuLusin</p>
          </motion.div>

          <div className="mt-6 flex gap-8 w-full max-w-6xl flex-wrap justify-center">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-[#2f4a64] p-8 rounded-xl shadow-lg text-center flex-1 min-w-[250px] transition-all duration-300 hover:shadow-xl"
            >
              <p className="text-gray-200 font-semibold mb-2">Guru Terdaftar</p>
              <p className="text-4xl text-white font-bold">{countTS.total_teachers}</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-[#2f4a64] p-8 rounded-xl shadow-lg text-center flex-1 min-w-[250px] transition-all duration-300 hover:shadow-xl"
            >
              <p className="text-gray-200 font-semibold mb-2">Murid Terdaftar</p>
              <p className="text-4xl text-white font-bold">{countTS.total_students}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
