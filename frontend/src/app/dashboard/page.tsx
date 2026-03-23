'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { 
  BookOpen, 
  Terminal, 
  Rocket, 
  ShieldCheck,
  Server,
  Database,
  Layers,
  Zap,
  Key,
  Flame,
  GitBranch,
  Settings2,
  DatabaseZap,
  PlayCircle,
  ExternalLink,
  CreditCard,
  Mountain,
  Sparkles,
  Share2,
  MonitorSmartphone,
  Fingerprint,
  FileSearch,
  MessageSquare,
  Package
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'credentials' | 'usage' | 'api' | 'troubleshooting'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'setup', label: 'Setup Guide', icon: Terminal },
    { id: 'credentials', label: 'Credentials', icon: Key },
    { id: 'usage', label: 'Showroom', icon: Rocket },
    { id: 'api', label: 'API Map', icon: Server },
    { id: 'troubleshooting', label: 'Help', icon: Sparkles },
  ];

  return (
    <ProtectedRoute>
      <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
        
        {/* Header Section */}
        <div className={`border-b sticky top-16 z-30 shadow-sm transition-colors duration-500 ${isDark ? 'bg-black/20 backdrop-blur-3xl border-gray-800/50' : 'bg-white border-stone-200'}`}>
          <div className="max-w-7xl mx-auto px-6 py-6 font-bold">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Documentation Hub</h1>
                  <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-stone-500'}`}>The high-performance architect's guide to world-class deployment.</p>
                </div>
              </div>
              <div className="bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/10 flex items-center gap-2 text-green-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className={`mt-6 p-5 rounded-xl border transition-all duration-500 ${isDark ? 'bg-[#17191E] border-gray-800' : 'bg-white border-stone-100'}`}>
               <p className={`text-sm leading-relaxed max-w-4xl ${isDark ? 'text-gray-400' : 'text-stone-500'}`}>
                <span className="text-indigo-600">LUFF.</span> is a mission-critical, production-grade microservices boilerplate designed for absolute precision and speed. 
                Our goal is to architect a world-class foundation that eliminates infrastructure overhead. Every service is an isolated fortress, unified by Mono-repo intelligence.
               </p>
            </div>

            <div className="flex gap-1.5 mt-8 overflow-x-auto pb-1 scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black transition-all duration-300 whitespace-nowrap text-xs ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                      : isDark ? 'text-gray-500 hover:bg-gray-800 hover:text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-10 mb-20 text-sm font-bold">
          {activeTab === 'usage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <FeatureShowcaseCard dark={isDark} icon={Fingerprint} title="Google OAuth" description="Stateless JWT security." tech={['Next-Auth', 'JWT']} />
              <FeatureShowcaseCard dark={isDark} icon={MessageSquare} title="AI Chat" description="Gemini 2.5 Flash power." tech={['Gemini', 'State Logic']} />
              <FeatureShowcaseCard dark={isDark} icon={FileSearch} title="RAG Engine" description="PDF PDF Indexing." tech={['Upstash', 'Vector']} />
              <FeatureShowcaseCard dark={isDark} icon={CreditCard} title="Razorpay" description="World-class payments." tech={['Gateway', 'Webhooks']} />
              <FeatureShowcaseCard dark={isDark} icon={Layers} title="TurboRepo" description="Monorepo isolation." tech={['Monorepo', 'Caching']} />
              <FeatureShowcaseCard dark={isDark} icon={Database} title="Docker DBs" description="Dedicated PG instances." tech={['Postgres', 'Docker']} />
              <FeatureShowcaseCard dark={isDark} icon={Share2} title="Shared Utils" description="Zod schema sharing." tech={['Zod', 'Shared']} />
              <FeatureShowcaseCard dark={isDark} icon={MonitorSmartphone} title="Responsive UI" description="Modern Design System." tech={['Tailwind', 'Responsive']} />
              <FeatureShowcaseCard dark={isDark} icon={Server} title="API Gateway" description="Domain orchestration." tech={['Express', 'Proxy']} />
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <ProviderCard 
                dark={isDark} 
                icon={Key} 
                title="Google Console" 
                subtitle="Auth Orchestration" 
                link="https://console.cloud.google.com/apis/credentials" 
                color="blue" 
                steps={[
                  'Architect a new Cloud Project and configure the OAuth Consent Screen.',
                  'Generate a Web OAuth Client ID with world-class security tokens.',
                  'Set Authorized Redirect: http://localhost:4000/auth/callback/google.',
                  'Sync CLIENT_ID and CLIENT_SECRET into your root .env architecture.'
                ]} 
              />
              <ProviderCard 
                dark={isDark} 
                icon={CreditCard} 
                title="Razorpay" 
                subtitle="Payment Infrastructure" 
                link="https://dashboard.razorpay.com/app/settings/keys" 
                color="indigo" 
                steps={[
                  'Access the Razorpay Dashboard and activate "Test Mode" for secure sandbox testing.',
                  'Navigate to Settings > API Keys to architect a new high-performance Key Pair.',
                  'Extract the Key ID and Key Secret with absolute precision.',
                  'Update NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.'
                ]} 
              />
              <ProviderCard 
                dark={isDark} 
                icon={Mountain} 
                title="Upstash" 
                subtitle="Vector Intelligence" 
                link="https://console.upstash.com/vector" 
                color="emerald" 
                steps={[
                  'Architect a new Vector Index with 768 dimensions (Optimized for Gemini).',
                  'Select your mission-critical region to minimize latency overhead.',
                  'Extract the REST URL and Access Token from the Upstash Console.',
                  'Sync UPSTASH_VECTOR_REST_URL/TOKEN into the AI microservice .env.'
                ]} 
              />
              <ProviderCard 
                dark={isDark} 
                icon={Sparkles} 
                title="AI Studio" 
                subtitle="LLM Synchronization" 
                link="https://aistudio.google.com/app/apikey" 
                color="purple" 
                steps={[
                  'Synchronize with Google AI Studio to generate a world-class Gemini API Key.',
                  'Verify support for Gemini 2.5 Flash to ensure high-performance inference.',
                  'Maintain absolute secrecy of your mission-critical API key.',
                  'Update GEMINI_API_KEY in the backend/ai/.env configuration.'
                ]} 
              />
            </div>
          )}

          {activeTab === 'setup' && (
            <div className={`${isDark ? 'bg-[#17191E] border-gray-800' : 'bg-white border-stone-100 shadow-sm'} rounded-[2rem] border p-10 transition-colors duration-500`}>
              <h2 className="text-xl font-black mb-10 flex items-center gap-3">
                <Terminal className="w-6 h-6 text-indigo-600" />
                Launch Masterclass
              </h2>
              <div className="space-y-12 relative text-sm">
                 <div className="absolute left-4 top-8 bottom-8 w-px bg-stone-100 opacity-10 -z-10" />
                 
                 <DetailedStep 
                  dark={isDark} 
                  icon={GitBranch} 
                  number="01" 
                  title="Clone repository" 
                  description="Synchronizing world-class code." 
                  commands={['git clone https://github.com/Luff-Org/Luff-Boilerplate.git']} 
                />

                 <DetailedStep 
                  dark={isDark} 
                  icon={Package} 
                  number="02" 
                  title="npm install" 
                  description="Installing high-performance dependencies." 
                  commands={['npm install']} 
                />

                 <DetailedStep 
                  dark={isDark} 
                  icon={Settings2} 
                  number="03" 
                  title="Env Setup" 
                  description="Syncing mission-critical templates." 
                  commands={['bash scripts/setup-envs.sh']} 
                />

                 <DetailedStep 
                  dark={isDark} 
                  icon={DatabaseZap} 
                  number="04" 
                  title="Docker Stack" 
                  description="Starting isolated database instances." 
                  commands={[
                    'docker compose -f docker/docker-compose.yml up auth-db posts-db payment-db -d',
                    'docker ps'
                  ]} 
                />

                 <DetailedStep 
                  dark={isDark} 
                  icon={ShieldCheck} 
                  number="05" 
                  title="Multi-Service Hydrate" 
                  description="Pushing schemas and generating Prisma clients." 
                  commands={[
                    '# Auth service\ncd backend/auth && npm run db:push && npm run db:generate && cd ../..',
                    '# Posts service\ncd backend/posts && npm run db:push && npm run db:generate && cd ../..',
                    '# Payment service\ncd backend/payment && npm run db:push && npm run db:generate && cd ../..'
                  ]} 
                />

                 <DetailedStep 
                  dark={isDark} 
                  icon={PlayCircle} 
                  number="06" 
                  title="Launch Universe" 
                  description="Activating cross-domain microservices." 
                  commands={['npm run run-local']} 
                />
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
             <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <MiniCard dark={isDark} icon={ShieldCheck} title="Stateless Auth" />
                   <MiniCard dark={isDark} icon={Layers} title="Microservices" />
                   <MiniCard dark={isDark} icon={Zap} title="AI Optimized" />
                </div>
                <div className={`rounded-[2.5rem] p-10 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-indigo-900/30 border border-indigo-500/20' : 'bg-indigo-600 text-white'}`}>
                   <ArchitectureDiagram dark={isDark} />
                </div>
             </div>
          )}

          {activeTab === 'api' && (
             <div className={`${isDark ? 'bg-[#17191E] border-gray-800 shadow-sm' : 'bg-white border-stone-100 shadow-sm'} rounded-[2rem] border overflow-hidden`}>
               <ServiceTable dark={isDark} />
             </div>
          )}

          {activeTab === 'troubleshooting' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <IssueCard dark={isDark} title="Port Conflict" solution="Kill conflicting PIDs on 4000-4004." />
              <IssueCard dark={isDark} title="DB Refused" solution="Verify docker compose status." />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function FeatureShowcaseCard({ dark, icon: Icon, title, description, tech }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${dark ? 'bg-[#17191E] border-gray-800 hover:border-indigo-500/20' : 'bg-white border-stone-100 hover:shadow-xl'}`}>
      <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-[2.5rem] group-hover:bg-indigo-600 transition-colors duration-500 ${dark ? 'bg-indigo-900/10' : 'bg-indigo-50'}`} />
      <div className="relative z-10">
        <div className="bg-stone-900 p-3 rounded-xl w-fit text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
           <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black mb-2 tracking-tight">{title}</h3>
        <p className={`text-sm leading-relaxed mb-6 opacity-80 ${dark ? 'text-gray-400' : 'text-stone-500'}`}>{description}</p>
        <div className="flex flex-wrap gap-1.5">
           {tech.map((t: string) => (
             <span key={t} className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${dark ? 'bg-black/40 border-gray-800 text-gray-500' : 'bg-stone-50 border-stone-100 text-stone-400'}`}>
               {t}
             </span>
           ))}
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ dark, icon: Icon, title, subtitle, link, steps }: any) {
  return (
    <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 group ${dark ? 'bg-[#17191E] border-gray-800 hover:border-indigo-500/20' : 'bg-white border-stone-100 hover:shadow-xl'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black">{title}</h3>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
        <a href={link} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${dark ? 'bg-gray-800 text-gray-400 hover:bg-white hover:text-black' : 'bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white'}`}>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="space-y-4">
        {steps.map((s: string, i: number) => (
          <div key={i} className="flex gap-3 group/step">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black group-hover/step:bg-indigo-600 group-hover/step:text-white transition-colors mt-0.5 ${dark ? 'border-gray-800 text-gray-600' : 'border-stone-100 text-stone-300'}`}>
              {i + 1}
            </div>
            <p className={`text-sm leading-relaxed transition-colors ${dark ? 'text-gray-400 group-hover/step:text-white' : 'text-stone-500 group-hover/step:text-stone-900'}`}>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailedStep({ dark, icon: Icon, number, title, description, commands }: any) {
  return (
    <div className="flex gap-8 group">
      <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm relative z-10">
          <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Step {number}</span>
           <h4 className="text-lg font-black">{title}</h4>
        </div>
        <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-stone-500'}`}>{description}</p>
        <div className={`rounded-xl p-4 font-mono text-[11px] border ${dark ? 'bg-black/40 border-gray-800' : 'bg-stone-900 border-stone-800'} text-indigo-300`}>
           {commands.map((c: string, idx: number) => (
             <div key={idx} className="flex gap-3 whitespace-pre-wrap">
                <span className="text-stone-600 shrink-0">$</span>
                <code className="break-all">{c}</code>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ dark, icon: Icon, title }: any) {
  return (
    <div className={`p-6 rounded-xl border transition-all duration-500 flex items-center gap-4 ${dark ? 'bg-[#17191E] border-gray-800' : 'bg-white border-stone-100 hover:shadow-lg'}`}>
      <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-lg font-black">{title}</h4>
    </div>
  );
}

function ArchitectureDiagram({ dark }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center text-white">
      <div>
        <h2 className="text-2xl font-black mb-4 tracking-tight">Master monorepo boundaries.</h2>
        <p className="opacity-90 text-sm leading-relaxed">Microservices isolated by domain, unified by automation.</p>
      </div>
      <div className={`p-6 rounded-2xl font-mono text-xs backdrop-blur-3xl border shadow-2xl ${dark ? 'bg-black/50 border-white/5 text-indigo-400' : 'bg-black/20 border-white/10 text-indigo-200'}`}>
<pre>{`├── app/
│   ├── frontend/
│   ├── backend/
│   │   ├── auth/
│   │   ├── posts/
│   │   ├── payment/
│   │   └── ai/
└── shared/`}</pre>
      </div>
    </div>
  );
}

function ServiceTable({ dark }: any) {
  const rows = [
    { n: 'Gateway', p: '4000' }, 
    { n: 'Auth', p: '4001' }, 
    { n: 'Posts', p: '4002' }, 
    { n: 'Payment', p: '4003' }, 
    { n: 'AI', p: '4004' }
  ];
  return (
    <table className="w-full text-left">
      <thead className={`font-black text-[9px] uppercase tracking-widest ${dark ? 'bg-black/50 text-gray-600' : 'bg-stone-50 text-stone-400'}`}>
        <tr><th className="px-8 py-5">Service</th><th className="px-8 py-5">Port</th></tr>
      </thead>
      <tbody className={`divide-y text-sm ${dark ? 'divide-gray-800 text-gray-300' : 'divide-stone-50 text-stone-700'}`}>
        {rows.map(r => (
          <tr key={r.n} className={`transition-colors ${dark ? 'hover:bg-gray-800/10' : 'hover:bg-stone-50'}`}>
            <td className="px-8 py-5 font-black">{r.n} Microservice</td>
            <td className="px-8 py-5 font-mono text-indigo-600">{r.p}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IssueCard({ dark, title, solution }: any) {
  return (
    <div className={`p-8 rounded-2xl border-l-[6px] border-l-orange-600 border transition-all duration-500 ${dark ? 'bg-[#17191E] border-gray-800 shadow-sm' : 'bg-white border-stone-100 shadow-sm'} flex items-start gap-6`}>
      <div className="bg-orange-500/10 p-3.5 rounded-xl text-orange-600 shrink-0"><Flame className="w-6 h-6" /></div>
      <div>
        <h4 className="text-xl font-black mb-1">{title}</h4>
        <p className={`text-sm italic ${dark ? 'text-gray-400' : 'text-stone-500'}`}>{solution}</p>
      </div>
    </div>
  );
}
