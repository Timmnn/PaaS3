import { exec } from 'child_process';
import yaml from 'js-yaml';
import fs from 'fs';

export default class DeploymentManager {
	constructor() {}

	async deployProject(project: any, source_folder: string): Promise<number[]> {
		return new Promise<number[]>((resolve, reject) => {
			console.log('deploying project', project);

			const docker_compose_config = yaml.load(
				fs.readFileSync(`${source_folder}/docker-compose.yml`, 'utf8')
			) as any;

			console.log('docker-compose', docker_compose_config);

			const exposed_ports = [] as number[];

			const services = Object.keys(docker_compose_config.services);

			for (const service of Object.keys(docker_compose_config.services)) {
				const service_config = docker_compose_config.services[service];
				if (service_config.ports) {
					for (const port of service_config.ports) {
						exposed_ports.push(port.split(':')[0]);
					}
				}
			}

			const port_80_service = services.find((service) => {
				const service_config = docker_compose_config.services[service];
				if (service_config.ports) {
					return service_config.ports.find((port: string) => port.split(':')[0] === '80');
				}
				return false;
			});

			if (port_80_service) {
				//add traefik labels
				/*
				    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.server.rule=Host(`example.com`)"
      - "traefik.http.routers.server.entrypoints=web"
				*/

				const router_name = `router-${project.domain.replace(/\./g, '-')}`;

				docker_compose_config.services[port_80_service].labels = [
					'traefik.enable=true',
					`traefik.http.routers.${router_name}.rule=Host(\`${project.domain}\`)`,
					`traefik.http.routers.${router_name}.entrypoints=web`,
					`traefik.http.services.${router_name}.loadbalancer.server.port=80`
				];
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

			const container_name = `paas-project-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

			const deployScript = `docker-compose -f ${source_folder}/edited-docker-compose.yml up -d `;

			const process = exec(deployScript, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
			});

			process.on('exit', (code) => {
				console.log(`Child process exited with code ${code}`);
				resolve(exposed_ports);
			});
		});
	}

	async startProject(source_folder: string) {
		console.log('starting project', source_folder);
		const deployScript = `docker-compose -f ${source_folder}/edited-docker-compose.yml up -d `;

		const process = exec(deployScript, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
			console.error(`stderr: ${stderr}`);
		});

		process.on('exit', (code) => {
			console.log(`Child process exited with code ${code}`);
		});
	}
}
