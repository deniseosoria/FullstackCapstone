import { useState, useEffect } from "react";

const EventForm = ({ initialData = {}, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);
  const [previewUrl, setPreviewUrl] = useState(initialData.picture || null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Update preview if a new file is selected
    if (name === "picture" && files && files[0]) {
      setPreviewUrl(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        name="event_name"
        placeholder="Event Name"
        value={formData.event_name || ""}
        onChange={handleChange}
      />
      <input
        name="date"
        type="date"
        value={formData.date || ""}
        onChange={handleChange}
      />
      <input
        name="start_time"
        type="time"
        value={formData.start_time || ""}
        onChange={handleChange}
      />
      <input
        name="end_time"
        type="time"
        value={formData.end_time || ""}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description || ""}
        onChange={handleChange}
      />

      <input
        type="file"
        name="picture"
        accept="image/*"
        onChange={handleChange}
      />

      {/* Show image preview for existing OR newly selected image */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          style={{ maxWidth: "200px", marginTop: "1rem", borderRadius: "10px" }}
        />
      )}

      <button type="submit">Save</button>
    </form>
  );
};

export default EventForm;
