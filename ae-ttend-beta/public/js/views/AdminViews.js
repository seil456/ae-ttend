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
    let rows = '';
    let current = db.users.head;
    let index = 1;

    while (current) {
        rows += `
        <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
            <td class="p-4 text-sm text-gray-600">${index++}</td>
            <td class="p-4 text-sm font-semibold text-gray-700">
            <div class="flex items-center space-x-2">
                <div class="w-12 h-12 rounded-full bg-[#3b8ea5]/20 text-[#3b8ea5] flex items-center justify-center font-bold">
                    <img src="public/images/userPics/${current.payload.userPic}" alt="${current.payload.nama}" class="w-full h-full object-cover rounded-full">
                </div>
                <div class="text-gray-700 font-lg flex flex-col">
                    ${current.payload.nama}
                    <div class="text-xs text-gray-500 font-normal">
                        ${current.payload.kelas} | ID: ${current.id}
                    </div>
                </div>
            </div>
            </td>
            <td class="p-4 text-center">
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">${current.payload.role}</span>
            </td>
            <td class="p-4 text-center">
                <button class="btn-del-user text-red-500 hover:scale-125 transition-transform" data-id="${current.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
        current = current.next;
    }

    return `
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="text-2xl font-bold text-[#2d728f]">Users Management</h2>
                <p class="text-gray-500 text-sm">Linear search pada Doubly Linked List</p>
            </div>
        </div>
        <div class="overflow-x-auto rounded-xl border border-gray-100">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#3b8ea5] text-white">
                        <th class="p-4 text-xs font-semibold uppercase">No</th>
                        <th class="p-4 text-xs font-semibold uppercase">User</th>
                        <th class="p-4 text-xs font-semibold uppercase text-center">Role</th>
                        <th class="p-4 text-xs font-semibold uppercase text-center">Action</th>
                    </tr>
                </thead>
                <tbody>${rows || `<tr><td colspan="5" class="text-center p-4">Data Kosong</td></tr>`}</tbody>
            </table>
        </div>
    </div>
    `;
}

export function renderAdminAttendance() {
    let rows = '';
    let current = db.attendance.head;

    while (current) {
        const student = db.users.findWhere('nim', current.payload.nim);
        const studentName = student ? student.payload.nama : 'Unknown';

        rows += `
        <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
            <td class="p-4 text-sm font-semibold">${current.payload.nim}</td>
            <td class="p-4 text-sm">${studentName}</td>
            <td class="p-4 text-sm">${current.payload.date}</td>
            <td class="p-4 text-sm text-center">${current.payload.status}</td>
            <td class="p-4 text-sm text-center">${current.payload.notes}</td>
        </tr>`;
        current = current.next;
    }

    return `
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="text-2xl font-bold text-[#2d728f]">Attendance Records</h2>
            </div>
            <button id="btn-generate-absent" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all">
                <i class="fas fa-magic"></i> Generate Absent
            </button>
        </div>
        <div class="overflow-x-auto rounded-xl border border-gray-100">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-[#3b8ea5] text-white">
                        <th class="p-4 text-xs font-semibold uppercase">NIM</th>
                        <th class="p-4 text-xs font-semibold uppercase">Student</th>
                        <th class="p-4 text-xs font-semibold uppercase">Date</th>
                        <th class="p-4 text-xs font-semibold uppercase text-center">Status</th>
                        <th class="p-4 text-xs font-semibold uppercase text-center">Notes</th>
                    </tr>
                </thead>
                <tbody id="attendance-tbody">${rows || `<tr><td colspan="5" class="text-center p-4">Belum ada presensi</td></tr>`}</tbody>
            </table>
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