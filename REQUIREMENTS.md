# Freaks AI - Functional Requirements Document

## Project Overview
Freaks AI is a client-side AI-powered study companion that helps students learn more effectively through intelligent summarization, spaced repetition flashcards, and gamified progress tracking.

**Architecture:** 100% client-side application with no backend requirements  
**AI Engine:** Google Gemini Flash Lite API  
**Storage:** Browser localStorage for persistence  

---

## ✅ Implemented Features

### 1. Multimodal Input & Ingestion
| ID | Requirement | Status |
|----|-------------|--------|
| FR-03 | The system shall allow users to paste lecture text manually | ✅ Implemented |
| FR-04 | The system shall allow users to upload files in PDF, text, and image formats | ✅ Implemented |
| FR-06 | The system shall allow users to input URLs for content summarization | ✅ Implemented |
| FR-08 | The system shall extract readable text from uploaded documents | ✅ Implemented (via Gemini File API) |

### 2. Content Processing & Summarization
| ID | Requirement | Status |
|----|-------------|--------|
| FR-10 | The system shall generate summaries using Gemini AI models | ✅ Implemented |
| FR-15 | The system shall present summaries in a structured format | ✅ Implemented |
| FR-16 | The system shall highlight important concepts within summaries | ✅ Implemented |

### 3. Flashcard Generation & Spaced Repetition
| ID | Requirement | Status |
|----|-------------|--------|
| FR-19 | The system shall generate flashcards from summaries | ✅ Implemented |
| FR-20 | Flashcards shall be question-answer based on key concepts | ✅ Implemented |
| FR-22 | The system shall capture user self-assessed understanding (Again/Hard/Good/Easy) | ✅ Implemented |
| FR-23 | The system shall use spaced-repetition scheduling (Anki SM-2 algorithm) | ✅ Implemented |

### 4. Active Learning & Study Mode
| ID | Requirement | Status |
|----|-------------|--------|
| FR-25 | The system shall display flashcards one at a time for active recall | ✅ Implemented |
| FR-26 | The system shall allow users to revisit weak flashcards | ✅ Implemented (automatic scheduling) |

### 5. Study Tracking & Productivity
| ID | Requirement | Status |
|----|-------------|--------|
| FR-36 | The system shall track number of flashcards reviewed | ✅ Implemented |
| FR-37 | The system shall track total and session-wise study time | ✅ Implemented |
| FR-38 | The system shall provide a Pomodoro-based focus timer (25/5 min) | ✅ Implemented |
| FR-39 | The system shall display study progress using graphs, calendars, streaks, and heatmaps | ✅ Implemented |
| FR-39a | The system shall show circular progress chart with difficulty breakdown | ✅ Implemented |
| FR-39b | The system shall display GitHub-style activity heatmap (365 days) | ✅ Implemented |
| FR-39c | The system shall track and display study streaks | ✅ Implemented |

### 6. Gamification System
| ID | Requirement | Status |
|----|-------------|--------|
| FR-43 | The system shall implement XP, levels, and achievement badges | ✅ Implemented |
| FR-43a | The system shall award XP for flashcard reviews (10 XP per card) | ✅ Implemented |
| FR-43b | The system shall award XP for study sessions (50 XP + 5 XP/min) | ✅ Implemented |
| FR-43c | The system shall calculate dynamic levels based on total XP | ✅ Implemented |
| FR-43d | The system shall display 10+ achievement badges (streak, cards, time-based) | ✅ Implemented |
| FR-43e | The system shall show XP progress bar and level in header | ✅ Implemented |

### 7. AI Study Assistant
| ID | Requirement | Status |
|----|-------------|--------|
| FR-50 | The system shall provide AI chat for concept clarification | ✅ Implemented |
| FR-51 | The system shall generate AI-powered session summaries | ✅ Implemented |
| FR-52 | The system shall answer questions about uploaded materials | ✅ Implemented |

### 8. Data Persistence
| ID | Requirement | Status |
|----|-------------|--------|
| FR-45 | The system shall store summaries, flashcards, and study data persistently | ✅ Implemented (localStorage) |
| FR-46 | All data shall remain on the user's device | ✅ Implemented (client-side only) |

---

## 🔄 Partially Implemented

### 9. User Management (Alternative Implementation)
| ID | Requirement | Status |
|----|-------------|--------|
| FR-01 | User authentication | 🔄 Not needed - localStorage-based |
| FR-02 | User-specific data storage | 🔄 Per-browser localStorage |

**Note:** Authentication is not implemented as the app is fully client-side. Data is stored per-browser using localStorage.

---

## 📋 Planned Features (Future Enhancements)

### 10. Advanced Input Methods
| ID | Requirement | Status |
|----|-------------|--------|
| FR-05 | Image upload with OCR for handwritten notes | 📋 Planned |
| FR-07 | Voice input for learning queries | 📋 Planned |
| FR-09 | Advanced preprocessing for large documents | 📋 Planned |

### 11. Enhanced Content Processing
| ID | Requirement | Status |
|----|-------------|--------|
| FR-12 | Cross-check content with external sources | � Partially Implemented (Dynamic source search & validation) |
| FR-13 | Indicate missing information | 📋 Planned |
| FR-14 | Provide options for missing content (add own/search/exit) | 📋 Planned |
| FR-17 | Allow post-summary content refinement | 📋 Planned |
| FR-18 | Generate visual mind maps using graph representations | 📋 Planned |

### 12. Advanced Flashcard Features
| ID | Requirement | Status |
|----|-------------|--------|
| FR-24 | Image-based flashcards with image occlusion | 📋 Planned |

