# Frontend Implementation Instructions

## Project Context

We are building a production-ready authentication module as part of a Full Stack technical assessment.

The frontend must be implemented using:

* React
* TypeScript
* Vite
* Tailwind CSS v4
* React Router
* React Hook Form
* Zod
* TanStack Query
* Axios
* Lucide React

The current phase is **UI-first**.

Do NOT implement the backend integration yet.

Build the frontend UI, routing, reusable components, responsive layouts, forms, and validation-ready structure first. API integration will be implemented in a later phase.

---

# 1. Architecture

Use a **feature-based architecture**.

Do NOT organize the entire application into global folders such as:

```text
components/
pages/
hooks/
services/
utils/
```

Instead, business-specific code must live inside its feature.

Use this structure:

```text
src/
├── app/
│   ├── layouts/
│   ├── providers/
│   └── router/
│
├── features/
│   └── auth/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── schemas/
│       ├── types/
│       └── utils/
│
├── shared/
│   ├── components/
│   ├── constants/
│   ├── lib/
│   └── types/
│
├── App.tsx
└── main.tsx
```

### Architecture rules

`features/auth` owns everything specifically related to authentication.

Examples:

```text
features/auth/components/
features/auth/pages/
features/auth/hooks/
features/auth/schemas/
features/auth/types/
features/auth/api/
```

Shared reusable UI belongs in:

```text
shared/components/
```

Generic utilities belong in:

```text
shared/lib/
```

Routing belongs in:

```text
app/router/
```

Application-level providers belong in:

```text
app/providers/
```

Do not create unnecessary abstractions.

Do not create a file unless it has a clear responsibility.

Prefer composition over deeply nested abstractions.

---

# 2. UI Goal

Create a polished, modern, professional authentication platform.

The UI should look like a real SaaS product rather than a coding-test demo.

The reviewer should immediately notice:

* strong visual hierarchy
* polished spacing
* responsive design
* accessibility
* consistent components
* thoughtful UX
* clean architecture
* attention to details

Do NOT use excessive gradients, excessive animations, glassmorphism everywhere, or visually noisy effects.

The design should feel:

* modern
* trustworthy
* professional
* minimal
* premium
* production-ready

Use Tailwind CSS for styling.

Use Lucide React for icons.

Do not use emoji as UI icons.

---

# 3. Application Pages

Create the following routes:

```text
/
 /signup
 /signin
 /application
```

The application page represents the protected area.

For now, because the backend is not connected, the application page can use mock authentication state.

Do not implement real authentication yet.

---

# 4. Landing Page

Create a smart landing page at:

```text
/
```

The landing page should communicate that this is a secure modern application platform.

Sections:

### Navbar

Include:

* Logo / brand name
* Features
* Security
* Contact
* Sign In
* Get Started

Desktop navigation should be horizontal.

Mobile navigation should collapse into a mobile menu.

The navbar should be clean and sticky or intelligently positioned.

---

### Hero Section

Create a strong hero section.

Example concept:

```text
Secure access.
Simple experience.

A modern authentication experience built with
security, performance, and usability in mind.

[Create your account] [Sign in]
```

Do not copy this exact text if a better professional version can be created.

Include a subtle visual element on the right side representing:

* authentication
* security
* user identity
* application access

Use CSS/Tailwind and Lucide icons rather than external images unless there is a strong reason.

The hero must work beautifully on mobile.

---

# 5. Features Section

Create a feature section with 3–4 cards.

Suggested concepts:

### Secure by Design

Explain that authentication is designed around secure password handling and protected access.

### Fast & Reliable

Emphasize a clean and responsive experience.

### Developer Friendly

Explain that the system follows modular and maintainable architecture.

### Built for Growth

Explain that the architecture is designed to scale as features are added.

Each card should contain:

* Lucide icon
* title
* short description

Cards should have subtle hover states.

Do not over-animate them.

---

# 6. Security Section

Create a visually strong security section.

Possible content:

```text
Security is not an afterthought.

Authentication should feel simple for users
while remaining thoughtfully engineered behind the scenes.
```

Show 3 security principles:

* Secure password handling
* Protected application access
* Validated user input

This section should visually break the page from the previous section.

---

# 7. How It Works Section

Create a simple three-step section:

```text
01
Create your account

02
Sign in securely

03
Access your application
```

Use a clean timeline or connected cards.

Keep it visually simple.

---

# 8. Contact Us Section

Create a professional contact section.

Include:

* Name
* Email
* Message
* Submit button

Use React Hook Form structure.

Use Zod validation structure.

Validation should include:

```text
name: required
email: valid email
message: minimum reasonable length
```

For now, do NOT send the form to an API.

On successful submission, display a polished success state/toast.

Do not use browser `alert()`.

The UI should communicate:

```text
Thanks for reaching out.
We'll get back to you soon.
```

The contact form should be reusable and accessible.

---

# 9. Footer

Create a polished footer.

Include:

* brand
* short description
* navigation links
* authentication links
* contact link
* copyright

Keep it minimal.

---

# 10. Signup Page

Create:

```text
/signup
```

The page should have a professional authentication layout.

Fields:

```text
Name
Email
Password
```

Password requirements:

```text
Minimum 8 characters
At least one letter
At least one number
At least one special character
```

Display password requirements clearly.

As the user types, visually indicate which requirements are satisfied.

Use:

* React Hook Form
* Zod
* accessible error messages
* proper labels
* loading state
* password visibility toggle

Do not connect to the backend yet.

On submit, temporarily simulate a successful submission.

---

# 11. Sign In Page

Create:

```text
/signin
```

Fields:

```text
Email
Password
```

Include:

* password visibility toggle
* validation errors
* loading state
* remember-me UI if appropriate
* link to signup

