"use client";

import { UpsertWine } from "@/components/UpsertWine";
import { Wine } from "@/domain/wine";
import { useEffect, useState } from "react";
import { Progress } from "@/components/Progress";
import { Search } from "@/domain/search";
import { filterWines, getTagCounts } from "@/lib/search";
import { countBy, isEmpty, orderBy, toPairs } from "lodash";
import { ShowMoreTags } from "@/components/ShowMoreTags";
import { getPlaceholder } from "@/lib/placeholder";

const initialState: Search = {
  color: "",
  food: "",
  grape: "",
  taste: "",
  location: "",
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
      <section className="hero is-small">
        <div className="hero-body has-text-centered">
          <nav className="level is-mobile">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Quantité</p>
                <p className="title">
                  {filteredWines.reduce(
                    (acc, wine) => acc + (wine.quantity || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Prix total</p>
                <p className="title">
                  {filteredWines
                    .reduce(
                      (acc, wine) =>
                        acc + (wine.price || 0) * (wine.quantity || 0),
                      0,
                    )
                    .toFixed(2)}{" "}
                  €
                </p>
                <p className="title is-size-7">
                  est.{" "}
                  {filteredWines
                    .reduce(
                      (acc, wine) =>
                        acc +
                        (wine.estimatedPrice || wine.price || 0) *
                          (wine.quantity || 0),
                      0,
                    )
                    .toFixed(2)}{" "}
                  €
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
            autoCorrect="off"
            value={filters.search}
            onFocus={(e) => {
              e.target.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
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
        <ShowMoreTags
          tags={orderBy(
            toPairs(getTagCounts(wines, (wine) => wine.location)),
            ([, count]) => count,
            "desc",
          ).map(([location]) => location)}
          selected={filters.location}
          onSelect={(location) => handleFilterChange("location", location)}
          className="is-primary is-light"
        />

        <ShowMoreTags
          tags={orderBy(
            toPairs(getTagCounts(wines, (wine) => wine.color?.toLowerCase())),
            ([, count]) => count,
            "desc",
          ).map(([color]) => color)}
          selected={filters.color}
          onSelect={(color) => handleFilterChange("color", color)}
          className="is-primary"
        />

        <ShowMoreTags
          tags={orderBy(
            toPairs(
              countBy(
                wines
                  .flatMap((wine) => wine.foods || [])
                  .map((food) => food.toLowerCase()),
              ),
            ),
            ([, count]) => count,
            "desc",
          ).map(([food]) => food)}
          selected={filters.food}
          onSelect={(food) => handleFilterChange("food", food)}
        />

        <ShowMoreTags
          tags={orderBy(
            toPairs(
              countBy(
                wines
                  .flatMap((wine) => wine.grapes || [])
                  .map((grape) => grape.toLowerCase()),
              ),
            ),
            ([, count]) => count,
            "desc",
          ).map(([grape]) => grape)}
          selected={filters.grape}
          onSelect={(grape) => handleFilterChange("grape", grape)}
          className="is-dark"
        />
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
              <span> Léger</span>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.intensity === false}
                onChange={() => handleFilterChange("intensity", false)}
              />
              <span> Puissant</span>
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
              <span> Souple</span>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.tannin === false}
                onChange={() => handleFilterChange("tannin", false)}
              />
              <span> Tannique</span>
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
              <span> Sec</span>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.sweetness === false}
                onChange={() => handleFilterChange("sweetness", false)}
              />
              <span> Moelleux</span>
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
              <span> Doux</span>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.acidity === false}
                onChange={() => handleFilterChange("acidity", false)}
              />
              <span> Acide</span>
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
              <span> Plat</span>
            </label>
          </div>
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.fizziness === false}
                onChange={() => handleFilterChange("fizziness", false)}
              />
              <span> Pétillant</span>
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
                    {wine.name} {wine.year} ({wine.quantity})
                  </a>
                </h2>

                <div className="columns is-mobile">
                  <div className="column is-3">
                    <img
                      src={wine.imageUrl || getPlaceholder(wine)}
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
                        <i>
                          {" "}
                          (est.{" "}
                          {wine.estimatedPrice
                            ? `${wine.estimatedPrice} €`
                            : "N/A"}
                          )
                        </i>
                      </p>
                      {!isEmpty(wine.location) && (
                        <p>
                          <strong>Emplacement : </strong>
                          {wine.location}
                        </p>
                      )}
                      {wine.apogee && (
                        <p>
                          <strong>Apogée : </strong>
                          {wine.apogee}
                        </p>
                      )}
                      <p>
                        <strong>Appellation : </strong>
                        {wine.winery}
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

                    <p className="is-size-7 has-text-right">
                      Dernière mise à jour :{" "}
                      {new Date(wine.updatedAt).toLocaleString("fr-FR")}
                    </p>
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
