import { db } from '../core/Database.js';

function calculateHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
    
}

export function renderStudentDashboard(user) {
    const nama = user?.payload?.nama || "Agisna F I";
    const nim = user?.payload?.nim || "225443028";
    const kelas = user?.payload?.kelas || "Teknologi Rekayasa Informatika Industri";

    return `
    <div class="flex flex-col xl:flex-row gap-8">
        <div class="flex-1 space-y-8">
            <div class="bg-[#2d728f] rounded-3xl p-8 flex items-center text-white relative overflow-hidden shadow-xl border border-gray-200 group">
                <div class="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                <div class="absolute bottom-6 left-1/4 w-8 h-8 border-[3px] border-white/10 rounded-full z-0 pointer-events-none"></div>
                <div class="absolute top-8 left-1/2 text-white/20 text-2xl font-black rotate-12 z-0 pointer-events-none">+</div>
                <div class="absolute bottom-10 right-1/4 w-3 h-3 bg-[#f49e4c]/50 rounded-full z-0 pointer-events-none"></div>

                <div class="z-10 flex flex-col md:flex-row items-start md:items-center gap-10 lg:gap-16 w-full">
                    
                    <div class="flex-1">
                        <span class="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-wider text-[#f5ee9e] border border-white/20 backdrop-blur-sm mb-3 inline-block">STUDENT PORTAL</span>
                        <h2 class="text-xl opacity-90 text-white mt-2">Welcome back,</h2>
                        <h1 class="text-4xl font-extrabold mt-1 tracking-tight">${nama}</h1>
                        
                        <div class="mt-5 inline-flex flex-wrap items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-sm">
                            <i class="fas fa-id-card text-[#f5ee9e]"></i>
                            <span class="text-[#f5ee9e] font-mono text-sm tracking-wide">
                                ${nim} 
                                <span class="mx-2 text-white/40">|</span> 
                                <span class="font-sans font-semibold text-white/90">${kelas}</span>
                            </span>
                        </div>
                    </div>

                    <div class="hidden md:block w-48 lg:w-64">
                        <div class="drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500">
                            </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div class="bg-[#3b8ea5] p-6 rounded-3xl shadow-[0_8px_30px_rgb(59,142,165,0.3)] flex flex-col relative overflow-hidden group">
                    <div class="absolute top-6 right-[-20px] w-32 h-10 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
                    <div class="absolute bottom-6 right-6 w-12 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm border border-white/20">
                        <i class="fas fa-check text-white text-lg drop-shadow-md"></i>
                    </div>

                    <h3 class="font-bold text-white/70 text-xs tracking-widest uppercase mb-4 relative z-10">Clock In Status</h3>
                    <div class="flex items-end gap-2 mb-2 relative z-10">
                        <span class="text-4xl font-extrabold text-white leading-none drop-shadow-sm">07:15</span>
                        <span class="text-sm font-bold text-white/80 mb-1">AM</span>
                    </div>
                    <div class="mt-auto pt-4 relative z-10">
                        <span class="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wide border border-white/30 backdrop-blur-sm shadow-sm">Arrive on Time</span>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center hover:shadow-lg transition-shadow">
                    <h3 class="font-bold text-gray-500 text-xs tracking-widest uppercase self-start w-full mb-2">Monthly Rate</h3>
                    <div class="relative flex items-center justify-center mt-2 flex-1 w-full">
                        
                        <div class="relative w-24 h-24 flex items-center justify-center">
                            <div class="absolute inset-0 rounded-full border-[10px] border-gray-100"></div>
                            <div class="absolute inset-0 rounded-full border-[10px] border-[#f49e4c] border-t-transparent -rotate-45"></div>
                            
                            <span class="text-2xl font-black text-gray-800 z-10">95<span class="text-sm text-gray-400">%</span></span>
                        </div>

                    </div>
                    <p class="text-[10px] font-bold text-gray-400 mt-3 bg-gray-50 px-3 py-1 rounded-full">19 of 20 Days</p>
                </div>
                
                <div class="relative bg-gray-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col justify-end group min-h-[180px] cursor-pointer">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200 opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-[#2d728f] via-[#2d728f]/60 to-transparent"></div>
                    
                    <div class="relative z-10">
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-1 drop-shadow-md">Last Location</h3>
                                <p class="text-white font-bold text-sm leading-tight drop-shadow-md">Polman Bandung<br><span class="font-normal text-xs text-[#f5ee9e]">Kanayakan Lama</span></p>
                            </div>
                            <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-white group-hover:text-[#2d728f] transition-colors shadow-lg">
                                <i class="fas fa-location-arrow"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="font-bold text-gray-800 text-lg">Timeline History</h3>
                    <a href="#" class="text-xs font-bold px-4 py-2 bg-[#3b8ea5]/10 text-[#3b8ea5] rounded-full hover:bg-[#3b8ea5] hover:text-white transition-colors">View all</a>
                </div>
                
                <div class="relative pl-6 border-l-2 border-gray-100 space-y-8 mt-2 ml-2">
                    
                    <div class="relative">
                        <div class="absolute -left-[33px] top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <i class="fas fa-sign-in-alt"></i>
                                </div>
                                <div>
                                    <p class="font-bold text-gray-800 text-sm">Check In Successful</p>
                                    <p class="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-0.5"><i class="fas fa-map-marker-alt text-gray-300"></i> Polman Bandung</p>
                                </div>
                            </div>
                            <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                                <span class="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wide">On Time</span>
                                <p class="font-bold text-gray-800 text-sm mt-1">07:15 AM</p>
                            </div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="absolute -left-[33px] top-1 w-4 h-4 bg-[#f49e4c] rounded-full border-4 border-white shadow-sm"></div>
                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-[#f49e4c]/10 text-[#f49e4c] rounded-xl flex items-center justify-center text-lg group-hover:bg-[#f49e4c] group-hover:text-white transition-colors">
                                    <i class="fas fa-sign-out-alt"></i>
                                </div>
                                <div>
                                    <p class="font-bold text-gray-800 text-sm">Check Out Recorded</p>
                                    <p class="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-0.5"><i class="fas fa-map-marker-alt text-gray-300"></i> Polman Bandung</p>
                                </div>
                            </div>
                            <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                                <span class="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wide">Normal</span>
                                <p class="font-bold text-gray-800 text-sm mt-1">16:30 PM <span class="text-[10px] font-normal text-gray-400 ml-1">Yesterday</span></p>
                            </div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="absolute -left-[33px] top-1 w-4 h-4 bg-[#ab3428] rounded-full border-4 border-white shadow-sm"></div>
                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-[#ab3428]/10 text-[#ab3428] rounded-xl flex items-center justify-center text-lg group-hover:bg-[#ab3428] group-hover:text-white transition-colors">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div>
                                    <p class="font-bold text-gray-800 text-sm">Check In with Warning</p>
                                    <p class="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-0.5"><i class="fas fa-map-marker-alt text-gray-300"></i> Polman Bandung</p>
                                </div>
                            </div>
                            <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                                <span class="px-3 py-1 bg-[#ab3428]/10 text-[#ab3428] text-[10px] font-bold rounded-full uppercase tracking-wide">Late</span>
                                <p class="font-bold text-gray-800 text-sm mt-1">07:45 AM <span class="text-[10px] font-normal text-gray-400 ml-1">Yesterday</span></p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <aside class="w-full xl:w-[350px] flex flex-col gap-8">
            
            <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div class="flex justify-between items-center mb-6">
                    <div id="calendar-header">
                        <span class="text-sm font-bold text-gray-800" id="month-date-display">Month 00</span>
                        <span class="text-sm text-gray-400 ml-1" id="day-display">Day</span>
                    </div>
                    <div class="flex gap-2 text-gray-400 font-bold">
                        <button class="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition">&lt;</button>
                        <button class="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition">&gt;</button>
                    </div>
                </div>
                <div class="grid grid-cols-7 text-center text-xs font-bold tracking-wide text-[#f49e4c] mb-4">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div id="calendar-days" class="grid grid-cols-7 text-center text-sm text-gray-600 gap-y-4"></div>
            </div>

            <div class="bg-gradient-to-br from-[#2d728f] to-slate-800 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
                <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-[#3b8ea5]/50 rounded-full blur-3xl"></div>
                
                <div class="relative z-10 flex justify-between items-start mb-5 flex-col gap-2">
                    <h3 class="font-bold opacity-90 text-lg">Announcements</h3>
                    <span class="bg-[#f5ee9e] text-[#2d728f] text-[10px] px-3 py-1 rounded-full font-black tracking-wide shadow-sm flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#ab3428] animate-pulse"></span> 1 New</span>
                </div>
                <div class="relative z-10 space-y-3">
                    <div class="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/20 transition-all hover:-translate-y-1 shadow-sm">
                        <p class="text-[10px] text-[#f5ee9e] font-bold mb-1"><i class="fas fa-bell mr-1"></i> Apr 25, 2026</p>
                        <p class="text-sm font-bold leading-relaxed">Libur Nasional & Cuti Bersama</p>
                    </div>
                    <div class="p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all hover:-translate-y-1">
                        <p class="text-[10px] text-gray-400 font-bold mb-1"><i class="fas fa-map mr-1"></i> Apr 20, 2026</p>
                        <p class="text-xs font-medium leading-relaxed text-gray-300">Pembaruan batas radius GPS.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h3 class="font-bold text-gray-800 mb-5">Summary <span class="text-gray-400 font-medium">This Month</span></h3>
                <div class="space-y-5">
                    <div>
                        <div class="flex justify-between text-xs mb-2">
                            <span class="text-gray-500 font-bold flex items-center gap-2"><i class="fas fa-circle text-[8px] text-[#3b8ea5]"></i> On Time</span>
                            <span class="font-black text-gray-800">15 Days</span>
                        </div>
                        <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div class="bg-gradient-to-r from-[#2d728f] to-[#3b8ea5] h-full w-[75%] rounded-full relative"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-xs mb-2">
                            <span class="text-gray-500 font-bold flex items-center gap-2"><i class="fas fa-circle text-[8px] text-[#ab3428]"></i> Late</span>
                            <span class="font-black text-gray-800">2 Days</span>
                        </div>
                        <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div class="bg-gradient-to-r from-red-500 to-[#ab3428] h-full w-[10%] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-xs mb-2">
                            <span class="text-gray-500 font-bold flex items-center gap-2"><i class="fas fa-circle text-[8px] text-[#f49e4c]"></i> Permit / Sick</span>
                            <span class="font-black text-gray-800">2 Days</span>
                        </div>
                        <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div class="bg-gradient-to-r from-orange-400 to-[#f49e4c] h-full w-[10%] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

        </aside>
    </div>
    `;
}

