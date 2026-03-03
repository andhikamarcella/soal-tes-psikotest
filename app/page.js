import QuizSection from "../components/QuizSection";
import { sections } from "../data/questions";

export default function HomePage() {
  return (
    <>
      <header className="hero">
        <h1>Latihan Psikotes Interaktif</h1>
        <p>
          Model seperti Google Form, dengan penilaian otomatis <strong>per materi</strong>
          {" "}(Sinonim, Antonim, Analogi, Deret Angka/Huruf).
        </p>
      </header>

      <main id="app" className="container">
        {sections.map((section) => (
          <QuizSection key={section.id} section={section} />
        ))}
      </main>
    </>
  );
}
