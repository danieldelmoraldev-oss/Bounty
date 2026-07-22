export {};

// Punto de extensión documentado por Express: Request<> (en
// express-serve-static-core) hace `extends Express.Request`, así que las
// propiedades personalizadas se añaden aquí, no en el genérico directamente.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
