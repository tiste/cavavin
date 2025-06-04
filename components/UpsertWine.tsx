"use client";
import { useState } from "react";
import { Wine } from "@/domain/wine";

export function UpsertWine({
  wine,
  onSubmit,
}: {
  wine?: Wine;
  onSubmit?: () => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Wine>>(wine || {});
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(
    name: string,
    value: string | number | string[],
    isArray = false,
  ) {
    if (isArray && typeof value === "string") {
      const arrayValue = value.split(",").map((item) => item.trim());
      setForm((f) => ({ ...f, [name]: arrayValue }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsLoading(true);
    const response = await fetch(`/api/wines${form.id ? "/" + form.id : ""}`, {
      method: form.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      if (onSubmit) {
        onSubmit().then(() => {
          if (!form.id) {
            setForm({});
          }
          setShowMoreFields(false);
          setIsLoading(false);
        });
      }
    }
  }

  async function refreshWines() {
    setIsLoading(true);
    const response = await fetch("/api/wines/refresh", {
      method: "POST",
    });
    if (response.ok) {
      if (onSubmit) {
        onSubmit();
        setIsLoading(false);
      }
    }
  }

  return (
    <form>
      <input type="hidden" name="id" value={form.id || ""} />
      <input
        type="hidden"
        name="createdAt"
        value={form.createdAt || new Date().toISOString()}
      />

      <div className="field">
        <label className="label">Lien</label>
        <div className="control">
          <input
            className="input"
            name="url"
            value={form.url || ""}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
        </div>
      </div>

      {showMoreFields && (
        <>
          <div className="field">
            <label className="label">Quantité</label>
            <div className="control">
              <input
                className="input"
                type="number"
                name="quantity"
                value={form.quantity || ""}
                onChange={(e) =>
                  handleChange(e.target.name, Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Nom</label>
            <div className="control">
              <input
                className="input"
                name="name"
                value={form.name || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
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
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Région</label>
            <div className="control">
              <input
                className="input"
                name="region"
                value={form.region || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Millésime</label>
            <div className="control">
              <input
                className="input"
                type="number"
                name="year"
                value={form.year || ""}
                onChange={(e) =>
                  handleChange(e.target.name, Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Prix (€)</label>
            <div className="control">
              <input
                className="input"
                type="number"
                step="0.01"
                name="price"
                value={form.price || ""}
                onChange={(e) =>
                  handleChange(e.target.name, Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Image</label>
            <div className="control">
              <input
                className="input"
                name="imageUrl"
                value={form.imageUrl || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Note</label>
            <div className="control">
              <input
                className="input"
                type="number"
                name="rating"
                value={form.rating || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Appellation</label>
            <div className="control">
              <input
                className="input"
                name="winery"
                value={form.winery || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Cépages</label>
            <div className="control">
              <input
                className="input"
                name="grapes"
                value={form.grapes?.join(", ") || ""}
                onChange={(e) =>
                  handleChange(e.target.name, e.target.value, true)
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Couleur</label>
            <div className="control">
              <input
                className="input"
                name="color"
                value={form.color || ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Goûts</label>
            <div className="control">
              <input
                className="input"
                name="tastes"
                value={form.tastes?.join(", ") || ""}
                onChange={(e) =>
                  handleChange(e.target.name, e.target.value, true)
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Plats</label>
            <div className="control">
              <input
                className="input"
                name="foods"
                value={form.foods?.join(", ") || ""}
                onChange={(e) =>
                  handleChange(e.target.name, e.target.value, true)
                }
              />
            </div>
          </div>
        </>
      )}

      <div className="field">
        <div className="control">
          <button
            type="button"
            className="button is-link is-outlined"
            onClick={() => setShowMoreFields(!showMoreFields)}
          >
            {showMoreFields ? "Moins de champs" : "Plus de champs"}
          </button>
        </div>
      </div>

      <div className="field">
        <div className="control">
          <button
            className={"button is-primary" + (isLoading ? " is-loading" : "")}
            onClick={handleSubmit}
          >
            {form.id ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </div>

      {!form.id && (
        <div className="field">
          <div className="control">
            <button
              type="button"
              className={
                "button is-secondary" + (isLoading ? " is-loading" : "")
              }
              onClick={refreshWines}
            >
              Rafraîchir les vins
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
