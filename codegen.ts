import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: 'src/graphql/schema.graphql',
	documents: ['src/**/*.{ts,tsx}'],
	generates: {
		'./src/graphql/generated.ts': {
			plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
			config: {
				withHooks: true,
				withHOC: false,
				withComponent: false,
				apolloReactCommonImportFrom: '@apollo/client',
				apolloReactHooksImportFrom: '@apollo/client',
				scalars: {
					Int8: 'number',
					BigInt: 'string',
					Bytes: 'string',
					Timestamp: 'number',
				},
			},
		},
	},
};

export default config;
