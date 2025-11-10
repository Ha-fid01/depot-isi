// Foto kelompok popup
document.querySelectorAll('.kelompok-container img').forEach(image =>{
    image.onclick = () =>{
      document.querySelector('.popup-image').style.display = 'block';
      document.querySelector('.popup-image img').src = image.getAttribute('src');
    }
  });
  
  document.querySelector('.popup-image span').onclick = () =>{
    document.querySelector('.popup-image').style.display = 'none';
  }
  
  // Produk
  const products = [
    {id:1,name:'Galon Isi Ulang 19L',desc:'Air mineral isi ulang 19 liter, sanitasi terjaga',price:25000},
    {id:2,name:'Galon Baru 19L (Kosong)',desc:'Galon PET kosong untuk pertama kali',price:35000},
    {id:3,name:'Isi Ulang 19L - Paket Hemat x3',desc:'3x isi ulang, hemat 10%',price:67500},
    {id:4,name:'Filter & Sanitasi Tambahan',desc:'Layanan sanitasi ekstra untuk galon',price:12000},
    {id:5,name:'Langganan Bulanan (4 isi)',desc:'4 isi per bulan dengan diskon',price:90000},
    {id:6,name:'Delivery Express',desc:'Pengantaran prioritas dalam 24 jam',price:20000}
  ];
  
  const formatRP = v => 'Rp' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  const productsGrid = document.getElementById('productsGrid');
  function renderProducts(list){
    productsGrid.innerHTML = '';
    list.forEach(p=>{
      const card = document.createElement('div'); 
      card.className='card';
      card.innerHTML = `
        <div class="img"></div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div class="small">${p.desc}</div>
            </div>
            <div class="price">${formatRP(p.price)}</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn" data-add="${p.id}">Tambah</button>
            <button class="btn ghost" data-info="${p.id}">Detail</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }
  renderProducts(products);
  
  // Cart logic
  let cart = JSON.parse(localStorage.getItem('ecogalon_cart')||'[]');
  const cartCountEl = document.getElementById('cartCount');
  const cartListEl = document.getElementById('cartList');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartPanel = document.getElementById('cartPanel');
  
  function saveCart(){ 
    localStorage.setItem('ecogalon_cart', JSON.stringify(cart)); 
    updateCartUI(); 
  }
  function updateCartUI(){
    cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
    cartListEl.innerHTML = '';
    let total = 0;
    cart.forEach(item=>{
      total += item.qty*item.price;
      const row = document.createElement('div'); 
      row.className='cart-item';
      row.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:700">${item.name}</div>
          <div class="small">${formatRP(item.price)} x ${item.qty}</div>
        </div>
        <div class="qty">
          <button class="btn ghost" data-dec="${item.id}">-</button>
          <div class="small" style="min-width:22px;text-align:center">${item.qty}</div>
          <button class="btn" data-inc="${item.id}">+</button>
        </div>`;
      cartListEl.appendChild(row);
    });
    cartTotalEl.textContent = formatRP(total);
  }
  
  document.body.addEventListener('click', e=>{
    if(e.target.dataset.add){
      const id = Number(e.target.dataset.add); 
      const p = products.find(x=>x.id===id);
      const existing = cart.find(x=>x.id===id);
      if(existing) existing.qty++;
      else cart.push({id:p.id,name:p.name,price:p.price,qty:1});
      saveCart();
      showToast('Ditambahkan ke keranjang');
    }
    if(e.target.dataset.info){
      const id = Number(e.target.dataset.info); 
      const p = products.find(x=>x.id===id);
      alert(p.name + "\n\n" + p.desc + "\nHarga: " + formatRP(p.price));
    }
    if(e.target.dataset.inc){
      const id = Number(e.target.dataset.inc); 
      const it = cart.find(x=>x.id===id); 
      if(it){ it.qty++; saveCart(); }
    }
    if(e.target.dataset.dec){
      const id = Number(e.target.dataset.dec); 
      const it = cart.find(x=>x.id===id); 
      if(it){ it.qty--; if(it.qty<=0) cart = cart.filter(x=>x.id!==id); saveCart(); }
    }
  });
  
  document.getElementById('openCartBtn').addEventListener('click', ()=>{ 
    cartPanel.style.display = cartPanel.style.display==='none'?'block':'none'; 
    updateCartUI(); 
  });
  document.getElementById('checkoutBtn').addEventListener('click', ()=>{ openModal(); });

  // ======== SIMPAN PESANAN KE ADMIN DASHBOARD ========
  document.getElementById('submitOrder').addEventListener('click', (e) => {
    e.preventDefault();
  
    const nama = document.getElementById('nameInput').value.trim();
    const telepon = document.getElementById('phoneInput').value.trim();
    const alamat = document.getElementById('addressInput').value.trim();
    const cartData = JSON.parse(localStorage.getItem('ecogalon_cart') || '[]');
  
    if (!nama || !telepon || !alamat) {
      alert('Mohon isi semua data pemesanan.');
      return;
    }
  
    if (cartData.length === 0) {
      alert('Keranjang masih kosong.');
      return;
    }
  
    // Hitung total harga
    let totalHarga = 0;
    cartData.forEach(item => totalHarga += item.price * item.qty);

    // Buat data pesanan
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    const pesanan = {
      nama,
      telepon,
      alamat,
      email: currentUser ? currentUser.email : null,
      items: cartData,
      totalHarga,
      waktu: new Date().toLocaleString('id-ID')
    };
    
  
    // Simpan ke localStorage
    const allOrders = JSON.parse(localStorage.getItem('ecogalon_orders') || '[]');
    allOrders.push(pesanan);
    localStorage.setItem('ecogalon_orders', JSON.stringify(allOrders));
  
    // Kosongkan keranjang
    localStorage.removeItem('ecogalon_cart');
    alert('✅ Pesanan berhasil dikirim!');
    document.getElementById('modalBackdrop').style.display = 'none';
  
    // Update dashboard admin jika sedang login
    if (localStorage.getItem('isAdmin') === 'true') {
      renderAdminTable();
    }
  });
  
  
  // search
  document.getElementById('searchInput').addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = products.filter(p=>p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    renderProducts(filtered);
  });
  
  // modal
  const modal = document.getElementById('modalBackdrop');
  document.getElementById('orderNow').addEventListener('click', openModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  
  function openModal(){ 
    if(cart.length===0){ 
      if(!confirm('Keranjang kosong. Mau pesan 1 galon 19L sekarang?')) return; 
      cart.push({id:1,name:products[0].name,price:products[0].price,qty:1}); 
      saveCart(); 
    }
    modal.style.display='flex'; 
  }
  function closeModal(){ modal.style.display='none'; }
  
  document.getElementById('submitOrder').addEventListener('click', ()=>{
    const name = document.getElementById('nameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();
    const address = document.getElementById('addressInput').value.trim();
    if(!name||!phone||!address){ alert('Mohon isi semua data pemesanan.'); return; }
    const order = {customer:{name,phone,address},items:cart, total:cart.reduce((s,i)=>s+i.qty*i.price,0), date:new Date().toISOString()};
    console.log('Order submitted', order);
    cart = []; saveCart(); closeModal(); alert('Pesanan diterima! Tim kami akan menghubungi Anda.');
  });
  
  // toast
  function showToast(msg){
    const t = document.createElement('div'); 
    t.textContent = msg; 
    t.style= 'position:fixed;left:50%;transform:translateX(-50%);bottom:36px;background:#0f172a;color:white;padding:8px 14px;border-radius:8px;opacity:0;transition:all .25s';
    document.body.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity=1; t.style.bottom='46px'; });
    setTimeout(()=>{ t.style.opacity=0; t.style.bottom='36px'; setTimeout(()=>t.remove(),300); },1200);
  }
  
  // init
  (function(){ 
    document.getElementById('year').textContent = new Date().getFullYear(); 
    updateCartUI(); 
  })();
  


  // ================= ADMIN PANEL LOGIC =================
