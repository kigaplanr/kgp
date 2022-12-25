type Difference = {
  oldChar: string;
  newChar: string;
  index: number;
};

export function difference(
  oldString: string,
  newString: string
): Array<Difference> {
  const differences: Array<Difference> = [];

  for (let i = 0; i < oldString.length; i++) {
    if (oldString[i] !== newString[i]) {
      differences.push({
        oldChar: oldString[i],
        newChar: newString[i],
        index: i,
      });
    }
  }

  return differences;
}
