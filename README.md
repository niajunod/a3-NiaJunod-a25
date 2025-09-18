Shift Tracker — A3

Render Link: https://a3-niajunod-a25.onrender.com/

Vercel Link: https://a3-nia-junod-a25-klzz3zxrk-niajunods-projects.vercel.app/

I deployed on both Render (baseline requirement) and Vercel (alternative hosting achievement). Render was straightforward since it matched course instructions, but Vercel had a smoother developer UI and faster deployments.

Project Summary

Shift Tracker is a two-tier web application that helps restaurant workers log their shifts, calculate tips, and track hourly pay. The application includes authentication, persistent data storage, and a polished UI powered by Bootstrap.

Goals of the application

Provide a lightweight tool for tracking work shifts and calculating earnings.

Allow users to log in, create accounts, and manage their personal shift data securely.

Persist user data across sessions using MongoDB.

Build a tool useful for real-world staff (e.g., FOH staff at the Pridwin Hotel).

Challenges faced

Implementing authentication logic (login vs. create account) in Express.

Configuring MongoDB and managing persistent storage.

Debugging accessibility and SEO issues to push Lighthouse scores above 90%.

Authentication Strategy

Simple username/password login (accounts are created automatically if they do not exist).

Chosen because it aligns with the assignment requirements and keeps the focus on persistence.

Login Instructions for Graders:

You can log in with the seeded account: username: testuser / password: password123

Or create a new account with any username/password.

Once logged in, you can add/edit/delete shifts and view results.

CSS Framework

Bootstrap 5 was chosen for its professional styling, responsive grid system, and accessibility support.

Custom CSS (/css/styles.css) was added for branding:

White background with accent colors for buttons.

Improved table readability with striped rows.

Accessible contrast for primary buttons.

Express Middleware

express.json() — parses JSON request bodies.

express.urlencoded() — parses URL-encoded request bodies from forms.

express.static() — serves static files such as CSS and JavaScript.

express-session — manages user login sessions.

mongodb / mongoose — database client for persistent storage of user shift data.

Custom middleware — authentication logic that checks session user and routes accordingly.

Features

Login / Create Account
Users log in with a username and password. If the account does not exist, it is automatically created.

Shift Management
Add, edit, and delete shifts (restaurant name, hours, and tips).

Results / Data Display
Logged-in users can view all their past shifts in a responsive Bootstrap table.

Stats Section
Average hourly rate, total tips, and total number of shifts.

Persistent Data
All data is stored in MongoDB and persists across server restarts.

Installation & Setup

Clone the repository:
git clone https://github.com/yourusername/a3-NiaJunod.git
cd a3-NiaJunod
Install dependencies:

npm install

Configure environment variables in .env:

MONGO_URI=mongodb+srv://...
SESSION_SECRET=yourSecret


Run the server:

npm start

Testing & Lighthouse Results

Performance: 100

Accessibility: 100

Best Practices: 100

SEO: 100

(When tested in an incognito window — in a normal browser with extensions, results averaged ~90. Screenshot of results included in repo.)

I had to run it in a incognito window, I have a lot of Chrome extensions it was saying which was making the score lower from before. 

Technical Achievements

Lighthouse Optimization (5 pts): Achieved 98–100 scores across categories by reducing unused CSS, fixing accessibility contrast, and optimizing load order.

Alternative Hosting (5 pts): Deployed on both Render and Vercel. Render is simpler for class requirements; Vercel provided faster builds and easier DNS integration.

Design Achievements

Accessibility Improvements (10 pts): Followed W3C accessibility tips, including:

ARIA labels on navigation and live regions.

Sufficient color contrast on buttons and inputs.

Semantic HTML (<main>, <nav>, <section>).

Form validation feedback with invalid-feedback.

Responsive design via Bootstrap grid.

Clear button text for screen readers (“Login / Create”).

(and more, up to 12 tips documented in code).

CRAP Principles (5 pts):

Contrast: Login button emphasized with Bootstrap primary color.

Repetition: Consistent use of typography and card layouts.

Alignment: Tables, forms, and buttons aligned using Bootstrap grid.

Proximity: Related form fields grouped with clear labels and spacing.

Known Issues / Future Work

Sessions are not stored in MongoDB (currently in-memory only). Future work could integrate connect-mongo for scalable persistence.

Could extend with GitHub OAuth login as an advanced feature.

Folder Structure

/models/User.js — user schema.

/routes/api.js — CRUD API endpoints.

/public/ — static assets, CSS, HTML.

/server.js — Express server setup and MongoDB connection.

Credits / Acknowledgements

CS4241 Assignment 3 instructions.

Bootstrap 5 for CSS framework.

MongoDB Atlas for database hosting.

Render and Vercel for deployment.


