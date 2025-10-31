import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import os from "os";

const __dirname = path.resolve();

// Paths
const distPath = path.join(__dirname, "dist");
const backendStaticPath = path.join(__dirname, "../Backend/app/static/frontend");

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

// 4️⃣ Locate uvicorn inside venv
const venvUvicornPath =
    os.platform() === "win32"
        ? "../venv/Scripts/uvicorn.exe"
        : "../venv/bin/uvicorn";

const uvicornPath = path.join(__dirname, venvUvicornPath);

// 5️⃣ Start FastAPI server (async)
console.log("🚀 Starting FastAPI server using venv...");

const uvicornProcess = spawn(
    uvicornPath,
    ["app.main:app", "--reload"],
    {
        cwd: path.join(__dirname, "../Backend"),
        stdio: "inherit",
    }
);

// 6️⃣ Start ngrok tunnel immediately
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

// 7️⃣ Optional: handle FastAPI exit
uvicornProcess.on("exit", (code) => {
    console.log(`❌ FastAPI server stopped (code ${code}).`);
});
