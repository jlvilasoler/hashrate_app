const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "client", "dist");
const dest = path.join(__dirname, "dist");
if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log("Copied client/dist -> dist");
} else {
  console.warn("client/dist not found, skipping copy");
}
