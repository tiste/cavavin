export function isAuthenticated(token: string | null): boolean {
  return token === process.env.API_KEY;
}
