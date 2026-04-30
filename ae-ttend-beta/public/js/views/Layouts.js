export function AdminLayout(content, activeRoute = 'admin-dashboard', user) {
    const navClass = (route) => activeRoute === route 
        ? "flex items-center px-4 py-3 bg-pasifik text-white rounded-xl shadow-md shadow-pasifik/30 transition-colors" 
        : "flex items-center px-4 py-3 hover:bg-pasifik/40 text-white/80 hover:text-white rounded-xl transition-all duration-200";
        
    const iconClass = (route) => activeRoute === route 
        ? "w-5 h-5 mr-3 text-vanila" 
        : "w-5 h-5 mr-3 opacity-70";

    return `
    <div class="flex h-screen w-full">
      <aside class="w-64 flex-shrink-0 bg-langit text-white flex flex-col transition-all duration-300 shadow-xl z-20">
        <div class="h-16 flex items-center px-6 border-b border-pasifik/50">
          <div class="flex items-center gap-3">
            <img src="public/images/logoCerah.png" alt="Logo" class="w-12 h-12 object-contain">
            <h2 class="text-xl font-bold text-vanila tracking-wider">AE-ttend</h2>
          </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a href="#" data-route="admin-dashboard" class="${navClass('admin-dashboard')}">
            <svg class="${iconClass('admin-dashboard')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span class="font-medium">Home</span>
          </a>
          <a href="#" data-route="admin-users" class="${navClass('admin-users')}">
            <svg class="${iconClass('admin-users')}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/></svg>
            <span class="font-medium">Users</span>
          </a>
          <a href="#" data-route="admin-attendance" class="${navClass('admin-attendance')}">
            <svg class="${iconClass('admin-attendance')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <span class="font-medium">Attendance</span>
          </a>
          <a href="#" data-route="admin-locations" class="${navClass('admin-locations')}">
            <svg class="${iconClass('admin-locations')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span class="font-medium">Locations</span>
          </a>
          <a href="#" data-route="admin-announcements" class="${navClass('admin-announcements')}">
            <svg class="${iconClass('admin-announcements')}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 11v2a1 1 0 001 1h2l4 3V7L6 10H4a1 1 0 00-1 1zm13-3l3-2v12l-3-2M14 10v4"/></svg>            <span class="font-medium">Announcements</span>
          </a>
        </nav>
      </aside>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <h1 class="text-xl font-bold text-langit">Halo, Admin!</h1>
          <div class="relative" id="profile-container">
                <button id="profile-btn" class="flex items-center gap-3 bg-langit/10 hover:bg-langit/20 p-1.5 px-3 rounded-lg transition border border-transparent hover:border-langit/20">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-bold text-langit leading-none">${user.payload.nama}</p>
                        <p class="text-[10px] text-gray-600 mt-1">${user.payload.role}</p>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-langit shadow-sm overflow-hidden">
                        <img src="public/images/userPics/${user.payload.userPic}" alt="Profile" />
                    </div>
                    <i class="fas fa-chevron-down text-langit/70 text-xs ml-1" id="profile-icon"></i>
                </button>

                <div id="profile-dropdown" data-route="profile" class="hidden absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div class="p-2 space-y-1">
                        <button class="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#3b8ea5]/10 hover:text-[#2d728f] rounded-xl transition flex items-center gap-3">
                            <i class="fas fa-user-circle text-gray-400 text-xl"></i> Profil Saya
                        </button>
                        <div class="h-px bg-gray-100 my-1"></div>
                        <button data-route="login" class="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-3">
                            <i class="fas fa-sign-out-alt"></i> Keluar
                        </button>
                    </div>
                </div>
            </div>
        </header>
        <main class="flex-1 overflow-y-auto p-8">
            ${content}
        </main>
      </div>
    </div>
    `;
}

