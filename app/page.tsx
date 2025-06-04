"use client";

import { UpsertWine } from "@/components/UpsertWine";
import { Wine } from "@/domain/wine";
import { useEffect, useState } from "react";

export default function Home() {
  const [wines, setWines] = useState<Array<Wine>>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWines();
  }, []);

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

  const filterWines = (wine: Wine) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    return (
      (wine.name && wine.name.toLowerCase().includes(searchLower)) ||
      (wine.region && wine.region.toLowerCase().includes(searchLower)) ||
      (wine.winery && wine.winery.toLowerCase().includes(searchLower)) ||
      (wine.grapes &&
        wine.grapes.some((grape) =>
          grape.toLowerCase().includes(searchLower),
        )) ||
      (wine.tastes &&
        wine.tastes.some((taste) =>
          taste.toLowerCase().includes(searchLower),
        )) ||
      (wine.foods &&
        wine.foods.some((food) => food.toLowerCase().includes(searchLower)))
    );
  };

  return (
    <div>
      <section className="hero">
        <div className="hero-body has-text-centered">
          <p className="title">Cavavin</p>

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="control">
          <button
            className="button is-light"
            onClick={() => {
              setSearch("");
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="tags">
        {Array.from(
          new Set(
            wines
              .flatMap((wine) => wine.foods || [])
              .map((food) => food.toLowerCase()),
          ),
        ).map((food) => (
          <span
            key={food}
            className="tag is-clickable"
            onClick={() => setSearch(food)}
          >
            {food}
          </span>
        ))}
      </div>
      <div className="tags">
        {Array.from(
          new Set(
            wines
              .flatMap((wine) => wine.grapes || [])
              .map((grape) => grape.toLowerCase()),
          ),
        ).map((grape) => (
          <span
            key={grape}
            className="tag is-clickable"
            onClick={() => setSearch(grape)}
          >
            {grape}
          </span>
        ))}
      </div>

      <div className="columns is-multiline">
        <div className="column is-4">
          <div className="box">
            <UpsertWine onSubmit={fetchWines} />
          </div>
        </div>

        {wines.filter(filterWines).map((wine) => (
          <div key={wine.id} className="column is-4">
            <div className="card">
              <div className="card-content">
                <h2 className="title is-4">
                  {wine.name} ({wine.quantity})
                </h2>

                <div className="columns">
                  {wine.imageUrl !== null && (
                    <div className="column is-3">
                      <img src={wine.imageUrl} alt={wine.name || ""} />
                    </div>
                  )}

                  <div className="column">
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
