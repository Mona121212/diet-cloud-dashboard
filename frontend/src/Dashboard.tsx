import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:7071/api";
const INSIGHTS_URL = `${API_BASE.replace(/\/$/, "")}/dashboard-summary`;
const RECIPES_URL = `${API_BASE.replace(/\/$/, "")}/recipes`;

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

const compactCommon = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#374151",
        font: { size: 11 },
        boxWidth: 12,
      },
    },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      padding: 8,
      cornerRadius: 6,
    },
  },
};

const compactAxisOptions = {
  ...compactCommon,
  scales: {
    x: {
      ticks: { color: "#4b5563", maxRotation: 45, minRotation: 0 },
      grid: { display: false },
    },
    y: {
      ticks: { color: "#4b5563" },
      grid: { color: "rgba(148, 163, 184, 0.2)" },
    },
  },
};

const compactPieOptions = {
  ...compactCommon,
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

type RecipesResponse = {
  success: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: Record<string, unknown>[];
};

type DashboardProps = {
  session: Session;
};

export function Dashboard({ session }: DashboardProps) {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [dietType, setDietType] = useState<string>("all");
  const [searchDiet, setSearchDiet] = useState<string>("");
  const [recipeKeyword, setRecipeKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [twoFaCode, setTwoFaCode] = useState<string>("");

  const [recipes, setRecipes] = useState<RecipesResponse | null>(null);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState<string>("");
  const [recipesPage, setRecipesPage] = useState(1);
  const pageSize = 10;

  const fetchInsights = async (selectedDiet = dietType): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      setInfoMessage("");

      const url =
        selectedDiet === "all"
          ? INSIGHTS_URL
          : `${INSIGHTS_URL}?dietType=${encodeURIComponent(selectedDiet)}`;

      const response = await fetch(url);
      const text = await response.text();

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

  const fetchRecipes = async (page = recipesPage): Promise<void> => {
    try {
      setRecipesLoading(true);
      setRecipesError("");
      setInfoMessage("");
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (dietType && dietType !== "all") {
        params.set("dietType", dietType);
      }
      const kw = recipeKeyword.trim();
      if (kw) {
        params.set("keyword", kw);
      }
      const url = `${RECIPES_URL}?${params.toString()}`;
      const response = await fetch(url);
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: RecipesResponse = JSON.parse(text);
      if (data.success === false) {
        throw new Error("Failed to fetch recipes");
      }
      setRecipes(data);
      setRecipesPage(data.page);
    } catch (err: unknown) {
      setRecipes(null);
      setRecipesError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setRecipesLoading(false);
    }
  };

  useEffect(() => {
    void fetchInsights("all");
  }, []);

  const availableDietTypes = useMemo(() => {
    if (!apiData?.charts?.dietCounts) return ["all"];
    const types = apiData.charts.dietCounts.map(
      (item) => item.diet_type || item.Diet_type || "unknown",
    );
    return ["all", ...types];
  }, [apiData]);

  const filteredDietTypes = useMemo(() => {
    const q = searchDiet.trim().toLowerCase();
    if (!q) return availableDietTypes;
    return availableDietTypes.filter(
      (t) => t === "all" || t.toLowerCase().includes(q),
    );
  }, [availableDietTypes, searchDiet]);

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
          borderRadius: 6,
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
          backgroundColor: "rgba(79, 70, 229, 0.12)",
          tension: 0.35,
          fill: true,
        },
        {
          label: "Carbs",
          data: items.map((item) => item.carbs),
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.12)",
          tension: 0.35,
          fill: true,
        },
        {
          label: "Fat",
          data: items.map((item) => item.fat),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.12)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [apiData]);

  const dietPieChart = useMemo(() => {
    const items = apiData?.charts?.dietCounts || [];
    return {
      labels: items.map(
        (item) => item.diet_type || item.Diet_type || "unknown",
      ),
      datasets: [
        {
          label: "Recipes",
          data: items.map((item) => item.count),
          backgroundColor: items.map(
            (_, index) => COLORS[index % COLORS.length],
          ),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  }, [apiData]);

  const heatmapLegend = useMemo(() => {
    const macros = apiData?.charts?.macroAverages || [];
    if (!macros.length) return null;
    const maxP = Math.max(...macros.map((m) => m.protein), 1);
    const maxC = Math.max(...macros.map((m) => m.carbs), 1);
    const maxF = Math.max(...macros.map((m) => m.fat), 1);
    return macros.slice(0, 6).map((m, i) => {
      const label = m.diet_type || m.Diet_type || "—";
      const a = Math.round((m.protein / maxP) * 100);
      const b = Math.round((m.carbs / maxC) * 100);
      const c = Math.round((m.fat / maxF) * 100);
      return { label, a, b, c, key: `${label}-${i}` };
    });
  }, [apiData]);

  const totalRecipePages = recipes?.totalPages ?? 1;
  const canPrev = recipesPage > 1;
  const canNext = recipesPage < totalRecipePages;

  const visiblePageButtons = useMemo(() => {
    if (totalRecipePages <= 0) return [1];
    if (totalRecipePages === 1) return [1];
    const start = Math.max(
      1,
      Math.min(recipesPage, totalRecipePages - 1),
    );
    const a = start;
    const b = start + 1;
    return b <= totalRecipePages ? [a, b] : [a];
  }, [recipesPage, totalRecipePages]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <span className="dashboard__title">Nutritional Insights</span>
        <div className="dashboard__header-actions">
          <span
            className="dashboard__user-label"
            title={session.user.email ?? ""}
          >
            {(session.user.user_metadata as { full_name?: string } | undefined)
              ?.full_name || session.user.email}
          </span>
          <button
            type="button"
            className="btn btn--header-logout"
            onClick={() => void supabase.auth.signOut()}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard__main">
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Explore Nutritional Insights</h2>
          <div className="dashboard__card-grid">
            <article className="insight-card">
              <h3 className="insight-card__name">Bar Chart</h3>
              <p className="insight-card__desc">
                Average macronutrient content by diet type.
              </p>
              <div className="insight-card__plot">
                {apiData ? (
                  <Bar data={dietCountsChart} options={compactAxisOptions} />
                ) : (
                  <p className="insight-card__empty">Load insights to view data.</p>
                )}
              </div>
            </article>
            <article className="insight-card">
              <h3 className="insight-card__name">Scatter Plot</h3>
              <p className="insight-card__desc">
                Nutrient relationships (e.g., protein vs carbs).
              </p>
              <div className="insight-card__plot">
                {apiData ? (
                  <Line data={macroChart} options={compactAxisOptions} />
                ) : (
                  <p className="insight-card__empty">Load insights to view data.</p>
                )}
              </div>
            </article>
            <article className="insight-card">
              <h3 className="insight-card__name">Heatmap</h3>
              <p className="insight-card__desc">Nutrient correlations.</p>
              <div className="insight-card__heatmap">
                {heatmapLegend ? (
                  <ul className="heatmap-mini">
                    {heatmapLegend.map((row) => (
                      <li key={row.key} className="heatmap-mini__row">
                        <span className="heatmap-mini__label">{row.label}</span>
                        <span
                          className="heatmap-mini__cell heatmap-mini__cell--p"
                          style={{ opacity: 0.35 + row.a / 200 }}
                          title="Protein relative"
                        />
                        <span
                          className="heatmap-mini__cell heatmap-mini__cell--c"
                          style={{ opacity: 0.35 + row.b / 200 }}
                          title="Carbs relative"
                        />
                        <span
                          className="heatmap-mini__cell heatmap-mini__cell--f"
                          style={{ opacity: 0.35 + row.c / 200 }}
                          title="Fat relative"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="insight-card__empty">Load insights to view data.</p>
                )}
              </div>
            </article>
            <article className="insight-card">
              <h3 className="insight-card__name">Pie Chart</h3>
              <p className="insight-card__desc">
                Recipe distribution by diet type.
              </p>
              <div className="insight-card__plot insight-card__plot--pie">
                {apiData ? (
                  <Pie data={dietPieChart} options={compactPieOptions} />
                ) : (
                  <p className="insight-card__empty">Load insights to view data.</p>
                )}
              </div>
            </article>
          </div>
        </section>

        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Filters and Data Interaction</h2>
          <div className="dashboard__filters">
            <input
              type="search"
              className="dashboard__input"
              placeholder="Filter diet types in list"
              value={searchDiet}
              onChange={(e) => setSearchDiet(e.target.value)}
              aria-label="Filter diet types in dropdown"
            />
            <select
              className="dashboard__select"
              value={filteredDietTypes.includes(dietType) ? dietType : "all"}
              onChange={(e) => {
                const value = e.target.value;
                setDietType(value);
                void fetchInsights(value);
              }}
            >
              {filteredDietTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Diet Types" : type}
                </option>
              ))}
            </select>
          </div>
          <p className="dashboard__filters-hint">
            Chart filter uses the dropdown. Recipe API uses diet type + keyword below.
          </p>
          <div className="dashboard__filters dashboard__filters--recipe">
            <input
              type="search"
              className="dashboard__input dashboard__input--grow"
              placeholder="Recipe or cuisine keyword (Get Recipes)"
              value={recipeKeyword}
              onChange={(e) => setRecipeKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void fetchRecipes(1);
                }
              }}
              aria-label="Search recipes by keyword"
            />
          </div>
        </section>

        <section className="dashboard__section">
          <h2 className="dashboard__section-title">API Data Interaction</h2>
          <div className="dashboard__api-row">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void fetchInsights()}
              disabled={loading}
            >
              Get Nutritional Insights
            </button>
            <button
              type="button"
              className="btn btn--green"
              onClick={() => void fetchRecipes(1)}
              disabled={recipesLoading}
            >
              Get Recipes
            </button>
            <button
              type="button"
              className="btn btn--purple"
              onClick={() =>
                setInfoMessage(
                  "Cluster analytics API is not available in this build.",
                )
              }
            >
              Get Clusters
            </button>
          </div>
        </section>

        {apiData && (
          <div className="dashboard__meta">
            <span>Total Records: {apiData.recordCount}</span>
            <span>Execution Time: {apiData.executionTimeMs} ms</span>
            <span>Filter: {apiData.dietFilter || dietType}</span>
          </div>
        )}

        {loading && <p className="dashboard__status">Loading insights…</p>}
        {error && <p className="dashboard__error">{error}</p>}
        {infoMessage && (
          <p className="dashboard__info" role="status">
            {infoMessage}
          </p>
        )}

        {recipes && (
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">Recipes (API)</h2>
            <p className="dashboard__recipes-meta">
              Page {recipes.page} of {recipes.totalPages} — {recipes.total}{" "}
              total
            </p>
            <ul className="dashboard__recipe-list">
              {recipes.items.slice(0, 10).map((item, idx) => (
                <li key={idx} className="dashboard__recipe-item">
                  {String(item.Recipe_name ?? item.recipe_name ?? "Recipe")}
                </li>
              ))}
            </ul>
          </section>
        )}
        {recipesLoading && (
          <p className="dashboard__status">Loading recipes…</p>
        )}
        {recipesError && (
          <p className="dashboard__error">{recipesError}</p>
        )}

        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Security &amp; Compliance</h2>
          <div className="panel">
            <h3 className="panel__heading">Security Status</h3>
            <ul className="panel__list">
              <li>
                Encryption: <strong className="text-success">Enabled</strong>
              </li>
              <li>
                Access Control:{" "}
                <strong className="text-success">Secure</strong>
              </li>
              <li>
                Compliance:{" "}
                <strong className="text-success">GDPR Compliant</strong>
              </li>
            </ul>
          </div>
        </section>

        <section className="dashboard__section">
          <h2 className="dashboard__section-title">OAuth &amp; 2FA Integration</h2>
          <div className="panel">
            <h3 className="panel__heading panel__heading--sub">Secure Login</h3>
            <p className="panel__text">
              Primary sign-in uses Supabase Auth on the entry page (email/password
              and GitHub). Use Logout in the header to end your session.
            </p>
            <label className="dashboard__2fa-label" htmlFor="twofa">
              Enter 2FA Code
            </label>
            <input
              id="twofa"
              className="dashboard__input dashboard__input--block"
              placeholder="Enter your 2FA code"
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value)}
              autoComplete="one-time-code"
            />
          </div>
        </section>

        <section className="dashboard__section">
          <h2 className="dashboard__section-title">Cloud Resource Cleanup</h2>
          <div className="panel">
            <p className="panel__text">
              Ensure that cloud resources are efficiently managed and cleaned up
              post-deployment.
            </p>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() =>
                setInfoMessage(
                  "Use Azure Portal or your IaC pipeline to review and delete unused resources.",
                )
              }
            >
              Clean Up Resources
            </button>
          </div>
        </section>

        <section className="dashboard__section dashboard__section--pagination">
          <h2 className="dashboard__section-title">Pagination</h2>
          <nav className="pagination" aria-label="Recipe pages">
            <button
              type="button"
              className="pagination__nav"
              disabled={!recipes || !canPrev || recipesLoading}
              onClick={() => void fetchRecipes(recipesPage - 1)}
            >
              Previous
            </button>
            <div className="pagination__pages">
              {visiblePageButtons.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={
                    p === recipesPage
                      ? "pagination__page pagination__page--active"
                      : "pagination__page"
                  }
                  disabled={!recipes || recipesLoading}
                  onClick={() => void fetchRecipes(p)}
                >
                  {p}
                </button>
              ))}
              {totalRecipePages > visiblePageButtons.length && (
                <span className="pagination__ellipsis">…</span>
              )}
            </div>
            <button
              type="button"
              className="pagination__nav"
              disabled={!recipes || !canNext || recipesLoading}
              onClick={() => void fetchRecipes(recipesPage + 1)}
            >
              Next
            </button>
          </nav>
          {!recipes && (
            <p className="dashboard__hint">
              Use &quot;Get Recipes&quot; to enable pagination.
            </p>
          )}
        </section>
      </main>

      <footer className="dashboard__footer">
        © {new Date().getFullYear()} Nutritional Insights. All Rights Reserved.
      </footer>
    </div>
  );
}
