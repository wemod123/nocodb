export const generateUniqueName = async () => {
  const { adjectives, animals, starWars, uniqueNamesGenerator } = await import('unique-names-generator')

  return uniqueNamesGenerator({
    dictionaries: [[starWars], [adjectives, animals]][Math.floor(Math.random() * 2)],
  })
    .toLowerCase()
    .replace(/[ -]/g, '_')
}

export const generateUniqueTitle = <T extends Record<string, any> = Record<string, any>>(
  title: string,
  arr: T[],
  predicate: keyof T,
) => {
  let c = 1
  while (arr.some((item) => item[predicate].includes(`${title}-${c}` as keyof T))) {
    c++
  }

  return `${title}-${c}`
}

export function generateRandomString(length: number = 36) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}