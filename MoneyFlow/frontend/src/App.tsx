import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Transactions } from "./pages/Transactions";
import { Statistics } from "./pages/Statistics";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 text-xl font-bold text-blue-600"
                >
                  MoneyFlow
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/transactions"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Транзакции
                  </Link>
                  <Link
                    to="/statistics"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Статистика
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/transactions" replace />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;


