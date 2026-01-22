# MOON Super App: Implementation Plan

## Overview
Transform the existing "MOON Prediction Market" Mini App into a comprehensive "Super App" portal. The app will feature three core pillars accessible via a persistent bottom navigation bar.

## Architecture: The "Tabbed" Experience
*   **Tab 1: Markets (Home)** -> The existing Prediction Dashboard.
*   **Tab 2: AI Analyst (Chat)** -> A new conversational interface powered by Chatbase.
*   **Tab 3: News (Channel)** -> A bridge to the `@cricketandcrypto` Telegram channel.

---

## Phase 1: Navigation Architecture (The Shell)
*Goal: Implement a unified navigation system.*

### 1.1 Components
*   **`BottomNav.tsx`**: A fixed, glassmorphism-styled navigation bar.
    *   State: Tracks active tab.
    *   Routing: Uses Next.js `Link` for internal pages (`/`, `/chat`) and a handler for external links (`/news`).
*   **Icons**: Use `lucide-react` (LayoutGrid, Bot, Newspaper).

### 1.2 Layout Integration
*   Update `src/app/layout.tsx` to include `BottomNav` at the root level.
*   Adjust global padding (`pb-24`) to prevent content overlap.

---

## Phase 2: AI Analyst (Chatbase Integration)
*Goal: Provide real-time cricket and market insights via AI.*

### 2.1 Backend (Next.js API Route)
*   **File**: `src/app/api/chat/route.ts`
*   **Function**: Proxy request to Chatbase API.
*   **Security**: Use `process.env.CHATBASE_API_KEY`.
*   **Endpoint**: `POST /api/chat`
    *   Input: `{ message: string, conversationId?: string }`
    *   Output: `{ text: string }`

### 2.2 Frontend (Chat UI)
*   **File**: `src/app/chat/page.tsx`
*   **UI Components**:
    *   `MessageList`: Scrollable area for chat history.
    *   `MessageBubble`: Styled component for User vs. AI messages.
    *   `ChatInput`: Text area with send button.
*   **Logic**:
    *   `useState` for message history.
    *   `fetch` call to our internal `/api/chat`.
    *   Auto-scroll to bottom on new message.

---

## Phase 3: News Hub
*Goal: Drive traffic to the Telegram Channel.*

### 3.1 News Landing Page
*   **File**: `src/app/news/page.tsx`
*   **UI**:
    *   Header: "Cricket & Crypto Intel".
    *   Content: A visual preview/teaser card.
    *   Action: Large CTA button "Open Channel" that triggers `WebApp.openTelegramLink`.
*   **Why a page?** It keeps the user inside the app environment before explicitly choosing to leave, feeling more "app-like" than a raw link.

---

## Phase 4: Configuration & Deployment
### 4.1 Environment Variables
*   Add `CHATBASE_API_KEY` and `CHATBASE_BOT_ID` to Vercel.

### 4.2 Deployment
*   Deploy to Vercel.
*   Verify navigation flow in Telegram.

---

## Future Enhancements (PythonAnywhere)
*   **News Scraper**: A Python script hosted on PythonAnywhere that listens to `@cricketandcrypto`, scrapes new posts, and saves them to the Supabase `news` table.
*   **Integration**: The Mini App then fetches from Supabase to show the actual news feed *inside* the app.