export function initCalendar() {
    const monthDateDisplay = document.getElementById("month-date-display");
    const dayDisplay = document.getElementById("day-display");
    const calendarDays = document.getElementById("calendar-days");

    if (!calendarDays || !monthDateDisplay || !dayDisplay) return;

    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    const today = date.getDate();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    monthDateDisplay.innerText = `${monthNames[currentMonth]} ${today}`;
    dayDisplay.innerText = dayNames[date.getDay()];

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const lastDayDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    let daysHTML = "";

    for (let i = 0; i < firstDayIndex; i++) {
        daysHTML += `<div class="h-8"></div>`;
    }

    for (let i = 1; i <= lastDayDate; i++) {
        if (i === today) {
            daysHTML += `
                <div class="flex items-center justify-center">
                    <div class="bg-[#f49e4c] text-white w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-[0_4px_12px_rgba(244,158,76,0.4)] transform scale-110 cursor-default">
                        ${i}
                    </div>
                </div>
            `;
        } else {
            daysHTML += `
                <div class="flex items-center justify-center group">
                    <div class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 font-medium transition-all duration-300 cursor-pointer group-hover:bg-[#3b8ea5]/10 group-hover:text-[#3b8ea5] group-hover:font-bold group-hover:scale-110">
                        ${i}
                    </div>
                </div>
            `;
        }
    }

    calendarDays.innerHTML = daysHTML;
}

