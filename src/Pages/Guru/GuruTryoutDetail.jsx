"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axiosInstance from "../../api/axiosInstance" // Pastikan path ini benar

const GuruTryoutDetail = () => {
  const { id } = useParams() // Ambil ID dari URL
  const navigate = useNavigate()

  // State untuk data dinamis, loading, dan error
  const [tryoutData, setTryoutData] = useState(null) // Struktur awal null
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTryoutDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log(`Fetching tryout detail for ID: ${id}`)
        const response = await axiosInstance.get(`/API/teacher/tryout/${id}`)
        console.log("Tryout Detail API Response:", response.data)

        // Improved error handling for empty or invalid response
        if (!response.data) {
          throw new Error("Data tidak ditemukan dari server")
        }

        // Get the data from response
        let apiData = response.data.result || response.data;
        
        if (!apiData) {
          throw new Error("Format data dari server tidak sesuai yang diharapkan")
        }

        // Create the formatted data structure
        const formattedData = {
          tryout_name: apiData.tryout_name || "Nama Tryout Tidak Ditemukan",
          status: apiData.status || "Hide",
          subject_categories: apiData.subject_categories || []
        };

        // Log status yang diterima untuk debugging
        console.log("Status yang diterima dari API:", apiData.status);
        console.log("Status yang disimpan ke state:", formattedData.status);

        // Validate if we have the required data
        if (!formattedData.tryout_name || !Array.isArray(formattedData.subject_categories)) {
          throw new Error("Data tryout tidak lengkap");
        }

        console.log("Formatted Tryout Data:", formattedData);
        setTryoutData(formattedData);
        setError(null);

      } catch (err) {
        console.error("Error fetching or processing tryout detail:", err)
        let errorMessage = err.response?.data?.message || err.message || "Gagal memuat detail tryout."
        if (err.response?.status === 404) {
          errorMessage = "Data tryout tidak ditemukan."
        } else if (err.response?.status === 401) {
          errorMessage = "Sesi anda telah berakhir. Silakan login kembali."
          navigate('/login')
        }
        setError(errorMessage)
        setTryoutData(null);
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTryoutDetail()
    } else {
      setError("ID Tryout tidak valid.")
      setLoading(false)
    }

  }, [id, navigate])

  // Fungsi untuk handle publish (contoh, perlu implementasi API)
  const handlePublish = async () => {
    if (!tryoutData) return;
    
    console.log("Status tryout saat ini:", tryoutData.status, typeof tryoutData.status);
    
    // Tentukan status baru berdasarkan status saat ini
    // Pastikan memeriksa status dengan case insensitive dan whitespace handling
    const currentStatus = String(tryoutData.status || "").trim();
    let newStatus;
    
    if (currentStatus.toLowerCase() === 'show') {
      newStatus = 'Hide';
      console.log('Status saat ini "Show", akan diubah menjadi "Hide"');
    } else {
      newStatus = 'Show';
      console.log('Status saat ini bukan "Show", akan diubah menjadi "Show"');
    }
    
    console.log(`Status saat ini: ${currentStatus}, akan diubah menjadi: ${newStatus}`);
    
    try {
      // Kirim permintaan ke API untuk mengubah status
      console.log(`Mengirim permintaan ke API /API/teacher/tryout/${id}/update_status dengan body:`, { status: newStatus });
      
      const response = await axiosInstance.patch(`/API/teacher/tryout/${id}/update_status`, {
        status: newStatus
      });
      
      console.log('Respons dari API:', response);
      
      if (response.status === 200) {
        // Jika API berhasil, perbarui state lokal
        console.log(`Berhasil mengubah status dari ${currentStatus} menjadi ${newStatus}`);
        setTryoutData(prev => ({...prev, status: newStatus }));
      } else {
        throw new Error(`Gagal mengubah status: ${response.data.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMessage = err.response?.data?.message || err.message || "Gagal mengubah status tryout";
      // Menghapus alert error
      // alert(`Gagal mengubah status: ${errorMessage}`);
    }
  }

  // Tampilan Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#f5f0e8] p-6 min-h-screen w-full">
        <div>Memuat detail tryout...</div>
      </div>
    )
  }

  // Tampilan Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#f5f0e8] p-6 min-h-screen w-full">
        <div className="text-red-600 bg-red-100 p-4 rounded-lg">Error: {error}</div>
      </div>
    )
  }

  // Tampilan jika data tidak ada (setelah loading selesai tanpa error)
  if (!tryoutData) {
      return (
        <div className="flex flex-col items-center justify-center bg-[#f5f0e8] p-6 min-h-screen w-full">
          <div>Data tryout tidak ditemukan.</div>
        </div>
      )
  }

  // Tampilan Utama dengan Data Dinamis
  return (
    <div className="flex flex-col items-center bg-[#f5f0e8] p-6 min-h-screen w-full">
      <motion.div
        className="w-full max-w-3xl px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Judul Tryout */}
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-8 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
        >
          {tryoutData.tryout_name}
        </motion.h1>

        {/* Status Tryout */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            tryoutData.status === 'Show' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            Status: {tryoutData.status === 'Show' ? 'Dipublikasikan' : 'Disembunyikan'}
          </div>
        </motion.div>

        {/* Container untuk semua kategori */}
        <div className="w-full space-y-6">
          {/* Iterasi melalui setiap kategori */}
          {tryoutData.subject_categories && tryoutData.subject_categories.map((category, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-[#2e4460] text-white px-6 py-3">
                <h2 className="text-lg font-semibold">{category.subject_category}</h2>
              </div>
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Nama Subjek</th>
                    <th scope="col" className="px-6 py-3 text-center">Soal Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  {category.items && category.items.map((item, itemIndex) => (
                    <tr 
                      key={itemIndex} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (!item.id_subject) {
                          return;
                        }

                        if (!id) {
                          return;
                        }

                        try {
                          const path = `/guru/tryout/${id}/${item.id_subject}`;
                          window.location.href = path;
                        } catch (error) {
                          console.error("Navigation error:", error);
                        }
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.subject_name || "Untitled Subject"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.soal_dibuat || '0'}
                      </td>
                    </tr>
                  ))}
                  {(!category.items || category.items.length === 0) && (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data untuk kategori ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          ))}

          {(!tryoutData.subject_categories || tryoutData.subject_categories.length === 0) && (
            <div className="text-center text-gray-500 py-4">
              Tidak ada data kategori yang tersedia
            </div>
          )}
        </div>

        {/* Tombol Publish/Unpublish */}
        <div className="flex justify-end mt-8">
          {console.log("Status saat render tombol:", tryoutData.status)}
          <motion.button
            onClick={handlePublish}
            className={`${
              String(tryoutData.status || "").trim().toLowerCase() === 'show' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-200`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Tampilkan teks tombol berdasarkan status saat ini dengan penanganan yang lebih robust */}
            {String(tryoutData.status || "").trim().toLowerCase() === 'show' 
              ? 'Sembunyikan Tryout' 
              : 'Publikasikan Tryout'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

// Komponen baru untuk menampilkan tabel per section
const SectionTable = ({ title, items }) => {
  // Pastikan items adalah array sebelum mapping
  if (!Array.isArray(items)) {
    console.warn(`Invalid items passed to SectionTable for title: ${title}. Expected array.`);
    return null; // Atau tampilkan pesan error/placeholder
  }
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <table className="w-full text-sm text-left text-gray-700">
        {/* Header Tabel */}
        <thead className="text-xs text-white uppercase bg-[#2e4460]">
          <tr>
            {/* Judul Section di header kolom pertama */}
            <th scope="col" className="px-6 py-3 font-semibold">
              {title}
            </th>
            <th scope="col" className="px-6 py-3 text-center font-semibold">Soal Dibuat</th>
          </tr>
        </thead>
        {/* Body Tabel */}
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
              {/* Nama Subtes */}
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {item.name}
              </th>
              {/* Jumlah Soal Dibuat */}
              <td className="px-6 py-4 text-center">{item.created ?? 'N/A'}</td>
            </tr>
          ))}
          {items.length === 0 && (
             <tr>
                <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data untuk bagian ini.
                </td>
             </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default GuruTryoutDetail

