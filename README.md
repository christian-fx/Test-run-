# 🚀 Go Gadget - Admin Control Suite

**Go Gadget** is a premium, high-performance administrative dashboard designed for a modern tech e-commerce platform. Built with **React 19** and **Vite**, it offers a state-of-the-art experience for store management, security, and operations.

---

## 🛠️ Current Project Architecture

We have recently completed a major architectural overhaul, transitioning the dashboard into a scalable, modular system.

### 1. Administrative Settings Hub
The `Settings` module has been refactored from a single static page into a dynamic, tab-based navigation center with **7 dedicated sub-pages**:

*   **👤 Account (Admin Security)**: Personal admin profile, active session management (log out other devices), 2FA toggle, and login history logs.
*   **👥 Team & Permissions (RBAC)**: A full Role-Based Access Control system. Features a searchable staff list and a **Permissions Matrix** (checkbox grid) for fine-grained control over platform modules.
*   **🔔 Notifications**: Business-critical alert management via Email, SMS, and In-app channels.
*   **💳 Payments**: Native support for West African (Paystack/Flutterwave) and global (Stripe) gateways, including settlement settings and transaction history.
*   **🌐 Integrations**: A provider hub for Shipping (DHL/GIG), Marketing (Mailchimp), and Analytics (Google).
*   **🔑 API Keys**: Secure management for storefront access keys with built-in security alerts and "Revoke/Regenerate" flows.
*   **🏠 General**: Global store details (name, support, description) and Regional settings (currency, timezone, language).

### 2. Core UI Components
*   **Confirmation Shield**: A universal `ConfirmModal.jsx` used across all administrative actions to prevent accidental deletions or critical setting changes.
*   **Dynamic Nav**: A sidebar-driven layout with responsive tab switching for the settings modules.
*   **Design System**: Custom CSS Modules focusing on glassmorphic effects, modern typography, and responsive grid layouts.

---

## 🎨 Design Philosophy
*   **Premium Aesthetics**: High focus on visual excellence using harmonious color palettes and subtle micro-animations.
*   **Edit-to-Save Flow**: Professional "Draft Mode" logic allowing admins to review changes before committing them, with "Cancel" and "Save" safety nets.
*   **Visual Safety**: Integrated "Danger Zones" for destructive actions (e.g., suspending staff or revoking API keys).

---

## 🧪 Technical Stack
*   **Frontend**: React 19 (Hooks, Context, State Management)
*   **Build Tool**: Vite (Lightning-fast HMR)
*   **Styling**: Vanilla CSS (Maximum control/performance)
*   **Icons**: Lucide-React (1.7.0)
*   **Assets**: Cloudinary (Future Integration)
*   **Backend**: Firebase/Firestore (API Stubs Ready)

---

## 🏗️ Upcoming Roadmap (Next Steps)
- [ ] **Data Persistence**: Connect UI states to Firebase Firestore collections.
- [ ] **Live Auth**: Implement login/signup using `auth.js` and role-based route protection.
- [ ] **Media Handling**: Complete the Cloudinary image upload flow for products.
- [ ] **Inventory Hub**: Finish the `AddProductModal.jsx` and connect the product grid to live data.

---

## 🚀 Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
