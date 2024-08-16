export function splitEvenly<T>(array: T[], chunkSize: number): T[][] {
  const numberOfChunks = Math.floor(array.length / chunkSize);
  const remainder = array.length % chunkSize;

  const result: T[][] = new Array(numberOfChunks + (remainder > 0 ? 1 : 0));

  for (let i = 0; i < numberOfChunks; i++) {
    result[i] = array.slice(i * chunkSize, (i + 1) * chunkSize);
  }

  if (remainder > 0) {
    result[numberOfChunks] = array.slice(numberOfChunks * chunkSize);
  }

  return result;
}
