// ============================================
// Anki SM-2 Spaced Repetition Algorithm
// Simplified JavaScript Implementation
// Based on: https://github.com/ankitects/anki
// ============================================

/**
 * SM-2 Algorithm Constants
 */
const SM2_CONSTANTS = {
    STARTING_FACTOR: 2.5,
    MIN_FACTOR: 1.3,
    FACTOR_MODIFIER: 0.15,
    EASY_BONUS: 1.3,
    HARD_MULTIPLIER: 1.2,
    GRADUATING_INTERVAL: 1, // days
    EASY_INTERVAL: 4 // days
};

/**
 * Card States (matching Anki's queue types)
 */
const CardState = {
    NEW: 0,
    LEARNING: 1,
    REVIEW: 2,
    RELEARNING: 3
};

/**
 * Answer Ratings (matching Anki's buttons)
 */
const Rating = {
    AGAIN: 1,  // Failed
    HARD: 2,   // Difficult
    GOOD: 3,   // Correct with effort
    EASY: 4    // Perfect recall
};

/**
 * FlashCard class with SM-2 scheduling
 */
class FlashCard {
    constructor(question, answer, id = null) {
        this.id = id || Date.now() + Math.random();
        this.question = question;
        this.answer = answer;
        
        // SM-2 Algorithm properties
        this.state = CardState.NEW;
        this.interval = 0;          // Days until next review
        this.easeFactor = SM2_CONSTANTS.STARTING_FACTOR;
        this.repetitions = 0;       // Successful reviews
        this.lapses = 0;            // Times failed
        this.lastReviewed = null;
        this.nextReview = Date.now();
        
        // Learning step intervals (in minutes)
        this.learningSteps = [1, 10]; // Default: 1 min, 10 min
        this.currentLearningStep = 0;
    }

    /**
     * Process answer and update card state using SM-2 algorithm
     */
    answerCard(rating) {
        const now = Date.now();
        this.lastReviewed = now;

        switch (this.state) {
            case CardState.NEW:
            case CardState.LEARNING:
                this._handleLearningCard(rating, now);
                break;
                
            case CardState.REVIEW:
                this._handleReviewCard(rating, now);
                break;
                
            case CardState.RELEARNING:
                this._handleRelearningCard(rating, now);
                break;
        }

        return this._getScheduleInfo();
    }