const openAdminBtn = document.getElementById('openAdminBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const closeAdminLogin = document.getElementById('closeAdminLogin');
const loginAdminBtn = document.getElementById('loginAdminBtn');
const loginError = document.getElementById('loginError');
const adminPanel = document.getElementById('adminPanel');

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345"; // ganti password sesuai keinginan

// buka modal login admin
openAdminBtn.addEventListener('click', () => {
  adminLoginModal.style.display = 'flex';
});

// tutup modal login
closeAdminLogin.addEventListener('click', () => {
  adminLoginModal.style.display = 'none';
  loginError.style.display = 'none';
});

// tombol login admin
loginAdminBtn.addEventListener('click', () => {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem('isAdmin', 'true');
    adminLoginModal.style.display = 'none';
    renderAdminTable();
    adminPanel.style.display = 'block';
  } else {
    loginError.style.display = 'block';
  }
});

// logout admin
document.getElementById('logoutAdmin').addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  adminPanel.style.display = 'none';
});

// tampilkan tabel admin
// ======== TAMPILKAN PESANAN DI DASHBOARD ADMIN ========
function renderAdminTable(){
  const tableBody = document.getElementById('adminTableBody');
  const totalQtyEl = document.getElementById('adminTotalQty');
  const totalHargaEl = document.getElementById('adminTotalHarga');
  const allOrders = JSON.parse(localStorage.getItem('ecogalon_orders') || '[]');

  tableBody.innerHTML = '';

  if(allOrders.length === 0){
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#6b7280;padding:8px;">Belum ada pesanan masuk</td></tr>`;
    totalQtyEl.textContent = 0;
    totalHargaEl.textContent = 'Rp0';
    return;
  }

  let totalQty = 0;
  let totalHarga = 0;

  allOrders.forEach(order=>{
    order.items.forEach(item=>{
      const row = document.createElement('tr');
      row.innerHTML = `
      <td style="padding:8px;border:1px solid #e2e8f0;">
      ${item.name}<br>
      <small><i>${order.nama} (${order.telepon}) - ${order.alamat}</i></small>
    </td>    
        <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">${item.qty}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Rp${(item.price * item.qty).toLocaleString('id-ID')}</td>
      `;
      tableBody.appendChild(row);

      totalQty += item.qty;
      totalHarga += item.price * item.qty;
    });
  });

  totalQtyEl.textContent = totalQty;
  totalHargaEl.textContent = 'Rp' + totalHarga.toLocaleString('id-ID');
}



