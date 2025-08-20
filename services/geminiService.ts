
import { GoogleGenAI, Type } from "@google/genai";
import { LifeItem, Habit, ThematicReview, SpecificInsightType, ParsedNaturalInput, ProactiveInsight, SmartDecompositionResponse, PersonalSystem, Scenario, SummarizedContent, GeneratedValuesResponse, CoreValue, Program, DailyBriefing, QuarterlyReviewReport, HolisticCorrelationReport, GoalInsightReport, LifeWheelAnalysis, ChatMessage, MoodHabitCorrelation, MindBodyInsight, RelatedHabitsResponse, UniversalSearchResponse, EpochGoal, ValuePromptResponse, CognitiveReframesResponse, StoicPromptResponse, ProjectPremortemResponse, HighlightReelResponse, IdeaCatalystResponse, GoalLadderResponse, IdealWeekResponse, SkillPlanResponse, ProjectKickstartResponse, HabitStackResponse, AntiGoalResponse, ResourceCuratorResponse, WeeklyDigestReport, ToolSuggestionResponse, TimelinePattern, ProjectedMoodPoint } from '../types';
import dayjs from 'dayjs';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateContentWithRetry = async (params: any) => {
    if (!API_KEY) throw new Error("AI გასაღები კონფიგურირებული არ არის.");
    try {
        const response = await ai.models.generateContent(params);
        return response.text;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(`AI სერვისთან დაკავშირებისას პრობლემა შეიქმნა: ${error.message}`);
    }
}

export const getConversationalResponse = async (history: ChatMessage[], dataContext: string): Promise<string> => {
    let prompt = `Conversation History:\n`;
    history.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    });
    prompt += `Assistant: `; // Prompt Gemini to complete the response.

    return generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: `You are Navito Co-Pilot, an advanced, integrated AI life assistant. Your purpose is to provide deep, contextual insights and help the user manage their life data. You have access to a snapshot of the user's data. Be proactive, insightful, and conversational. Use the provided data to answer questions, generate ideas, and offer assistance. If the data is insufficient, state that. Respond in Georgian, using markdown for formatting when appropriate.\n\nUser Data Context:\n${dataContext}`
        }
    });
};


export const getChatResponse = async (prompt: string): Promise<string> => {
  return generateContentWithRetry({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "You are Navito-Guide, an empathetic assistant. Respond warmly and briefly in Georgian.",
    }
  });
};

