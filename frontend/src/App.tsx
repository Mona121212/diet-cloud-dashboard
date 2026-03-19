import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Replace with your actual API endpoint, will change later when deployed to Azure
const API_URL =
  "https://diet-chart-dashboard-318.azurewebsites.net/api/analyze-diets";

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#f97316",
];

const commonOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: "#374151",
        font: {
          size: 13,
        },
      },
    },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      padding: 10,
      cornerRadius: 8,
    },
  },
};

const axisOptions = {
  ...commonOptions,
  scales: {
    x: {
      ticks: {
        color: "#4b5563",
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: "#4b5563",
      },
      grid: {
        color: "rgba(148, 163, 184, 0.2)",
      },
    },
  },
};

type DietCount = {
  diet_type?: string;
  Diet_type?: string;
  count: number;
};

type Macro = {
  diet_type?: string;
  Diet_type?: string;
  protein: number;
  carbs: number;
  fat: number;
};

type Cuisine = {
  cuisine_type?: string;
  Cuisine_type?: string;
  count: number;
};

type ApiResponse = {
  success: boolean;
  recordCount: number;
  executionTimeMs: number;
  dietFilter?: string;
  charts: {
    dietCounts: DietCount[];
    macroAverages: Macro[];
    cuisineCounts: Cuisine[];
  };
};

function App() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [dietType, setDietType] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchData = async (selectedDiet = dietType): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const url =
        selectedDiet === "all"
          ? API_URL
          : `${API_URL}?dietType=${encodeURIComponent(selectedDiet)}`;

      console.log("Request URL:", url);

      const response = await fetch(url);
      const text = await response.text();

      console.log("Status:", response.status);
      console.log("Raw response:", text);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ApiResponse = JSON.parse(text);

      if (data.success === false) {
        throw new Error("Failed to fetch data");
      }

      setApiData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData("all");
  }, []);

  const availableDietTypes = useMemo(() => {
    if (!apiData?.charts?.dietCounts) return ["all"];
    const types = apiData.charts.dietCounts.map(
      (item) => item.diet_type || item.Diet_type || "unknown",
    );
    return ["all", ...types];
  }, [apiData]);

  const dietCountsChart = useMemo(() => {
    const items = apiData?.charts?.dietCounts || [];
    return {
      labels: items.map(
        (item) => item.diet_type || item.Diet_type || "unknown",
      ),
      datasets: [
        {
          label: "Recipe Count",
          data: items.map((item) => item.count),
          backgroundColor: items.map(
            (_, index) => COLORS[index % COLORS.length],
          ),
          borderRadius: 8,
          borderSkipped: false as const,
        },
      ],
    };
  }, [apiData]);

  const macroChart = useMemo(() => {
    const items = apiData?.charts?.macroAverages || [];
    return {
      labels: items.map(
        (item) => item.diet_type || item.Diet_type || "unknown",
      ),
      datasets: [
        {
          label: "Protein",
          data: items.map((item) => item.protein),
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.15)",
          tension: 0.35,
          fill: true,
        },
        {
          label: "Carbs",
          data: items.map((item) => item.carbs),
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.15)",
          tension: 0.35,
          fill: true,
        },
        {
          label: "Fat",
          data: items.map((item) => item.fat),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [apiData]);

  const cuisineChart = useMemo(() => {
    const items = apiData?.charts?.cuisineCounts || [];
    return {
      labels: items.map(
        (item) => item.cuisine_type || item.Cuisine_type || "unknown",
      ),
      datasets: [
        {
          label: "Cuisine Count",
          data: items.map((item) => item.count),
          backgroundColor: items.map(
            (_, index) => COLORS[index % COLORS.length],
          ),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [apiData]);

  return (
    <div className="app">
      <h1>Diet Analysis Cloud Dashboard</h1>

      <div className="controls">
        <select
          value={dietType}
          onChange={(e) => {
            const value = e.target.value;
            setDietType(value);
            void fetchData(value);
          }}
        >
          {availableDietTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button onClick={() => void fetchData()}>Refresh</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {apiData && (
        <>
          <div className="meta">
            <div>Total Records: {apiData.recordCount}</div>
            <div>Execution Time: {apiData.executionTimeMs} ms</div>
            <div>Filter: {apiData.dietFilter || dietType}</div>
          </div>

          <div className="chart">
            <h2>Recipes by Diet Type</h2>
            <Bar data={dietCountsChart} options={axisOptions} />
          </div>

          <div className="chart">
            <h2>Average Macronutrients</h2>
            <Line data={macroChart} options={axisOptions} />
          </div>

          <div className="chart">
            <h2>Top Cuisine Types</h2>
            <Pie data={cuisineChart} options={commonOptions} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
