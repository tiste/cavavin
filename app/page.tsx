"use client";

import { UpsertWine } from "@/components/UpsertWine";
import { Wine } from "@/domain/wine";
import { useEffect, useState } from "react";
import placeholderImage from "@/public/placeholder.png";
import { Progress } from "@/components/Progress";
import { Search } from "@/domain/search";
import { filterWines } from "@/lib/search";

const initialState: Search = {
  color: "",
  food: "",
  grape: "",
  taste: "",
  sweetness: null,
  tannin: null,
  acidity: null,
  fizziness: null,
  intensity: null,
  search: "",
};

export default function Home() {
  const [wines, setWines] = useState<Array<Wine>>([]);
  const [filters, setFilters] = useState(initialState);
  const [filteredWines, setFilteredWines] = useState<Array<Wine>>([]);

  useEffect(() => {
    fetchWines();
  }, []);

  useEffect(() => {
    const filtered = wines.filter((w) => filterWines(w, filters));
    setFilteredWines(filtered);
  }, [wines, filters]);

  const fetchWines = async () => {
    try {
      const response = await fetch("/api/wines");
      if (!response.ok) {
        throw new Error("Failed to fetch wines");
      }
      const data = await response.json();
      setWines(data);
    } catch (error) {
      console.error("Error fetching wines:", error);
    }
  };

  const handleFilterChange = (
    key: keyof Search,
    value: string | null | boolean,
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: filters[key] === value ? initialState[key] : value,
    }));
  };

  return (
    <div>
      <section className="hero">
        <div className="hero-body has-text-centered">
          <nav className="level">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Quantité</p>
                <p className="title">
                  {wines.reduce((acc, wine) => acc + (wine.quantity || 0), 0)}
                </p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Prix total</p>
                <p className="title">
                  {wines
                    .reduce(
                      (acc, wine) =>
                        acc + (wine.price || 0) * (wine.quantity || 0),
                      0,
                    )
                    .toFixed(2)}{" "}
                  €
                </p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Dernière mise à jour</p>
                <p className="title">
                  {wines.length > 0
                    ? new Date(
                        Math.max(
                          ...wines.map((wine) =>
                            new Date(wine.createdAt).getTime(),
                          ),
                        ),
                      ).toLocaleDateString("fr-FR")
                    : "Aucune"}
                </p>
              </div>
            </div>
          </nav>
        </div>
      </section>

      <div className="field has-addons">
        <div className="control is-expanded">
          <input
            className="input"
            type="text"
            placeholder="Rechercher un vin..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="control">
          <button
            className="button"
            onClick={() => {
              setFilters(initialState);
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="tags">
        {Array.from(
          new Set(
            wines.map((wine) => wine.color?.toLowerCase()).filter(Boolean),
          ),
        ).map(
          (color) =>
            color && (
              <span
                key={color}
                className={
                  "tag is-clickable is-primary" +
                  (color === filters.color ? " is-bordered" : "")
                }
                onClick={() => handleFilterChange("color", color)}
              >
                {color}
              </span>
            ),
        )}

        {Array.from(
          new Set(
            wines
              .flatMap((wine) => wine.foods || [])
              .map((food) => food.toLowerCase()),
          ),
        ).map((food) => (
          <span
            key={food}
            className={
              "tag is-clickable" + (food === filters.food ? " is-bordered" : "")
            }
            onClick={() => handleFilterChange("food", food)}
          >
            {food}
          </span>
        ))}

        {Array.from(
          new Set(
            wines
              .flatMap((wine) => wine.grapes || [])
              .map((grape) => grape.toLowerCase()),
          ),
        ).map((grape) => (
          <span
            key={grape}
            className={
              "tag is-clickable is-dark" +
              (grape === filters.grape ? " is-bordered" : "")
            }
            onClick={() => handleFilterChange("grape", grape)}
          >
            {grape}
          </span>
        ))}
      </div>

      <div className="columns is-multiline is-mobile">
        <div className="column">
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.intensity === true}
                onChange={() => handleFilterChange("intensity", true)}
              />
              <small> Léger</small>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.intensity === false}
                onChange={() => handleFilterChange("intensity", false)}
              />
              <small> Puissant</small>
            </label>
          </div>
        </div>

        <div className="column">
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.tannin === true}
                onChange={() => handleFilterChange("tannin", true)}
              />
              <small> Souple</small>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.tannin === false}
                onChange={() => handleFilterChange("tannin", false)}
              />
              <small> Tannique</small>
            </label>
          </div>
        </div>

        <div className="column">
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.sweetness === true}
                onChange={() => handleFilterChange("sweetness", true)}
              />
              <small> Sec</small>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.sweetness === false}
                onChange={() => handleFilterChange("sweetness", false)}
              />
              <small> Moelleux</small>
            </label>
          </div>
        </div>

        <div className="column">
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.acidity === true}
                onChange={() => handleFilterChange("acidity", true)}
              />
              <small> Doux</small>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.acidity === false}
                onChange={() => handleFilterChange("acidity", false)}
              />
              <small> Acide</small>
            </label>
          </div>
        </div>

        <div className="column">
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.fizziness === true}
                onChange={() => handleFilterChange("fizziness", true)}
              />
              <small> Plat</small>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.fizziness === false}
                onChange={() => handleFilterChange("fizziness", false)}
              />
              <small> Pétillant</small>
            </label>
          </div>
        </div>
      </div>

      <div className="columns is-multiline">
        {filteredWines.map((wine) => (
          <div key={wine.id} className="column is-4">
            <div className="card">
              <div className="card-content">
                <h2 className="title is-4">
                  <a href={wine.url} target="_blank" rel="noopener noreferrer">
                    {wine.name} ({wine.quantity})
                  </a>
                </h2>

                <div className="columns is-mobile">
                  <div className="column is-3">
                    <img
                      src={wine.imageUrl || placeholderImage.src}
                      alt={wine.name || ""}
                    />
                  </div>

                  <div className="column is-9">
                    <div className="mb-3">
                      <p>
                        <strong>Nom : </strong>
                        {wine.name}
                      </p>
                      {wine.description && (
                        <p>
                          <strong>Description : </strong>
                          {wine.description}
                        </p>
                      )}
                      {wine.rating && (
                        <p>
                          <strong>Note : </strong>
                          {`${wine.rating}/5`}
                        </p>
                      )}
                      <p>
                        <strong>Prix : </strong>
                        {wine.price ? `${wine.price} €` : "N/A"}
                      </p>
                      <p>
                        <strong>Appellation : </strong>
                        {wine.winery}
                      </p>
                      <p>
                        <strong>Millésime : </strong>
                        {wine.year}
                      </p>
                      <p>
                        <strong>Région : </strong>
                        {wine.region}
                      </p>
                      <p>
                        <strong>Couleur : </strong>
                        {wine.color || "Inconnu"}
                      </p>
                      {wine.grapes.length > 0 && (
                        <p>
                          <strong>Cépages : </strong>
                          {wine.grapes.join(", ")}
                        </p>
                      )}
                      {wine.tastes.length > 0 && (
                        <p>
                          <strong>Goûts : </strong>
                          {wine.tastes.join(", ")}
                        </p>
                      )}
                      {wine.foods.length > 0 && (
                        <p>
                          <strong>Accords mets : </strong>
                          {wine.foods.join(", ")}
                        </p>
                      )}

                      <div className="mt-2">
                        <Progress
                          value={wine.structure?.intensity || 0}
                          max={5}
                          leftText="Léger"
                          rightText="Puissant"
                        />
                        <Progress
                          value={wine.structure?.tannin || 0}
                          max={5}
                          leftText="Souple"
                          rightText="Tannique"
                        />
                        <Progress
                          value={wine.structure?.sweetness || 0}
                          max={5}
                          leftText="Sec"
                          rightText="Moelleux"
                        />
                        <Progress
                          value={wine.structure?.acidity || 0}
                          max={5}
                          leftText="Doux"
                          rightText="Acide"
                        />
                        <Progress
                          value={wine.structure?.fizziness || 0}
                          max={5}
                          leftText="Plat"
                          rightText="Pétillant"
                        />
                      </div>
                    </div>

                    <UpsertWine wine={wine} onSubmit={fetchWines} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