export const getAIHintForExercise = async (slug: string, currentData: any, userQuestion: string | null): Promise<string> => {
  const prompt = `Provide a helpful tip for the self-reflection exercise named "${slug}". The user's current data for this exercise is: ${JSON.stringify(currentData)}. The user's specific question is: ${userQuestion || "None"}. Keep your response concise, actionable, and in Georgian.`;
  return generateContentWithRetry({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
};

export const generateMonthlyReview = async (monthItems: LifeItem[], monthHabits: { name: string, count: number }[], month: dayjs.Dayjs): Promise<string> => {
  let summary = `თვის მიმოხილვა: ${month.format('MMMM YYYY')}\n\n`;
  summary += `**მოვლენები და სავარჯიშოები:**\n`;
  if (monthItems.length > 0) {
      monthItems.forEach(item => {
          summary += `- ${dayjs(item.dateISO).format('DD/MM')}: ${item.title} (ტიპი: ${item.type}, განწყობა: ${item.mood || 'N/A'})\n`;
      });
  } else {
      summary += "ამ თვეში მოვლენები არ დაფიქსირებულა.\n";
  }
  
  summary += `\n**ჩვევების სტატისტიკა:**\n`;
  if (monthHabits.length > 0) {
      monthHabits.forEach(habit => {
          summary += `- ${habit.name}: შესრულდა ${habit.count} ჯერ\n`;
      });
  } else {
      summary += "ამ თვეში ჩვევების აქტივობა არ დაფიქსირებულა.\n";
  }

  const prompt = `You are Navito-Guide, an empathetic AI coach. Based on the following data summary for ${month.format('MMMM YYYY')}, write a thoughtful and encouraging review in Georgian. Identify potential patterns (e.g., 'it seems that when you focused on [habit], your mood was higher'), highlight key achievements, and suggest one gentle question for reflection for the upcoming month. Keep the tone warm and personal. Here is the data: \n\n${summary}`;

  return generateContentWithRetry({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
};

export const generateDailyReview = async (daySummary: string): Promise<string> => {
    const prompt = `You are Navito-Guide, an empathetic and observant friend. Based on the following summary of the user's day, write a short, warm, and insightful review in Georgian. Connect different events if possible, celebrate small wins, and end with a gentle, open-ended question for reflection. Keep it concise and personal. Here is the day's data:\n\n${daySummary}`;
    return generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
};


export const generateStorySummary = async (storyItems: LifeItem[]): Promise<string> => {
  let storyText = `ეს არის ჩემი ცხოვრების ისტორიის ფრაგმენტი. გთხოვ, გააანალიზე ეს მოვლენები და დამიწერე მოკლე, შთამაგონებელი შეჯამება, როგორც ბიოგრაფი. გამოყავი მთავარი მიღწევები და გამოწვევები.\n\n`;

  storyItems.forEach(item => {
    storyText += `თარიღი: ${dayjs(item.dateISO).format('YYYY-MM-DD')}\n`;
    storyText += `სათაური: ${item.title}\n`;
    storyText += `ტიპი: ${item.type}\n`;
    if(item.payload?.details) storyText += `დეტალები: ${item.payload.details}\n`;
    storyText += '---\n';
  });

  const prompt = `You are Navito-Guide, an insightful and empathetic biographer. Based on the following chronological life events, write a thoughtful summary in Georgian. Focus on the user's journey, highlighting their perseverance, key milestones, and the overall narrative arc. Keep the tone encouraging and reflective. Here is the data:\n\n${storyText}`;
  
  return generateContentWithRetry({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
};

export const generateChapterSummary = async (chapterTitle: string, chapterItems: LifeItem[]): Promise<string> => {
  let storyText = `This is a chapter of my life titled "${chapterTitle}". Please analyze these events and write a short, inspiring summary, as if you were a biographer. Highlight the main themes, achievements, and challenges of this specific period.\n\n`;

  chapterItems.forEach(item => {
    storyText += `Date: ${dayjs(item.dateISO).format('YYYY-MM-DD')}\n`;
    storyText += `Title: ${item.title}\n`;
    storyText += `Type: ${item.type}\n`;
    if(item.payload?.details) storyText += `Details: ${item.payload.details}\n`;
    storyText += '---\n';
  });

  const prompt = `You are Navito-Guide, an insightful and empathetic biographer. Based on the following chronological life events from the chapter "${chapterTitle}", write a thoughtful summary in Georgian. Focus on the user's journey during this period, highlighting key milestones, and the overall narrative arc. Keep the tone encouraging and reflective. Here is the data:\n\n${storyText}`;
  
  return generateContentWithRetry({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
};

export const generateThematicReview = async (lifeItems: LifeItem[], habits: Habit[]): Promise<ThematicReview | null> => {
    if (!API_KEY) return null;

    const sevenDaysAgo = dayjs().subtract(7, 'days');
    const recentItems = lifeItems.filter(item => dayjs(item.dateISO).isAfter(sevenDaysAgo));
    const recentHabits = habits.map(h => ({
        name: h.name,
        recentLogs: h.log.filter(l => dayjs(l).isAfter(sevenDaysAgo)).length
    })).filter(h => h.recentLogs > 0);

    if (recentItems.length < 2 && recentHabits.length < 1) {
        return null; // Not enough data
    }

    let dataSummary = `User's data for the last 7 days:\nItems: ${recentItems.map(i => i.title).join(', ')}\nHabits: ${recentHabits.map(h => `${h.name} (${h.recentLogs} times)`).join(', ')}`;
    
    const prompt = `You are Navito-Guide, a wise and insightful life coach. Analyze the user's activities from the past 7 days. Instead of listing individual events, synthesize them into a single, overarching theme (e.g., 'Growth', 'Rest & Recovery', 'Social Connection', 'Overcoming Challenges'). Based on this theme, write a short, encouraging narrative that reflects their journey this week. Finally, pose one gentle, forward-looking question for reflection. Your response must be a JSON object in Georgian.`;
    
    try {
        const responseText = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: `${prompt}\n\nData:\n${dataSummary}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        theme: { type: Type.STRING },
                        narrative: { type: Type.STRING },
                        prompt: { type: Type.STRING }
                    }, required: ['theme', 'narrative', 'prompt']
                }
            }
        });
        return JSON.parse(responseText.trim()) as ThematicReview;
    } catch(e) {
        console.error("Error generating thematic review", e);
        throw e;
    }
};

export const generateProactiveInsight = async (lifeItems: LifeItem[], habits: Habit[]): Promise<ProactiveInsight | null> => {
    if (!API_KEY) return null;

    const oneWeekAgo = dayjs().subtract(7, 'day');
    const recentItems = lifeItems.filter(item => dayjs(item.dateISO).isAfter(oneWeekAgo));
    const recentHabits = habits.map(h => ({
        name: h.name,
        recentLogs: h.log.filter(l => dayjs(l).isAfter(oneWeekAgo)).length,
        totalLogs: h.log.length
    }));

    if (recentItems.length < 2 && recentHabits.every(h => h.recentLogs === 0)) {
        return null; // Not enough recent data for a meaningful insight
    }

    const dataSummary = `User's data for the last 7 days:\n
    - Recent Items: ${recentItems.map(i => `${i.title} (Mood: ${i.mood})`).join(', ')}\n
    - Habits: ${recentHabits.map(h => `${h.name} (${h.recentLogs} times this week, ${h.totalLogs} total)`).join(', ')}`;
    
    const prompt = `You are Navito-Guide, a proactive and insightful AI coach. Analyze the user's recent activity. Provide one of the following types of insights:
    - 'mood': Comment on a mood pattern.
    - 'goal': Comment on goal progress or lack thereof.
    - 'habit': Highlight a strong or weak habit.
    - 'reflection': Pose a question based on their activity.
    - 'experiment': Suggest a simple, short-term experiment to try.
    
    Your response MUST be a JSON object in Georgian with the specified schema. Keep the text concise and encouraging. If suggesting an experiment, it must be of type 'start_habit_experiment'. Be creative but grounded in the user's data.`;

    try {
        const responseText = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: `${prompt}\n\nData:\n${dataSummary}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['mood', 'goal', 'habit', 'general', 'reflection', 'experiment'] },
                        text: { type: Type.STRING },
                        action: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['start_habit_experiment'] },
                                habitName: { type: Type.STRING },
                                durationDays: { type: Type.INTEGER }
                            },
                            required: ['type', 'habitName', 'durationDays']
                        }
                    },
                    required: ['type', 'text']
                }
            }
        });
        return JSON.parse(responseText.trim()) as ProactiveInsight;
    } catch (e) {
        console.error("Error generating proactive insight", e);
        // Don't throw, as this is a background feature. The component handles null.
        return null;
    }
};

export const generateNextStepForGoal = async (goal: LifeItem): Promise<string> => {
    const subtasksText = goal.subtasks?.map(s => `${s.text} (${s.completed ? 'completed' : 'pending'})`).join(', ') || 'None';
    const prompt = `You are a highly effective productivity assistant. The user is focused on the following goal:
- Title: "${goal.title}"
- Details: "${goal.payload?.details || 'N/A'}"
- Subtasks: ${subtasksText}
Analyze the goal and its current state. Provide ONE concrete, actionable next step the user can take to make progress. The suggestion should be small and not overwhelming. Respond with just the suggested action as a single sentence in Georgian.`;

    return generateContentWithRetry({ model: 'gemini-2.5-flash', contents: prompt });
};

export const parseNaturalLanguageInput = async (input: string): Promise<ParsedNaturalInput> => {
    const prompt = `You are an intelligent task parser for a life-logging app. Analyze the user's text and extract structured information. The current date is ${dayjs().format('YYYY-MM-DD')}. Convert relative dates (e.g., 'tomorrow', 'next week', 'თვის ბოლოს') into an exact 'YYYY-MM-DD' format. Determine if the entry is a 'goal' or an 'event'. If it's a goal, the date is the deadline. If it's an event, it's the date of occurrence. Extract the main title and any remaining text as details. Infer a suitable category. Your response must be a JSON object with the specified schema. User input is in Georgian.

User Text: "${input}"`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['event', 'goal'] },
                    dateISO: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                    details: { type: Type.STRING, description: "Any extra details from the text" },
                    category: { type: Type.STRING, enum: ['personal', 'work', 'learning', 'relationship', 'impact', 'other'], description: "Infer the most likely category" }
                },
                required: ['title', 'type', 'dateISO', 'details', 'category']
            }
        }
    });
    
    return JSON.parse(responseText.trim()) as ParsedNaturalInput;
};


export const generateGoalResources = async (goalTitle: string): Promise<string> => {
    const prompt = `You are a helpful assistant. The user wants to achieve the following goal: '${goalTitle}'. Provide a concise, actionable list of 3-5 online resources (articles, YouTube videos, free tools, communities like subreddits) that could help them. Format your response in Georgian as a markdown list. Focus on high-quality, accessible resources.`;
    return generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
};

export const generateSpecificInsight = async (type: SpecificInsightType, lifeItems: LifeItem[], habits: Habit[]): Promise<string> => {
    let prompt = '';
    const dataSummary = `Here is a summary of the user's data:\n- Total Life Items: ${lifeItems.length}\n- Total Habits Tracked: ${habits.length}\nData snapshot:\nLife Items (sample): ${JSON.stringify(lifeItems.slice(0, 5))}\nHabits (sample): ${JSON.stringify(habits.slice(0, 5).map(h => ({ name: h.name, logs: h.log.length })))}`;

    switch (type) {
        case 'mood_habit':
            prompt = `You are a data analyst specializing in behavioral psychology. Analyze the user's data to find a connection between their logged habits and their mood ratings. Look for correlations on the same day or the following day. Identify ONE interesting positive or negative correlation. For example, 'When you did [Habit X], your mood was on average higher the next day.' Explain your finding in a simple, encouraging way. If no strong correlation is found, suggest a potential relationship to observe. Respond in Georgian, using markdown for formatting.`;
            break;
        case 'goal_progress':
            prompt = `You are a supportive productivity coach. Analyze the user's goals, their deadlines, and their subtask completion rates. Identify one goal that is progressing well and one that might need attention. For the one progressing well, provide specific praise and encouragement. For the one that is lagging, offer a gentle, actionable suggestion without being critical (e.g., 'Perhaps breaking down the next step into even smaller pieces could help?'). If all goals are on track, celebrate the momentum. Respond in Georgian, using markdown for formatting.`;
            break;
        default:
            return Promise.reject("Invalid insight type");
    }

    const fullPrompt = `${prompt}\n\nHere is the data summary:\n${dataSummary}`;
    const result = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: fullPrompt
    });
    return result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
};

export const generateAutobiographyChapter = async (
    itemsInRange: LifeItem[], 
    habitsInRange: { name: string, count: number }[],
    startDate: dayjs.Dayjs, 
    endDate: dayjs.Dayjs
): Promise<string> => {

    let summary = `პერიოდი: ${startDate.format('YYYY-MM-DD')} - ${endDate.format('YYYY-MM-DD')}\n\n`;
    
    summary += `**მოვლენები, მიზნები და სავარჯიშოები:**\n`;
    if (itemsInRange.length > 0) {
        const sortedItems = [...itemsInRange].sort((a, b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf());
        sortedItems.forEach(item => {
            summary += `- ${dayjs(item.dateISO).format('DD/MM')}: ${item.title} (ტიპი: ${item.type}, განწყობა: ${item.mood || 'N/A'})\n`;
            if (item.payload?.details) {
                summary += `  დეტალები: ${item.payload.details.substring(0, 100)}...\n`;
            }
        });
    } else {
        summary += "ამ პერიოდში მნიშვნელოვანი მოვლენები არ დაფიქსირებულა.\n";
    }
  
    summary += `\n**ჩვევების აქტივობა:**\n`;
    if (habitsInRange.length > 0) {
        habitsInRange.forEach(habit => {
            summary += `- ${habit.name}: შესრულდა ${habit.count} ჯერ\n`;
        });
    } else {
        summary += "ამ პერიოდში ჩვევების აქტივობა არ დაფიქსირებულა.\n";
    }

    const prompt = `You are Navito-Guide, a deeply insightful and master storyteller, acting as a personal biographer. You are tasked with writing a chapter of a user's life based on the data provided for the period from ${startDate.format('MMMM D, YYYY')} to ${endDate.format('MMMM D, YYYY')}.

    Your task is not to simply list the events. Instead, you must weave them into a compelling and coherent narrative. Synthesize the provided data—events, moods, goals, exercises, and habit patterns—to uncover the underlying themes, personal growth, challenges faced, and key turning points of this period. 
    
    - Adopt a warm, empathetic, and slightly literary tone.
    - Structure the output like a short chapter from a biography.
    - Start with an engaging opening that sets the theme for the period.
    - Connect different data points to tell a story. For example, how did completing a certain habit affect their mood or progress on a goal?
    - Conclude with a thoughtful reflection on what this period meant for their overall journey.
    - The entire response must be in Georgian. Use Markdown for formatting (e.g., **bold** for emphasis, paragraphs).

    Here is the data summary:
    \n\n${summary}`;

    return generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
};


export const generateSmartDecomposition = async (goalTitle: string): Promise<SmartDecompositionResponse> => {
    const prompt = `You are a world-class productivity coach. A user wants to set a SMART goal.
    Their initial goal is: "${goalTitle}".

    Your task is to:
    1.  Break this goal down into the SMART criteria (Specific, Measurable, Achievable, Relevant).
    2.  Suggest 3-5 concrete, actionable first subtasks to get them started.

    Provide the response as a JSON object in Georgian. The subtasks should be simple imperative commands. The user will set their own time-bound date.`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    specific: { type: Type.STRING, description: "The 'Specific' part of the SMART goal." },
                    measurable: { type: Type.STRING, description: "The 'Measurable' part of the SMART goal." },
                    achievable: { type: Type.STRING, description: "The 'Achievable' part of the SMART goal." },
                    relevant: { type: Type.STRING, description: "The 'Relevant' part of the SMART goal." },
                    subtasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 actionable subtask strings." }
                },
                required: ['specific', 'measurable', 'achievable', 'relevant', 'subtasks']
            }
        }
    });
    
    return JSON.parse(responseText.trim()) as SmartDecompositionResponse;
};

export const designPersonalSystem = async (problemDescription: string): Promise<PersonalSystem> => {
    const prompt = `You are a world-class life coach, psychologist, and systems thinker. A user needs your help to create a structured system to address a specific problem or achieve a goal.

User's problem/goal: "${problemDescription}"

Your task is to design a complete, actionable, and inspiring personal system. The system should consist of a few core habits, a set of initial tasks, and some reflection questions.

Your response MUST be a JSON object in Georgian with the specified schema.
- The 'name' should be creative and motivating (e.g., "The Phoenix Protocol", "7-Day Clarity Sprint").
- The 'description' should be a short, motivating summary of the system's purpose.
- Provide a mix of 2-3 'habit' components, 3-5 'task' components, and 1-2 'reflection' components.
- Keep titles and details concise and actionable.`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'A creative and inspiring name for the system (e.g., "The Phoenix Protocol", "7-Day Clarity Sprint").' },
                    description: { type: Type.STRING, description: 'A short, motivating description of what the system is designed to achieve.' },
                    components: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['habit', 'task', 'reflection'] },
                                title: { type: Type.STRING, description: 'A concise title for the component (e.g., "Morning Meditation", "Define Project Scope", "What did I learn today?").' },
                                details: { type: Type.STRING, description: 'A brief explanation or instruction for the component.' },
                            },
                            required: ['type', 'title', 'details']
                        }
                    }
                },
                required: ['name', 'description', 'components']
            }
        }
    });
    
    return JSON.parse(responseText.trim()) as PersonalSystem;
};

