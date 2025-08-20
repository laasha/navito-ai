



import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useAppContext } from '../context/AppContext';
import { LifeItem, LifeItemType, UserSettings, TimelinePattern, ProjectedMoodPoint, Annotation } from '../types';
import { useModal } from '../context/ModalContext';
import LifeItemEditModal from './LifeItemEditModal';
import { useToast } from '../context/ToastContext';
import GoalActionModal from './modal/GoalActionModal';

dayjs.extend(isBetween);

interface LifeWaveCanvasProps {
    zoomLevel: number;
    setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
    centerDate: dayjs.Dayjs;
    setCenterDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>;
    displayedItems: LifeItem[];
    storyFocusId: string | null;
    setStoryFocusId: (id: string | null) => void;
    showIntensity: boolean;
    showFinancial: boolean;
    allAnnotations: Annotation[];
    onAddAnnotation: (date: dayjs.Dayjs) => void;
    aiPatterns: TimelinePattern[];
    projectedMood: ProjectedMoodPoint[];
    comparisonDate: dayjs.Dayjs | null;
}


// --- Constants ---
const ZOOM_LEVELS = [{ name: '24 საათი', durationDays: 1 }, { name: '1 კვირა', durationDays: 7 }, { name: '1 თვე', durationDays: 30 }, { name: '1 წელი', durationDays: 365 }, { name: 'მთელი ცხოვრება', durationDays: 365 * 80 }];
const WAVE_AMPLITUDE = 50;
const WAVE_FREQUENCY_BASE = 0.005;
const PIN_RADIUS = 5;
const MOOD_COLORS = { negative: { r: 0, g: 120, b: 255 }, positive: { r: 255, g: 46, b: 209 }};
const INTENSITY_COLORS = { stress: { r: 255, g: 87, b: 51 }, flow: { r: 46, g: 204, b: 113 } };
const ANTICIPATION_COLORS = { anxiety: { r: 255, g: 193, b: 7 }, excitement: { r: 233, g: 30, b: 99 } };

// --- Pure Helper Functions ---
const getYOffset = (timePoint: number) => (Math.sin(timePoint * WAVE_FREQUENCY_BASE * 5 + 1) * 0.3 + Math.cos(timePoint * WAVE_FREQUENCY_BASE * 3 - 0.5) * 0.25 + Math.sin(timePoint * WAVE_FREQUENCY_BASE * 10 - 2) * 0.2) * WAVE_AMPLITUDE;

const findPinAtCoords = (mouseX: number, mouseY: number, pins: any[]) => {
    for (let i = pins.length - 1; i >= 0; i--) {
        const pin = pins[i];
        if (pin._renderX === undefined || pin._renderY === undefined) continue;
        const dist = Math.sqrt((mouseX - pin._renderX)**2 + (mouseY - pin._renderY)**2);
        if (dist <= PIN_RADIUS + 5) return pin;
    }
    return null;
};

