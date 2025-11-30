import { useState } from "react";
import { useStatistics } from "../hooks/useStatistics";
import { PeriodSelector, PeriodType } from "../components/PeriodSelector";
import { SummaryCard } from "../components/SummaryCard";
import { StatisticsChart } from "../components/StatisticsChart";
import { formatDateInput } from "../utils/dateUtils";

export const Statistics = () => {
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [startDate, setStartDate] = useState<string>(
    formatDateInput(new Date())
  );
  const [endDate, setEndDate] = useState<string>(formatDateInput(new Date()));

  const handlePeriodChange = (
    type: PeriodType,
    start?: string,
    end?: string
  ) => {
    setPeriodType(type);
    if (start) setStartDate(start);
    if (end) setEndDate(end);
  };

  const getStatisticsType = () => {
    switch (periodType) {
      case "day":
        return "daily";
      case "week":
        return "weekly";
      case "month":
        return "monthly";
      case "custom":
        return "period";
      default:
        return "monthly";
    }
  };

  const { statistics, loading, error } = useStatistics(
    getStatisticsType() as "period" | "daily" | "weekly" | "monthly",
    periodType === "custom" ? undefined : startDate,
    periodType === "custom" ? startDate : undefined,
    periodType === "custom" ? endDate : undefined
  );

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Загрузка статистики...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка: {error}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Статистика</h1>

      <PeriodSelector periodType={periodType} onPeriodChange={handlePeriodChange} />

      <SummaryCard
        title="Сводка за период"
        income={statistics.total_income}
        expense={statistics.total_expense}
        balance={statistics.balance}
      />

      {statistics.daily_statistics.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              График доходов и расходов (линейный)
            </h2>
            <StatisticsChart data={statistics.daily_statistics} chartType="line" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              График доходов и расходов (столбчатый)
            </h2>
            <StatisticsChart data={statistics.daily_statistics} chartType="bar" />
          </div>
        </>
      )}
    </div>
  );
};

