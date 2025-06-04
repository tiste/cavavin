"use client";

import { UpsertWine } from "@/components/UpsertWine";
import { Wine } from "@/domain/wine";
import { useEffect, useState } from "react";
import placeholderImage from "@/public/placeholder.png";
import { Progress } from "@/components/Progress";

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

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filterWines = (wine: Wine) => {
    if (!search) return true;

    const searchNorm = normalize(search);

    return (
      (wine.name && normalize(wine.name).includes(searchNorm)) ||
      (wine.description && normalize(wine.description).includes(searchNorm)) ||
      (wine.region && normalize(wine.region).includes(searchNorm)) ||
      (wine.color && normalize(wine.color).includes(searchNorm)) ||
      (wine.winery && normalize(wine.winery).includes(searchNorm)) ||
      (wine.grapes &&
        wine.grapes.some((grape) => normalize(grape).includes(searchNorm))) ||
      (wine.tastes &&
        wine.tastes.some((taste) => normalize(taste).includes(searchNorm))) ||
      (wine.foods &&
        wine.foods.some((food) => normalize(food).includes(searchNorm)))
    );
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="control">
          <button
            className="button"
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
            wines.map((wine) => wine.color?.toLowerCase()).filter(Boolean),
          ),
        ).map((color) => (
          <span
            key={color}
            className="tag is-clickable is-primary"
            onClick={() => setSearch(color || "")}
          >
            {color}
          </span>
        ))}

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

        {Array.from(
          new Set(
            wines
              .flatMap((wine) => wine.grapes || [])
              .map((grape) => grape.toLowerCase()),
          ),
        ).map((grape) => (
          <span
            key={grape}
            className="tag is-clickable is-dark"
            onClick={() => setSearch(grape)}
          >
            {grape}
          </span>
        ))}
      </div>

      <div className="columns is-multiline">
        {wines.filter(filterWines).map((wine) => (
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
