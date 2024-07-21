import fs from 'fs';
import util from 'util';
import { exec as execCallback } from 'child_process';
const exec = util.promisify(execCallback);

export default function createGitDeployment({
	repo_url,
	domain,
	branch,
	folder
}: {
	repo_url: string;
	domain: string;
	branch: string;
	folder: string;
}): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		// Create deployment folder with repo_url and domain name
		const deploymentFolder = `${folder}/${domain}`;
		fs.rmSync(deploymentFolder, { recursive: true });
		fs.mkdirSync(deploymentFolder, { recursive: true });
		fs.mkdirSync(`${deploymentFolder}/__source`, { recursive: true });
		// run git clone
		const gitClone = `git clone --single-branch --branch ${branch} ${repo_url} ${deploymentFolder}/__source`;
		await exec(gitClone);
		// run docker compose up

		await exec(`docker-compose -f ${deploymentFolder}/__source/docker-compose.yml up -d`);

		console.log('createGitDeployment', { repo_url });
		resolve(true);
	});
}
