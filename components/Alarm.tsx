import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, BellOff, X, Save, Edit3, ChevronUp, ChevronDown, Check } from 'lucide-react';
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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);

    // Form State
    const [hour, setHour] = useState('07');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
    const [label, setLabel] = useState('Good morning');
    const [repeat, setRepeat] = useState(false);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [sound, setSound] = useState('Chimes');
    const [snooze, setSnooze] = useState(10);

    const days = [
        { id: 0, label: 'Su' },
        { id: 1, label: 'M' },
        { id: 2, label: 'Tu' },
        { id: 3, label: 'We' },
        { id: 4, label: 'Th' },
        { id: 5, label: 'Fri' },
        { id: 6, label: 'Sa' },
    ];

    useEffect(() => {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }, [alarms]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            checkAlarms(now);
        }, 1000);
        return () => clearInterval(timer);
    }, [alarms]);

    const checkAlarms = (now: Date) => {
        const currentTimeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }); // e.g., "7:00 AM"

        alarms.forEach(alarm => {
            if (alarm.isActive && alarm.time === currentTimeString && now.getSeconds() === 0) {
                // Check if repeat is enabled and today is one of the selected days
                const today = now.getDay();
                const shouldTrigger = !alarm.days || alarm.days.length === 0 || alarm.days.includes(today);

                if (shouldTrigger) {
                    setTimeout(() => {
                        // eslint-disable-next-line no-restricted-globals
                        if (confirm(`Alarm: ${alarm.label || 'Time up!'}\nClick OK to snooze, Cancel to dismiss.`)) {
                            // Snooze logic placeholder
                        }
                    }, 0);
                }
            }
        });
    };

    const formatAlarmTime = (timeStr: string) => {
        // timeStr is already stored as "H:MM AM/PM" or similar from the picker? 
        // Let's standardize storage to "h:mm AM/PM" to match checkAlarms
        return timeStr;
    };

    const openModal = (alarm?: AlarmType) => {
        if (alarm) {
            setEditingAlarmId(alarm.id);
            const [timePart, periodPart] = alarm.time.split(' ');
            const [h, m] = timePart.split(':');
            setHour(h.padStart(2, '0'));
            setMinute(m.padStart(2, '0'));
            setPeriod(periodPart as 'AM' | 'PM');
            setLabel(alarm.label || '');
            setSelectedDays(alarm.days || []);
            setRepeat(!!(alarm.days && alarm.days.length > 0));
            setSound(alarm.sound || 'Chimes');
            setSnooze(alarm.snooze || 10);
        } else {
            setEditingAlarmId(null);
            setHour('07');
            setMinute('00');
            setPeriod('AM');
            setLabel('Good morning');
            setRepeat(false);
            setSelectedDays([]);
            setSound('Chimes');
            setSnooze(10);
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const timeString = `${parseInt(hour)}:${minute} ${period}`;

        const alarmData: AlarmType = {
            id: editingAlarmId || Date.now().toString(),
            time: timeString,
            isActive: true,
            label,
            days: repeat ? selectedDays : [],
            sound,
            snooze
        };

        if (editingAlarmId) {
            setAlarms(alarms.map(a => a.id === editingAlarmId ? alarmData : a));
        } else {
            setAlarms([...alarms, alarmData]);
        }
        setIsModalOpen(false);
    };

    const toggleDay = (dayId: number) => {
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter(d => d !== dayId));
        } else {
            setSelectedDays([...selectedDays, dayId]);
        }
    };

    // Time Picker Helpers
    const adjustHour = (inc: number) => {
        let h = parseInt(hour) + inc;
        if (h > 12) h = 1;
        if (h < 1) h = 12;
        setHour(h.toString().padStart(2, '0'));
    };

    const adjustMinute = (inc: number) => {
        let m = parseInt(minute) + inc;
        if (m > 59) m = 0;
        if (m < 0) m = 59;
        setMinute(m.toString().padStart(2, '0'));
    };

    const togglePeriod = () => {
        setPeriod(prev => prev === 'AM' ? 'PM' : 'AM');
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto relative">
            {/* Current Time Display */}
            <div className={`mono-font text-6xl font-bold mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' })}
                <span className="text-xl text-gray-500 ml-2 font-medium">
                    {currentTime.getSeconds().toString().padStart(2, '0')}
                </span>
            </div>

            {/* Main Add Button */}
            <button
                onClick={() => openModal()}
                className={`w-full py-4 mb-8 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
            >
                <Plus className="w-5 h-5" />
                Set New Alarm
            </button>

            {/* List */}
            <div className="w-full space-y-3 pb-20">
                {alarms.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <BellOff className="w-12 h-12 mx-auto mb-2" />
                        <p>No alarms set</p>
                    </div>
                )}
                {alarms.map((alarm) => (
                    <div
                        key={alarm.id}
                        onClick={() => openModal(alarm)}
                        className={`cursor-pointer flex items-center justify-between p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                            } ${!alarm.isActive && 'opacity-50'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${alarm.isActive ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 bg-gray-500/10'}`}>
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className={`text-3xl font-bold mono-font ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {alarm.time}
                                </span>
                                {alarm.label && <span className="text-xs text-gray-400">{alarm.label}</span>}
                                {alarm.days && alarm.days.length > 0 && (
                                    <span className="text-xs text-blue-400">
                                        {alarm.days.length === 7 ? 'Every day' :
                                            days.filter(d => alarm.days?.includes(d.id)).map(d => d.label).join(', ')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={alarm.isActive}
                                    onChange={() => setAlarms(alarms.map(a => a.id === alarm.id ? { ...a, isActive: !a.isActive } : a))}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {/* Modal Content */}
                    <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-gray-900'}`}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 pb-2">
                            <h2 className="text-xl font-bold">Edit alarm</h2>
                            {editingAlarmId && (
                                <button onClick={() => {
                                    setAlarms(alarms.filter(a => a.id !== editingAlarmId));
                                    setIsModalOpen(false);
                                }} className="text-red-500 hover:text-red-400">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Time Picker */}
                        <div className="p-6 pt-2">
                            <div className="flex justify-center items-center gap-2 mb-6">
                                {/* Timer Columns */}
                                <div className="flex flex-col items-center">
                                    <button onClick={() => adjustHour(1)} className="p-2 text-gray-400 hover:text-blue-500"><ChevronUp /></button>
                                    <span className="text-5xl font-bold w-20 text-center">{hour}</span>
                                    <button onClick={() => adjustHour(-1)} className="p-2 text-gray-400 hover:text-blue-500"><ChevronDown /></button>
                                </div>
                                <span className="text-5xl font-bold pb-8">:</span>
                                <div className="flex flex-col items-center">
                                    <button onClick={() => adjustMinute(1)} className="p-2 text-gray-400 hover:text-blue-500"><ChevronUp /></button>
                                    <span className="text-5xl font-bold w-20 text-center">{minute}</span>
                                    <button onClick={() => adjustMinute(-1)} className="p-2 text-gray-400 hover:text-blue-500"><ChevronDown /></button>
                                </div>
                                <span className="text-5xl font-bold pb-8">:</span>
                                <div className="flex flex-col items-center">
                                    <button onClick={togglePeriod} className="p-2 text-gray-400 hover:text-blue-500"><ChevronUp /></button>
                                    <span className="text-5xl font-bold w-24 text-center">{period}</span>
                                    <button onClick={togglePeriod} className="p-2 text-gray-400 hover:text-blue-500"><ChevronDown /></button>
                                </div>
                            </div>

                            {/* Label Input */}
                            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDarkMode ? 'bg-black/20' : 'bg-gray-100'}`}>
                                <Edit3 className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Alarm Label"
                                    className="bg-transparent outline-none flex-1 font-medium"
                                />
                            </div>

                            {/* Repeat */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${repeat ? 'bg-teal-500 border-teal-500' : 'border-gray-400'}`}
                                        onClick={() => setRepeat(!repeat)}>
                                        {repeat && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-medium">Repeat alarm</span>
                                </label>

                                {repeat && (
                                    <div className="flex justify-between">
                                        {days.map(day => (
                                            <button
                                                key={day.id}
                                                onClick={() => toggleDay(day.id)}
                                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${selectedDays.includes(day.id)
                                                        ? 'bg-teal-500 text-white'
                                                        : (isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500')
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sound & Snooze (Mock Dropdowns) */}
                            <div className="space-y-3 mb-8">
                                <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                        <span>{sound}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <BellOff className="w-5 h-5 text-gray-400" />
                                        <span>{snooze} minutes</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alarm;
