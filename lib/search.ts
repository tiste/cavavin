import { Wine } from "@/domain/wine";
import { Search } from "@/domain/search";

export function isStructureMatch(
  filter: null | boolean,
  structure?: number | null,
) {
  if (filter === null) return true;
  if (structure === null || structure === undefined) return false;
  if (structure < 2.5 && filter === true) return true;
  if (structure >= 2.5 && filter === false) return true;
  return false;
}

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function filterWines(wine: Wine, filters: Search) {
  if (filters.search) {
    const searchNorm = normalize(filters.search);
    const inFields =
      (wine.name && normalize(wine.name).includes(searchNorm)) ||
      (wine.description && normalize(wine.description).includes(searchNorm)) ||
      (wine.region && normalize(wine.region).includes(searchNorm)) ||
      (wine.winery && normalize(wine.winery).includes(searchNorm));
    if (!inFields) return false;
  }

  if (filters.color) {
    if (!wine.color || normalize(wine.color) !== normalize(filters.color)) {
      return false;
    }
  }

  if (filters.food) {
    if (
      !wine.foods ||
      !wine.foods.some((food) => normalize(food) === normalize(filters.food))
    ) {
      return false;
    }
  }

  if (filters.grape) {
    if (
      !wine.grapes ||
      !wine.grapes.some(
        (grape) => normalize(grape) === normalize(filters.grape),
      )
    ) {
      return false;
    }
  }

  if (filters.taste) {
    if (
      !wine.tastes ||
      !wine.tastes.some(
        (taste) => normalize(taste) === normalize(filters.taste),
      )
    ) {
      return false;
    }
  }

  const structureKeys = [
    "sweetness",
    "tannin",
    "acidity",
    "fizziness",
    "intensity",
  ] as const;
  for (const key of structureKeys) {
    const filterValue = filters[key];
    if (filterValue !== null) {
      const wineValue = wine.structure?.[key];
      if (!isStructureMatch(filterValue, wineValue)) {
        return false;
      }
    }
  }

  return true;
}