// hapus data pembelian
document.getElementById('clearDataBtn').addEventListener('click', ()=>{
  if(confirm('Yakin ingin menghapus semua data pembelian?')){
    localStorage.removeItem('ecogalon_cart');
    renderAdminTable();
    alert('Data pembelian berhasil dihapus.');
  }
});

// auto tampilkan admin jika sudah login
if(localStorage.getItem('isAdmin')==='true'){
  adminPanel.style.display='block';
  renderAdminTable();
}

// ================= USER REGISTER & LOGIN =================
const registerModal = document.getElementById('registerModal');
const userLoginModal = document.getElementById('userLoginModal');
const openRegisterLink = document.getElementById('openRegisterLink');
const closeRegister = document.getElementById('closeRegister');
const submitRegister = document.getElementById('submitRegister');
const regMsg = document.getElementById('regMsg');

const closeUserLogin = document.getElementById('closeUserLogin');
const loginUserBtn = document.getElementById('loginUserBtn');
const userLoginError = document.getElementById('userLoginError');

// Tombol "Pesan Sekarang" diarahkan ke login user
document.getElementById('orderNow').addEventListener('click', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    alert(`Halo ${currentUser.name}, silakan pilih produk untuk dipesan.`);
  } else {
    userLoginModal.style.display = 'flex';
  }
});

// Buka modal register dari modal login
openRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  userLoginModal.style.display = 'none';
  registerModal.style.display = 'flex';
});

// Tutup modal register
closeRegister.addEventListener('click', () => {
  registerModal.style.display = 'none';
});

// Submit register
submitRegister.addEventListener('click', () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value.trim();

  if (!name || !email || !pass) {
    alert('Harap isi semua kolom.');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    regMsg.style.display = 'block';
    return;
  }

  const newUser = { name, email, pass, date: new Date().toLocaleString() };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  alert('Pendaftaran berhasil! Silakan login.');
  registerModal.style.display = 'none';
  userLoginModal.style.display = 'flex';
});