export const simulateScenario = async (scenarioDescription: string): Promise<Scenario> => {
    const prompt = `You are a strategic foresight and planning expert. A user wants to explore a "what if" scenario for their life.

User's scenario: "${scenarioDescription}"

Your task is to generate a plausible and structured simulation of this scenario. This should include:
1. A creative, inspiring name for the scenario.
2. A brief, encouraging description.
3. 3-4 major milestones with estimated durations (e.g., "1-3 months").
4. A list of 3-5 potential challenges to be aware of.
5. 3 concrete first steps the user could take right away.

Your response MUST be a JSON object in Georgian with the specified schema. Keep the tone realistic but optimistic.`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    milestones: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                duration: { type: Type.STRING }
                            },
                            required: ['title', 'duration']
                        }
                    },
                    potentialChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
                    firstSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['name', 'description', 'milestones', 'potentialChallenges', 'firstSteps']
            }
        }
    });
    return JSON.parse(responseText.trim()) as Scenario;
};

export const summarizeContent = async (content: string): Promise<SummarizedContent> => {
    const prompt = `You are an expert analyst and summarizer. Your task is to process a piece of text and extract its core value.
Provided Text:
"""
${content}
"""
Analyze the text and provide the following:
1. A concise, descriptive title for the content.
2. A brief summary of the main ideas.
3. A list of 3-5 actionable tasks a user could derive from this text.
4. A list of 3-5 key concepts or keywords.

Your response MUST be a JSON object in Georgian with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    actionableTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'summary', 'actionableTasks', 'keyConcepts']
            }
        }
    });
    return JSON.parse(responseText.trim()) as SummarizedContent;
};

export const generateLegacyPrompt = async (previousAnswers: string[]): Promise<string> => {
    const prompt = `You are a wise philosopher and biographer, guiding a user on a long-term journey of self-reflection for their "Legacy Project".
The user has already answered some questions in the past. Here are their previous answers:
${previousAnswers.length > 0 ? previousAnswers.map((a, i) => `Answer ${i + 1}: ${a}`).join('\n') : "None yet."}

Based on this, your task is to generate ONE new, deep, and thought-provoking question. The question should encourage the user to reflect on their values, experiences, and life lessons. Avoid simple or repetitive questions. Make it personal and insightful if possible, building on their past reflections.
Respond with ONLY the question text in Georgian.`;

    return generateContentWithRetry({ model: 'gemini-2.5-flash', contents: prompt });
};

export const clarifyCoreValues = async (text: string): Promise<GeneratedValuesResponse> => {
    const prompt = `You are a wise and empathetic life coach specializing in values clarification. Analyze the user's free-text reflection below. Identify 5-7 core personal values that are most strongly expressed or implied in the text. For each value, provide a brief "reason" that directly quotes or paraphrases a part of the user's text that led you to that conclusion. Your response must be a JSON object in Georgian.

User's reflection:
"""
${text}
"""`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    values: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                value: { type: Type.STRING, description: "The core value, as a single word or short phrase (e.g., 'Creativity', 'Connection')." },
                                reason: { type: Type.STRING, description: "The justification, briefly explaining why this value was chosen based on the user's text." }
                            },
                            required: ['value', 'reason']
                        }
                    }
                },
                required: ['values']
            }
        }
    });
    
    const parsed = JSON.parse(responseText.trim()) as { values: Omit<CoreValue, 'id'>[] };
    const responseWithIds: GeneratedValuesResponse = {
        values: parsed.values.map(v => ({
            ...v,
            id: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
    };
    return responseWithIds;
};

export const generateValueAlignmentSummary = async (summaryData: { valueName: string; count: number }[]): Promise<string> => {
    const dataString = summaryData.map(d => `- ${d.valueName}: ${d.count} completed goals`).join('\n');
    const prompt = `You are Navito-Guide, an insightful life coach. Analyze the user's alignment with their core values based on their completed goals over the last 30 days. Provide a short, encouraging summary in Georgian. Highlight the most honored value and gently point out any neglected values, suggesting a small action if applicable. The response should be formatted with markdown.

Here's the data:
${dataString}`;
    return generateContentWithRetry({ model: 'gemini-2.5-flash', contents: prompt });
};

export const generateWeeklyPlanningSuggestions = async (
    pastWeekSummary: string,
    upcomingGoals: string[]
): Promise<{ priorities: string[] }> => {
    const prompt = `You are Navito-Guide, a strategic life coach. Your task is to help a user plan their upcoming week by suggesting 3-5 key priorities.

    Here is the context:
    - Summary of their last 7 days: "${pastWeekSummary}"
    - Their already defined goals for the next 7 days: ${upcomingGoals.join(', ') || 'None'}

    Based on this, suggest 3-5 actionable, high-impact priorities for the next week. These priorities should help them build on momentum from the past week and make progress on their upcoming goals. Frame them as concise, imperative tasks (e.g., "დაასრულე X პროექტის პრეზენტაცია", "გამოყავი 3 საათი Y-ს სასწავლად").

    Your response MUST be a JSON object in Georgian with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    priorities: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['priorities']
            }
        }
    });
    return JSON.parse(responseText.trim()) as { priorities: string[] };
};

