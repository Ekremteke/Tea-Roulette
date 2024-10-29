// Importing the Express framework to set up the server
const express = require("express");
// Importing the file system promises module for asynchronous file handling
const fs = require("fs").promises;
// Importing the path module to work with file and directory paths
const path = require("path");

// Initializing the Express application
const app = express();
// Defining the server port
const port = 3000;

// Serving static files from the 'public' directory
app.use(express.static("public"));
// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Setting the path for the data file to store tea preferences in JSON format
const dataPath = path.join(__dirname, "public", "data.json");

// Helper function to check if the data file exists; if not, it creates an empty JSON array
async function ensureDataFile() {
  try {
    await fs.access(dataPath); // Checks if the file is accessible
  } catch {
    await fs.writeFile(dataPath, "[]"); // Creates the file with an empty array if it doesn't exist
  }
}

// GET route to fetch all tea preferences from the data file
app.get("/api/preferences", async (req, res) => {
  try {
    await ensureDataFile(); // Ensures the data file exists
    const data = await fs.readFile(dataPath, "utf8"); // Reads the file content as a string

    res.json(JSON.parse(data)); // Parses the JSON string and sends it as the response
  } catch (error) {
    res.status(500).json({ error: "Error reading preferences" }); // Sends an error response if reading fails
  }
});

// POST route to add a new tea preference to the data file
app.post("/api/preferences", async (req, res) => {
  try {
    await ensureDataFile(); // Ensures the data file exists
    const data = await fs.readFile(dataPath, "utf8"); // Reads existing preferences from the file
    const preferences = JSON.parse(data); // Parses the data into an array of preferences

    // Extracts new preference data from the request body
    const { name, sugar, milk } = req.body;

    // Validates input data - 'name' must exist, 'sugar' should be a number, and 'milk' a boolean
    if (!name || typeof sugar !== "number" || typeof milk !== "boolean") {
      return res.status(400).json({ error: "Invalid input data" }); // Returns an error if data is invalid
    }

    // Adds the new preference to the array
    preferences.push({ name, sugar, milk });
    // Writes the updated preferences back to the data file
    await fs.writeFile(dataPath, JSON.stringify(preferences, null, 2));
    res.json(preferences); // Responds with the updated list of preferences
  } catch (error) {
    res.status(500).json({ error: "Error adding preference" }); // Sends an error response if adding fails
  }
});

// DELETE route to remove all preferences from the data file
app.delete("/api/preferences/all", async (req, res) => {
  try {
    await fs.writeFile(dataPath, "[]"); // Overwrites the file with an empty array
    res.json([]); // Responds with an empty array to confirm deletion
  } catch (error) {
    res.status(500).json({ error: "Error deleting all preferences" }); // Sends an error response if deleting fails
  }
});

// DELETE route to remove a specific preference by its index in the array
app.delete("/api/preferences/:index", async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, "utf8"); // Reads existing preferences from the file
    const preferences = JSON.parse(data); // Parses the data into an array
    const index = parseInt(req.params.index); // Converts the index parameter from the URL to a number

    // Validates the index - it must be a number within the array's range
    if (isNaN(index) || index < 0 || index >= preferences.length) {
      return res.status(400).json({ error: "Invalid index" }); // Returns an error if the index is invalid
    }

    // Removes the item at the specified index
    preferences.splice(index, 1);
    // Writes the updated preferences back to the data file
    await fs.writeFile(dataPath, JSON.stringify(preferences, null, 2));
    res.json(preferences); // Responds with the updated list of preferences
  } catch (error) {
    res.status(500).json({ error: "Error removing person" }); // Sends an error response if removal fails
  }
});

// Starts the server on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// const express = require("express");
// const app = express();
// const PORT = 3000;
// // Middleware to parse JSON bodies
// app.use(express.json());
// let teaPreferences = [];
// // input validation helper
// const isValidTeaPreference = (sugar, milk) => {
//   return Number.isInteger(sugar) && sugar >= 0 && typeof milk === "boolean";
// };
// // API endpoint to add a new person with tea preferences
// app.post("/api/addPerson", (req, res) => {
//   const { name, sugar, milk } = req.body;
//   if (!name || !isValidTeaPreference(sugar, milk)) {
//     return res.status(400).json({
//       error:
//         "Invalid input. Name must be provided, sugar must be a non-negative integer, and milk must be boolean.",
//     });
//   }
//   const person = {
//     id: Date.now().toString(),
//     name: name.trim(),
//     sugar,
//     milk,
//   };
//   teaPreferences.push(person);
//   res.status(201).json(person);
// });
// // API endpoint to get the list of tea preferences
// app.get("/api/teaPreference", (req, res) => {
//   res.json(teaPreferences);
// });
// // API endpoint to remove a specific person by ID
// app.delete("/api/removePerson/:id", (req, res) => {
//   const { id } = req.params;
//   const initialLength = teaPreferences.length;
//   teaPreferences = teaPreferences.filter((person) => person.id !== id);
//   if (teaPreferences.length === initialLength) {
//     return res.status(404).json({ error: "Person not found" });
//   }
//   res.json({ message: "Person removed successfully" });
// });
// // API endpoint to clear all tea preferences
// app.delete("/api/removeAll", (req, res) => {
//   teaPreferences = [];
//   res.json({ message: "All tea preferences cleared" });
// });
// // API endpoint to spin the roulette and select a random tea maker
// app.get("/api/spin", (req, res) => {
//   if (teaPreferences.length === 0) {
//     return res.status(400).json({ error: "No people available to spin." });
//   }
//   const randomIndex = Math.floor(Math.random() * teaPreferences.length);
//   const selectedPerson = teaPreferences[randomIndex];
//   res.json(selectedPerson);
// });
// // API endpoint to retrieve the tea maker's details
// app.get("/api/teaMaker", (req, res) => {
//   if (teaPreferences.length === 0) {
//     return res.status(404).json({ error: "No current tea maker found." });
//   }
//   const randomIndex = Math.floor(Math.random() * teaPreferences.length);
//   const currentTeaMaker = teaPreferences[randomIndex];
//   res.json({
//     name: currentTeaMaker.name,
//     preferences: `${currentTeaMaker.sugar} sugar(s), ${
//       currentTeaMaker.milk ? "with milk" : "without milk"
//     }`,
//   });
// });
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
