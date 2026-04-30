import { db } from '../core/Database.js';

export function renderAdminDashboard() {
    return `
    <div class="max-w-7xl mx-auto">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-langit">Dashboard Overview</h2>
              <p class="text-slate-500 mt-1">
                Sistem berjalan optimal. Berikut metrik hari ini.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                class="bg-white p-6 rounded-2xl border-l-4 border-l-langit shadow-sm hover:shadow-md transition-all"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3
                      class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Total Pengguna
                    </h3>
                    <p class="text-3xl font-bold text-langit">1,248</p>
                  </div>
                  <div class="p-3 bg-vanila text-langit rounded-xl shadow-sm">
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div
                class="bg-white p-6 rounded-2xl border-l-4 border-l-pasifik shadow-sm hover:shadow-md transition-all"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3
                      class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Lokasi Aktif
                    </h3>
                    <p class="text-3xl font-bold text-pasifik">24</p>
                  </div>
                  <div class="p-3 bg-pasifik/10 text-pasifik rounded-xl">
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div
                class="bg-white p-6 rounded-2xl border-l-4 border-l-vanila shadow-sm hover:shadow-md transition-all"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3
                      class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2"
                    >
                      Tingkat Kehadiran
                    </h3>
                    <p class="text-3xl font-bold text-langit">94.5%</p>
                  </div>
                  <div class="p-3 bg-vanila/50 text-langit rounded-xl">
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 min-h-[400px]"
            >
              <h3 class="text-lg font-bold text-langit mb-4">
                Aktivitas Terkini
              </h3>
              <div
                class="p-4 bg-slate-50 rounded-xl border border-pasifik/30 border-dashed"
              >
                <p class="text-slate-500 text-center py-10">
                  Integrasikan modul LMS atau tabel data Anda di area ini.
                </p>
              </div>
            </div>
          </div>
    `;
}

