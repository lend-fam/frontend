import { type FC, useEffect } from 'react';
import { typedMemo } from '../../ui-kit/utils/typed-memo.utils';

import css from './landing-page.module.css';
import logoTildaSvg from '../../assets/svg/logo-tilda.svg';
import logoLargeSvg from '../../assets/svg/logo-large.svg';
import sloganSvg from '../../assets/svg/slogan.svg';
import heroBackgroundSvg from '../../assets/svg/hero-background.svg';
import aboutIllustrationSvg from '../../assets/svg/about-illustration.svg';
import discordTildaSvg from '../../assets/svg/discord-tilda.svg';
import xTildaSvg from '../../assets/svg/x-tilda.svg';
import teamDickrektardImg from '../../assets/images/team-dickrektard.png';
import teamNnielApeImg from '../../assets/images/team-nniel_ape.png';
import teamThunderkidImg from '../../assets/images/team-0xThunderkid.png';
import howSvg from '../../assets/svg/how.svg';

export const LandingPage: FC = typedMemo(() => {
	useEffect(() => {
		// Handle hash-based navigation on page load
		const hash = window.location.hash.replace('#', '');
		if (hash) {
			const element = document.getElementById(hash);
			if (element) {
				setTimeout(() => {
					element.scrollIntoView({ behavior: 'smooth' });
				}, 100);
			}
		}
	}, []);

	return (
		<div className={css.container}>
			{/* Navigation Header */}
			<header className={css.navigation}>
				<div className={css.navContainer}>
					<div className={css.navContent}>
						<div className={css.logoSection}>
							<a href="/">
								<img src={logoTildaSvg} alt="Lend.family" className={css.navLogo} />
							</a>
						</div>
						<nav className={css.navMenu}>
							<a href="#home" className={css.navLink}>
								HOME
							</a>
							<a href="#about" className={css.navLink}>
								ABOUT
							</a>
							<a href="#how" className={css.navLink}>
								HOW
							</a>
							<a href="#when" className={css.navLink}>
								WHEN
							</a>
							<a href="#who" className={css.navLink}>
								WHO
							</a>
						</nav>
						<div className={css.socialIcons}>
							<a href="https://discord.gg/lendfam" target="_blank" rel="noopener noreferrer">
								<img src={discordTildaSvg} alt="Discord" className={css.socialIcon} />
							</a>
							<a href="https://x.com/lend_fam" target="_blank" rel="noopener noreferrer">
								<img src={xTildaSvg} alt="X (Twitter)" className={css.socialIcon} />
							</a>
						</div>
						<div className={css.toAppContainer}>
							<a href="/dashboard" className={css.toAppButton}>
								Open App
							</a>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section id="home" className={css.hero}>
				<div className={css.heroBackground}>
					<img src={heroBackgroundSvg} alt="Background illustration" className={css.heroBackgroundImage} />
					<div className={css.heroCard}>
						<div className={css.heroContent}>
							<img src={logoLargeSvg} alt="Lend.family" className={css.heroLogo} />
							<h1 className={css.heroTitle}>Together strong</h1>
							<p className={css.heroSubtitle}>Lend, borrow, and earn with your NFT fam</p>
							<div className={css.heroSlogan}>
								<img src={sloganSvg} alt="Together strong" className={css.sloganImage} />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* About Section */}
			<section id="about" className={css.about}>
				<div className={css.sectionContainer}>
					<h2 className={css.sectionTitle}>ABOUT THE PROJECT</h2>
					<div className={css.aboutContent}>
						<div className={css.aboutBox}>
							<p className={css.aboutText}>
								At its core,{' '}
								<a href="https://lend.family" className={css.aboutLink}>
									Lend.family
								</a>{' '}
								is a Compound V2 fork that provides secure and transparent lending and borrowing
								services to all Apechain users
							</p>
							<div className={css.aboutIllustration}>
								<img src={aboutIllustrationSvg} alt="About illustration" />
							</div>
						</div>
						<div className={css.aboutBox}>
							<p className={css.aboutText}>
								What&apos;s unique is partnerships with NFT collections — both local and from other
								chains — that offer bonuses and new opportunities to their founders and hol-ders, making
								DeFi more beneficial to JPEG lovers
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* How Section */}
			<section id="how" className={css.how}>
				<div className={css.sectionContainer}>
					<div className={css.howDiagram}>
						<img src={howSvg} alt="How Lend.family Works" className={css.howDiagramImage} />
					</div>
				</div>
			</section>

			{/* When Section */}
			<section id="when" className={css.when}>
				<div className={css.sectionContainer}>
					<h2 className={css.sectionTitle}>WHEN</h2>
					<div className={css.whenContent}>
						<div className={css.whenBox}>
							<div className={css.whenStageHeader}>
								<div className={css.whenStageOne}>Stage One</div>
								<div className={css.whenYearOne}>2025</div>
							</div>
							<div className={css.whenFeatures}>
								<div className={css.whenFeature}>
									<div className={css.whenFeatureIcon}>♦</div>
									<div className={css.whenFeatureText}>liquidity pools for lenders and borrowers</div>
								</div>
								<div className={css.whenFeature}>
									<div className={css.whenFeatureIcon}>♦</div>
									<div className={css.whenFeatureText}>
										NFT integration via cross-chain collections tracking
									</div>
								</div>
								<div className={css.whenFeature}>
									<div className={css.whenFeatureIcon}>♦</div>
									<div className={css.whenFeatureText}>flexible conditions tailored for partners</div>
								</div>
							</div>
						</div>
						<div className={css.whenBox}>
							<div className={css.whenStageHeader}>
								<div className={css.whenStageTwo}>Stage Two</div>
								<div className={css.whenYearTwo}>2026</div>
							</div>
							<div className={css.whenFeatures}>
								<div className={css.whenFeature}>
									<div className={css.whenFeatureIcon}>♦</div>
									<div className={css.whenFeatureText}>
										leveraged purchase functionality, allowing users to borrow tokens from the
										protocol to acquire NFTs of partner collections
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Who Section */}
			<section id="who" className={css.who}>
				<div className={css.sectionContainer}>
					<h2 className={css.sectionTitle}>WHO</h2>
					<div className={css.whoContent}>
						<div className={css.teamMemberBox}>
							<div className={css.memberImageContainer}>
								<img src={teamDickrektardImg} alt="@dickrektard" className={css.memberImage} />
							</div>
							<div className={css.memberHandle}>@dickrektard</div>
							<div className={css.memberTitle}>Communications lead</div>
						</div>
						<div className={css.teamMemberBox}>
							<div className={css.memberImageContainer}>
								<img src={teamNnielApeImg} alt="@nniel_ape" className={css.memberImage} />
							</div>
							<div className={css.memberHandle}>@nniel_ape</div>
							<div className={css.memberTitle}>Founder, Technical lead</div>
						</div>
						<div className={css.teamMemberBox}>
							<div className={css.memberImageContainer}>
								<img src={teamThunderkidImg} alt="@0xThunderkid" className={css.memberImage} />
							</div>
							<div className={css.memberHandle}>@0xThunderkid</div>
							<div className={css.memberTitle}>Design lead</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
});