export const designGuidedJourney = async (goalDescription: string): Promise<Omit<Program, 'id' | 'isActive' | 'startDate' | 'checkins'>> => {
    const prompt = `You are a world-class life architect and strategic planner. A user wants a comprehensive, multi-week guided program to achieve a major goal.

User's Goal: "${goalDescription}"

Your task is to design a complete, structured "Guided Journey".
- The program should last between 4 to 8 weeks.
- For each week, define a clear theme or focus.
- Create a mix of components for the program:
  - 'habit': New daily or weekly habits to build.
  - 'goal': Specific, smaller goals or milestones for each week.
  - 'exercise': Suggest relevant reflection exercises from the Navito app (like 'fear-setting', 'life-wheel', 'swot-me') at appropriate times, especially at the beginning or end.

Your response MUST be a JSON object in Georgian with the specified schema. Be creative, empathetic, and structure the journey logically from foundation-building to execution and reflection.`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'A creative and inspiring name for the journey.' },
                    description: { type: Type.STRING, description: 'A short, motivating summary of the journey\'s purpose.' },
                    durationWeeks: { type: Type.INTEGER, description: 'The total number of weeks for the program (4-8).' },
                    components: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['habit', 'goal', 'exercise'] },
                                week: { type: Type.INTEGER, description: 'The week number this component belongs to (starts from 1).' },
                                title: { type: Type.STRING, description: 'A concise title for the component.' },
                                details: { type: Type.STRING, description: 'A brief explanation or instruction for the component.' },
                            },
                            required: ['type', 'week', 'title', 'details']
                        }
                    }
                },
                required: ['name', 'description', 'durationWeeks', 'components']
            }
        }
    });

    return JSON.parse(responseText.trim()) as Omit<Program, 'id' | 'isActive' | 'startDate' | 'checkins'>;
};

export const generateDailyBriefing = async (
    pinnedGoalTitle: string | null,
    upcomingDeadlines: number,
    todaysHabits: string[]
): Promise<DailyBriefing> => {
    const prompt = `You are Navito-Guide, an encouraging and insightful AI assistant. It's the beginning of the user's day.
    Context:
    - Main Pinned Goal: ${pinnedGoalTitle || 'None set'}
    - Upcoming Deadlines (next 7 days): ${upcomingDeadlines}
    - Habits to complete today: ${todaysHabits.join(', ') || 'None'}

    Task: Create a short, inspiring daily briefing in Georgian. Provide a warm greeting, a clear statement about their main focus for the day, and a unique motivational prompt or thought to get them started. The tone should be positive and empowering.
    
    Your response MUST be a JSON object with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    greeting: { type: Type.STRING },
                    focus_statement: { type: Type.STRING },
                    motivational_prompt: { type: Type.STRING }
                },
                required: ['greeting', 'focus_statement', 'motivational_prompt']
            }
        }
    });

    return JSON.parse(responseText.trim()) as DailyBriefing;
};

export const generateEveningReflectionPrompt = async (daySummary: string): Promise<string> => {
    const prompt = `You are Navito-Guide, a thoughtful and wise journaling companion. Based on the user's activity summary for the day, generate ONE deep, open-ended reflection prompt in Georgian. The prompt should encourage them to think about their experiences, feelings, or learnings from the day. It should NOT be a simple yes/no question or something generic. It should feel connected to their actual day.

    User's Day Summary:
    """
    ${daySummary}
    """

    Respond with ONLY the question text.`;

     return generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
};

export const generateQuarterlyReview = async (
    dataSummary: string,
    values: CoreValue[]
): Promise<QuarterlyReviewReport> => {
    const prompt = `You are Navito-Guide, a world-class strategic life coach and analyst. Your task is to conduct a comprehensive 90-day "Epoch Review" for a user based on their data summary and stated core values.

    **User's Data Summary (Last 90 Days):**
    """
    ${dataSummary}
    """

    **User's Core Values:**
    ${values.map(v => `- ${v.value}: ${v.reason}`).join('\n')}

    **Your Task:**
    Generate a complete, insightful, and motivating Quarterly Review Report. The report must be a JSON object in Georgian.
    - **Title:** Create a creative, thematic title for this 90-day period (e.g., "The Quarter of Recalibration", "The Sprint Towards Growth").
    - **Summary:** Write a short, empathetic narrative that synthesizes the key story of the past 90 days. What was the overarching theme?
    - **Key Achievements:** Identify 3-5 major accomplishments, wins, or positive patterns.
    - **Key Challenges:** Identify 2-4 significant obstacles, areas of friction, or negative patterns. Be gentle but direct.
    - **Value Alignment:** For each of the user's core values, provide a brief narrative on how their actions aligned (or misaligned) with that value, and give a score from 1 (low alignment) to 10 (high alignment).
    - **Suggested Focus Areas:** Based on the entire analysis, suggest 2-3 high-level areas for the user to focus on in the next quarter.

    The response must be structured according to the provided JSON schema.`;
    
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    period: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
                    valueAlignment: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                value: { type: Type.STRING },
                                narrative: { type: Type.STRING },
                                score: { type: Type.INTEGER }
                            },
                            required: ['value', 'narrative', 'score']
                        }
                    },
                    suggestedFocusAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'period', 'summary', 'keyAchievements', 'keyChallenges', 'valueAlignment', 'suggestedFocusAreas']
            }
        }
    });

    return JSON.parse(responseText.trim()) as QuarterlyReviewReport;
};

export const analyzeHolisticCorrelations = async (dataSummary: string): Promise<HolisticCorrelationReport> => {
    const prompt = `You are a brilliant data scientist and life coach, specializing in finding actionable insights from holistic personal data. Analyze the provided summary of a user's mood, habits, and biometric data (sleep, steps, heart rate).

    Data Summary:
    """
    ${dataSummary}
    """

    Your task is to identify the most significant correlations.
    1.  Identify up to 3 **positive correlations**. These are connections where a certain action (like a habit or good sleep) seems to lead to positive outcomes (like better mood or lower heart rate).
    2.  Identify up to 2 **negative correlations** or areas for improvement.
    3.  For each correlation, provide:
        - \`finding\`: A clear, concise statement of the correlation (e.g., "დილის ვარჯიში აუმჯობესებს თქვენს განწყობას").
        - \`evidence\`: A brief, data-backed sentence explaining why you think this is true (e.g., "იმ დღეებში, როცა დილით ვარჯიშობდით, თქვენი საშუალო განწყობა 1.5 ქულით მაღალი იყო.").
        - \`strength\`: Classify the strength as 'strong', 'moderate', or 'weak'.
    4.  Provide one overarching \`keyInsight\` that summarizes the most important takeaway for the user.

    Your response MUST be a JSON object in Georgian with the specified schema. Focus on the most impactful and non-obvious insights. If no clear correlations are found, return empty arrays and explain why in the keyInsight.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    positiveCorrelations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                finding: { type: Type.STRING },
                                evidence: { type: Type.STRING },
                                strength: { type: Type.STRING, enum: ['strong', 'moderate', 'weak'] },
                            },
                            required: ['finding', 'evidence', 'strength']
                        }
                    },
                    negativeCorrelations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                finding: { type: Type.STRING },
                                evidence: { type: Type.STRING },
                                strength: { type: Type.STRING, enum: ['strong', 'moderate', 'weak'] },
                            },
                             required: ['finding', 'evidence', 'strength']
                        }
                    },
                    keyInsight: { type: Type.STRING }
                },
                required: ['positiveCorrelations', 'negativeCorrelations', 'keyInsight']
            }
        }
    });
    return JSON.parse(responseText.trim()) as HolisticCorrelationReport;
};

export const analyzeMoodHabitCorrelation = async (dataSummary: string): Promise<MoodHabitCorrelation> => {
    const prompt = `You are a data analyst specializing in behavioral psychology. Analyze the user's data to find connections between their logged habits and their mood ratings.
    
    Data Summary:
    """
    ${dataSummary}
    """

    Your task is to:
    1.  Identify up to 3 **positive correlations** where a habit seems to improve mood.
    2.  Identify up to 2 **negative or neutral correlations**.
    3.  For each, provide a \`habitName\` and a brief \`effectDescription\`.
    4.  Provide one overarching \`summary\` of the key finding.

    Your response MUST be a JSON object in Georgian with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    positive: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                habitName: { type: Type.STRING },
                                effectDescription: { type: Type.STRING },
                            },
                            required: ['habitName', 'effectDescription']
                        }
                    },
                    negative: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                habitName: { type: Type.STRING },
                                effectDescription: { type: Type.STRING },
                            },
                             required: ['habitName', 'effectDescription']
                        }
                    },
                    summary: { type: Type.STRING }
                },
                required: ['positive', 'negative', 'summary']
            }
        }
    });
    return JSON.parse(responseText.trim()) as MoodHabitCorrelation;
};

export const generateGoalInsights = async (dataSummary: string): Promise<GoalInsightReport> => {
    const prompt = `You are a productivity analyst. Analyze the provided summary of a user's goal-setting and completion data.

    Data Summary:
    """
    ${dataSummary}
    """

    Your task is to extract key performance indicators and one major insight.
    - Calculate the overall completion rate as a percentage.
    - Calculate the average time to complete a goal in days.
    - Identify the most and least successful goal categories.
    - Provide one key insight or piece of advice based on the data (e.g., "Goals with fewer subtasks are completed faster," or "Health-related goals seem to be a high priority.").

    Your response MUST be a JSON object in Georgian with the specified schema.`;
    
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    completionRate: { type: Type.NUMBER },
                    avgCompletionTimeDays: { type: Type.NUMBER },
                    mostSuccessfulCategory: { type: Type.STRING },
                    leastSuccessfulCategory: { type: Type.STRING },
                    keyInsight: { type: Type.STRING }
                },
                required: ['completionRate', 'avgCompletionTimeDays', 'mostSuccessfulCategory', 'leastSuccessfulCategory', 'keyInsight']
            }
        }
    });
    return JSON.parse(responseText.trim()) as GoalInsightReport;
};


export const generateLifeWheelAnalysis = async (dataSummary: string): Promise<LifeWheelAnalysis> => {
    const prompt = `You are a life coach who analyzes longitudinal data. Analyze the user's "Life Wheel" data from two different points in time.

    Data Summary:
    """
    ${dataSummary}
    """

    Your task is to analyze the changes and provide a narrative summary.
    - For each life area, determine if it's 'improving', 'declining', 'or 'stable'.
    - Write a brief, empathetic narrative that summarizes the overall evolution. What has changed? What has remained constant? What might this signify for the user?

    Your response MUST be a JSON object in Georgian with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    trends: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                area: { type: Type.STRING },
                                startValue: { type: Type.NUMBER },
                                endValue: { type: Type.NUMBER },
                                trend: { type: Type.STRING, enum: ['improving', 'declining', 'stable'] }
                            },
                            required: ['area', 'startValue', 'endValue', 'trend']
                        }
                    },
                    narrativeSummary: { type: Type.STRING }
                },
                required: ['trends', 'narrativeSummary']
            }
        }
    });
    return JSON.parse(responseText.trim()) as LifeWheelAnalysis;
};

