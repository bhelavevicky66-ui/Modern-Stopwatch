import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, BellOff } from 'lucide-react';
import { Alarm as AlarmType } from '../types';

interface AlarmProps {
    isDarkMode: boolean;
}

const Alarm: React.FC<AlarmProps> = ({ isDarkMode }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [alarms, setAlarms] = useState<AlarmType[]>(() => {
        const saved = localStorage.getItem('alarms');
        return saved ? JSON.parse(saved) : [];
    });
    const [newAlarmTime, setNewAlarmTime] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }, [alarms]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            const currentTimeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            alarms.forEach(alarm => {
                if (alarm.isActive && alarm.time === currentTimeString && now.getSeconds() === 0) {
                    setTimeout(() => {
                        if (window.confirm(`Alarm: ${formatAlarmTime(alarm.time)}\nClick OK to snooze, Cancel to dismiss.`)) {
                            // Snooze logic placeholder
                        }
                    }, 0);
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [alarms]);

    const formatAlarmTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const addAlarm = () => {
        if (!newAlarmTime) return;

        const newAlarm: AlarmType = {
            id: Date.now().toString(),
            time: newAlarmTime,
            isActive: true,
            label: 'Alarm'
        };

        setAlarms([...alarms, newAlarm]);
        setNewAlarmTime('');
        setIsAdding(false);
    };

    const toggleAlarm = (id: string) => {
        setAlarms(alarms.map(alarm =>
            alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
        ));
    };

    const deleteAlarm = (id: string) => {
        setAlarms(alarms.filter(alarm => alarm.id !== id));
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
            {/* Current Time Display */}
            <div className={`mono-font text-6xl font-bold mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' })}
                <span className="text-xl text-gray-500 ml-2 font-medium">
                    {currentTime.getSeconds().toString().padStart(2, '0')}
                </span>
            </div>

            {/* Add Alarm Controls */}
            {isAdding ? (
                <div className={`w-full p-4 rounded-2xl mb-6 flex gap-2 items-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <input
                        type="time"
                        value={newAlarmTime}
                        onChange={(e) => setNewAlarmTime(e.target.value)}
                        className={`flex-1 p-3 rounded-xl bg-transparent font-bold text-xl outline-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="p-3 rounded-xl bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addAlarm}
                            className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className={`w-full py-4 mb-8 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                >
                    <Plus className="w-5 h-5" />
                    Set New Alarm
                </button>
            )}

            {/* Alarms List */}
            <div className="w-full space-y-3">
                {alarms.length === 0 && !isAdding && (
                    <div className="text-center py-10 opacity-50">
                        <BellOff className="w-12 h-12 mx-auto mb-2" />
                        <p>No alarms set</p>
                    </div>
                )}
                {alarms.map((alarm) => (
                    <div
                        key={alarm.id}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white border border-gray-100 shadow-sm'
                            } ${!alarm.isActive && 'opacity-50'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${alarm.isActive ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 bg-gray-500/10'}`}>
                                <Bell className="w-5 h-5" />
                            </div>
                            <span className={`text-3xl font-bold mono-font ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatAlarmTime(alarm.time)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={alarm.isActive}
                                    onChange={() => toggleAlarm(alarm.id)}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>

                            <button
                                onClick={() => deleteAlarm(alarm.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete Alarm"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Alarm;
