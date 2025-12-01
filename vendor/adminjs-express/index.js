/**
 * Lightweight stub for @adminjs/express used for deployments where the official
 * package version is unavailable. If AdminJS integration is required, replace
 * this stub with the real dependency.
 */
export const buildRouter = () => {
  throw new Error('AdminJS Express stub in use: install the real @adminjs/express package for full functionality.');
};

export default { buildRouter };
