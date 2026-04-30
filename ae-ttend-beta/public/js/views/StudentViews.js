import { db } from "../core/Database.js";

let activeStream = null;
let scanAnimationFrame = null;
let detectAnimationFrame = null;
let modelsLoaded = false;
let detectionInterval = null;

export async function attachFaceRegistrationEvents(user) {
  let scanPosition = 0;
  let isFaceDetected = false;

  const getEl = (id) => document.getElementById(id);

  function showStatus(msg, type) {
    const registerStatus = getEl("registerStatus");
    if (!registerStatus) return;

    registerStatus.className = `mt-4 p-3 rounded-lg text-center text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800" : type === "error" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`;
    registerStatus.textContent = msg;
    registerStatus.classList.remove("hidden");
  }

  async function loadModels() {
    if (modelsLoaded) return;

    const loadingOverlay = getEl("loadingOverlay");
    if (loadingOverlay) loadingOverlay.style.display = "flex";
    showStatus("Memuat model AI...", "loading");

    const MODEL_URL = "public/models";
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      modelsLoaded = true;
      showStatus("Model berhasil dimuat.", "success");
    } catch (error) {
      showStatus("Gagal memuat model. Cek path public/models.", "error");
      console.error(error);
    } finally {
      if (loadingOverlay) loadingOverlay.style.display = "none";
    }
  }

  async function startCamera() {
    const videoEl = getEl("vid");
    if (!videoEl) return;

    try {
      activeStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      videoEl.srcObject = activeStream;

      await new Promise((resolve) => {
        videoEl.addEventListener("loadedmetadata", resolve, { once: true });
      });
      showStatus("Kamera siap. Posisikan wajah.", "success");
    } catch (error) {
      showStatus("Gagal mengakses kamera.", "error");
      console.error(error);
    }
  }

  function animateScanLine() {
    const videoEl = getEl("vid");
    const scanCanvas = getEl("scanCanvas");
    if (!scanCanvas || !videoEl) return;

    const ctx = scanCanvas.getContext("2d");

    if (!videoEl.videoWidth) {
      scanAnimationFrame = requestAnimationFrame(animateScanLine);
      return;
    }

    scanCanvas.width = videoEl.videoWidth;
    scanCanvas.height = videoEl.videoHeight;

    function draw() {
      if (!getEl("scanCanvas")) return;
      ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
      ctx.lineWidth = 2;
      ctx.moveTo(0, scanPosition);
      ctx.lineTo(scanCanvas.width, scanPosition);
      ctx.stroke();

      scanPosition += 3;
      if (scanPosition > scanCanvas.height) scanPosition = 0;
      scanAnimationFrame = requestAnimationFrame(draw);
    }
    draw();
  }

  async function detectFaceAndDrawLandmarks() {
    const videoEl = getEl("vid");
    const canvas = getEl("overlay");
    if (!canvas || !videoEl) return;

    const ctx = canvas.getContext("2d");

    if (!videoEl.videoWidth || !modelsLoaded) {
      detectAnimationFrame = requestAnimationFrame(detectFaceAndDrawLandmarks);
      return;
    }

    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;

    try {
      const detections = await faceapi
        .detectAllFaces(videoEl)
        .withFaceLandmarks();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        isFaceDetected = true;
        detections.forEach((detection) => {
          const positions = detection.landmarks.positions;

          ctx.beginPath();
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          const midX = (positions[0].x + positions[16].x) / 2;
          ctx.moveTo(midX, 0);
          ctx.lineTo(midX, canvas.height);
          const midY = (positions[0].y + positions[16].y) / 2;
          ctx.moveTo(0, midY);
          ctx.lineTo(canvas.width, midY);
          ctx.stroke();

          positions.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = "lime";
            ctx.fill();
          });
        });
      } else {
        isFaceDetected = false;
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }
    detectAnimationFrame = requestAnimationFrame(detectFaceAndDrawLandmarks);
  }

  async function registerFaceData() {
    const videoEl = getEl("vid");
    const loadingOverlay = getEl("loadingOverlay");

    if (!isFaceDetected || !videoEl) {
      showStatus("Wajah tidak terdeteksi dengan jelas!", "error");
      return;
    }

    if (loadingOverlay) loadingOverlay.style.display = "flex";
    showStatus("Memproses descriptor wajah...", "loading");

    try {
      const detection = await faceapi
        .detectSingleFace(videoEl)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const descriptorArray = new Float32Array(detection.descriptor);
        const binaryString = btoa(
          String.fromCharCode(...new Uint8Array(descriptorArray.buffer)),
        );

        const targetNode = db.users.findWhere("nim", user.payload.nim);
        if (targetNode) {
          targetNode.payload.faceCode = binaryString;
          user.payload.faceCode = binaryString;
          console.log(binaryString);
          showStatus("Data wajah berhasil disimpan di Memori!", "success");
          stopCameraAndDetection();
        } else {
          showStatus("User tidak ditemukan di memori!", "error");
        }
      } else {
        showStatus("Gagal mengekstrak fitur wajah.", "error");
      }
    } catch (error) {
      console.error(error);
      showStatus("Terjadi kesalahan saat memproses wajah.", "error");
    } finally {
      if (loadingOverlay) loadingOverlay.style.display = "none";
    }
  }

  setTimeout(async () => {
    const registerBtn = getEl("registerBtn");
    if (!registerBtn) return;

    await loadModels();
    await startCamera();

    registerBtn.disabled = false;
    animateScanLine();
    detectFaceAndDrawLandmarks();

    registerBtn.onclick = registerFaceData;
  }, 50);
}

export function stopCameraAndDetection() {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }
  if (scanAnimationFrame) cancelAnimationFrame(scanAnimationFrame);
  if (detectAnimationFrame) cancelAnimationFrame(detectAnimationFrame);
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
}

