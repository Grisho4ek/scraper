export const prepareString = (str: string) => {
  let preparedString = str.toLowerCase().trim();
  return preparedString[0].toUpperCase() + preparedString.slice(1);
};
