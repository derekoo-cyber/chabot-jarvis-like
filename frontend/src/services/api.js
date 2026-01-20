const API_BASE = 'http://localhost:5000/api';

export async function sendMessage(text) {
  const res = await fetch(`${API_BASE}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errData.error || 'Server error');
  }

  const data = await res.json();
  return data.reply || "Hmm, I couldn't find an answer.";
}

export async function getGreeting() {
  const res = await fetch(`${API_BASE}/greet`);
  const data = await res.json();
  return data.reply;
}

export async function getVoiceStream(text) {
  const streamUrl = `http://localhost:5000/stream-voice?text=${encodeURIComponent(text)}`;
  const audio = new Audio(streamUrl);
  audio.play();
  return audio;
}
