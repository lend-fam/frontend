import type { Address } from 'viem';

/**
 * CollectionService - Static utility methods for collection data transformation and business logic
 * Following the existing service pattern from other services in the codebase
 */
export class CollectionService {
	/**
	 * Transform numeric collection type to string representation
	 */
	static transformCollectionType(type: number): 'ERC721' | 'ERC1155' {
		return type === 0 ? 'ERC721' : 'ERC1155';
	}

	/**
	 * Transform numeric weight function type to string representation
	 */
	static transformWeightFunctionType(type: number): 'LINEAR' | 'EXPONENTIAL' {
		return type === 0 ? 'LINEAR' : 'EXPONENTIAL';
	}

	/**
	 * Get human-readable weight function information
	 */
	static getWeightFunctionInfo(type: 'LINEAR' | 'EXPONENTIAL') {
		switch (type) {
			case 'LINEAR':
				return {
					key: 'linear',
					label: 'Linear',
					description: 'Linear weight distribution based on NFT holdings',
				};
			case 'EXPONENTIAL':
				return {
					key: 'exponential',
					label: 'Exponential',
					description: 'Exponential weight distribution with diminishing returns',
				};
			default:
				return {
					key: 'unknown',
					label: 'Unknown',
					description: 'Unknown weight function type',
				};
		}
	}

	/**
	 * Calculate NFT multiplier based on balance and collection type
	 */
	static calculateNFTMultiplier(
		nftBalance: bigint,
		collectionType: 'ERC721' | 'ERC1155',
		weightFunctionType?: 'LINEAR' | 'EXPONENTIAL',
	): number | null {
		if (nftBalance === 0n) return null;

		const balance = Number(nftBalance);

		// Different calculation strategies based on collection type and weight function
		if (collectionType === 'ERC721') {
			// For ERC721, each NFT represents a unique asset
			if (weightFunctionType === 'EXPONENTIAL') {
				// Diminishing returns: 1x, 1.8x, 2.4x, 2.8x, etc.
				return Math.floor((1 + Math.log(balance + 1) * 0.5) * 10) / 10;
			} else {
				// Linear: each NFT adds 1x multiplier
				return Math.min(balance, 10); // Cap at 10x to prevent excessive multipliers
			}
		} else {
			// For ERC1155, balance represents quantity of fungible tokens
			if (weightFunctionType === 'EXPONENTIAL') {
				// Square root scaling for large balances
				return Math.floor(Math.sqrt(balance) * 10) / 10;
			} else {
				// Linear scaling with cap
				return Math.min(balance / 100, 5); // 1 multiplier per 100 tokens, max 5x
			}
		}
	}

	/**
	 * Determine user ownership status
	 */
	static getUserOwnershipStatus(hasNFTs: boolean): 'owned' | 'not_owned' | 'unknown' {
		return hasNFTs ? 'owned' : 'not_owned';
	}

	/**
	 * Format yield share percentage for display
	 */
	static formatYieldSharePercentage(basisPoints: number): string {
		const percentage = basisPoints / 100; // Convert from basis points to percentage
		return `${percentage}%`;
	}

	/**
	 * Format collection name with fallback
	 */
	static formatCollectionName(name?: string, collectionId?: string | bigint, address?: Address): string {
		if (name && name.trim()) {
			return name;
		}

		if (collectionId) {
			return `Collection ${collectionId.toString()}`;
		}

		if (address) {
			return `${address.slice(0, 6)}...${address.slice(-4)}`;
		}

		return 'Unknown Collection';
	}

	/**
	 * Determine collection status based on contract data
	 */
	static getCollectionStatus(isActive: boolean, isRemoved: boolean): 'Active' | 'Inactive' {
		return isActive && !isRemoved ? 'Active' : 'Inactive';
	}

	/**
	 * Format vault count display
	 */
	static formatVaultCount(count: number): string {
		return `${count} vault${count === 1 ? '' : 's'}`;
	}

	/**
	 * Calculate collection performance score (placeholder implementation)
	 */
	static calculatePerformanceScore(
		totalYieldGenerated: bigint,
		totalBorrowVolume: bigint,
		registeredAt: bigint,
	): number {
		// Simple performance score calculation
		// This would be more sophisticated in a real implementation
		const ageInDays = (Date.now() - Number(registeredAt) * 1000) / (1000 * 60 * 60 * 24);
		const yieldPerDay = Number(totalYieldGenerated) / Math.max(ageInDays, 1);
		const volumePerDay = Number(totalBorrowVolume) / Math.max(ageInDays, 1);

		// Score based on daily yield and volume (normalized to 0-100 scale)
		return Math.min((yieldPerDay + volumePerDay) / 1000000, 100); // Simplified scoring
	}

	/**
	 * Get collection risk level based on various factors
	 */
	static getCollectionRiskLevel(
		collectionType: 'ERC721' | 'ERC1155',
		yieldSharePercentage: number,
		totalSupply?: bigint,
	): 'Low' | 'Medium' | 'High' {
		// Risk assessment logic
		let riskScore = 0;

		// Higher yield share = higher risk
		if (yieldSharePercentage > 50) riskScore += 2;
		else if (yieldSharePercentage > 25) riskScore += 1;

		// ERC1155 might be riskier due to fungibility
		if (collectionType === 'ERC1155') riskScore += 1;

		// Very large or very small collections might be riskier
		if (totalSupply) {
			const supply = Number(totalSupply);
			if (supply < 100 || supply > 100000) riskScore += 1;
		}

		if (riskScore >= 3) return 'High';
		if (riskScore >= 2) return 'Medium';
		return 'Low';
	}

