import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import createProjectCommand from "./commands/createproject";

yargs(hideBin(process.argv))
   .demandCommand(1, "must provide a valid command")
   .help("h")
   .strict()
   .alias("h", "help");

createProjectCommand(yargs);