export function renderAdminUsers() {
    // 1. Ekstrak Node ke Array & Dapatkan Kelas Unik
    let usersArray = [];
    let uniqueClasses = new Set();
    let current = db.users.head;

    while (current) {
        usersArray.push(current.payload);
        if (current.payload.kelas && current.payload.kelas !== "-") {
            uniqueClasses.add(current.payload.kelas);
        }
        current = current.next;
    }

    // 2. Generate Options untuk Filter Kelas
    let classOptions = `<option value="all">Semua Kelas</option>`;
    uniqueClasses.forEach(cls => {
        classOptions += `<option value="${cls}">${cls}</option>`;
    });

    // 3. Render Initial Rows
    let rows = '';
    usersArray.forEach((user, index) => {
        rows += `
        <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
            <td class="p-4 text-sm text-gray-600">${index + 1}</td>
            <td class="p-4 text-sm font-semibold text-gray-700">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-[#3b8ea5]/10 text-[#3b8ea5] flex items-center justify-center font-bold overflow-hidden border border-[#3b8ea5]/20">
                        <img src="${user.userPic ? (user.userPic.startsWith('public') ? user.userPic : 'public/images/userPics/' + user.userPic) : 'public/images/userPics/default.png'}" 
                             alt="${user.nama}" class="w-full h-full object-cover">
                    </div>
                    <div class="text-gray-800 font-bold flex flex-col">
                        ${user.nama}
                        <div class="text-[11px] text-gray-500 font-medium mt-0.5">
                            <span class="font-mono text-[#3b8ea5]">${user.nim}</span> | ${user.kelas}
                        </div>
                    </div>
                </div>
            </td>
            <td class="p-4 text-center">
                <span class="px-3 py-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} rounded-full text-[10px] font-extrabold uppercase tracking-widest">${user.role}</span>
            </td>
            <td class="p-4 text-center">
                <div class="flex justify-center gap-3 items-center">
                    <button class="btn-view-user text-slate-400 hover:text-pasifik hover:scale-110 transition-transform" data-id="${user.nim}"><i class="fas fa-eye text-lg"></i></button>
                    <button class="btn-edit-user text-slate-400 hover:text-langit hover:scale-110 transition-transform" data-id="${user.nim}"><i class="fas fa-edit text-lg pointer-events-none"></i></button>
                    <button class="btn-del-user text-red-400 hover:text-red-600 hover:scale-110 transition-transform" data-id="${user.nim}"><i class="fas fa-trash text-lg"></i></button>
                </div>
            </td>
        </tr>`;
    });

    return `
    <div class="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div>
                <h2 class="text-2xl font-extrabold text-[#2d728f]">Manajemen Pengguna</h2>
                <p class="text-gray-500 text-sm mt-1">Sistem direktori mahasiswa dan admin AE-ttend</p>
            </div>
            <button id="btnOpenModal" class="bg-pasifik hover:bg-langit text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pasifik/20 active:scale-95">
                <i class="fas fa-user-plus"></i> Tambah User Baru
            </button>
        </div>

        <!-- Toolbar: Search, Filter, Sort & Export -->
        <div class="flex flex-col xl:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            
            <div class="flex-1 relative">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="text" id="searchUser" placeholder="Cari berdasarkan Nama atau NIM/ID..." 
                       class="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik focus:ring-2 focus:ring-pasifik/20 transition-all">
            </div>

            <div class="flex flex-wrap md:flex-nowrap gap-3">
                <select id="filterRole" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik text-gray-600 font-medium min-w-[140px] cursor-pointer">
                    <option value="all">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                </select>

                <select id="filterClass" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik text-gray-600 font-medium min-w-[150px] cursor-pointer">
                    ${classOptions}
                </select>

                <select id="sortUser" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik text-gray-600 font-medium min-w-[160px] cursor-pointer">
                    <option value="name_asc">Nama (A - Z)</option>
                    <option value="name_desc">Nama (Z - A)</option>
                    <option value="class_asc">Kelas (A - Z)</option>
                    <option value="class_desc">Kelas (Z - A)</option>
                </select>

                <button id="btnExportPDF" class="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                    <i class="fas fa-file-pdf"></i> Export PDF
                </button>
            </div>
        </div>

        <!-- Tabel Users -->
        <div class="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table class="w-full text-left border-collapse" id="userTableData">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-100">
                        <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No</th>
                        <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Informasi User</th>
                        <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Hak Akses</th>
                        <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody id="userTableBody" class="bg-white divide-y divide-gray-50">
                    ${rows || `<tr><td colspan="4" class="text-center p-8 text-gray-400 font-medium">Data user tidak ditemukan</td></tr>`}
                </tbody>
            </table>
        </div>

        <!-- SEMUA MODAL HTML KAMU TETAP ADA DI BAWAH SINI (ModalAdd, ModalDelete, ModalEdit, ModalView) -->
        ${getModalHTMLTemplates()} 
    </div>
    `;
}

