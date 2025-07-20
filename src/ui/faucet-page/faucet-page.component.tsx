import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { apeChainTestnet } from '../../config/wagmi.config';
import { Layout } from '../layout/layout.component';
import { FaucetService } from '../../services/faucet.service';
import { TEST_TOKEN_ABI } from '../../contracts/test-token.abi';
import { TEST_NFT_ABI } from '../../contracts/test-nft.abi';
import { TurnstileComponent } from '../../ui-kit/components/turnstile';
import { Button } from '../../ui-kit/components/button/button.component';
import { Card } from '../../ui-kit/components/card/card.component';
import { FlexContainer } from '../../ui-kit/components/flex-container/flex-container.component';
import { useToastContext } from '../../hooks/use-toast-context.hook';

import css from './faucet-page.module.css';

export const FaucetPage: FC = () => {
	const { address, isConnected } = useAccount();
	const chainId = useChainId();
	const [mintingToken, setMintingToken] = useState<string | null>(null);
	const [captchaVerified, setCaptchaVerified] = useState(false);
	const { showToast } = useToastContext();

	const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
	const {
		isLoading: isConfirming,
		isSuccess: isConfirmed,
		error: confirmError,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const isTestnet = chainId === apeChainTestnet.id;

	// Check claim status for all tokens
	const usdcAddress = FaucetService.getTokenAddress('usdc');
	const wethAddress = FaucetService.getTokenAddress('weth');
	const daiAddress = FaucetService.getTokenAddress('dai');

	const { data: claimData, refetch: refetchClaimData } = useReadContracts({
		contracts: [
			// USDC
			{
				address: usdcAddress!,
				abi: TEST_TOKEN_ABI,
				functionName: 'lastClaim',
				args: [address!],
			},
			{
				address: usdcAddress!,
				abi: TEST_TOKEN_ABI,
				functionName: 'FAUCET_COOLDOWN',
			},
			// WETH
			{
				address: wethAddress!,
				abi: TEST_TOKEN_ABI,
				functionName: 'lastClaim',
				args: [address!],
			},
			{
				address: wethAddress!,
				abi: TEST_TOKEN_ABI,
				functionName: 'FAUCET_COOLDOWN',
			},
			// DAI
			{
				address: daiAddress!,
				abi: TEST_TOKEN_ABI,
				functionName: 'lastClaim',
				args: [address!],
			},
			{
				address: daiAddress!,
				abi: TEST_TOKEN_ABI,
				functionName: 'FAUCET_COOLDOWN',
			},
		],
		query: {
			enabled: !!address && isTestnet && !!usdcAddress && !!wethAddress && !!daiAddress,
		},
	});

	// Helper function to check if a token can be claimed
	const canClaimToken = (tokenIndex: number): { canClaim: boolean; timeRemaining?: number } => {
		if (!claimData || !address) return { canClaim: true };

		const lastClaimData = claimData[tokenIndex * 2]; // lastClaim
		const cooldownData = claimData[tokenIndex * 2 + 1]; // FAUCET_COOLDOWN

		if (!lastClaimData?.result || !cooldownData?.result) return { canClaim: true };

		const lastClaim = Number(lastClaimData.result);
		const cooldown = Number(cooldownData.result);

		if (lastClaim === 0) return { canClaim: true }; // Never claimed

		const currentTime = Math.floor(Date.now() / 1000);
		const timeSinceLastClaim = currentTime - lastClaim;

		if (timeSinceLastClaim >= cooldown) {
			return { canClaim: true };
		} else {
			return {
				canClaim: false,
				timeRemaining: cooldown - timeSinceLastClaim,
			};
		}
	};

	// Get claim status for each token
	const usdcStatus = canClaimToken(0);
	const wethStatus = canClaimToken(1);
	const daiStatus = canClaimToken(2);

	// Helper function to format time remaining
	const formatTimeRemaining = (seconds: number): string => {
		const days = Math.floor(seconds / (24 * 60 * 60));
		const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
		const minutes = Math.floor((seconds % (60 * 60)) / 60);

		if (days > 0) {
			return `${days}d ${hours}h`;
		} else if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	};

	const handleMintTestToken = async (tokenType: string) => {
		if (!address || !isConnected || !captchaVerified) return;

		const tokenAddress = FaucetService.getTokenAddress(tokenType);

		if (!tokenAddress) {
			return;
		}

		// Reset any previous errors
		reset();
		setMintingToken(tokenType);

		try {
			await writeContract({
				address: tokenAddress,
				abi: TEST_TOKEN_ABI,
				functionName: 'faucet',
				args: [],
			});
		} catch (err) {
			console.error('Transaction failed or was cancelled:', err);
			setMintingToken(null);
		}
	};

	const handleMintTestNFT = async (nftType: string) => {
		if (!address || !isConnected || !captchaVerified) return;

		const nftAddress = FaucetService.getNftAddress(nftType);
		if (!nftAddress) return;

		// Reset any previous errors
		reset();
		setMintingToken(nftType);

		try {
			await writeContract({
				address: nftAddress,
				abi: TEST_NFT_ABI,
				functionName: 'faucet',
				args: [],
			});
		} catch (err) {
			console.error('Transaction failed or was cancelled:', err);
			setMintingToken(null);
		}
	};

	// Handle transaction state changes
	useEffect(() => {
		if (isConfirmed && mintingToken) {
			// Refetch claim data after successful transaction
			refetchClaimData();
			setMintingToken(null);
		}

		// Handle transaction cancellation or failure
		if (error && mintingToken) {
			// Check if error is user cancellation
			const isCancelled =
				error.message?.includes('User rejected') ||
				error.message?.includes('user rejected') ||
				error.message?.includes('cancelled');

			if (isCancelled) {
				showToast('Transaction was cancelled', 'warning', 3000);
			} else {
				showToast(getErrorMessage(error), 'error', 5000);
			}

			// Reset minting state on any error
			setMintingToken(null);
		}

		// Handle confirmation errors (e.g., transaction reverted)
		if (confirmError && mintingToken) {
			showToast('Transaction failed during confirmation', 'error', 5000);
			setMintingToken(null);
		}
	}, [isConfirmed, error, confirmError, mintingToken, showToast, refetchClaimData]);

	const handleTurnstileSuccess = () => {
		// Store token for potential backend verification
		setCaptchaVerified(true);
	};

	const handleTurnstileError = () => {
		setCaptchaVerified(false);
	};

	const handleTurnstileExpire = () => {
		setCaptchaVerified(false);
	};

	const handleCancelTransaction = () => {
		// Reset all transaction states
		reset();
		setMintingToken(null);
	};

	const getErrorMessage = (error: Error | null) => {
		if (!error) return '';

		const message = error.message || error.toString();

		if (message.includes('User rejected') || message.includes('user rejected')) {
			return 'Transaction was cancelled by user';
		}

		if (message.includes('insufficient funds')) {
			return 'Insufficient funds for gas fees';
		}

		if (message.includes('execution reverted')) {
			return 'Transaction failed - you may have already claimed recently (7-day cooldown)';
		}

		return `Transaction failed: ${message}`;
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
											<p>
												{!usdcStatus.canClaim && usdcStatus.timeRemaining
													? `Cooldown: ${formatTimeRemaining(usdcStatus.timeRemaining)}`
													: '100 USDC per claim'}
											</p>
										</div>
										<Button
											variant="secondary"
											size="medium"
											className={css.mintButton}
											onClick={() => handleMintTestToken('usdc')}
											disabled={
												!captchaVerified ||
												!usdcStatus.canClaim ||
												mintingToken === 'usdc' ||
												isPending ||
												isConfirming
											}
											loading={mintingToken === 'usdc' && (isPending || isConfirming)}>
											{!captchaVerified
												? 'Complete CAPTCHA First'
												: !usdcStatus.canClaim
													? 'Cooldown Active'
													: mintingToken === 'usdc'
														? isPending
															? 'Confirm in wallet...'
															: isConfirming
																? 'Confirming...'
																: 'Claiming...'
														: 'Claim USDC'}
										</Button>
									</div>

									<div className={css.tokenCard}>
										<div className={css.tokenInfo}>
											<h4>Test WETH</h4>
											<p>
												{!wethStatus.canClaim && wethStatus.timeRemaining
													? `Cooldown: ${formatTimeRemaining(wethStatus.timeRemaining)}`
													: '100 WETH per claim'}
											</p>
										</div>
										<Button
											variant="secondary"
											size="medium"
											className={css.mintButton}
											onClick={() => handleMintTestToken('weth')}
											disabled={
												!captchaVerified ||
												!wethStatus.canClaim ||
												mintingToken === 'weth' ||
												isPending ||
												isConfirming
											}
											loading={mintingToken === 'weth' && (isPending || isConfirming)}>
											{!captchaVerified
												? 'Complete CAPTCHA First'
												: !wethStatus.canClaim
													? 'Cooldown Active'
													: mintingToken === 'weth'
														? isPending
															? 'Confirm in wallet...'
															: isConfirming
																? 'Confirming...'
																: 'Claiming...'
														: 'Claim WETH'}
										</Button>
									</div>

									<div className={css.tokenCard}>
										<div className={css.tokenInfo}>
											<h4>Test DAI</h4>
											<p>
												{!daiStatus.canClaim && daiStatus.timeRemaining
													? `Cooldown: ${formatTimeRemaining(daiStatus.timeRemaining)}`
													: '100 DAI per claim'}
											</p>
										</div>
										<Button
											variant="secondary"
											size="medium"
											className={css.mintButton}
											onClick={() => handleMintTestToken('dai')}
											disabled={
												!captchaVerified ||
												!daiStatus.canClaim ||
												mintingToken === 'dai' ||
												isPending ||
												isConfirming
											}
											loading={mintingToken === 'dai' && (isPending || isConfirming)}>
											{!captchaVerified
												? 'Complete CAPTCHA First'
												: !daiStatus.canClaim
													? 'Cooldown Active'
													: mintingToken === 'dai'
														? isPending
															? 'Confirm in wallet...'
															: isConfirming
																? 'Confirming...'
																: 'Claiming...'
														: 'Claim DAI'}
										</Button>
									</div>
								</div>
							</div>

							<div className={css.mintSection}>
								<h3>Test NFTs</h3>
								<div className={css.tokenGrid}>
									<div className={css.tokenCard}>
										<div className={css.tokenInfo}>
											<h4>Mock BAYC</h4>
											<p>Bored Ape test NFT</p>
										</div>
										<Button
											variant="secondary"
											size="medium"
											className={css.mintButton}
											onClick={() => handleMintTestNFT('bayc')}
											disabled={
												!captchaVerified || mintingToken === 'bayc' || isPending || isConfirming
											}
											loading={mintingToken === 'bayc' && (isPending || isConfirming)}>
											{!captchaVerified
												? 'Complete CAPTCHA First'
												: mintingToken === 'bayc'
													? isPending
														? 'Confirm in wallet...'
														: isConfirming
															? 'Confirming...'
															: 'Claiming...'
													: 'Claim BAYC NFT'}
										</Button>
									</div>

									<div className={css.tokenCard}>
										<div className={css.tokenInfo}>
											<h4>Mock CryptoPunk</h4>
											<p>CryptoPunk test NFT</p>
										</div>
										<Button
											variant="secondary"
											size="medium"
											className={css.mintButton}
											onClick={() => handleMintTestNFT('punk')}
											disabled={
												!captchaVerified || mintingToken === 'punk' || isPending || isConfirming
											}
											loading={mintingToken === 'punk' && (isPending || isConfirming)}>
											{!captchaVerified
												? 'Complete CAPTCHA First'
												: mintingToken === 'punk'
													? isPending
														? 'Confirm in wallet...'
														: isConfirming
															? 'Confirming...'
															: 'Claiming...'
													: 'Claim PUNK NFT'}
										</Button>
									</div>
								</div>
							</div>

							{mintingToken && (isPending || isConfirming) && (
								<div className={css.pendingMessage}>
									<p>
										<strong>
											{isPending
												? 'Waiting for wallet confirmation...'
												: 'Transaction confirming...'}
										</strong>
										{isPending && ' Please confirm the transaction in your wallet.'}
										{isConfirming && ' Please wait while the transaction is processed.'}
									</p>
									{isPending && (
										<Button
											variant="secondary"
											size="small"
											onClick={handleCancelTransaction}
											className={css.cancelButton}>
											Cancel
										</Button>
									)}
								</div>
							)}

							{isConfirmed && hash && (
								<div className={css.successMessage}>
									<p>
										<a
											href={`https://curtis.apescan.io/tx/${hash}`}
											target="_blank"
											rel="noopener noreferrer">
											View transaction on ApeScan
										</a>
									</p>
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
