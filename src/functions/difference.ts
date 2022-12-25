export function checkDifference(
  oldString: string,
  newString: string
): {
  oldString: string;
  newString: string;
  differences: Array<{ oldChar: string; newChar: string; index: number }>;
} {
  const differences: Array<{
    oldChar: string;
    newChar: string;
    index: number;
  }> = [];

  for (let i = 0; i < oldString.length; i++) {
    if (oldString[i] !== newString[i]) {
      differences.push({
        oldChar: oldString[i],
        newChar: newString[i],
        index: i,
      });
    }
  }

  return { oldString, newString, differences };
}
