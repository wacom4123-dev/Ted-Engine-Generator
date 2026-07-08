import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Database, 
  Download, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Zap, 
  Shield, 
  Layout, 
  Server, 
  Globe, 
  Code,
  Save,
  FileJson,
  Upload,
  Layers,
  Activity,
  Box,
  Lock,
  Cpu,
  UserPlus,
  ShieldCheck,
  Key,
  Radio,
  Maximize,
  Eye,
  CheckSquare,
  Square,
  X,
  Loader2,
  Terminal,
  FileCode,
  FolderTree,
  Search,
  Minus,
  Maximize2,
  RefreshCw,
  Bell,
  Home,
  BarChart2,
  Users,
  Package,
  Folder,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateProject, ProjectConfig, Resource, Field } from './ted-engine';
import { Toaster, toast } from 'sonner';

const FEATURE_CATEGORIES = [
  {
    title: 'Template',
    icon: <Layout className="w-4 h-4" />,
    features: ['landing page', 'dashboard', 'halaman']
  },
  {
    title: 'backend',
    icon: <Server className="w-4 h-4" />,
    features: ['Swagger UI', 'REST API', 'GraphQL', 'File Upload', 'Adv. Filter/Sort']
  },
  {
    title: 'Registration',
    icon: <UserPlus className="w-4 h-4" />,
    features: ['Open Registration', 'User Signup', 'Email Verification', 'Social Login', 'Password Reset', 'Profile Setup']
  },
  {
    title: 'frontend',
    icon: <Globe className="w-4 h-4" />,
    features: ['Auth Pages', 'Dashboard Nav', 'Dark/Light Mode', 'Lucide Icons', 'Responsive Design', 'SEO Optimized']
  },
  {
    title: 'frontend advanced',
    icon: <Layout className="w-4 h-4" />,
    features: ['Advanced Table', 'Charts (Recharts)', 'Skeleton Loading', 'Optimistic UI', 'Zustand State', 'TanStack Query', 'Framer Motion', 'Server Components', 'Hydration Fix']
  },
  {
    title: 'react libraries',
    icon: <Box className="w-4 h-4" />,
    features: ['Shadcn UI', 'Radix UI', 'React Hook Form', 'Zod Validation', 'React Hot Toast']
  },
  {
    title: 'devops & quality',
    icon: <ShieldCheck className="w-4 h-4" />,
    features: ['Jest Tests', 'GitHub Actions', 'Multi-env .env', 'Docker', 'ESLint Config', 'CI/CD Pipeline', 'E2E Testing', 'Husky Hooks']
  },
  {
    title: 'security',
    icon: <Lock className="w-4 h-4" />,
    features: ['Audit Log', 'API Key Auth', 'OWASP Headers', 'IP Filter', 'Helmet.js', 'CORS Config', 'XSS Protection']
  },
  {
    title: 'stability v6',
    icon: <Activity className="w-4 h-4" />,
    features: ['Winston Logging', 'XSS Sanitize', 'Env Validation', 'Graceful Shutdown', 'AppError Handler', 'Health Detail', 'Health Checks', 'Error Boundary', 'Retry Logic']
  },
  {
    title: 'auth extended',
    icon: <Key className="w-4 h-4" />,
    features: ['API Versioning', 'Multi-factor Auth', 'Session Mgmt', 'OAuth2 Providers', 'Magic Links', 'Device Tracking']
  },
  {
    title: 'performance',
    icon: <Zap className="w-4 h-4" />,
    features: ['BullMQ Queue', 'Cursor Pagination', 'Bull Dashboard', 'Redis Caching', 'Image Optimization', 'Code Splitting', 'Gzip Compression', 'Edge Runtime']
  },
  {
    title: 'realtime',
    icon: <Radio className="w-4 h-4" />,
    features: ['Rooms & NS', 'Presence / Online', 'WS Emit Hook', 'Socket.io', 'WebSockets', 'Realtime Notifications', 'Live Collaboration', 'Presence API']
  },
  {
    title: 'scale',
    icon: <Maximize className="w-4 h-4" />,
    features: ['Shared Types', 'Multi-tenant', 'Microservices', 'Kubernetes', 'Load Balancing', 'Read Replicas', 'Horizontal Scaling']
  },
  {
    title: 'observability',
    icon: <Eye className="w-4 h-4" />,
    features: ['Health Advanced', 'Winston Logging', 'Prometheus', 'Grafana', 'Sentry Error Tracking', 'OpenTelemetry']
  },
  {
    title: 'mobile platform',
    icon: <Smartphone className="w-4 h-4" />,
    features: ['React Native App']
  }
];

