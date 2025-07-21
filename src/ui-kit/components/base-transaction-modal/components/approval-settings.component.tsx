import { type FC } from 'react';
import { typedMemo } from '../../../utils/typed-memo.utils';
import { useTheme } from '../../../hooks/use-theme.hook';
import { Checkbox } from '../../checkbox/checkbox.component';

import css from './approval-settings.module.css';

interface ApprovalSettingsProps {
	useMaxApproval: boolean;
	onToggle: (checked: boolean) => void;
	amount: string;
	tokenSymbol: string;
	disabled?: boolean;
	theme?: Partial<typeof css>;
}

const ApprovalSettingsComponent: FC<ApprovalSettingsProps> = ({
	useMaxApproval,
	onToggle,
	amount,
	tokenSymbol,
	disabled = false,
	theme: themeOverride,
}) => {
	const theme = useTheme(css, themeOverride);

	return (
		<div className={theme.container}>
			<h3 className={theme.title}>Approval Settings</h3>
			<div className={theme.approvalContainer}>
				<div className={theme.approvalOption}>
					<label className={theme.approvalLabel}>
						<Checkbox
							type="checkbox"
							checked={useMaxApproval}
							onChange={(e) => onToggle(e.target.checked)}
							className={theme.approvalCheckbox}
							disabled={disabled}
						/>
						<span className={theme.approvalText}>
							Unlimited approval (gas efficient for future transactions)
						</span>
					</label>
					<div className={theme.approvalDescription}>
						{useMaxApproval
							? 'Approve unlimited amount for future transactions'
							: `Approve only ${amount || '0'} ${tokenSymbol} for this transaction`}
					</div>
				</div>
			</div>
		</div>
	);
};

export const ApprovalSettings = typedMemo(ApprovalSettingsComponent);
