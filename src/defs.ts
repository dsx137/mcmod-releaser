export enum PLATFORMS {
  "java" = 1,
  "bedrock" = 2,
}

export enum LOADERS {
  "forge" = 1,
  "fabric" = 2,
  "rift" = 3,
  "liteloader" = 4,
  "datapack" = 5,
  "commandblock" = 6,
  "overwrite" = 7,
  "actionpack" = 8,
  "sandbox" = 9,
  "other" = 10,
  "quilt" = 11,
  "resourcepack" = 12,
  "neoforge" = 13,
}

export enum TAGS {
  "snapshot",
  "beta",
  "dev",
  "lite",
  "client",
  "server",
}

export type Platform = keyof typeof PLATFORMS;
export type Loader = keyof typeof LOADERS;
export type Tag = keyof typeof TAGS;

export enum UPLOAD_MODES {
  // "unique",
  "replace",
}

export type UploadMode = keyof typeof UPLOAD_MODES;
export const STATES = {
  0: "success",
  101: "unauthorized",
  logreg_username_empty: "Username cannot be empty",
};

export function validate<T extends object>(def: T, it: string): keyof T {
  if (!(it in def)) {
    throw Error(`Invalid value: ${it}, expected one of ${Object.keys(def).join(", ")}`);
  }
  return it as keyof T;
}

export type Account = {
  username: string;
  password: string;
};

export type State = {
  state: keyof typeof STATES;
};
