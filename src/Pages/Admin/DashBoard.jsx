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
      <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-lg text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  // Display an error message if fetching data fails.
  if (error) {
    return (
      <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-blue-900">LuLuSin</h1>
        <p className="text-xs text-gray-500">Education Academy</p>
        <nav className="mt-6">
          <ul className="space-y-4">
            <li className="flex items-center space-x-2 text-gray-700 hover:text-blue-900 cursor-pointer">
              <Link to="/admin/dashboard">
                <span className="text-lg">📊</span>
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="flex items-center space-x-2 text-gray-700 hover:text-blue-900 cursor-pointer">
              <Link to="/admin/detailguru">
                <span className="text-lg">👨‍🏫</span>
                <span>Guru</span>
              </Link>
            </li>
            <li className="flex items-center space-x-2 text-gray-700 hover:text-blue-900 cursor-pointer">
              <Link to="/admin/detailmurid">
                <span className="text-lg">👩‍🎓</span>
                <span>Murid</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-gray-100 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Dashboard</h1>
          <Link to="/login">
            <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
              {/* Logout Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              Logout
            </button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-blue-900">
              Selamat Datang, {adminData.admin_name}
            </h3>
            <p className="text-gray-600 mt-2">Admin LuLusin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-900 p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-200 font-semibold mb-2">Guru Terdaftar</p>
              <p className="text-4xl text-white font-bold">{countTS.total_teachers}</p>
            </div>

            <div className="bg-blue-900 p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-200 font-semibold mb-2">Murid Terdaftar</p>
              <p className="text-4xl text-white font-bold">{countTS.total_students}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
