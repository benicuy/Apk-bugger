document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://w.mbbstore.my.id:2139';  // PORT 2139 lu bro

  const phoneInput = document.getElementById('phoneNumberInput');
  const generateBtn = document.getElementById('generatePairingBtn');
  const pairingBox = document.getElementById('pairingCodeBox');
  const codeDisplay = document.getElementById('pairingCodeDisplay');
  const copyBtn = document.getElementById('copyCodeBtn');
  const disconnectBtn = document.getElementById('disconnectBotBtn');
  const botStatusText = document.getElementById('botStatusText');
  const botStatusDot = document.getElementById('botStatusDot');
  const targetInput = document.getElementById('targetNumber');
  const sendBtn = document.getElementById('sendBugBtn');
  const bugCheckboxes = document.querySelectorAll('.bug-checkbox');

  let isConnected = false;
  let currentCode = '';

  // Loading state
  function showLoading(btn) {
    btn.disabled = true;
    btn.innerHTML = 'Loading... 🔥';
  }

  function hideLoading(btn, text) {
    btn.disabled = false;
    btn.innerHTML = text;
  }

  async function checkConnection() {
    try {
      const res = await fetch(`${API_BASE}/status`, { mode: 'cors' });
      if (!res.ok) throw new Error('Status not OK');
      const data = await res.json();
      if (data.connected && !isConnected) {
        isConnected = true;
        botStatusText.textContent = 'Status: Connected via Pairing';
        botStatusDot.classList.remove('disconnected');
        botStatusDot.classList.add('connected');
        disconnectBtn.disabled = false;
        checkSendButton();
      }
    } catch (err) {
      console.error('Connection check failed:', err);
    }
  }
  setInterval(checkConnection, 6000); // 6 detik biar ga terlalu spam
  checkConnection();

  generateBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim().replace('+', '');
    if (!phone || !/^\d{10,15}$/.test(phone)) {
      alert('Nomor harus 628xxxxxxxxxx bro 🔥');
      return;
    }

    showLoading(generateBtn);
    try {
      const res = await fetch(`${API_BASE}/generate-pairing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
        mode: 'cors'
      });
      const data = await res.json();

      if (data.success) {
        currentCode = data.pairingCode;
        codeDisplay.textContent = data.pairingCode;
        pairingBox.style.display = 'block';
        alert(`Kode pairing: ${data.pairingCode}\nMasukin di WA sekarang! (8 digit)`);
      } else {
        alert(data.message || 'Gagal generate code bro π');
      }
    } catch (err) {
      console.error('Generate failed:', err);
      alert('Gagal konek ke backend. Cek: backend nyala? Port 2139 open? Console browser ada error apa?');
    } finally {
      hideLoading(generateBtn, 'GENERATE PAIRING CODE 🔥');
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      alert('Kode dicopy! Paste ke WA lu bro 🔥');
    }).catch(() => {
      alert('Gagal copy, salin manual aja');
    });
  });

  disconnectBtn.addEventListener('click', () => {
    alert('Disconnect permanen: hapus folder auth_info di panel Pterodactyl lalu restart server');
    isConnected = false;
    botStatusText.textContent = 'Status: Disconnected';
    botStatusDot.classList.remove('connected');
    botStatusDot.classList.add('disconnected');
    disconnectBtn.disabled = true;
    pairingBox.style.display = 'none';
    checkSendButton();
  });

  function checkSendButton() {
    const target = targetInput.value.trim();
    const anyBug = Array.from(bugCheckboxes).some(cb => cb.checked);
    sendBtn.disabled = !(isConnected && target && anyBug);
  }

  targetInput.addEventListener('input', checkSendButton);
  bugCheckboxes.forEach(cb => cb.addEventListener('change', checkSendButton));

  sendBtn.addEventListener('click', async () => {
    const target = targetInput.value.trim();
    const bugs = Array.from(bugCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    showLoading(sendBtn);
    try {
      const res = await fetch(`${API_BASE}/send-bug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, bugs }),
        mode: 'cors'
      });
      const data = await res.json();
      alert(data.message || (data.success ? 'Bug terkirim Ω 🔥' : 'Gagal kirim'));
    } catch (err) {
      console.error('Send bug failed:', err);
      alert('Gagal kirim ke backend bro');
    } finally {
      hideLoading(sendBtn, 'KIRIM BUG Ω 🔥');
    }
  });
});
