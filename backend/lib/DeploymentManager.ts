import { exec, spawn } from 'child_process';
import yaml from 'js-yaml';
import fs from 'fs';

export default class DeploymentManager {
	constructor() {}

	async deployProject(project: any, source_folder: string) {
		switch (project.project_source) {
			case 'docker-compose':
				this.deployDockerCompose(project, source_folder);
				break;
			case 'dockerfile':
				this.deployDockerfile(project, source_folder);
				break;
			default:
				console.error('Unsupported project source:' + project.project_source);
				throw new Error('Unsupported project source:' + project.project_source);
		}
	}

	private deployDockerCompose(project: any, source_folder: string) {
		const docker_compose_config = yaml.load(
			fs.readFileSync(`${source_folder}/docker-compose.yml`, 'utf8')
		) as any;

		const services = Object.keys(docker_compose_config.services);

		const port_80_service = services.find((service) => {
			const service_config = docker_compose_config.services[service];
			if (service_config.ports) {
				return service_config.ports.find((port: string) => port.split(':')[0] === '80');
			}
			return false;
		});

		if (port_80_service) {
			docker_compose_config.services[port_80_service].labels = this.getTraefikLabels(project);
			// add traefik network
			if (!docker_compose_config.networks) {
				docker_compose_config.networks = {};
			}

			if (!docker_compose_config.networks.traefik) {
				docker_compose_config.networks.traefik = {
					external: true,
					name: 'paas3_default'
				};
			}

			docker_compose_config.services[port_80_service].networks = ['traefik'];

			delete docker_compose_config.services[port_80_service].ports;
		}

		fs.writeFileSync(
			`${source_folder}/edited-docker-compose.yml`,
			yaml.dump(docker_compose_config)
		);

		const deployScript = `docker compose -f ${source_folder}/edited-docker-compose.yml up -d `;

		const process = exec(deployScript);
		process.stdout?.on('data', (data) => {
			console.log(data);
		});

		process.on('exit', (code) => {
			console.log(`Child process exited with code ${code}`);
			console.log(`Child process exited with code ${code}`);
			resolve();
		});
	}
	private async deployDockerfile(project: any, source_folder: string) {
		const dockerfile = project.dockerfile_content;

		const dockerfile_lines = dockerfile.split('\n') as string[];

		// Add traefik labels

		const traefik_labels = this.getTraefikLabels(project);

		const from_statement_index = dockerfile_lines.findIndex((line) => line.startsWith('FROM'));

		traefik_labels.forEach((label: string) => {
			// Add traefik labels after FROM statement
			dockerfile_lines.splice(from_statement_index + 1, 0, 'LABEL ' + label);
		});

		fs.writeFileSync(`${source_folder}/Dockerfile`, dockerfile_lines.join('\n'));

		const container_name = project.name.toLowerCase();

		const build_script = `docker build -t ${container_name} ${source_folder}`;

		await new Promise<void>((resolve, reject) => {
			const process = exec(build_script, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
			});

			process.on('exit', (code) => {
				console.log(`Child process exited with code ${code}`);
				resolve();
			});
		});

		await new Promise<void>((resolve, reject) => {
			const process = spawn(
				'docker',
				['run', '-d', '--network', 'paas3_default', container_name, '--name', container_name],
				{
					stdio: 'inherit'
				}
			);

			process.on('exit', (code) => {
				console.log(`Child process exited with code ${code}`);
				resolve();
			});
		});
	}

	private getTraefikLabels(project: any) {
		const router_name = `router-${project.domain.replace(/\./g, '-')}`;

		return [
			'traefik.enable=true',
			`traefik.http.routers.${router_name}.rule=Host(\`${project.domain}\`)`,
			`traefik.http.routers.${router_name}.entrypoints=web`,
			`traefik.http.services.${router_name}.loadbalancer.server.port=80`
		];
	}

	async startProject(source_folder: string) {
		return new Promise<void>((resolve, reject) => {
			const process = spawn(
				'docker',
				['compose', '-f', `${source_folder}/edited-docker-compose.yml`, 'up', '-d'],
				{
					stdio: 'inherit'
				}
			);

			process.on('exit', (code) => {
				console.log(`Child process exited with code ${code}`);
				resolve();
			});
		});
	}

	stopProject({ project_id }: { project_id: number }) {
		return new Promise<void>((resolve, reject) => {
			const proc = exec(
				`docker-compose -f deployments/${project_id}/edited-docker-compose.yml down`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				}
			);

			proc.on('exit', (code) => {
				console.log(`Child process exited with code ${code}`);
				resolve();
			});
		});
	}
}
