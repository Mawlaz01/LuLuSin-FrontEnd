"use client";

import { FaUserCheck, FaClipboardList, FaBook } from "react-icons/fa";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import React from "react";
import { Link } from "react-router-dom";

export default function SiswaLandingPage() {
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });

  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

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
  };

  const stepVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  return (
    <div className="flex flex-col min-h-screen w-screen">
      {/* === Navbar === */}
      <nav className="bg-[#1B2B44] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-white">LuLuSin</span>
            <span className="text-xs text-gray-300 -mt-1">Education Academi</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex gap-8 items-center text-white font-semibold text-lg">
            <a href="#home" className="hover:text-gray-300 transition">Home</a>
            <a href="#about" className="hover:text-gray-300 transition">About</a>
            <a href="#tutorial" className="hover:text-gray-300 transition">Tutorial</a>
            <Link
              to="/login"
              className="bg-[#324c76] hover:bg-[#3a5785] transition px-4 py-2 rounded-full font-bold shadow"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* === Main Content === */}
      <main className="flex-grow w-full bg-amber-50">
        <motion.section
          id="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center max-w-6xl mx-auto bg-[#F5EDE4] p-10 rounded-lg"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="md:w-1/2 text-[#1B2B44]"
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="font-bold text-3xl md:text-4xl leading-tight"
            >
              Bersiaplah Menempuh Jenjang Pendidikan Yang Lebih Tinggi
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="md:w-1/2 flex justify-center"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              src="/santoso tk lulus kuliah.png"
              alt="Education Illustration"
              className="w-80"
            />
          </motion.div>
        </motion.section>

        <section id="about" className="relative bg-[#1B2B44] py-10 px-6 mt-[-40px] rounded-t-2xl">
          <motion.div
            ref={featuresRef}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {[ 
              {
                title: " Learning Untuk Lulus Seleksi Nasional",
                text: "Persiapan SNBT kini lebih mudah dan terarah! Dengan materi lengkap, tryout interaktif, serta analisis skor yang akurat, Lulusin siap membantumu melewati seleksi masuk perguruan tinggi dengan percaya diri.",
              },
              {
                icon: <FaUserCheck className="text-4xl text-white mb-4" />,
                title: "Learning Untuk Lulus Seleksi Nasional",
                text: "Persiapan SNBT kini lebih mudah dan terarah! Dengan materi lengkap, tryout interaktif, serta analisis skor yang jelas, kamu siap menentukan strategi terbaik.",
              },
              {
                icon: <FaClipboardList className="text-4xl text-white mb-4" />,
                title: "Seluruh Materi SNBT",
                text: "Belajar lebih mudah dengan kurikulum lengkap yang dirancang untuk menghadapi SNBT dengan percaya diri.",
              },
              {
                icon: <FaBook className="text-4xl text-white mb-4" />,
                title: "Tryout Interaktif & Pencatatan Skor",
                text: "Latih kemampuanmu dengan tryout SNBT dan pantau perkembangan skor setiap sesi.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="bg-[#23395d] p-6 rounded-lg shadow-lg text-center text-white"
              >
                {item.icon && (
                  <motion.div
                    initial={{ rotateY: 0 }}
                    whileHover={{ rotateY: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    {item.icon}
                  </motion.div>
                )}
                <motion.h3
                  variants={itemVariants}
                  className="font-bold text-lg"
                >
                  {item.title}
                </motion.h3>
                <motion.p variants={itemVariants} className="text-sm mt-2">
                  {item.text}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>

          <div id="tutorial" className="bg-[#1B2B44] py-10 px-6 text-white">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center text-lg font-semibold mb-4"
            >
              Tata cara penggunaan aplikasi
            </motion.h3>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="border-t border-gray-400 mb-4"
            />
            <motion.div
              ref={stepsRef}
              initial="hidden"
              animate={stepsInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto"
            >
              {[
                {
                  title: "Registrasi Akun",
                  desc: "Daftarkan diri kamu dengan mengisi data yang diperlukan untuk membuat akun di aplikasi LuLuSin."
                },
                {
                  title: "Login ke Aplikasi",
                  desc: "Masuk ke aplikasi menggunakan email dan password yang sudah didaftarkan."
                },
                {
                  title: "Pilih Menu Tryout",
                  desc: "Setelah login, pilih menu tryout SNBT yang tersedia di dashboard."
                },
                {
                  title: "Pilih Paket Soal",
                  desc: "Pilih paket soal tryout yang ingin kamu kerjakan sesuai kebutuhanmu."
                },
                {
                  title: "Kerjakan Soal",
                  desc: "Mulai kerjakan soal tryout sesuai waktu yang telah ditentukan."
                },
                {
                  title: "Kumpulkan Jawaban",
                  desc: "Setelah selesai, kumpulkan jawaban untuk mendapatkan hasil penilaian."
                },
                {
                  title: "Lihat Hasil & Analisis Skor",
                  desc: "Lihat hasil tryout dan analisis skor untuk mengetahui kelebihan dan kekuranganmu."
                },
                {
                  title: "Ulangi Tryout & Tingkatkan Skor",
                  desc: "Ulangi tryout untuk memperbaiki skor dan pantau perkembangan kemampuanmu."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={stepVariants}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#3A5785",
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  className="bg-[#2E4568] h-32 rounded-lg shadow-md flex flex-col justify-center items-center p-3 text-center"
                >
                  <span className="font-bold text-white text-base mb-1">{item.title}</span>
                  <span className="text-xs text-gray-200">{item.desc}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <footer>
              <motion.footer
                className="bg-[#1B2B44] text-white p-6 mt-8 w-full text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start">
                  <div className="mb-4 md:mb-0">
                    <img
                      src="/santoso tk lulus kuliah.png"
                      alt="Logo"
                      className="w-16 h-16 mb-2"
                    />
                    <h4 className="font-bold text-lg">LuLuSin</h4>
                    <p className="text-gray-300">Education Academy</p>
                    <p className="text-gray-400">Learning Untuk Lulus Seleksi Nasional</p>
                  </div>
                  <div className="mb-4 md:mb-0">
                    <p>Jl. Raya Lenteng No.km, RW.2,</p>
                    <p>Aredake, Batuan, Kec. Batuan,</p>
                    <p>Kabupaten Sumenep, Jawa Timur 80582</p>
                  </div>
                  <div>
                    <p className="font-semibold">Hubungi Kami :</p>
                    <p>
                      Email: <span className="text-gray-300">dewaruci393@gmail.com</span>
                    </p>
                    <p>
                      Kontak: <span className="text-gray-300">+62 812-3516-3528</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center text-gray-400 text-xs">
                  © 2025 LuLuSin. All Rights Reserved PT. Mesir Timur Tengah
                </div>
              </motion.footer>
        </footer>
      </main>
    </div>
  );
}
