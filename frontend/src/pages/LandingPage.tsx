import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Информатика — 5 сынып
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Қазақ тіліндегі 5-сынып информатика курсы. Сабақтар, тесттер және бағалар — бәрі бір жерде.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Кіру
            </Link>
            <Link
              to="/register"
              className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition"
            >
              Тіркелу
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">
            Курс мүмкіндіктері
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-secondary">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">5 бөлім, 15 тақырып</h3>
              <p className="text-muted-foreground">
                Ақпарат, компьютерлік графика, робототехника және қауіпсіздік тақырыптары
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-secondary">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">Тесттер мен бағалау</h3>
              <p className="text-muted-foreground">
                Әр тақырыпқа тест, автоматты бағалау, нәтижелерді бірден көру
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-secondary">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Прогресс бақылау</h3>
              <p className="text-muted-foreground">
                Өз ілгерілеуіңді бақыла, бағалар журналын қара
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
