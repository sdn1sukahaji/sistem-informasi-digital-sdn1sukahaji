// Memasukkan URL GAS yang Anda berikan
const API_URL = 'https://script.google.com/macros/s/AKfycbyfseRl94qmA0TaX1ODw3sr8Car6i0uf-3WEBKcJ8cDILdi459vW0CCqo28L3iGgHhVww/exec';

document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');

    // Pastikan kita ada di halaman login
    if(loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah halaman refresh

            // Ambil input dari user
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();

            // Siapkan elemen UI
            const btnText = document.getElementById('btnText');
            const btnLoading = document.getElementById('btnLoading');
            const btnLogin = document.getElementById('btnLogin');
            const alertMsg = document.getElementById('alertMessage');

            // 1. Ubah tombol menjadi mode "Loading"
            btnText.textContent = 'Memverifikasi...';
            btnLoading.classList.remove('d-none');
            btnLogin.disabled = true;
            alertMsg.classList.add('d-none');

            // 2. Siapkan URL dengan Parameter (Metode GET)
            const urlDenganParameter = `${API_URL}?action=login&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;

            // 3. Tembak API Google Apps Script
            // Perhatikan opsi redirect: 'follow' dan mode: 'cors'
            fetch(urlDenganParameter, {
                method: 'GET',
                mode: 'cors',      // Memberitahu browser bahwa kita tahu ini request lintas-domain
                redirect: 'follow' // Membiarkan browser mengikuti pengalihan (redirect) dari Google
            })
            .then(response => {
                 // Terkadang Google mengirimkan response yang tidak bisa langsung di-parse sebagai JSON jika ada error CORS.
                 // Kita coba ambil sebagai text dulu.
                 if (!response.ok) {
                     throw new Error(`HTTP error! status: ${response.status}`);
                 }
                 return response.text(); 
            })
            .then(textData => {
                 // Mencoba mengubah text menjadi objek JSON
                 try {
                     const data = JSON.parse(textData);
                     prosesRespon(data, btnText, btnLoading, btnLogin);
                 } catch (e) {
                     console.error("Gagal mem-parse JSON:", textData);
                     throw new Error("Respon dari server tidak valid.");
                 }
            })
            .catch(error => {
                console.error('Error Fetch:', error);
                // Kembalikan tombol ke semula jika gagal
                btnText.textContent = 'Masuk Sekarang';
                btnLoading.classList.add('d-none');
                btnLogin.disabled = false;
                
                // Menampilkan pesan error yang lebih spesifik jika memungkinkan
                showAlert('danger', `Gagal terhubung ke server. Pastikan Anda sudah Deploy ulang GAS Anda.`);
            });
        });
    }
});

// Fungsi untuk menangani data yang berhasil diterima
function prosesRespon(data, btnText, btnLoading, btnLogin) {
    // Kembalikan tombol ke semula
    btnText.textContent = 'Masuk Sekarang';
    btnLoading.classList.add('d-none');
    btnLogin.disabled = false;

    // Cek status dari backend GAS
    if(data.status === 'success') {
        showAlert('success', 'Login Berhasil! Mengalihkan...');
        localStorage.setItem('userSession', JSON.stringify(data.data));
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showAlert('danger', data.message || "Login gagal.");
    }
}

// Fungsi Bantuan untuk menampilkan pesan di atas form
function showAlert(type, message) {
    const alertMsg = document.getElementById('alertMessage');
    alertMsg.className = `alert alert-${type} mb-4 text-center small`;
    alertMsg.textContent = message;
    alertMsg.classList.remove('d-none');
}