"use client";

import { useEffect, useMemo, useState } from "react";

const TOTAL_SECONDS = 170;
const ROW_DURATIONS = [14, 12, 16, 13, 15, 11, 17, 12, 16, 14, 13, 17];
const PAIRS_PER_ROW = 10;
const KEYPAD_DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function twoDigit(value) {
  return String(value).padStart(2, "0");
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${twoDigit(remainder)}`;
}

function seededNumber(seed, rowIndex, numberIndex) {
  const raw = Math.sin(seed * 97 + rowIndex * 31 + numberIndex * 17) * 10000;
  return (Math.abs(Math.floor(raw)) % 9) + 1;
}

function buildRows(seed) {
  return ROW_DURATIONS.map((duration, rowIndex) => {
    const numbers = Array.from({ length: PAIRS_PER_ROW + 1 }, (_, numberIndex) => seededNumber(seed, rowIndex, numberIndex));

    return {
      id: `baris-${rowIndex + 1}`,
      duration,
      pairs: Array.from({ length: PAIRS_PER_ROW }, (_, pairIndex) => {
        const bottom = numbers[pairIndex];
        const top = numbers[pairIndex + 1];

        return {
          id: `${rowIndex}-${pairIndex}`,
          top,
          bottom,
          answer: String((top + bottom) % 10),
        };
      }),
    };
  });
}

function getActiveRowIndex(elapsedSeconds) {
  let passed = 0;
  for (let index = 0; index < ROW_DURATIONS.length; index += 1) {
    passed += ROW_DURATIONS[index];
    if (elapsedSeconds < passed) {
      return index;
    }
  }
  return ROW_DURATIONS.length - 1;
}

function getRowRemaining(elapsedSeconds, activeRowIndex) {
  const previousRowsSeconds = ROW_DURATIONS.slice(0, activeRowIndex).reduce((total, duration) => total + duration, 0);
  return Math.max(0, previousRowsSeconds + ROW_DURATIONS[activeRowIndex] - elapsedSeconds);
}

export default function KraeplinSection() {
  const [seed, setSeed] = useState(101);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [mobilePairIndex, setMobilePairIndex] = useState(0);

  const rows = useMemo(() => buildRows(seed), [seed]);
  const activeRowIndex = getActiveRowIndex(elapsed);
  const activeRow = rows[activeRowIndex];
  const mobilePair = activeRow.pairs[mobilePairIndex];
  const hasMobilePair = mobilePairIndex < PAIRS_PER_ROW && Boolean(mobilePair);
  const remainingSeconds = Math.max(0, TOTAL_SECONDS - elapsed);
  const rowRemainingSeconds = getRowRemaining(elapsed, activeRowIndex);

  const result = useMemo(() => {
    let correct = 0;
    let filled = 0;
    const total = rows.length * PAIRS_PER_ROW;

    rows.forEach((row) => {
      row.pairs.forEach((pair) => {
        const value = answers[pair.id];
        if (value !== undefined && value !== "") {
          filled += 1;
        }
        if (value === pair.answer) {
          correct += 1;
        }
      });
    });

    const accuracy = filled > 0 ? Math.round((correct / filled) * 100) : 0;
    return { correct, filled, total, accuracy };
  }, [answers, rows]);

  useEffect(() => {
    setMobilePairIndex(0);
  }, [activeRowIndex]);

  useEffect(() => {
    if (!isRunning || !startedAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const seconds = Math.min(TOTAL_SECONDS, Math.floor((Date.now() - startedAt) / 1000));
      setElapsed(seconds);

      if (seconds >= TOTAL_SECONDS) {
        setIsRunning(false);
        setIsFinished(true);
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [isRunning, startedAt]);

  const onStart = () => {
    setAnswers({});
    setElapsed(0);
    setMobilePairIndex(0);
    setStartedAt(Date.now());
    setIsFinished(false);
    setIsRunning(true);
  };

  const onReset = () => {
    setAnswers({});
    setElapsed(0);
    setMobilePairIndex(0);
    setStartedAt(null);
    setIsFinished(false);
    setIsRunning(false);
    setSeed((currentSeed) => currentSeed + 19);
  };

  const onFinish = () => {
    setIsRunning(false);
    setIsFinished(true);
  };

  const saveAnswer = (pairId, value) => {
    const normalized = value.replace(/\D/g, "").slice(-1);
    setAnswers((currentAnswers) => ({ ...currentAnswers, [pairId]: normalized }));
  };

  const onAnswer = (pairId, value) => {
    saveAnswer(pairId, value);
  };

  const onKeypadAnswer = (value) => {
    if (!isRunning || !hasMobilePair) {
      return;
    }

    saveAnswer(mobilePair.id, value);
    setMobilePairIndex((currentIndex) => Math.min(currentIndex + 1, PAIRS_PER_ROW));
  };

  return (
    <section className="card kraeplin-card" id="kraeplin">
      <div className="section-head kraeplin-head">
        <div>
          <p className="eyebrow">Simulasi Tes Koran</p>
          <h2>E. Kraeplin / Pauli (2:50 Menit)</h2>
          <p className="section-subtitle">
            Tekan <strong>Mulai</strong>, lalu jumlahkan angka atas dan bawah. Isi hanya angka satuan
            hasil penjumlahan pada kotak di bawahnya.
          </p>
        </div>
        <div className="kraeplin-timer" aria-live="polite">
          <span>Sisa waktu</span>
          <strong>{formatTime(remainingSeconds)}</strong>
          <small>{`Baris ${activeRowIndex + 1}: ${rowRemainingSeconds} detik`}</small>
        </div>
      </div>

      <div className="kraeplin-actions">
        <button type="button" className="submit-btn" onClick={onStart} disabled={isRunning}>
          {isFinished ? "Mulai Lagi" : "Mulai"}
        </button>
        <button type="button" className="reset-btn" onClick={onReset}>
          Reset & Ganti Angka
        </button>
        <button type="button" className="finish-btn" onClick={onFinish} disabled={!isRunning}>
          Selesai
        </button>
      </div>

      <div className="kraeplin-layout">
        <div className="kraeplin-instructions">
          <h3>Aturan singkat</h3>
          <ul>
            <li>Timer baru berjalan setelah tombol Mulai ditekan.</li>
            <li>Setiap baris punya durasi berbeda dan otomatis pindah baris.</li>
            <li>HP menampilkan satu soal dengan tombol angka seperti kalkulator.</li>
            <li>Angka atas akan menjadi angka bawah untuk soal berikutnya di baris yang sama.</li>
          </ul>
        </div>

        <div className="kraeplin-mobile-panel" aria-label="Soal Kraeplin mode HP">
          <div className="mobile-question-meta">
            <span>{`Baris ${activeRowIndex + 1}`}</span>
            <strong>{hasMobilePair ? `Soal ${mobilePairIndex + 1}/${PAIRS_PER_ROW}` : "Baris selesai"}</strong>
          </div>
          <div className="mobile-number-stack">
            <span className="mobile-number mobile-top-number">{hasMobilePair ? mobilePair.top : "✓"}</span>
            <span className="mobile-number mobile-bottom-number">{hasMobilePair ? mobilePair.bottom : "✓"}</span>
          </div>
          <div className="mobile-answer-preview">
            {!hasMobilePair
              ? "Selesai, tunggu baris berikutnya"
              : answers[mobilePair.id]
                ? `Jawaban: ${answers[mobilePair.id]}`
                : isRunning
                  ? "Pilih angka jawaban"
                  : "Tekan Mulai dulu"}
          </div>
          <div className="mobile-keypad">
            {KEYPAD_DIGITS.map((digit) => (
              <button type="button" key={digit} onClick={() => onKeypadAnswer(digit)} disabled={!isRunning || !hasMobilePair}>
                {digit}
              </button>
            ))}
          </div>
        </div>

        <div className="kraeplin-paper" aria-label="Lembar soal Kraeplin">
          {rows.map((row, rowIndex) => {
            const rowStatus = rowIndex === activeRowIndex ? "active" : rowIndex < activeRowIndex ? "done" : "locked";
            const disabled = !isRunning || rowIndex !== activeRowIndex;

            return (
              <div className={`kraeplin-row ${rowStatus}`} key={row.id}>
                <div className="row-label">
                  <strong>{`Baris ${rowIndex + 1}`}</strong>
                  <span>{`${row.duration} detik`}</span>
                </div>
                <div className="kraeplin-pairs">
                  {row.pairs.map((pair, pairIndex) => (
                    <label className="kraeplin-pair" key={pair.id}>
                      <span className="pair-number top-number">{pair.top}</span>
                      <span className="pair-number bottom-number">{pair.bottom}</span>
                      <input
                        aria-label={`Jawaban baris ${rowIndex + 1} kolom ${pairIndex + 1}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={answers[pair.id] ?? ""}
                        onChange={(event) => onAnswer(pair.id, event.target.value)}
                        disabled={disabled}
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(isFinished || result.filled > 0) && (
        <div className="result kraeplin-result">
          <h3>Hasil Sementara Kraeplin</h3>
          <p>
            <strong>Terisi:</strong> {result.filled}/{result.total}
          </p>
          <p>
            <strong>Benar:</strong> {result.correct}/{result.filled || 0}
          </p>
          <p>
            <strong>Akurasi:</strong> {result.accuracy}%
          </p>
        </div>
      )}
    </section>
  );
}
