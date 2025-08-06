/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  FaUsers,
  FaBook,
  FaChartLine,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { statisticService } from "~/services/statisticService";
import LewisSelect from "~/components/Partial/LewisSelect";
import { useTranslation } from "react-i18next";

export default function StatisticsPage() {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 14);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(formatDate(sevenDaysAgo));
  const [toDate, setToDate] = useState<string>(formatDate(today));
  const [courseFrom, setCourseFrom] = useState<string>(
    formatDate(sevenDaysAgo)
  );
  const [courseTo, setCourseTo] = useState<string>(formatDate(today));

  const [overview, setOverview] = useState<any>(null);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchGrowth = async () => {
      try {
        const data = await statisticService.getUserGrowth(year);
        const fullData = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const found = data.find((d: any) => Number(d.month) === month);
          return { month, count: found?.count ?? 0 };
        });
        setUserGrowth(fullData);
      } catch (error) {
        console.error(`${t("statisticPage.errorLoading")}`, error);
      }
    };

    fetchGrowth();
  }, [year]);

  useEffect(() => {
    const fetchTopCourses = async () => {
      const query: Record<string, string> = {};
      if (courseFrom) query.fromDate = courseFrom;
      if (courseTo) query.toDate = courseTo;

      try {
        const data = await statisticService.getTopCourses(query);
        setTopCourses(data);
      } catch (error) {
        console.error(`${t("statisticPage.errorLoading")}`, error);
      }
    };
    fetchTopCourses();
  }, [courseFrom, courseTo]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const query: Record<string, string> = {};
        if (fromDate) query.fromDate = courseFrom;
        if (toDate) query.toDate = courseTo;

        const data = await statisticService.getTopUsers(query);
        setTopUsers(data);
      } catch (error) {
        console.error(`${t("statisticPage.errorLoading")}`, error);
      }
    };

    fetchTopUsers();
  }, [courseFrom, courseTo]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const query: Record<string, string> = {};
        if (fromDate) query.fromDate = fromDate;
        if (toDate) query.toDate = toDate;

        const data = await statisticService.getOverview(query);
        setOverview(data);
      } catch (error) {
        console.error(`${t("statisticPage.errorLoading")}`, error);
      }
    };

    fetchOverview();
  }, [fromDate, toDate]);

  const inputClass =
    "border border-green-500 text-green-700 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500";

  const cards = [
    {
      title: t("statisticPage.totalUser"),
      value: overview?.totalUsers ?? "-",
      icon: <FaUsers className="text-white text-2xl" />,
      bg: "bg-green-600",
    },
    {
      title: t("statisticPage.totalCourse"),
      value: overview?.totalCourses ?? "-",
      icon: <FaBook className="text-white text-2xl" />,
      bg: "bg-blue-600",
    },
    {
      title: t("statisticPage.totalEnrollment"),
      value: overview?.totalVisits ?? "-",
      icon: <FaChartLine className="text-white text-2xl" />,
      bg: "bg-yellow-500",
    },
    {
      title: t("statisticPage.totalClassroom"),
      value: overview?.totalClassrooms ?? "-",
      icon: <FaChalkboardTeacher className="text-white text-2xl" />,
      bg: "bg-indigo-500",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-green-50 min-h-screen">
      {/* Bộ lọc ngày tổng quan */}
      <div className="flex flex-wrap gap-4 justify-end items-center">
        <div>
          <label className="block text-sm mb-1 text-gray-700">
            {t("from")}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t("to")}</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <Card key={idx} className={`${card.bg} text-white shadow`}>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm">{card.title}</p>
                <h2 className="text-2xl font-bold">{card.value}</h2>
              </div>
              <div className="ml-4">{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-end items-center">
        <div>
          <label className="block text-sm mb-1 text-gray-700">
            {t("from")}
          </label>
          <input
            type="date"
            value={courseFrom}
            onChange={(e) => setCourseFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">{t("to")}</label>
          <input
            type="date"
            value={courseTo}
            onChange={(e) => setCourseTo(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Courses Chart */}
        <Card className="p-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {t("statisticPage.top5Course")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={topCourses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="title" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="totalMembers" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Users Chart */}
        <Card className="p-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {t("statisticPage.top5User")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={topUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="totalCourses" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t("statisticPage.monthlyUserGrowth")}
          </h3>
          <LewisSelect
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="min-w-[112px]"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {t("year")} {y}
              </option>
            ))}
          </LewisSelect>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(month) => `Th ${month}`}
              domain={[1, 12]}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
