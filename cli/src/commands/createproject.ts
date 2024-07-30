import InteractiveOptions from "../lib/InteractiveOptions";
import { trpc } from "../../../frontend/src/lib/tRPCClient";

export default function createProjectCommand(yargs: typeof import("yargs")) {
   yargs.command({
      command: "createproject",
      describe: "Creates a new project",
      builder: yargs => {
         return yargs;
      },
      handler: async args => {
         const options = await new InteractiveOptions([
            {
               type: "input",
               name: "projectName",
               question: "Project name",
               default: "myproject",
               validate: (input: any) => {
                  return input.includes(" ") ? "Project name cannot contain spaces" : "";
               },
            },
            {
               type: "input",
               name: "domain",
               question: "Domain",
               default: "test.tn0.me",
               validate: (input: any) => {
                  return new RegExp("^[a-zA-Z0-9.-]+$").test(input) ? "" : "Invalid domain";
               },
            },
            {
               type: "input",
               name: "exposedPort",
               question: "Exposed port",
               default: 80,
               validate: (input: any) => {
                  return isNaN(parseInt(input)) ? "Invalid port" : "";
               },
            },
            {
               type: "input",
               name: "healthcheckUrl",
               question: "Healthcheck URL",
               default: "/",
            },
            {
               type: "input",
               name: "buildCommand",
               question: "Build command",
               default: "npm run build",
            },
            {
               type: "input",
               name: "description",
               question: "Description",
               default: "Project description",
            },

            {
               type: "input",
               name: "projectSource",
               question: "Project source (public-git, docker-compose, dockerfile)",
               default: "public-git",
               validate: (input: any) => {
                  return ["public-git", "docker-compose", "dockerfile"].includes(input)
                     ? ""
                     : "Invalid project source";
               },
            },
            {
               type: "input",
               name: "sourceValue",
               question: "Source value (git repo url, docker-compose config, dockerfile content)",
               default: "https://github.com/Timmnn/DockerComposeExample",
            },
         ]).run();

         console.log(options);

         if (options.projectSource === "public-git") {
            options.gitRepoUrl = options.sourceValue;
         } else if (options.projectSource === "docker-compose") {
            options.dockerComposeConfig = options.sourceValue;
         } else if (options.projectSource === "dockerfile") {
            options.dockerfileContent = options.sourceValue;
         }

         trpc.createProject.mutate({
            name: options.projectName,
            description: options.description,
            domain: options.domain,
            exposed_port: parseInt(options.exposedPort),
            healthcheck_url: options.healthcheckUrl,
            build_command: options.buildCommand,
            git_repo_url: options.gitRepoUrl,
            docker_compose_config: options.dockerComposeConfig,
            dockerfile_content: options.dockerfileContent,
            project_source: "public-git",
            env_variables: [],
         });
      },
   });

   return yargs;
}
