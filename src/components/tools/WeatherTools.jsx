import React, { useState, useEffect } from 'react';

const WeatherTools = ({ onSubtoolChange }) => {
    const [city, setCity] = useState('New York');
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        if (onSubtoolChange) onSubtoolChange('Weather Forecast');
        fetchWeather();
    }, []);

    const fetchWeather = () => {
        // Simulated weather data
        setWeather({
            temp: 22,
            condition: 'Sunny',
            humidity: 45,
            wind: 12,
            forecast: [
                { day: 'Mon', temp: 24, icon: 'wb_sunny' },
                { day: 'Tue', temp: 21, icon: 'cloud' },
                { day: 'Wed', temp: 19, icon: 'filter_drama' }
            ]
        });
    };

    return (
        <div className="tool-form">
            <div className="flex-gap mb-20">
                <input className="pill flex-1" value={city} onChange={e=>setCity(e.target.value)} />
                <button className="btn-primary" onClick={fetchWeather}>Search</button>
            </div>
            {weather && (
                <div className="grid gap-15">
                    <div className="card p-20 text-center">
                        <div style={{fontSize: '4rem', fontWeight: 800}} className="color-primary">{weather.temp}°C</div>
                        <div className="opacity-6 uppercase font-bold">{weather.condition}</div>
                    </div>
                    <div className="grid grid-3 gap-10">
                        {weather.forecast.map(f => (
                            <div key={f.day} className="card p-10 text-center">
                                <div className="smallest font-bold mb-5">{f.day}</div>
                                <span className="material-icons color-primary mb-5">{f.icon}</span>
                                <div className="font-bold">{f.temp}°</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherTools;
