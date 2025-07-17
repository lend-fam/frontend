import type { FC } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import css from './sign-in.module.css';

export const SignIn: FC = () => {
	return (
		<div className={css.container}>
			<ConnectButton.Custom>
				{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
					const ready = mounted;
					const connected = ready && account && chain;

					return (
						<div
							{...(!ready && {
								'aria-hidden': true,
								style: {
									opacity: 0,
									pointerEvents: 'none',
									userSelect: 'none',
								},
							})}>
							{(() => {
								if (!connected) {
									return (
										<button onClick={openConnectModal} type="button" className={css.connectButton}>
											Connect Wallet
										</button>
									);
								}

								if (chain.unsupported) {
									return (
										<button onClick={openChainModal} type="button" className={css.connectButton}>
											Wrong network
										</button>
									);
								}

								return (
									<button onClick={openAccountModal} type="button" className={css.connectButton}>
										{account.address
											? `${account.address.slice(0, 4)}...${account.address.slice(-5)}`
											: account.displayName}
									</button>
								);
							})()}
						</div>
					);
				}}
			</ConnectButton.Custom>
		</div>
	);
};
