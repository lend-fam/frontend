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
					description: 'Linear weight distribution based on NFT holdings'
				};
			case 'EXPONENTIAL':
				return {
					key: 'exponential',
					label: 'Exponential',
					description: 'Exponential weight distribution with diminishing returns'
				};
			default:
				return {
					key: 'unknown',
					label: 'Unknown',
					description: 'Unknown weight function type'
				};
		}
	}

	/**
	 * Calculate NFT multiplier based on balance and collection type
	 */
	static calculateNFTMultiplier(
		nftBalance: bigint, 
		collectionType: 'ERC721' | 'ERC1155',
		weightFunctionType?: 'LINEAR' | 'EXPONENTIAL'
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
		registeredAt: bigint
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
		totalSupply?: bigint
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
	 */
	static parseWeightFunctionParameters(
		fnType: 'LINEAR' | 'EXPONENTIAL',
		p1: bigint,
		p2: bigint
	): { description: string; formula: string } {
		const p1Num = Number(p1);
		const p2Num = Number(p2);
		
		if (fnType === 'LINEAR') {
			return {
				description: `Linear function with slope ${p1Num} and intercept ${p2Num}`,
				formula: `weight = ${p1Num} * nftCount + ${p2Num}`
			};
		} else {
			return {
				description: `Exponential function with base ${p1Num} and exponent factor ${p2Num}`,
				formula: `weight = ${p1Num} ^ (nftCount * ${p2Num})`
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
		direction: 'asc' | 'desc' = 'asc'
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
	static filterCollections<T extends { 
		status: string; 
		collectionType: string; 
		userOwnership?: string;
		yieldSharePercentage: number;
	}>(
		collections: T[],
		filters: {
			status?: 'Active' | 'Inactive';
			collectionType?: 'ERC721' | 'ERC1155';
			userOwnership?: 'owned' | 'not_owned';
			minYieldShare?: number;
			maxYieldShare?: number;
		}
	): T[] {
		return collections.filter(collection => {
			if (filters.status && collection.status !== filters.status) return false;
			if (filters.collectionType && collection.collectionType !== filters.collectionType) return false;
			if (filters.userOwnership && collection.userOwnership !== filters.userOwnership) return false;
			if (filters.minYieldShare && collection.yieldSharePercentage < filters.minYieldShare) return false;
			if (filters.maxYieldShare && collection.yieldSharePercentage > filters.maxYieldShare) return false;
			return true;
		});
	}
}