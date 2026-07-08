
import { Database, Server, Globe, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-emerald-500/30">
      <nav className="border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold">T</div>
            <span className="font-bold text-white tracking-tight">Advanced Demo App</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="hover:text-white transition-colors">Resources</a>
            <button className="bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-emerald-400 transition-all">Get Started</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-6xl font-extrabold text-white tracking-tight leading-tight">
            Build Faster with <span className="text-emerald-500">Modern Stack</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A full-stack project with advanced features like JWT, RBAC, GraphQL, and WebSockets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all group">
            <Server className="w-10 h-10 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-3">NestJS Backend</h3>
            <p className="text-gray-400 leading-relaxed">Robust, scalable server-side architecture with built-in support for TypeScript and modern APIs.</p>
          </div>
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all group">
            <Globe className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-3">Next.js Frontend</h3>
            <p className="text-gray-400 leading-relaxed">The React framework for production, offering SSR, static generation, and optimized performance.</p>
          </div>
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-all group">
            <Database className="w-10 h-10 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-3">Prisma ORM</h3>
            <p className="text-gray-400 leading-relaxed">Type-safe database client for PostgreSQL, making data modeling and migrations a breeze.</p>
          </div>
        </div>

        <div className="mt-32">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
            <Zap className="w-8 h-8 text-yellow-500" />
            Generated Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
              <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all">
                <h4 className="font-bold text-white mb-2">User</h4>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex justify-between"><span>id</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>email</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>password</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>name</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>role</span> <span className="text-gray-600">string</span></div>
                </div>
              </div>
            
              <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all">
                <h4 className="font-bold text-white mb-2">Product</h4>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex justify-between"><span>id</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>name</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>price</span> <span className="text-gray-600">number</span></div><div className="text-xs text-gray-500 flex justify-between"><span>description</span> <span className="text-gray-600">string</span></div>
                </div>
              </div>
            
              <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all">
                <h4 className="font-bold text-white mb-2">Order</h4>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 flex justify-between"><span>id</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>userId</span> <span className="text-gray-600">string</span></div><div className="text-xs text-gray-500 flex justify-between"><span>total</span> <span className="text-gray-600">number</span></div><div className="text-xs text-gray-500 flex justify-between"><span>status</span> <span className="text-gray-600">string</span></div>
                </div>
              </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
  