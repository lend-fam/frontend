import { memo } from 'react';

import css from './landing-navigation-panel.module.css';

export const LandingNavigationPanel = () => {
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	return (
		<nav className={css.container}>
			<ul className={css.list}>
				<LandingNavigationLink label="HOME" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
				<LandingNavigationLink label="ABOUT" onClick={() => scrollToSection('about')} />
				<LandingNavigationLink label="HOW" onClick={() => scrollToSection('how')} />
				<LandingNavigationLink label="WHEN" onClick={() => scrollToSection('when')} />
				<LandingNavigationLink label="WHO" onClick={() => scrollToSection('who')} />
			</ul>
		</nav>
	);
};

interface LandingNavigationLinkProps {
	label: string;
	onClick: () => void;
}

const LandingNavigationLink = memo<LandingNavigationLinkProps>(({ label, onClick }) => {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		onClick();
	};

	return (
		<li className={css.link}>
			<a href="#" onClick={handleClick}>
				{label}
			</a>
		</li>
	);
});

LandingNavigationLink.displayName = 'LandingNavigationLink';
