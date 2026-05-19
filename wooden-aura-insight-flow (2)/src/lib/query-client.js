import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,       // data considered fresh for 5 minutes
			gcTime: 10 * 60 * 1000,          // unused cache garbage-collected after 10 minutes
		},
	},
});