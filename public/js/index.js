document.addEventListener("DOMContentLoaded", () => {
    // 1. Ambil waktu saat ini
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // Index 0-11
    const today = date.getDate();

    // Array nama bulan dan hari
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // 2. Update tulisan Header Kalender (Contoh: September 17 Sunday)
    document.getElementById("month-date-display").innerText = `${monthNames[currentMonth]} ${today}`;
    document.getElementById("day-display").innerText = dayNames[date.getDay()];

    // 3. Logika perhitungan kalender
    // Cari tahu hari pertama di bulan ini jatuh di hari apa (0 = Minggu, 1 = Senin, dst)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Cari tahu jumlah total hari di bulan ini (30 atau 31)
    const lastDayDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    const calendarDays = document.getElementById("calendar-days");
    let daysHTML = "";

    // A. Buat ruang kosong untuk hari sebelum tanggal 1
    for (let i = 0; i < firstDayIndex; i++) {
        daysHTML += `<div></div>`;
    }

    // B. Cetak tanggal 1 sampai akhir bulan
    for (let i = 1; i <= lastDayDate; i++) {
        // Cek apakah tanggal ini adalah hari ini (today)
        if (i === today) {
            // Tampilan (Styling) khusus untuk Hari Ini (Warna Orange)
            daysHTML += `
                <div class="bg-orange-400 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto cursor-pointer font-bold shadow-md">
                    ${i}
                </div>
            `;
        } else {
            // Tampilan (Styling) untuk hari biasa
            daysHTML += `
                <div class="cursor-pointer hover:font-bold hover:text-indigo-600 flex items-center justify-center h-7 w-7 mx-auto rounded-full hover:bg-indigo-50 transition">
                    ${i}
                </div>
            `;
        }
    }

    // 4. Masukkan HTML yang sudah dibuat ke dalam wadah kalender
    calendarDays.innerHTML = daysHTML;
});