### 13. Socratic Learning Mode
| ID | Requirement | Status |
|----|-------------|--------|
| FR-27 | Socratic mode with hints and guided questions | 📋 Planned |
| FR-28 | Adaptive explanation style based on user frustration | 📋 Planned |
| FR-29 | Role-play simulations for applied learning | 📋 Planned |

### 14. Audio-Based Learning
| ID | Requirement | Status |
|----|-------------|--------|
| FR-30 | Generate podcast-style audio summaries | 📋 Planned |
| FR-31 | Support multiple audio formats (brief/deep/debate) | 📋 Planned |
| FR-32 | Real-time audio interruption and clarification | 📋 Planned |

### 15. Knowledge Visualization
| ID | Requirement | Status |
|----|-------------|--------|
| FR-33 | Interactive knowledge graphs with concept relationships | 📋 Planned |
| FR-34 | Semantic connections across study materials | 📋 Planned |
| FR-35 | Clickable graph nodes for definitions and flashcards | 📋 Planned |

### 16. Calendar Integration
| ID | Requirement | Status |
|----|-------------|--------|
| FR-40 | Integration with external calendar tools | 📋 Planned |

### 17. Collaboration Features (Requires Backend)
| ID | Requirement | Status |
|----|-------------|--------|
| FR-41 | Real-time collaborative study rooms | ❌ Requires backend |
| FR-42 | Multi-user session synchronization | ❌ Requires backend |
| FR-44 | Preserve streaks using rewards | 📋 Planned (client-side) |
| FR-45 | Join playlist after task completion | 📋 Planned |

---

## Non-Functional Requirements

### ✅ Implemented

#### 1. Accuracy & Reliability
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-01 | Minimize hallucinations by grounding in source material | ✅ Implemented |
| NFR-02 | Label externally sourced content | ✅ Via Gemini API |
| NFR-03 | Produce academically accurate summaries | ✅ Implemented |

#### 2. Performance
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-04 | Generate summaries within acceptable response time | ✅ Implemented |
| NFR-05 | Efficiently process content through Gemini API | ✅ Implemented |

#### 3. Usability
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-06 | Provide intuitive, distraction-free interface | ✅ Implemented (dark theme) |
| NFR-07 | Minimal onboarding for new users | ✅ Implemented |
| NFR-08 | Desktop browser support | ✅ Implemented |

#### 4. Accessibility
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-10 | Keyboard shortcuts for flashcards | ✅ Implemented (Space, 1-4, Escape) |

#### 5. Scalability
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-11 | Support single-user per browser | ✅ Implemented |
| NFR-12 | Modular architecture for future expansion | ✅ Implemented |

#### 6. Security & Privacy
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-13 | API key stored securely in localStorage | ✅ Implemented |
| NFR-14 | All data remains on user's device | ✅ Implemented |
| NFR-15 | HTTPS for API communication | ✅ Implemented |

#### 7. Maintainability
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-16 | Modular design principles | ✅ Implemented |
| NFR-17 | Configurable AI prompts | ✅ Implemented |

#### 8. Cost Constraints
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-18 | Operate using free-tier services | ✅ Implemented |
| NFR-19 | No paid APIs required | ✅ Implemented (user provides own key) |

#### 9. Compatibility
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-20 | Function across modern web browsers | ✅ Implemented |
| NFR-21 | Integrate with Gemini 2.5 Flash Lite | ✅ Implemented |

### 📋 Planned

#### 4. Accessibility (Future)
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-09 | WCAG 2.1 AA compliance | 📋 Partial (needs audit) |

#### 3. Usability (Future)
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-08b | Mobile app support | 📋 Planned (PWA) |

#### 10. Evaluation
| ID | Requirement | Status |
|----|-------------|--------|
| NFR-22 | Measurable academic improvement indicators | 📋 Planned (analytics) |
| NFR-23 | Responsible AI usage and content verification | 📋 Ongoing |

---

## Technology Stack

**Frontend:** Vanilla JavaScript (ES6+ Modules)  
**Styling:** CSS3 with CSS Variables  
**AI Engine:** Google Gemini Flash Lite API  
**Spaced Repetition:** Anki SM-2 Algorithm  
**Storage:** Browser localStorage  
**Charts:** Custom SVG rendering  
**Icons:** Font Awesome  
**Fonts:** Space Grotesk, JetBrains Mono  
**Hosting:** Static hosting (Vercel/Netlify/GitHub Pages)

---

## Key Statistics

- **Total Features:** 52+ functional requirements
- **Implemented:** 35+ features (67%)
- **Fully Client-Side:** No backend/database needed
- **Storage:** 100% browser localStorage
- **Code Size:** ~2,200 lines JS, ~2,650 lines CSS
- **Achievements:** 10 unlockable badges
- **Study Tracking:** 365-day heatmap visualization

---

## Future Roadmap

### Phase 6: Content Enhancement
- Image OCR for handwritten notes
- Mind map generation
- Visual knowledge graphs
- Export/import flashcard decks

### Phase 7: Advanced Learning
- Socratic tutoring mode
- Audio summaries and podcasts
- Image-based flashcards
- Quiz generation from content

### Phase 8: Productivity++
- Custom timer intervals
- Study goals and reminders
- Calendar integration
- Offline PWA support

### Phase 9: Mobile Experience
- Progressive Web App (PWA)
- Mobile-optimized UI
- Touch gestures
- Native app feel

---

**Last Updated:** December 21, 2025  
**Version:** 1.0  
**Architecture:** Client-side JavaScript Application