    /**
     * Handle learning/new cards
     */
    _handleLearningCard(rating, now) {
        if (rating === Rating.AGAIN) {
            // Reset to first learning step
            this.currentLearningStep = 0;
            this.nextReview = now + (this.learningSteps[0] * 60 * 1000);
            this.state = CardState.LEARNING;
        } else if (rating === Rating.GOOD || rating === Rating.HARD) {
            // Move to next learning step
            this.currentLearningStep++;
            
            if (this.currentLearningStep >= this.learningSteps.length) {
                // Graduate to review
                this.state = CardState.REVIEW;
                this.interval = SM2_CONSTANTS.GRADUATING_INTERVAL;
                this.repetitions = 1;
                this.nextReview = now + (this.interval * 24 * 60 * 60 * 1000);
            } else {
                this.nextReview = now + (this.learningSteps[this.currentLearningStep] * 60 * 1000);
                this.state = CardState.LEARNING;
            }
        } else if (rating === Rating.EASY) {
            // Graduate immediately with longer interval
            this.state = CardState.REVIEW;
            this.interval = SM2_CONSTANTS.EASY_INTERVAL;
            this.repetitions = 1;
            this.nextReview = now + (this.interval * 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Handle review cards using SM-2 algorithm
     */
    _handleReviewCard(rating, now) {
        if (rating === Rating.AGAIN) {
            // Card failed - move to relearning
            this.state = CardState.RELEARNING;
            this.lapses++;
            this.interval = Math.max(1, Math.floor(this.interval * 0.5));
            this.easeFactor = Math.max(
                SM2_CONSTANTS.MIN_FACTOR,
                this.easeFactor - 0.2
            );
            this.currentLearningStep = 0;
            this.nextReview = now + (this.learningSteps[0] * 60 * 1000);
        } else {
            // Calculate new interval using SM-2
            this.repetitions++;
            
            let intervalMultiplier;
            if (rating === Rating.HARD) {
                intervalMultiplier = SM2_CONSTANTS.HARD_MULTIPLIER;
                this.easeFactor = Math.max(
                    SM2_CONSTANTS.MIN_FACTOR,
                    this.easeFactor - SM2_CONSTANTS.FACTOR_MODIFIER
                );
            } else if (rating === Rating.GOOD) {
                intervalMultiplier = this.easeFactor;
            } else { // EASY
                intervalMultiplier = this.easeFactor * SM2_CONSTANTS.EASY_BONUS;
                this.easeFactor += SM2_CONSTANTS.FACTOR_MODIFIER;
            }

            this.interval = Math.ceil(this.interval * intervalMultiplier);
            this.nextReview = now + (this.interval * 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Handle relearning cards
     */
    _handleRelearningCard(rating, now) {
        // Similar to learning, but returns to review state
        if (rating === Rating.AGAIN) {
            this.currentLearningStep = 0;
            this.nextReview = now + (this.learningSteps[0] * 60 * 1000);
        } else {
            this.currentLearningStep++;
            
            if (this.currentLearningStep >= this.learningSteps.length) {
                // Return to review
                this.state = CardState.REVIEW;
                this.repetitions++;
                this.nextReview = now + (this.interval * 24 * 60 * 60 * 1000);
            } else {
                this.nextReview = now + (this.learningSteps[this.currentLearningStep] * 60 * 1000);
            }
        }
    }

    /**
     * Get schedule information for display
     */
    _getScheduleInfo() {
        const now = Date.now();
        const timeDiff = this.nextReview - now;
        
        let timeString;
        if (timeDiff < 60 * 60 * 1000) {
            // Less than an hour - show minutes
            timeString = `${Math.ceil(timeDiff / (60 * 1000))} min`;
        } else if (timeDiff < 24 * 60 * 60 * 1000) {
            // Less than a day - show hours
            timeString = `${Math.ceil(timeDiff / (60 * 60 * 1000))} hrs`;
        } else {
            // Show days
            timeString = `${Math.ceil(timeDiff / (24 * 60 * 60 * 1000))} days`;
        }

        return {
            nextReview: this.nextReview,
            interval: this.interval,
            timeString: timeString,
            state: this.state,
            repetitions: this.repetitions,
            lapses: this.lapses,
            easeFactor: this.easeFactor.toFixed(2)
        };
    }

    /**
     * Check if card is due for review
     */
    isDue() {
        return Date.now() >= this.nextReview;
    }

    /**
     * Get button labels based on current state
     */
    getButtonLabels() {
        if (this.state === CardState.NEW || this.state === CardState.LEARNING) {
            return {
                again: 'Again',
                hard: 'Hard',
                good: 'Good',
                easy: 'Easy'
            };
        } else {
            return {
                again: 'Again',
                hard: 'Hard',
                good: 'Good',
                easy: 'Easy'
            };
        }
    }

    /**
     * Serialize card data for storage
     */
    toJSON() {
        return {
            id: this.id,
            question: this.question,
            answer: this.answer,
            state: this.state,
            interval: this.interval,
            easeFactor: this.easeFactor,
            repetitions: this.repetitions,
            lapses: this.lapses,
            lastReviewed: this.lastReviewed,
            nextReview: this.nextReview,
            learningSteps: this.learningSteps,
            currentLearningStep: this.currentLearningStep
        };
    }

    /**
     * Deserialize card data from storage
     */
    static fromJSON(data) {
        const card = new FlashCard(data.question, data.answer, data.id);
        card.state = data.state;
        card.interval = data.interval;
        card.easeFactor = data.easeFactor;
        card.repetitions = data.repetitions;
        card.lapses = data.lapses;
        card.lastReviewed = data.lastReviewed;
        card.nextReview = data.nextReview;
        card.learningSteps = data.learningSteps || [1, 10];
        card.currentLearningStep = data.currentLearningStep || 0;
        return card;
    }
}

/**
 * FlashCard Manager
 */
class FlashCardManager {
    constructor() {
        this.cards = [];
        this.loadFromStorage();
    }

    /**
     * Add new cards from array
     */
    addCards(cardsData) {
        cardsData.forEach(data => {
            const card = new FlashCard(data.question, data.answer);
            this.cards.push(card);
        });
        this.saveToStorage();
    }

    /**
     * Get due cards for review
     */
    getDueCards() {
        return this.cards.filter(card => card.isDue()).sort((a, b) => a.nextReview - b.nextReview);
    }

    /**
     * Get stats
     */
    getStats() {
        const dueCards = this.getDueCards();
        const newCards = this.cards.filter(c => c.state === CardState.NEW);
        const learningCards = this.cards.filter(c => c.state === CardState.LEARNING);
        const reviewCards = this.cards.filter(c => c.state === CardState.REVIEW);

        return {
            total: this.cards.length,
            due: dueCards.length,
            new: newCards.length,
            learning: learningCards.length,
            review: reviewCards.length
        };
    }

    /**
     * Save to localStorage
     */
    saveToStorage() {
        localStorage.setItem('flashcards', JSON.stringify(this.cards.map(c => c.toJSON())));
    }

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        const data = localStorage.getItem('flashcards');
        if (data) {
            const cardsData = JSON.parse(data);
            this.cards = cardsData.map(d => FlashCard.fromJSON(d));
        }
    }

    /**
     * Clear all cards
     */
    clear() {
        this.cards = [];
        this.saveToStorage();
    }
}

// Export for use in main app
export { FlashCard, FlashCardManager, Rating, CardState, SM2_CONSTANTS };
