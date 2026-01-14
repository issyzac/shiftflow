# **Technical Specification: Enzi Coffee Daily Barista Operations Tool**

## **1\. Project Overview**

**Enzi Coffee Business** requires a centralized, agent-ready operations platform to manage daily cafe workflows. This tool acts as the digital "Harakati za Enzi" In-Café Checklist, bridging high-level strategic tasks (C-Suite) and ground-level execution (Baristas).

## **2\. System Architecture & Tech Stack**

* **Platform:** Web-based (Mobile-first responsive design).  
* **Frontend:** React with Tailwind CSS (Modern Espresso aesthetic).  
* **Backend/Database:** **Supabase** (PostgreSQL, Realtime, and Supabase Auth).  
* **Authentication:** Multi-role (C-Suite, Manager, Barista).

## **3\. Core Functional Modules**

### **A. Shift Initiation & Communication**

* **Shift Entry:** Barista selects location (e.g., Mbezi/Victoria) and designates the Barista-in-Charge (BIC).  
* **Morning Briefing:** A 5-minute mandatory briefing toggle to confirm daily goals, service standards, and promotions are reviewed.  
* **Systems Verification:** Integrated check for POS terminals, payment systems (mobile money/card), Wi-Fi connectivity, and cash drawer float accuracy.

### **B. Barista Operational Dashboard**

* **Quality Control & Wastage:**  
  * *Pastry Audit:* Tracking production dates; automated prompt to dispose of items older than 48 hours.  
  * *Beverage Freshness:* Tracking opened sparkling water (12h limit) and perishable dairy expiry.  
* **Hourly Ambiance Engine:** Prompts for music playlists, lighting levels, and restroom/seating cleanliness.  
* **Restock & Inventory:**  
  * Digital "Form ya Ukaguzi" (Store Audit) integration.  
  * Restock logs for packaging (cups/lids) and cleaning materials.  
  * Supplier entry for low-stock orders (Quantities \+ Expected delivery dates).

### **C. Maintenance (Fundi) Tracking**

* **Facility Walk-through:** Log to identify equipment malfunctions (Espresso machines, grinders, refrigeration).  
* **Repair Scheduler:** Ability to log "Fundi" visits, task assignments, and follow-up on previous issues.

### **D. C-Suite & Leadership Portal**

* **Task Dispatcher:** Push ad-hoc tasks (e.g., "Prep for seasonal promotion") to specific locations.  
* **Audit Dashboard:** View historical shift data, wastage trends (fast vs. slow-moving pastries), and equipment uptime.

## **4\. Data Schema (Supabase/PostgreSQL)**

### **Tables:**

* **locations**: id, name, address.  
* **profiles**: id, name, role, location\_id.  
* **tasks**: id, title, description, type (periodic/ad-hoc), category (Quality, Systems, Maintenance).  
* **shifts**: id, location\_id, bic\_id, start\_time, end\_time, cash\_float\_verified (bool), briefing\_completed (bool).  
* **wastage\_logs**: id, shift\_id, item\_type, quantity, reason (Expired/Damaged).  
* **maintenance\_tickets**: id, location\_id, equipment\_name, issue\_description, status (Open/Fundi Scheduled/Fixed).  
* **task\_logs**: id, shift\_id, task\_id, completed\_at.

## **5\. UI/UX Requirements**

* **Theme:** "Modern Espresso" — Rich coffee tones (\#3C2A21), Creams (\#F4E0B9).  
* **Mobile-First:** Action buttons must be large (min 48px) for quick tapping during service.  
* **Real-time Alerts:** Desktop/Mobile notifications for restock requests and new C-Suite tasks.

## **6\. Antigravity Agent "Mission" Prompt**

**Mission:** Build the "Enzi Coffee Operations Tool" based on enzi\_coffee\_ops\_spec.md.

**Instructions:**

1. Initialize React \+ Tailwind \+ Supabase.  
2. Generate SQL migrations for all tables in Section 4, including the new wastage\_logs and maintenance\_tickets.  
3. Implement the **Opening Flow**: System checks (POS/Wi-Fi) \-\> Morning Briefing \-\> Shift Start.  
4. Build the **Barista Dashboard**:  
   * Create a "Wastage Tracker" for pastries and sparkling water with time-based warnings.  
   * Implement a "Restock Log" that captures supplier details.  
   * Add a "Fundi/Maintenance" tab for reporting equipment issues.  
5. Build the **C-Suite Panel**: A simple interface to create "Ad-hoc" tasks and view a summary of daily wastage/maintenance.

**Verification:** Simulate a barista logging an expired pastry and a broken grinder. Verify the C-Suite view shows these events in real-time.