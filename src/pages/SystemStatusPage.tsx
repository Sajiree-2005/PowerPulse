import React from 'react';
import {
  Server,
  Database,
  CheckCircle2,
  Activity,
  Layers,
  Cpu,
  Zap,
  Building,
  ShieldCheck,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { SystemStatusData } from '../types/energy';

interface SystemStatusPageProps {
  status: SystemStatusData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SystemStatusPage: React.FC<SystemStatusPageProps> = ({
  status,
  onRefresh,
  isRefreshing = false,
}) => {
  const apiEndpoints = [
    { method: 'GET', path: '/api/v1/health', status: '200 OK', latency: '4ms', desc: 'Heartbeat & worker status' },
    { method: 'GET', path: '/api/v1/overview', status: '200 OK', latency: '12ms', desc: 'Current demand & primary KPIs' },
    { method: 'GET', path: '/api/v1/history', status: '200 OK', latency: '18ms', desc: 'Historical observed timeseries' },
    { method: 'POST', path: '/api/v1/forecast', status: '200 OK', latency: '24ms', desc: 'Generate multi-step LSTM/MLP' },
    { method: 'GET', path: '/api/v1/models/compare', status: '200 OK', latency: '15ms', desc: 'Loss curves & accuracy metrics' },
    { method: 'GET', path: '/api/v1/alerts', status: '200 OK', latency: '8ms', desc: 'Dynamic threshold risk evaluator' },
    { method: 'GET', path: '/api/v1/data-quality', status: '200 OK', latency: '6ms', desc: 'Coverage & sensor telemetry' },
  ];

  const featuresList = [
    { name: 'Lagged Demand (t-1, t-2, t-3, t-24)', type: 'Continuous (kW)', source: 'Smart Meter Ingestion' },
    { name: 'Dry-Bulb Ambient Temperature (°C)', type: 'Continuous (°C)', source: 'BMS Weather Station' },
    { name: 'Relative Humidity (%)', type: 'Continuous (%)', source: 'BMS Weather Station' },
    { name: 'Solar Direct Normal Irradiance (W/m²)', type: 'Continuous (W/m²)', source: 'Solar Radiometer' },
    { name: 'Diurnal Cyclical Embeddings (sin/cos hour)', type: 'Cyclic float [-1, 1]', source: 'Feature Pipeline' },
    { name: 'Day of Week & Holiday Binary Flag', type: 'Discrete Categorical', source: 'Calendar Service' },
    { name: 'Rolling 3-Hour Exponential Moving Mean', type: 'Derived Feature', source: 'Stream Preprocessor' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Infrastructure Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI Specification</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-600 font-semibold">All Systems Operational</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Data & System Status
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time pipeline monitoring, model inference health, and ASHRAE dataset telemetry.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-all self-start sm:self-auto disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Ping Services</span>
        </button>
      </div>

      {/* Primary Services Health Status Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* API Health */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                <h3 className="text-sm font-bold text-slate-900">API Gateway</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">FastAPI Python Engine</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 uppercase tracking-wide">
            Online
          </span>
        </div>

        {/* LSTM Health */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                <h3 className="text-sm font-bold text-slate-900">LSTM Pipeline</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Sequential Checkpoint Loaded</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 uppercase tracking-wide">
            Ready
          </span>
        </div>

        {/* MLP Health */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                <h3 className="text-sm font-bold text-slate-900">MLP Pipeline</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Feedforward Weights Active</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 uppercase tracking-wide">
            Ready
          </span>
        </div>
      </div>

      {/* Dataset & Facility Telemetry Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Dataset & Facility Telemetry
          </h2>
          <p className="text-xs text-slate-500">
            Standardized ASHRAE benchmark configuration for commercial building energy management.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Dataset Source
            </span>
            <div className="mt-1 font-semibold text-slate-900 text-sm">
              {status.dataset}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">Standard energy predictor</p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Building Target
            </span>
            <div className="mt-1 font-semibold text-slate-900 text-sm">
              {status.buildingId}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">{status.squareFootage.toLocaleString()} sq ft office</p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Data Coverage
            </span>
            <div className="mt-1 font-semibold text-slate-900 text-sm">
              {status.dataCoverage}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">8,760 continuous hourly steps</p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Missing Values
            </span>
            <div className="mt-1 font-mono font-bold text-emerald-600 text-sm">
              {status.missingValuesPct}% (Linear Imputed)
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">Exceeds 99.5% quality target</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Latest Observation:</span>
            <span className="font-mono font-semibold text-slate-800">{status.latestObservation}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Model Registry Version:</span>
            <span className="font-mono font-semibold text-blue-600">{status.modelVersion}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Sensor Uptime:</span>
            <span className="font-mono font-semibold text-emerald-600">{status.sensorUptimePct}%</span>
          </div>
        </div>
      </div>

      {/* Feature Store Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-bold text-slate-900">
            ML Feature Engineering Pipeline (14 Covariates)
          </h2>
          <p className="text-xs text-slate-500">
            Normalized input vectors fed into the LSTM lookback window (96 quarters) and MLP dense layers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Feature Name</th>
                <th className="py-2.5 px-4">Data Type & Unit</th>
                <th className="py-2.5 px-4">Telemetry Ingestion Source</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {featuresList.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                    {f.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{f.type}</td>
                  <td className="py-2.5 px-4 text-slate-500">{f.source}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REST API Endpoints Schema */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-sm font-bold text-slate-900">
            FastAPI Backend Service Contract
          </h2>
          <p className="text-xs text-slate-500">
            Ready-to-connect endpoints matching the frontend service abstraction layer (<code className="font-mono text-blue-600">src/services/api.ts</code>).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Endpoint Path</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Avg Response Latency</th>
                <th className="py-2.5 px-4">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {apiEndpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        ep.method === 'POST'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {ep.path}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-emerald-600 font-semibold">
                    {ep.status}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-500">
                    {ep.latency}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-500">
                    {ep.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
