import React, { useState } from 'react';
import { getEloProgressionByFighter } from '../services/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const EloRecordsByFighter = () => {
    const [fighterName, setFighterName] = useState('');
    const [fightersData, setFightersData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!fighterName.trim()) {
            setError('Please enter a fighter name');
            return;
        }
        setError('');
        setFightersData([]);
        setLoading(true);

        try {
            const data = await getEloProgressionByFighter(fighterName, 'asc');
            setFightersData(data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`No records found for "${fighterName}"`);
            } else {
                setError('Error fetching fighter Elo records');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{data.fighter_name}</p>
                    <p>Fight: {data.fight_number - 1}</p>
                    <p>Elo Rating: {data.elo.toFixed(1)}</p>
                    {data.event_name && <p>Event: {data.event_name}</p>}
                    {data.event_date && <p>Date: {new Date(data.event_date).toLocaleDateString()}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="elo-records p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Fighter Elo Rating Progression</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={fighterName}
                        onChange={(e) => setFighterName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter fighter name"
                        className="px-3 py-2 border rounded flex-grow"
                    />
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {fightersData.map((fighter) => (
                <div key={fighter.fighter_id} className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold">
                            {fighter.fighter_name}
                        </h3>
                        <p className="text-gray-600">
                            Total Fights: {fighter.total_fights}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={fighter.elo_progression.map(record => ({
                                    ...record,
                                    elo: parseFloat(record.elo_rating),
                                    fight_number: record.fight_number
                                }))}
                                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="fight_number"
                                    label={{ value: "Fight Number", position: "insideBottom", offset: -5 }}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    label={{ value: "Elo Rating", angle: -90, position: "insideLeft" }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="elo"
                                    name="Elo Rating"
                                    stroke="#1D4ED8"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2">Fight #</th>
                                    <th className="px-4 py-2">Elo Rating</th>
                                    <th className="px-4 py-2">Event</th>
                                    <th className="px-4 py-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fighter.elo_progression.map((record) => (
                                    <tr key={record.elo_record_id} className="border-b">
                                        <td className="px-4 py-2 text-center">{record.fight_number}</td>
                                        <td className="px-4 py-2 text-center">{parseFloat(record.elo_rating).toFixed(1)}</td>
                                        <td className="px-4 py-2">{record.event_name || '-'}</td>
                                        <td className="px-4 py-2">
                                            {record.event_date
                                                ? new Date(record.event_date).toLocaleDateString()
                                                : '-'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EloRecordsByFighter;
