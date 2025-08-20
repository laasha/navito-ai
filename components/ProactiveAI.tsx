import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import { LifeItem } from '../types';
import LifeItemEditModal from './LifeItemEditModal';

const CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds

const ProactiveAI: React.FC = () => {
    const { lifeItems, biometricData } = useAppContext();
    const { addToast } = useToast();
    const { openModal } = useModal();
    const [notifiedGoalIds, setNotifiedGoalIds] = useState<Set<string>>(new Set());

    const triggerGoalNotification = useCallback(() => {
        const now = dayjs();
        const upcomingDeadline = now.add(7, 'day');

        const candidateGoals = lifeItems.filter(item => 
            item.type === 'goal' &&
            dayjs(item.dateISO).isAfter(now) &&
            dayjs(item.dateISO).isBefore(upcomingDeadline) &&
            !notifiedGoalIds.has(item.id)
        );

        for (const goal of candidateGoals) {
            const lastUpdate = dayjs(goal.updatedAt);
            if (now.diff(lastUpdate, 'day') >= 3) {
                addToast(
                    `მიზნის "${goal.title}" ვადა ახლოვდება.`,
                    'info',
                    {
                        label: 'პროგრესის დამატება',
                        onClick: () => {
                            openModal(<LifeItemEditModal itemToEdit={goal} />);
                        }
                    }
                );
                setNotifiedGoalIds(prev => new Set(prev).add(goal.id));
                return; // Only notify one goal per check
            }
        }
    }, [lifeItems, notifiedGoalIds, addToast, openModal]);

    const triggerVitalsNotification = useCallback(() => {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const lastToastDate = sessionStorage.getItem('vitalsToastDate');
        if (lastToastDate === todayStr) return;

        const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        const yesterdayData = biometricData.find(d => d.dateISO === yesterdayStr);

        if (yesterdayData && yesterdayData.sleepHours < 6) {
            addToast(`შევამჩნიე, რომ გუშინ ცუდად გეძინათ (${yesterdayData.sleepHours}სთ). ეცადეთ, დღეს დაისვენოთ.`, 'info');
            sessionStorage.setItem('vitalsToastDate', todayStr);
        }
    }, [biometricData, addToast]);


    useEffect(() => {
        const timerId = setInterval(() => {
            if (lifeItems.length > 0) triggerGoalNotification();
            if (biometricData.length > 0) triggerVitalsNotification();
        }, CHECK_INTERVAL);
        
        return () => clearInterval(timerId);
    }, [triggerGoalNotification, triggerVitalsNotification, lifeItems.length, biometricData.length]);

    // This component does not render anything
    return null;
};

export default ProactiveAI;