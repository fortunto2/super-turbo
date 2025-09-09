export const pushOrReplace = <T>(array: T[], item: T, key: keyof T) => {
  const temp = array.slice();

  const index = temp.findIndex((i) => i[key] === item[key]);

  if (index !== -1) {
    temp[index] = item;
  } else {
    temp.push(item);
  }

  return temp;
};

export const unshiftOrReplace = <T>(array: T[], item: T, key: keyof T) => {
  const temp = array.slice();

  const index = temp.findIndex((i) => i[key] === item[key]);

  if (index !== -1) {
    temp[index] = item;
  } else {
    temp.unshift(item);
  }

  return temp;
};
