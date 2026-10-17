
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { OverviewPage } from './pages/OverviewPage';
import { ForecastExplorerPage } from './pages/ForecastExplorerPage';
import { ModelComparisonPage } from './pages/ModelComparisonPage';
import { AlertsPage } from './pages/AlertsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { energyApi } from './services/api';
import {
  DataPoint,
  KpiOverview,
  ModelMetrics,
  PeakAlertItem,
  SystemStatusData,
  TrainingLossPoint,
  ActualVsPredictedPoint,
} from './types/energy';
import {
  initialKpis,
  mockTimeSeriesData,
  mockModelMetrics,
  mockTrainingLoss,
  mockActualVsPredicted,
  mockSystemStatus,
  computeAlertsForThreshold,
} from './mock/energyData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core state
  const [thresholdKw, setThresholdKw] = useState<number>(550);
  const [timeSeriesData, setTimeSeriesData] =
    useState<DataPoint[]>(mockTimeSeriesData);
  const [modelMetrics, setModelMetrics] =
    useState<ModelMetrics[]>(mockModelMetrics);
  const [trainingLoss, setTrainingLoss] =
    useState<TrainingLossPoint[]>(mockTrainingLoss);
  const [actualVsPred, setActualVsPred] =
    useState<ActualVsPredictedPoint[]>(mockActualVsPredicted);
  const [systemStatus, setSystemStatus] =
    useState<SystemStatusData>(mockSystemStatus);
  const [overviewKpis, setOverviewKpis] =
    useState<KpiOverview>(initialKpis);
  const [activeAlerts, setActiveAlerts] =
    useState<PeakAlertItem[]>(computeAlertsForThreshold(550));

  // Load dashboard data from the API.
  const loadDashboardData = useCallback(async () => {
    const [history, forecast, models, comparison, status] =
      await Promise.all([
        energyApi.getHistory(),
        energyApi.getForecast({
          model: 'both',
          horizon: 24,
          thresholdKw,
        }),
        energyApi.getModels(),
        energyApi.getModelComparison(),
        energyApi.getSystemStatus(),
      ]);

    setTimeSeriesData([
      ...history.slice(-24),
      ...forecast.filter((point) => point.isForecast),
    ]);
    setModelMetrics(models);
    setTrainingLoss(comparison.lossCurves);
    setActualVsPred(comparison.actualVsPredicted);
    setSystemStatus(status);
  }, [thresholdKw]);

  // Load the dashboard when it mounts and when the threshold changes.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        await loadDashboardData();
      } catch (err) {
        if (!cancelled) {
          console.error(
            'PowerPulse API load failed; retaining existing dashboard values:',
            err,
          );
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadDashboardData]);

  // Refresh overview KPIs and alerts when the threshold changes.
  useEffect(() => {
    let cancelled = false;

    const loadOverviewAndAlerts = async () => {
      try {
        const [overview, alerts] = await Promise.all([
          energyApi.getOverview(thresholdKw),
          energyApi.getAlerts(thresholdKw),
        ]);

        if (cancelled) return;

        setOverviewKpis(overview);
        setActiveAlerts(alerts);
      } catch (err) {
        if (!cancelled) {
          console.error('PowerPulse KPI/alert refresh failed:', err);
        }
      }
    };

    void loadOverviewAndAlerts();

    return () => {
      cancelled = true;
    };
  }, [thresholdKw]);

  // KPIs reflect the selected threshold and current alerts.
  const kpis: KpiOverview = useMemo(
    () => ({
      ...overviewKpis,
      thresholdKw,
      peakRiskPeriodsCount: activeAlerts.length,
    }),
    [overviewKpis, thresholdKw, activeAlerts.length],
  );

  // Most critical alert for the overview banner.
  const topAlert = useMemo(
    () => (activeAlerts.length > 0 ? activeAlerts[0] : null),
    [activeAlerts],
  );

  // Refresh using actual API data instead of simulated forecast jitter.
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await energyApi.getHealth();
      await loadDashboardData();

      const [overview, alerts] = await Promise.all([
        energyApi.getOverview(thresholdKw),
        energyApi.getAlerts(thresholdKw),
      ]);

      setOverviewKpis(overview);
      setActiveAlerts(alerts);
    } catch (err) {
      console.error('PowerPulse refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        alertCount={activeAlerts.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <TopHeader
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefreshData={handleRefresh}
          isRefreshing={isRefreshing}
          thresholdKw={thresholdKw}
          onNavigateToAlerts={() => setActiveTab('alerts')}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <OverviewPage
              kpis={kpis}
              timeSeriesData={timeSeriesData}
              topAlert={topAlert}
              onNavigateToAlerts={() => setActiveTab('alerts')}
              onNavigateToExplorer={() => setActiveTab('explorer')}
              thresholdKw={thresholdKw}
            />
          )}

          {activeTab === 'explorer' && (
            <ForecastExplorerPage
              timeSeriesData={timeSeriesData}
              thresholdKw={thresholdKw}
              onNavigateToAlerts={() => setActiveTab('alerts')}
            />
          )}

          {activeTab === 'comparison' && (
            <ModelComparisonPage
              metrics={modelMetrics}
              lossCurves={trainingLoss}
              actualVsPredicted={actualVsPred}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage
              alerts={activeAlerts}
              thresholdKw={thresholdKw}
              onThresholdChange={setThresholdKw}
            />
          )}

          {activeTab === 'status' && (
            <SystemStatusPage
              status={systemStatus}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}
        </main>

        <footer className="border-t border-slate-200/80 bg-white/70 px-6 py-4 text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">PowerPulse</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Building Energy Demand Intelligence</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>LSTM &amp; MLP Architecture</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>ASHRAE Great Energy Predictor III</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Building #102</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
