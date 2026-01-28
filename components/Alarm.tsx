import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, BellOff, X, Save, Edit3, ChevronUp, ChevronDown, Check, Clock } from 'lucide-react';
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
    const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

    // Ringing State
    const [ringingAlarm, setRingingAlarm] = useState<AlarmType | null>(null);
    const [snoozedAlarms, setSnoozedAlarms] = useState<{ [key: string]: number }>({}); // alarmId -> nextTriggerTimestamp

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

    const snoozeOptions = [
        { value: 0, label: 'Disabled' },
        { value: 5, label: '5 minutes' },
        { value: 10, label: '10 minutes' },
        { value: 20, label: '20 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' },
    ];

    useEffect(() => {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }, [alarms]);

    // Check Alarms Interval
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            if (!ringingAlarm) {
                checkAlarms(now);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [alarms, snoozedAlarms, ringingAlarm]);

    // Auto-dismiss/snooze after 1 minute of ringing
    useEffect(() => {
        if (ringingAlarm) {
            const timeout = setTimeout(() => {
                handleSnooze(ringingAlarm);
            }, 60000); // 1 minute
            return () => clearTimeout(timeout);
        }
    }, [ringingAlarm]);

    const checkAlarms = (now: Date) => {
        // 1. Check scheduled alarms
        const currentTimeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        alarms.forEach(alarm => {
            if (!alarm.isActive) return;

            // Check if snoozed
            if (snoozedAlarms[alarm.id]) {
                if (now.getTime() >= snoozedAlarms[alarm.id]) {
                    triggerAlarm(alarm);
                    // Remove from snoozed list temporarily so it doesn't double trigger immediately
                    const newSnoozed = { ...snoozedAlarms };
                    delete newSnoozed[alarm.id];
                    setSnoozedAlarms(newSnoozed);
                }
                return;
            }

            // Check regular time match
            if (alarm.time === currentTimeString && now.getSeconds() === 0) {
                const today = now.getDay();
                // If repeat is ON, check days. If OFF, trigger once.
                const shouldTrigger = (!alarm.days || alarm.days.length === 0) || alarm.days.includes(today);

                if (shouldTrigger) {
                    triggerAlarm(alarm);
                }
            }
        });
    };

    const triggerAlarm = (alarm: AlarmType) => {
        setRingingAlarm(alarm);
        // Here you would play sound
        if (navigator.vibrate) navigator.vibrate([1000, 500, 1000]);
    };

    const handleDismiss = () => {
        // Stop ringing
        setRingingAlarm(null);
        // If it was a snooze, ensure it's cleared
        if (ringingAlarm) {
            const newSnoozed = { ...snoozedAlarms };
            delete newSnoozed[ringingAlarm.id];
            setSnoozedAlarms(newSnoozed);

            // If not repeating, disable it
            if (!ringingAlarm.days || ringingAlarm.days.length === 0) {
                toggleAlarm(ringingAlarm.id);
            }
        }
    };

    const handleSnooze = (alarm: AlarmType) => {
        setRingingAlarm(null);

        // Default 10 min if set to disabled but somehow snoozed (fallback logic)
        // Or if alarm has specific snooze setting
        const snoozeDuration = alarm.snooze > 0 ? alarm.snooze : 10;

        const nextTime = new Date().getTime() + snoozeDuration * 60 * 1000;
        setSnoozedAlarms(prev => ({
            ...prev,
            [alarm.id]: nextTime
        }));
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
            setSnooze(alarm.snooze !== undefined ? alarm.snooze : 10);
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
        setIsSnoozeOpen(false);
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

    const toggleAlarm = (id: string) => {
        setAlarms(alarms.map(alarm =>
            alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
        ));
        // Clear snooze if manually toggled
        if (snoozedAlarms[id]) {
            const newSnoozed = { ...snoozedAlarms };
            delete newSnoozed[id];
            setSnoozedAlarms(newSnoozed);
        }
    };

    const toggleDay = (dayId: number) => {
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter(d => d !== dayId));
        } else {
            setSelectedDays([...selectedDays, dayId]);
        }
    };

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

    const formatAlarmTime = (time: string) => {
        // Already formatted in state, but consistency check
        return time;
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
                                {snoozedAlarms[alarm.id] && alarm.isActive && (
                                    <span className="text-xs text-amber-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Snoozed
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Toggle */}
                        <div onClick={e => e.stopPropagation()}>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={alarm.isActive}
                                    onChange={() => toggleAlarm(alarm.id)}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ringing Modal (Overlay) */}
            {ringingAlarm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                    <div className="flex flex-col items-center animate-pulse">
                        <Bell className="w-24 h-24 text-white mb-6" />
                        <h2 className="text-4xl font-bold text-white mb-2">{ringingAlarm.time}</h2>
                        <p className="text-xl text-gray-300 mb-12">{ringingAlarm.label || 'Alarm'}</p>

                        <div className="flex flex-col w-full gap-4 min-w-[300px]">
                            <button
                                onClick={() => handleSnooze(ringingAlarm)}
                                className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xl hover:bg-gray-200 transition-colors"
                            >
                                Snooze ({ringingAlarm.snooze || 10} min)
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="w-full py-4 bg-red-500/20 text-red-500 border border-red-500/50 rounded-2xl font-bold text-xl hover:bg-red-500/30 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

                        {/* Content */}
                        <div className="p-6 pt-2">
                            {/* Time Picker */}
                            <div className="flex justify-center items-center gap-2 mb-6">
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

                            {/* Label */}
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

                            {/* Sound */}
                            <div className="space-y-3 mb-8">
                                <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                        <span>{sound}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>

                                {/* Snooze Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsSnoozeOpen(!isSnoozeOpen)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <BellOff className="w-5 h-5 text-gray-400" />
                                            <span>{snoozeOptions.find(o => o.value === snooze)?.label || `${snooze} minutes`}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSnoozeOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isSnoozeOpen && (
                                        <div className={`absolute bottom-full left-0 w-full mb-2 rounded-xl overflow-hidden shadow-xl z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                            {snoozeOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSnooze(option.value);
                                                        setIsSnoozeOpen(false);
                                                    }}
                                                    className={`w-full text-left p-3 hover:bg-teal-500/10 hover:text-teal-500 flex items-center gap-2 ${snooze === option.value ? 'text-teal-500 bg-teal-500/5' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                                                        }`}
                                                >
                                                    {snooze === option.value && <div className="w-1 h-4 bg-teal-500 rounded-full" />}
                                                    <span className={snooze === option.value ? 'font-bold' : ''}>{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={() => { setIsModalOpen(false); setIsSnoozeOpen(false); }}
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