// Tutup modal login user
closeUserLogin.addEventListener('click', () => {
  userLoginModal.style.display = 'none';
});

// Login user
loginUserBtn.addEventListener('click', () => {
  const email = document.getElementById('userLoginEmail').value.trim();
  const pass = document.getElementById('userLoginPass').value.trim();

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.pass === pass);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    userLoginModal.style.display = 'none';
    alert(`Selamat datang, ${user.name}!`);
  } else {
    userLoginError.style.display = 'block';
  }
});

// ================= ADMIN MENAMPILKAN DAFTAR USER =================
function renderUserList() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  let tableHTML = `
    <h3 style="margin-top:30px;">👥 Daftar Pengguna Terdaftar</h3>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <thead style="background:#cffafe;">
        <tr>
          <th style="padding:8px;border:1px solid #e2e8f0;">Nama</th>
          <th style="padding:8px;border:1px solid #e2e8f0;">Email</th>
          <th style="padding:8px;border:1px solid #e2e8f0;">Tanggal Daftar</th>
        </tr>
      </thead>
      <tbody>
        ${users.length > 0 ? users.map(u => `
          <tr>
            <td style="padding:8px;border:1px solid #e2e8f0;">${u.name}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${u.email}</td>
            <td style="padding:8px;border:1px solid #e2e8f0;">${u.date}</td>
          </tr>`).join('') : `
          <tr><td colspan="3" style="padding:8px;text-align:center;color:#6b7280;">Belum ada pengguna</td></tr>`}
      </tbody>
    </table>
  `;
  adminPanel.insertAdjacentHTML('beforeend', tableHTML);
}

// Jalankan ketika admin login
loginAdminBtn.addEventListener('click', () => {
  if (document.getElementById('adminUser').value.trim() === ADMIN_USER &&
      document.getElementById('adminPass').value.trim() === ADMIN_PASS) {
    setTimeout(renderUserList, 300);
  }
});

// ---------- User Status & Logout ----------
function updateUserHeader(){
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const userSection = document.getElementById('userSection');
  if(user){
    userSection.innerHTML = `
      <span class="text-sm mr-2">👋 Halo, <b>${user.name}</b></span>
      <button id="logoutUserBtn" class="btn ghost">Logout</button>
    `;
    document.getElementById('logoutUserBtn').onclick = ()=>{
      localStorage.removeItem('currentUser');
      updateUserHeader();
      alert('Anda telah logout.');
    };
  } else {
    userSection.innerHTML = `<button id="loginUserBtnOpen" class="btn">Login User</button>`;
    document.getElementById('loginUserBtnOpen').onclick=()=>userLoginModal.style.display='flex';
  }
}
updateUserHeader();




// ================== DASHBOARD USER ==================

