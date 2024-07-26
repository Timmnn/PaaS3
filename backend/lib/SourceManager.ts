import { exec } from 'child_process';
import { type project_sources } from '../drizzle/schema';
import fs from 'fs';
import { config } from 'dotenv';

config({
	path: '../../.env'
});

export default class SourceManager {
	// sourceUrl: URL to the source (git repo, zip file, etc)
	async pullSource({
		type,
		source,
		project_id
	}: {
		type: project_sources;
		source: string;
		project_id: number;
	}) {
		const dirName = this.getDirName({ project_id });
		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName);
		}

		switch (type) {
			case 'public-git':
				console.log('pulling git repo');
				await this.pullGit({ dirName, sourceUrl: source });
				break;
			case 'docker-compose':
				this.pullDockerCompose({ dirName, config: source });
				break;
			case 'dockerfile':
				this.pullDockerfile({ dirName, config: source });
				break;
			default:
				throw new Error('Unsupported source type');
		}

		return dirName;
	}

	private pullDockerfile({ dirName, config }: { dirName: string; config: string }) {
		fs.writeFileSync(`${dirName}/Dockerfile`, config);
	}

	private pullDockerCompose({ dirName, config }: { dirName: string; config: string }) {
		fs.writeFileSync(`${dirName}/docker-compose.yml`, config);
	}

	getDirName({ project_id }: { project_id: number }) {
		return `deployments/${project_id}`;
	}

	deleteProject({ project_id }: { project_id: number }) {
		const dirName = this.getDirName({ project_id });

		if (fs.existsSync(dirName)) {
			fs.rmdirSync(dirName, { recursive: true });
		}
	}

	private pullGit({ dirName, sourceUrl }: { dirName: string; sourceUrl: string }) {
		return new Promise<void>((resolve, reject) => {
			console.log('cloning git repo', dirName);
			const process = exec(
				`
				git clone ${sourceUrl} ${dirName}`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
				}
			);

			process.on('exit', (code) => {
				console.log(`Child process exited with code ${code}`);
				resolve();
			});
		});
	}
}
