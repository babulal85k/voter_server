const express = require("express");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");

const app = express();
app.use(express.json());

// ✅ Configure CORS to allow frontend access
app.use(cors({
    origin: "http://localhost:5174",  // Allow frontend origin
    methods: "GET,POST",              // Allow necessary methods
    credentials: true                 // Enable cookies/session
}));

// ✅ Use sessions for authentication
app.use(session({
    secret: "mysecretkey",   // Change this in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }  // Secure false for local testing
}));

const FILE_PATH = "./voters.json";

// ✅ Ensure voters.json exists
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, "[]", "utf8"); // Create empty JSON array
}

// Dummy users (Replace with a database later)
const users = [{ username: "admin", password: "1234" }];

// ✅ Login API
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
        req.session.user = username; // Store user in session
        return res.json({ message: "Login successful", username });
    }
    res.status(401).json({ error: "Invalid credentials" });
});

// ✅ Logout API
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
    });
});

// ✅ Get voter list
app.get("/voters", (req, res) => {
    fs.readFile(FILE_PATH, (err, data) => {
        if (err) return res.status(500).json({ error: "Error reading file" });
        res.json(JSON.parse(data));
    });
});

// ✅ Save updated voter list (Only if logged in)
app.post("/save-voters", (req, res) => {
    if (!req.session.user) {
        return res.status(403).json({ error: "You must be logged in to mark voters" });
    }

    fs.writeFile(FILE_PATH, JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Error saving data" });
        res.json({ message: "Voters updated successfully" });
    });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
