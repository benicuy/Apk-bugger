document.addEventListener('DOMContentLoaded', () => {
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

  // Cek status connected dari backend setiap 5 detik
  async function checkConnection() {
    try {
      const res = await fetch('https://w.mbbstore.my.id/server/');
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
      console.log('Backend ga nyambung / masih loading');
    }
  }
  setInterval(checkConnection, 5000);
  checkConnection(); // cek pertama kali

  generateBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim().replace('+', '');
    if (!phone || !/^\d{10,15}$/.test(phone)) {
      alert('Masukin nomor valid bro (contoh: 6281234567890) 🔥');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/generate-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await res.json();

      if (data.success) {
        currentCode = data.pairingCode;
        codeDisplay.textContent = data.pairingCode;
        pairingBox.style.display = 'block';
        alert(`Kode pairing: ${data.pairingCode}\nMasukin di WA sekarang bro! (8 digit)`);
      } else {
        alert(data.message || 'Gagal generate code π');
      }
    } catch (err) {
      alert('Server error, pastiin backend nyala bro');
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      alert('Kode dicopy! Paste ke WA lu 🔥');
    }).catch(() => {
      alert('Gagal copy, salin manual aja bro');
    });
  });

  disconnectBtn.addEventListener('click', async () => {
    // Simulasi disconnect (realnya hapus folder auth_info manual)
    alert('Untuk disconnect permanen, hapus folder auth_info di backend lalu restart server bro π');
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

    try {
      const res = await fetch('http://localhost:3000/send-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, bugs })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sukses kirim bug ke ${target}!\nBug: ${bugs.join(', ')} 🕊 Ω 🔥`);
      } else {
        alert(data.message || 'Gagal kirim');
      }
    } catch (err) {
      alert('Gagal konek ke backend bro');
    }
  });
});
