'use client';

import { useEffect, useState } from 'react';
import { useSocket, testSocketConnection } from '@/lib/socketClient';

export default function SocketTestPage() {
    const { socket, isConnected } = useSocket();
    const [latency, setLatency] = useState<number | null>(null);
    const [testResult, setTestResult] = useState<string>('');

    const runPingTest = async () => {
        setTestResult('Testing...');
        try {
            const ms = await testSocketConnection();
            setLatency(ms);
            setTestResult(`✅ Success! Latency: ${ms}ms`);
        } catch (error) {
            setTestResult(`❌ Failed: ${error}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">WebSocket Test Page</h1>

                <div className="space-y-6">
                    {/* Connection Status */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Connection Status</h2>
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-lg">
                                {isConnected ? '✅ Connected' : '❌ Disconnected'}
                            </span>
                        </div>
                        {isConnected && socket && (
                            <div className="mt-4 text-sm text-gray-400">
                                Socket ID: <code className="bg-white/10 px-2 py-1 rounded">{socket.id}</code>
                            </div>
                        )}
                    </div>

                    {/* Ping Test */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Ping Test</h2>
                        <button
                            onClick={runPingTest}
                            disabled={!isConnected}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors"
                        >
                            Run Ping Test
                        </button>
                        {testResult && (
                            <div className="mt-4 text-lg">
                                {testResult}
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Day 1 Progress</h2>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>✅ Socket.IO server created (<code>server.ts</code>)</li>
                            <li>✅ Client utilities created (<code>lib/socketClient.ts</code>)</li>
                            <li>✅ npm scripts updated to use custom server</li>
                            <li>✅ tsx installed for TypeScript execution</li>
                            <li>🔄 Testing WebSocket connection...</li>
                        </ul>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Next Steps</h2>
                        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                            <li>Restart dev server with <code>npm run dev</code></li>
                            <li>Verify this page loads and shows "Connected"</li>
                            <li>Click "Run Ping Test" to verify latency</li>
                            <li>Proceed to Day 2: Server-authoritative game logic</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