// --- Main Component ---
const LifeWaveCanvas: React.FC<LifeWaveCanvasProps> = ({ 
    zoomLevel, setZoomLevel, centerDate, setCenterDate, displayedItems, storyFocusId, setStoryFocusId, 
    showIntensity, showFinancial, allAnnotations, onAddAnnotation, aiPatterns, projectedMood, comparisonDate
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { lifeItems, userSettings, addOrUpdateLifeItem, getLifeItemById, getStoryItems } = useAppContext();
    const { openModal } = useModal();
    const { addToast } = useToast();
    
    const renderState = useRef({
        animationFrameId: 0,
        pins: [] as any[],
        activeTooltipPin: null as any | null,
        isPanning: false,
        isDraggingPin: false,
        draggingPin: null as any | null,
        lastPanX: 0,
        panOffset: 0,
        canvas: null as HTMLCanvasElement | null,
        ctx: null as CanvasRenderingContext2D | null,
        storyExitButton: { x: 0, y: 0, width: 0, height: 0, visible: false },
    }).current;

    const story = useMemo(() => {
        if (!storyFocusId) return null;
        const startItem = getLifeItemById(storyFocusId);
        const items = getStoryItems(storyFocusId);
        return { startItem, items };
    }, [storyFocusId, getLifeItemById, getStoryItems]);

    const getPinColor = useCallback((item: LifeItem, settings: UserSettings) => {
        const category = settings.categories.find(c => c.id === item.category);
        return category ? category.color : 'var(--brand-color)';
    }, []);
    
    const moodDataPoints = useMemo(() => lifeItems.filter(item => typeof item.mood === 'number').map(item => ({ date: dayjs(item.dateISO), mood: item.mood })).sort((a,b) => a.date.valueOf() - b.date.valueOf()), [lifeItems]);
    const intensityDataPoints = useMemo(() => lifeItems.filter(item => item.payload?.slug === 'intensity-log' && typeof item.payload.intensity === 'number').map(item => ({ date: dayjs(item.dateISO), intensity: item.payload.intensity! })).sort((a, b) => a.date.valueOf() - b.date.valueOf()), [lifeItems]);
    const futureAnticipationItems = useMemo(() => lifeItems.filter(item => dayjs(item.dateISO).isAfter(dayjs()) && typeof item.payload?.anticipation === 'number' && item.payload.anticipation !== 0), [lifeItems]);


    const draw = useCallback(() => {
        const { ctx, canvas } = renderState;
        if (!ctx || !canvas) return;
        
        const currentZoom = ZOOM_LEVELS[zoomLevel];
        const daysPerPixel = currentZoom.durationDays / canvas.width;
        const viewCenterDate = centerDate.subtract(renderState.panOffset * daysPerPixel, 'day');
        const centerY = canvas.height / 2;

        const dateToX = (date: dayjs.Dayjs | Date) => {
            const totalDurationMs = currentZoom.durationDays * 24 * 60 * 60 * 1000;
            const viewStartDate = viewCenterDate.subtract(currentZoom.durationDays / 2, 'day');
            return ((dayjs(date).valueOf() - viewStartDate.valueOf()) / totalDurationMs) * canvas.width;
        };
        const xToDate = (x: number) => {
            const totalDurationMs = currentZoom.durationDays * 24 * 60 * 60 * 1000;
            const viewStartDate = viewCenterDate.subtract(currentZoom.durationDays / 2, 'day');
            return dayjs(viewStartDate.valueOf() + (x / canvas.width) * totalDurationMs);
        };

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawGrid(ctx, canvas, dateToX, xToDate);
        if (showIntensity) {
            drawIntensityOverlay(ctx, canvas, xToDate, dateToX, intensityDataPoints);
        }
        if (showFinancial) {
            drawFinancialLayer(ctx, canvas, lifeItems, dateToX);
        }
        drawWave(ctx, canvas, xToDate, moodDataPoints, futureAnticipationItems, dateToX, userSettings);
        if(comparisonDate) {
             drawComparisonWave(ctx, canvas, moodDataPoints, dateToX, comparisonDate);
        }
        drawProjectedMood(ctx, canvas, projectedMood, dateToX);
        
        renderState.pins = calculatePinPositions(displayedItems, dateToX, centerY);
        drawGoalTrajectories(ctx, renderState.pins, userSettings, getPinColor, dateToX, centerY);
        
        drawLifeChapters(ctx, canvas, lifeItems, dateToX);
        drawAiPatterns(ctx, canvas, aiPatterns, dateToX);
        
        drawItems(ctx, renderState.pins, userSettings, getPinColor, story?.items || []);
        drawAnnotations(ctx, canvas, allAnnotations, dateToX, renderState.activeTooltipPin);
        
        drawTodayMarker(ctx, canvas, dateToX);
        drawStoryOverlay(ctx, canvas, story, renderState);
        drawTooltip(ctx, canvas.width, renderState.activeTooltipPin);
        
        renderState.animationFrameId = requestAnimationFrame(draw);
    }, [zoomLevel, centerDate, displayedItems, moodDataPoints, userSettings, getPinColor, renderState, story, showIntensity, intensityDataPoints, futureAnticipationItems, lifeItems, showFinancial, allAnnotations, aiPatterns, projectedMood, comparisonDate]);

    useEffect(() => {
        if (story) {
            if (story.items.length > 0) {
                const dates = story.items.map(i => dayjs(i.dateISO));
                const minDate = dayjs(Math.min(...dates.map(d => d.valueOf())));
                const maxDate = dayjs(Math.max(...dates.map(d => d.valueOf())));
                
                const newCenterDate = minDate.add(maxDate.diff(minDate) / 2, 'millisecond');
                setCenterDate(newCenterDate);

                const durationDays = Math.max(1, maxDate.diff(minDate, 'day'));
                if (durationDays < 2) setZoomLevel(0);
                else if (durationDays < 10) setZoomLevel(1);
                else if (durationDays < 60) setZoomLevel(2);
                else if (durationDays < 500) setZoomLevel(3);
                else setZoomLevel(4);
            }
        }
    }, [story, setCenterDate, setZoomLevel]);

    useEffect(() => {
        renderState.canvas = canvasRef.current;
        if (!renderState.canvas) return;
        renderState.ctx = renderState.canvas.getContext('2d');
        let isMounted = true;
        
        const resizeCanvas = () => {
            if (renderState.canvas?.parentElement) { 
                renderState.canvas.width = renderState.canvas.parentElement.clientWidth; 
                renderState.canvas.height = renderState.canvas.parentElement.clientHeight; 
            }
        };

        const xToDate = (x: number) => {
            if (!renderState.canvas) return dayjs();
            const currentZoom = ZOOM_LEVELS[zoomLevel];
            const daysPerPixel = currentZoom.durationDays / renderState.canvas.width;
            const viewCenterDate = centerDate.subtract(renderState.panOffset * daysPerPixel, 'day');
            const totalDurationMs = currentZoom.durationDays * 24 * 60 * 60 * 1000;
            const viewStartDate = viewCenterDate.subtract(currentZoom.durationDays / 2, 'day');
            return dayjs(viewStartDate.valueOf() + (x / renderState.canvas.width) * totalDurationMs);
        };

        const onMouseDown = (e: MouseEvent) => {
            if(!renderState.canvas) return;
            const { storyExitButton } = renderState;
            if (storyExitButton.visible && e.offsetX >= storyExitButton.x && e.offsetX <= storyExitButton.x + storyExitButton.width && e.offsetY >= storyExitButton.y && e.offsetY <= storyExitButton.y + storyExitButton.height) {
                setStoryFocusId(null);
                return;
            }
            const pin = findPinAtCoords(e.offsetX, e.offsetY, renderState.pins);
            if (pin) {
                renderState.isDraggingPin = true;
                renderState.draggingPin = pin;
                renderState.canvas.style.cursor = 'grabbing';
            } else { 
                renderState.isPanning = true; 
                renderState.lastPanX = e.clientX; 
                renderState.canvas.style.cursor = 'grabbing'; 
            }
        };

        const onMouseMove = (e: MouseEvent) => {
            if(!renderState.canvas) return;
            if (renderState.isDraggingPin && renderState.draggingPin) {
                 renderState.draggingPin._renderX = e.offsetX;
            }
            else if (renderState.isPanning) {
                const dx = e.clientX - renderState.lastPanX;
                renderState.lastPanX = e.clientX;
                renderState.panOffset -= dx;
            } else {
                const { storyExitButton } = renderState;
                 if (storyExitButton.visible && e.offsetX >= storyExitButton.x && e.offsetX <= storyExitButton.x + storyExitButton.width && e.offsetY >= storyExitButton.y && e.offsetY <= storyExitButton.y + storyExitButton.height) {
                    renderState.canvas.style.cursor = 'pointer';
                    renderState.activeTooltipPin = null;
                 } else {
                    const foundPin = findPinAtCoords(e.offsetX, e.offsetY, renderState.pins);
                    renderState.canvas.style.cursor = foundPin ? 'pointer' : 'grab';
                    renderState.activeTooltipPin = foundPin || null;
                }
            }
        };

        const onMouseUp = async (e: MouseEvent) => { 
            if (renderState.isDraggingPin && renderState.draggingPin) {
                const newDate = xToDate(e.offsetX);
                await addOrUpdateLifeItem({ ...renderState.draggingPin, dateISO: newDate.toISOString() });
                addToast(`'${renderState.draggingPin.title}' გადატანილია ${newDate.format('YYYY-MM-DD')}-ზე`, 'success');
                renderState.isDraggingPin = false;
                renderState.draggingPin = null;
            }
            if (renderState.isPanning) {
                const daysPerPixel = ZOOM_LEVELS[zoomLevel].durationDays / (renderState.canvas?.width || 1);
                setCenterDate(d => d.subtract(renderState.panOffset * daysPerPixel, 'day'));
                renderState.panOffset = 0;
            }
            renderState.isPanning = false; 
            if(renderState.canvas) renderState.canvas.style.cursor = 'grab'; 
        };
        
        const onWheel = (e: WheelEvent) => { e.preventDefault(); setZoomLevel(z => e.deltaY > 0 ? Math.min(ZOOM_LEVELS.length - 1, z + 1) : Math.max(0, z - 1)); };
        
        const onDoubleClick = (e: MouseEvent) => {
            if(!renderState.canvas || renderState.isDraggingPin) return;
            const pin = findPinAtCoords(e.offsetX, e.offsetY, renderState.pins);
            if (pin) {
                if (pin.type === 'goal') {
                    openModal(<GoalActionModal item={pin} />);
                } else {
                    openModal(<LifeItemEditModal itemToEdit={pin} />);
                }
            } else {
                const clickedDate = xToDate(e.offsetX);
                onAddAnnotation(clickedDate);
            }
        };

        resizeCanvas();
        if(isMounted) renderState.animationFrameId = requestAnimationFrame(draw);

        window.addEventListener('resize', resizeCanvas);
        renderState.canvas.addEventListener('mousedown', onMouseDown);
        renderState.canvas.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        renderState.canvas.addEventListener('wheel', onWheel, { passive: false });
        renderState.canvas.addEventListener('dblclick', onDoubleClick);

        return () => {
            isMounted = false;
            cancelAnimationFrame(renderState.animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            renderState.canvas?.removeEventListener('mousedown', onMouseDown);
            renderState.canvas?.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            renderState.canvas?.removeEventListener('wheel', onWheel);
            renderState.canvas?.removeEventListener('dblclick', onDoubleClick);
        };
    }, [draw, setCenterDate, zoomLevel, setZoomLevel, centerDate, openModal, renderState, addOrUpdateLifeItem, addToast, setStoryFocusId, onAddAnnotation]);

    return <canvas ref={canvasRef} className="rounded-lg glass-effect w-full h-full" />;
};

// --- Drawing Subroutines ---
const calculatePinPositions = (items: LifeItem[], dateToX: (d: dayjs.Dayjs) => number, centerY: number) => {
    return items.map(item => {
        const pinDate = dayjs(item.dateISO);
        const x = dateToX(pinDate);
        const timePoint = pinDate.valueOf() / (1000 * 60 * 60);
        const y = centerY + getYOffset(timePoint);
        return { ...item, _renderX: x, _renderY: y };
    });
};

const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dateToX: (d: dayjs.Dayjs) => number, xToDate: (x: number) => dayjs.Dayjs) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5; ctx.font = '10px Inter'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.textAlign = 'center';
    const viewStartDate = xToDate(0); const viewEndDate = xToDate(canvas.width);
    const durationDays = viewEndDate.diff(viewStartDate, 'day');
    let incrementUnit: 'hour'|'day'|'month'|'year' = 'day', incrementStep = 1, labelFormat = 'D MMM';
    if(durationDays <= 1) { incrementUnit='hour'; incrementStep=3; labelFormat = 'HH:mm'; }
    else if(durationDays <= 7) { incrementUnit='day'; incrementStep=1; }
    else if(durationDays <= 30*3) { incrementUnit='day'; incrementStep=7; }
    else if(durationDays <= 365*2) { incrementUnit='month'; incrementStep=1; labelFormat='MMM YY'; }
    else { incrementUnit='year'; incrementStep=1; labelFormat='YYYY'; }
    let currentDate = viewStartDate.startOf(incrementUnit === 'hour' ? 'day' : incrementUnit);
    while(currentDate.isBefore(viewEndDate)){
        const x = dateToX(currentDate);
        if(x>=0 && x<=canvas.width){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); ctx.fillText(currentDate.format(labelFormat),x,canvas.height-5); }
        currentDate = currentDate.add(incrementStep,incrementUnit);
    }
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 246, b: 255 }; // Fallback to default brand color
};


