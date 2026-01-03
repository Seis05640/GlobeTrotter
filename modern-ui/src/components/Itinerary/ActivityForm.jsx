import { useState } from 'react';
import { X, Clock, DollarSign, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityForm = ({ isOpen, onClose, onSubmit, day }) => {
    const [activity, setActivity] = useState({
        name: '',
        time: '',
        cost: '',
        type: 'sightseeing'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...activity,
            cost: Number(activity.cost) || 0
        });
        setActivity({ name: '', time: '', cost: '', type: 'sightseeing' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-md p-6 rounded-2xl relative z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6">Add Activity for Day {day}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Activity Name</label>
                        <input
                            type="text"
                            required
                            value={activity.name}
                            onChange={e => setActivity({ ...activity, name: e.target.value })}
                            className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                            placeholder="e.g. Dinner at Sky Bar"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Time</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="time"
                                    required
                                    value={activity.time}
                                    onChange={e => setActivity({ ...activity, time: e.target.value })}
                                    className="w-full bg-surface/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Cost</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="number"
                                    min="0"
                                    value={activity.cost}
                                    onChange={e => setActivity({ ...activity, cost: e.target.value })}
                                    className="w-full bg-surface/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-text-muted mb-1">Type</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <select
                                value={activity.type}
                                onChange={e => setActivity({ ...activity, type: e.target.value })}
                                className="w-full bg-surface/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary appearance-none text-white"
                            >
                                <option value="sightseeing">Sightseeing</option>
                                <option value="food">Food & Drink</option>
                                <option value="transport">Transport</option>
                                <option value="shopping">Shopping</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 mt-4"
                    >
                        Add Activity
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ActivityForm;
