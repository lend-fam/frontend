import type { BrowserProvider } from 'ethers';

interface Account {}

export class AccountProviderService {
	private browserProvider: BrowserProvider;

	constructor(browserProvider: BrowserProvider) {
		this.browserProvider = browserProvider;
	}

	public getAccounts = async (): Promise<Account[]> => {
		return await this.send('eth_accounts', []);
	};

	private send = <T>(method: string, params: Array<unknown> | Record<string, unknown>): Promise<T> =>
		this.browserProvider.send(method, params);
}
