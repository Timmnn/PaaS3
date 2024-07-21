import { exec } from 'child_process';
import { type project_sources } from '../drizzle/schema';
import fs from 'fs';
import { config } from 'dotenv';

config({
	path: '../../.env'
});

export default class SourceManager {
	// sourceUrl: URL to the source (git repo, zip file, etc)
	async pullSource({ type, sourceUrl }: { type: project_sources; sourceUrl: string }) {
		const dirName = this.getDirName({ sourceUrl });
		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName);
		}
		console.log('pulling source', sourceUrl, 'to', dirName, 'of type', type);
		switch (type) {
			case 'public-git':
				console.log('pulling git repo');
				await this.pullGit({ dirName, sourceUrl });
				break;
			default:
				throw new Error('Unsupported source type');
		}

		return dirName;
	}

	private getDirName({ sourceUrl }: { sourceUrl: string }) {
		const random_pull_id = Math.random().toString(36).substring(7);
		return (
			process.env.PRIVATE_DEPLOYMENTS_FOLDER +
			sourceUrl.replace(/[^a-zA-Z0-9]/g, '') +
			random_pull_id
		);
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
