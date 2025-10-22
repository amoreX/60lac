export const cleanNumber = (phoneNumber: string): string => {
  return phoneNumber.replace("@c.us", "");
};

export const isValidWhatsAppNumber = (phoneNumber: string): boolean => {
  return phoneNumber.includes("@c.us");
};
