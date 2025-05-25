import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const DetailMurid = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch students data
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/API/admin/student");
      console.log('API students:', response.data); // Debug log
      // Mapping jika field dari API berbeda
      const mapped = response.data.map((s) => ({
        student_id: s.student_id || s.id || s.ID,
        student_name: s.student_name || s.nama || s.name,
        NISN: s.NISN || s.nim || s.NIM,
        email: s.email
      }));
      setStudents(mapped);
    } catch (err) {
      console.error("Error fetching students:", err);
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
          default:
            setError(err.response.data?.message || "Terjadi kesalahan saat memuat data siswa.");
        }
      } else {
        setError("Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (studentId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/API/admin/student/delete/${studentId}`);
      // Refresh the students list after successful deletion
      await fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
      alert(err.response?.data?.message || "Gagal menghapus siswa. Silakan coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-lg text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-blue-600">Akun Murid</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left text-blue-600">Nama</th>
                <th className="p-3 text-left text-blue-600">NIM</th>
                <th className="p-3 text-left text-blue-600">Email</th>
                <th className="p-3 text-left text-blue-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-3 text-blue-600">{student.student_name}</td>
                  <td className="p-3 text-blue-600">{student.NISN}</td>
                  <td className="p-3 text-blue-600">{student.email}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(student.student_id || student.NISN || student.email)}
                      disabled={deleteLoading}
                      className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ${
                        deleteLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deleteLoading ? 'Menghapus...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailMurid;