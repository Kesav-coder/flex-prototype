// ============================================
// Freaks AI - JavaScript Application
// ============================================

import { CONFIG } from './config.js';
import { FlashCardManager, Rating } from './anki-sm2.js';

// ============================================
// Firebase Authentication Setup
// ============================================

// Initialize Firebase with v9+ namespaced API (compat mode)
firebase.initializeApp(CONFIG.FIREBASE_CONFIG);

// Get Firebase Auth instance
const auth = firebase.auth();

// Initialize FirebaseUI
const ui = new firebaseui.auth.AuthUI(auth);

// FirebaseUI configuration
const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in
            const user = authResult.user;
            console.log('User signed in:', user.displayName || user.email);
            return false; // Don't redirect
        },
        uiShown: function() {
            // Hide loader when UI is shown
            const loader = document.getElementById('firebaseui-auth-loader');
            if (loader) loader.style.display = 'none';
        }
    },
    signInFlow: 'popup',
    signInSuccessUrl: window.location.href,
    signInOptions: [
        // Email/Password
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // Google
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // Phone Number
        {
            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            recaptchaParameters: {
                type: 'image',
                size: 'normal',
                badge: 'bottomleft'
            },
            defaultCountry: 'US' // Default to United States (+1)
        }
    ],
    tosUrl: '#', // Terms of Service URL
    privacyPolicyUrl: '#' // Privacy Policy URL
};

// Authentication state observer
let currentUser = null;

auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        // User is signed in
        console.log('Authenticated user:', user.displayName || user.email);
        document.getElementById('firebaseui-auth-container').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('app-content').style.display = 'block';
        updateUserInfo(user);
    } else {
        // User is signed out
        console.log('User signed out');
        document.getElementById('firebaseui-auth-container').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('app-content').style.display = 'none';
        // Start FirebaseUI
        ui.start('#firebaseui-auth-container', uiConfig);
    }
});

// Update user info display
function updateUserInfo(user) {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const photoURL = user.photoURL || 'https://via.placeholder.com/40';
        const displayName = user.displayName || user.email || 'User';
        userInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--card-bg, #1a1a2e); border-radius: 8px;">
                <img src="${photoURL}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%;">
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${displayName}</div>
                    <div style="font-size: 0.85em; opacity: 0.7;">${user.email}</div>
                </div>
                <button onclick="handleSignOut()" style="padding: 8px 16px; background: #ff4757; border: none; border-radius: 4px; color: white; cursor: pointer;">
                    Sign Out
                </button>
            </div>
        `;
    }
}

// Sign out function (make it global)
window.handleSignOut = function() {
    auth.signOut().then(() => {
        console.log('User signed out successfully');
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
};

// ============================================
// Existing Code
// ============================================

// Initialize FlashCard Manager with Anki SM-2 Algorithm
const flashcardManager = new FlashCardManager();

// ============================================
// Pomodoro Timer Manager
// ============================================

const TimerManager = {
    STUDY_DURATION: 25 * 60, // 25 minutes
    BREAK_DURATION: 5 * 60,  // 5 minutes

    startTimer: () => {
        if (state.timerRunning) return;
        
        // Start new session if not exists
        if (!state.currentSession) {
            state.currentSession = {
                startTime: Date.now(),
                endTime: null,
                cardsStudied: 0,
                topicsStudied: [],
                duration: 0
            };
        }
        
        state.timerRunning = true;
        state.timerInterval = setInterval(() => {
            if (state.timerSeconds > 0) {
                state.timerSeconds--;
                App.render();
            } else {
                TimerManager.timerComplete();
            }
        }, 1000);
        
        App.render();
    },

    pauseTimer: () => {
        state.timerRunning = false;
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
        App.render();
    },

    resetTimer: () => {
        TimerManager.pauseTimer();
        state.timerSeconds = state.timerMode === 'study' 
            ? TimerManager.STUDY_DURATION 
            : TimerManager.BREAK_DURATION;
        App.render();
    },

    timerComplete: () => {
        TimerManager.pauseTimer();
        
        if (state.timerMode === 'study') {
            // Study session complete
            Utils.showToast('🎉 Study session complete! Time for a break.');
            TimerManager.saveSession();
            state.timerMode = 'break';
            state.timerSeconds = TimerManager.BREAK_DURATION;
        } else {
            // Break complete
            Utils.showToast('✨ Break over! Ready for another session?');
            state.timerMode = 'study';
            state.timerSeconds = TimerManager.STUDY_DURATION;
            state.currentSession = null;
        }
        
        App.render();
    },

    saveSession: () => {
        if (!state.currentSession) return;
        
        state.currentSession.endTime = Date.now();
        state.currentSession.duration = Math.floor(
            (state.currentSession.endTime - state.currentSession.startTime) / 1000
        );
        
        state.sessions.unshift(state.currentSession);
        if (state.sessions.length > 50) {
            state.sessions = state.sessions.slice(0, 50);
        }
        
        localStorage.setItem('studySessions', JSON.stringify(state.sessions));
        
        // Award XP for session
        const minutes = Math.floor(state.currentSession.duration / 60);
        const sessionXP = GamificationManager.XP_PER_SESSION + (minutes * GamificationManager.XP_PER_MINUTE);
        GamificationManager.awardXP(sessionXP, `Completed ${minutes}min study session`);
        
        state.currentSession = null;
    },

    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    getTotalStudyTime: () => {
        return state.sessions.reduce((total, session) => total + session.duration, 0);
    },

    getTodayStudyTime: () => {
        const today = new Date().setHours(0, 0, 0, 0);
        return state.sessions
            .filter(s => new Date(s.startTime).setHours(0, 0, 0, 0) === today)
            .reduce((total, session) => total + session.duration, 0);
    }
};

// ============================================
// Stats & Progress Manager
// ============================================

const StatsManager = {
    updateStreak: () => {
        const today = new Date().setHours(0, 0, 0, 0);
        const lastDate = state.streak.lastStudyDate ? new Date(state.streak.lastStudyDate).setHours(0, 0, 0, 0) : null;
        
        if (!lastDate || lastDate < today) {
            const daysDiff = lastDate ? Math.floor((today - lastDate) / (24 * 60 * 60 * 1000)) : 0;
            
            if (daysDiff === 1 || !lastDate) {
                // Continue streak
                state.streak.current++;
            } else if (daysDiff > 1) {
                // Streak broken
                state.streak.current = 1;
            }
            
            state.streak.lastStudyDate = new Date().toISOString();
            if (state.streak.current > state.streak.longest) {
                state.streak.longest = state.streak.current;
            }
            
            localStorage.setItem('studyStreak', JSON.stringify(state.streak));
        }
    },

    getTotalCardsStudied: () => {
        const cards = flashcardManager.cards;
        return cards.filter(c => c.repetitions > 0).length;
    },

    getAverageAccuracy: () => {
        const cards = flashcardManager.cards.filter(c => c.repetitions > 0);
        if (cards.length === 0) return 0;
        
        const avgEaseFactor = cards.reduce((sum, c) => sum + c.easeFactor, 0) / cards.length;
        // Convert ease factor to percentage (2.5 = 100%, lower is worse)
        return Math.min(100, Math.max(0, ((avgEaseFactor - 1.3) / (2.5 - 1.3)) * 100));
    },

    getWeeklyStats: () => {
        const days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.setHours(0, 0, 0, 0);
            
            const daySessions = state.sessions.filter(s => {
                const sessionDate = new Date(s.startTime).setHours(0, 0, 0, 0);
                return sessionDate === dateStr;
            });
            
            days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                cards: daySessions.reduce((sum, s) => sum + (s.cardsStudied || 0), 0),
                time: daySessions.reduce((sum, s) => sum + s.duration, 0)
            });
        }
        
        return days;
    },

    getMonthlyStats: () => {
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const monthSessions = state.sessions.filter(s => s.startTime >= oneMonthAgo);
        
        return {
            sessions: monthSessions.length,
            cards: monthSessions.reduce((sum, s) => sum + (s.cardsStudied || 0), 0),
            totalTime: monthSessions.reduce((sum, s) => sum + s.duration, 0)
        };
    },

    generateSessionSummary: async (session) => {
        if (!state.apiKey) return null;
        
        const duration = Math.floor(session.duration / 60);
        const topics = session.topicsStudied.join(', ') || 'Various topics';
        
        const prompt = `Generate a brief, encouraging study session summary (2-3 sentences) for:
Duration: ${duration} minutes
Topics: ${topics}
Cards studied: ${session.cardsStudied}

Focus on: What was learned, progress made, and a motivational insight.`;

        try {
            const response = await GeminiAPI.generateText(prompt);
            return response;
        } catch (error) {
            console.error('Error generating session summary:', error);
            return `Great ${duration}-minute study session on ${topics}. Keep up the excellent work!`;
        }
    },

    getHeatmapData: () => {
        const heatmap = [];
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // Generate 365 days of data
        for (let i = 365; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.setHours(0, 0, 0, 0);
            
            const daySessions = state.sessions.filter(s => {
                const sessionDate = new Date(s.startTime).setHours(0, 0, 0, 0);
                return sessionDate === dateStr;
            });
            
            heatmap.push({
                date: new Date(dateStr),
                count: daySessions.length,
                cards: daySessions.reduce((sum, s) => sum + (s.cardsStudied || 0), 0)
            });
        }
        
        return heatmap;
    },

    renderHeatmap: (heatmapData, maxActivity) => {
        // Group by weeks
        const weeks = [];
        let week = [];
        
        heatmapData.forEach((day, index) => {
            week.push(day);
            if (day.date.getDay() === 6 || index === heatmapData.length - 1) {
                weeks.push([...week]);
                week = [];
            }
        });
        
        return weeks.map(week => `
            <div class="heatmap-week">
                ${week.map(day => {
                    const level = day.count === 0 ? 0 : 
                                 day.count === 1 ? 1 :
                                 day.count <= 3 ? 2 :
                                 day.count <= 5 ? 3 : 4;
                    return `
                        <div class="heatmap-day level-${level}" 
                             title="${day.date.toLocaleDateString()}: ${day.count} sessions, ${day.cards} cards"
                             data-date="${day.date.toISOString()}">
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');
    }
};

// ============================================
// Gamification Manager
// ============================================

const GamificationManager = {
    XP_PER_CARD: 10,
    XP_PER_MINUTE: 5,
    XP_PER_SESSION: 50,
    
    BADGES: [
        { id: 'first_card', name: 'First Steps', desc: 'Study your first flashcard', icon: 'fa-graduation-cap', xp: 1 },
        { id: 'ten_cards', name: 'Novice', desc: 'Study 10 flashcards', icon: 'fa-book', xp: 10 },
        { id: 'fifty_cards', name: 'Scholar', desc: 'Study 50 flashcards', icon: 'fa-bookmark', xp: 50 },
        { id: 'hundred_cards', name: 'Expert', desc: 'Study 100 flashcards', icon: 'fa-star', xp: 100 },
        { id: 'streak_3', name: 'Consistent', desc: '3-day study streak', icon: 'fa-fire', xp: 3 },
        { id: 'streak_7', name: 'Dedicated', desc: '7-day study streak', icon: 'fa-calendar-check', xp: 7 },
        { id: 'streak_30', name: 'Unstoppable', desc: '30-day study streak', icon: 'fa-trophy', xp: 30 },
        { id: 'hour_study', name: 'Time Keeper', desc: 'Study for 1 hour total', icon: 'fa-clock', xp: 60 },
        { id: 'ten_hours', name: 'Marathon', desc: 'Study for 10 hours total', icon: 'fa-hourglass-end', xp: 600 },
        { id: 'perfect_session', name: 'Perfectionist', desc: 'Complete session with 100% accuracy', icon: 'fa-bullseye', xp: 100 }
    ],

    calculateLevel: (xp) => {
        // Level formula: level = floor(sqrt(xp / 100))
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    },

    getXPForNextLevel: (currentXP) => {
        const currentLevel = GamificationManager.calculateLevel(currentXP);
        return (currentLevel * currentLevel) * 100;
    },

    awardXP: (amount, reason) => {
        state.gamification.xp += amount;
        state.gamification.totalXP += amount;
        
        const newLevel = GamificationManager.calculateLevel(state.gamification.totalXP);
        if (newLevel > state.gamification.level) {
            state.gamification.level = newLevel;
            Utils.showToast(`🎉 Level Up! You're now level ${newLevel}!`);
        }
        
        GamificationManager.checkBadges();
        GamificationManager.saveToStorage();
        
        return { xp: amount, reason };
    },

    checkBadges: () => {
        const totalCards = StatsManager.getTotalCardsStudied();
        const streak = state.streak.current;
        const totalTime = TimerManager.getTotalStudyTime();
        const totalHours = Math.floor(totalTime / 3600);
        
        const earnedBadges = [];
        
        GamificationManager.BADGES.forEach(badge => {
            if (state.gamification.badges.includes(badge.id)) return;
            
            let earned = false;
            
            switch(badge.id) {
                case 'first_card': earned = totalCards >= 1; break;
                case 'ten_cards': earned = totalCards >= 10; break;
                case 'fifty_cards': earned = totalCards >= 50; break;
                case 'hundred_cards': earned = totalCards >= 100; break;
                case 'streak_3': earned = streak >= 3; break;
                case 'streak_7': earned = streak >= 7; break;
                case 'streak_30': earned = streak >= 30; break;
                case 'hour_study': earned = totalHours >= 1; break;
                case 'ten_hours': earned = totalHours >= 10; break;
            }
            
            if (earned) {
                state.gamification.badges.push(badge.id);
                earnedBadges.push(badge);
                GamificationManager.awardXP(badge.xp, `Earned badge: ${badge.name}`);
                Utils.showToast(`🏆 Badge Unlocked: ${badge.name}!`);
            }
        });
        
        return earnedBadges;
    },

    saveToStorage: () => {
        localStorage.setItem('gamification', JSON.stringify(state.gamification));
    },

    getBadgeInfo: (badgeId) => {
        return GamificationManager.BADGES.find(b => b.id === badgeId);
    }
};

// State Management
const state = {
    sources: [],
    messages: [],
    currentTab: 'upload',
    projectName: 'Untitled Project',
    outputs: [],
    theme: localStorage.getItem('theme') || 'dark',
    apiKey: localStorage.getItem('geminiApiKey') || CONFIG.GEMINI_API_KEY,
    isLoading: false,
    isUploading: false,
    uploadProgress: '',
    expandedSource: null,
    showSummaryModal: false,
    currentSummary: null,
    showFlashcardModal: false,
    currentFlashcard: null,
    flashcardRevealed: false,
    // Timer & Session Tracking
    showTimerModal: false,
    showStatsModal: false,
    showHistoryModal: false,
    timerRunning: false,
    timerMode: 'study', // 'study' or 'break'
    timerSeconds: 25 * 60, // 25 minutes in seconds
    timerInterval: null,
    currentSession: null,
    sessions: JSON.parse(localStorage.getItem('studySessions') || '[]'),
    streak: JSON.parse(localStorage.getItem('studyStreak') || '{"current": 0, "longest": 0, "lastStudyDate": null}'),
    selectedSession: null,
    sessionSummary: null,
    // Gamification
    gamification: JSON.parse(localStorage.getItem('gamification') || '{"xp": 0, "totalXP": 0, "level": 1, "badges": []}'),
    // Games
    showGamesModal: false,
    currentGame: null,
    // Source Validation
    showSourceValidationModal: false,
    validationTopic: '',
    validationQuery: '',
    validationContent: '',
    validationResults: null,
    isValidating: false,
    validationTab: 'validated' // 'validated', 'corrections', 'sources'
};

// Apply initial theme
document.documentElement.setAttribute('data-theme', state.theme);

// ============================================
// Dynamic Source Validation System
// ============================================

const SourceValidation = {
    // Store search results and user selections
    searchResults: [],
    selectedSources: [],
    isSearching: false,
    
    // Predefined trusted domains (fallback)
    trustedDomains: [
        'wikipedia.org',
        'who.int',
        'cdc.gov',
        'un.org',
        'nih.gov',
        'nature.com',
        'sciencedirect.com',
        'ncbi.nlm.nih.gov',
        'edu' // Educational institutions
    ],
    
    // Search the web for relevant sources
    async searchSources(topic, query) {
        // Note: isSearching is set by the calling action
        
        try {
            // Use Gemini to search and find relevant sources
            const searchPrompt = `You are a research librarian. Find 6-8 authoritative sources for fact-checking content about: "${query}" in the context of "${topic}".

For each source, provide real, accessible URLs from these categories:
- Wikipedia (for encyclopedic knowledge)
- Government websites (.gov) like CDC, NIH, NASA
- International organizations (WHO, UN, UNESCO)
- Educational institutions (.edu)
- Peer-reviewed journals (Nature, Science, NCBI)
- Reputable medical/scientific institutions

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "title": "Specific article/page title",
    "url": "https://real-actual-url.com/path",
    "domain": "example.com",
    "description": "What factual information this source provides about ${query}",
    "reliability": "high",
    "type": "academic"
  }
]

Reliability: high/medium/low
Type: academic/government/encyclopedia/news/medical

Provide diverse, complementary sources. Return ONLY the JSON array.`;

            const response = await GeminiAPI.call(searchPrompt);
            
            // Parse the response
            let sources = [];
            try {
                // Remove markdown code blocks if present
                let cleanedResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                
                // Try to find JSON array
                const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    sources = JSON.parse(jsonMatch[0]);
                    
                    // Validate sources have required fields
                    sources = sources.filter(s => 
                        s.title && s.url && s.domain && s.description
                    );
                    
                    if (sources.length === 0) {
                        throw new Error('No valid sources in response');
                    }
                } else {
                    throw new Error('No JSON array found in response');
                }
            } catch (e) {
                console.error('Failed to parse sources:', e);
                console.log('Raw response:', response);
                sources = this.generateFallbackSources(topic, query);
            }
            
            // Add metadata
            sources.forEach((source, index) => {
                source.id = `source_${Date.now()}_${index}`;
                source.selected = false;
                source.isTrusted = this.isTrustedDomain(source.url);
            });
            
            this.searchResults = sources;
            return sources;
            
        } catch (error) {
            console.error('Error searching sources:', error);
            // Return fallback sources instead of throwing
            const fallbackSources = this.generateFallbackSources(topic, query);
            this.searchResults = fallbackSources;
            return fallbackSources;
        }
    },
    
    // Generate fallback sources if search fails
    generateFallbackSources(topic, query) {
        const searchTerm = query || topic;
        return [
            {
                id: `fallback_${Date.now()}_1`,
                title: `Wikipedia - ${topic}`,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/\s+/g, '_'))}`,
                domain: 'wikipedia.org',
                description: `Encyclopedia article about ${topic}`,
                reliability: 'high',
                type: 'encyclopedia',
                selected: true,
                isTrusted: true
            },
            {
                id: `fallback_${Date.now()}_2`,
                title: `Google Scholar - ${topic}`,
                url: `https://scholar.google.com/scholar?q=${encodeURIComponent(searchTerm)}`,
                domain: 'scholar.google.com',
                description: `Academic papers and research about ${topic}`,
                reliability: 'high',
                type: 'academic',
                selected: false,
                isTrusted: true
            },
            {
                id: `fallback_${Date.now()}_3`,
                title: `PubMed - ${topic}`,
                url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(searchTerm)}`,
                domain: 'ncbi.nlm.nih.gov',
                description: `Medical and life sciences research about ${topic}`,
                reliability: 'high',
                type: 'medical',
                selected: false,
                isTrusted: true
            }
        ];
    },
    
    // Check if URL is from a trusted domain
    isTrustedDomain(url) {
        return this.trustedDomains.some(domain => 
            url.toLowerCase().includes(domain)
        );
    },
    
    // Toggle source selection
    toggleSource(sourceId) {
        const source = this.searchResults.find(s => s.id === sourceId);
        if (source) {
            source.selected = !source.selected;
            this.updateSelectedSources();
        }
    },
    
    // Select all sources
    selectAll() {
        this.searchResults.forEach(s => s.selected = true);
        this.updateSelectedSources();
    },
    
    // Deselect all sources
    deselectAll() {
        this.searchResults.forEach(s => s.selected = false);
        this.updateSelectedSources();
    },
    
    // Update selected sources array
    updateSelectedSources() {
        this.selectedSources = this.searchResults.filter(s => s.selected);
    },
    
    // Fetch content from selected sources
    async fetchSourceContent(source) {
        try {
            const prompt = `You are accessing the authoritative source: "${source.title}" at ${source.url}

Provide a comprehensive summary of the key factual information that would be found in this source, focusing on:
1. Main facts, claims, and statements
2. Statistical data and measurements
3. Scientific definitions and explanations
4. Expert opinions and authoritative statements
5. Key findings or conclusions

Format: Plain text summary (400-600 words)
Do NOT make up facts. Only include information that would realistically be found in this type of source from this institution.`;

            const content = await GeminiAPI.call(prompt);
            return {
                sourceId: source.id,
                url: source.url,
                title: source.title,
                content: content,
                fetchedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Failed to fetch ${source.url}:`, error);
            return {
                sourceId: source.id,
                url: source.url,
                title: source.title,
                content: `[Unable to fetch content from ${source.title}. Please verify manually at ${source.url}]`,
                fetchedAt: new Date().toISOString(),
                error: true
            };
        }
    },
    
    // Fetch all selected sources
    async fetchAllSelectedSources() {
        const fetchPromises = this.selectedSources.map(source => 
            this.fetchSourceContent(source)
        );
        
        const results = await Promise.all(fetchPromises);
        return results.filter(r => r !== null);
    },
    
    // Validate content against selected sources
    async validateContent(contentToValidate, sourcesContent) {
        const referenceText = sourcesContent
            .filter(s => !s.error)
            .map(s => `[${s.title}]\n${s.content}`)
            .join('\n\n---\n\n');
        
        if (!referenceText.trim()) {
            throw new Error('No valid reference content available. Please check your sources.');
        }
        
        const validationPrompt = `You are a rigorous fact-checker. Cross-check the CONTENT against the REFERENCE SOURCES below.

=== REFERENCE SOURCES ===
${referenceText}

=== CONTENT TO VALIDATE ===
${contentToValidate}

=== VALIDATION INSTRUCTIONS ===
For EACH statement in the content:
1. If it matches reference sources → Add: [✓ VERIFIED | Source: source name]
2. If it contradicts references → Add: [✓ CORRECTED: "wrong text" → "correct text" | Source: source name]
3. If uncertain/ambiguous → Add: [⚠️ NEEDS VERIFICATION: explain why]
4. If not found in references → Add: [ℹ️ NOT IN REFERENCE]

Be thorough. Mark ALL factual claims. Preserve the original text structure.

Return the complete content with inline markers.`;

        try {
            const validatedContent = await GeminiAPI.call(validationPrompt);
            
            // Extract corrections
            const corrections = this.extractCorrections(contentToValidate, validatedContent);
            
            return {
                validatedContent,
                corrections,
                sourcesUsed: sourcesContent.map(s => ({
                    title: s.title,
                    url: s.url
                }))
            };
        } catch (error) {
            console.error('Validation error:', error);
            throw error;
        }
    },
    
    // Extract corrections from validated content
    extractCorrections(original, validated) {
        const corrections = [];
        const correctionRegex = /\[✓ CORRECTED: "(.*?)" → "(.*?)" \| Source: (.*?)\]/g;
        
        let match;
        while ((match = correctionRegex.exec(validated)) !== null) {
            corrections.push({
                original: match[1],
                corrected: match[2],
                source: match[3],
                timestamp: new Date().toISOString()
            });
        }
        
        return corrections;
    },
    
    // Clear search results
    clearResults() {
        this.searchResults = [];
        this.selectedSources = [];
    }
};

// ============================================
// Gemini API Service
// ============================================

// API Error Handler Utility
const APIErrorHandler = {
    async parseError(response) {
        const status = response.status;
        let errorData;
        
        try {
            const text = await response.text();
            errorData = JSON.parse(text);
        } catch (e) {
            errorData = { error: { message: 'Unknown error occurred' } };
        }

        const errorMessage = errorData.error?.message || errorData.message || 'API request failed';
        const errorCode = errorData.error?.code || status;

        // Detect specific error types and return structured error
        if (status === 429 || errorMessage.toLowerCase().includes('quota') || 
            errorMessage.toLowerCase().includes('rate limit')) {
            const error = new Error(`⏱️ RATE LIMIT: API quota exceeded. Please wait a moment...`);
            error.isRateLimit = true;
            error.retryAfter = this.extractRetryTime(errorMessage);
            throw error;
        }
        
        if (status === 401 || status === 403 || 
            errorMessage.toLowerCase().includes('api key not valid') ||
            errorMessage.toLowerCase().includes('invalid api key')) {
            throw new Error(`🔑 INVALID API KEY: ${errorMessage}. Please check your API key in Settings.`);
        }
        
        if (status === 400) {
            throw new Error(`❌ BAD REQUEST: ${errorMessage}`);
        }
        
        if (status === 500 || status === 503) {
            throw new Error(`🔧 SERVER ERROR: Google's servers are having issues. Please try again later. (${status})`);
        }
        
        // Generic error
        throw new Error(`API Error (${errorCode}): ${errorMessage}`);
    },
    
    extractRetryTime(message) {
        // Extract retry time from message like "Please retry in 20.424119486s"
        const match = message.match(/retry in (\d+\.?\d*)/i);
        if (match) {
            return Math.ceil(parseFloat(match[1])) + 2; // Add 2 second buffer
        }
        return 25; // Default 25 seconds
    }
};

const GeminiAPI = {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent',
    fileUploadUrl: 'https://generativelanguage.googleapis.com/upload/v1beta/files',
    lastCallTime: 0,
    minInterval: 6500, // 6.5 seconds between calls (safe for 10 req/min limit)

    async throttle() {
        const now = Date.now();
        const elapsed = now - this.lastCallTime;
        if (elapsed < this.minInterval) {
            const waitTime = this.minInterval - elapsed;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastCallTime = Date.now();
    },

    async callWithRetry(prompt, fileUri = null, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.throttle(); // Rate limiting
                return await this._call(prompt, fileUri);
            } catch (error) {
                if (error.isRateLimit && attempt < maxRetries) {
                    const waitTime = error.retryAfter || 25;
                    Utils.showToast(`⏱️ Rate limited. Waiting ${waitTime}s... (Attempt ${attempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                    continue;
                }
                throw error;
            }
        }
    },

    async call(prompt, fileUri = null) {
        return this.callWithRetry(prompt, fileUri);
    },

    async _call(prompt, fileUri = null) {
        if (!state.apiKey) {
            throw new Error('API key not set. Please add your Gemini API key in settings.');
        }

        const parts = [];
        if (fileUri) {
            parts.push({ fileData: { mimeType: 'application/pdf', fileUri: fileUri } });
        }
        parts.push({ text: prompt });

        const response = await fetch(`${this.baseUrl}?key=${state.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            await APIErrorHandler.parseError(response);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    },

    async uploadFile(file) {
        if (!state.apiKey) {
            throw new Error('API key not set. Please add your Gemini API key in settings.');
        }

        await this.throttle(); // Rate limiting

        // Step 1: Start resumable upload
        try {
            const startResponse = await fetch(`${this.fileUploadUrl}?key=${state.apiKey}`, {
                method: 'POST',
                headers: {
                    'X-Goog-Upload-Protocol': 'resumable',
                    'X-Goog-Upload-Command': 'start',
                    'X-Goog-Upload-Header-Content-Length': file.size,
                    'X-Goog-Upload-Header-Content-Type': file.type,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file: { displayName: file.name }
                })
            });

            if (!startResponse.ok) {
                console.error('Upload initiation failed - Status:', startResponse.status);
                await APIErrorHandler.parseError(startResponse);
            }

            const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL');
            
            if (!uploadUrl) {
                throw new Error('No upload URL received from server');
            }

            // Step 2: Upload file content
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'X-Goog-Upload-Command': 'upload, finalize',
                    'X-Goog-Upload-Offset': '0',
                    'Content-Type': file.type
                },
                body: file
            });

            if (!uploadResponse.ok) {
                console.error('File upload failed - Status:', uploadResponse.status);
                await APIErrorHandler.parseError(uploadResponse);
            }

            const fileData = await uploadResponse.json();
            return fileData.file;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    },

    async waitForFileProcessing(fileName) {
        const maxAttempts = 30;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${state.apiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to check file status');
            }

            const fileData = await response.json();

            if (fileData.state === 'ACTIVE') {
                return fileData;
            } else if (fileData.state === 'FAILED') {
                throw new Error('File processing failed');
            }

            // Wait 2 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }

        throw new Error('File processing timeout');
    },

    async summarizeFile(fileUri, mimeType) {
        const prompt = 'Please provide a comprehensive summary of this document. Include the main points, key insights, and important details.';
        
        const response = await fetch(`${this.baseUrl}?key=${state.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { fileData: { mimeType: mimeType, fileUri: fileUri } },
                        { text: prompt }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            await APIErrorHandler.parseError(response);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated';
    },

    async extractTextFromFile(fileUri, mimeType) {
        const prompt = 'Extract and return all the text content from this document. Return the complete text as-is.';
        
        const response = await fetch(`${this.baseUrl}?key=${state.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { fileData: { mimeType: mimeType, fileUri: fileUri } },
                        { text: prompt }
                    ]
                }],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 8192,
                }
            })
        });

        if (!response.ok) {
            await APIErrorHandler.parseError(response);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },

    async summarize(text) {
        const prompt = `Please provide a comprehensive summary of the following text. Include the main points, key insights, and important details:\n\n${text}`;
        return this.call(prompt);
    },

    async fetchAndSummarizeUrl(url) {
        const prompt = `Please fetch and analyze the content from this URL: ${url}\n\nProvide:\n1. A brief title or description of the page\n2. A comprehensive summary of the main content\n3. Key points and insights\n\nIf you cannot directly access the URL, please explain that web scraping would be needed.`;
        return this.call(prompt);
    },

    async generateFlashcards(text) {
        const prompt = `Based on the following text, create 10 study flashcards in JSON format. Each flashcard should have a "question" and "answer" field. Return only valid JSON array:\n\n${text}`;
        return this.call(prompt);
    },

    async generateQuiz(text) {
        const prompt = `Based on the following text, create a 10-question multiple choice quiz in JSON format. Each question should have: "question", "options" (array of 4 choices), and "correct" (index of correct answer). Return only valid JSON array:\n\n${text}`;
        return this.call(prompt);
    },

    async generateMindMap(text) {
        const prompt = `Based on the following text, create a mind map structure in JSON format with a central topic and branches. Format: {"center": "main topic", "branches": [{"name": "branch", "children": ["item1", "item2"]}]}. Return only valid JSON:\n\n${text}`;
        return this.call(prompt);
    },

    async chat(question, context) {
        const prompt = `Based on the following context, answer the user's question.\n\nContext:\n${context}\n\nQuestion: ${question}\n\nProvide a helpful and accurate answer based on the context provided.`;
        return this.call(prompt);
    }
};

// ============================================
// Component Definitions
// ============================================

const Components = {
    // Header Component
    Header: () => `
        <header class="header">
            <div class="header-left">
                <div class="logo">
                    <span class="logo-text">⚡ Freaks</span>
                    <span class="logo-ai">AI</span>
                </div>
                <div class="level-display">
                    <div class="level-badge">
                        <i class="fas fa-star"></i>
                        <span>Level ${state.gamification.level}</span>
                    </div>
                    <div class="xp-bar">
                        <div class="xp-fill" style="width: ${(state.gamification.xp / (GamificationManager.getXPForNextLevel(state.gamification.totalXP) - ((state.gamification.level - 1) * (state.gamification.level - 1) * 100))) * 100}%"></div>
                    </div>
                    <div class="xp-text">${state.gamification.xp} / ${GamificationManager.getXPForNextLevel(state.gamification.totalXP) - ((state.gamification.level - 1) * (state.gamification.level - 1) * 100)} XP</div>
                </div>
            </div>
            <div class="header-center">
                <input type="text" class="project-name" value="${state.projectName}" id="projectName" />
            </div>
            <div class="header-right">
                <button class="btn btn-ghost" data-action="openStats" title="Progress & Stats">
                    <i class="fas fa-chart-line"></i>
                </button>
                <button class="btn btn-ghost" data-action="openHistory" title="Session History">
                    <i class="fas fa-history"></i>
                </button>
                <button class="btn btn-ghost ${state.timerRunning ? 'timer-active' : ''}" data-action="openTimer" title="Study Timer">
                    <i class="fas fa-clock"></i>
                    ${state.timerRunning ? `<span class="timer-badge">${TimerManager.formatTime(state.timerSeconds)}</span>` : ''}
                </button>
                <button class="btn btn-ghost" data-action="openGames" title="Educational Games">
                    <i class="fas fa-gamepad"></i>
                </button>
                <button class="btn btn-ghost" data-action="openValidation" title="Source Validation">
                    <i class="fas fa-shield-halved"></i>
                </button>
                <button class="btn btn-ghost" data-action="openSettings" title="Settings">
                    <i class="fas fa-cog"></i>
                </button>
                <button class="btn btn-ghost" data-action="toggleTheme" title="Toggle theme">
                    <i class="fas ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                </button>
                <div class="user-avatar">U</div>
            </div>
        </header>
    `,

    // Sources Panel Component
    SourcesPanel: () => `
        <aside class="panel sources-panel">
            <div class="panel-header">
                <h2><i class="fas fa-layer-group"></i> Knowledge Base</h2>
                <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>

            <button class="add-sources-btn" data-action="openUpload">
                <i class="fas fa-plus-circle"></i> Add Knowledge
            </button>

            <div class="quick-actions">
                <button class="quick-btn" data-action="openUpload" data-tab="upload">
                    <i class="fas fa-file-pdf"></i>
                    <span>PDF</span>
                </button>
                <button class="quick-btn" data-action="openUpload" data-tab="paste">
                    <i class="fas fa-paste"></i>
                    <span>Paste</span>
                </button>
                <button class="quick-btn" data-action="openUpload" data-tab="link">
                    <i class="fas fa-link"></i>
                    <span>URL</span>
                </button>
                <button class="quick-btn" data-action="openUpload" data-tab="upload">
                    <i class="fas fa-microphone"></i>
                    <span>Audio</span>
                </button>
            </div>

            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search sources..." id="searchSources">
            </div>

            <!-- Uploaded Files Section (always visible) -->
            ${state.sources.length > 0 ? `
                <div class="source-section">
                    <div class="source-section-header">
                        <i class="fas fa-upload"></i>
                        <span>Uploaded Files</span>
                        <span class="source-count">${state.sources.length}</span>
                    </div>
                    <div class="sources-list">
                        ${state.sources.map((source, index) => `
                            <div class="source-item-wrapper">
                                <div class="source-item" data-index="${index}" data-action="viewSummary" data-source-index="${index}">
                                    <i class="fas ${Utils.getFileIcon(source.type)} icon" style="color: ${Utils.getIconColor(source.type)}"></i>
                                    <div class="source-info">
                                        <span class="name">${source.name}</span>
                                        ${source.summary ? `<span class="summary-preview"><i class="fas fa-sparkles"></i> ${source.summary.substring(0, 50)}...</span>` : ''}
                                    </div>
                                    <button class="btn-icon delete-source" data-action="deleteSource" data-index="${index}"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="sources-empty-state">
                    <div class="empty-illustration">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <p class="empty-title">No sources yet</p>
                    <p class="empty-desc">Add documents, links, or text to build your knowledge base</p>
                </div>
            `}
        </aside>
    `,

    SourcesEmpty: () => `
        <div class="sources-empty-state">
            <div class="empty-illustration">
                <i class="fas fa-folder-open"></i>
            </div>
            <p class="empty-title">No sources yet</p>
            <p class="empty-desc">Add documents, links, or text to build your knowledge base</p>
        </div>
    `,

    SourcesList: () => `
        <div class="sources-list">
            ${state.sources.map((source, index) => `
                <div class="source-item-wrapper">
                    <div class="source-item" data-index="${index}" data-action="viewSummary" data-source-index="${index}">
                        <i class="fas ${Utils.getFileIcon(source.type)} icon" style="color: ${Utils.getIconColor(source.type)}"></i>
                        <div class="source-info">
                            <span class="name">${source.name}</span>
                            ${source.summary ? `<span class="summary-preview"><i class="fas fa-sparkles"></i> ${source.summary.substring(0, 50)}...</span>` : ''}
                        </div>
                        <button class="btn-icon delete-source" data-action="deleteSource" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('')}
        </div>
    `,

    // Chat Panel Component
    ChatPanel: () => `
        <section class="panel chat-panel">
            <div class="chat-content" id="chatContent">
                ${state.sources.length === 0 ? Components.HeroSection() : Components.ChatMessages()}
            </div>

            <div class="chat-input-bar">
                <div class="input-wrapper">
                    <button class="attach-btn" data-action="openUpload"><i class="fas fa-paperclip"></i></button>
                    <input type="text" placeholder="${state.sources.length > 0 ? 'Ask anything about your knowledge...' : 'Add sources to start chatting...'}" id="chatInput">
                    <div class="input-actions">
                        <span class="source-badge"><i class="fas fa-database"></i> ${state.sources.length}</span>
                        <button class="send-btn" data-action="sendMessage"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        </section>
    `,

    HeroSection: () => `
        <div class="chat-empty-state">
            <div class="hero-section">
                <div class="hero-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <h2>Welcome to Freaks AI</h2>
                <p class="hero-subtitle">Your intelligent knowledge companion</p>
                <div class="hero-actions">
                    <button class="hero-btn primary" data-action="openUpload" data-tab="upload">
                        <i class="fas fa-upload"></i> Upload Content
                    </button>
                    <button class="hero-btn secondary" data-action="openUpload" data-tab="paste">
                        <i class="fas fa-edit"></i> Paste Text
                    </button>
                </div>
                <div class="hero-features">
                    <div class="hero-feature">
                        <i class="fas fa-bolt"></i>
                        <span>Instant Analysis</span>
                    </div>
                    <div class="hero-feature">
                        <i class="fas fa-graduation-cap"></i>
                        <span>Smart Flashcards</span>
                    </div>
                    <div class="hero-feature">
                        <i class="fas fa-podcast"></i>
                        <span>Audio Summaries</span>
                    </div>
                </div>
            </div>
        </div>
    `,

    ChatMessages: () => `
        <div class="messages-container">
            ${state.messages.length === 0 ? `
                <div class="start-chat">
                    <i class="fas fa-comments"></i>
                    <p>Start a conversation about your ${state.sources.length} source(s)</p>
                </div>
            ` : state.messages.map(msg => `
                <div class="chat-message ${msg.role}">
                    <div class="message-content">
                        <p>${msg.content}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `,

    // Tools Panel Component
    ToolsPanel: () => `
        <aside class="panel tools-panel">
            <div class="panel-header">
                <h2><i class="fas fa-wand-magic-sparkles"></i> AI Tools</h2>
                <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>

            <div class="tools-grid">
                ${Components.ToolCard('audio', 'purple', 'fa-headphones', 'Audio Summary', 'Listen to your content')}
                ${Components.ToolCard('flashcards', 'green', 'fa-clone', 'Flashcards', 'Study & memorize')}
                ${Components.ToolCard('quiz', 'orange', 'fa-brain', 'Quiz Me', 'Test your knowledge')}
                ${Components.ToolCard('mindmap', 'blue', 'fa-diagram-project', 'Mind Map', 'Visualize concepts')}
                ${Components.ToolCard('summary', 'pink', 'fa-file-lines', 'Summary', 'Detailed reports')}
                ${Components.ToolCard('slides', 'cyan', 'fa-desktop', 'Slides', 'Presentations')}
            </div>

            <div class="divider"></div>

            <div class="panel-header">
                <h2><i class="fas fa-clock-rotate-left"></i> Recent</h2>
            </div>

            ${state.outputs.length === 0 ? `
                <div class="recent-empty">
                    <p>Generated content will appear here</p>
                </div>
            ` : Components.OutputsList()}
        </aside>
    `,

    ToolCard: (id, color, icon, name, desc) => `
        <button class="tool-card" data-action="openTool" data-tool="${id}">
            <div class="tool-icon ${color}"><i class="fas ${icon}"></i></div>
            <div class="tool-info">
                <span class="tool-name">${name}</span>
                <span class="tool-desc">${desc}</span>
            </div>
        </button>
    `,

    OutputsList: () => `
        <div class="outputs-list">
            ${state.outputs.map((output, index) => `
                <div class="output-item">
                    <i class="fas ${output.icon}"></i>
                    <span>${output.name}</span>
                    <span class="output-time">${output.time}</span>
                </div>
            `).join('')}
        </div>
    `,

    // Upload Modal Component
    UploadModal: () => `
        <div class="modal ${state.showUploadModal ? 'active' : ''}" id="uploadModal">
            <div class="modal-content upload-modal">
                <div class="modal-header">
                    <h3>Add Knowledge</h3>
                    ${!state.isUploading ? `<button class="close-btn" data-action="closeUpload">&times;</button>` : ''}
                </div>
                <div class="modal-body">
                    ${state.isUploading ? `
                        <div class="upload-loading-state">
                            <div class="spinner"></div>
                            <p class="upload-status">${state.uploadProgress}</p>
                            <p class="upload-hint">This may take a moment depending on file size...</p>
                        </div>
                    ` : `
                    <div class="upload-tabs">
                        <button class="tab-btn ${state.currentTab === 'upload' ? 'active' : ''}" data-tab="upload">Upload</button>
                        <button class="tab-btn ${state.currentTab === 'paste' ? 'active' : ''}" data-tab="paste">Paste Text</button>
                        <button class="tab-btn ${state.currentTab === 'link' ? 'active' : ''}" data-tab="link">Link / URL</button>
                    </div>

                    <div class="tab-content ${state.currentTab === 'upload' ? 'active' : ''}" id="uploadTab">
                        <div class="upload-dropzone" id="dropzone">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop files here</p>
                            <span>or</span>
                            <button class="browse-btn" data-action="browseFiles">Browse files</button>
                            <input type="file" id="fileInput" multiple accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.wav" hidden>
                            <p class="file-types">Supported: PDF, DOC, TXT, MP3, MP4, WAV</p>
                        </div>
                    </div>

                    <div class="tab-content ${state.currentTab === 'paste' ? 'active' : ''}" id="pasteTab">
                        <div class="paste-section">
                            <label for="sourceTitle">Title</label>
                            <input type="text" id="sourceTitle" placeholder="Enter a title for your source">
                            <label for="sourceText">Content</label>
                            <textarea id="sourceText" placeholder="Paste or type your text here..."></textarea>
                        </div>
                    </div>

                    <div class="tab-content ${state.currentTab === 'link' ? 'active' : ''}" id="linkTab">
                        <div class="link-section">
                            <label for="sourceUrl">URL</label>
                            <input type="url" id="sourceUrl" placeholder="https://example.com/article">
                            <p class="link-hint">Enter a website URL, YouTube video, or Google Drive link</p>
                        </div>
                    </div>
                    `}
                </div>
                ${!state.isUploading ? `
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="closeUpload">Cancel</button>
                    <button class="btn btn-primary" data-action="addSource"><i class="fas fa-sparkles"></i> Add & Summarize</button>
                </div>
                ` : ''}
            </div>
        </div>
    `,

    // Tool Modal Component
    ToolModal: () => `
        <div class="modal ${state.showToolModal ? 'active' : ''}" id="toolModal">
            <div class="modal-content tool-modal-content">
                <div class="modal-header">
                    <h3>${state.currentTool?.name || 'Feature'}</h3>
                    <button class="close-btn" data-action="closeTool">&times;</button>
                </div>
                <div class="modal-body">
                    ${!state.apiKey ? `
                        <div class="api-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Please add your Gemini API key in <button class="link-btn" data-action="openSettings">Settings</button> to use AI features.</p>
                        </div>
                    ` : state.sources.length === 0 ? `
                        <p class="no-sources-msg">Please add sources first to use this feature.</p>
                    ` : state.isLoading ? `
                        <div class="loading-state">
                            <div class="spinner"></div>
                            <p>Generating ${state.currentTool?.name || 'content'}...</p>
                        </div>
                    ` : state.toolResult ? `
                        <div class="tool-result">
                            <div class="result-content">${state.toolResult}</div>
                            <button class="btn btn-secondary" data-action="copyResult"><i class="fas fa-copy"></i> Copy</button>
                        </div>
                    ` : `
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">
                            Generate ${state.currentTool?.name || 'content'} from your ${state.sources.length} source(s).
                        </p>
                        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color);">
                            <p style="font-size: 13px; color: var(--text-muted);">
                                ✨ This will use Gemini AI to analyze your sources and create ${state.currentTool?.name?.toLowerCase() || 'content'}.
                            </p>
                        </div>
                    `}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="closeTool">${state.toolResult ? 'Close' : 'Cancel'}</button>
                    ${state.sources.length > 0 && state.apiKey && !state.isLoading && !state.toolResult ? `
                        <button class="btn btn-primary" data-action="generateTool"><i class="fas fa-wand-magic-sparkles"></i> Generate</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `,

    // Settings Modal Component
    SettingsModal: () => `
        <div class="modal ${state.showSettingsModal ? 'active' : ''}" id="settingsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Settings</h3>
                    <button class="close-btn" data-action="closeSettings">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <p style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                            <i class="fas fa-cog" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
                            Settings panel
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="closeSettings">Close</button>
                </div>
            </div>
        </div>
    `,

    // Source Validation Modal Component
    SourceValidationModal: () => `
        <div class="modal ${state.showSourceValidationModal ? 'active' : ''}" id="sourceValidationModal">
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-shield-check"></i> Source Validation & Fact Checking</h3>
                    <button class="close-btn" data-action="closeValidation">&times;</button>
                </div>
                <div class="modal-body">
                    ${!SourceValidation.searchResults.length && !SourceValidation.isSearching ? `
                        <!-- Search Sources Interface -->
                        <div class="validation-search-section">
                            <h4><i class="fas fa-search"></i> Search for Reference Sources</h4>
                            <p class="helper-text">Find authoritative sources to validate your content against</p>
                            
                            <div class="form-group">
                                <label for="validationTopic">Topic/Subject</label>
                                <input type="text" id="validationTopic" placeholder="e.g., Climate Change, Human Biology, Machine Learning" value="${state.validationTopic}">
                            </div>
                            
                            <div class="form-group">
                                <label for="validationQuery">Specific Query</label>
                                <input type="text" id="validationQuery" placeholder="e.g., greenhouse gas emissions, cardiovascular system" value="${state.validationQuery}">
                            </div>
                            
                            <button class="btn btn-primary" data-action="searchValidationSources">
                                <i class="fas fa-search"></i> Search Sources
                            </button>
                        </div>
                    ` : ''}
                    
                    ${SourceValidation.isSearching ? `
                        <!-- Searching State -->
                        <div class="validation-loading">
                            <div class="spinner"></div>
                            <p>Searching for authoritative sources...</p>
                        </div>
                    ` : ''}
                    
                    ${SourceValidation.searchResults.length > 0 ? `
                        <!-- Source Selection Interface -->
                        <div class="validation-sources-section">
                            <div class="sources-header">
                                <h4><i class="fas fa-list-check"></i> Select Sources (${SourceValidation.selectedSources.length} selected)</h4>
                                <div class="sources-actions">
                                    <button class="btn btn-sm btn-ghost" data-action="selectAllSources">
                                        <i class="fas fa-check-double"></i> Select All
                                    </button>
                                    <button class="btn btn-sm btn-ghost" data-action="deselectAllSources">
                                        <i class="fas fa-times"></i> Clear All
                                    </button>
                                    <button class="btn btn-sm btn-secondary" data-action="newSourceSearch">
                                        <i class="fas fa-rotate"></i> New Search
                                    </button>
                                </div>
                            </div>
                            
                            <div class="sources-grid">
                                ${SourceValidation.searchResults.map(source => `
                                    <div class="validation-source-card ${source.selected ? 'selected' : ''} ${source.isTrusted ? 'trusted' : ''}" 
                                         data-source-id="${source.id}" 
                                         data-action="toggleValidationSource"
                                         style="cursor: pointer;">
                                        <div class="source-card-header">
                                            <div class="source-checkbox">
                                                <i class="fas ${source.selected ? 'fa-check-square' : 'fa-square'}" style="pointer-events: none;"></i>
                                            </div>
                                            <div class="source-badges">
                                                ${source.isTrusted ? '<span class="badge trusted"><i class="fas fa-shield-halved"></i> Trusted</span>' : ''}
                                                <span class="badge ${source.reliability === 'high' ? 'success' : source.reliability === 'medium' ? 'warning' : 'neutral'}">${source.reliability}</span>
                                                <span class="badge type">${source.type}</span>
                                            </div>
                                        </div>
                                        
                                        <h5 class="source-title" style="pointer-events: none;">${source.title}</h5>
                                        <p class="source-domain" style="pointer-events: none;"><i class="fas fa-globe"></i> ${source.domain}</p>
                                        <p class="source-description" style="pointer-events: none;">${source.description}</p>
                                        
                                        <a href="${source.url}" target="_blank" class="source-link" onclick="event.stopPropagation();">
                                            View Source <i class="fas fa-external-link-alt"></i>
                                        </a>
                                    </div>
                                `).join('')}
                            </div>
                            
                            ${SourceValidation.selectedSources.length > 0 ? `
                                <div class="validation-actions">
                                    <button class="btn btn-primary btn-lg" data-action="validateContent">
                                        <i class="fas fa-shield-check"></i> Validate Content Against Selected Sources
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    ${state.isValidating ? `
                        <!-- Validating State -->
                        <div class="validation-loading">
                            <div class="spinner"></div>
                            <p>Validating content against ${SourceValidation.selectedSources.length} sources...</p>
                            <p class="helper-text">This may take a moment as we cross-check facts</p>
                        </div>
                    ` : ''}
                    
                    ${state.validationResults ? `
                        <!-- Validation Results -->
                        <div class="validation-results-section">
                            <h4><i class="fas fa-check-circle"></i> Validation Complete</h4>
                            
                            <div class="validation-tabs">
                                <button class="tab-btn ${state.validationTab === 'validated' ? 'active' : ''}" data-tab="validated">Validated Content</button>
                                <button class="tab-btn ${state.validationTab === 'corrections' ? 'active' : ''}" data-tab="corrections">Corrections (${state.validationResults.corrections.length})</button>
                                <button class="tab-btn ${state.validationTab === 'sources' ? 'active' : ''}" data-tab="sources">Sources Used</button>
                            </div>
                            
                            <div class="tab-content ${state.validationTab === 'validated' ? 'active' : ''}" id="validatedTab">
                                <div class="validated-content">
                                    ${state.validationResults.validatedContent}
                                </div>
                                <div class="validation-legend">
                                    <div class="legend-item">
                                        <span class="marker verified">✓ VERIFIED</span> - Confirmed by reference sources
                                    </div>
                                    <div class="legend-item">
                                        <span class="marker corrected">✓ CORRECTED</span> - Fact-checked and corrected
                                    </div>
                                    <div class="legend-item">
                                        <span class="marker warning">⚠️ NEEDS VERIFICATION</span> - Requires additional checking
                                    </div>
                                    <div class="legend-item">
                                        <span class="marker info">ℹ️ NOT IN REFERENCE</span> - Not found in selected sources
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tab-content ${state.validationTab === 'corrections' ? 'active' : ''}" id="correctionsTab">
                                ${state.validationResults.corrections.length > 0 ? `
                                    <div class="corrections-list">
                                        ${state.validationResults.corrections.map((corr, idx) => `
                                            <div class="correction-item">
                                                <div class="correction-number">#${idx + 1}</div>
                                                <div class="correction-content">
                                                    <div class="correction-original">
                                                        <strong>Original:</strong> <del>${corr.original}</del>
                                                    </div>
                                                    <div class="correction-arrow"><i class="fas fa-arrow-down"></i></div>
                                                    <div class="correction-updated">
                                                        <strong>Corrected:</strong> <mark>${corr.corrected}</mark>
                                                    </div>
                                                    <div class="correction-source">
                                                        <i class="fas fa-link"></i> Source: ${corr.source}
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div class="no-corrections">
                                        <i class="fas fa-check-circle"></i>
                                        <p>No corrections needed! All content validated successfully.</p>
                                    </div>
                                `}
                            </div>
                            
                            <div class="tab-content ${state.validationTab === 'sources' ? 'active' : ''}" id="sourcesTab">
                                <div class="sources-used-list">
                                    ${state.validationResults.sourcesUsed.map(source => `
                                        <div class="source-used-item">
                                            <i class="fas fa-check-circle"></i>
                                            <div class="source-used-info">
                                                <strong>${source.title}</strong>
                                                <a href="${source.url}" target="_blank">${source.url}</a>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="validation-actions">
                                <button class="btn btn-secondary" data-action="copyValidatedContent">
                                    <i class="fas fa-copy"></i> Copy Validated Content
                                </button>
                                <button class="btn btn-primary" data-action="saveValidatedContent">
                                    <i class="fas fa-save"></i> Save as New Document
                                </button>
                                <button class="btn btn-ghost" data-action="newValidation">
                                    <i class="fas fa-rotate"></i> New Validation
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `,

    // Summary Modal Component
    SummaryModal: () => `
        <div class="modal ${state.showSummaryModal ? 'active' : ''}" id="summaryModal">
            <div class="modal-content summary-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-sparkles"></i> ${state.currentSummary?.name || 'Summary'}</h3>
                    <button class="close-btn" data-action="closeSummary">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="summary-display">
                        <div class="summary-section">
                            <h4><i class="fas fa-lightbulb"></i> AI-Generated Summary</h4>
                            <div class="summary-text">${state.currentSummary?.summary || 'No summary available'}</div>
                        </div>
                        ${state.currentSummary?.content ? `
                            <div class="summary-section">
                                <h4><i class="fas fa-file-alt"></i> Original Content</h4>
                                <div class="original-content">${state.currentSummary.content.substring(0, 2000)}${state.currentSummary.content.length > 2000 ? '...' : ''}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="copySummary"><i class="fas fa-copy"></i> Copy Summary</button>
                    <button class="btn btn-primary" data-action="generateFlashcardsFromSummary"><i class="fas fa-clone"></i> Flash Cards</button>
                    <button class="btn btn-primary" data-action="closeSummary">Close</button>
                </div>
            </div>
        </div>
    `,

    FlashcardModal: () => {
        const stats = flashcardManager.getStats();
        const card = state.currentFlashcard;
        
        return `
        <div class="modal ${state.showFlashcardModal ? 'active' : ''}" id="flashcardModal">
            <div class="modal-content flashcard-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-clone"></i> Flashcards - Anki SM-2</h3>
                    <div class="flashcard-stats">
                        <span class="stat"><i class="fas fa-layer-group"></i> ${stats.total}</span>
                        <span class="stat due"><i class="fas fa-clock"></i> ${stats.due}</span>
                        <span class="stat new"><i class="fas fa-sparkles"></i> ${stats.new}</span>
                    </div>
                    <button class="close-btn" data-action="closeFlashcardStudy">&times;</button>
                </div>
                <div class="modal-body">
                    ${!card ? `
                        <div class="flashcard-empty">
                            <i class="fas fa-check-circle"></i>
                            <h4>All cards reviewed!</h4>
                            <p>Great job! Come back later for more reviews.</p>
                            <div class="stats-summary">
                                <div class="stat-item">
                                    <span class="stat-value">${stats.total}</span>
                                    <span class="stat-label">Total Cards</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${stats.review}</span>
                                    <span class="stat-label">In Review</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${stats.learning}</span>
                                    <span class="stat-label">Learning</span>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="flashcard-container">
                            <div class="flashcard ${state.flashcardRevealed ? 'revealed' : ''}">
                                <div class="flashcard-front">
                                    <div class="card-label">Question</div>
                                    <div class="card-content">${Utils.escapeHtml(card.question)}</div>
                                </div>
                                ${state.flashcardRevealed ? `
                                    <div class="flashcard-back">
                                        <div class="card-label">Answer</div>
                                        <div class="card-content">${Utils.escapeHtml(card.answer)}</div>
                                        <div class="card-info">
                                            <span><i class="fas fa-repeat"></i> ${card.repetitions}</span>
                                            <span><i class="fas fa-chart-line"></i> ${card.easeFactor.toFixed(2)}</span>
                                            <span><i class="fas fa-calendar"></i> ${card.interval}d</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flashcard-actions">
                            ${!state.flashcardRevealed ? `
                                <button class="btn btn-primary btn-large" data-action="revealFlashcard">
                                    <i class="fas fa-eye"></i> Show Answer
                                </button>
                                <div class="keyboard-hint">
                                    <i class="fas fa-keyboard"></i> Press <kbd>Space</kbd> to reveal
                                </div>
                            ` : `
                                <div class="answer-buttons">
                                    <button class="btn btn-answer btn-again" data-action="answerFlashcard" data-rating="1">
                                        <span class="btn-label">Again</span>
                                        <span class="btn-time">&lt;1m</span>
                                        <span class="btn-key">1</span>
                                    </button>
                                    <button class="btn btn-answer btn-hard" data-action="answerFlashcard" data-rating="2">
                                        <span class="btn-label">Hard</span>
                                        <span class="btn-time">&lt;10m</span>
                                        <span class="btn-key">2</span>
                                    </button>
                                    <button class="btn btn-answer btn-good" data-action="answerFlashcard" data-rating="3">
                                        <span class="btn-label">Good</span>
                                        <span class="btn-time">${card.interval}d</span>
                                        <span class="btn-key">3</span>
                                    </button>
                                    <button class="btn btn-answer btn-easy" data-action="answerFlashcard" data-rating="4">
                                        <span class="btn-label">Easy</span>
                                        <span class="btn-time">${Math.ceil(card.interval * 1.3)}d</span>
                                        <span class="btn-key">4</span>
                                    </button>
                                </div>
                                <div class="keyboard-hint">
                                    <i class="fas fa-keyboard"></i> Press <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> to answer
                                </div>
                            `}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    },

    TimerModal: () => {
        const totalStudyTime = TimerManager.getTotalStudyTime();
        const todayStudyTime = TimerManager.getTodayStudyTime();
        const totalHours = Math.floor(totalStudyTime / 3600);
        const todayMinutes = Math.floor(todayStudyTime / 60);
        
        return `
        <div class="modal ${state.showTimerModal ? 'active' : ''}" id="timerModal">
            <div class="modal-content timer-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-clock"></i> Pomodoro Study Timer</h3>
                    <button class="close-btn" data-action="closeTimer">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="timer-display">
                        <div class="timer-mode-badge ${state.timerMode}">
                            ${state.timerMode === 'study' ? '📚 Study Time' : '☕ Break Time'}
                        </div>
                        <div class="timer-clock">
                            ${TimerManager.formatTime(state.timerSeconds)}
                        </div>
                        <div class="timer-controls">
                            ${!state.timerRunning ? `
                                <button class="btn btn-primary btn-large" data-action="startTimer">
                                    <i class="fas fa-play"></i> Start
                                </button>
                            ` : `
                                <button class="btn btn-secondary" data-action="pauseTimer">
                                    <i class="fas fa-pause"></i> Pause
                                </button>
                            `}
                            <button class="btn btn-ghost" data-action="resetTimer">
                                <i class="fas fa-redo"></i> Reset
                            </button>
                        </div>
                    </div>
                    
                    <div class="timer-stats">
                        <div class="stat-card">
                            <div class="stat-icon study">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-label">Today</span>
                                <span class="stat-value">${todayMinutes}m</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon total">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-label">Total</span>
                                <span class="stat-value">${totalHours}h</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon sessions">
                                <i class="fas fa-layer-group"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-label">Sessions</span>
                                <span class="stat-value">${state.sessions.length}</span>
                            </div>
                        </div>
                    </div>

                    ${state.sessions.length > 0 ? `
                        <div class="recent-sessions">
                            <h4><i class="fas fa-history"></i> Recent Sessions</h4>
                            <div class="sessions-list">
                                ${state.sessions.slice(0, 5).map(session => `
                                    <div class="session-item">
                                        <div class="session-time">
                                            ${new Date(session.startTime).toLocaleDateString()} 
                                            ${new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <div class="session-duration">
                                            ${Math.floor(session.duration / 60)}m ${session.duration % 60}s
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    },

    StatsModal: () => {
        const streak = StatsManager.updateStreak();
        const totalCards = StatsManager.getTotalCardsStudied();
        const accuracy = StatsManager.getAverageAccuracy();
        const weeklyStats = StatsManager.getWeeklyStats();
        const monthlyStats = StatsManager.getMonthlyStats();
        const totalTime = TimerManager.getTotalStudyTime();
        const totalHours = Math.floor(totalTime / 3600);
        const totalMinutes = Math.floor((totalTime % 3600) / 60);
        
        // Calculate difficulty breakdown
        const cards = flashcardManager.cards.filter(c => c.repetitions > 0);
        const easyCards = cards.filter(c => c.easeFactor >= 2.5).length;
        const mediumCards = cards.filter(c => c.easeFactor >= 2.0 && c.easeFactor < 2.5).length;
        const hardCards = cards.filter(c => c.easeFactor < 2.0).length;
        
        // Generate heatmap data (last 365 days)
        const heatmapData = StatsManager.getHeatmapData();
        const maxActivity = Math.max(...heatmapData.map(d => d.count), 1);
        
        return `
        <div class="modal ${state.showStatsModal ? 'active' : ''}" id="statsModal">
            <div class="modal-content stats-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-chart-line"></i> Progress Dashboard</h3>
                    <button class="close-btn" data-action="closeStats">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <!-- Left: Circular Progress -->
                        <div class="circular-progress-container">
                            <div class="circular-progress">
                                <svg viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg-tertiary)" stroke-width="20"/>
                                    <circle cx="100" cy="100" r="90" fill="none" stroke="#22c55e" stroke-width="20" 
                                            stroke-dasharray="${(easyCards / totalCards) * 565} 565" 
                                            stroke-dashoffset="0" 
                                            transform="rotate(-90 100 100)"/>
                                    <circle cx="100" cy="100" r="90" fill="none" stroke="#fbbf24" stroke-width="20"
                                            stroke-dasharray="${(mediumCards / totalCards) * 565} 565"
                                            stroke-dashoffset="${-(easyCards / totalCards) * 565}"
                                            transform="rotate(-90 100 100)"/>
                                    <circle cx="100" cy="100" r="90" fill="none" stroke="#ef4444" stroke-width="20"
                                            stroke-dasharray="${(hardCards / totalCards) * 565} 565"
                                            stroke-dashoffset="${-((easyCards + mediumCards) / totalCards) * 565}"
                                            transform="rotate(-90 100 100)"/>
                                </svg>
                                <div class="progress-center">
                                    <div class="progress-number">${totalCards}</div>
                                    <div class="progress-label">✓ Studied</div>
                                </div>
                            </div>
                            <div class="difficulty-breakdown">
                                <div class="diff-item easy">
                                    <span class="diff-label">Easy</span>
                                    <span class="diff-value">${easyCards}<span class="diff-total">/${totalCards}</span></span>
                                </div>
                                <div class="diff-item medium">
                                    <span class="diff-label">Med.</span>
                                    <span class="diff-value">${mediumCards}<span class="diff-total">/${totalCards}</span></span>
                                </div>
                                <div class="diff-item hard">
                                    <span class="diff-label">Hard</span>
                                    <span class="diff-value">${hardCards}<span class="diff-total">/${totalCards}</span></span>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Badges -->
                        <div class="badges-container">
                            <h4>Badges</h4>
                            <div class="badge-number">${state.gamification.badges.length}</div>
                            <div class="badges-display">
                                ${GamificationManager.BADGES.filter(b => state.gamification.badges.includes(b.id)).slice(0, 4).map(badge => `
                                    <div class="badge-hexagon" title="${badge.name}">
                                        <i class="fas ${badge.icon}"></i>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="recent-badge">Most Recent Badge</div>
                            <div class="recent-badge-name">${GamificationManager.BADGES.find(b => b.id === state.gamification.badges[state.gamification.badges.length - 1])?.name || 'None yet'}</div>
                        </div>
                    </div>

                    <!-- Heatmap Calendar -->
                    <div class="heatmap-section">
                        <div class="heatmap-header">
                            <span><strong>${state.sessions.length}</strong> study sessions in the past year</span>
                            <div class="heatmap-legend">
                                <span>Total active days: <strong>${heatmapData.filter(d => d.count > 0).length}</strong></span>
                                <span>Max streak: <strong>${state.streak.longest}</strong></span>
                            </div>
                        </div>
                        <div class="heatmap-calendar">
                            ${StatsManager.renderHeatmap(heatmapData, maxActivity)}
                        </div>
                        <div class="heatmap-months">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                        </div>
                    </div>

                    <!-- All Badges -->
                    <div class="stats-section achievements">
                        <h4><i class="fas fa-trophy"></i> All Achievements (${state.gamification.badges.length}/${GamificationManager.BADGES.length})</h4>
                        <div class="achievements-grid">
                            ${GamificationManager.BADGES.map(badge => {
                                const earned = state.gamification.badges.includes(badge.id);
                                return `
                                    <div class="achievement ${earned ? 'unlocked' : 'locked'}" title="${badge.desc}">
                                        <i class="fas ${badge.icon}"></i>
                                        <span>${badge.name}</span>
                                        ${earned ? '' : '<div class="badge-lock"><i class="fas fa-lock"></i></div>'}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    },

    SessionHistoryModal: () => {
        const sortedSessions = [...state.sessions].sort((a, b) => b.startTime - a.startTime);
        
        return `
        <div class="modal ${state.showHistoryModal ? 'active' : ''}" id="historyModal">
            <div class="modal-content history-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-history"></i> Session History</h3>
                    <button class="close-btn" data-action="closeHistory">&times;</button>
                </div>
                <div class="modal-body">
                    ${state.sessions.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-clock"></i>
                            <h4>No Study Sessions Yet</h4>
                            <p>Complete a study session to see it here with AI-generated insights!</p>
                        </div>
                    ` : `
                        <div class="history-list">
                            ${sortedSessions.map((session, index) => {
                                const date = new Date(session.startTime);
                                const duration = Math.floor(session.duration / 60);
                                const topics = session.topicsStudied?.join(', ') || 'General study';
                                
                                return `
                                    <div class="history-item">
                                        <div class="history-header">
                                            <div class="history-date">
                                                <i class="fas fa-calendar"></i>
                                                ${date.toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                                <span class="history-time">
                                                    ${date.toLocaleTimeString('en-US', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                            <button class="btn btn-sm btn-ghost" 
                                                    data-action="generateSessionSummary" 
                                                    data-session-index="${index}"
                                                    title="Generate AI Summary">
                                                <i class="fas fa-magic"></i>
                                            </button>
                                        </div>
                                        <div class="history-stats">
                                            <div class="history-stat">
                                                <i class="fas fa-clock"></i>
                                                <span>${duration}m</span>
                                            </div>
                                            <div class="history-stat">
                                                <i class="fas fa-layer-group"></i>
                                                <span>${session.cardsStudied || 0} cards</span>
                                            </div>
                                        </div>
                                        <div class="history-topics">
                                            <i class="fas fa-book"></i>
                                            ${topics}
                                        </div>
                                        ${session.summary ? `
                                            <div class="session-summary">
                                                <i class="fas fa-quote-left"></i>
                                                ${session.summary}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    },

    // Games Modal Component
    GamesModal: () => {
        if (!state.showGamesModal) return '';

        // If a game is selected, show that game
        if (state.currentGame) {
            let gameContent = '';
            switch (state.currentGame) {
                case 'cn':
                    gameContent = window.Games?.CNGame.render() || '<p>Loading game...</p>';
                    break;
                case 'ds':
                    gameContent = window.Games?.DSGame.render() || '<p>Loading game...</p>';
                    break;
                case 'os':
                    gameContent = window.Games?.OSGame.render() || '<p>Loading game...</p>';
                    break;
                case 'python':
                    gameContent = window.Games?.PythonGame.render() || '<p>Loading game...</p>';
                    break;
                default:
                    gameContent = '<p>Game not found</p>';
            }

            return `
                <div class="modal games-modal active">
                    <div class="games-modal-content">
                        <div class="games-modal-header">
                            <button class="btn btn-secondary" data-action="backToGames">
                                <i class="fas fa-arrow-left"></i> Back to Games
                            </button>
                            <button class="close-games-modal" data-action="closeGames">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        ${gameContent}
                    </div>
                </div>
            `;
        }

        // Show games menu
        return `
            <div class="modal games-modal active">
                <div class="games-modal-content">
                    <div class="games-modal-header">
                        <h2><i class="fas fa-gamepad"></i> Educational Games</h2>
                        <button class="close-games-modal" data-action="closeGames">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="games-grid">
                        <div class="game-card" data-action="selectGame" data-game="cn">
                            <div class="game-card-icon">
                                <i class="fas fa-network-wired"></i>
                            </div>
                            <div class="game-card-title">Computer Networks</div>
                            <div class="game-card-description">
                                Learn packet routing by simulating message transmission through a network of PCs
                            </div>
                        </div>

                        <div class="game-card" data-action="selectGame" data-game="ds">
                            <div class="game-card-icon">
                                <i class="fas fa-project-diagram"></i>
                            </div>
                            <div class="game-card-title">Data Structures</div>
                            <div class="game-card-description">
                                Master tree traversals (Preorder & Postorder) through interactive node selection
                            </div>
                        </div>

                        <div class="game-card" data-action="selectGame" data-game="os">
                            <div class="game-card-icon">
                                <i class="fas fa-microchip"></i>
                            </div>
                            <div class="game-card-title">Operating Systems</div>
                            <div class="game-card-description">
                                Understand CPU scheduling algorithms (FCFS & SJF) with Gantt chart visualization
                            </div>
                        </div>

                        <div class="game-card" data-action="selectGame" data-game="python">
                            <div class="game-card-icon">
                                <i class="fab fa-python"></i>
                            </div>
                            <div class="game-card-title">Python Quiz</div>
                            <div class="game-card-description">
                                Test your Python knowledge with interactive multiple-choice questions
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// ============================================
// Utility Functions
// ============================================

const Utils = {
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getFileType: (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'pdf';
        if (['doc', 'docx'].includes(ext)) return 'doc';
        if (['mp3', 'wav'].includes(ext)) return 'audio';
        if (['mp4'].includes(ext)) return 'video';
        return 'text';
    },

    getFileIcon: (type) => {
        const icons = {
            pdf: 'fa-file-pdf',
            doc: 'fa-file-word',
            audio: 'fa-file-audio',
            video: 'fa-file-video',
            link: 'fa-link',
            text: 'fa-file-alt'
        };
        return icons[type] || 'fa-file-alt';
    },

    getIconColor: (type) => {
        const colors = {
            pdf: '#ef4444',
            doc: '#3b82f6',
            audio: '#a855f7',
            video: '#ec4899',
            link: '#22c55e',
            text: '#f97316'
        };
        return colors[type] || '#f97316';
    },

    showToast: (message) => {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ============================================
// Actions
// ============================================

const Actions = {
    openUpload: (tab = 'upload') => {
        state.showUploadModal = true;
        state.currentTab = tab;
        App.render();
    },

    closeUpload: () => {
        state.showUploadModal = false;
        App.render();
    },

    switchTab: (tab) => {
        // Handle validation modal tabs
        if (['validated', 'corrections', 'sources'].includes(tab)) {
            state.validationTab = tab;
        } else {
            // Handle upload modal tabs
            state.currentTab = tab;
        }
        App.render();
    },

    addSource: async () => {
        if (!state.apiKey) {
            Utils.showToast('Please add your Gemini API key in Settings first');
            Actions.openSettings();
            return;
        }

        if (state.currentTab === 'upload') {
            const fileInput = document.getElementById('fileInput');
            if (fileInput.files.length > 0) {
                state.isUploading = true;
                state.showUploadModal = true;
                App.render();

                for (let file of fileInput.files) {
                    try {
                        state.uploadProgress = `Uploading ${file.name}...`;
                        App.render();

                        // Upload file to Gemini
                        const uploadedFile = await GeminiAPI.uploadFile(file);

                        state.uploadProgress = `Processing ${file.name}...`;
                        App.render();

                        // Wait for file to be processed
                        const processedFile = await GeminiAPI.waitForFileProcessing(uploadedFile.name);

                        state.uploadProgress = `Extracting content from ${file.name}...`;
                        App.render();

                        // Extract text content
                        const content = await GeminiAPI.extractTextFromFile(processedFile.uri, file.type);

                        state.uploadProgress = `Generating summary for ${file.name}...`;
                        App.render();

                        // Generate summary
                        const summary = await GeminiAPI.summarizeFile(processedFile.uri, file.type);

                        state.sources.push({
                            name: file.name,
                            type: Utils.getFileType(file.name),
                            content: content,
                            summary: summary,
                            fileUri: processedFile.uri
                        });

                        Utils.showToast(`${file.name} uploaded and summarized!`);
                    } catch (error) {
                        Utils.showToast(`Error with ${file.name}: ${error.message}`);
                    }
                }
                fileInput.value = '';
                state.isUploading = false;
                state.uploadProgress = '';
            } else {
                Utils.showToast('Please select a file to upload');
                return;
            }
        } else if (state.currentTab === 'paste') {
            const title = document.getElementById('sourceTitle')?.value.trim();
            const text = document.getElementById('sourceText')?.value.trim();

            if (!title || !text) {
                Utils.showToast('Please enter both title and content');
                return;
            }

            state.isUploading = true;
            state.uploadProgress = 'Generating summary...';
            state.showUploadModal = true;
            App.render();

            try {
                const summary = await GeminiAPI.summarize(text);

                state.sources.push({
                    name: title,
                    type: 'text',
                    content: text,
                    summary: summary
                });

                Utils.showToast('Text added and summarized!');
            } catch (error) {
                state.sources.push({
                    name: title,
                    type: 'text',
                    content: text,
                    summary: 'Summary unavailable'
                });
                Utils.showToast(`Added text (summary failed: ${error.message})`);
            } finally {
                state.isUploading = false;
                state.uploadProgress = '';
            }
        } else if (state.currentTab === 'link') {
            const url = document.getElementById('sourceUrl')?.value.trim();

            if (!url) {
                Utils.showToast('Please enter a URL');
                return;
            }

            // Validate URL format
            try {
                new URL(url);
            } catch {
                Utils.showToast('Please enter a valid URL');
                return;
            }

            state.isUploading = true;
            state.uploadProgress = 'Fetching and analyzing URL...';
            state.showUploadModal = true;
            App.render();

            try {
                const summary = await GeminiAPI.fetchAndSummarizeUrl(url);
                const urlObj = new URL(url);

                state.sources.push({
                    name: urlObj.hostname + urlObj.pathname.substring(0, 30),
                    type: 'link',
                    content: url,
                    summary: summary
                });

                Utils.showToast('URL content fetched and summarized!');
            } catch (error) {
                state.sources.push({
                    name: new URL(url).hostname,
                    type: 'link',
                    content: url,
                    summary: `Failed to fetch URL content: ${error.message}`
                });
                Utils.showToast(`URL added (summary failed: ${error.message})`);
            } finally {
                state.isUploading = false;
                state.uploadProgress = '';
            }
        }

        state.showUploadModal = false;
        App.render();
    },

    deleteSource: (index) => {
        state.sources.splice(index, 1);
        if (state.expandedSource === index) {
            state.expandedSource = null;
        } else if (state.expandedSource > index) {
            state.expandedSource--;
        }
        Utils.showToast('Source removed');
        App.render();
    },

    toggleSource: (index) => {
        state.expandedSource = state.expandedSource === index ? null : index;
        App.render();
    },

    openTool: (toolId) => {
        const tools = {
            audio: { id: 'audio', name: 'Audio Summary', icon: 'fa-headphones' },
            flashcards: { id: 'flashcards', name: 'Flashcards', icon: 'fa-clone' },
            quiz: { id: 'quiz', name: 'Quiz', icon: 'fa-brain' },
            mindmap: { id: 'mindmap', name: 'Mind Map', icon: 'fa-diagram-project' },
            summary: { id: 'summary', name: 'Summary Report', icon: 'fa-file-lines' },
            slides: { id: 'slides', name: 'Slide Deck', icon: 'fa-desktop' }
        };
        state.currentTool = tools[toolId];
        state.showToolModal = true;
        state.toolResult = null;
        App.render();
    },

    closeTool: () => {
        state.showToolModal = false;
        state.currentTool = null;
        state.toolResult = null;
        App.render();
    },

    generateTool: async () => {
        if (!state.apiKey || state.sources.length === 0) return;

        state.isLoading = true;
        App.render();

        try {
            // Combine all source content
            const allContent = state.sources.map(s => s.content).join('\n\n---\n\n');
            let result;

            switch (state.currentTool?.id) {
                case 'summary':
                    result = await GeminiAPI.summarize(allContent);
                    state.toolResult = result.replace(/\n/g, '<br>');
                    break;
                case 'flashcards':
                    // Generate flashcards and open study UI instead of showing raw JSON
                    result = await GeminiAPI.generateFlashcards(allContent);
                    const jsonMatch = result.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const flashcards = JSON.parse(jsonMatch[0]);
                        flashcardManager.addCards(flashcards);
                        Utils.showToast(`Generated ${flashcards.length} flashcards!`);
                        state.showToolModal = false;
                        state.isLoading = false;
                        Actions.openFlashcardStudy();
                        return;
                    } else {
                        throw new Error('Could not parse flashcards');
                    }
                case 'quiz':
                    result = await GeminiAPI.generateQuiz(allContent);
                    state.toolResult = result.replace(/\n/g, '<br>');
                    break;
                case 'mindmap':
                    result = await GeminiAPI.generateMindMap(allContent);
                    state.toolResult = result.replace(/\n/g, '<br>');
                    break;
                default:
                    result = await GeminiAPI.summarize(allContent);
                    state.toolResult = result.replace(/\n/g, '<br>');
            }

            state.outputs.unshift({
                name: state.currentTool?.name,
                icon: state.currentTool?.icon,
                time: 'Just now',
                content: result
            });

            Utils.showToast(`${state.currentTool?.name} generated!`);
        } catch (error) {
            Utils.showToast(`Error: ${error.message}`);
            state.toolResult = null;
        } finally {
            state.isLoading = false;
            App.render();
        }
    },

    sendMessage: async () => {
        const input = document.getElementById('chatInput');
        const message = input?.value.trim();

        if (!message || state.sources.length === 0) return;

        state.messages.push({ role: 'user', content: message });
        input.value = '';
        App.render();

        if (state.apiKey) {
            // Use Gemini API for response
            try {
                const context = state.sources.map(s => s.content).join('\n\n');
                const response = await GeminiAPI.chat(message, context);
                state.messages.push({ role: 'assistant', content: response });
            } catch (error) {
                state.messages.push({ role: 'assistant', content: `Error: ${error.message}` });
            }
        } else {
            // Demo response
            state.messages.push({
                role: 'assistant',
                content: `Please add your Gemini API key in Settings to get AI-powered responses.`
            });
        }
        App.render();
        
        // Scroll to bottom
        const chatContent = document.getElementById('chatContent');
        if (chatContent) chatContent.scrollTop = chatContent.scrollHeight;
    },

    browseFiles: () => {
        document.getElementById('fileInput')?.click();
    },

    toggleTheme: () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
        App.render();
    },

    openSettings: () => {
        state.showSettingsModal = true;
        App.render();
    },

    closeSettings: () => {
        state.showSettingsModal = false;
        App.render();
    },

    // Source Validation Actions
    openValidation: () => {
        state.showSourceValidationModal = true;
        App.render();
    },

    closeValidation: () => {
        state.showSourceValidationModal = false;
        App.render();
    },

    searchValidationSources: async () => {
        const topicInput = document.getElementById('validationTopic');
        const queryInput = document.getElementById('validationQuery');
        
        if (!topicInput || !queryInput) return;
        
        const topic = topicInput.value.trim();
        const query = queryInput.value.trim();
        
        if (!topic || !query) {
            Utils.showToast('Please enter both topic and query');
            return;
        }
        
        state.validationTopic = topic;
        state.validationQuery = query;
        
        // Set searching flag and render to show loading state
        SourceValidation.isSearching = true;
        App.render();
        
        try {
            await SourceValidation.searchSources(topic, query);
        } catch (error) {
            Utils.showToast('Error searching sources: ' + error.message);
        } finally {
            SourceValidation.isSearching = false;
            App.render();
        }
    },

    toggleValidationSource: (target) => {
        const sourceId = target.dataset.sourceId;
        if (!sourceId) {
            console.error('No sourceId found on target:', target);
            return;
        }
        SourceValidation.toggleSource(sourceId);
        App.render();
    },

    selectAllSources: () => {
        SourceValidation.selectAll();
        App.render();
    },

    deselectAllSources: () => {
        SourceValidation.deselectAll();
        App.render();
    },

    newSourceSearch: () => {
        SourceValidation.clearResults();
        state.validationTopic = '';
        state.validationQuery = '';
        state.validationResults = null;
        App.render();
    },

    validateContent: async () => {
        if (SourceValidation.selectedSources.length === 0) {
            Utils.showToast('Please select at least one source');
            return;
        }
        
        // Get content to validate (from latest source or all sources)
        const contentToValidate = state.sources.length > 0 
            ? state.sources.map(s => s.summary || s.content).join('\n\n')
            : 'No content available to validate';
        
        state.isValidating = true;
        App.render();
        
        try {
            // Fetch content from selected sources
            const sourcesContent = await SourceValidation.fetchAllSelectedSources();
            
            // Validate content
            const results = await SourceValidation.validateContent(contentToValidate, sourcesContent);
            
            state.validationResults = results;
            state.isValidating = false;
            App.render();
            
            Utils.showToast('Validation complete!');
        } catch (error) {
            state.isValidating = false;
            Utils.showToast('Validation error: ' + error.message);
            App.render();
        }
    },

    copyValidatedContent: () => {
        if (state.validationResults?.validatedContent) {
            // Remove HTML tags for clean copy
            const cleanText = state.validationResults.validatedContent.replace(/<[^>]*>/g, '');
            navigator.clipboard.writeText(cleanText);
            Utils.showToast('Validated content copied to clipboard!');
        }
    },

    saveValidatedContent: () => {
        if (!state.validationResults?.validatedContent) return;
        
        const newSource = {
            name: `Validated - ${state.validationTopic || 'Content'}.txt`,
            type: 'text',
            content: state.validationResults.validatedContent,
            summary: state.validationResults.validatedContent.substring(0, 200) + '...',
            uploadedAt: new Date().toISOString(),
            validated: true,
            validationSources: state.validationResults.sourcesUsed
        };
        
        state.sources.push(newSource);
        localStorage.setItem('sources', JSON.stringify(state.sources));
        
        Utils.showToast('Validated content saved!');
        state.showSourceValidationModal = false;
        App.render();
    },

    newValidation: () => {
        state.validationResults = null;
        SourceValidation.clearResults();
        state.validationTopic = '';
        state.validationQuery = '';
        App.render();
    },

    saveApiKey: () => {
        const input = document.getElementById('apiKeyInput');
        if (input) {
            state.apiKey = input.value.trim();
            localStorage.setItem('geminiApiKey', state.apiKey);
            Utils.showToast('API key saved!');
            state.showSettingsModal = false;
            App.render();
        }
    },

    toggleApiKeyVisibility: () => {
        const input = document.getElementById('apiKeyInput');
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    },

    copyResult: () => {
        if (state.toolResult) {
            const text = state.toolResult.replace(/<br>/g, '\n');
            navigator.clipboard.writeText(text);
            Utils.showToast('Copied to clipboard!');
        }
    },

    viewSummary: (index) => {
        state.currentSummary = state.sources[index];
        state.showSummaryModal = true;
        App.render();
    },

    closeSummary: () => {
        state.showSummaryModal = false;
        state.currentSummary = null;
        App.render();
    },

    copySummary: () => {
        if (state.currentSummary?.summary) {
            navigator.clipboard.writeText(state.currentSummary.summary);
            Utils.showToast('Summary copied to clipboard!');
        }
    },

    generateFlashcardsFromSummary: async () => {
        if (!state.currentSummary) {
            Utils.showToast('No summary available');
            return;
        }

        const content = state.currentSummary.content || state.currentSummary.summary;
        
        state.isLoading = true;
        state.showSummaryModal = false;
        App.render();
        
        Utils.showToast('Generating flashcards with Anki SM-2 algorithm...');

        try {
            const prompt = `Based on the following content, create 10 study flashcards in JSON format. Each flashcard should have a "question" and "answer" field. Return ONLY a valid JSON array, no other text:\n\n${content}`;
            const response = await GeminiAPI.call(prompt);
            
            // Extract JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }
            
            const flashcards = JSON.parse(jsonMatch[0]);
            
            // Add flashcards to Anki manager
            flashcardManager.addCards(flashcards);
            
            const stats = flashcardManager.getStats();
            Utils.showToast(`Generated ${flashcards.length} flashcards! Total: ${stats.total}`);
            
            state.isLoading = false;
            
            // Open flashcard study mode
            Actions.openFlashcardStudy();
            
        } catch (error) {
            Utils.showToast(`Failed to generate flashcards: ${error.message}`);
            state.isLoading = false;
            App.render();
        }
    },

    openFlashcardStudy: () => {
        state.showFlashcardModal = true;
        state.currentFlashcard = null;
        state.flashcardRevealed = false;
        
        const dueCards = flashcardManager.getDueCards();
        if (dueCards.length > 0) {
            state.currentFlashcard = dueCards[0];
        }
        
        App.render();
    },

    closeFlashcardStudy: () => {
        state.showFlashcardModal = false;
        state.currentFlashcard = null;
        state.flashcardRevealed = false;
        App.render();
    },

    revealFlashcard: () => {
        state.flashcardRevealed = true;
        App.render();
    },

    answerFlashcard: (rating) => {
        if (!state.currentFlashcard) return;

        const scheduleInfo = state.currentFlashcard.answerCard(rating);
        flashcardManager.saveToStorage();
        
        // Award XP for studying card
        GamificationManager.awardXP(GamificationManager.XP_PER_CARD, 'Studied flashcard');
        
        // Track in current session
        if (state.currentSession) {
            state.currentSession.cardsStudied = (state.currentSession.cardsStudied || 0) + 1;
        }
        
        // Show next card
        state.flashcardRevealed = false;
        const dueCards = flashcardManager.getDueCards();
        
        if (dueCards.length > 0) {
            state.currentFlashcard = dueCards[0];
            Utils.showToast(`Next review: ${scheduleInfo.timeString}`);
        } else {
            state.currentFlashcard = null;
            Utils.showToast('All cards reviewed! 🎉');
        }
        
        App.render();
    },

    openTimer: () => {
        state.showTimerModal = true;
        App.render();
    },

    closeTimer: () => {
        state.showTimerModal = false;
        App.render();
    },

    startTimer: () => {
        TimerManager.startTimer();
    },

    pauseTimer: () => {
        TimerManager.pauseTimer();
    },

    resetTimer: () => {
        TimerManager.resetTimer();
    },

    openStats: () => {
        state.showStatsModal = true;
        App.render();
    },

    closeStats: () => {
        state.showStatsModal = false;
        App.render();
    },

    openHistory: () => {
        state.showHistoryModal = true;
        App.render();
    },

    closeHistory: () => {
        state.showHistoryModal = false;
        App.render();
    },

    generateSessionSummary: async (sessionIndex) => {
        const session = state.sessions[sessionIndex];
        if (!session || session.summary) return;
        
        state.isLoading = true;
        App.render();
        
        try {
            const summary = await StatsManager.generateSessionSummary(session);
            session.summary = summary;
            localStorage.setItem('studySessions', JSON.stringify(state.sessions));
            Utils.showToast('Session summary generated!');
        } catch (error) {
            Utils.showToast('Failed to generate summary');
        } finally {
            state.isLoading = false;
            App.render();
        }
    },

    openGames: () => {
        state.showGamesModal = true;
        state.currentGame = null;
        App.render();
    },

    closeGames: () => {
        state.showGamesModal = false;
        state.currentGame = null;
        App.render();
    },

    selectGame: (game) => {
        state.currentGame = game;
        App.render();
    },

    backToGames: () => {
        state.currentGame = null;
        App.render();
    }
};

// ============================================
// Event Handling
// ============================================

const EventHandler = {
    init: () => {
        document.getElementById('app').addEventListener('click', EventHandler.handleClick);
        document.getElementById('app').addEventListener('change', EventHandler.handleChange);
        document.addEventListener('keydown', EventHandler.handleKeydown);
    },

    handleClick: (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const tab = target.dataset.tab;
        const tool = target.dataset.tool;
        const index = target.dataset.index;

        switch (action) {
            case 'openUpload':
                Actions.openUpload(tab || 'upload');
                break;
            case 'closeUpload':
                Actions.closeUpload();
                break;
            case 'addSource':
                Actions.addSource();
                break;
            case 'openTool':
                Actions.openTool(tool);
                break;
            case 'closeTool':
                Actions.closeTool();
                break;
            case 'generateTool':
                Actions.generateTool();
                break;
            case 'sendMessage':
                Actions.sendMessage();
                break;
            case 'browseFiles':
                Actions.browseFiles();
                break;
            case 'toggleTheme':
                Actions.toggleTheme();
                break;
            case 'openSettings':
                Actions.openSettings();
                break;
            case 'closeSettings':
                Actions.closeSettings();
                break;
            case 'openValidation':
                Actions.openValidation();
                break;
            case 'closeValidation':
                Actions.closeValidation();
                break;
            case 'searchValidationSources':
                Actions.searchValidationSources();
                break;
            case 'toggleValidationSource':
                Actions.toggleValidationSource(target);
                break;
            case 'selectAllSources':
                Actions.selectAllSources();
                break;
            case 'deselectAllSources':
                Actions.deselectAllSources();
                break;
            case 'newSourceSearch':
                Actions.newSourceSearch();
                break;
            case 'validateContent':
                Actions.validateContent();
                break;
            case 'copyValidatedContent':
                Actions.copyValidatedContent();
                break;
            case 'saveValidatedContent':
                Actions.saveValidatedContent();
                break;
            case 'newValidation':
                Actions.newValidation();
                break;
            case 'saveApiKey':
                Actions.saveApiKey();
                break;
            case 'toggleApiKeyVisibility':
                Actions.toggleApiKeyVisibility();
                break;
            case 'copyResult':
                Actions.copyResult();
                break;
            case 'deleteSource':
                Actions.deleteSource(parseInt(index));
                break;
            case 'viewSummary':
                const summaryIndex = parseInt(target.dataset.sourceIndex);
                Actions.viewSummary(summaryIndex);
                break;
            case 'closeSummary':
                Actions.closeSummary();
                break;
            case 'copySummary':
                Actions.copySummary();
                break;
            case 'generateFlashcardsFromSummary':
                Actions.generateFlashcardsFromSummary();
                break;
            case 'openFlashcardStudy':
                Actions.openFlashcardStudy();
                break;
            case 'closeFlashcardStudy':
                Actions.closeFlashcardStudy();
                break;
            case 'revealFlashcard':
                Actions.revealFlashcard();
                break;
            case 'answerFlashcard':
                Actions.answerFlashcard(parseInt(target.dataset.rating));
                break;
            case 'openTimer':
                Actions.openTimer();
                break;
            case 'closeTimer':
                Actions.closeTimer();
                break;
            case 'startTimer':
                Actions.startTimer();
                break;
            case 'pauseTimer':
                Actions.pauseTimer();
                break;
            case 'resetTimer':
                Actions.resetTimer();
                break;
            case 'openStats':
                Actions.openStats();
                break;
            case 'closeStats':
                Actions.closeStats();
                break;
            case 'openHistory':
                Actions.openHistory();
                break;
            case 'closeHistory':
                Actions.closeHistory();
                break;
            case 'generateSessionSummary':
                Actions.generateSessionSummary(parseInt(target.dataset.sessionIndex));
                break;
            case 'openGames':
                Actions.openGames();
                break;
            case 'closeGames':
                Actions.closeGames();
                break;
            case 'selectGame':
                Actions.selectGame(target.dataset.game);
                break;
            case 'backToGames':
                Actions.backToGames();
                break;
        }

        // Handle tab switching
        if (target.classList.contains('tab-btn')) {
            Actions.switchTab(target.dataset.tab);
        }

        // Close modal on backdrop click
        if (target.classList.contains('modal')) {
            if (state.showUploadModal) Actions.closeUpload();
            if (state.showToolModal) Actions.closeTool();
            if (state.showSummaryModal) Actions.closeSummary();
            if (state.showFlashcardModal) Actions.closeFlashcardStudy();
            if (state.showTimerModal) Actions.closeTimer();
            if (state.showStatsModal) Actions.closeStats();
            if (state.showHistoryModal) Actions.closeHistory();
            if (state.showGamesModal) Actions.closeGames();
        }
    },

    handleChange: (e) => {
        if (e.target.id === 'fileInput') {
            const count = e.target.files.length;
            if (count > 0) {
                Utils.showToast(`${count} file(s) selected`);
            }
        }
        if (e.target.id === 'projectName') {
            state.projectName = e.target.value;
        }
    },

    handleKeydown: (e) => {
        if (e.key === 'Escape') {
            if (state.showUploadModal) Actions.closeUpload();
            if (state.showToolModal) Actions.closeTool();
            if (state.showFlashcardModal) Actions.closeFlashcardStudy();
            if (state.showTimerModal) Actions.closeTimer();
        }
        if (e.key === 'Enter' && e.target.id === 'chatInput') {
            Actions.sendMessage();
        }
        
        // Flashcard keyboard shortcuts
        if (state.showFlashcardModal && state.currentFlashcard) {
            // Spacebar to reveal answer
            if (e.code === 'Space' && !state.flashcardRevealed) {
                e.preventDefault();
                Actions.revealFlashcard();
            }
            // Number keys to answer when revealed
            else if (state.flashcardRevealed) {
                if (e.key === '1') {
                    e.preventDefault();
                    Actions.answerFlashcard(1); // Again
                } else if (e.key === '2') {
                    e.preventDefault();
                    Actions.answerFlashcard(2); // Hard
                } else if (e.key === '3') {
                    e.preventDefault();
                    Actions.answerFlashcard(3); // Good
                } else if (e.key === '4') {
                    e.preventDefault();
                    Actions.answerFlashcard(4); // Easy
                }
            }
        }
    }
};

// ============================================
// App
// ============================================

const App = {
    render: () => {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Authentication UI -->
            <div id="auth-wrapper" style="min-height: 100vh;">
                <div id="user-info" style="display: none; position: fixed; top: 10px; right: 10px; z-index: 1000;"></div>
                <div id="firebaseui-auth-container" style="max-width: 500px; margin: 100px auto; padding: 20px;"></div>
                <div id="firebaseui-auth-loader" style="text-align: center; margin: 100px auto;">
                    <p>Loading authentication...</p>
                </div>
                
                <!-- Main App Content (hidden until authenticated) -->
                <div id="app-content" style="display: none;">
                    ${Components.Header()}
                    <main class="main-content">
                        ${Components.SourcesPanel()}
                        ${Components.ChatPanel()}
                        ${Components.ToolsPanel()}
                    </main>
                    ${Components.UploadModal()}
                    ${Components.ToolModal()}
                    ${Components.SettingsModal()}
                    ${Components.SourceValidationModal()}
                    ${Components.SummaryModal()}
                    ${Components.FlashcardModal()}
                    ${Components.TimerModal()}
                    ${Components.StatsModal()}
                    ${Components.SessionHistoryModal()}
                    ${Components.GamesModal()}
                </div>
            </div>
        `;

        // Setup drag and drop
        App.setupDragDrop();

        // Initialize game if a game is active
        if (state.currentGame === 'cn' && window.Games) {
            setTimeout(() => window.Games.CNGame.init(), 100);
        }
    },

    setupDragDrop: () => {
        const dropzone = document.getElementById('dropzone');
        if (!dropzone) return;

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.files = e.dataTransfer.files;
                Utils.showToast(`${e.dataTransfer.files.length} file(s) dropped`);
            }
        });
    },

    init: () => {
        App.render();
        EventHandler.init();
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', App.init);
