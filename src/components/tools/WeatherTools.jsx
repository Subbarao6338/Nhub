import React, { useState, useEffect } from 'react';

const WeatherTools = ({ onSubtoolChange }) => {
    const [city, setCity] = useState('New York');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (onSubtoolChange) onSubtoolChange('Weather Forecast');
        fetchWeather();
    }, []);

    const fetchWeather = () => {
        setLoading(true);
        // Simulated weather data with realistic variety
        setTimeout(() => {
            setWeather({
                temp: 22 + Math.floor(Math.random() * 5),
                condition: ['Sunny', 'Partly Cloudy', 'Breezy'][Math.floor(Math.random()*3)],
                humidity: 45 + Math.floor(Math.random() * 10),
                wind: 12 + Math.floor(Math.random() * 5),
                uv: Math.floor(Math.random() * 10),
                forecast: [
                    { day: 'Mon', temp: 24, icon: 'wb_sunny' },
                    { day: 'Tue', temp: 21, icon: 'cloud' },
                    { day: 'Wed', temp: 19, icon: 'filter_drama' },
                    { day: 'Thu', temp: 23, icon: 'wb_sunny' },
                    { day: 'Fri', temp: 25, icon: 'wb_sunny' }
                ]
            });
            setLoading(false);
        }, 600);
    };

    return (
        <div className="tool-form">
            <div className="flex-gap mb-20">
                <input className="pill flex-1" value={city} onChange={e=>setCity(e.target.value)} placeholder="Enter city name..." />
                <button className="btn-primary" onClick={fetchWeather} disabled={loading}>
                    <span className="material-icons">{loading ? 'refresh' : 'search'}</span>
                </button>
            </div>
            {weather && (
                <div className={`grid gap-15 ${loading ? 'opacity-5' : ''}`} style={{ transition: 'opacity 0.3s' }}>
                    <div className="card p-30 text-center glass-card">
                        <div className="opacity-6 uppercase smallest font-bold mb-5">{city}</div>
                        <div style={{fontSize: '5rem', fontWeight: 800, lineHeight: 1}} className="color-primary mb-10">{weather.temp}°<span style={{fontSize: '2rem'}}>C</span></div>
                        <div className="opacity-7 uppercase font-bold h2 mb-20">{weather.condition}</div>
                        <div className="flex-center gap-20">
                            <div className="flex-column">
                                <span className="material-icons opacity-4">water_drop</span>
                                <span className="font-bold">{weather.humidity}%</span>
                                <span className="smallest opacity-5">Humidity</span>
                            </div>
                            <div className="flex-column">
                                <span className="material-icons opacity-4">air</span>
                                <span className="font-bold">{weather.wind} km/h</span>
                                <span className="smallest opacity-5">Wind</span>
                            </div>
                            <div className="flex-column">
                                <span className="material-icons opacity-4">wb_sunny</span>
                                <span className="font-bold">{weather.uv}</span>
                                <span className="smallest opacity-5">UV Index</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-5 gap-10">
                        {weather.forecast.map(f => (
                            <div key={f.day} className="card p-15 text-center no-animation">
                                <div className="smallest font-bold mb-10 opacity-6">{f.day}</div>
                                <span className="material-icons color-primary mb-10" style={{fontSize: '2rem'}}>{f.icon}</span>
                                <div className="font-bold h3">{f.temp}°</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .grid-5 {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                }
                @media (max-width: 600px) {
                    .grid-5 { grid-template-columns: repeat(3, 1fr); }
                    .grid-5 > div:nth-child(n+4) { display: none; }
                }
            `}} />
        </div>
    );
};

export default WeatherTools;
