import { ChildProcess, exec } from 'child_process';
import { config } from 'dotenv';
import * as schema from '../../drizzle/schema';
import { type InferSelectModel } from 'drizzle-orm';

config({
	path: '../../../.env'
});

export default class NginxManager {
	private nginxProcess: ChildProcess | null = null;

	private async startNginx({ restart }: { restart: boolean }) {
		if (restart) {
			this.nginxProcess?.kill();
		}

		if (this.nginxProcess) {
			return;
		}

		this.nginxProcess = exec('nginx', (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
			console.error(`stderr: ${stderr}`);
		});

		this.nginxProcess.on('exit', (code) => {
			console.log(`Child exited with code ${code}`);
			this.nginxProcess = null;
		});
	}

	private async copyNginxConfig(config: string) {}

	async updateNginxConfig(deployments: InferSelectModel<typeof schema.deployments>[]) {
		let new_config = '';

		function getServerBlock(domain: string, port: number) {
			return `server {
            listen 80;
            server_name ${domain};
            location / {
               proxy_pass http://localhost:${port};
            }
         }`;
		}

		// write new_config to /etc/nginx/sites-enabled/default

		deployments.forEach((deployment) => {
			const { domain, port } = deployment;
			new_config += getServerBlock(domain, port);
		});

		await this.copyNginxConfig(new_config);
		this.startNginx({ restart: true });
	}
}
