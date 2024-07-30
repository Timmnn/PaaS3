import { InteractiveCommand, InteractiveOption } from "interactive-commander";

export default function createProjectCommand(program: InteractiveCommand): void {
   program
      .command("create-project")
      .description("X")
      .addOption(
         new InteractiveOption("-n, --name <name>", "project name")
            .default("my-project")
            .makeOptionMandatory()
      )
      .addOption(
         new InteractiveOption("-s, --source <source>", "project source")
            .default("public-git")
            .makeOptionMandatory()
            .choices(["public-git", "dockerfile", "docker-compose"])
      )
      .addOption(
         new InteractiveOption("-sv, --source-value <source-value>", "source value")
            .default("https://github.com/Timmnn/DockerComposeExample")
            .makeOptionMandatory()
      )
      .addOption(
         new InteractiveOption("-d, --domain <domain>", "domain")
            .default("proj.tn0.me")
            .makeOptionMandatory()
      )
      .addOption(
         new InteractiveOption("-p, --port <port>", "port").default("80").makeOptionMandatory()
      )
      .addOption(
         new InteractiveOption("-desc, --description <description>", "description")
            .default("A project")
            .makeOptionMandatory()
      )

      .addOption(
         new InteractiveOption("-hc, --healthcheck-url <healthcheck-url>", "healthcheck url")
            .default("/health")
            .makeOptionMandatory()
      )

      .addOption(
         new InteractiveOption("-bc, --build-command <build-command>", "build command")
            .default("docker compose up -d")
            .makeOptionMandatory()
      )

      .addOption(
         new InteractiveOption("-e, --env-variables <env-variables>", "env variables")
            .default("KEY=VALUE;KEY2=VALUE2")
            .makeOptionMandatory()
      )

      .action(async (args, command) => {
         console.log(args);

         let git_repo_url, dockerfile_content, docker_compose_config;

         switch (args.source) {
            case "public-git":
               git_repo_url = args.sourceValue;
               break;
            case "dockerfile":
               dockerfile_content = args.sourceValue;
               break;
            case "docker-compose":
               docker_compose_config = args.sourceValue;
               break;
            default:
               throw new Error("Invalid source");
         }

         const env_variables = args.env_variables
            ? args.env_variables.split(";").map((env: string) => ({
                 key: env.split("=")[0],
                 value: env.split("=")[1],
              }))
            : [];

         const response = await trpc.createProject.mutate({
            name: args.name,
            project_source: args.source,
            git_repo_url,
            dockerfile_content,
            docker_compose_config,
            domain: args.domain,
            exposed_port: args.port,
            description: args.description,
            healthcheck_url: args.healthcheckUrl,
            build_command: args.buildCommand,
            env_variables,
         });

         console.log(response);
      });
}