const interpolateColor = (val: number, range: number, c1: {r,g,b}, c2: {r,g,b}, cNeutral: {r,g,b}) => {
    const normVal = val / range;
    let startC, endC, mix;
    if (normVal < 0) { startC = c1; endC = cNeutral; mix = 1 + normVal; } 
    else { startC = cNeutral; endC = c2; mix = normVal; }
    return `rgb(${Math.round(startC.r+(endC.r-startC.r)*mix)}, ${Math.round(startC.g+(endC.g-startC.g)*mix)}, ${Math.round(startC.b+(endC.b-startC.b)*mix)})`;
};

const drawWave = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, xToDate: (x: number) => dayjs.Dayjs, moodDataPoints: any[], futureAnticipationItems: LifeItem[], dateToX: (d: dayjs.Dayjs) => number, userSettings: UserSettings) => {
    const centerY = canvas.height / 2;
    const neutralColor = hexToRgb(userSettings.timelineColor);

    const getAverageMoodForDate = (targetDate: dayjs.Dayjs, zoomDurationDays: number) => {
        const influenceDays = Math.max(1, zoomDurationDays / 30);
        const relevantPoints = moodDataPoints.filter(p => Math.abs(p.date.diff(targetDate, 'day')) < influenceDays);
        if (relevantPoints.length === 0) return 0;
        const totalWeight = relevantPoints.reduce((sum, p) => sum + Math.max(0, 1 - (Math.abs(p.date.diff(targetDate, 'day')) / influenceDays)), 0);
        if (totalWeight === 0) return 0;
        const weightedSum = relevantPoints.reduce((sum, p) => sum + p.mood * Math.max(0, 1 - (Math.abs(p.date.diff(targetDate, 'day')) / influenceDays)), 0);
        return weightedSum / totalWeight;
    };
    
    ctx.lineWidth = 3;
    const zoomDurationDays = xToDate(canvas.width).diff(xToDate(0), 'day');
    
    for (let x = 0; x < canvas.width; x++) {
        const currentDate = xToDate(x);
        const nextDate = xToDate(x + 1);
        const currentTimePoint = currentDate.valueOf() / (1000 * 60 * 60);
        const nextTimePoint = nextDate.valueOf() / (1000 * 60 * 60);

        const avgMood = getAverageMoodForDate(currentDate, zoomDurationDays);
        let moodColor = interpolateColor(avgMood, 5, MOOD_COLORS.negative, MOOD_COLORS.positive, neutralColor);
        
        // --- Anticipation Wave Logic ---
        if(currentDate.isAfter(dayjs())) {
            let totalAnticipation = 0;
            let totalWeight = 0;
            futureAnticipationItems.forEach(item => {
                const itemDate = dayjs(item.dateISO);
                const daysUntil = itemDate.diff(currentDate, 'day');
                const anticipationInfluence = 14; // Start showing influence 14 days before
                if (daysUntil > 0 && daysUntil < anticipationInfluence) {
                    const weight = 1 - (daysUntil / anticipationInfluence);
                    totalAnticipation += item.payload.anticipation! * weight;
                    totalWeight += weight;
                }
            });
            if (totalWeight > 0) {
                const avgAnticipation = totalAnticipation / totalWeight;
                const anticipationColor = interpolateColor(avgAnticipation, 5, ANTICIPATION_COLORS.anxiety, ANTICIPATION_COLORS.excitement, {r:128, g:128, b:128});
                
                // Mix mood color with anticipation color
                const moodRgb = moodColor.match(/\d+/g)!.map(Number);
                const antiRgb = anticipationColor.match(/\d+/g)!.map(Number);
                const mixFactor = Math.min(1, totalWeight); // Fade in the anticipation color
                moodColor = `rgb(${Math.round(moodRgb[0]*(1-mixFactor) + antiRgb[0]*mixFactor)}, ${Math.round(moodRgb[1]*(1-mixFactor) + antiRgb[1]*mixFactor)}, ${Math.round(moodRgb[2]*(1-mixFactor) + antiRgb[2]*mixFactor)})`;
            }
        }
        
        ctx.beginPath();
        ctx.moveTo(x, centerY + getYOffset(currentTimePoint));
        ctx.lineTo(x + 1, centerY + getYOffset(nextTimePoint));
        ctx.strokeStyle = moodColor;
        ctx.stroke();
    }
};

const drawIntensityOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, xToDate: (x: number) => dayjs.Dayjs, dateToX: (d: dayjs.Dayjs) => number, intensityDataPoints: any[]) => {
    const getAverageIntensityForDate = (targetDate: dayjs.Dayjs) => {
        const influenceDays = 7;
        const relevantPoints = intensityDataPoints.filter(p => Math.abs(p.date.diff(targetDate, 'day')) < influenceDays);
        if (relevantPoints.length === 0) return 0;
        const totalWeight = relevantPoints.reduce((sum, p) => sum + Math.max(0, 1 - (Math.abs(p.date.diff(targetDate, 'day')) / influenceDays)), 0);
        if (totalWeight === 0) return 0;
        const weightedSum = relevantPoints.reduce((sum, p) => sum + p.intensity * Math.max(0, 1 - (Math.abs(p.date.diff(targetDate, 'day')) / influenceDays)), 0);
        return weightedSum / totalWeight;
    };

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let x = 0; x < canvas.width; x++) {
        const date = xToDate(x);
        const intensity = getAverageIntensityForDate(date);
        const y = canvas.height / 2 - (intensity / 5) * (canvas.height / 3);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    gradient.addColorStop(0, 'rgba(46, 204, 113, 0.3)'); // Flow
    gradient.addColorStop(1, 'rgba(255, 87, 51, 0.3)');  // Stress
    ctx.fillStyle = gradient;
    ctx.fill();
};

