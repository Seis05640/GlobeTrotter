import { useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const TripCalendar = () => {
    const { trip } = useTrip();

    const calendarData = useMemo(() => {
        if (!trip.startDate) return [];

        const start = new Date(trip.startDate);
        const days = [];

        // Calculate total duration roughly or just iterate through cities
        let currentDayOffset = 0;

        trip.cities.forEach(city => {
            for (let i = 1; i <= city.days; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + currentDayOffset);

                const activities = city.activities.find(a => a.day === i)?.items || [];

                days.push({
                    date: date,
                    dayNum: date.getDate(),
                    month: date.toLocaleString('default', { month: 'short' }),
                    weekday: date.toLocaleString('default', { weekday: 'short' }),
                    city: city.name,
                    activities,
                    isFirstDayOfCity: i === 1
                });

                currentDayOffset++;
            }
        });

        return days;
    }, [trip]);

    return (
        <div className="space-y-8 pb-20">
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-2">Trip Timeline</h2>
                    <p className="text-text-muted">Visual overview of your journey</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="glass p-6 rounded-2xl overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-7 gap-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center py-2 text-text-muted font-bold uppercase text-sm tracking-wider border-b border-white/10">
                            {day}
                        </div>
                    ))}

                    {/* Padding for start day of week if needed - simplified for demo to start lists */}
                    {/* Actually let's just show a linear timeline or list if calendar logic is too complex for 'Wow' in short time.
              But User asked for "Calendar / timeline view". A calendar grid is standard.
              I will mock the offset for the first date.
          */}
                    {Array.from({ length: new Date(calendarData[0]?.date).getDay() || 0 }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-32 bg-white/5 rounded-xl opacity-50"></div>
                    ))}

                    {calendarData.map((day, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`min-h-[140px] p-3 rounded-xl border border-white/5 relative group transition-all hover:bg-white/5 ${day.isFirstDayOfCity ? 'bg-white/5 ring-1 ring-primary/50' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-lg">{day.dayNum}</span>
                                <span className="text-xs text-text-muted uppercase">{day.month}</span>
                            </div>

                            {day.isFirstDayOfCity && (
                                <div className="flex items-center gap-1 text-xs font-bold text-secondary mb-2 bg-secondary/10 py-1 px-2 rounded-lg w-fit">
                                    <MapPin size={10} />
                                    {day.city}
                                </div>
                            )}

                            <div className="space-y-1">
                                {day.activities.slice(0, 3).map((act, i) => (
                                    <div key={i} className="text-xs truncate px-1.5 py-0.5 rounded bg-surface/80 border border-white/5 text-text-muted">
                                        {act.name}
                                    </div>
                                ))}
                                {day.activities.length > 3 && (
                                    <div className="text-xs text-text-muted text-center italic">
                                        +{day.activities.length - 3} more
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TripCalendar;
