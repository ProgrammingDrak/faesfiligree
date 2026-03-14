import { SquareClient, SquareEnvironment } from "square";

function getSquareClient(): SquareClient | null {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) return null;

  return new SquareClient({
    token: accessToken,
    environment:
      process.env.NODE_ENV === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

export const squareClient = getSquareClient();

export function isSquareConfigured(): boolean {
  return !!process.env.SQUARE_ACCESS_TOKEN;
}
