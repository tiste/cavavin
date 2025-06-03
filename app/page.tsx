import { WineRepository } from "@/lib/repositories/wine.repository";
import { UpsertWine } from "@/components/UpsertWine";

export default async function Home() {
  const repository = await WineRepository.getInstance();
  const wines = await repository.getAll();

  return (
    <div>
      <h1>Cavavin</h1>

      <p>
        Bienvenue dans notre cave à vin ! Découvrez notre sélection de vins
        soigneusement choisis pour accompagner vos repas et célébrations.
      </p>

      <UpsertWine />

      <div className="columns is-multiline">
        {wines.map((wine) => (
          <div key={wine.id} className="column is-4">
            <div className="card">
              <div className="card-content">
                <h2 className="title is-4">{wine.name}</h2>
                <p>{wine.description}</p>
                <p>
                  <strong>Prix : </strong>€{wine.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
