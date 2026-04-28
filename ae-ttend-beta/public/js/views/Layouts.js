export function AdminLayout(content, activeRoute = 'admin-dashboard') {
    // Fungsi penentu class aktif/tidak aktif
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
            <div class="w-8 h-8 bg-vanila rounded-lg flex items-center justify-center shadow-inner">
              <svg class="w-5 h-5 text-langit" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
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
        </nav>
      </aside>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <h1 class="text-xl font-bold text-langit">Halo, Admin!</h1>
          <button data-route="login" class="text-red-500 font-bold"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </header>
        <main class="flex-1 overflow-y-auto p-8">
            ${content}
        </main>
      </div>
    </div>
    `;
}

export function StudentLayout(content, user) {
    const nama = user?.payload?.nama || "Agisna F I";
    const nim = user?.payload?.nim || "225443028";
    const avatarName = nama.split(' ').join('+');

    initLayoutEvents();
    
    return `
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <header class="sticky top-0 z-50 flex items-center justify-between py-4 px-8 border-b border-gray-100 bg-[#2d728f] shadow-sm">
            <div class="flex items-center gap-2">
                <img src="../../public/images/assets/Logo.jpeg" alt="Logo" class="w-8 h-8 object-contain rounded-md" />
                <span class="font-bold text-xl text-white">ae-ttend</span>
            </div>

            <nav class="hidden md:flex items-center gap-8 nav-menu">
                <button data-route="overview" class="nav-item text-white font-semibold border-b-2 border-[#f5ee9e] pb-1">Overview</button>
                <button data-route="presensi" class="nav-item text-gray-300 hover:text-white transition">Presensi</button>
                <button data-route="announcement" class="nav-item text-gray-300 hover:text-white transition">Announcement</button>
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

                <div id="profile-dropdown" class="hidden absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div class="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p class="text-sm font-bold text-gray-800 truncate">${nama}</p>
                        <p class="text-xs text-gray-500 font-mono mt-1">${nim}</p>
                    </div>
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

export function initLayoutEvents(user) {
    document.addEventListener('click', (e) => {
        const targetRoute = e.target.closest('[data-route]');
        
        if (targetRoute) {
            const route = targetRoute.getAttribute('data-route');
  
            if (route === 'login') {
                window.location.reload();
                return;
            }

            navigate(route, user);
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
}

export function LoginLayout() {
    return `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="flex w-full max-w-[900px] bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[550px]">

            <div class="w-full md:w-1/2 p-10 sm:p-14 flex flex-col justify-center relative">
            <img src="public/images/logo.png" alt="Logo" class="w-16 h-auto mb-8">

                <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                <p class="text-gray-500 text-sm mb-8 font-medium">Please log in to your account.</p>
                
                <form id="form-login" class="space-y-5">
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
                <img src="public/images/asset-login.jpeg" alt="bg" class="w-full h-full object-cover opacity-80">
            </div>
        </div>
    </div>
    `;
} 