const DashboardPreview = ({ config }: { config: ProjectConfig }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [dashboardView, setDashboardView] = useState<'modules' | 'all'>('modules');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [mobileScreen, setMobileScreen] = useState<'login' | 'home' | 'resources' | 'settings'>('login');
  const [mobileSelectedResource, setMobileSelectedResource] = useState<string | null>(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileIsLoggedIn, setMobileIsLoggedIn] = useState(false);
  const [mobileEmail, setMobileEmail] = useState('admin@example.com');
  const [mobilePassword, setMobilePassword] = useState('password');
  const hasHalaman = config.features.includes('halaman');

  const modules = Array.from(new Set(config.resources.map(r => r.module).filter(Boolean))) as string[];

  const renderContent = () => {
    if (activeTab === 'Dashboard') {
      if (!selectedModule) {
        // Global Dashboard
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Global ERP Dashboard</h2>
                <p className="text-sm text-gray-500">Overview of all enterprise modules.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 mr-2">
                  <button 
                    onClick={() => setDashboardView('modules')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dashboardView === 'modules' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Modules
                  </button>
                  <button 
                    onClick={() => setDashboardView('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dashboardView === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    All Resources
                  </button>
                </div>
                <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">System Health</button>
                <button className="bg-[#e63946] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Global Report</button>
              </div>
            </div>

            {dashboardView === 'modules' ? (
              /* Module Overview Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod) => {
                  const moduleResources = config.resources.filter(r => r.module === mod);
                  return (
                    <div 
                      key={mod} 
                      onClick={() => setSelectedModule(mod)}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Layers className="w-6 h-6" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-all" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900">{mod}</h3>
                        <p className="text-xs text-gray-500">{moduleResources.length} Resources</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {moduleResources.slice(0, 3).map(res => (
                          <span key={res.name} className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md uppercase tracking-wider">
                            {res.name}
                          </span>
                        ))}
                        {moduleResources.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md">
                            +{moduleResources.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* All Resources Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.resources.map((res) => (
                  <div 
                    key={res.name} 
                    onClick={() => setActiveTab(res.name)}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 capitalize">{res.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{res.module || 'General'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: '$2.4M', trend: '+15%', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-emerald-500' },
                { label: 'Total Employees', value: '850', trend: '+5%', icon: <Users className="w-4 h-4" />, color: 'bg-indigo-500' },
                { label: 'Open Orders', value: '124', trend: '-2%', icon: <Package className="w-4 h-4" />, color: 'bg-orange-500' },
                { label: 'System Uptime', value: '99.9%', trend: 'Stable', icon: <Activity className="w-4 h-4" />, color: 'bg-purple-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Module-Specific Dashboard
      const moduleResources = config.resources.filter(r => r.module === selectedModule);
      return (
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
            <button onClick={() => setSelectedModule(null)} className="hover:text-indigo-600 transition-colors">Dashboard</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-bold">{selectedModule}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">{selectedModule} Dashboard</h2>
              <p className="text-sm text-gray-500">Manage resources and view analytics for {selectedModule}.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">Module Settings</button>
              <button className="bg-[#e63946] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Add Resource</button>
            </div>
          </div>

          {/* Module Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Records', value: '1,240', icon: <Database className="w-4 h-4" />, color: 'bg-blue-500' },
              { label: 'Active Items', value: '856', icon: <Activity className="w-4 h-4" />, color: 'bg-emerald-500' },
              { label: 'Pending Actions', value: '12', icon: <Zap className="w-4 h-4" />, color: 'bg-orange-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resources in this Module */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Module Resources</h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{moduleResources.length} Total</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moduleResources.map((res) => (
                <div 
                  key={res.name} 
                  onClick={() => setActiveTab(res.name)}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 capitalize">{res.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Manage {res.name.toLowerCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const resource = config.resources.find(r => r.name === activeTab);
    if (resource) {
      return (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">{resource.name} Management</h2>
              <p className="text-sm text-gray-500">Manage your {resource.name.toLowerCase()} data here.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-[#e63946] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add {resource.name}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{resource.name} List</h3>
              <div className="flex items-center gap-2">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Filter..." className="bg-transparent border-none focus:outline-none text-[10px] w-32" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    {resource.fields.map(f => (
                      <th key={f.name} className="px-6 py-4">{f.name}</th>
                    ))}
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      {resource.fields.map(f => (
                        <td key={f.name} className="px-6 py-4 text-sm font-medium text-gray-600">
                          {f.type === 'number' ? Math.floor(Math.random() * 1000) : 
                           f.type === 'date' ? '2023-10-12' : 
                           f.type === 'boolean' ? 'Yes' : 
                           `Sample ${f.name}`}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 p-1"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Showing 5 of 24 entries</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Prev</button>
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Mobile') {
      return (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">React Native Mobile App Simulator</h2>
              <p className="text-sm text-gray-500">Preview the generated React Native + Expo mobile client. Click the interactive simulator below!</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg border border-emerald-500/20">Expo Ready</span>
              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-lg border border-blue-500/20">TypeScript</span>
              <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 text-xs font-bold rounded-lg border border-indigo-500/20">Tailwind/NativeWind</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Simulator Column */}
            <div className="xl:col-span-5 flex justify-center">
              {/* Phone Container */}
              <div className="relative w-[340px] h-[680px] bg-gray-900 rounded-[50px] p-3.5 shadow-2xl border-[10px] border-gray-800 ring-4 ring-gray-700 ring-opacity-50">
                {/* Speaker & Camera Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-40 flex items-center justify-center gap-3">
                  <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
                  <div className="w-3.5 h-3.5 bg-gray-800 rounded-full border border-gray-900"></div>
                </div>

                {/* Simulated Screen */}
                <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col relative select-none">
                  {/* Status Bar */}
                  <div className="h-10 bg-indigo-600 text-white px-6 flex items-center justify-between text-[11px] font-bold z-30">
                    <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="flex items-center gap-1.5">
                      <span>LTE</span>
                      <div className="w-5 h-2.5 bg-white/30 rounded border border-white flex items-center p-[1px]">
                        <div className="h-full w-4/5 bg-white rounded-sm"></div>
                      </div>
                    </div>
                  </div>

                  {/* App Container */}
                  <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 overflow-hidden text-xs">
                    {!mobileIsLoggedIn ? (
                      /* LOGIN / SIGN IN SCREEN */
                      <div className="flex-1 flex flex-col p-6 justify-center bg-gradient-to-b from-indigo-600 to-indigo-800 text-white">
                        <div className="text-center space-y-3 mb-8">
                          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl backdrop-blur-sm border border-white/20">
                            <Smartphone className="w-8 h-8" />
                          </div>
                          <h1 className="text-xl font-black tracking-tight">{config.name} Mobile</h1>
                          <p className="text-[10px] text-indigo-200">Connect to NestJS Backend at port {config.apiPort}</p>
                        </div>

                        <div className="space-y-4 text-slate-900 bg-white p-5 rounded-2xl shadow-xl">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <input 
                              type="text" 
                              value={mobileEmail}
                              onChange={(e) => setMobileEmail(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                            <input 
                              type="password" 
                              value={mobilePassword}
                              onChange={(e) => setMobilePassword(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium" 
                            />
                          </div>

                          <button 
                            onClick={() => {
                              setMobileIsLoggedIn(true);
                              setMobileScreen('home');
                            }}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 text-center"
                          >
                            Sign In
                          </button>
                        </div>
                        
                        <div className="mt-6 text-center">
                          <span className="text-[10px] text-indigo-200">Don't have an account? <span className="font-bold underline cursor-pointer">Register</span></span>
                        </div>
                      </div>
                    ) : (
                      /* AUTHENTICATED STATE */
                      <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Mobile Header */}
                        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xs">AJ</span>
                            <div>
                              <div className="font-bold leading-none">Alex Johnson</div>
                              <span className="text-[8px] text-indigo-200">Administrator</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setMobileIsLoggedIn(false);
                              setMobileScreen('login');
                            }}
                            className="text-[10px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg font-bold"
                          >
                            Log Out
                          </button>
                        </div>

                        {/* Mobile Screen Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                          {mobileScreen === 'home' && (
                            /* HOME / DASHBOARD SCREEN */
                            <div className="space-y-4 animate-fade-in">
                              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1">
                                <h2 className="text-sm font-bold text-slate-800">Welcome to {config.name}!</h2>
                                <p className="text-[10px] text-slate-400">Your enterprise system dashboard is synchronized.</p>
                              </div>

                              {/* Stats Carousel */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-sm space-y-1">
                                  <span className="text-[8px] font-bold text-emerald-100 uppercase tracking-widest">Revenue</span>
                                  <div className="text-base font-black">$2.4M</div>
                                </div>
                                <div className="bg-indigo-500 text-white p-3 rounded-xl shadow-sm space-y-1">
                                  <span className="text-[8px] font-bold text-indigo-100 uppercase tracking-widest">Staff</span>
                                  <div className="text-base font-black">850</div>
                                </div>
                              </div>

                              {/* Resources List */}
                              <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Modules</h3>
                                <div className="space-y-2">
                                  {config.resources.map(res => (
                                    <div 
                                      key={res.name}
                                      onClick={() => {
                                        setMobileSelectedResource(res.name);
                                        setMobileScreen('resources');
                                      }}
                                      className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                          <Box className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <div className="font-bold text-slate-800 capitalize">{res.name}</div>
                                          <div className="text-[9px] text-slate-400 capitalize">{res.module || 'General'}</div>
                                        </div>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {mobileScreen === 'resources' && (
                            /* RESOURCES SCREEN */
                            <div className="space-y-4 animate-fade-in">
                              {mobileSelectedResource ? (
                                /* SINGLE RESOURCE VIEW */
                                <div className="space-y-3">
                                  <button 
                                    onClick={() => setMobileSelectedResource(null)}
                                    className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px]"
                                  >
                                    ← Back to Modules
                                  </button>
                                  <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-black text-slate-800 capitalize">{mobileSelectedResource} list</h2>
                                    <button className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[9px] font-bold">
                                      + Add
                                    </button>
                                  </div>

                                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-200">
                                    <Search className="w-3.5 h-3.5 text-slate-400" />
                                    <input 
                                      type="text" 
                                      placeholder="Search records..." 
                                      value={mobileSearchQuery}
                                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                                      className="bg-transparent border-none focus:outline-none text-[10px] w-full" 
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    {[1, 2, 3].map(i => {
                                      const resObj = config.resources.find(r => r.name === mobileSelectedResource);
                                      return (
                                        <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">Sample #{i}</span>
                                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">ID: {i}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1 text-[9px] pt-1 border-t border-slate-50">
                                            {resObj?.fields.slice(0, 4).map(f => (
                                              <div key={f.name} className="text-slate-500">
                                                <span className="font-bold text-slate-400 uppercase mr-1">{f.name}:</span>
                                                {f.type === 'number' ? i * 150 : 'Sample value'}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                /* CHOOSE RESOURCE VIEW */
                                <div className="space-y-3">
                                  <h2 className="text-sm font-black text-slate-800">Database Models</h2>
                                  <p className="text-[10px] text-slate-400">Choose a schema to manage its tables mobile-first:</p>
                                  <div className="space-y-2">
                                    {config.resources.map(res => (
                                      <div 
                                        key={res.name}
                                        onClick={() => setMobileSelectedResource(res.name)}
                                        className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <Database className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div className="font-bold text-slate-800 capitalize">{res.name} Model</div>
                                            <div className="text-[9px] text-slate-400 capitalize">{res.fields.length} schema fields</div>
                                          </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {mobileScreen === 'settings' && (
                            /* SETTINGS SCREEN */
                            <div className="space-y-4 animate-fade-in">
                              <h2 className="text-sm font-black text-slate-800">Mobile System Settings</h2>
                              
                              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-700">NestJS API Endpoint</span>
                                  <span className="font-mono text-[9px] text-indigo-600 font-bold">http://localhost:{config.apiPort}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-700">App Name</span>
                                  <span className="font-mono text-[9px] text-slate-500">{config.name} Mobile</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-700">Expo Platform SDK</span>
                                  <span className="font-mono text-[9px] text-slate-500">v51.0.0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-700">NativeWind Theme</span>
                                  <span className="font-mono text-[9px] text-slate-500">Tailwind CSS v4</span>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device Features</h3>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600">Push Notifications</span>
                                  <div className="w-8 h-4 bg-indigo-600 rounded-full p-[2px] flex items-center justify-end">
                                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow"></div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600">Offline Cache</span>
                                  <div className="w-8 h-4 bg-slate-300 rounded-full p-[2px] flex items-center justify-start">
                                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mobile Tab Navigation (Footer) */}
                        <div className="h-14 bg-white border-t border-slate-150 flex items-center justify-around shrink-0 text-[10px] font-bold text-slate-400 z-10">
                          <button 
                            onClick={() => {
                              setMobileScreen('home');
                              setMobileSelectedResource(null);
                            }}
                            className={`flex flex-col items-center gap-1 transition-colors ${mobileScreen === 'home' ? 'text-indigo-600' : 'hover:text-slate-600'}`}
                          >
                            <Home className="w-4 h-4" />
                            <span>Home</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              setMobileScreen('resources');
                              setMobileSelectedResource(null);
                            }}
                            className={`flex flex-col items-center gap-1 transition-colors ${mobileScreen === 'resources' ? 'text-indigo-600' : 'hover:text-slate-600'}`}
                          >
                            <Database className="w-4 h-4" />
                            <span>Database</span>
                          </button>

                          <button 
                            onClick={() => {
                              setMobileScreen('settings');
                              setMobileSelectedResource(null);
                            }}
                            className={`flex flex-col items-center gap-1 transition-colors ${mobileScreen === 'settings' ? 'text-indigo-600' : 'hover:text-slate-600'}`}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation / Info Column */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900">React Native Generated Boilerplate</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  TED Engine generates a fully featured, offline-capable React Native client using the modern 
                  <span className="font-bold text-slate-800"> Expo SDK</span> structure. It integrates directly with the 
                  generated NestJS backend, mapping your defined Prisma database models to local screens.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-indigo-600">Type-Safe Client Calls</span>
                    <p className="text-xs text-gray-500">Includes auto-generated axios wrapper connected to backend API endpoints.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-indigo-600">Tab & Stack Navigation</span>
                    <p className="text-xs text-gray-500">Configured React Navigation layout with fully modular screen setups.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-indigo-600">Local Validation</span>
                    <p className="text-xs text-gray-500">Zod schemas compiled into React Native inputs for dynamic field verification.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-indigo-600">NativeWind / Tailwind Styling</span>
                    <p className="text-xs text-gray-500">Native styling mapped directly using Tailwind class naming styles.</p>
                  </div>
                </div>
              </div>

              {/* Generated Directory Tree */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Generated Project Structure</h3>
                  <span className="text-xs font-mono text-gray-400">/mobile/*</span>
                </div>
                
                <div className="font-mono text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-x-auto space-y-1.5">
                  <div>📁 mobile</div>
                  <div className="pl-4">├── 📁 src</div>
                  <div className="pl-8">├── 📁 api <span className="text-gray-400">// API connection and axios setup</span></div>
                  <div className="pl-12">└── client.ts</div>
                  <div className="pl-8">├── 📁 navigation <span className="text-gray-400">// Drawer, Stack & Tab setups</span></div>
                  <div className="pl-12">└── AppNavigator.tsx</div>
                  <div className="pl-8">├── 📁 screens <span className="text-gray-400">// Screen components for models</span></div>
                  <div className="pl-12">├── HomeScreen.tsx</div>
                  <div className="pl-12">├── LoginScreen.tsx</div>
                  {config.resources.map(res => (
                    <div key={res.name} className="pl-12">├── {res.name}ListScreen.tsx</div>
                  ))}
                  <div className="pl-12">└── SettingsScreen.tsx</div>
                  <div className="pl-4">├── app.json <span className="text-gray-400">// Expo setup</span></div>
                  <div className="pl-4">├── App.tsx <span className="text-gray-400">// Main Entry</span></div>
                  <div className="pl-4">├── package.json <span className="text-gray-400">// NPM dependencies</span></div>
                  <div className="pl-4">├── tailwind.config.js</div>
                  <div className="pl-4">└── tsconfig.json</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-full bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-[#e63946] flex flex-col items-center py-8 gap-8 transition-all">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Zap className="w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-2 w-full px-4">
          <div 
            onClick={() => setActiveTab('Dashboard')}
            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
              activeTab === 'Dashboard' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="shrink-0"><Home className="w-5 h-5" /></div>
            <span className="hidden lg:block text-sm font-semibold">Dashboard</span>
          </div>

          {hasHalaman && config.resources.length > 0 && (
            <div className="mt-4">
              <div className="px-3 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hidden lg:block">Resources</div>
              <div className="space-y-1">
                {config.resources.map(res => (
                  <div 
                    key={res.id}
                    onClick={() => setActiveTab(res.name)}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
                      activeTab === res.name ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="shrink-0"><Box className="w-5 h-5" /></div>
                    <span className="hidden lg:block text-sm font-semibold">{res.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {config.features.includes('React Native App') && (
            <div className="mt-4">
              <div className="px-3 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hidden lg:block">Mobile Platform</div>
              <div 
                onClick={() => setActiveTab('Mobile')}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
                  activeTab === 'Mobile' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="shrink-0"><Smartphone className="w-5 h-5" /></div>
                <span className="hidden lg:block text-sm font-semibold">Mobile App</span>
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div 
              onClick={() => setActiveTab('Settings')}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
                activeTab === 'Settings' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="shrink-0"><Settings className="w-5 h-5" /></div>
              <span className="hidden lg:block text-sm font-semibold">Settings</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-xl w-full max-w-md border border-gray-100">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search anything..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold">Alex Johnson</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Administrator</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-inner">AJ</div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f8f9fa]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [config, setConfig] = useState<ProjectConfig>({
    name: 'MyAwesomeProject',
    description: 'A full-stack application generated with TED.',
    dbName: 'my_awesome_db',
    dbUser: 'postgres',
    dbPass: 'password',
    apiPort: 3000,
    features: [],
    resources: [
      {
        id: '1',
        name: 'User',
        fields: [
          { name: 'email', type: 'string', required: true },
          { name: 'password', type: 'string', required: true },
          { name: 'role', type: 'string', required: true },
        ]
      }
    ]
  });

  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(config.resources[0]?.id || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [generatedZipBlob, setGeneratedZipBlob] = useState<Blob | null>(null);
  const [generationType, setGenerationType] = useState<'full-stack' | 'react-native'>('full-stack');

  const toggleFeature = (feature: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const addResource = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newResource: Resource = {
      id: newId,
      name: 'NewResource',
      fields: [{ name: 'id', type: 'string', required: true }]
    };
    setConfig(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
    setSelectedResourceId(newId);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setConfig(prev => {
      const oldResource = prev.resources.find(r => r.id === id);
      const newResources = prev.resources.map(r => r.id === id ? { ...r, ...updates } : r);
      
      // If name changed, update all relations pointing to it
      if (updates.name && oldResource && oldResource.name !== updates.name) {
        return {
          ...prev,
          resources: newResources.map(r => ({
            ...r,
            fields: r.fields.map(f => f.type === 'relation' && f.relationTo === oldResource.name ? { ...f, relationTo: updates.name } : f)
          }))
        };
      }
      
      return { ...prev, resources: newResources };
    });
  };

  const deleteResource = (id: string) => {
    setConfig(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== id)
    }));
    setPositions(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    if (selectedResourceId === id) setSelectedResourceId(null);
  };

  const addField = (resourceId: string) => {
    setConfig(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === resourceId ? {
        ...r,
        fields: [...r.fields, { name: 'newField', type: 'string', required: false }]
      } : r)
    }));
  };

  const updateField = (resourceId: string, fieldIndex: number, updates: Partial<Field>) => {
    setConfig(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === resourceId ? {
        ...r,
        fields: r.fields.map((f, i) => i === fieldIndex ? { ...f, ...updates } : f)
      } : r)
    }));
  };

  const deleteField = (resourceId: string, fieldIndex: number) => {
    setConfig(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === resourceId ? {
        ...r,
        fields: r.fields.filter((_, i) => i !== fieldIndex)
      } : r)
    }));
  };

  const handleGenerate = async () => {
    setGenerationType('full-stack');
    setShowGenerateModal(true);
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedZipBlob(null);

    const steps = [
      'Initializing TED Engine...',
      'Analyzing project configuration...',
      'Generating Prisma schemas...',
      'Scaffolding NestJS backend...',
      'Building Next.js 15 frontend...',
      'Configuring Docker infrastructure...',
      'Packaging full-stack boilerplate...',
      'Finalizing ZIP archive...'
    ];

    const zip = new JSZip();
    const files = generateProject(config);
    
    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
    }

    files.forEach(file => {
      zip.file(file.path, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    setGeneratedZipBlob(content);
    setIsGenerating(false);
  };

  const handleGenerateReactNative = async () => {
    setGenerationType('react-native');
    setShowGenerateModal(true);
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedZipBlob(null);

    const steps = [
      'Initializing Expo CLI...',
      'Analyzing mobile project configuration...',
      'Generating React Navigation structures...',
      'Mapping schema types to TS Interfaces...',
      'Scaffolding Screens and Form Fields...',
      'Configuring NativeWind Tailwind styling...',
      'Packaging React Native project...',
      'Finalizing Expo ZIP archive...'
    ];

    const zip = new JSZip();
    const files = generateProject(config, true);
    
    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
    }

    // Filter only files belonging to mobile, and strip the 'mobile/' prefix
    files.forEach(file => {
      if (file.path.startsWith('mobile/')) {
        const strippedPath = file.path.replace(/^mobile\//, '');
        zip.file(strippedPath, file.content);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    setGeneratedZipBlob(content);
    setIsGenerating(false);
  };

  const downloadGeneratedZip = () => {
    if (generatedZipBlob) {
      const suffix = generationType === 'react-native' ? '-react-native-expo' : '';
      saveAs(generatedZipBlob, `${config.name.toLowerCase().replace(/\s+/g, '-')}${suffix}.zip`);
      setShowGenerateModal(false);
    }
  };

  const loadDemo = () => {
    setConfig({
      name: 'EnterpriseERP',
      description: 'Full-scale Enterprise Resource Planning system with multi-module support.',
      dbName: 'enterprise_erp_db',
      dbUser: 'erp_admin',
      dbPass: 'secure_erp_pass',
      apiPort: 3000,
      features: ['dashboard', 'halaman', 'File Upload', 'Audit Log', 'Auth Pages', 'Multi-tenant', 'TanStack Query', 'Shadcn UI'],
      resources: [
        // 1. MASTER DATA MODULE
        {
          id: 'erp-1',
          name: 'Company',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'name', type: 'string', required: true },
            { name: 'currency_id', type: 'relation', relationTo: 'Currency', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'created_by', type: 'relation', relationTo: 'User', required: false },
            { name: 'updated_at', type: 'date', required: true },
            { name: 'updated_by', type: 'relation', relationTo: 'User', required: false },
            { name: 'deleted_at', type: 'date', required: false }
          ]
        },
        {
          id: 'erp-2',
          name: 'Branch',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'address', type: 'string', required: false },
            { name: 'created_at', type: 'date', required: true },
            { name: 'created_by', type: 'relation', relationTo: 'User', required: true },
            { name: 'updated_at', type: 'date', required: true },
            { name: 'updated_by', type: 'relation', relationTo: 'User', required: true },
            { name: 'deleted_at', type: 'date', required: false }
          ]
        },
        {
          id: 'erp-3',
          name: 'User',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'username', type: 'string', required: true },
            { name: 'email', type: 'string', required: true },
            { name: 'password', type: 'string', required: true },
            { name: 'is_active', type: 'boolean', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true },
            { name: 'deleted_at', type: 'date', required: false }
          ]
        },
        {
          id: 'erp-4',
          name: 'Role',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-5',
          name: 'Permission',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'name', type: 'string', required: true },
            { name: 'module', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-5-ur',
          name: 'UserRole',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'user_id', type: 'relation', relationTo: 'User', required: true },
            { name: 'role_id', type: 'relation', relationTo: 'Role', required: true }
          ]
        },
        {
          id: 'erp-5-rp',
          name: 'RolePermission',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'role_id', type: 'relation', relationTo: 'Role', required: true },
            { name: 'permission_id', type: 'relation', relationTo: 'Permission', required: true }
          ]
        },
        {
          id: 'erp-6',
          name: 'Department',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-7',
          name: 'Position',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-7-cur',
          name: 'Currency',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'code', type: 'string', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'symbol', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-7-ex',
          name: 'ExchangeRate',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'from_currency_id', type: 'relation', relationTo: 'Currency', required: true },
            { name: 'to_currency_id', type: 'relation', relationTo: 'Currency', required: true },
            { name: 'rate', type: 'number', required: true },
            { name: 'effective_date', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-7-set',
          name: 'Setting',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'key', type: 'string', required: true },
            { name: 'value', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-7-unit',
          name: 'Unit',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'name', type: 'string', required: true },
            { name: 'code', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-7-cat',
          name: 'ProductCategory',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'name', type: 'string', required: true },
            { name: 'description', type: 'string', required: false }
          ]
        },
        {
          id: 'erp-7-ent',
          name: 'SystemEntity',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'name', type: 'string', required: true },
            { name: 'code', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-7-stat',
          name: 'TransactionStatus',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'name', type: 'string', required: true },
            { name: 'color_code', type: 'string', required: false }
          ]
        },
        {
          id: 'erp-7-seq',
          name: 'DocumentSequence',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'name', type: 'string', required: true },
            { name: 'prefix', type: 'string', required: true },
            { name: 'suffix', type: 'string', required: false },
            { name: 'padding', type: 'number', required: true, defaultValue: '4' },
            { name: 'next_number', type: 'number', required: true, defaultValue: '1' },
            { name: 'entity_id', type: 'relation', relationTo: 'SystemEntity', required: true }
          ]
        },
        {
          id: 'erp-8',
          name: 'Employee',
          module: 'Master Data',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'user_id', type: 'relation', relationTo: 'User', required: true },
            { name: 'department_id', type: 'relation', relationTo: 'Department', required: true },
            { name: 'position_id', type: 'relation', relationTo: 'Position', required: true },
            { name: 'first_name', type: 'string', required: true },
            { name: 'last_name', type: 'string', required: true },
            { name: 'join_date', type: 'date', required: true },
            { name: 'salary', type: 'number', required: true }
          ]
        },
        // 2. HR & PAYROLL MODULE
        {
          id: 'erp-9',
          name: 'Attendance',
          module: 'HR & Payroll',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'employee_id', type: 'relation', relationTo: 'Employee', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'clock_in', type: 'string', required: true },
            { name: 'clock_out', type: 'string', required: false },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-10',
          name: 'Leave',
          module: 'HR & Payroll',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'employee_id', type: 'relation', relationTo: 'Employee', required: true },
            { name: 'type', type: 'string', required: true },
            { name: 'start_date', type: 'date', required: true },
            { name: 'end_date', type: 'date', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-11',
          name: 'Payroll',
          module: 'HR & Payroll',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'employee_id', type: 'relation', relationTo: 'Employee', required: true },
            { name: 'period_month', type: 'number', required: true },
            { name: 'period_year', type: 'number', required: true },
            { name: 'net_salary', type: 'number', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-11-det',
          name: 'PayrollDetail',
          module: 'HR & Payroll',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'payroll_id', type: 'relation', relationTo: 'Payroll', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'amount', type: 'number', required: true },
            { name: 'type', type: 'string', required: true } // Allowance or Deduction
          ]
        },
        // 3. FINANCE & ACCOUNTING MODULE
        {
          id: 'erp-12',
          name: 'ChartOfAccount',
          module: 'Finance & Accounting',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'code', type: 'string', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'type', type: 'string', required: true },
            { name: 'balance', type: 'number', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-13',
          name: 'Journal',
          module: 'Finance & Accounting',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'reference', type: 'string', required: true },
            { name: 'total_debit', type: 'number', required: true },
            { name: 'total_credit', type: 'number', required: true },
            { name: 'is_posted', type: 'boolean', required: true, defaultValue: 'false' },
            { name: 'created_at', type: 'date', required: true },
            { name: 'created_by', type: 'relation', relationTo: 'User', required: true }
          ]
        },
        {
          id: 'erp-13-item',
          name: 'JournalItem',
          module: 'Finance & Accounting',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'journal_id', type: 'relation', relationTo: 'Journal', required: true },
            { name: 'account_id', type: 'relation', relationTo: 'ChartOfAccount', required: true },
            { name: 'debit', type: 'number', required: true },
            { name: 'credit', type: 'number', required: true },
            { name: 'description', type: 'string', required: false }
          ]
        },
        {
          id: 'erp-13-gl',
          name: 'GeneralLedger',
          module: 'Finance & Accounting',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'journal_id', type: 'relation', relationTo: 'Journal', required: true },
            { name: 'account_id', type: 'relation', relationTo: 'ChartOfAccount', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'debit', type: 'number', required: true },
            { name: 'credit', type: 'number', required: true },
            { name: 'reference_type', type: 'string', required: true },
            { name: 'reference_id', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-14',
          name: 'Tax',
          module: 'Finance & Accounting',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'rate', type: 'number', required: true }
          ]
        },
        // 4. SALES & CRM MODULE
        {
          id: 'erp-15',
          name: 'Customer',
          module: 'Sales & CRM',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'email', type: 'string', required: true },
            { name: 'phone', type: 'string', required: false },
            { name: 'address', type: 'string', required: false },
            { name: 'credit_limit', type: 'number', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-16',
          name: 'SalesOrder',
          module: 'Sales & CRM',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'customer_id', type: 'relation', relationTo: 'Customer', required: true },
            { name: 'order_date', type: 'date', required: true },
            { name: 'total_amount', type: 'number', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'journal_id', type: 'relation', relationTo: 'Journal', required: false },
            { name: 'created_at', type: 'date', required: true },
            { name: 'created_by', type: 'relation', relationTo: 'User', required: true }
          ]
        },
        {
          id: 'erp-16-item',
          name: 'SalesOrderItem',
          module: 'Sales & CRM',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'sales_order_id', type: 'relation', relationTo: 'SalesOrder', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'unit_price', type: 'number', required: true },
            { name: 'total_price', type: 'number', required: true }
          ]
        },
        {
          id: 'erp-17',
          name: 'Invoice',
          module: 'Sales & CRM',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'sales_order_id', type: 'relation', relationTo: 'SalesOrder', required: true },
            { name: 'invoice_date', type: 'date', required: true },
            { name: 'due_date', type: 'date', required: true },
            { name: 'total_amount', type: 'number', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'journal_id', type: 'relation', relationTo: 'Journal', required: false },
            { name: 'created_at', type: 'date', required: true },
            { name: 'created_by', type: 'relation', relationTo: 'User', required: true }
          ]
        },
        {
          id: 'erp-17-item',
          name: 'InvoiceItem',
          module: 'Sales & CRM',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'invoice_id', type: 'relation', relationTo: 'Invoice', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'unit_price', type: 'number', required: true },
            { name: 'total_price', type: 'number', required: true }
          ]
        },
        {
          id: 'erp-17-pay',
          name: 'Payment',
          module: 'Sales & CRM',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'invoice_id', type: 'relation', relationTo: 'Invoice', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'amount', type: 'number', required: true },
            { name: 'payment_method', type: 'string', required: true },
            { name: 'journal_id', type: 'relation', relationTo: 'Journal', required: true }
          ]
        },
        // 5. PROCUREMENT MODULE
        {
          id: 'erp-18',
          name: 'Supplier',
          module: 'Procurement',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'email', type: 'string', required: true },
            { name: 'phone', type: 'string', required: false },
            { name: 'address', type: 'string', required: false },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-19',
          name: 'PurchaseOrder',
          module: 'Procurement',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'supplier_id', type: 'relation', relationTo: 'Supplier', required: true },
            { name: 'order_date', type: 'date', required: true },
            { name: 'total_amount', type: 'number', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'journal_id', type: 'relation', relationTo: 'Journal', required: false },
            { name: 'created_at', type: 'date', required: true },
            { name: 'created_by', type: 'relation', relationTo: 'User', required: true }
          ]
        },
        {
          id: 'erp-19-item',
          name: 'PurchaseOrderItem',
          module: 'Procurement',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'purchase_order_id', type: 'relation', relationTo: 'PurchaseOrder', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'unit_price', type: 'number', required: true },
            { name: 'total_price', type: 'number', required: true }
          ]
        },
        {
          id: 'erp-19-rec',
          name: 'GoodsReceipt',
          module: 'Procurement',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'purchase_order_id', type: 'relation', relationTo: 'PurchaseOrder', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'received_by', type: 'relation', relationTo: 'User', required: true }
          ]
        },
        // 6. INVENTORY MODULE
        {
          id: 'erp-20',
          name: 'Product',
          module: 'Inventory',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'sku', type: 'string', required: true },
            { name: 'category_id', type: 'relation', relationTo: 'ProductCategory', required: true },
            { name: 'unit_id', type: 'relation', relationTo: 'Unit', required: true },
            { name: 'base_price', type: 'number', required: true },
            { name: 'valuation_method', type: 'string', required: true, defaultValue: 'FIFO' },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-20-val',
          name: 'InventoryValuation',
          module: 'Inventory',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'warehouse_id', type: 'relation', relationTo: 'Warehouse', required: true },
            { name: 'total_quantity', type: 'number', required: true },
            { name: 'unit_cost', type: 'number', required: true },
            { name: 'total_value', type: 'number', required: true },
            { name: 'last_updated', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-21',
          name: 'Warehouse',
          module: 'Inventory',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'location', type: 'string', required: false }
          ]
        },
        {
          id: 'erp-22',
          name: 'Stock',
          module: 'Inventory',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'warehouse_id', type: 'relation', relationTo: 'Warehouse', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'journal_id', type: 'relation', relationTo: 'Journal', required: false }
          ]
        },
        {
          id: 'erp-22-mov',
          name: 'StockMovement',
          module: 'Inventory',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'from_warehouse_id', type: 'relation', relationTo: 'Warehouse', required: false },
            { name: 'to_warehouse_id', type: 'relation', relationTo: 'Warehouse', required: false },
            { name: 'quantity', type: 'number', required: true },
            { name: 'type', type: 'string', required: true }, // IN, OUT, TRANSFER
            { name: 'reference_type', type: 'string', required: true },
            { name: 'reference_id', type: 'string', required: true },
            { name: 'date', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-22-layer',
          name: 'StockValuationLayer',
          module: 'Inventory',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'remaining_quantity', type: 'number', required: true },
            { name: 'unit_cost', type: 'number', required: true },
            { name: 'total_value', type: 'number', required: true },
            { name: 'date', type: 'date', required: true }
          ]
        },
        // 7. DOCUMENT MANAGEMENT
        {
          id: 'erp-23-cat',
          name: 'DocumentCategory',
          module: 'Document Management',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-23',
          name: 'Document',
          module: 'Document Management',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'title', type: 'string', required: true },
            { name: 'category_id', type: 'relation', relationTo: 'DocumentCategory', required: true },
            { name: 'owner_id', type: 'relation', relationTo: 'User', required: true },
            { name: 'file_path', type: 'string', required: true },
            { name: 'created_at', type: 'date', required: true }
          ]
        },
        // 8. WORKFLOW & APPROVAL
        {
          id: 'erp-24',
          name: 'Approval',
          module: 'Workflow & Approval',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'entity_id', type: 'relation', relationTo: 'SystemEntity', required: true },
            { name: 'reference_id', type: 'string', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'requested_by', type: 'relation', relationTo: 'User', required: true },
            { name: 'approved_by', type: 'relation', relationTo: 'User', required: false },
            { name: 'workflow_id', type: 'relation', relationTo: 'Workflow', required: false },
            { name: 'created_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-24-wf',
          name: 'Workflow',
          module: 'Workflow & Approval',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'entity_id', type: 'relation', relationTo: 'SystemEntity', required: true },
            { name: 'is_active', type: 'boolean', required: true }
          ]
        },
        {
          id: 'erp-24-wft',
          name: 'WorkflowTransition',
          module: 'Workflow & Approval',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'workflow_id', type: 'relation', relationTo: 'Workflow', required: true },
            { name: 'from_status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'to_status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'required_role_id', type: 'relation', relationTo: 'Role', required: false },
            { name: 'auto_post', type: 'boolean', required: true, defaultValue: 'false' }
          ]
        },
        {
          id: 'erp-24-auto',
          name: 'AutoPostingConfig',
          module: 'Workflow & Approval',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'event_type', type: 'string', required: true },
            { name: 'source_module', type: 'string', required: true },
            { name: 'target_account_id', type: 'relation', relationTo: 'ChartOfAccount', required: true },
            { name: 'is_enabled', type: 'boolean', required: true }
          ]
        },
        // 10. AUDIT & LOG
        {
          id: 'erp-25',
          name: 'AuditLog',
          module: 'Audit & Log',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'user_id', type: 'relation', relationTo: 'User', required: true },
            { name: 'action', type: 'string', required: true },
            { name: 'entity_id', type: 'relation', relationTo: 'SystemEntity', required: true },
            { name: 'record_id', type: 'string', required: true },
            { name: 'old_values', type: 'string', required: false },
            { name: 'new_values', type: 'string', required: false },
            { name: 'timestamp', type: 'date', required: true }
          ]
        },
        // 9. PRODUCTION & MANUFACTURING MODULE
        {
          id: 'erp-27',
          name: 'BillOfMaterial',
          module: 'Production & Manufacturing',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'product_id', type: 'relation', relationTo: 'Product', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'version', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-28',
          name: 'WorkCenter',
          module: 'Production & Manufacturing',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'capacity', type: 'number', required: true }
          ]
        },
        {
          id: 'erp-29',
          name: 'ProductionOrder',
          module: 'Production & Manufacturing',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'bom_id', type: 'relation', relationTo: 'BillOfMaterial', required: true },
            { name: 'quantity', type: 'number', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        // 10. PROJECT MANAGEMENT MODULE
        {
          id: 'erp-30',
          name: 'Project',
          module: 'Project Management',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'start_date', type: 'date', required: true },
            { name: 'end_date', type: 'date', required: false },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-31',
          name: 'Task',
          module: 'Project Management',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'project_id', type: 'relation', relationTo: 'Project', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'title', type: 'string', required: true },
            { name: 'assigned_to', type: 'relation', relationTo: 'Employee', required: false },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'created_at', type: 'date', required: true },
            { name: 'updated_at', type: 'date', required: true }
          ]
        },
        // 11. QUALITY & MAINTENANCE MODULE
        {
          id: 'erp-32-cat',
          name: 'AssetCategory',
          module: 'Quality & Maintenance',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true }
          ]
        },
        {
          id: 'erp-32',
          name: 'Asset',
          module: 'Quality & Maintenance',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'category_id', type: 'relation', relationTo: 'AssetCategory', required: true },
            { name: 'purchase_date', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-33',
          name: 'MaintenanceLog',
          module: 'Quality & Maintenance',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'asset_id', type: 'relation', relationTo: 'Asset', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'description', type: 'string', required: true },
            { name: 'cost', type: 'number', required: true },
            { name: 'created_at', type: 'date', required: true }
          ]
        },
        // 12. REGISTRATION MODULE
        {
          id: 'erp-34-ev',
          name: 'Event',
          module: 'Registration',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'date', type: 'date', required: true }
          ]
        },
        {
          id: 'erp-34',
          name: 'Registration',
          module: 'Registration',
          fields: [
            { name: 'id', type: 'string', required: true, isPrimaryKey: true },
            { name: 'company_id', type: 'relation', relationTo: 'Company', required: true },
            { name: 'branch_id', type: 'relation', relationTo: 'Branch', required: true },
            { name: 'document_number', type: 'string', required: true },
            { name: 'user_id', type: 'relation', relationTo: 'User', required: true },
            { name: 'event_id', type: 'relation', relationTo: 'Event', required: true },
            { name: 'registration_date', type: 'date', required: true },
            { name: 'status_id', type: 'relation', relationTo: 'TransactionStatus', required: true },
            { name: 'notes', type: 'string', required: false },
            { name: 'created_at', type: 'date', required: true }
          ]
        }
      ],
    });
    setSelectedResourceId('erp-1');
  };

  const [viewMode, setViewMode] = useState<'editor' | 'erd' | 'preview'>('editor');
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [erdScale, setErdScale] = useState(1);
  const [erdOffset, setErdOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [erdSearch, setErdSearch] = useState('');

  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== 'erd') return;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setErdScale(prev => Math.min(Math.max(prev * delta, 0.1), 3));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'erd') return;
    if ((e.target as HTMLElement).closest('.erd-node')) return;
    setIsDraggingCanvas(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvas || viewMode !== 'erd') return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setErdOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const autoLayout = () => {
    const newPositions: Record<string, { x: number, y: number }> = {};
    const cols = Math.ceil(Math.sqrt(config.resources.length));
    config.resources.forEach((res, idx) => {
      newPositions[res.id] = {
        x: 100 + (idx % cols) * 300,
        y: 100 + Math.floor(idx / cols) * 300
      };
    });
    setPositions(newPositions);
  };

  const handleSaveProject = () => {
    localStorage.setItem('ted_project_config', JSON.stringify({ ...config, positions }));
    toast.success('Project saved to local storage!', {
      description: 'Your progress has been persisted in the browser.',
      duration: 3000,
    });
  };

  const handleExportProject = () => {
    const blob = new Blob([JSON.stringify({ ...config, positions }, null, 2)], { type: 'application/json' });
    saveAs(blob, `${config.name || 'project'}.json`);
    toast.success('Project exported successfully!');
  };

  const handleExportSQL = () => {
    let sql = `-- SQL Export for ${config.name || 'Project'}\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    if (config.dbName) {
      sql += `CREATE DATABASE IF NOT EXISTS \`${config.dbName}\`;\n`;
      sql += `USE \`${config.dbName}\`;\n\n`;
    }

    const junctionTables = new Map<string, string>();

    config.resources.forEach(res => {
      const tableName = res.name.toLowerCase();
      sql += `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n`;
      
      const fieldLines: string[] = [];
      
      res.fields.forEach(field => {
        if (field.type === 'relation') {
          const relType = field.relationType || '1:N';
          const targetTable = field.relationTo?.toLowerCase() || '';
          
          if (relType === '1:N' || relType === '1:1') {
            const fkColumnName = field.name.toLowerCase().endsWith('id') ? field.name : `${field.name}Id`;
            fieldLines.push(`  \`${fkColumnName}\` VARCHAR(36) NOT NULL`);
            fieldLines.push(`  CONSTRAINT \`fk_${tableName}_${field.name}\` FOREIGN KEY (\`${fkColumnName}\`) REFERENCES \`${targetTable}\`(\`id\`) ON DELETE CASCADE`);
          } else if (relType === 'N:M') {
            // Handle N:M by creating a junction table later
            // Sort names to ensure consistent junction table naming and avoid duplicates
            const tables = [tableName, targetTable].sort();
            const junctionName = `_${tables[0]}To${tables[1]}`;
            
            if (!junctionTables.has(junctionName)) {
              let junctionSql = `CREATE TABLE IF NOT EXISTS \`${junctionName}\` (\n`;
              junctionSql += `  \`A\` VARCHAR(36) NOT NULL,\n`;
              junctionSql += `  \`B\` VARCHAR(36) NOT NULL,\n`;
              junctionSql += `  UNIQUE KEY \`_AB_unique\` (\`A\`,\`B\`),\n`;
              junctionSql += `  KEY \`_B_index\` (\`B\`),\n`;
              junctionSql += `  CONSTRAINT \`fk_${junctionName}_A\` FOREIGN KEY (\`A\`) REFERENCES \`${tables[0]}\`(\`id\`) ON DELETE CASCADE,\n`;
              junctionSql += `  CONSTRAINT \`fk_${junctionName}_B\` FOREIGN KEY (\`B\`) REFERENCES \`${tables[1]}\`(\`id\`) ON DELETE CASCADE\n`;
              junctionSql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`;
              junctionTables.set(junctionName, junctionSql);
            }
          }
          return;
        }

        let type = 'VARCHAR(255)';
        if (field.type === 'number') type = 'INT';
        else if (field.type === 'boolean') type = 'BOOLEAN';
        else if (field.type === 'date') type = 'TIMESTAMP';
        
        if (field.isPrimaryKey) {
          type = 'VARCHAR(36)'; // UUID-like
        }

        let line = `  \`${field.name}\` ${type}`;
        if (field.required) line += ' NOT NULL';
        if (field.isPrimaryKey) line += ' PRIMARY KEY';
        if (field.isUnique && !field.isPrimaryKey) line += ' UNIQUE';
        if (field.defaultValue !== undefined && field.defaultValue !== '') {
          const cleanVal = field.defaultValue.replace(/^["']|["']$/g, '');
          if (field.type === 'string' || field.type === 'date') line += ` DEFAULT '${cleanVal}'`;
          else line += ` DEFAULT ${cleanVal}`;
        }
        
        fieldLines.push(line);
      });

      // Add standard audit fields
      fieldLines.push('  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      fieldLines.push('  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      if (res.softDelete) {
        fieldLines.push('  `deletedAt` TIMESTAMP NULL DEFAULT NULL');
      }

      sql += fieldLines.join(',\n');
      sql += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';
    });

    // Add junction tables at the end
    if (junctionTables.size > 0) {
      sql += `-- Junction Tables for N:M Relations\n`;
      sql += Array.from(junctionTables.values()).join('\n');
      sql += '\n';
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    const blob = new Blob([sql], { type: 'text/plain' });
    saveAs(blob, `${config.name || 'project'}.sql`);
    toast.success('SQL schema exported successfully!');
  };

  const handleImportSQL = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      try {
        const resources: Resource[] = [];
        const tableRegex = /CREATE TABLE IF NOT EXISTS `([^`]+)` \(([\s\S]+?)\) ENGINE=InnoDB/g;
        let match;

        const junctionTables: { name: string, a: string, b: string }[] = [];

        while ((match = tableRegex.exec(content)) !== null) {
          const tableName = match[1];
          const tableBody = match[2];

          // Check if it's a junction table (Prisma style: _AToB with columns A and B)
          if (tableName.startsWith('_') && tableName.includes('To')) {
            const parts = tableName.substring(1).split('To');
            if (parts.length === 2) {
              junctionTables.push({ name: tableName, a: parts[0].toLowerCase(), b: parts[1].toLowerCase() });
              continue;
            }
          }

          const resource: Resource = {
            id: Math.random().toString(36).substr(2, 9),
            name: tableName.charAt(0).toUpperCase() + tableName.slice(1),
            fields: []
          };

          const lines = tableBody.split(',\n');
          const constraints: { name: string, column: string, targetTable: string }[] = [];

          lines.forEach(line => {
            const trimmed = line.trim();
            
            // Handle Constraints (Foreign Keys)
            if (trimmed.startsWith('CONSTRAINT')) {
              const fkMatch = /CONSTRAINT `([^`]+)` FOREIGN KEY \(`([^`]+)`\) REFERENCES `([^`]+)`/.exec(trimmed);
              if (fkMatch) {
                constraints.push({ name: fkMatch[1], column: fkMatch[2], targetTable: fkMatch[3] });
              }
              return;
            }

            // Handle Columns
            const colMatch = /`([^`]+)` (\w+)(\(\d+\))?/.exec(trimmed);
            if (colMatch) {
              const colName = colMatch[1];
              const colType = colMatch[2].toUpperCase();
              
              // Skip standard audit fields if they are already handled by the engine
              if (['createdAt', 'updatedAt', 'deletedAt'].includes(colName)) {
                if (colName === 'deletedAt') resource.softDelete = true;
                return;
              }

              let type: Field['type'] = 'string';
              if (colType === 'INT' || colType === 'INTEGER' || colType === 'DECIMAL' || colType === 'FLOAT' || colType === 'DOUBLE') type = 'number';
              else if (colType === 'BOOLEAN' || colType === 'TINYINT') type = 'boolean';
              else if (colType === 'TIMESTAMP' || colType === 'DATETIME' || colType === 'DATE') type = 'date';

              const field: Field = {
                name: colName,
                type: type,
                required: trimmed.includes('NOT NULL'),
                isPrimaryKey: trimmed.includes('PRIMARY KEY'),
                isUnique: trimmed.includes('UNIQUE')
              };

              // Handle default values
              const defaultMatch = /DEFAULT '([^']+)'|DEFAULT (\d+)/.exec(trimmed);
              if (defaultMatch) {
                field.defaultValue = defaultMatch[1] || defaultMatch[2];
              }

              resource.fields.push(field);
            }
          });

          // Post-process fields to identify relations based on constraints
          constraints.forEach(c => {
            const field = resource.fields.find(f => f.name === c.column);
            if (field) {
              field.type = 'relation';
              field.relationTo = c.targetTable.charAt(0).toUpperCase() + c.targetTable.slice(1);
              field.relationType = '1:N'; // Defaulting to 1:N for FKs
              // Remove "Id" suffix if it was added by exporter
              if (field.name.toLowerCase().endsWith('id') && field.name.length > 2) {
                field.name = field.name.slice(0, -2);
              }
            }
          });

          resources.push(resource);
        }

        // Process Junction Tables to set N:M relations
        junctionTables.forEach(jt => {
          const resA = resources.find(r => r.name.toLowerCase() === jt.a);
          const resB = resources.find(r => r.name.toLowerCase() === jt.b);

          if (resA && resB) {
            // Add relation to A pointing to B
            resA.fields.push({
              name: resB.name.toLowerCase() + 's',
              type: 'relation',
              relationTo: resB.name,
              relationType: 'N:M',
              required: false
            });
          }
        });

        if (resources.length > 0) {
          setConfig(prev => ({
            ...prev,
            resources: resources
          }));
          setSelectedResourceId(resources[0].id);
          toast.success(`Imported ${resources.length} tables from SQL!`);
        } else {
          toast.error('No valid tables found in SQL file.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse SQL file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig(importedConfig);
        if (importedConfig.positions) {
          setPositions(importedConfig.positions);
        }
        if (importedConfig.resources && importedConfig.resources.length > 0) {
          setSelectedResourceId(importedConfig.resources[0].id);
        }
        toast.success('Project imported successfully!');
      } catch (err) {
        toast.error('Failed to import project. Invalid JSON file.');
      } finally {
        // Reset input value to allow importing the same file again
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const saved = localStorage.getItem('ted_project_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        if (parsed.positions) {
          setPositions(parsed.positions);
        }
        if (parsed.resources && parsed.resources.length > 0) {
          setSelectedResourceId(parsed.resources[0].id);
        }
      } catch (e) {
        console.error('Failed to load saved project', e);
      }
    }
  }, []);

  const applyPreset = (level: 'minimum' | 'medium' | 'advanced') => {
    const allFeatures = FEATURE_CATEGORIES.flatMap(c => c.features);
    let selected: string[] = [];

    if (level === 'advanced') {
      selected = [...allFeatures];
    } else if (level === 'medium') {
      // Select first 3 features of each category
      selected = FEATURE_CATEGORIES.flatMap(c => c.features.slice(0, 3));
    } else {
      // Select first 1 feature of each category
      selected = FEATURE_CATEGORIES.flatMap(c => c.features.slice(0, 1));
    }

    setConfig(prev => ({ ...prev, features: selected }));
  };

  useEffect(() => {
    if (viewMode === 'erd') {
      const newPositions = { ...positions };
      let changed = false;
      config.resources.forEach((res, idx) => {
        if (!newPositions[res.id]) {
          // Staggered initial layout
          newPositions[res.id] = { 
            x: 100 + (idx % 3) * 300, 
            y: 100 + Math.floor(idx / 3) * 250 
          };
          changed = true;
        }
      });
      if (changed) setPositions(newPositions);
    }
  }, [viewMode, config.resources]);

  const selectedResource = config.resources.find(r => r.id === selectedResourceId);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />
      {/* Column 1: Project Config & Resources List */}
      <div className="w-80 border-r border-white/5 bg-[#0a0a0a] flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Project Config
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  // Reset to a clean state or just focus on the name
                  setConfig(prev => ({
                    ...prev,
                    name: 'NewProject',
                    dbName: 'new_db',
                    dbUser: 'postgres',
                    dbPass: 'password',
                    apiPort: 3000,
                    resources: []
                  }));
                }}
                className="py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-all"
              >
                Create Project
              </button>
              <button 
                onClick={loadDemo}
                className="py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all"
              >
                Load Demo
              </button>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div 
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Details</span>
                </div>
                {isConfigOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
              </div>

              <AnimatePresence>
                {isConfigOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Project Name</label>
                        <input
                          type="text"
                          value={config.name}
                          onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Database Name</label>
                        <input
                          type="text"
                          value={config.dbName}
                          onChange={e => setConfig(prev => ({ ...prev, dbName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">API Port</label>
                        <input
                          type="number"
                          value={config.apiPort}
                          onChange={e => setConfig(prev => ({ ...prev, apiPort: parseInt(e.target.value) || 3000 }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Postgres User</label>
                          <input
                            type="text"
                            value={config.dbUser}
                            onChange={e => setConfig(prev => ({ ...prev, dbUser: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Postgres Password</label>
                          <input
                            type="password"
                            value={config.dbPass}
                            onChange={e => setConfig(prev => ({ ...prev, dbPass: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Description</label>
                        <textarea
                          value={config.description}
                          onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white h-16 resize-none focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Resources</h2>
            <button
              onClick={addResource}
              className="p-1.5 bg-emerald-500 text-black rounded-md hover:bg-emerald-400 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {config.resources.map(res => (
              <div
                key={res.id}
                onClick={() => setSelectedResourceId(res.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                  selectedResourceId === res.id
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/5 hover:border-white/20 text-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-bold">{res.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteResource(res.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {res.fields.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{f.name}</span>
                  ))}
                  {res.fields.length > 3 && <span className="text-[8px] text-gray-600">+{res.fields.length - 3} more</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 3: Resource Editor & ERD */}
      <div className="flex-1 bg-[#050505] flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-500" />
              {viewMode === 'editor' ? 'Resource Editor' : 'ERD Diagram'}
            </h2>
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'editor' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setViewMode('erd')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'erd' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                ERD Map
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Preview
              </button>
            </div>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
              <button 
                onClick={handleSaveProject}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[10px] font-bold text-emerald-400 uppercase tracking-wider"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                Save
              </button>
              <button 
                onClick={handleExportProject}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-wider"
              >
                <FileJson className="w-3.5 h-3.5 text-yellow-400" />
                Export JSON
              </button>
              <button 
                onClick={() => document.getElementById('import-project-input')?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-wider"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                Import JSON
              </button>
              <button 
                onClick={handleExportSQL}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-wider"
              >
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Export SQL
              </button>
              <button 
                onClick={() => document.getElementById('import-sql-input')?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-wider"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                Import SQL
              </button>
              <button 
                onClick={handleGenerate}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[10px] font-bold text-emerald-400 uppercase tracking-wider"
              >
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                Generate
              </button>
              <button 
                onClick={handleGenerateReactNative}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-[10px] font-bold text-indigo-400 uppercase tracking-wider"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                Generate React Native
              </button>
              <input 
                id="import-project-input"
                type="file"
                accept=".json"
                onChange={handleImportProject}
                className="hidden"
              />
              <input 
                id="import-sql-input"
                type="file"
                accept=".sql"
                onChange={handleImportSQL}
                className="hidden"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">TED Engine v01.09</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-0 relative">
          {viewMode === 'preview' ? (
            config.features.includes('dashboard') ? (
              <DashboardPreview config={config} />
            ) : (
              <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30 custom-scrollbar">
                {/* Navbar */}
                <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-50 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white">{config.name}</span>
                </div>
                <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-400">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Product <ChevronDown className="w-3 h-3" /></div>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Docs <ChevronDown className="w-3 h-3" /></div>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Resources <ChevronDown className="w-3 h-3" /></div>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-orange-500 transition-colors">Pricing <ChevronDown className="w-3 h-3" /></div>
                  <a href="#" className="hover:text-orange-500 transition-colors">Blog</a>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 text-gray-500 hover:text-white transition-colors"><UserPlus className="w-5 h-5" /></button>
                  <button className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-all shadow-lg shadow-white/10">
                    Book a demo
                  </button>
                </div>
              </nav>

              {/* Hero Section */}
              <section className="relative pt-16 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center space-y-10 relative z-10">
                  <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl mx-auto">
                    Build Systems That Power <br />
                    <span className="text-orange-500">Your Operations</span>
                  </h1>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    {config.name} connects no-code tools with ERP systems, uniting engineers and operators to tackle key operational challenges.
                  </p>
                  <button className="bg-orange-500 text-white px-10 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                    Get started
                  </button>
                </div>

                <div className="max-w-5xl mx-auto mt-20 relative">
                  {/* Floating Tags - Left */}
                  <div className="absolute left-0 top-1/4 -translate-x-1/2 space-y-4 z-20 hidden xl:block">
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">CRM</div>
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">Order management</div>
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">HRIS</div>
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">Inventory management</div>
                  </div>

                  {/* Floating Tags - Right */}
                  <div className="absolute right-0 top-1/3 translate-x-1/2 space-y-4 z-20 hidden xl:block">
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">WMS</div>
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">Project management</div>
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">Custom ERP</div>
                    <div className="bg-[#1a1a1a] px-4 py-2 rounded-full shadow-lg border border-white/10 text-xs font-bold text-gray-400">Procurement</div>
                  </div>

                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-[#1a1a1a]">
                    <img 
                      src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop" 
                      alt="Futuristic Tech" 
                      className="w-full h-[600px] object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
                  </div>
                </div>
              </section>

              {/* Logo Cloud */}
              <section className="py-20 px-6 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale contrast-125">
                  <span className="text-2xl font-black tracking-tighter text-white">MODE</span>
                  <span className="text-2xl font-black tracking-tighter text-white">Mosaic</span>
                  <span className="text-2xl font-black tracking-tighter text-white">airbnb</span>
                  <span className="text-2xl font-black tracking-tighter text-white">verizon</span>
                  <span className="text-2xl font-black tracking-tighter text-white">Alphabet</span>
                  <span className="text-2xl font-black tracking-tighter text-white">VIACOM</span>
                </div>
              </section>

              {/* Features Section */}
              <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto space-y-24">
                  <div className="text-center space-y-6">
                    <h2 className="text-5xl font-bold text-white">
                      Meet {config.name}. Your All-In-One <br />
                      <span className="text-orange-500">Operations Stack.</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                      Empowering developers with innovative tools that simplify workflows and boost productivity.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                      <div className="w-full aspect-square bg-white/5 rounded-full flex items-center justify-center relative">
                        <div className="w-3/4 h-3/4 bg-[#1a1a1a] rounded-3xl shadow-2xl border border-white/10 flex items-center justify-center p-12">
                           <div className="w-full h-full bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/40">
                              <Cpu className="w-24 h-24" />
                           </div>
                        </div>
                        {/* Connecting Lines & Labels */}
                        <div className="absolute top-0 left-0 p-4 bg-[#1a1a1a] rounded-xl shadow-lg border border-white/10 text-[10px] font-bold text-gray-300">We spark creativity and community.</div>
                        <div className="absolute top-1/4 right-0 p-4 bg-[#1a1a1a] rounded-xl shadow-lg border border-white/10 text-[10px] font-bold text-gray-300">NextGen pro: Your AI Companion</div>
                        <div className="absolute bottom-1/4 left-0 p-4 bg-[#1a1a1a] rounded-xl shadow-lg border border-white/10 text-[10px] font-bold text-gray-300">User Experience Guidelines</div>
                      </div>
                    </div>
                    <div className="space-y-12">
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-white">Awesome Ways To Improve <span className="text-orange-500">Healthcare!</span></h3>
                        <p className="text-gray-400">Our user-friendly products provide precision and affordable options for everyone, from beginners to pros, ensuring excellent performance.</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><ShieldCheck className="w-5 h-5" /></div>
                          <h4 className="font-bold text-white">Atlas AI Precision</h4>
                          <p className="text-xs text-gray-500">Our user-friendly products provide precision and affordable options for everyone.</p>
                        </div>
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><RefreshCw className="w-5 h-5" /></div>
                          <h4 className="font-bold text-white">Reduce no-shows</h4>
                          <p className="text-xs text-gray-500">Quickly notify customers via SMS or email about their upcoming reservations.</p>
                        </div>
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><Layout className="w-5 h-5" /></div>
                          <h4 className="font-bold text-white">Stand out with a custom</h4>
                          <p className="text-xs text-gray-500">Choose your own schedule! Book appointments daily or weekly, whenever it suits you.</p>
                        </div>
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Activity className="w-5 h-5" /></div>
                          <h4 className="font-bold text-white">Set your availability</h4>
                          <p className="text-xs text-gray-500">Looking to take your weekends back? Need to create some breathing room in your schedule?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Network Section */}
              <section className="py-32 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto text-center space-y-16">
                  <h2 className="text-5xl font-bold text-white">
                    Gather Your Equipment And <br />
                    Crew <span className="text-orange-500">For The Journey.</span>
                  </h2>
                  <div className="relative h-[400px] max-w-4xl mx-auto">
                    {/* Network Graph Visualization */}
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 z-10">
                          <Zap className="w-10 h-10" />
                       </div>
                       {/* Connection Lines & Nodes */}
                       <div className="absolute top-0 left-1/4 w-12 h-12 bg-[#1a1a1a] rounded-full shadow-lg border border-white/10 flex items-center justify-center"><Globe className="w-6 h-6 text-blue-500" /></div>
                       <div className="absolute bottom-0 right-1/4 w-12 h-12 bg-[#1a1a1a] rounded-full shadow-lg border border-white/10 flex items-center justify-center"><Server className="w-6 h-6 text-emerald-500" /></div>
                       <div className="absolute top-1/2 left-0 w-12 h-12 bg-[#1a1a1a] rounded-full shadow-lg border border-white/10 flex items-center justify-center"><Database className="w-6 h-6 text-purple-500" /></div>
                       <div className="absolute top-1/2 right-0 w-12 h-12 bg-[#1a1a1a] rounded-full shadow-lg border border-white/10 flex items-center justify-center"><Activity className="w-6 h-6 text-orange-500" /></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer CTA */}
              <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-orange-600 to-orange-400 rounded-[3rem] p-12 md:p-24 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-orange-500/20">
                  <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight relative z-10">
                    Build your dream <br /> operational systems!
                  </h2>
                  <p className="text-white/80 max-w-xl mx-auto relative z-10">
                    Stop struggling with spreadsheets and ineffective solutions. Tackle your ops challenges with {config.name}'s unmatched flexibility.
                  </p>
                  <button className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl relative z-10">
                    Get started
                  </button>
                </div>
              </section>
            </div>
          )) : viewMode === 'editor' ? (
            <div className="h-full overflow-y-auto p-8 custom-scrollbar">
              {selectedResource ? (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Resource Name</label>
                      <input
                        type="text"
                        value={selectedResource.name}
                        onChange={e => updateResource(selectedResource.id, { name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Description</label>
                      <input
                        type="text"
                        value={selectedResource.description || ''}
                        onChange={e => updateResource(selectedResource.id, { description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateResource(selectedResource.id, { softDelete: !selectedResource.softDelete })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                        selectedResource.softDelete 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {selectedResource.softDelete ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      <span className="text-[10px] font-bold uppercase tracking-wider">Soft Delete</span>
                    </button>
                    <button
                      onClick={() => updateResource(selectedResource.id, { auditLogs: !selectedResource.auditLogs })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                        selectedResource.auditLogs 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {selectedResource.auditLogs ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      <span className="text-[10px] font-bold uppercase tracking-wider">Audit Logs</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Fields & Schema</h3>
                      <button
                        onClick={() => addField(selectedResource.id)}
                        className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add Field
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedResource.fields.map((field, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={idx}
                          className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all"
                        >
                          <div className="flex-1 flex items-center gap-2">
                            {field.isPrimaryKey && (
                              <div className="flex items-center gap-1 shrink-0">
                                <Key className="w-3 h-3 text-[#FFD700]" />
                                <span className="text-[8px] font-bold text-[#FFD700]">PK</span>
                              </div>
                            )}
                            {field.type === 'relation' && (
                              <div className="flex items-center gap-1 shrink-0">
                                <Key className="w-3 h-3 text-[#C0C0C0]" />
                                <span className="text-[8px] font-bold text-[#C0C0C0]">FK</span>
                              </div>
                            )}
                            <input
                              type="text"
                              value={field.name}
                              onChange={e => updateField(selectedResource.id, idx, { name: e.target.value })}
                              placeholder="Field name"
                              className="w-full bg-transparent text-xs text-white focus:outline-none"
                            />
                          </div>
                          <select
                            value={field.type}
                            onChange={e => updateField(selectedResource.id, idx, { type: e.target.value as any })}
                            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray-400 focus:outline-none"
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="date">Date</option>
                            <option value="relation">Relation</option>
                          </select>
                          {field.type === 'relation' && (
                            <>
                              <select
                                value={field.relationType || '1:N'}
                                onChange={e => updateField(selectedResource.id, idx, { relationType: e.target.value as any })}
                                className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1 text-[10px] text-blue-400 focus:outline-none"
                              >
                                <option value="1:1">1:1</option>
                                <option value="1:N">1:N</option>
                                <option value="N:M">N:M</option>
                              </select>
                              <select
                                value={field.relationTo || ''}
                                onChange={e => updateField(selectedResource.id, idx, { relationTo: e.target.value })}
                                className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 text-[10px] text-emerald-400 focus:outline-none"
                              >
                                <option value="">Select Resource</option>
                                {config.resources.filter(r => r.id !== selectedResource.id).map(r => (
                                  <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                              </select>
                            </>
                          )}
                          <button
                            onClick={() => updateField(selectedResource.id, idx, { isPrimaryKey: !field.isPrimaryKey })}
                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-tighter transition-all ${
                              field.isPrimaryKey ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-600'
                            }`}
                            title="Primary Key"
                          >
                            PK
                          </button>
                          {field.type === 'relation' && (
                            <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-tighter border border-blue-500/20">
                              FK
                            </div>
                          )}
                          <button
                            onClick={() => updateField(selectedResource.id, idx, { isUnique: !field.isUnique })}
                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-tighter transition-all ${
                              field.isUnique ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-600'
                            }`}
                            title="Unique Constraint"
                          >
                            UQ
                          </button>
                          <button
                            onClick={() => updateField(selectedResource.id, idx, { required: !field.required })}
                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-tighter transition-all ${
                              field.required ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'
                            }`}
                            title="Required Field"
                          >
                            REQ
                          </button>
                          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/5">
                             <span className="text-[8px] text-gray-600">DEF</span>
                             <input 
                               type="text"
                               value={field.defaultValue || ''}
                               onChange={e => updateField(selectedResource.id, idx, { defaultValue: e.target.value })}
                               placeholder="null"
                               className="bg-transparent text-[8px] text-white focus:outline-none w-12"
                             />
                          </div>
                          <button
                            onClick={() => deleteField(selectedResource.id, idx)}
                            className="p-1.5 text-gray-600 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <Code className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm">Select a resource to edit its schema</p>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="h-full relative overflow-hidden bg-[#050505] cursor-grab active:cursor-grabbing"
              onWheel={handleWheel}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {/* ERD Toolbar */}
              <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Search resources..."
                    value={erdSearch}
                    onChange={e => setErdSearch(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none w-40"
                  />
                </div>
                <button 
                  onClick={addResource}
                  className="p-2.5 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  title="Add Resource"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={autoLayout}
                  className="p-2.5 bg-[#1a1a1a] border border-white/10 text-gray-400 rounded-xl hover:text-white hover:bg-white/5 transition-all"
                  title="Auto Layout"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div 
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{ 
                  transform: `translate(${erdOffset.x}px, ${erdOffset.y}px) scale(${erdScale})`,
                  transformOrigin: '0 0'
                }}
              >
                {/* SVG Layer for Relationship Lines */}
                <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-0 overflow-visible">
                  <defs>
                    <marker
                      id="dot"
                      viewBox="0 0 10 10"
                      refX="5"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                    >
                      <circle cx="5" cy="5" r="3" fill="#10b981" />
                    </marker>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                    </marker>
                  </defs>
                  {config.resources.map(res => 
                    res.fields.filter(f => f.type === 'relation' && f.relationTo).map((f, idx) => {
                      const target = config.resources.find(r => r.name === f.relationTo);
                      if (!target || !positions[res.id] || !positions[target.id]) return null;
                      
                      const sPos = positions[res.id];
                      const tPos = positions[target.id];
                      
                      // Table dimensions
                      const tableWidth = 208; // w-52 = 13rem = 208px
                      
                      // Find field index for vertical offset
                      const fieldIdx = res.fields.indexOf(f);
                      const headerHeight = 36;
                      const fieldHeight = 22;
                      const startY = sPos.y + headerHeight + (fieldIdx * fieldHeight) + (fieldHeight / 2);
                      
                      // Target vertical offset (connect to PK field)
                      const targetFieldIdx = Math.max(0, target.fields.findIndex(tf => tf.isPrimaryKey));
                      const endY = tPos.y + headerHeight + (targetFieldIdx * fieldHeight) + (fieldHeight / 2); 

                      // Horizontal logic: connect left or right side
                      let startX, endX;
                      const padding = 20; // Extra space for curve
                      if (sPos.x + tableWidth < tPos.x) {
                        // Source is left of target
                        startX = sPos.x + tableWidth;
                        endX = tPos.x;
                      } else if (sPos.x > tPos.x + tableWidth) {
                        // Source is right of target
                        startX = sPos.x;
                        endX = tPos.x + tableWidth;
                      } else {
                        // Overlapping horizontally, use edges based on center relative position
                        if (sPos.x < tPos.x) {
                          startX = sPos.x + tableWidth;
                          endX = tPos.x;
                        } else {
                          startX = sPos.x;
                          endX = tPos.x + tableWidth;
                        }
                      }

                      // Control points for curved line (dbdiagram style)
                      const curvature = Math.abs(endX - startX) / 2 + 50;
                      const cp1x = startX + (endX > startX ? curvature : -curvature);
                      const cp1y = startY;
                      const cp2x = endX + (endX > startX ? -curvature : curvature);
                      const cp2y = endY;

                      const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
                      
                      return (
                        <g key={`${res.id}-${target.id}-${idx}`}>
                          <path
                            d={pathData}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeOpacity="0.4"
                            markerStart="url(#dot)"
                            markerEnd="url(#arrow)"
                            className="transition-all duration-300"
                          />
                          <rect 
                            x={(startX + endX) / 2 - 15} 
                            y={(startY + endY) / 2 - 8} 
                            width="30" 
                            height="16" 
                            rx="4" 
                            fill="#0f0f0f" 
                            stroke="#10b981" 
                            strokeWidth="1"
                            strokeOpacity="0.3"
                          />
                          <text
                            x={(startX + endX) / 2}
                            y={(startY + endY) / 2 + 4}
                            fill="#10b981"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="opacity-80 pointer-events-none"
                          >
                            {f.relationType || '1:N'}
                          </text>
                        </g>
                      );
                    })
                  )}
                </svg>

                {/* Draggable Tables */}
                <div className="absolute inset-0">
                  {config.resources.filter(r => r.name.toLowerCase().includes(erdSearch.toLowerCase())).map((res) => (
                    <motion.div
                      key={res.id}
                      drag
                      dragMomentum={false}
                      onDrag={(e, info) => {
                        setPositions(prev => ({
                          ...prev,
                          [res.id]: { 
                            x: (prev[res.id]?.x || 0) + info.delta.x / erdScale, 
                            y: (prev[res.id]?.y || 0) + info.delta.y / erdScale 
                          }
                        }));
                      }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        x: positions[res.id]?.x || 0,
                        y: positions[res.id]?.y || 0,
                      }}
                      className={`erd-node w-52 bg-[#121212] border rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-move z-10 transition-all duration-200 ${
                        selectedResourceId === res.id ? 'border-emerald-500 ring-1 ring-emerald-500/50 scale-[1.02]' : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResourceId(res.id);
                      }}
                    >
                      <div className={`px-3 py-2 border-b border-white/5 flex items-center justify-between ${selectedResourceId === res.id ? 'bg-emerald-500/20' : 'bg-[#1a1a1a]'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-sm ${selectedResourceId === res.id ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                          <span className={`text-[11px] font-bold tracking-tight uppercase ${selectedResourceId === res.id ? 'text-emerald-400' : 'text-gray-200'}`}>{res.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteResource(res.id); }}
                            className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="py-1">
                        {res.fields.map((f, i) => (
                          <div key={i} className="px-3 py-1 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-2">
                              {f.isPrimaryKey && (
                                <div className="flex items-center gap-1">
                                  <Key className="w-2.5 h-2.5 text-[#FFD700]" />
                                  <span className="text-[7px] font-bold text-[#FFD700]">PK</span>
                                </div>
                              )}
                              {f.type === 'relation' && (
                                <div className="flex items-center gap-1">
                                  <Key className="w-2.5 h-2.5 text-[#C0C0C0]" />
                                  <span className="text-[7px] font-bold text-[#C0C0C0]">FK</span>
                                </div>
                              )}
                              {!f.isPrimaryKey && f.type !== 'relation' && (
                                <div className={`w-1 h-1 rounded-full ${f.required ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                              )}
                              <span className={`text-[10px] ${f.isPrimaryKey ? 'text-[#FFD700]/90 font-medium' : f.type === 'relation' ? 'text-[#C0C0C0]/90 font-medium' : 'text-gray-300'}`}>{f.name}</span>
                            </div>
                            <span className="text-[9px] text-gray-600 font-mono lowercase">{f.type === 'relation' ? f.relationTo : f.type}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Zoom Controls */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
                <button 
                  onClick={() => setErdScale(prev => Math.min(prev + 0.1, 3))}
                  className="p-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setErdScale(1); setErdOffset({ x: 0, y: 0 }); }}
                  className="p-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-[10px] font-bold"
                >
                  1:1
                </button>
                <button 
                  onClick={() => setErdScale(prev => Math.max(prev - 0.1, 0.1))}
                  className="p-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* ERD Legend */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute bottom-6 left-6 z-50 bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl min-w-[160px]"
              >
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  ERD Legend
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white/5 rounded flex items-center justify-center">
                      <Key className="w-3 h-3 text-[#FFD700]" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">PK <span className="text-gray-500 ml-1">Primary Key</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white/5 rounded flex items-center justify-center">
                      <Key className="w-3 h-3 text-[#C0C0C0]" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">FK <span className="text-gray-500 ml-1">Foreign Key</span></span>
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500/10 rounded flex items-center justify-center">
                      <span className="text-[8px] font-bold text-emerald-400">1:N</span>
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">Default <span className="text-gray-500 ml-1">One-to-Many</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500/10 rounded flex items-center justify-center">
                      <span className="text-[8px] font-bold text-blue-400">1:1</span>
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">Unique <span className="text-gray-500 ml-1">One-to-One</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-500/10 rounded flex items-center justify-center">
                      <span className="text-[8px] font-bold text-purple-400">N:M</span>
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">Pivot <span className="text-gray-500 ml-1">Many-to-Many</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-orange-500/10 rounded flex items-center justify-center">
                      <RefreshCw className="w-2.5 h-2.5 text-orange-400" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">Self <span className="text-gray-500 ml-1">Same Table</span></span>
                  </div>
                </div>
              </motion.div>

              {/* Background Grid Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[-1]" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
                  backgroundSize: `${30 * erdScale}px ${30 * erdScale}px`,
                  backgroundPosition: `${erdOffset.x}px ${erdOffset.y}px`
                }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Global Features */}
      <div className="w-72 border-l border-white/5 bg-[#0f0f0f] flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-white tracking-tight">Global Features</h2>
        </div>
        
        <div className="p-3 border-b border-white/5 bg-white/[0.02] grid grid-cols-3 gap-2">
          <button 
            onClick={() => applyPreset('minimum')}
            className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all"
          >
            Minimum
          </button>
          <button 
            onClick={() => applyPreset('medium')}
            className="py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-lg text-[8px] font-bold uppercase tracking-wider text-emerald-500/70 hover:text-emerald-400 transition-all"
          >
            Medium
          </button>
          <button 
            onClick={() => applyPreset('advanced')}
            className="py-1.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 rounded-lg text-[8px] font-bold uppercase tracking-wider text-blue-500/70 hover:text-blue-400 transition-all"
          >
            Advanced
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {FEATURE_CATEGORIES.map((cat, idx) => {
            const isExpanded = expandedCategory === cat.title;
            return (
              <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:bg-white/[0.05] transition-all">
                <button 
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.title)}
                  className="w-full flex items-center justify-between p-3 text-[9px] uppercase tracking-widest text-gray-400 font-bold group"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-white/5 rounded-md text-emerald-500">{cat.icon}</span>
                    {cat.title}
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-3 pb-3 space-y-1 border-t border-white/5 pt-2">
                        {cat.features.map(feature => (
                          <button
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] transition-all duration-200 flex items-center justify-between group ${
                              config.features.includes(feature)
                                ? 'text-emerald-400'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {config.features.includes(feature) ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-gray-700" />
                              )}
                              {feature}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Generation Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGenerating && setShowGenerateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${generationType === 'react-native' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}>
                    {generationType === 'react-native' ? (
                      <Smartphone className="w-6 h-6 text-indigo-400" />
                    ) : (
                      <Box className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {generationType === 'react-native' ? 'Generate React Native' : 'Generate Full-Stack'}
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">TED Engine v01.09</p>
                  </div>
                </div>
                {!isGenerating && (
                  <button 
                    onClick={() => setShowGenerateModal(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>

              <div className="p-8 space-y-8">
                {isGenerating ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <div className="relative">
                        <Loader2 className={`w-12 h-12 animate-spin ${generationType === 'react-native' ? 'text-indigo-500' : 'text-emerald-500'}`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap className={`w-4 h-4 animate-pulse ${generationType === 'react-native' ? 'text-indigo-400' : 'text-emerald-500'}`} />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white mb-1">
                          {(generationType === 'react-native' ? [
                            'Initializing Expo CLI...',
                            'Analyzing mobile project configuration...',
                            'Generating React Navigation structures...',
                            'Mapping schema types to TS Interfaces...',
                            'Scaffolding Screens and Form Fields...',
                            'Configuring NativeWind Tailwind styling...',
                            'Packaging React Native project...',
                            'Finalizing Expo ZIP archive...'
                          ] : [
                            'Initializing TED Engine...',
                            'Analyzing project configuration...',
                            'Generating Prisma schemas...',
                            'Scaffolding NestJS backend...',
                            'Building Next.js 15 frontend...',
                            'Configuring Docker infrastructure...',
                            'Packaging full-stack boilerplate...',
                            'Finalizing ZIP archive...'
                          ])[generationStep]}
                        </p>
                        <p className="text-[10px] text-gray-500">Step {generationStep + 1} of 8</p>
                      </div>
                    </div>
                    
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${generationType === 'react-native' ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${((generationStep + 1) / 8) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    <div className={`bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-[9px] space-y-1 ${generationType === 'react-native' ? 'text-indigo-400/70' : 'text-emerald-500/70'}`}>
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3" />
                        <span>{generationType === 'react-native' ? 'npx create-expo-app --template' : 'ted-engine --generate --config="./project.json"'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-3 h-3" />
                        <span>{generationType === 'react-native' ? 'Creating Expo mobile framework...' : 'Creating directory structure...'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileCode className="w-3 h-3" />
                        <span>{generationType === 'react-native' ? 'Generating React Native views & API...' : 'Writing boilerplate files...'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 py-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${generationType === 'react-native' ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
                        {generationType === 'react-native' ? (
                          <Smartphone className="w-8 h-8 text-indigo-400" />
                        ) : (
                          <CheckSquare className="w-8 h-8 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {generationType === 'react-native' ? 'Expo App Generated!' : 'Generation Complete!'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {generationType === 'react-native' 
                            ? 'Your standalone React Native + Expo client is ready.' 
                            : 'Your full-stack boilerplate is ready for download.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Files</div>
                        <div className="text-lg font-bold text-white">
                          {generationType === 'react-native' ? '~15' : '~45'}
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Size</div>
                        <div className="text-lg font-bold text-white">
                          {generationType === 'react-native' ? '~45 KB' : '~120 KB'}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={downloadGeneratedZip}
                      className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all shadow-lg ${
                        generationType === 'react-native' 
                          ? 'bg-indigo-50 text-white hover:bg-indigo-400 shadow-indigo-500/20' 
                          : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                      }`}
                    >
                      <Download className="w-5 h-5" />
                      {generationType === 'react-native' ? 'Download Expo ZIP' : 'Download ZIP Archive'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
