import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const DetailGuru = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    teacher_name: "",
    NUPTK: "",
    email: "",
    password: ""
  });

  // Fetch teachers data
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/API/admin/teacher");
      // Mapping jika field dari API berbeda
      const mapped = response.data.map((t) => ({
        teacher_id: t.teacher_id || t.id || t.ID,
        teacher_name: t.teacher_name || t.nama || t.name,
        NUPTK: t.NUPTK || t.nuptk,
        email: t.email
      }));
      setTeachers(mapped);
    } catch (err) {
      console.error("Error fetching teachers:", err);
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
            setError(err.response.data?.message || "Terjadi kesalahan saat memuat data guru.");
        }
      } else {
        setError("Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/API/admin/teacher/store", {
        teacher_name: formData.teacher_name,
        NUPTK: formData.NUPTK,
        email: formData.email
      });
      setShowAddModal(false);
      setFormData({ teacher_name: "", NUPTK: "", email: "", password: "" });
      await fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambahkan guru. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Edit teacher
  const handleEditTeacher = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.patch(`/API/admin/teacher/update/${selectedTeacher.teacher_id}`, formData);
      setShowEditModal(false);
      setSelectedTeacher(null);
      setFormData({ teacher_name: "", NUPTK: "", email: "", password: "" });
      await fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengupdate guru. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher
  const handleDelete = async (teacherId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus guru ini?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/API/admin/teacher/delete/${teacherId}`);
      await fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus guru. Silakan coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      teacher_name: teacher.teacher_name,
      NUPTK: teacher.NUPTK,
      email: teacher.email,
      password: ""
    });
    setShowEditModal(true);
  };

  if (loading && !showAddModal && !showEditModal) {
    return (
      <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-lg text-gray-600">Memuat data guru...</p>
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
          <h1 className="text-2xl font-bold text-blue-600">Akun Guru</h1>
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
          {/* Tombol Tambah Guru di atas tabel, kanan */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              {/* Plus Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Guru
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-3 text-left text-blue-700 font-semibold">Nama</th>
                <th className="p-3 text-left text-blue-700 font-semibold">NUPTK</th>
                <th className="p-3 text-left text-blue-700 font-semibold">Email</th>
                <th className="p-3 text-left text-blue-700 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.teacher_id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-3 text-blue-900">{teacher.teacher_name}</td>
                  <td className="p-3 text-blue-900">{teacher.NUPTK}</td>
                  <td className="p-3 text-blue-900">{teacher.email}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                      >
                        {/* Pencil Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6m2-2l6-6" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.teacher_id)}
                        disabled={deleteLoading}
                        className={`flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition ${
                          deleteLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {/* Trash Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        {deleteLoading ? 'Menghapus...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Tambah Guru</h2>
            <form onSubmit={handleAddTeacher}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={formData.teacher_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">NUPTK</label>
                <input
                  type="text"
                  name="NUPTK"
                  value={formData.NUPTK}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Guru</h2>
            <form onSubmit={handleEditTeacher}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={formData.teacher_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">NUPTK</label>
                <input
                  type="text"
                  name="NUPTK"
                  value={formData.NUPTK}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Password Baru</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailGuru;
