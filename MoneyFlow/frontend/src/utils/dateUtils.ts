import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd.MM.yyyy", { locale: ru });
};

export const formatDateInput = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy-MM-dd");
};

export const getWeekRange = (date: Date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
};

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
};



