export function generateSlug(name: string) {
  return name.toLowerCase().replace(/ /g, '-');
}