// Helper pembungkus semua Modal HTML
function getModalHTMLTemplates() {
    return `
    <!-- 1. MODAL ADD USER -->
    <div id="modalAdd" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center hidden transition-all duration-300">
        <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform scale-95 transition-all duration-300">
            <div class="bg-langit p-6 text-white flex justify-between items-center">
                <h3 class="text-xl font-bold">Add New User</h3>
                <button type="button" id="btnCloseModal" class="hover:text-red-300 transition-colors"><i class="fas fa-times text-xl"></i></button>
            </div>
            <form class="p-6 md:p-8 space-y-4" id="formAddUser">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Profile Picture</label>
                    <div class="flex items-center gap-4">
                        <div id="previewContainer" class="hidden">
                            <img id="imgPreview" src="#" class="w-12 h-12 rounded-full object-cover border-2 border-pasifik shadow-sm">
                        </div>
                        <input type="file" id="newUserPic" accept="image/*" required class="flex-1 px-4 py-2 border border-dashed border-slate-300 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-pasifik/10 file:text-pasifik cursor-pointer"/>
                    </div>
                </div>

                <div class="flex p-1 bg-slate-100 rounded-2xl w-full">
                    <button type="button" class="role-btn flex-1 py-2 text-sm font-bold rounded-xl transition-all text-slate-500" data-role="admin">Admin</button>
                    <button type="button" class="role-btn flex-1 py-2 text-sm font-bold rounded-xl transition-all bg-white text-pasifik shadow-sm" data-role="student">Student</button>
                    <input type="hidden" id="newRole" value="student"/>
                </div>

                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><i class="fas fa-user-circle"></i></span>
                    <input type="text" id="newNama" placeholder="Nama Lengkap" required class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pasifik/20 focus:border-pasifik transition-all"/>
                </div>

                <div id="mhsFields" class="grid grid-cols-2 gap-4">
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><i class="fas fa-id-card"></i></span>
                        <input type="text" id="newNim" placeholder="NIM" required class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pasifik/20 focus:border-pasifik transition-all"/>
                    </div>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><i class="fas fa-graduation-cap"></i></span>
                        <input type="text" id="newKelas" placeholder="Kelas" required class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pasifik/20 focus:border-pasifik transition-all"/>
                    </div>
                </div>

                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><i class="fas fa-lock"></i></span>
                    <input type="password" id="newPassword" placeholder="Password" required class="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pasifik/20 focus:border-pasifik transition-all"/>
                    <button type="button" class="toggle-password absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-pasifik"><i class="fas fa-eye"></i></button>
                </div>

                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><i class="fas fa-check-double"></i></span>
                    <input type="password" id="confirmPassword" placeholder="Konfirmasi Password" required class="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-pasifik/20 focus:border-pasifik transition-all"/>
                    <button type="button" class="toggle-password absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-pasifik"><i class="fas fa-eye"></i></button>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="button" id="btnCancelModal" class="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-semibold transition-all">Cancel</button>
                    <button type="submit" class="flex-1 py-3 bg-pasifik text-white rounded-xl font-bold shadow-lg shadow-pasifik/20 hover:bg-langit active:scale-95 transition-all">Save User</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2. MODAL DELETE USER -->
    <div id="modalDelete" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center hidden opacity-0 transition-all duration-300">
        <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transform scale-95 transition-all duration-300 p-8 text-center">
            <div class="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-slate-800 mb-2">Hapus User?</h3>
            <p class="text-slate-500 mb-8 text-sm">Data akan dihapus permanen dari memori sistem (Node Doubly Linked List).</p>
            <div class="flex gap-3">
                <button type="button" class="btn-close-delete flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Batal</button>
                <button type="button" id="btn-confirm-delete" class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95">Ya, Hapus!</button>
            </div>
        </div>
    </div>

    <!-- 3. MODAL VIEW USER -->
    <div id="modalViewUser" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center hidden opacity-0 transition-all duration-300">
        <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transform scale-95 transition-all duration-300 p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-pasifik">Detail User</h3>
                <button type="button" class="btn-close-view text-slate-400 hover:text-red-500 transition-colors"><i class="fas fa-times text-2xl"></i></button>
            </div>
            <div id="viewUserContent" class="space-y-4"></div>
            <div class="mt-8 flex justify-end">
                <button type="button" class="btn-close-view px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Tutup</button>
            </div>
        </div>
    </div>

    <!-- 4. MODAL EDIT USER -->
    <div id="modalEdit" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center hidden opacity-0 transition-all duration-300">
        <div class="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden transform scale-95 transition-all duration-300">
            <div class="bg-pasifik p-6 text-white flex justify-between items-center">
                <h3 class="text-xl font-bold">Edit User Profile</h3>
                <button type="button" class="btn-close-edit"><i class="fas fa-times text-2xl"></i></button>
            </div>
            <form id="formEditUser" class="p-8 space-y-5">
                <div class="flex justify-center mb-2">
                    <div class="relative group">
                        <img id="edit_preview_foto" src="public/images/userPics/default.png" class="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md">
                        <label for="edit_input_file" class="absolute bottom-0 right-0 bg-pasifik text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white">
                            <i class="fas fa-camera text-xs"></i>
                            <input type="file" id="edit_input_file" accept="image/png, image/jpeg, image/jpg" class="hidden">
                        </label>
                    </div>
                </div>

                <div class="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                    <button type="button" id="btn_edit_role_admin" class="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200">Admin</button>
                    <button type="button" id="btn_edit_role_student" class="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200">Student</button>
                    <input type="hidden" id="edit_role">
                </div>

                <div class="space-y-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-black text-pasifik ml-1 tracking-widest uppercase">Nama Lengkap</label>
                        <div class="relative">
                            <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" id="edit_nama" required class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pasifik outline-none transition-all">
                        </div>
                    </div>

                    <div id="container_edit_nim" class="space-y-1">
                        <label class="text-[10px] font-black text-pasifik ml-1 tracking-widest uppercase">NIM (ID)</label>
                        <div class="relative">
                            <i class="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" id="edit_nim" readonly class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed outline-none">
                        </div>
                    </div>

                    <div id="container_edit_kelas" class="space-y-1">
                        <label class="text-[10px] font-black text-pasifik ml-1 tracking-widest uppercase">Kelas</label>
                        <div class="relative">
                            <i class="fas fa-graduation-cap absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" id="edit_kelas" class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pasifik outline-none transition-all">
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="button" class="btn-close-edit flex-1 py-3.5 font-bold text-slate-400 hover:text-slate-600 transition-colors">Batal</button>
                    <button type="submit" class="flex-1 py-3.5 bg-pasifik text-white rounded-2xl font-bold shadow-lg shadow-pasifik/30 hover:brightness-110 active:scale-95 transition-all">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
    `;
}