const drawLifeChapters = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, lifeItems: LifeItem[], dateToX: (d: dayjs.Dayjs) => number) => {
    const chapters = lifeItems.filter(item => item.payload?.slug === 'life-chapter' && item.payload.endDateISO);
    
    chapters.forEach((chapter, index) => {
        const startX = dateToX(dayjs(chapter.dateISO));
        const endX = dateToX(dayjs(chapter.payload.endDateISO as string));
        
        if (endX < 0 || startX > canvas.width) return;
        
        const clampedStartX = Math.max(0, startX);
        const clampedEndX = Math.min(canvas.width, endX);

        ctx.fillStyle = `hsla(${index * 60}, 70%, 50%, 0.1)`;
        ctx.fillRect(clampedStartX, 0, clampedEndX - clampedStartX, canvas.height);

        ctx.fillStyle = `hsla(${index * 60}, 70%, 80%, 0.8)`;
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.save();
        ctx.translate(clampedStartX + 10, canvas.height - 20);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(chapter.title, 0, 0);
        ctx.restore();
    });
};

const drawItems = (ctx: CanvasRenderingContext2D, pinsToRender: any[], settings: UserSettings, getPinColor: Function, storyItems: LifeItem[]) => {
    const storyItemIds = new Set(storyItems.map(i => i.id));
    const inStoryMode = storyItemIds.size > 0;

    const drawPin = (pin: any) => {
        const { _renderX: x, _renderY: y } = pin;
        if (x < -PIN_RADIUS || x > ctx.canvas.width + PIN_RADIUS) return;
        ctx.beginPath(); ctx.fillStyle = getPinColor(pin, settings);
        switch (pin.type) {
            case 'goal': ctx.rect(x - PIN_RADIUS, y - PIN_RADIUS, PIN_RADIUS * 2, PIN_RADIUS * 2); break;
            case 'exercise': ctx.moveTo(x, y - PIN_RADIUS); ctx.lineTo(x + PIN_RADIUS, y + PIN_RADIUS); ctx.lineTo(x - PIN_RADIUS, y + PIN_RADIUS); ctx.closePath(); break;
            default: ctx.arc(x, y, PIN_RADIUS, 0, Math.PI * 2); break;
        }
        ctx.fill(); ctx.strokeStyle = 'var(--base-color)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    
    // Draw connections
    ctx.strokeStyle = inStoryMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'; 
    ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
    pinsToRender.forEach((pin: any) => {
        pin.connections?.forEach((connectionId: string) => {
            const targetPin = pinsToRender.find(p => p.id === connectionId);
            if (targetPin) { ctx.beginPath(); ctx.moveTo(pin._renderX, pin._renderY); ctx.lineTo(targetPin._renderX, targetPin._renderY); ctx.stroke(); }
        });
    });
    ctx.setLineDash([]);
    
    // Draw pins
    if (inStoryMode) {
        ctx.globalAlpha = 0.15;
        pinsToRender.filter(p => !storyItemIds.has(p.id)).forEach(drawPin);
        ctx.globalAlpha = 1.0;
        pinsToRender.filter(p => storyItemIds.has(p.id)).forEach(drawPin);
    } else {
        pinsToRender.forEach(drawPin);
    }
};

const drawGoalTrajectories = (ctx: CanvasRenderingContext2D, pinsToRender: any[], settings: UserSettings, getPinColor: Function, dateToX: (d: dayjs.Dayjs) => number, centerY: number) => {
    const goals = pinsToRender.filter(i => i.type === 'goal' && i.createdAt);
    goals.forEach((goal: any) => {
        const createdAtPinLike = { ...goal, dateISO: goal.createdAt };
        const tempCalculatedStart = calculatePinPositions([createdAtPinLike], dateToX, centerY)[0];
        if (!tempCalculatedStart || !goal) return;

        const { _renderX: x1, _renderY: y1 } = tempCalculatedStart;
        const { _renderX: x2, _renderY: y2 } = goal;
        
        if (x2 < 0 || x1 > ctx.canvas.width || Math.abs(x1 - x2) < 2) return;
        
        const controlX = (x1 + x2) / 2;
        const controlY = Math.min(y1, y2) - Math.abs(x1 - x2) * 0.1 - 20;
        ctx.beginPath(); ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(controlX, controlY, x2, y2);
        ctx.strokeStyle = `${getPinColor(goal, settings)}80`;
        ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
    });
};

const drawTodayMarker = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dateToX: Function) => {
    const todayX = dateToX(dayjs());
    if (todayX >= 0 && todayX <= canvas.width) {
        ctx.beginPath(); ctx.moveTo(todayX, 0); ctx.lineTo(todayX, canvas.height);
        ctx.strokeStyle = 'rgba(0, 246, 255, 0.9)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(0, 246, 255, 0.9)';
        const pulseSize = (Math.sin(Date.now() * 0.005) + 1) * 2.5;
        ctx.beginPath(); ctx.arc(todayX, 15, 5 + pulseSize, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center'; ctx.fillText('დღეს', todayX, 35);
    }
};

const drawStoryOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, story: { startItem: LifeItem | undefined, items: LifeItem[] } | null, renderState: any) => {
    if (!story || !story.startItem) {
        renderState.storyExitButton.visible = false;
        return;
    }
    
    const text = `ფოკუსი: ${story.startItem.title}`;
    ctx.font = '14px Inter';
    const metrics = ctx.measureText(text);
    const padding = 10;
    const buttonWidth = 20;
    const width = metrics.width + padding * 2 + buttonWidth + 5;
    const height = 30;
    const x = 15;
    const y = 15;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padding, y + height / 2);
    
    const exitX = x + width - buttonWidth - padding / 2;
    const exitY = y + height / 2;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(exitX - 5, exitY - 5); ctx.lineTo(exitX + 5, exitY + 5);
    ctx.moveTo(exitX + 5, exitY - 5); ctx.lineTo(exitX - 5, exitY + 5);
    ctx.stroke();

    renderState.storyExitButton = { x: exitX - 10, y: y, width: 20 + padding, height: height, visible: true };
};

