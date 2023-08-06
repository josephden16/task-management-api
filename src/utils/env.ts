export const isDev = () => {
  const currentEnv = process.env.NODE_ENV;
  return currentEnv === "development";
};