export function renderAdminAttendance() {
    // 1. Kumpulkan Data Users & Lokasi untuk Modal Form
    const usersList = [];
    let uNode = db.users.head;
    while (uNode) {
        if (uNode.payload.role === 'student') {
            usersList.push(`<option value="${uNode.payload.nim}">${uNode.payload.nama} (${uNode.payload.nim})</option>`);
        }
        uNode = uNode.next;
    }

    const locationsList = db.locations.map(loc => 
        `<option value="${loc.id}">${loc.name}</option>`
    ).join('');

    return `
    <div class="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative">
        
        <!-- HEADER -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div>
                <h2 class="text-2xl font-extrabold text-[#2d728f]">Attendance Records</h2>
                <p class="text-gray-500 text-sm mt-1">Manajemen data presensi, perizinan, dan filter riwayat mahasiswa.</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <button id="btn-create-attendance" class="bg-[#3b8ea5] hover:bg-[#2d728f] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-[#3b8ea5]/20 transition-all active:scale-95 flex items-center gap-2">
                    <i class="fas fa-plus"></i> Manual Input
                </button>
                <button id="btn-generate-absent" class="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2">
                    <i class="fas fa-magic"></i> Auto-Absent
                </button>
            </div>
        </div>

        <!-- TOOLBAR: Search, Filter, Sort, Export -->
        <div class="flex flex-col xl:flex-row gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            
            <div class="flex-1 relative">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="text" id="searchAtt" placeholder="Cari Nama / NIM..." 
                       class="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik focus:ring-2 focus:ring-pasifik/20 transition-all">
            </div>

            <div class="flex flex-wrap lg:flex-nowrap gap-3 items-center">
                <!-- Filter Periode Tanggal -->
                <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1">
                    <input type="date" id="dateFrom" class="bg-transparent text-sm text-gray-600 outline-none cursor-pointer" title="Dari Tanggal">
                    <span class="text-gray-300">-</span>
                    <input type="date" id="dateTo" class="bg-transparent text-sm text-gray-600 outline-none cursor-pointer" title="Sampai Tanggal">
                </div>

                <select id="filterAttType" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik text-gray-600 font-medium cursor-pointer">
                    <option value="all">Semua Tipe</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="sick">Sick</option>
                    <option value="permit">Permit</option>
                    <option value="late">Late</option>
                </select>

                <select id="filterAttStatus" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik text-gray-600 font-medium cursor-pointer">
                    <option value="all">Semua Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>

                <select id="sortAtt" class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pasifik text-gray-600 font-medium cursor-pointer">
                    <option value="date_desc">Terbaru</option>
                    <option value="date_asc">Terlama</option>
                    <option value="name_asc">Nama (A-Z)</option>
                    <option value="name_desc">Nama (Z-A)</option>
                </select>

                <button id="btnExportAttPDF" class="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap">
                    <i class="fas fa-file-pdf"></i> Export PDF
                </button>
            </div>
        </div>
        
        <!-- TABEL -->
        <div class="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#3b8ea5] text-white">
                        <th class="p-4 text-xs font-semibold uppercase tracking-wider">Date & Time</th>
                        <th class="p-4 text-xs font-semibold uppercase tracking-wider">Student</th>
                        <th class="p-4 text-xs font-semibold uppercase tracking-wider">Attendance Info</th>
                        <th class="p-4 text-xs font-semibold uppercase tracking-wider text-center">Status</th>
                        <th class="p-4 text-xs font-semibold uppercase tracking-wider">Notes</th>
                        <th class="p-4 text-xs font-semibold uppercase tracking-wider text-center">Action</th>
                    </tr>
                </thead>
                <tbody id="attendance-tbody" class="divide-y divide-gray-50 bg-white">
                    <!-- Data akan di-render oleh JS -->
                </tbody>
            </table>
        </div>

        ${getAdminAttendanceModalsHTML(usersList, locationsList)}
    </div>
    `;
}

