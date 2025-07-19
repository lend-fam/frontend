import { useState, useMemo } from 'react';
import { maxUint256 } from 'viem';

interface UseApprovalSettingsProps {
	currentAllowance?: bigint;
	amountInWei: bigint;
}

export function useApprovalSettings({ currentAllowance, amountInWei }: UseApprovalSettingsProps) {
	const [useMaxApproval, setUseMaxApproval] = useState(() => {
		const saved = localStorage.getItem('useMaxApproval');
		return saved !== null ? JSON.parse(saved) : true;
	});

	const needsApproval = useMemo(() => {
		if (!amountInWei || amountInWei === 0n) return false;
		const allowance = currentAllowance ?? 0n;
		return allowance < amountInWei;
	}, [currentAllowance, amountInWei]);

	const approvalAmount = useMemo(() => {
		return useMaxApproval ? maxUint256 : amountInWei;
	}, [useMaxApproval, amountInWei]);

	const updateApprovalPreference = (checked: boolean) => {
		setUseMaxApproval(checked);
		localStorage.setItem('useMaxApproval', JSON.stringify(checked));
	};

	return {
		useMaxApproval,
		needsApproval,
		approvalAmount,
		updateApprovalPreference,
	};
}
