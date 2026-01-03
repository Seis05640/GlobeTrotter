import { useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { DollarSign, PieChart, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const BudgetDashboard = () => {
    const { trip } = useTrip();

    const budgetData = useMemo(() => {
        let total = 0;
        const categoryBreakdown = {};
        const cityBreakdown = {};

        trip.cities.forEach(city => {
            let cityTotal = 0;
            city.activities.forEach(day => {
                day.items.forEach(item => {
                    const cost = item.cost || 0;
                    total += cost;
                    cityTotal += cost;

                    const type = item.type || 'other';
                    categoryBreakdown[type] = (categoryBreakdown[type] || 0) + cost;
                });
            });
            cityBreakdown[city.name] = cityTotal;
        });

        return { total, categoryBreakdown, cityBreakdown };
    }, [trip]);

    // Mock max budget
    const maxBudget = 5000;
    const percentage = Math.min(100, Math.round((budgetData.total / maxBudget) * 100));

    return (
        <div className="space-y-8 pb-20">
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h2 className="text-4xl font-bold mb-2">Budget Overview</h2>
                        <p className="text-text-muted">Manage your expenses smart & easy</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-muted mb-1">Total Estimated Cost</p>
                        <div className="text-5xl font-mono font-bold text-emerald-400 flex items-center justify-end">
                            <span className="text-2xl mr-1">$</span>
                            {budgetData.total.toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Progress Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-6 rounded-2xl col-span-1 md:col-span-3 lg:col-span-1"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CreditCard size={20} />
                        </div>
                        <h3 className="text-lg font-bold">Budget Health</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Spent so far</span>
                            <span className="font-bold">{percentage}%</span>
                        </div>
                        <div className="h-4 bg-surface rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${percentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                            ></motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-text-muted">
                            <span>$0</span>
                            <span>${maxBudget.toLocaleString()} (Budget)</span>
                        </div>
                    </div>
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-2xl col-span-1 md:col-span-1 lg:col-span-1"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <PieChart size={20} />
                        </div>
                        <h3 className="text-lg font-bold">By Category</h3>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(budgetData.categoryBreakdown).map(([cat, amount], i) => (
                            <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="capitalize">{cat}</span>
                                    <span className="font-mono text-xs">${amount}</span>
                                </div>
                                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(amount / budgetData.total) * 100}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="h-full bg-blue-400/80 rounded-full"
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(budgetData.categoryBreakdown).length === 0 && (
                            <p className="text-sm text-text-muted italic">No expenses yet.</p>
                        )}
                    </div>
                </motion.div>

                {/* City Breakdown */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass p-6 rounded-2xl col-span-1 md:col-span-2 lg:col-span-1"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-lg font-bold">By City</h3>
                    </div>

                    <div className="space-y-3">
                        {Object.entries(budgetData.cityBreakdown).map(([city, amount], i) => (
                            <div key={city} className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">
                                        {city.charAt(0)}
                                    </div>
                                    <span className="font-medium">{city}</span>
                                </div>
                                <span className="font-mono font-bold">${amount}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BudgetDashboard;
