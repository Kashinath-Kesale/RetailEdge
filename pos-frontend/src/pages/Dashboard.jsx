import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import moment from "moment";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    revenueData: {
      currentMonth: 0,
      previousMonth: 0,
      trend: []
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total sales and revenue
        const salesResponse = await axios.get("/sales");
        const sales = salesResponse.data;
        
        // Get total products
        const productsResponse = await axios.get("/products");
        const products = productsResponse.data.products || [];

        // Calculate total revenue and sales count
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalSales = sales.length;
        const totalProducts = products.length;

        // Calculate revenue growth with proper month handling
        const currentMonthStart = moment().startOf('month');
        const previousMonthStart = moment().subtract(1, 'month').startOf('month');
        const previousMonthEnd = moment().subtract(1, 'month').endOf('month');

        // Get current month's revenue
        const currentMonthSales = sales.filter(sale => 
          moment(sale.createdAt).isSameOrAfter(currentMonthStart)
        );
        const currentMonthRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        // Get previous month's revenue
        const previousMonthSales = sales.filter(sale => 
          moment(sale.createdAt).isBetween(previousMonthStart, previousMonthEnd, 'day', '[]')
        );
        const previousMonthRevenue = previousMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        // Calculate growth percentage with better handling of edge cases
        let revenueGrowth = 0;

        if (previousMonthRevenue === 0) {
          if (currentMonthRevenue > 0) {
            revenueGrowth = 100; // New revenue
          } else {
            revenueGrowth = 0;
          }
        } else {
          revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        }

        console.log('Revenue Growth Debug:', {
          currentMonth: currentMonthStart.format('MMM YYYY'),
          previousMonth: previousMonthStart.format('MMM YYYY'),
          currentMonthSales: currentMonthSales.length,
          previousMonthSales: previousMonthSales.length,
          currentMonthRevenue,
          previousMonthRevenue,
          revenueGrowth
        });

        // Calculate 6-month trend
        const trend = Array.from({ length: 6 }, (_, i) => {
          const monthStart = moment().subtract(i, 'month').startOf('month');
          const monthEnd = moment().subtract(i, 'month').endOf('month');
          const monthSales = sales.filter(sale => 
            moment(sale.createdAt).isBetween(monthStart, monthEnd, 'day', '[]')
          );
          return {
            month: monthStart.format('MMM YYYY'),
            revenue: monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
          };
        }).reverse();

        setDashboardData({
          totalRevenue,
          totalSales,
          totalProducts,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
          revenueData: {
            currentMonth: currentMonthRevenue,
            previousMonth: previousMonthRevenue,
            trend
          }
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: "Total Sales",
      value: dashboardData.totalSales,
      icon: <FiShoppingBag />,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      iconColor: "text-blue-500"
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardData.totalRevenue.toLocaleString()}`,
      icon: <FiDollarSign />,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      iconColor: "text-green-500"
    },
    {
      title: "Total Products",
      value: dashboardData.totalProducts,
      icon: <FiUsers />,
      color: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-700",
      iconColor: "text-yellow-500"
    },
    {
      title: "Revenue Growth",
      value: (
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${dashboardData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardData.revenueGrowth > 0 ? '+' : ''}{dashboardData.revenueGrowth}%
          </span>
          {dashboardData.revenueGrowth >= 0 ? (
            <FiTrendingUp className="text-green-500 text-xl" />
          ) : (
            <FiTrendingDown className="text-red-500 text-xl" />
          )}
        </div>
      ),
      subtitle: (
        <div className="text-sm text-gray-600 mt-1">
          vs {moment().subtract(1, 'month').format('MMM YYYY')}
        </div>
      ),
      icon: <FiTrendingUp />,
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700",
      iconColor: "text-purple-500"
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-600">Welcome to your retail management dashboard</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm p-6 border border-gray-100 transition-all duration-200 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textColor} mb-1`}>{card.title}</p>
                  <div className={card.textColor}>
                    {card.value}
                    {card.subtitle}
                  </div>
                </div>
                <div className={`text-3xl ${card.iconColor} p-3 rounded-full bg-white shadow-sm`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Trend Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {dashboardData.revenueData.trend.map((month, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{month.month}</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  ₹{month.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Growth Card */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Revenue Growth
            </h3>
            <span className={`text-sm px-2 py-1 rounded-full ${
              dashboardData.revenueGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {dashboardData.revenueGrowth > 0 ? '+' : ''} {dashboardData.revenueGrowth.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {dashboardData.revenueGrowth > 0 ? 'Revenue increased' : 'Revenue decreased'}
            </p>
            <span className="ml-2 text-sm text-gray-500">
              vs last month
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {dashboardData.revenueGrowth > 0 ? (
              <>
                Current: ₹{dashboardData.revenueData.currentMonth.toLocaleString()}
                <br />
                Previous: ₹{dashboardData.revenueData.previousMonth.toLocaleString()}
              </>
            ) : (
              'No sales data available'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
