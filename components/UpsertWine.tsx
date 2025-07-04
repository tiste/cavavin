"use client";
import { useMemo, useState } from "react";
import { Wine } from "@/domain/wine";
import { debounce } from "lodash";

export function UpsertWine({
  wine,
  onSubmit,
}: {
  wine?: Wine;
  onSubmit?: () => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Wine>>(wine || {});
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [displayModal, setDisplayModal] = useState(false);

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

  async function fetchApogee(wine: Partial<Wine>) {
    if (!wine || !wine.name || !wine.winery || !wine.year) {
      return;
    }

    setIsAILoading(true);
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wine),
    });

    if (response.ok) {
      const data = await response.json();
      setForm((f) => ({ ...f, apogee: data.answer }));
    } else {
      console.error("Failed to fetch apogee");
    }
    setIsAILoading(false);
  }

  async function handleSubmit(
    wine: Partial<Wine>,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    const response = await fetch(`/api/wines${wine.id ? "/" + wine.id : ""}`, {
      method: wine.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wine),
    });

    if (response.ok) {
      if (onSubmit) {
        onSubmit().then(() => {
          if (!wine.id) {
            setForm({});
          }
          setDisplayModal(false);
        });
      }
    } else {
      console.error("Failed to delete wine");
    }
    setIsLoading(false);
  }

  async function deleteWine(id: string) {
    setIsLoading(true);
    const response = await fetch(`/api/wines/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      if (onSubmit) {
        onSubmit().then(() => {
          setForm({});
          setDisplayModal(false);
        });
      }
    } else {
      console.error("Failed to delete wine");
    }
    setIsLoading(false);
  }

  async function refreshWines() {
    if (
      !confirm(
        "Cela va rafraîchir les vins avec les données de Vivino. Êtes-vous sûr ?",
      )
    ) {
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/wines/refresh", {
      method: "POST",
    });
    if (response.ok) {
      if (onSubmit) {
        onSubmit();
      }
    } else {
      console.error("Failed to delete wine");
    }
    setIsLoading(false);
  }

  const debouncedHandleQuantityChange = useMemo(
    () =>
      debounce(async (quantity: number, form: Partial<Wine>) => {
        await handleSubmit({
          ...form,
          quantity: quantity,
        });
      }, 1000),
    [],
  );

  function handleQuantityChange(quantity: number) {
    handleChange("quantity", quantity);

    debouncedHandleQuantityChange(quantity, { ...form, quantity });
  }

  return displayModal ? (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-card">
        <section className="modal-card-body">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label className="label">Lien</label>
              <div className="control">
                <input
                  autoFocus={!form.id}
                  className="input"
                  name="url"
                  value={form.url || ""}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                />
              </div>
            </div>

            {form.id && (
              <>
                <div className="field">
                  <label className="label">Quantité</label>
                  <div className="control">
                    <input
                      className="input"
                      type="number"
                      step="1"
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
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="field is-grouped">
                  <div className="control is-expanded">
                    <label className="label">Millésime</label>
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

                  <div className="control">
                    <label className="label">Apogée</label>

                    <div className="field has-addons">
                      <div className="control">
                        <input
                          className="input"
                          type="number"
                          name="apogee"
                          value={form.apogee || ""}
                          onChange={(e) =>
                            handleChange(e.target.name, Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="control">
                        <button
                          className={
                            "button " + (isAILoading ? " is-loading" : "")
                          }
                          onClick={() => fetchApogee(form)}
                        >
                          Apogée AI
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Description</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      name="description"
                      value={form.description || ""}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
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
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="field is-grouped">
                  <div className="control is-expanded">
                    <label className="label">Prix (€)</label>
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
                  <div className="control is-expanded">
                    <label className="label">Prix estimé (€)</label>
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      name="estimatedPrice"
                      value={form.estimatedPrice || ""}
                      onChange={(e) =>
                        handleChange(e.target.name, Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Emplacement</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="location"
                      value={form.location || ""}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
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
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
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
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Couleur</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        name="color"
                        value={form.color || ""}
                        onChange={(e) =>
                          handleChange(e.target.name, e.target.value)
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="Champagne">Champagne</option>
                        <option value="Rosé">Rosé</option>
                        <option value="Rouge">Rouge</option>
                        <option value="Blanc">Blanc</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Image</label>
                  <div className="control">
                    <input
                      className="input"
                      name="imageUrl"
                      value={form.imageUrl || ""}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
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
          </form>
        </section>

        <footer className="modal-card-foot is-flex is-justify-content-space-between">
          <div className="buttons mb-0">
            <button
              className={"button is-primary" + (isLoading ? " is-loading" : "")}
              onClick={(e) => handleSubmit(form, e)}
            >
              {form.id ? "Mettre à jour" : "Créer"}
            </button>

            <button
              className="button"
              onClick={() => {
                setDisplayModal(false);
                setForm(wine || {});
              }}
            >
              Annuler
            </button>
          </div>

          {form.id && (
            <button
              className="button is-danger is-outlined"
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce vin ?")) {
                  deleteWine(form.id!);
                }
              }}
            >
              Supprimer
            </button>
          )}
        </footer>
      </div>

      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={() => {
          setDisplayModal(false);
          setForm(wine || {});
        }}
      ></button>
    </div>
  ) : (
    <div className="field is-grouped is-grouped-multiline">
      {form.id && (
        <div className="field has-addons">
          <p className="control">
            <button
              className="button"
              onClick={() => handleQuantityChange(form.quantity! - 1)}
              disabled={isLoading || form.quantity! <= 0}
              type="button"
            >
              -
            </button>
          </p>
          <p className="control">
            <input
              className="input"
              type="number"
              value={form.quantity}
              min={0}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              disabled={isLoading}
              style={{ width: 60, textAlign: "center" }}
            />
          </p>
          <p className="control">
            <button
              className="button"
              onClick={() => handleQuantityChange(form.quantity! + 1)}
              disabled={isLoading}
              type="button"
            >
              +
            </button>
          </p>
        </div>
      )}

      <div className="control">
        <button
          className="button is-primary"
          onClick={() => setDisplayModal(true)}
        >
          {wine ? "Modifier" : "Ajouter"}
        </button>
      </div>

      {!form.id && (
        <div className="control">
          <button
            type="button"
            className={"button is-secondary" + (isLoading ? " is-loading" : "")}
            onClick={refreshWines}
          >
            Rafraîchir les vins
          </button>
        </div>
      )}
    </div>
  );
}