export const analyzeMindBodyConnection = async (dataSummary: string): Promise<MindBodyInsight> => {
    const prompt = `You are a data analyst specializing in wellness and behavioral psychology. Analyze the user's holistic data summary, which includes mood, sleep, and physical activity. Your task is to find ONE single, interesting, and actionable correlation between their physical state (sleep, steps) and their mental state (mood).
    
    Example Insights:
    - "On days you slept more than 8 hours, your average mood was 15% higher."
    - "When you walked over 10,000 steps, your mood was consistently positive the next day."
    - "Less than 6 hours of sleep appears to have a strong negative correlation with your mood."

    Be concise and present the finding as a simple, clear statement. If no strong correlation is found, state that more data is needed for a clear pattern to emerge.

    Your response MUST be a JSON object in Georgian with the specified schema.

    Data Summary:
    """
    ${dataSummary}
    """`;
    
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    insight: { type: Type.STRING }
                },
                required: ['insight']
            }
        }
    });
    return JSON.parse(responseText.trim()) as MindBodyInsight;
};

export const findRelatedHabits = async (goalTitle: string, goalDetails: string, allHabits: string[]): Promise<RelatedHabitsResponse> => {
    const prompt = `You are a productivity expert. A user has a focused goal and a list of their daily habits. Your task is to identify which of their existing habits are most relevant to achieving this goal.
    
    Goal Title: "${goalTitle}"
    Goal Details: "${goalDetails}"
    User's Habits: [${allHabits.join(', ')}]

    Analyze the goal and return a list of the most relevant habit names from the provided list. Return up to 3 habits. If no habits are relevant, return an empty array.

    Your response MUST be a JSON object in Georgian with the specified schema.`;
    
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    relatedHabits: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['relatedHabits']
            }
        }
    });
    return JSON.parse(responseText.trim()) as RelatedHabitsResponse;
};

export const performUniversalSearch = async (query: string, dataContext: string): Promise<UniversalSearchResponse> => {
    const prompt = `You are a personal data archivist AI. Analyze the user's complete life data provided in JSON format and answer their query.
    
    User Query: "${query}"

    Your task is to:
    1.  Thoroughly search through the provided data (lifeItems, habits, etc.) to find all relevant information related to the query.
    2.  Write a concise, narrative summary that directly answers the user's question based on your findings.
    3.  Identify the specific lifeItems that you used to construct your summary. For each of these source items, provide its id, title, dateISO, type, and a brief "snippet" explaining its relevance to the query.
    
    Your response MUST be a JSON object in Georgian with the specified schema. If no relevant data is found, return an empty summary and an empty sourceItems array.

    User Data Context:
    """
    ${dataContext}
    """`;
    
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: "A narrative summary answering the user's query." },
                    sourceItems: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                dateISO: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['event', 'goal', 'exercise'] },
                                snippet: { type: Type.STRING, description: "A brief explanation of this item's relevance to the query." }
                            },
                            required: ['id', 'title', 'dateISO', 'type', 'snippet']
                        }
                    }
                },
                required: ['summary', 'sourceItems']
            }
        }
    });

    return JSON.parse(responseText.trim()) as UniversalSearchResponse;
};

export const generateEpochGoal = async (goalDescription: string): Promise<EpochGoal> => {
    const prompt = `You are a master strategist and life coach. A user wants to define their main "Epoch Goal" for the next 90 days.
    
    User's rough idea: "${goalDescription}"

    Your task is to refine this into a clear, inspiring Epoch Goal.
    1.  **Title:** Create a concise and motivating title for the goal.
    2.  **Reason:** Write a compelling "why" for this goal.
    3.  **First Steps:** Suggest 3 concrete first steps to build momentum.

    Your response MUST be a JSON object in Georgian with the specified schema.`;
    
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    firstSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'reason', 'firstSteps']
            }
        }
    });
    return JSON.parse(responseText.trim()) as EpochGoal;
};


export const generateValueDrivenPrompt = async (value: string): Promise<ValuePromptResponse> => {
    const prompt = `You are a wise journaling guide. A user wants a reflection prompt based on their core value: "${value}".
    Generate ONE deep, open-ended question in Georgian that encourages them to explore how this value manifests in their life.
    Your response MUST be a JSON object with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING }
                },
                required: ['prompt']
            }
        }
    });
    return JSON.parse(responseText.trim()) as ValuePromptResponse;
};

export const reframeNegativeThought = async (thought: string): Promise<CognitiveReframesResponse> => {
    const prompt = `You are a cognitive behavioral therapy (CBT) expert. A user is sharing a negative thought: "${thought}".
    Your task is to provide 3-4 alternative, more balanced and constructive ways to reframe this thought.
    Your response MUST be a JSON object in Georgian with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    reframes: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['reframes']
            }
        }
    });
    return JSON.parse(responseText.trim()) as CognitiveReframesResponse;
};


