import { db } from "./core/Database.js";
import { AdminLayout, StudentLayout, LoginLayout } from "./views/Layouts.js";
import {
  renderAdminUsers,
  renderAdminAttendance,
  renderAdminDashboard,
  renderAdminLocation,
} from "./views/AdminViews.js";
import {
  renderStudentDashboard,
  attachStudentEvents,
} from "./views/StudentViews.js";
import { initLayoutEvents } from "./views/Layouts.js";
import { renderStudentAttendance, initCalendar, initAttendanceEvents } from "./views/StudentViews.js";


// if user reloads, give them warning about losing unsaved data (like attendance form)
window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  e.returnValue = "";
});

const appContainer = document.getElementById("app");

function navigate(route) {
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
      appContainer.innerHTML = AdminLayout(renderAdminDashboard(), route);
      attachAdminDashboardEvents();
    } else if (route === "admin-users") {
      appContainer.innerHTML = AdminLayout(renderAdminUsers(), route);
      attachAdminUserEvents();
    } else if (route === "admin-attendance") {
      appContainer.innerHTML = AdminLayout(renderAdminAttendance(), route);
      attachAdminAttendanceEvents();
    } else if (route === "admin-locations") {
      appContainer.innerHTML = AdminLayout(renderAdminLocation(), route);
      attachAdminLocationEvents();
    } else {
      // not found route for admin, navigate to 404 or dashboard
      appContainer.innerHTML = AdminLayout("<h2>404 - Page Not Found</h2>");
    }
  } 
  
  else if (user.payload.role === "student") {
    
    if (route === "student-dashboard" || route === "overview") {
      appContainer.innerHTML = StudentLayout(renderStudentDashboard(user), user);

      initLayoutEvents();
      initCalendar();
      
      updateActiveMenu("overview");
      
    } 
    else if (route === "presensi") {
      appContainer.innerHTML = StudentLayout(renderStudentAttendance(user), user);
      
      initLayoutEvents(); 
      initAttendanceEvents();
      
      updateActiveMenu("presensi");
      
    } 
    else if (route === "announcement") {
      appContainer.innerHTML = StudentLayout(`<div class="p-8 text-center text-gray-500 font-bold text-2xl">Halaman Pengumuman Segera Hadir</div>`, user);
      initLayoutEvents();
      updateActiveMenu("announcement");
    } 
    else {
      navigate("overview");
    }
  }
}

function updateActiveMenu(activeRoute) {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(btn => {
    if (btn.getAttribute('data-route') === activeRoute) {
      btn.className = "nav-item text-white font-semibold border-b-2 border-[#f5ee9e] pb-1 cursor-pointer";
    } else {
      btn.className = "nav-item text-gray-300 hover:text-white transition cursor-pointer";
    }
  });
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nimInput = document.getElementById("login-nim").value;
    const passwordInput = document.getElementById("login-password").value;
    
    const userNode = db.users.findWhere("nim", nimInput);

    if (userNode) {
        if (userNode.payload.password === passwordInput) {
            db.state.currentUser = userNode;
        if (userNode.payload.role === "admin") navigate("admin-dashboard");
            else navigate("student-dashboard");
        } else {
            alert("Password salah!");
        }
    } else {
        alert("NIM/ID tidak ditemukan dalam Node Linked List!");
    }
  }); 
}

function attachAdminDashboardEvents() {
  // Placeholder for any future events on the admin dashboard
}

function attachAdminUserEvents() {
  document.querySelectorAll(".btn-del-user").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      if (confirm("Hapus node memori ini?")) {
        db.users.remove(id);
        navigate("admin-users");
      }
    });
  });
}

function attachAdminAttendanceEvents() {
  const btnGen = document.getElementById("btn-generate-absent");
  if (btnGen) {
    btnGen.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      let currentStudent = db.users.head;
      let added = 0;

      while (currentStudent) {
        if (currentStudent.payload.role === "student") {
          let isPresent = false;
          let currentAtt = db.attendance.head;

          while (currentAtt) {
            if (
              currentAtt.payload.nim === currentStudent.payload.nim &&
              currentAtt.payload.date === today
            ) {
              isPresent = true;
              break;
            }
            currentAtt = currentAtt.next;
          }

          if (!isPresent) {
            db.attendance.insert(Date.now().toString() + Math.random(), {
              nim: currentStudent.payload.nim,
              date: today,
              status: "Absent",
              notes: "Auto-Generated by System",
            });
            added++;
          }
        }
        currentStudent = currentStudent.next;
      }
      alert(`Sistem memori menghasilkan ${added} node absen otomatis.`);
      navigate("admin-attendance");
    });
  }
}

document.addEventListener("click", (e) => {
  const routeTarget = e.target.closest("[data-route]");
  if (routeTarget) {
    e.preventDefault();
    const route = routeTarget.getAttribute("data-route");
    navigate(route);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  navigate("login");
});
