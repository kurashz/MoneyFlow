import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DailyStatistics } from "../types/transaction";
import { formatDate, formatCurrency } from "../utils/dateUtils";

interface StatisticsChartProps {
  data: DailyStatistics[];
  chartType?: "line" | "bar";
}

export const StatisticsChart = ({
  data,
  chartType = "line",
}: StatisticsChartProps) => {
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    income: item.income,
    expense: item.expense,
    balance: item.balance,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name === "income"
                ? "Доходы"
                : entry.name === "expense"
                ? "Расходы"
                : "Баланс"}
              : {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="income" fill="#10b981" name="Доходы" />
          <Bar dataKey="expense" fill="#ef4444" name="Расходы" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={2}
          name="Доходы"
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2}
          name="Расходы"
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Баланс"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};



