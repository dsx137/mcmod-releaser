import * as core from "@actions/core";
import * as nable from "@dsx137/nable";
import * as defs from "./defs";

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
  gameVersion: () => core.getInput("game_version"),
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
  upload_mode: () => core.getInput("upload_mode").nLet((it) => defs.validate(defs.UPLOAD_MODES, it)),
});
