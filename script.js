document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://apk-bugger.railway.app';  // BACKEND RAILWAY LU BRO 🔥

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

  function showLoading(btn, text = 'Loading... 🔥') {
    btn.disabled = true;
    btn.innerHTML = text;
  }

  function hideLoading(btn, originalText) {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }

  async function checkConnection() {
    try {
      const res = await fetch(`${API_BASE}/status`);
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
      console.error('Status check error:', err);
    }
  }

  setInterval(checkConnection, 5000);
  checkConnection();

  generateBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim().replace('+', '');
    if (!phone || phone.length < 10) {
      alert('Masukin nomor valid bro (628xxxxxxxxxx) 🔥');
      return;
    }

    const originalText = generateBtn.innerHTML;
    showLoading(generateBtn);

    try {
      const res = await fetch(`${API_BASE}/generate-pairing`, {
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
      console.error('Generate error:', err);
      alert('Gagal konek ke backend Railway. Cek console browser atau dashboard Railway lu.');
    } finally {
      hideLoading(generateBtn, originalText);
    }
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      alert('Kode dicopy! Paste ke WA lu 🔥');
    });
  });

  disconnectBtn.addEventListener('click', () => {
    alert('Disconnect: hapus folder auth_info di Railway kalau mau reset pairing');
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

    const originalText = sendBtn.innerHTML;
    showLoading(sendBtn);

    try {
      const res = await fetch(`${API_BASE}/send-bug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, bugs })
      });
      const data = await res.json();
      alert(data.message || (data.success ? 'Bug terkirim Ω 🔥' : 'Gagal kirim'));
    } catch (err) {
      console.error('Send error:', err);
      alert('Gagal kirim ke backend');
    } finally {
      hideLoading(sendBtn, originalText);
    }
  });
});
