"use client";

import { UpsertWine } from "@/components/UpsertWine";
import { Wine } from "@/domain/wine";
import { useEffect, useState } from "react";

export default function Home() {
  const [wines, setWines] = useState<Array<Wine>>([]);

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

      <div className="columns is-multiline">
        <div className="column is-4">
          <div className="box">
            <UpsertWine onSubmit={fetchWines} />
          </div>
        </div>

        {wines.map((wine) => (
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
