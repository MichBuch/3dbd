'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Clock, Users, TrendingUp, RefreshCw } from 'lucide-react';

interface UsageData {
    totalRequests: number;
    errorCount: number;
    byEndpoint: { path: string; count: number; avgDuration: number }[];
    topUsers: { userId: string; name: string; count: number }[];
    hourly: { hour: string; count: number }[];
    range: string;
}

export default function AdminUsagePage() {
    const [data, setData] = useState<UsageData | null>(null);
    const [range, setRange] = useState('24h');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/usage?range=${range}`);
            if (res.ok) setData(await res.json());
        } catch (e) {
            console.error('Failed to fetch usage data', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [range]);

    const maxHourly = data ? Math.max(...data.hourly.map(h => h.count), 1) : 1;
    const errorRate = data && data.totalRequests > 0
        ? ((data.errorCount / data.totalRequests) * 100).toFixed(1)
        : '0';

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-neonBlue">API Usage & Costs</h1>
                    <p className="text-gray-400 mt-1">Track request volume, top endpoints, and heaviest users.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                        <option value="1h">Last Hour</option>
                        <option value="24h">Last 24h</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                    <button onClick={fetchData} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {loading && !data ? (
                <div className="text-gray-400 text-center py-20">Loading usage data...</div>
            ) : data ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Activity size={14} /> Total Requests
                            </div>
                            <div className="text-3xl font-bold text-white">{data.totalRequests.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <AlertTriangle size={14} /> Error Rate
                            </div>
                            <div className="text-3xl font-bold text-white">{errorRate}%
                                <span className="text-sm text-gray-400 ml-2">({data.errorCount} errors)</span>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <Users size={14} /> Unique Users Tracked
                            </div>
                            <div className="text-3xl font-bold text-white">{data.topUsers.length}</div>
                        </div>
                    </div>

                    {/* Hourly Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={18} /> Requests Over Time
                        </h2>
                        {data.hourly.length === 0 ? (
                            <p className="text-gray-500 text-sm">No data yet for this period.</p>
                        ) : (
                            <div className="flex items-end gap-1 h-40">
                                {data.hourly.map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                                        <div
                                            className="w-full bg-neonBlue/70 rounded-t hover:bg-neonBlue transition-colors min-h-[2px]"
                                            style={{ height: `${(h.count / maxHourly) * 100}%` }}
                                        />
                                        <div className="absolute -top-8 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                                            {h.hour}: {h.count} reqs
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Endpoints */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Clock size={18} /> Top Endpoints
                            </h2>
                            <div className="space-y-2">
                                {data.byEndpoint.map((ep, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300 font-mono truncate flex-1 mr-4">{ep.path}</span>
                                        <span className="text-gray-400 mr-4">{ep.avgDuration ?? '—'}ms avg</span>
                                        <span className="text-neonBlue font-bold">{ep.count.toLocaleString()}</span>
                                    </div>
                                ))}
                                {data.byEndpoint.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
                            </div>
                        </div>

                        {/* Top Users */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Users size={18} /> Heaviest Users
                            </h2>
                            <div className="space-y-2">
                                {data.topUsers.map((u, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300 truncate flex-1 mr-4">{u.name}</span>
                                        <span className="text-neonBlue font-bold">{u.count.toLocaleString()} reqs</span>
                                    </div>
                                ))}
                                {data.topUsers.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-red-400 text-center py-20">Failed to load usage data.</div>
            )}
        </div>
    );
}
