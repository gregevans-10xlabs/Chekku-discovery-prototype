const WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

export function isValidAbn(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  const nums = digits.split("").map((d) => parseInt(d, 10));
  nums[0] -= 1;
  const sum = nums.reduce((acc, n, i) => acc + n * WEIGHTS[i], 0);
  return sum % 89 === 0;
}

export function formatAbn(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
}