export function renderStudentAttendance(user) {
    const nama = user?.payload?.nama || "Agisna F I";
    const nim = user?.payload?.nim || "225443028";

    return `
    <style>
        .scan-animation {
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(59, 130, 246, 0) 100%);
            animation: scanAnimation 2s ease-in-out infinite;
        }
        .scan-border {
            animation: pulseBorder 2s ease-in-out infinite;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.5);
        }
        .face-target {
            animation: targetPulse 3s ease-in-out infinite;
        }
        @keyframes scanAnimation {
            0% { transform: translateY(-100%); opacity: 0.7; }
            50% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0.7; }
        }
        @keyframes pulseBorder {
            0% { opacity: 0.5; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.5; transform: scale(0.98); }
        }
        @keyframes targetPulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
    </style>

    <div class="flex flex-col lg:flex-row gap-8">
        
        <div class="flex-[2] flex flex-col gap-6">
            
            <div class="bg-gray-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-gray-800 flex flex-col min-h-[600px]">
                
                <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div class="absolute -top-32 -right-32 w-96 h-96 bg-[#3b8ea5]/20 rounded-full blur-3xl pointer-events-none"></div>

                <div class="relative z-10 flex justify-between items-center mb-8">
                    <div>
                        <h2 class="text-white font-extrabold text-2xl tracking-tight">Live Attendance</h2>
                        <p class="text-gray-400 text-sm mt-1">Sistem Verifikasi Wajah & Geofencing</p>
                    </div>
                    <span class="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                        <i class="fas fa-circle text-[8px]"></i> LIVE
                    </span>
                </div>

                <div class="relative z-10 flex justify-center items-center mb-10 max-w-md mx-auto w-full">
                    <div class="flex flex-col items-center relative z-10">
                        <div id="step-1-circle" class="w-10 h-10 rounded-full bg-[#3b8ea5] text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,142,165,0.5)] transition-colors duration-300">1</div>
                        <span id="step-1-text" class="absolute -bottom-6 text-xs font-bold text-white whitespace-nowrap">Geofencing</span>
                    </div>
                    <div id="step-line-1" class="flex-1 h-1 bg-gray-700 mx-2 rounded-full transition-colors duration-300"></div>
                    
                    <div class="flex flex-col items-center relative z-10">
                        <div id="step-2-circle" class="w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold border-2 border-gray-600 transition-colors duration-300">2</div>
                        <span id="step-2-text" class="absolute -bottom-6 text-xs font-medium text-gray-500 whitespace-nowrap">Face Scan</span>
                    </div>
                    <div id="step-line-2" class="flex-1 h-1 bg-gray-700 mx-2 rounded-full transition-colors duration-300"></div>
                    
                    <div class="flex flex-col items-center relative z-10">
                        <div id="step-3-circle" class="w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold border-2 border-gray-600 transition-colors duration-300"><i class="fas fa-check"></i></div>
                        <span id="step-3-text" class="absolute -bottom-6 text-xs font-medium text-gray-500 whitespace-nowrap">Complete</span>
                    </div>
                </div>

                <div class="relative z-10 flex-1 flex flex-col items-center justify-center mt-6">
                    
                    <div id="loading-state" class="flex flex-col items-center text-center">
                        <i class="fas fa-satellite-dish text-[#3b8ea5] text-5xl mb-4 animate-pulse"></i>
                        <p id="status-text" class="text-[#f5ee9e] font-mono text-sm tracking-widest">Mencari koordinat satelit...</p>
                    </div>

                    <div id="camera-state" class="hidden relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#3b8ea5]">
                        <video id="live-video" class="w-full h-full object-cover transform -scale-x-100" autoplay muted playsinline></video>
                        <div class="scan-animation absolute inset-0 rounded-full pointer-events-none z-10"></div>
                        <div class="scan-border absolute inset-0 rounded-full border-2 border-[#3b8ea5]/50 pointer-events-none z-10"></div>
                        <div class="face-target absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-48 border-2 border-dashed border-[#f5ee9e]/70 rounded-[100px/120px] pointer-events-none z-20"></div>
                    </div>

                    <div id="error-state" class="hidden flex-col items-center text-center bg-red-500/10 p-6 rounded-2xl border border-red-500/20 backdrop-blur-sm max-w-sm">
                        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-3"></i>
                        <h3 class="text-white font-bold mb-1">Verifikasi Gagal</h3>
                        <p id="error-message" class="text-gray-300 text-xs mb-5">Anda berada di luar radius kampus. Jarak: 250m.</p>
                        <button id="btn-retry" class="px-6 py-2 bg-[#ab3428] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-lg">Coba Lagi</button>
                    </div>

                    <div id="complete-state" class="hidden flex-col items-center text-center bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md max-w-sm w-full">
                        <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                            <i class="fas fa-check text-white text-4xl"></i>
                        </div>
                        <h3 class="text-white font-extrabold text-2xl">Berhasil!</h3>
                        <p class="text-gray-400 text-xs mt-1 mb-6">Presensi tercatat pada <span id="time-recorded" class="font-bold text-white">07:15 AM</span></p>
                        
                        <div class="bg-gray-900/50 w-full p-4 rounded-xl text-left space-y-2 border border-white/5">
                            <p class="text-xs text-gray-400">Nama: <span class="text-white font-semibold float-right">${nama}</span></p>
                            <p class="text-xs text-gray-400">NIM: <span class="text-[#f5ee9e] font-mono float-right">${nim}</span></p>
                            <p class="text-xs text-gray-400">Status: <span class="text-green-400 font-bold float-right">On Time</span></p>
                        </div>
                        <button id="btn-done" class="mt-6 w-full py-3 bg-[#3b8ea5] hover:bg-[#2d728f] text-white font-bold rounded-xl transition shadow-lg">Kembali ke Dashboard</button>
                    </div>

                </div>
            </div>
        </div>

        <div class="flex-1">
            <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-28">
                
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-12 h-12 bg-[#f49e4c]/10 text-[#f49e4c] rounded-2xl flex items-center justify-center text-xl">
                        <i class="fas fa-envelope-open-text"></i>
                    </div>
                    <div>
                        <h3 class="font-extrabold text-gray-800 text-lg">Pengajuan Absen</h3>
                        <p class="text-xs text-gray-400">Sakit atau keperluan mendesak</p>
                    </div>
                </div>

                <form id="form-perizinan" class="space-y-5">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Kategori</label>
                        <div class="grid grid-cols-2 gap-3">
                            <label class="relative cursor-pointer">
                                <input type="radio" name="kategori" value="sakit" class="peer sr-only" checked>
                                <div class="p-3 text-center border-2 border-gray-100 rounded-xl peer-checked:border-[#ab3428] peer-checked:bg-[#ab3428]/5 transition">
                                    <i class="fas fa-procedures text-[#ab3428] mb-1"></i>
                                    <p class="text-xs font-bold text-gray-700">Sakit</p>
                                </div>
                            </label>
                            <label class="relative cursor-pointer">
                                <input type="radio" name="kategori" value="izin" class="peer sr-only">
                                <div class="p-3 text-center border-2 border-gray-100 rounded-xl peer-checked:border-[#f49e4c] peer-checked:bg-[#f49e4c]/5 transition">
                                    <i class="fas fa-suitcase-rolling text-[#f49e4c] mb-1"></i>
                                    <p class="text-xs font-bold text-gray-700">Izin</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Tanggal</label>
                        <input type="date" class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-[#3b8ea5] focus:border-[#3b8ea5] block p-3 outline-none transition">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Keterangan Singkat</label>
                        <textarea rows="3" placeholder="Tuliskan alasan pengajuan..." class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-[#3b8ea5] focus:border-[#3b8ea5] block p-3 outline-none transition resize-none"></textarea>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Bukti / Surat Dokter (Opsional)</label>
                        <div class="flex items-center justify-center w-full">
                            <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <i class="fas fa-cloud-upload-alt text-gray-400 mb-2 text-xl"></i>
                                    <p class="text-xs text-gray-500"><span class="font-semibold">Klik untuk unggah</span> file</p>
                                </div>
                                <input id="dropzone-file" type="file" class="hidden" />
                            </label>
                        </div>
                    </div>

                    <button type="button" class="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2">
                        <i class="fas fa-paper-plane"></i> Kirim Pengajuan
                    </button>
                </form>

            </div>
        </div>
    </div>
    `;
}