// Ambil user yang sedang login dari localStorage
let loggedUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Fungsi untuk menampilkan dashboard user
function showUserDashboard() {
  const dashboard = document.getElementById("userDashboard");
  const userOrdersBody = document.getElementById("userOrdersBody");
  if (!loggedUser) return;

  const allOrders = JSON.parse(localStorage.getItem("ecogalon_orders") || "[]");
  const userOrders = allOrders.filter(o => o.telepon === loggedUser.phone || o.email === loggedUser.email);

  userOrdersBody.innerHTML = "";

  if (userOrders.length === 0) {
    userOrdersBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b7280;padding:8px;">Belum ada pesanan</td></tr>`;
    dashboard.style.display = "block";
    return;
  }

  userOrders.forEach(order => {
    order.items.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="padding:8px;border:1px solid #e2e8f0;">${order.waktu}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${item.name}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">${item.qty}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${formatRP(item.price * item.qty)}</td>
      `;
      userOrdersBody.appendChild(row);
    });
  });

  dashboard.style.display = "block";
}

// Tampilkan riwayat pesanan otomatis setelah login user
if (loggedUser) {
  showUserDashboard();
}


// ================== FITUR HAPUS RIWAYAT ==================
const hapusRiwayatBtn = document.getElementById("hapusRiwayatBtn");

if (hapusRiwayatBtn) {
  hapusRiwayatBtn.addEventListener("click", () => {
    if (!loggedUser) return alert("Anda belum login!");

    const konfirmasi = confirm("Apakah Anda yakin ingin menghapus semua riwayat pesanan Anda?");
    if (!konfirmasi) return;

    let allOrders = JSON.parse(localStorage.getItem("ecogalon_orders") || "[]");

    // Hapus hanya pesanan milik user ini (berdasarkan email atau telepon)
    allOrders = allOrders.filter(o => 
      o.telepon !== loggedUser.phone && o.email !== loggedUser.email
    );

    localStorage.setItem("ecogalon_orders", JSON.stringify(allOrders));

    alert("Riwayat pesanan Anda telah dihapus!");
    showUserDashboard(); // Perbarui tampilan tabel
  });
}



// Perbarui tampilan setelah login user baru
loginUserBtn.addEventListener("click", () => {
  setTimeout(() => {
    loggedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (loggedUser) showUserDashboard();
  }, 500);
});




// hapus semua data pesanan
document.getElementById('clearDataBtn').addEventListener('click', ()=>{
  if(confirm('Yakin ingin menghapus semua data pesanan?')){
    localStorage.removeItem('ecogalon_orders');
    renderAdminTable();
    alert('Semua data pesanan berhasil dihapus.');
  }
});

document.getElementById('resetAllBtn').addEventListener('click', ()=>{
  if(confirm('Yakin ingin mereset semua data (login, pesanan, keranjang)?')){
    localStorage.clear();
    alert('Semua data berhasil direset.');
    location.reload();
  }
});



// ======== SIMPAN PESANAN KE ADMIN DASHBOARD ========
document.getElementById('submitOrder').addEventListener('click', (e) => {
  e.preventDefault();

  const nama = document.getElementById('nameInput').value.trim();
  const telepon = document.getElementById('phoneInput').value.trim();
  const alamat = document.getElementById('addressInput').value.trim();
  const cartData = JSON.parse(localStorage.getItem('ecogalon_cart') || '[]');

  if (!nama || !telepon || !alamat) {
    alert('Mohon isi semua data pemesanan.');
    return;
  }

  if (cartData.length === 0) {
    alert('Keranjang masih kosong.');
    return;
  }

  // Hitung total harga
  let totalHarga = 0;
  cartData.forEach(item => {
    totalHarga += item.price * item.qty;
  });

  // Buat data pesanan
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  const pesanan = {
    nama,
    telepon,
    alamat,
    email: currentUser ? currentUser.email : null,
    items: cartData,
    totalHarga,
    waktu: new Date().toLocaleString('id-ID')
  };
  

  // Simpan ke localStorage
  const allOrders = JSON.parse(localStorage.getItem('ecogalon_orders') || '[]');
  allOrders.push(pesanan);
  localStorage.setItem('ecogalon_orders', JSON.stringify(allOrders));

  // Kosongkan keranjang
  localStorage.removeItem('ecogalon_cart');
  cart = [];
  updateCartUI();

  alert('✅ Pesanan berhasil dikirim!');
  document.getElementById('modalBackdrop').style.display = 'none';

  // Jika admin sedang login, langsung refresh tabel
  if (localStorage.getItem('isAdmin') === 'true') {
    renderAdminTable();
  }
});


// Hitung total jumlah item
const totalQty = cartData.reduce((sum, item) => sum + item.qty, 0);
let totalHarga = cartData.reduce((sum, item) => sum + item.price * item.qty, 0);
let diskon = 0;

// Terapkan diskon berdasarkan jumlah
if (totalQty > 10) {
  diskon = 0.20; // 20%
} else if (totalQty > 5) {
  diskon = 0.10; // 10%
}

const potonganHarga = totalHarga * diskon;
const totalSetelahDiskon = totalHarga - potonganHarga;

// Buat objek pesanan
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
const pesanan = {
  nama,
  telepon,
  alamat,
  email: currentUser ? currentUser.email : null,
  items: cartData,
  totalQty,
  totalHarga,
  diskonPersen: diskon * 100,
  potonganHarga,
  totalSetelahDiskon,
  waktu: new Date().toLocaleString('id-ID')
};
