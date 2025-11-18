import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// IMPORTANT: store your VirusTotal API key here
const VT_API_KEY = "YOUR_VT_API_KEY";

// Route for scanning URL
app.post("/api/scan-url", async (req, res) => {
  const { url } = req.body;

  try {
    // STEP 1: Submit URL to VirusTotal for scanning
    const submit = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: { "x-apikey": VT_API_KEY },
      body: new URLSearchParams({ url }),
    });

    const submitData = await submit.json();
    const scanId = submitData.data.id;

    // STEP 2: Fetch scan report using the scan ID
    const report = await fetch(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
      headers: { "x-apikey": VT_API_KEY }
    });

    const reportData = await report.json();
    res.json(reportData);

  } catch (error) {
    res.status(500).json({ error: "Error scanning URL", details: error });
  }
});

// Run the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