	/**
	 * Parse weight function parameters into human-readable format
	 * Based on protocol formulas:
	 * - Linear: weight = p1 + (p2 × nftBalance) / borrowBalance
	 * - Exponential: weight = (p1 × p2^nftBalance × borrowBalance) / EXP_SCALE^2
	 */
	static parseWeightFunctionParameters(
		fnType: 'LINEAR' | 'EXPONENTIAL',
		p1: bigint,
		p2: bigint,
	): { description: string; formula: string; displayFormula: string } {
		const p1Num = Number(p1);
		const p2Num = Number(p2);

		if (fnType === 'LINEAR') {
			return {
				description: `Linear weight function where NFT count and borrow balance affect subsidy weight`,
				formula: `weight = p1 + (p2 × nftBalance) / borrowBalance`,
				displayFormula: `weight = ${p1Num} + (${p2Num} × nftBalance) / borrowBalance`,
			};
		} else {
			return {
				description: `Exponential weight function with compound growth based on NFT holdings`,
				formula: `weight = (p1 × p2^nftBalance × borrowBalance) / EXP_SCALE^2`,
				displayFormula: `weight = (${p1Num} × ${p2Num}^nftBalance × borrowBalance) / EXP_SCALE^2`,
			};
		}
	}

	/**
	 * Calculate weight function example with specific NFT count
	 * Based on protocol formulas:
	 * - Linear: weight = p1 + (p2 × nftBalance) / borrowBalance
	 * - Exponential: weight = (p1 × p2^nftBalance × borrowBalance) / EXP_SCALE^2
	 */
	static calculateWeightFunctionExample(
		fnType: 'LINEAR' | 'EXPONENTIAL',
		p1: number,
		p2: number,
		nftCount: number,
		borrowBalance: number = 1000, // Example borrow balance for calculation
	): { input: string; result: number; multiplier: string } {
		const EXP_SCALE = 1e18; // Standard exponential scaling factor

		if (fnType === 'LINEAR') {
			// Linear: weight = p1 + (p2 × nftBalance) / borrowBalance
			const result = p1 + (p2 * nftCount) / borrowBalance;
			return {
				input: `NFTs = ${nftCount}, Borrow = ${borrowBalance}`,
				result,
				multiplier: `${p1} + (${p2} × ${nftCount}) / ${borrowBalance} = ${result.toFixed(4)}`,
			};
		} else {
			// Exponential: weight = (p1 × p2^nftBalance × borrowBalance) / EXP_SCALE^2
			// Note: This might result in very large numbers, so we use a simplified version for display
			const power = Math.pow(p2, nftCount);
			const numerator = p1 * power * borrowBalance;
			const result = numerator / (EXP_SCALE * EXP_SCALE);
			return {
				input: `NFTs = ${nftCount}, Borrow = ${borrowBalance}`,
				result,
				multiplier: `(${p1} × ${p2}^${nftCount} × ${borrowBalance}) / (10^18)^2 = ${result.toExponential(2)}`,
			};
		}
	}

	/**
	 * Validate collection address format
	 */
	static validateCollectionAddress(address: string): boolean {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	}

	/**
	 * Sort collections by various criteria
	 */
	static sortCollections<T extends { yieldSharePercentage: number; status: string; collectionName?: string }>(
		collections: T[],
		sortBy: 'name' | 'yieldShare' | 'status' | 'default' = 'default',
		direction: 'asc' | 'desc' = 'asc',
	): T[] {
		const sorted = [...collections].sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'name':
					comparison = (a.collectionName || '').localeCompare(b.collectionName || '');
					break;
				case 'yieldShare':
					comparison = a.yieldSharePercentage - b.yieldSharePercentage;
					break;
				case 'status':
					// Active collections first
					if (a.status === 'Active' && b.status !== 'Active') comparison = -1;
					else if (a.status !== 'Active' && b.status === 'Active') comparison = 1;
					else comparison = 0;
					break;
				case 'default':
					// Default: Active first, then by yield share descending
					if (a.status === 'Active' && b.status !== 'Active') comparison = -1;
					else if (a.status !== 'Active' && b.status === 'Active') comparison = 1;
					else comparison = b.yieldSharePercentage - a.yieldSharePercentage;
					break;
			}

			return direction === 'asc' ? comparison : -comparison;
		});

		return sorted;
	}

	/**
	 * Filter collections by various criteria
	 */
	static filterCollections<
		T extends {
			status: string;
			collectionType: string;
			userOwnership?: string;
			yieldSharePercentage: number;
		},
	>(
		collections: T[],
		filters: {
			status?: 'Active' | 'Inactive';
			collectionType?: 'ERC721' | 'ERC1155';
			userOwnership?: 'owned' | 'not_owned';
			minYieldShare?: number;
			maxYieldShare?: number;
		},
	): T[] {
		return collections.filter((collection) => {
			if (filters.status && collection.status !== filters.status) return false;
			if (filters.collectionType && collection.collectionType !== filters.collectionType) return false;
			if (filters.userOwnership && collection.userOwnership !== filters.userOwnership) return false;
			if (filters.minYieldShare && collection.yieldSharePercentage < filters.minYieldShare) return false;
			if (filters.maxYieldShare && collection.yieldSharePercentage > filters.maxYieldShare) return false;
			return true;
		});
	}
}
