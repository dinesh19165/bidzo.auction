export function required(value: string) {
  return value && value.trim().length > 0;
}

export function isNumber(value: string) {
  return !Number.isNaN(Number(value.replace(/[₹, ]/g, '')));
}

export default { required, isNumber };