const drawTooltip = (ctx: CanvasRenderingContext2D, canvasWidth: number, activePin: any) => {
    if (activePin && activePin._renderX !== undefined) {
         const { _renderX: x, _renderY: y } = activePin;
         const text = `${activePin.title} (${dayjs(activePin.dateISO).format('DD MMM')})`;
         ctx.font = '12px Inter';
         const metrics = ctx.measureText(text);
         const width = metrics.width + 20; const height = 30;
         let tooltipX = x + 15; let tooltipY = y - height - 10;
         if (tooltipX + width > canvasWidth) tooltipX = x - width - 15;
         if (tooltipY < 0) tooltipY = y + 15;
         ctx.fillStyle = 'rgba(0,0,0,0.8)'; 
         ctx.beginPath();
         ctx.roundRect(tooltipX, tooltipY, width, height, 5);
         ctx.fill();
         ctx.fillStyle = 'white'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, tooltipX + 10, tooltipY + height / 2);
    }
};

const drawFinancialLayer = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, lifeItems: LifeItem[], dateToX: (d: dayjs.Dayjs) => number) => {
    const financialItems = lifeItems.filter(i => i.type === 'financial' && i.payload.amount);
    if (financialItems.length === 0) return;

    let balance = 0;
    const balancePoints: {x: number, y: number}[] = [];
    const sortedItems = [...financialItems].sort((a,b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf());

    sortedItems.forEach(item => {
        balance += item.payload.transactionType === 'income' ? item.payload.amount! : -item.payload.amount!;
        balancePoints.push({ x: dateToX(dayjs(item.dateISO)), y: balance });
    });

    if (balancePoints.length < 2) return;

    const maxBalance = Math.max(...balancePoints.map(p => Math.abs(p.y)));
    const scale = (canvas.height / 2.5) / maxBalance;
    const centerY = canvas.height - 50; // Draw near bottom

    ctx.beginPath();
    ctx.moveTo(balancePoints[0].x, centerY - balancePoints[0].y * scale);
    for (let i = 1; i < balancePoints.length; i++) {
        ctx.lineTo(balancePoints[i].x, centerY - balancePoints[i].y * scale);
    }
    ctx.strokeStyle = 'rgba(39, 174, 96, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
};

const drawAnnotations = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, annotations: Annotation[], dateToX: (d: dayjs.Dayjs) => number, activePin: any) => {
    annotations.forEach(anno => {
        const x = dateToX(dayjs(anno.dateISO));
        if (x < 0 || x > canvas.width) return;
        
        ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 10);
        ctx.lineTo(x-3, 13);
        ctx.lineTo(x+3, 13);
        ctx.closePath();
        ctx.fill();

        if (activePin && activePin.id === anno.id) {
            // Draw full text if hovered, but there's no hover detection for annotations yet.
        }
    });
};