// Pisahkan HTML Modal biar rapih
function getAdminAttendanceModalsHTML(usersList, locationsList) {
    return `
    <!-- (Modal Create) -->
    <div id="modalCreateAttendance" class="fixed inset-0 bg-black/50 z-50 hidden flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-95 p-6">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-bold text-[#2d728f]">Create New Attendance</h3>
                <button type="button" id="btnCloseCreateModal" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fas fa-times text-xl"></i></button>
            </div>
            <form id="formCreateAttendance" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Student</label>
                        <select id="attStudentNim" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" required>
                            <option value="" disabled selected>Select Student</option>
                            ${usersList.join('')}
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                        <select id="attLocationId" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" required>
                            <option value="-">No Location (-)</option>
                            ${locationsList}
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                        <select id="attType" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" required>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="sick">Sick</option>
                            <option value="permit">Permit</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                        <select id="attStatus" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" required>
                            <option value="Approved">Approved</option>
                            <option value="On Time">On Time</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                        <textarea id="attNotes" rows="2" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" placeholder="Optional notes..."></textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" id="btnCancelCreate" class="px-5 py-2 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
                    <button type="submit" class="px-5 py-2 rounded-xl bg-[#3b8ea5] hover:bg-[#2d728f] text-white font-semibold shadow-md transition-all">Save Record</button>
                </div>
            </form>
        </div>
    </div>

    <!-- (Modal Detail) -->
    <div id="modalDetailAttendance" class="fixed inset-0 bg-black/50 z-50 hidden flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-95 p-6">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-bold text-[#2d728f]">Attendance Details</h3>
                <button type="button" id="btnCloseDetailModal" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fas fa-times text-xl"></i></button>
            </div>
            <div id="detailContent" class="space-y-4"></div>
            <div class="mt-6 flex justify-end">
                <button type="button" id="btnCloseDetail" class="px-5 py-2 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 transition-colors">Close</button>
            </div>
        </div>
    </div>

    <!-- (Modal Edit) -->
    <div id="modalEditAttendance" class="fixed inset-0 bg-black/50 z-50 hidden flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-95 p-6">
            <div class="flex justify-between items-center mb-5">
                <h3 class="text-xl font-bold text-[#2d728f]">Edit Attendance</h3>
                <button type="button" id="btnCloseEditModal" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fas fa-times text-xl"></i></button>
            </div>
            <form id="formEditAttendance" class="space-y-4">
                <input type="hidden" id="editAttId">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Student <span class="text-xs font-normal text-gray-400">(Cannot be changed)</span></label>
                        <input type="text" id="editStudentName" class="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg outline-none text-gray-500 cursor-not-allowed" readonly>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                        <select id="editLocationId" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" required>
                            <option value="-">No Location (-)</option>
                            ${locationsList}
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                        <select id="editType" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" required>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="sick">Sick</option>
                            <option value="permit">Permit</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                        <select id="editStatus" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]" required>
                            <option value="Approved">Approved</option>
                            <option value="On Time">On Time</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                        <textarea id="editNotes" rows="2" class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#3b8ea5]"></textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" id="btnCancelEdit" class="px-5 py-2 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
                    <button type="submit" class="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md transition-all">Update Record</button>
                </div>
            </form>
        </div>
    </div>

    <!-- (Modal Approve) -->
<div id="modalApproveAttendance" class="fixed inset-0 bg-black/50 z-50 hidden flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity overflow-y-auto">
            <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-95 duration-200 p-8 text-center my-8">
                <input type="hidden" id="approveAttId"> 
                
                <div class="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-question text-4xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-slate-800 mb-2">Approve Attendance?</h3>
                
                <!-- WADAH LAMPIRAN (Disembunyikan secara default) -->
                <div id="approveAttachmentContainer" class="hidden mb-6 mt-4">
                    <p class="text-sm font-semibold text-gray-600 mb-2 text-left">Lampiran Surat / Bukti:</p>
                    <div class="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center min-h-[100px] max-h-[250px]">
                        <img id="approveAttachmentImg" src="" alt="Attachment" class="max-w-full max-h-[250px] object-contain">
                    </div>
                </div>

                <p class="text-slate-500 mb-8 text-sm leading-relaxed">
                    Apakah Anda yakin ingin merespon presensi ini? Tindakan ini akan mengubah status presensi menjadi <span class="font-bold text-green-600">Approved</span> atau <span class="font-bold text-red-600">Rejected</span>.
                </p>
                <div class="flex gap-3 justify-center mb-4">
                    <button type="button" id="btnCancelApprove" class="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-200 transition-all active:scale-95">
                        No, Reject
                    </button>
                    <button type="button" id="btnConfirmApprove" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-md shadow-green-200 transition-all active:scale-95">
                        Yes, Approve!
                    </button>
                </div>
                
                <!-- Tombol Netral untuk menutup tanpa mengubah status -->
                <button type="button" id="btnCloseApproveModalOnly" class="text-gray-400 hover:text-gray-600 text-sm font-medium underline transition-colors">
                    Tutup (Biarkan Pending)
                </button>
            </div>
        </div>
    `;
}

