const fs = require('fs');
const path = require('path');

function createEmergencySirenWav() {
  const sampleRate = 44100;
  const durationSec = 3.0; // 3 seconds loopable
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Generate piercing alternating dual-tone emergency dispatch siren
  // Tone A: 900 Hz, Tone B: 1350 Hz with 12 Hz vibrato
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Alternate every 0.2 seconds between 900Hz and 1350Hz
    const cycle = Math.floor(t / 0.18) % 2;
    const baseFreq = cycle === 0 ? 880 : 1320;
    // Vibrato
    const vibrato = Math.sin(2 * Math.PI * 14 * t) * 60;
    const freq = baseFreq + vibrato;

    // Harmonic blend for harsh emergency buzzer piercing quality
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = 0.35 * Math.sin(2 * Math.PI * (freq * 2) * t);
    const s3 = 0.15 * Math.sin(2 * Math.PI * (freq * 3) * t);

    const sample = Math.max(-1, Math.min(1, (s1 + s2 + s3) * 0.92));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const rawDir = path.join(process.cwd(), 'android-agent-app', 'app', 'src', 'main', 'res', 'raw');
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }

  const outPath = path.join(rawDir, 'loud_buzzer.wav');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Generated unique emergency siren buzzer:', outPath, 'Size:', buffer.length, 'bytes');
}

createEmergencySirenWav();