export function initAttendanceEvents() {
    // Definisi Elemen DOM
    const loadingState = document.getElementById('loading-state');
    const cameraState = document.getElementById('camera-state');
    const errorState = document.getElementById('error-state');
    const completeState = document.getElementById('complete-state');
    
    const statusText = document.getElementById('status-text');
    const errorMessage = document.getElementById('error-message');
    const videoElement = document.getElementById('live-video');
    const btnRetry = document.getElementById('btn-retry');
    const btnDone = document.getElementById('btn-done');

    let mediaStream = null;

    // Fungsi utilitas untuk mengubah warna indikator langkah (Step)
    function updateStep(stepNumber, status) {
        const circle = document.getElementById(`step-${stepNumber}-circle`);
        const text = document.getElementById(`step-${stepNumber}-text`);
        const line = document.getElementById(`step-line-${stepNumber}`); // bisa null untuk step terakhir
        
        if (status === 'active') {
            circle.className = "w-10 h-10 rounded-full bg-[#3b8ea5] text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,142,165,0.5)] transition-colors duration-300";
            text.className = "absolute -bottom-6 text-xs font-bold text-white whitespace-nowrap";
            if(line) line.className = "flex-1 h-1 bg-[#3b8ea5] mx-2 rounded-full transition-colors duration-300";
        } else if (status === 'done') {
            circle.innerHTML = '<i class="fas fa-check"></i>';
            circle.className = "w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold transition-colors duration-300";
            text.className = "absolute -bottom-6 text-xs font-bold text-green-400 whitespace-nowrap";
            if(line) line.className = "flex-1 h-1 bg-green-500 mx-2 rounded-full transition-colors duration-300";
        }
    }

    // 1. Mulai Geofencing (Simulasi)
    function startGeofencing() {
        loadingState.classList.remove('hidden');
        cameraState.classList.add('hidden');
        errorState.classList.add('hidden');
        statusText.innerText = "Memverifikasi lokasi Anda...";
        
        updateStep(1, 'active');

        // Simulasi request GPS memakan waktu 2 detik
        setTimeout(() => {
            // Anggap Lokasi Berhasil
            updateStep(1, 'done');
            startFaceRecognition();
        }, 2000);
    }

    // 2. Mulai Kamera & Face Recognition (Simulasi)
    function startFaceRecognition() {
        loadingState.classList.add('hidden');
        cameraState.classList.remove('hidden');
        updateStep(2, 'active');

        // Nyalakan Kamera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    mediaStream = stream;
                    videoElement.srcObject = stream;
                    
                    // Simulasi Scan Wajah memakan waktu 4 detik
                    setTimeout(() => {
                        finishAttendance();
                    }, 4000);
                })
                .catch(err => {
                    showError("Kamera tidak dapat diakses. Mohon periksa izin browser.");
                });
        } else {
            showError("Browser Anda tidak mendukung akses kamera.");
        }
    }

    // 3. Matikan Kamera
    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    }

    // 4. Proses Selesai
    function finishAttendance() {
        stopCamera();
        cameraState.classList.add('hidden');
        completeState.classList.remove('hidden');
        completeState.classList.add('flex');
        
        updateStep(2, 'done');
        updateStep(3, 'done');

        // Set waktu saat ini
        const now = new Date();
        document.getElementById('time-recorded').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // 5. Tampilkan Error
    function showError(msg) {
        stopCamera();
        loadingState.classList.add('hidden');
        cameraState.classList.add('hidden');
        errorState.classList.remove('hidden');
        errorState.classList.add('flex');
        errorMessage.innerText = msg;
    }

    // Pasang Event Listeners
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            startGeofencing();
        });
    }

    if (btnDone) {
        btnDone.addEventListener('click', () => {
            // Navigasi kembali ke overview
            const event = new CustomEvent('navigate', { detail: 'student-dashboard' });
            window.dispatchEvent(event);
        });
    }

    // Auto-start saat halaman dimuat
    startGeofencing();
}