export function renderAdminLocation() {
    return `
    <div class="max-w-7xl mx-auto">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-langit">
                📍 Lokasi Presensi Mahasiswa
              </h2>
              <p class="text-slate-500 mt-1">
                Daftar lokasi untuk sistem presensi
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Card 1 -->
              <div
                class="bg-pasifik text-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition"
              >
                <img
                  src="../../public/images/locationPics/kanayakan.jpg"
                  class="w-full h-48 object-cover"
                />

                <div class="p-4">
                  <span
                    class="bg-vanila text-red-700 px-3 py-1 text-sm rounded-lg font-bold"
                    >LOK001</span
                  >

                  <h5 class="mt-3 text-lg font-semibold text-vanila">
                    Kampus Utama
                  </h5>
                  <p class="text-sm text-slate-100">
                    Jl. Pendidikan No. 1, Jakarta
                  </p>

                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5002.963967428324!2d107.6174367759406!3d-6.877468793121326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6fd1653ca0f%3A0xac82e41858b63f34!2sPoliteknik%20Manufaktur%20Bandung%20(POLMAN%20BANDUNG)!5e1!3m2!1sen!2sid!4v1777362729157!5m2!1sen!2sid"
                    width="600"
                    height="450"
                    style="border: 0"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    class="w-full h-48 mt-3 rounded-lg border-2 border-orange-300"
                  >
                  </iframe>
                </div>
              </div>

              <!-- Card 2 -->
              <div
                class="bg-pasifik text-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition"
              >
                <img
                  src="../../public/images/locationPics/dajok.jpg"
                  class="w-full h-48 object-cover"
                />

                <div class="p-4">
                  <span
                    class="bg-vanila text-red-700 px-3 py-1 text-sm rounded-lg font-bold"
                    >LOK002</span
                  >

                  <h5 class="mt-3 text-lg font-semibold text-vanila">
                    Kampus Cabang
                  </h5>
                  <p class="text-sm text-slate-100">
                    Jl. Merdeka No. 45, Bandung
                  </p>

                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5003.010099038968!2d107.61475997594067!3d-6.87308719312567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7e2e004b05d%3A0x1cef77ff2e1e0706!2sPolman%20Bandung%20Kampus%20Dago%20Pojok!5e1!3m2!1sen!2sid!4v1777362816215!5m2!1sen!2sid"
                    width="600"
                    height="450"
                    style="border: 0"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    class="w-full h-48 mt-3 rounded-lg border-2 border-orange-300"
                  >
                  </iframe>
                </div>
              </div>
            </div>
          </div>
    `;
}

