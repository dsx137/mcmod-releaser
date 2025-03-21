import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as nable from "@dsx137/nable";
import * as defs from "./defs";
import * as net from "./net";

export default nable.lazy({
  account: () =>
    (process.env.MCMOD_ACCOUNT ?? "").nLet((it) => {
      let username: string, password: string;
      try {
        [username, password] = nable.parsePair(it);
      } catch (e) {
        throw new Error("Invalid account");
      }
      return { username, password } as defs.Account;
    }),
  projectId: () => core.getInput("project_id"),
  gameVersions: async () => {
    const minecraftVersions = await net.getMcVersions();
    return core
      .getInput("game_versions")
      .nLet((it) => nable.parseList(it))
      .map((game_version) => {
        if (game_version.split(":").length === 1) {
          const index = minecraftVersions.indexOf(game_version);
          if (index === -1) throw Error(`Invalid minecraft version: ${game_version}`);
          return [game_version];
        } else {
          const [start_game_version, end_game_version] = nable.parsePair(game_version);
          const start_index: number = minecraftVersions.indexOf(start_game_version);
          const end_index: number = minecraftVersions.indexOf(end_game_version);
          if (start_index === -1) throw Error(`Invalid minecraft start version: ${start_game_version}`);
          if (end_index === -1) throw Error(`Invalid minecraft end version: ${end_game_version}`);
          if (start_index > end_index) throw Error(`Start version is greater than end version: ${game_version}`);
          return minecraftVersions.slice(start_index, end_index + 1);
        }
      })
      .flat();
  },
  platforms: () =>
    core
      .getInput("platforms")
      .nLet((it) => nable.parseList(it))
      .map((it) => defs.validate(defs.PLATFORMS, it)),
  loaders: () =>
    core
      .getInput("loaders")
      .nLet((it) => nable.parseList(it))
      .map((it) => defs.validate(defs.LOADERS, it)),
  tags: () =>
    core
      .getInput("tags")
      .nLet((it) => nable.parseList(it))
      .map((it) => defs.validate(defs.TAGS, it)),
  file: () => core.getInput("file"),
  upload_mode: () => core.getInput("upload_mode").nLet((it) => defs.validate(defs.UPLOAD_MODES, it)) as defs.UploadMode,
});
