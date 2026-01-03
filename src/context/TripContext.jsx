import { createContext, useContext, useState } from 'react';

const TripContext = createContext();

export const useTrip = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
    const [trip, setTrip] = useState({
        title: 'European Summer',
        startDate: '2024-06-15',
        cities: [
            {
                id: 1,
                name: 'Paris',
                days: 3,
                activities: [
                    { day: 1, items: [{ name: 'Arrival', type: 'transport', time: '10:00', cost: 150 }] },
                    { day: 1, items: [{ name: 'Seine Cruise', type: 'sightseeing', time: '19:00', cost: 25 }] },
                    { day: 2, items: [{ name: 'Louvre Museum', type: 'sightseeing', time: '10:00', cost: 17 }] },
                    { day: 2, items: [{ name: 'Le Marais Food Tour', type: 'food', time: '13:00', cost: 85 }] },
                    { day: 3, items: [{ name: 'Versailles', type: 'sightseeing', time: '09:00', cost: 45 }] }
                ]
            },
            {
                id: 2,
                name: 'Rome',
                days: 4,
                activities: [
                    { day: 1, items: [{ name: 'Colosseum', type: 'sightseeing', time: '11:00', cost: 30 }] },
                    { day: 1, items: [{ name: 'Pasta Making Class', type: 'food', time: '17:00', cost: 60 }] }
                ]
            }
        ]
    });

    const addCity = (name) => {
        const newCity = {
            id: Date.now(),
            name,
            days: 2,
            activities: []
        };
        setTrip(prev => ({ ...prev, cities: [...prev.cities, newCity] }));
    };

    const updateCityDays = (id, delta) => {
        setTrip(prev => ({
            ...prev,
            cities: prev.cities.map(c =>
                c.id === id ? { ...c, days: Math.max(1, c.days + delta) } : c
            )
        }));
    };

    const addActivity = (cityId, day, activity) => {
        setTrip(prev => ({
            ...prev,
            cities: prev.cities.map(c => {
                if (c.id === cityId) {
                    const existingDayActivities = c.activities.find(a => a.day === day);
                    let newActivities;
                    if (existingDayActivities) {
                        newActivities = c.activities.map(a =>
                            a.day === day
                                ? { ...a, items: [...a.items, activity] }
                                : a
                        );
                    } else {
                        newActivities = [...c.activities, { day, items: [activity] }];
                    }
                    return { ...c, activities: newActivities };
                }
                return c;
            })
        }));
    };

    return (
        <TripContext.Provider value={{ trip, addCity, updateCityDays, addActivity }}>
            {children}
        </TripContext.Provider>
    );
};
