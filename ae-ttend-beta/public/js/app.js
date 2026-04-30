import { db } from "./core/Database.js";
import {
  AdminLayout,
  StudentLayout,
  LoginLayout,
  profileLayout,
} from "./views/Layouts.js";
import {
  renderAdminUsers,
  renderAdminAttendance,
  renderAdminDashboard,
  renderAdminLocation,
  renderAdminAnnouncements,
  attachAdminAnnouncementEvents,
  attachAdminLocationEvents,
} from "./views/AdminViews.js";
import {
  renderStudentDashboard,
  attachStudentEvents,
} from "./views/StudentViews.js";
import { initLayoutEvents, RegisterFaceLayout } from "./views/Layouts.js";
import {
  renderStudentAttendance,
  initCalendar,
  initAttendanceEvents,
  renderStudentAnnouncement,
  attachFaceRegistrationEvents,
  stopCameraAndDetection,
} from "./views/StudentViews.js";

window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  e.returnValue = "";
});

const appContainer = document.getElementById("app");

function navigate(route) {
  if (typeof stopCameraAndDetection === "function") {
    stopCameraAndDetection();
  }
  appContainer.innerHTML = "";

  if (route === "login") {
    db.state.currentUser = null;
    appContainer.innerHTML = LoginLayout();
    attachLoginEvents();
    return;
  }

  const user = db.state.currentUser;
  if (!user) {
    navigate("login");
    return;
  }

  if (user.payload.role === "admin") {
    if (route === "admin-dashboard") {
      appContainer.innerHTML = AdminLayout(renderAdminDashboard(), route, user);
      attachAdminDashboardEvents();
      initLayoutEvents();
    } else if (route === "admin-users") {
      appContainer.innerHTML = AdminLayout(renderAdminUsers(), route, user);
      attachAdminUserEvents();
      initLayoutEvents();
    } else if (route === "admin-attendance") {
      appContainer.innerHTML = AdminLayout(
        renderAdminAttendance(),
        route,
        user,
      );
      attachAdminAttendanceEvents();
      initLayoutEvents();
    } else if (route === "admin-locations") {
      appContainer.innerHTML = AdminLayout(renderAdminLocation(), route, user);
      attachAdminLocationEvents();
      initLayoutEvents();
    } else if (route === "admin-announcements") {
      appContainer.innerHTML = AdminLayout(
        renderAdminAnnouncements(),
        route,
        user,
      );
      attachAdminAnnouncementEvents();
      initLayoutEvents();
    } else {
      appContainer.innerHTML = AdminLayout(
        "<h2>404 - Page Not Found</h2>",
        route,
        user,
      );
    }
  } else if (user.payload.role === "student") {
    if (route === "student-dashboard" || route === "overview") {
      appContainer.innerHTML = StudentLayout(
        renderStudentDashboard(user),
        user,
        "overview",
      );
      initLayoutEvents(user);
      initCalendar();
    } else if (route === "presensi") {
      appContainer.innerHTML = StudentLayout(
        renderStudentAttendance(user),
        user,
        "presensi",
      );
      initLayoutEvents(user);
      initAttendanceEvents(user);
    } else if (route === "announcement") {
      const currentTotalAnnouncements = db.announcements
        ? db.announcements.length
        : 0;
      localStorage.setItem(
        "ae_read_announcements_count",
        currentTotalAnnouncements,
      );

      appContainer.innerHTML = StudentLayout(
        renderStudentAnnouncement(),
        user,
        "announcement",
      );
      initLayoutEvents(user);
    } else if (route === "register-face") {
      appContainer.innerHTML = RegisterFaceLayout(user);
      initLayoutEvents(user);
      attachFaceRegistrationEvents(user);
    } else if (route === "profile") {
      appContainer.innerHTML = profileLayout(user);
      initLayoutEvents();
    } else {
      navigate("overview");
    }
  }
}

function updateActiveMenu(menuId) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  const activeLink = document.getElementById(`nav-${menuId}`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

function attachLoginEvents() {
  const form = document.getElementById("form-login");
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("login-password");
  const eyeIcon = document.getElementById("eye-icon");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nimInput = document.getElementById("login-nim").value;
      const passwordInput = document.getElementById("login-password").value;

      const userNode = db.users.findWhere("nim", nimInput);

      if (userNode) {
        if (userNode.payload.password === passwordInput) {
          db.state.currentUser = userNode;
          if (userNode.payload.role === "admin") {
            navigate("admin-dashboard");
          } else {
            navigate("student-dashboard");
          }
        } else {
          alert("Password salah!");
        }
      } else {
        alert("NIM/ID tidak ditemukan dalam Node Linked List!");
      }
    });
  }
}

function attachAdminDashboardEvents() { }

let isAdminUserEventsInitialized = false;
let nimTerpilih = null;

