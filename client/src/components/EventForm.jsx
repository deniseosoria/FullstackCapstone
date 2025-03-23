import React, { useState, useEffect } from "react";

const EventForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    event_type: "",
    address: "",
    price: "",
    capacity: "",
    date: "",
    start_time: "",
    end_time: "",
    picture: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const formattedData = {
        ...initialData,
        date: initialData.date ? initialData.date.slice(0, 10) : "",
        start_time: initialData.start_time || "",
        end_time: initialData.end_time || "",
        picture: null, // We only allow new upload, not reusing file directly
      };

      setFormData(formattedData);

      if (initialData.picture) {
        setPreviewImage(`http://localhost:3001/uploads/${initialData.picture}`);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "picture" && files.length > 0) {
      setFormData((prev) => ({ ...prev, picture: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <label>
        Event Name:
        <input
          type="text"
          name="event_name"
          value={formData.event_name}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Category:
        <select name="event_type" value={formData.event_type} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="Music">Music</option>
          <option value="Art">Art</option>
          <option value="Tech">Tech</option>
          <option value="Food">Food</option>
          <option value="Sports">Sports</option>
        </select>
      </label>

      <label>
        Address:
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Price ($):
        <input
          type="number"
          name="price"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
        />
      </label>

      <label>
        Capacity:
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Date:
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Start Time:
        <input
          type="time"
          name="start_time"
          value={formData.start_time}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        End Time:
        <input
          type="time"
          name="end_time"
          value={formData.end_time}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Upload Image:
        <input type="file" name="picture" accept="image/*" onChange={handleChange} />
      </label>

      {previewImage && (
        <div style={{ marginTop: "1rem" }}>
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: "200px", height: "auto", borderRadius: "8px" }}
          />
        </div>
      )}

      <button type="submit" style={{ marginTop: "1rem" }}>Save Event</button>
    </form>
  );
};

export default EventForm;

