import { useState, useEffect } from "react";
import { statisticsApi } from "../services/api";
import type { StatisticsResponse } from "../types/transaction";

export const useStatistics = (
  type: "period" | "daily" | "weekly" | "monthly" | "summary",
  date?: string,
  startDate?: string,
  endDate?: string
) => {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: StatisticsResponse;

        switch (type) {
          case "period":
            if (startDate && endDate) {
              data = await statisticsApi.getByPeriod(startDate, endDate);
            } else {
              return;
            }
            break;
          case "daily":
            if (date) {
              data = await statisticsApi.getDaily(date);
            } else {
              return;
            }
            break;
          case "weekly":
            if (date) {
              data = await statisticsApi.getWeekly(date);
            } else {
              return;
            }
            break;
          case "monthly":
            if (date) {
              data = await statisticsApi.getMonthly(date);
            } else {
              return;
            }
            break;
          case "summary":
            data = await statisticsApi.getSummary(startDate, endDate);
            break;
          default:
            return;
        }

        setStatistics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки статистики");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [type, date, startDate, endDate]);

  return { statistics, loading, error };
};



