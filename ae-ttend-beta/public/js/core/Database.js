import { DoublyLinkedList } from "./LinkedList.js";
const savedAnnouncements = localStorage.getItem("ae_announcements");

export const db = {
  users: new DoublyLinkedList(),
  attendance: new DoublyLinkedList(),
  faces: new DoublyLinkedList(),
  locations: [
    {
      id: "LOK001",
      name: "Kampus Kanayakan",
      lat: -6.87723,
      lng: 107.62067,
      radius: 80,
    },
    {
      id: "LOK002",
      name: "Kampus Dago Pojok",
      lat: -6.87327,
      lng: 107.61706,
      radius: 80,
    },
    {
      id: "LOK003",
      name: "Kos Agis",
      lat: -6.876899,
      lng: 107.619453,
      radius: 80,
    },
  ],
  state: {
    currentUser: null,
  },
  announcements: savedAnnouncements ? JSON.parse(savedAnnouncements) : [],
};

db.users.insert("2026001", {
  nim: "b",
  nama: "Agisna Fadilah Islami",
  kelas: "-",
  role: "admin",
  password: "b",
  userPic: "userPic1.jpg",
  faceCode: null,
});

db.users.insert("225443044", {
  nim: "a",
  nama: "Muhammad Huwaiza Rafi",
  kelas: "1AEC2",
  role: "student",
  password: "a",
  userPic: "userPic2.jpg",
  faceCode:
    "iKHsvUda3T1uLLw8ug+AvakmAb0b6Gq9mWLeveB4A76IYvQ92HyhvQVLiT4ODym9ZfWTvTGWLL6JJiq9hptBPsVjVb4bc/C9YxGKvcyxUDzBU9k9URQWvHEM5zvfNII9cP2NvYZZor4anuO9k4yEvWXq4j1rWDW9WHemvRxBGLya+Gm+Xn7ovU6SnTyelcY9oLYcvd2IU72A1iA+CRhvveAeR74Y5Y49CeKIPdiFbj5VToA+KpuEPRPbhD1RAxu+44TePcnaDr7St249I7oGPkVCBj5ol9Q9FB5NPFaPzb3KuRE8V7gKPjB6Zb3Ia0g96YmTPYzFLb17qIY8bU6jvVnIiD6LMD09RywKvkMnO777FvQ9FH7LvQKJxb1bpno9gFPovfmgJb4HPai+RMUEPciVyj5CJLw9iJ6GvnN4oD0gpJ+9E9qVvMwSDj5EWx8+fU5svJYu5jxwnN+9HcUqvfk1iz7uxDi9nUMjup6RUD5yHWw7SJ6GPciU3Dz5SFA9R7J6vaEGOT2d7em99lTYvIzRJD2hp2W7nOjAvEod7T18Q9K9HVkuPrpHNzwOns89FljJPCyT9zvMfJ+9riaevcLR5T3BOzm+0HNaPk8MGT6HqY49kfEAPuD7LT6QMCE+4AMZvElcqjshzjm+9aZ/u6Jkvj1KWgC9a7LwPTGXCz0=",
});

db.users.insert("225443045", {
  nim: "c",
  nama: "Hafdzi Rafsanzani",
  kelas: "1AEC2",
  role: "student",
  password: "c",
  userPic: "userPic3.jpeg",
  faceCode: null,
});

db.attendance.insert("ATT-1001", {
  id: "ATT-1001",
  id_mahasiswa: "225443045",
  id_lokasi: "LOK-001",
  attendance: "present",
  status: "On Time",
  notes: "Hadir verifikasi wajah di lab",
  created_at: new Date("2026-04-29T07:15:00Z").toISOString(),
  updated_at: new Date("2026-04-29T07:15:00Z").toISOString()
});

db.attendance.insert("ATT-1002", {
  id: "ATT-1002",
  id_mahasiswa: "225443045",
  id_lokasi: "-",
  attendance: "sick",
  status: "Pending",
  notes: "Sakit demam, surat dokter terlampir",
  created_at: new Date("2026-04-28T08:00:00Z").toISOString(),
  updated_at: new Date("2026-04-28T08:00:00Z").toISOString()
});

db.attendance.insert("ATT-1003", {
  id: "ATT-1003",
  id_mahasiswa: "225443045",
  id_lokasi: "-",
  attendance: "permit",
  status: "Approved",
  notes: "Dispensasi organisasi ATI",
  created_at: new Date("2026-04-27T07:30:00Z").toISOString(),
  updated_at: new Date("2026-04-28T10:00:00Z").toISOString()
});

db.attendance.insert("ATT-1004", {
  id: "ATT-1004",
  id_mahasiswa: "225443044",
  id_lokasi: "-",
  attendance: "permit",
  status: "Approved",
  notes: "Dispensasi organisasi AAA",
  created_at: new Date("2026-04-27T07:30:00Z").toISOString(),
  updated_at: new Date("2026-04-28T10:00:00Z").toISOString()
});