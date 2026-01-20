// Browser TTS (Speech Synthesis)
export function speakWithBrowser(text) {
  if (!window.speechSynthesis || !text) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) utter.voice = voices[0];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ElevenLabs TTS via backend
export async function playElevenLabsTTS(text) {
  try {
    const streamUrl = `http://localhost:5000/stream-voice?text=${encodeURIComponent(text)}`;
    const audio = new Audio(streamUrl);
    audio.play();
    return audio;
  } catch (err) {
    console.error("ElevenLabs TTS error", err);
  }
}


