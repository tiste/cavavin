"use client";
import { useState } from "react";
import { Wine } from "@/domain/wine";

export function UpsertWine({ wine }: { wine?: Wine }) {
  const [form, setForm] = useState<Partial<Wine>>(wine || {});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit() {
    const response = await fetch(`/api/wines${form.id ? "/" + form.id : ""}`, {
      method: form.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      setForm({});
      alert("Wine saved successfully!");
    } else {
      alert("Failed to save wine.");
    }
  }

  return (
    <form className="box" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2 className="title is-4">{form.id ? "Edit Wine" : "Add Wine"}</h2>
      <input type="hidden" name="id" value={form.id || ""} />
      <input
        type="hidden"
        name="createdAt"
        value={form.createdAt || new Date().toISOString()}
      />

      <div className="field">
        <label className="label">Name</label>
        <div className="control">
          <input
            className="input"
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Description</label>
        <div className="control">
          <textarea
            className="textarea"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Region</label>
        <div className="control">
          <input
            className="input"
            name="region"
            value={form.region || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Year</label>
        <div className="control">
          <input
            className="input"
            type="number"
            name="year"
            value={form.year || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Price (€)</label>
        <div className="control">
          <input
            className="input"
            type="number"
            step="0.01"
            name="price"
            value={form.price || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Image URL</label>
        <div className="control">
          <input
            className="input"
            name="imageUrl"
            value={form.imageUrl || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">URL</label>
        <div className="control">
          <input
            className="input"
            name="url"
            value={form.url || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Rating</label>
        <div className="control">
          <input
            className="input"
            type="number"
            name="rating"
            value={form.rating || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Appellation</label>
        <div className="control">
          <input
            className="input"
            name="appellation"
            value={form.appellation || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Variety</label>
        <div className="control">
          <input
            className="input"
            name="variety"
            value={form.variety || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Quantity</label>
        <div className="control">
          <input
            className="input"
            type="number"
            name="quantity"
            value={form.quantity || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Color</label>
        <div className="control">
          <input
            className="input"
            name="color"
            value={form.color || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Tastes (comma separated)</label>
        <div className="control">
          <input
            className="input"
            name="tastes"
            value={form.tastes?.join(", ") || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Foods (comma separated)</label>
        <div className="control">
          <input
            className="input"
            name="foods"
            value={form.foods?.join(", ") || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button className="button is-primary" onClick={handleSubmit}>
            {form.id ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
}