export function attachStudentEvents() {

    initCalendar();

    const btnCheckin = document.getElementById('btn-checkin');
    if (btnCheckin) {
        btnCheckin.addEventListener('click', () => {
            console.log("Check-in diproses...");
        });
    }
    
    const locContainer = document.getElementById('location-list');
    if(locContainer) {
        locContainer.innerHTML = db.locations.map(loc => `
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p class="font-bold text-sm text-[#2d728f]">${loc.name}</p>
                <p class="text-xs text-gray-500">Radius: ${loc.radius} meter</p>
            </div>
        `).join('');
    }

    const statusDiv = document.getElementById('checkin-status');

    if (btnCheckin) {
        btnCheckin.addEventListener('click', () => {
            statusDiv.innerHTML = '<span class="text-blue-500">Mencari kordinat GPS...</span>';
            
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLat = position.coords.latitude;
                        const userLng = position.coords.longitude;
                        let isInsideGeofence = false;

                        db.locations.forEach(loc => {
                            const dist = calculateHaversine(userLat, userLng, loc.lat, loc.lng);
                            if (dist <= loc.radius) isInsideGeofence = true;
                        });

                        if (isInsideGeofence) {
                            statusDiv.innerHTML = '<span class="text-yellow-600">Geofence Valid. Memulai Face Recognition...</span>';
                            setTimeout(() => {
                                executePresensiLogic();
                            }, 1500);
                        } else {
                            statusDiv.innerHTML = '<span class="text-red-500">Anda berada di luar radius kampus.</span>';
                        }
                    },
                    (error) => {
                        statusDiv.innerHTML = `<span class="text-red-500">Error GPS: ${error.message}</span>`;
                    }
                );
            } else {
                statusDiv.innerHTML = '<span class="text-red-500">Browser tidak mendukung Geolocation.</span>';
            }
        });
    }

    function executePresensiLogic() {
        const statusDiv = document.getElementById('checkin-status');
        const user = db.state.currentUser;
        
        const today = new Date().toISOString().split('T')[0];
        
        db.attendance.insert(Date.now().toString(), {
            nim: user.payload.nim,
            date: today,
            status: 'Present',
            notes: 'Geofence & Euclidean Passed'
        });

        statusDiv.innerHTML = '<span class="text-green-600 font-bold"><i class="fas fa-check-circle"></i> Presensi Berhasil Dicatat!</span>';
    }
}