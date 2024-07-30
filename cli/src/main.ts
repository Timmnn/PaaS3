import { InteractiveCommand } from "interactive-commander";
import createProjectCommand from "./commands/create-project";

(async () => {
   const program = new InteractiveCommand();

   program.name("Deplauto CLI").description("Z").version("0.8.0");

   createProjectCommand(program);

   await program
      .interactive("-I, --no-interactive", "disable interactive mode")
      .parseAsync(process.argv);
})();
