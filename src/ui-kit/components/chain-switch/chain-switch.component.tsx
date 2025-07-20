import { memo, useCallback, useMemo, useEffect } from 'react';
import { useSwitchChain, useChainId } from 'wagmi';
import { useTheme } from '../../hooks/use-theme.hook';
import { Dropdown, type DropdownOption } from '../dropdown';
import { chains, getChainDisplayName } from '../../../config/wagmi.config';

import css from './chain-switch.module.css';

interface ChainSwitchProps {
	theme?: Partial<typeof css>;
}

export const ChainSwitch = memo<ChainSwitchProps>((props) => {
	const theme = useTheme(css, props.theme);
	const { switchChain } = useSwitchChain();
	const chainId = useChainId();

	const chainOptions: DropdownOption[] = useMemo(
		() =>
			chains.map((chain) => ({
				value: chain.id.toString(),
				label: getChainDisplayName(chain.id),
				disabled: chain.id === 33139, // Disable ApeChain mainnet
				tooltip: chain.id === 33139 ? 'Coming soon' : undefined,
			})),
		[],
	);

	// Auto-switch from ApeChain mainnet to Curtis if user somehow gets on mainnet
	useEffect(() => {
		if (chainId === 33139) {
			// ApeChain mainnet
			switchChain({ chainId: 33111 }); // Switch to Curtis
		}
	}, [chainId, switchChain]);

	const handleChainChange = useCallback(
		(value: string) => {
			const targetChainId = parseInt(value, 10);
			if (chainId !== targetChainId) {
				switchChain({ chainId: targetChainId });
			}
		},
		[chainId, switchChain],
	);

	return (
		<div className={theme.container}>
			<div className={theme.chainSwitchWrapper}>
				<Dropdown
					options={chainOptions}
					value={chainId?.toString()}
					onChange={handleChainChange}
					placeholder="Select Network"
				/>
			</div>
		</div>
	);
});

ChainSwitch.displayName = 'ChainSwitch';
