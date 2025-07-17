import type { FC } from 'react';
import { useState } from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { apeChainTestnet } from '../../config/wagmi.config';
import { Layout } from '../layout/layout.component';
import { FaucetService } from '../../services/faucet.service';
import { TEST_TOKEN_ABI } from '../../contracts/test-token.abi';
import { TEST_NFT_ABI } from '../../contracts/test-nft.abi';
import { TurnstileComponent } from '../../ui-kit/components/turnstile';
import { Button } from '../../ui-kit/components/button/button.component';
import { Card } from '../../ui-kit/components/card/card.component';
import { FlexContainer } from '../../ui-kit/components/flex-container/flex-container.component';

import css from './faucet-page.module.css';

export const FaucetPage: FC = () => {
	const { address, isConnected } = useAccount();
	const chainId = useChainId();
	const [mintingToken, setMintingToken] = useState<string | null>(null);
	const [captchaVerified, setCaptchaVerified] = useState(false);

	const { writeContract, data: hash, isPending, error } = useWriteContract();
	const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
		hash,
	});

	const isTestnet = chainId === apeChainTestnet.id;

	const handleMintTestToken = async (tokenType: string) => {
		if (!address || !isConnected || !captchaVerified) return;

		const tokenAddress = FaucetService.getTokenAddress(tokenType);
		const amount = FaucetService.getTokenAmount(tokenType);

		if (!tokenAddress || !amount) {
			console.error(`Invalid token type: ${tokenType}`);
			return;
		}

		setMintingToken(tokenType);

		try {
			await writeContract({
				address: tokenAddress,
				abi: TEST_TOKEN_ABI,
				functionName: 'mint',
				args: [address, amount],
			});
		} catch (error) {
			console.error(`Failed to mint ${tokenType}:`, error);
			setMintingToken(null);
		}
	};

	const handleMintTestNFT = async () => {
		if (!address || !isConnected || !captchaVerified) return;

		const nftAddress = FaucetService.getNftAddress();
		setMintingToken('nft');

		try {
			await writeContract({
				address: nftAddress,
				abi: TEST_NFT_ABI,
				functionName: 'mint',
				args: [address],
			});
		} catch (error) {
			console.error('Failed to mint NFT:', error);
			setMintingToken(null);
		}
	};

	// Reset minting state when transaction is confirmed
	if (isConfirmed && mintingToken) {
		setMintingToken(null);
	}

	const handleTurnstileSuccess = (token: string) => {
		// Store token for potential backend verification
		console.log('Turnstile verification successful:', token);
		setCaptchaVerified(true);
	};

	const handleTurnstileError = () => {
		setCaptchaVerified(false);
	};

	const handleTurnstileExpire = () => {
		setCaptchaVerified(false);
	};

	if (!isTestnet) {
		return (
			<Layout>
				<FlexContainer variant="center" className={css.container}>
					<div className={css.errorCard}>
						<h1>Testnet Faucet</h1>
						<p>This faucet is only available on ApeChain Testnet.</p>
						<p>Please switch to the testnet to use this feature.</p>
					</div>
				</FlexContainer>
			</Layout>
		);
	}

	return (
		<Layout>
			<FlexContainer variant="center" className={css.container}>
				<Card style={{ maxWidth: '800px' }}>
					<h1>Testnet Faucet</h1>
					<p className={css.description}>
						Get test tokens and NFTs for testing the lend.fam protocol on ApeChain Testnet.
					</p>

					{!isConnected ? (
						<div className={css.connectPrompt}>
							<p>Please connect your wallet to use the faucet.</p>
						</div>
					) : (
						<div className={css.faucetSection}>
							<div className={css.addressInfo}>
								<p>Connected: {address}</p>
							</div>

							<div className={css.captchaSection}>
								<h3>Security Verification</h3>
								<p>Please complete the verification below to access the faucet:</p>
								<div className={css.captchaContainer}>
									<TurnstileComponent
										onSuccess={handleTurnstileSuccess}
										onError={handleTurnstileError}
										onExpire={handleTurnstileExpire}
										theme="light"
										size="normal"
									/>
								</div>
								{captchaVerified && (
									<div className={css.captchaSuccess}>
										<p>✓ Verification successful</p>
									</div>
								)}
							</div>

							<div className={css.mintSection}>
								<h3>Native APE Token</h3>
								<FlexContainer variant="spaceBetween" className={css.nativeTokenCard}>
									<div className={css.tokenInfo}>
										<h4>Native APE</h4>
										<p>Get native APE tokens from the official Caldera testnet faucet</p>
									</div>
									<Button
										variant="primary"
										size="medium"
										className={`${css.externalFaucetButton} ${css.greenSolid}`}
										icon={
											<svg
												width="16"
												height="16"
												viewBox="0 0 16 16"
												fill="none"
												xmlns="http://www.w3.org/2000/svg">
												<path
													d="M12 8.5V12.5C12 13.0523 11.5523 13.5 11 13.5H3C2.44772 13.5 2 13.0523 2 12.5V4.5C2 3.94772 2.44772 3.5 3 3.5H7"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<path
													d="M10 2.5H14V6.5"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<path
													d="M14 2.5L8 8.5"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										}
										iconPosition="right"
										onClick={() => window.open('https://curtis.hub.caldera.xyz/', '_blank')}>
										Open Caldera Faucet
									</Button>
								</FlexContainer>
							</div>

							<div className={css.mintSection}>
								<h3>Test ERC20 Tokens</h3>
								<div className={css.tokenGrid}>
									<div className={css.tokenCard}>
										<div className={css.tokenInfo}>
											<h4>Test USDC</h4>
											<p>Stablecoin for testing</p>
										</div>
										<Button
											variant="secondary"
											size="medium"
											className={css.mintButton}
											onClick={() => handleMintTestToken('usdc')}
											disabled={
												!captchaVerified || mintingToken === 'usdc' || isPending || isConfirming
											}
											loading={mintingToken === 'usdc' && (isPending || isConfirming)}>
											{!captchaVerified
												? 'Complete CAPTCHA First'
												: mintingToken === 'usdc'
													? isPending
														? 'Confirm in wallet...'
														: isConfirming
															? 'Confirming...'
															: 'Minting...'
													: 'Mint 10000 USDC'}
										</Button>
									</div>

									<div className={css.tokenCard}>
										<div className={css.tokenInfo}>
											<h4>Test WETH</h4>
											<p>Wrapped ETH for testing</p>
										</div>
										<Button
											variant="secondary"
											size="medium"
											className={css.mintButton}
											onClick={() => handleMintTestToken('weth')}
											disabled={
												!captchaVerified || mintingToken === 'weth' || isPending || isConfirming
											}
											loading={mintingToken === 'weth' && (isPending || isConfirming)}>
											{!captchaVerified
												? 'Complete CAPTCHA First'
												: mintingToken === 'weth'
													? isPending
														? 'Confirm in wallet...'
														: isConfirming
															? 'Confirming...'
															: 'Minting...'
													: 'Mint 10 WETH'}
										</Button>
									</div>
								</div>
							</div>

							<div className={css.mintSection}>
								<h3>Test NFTs</h3>
								<div className={css.nftCard}>
									<div className={css.tokenInfo}>
										<h4>Test Collection NFT</h4>
										<p>NFT for testing collection-backed lending</p>
									</div>
									<Button
										variant="secondary"
										size="medium"
										className={css.mintButton}
										onClick={handleMintTestNFT}
										disabled={
											!captchaVerified || mintingToken === 'nft' || isPending || isConfirming
										}
										loading={mintingToken === 'nft' && (isPending || isConfirming)}>
										{!captchaVerified
											? 'Complete CAPTCHA First'
											: mintingToken === 'nft'
												? isPending
													? 'Confirm in wallet...'
													: isConfirming
														? 'Confirming...'
														: 'Minting...'
												: 'Mint Test NFT'}
									</Button>
								</div>
							</div>

							{error && (
								<div className={css.errorMessage}>
									<p>
										<strong>Error:</strong> {error.message}
									</p>
								</div>
							)}

							{isConfirmed && (
								<div className={css.successMessage}>
									<p>
										<strong>Success!</strong> Transaction confirmed!
									</p>
									{hash && (
										<p>
											<a
												href={`https://curtis.apescan.io/tx/${hash}`}
												target="_blank"
												rel="noopener noreferrer">
												View on ApeScan
											</a>
										</p>
									)}
								</div>
							)}

							<div className={css.disclaimer}>
								<p>
									<strong>Note:</strong> These are test tokens with no real value. They are only for
									testing purposes on the ApeChain Testnet.
								</p>
								<p>
									For native APE tokens, use the official Caldera faucet above. For ERC20 test tokens
									and NFTs, use the mint buttons below.
								</p>
							</div>
						</div>
					)}
				</Card>
			</FlexContainer>
		</Layout>
	);
};
