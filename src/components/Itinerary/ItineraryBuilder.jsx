import { useState } from 'react';
import { Plus, MapPin, Calendar as CalendarIcon, Trash2, ArrowLeft, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityForm from './ActivityForm';
import { useTrip } from '../../context/TripContext';

const ItineraryBuilder = () => {
    const { trip, addCity, updateCityDays, addActivity } = useTrip();

    const [newCityName, setNewCityName] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
    const [activeDayForActivity, setActiveDayForActivity] = useState(null);

    const handleAddCity = () => {
        if (!newCityName.trim()) return;
        addCity(newCityName);
        setNewCityName('');
    };

    const handleAddActivity = (activity) => {
        if (!selectedCity || !activeDayForActivity) return;
        addActivity(selectedCity.id, activeDayForActivity, activity);
    };

    // Computed selected city from state to ensure updates reflect
    const currentSelectedCity = trip.cities.find(c => c.id === selectedCity?.id);

    return (
        <div className="space-y-8 pb-20 relative">
            <AnimatePresence mode="wait">
                {!selectedCity ? (
                    <motion.div
                        key="city-list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-4xl font-bold mb-2">{trip.title}</h2>
                                <div className="flex items-center gap-4 text-text-muted">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={18} />
                                        <span>Starting {trip.startDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} />
                                        <span>{trip.cities.length} Cities</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        </div>

                        {/* City List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trip.cities.map((city, index) => (
                                <motion.div
                                    key={city.id}
                                    layoutId={`city-card-${city.id}`}
                                    onClick={() => setSelectedCity(city)}
                                    className="glass p-6 rounded-2xl flex flex-col justify-between group hover:border-primary/50 transition-colors cursor-pointer"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-bold">{city.name}</h3>
                                        </div>

                                        <div className="flex items-center gap-3 mb-6 bg-surface/50 p-2 rounded-lg w-fit" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateCityDays(city.id, -1); }}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md"
                                            >-</button>
                                            <span className="font-mono font-bold w-4 text-center">{city.days}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateCityDays(city.id, 1); }}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md"
                                            >+</button>
                                            <span className="text-sm text-text-muted ml-1">Days</span>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Highlights</h4>
                                            {city.activities.flatMap(d => d.items).slice(0, 3).map((act, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                                                    {act.name}
                                                </div>
                                            ))}
                                            {city.activities.flatMap(d => d.items).length === 0 && (
                                                <p className="text-sm text-white/20 italic">No activities planned yet</p>
                                            )}
                                        </div>
                                    </div>

                                    <button className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/5">
                                        Plan Itinerary
                                    </button>
                                </motion.div>
                            ))}

                            {/* Add City Card */}
                            <motion.div
                                className="glass p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-white/10 hover:border-primary/50 transition-colors"
                                layout
                            >
                                <div className="w-full max-w-xs space-y-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Plus size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold">Add Destination</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCityName}
                                            onChange={(e) => setNewCityName(e.target.value)}
                                            placeholder="City Name"
                                            className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                                        />
                                        <button
                                            onClick={handleAddCity}
                                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="city-details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <button
                            onClick={() => setSelectedCity(null)}
                            className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back to Trip Overview
                        </button>

                        <div className="glass-card p-8 rounded-2xl">
                            <h2 className="text-4xl font-bold mb-2">{currentSelectedCity.name} Itinerary</h2>
                            <p className="text-text-muted">{currentSelectedCity.days} Days Plans</p>
                        </div>

                        <div className="grid gap-6">
                            {Array.from({ length: currentSelectedCity.days }).map((_, i) => {
                                const dayNum = i + 1;
                                const dayActivities = currentSelectedCity.activities.find(a => a.day === dayNum)?.items || [];

                                return (
                                    <div key={dayNum} className="glass p-6 rounded-2xl relative overflow-hidden">
                                        {/* Day Indicator */}
                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent opacity-50"></div>

                                        <div className="flex justify-between items-center mb-6 pl-4">
                                            <h3 className="text-xl font-bold">Day {dayNum}</h3>
                                            <button
                                                onClick={() => { setActiveDayForActivity(dayNum); setIsActivityFormOpen(true); }}
                                                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium bg-primary/10 px-3 py-1.5 rounded-lg"
                                            >
                                                <Plus size={16} />
                                                Add Activity
                                            </button>
                                        </div>

                                        <div className="space-y-3 pl-4">
                                            {dayActivities.length > 0 ? (
                                                dayActivities.sort((a, b) => a.time.localeCompare(b.time)).map((act, index) => (
                                                    <div key={index} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface/40 hover:bg-surface/60 transition-colors border border-white/5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface/50 text-text-muted text-xs font-bold border border-white/5">
                                                                <Clock size={14} className="mb-0.5" />
                                                                {act.time || '--:--'}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold">{act.name}</h4>
                                                                <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-white/5 border border-white/5 capitalize">{act.type}</span>
                                                            </div>
                                                        </div>
                                                        <div className="font-mono text-emerald-400 flex items-center">
                                                            <DollarSign size={14} />
                                                            {act.cost}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl text-text-muted text-sm">
                                                    No activities planned for Day {dayNum}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ActivityForm
                isOpen={isActivityFormOpen}
                onClose={() => setIsActivityFormOpen(false)}
                onSubmit={handleAddActivity}
                day={activeDayForActivity}
            />
        </div>
    );
};

export default ItineraryBuilder;
