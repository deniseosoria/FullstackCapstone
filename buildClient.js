const { exec } = require("child_process");
const path = require("path");

const clientPath = path.join(__dirname, "client");

console.log("🔨 Building client...");

exec("npm run build", { cwd: clientPath }, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Build error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ stderr: ${stderr}`);
  }
  console.log(`✅ Build output:\n${stdout}`);
});
