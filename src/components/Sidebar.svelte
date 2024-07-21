<script lang="ts">
	import { page } from '$app/stores';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { UserSolid } from 'flowbite-svelte-icons';
	$: activeUrl = $page.url.pathname;
	$: isActiveUrl = (url: string) => activeUrl === url;

	const links = [{ label: 'Projects', href: '/' }];
</script>

<Sidebar {activeUrl}>
	<SidebarWrapper class="h-full rounded-none">
		<SidebarGroup>
			{#each links as link}
				<SidebarItem label={link.label} href={link.href} active={isActiveUrl(link.href)}>
					<svelte:fragment slot="icon">
						<UserSolid
							class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
			{/each}
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