function attachAdminUserEvents() {

  // =========================================================================
  // LOGIKA REAL-TIME SEARCH, FILTER, SORT & EXPORT PDF
  // =========================================================================
  const searchInput = document.getElementById('searchUser');
  const filterRole = document.getElementById('filterRole');
  const filterClass = document.getElementById('filterClass');
  const sortUser = document.getElementById('sortUser');
  const tableBody = document.getElementById('userTableBody');
  const btnExportPDF = document.getElementById('btnExportPDF');

  // Fungsi Render Ulang Table Body
  function updateTableUI() {
    let usersArray = [];
    let current = db.users.head;
    while (current) {
      usersArray.push(current.payload);
      current = current.next;
    }

    const searchTerm = searchInput.value.toLowerCase();
    const roleTerm = filterRole.value;
    const classTerm = filterClass.value;
    const sortTerm = sortUser.value;

    // 1. FILTERING
    let filteredUsers = usersArray.filter(user => {
      const matchSearch = user.nama.toLowerCase().includes(searchTerm) || user.nim.toLowerCase().includes(searchTerm);
      const matchRole = roleTerm === 'all' || user.role === roleTerm;
      const matchClass = classTerm === 'all' || user.kelas === classTerm;
      return matchSearch && matchRole && matchClass;
    });

    // 2. SORTING
    filteredUsers.sort((a, b) => {
      if (sortTerm === 'name_asc') return a.nama.localeCompare(b.nama);
      if (sortTerm === 'name_desc') return b.nama.localeCompare(a.nama);
      if (sortTerm === 'class_asc') return (a.kelas || "").localeCompare(b.kelas || "");
      if (sortTerm === 'class_desc') return (b.kelas || "").localeCompare(a.kelas || "");
      return 0;
    });

    // 3. RE-RENDER HTML
    let newRows = '';
    if (filteredUsers.length === 0) {
      newRows = `<tr><td colspan="4" class="text-center p-8 text-red-400 font-bold bg-red-50/50"><i class="fas fa-search-minus text-2xl mb-2 block"></i> Data tidak ditemukan</td></tr>`;
    } else {
      filteredUsers.forEach((user, index) => {
        newRows += `
                <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
                    <td class="p-4 text-sm text-gray-600">${index + 1}</td>
                    <td class="p-4 text-sm font-semibold text-gray-700">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-full bg-[#3b8ea5]/10 text-[#3b8ea5] flex items-center justify-center font-bold overflow-hidden border border-[#3b8ea5]/20">
                                <img src="${user.userPic ? (user.userPic.startsWith('public') ? user.userPic : 'public/images/userPics/' + user.userPic) : 'public/images/userPics/default.png'}" alt="Pic" class="w-full h-full object-cover">
                            </div>
                            <div class="text-gray-800 font-bold flex flex-col">
                                ${user.nama}
                                <div class="text-[11px] text-gray-500 font-medium mt-0.5"><span class="font-mono text-[#3b8ea5]">${user.nim}</span> | ${user.kelas}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 text-center">
                        <span class="px-3 py-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} rounded-full text-[10px] font-extrabold uppercase tracking-widest">${user.role}</span>
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex justify-center gap-3 items-center">
                            <button class="btn-view-user text-slate-400 hover:text-pasifik hover:scale-110 transition-transform" data-id="${user.nim}"><i class="fas fa-eye text-lg pointer-events-none"></i></button>
                            <button class="btn-edit-user text-slate-400 hover:text-langit hover:scale-110 transition-transform" data-id="${user.nim}"><i class="fas fa-edit text-lg pointer-events-none"></i></button>
                            <button class="btn-del-user text-red-400 hover:text-red-600 hover:scale-110 transition-transform" data-id="${user.nim}"><i class="fas fa-trash text-lg pointer-events-none"></i></button>
                        </div>
                    </td>
                </tr>`;
      });
    }
    tableBody.innerHTML = newRows;
  }

  // 4. PASANG EVENT LISTENER
  if (searchInput) searchInput.addEventListener('input', updateTableUI);
  if (filterRole) filterRole.addEventListener('change', updateTableUI);
  if (filterClass) filterClass.addEventListener('change', updateTableUI);
  if (sortUser) sortUser.addEventListener('change', updateTableUI);

  // 5. EXPORT TO PDF
  if (btnExportPDF) {
    btnExportPDF.addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'pt', 'a4');

      // Header Instansi
      doc.setFontSize(22);
      doc.setTextColor(45, 114, 143); // Warna pasifik #2d728f
      doc.setFont("helvetica", "bold");
      doc.text("AE-ttend System", 40, 40);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Direktori Data Pengguna (Admin & Mahasiswa)", 40, 55);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} Pukul: ${new Date().toLocaleTimeString('id-ID')}`, 40, 70);

      doc.setDrawColor(200, 200, 200);
      doc.line(40, 80, 555, 80); // Garis horizontal

      // Siapkan Data Tabel yang saat ini sedang Tampil/Di-filter
      let currentData = [];
      let curr = db.users.head;
      while (curr) { currentData.push(curr.payload); curr = curr.next; }

      // Re-apply filter untuk PDF
      const sTerm = searchInput.value.toLowerCase();
      const rTerm = filterRole.value;
      const cTerm = filterClass.value;

      let pdfData = currentData.filter(user => {
        const matchSearch = user.nama.toLowerCase().includes(sTerm) || user.nim.toLowerCase().includes(sTerm);
        const matchRole = rTerm === 'all' || user.role === rTerm;
        const matchClass = cTerm === 'all' || user.kelas === cTerm;
        return matchSearch && matchRole && matchClass;
      });

      // Format body untuk AutoTable
      const tableBodyData = pdfData.map((u, i) => [
        i + 1,
        u.nim,
        u.nama,
        u.kelas || "-",
        u.role.toUpperCase()
      ]);

      doc.autoTable({
        startY: 100,
        head: [['No', 'NIM / ID', 'Nama Lengkap', 'Kelas', 'Role']],
        body: tableBodyData,
        theme: 'grid',
        headStyles: { fillColor: [45, 114, 143], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 6 }
      });

      // Signature Admin di Bawah Kanan Tabel
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Bandung, ${new Date().toLocaleDateString('id-ID')}`, 400, finalY + 40);
      doc.text("Administrator Sistem AE-ttend", 400, finalY + 55);

      doc.setFont("helvetica", "bold");
      // Ambil nama admin yang sedang login
      const adminName = db.state.currentUser.payload.nama || "Admin AE-ttend";
      doc.text(adminName, 400, finalY + 110);

      doc.line(400, finalY + 112, 530, finalY + 112); // Garis TTD
      doc.setFont("helvetica", "normal");
      doc.text("NIP/NIM: " + db.state.currentUser.payload.nim, 400, finalY + 125);

      // Trigger Download
      doc.save(`Data_Users_${new Date().getTime()}.pdf`);
    });
  }

  // =========================================================================
  // (Kode modal Add, Delete, Edit, dan Event Delegasi kamu ditaruh di bawah sini)
  // ...
  // =========================================================================
  // LOGIKA MODAL ADD USER
  // =========================================================================
  const modalAdd = document.getElementById("modalAdd");
  const btnOpenAdd = document.getElementById("btnOpenModal");
  const btnCloseAdd = document.getElementById("btnCloseModal");
  const btnCancelAdd = document.getElementById("btnCancelModal");
  const formAdd = document.getElementById("formAddUser");

  // Toggle Buka Tutup Add
  if (btnOpenAdd) btnOpenAdd.onclick = () => modalAdd.classList.replace("hidden", "flex");
  const closeAddModal = () => {
    modalAdd.classList.replace("flex", "hidden");
    formAdd.reset();
    document.getElementById("previewContainer").classList.add("hidden");
  };
  if (btnCloseAdd) btnCloseAdd.onclick = closeAddModal;
  if (btnCancelAdd) btnCancelAdd.onclick = closeAddModal;

  // Toggle Role Add
  const roleBtns = document.querySelectorAll('.role-btn');
  const inputRole = document.getElementById('newRole');
  const mhsFields = document.getElementById('mhsFields');
  const inputNim = document.getElementById('newNim');
  const inputKelas = document.getElementById('newKelas');

  roleBtns.forEach(btn => {
    btn.onclick = () => {
      const role = btn.getAttribute('data-role');
      inputRole.value = role;
      roleBtns.forEach(b => {
        b.classList.remove('bg-white', 'text-pasifik', 'shadow-sm');
        b.classList.add('text-slate-500');
      });
      btn.classList.add('bg-white', 'text-pasifik', 'shadow-sm');
      btn.classList.remove('text-slate-500');

      if (role === 'admin') {
        mhsFields.classList.add('hidden');
        inputNim.required = false;
        inputKelas.required = false;
      } else {
        mhsFields.classList.remove('hidden');
        inputNim.required = true;
        inputKelas.required = true;
      }
    };
  });

  // Toggle Hide/Show Password
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = () => {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');
      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    };
  });

  // Preview Image Add
const newUserPic = document.getElementById("newUserPic");

if (newUserPic) {
    newUserPic.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // --- 1. Tampilkan Preview ke User ---
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgPreview = document.getElementById("imgPreview");
                const previewContainer = document.getElementById("previewContainer");
                
                if (imgPreview && previewContainer) {
                    imgPreview.src = event.target.result;
                    previewContainer.classList.remove("hidden");
                }
            };
            reader.readAsDataURL(file);

            // --- 2. Siapkan "Simulasi" Path untuk Database ---
            // Kita buat nama file berdasarkan NIM (atau timestamp jika NIM belum diisi)
            const inputNim = document.getElementById("newNim");
            const nim = inputNim && inputNim.value ? inputNim.value : Date.now();
            const extension = file.name.split('.').pop();
            
            // Nama file yang akan disimpan di database (sebagai referensi)
            const fileName = `user_${nim}.${extension}`;
            
            // Simpan nama file ini ke dalam atribut data agar bisa diambil saat form di-submit
            newUserPic.setAttribute("data-filename", fileName);
            
            console.log("File siap: " + fileName);
        }
    };
}
  // Submit Add Form
  if (formAdd) {
    formAdd.onsubmit = (e) => {
      e.preventDefault();
      const role = inputRole.value;
      const nama = document.getElementById("newNama").value;
      const password = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const file = newUserPic.files[0];

      if (password !== confirmPassword) return alert("Konfirmasi password tidak cocok!");

      let finalNim = role === 'admin' ? "ADM-" + Date.now().toString().slice(-4) : inputNim.value;
      let finalKelas = role === 'admin' ? "-" : inputKelas.value;
      let fullPath = "default.png";

      if (file) {
        const ext = file.name.split('.').pop().toLowerCase();
        fullPath = `user_${finalNim}.${ext}`;
      }

      if (db.users.findWhere("nim", finalNim)) {
        return alert(`NIM atau ID ${finalNim} sudah terdaftar di sistem.`);
      }

      db.users.insert(finalNim, {
        nim: finalNim,
        nama: nama,
        kelas: finalKelas,
        userPic: fullPath,
        role: role,
        password: password,
        faceCode: null
      });

      alert(`Berhasil mendaftarkan ${role}: ${nama}`);
      closeAddModal();
      navigate("admin-users");
    };
  }

  // =========================================================================
  // EVENT DELEGATION (EDIT, VIEW, DELETE)
  // =========================================================================
  if (!isAdminUserEventsInitialized) {
    let nimTerpilih = null;

    document.addEventListener("click", (e) => {

      // 1. DELETE
      const btnDel = e.target.closest(".btn-del-user");
      if (btnDel) {
        nimTerpilih = btnDel.getAttribute("data-id");
        const modalDelete = document.getElementById("modalDelete");
        if (modalDelete) {
          modalDelete.classList.remove("hidden");
          setTimeout(() => {
            modalDelete.classList.remove("opacity-0");
            modalDelete.querySelector('div').classList.replace('scale-95', 'scale-100');
          }, 10);
        }
      }

      if (e.target.id === "btn-confirm-delete") {
        if (nimTerpilih) {
          db.users.remove(nimTerpilih);
          document.getElementById("modalDelete").classList.add("hidden");
          navigate("admin-users");
        }
      }

      if (e.target.closest(".btn-close-delete")) {
        const modalDelete = document.getElementById("modalDelete");
        if (modalDelete) {
          modalDelete.classList.add("opacity-0");
          modalDelete.querySelector('div').classList.replace('scale-100', 'scale-95');
          setTimeout(() => modalDelete.classList.add("hidden"), 300);
        }
      }

      // 2. VIEW
      const btnView = e.target.closest(".btn-view-user");
      if (btnView) {
        const id = btnView.getAttribute("data-id");
        const targetUser = db.users.findWhere("nim", id);

        if (targetUser) {
          const u = targetUser.payload;
          document.getElementById('viewUserContent').innerHTML = `
                        <div class="flex flex-col items-center mb-6">
                            <div class="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-3">
                                <img src="${u.userPic ? (u.userPic.startsWith('public') ? u.userPic : 'public/images/userPics/' + u.userPic) : 'public/images/userPics/default.png'}" class="w-full h-full object-cover">
                            </div>
                            <h4 class="text-lg font-bold text-slate-800">${u.nama}</h4>
                            <span class="px-3 py-1 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} rounded-full text-[10px] font-bold uppercase mt-1">${u.role}</span>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between border-b border-slate-50 pb-2">
                                <span class="text-slate-500 font-semibold">NIM/ID</span>
                                <span class="text-slate-800 font-mono">${u.nim}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-50 pb-2">
                                <span class="text-slate-500 font-semibold">Kelas</span>
                                <span class="text-slate-800">${u.kelas || '-'}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-50 pb-2">
                                <span class="text-slate-500 font-semibold">Face Data</span>
                                <span class="${u.faceCode ? 'text-green-500' : 'text-red-500'} font-bold">
                                    ${u.faceCode ? '<i class="fas fa-check-circle"></i> Terdaftar' : '<i class="fas fa-times-circle"></i> Belum Terdaftar'}
                                </span>
                            </div>
                        </div>
                    `;
          const modalView = document.getElementById("modalViewUser");
          if (modalView) {
            modalView.classList.remove("hidden");
            setTimeout(() => {
              modalView.classList.remove("opacity-0");
              modalView.querySelector('div').classList.replace('scale-95', 'scale-100');
            }, 10);
          }
        }
      }

      if (e.target.closest(".btn-close-view")) {
        const modalView = document.getElementById("modalViewUser");
        if (modalView) {
          modalView.classList.add("opacity-0");
          modalView.querySelector('div').classList.replace('scale-100', 'scale-95');
          setTimeout(() => modalView.classList.add("hidden"), 300);
        }
      }

      // 3. EDIT (BUKA MODAL & POPULATE DATA)
      const btnEdit = e.target.closest(".btn-edit-user");
      if (btnEdit) {
        const id = btnEdit.getAttribute("data-id");
        const targetUser = db.users.findWhere("nim", id);

        if (targetUser) {
          const u = targetUser.payload;
          document.getElementById("edit_nim").value = u.nim;
          document.getElementById("edit_nama").value = u.nama;
          document.getElementById("edit_kelas").value = u.kelas || "-";
          document.getElementById("edit_role").value = u.role;

          const imgPreview = document.getElementById("edit_preview_foto");
          imgPreview.src = u.userPic ? (u.userPic.startsWith('public') ? u.userPic : 'public/images/userPics/' + u.userPic) : 'public/images/userPics/default.png';

          // Toggle Button UI untuk Edit Role
          const btnRoleAdmin = document.getElementById("btn_edit_role_admin");
          const btnRoleStudent = document.getElementById("btn_edit_role_student");
          const containerKelas = document.getElementById("container_edit_kelas");

          if (u.role === 'admin') {
            btnRoleAdmin.className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 bg-white text-pasifik shadow-sm";
            btnRoleStudent.className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 text-slate-500";
            containerKelas.classList.add("hidden");
          } else {
            btnRoleStudent.className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 bg-white text-pasifik shadow-sm";
            btnRoleAdmin.className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 text-slate-500";
            containerKelas.classList.remove("hidden");
          }

          const modalEdit = document.getElementById("modalEdit");
          if (modalEdit) {
            modalEdit.classList.remove("hidden");
            setTimeout(() => {
              modalEdit.classList.remove("opacity-0");
              modalEdit.querySelector('div').classList.replace('scale-95', 'scale-100');
            }, 10);
          }
        }
      }

      if (e.target.closest(".btn-close-edit")) {
        const modalEdit = document.getElementById("modalEdit");
        if (modalEdit) {
          modalEdit.classList.add("opacity-0");
          modalEdit.querySelector('div').classList.replace('scale-100', 'scale-95');
          setTimeout(() => modalEdit.classList.add("hidden"), 300);
        }
      }

      // Edit Image Preview Trigger
      if (e.target.id === "btn_edit_role_admin") {
        document.getElementById("edit_role").value = "admin";
        e.target.className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 bg-white text-pasifik shadow-sm";
        document.getElementById("btn_edit_role_student").className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 text-slate-500";
        document.getElementById("container_edit_kelas").classList.add("hidden");
      }

      if (e.target.id === "btn_edit_role_student") {
        document.getElementById("edit_role").value = "student";
        e.target.className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 bg-white text-pasifik shadow-sm";
        document.getElementById("btn_edit_role_admin").className = "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 text-slate-500";
        document.getElementById("container_edit_kelas").classList.remove("hidden");
      }
    });

    // Image Preview Edit Handler
    const editPicInput = document.getElementById("edit_input_file");
    if (editPicInput) {
      editPicInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => document.getElementById("edit_preview_foto").src = e.target.result;
          reader.readAsDataURL(file);
        }
      };
    }

    // Logika Simpan Hasil Edit
    document.addEventListener("submit", (e) => {
      if (e.target.id === "formEditUser") {
        e.preventDefault();
        const nim = document.getElementById("edit_nim").value;
        const userNode = db.users.findWhere("nim", nim);

        if (userNode) {
          userNode.payload.nama = document.getElementById("edit_nama").value;
          userNode.payload.role = document.getElementById("edit_role").value;
          userNode.payload.kelas = document.getElementById("edit_role").value === "admin" ? "-" : document.getElementById("edit_kelas").value;

          const fileInput = document.getElementById("edit_input_file");
          if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const ext = file.name.split('.').pop().toLowerCase();
            userNode.payload.userPic = `user_${nim}_updated.${ext}`;
          }

          document.getElementById("modalEdit").classList.add("hidden");
          navigate("admin-users");
        }
      }
    });

    isAdminUserEventsInitialized = true;
  }
}

function tutupModalDelete() {
  const modal = document.getElementById("modalDelete");
  if (!modal) return;
  modal.classList.add("opacity-0");
  const innerDiv = modal.querySelector("div");
  if (innerDiv) innerDiv.classList.replace("scale-100", "scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function tutupModalEdit() {
  const modal = document.getElementById("modalEdit");
  if (!modal) return;
  modal.classList.add("opacity-0");
  const innerDiv = modal.querySelector("div");
  if (innerDiv) innerDiv.classList.replace("scale-100", "scale-95");
  setTimeout(() => modal.classList.add("hidden"), 300);
}
let isAdminAttendanceEventsInitialized = false;

function attachAdminAttendanceEvents() {
  const btnGen = document.getElementById("btn-generate-absent");
  const btnCreate = document.getElementById("btn-create-attendance");
  const modalCreate = document.getElementById("modalCreateAttendance");
  const formCreate = document.getElementById("formCreateAttendance");
  const btnCloseCreate = document.getElementById("btnCloseCreateModal");
  const btnCancelCreate = document.getElementById("btnCancelCreate");

  const formEdit = document.getElementById("formEditAttendance");
  const btnCloseEdit = document.getElementById("btnCloseEditModal");
  const btnCancelEdit = document.getElementById("btnCancelEdit");

  // =========================================================================
  // 1. LOGIKA REAL-TIME SEARCH, FILTER, SORT & EXPORT PDF
  // =========================================================================
  const searchAtt = document.getElementById('searchAtt');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  const filterAttType = document.getElementById('filterAttType');
  const filterAttStatus = document.getElementById('filterAttStatus');
  const sortAtt = document.getElementById('sortAtt');
  const tableBody = document.getElementById('attendance-tbody');
  const btnExportAttPDF = document.getElementById('btnExportAttPDF');

  function updateTableUI() {
    let attArray = [];
    let current = db.attendance.head;

    // Normalisasi Data ke Array
    while (current) {
        let payload = current.payload;
        const student = db.users.findWhere('nim', payload.id_mahasiswa);
        const studentName = student ? student.payload.nama : 'Unknown';

        let locName = payload.id_lokasi;
        if (locName && locName !== "-") {
            const locObj = db.locations.find(l => l.id === locName || l.id === locName.replace('-',''));
            if (locObj) locName = locObj.name;
        }

        attArray.push({
            ...payload,
            studentName: studentName,
            locationName: locName
        });
        current = current.next;
    }

    const sTerm = searchAtt.value.toLowerCase();
    const typeTerm = filterAttType.value.toLowerCase();
    const statusTerm = filterAttStatus.value.toLowerCase();
    const dFrom = dateFrom.value ? new Date(dateFrom.value).getTime() : null;
    
    // Set DTo ke akhir hari agar data di hari tsb masuk
    let dTo = null;
    if (dateTo.value) {
        const toDate = new Date(dateTo.value);
        toDate.setHours(23, 59, 59, 999);
        dTo = toDate.getTime();
    }

    // 1. FILTERING
    let filteredData = attArray.filter(att => {
        const matchSearch = att.studentName.toLowerCase().includes(sTerm) || att.id_mahasiswa.toLowerCase().includes(sTerm);
        const matchType = typeTerm === 'all' || (att.attendance || '').toLowerCase() === typeTerm;
        const matchStatus = statusTerm === 'all' || (att.status || '').toLowerCase() === statusTerm;
        
        let matchDate = true;
        if (att.created_at) {
            const attTime = new Date(att.created_at).getTime();
            if (dFrom && attTime < dFrom) matchDate = false;
            if (dTo && attTime > dTo) matchDate = false;
        }
        
        return matchSearch && matchType && matchStatus && matchDate;
    });

    // 2. SORTING
    filteredData.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        const nameA = a.studentName.toLowerCase();
        const nameB = b.studentName.toLowerCase();

        if (sortAtt.value === 'date_desc') return dateB - dateA;
        if (sortAtt.value === 'date_asc') return dateA - dateB;
        if (sortAtt.value === 'name_asc') return nameA.localeCompare(nameB);
        if (sortAtt.value === 'name_desc') return nameB.localeCompare(nameA);
        return 0;
    });

    // 3. RENDER UI
    let newRows = '';
    if (filteredData.length === 0) {
        newRows = `<tr><td colspan="6" class="text-center p-8 text-gray-400 font-medium">Data presensi tidak ditemukan</td></tr>`;
    } else {
        filteredData.forEach(att => {
            // Setup Format
            let dateStr = "-", timeStr = "-", updatedHtml = "";
            if (att.created_at) {
                const dObj = new Date(att.created_at);
                dateStr = dObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                timeStr = dObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            }
            if (att.updated_at && att.updated_at !== att.created_at) {
                const uObj = new Date(att.updated_at);
                updatedHtml = `<div class="text-[10px] text-[#3b8ea5] font-semibold mt-1 bg-blue-50 inline-block px-1 rounded">Upd: ${uObj.toLocaleDateString('id-ID', {day:'2-digit', month:'short'})} ${uObj.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</div>`;
            }

            let attColor = 'bg-gray-100 text-gray-700';
            const attType = (att.attendance || '').toLowerCase();
            if (attType === 'present') attColor = 'bg-blue-100 text-blue-700';
            else if (attType === 'sick') attColor = 'bg-yellow-100 text-yellow-700';
            else if (attType === 'permit') attColor = 'bg-purple-100 text-purple-700';
            else if (attType === 'absent' || attType === 'late') attColor = 'bg-red-100 text-red-700';

            let statusColor = 'bg-gray-100 text-gray-700';
            const status = att.status || '';
            if (status === 'Approved' || status === 'On Time') statusColor = 'bg-green-100 text-green-700';
            else if (status === 'Pending') statusColor = 'bg-yellow-100 text-yellow-700';
            else if (status === 'Rejected') statusColor = 'bg-red-100 text-red-700';

            newRows += `
            <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
                <td class="p-4 text-sm whitespace-nowrap">
                    <div class="font-semibold text-gray-800">${dateStr}</div>
                    <div class="text-xs text-gray-500">In: ${timeStr}</div>
                    ${updatedHtml}
                </td>
                <td class="p-4 text-sm">
                    <div class="font-semibold text-gray-800">${att.studentName}</div>
                    <div class="text-xs text-gray-500">NIM: <span class="font-mono text-[#3b8ea5]">${att.id_mahasiswa}</span></div>
                </td>
                <td class="p-4 text-sm">
                    <div class="flex flex-col items-start gap-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${attColor}">${att.attendance || '-'}</span>
                        <span class="text-xs text-gray-500 whitespace-nowrap"><i class="fas fa-map-marker-alt"></i> ${att.locationName}</span>
                    </div>
                </td>
                <td class="p-4 text-sm text-center">
                    <span class="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${statusColor}">${status}</span>
                </td>
                <td class="p-4 text-sm text-gray-600 max-w-[150px] truncate" title="${att.notes || ''}">
                    ${att.notes || '-'}
                </td>
                <td class="p-4 text-sm text-center">            
                    ${status === 'Pending' ? `
                    <button class="btn-approvement-att text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm" data-id="${att.id}">Approve</button>
                    ` : `
                    <button class="btn-detail-att text-slate-400 hover:text-pasifik hover:scale-125 transition-transform mr-2" data-id="${att.id}"><i class="fas fa-eye text-lg pointer-events-none"></i></button>
                    <button class="btn-edit-att text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm" data-id="${att.id}"><i class="fas fa-edit pointer-events-none"></i></button>
                    `}
                </td>
            </tr>`;
        });
    }
    tableBody.innerHTML = newRows;
  }

  // EVENT LISTENER UNTUK FILTER
  if (searchAtt) searchAtt.addEventListener('input', updateTableUI);
  if (dateFrom) dateFrom.addEventListener('change', updateTableUI);
  if (dateTo) dateTo.addEventListener('change', updateTableUI);
  if (filterAttType) filterAttType.addEventListener('change', updateTableUI);
  if (filterAttStatus) filterAttStatus.addEventListener('change', updateTableUI);
  if (sortAtt) sortAtt.addEventListener('change', updateTableUI);

  // LOGIKA EXPORT PDF
  if (btnExportAttPDF) {
      btnExportAttPDF.addEventListener('click', () => {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF('l', 'pt', 'a4'); // Landscape agar tabel muat

          doc.setFontSize(22);
          doc.setTextColor(45, 114, 143); 
          doc.setFont("helvetica", "bold");
          doc.text("Laporan Presensi AE-ttend", 40, 40);
          
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.setFont("helvetica", "normal");
          
          // Render Teks Filter
          let filterText = `Filter: Tipe (${filterAttType.options[filterAttType.selectedIndex].text}) | Status (${filterAttStatus.options[filterAttStatus.selectedIndex].text})`;
          if (dateFrom.value || dateTo.value) filterText += ` | Periode: ${dateFrom.value || 'Awal'} s.d ${dateTo.value || 'Sekarang'}`;
          
          doc.text(filterText, 40, 55);
          doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} Pukul: ${new Date().toLocaleTimeString('id-ID')}`, 40, 70);
          doc.setDrawColor(200, 200, 200);
          doc.line(40, 80, 800, 80);

          // Ambil data yang sedang tampil di layar (sesuai filter)
          // Cara tercepat: jalankan array yang sama dengan UI Update
          let pdfDataArray = [];
          let cur = db.attendance.head;
          while (cur) {
              const u = db.users.findWhere('nim', cur.payload.id_mahasiswa);
              pdfDataArray.push({ ...cur.payload, studentName: u ? u.payload.nama : 'Unknown' });
              cur = cur.next;
          }

          // Filter manual lagi sesuai input
          const sT = searchAtt.value.toLowerCase();
          const tT = filterAttType.value.toLowerCase();
          const sSt = filterAttStatus.value.toLowerCase();
          const dF = dateFrom.value ? new Date(dateFrom.value).getTime() : null;
          let dT = null;
          if (dateTo.value) { const tod = new Date(dateTo.value); tod.setHours(23,59,59,999); dT = tod.getTime(); }

          const pdfFiltered = pdfDataArray.filter(a => {
              const ms = a.studentName.toLowerCase().includes(sT) || a.id_mahasiswa.toLowerCase().includes(sT);
              const mt = tT === 'all' || (a.attendance||'').toLowerCase() === tT;
              const msst = sSt === 'all' || (a.status||'').toLowerCase() === sSt;
              let md = true;
              if(a.created_at) {
                  let atTime = new Date(a.created_at).getTime();
                  if (dF && atTime < dF) md = false;
                  if (dT && atTime > dT) md = false;
              }
              return ms && mt && msst && md;
          });

          // Sorting sama seperti UI
          pdfFiltered.sort((a, b) => {
              if (sortAtt.value === 'date_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              if (sortAtt.value === 'date_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
              if (sortAtt.value === 'name_asc') return a.studentName.localeCompare(b.studentName);
              if (sortAtt.value === 'name_desc') return b.studentName.localeCompare(a.studentName);
              return 0;
          });

          const tableBodyData = pdfFiltered.map((a, i) => [
              i + 1,
              a.created_at ? new Date(a.created_at).toLocaleString('id-ID') : '-',
              `${a.studentName} (${a.id_mahasiswa})`,
              (a.attendance || '').toUpperCase(),
              a.status,
              a.notes || '-'
          ]);

          doc.autoTable({
              startY: 90,
              head: [['No', 'Tgl & Waktu', 'Mahasiswa (NIM)', 'Kehadiran', 'Status', 'Catatan']],
              body: tableBodyData,
              theme: 'grid',
              headStyles: { fillColor: [45, 114, 143], textColor: [255, 255, 255] },
              styles: { font: 'helvetica', fontSize: 9 }
          });

          const finalY = doc.lastAutoTable.finalY || 100;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`Bandung, ${new Date().toLocaleDateString('id-ID')}`, 650, finalY + 40);
          doc.text("Administrator Sistem AE-ttend", 650, finalY + 55);
          doc.setFont("helvetica", "bold");
          const adminName = db.state.currentUser.payload.nama || "Admin AE-ttend"; 
          doc.text(adminName, 650, finalY + 110);
          doc.line(650, finalY + 112, 780, finalY + 112); 
          doc.setFont("helvetica", "normal");
          doc.text("NIP/NIM: " + db.state.currentUser.payload.nim, 650, finalY + 125);

          doc.save(`Laporan_Presensi_${new Date().getTime()}.pdf`);
      });
  }

  // Panggil Update UI saat awal load agar data muncul
  updateTableUI();


  // =========================================================================
  // 2. LOGIKA CREATE & GENERATE ABSENT (SAMA PERSIS DENGAN KODEMU)
  // =========================================================================
  if (btnGen) {
    btnGen.onclick = () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const isoString = now.toISOString();
      let currentStudent = db.users.head;
      let added = 0;

      while (currentStudent) {
        if (currentStudent.payload.role === "student") {
          let isPresent = false;
          let currentAtt = db.attendance.head;
          while (currentAtt) {
            const attDate = currentAtt.payload.created_at ? currentAtt.payload.created_at.split("T")[0] : "";
            if (currentAtt.payload.id_mahasiswa === currentStudent.payload.nim && attDate === today) {
              isPresent = true;
              break;
            }
            currentAtt = currentAtt.next;
          }

          if (!isPresent) {
            const newId = `ATT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
            db.attendance.insert(newId, {
              id: newId,
              id_mahasiswa: currentStudent.payload.nim,
              id_lokasi: "-",
              attendance: "absent",
              status: "Approved",
              notes: "Auto-Generated by System",
              created_at: isoString,
              updated_at: isoString,
            });
            added++;
          }
        }
        currentStudent = currentStudent.next;
      }
      alert(`Sistem menghasilkan ${added} node absen otomatis.`);
      navigate("admin-attendance");
    };
  }

  if (btnCreate) btnCreate.onclick = () => modalCreate?.classList.replace("hidden", "flex");
  if (btnCloseCreate) btnCloseCreate.onclick = () => modalCreate?.classList.replace("flex", "hidden");
  if (btnCancelCreate) btnCancelCreate.onclick = () => modalCreate?.classList.replace("flex", "hidden");

  if (formCreate) {
    formCreate.onsubmit = (e) => {
      e.preventDefault();
      const isoString = new Date().toISOString();
      const newId = `ATT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;

      db.attendance.insert(newId, {
        id: newId,
        id_mahasiswa: document.getElementById("attStudentNim").value,
        id_lokasi: document.getElementById("attLocationId").value,
        attendance: document.getElementById("attType").value,
        status: document.getElementById("attStatus").value,
        notes: document.getElementById("attNotes").value || "Created Manually by Admin",
        created_at: isoString,
        updated_at: isoString,
      });
      modalCreate.classList.replace("flex", "hidden");
      navigate("admin-attendance");
    };
  }

  // =========================================================================
  // 3. LOGIKA EVENT DELEGATION GLOBAL (EDIT, VIEW, APPROVE)
  // =========================================================================
  if (btnCloseEdit) btnCloseEdit.onclick = () => document.getElementById("modalEditAttendance")?.classList.replace("flex", "hidden");
  if (btnCancelEdit) btnCancelEdit.onclick = () => document.getElementById("modalEditAttendance")?.classList.replace("flex", "hidden");

  if (formEdit) {
    formEdit.onsubmit = (e) => {
      e.preventDefault();
      const targetId = document.getElementById("editAttId").value;
      let curr = db.attendance.head;
      while (curr) {
        if (curr.payload.id === targetId) {
          curr.payload.id_lokasi = document.getElementById("editLocationId").value;
          curr.payload.attendance = document.getElementById("editType").value;
          curr.payload.status = document.getElementById("editStatus").value;
          curr.payload.notes = document.getElementById("editNotes").value;
          curr.payload.updated_at = new Date().toISOString();
          break;
        }
        curr = curr.next;
      }
      document.getElementById("modalEditAttendance")?.classList.replace("flex", "hidden");
      navigate("admin-attendance");
    };
  }

  if (!isAdminAttendanceEventsInitialized) {
    document.addEventListener("click", (e) => {

      // EDIT
      const btnEdit = e.target.closest(".btn-edit-att");
      if (btnEdit) {
        const id = btnEdit.getAttribute("data-id");
        let curr = db.attendance.head;
        let targetAtt = null;
        while (curr) {
          if (curr.payload.id === id) { targetAtt = curr.payload; break; }
          curr = curr.next;
        }
        if (targetAtt) {
          document.getElementById("editAttId").value = targetAtt.id;
          const student = db.users.findWhere("nim", targetAtt.id_mahasiswa);
          document.getElementById("editStudentName").value = student ? `${student.payload.nama} (${targetAtt.id_mahasiswa})` : targetAtt.id_mahasiswa;
          document.getElementById("editLocationId").value = targetAtt.id_lokasi || "-";
          document.getElementById("editType").value = targetAtt.attendance;
          document.getElementById("editStatus").value = targetAtt.status;
          document.getElementById("editNotes").value = targetAtt.notes || "";
          
          const currentModalEdit = document.getElementById("modalEditAttendance");
          if (currentModalEdit) currentModalEdit.classList.replace("hidden", "flex");
        }
      }

      // DETAIL
      const btnDetail = e.target.closest(".btn-detail-att");
      if (btnDetail) {
        const id = btnDetail.getAttribute("data-id");
        let curr = db.attendance.head;
        let targetAtt = null;
        while (curr) {
          if (curr.payload.id === id) { targetAtt = curr.payload; break; }
          curr = curr.next;
        }
        if (targetAtt) {
          const student = db.users.findWhere("nim", targetAtt.id_mahasiswa);
          const studentName = student ? student.payload.nama : targetAtt.id_mahasiswa;

          const detailContent = document.getElementById("detailContent");
          if (detailContent) {
            detailContent.innerHTML = `
                <div class="grid grid-cols-3 gap-y-3 gap-x-4 text-sm mt-2">
                    <div class="text-gray-500 font-semibold">ID Record</div><div class="col-span-2 font-mono text-gray-800">${targetAtt.id}</div>
                    <div class="text-gray-500 font-semibold">Mahasiswa</div><div class="col-span-2 text-gray-800 font-medium">${studentName}</div>
                    <div class="text-gray-500 font-semibold">Lokasi</div><div class="col-span-2 text-gray-800">${targetAtt.id_lokasi || "-"}</div>
                    <div class="text-gray-500 font-semibold">Kehadiran</div><div class="col-span-2"><span class="px-2 py-1 bg-[#3b8ea5]/10 text-[#3b8ea5] rounded-md font-bold text-xs uppercase tracking-wide border border-[#3b8ea5]/20">${targetAtt.attendance}</span></div>
                    <div class="text-gray-500 font-semibold">Status</div><div class="col-span-2 text-gray-800">${targetAtt.status}</div>
                    <div class="text-gray-500 font-semibold">Catatan</div><div class="col-span-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">${targetAtt.notes || "-"}</div>
                    <div class="text-gray-500 font-semibold mt-2">Dibuat Pada</div><div class="col-span-2 text-gray-800 mt-2">${new Date(targetAtt.created_at).toLocaleString("id-ID")}</div>
                    <div class="text-gray-500 font-semibold">Diupdate Pada</div><div class="col-span-2 text-gray-800">${new Date(targetAtt.updated_at).toLocaleString("id-ID")}</div>
                </div>`;
          }
          const currentModalDetail = document.getElementById("modalDetailAttendance");
          if (currentModalDetail) {
            currentModalDetail.classList.replace("hidden", "flex");
            setTimeout(() => currentModalDetail.querySelector("div").classList.replace("scale-95", "scale-100"), 10);
          }
        }
      }

      if (e.target.closest("#btnCloseDetailModal") || e.target.closest("#btnCloseDetail")) {
        const currentModalDetail = document.getElementById("modalDetailAttendance");
        if (currentModalDetail) {
          currentModalDetail.querySelector("div").classList.replace("scale-100", "scale-95");
          setTimeout(() => currentModalDetail.classList.replace("flex", "hidden"), 150);
        }
      }

// BUKA APPROVE (Dan Tampilkan Lampiran)
      const btnApprovement = e.target.closest(".btn-approvement-att");
      if (btnApprovement) {
        const id = btnApprovement.getAttribute("data-id");
        document.getElementById("approveAttId").value = id; 

        // Cari data presensi untuk mengambil lampiran
        let curr = db.attendance.head;
        let targetAtt = null;
        while (curr) {
          if (curr.payload.id === id) { targetAtt = curr.payload; break; }
          curr = curr.next;
        }

        // Handle Gambar Lampiran
        const attachmentContainer = document.getElementById("approveAttachmentContainer");
        const attachmentImg = document.getElementById("approveAttachmentImg");

        if (targetAtt && targetAtt.attachment) {
            attachmentImg.src = targetAtt.attachment;
            attachmentContainer.classList.remove("hidden");
        } else {
            attachmentContainer.classList.add("hidden");
            attachmentImg.src = "";
        }

        // Tampilkan Modal
        const currentModalApprove = document.getElementById("modalApproveAttendance");
        if (currentModalApprove) {
          currentModalApprove.classList.replace("hidden", "flex");
          setTimeout(() => currentModalApprove.querySelector("div").classList.replace("scale-95", "scale-100"), 10);
        }
      }

      // TUTUP MODAL SAJA (TANPA MENGUBAH STATUS)
      if (e.target.closest("#btnCloseApproveModalOnly")) {
        const currentModalApprove = document.getElementById("modalApproveAttendance");
        if (currentModalApprove) {
          currentModalApprove.querySelector("div").classList.replace("scale-100", "scale-95");
          setTimeout(() => currentModalApprove.classList.replace("flex", "hidden"), 150);
        }
      }

      // REJECT
      if (e.target.closest("#btnCancelApprove")) {
        const idToApprove = document.getElementById("approveAttId").value;
        let curr = db.attendance.head;
        while (curr) {
          if (curr.payload.id === idToApprove) {
            curr.payload.status = "Rejected";
            curr.payload.updated_at = new Date().toISOString();
            break;
          }
          curr = curr.next;
        }
        const currentModalApprove = document.getElementById("modalApproveAttendance");
        if (currentModalApprove) currentModalApprove.classList.replace("flex", "hidden");
        navigate("admin-attendance");
      }

      // CONFIRM APPROVE
      if (e.target.closest("#btnConfirmApprove")) {
        const idToApprove = document.getElementById("approveAttId").value;
        let curr = db.attendance.head;
        while (curr) {
          if (curr.payload.id === idToApprove) {
            curr.payload.status = "Approved";
            curr.payload.updated_at = new Date().toISOString();
            break;
          }
          curr = curr.next;
        }
        const currentModalApprove = document.getElementById("modalApproveAttendance");
        if (currentModalApprove) currentModalApprove.classList.replace("flex", "hidden");
        navigate("admin-attendance");
      }
    });

    isAdminAttendanceEventsInitialized = true;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  navigate("login");
});

window.addEventListener("app-navigate", (e) => {
  const ruteTujuan = e.detail;
  navigate(ruteTujuan);
});
