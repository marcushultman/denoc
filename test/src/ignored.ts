export function atob(s: string): string {
  return Buffer.from(s, 'base64').toString();
}

export function btoa(s: string): string {
  return Buffer.from(s).toString('base64');
}
