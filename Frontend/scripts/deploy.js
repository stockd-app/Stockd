import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import os from "os";

const __dirname = path.resolve();

// Paths
const distPath = path.join(__dirname, "dist");
const backendPath = path.join(__dirname, "../Backend");
const backendStaticPath = path.join(backendPath, "app/static/frontend");
const requirementsPath = path.join(backendPath, "requirements.txt");
const venvPath = path.join(__dirname, "../venv");

// 1️⃣ Ensure build exists
if (!fs.existsSync(distPath)) {
    console.error("❌ Build folder not found. Run npm run build first.");
    process.exit(1);
}

// 2️⃣ Clean old frontend
if (fs.existsSync(backendStaticPath)) {
    fs.rmSync(backendStaticPath, { recursive: true, force: true });
    console.log("🧹 Cleared old static frontend build.");
}

// 3️⃣ Copy new build
fs.mkdirSync(backendStaticPath, { recursive: true });
fs.copySync(distPath, backendStaticPath);
console.log("✅ Copied new frontend build to Backend/app/static/frontend.");

// 4️⃣ Detect Python and create virtual environment if needed
console.log("🐍 Checking Python environment...");
const pythonCmd = os.platform() === "win32" ? "python" : "python3";

if (!fs.existsSync(venvPath)) {
    console.log("📦 Creating new virtual environment...");
    const venvResult = spawnSync(pythonCmd, ["-m", "venv", venvPath], { stdio: "inherit" });
    if (venvResult.status !== 0) {
        console.error("❌ Failed to create venv. Make sure Python is installed.");
        process.exit(1);
    }
}

// 5️⃣ Install backend dependencies from requirements.txt
console.log("📦 Installing Python dependencies from requirements.txt...");
const pipPath =
    os.platform() === "win32"
        ? path.join(venvPath, "Scripts", "pip.exe")
        : path.join(venvPath, "bin", "pip");

if (!fs.existsSync(requirementsPath)) {
    console.warn("⚠️ requirements.txt not found. Skipping dependency install.");
} else {
    const pipInstall = spawnSync(pipPath, ["install", "-r", requirementsPath], { stdio: "inherit" });
    if (pipInstall.status !== 0) {
        console.error("❌ Failed to install Python dependencies.");
        process.exit(1);
    }
}

// 6️⃣ Determine Uvicorn executable path
const uvicornPath =
    os.platform() === "win32"
        ? path.join(venvPath, "Scripts", "uvicorn.exe")
        : path.join(venvPath, "bin", "uvicorn");

// 7️⃣ Launch FastAPI server
console.log("🚀 Starting FastAPI server using venv...");
const uvicornProcess = spawn(
    uvicornPath,
    ["app.main:app", "--reload"],
    {
        cwd: backendPath,
        stdio: "inherit",
    }
);

// 8️⃣ Start ngrok tunnel immediately
console.log("🌍 Launching ngrok tunnel...");

if (os.platform() === "win32") {
    // Windows — open new CMD window
    spawn("cmd", ["/c", "start", "cmd", "/k", "ngrok http 8000"], {
        stdio: "ignore",
        detached: true,
    });
} else {
    // macOS/Linux — background process
    spawn("ngrok", ["http", "8000"], { stdio: "ignore", detached: true });
}

console.log("✅ ngrok started in a new window.");

// 9️⃣ Handle FastAPI shutdown gracefully
uvicornProcess.on("exit", (code) => {
    console.log(`❌ FastAPI server stopped (code ${code}).`);
});