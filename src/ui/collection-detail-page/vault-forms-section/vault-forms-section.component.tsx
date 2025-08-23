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
import { useVaultTokenData } from '../../../hooks';
import type { CollectionDetailData } from '../collection-detail-page.component';

import css from './vault-forms-section.module.css';

interface VaultFormsSectionProps {
	collectionData: CollectionDetailData;
	selectedVault?: Address;
}

const VaultFormsSectionComponent: FC<VaultFormsSectionProps> = ({ collectionData, selectedVault }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

	// Use first vault as default if no vault is selected
	const selectedVaultData = selectedVault
		? collectionData.vaults.find((v) => v.address === selectedVault)
		: collectionData.vaults[0];

	const vaultAddress = selectedVaultData?.address;

	// Fetch vault token data for the selected vault
	const { data: vaultTokenData, isLoading: isVaultTokenDataLoading } = useVaultTokenData(vaultAddress);

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
	const vaultOptions: DropdownOption[] = collectionData.vaults.map((vault) => ({
		value: vault.address,
		label: vault.name,
		description: `${vault.address.slice(0, 8)}...${vault.address.slice(-6)}`,
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
								value={vaultAddress || ''}
								onChange={handleVaultSelect}
								placeholder="Choose a vault"
							/>
						</div>
					)}

					{selectedVaultData && (
						<>
							<div className={css.vaultInfo}>
								<div className={css.vaultName}>{selectedVaultData.name}</div>
								<div className={css.vaultStats}>
									<div className={css.stat}>
										<div className={css.statLabel}>Total Assets</div>
										<div className={css.statValue}>${selectedVaultData.totalAssets}</div>
									</div>
									{vaultTokenData && (
										<div className={css.stat}>
											<div className={css.statLabel}>Supply APY</div>
											<div className={css.statValue}>
												{isVaultTokenDataLoading
													? 'Loading...'
													: `${vaultTokenData.supplyAPY}%`}
											</div>
										</div>
									)}
								</div>
							</div>

							<div className={css.userPosition}>
								<div className={css.positionTitle}>Your Position</div>
								<div className={css.positionStats}>
									<div className={css.positionStat}>
										<div className={css.positionLabel}>Balance</div>
										<div className={css.positionValue}>${selectedVaultData.userBalance || '0'}</div>
									</div>
									<div className={css.positionStat}>
										<div className={css.positionLabel}>Shares</div>
										<div className={css.positionValue}>{selectedVaultData.userShares || '0'}</div>
									</div>
									{vaultTokenData && (
										<div className={css.positionStat}>
											<div className={css.positionLabel}>Asset</div>
											<div className={css.positionValue}>
												{isVaultTokenDataLoading ? 'Loading...' : vaultTokenData.tokenSymbol}
											</div>
										</div>
									)}
								</div>
							</div>
						</>
					)}

					<div className={css.actions}>
						<Button
							variant="secondary"
							size="large"
							fullWidth
							onClick={handleSupply}
							disabled={isVaultTokenDataLoading}>
							{isVaultTokenDataLoading ? 'Loading...' : 'Deposit'}
						</Button>
						<Button
							variant="outline"
							size="large"
							fullWidth
							onClick={handleWithdraw}
							disabled={isVaultTokenDataLoading}>
							{isVaultTokenDataLoading ? 'Loading...' : 'Withdraw'}
						</Button>
					</div>
				</div>
			</Card>

			{vaultAddress && (
				<>
					<SupplyModalEnhanced
						isOpen={isSupplyModalOpen}
						onClose={() => setIsSupplyModalOpen(false)}
						marketAddress={vaultAddress!}
						supplyAPY={vaultTokenData?.supplyAPY ? `${vaultTokenData.supplyAPY}%` : '0%'}
						isCollateralEnabled={vaultTokenData?.isCollateralEnabled ?? true}
					/>
					<WithdrawModal
						isOpen={isWithdrawModalOpen}
						onClose={() => setIsWithdrawModalOpen(false)}
						marketAddress={vaultAddress!}
						tokenSymbol={
							vaultTokenData?.tokenSymbol || vaultTokenData?.vaultSymbol || collectionData.collectionName
						}
						supplyAPY={vaultTokenData?.supplyAPY ? `${vaultTokenData.supplyAPY}%` : '0%'}
					/>
				</>
			)}
		</div>
	);
};

export const VaultFormsSection = typedMemo(VaultFormsSectionComponent);
