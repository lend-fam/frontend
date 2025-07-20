import { type FC, useState, useRef, useEffect } from 'react';
import { typedMemo } from '../../utils/typed-memo.utils';

import css from './dropdown.module.css';

interface DropdownOption {
	value: string;
	label: string;
	description?: string;
	disabled?: boolean;
	tooltip?: string;
}

interface DropdownProps {
	options: DropdownOption[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

const DropdownComponent: FC<DropdownProps> = ({
	options,
	value,
	onChange,
	placeholder = 'Select an option',
	disabled = false,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((option) => option.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen);
		}
	};

	const handleSelect = (optionValue: string, optionDisabled?: boolean) => {
		if (!optionDisabled) {
			onChange(optionValue);
			setIsOpen(false);
		}
	};

	return (
		<div ref={dropdownRef} className={`${css.dropdown} ${className} ${disabled ? css.disabled : ''}`}>
			<button
				type="button"
				className={`${css.trigger} ${isOpen ? css.open : ''}`}
				onClick={handleToggle}
				disabled={disabled}>
				<div className={css.selected}>
					{selectedOption ? (
						<div className={css.selectedContent}>
							<div className={css.selectedLabel}>{selectedOption.label}</div>
							{selectedOption.description && (
								<div className={css.selectedDescription}>{selectedOption.description}</div>
							)}
						</div>
					) : (
						<div className={css.placeholder}>{placeholder}</div>
					)}
				</div>
				<div className={css.arrow}>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
						<path
							d="M3 4.5L6 7.5L9 4.5"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</button>

			{isOpen && (
				<div className={css.menu}>
					{options.map((option) => (
						<button
							key={option.value}
							type="button"
							className={`${css.option} ${option.value === value ? css.selected : ''} ${option.disabled ? css.optionDisabled : ''}`}
							onClick={() => handleSelect(option.value, option.disabled)}
							disabled={option.disabled}
							title={option.disabled ? option.tooltip : undefined}>
							<div className={css.optionContent}>
								<div className={css.optionLabel}>{option.label}</div>
								{option.description && (
									<div className={css.optionDescription}>{option.description}</div>
								)}
								{option.disabled && option.tooltip && (
									<div className={css.disabledTooltip}>{option.tooltip}</div>
								)}
							</div>
							{option.value === value && !option.disabled && (
								<div className={css.checkmark}>
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path
											d="M13.5 4.5L6 12L2.5 8.5"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export const Dropdown = typedMemo(DropdownComponent);
export type { DropdownOption };