export const generateStoicReflection = async (): Promise<StoicPromptResponse> => {
    const prompt = `You are a Stoic philosopher. Provide one concise, thought-provoking question or reflection prompt in Georgian for the user to ponder today, inspired by Stoic principles (e.g., control, virtue, impermanence).
    Your response MUST be a JSON object with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompt: { type: Type.STRING }
                },
                required: ['prompt']
            }
        }
    });
    return JSON.parse(responseText.trim()) as StoicPromptResponse;
};

export const generateProjectPremortem = async (projectDescription: string): Promise<ProjectPremortemResponse> => {
    const prompt = `You are a world-class project manager and risk analyst. A user is starting a new project: "${projectDescription}".
    Conduct a "pre-mortem". Imagine the project has failed spectacularly one year from now. Brainstorm a list of 5-7 plausible reasons for its failure.
    Your response MUST be a JSON object in Georgian with the specified schema.`;
    
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    risks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['risks']
            }
        }
    });
    return JSON.parse(responseText.trim()) as ProjectPremortemResponse;
};

export const generateHighlightReel = async (dataSummary: string): Promise<HighlightReelResponse> => {
    const prompt = `You are an optimistic biographer. Analyze the user's data from the last 30 days and identify 3-5 positive highlights. These could be completed goals, consistent habits, or high-mood events.
    For each highlight, provide its date, title, and a brief reason why it's a highlight.
    Your response MUST be a JSON object in Georgian with the specified schema.

    Data Summary:
    """
    ${dataSummary}
    """`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    highlights: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                date: { type: Type.STRING },
                                title: { type: Type.STRING },
                                reason: { type: Type.STRING }
                            },
                            required: ['date', 'title', 'reason']
                        }
                    }
                },
                required: ['highlights']
            }
        }
    });
    return JSON.parse(responseText.trim()) as HighlightReelResponse;
};

export const generateIdeaCatalyst = async (topic: string): Promise<IdeaCatalystResponse> => {
    const prompt = `You are a creative muse. The user provides a topic: "${topic}".
    Your task is to generate 3-4 unconventional, interesting, or provocative angles or ideas related to this topic to spark their creativity.
    Your response MUST be a JSON object in Georgian with the specified schema.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ideas: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['ideas']
            }
        }
    });
    return JSON.parse(responseText.trim()) as IdeaCatalystResponse;
};

// --- New Planning Tool Services ---

export const generateGoalLadder = async (goal: string): Promise<GoalLadderResponse> => {
    const prompt = `დაშალე ეს დიდი მიზანი: "${goal}" პატარა, მართვად ნაბიჯებად. შექმენი 2-4 მთავარი ეტაპი და თითოეულისთვის 2-3 კონკრეტული ქვე-ნაბიჯი. პასუხი დააბრუნე JSON ფორმატში.`;
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    steps: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING },
                            subSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }, required: ['title', 'subSteps']
                    }}
                }, required: ['steps']
            }
        }
    });
    return JSON.parse(responseText.trim()) as GoalLadderResponse;
};

export const designIdealWeek = async (priorities: string): Promise<IdealWeekResponse> => {
    const prompt = `დააპროექტე იდეალური კვირის განრიგი ამ პრიორიტეტების გათვალისწინებით: "${priorities}". თითოეული დღისთვის განსაზღვრე მთავარი ფოკუსი და რამდენიმე აქტივობა. პასუხი დააბრუნე JSON ფორმატში.`;
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    schedule: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            day: { type: Type.STRING },
                            focus: { type: Type.STRING },
                            activities: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }, required: ['day', 'focus', 'activities']
                    }}
                }, required: ['schedule']
            }
        }
    });
    return JSON.parse(responseText.trim()) as IdealWeekResponse;
};

export const planSkillAcquisition = async (skill: string): Promise<SkillPlanResponse> => {
    const prompt = `შექმენი სტრუქტურირებული გეგმა ამ უნარის ასათვისებლად: "${skill}". დაყავი გეგმა ფაზებად (მაგ: საფუძვლები, პრაქტიკა, დახელოვნება), მიუთითე თითოეულის სავარაუდო ხანგრძლივობა და აქტივობები. პასუხი დააბრუნე JSON ფორმატში.`;
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    planName: { type: Type.STRING },
                    phases: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            phaseTitle: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            activities: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }, required: ['phaseTitle', 'duration', 'activities']
                    }}
                }, required: ['planName', 'phases']
            }
        }
    });
    return JSON.parse(responseText.trim()) as SkillPlanResponse;
};

export const generateProjectKickstart = async (project: string): Promise<ProjectKickstartResponse> => {
    const prompt = `შექმენი საწყისი გეგმა ამ პროექტისთვის: "${project}". მოამზადე მოკლე აღწერა (brief), ძირითადი ამოცანების სია და ფაზებად დაყოფილი თაიმლაინი. პასუხი დააბრუნე JSON ფორმატში.`;
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    projectName: { type: Type.STRING },
                    brief: { type: Type.STRING },
                    keyTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    timeline: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            phase: { type: Type.STRING },
                            tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }, required: ['phase', 'tasks']
                    }}
                }, required: ['projectName', 'brief', 'keyTasks', 'timeline']
            }
        }
    });
    return JSON.parse(responseText.trim()) as ProjectKickstartResponse;
};

export const suggestHabitStacks = async (currentHabits: string, newHabit: string): Promise<HabitStackResponse> => {
    const prompt = `მომხმარებელს აქვს ეს ჩვევები: "${currentHabits}" და სურს ამ ახალი ჩვევის დამატება: "${newHabit}". შესთავაზე 2-3 ეფექტური "ჩვევების დაწყვილება" (habit stack). პასუხი დააბრუნე JSON ფორმატში.`;
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    stacks: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            currentHabit: { type: Type.STRING },
                            newHabit: { type: Type.STRING },
                            suggestion: { type: Type.STRING }
                        }, required: ['currentHabit', 'newHabit', 'suggestion']
                    }}
                }, required: ['stacks']
            }
        }
    });
    return JSON.parse(responseText.trim()) as HabitStackResponse;
};

export const generateAntiGoals = async (goal: string): Promise<AntiGoalResponse> => {
    const prompt = `ამ მიზნისთვის: "${goal}", განსაზღვრე 2-3 "ანტი-მიზანი" (чего я хочу избежать) და თითოეულისთვის ჩამოაყალიბე პრევენციული ქმედებები. პასუხი დააბრუნე JSON ფორმატში.`;
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    antiGoals: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            antiGoal: { type: Type.STRING },
                            preventativeActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }, required: ['antiGoal', 'preventativeActions']
                    }}
                }, required: ['antiGoals']
            }
        }
    });
    return JSON.parse(responseText.trim()) as AntiGoalResponse;
};

export const curateResources = async (topic: string): Promise<ResourceCuratorResponse> => {
    const prompt = `მოიძიე 3-4 სასარგებლო რესურსი (სტატია, ვიდეო, ხელსაწყო, კურსი) ამ თემაზე: "${topic}". თითოეულისთვის მიუთითე ტიპი, სათაური და მოკლე აღწერა. პასუხი დააბრუნე JSON ფორმატში.`;
    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash", contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    resources: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            type: { type: Type.STRING, enum: ['სტატია', 'ვიდეო', 'ხელსაწყო', 'კურსი'] },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }, required: ['type', 'title', 'description']
                    }}
                }, required: ['resources']
            }
        }
    });
    return JSON.parse(responseText.trim()) as ResourceCuratorResponse;
};