function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function renderStudentDashboard(user) {
  const nama = user?.payload?.nama || "Agisna F I";
  const nim = user?.payload?.nim || "225443028";
  const kelas =
    user?.payload?.kelas || "Teknologi Rekayasa Informatika Industri";
  const id_mahasiswa = user?.payload?.id || user?.payload?.nim || "225443028";

  const announcements = db.announcements || [];
  const topAnnouncements = announcements.slice().reverse().slice(0, 2);
  const readCount =
    parseInt(localStorage.getItem("ae_read_announcements_count")) || 0;

  let totalNew = announcements.length - readCount;
  if (totalNew < 0) totalNew = 0;
  const badgeHTML =
    totalNew > 0
      ? `<span class="w-1.5 h-1.5 rounded-full bg-[#ab3428] animate-pulse"></span> ${totalNew} New`
      : `<i class="fas fa-check-circle text-[#2d728f]"></i> Up to date`;

  let overviewAnnouncementsHTML = "";
  if (topAnnouncements.length === 0) {
    overviewAnnouncementsHTML = `
        <div class="p-4 bg-white/5 rounded-2xl border border-white/5 text-center text-gray-400 text-sm">
            Tidak ada pengumuman.
        </div>`;
  } else {
    overviewAnnouncementsHTML = topAnnouncements
      .map((ann, index) => {
        if (index === 0) {
          return `
            <div class="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md shadow-sm">
                <p class="text-[10px] text-[#f5ee9e] font-bold mb-1"><i class="fas fa-bell mr-1"></i> ${ann.date}</p>
                <p class="text-sm font-bold leading-relaxed line-clamp-2">${ann.title}</p>
            </div>`;
        } else {
          return `
            <div class="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p class="text-[10px] text-gray-400 font-bold mb-1"><i class="fas fa-bullhorn mr-1"></i> ${ann.date}</p>
                <p class="text-xs font-medium leading-relaxed text-gray-300 line-clamp-2">${ann.title}</p>
             </div>`;
        }
      })
      .join("");
  }

  let attendanceData = [];
  let currentAtt = db.attendance.head;
  while (currentAtt) {
    if (
      currentAtt.payload.id_mahasiswa === id_mahasiswa ||
      currentAtt.payload.nim === id_mahasiswa
    ) {
      attendanceData.push(currentAtt.payload);
    }
    currentAtt = currentAtt.next;
  }
  attendanceData.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const thisMonthData = attendanceData.filter((att) => {
    const d = new Date(att.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  let activeWorkingDays = 1;

  if (thisMonthData.length > 0) {
    const firstEntryDate = new Date(
      thisMonthData[thisMonthData.length - 1].created_at,
    );

    let tempDays = 0;
    for (
      let d = new Date(firstEntryDate);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        tempDays++;
      }
    }
    activeWorkingDays = tempDays > 0 ? tempDays : 1;
  }

  let onTimeCount = 0,
    lateCount = 0,
    permitSickCount = 0;
  thisMonthData.forEach((att) => {
    const type = (att.attendance || "").toLowerCase();
    if (type === "present" || type === "hadir") {
      if ((att.status || "").toLowerCase().includes("late")) lateCount++;
      else onTimeCount++;
    } else if (["sick", "sakit", "permit", "izin"].includes(type)) {
      permitSickCount++;
    }
  });

  const totalPresentDays = onTimeCount + lateCount;
  const monthlyRatePercentage =
    Math.round((totalPresentDays / activeWorkingDays) * 100) || 0;

  const onTimePercent =
    Math.min(Math.round((onTimeCount / activeWorkingDays) * 100), 100) || 0;
  const latePercent =
    Math.min(Math.round((lateCount / activeWorkingDays) * 100), 100) || 0;
  const permitSickPercent =
    Math.min(Math.round((permitSickCount / activeWorkingDays) * 100), 100) || 0;

  const todayStr = currentDate.toISOString().split("T")[0];
  const todayRecord = attendanceData.find((item) =>
    item.created_at.startsWith(todayStr),
  );

  let clockInTime = "--:--";
  let clockInAmPm = "AM";
  let clockInStatus = "Belum Presensi";

  if (todayRecord) {
    const todayDateObj = new Date(todayRecord.created_at);
    clockInTime = todayDateObj
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .split(" ")[0];
    clockInAmPm = todayDateObj
      .toLocaleTimeString("en-US", { hour12: true })
      .split(" ")[1];
    clockInStatus =
      todayRecord.status ||
      (todayRecord.attendance === "present"
        ? "On Time"
        : todayRecord.attendance);
  }

  let lastLocationName = "Polman Bandung";
  let lastLocationSub = "Kanayakan Lama";
  if (attendanceData.length > 0) {
    const locObj = db.locations.find(
      (l) => l.id === attendanceData[0].id_lokasi,
    );
    if (locObj) {
      lastLocationName = locObj.name;
      lastLocationSub = "Location Tracked";
    }
  }

  const recentTimeline = attendanceData.slice(0, 2);
  let timelineHTML = "";
  if (recentTimeline.length === 0) {
    timelineHTML = `<p class="text-sm text-gray-500 py-4">Belum ada riwayat presensi.</p>`;
  } else {
    timelineHTML = recentTimeline
      .map((att) => {
        const dateObj = new Date(att.created_at);
        const timeStr = dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const type = (att.attendance || "").toLowerCase();

        let color = "green";
        let icon = "fa-sign-in-alt";
        let title = "Check In Successful";
        let badgeText = att.status || "On Time";

        if (type === "sick" || type === "sakit") {
          color = "red";
          icon = "fa-procedures";
          title = "Sakit Tercatat";
          badgeText = "Sick Leave";
        } else if (type === "permit" || type === "izin") {
          color = "orange";
          icon = "fa-suitcase-rolling";
          title = "Izin Tercatat";
          badgeText = "Permit";
        }

        let bgIcon = `bg-${color}-50`;
        let textIcon = `text-${color}-500`;
        let groupHoverBg = `group-hover:bg-${color}-500`;
        let dotColor = `bg-${color}-500`;
        let badgeBg = `bg-${color}-100`;
        let badgeTextCol = `text-${color}-600`;

        if (color === "red") {
          bgIcon = `bg-red-50`;
          textIcon = `text-[#ab3428]`;
          groupHoverBg = `group-hover:bg-[#ab3428]`;
          dotColor = `bg-[#ab3428]`;
          badgeBg = `bg-red-100`;
          badgeTextCol = `text-[#ab3428]`;
        } else if (color === "orange") {
          bgIcon = `bg-orange-50`;
          textIcon = `text-[#f49e4c]`;
          groupHoverBg = `group-hover:bg-[#f49e4c]`;
          dotColor = `bg-[#f49e4c]`;
          badgeBg = `bg-orange-100`;
          badgeTextCol = `text-orange-600`;
        }

        return `
          <div class="relative">
              <div class="absolute -left-[33px] top-1 w-4 h-4 ${dotColor} rounded-full border-4 border-white shadow-sm"></div>
              <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div class="flex items-center gap-4">
                      <div class="w-12 h-12 ${bgIcon} ${textIcon} rounded-xl flex items-center justify-center text-lg ${groupHoverBg} group-hover:text-white transition-colors">
                          <i class="fas ${icon}"></i>
                      </div>
                      <div>
                          <p class="font-bold text-gray-800 text-sm">${title}</p>
                          <p class="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-0.5"><i class="fas fa-map-marker-alt text-gray-300"></i> ${dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                      </div>
                  </div>
                  <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <span class="px-3 py-1 ${badgeBg} ${badgeTextCol} text-[10px] font-bold rounded-full uppercase tracking-wide">${badgeText}</span>
                      <p class="font-bold text-gray-800 text-sm mt-1">${timeStr}</p>
                  </div>
              </div>
          </div>
          `;
      })
      .join("");
  }

  return `
    <div class="flex flex-col xl:flex-row gap-8">
      <div class="flex-1 space-y-8">

        <div
          class="bg-[#2d728f] rounded-3xl p-8 flex items-center text-white relative overflow-hidden shadow-xl border border-gray-200 group">
          <div
            class="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          </div>
          <div class="absolute bottom-6 left-1/4 w-8 h-8 border-[3px] border-white/10 rounded-full z-0 pointer-events-none">
          </div>
          <div class="absolute top-8 left-1/2 text-white/20 text-2xl font-black rotate-12 z-0 pointer-events-none">+</div>
          <div class="absolute bottom-10 right-1/4 w-3 h-3 bg-[#f49e4c]/50 rounded-full z-0 pointer-events-none"></div>

          <div class="z-10 flex flex-col md:flex-row items-start md:items-center gap-10 lg:gap-16 w-full">
            <div class="flex-1">
              <span
                class="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-wider text-[#f5ee9e] border border-white/20 backdrop-blur-sm mb-3 inline-block">STUDENT
                PORTAL</span>
              <h2 class="text-xl opacity-90 text-white mt-2">Welcome back,</h2>
              <h1 class="text-4xl font-extrabold mt-1 tracking-tight">${nama}</h1>

              <div
                class="mt-5 inline-flex flex-wrap items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-sm">
                <i class="fas fa-id-card text-[#f5ee9e]"></i>
                <span class="text-[#f5ee9e] font-mono text-sm tracking-wide">
                  ${nim}
                  <span class="mx-2 text-white/40">|</span>
                  <span class="font-sans font-semibold text-white/90">${kelas}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="bg-[#3b8ea5] p-6 rounded-3xl shadow-[0_8px_30px_rgb(59,142,165,0.3)] flex flex-col relative overflow-hidden group">
            <div class="absolute top-6 right-[-20px] w-32 h-10 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
            <div
              class="absolute bottom-6 right-6 w-12 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm border border-white/20">
              <i class="fas fa-check text-white text-lg drop-shadow-md"></i>
            </div>

            <h3 class="font-bold text-white/70 text-xs tracking-widest uppercase mb-4 relative z-10">Clock In Status</h3>
            <div class="flex items-end gap-2 mb-2 relative z-10">
              <span class="text-4xl font-extrabold text-white leading-none drop-shadow-sm">${clockInTime}</span>
              <span class="text-sm font-bold text-white/80 mb-1">${clockInAmPm}</span>
            </div>
            <div class="mt-auto pt-4 relative z-10">
              <span
                class="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wide border border-white/30 backdrop-blur-sm shadow-sm">${clockInStatus}</span>
            </div>
          </div>

          <div
            class="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center hover:shadow-lg transition-shadow">
            <h3 class="font-bold text-gray-500 text-xs tracking-widest uppercase self-start w-full mb-2">Monthly Rate</h3>
            <div class="relative flex items-center justify-center mt-2 flex-1 w-full">

              <div class="relative w-24 h-24 rounded-full flex items-center justify-center"
                style="background: conic-gradient(#f49e4c ${monthlyRatePercentage}%, #f3f4f6 0);">

                <div class="absolute inset-0 m-[10px] bg-white rounded-full"></div>

                <span class="text-2xl font-black text-gray-800 z-10">${monthlyRatePercentage}<span
                    class="text-sm text-gray-400">%</span></span>
              </div>
            </div>
            <p class="text-[10px] font-bold text-gray-400 mt-3 bg-gray-50 px-3 py-1 rounded-full">${totalPresentDays} of
              ${activeWorkingDays} Days</p>
          </div>

          <div
            class="relative bg-gray-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col justify-end group min-h-[180px] cursor-pointer mb-4">
            <div
              class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200 opacity-60 group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#004a87] via-[#004a87]/60 to-transparent"></div>

            <div class="relative z-10">
              <div class="flex justify-between items-end">
                <div>
                  <h3 class="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-1 drop-shadow-md">Last
                    Location - Main Campus</h3>
                  <p class="text-white font-bold text-sm leading-tight drop-shadow-md">
                    POLMAN Bandung<br>
                    <span class="font-normal text-xs text-[#f5ee9e]">Jl. Kanayakan No. 21, Dago</span>
                  </p>
                </div>
                <div
                  class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-white group-hover:text-[#004a87] transition-colors shadow-lg">
                  <i class="fas fa-university"></i>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div class="flex justify-between items-center mb-8">
            <h3 class="font-bold text-gray-800 text-lg">Timeline History</h3>
            <a href="#"
              class="text-xs font-bold px-4 py-2 bg-[#3b8ea5]/10 text-[#3b8ea5] rounded-full hover:bg-[#3b8ea5] hover:text-white transition-colors">View
              all</a>
          </div>

          <div class="relative pl-6 border-l-2 border-gray-100 space-y-8 mt-2 ml-2">
            ${timelineHTML}
          </div>
        </div>
      </div>

      <aside class="w-full xl:w-[350px] flex flex-col gap-8">

        <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <div id="calendar-header">
              <span class="text-sm font-bold text-gray-800" id="month-date-display">${currentDate.toLocaleString("en-US", {
    month: "long", year: "numeric"
  })}</span>
            </div>
            <div class="flex gap-2 text-gray-400 font-bold">
              <button
                class="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition">&lt;</button>
              <button
                class="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition">&gt;</button>
            </div>
          </div>
          <div class="grid grid-cols-7 text-center text-xs font-bold tracking-wide text-[#f49e4c] mb-4">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div id="calendar-days" class="grid grid-cols-7 text-center text-sm text-gray-600 gap-y-4"></div>
        </div>

        <div data-route="announcement"
          class="bg-gradient-to-br from-[#2d728f] to-slate-800 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div
            class="absolute -right-10 -bottom-10 w-32 h-32 bg-[#3b8ea5]/50 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform">
          </div>
          <div class="relative z-10 flex justify-between items-start mb-5 flex-col gap-2">
            <div class="flex items-center justify-between w-full">
              <h3 class="font-bold opacity-90 text-lg group-hover:text-[#f5ee9e] transition-colors">Announcements</h3>
              <i
                class="fas fa-arrow-right opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-[#f5ee9e]"></i>
            </div>
            <span
              class="bg-[#f5ee9e] text-[#2d728f] text-[10px] px-3 py-1 rounded-full font-black tracking-wide shadow-sm flex items-center gap-1">
              ${badgeHTML}
            </span>
          </div>
          <div class="relative z-10 space-y-3 pointer-events-none">
            ${overviewAnnouncementsHTML}
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-5">Summary <span class="text-gray-400 font-medium">This Month</span></h3>
          <div class="space-y-5">
            <div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-gray-500 font-bold flex items-center gap-2"><i
                    class="fas fa-circle text-[8px] text-[#3b8ea5]"></i> On Time</span>
                <span class="font-black text-gray-800">${onTimeCount} Days</span>
              </div>
              <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div class="bg-gradient-to-r from-[#2d728f] to-[#3b8ea5] h-full rounded-full relative"
                  style="width: ${onTimePercent}%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-gray-500 font-bold flex items-center gap-2"><i
                    class="fas fa-circle text-[8px] text-[#ab3428]"></i> Late</span>
                <span class="font-black text-gray-800">${lateCount} Days</span>
              </div>
              <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div class="bg-gradient-to-r from-red-500 to-[#ab3428] h-full" style="width: ${latePercent}%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-gray-500 font-bold flex items-center gap-2"><i
                    class="fas fa-circle text-[8px] text-[#f49e4c]"></i> Permit / Sick</span>
                <span class="font-black text-gray-800">${permitSickCount} Days</span>
              </div>
              <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div class="bg-gradient-to-r from-orange-400 to-[#f49e4c] h-full" style="width: ${permitSickPercent}%">
                </div>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </div>
  `;
}

export function initCalendar() {
  const calendarDays = document.getElementById("calendar-days");
  const monthDateDisplay = document.getElementById("month-date-display");

  if (!calendarDays || !monthDateDisplay) return;

  const date = new Date();
  let currentMonth = date.getMonth();
  let currentYear = date.getFullYear();

  function renderCalendar(month, year) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    monthDateDisplay.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;

    let daysHTML = "";

    for (let i = 0; i < firstDay; i++) {
      daysHTML += `<div></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
      if (isCurrentMonth && i === today.getDate()) {
        daysHTML += `
                    <div class="relative flex items-center justify-center">
                        <span class="w-7 h-7 flex items-center justify-center bg-[#3b8ea5] text-white font-bold rounded-full shadow-md">
                            ${i}
                        </span>
                    </div>`;
      } else {
        daysHTML += `
                    <div class="hover:bg-gray-50 rounded-full w-7 h-7 mx-auto flex items-center justify-center transition cursor-pointer">
                        ${i}
                    </div>`;
      }
    }

    calendarDays.innerHTML = daysHTML;
  }

  renderCalendar(currentMonth, currentYear);

  const buttons = document
    .querySelectorAll("#calendar-header + div + div")
    .previousElementSibling.querySelectorAll("button");
  if (buttons.length >= 2) {
    const prevBtn = buttons[0];
    const nextBtn = buttons[1];

    prevBtn.addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });

    nextBtn.addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }
}

export function renderStudentAttendance(user) {
  const nama = user?.payload?.nama || "Agisna F I";
  const id_mahasiswa = user?.payload?.id || user?.payload?.nim || "225443028";

  let attendanceData = [];
  let currentAtt = db.attendance.head;

  while (currentAtt) {
    if (
      currentAtt.payload.id_mahasiswa === id_mahasiswa ||
      currentAtt.payload.nim === id_mahasiswa
    ) {
      attendanceData.push({
        id: currentAtt.payload.id || "-",
        attendance:
          currentAtt.payload.attendance || currentAtt.payload.status || "-",
        status: currentAtt.payload.status || "-",
        notes: currentAtt.payload.notes || "-",
        created_at:
          currentAtt.payload.created_at ||
          currentAtt.payload.date ||
          new Date().toISOString(),
      });
    }
    currentAtt = currentAtt.next;
  }

  attendanceData.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  const recent5 = attendanceData.slice(0, 5);

  const getBadgeStatus = (attendance) => {
    const att = attendance.toLowerCase();
    if (att === "present" || att === "hadir")
      return '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Hadir</span>';
    if (att === "permit" || att === "izin")
      return '<span class="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-bold">Izin</span>';
    if (att === "sick" || att === "sakit")
      return '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">Sakit</span>';
    return '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">Alpa/Absent</span>';
  };

  const renderTableRows = (dataArray) => {
    if (dataArray.length === 0) {
      return `<tr><td colspan="5" class="text-center py-4 text-gray-500 text-sm">Belum ada data presensi.</td></tr>`;
    }
    return dataArray
      .map(
        (item, index) => `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="py-3 px-4 text-sm text-gray-600">${index + 1}</td>
                <td class="py-3 px-4 text-sm font-medium text-gray-800">${new Date(item.created_at).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</td>
                <td class="py-3 px-4 text-sm">${getBadgeStatus(item.attendance)}</td>
                <td class="py-3 px-4 text-sm text-gray-600">${item.status}</td>
                <td class="py-3 px-4 text-sm text-gray-500 truncate max-w-[150px]">${item.notes}</td>
            </tr>
        `,
      )
      .join("");
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecord = attendanceData.find((item) =>
    item.created_at.startsWith(todayStr),
  );

  let actionSectionHTML = "";

  if (!todayRecord) {
    actionSectionHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button id="btn-open-live" class="group relative overflow-hidden bg-gradient-to-br from-[#266d84] to-[#3b8ea5] p-8 rounded-3xl shadow-lg transition-transform hover:-translate-y-1 text-left flex items-center justify-between">
                <div class="relative z-10">
                    <h2 class="text-white text-2xl font-bold mb-2">Presensi Hadir</h2>
                    <p class="text-white/80 text-sm">Verifikasi wajah & geofencing kampus</p>
                </div>
                <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm relative z-10 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="text-white w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/>
                            <circle cx="12" cy="10" r="3"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 17c1.333-2 6.667-2 8 0"/>
                    </svg>
                </div>
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </button>

            <button id="btn-open-izin" class="group relative overflow-hidden bg-white border border-gray-200 p-8 rounded-3xl shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md hover:border-[#f49e4c]/50 text-left flex items-center justify-between">
                <div class="relative z-10">
                    <h2 class="text-gray-800 text-2xl font-bold mb-2">Pengajuan Izin</h2>
                    <p class="text-gray-500 text-sm">Upload surat dokter atau izin lainnya</p>
                </div>
                <div class="w-16 h-16 bg-[#f49e4c]/10 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                    <i class="fas fa-file-medical text-[#f49e4c] text-3xl"></i>
                </div>
            </button>
        </div>
        `;
  } else {
    let statusIcon, statusColor, statusTitle, statusMessage;
    const attType = todayRecord.attendance.toLowerCase();
    const timeStr = new Date(todayRecord.created_at).toLocaleTimeString(
      "id-ID",
      { hour: "2-digit", minute: "2-digit" },
    );

    if (attType === "present" || attType === "hadir") {
      statusIcon = "fa-check-circle";
      statusColor = "text-green-500";
      statusTitle = "Sudah Presensi";
      statusMessage = `Hebat! Anda sudah melakukan presensi kehadiran hari ini pada pukul <strong>${timeStr}</strong>.`;
    } else if (attType === "permit" || attType === "izin") {
      statusIcon = "fa-suitcase-rolling";
      statusColor = "text-[#f49e4c]";
      statusTitle = "Izin Tercatat";
      statusMessage = `Pengajuan izin Anda untuk hari ini telah tercatat.`;
    } else if (attType === "sick" || attType === "sakit") {
      statusIcon = "fa-procedures";
      statusColor = "text-[#ab3428]";
      statusTitle = "Sakit Tercatat";
      statusMessage = `Keterangan sakit Anda hari ini sudah masuk sistem. Semoga lekas sembuh!`;
    } else {
      statusIcon = "fa-info-circle";
      statusColor = "text-gray-500";
      statusTitle = "Status Kehadiran";
      statusMessage = `Status Anda hari ini: ${todayRecord.attendance}.`;
    }

    actionSectionHTML = `
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-green-100 mb-8 flex items-center gap-6 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-32 h-32 bg-gray-50 rounded-full blur-2xl pointer-events-none"></div>
            <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 relative z-10">
                <i class="fas ${statusIcon} ${statusColor} text-3xl"></i>
            </div>
            <div class="relative z-10">
                <h2 class="text-xl font-extrabold text-gray-800 mb-1">${statusTitle}</h2>
                <p class="text-gray-500 text-sm">${statusMessage}</p>
            </div>
        </div>
        `;
  }

  return `
    <style>
        /* Animasi Kamera (Tetap dipertahankan) */
        .scan-animation { background: linear-gradient(to bottom, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(59, 130, 246, 0) 100%); animation: scanAnimation 2s ease-in-out infinite; }
        .scan-border { animation: pulseBorder 2s ease-in-out infinite; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.5); }
        .face-target { animation: targetPulse 3s ease-in-out infinite; }
        @keyframes scanAnimation { 0% { transform: translateY(-100%); opacity: 0.7; } 50% { opacity: 1; } 100% { transform: translateY(100%); opacity: 0.7; } }
        @keyframes pulseBorder { 0% { opacity: 0.5; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.02); } 100% { opacity: 0.5; transform: scale(0.98); } }
        @keyframes targetPulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        
        /* Utility untuk scrollbar di modal history */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
    </style>

    <div class="max-w-6xl mx-auto">
        <div class="bg-gradient-to-r from-white to-gray-50 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
            
            <div class="flex-1">
                <h1 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">Halo, ${nama}! 👋</h1>
                <p class="text-gray-500 text-sm max-w-md leading-relaxed">Pilih aksi di bawah ini untuk mencatat kehadiran atau mengajukan perizinan hari ini.</p>
            </div>
            
            <div class="flex items-center gap-5 bg-white p-4 pr-5 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto justify-between md:justify-end hover:shadow-md transition-shadow">
                
                <div class="flex flex-col items-start md:items-end">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Waktu Sistem</p>
                    <p id="realtime-clock-text" class="text-sm font-mono font-bold text-[#2d728f] bg-[#3b8ea5]/10 px-3 py-1 rounded-lg border border-[#3b8ea5]/20"></p>
                </div>

                <div class="relative w-14 h-14 rounded-full border-4 border-[#3b8ea5] bg-gray-50 shadow-inner flex items-center justify-center shrink-0">
                    <div class="absolute top-0.5 w-1 h-1.5 bg-gray-300 rounded-full"></div>
                    <div class="absolute bottom-0.5 w-1 h-1.5 bg-gray-300 rounded-full"></div>
                    <div class="absolute left-0.5 w-1.5 h-1 bg-gray-300 rounded-full"></div>
                    <div class="absolute right-0.5 w-1.5 h-1 bg-gray-300 rounded-full"></div>

                    <div class="absolute w-2 h-2 bg-gray-800 rounded-full z-20 shadow-sm"></div>
                    
                    <div id="hour-hand" class="absolute bottom-1/2 left-1/2 w-[2.5px] h-[12px] bg-gray-800 rounded-full z-10 origin-bottom transform -translate-x-1/2 transition-transform duration-75"></div>
                    
                    <div id="minute-hand" class="absolute bottom-1/2 left-1/2 w-[2px] h-[18px] bg-gray-500 rounded-full z-10 origin-bottom transform -translate-x-1/2 transition-transform duration-75"></div>
                    
                    <div id="second-hand" class="absolute bottom-1/2 left-1/2 w-[1.5px] h-[22px] bg-[#ab3428] rounded-full z-10 origin-bottom transform -translate-x-1/2 transition-transform duration-75"></div>
                </div>
                
            </div>
            
        </div>

        ${actionSectionHTML}

        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800">Riwayat Kehadiran Terakhir</h3>
                <button id="btn-open-history" class="text-sm font-semibold text-[#3b8ea5] hover:text-[#266d84] transition">Lihat Semua Data <i class="fas fa-arrow-right ml-1"></i></button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-100">
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-xl">No</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kehadiran</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tr-xl">Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderTableRows(recent5)}
                    </tbody>
                </table>
            </div>
        </div>
    </div>


    <div id="modal-live-attendance" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div class="relative w-full max-w-2xl bg-gray-900 rounded-3xl p-8 overflow-hidden shadow-2xl border border-gray-800 flex flex-col min-h-[500px]">
            <button id="btn-close-live" class="absolute top-6 right-6 text-gray-400 hover:text-white z-50 transition bg-gray-800/50 w-8 h-8 rounded-full flex items-center justify-center">
                <i class="fas fa-times"></i>
            </button>

            <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            <div class="absolute -top-32 -right-32 w-96 h-96 bg-[#3b8ea5]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-white font-extrabold text-2xl tracking-tight">Live Attendance</h2>
                    <p class="text-gray-400 text-sm mt-1">Sistem Verifikasi Wajah & Geofencing</p>
                </div>
                <span class="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse mr-10">
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

            <div class="relative z-10 flex-1 flex flex-col items-center justify-center mt-2">
                <div id="loading-state" class="flex flex-col items-center text-center">
                    <i class="fas fa-satellite-dish text-[#3b8ea5] text-5xl mb-4 animate-pulse"></i>
                    <p id="status-text" class="text-[#f5ee9e] font-mono text-sm tracking-widest">Mencari koordinat satelit...</p>
                </div>

                <div id="camera-state" class="hidden relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-[#3b8ea5]">
                    <video id="live-video" class="w-full h-full object-cover transform -scale-x-100" autoplay muted playsinline></video>
                    <div class="scan-animation absolute inset-0 rounded-full pointer-events-none z-10"></div>
                    <div class="scan-border absolute inset-0 rounded-full border-2 border-[#3b8ea5]/50 pointer-events-none z-10"></div>
                    <div class="face-target absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 border-2 border-dashed border-[#f5ee9e]/70 rounded-[100px/120px] pointer-events-none z-20"></div>
                </div>

                <div id="error-state" class="hidden flex-col items-center text-center bg-red-500/10 p-6 rounded-2xl border border-red-500/20 backdrop-blur-sm max-w-sm">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-3"></i>
                    <h3 class="text-white font-bold mb-1">Verifikasi Gagal</h3>
                    <p id="error-message" class="text-gray-300 text-xs mb-5">Anda berada di luar radius kampus.</p>
                    
                    <button id="btn-retry" class="w-full px-6 py-2.5 bg-[#ab3428] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition shadow-lg mb-2">Coba Lagi</button>
                    
                    <!-- TOMBOL BARU: Muncul saat gagal 3x -->
                    <button id="btn-manual-verification" class="hidden w-full px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2">
                        <i class="fas fa-user-shield"></i> Lapor & Presensi Manual
                    </button>
                </div>

                <div id="complete-state" class="hidden flex-col items-center text-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md w-full max-w-sm">
                    <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                        <i class="fas fa-check text-white text-3xl"></i>
                    </div>
                    <h3 class="text-white font-extrabold text-xl">Berhasil!</h3>
                    <p class="text-gray-400 text-xs mt-1 mb-4">Presensi tercatat pada <span id="time-recorded" class="font-bold text-white">07:15 AM</span></p>
                    <button id="btn-done" class="w-full py-3 bg-[#3b8ea5] hover:bg-[#2d728f] text-white font-bold rounded-xl transition shadow-lg">Selesai</button>
                </div>
            </div>
        </div>
    </div>

    <div id="modal-leave-request" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div class="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <button id="btn-close-izin" class="absolute top-6 right-6 text-gray-400 hover:text-gray-800 z-50 transition w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                <i class="fas fa-times"></i>
            </button>

            <div class="flex items-center gap-4 mb-6 pr-8">
                <div class="w-12 h-12 bg-[#f49e4c]/10 text-[#f49e4c] rounded-2xl flex items-center justify-center text-xl shrink-0">
                    <i class="fas fa-envelope-open-text"></i>
                </div>
                <div>
                    <h3 class="font-extrabold text-gray-800 text-lg">Pengajuan Absen</h3>
                    <p class="text-xs text-gray-400">Sakit atau keperluan mendesak</p>
                </div>
            </div>

            <form id="form-perizinan" class="space-y-4">
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
                    <textarea rows="2" placeholder="Tuliskan alasan pengajuan..." class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-[#3b8ea5] focus:border-[#3b8ea5] block p-3 outline-none transition resize-none"></textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Bukti (Opsional)</label>
                    <label class="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <i class="fas fa-cloud-upload-alt text-gray-400 mb-1"></i>
                            <p class="text-xs text-gray-500">Klik untuk unggah</p>
                        </div>
                        <input id="dropzone-file" type="file" class="hidden" />
                    </label>
                </div>

                <button type="button" class="w-full mt-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2">
                    <i class="fas fa-paper-plane"></i> Kirim Pengajuan
                </button>
            </form>
        </div>
    </div>

    <div id="modal-manual-verification" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div class="relative w-full max-w-lg bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-800">
            <button id="btn-close-manual" class="absolute top-6 right-6 text-gray-400 hover:text-white z-50 transition bg-gray-800/50 w-8 h-8 rounded-full flex items-center justify-center">
                <i class="fas fa-times"></i>
            </button>

            <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div>
                    <h3 class="font-extrabold text-white text-lg">Verifikasi Manual</h3>
                    <p class="text-xs text-gray-400">Sistem gagal mendeteksi wajah 3x</p>
                </div>
            </div>

            <form id="form-manual-verification" class="space-y-4">
    <div>
        <label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Jelaskan Kendala (Wajib)</label>
        <textarea id="manual-notes" rows="3" placeholder="Pilih template di atas atau ketik di sini..." class="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl focus:ring-[#3b8ea5] focus:border-[#3b8ea5] block p-3 mb-4 outline-none transition resize-none"></textarea>
        <label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest ml-1">PILIH ALASAN CEPAT</label>
        <div class="flex flex-wrap gap-2 mb-4">
            <button type="button" class="chat-template bg-gray-700/50 hover:bg-[#3b8ea5]/20 border border-gray-600 text-gray-300 hover:text-[#3b8ea5] hover:border-[#3b8ea5] px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-2" data-msg="Pencahayaan di ruangan terlalu gelap sehingga wajah tidak terdeteksi.">
                <i class="fas fa-moon text-[10px]"></i> Gelap
            </button>
            <button type="button" class="chat-template bg-gray-700/50 hover:bg-[#3b8ea5]/20 border border-gray-600 text-gray-300 hover:text-[#3b8ea5] hover:border-[#3b8ea5] px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-2" data-msg="Kamera perangkat sedang buram/bermasalah saat proses scanning.">
                <i class="fas fa-camera text-[10px]"></i> Kamera Buram
            </button>
            <button type="button" class="chat-template bg-gray-700/50 hover:bg-[#3b8ea5]/20 border border-gray-600 text-gray-300 hover:text-[#3b8ea5] hover:border-[#3b8ea5] px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-2" data-msg="Sistem terus menerus gagal mencocokkan wajah saya dengan data lama.">
                <i class="fas fa-robot text-[10px]"></i> Gagal Match
            </button>
            <button type="button" class="chat-template bg-gray-700/50 hover:bg-[#3b8ea5]/20 border border-gray-600 text-gray-300 hover:text-[#3b8ea5] hover:border-[#3b8ea5] px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-2" data-msg="Saya sedang menggunakan kacamata/aksesoris medis yang mengganggu verifikasi.">
                <i class="fas fa-glasses text-[10px]"></i> Aksesoris
            </button>
        </div>

    </div>

    <button type="button" id="btn-submit-manual" class="w-full mt-2 bg-[#3b8ea5] hover:bg-[#2d728f] text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95">
        <i class="fas fa-paper-plane"></i> Lapor & Tetap Hadir
    </button>
</form>
        </div>
    </div>

    <div id="modal-all-history" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
        <div class="relative w-full max-w-4xl bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 max-h-full flex flex-col">
            
            <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div>
                    <h2 class="text-xl font-extrabold text-gray-800">Semua Data Presensi</h2>
                    <p class="text-sm text-gray-500">NIM: <span class="font-mono text-[#3b8ea5]">${id_mahasiswa}</span></p>
                </div>
                <button id="btn-close-history" class="text-gray-400 hover:text-gray-800 transition w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="overflow-y-auto custom-scrollbar flex-1 pr-2">
                <table class="w-full text-left border-collapse relative">
                    <thead class="sticky top-0 bg-white shadow-[0_2px_0_0_#f3f4f6] z-10">
                        <tr>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Record</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kehadiran</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${attendanceData.length === 0
      ? `<tr><td colspan="5" class="text-center py-8 text-gray-500">Belum ada data di database.</td></tr>`
      : attendanceData
        .map(
          (item) => `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="py-3 px-4 text-xs font-mono text-gray-400">${item.id}</td>
                                <td class="py-3 px-4 text-sm font-medium text-gray-800">${new Date(item.created_at).toLocaleString("id-ID")}</td>
                                <td class="py-3 px-4 text-sm">${getBadgeStatus(item.attendance)}</td>
                                <td class="py-3 px-4 text-sm text-gray-600">${item.status}</td>
                                <td class="py-3 px-4 text-sm text-gray-500 truncate max-w-[200px]">${item.notes}</td>
                            </tr>
                        `,
        )
        .join("")
    }
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
}

export function initAttendanceEvents(user) {
  const loadingState = document.getElementById("loading-state");
  const cameraState = document.getElementById("camera-state");
  const errorState = document.getElementById("error-state");
  const completeState = document.getElementById("complete-state");

  const statusText = document.getElementById("status-text");
  const errorMessage = document.getElementById("error-message");
  const videoElement = document.getElementById("live-video");
  const btnRetry = document.getElementById("btn-retry");
  const btnDone = document.getElementById("btn-done");
  const btnManual = document.getElementById("btn-manual-verification"); // Tombol baru

  const modalLive = document.getElementById("modal-live-attendance");
  const btnOpenLive = document.getElementById("btn-open-live");
  const btnCloseLive = document.getElementById("btn-close-live");

  const btnOpenHistory = document.getElementById("btn-open-history");
  const btnCloseHistory = document.getElementById("btn-close-history");

  const btnOpenLeave = document.getElementById("btn-open-izin");
  const btnCloseLeave = document.getElementById("btn-close-izin");
  const modalLeave = document.getElementById("modal-leave-request");

  // DOM Modal Baru
  const modalManual = document.getElementById("modal-manual-verification");
  const btnCloseManual = document.getElementById("btn-close-manual");
  const btnSubmitManual = document.getElementById("btn-submit-manual");
  const templates = document.querySelectorAll(".chat-template");
  const manualNotes = document.getElementById("manual-notes");

  let currentStep = "location";
  let gpsAttempts = 0;
  let faceAttempts = 0;
  const maxAttempts = 3;
  let isProcessingFace = false;
  let hasSuccessfullyVerified = false;
  let matchedLocationId = "-";

  function updateStep(stepNumber, status) {
    const circle = document.getElementById(`step-${stepNumber}-circle`);
    const text = document.getElementById(`step-${stepNumber}-text`);
    const line = document.getElementById(`step-line-${stepNumber}`);

    if (!circle) return;

    if (status === "active") {
      circle.className = "w-10 h-10 rounded-full bg-[#3b8ea5] text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,142,165,0.5)] transition-colors duration-300";
      text.className = "absolute -bottom-6 text-xs font-bold text-white whitespace-nowrap";
      if (line) line.className = "flex-1 h-1 bg-[#3b8ea5] mx-2 rounded-full transition-colors duration-300";
    } else if (status === "done") {
      circle.innerHTML = '<i class="fas fa-check"></i>';
      circle.className = "w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold transition-colors duration-300";
      text.className = "absolute -bottom-6 text-xs font-bold text-green-400 whitespace-nowrap";
      if (line) line.className = "flex-1 h-1 bg-green-500 mx-2 rounded-full transition-colors duration-300";
    }
  }

  function stopCamera() {
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      activeStream = null;
      videoElement.srcObject = null;
    }
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
  }

  function errorCallback(errorMsg, type = "geofence") {
    stopCamera();
    loadingState.classList.add("hidden");
    cameraState.classList.add("hidden");
    errorState.classList.remove("hidden");
    errorState.classList.add("flex");

    let currentAttemptLimit;

    if (type === "face") {
      faceAttempts++;
      currentAttemptLimit = faceAttempts;
      currentStep = "face";
    } else {
      gpsAttempts++;
      currentAttemptLimit = gpsAttempts;
      currentStep = "location";
    }

    if (currentAttemptLimit < maxAttempts) {
      errorMessage.innerHTML = `${errorMsg} <br><span class="text-white/50 text-[10px]">Percobaan (${currentAttemptLimit}/${maxAttempts})</span>`;
      if (btnRetry) btnRetry.classList.remove("hidden");
      if (btnManual) btnManual.classList.add("hidden"); // Sembunyikan manual
    } else {
      errorMessage.innerHTML = `${errorMsg} <br><span class="text-red-400 text-xs mt-1 block">Batas percobaan habis. Silakan gunakan opsi verifikasi manual.</span>`;
      if (btnRetry) btnRetry.classList.add("hidden"); // Sembunyikan coba lagi
      if (btnManual) btnManual.classList.remove("hidden"); // Tampilkan tombol manual
    }
  }

  function startGeofencing() {
    currentStep = "location";
    loadingState.classList.remove("hidden");
    cameraState.classList.add("hidden");
    errorState.classList.add("hidden");
    completeState.classList.add("hidden");

    statusText.innerText = "Memverifikasi lokasi Anda...";
    updateStep(1, "active");

    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            let isInsideGeofence = false;
            let foundLocId = null;

            const targetLocations = db.locations && db.locations.length > 0 ? db.locations : [{ id: "LOK-POLMAN", name: "Polman Bandung", lat: -6.874457, lng: 107.61864, radius: 300 }];
            for (const loc of targetLocations) {
              const dist = calculateHaversine(userLat, userLng, loc.lat, loc.lng);
              if (dist <= loc.radius) {
                isInsideGeofence = true;
                foundLocId = loc.id;
                break;
              }
            }

            if (isInsideGeofence) {
              matchedLocationId = foundLocId;
              gpsAttempts = 0;
              updateStep(1, "done");
              statusText.innerText = "Lokasi valid. Menyiapkan kamera...";
              setTimeout(() => initFaceVerification(), 1000);
            } else {
              errorCallback("Anda berada di luar radius kampus.", "geofence");
            }
          },
          (error) => errorCallback("Akses GPS ditolak atau sinyal lemah.", "geofence"),
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } else {
        errorCallback("Browser tidak mendukung Geolocation.", "geofence");
      }
    }, 1500);
  }

  async function initFaceVerification() {
    if (!user.payload.faceCode) {
      errorCallback("Anda belum mendaftarkan wajah. Buka menu Profil.", "face");
      return;
    }

    currentStep = "face";
    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");
    statusText.innerText = "Memuat AI Wajah...";

    try {
      if (!modelsLoaded) {
        const MODEL_URL = "public/models";
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        modelsLoaded = true;
      }

      statusText.innerText = "Menghubungkan Kamera...";
      activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      videoElement.srcObject = activeStream;

      await new Promise((resolve) => {
        videoElement.addEventListener("loadedmetadata", resolve, { once: true });
      });

      loadingState.classList.add("hidden");
      cameraState.classList.remove("hidden");
      updateStep(2, "active");

      isProcessingFace = false;
      hasSuccessfullyVerified = false;

      if (detectionInterval) clearInterval(detectionInterval);
      detectionInterval = setInterval(verifyFaceCore, 1500);
    } catch (err) {
      console.error(err);
      errorCallback("Gagal mengakses kamera/memuat AI.", "face");
    }
  }

  async function verifyFaceCore() {
    if (!modelsLoaded || hasSuccessfullyVerified || isProcessingFace) return;
    isProcessingFace = true;

    try {
      const detection = await faceapi.detectSingleFace(videoElement).withFaceLandmarks().withFaceDescriptor();
      if (hasSuccessfullyVerified) return;

      if (detection) {
        const binaryString = atob(user.payload.faceCode);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const registeredDescriptor = new Float32Array(bytes.buffer);

        const distance = faceapi.euclideanDistance(detection.descriptor, registeredDescriptor);

        if (distance < 0.55) {
          hasSuccessfullyVerified = true;
          clearInterval(detectionInterval);
          finishAttendance();
        } else {
          clearInterval(detectionInterval);
          errorCallback("Wajah tidak cocok dengan database.", "face");
        }
      } else {
        clearInterval(detectionInterval);
        errorCallback("Wajah tidak terdeteksi dengan jelas.", "face");
      }
    } catch (error) {
      clearInterval(detectionInterval);
      errorCallback("Gagal mengeksekusi pendeteksian wajah.", "face");
    } finally {
      isProcessingFace = false;
    }
  }

  function finishAttendance() {
    stopCamera();
    cameraState.classList.add("hidden");
    completeState.classList.remove("hidden");
    completeState.classList.add("flex");

    updateStep(2, "done");
    updateStep(3, "done");

    const now = new Date();
    document.getElementById("time-recorded").innerText = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const recordId = "ATT-" + Date.now();
    db.attendance.insert(recordId, {
      id: recordId,
      id_mahasiswa: user?.payload?.id || user?.payload?.nim || "225443028",
      id_lokasi: matchedLocationId,
      attendance: "present",
      status: "On Time",
      notes: "Face & Geofence Verified",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }

  // --- EVENT LISTENER MODAL LIVE ---
  if (btnRetry) {
    btnRetry.addEventListener("click", () => {
      errorState.classList.add("hidden");
      errorState.classList.remove("flex");
      if (currentStep === "location") startGeofencing();
      else if (currentStep === "face") initFaceVerification();
    });
  }

  if (btnDone) {
    btnDone.addEventListener("click", () => {
      stopCamera();
      window.dispatchEvent(new CustomEvent("app-navigate", { detail: "overview" }));
    });
  }

  if (btnOpenLive && modalLive) {
    btnOpenLive.onclick = () => {
      modalLive.classList.replace("hidden", "flex");
      gpsAttempts = 0;
      faceAttempts = 0;
      startGeofencing();
    };
  }

  if (btnCloseLive && modalLive) {
    btnCloseLive.onclick = () => {
      stopCamera();
      modalLive.classList.replace("flex", "hidden");
    };
  }

  // --- LOGIKA MODAL VERIFIKASI MANUAL (BARU) ---
  if (btnManual && modalManual && modalLive) {
    btnManual.onclick = () => {
      // 1. Tutup modal live attendance
      modalLive.classList.replace("flex", "hidden");
      // 2. Buka modal manual verification
      modalManual.classList.replace("hidden", "flex");
    };
  }

  if (btnCloseManual && modalManual) {
    btnCloseManual.onclick = () => {
      modalManual.classList.replace("flex", "hidden");
    };
  }

  templates.forEach(btn => {
    btn.onclick = () => {
        // Ambil pesan dari data-msg
        const msg = btn.getAttribute("data-msg");
        // Masukkan ke textarea
        manualNotes.value = msg;
        // Beri efek sedikit animasi pada textarea agar user sadar teks sudah masuk
        manualNotes.classList.add("ring-2", "ring-[#3b8ea5]");
        setTimeout(() => manualNotes.classList.remove("ring-2", "ring-[#3b8ea5]"), 500);
        
        manualNotes.focus();
    };
  });

 if (btnSubmitManual) {
    btnSubmitManual.onclick = (e) => {
        e.preventDefault();

        const notesInput = document.getElementById("manual-notes");
        const notesValue = notesInput.value.trim();

        // 1. Validasi Input
        if (!notesValue) {
            alert("Harap jelaskan kendala Anda atau pilih template agar bisa di-review Admin!");
            return;
        }

        // 2. Persiapan Data
        const now = new Date();
        const recordId = "ATT-" + Date.now();
        
        // Ambil data user dari state global
        const currentUser = db.state.currentUser; 
        const nimMahasiswa = currentUser.payload.nim;

        // 3. Simpan ke Database (db.attendance)
        // Kita set status ke 'Pending' agar Admin harus Approve/Reject manual
        db.attendance.insert(recordId, {
            id: recordId,
            id_mahasiswa: nimMahasiswa,
            id_lokasi: matchedLocationId || "-", // Menggunakan lokasi yang terdeteksi saat geofencing
            attendance: "permit", // Kategori permit (izin sistem)
            status: "Pending", 
            notes: "FAILED FACE SCAN: " + notesValue, // Keterangan untuk Admin
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
        });

        // 4. Feedback & Cleanup
        alert("Laporan manual berhasil dikirim. Status Anda saat ini 'Pending', silakan tunggu review dari Admin.");
        
        // Reset form
        notesInput.value = "";
        
        // Tutup modal live attendance
        if (modalLive) {
            modalLive.classList.replace("flex", "hidden");
            stopCamera(); // Pastikan kamera mati
        }

        // Kembali ke halaman utama untuk melihat update
        window.dispatchEvent(
            new CustomEvent("app-navigate", { detail: "overview" })
        );
    };
}
  // --- LOGIKA MODAL PENGAJUAN IZIN/SAKIT (EVENT DELEGATION) ---
  if (!window.izinEventBound) {
    window.izinEventBound = true;
    window.uploadedFileName = "";
    window.uploadedFileBase64 = null;

    document.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'dropzone-file') {
        const fileInput = e.target;
        const fileText = fileInput.previousElementSibling?.querySelector('p');

        if (fileInput.files && fileInput.files[0]) {
          window.uploadedFileName = fileInput.files[0].name;
          if (fileText) {
            fileText.textContent = window.uploadedFileName;
            fileText.classList.replace('text-gray-500', 'text-[#3b8ea5]');
            fileText.classList.add('font-bold');
          }
          const reader = new FileReader();
          reader.onload = (event) => { window.uploadedFileBase64 = event.target.result; };
          reader.readAsDataURL(fileInput.files[0]);
        }
      }
    });

    document.addEventListener('click', function (e) {
      const btnSubmitIzin = e.target.closest('#form-perizinan button');
      if (btnSubmitIzin) {
        e.preventDefault();

        const form = btnSubmitIzin.closest('#form-perizinan');
        const kategoriInput = form.querySelector('input[name="kategori"]:checked');
        const tanggalInput = form.querySelector('input[type="date"]');
        const keteranganInput = form.querySelector('textarea');

        if (!tanggalInput.value || !keteranganInput.value.trim()) {
          alert("Harap isi tanggal dan keterangan pengajuan!");
          return;
        }

        const attendanceType = kategoriInput.value === 'sakit' ? 'sick' : 'permit';
        const recordId = "ATT-" + Date.now();
        const dateObj = new Date(tanggalInput.value);
        const now = new Date();
        dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        let finalNotes = keteranganInput.value.trim();
        if (window.uploadedFileName) finalNotes += ` (Lampiran: ${window.uploadedFileName})`;

        db.attendance.insert(recordId, {
          id: recordId,
          id_mahasiswa: user?.payload?.id || user?.payload?.nim || "225443028",
          id_lokasi: "-",
          attendance: attendanceType,
          status: "Pending",
          notes: finalNotes,
          attachment: window.uploadedFileBase64 || null,
          created_at: dateObj.toISOString(),
          updated_at: now.toISOString()
        });

        alert(`Pengajuan ${kategoriInput.value} berhasil. Lihat tabel riwayat di bawah!`);

        form.reset();
        const fileText = form.querySelector('#dropzone-file')?.previousElementSibling?.querySelector('p');
        if (fileText) {
          fileText.textContent = "Klik untuk unggah";
          fileText.classList.replace('text-[#3b8ea5]', 'text-gray-500');
          fileText.classList.remove('font-bold');
        }
        window.uploadedFileName = "";
        window.uploadedFileBase64 = null;

        const modalLeaveInner = document.getElementById('modal-leave-request');
        if (modalLeaveInner) modalLeaveInner.classList.replace('flex', 'hidden');

        window.dispatchEvent(new CustomEvent("app-navigate", { detail: "overview" }));
      }
    });
  }

  // Buka/Tutup Modal Izin
  if (btnOpenLeave && modalLeave) {
    btnOpenLeave.onclick = () => { modalLeave.classList.replace("hidden", "flex"); };
  }
  if (btnCloseLeave && modalLeave) {
    btnCloseLeave.onclick = () => {
      modalLeave.classList.replace("flex", "hidden");
      const formPerizinan = document.getElementById("form-perizinan");
      const fileInput = document.getElementById("dropzone-file");
      const fileText = fileInput?.previousElementSibling?.querySelector('p');
      if (formPerizinan) formPerizinan.reset();
      if (fileText) {
        fileText.textContent = "Klik untuk unggah";
        fileText.classList.replace('text-[#3b8ea5]', 'text-gray-500');
        fileText.classList.remove('font-bold');
      }
      window.uploadedFileName = "";
      window.uploadedFileBase64 = null;
    };
  }

  // Buka/Tutup History
  if (btnOpenHistory && document.getElementById("modal-all-history")) {
    btnOpenHistory.onclick = () => document.getElementById("modal-all-history").classList.replace("hidden", "flex");
  }
  if (btnCloseHistory && document.getElementById("modal-all-history")) {
    btnCloseHistory.onclick = () => document.getElementById("modal-all-history").classList.replace("flex", "hidden");
  }
}

export function renderStudentAnnouncement() {
  const announcements = db.announcements || [];

  let announcementListHTML = "";

  if (announcements.length === 0) {
    announcementListHTML = `
            <div class="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
                <i class="fas fa-inbox text-gray-300 text-4xl mb-3"></i>
                <p class="text-gray-500 font-medium">Belum ada pengumuman saat ini.</p>
            </div>
        `;
  } else {
    announcementListHTML = announcements
      .slice()
      .reverse()
      .map((ann) => {
        let borderColor,
          badgeBg,
          badgeText,
          badgeBorder,
          hoverText,
          dotHtml,
          accentBg;

        if (ann.category === "Penting") {
          borderColor =
            "border-l-4 border-l-[#ab3428] border-t border-r border-b border-gray-100";
          badgeBg = "bg-red-50";
          badgeText = "text-[#ab3428]";
          badgeBorder = "border-red-100";
          hoverText = "group-hover:text-[#ab3428]";
          accentBg = "bg-[#ab3428]/5";
          dotHtml = `<div class="w-2.5 h-2.5 bg-[#ab3428] rounded-full animate-pulse shadow-[0_0_8px_#ab3428]"></div>`;
        } else if (ann.category === "Akademik") {
          borderColor =
            "border-l-4 border-l-[#2d728f] border-t border-r border-b border-gray-100";
          badgeBg = "bg-blue-50";
          badgeText = "text-[#2d728f]";
          badgeBorder = "border-blue-100";
          hoverText = "group-hover:text-[#2d728f]";
          accentBg = "bg-[#2d728f]/5";
          dotHtml = "";
        } else {
          borderColor =
            "border-l-4 border-l-[#f49e4c] border-t border-r border-b border-gray-100";
          badgeBg = "bg-orange-50";
          badgeText = "text-[#f49e4c]";
          badgeBorder = "border-orange-100";
          hoverText = "group-hover:text-[#f49e4c]";
          accentBg = "bg-[#f49e4c]/5";
          dotHtml = "";
        }

        return `
            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${borderColor} relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer">
                <div class="absolute top-0 right-0 w-32 h-32 ${accentBg} rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                
                <div class="flex justify-between items-start mb-4 relative z-10">
                    <div class="flex items-center gap-3">
                        <span class="px-2.5 py-1 ${badgeBg} ${badgeText} text-[10px] font-black rounded-md uppercase tracking-wide border ${badgeBorder}">${ann.category}</span>
                        <span class="text-xs text-gray-400 font-medium flex items-center gap-1"><i class="far fa-clock"></i> ${ann.date}</span>
                    </div>
                    ${dotHtml}
                </div>
                
                <h3 class="text-xl font-bold text-gray-800 mb-3 ${hoverText} transition-colors relative z-10">${ann.title}</h3>
                <p class="text-sm text-gray-600 leading-relaxed mb-5 relative z-10">
                    ${ann.content}
                </p>
                
                <div class="flex items-center gap-2 pt-4 border-t border-gray-100 relative z-10">
                    <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500"><i class="fas fa-user-shield"></i></div>
                    <span class="text-xs font-bold text-gray-500">Administrator Sistem</span>
                </div>
            </div>
            `;
      })
      .join("");
  }

  return `
    <div class="flex flex-col lg:flex-row gap-8">
        
        <div class="flex-[2] space-y-6">
            
            <div class="bg-gradient-to-r from-[#2d728f] to-[#3b8ea5] rounded-3xl p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(45,114,143,0.2)] border border-white/10 group">
                <div class="absolute -right-4 -top-8 text-white/10 text-9xl group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <i class="fas fa-bullhorn rotate-[-15deg]"></i>
                </div>
                
                <div class="relative z-10">
                    <span class="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-widest text-[#f5ee9e] backdrop-blur-md mb-3 inline-block border border-white/20">INFORMASI KAMPUS</span>
                    <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Pengumuman & Pembaruan</h1>
                    <p class="text-white/80 mt-3 text-sm max-w-md leading-relaxed">
                        Tetap <i class="italic">up-to-date</i> dengan informasi terbaru seputar perkuliahan, agenda kampus, dan pembaruan sistem ae-ttend.
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-2">
                <button class="px-4 py-2 bg-[#2d728f] text-white text-xs font-bold rounded-full shadow-sm transition">Semua</button>
                <button class="px-4 py-2 bg-white text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-full shadow-sm border border-gray-100 transition">Penting</button>
                <button class="px-4 py-2 bg-white text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-full shadow-sm border border-gray-100 transition">Akademik</button>
            </div>

            <div class="space-y-5">
                ${announcementListHTML}
            </div>
        </div>
        <div class="flex flex-col gap-6 w-full xl:w-[350px]">
            
            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h3 class="font-extrabold text-gray-800 mb-6 flex items-center gap-2 text-lg">
                    <i class="far fa-calendar-alt text-[#f49e4c]"></i> Agenda Terdekat
                </h3>
                
                <div class="space-y-5">
                    <div class="flex gap-4 items-center group cursor-default">
                        <div class="flex flex-col items-center justify-center w-14 h-14 bg-red-50 rounded-2xl border border-red-100 shrink-0 group-hover:bg-[#ab3428] group-hover:text-white transition-colors duration-300">
                            <span class="text-[10px] font-bold text-[#ab3428] group-hover:text-white/80 uppercase">Apr</span>
                            <span class="text-xl font-black text-[#ab3428] group-hover:text-white leading-none mt-0.5">28</span>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800 group-hover:text-[#ab3428] transition-colors">Awal Libur Idul Fitri</h4>
                            <p class="text-[11px] font-medium text-gray-500 mt-1">Seluruh kegiatan diliburkan</p>
                        </div>
                    </div>
                    
                    <div class="h-px bg-gray-100 ml-[72px]"></div>

                    <div class="flex gap-4 items-center group cursor-default">
                        <div class="flex flex-col items-center justify-center w-14 h-14 bg-[#3b8ea5]/10 rounded-2xl border border-[#3b8ea5]/20 shrink-0 group-hover:bg-[#3b8ea5] group-hover:text-white transition-colors duration-300">
                            <span class="text-[10px] font-bold text-[#3b8ea5] group-hover:text-white/80 uppercase">Mei</span>
                            <span class="text-xl font-black text-[#2d728f] group-hover:text-white leading-none mt-0.5">06</span>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800 group-hover:text-[#3b8ea5] transition-colors">Masuk Kuliah Kembali</h4>
                            <p class="text-[11px] font-medium text-gray-500 mt-1">Sistem presensi aktif kembali</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-[#f5ee9e] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#f49e4c]/20 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div class="absolute -right-6 -bottom-6 text-[#f49e4c]/20 text-7xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 pointer-events-none">
                    <i class="fas fa-question-circle"></i>
                </div>
                <h3 class="font-extrabold text-[#ab3428] mb-2 relative z-10 text-lg">Butuh Bantuan?</h3>
                <p class="text-xs font-medium text-[#ab3428]/80 relative z-10 leading-relaxed">
                    Jika Anda menemukan kendala terkait presensi atau informasi akademik yang kurang jelas, silakan hubungi layanan mahasiswa.
                </p>
                <button class="mt-5 px-5 py-2.5 bg-white/60 hover:bg-white text-[#ab3428] text-xs font-bold rounded-xl border border-[#ab3428]/20 hover:border-[#ab3428]/40 transition-all relative z-10 backdrop-blur-sm shadow-sm flex items-center gap-2 group/btn">
                    Hubungi Admin <i class="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                </button>
            </div>

        </div>
    </div>
    `;
}

export function attachStudentEvents() {
  initCalendar();

  const btnCheckin = document.getElementById("btn-checkin");
  if (btnCheckin) {
    btnCheckin.addEventListener("click", () => {
      console.log("Check-in diproses...");
    });
  }

  const locContainer = document.getElementById("location-list");
  if (locContainer) {
    locContainer.innerHTML = db.locations
      .map(
        (loc) => `
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p class="font-bold text-sm text-[#2d728f]">${loc.name}</p>
                <p class="text-xs text-gray-500">Radius: ${loc.radius} meter</p>
            </div>
        `,
      )
      .join("");
  }

  const statusDiv = document.getElementById("checkin-status");

  if (btnCheckin) {
    btnCheckin.addEventListener("click", () => {
      statusDiv.innerHTML =
        '<span class="text-blue-500">Mencari koordinat GPS...</span>';

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            let isInsideGeofence = false;

            db.locations.forEach((loc) => {
              const dist = calculateHaversine(
                userLat,
                userLng,
                loc.lat,
                loc.lng,
              );
              if (dist <= loc.radius) isInsideGeofence = true;
            });

            if (isInsideGeofence) {
              statusDiv.innerHTML =
                '<span class="text-yellow-600">Geofence Valid. Memulai Face Recognition...</span>';
              setTimeout(() => {
                executePresensiLogic();
              }, 1500);
            } else {
              statusDiv.innerHTML =
                '<span class="text-red-500">Anda berada di luar radius kampus.</span>';
            }
          },
          (error) => {
            statusDiv.innerHTML = `<span class="text-red-500">Error GPS: ${error.message}</span>`;
          },
        );
      } else {
        statusDiv.innerHTML =
          '<span class="text-red-500">Browser tidak mendukung Geolocation.</span>';
      }
    });
  }

  function executePresensiLogic() {
    const statusDiv = document.getElementById("checkin-status");
    const user = db.state.currentUser;

    const today = new Date().toISOString().split("T")[0];

    db.attendance.insert(Date.now().toString(), {
      nim: user.payload.nim,
      date: today,
      status: "Present",
      notes: "Geofence & Euclidean Passed",
    });

    statusDiv.innerHTML =
      '<span class="text-green-600 font-bold"><i class="fas fa-check-circle"></i> Presensi Berhasil Dicatat!</span>';
  }
}
