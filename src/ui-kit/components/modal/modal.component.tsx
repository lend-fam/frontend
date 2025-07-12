import { type FC, type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

import css from './modal.module.css';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div className={css.overlay} onClick={onClose}>
			<div className={css.modal} onClick={(e) => e.stopPropagation()}>
				<div className={css.header}>
					{title && <h2 className={css.title}>{title}</h2>}
					<button type="button" className={css.closeButton} onClick={onClose} aria-label="Close modal">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M18 6L6 18M6 6L18 18"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
				<div className={css.content}>{children}</div>
			</div>
		</div>,
		document.body,
	);
};
