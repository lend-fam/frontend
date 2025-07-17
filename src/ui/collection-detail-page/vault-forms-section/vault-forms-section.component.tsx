import { type FC, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Address } from 'viem';
import { Card } from '../../../ui-kit/components/card/card.component';
import { SectionHeader } from '../../../ui-kit/components/section-header/section-header.component';
import { Button } from '../../../ui-kit/components/button/button.component';
import { Dropdown, type DropdownOption } from '../../../ui-kit/components/dropdown/dropdown.component';
import { SupplyModalEnhanced } from '../../../ui-kit/components/supply-modal-enhanced/supply-modal-enhanced.component';
import { WithdrawModal } from '../../../ui-kit/components/withdraw-modal/withdraw-modal.component';
import { typedMemo } from '../../../ui-kit/utils/typed-memo.utils';
import type { CollectionData } from '../collection-detail-page.component';

import css from './vault-forms-section.module.css';

interface VaultFormsSectionProps {
	collectionData: CollectionData;
	selectedVault?: Address;
}

const VaultFormsSectionComponent: FC<VaultFormsSectionProps> = ({ collectionData, selectedVault }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

	// Use first vault as default if no vault is selected
	const vaultAddress = selectedVault || collectionData.vaults[0];

	// Mock vault data - replace with actual contract calls
	const vaultData = {
		name: `${collectionData.collectionName} Vault`,
		apy: '5.2%',
		totalAssets: '450,000',
		userBalance: '0',
		userShares: '0',
	};

	const handleSupply = () => {
		setIsSupplyModalOpen(true);
	};

	const handleWithdraw = () => {
		setIsWithdrawModalOpen(true);
	};

	const handleVaultSelect = (vault: string) => {
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set('vault', vault);
		setSearchParams(newSearchParams);
	};

	// Create dropdown options from vaults
	const vaultOptions: DropdownOption[] = collectionData.vaults.map((vault, index) => ({
		value: vault,
		label: `Vault #${index + 1}`,
		description: `${vault.slice(0, 8)}...${vault.slice(-6)}`,
	}));

	return (
		<div className={css.container}>
			<Card>
				<div className={css.content}>
					<SectionHeader title="Vault Operations" />

					{collectionData.vaults.length > 1 && (
						<div className={css.vaultSelector}>
							<div className={css.selectorLabel}>Select Vault</div>
							<Dropdown
								options={vaultOptions}
								value={vaultAddress}
								onChange={handleVaultSelect}
								placeholder="Choose a vault"
							/>
						</div>
					)}

					<div className={css.vaultInfo}>
						<div className={css.vaultName}>{vaultData.name}</div>
						<div className={css.vaultStats}>
							<div className={css.stat}>
								<div className={css.statLabel}>APY</div>
								<div className={css.statValue}>{vaultData.apy}</div>
							</div>
							<div className={css.stat}>
								<div className={css.statLabel}>Total Assets</div>
								<div className={css.statValue}>${vaultData.totalAssets}</div>
							</div>
						</div>
					</div>

					<div className={css.userPosition}>
						<div className={css.positionTitle}>Your Position</div>
						<div className={css.positionStats}>
							<div className={css.positionStat}>
								<div className={css.positionLabel}>Balance</div>
								<div className={css.positionValue}>${vaultData.userBalance}</div>
							</div>
							<div className={css.positionStat}>
								<div className={css.positionLabel}>Shares</div>
								<div className={css.positionValue}>{vaultData.userShares}</div>
							</div>
						</div>
					</div>

					<div className={css.actions}>
						<Button variant="secondary" size="large" fullWidth onClick={handleSupply}>
							Deposit
						</Button>
						<Button variant="outline" size="large" fullWidth onClick={handleWithdraw}>
							Withdraw
						</Button>
					</div>
				</div>
			</Card>

			{vaultAddress && (
				<>
					<SupplyModalEnhanced
						isOpen={isSupplyModalOpen}
						onClose={() => setIsSupplyModalOpen(false)}
						marketAddress={vaultAddress}
						supplyAPY={vaultData.apy}
						isCollateralEnabled={true}
					/>
					<WithdrawModal
						isOpen={isWithdrawModalOpen}
						onClose={() => setIsWithdrawModalOpen(false)}
						marketAddress={vaultAddress}
						tokenSymbol={collectionData.collectionName}
						supplyAPY={vaultData.apy}
					/>
				</>
			)}
		</div>
	);
};

export const VaultFormsSection = typedMemo(VaultFormsSectionComponent);
