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
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Tambah Guru
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left text-blue-600">Nama</th>
                <th className="p-3 text-left text-blue-600">NUPTK</th>
                <th className="p-3 text-left text-blue-600">Email</th>
                <th className="p-3 text-left text-blue-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, idx) => (
                <tr key={teacher.teacher_id || idx} className="border-b">
                  <td className="p-3 text-blue-600">{teacher.teacher_name}</td>
                  <td className="p-3 text-blue-600">{teacher.NUPTK}</td>
                  <td className="p-3 text-blue-600">{teacher.email}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.teacher_id)}
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

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Tambah Guru</h2>
            <form onSubmit={handleAddTeacher}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={formData.teacher_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <h2 className="text-xl font-bold text-blue-900 mb-4">Edit Guru</h2>
            <form onSubmit={handleEditTeacher}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={formData.teacher_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