Keep the page visually consistent with signup.

Do not create a completely different design.

---

# 12. Application Page

Create:

```text
/application
```

Design it as a simple authenticated application dashboard.

Display:

```text
Welcome to the application.
```

Also include:

* user avatar placeholder
* user name
* logout button
* simple dashboard shell

The page should feel intentional rather than an empty screen.

Logout can be mocked for now.

---

# 13. Reusable Components

Create reusable components only when they provide real value.

Potential shared components:

```text
shared/components/
├── Button.tsx
├── Input.tsx
├── Textarea.tsx
├── Logo.tsx
├── Container.tsx
└── SectionHeading.tsx
```

Authentication-specific components:

```text
features/auth/components/
├── AuthLayout.tsx
├── AuthCard.tsx
├── LoginForm.tsx
├── SignupForm.tsx
├── PasswordInput.tsx
└── PasswordRequirements.tsx
```

Do not duplicate form UI.

---

# 14. Design System

Create consistent visual tokens using Tailwind.

Use a neutral professional palette.

Suggested direction:

* deep navy / slate for primary surfaces
* white backgrounds
* subtle slate borders
* one professional accent color
* green for success
* red for validation errors
* amber for warnings

Do not hardcode dozens of unrelated colors.

Maintain consistency.

Use consistent:

```text
border radius
spacing
font sizes
shadows
button heights
input heights
```

---

# 15. Responsive Design

The application must be fully responsive.

Test at:

```text
Mobile
Tablet
Desktop
Large desktop
```

Do not simply shrink desktop layouts.

Mobile navigation, forms, cards, spacing, and hero content should be intentionally designed.

---

# 16. Accessibility

Follow basic accessibility best practices.

Every form input must have:

```text
label
name
id
accessible error message
```

Buttons must have meaningful text.

Interactive elements must have visible focus states.

Do not rely only on color to communicate validation.

Maintain reasonable contrast.

Keyboard navigation should work.

---

# 17. UX Details

Pay attention to small details.

Examples:

* button hover states
* button disabled states
* loading states
* form validation states
* password visibility toggle
* focus states
* success feedback
* empty states
* mobile navigation
* smooth but restrained transitions

Do not add animations just for decoration.

Use animation when it improves understanding or perceived quality.

---

# 18. React Rules

Use functional components.

Use TypeScript strictly.

Avoid:

```ts
any
```

unless there is a documented reason.

Prefer:

```ts
interface
type
```

for explicit domain models.

Keep components small.

Avoid components containing unrelated responsibilities.

Avoid deeply nested conditional JSX.

Extract meaningful components when complexity increases.

---

# 19. Forms

Use:

```text
React Hook Form
+
Zod
+
@hookform/resolvers
```

Do not manually manage every input with:

```text
useState()
```

Use schema-driven validation.

The signup schema should eventually enforce:

```text
name >= 3 characters
valid email
password >= 8
password contains letter
password contains number
password contains special character
```

Keep schemas inside:

```text
features/auth/schemas/
```

---

# 20. API Preparation

Even though we are not implementing backend integration yet, structure the code so API integration can be added cleanly.

Eventually:

```text
features/auth/api/auth.api.ts
```

will contain:

```text
signup()
signin()
getCurrentUser()
logout()
```

Do not put API calls directly inside components.

Create the architecture now so components remain independent of HTTP implementation.

---

# 21. State Management

Do NOT introduce Redux.

For this application:

* local UI state → React state
* form state → React Hook Form
* server state → TanStack Query
* authentication state → dedicated auth abstraction when backend integration is added

Do not introduce a state-management library unless there is a demonstrated need.

---

# 22. Routing

Create the router under:

```text
app/router/
```

Keep route definitions separate from page components.

Routes:

```text
/
 /signup
 /signin
 /application
```

Prepare the architecture for a future protected route.

Eventually:

```text
ProtectedRoute
```

will protect:

```text
/application
```

---

# 23. Code Quality

Before considering the implementation complete:

* remove unused imports
* remove unused files
* remove placeholder comments
* remove console.log statements
* ensure TypeScript passes
* ensure ESLint passes
* ensure production build succeeds
* ensure responsive layouts work
* ensure forms have validation
* ensure components are reusable where appropriate

Run:

```bash
npm run build
```

and fix all errors.

---

# 24. Important Constraint

Do not over-engineer.

This is a technical assessment designed to be completed within a few hours.

The goal is:

```text
Simple
+
Clean
+
Production-minded
+
Well structured
+
Beautiful
```

NOT:

```text
Complex
+
Over-abstracted
+
Hundreds of files
```

Every architectural decision should have a reason.

---

# 25. Implementation Order

Implement in this order:

### Phase 1

Create the folder structure.

### Phase 2

Create:

* app router
* app providers
* shared UI primitives
* layout components

### Phase 3

Build landing page:

```text
Navbar
Hero
Features
Security
How It Works
Contact
Footer
```

### Phase 4

Build authentication UI:

```text
Signup
Signin
Password requirements
Validation
Loading states
Error states
```

### Phase 5

Build application page.

### Phase 6

Polish responsive behavior and accessibility.

### Phase 7

Run:

```bash
npm run build
```

and fix all issues.

Do not start backend integration yet.

---

# Final Quality Bar

The finished UI should look like something that could realistically be shown to a product manager or engineering team.

When reviewing the implementation, ask:

> "Would I be comfortable maintaining this code six months from now?"

If the answer is no, improve the architecture before adding more code.

Prioritize:

1. Architecture
2. UX
3. Accessibility
4. Type safety
5. Reusability
6. Responsive design
7. Maintainability
8. Visual polish

Do not sacrifice architecture for visual effects.
