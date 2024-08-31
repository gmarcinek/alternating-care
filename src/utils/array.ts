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

export function sortBy<T>(array: T[], key: keyof T): T[] {
  return [...array].sort((a, b) => {
    if (a[key] > b[key]) return 1;
    if (a[key] < b[key]) return -1;
    return 0;
  });
}

export function toTransposeArray<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}
