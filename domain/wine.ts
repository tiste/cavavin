export interface Wine {
  id: string;
  url: string;
  quantity: number;
  name?: string | null;
  description?: string | null;
  region?: string | null;
  year?: number | null;
  price?: number | null;
  imageUrl?: string | null;
  rating?: number | null;
  winery?: string | null;
  grapes: string[];
  color?: string | null;
  tastes: string[];
  foods: string[];
  createdAt: string;
}
