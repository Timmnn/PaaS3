<script lang="ts">
	import { Label, Input, Button } from 'flowbite-svelte';
	import { trpc } from '$lib/tRPCClient';
	import { Tabs, TabItem } from 'flowbite-svelte';

	let gitRepoUrl = 'https://github.com/Timmnn/DockerComposeExample';
	let name = 'Project Name';
	let description = 'Project Description';
	let domain = 'example.com';
	let healthcheckUrl = '/healthcheck';
	let environmentVariables = [
		{ key: 'key1', value: 'value1' },
		{ key: 'key2', value: 'value2' }
	] as { key: string; value: string }[];
	let dockerComposeConfigLocation = 'docker-compose.yml';
	let exposedPort = 80;

	let error = null as string | null;

	async function onSubmit(event: Event) {
		event.preventDefault();
		trpc.createProject.mutate({
			git_repo_url: gitRepoUrl,
			name,
			description,
			domain,
			project_source: 'public-git',
			healthcheck_url: healthcheckUrl,
			build_command: '',
			env_variables: environmentVariables,
			docker_compose_config_location: dockerComposeConfigLocation,
			exposed_port: exposedPort
		});
	}

	function onEnvironmentVariableNameChange(i: number, event: Event): void {
		console.log('onEnvironmentVariableNameChange', i, event);
		environmentVariables[i].key = (event.target as HTMLInputElement).value;
	}

	function onEnvironmentVariableValueChange(i: number, event: Event) {
		console.log('onEnvironmentVariableValueChange', i, event);
		environmentVariables[i].value = (event.target as HTMLInputElement).value;
	}

	function addEnvironmentVariable() {
		console.log('addEnvironmentVariable');
		environmentVariables = [...environmentVariables, { key: '', value: '' }];
	}

	function removeEnvironmentVariable(i: number) {
		console.log('removeEnvironmentVariable', i);
		environmentVariables = environmentVariables.filter((_, index) => index !== i);

		console.log(environmentVariables);
	}
</script>

<h1>New Git Project</h1>
<form on:submit={onSubmit}>
	<Tabs tabStyle="pill">
		<TabItem open>
			<span slot="title">Profile</span>
			<div class="flex flex-col gap-3">
				<Label for="git-repo-url">Git Repository Url</Label>
				<Input
					id="git-repo-url"
					size="md"
					placeholder="https://github.com/Timmnn/DockerComposeExample"
					bind:value={gitRepoUrl}
				/>

				<Label for="name">Name</Label>
				<Input id="name" size="md" placeholder="Docker Compose Example" bind:value={name} />

				<Label for="description">Description</Label>
				<Input
					id="description"
					size="md"
					placeholder="An example project using docker-compose"
					bind:value={description}
				/>

				<Label for="domain">Domain</Label>
				<Input id="domain" size="md" placeholder="docker-compose-example.com" bind:value={domain} />

				<Label for="docker-compose-config-location">Docker Compose Config Location</Label>
				<Input
					id="docker-compose-config-location"
					size="md"
					placeholder="docker-compose.yml"
					bind:value={dockerComposeConfigLocation}
				/>

				<Label for="healthcheck-url">Healthcheck Url</Label>
				<Input
					id="healthcheck-url"
					size="md"
					placeholder="/healthcheck"
					bind:value={healthcheckUrl}
				/>

				<Label for="exposed-port">Exposed Port</Label>
				<Input id="exposed-port" size="md" placeholder="80" disabled bind:value={exposedPort} />
			</div>
		</TabItem>
		<TabItem>
			<span slot="title">Environment Variables</span>
			<div class="flex flex-col gap-3">
				{#each environmentVariables as { key, value: val }, i}
					<div class="flex gap-3">
						<Input
							placeholder="Key"
							bind:value={key}
							on:input={(e) => onEnvironmentVariableNameChange(i, e)}
						/>
						<Input
							placeholder="Value"
							bind:value={val}
							on:input={(e) => onEnvironmentVariableValueChange(i, e)}
						/>
						<Button on:click={() => removeEnvironmentVariable(i)}>Remove</Button>
					</div>
				{/each}
				<Button on:click={addEnvironmentVariable}>Add Environment Variable</Button>
			</div>
		</TabItem>
	</Tabs>
	<Button type="submit">Submit</Button>

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}
</form>