export function StudentLayout(content, user, activeRoute = 'overview') {
    const nama = user?.payload?.nama || "Agisna F I";
    const nim = user?.payload?.nim || "225443028";
    
    const navClass = (route) => activeRoute === route 
        ? "nav-item text-white font-semibold border-b-2 border-[#f5ee9e] pb-1 transition-all duration-200" 
        : "nav-item text-gray-300 hover:text-white hover:border-b-2 hover:border-white/30 pb-1 border-b-2 border-transparent transition-all duration-200";
    
    return `
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <header class="sticky top-0 z-50 flex items-center justify-between py-4 px-8 border-b border-gray-100 bg-[#2d728f] shadow-sm">
            <div class="flex items-center gap-2">
                <img src="public/images/logoCerah.png" alt="Logo" class="w-12 h-12 object-contain rounded-md" />
                <span class="font-bold text-xl text-white">AE-ttend</span>
            </div>

            <nav class="hidden md:flex items-center gap-8 nav-menu">
                <button data-route="overview" class="${navClass('overview')}">Overview</button>
                <button data-route="presensi" class="${navClass('presensi')}">Presensi</button>
                <button data-route="announcement" class="${navClass('announcement')}">Announcement</button>
            </nav>

            <div class="relative" id="profile-container">
                <button id="profile-btn" class="flex items-center gap-3 hover:bg-white/10 p-1.5 pr-3 rounded-full transition border border-transparent hover:border-white/20">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-bold text-white leading-none">${nama}</p>
                        <p class="text-[10px] text-gray-200 mt-1">Student</p>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                        <img src="public/images/userPics/${user.payload.userPic}" alt="Profile" />
                    </div>
                    <i class="fas fa-chevron-down text-white/70 text-xs ml-1" id="profile-icon"></i>
                </button>

                <div id="profile-dropdown" data-route="profile" class="hidden absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div class="p-2 space-y-1">
                        <button class="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#3b8ea5]/10 hover:text-[#2d728f] rounded-xl transition flex items-center gap-3">
                            <i class="fas fa-user-circle text-gray-400"></i> Profil Saya
                        </button>
                        <div class="h-px bg-gray-100 my-1"></div>
                        <button data-route="login" class="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-3">
                            <i class="fas fa-sign-out-alt"></i> Keluar
                        </button>
                    </div>
                </div>
            </div>
        </header>
        <main class="flex-1 p-8 overflow-y-auto" id="main-content">
            ${content}
        </main>
    </div>
    `;
}

let isLayoutEventsInitialized = false;

