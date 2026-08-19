export const auth = {};
export const firebaseAdmin = {
  auth: () => ({
    verifyIdToken: async (token: string) => ({
      uid: token,
      email: undefined,
      phone_number: undefined,
      role: "CUSTOMER",
    }),
  }),
  apps: [],
};

