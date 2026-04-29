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

function attachAdminDashboardEvents() {}

let isAdminUserEventsInitialized = false;
let nimTerpilih = null;

function attachAdminUserEvents() {
  const modal = document.getElementById("modalAdd");
  const btnOpen = document.getElementById("btnOpenModal");
  const btnClose = document.getElementById("btnCloseModal");
  const formAdd = document.getElementById("formAddUser");

  if (btnOpen && modal) {
    btnOpen.onclick = () => {
      modal.classList.replace("hidden", "flex");
    };
  }

  if (btnClose && modal) {
    btnClose.onclick = () => {
      modal.classList.replace("flex", "hidden");
    };
  }

  const roleBtns = document.querySelectorAll(".role-btn");
  const mhsFields = document.getElementById("mhsFields");
  const inputRole = document.getElementById("newRole");
  const inputNim = document.getElementById("newNim");
  const inputKelas = document.getElementById("newKelas");

  roleBtns.forEach((btn) => {
    btn.onclick = () => {
      const role = btn.getAttribute("data-role");
      inputRole.value = role;

      roleBtns.forEach((b) => {
        b.classList.remove("bg-white", "text-pasifik", "shadow-sm");
        b.classList.add("text-slate-500");
      });
      btn.classList.add("bg-white", "text-pasifik", "shadow-sm");
      btn.classList.remove("text-slate-500");

      if (role === "admin") {
        mhsFields.classList.add("hidden");
        inputNim.required = false;
        inputKelas.required = false;
      } else {
        mhsFields.classList.remove("hidden");
        inputNim.required = true;
        inputKelas.required = true;
      }
    };
  });

  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.onclick = () => {
      const input = btn.parentElement.querySelector("input");
      const icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    };
  });

  if (formAdd) {
    formAdd.onsubmit = (e) => {
      e.preventDefault();
      const role = inputRole.value;
      const nama = document.getElementById("newNama").value;
      const password = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const fileInput = document.getElementById("newUserPic");
      const file = fileInput.files[0];

      if (!file) return alert("Silakan pilih foto terlebih dahulu!");
      if (password !== confirmPassword) {
        alert("Konfirmasi password tidak cocok!");
        return;
      }

      const fileExtension = file.name.split(".").pop().toLowerCase();
      let finalNim, finalKelas;

      if (role === "admin") {
        finalKelas = "-";
        finalNim = "ADM-" + Date.now().toString().slice(-4);
      } else {
        finalNim = document.getElementById("newNim").value;
        finalKelas = document.getElementById("newKelas").value;
      }

      const fullPath = `user_${finalNim}.${fileExtension}`;

      let isDuplicate = false;
      let curr = db.users.head;
      while (curr) {
        if (curr.payload.nim === finalNim) {
          isDuplicate = true;
          break;
        }
        curr = curr.next;
      }

      if (isDuplicate) {
        alert(`Gagal! NIM atau ID ${finalNim} sudah terdaftar di sistem.`);
        return;
      }

      db.users.insert(finalNim, {
        nim: finalNim,
        nama: nama,
        kelas: finalKelas,
        userPic: fullPath,
        role: role,
        password: password,
        faceCode: null,
      });

      alert(`Berhasil mendaftarkan ${role}: ${nama}`);
      modal.classList.replace("flex", "hidden");
      navigate("admin-users");
    };
  }

  if (!isAdminUserEventsInitialized) {
    document.addEventListener("click", (e) => {
      const btnDel = e.target.closest(".btn-del-user");
      if (btnDel) {
        nimTerpilih = btnDel.getAttribute("data-id");
        const modalDelete = document.getElementById("modalDelete");
        if (modalDelete) {
          modalDelete.classList.remove("hidden");
          setTimeout(() => {
            modalDelete.classList.remove("opacity-0");
            const innerDiv = modalDelete.querySelector("div");
            if (innerDiv) innerDiv.classList.replace("scale-95", "scale-100");
          }, 10);
        }
        return;
      }

      if (e.target.id === "btn-confirm-delete") {
        if (nimTerpilih) {
          db.users.remove(nimTerpilih);
          tutupModalDelete();
          navigate("admin-users");
        }
        return;
      }

      if (e.target.closest(".btn-close-delete")) {
        tutupModalDelete();
        return;
      }

      if (e.target.closest(".btn-close-edit")) {
        tutupModalEdit();
        return;
      }

      if (e.target.closest(".btn-close-view")) {
        const modalView = document.getElementById("modalViewUser");
        if (modalView) {
          modalView.classList.add("opacity-0");
          const innerDiv = modalView.querySelector("div");
          if (innerDiv) innerDiv.classList.replace("scale-100", "scale-95");
          setTimeout(() => modalView.classList.add("hidden"), 300);
        }
        return;
      }

      const btnEdit = e.target.closest(".btn-edit-user");
      if (btnEdit) {
        const id = btnEdit.getAttribute("data-id");

        let curr = db.users.head;
        let targetUser = null;
        while (curr) {
          if (curr.payload.nim === id) {
            targetUser = curr.payload;
            break;
          }
          curr = curr.next;
        }

        if (targetUser) {
          document.getElementById("edit_nim").value = targetUser.nim;
          document.getElementById("edit_nama").value = targetUser.nama;

          const fieldKelas = document.getElementById("edit_kelas");
          if (fieldKelas) fieldKelas.value = targetUser.kelas || "";

          const previewFoto = document.getElementById("edit_preview_foto");
          if (previewFoto) {
            const userPhoto = targetUser.foto
              ? `images/userPics/${targetUser.foto}`
              : "images/userPics/default.png";
            previewFoto.src = userPhoto;

            previewFoto.onerror = () => {
              previewFoto.src = "images/userPics/default.png";
            };
          }

          const currentRole = targetUser.role || "student";
        if (typeof switchEditRole === "function") switchEditRole(currentRole);
          if (typeof switchEditRole === "function") {
            switchEditRole(userRole);
          }
          const modalEdit = document.getElementById("modalEdit");
          if (modalEdit) {
            modalEdit.classList.remove("hidden");
            setTimeout(() => {
              modalEdit.classList.remove("opacity-0");
              const innerDiv = modalEdit.querySelector("div");
              if (innerDiv) innerDiv.classList.replace("scale-95", "scale-100");
            }, 10);
          }
        }
      }

      const btnView = e.target.closest(".btn-view-user");
      if (btnView) {
        const id = btnView.getAttribute("data-id");

        let curr = db.users.head;
        let targetUser = null;
        while (curr) {
          if (curr.payload.nim === id) {
            targetUser = curr.payload;
            break;
          }
          curr = curr.next;
        }

        if (targetUser) {
          document.getElementById("viewUserContent").innerHTML = `
                <div class="flex flex-col items-center mb-6">
                    <div class="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-3">
                        <img src="public/images/userPics/${targetUser.userPic || "default.png"}" alt="Profile" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-lg font-bold text-slate-800">${targetUser.nama}</h4>
                    <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase mt-1">${targetUser.role}</span>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between border-b border-slate-50 pb-2">
                        <span class="text-slate-500 font-semibold">NIM/ID</span>
                        <span class="text-slate-800 font-mono">${targetUser.nim}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-50 pb-2">
                        <span class="text-slate-500 font-semibold">Kelas</span>
                        <span class="text-slate-800">${targetUser.kelas || "-"}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-50 pb-2">
                        <span class="text-slate-500 font-semibold">Face Data</span>
                        <span class="${targetUser.faceCode ? "text-green-500" : "text-red-500"} font-bold">
                            ${targetUser.faceCode ? '<i class="fas fa-check-circle"></i> Terdaftar' : '<i class="fas fa-times-circle"></i> Belum Terdaftar'}
                        </span>
                    </div>
                </div>
            `;
          const modalView = document.getElementById("modalViewUser");
          if (modalView) {
            modalView.classList.remove("hidden");
            setTimeout(() => {
              modalView.classList.remove("opacity-0");
              const innerDiv = modalView.querySelector("div");
              if (innerDiv) innerDiv.classList.replace("scale-95", "scale-100");
            }, 10);
          }
        }
      }
    });

    document.addEventListener("submit", (e) => {
      if (e.target.id === "formEditUser") {
        e.preventDefault();
        const nim = document.getElementById("edit_nim").value;
        const namaBaru = document.getElementById("edit_nama").value;

        let curr = db.users.head;
        while (curr) {
          if (curr.payload.nim === nim) {
            curr.payload.nama = namaBaru; 
            break;
          }
          curr = curr.next;
        }

        tutupModalEdit();
        navigate("admin-users");
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

  const modalEdit = document.getElementById("modalEditAttendance");
  const formEdit = document.getElementById("formEditAttendance");
  const btnCloseEdit = document.getElementById("btnCloseEditModal");
  const btnCancelEdit = document.getElementById("btnCancelEdit");

  const modalDetailAttendance = document.getElementById(
    "modalDetailAttendance",
  );

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
            const attDate = currentAtt.payload.created_at
              ? currentAtt.payload.created_at.split("T")[0]
              : "";
            if (
              currentAtt.payload.id_mahasiswa === currentStudent.payload.nim &&
              attDate === today
            ) {
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

  if (btnCreate)
    btnCreate.onclick = () => modalCreate?.classList.replace("hidden", "flex");
  if (btnCloseCreate)
    btnCloseCreate.onclick = () =>
      modalCreate?.classList.replace("flex", "hidden");
  if (btnCancelCreate)
    btnCancelCreate.onclick = () =>
      modalCreate?.classList.replace("flex", "hidden");

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
        notes:
          document.getElementById("attNotes").value ||
          "Created Manually by Admin",
        created_at: isoString,
        updated_at: isoString,
      });
      modalCreate.classList.replace("flex", "hidden");
      navigate("admin-attendance");
    };
  }

  if (btnCloseEdit)
    btnCloseEdit.onclick = () => modalEdit?.classList.replace("flex", "hidden");
  if (btnCancelEdit)
    btnCancelEdit.onclick = () =>
      modalEdit?.classList.replace("flex", "hidden");

  if (formEdit) {
    formEdit.onsubmit = (e) => {
      e.preventDefault();
      const targetId = document.getElementById("editAttId").value;

      let curr = db.attendance.head;
      while (curr) {
        if (curr.payload.id === targetId) {
          curr.payload.id_lokasi =
            document.getElementById("editLocationId").value;
          curr.payload.attendance = document.getElementById("editType").value;
          curr.payload.status = document.getElementById("editStatus").value;
          curr.payload.notes = document.getElementById("editNotes").value;
          curr.payload.updated_at = new Date().toISOString();
          break;
        }
        curr = curr.next;
      }

      modalEdit.classList.replace("flex", "hidden");
      navigate("admin-attendance");
    };
  }

  if (!isAdminAttendanceEventsInitialized) {
    document.addEventListener("click", (e) => {
      const btnEdit = e.target.closest(".btn-edit-att");
      if (btnEdit) {
        const id = btnEdit.getAttribute("data-id");
        let curr = db.attendance.head;
        let targetAtt = null;

        while (curr) {
          if (curr.payload.id === id) {
            targetAtt = curr.payload;
            break;
          }
          curr = curr.next;
        }

        if (targetAtt) {
          document.getElementById("editAttId").value = targetAtt.id;
          const student = db.users.findWhere("nim", targetAtt.id_mahasiswa);
          document.getElementById("editStudentName").value = student
            ? `${student.payload.nama} (${targetAtt.id_mahasiswa})`
            : targetAtt.id_mahasiswa;
          document.getElementById("editLocationId").value =
            targetAtt.id_lokasi || "-";
          document.getElementById("editType").value = targetAtt.attendance;
          document.getElementById("editStatus").value = targetAtt.status;
          document.getElementById("editNotes").value = targetAtt.notes || "";

          if (modalEdit) modalEdit.classList.replace("hidden", "flex");
        }
      }

      const btnDetail = e.target.closest(".btn-detail-att");
      if (btnDetail) {
        const id = btnDetail.getAttribute("data-id");
        let curr = db.attendance.head;
        let targetAtt = null;

        while (curr) {
          if (curr.payload.id === id) {
            targetAtt = curr.payload;
            break;
          }
          curr = curr.next;
        }

        if (targetAtt) {
          const student = db.users.findWhere("nim", targetAtt.id_mahasiswa);
          const studentName = student
            ? student.payload.nama
            : targetAtt.id_mahasiswa;

          document.getElementById("detailContent").innerHTML = `
                        <div class="grid grid-cols-3 gap-y-3 gap-x-4 text-sm mt-2">
                            <div class="text-gray-500 font-semibold">ID Record</div>
                            <div class="col-span-2 font-mono text-gray-800">${targetAtt.id}</div>
                            
                            <div class="text-gray-500 font-semibold">Mahasiswa</div>
                            <div class="col-span-2 text-gray-800 font-medium">${studentName}</div>
                            
                            <div class="text-gray-500 font-semibold">Lokasi</div>
                            <div class="col-span-2 text-gray-800">${targetAtt.id_lokasi || "-"}</div>
                            
                            <div class="text-gray-500 font-semibold">Kehadiran</div>
                            <div class="col-span-2"><span class="px-2 py-1 bg-[#3b8ea5]/10 text-[#3b8ea5] rounded-md font-bold text-xs uppercase tracking-wide border border-[#3b8ea5]/20">${targetAtt.attendance}</span></div>
                            
                            <div class="text-gray-500 font-semibold">Status</div>
                            <div class="col-span-2 text-gray-800">${targetAtt.status}</div>
                            
                            <div class="text-gray-500 font-semibold">Catatan</div>
                            <div class="col-span-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">${targetAtt.notes || "-"}</div>
                            
                            <div class="text-gray-500 font-semibold mt-2">Dibuat Pada</div>
                            <div class="col-span-2 text-gray-800 mt-2">${new Date(targetAtt.created_at).toLocaleString("id-ID")}</div>
                            
                            <div class="text-gray-500 font-semibold">Diupdate Pada</div>
                            <div class="col-span-2 text-gray-800">${new Date(targetAtt.updated_at).toLocaleString("id-ID")}</div>
                        </div>
                    `;

          if (modalDetailAttendance) {
            modalDetailAttendance.classList.replace("hidden", "flex");
            setTimeout(() => {
              modalDetailAttendance
                .querySelector("div")
                .classList.replace("scale-95", "scale-100");
            }, 10);
          }
        }
      }

      if (
        e.target.closest("#btnCloseDetailModal") ||
        e.target.closest("#btnCloseDetail")
      ) {
        if (modalDetailAttendance) {
          modalDetailAttendance
            .querySelector("div")
            .classList.replace("scale-100", "scale-95");
          setTimeout(() => {
            modalDetailAttendance.classList.replace("flex", "hidden");
          }, 150);
        }
      }

      const btnApprovement = e.target.closest(".btn-approvement-att");
      if (btnApprovement) {
        const id = btnApprovement.getAttribute("data-id");
        document.getElementById("approveAttId").value = id; 

        const modalApprovement = document.getElementById(
          "modalApproveAttendance",
        );
        if (modalApprovement) {
          modalApprovement.classList.replace("hidden", "flex");
          setTimeout(() => {
            modalApprovement
              .querySelector("div")
              .classList.replace("scale-95", "scale-100");
          }, 10);
        }
      }

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

        const modalApprovement = document.getElementById(
          "modalApproveAttendance",
        );
        if (modalApprovement) {
          modalApprovement.classList.replace("flex", "hidden");
        }

        navigate("admin-attendance");
      }

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

        const modalApprovement = document.getElementById(
          "modalApproveAttendance",
        );
        if (modalApprovement) {
          modalApprovement.classList.replace("flex", "hidden");
        }

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
