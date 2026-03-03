"use client";

import { useMemo, useState } from "react";

export default function QuizSection({ section }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const wrong = [];
    let correct = 0;

    section.questions.forEach((item, idx) => {
      const picked = answers[idx];
      if (picked === item.answer) {
        correct += 1;
      } else {
        wrong.push({
          no: idx + 1,
          selected: picked ? picked.toUpperCase() : "-",
          expected: item.answer.toUpperCase(),
        });
      }
    });

    const total = section.questions.length;
    const score = Math.round((correct / total) * 100);
    return { correct, total, score, wrong };
  }, [answers, section.questions]);

  const onChoose = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const onReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section className="card section-card" id={section.id}>
      <div className="section-head">
        <h2>{section.title}</h2>
        <p className="section-subtitle">{section.subtitle}</p>
      </div>

      <div className="quiz-form">
        {section.questions.map((item, idx) => (
          <fieldset className="question-block" key={`${section.id}-${idx}`}>
            <legend>{`${idx + 1}. ${item.text}`}</legend>
            {Object.entries(item.options).map(([key, label]) => (
              <label className="option" key={key}>
                <input
                  type="radio"
                  name={`${section.id}-${idx}`}
                  value={key}
                  checked={answers[idx] === key}
                  onChange={() => onChoose(idx, key)}
                />
                <span>{`${key.toUpperCase()}. ${label}`}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      <div className="section-actions">
        <button type="button" className="submit-btn" onClick={() => setSubmitted(true)}>
          Lihat Nilai Materi Ini
        </button>
        <button type="button" className="reset-btn" onClick={onReset}>
          Ulangi Materi Ini
        </button>
      </div>

      {submitted && (
        <div className="result">
          <h3>{`Hasil Materi: ${section.title}`}</h3>
          <p>
            <strong>Benar:</strong> {result.correct}/{result.total}
          </p>
          <p>
            <strong>Nilai:</strong> {result.score}
          </p>
          {result.wrong.length ? (
            <details>
              <summary>{`Lihat jawaban yang belum tepat (${result.wrong.length})`}</summary>
              <ul>
                {result.wrong.map((w) => (
                  <li key={w.no}>
                    No {w.no}: jawaban kamu <strong>{w.selected}</strong>, kunci <strong>{w.expected}</strong>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <p className="perfect">Sempurna! Semua jawaban benar 🎉</p>
          )}
        </div>
      )}
    </section>
  );
}