const drawAiPatterns = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, patterns: TimelinePattern[], dateToX: (d: dayjs.Dayjs) => number) => {
    patterns.forEach((pattern, i) => {
        const startX = dateToX(dayjs(pattern.startDateISO));
        const endX = dateToX(dayjs(pattern.endDateISO));
        if (endX < 0 || startX > canvas.width) return;

        const colors = {
            positive: 'rgba(46, 204, 113, 0.2)',
            negative: 'rgba(231, 76, 60, 0.2)',
            insight: 'rgba(52, 152, 219, 0.2)',
        };
        ctx.fillStyle = colors[pattern.type];
        ctx.fillRect(startX, 0, endX-startX, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`💡 ${pattern.description}`, startX + 5, 15 + i * 15);
    });
};

const drawProjectedMood = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, moodPoints: ProjectedMoodPoint[], dateToX: (d: dayjs.Dayjs) => number) => {
    if (moodPoints.length < 2) return;
    const centerY = canvas.height / 2;
    ctx.beginPath();
    const firstPoint = moodPoints[0];
    const startX = dateToX(dayjs(firstPoint.dateISO));
    const startY = centerY - (firstPoint.mood / 5) * WAVE_AMPLITUDE;
    ctx.moveTo(startX, startY);
    
    moodPoints.forEach(point => {
        const x = dateToX(dayjs(point.dateISO));
        const y = centerY - (point.mood / 5) * WAVE_AMPLITUDE; // simplified Y
        ctx.lineTo(x, y);
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
};

const drawComparisonWave = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, moodDataPoints: any[], dateToX: (d: dayjs.Dayjs) => number, comparisonDate: dayjs.Dayjs) => {
    const centerY = canvas.height / 2;
    const zoomDurationDays = ZOOM_LEVELS[useMemo(() => {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        return parseInt(urlParams.get('zoomLevel') || '2', 10);
    }, [])].durationDays;
    
    const getAverageMoodForDate = (targetDate: dayjs.Dayjs) => {
        const influenceDays = Math.max(1, zoomDurationDays / 30);
        const relevantPoints = moodDataPoints.filter(p => Math.abs(p.date.diff(targetDate, 'day')) < influenceDays);
        if (relevantPoints.length === 0) return 0;
        const totalWeight = relevantPoints.reduce((sum, p) => sum + Math.max(0, 1 - (Math.abs(p.date.diff(targetDate, 'day')) / influenceDays)), 0);
        if (totalWeight === 0) return 0;
        const weightedSum = relevantPoints.reduce((sum, p) => sum + p.mood * Math.max(0, 1 - (Math.abs(p.date.diff(targetDate, 'day')) / influenceDays)), 0);
        return weightedSum / totalWeight;
    };
    
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        const currentViewDate = dateToX(dayjs(comparisonDate).add(x / canvas.width * zoomDurationDays, 'day'));
        const avgMood = getAverageMoodForDate(dayjs(currentViewDate));
        const y = centerY + (avgMood / 5) * WAVE_AMPLITUDE;
        if(x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)'; // Orange
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
};

export default LifeWaveCanvas;