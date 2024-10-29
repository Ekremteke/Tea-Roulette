const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

const dataPath = path.join(__dirname, "public", "data.json");

async function ensureDataFile() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, "[]");
  }
}

app.get("/api/preferences", async (req, res) => {
  try {
    await ensureDataFile();
    const data = await fs.readFile(dataPath, "utf8");

    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Error reading preferences" });
  }
});

app.post("/api/preferences", async (req, res) => {
  try {
    await ensureDataFile();
    const data = await fs.readFile(dataPath, "utf8");
    const preferences = JSON.parse(data);

    const { name, sugar, milk } = req.body;

    if (!name || typeof sugar !== "number" || typeof milk !== "boolean") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    preferences.push({ name, sugar, milk });
    await fs.writeFile(dataPath, JSON.stringify(preferences, null, 2));
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: "Error adding preference" });
  }
});

app.delete("/api/preferences/all", async (req, res) => {
  try {
    await fs.writeFile(dataPath, "[]");
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: "Error deleting all preferences" });
  }
});

app.delete("/api/preferences/:index", async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, "utf8");
    const preferences = JSON.parse(data);
    const index = parseInt(req.params.index);

    if (isNaN(index) || index < 0 || index >= preferences.length) {
      return res.status(400).json({ error: "Invalid index" });
    }

    preferences.splice(index, 1);
    await fs.writeFile(dataPath, JSON.stringify(preferences, null, 2));
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: "Error removing person" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
