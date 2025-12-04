import { useState } from 'react';
import api from '../../services/api.service';
import { RefreshCw, Search, Play, Database, AlertCircle, CheckCircle, Plane } from 'lucide-react';
import './AdminSettings.css';

const TestAPI = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [regionId, setRegionId] = useState('2734'); // Paris
    const [searchId, setSearchId] = useState('');
    const [hotelId, setHotelId] = useState('paris_las_vegas');

    const addLog = (title, data, type = 'info') => {
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            title,
            data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
            type
        }, ...prev]);
    };

    const clearLogs = () => setLogs([]);

    const testMulticomplete = async () => {
        setLoading(true);
        try {
            addLog('Testing Multicomplete (Region Search)', 'Searching for "Paris"...');
            const response = await api.post('/proxy/ratehawk/search/multicomplete/', {
                query: 'Paris',
                language: 'en'
            });
            addLog('Multicomplete Success', response.data, 'success');

            // Try to find a region ID
            const region = response.data?.data?.regions?.find(r => r.type === 'City');
            if (region) {
                setRegionId(region.id);
                addLog('Found Region ID', `Setting Region ID to ${region.id} (${region.name})`, 'success');
            }
        } catch (error) {
            addLog('Multicomplete Failed', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testStartSearch = async () => {
        setLoading(true);
        try {
            const params = {
                region_id: Number(regionId),
                checkin: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], // 10 days from now
                checkout: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0], // 12 days from now
                guests: [{ adults: 2, children: [] }],
                currency: 'USD',
                language: 'en',
                residency: 'us'
            };

            addLog('Starting Hotel Search', params);

            // Try the endpoint used in service
            const response = await api.post('/proxy/ratehawk/search/serp/region/', params);
            addLog('Search Started Success', response.data, 'success');

            if (response.data?.data?.search_id) {
                setSearchId(response.data.data.search_id);
                addLog('Got Search ID', `Setting Search ID to ${response.data.data.search_id}`, 'success');
            }
        } catch (error) {
            addLog('Search Start Failed', error.message, 'error');
            if (error.response) {
                addLog('Error Response', error.response.data, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const testPollResults = async () => {
        if (!searchId) {
            addLog('Error', 'No Search ID available. Start a search first.', 'error');
            return;
        }

        setLoading(true);
        try {
            addLog('Polling Results', `Search ID: ${searchId}`);
            const response = await api.post('/proxy/ratehawk/search/serp/get/', {
                search_id: searchId,
                limit: 10,
                sort: 'price',
                currency: 'USD'
            });

            addLog('Poll Results Success', response.data, 'success');
        } catch (error) {
            addLog('Poll Results Failed', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testFlightSearch = async () => {
        setLoading(true);
        try {
            addLog('Testing Flight Search', 'Searching for JFK to LHR...');
            const response = await api.post('/proxy/ratehawk/flight/search/', {
                from: 'JFK',
                to: 'LHR',
                departure_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
                passengers: { adults: 1, children: 0, infants: 0 },
                class: 'economy',
                currency: 'USD'
            });
            addLog('Flight Search Success', response.data, 'success');
        } catch (error) {
            addLog('Flight Search Failed', error.message, 'error');
            if (error.response) {
                addLog('Error Response', error.response.data, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const testHotelDetails = async () => {
        setLoading(true);
        try {
            addLog('Fetching Hotel Details', `Hotel ID: ${hotelId}`);
            const response = await api.post('/proxy/ratehawk/hotel/info/', {
                id: hotelId,
                language: 'en'
            });

            addLog('Hotel Details Success', response.data, 'success');
        } catch (error) {
            addLog('Hotel Details Failed', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-settings">
            <div className="settings-header">
                <div>
                    <h1 className="settings-title">API Debugger</h1>
                    <p className="settings-subtitle">Test RateHawk API endpoints directly</p>
                </div>
                <button className="btn-secondary" onClick={clearLogs}>
                    Clear Logs
                </button>
            </div>

            <div className="settings-container">
                <div className="settings-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* Controls */}
                    <div className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">Test Controls</h2>
                        </div>

                        <div className="settings-card">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Region ID</label>
                                    <input
                                        className="form-input"
                                        value={regionId}
                                        onChange={e => setRegionId(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Search ID</label>
                                    <input
                                        className="form-input"
                                        value={searchId}
                                        onChange={e => setSearchId(e.target.value)}
                                        placeholder="Generated after search"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hotel ID</label>
                                    <input
                                        className="form-input"
                                        value={hotelId}
                                        onChange={e => setHotelId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-actions" style={{ flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
                                <button className="btn-secondary" onClick={testMulticomplete} disabled={loading}>
                                    <Search size={18} /> Test Multicomplete (Paris)
                                </button>
                                <button className="btn-primary" onClick={testStartSearch} disabled={loading}>
                                    <Play size={18} /> Start Search (Region)
                                </button>
                                <button className="btn-secondary" onClick={testPollResults} disabled={loading || !searchId}>
                                    <RefreshCw size={18} /> Poll Results
                                </button>
                                <button className="btn-secondary" onClick={testHotelDetails} disabled={loading}>
                                    <Database size={18} /> Get Hotel Details
                                </button>
                                <button className="btn-secondary" onClick={testFlightSearch} disabled={loading}>
                                    <Plane size={18} /> Test Flight Search
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">Execution Logs</h2>
                        </div>

                        <div className="settings-card" style={{ height: '600px', overflowY: 'auto', background: '#1a1a1a', color: '#00ff00', fontFamily: 'monospace', padding: '10px' }}>
                            {logs.length === 0 && <div style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>No logs yet</div>}
                            {logs.map(log => (
                                <div key={log.id} style={{ marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: log.type === 'error' ? '#ff4444' : log.type === 'success' ? '#00cc00' : '#88ccff' }}>
                                        <strong>[{log.timestamp}] {log.title}</strong>
                                    </div>
                                    <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                                        {log.data}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TestAPI;
