/**
 * Data that can be parsed. All elements will be automatically
 * casted to strings, which could create issues if the data
 * passed is inconsistent.
 */
type UnformattedData = Array<Array<unknown>>;

/**
 * Format options that can be passed.
 */
type FormatOptions = {
  /**
   * This can be used to provide a list of headers,
   * rather than passing them in as the first row of
   * unformatted text.
   */
  headers?: string[];
  /**
   * The column delimiter character(s), defaults to `|`.
   * This character(s) is automatically padded with spaces
   * on either side automatically.
   */
  columnDelimiter?: string;
  /**
   * The row delimiter character(s), defaults to `-`.
   * Only used between the header, and the rows of data.
   */
  rowDelimiter?: string;
};
/**
 * Formats text into a table object.
 *
 * @param {UnformattedData} data The unformatted data we will display.
 * @param {FormatOptions} options Optional options that can be passed to slightly
 * configure the formatting.
 * @returns {string} The formatted text.
 */
export const formatTextToTable = (
  data: UnformattedData,
  options?: FormatOptions
): string => {
  const rows = data;
  const toStr = (val: unknown) => "" + val;
  const headers = options?.headers || (data[0] || []).map(toStr) || [];
  const hasInferredHeaders = !options?.headers;
  const columnDelimiter = options?.columnDelimiter || "|";
  const rowDelimiter = options?.rowDelimiter || "-";

  const baseColumnWidths = headers.map((header) => toStr(header).length);
  const columnWidths = rows.reduce((acc: number[], row) => {
    row.forEach((column, index) => {
      const currentColumnLength = toStr(column).length;
      if (currentColumnLength > acc[index]) {
        acc[index] = currentColumnLength;
      }
    });
    return acc;
  }, baseColumnWidths) as number[];

  const rowSeperatorStr = columnWidths.length
    ? new Array(
        // adding an extra one for the space seperation applied
        // to each column.
        columnWidths.reduce(
          (acc, num) => acc + num + 2 + columnDelimiter.length
        )
      )
        .fill(rowDelimiter)
        .join("")
    : "";

  const dataStr = rows.map((row: string[]) =>
    row
      .map((column: string, index: number) =>
        toStr(column).padEnd(columnWidths[index], " ")
      )
      .join(` ${columnDelimiter} `)
  );
  const headersStr = headers
    .map((header: string, index: number) =>
      header.padEnd(columnWidths[index as number])
    )
    .join(` ${columnDelimiter} `);

  return [
    headersStr,
    rowSeperatorStr,
    ...(hasInferredHeaders ? dataStr.slice(1) : dataStr),
  ]
    .filter((_) => _)
    .join("\n");
};
