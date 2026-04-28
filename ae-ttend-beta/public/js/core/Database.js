import { DoublyLinkedList } from './LinkedList.js';

export const db = {
    users: new DoublyLinkedList(),
    attendance: new DoublyLinkedList(),
    faces: new DoublyLinkedList(),
    locations: [
        { id: 'LOK001', name: 'Kampus Utama', lat: -6.8863, lng: 107.6152, radius: 50 },
        { id: 'LOK002', name: 'Kampus Cabang', lat: -6.9001, lng: 107.6201, radius: 50 },
        { id: 'LOK003', name: 'Kos Agis', lat: -6.876899, lng: 107.619453, radius: 50 }
    ],
    state: {
        currentUser: null 
    }
};

db.users.insert('2026001', { nim: '2026001', nama: 'Agis Sang Admin', kelas: '-', role: 'admin', password: 'admin123', userPic: 'userPic1.jpg' });
db.users.insert('225443044', { nim: 'a', nama: 'Huwaiza Manusia Biasa', kelas: '1AEC2', role: 'student', password: 'a', userPic: 'userPic2.jpg' });