export function renderAdminAnnouncements() {
    return `
    <div class="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h2 class="text-2xl font-extrabold text-[#2d728f] flex items-center gap-2">
                    <i class="fas fa-bullhorn text-[#f49e4c]"></i> Kelola Pengumuman
                </h2>
                <p class="text-sm text-gray-500 mt-1">Buat dan perbarui informasi untuk portal mahasiswa.</p>
            </div>
            <button id="btn-add-announcement" class="bg-[#3b8ea5] hover:bg-[#2d728f] text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md flex items-center gap-2 active:scale-95">
                <i class="fas fa-plus"></i> Buat Pengumuman
            </button>
        </div>

        <div id="admin-announcement-list" class="space-y-4">
            </div>
    </div>

    <div id="modal-announcement" class="hidden fixed inset-0 bg-gray-900/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4 transition-opacity">
        <div class="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative transform transition-transform scale-95" id="modal-content-announcement">
            <h3 id="modal-title" class="text-2xl font-extrabold text-gray-800 mb-6">Tambah Pengumuman</h3>
            
            <form id="form-announcement" class="space-y-5">
                <input type="hidden" id="announcement-id" value="">
                
                <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Kategori</label>
                    <select id="announcement-category" class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-[#3b8ea5] focus:border-[#3b8ea5] p-3 outline-none cursor-pointer">
                        <option value="Akademik">Akademik</option>
                        <option value="Penting">Penting</option>
                        <option value="Umum">Umum</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Judul Pengumuman</label>
                    <input type="text" id="announcement-title" required placeholder="Contoh: Jadwal UTS..." class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-[#3b8ea5] focus:border-[#3b8ea5] p-3 outline-none transition">
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Isi Pengumuman</label>
                    <textarea id="announcement-content" required rows="5" placeholder="Tulis rincian informasi di sini..." class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-[#3b8ea5] focus:border-[#3b8ea5] p-3 outline-none resize-none transition"></textarea>
                </div>
                
                <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                    <button type="button" id="btn-cancel-announcement" class="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Batal</button>
                    <button type="submit" class="px-5 py-2.5 bg-[#f49e4c] hover:bg-[#e08b3a] text-white font-bold rounded-xl shadow-md transition flex items-center gap-2">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}

export function attachAdminAnnouncementEvents() {
    if (!db.announcements) {
        db.announcements = []; 
    }

    const listContainer = document.getElementById('admin-announcement-list');
    const form = document.getElementById('form-announcement');
    const modal = document.getElementById('modal-announcement');
    const modalContent = document.getElementById('modal-content-announcement');
    const btnAdd = document.getElementById('btn-add-announcement');
    const btnCancel = document.getElementById('btn-cancel-announcement');
    const modalTitle = document.getElementById('modal-title');

    function renderList() {
        if (db.announcements.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                    <i class="fas fa-folder-open text-gray-300 text-4xl mb-3"></i>
                    <p class="text-gray-500 font-medium text-sm">Belum ada pengumuman yang dibuat.</p>
                </div>`;
            return;
        }

        listContainer.innerHTML = db.announcements.slice().reverse().map(ann => {
            let badgeStyle = ann.category === 'Penting' ? 'bg-red-50 text-[#ab3428] border-red-100' :
                             ann.category === 'Akademik' ? 'bg-blue-50 text-[#2d728f] border-blue-100' :
                             'bg-[#f5ee9e]/20 text-[#f49e4c] border-[#f5ee9e]/50';

            return `
            <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition group">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-2.5 py-1 text-[10px] font-black rounded-md uppercase border ${badgeStyle}">${ann.category}</span>
                        <span class="text-xs text-gray-400 font-medium"><i class="far fa-clock"></i> ${ann.date}</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 group-hover:text-[#3b8ea5] transition-colors">${ann.title}</h3>
                    <p class="text-sm text-gray-500 mt-1 line-clamp-2">${ann.content}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button data-id="${ann.id}" class="btn-edit px-3 py-2 bg-[#f5ee9e]/50 text-[#2d728f] font-bold text-xs rounded-xl hover:bg-[#f5ee9e] transition shadow-sm flex items-center gap-1">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button data-id="${ann.id}" class="btn-delete px-3 py-2 bg-red-50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm flex items-center gap-1">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
            `;
        }).join('');

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.currentTarget.dataset.id));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => deleteAnnouncement(e.currentTarget.dataset.id));
        });
    }

    function openModal(id = null) {
        form.reset();
        document.getElementById('announcement-id').value = '';
        modalTitle.innerText = "Buat Pengumuman Baru";

        if (id) {
            const ann = db.announcements.find(a => a.id == id);
            if (ann) {
                modalTitle.innerText = "Edit Pengumuman";
                document.getElementById('announcement-id').value = ann.id;
                document.getElementById('announcement-category').value = ann.category;
                document.getElementById('announcement-title').value = ann.title;
                document.getElementById('announcement-content').value = ann.content;
            }
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => modalContent.classList.replace('scale-95', 'scale-100'), 10);
    }

    function saveToLocalStorage() {
        localStorage.setItem('ae_announcements', JSON.stringify(db.announcements));
    }

    function closeModal() {
        modalContent.classList.replace('scale-100', 'scale-95');
        setTimeout(() => modal.classList.add('hidden'), 200);
    }

    function saveAnnouncement(e) {
        e.preventDefault();
        const id = document.getElementById('announcement-id').value;
        const category = document.getElementById('announcement-category').value;
        const title = document.getElementById('announcement-title').value;
        const content = document.getElementById('announcement-content').value;
        const date = new Date().toISOString().split('T')[0]; 

        if (id) {
            const index = db.announcements.findIndex(a => a.id == id);
            if (index > -1) {
                db.announcements[index] = { id: parseInt(id), category, title, content, date };
            }
        } else {
            const newId = db.announcements.length ? Math.max(...db.announcements.map(a => a.id)) + 1 : 1;
            db.announcements.push({ id: newId, category, title, content, date });
        }

        closeModal();
        renderList();
        saveToLocalStorage();
    }

    function deleteAnnouncement(id) {
        if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?")) {
            db.announcements = db.announcements.filter(a => a.id != id);

            renderList();
            saveToLocalStorage();
        }
    }

    btnAdd.addEventListener('click', () => openModal());
    btnCancel.addEventListener('click', closeModal);
    form.addEventListener('submit', saveAnnouncement);

    renderList();
}

export function attachAdminLocationEvents() {
}