export const generateWeeklyDigest = async (dataSummary: string): Promise<WeeklyDigestReport> => {
    const prompt = `You are Navito-Guide, an insightful and encouraging AI life coach. Your task is to generate a comprehensive weekly review based on the user's data from the last 7 days.

    User's Data Summary (Last 7 Days):
    """
    ${dataSummary}
    """

    **Your Task:**
    Generate a complete, empathetic, and motivating weekly digest. The report must be a JSON object in Georgian.
    - **weekTitle:** Create a creative, thematic title for this week (e.g., "The Week of Focus", "A Time for Reflection").
    - **summary:** Write a short, narrative summary of the week's key activities and mood.
    - **keyAchievements:** Identify 2-4 major accomplishments or positive patterns.
    - **areasForReflection:** Gently point out 1-3 areas where the user could reflect or improve.
    - **productivityScore:** On a scale of 1-10, how productive did the user seem this week based on completed goals and habits?
    - **balanceScore:** On a scale of 1-10, how balanced did their week seem across different life categories?

    The response must be structured according to the provided JSON schema.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    weekTitle: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    areasForReflection: { type: Type.ARRAY, items: { type: Type.STRING } },
                    productivityScore: { type: Type.INTEGER, description: "A score from 1 to 10." },
                    balanceScore: { type: Type.INTEGER, description: "A score from 1 to 10." }
                },
                required: ['weekTitle', 'summary', 'keyAchievements', 'areasForReflection', 'productivityScore', 'balanceScore']
            }
        }
    });

    return JSON.parse(responseText.trim()) as WeeklyDigestReport;
};

const AVAILABLE_TOOLS = [
    { slug: 'one-breath-pause', name: 'ერთი ამოსუნთქვა', description: 'სწრაფი პაუზა სტრესის მოსახსნელად და გონების დასამშვიდებლად.' },
    { slug: 'daily-wins', name: 'დღის 3 გამარჯვება', description: 'პატარა წარმატებების დაფიქსირება მოტივაციის ასამაღლებლად.' },
    { slug: 'value-driven-prompt', name: 'ღირებულებაზე დაფუძნებული კითხვა', description: 'ღრმა რეფლექსია პირად ღირებულებებზე.' },
    { slug: 'stoic-reflection', name: 'სტოიკური რეფლექსია', description: 'დღის შეკითხვა შინაგანი სიმშვიდისა და სიბრძნისთვის.' },
    { slug: 'future-self-letter', name: 'წერილი მომავალ "მე"-ს', description: 'დაუკავშირდით თქვენს მომავალ ვერსიას.' },
    { slug: 'highlight-reel', name: 'თვის საუკეთესო მომენტები', description: 'ბოლო 30 დღის პოზიტიური მომენტების შეჯამება.' },
    { slug: 'cognitive-reframer', name: 'აზრის რეფრეიმინგი', description: 'ნეგატიური აზროვნების პატერნების შეცვლა.' },
    { slug: 'project-premortem', name: 'პროექტის პრემორტემი', description: 'პროექტის დაწყებამდე პოტენციური რისკების იდენტიფიცირება.' },
    { slug: 'idea-catalyst', name: 'იდეების კატალიზატორი', description: 'კრეატიული, არასტანდარტული იდეების გენერირება.' },
    { slug: 'decision-journal', name: 'გადაწყვეტილების ჟურნალი', description: 'მნიშვნელოვანი გადაწყვეტილებების დაფიქსირება და ანალიზი.' },
    { slug: 'epoch-goal-setter', name: 'ეპოქის მიზანი (90 დღე)', description: 'მთავარი ფოკუსის განსაზღვრა მომდევნო კვარტლისთვის.' },
    { slug: 'brain-dump', name: 'გონების გათავისუფლება (Brain Dump)', description: 'ყველა ფიქრის, იდეის და საქმის სწრაფად ჩაწერა გონების გასასუფთავებლად.' }
];

export const suggestTools = async (dataSummary: string): Promise<ToolSuggestionResponse> => {
    const prompt = `You are Navito-Guide, an insightful AI assistant. Your task is to analyze the user's recent data and suggest 2-3 relevant micro-tools from the provided list that would be most helpful for them right now. For each suggestion, provide a brief, personalized reason why it's a good fit.

    **Available Tools:**
    ${AVAILABLE_TOOLS.map(t => `- slug: '${t.slug}', name: '${t.name}', description: '${t.description}'`).join('\n')}

    **User's Data Summary (Last 7 Days):**
    """
    ${dataSummary}
    """

    Based on the data, which tools are most relevant? Consider their recent moods, goals, and activities. For example, if they seem stressed, suggest 'one-breath-pause'. If they are starting a big project, suggest 'project-premortem'.

    Your response MUST be a JSON object in Georgian with the specified schema. The 'reasoning' should be concise and directly address the user's situation.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                slug: { type: Type.STRING },
                                name: { type: Type.STRING },
                                reasoning: { type: Type.STRING }
                            },
                            required: ['slug', 'name', 'reasoning']
                        }
                    }
                },
                required: ['suggestions']
            }
        }
    });
    return JSON.parse(responseText.trim()) as ToolSuggestionResponse;
};

export const findTimelinePatterns = async (lifeItems: LifeItem[], habits: Habit[]): Promise<TimelinePattern[]> => {
    const dataSummary = `Life Items: ${lifeItems.length}, Habits: ${habits.length}. Analyze for patterns like 'Increased mood when [habit] was performed' or 'period of high productivity'.`;
    const prompt = `You are a data analyst. Analyze the user's life data to find significant patterns (positive, negative, or just insights) over time. A pattern should cover a date range. Your response must be a JSON object containing an array of patterns.
    
    Data Summary:
    ${dataSummary}`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    patterns: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                startDateISO: { type: Type.STRING },
                                endDateISO: { type: Type.STRING },
                                description: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['positive', 'negative', 'insight'] }
                            },
                            required: ['startDateISO', 'endDateISO', 'description', 'type']
                        }
                    }
                },
                required: ['patterns']
            }
        }
    });
    const result = JSON.parse(responseText.trim());
    return result.patterns as TimelinePattern[];
};

export const generateFutureMoodProjection = async (futureItems: LifeItem[], pastItems: LifeItem[]): Promise<ProjectedMoodPoint[]> => {
    const prompt = `Based on the user's past reactions to events and their upcoming events, project their likely mood over the next month. Consider the 'anticipation' level for future events. Return a JSON object with an array of mood points.
    
    Upcoming Events: ${JSON.stringify(futureItems.map(i => ({ title: i.title, date: i.dateISO, anticipation: i.payload?.anticipation })))}
    Past Data Context: User has ${pastItems.length} past entries.`;

    const responseText = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    projections: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                dateISO: { type: Type.STRING },
                                mood: { type: Type.NUMBER }
                            },
                            required: ['dateISO', 'mood']
                        }
                    }
                },
                required: ['projections']
            }
        }
    });
    const result = JSON.parse(responseText.trim());
    return result.projections as ProjectedMoodPoint[];
};

export const generatePrintableSummary = async (items: LifeItem[]): Promise<string> => {
    if (items.length === 0) {
        return "ამ პერიოდში ჩანაწერები არ მოიძებნა.";
    }
    const prompt = `Here are life events from a specific period. Write a concise, one-paragraph narrative summary of this period in Georgian.
    
    Events:
    ${items.map(i => `- ${dayjs(i.dateISO).format('YYYY-MM-DD')}: ${i.title} (Type: ${i.type})`).join('\n')}
    `;
    return generateContentWithRetry({ model: 'gemini-2.5-flash', contents: prompt });
};
