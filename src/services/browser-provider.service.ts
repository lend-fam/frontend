import { type Eip1193Provider, BrowserProvider } from 'ethers';

export class BrowserProviderService {
	private browserProvider: BrowserProvider;

	constructor(ethereum: Eip1193Provider) {
		this.browserProvider = new BrowserProvider(ethereum);
	}

	public getSigner = async () => {
		return await this.browserProvider.getSigner();
	};

	public getNetwork = async () => {
		return await this.browserProvider.getNetwork();
	};

	public getBrowserProvider = () => this.browserProvider;

	private send = <T>(method: string, params: Array<unknown> | Record<string, unknown>): Promise<T> =>
		this.browserProvider.send(method, params);
}