export function initLayoutEvents() {
    if (isLayoutEventsInitialized) return;

    document.addEventListener('click', (e) => {
        const targetRoute = e.target.closest('[data-route]');
        
        if (targetRoute) {
            const route = targetRoute.getAttribute('data-route');
            
            window.dispatchEvent(new CustomEvent('app-navigate', { detail: route }));
        }

        const profileBtn = e.target.closest('#profile-btn');
        const dropdown = document.getElementById('profile-dropdown');
        if (profileBtn) {
            e.stopPropagation();
            dropdown?.classList.toggle('hidden');
        } else {
            dropdown?.classList.add('hidden');
        }
    });

    setInterval(() => {
        const now = new Date();
        
        const clockText = document.getElementById('realtime-clock-text');
        if (clockText) {
            clockText.innerText = now.toLocaleTimeString('id-ID', { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
        }

        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const secondHand = document.getElementById('second-hand');

        if (hourHand && minuteHand && secondHand) {
            const seconds = now.getSeconds();
            const mins = now.getMinutes();
            const hours = now.getHours();

            const secDeg = seconds * 6;
            const minDeg = (mins * 6) + (seconds * 0.1); 
            const hourDeg = ((hours % 12) * 30) + (mins * 0.5); 

            secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
            minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
            hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
        }
    }, 1000);

    isLayoutEventsInitialized = true;
}

export function LoginLayout() {
    return `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="flex w-full max-w-[900px] bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[550px]">

            <div class="w-full md:w-1/2 p-10 sm:p-14 flex flex-col justify-center items-center text-center relative">

            <h1 class="text-3xl font-bold text-gray-900 mb-2">
                Welcome <span style="font-family: 'Dancing Script', cursive; font-weight: 700;" 
                class="text-pasifik text-5xl ml-1 inline-block translate-y-[2px]">
                back!
                </span>
            </h1>
            <p class="text-gray-500 text-sm mb-8 font-medium">Please log in to your account.</p>
                
                <form id="form-login" class="w-full text-left space-y-5">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">NIM</label>
                        <div class="relative flex items-center">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-user text-pasifik"></i> </div>
                        <input type="text" id="login-nim" class="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pasifik outline-none transition-all placeholder:text-gray-400" placeholder="Enter your NIM" required>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <div class="relative flex items-center">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-lock text-pasifik"></i>
                        </div>
                        <input type="password" id="login-password" 
                        class="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pasifik outline-none transition-all placeholder:text-gray-400" 
                        placeholder="Enter password" required>
                        <button type="button" id="toggle-password" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-pasifik transition-colors">
                        <i class="fas fa-eye" id="eye-icon"></i>
                        </button>
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-langit hover:bg-pasifik text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-2">
                        Sign In 
                    </button>
                </form>
            </div>
            <div class="hidden md:block md:w-1/2 relative bg-pasifik">
                <img src="public/images/login.png" alt="bg" class="w-full h-full object-cover opacity-80">
            </div>
        </div>
    </div>
    `;
} 

export function profileLayout(user) {
    const nama = user?.payload?.nama || "Aje Gile";
    const nim = user?.payload?.nim || "1234567890";
    const email = user?.payload?.email || "aje.gile@mahasiswa.univ.ac.id";
    const tanggalLahir = user?.payload?.tanggalLahir || "2002-05-15";
    const noTelp = user?.payload?.noTelp || "081234567890";
    const jenisKelamin = user?.payload?.jenisKelamin || "L";

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };
    const initials = getInitials(nama);

    return `
    <style>
        /* Scoped CSS khusus untuk halaman profil agar tidak bocor ke layout lain */
        .profile-wrapper {
            --primary-teal: #266d84;
            --secondary-teal: #1e586b;
            --accent-yellow: #f8df72;
            --bg-light: #f5f8fa;
            --text-dark: #1f333f;
            --text-gray: #6b7a85;
            --white: #ffffff;
            --border-color: #e5e9eb;
            --input-bg: #f9fafb;
            font-family: 'Inter', sans-serif;
            color: var(--text-dark);
            
            width: 100%;
            min-height: 100vh;
            background-color: var(--bg-light);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
            position: relative; /* Penting untuk tombol absolut */
        }

        .profile-wrapper .content-container {
            width: 100%;
            max-width: 900px;
            margin-top: -60px; /* PERUBAHAN: Menggeser card sedikit ke atas */
        }

        .profile-wrapper .btn-back {
            /* PERUBAHAN: Memindahkan posisi ke kiri atas */
            position: absolute;
            top: 40px;
            left: 60px; /* Jarak dari kiri, tidak terlalu di ujung */
            
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 20px; /* PERUBAHAN: Diperbesar sedikit dari 18px */
            color: var(--primary-teal);
            font-weight: 700;
            text-decoration: none;
            transition: color 0.2s ease;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
        }

        .profile-wrapper .btn-back:hover {
            color: var(--secondary-teal);
        }

        .profile-wrapper .card {
            background-color: var(--white);
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            padding: 30px;
            border-top: 4px solid var(--primary-teal);
        }

        .profile-wrapper .profile-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .profile-wrapper .profile-summary-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .profile-wrapper .avatar-large {
            width: 70px;
            height: 70px;
            background-color: var(--accent-yellow);
            color: var(--primary-teal);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 700;
            font-size: 24px;
            border: 2px solid var(--border-color);
        }

        .profile-wrapper .profile-name h2 {
            font-size: 18px;
            color: var(--text-dark);
            margin-bottom: 4px;
        }

        .profile-wrapper .profile-name p {
            font-size: 14px;
            color: var(--text-gray);
        }

        .profile-wrapper .btn-edit {
            background-color: var(--primary-teal);
            color: var(--white);
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: 0.2s;
        }

        .profile-wrapper .btn-edit:hover {
            background-color: var(--secondary-teal);
        }

        .profile-wrapper .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .profile-wrapper .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            text-align: left;
        }

        .profile-wrapper .form-group label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-dark);
        }

        .profile-wrapper .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            background-color: var(--input-bg);
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-dark);
            transition: 0.2s;
            outline: none;
        }

        .profile-wrapper .form-control:focus {
            border-color: var(--primary-teal);
            background-color: var(--white);
            box-shadow: 0 0 0 3px rgba(38, 109, 132, 0.1);
        }

        .profile-wrapper select.form-control {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7a85' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: calc(100% - 16px) center;
            padding-right: 40px;
        }

        @media (max-width: 768px) {
            .profile-wrapper .form-grid {
                grid-template-columns: 1fr;
            }
            .profile-wrapper .btn-back {
                top: 20px;
                left: 20px; /* Penyesuaian jarak di layar kecil/HP */
            }
        }
    </style>

    <div class="profile-wrapper">
        
        <button data-route="overview" class="btn-back">
            <i class="fa-solid fa-arrow-left"></i> Kembali ke Dashboard
        </button>

        <div class="content-container">
            <div class="card">
                <div class="profile-summary">
                    <div class="profile-summary-left">
                        <div class="avatar-large">${initials}</div>
                        <div class="profile-name">
                            <h2>${nama}</h2>
                            <p>${email}</p>
                        </div>
                    </div>
                    <button class="btn-edit" id="btnRegisterFace" data-route="register-face">Register Face</button>
                    <button class="btn-edit" data-route="profile">Edit Profil</button>
                </div>

                <form class="profile-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="nama">Nama Lengkap</label>
                            <input type="text" id="nama" class="form-control" value="${nama}" readonly>
                        </div>

                        <div class="form-group">
                            <label for="nim">NIM</label>
                            <input type="text" id="nim" class="form-control" value="${nim}" readonly>
                        </div>

                        <div class="form-group">
                            <label for="jenis_kelamin">Jenis Kelamin</label>
                            <select id="jenis_kelamin" class="form-control" disabled>
                                <option value="L" ${jenisKelamin === 'L' ? 'selected' : ''}>Laki-laki</option>
                                <option value="P" ${jenisKelamin === 'P' ? 'selected' : ''}>Perempuan</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="tanggal_lahir">Tanggal Lahir</label>
                            <input type="date" id="tanggal_lahir" class="form-control" value="${tanggalLahir}" readonly>
                        </div>

                        <div class="form-group">
                            <label for="email">Alamat Email</label>
                            <input type="email" id="email" class="form-control" value="${email}" readonly>
                        </div>

                        <div class="form-group">
                            <label for="no_telp">No. Telepon / WhatsApp</label>
                            <input type="tel" id="no_telp" class="form-control" value="${noTelp}" readonly>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    </div>
    `;
}

export function RegisterFaceLayout(user) {
    return `
    <style>
        .camera-wrapper {
            --primary-teal: #266d84;
            --bg-light: #f5f8fa;
            width: 100%;
            min-height: 100vh;
            background-color: var(--bg-light);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
        }

        .camera-wrapper .btn-back {
            position: absolute;
            top: 40px;
            left: 60px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 20px;
            color: var(--primary-teal);
            font-weight: 700;
            background: none;
            border: none;
            cursor: pointer;
            transition: 0.2s;
        }

        .camera-card {
            width: 100%;
            max-width: 500px;
            margin-top: -40px;
            padding: 30px;
            border-radius: 16px;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border-top: 4px solid var(--primary-teal);
        }

        .camera-container {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            margin: 20px 0;
            overflow: hidden;
            border-radius: 12px;
            background: #000;
        }

        .camera-container video,
        .camera-container canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Video di-flip horizontal agar seperti cermin */
        #vid {
            transform: scaleX(-1);
            filter: contrast(1.2) brightness(1.1) sepia(0.2) grayscale(0.1) saturate(1.3) hue-rotate(10deg);
        }

        #overlay { z-index: 2; pointer-events: none; }
        #scanCanvas { z-index: 3; pointer-events: none; }

        .loading-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary-teal);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 768px) {
            .camera-wrapper .btn-back { top: 20px; left: 20px; }
        }
    </style>

    <div class="camera-wrapper">
        <button data-route="profile" class="btn-back" id="btn-back-camera">
            <i class="fa-solid fa-arrow-left"></i> Kembali ke Profil
        </button>

        <div class="camera-card">
            <h2 class="text-2xl font-bold text-gray-800 text-center mb-2">Registrasi Wajah</h2>
            <p class="text-sm text-gray-500 text-center mb-4">Posisikan wajahmu di tengah bingkai kamera.</p>
            
            <div class="camera-container">
                <video id="vid" autoplay muted playsinline></video>
                <canvas id="overlay"></canvas>
                <canvas id="scanCanvas"></canvas>
                <div id="loadingOverlay" class="loading-overlay" style="display: none;">
                    <div class="loading-spinner"></div>
                </div>
            </div>

            <button id="registerBtn" disabled class="w-full py-3 bg-[#266d84] hover:bg-[#1e586b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
                Mulai Registrasi Wajah
            </button>
            <div id="registerStatus" class="mt-4 p-3 rounded-lg text-center text-sm font-medium hidden"></div>
        </div>
    </div>
    `;
}