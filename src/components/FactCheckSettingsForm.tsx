import { useState } from "react";

export default function FactCheckSettingsForm() {
  const [settings, setSettings] = useState({
    claim: "",
    source: "",
    category: "General",
    confidence: "Medium",
    notes: "",
  });

  const handleChange = (event) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Fact-check settings:", settings);
    alert("Fact-check assessment saved!");
  };

  return (
    <div className="fact-check-settings">
      <h2>Fact-Check Assessment</h2>
      <p>Enter the information for the claim you want to assess.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Claim</label>
          <textarea
            name="claim"
            value={settings.claim}
            onChange={handleChange}
            placeholder="Enter the claim"
          />
        </div>

        <div className="form-group">
          <label>Source</label>
          <input
            type="text"
            name="source"
            value={settings.source}
            onChange={handleChange}
            placeholder="Enter the source"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={settings.category}
            onChange={handleChange}
          >
            <option value="General">General</option>
            <option value="Politics">Politics</option>
            <option value="Health">Health</option>
            <option value="Science">Science</option>
            <option value="Business">Business</option>
            <option value="Technology">Technology</option>
          </select>
        </div>

        <div className="form-group">
          <label>Confidence</label>
          <select
            name="confidence"
            value={settings.confidence}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={settings.notes}
            onChange={handleChange}
            placeholder="Add notes about the assessment"
          />
        </div>

        <button type="submit">Save Assessment</button>
      </form>
    </div>
  );
}